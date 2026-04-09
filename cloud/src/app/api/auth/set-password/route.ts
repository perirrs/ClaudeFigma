import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin, hashPassword, userByEmail } from "@/lib/auth";

export const runtime = "nodejs";

// POST { email, password }  (admin-only)
// Sets or resets a user's password so they can log in with email+password.
export async function POST(req: NextRequest) {
  const admin = requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const body = await req.json().catch(() => null);
  if (!body || !body.email || !body.password) {
    return NextResponse.json({ error: "email and password required" }, { status: 400 });
  }
  if (body.password.length < 4) {
    return NextResponse.json({ error: "password too short (min 4 chars)" }, { status: 400 });
  }

  const user = userByEmail(body.email);
  if (!user) return NextResponse.json({ error: "user not found" }, { status: 404 });

  const hash = hashPassword(body.password);
  db().prepare("UPDATE users SET password_hash = ? WHERE id = ?").run(hash, user.id);

  return NextResponse.json({ ok: true, id: user.id, name: user.name });
}
