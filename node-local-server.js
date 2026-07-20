#!/usr/bin/env node
/**
 * ASK REAL ESTATE local server for this PC.
 * Uses Node.js built-in SQLite and saves data in data/ask_real_estate.sqlite3.
 */
const crypto = require('node:crypto');
const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const { DatabaseSync } = require('node:sqlite');

const ROOT = __dirname;
const DATA_DIR = path.join(ROOT, 'data');
const DB_PATH = path.join(DATA_DIR, 'ask_real_estate.sqlite3');
const HOST = '127.0.0.1';
const PORT = Number(process.env.ASK_LOCAL_PORT || 8000);
const ADMIN_EMAILS = new Set(['abdulsamadkhattak5@gmail.com']);
const SESSION_SECONDS = 30 * 24 * 60 * 60;

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

function initExcelDatabase() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  for (const [name, headers] of Object.entries(SHEET_HEADERS)) {
    const filePath = sheetCsvPath(name);
    if (!fs.existsSync(filePath)) writeCsvFile(filePath, headers, []);
  }
}

function submissionExcelRow(row) {
  let images = [];
  try {
    images = JSON.parse(row.image_urls || '[]');
  } catch {
    images = [];
  }
  return [
    row.created_at || nowIso(),
    row.id || '',
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
    images.length,
    row.status || 'pending',
  ];
}

function syncSqliteToExcel() {
  const rows = db.prepare('select * from owner_submissions order by created_at asc').all();
  writeCsvFile(
    sheetCsvPath('OwnerSubmissions'),
    SHEET_HEADERS.OwnerSubmissions,
    rows.map(submissionExcelRow)
  );
}

function openDataFolder() {
  if (process.platform === 'win32') {
    const { execFile } = require('node:child_process');
    execFile('explorer.exe', [DATA_DIR]);
    return { ok: true, path: DATA_DIR };
  }
  return { ok: true, path: DATA_DIR, note: 'فولڈر: ' + DATA_DIR };
}

initExcelDatabase();
const db = new DatabaseSync(DB_PATH);
db.exec('pragma foreign_keys = on');
db.exec(`
create table if not exists profiles (
  id text primary key,
  full_name text,
  phone text,
  email text not null unique,
  password_hash text not null,
  password_salt text not null,
  avatar_url text default '',
  provider text default 'local',
  role text not null default 'user',
  created_at text not null,
  updated_at text not null
);

create table if not exists auth_sessions (
  token text primary key,
  user_id text not null references profiles(id) on delete cascade,
  expires_at integer not null,
  created_at text not null
);

create table if not exists owner_submissions (
  id text primary key,
  user_id text not null references profiles(id) on delete cascade,
  purpose text not null,
  type text not null,
  area text,
  city text default 'فیصل آباد',
  price real,
  size text,
  beds integer default 0,
  baths integer default 0,
  floors integer default 0,
  title text,
  address text,
  description text,
  owner_name text,
  owner_phone text,
  owner_email text,
  image_urls text default '[]',
  status text not null default 'pending',
  created_at text not null
);
`);

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml; charset=utf-8',
  '.ico': 'image/x-icon',
};

function nowIso() {
  return new Date().toISOString();
}

function sendJson(res, status, data) {
  const body = Buffer.from(JSON.stringify(data), 'utf8');
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': body.length,
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
  });
  res.end(body);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
      if (body.length > 20 * 1024 * 1024) req.destroy();
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (err) {
        reject(err);
      }
    });
    req.on('error', reject);
  });
}

function hashPassword(password, salt = crypto.randomBytes(16).toString('base64')) {
  const hash = crypto.pbkdf2Sync(password, salt, 120000, 32, 'sha256').toString('base64');
  return { hash, salt };
}

function verifyPassword(password, passwordHash, salt) {
  const { hash } = hashPassword(password, salt);
  return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(passwordHash));
}

function publicProfile(row) {
  if (!row) return null;
  return {
    id: row.id,
    full_name: row.full_name,
    phone: row.phone,
    email: row.email,
    avatar_url: row.avatar_url,
    provider: row.provider,
    role: row.role,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

function publicSubmission(row) {
  const data = { ...row };
  try {
    data.image_urls = JSON.parse(data.image_urls || '[]');
  } catch {
    data.image_urls = [];
  }
  return data;
}

function bearerToken(req) {
  const auth = req.headers.authorization || '';
  return auth.toLowerCase().startsWith('bearer ') ? auth.slice(7).trim() : '';
}

function currentUser(req) {
  const token = bearerToken(req);
  if (!token) return null;
  return db
    .prepare(
      `select p.* from auth_sessions s
       join profiles p on p.id = s.user_id
       where s.token = ? and s.expires_at > ?`
    )
    .get(token, Math.floor(Date.now() / 1000));
}

function createSession(userId) {
  const token = crypto.randomBytes(32).toString('base64url');
  db.prepare('insert into auth_sessions (token, user_id, expires_at, created_at) values (?, ?, ?, ?)').run(
    token,
    userId,
    Math.floor(Date.now() / 1000) + SESSION_SECONDS,
    nowIso()
  );
  return token;
}

function serveStatic(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const rawPath = decodeURIComponent(url.pathname === '/' ? '/index.html' : url.pathname);
  const filePath = path.normalize(path.join(ROOT, rawPath));
  if (!filePath.startsWith(ROOT)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end('Not found');
      return;
    }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(filePath).toLowerCase()] || 'application/octet-stream' });
    res.end(data);
  });
}

async function handleApi(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const route = decodeURIComponent(url.pathname);
  const user = () => {
    const row = currentUser(req);
    if (!row) sendJson(res, 401, { ok: false, error: 'پہلے لاگ ان کریں' });
    return row;
  };

  try {
    if (req.method === 'OPTIONS') {
      sendJson(res, 204, {});
      return;
    }
    if (req.method === 'GET' && route === '/api/health') {
      sendJson(res, 200, { ok: true, database: DB_PATH });
      return;
    }
    if (req.method === 'GET' && route === '/api/public/listings') {
      const rows = db
        .prepare(
          `select s.*, p.full_name, p.phone as profile_phone, p.email as profile_email
           from owner_submissions s left join profiles p on p.id = s.user_id
           where s.status != 'rejected'
           order by s.created_at desc`
        )
        .all();
      sendJson(
        res,
        200,
        rows.map((row) => ({
          id: row.id,
          title: row.title || row.area || 'پراپرٹی',
          purpose: row.purpose,
          type: row.type,
          price: row.price,
          city: row.city || 'فیصل آباد',
          area: row.area,
          size: row.size,
          beds: row.beds || 0,
          baths: row.baths || 0,
          floors: row.floors || 0,
          description: row.description,
          owner: row.owner_name || row.full_name || '',
          phone: row.owner_phone || row.profile_phone || '',
          contactName: row.owner_name || row.full_name || '',
          images: publicSubmission(row).image_urls,
          image: publicSubmission(row).image_urls[0] || null,
          featured: false,
          published: true,
          localDb: true,
          status: row.status,
          createdAt: row.created_at,
        }))
      );
      return;
    }
    if (req.method === 'POST' && route === '/api/auth/register') {
      const body = await readBody(req);
      const email = String(body.email || '').trim().toLowerCase();
      const password = String(body.password || '');
      if (!email || password.length < 6) {
        sendJson(res, 400, { ok: false, error: 'درست ای میل اور کم از کم 6 حروف کا پاس ورڈ درکار' });
        return;
      }
      const id = crypto.randomUUID();
      const role = ADMIN_EMAILS.has(email) ? 'admin' : 'user';
      const { hash, salt } = hashPassword(password);
      db.prepare(
        `insert into profiles
         (id, full_name, phone, email, password_hash, password_salt, role, created_at, updated_at)
         values (?, ?, ?, ?, ?, ?, ?, ?, ?)`
      ).run(id, body.fullName || body.full_name || '', body.phone || '', email, hash, salt, role, nowIso(), nowIso());
      const profile = db.prepare('select * from profiles where id = ?').get(id);
      sendJson(res, 201, { ok: true, token: createSession(id), user: publicProfile(profile) });
      return;
    }
    if (req.method === 'POST' && route === '/api/auth/login') {
      const body = await readBody(req);
      const email = String(body.email || '').trim().toLowerCase();
      const profile = db.prepare('select * from profiles where email = ?').get(email);
      if (!profile || !verifyPassword(String(body.password || ''), profile.password_hash, profile.password_salt)) {
        sendJson(res, 401, { ok: false, error: 'غلط ای میل یا پاس ورڈ' });
        return;
      }
      sendJson(res, 200, { ok: true, token: createSession(profile.id), user: publicProfile(profile) });
      return;
    }
    if (req.method === 'POST' && route === '/api/auth/logout') {
      const token = bearerToken(req);
      if (token) db.prepare('delete from auth_sessions where token = ?').run(token);
      sendJson(res, 200, { ok: true });
      return;
    }
    if (req.method === 'GET' && route === '/api/auth/me') {
      const profile = user();
      if (profile) sendJson(res, 200, { ok: true, user: publicProfile(profile) });
      return;
    }
    if (req.method === 'GET' && route === '/api/submissions') {
      const profile = user();
      if (!profile) return;
      const rows = db
        .prepare('select * from owner_submissions where user_id = ? order by created_at desc')
        .all(profile.id);
      sendJson(res, 200, rows.map(publicSubmission));
      return;
    }
    if (req.method === 'POST' && route === '/api/submissions') {
      const profile = user();
      if (!profile) return;
      const body = await readBody(req);
      const id = crypto.randomUUID();
      db.prepare(
        `insert into owner_submissions
         (id, user_id, purpose, type, area, city, price, size, beds, baths, floors,
          title, address, description, owner_name, owner_phone, owner_email, image_urls, status, created_at)
         values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?)`
      ).run(
        id,
        profile.id,
        body.purpose || '',
        body.type || '',
        body.area || '',
        body.city || 'فیصل آباد',
        Number(body.price || 0),
        body.size || '',
        Number(body.beds || 0),
        Number(body.baths || 0),
        Number(body.floors || 0),
        body.title || '',
        body.address || '',
        body.description || '',
        body.ownerName || body.owner_name || '',
        body.ownerPhone || body.owner_phone || '',
        body.ownerEmail || body.owner_email || '',
        JSON.stringify(body.images || body.image_urls || []),
        nowIso()
      );
      sendJson(res, 201, publicSubmission(db.prepare('select * from owner_submissions where id = ?').get(id)));
      syncSqliteToExcel();
      return;
    }
    if (req.method === 'DELETE' && route.startsWith('/api/submissions/')) {
      const profile = user();
      if (!profile) return;
      db.prepare('delete from owner_submissions where id = ? and user_id = ?').run(route.split('/').pop(), profile.id);
      syncSqliteToExcel();
      sendJson(res, 200, { ok: true });
      return;
    }
    if (req.method === 'GET' && route === '/api/admin/submissions') {
      const rows = db
        .prepare(
          `select s.*, p.full_name, p.phone as profile_phone, p.email as profile_email, p.avatar_url, p.provider,
                  p.role, p.created_at as profile_created_at, p.updated_at as profile_updated_at
           from owner_submissions s left join profiles p on p.id = s.user_id
           order by s.created_at desc`
        )
        .all();
      sendJson(
        res,
        200,
        rows.map((row) => ({
          ...publicSubmission(row),
          profile: row.profile_email
            ? {
                id: row.user_id,
                full_name: row.full_name,
                phone: row.profile_phone,
                email: row.profile_email,
                avatar_url: row.avatar_url,
                provider: row.provider,
                role: row.role,
                created_at: row.profile_created_at,
                updated_at: row.profile_updated_at,
              }
            : null,
        }))
      );
      return;
    }
    if (req.method === 'PATCH' && route.startsWith('/api/admin/submissions/')) {
      const body = await readBody(req);
      const status = body.status;
      if (!['pending', 'reviewed', 'converted', 'rejected'].includes(status)) {
        sendJson(res, 400, { ok: false, error: 'status درست نہیں' });
        return;
      }
      const id = route.split('/').pop();
      db.prepare('update owner_submissions set status = ? where id = ?').run(status, id);
      sendJson(res, 200, publicSubmission(db.prepare('select * from owner_submissions where id = ?').get(id)));
      syncSqliteToExcel();
      return;
    }
    if (req.method === 'DELETE' && route.startsWith('/api/admin/submissions/')) {
      db.prepare('delete from owner_submissions where id = ?').run(route.split('/').pop());
      syncSqliteToExcel();
      sendJson(res, 200, { ok: true });
      return;
    }
    if (req.method === 'POST' && route === '/api/sheet/save') {
      const body = await readBody(req);
      const sheet = String(body.sheet || '');
      const row = body.row;
      const filePath = sheetCsvPath(sheet);
      if (!filePath || !Array.isArray(row)) {
        sendJson(res, 400, { ok: false, error: 'sheet یا row درست نہیں' });
        return;
      }
      appendCsvRow(filePath, SHEET_HEADERS[sheet], row);
      sendJson(res, 200, { ok: true, file: filePath });
      return;
    }
    if (req.method === 'POST' && route === '/api/sheet/rebuild') {
      const body = await readBody(req);
      const sheet = String(body.sheet || '');
      const headers = body.headers || SHEET_HEADERS[sheet];
      const rows = body.rows || [];
      const filePath = sheetCsvPath(sheet);
      if (!filePath || !Array.isArray(headers) || !Array.isArray(rows)) {
        sendJson(res, 400, { ok: false, error: 'sheet درست نہیں' });
        return;
      }
      writeCsvFile(filePath, headers, rows);
      sendJson(res, 200, { ok: true, file: filePath, rows: rows.length });
      return;
    }
    if (req.method === 'POST' && route === '/api/sheet/open-folder') {
      sendJson(res, 200, openDataFolder());
      return;
    }
    if (req.method === 'GET' && route === '/api/sheet/files') {
      sendJson(res, 200, {
        ok: true,
        folder: DATA_DIR,
        files: Object.keys(SHEET_HEADERS).map((name) => ({
          sheet: name,
          file: `${name}.csv`,
          exists: fs.existsSync(sheetCsvPath(name)),
        })),
      });
      return;
    }
    sendJson(res, 404, { ok: false, error: 'API route نہیں ملا' });
  } catch (err) {
    const duplicate = String(err.message || '').includes('UNIQUE constraint failed: profiles.email');
    sendJson(res, duplicate ? 409 : 500, {
      ok: false,
      error: duplicate ? 'یہ ای میل پہلے سے رجسٹر ہے — لاگ ان کریں' : err.message,
    });
  }
}

const server = http.createServer((req, res) => {
  if (req.url.startsWith('/api/')) handleApi(req, res);
  else serveStatic(req, res);
});

server.listen(PORT, HOST, () => {
  console.log(`ASK REAL ESTATE local server: http://localhost:${PORT}/`);
  console.log(`Database: ${DB_PATH}`);
  console.log(`Excel database (MS Excel): ${DATA_DIR}`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.log(`Server already running at http://localhost:${PORT}/`);
    process.exit(0);
  }
  throw err;
});
