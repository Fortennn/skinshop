import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { getDb } from './index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Idempotently upsert the skins catalog from src/data/skins.json into the DB.
 */
export async function seedSkins() {
  const db = await getDb();
  const skinsPath = path.join(__dirname, '..', '..', 'src', 'data', 'skins.json');
  const raw = await fs.readFile(skinsPath, 'utf8');
  const skins = JSON.parse(raw);

  const insertStmt = await db.prepare(
    `INSERT INTO skins (id, name, type, wear, price, rarity, collection, image)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET
       name = excluded.name,
       type = excluded.type,
       wear = excluded.wear,
       price = excluded.price,
       rarity = excluded.rarity,
       collection = excluded.collection,
       image = excluded.image`
  );

  await db.exec('BEGIN');
  try {
    for (const s of skins) {
      await insertStmt.run(
        s.id,
        s.name,
        s.type,
        s.wear ?? null,
        s.price,
        s.rarity ?? null,
        s.collection ?? null,
        s.image ?? null
      );
    }
    await db.exec('COMMIT');
  } catch (err) {
    await db.exec('ROLLBACK');
    throw err;
  } finally {
    await insertStmt.finalize();
  }

  const { count } = await db.get('SELECT COUNT(*) as count FROM skins');
  console.log(`[seed] skins table contains ${count} rows.`);
}
