// Simple API-key auth. Each user gets a key bound to their user row.
// Extension sends X-PA-Key header; dashboard uses a cookie set on /setup.

import { NextRequest } from "next/server";
import { db } from "./db";

export type User = {
  id: string;
  name: string;
  email: string | null;
  team: string | null;
  api_key: string;
  role: "user" | "admin";
  created_at: number;
};

export function userByKey(key: string | null | undefined): User | null {
  if (!key) return null;
  return (db().prepare("SELECT * FROM users WHERE api_key = ?").get(key) as User) || null;
}

export function requireUser(req: NextRequest): User | null {
  const header = req.headers.get("x-pa-key");
  const cookie = req.cookies.get("pa_key")?.value;
  return userByKey(header || cookie || null);
}

export function requireAdmin(req: NextRequest): User | null {
  const u = requireUser(req);
  return u && u.role === "admin" ? u : null;
}
