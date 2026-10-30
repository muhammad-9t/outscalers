"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";

// Layout (SVG units)
const CX = 300;
const CY = 150;
const CORE_R = 38;
const RING_R = 100;
const N = 22;
const TOKENS: Record<number, string> = { 0: "{ }", 4: "=>", 8: "fn", 12: "</>", 16: "if", 20: ";" };

// One loop of the story, in seconds
const LOOP = 10;


const clamp = (v: number) => Math.min(1, Math.max(0, v));
const ease = (v: number) => (v < 0.5 ? 2 * v * v : 1 - Math.pow(-2 * v + 2, 2) / 2);
const ramp = (t: number, a: number, b: number) => ease(clamp((t - a) / (b - a)));

/** How much the engineers have hold of the AI (control) and whether the result has shipped, at time t. */
function timeline(t: number) {
  const control = ramp(t, 2.2, 3.8) * (1 - ramp(t, 8.8, 9.9));
  const shipped = ramp(t, 4.8, 5.6) * (1 - ramp(t, 8.4, 9));
  const step = t < 2.6 ? 0 : t < 5 ? 1 : t < 9 ? 2 : 0;
  return { control, shipped, step };
}

/** Each fragment of AI output: where it flies on its own, and its place in the ordered orbit. */
const SEEDS = Array.from({ length: N }, (_, i) => {
  const r = (k: number) => (Math.sin(i * 12.9898 + k * 78.233) * 43758.5453) % 1;
  const f = (k: number) => Math.abs(r(k));
  return { a: f(1) * Math.PI * 2, s1: 0.6 + f(2), s2: f(3) * 6, s3: 0.6 + f(4) * 1.6, dir: f(5) < 0.5 ? -1 : 1, s4: f(6) * 6 };
});

function particle(i: number, t: number, control: number) {
  const s = SEEDS[i];
  // Unsteered: fast, erratic, all over the place
  const cr = 52 + 70 * (0.5 + 0.5 * Math.sin(t * 1.7 * s.s1 + s.s2));
  const ca = s.a + t * s.s3 * s.dir + 0.8 * Math.sin(t * 2.3 + s.s4);
  // Steered: evenly spaced on calm orbits inside the control ring
  const or = 64 + (i % 3) * 9;
  const oa = (i / N) * Math.PI * 2 + t * 0.5;
  // Fragments fall into line one after another rather than all at once
  const c = ease(clamp(control * 1.35 - (i / N) * 0.35));
  const r = cr + (or - cr) * c;
  const ax = Math.cos(ca) * (1 - c) + Math.cos(oa) * c;
  const ay = Math.sin(ca) * (1 - c) + Math.sin(oa) * c;
  const len = Math.hypot(ax, ay) || 1;
  return { x: CX + (ax / len) * r, y: CY + (ay / len) * r, c };
}

/**
 * Home hero artwork: raw AI output flies around a glowing core until engineers close a control ring
 * around it. The fragments fall into ordered orbits and the result ships, human-reviewed and tested.
 */
export function HeroControl({ className }: { className?: string }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const partRefs = useRef<(SVGGElement | null)[]>([]);
  const ringRef = useRef<SVGCircleElement>(null);
  const ticksRef = useRef<SVGGElement>(null);
  const handleRef = useRef<SVGGElement>(null);
  const tetherRef = useRef<SVGLineElement>(null);
  const coreRef = useRef<SVGGElement>(null);
  const glowRef = useRef<SVGCircleElement>(null);
  const [step, setStep] = useState(2);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    let running = false;
    let start = 0;
    let lastStep = -1;

    const paint = (t: number, still = false) => {
      const { control, step: s } = still ? { control: 1, step: 2 } : timeline(t);
      if (s !== lastStep) {
        lastStep = s;
        setStep(s);
      }
      partRefs.current.forEach((el, i) => {
        if (!el) return;
        const p = particle(i, t, control);
        el.setAttribute("transform", `translate(${p.x.toFixed(1)} ${p.y.toFixed(1)})`);
        el.style.opacity = String(0.55 + 0.45 * p.c);
      });
      ringRef.current?.setAttribute("stroke-dashoffset", String(1 - control));
      if (ticksRef.current) ticksRef.current.style.opacity = String(control);
      // The engineer's handle swings onto the left of the ring and holds the core on a tether
      const ha = Math.PI + (1 - control) * 0.9;
      handleRef.current?.setAttribute("transform", `translate(${CX + Math.cos(ha) * RING_R} ${CY + Math.sin(ha) * RING_R})`);
      if (handleRef.current) handleRef.current.style.opacity = String(control);
      if (tetherRef.current) {
        tetherRef.current.setAttribute("x2", String(CX + Math.cos(ha) * RING_R));
        tetherRef.current.setAttribute("y2", String(CY + Math.sin(ha) * RING_R));
        tetherRef.current.style.opacity = String(control * 0.8);
      }
      // Unsteered, the core flickers hot; steered, it settles into a slow pulse
      const flicker = (1 - control) * (0.07 * Math.sin(t * 9) + 0.04 * Math.sin(t * 23));
      coreRef.current?.setAttribute("transform", `translate(${CX} ${CY}) scale(${(1 + flicker + 0.02 * Math.sin(t * 2)).toFixed(3)})`);
      if (glowRef.current) glowRef.current.style.opacity = String(0.55 + 0.45 * (1 - control) * (0.6 + 0.4 * Math.sin(t * 7)));
    };

    const frame = (now: number) => {
      if (!start) start = now;
      paint(((now - start) / 1000) % LOOP);
      if (running) raf = requestAnimationFrame(frame);
    };

    if (reduced) {
      paint(0, true);
      return;
    }
    paint(0);
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !running) {
        running = true;
        raf = requestAnimationFrame(frame);
      } else if (!e.isIntersecting) {
        running = false;
        cancelAnimationFrame(raf);
      }
    });
    if (rootRef.current) io.observe(rootRef.current);
    return () => {
      running = false;
      cancelAnimationFrame(raf);
      io.disconnect();
    };
  }, []);

  return (
    <div ref={rootRef} className={cn("flex flex-col-reverse items-center gap-8 sm:flex-row sm:justify-end sm:gap-10", className)}>
      <Legend step={step} />
      <svg
        viewBox={`${CX - 135} ${CY - 135} 270 270`}
        role="img"
        aria-labelledby="hc-title hc-desc"
        className="h-auto w-[min(22rem,80vw)] shrink-0 overflow-visible sm:w-[min(24rem,42vh)]"
      >
        <title id="hc-title">AI under human control</title>
        <desc id="hc-desc">
          Raw AI output flies around a glowing AI core until engineers close a control ring around it. The output falls
          into order and ships, human-reviewed and tested.
        </desc>
        <defs>
          <radialGradient id="hc-core" cx="45%" cy="40%" r="60%">
            <stop offset="0%" style={{ stopColor: "var(--color-brand-200)" }} />
            <stop offset="45%" style={{ stopColor: "var(--color-brand-400)" }} />
            <stop offset="100%" style={{ stopColor: "var(--color-brand-600)" }} />
          </radialGradient>
          <radialGradient id="hc-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" style={{ stopColor: "var(--color-brand-400)", stopOpacity: 0.45 }} />
            <stop offset="100%" style={{ stopColor: "var(--color-brand-400)", stopOpacity: 0 }} />
          </radialGradient>
        </defs>

        {/* Core glow */}
        <circle ref={glowRef} cx={CX} cy={CY} r={130} fill="url(#hc-glow)" />

        {/* Human control ring: draws itself closed around the core */}
        <circle cx={CX} cy={CY} r={RING_R} className="fill-none stroke-human-accent/15" strokeWidth={1.5} />
        <circle
          ref={ringRef}
          cx={CX}
          cy={CY}
          r={RING_R}
          pathLength={1}
          strokeDasharray="1"
          strokeDashoffset="1"
          transform={`rotate(-90 ${CX} ${CY})`}
          className="fill-none stroke-human-accent"
          strokeWidth={2}
          strokeLinecap="round"
        />
        <g ref={ticksRef} className="stroke-human-accent/50" strokeWidth={1} style={{ opacity: 0 }}>
          {Array.from({ length: 48 }, (_, i) => {
            const a = (i / 48) * Math.PI * 2;
            const r1 = RING_R + 5;
            const r2 = RING_R + (i % 4 === 0 ? 11 : 8);
            return <line key={i} x1={CX + Math.cos(a) * r1} y1={CY + Math.sin(a) * r1} x2={CX + Math.cos(a) * r2} y2={CY + Math.sin(a) * r2} />;
          })}
        </g>
        <line ref={tetherRef} x1={CX} y1={CY} x2={CX - RING_R} y2={CY} className="stroke-human-accent/60" strokeWidth={1} strokeDasharray="3 4" />

        {/* AI output fragments */}
        {SEEDS.map((_, i) => (
          <g key={i} ref={(el) => void (partRefs.current[i] = el)}>
            {TOKENS[i] ? (
              <text textAnchor="middle" dominantBaseline="middle" className="fill-brand-300 font-mono" fontSize={9.5} fontWeight={600}>
                {TOKENS[i]}
              </text>
            ) : (
              <circle r={i % 2 ? 2.4 : 1.8} className={i % 3 ? "fill-brand-400" : "fill-brand-200"} />
            )}
          </g>
        ))}

        {/* AI core: a glowing node with its neural graph */}
        <g ref={coreRef} transform={`translate(${CX} ${CY})`}>
          <circle r={CORE_R} fill="url(#hc-core)" />
          <g className="stroke-ink-950/45" strokeWidth={1.2}>
            {[0, 1, 2, 3, 4, 5].map((k) => {
              const a = (k / 6) * Math.PI * 2 + 0.3;
              return <line key={k} x1={0} y1={0} x2={Math.cos(a) * 24} y2={Math.sin(a) * 24} />;
            })}
          </g>
          <g className="fill-ink-950/70">
            {[0, 1, 2, 3, 4, 5].map((k) => {
              const a = (k / 6) * Math.PI * 2 + 0.3;
              return <circle key={k} cx={Math.cos(a) * 24} cy={Math.sin(a) * 24} r={3} />;
            })}
          </g>
          <circle r={6} className="fill-ink-950/80" />
        </g>
        <text x={CX} y={CY + CORE_R + 18} textAnchor="middle" className="fill-brand-300 font-mono" fontSize={9.5} letterSpacing="0.14em">
          AI
        </text>

        {/* The engineer's handle on the ring */}
        <g ref={handleRef} transform={`translate(${CX - RING_R} ${CY})`}>
          <circle r={13} className="fill-ink-900 stroke-human-accent" strokeWidth={1.6} />
          <circle cy={-3} r={3.2} className="fill-human-accent" />
          <path d="M-6 7c1-4 3.5-6 6-6s5 2 6 6" className="fill-human-accent" />
        </g>

      </svg>

    </div>
  );
}

/** The three stages, stacked and joined by a bracket. The active stage lights up as the animation plays. */
function Legend({ step }: { step: number }) {
  const item = (i: number) =>
    cn(
      "relative pl-6 transition-opacity duration-500 before:absolute before:top-1/2 before:left-0 before:h-px before:w-4 before:transition-colors before:duration-500",
      step === i ? "opacity-100" : "opacity-70",
      step === i ? (i === 1 ? "before:bg-human-accent" : "before:bg-brand-400") : "before:bg-line-strong",
    );
  return (
    <ol aria-label="How we use AI" className="relative flex w-56 shrink-0 flex-col gap-7 border-l border-line-strong py-1 font-mono">
      <li aria-current={step === 0 ? "step" : undefined} className={item(0)}>
        <p className="text-sm tracking-[0.16em] text-brand-300">AI OUTPUT</p>
        <p className="mt-1 text-[11px] text-fg-subtle">fast · at scale · unchecked</p>
      </li>
      <li aria-current={step === 1 ? "step" : undefined} className={item(1)}>
        <p className="text-xl font-semibold tracking-[0.14em] text-human-accent">ENGINEER</p>
        <p className="mt-1 text-[11px] text-fg-subtle">reviews · steers · approves</p>
      </li>
      <li aria-current={step === 2 ? "step" : undefined} className={item(2)}>
        <span className="inline-flex items-center gap-3 rounded-xl border border-brand-400/50 bg-ink-850/80 px-3.5 py-2.5">
          <span className="grid size-7 place-items-center rounded-full bg-brand-400">
            <svg viewBox="0 0 16 16" className="size-4" aria-hidden>
              <path d="m4 8.5 2.5 2.5 5.5-6" className="fill-none stroke-on-brand" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          <span>
            <span className="block font-sans text-sm font-semibold text-fg">Shipped</span>
            <span className="block text-[10.5px] text-fg-subtle">reviewed · tested</span>
          </span>
        </span>
      </li>
    </ol>
  );
}
