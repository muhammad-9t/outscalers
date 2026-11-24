"use client";

import { type CSSProperties, useRef } from "react";
import { Activity, Check, Cloud, Database, Users } from "lucide-react";
import { useTilt } from "@/components/about/use-tilt";

const sources = [
  { icon: Database, label: "Database", sub: "Postgres app", tone: "human" },
  { icon: Users, label: "CRM", sub: "SaaS export", tone: "brand" },
  { icon: Activity, label: "Web events", sub: "Stream", tone: "data" },
] as const;

/* Scene coordinates (px) on desktop, where the scene is a fixed 496 × 432 (see .sddc in globals.css).
   Source cards' right edges sit at x = 150 with centres at these y; the warehouse spans x 206–290
   around y = 198; the dashboard's left edge is x = 312, centred at y = 190. */
const SOURCE_Y = [118, 198, 278];
const pipes = [
  ...SOURCE_Y.map((y) => `M150 ${y} C 182 ${y}, 174 198, 206 198`),
  "M290 198 C 300 198, 302 190, 312 190",
];
const CHART = "M0 46 C 14 44, 20 30, 34 32 S 56 40, 68 26 S 92 18, 104 20 S 128 8, 150 4";

/**
 * Data & Cloud hero: three sources flow along curved pipes into a glossy warehouse, which feeds a
 * live dashboard; a freshness / quality note sits under it. Desktop only uses the pipes; phones get
 * the same pieces stacked. Tilts with the mouse. Styles: .aj-* (shared) and .sddc-* in globals.css.
 */
export function DataHeroVisual() {
  const ref = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<HTMLDivElement>(null);
  useTilt(ref, sceneRef);

  return (
    <div
      ref={ref}
      className="aj sddc"
      role="img"
      aria-label="Data from an app database, a CRM and web events flows into one warehouse, which feeds a dashboard that is fresh and passes all quality checks"
    >
      <div ref={sceneRef} className="aj-scene sddc-scene">
        <span aria-hidden className="aj-glow aj-glow-a" />

        {/* Pipes, with data moving along them */}
        <svg className="sddc-pipes" viewBox="0 0 496 432" aria-hidden>
          {pipes.map((d, i) => (
            <g key={d}>
              <path d={d} className="sddc-pipe" data-out={i === pipes.length - 1 || undefined} />
              <circle r="3.5" className="sddc-drop">
                <animateMotion dur="2.4s" begin={`${i * 0.6}s`} repeatCount="indefinite" path={d} />
              </circle>
            </g>
          ))}
        </svg>

        <div className="sddc-sources">
          {sources.map((s, i) => (
            <div key={s.label} className="aj-card sddc-src" style={{ "--z": "0px", "--i": i } as CSSProperties}>
              <span className="aj-icon" data-tone={s.tone}>
                <s.icon className="size-4" />
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-semibold">{s.label}</span>
                <span className="block text-xs text-fg-muted">{s.sub}</span>
              </span>
            </div>
          ))}
        </div>

        {/* The warehouse: a glossy cylinder */}
        <div className="sddc-wh" style={{ "--z": "40px" } as CSSProperties}>
          <svg viewBox="0 0 84 100" className="sddc-db" aria-hidden>
            <defs>
              <linearGradient id="sddc-body" x1="0" x2="1" y1="0" y2="0">
                <stop offset="0" style={{ stopColor: "color-mix(in oklab, var(--color-data-accent) 60%, black)" }} />
                <stop offset="0.35" style={{ stopColor: "var(--color-data-accent)" }} />
                <stop offset="1" style={{ stopColor: "color-mix(in oklab, var(--color-data-accent) 45%, black)" }} />
              </linearGradient>
            </defs>
            <path d="M2 14 V86 A40 12 0 0 0 82 86 V14 Z" fill="url(#sddc-body)" />
            <path d="M2 38 A40 12 0 0 0 82 38 M2 62 A40 12 0 0 0 82 62" className="sddc-db-ring" />
            <ellipse cx="42" cy="14" rx="40" ry="12" className="sddc-db-top" />
            <path d="M14 30 V78" className="sddc-db-shine" />
          </svg>
          <span className="sddc-wh-label">Warehouse</span>
        </div>

        {/* Dashboard built on it */}
        <div className="aj-card sddc-dash" style={{ "--z": "20px", "--i": 1 } as CSSProperties}>
          <span className="block text-xs text-fg-muted">Weekly revenue</span>
          <span className="mt-0.5 flex items-baseline gap-2">
            <span className="text-xl font-semibold">€182k</span>
            <span className="text-xs font-semibold text-success">+8%</span>
          </span>
          <svg viewBox="0 0 150 50" preserveAspectRatio="none" className="sddc-chart" aria-hidden>
            <path d={`${CHART} V50 H0 Z`} className="sddc-chart-fill" />
            <path d={CHART} className="sddc-chart-line" />
          </svg>
          <span className="mt-2 flex gap-1.5">
            <span className="aj-chip">EU</span>
            <span className="aj-chip">US</span>
            <span className="aj-chip">APAC</span>
          </span>
        </div>

        {/* Fresh and checked */}
        <div className="aj-card sddc-fresh" style={{ "--z": "50px", "--i": 2 } as CSSProperties}>
          <span className="cv-online">Synced 2 min ago</span>
          <span className="sddc-ok">
            <Check className="size-3.5" strokeWidth={3} /> 42/42 checks passed
          </span>
        </div>

        <span
          aria-hidden
          className="aj-tile sddc-tile"
          data-tone="human"
          style={{ "--x": "0%", "--y": "0%", "--z": "110px", "--i": 1 } as CSSProperties}
        >
          <Cloud className="size-[48%]" strokeWidth={1.8} />
        </span>
      </div>
    </div>
  );
}
