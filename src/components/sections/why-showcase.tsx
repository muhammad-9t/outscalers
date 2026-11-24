"use client";

import { type CSSProperties, useEffect, useState } from "react";
import {
  Check,
  ChevronRight,
  Cloud,
  GitBranch,
  Handshake,
  Layers3,
  type LucideIcon,
  Plus,
  ShieldCheck,
  Sparkles,
  UserCheck,
  Wrench,
} from "lucide-react";

/**
 * Home "Why Outscalers": the six reasons as a card carousel. The active card sits inside a phone
 * frame with its explanation; the others step back to each side, smaller and fading out, with
 * icon badges floating around. It moves on by itself (paused on hover/focus and for reduced
 * motion); click a side card or a dot to bring it to the centre. Styles: .why-* in globals.css.
 */

type Tone = "human" | "brand" | "data";
const reasons: { icon: LucideIcon; tag: string; title: string; body: string; tone: Tone }[] = [
  {
    icon: UserCheck,
    tag: "Ownership",
    title: "Human accountability",
    body: "A named engineer owns every decision and every merged change. AI never ships code on its own.",
    tone: "human",
  },
  {
    icon: Sparkles,
    tag: "Speed",
    title: "AI-enhanced delivery",
    body: "AI handles the repetitive work — scaffolding, drafts, test ideas — so engineering time goes where it matters.",
    tone: "brand",
  },
  {
    icon: Wrench,
    tag: "Fit",
    title: "Tailored solutions",
    body: "We start from your process and constraints, then choose the simplest technology that solves the problem.",
    tone: "data",
  },
  {
    icon: ShieldCheck,
    tag: "Trust",
    title: "Security & quality practices",
    body: "Code review, automated testing and security checks are part of every project, not optional extras.",
    tone: "human",
  },
  {
    icon: Layers3,
    tag: "Growth",
    title: "Scalable architecture",
    body: "Systems designed to grow with you — with the cloud, data and performance foundations to support it.",
    tone: "brand",
  },
  {
    icon: Handshake,
    tag: "Partnership",
    title: "Long-term partnership",
    body: "Project delivery, team augmentation or ongoing support — we stay involved after launch.",
    tone: "data",
  },
];

/** Badges floating around the stage (position in % of the stage) */
const badges: { icon: LucideIcon; x: number; y: number; tone: Tone }[] = [
  { icon: Check, x: 22, y: 14, tone: "human" },
  { icon: Sparkles, x: 70, y: 8, tone: "brand" },
  { icon: Cloud, x: 80, y: 30, tone: "data" },
  { icon: GitBranch, x: 14, y: 78, tone: "brand" },
  { icon: ShieldCheck, x: 66, y: 86, tone: "human" },
  { icon: Layers3, x: 88, y: 70, tone: "data" },
];

const n = reasons.length;
/** Signed distance of card i from the active one, wrapped to -3..2 */
const offset = (i: number, active: number) => ((((i - active) % n) + n + Math.floor(n / 2)) % n) - Math.floor(n / 2);

export function WhyShowcase() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = window.setInterval(() => setActive((a) => (a + 1) % n), 4500);
    return () => window.clearInterval(t);
  }, [paused]);

  return (
    <div
      data-reveal
      className="why"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div className="why-stage">
        {badges.map((b, i) => (
          <span key={i} aria-hidden className="why-badge" data-tone={b.tone} style={{ "--x": `${b.x}%`, "--y": `${b.y}%`, "--i": i } as CSSProperties}>
            <b.icon className="size-4" strokeWidth={2.2} />
          </span>
        ))}

        {/* Phone frame around the active card */}
        <div aria-hidden className="why-phone">
          <div className="flex items-center justify-between px-5 pt-3 font-mono text-xs font-semibold text-fg">
            9:41
            <span className="flex items-center gap-1">
              <span className="h-2 w-3.5 rounded-sm bg-fg/80" />
              <span className="h-2 w-2 rounded-full bg-fg/80" />
            </span>
          </div>
          <div className="mt-3 flex items-center gap-1.5 px-4 text-xs">
            <span className="rounded-full bg-ink-800 px-2.5 py-1 text-fg-muted">Why us</span>
            <span className="rounded-full bg-brand-400/15 px-2.5 py-1 font-medium text-brand-300">
              {active + 1} / {n}
            </span>
            <span className="ml-auto grid size-7 place-items-center rounded-full bg-brand-400 text-on-brand">
              <Plus className="size-4" />
            </span>
          </div>
        </div>

        <ul className="why-cards">
          {reasons.map((r, i) => {
            const d = offset(i, active);
            return (
              <li
                key={r.title}
                className="why-card"
                data-active={d === 0 ? "" : undefined}
                data-tone={r.tone}
                style={{ "--d": d, "--ad": Math.abs(d) } as CSSProperties}
              >
                <button
                  type="button"
                  className="why-card-btn"
                  onClick={() => setActive(i)}
                  aria-current={d === 0 ? "true" : undefined}
                  tabIndex={Math.abs(d) > 1 ? -1 : 0}
                >
                  <span className="why-art">
                    <span className="why-chip">
                      0{i + 1} · {r.tag}
                    </span>
                    <span className="why-icon">
                      <r.icon className="size-[46%]" strokeWidth={1.8} />
                    </span>
                    <span className="why-title">
                      <span className="text-lg font-semibold leading-snug">{r.title}</span>
                      <ChevronRight aria-hidden className="size-5 shrink-0" />
                    </span>
                  </span>
                </button>
                <p className="why-body">{r.body}</p>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Dots */}
      <div className="mt-6 flex justify-center gap-2" role="group" aria-label="Choose a reason">
        {reasons.map((r, i) => (
          <button
            key={r.title}
            type="button"
            aria-label={r.title}
            aria-current={i === active ? "true" : undefined}
            onClick={() => setActive(i)}
            className={i === active ? "h-2 w-7 rounded-full bg-brand-400 transition-all duration-300" : "size-2 rounded-full bg-line-strong transition-all duration-300 hover:bg-fg-subtle"}
          />
        ))}
      </div>
    </div>
  );
}
