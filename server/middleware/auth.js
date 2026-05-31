import { verifyToken, SESSION_COOKIE } from '../auth/jwt.js';
import { getDb } from '../db/index.js';

/**
 * Attach req.user if a valid session cookie is present. Does not reject.
 */
export async function attachUser(req, res, next) {
  try {
    const token = req.cookies?.[SESSION_COOKIE];
    if (!token) return next();
    const payload = verifyToken(token);
    if (!payload?.uid) return next();

    const db = await getDb();
    const user = await db.get(
      'SELECT id, email, name, picture, balance, provider, steam_trade_url, created_at FROM users WHERE id = ?',
      payload.uid
    );
    if (user) req.user = user;
    next();
  } catch (err) {
    next(err);
  }
}

/**
 * Require an authenticated user. Returns 401 otherwise.
 */
export function requireAuth(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  next();
}
