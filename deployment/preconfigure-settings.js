/**
 * Pre-configure extension settings via Chrome managed storage policy.
 *
 * This allows you to set the sync URL and team token for all 100 laptops
 * WITHOUT each recruiter having to manually enter them.
 *
 * Add this to your Chrome enterprise policy as managed storage:
 *
 * Windows Registry:
 *   HKLM\SOFTWARE\Policies\Google\Chrome\3rdparty\extensions\YOUR_EXTENSION_ID\policy
 *
 * Linux:
 *   /etc/opt/chrome/policies/managed/productivity-analyser-managed.json
 *
 * Example managed storage policy JSON:
 */
const EXAMPLE_MANAGED_POLICY = {
  // These get injected into chrome.storage.managed (read-only from extension)
  "syncUrl": "https://your-app.base44.app/api/pa-sync",
  "syncToken": "your-team-token-here",
  "syncEnabled": true,
  "showOverlay": true,
};

/**
 * The extension will read from chrome.storage.managed first,
 * falling back to chrome.storage.sync (user-entered settings).
 *
 * Recruiters still need to enter their name/email in settings.
 * But the server URL and token will be pre-filled from policy.
 */
