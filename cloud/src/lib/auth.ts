// Auth: API-key or email+password. Extension / tray agent send X-PA-Key
// header; the dashboard can use a cookie or log in with email+password.

import { NextRequest } from "next/server";
import { scryptSync, randomBytes, timingSafeEqual } from "crypto";
import { db } from "./db";

export type User = {
  id: string;
  name: string;
  email: string | null;
  team: string | null;
  api_key: string;
  password_hash: string | null;
  role: "user" | "admin";
  created_at: number;
};

// ---- Password hashing (scrypt, zero deps) ----

export function hashPassword(plain: string): string {
  const salt = randomBytes(16).toString("hex");
  const key = scryptSync(plain, salt, 64).toString("hex");
  return `${salt}:${key}`;
}

export function verifyPassword(plain: string, hash: string): boolean {
  const [salt, stored] = hash.split(":");
  if (!salt || !stored) return false;
  const derived = scryptSync(plain, salt, 64).toString("hex");
  // Constant-time comparison.
  try {
    return timingSafeEqual(Buffer.from(stored, "hex"), Buffer.from(derived, "hex"));
  } catch {
    return false;
  }
}

// ---- Lookups ----

export function userByKey(key: string | null | undefined): User | null {
  if (!key) return null;
  return (db().prepare("SELECT * FROM users WHERE api_key = ?").get(key) as User) || null;
}

export function userByEmail(email: string | null | undefined): User | null {
  if (!email) return null;
  return (db().prepare("SELECT * FROM users WHERE email = ? COLLATE NOCASE").get(email) as User) || null;
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
