function fmt(ms) {
  if (!ms || ms < 0) ms = 0;
  const s = Math.floor(ms / 1000), h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

const METRIC_LABELS = {
  profiles: "Profiles",
  connections: "Connections",
  messages: "Messages",
  searches: "Searches",
  downloads: "CVs",
  contacts: "Contacts",
};

let builtPlatforms = null;

function buildPlatformUI(platformConfig) {
  const key = JSON.stringify((platformConfig || []).map(p => p.id));
  if (key === builtPlatforms) return;
  builtPlatforms = key;

  // Add platform time KPIs
  const kpiGrid = document.getElementById("kpi-grid");
  // Remove old platform KPIs (keep first 2: active + idle)
  const existingKpis = kpiGrid.querySelectorAll(".kpi-platform");
  existingKpis.forEach(el => el.remove());

  for (const p of (platformConfig || [])) {
    const kpi = document.createElement("div");
    kpi.className = "kpi kpi-platform";
    kpi.innerHTML = `<div class="kpi-label">${esc(p.name)}</div><div class="kpi-value" id="kpi-${p.id}" style="color:${p.color || '#e6edf3'}">0m</div>`;
    kpiGrid.appendChild(kpi);
  }

  // Build platform activity sections
  const container = document.getElementById("platform-sections");
  container.innerHTML = "";

  for (const p of (platformConfig || [])) {
    const metrics = p.metrics || [];
    if (metrics.length === 0) continue;

    const section = document.createElement("div");
    section.className = "section";
    section.innerHTML = `
      <div class="section-title">
        <span class="tag" style="background:${hexToRgba(p.color, 0.12)};color:${p.color}">${esc(p.name)}</span> Activity
      </div>
      <div class="stats" id="stats-${p.id}" style="grid-template-columns: repeat(${Math.min(metrics.length, 3)}, 1fr);">
        ${metrics.map(m => `
          <div class="stat">
            <div class="stat-val" id="stat-${p.id}-${m}">0</div>
            <div class="stat-label">${METRIC_LABELS[m] || m}</div>
          </div>
        `).join("")}
      </div>
    `;
    container.appendChild(section);
  }
}

function hexToRgba(hex, alpha) {
  if (!hex) return `rgba(139,152,165,${alpha})`;
  hex = hex.replace("#", "");
  const r = parseInt(hex.substr(0, 2), 16) || 0;
  const g = parseInt(hex.substr(2, 2), 16) || 0;
  const b = parseInt(hex.substr(4, 2), 16) || 0;
  return `rgba(${r},${g},${b},${alpha})`;
}

function esc(s) {
  if (!s) return "";
  const el = document.createElement("span");
  el.textContent = s;
  return el.innerHTML;
}

async function refresh() {
  try {
    const snap = await chrome.runtime.sendMessage({ type: "pa-get-stats" });
    if (!snap) return;

    const platformConfig = snap.platformConfig || [];
    buildPlatformUI(platformConfig);

    document.getElementById("active").textContent = fmt(snap.activeMs);
    document.getElementById("idle").textContent = fmt(snap.idleMs || 0);

    // Update platform KPIs and stats
    for (const p of platformConfig) {
      const kpiEl = document.getElementById(`kpi-${p.id}`);
      if (kpiEl) kpiEl.textContent = fmt((snap.platformMs || {})[p.id] || 0);

      const pData = (snap.platforms || {})[p.id] || {};
      const metrics = pData.metrics || {};
      for (const m of (p.metrics || [])) {
        const el = document.getElementById(`stat-${p.id}-${m}`);
        if (el) el.textContent = m === "profiles" ? (pData.profileCount || 0) : (metrics[m] || 0);
      }
    }
  } catch {}

  // Load today's full data for domain breakdown.
  try {
    const day = await chrome.runtime.sendMessage({ type: "pa-get-day" });
    if (day && day.domains) {
      const sorted = Object.entries(day.domains)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 6);
      const list = document.getElementById("domains-list");
      if (sorted.length === 0) {
        list.innerHTML = '<div class="empty">Browsing data will appear here</div>';
      } else {
        list.innerHTML = sorted.map(([d, ms]) =>
          `<div class="domain-row"><span class="name">${esc(d)}</span><span class="time">${fmt(ms)}</span></div>`
        ).join("");
      }
    }
  } catch {}
}

refresh();

document.getElementById("open-dashboard").addEventListener("click", (e) => {
  e.preventDefault();
  chrome.tabs.create({ url: chrome.runtime.getURL("dashboard.html") });
});

document.getElementById("open-settings").addEventListener("click", (e) => {
  e.preventDefault();
  chrome.runtime.openOptionsPage();
});

// CSV export of today's data.
document.getElementById("export-csv").addEventListener("click", async (e) => {
  e.preventDefault();
  try {
    const day = await chrome.runtime.sendMessage({ type: "pa-get-day" });
    if (!day) return;
    const lines = ["metric,value"];
    lines.push(`date,${day.date}`);
    lines.push(`active_ms,${day.activeMs}`);
    lines.push(`idle_ms,${day.idleMs || 0}`);

    // Platform times
    for (const [pid, ms] of Object.entries(day.platformMs || {})) {
      lines.push(`${pid}_ms,${ms}`);
    }
    // Legacy
    lines.push(`linkedin_ms,${day.linkedinMs || 0}`);
    lines.push(`naukri_ms,${day.naukriMs || 0}`);

    // Platform metrics
    for (const [pid, metrics] of Object.entries(day.platformMetrics || {})) {
      for (const [k, v] of Object.entries(metrics)) {
        lines.push(`${pid}_${k},${v}`);
      }
    }

    lines.push("");
    lines.push("domain,time_ms");
    for (const [d, ms] of Object.entries(day.domains || {}).sort((a, b) => b[1] - a[1])) {
      lines.push(`${d},${ms}`);
    }
    if ((day.events || []).length) {
      lines.push("");
      lines.push("event_time,source,type,profile_url,profile_name,profile_title");
      for (const ev of day.events) {
        lines.push(`${new Date(ev.ts || ev._ts).toISOString()},${ev.source || ""},${ev.type || ""},${ev.profile_url || ""},${(ev.profile_name || "").replace(/,/g, ";")},${(ev.profile_title || "").replace(/,/g, ";")}`);
      }
    }
    const blob = new Blob([lines.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `productivity-${day.date}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  } catch (err) {
    console.error("CSV export failed:", err);
  }
});
