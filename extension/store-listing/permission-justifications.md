# Permission Justifications

Chrome Web Store asks you to justify every permission listed in
`manifest.json`. Paste each section below into the matching field in the
"Privacy practices" tab of the Developer Dashboard.

**Tip**: keep each justification short, factual, and tied to a user-
visible feature. Reviewers reject vague justifications like "needed for
core functionality".

---

## `tabs` permission

**Why we need it**: The extension measures how long the user spends on
each website they visit. To do this, it must know the URL and title of
the currently-active tab at the moment focus changes. The `tabs`
permission grants read-only access to tab URLs and titles via
`chrome.tabs.onActivated`, `chrome.tabs.onUpdated`, and
`chrome.windows.onFocusChanged` events, which is exactly what the
service worker uses to tally per-domain dwell time.

Without this permission, the dashboard's "Website Activity" table, the
per-platform time totals, and the active/idle time counters cannot
work.

---

## `activeTab` permission

**Why we need it**: Used as a minimal-privilege complement to `tabs` so
that content scripts can interact with the currently-focused tab when
the user clicks the extension action (toolbar icon). This supports the
toolbar popup's live "today's stats" view which queries the active tab
for its current domain to colour the stats appropriately.

---

## `storage` permission

**Why we need it**: The extension persists daily activity snapshots and
user settings in the browser's local extension storage via
`chrome.storage.local` and `chrome.storage.sync`. Local storage holds
the day-by-day activity records (domain dwell, profile views, events).
Sync storage holds cross-device preferences (member name, email, sync
server URL, sync token, overlay toggle).

No data is synced to Google accounts beyond these small preference
fields. All activity data stays in `chrome.storage.local`.

---

## `idle` permission

**Why we need it**: The extension distinguishes "active" working time
from "idle" time (AFK, screen locked, computer sleeping) so that stats
are honest. It uses `chrome.idle.setDetectionInterval(60)` and
`chrome.idle.onStateChanged` to detect when the user stops interacting
with the machine.

Without this permission, the dashboard would report 8 hours of "active
time" for anyone who left LinkedIn open in a background tab overnight —
which would make the tool useless.

---

## `alarms` permission

**Why we need it**: Because the extension is built on Manifest V3, the
background script is a service worker that can be shut down at any
moment by the browser. To guarantee periodic work still happens, the
extension registers three `chrome.alarms` periodic alarms:

1. `pa-save` every 30 seconds — flushes the in-memory dwell buffer to
   `chrome.storage.local` so no activity is lost if the worker is
   terminated.
2. `pa-sync` every 5 minutes — runs the optional team-sync POST (only
   if the user enabled sync).
3. `pa-config-refresh` every 60 minutes — refreshes the admin-managed
   platform configuration from the team server.

`chrome.alarms` is the Manifest V3 replacement for `setInterval` in
long-running background pages and is the only reliable way to schedule
recurring work in a service worker.

---

## `host_permissions` — `https://www.linkedin.com/*` and `https://*.linkedin.com/*`

**Why we need it**: The extension injects a content script on LinkedIn
pages (`content-linkedin.js`) so it can detect self-initiated recruiter
actions: profile views, connection requests sent, messages sent, and
search queries. All detection is passive — the script watches for DOM
events triggered by the user's own clicks, never performs clicks on the
user's behalf, and never scrapes profiles the user has not visited.

For profile pages the user themselves navigates to (URLs matching
`linkedin.com/in/<handle>`), the script reads the person's display name
from the profile's `<h1>` element and their headline from the associated
`.text-body-medium` element, both of which are already visible in the
user's own browser window. This is the narrowest possible DOM access
that still allows the dashboard to show "who did I view today".

The wildcard `*.linkedin.com` covers subdomains the user may legitimately
browse such as `www.linkedin.com` and the Sales Navigator subdomain.

---

## `host_permissions` — `https://www.naukri.com/*` and `https://*.naukri.com/*`

**Why we need it**: Same reason as LinkedIn, applied to Naukri. The
`content-naukri.js` content script detects self-initiated profile views,
CV downloads, contact reveals, and search queries on Naukri — the
primary recruiting platform in India — so the user can see their Naukri
activity alongside their LinkedIn activity in the same dashboard.

---

## `host_permissions` — `https://*/*` (broad)

**Why we need it**: This is the most sensitive permission on the list
and requires the most careful explanation.

1. **Platform config is dynamic, not hard-coded.** The list of sites the
   extension tracks is fetched at runtime from the user's team server,
   not baked into the manifest. Our current default team config already
   includes 18 platforms (LinkedIn, Naukri, FoundIt, Monster, Dice,
   LinkedIn Sales Navigator, Seamless.AI, Apollo, Shine, CareerBuilder,
   Indeed, ZipRecruiter, Hirist, Instahyre, Glassdoor, Wellfound, Lusha,
   RocketReach) and new platforms can be added by the team admin at any
   time without shipping an extension update. Hard-coding every
   permitted host in the manifest would mean every new platform addition
   requires a fresh Chrome Web Store submission and review cycle, which
   is not workable for a config-driven tool.

2. **The floating stats overlay needs to run on any page.** The overlay
   content script (`content-overlay.js`) shows the user's own daily
   stats in a small draggable panel over any website, so they can see
   their productivity numbers without switching tabs. Restricting this
   to specific hosts would defeat its purpose.

3. **The sync POST must reach a user-configurable URL.** The team server
   URL is entered by the user in the Settings page — it is not
   hard-coded. The service worker's `fetch()` call to that URL requires
   a host permission that covers the chosen domain. Since the domain is
   user-chosen, the permission must be broad.

4. **We only ever READ the active tab's URL**, and only for the purpose
   of matching it against the admin-configured platform list. We do
   NOT inject scripts, read DOM, read cookies, read localStorage, or
   interact with any page that is not on the configured platform list
   or is not hosting the overlay.

5. **The extension has no backend that receives data from arbitrary
   hosts.** The only outbound network request is the optional sync POST
   to the user-configured team server URL. There is no data exfiltration
   path for any other host.

We understand broad host permissions are scrutinised heavily. If the
Chrome Web Store reviewer prefers a narrower permission model, we can
ship a version that fetches the admin-configured host list at install
time and uses `chrome.permissions.request()` to ask the user to approve
each platform interactively. Please let us know if that approach is
required for approval.
