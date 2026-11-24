import { NEED_DEDICATED, type ContactValues } from "@/lib/contact";

const escapeHtml = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

/** Strips line breaks so visitor input can never add lines to an email header. */
const oneLine = (s: string) => s.replace(/[\r\n]+/g, " ").trim();

/** One line that tells the team what kind of lead this is, e.g. "Dedicated developers · 2–4 developers · Pakistan". */
export function leadSummary(v: ContactValues) {
  if (v.need === NEED_DEDICATED) {
    return [v.need, v.devCount && `${v.devCount} developer${v.devCount === "1" ? "" : "s"}`, v.location && `Location: ${v.location}`]
      .filter(Boolean)
      .join(" · ");
  }
  return [v.need, v.interest].filter(Boolean).join(" · ") || "General enquiry";
}

/** Subject, plain text and HTML for the enquiry email the team receives. */
export function buildContactEmail(v: ContactValues) {
  const summary = leadSummary(v);
  const name = `${v.firstName} ${v.lastName}`;
  const rows: [string, string][] = (
    [
      ["Need", v.need],
      ["Developers", v.devCount],
      ["Team location", v.location],
      ["Area", v.interest],
      ["Name", name],
      ["Email", v.email],
      ["Company", v.company],
    ] as [string, string][]
  ).filter(([, val]) => Boolean(val));

  const subject = oneLine(`${summary} (${name}${v.company ? `, ${v.company}` : ""})`);
  const text = `${summary}\n\n${rows.map(([k, val]) => `${k}: ${val}`).join("\n")}\n\n${v.message}`;
  const html = `<p style="font-size:16px"><strong>${escapeHtml(summary)}</strong></p><table cellpadding="4">${rows
    .map(([k, val]) => `<tr><td><strong>${k}</strong></td><td>${escapeHtml(val)}</td></tr>`)
    .join("")}</table><p style="white-space:pre-wrap">${escapeHtml(v.message)}</p>`;
  return { subject, text, html };
}
