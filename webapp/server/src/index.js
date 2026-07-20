import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { config, site } from './config.js';
import { User } from './models/User.js';
import authRoutes from './routes/auth.js';
import propertyRoutes from './routes/properties.js';
import submissionRoutes from './routes/submissions.js';
import { inquiries, wishlist, meta } from './routes/misc.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(__dirname, '..', 'public');

async function ensureAdmin() {
  const email = config.adminEmail;
  let admin = await User.findOne({ email });
  if (!admin) {
    const passwordHash = await bcrypt.hash(config.adminPassword, 10);
    admin = await User.create({
      name: config.adminName,
      email,
      phone: config.adminPhone,
      passwordHash,
      role: 'admin',
    });
    console.log(`Admin created: ${email}`);
  } else if (admin.role !== 'admin') {
    admin.role = 'admin';
    await admin.save();
  }
}

async function main() {
  if (!config.mongoUri) {
    console.error('MONGODB_URI missing — copy .env.example to .env and set Atlas connection string');
    process.exit(1);
  }

  await mongoose.connect(config.mongoUri);
  console.log('MongoDB Atlas connected');
  await ensureAdmin();

  const app = express();
  app.use(
    cors({
      origin: true,
      credentials: true,
    })
  );
  app.use(express.json({ limit: '8mb' }));

  app.get('/api/health', (_req, res) => {
    res.json({
      ok: true,
      site: site.siteName,
      db: mongoose.connection.readyState === 1,
    });
  });

  app.use('/api/auth', authRoutes);
  app.use('/api/properties', propertyRoutes);
  app.use('/api/submissions', submissionRoutes);
  app.use('/api/inquiries', inquiries);
  app.use('/api/wishlist', wishlist);
  app.use('/api/meta', meta);

  app.use(express.static(publicDir));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(publicDir, 'index.html'), (err) => {
      if (err) next();
    });
  });

  app.use((err, _req, res, _next) => {
    console.error(err);
    res.status(500).json({ error: 'سرور خرابی' });
  });

  app.listen(config.port, () => {
    console.log(`ASK live on http://localhost:${config.port}`);
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
