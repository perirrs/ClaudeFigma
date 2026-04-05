async function load() {
  const { cloudUrl = "http://localhost:3000", apiKey = "" } = await chrome.storage.sync.get(["cloudUrl", "apiKey"]);
  document.getElementById("cloudUrl").value = cloudUrl;
  document.getElementById("apiKey").value = apiKey;
}
load();

document.getElementById("save").addEventListener("click", async () => {
  const cloudUrl = document.getElementById("cloudUrl").value.trim().replace(/\/$/, "");
  const apiKey = document.getElementById("apiKey").value.trim();
  const status = document.getElementById("status");
  status.textContent = "Testing…"; status.className = "status";
  try {
    const r = await fetch(`${cloudUrl}/api/me`, { headers: { "X-PA-Key": apiKey } });
    if (!r.ok) throw new Error("Invalid key or URL");
    const me = await r.json();
    await chrome.storage.sync.set({ cloudUrl, apiKey });
    status.textContent = `Connected as ${me.name}.`;
    status.className = "status ok";
  } catch (e) {
    status.textContent = e.message || "Failed to connect";
    status.className = "status bad";
  }
});
