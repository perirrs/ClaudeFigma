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
    `INSERT INTO events (user_id, ts, source, type, profile_url, profile_name, profile_title, meta)
     VALUES (@user_id, @ts, @source, @type, @profile_url, @profile_name, @profile_title, @meta)`
  );
  const tx = db().transaction((rows: any[]) => {
    for (const r of rows) {
      if (!r.source || !r.type) continue;
      stmt.run({
        user_id: user.id,
        ts: r.ts || Date.now(),
        source: r.source,
        type: r.type,
        profile_url: r.profile_url || null,
        profile_name: r.profile_name || null,
        profile_title: r.profile_title || null,
        meta: r.meta ? JSON.stringify(r.meta) : null,
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
