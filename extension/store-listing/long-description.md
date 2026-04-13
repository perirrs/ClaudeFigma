Productivity Analyser is a self-tracking tool for recruiters, sourcers, and sales professionals who want an honest picture of how they spend their working day. It records your own activity — active time, idle time, time spent on the sites your team administrator has configured, profiles you visited, connection requests you sent, messages you sent, and searches you ran — and shows you clean daily, weekly, and monthly summaries. Everything stays on your own computer unless you explicitly enable team sync.

────────────────────────
WHO IT IS FOR
────────────────────────

• Recruiters and sourcers who spend most of their day on professional networking and sourcing sites.
• Sales development representatives who want to measure prospecting effort honestly.
• Team leads who need aggregated productivity metrics without installing heavyweight monitoring software on their team's machines.
• Anyone who wants to know — without guesswork — how many focused hours they actually spent on work today.

────────────────────────
WHAT IT TRACKS
────────────────────────

• Active browsing time, with idle detection so away-from-keyboard time is excluded.
• Per-domain dwell time.
• Profile views on the sites your administrator configures.
• Connection requests you sent from your own account.
• Messages you sent from your own account. Counts only — message content is never read.
• Resume and CV downloads you triggered.
• Contact detail reveals you triggered.
• Search queries you ran yourself.

All activity appears in three places inside the extension: a floating on-page overlay with today's live stats, a toolbar popup that summarises today at a glance, and a full dashboard with history, charts, and event timelines.

────────────────────────
HOW CONFIGURATION WORKS
────────────────────────

Productivity Analyser is configuration-driven. The list of sites the extension tracks, the colours used on the dashboard, the profile URL patterns, and which metrics are relevant per site all come from a small configuration endpoint on your own team server. A team administrator can add a new site server-side and every team member's extension picks up the change at the next refresh — no extension update required. The default configuration ships with LinkedIn enabled out of the box.

────────────────────────
PRIVACY — PLEASE READ
────────────────────────

• All tracked data is stored locally in your browser by default. It never leaves your computer unless you tick "Enable sync to team dashboard" and supply your own server URL and team token.
• When sync is enabled, a daily summary is POSTed over HTTPS every five minutes to the exact server URL you configured — a server that you or your team administrator operates. The extension author never receives any of your data.
• There are no third-party analytics services, advertising SDKs, or telemetry.
• The extension never reads form inputs, message bodies, passwords, or any authentication material. On LinkedIn profile pages you yourself navigate to, the extension reads the person's display name and job headline from the visible page heading — and that is the extent of its DOM access.
• You can clear all stored data at any time via the "Clear All Data" button in Settings, or by uninstalling the extension.

────────────────────────
SETUP
────────────────────────

1. Install the extension.
2. Click the toolbar icon, then click "Open Settings".
3. Enter your name and email.
4. Optional: enable sync and paste the Server URL and Team Token provided by your administrator.
5. Click "Test Connection" to verify the token, then "Sync Now" to send your first day.
6. Continue browsing normally. Summaries appear automatically.

────────────────────────
WHAT IT DOES NOT DO
────────────────────────

• It does not scrape or crawl websites on your behalf.
• It does not enumerate profiles you have not visited yourself.
• It does not read messages, emails, form inputs, or page content outside the narrow profile-name extraction described above.
• It does not send data to any third party — only to the server URL you explicitly configure.
• It does not inject advertising, tracking pixels, or affiliate links anywhere.

────────────────────────
TECHNICAL NOTES
────────────────────────

• Built on Manifest V3 with a service worker.
• No remotely hosted code. The only network request is the optional sync POST.
• Zero third-party runtime dependencies.

────────────────────────
SUPPORT
────────────────────────

Contact the developer for questions, bug reports, or feature requests through the support link on this listing.
