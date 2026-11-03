import "server-only";

import crypto from "node:crypto";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { query } from "./db";

const COOKIE_NAME = "rd_admin";
const SESSION_DAYS = 7;

type AdminUser = { id: string; email: string; name: string };

const attempts = new Map<string, { count: number; resetAt: number }>();

function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16);
  const hash = crypto.scryptSync(password, salt, 64);
  return `scrypt$${salt.toString("hex")}$${hash.toString("hex")}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [scheme, saltHex, hashHex] = stored.split("$");
  if (scheme !== "scrypt" || !saltHex || !hashHex) return false;
  const expected = Buffer.from(hashHex, "hex");
  const actual = crypto.scryptSync(password, Buffer.from(saltHex, "hex"), expected.length);
  return expected.length === actual.length && crypto.timingSafeEqual(expected, actual);
}

export async function assertLoginAllowed(): Promise<void> {
  const headerList = await headers();
  const ip =
    headerList.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    headerList.get("x-real-ip") ??
    "local";
  const now = Date.now();
  const entry = attempts.get(ip);
  if (!entry || entry.resetAt < now) {
    attempts.set(ip, { count: 1, resetAt: now + 10 * 60 * 1000 });
    return;
  }
  entry.count += 1;
  if (entry.count > 8) {
    throw new Error("Muitas tentativas de acesso. Aguarde 10 minutos e tente novamente.");
  }
}

export async function authenticate(
  email: string,
  password: string,
): Promise<AdminUser | null> {
  const rows = await query<{ id: string; email: string; name: string; password_hash: string }>(
    "select id, email, name, password_hash from admin_users where email = $1",
    [email.trim().toLowerCase()],
  );
  const user = rows[0];
  if (!user || !verifyPassword(password, user.password_hash)) return null;
  return { id: user.id, email: user.email, name: user.name };
}

export async function createSession(userId: string): Promise<void> {
  const token = crypto.randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
  await query(
    "insert into admin_sessions (token_hash, user_id, expires_at) values ($1, $2, $3)",
    [hashToken(token), userId, expiresAt],
  );
  const store = await cookies();
  store.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt,
  });
}

export async function getCurrentAdmin(): Promise<AdminUser | null> {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (!token) return null;
  const rows = await query<AdminUser>(
    `select u.id, u.email, u.name
     from admin_sessions s
     join admin_users u on u.id = s.user_id
     where s.token_hash = $1 and s.expires_at > now()`,
    [hashToken(token)],
  );
  return rows[0] ?? null;
}

export async function requireAdmin(): Promise<AdminUser> {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/admin/login");
  return admin;
}

export async function destroySession(): Promise<void> {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (token) {
    await query("delete from admin_sessions where token_hash = $1", [hashToken(token)]);
  }
  store.delete(COOKIE_NAME);
}
