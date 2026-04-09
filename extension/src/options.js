let activeTab = "pw";

function switchTab(tab) {
  activeTab = tab;
  document.getElementById("tab-pw").className = tab === "pw" ? "tab active" : "tab";
  document.getElementById("tab-key").className = tab === "key" ? "tab active" : "tab";
  document.getElementById("section-pw").className = tab === "pw" ? "section" : "section hidden";
  document.getElementById("section-key").className = tab === "key" ? "section" : "section hidden";
}
// expose for inline onclick
window.switchTab = switchTab;

async function load() {
  const { cloudUrl = "http://localhost:3000", apiKey = "", showOverlay = true, email = "" } =
    await chrome.storage.sync.get(["cloudUrl", "apiKey", "showOverlay", "email"]);
  document.getElementById("cloudUrl").value = cloudUrl;
  document.getElementById("apiKey").value = apiKey;
  document.getElementById("showOverlay").checked = showOverlay !== false;
  document.getElementById("email").value = email;
}
load();

document.getElementById("save").addEventListener("click", async () => {
  const cloudUrl = document.getElementById("cloudUrl").value.trim().replace(/\/$/, "");
  const showOverlay = document.getElementById("showOverlay").checked;
  const status = document.getElementById("status");
  status.textContent = "Testing…"; status.className = "status";

  if (activeTab === "pw") {
    // Email + password login: exchange for API key via /api/auth/login
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    if (!email || !password) {
      status.textContent = "Enter both email and password";
      status.className = "status bad";
      return;
    }
    try {
      const r = await fetch(`${cloudUrl}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!r.ok) {
        const j = await r.json().catch(() => ({}));
        throw new Error(j.error || "Login failed");
      }
      const me = await r.json();
      // Store the API key we got back — the extension uses it for all future requests
      await chrome.storage.sync.set({ cloudUrl, apiKey: me.api_key, showOverlay, email });
      status.textContent = `Connected as ${me.name}.`;
      status.className = "status ok";
    } catch (e) {
      status.textContent = e.message || "Failed to connect";
      status.className = "status bad";
    }
  } else {
    // Classic API key mode
    const apiKey = document.getElementById("apiKey").value.trim();
    try {
      const r = await fetch(`${cloudUrl}/api/me`, { headers: { "X-PA-Key": apiKey } });
      if (!r.ok) throw new Error("Invalid key or URL");
      const me = await r.json();
      await chrome.storage.sync.set({ cloudUrl, apiKey, showOverlay });
      status.textContent = `Connected as ${me.name}.`;
      status.className = "status ok";
    } catch (e) {
      status.textContent = e.message || "Failed to connect";
      status.className = "status bad";
    }
  }
});
