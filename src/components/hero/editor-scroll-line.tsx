"use client";

import { useEffect, useRef, useState } from "react";

type CardBridgeSegment = {
  id: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  d: string;
  cardIndex: number;
};

/**
 * Builds a signature sweeping circuit S-curve between two points (x1, y1) and (x2, y2).
 * Even when x1 and x2 are close or vertically aligned, it introduces a lateral bow curve
 * to ensure EVERY section transition has the exact same dramatic, fluid, architectural curve
 * as the initial editor-to-card transition, completely avoiding straight vertical lines.
 */
function buildDramaticCurve(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  parentWidth: number,
): string {
  const h = y2 - y1;
  const dx = x2 - x1;

  // If there is already a large horizontal offset (e.g. Editor scene to Card 0):
  if (Math.abs(dx) >= 42) {
    const midY = Math.round(y1 + h * 0.5);
    return `M ${x1} ${y1} V ${Math.round(y1 + 18)} C ${x1} ${midY}, ${x2} ${midY}, ${x2} ${Math.round(y2 - 18)} V ${y2}`;
  }

  // Between vertically aligned cards: arch outward to the right flank in a dramatic sweeping curve
  const maxX = parentWidth - 20;
  const xPeak = Math.min(maxX, Math.round(Math.max(x1, x2) + 52));
  const cp1Y = Math.round(y1 + h * 0.24);
  const midY = Math.round(y1 + h * 0.5);
  const cp2Y = Math.round(y1 + h * 0.76);

  return `M ${x1} ${y1} C ${x1} ${cp1Y}, ${xPeak} ${Math.round(y1 + h * 0.2)}, ${xPeak} ${midY} C ${xPeak} ${Math.round(y1 + h * 0.8)}, ${x2} ${cp2Y}, ${x2} ${y2}`;
}

/**
 * Homepage Continuous Vertical Scroll Relay Spine:
 * - Direct architectural continuation of the Hero Showcase circuit lines.
 * - Emerges below the Editor section under Step 04 ("Tested solution") with a sweeping S-curve.
 * - Enters each section's card with an authentic Hero-style junction node and disappears inside the card.
 * - Re-emerges at the bottom edge of the card and arches in a dramatic curved sweep to the next card.
 * - Completely avoids text on the left, curving outward along the flank.
 * - Features scroll-driven progressive drawing, leading pulse tip, ambient glow, and animated energy packets.
 */
export function EditorScrollLine() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const pathRefs = useRef<(SVGPathElement | null)[]>([]);
  const glowRefs = useRef<(SVGPathElement | null)[]>([]);
  const originNodeRefs = useRef<(SVGCircleElement | null)[]>([]);
  const dockNodeRefs = useRef<(SVGGElement | null)[]>([]);
  const tipGroupRef = useRef<SVGGElement | null>(null);

  const [svgSize, setSvgSize] = useState<{ width: number; height: number }>({
    width: 1400,
    height: 3800,
  });
  const [segments, setSegments] = useState<CardBridgeSegment[]>([]);
  const segmentsRef = useRef<CardBridgeSegment[]>([]);
  const cardBoundsRef = useRef<{ top: number; bottom: number }[]>([]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const parent = container.parentElement;
    if (!parent) return;

    const measure = () => {
      const parentRect = parent.getBoundingClientRect();
      const parentW = Math.max(800, Math.round(parentRect.width));
      const parentH = Math.max(600, Math.round(parentRect.height));
      setSvgSize({ width: parentW, height: parentH });

      const originEl = parent.querySelector<HTMLElement>(
        "[data-editor-scroll-origin]",
      );
      const cardEls = Array.from(
        parent.querySelectorAll<HTMLElement>("[data-scroll-line-card]"),
      );

      // Measure card elements accurately relative to parent
      const cards = cardEls
        .map((el) => {
          const r = el.getBoundingClientRect();
          return {
            top: Math.round(r.top - parentRect.top),
            bottom: Math.round(r.bottom - parentRect.top),
            left: Math.round(r.left - parentRect.left),
            right: Math.round(r.right - parentRect.left),
            width: Math.round(r.width),
          };
        })
        .filter((c) => c.bottom > c.top + 20)
        .sort((a, b) => a.top - b.top);

      cardBoundsRef.current = cards.map((c) => ({
        top: c.top,
        bottom: c.bottom,
      }));

      // Determine initial origin under the 4th step of the editor scene
      let originX = parentW - 120;
      let originY = 460;
      if (originEl) {
        const oRect = originEl.getBoundingClientRect();
        originX = Math.round(oRect.left - parentRect.left + oRect.width * 0.5);
        originY = Math.round(oRect.top - parentRect.top);
      } else if (cards.length > 0) {
        originX = Math.round(cards[0].right - 64);
        originY = Math.max(200, cards[0].top - 160);
      }

      const nextSegments: CardBridgeSegment[] = [];
      let currentX = originX;
      let currentY = originY;

      cards.forEach((card, idx) => {
        // Vary docking position slightly across cards for natural organic circuit alignment
        const dockX = Math.round(card.right - (idx % 2 === 0 ? 40 : 54));
        const dockY = card.top;

        if (dockY - currentY >= 24) {
          const d = buildDramaticCurve(currentX, currentY, dockX, dockY, parentW);

          nextSegments.push({
            id: `seg-in-${idx}`,
            x1: currentX,
            y1: currentY,
            x2: dockX,
            y2: dockY,
            d,
            cardIndex: idx,
          });
        }

        // Re-emerges from the bottom edge of the card at an intentional release point
        const exitX = Math.round(card.right - (idx % 2 === 0 ? 28 : 36));
        currentX = exitX;
        currentY = card.bottom;
      });

      // Final segment below the last card towards the CTA
      if (cards.length > 0) {
        const finalY = parentH - 24;
        if (finalY - currentY >= 32) {
          const finalDockX = Math.round(currentX - 32);
          const d = buildDramaticCurve(currentX, currentY, finalDockX, finalY, parentW);
          nextSegments.push({
            id: `seg-final`,
            x1: currentX,
            y1: currentY,
            x2: finalDockX,
            y2: finalY,
            d,
            cardIndex: cards.length,
          });
        }
      }

      segmentsRef.current = nextSegments;
      setSegments(nextSegments);
    };

    measure();

    const ro = new ResizeObserver(() => measure());
    ro.observe(parent);
    window.addEventListener("resize", measure, { passive: true });

    let rafId = 0;
    let targetY = 0;
    let currentY = 0;
    let initialized = false;

    const tick = () => {
      rafId = 0;
      const parentRect = parent.getBoundingClientRect();
      const segs = segmentsRef.current;
      const firstY = segs.length > 0 ? segs[0].y1 : 0;

      // Scroll trigger line tracking ~74% down viewport
      const triggerScreenY = window.innerHeight * 0.74;
      const rawTarget = triggerScreenY - parentRect.top;
      targetY =
        rawTarget < firstY
          ? firstY
          : Math.min(parentRect.height, Math.max(firstY, rawTarget));

      if (!initialized) {
        currentY = targetY;
        initialized = true;
      } else {
        currentY += (targetY - currentY) * 0.22;
        if (Math.abs(targetY - currentY) < 0.3) {
          currentY = targetY;
        }
      }

      let activeTipPoint: { x: number; y: number } | null = null;
      const cards = cardBoundsRef.current;

      // Check if scroll is currently inside any card
      const insideAnyCard = cards.some(
        (c) => currentY >= c.top && currentY < c.bottom,
      );

      for (let i = 0; i < segs.length; i++) {
        const seg = segs[i];
        const path = pathRefs.current[i];
        const glow = glowRefs.current[i];
        const originNode = originNodeRefs.current[i];
        const dockNode = dockNodeRefs.current[i];

        if (currentY <= seg.y1 + 2) {
          // Segment not yet reached
          if (path) {
            path.style.strokeDashoffset = "1";
            path.style.opacity = "0.15";
          }
          if (glow) {
            glow.style.strokeDashoffset = "1";
            glow.style.opacity = "0";
          }
          if (originNode) originNode.style.opacity = "0";
          if (dockNode) dockNode.style.opacity = "0";
        } else if (currentY < seg.y2) {
          // Segment actively drawing as user scrolls
          const progress = Math.max(
            0,
            Math.min(1, (currentY - seg.y1) / (seg.y2 - seg.y1)),
          );
          const offset = (1 - progress).toFixed(4);

          if (path) {
            path.style.strokeDashoffset = offset;
            path.style.opacity = "1";
          }
          if (glow) {
            glow.style.strokeDashoffset = offset;
            glow.style.opacity = "1";
          }
          if (originNode) originNode.style.opacity = "1";
          if (dockNode) dockNode.style.opacity = "0";

          if (path && !insideAnyCard) {
            const totalLen = path.getTotalLength();
            const pt = path.getPointAtLength(progress * totalLen);
            activeTipPoint = { x: pt.x, y: pt.y };
          }
        } else {
          // Segment fully drawn and docked into the card
          if (path) {
            path.style.strokeDashoffset = "0";
            path.style.opacity = "1";
          }
          if (glow) {
            glow.style.strokeDashoffset = "0";
            glow.style.opacity = "1";
          }
          if (originNode) originNode.style.opacity = "1";
          if (dockNode) dockNode.style.opacity = "1";
        }
      }

      // Traveling glowing pulse node
      if (tipGroupRef.current) {
        if (activeTipPoint && !insideAnyCard) {
          tipGroupRef.current.style.opacity = "1";
          tipGroupRef.current.setAttribute(
            "transform",
            `translate(${activeTipPoint.x.toFixed(1)}, ${activeTipPoint.y.toFixed(1)})`,
          );
        } else {
          // Disappears when inside a card
          tipGroupRef.current.style.opacity = "0";
        }
      }

      if (Math.abs(targetY - currentY) >= 0.3) {
        rafId = requestAnimationFrame(tick);
      }
    };

    const scheduleTick = () => {
      if (!rafId) {
        rafId = requestAnimationFrame(tick);
      }
    };

    scheduleTick();
    window.addEventListener("scroll", scheduleTick, { passive: true });

    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", scheduleTick);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [segments.length]);

  return (
    <div
      ref={containerRef}
      aria-hidden
      className="pointer-events-none absolute inset-0 z-[2] hidden size-full overflow-hidden select-none md:block"
    >
      <svg
        viewBox={`0 0 ${svgSize.width} ${svgSize.height}`}
        width={svgSize.width}
        height={svgSize.height}
        fill="none"
        className="block size-full overflow-visible"
      >
        {segments.map((seg, i) => (
          <g key={seg.id}>
            {/* Ambient orange glow behind active line */}
            <path
              ref={(el) => {
                glowRefs.current[i] = el;
              }}
              d={seg.d}
              pathLength={1}
              style={{
                strokeDasharray: "1",
                strokeDashoffset: "1",
                filter: "blur(3px)",
                transition: "opacity 200ms ease",
              }}
              className="stroke-brand-400/25"
              strokeWidth={4.5}
              strokeLinecap="round"
            />

            {/* Crisp brand orange relay line matching Hero Showcase */}
            <path
              ref={(el) => {
                pathRefs.current[i] = el;
              }}
              d={seg.d}
              pathLength={1}
              style={{
                strokeDasharray: "1",
                strokeDashoffset: "1",
                transition: "opacity 200ms ease",
              }}
              className="stroke-brand-400/85"
              strokeWidth={1.5}
              strokeLinecap="round"
            />

            {/* Continuous animated energy packet moving along drawn path (Hero Showcase signature) */}
            <circle r={2.8} className="fill-brand-400">
              <animateMotion
                dur="2.5s"
                begin={`${i * 0.4}s`}
                repeatCount="indefinite"
                path={seg.d}
              />
            </circle>

            {/* Origin hollow ring node (at bottom of previous card / editor) */}
            <circle
              ref={(el) => {
                originNodeRefs.current[i] = el;
              }}
              cx={seg.x1}
              cy={seg.y1}
              r={4.5}
              style={{
                opacity: 0,
                transformOrigin: `${seg.x1}px ${seg.y1}px`,
                transition: "opacity 220ms ease",
              }}
              className="fill-ink-950 stroke-brand-400"
              strokeWidth={1.6}
            />

            {/* Docking terminal node (at top edge of card where line enters and disappears) */}
            <g
              ref={(el) => {
                dockNodeRefs.current[i] = el;
              }}
              style={{
                opacity: 0,
                transition: "opacity 220ms ease",
              }}
            >
              <circle
                cx={seg.x2}
                cy={seg.y2}
                r={4.5}
                className="fill-ink-950 stroke-brand-400"
                strokeWidth={1.6}
              />
              <circle cx={seg.x2} cy={seg.y2} r={1.8} className="fill-brand-300" />
            </g>
          </g>
        ))}

        {/* Live scroll-following pulse tip node */}
        <g
          ref={tipGroupRef}
          style={{ opacity: 0, transition: "opacity 140ms ease" }}
        >
          <circle r={8} className="fill-brand-400/25 animate-pulse" />
          <circle
            r={3.8}
            className="fill-ink-950 stroke-brand-400"
            strokeWidth={1.6}
          />
          <circle r={1.6} className="fill-brand-300" />
        </g>
      </svg>
    </div>
  );
}
