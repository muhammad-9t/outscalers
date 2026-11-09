import nodemailer from "nodemailer";
import { siteConfig } from "@/lib/site";
import { readContact, validateContact, type ContactValues } from "@/lib/contact";

/**
 * Sends a project enquiry to the team inbox over SMTP.
 * Env: SMTP_HOST, SMTP_PORT (465 = TLS, otherwise STARTTLS), SMTP_USER, SMTP_PASS,
 * CONTACT_FROM (defaults to SMTP_USER), CONTACT_TO (defaults to the public contact address).
 */

const escapeHtml = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

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

function buildEmail(v: ContactValues) {
  const rows: [string, string][] = [
    ["Name", `${v.firstName} ${v.lastName}`],
    ["Email", v.email],
    ["Company", v.company],
    ["Interested in", v.interest],
  ].filter((r): r is [string, string] => Boolean(r[1]));

  const text = `${rows.map(([k, val]) => `${k}: ${val}`).join("\n")}\n\n${v.message}`;
  const html = `<table cellpadding="4">${rows
    .map(([k, val]) => `<tr><td><strong>${k}</strong></td><td>${escapeHtml(val)}</td></tr>`)
    .join("")}</table><p style="white-space:pre-wrap">${escapeHtml(v.message)}</p>`;
  return { text, html };
}

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }

  // Honeypot: real visitors never see or fill this field.
  if (typeof body.website === "string" && body.website.trim()) return Response.json({ ok: true });

  const values = readContact((k) => body[k]);
  const errors = validateContact(values);
  if (Object.keys(errors).length) return Response.json({ errors }, { status: 422 });

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
  const { text, html } = buildEmail(values);
  try {
    await transport.sendMail({
      from,
      to: process.env.CONTACT_TO || siteConfig.contact.email,
      replyTo: values.email,
      subject: `Project enquiry: ${values.interest || "General"} (${values.firstName} ${values.lastName})`,
      text,
      html,
    });
  } catch (err) {
    console.error("Contact form: SMTP error", err);
    return Response.json({ error: "send_failed" }, { status: 502 });
  }
  return Response.json({ ok: true });
}
