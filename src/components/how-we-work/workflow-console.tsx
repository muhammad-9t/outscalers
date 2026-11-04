import { CheckCircle2, FileCode2, FileText, FlaskConical, GitPullRequest, Lock, Rocket } from "lucide-react";
import { cn } from "@/lib/cn";

/** What the AI is doing at each step, and the control that bounds it there. */
export const aiStates = [
  { status: "Standby", note: "Waiting for an agreed brief" },
  { status: "Drafting", note: "Working inside the agreed scope" },
  { status: "Held", note: "Waiting for an engineer's approval" },
  { status: "Under test", note: "Every change is being checked" },
  { status: "Monitored", note: "Watched in production" },
];

// The controls that hold the AI; each one engages at its step and stays on
const controls = [
  { label: "Scope agreed", on: 0 },
  { label: "Engineer review", on: 2 },
  { label: "Tests passing", on: 3 },
  { label: "Monitoring", on: 4 },
];

// One file per step in the sidebar, highlighted while its step plays
export const files = [
  { name: "brief.md", Icon: FileText },
  { name: "export.ts", Icon: FileCode2 },
  { name: "PR #128", Icon: GitPullRequest },
  { name: "test run", Icon: FlaskConical },
  { name: "production", Icon: Rocket },
];

/**
 * The AI, drawn as a small core that changes with the step: dim on standby, spinning while it drafts,
 * locked inside a ring while an engineer reviews, swept by a scanner under test, and calm with a
 * heartbeat once it is monitored in production.
 */
export function AiCore({ step }: { step: number }) {
  return (
    <div aria-hidden className="relative grid size-28 place-items-center">
      {/* Outer ring: dashed and still on standby, turning while drafting */}
      <span
        className={cn(
          "absolute inset-0 rounded-full border transition-colors duration-700",
          step === 1 ? "animate-spin border-dashed border-brand-400/70 [animation-duration:6s]" : "border-line-strong",
          step === 0 && "border-dashed",
        )}
      />
      {/* Under test: a scanner sweeps round the core */}
      <span
        className={cn(
          "absolute inset-1 animate-spin rounded-full bg-[conic-gradient(from_0deg,transparent_0_75%,color-mix(in_oklab,var(--color-brand-400)_55%,transparent))] transition-opacity duration-700 [animation-duration:2.4s]",
          step === 3 ? "opacity-100" : "opacity-0",
        )}
      />
      {/* Review: a solid ring closes round the core, with a lock */}
      <span
        className={cn(
          "absolute inset-3 rounded-full border-2 border-human-accent transition-all duration-700",
          step === 2 ? "scale-100 opacity-100 shadow-[0_0_24px_-4px_var(--color-human-accent)]" : "scale-125 opacity-0",
        )}
      />
      <span
        className={cn(
          "absolute -top-1 grid size-7 place-items-center rounded-full border border-human-accent bg-ink-950 text-human-accent transition-all duration-700",
          step === 2 ? "translate-y-0 opacity-100" : "-translate-y-2 opacity-0",
        )}
      >
        <Lock className="size-3.5" />
      </span>

      {/* The core */}
      <span
        className={cn(
          "relative size-12 rounded-full bg-[radial-gradient(circle_at_35%_30%,var(--color-brand-200),var(--color-brand-500)_55%,var(--color-brand-700))] transition-all duration-700",
          step === 0 && "scale-90 opacity-40 saturate-50",
          step === 1 && "scale-110 shadow-[0_0_44px_8px_var(--color-brand-500)]",
          step === 2 && "scale-90 opacity-60",
          step === 3 && "shadow-[0_0_24px_2px_var(--color-brand-500)]",
          step === 4 && "shadow-[0_0_30px_4px_var(--color-brand-500)]",
        )}
      >
        {/* Drafting: the core pulses as it works */}
        {step === 1 && <span className="absolute inset-0 animate-ping rounded-full bg-brand-400/40 [animation-duration:1.8s]" />}
      </span>

      {/* Monitored: a heartbeat line under the core */}
      <svg
        viewBox="0 0 80 16"
        className={cn("absolute -bottom-3 h-4 w-20 transition-opacity duration-700", step === 4 ? "opacity-100" : "opacity-0")}
      >
        <path d="M0 8H26L30 2L35 14L39 8H80" fill="none" strokeWidth={1.5} className="stroke-brand-300" />
      </svg>
    </div>
  );
}

/** The assistant panel beside the editor: the AI's state and the controls holding it. */
export function AiPanel({ step }: { step: number }) {
  const s = aiStates[Math.max(0, step)];
  return (
    <div className="flex h-full flex-col border-l border-line bg-ink-900/60 p-4">
      <p className="font-mono text-[10px] tracking-[0.16em] text-fg-subtle uppercase">AI assistant</p>
      <div className="mt-4 grid place-items-center">
        <AiCore step={step} />
      </div>
      <div className="mt-6 text-center">
        <p key={step} className="font-mono text-xs tracking-[0.16em] text-brand-200 uppercase motion-safe:animate-[fade-up_0.4s_var(--ease-out-soft)_both]">
          {s.status}
        </p>
        <p className="mt-1 text-[11px] leading-snug text-fg-subtle">{s.note}</p>
      </div>

      <p className="mt-6 font-mono text-[10px] tracking-[0.16em] text-fg-subtle uppercase">Human controls</p>
      <ul className="mt-2 space-y-1.5">
        {controls.map((c) => {
          const on = step >= c.on;
          return (
            <li
              key={c.label}
              className={cn("flex items-center gap-2 text-[11px] transition-colors duration-500", on ? "text-fg" : "text-fg-subtle")}
            >
              <CheckCircle2 aria-hidden className={cn("size-3.5 shrink-0 transition-colors duration-500", on ? "text-brand-400" : "text-ink-700")} />
              {c.label}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
