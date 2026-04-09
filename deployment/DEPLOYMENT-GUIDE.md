# Deployment Guide — Productivity Analyser Extension

Deploy to 100+ laptops with auto-updates and centralized team dashboard.

## Overview

```
[Chrome Extension on each laptop]
        │ (POST every 5 min)
        ▼
[Your Base44 App — /api/pa-sync endpoint]
        │
        ▼
[RecruiterActivity entity — stores daily summaries]
        │
        ▼
[TeamDashboard component — shows all recruiters]
```

---

## Step 1: Set Up Base44 Backend

### 1a. Create the Entity

In your Base44 app, create a new entity called **RecruiterActivity** with the schema from `entity-schema.json`. Key fields:
- `recruiterName` (string) — recruiter's full name
- `recruiterEmail` (string) — unique identifier
- `date` (string) — YYYY-MM-DD
- `activeMs`, `linkedinMs`, `naukriMs` (number) — time in ms
- `liConnections`, `liMessages`, `naukriDownloads`, etc. (integer) — counts

### 1b. Create the Sync Endpoint

Create a backend function in Base44 using the code from `sync-endpoint.ts`. This receives POST requests from extensions and upserts records by (recruiterEmail + date).

Set a team token as a secret: `PA_TEAM_TOKEN` = any random string (e.g., generate with `openssl rand -hex 32`).

### 1c. Add the Dashboard Page

Create a new page in your Base44 app and use the `TeamDashboard.tsx` component. Update the entity import to match your Base44 SDK path.

---

## Step 2: Build the Extension

```bash
# Build Chrome zip
bash deployment/build-crx.sh chrome

# Build Firefox zip (if needed)
bash deployment/build-crx.sh firefox
```

Output: `dist/productivity-analyser-chrome-v0.4.0.zip`

---

## Step 3: Deploy to Laptops

### Option A: Chrome Web Store (Recommended — Easiest Updates)

1. Go to https://chrome.google.com/webstore/devconsole
2. Upload the zip as an **unlisted** extension (only people with the link can find it)
3. Note the extension ID after publishing
4. Share the install link with your team, or force-install via policy (Step 4)

**Updates**: Just upload a new zip with bumped version. Chrome auto-updates within hours.

### Option B: Self-Hosted CRX (No Web Store needed)

1. Open `chrome://extensions` → enable Developer mode
2. Load the unpacked extension → note the extension ID
3. Pack the extension → get `.crx` file and `key.pem`
4. Host the `.crx` and `updates.xml` on an internal web server
5. Update `updates.xml` with your extension ID and CRX URL
6. Configure Chrome policy to force-install (Step 4)

**Updates**: Replace the `.crx` file, bump version in `updates.xml`. Chrome checks daily.

### Option C: Manual Install (Quick for small teams)

1. Share the zip file
2. Each person: unzip → `chrome://extensions` → Developer mode → "Load unpacked"
3. For updates: share new zip, they reload

---

## Step 4: Enterprise Policy (Force-Install on Managed Devices)

### Windows (Group Policy)

1. Download Chrome ADMX templates: https://chromeenterprise.google/browser/download/
2. Open Group Policy Editor → Computer Configuration → Administrative Templates → Google Chrome → Extensions
3. Set "Configure the list of force-installed extensions"
4. Add: `YOUR_EXTENSION_ID;https://your-server.com/extensions/updates.xml`

### Windows (Registry)

```reg
[HKEY_LOCAL_MACHINE\SOFTWARE\Policies\Google\Chrome\ExtensionInstallForcelist]
"1"="YOUR_EXTENSION_ID;https://your-server.com/extensions/updates.xml"
```

### Linux

Create `/etc/opt/chrome/policies/managed/productivity-analyser.json`:
```json
{
  "ExtensionInstallForcelist": [
    "YOUR_EXTENSION_ID;https://your-server.com/extensions/updates.xml"
  ]
}
```

### macOS (MDM)

Use a configuration profile with `com.google.Chrome` preference domain:
```xml
<key>ExtensionInstallForcelist</key>
<array>
  <string>YOUR_EXTENSION_ID;https://your-server.com/extensions/updates.xml</string>
</array>
```

---

## Step 5: Pre-Configure Sync Settings (Optional)

Instead of each recruiter manually entering the server URL and token:

### Windows Registry
```reg
[HKEY_LOCAL_MACHINE\SOFTWARE\Policies\Google\Chrome\3rdparty\extensions\YOUR_EXTENSION_ID\policy]
"syncUrl"="https://your-app.base44.app/api/pa-sync"
"syncToken"="your-team-token"
"syncEnabled"=dword:00000001
```

### Linux
Create `/etc/opt/chrome/policies/managed/pa-managed-storage.json`:
```json
{
  "3rdparty": {
    "extensions": {
      "YOUR_EXTENSION_ID": {
        "syncUrl": "https://your-app.base44.app/api/pa-sync",
        "syncToken": "your-team-token",
        "syncEnabled": true
      }
    }
  }
}
```

With this, recruiters only need to enter their **name and email** in the extension settings. Server URL and token are pre-filled by policy.

---

## Step 6: What Each Recruiter Does

1. Open the extension settings (right-click extension icon → Options)
2. Enter their **full name** and **email**
3. If sync URL isn't pre-filled, enter: `https://your-app.base44.app/api/pa-sync`
4. Enter the team token (if not pre-filled)
5. Check "Enable sync to team dashboard"
6. Click "Test Connection" → should show "Connection OK!"
7. Click "Save Settings"

Data starts syncing automatically every 5 minutes.

---

## Updating the Extension

1. Make changes to the code
2. Bump version in `extension/manifests/chrome.json`
3. Rebuild: `bash deployment/build-crx.sh chrome`
4. Upload to Chrome Web Store (Option A) or replace the hosted CRX (Option B)
5. Chrome auto-updates within 1–24 hours

---

## What Gets Synced (Privacy)

Only aggregated daily summaries are sent to the server:
- Time totals (active, idle, LinkedIn, Naukri)
- Counts (profiles viewed, connections, messages, downloads)
- Top 10 domains with time spent

**NOT synced**: individual browsing events, profile names/URLs, raw page visits.
