"use client";

import { useId, useRef } from "react";
import { cn } from "@/lib/cn";

/**
 * Plays the 3-step Outscalers mark assembly animation using the Web Animations API:
 *   1. The "S" wave appears and sweeps in first
 *   2. The "O" gradient ring spins & pops in second
 *   3. The cursor arrow darts in third and clicks the "O"
 */
function playLogoAnimation(root: ParentNode | null) {
  if (!root) return;
  const s = root.querySelector<SVGElement>("[data-logo-s]");
  const o = root.querySelector<SVGElement>("[data-logo-o]");
  const arrow = root.querySelector<SVGElement>("[data-logo-arrow]");
  if (!s || !o || !arrow) return;

  const duration = 920;
  const easing = "cubic-bezier(0.22, 1, 0.36, 1)";

  // 1. "S" appears first (0% -> 36%)
  s.getAnimations().forEach((a) => a.cancel());
  s.animate(
    [
      { opacity: 0, transform: "translate(-42px, 28px) scale(0.65) rotate(-10deg)", offset: 0 },
      { opacity: 1, transform: "translate(5px, -6px) scale(1.06) rotate(2deg)", offset: 0.3 },
      { opacity: 1, transform: "translate(0px, 0px) scale(1) rotate(0deg)", offset: 0.44 },
      { opacity: 1, transform: "translate(0px, 0px) scale(1) rotate(0deg)", offset: 1 },
    ],
    { duration, easing, fill: "both" },
  );

  // 2. "O" appears second (28% -> 68%), then reacts slightly when the arrow clicks in at 82%
  o.getAnimations().forEach((a) => a.cancel());
  o.animate(
    [
      { opacity: 0, transform: "translate(0px, 46px) scale(0.18) rotate(-80deg)", offset: 0 },
      { opacity: 0, transform: "translate(0px, 46px) scale(0.18) rotate(-80deg)", offset: 0.28 },
      { opacity: 1, transform: "translate(0px, -10px) scale(1.09) rotate(5deg)", offset: 0.58 },
      { opacity: 1, transform: "translate(0px, 0px) scale(1) rotate(0deg)", offset: 0.72 },
      { opacity: 1, transform: "translate(-7px, -5px) scale(1.045) rotate(-2deg)", offset: 0.82 },
      { opacity: 1, transform: "translate(0px, 0px) scale(1) rotate(0deg)", offset: 1 },
    ],
    { duration, easing, fill: "both" },
  );

  // 3. Arrow appears third (58% -> 100%), darting in from bottom-right to click the "O"
  arrow.getAnimations().forEach((a) => a.cancel());
  arrow.animate(
    [
      { opacity: 0, transform: "translate(85px, 65px) scale(0.2) rotate(18deg)", offset: 0 },
      { opacity: 0, transform: "translate(85px, 65px) scale(0.2) rotate(18deg)", offset: 0.58 },
      { opacity: 1, transform: "translate(-16px, -11px) scale(1.24) rotate(-4deg)", offset: 0.8 },
      { opacity: 1, transform: "translate(4px, 3px) scale(0.95) rotate(1deg)", offset: 0.91 },
      { opacity: 1, transform: "translate(0px, 0px) scale(1) rotate(0deg)", offset: 1 },
    ],
    { duration, easing, fill: "both" },
  );
}

/** Brand mark: the Outscalers "O" (gradient) over the "S" swoosh and arrow. */
/** `bare` drops the rounded tile, leaving just the mark (e.g. on the back of a device).
 *  `tight` (with bare) crops the box to the mark itself, so it fills its height (header and footer logo). */
export function LogoMark({
  className,
  bare,
  tight,
  interactive = true,
}: {
  className?: string;
  bare?: boolean;
  tight?: boolean;
  interactive?: boolean;
}) {
  const svgRef = useRef<SVGSVGElement>(null);
  const gradientId = `logo-grad-${useId().replace(/[^a-zA-Z0-9]/g, "")}`;

  return (
    <svg
      ref={svgRef}
      viewBox={bare && tight ? "6.5 4 19 24" : "0 0 32 32"}
      className={cn("logo-mark overflow-visible", bare && tight ? "h-8 w-auto" : "size-8", className)}
      aria-hidden
      focusable="false"
      onPointerEnter={interactive ? () => playLogoAnimation(svgRef.current) : undefined}
    >
      {!bare && <rect x="0.5" y="0.5" width="31" height="31" rx="9" className="fill-logo-tile stroke-logo-tile-line" />}
      <svg x="6.5" y="4" width="19" height="24" viewBox="150 235 295 375" overflow="visible">
        <defs>
          <linearGradient id={gradientId} x1="165.76" y1="373.45" x2="428.34" y2="373.45" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#f47621" />
            <stop offset="1" stopColor="#fbab21" />
          </linearGradient>
        </defs>
        {/* 1. "S" swoosh wave */}
        <path
          data-logo-s
          style={{ transformBox: "fill-box", transformOrigin: "center" }}
          className="fill-logo-mark"
          d="M428.64,543.12c-2.93-21.21-13.7-38.31-32.3-51.29-18.61-12.99-39.33-17.9-62.15-14.75-18.92,2.61-37.15,10.28-54.68,23-11.07,7.98-18.38,12.21-21.93,12.7-5.44.75-10.24-.6-14.39-4.04-4.15-3.44-6.63-8.11-7.45-13.99-.18-1.32-.22-2.72-.11-4.19.52-6.95-5.93-12.46-13.27-11.45l-44.71,6.18c-4.91.68-8.92,4.16-9.99,8.73-2.05,8.74-2.49,17.33-1.33,25.76,3.13,22.65,13.94,40.7,32.43,54.16,18.49,13.46,39.5,18.56,63.04,15.31,16.08-2.22,32.11-9.19,48.1-20.9l8.87-6.49c6.9-5.03,12.77-7.87,17.62-8.54,5.68-.78,10.78.38,15.31,3.49,4.53,3.11,7.14,7.22,7.85,12.32,0,.03,0,.05.01.08.81,6.17,6.66,10.54,13.23,9.63l45.91-6.34c5.39-.74,9.64-4.86,10.2-9.95.71-6.5.63-12.98-.26-19.42Z"
        />
        {/* 2. "O" ring */}
        <path
          data-logo-o
          style={{ transformBox: "fill-box", transformOrigin: "center" }}
          fill={`url(#${gradientId})`}
          d="M389.86,287.65c-25.65-25.65-56.62-38.48-92.9-38.48s-67.67,12.92-93.08,38.75c-25.41,25.84-38.12,57.45-38.12,94.83,0,32.61,10.93,60.96,32.78,85.03l30.13-4.16c6.89-.95,13,4.61,12.57,11.55-.09,1.46-.05,2.86.14,4.18.81,5.88,3.18,10.56,7.11,14.04,3.93,3.47,8.45,4.86,13.56,4.15,3.33-.46,10.16-4.63,20.5-12.51,16.37-12.55,33.44-20.06,51.2-22.51,19.92-2.75,38.18,1.44,54.78,12.59.51-.49,1.01-.98,1.51-1.48,4.53-4.53,8.65-9.21,12.36-14.08l-32.22-21.27c-3.3-2.17-3.03-7.11.49-8.91l49.48-25.28c2.22-1.13,4.46-1.05,6.32-.2.8-4.82,1.34-9.76,1.62-14.81.17-2.81.25-5.65.25-8.53,0-36.28-12.83-67.25-38.48-92.9ZM337.73,419.67c-11.18,10.69-24.77,16.03-40.77,16.03s-29.59-5.34-40.77-16.03-16.77-23.73-16.77-39.12,5.62-28.28,16.86-39.03,24.8-16.13,40.68-16.13,29.44,5.41,40.68,16.22,16.86,23.79,16.86,38.94-5.59,28.43-16.77,39.12Z"
        />
        {/* 3. Cursor arrow */}
        <path
          data-logo-arrow
          style={{ transformBox: "fill-box", transformOrigin: "20% 35%" }}
          className="fill-logo-mark"
          d="M421.38,410.92l-44.42,22.69c-.67.34-.73,1.29-.09,1.7l40.82,26.94c4.64,3.06,10.38-1.9,8.01-6.93l-8.18-17.42c-.79-1.69-.68-3.67.31-5.25l9.51-15.25c2.45-3.93-1.83-8.6-5.96-6.49Z"
        />
      </svg>
    </svg>
  );
}

export function Logo({ className }: { className?: string }) {
  const rootRef = useRef<HTMLSpanElement>(null);
  return (
    <span
      ref={rootRef}
      onPointerEnter={() => playLogoAnimation(rootRef.current)}
      className={cn("inline-flex items-center gap-2.5", className)}
    >
      <LogoMark bare tight interactive={false} className="h-9 w-7" />
      <span className="flex flex-col leading-none">
        <span className="font-display text-[1.1rem] font-semibold tracking-tight text-fg">Outscalers</span>
        <span className="mt-1 font-mono text-[9.5px] uppercase tracking-[0.14em] text-brand-300/90">
          Human + AI Engineering
        </span>
      </span>
    </span>
  );
}
