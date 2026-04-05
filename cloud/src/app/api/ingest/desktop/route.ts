import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";

export const runtime = "nodejs";

// Ingest 1-minute desktop-activity buckets from the native Windows tray agent.
// Body: single object or array of { ts, active_ms, idle_ms, app, title, category?, host? }
export async function POST(req: NextRequest) {
  const user = requireUser(req);
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "bad body" }, { status: 400 });

  const batch: any[] = Array.isArray(body) ? body : [body];
  const stmt = db().prepare(
    `INSERT INTO desktop_activity (user_id, ts, active_ms, idle_ms, app, title, category, host)
     VALUES (@user_id, @ts, @active_ms, @idle_ms, @app, @title, @category, @host)`
  );
  const tx = db().transaction((rows: any[]) => {
    for (const r of rows) {
      stmt.run({
        user_id: user.id,
        ts: r.ts || Date.now(),
        active_ms: r.active_ms || 0,
        idle_ms: r.idle_ms || 0,
        app: r.app || null,
        title: r.title || null,
        category: r.category || null,
        host: r.host || null,
      });
    }
  });
  tx(batch);

  return NextResponse.json({ ok: true, count: batch.length });
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, X-PA-Key",
    },
  });
}
