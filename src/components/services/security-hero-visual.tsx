"use client";

import { type CSSProperties, useRef } from "react";
import { Check, ShieldCheck, UserRound } from "lucide-react";
import { useTilt } from "@/components/about/use-tilt";

const checks = [
  { name: "Unit & integration tests", result: "412 passed" },
  { name: "Dependency scan", result: "0 critical" },
  { name: "Secret scan", result: "Clean" },
  { name: "Code review", result: "Approved" },
  { name: "Load test", result: "p95 180 ms" },
];

/**
 * Security & Quality hero: a large glossy shield as the centrepiece, with a release checklist card
 * in front of it. A scan band sweeps down the list and each check turns green in turn; a small note
 * shows an issue caught by a person in review. Tilts with the mouse. Styles: .aj-* and .sdsq-*.
 */
export function SecurityHeroVisual() {
  const ref = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<HTMLDivElement>(null);
  useTilt(ref, sceneRef);

  return (
    <div
      ref={ref}
      className="aj sdsq"
      role="img"
      aria-label="Release 3.2 passes tests, dependency and secret scans, code review and a load test; an engineer caught one issue in review before release"
    >
      <div ref={sceneRef} className="aj-scene">
        <span aria-hidden className="aj-glow aj-glow-a" />
        <span aria-hidden className="aj-glow aj-glow-b" />

        {/* Centrepiece */}
        <span aria-hidden className="sdsq-shield-wrap" style={{ "--z": "-20px" } as CSSProperties}>
          <span className="hs-gloss sdsq-shield" data-tone="human">
            <ShieldCheck className="size-[50%]" strokeWidth={1.6} />
          </span>
          <span className="sdsq-pedestal" />
        </span>

        {/* Release checklist */}
        <div className="aj-card sdsq-list" style={{ "--z": "50px", "--i": 0 } as CSSProperties}>
          <div className="flex items-center justify-between gap-3">
            <span>
              <span className="block text-sm font-semibold">Release 3.2</span>
              <span className="block text-xs text-fg-muted">Checks before it ships</span>
            </span>
            <span className="sdsq-ready">
              <Check className="size-3.5" strokeWidth={3} /> Ready
            </span>
          </div>
          <ul className="sdsq-rows">
            {checks.map((c, i) => (
              <li key={c.name} className="sdsq-row" style={{ "--n": i } as CSSProperties}>
                <span className="sdsq-tick">
                  <Check className="size-3" strokeWidth={3.5} />
                </span>
                <span className="min-w-0 flex-1 truncate">{c.name}</span>
                <span className="text-xs text-fg-muted">{c.result}</span>
              </li>
            ))}
            <span aria-hidden className="sdsq-scan" />
          </ul>
        </div>

        {/* Caught by a person */}
        <div className="aj-card sdsq-note" style={{ "--z": "80px", "--i": 1 } as CSSProperties}>
          <span className="cv-avatar sdsq-avatar">
            <UserRound className="size-3.5" />
          </span>
          <span className="min-w-0">
            <span className="block text-sm font-semibold">1 issue caught in review</span>
            <span className="block text-xs text-fg-muted">Fixed before release</span>
          </span>
        </div>
      </div>
    </div>
  );
}
