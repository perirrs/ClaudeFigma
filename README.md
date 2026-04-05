# Productivity Analyser

Desktop productivity tool for recruitment & staffing teams. Monitors laptop activity with a focus on browser usage, and surfaces recruiter-specific analytics for **LinkedIn** and **Naukri**: time spent, profiles viewed (name + title), connections sent, messages sent, CV downloads, and searches run.

## What it tracks

- **System-level** (Electron desktop app):
  - Active application + window title, sampled every 5 s
  - Idle detection via OS idle timer (60 s threshold)
  - Per-app time on task
- **Browser-level** (Chrome extension, self-monitoring only):
  - Time on each domain / URL the user actually visits
  - LinkedIn: profile dwell time, profile name & title, connection requests sent, messages sent, searches run
  - Naukri: candidate profile dwell time, name & title, CV downloads, contact reveals, searches run

Everything is stored locally in a SQLite database at the user's Electron `userData` path. Nothing leaves the device.

## Architecture

```
┌──────────────────────────┐       ┌──────────────────────────┐
│  Chrome Extension (MV3)  │       │   Electron Desktop App   │
│  - background.js         │──────▶│   127.0.0.1:47624        │
│    (per-URL dwell)       │ HTTP  │   Bridge (HTTP)          │
│  - content-linkedin.js   │       │        │                 │
│  - content-naukri.js     │       │        ▼                 │
│    (events + profiles)   │       │   SQLite store           │
└──────────────────────────┘       │        ▲                 │
                                   │        │                 │
                                   │   Tracker (5s sampler)   │
                                   │   - active-win           │
                                   │   - powerMonitor idle    │
                                   │                          │
                                   │   Renderer Dashboard     │
                                   │   (IPC → store)          │
                                   └──────────────────────────┘
```

## Analytics surfaced in the dashboard

**Overview (daily summary)**
- Active time, Idle time
- LinkedIn time, Naukri time, Other active time
- Connections sent, Messages sent
- Unique LinkedIn profiles viewed
- Unique Naukri profiles viewed
- CV downloads

**LinkedIn / Naukri tabs**
- Profile table: Name · Title · View count · Time spent

**Apps & Domains tab**
- Time per desktop application
- Time per web domain (top 20)

**Timeline tab**
- 24-hour stacked chart (LinkedIn / Naukri / Other active / Idle)

## Running it

Prerequisites: Node.js 18+, Chrome.

```bash
# install deps (needs native build toolchain for better-sqlite3 + active-win)
npm install

# run the desktop app
npm start
```

Install the Chrome extension:

1. Open `chrome://extensions`
2. Enable **Developer mode**
3. Click **Load unpacked** and select the `extension/` folder
4. Pin the extension; click it to confirm it says "Connected"

## Packaging

```bash
npm run build:mac    # .dmg
npm run build:win    # .exe (NSIS)
npm run build:linux  # AppImage
```

## Project layout

```
electron/
  main.js              Electron entry, IPC, tray
  preload.js           Safe API bridge for renderer
  tracker/
    tracker.js         active-window / idle sampler
    bridge.js          Local HTTP endpoint (extension → store)
    store.js           SQLite schema, writes, aggregations
extension/
  manifest.json        MV3 manifest, host permissions
  background.js        Per-URL dwell tracker (service worker)
  content-linkedin.js  Profile / connect / message / search events
  content-naukri.js    Profile / CV download / contact / search events
  popup.html/js        Status popup showing bridge connectivity
renderer/
  index.html           Dashboard shell
  dashboard.js         Data fetching + rendering
  styles.css           Dark theme
```

## Important notes

- **Consent & compliance.** This is workplace productivity tooling. Deploy it only with clear, written notice to team members. Most jurisdictions require informed consent for employee monitoring.
- **Self-monitoring only.** The extension observes pages the user themselves navigates to. It does not crawl, enumerate, or scrape data the user has not otherwise visited. This keeps usage aligned with LinkedIn/Naukri terms.
- **Local-first.** All data is stored on-device in SQLite. No network calls other than the 127.0.0.1 bridge between the extension and the desktop app.
- **DOM selectors** for LinkedIn/Naukri profile name + title are heuristic and may need to be refreshed as those sites evolve.
