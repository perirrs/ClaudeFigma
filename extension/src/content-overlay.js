// Floating, draggable, translucent stats overlay. Injected on every page.
// Polls the background worker every 3s for today's snapshot. Dynamically
// renders platform sections based on config fetched from the server.
// Position is persisted per-user in chrome.storage.local, visibility is
// controlled via chrome.storage.sync ("showOverlay") and a per-tab close.

(function () {
  if (window.self !== window.top) return;
  if (!document.documentElement) return;
  if (document.getElementById("pa-overlay-root")) return;

  const HOST_ID = "pa-overlay-root";
  const POLL_MS = 3000;
  const STORAGE_POS = "pa_overlay_pos";
  const STORAGE_COLLAPSED = "pa_overlay_collapsed";
  const STORAGE_OPACITY = "pa_overlay_opacity";

  const host = document.createElement("div");
  host.id = HOST_ID;
  const HOST_STYLE =
    "all: initial !important;" +
    "position: fixed !important;" +
    "top: 20px !important;" +
    "right: 20px !important;" +
    "width: 0 !important;" +
    "height: 0 !important;" +
    "z-index: 2147483647 !important;" +
    "display: block !important;" +
    "pointer-events: auto !important;" +
    "visibility: visible !important;" +
    "opacity: 1 !important;";
  host.setAttribute("style", HOST_STYLE);
  const shadow = host.attachShadow({ mode: "open" });

  const style = document.createElement("style");
  style.textContent = `
    :host, * { box-sizing: border-box; }
    .wrap {
      position: fixed; top: 20px; right: 20px; z-index: 2147483647;
      width: 232px; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      color: #e6edf3; font-size: 12px; line-height: 1.4;
      background: rgba(13, 20, 28, 0.92);
      border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 10px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.35), 0 0 0 1px rgba(74,222,128,0.06) inset;
      user-select: none;
    }
    .wrap.collapsed { width: auto; }
    .head {
      display: flex; align-items: center; gap: 8px; padding: 8px 10px;
      cursor: grab; border-bottom: 1px solid rgba(255,255,255,0.06);
    }
    .wrap.collapsed .head { border-bottom: none; }
    .head.dragging { cursor: grabbing; }
    .dot { width: 6px; height: 6px; border-radius: 50%; background: #4ade80; box-shadow: 0 0 8px rgba(74,222,128,0.6); }
    .title { font-size: 10px; text-transform: uppercase; letter-spacing: 0.1em; color: #8b98a5; flex: 1; }
    .btn {
      background: transparent; border: none; color: #8b98a5; cursor: pointer; padding: 2px 5px;
      font-size: 12px; border-radius: 3px; line-height: 1;
    }
    .btn:hover { background: rgba(255,255,255,0.06); color: #e6edf3; }
    .opacity-bar {
      display: flex; align-items: center; gap: 6px; padding: 4px 10px;
      border-bottom: 1px solid rgba(255,255,255,0.06);
    }
    .wrap.collapsed .opacity-bar { display: none; }
    .opacity-bar label { font-size: 9px; color: #8b98a5; text-transform: uppercase; letter-spacing: 0.06em; white-space: nowrap; }
    .opacity-bar input[type="range"] {
      -webkit-appearance: none; appearance: none; flex: 1; height: 3px;
      background: rgba(255,255,255,0.12); border-radius: 2px; outline: none; cursor: pointer;
    }
    .opacity-bar input[type="range"]::-webkit-slider-thumb {
      -webkit-appearance: none; width: 10px; height: 10px; border-radius: 50%;
      background: #4ade80; cursor: pointer;
    }
    .body { padding: 8px 10px 10px; }
    .section { margin-bottom: 8px; }
    .section:last-child { margin-bottom: 0; }
    .section-head { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 4px; }
    .label { font-size: 11px; font-weight: 600; }
    .big { font-size: 15px; font-weight: 700; font-variant-numeric: tabular-nums; }
    .rows { display: flex; flex-direction: column; gap: 3px; font-size: 11px; color: #8b98a5; }
    .row { display: flex; justify-content: space-between; align-items: baseline; }
    .row span:first-child { color: #8b98a5; }
    .row b { color: #e6edf3; font-weight: 600; font-variant-numeric: tabular-nums; }
    .sep { height: 1px; background: rgba(255,255,255,0.05); margin: 6px 0; }
    .off { padding: 10px 12px; color: #8b98a5; font-size: 11px; }
    .wrap.collapsed .body { display: none; }
  `;
  shadow.appendChild(style);

  const wrap = document.createElement("div");
  wrap.className = "wrap";
  wrap.innerHTML = `
    <div class="head" id="head">
      <div class="dot"></div>
      <div class="title">Today</div>
      <button class="btn" id="toggle" title="Collapse / expand">\u2014</button>
      <button class="btn" id="close" title="Hide for this session">\u00d7</button>
    </div>
    <div class="opacity-bar">
      <label>Opacity</label>
      <input type="range" id="opacity-slider" min="10" max="100" value="92" />
    </div>
    <div class="body" id="body">
      <div class="section">
        <div class="section-head">
          <span class="label" style="color:#e6edf3">Browser</span>
          <span class="big" id="all-time">0m</span>
        </div>
      </div>
      <div id="platform-sections"></div>
    </div>
  `;
  shadow.appendChild(wrap);
  document.documentElement.appendChild(host);
  try { console.log("[PA] overlay injected on", location.hostname); } catch {}

  let closedManually = false;
  const reattachObserver = new MutationObserver(() => {
    if (closedManually) return;
    if (!document.documentElement) return;
    if (!document.documentElement.contains(host)) {
      try { document.documentElement.appendChild(host); } catch {}
    }
  });
  reattachObserver.observe(document.documentElement, { childList: true, subtree: false });

  const styleObserver = new MutationObserver(() => {
    if (closedManually) return;
    if (host.getAttribute("style") !== HOST_STYLE) {
      host.setAttribute("style", HOST_STYLE);
    }
  });
  styleObserver.observe(host, { attributes: true, attributeFilter: ["style"] });

  function extensionAlive() {
    try { return !!(chrome && chrome.runtime && chrome.runtime.id); } catch { return false; }
  }
  function safeStorageGet(keys) {
    if (!extensionAlive()) return Promise.resolve({});
    try {
      const p = chrome.storage.local.get(keys);
      return p && typeof p.then === "function" ? p.catch(() => ({})) : Promise.resolve({});
    } catch { return Promise.resolve({}); }
  }
  function safeStorageSet(obj) {
    if (!extensionAlive()) return;
    try {
      const p = chrome.storage.local.set(obj);
      if (p && typeof p.then === "function") p.catch(() => {});
    } catch {}
  }

  // ---- Position persistence + drag ----
  const head = shadow.getElementById("head");
  const opacitySlider = shadow.getElementById("opacity-slider");

  safeStorageGet([STORAGE_POS, STORAGE_COLLAPSED, STORAGE_OPACITY]).then((v) => {
    const pos = v[STORAGE_POS];
    if (pos && typeof pos.left === "number" && typeof pos.top === "number") {
      wrap.style.left = pos.left + "px";
      wrap.style.top = pos.top + "px";
      wrap.style.right = "auto";
    }
    if (v[STORAGE_COLLAPSED]) wrap.classList.add("collapsed");
    const op = v[STORAGE_OPACITY];
    if (op != null) {
      opacitySlider.value = op;
      wrap.style.opacity = (op / 100).toString();
    }
  });

  opacitySlider.addEventListener("input", () => {
    const val = parseInt(opacitySlider.value, 10);
    wrap.style.opacity = (val / 100).toString();
    safeStorageSet({ [STORAGE_OPACITY]: val });
  });

  let dragging = false, startX = 0, startY = 0, startLeft = 0, startTop = 0;
  head.addEventListener("mousedown", (e) => {
    if (e.target instanceof HTMLElement && e.target.classList.contains("btn")) return;
    dragging = true;
    head.classList.add("dragging");
    const rect = wrap.getBoundingClientRect();
    wrap.style.left = rect.left + "px";
    wrap.style.top = rect.top + "px";
    wrap.style.right = "auto";
    startX = e.clientX; startY = e.clientY;
    startLeft = rect.left; startTop = rect.top;
    e.preventDefault();
  });
  window.addEventListener("mousemove", (e) => {
    if (!dragging) return;
    let left = startLeft + (e.clientX - startX);
    let top = startTop + (e.clientY - startY);
    const maxL = window.innerWidth - wrap.offsetWidth - 4;
    const maxT = window.innerHeight - wrap.offsetHeight - 4;
    left = Math.max(4, Math.min(maxL, left));
    top = Math.max(4, Math.min(maxT, top));
    wrap.style.left = left + "px";
    wrap.style.top = top + "px";
  });
  window.addEventListener("mouseup", () => {
    if (!dragging) return;
    dragging = false;
    head.classList.remove("dragging");
    safeStorageSet({ [STORAGE_POS]: { left: parseInt(wrap.style.left, 10), top: parseInt(wrap.style.top, 10) } });
  });

  // ---- Toggle + close ----
  shadow.getElementById("toggle").addEventListener("click", () => {
    wrap.classList.toggle("collapsed");
    safeStorageSet({ [STORAGE_COLLAPSED]: wrap.classList.contains("collapsed") });
  });
  shadow.getElementById("close").addEventListener("click", () => {
    closedManually = true;
    host.remove();
    clearInterval(pollTimer);
    reattachObserver.disconnect();
    styleObserver.disconnect();
  });

  // ---- Data polling ----
  function fmt(ms) {
    if (!ms || ms < 0) ms = 0;
    const s = Math.floor(ms / 1000), h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60);
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  }

  // Metric labels for display
  const METRIC_LABELS = {
    profiles: "Profiles viewed",
    connections: "Connections sent",
    messages: "Messages sent",
    searches: "Searches",
    downloads: "CVs downloaded",
    contacts: "Contacts revealed",
  };

  let lastPlatformConfig = null;

  function buildPlatformSections(platforms, platformConfig) {
    const container = shadow.getElementById("platform-sections");
    if (!container) return;

    // Only rebuild DOM if config changed
    const configKey = JSON.stringify((platformConfig || []).map(p => p.id));
    if (configKey === lastPlatformConfig) return;
    lastPlatformConfig = configKey;

    container.innerHTML = "";

    for (const p of (platformConfig || [])) {
      const section = document.createElement("div");
      section.innerHTML = `
        <div class="sep"></div>
        <div class="section">
          <div class="section-head">
            <span class="label" style="color:${p.color || '#8b98a5'}">${p.name}</span>
            <span class="big" id="p-time-${p.id}">0m</span>
          </div>
          <div class="rows" id="p-metrics-${p.id}"></div>
        </div>
      `;
      container.appendChild(section);
    }
  }

  function updatePlatformData(snap) {
    const platforms = snap.platforms || {};
    const platformConfig = snap.platformConfig || [];

    buildPlatformSections(platforms, platformConfig);

    for (const p of platformConfig) {
      const timeEl = shadow.getElementById(`p-time-${p.id}`);
      const metricsEl = shadow.getElementById(`p-metrics-${p.id}`);
      if (!timeEl || !metricsEl) continue;

      const data = platforms[p.id] || {};
      timeEl.textContent = fmt(data.timeMs || 0);

      const metrics = data.metrics || {};
      const rows = [];
      for (const m of (p.metrics || [])) {
        const label = METRIC_LABELS[m] || m;
        const val = m === "profiles" ? (data.profileCount || 0) : (metrics[m] || 0);
        rows.push(`<div class="row"><span>${label}</span><b>${val}</b></div>`);
      }
      metricsEl.innerHTML = rows.join("");
    }
  }

  async function refresh() {
    if (!extensionAlive()) { return; }
    try {
      const snap = await chrome.runtime.sendMessage({ type: "pa-get-stats" });
      if (!snap) return;
      shadow.getElementById("all-time").textContent = fmt(snap.activeMs);
      updatePlatformData(snap);
    } catch {
      // extension reloaded / SW dead - next tick will reconnect
    }
  }
  refresh();
  const pollTimer = setInterval(refresh, POLL_MS);
})();
