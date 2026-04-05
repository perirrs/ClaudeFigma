// Dashboard renderer - pulls analytics from the main process over IPC.

const api = window.api;

function fmtDuration(ms) {
  if (!ms || ms < 0) ms = 0;
  const s = Math.floor(ms / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

function todayISO() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

const state = { date: todayISO(), view: "overview" };

function $(id) { return document.getElementById(id); }

// Nav
document.querySelectorAll(".nav-item").forEach((el) => {
  el.addEventListener("click", () => {
    document.querySelectorAll(".nav-item").forEach((n) => n.classList.remove("active"));
    el.classList.add("active");
    state.view = el.dataset.view;
    document.querySelectorAll(".view").forEach((v) => v.classList.add("hidden"));
    $(`view-${state.view}`).classList.remove("hidden");
    $("view-title").textContent = el.textContent;
    refresh();
  });
});

// Date
$("date-input").value = state.date;
$("date-input").addEventListener("change", (e) => { state.date = e.target.value; refresh(); });

// Toggle
$("toggle-btn").addEventListener("click", async () => {
  await api.toggleTracker();
  refreshStatus();
});

async function refreshStatus() {
  const s = await api.trackerStatus();
  const paused = s && s.paused;
  $("tracker-dot").className = "dot " + (paused ? "paused" : "ok");
  $("tracker-label").textContent = paused ? "Paused" : "Tracking";
  $("toggle-btn").textContent = paused ? "Resume" : "Pause";
}

async function refresh() {
  $("topbar-meta").textContent = state.date;
  const [summary, domains, apps, li, nk, timeline] = await Promise.all([
    api.getSummary(state.date),
    api.getDomains(state.date),
    api.getApps(state.date),
    api.getLinkedIn(state.date),
    api.getNaukri(state.date),
    api.getTimeline(state.date),
  ]);

  // KPIs
  $("kpi-active").textContent = fmtDuration(summary.activeMs);
  $("kpi-idle").textContent = fmtDuration(summary.idleMs);
  $("kpi-linkedin").textContent = fmtDuration(summary.linkedinMs);
  $("kpi-naukri").textContent = fmtDuration(summary.naukriMs);
  $("kpi-connections").textContent = summary.linkedinConnections;
  $("kpi-messages").textContent = summary.linkedinMessages;
  $("kpi-li-profiles").textContent = summary.linkedinProfilesViewed;
  $("kpi-nk-profiles").textContent = summary.naukriProfilesViewed;
  $("kpi-cv").textContent = summary.naukriDownloads;

  // Split bars
  const splitEl = $("split-bars");
  const total = Math.max(1, summary.activeMs + summary.idleMs);
  const rows = [
    { name: "LinkedIn", ms: summary.linkedinMs, color: "var(--green)" },
    { name: "Naukri", ms: summary.naukriMs, color: "var(--blue)" },
    { name: "Other active", ms: summary.otherMs, color: "#475569" },
    { name: "Idle", ms: summary.idleMs, color: "#1b2530" },
  ];
  splitEl.innerHTML = rows.map((r) => {
    const pct = ((r.ms / total) * 100).toFixed(1);
    return `<div class="sb">
      <div class="sb-head"><span class="name">${r.name}</span><span class="val">${fmtDuration(r.ms)} · ${pct}%</span></div>
      <div class="bar"><span style="width:${pct}%;background:${r.color}"></span></div>
    </div>`;
  }).join("");

  // Top domains
  renderList($("top-domains"), domains.slice(0, 8).map((d) => ({ name: d.domain, ms: d.ms })));

  // Apps view
  renderList($("app-list"), apps.map((a) => ({ name: a.app, ms: a.ms })));
  renderList($("domain-list"), domains.map((d) => ({ name: d.domain, ms: d.ms })));

  // LinkedIn profiles
  renderProfileTable($("li-profiles-body"), li.profiles);
  renderProfileTable($("nk-profiles-body"), nk.profiles);

  // Timeline
  renderTimeline($("timeline-chart"), timeline);
}

function renderList(el, items) {
  if (!items.length) { el.innerHTML = '<div class="empty">No data yet</div>'; return; }
  const max = Math.max(...items.map((i) => i.ms), 1);
  el.innerHTML = items.map((i) => {
    const pct = ((i.ms / max) * 100).toFixed(1);
    return `<div>
      <div class="row"><span class="name">${escape(i.name)}</span><span class="time">${fmtDuration(i.ms)}</span></div>
      <div class="bar"><span style="width:${pct}%"></span></div>
    </div>`;
  }).join("");
}

function renderProfileTable(tbody, profiles) {
  if (!profiles.length) { tbody.innerHTML = '<tr><td colspan="4" class="empty">No profiles viewed yet</td></tr>'; return; }
  tbody.innerHTML = profiles.map((p) => `
    <tr>
      <td>${escape(p.name || "(unknown)")}</td>
      <td>${escape(p.title || "—")}</td>
      <td class="num">${p.views}</td>
      <td class="num">${fmtDuration(p.ms)}</td>
    </tr>
  `).join("");
}

function renderTimeline(el, hours) {
  const max = Math.max(1, ...hours.map((h) => h.active + h.idle));
  el.innerHTML = hours.map((h, i) => {
    const scale = (v) => `${(v / max * 100).toFixed(1)}%`;
    return `<div class="col">
      <div class="seg li" style="height:${scale(h.linkedin)}"></div>
      <div class="seg nk" style="height:${scale(h.naukri)}"></div>
      <div class="seg other" style="height:${scale(Math.max(0, h.active - h.linkedin - h.naukri))}"></div>
      <div class="seg idle" style="height:${scale(h.idle)}"></div>
      <div class="hr">${i}</div>
    </div>`;
  }).join("");
}

function escape(s) { return String(s || "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])); }

refreshStatus();
refresh();
setInterval(refresh, 30000);
