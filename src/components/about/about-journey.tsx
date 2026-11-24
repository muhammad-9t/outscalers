"use client";

import { type CSSProperties, useRef } from "react";
import { Check, CodeXml, Globe2, MapPin, Sparkles, UserRound, Users } from "lucide-react";
import { useTilt } from "./use-tilt";

/**
 * About hero visual: the company's journey as three floating glass cards (2017 freelance work,
 * 2023 Outscalers founded, today's human + AI engineering) with glossy icon tiles in front. The scene tilts in 3D with the mouse; cards sit at different depths
 * so they move with parallax. Styles: .aj-* in globals.css.
 */
export function AboutJourney({ variant = "stack" }: { variant?: "stack" | "strip" }) {
  const strip = variant === "strip";
  const ref = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<HTMLDivElement>(null);
  useTilt(ref, sceneRef, strip ? 4 : 9, strip ? 6 : 13);

  return (
    <div ref={ref} className={strip ? "aj aj-strip" : "aj"} aria-label="Our journey from 2017 to today" role="img">
      <div ref={sceneRef} className="aj-scene">
        <span aria-hidden className="aj-glow aj-glow-a" />
        <span aria-hidden className="aj-glow aj-glow-b" />

        {/* Strip layout: a rising growth line behind the three steps */}
        {strip && (
          <svg aria-hidden className="aj-rise" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path d="M14 80 C 30 76, 40 60, 55 50 S 85 12, 99 4" />
          </svg>
        )}

        {/* 2017 */}
        <div className="aj-card aj-c1" style={{ "--z": "-50px", "--i": 0 } as CSSProperties}>
          <div className="flex items-center justify-between">
            <span className="aj-year">2017</span>
            <span className="aj-icon" data-tone="data">
              <CodeXml className="size-4" />
            </span>
          </div>
          <p className="mt-2 font-semibold">Freelance software</p>
          <span className="mt-2.5 block space-y-1.5">
            {[["58%", "data"], ["80%", "muted"], ["44%", "brand"]].map(([w, t]) => (
              <span key={w} className="aj-code" data-tone={t} style={{ width: w }} />
            ))}
          </span>
        </div>

        {/* 2023 */}
        <div className="aj-card aj-c2" style={{ "--z": "0px", "--i": 1 } as CSSProperties}>
          <div className="flex items-center justify-between">
            <span className="aj-year">2023</span>
            <span className="aj-icon" data-tone="brand">
              <MapPin className="size-4" />
            </span>
          </div>
          <p className="mt-2 font-semibold">Outscalers founded</p>
          <p className="text-sm text-fg-muted">Rawalpindi, Pakistan</p>
          <div className="mt-3 flex gap-1.5">
            <span className="aj-chip">DE engineers</span>
            <span className="aj-chip">PK engineers</span>
          </div>
        </div>

        {/* Today */}
        <div className="aj-card aj-c3" style={{ "--z": "60px", "--i": 2 } as CSSProperties}>
          <div className="flex items-center justify-between">
            <span className="aj-year aj-live">Today</span>
            <span className="font-mono text-xs text-fg-subtle">human + AI</span>
          </div>
          <p className="mt-2 text-lg font-semibold">Better software, faster</p>
          <ul className="mt-3 space-y-2.5 text-sm">
            <li className="aj-row">
              <span className="aj-icon" data-tone="human">
                <UserRound className="size-4" />
              </span>
              <span className="flex-1">
                Engineer decides
                <span className="aj-bar" data-tone="human" style={{ "--w": "92%", "--i": 0 } as CSSProperties} />
              </span>
            </li>
            <li className="aj-row">
              <span className="aj-icon" data-tone="brand">
                <Sparkles className="size-4" />
              </span>
              <span className="flex-1">
                AI drafts &amp; suggests
                <span className="aj-bar" data-tone="brand" style={{ "--w": "74%", "--i": 1 } as CSSProperties} />
              </span>
            </li>
            <li className="aj-row">
              <span className="aj-icon aj-icon-solid">
                <Check className="size-4" strokeWidth={3} />
              </span>
              <span className="flex-1 font-medium">Reviewed &amp; shipped</span>
            </li>
          </ul>
        </div>

        {/* Floating tiles */}
        {(strip
          ? [
              { icon: Globe2, x: -2, y: 78, z: 110, tone: "data" },
              { icon: Users, x: 58, y: -6, z: 110, tone: "human" },
              { icon: Sparkles, x: 97, y: 70, z: 110, tone: "brand" },
            ]
          : [
              { icon: Users, x: 80, y: 2, z: 110, tone: "human" },
              { icon: Globe2, x: 0, y: 50, z: 110, tone: "data" },
              { icon: Sparkles, x: 84, y: 80, z: 110, tone: "brand" },
            ]
        ).map((t, i) => (
          <span
            key={i}
            aria-hidden
            className="aj-tile"
            data-tone={t.tone}
            style={{ "--x": `${t.x}%`, "--y": `${t.y}%`, "--z": `${t.z}px`, "--i": i } as CSSProperties}
          >
            <t.icon className="size-[48%]" strokeWidth={1.8} />
          </span>
        ))}
      </div>
    </div>
  );
}
