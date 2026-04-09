// Full dashboard page — runs as an extension page (chrome-extension://…/dashboard.html).

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

let currentDate = todayKey();

async function loadDay(date) {
  currentDate = date;
  document.getElementById("date-picker").value = date;
  const day = await chrome.runtime.sendMessage({ type: "pa-get-day", date });
  render(day || {});
}

function render(day) {
  document.getElementById("k-active").textContent = fmt(day.activeMs);
  document.getElementById("k-idle").textContent = fmt(day.idleMs);
  document.getElementById("k-li").textContent = fmt(day.linkedinMs);
  document.getElementById("k-nk").textContent = fmt(day.naukriMs);

  document.getElementById("s-li-prof").textContent = (day.liProfiles || []).length;
  document.getElementById("s-li-conn").textContent = day.liConnections || 0;
  document.getElementById("s-li-msg").textContent = day.liMessages || 0;
  document.getElementById("s-nk-prof").textContent = (day.nkProfiles || []).length;
  document.getElementById("s-nk-cv").textContent = day.naukriDownloads || 0;
  document.getElementById("s-nk-contact").textContent = day.naukriContacts || 0;

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
        <span class="domain-name">${d}</span>
        <span class="domain-time">${fmt(ms)}</span>
      </div>
      <div class="bar-wrap"><div class="bar-fill" style="width:${pct}%"></div></div>`;
    }).join("");
  }

  // LinkedIn profiles
  const liEvents = (day.events || []).filter(e => e.source === "linkedin" && e.type === "profile_viewed");
  const liMap = new Map();
  for (const e of liEvents) {
    if (!e.profile_url) continue;
    const prev = liMap.get(e.profile_url);
    if (!prev) {
      liMap.set(e.profile_url, { url: e.profile_url, name: e.profile_name, title: e.profile_title, views: 1, ts: e.ts });
    } else {
      prev.views++;
      if (e.profile_name) prev.name = e.profile_name;
      if (e.profile_title) prev.title = e.profile_title;
    }
  }
  const liList = [...liMap.values()].sort((a, b) => b.ts - a.ts);
  const liEl = document.getElementById("li-profiles");
  if (liList.length === 0) {
    liEl.innerHTML = '<div class="empty">No profiles yet</div>';
  } else {
    liEl.innerHTML = liList.map(p => `<div class="profile-row">
      <div class="profile-name">${esc(p.name || "Unknown")}</div>
      <div class="profile-title">${esc(p.title || "—")}</div>
      <div class="profile-meta">${p.views} view${p.views > 1 ? "s" : ""} · <a href="${esc(p.url)}" target="_blank" style="color:var(--green);text-decoration:none;font-size:10px;">open</a></div>
    </div>`).join("");
  }

  // Naukri profiles
  const nkEvents = (day.events || []).filter(e => e.source === "naukri" && e.type === "profile_viewed");
  const nkMap = new Map();
  for (const e of nkEvents) {
    if (!e.profile_url) continue;
    const prev = nkMap.get(e.profile_url);
    if (!prev) {
      nkMap.set(e.profile_url, { url: e.profile_url, name: e.profile_name, title: e.profile_title, views: 1, ts: e.ts });
    } else {
      prev.views++;
      if (e.profile_name) prev.name = e.profile_name;
      if (e.profile_title) prev.title = e.profile_title;
    }
  }
  const nkList = [...nkMap.values()].sort((a, b) => b.ts - a.ts);
  const nkEl = document.getElementById("nk-profiles");
  if (nkList.length === 0) {
    nkEl.innerHTML = '<div class="empty">No profiles yet</div>';
  } else {
    nkEl.innerHTML = nkList.map(p => `<div class="profile-row">
      <div class="profile-name">${esc(p.name || "Unknown")}</div>
      <div class="profile-title">${esc(p.title || "—")}</div>
      <div class="profile-meta">${p.views} view${p.views > 1 ? "s" : ""} · <a href="${esc(p.url)}" target="_blank" style="color:var(--blue);text-decoration:none;font-size:10px;">open</a></div>
    </div>`).join("");
  }

  // Event log
  const events = (day.events || []).slice().reverse().slice(0, 200);
  const evEl = document.getElementById("event-log");
  if (events.length === 0) {
    evEl.innerHTML = '<div class="empty">No events yet</div>';
  } else {
    evEl.innerHTML = events.map(e => {
      const time = new Date(e.ts || e._ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      const badge = e.source === "linkedin" ? "li" : "nk";
      const label = (e.type || "").replace(/_/g, " ");
      const detail = e.profile_name || e.profile_url || "";
      return `<div class="event-row">
        <span class="event-time">${time}</span>
        <span class="event-badge ${badge}">${e.source}</span>
        <span style="color:var(--muted)">${label}</span>
        <span class="event-detail">${esc(detail)}</span>
      </div>`;
    }).join("");
  }
}

function esc(s) {
  if (!s) return "";
  const el = document.createElement("span");
  el.textContent = s;
  return el.innerHTML;
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
    `<div class="history-day" data-date="${d}"><span>${d}</span><span style="color:var(--muted)">→</span></div>`
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
  lines.push(`linkedin_ms,${day.linkedinMs}`);
  lines.push(`naukri_ms,${day.naukriMs}`);
  lines.push(`linkedin_profiles_viewed,${(day.liProfiles || []).length}`);
  lines.push(`linkedin_connections_sent,${day.liConnections}`);
  lines.push(`linkedin_messages_sent,${day.liMessages}`);
  lines.push(`naukri_profiles_viewed,${(day.nkProfiles || []).length}`);
  lines.push(`naukri_cv_downloads,${day.naukriDownloads}`);
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

// Boot
loadDay(todayKey());
loadHistory();
