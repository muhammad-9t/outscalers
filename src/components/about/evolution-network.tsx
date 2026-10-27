"use client";

import { useEffect, useId, useRef, type RefObject } from "react";

/* ------------------------------------------------------------------
   A network that grows with the company's story. Five layouts, one per
   chapter, and the drawing morphs between them for any fractional stage:
     0  2017      one developer, linked to clients around the world
     1  2020      people scattered apart, collaborating remotely
     2  2021–22   the nodes gather into a team
     3  2023      the team forms a ring around the Outscalers core
     4  Today     AI nodes (orange) join and pair with each person (blue)
   Attributes are written straight to the SVG each frame, not via React
   state, and the loop only runs while the drawing is on screen.
   ------------------------------------------------------------------ */

const PEOPLE = 8;
const CLIENTS = 8;
const LAST = 4;

type Node = { x: number; y: number; r: number; o: number };

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const smooth = (t: number) => t * t * (3 - 2 * t);
const polar = (radius: number, angle: number) => ({ x: radius * Math.cos(angle), y: radius * Math.sin(angle) });

const REMOTE = [
  [-125, -60],
  [115, -95],
  [-70, 115],
  [135, 70],
  [5, -10],
];
const CLUSTER = Array.from({ length: PEOPLE }, (_, k) => polar(k === 0 ? 0 : 27 * Math.sqrt(k), k * 2.4));

/** Person k at a whole stage; θ is the slow rotation of the ring (stages 3+). */
function person(k: number, s: number, θ: number): Node {
  if (s === 0) return k === 0 ? { x: 0, y: 0, r: 8, o: 1 } : { x: 0, y: 0, r: 0, o: 0 };
  // The people who join later wait, hidden, on the last remote node so they grow out of it
  if (s === 1) return k < REMOTE.length ? { x: REMOTE[k][0], y: REMOTE[k][1], r: 6.5, o: 1 } : { x: 5, y: -10, r: 0, o: 0 };
  if (s === 2) return { ...CLUSTER[k], r: 6, o: 1 };
  return { ...polar(92, (k * Math.PI) / 4 + θ), r: 6, o: 1 };
}
/** AI node k: hidden on its person until the last stage, then just outside the ring. */
function aiNode(k: number, s: number, θ: number): Node {
  if (s < LAST) return { ...person(k, s, θ), r: 0, o: 0 };
  return { ...polar(140, (k * Math.PI) / 4 + θ + 0.24), r: 5, o: 1 };
}
const clientOpacity = [0.9, 0.75, 0.65, 0.55, 0.5];
function client(k: number, s: number): Node {
  return { ...polar(172, (k * Math.PI) / 4 + Math.PI / 8), r: 4, o: clientOpacity[s] };
}

// How strongly each kind of link shows at each stage
const W_CLIENT = [0.55, 0.35, 0.28, 0.22, 0.18];
const W_MESH = [0, 0.5, 0.55, 0.6, 0.45];
const W_SPOKE = [0, 0, 0.3, 0.35, 0.3];
const W_PAIR = [0, 0, 0, 0, 0.9];

function mix(a: Node, b: Node, f: number): Node {
  return { x: lerp(a.x, b.x, f), y: lerp(a.y, b.y, f), r: lerp(a.r, b.r, f), o: lerp(a.o, b.o, f) };
}

type Props = {
  /** Live stage (0 … 4, fractional), e.g. driven by scroll. */
  progressRef?: RefObject<number>;
  /** Or a fixed stage: the drawing animates from `startStage` to it when it scrolls into view. */
  stage?: number;
  startStage?: number;
  className?: string;
};

export function EvolutionNetwork({ progressRef, stage = 0, startStage = stage, className }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const glowId = `evolution-glow-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const q = <T extends Element>(sel: string) => Array.from(svg.querySelectorAll<T>(sel));
    const people = q<SVGCircleElement>("[data-person]");
    const ais = q<SVGCircleElement>("[data-ai]");
    const clients = q<SVGRectElement>("[data-client]");
    const clientLinks = q<SVGLineElement>("[data-client-link]");
    const mesh = q<SVGLineElement>("[data-mesh]");
    const spokes = q<SVGLineElement>("[data-spoke]");
    const pairs = q<SVGLineElement>("[data-pair]");
    const core = svg.querySelector<SVGGElement>("[data-core]");
    const glow = svg.querySelector<SVGCircleElement>("[data-glow]");

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let inView = false;
    let current = progressRef?.current ?? startStage;
    const start = performance.now();
    let raf = 0;

    const set = (el: Element, attrs: Record<string, number>) => {
      for (const k in attrs) el.setAttribute(k, attrs[k].toFixed(2));
    };
    const line = (el: SVGLineElement, a: Node, b: Node, weight: number, opacity?: number) => {
      set(el, { x1: a.x, y1: a.y, x2: b.x, y2: b.y, opacity: (opacity ?? Math.min(a.o, b.o)) * weight });
    };

    const render = (p: number, θ: number) => {
      const s0 = Math.floor(clamp(p, 0, LAST));
      const s1 = Math.min(s0 + 1, LAST);
      const f = smooth(clamp(p - s0, 0, 1));
      const w = (table: number[]) => lerp(table[s0], table[s1], f);
      const P = Array.from({ length: PEOPLE }, (_, k) => mix(person(k, s0, θ), person(k, s1, θ), f));
      const A = Array.from({ length: PEOPLE }, (_, k) => mix(aiNode(k, s0, θ), aiNode(k, s1, θ), f));
      const C = Array.from({ length: CLIENTS }, (_, k) => mix(client(k, s0), client(k, s1), f));
      const centre: Node = { x: 0, y: 0, r: 0, o: 1 };

      P.forEach((n, k) => set(people[k], { cx: n.x, cy: n.y, r: n.r, opacity: n.o }));
      A.forEach((n, k) => set(ais[k], { cx: n.x, cy: n.y, r: n.r, opacity: n.o }));
      C.forEach((n, k) => set(clients[k], { x: n.x - n.r, y: n.y - n.r, width: n.r * 2, height: n.r * 2, opacity: n.o }));
      // Client links follow the clients' visibility: in 2017 they all start from the one developer
      C.forEach((c, k) => line(clientLinks[k], P[k], c, w(W_CLIENT), c.o));
      P.forEach((n, k) => line(mesh[k], n, P[(k + 1) % PEOPLE], w(W_MESH)));
      P.forEach((n, k) => line(spokes[k], centre, n, w(W_SPOKE)));
      P.forEach((n, k) => line(pairs[k], n, A[k], w(W_PAIR)));

      const coreAmount = clamp(p - 2, 0, 1); // appears between 2021–22 and 2023
      if (core) core.setAttribute("transform", `scale(${(0.6 + 0.4 * smooth(coreAmount)).toFixed(3)})`);
      if (core) core.setAttribute("opacity", smooth(coreAmount).toFixed(3));
      if (glow) glow.setAttribute("opacity", (smooth(clamp(p - 3, 0, 1)) * 0.6).toFixed(3));
    };

    const tick = (now: number) => {
      const target = progressRef ? (progressRef.current ?? 0) : inView ? stage : startStage;
      current = reduced ? target : current + (target - current) * 0.12;
      if (Math.abs(target - current) < 0.001) current = target;
      render(current, reduced ? 0 : ((now - start) / 1000) * 0.12);
      raf = requestAnimationFrame(tick);
    };

    render(current, 0);
    // Only animate while the drawing is on screen
    const io = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      cancelAnimationFrame(raf);
      if (inView) raf = requestAnimationFrame(tick);
    });
    io.observe(svg);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [progressRef, stage, startStage]);

  const range = Array.from({ length: PEOPLE }, (_, k) => k);
  return (
    <svg ref={svgRef} viewBox="-200 -200 400 400" aria-hidden focusable="false" className={className}>
      <defs>
        <radialGradient id={glowId}>
          <stop offset="0%" className="[stop-color:var(--color-brand-400)]" stopOpacity={0.45} />
          <stop offset="100%" className="[stop-color:var(--color-brand-400)]" stopOpacity={0} />
        </radialGradient>
      </defs>
      <circle data-glow r={190} fill={`url(#${glowId})`} opacity={0} />
      <circle r={172} className="fill-none stroke-line" strokeDasharray="2 6" />

      <g strokeWidth={1}>
        {range.map((k) => (
          <line key={`c${k}`} data-client-link className="stroke-fg-subtle" />
        ))}
        {range.map((k) => (
          <line key={`m${k}`} data-mesh className="stroke-human-accent" strokeDasharray="4 4" />
        ))}
        {range.map((k) => (
          <line key={`s${k}`} data-spoke className="stroke-line-strong" />
        ))}
        {range.map((k) => (
          <line key={`p${k}`} data-pair className="flow-dash stroke-brand-400" strokeWidth={1.4} />
        ))}
      </g>

      {/* The Outscalers core: appears in 2023 */}
      <g data-core opacity={0}>
        <circle r={34} className="fill-ink-900 stroke-brand-400" strokeWidth={1.5} />
        <text textAnchor="middle" dominantBaseline="central" className="fill-fg font-sans" fontSize={10} fontWeight={600}>
          Outscalers
        </text>
      </g>

      {range.map((k) => (
        <rect key={`cl${k}`} data-client rx={1.5} className="fill-fg-subtle" />
      ))}
      {range.map((k) => (
        <circle key={`h${k}`} data-person className="fill-human-accent stroke-ink-950" strokeWidth={2} />
      ))}
      {range.map((k) => (
        <circle key={`a${k}`} data-ai className="fill-brand-400 stroke-ink-950" strokeWidth={2} />
      ))}
    </svg>
  );
}
