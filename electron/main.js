// Electron main process - Productivity Analyser
// Boots the app, starts the activity tracker, the local bridge HTTP server,
// and exposes IPC handlers for the renderer dashboard to query analytics.

const { app, BrowserWindow, ipcMain, Tray, Menu, nativeImage } = require("electron");
const path = require("path");
const Tracker = require("./tracker/tracker");
const Bridge = require("./tracker/bridge");
const Store = require("./tracker/store");

let mainWindow = null;
let tray = null;
let tracker = null;
let bridge = null;
let store = null;

const isDev = process.argv.includes("--dev");

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 820,
    minWidth: 1024,
    minHeight: 640,
    backgroundColor: "#0b1016",
    titleBarStyle: process.platform === "darwin" ? "hiddenInset" : "default",
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  mainWindow.loadFile(path.join(__dirname, "..", "renderer", "index.html"));

  if (isDev) mainWindow.webContents.openDevTools({ mode: "detach" });

  mainWindow.on("close", (e) => {
    // Keep running in tray instead of fully quitting.
    if (!app.isQuitting) {
      e.preventDefault();
      mainWindow.hide();
    }
  });
}

function createTray() {
  const icon = nativeImage.createEmpty();
  tray = new Tray(icon);
  const menu = Menu.buildFromTemplate([
    { label: "Open Dashboard", click: () => mainWindow && mainWindow.show() },
    { label: "Pause Tracking", click: () => tracker && tracker.pause() },
    { label: "Resume Tracking", click: () => tracker && tracker.resume() },
    { type: "separator" },
    {
      label: "Quit",
      click: () => {
        app.isQuitting = true;
        app.quit();
      },
    },
  ]);
  tray.setToolTip("Productivity Analyser");
  tray.setContextMenu(menu);
}

app.whenReady().then(() => {
  // Initialise storage first - tracker & bridge both write to it.
  store = new Store();
  store.init();

  tracker = new Tracker({ store, sampleIntervalMs: 5000, idleThresholdSec: 60 });
  tracker.start();

  bridge = new Bridge({ store, port: 47624 });
  bridge.start();

  createWindow();
  createTray();

  // IPC handlers the renderer uses to pull analytics.
  ipcMain.handle("analytics:summary", (_e, { date }) => store.getDailySummary(date));
  ipcMain.handle("analytics:domains", (_e, { date }) => store.getDomainBreakdown(date));
  ipcMain.handle("analytics:apps", (_e, { date }) => store.getAppBreakdown(date));
  ipcMain.handle("analytics:linkedin", (_e, { date }) => store.getLinkedInActivity(date));
  ipcMain.handle("analytics:naukri", (_e, { date }) => store.getNaukriActivity(date));
  ipcMain.handle("analytics:timeline", (_e, { date }) => store.getTimeline(date));
  ipcMain.handle("tracker:status", () => tracker.status());
  ipcMain.handle("tracker:toggle", () => tracker.toggle());
});

app.on("window-all-closed", () => {
  // Keep running - tray handles quit.
});

app.on("before-quit", () => {
  app.isQuitting = true;
  if (tracker) tracker.stop();
  if (bridge) bridge.stop();
  if (store) store.close();
});
