"use client";

import { type CSSProperties, useRef } from "react";
import { Check, CodeXml, GitMerge, LayoutDashboard, Package, Users } from "lucide-react";
import { useTilt } from "@/components/about/use-tilt";

const bars = [42, 64, 50, 78, 58, 88, 70];

/**
 * Software Development hero: one product shipped to web and mobile. A browser window with a
 * web dashboard sits behind, the same app on a phone stands in front of its right edge, and a
 * "merged after review" note hangs off the browser's left side. One glossy tile.
 * Tilts with the mouse. Styles: .aj-* (shared) and .sdsw-* in globals.css.
 */
export function SoftwareHeroVisual() {
  const ref = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<HTMLDivElement>(null);
  useTilt(ref, sceneRef);

  return (
    <div
      ref={ref}
      className="aj sdsw"
      role="img"
      aria-label="One product built for web and mobile: a web dashboard in a browser and the same app on a phone, released after an engineer's review"
    >
      <div ref={sceneRef} className="aj-scene">
        <span aria-hidden className="aj-glow aj-glow-a" />
        <span aria-hidden className="aj-glow aj-glow-b" />

        {/* Browser with the web app */}
        <div className="aj-card sdsw-web" style={{ "--z": "-30px", "--i": 0 } as CSSProperties}>
          <div className="sdsw-bar">
            <span className="sdsw-dots" aria-hidden>
              <span />
              <span />
              <span />
            </span>
            <span className="sdsw-url">app.yourcompany.com</span>
          </div>
          <div className="sdsw-app">
            <span className="sdsw-side" aria-hidden>
              <span className="sdsw-side-on">
                <LayoutDashboard className="size-3.5" />
              </span>
              <span>
                <Package className="size-3.5" />
              </span>
              <span>
                <Users className="size-3.5" />
              </span>
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-semibold">Orders this week</span>
              <span className="mt-0.5 flex items-baseline gap-2">
                <span className="text-2xl font-semibold">1,284</span>
                <span className="text-xs font-semibold text-success">+12%</span>
              </span>
              <span className="sdsw-chart" aria-hidden>
                {bars.map((h, i) => (
                  <span key={i} style={{ height: `${h}%`, "--i": i } as CSSProperties} />
                ))}
              </span>
              <span className="mt-3 grid grid-cols-2 gap-2">
                <span className="sdsw-stat">
                  <span className="text-xs text-fg-muted">Shipped</span>
                  <span className="block font-semibold">96%</span>
                </span>
                <span className="sdsw-stat">
                  <span className="text-xs text-fg-muted">Open tickets</span>
                  <span className="block font-semibold">14</span>
                </span>
              </span>
            </span>
          </div>
        </div>

        {/* The same app on a phone */}
        <div className="sdsw-phone" style={{ "--z": "60px", "--i": 1 } as CSSProperties}>
          <span className="sdsw-notch" aria-hidden />
          <span className="block text-xs text-fg-muted">Good morning</span>
          <span className="block text-sm font-semibold">Today&apos;s orders</span>
          <span className="mt-2 block text-xl font-semibold">186</span>
          <span className="mt-2 block space-y-1.5">
            {["#1042 Packed", "#1041 Shipped", "#1040 Delivered"].map((o, i) => (
              <span key={o} className="sdsw-row">
                <span className="sdsw-row-dot" data-i={i} />
                {o}
              </span>
            ))}
          </span>
          <span className="sdsw-cta">View all</span>
        </div>

        {/* Merged after review */}
        <div className="aj-card sdsw-merge" style={{ "--z": "40px", "--i": 2 } as CSSProperties}>
          <span className="sdsw-merge-icon">
            <GitMerge className="size-4" />
          </span>
          <span className="min-w-0">
            <span className="block text-sm font-semibold">Release 2.4 merged</span>
            <span className="flex items-center gap-1 text-xs text-fg-muted">
              <Check aria-hidden className="size-3 text-success" strokeWidth={3} /> Reviewed by an engineer
            </span>
          </span>
        </div>

        <span
          aria-hidden
          className="aj-tile sdsw-tile"
          data-tone="human"
          style={{ "--x": "0%", "--y": "0%", "--z": "110px", "--i": 1 } as CSSProperties}
        >
          <CodeXml className="size-[48%]" strokeWidth={1.8} />
        </span>
      </div>
    </div>
  );
}
