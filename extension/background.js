// Background service worker - tracks dwell time per tab/URL and forwards
// both dwell samples and content-script events to the desktop app's bridge.

const BRIDGE_URL = "http://127.0.0.1:47624";
const DWELL_FLUSH_MS = 15000; // every 15s push the active tab's accumulated dwell
const IDLE_THRESHOLD_SEC = 60;

let activeTabId = null;
let activeUrl = null;
let activeTitle = null;
let activeStart = null;
let userIdle = false;

function now() { return Date.now(); }

function domainOf(url) {
  if (!url) return null;
  try { return new URL(url).hostname.replace(/^www\./, ""); } catch { return null; }
}

async function postJson(path, body) {
  try {
    await fetch(`${BRIDGE_URL}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch {
    // desktop app may not be running - swallow
  }
}

async function flushDwell() {
  if (!activeUrl || userIdle || activeStart == null) return;
  const ms = now() - activeStart;
  if (ms < 1000) return;
  activeStart = now();
  await postJson("/dwell", {
    ts: now(),
    url: activeUrl,
    domain: domainOf(activeUrl),
    title: activeTitle,
    dwell_ms: ms,
  });
}

async function switchFocus(tabId) {
  await flushDwell();
  activeTabId = tabId;
  activeStart = now();
  if (tabId == null) { activeUrl = null; activeTitle = null; return; }
  try {
    const tab = await chrome.tabs.get(tabId);
    activeUrl = tab.url || null;
    activeTitle = tab.title || null;
  } catch {
    activeUrl = null; activeTitle = null;
  }
}

chrome.tabs.onActivated.addListener(({ tabId }) => switchFocus(tabId));

chrome.tabs.onUpdated.addListener((tabId, info, tab) => {
  if (tabId !== activeTabId) return;
  if (info.url || info.title) {
    flushDwell().then(() => {
      activeUrl = tab.url || activeUrl;
      activeTitle = tab.title || activeTitle;
      activeStart = now();
    });
  }
});

chrome.windows.onFocusChanged.addListener(async (winId) => {
  if (winId === chrome.windows.WINDOW_ID_NONE) {
    await flushDwell();
    activeTabId = null;
    activeUrl = null;
    return;
  }
  const [tab] = await chrome.tabs.query({ active: true, windowId: winId });
  if (tab) switchFocus(tab.id);
});

chrome.idle.setDetectionInterval(IDLE_THRESHOLD_SEC);
chrome.idle.onStateChanged.addListener(async (state) => {
  if (state === "active") {
    userIdle = false;
    activeStart = now();
  } else {
    await flushDwell();
    userIdle = true;
  }
});

setInterval(flushDwell, DWELL_FLUSH_MS);

// Relay events emitted by content scripts.
chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg && msg.type === "pa-event") {
    postJson("/event", msg.payload).then(() => sendResponse({ ok: true }));
    return true; // async
  }
});

// Initial focus capture on install.
chrome.tabs.query({ active: true, lastFocusedWindow: true }).then((tabs) => {
  if (tabs[0]) switchFocus(tabs[0].id);
});
