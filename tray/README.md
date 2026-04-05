# Productivity Analyser – desktop tray agent (Windows)

Native companion to the Chrome/Firefox extension. Records the foreground
window + system idle time every few seconds, aggregates into 1-minute buckets
per `(app, title)`, and POSTs to the same cloud API the extension uses.

No install, no runtime: a single ~10 MB `.exe` that lives in the system tray.

## What it captures

- Foreground executable name (e.g. `outlook`, `teams`, `excel`, `code`, `chrome`)
- Foreground window title (trimmed, 200 char max)
- Coarse category: `Comms`, `Docs`, `Dev`, `Browser`, `Media`, `Other`
- Active vs idle time per minute (idle = no keyboard/mouse input for > 2 min,
  configurable)
- Machine hostname

Browser time is also reported so the dashboard can subtract it from the
desktop totals and avoid double-counting the extension's figures.

## Configuration

First launch writes `%APPDATA%\ProductivityAnalyser\config.json`. Edit that
file (tray menu → **Open settings file**) then restart the agent:

```json
{
  "cloud_url": "https://pa.your-company.com",
  "api_key":   "<recruiter's api key, same one used in the extension>",
  "poll_sec":  5,
  "flush_sec": 60,
  "idle_sec":  120
}
```

## Tray menu

- **Status** – last send time, backlog size, last error
- **Open dashboard** – opens `<cloud_url>/dashboard` in the default browser
- **Open settings file** – opens `config.json` in the default editor
- **Pause tracking** – stops polling until un-paused (flushes in-progress minute)
- **Flush now** – immediately POSTs any pending buckets
- **Quit** – final flush, then exit

## Building

From any OS (Windows SDK not required):

```bash
cd tray
go mod download
# Windows build (from Linux/macOS too):
GOOS=windows GOARCH=amd64 go build -ldflags "-H=windowsgui -s -w" -o pa-tray.exe .
```

The `-H=windowsgui` flag removes the console window; `-s -w` strip debug info.
Result: a single ~10 MB static `.exe`.

## Deployment

Drop `pa-tray.exe` anywhere (e.g. `C:\ProgramData\ProductivityAnalyser\`) and
add a shortcut to:

```
%AppData%\Microsoft\Windows\Start Menu\Programs\Startup\
```

It will auto-start on login. No admin rights required.

## Wire format

`POST <cloud_url>/api/ingest/desktop` with header `X-PA-Key: <key>`:

```json
[
  {
    "ts": 1712304000000,
    "active_ms": 55000,
    "idle_ms": 5000,
    "app": "outlook",
    "title": "Inbox – priya@acme.com – Outlook",
    "category": "Comms",
    "host": "DESKTOP-PRIYA"
  }
]
```

Failed batches buffer in memory (up to 5000 rows) and retry on the next
flush tick.
