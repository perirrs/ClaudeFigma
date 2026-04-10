Productivity Analyser is a self-tracking tool for recruiters, sourcers, and sales professionals who want an honest picture of how they spend their working day across the platforms they already use.

It records your own activity — active time, idle time, time spent on configured recruiting platforms, profiles you visited, connections you sent, messages you sent, searches you ran — and shows you clean daily, weekly, and monthly summaries. Everything stays on your own computer unless you explicitly enable team sync.

────────────────────────
WHO IT IS FOR
────────────────────────

• Recruiters and sourcers using LinkedIn, Naukri, FoundIt, Monster, Dice, LinkedIn Sales Navigator, Seamless.AI, Apollo, Shine, CareerBuilder, Indeed, ZipRecruiter, Hirist, Instahyre, Glassdoor, Wellfound, Lusha, RocketReach and similar platforms.
• Sales development reps who want to measure prospecting effort honestly.
• Team leads who need aggregated productivity metrics without installing heavyweight spyware on their team's machines.
• Anyone who wants to know — without guesswork — how many hours they actually spent on LinkedIn today.

────────────────────────
WHAT IT TRACKS
────────────────────────

• Active browsing time (with idle detection — AFK time is excluded).
• Per-domain and per-platform dwell time.
• Profile views on supported platforms, including the person's name and headline where available on LinkedIn.
• Connection requests sent from your own account.
• Messages sent from your own account (counts only — message content is never read).
• CV / resume downloads.
• Contact detail reveals.
• Search queries.

All activity shows up in three places:

1. A floating on-page overlay with today's live stats.
2. A toolbar popup summarising today at a glance.
3. A full dashboard with history, charts, event timelines, and drill-downs by platform.

────────────────────────
HOW PLATFORM CONFIG WORKS
────────────────────────

Productivity Analyser is config-driven. The list of platforms it tracks, the colours, the profile-URL patterns, and the per-platform metric flags (does this platform track connections? searches? CV downloads?) all come from a small config endpoint on your team server. That means a team admin can add a new platform on the server side and every team member's extension picks it up at the next refresh — no extension update required.

If you are using it solo, you can point it at a minimal Base44 app (see the project README) or simply run it with the built-in defaults (LinkedIn and Naukri).

────────────────────────
PRIVACY — READ THIS
────────────────────────

• All tracked data is stored locally in your browser by default. It never leaves your computer unless you tick "Enable sync to team dashboard" and supply your own server URL plus a team token.
• When sync is enabled, a daily summary is POSTed over HTTPS every 5 minutes to the exact server URL you configured — a Base44 app that you (or your team admin) operates. The extension author never receives any of your data. There are no third-party analytics, advertising SDKs, or telemetry.
• The extension never reads form inputs, message bodies, passwords, or any authentication material. It reads profile display names and headlines on LinkedIn profile pages you yourself navigated to, and that is the extent of its DOM access.
• You can clear all stored data at any time via the "Clear All Data" button in Settings, or by uninstalling the extension.
• Full privacy policy: see the Privacy policy link below.

────────────────────────
SETUP
────────────────────────

1. Install the extension.
2. Click the toolbar icon → click "Open Settings".
3. Enter your name and email.
4. (Optional) Enable sync, paste the Server URL and Team Token provided by your admin.
5. Click "Test Connection" to verify the token works, then "Sync Now" to send your first day.
6. Continue browsing normally. Summaries appear automatically.

────────────────────────
WHAT IT DOES NOT DO
────────────────────────

• It does NOT scrape or crawl websites on your behalf.
• It does NOT enumerate profiles you haven't visited yourself.
• It does NOT read messages, emails, form inputs, or page content outside the narrow profile-name extraction described above.
• It does NOT send data to any third party — only to the server URL you explicitly configure.
• It does NOT run in incognito mode unless you explicitly opt in via Chrome's extension settings.
• It does NOT inject advertising, tracking pixels, or affiliate links anywhere.

────────────────────────
TECHNICAL NOTES
────────────────────────

• Built on Manifest V3 with a service worker.
• No remotely-hosted code. The only network request is the optional sync POST.
• Open source — the complete source is at https://github.com/perirrs/ClaudeFigma.
• Zero third-party dependencies at runtime.

────────────────────────
SUPPORT
────────────────────────

Contact: sujith@mergenit.com
Issues and feature requests: https://github.com/perirrs/ClaudeFigma/issues

Built for internal team use. If you are evaluating this for a wider deployment, please reach out first so we can discuss scale and operational requirements.
