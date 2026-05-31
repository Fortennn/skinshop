import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { body, validationResult } from 'express-validator';
import rateLimit from 'express-rate-limit';
import { getDb } from '../db/index.js';
import { signToken, cookieOptions, SESSION_COOKIE } from '../auth/jwt.js';
import { publicUser } from '../utils/serialize.js';

const router = Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // 30 attempts per IP per window
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many auth attempts. Try again later.' },
});

function validationErrors(req) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return { error: errors.array()[0].msg };
  }
  return null;
}

function setSession(res, userId) {
  const token = signToken({ uid: userId });
  res.cookie(SESSION_COOKIE, token, cookieOptions());
}

// POST /api/auth/register
router.post(
  '/register',
  authLimiter,
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 8, max: 128 }).withMessage('Password must be at least 8 characters'),
  body('name').isString().trim().isLength({ min: 2, max: 64 }).withMessage('Name must be 2-64 characters'),
  async (req, res, next) => {
    const ve = validationErrors(req);
    if (ve) return res.status(400).json(ve);
    try {
      const { email, password, name } = req.body;
      const db = await getDb();
      const existing = await db.get('SELECT id FROM users WHERE email = ?', email);
      if (existing) {
        return res.status(409).json({ error: 'An account with this email already exists' });
      }
      const hash = await bcrypt.hash(password, 12);
      const picture = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0b0f15&color=00f2fe`;
      const result = await db.run(
        `INSERT INTO users (email, name, password_hash, picture, balance, provider)
         VALUES (?, ?, ?, ?, ?, ?)`,
        email,
        name,
        hash,
        picture,
        150.0,
        'local'
      );
      setSession(res, result.lastID);
      const user = await db.get('SELECT * FROM users WHERE id = ?', result.lastID);
      res.status(201).json({ user: publicUser(user) });
    } catch (err) {
      next(err);
    }
  }
);

// POST /api/auth/login
router.post(
  '/login',
  authLimiter,
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').isString().isLength({ min: 1, max: 128 }).withMessage('Password is required'),
  async (req, res, next) => {
    const ve = validationErrors(req);
    if (ve) return res.status(400).json(ve);
    try {
      const { email, password } = req.body;
      const db = await getDb();
      const user = await db.get('SELECT * FROM users WHERE email = ?', email);
      // Constant-time-ish miss: still hash to avoid email enumeration timing leak
      const hash = user?.password_hash || '$2a$12$invalidplaceholderhashstringxxxxxxxxxxxxxxxxxxxxxxx';
      const ok = await bcrypt.compare(password, hash);
      if (!user || !user.password_hash || !ok) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }
      setSession(res, user.id);
      res.json({ user: publicUser(user) });
    } catch (err) {
      next(err);
    }
  }
);

// POST /api/auth/google
router.post(
  '/google',
  authLimiter,
  body('credential').isString().isLength({ min: 20, max: 4096 }).withMessage('Missing credential'),
  async (req, res, next) => {
    const ve = validationErrors(req);
    if (ve) return res.status(400).json(ve);
    try {
      const { credential } = req.body;
      // Verify the ID token server-side via Google's tokeninfo endpoint.
      const verifyUrl = `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(
        credential
      )}`;
      const r = await fetch(verifyUrl);
      if (!r.ok) {
        return res.status(401).json({ error: 'Invalid Google credential' });
      }
      const info = await r.json();
      // Basic validation
      if (!info.email || !info.sub || !info.iss?.includes('accounts.google.com')) {
        return res.status(401).json({ error: 'Invalid Google credential' });
      }
      // (If you configure CLIENT_ID server-side, also check info.aud === CLIENT_ID.)
      const expectedAud = process.env.GOOGLE_CLIENT_ID;
      if (expectedAud && info.aud !== expectedAud) {
        return res.status(401).json({ error: 'Credential audience mismatch' });
      }

      const db = await getDb();
      let user = await db.get(
        'SELECT * FROM users WHERE provider = ? AND provider_id = ?',
        'google',
        info.sub
      );
      if (!user) {
        // Also try matching by email so a local account can attach Google
        user = await db.get('SELECT * FROM users WHERE email = ?', info.email);
        if (user) {
          await db.run(
            'UPDATE users SET provider = COALESCE(provider, ?), provider_id = COALESCE(provider_id, ?), picture = COALESCE(picture, ?) WHERE id = ?',
            'google',
            info.sub,
            info.picture || null,
            user.id
          );
        } else {
          const result = await db.run(
            `INSERT INTO users (email, name, picture, balance, provider, provider_id)
             VALUES (?, ?, ?, ?, ?, ?)`,
            info.email,
            info.name || info.email.split('@')[0],
            info.picture || null,
            150.0,
            'google',
            info.sub
          );
          user = await db.get('SELECT * FROM users WHERE id = ?', result.lastID);
        }
      }
      setSession(res, user.id);
      res.json({ user: publicUser(user) });
    } catch (err) {
      next(err);
    }
  }
);

// GET /api/auth/me
router.get('/me', async (req, res) => {
  res.json({ user: publicUser(req.user) });
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  res.clearCookie(SESSION_COOKIE, { ...cookieOptions(), maxAge: 0 });
  res.json({ ok: true });
});

// PATCH /api/auth/me — update profile fields (trade URL, name)
router.patch(
  '/me',
  body('name').optional().isString().trim().isLength({ min: 2, max: 64 }),
  body('steamTradeUrl').optional().isString().isLength({ max: 512 }),
  async (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: 'Not authenticated' });
    const ve = validationErrors(req);
    if (ve) return res.status(400).json(ve);
    try {
      const updates = [];
      const params = [];
      if (typeof req.body.name === 'string') {
        updates.push('name = ?');
        params.push(req.body.name.trim());
      }
      if (typeof req.body.steamTradeUrl === 'string') {
        const url = req.body.steamTradeUrl.trim();
        if (url && !/^https?:\/\/(www\.)?steamcommunity\.com\//.test(url)) {
          return res.status(400).json({ error: 'Trade URL must point to steamcommunity.com' });
        }
        updates.push('steam_trade_url = ?');
        params.push(url || null);
      }
      if (!updates.length) return res.json({ user: publicUser(req.user) });
      params.push(req.user.id);
      const db = await getDb();
      await db.run(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`, ...params);
      const updated = await db.get('SELECT * FROM users WHERE id = ?', req.user.id);
      res.json({ user: publicUser(updated) });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
