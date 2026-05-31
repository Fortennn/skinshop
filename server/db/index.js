import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let dbPromise = null;

export function getDb() {
  if (!dbPromise) {
    const dbPath = process.env.DB_PATH || path.join(__dirname, '..', 'data', 'skinshop.db');
    dbPromise = open({
      filename: dbPath,
      driver: sqlite3.Database,
    }).then(async (db) => {
      await db.exec('PRAGMA foreign_keys = ON');
      await db.exec('PRAGMA journal_mode = WAL');
      const schema = await fs.readFile(path.join(__dirname, 'schema.sql'), 'utf8');
      await db.exec(schema);
      return db;
    });
  }
  return dbPromise;
}

/**
 * Run a function inside a transaction. Rolls back on throw.
 */
export async function withTransaction(fn) {
  const db = await getDb();
  await db.exec('BEGIN IMMEDIATE');
  try {
    const result = await fn(db);
    await db.exec('COMMIT');
    return result;
  } catch (err) {
    await db.exec('ROLLBACK');
    throw err;
  }
}
