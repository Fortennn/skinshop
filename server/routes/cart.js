import { Router } from 'express';
import { body, param, validationResult } from 'express-validator';
import { getDb, withTransaction } from '../db/index.js';
import { requireAuth } from '../middleware/auth.js';
import { serializeSkin, publicUser, serializeHistoryRow } from '../utils/serialize.js';

const router = Router();
router.use(requireAuth);

function bad(req, res) {
  const errs = validationResult(req);
  if (!errs.isEmpty()) {
    res.status(400).json({ error: errs.array()[0].msg });
    return true;
  }
  return false;
}

async function loadCart(db, userId) {
  const rows = await db.all(
    `SELECT c.skin_id, c.quantity, s.* FROM cart_items c
     JOIN skins s ON s.id = c.skin_id
     WHERE c.user_id = ? ORDER BY c.id ASC`,
    userId
  );
  return rows.map((r) => ({ ...serializeSkin(r), quantity: r.quantity }));
}

// GET /api/cart
router.get('/', async (req, res, next) => {
  try {
    const db = await getDb();
    res.json({ cart: await loadCart(db, req.user.id) });
  } catch (err) {
    next(err);
  }
});

// POST /api/cart  body: { skinId, quantity? }
router.post(
  '/',
  body('skinId').isInt({ min: 1 }),
  body('quantity').optional().isInt({ min: 1, max: 99 }),
  async (req, res, next) => {
    if (bad(req, res)) return;
    try {
      const skinId = req.body.skinId;
      const qty = req.body.quantity ?? 1;
      const db = await getDb();
      const skin = await db.get('SELECT id FROM skins WHERE id = ?', skinId);
      if (!skin) return res.status(404).json({ error: 'Skin not found' });
      await db.run(
        `INSERT INTO cart_items (user_id, skin_id, quantity) VALUES (?, ?, ?)
         ON CONFLICT(user_id, skin_id) DO UPDATE SET quantity = MIN(99, cart_items.quantity + excluded.quantity)`,
        req.user.id,
        skinId,
        qty
      );
      res.json({ cart: await loadCart(db, req.user.id) });
    } catch (err) {
      next(err);
    }
  }
);

// PATCH /api/cart/:skinId  body: { quantity }
router.patch(
  '/:skinId',
  param('skinId').isInt({ min: 1 }),
  body('quantity').isInt({ min: 0, max: 99 }),
  async (req, res, next) => {
    if (bad(req, res)) return;
    try {
      const db = await getDb();
      const skinId = parseInt(req.params.skinId, 10);
      const qty = req.body.quantity;
      if (qty === 0) {
        await db.run('DELETE FROM cart_items WHERE user_id = ? AND skin_id = ?', req.user.id, skinId);
      } else {
        await db.run(
          'UPDATE cart_items SET quantity = ? WHERE user_id = ? AND skin_id = ?',
          qty,
          req.user.id,
          skinId
        );
      }
      res.json({ cart: await loadCart(db, req.user.id) });
    } catch (err) {
      next(err);
    }
  }
);

// DELETE /api/cart/:skinId
router.delete('/:skinId', param('skinId').isInt({ min: 1 }), async (req, res, next) => {
  if (bad(req, res)) return;
  try {
    const db = await getDb();
    await db.run(
      'DELETE FROM cart_items WHERE user_id = ? AND skin_id = ?',
      req.user.id,
      parseInt(req.params.skinId, 10)
    );
    res.json({ cart: await loadCart(db, req.user.id) });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/cart  — clear cart
router.delete('/', async (req, res, next) => {
  try {
    const db = await getDb();
    await db.run('DELETE FROM cart_items WHERE user_id = ?', req.user.id);
    res.json({ cart: [] });
  } catch (err) {
    next(err);
  }
});

// POST /api/cart/checkout
router.post('/checkout', async (req, res, next) => {
  try {
    const result = await withTransaction(async (db) => {
      const userRow = await db.get('SELECT * FROM users WHERE id = ?', req.user.id);
      const cartRows = await db.all(
        `SELECT c.skin_id, c.quantity, s.name, s.price FROM cart_items c
         JOIN skins s ON s.id = c.skin_id WHERE c.user_id = ?`,
        req.user.id
      );
      if (!cartRows.length) {
        const e = new Error('Your cart is empty');
        e.status = 400;
        e.expose = true;
        throw e;
      }
      const total = cartRows.reduce((sum, r) => sum + Number(r.price) * Number(r.quantity), 0);
      if (Number(userRow.balance) < total) {
        const e = new Error('Insufficient balance');
        e.status = 402;
        e.expose = true;
        throw e;
      }

      // Deduct balance
      await db.run('UPDATE users SET balance = balance - ? WHERE id = ?', total, req.user.id);

      let totalItems = 0;
      for (const r of cartRows) {
        for (let i = 0; i < r.quantity; i++) {
          await db.run(
            "INSERT INTO inventory (user_id, skin_id, source) VALUES (?, ?, 'purchase')",
            req.user.id,
            r.skin_id
          );
          totalItems++;
        }
        await db.run(
          "INSERT INTO history (user_id, type, item_name, amount) VALUES (?, 'Purchase', ?, ?)",
          req.user.id,
          `${r.name}${r.quantity > 1 ? ` (x${r.quantity})` : ''}`,
          -(Number(r.price) * Number(r.quantity))
        );
      }

      await db.run('DELETE FROM cart_items WHERE user_id = ?', req.user.id);

      const updatedUser = await db.get('SELECT * FROM users WHERE id = ?', req.user.id);
      return { totalItems, user: publicUser(updatedUser) };
    });

    const db = await getDb();
    const cart = await loadCart(db, req.user.id);
    res.json({ ok: true, ...result, cart });
  } catch (err) {
    next(err);
  }
});

export default router;
