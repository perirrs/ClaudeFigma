// Preload bridge exposing a safe, typed API to the renderer.
const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("api", {
  getSummary: (date) => ipcRenderer.invoke("analytics:summary", { date }),
  getDomains: (date) => ipcRenderer.invoke("analytics:domains", { date }),
  getApps: (date) => ipcRenderer.invoke("analytics:apps", { date }),
  getLinkedIn: (date) => ipcRenderer.invoke("analytics:linkedin", { date }),
  getNaukri: (date) => ipcRenderer.invoke("analytics:naukri", { date }),
  getTimeline: (date) => ipcRenderer.invoke("analytics:timeline", { date }),
  trackerStatus: () => ipcRenderer.invoke("tracker:status"),
  toggleTracker: () => ipcRenderer.invoke("tracker:toggle"),
});
