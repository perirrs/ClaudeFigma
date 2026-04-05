// LinkedIn content script - captures recruiter-relevant activity on pages
// the user actively visits: profile views (with name/title/URL), connection
// requests sent, messages sent, and searches performed.
//
// Self-monitoring only: this does NOT crawl, enumerate, or scrape data the
// user hasn't themselves navigated to.

(function () {
  const SOURCE = "linkedin";

  function send(type, payload = {}) {
    chrome.runtime.sendMessage({
      type: "pa-event",
      payload: { source: SOURCE, type, ts: Date.now(), ...payload },
    });
  }

  function text(el) { return el ? (el.textContent || "").trim().replace(/\s+/g, " ") : null; }

  // ---- Profile dwell tracking ----
  let currentProfile = null;
  let profileStart = null;

  function profileUrlFromLocation() {
    const m = location.pathname.match(/^\/in\/([^/?#]+)/);
    return m ? `https://www.linkedin.com/in/${m[1]}/` : null;
  }

  function extractProfile() {
    // Headline selectors change over time; try a few.
    const name =
      text(document.querySelector("h1.text-heading-xlarge")) ||
      text(document.querySelector("main h1")) ||
      text(document.querySelector('[data-generated-suggestion-target]'));
    const title =
      text(document.querySelector("div.text-body-medium.break-words")) ||
      text(document.querySelector("main h1 + div")) ||
      text(document.querySelector('.pv-text-details__left-panel .text-body-medium'));
    return { name, title };
  }

  function flushProfile() {
    if (!currentProfile || profileStart == null) return;
    const dwell = Date.now() - profileStart;
    if (dwell < 1500) { currentProfile = null; profileStart = null; return; }
    send("profile_viewed", {
      profile_url: currentProfile.url,
      profile_name: currentProfile.name,
      profile_title: currentProfile.title,
      meta: { dwell_ms: dwell },
    });
    currentProfile = null;
    profileStart = null;
  }

  function maybeStartProfile() {
    const url = profileUrlFromLocation();
    if (!url) { flushProfile(); return; }
    if (currentProfile && currentProfile.url === url) return;
    flushProfile();
    // Wait a beat for LinkedIn's SPA to render the header.
    setTimeout(() => {
      const { name, title } = extractProfile();
      currentProfile = { url, name, title };
      profileStart = Date.now();
    }, 1200);
  }

  // React to LinkedIn's client-side navigation.
  const _push = history.pushState;
  history.pushState = function () { _push.apply(this, arguments); setTimeout(maybeStartProfile, 300); };
  window.addEventListener("popstate", () => setTimeout(maybeStartProfile, 300));
  window.addEventListener("beforeunload", flushProfile);
  window.addEventListener("visibilitychange", () => { if (document.hidden) flushProfile(); });
  maybeStartProfile();

  // ---- Connection & message detection ----
  // Observe clicks on known action buttons/labels.
  document.addEventListener("click", (e) => {
    const target = e.target.closest("button, a");
    if (!target) return;
    const label = (target.getAttribute("aria-label") || target.textContent || "").trim().toLowerCase();

    if (/^connect$/.test(label) || /^invite .* to connect$/.test(label)) {
      send("connect_clicked", { profile_url: profileUrlFromLocation() });
    }
    if (label === "send" || label === "send now" || label === "send invitation" || label === "send without a note") {
      // Heuristic: if we're inside an invitation modal, count as connection_sent.
      const inInvite = document.querySelector('[aria-labelledby*="invite"], [role="dialog"] [data-test-modal]');
      if (inInvite) {
        send("connection_sent", {
          profile_url: profileUrlFromLocation(),
          profile_name: currentProfile && currentProfile.name,
          profile_title: currentProfile && currentProfile.title,
        });
      }
    }
  }, true);

  // Messaging - observe Enter-to-send in the compose box.
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Enter" || e.shiftKey) return;
    const editor = e.target.closest('.msg-form__contenteditable, [contenteditable="true"]');
    if (!editor) return;
    send("message_sent", {
      profile_url: profileUrlFromLocation(),
      profile_name: currentProfile && currentProfile.name,
      profile_title: currentProfile && currentProfile.title,
    });
  }, true);

  // ---- Search tracking ----
  let lastSearchUrl = null;
  function detectSearch() {
    if (location.pathname.startsWith("/search/")) {
      if (location.href !== lastSearchUrl) {
        lastSearchUrl = location.href;
        const qs = new URLSearchParams(location.search);
        send("search_ran", { meta: { keywords: qs.get("keywords"), origin: qs.get("origin") } });
      }
    }
  }
  setInterval(detectSearch, 2000);
  detectSearch();
})();
