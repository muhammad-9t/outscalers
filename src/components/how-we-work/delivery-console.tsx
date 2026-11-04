"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";

type Actor = "ENG" | "AI" | "CI" | "OPS";
const stages = ["Idea", "Build", "Review", "Test", "Live"] as const;

// One feature's trip through the workflow, replayed as a live log
const log: { actor: Actor; text: string; stage: number; ok?: boolean }[] = [
  { actor: "ENG", text: "Scope agreed: invoice export, CSV and PDF", stage: 0 },
  { actor: "AI", text: "Drafted export service and 14 tests", stage: 1 },
  { actor: "ENG", text: "Changes requested: handle empty months", stage: 2 },
  { actor: "AI", text: "Revised draft, edge cases covered", stage: 1 },
  { actor: "ENG", text: "Approved and merged", stage: 2, ok: true },
  { actor: "CI", text: "212 tests passed, security scan clean", stage: 3, ok: true },
  { actor: "OPS", text: "v1.8 deployed, monitoring on", stage: 4, ok: true },
];

const actorClass: Record<Actor, string> = {
  ENG: "border-human-accent/50 text-human-accent",
  AI: "border-brand-400/50 text-brand-300",
  CI: "border-line-strong text-fg-muted",
  OPS: "border-line-strong text-fg-muted",
};

const STEP_MS = 1100;
const HOLD_MS = 2600;

/** Hero visual for How We Work: a delivery log that plays one feature from idea to live, then starts over. */
export function DeliveryConsole() {
  const root = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(0);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let timer = 0;
    let n = 0;
    const step = () => {
      n = n >= log.length ? 0 : n + 1;
      setShown(n);
      timer = window.setTimeout(step, n >= log.length ? HOLD_MS : n === 0 ? 500 : STEP_MS);
    };
    // Only play while the console is on screen; with reduced motion, just show the whole log
    const io = new IntersectionObserver(([e]) => {
      window.clearTimeout(timer);
      if (reduce) setShown(log.length);
      else if (e.isIntersecting) timer = window.setTimeout(step, STEP_MS);
    });
    io.observe(el);
    return () => {
      io.disconnect();
      window.clearTimeout(timer);
    };
  }, []);

  const stage = shown ? log[shown - 1].stage : -1;

  return (
    <div ref={root} aria-hidden className="card relative overflow-hidden font-mono text-[0.8125rem]">
      <div className="flex items-center justify-between border-b border-line px-5 py-3">
        <span className="flex gap-1.5">
          <span className="size-2.5 rounded-full bg-ink-700" />
          <span className="size-2.5 rounded-full bg-ink-700" />
          <span className="size-2.5 rounded-full bg-ink-700" />
        </span>
        <span className="text-xs tracking-[0.14em] text-fg-subtle uppercase">delivery.log</span>
        <span className="flex items-center gap-1.5 text-xs tracking-[0.14em] text-brand-300 uppercase">
          <span className="size-1.5 rounded-full bg-brand-400 motion-safe:animate-[pulse-soft_1.6s_ease-in-out_infinite]" />
          Live
        </span>
      </div>

      <ol className="space-y-2.5 px-5 py-5">
        {log.map((l, i) => (
          <li
            key={i}
            className={cn(
              "flex items-center gap-3 transition-all duration-500",
              i < shown ? "translate-y-0 opacity-100" : "translate-y-1 opacity-0",
            )}
          >
            <span className="w-11 shrink-0 text-[11px] text-fg-subtle">{`00:0${i + 1}`}</span>
            <span className={cn("w-11 shrink-0 rounded border px-1 text-center text-[10px] leading-5", actorClass[l.actor])}>
              {l.actor}
            </span>
            <span className={cn("min-w-0 flex-1 truncate", l.ok ? "text-fg" : "text-fg-muted")}>{l.text}</span>
            {l.ok && <span className="text-brand-300">✓</span>}
            {/* Blinking cursor on the newest line */}
            {i === shown - 1 && !l.ok && (
              <span className="h-3.5 w-1.5 bg-brand-400 motion-safe:animate-[caret_1s_steps(1)_infinite]" />
            )}
          </li>
        ))}
      </ol>

      {/* Where the feature is right now */}
      <div className="grid grid-cols-5 gap-1.5 border-t border-line px-5 py-4">
        {stages.map((s, i) => (
          <div key={s} className="text-center">
            <span
              className={cn(
                "block h-1 rounded-full transition-colors duration-500",
                i < stage ? "bg-brand-400/50" : i === stage ? "bg-brand-400 shadow-[0_0_10px_var(--color-brand-400)]" : "bg-ink-700",
              )}
            />
            <span
              className={cn(
                "mt-2 block text-[10px] tracking-[0.12em] uppercase transition-colors duration-500",
                i === stage ? "text-brand-300" : "text-fg-subtle",
              )}
            >
              {s}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
