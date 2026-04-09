// Service worker — config-driven productivity tracker.
// Fetches platform configuration from the team server on startup.
// Tracks per-URL dwell time via tab focus events, plus events from content
// scripts (profile views, connections, messages, CV downloads, searches).
// All data lives in chrome.storage.local, keyed by date.

const IDLE_THRESHOLD_SEC = 60;

let activeTabId = null;
let activeUrl = null;
let activeTitle = null;
let activeStart = null;
let userIdle = false;

// ---- Platform config (fetched from server, cached locally) ----
// Default platforms used when server config hasn't been fetched yet.
const DEFAULT_PLATFORMS = [
  { id: "linkedin", name: "LinkedIn", color: "#4ade80", domains: ["linkedin.com"], metrics: ["profiles", "connections", "messages", "searches"] },
  { id: "naukri", name: "Naukri", color: "#60a5fa", domains: ["naukri.com"], metrics: ["profiles", "downloads", "contacts", "searches"] },
];

let platformConfig = null; // array of platform objects

// Maps a domain to a platform ID based on config.
function platformForDomain(domain) {
  if (!domain || !platformConfig) return null;
  for (const p of platformConfig) {
    for (const d of (p.domains || [])) {
      if (domain === d || domain.endsWith("." + d)) return p.id;
    }
  }
  return null;
}

// Maps a content-script "source" name to a platform ID.
// Content scripts send source: "linkedin" or "naukri" etc.
function platformForSource(source) {
  if (!source || !platformConfig) return null;
  for (const p of platformConfig) {
    if (p.id === source) return p.id;
    // Also match by name (case insensitive)
    if (p.name && p.name.toLowerCase().replace(/\s+/g, "") === source.toLowerCase().replace(/\s+/g, "")) return p.id;
  }
  return null;
}

async function loadPlatformConfig() {
  // Try cached config first.
  const cached = await chrome.storage.local.get(["pa_platform_config", "pa_config_fetched_at"]);
  if (cached.pa_platform_config && Array.isArray(cached.pa_platform_config) && cached.pa_platform_config.length > 0) {
    platformConfig = cached.pa_platform_config;
  } else {
    platformConfig = DEFAULT_PLATFORMS;
  }

  // Fetch fresh config from server in background.
  fetchServerConfig();
}

async function fetchServerConfig() {
  const cfg = await getSyncConfig();
  if (!cfg.syncUrl || !cfg.memberEmail) return;

  const configUrl = cfg.syncUrl.replace(/\/syncActivity\b/, "/getConfig");
  if (configUrl === cfg.syncUrl) return; // no getConfig endpoint available

  const headers = { "Content-Type": "application/json" };
  if (cfg.syncToken) {
    headers["X-API-Key"] = cfg.syncToken;
    headers["Authorization"] = `Bearer ${cfg.syncToken}`;
  }

  try {
    const res = await fetch(configUrl, {
      method: "POST",
      headers,
      body: JSON.stringify({ email: cfg.memberEmail }),
    });
    if (!res.ok) return;
    const data = await res.json();
    if (data && data.platforms && Array.isArray(data.platforms) && data.platforms.length > 0) {
      platformConfig = data.platforms.map(p => ({
        id: (p.id || p.name || "").toLowerCase().replace(/\s+/g, "_"),
        name: p.name || p.id,
        color: p.color || "#8b98a5",
        domains: p.domains || p.domainPatterns || [],
        metrics: p.metrics || [],
      }));
      await chrome.storage.local.set({
        pa_platform_config: platformConfig,
        pa_config_fetched_at: Date.now(),
        pa_member_info: data.member || null,
        pa_department: data.department || null,
      });
    }
  } catch {
    // Server unreachable — use cached or defaults.
  }
}

// ---- Today snapshot (in-memory, persisted on every change) ----
let today = null;

function now() { return Date.now(); }
function domainOf(url) {
  if (!url) return null;
  try { return new URL(url).hostname.replace(/^www\./, ""); } catch { return null; }
}
function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function emptyDay(date) {
  return {
    date,
    activeMs: 0, idleMs: 0,
    // Generic per-platform time: { "linkedin": 12345, "naukri": 5000, ... }
    platformMs: {},
    // Legacy fields kept for backward compat with existing content scripts
    linkedinMs: 0, naukriMs: 0,
    // Generic profile arrays per platform: { "linkedin": [...urls], "naukri": [...urls] }
    platformProfiles: {},
    // Legacy arrays
    liProfiles: [], nkProfiles: [],
    // Generic metric counters: { "linkedin": { connections: 3, messages: 5 }, ... }
    platformMetrics: {},
    // Legacy counters
    liConnections: 0, liMessages: 0, liSearches: 0,
    naukriDownloads: 0, naukriContacts: 0, naukriSearches: 0,
    domains: {},      // { "linkedin.com": 12345, ... }
    events: [],       // detailed event log for the dashboard
  };
}

async function loadToday() {
  const key = todayKey();
  const stored = await chrome.storage.local.get(`day_${key}`);
  if (stored[`day_${key}`] && stored[`day_${key}`].date === key) {
    today = stored[`day_${key}`];
    // Ensure fields added in newer versions exist.
    if (!today.domains) today.domains = {};
    if (!today.events) today.events = [];
    if (!today.liSearches) today.liSearches = 0;
    if (!today.naukriContacts) today.naukriContacts = 0;
    if (!today.naukriSearches) today.naukriSearches = 0;
    if (!today.idleMs) today.idleMs = 0;
    if (!today.platformMs) today.platformMs = {};
    if (!today.platformProfiles) today.platformProfiles = {};
    if (!today.platformMetrics) today.platformMetrics = {};
  } else {
    today = emptyDay(key);
  }
}

async function saveToday() {
  if (!today) return;
  const key = todayKey();
  if (today.date !== key) today = emptyDay(key);
  // Cap events list so storage doesn't bloat.
  if (today.events.length > 2000) today.events = today.events.slice(-2000);
  await chrome.storage.local.set({ [`day_${key}`]: today });
}

// ---- Dwell tracking ----

function bufferDwell() {
  if (!activeUrl || userIdle || activeStart == null) return;
  const ms = now() - activeStart;
  if (ms < 1000) return;
  activeStart = now();
  if (!today || today.date !== todayKey()) return;
  const domain = domainOf(activeUrl);
  today.activeMs += ms;
  if (domain) {
    today.domains[domain] = (today.domains[domain] || 0) + ms;
    // Track per-platform time
    const pid = platformForDomain(domain);
    if (pid) {
      today.platformMs[pid] = (today.platformMs[pid] || 0) + ms;
    }
    // Legacy fields (keep synced for backward compat)
    if (/linkedin\.com$/i.test(domain)) today.linkedinMs += ms;
    if (/naukri\.com$/i.test(domain)) today.naukriMs += ms;
  }
}

// ---- Event handling ----

function handleEvent(ev) {
  if (!today || !ev) return;
  today.events.push({ ...ev, _ts: Date.now() });

  const pid = platformForSource(ev.source) || ev.source;

  // Initialize platform metrics if needed
  if (pid && !today.platformMetrics[pid]) {
    today.platformMetrics[pid] = {};
  }

  if (ev.source === "linkedin" || pid === "linkedin") {
    if (ev.type === "profile_viewed" && ev.profile_url) {
      if (!today.liProfiles.includes(ev.profile_url)) today.liProfiles.push(ev.profile_url);
      if (!today.platformProfiles["linkedin"]) today.platformProfiles["linkedin"] = [];
      if (!today.platformProfiles["linkedin"].includes(ev.profile_url)) today.platformProfiles["linkedin"].push(ev.profile_url);
      today.platformMetrics["linkedin"] = today.platformMetrics["linkedin"] || {};
      today.platformMetrics["linkedin"].profiles = (today.platformProfiles["linkedin"] || []).length;
    }
    if (ev.type === "connection_sent") {
      today.liConnections += 1;
      today.platformMetrics["linkedin"] = today.platformMetrics["linkedin"] || {};
      today.platformMetrics["linkedin"].connections = today.liConnections;
    }
    if (ev.type === "message_sent") {
      today.liMessages += 1;
      today.platformMetrics["linkedin"] = today.platformMetrics["linkedin"] || {};
      today.platformMetrics["linkedin"].messages = today.liMessages;
    }
    if (ev.type === "search_ran") {
      today.liSearches += 1;
      today.platformMetrics["linkedin"] = today.platformMetrics["linkedin"] || {};
      today.platformMetrics["linkedin"].searches = today.liSearches;
    }
  } else if (ev.source === "naukri" || pid === "naukri") {
    if (ev.type === "profile_viewed" && ev.profile_url) {
      if (!today.nkProfiles.includes(ev.profile_url)) today.nkProfiles.push(ev.profile_url);
      if (!today.platformProfiles["naukri"]) today.platformProfiles["naukri"] = [];
      if (!today.platformProfiles["naukri"].includes(ev.profile_url)) today.platformProfiles["naukri"].push(ev.profile_url);
      today.platformMetrics["naukri"] = today.platformMetrics["naukri"] || {};
      today.platformMetrics["naukri"].profiles = (today.platformProfiles["naukri"] || []).length;
    }
    if (ev.type === "cv_downloaded") {
      today.naukriDownloads += 1;
      today.platformMetrics["naukri"] = today.platformMetrics["naukri"] || {};
      today.platformMetrics["naukri"].downloads = today.naukriDownloads;
    }
    if (ev.type === "contact_viewed") {
      today.naukriContacts += 1;
      today.platformMetrics["naukri"] = today.platformMetrics["naukri"] || {};
      today.platformMetrics["naukri"].contacts = today.naukriContacts;
    }
    if (ev.type === "search_ran") {
      today.naukriSearches += 1;
      today.platformMetrics["naukri"] = today.platformMetrics["naukri"] || {};
      today.platformMetrics["naukri"].searches = today.naukriSearches;
    }
  } else if (pid) {
    // Generic platform event handling for future content scripts
    if (ev.type === "profile_viewed" && ev.profile_url) {
      if (!today.platformProfiles[pid]) today.platformProfiles[pid] = [];
      if (!today.platformProfiles[pid].includes(ev.profile_url)) today.platformProfiles[pid].push(ev.profile_url);
      today.platformMetrics[pid].profiles = today.platformProfiles[pid].length;
    }
    // Generic metric increment
    const metricName = ev.type.replace(/_/g, "").replace("sent", "s").replace("viewed", "s").replace("downloaded", "s").replace("ran", "s");
    if (ev.type !== "profile_viewed") {
      today.platformMetrics[pid][metricName] = (today.platformMetrics[pid][metricName] || 0) + 1;
    }
  }
}

function snapshotForOverlay() {
  if (!today || today.date !== todayKey()) today = emptyDay(todayKey());

  // Build platform summaries for the overlay
  const platforms = {};
  if (platformConfig) {
    for (const p of platformConfig) {
      platforms[p.id] = {
        name: p.name,
        color: p.color,
        timeMs: today.platformMs[p.id] || 0,
        metrics: today.platformMetrics[p.id] || {},
        profileCount: (today.platformProfiles[p.id] || []).length,
      };
    }
  }

  return {
    date: today.date,
    activeMs: today.activeMs,
    // Legacy fields for backward compat
    linkedinMs: today.linkedinMs,
    naukriMs: today.naukriMs,
    liUniqueProfiles: today.liProfiles.length,
    nkUniqueProfiles: today.nkProfiles.length,
    liConnections: today.liConnections,
    liMessages: today.liMessages,
    liSearches: today.liSearches,
    nkDownloads: today.naukriDownloads,
    naukriContacts: today.naukriContacts,
    naukriSearches: today.naukriSearches,
    // New generic platform data
    platformMs: today.platformMs,
    platformMetrics: today.platformMetrics,
    platforms,
    platformConfig: platformConfig || DEFAULT_PLATFORMS,
    showOverlay: true,
  };
}

// ---- Tab / window tracking ----

async function switchFocus(tabId) {
  bufferDwell();
  activeTabId = tabId;
  activeStart = now();
  if (tabId == null) { activeUrl = null; activeTitle = null; return; }
  try {
    const tab = await chrome.tabs.get(tabId);
    activeUrl = tab.url || null;
    activeTitle = tab.title || null;
  } catch { activeUrl = null; activeTitle = null; }
}

chrome.tabs.onActivated.addListener(({ tabId }) => switchFocus(tabId));

chrome.tabs.onUpdated.addListener((tabId, info, tab) => {
  if (tabId !== activeTabId) return;
  if (info.url || info.title) {
    bufferDwell();
    activeUrl = tab.url || activeUrl;
    activeTitle = tab.title || activeTitle;
    activeStart = now();
  }
});

chrome.windows.onFocusChanged.addListener(async (winId) => {
  if (winId === chrome.windows.WINDOW_ID_NONE) {
    bufferDwell();
    activeTabId = null;
    activeUrl = null;
    return;
  }
  const [tab] = await chrome.tabs.query({ active: true, windowId: winId });
  if (tab) switchFocus(tab.id);
});

// ---- Idle detection ----

chrome.idle.setDetectionInterval(IDLE_THRESHOLD_SEC);
chrome.idle.onStateChanged.addListener((state) => {
  if (state === "active") {
    userIdle = false;
    activeStart = now();
  } else {
    bufferDwell();
    userIdle = true;
    if (today) today.idleMs += IDLE_THRESHOLD_SEC * 1000;
  }
});

// ---- Messages from content scripts ----

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (!msg) return;
  if (msg.type === "pa-event") {
    handleEvent(msg.payload);
    saveToday();
    sendResponse({ ok: true });
    return;
  }
  if (msg.type === "pa-get-stats") {
    const live = snapshotForOverlay();
    if (!userIdle && activeUrl && activeStart) {
      const extra = now() - activeStart;
      live.activeMs += extra;
      const domain = domainOf(activeUrl);
      if (domain) {
        const pid = platformForDomain(domain);
        if (pid) {
          live.platformMs[pid] = (live.platformMs[pid] || 0) + extra;
          if (live.platforms[pid]) live.platforms[pid].timeMs += extra;
        }
        // Legacy
        if (/linkedin\.com$/i.test(domain)) live.linkedinMs += extra;
        if (/naukri\.com$/i.test(domain)) live.naukriMs += extra;
      }
    }
    sendResponse(live);
    return;
  }
  if (msg.type === "pa-get-config") {
    sendResponse({ platforms: platformConfig || DEFAULT_PLATFORMS });
    return;
  }
  if (msg.type === "pa-get-day") {
    // Dashboard requests a specific day's data.
    const dateKey = msg.date || todayKey();
    if (today && today.date === dateKey) {
      sendResponse(today);
    } else {
      chrome.storage.local.get(`day_${dateKey}`).then((stored) => {
        sendResponse(stored[`day_${dateKey}`] || emptyDay(dateKey));
      });
      return true; // async response
    }
    return;
  }
  if (msg.type === "pa-get-days-list") {
    // Return list of dates that have data.
    chrome.storage.local.get(null).then((all) => {
      const days = Object.keys(all)
        .filter((k) => k.startsWith("day_"))
        .map((k) => k.replace("day_", ""))
        .sort()
        .reverse();
      sendResponse(days);
    });
    return true;
  }
  if (msg.type === "pa-get-range") {
    // Aggregate multiple days for weekly/monthly/all-time summaries.
    chrome.storage.local.get(null).then((all) => {
      const dates = msg.dates || [];
      const agg = {
        activeMs: 0, idleMs: 0, linkedinMs: 0, naukriMs: 0,
        platformMs: {},
        platformProfiles: {},
        platformMetrics: {},
        liProfiles: [], nkProfiles: [],
        liConnections: 0, liMessages: 0, liSearches: 0,
        naukriDownloads: 0, naukriContacts: 0, naukriSearches: 0,
        domains: {}, events: [], dayCount: 0,
      };
      const liProfileSet = new Set();
      const nkProfileSet = new Set();
      const platformProfileSets = {};

      for (const date of dates) {
        const day = date === (today && today.date) ? today : all[`day_${date}`];
        if (!day) continue;
        agg.dayCount++;
        agg.activeMs += day.activeMs || 0;
        agg.idleMs += day.idleMs || 0;
        agg.linkedinMs += day.linkedinMs || 0;
        agg.naukriMs += day.naukriMs || 0;
        agg.liConnections += day.liConnections || 0;
        agg.liMessages += day.liMessages || 0;
        agg.liSearches += day.liSearches || 0;
        agg.naukriDownloads += day.naukriDownloads || 0;
        agg.naukriContacts += day.naukriContacts || 0;
        agg.naukriSearches += day.naukriSearches || 0;
        for (const u of (day.liProfiles || [])) liProfileSet.add(u);
        for (const u of (day.nkProfiles || [])) nkProfileSet.add(u);
        // Aggregate platform data
        for (const [pid, ms] of Object.entries(day.platformMs || {})) {
          agg.platformMs[pid] = (agg.platformMs[pid] || 0) + ms;
        }
        for (const [pid, profiles] of Object.entries(day.platformProfiles || {})) {
          if (!platformProfileSets[pid]) platformProfileSets[pid] = new Set();
          for (const u of profiles) platformProfileSets[pid].add(u);
        }
        for (const [pid, metrics] of Object.entries(day.platformMetrics || {})) {
          if (!agg.platformMetrics[pid]) agg.platformMetrics[pid] = {};
          for (const [k, v] of Object.entries(metrics)) {
            agg.platformMetrics[pid][k] = (agg.platformMetrics[pid][k] || 0) + (v || 0);
          }
        }
        for (const [d, ms] of Object.entries(day.domains || {})) {
          agg.domains[d] = (agg.domains[d] || 0) + ms;
        }
        for (const ev of (day.events || []).slice(-500)) {
          agg.events.push(ev);
        }
      }
      agg.liProfiles = [...liProfileSet];
      agg.nkProfiles = [...nkProfileSet];
      for (const [pid, set] of Object.entries(platformProfileSets)) {
        agg.platformProfiles[pid] = [...set];
      }
      if (agg.events.length > 1000) agg.events = agg.events.slice(-1000);
      agg.platformConfig = platformConfig || DEFAULT_PLATFORMS;
      sendResponse(agg);
    });
    return true;
  }
  if (msg.type === "pa-sync-now") {
    bufferDwell();
    saveToday().then(() => syncToServer()).then((result) => {
      sendResponse(result || { ok: true, synced: 0 });
    });
    return true;
  }
  if (msg.type === "pa-refresh-config") {
    fetchServerConfig().then(() => {
      sendResponse({ ok: true, platforms: platformConfig });
    });
    return true;
  }
});

// ---- Periodic save ----
chrome.alarms.create("pa-save", { periodInMinutes: 0.5 });
chrome.alarms.create("pa-sync", { periodInMinutes: 5 });
chrome.alarms.create("pa-config-refresh", { periodInMinutes: 60 });

chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === "pa-save") {
    bufferDwell();
    await saveToday();
  }
  if (alarm.name === "pa-sync") {
    bufferDwell();
    await saveToday();
    await syncToServer();
  }
  if (alarm.name === "pa-config-refresh") {
    await fetchServerConfig();
  }
});

// ---- Team sync ----
const DEFAULT_SYNC_URL = "https://mats.base44.app/api/functions/syncActivity";

async function getSyncConfig() {
  let managed = {};
  try { managed = await chrome.storage.managed.get(null); } catch {}
  const user = await chrome.storage.sync.get(["syncEnabled", "syncUrl", "syncToken", "memberName", "memberEmail",
    // Legacy field names
    "recruiterName", "recruiterEmail"]);
  return {
    syncEnabled: managed.syncEnabled ?? user.syncEnabled,
    syncUrl: managed.syncUrl || user.syncUrl || DEFAULT_SYNC_URL,
    syncToken: managed.syncToken || user.syncToken,
    memberName: user.memberName || user.recruiterName,
    memberEmail: user.memberEmail || user.recruiterEmail,
  };
}

async function syncToServer() {
  const cfg = await getSyncConfig();
  if (!cfg.syncEnabled || !cfg.syncUrl || !cfg.memberName) return { ok: false, error: "Sync not configured", synced: 0 };

  const dates = [];
  const todayDate = new Date();
  for (let i = 0; i < 7; i++) {
    const d = new Date(todayDate);
    d.setDate(d.getDate() - i);
    dates.push(d.toISOString().slice(0, 10));
  }

  const all = await chrome.storage.local.get(null);
  const headers = { "Content-Type": "application/json" };
  if (cfg.syncToken) {
    headers["X-API-Key"] = cfg.syncToken;
    headers["Authorization"] = `Bearer ${cfg.syncToken}`;
  }

  let lastError = null;
  let synced = 0;

  for (const date of dates) {
    const day = (today && today.date === date) ? today : all[`day_${date}`];
    if (!day) continue;

    const events = day.events || [];

    // Build drill-down arrays from events, grouped by platform
    const profilesByPlatform = {};
    const connectionsList = [];
    const messagesList = [];
    const downloadsList = [];
    const contactsList = [];

    for (const e of events) {
      const pid = platformForSource(e.source) || e.source;
      if (e.type === "profile_viewed" && e.profile_url) {
        if (!profilesByPlatform[pid]) profilesByPlatform[pid] = new Map();
        const map = profilesByPlatform[pid];
        const prev = map.get(e.profile_url);
        if (!prev) {
          map.set(e.profile_url, { url: e.profile_url, name: e.profile_name || "", title: e.profile_title || "", views: 1, firstSeen: e.ts || e._ts, lastSeen: e.ts || e._ts });
        } else {
          prev.views++;
          if (e.profile_name) prev.name = e.profile_name;
          if (e.profile_title) prev.title = e.profile_title;
          prev.lastSeen = e.ts || e._ts;
        }
      }
      if (e.type === "connection_sent") {
        connectionsList.push({ platform: pid, name: e.profile_name || "", title: e.profile_title || "", url: e.profile_url || "", ts: e.ts || e._ts });
      }
      if (e.type === "message_sent") {
        messagesList.push({ platform: pid, name: e.profile_name || "", url: e.profile_url || "", ts: e.ts || e._ts });
      }
      if (e.type === "cv_downloaded") {
        downloadsList.push({ platform: pid, name: e.profile_name || "", title: e.profile_title || "", url: e.profile_url || "", ts: e.ts || e._ts });
      }
      if (e.type === "contact_viewed") {
        contactsList.push({ platform: pid, name: e.profile_name || "", url: e.profile_url || "", ts: e.ts || e._ts });
      }
    }

    // Flatten profile maps
    const profilesDrillDown = {};
    for (const [pid, map] of Object.entries(profilesByPlatform)) {
      profilesDrillDown[pid] = [...map.values()];
    }

    const allDomains = Object.entries(day.domains || {}).sort((a, b) => b[1] - a[1]).map(([d, ms]) => ({ domain: d, ms }));

    const eventTimeline = events.slice(-500).map(e => ({
      ts: e.ts || e._ts,
      source: e.source || "",
      type: e.type || "",
      profileName: e.profile_name || "",
      profileTitle: e.profile_title || "",
      profileUrl: e.profile_url || "",
    }));

    // New format: generic platform data
    const payload = {
      memberName: cfg.memberName,
      memberEmail: cfg.memberEmail || "",
      // Legacy fields for backward compat
      recruiterName: cfg.memberName,
      recruiterEmail: cfg.memberEmail || "",
      date: day.date,
      activeMs: day.activeMs || 0,
      idleMs: day.idleMs || 0,
      // Per-platform time in ms
      platformTimes: day.platformMs || {},
      // Per-platform metrics
      platformMetrics: day.platformMetrics || {},
      // Per-platform profile counts
      platformProfileCounts: {},
      // Legacy flat fields (for old Base44 app compat)
      linkedinMs: day.linkedinMs || 0,
      naukriMs: day.naukriMs || 0,
      liProfilesCount: (day.liProfiles || []).length,
      nkProfilesCount: (day.nkProfiles || []).length,
      liConnections: day.liConnections || 0,
      liMessages: day.liMessages || 0,
      liSearches: day.liSearches || 0,
      naukriDownloads: day.naukriDownloads || 0,
      naukriContacts: day.naukriContacts || 0,
      naukriSearches: day.naukriSearches || 0,
      // Drill-down detail data
      allDomains,
      profilesDrillDown,
      connectionsList,
      messagesList,
      downloadsList,
      contactsList,
      // Legacy drill-down names
      liProfiles: profilesDrillDown["linkedin"] || [],
      liConnectionsList: connectionsList.filter(c => c.platform === "linkedin"),
      liMessagesList: messagesList.filter(m => m.platform === "linkedin"),
      nkProfiles: profilesDrillDown["naukri"] || [],
      nkDownloadsList: downloadsList.filter(d => d.platform === "naukri"),
      nkContactsList: contactsList.filter(c => c.platform === "naukri"),
      eventTimeline,
      extensionVersion: chrome.runtime.getManifest().version,
      syncedAt: new Date().toISOString(),
    };

    // Fill platformProfileCounts
    for (const [pid, profiles] of Object.entries(day.platformProfiles || {})) {
      payload.platformProfileCounts[pid] = profiles.length;
    }

    try {
      const res = await fetch(cfg.syncUrl, { method: "POST", headers, body: JSON.stringify(payload) });
      if (res.ok) {
        synced++;
      } else {
        lastError = `HTTP ${res.status}`;
      }
    } catch (e) {
      lastError = e.message;
    }
  }

  if (synced > 0 && !lastError) {
    await chrome.storage.local.set({ lastSyncTime: Date.now(), lastSyncError: null });
  } else if (lastError) {
    await chrome.storage.local.set({ lastSyncTime: Date.now(), lastSyncError: lastError });
  }
  return { ok: !lastError, synced, error: lastError };
}

// ---- Boot ----
(async () => {
  await loadPlatformConfig();
  await loadToday();
  const tabs = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
  if (tabs[0]) switchFocus(tabs[0].id);
})();
