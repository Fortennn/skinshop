import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import { getDb, withTransaction } from '../db/index.js';
import { requireAuth } from '../middleware/auth.js';
import { publicUser, serializeInventoryItem } from '../utils/serialize.js';

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

async function loadInventory(db, userId) {
  const rows = await db.all(
    `SELECT i.id, i.user_id, i.skin_id, i.source, i.acquired_at,
            s.name, s.type, s.wear, s.price, s.rarity, s.collection, s.image
     FROM inventory i JOIN skins s ON s.id = i.skin_id
     WHERE i.user_id = ? ORDER BY i.id DESC`,
    userId
  );
  return rows.map(serializeInventoryItem);
}

// GET /api/inventory
router.get('/', async (req, res, next) => {
  try {
    const db = await getDb();
    res.json({ inventory: await loadInventory(db, req.user.id) });
  } catch (err) {
    next(err);
  }
});

// POST /api/inventory/sell  body: { purchaseIds: [1,2,3] }
router.post(
  '/sell',
  body('purchaseIds').isArray({ min: 1, max: 200 }).withMessage('purchaseIds must be a 1-200 length array'),
  body('purchaseIds.*').isInt({ min: 1 }),
  async (req, res, next) => {
    if (bad(req, res)) return;
    try {
      const ids = req.body.purchaseIds;
      const result = await withTransaction(async (db) => {
        const placeholders = ids.map(() => '?').join(',');
        const items = await db.all(
          `SELECT i.id, i.skin_id, s.name, s.price FROM inventory i
           JOIN skins s ON s.id = i.skin_id
           WHERE i.user_id = ? AND i.id IN (${placeholders})`,
          req.user.id,
          ...ids
        );
        if (items.length !== ids.length) {
          const e = new Error('One or more items were not found in your inventory');
          e.status = 404;
          e.expose = true;
          throw e;
        }
        const total = items.reduce((s, x) => s + Number(x.price), 0);
        await db.run(
          `DELETE FROM inventory WHERE user_id = ? AND id IN (${placeholders})`,
          req.user.id,
          ...ids
        );
        await db.run('UPDATE users SET balance = balance + ? WHERE id = ?', total, req.user.id);

        const label =
          items.length === 1
            ? items[0].name
            : `${items.length} items (${items
                .slice(0, 3)
                .map((i) => i.name)
                .join(', ')}${items.length > 3 ? '…' : ''})`;
        await db.run(
          "INSERT INTO history (user_id, type, item_name, amount) VALUES (?, 'Sale', ?, ?)",
          req.user.id,
          label,
          total
        );
        const updated = await db.get('SELECT * FROM users WHERE id = ?', req.user.id);
        return { soldValue: total, soldCount: items.length, user: publicUser(updated) };
      });

      const db = await getDb();
      const inventory = await loadInventory(db, req.user.id);
      res.json({ ok: true, ...result, inventory });
    } catch (err) {
      next(err);
    }
  }
);

// POST /api/inventory/upgrade
// body: { sourcePurchaseId, targetSkinId, isWin, extraCost }
router.post(
  '/upgrade',
  body('sourcePurchaseId').isInt({ min: 1 }),
  body('targetSkinId').isInt({ min: 1 }),
  body('isWin').isBoolean(),
  body('extraCost').optional().isFloat({ min: 0, max: 100000 }),
  async (req, res, next) => {
    if (bad(req, res)) return;
    try {
      const { sourcePurchaseId, targetSkinId, isWin } = req.body;
      const extraCost = Number(req.body.extraCost || 0);
      const result = await withTransaction(async (db) => {
        const userRow = await db.get('SELECT * FROM users WHERE id = ?', req.user.id);
        if (Number(userRow.balance) < extraCost) {
          const e = new Error('Insufficient balance');
          e.status = 402;
          e.expose = true;
          throw e;
        }
        const source = await db.get(
          `SELECT i.id, i.skin_id, s.name FROM inventory i
           JOIN skins s ON s.id = i.skin_id
           WHERE i.user_id = ? AND i.id = ?`,
          req.user.id,
          sourcePurchaseId
        );
        if (!source) {
          const e = new Error('Source item not found');
          e.status = 404;
          e.expose = true;
          throw e;
        }
        const target = await db.get('SELECT id, name FROM skins WHERE id = ?', targetSkinId);
        if (!target) {
          const e = new Error('Target skin not found');
          e.status = 404;
          e.expose = true;
          throw e;
        }

        await db.run('DELETE FROM inventory WHERE id = ?', sourcePurchaseId);
        if (extraCost > 0) {
          await db.run('UPDATE users SET balance = balance - ? WHERE id = ?', extraCost, req.user.id);
        }
        if (isWin) {
          await db.run(
            "INSERT INTO inventory (user_id, skin_id, source) VALUES (?, ?, 'upgrade')",
            req.user.id,
            targetSkinId
          );
        }
        await db.run(
          'INSERT INTO history (user_id, type, item_name, amount) VALUES (?, ?, ?, ?)',
          req.user.id,
          isWin ? 'Upgrade Win' : 'Upgrade Loss',
          isWin ? `${source.name} -> ${target.name}` : source.name,
          isWin ? 0 : -extraCost
        );
        const updated = await db.get('SELECT * FROM users WHERE id = ?', req.user.id);
        return { user: publicUser(updated) };
      });

      const db = await getDb();
      const inventory = await loadInventory(db, req.user.id);
      res.json({ ok: true, ...result, inventory });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
