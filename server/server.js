import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import passport from 'passport';
import passportSteam from 'passport-steam';
import dotenv from 'dotenv';

import { getDb } from './db/index.js';
import { seedSkins } from './db/seed.js';
import { attachUser } from './middleware/auth.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { signToken, cookieOptions, SESSION_COOKIE } from './auth/jwt.js';

import authRoutes from './routes/auth.js';
import skinsRoutes from './routes/skins.js';
import cartRoutes from './routes/cart.js';
import inventoryRoutes from './routes/inventory.js';
import walletRoutes from './routes/wallet.js';
import historyRoutes from './routes/history.js';

dotenv.config();

const SteamStrategy = passportSteam.Strategy;
const PORT = process.env.PORT || 5000;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:3000';

const app = express();

// Behind a proxy in production? Trust the first hop so secure cookies work.
app.set('trust proxy', 1);

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy: false, // SPA is served by Vite in dev; CSP is the SPA's responsibility
  })
);

app.use(express.json({ limit: '128kb' }));
app.use(cookieParser());

app.use(
  cors({
    origin: CLIENT_ORIGIN,
    credentials: true,
  })
);

// express-session is still needed for the passport-steam handshake only.
app.use(
  session({
    name: 'valkyrie_steam_sess',
    secret: process.env.SESSION_SECRET || 'valkyrie-steam-dev-secret-change-me',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 10 * 60 * 1000, // only needs to live for the OAuth round-trip
    },
  })
);
app.use(passport.initialize());
app.use(passport.session());

// Steam strategy (unchanged)
passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));
passport.use(
  new SteamStrategy(
    {
      returnURL: `http://localhost:${PORT}/auth/steam/return`,
      realm: `http://localhost:${PORT}/`,
      apiKey: process.env.STEAM_API_KEY || 'YOUR_STEAM_API_KEY',
    },
    (identifier, profile, done) => {
      process.nextTick(() => {
        profile.identifier = identifier;
        return done(null, profile);
      });
    }
  )
);

// Attach req.user from JWT cookie for every request
app.use(attachUser);

app.get('/health', (req, res) => res.json({ ok: true }));

app.use('/api/auth', authRoutes);
app.use('/api/skins', skinsRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/history', historyRoutes);

// Steam OAuth flow — issues our JWT once Steam verifies the user.
app.get('/auth/steam', passport.authenticate('steam'));

app.get(
  '/auth/steam/return',
  passport.authenticate('steam', { failureRedirect: `${CLIENT_ORIGIN}/?error=steam_failed` }),
  async (req, res, next) => {
    try {
      const profile = req.user;
      const db = await getDb();
      const providerId = profile.identifier || profile.id;
      const placeholderEmail = `${profile.id}@steam.local`;
      const picture =
        profile.photos?.[2]?.value || profile.photos?.[1]?.value || profile.photos?.[0]?.value || null;

      let row = await db.get(
        'SELECT * FROM users WHERE provider = ? AND provider_id = ?',
        'steam',
        providerId
      );
      if (!row) {
        const result = await db.run(
          `INSERT INTO users (email, name, picture, balance, provider, provider_id)
           VALUES (?, ?, ?, ?, ?, ?)`,
          placeholderEmail,
          profile.displayName || 'Steam User',
          picture,
          150.0,
          'steam',
          providerId
        );
        row = await db.get('SELECT * FROM users WHERE id = ?', result.lastID);
      } else {
        // Refresh display name / picture
        await db.run('UPDATE users SET name = ?, picture = COALESCE(?, picture) WHERE id = ?',
          profile.displayName || row.name,
          picture,
          row.id
        );
        row = await db.get('SELECT * FROM users WHERE id = ?', row.id);
      }

      const token = signToken({ uid: row.id });
      res.cookie(SESSION_COOKIE, token, cookieOptions());

      // Clear the steam session — we don't need it anymore
      req.logout(() => {
        res.redirect(`${CLIENT_ORIGIN}/profile`);
      });
    } catch (err) {
      next(err);
    }
  }
);

app.use(notFoundHandler);
app.use(errorHandler);

async function start() {
  await getDb();
  await seedSkins();
  app.listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`[server] listening on http://localhost:${PORT}`);
  });
}

start().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('[server] failed to start', err);
  process.exit(1);
});
