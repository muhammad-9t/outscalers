"use client";

import { type CSSProperties, useRef } from "react";
import { Check, GitPullRequest, ShieldCheck, Sparkles, UserCheck, UserRound } from "lucide-react";
import { useTilt } from "@/components/about/use-tilt";

const diff = [
  { sign: "+", w: "78%", ai: true },
  { sign: "+", w: "62%", ai: true },
  { sign: "−", w: "48%", ai: false },
  { sign: "+", w: "70%", ai: true },
];

/**
 * How We Work hero visual: one change on its way to production. In the middle, a pull request with
 * AI-drafted lines and an engineer's review; on the left, what the AI drafted; on the right, the
 * checks it passed. Glossy tiles float in front and the scene tilts with the mouse.
 * Styles: .aj-* (shared) and .rv-* in globals.css.
 */
export function ReviewVisual() {
  const ref = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<HTMLDivElement>(null);
  useTilt(ref, sceneRef, 6, 9);

  return (
    <div
      ref={ref}
      className="aj rv"
      role="img"
      aria-label="AI drafts the change, an engineer reviews and approves it, and automated checks pass before it ships"
    >
      <div ref={sceneRef} className="aj-scene">
        <span aria-hidden className="aj-glow aj-glow-a rv-glow" />
        <span aria-hidden className="aj-glow aj-glow-b" />

        {/* AI draft */}
        <div className="aj-card rv-left" style={{ "--z": "-20px", "--i": 0 } as CSSProperties}>
          <div className="flex items-center justify-between">
            <span className="aj-year">AI draft</span>
            <span className="aj-icon" data-tone="brand">
              <Sparkles className="size-4" />
            </span>
          </div>
          <p className="mt-2 font-semibold">Routine work done</p>
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            <span className="aj-chip">Scaffolding</span>
            <span className="aj-chip">Boilerplate</span>
            <span className="aj-chip">First tests</span>
          </div>
        </div>

        {/* Pull request */}
        <div className="aj-card rv-main" style={{ "--z": "30px", "--i": 1 } as CSSProperties}>
          <div className="flex items-center justify-between">
            <span className="aj-year aj-live">Pull request</span>
            <span className="aj-icon" data-tone="human">
              <GitPullRequest className="size-4" />
            </span>
          </div>
          <p className="mt-2 text-lg font-semibold">Invoice export to PDF</p>
          <span className="mt-3 block space-y-2">
            {diff.map((d, i) => (
              <span key={i} className="rv-line" data-sign={d.sign === "+" ? "add" : "del"}>
                <span className="rv-sign">{d.sign}</span>
                <span className="aj-code" data-tone={d.ai ? "brand" : "muted"} style={{ width: d.w }} />
                {d.ai && <span className="rv-ai">AI</span>}
              </span>
            ))}
          </span>
          <span className="rv-comment mt-3.5">
            <span className="cv-avatar rv-avatar">
              <UserRound className="size-3.5" />
            </span>
            <span className="text-sm">
              <span className="block font-semibold">Engineer review</span>
              <span className="block text-fg-muted">Handle empty months, then merge.</span>
            </span>
          </span>
          <span className="rv-approved mt-3">
            <Check aria-hidden className="size-3.5" strokeWidth={3} /> Approved by an engineer
          </span>
        </div>

        {/* Checks */}
        <div className="aj-card rv-right" style={{ "--z": "0px", "--i": 2 } as CSSProperties}>
          <div className="flex items-center justify-between">
            <span className="aj-year">Checks</span>
            <span className="aj-icon" data-tone="data">
              <ShieldCheck className="size-4" />
            </span>
          </div>
          <ul className="mt-3 space-y-2 text-sm">
            {["213 tests passed", "Security scan clean", "Manual QA signed off"].map((c) => (
              <li key={c} className="aj-row">
                <span className="rv-check" aria-hidden>
                  <Check className="size-3" strokeWidth={3} />
                </span>
                {c}
              </li>
            ))}
          </ul>
        </div>

        {/* Glossy tiles */}
        {(
          [
            { icon: UserCheck, x: 22, y: 2, tone: "human" },
            { icon: Sparkles, x: 70, y: 70, tone: "brand" },
            { icon: ShieldCheck, x: 86, y: 2, tone: "data" },
          ] as const
        ).map((t, i) => (
          <span
            key={i}
            aria-hidden
            className="aj-tile"
            data-tone={t.tone}
            style={{ "--x": `${t.x}%`, "--y": `${t.y}%`, "--z": "110px", "--i": i } as CSSProperties}
          >
            <t.icon className="size-[48%]" strokeWidth={1.8} />
          </span>
        ))}
      </div>
    </div>
  );
}
