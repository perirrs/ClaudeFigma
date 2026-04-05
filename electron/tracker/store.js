// SQLite-backed storage for activity samples and extension events.
// Every record is timestamped and bucketable by day/hour for analytics.

const path = require("path");
const { app } = require("electron");
let Database;
try {
  Database = require("better-sqlite3");
} catch {
  // better-sqlite3 requires a compile step; fall back to a no-op stub so the
  // app still boots for UI development even when native deps are missing.
  Database = null;
}

const DAY_MS = 24 * 60 * 60 * 1000;

function dayKey(ts = Date.now()) {
  const d = new Date(ts);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function dayRange(date) {
  const d = date ? new Date(date + "T00:00:00") : new Date();
  d.setHours(0, 0, 0, 0);
  return { start: d.getTime(), end: d.getTime() + DAY_MS };
}

class Store {
  constructor() {
    this.db = null;
    this.memory = {
      samples: [], // {ts, app, title, url, domain, idle}
      events: [], // extension-driven events
    };
  }

  init() {
    if (!Database) {
      console.warn("[store] better-sqlite3 not available, using in-memory store");
      return;
    }
    const dbPath = path.join(app.getPath("userData"), "productivity.db");
    this.db = new Database(dbPath);
    this.db.pragma("journal_mode = WAL");

    this.db.exec(`
      CREATE TABLE IF NOT EXISTS samples (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        ts INTEGER NOT NULL,
        duration_ms INTEGER NOT NULL DEFAULT 0,
        app TEXT,
        title TEXT,
        url TEXT,
        domain TEXT,
        idle INTEGER NOT NULL DEFAULT 0
      );
      CREATE INDEX IF NOT EXISTS idx_samples_ts ON samples(ts);
      CREATE INDEX IF NOT EXISTS idx_samples_domain ON samples(domain);

      CREATE TABLE IF NOT EXISTS events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        ts INTEGER NOT NULL,
        source TEXT NOT NULL,
        type TEXT NOT NULL,
        profile_name TEXT,
        profile_title TEXT,
        profile_url TEXT,
        meta TEXT
      );
      CREATE INDEX IF NOT EXISTS idx_events_ts ON events(ts);
      CREATE INDEX IF NOT EXISTS idx_events_source_type ON events(source, type);
    `);
  }

  close() {
    if (this.db) this.db.close();
  }

  // ---- Writes ----

  insertSample(sample) {
    if (!this.db) {
      this.memory.samples.push(sample);
      return;
    }
    this.db
      .prepare(
        `INSERT INTO samples (ts, duration_ms, app, title, url, domain, idle)
         VALUES (@ts, @duration_ms, @app, @title, @url, @domain, @idle)`
      )
      .run({
        ts: sample.ts,
        duration_ms: sample.duration_ms || 0,
        app: sample.app || null,
        title: sample.title || null,
        url: sample.url || null,
        domain: sample.domain || null,
        idle: sample.idle ? 1 : 0,
      });
  }

  insertEvent(event) {
    const row = {
      ts: event.ts || Date.now(),
      source: event.source,
      type: event.type,
      profile_name: event.profile_name || null,
      profile_title: event.profile_title || null,
      profile_url: event.profile_url || null,
      meta: event.meta ? JSON.stringify(event.meta) : null,
    };
    if (!this.db) {
      this.memory.events.push(row);
      return;
    }
    this.db
      .prepare(
        `INSERT INTO events (ts, source, type, profile_name, profile_title, profile_url, meta)
         VALUES (@ts, @source, @type, @profile_name, @profile_title, @profile_url, @meta)`
      )
      .run(row);
  }

  // ---- Reads / Aggregations ----

  getDailySummary(date) {
    const { start, end } = dayRange(date);

    const samples = this._rangeSamples(start, end);
    const events = this._rangeEvents(start, end);

    let activeMs = 0;
    let idleMs = 0;
    let linkedinMs = 0;
    let naukriMs = 0;
    const perDomain = new Map();

    for (const s of samples) {
      const d = s.duration_ms || 0;
      if (s.idle) {
        idleMs += d;
      } else {
        activeMs += d;
        if (s.domain) {
          perDomain.set(s.domain, (perDomain.get(s.domain) || 0) + d);
          if (/linkedin\.com$/i.test(s.domain)) linkedinMs += d;
          if (/naukri\.com$/i.test(s.domain)) naukriMs += d;
        }
      }
    }

    const linkedinConnections = events.filter(
      (e) => e.source === "linkedin" && e.type === "connection_sent"
    ).length;
    const linkedinMessages = events.filter(
      (e) => e.source === "linkedin" && e.type === "message_sent"
    ).length;
    const linkedinProfilesViewed = new Set(
      events
        .filter((e) => e.source === "linkedin" && e.type === "profile_viewed")
        .map((e) => e.profile_url)
    ).size;
    const naukriProfilesViewed = new Set(
      events
        .filter((e) => e.source === "naukri" && e.type === "profile_viewed")
        .map((e) => e.profile_url)
    ).size;
    const naukriDownloads = events.filter(
      (e) => e.source === "naukri" && e.type === "cv_downloaded"
    ).length;

    return {
      date: date || dayKey(),
      activeMs,
      idleMs,
      totalMs: activeMs + idleMs,
      linkedinMs,
      naukriMs,
      otherMs: Math.max(0, activeMs - linkedinMs - naukriMs),
      linkedinConnections,
      linkedinMessages,
      linkedinProfilesViewed,
      naukriProfilesViewed,
      naukriDownloads,
    };
  }

  getDomainBreakdown(date) {
    const { start, end } = dayRange(date);
    const samples = this._rangeSamples(start, end).filter((s) => s.domain && !s.idle);
    const map = new Map();
    for (const s of samples) {
      map.set(s.domain, (map.get(s.domain) || 0) + (s.duration_ms || 0));
    }
    return [...map.entries()]
      .map(([domain, ms]) => ({ domain, ms }))
      .sort((a, b) => b.ms - a.ms)
      .slice(0, 20);
  }

  getAppBreakdown(date) {
    const { start, end } = dayRange(date);
    const samples = this._rangeSamples(start, end).filter((s) => s.app && !s.idle);
    const map = new Map();
    for (const s of samples) {
      map.set(s.app, (map.get(s.app) || 0) + (s.duration_ms || 0));
    }
    return [...map.entries()]
      .map(([app, ms]) => ({ app, ms }))
      .sort((a, b) => b.ms - a.ms)
      .slice(0, 20);
  }

  getLinkedInActivity(date) {
    const { start, end } = dayRange(date);
    const events = this._rangeEvents(start, end).filter((e) => e.source === "linkedin");

    const profileMap = new Map();
    for (const e of events) {
      if (e.type !== "profile_viewed" || !e.profile_url) continue;
      const prev = profileMap.get(e.profile_url) || {
        url: e.profile_url,
        name: e.profile_name,
        title: e.profile_title,
        views: 0,
        ms: 0,
      };
      prev.views += 1;
      prev.ms += (e.meta && JSON.parse(e.meta).dwell_ms) || 0;
      prev.name = e.profile_name || prev.name;
      prev.title = e.profile_title || prev.title;
      profileMap.set(e.profile_url, prev);
    }

    return {
      profiles: [...profileMap.values()].sort((a, b) => b.ms - a.ms),
      connectionsSent: events.filter((e) => e.type === "connection_sent").length,
      messagesSent: events.filter((e) => e.type === "message_sent").length,
      searches: events.filter((e) => e.type === "search_ran").length,
    };
  }

  getNaukriActivity(date) {
    const { start, end } = dayRange(date);
    const events = this._rangeEvents(start, end).filter((e) => e.source === "naukri");

    const profileMap = new Map();
    for (const e of events) {
      if (e.type !== "profile_viewed" || !e.profile_url) continue;
      const prev = profileMap.get(e.profile_url) || {
        url: e.profile_url,
        name: e.profile_name,
        title: e.profile_title,
        views: 0,
        ms: 0,
      };
      prev.views += 1;
      prev.ms += (e.meta && JSON.parse(e.meta).dwell_ms) || 0;
      prev.name = e.profile_name || prev.name;
      prev.title = e.profile_title || prev.title;
      profileMap.set(e.profile_url, prev);
    }

    return {
      profiles: [...profileMap.values()].sort((a, b) => b.ms - a.ms),
      downloads: events.filter((e) => e.type === "cv_downloaded").length,
      searches: events.filter((e) => e.type === "search_ran").length,
      contacts: events.filter((e) => e.type === "contact_viewed").length,
    };
  }

  getTimeline(date) {
    // Bucket active ms into 24 hourly slots.
    const { start, end } = dayRange(date);
    const samples = this._rangeSamples(start, end);
    const hourly = Array.from({ length: 24 }, () => ({ active: 0, idle: 0, linkedin: 0, naukri: 0 }));
    for (const s of samples) {
      const hour = new Date(s.ts).getHours();
      const d = s.duration_ms || 0;
      if (s.idle) {
        hourly[hour].idle += d;
      } else {
        hourly[hour].active += d;
        if (/linkedin\.com$/i.test(s.domain || "")) hourly[hour].linkedin += d;
        if (/naukri\.com$/i.test(s.domain || "")) hourly[hour].naukri += d;
      }
    }
    return hourly;
  }

  // ---- Internal ----

  _rangeSamples(start, end) {
    if (!this.db) {
      return this.memory.samples.filter((s) => s.ts >= start && s.ts < end);
    }
    return this.db
      .prepare("SELECT * FROM samples WHERE ts >= ? AND ts < ? ORDER BY ts ASC")
      .all(start, end);
  }

  _rangeEvents(start, end) {
    if (!this.db) {
      return this.memory.events.filter((e) => e.ts >= start && e.ts < end);
    }
    return this.db
      .prepare("SELECT * FROM events WHERE ts >= ? AND ts < ? ORDER BY ts ASC")
      .all(start, end);
  }
}

module.exports = Store;
module.exports.dayKey = dayKey;
