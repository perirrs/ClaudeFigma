async function check() {
  const statusEl = document.getElementById("status");
  const hostEl = document.getElementById("host");
  try {
    const r = await fetch("http://127.0.0.1:47624/ping");
    const j = await r.json();
    statusEl.textContent = j.ok ? "Connected" : "Error";
    statusEl.className = j.ok ? "ok" : "bad";
  } catch {
    statusEl.textContent = "Not running";
    statusEl.className = "bad";
  }
  const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
  try {
    hostEl.textContent = tab && tab.url ? new URL(tab.url).hostname.replace(/^www\./, "") : "—";
  } catch { hostEl.textContent = "—"; }
}
check();
