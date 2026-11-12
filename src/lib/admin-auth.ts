import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

/*
 * A single shared admin password (ADMIN_PASSWORD in the environment) for the team editor.
 * After login the browser gets a signed, httpOnly session cookie, plus a small readable flag cookie
 * that only tells the About page to show the "Edit team" button (it grants nothing on its own).
 * With no ADMIN_PASSWORD set, the admin screen stays locked.
 */

export const SESSION_COOKIE = "os_admin";
export const UI_COOKIE = "os_admin_ui";
const SESSION_DAYS = 7;

const secret = () => process.env.ADMIN_SECRET || process.env.ADMIN_PASSWORD || "";

const sign = (value: string) => createHmac("sha256", secret()).update(value).digest("base64url");

const same = (a: string, b: string) => {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
};

export const adminConfigured = () => Boolean(process.env.ADMIN_PASSWORD);

export function checkPassword(input: string) {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return false;
  // Compare HMACs so the comparison takes the same time whatever the input length
  return same(sign(`pw:${input}`), sign(`pw:${expected}`));
}

export function createSessionValue() {
  const exp = Date.now() + SESSION_DAYS * 86_400_000;
  return { value: `${exp}.${sign(`session:${exp}`)}`, maxAge: SESSION_DAYS * 86_400 };
}

export async function isAdmin() {
  if (!adminConfigured()) return false;
  const raw = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!raw) return false;
  const [exp, mac] = raw.split(".");
  if (!exp || !mac || !same(mac, sign(`session:${exp}`))) return false;
  return Number(exp) > Date.now();
}
