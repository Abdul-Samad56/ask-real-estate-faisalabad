import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { config } from '../config.js';
import { User } from '../models/User.js';
import { requireAuth, signToken } from '../middleware/auth.js';

const router = Router();

function resolveRole(email) {
  if (email.toLowerCase() === config.adminEmail) return 'admin';
  return 'user';
}

router.post('/register', async (req, res) => {
  try {
    const { name, email, phone, password } = req.body || {};
    if (!name?.trim() || !email?.trim() || !password || String(password).length < 6) {
      return res.status(400).json({ error: 'نام، ای میل اور کم از کم ۶ حرف کا پاس ورڈ درکار ہے' });
    }
    const normalized = email.trim().toLowerCase();
    const exists = await User.findOne({ email: normalized });
    if (exists) {
      return res.status(409).json({ error: 'یہ ای میل پہلے سے رجسٹرڈ ہے' });
    }
    const passwordHash = await bcrypt.hash(String(password), 10);
    const user = await User.create({
      name: name.trim(),
      email: normalized,
      phone: (phone || '').trim(),
      passwordHash,
      role: resolveRole(normalized),
    });
    const token = signToken(user);
    res.status(201).json({ token, user: user.toSafeJSON() });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'رجسٹریشن ناکام' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ error: 'ای میل اور پاس ورڈ درکار ہے' });
    }
    const user = await User.findOne({ email: String(email).trim().toLowerCase() });
    if (!user) {
      return res.status(401).json({ error: 'ای میل یا پاس ورڈ غلط ہے' });
    }
    const ok = await bcrypt.compare(String(password), user.passwordHash);
    if (!ok) {
      return res.status(401).json({ error: 'ای میل یا پاس ورڈ غلط ہے' });
    }
    const token = signToken(user);
    res.json({ token, user: user.toSafeJSON() });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'لاگ اِن ناکام' });
  }
});

router.get('/me', requireAuth, (req, res) => {
  res.json({ user: req.user.toSafeJSON() });
});

export default router;
