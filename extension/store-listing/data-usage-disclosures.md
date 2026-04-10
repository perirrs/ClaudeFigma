# Data Usage Disclosures — Chrome Web Store Checklist

In the "Privacy practices" tab of the Developer Dashboard, Google asks
you to tick which categories of data the extension collects. Here's
exactly what to check for Productivity Analyser, with justifications
you can paste into the "Explain why this data is collected" fields.

## Checkboxes

| Category | Tick? | Why |
|---|---|---|
| **Personally identifiable information** | ✅ YES | The user's own name and email (entered in Settings, required only if enabling team sync). Also the display names of LinkedIn profiles the user themselves navigated to, which are stored in local activity records for display in the dashboard. |
| **Health information** | ❌ NO | None collected. |
| **Financial and payment information** | ❌ NO | None collected. |
| **Authentication information** | ❌ NO | The team token entered in Settings is user-supplied configuration, not harvested from any website. No passwords, cookies, session tokens, or auth material from any third-party site is ever read. |
| **Personal communications** | ❌ NO | Message counts are incremented when the user clicks "Send" in LinkedIn messaging, but the extension NEVER reads message content, recipients, subject lines, or any part of the message body. |
| **Location** | ❌ NO | None collected. No geolocation API use, no IP logging, no location inference. |
| **Web history** | ✅ YES | Per-domain dwell times (aggregated per day) and the URLs of LinkedIn profile pages the user visited themselves. This is the core functionality of the extension. |
| **User activity** | ✅ YES | Click-driven events: connection requests sent, messages sent, CVs downloaded, contact details revealed, searches run. These are counted only when the user themselves clicks the corresponding button on a supported platform. |
| **Website content** | ✅ YES (narrowly) | On LinkedIn profile pages the user navigates to, the extension reads the person's display name from the `<h1>` element and their job headline from the `.text-body-medium` element on the same page. No other page content, form data, or DOM text is read on any site. |

## Certifications (all three must be ticked)

The "I certify that the following disclosures are true" section has
three checkboxes. Tick ALL three:

- ✅ **I do not sell or transfer user data to third parties, outside of the approved use cases.**
- ✅ **I do not use or transfer user data for purposes that are unrelated to my item's single purpose.**
- ✅ **I do not use or transfer user data to determine creditworthiness or for lending purposes.**

All three are true for Productivity Analyser. The extension author never
receives any user data — data only ever goes to the user-configured team
server, which the user and their team admin operate themselves.

## If Google asks "is user data transferred over HTTPS?"

✅ YES. The only outbound network request is the optional sync POST,
which is sent to the user-configured team server URL (validated to
start with `https://` in the Settings page and rejected otherwise).
