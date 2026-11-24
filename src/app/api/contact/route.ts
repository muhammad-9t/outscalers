import nodemailer from "nodemailer";
import { siteConfig } from "@/lib/site";
import { readContact, validateContact } from "@/lib/contact";
import { buildContactEmail } from "@/lib/contact-email";

/**
 * Sends a project enquiry to the team inbox over SMTP.
 * Env: SMTP_HOST, SMTP_PORT (465 = TLS, otherwise STARTTLS), SMTP_USER, SMTP_PASS,
 * CONTACT_FROM (defaults to SMTP_USER), CONTACT_TO (defaults to the public contact address).
 */

/**
 * Parse CONTACT_FROM into nodemailer's structured address.
 * Unquoted parentheses in a display name are RFC comments (e.g. "(PVT)" is
 * stripped → "OUTSCALERS LTD."), so we always pass { name, address }.
 */
function parseFrom(raw: string | undefined, fallbackAddress: string) {
  const value = (raw ?? "").trim();
  const match = value.match(/^(?:"([^"]+)"|(.+?))\s*<([^>]+)>$/);
  if (match) {
    return { name: (match[1] ?? match[2]).trim(), address: match[3].trim() };
  }
  if (value.includes("@")) return { address: value };
  return { name: value || "Outscalers Website", address: fallbackAddress };
}

/*
 * Spam protection, invisible to real visitors:
 * - requests over MAX_BODY_BYTES are refused before parsing
 * - a honeypot field and a minimum fill time: bots get a fake "ok" and no email is sent
 * - at most RATE_LIMIT messages per IP per hour (in memory: the site runs as one Node process;
 *   it resets on restart, which is fine for this purpose)
 */
const MAX_BODY_BYTES = 20_000;
const MIN_FILL_MS = 3_000;
const RATE_LIMIT = 5;
const RATE_WINDOW_MS = 60 * 60 * 1000;
const sent = new Map<string, number[]>();

/**
 * The visitor's IP as set by our nginx proxy. X-Real-IP first; otherwise the LAST X-Forwarded-For
 * entry (the one nginx appends). The first entry can be faked by the client, so it is never used.
 */
function clientIp(req: Request) {
  const real = req.headers.get("x-real-ip")?.trim();
  const forwarded = req.headers.get("x-forwarded-for")?.split(",").pop()?.trim();
  return real || forwarded || "unknown";
}

/** Records this attempt; false when the IP has already sent RATE_LIMIT messages in the last hour. */
function withinRateLimit(ip: string) {
  const now = Date.now();
  const recent = (sent.get(ip) ?? []).filter((t) => now - t < RATE_WINDOW_MS);
  if (recent.length >= RATE_LIMIT) {
    sent.set(ip, recent);
    return false;
  }
  recent.push(now);
  sent.set(ip, recent);
  // Keep the map small: drop IPs with nothing in the window
  if (sent.size > 5_000) for (const [k, v] of sent) if (!v.some((t) => now - t < RATE_WINDOW_MS)) sent.delete(k);
  return true;
}

export async function POST(req: Request) {
  if (Number(req.headers.get("content-length") ?? 0) > MAX_BODY_BYTES) {
    return Response.json({ error: "too_large" }, { status: 413 });
  }
  let body: Record<string, unknown>;
  try {
    const raw = await req.text();
    if (raw.length > MAX_BODY_BYTES) return Response.json({ error: "too_large" }, { status: 413 });
    body = JSON.parse(raw);
    if (!body || typeof body !== "object" || Array.isArray(body)) throw new Error("not an object");
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }

  // Honeypot (a hidden field people never fill) and fill time (no person completes the form in 3 seconds):
  // answer "ok" so bots don't learn anything, but send nothing.
  if (typeof body.website === "string" && body.website.trim()) return Response.json({ ok: true });
  const elapsed = Number(body.elapsed);
  if (!Number.isFinite(elapsed) || elapsed < MIN_FILL_MS) return Response.json({ ok: true });

  const values = readContact((k) => body[k]);
  const errors = validateContact(values);
  if (Object.keys(errors).length) return Response.json({ errors }, { status: 422 });

  if (!withinRateLimit(clientIp(req))) return Response.json({ error: "rate_limited" }, { status: 429 });

  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    console.error("Contact form: SMTP_HOST, SMTP_USER or SMTP_PASS is not set.");
    return Response.json({ error: "not_configured" }, { status: 503 });
  }

  const port = Number(SMTP_PORT) || 587;
  const transport = nodemailer.createTransport({
    host: SMTP_HOST,
    port,
    secure: port === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });

  const from = parseFrom(process.env.CONTACT_FROM, SMTP_USER);
  const { subject, text, html } = buildContactEmail(values);
  try {
    await transport.sendMail({
      from,
      to: process.env.CONTACT_TO || siteConfig.contact.email,
      replyTo: values.email,
      subject,
      text,
      html,
    });
  } catch (err) {
    console.error("Contact form: SMTP error", err);
    return Response.json({ error: "send_failed" }, { status: 502 });
  }
  return Response.json({ ok: true });
}
