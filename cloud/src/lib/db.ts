// SQLite-backed persistence. For local dev and single-node deploys.
// Swap to Postgres later by replacing this module.

import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

const DATA_DIR = process.env.PA_DATA_DIR || path.join(process.cwd(), "data");
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
const DB_PATH = path.join(DATA_DIR, "productivity.db");

let _db: Database.Database | null = null;

export function db() {
  if (_db) return _db;
  _db = new Database(DB_PATH);
  _db.pragma("journal_mode = WAL");
  _db.exec(SCHEMA);
  seedAdminIfEmpty(_db);
  return _db;
}

const SCHEMA = `
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  team TEXT,
  api_key TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL DEFAULT 'user', -- 'user' | 'admin'
  created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_users_api_key ON users(api_key);

CREATE TABLE IF NOT EXISTS samples (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  ts INTEGER NOT NULL,
  duration_ms INTEGER NOT NULL DEFAULT 0,
  url TEXT,
  domain TEXT,
  title TEXT,
  idle INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_samples_user_ts ON samples(user_id, ts);
CREATE INDEX IF NOT EXISTS idx_samples_domain ON samples(domain);

CREATE TABLE IF NOT EXISTS events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  ts INTEGER NOT NULL,
  source TEXT NOT NULL,
  type TEXT NOT NULL,
  profile_url TEXT,
  profile_name TEXT,
  profile_title TEXT,
  meta TEXT
);
CREATE INDEX IF NOT EXISTS idx_events_user_ts ON events(user_id, ts);
CREATE INDEX IF NOT EXISTS idx_events_source_type ON events(source, type);
`;

function seedAdminIfEmpty(d: Database.Database) {
  const row = d.prepare("SELECT COUNT(*) as c FROM users").get() as { c: number };
  if (row.c > 0) return;
  const id = "admin";
  const key = process.env.PA_ADMIN_KEY || randomKey();
  d.prepare(
    `INSERT INTO users (id, name, email, team, api_key, role, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)`
  ).run(id, "Admin", "", "ops", key, "admin", Date.now());
  // eslint-disable-next-line no-console
  console.log(`\n==> seeded admin user. API key: ${key}\n    (set PA_ADMIN_KEY env to control this)\n`);
}

export function randomKey(len = 32) {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let out = "";
  for (let i = 0; i < len; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

// ---- Helpers ----

const DAY_MS = 24 * 60 * 60 * 1000;

export function dayRange(date?: string | null) {
  const d = date ? new Date(date + "T00:00:00") : new Date();
  d.setHours(0, 0, 0, 0);
  return { start: d.getTime(), end: d.getTime() + DAY_MS };
}

export function dayKey(ts = Date.now()) {
  const d = new Date(ts);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
