# Productivity Analyser

Chrome extension + cloud dashboard for **recruitment & staffing team productivity**. The extension is the only agent the recruiter installs; everything syncs to a central Next.js cloud app where each recruiter sees their own day and admins see the whole team.

A native Windows companion agent is planned to cover the gap the extension cannot reach (non-browser app time).

## What you get

**Per-recruiter daily analytics** (dashboard)

- Active time · Idle time · Total time
- LinkedIn time · Naukri time · Other browser time
- **LinkedIn**: profiles viewed (with name + title + dwell time + view count), connections sent, messages sent, searches run
- **Naukri**: candidate profiles viewed (name + title + dwell + views), CV downloads, contact reveals, searches
- Hourly timeline (stacked LinkedIn / Naukri / Other / Idle)
- Top domains visited

**Team view (admin)**

- All recruiters, same day, one table: active / idle / LinkedIn / Naukri / connections / messages / profiles / CVs
- Team-wide totals at the top

## Repo layout

```
cloud/         Next.js 14 app (TypeScript, App Router)
  src/app/api/                 ingest + analytics endpoints
  src/app/dashboard|linkedin|naukri|domains|timeline|team/  pages
  src/lib/                     db (SQLite), auth (API key), analytics
extension/     Chrome MV3 extension
  background.js                per-URL dwell + idle + outbound batch flush
  content-linkedin.js          profile / connect / message / search events
  content-naukri.js            profile / CV / contact / search events
  options.html|js              configure cloud URL + API key
  popup.html|js                status + quick dashboard link
```

## Architecture

```
┌──────────────────────────┐       HTTPS        ┌──────────────────────────┐
│  Chrome Extension (MV3)  │──X-PA-Key header──▶│   Cloud (Next.js)        │
│  - per-URL dwell         │                    │   /api/ingest/dwell      │
│  - linkedin content.js   │                    │   /api/ingest/event      │
│  - naukri content.js     │                    │        │                 │
│  - 30s batched flush     │                    │        ▼                 │
└──────────────────────────┘                    │   SQLite (swap to PG)    │
                                                │        ▲                 │
┌──────────────────────────┐                    │        │                 │
│  Recruiter / Admin       │◀──── Cookie ──────▶│   /dashboard /team ...   │
│  browser                 │                    │                          │
└──────────────────────────┘                    └──────────────────────────┘
```

## Running the cloud app

```bash
cd cloud
npm install
# optional: set the admin key so you don't need to read server logs
export PA_ADMIN_KEY=supersecret-admin-key
npm run dev          # http://localhost:3000
```

On first run, an `admin` user is seeded and its API key is printed in the console (or set to `PA_ADMIN_KEY` if provided). Paste that key on `/` to sign in.

### Creating recruiter users (admin only)

```bash
curl -X POST http://localhost:3000/api/users \
  -H "X-PA-Key: <admin-key>" \
  -H "Content-Type: application/json" \
  -d '{"name":"Priya Sharma","email":"priya@acme.com","team":"Tech Hiring"}'
```

Response includes a fresh `api_key`. Hand it to the recruiter; they paste it into the extension **Settings** page.

## Installing the extension

1. Open `chrome://extensions` → enable **Developer mode**
2. **Load unpacked** → select `extension/`
3. Click the extension icon → **Settings** → paste cloud URL + personal API key → **Save & test**
4. Popup should now say **Connected**

Data starts flowing immediately. Background batches flush every ~30 s; short network outages are buffered (up to 500 records each for dwell + events).

## Deploying the cloud app

- **Single VM (simplest)**: `npm run build && npm start` behind a reverse proxy. SQLite file lives under `cloud/data/productivity.db`. Persist that directory.
- **Postgres later**: replace `cloud/src/lib/db.ts` with a `pg` client; schema in that file maps 1:1.
- **Vercel**: requires swapping SQLite for a hosted DB (Neon, Supabase, Turso). The route handlers are already `runtime = "nodejs"`.

## What the extension captures vs. what still needs native

| Capability | Extension | Windows agent |
|---|:-:|:-:|
| Per-URL / per-domain time | ✅ | — |
| LinkedIn profiles, connections, messages, searches | ✅ | — |
| Naukri profiles, CV downloads, contacts, searches | ✅ | — |
| Chrome idle (no activity in browser) | ✅ | — |
| Time in Outlook / Teams / Excel / Zoom / ATS desktop apps | ❌ | ✅ |
| Active window title outside Chrome | ❌ | ✅ |
| System idle when Chrome closed | partial (via alarms) | ✅ |
| Edge / Firefox time | ❌ (unless extension ported) | ✅ |
| Screenshots / keystroke counts | ❌ | optional |

Once we see how much of the real workflow sits inside Chrome, the Windows agent can be scoped precisely — it will just POST to the same `/api/ingest/*` endpoints.

## Compliance

- Deploy only with recruiters' informed written consent.
- The extension is self-monitoring: it only records pages the user themselves navigates to. It does not crawl, enumerate, or scrape LinkedIn/Naukri beyond what the recruiter visits, staying aligned with those platforms' terms.
- All data is stored on your own server / DB. No third-party analytics.

## Roadmap

1. Weekly / monthly rollups + per-recruiter targets
2. CSV / PDF daily export
3. Windows companion agent (active-win + powerMonitor) → same ingest endpoints
4. Anti-tamper check (flags gaps in data stream)
