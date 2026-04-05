// Activity tracker - samples the active window / idle state on an interval
// and records per-sample duration into the store.
//
// We rely on `active-win` for foreground window metadata and Electron's
// `powerMonitor.getSystemIdleTime()` for OS-level idle detection. Browser
// tab URLs come from the Chrome extension via the local bridge server; the
// tracker correlates by time and lets the store aggregate.

const { powerMonitor } = require("electron");

let activeWin = null;
try {
  activeWin = require("active-win");
} catch {
  console.warn("[tracker] active-win not available, using stub");
}

function domainOf(url) {
  if (!url) return null;
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}

class Tracker {
  constructor({ store, sampleIntervalMs = 5000, idleThresholdSec = 60 }) {
    this.store = store;
    this.sampleIntervalMs = sampleIntervalMs;
    this.idleThresholdSec = idleThresholdSec;
    this.timer = null;
    this.paused = false;
    this.lastSampleAt = null;
  }

  start() {
    if (this.timer) return;
    this.lastSampleAt = Date.now();
    this.timer = setInterval(() => this._tick().catch(() => {}), this.sampleIntervalMs);
  }

  stop() {
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
  }

  pause() { this.paused = true; }
  resume() { this.paused = false; this.lastSampleAt = Date.now(); }
  toggle() { this.paused = !this.paused; if (!this.paused) this.lastSampleAt = Date.now(); return { paused: this.paused }; }
  status() { return { running: !!this.timer, paused: this.paused }; }

  async _tick() {
    if (this.paused) {
      this.lastSampleAt = Date.now();
      return;
    }
    const now = Date.now();
    const duration = Math.min(now - (this.lastSampleAt || now), this.sampleIntervalMs * 2);
    this.lastSampleAt = now;

    const idleSec = powerMonitor.getSystemIdleTime();
    const isIdle = idleSec >= this.idleThresholdSec;

    let appName = null;
    let title = null;
    let url = null;

    if (!isIdle && activeWin) {
      try {
        const win = await activeWin();
        if (win) {
          appName = win.owner && win.owner.name;
          title = win.title;
          // Some builds of active-win expose URL for browsers on macOS.
          url = win.url || null;
        }
      } catch {
        // swallow - keep sampling
      }
    }

    this.store.insertSample({
      ts: now,
      duration_ms: duration,
      app: appName,
      title,
      url,
      domain: domainOf(url),
      idle: isIdle,
    });
  }
}

module.exports = Tracker;
