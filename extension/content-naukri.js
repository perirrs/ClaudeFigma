// Naukri content script - captures recruiter activity on pages the user
// actively opens: candidate profile views, CV downloads, contact reveals,
// and search runs.
//
// Self-monitoring only; no crawling or enumeration.

(function () {
  const SOURCE = "naukri";

  function send(type, payload = {}) {
    chrome.runtime.sendMessage({
      type: "pa-event",
      payload: { source: SOURCE, type, ts: Date.now(), ...payload },
    });
  }

  function text(el) { return el ? (el.textContent || "").trim().replace(/\s+/g, " ") : null; }

  let currentProfile = null;
  let profileStart = null;

  function isProfilePage() {
    return /\/(profile|resume|candidate|mynaukri\/profile)/i.test(location.pathname)
      || /resdex|rmsprofile/i.test(location.host + location.pathname);
  }

  function profileUrl() { return location.origin + location.pathname; }

  function extractProfile() {
    const name =
      text(document.querySelector("h1")) ||
      text(document.querySelector('[class*="candidateName"], [class*="cand-name"]'));
    const title =
      text(document.querySelector('[class*="designation"], [class*="currentDesig"], [class*="jobTitle"]'));
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
    if (!isProfilePage()) { flushProfile(); return; }
    const url = profileUrl();
    if (currentProfile && currentProfile.url === url) return;
    flushProfile();
    setTimeout(() => {
      const { name, title } = extractProfile();
      currentProfile = { url, name, title };
      profileStart = Date.now();
    }, 1000);
  }

  const _push = history.pushState;
  history.pushState = function () { _push.apply(this, arguments); setTimeout(maybeStartProfile, 300); };
  window.addEventListener("popstate", () => setTimeout(maybeStartProfile, 300));
  window.addEventListener("beforeunload", flushProfile);
  window.addEventListener("visibilitychange", () => { if (document.hidden) flushProfile(); });
  maybeStartProfile();

  // Contact reveal & CV download detection.
  document.addEventListener("click", (e) => {
    const target = e.target.closest("a, button, span");
    if (!target) return;
    const label = (target.getAttribute("aria-label") || target.textContent || "").trim().toLowerCase();

    if (/(download\s*cv|download\s*resume|download\s*profile)/i.test(label)) {
      send("cv_downloaded", {
        profile_url: profileUrl(),
        profile_name: currentProfile && currentProfile.name,
        profile_title: currentProfile && currentProfile.title,
      });
    }
    if (/(view\s*contact|show\s*contact|contact\s*details)/i.test(label)) {
      send("contact_viewed", {
        profile_url: profileUrl(),
        profile_name: currentProfile && currentProfile.name,
      });
    }
  }, true);

  // Search detection.
  let lastSearchUrl = null;
  function detectSearch() {
    if (/(search|resdex|candidate-search)/i.test(location.pathname)) {
      if (location.href !== lastSearchUrl) {
        lastSearchUrl = location.href;
        send("search_ran", { meta: { url: location.href } });
      }
    }
  }
  setInterval(detectSearch, 2000);
  detectSearch();
})();
