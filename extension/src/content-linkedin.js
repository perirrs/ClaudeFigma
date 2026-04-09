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
  let mutationObserver = null;

  function profileUrlFromLocation() {
    const m = location.pathname.match(/^\/in\/([^/?#]+)/);
    return m ? `https://www.linkedin.com/in/${m[1]}/` : null;
  }

  function extractProfile() {
    // Strategy 1: primary h1 name selectors. LinkedIn changes class names
    // frequently so we try many combinations.
    const h1Selectors = [
      "h1.text-heading-xlarge",
      "main h1",
      "section.artdeco-card h1",
      ".pv-top-card--list h1",
      ".ph5 h1",
      ".scaffold-layout__main h1",
      "[data-view-name='profile-card'] h1",
      ".profile-topcard-person-entity h1",
      "h1[tabindex]",
    ];
    let h1 = null;
    for (const sel of h1Selectors) {
      h1 = document.querySelector(sel);
      if (h1) break;
    }

    let name = h1 ? text(h1) : null;
    let title = null;

    // Walk up from the h1 looking for a headline sibling.
    if (h1) {
      let scope = h1.parentElement;
      for (let i = 0; i < 5 && scope && !title; i++) {
        const candidates = scope.querySelectorAll(
          '.text-body-medium, [class*="headline"], [class*="top-card-layout__headline"], ' +
          '[class*="profile-topcard__summary-position"], [data-anonymize="headline"]'
        );
        for (const c of candidates) {
          if (c === h1 || h1.contains(c)) continue;
          const t = text(c);
          if (looksLikeRealTitle(t)) { title = t; break; }
        }
        scope = scope.parentElement;
      }
    }

    // Strategy 1b: flat fallback selectors.
    if (!name) {
      name =
        text(document.querySelector("h1.text-heading-xlarge")) ||
        text(document.querySelector("main h1")) ||
        text(document.querySelector('[data-generated-suggestion-target]')) ||
        text(document.querySelector('.scaffold-layout__main h1'));
    }
    if (!title) {
      const titleSelectors = [
        "div.text-body-medium.break-words",
        ".pv-text-details__left-panel .text-body-medium",
        ".profile-topcard-person-entity__summary",
        "[data-anonymize='headline']",
        ".text-body-medium:not(h1):not(a)",
      ];
      for (const sel of titleSelectors) {
        const el = document.querySelector(sel);
        const t = text(el);
        if (looksLikeRealTitle(t)) { title = t; break; }
      }
    }

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
    // to "<Headline> · Experience: ... · Location: ...".
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
    try { window.__paLast = { ...currentProfile, ts: Date.now() }; } catch {}
  }

  function flushProfile() {
    if (extractTimer) { clearInterval(extractTimer); extractTimer = null; }
    if (mutationObserver) { mutationObserver.disconnect(); mutationObserver = null; }
    if (!currentProfile || profileStart == null) return;
    // Do one last extraction attempt before flushing.
    updateCurrentProfileMeta();
    const dwell = Date.now() - profileStart;
    // Always send if we haven't sent yet and dwell >= 1500ms.
    // If we already sent an early event, send an update with final dwell.
    if (dwell >= 1500) {
      send("profile_viewed", {
        profile_url: currentProfile.url,
        profile_name: currentProfile.name,
        profile_title: currentProfile.title,
        meta: { dwell_ms: dwell, final: true },
      });
    }
    currentProfile = null;
    profileStart = null;
    profileSent = false;
  }

  // Send an early profile_viewed event after ~2s so the count shows up
  // immediately while the user is still on the page. A final event with
  // the full dwell time is sent when they navigate away.
  let profileSent = false;

  function maybeSendEarly() {
    if (!currentProfile || profileStart == null || profileSent) return;
    const dwell = Date.now() - profileStart;
    if (dwell < 2000) return;
    // Need at least a name to count it.
    updateCurrentProfileMeta();
    if (!currentProfile.name && !currentProfile.url) return;
    profileSent = true;
    send("profile_viewed", {
      profile_url: currentProfile.url,
      profile_name: currentProfile.name,
      profile_title: currentProfile.title,
      meta: { dwell_ms: dwell, early: true },
    });
  }

  function maybeStartProfile() {
    const url = profileUrlFromLocation();
    if (!url) { flushProfile(); return; }
    if (currentProfile && currentProfile.url === url) return;
    flushProfile();
    currentProfile = { url, name: null, title: null };
    profileStart = Date.now();
    profileSent = false;
    // Extract immediately, then retry periodically while SPA renders.
    updateCurrentProfileMeta();
    let attempts = 0;
    extractTimer = setInterval(() => {
      attempts += 1;
      updateCurrentProfileMeta();
      // Fire early event after ~2s so the overlay/popup count updates.
      maybeSendEarly();
      if ((currentProfile && currentProfile.name && currentProfile.title) || attempts >= 24) {
        clearInterval(extractTimer);
        extractTimer = null;
      }
    }, 500);

    // Also use a MutationObserver to catch late renders that the interval misses.
    if (mutationObserver) mutationObserver.disconnect();
    mutationObserver = new MutationObserver(() => {
      if (!currentProfile) return;
      if (!currentProfile.name || !currentProfile.title) updateCurrentProfileMeta();
    });
    const main = document.querySelector("main") || document.body;
    mutationObserver.observe(main, { childList: true, subtree: true });
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

  // URL polling: LinkedIn's SPA navigation doesn't always trigger pushState.
  // Poll every second to detect URL changes that the hooks missed.
  let lastHref = location.href;
  setInterval(() => {
    if (location.href !== lastHref) {
      lastHref = location.href;
      maybeStartProfile();
    }
  }, 1000);

  maybeStartProfile();

  // ---- Connection & message detection ----
  //
  // The DOM around LinkedIn's invite flow is volatile. We "arm" the detector
  // whenever the user clicks a Connect / Invite button. Any Send click within
  // 60s of an arming event counts as a connection_sent. We also watch for
  // the dialog closing with a success toast as a confirmation fallback.

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
    try { window.__paArmed = { at: armedAt, url: armedProfileUrl, name: armedProfileName, title: armedProfileTitle }; } catch {}
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
    // "Connect", "Invite Alice to connect", "Connect with Alice",
    // "Send an invite", "Invite to connect"
    return /^connect\b/.test(label) ||
      /invite .* to connect/.test(label) ||
      /^connect with /.test(label) ||
      /^send (an )?invite/.test(label) ||
      /^invite to connect/.test(label);
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
      '.msg-thread, .message-form-container, .msg-s-message-list-container'
    );
  }

  // Watch for success toasts/banners that confirm a connection was sent.
  // This catches cases where we missed the Send click.
  let lastToastCheck = 0;
  function checkConnectionToast() {
    if (!isArmed()) return;
    const now = Date.now();
    if (now - lastToastCheck < 1000) return;
    lastToastCheck = now;
    // LinkedIn shows "Invitation sent" in an artdeco-toast or notification.
    const toasts = document.querySelectorAll('.artdeco-toast-item, [role="alert"], .artdeco-notification');
    for (const t of toasts) {
      const txt = (t.textContent || "").toLowerCase();
      if (/invitation sent|invite sent|connection request sent/.test(txt)) {
        send("connection_sent", {
          profile_url: armedProfileUrl || profileUrlFromLocation(),
          profile_name: armedProfileName || (currentProfile && currentProfile.name),
          profile_title: armedProfileTitle || (currentProfile && currentProfile.title),
        });
        disarm();
        return;
      }
    }
  }

  document.addEventListener("click", (e) => {
    const target = e.target.closest("button, a, [role='button'], [role='link']");
    if (!target) return;
    const label = labelOf(target);

    // Arm on Connect click.
    if (isConnectLabel(label)) {
      arm();
      send("connect_clicked", { profile_url: profileUrlFromLocation() });
      // Start polling for success toast in case we miss the Send click.
      setTimeout(checkConnectionToast, 2000);
      setTimeout(checkConnectionToast, 4000);
      setTimeout(checkConnectionToast, 6000);
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
      } else if (/connect|invitation/.test(blob)) {
        // Dialog about connection invitation — count it.
        send("connection_sent", {
          profile_url: (currentProfile && currentProfile.url) || profileUrlFromLocation(),
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
