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

-- Native Windows tray agent bucketed samples (1-min buckets).
-- active_ms + idle_ms together describe how the minute was spent; app/title
-- describe the foreground window at the end of the bucket.
CREATE TABLE IF NOT EXISTS desktop_activity (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  ts INTEGER NOT NULL,
  active_ms INTEGER NOT NULL DEFAULT 0,
  idle_ms INTEGER NOT NULL DEFAULT 0,
  app TEXT,
  title TEXT,
  category TEXT,
  host TEXT
);
CREATE INDEX IF NOT EXISTS idx_desktop_user_ts ON desktop_activity(user_id, ts);
CREATE INDEX IF NOT EXISTS idx_desktop_app ON desktop_activity(app);
`;

function seedAdminIfEmpty(d: Database.Database) {
  const envKey = process.env.PA_ADMIN_KEY || null;
  const existing = d.prepare("SELECT id, api_key FROM users WHERE role = 'admin' LIMIT 1").get() as
    | { id: string; api_key: string }
    | undefined;

  if (existing) {
    // If PA_ADMIN_KEY is set on this boot and differs from the stored admin
    // key, update the admin row so the env var is always authoritative.
    if (envKey && envKey !== existing.api_key) {
      d.prepare("UPDATE users SET api_key = ? WHERE id = ?").run(envKey, existing.id);
      console.log(`\n==> admin API key updated from PA_ADMIN_KEY\n`);
    }
    return;
  }

  const id = "admin";
  const key = envKey || randomKey();
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
