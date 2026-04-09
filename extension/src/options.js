const SYNC_SETTINGS_KEYS = ["recruiterName", "recruiterEmail", "syncEnabled", "syncUrl", "syncToken", "showOverlay"];

async function load() {
  // Enterprise managed storage (read-only, set by IT admin via policy)
  let managed = {};
  try { managed = await chrome.storage.managed.get(null); } catch {}

  const data = await chrome.storage.sync.get(SYNC_SETTINGS_KEYS);
  document.getElementById("recruiterName").value = data.recruiterName || "";
  document.getElementById("recruiterEmail").value = data.recruiterEmail || "";
  document.getElementById("syncEnabled").checked = managed.syncEnabled ?? !!data.syncEnabled;
  document.getElementById("syncUrl").value = managed.syncUrl || data.syncUrl || "";
  document.getElementById("syncToken").value = managed.syncToken || data.syncToken || "";
  document.getElementById("showOverlay").checked = (managed.showOverlay ?? data.showOverlay) !== false;

  // If managed, show a hint
  if (managed.syncUrl) {
    document.getElementById("sync-status").textContent = "Server URL pre-configured by your admin.";
  }

  // Show last sync status
  const { lastSyncTime, lastSyncError } = await chrome.storage.local.get(["lastSyncTime", "lastSyncError"]);
  if (lastSyncTime) {
    const ago = Math.round((Date.now() - lastSyncTime) / 60000);
    document.getElementById("sync-status").textContent =
      lastSyncError ? `Last sync failed ${ago}m ago: ${lastSyncError}` : `Last sync: ${ago}m ago`;
  }
}
load();

document.getElementById("save").addEventListener("click", async () => {
  const settings = {
    recruiterName: document.getElementById("recruiterName").value.trim(),
    recruiterEmail: document.getElementById("recruiterEmail").value.trim(),
    syncEnabled: document.getElementById("syncEnabled").checked,
    syncUrl: document.getElementById("syncUrl").value.trim().replace(/\/+$/, ""),
    syncToken: document.getElementById("syncToken").value.trim(),
    showOverlay: document.getElementById("showOverlay").checked,
  };

  if (settings.syncEnabled && !settings.recruiterName) {
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

document.getElementById("test-sync").addEventListener("click", async () => {
  const url = document.getElementById("syncUrl").value.trim().replace(/\/+$/, "");
  const token = document.getElementById("syncToken").value.trim();
  const name = document.getElementById("recruiterName").value.trim();
  if (!url) { showStatus("Enter a server URL first.", true); return; }
  if (!name) { showStatus("Enter your name first.", true); return; }

  document.getElementById("sync-status").textContent = "Testing...";
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...(token ? { "Authorization": `Bearer ${token}` } : {}) },
      body: JSON.stringify({ test: true, recruiterName: name }),
    });
    if (res.ok) {
      document.getElementById("sync-status").textContent = "Connection OK!";
      document.getElementById("sync-status").style.color = "#4ade80";
    } else {
      document.getElementById("sync-status").textContent = `Server returned ${res.status}`;
      document.getElementById("sync-status").style.color = "#f87171";
    }
  } catch (e) {
    document.getElementById("sync-status").textContent = `Connection failed: ${e.message}`;
    document.getElementById("sync-status").style.color = "#f87171";
  }
});

function showStatus(msg, isError) {
  const el = document.getElementById("status");
  el.textContent = msg;
  el.className = isError ? "status error" : "status";
  setTimeout(() => { el.textContent = ""; }, 3000);
}
