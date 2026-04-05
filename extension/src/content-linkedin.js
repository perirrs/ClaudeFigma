// LinkedIn content script - captures recruiter-relevant activity on pages
// the user actively visits: profile views (with name/title/URL), connection
// requests sent, messages sent, and searches performed.
//
// Self-monitoring only: this does NOT crawl, enumerate, or scrape data the
// user hasn't themselves navigated to.

(function () {
  const SOURCE = "linkedin";

  function send(type, payload = {}) {
    try {
      chrome.runtime.sendMessage({
        type: "pa-event",
        payload: { source: SOURCE, type, ts: Date.now(), ...payload },
      });
    } catch {}
  }

  function text(el) { return el ? (el.textContent || "").trim().replace(/\s+/g, " ") : null; }

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

    // Strategy 2: fall back to document.title / og:title. LinkedIn sets
    // document.title to things like "Satya Nadella - Chairman & CEO at
    // Microsoft | LinkedIn" which reliably gives us both fields.
    if (!name || !title) {
      const og = document.querySelector('meta[property="og:title"]');
      const rawTitle = (og && og.getAttribute("content")) || document.title || "";
      const cleaned = rawTitle
        .replace(/\s*\|\s*LinkedIn\s*$/i, "")
        .replace(/\(\d+\)\s*/, "")
        .trim();
      if (cleaned && !/^linkedin/i.test(cleaned)) {
        // Common patterns:
        //  "Name - Title at Company"
        //  "Name | Title"
        //  "Name – Title"
        const m = cleaned.match(/^(.+?)\s+[-–|]\s+(.+)$/);
        if (m) {
          if (!name) name = m[1].trim();
          if (!title) title = m[2].trim();
        } else if (!name) {
          name = cleaned;
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
    // One more attempt to grab any fields that finally rendered.
    updateCurrentProfileMeta();
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
    // LinkedIn's SPA renders the header lazily. Keep retrying extraction
    // until we get both fields or we time out after 12s.
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
  // We listen globally for clicks and inspect the clicked element's ancestry
  // to classify it as a connection-send or a message-send. LinkedIn changes
  // DOM classes frequently, so we rely on text/aria-labels and dialog context.

  function labelOf(el) {
    if (!el) return "";
    return (el.getAttribute("aria-label") || el.getAttribute("title") || el.textContent || "")
      .trim().toLowerCase().replace(/\s+/g, " ");
  }

  function isSendLabel(label) {
    if (!label) return false;
    // Matches: "send", "send now", "send invitation", "send without a note",
    // "send invite", "send message", "send message to …"
    return /^send\b/.test(label) || label === "send";
  }

  function dialogContext(el) {
    // Walk up to the nearest dialog/modal container and inspect its text.
    const dlg = el.closest('[role="dialog"], .artdeco-modal, .msg-overlay-conversation-bubble');
    if (!dlg) return null;
    const blob = ((dlg.getAttribute("aria-label") || "") + " " + (dlg.textContent || ""))
      .toLowerCase().slice(0, 2000);
    return { el: dlg, blob };
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

    // "Connect" button clicked (pre-invite).
    if (/^connect$/.test(label) || /^invite .* to connect$/.test(label) || /^follow$/.test(label) === false && /invite .* to connect/.test(label)) {
      send("connect_clicked", { profile_url: profileUrlFromLocation() });
    }

    if (!isSendLabel(label)) return;

    // Case 1: click happened inside the messaging composer → message_sent.
    if (isMessagingContainer(target)) {
      send("message_sent", {
        profile_url: profileUrlFromLocation(),
        profile_name: currentProfile && currentProfile.name,
        profile_title: currentProfile && currentProfile.title,
      });
      return;
    }

    // Case 2: click happened inside a dialog. Inspect the dialog text to
    // decide between an invitation send and a message send.
    const ctx = dialogContext(target);
    if (ctx) {
      if (/invit|connect|add a note|personalize/.test(ctx.blob)) {
        send("connection_sent", {
          profile_url: profileUrlFromLocation(),
          profile_name: currentProfile && currentProfile.name,
          profile_title: currentProfile && currentProfile.title,
        });
      } else if (/message|write a message|new message/.test(ctx.blob)) {
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
