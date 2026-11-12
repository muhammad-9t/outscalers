import type { CSSProperties } from "react";
import { ShieldCheck } from "lucide-react";
import { processPhases } from "@/content/process";
import { cn } from "@/lib/cn";

function Meter({ label, value, tone }: { label: string; value: number; tone: "human" | "ai" }) {
  return (
    <div className="flex items-center gap-2">
      <span className={cn("font-mono text-[11px] uppercase tracking-wide", tone === "human" ? "text-human-accent" : "text-brand-300")}>
        {label}
      </span>
      <span className="flex gap-0.5" aria-hidden>
        {[1, 2, 3].map((n) => (
          <span
            key={n}
            className={cn(
              "h-1.5 w-4 rounded-full",
              n <= value ? (tone === "human" ? "bg-human-accent/80" : "bg-brand-400/80") : "bg-ink-700",
            )}
          />
        ))}
      </span>
    </div>
  );
}

const levels = ["", "light", "moderate", "high"];

/** Six-phase delivery model with people/AI involvement meters and the human checkpoint for each phase. */
export function DeliveryModel() {
  return (
    <div>
      <div data-reveal className="mb-5 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-fg-muted">
        <span className="flex items-center gap-2">
          <span aria-hidden className="h-1.5 w-6 rounded-full bg-human-accent/80" /> People: lead and decide in every phase
        </span>
        <span className="flex items-center gap-2">
          <span aria-hidden className="h-1.5 w-6 rounded-full bg-brand-400/80" /> AI: assists where it adds value
        </span>
      </div>
      {/* One table-like panel: phase | involvement | human checkpoint. The full phase write-ups live on How We Work. */}
      <div data-reveal className="panel overflow-hidden rounded-card border border-line">
        <div
          aria-hidden
          className="hidden border-b border-line bg-ink-800/60 px-5 py-2.5 font-mono text-[11px] tracking-[0.18em] text-fg-subtle uppercase lg:grid lg:grid-cols-[minmax(0,1.15fr)_15rem_minmax(0,1fr)] lg:gap-8"
        >
          <span>Phase</span>
          <span>Involvement</span>
          <span>Human checkpoint</span>
        </div>
        <ol className="divide-y divide-line">
          {processPhases.map((p, i) => (
            <li
              key={p.id}
              style={{ "--reveal-delay": `${i * 60}ms` } as CSSProperties}
              className="grid gap-x-8 gap-y-2 px-5 py-3.5 transition-colors duration-300 hover:bg-ink-800/60 lg:grid-cols-[minmax(0,1.15fr)_15rem_minmax(0,1fr)] lg:items-center"
            >
              <div className="flex items-baseline gap-2.5">
                <span className="font-mono text-xs text-brand-300">0{i + 1}</span>
                <h3 className="text-lg font-semibold">{p.title}</h3>
              </div>
              <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
                <Meter label="People" value={3} tone="human" />
                <Meter label="AI" value={p.aiWeight} tone="ai" />
                <p className="sr-only">
                  People lead this phase. AI involvement is {levels[p.aiWeight]}.
                </p>
              </div>
              <p className="flex items-start gap-2 text-sm text-fg">
                <ShieldCheck aria-hidden className="mt-0.5 size-4 shrink-0 text-brand-400" />
                <span>
                  <span className="sr-only">Checkpoint: </span>
                  {p.checkpoint}
                </span>
              </p>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
