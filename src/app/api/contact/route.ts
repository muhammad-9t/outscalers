import { siteConfig } from "@/lib/site";
import { readContact, validateContact, type ContactValues } from "@/lib/contact";

/**
 * Sends a project enquiry to the team inbox through Resend.
 * Env: RESEND_API_KEY (required), CONTACT_FROM (a sender on a Resend-verified
 * domain), CONTACT_TO (defaults to the public contact address).
 */

const escapeHtml = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

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

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.CONTACT_FROM;
  if (!apiKey || !from) {
    console.error("Contact form: RESEND_API_KEY or CONTACT_FROM is not set.");
    return Response.json({ error: "not_configured" }, { status: 503 });
  }

  const { text, html } = buildEmail(values);
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from,
      to: [process.env.CONTACT_TO || siteConfig.contact.email],
      reply_to: values.email,
      subject: `Project enquiry: ${values.interest || "General"} (${values.firstName} ${values.lastName})`,
      text,
      html,
    }),
  });

  if (!res.ok) {
    console.error("Contact form: Resend error", res.status, await res.text());
    return Response.json({ error: "send_failed" }, { status: 502 });
  }
  return Response.json({ ok: true });
}
