import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const ENV_SECRET = process.env.JWT_SECRET;
// Generate a stable per-process secret if none provided (dev only).
// In production the user MUST set JWT_SECRET.
const FALLBACK_SECRET = crypto.randomBytes(48).toString('hex');
const SECRET = ENV_SECRET || FALLBACK_SECRET;

if (!ENV_SECRET) {
  // eslint-disable-next-line no-console
  console.warn(
    '[auth] JWT_SECRET is not set in env. Using an ephemeral random secret — all sessions will be invalidated on restart.'
  );
}

const COOKIE_NAME = 'valkyrie_session';
const TOKEN_TTL = '7d';

export function signToken(payload) {
  return jwt.sign(payload, SECRET, { expiresIn: TOKEN_TTL });
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, SECRET);
  } catch {
    return null;
  }
}

export function cookieOptions() {
  return {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/',
  };
}

export const SESSION_COOKIE = COOKIE_NAME;
