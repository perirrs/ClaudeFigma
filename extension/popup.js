async function init() {
  const { cloudUrl = "", apiKey = "" } = await chrome.storage.sync.get(["cloudUrl", "apiKey"]);
  const statusEl = document.getElementById("status");
  const hostEl = document.getElementById("host");
  const userEl = document.getElementById("user");

  if (!cloudUrl || !apiKey) {
    statusEl.textContent = "Not configured";
    statusEl.className = "bad";
  } else {
    try {
      const r = await fetch(`${cloudUrl}/api/me`, { headers: { "X-PA-Key": apiKey } });
      if (!r.ok) throw new Error("bad");
      const me = await r.json();
      statusEl.textContent = "Connected";
      statusEl.className = "ok";
      userEl.textContent = me.name;
    } catch {
      statusEl.textContent = "Offline / bad key";
      statusEl.className = "bad";
    }
  }

  const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
  try {
    hostEl.textContent = tab && tab.url ? new URL(tab.url).hostname.replace(/^www\./, "") : "—";
  } catch { hostEl.textContent = "—"; }

  document.getElementById("open-options").addEventListener("click", (e) => {
    e.preventDefault(); chrome.runtime.openOptionsPage();
  });
  document.getElementById("open-dashboard").addEventListener("click", (e) => {
    e.preventDefault();
    if (cloudUrl) chrome.tabs.create({ url: `${cloudUrl}/dashboard` });
    else chrome.runtime.openOptionsPage();
  });
}
init();
