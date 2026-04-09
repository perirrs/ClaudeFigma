// Service worker — 100% local, no server needed.
// Tracks per-URL dwell time via tab focus events, plus events from content
// scripts (profile views, connections, messages, CV downloads, searches).
// All data lives in chrome.storage.local, keyed by date.

const IDLE_THRESHOLD_SEC = 60;

let activeTabId = null;
let activeUrl = null;
let activeTitle = null;
let activeStart = null;
let userIdle = false;

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
    linkedinMs: 0, naukriMs: 0,
    liProfiles: [],   // unique profile URLs
    nkProfiles: [],
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
    if (/linkedin\.com$/i.test(domain)) today.linkedinMs += ms;
    if (/naukri\.com$/i.test(domain)) today.naukriMs += ms;
  }
}

// ---- Event handling ----

function handleEvent(ev) {
  if (!today || !ev) return;
  // Store in event log for dashboard detail view.
  today.events.push({ ...ev, _ts: Date.now() });

  if (ev.source === "linkedin") {
    if (ev.type === "profile_viewed" && ev.profile_url) {
      if (!today.liProfiles.includes(ev.profile_url)) today.liProfiles.push(ev.profile_url);
    }
    if (ev.type === "connection_sent") today.liConnections += 1;
    if (ev.type === "message_sent") today.liMessages += 1;
    if (ev.type === "search_ran") today.liSearches += 1;
  } else if (ev.source === "naukri") {
    if (ev.type === "profile_viewed" && ev.profile_url) {
      if (!today.nkProfiles.includes(ev.profile_url)) today.nkProfiles.push(ev.profile_url);
    }
    if (ev.type === "cv_downloaded") today.naukriDownloads += 1;
    if (ev.type === "contact_viewed") today.naukriContacts += 1;
    if (ev.type === "search_ran") today.naukriSearches += 1;
  }
}

function snapshotForOverlay() {
  if (!today || today.date !== todayKey()) today = emptyDay(todayKey());
  return {
    date: today.date,
    activeMs: today.activeMs,
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
      if (domain && /linkedin\.com$/i.test(domain)) live.linkedinMs += extra;
      if (domain && /naukri\.com$/i.test(domain)) live.naukriMs += extra;
    }
    sendResponse(live);
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
    // msg.dates = array of date strings to aggregate
    chrome.storage.local.get(null).then((all) => {
      const dates = msg.dates || [];
      const agg = {
        activeMs: 0, idleMs: 0, linkedinMs: 0, naukriMs: 0,
        liProfiles: [], nkProfiles: [],
        liConnections: 0, liMessages: 0, liSearches: 0,
        naukriDownloads: 0, naukriContacts: 0, naukriSearches: 0,
        domains: {}, events: [], dayCount: 0,
      };
      const liProfileSet = new Set();
      const nkProfileSet = new Set();
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
        for (const [d, ms] of Object.entries(day.domains || {})) {
          agg.domains[d] = (agg.domains[d] || 0) + ms;
        }
        // Include last 500 events per range request.
        for (const ev of (day.events || []).slice(-500)) {
          agg.events.push(ev);
        }
      }
      agg.liProfiles = [...liProfileSet];
      agg.nkProfiles = [...nkProfileSet];
      // Cap events.
      if (agg.events.length > 1000) agg.events = agg.events.slice(-1000);
      sendResponse(agg);
    });
    return true;
  }
});

// ---- Periodic save ----
chrome.alarms.create("pa-save", { periodInMinutes: 0.5 });
chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === "pa-save") {
    bufferDwell();
    await saveToday();
  }
});

// ---- Boot ----
(async () => {
  await loadToday();
  const tabs = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
  if (tabs[0]) switchFocus(tabs[0].id);
})();
