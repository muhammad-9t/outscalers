"use client";

import { useEffect, useRef, useState } from "react";
import { CodeXml, FlaskConical, Lightbulb, Rocket, UserCheck, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";
import { WorkflowScreen } from "./workflow-screen";

type Tone = "human" | "ai" | "neutral";
type Step = { label: string; sub: string; body: string; tone: Tone; Icon: LucideIcon };

export const steps: Step[] = [
  {
    label: "Idea",
    sub: "people define",
    body: "Your team and our engineers agree the goal, the scope and what done looks like.",
    tone: "human",
    Icon: Lightbulb,
  },
  {
    label: "Implement",
    sub: "AI-assisted",
    body: "Engineers direct the work. AI drafts scaffolding, routine code and first tests.",
    tone: "ai",
    Icon: CodeXml,
  },
  {
    label: "Review",
    sub: "engineer approves",
    body: "Every change is read by an engineer. If it isn't right, it goes back to implementation.",
    tone: "human",
    Icon: UserCheck,
  },
  {
    label: "Test",
    sub: "automated + manual",
    body: "Automated suites run on every change, and people test what automation can't.",
    tone: "neutral",
    Icon: FlaskConical,
  },
  {
    label: "Deploy",
    sub: "monitored",
    body: "Releases ship with monitoring. What we learn in production feeds the next idea.",
    tone: "neutral",
    Icon: Rocket,
  },
];

export const toneClass: Record<Tone, { ring: string; icon: string; chip: string; dot: string; label: string }> = {
  human: {
    ring: "border-human-accent shadow-[0_0_24px_-4px_var(--color-human-accent)]",
    icon: "text-human-accent",
    chip: "border-human-accent/40 text-human-accent",
    dot: "bg-human-accent",
    label: "Human-led",
  },
  ai: {
    ring: "border-brand-400 shadow-[0_0_24px_-4px_var(--color-brand-400)]",
    icon: "text-brand-300",
    chip: "border-brand-400/40 text-brand-300",
    dot: "bg-brand-400",
    label: "AI-assisted",
  },
  neutral: {
    ring: "border-fg-subtle shadow-[0_0_24px_-6px_var(--color-fg-subtle)]",
    icon: "text-fg-muted",
    chip: "border-line-strong text-fg-muted",
    dot: "bg-fg-subtle",
    label: "Automated",
  },
};

const pad = (n: number) => String(n).padStart(2, "0");
// Where on screen the packet sits: a node lights up when it crosses this line
const ANCHOR = 0.55;

/**
 * The workflow as a vertical rail driven by scrolling: a packet runs down the spine, lighting each step
 * as it arrives. Review opens the "changes requested" loop back to Implement, and Deploy closes the
 * feedback loop that carries what we learn back up to the next Idea.
 */
export function WorkflowRail() {
  const gutter = useRef<HTMLDivElement>(null);
  const fill = useRef<SVGLineElement>(null);
  const head = useRef<SVGGElement>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [current, setCurrent] = useState(-1);

  const n = steps.length;
  const x = size.w * 0.75; // the spine
  const rowY = (i: number) => ((i + 0.5) * size.h) / n;
  const y0 = rowY(0);
  const span = rowY(n - 1) - y0;

  useEffect(() => {
    const g = gutter.current;
    if (!g) return;
    const ro = new ResizeObserver(([e]) => setSize({ w: e.contentRect.width, h: e.contentRect.height }));
    ro.observe(g);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const g = gutter.current;
    if (!g || !size.h) return;
    let frame = 0;
    let last = -2;
    const update = () => {
      frame = 0;
      const top = g.getBoundingClientRect().top;
      const raw = (window.innerHeight * ANCHOR - top - y0) / span;
      const f = Math.min(1, Math.max(0, raw));
      if (fill.current) fill.current.style.strokeDashoffset = String(1 - f);
      if (head.current) head.current.style.transform = `translateY(${f * span}px)`;
      // A node lights up as the packet reaches its edge, not only once the packet is past its centre
      const lead = 24 / span;
      const c = raw < -lead ? -1 : Math.min(n - 1, Math.floor((raw + lead) * (n - 1)));
      if (c !== last) setCurrent((last = c));
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    frame = requestAnimationFrame(update);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(frame);
    };
  }, [size.h, y0, span, n]);

  const changesOn = current >= 2;
  const feedbackOn = current >= n - 1;

  // Loop geometry, in real pixels so nothing is stretched
  const yImpl = rowY(1);
  const yRev = rowY(2);
  const xc = size.w * 0.42; // changes loop
  const xf = size.w * 0.12; // feedback loop
  const r = 10;
  const changes = `M${x} ${yRev}H${xc + r}Q${xc} ${yRev} ${xc} ${yRev - r}V${yImpl + r}Q${xc} ${yImpl} ${xc + r} ${yImpl}H${x}`;
  const yLast = rowY(n - 1);
  const feedback = `M${x} ${yLast}H${xf + r}Q${xf} ${yLast} ${xf} ${yLast - r}V${y0 + r}Q${xf} ${y0} ${xf + r} ${y0}H${x}`;

  return (
    <div className="grid gap-12 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:gap-14">
      <div className="relative">
        {/* Legend */}
        <ul className="mb-8 flex flex-wrap gap-x-6 gap-y-2 font-mono text-xs text-fg-muted">
          {(["human", "ai", "neutral"] as const).map((t) => (
            <li key={t} className="flex items-center gap-2">
              <span aria-hidden className={cn("size-2 rounded-full", toneClass[t].dot)} />
              {toneClass[t].label}
            </li>
          ))}
        </ul>

        <div className="relative">
          {/* Rail, loops and packets, drawn over the left gutter */}
          <div ref={gutter} aria-hidden className="pointer-events-none absolute inset-y-0 left-0 w-20 sm:w-32">
            {size.h > 0 && (
              <svg width={size.w} height={size.h} className="absolute inset-0 overflow-visible">
                <defs>
                  <marker id="wr-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                    <path d="M1 1 9 5 1 9" fill="none" stroke="context-stroke" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" />
                  </marker>
                </defs>

                {/* Feedback: deploy → idea */}
                <path
                  d={feedback}
                  fill="none"
                  strokeWidth={1.4}
                  strokeDasharray="4 7"
                  markerEnd="url(#wr-arrow)"
                  className={cn("flow-dash transition-[stroke,opacity] duration-700", feedbackOn ? "stroke-brand-400 opacity-90" : "stroke-fg-subtle opacity-30")}
                />
                <g transform={`translate(${xf} ${(y0 + yLast) / 2}) rotate(-90)`} className={cn("transition-opacity duration-700", feedbackOn ? "opacity-100" : "opacity-40")}>
                  <rect x={-128} y={-10} width={256} height={20} rx={10} className="fill-ink-950 stroke-line-strong" />
                  <text y={3.5} textAnchor="middle" fontSize={10} className="fill-fg-muted font-mono">
                    monitoring &amp; feedback → next iteration
                  </text>
                </g>

                {/* Changes requested: review → implement */}
                <path
                  d={changes}
                  fill="none"
                  strokeWidth={1.4}
                  strokeDasharray="4 7"
                  markerEnd="url(#wr-arrow)"
                  className={cn("flow-dash transition-[stroke,opacity] duration-700", changesOn ? "stroke-human-accent opacity-90" : "stroke-fg-subtle opacity-30")}
                />
                <g transform={`translate(${xc} ${(yImpl + yRev) / 2}) rotate(-90)`} className={cn("transition-opacity duration-700", changesOn ? "opacity-100" : "opacity-40")}>
                  <rect x={-58} y={-9} width={116} height={18} rx={9} className="fill-ink-950 stroke-human-accent/40" />
                  <text y={3} textAnchor="middle" fontSize={9} className="fill-human-accent font-mono">
                    changes requested
                  </text>
                </g>

                {/* Packets on the loops, once each loop is open */}
                <g className="motion-reduce:hidden">
                  {changesOn && (
                    <circle r={3.5} className="fill-human-accent drop-shadow-[0_0_5px_var(--color-human-accent)]">
                      <animateMotion dur="2.6s" repeatCount="indefinite" path={changes} />
                    </circle>
                  )}
                  {feedbackOn && (
                    <circle r={3.5} className="fill-brand-300 drop-shadow-[0_0_6px_var(--color-brand-400)]">
                      <animateMotion dur="4.5s" repeatCount="indefinite" path={feedback} />
                    </circle>
                  )}
                </g>

                {/* Spine: track, the part already travelled, and the packet at its tip */}
                <line x1={x} y1={y0} x2={x} y2={yLast} strokeWidth={2} className="stroke-line-strong" />
                <line
                  ref={fill}
                  x1={x}
                  y1={y0}
                  x2={x}
                  y2={yLast}
                  strokeWidth={2}
                  pathLength={1}
                  strokeDasharray="1"
                  strokeDashoffset={1}
                  className="stroke-brand-400 drop-shadow-[0_0_6px_var(--color-brand-400)]"
                />
                <g ref={head}>
                  <circle cx={x} cy={y0} r={11} className="fill-brand-400/15 motion-safe:animate-[pulse-soft_1.6s_ease-in-out_infinite]" />
                  <circle cx={x} cy={y0} r={5} className="fill-brand-300 drop-shadow-[0_0_8px_var(--color-brand-400)]" />
                </g>
              </svg>
            )}
          </div>

          <ol className="grid auto-rows-fr">
            {steps.map((s, i) => {
              const t = toneClass[s.tone];
              const state = i < current ? "done" : i === current ? "active" : "queued";
              const lit = i <= current;
              return (
                <li key={s.label} className="relative grid grid-cols-[5rem_1fr] items-center py-3 sm:grid-cols-[8rem_1fr] sm:py-4">
                  {/* Node on the spine (75% across the gutter) */}
                  <div className="relative h-full">
                    <div
                      className={cn(
                        "absolute top-1/2 left-3/4 z-10 grid size-11 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border-2 bg-ink-950 transition-all duration-500 sm:size-14",
                        lit ? t.ring : "border-line-strong",
                        i === current && "scale-110",
                      )}
                    >
                      <s.Icon aria-hidden className={cn("size-5 transition-colors duration-500 sm:size-6", lit ? t.icon : "text-fg-subtle")} strokeWidth={1.7} />
                    </div>
                  </div>

                  <article
                    className={cn(
                      "card p-5 transition-all duration-500 sm:p-7",
                      lit ? "opacity-100" : "opacity-45",
                      i === current ? "translate-x-0 border-brand-400/40" : lit ? "translate-x-0" : "translate-x-3",
                    )}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <p className="font-mono text-xs tracking-[0.16em] text-fg-subtle uppercase">
                        Step {pad(i + 1)} / {pad(n)}
                      </p>
                      <p
                        className={cn(
                          "flex items-center gap-1.5 font-mono text-[11px] tracking-[0.14em] uppercase",
                          state === "active" ? "text-brand-300" : state === "done" ? "text-fg-muted" : "text-fg-subtle",
                        )}
                      >
                        {state === "active" && (
                          <span aria-hidden className="size-1.5 rounded-full bg-brand-400 motion-safe:animate-[pulse-soft_1.6s_ease-in-out_infinite]" />
                        )}
                        {state === "done" ? "✓ Done" : state === "active" ? "In progress" : "Queued"}
                      </p>
                    </div>
                    <h3 className="mt-3 flex flex-wrap items-center gap-3 text-2xl font-semibold sm:text-[1.75rem]">
                      {s.label}
                      <span className={cn("rounded-full border px-2.5 py-0.5 font-mono text-xs font-normal", t.chip)}>{s.sub}</span>
                    </h3>
                    <p className="mt-3 text-[1.0625rem] leading-relaxed text-fg-muted">{s.body}</p>
                  </article>
                </li>
              );
            })}
          </ol>
        </div>
      </div>

      {/* Pinned beside the rail on large screens, like the portfolio laptop */}
      <div className="hidden lg:block">
        <div className="sticky top-[calc(50svh-11rem)]">
          <WorkflowScreen step={current} />
        </div>
      </div>
    </div>
  );
}
