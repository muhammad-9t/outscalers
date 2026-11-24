"use client";

import { useEffect, useRef, type RefObject } from "react";

/** A point on the viewport, in CSS pixels (the 3D laptop's centre). */
export type FocusPoint = { x: number; y: number };

/**
 * One soft glow behind the portfolio showcase that follows the 3D laptop. It is a single
 * pre-rendered gradient moved with a compositor-only transform: nothing is repainted, and the
 * loop writes a style only when the laptop has actually moved. Replaces the old canvas tunnel.
 */
export function FocusGlow({
  focusRef,
  active,
  reducedMotion,
}: {
  focusRef: RefObject<FocusPoint | null>;
  active: boolean;
  reducedMotion: boolean;
}) {
  const glow = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = glow.current;
    if (!el || !active) return;
    const pos = { x: NaN, y: NaN };
    let raf = 0;

    const tick = () => {
      raf = requestAnimationFrame(tick);
      const t = focusRef.current ?? { x: window.innerWidth * 0.72, y: window.innerHeight * 0.5 };
      if (Number.isNaN(pos.x) || reducedMotion) {
        pos.x = t.x;
        pos.y = t.y;
      } else {
        pos.x += (t.x - pos.x) * 0.2;
        pos.y += (t.y - pos.y) * 0.2;
      }
      const tf = `translate3d(${pos.x.toFixed(1)}px, ${pos.y.toFixed(1)}px, 0)`;
      if (el.style.transform !== tf) el.style.transform = tf;
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active, reducedMotion, focusRef]);

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <div ref={glow} className="focus-glow" />
    </div>
  );
}
