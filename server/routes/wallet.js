import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import rateLimit from 'express-rate-limit';
import { getDb, withTransaction } from '../db/index.js';
import { requireAuth } from '../middleware/auth.js';
import { publicUser } from '../utils/serialize.js';

const router = Router();
router.use(requireAuth);

const topUpLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Top-ups are rate-limited. Slow down.' },
});

// POST /api/wallet/topup  body: { amount }
router.post(
  '/topup',
  topUpLimiter,
  body('amount').isFloat({ min: 1, max: 10000 }).withMessage('Amount must be between 1 and 10000'),
  async (req, res, next) => {
    const errs = validationResult(req);
    if (!errs.isEmpty()) return res.status(400).json({ error: errs.array()[0].msg });
    try {
      const amount = Number(req.body.amount);
      const result = await withTransaction(async (db) => {
        await db.run('UPDATE users SET balance = balance + ? WHERE id = ?', amount, req.user.id);
        await db.run(
          "INSERT INTO history (user_id, type, item_name, amount) VALUES (?, 'Top Up', 'Demo Balance Credit', ?)",
          req.user.id,
          amount
        );
        const updated = await db.get('SELECT * FROM users WHERE id = ?', req.user.id);
        return { user: publicUser(updated) };
      });
      res.json({ ok: true, ...result });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
