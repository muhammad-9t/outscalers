import type { CSSProperties } from "react";
import { CalendarCheck, FlaskConical, LayoutTemplate, Sparkles } from "lucide-react";
import { reviewGates, speedFactors, sprintDemos, timelinePhases, type TimelinePhase } from "@/content/timeline";
import { Reveal, SectionHeading } from "@/components/ui/primitives";
import { cn } from "@/lib/cn";

// Chart geometry (SVG user units).
const W = 760;
const X0 = 190;
const WEEKS = 16;
const PX = (W - X0 - 20) / WEEKS;
const ROW_Y0 = 58;
const ROW_GAP = 42;
const BAR_H = 20;

const x = (week: number) => X0 + week * PX;
const rowY = (i: number) => ROW_Y0 + i * ROW_GAP;

const barTone: Record<TimelinePhase["tone"], string> = {
  human: "fill-human-accent/20 stroke-human-accent",
  ai: "fill-brand-400/20 stroke-brand-400",
  neutral: "fill-ink-700 stroke-line-strong",
};

const factorIcons = [Sparkles, LayoutTemplate, FlaskConical, CalendarCheck];

// Headline numbers from the timeline: discovery + build + launch, the demo cadence, and the review gates
const stats = [
  { value: "6–16", label: "weeks to v1.0" },
  { value: "2 wks", label: "between demos" },
  { value: String(reviewGates.length), label: "human review gates" },
];

function TimelineChart() {
  const height = rowY(timelinePhases.length - 1) + BAR_H + 16;
  const launchRow = timelinePhases.findIndex((p) => p.id === "launch");
  const buildRow = timelinePhases.findIndex((p) => p.id === "build");

  return (
    <svg
      viewBox={`0 0 ${W} ${height}`}
      role="img"
      aria-labelledby="lt-title lt-desc"
      className="h-auto w-full"
    >
      <title id="lt-title">Typical project timeline</title>
      <desc id="lt-desc">
        {timelinePhases.map((p) => `${p.title}: ${p.duration}.`).join(" ")} Working demos every two weeks during the build,
        and a human review gate between each phase.
      </desc>
      <defs>
        <pattern id="lt-ai-dots" width="7" height="7" patternUnits="userSpaceOnUse">
          <circle cx="3.5" cy="3.5" r="1" className="fill-brand-400" fillOpacity="0.55" />
        </pattern>
      </defs>

      {/* Week grid */}
      {Array.from({ length: WEEKS / 2 + 1 }, (_, i) => i * 2).map((w) => (
        <g key={w}>
          <line x1={x(w)} y1={30} x2={x(w)} y2={height - 6} className="stroke-line" strokeDasharray="2 4" />
          <text x={x(w)} y={20} textAnchor="middle" className="fill-fg-subtle font-mono" fontSize={10}>
            {w === 0 ? "Week 0" : w}
          </text>
        </g>
      ))}

      {/* Human review gates between phases */}
      {reviewGates.map((w) => (
        <g key={w}>
          <line x1={x(w)} y1={38} x2={x(w)} y2={height - 6} className="stroke-human-accent/60" strokeWidth={1.4} strokeDasharray="4 4" />
          <circle cx={x(w)} cy={38} r={8} className="fill-ink-850 stroke-human-accent" strokeWidth={1.4} />
          <path d={`m${x(w) - 3.5} 38 2.5 2.5 4.5-5`} className="fill-none stroke-human-accent" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" />
        </g>
      ))}

      {/* Phases */}
      {timelinePhases.map((p, i) => {
        const y = rowY(i);
        const end = p.end ?? WEEKS;
        return (
          <g key={p.id}>
            <text x={0} y={y + 6} className="fill-fg font-sans" fontSize={14} fontWeight={600}>
              {p.title}
            </text>
            <text x={0} y={y + 22} className={cn("font-mono", p.tone === "ai" ? "fill-brand-300" : "fill-fg-subtle")} fontSize={11}>
              {p.duration}
            </text>
            <g className="grow-x" style={{ "--grow-delay": `${i * 180}ms` } as CSSProperties}>
              <rect
                x={x(p.start)}
                y={y}
                width={x(end) - x(p.start)}
                height={BAR_H}
                rx={6}
                className={barTone[p.tone]}
                strokeWidth={1.4}
                strokeDasharray={p.end === null ? "5 4" : undefined}
              />
              {p.tone === "ai" && (
                <rect x={x(p.start)} y={y} width={x(end) - x(p.start)} height={BAR_H} rx={6} fill="url(#lt-ai-dots)" />
              )}
              {p.end === null && (
                <path d={`M${x(end) - 2} ${y + BAR_H / 2}h14m-5-5 5 5-5 5`} className="fill-none stroke-fg-subtle" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" />
              )}
            </g>
          </g>
        );
      })}

      {/* Sprint demos on the build bar */}
      {buildRow >= 0 &&
        sprintDemos.map((w, i) => {
          const cy = rowY(buildRow) + BAR_H / 2;
          return (
            <g key={w}>
              <rect
                x={x(w) - 5}
                y={cy - 5}
                width={10}
                height={10}
                transform={`rotate(45 ${x(w)} ${cy})`}
                className="fill-ink-950 stroke-brand-200"
                strokeWidth={1.6}
              />
              {i === 0 && (
                <text x={x(w)} y={cy - 13} textAnchor="middle" className="fill-brand-200 font-mono" fontSize={10}>
                  demo
                </text>
              )}
            </g>
          );
        })}

      {/* v1.0: a small rocket lifting off at the end of the launch phase */}
      {launchRow >= 0 && <Rocket cx={x(13.1)} cy={rowY(launchRow) - 18} />}
      {launchRow >= 0 && (
        <g transform={`translate(${x(14) + 6} ${rowY(launchRow) - 30})`}>
          <rect width={80} height={18} rx={9} className="fill-ink-850 stroke-brand-400/50" />
          <circle cx={11} cy={9} r={2.5} className="fill-brand-400 motion-safe:animate-[pulse-soft_1.6s_ease-in-out_infinite]" />
          <text x={47} y={12.5} textAnchor="middle" className="fill-brand-200 font-mono" fontSize={9.5}>
            v1.0 live
          </text>
        </g>
      )}
    </svg>
  );
}

function Rocket({ cx, cy }: { cx: number; cy: number }) {
  return (
    <g aria-hidden className="anim-rocket">
      <path
        d={`M${cx - 2.5} ${cy + 9}Q${cx} ${cy + 20} ${cx + 2.5} ${cy + 9}Z`}
        className="anim-flame fill-brand-300 drop-shadow-[0_0_4px_var(--color-brand-400)]"
      />
      <path
        d={`M${cx - 4} ${cy + 3}L${cx - 8} ${cy + 10}L${cx - 4} ${cy + 8}ZM${cx + 4} ${cy + 3}L${cx + 8} ${cy + 10}L${cx + 4} ${cy + 8}Z`}
        className="fill-brand-400"
      />
      <path
        d={`M${cx} ${cy - 14}C${cx + 5} ${cy - 9} ${cx + 5} ${cy + 2} ${cx + 4} ${cy + 9}H${cx - 4}C${cx - 5} ${cy + 2} ${cx - 5} ${cy - 9} ${cx} ${cy - 14}Z`}
        className="fill-ink-850 stroke-brand-400"
        strokeWidth={1.4}
      />
      <circle cx={cx} cy={cy - 3} r={2} className="fill-ink-950 stroke-human-accent" strokeWidth={1.2} />
    </g>
  );
}

/** "Speed to launch": typical timeline chart plus what makes delivery fast. */
export function LaunchTimeline({ headingId = "launch-title" }: { headingId?: string }) {
  return (
    <div>
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end lg:gap-16">
        <div>
          <SectionHeading
            id={headingId}
            eyebrow="Speed to launch"
            title="Fast to launch. Never rushed."
          />
          <Reveal delay={80}>
            <p className="mt-5 max-w-xl text-lead text-fg-muted">
              AI takes on the repetitive groundwork, so working software arrives sooner — while every release still
              goes through human review and testing.
            </p>
          </Reveal>
        </div>
        <Reveal as="dl" delay={120} className="grid grid-cols-3 gap-3">
          {stats.map((st) => (
            <div key={st.label} className="card-flat px-4 py-3.5 sm:min-w-[9.5rem]">
              <dt className="sr-only">{st.label}</dt>
              <dd className="font-display text-2xl font-semibold sm:text-3xl">{st.value}</dd>
              <dd aria-hidden className="mt-1 text-sm leading-snug text-fg-muted">{st.label}</dd>
            </div>
          ))}
        </Reveal>
      </div>

      {/* Chart (tablet and up) */}
      <Reveal className="card mt-8 hidden p-5 md:block lg:p-6">
        <TimelineChart />
        <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-line pt-4 text-sm text-fg-muted">
          <span className="flex items-center gap-2">
            <span aria-hidden className="h-3 w-6 rounded-sm border border-brand-400 bg-brand-400/20" /> AI-assisted build
          </span>
          <span className="flex items-center gap-2">
            <span aria-hidden className="size-2.5 rotate-45 border-[1.5px] border-brand-200" /> Working demo
          </span>
          <span className="flex items-center gap-2">
            <span aria-hidden className="h-3 w-px border-l border-dashed border-human-accent" /> Human review gate
          </span>
          <span className="ml-auto text-xs text-fg-subtle">
            Typical ranges. Your timeline is agreed after discovery, based on scope.
          </span>
        </div>
      </Reveal>

      {/* Vertical timeline (phones) */}
      <ol className="mt-10 space-y-0 border-l border-line-strong pl-6 md:hidden">
        {timelinePhases.map((p) => (
          <li key={p.id} className="relative pb-7 last:pb-0">
            <span
              aria-hidden
              className={cn(
                "absolute -left-[1.95rem] top-1 size-3 rounded-full border-2 border-ink-850",
                p.tone === "human" ? "bg-human-accent" : p.tone === "ai" ? "bg-brand-400" : "bg-fg-subtle",
              )}
            />
            <p className="font-mono text-xs uppercase tracking-wider text-brand-300">{p.duration}</p>
            <h3 className="mt-1 text-lg font-semibold">{p.title}</h3>
            <p className="mt-1 text-[0.9375rem] leading-relaxed text-fg-muted">{p.detail}</p>
          </li>
        ))}
        <li className="pt-4 text-xs text-fg-subtle">Typical ranges. Your timeline is agreed after discovery, based on scope.</li>
      </ol>

      {/* What makes it fast */}
      <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {speedFactors.map((f, i) => {
          const Icon = factorIcons[i % factorIcons.length];
          return (
            <Reveal as="li" key={f.title} delay={i * 70} className="card-flat flex gap-3 p-4">
              <Icon aria-hidden className="mt-0.5 size-5 shrink-0 text-brand-300" />
              <div>
                <h3 className="font-semibold">{f.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-fg-muted">{f.body}</p>
              </div>
            </Reveal>
          );
        })}
      </ul>
    </div>
  );
}
