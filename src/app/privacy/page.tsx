import Link from "next/link";
import { pageMetadata, siteConfig } from "@/lib/site";

/*
 * Privacy policy (general GDPR text, written to match what this site actually does as of Nov 2026:
 * no analytics or tracking, self-hosted fonts, contact form by email).
 * Reviewed and approved by Outscalers' lawyer (Nov 2026).
 * If the site adds analytics, embeds or new forms, update this page first.
 */

export const metadata = pageMetadata({
  title: "Privacy Policy",
  description: "How Outscalers handles personal data on this website.",
  path: "/privacy",
});

const UPDATED = "November 2026";

type Block = { title: string; body: (string | { list: string[] })[] };

const sections: Block[] = [
  {
    title: "1. Who is responsible",
    body: [
      `The controller for this website is ${siteConfig.legal.name}, ${siteConfig.legal.address} (VAT number ${siteConfig.legal.vat}). Email: ${siteConfig.contact.email}.`,
      "For any question about your personal data, write to us at the address above.",
    ],
  },
  {
    title: "2. Visiting this website",
    body: [
      "When you open a page, our server automatically records technical data: your IP address, the date and time, the page requested, the referring page and your browser type. We need this to deliver the site securely and to detect misuse (Art. 6(1)(f) GDPR). These logs are deleted after a short period unless we need them to investigate an attack.",
      "We do not use analytics, advertising or tracking tools, and we do not set tracking cookies. Our fonts are served from our own server.",
    ],
  },
  {
    title: "3. Settings stored in your browser",
    body: [
      "Some features save small settings in your browser's local or session storage, for example your light or dark theme and whether you have already seen a tip. This data stays on your device, is not sent to us and is only used to provide the feature you chose, which the ePrivacy rules allow without consent. You can delete it at any time in your browser settings.",
    ],
  },
  {
    title: "4. Contact form and email",
    body: [
      "When you send us a message, we receive the details you enter: name, email address, company (optional), what you need (for example team size and location) and your message. The form is delivered to our team by email.",
      "We use these details only to answer your enquiry and, if you wish, to prepare a proposal or contract (Art. 6(1)(b) GDPR) and to keep a record of our correspondence (Art. 6(1)(f) GDPR). We delete them when they are no longer needed, unless legal retention periods (for example under tax or commercial law) require us to keep them longer.",
    ],
  },
  {
    title: "5. Booking a call (Calendly)",
    body: [
      "Our “Book a call” buttons link to Calendly, an external scheduling service provided by Calendly LLC in the USA. Nothing is loaded from Calendly until you click a link. When you book, Calendly processes the details you enter under its own privacy policy, and data may be transferred to the USA. We use the booking details to hold the call (Art. 6(1)(b) GDPR).",
    ],
  },
  {
    title: "6. Links to other websites",
    body: [
      "We link to our profiles on LinkedIn, Facebook, Instagram and YouTube, and to the websites and app-store pages of products we have built. These are plain links: no data is sent to those services until you click one, after which their privacy policies apply.",
    ],
  },
  {
    title: "7. Your rights",
    body: [
      "You have the right to:",
      {
        list: [
          "access the personal data we hold about you (Art. 15 GDPR)",
          "have it corrected (Art. 16) or deleted (Art. 17)",
          "restrict its processing (Art. 18)",
          "receive it in a portable format (Art. 20)",
          "object to processing based on our legitimate interests (Art. 21)",
          "lodge a complaint with a data protection supervisory authority (Art. 77)",
        ],
      },
      `To use these rights, email ${siteConfig.contact.email}.`,
    ],
  },
  {
    title: "8. Changes",
    body: ["We update this policy when our website or the law changes. The current version is always on this page."],
  },
];

export default function PrivacyPage() {
  return (
    <section className="relative bg-ink-950 pt-28 pb-20 sm:pt-36 sm:pb-28">
      <div className="container-narrow">
        <nav aria-label="Breadcrumb" className="mb-8 text-sm text-fg-subtle">
          <Link href="/" className="transition-colors hover:text-fg">
            Home
          </Link>{" "}
          / <span aria-current="page">Privacy Policy</span>
        </nav>
        <h1 className="text-display-lg font-semibold">Privacy Policy</h1>
        <p className="mt-4 text-fg-subtle">Last updated: {UPDATED}</p>
        <p className="mt-6 text-lead text-fg-muted">
          We keep this short: this website collects as little personal data as possible, and we never sell it.
        </p>

        <div className="prose-site mt-12 space-y-10">
          {sections.map((s) => (
            <section key={s.title} aria-labelledby={`p-${s.title.split(".")[0]}`}>
              <h2 id={`p-${s.title.split(".")[0]}`} className="text-xl font-semibold text-fg">
                {s.title}
              </h2>
              <div className="mt-3">
                {s.body.map((b, i) =>
                  typeof b === "string" ? (
                    <p key={i}>{b}</p>
                  ) : (
                    <ul key={i} className="mt-3 list-disc space-y-1.5 pl-6 text-fg-muted marker:text-brand-400">
                      {b.list.map((li) => (
                        <li key={li}>{li}</li>
                      ))}
                    </ul>
                  ),
                )}
              </div>
            </section>
          ))}
        </div>
      </div>
    </section>
  );
}
