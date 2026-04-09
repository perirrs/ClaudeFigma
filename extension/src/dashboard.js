// Full dashboard page — config-driven, dynamically renders platform sections.

function fmt(ms) {
  if (!ms || ms < 0) ms = 0;
  const s = Math.floor(ms / 1000), h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function shiftDate(dateStr, delta) {
  const d = new Date(dateStr + "T12:00:00");
  d.setDate(d.getDate() + delta);
  return d.toISOString().slice(0, 10);
}

function esc(s) {
  if (!s) return "";
  const el = document.createElement("span");
  el.textContent = s;
  return el.innerHTML;
}

function hexToRgba(hex, alpha) {
  if (!hex) return `rgba(139,152,165,${alpha})`;
  hex = hex.replace("#", "");
  const r = parseInt(hex.substr(0, 2), 16) || 0;
  const g = parseInt(hex.substr(2, 2), 16) || 0;
  const b = parseInt(hex.substr(4, 2), 16) || 0;
  return `rgba(${r},${g},${b},${alpha})`;
}

const METRIC_LABELS = {
  profiles: "Profiles Viewed",
  connections: "Connections",
  messages: "Messages",
  searches: "Searches",
  downloads: "CVs Downloaded",
  contacts: "Contacts Revealed",
};

const GENERIC_RE = /^(search|feed|home|jobs|messaging|notifications|my network|post|groups?|events?|pages?|companies|people|invite|settings|premium|linkedin|unknown)$/i;

let currentDate = todayKey();
let platformConfig = [];
let builtLayout = null;

// ---- Dynamic layout building ----

function buildLayout(config) {
  const key = JSON.stringify((config || []).map(p => p.id));
  if (key === builtLayout) return;
  builtLayout = key;
  platformConfig = config || [];

  // Build KPI grid: Active + Idle + per-platform time
  const kpiGrid = document.getElementById("kpi-grid");
  kpiGrid.innerHTML = `
    <div class="kpi"><div class="kpi-label">Active time</div><div class="kpi-value" id="k-active">0m</div></div>
    <div class="kpi"><div class="kpi-label">Idle time</div><div class="kpi-value" id="k-idle">0m</div></div>
  `;
  for (const p of platformConfig) {
    const kpi = document.createElement("div");
    kpi.className = "kpi";
    kpi.style.borderColor = hexToRgba(p.color, 0.2);
    kpi.innerHTML = `<div class="kpi-label">${esc(p.name)} time</div><div class="kpi-value" id="k-${p.id}" style="color:${p.color}">${"0m"}</div>`;
    kpiGrid.appendChild(kpi);
  }

  // Build stats row: all metrics from all platforms
  const statsRow = document.getElementById("stats-row");
  statsRow.innerHTML = "";
  for (const p of platformConfig) {
    for (const m of (p.metrics || [])) {
      const card = document.createElement("div");
      card.className = "stat-card";
      const shortName = p.name.length > 8 ? p.name.slice(0, 6) + ".." : p.name;
      card.innerHTML = `<div class="stat-val" id="s-${p.id}-${m}">0</div><div class="stat-label">${shortName} ${METRIC_LABELS[m] || m}</div>`;
      statsRow.appendChild(card);
    }
  }

  // Build detail cards (profiles viewed, connections, downloads per platform)
  const detailCards = document.getElementById("detail-cards");
  detailCards.innerHTML = "";

  // Group platforms into pairs for split layout
  const cardsToRender = [];
  for (const p of platformConfig) {
    if ((p.metrics || []).includes("connections")) {
      cardsToRender.push({ id: `${p.id}-connections`, title: `${p.name} Connections Sent`, pid: p.id, type: "connections", color: p.color });
    }
    if ((p.metrics || []).includes("downloads")) {
      cardsToRender.push({ id: `${p.id}-downloads`, title: `${p.name} CV Downloads`, pid: p.id, type: "downloads", color: p.color });
    }
  }
  // Profiles viewed cards
  for (const p of platformConfig) {
    if ((p.metrics || []).includes("profiles")) {
      cardsToRender.push({ id: `${p.id}-profiles`, title: `${p.name} Profiles Viewed`, pid: p.id, type: "profiles", color: p.color });
    }
  }

  for (let i = 0; i < cardsToRender.length; i += 2) {
    const split = document.createElement("div");
    split.className = "split";
    for (let j = i; j < Math.min(i + 2, cardsToRender.length); j++) {
      const c = cardsToRender[j];
      const card = document.createElement("div");
      card.className = "card";
      card.innerHTML = `<h2>${esc(c.title)}</h2><div id="detail-${c.id}"><div class="empty">No data yet</div></div>`;
      split.appendChild(card);
    }
    // If odd number, make last card full width
    if (i + 1 === cardsToRender.length) {
      split.querySelector(".card").classList.add("full");
    }
    detailCards.appendChild(split);
  }
}

// ---- Rendering ----

async function loadDay(date) {
  currentDate = date;
  document.getElementById("date-picker").value = date;
  const day = await chrome.runtime.sendMessage({ type: "pa-get-day", date });
  render(day || {});
}

function render(day) {
  // Ensure layout is built
  const config = platformConfig.length > 0 ? platformConfig : null;
  if (!config) return;

  document.getElementById("k-active").textContent = fmt(day.activeMs);
  document.getElementById("k-idle").textContent = fmt(day.idleMs);

  // Platform times
  for (const p of platformConfig) {
    const el = document.getElementById(`k-${p.id}`);
    if (el) el.textContent = fmt((day.platformMs || {})[p.id] || (p.id === "linkedin" ? day.linkedinMs : p.id === "naukri" ? day.naukriMs : 0));
  }

  // Platform metrics
  for (const p of platformConfig) {
    const pMetrics = (day.platformMetrics || {})[p.id] || {};
    for (const m of (p.metrics || [])) {
      const el = document.getElementById(`s-${p.id}-${m}`);
      if (!el) continue;
      if (m === "profiles") {
        el.textContent = ((day.platformProfiles || {})[p.id] || (p.id === "linkedin" ? day.liProfiles : p.id === "naukri" ? day.nkProfiles : []) || []).length;
      } else {
        // Try generic first, then legacy
        let val = pMetrics[m];
        if (val == null && p.id === "linkedin") {
          if (m === "connections") val = day.liConnections;
          if (m === "messages") val = day.liMessages;
          if (m === "searches") val = day.liSearches;
        }
        if (val == null && p.id === "naukri") {
          if (m === "downloads") val = day.naukriDownloads;
          if (m === "contacts") val = day.naukriContacts;
          if (m === "searches") val = day.naukriSearches;
        }
        el.textContent = val || 0;
      }
    }
  }

  // Domains
  const domains = Object.entries(day.domains || {}).sort((a, b) => b[1] - a[1]).slice(0, 12);
  const dList = document.getElementById("domains-list");
  if (domains.length === 0) {
    dList.innerHTML = '<div class="empty">No data</div>';
  } else {
    const maxMs = domains[0][1];
    dList.innerHTML = domains.map(([d, ms]) => {
      const pct = ((ms / maxMs) * 100).toFixed(1);
      return `<div class="domain-row">
        <span class="domain-name">${esc(d)}</span>
        <span class="domain-time">${fmt(ms)}</span>
      </div>
      <div class="bar-wrap"><div class="bar-fill" style="width:${pct}%"></div></div>`;
    }).join("");
  }

  // Detail cards — connections, downloads, profiles per platform
  const events = day.events || [];

  for (const p of platformConfig) {
    // Connections sent
    if ((p.metrics || []).includes("connections")) {
      const connEvents = events.filter(e => (e.source === p.id || e.source === p.name.toLowerCase()) && e.type === "connection_sent");
      const el = document.getElementById(`detail-${p.id}-connections`);
      if (el) {
        if (connEvents.length === 0) {
          el.innerHTML = '<div class="empty">No connections yet</div>';
        } else {
          el.innerHTML = connEvents.map(e => {
            const time = new Date(e.ts || e._ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
            return `<div class="profile-row">
              <div class="profile-name">${esc(e.profile_name || "Unknown")}</div>
              <div class="profile-title">${esc(e.profile_title || "\u2014")}</div>
              <div class="profile-meta">${time} \u00b7 <a href="${esc(e.profile_url || "")}" target="_blank" style="color:${p.color};text-decoration:none;font-size:10px;">open profile</a></div>
            </div>`;
          }).join("");
        }
      }
    }

    // CV downloads
    if ((p.metrics || []).includes("downloads")) {
      const dlEvents = events.filter(e => (e.source === p.id || e.source === p.name.toLowerCase()) && e.type === "cv_downloaded");
      const el = document.getElementById(`detail-${p.id}-downloads`);
      if (el) {
        if (dlEvents.length === 0) {
          el.innerHTML = '<div class="empty">No downloads yet</div>';
        } else {
          el.innerHTML = dlEvents.map(e => {
            const time = new Date(e.ts || e._ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
            return `<div class="profile-row">
              <div class="profile-name">${esc(e.profile_name || "Unknown")}</div>
              <div class="profile-title">${esc(e.profile_title || "\u2014")}</div>
              <div class="profile-meta">${time} \u00b7 <a href="${esc(e.profile_url || "")}" target="_blank" style="color:${p.color};text-decoration:none;font-size:10px;">open profile</a></div>
            </div>`;
          }).join("");
        }
      }
    }

    // Profiles viewed
    if ((p.metrics || []).includes("profiles")) {
      const profEvents = events.filter(e => (e.source === p.id || e.source === p.name.toLowerCase()) && e.type === "profile_viewed");
      const profMap = new Map();
      for (const e of profEvents) {
        if (!e.profile_url) continue;
        const prev = profMap.get(e.profile_url);
        if (!prev) {
          profMap.set(e.profile_url, { url: e.profile_url, name: e.profile_name, title: e.profile_title, views: 1, ts: e.ts || e._ts });
        } else {
          prev.views++;
          if (e.profile_name) prev.name = e.profile_name;
          if (e.profile_title) prev.title = e.profile_title;
        }
      }
      const profList = [...profMap.values()]
        .filter(pr => !pr.name || !GENERIC_RE.test(pr.name.trim()))
        .sort((a, b) => b.ts - a.ts);
      const el = document.getElementById(`detail-${p.id}-profiles`);
      if (el) {
        if (profList.length === 0) {
          el.innerHTML = '<div class="empty">No profiles yet</div>';
        } else {
          el.innerHTML = profList.map(pr => `<div class="profile-row">
            <div class="profile-name">${esc(pr.name || "Unknown")}</div>
            <div class="profile-title">${esc(pr.title || "\u2014")}</div>
            <div class="profile-meta">${pr.views} view${pr.views > 1 ? "s" : ""} \u00b7 <a href="${esc(pr.url)}" target="_blank" style="color:${p.color};text-decoration:none;font-size:10px;">open</a></div>
          </div>`).join("");
        }
      }
    }
  }

  // Event log
  const allEvents = events.slice().reverse().slice(0, 200);
  const evEl = document.getElementById("event-log");
  if (allEvents.length === 0) {
    evEl.innerHTML = '<div class="empty">No events yet</div>';
  } else {
    // Build a color map from config
    const colorMap = {};
    for (const p of platformConfig) {
      colorMap[p.id] = p.color;
      colorMap[p.name.toLowerCase()] = p.color;
    }
    evEl.innerHTML = allEvents.map(e => {
      const time = new Date(e.ts || e._ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      const color = colorMap[e.source] || "#8b98a5";
      const label = (e.type || "").replace(/_/g, " ");
      const detail = e.profile_name || e.profile_url || "";
      return `<div class="event-row">
        <span class="event-time">${time}</span>
        <span class="event-badge" style="background:${hexToRgba(color, 0.12)};color:${color}">${esc(e.source)}</span>
        <span style="color:var(--muted)">${label}</span>
        <span class="event-detail">${esc(detail)}</span>
      </div>`;
    }).join("");
  }
}

// Navigation
document.getElementById("prev-day").addEventListener("click", () => loadDay(shiftDate(currentDate, -1)));
document.getElementById("next-day").addEventListener("click", () => loadDay(shiftDate(currentDate, 1)));
document.getElementById("today-btn").addEventListener("click", () => loadDay(todayKey()));
document.getElementById("date-picker").addEventListener("change", (e) => loadDay(e.target.value));

// History panel
async function loadHistory() {
  const days = await chrome.runtime.sendMessage({ type: "pa-get-days-list" });
  const el = document.getElementById("history-list");
  if (!days || days.length === 0) {
    el.innerHTML = '<div class="empty">No data yet</div>';
    return;
  }
  el.innerHTML = days.slice(0, 14).map(d =>
    `<div class="history-day" data-date="${d}"><span>${d}</span><span style="color:var(--muted)">\u2192</span></div>`
  ).join("");
  el.querySelectorAll(".history-day").forEach(row => {
    row.addEventListener("click", () => loadDay(row.dataset.date));
  });
}

// CSV export
document.getElementById("export-csv").addEventListener("click", async () => {
  const day = await chrome.runtime.sendMessage({ type: "pa-get-day", date: currentDate });
  if (!day) return;
  const lines = ["metric,value"];
  lines.push(`date,${day.date}`);
  lines.push(`active_ms,${day.activeMs}`);
  lines.push(`idle_ms,${day.idleMs || 0}`);
  for (const [pid, ms] of Object.entries(day.platformMs || {})) {
    lines.push(`${pid}_ms,${ms}`);
  }
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
});

// ---- Period summaries (week / month / all time) ----

let allDays = [];
let activePeriod = "today";

function datesForPeriod(period) {
  const today = todayKey();
  if (period === "today") return [today];
  const todayDate = new Date(today + "T12:00:00");
  if (period === "week") {
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(todayDate);
      d.setDate(d.getDate() - i);
      dates.push(d.toISOString().slice(0, 10));
    }
    return dates;
  }
  if (period === "month") {
    const dates = [];
    for (let i = 0; i < 30; i++) {
      const d = new Date(todayDate);
      d.setDate(d.getDate() - i);
      dates.push(d.toISOString().slice(0, 10));
    }
    return dates;
  }
  if (period === "all") return allDays.length ? allDays : [today];
  return [today];
}

const periodLabels = {
  today: "Today",
  week: "This Week (last 7 days)",
  month: "This Month (last 30 days)",
  all: "All Time",
};

async function loadPeriodSummary(period) {
  activePeriod = period;
  document.querySelectorAll(".period-tab").forEach(t => {
    t.classList.toggle("active", t.dataset.period === period);
  });

  const banner = document.getElementById("summary-banner");
  if (period === "today") {
    banner.style.display = "none";
    return;
  }
  banner.style.display = "block";
  document.getElementById("summary-label").textContent = periodLabels[period];

  const dates = datesForPeriod(period);
  const agg = await chrome.runtime.sendMessage({ type: "pa-get-range", dates });
  if (!agg) return;

  // Build summary KPIs dynamically
  const kpisEl = document.getElementById("summary-kpis");
  let kpiHtml = `
    <div><div class="sg-label">Active time</div><div class="sg-value">${fmt(agg.activeMs)}</div></div>
    <div><div class="sg-label">Idle time</div><div class="sg-value">${fmt(agg.idleMs)}</div></div>
  `;
  const config = agg.platformConfig || platformConfig;
  for (const p of config) {
    const ms = (agg.platformMs || {})[p.id] || (p.id === "linkedin" ? agg.linkedinMs : p.id === "naukri" ? agg.naukriMs : 0);
    kpiHtml += `<div><div class="sg-label">${esc(p.name)}</div><div class="sg-value" style="color:${p.color}">${fmt(ms)}</div></div>`;
  }
  kpisEl.innerHTML = kpiHtml;

  // Build summary stats
  const statsEl = document.getElementById("summary-stats");
  let statsHtml = "";
  for (const p of config) {
    const pMetrics = (agg.platformMetrics || {})[p.id] || {};
    for (const m of (p.metrics || [])) {
      let val;
      if (m === "profiles") {
        val = ((agg.platformProfiles || {})[p.id] || (p.id === "linkedin" ? agg.liProfiles : p.id === "naukri" ? agg.nkProfiles : []) || []).length;
      } else {
        val = pMetrics[m];
        if (val == null && p.id === "linkedin") {
          if (m === "connections") val = agg.liConnections;
          if (m === "messages") val = agg.liMessages;
          if (m === "searches") val = agg.liSearches;
        }
        if (val == null && p.id === "naukri") {
          if (m === "downloads") val = agg.naukriDownloads;
          if (m === "contacts") val = agg.naukriContacts;
          if (m === "searches") val = agg.naukriSearches;
        }
        val = val || 0;
      }
      const shortName = p.name.length > 6 ? p.name.slice(0, 4) + ".." : p.name;
      statsHtml += `<div class="ss-item"><div class="ss-val">${val}</div><div class="ss-label">${shortName} ${METRIC_LABELS[m] || m}</div></div>`;
    }
  }
  statsEl.innerHTML = statsHtml;

  document.getElementById("sg-days").textContent = agg.dayCount || 0;

  // Top domains for the period.
  const domains = Object.entries(agg.domains || {}).sort((a, b) => b[1] - a[1]).slice(0, 8);
  const dEl = document.getElementById("sg-domains");
  if (domains.length === 0) {
    dEl.innerHTML = '<div class="empty">No data</div>';
  } else {
    const maxMs = domains[0][1];
    dEl.innerHTML = domains.map(([d, ms]) => {
      const pct = ((ms / maxMs) * 100).toFixed(1);
      return `<div class="domain-row">
        <span class="domain-name">${esc(d)}</span>
        <span class="domain-time">${fmt(ms)}</span>
      </div>
      <div class="bar-wrap"><div class="bar-fill" style="width:${pct}%"></div></div>`;
    }).join("");
  }
}

document.querySelectorAll(".period-tab").forEach(tab => {
  tab.addEventListener("click", () => loadPeriodSummary(tab.dataset.period));
});

// ---- Boot ----
async function boot() {
  // Get platform config from background
  const configResp = await chrome.runtime.sendMessage({ type: "pa-get-config" });
  if (configResp && configResp.platforms) {
    buildLayout(configResp.platforms);
  }

  // Show department badge if available
  const stored = await chrome.storage.local.get(["pa_department"]);
  if (stored.pa_department) {
    const badge = document.getElementById("dept-badge");
    badge.textContent = stored.pa_department;
    badge.style.display = "inline-block";
  }

  allDays = await chrome.runtime.sendMessage({ type: "pa-get-days-list" }) || [];
  loadDay(todayKey());
  loadHistory();
}
boot();
