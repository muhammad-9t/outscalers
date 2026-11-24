"use client";

import { type CSSProperties, useState } from "react";
import { ArrowUpRight, Check, Copy, Mail, MessageSquareText, PhoneCall, Search, UserRound } from "lucide-react";
import { Flag } from "@/components/ui/brand-icons";
import { Reveal } from "@/components/ui/primitives";

type Tone = "human" | "brand" | "data";

/** What happens after someone sends the form */
const steps: { icon: typeof Search; tone: Tone; title: string; body: string; when: string }[] = [
  { icon: Search, tone: "human", title: "We read your message", body: "A real person looks at what you want to build and what's in the way.", when: "Today" },
  { icon: MessageSquareText, tone: "brand", title: "An engineer replies", body: "First thoughts and honest questions, from someone who builds.", when: "Within 1 business day" },
  { icon: PhoneCall, tone: "data", title: "A short call and a plan", body: "If it's a fit, a 30-minute call and a clear next step. No obligation.", when: "At a time that suits you" },
];

/** Booking links grouped by region, with the office flags and time zones they cover */
const regions = [
  { name: "Europe", flags: ["Germany", "Italy"], zones: "CET hours", match: "Europe" },
  { name: "Asia", flags: ["Pakistan", "Hong Kong"], zones: "PKT · HKT hours", match: "Asia" },
];

/**
 * Contact page sidebar: a soft timeline of what happens after sending the form, and a "prefer to
 * talk?" card with a copyable email and booking cards per region. Styles: .cs-* in globals.css.
 */
export function ContactSidebar({ email, scheduling }: { email: string; scheduling: readonly { label: string; href: string }[] }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      window.location.href = `mailto:${email}`;
    }
  };

  return (
    <div className="grid min-w-0 grid-cols-[minmax(0,1fr)] gap-6 lg:grid-rows-[auto_1fr]">
      <Reveal delay={80} className="ct-card p-6">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-lg font-semibold">What happens next</h3>
          <span className="cs-badge">3 steps</span>
        </div>
        <ol className="cs-steps mt-5">
          {steps.map((s, i) => (
            <li key={s.title} className="cs-step" data-first={i === 0 ? "" : undefined} style={{ "--i": i } as CSSProperties}>
              <span className="cs-step-icon" data-tone={s.tone} aria-hidden>
                <s.icon className="size-4" />
              </span>
              <div className="min-w-0">
                <span className="cs-when" data-tone={s.tone}>
                  {s.when}
                </span>
                <p className="mt-1.5 font-semibold">{s.title}</p>
                <p className="mt-0.5 text-sm leading-relaxed text-fg-muted">{s.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </Reveal>

      <Reveal delay={160} className="ct-card flex flex-col p-6">
        <div className="flex items-center gap-3">
          <span className="flex -space-x-2" aria-hidden>
            {(["human", "brand", "data"] as Tone[]).map((t) => (
              <span key={t} className="cs-avatar" data-tone={t}>
                <UserRound className="size-3.5" />
              </span>
            ))}
          </span>
          <div>
            <h3 className="text-lg font-semibold leading-tight">Prefer to talk?</h3>
            <p className="text-sm text-fg-muted">Talk to an engineer, not a salesperson.</p>
          </div>
        </div>

        {/* Email, with one-click copy */}
        <div className="cs-email mt-5">
          <span className="cs-email-icon" aria-hidden>
            <Mail className="size-4" />
          </span>
          <a href={`mailto:${email}`} className="min-w-0 flex-1 truncate font-medium text-fg hover:text-brand-300">
            {email}
          </a>
          <button type="button" onClick={copy} className="cs-copy" aria-label={copied ? "Email address copied" : "Copy email address"}>
            {copied ? <Check aria-hidden className="size-4" strokeWidth={2.5} /> : <Copy aria-hidden className="size-4" />}
            <span>{copied ? "Copied" : "Copy"}</span>
          </button>
        </div>

        {/* Book a call by region */}
        <p className="mt-5 text-sm font-medium text-fg">Book a call</p>
        <div className="mt-2.5 grid grid-cols-2 gap-2.5">
          {regions.map((r) => {
            const link = scheduling.find((s) => s.label.includes(r.match));
            if (!link) return null;
            return (
              <a key={r.name} href={link.href} target="_blank" rel="noopener noreferrer" className="cs-region group">
                <span className="flex items-center justify-between">
                  <span className="flex gap-1">
                    {r.flags.map((c) => (
                      <Flag key={c} country={c} className="h-3 w-[1.125rem] rounded-[2px] ring-1 ring-line" />
                    ))}
                  </span>
                  <ArrowUpRight aria-hidden className="size-4 text-fg-subtle transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </span>
                <span className="mt-3 block font-semibold text-fg">{r.name}</span>
                <span className="block text-xs text-fg-muted">{r.zones}</span>
              </a>
            );
          })}
        </div>

        <div className="mt-auto flex flex-wrap gap-1.5 pt-4">
          {["Free", "30 minutes", "No obligation"].map((t) => (
            <span key={t} className="cs-chip">
              <Check aria-hidden className="size-3" strokeWidth={3} /> {t}
            </span>
          ))}
        </div>
      </Reveal>
    </div>
  );
}
