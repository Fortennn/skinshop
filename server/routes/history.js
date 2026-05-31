import { Router } from 'express';
import { getDb } from '../db/index.js';
import { requireAuth } from '../middleware/auth.js';
import { serializeHistoryRow } from '../utils/serialize.js';

const router = Router();
router.use(requireAuth);

// GET /api/history?limit=&offset=
router.get('/', async (req, res, next) => {
  try {
    const db = await getDb();
    const limit = Math.min(parseInt(req.query.limit, 10) || 100, 500);
    const offset = Math.max(parseInt(req.query.offset, 10) || 0, 0);
    const rows = await db.all(
      'SELECT * FROM history WHERE user_id = ? ORDER BY id DESC LIMIT ? OFFSET ?',
      req.user.id,
      limit,
      offset
    );
    res.json({ history: rows.map(serializeHistoryRow) });
  } catch (err) {
    next(err);
  }
});

export default router;
