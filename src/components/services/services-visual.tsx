"use client";

import { type CSSProperties, useRef } from "react";
import { ArrowRight, Bot, Check, GitBranch, UserRound, Workflow } from "lucide-react";
import { ServiceGlyph } from "@/components/illustrations/service-glyph";
import { useTilt } from "@/components/about/use-tilt";

/**
 * Services hero visual: three floating cards showing the services at work. An AI agent reads a
 * document and hands low-confidence cases to a person, a release passes build, review and tests,
 * and an approved workflow connects everyday systems. Glossy tiles for the other services float
 * in front. Tilts with the mouse. Styles: .aj-* (shared) and .sv-* in globals.css.
 */
export function ServicesVisual() {
  const ref = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<HTMLDivElement>(null);
  useTilt(ref, sceneRef);

  return (
    <div
      ref={ref}
      className="aj sv"
      role="img"
      aria-label="An AI agent reads an invoice and hands unclear cases to a person, a release passes review and tests, and an approved workflow connects your systems"
    >
      <div ref={sceneRef} className="aj-scene">
        <span aria-hidden className="aj-glow aj-glow-a" />
        <span aria-hidden className="aj-glow aj-glow-b" />

        {/* AI agent */}
        <div className="aj-card sv-a" style={{ "--z": "-30px", "--i": 0 } as CSSProperties}>
          <div className="flex items-center justify-between">
            <span className="aj-year">AI agent</span>
            <span className="aj-icon" data-tone="brand">
              <Bot className="size-4" />
            </span>
          </div>
          <p className="mt-2 font-semibold">Invoice read</p>
          <span className="aj-row mt-2 justify-between text-sm text-fg-muted">
            Confidence <span className="font-semibold text-fg">92%</span>
          </span>
          <span className="aj-bar" data-tone="brand" style={{ "--w": "92%", "--i": 0 } as CSSProperties} />
          <span className="sv-handoff mt-3">
            <UserRound aria-hidden className="size-3.5" /> Unclear? A person decides
          </span>
        </div>

        {/* Release */}
        <div className="aj-card sv-b" style={{ "--z": "20px", "--i": 1 } as CSSProperties}>
          <div className="flex items-center justify-between">
            <span className="aj-year">Release 2.4</span>
            <span className="aj-icon" data-tone="human">
              <GitBranch className="size-4" />
            </span>
          </div>
          <ul className="mt-3 space-y-2 text-sm">
            {["Build", "Code review", "Tests"].map((step) => (
              <li key={step} className="aj-row">
                <span className="sv-check" aria-hidden>
                  <Check className="size-3" strokeWidth={3} />
                </span>
                {step}
              </li>
            ))}
            <li className="aj-row">
              <span className="sv-live" aria-hidden />
              <span className="font-semibold">Live</span>
            </li>
          </ul>
        </div>

        {/* Automation */}
        <div className="aj-card sv-c" style={{ "--z": "60px", "--i": 2 } as CSSProperties}>
          <div className="flex items-center justify-between">
            <span className="aj-year aj-live">Workflow</span>
            <span className="aj-icon" data-tone="data">
              <Workflow className="size-4" />
            </span>
          </div>
          <p className="mt-2 text-lg font-semibold">New order to invoice</p>
          <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
            {["Shop", "CRM", "Invoice"].map((s, i) => (
              <span key={s} className="flex items-center gap-1.5">
                {i > 0 && <ArrowRight aria-hidden className="size-3.5 text-fg-subtle" />}
                <span className="aj-chip">{s}</span>
              </span>
            ))}
          </div>
          <span className="sv-approved mt-3">
            <Check aria-hidden className="size-3.5" strokeWidth={3} /> Approved by your team
          </span>
        </div>

        {/* Glossy tiles for the remaining services */}
        {(
          [
            { slug: "software-development", x: 86, y: 2, tone: "brand" },
            { slug: "data-cloud", x: 1, y: 50, tone: "data" },
            { slug: "security-quality", x: 88, y: 74, tone: "human" },
          ] as const
        ).map((t, i) => (
          <span
            key={t.slug}
            aria-hidden
            className="aj-tile"
            data-tone={t.tone}
            style={{ "--x": `${t.x}%`, "--y": `${t.y}%`, "--z": "110px", "--i": i } as CSSProperties}
          >
            <ServiceGlyph slug={t.slug} className="size-[50%]" />
          </span>
        ))}
      </div>
    </div>
  );
}
