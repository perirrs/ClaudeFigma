import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { getLinkedInActivity } from "@/lib/analytics";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const u = requireUser(req);
  if (!u) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const date = req.nextUrl.searchParams.get("date") || undefined;
  return NextResponse.json(getLinkedInActivity(u.id, date));
}
