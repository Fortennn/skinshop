import { Router } from 'express';
import { getDb } from '../db/index.js';
import { serializeSkin } from '../utils/serialize.js';

const router = Router();

// GET /api/skins?search=&type=&sort=&limit=&offset=
router.get('/', async (req, res, next) => {
  try {
    const db = await getDb();
    const { search, type, sort } = req.query;
    const limit = Math.min(parseInt(req.query.limit, 10) || 500, 1000);
    const offset = Math.max(parseInt(req.query.offset, 10) || 0, 0);

    const where = [];
    const params = [];
    if (search) {
      where.push('LOWER(name) LIKE ?');
      params.push(`%${String(search).toLowerCase()}%`);
    }
    if (type && type !== 'All') {
      where.push('type = ?');
      params.push(String(type));
    }
    const whereSQL = where.length ? `WHERE ${where.join(' AND ')}` : '';

    let orderBy = 'id ASC';
    if (sort === 'price-low') orderBy = 'price ASC';
    else if (sort === 'price-high') orderBy = 'price DESC';
    else if (sort === 'name') orderBy = 'name ASC';

    const rows = await db.all(
      `SELECT * FROM skins ${whereSQL} ORDER BY ${orderBy} LIMIT ? OFFSET ?`,
      ...params,
      limit,
      offset
    );
    res.json({ skins: rows.map(serializeSkin) });
  } catch (err) {
    next(err);
  }
});

// GET /api/skins/:id
router.get('/:id', async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (!Number.isFinite(id)) return res.status(400).json({ error: 'Invalid id' });
    const db = await getDb();
    const row = await db.get('SELECT * FROM skins WHERE id = ?', id);
    if (!row) return res.status(404).json({ error: 'Skin not found' });
    res.json({ skin: serializeSkin(row) });
  } catch (err) {
    next(err);
  }
});

export default router;
