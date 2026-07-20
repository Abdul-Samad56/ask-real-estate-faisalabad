/**
 * ASK REAL ESTATE — Dynamic server (MongoDB Atlas)
 * Same API as node-local-server.js so the existing frontend works,
 * but data lives in Atlas instead of SQLite/localStorage demos.
 */
const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);

require('dotenv').config();
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const ROOT = __dirname;
const DATA_DIR = path.join(ROOT, 'data');
const PORT = Number(process.env.PORT || process.env.ASK_LOCAL_PORT || 8000);
const MONGODB_URI = process.env.MONGODB_URI || '';
const JWT_SECRET = process.env.JWT_SECRET || 'ask-dev-secret-change-me';
const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || 'abdulsamadkhattak5@gmail.com').toLowerCase();
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'AskAdmin@2026';
const ADMIN_NAME = process.env.ADMIN_NAME || 'حافظ عبدالصمد خٹک';
const ADMIN_PHONE = process.env.ADMIN_PHONE || '03215315603';
const ADMIN_EMAILS = new Set([ADMIN_EMAIL, 'abdulsamadkhattak5@gmail.com']);

const SHEET_HEADERS = {
  OwnerSubmissions: [
    'Timestamp', 'ID', 'Purpose', 'Type', 'Title', 'Price (PKR)', 'Area', 'City', 'Size',
    'Beds', 'Baths', 'Floors', 'Address', 'Description', 'Owner Name', 'Owner Phone',
    'Owner Email', 'Photo Count', 'Status',
  ],
  Inquiries: ['Timestamp', 'Name', 'Phone', 'Inquiry Type', 'Role', 'Property Type', 'Message'],
  Properties: [
    'Timestamp', 'ID', 'Title', 'Purpose', 'Type', 'Price (PKR)', 'City', 'Area', 'Size',
    'Beds', 'Baths', 'Owner', 'Phone', 'Published', 'Featured', 'Description', 'Photo Count',
  ],
  Clients: [
    'Timestamp', 'ID', 'Name', 'Phone', 'Purpose', 'Type', 'Budget Min', 'Budget Max',
    'City', 'Areas', 'Status', 'Notes',
  ],
};

const userSchema = new mongoose.Schema(
  {
    full_name: { type: String, default: '' },
    phone: { type: String, default: '' },
    email: { type: String, required: true, unique: true, lowercase: true },
    password_hash: { type: String, required: true },
    avatar_url: { type: String, default: '' },
    provider: { type: String, default: 'local' },
    role: { type: String, enum: ['user', 'admin', 'dealer'], default: 'user' },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
);

const propertySchema = new mongoose.Schema(
  {
    legacy_id: { type: String, index: true, sparse: true },
    title: { type: String, required: true },
    purpose: { type: String, enum: ['sale', 'rent'], required: true },
    type: { type: String, default: 'house' },
    price: { type: Number, default: 0 },
    city: { type: String, default: 'فیصل آباد' },
    area: { type: String, default: '' },
    size: { type: String, default: '' },
    beds: { type: Number, default: 0 },
    baths: { type: Number, default: 0 },
    floors: { type: Number, default: 0 },
    address: { type: String, default: '' },
    description: { type: String, default: '' },
    owner: { type: String, default: '' },
    phone: { type: String, default: '' },
    images: [{ type: String }],
    published: { type: Boolean, default: true },
    featured: { type: Boolean, default: false },
    created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
);

const submissionSchema = new mongoose.Schema(
  {
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    purpose: { type: String, required: true },
    type: { type: String, default: 'house' },
    area: { type: String, default: '' },
    city: { type: String, default: 'فیصل آباد' },
    price: { type: Number, default: 0 },
    size: { type: String, default: '' },
    beds: { type: Number, default: 0 },
    baths: { type: Number, default: 0 },
    floors: { type: Number, default: 0 },
    title: { type: String, default: '' },
    address: { type: String, default: '' },
    description: { type: String, default: '' },
    owner_name: { type: String, default: '' },
    owner_phone: { type: String, default: '' },
    owner_email: { type: String, default: '' },
    image_urls: [{ type: String }],
    status: {
      type: String,
      enum: ['pending', 'reviewed', 'converted', 'rejected'],
      default: 'pending',
    },
    converted_property_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Property', default: null },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
);

const inquirySchema = new mongoose.Schema(
  {
    name: String,
    phone: String,
    inquiry_type: String,
    role: String,
    property_type: String,
    message: String,
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
);

const User = mongoose.model('User', userSchema);
const Property = mongoose.model('Property', propertySchema);
const OwnerSubmission = mongoose.model('OwnerSubmission', submissionSchema);
const Inquiry = mongoose.model('Inquiry', inquirySchema);

function nowIso() {
  return new Date().toISOString();
}

function publicProfile(u) {
  if (!u) return null;
  return {
    id: String(u._id),
    full_name: u.full_name || '',
    phone: u.phone || '',
    email: u.email,
    avatar_url: u.avatar_url || '',
    provider: u.provider || 'local',
    role: u.role,
    created_at: u.created_at,
    updated_at: u.updated_at,
  };
}

function publicSubmission(s, profile) {
  const uid = s.user_id && s.user_id._id ? s.user_id._id : s.user_id;
  return {
    id: String(s._id),
    user_id: String(uid || ''),
    purpose: s.purpose,
    type: s.type,
    area: s.area,
    city: s.city,
    price: s.price,
    size: s.size,
    beds: s.beds,
    baths: s.baths,
    floors: s.floors,
    title: s.title,
    address: s.address,
    description: s.description,
    owner_name: s.owner_name,
    owner_phone: s.owner_phone,
    owner_email: s.owner_email,
    image_urls: s.image_urls || [],
    status: s.status,
    created_at: s.created_at,
    profile: profile || null,
  };
}

function publicProperty(p) {
  const images = p.images || [];
  return {
    id: p.legacy_id || String(p._id),
    mongoId: String(p._id),
    title: p.title,
    purpose: p.purpose,
    type: p.type,
    price: p.price,
    city: p.city || 'فیصل آباد',
    area: p.area,
    size: p.size,
    beds: p.beds || 0,
    baths: p.baths || 0,
    floors: p.floors || 0,
    description: p.description,
    owner: p.owner || '',
    phone: p.phone || '',
    contactName: p.owner || '',
    images,
    image: images[0] || null,
    featured: !!p.featured,
    published: p.published !== false,
    localDb: true,
    createdAt: p.created_at,
  };
}

function signToken(user) {
  return jwt.sign({ sub: String(user._id), role: user.role, email: user.email }, JWT_SECRET, {
    expiresIn: '30d',
  });
}

function bearerToken(req) {
  const h = req.headers.authorization || '';
  return h.startsWith('Bearer ') ? h.slice(7) : '';
}

async function currentUser(req) {
  const token = bearerToken(req);
  if (!token) return null;
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    return User.findById(payload.sub);
  } catch {
    return null;
  }
}

function sheetCsvPath(sheetName) {
  const safe = String(sheetName || '').replace(/[^\w-]/g, '');
  if (!SHEET_HEADERS[safe]) return null;
  return path.join(DATA_DIR, `${safe}.csv`);
}

function csvCell(value) {
  const s = String(value ?? '');
  return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function csvLine(row) {
  return row.map(csvCell).join(',');
}

function writeCsvFile(filePath, headers, rows) {
  const bom = '\uFEFF';
  const lines = [csvLine(headers), ...rows.map((row) => csvLine(row))];
  fs.writeFileSync(filePath, bom + lines.join('\r\n'), 'utf8');
}

function appendCsvRow(filePath, headers, row) {
  if (!fs.existsSync(filePath)) {
    writeCsvFile(filePath, headers, [row]);
    return;
  }
  fs.appendFileSync(filePath, `\r\n${csvLine(row)}`, 'utf8');
}

function openDataFolder() {
  if (process.platform === 'win32') {
    require('child_process').execFile('explorer.exe', [DATA_DIR]);
  }
  return { ok: true, path: DATA_DIR };
}

async function ensureAdmin() {
  let admin = await User.findOne({ email: ADMIN_EMAIL });
  if (!admin) {
    admin = await User.create({
      full_name: ADMIN_NAME,
      phone: ADMIN_PHONE,
      email: ADMIN_EMAIL,
      password_hash: await bcrypt.hash(ADMIN_PASSWORD, 10),
      role: 'admin',
    });
    console.log('Admin created:', ADMIN_EMAIL);
  } else if (admin.role !== 'admin') {
    admin.role = 'admin';
    await admin.save();
  }
}

async function syncSubmissionsExcel() {
  const rows = await OwnerSubmission.find().sort({ created_at: 1 });
  writeCsvFile(
    sheetCsvPath('OwnerSubmissions'),
    SHEET_HEADERS.OwnerSubmissions,
    rows.map((row) => [
      row.created_at ? new Date(row.created_at).toISOString() : nowIso(),
      String(row._id),
      row.purpose || '',
      row.type || '',
      row.title || '',
      row.price ?? '',
      row.area || '',
      row.city || '',
      row.size || '',
      row.beds ?? '',
      row.baths ?? '',
      row.floors ?? '',
      row.address || '',
      row.description || '',
      row.owner_name || '',
      row.owner_phone || '',
      row.owner_email || '',
      (row.image_urls || []).length,
      row.status || 'pending',
    ])
  );
}

async function main() {
  if (!MONGODB_URI) {
    console.error('MONGODB_URI missing.');
    console.error('1) Copy .env.example to .env');
    console.error('2) Paste your MongoDB Atlas connection string');
    console.error('3) Run: npm run seed   then   npm start');
    process.exit(1);
  }

  fs.mkdirSync(DATA_DIR, { recursive: true });
  for (const [name, headers] of Object.entries(SHEET_HEADERS)) {
    const fp = sheetCsvPath(name);
    if (!fs.existsSync(fp)) writeCsvFile(fp, headers, []);
  }

  await mongoose.connect(MONGODB_URI);
  console.log('MongoDB Atlas connected');
  await ensureAdmin();

  const app = express();
  app.use(express.json({ limit: '12mb' }));
  app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
    if (req.method === 'OPTIONS') return res.status(204).end();
    next();
  });

  app.get('/api/health', (_req, res) => {
    res.json({
      ok: true,
      dynamic: true,
      database: 'mongodb-atlas',
      connected: mongoose.connection.readyState === 1,
    });
  });

  app.get('/api/public/listings', async (_req, res) => {
    const props = await Property.find({ published: true }).sort({ featured: -1, created_at: -1 });
    res.json(props.map(publicProperty));
  });

  app.post('/api/auth/register', async (req, res) => {
    try {
      const email = String(req.body.email || '').trim().toLowerCase();
      const password = String(req.body.password || '');
      if (!email || password.length < 6) {
        return res.status(400).json({ ok: false, error: 'درست ای میل اور کم از کم 6 حروف کا پاس ورڈ درکار' });
      }
      const exists = await User.findOne({ email });
      if (exists) {
        return res.status(409).json({ ok: false, error: 'یہ ای میل پہلے سے رجسٹر ہے — لاگ ان کریں' });
      }
      const user = await User.create({
        full_name: req.body.fullName || req.body.full_name || '',
        phone: req.body.phone || '',
        email,
        password_hash: await bcrypt.hash(password, 10),
        role: ADMIN_EMAILS.has(email) ? 'admin' : 'user',
      });
      res.status(201).json({ ok: true, token: signToken(user), user: publicProfile(user) });
    } catch (err) {
      res.status(500).json({ ok: false, error: err.message });
    }
  });

  app.post('/api/auth/login', async (req, res) => {
    const email = String(req.body.email || '').trim().toLowerCase();
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(String(req.body.password || ''), user.password_hash))) {
      return res.status(401).json({ ok: false, error: 'غلط ای میل یا پاس ورڈ' });
    }
    res.json({ ok: true, token: signToken(user), user: publicProfile(user) });
  });

  app.post('/api/auth/logout', (_req, res) => res.json({ ok: true }));

  app.get('/api/auth/me', async (req, res) => {
    const user = await currentUser(req);
    if (!user) return res.status(401).json({ ok: false, error: 'پہلے لاگ ان کریں' });
    res.json({ ok: true, user: publicProfile(user) });
  });

  app.get('/api/submissions', async (req, res) => {
    const user = await currentUser(req);
    if (!user) return res.status(401).json({ ok: false, error: 'پہلے لاگ ان کریں' });
    const rows = await OwnerSubmission.find({ user_id: user._id }).sort({ created_at: -1 });
    res.json(rows.map((r) => publicSubmission(r)));
  });

  app.post('/api/submissions', async (req, res) => {
    const user = await currentUser(req);
    if (!user) return res.status(401).json({ ok: false, error: 'پہلے لاگ ان کریں' });
    const body = req.body || {};
    const doc = await OwnerSubmission.create({
      user_id: user._id,
      purpose: body.purpose || 'sale',
      type: body.type || 'house',
      area: body.area || '',
      city: body.city || 'فیصل آباد',
      price: Number(body.price || 0),
      size: body.size || '',
      beds: Number(body.beds || 0),
      baths: Number(body.baths || 0),
      floors: Number(body.floors || 0),
      title: body.title || '',
      address: body.address || '',
      description: body.description || '',
      owner_name: body.ownerName || body.owner_name || user.full_name || '',
      owner_phone: body.ownerPhone || body.owner_phone || user.phone || '',
      owner_email: body.ownerEmail || body.owner_email || user.email || '',
      image_urls: body.images || body.image_urls || [],
      status: 'pending',
    });
    await syncSubmissionsExcel();
    res.status(201).json(publicSubmission(doc));
  });

  app.delete('/api/submissions/:id', async (req, res) => {
    const user = await currentUser(req);
    if (!user) return res.status(401).json({ ok: false, error: 'پہلے لاگ ان کریں' });
    await OwnerSubmission.deleteOne({ _id: req.params.id, user_id: user._id });
    await syncSubmissionsExcel();
    res.json({ ok: true });
  });

  app.get('/api/admin/submissions', async (req, res) => {
    const user = await currentUser(req);
    if (!user || !['admin', 'dealer'].includes(user.role)) {
      return res.status(403).json({ ok: false, error: 'ایڈمن رسائی درکار' });
    }
    const rows = await OwnerSubmission.find().sort({ created_at: -1 }).populate('user_id');
    res.json(
      rows.map((row) =>
        publicSubmission(row, row.user_id ? publicProfile(row.user_id) : null)
      )
    );
  });

  app.patch('/api/admin/submissions/:id', async (req, res) => {
    const user = await currentUser(req);
    if (!user || !['admin', 'dealer'].includes(user.role)) {
      return res.status(403).json({ ok: false, error: 'ایڈمن رسائی درکار' });
    }
    const status = req.body.status;
    if (!['pending', 'reviewed', 'converted', 'rejected'].includes(status)) {
      return res.status(400).json({ ok: false, error: 'status درست نہیں' });
    }
    const doc = await OwnerSubmission.findById(req.params.id);
    if (!doc) return res.status(404).json({ ok: false, error: 'سبمشن نہیں ملی' });
    doc.status = status;

    if (status === 'converted' && !doc.converted_property_id) {
      const prop = await Property.create({
        title: doc.title || doc.area || 'پراپرٹی',
        purpose: doc.purpose === 'rent' ? 'rent' : 'sale',
        type: doc.type || 'house',
        price: doc.price,
        city: doc.city,
        area: doc.area,
        size: doc.size,
        beds: doc.beds,
        baths: doc.baths,
        floors: doc.floors,
        address: doc.address,
        description: doc.description,
        owner: doc.owner_name,
        phone: doc.owner_phone,
        images: doc.image_urls || [],
        published: true,
        featured: false,
        created_by: user._id,
      });
      doc.converted_property_id = prop._id;
    }

    await doc.save();
    await syncSubmissionsExcel();
    res.json(publicSubmission(doc));
  });

  app.delete('/api/admin/submissions/:id', async (req, res) => {
    const user = await currentUser(req);
    if (!user || !['admin', 'dealer'].includes(user.role)) {
      return res.status(403).json({ ok: false, error: 'ایڈمن رسائی درکار' });
    }
    await OwnerSubmission.deleteOne({ _id: req.params.id });
    await syncSubmissionsExcel();
    res.json({ ok: true });
  });

  app.post('/api/sheet/save', (req, res) => {
    const sheet = String(req.body.sheet || '');
    const row = req.body.row;
    const filePath = sheetCsvPath(sheet);
    if (!filePath || !Array.isArray(row)) {
      return res.status(400).json({ ok: false, error: 'sheet یا row درست نہیں' });
    }
    appendCsvRow(filePath, SHEET_HEADERS[sheet], row);
    res.json({ ok: true, file: filePath });
  });

  app.post('/api/sheet/rebuild', (req, res) => {
    const sheet = String(req.body.sheet || '');
    const headers = req.body.headers || SHEET_HEADERS[sheet];
    const rows = req.body.rows || [];
    const filePath = sheetCsvPath(sheet);
    if (!filePath || !Array.isArray(headers) || !Array.isArray(rows)) {
      return res.status(400).json({ ok: false, error: 'sheet درست نہیں' });
    }
    writeCsvFile(filePath, headers, rows);
    res.json({ ok: true, file: filePath, rows: rows.length });
  });

  app.post('/api/sheet/open-folder', (_req, res) => res.json(openDataFolder()));

  app.get('/api/sheet/files', (_req, res) => {
    res.json({
      ok: true,
      folder: DATA_DIR,
      files: Object.keys(SHEET_HEADERS).map((name) => ({
        sheet: name,
        file: `${name}.csv`,
        exists: fs.existsSync(sheetCsvPath(name)),
      })),
    });
  });

  app.use(express.static(ROOT));
  app.get('*', (req, res) => {
    if (req.path.startsWith('/api')) return res.status(404).json({ ok: false, error: 'API route نہیں ملا' });
    const index = path.join(ROOT, 'index.html');
    res.sendFile(index);
  });

  app.listen(PORT, () => {
    console.log(`ASK REAL ESTATE DYNAMIC: http://localhost:${PORT}/`);
    console.log('Database: MongoDB Atlas');
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
