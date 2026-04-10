# Screenshot Capture Instructions

Chrome Web Store requires **1-5 screenshots** at either **1280×800** or
**640×400** pixels, PNG or JPG. At least one **1280×800 PNG** is strongly
recommended — it's the size that renders crispest on the listing page.

You need to capture these yourself from your own running extension.
Below is exactly what to capture, at what size, and why each one matters
for approval.

## Capture environment setup

1. Open Chrome on your Windows machine.
2. Make sure the extension is built from the latest branch and loaded:
   - `chrome://extensions/` → Developer mode ON → Load unpacked →
     pick `C:\ClaudeFigma\ClaudeFigma\extension\dist\chrome`.
3. Open the extension's Settings and confirm sync is working (you
   should see "Connection OK! Department: Staffing and Recruitment,
   18 platform(s)."). This ensures the platform config is populated
   so the popup, overlay, and dashboard look fully functional.
4. Browse LinkedIn for ~5-10 minutes to generate some real-looking
   activity data (view a few profiles, run a search). The screenshots
   will be far more convincing with real numbers on them.

## Capturing at exactly 1280×800

The easiest way on Windows 11:

- Install [ShareX](https://getsharex.com/) (free).
- ShareX → Capture → Region → draw a 1280×800 rectangle. It shows the
  pixel dimensions live as you drag.
- OR: resize your Chrome window to approximately 1280×900 (window
  including title bar), then use the Windows Snipping Tool to capture
  the inner content area at ~1280×800.

Alternatively, Chrome DevTools can help:

- F12 → Toggle device toolbar (Ctrl+Shift+M) → pick "Responsive" →
  set width to 1280, height to 800 → capture that area only.

If you end up slightly off-size, PowerToys Image Resizer or any image
editor can crop to exact 1280×800.

---

## Screenshot #1 — Settings page with sync working ⭐ essential

**What to capture**: The extension's Settings page, scrolled to show
Member Identity, Team Sync (with "Connection OK! Department: Staffing
and Recruitment, 18 platform(s)." in green), and the Department &
Platforms list with at least 6-8 platforms visible.

**Why**: Proves to the reviewer that the extension works end-to-end
out of the box and shows the opt-in nature of sync (they'll see the
explicit checkbox and URL field).

**How**: Open the extension's Settings page in a full Chrome tab, make
the window 1280×900 roughly, take the shot.

---

## Screenshot #2 — Toolbar popup on a LinkedIn page ⭐ essential

**What to capture**: A LinkedIn profile page in the background, with the
extension's toolbar popup open in the foreground showing today's stats:
Active Time, Idle Time, Profiles Viewed, Actions Taken, Platform Time
breakdown.

**Why**: Shows the extension's most common interaction — "click the
icon, see your stats" — against its primary use case (LinkedIn).

**How**: Navigate to any public LinkedIn profile (e.g.
`linkedin.com/in/reidhoffman`), click the Productivity Analyser toolbar
icon, capture the whole Chrome window. Crop to 1280×800.

---

## Screenshot #3 — Full dashboard with history ⭐ essential

**What to capture**: The extension's full dashboard page (not the popup).
Scroll so it shows the KPI grid at the top (Active Time, Profiles
Viewed, Connections Sent, Messages Sent), a Platform Time card, and the
Website Activity table with a handful of real domains.

**Why**: The popup only shows today; the dashboard shows your team lead
that this is a serious analytics tool, not a toy.

**How**: Right-click the toolbar icon → "Open Dashboard" (or click
"Full Dashboard" from the popup). Capture the top half of the dashboard
at 1280×800.

---

## Screenshot #4 — Floating overlay on a live page (optional but nice)

**What to capture**: Any webpage (LinkedIn feed is ideal) with the
extension's green floating stats overlay docked in the corner showing
live counters.

**Why**: Sells the "always-visible productivity meter" angle.

**How**: Navigate to LinkedIn feed, confirm the overlay is visible
(toggle via Settings → "Show floating stats overlay" if hidden), let
it show some real numbers, capture.

---

## Screenshot #5 — Base44 team dashboard showing synced data (optional, strongest)

**What to capture**: Your team admin's view on `mpmt.base44.app` showing
a team member's My Activity page with real synced data — platform time
chart, website activity table, profiles viewed with real names.

**Why**: This is the killer screenshot for the "team sync" feature. It
proves the end-to-end pipeline works and shows what an admin actually
sees.

**How**: Log into `mpmt.base44.app` as an admin, navigate to the team
member's activity page (which should now show `sujith@mergenit.com`),
capture the full browser window, crop to 1280×800.

---

## Naming convention

Save the files as:

- `01-settings.png`
- `02-popup-linkedin.png`
- `03-dashboard.png`
- `04-overlay.png` (if captured)
- `05-team-dashboard.png` (if captured)

And drop them in `extension/store-listing/screenshots/` for repo hygiene
(add `screenshots/` to `.gitignore` if they contain real profile
names you don't want in the repo).

## Upload order

In the Chrome Web Store Developer Dashboard, upload them in the order
above. The first screenshot is the most prominent on the listing page,
so lead with whichever captures the value proposition best for your
audience — for personal/team use, Screenshot #3 (the dashboard) is
usually the most compelling.

## Things to blur or redact before uploading

- Real person names and photos that aren't yours, unless those people
  consented to being in a public Chrome Web Store listing.
- Your team token (visible in Settings — replace with `****` before
  capture, or blur it in the final image).
- Any email addresses that aren't your own.
- Base44 `AppSettings` values that are secret.

Use Paint.NET, GIMP, or PowerPoint's crop/redact tools to blur
sensitive regions. ShareX has a built-in "effects → blur" for regions.
