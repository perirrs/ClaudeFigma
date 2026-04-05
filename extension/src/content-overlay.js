// Floating, draggable, translucent stats overlay. Injected on every page.
// Polls the background worker every 3s for today's snapshot. Position is
// persisted per-user in chrome.storage.local, visibility is controlled via
// chrome.storage.sync ("showOverlay") and a per-tab local "paCollapsed".

(function () {
  // Don't inject into frames, chrome-internal pages, or PDFs.
  if (window.self !== window.top) return;
  if (!document.body) return;
  if (document.getElementById("pa-overlay-root")) return;

  const HOST_ID = "pa-overlay-root";
  const POLL_MS = 3000;
  const STORAGE_POS = "pa_overlay_pos";
  const STORAGE_COLLAPSED = "pa_overlay_collapsed";

  const host = document.createElement("div");
  host.id = HOST_ID;
  // Isolate styles from the host page with a shadow DOM.
  const shadow = host.attachShadow({ mode: "open" });

  const style = document.createElement("style");
  style.textContent = `
    :host, * { box-sizing: border-box; }
    .wrap {
      position: fixed; top: 20px; right: 20px; z-index: 2147483647;
      width: 232px; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      color: #e6edf3; font-size: 12px; line-height: 1.4;
      background: rgba(13, 20, 28, 0.72); backdrop-filter: blur(14px) saturate(140%);
      -webkit-backdrop-filter: blur(14px) saturate(140%);
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
    .body { padding: 8px 10px 10px; }
    .section { margin-bottom: 8px; }
    .section:last-child { margin-bottom: 0; }
    .section-head { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 4px; }
    .label { font-size: 11px; font-weight: 600; }
    .label.all { color: #e6edf3; }
    .label.li { color: #4ade80; }
    .label.nk { color: #60a5fa; }
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
      <button class="btn" id="toggle" title="Collapse / expand">—</button>
      <button class="btn" id="close" title="Hide for this session">×</button>
    </div>
    <div class="body" id="body">
      <div class="section">
        <div class="section-head">
          <span class="label all">Browser</span>
          <span class="big" id="all-time">0m</span>
        </div>
      </div>
      <div class="sep"></div>
      <div class="section">
        <div class="section-head">
          <span class="label li">LinkedIn</span>
          <span class="big" id="li-time">0m</span>
        </div>
        <div class="rows">
          <div class="row"><span>Profiles viewed</span><b id="li-prof">0</b></div>
          <div class="row"><span>Connections sent</span><b id="li-conn">0</b></div>
          <div class="row"><span>Messages sent</span><b id="li-msg">0</b></div>
        </div>
      </div>
      <div class="sep"></div>
      <div class="section">
        <div class="section-head">
          <span class="label nk">Naukri</span>
          <span class="big" id="nk-time">0m</span>
        </div>
        <div class="rows">
          <div class="row"><span>Profiles viewed</span><b id="nk-prof">0</b></div>
          <div class="row"><span>CVs downloaded</span><b id="nk-dl">0</b></div>
        </div>
      </div>
    </div>
  `;
  shadow.appendChild(wrap);
  document.body.appendChild(host);

  // ---- Position persistence + drag ----
  const head = shadow.getElementById("head");
  chrome.storage.local.get([STORAGE_POS, STORAGE_COLLAPSED]).then((v) => {
    const pos = v[STORAGE_POS];
    if (pos && typeof pos.left === "number" && typeof pos.top === "number") {
      wrap.style.left = pos.left + "px";
      wrap.style.top = pos.top + "px";
      wrap.style.right = "auto";
    }
    if (v[STORAGE_COLLAPSED]) wrap.classList.add("collapsed");
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
    chrome.storage.local.set({ [STORAGE_POS]: { left: parseInt(wrap.style.left, 10), top: parseInt(wrap.style.top, 10) } });
  });

  // ---- Toggle + close ----
  shadow.getElementById("toggle").addEventListener("click", () => {
    wrap.classList.toggle("collapsed");
    chrome.storage.local.set({ [STORAGE_COLLAPSED]: wrap.classList.contains("collapsed") });
  });
  shadow.getElementById("close").addEventListener("click", () => {
    host.remove();
    clearInterval(pollTimer);
  });

  // ---- Data polling ----
  function fmt(ms) {
    if (!ms || ms < 0) ms = 0;
    const s = Math.floor(ms / 1000), h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60);
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  }

  function extensionAlive() {
    try { return !!(chrome && chrome.runtime && chrome.runtime.id); } catch { return false; }
  }

  async function refresh() {
    if (!extensionAlive()) { clearInterval(pollTimer); host.remove(); return; }
    try {
      const snap = await chrome.runtime.sendMessage({ type: "pa-get-stats" });
      if (!snap) return;
      if (snap.showOverlay === false) { host.style.display = "none"; return; }
      host.style.display = "";
      shadow.getElementById("all-time").textContent = fmt(snap.activeMs);
      shadow.getElementById("li-time").textContent = fmt(snap.linkedinMs);
      shadow.getElementById("nk-time").textContent = fmt(snap.naukriMs);
      shadow.getElementById("li-prof").textContent = snap.liUniqueProfiles;
      shadow.getElementById("li-conn").textContent = snap.liConnections;
      shadow.getElementById("li-msg").textContent = snap.liMessages;
      shadow.getElementById("nk-prof").textContent = snap.nkUniqueProfiles;
      shadow.getElementById("nk-dl").textContent = snap.nkDownloads;
    } catch {
      // extension reloaded / SW dead - next tick will reconnect
    }
  }
  refresh();
  const pollTimer = setInterval(refresh, POLL_MS);
})();
