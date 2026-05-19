import Database from 'better-sqlite3'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
let db

export function getDb() {
  return db
}

export function initDb() {
  db = new Database(join(__dirname, 'kyc.db'))

  db.exec(`
    CREATE TABLE IF NOT EXISTS holders (
      did TEXT PRIMARY KEY,
      public_key_hex TEXT NOT NULL,
      private_key_hex TEXT NOT NULL,
      created_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS credentials (
      id TEXT PRIMARY KEY,
      holder_did TEXT NOT NULL,
      type TEXT NOT NULL,
      jwt TEXT NOT NULL,
      claims TEXT NOT NULL,
      status TEXT DEFAULT 'active',
      issued_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS verifications (
      id TEXT PRIMARY KEY,
      vp_jwt TEXT NOT NULL,
      holder_did TEXT,
      success INTEGER NOT NULL,
      result TEXT NOT NULL,
      verified_at INTEGER NOT NULL
    );
  `)

  return db
}
