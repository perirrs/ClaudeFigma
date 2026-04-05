// Aggregations over the raw samples + events tables for a given user & day.

import { db, dayRange, dayKey } from "./db";

type SampleRow = {
  ts: number; duration_ms: number; url: string | null; domain: string | null;
  title: string | null; idle: number;
};
type EventRow = {
  ts: number; source: string; type: string; profile_url: string | null;
  profile_name: string | null; profile_title: string | null; meta: string | null;
};

function rangeSamples(userId: string, start: number, end: number): SampleRow[] {
  return db()
    .prepare("SELECT ts, duration_ms, url, domain, title, idle FROM samples WHERE user_id = ? AND ts >= ? AND ts < ? ORDER BY ts ASC")
    .all(userId, start, end) as SampleRow[];
}
function rangeEvents(userId: string, start: number, end: number): EventRow[] {
  return db()
    .prepare("SELECT ts, source, type, profile_url, profile_name, profile_title, meta FROM events WHERE user_id = ? AND ts >= ? AND ts < ? ORDER BY ts ASC")
    .all(userId, start, end) as EventRow[];
}

export function getSummary(userId: string, date?: string) {
  const { start, end } = dayRange(date);
  const samples = rangeSamples(userId, start, end);
  const events = rangeEvents(userId, start, end);

  let activeMs = 0, idleMs = 0, linkedinMs = 0, naukriMs = 0;
  for (const s of samples) {
    const d = s.duration_ms || 0;
    if (s.idle) { idleMs += d; continue; }
    activeMs += d;
    if (s.domain && /linkedin\.com$/i.test(s.domain)) linkedinMs += d;
    if (s.domain && /naukri\.com$/i.test(s.domain)) naukriMs += d;
  }

  const count = (src: string, type: string) => events.filter((e) => e.source === src && e.type === type).length;
  const uniq = (src: string, type: string) => new Set(events.filter((e) => e.source === src && e.type === type).map((e) => e.profile_url)).size;

  return {
    date: date || dayKey(),
    activeMs, idleMs, totalMs: activeMs + idleMs,
    linkedinMs, naukriMs, otherMs: Math.max(0, activeMs - linkedinMs - naukriMs),
    linkedinConnections: count("linkedin", "connection_sent"),
    linkedinMessages: count("linkedin", "message_sent"),
    linkedinSearches: count("linkedin", "search_ran"),
    linkedinProfilesViewed: uniq("linkedin", "profile_viewed"),
    naukriProfilesViewed: uniq("naukri", "profile_viewed"),
    naukriDownloads: count("naukri", "cv_downloaded"),
    naukriContacts: count("naukri", "contact_viewed"),
    naukriSearches: count("naukri", "search_ran"),
  };
}

export function getDomainBreakdown(userId: string, date?: string) {
  const { start, end } = dayRange(date);
  const samples = rangeSamples(userId, start, end).filter((s) => s.domain && !s.idle);
  const map = new Map<string, number>();
  for (const s of samples) map.set(s.domain!, (map.get(s.domain!) || 0) + s.duration_ms);
  return [...map.entries()].map(([domain, ms]) => ({ domain, ms })).sort((a, b) => b.ms - a.ms).slice(0, 20);
}

export function getTimeline(userId: string, date?: string) {
  const { start, end } = dayRange(date);
  const samples = rangeSamples(userId, start, end);
  const hourly = Array.from({ length: 24 }, () => ({ active: 0, idle: 0, linkedin: 0, naukri: 0 }));
  for (const s of samples) {
    const hour = new Date(s.ts).getHours();
    const d = s.duration_ms || 0;
    if (s.idle) { hourly[hour].idle += d; continue; }
    hourly[hour].active += d;
    if (s.domain && /linkedin\.com$/i.test(s.domain)) hourly[hour].linkedin += d;
    if (s.domain && /naukri\.com$/i.test(s.domain)) hourly[hour].naukri += d;
  }
  return hourly;
}

export function getLinkedInActivity(userId: string, date?: string) {
  const { start, end } = dayRange(date);
  const events = rangeEvents(userId, start, end).filter((e) => e.source === "linkedin");
  const profileMap = new Map<string, { url: string; name: string | null; title: string | null; views: number; ms: number }>();
  for (const e of events) {
    if (e.type !== "profile_viewed" || !e.profile_url) continue;
    const prev = profileMap.get(e.profile_url) || { url: e.profile_url, name: e.profile_name, title: e.profile_title, views: 0, ms: 0 };
    prev.views += 1;
    try { prev.ms += (e.meta ? JSON.parse(e.meta).dwell_ms || 0 : 0); } catch {}
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

export function getNaukriActivity(userId: string, date?: string) {
  const { start, end } = dayRange(date);
  const events = rangeEvents(userId, start, end).filter((e) => e.source === "naukri");
  const profileMap = new Map<string, { url: string; name: string | null; title: string | null; views: number; ms: number }>();
  for (const e of events) {
    if (e.type !== "profile_viewed" || !e.profile_url) continue;
    const prev = profileMap.get(e.profile_url) || { url: e.profile_url, name: e.profile_name, title: e.profile_title, views: 0, ms: 0 };
    prev.views += 1;
    try { prev.ms += (e.meta ? JSON.parse(e.meta).dwell_ms || 0 : 0); } catch {}
    prev.name = e.profile_name || prev.name;
    prev.title = e.profile_title || prev.title;
    profileMap.set(e.profile_url, prev);
  }
  return {
    profiles: [...profileMap.values()].sort((a, b) => b.ms - a.ms),
    downloads: events.filter((e) => e.type === "cv_downloaded").length,
    contacts: events.filter((e) => e.type === "contact_viewed").length,
    searches: events.filter((e) => e.type === "search_ran").length,
  };
}

export function getTeamSummary(date?: string) {
  const { start, end } = dayRange(date);
  const users = db().prepare("SELECT id, name, team FROM users WHERE role != 'admin'").all() as
    { id: string; name: string; team: string | null }[];
  return users.map((u) => ({ ...u, ...getSummary(u.id, date) }));
}
