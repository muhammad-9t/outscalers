"use client";

import { type CSSProperties, useRef } from "react";
import { Check, Database, FileText, Mail, Sparkles, UserRound, Workflow } from "lucide-react";
import { useTilt } from "@/components/about/use-tilt";

/**
 * Automation hero: one invoice travelling down a workflow. A centre line carries a moving token;
 * the steps hang off it, alternating left and right: the invoice arrives, AI reads it and checks
 * it against the order, a person approves the large amount, the finance system is updated.
 * Tilts with the mouse. Styles: .aj-* (shared) and .sdau-* in globals.css.
 */
export function AutomationHeroVisual() {
  const ref = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<HTMLDivElement>(null);
  useTilt(ref, sceneRef);

  return (
    <div
      ref={ref}
      className="aj sdau"
      role="img"
      aria-label="An invoice moves through an automated workflow: captured from email, read by AI and matched to the purchase order, approved by a person, then the finance system is updated"
    >
      <div ref={sceneRef} className="aj-scene">
        <span aria-hidden className="aj-glow aj-glow-a" />

        {/* The line the work travels along, with a token moving down it */}
        <svg className="sdau-line" viewBox="0 0 10 100" preserveAspectRatio="none" aria-hidden>
          <defs>
            <linearGradient id="sdau-grad" gradientUnits="userSpaceOnUse" x1="5" y1="6" x2="5" y2="96">
              <stop offset="0" style={{ stopColor: "var(--color-human-accent)" }} />
              <stop offset="0.5" style={{ stopColor: "var(--color-brand-400)" }} />
              <stop offset="1" style={{ stopColor: "var(--color-success)" }} />
            </linearGradient>
          </defs>
          <line x1="5" y1="6" x2="5" y2="96" stroke="url(#sdau-grad)" />
        </svg>
        <span aria-hidden className="sdau-token" />

        {/* 1. Captured */}
        {/* Steps stay on the line's plane (--z 0) so their rings stay on it when the scene tilts */}
        <div className="aj-card sdau-step" data-side="l" data-tone="human" style={{ "--top": "4%", "--z": "0px", "--i": 0 } as CSSProperties}>
          <span className="aj-icon" data-tone="human">
            <Mail className="size-4" />
          </span>
          <span className="min-w-0">
            <span className="block text-sm font-semibold">Invoice arrives</span>
            <span className="sdau-file">
              <FileText className="size-3" /> inv-2041.pdf
            </span>
          </span>
        </div>

        {/* 2. Read and checked */}
        <div className="aj-card sdau-step" data-side="r" data-tone="brand" style={{ "--top": "27%", "--z": "0px", "--i": 1 } as CSSProperties}>
          <span className="aj-icon" data-tone="brand">
            <Sparkles className="size-4" />
          </span>
          <span className="min-w-0">
            <span className="block text-sm font-semibold">AI reads it</span>
            <span className="block text-xs text-fg-muted">Acme Ltd · €4,280 · due 30 Nov</span>
            <span className="sdau-ok">
              <Check className="size-3" strokeWidth={3} /> Matches PO-881
            </span>
          </span>
        </div>

        {/* 3. Person approves */}
        <div className="aj-card sdau-step" data-side="l" data-tone="human" style={{ "--top": "52%", "--z": "0px", "--i": 2 } as CSSProperties}>
          <span className="cv-avatar sdau-avatar">
            <UserRound className="size-4" />
          </span>
          <span className="min-w-0">
            <span className="block text-sm font-semibold">Over €2,000</span>
            <span className="block text-xs text-fg-muted">A manager approves</span>
            <span className="sdai-btn sdai-btn-go mt-2">
              <Check className="size-3" strokeWidth={3} /> Approved
            </span>
          </span>
        </div>

        {/* 4. Done */}
        <div className="aj-card sdau-step" data-side="r" data-tone="success" style={{ "--top": "77%", "--z": "0px", "--i": 3 } as CSSProperties}>
          <span className="aj-icon sdau-done">
            <Database className="size-4" />
          </span>
          <span className="min-w-0">
            <span className="block text-sm font-semibold">Finance updated</span>
            <span className="block text-xs text-fg-muted">With an audit trail</span>
          </span>
        </div>

        <span
          aria-hidden
          className="aj-tile sdau-tile"
          data-tone="brand"
          style={{ "--x": "0%", "--y": "0%", "--z": "110px", "--i": 1 } as CSSProperties}
        >
          <Workflow className="size-[48%]" strokeWidth={1.8} />
        </span>
      </div>
    </div>
  );
}
