"use client";

import { type CSSProperties, useEffect, useRef, useState } from "react";

type Side = "t" | "b" | "l" | "r";
export type FlowLink = { from: string; to: string; a: Side; b: Side; ai?: boolean; label?: string };
type Drawn = { d: string; ai?: boolean; label?: string; lx: number; ly: number; x1: number; y1: number; x2: number; y2: number };

/** Anchor point on a node's edge, in its offset parent's coordinates (transforms ignored) */
function anchor(el: HTMLElement, s: Side): [number, number] {
  const x = el.offsetLeft, y = el.offsetTop, w = el.offsetWidth, h = el.offsetHeight;
  return s === "t" ? [x + w / 2, y] : s === "b" ? [x + w / 2, y + h] : s === "l" ? [x, y + h / 2] : [x + w, y + h / 2];
}

/** Outward direction of each side */
const out1 = (s: Side): [number, number] => (s === "t" ? [0, -1] : s === "b" ? [0, 1] : s === "l" ? [-1, 0] : [1, 0]);

/** Rounded elbow: vertical, across, vertical (vFirst) or horizontal, down, horizontal */
function elbow(x1: number, y1: number, x2: number, y2: number, vFirst: boolean) {
  const dx = x2 - x1, dy = y2 - y1;
  if (Math.abs(vFirst ? dx : dy) < 1) return { d: `M${x1} ${y1}L${x2} ${y2}`, lx: (x1 + x2) / 2, ly: (y1 + y2) / 2 };
  const sx = Math.sign(dx), sy = Math.sign(dy);
  const r = Math.min(14, Math.abs(dx) / 2, Math.abs(dy) / 2);
  if (vFirst) {
    const my = (y1 + y2) / 2;
    return {
      d: `M${x1} ${y1}V${my - r * sy}Q${x1} ${my} ${x1 + r * sx} ${my}H${x2 - r * sx}Q${x2} ${my} ${x2} ${my + r * sy}V${y2}`,
      lx: (x1 + x2) / 2,
      ly: my,
    };
  }
  const mx = (x1 + x2) / 2;
  return {
    d: `M${x1} ${y1}H${mx - r * sx}Q${mx} ${y1} ${mx} ${y1 + r * sy}V${y2 - r * sy}Q${mx} ${y2} ${mx + r * sx} ${y2}H${x2}`,
    lx: mx,
    ly: (y1 + y2) / 2,
  };
}

/**
 * Draws the connectors between [data-flow] nodes of the parent element as one SVG, and
 * re-measures whenever the layout changes. Large screens only (the phone layout uses CSS lines).
 */
export function FlowLinks({ links }: { links: FlowLink[] }) {
  const ref = useRef<SVGSVGElement>(null);
  const [drawn, setDrawn] = useState<Drawn[]>([]);

  useEffect(() => {
    const svg = ref.current;
    const box = svg?.parentElement;
    if (!svg || !box) return;
    const draw = () => {
      if (getComputedStyle(svg).display === "none") return setDrawn([]);
      const get = (id: string) => box.querySelector<HTMLElement>(`[data-flow="${id}"]`);
      const out: Drawn[] = [];
      for (const l of links) {
        const A = get(l.from), B = get(l.to);
        if (!A || !B) continue;
        const [x1, y1] = anchor(A, l.a), [x2, y2] = anchor(B, l.b);
        if (l.ai) {
          // Smooth curve leaving and entering along each side's normal; label sits at its midpoint
          const [ax, ay] = out1(l.a), [bx, by] = out1(l.b);
          const c1x = x1 + ax * 90, c1y = y1 + ay * 90, c2x = x2 + bx * 90, c2y = y2 + by * 90;
          out.push({
            d: `M${x1} ${y1}C${c1x} ${c1y} ${c2x} ${c2y} ${x2} ${y2}`,
            ai: true,
            label: l.label,
            lx: (x1 + 3 * c1x + 3 * c2x + x2) / 8,
            ly: (y1 + 3 * c1y + 3 * c2y + y2) / 8,
            x1, y1, x2, y2,
          });
        } else {
          const e = elbow(x1, y1, x2, y2, l.a === "b" || l.a === "t");
          out.push({ ...e, label: l.label, x1, y1, x2, y2 });
        }
      }
      setDrawn(out);
    };
    draw();
    const ro = new ResizeObserver(draw);
    ro.observe(box);
    box.querySelectorAll("[data-flow]").forEach((n) => ro.observe(n));
    document.fonts?.ready.then(draw);
    return () => ro.disconnect();
  }, [links]);

  return (
    <>
      <svg ref={ref} aria-hidden className="flow-svg pointer-events-none absolute inset-0 hidden size-full overflow-visible lg:block">
        <defs>
          <marker id="flow-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M1 1L9 5L1 9" className="flow-arrow" />
          </marker>
        </defs>
        {drawn.map((p, i) => (
          <g key={i} style={{ "--k": i } as CSSProperties}>
            <path d={p.d} pathLength={p.ai ? undefined : 1} className={p.ai ? "flow-path flow-path-ai" : "flow-path"} markerEnd={p.ai ? "url(#flow-arrow)" : undefined} />
            <circle cx={p.x1} cy={p.y1} r={3} className="flow-dot-start" />
            {!p.ai && <circle cx={p.x2} cy={p.y2} r={4} className="flow-dot-end" />}
          </g>
        ))}
      </svg>
      {drawn.map((p, i) =>
        p.label ? (
          <span
            key={i}
            aria-hidden
            className={p.ai ? "flow-label flow-label-ai" : "flow-label"}
            style={{ left: p.lx, top: p.ly, "--k": i } as CSSProperties}
          >
            {p.label}
          </span>
        ) : null,
      )}
    </>
  );
}
