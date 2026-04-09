import { NextRequest, NextResponse } from "next/server";
import { userByEmail, verifyPassword } from "@/lib/auth";

export const runtime = "nodejs";

// POST { email, password } → { api_key, name, role, ... }
// Used by the extension settings page and the tray agent on startup.
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body || !body.email || !body.password) {
    return NextResponse.json({ error: "email and password required" }, { status: 400 });
  }

  const user = userByEmail(body.email);
  if (!user || !user.password_hash) {
    return NextResponse.json({ error: "invalid email or password" }, { status: 401 });
  }

  if (!verifyPassword(body.password, user.password_hash)) {
    return NextResponse.json({ error: "invalid email or password" }, { status: 401 });
  }

  const resp = NextResponse.json({
    api_key: user.api_key,
    id: user.id,
    name: user.name,
    email: user.email,
    team: user.team,
    role: user.role,
  });

  // Also set the dashboard cookie so the user is signed in immediately.
  resp.cookies.set("pa_key", user.api_key, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    httpOnly: false,
    sameSite: "lax",
  });

  return resp;
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
