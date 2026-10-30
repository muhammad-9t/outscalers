"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";

const LOG = [
  { cmd: "ai.draft(feature)", out: "draft ready", tone: "ai" },
  { cmd: "engineer.review(draft)", out: "rework", tone: "human" },
  { cmd: "ai.revise(draft)", out: "updated", tone: "ai" },
  { cmd: "engineer.approve()", out: "approved", tone: "human" },
  { cmd: "tests.run()", out: "all passing", tone: "ok" },
  { cmd: "deploy --approved", out: "shipped", tone: "ok" },
] as const;

const TONE = { ai: "text-brand-300", human: "text-human-accent", ok: "text-fg-muted" } as const;

/** Small HUD frame with corner brackets, shared by both readouts. */
function Frame({ title, className, children }: { title: string; className?: string; children: React.ReactNode }) {
  return (
    <div aria-hidden className={cn("pointer-events-none relative border border-line bg-ink-950/50 p-3.5 font-mono backdrop-blur-sm", className)}>
      <span className="absolute -top-px -left-px size-2 border-t-2 border-l-2 border-brand-400/70" />
      <span className="absolute -right-px -bottom-px size-2 border-r-2 border-b-2 border-brand-400/70" />
      <p className="flex items-center gap-2 text-[10px] tracking-[0.18em] text-fg-subtle uppercase">
        <span className="size-1.5 rounded-full bg-brand-400 motion-safe:animate-pulse" />
        {title}
      </p>
      {children}
    </div>
  );
}

/** A terminal log that plays the human-in-the-loop flow line by line, then starts over. */
export function HudLog({ className }: { className?: string }) {
  const [shown, setShown] = useState<number>(LOG.length);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    // Holds the full log for two ticks, then replays it from the first line
    const id = setInterval(() => setShown((n) => (n >= LOG.length + 2 ? 1 : n + 1)), 900);
    return () => clearInterval(id);
  }, []);

  return (
    <Frame title="Session // human-in-the-loop" className={className}>
      <ol className="mt-2.5 space-y-1 text-[11px] leading-4">
        {LOG.map((l, i) => (
          <li key={l.cmd} className={cn("flex gap-2 transition-opacity duration-300", i < shown ? "opacity-100" : "opacity-25")}>
            <span className="text-fg-subtle">&gt;</span>
            <span className={TONE[l.tone]}>{l.cmd}</span>
            <span className="ml-auto pl-3 text-fg-subtle">{l.out}</span>
          </li>
        ))}
      </ol>
    </Frame>
  );
}

/** Control readout: the human gates stay on while the AI load moves. */
export function HudStatus({ className }: { className?: string }) {
  return (
    <Frame title="Control status" className={className}>
      <dl className="mt-2.5 space-y-2 text-[11px]">
        <div className="flex items-center justify-between gap-4">
          <dt className="text-fg-subtle">Human review</dt>
          <dd className="text-human-accent">ENGAGED</dd>
        </div>
        <div className="flex items-center justify-between gap-4">
          <dt className="text-fg-subtle">AI throughput</dt>
          <dd className="flex h-3 items-end gap-0.5">
            {[0.5, 0.8, 0.35, 1, 0.6, 0.9, 0.45, 0.7].map((h, i) => (
              <span
                key={i}
                className="w-1 origin-bottom bg-brand-400 motion-safe:animate-[hud-bar_1.6s_ease-in-out_infinite_alternate]"
                style={{ height: `${h * 100}%`, animationDelay: `${i * -0.23}s` }}
              />
            ))}
          </dd>
        </div>
        <div className="flex items-center justify-between gap-4">
          <dt className="text-fg-subtle">Quality gate</dt>
          <dd className="text-brand-300">PASS</dd>
        </div>
        <div className="h-px w-full overflow-hidden bg-line">
          <span className="block h-full w-1/3 bg-brand-400/80 motion-safe:animate-[hud-scan_2.8s_ease-in-out_infinite]" />
        </div>
      </dl>
    </Frame>
  );
}
