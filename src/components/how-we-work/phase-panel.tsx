import { ShieldCheck, Sparkles, UserRound } from "lucide-react";
import type { ProcessPhase } from "@/content/process";
import { cn } from "@/lib/cn";

const aiLevel = ["", "Low", "Medium", "High"];

/** Three segments: how much of the phase rests on people or on AI. */
function Meter({ label, value, note, tone }: { label: string; value: number; note: string; tone: "human" | "ai" }) {
  return (
    <div>
      <p className="flex justify-between gap-4 font-mono text-[10px] tracking-[0.16em] text-fg-subtle uppercase">
        {label}
        <span className={tone === "human" ? "text-human-accent" : "text-brand-300"}>{note}</span>
      </p>
      <div className="mt-2 grid grid-cols-3 gap-1">
        {[1, 2, 3].map((n) => (
          <span
            key={n}
            className={cn(
              "h-1.5 rounded-full",
              n <= value ? (tone === "human" ? "bg-human-accent" : "bg-brand-400 shadow-[0_0_8px_var(--color-brand-400)]") : "bg-ink-700",
            )}
          />
        ))}
      </div>
    </div>
  );
}

/**
 * One delivery phase as a full-screen HUD panel, in the style of the service panels: who leads,
 * what AI assists with, and the checkpoint that closes the phase. A slide in the phases horizontal scroll.
 */
export function PhasePanel({ phase: p, index, total }: { phase: ProcessPhase; index: number; total: number }) {
  const n = String(index + 1).padStart(2, "0");
  return (
    <li className="relative w-full shrink-0 overflow-hidden border-b border-line py-16 sm:py-20 lg:flex lg:h-full lg:items-center lg:border-b-0 lg:py-0 lg:pt-18">
      <div
        aria-hidden
        className="bg-grid pointer-events-none absolute inset-0 opacity-70 mask-[radial-gradient(ellipse_70%_65%_at_60%_50%,black,transparent)]"
      />
      {/* Oversized index behind the content */}
      <span
        aria-hidden
        className="pointer-events-none absolute -right-6 bottom-0 font-display text-[clamp(10rem,24vw,22rem)] leading-none font-semibold text-fg/[0.03] select-none"
      >
        {n}
      </span>

      <div className="container-site relative grid w-full items-center gap-12 lg:grid-cols-[1fr_1.1fr] lg:gap-20">
        <div>
          <p className="font-mono text-[11px] tracking-[0.18em] text-brand-300 uppercase">
            {`Phase ${n} / ${String(total).padStart(2, "0")} // ${p.short}`}
          </p>
          <h3 className="mt-6 text-display-lg font-semibold">{p.title}</h3>
          <p className="mt-5 max-w-xl text-lead text-fg-muted">{p.summary}</p>

          <div className="mt-10 grid max-w-sm gap-5">
            <Meter label="People" value={3} note="Lead" tone="human" />
            <Meter label="AI involvement" value={p.aiWeight} note={aiLevel[p.aiWeight]} tone="ai" />
          </div>
        </div>

        {/* Who does what, as a framed HUD readout */}
        <div className="relative border border-line bg-ink-950/60 backdrop-blur-sm">
          <span aria-hidden className="absolute -top-px -left-px size-3 border-t-2 border-l-2 border-brand-400" />
          <span aria-hidden className="absolute -right-px -bottom-px size-3 border-r-2 border-b-2 border-brand-400" />
          <span aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-px overflow-hidden">
            <span className="block h-full w-1/3 bg-brand-400/70 motion-safe:animate-[hud-scan_3.2s_ease-in-out_infinite]" />
          </span>

          <div className="grid gap-8 p-6 sm:grid-cols-2 sm:p-7">
            <div>
              <h4 className="chip chip-human">
                <UserRound aria-hidden className="size-3.5" /> People
              </h4>
              <ul className="mt-4 space-y-3 text-[0.9375rem]">
                {p.human.map((h) => (
                  <li key={h} className="flex gap-2.5">
                    <span aria-hidden className="mt-2 size-1.5 shrink-0 rounded-full bg-human-accent" />
                    {h}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="chip chip-ai">
                <Sparkles aria-hidden className="size-3.5" /> AI assists
              </h4>
              <ul className="mt-4 space-y-3 text-[0.9375rem] text-fg-muted">
                {p.ai.map((a) => (
                  <li key={a} className="flex gap-2.5">
                    <span aria-hidden className="mt-2 size-1.5 shrink-0 rounded-full bg-brand-400" />
                    {a}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <p className="flex items-center gap-2.5 border-t border-line bg-ink-900/60 px-6 py-4 text-sm sm:px-7">
            <ShieldCheck aria-hidden className="size-4 shrink-0 text-brand-400" />
            <span className="font-mono text-xs tracking-wider text-fg-subtle uppercase">Checkpoint</span>
            <span>{p.checkpoint}</span>
          </p>
        </div>
      </div>
    </li>
  );
}
