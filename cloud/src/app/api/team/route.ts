import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { getTeamSummary } from "@/lib/analytics";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const admin = requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const date = req.nextUrl.searchParams.get("date") || undefined;
  return NextResponse.json(getTeamSummary(date));
}
