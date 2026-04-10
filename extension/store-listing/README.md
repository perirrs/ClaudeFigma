# Chrome Web Store Submission Guide — Productivity Analyser

This folder contains everything you need to submit the extension to the
Chrome Web Store. It is written for **personal/internal use only** — not
mass-market distribution — so the recommendations lean toward keeping
visibility restricted.

## Files in this folder

| File | What it's for | Where to paste it |
|---|---|---|
| `privacy-policy.md` | Full privacy policy text | Host this publicly, then paste the URL into the "Privacy policy URL" field |
| `short-description.txt` | ≤132 character summary | Store listing → "Summary" field |
| `long-description.md` | Full detailed description | Store listing → "Description" field |
| `permission-justifications.md` | One justification per manifest permission | Privacy practices → "Permission justification" fields |
| `single-purpose.txt` | One-sentence single-purpose statement | Privacy practices → "Single purpose" field |
| `data-usage-disclosures.md` | Checklist of what to tick on the disclosure form | Privacy practices → data usage checkboxes |
| `screenshot-instructions.md` | What screenshots to capture and how | Use as a capture checklist |

## Step-by-step submission flow

### 1. Prerequisites (one-time, ~30 min)

- [ ] **Create a dedicated Google account** for publishing — do NOT use a
      personal Gmail. Something like `extensions@mergenit.com` is ideal
      because it survives staff turnover.
- [ ] **Pay the $5 developer registration fee** at
      https://chrome.google.com/webstore/devconsole
      (Click "Add new item" → you'll be prompted to pay the $5 before
      you can upload anything.)
- [ ] **Accept the Developer Program Policies** — read the "User Data
      FAQ" section carefully since this extension collects browsing data.
- [ ] **Verify your publisher email** — Google sends a confirmation.

### 2. Host your privacy policy (5 min)

Google requires a **publicly-accessible URL** for the privacy policy.
Pick ONE of these three options:

**Option A — GitHub Pages (free, recommended for this repo)**

1. On GitHub, go to `perirrs/ClaudeFigma` → Settings → Pages.
2. Under "Source", pick the `main` branch (or whichever is public) and
   `/` (root) or `/docs`. Save.
3. Copy the privacy-policy.md contents into a file called `privacy.html`
   at the repo root (wrap it in `<html><body><pre>…</pre></body></html>`
   if you don't want to convert to HTML), commit, push.
4. Your URL will be `https://perirrs.github.io/ClaudeFigma/privacy.html`.

**Option B — Host on your Base44 app (looks professional)**

1. In your Base44 dashboard for `mpmt.base44.app`, create a new public
   page called `/privacy`.
2. Paste the markdown content (or rendered HTML) into it.
3. Your URL will be `https://mpmt.base44.app/privacy`.

**Option C — GitHub Gist (fastest, ugliest)**

1. Go to https://gist.github.com → new public gist → paste
   `privacy-policy.md` contents → "Create public gist".
2. Click "Raw" → copy that URL.

Write the final URL down — you'll need it in Step 4.

### 3. Capture screenshots (15-30 min)

Follow `screenshot-instructions.md`. You need **1-5 screenshots** at
1280×800 or 640×400 PNG/JPG. At least one 1280×800 is strongly
recommended.

### 4. Package the extension ZIP

From PowerShell on your Windows machine:

```powershell
cd C:\ClaudeFigma\ClaudeFigma\extension
git pull origin claude/figma-integration-SSyQ8
node build.js
Compress-Archive -Path .\dist\chrome\* -DestinationPath .\productivity-analyser-v0.5.0.zip -Force
```

The ZIP will be `productivity-analyser-v0.5.0.zip`. That's what you
upload to the Chrome Web Store.

**Critical**: zip the *contents* of `dist/chrome/`, NOT the `dist/chrome/`
folder itself. When Chrome opens the ZIP it should see `manifest.json`
at the top level. The `-Path .\dist\chrome\*` above is correct.

### 5. Create the Web Store listing

1. Go to https://chrome.google.com/webstore/devconsole → "Add new item".
2. Upload `productivity-analyser-v0.5.0.zip`.
3. Fill in each tab. Reference the files in this folder as you go:

   **Store listing tab**
   - Product name: `Productivity Analyser`
   - Summary: paste `short-description.txt`
   - Description: paste `long-description.md`
   - Category: `Productivity`
   - Language: `English (United Kingdom)` or whichever fits
   - Icon: auto-picked from manifest (128×128 green bar chart)
   - Screenshots: upload the ones from Step 3
   - Promotional tile: optional, skip for personal use
   - Marquee tile: optional, skip

   **Privacy practices tab**
   - Single purpose: paste `single-purpose.txt`
   - Permission justifications: paste each section of
     `permission-justifications.md` into the matching field
   - Data usage disclosures: tick the boxes per
     `data-usage-disclosures.md`
   - Certifications: tick all three "we do not sell / misuse / use for
     creditworthiness" boxes
   - Privacy policy URL: paste the URL from Step 2

   **Distribution tab**
   - Visibility: **Unlisted** (recommended for personal use — see below)
   - Regions: your country only, or worldwide
   - Pricing: Free

4. Click **Submit for review**.

### 6. Wait for review

- First submission: typically **2-7 days** of manual review.
- You'll get an email with approval or rejection reasons.
- If rejected, the email will point to the exact rule you tripped — fix
  it, resubmit, usually cleared in a few hours.

### 7. Install it yourself

Once approved:

1. You'll see the extension in your Developer Dashboard under "In store".
2. Click the **public link** (the `chrome.google.com/webstore/detail/...`
   URL). If Unlisted, this URL works for anyone you share it with; it
   just won't show up in search.
3. On the listing page, click **Add to Chrome** → install as normal.
4. Open Settings → paste your member name, email, server URL, and team
   token → Save → Sync Now.

---

## Distribution visibility — which to pick

For **personal use only**, the choice is between:

| Visibility | When to pick it | Trade-off |
|---|---|---|
| **Unlisted** ⭐ recommended | You want a normal install flow (Add to Chrome button) but don't want strangers finding the extension in search results. | Anyone with the direct URL can install — but they still need your Base44 token to actually sync anywhere. |
| **Private** | You use Google Workspace (e.g. `@mergenit.com` managed by Google Admin). You want to restrict installs to only your Workspace domain. | Requires Workspace admin setup. Non-Workspace accounts can't install at all. |
| **Public** | Mass distribution. | NOT recommended for personal use — exposes you to public scrutiny, bug reports from strangers, and Google's stricter review. |

**Recommendation**: start with **Unlisted**. You get a shareable URL,
normal install experience, no search exposure, no Workspace setup
needed. If you later want to lock it to just your company domain,
switch to Private at any time from the Distribution tab.

Your sync token is the real access control anyway — without a valid
`syncApiKey` from your Base44 `AppSettings`, the extension can't send
data anywhere. Visibility just controls who can *find* the extension,
not who can *use* the backend.

---

## Common rejection reasons & how we've avoided them

1. **"Use of permissions is not justified"** → See `permission-justifications.md`,
   every permission has a specific reason tied to a user-visible feature.
2. **"Broad host permissions without justification"** → We use `https://*/*`
   because the admin-configured platform list is dynamic (18+ domains and
   growing). The justification file explains this.
3. **"Privacy policy missing or doesn't match disclosures"** → See
   `privacy-policy.md` — the disclosures match exactly.
4. **"Extension does more than one thing"** → See `single-purpose.txt`.
   We explicitly frame everything as "productivity self-tracking" so
   the overlay, popup, dashboard, and sync all serve the same purpose.
5. **"Remotely hosted code"** → MV3 forbids `eval()` and remote script
   execution. We only `fetch()` JSON, never HTML/JS. Safe.
6. **"Functionality not working"** → Before submitting, click through
   every button in Settings, popup, dashboard to confirm nothing is broken.
   Reviewers actually test the extension.

---

## After first approval — updates

When you change code and want to ship an update:

1. Bump the version in `extension/manifests/chrome.json` (e.g.
   `0.5.0` → `0.5.1`).
2. `node build.js`
3. Re-zip `dist/chrome/*`.
4. On the Dev Dashboard → your item → **Package** tab → upload the new ZIP.
5. Save & publish. Subsequent updates usually clear review in a few hours
   since Google recognizes the extension.

Do **not** delete the old item and re-submit — you'll lose your install
base and review history.
