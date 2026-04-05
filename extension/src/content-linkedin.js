// LinkedIn content script - captures recruiter-relevant activity on pages
// the user actively visits: profile views (with name/title/URL), connection
// requests sent, messages sent, and searches performed.
//
// Self-monitoring only: this does NOT crawl, enumerate, or scrape data the
// user hasn't themselves navigated to.

(function () {
  const SOURCE = "linkedin";

  function extensionAlive() {
    try { return !!(chrome && chrome.runtime && chrome.runtime.id); } catch { return false; }
  }

  function send(type, payload = {}) {
    if (!extensionAlive()) return;
    try {
      const p = chrome.runtime.sendMessage({
        type: "pa-event",
        payload: { source: SOURCE, type, ts: Date.now(), ...payload },
      });
      if (p && typeof p.then === "function") p.catch(() => {});
    } catch {}
  }

  function text(el) { return el ? (el.textContent || "").trim().replace(/\s+/g, " ") : null; }

  // Titles that look like UI chrome rather than a real job headline; if the
  // DOM selectors accidentally grab one of these we ignore it.
  const CHROME_RE = /^(message|connect|follow|more|pending|accept|ignore|withdraw|following|remove connection|see more|show more|view profile|open to)$/i;

  function looksLikeRealTitle(s) {
    if (!s) return false;
    const t = s.trim();
    if (t.length < 3 || t.length > 220) return false;
    if (CHROME_RE.test(t)) return false;
    return true;
  }

  // ---- Profile dwell tracking ----
  let currentProfile = null;
  let profileStart = null;
  let extractTimer = null;

  function profileUrlFromLocation() {
    const m = location.pathname.match(/^\/in\/([^/?#]+)/);
    return m ? `https://www.linkedin.com/in/${m[1]}/` : null;
  }

  function extractProfile() {
    // Strategy 1: known DOM selectors (most reliable when they match).
    let name =
      text(document.querySelector("h1.text-heading-xlarge")) ||
      text(document.querySelector("main h1")) ||
      text(document.querySelector("section.artdeco-card h1")) ||
      text(document.querySelector('[data-generated-suggestion-target]')) ||
      text(document.querySelector('.pv-top-card--list h1')) ||
      text(document.querySelector('.ph5 h1'));
    let title =
      text(document.querySelector("div.text-body-medium.break-words")) ||
      text(document.querySelector("main h1 ~ div.text-body-medium")) ||
      text(document.querySelector("main h1 + div")) ||
      text(document.querySelector('.pv-text-details__left-panel .text-body-medium')) ||
      text(document.querySelector('.ph5 .text-body-medium'));
    if (!looksLikeRealTitle(title)) title = null;

    // Strategy 2: document.title / og:title ("Name - Title at Company | LinkedIn").
    if (!name || !title) {
      const og = document.querySelector('meta[property="og:title"]');
      const rawTitle = (og && og.getAttribute("content")) || document.title || "";
      const cleaned = rawTitle
        .replace(/\s*\|\s*LinkedIn\s*$/i, "")
        .replace(/\(\d+\)\s*/, "")
        .trim();
      if (cleaned && !/^linkedin/i.test(cleaned)) {
        const m = cleaned.match(/^(.+?)\s+[-–|]\s+(.+)$/);
        if (m) {
          if (!name) name = m[1].trim();
          if (!title && looksLikeRealTitle(m[2])) title = m[2].trim();
        } else if (!name) {
          name = cleaned;
        }
      }
    }

    // Strategy 3: meta description. LinkedIn profile pages usually set this
    // to "<Headline> · Experience: ... · Location: ..." — first segment is
    // the job headline. If that's missing, fall back to meta description's
    // "Location: X · 500+ connections · View …'s profile" style and try to
    // pull a title from within.
    if (!title) {
      const md = document.querySelector('meta[name="description"]');
      const raw = ((md && md.getAttribute("content")) || "").trim();
      if (raw) {
        const noLead = raw.replace(/^view .+?'s profile on linkedin[^.·|]*[.·|]\s*/i, "").trim();
        const first = noLead.split(/\s+·\s+|\s+\|\s+/)[0].trim();
        if (looksLikeRealTitle(first) && !/^location:|^experience:|^education:|\bconnections\b/i.test(first)) {
          title = first;
        }
      }
    }

    return { name, title };
  }

  function updateCurrentProfileMeta() {
    if (!currentProfile) return;
    const { name, title } = extractProfile();
    if (name && !currentProfile.name) currentProfile.name = name;
    if (title && !currentProfile.title) currentProfile.title = title;
  }

  function flushProfile() {
    if (extractTimer) { clearInterval(extractTimer); extractTimer = null; }
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
    currentProfile = { url, name: null, title: null };
    profileStart = Date.now();
    // Extract immediately, then retry every 500ms for up to 12s while the
    // SPA progressively renders the header. Don't re-extract at flush time
    // since by then the user may have navigated away and the DOM has moved.
    updateCurrentProfileMeta();
    let attempts = 0;
    extractTimer = setInterval(() => {
      attempts += 1;
      updateCurrentProfileMeta();
      if ((currentProfile && currentProfile.name && currentProfile.title) || attempts >= 24) {
        clearInterval(extractTimer);
        extractTimer = null;
      }
    }, 500);
  }

  // React to LinkedIn's client-side navigation.
  const _push = history.pushState;
  history.pushState = function () { _push.apply(this, arguments); setTimeout(maybeStartProfile, 300); };
  const _replace = history.replaceState;
  history.replaceState = function () { _replace.apply(this, arguments); setTimeout(maybeStartProfile, 300); };
  window.addEventListener("popstate", () => setTimeout(maybeStartProfile, 300));
  window.addEventListener("beforeunload", flushProfile);
  window.addEventListener("pagehide", flushProfile);
  window.addEventListener("visibilitychange", () => { if (document.hidden) flushProfile(); });
  maybeStartProfile();

  // ---- Connection & message detection ----
  //
  // The DOM around LinkedIn's invite flow is volatile. Rather than trying
  // to recognise every modal variant, we "arm" the detector whenever the
  // user clicks a Connect / Invite button. Any Send click within 60s of
  // an arming event counts as a connection_sent. This matches human flow
  // exactly: click Connect → optionally add a note → click Send.

  let armedAt = 0;
  let armedProfileUrl = null;
  let armedProfileName = null;
  let armedProfileTitle = null;
  const ARM_WINDOW_MS = 60_000;

  function arm() {
    armedAt = Date.now();
    armedProfileUrl = (currentProfile && currentProfile.url) || profileUrlFromLocation();
    armedProfileName = currentProfile && currentProfile.name;
    armedProfileTitle = currentProfile && currentProfile.title;
  }
  function disarm() {
    armedAt = 0; armedProfileUrl = null; armedProfileName = null; armedProfileTitle = null;
  }
  function isArmed() {
    return armedAt > 0 && (Date.now() - armedAt) < ARM_WINDOW_MS;
  }

  function labelOf(el) {
    if (!el) return "";
    return (el.getAttribute("aria-label") || el.getAttribute("title") || el.textContent || "")
      .trim().toLowerCase().replace(/\s+/g, " ");
  }

  function isConnectLabel(label) {
    if (!label) return false;
    // "Connect", "Invite Alice to connect", "Connect with Alice"
    return /^connect\b/.test(label) || /invite .* to connect/.test(label) || /^connect with /.test(label);
  }

  function isSendLabel(label) {
    if (!label) return false;
    // "Send", "Send now", "Send invitation", "Send without a note",
    // "Send invite", "Done", "Send message", "Send message to …"
    return /^send\b/.test(label) || label === "done";
  }

  function isMessagingContainer(el) {
    return !!el.closest(
      '.msg-form, .msg-form__contenteditable, .msg-overlay-conversation-bubble, ' +
      '.msg-convo-wrapper, [data-test-messaging-message-composer], ' +
      '.msg-thread, .message-form-container'
    );
  }

  document.addEventListener("click", (e) => {
    const target = e.target.closest("button, a, [role='button']");
    if (!target) return;
    const label = labelOf(target);

    // Arm on Connect click.
    if (isConnectLabel(label)) {
      arm();
      send("connect_clicked", { profile_url: profileUrlFromLocation() });
      return;
    }

    if (!isSendLabel(label)) return;

    // Messaging Send click - always classify as message_sent.
    if (isMessagingContainer(target)) {
      send("message_sent", {
        profile_url: profileUrlFromLocation(),
        profile_name: currentProfile && currentProfile.name,
        profile_title: currentProfile && currentProfile.title,
      });
      return;
    }

    // Armed Send - this is the follow-up click after Connect. Count as
    // connection_sent using the profile info captured at arming time.
    if (isArmed()) {
      send("connection_sent", {
        profile_url: armedProfileUrl || profileUrlFromLocation(),
        profile_name: armedProfileName || (currentProfile && currentProfile.name),
        profile_title: armedProfileTitle || (currentProfile && currentProfile.title),
      });
      disarm();
      return;
    }

    // Fallback: Send click inside a dialog that mentions messaging.
    const dlg = target.closest('[role="dialog"], .artdeco-modal');
    if (dlg) {
      const blob = ((dlg.getAttribute("aria-label") || "") + " " + (dlg.textContent || "")).toLowerCase().slice(0, 2000);
      if (/message|new message|write a message/.test(blob)) {
        send("message_sent", {
          profile_url: profileUrlFromLocation(),
          profile_name: currentProfile && currentProfile.name,
          profile_title: currentProfile && currentProfile.title,
        });
      }
    }
  }, true);

  // Messaging: Enter-to-send in any contenteditable composer.
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Enter" || e.shiftKey) return;
    const editor = e.target.closest('.msg-form__contenteditable, [contenteditable="true"]');
    if (!editor) return;
    if (!isMessagingContainer(editor)) return;
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
