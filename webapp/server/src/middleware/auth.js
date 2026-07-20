import jwt from 'jsonwebtoken';
import { config } from '../config.js';
import { User } from '../models/User.js';

export function signToken(user) {
  return jwt.sign(
    { sub: user._id.toString(), role: user.role, email: user.email },
    config.jwtSecret,
    { expiresIn: '30d' }
  );
}

export async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : '';
    if (!token) {
      return res.status(401).json({ error: 'لاگ اِن ضروری ہے' });
    }
    const payload = jwt.verify(token, config.jwtSecret);
    const user = await User.findById(payload.sub);
    if (!user) {
      return res.status(401).json({ error: 'یوزر نہیں ملا' });
    }
    req.user = user;
    next();
  } catch {
    return res.status(401).json({ error: 'سیشن ختم — دوبارہ لاگ اِن کریں' });
  }
}

export function requireAdmin(req, res, next) {
  if (!req.user || !['admin', 'dealer'].includes(req.user.role)) {
    return res.status(403).json({ error: 'ایڈمن رسائی درکار ہے' });
  }
  next();
}

export async function optionalAuth(req, _res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : '';
    if (token) {
      const payload = jwt.verify(token, config.jwtSecret);
      req.user = await User.findById(payload.sub);
    }
  } catch {
    req.user = null;
  }
  next();
}
