# Productivity Analyser — Privacy Policy

**Last updated**: 10 April 2026
**Effective date**: 10 April 2026

This privacy policy describes what data the Productivity Analyser Chrome
extension ("the Extension") collects, how it is used, where it is stored,
and who can see it. The Extension is designed for personal and internal
team use. It does not sell, share, or monetize your data.

## 1. Who we are

The Extension is developed and maintained by **Mergen IT / perirrs**.
Contact: **sujith@mergenit.com**

## 2. What the Extension does

The Extension helps its user track how they spend their own working time
across websites — particularly recruiting and sourcing platforms like
LinkedIn, Naukri, FoundIt, Monster, Dice, and similar. It presents
summaries in a popup, a floating on-page overlay, and a full dashboard.

Optionally, the user can enable "team sync" to upload their own daily
summaries to a self-hosted team server (a Base44 application) so that an
administrator can see aggregated productivity metrics for team members.

## 3. What data the Extension collects

### 3.1 Collected locally, always

When the user is browsing the web with the Extension enabled, it records:

- **Active and idle time** per day (milliseconds of foreground browser
  activity vs. time when the user is away from the keyboard).
- **Per-domain dwell time** — how many milliseconds the user's active tab
  spent on each domain (e.g. `linkedin.com`, `mail.google.com`).
- **Per-platform dwell time** for websites configured by the team
  administrator (e.g. LinkedIn, Naukri).
- **Self-initiated events** on configured platforms, specifically:
  - Profile views: the full profile URL, and — on LinkedIn only — the
    display name and job headline visible on the profile page the user
    themselves navigated to.
  - Connection requests the user sent from their own account.
  - Messages the user sent from their own account (counts only — message
    content is NEVER captured).
  - CV/resume downloads the user initiated.
  - Contact detail reveals the user initiated.
  - Search queries the user entered into the platform's search bar.
- **Event timeline**: a capped history (last 500 events per day) of the
  above for display in the dashboard.
- **User settings**: the name and email address the user entered in the
  Settings page (optional, only required if enabling sync).

All of the above is stored inside the browser using
`chrome.storage.local`. It does not leave the user's machine unless the
user explicitly enables team sync (see §3.2).

### 3.2 Transmitted to the team server, only if sync is enabled

If — and only if — the user ticks "Enable sync to team dashboard" in the
Settings page, enters a team Server URL, and enters a team Token, then
**once every 5 minutes** the Extension uploads the following to that
server via an HTTPS POST request:

- The user's name and email (as entered in Settings).
- The date of the activity summary.
- Active and idle time totals.
- Per-platform time totals.
- Per-domain time totals.
- The profile, connection, message, download, contact, and search event
  lists described in §3.1.
- The event timeline (last 500 events).
- The extension version and a timestamp of the sync.

The user chooses which server receives this data. In typical team
deployments the server is a Base44 application operated by the user's
own employer (example: `https://mpmt.base44.app`). Neither the Extension
author nor Google receives any of this data.

### 3.3 What the Extension does NOT collect

The Extension never collects, reads, or transmits any of the following:

- **The HTML content of web pages** you visit (except for two narrow
  cases: reading the `<h1>` element of a LinkedIn profile page to
  extract the person's display name, and reading the associated
  headline/job title element — neither of which includes any content
  the user hasn't already loaded into their own browser).
- **Form input**, including search boxes, message composers, login
  fields, or any other input the user types.
- **Direct messages, emails, or any message body text** sent or received
  on any platform.
- **Passwords, cookies, session tokens, or any authentication material**
  belonging to any website.
- **Payment information, credit card numbers, or financial data** of any
  kind.
- **Your identity on sites other than the ones you explicitly configure**
  — the Extension does not probe, fingerprint, or profile you.
- **Browsing history on incognito tabs** — the Extension does not run
  in private/incognito browsing mode unless the user has explicitly
  opted in via Chrome's extension settings.
- **Location data**, device fingerprints, or analytics pings.

## 4. How the data is used

- **Locally**: to display daily, weekly, and monthly summaries of your
  own productivity in the popup, overlay, and dashboard.
- **On the team server** (only if sync is enabled): to let your team's
  administrator see aggregated productivity metrics across team members.
  The server-side data model and access rules are controlled by the team
  administrator who operates the Base44 application, not by us.

The data is **not** used for:
- Advertising or marketing.
- Sale or transfer to third parties.
- Machine learning training.
- Creditworthiness or lending decisions.
- Any purpose unrelated to productivity self-tracking.

## 5. Where the data is stored

- **On your device**: inside your browser's extension storage
  (`chrome.storage.local` and `chrome.storage.sync`). This storage is
  cleared when you uninstall the Extension or when you click "Clear All
  Data" in the Settings page.
- **On the team server** (only if sync is enabled): inside the Base44
  application database operated by your team's administrator. Retention,
  deletion, and access controls there are the administrator's
  responsibility.

## 6. Who can see the data

- **You**, always, via the Extension's popup, overlay, and dashboard.
- **Your team's administrator**, only if you enabled sync, and only via
  the team server the administrator operates.
- **Nobody else**. The Extension does not transmit data to the Extension
  author, to Google, to any analytics service, or to any third party.

## 7. Third parties

The Extension uses no third-party services, analytics platforms, SDKs,
advertising networks, or data brokers. The only network request the
Extension makes is the optional sync POST to the user-configured team
server URL. There are no other network calls.

## 8. Data retention

- **Local data**: kept until the user clicks "Clear All Data" in Settings,
  uninstalls the Extension, or clears browser storage. The Extension
  does not auto-expire local data.
- **Server-side data** (if sync is enabled): retained by the team
  administrator according to their own policy. Contact your team
  administrator to request deletion or export of your server-side data.

## 9. Your rights and controls

You can, at any time:

- **Disable sync** — untick "Enable sync to team dashboard" in Settings.
  No further data will be uploaded.
- **Clear all local data** — click "Clear All Data" in Settings. All
  stored days, events, and profiles are erased immediately.
- **Uninstall the Extension** — via `chrome://extensions/`. Uninstalling
  removes all local data.
- **Request server-side deletion** — contact your team administrator
  (the operator of the team server URL configured in your Settings).
- **Inspect what's stored** — open DevTools on any extension page and
  run `chrome.storage.local.get(null)` to see everything the Extension
  knows about you.

## 10. Children

The Extension is not directed at children under 13 and should not be
installed by them. It is intended for adult professional users.

## 11. Changes to this policy

If the Extension's data handling changes in a material way, this policy
will be updated and the "Last updated" date at the top of this document
will change. Substantive changes will also be announced in the
Extension's update notes on the Chrome Web Store listing.

## 12. Contact

Questions, concerns, or deletion requests:

**Email**: sujith@mergenit.com
**GitHub**: https://github.com/perirrs/ClaudeFigma

## 13. Limited Use disclosure

This Extension's use and transfer of information received from any
Chrome API adheres to the Chrome Web Store User Data Policy, including
the Limited Use requirements. Specifically:

- **We do not sell** user data to third parties.
- **We do not use or transfer** user data for purposes unrelated to the
  single purpose of the Extension stated in its Chrome Web Store listing.
- **We do not use or transfer** user data to determine creditworthiness
  or for lending purposes.
- **We do not allow humans to read** user data, except: (a) with the
  user's explicit consent, (b) when necessary for security purposes
  (e.g. investigating abuse), (c) to comply with applicable law, or
  (d) as required for operations where the data is aggregated or
  anonymized and used for internal quality improvements.
