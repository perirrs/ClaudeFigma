// Admin endpoint - list users and create new ones with auto-generated keys.
import { NextRequest, NextResponse } from "next/server";
import { db, randomKey } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const admin = requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const rows = db().prepare("SELECT id, name, email, team, api_key, role, created_at FROM users ORDER BY created_at ASC").all();
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const admin = requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const body = await req.json().catch(() => null);
  if (!body || !body.name) return NextResponse.json({ error: "name required" }, { status: 400 });
  const id = body.id || slugify(body.name) + "-" + randomKey(4);
  const key = randomKey();
  db().prepare(
    `INSERT INTO users (id, name, email, team, api_key, role, created_at) VALUES (?, ?, ?, ?, ?, 'user', ?)`
  ).run(id, body.name, body.email || null, body.team || null, key, Date.now());
  return NextResponse.json({ id, name: body.name, email: body.email || null, team: body.team || null, api_key: key });
}

function slugify(s: string) { return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""); }
