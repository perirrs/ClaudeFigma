function fmt(ms) {
  if (!ms || ms < 0) ms = 0;
  const s = Math.floor(ms / 1000), h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

async function refresh() {
  try {
    const snap = await chrome.runtime.sendMessage({ type: "pa-get-stats" });
    if (!snap) return;
    document.getElementById("active").textContent = fmt(snap.activeMs);
    document.getElementById("idle").textContent = fmt(snap.idleMs || 0);
    document.getElementById("linkedin").textContent = fmt(snap.linkedinMs);
    document.getElementById("naukri").textContent = fmt(snap.naukriMs);
    document.getElementById("li-profiles").textContent = snap.liUniqueProfiles || 0;
    document.getElementById("li-conns").textContent = snap.liConnections || 0;
    document.getElementById("li-msgs").textContent = snap.liMessages || 0;
    document.getElementById("nk-profiles").textContent = snap.nkUniqueProfiles || 0;
    document.getElementById("nk-cvs").textContent = snap.nkDownloads || 0;
    document.getElementById("nk-contacts").textContent = snap.naukriContacts || 0;
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
          `<div class="domain-row"><span class="name">${d}</span><span class="time">${fmt(ms)}</span></div>`
        ).join("");
      }
    }
  } catch {}
}

refresh();

// Open the full dashboard page (bundled with the extension).
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
    lines.push(`linkedin_ms,${day.linkedinMs}`);
    lines.push(`naukri_ms,${day.naukriMs}`);
    lines.push(`linkedin_profiles_viewed,${(day.liProfiles || []).length}`);
    lines.push(`linkedin_connections_sent,${day.liConnections}`);
    lines.push(`linkedin_messages_sent,${day.liMessages}`);
    lines.push(`linkedin_searches,${day.liSearches || 0}`);
    lines.push(`naukri_profiles_viewed,${(day.nkProfiles || []).length}`);
    lines.push(`naukri_cv_downloads,${day.naukriDownloads}`);
    lines.push(`naukri_contacts_revealed,${day.naukriContacts || 0}`);
    lines.push(`naukri_searches,${day.naukriSearches || 0}`);
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
