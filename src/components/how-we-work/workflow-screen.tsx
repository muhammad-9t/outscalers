import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/cn";

// Each line of a scene fades up a beat after the one before; scenes remount per step, so this replays
const beat = (i: number, base = 250) => ({
  className: "motion-safe:animate-[fade-up_0.45s_var(--ease-out-soft)_both]",
  style: { animationDelay: `${base + i * 220}ms` } as CSSProperties,
});

function Line({ i, base, className, children }: { i: number; base?: number; className?: string; children: ReactNode }) {
  const b = beat(i, base);
  return (
    <div className={cn(b.className, className)} style={b.style}>
      {children}
    </div>
  );
}

const Caret = () => (
  <span aria-hidden className="ml-0.5 inline-block h-3.5 w-1.5 translate-y-0.5 bg-brand-400 motion-safe:animate-[caret_1s_steps(1)_infinite]" />
);

/** A bar that fills from the left after `delay` ms. */
function Bar({ value, delay, tone = "brand" }: { value: number; delay: number; tone?: "brand" | "human" }) {
  return (
    <span className="block h-1.5 overflow-hidden rounded-full bg-ink-700">
      <span
        className={cn(
          "block h-full origin-left rounded-full motion-safe:animate-[bar-fill_1.1s_var(--ease-out-soft)_both]",
          tone === "brand" ? "bg-brand-400" : "bg-human-accent",
        )}
        style={{ width: `${value}%`, animationDelay: `${delay}ms` }}
      />
    </span>
  );
}

export const scenes: { file: string; render: () => ReactNode }[] = [
  {
    file: "brief.md",
    render: () => (
      <div className="space-y-3">
        <Line i={0} className="font-sans text-lg font-semibold text-fg"># Invoice export</Line>
        {[
          ["Goal", "Customers download their own invoices"],
          ["Scope", "CSV and PDF, per month"],
          ["Done when", "Totals match accounting"],
          ["Risks", "Months with no invoices"],
        ].map(([k, v], i) => (
          <Line key={k} i={i + 1} className="flex gap-3">
            <span className="w-20 shrink-0 text-human-accent">{k}</span>
            <span className="text-fg-muted">{v}</span>
          </Line>
        ))}
        <Line i={5} className="flex items-center gap-2 pt-2 text-xs text-fg-subtle">
          <span className="rounded border border-human-accent/40 px-1.5 text-human-accent">ENG</span>
          Agreed with your team
          <span className="text-brand-300">✓</span>
        </Line>
      </div>
    ),
  },
  {
    file: "export.ts",
    render: () => (
      <div className="space-y-1.5">
        {[
          <>
            <span className="text-brand-300">export async function</span> <span className="text-fg">exportInvoices</span>
            <span className="text-fg-subtle">(month, format) {"{"}</span>
          </>,
          <>
            {"  "}
            <span className="text-brand-300">const</span> rows = <span className="text-brand-300">await</span> db.invoices.
            <span className="text-fg">forMonth</span>(month);
          </>,
        ].map((c, i) => (
          <Line key={i} i={i} className="whitespace-pre text-fg-muted">
            <span className="mr-3 inline-block w-4 text-right text-fg-subtle">{i + 1}</span>
            {c}
          </Line>
        ))}
        {/* The AI suggestion, then the engineer accepting it */}
        <Line i={2} className="rounded-lg border border-dashed border-brand-400/50 bg-brand-500/5 p-2.5">
          <p className="mb-1.5 text-[10px] tracking-[0.14em] text-brand-300 uppercase">AI suggestion</p>
          <p className="whitespace-pre text-fg-subtle">
            <span className="mr-3 inline-block w-4 text-right">3</span>
            {"  "}
            <span className="text-brand-300/70">return</span> format === <span className="text-human-accent/70">&quot;pdf&quot;</span>
          </p>
          <p className="whitespace-pre text-fg-subtle">
            <span className="mr-3 inline-block w-4 text-right">4</span>
            {"    "}? toPdf(rows) : toCsv(rows);
          </p>
        </Line>
        <Line i={4} className="flex items-center gap-2 text-xs text-fg-subtle">
          <span className="rounded border border-human-accent/40 px-1.5 text-human-accent">ENG</span>
          Accepted, then edited by hand
          <Caret />
        </Line>
      </div>
    ),
  },
  {
    file: "PR #128 · Add invoice export",
    render: () => (
      <div className="space-y-1.5">
        <Line i={0} className="whitespace-pre rounded bg-danger/10 px-2 text-danger/90">- return toCsv(rows);</Line>
        <Line i={1} className="whitespace-pre rounded bg-brand-500/10 px-2 text-brand-200">+ return format === &quot;pdf&quot;</Line>
        <Line i={2} className="whitespace-pre rounded bg-brand-500/10 px-2 text-brand-200">+   ? toPdf(rows) : toCsv(rows);</Line>
        <Line i={3} className="mt-3 rounded-lg border border-human-accent/40 bg-human-accent/5 p-3 font-sans text-sm">
          <p className="font-mono text-[10px] tracking-[0.14em] text-human-accent uppercase">Engineer · changes requested</p>
          <p className="mt-1 text-fg-muted">What happens in a month with no invoices?</p>
        </Line>
        <Line i={5} base={600} className="flex items-center gap-2 pt-1 text-xs">
          <span className="rounded-full border border-brand-400/50 px-2 py-0.5 text-brand-300">✓ Approved after revision</span>
        </Line>
      </div>
    ),
  },
  {
    file: "test run",
    render: () => (
      <div className="space-y-3">
        {[
          ["unit", 100, "148 passed"],
          ["integration", 100, "52 passed"],
          ["end-to-end", 100, "12 passed"],
          ["security scan", 100, "clean"],
        ].map(([k, v, r], i) => (
          <Line key={k as string} i={i}>
            <div className="mb-1.5 flex justify-between text-xs">
              <span className="text-fg-muted">{k}</span>
              <span className="text-brand-300">{r}</span>
            </div>
            <Bar value={v as number} delay={300 + i * 260} />
          </Line>
        ))}
        <Line i={5} className="flex items-center gap-2 pt-1 text-xs text-fg-subtle">
          <span className="rounded border border-human-accent/40 px-1.5 text-human-accent">ENG</span>
          Exploratory testing signed off
          <span className="text-brand-300">✓</span>
        </Line>
      </div>
    ),
  },
  {
    file: "production",
    render: () => (
      <div className="space-y-3">
        <Line i={0} className="flex justify-between text-xs">
          <span className="text-fg-muted">v1.8 rolling out</span>
          <span className="text-brand-300">100%</span>
        </Line>
        <Line i={0}>
          <Bar value={100} delay={300} />
        </Line>
        {/* Latency since the release: flat and healthy */}
        <Line i={1} className="rounded-lg border border-line p-3">
          <div className="mb-2 flex justify-between text-[10px] tracking-[0.14em] text-fg-subtle uppercase">
            <span>p95 latency</span>
            <span className="text-brand-300">182 ms</span>
          </div>
          <svg viewBox="0 0 420 56" className="h-14 w-full" aria-hidden>
            <path
              d="M0 36 L42 30 L84 38 L126 28 L168 33 L210 25 L252 30 L294 22 L336 27 L378 23 L420 26"
              fill="none"
              strokeWidth={2}
              pathLength={1}
              className="stroke-brand-400 [stroke-dasharray:1] [stroke-dashoffset:1] motion-safe:animate-[draw_1.4s_0.6s_var(--ease-out-soft)_forwards] motion-reduce:[stroke-dashoffset:0]"
            />
          </svg>
        </Line>
        <Line i={3} className="flex items-center gap-2 text-xs text-fg-subtle">
          <span className="size-1.5 rounded-full bg-brand-400 motion-safe:animate-[pulse-soft_1.6s_ease-in-out_infinite]" />
          Monitoring on · 0 errors
        </Line>
        <Line i={4} className="flex items-center gap-2 text-xs text-fg-subtle">
          <span className="rounded border border-line-strong px-1.5 text-fg-muted">OPS</span>
          Feedback queued for the next idea
        </Line>
      </div>
    ),
  },
];

/**
 * The pinned "monitor" beside the workflow rail: it plays a short scene for the active step,
 * the way the portfolio laptop follows each project.
 */
export function WorkflowScreen({ step }: { step: number }) {
  const scene = scenes[step];
  return (
    <div aria-hidden className="relative">
      {/* Glow behind the screen */}
      <div className="glow-brand pointer-events-none absolute -inset-10 opacity-40" />
      <div className="glass relative rounded-2xl border border-line-strong bg-ink-850 p-2.5 shadow-[0_30px_80px_-30px_rgb(0_0_0/0.8)]">
        <div className="glass-inner relative h-[19.5rem] overflow-hidden rounded-xl border border-line bg-ink-950 font-mono text-[0.8125rem]">
          <div className="flex items-center justify-between border-b border-line px-4 py-2.5">
            <span className="flex gap-1.5">
              <span className="size-2.5 rounded-full bg-ink-700" />
              <span className="size-2.5 rounded-full bg-ink-700" />
              <span className="size-2.5 rounded-full bg-ink-700" />
            </span>
            <span className="truncate px-3 text-xs text-fg-subtle">{scene ? scene.file : "standby"}</span>
            <span className="text-[10px] tracking-[0.14em] text-brand-300 uppercase">
              {step >= 0 ? `step ${String(step + 1).padStart(2, "0")}` : "idle"}
            </span>
          </div>
          {/* Remounts on every step, so the scene replays and the screen "switches" */}
          <div key={step} className="p-5 motion-safe:animate-[qc-in_0.35s_var(--ease-out-soft)_both]">
            {scene ? (
              scene.render()
            ) : (
              <p className="pt-24 text-center text-xs tracking-[0.14em] text-fg-subtle uppercase">Scroll to start the workflow</p>
            )}
          </div>
          {/* Faint scan lines over the screen */}
          <div className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent_0_3px,rgb(255_255_255/0.018)_3px_4px)]" />
        </div>
      </div>
      {/* Stand */}
      <div className="mx-auto h-6 w-24 bg-gradient-to-b from-ink-800 to-ink-900 [clip-path:polygon(18%_0,82%_0,100%_100%,0_100%)]" />
      <div className="mx-auto h-1.5 w-40 rounded-full bg-ink-800" />
    </div>
  );
}
