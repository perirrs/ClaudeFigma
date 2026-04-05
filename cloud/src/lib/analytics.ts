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

// Infer a rough tech / role category from a job-title string so recruiter
// outreach can be grouped at a glance (ServiceNow, Salesforce, etc.).
// Rules are ordered — first match wins.
const CATEGORY_RULES: Array<[RegExp, string]> = [
  [/\bservice\s*now\b|\bsnow\b|\bservicenow\b/i, "ServiceNow"],
  [/\bsalesforce\b|\bsfdc\b|\bapex\b|\blightning\b/i, "Salesforce"],
  [/\bworkday\b/i, "Workday"],
  [/\bsap\b|\babap\b|\bs\/?4\s*hana\b/i, "SAP"],
  [/\boracle\b|\bpl\/?sql\b|\bebs\b|\bfusion\b/i, "Oracle"],
  [/\bsharepoint\b|\bpowerapps?\b|\bpower\s*automate\b|\bdynamics\b/i, "Microsoft 365 / Power Platform"],
  [/\baws\b|\bamazon\s*web\s*services\b/i, "AWS"],
  [/\bazure\b/i, "Azure"],
  [/\bgcp\b|\bgoogle\s*cloud\b/i, "GCP"],
  [/\bdevops\b|\bkubernetes\b|\bk8s\b|\bdocker\b|\bterraform\b|\bsre\b|\bsite\s*reliability\b|\bci\/?cd\b/i, "DevOps / SRE"],
  [/\bdata\s*engineer|\bdatabricks\b|\bsnowflake\b|\bspark\b|\bhadoop\b|\betl\b|\bkafka\b/i, "Data Engineering"],
  [/\bdata\s*scien|\bml\b|\bmachine\s*learning\b|\bai\s*engineer|\bnlp\b|\bllm\b/i, "Data Science / ML"],
  [/\bbusiness\s*analyst|\bba\b|\bbusiness\s*intelligence|\bpower\s*bi\b|\btableau\b|\blooker\b/i, "BI / Analyst"],
  [/\bjava\b|\bspring\b|\bj2ee\b/i, "Java"],
  [/\b\.net\b|\bc#\b|\bdotnet\b/i, ".NET / C#"],
  [/\bpython\b|\bdjango\b|\bflask\b|\bfastapi\b/i, "Python"],
  [/\bnode\.?js\b|\breact\b|\bangular\b|\bvue\b|\bnext\.?js\b|\bjavascript\b|\btypescript\b|\bfrontend\b|\bfront[\s-]end\b/i, "Frontend / Node"],
  [/\bios\b|\bandroid\b|\bflutter\b|\breact\s*native\b|\bmobile\b/i, "Mobile"],
  [/\bqa\b|\btest\s*(engineer|automation|lead)|\bselenium\b|\bcypress\b|\bplaywright\b/i, "QA / Test"],
  [/\bproject\s*manager|\bprogram\s*manager|\bscrum\s*master|\bagile\s*coach/i, "PM / Delivery"],
  [/\bproduct\s*manager|\bproduct\s*owner\b/i, "Product"],
  [/\bux\b|\bui\s*designer|\bdesigner\b/i, "Design"],
  [/\brecruiter\b|\btalent\s*acquisition|\bhr\b/i, "Talent / HR"],
];
function categorize(title: string | null): string {
  if (!title) return "Uncategorised";
  for (const [re, label] of CATEGORY_RULES) if (re.test(title)) return label;
  return "Other";
}

type ProfileRow = { url: string; name: string | null; title: string | null; views: number; ms: number; firstSeen: number; lastSeen: number };
type ConnRow = { url: string; name: string | null; title: string | null; category: string; sentAt: number };

export function getLinkedInActivity(userId: string, date?: string) {
  const { start, end } = dayRange(date);
  const events = rangeEvents(userId, start, end).filter((e) => e.source === "linkedin");

  // Profiles viewed (dedup by URL).
  const viewedMap = new Map<string, ProfileRow>();
  for (const e of events) {
    if (e.type !== "profile_viewed" || !e.profile_url) continue;
    const prev = viewedMap.get(e.profile_url) || { url: e.profile_url, name: e.profile_name, title: e.profile_title, views: 0, ms: 0, firstSeen: e.ts, lastSeen: e.ts };
    prev.views += 1;
    try { prev.ms += (e.meta ? JSON.parse(e.meta).dwell_ms || 0 : 0); } catch {}
    prev.name = e.profile_name || prev.name;
    prev.title = e.profile_title || prev.title;
    if (e.ts < prev.firstSeen) prev.firstSeen = e.ts;
    if (e.ts > prev.lastSeen) prev.lastSeen = e.ts;
    viewedMap.set(e.profile_url, prev);
  }

  // Connection requests sent. Backfill name/title from the viewed profile if
  // the connection event itself didn't carry them (common since the invite
  // modal doesn't always re-render the headline).
  const connList: ConnRow[] = [];
  for (const e of events) {
    if (e.type !== "connection_sent") continue;
    const viewed = e.profile_url ? viewedMap.get(e.profile_url) : null;
    const name = e.profile_name || (viewed && viewed.name) || null;
    const title = e.profile_title || (viewed && viewed.title) || null;
    connList.push({
      url: e.profile_url || "",
      name, title,
      category: categorize(title),
      sentAt: e.ts,
    });
  }
  // Group connections by category for the dashboard.
  const connByCategory = new Map<string, ConnRow[]>();
  for (const c of connList) {
    const arr = connByCategory.get(c.category) || [];
    arr.push(c);
    connByCategory.set(c.category, arr);
  }
  const connectionGroups = [...connByCategory.entries()]
    .map(([category, rows]) => ({ category, count: rows.length, rows: rows.sort((a, b) => b.sentAt - a.sentAt) }))
    .sort((a, b) => b.count - a.count);

  // URLs we already sent a connection to, so the "viewed only" list can
  // exclude them.
  const connectedUrls = new Set(connList.map((c) => c.url).filter(Boolean));
  const viewedOnly = [...viewedMap.values()]
    .filter((p) => !connectedUrls.has(p.url))
    .sort((a, b) => b.lastSeen - a.lastSeen);

  return {
    profiles: viewedOnly,
    connectionGroups,
    connectionsSent: connList.length,
    messagesSent: events.filter((e) => e.type === "message_sent").length,
    searches: events.filter((e) => e.type === "search_ran").length,
  };
}

export function getNaukriActivity(userId: string, date?: string) {
  const { start, end } = dayRange(date);
  const events = rangeEvents(userId, start, end).filter((e) => e.source === "naukri");
  const profileMap = new Map<string, { url: string; name: string | null; title: string | null; views: number; ms: number; firstSeen: number; lastSeen: number }>();
  for (const e of events) {
    if (e.type !== "profile_viewed" || !e.profile_url) continue;
    const prev = profileMap.get(e.profile_url) || { url: e.profile_url, name: e.profile_name, title: e.profile_title, views: 0, ms: 0, firstSeen: e.ts, lastSeen: e.ts };
    prev.views += 1;
    try { prev.ms += (e.meta ? JSON.parse(e.meta).dwell_ms || 0 : 0); } catch {}
    prev.name = e.profile_name || prev.name;
    prev.title = e.profile_title || prev.title;
    if (e.ts < prev.firstSeen) prev.firstSeen = e.ts;
    if (e.ts > prev.lastSeen) prev.lastSeen = e.ts;
    profileMap.set(e.profile_url, prev);
  }
  return {
    profiles: [...profileMap.values()].sort((a, b) => b.lastSeen - a.lastSeen),
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
