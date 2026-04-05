import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const user = requireUser(req);
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "bad body" }, { status: 400 });

  const batch: any[] = Array.isArray(body) ? body : [body];
  const stmt = db().prepare(
    `INSERT INTO samples (user_id, ts, duration_ms, url, domain, title, idle)
     VALUES (@user_id, @ts, @duration_ms, @url, @domain, @title, @idle)`
  );
  const tx = db().transaction((rows: any[]) => {
    for (const r of rows) {
      stmt.run({
        user_id: user.id,
        ts: r.ts || Date.now(),
        duration_ms: r.dwell_ms || r.duration_ms || 0,
        url: r.url || null,
        domain: r.domain || null,
        title: r.title || null,
        idle: r.idle ? 1 : 0,
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
