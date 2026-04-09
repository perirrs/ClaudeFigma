/**
 * Base44 Backend Function — Sync Endpoint
 *
 * This receives POST requests from the Chrome extension every 5 minutes.
 * Each request contains the last 7 days of summary data for one recruiter.
 *
 * To use in Base44:
 * 1. Create the "RecruiterActivity" entity using entity-schema.json
 * 2. Create a backend function (API endpoint) and paste this code
 * 3. Set the function URL in each extension's Settings > Server URL
 *
 * The extension sends:
 * {
 *   recruiterName: "Raghu Peri",
 *   recruiterEmail: "raghu@company.com",
 *   extensionVersion: "0.4.0",
 *   syncedAt: "2026-04-09T10:30:00.000Z",
 *   days: [
 *     { date: "2026-04-09", activeMs: 12345, linkedinMs: 5000, liConnections: 3, ... },
 *     { date: "2026-04-08", activeMs: 10000, linkedinMs: 4000, liConnections: 2, ... },
 *     ...
 *   ]
 * }
 */

// ---- Base44 SDK imports (adjust based on your actual Base44 setup) ----
// import { RecruiterActivity } from "@/entities/RecruiterActivity";

export default async function handler(request: Request): Promise<Response> {
  // CORS headers for the Chrome extension
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };

  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (request.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Optional: verify team token
  const authHeader = request.headers.get("Authorization");
  const TEAM_TOKEN = Deno.env.get("PA_TEAM_TOKEN") || "";
  if (TEAM_TOKEN && authHeader !== `Bearer ${TEAM_TOKEN}`) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const body = await request.json();

    // Handle test connection pings
    if (body.test) {
      return new Response(JSON.stringify({ ok: true, message: "Connection successful" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { recruiterName, recruiterEmail, extensionVersion, syncedAt, days } = body;
    if (!recruiterName || !Array.isArray(days)) {
      return new Response(JSON.stringify({ error: "Missing recruiterName or days" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Upsert each day's data (recruiterEmail + date = unique key)
    let upserted = 0;
    for (const day of days) {
      // Find existing record for this recruiter + date
      const existing = await RecruiterActivity.filter({
        recruiterEmail,
        date: day.date,
      });

      const record = {
        recruiterName,
        recruiterEmail,
        date: day.date,
        activeMs: day.activeMs || 0,
        idleMs: day.idleMs || 0,
        linkedinMs: day.linkedinMs || 0,
        naukriMs: day.naukriMs || 0,
        liProfilesCount: day.liProfilesCount || 0,
        nkProfilesCount: day.nkProfilesCount || 0,
        liConnections: day.liConnections || 0,
        liMessages: day.liMessages || 0,
        liSearches: day.liSearches || 0,
        naukriDownloads: day.naukriDownloads || 0,
        naukriContacts: day.naukriContacts || 0,
        naukriSearches: day.naukriSearches || 0,
        topDomains: day.topDomains || [],
        syncedAt,
        extensionVersion,
      };

      if (existing && existing.length > 0) {
        await RecruiterActivity.update(existing[0].id, record);
      } else {
        await RecruiterActivity.create(record);
      }
      upserted++;
    }

    return new Response(
      JSON.stringify({ ok: true, upserted }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    return new Response(
      JSON.stringify({ error: e.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
}
