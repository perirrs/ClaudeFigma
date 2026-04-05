// Service worker - tracks per-URL dwell time and forwards events to the
// cloud API. Config (cloud URL + API key) comes from chrome.storage.sync.
//
// Records are buffered locally and flushed in batches every ~30s, so short
// network outages don't lose data. In parallel we maintain a rolling
// `todaySnapshot` that the on-page overlay reads for live stats.

const DEFAULT_CONFIG = { cloudUrl: "http://localhost:3000", apiKey: "", showOverlay: true };
const DWELL_FLUSH_MS = 30_000;
const IDLE_THRESHOLD_SEC = 60;
const MAX_BUFFER = 500;

let cfg = DEFAULT_CONFIG;
let activeTabId = null;
let activeUrl = null;
let activeTitle = null;
let activeStart = null;
let userIdle = false;

// Buffered outbound records.
let dwellBuf = [];
let eventBuf = [];

// Live-today snapshot, persisted so a service-worker restart doesn't lose it.
let today = null; // { date, linkedinMs, naukriMs, liProfiles:Set, nkProfiles:Set, liConnections, liMessages, nkDownloads }

function now() { return Date.now(); }
function domainOf(url) {
  if (!url) return null;
  try { return new URL(url).hostname.replace(/^www\./, ""); } catch { return null; }
}
function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function emptySnapshot(date) {
  return { date, activeMs: 0, linkedinMs: 0, naukriMs: 0, liProfiles: [], nkProfiles: [], liConnections: 0, liMessages: 0, nkDownloads: 0 };
}

async function loadSnapshot() {
  const { pa_today } = await chrome.storage.local.get("pa_today");
  const key = todayKey();
  if (pa_today && pa_today.date === key) today = pa_today;
  else today = emptySnapshot(key);
}
async function saveSnapshot() {
  if (!today) return;
  // Ensure day rollover resets the counters.
  const key = todayKey();
  if (today.date !== key) today = emptySnapshot(key);
  await chrome.storage.local.set({ pa_today: today });
}

function bumpDomainTime(domain, ms) {
  if (!today || !ms) return;
  today.activeMs += ms;
  if (!domain) return;
  if (/linkedin\.com$/i.test(domain)) today.linkedinMs += ms;
  if (/naukri\.com$/i.test(domain)) today.naukriMs += ms;
}
function bumpEvent(ev) {
  if (!today || !ev) return;
  if (ev.source === "linkedin") {
    if (ev.type === "profile_viewed" && ev.profile_url) {
      if (!today.liProfiles.includes(ev.profile_url)) today.liProfiles.push(ev.profile_url);
    }
    if (ev.type === "connection_sent") today.liConnections += 1;
    if (ev.type === "message_sent") today.liMessages += 1;
  } else if (ev.source === "naukri") {
    if (ev.type === "profile_viewed" && ev.profile_url) {
      if (!today.nkProfiles.includes(ev.profile_url)) today.nkProfiles.push(ev.profile_url);
    }
    if (ev.type === "cv_downloaded") today.nkDownloads += 1;
  }
}
function snapshotForOverlay() {
  if (!today || today.date !== todayKey()) today = emptySnapshot(todayKey());
  return {
    date: today.date,
    activeMs: today.activeMs,
    linkedinMs: today.linkedinMs,
    naukriMs: today.naukriMs,
    liUniqueProfiles: today.liProfiles.length,
    nkUniqueProfiles: today.nkProfiles.length,
    liConnections: today.liConnections,
    liMessages: today.liMessages,
    nkDownloads: today.nkDownloads,
    showOverlay: cfg.showOverlay !== false,
  };
}

async function loadConfig() {
  const stored = await chrome.storage.sync.get(["cloudUrl", "apiKey", "showOverlay"]);
  cfg = { ...DEFAULT_CONFIG, ...stored };
}
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === "sync") loadConfig();
});

async function push(path, batch) {
  if (!cfg.apiKey || !cfg.cloudUrl) return false;
  try {
    const r = await fetch(`${cfg.cloudUrl}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-PA-Key": cfg.apiKey },
      body: JSON.stringify(batch),
    });
    return r.ok;
  } catch {
    return false;
  }
}

async function flush() {
  if (dwellBuf.length) {
    const batch = dwellBuf.splice(0, dwellBuf.length);
    const ok = await push("/api/ingest/dwell", batch);
    if (!ok) dwellBuf = [...batch, ...dwellBuf].slice(0, MAX_BUFFER);
  }
  if (eventBuf.length) {
    const batch = eventBuf.splice(0, eventBuf.length);
    const ok = await push("/api/ingest/event", batch);
    if (!ok) eventBuf = [...batch, ...eventBuf].slice(0, MAX_BUFFER);
  }
  await saveSnapshot();
}

function bufferDwell() {
  if (!activeUrl || userIdle || activeStart == null) return;
  const ms = now() - activeStart;
  if (ms < 1000) return;
  activeStart = now();
  const domain = domainOf(activeUrl);
  dwellBuf.push({ ts: now(), url: activeUrl, domain, title: activeTitle, dwell_ms: ms });
  if (dwellBuf.length > MAX_BUFFER) dwellBuf = dwellBuf.slice(-MAX_BUFFER);
  bumpDomainTime(domain, ms);
}

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

chrome.idle.setDetectionInterval(IDLE_THRESHOLD_SEC);
chrome.idle.onStateChanged.addListener((state) => {
  if (state === "active") {
    userIdle = false;
    activeStart = now();
  } else {
    bufferDwell();
    userIdle = true;
    // Emit an idle marker sample so the server can count idle time too.
    dwellBuf.push({ ts: now(), url: null, domain: null, title: null, dwell_ms: IDLE_THRESHOLD_SEC * 1000, idle: true });
  }
});

// Messages from content scripts.
chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (!msg) return;
  if (msg.type === "pa-event") {
    eventBuf.push(msg.payload);
    if (eventBuf.length > MAX_BUFFER) eventBuf = eventBuf.slice(-MAX_BUFFER);
    bumpEvent(msg.payload);
    sendResponse({ ok: true });
    return;
  }
  if (msg.type === "pa-get-stats") {
    // Account for the time accrued since last bufferDwell() so the overlay
    // ticks up in real time.
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
});

// Periodic flush via alarms (works even when service worker sleeps).
chrome.alarms.create("pa-flush", { periodInMinutes: 0.5 });
chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === "pa-flush") {
    bufferDwell();
    await flush();
  }
});

// Boot.
(async () => {
  await loadConfig();
  await loadSnapshot();
  const tabs = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
  if (tabs[0]) switchFocus(tabs[0].id);
})();
