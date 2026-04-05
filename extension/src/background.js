// Service worker - tracks per-URL dwell time and forwards events to the
// cloud API. Config (cloud URL + API key) comes from chrome.storage.sync.
//
// Records are buffered locally and flushed in batches every ~30s, so short
// network outages don't lose data.

const DEFAULT_CONFIG = { cloudUrl: "http://localhost:3000", apiKey: "" };
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

function now() { return Date.now(); }
function domainOf(url) {
  if (!url) return null;
  try { return new URL(url).hostname.replace(/^www\./, ""); } catch { return null; }
}

async function loadConfig() {
  const stored = await chrome.storage.sync.get(["cloudUrl", "apiKey"]);
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
}

function bufferDwell() {
  if (!activeUrl || userIdle || activeStart == null) return;
  const ms = now() - activeStart;
  if (ms < 1000) return;
  activeStart = now();
  dwellBuf.push({
    ts: now(),
    url: activeUrl,
    domain: domainOf(activeUrl),
    title: activeTitle,
    dwell_ms: ms,
  });
  if (dwellBuf.length > MAX_BUFFER) dwellBuf = dwellBuf.slice(-MAX_BUFFER);
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

// Content-script events → buffer.
chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg && msg.type === "pa-event") {
    eventBuf.push(msg.payload);
    if (eventBuf.length > MAX_BUFFER) eventBuf = eventBuf.slice(-MAX_BUFFER);
    sendResponse({ ok: true });
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
loadConfig().then(async () => {
  const tabs = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
  if (tabs[0]) switchFocus(tabs[0].id);
});
