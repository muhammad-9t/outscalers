import type { CSSProperties } from "react";
import Link from "next/link";
import { AppWindow, ArrowRight, BrainCircuit, History, type LucideIcon, Workflow } from "lucide-react";
import { serviceHref } from "@/content/services";

/**
 * Home "Where we help": the four business needs as soft tiles in one row (icon + title at rest); hovering or focusing one grows it into a feature card with the full
 * explanation and a link, while the rest of the grid steps back. Touch screens and phones show
 * the cards open in a simple grid. Styles: .nb-* in globals.css.
 */

type Tone = "brand" | "human" | "data";
const needs: { icon: LucideIcon; title: string; accent: string; body: string; href: string; tone: Tone }[] = [
  {
    icon: Workflow,
    title: "Automate repetitive",
    accent: "workflows",
    body: "Connect your systems and remove manual hand-offs, with approval steps for decisions that need a person.",
    href: serviceHref("automation"),
    tone: "brand",
  },
  {
    icon: AppWindow,
    title: "Build a new digital",
    accent: "product",
    body: "Web, mobile and SaaS products — from first release to a platform that scales.",
    href: serviceHref("software-development"),
    tone: "human",
  },
  {
    icon: History,
    title: "Modernise legacy",
    accent: "systems",
    body: "Refactor, migrate and test ageing applications incrementally, without risky big-bang rewrites.",
    href: serviceHref("software-development"),
    tone: "data",
  },
  {
    icon: BrainCircuit,
    title: "Add intelligence to your",
    accent: "business",
    body: "Assistants, agents and document intelligence grounded in your own data, with guardrails.",
    href: serviceHref("ai-solutions"),
    tone: "brand",
  },
];

export function NeedsBento() {
  return (
    <ul data-reveal className="nb mt-12" aria-label="Business needs">
      {needs.map((need, col) => {
        return (
          <li key={need.title} className="nb-tile nb-need" data-col={col} data-tone={need.tone} style={{ "--n": col } as CSSProperties}>
            <Link href={need.href} className="nb-link">
              {/* At rest */}
              <span className="nb-rest">
                <span className="grid size-11 place-items-center rounded-xl bg-brand-500/10 text-brand-300">
                  <need.icon aria-hidden className="size-5" />
                </span>
                <span className="mt-4 block font-display text-lg font-semibold leading-snug">
                  {need.title} {need.accent}
                </span>
              </span>
              {/* Grown card */}
              <span className="nb-card">
                <span className="nb-card-icon">
                  <need.icon aria-hidden className="size-5" />
                </span>
                <span aria-hidden className="mt-4 block text-2xl font-medium leading-tight tracking-tight">
                  {need.title} <em className="nb-accent">{need.accent}.</em>
                </span>
                <span className="mx-auto mt-3 block max-w-[17rem] text-[0.9375rem] leading-relaxed text-white/70">{need.body}</span>
                <span aria-hidden className="nb-pill">
                  Explore <ArrowRight className="size-4" />
                </span>
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
