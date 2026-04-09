async function load() {
  const { showOverlay = true } = await chrome.storage.sync.get(["showOverlay"]);
  document.getElementById("showOverlay").checked = showOverlay !== false;
}
load();

document.getElementById("save").addEventListener("click", async () => {
  const showOverlay = document.getElementById("showOverlay").checked;
  await chrome.storage.sync.set({ showOverlay });
  document.getElementById("status").textContent = "Saved!";
  setTimeout(() => { document.getElementById("status").textContent = ""; }, 2000);
});

document.getElementById("clear-data").addEventListener("click", async () => {
  if (!confirm("This will delete ALL tracked data (all days). Are you sure?")) return;
  await chrome.storage.local.clear();
  document.getElementById("status").textContent = "All data cleared.";
});
