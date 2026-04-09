const SYNC_SETTINGS_KEYS = ["memberName", "memberEmail", "recruiterName", "recruiterEmail", "syncEnabled", "syncUrl", "syncToken", "showOverlay"];
const DEFAULT_SYNC_URL = "https://flow-metrics-31b50b1d.base44.app/api/functions/syncActivity";

async function load() {
  let managed = {};
  try { managed = await chrome.storage.managed.get(null); } catch {}

  const data = await chrome.storage.sync.get(SYNC_SETTINGS_KEYS);
  // Support both new (memberName) and legacy (recruiterName) fields
  document.getElementById("memberName").value = data.memberName || data.recruiterName || "";
  document.getElementById("memberEmail").value = data.memberEmail || data.recruiterEmail || "";
  document.getElementById("syncEnabled").checked = managed.syncEnabled ?? !!data.syncEnabled;
  document.getElementById("syncUrl").value = managed.syncUrl || data.syncUrl || DEFAULT_SYNC_URL;
  document.getElementById("syncToken").value = managed.syncToken || data.syncToken || "";
  document.getElementById("showOverlay").checked = (managed.showOverlay ?? data.showOverlay) !== false;

  if (managed.syncUrl) {
    document.getElementById("sync-status").textContent = "Server URL pre-configured by your admin.";
  }

  const { lastSyncTime, lastSyncError } = await chrome.storage.local.get(["lastSyncTime", "lastSyncError"]);
  if (lastSyncTime) {
    const ago = Math.round((Date.now() - lastSyncTime) / 60000);
    document.getElementById("sync-status").textContent =
      lastSyncError ? `Last sync failed ${ago}m ago: ${lastSyncError}` : `Last sync: ${ago}m ago`;
  }

  // Load platform config and department info
  loadPlatformInfo();
}
load();

async function loadPlatformInfo() {
  const stored = await chrome.storage.local.get(["pa_platform_config", "pa_department", "pa_member_info"]);

  const deptEl = document.getElementById("dept-display");
  if (stored.pa_department) {
    deptEl.textContent = stored.pa_department;
  } else {
    deptEl.textContent = "Not configured";
  }

  const listEl = document.getElementById("platform-list");
  const platforms = stored.pa_platform_config || [];
  if (platforms.length === 0) {
    listEl.innerHTML = '<div style="color:#8b98a5;font-size:11px;padding:8px 0;">No platforms configured. Click "Refresh Config" after entering your email and saving settings.</div>';
    return;
  }

  listEl.innerHTML = platforms.map(p => `
    <div class="platform-item">
      <div class="platform-dot" style="background:${p.color || '#8b98a5'}"></div>
      <div class="platform-name">${esc(p.name)}</div>
      <div class="platform-domains">${(p.domains || []).join(", ")}</div>
    </div>
  `).join("");
}

function esc(s) {
  if (!s) return "";
  const el = document.createElement("span");
  el.textContent = s;
  return el.innerHTML;
}

document.getElementById("save").addEventListener("click", async () => {
  const settings = {
    memberName: document.getElementById("memberName").value.trim(),
    memberEmail: document.getElementById("memberEmail").value.trim(),
    // Legacy fields for backward compat
    recruiterName: document.getElementById("memberName").value.trim(),
    recruiterEmail: document.getElementById("memberEmail").value.trim(),
    syncEnabled: document.getElementById("syncEnabled").checked,
    syncUrl: document.getElementById("syncUrl").value.trim().replace(/\/+$/, ""),
    syncToken: document.getElementById("syncToken").value.trim(),
    showOverlay: document.getElementById("showOverlay").checked,
  };

  if (settings.syncEnabled && !settings.memberName) {
    showStatus("Please enter your name for sync.", true);
    return;
  }
  if (settings.syncEnabled && !settings.syncUrl) {
    showStatus("Please enter the server URL for sync.", true);
    return;
  }

  await chrome.storage.sync.set(settings);
  showStatus("Saved!");
});

document.getElementById("clear-data").addEventListener("click", async () => {
  if (!confirm("This will delete ALL tracked data (all days). Are you sure?")) return;
  await chrome.storage.local.clear();
  showStatus("All data cleared.");
});

// Test Connection
document.getElementById("test-sync").addEventListener("click", async () => {
  const url = document.getElementById("syncUrl").value.trim().replace(/\/+$/, "");
  const token = document.getElementById("syncToken").value.trim();
  if (!url) { showStatus("Enter a server URL first.", true); return; }

  document.getElementById("sync-status").textContent = "Testing...";
  try {
    const headers = { "Content-Type": "application/json" };
    if (token) { headers["X-API-Key"] = token; headers["Authorization"] = `Bearer ${token}`; }
    const res = await fetch(url, { method: "OPTIONS", headers });
    if (res.ok || res.status === 204) {
      document.getElementById("sync-status").textContent = "Connection OK!";
      document.getElementById("sync-status").style.color = "#4ade80";
    } else {
      document.getElementById("sync-status").textContent = "Use 'Sync Now' to send real data.";
      document.getElementById("sync-status").style.color = "#8b98a5";
    }
  } catch (e) {
    document.getElementById("sync-status").textContent = `Connection failed: ${e.message}`;
    document.getElementById("sync-status").style.color = "#f87171";
  }
});

// Sync Now
document.getElementById("sync-now").addEventListener("click", async () => {
  document.getElementById("sync-status").textContent = "Syncing...";
  document.getElementById("sync-status").style.color = "#8b98a5";
  try {
    const result = await chrome.runtime.sendMessage({ type: "pa-sync-now" });
    if (result && result.ok) {
      document.getElementById("sync-status").textContent = `Synced! ${result.synced} day(s) sent.`;
      document.getElementById("sync-status").style.color = "#4ade80";
    } else {
      document.getElementById("sync-status").textContent = `Sync failed: ${(result && result.error) || "unknown error"}`;
      document.getElementById("sync-status").style.color = "#f87171";
    }
  } catch (e) {
    document.getElementById("sync-status").textContent = `Sync failed: ${e.message}`;
    document.getElementById("sync-status").style.color = "#f87171";
  }
});

// Refresh Config — fetches platform config from server
document.getElementById("refresh-config").addEventListener("click", async () => {
  document.getElementById("sync-status").textContent = "Fetching config...";
  document.getElementById("sync-status").style.color = "#8b98a5";
  try {
    const result = await chrome.runtime.sendMessage({ type: "pa-refresh-config" });
    if (result && result.ok) {
      document.getElementById("sync-status").textContent = `Config updated! ${(result.platforms || []).length} platform(s).`;
      document.getElementById("sync-status").style.color = "#4ade80";
      loadPlatformInfo();
    } else {
      document.getElementById("sync-status").textContent = "Config fetch failed. Check email and server URL.";
      document.getElementById("sync-status").style.color = "#f87171";
    }
  } catch (e) {
    document.getElementById("sync-status").textContent = `Config fetch failed: ${e.message}`;
    document.getElementById("sync-status").style.color = "#f87171";
  }
});

function showStatus(msg, isError) {
  const el = document.getElementById("status");
  el.textContent = msg;
  el.className = isError ? "status error" : "status";
  setTimeout(() => { el.textContent = ""; }, 3000);
}
