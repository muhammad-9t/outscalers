import type { CSSProperties } from "react";
import { CalendarCheck, FlaskConical, LayoutTemplate, Sparkles } from "lucide-react";
import { reviewGates, speedFactors, sprintDemos, timelinePhases, type TimelinePhase } from "@/content/timeline";
import { Reveal, SectionHeading } from "@/components/ui/primitives";
import { RocketLaunch } from "@/components/illustrations/rocket-launch";
import { cn } from "@/lib/cn";

// Chart geometry (SVG user units).
const W = 760;
const X0 = 190;
const WEEKS = 16;
const PX = (W - X0 - 20) / WEEKS;
const ROW_Y0 = 78;
const ROW_GAP = 56;
const BAR_H = 26;

const x = (week: number) => X0 + week * PX;
const rowY = (i: number) => ROW_Y0 + i * ROW_GAP;

const barTone: Record<TimelinePhase["tone"], string> = {
  human: "fill-human-accent/20 stroke-human-accent",
  ai: "fill-brand-400/20 stroke-brand-400",
  neutral: "fill-ink-700 stroke-line-strong",
};

const factorIcons = [Sparkles, LayoutTemplate, FlaskConical, CalendarCheck];

function TimelineChart() {
  const height = rowY(timelinePhases.length - 1) + BAR_H + 40;
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
          <circle cx="3.5" cy="3.5" r="1" fill="#ff700e" fillOpacity="0.55" />
        </pattern>
      </defs>

      {/* Week grid */}
      {Array.from({ length: WEEKS / 2 + 1 }, (_, i) => i * 2).map((w) => (
        <g key={w}>
          <line x1={x(w)} y1={44} x2={x(w)} y2={height - 18} className="stroke-line" strokeDasharray="2 4" />
          <text x={x(w)} y={34} textAnchor="middle" className="fill-fg-subtle font-mono" fontSize={10}>
            {w === 0 ? "Week 0" : w}
          </text>
        </g>
      ))}

      {/* Human review gates between phases */}
      {reviewGates.map((w) => (
        <g key={w}>
          <line x1={x(w)} y1={52} x2={x(w)} y2={height - 18} className="stroke-human-accent/60" strokeWidth={1.4} strokeDasharray="4 4" />
          <circle cx={x(w)} cy={52} r={8} className="fill-ink-850 stroke-human-accent" strokeWidth={1.4} />
          <path d={`m${x(w) - 3.5} 52 2.5 2.5 4.5-5`} className="fill-none stroke-human-accent" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" />
        </g>
      ))}

      {/* Phases */}
      {timelinePhases.map((p, i) => {
        const y = rowY(i);
        const end = p.end ?? WEEKS;
        return (
          <g key={p.id}>
            <text x={0} y={y + 11} className="fill-fg font-sans" fontSize={14} fontWeight={600}>
              {p.title}
            </text>
            <text x={0} y={y + 28} className={cn("font-mono", p.tone === "ai" ? "fill-brand-300" : "fill-fg-subtle")} fontSize={11}>
              {p.duration}
            </text>
            <g className="grow-x" style={{ "--grow-delay": `${i * 180}ms` } as CSSProperties}>
              <rect
                x={x(p.start)}
                y={y}
                width={x(end) - x(p.start)}
                height={BAR_H}
                rx={8}
                className={barTone[p.tone]}
                strokeWidth={1.4}
                strokeDasharray={p.end === null ? "5 4" : undefined}
              />
              {p.tone === "ai" && (
                <rect x={x(p.start)} y={y} width={x(end) - x(p.start)} height={BAR_H} rx={8} fill="url(#lt-ai-dots)" />
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
                x={x(w) - 6}
                y={cy - 6}
                width={12}
                height={12}
                transform={`rotate(45 ${x(w)} ${cy})`}
                className="fill-ink-950 stroke-brand-200"
                strokeWidth={1.6}
              />
              {i === 0 && (
                <text x={x(w)} y={cy - 14} textAnchor="middle" className="fill-brand-200 font-mono" fontSize={10}>
                  demo
                </text>
              )}
            </g>
          );
        })}
    </svg>
  );
}

/** "Speed to launch": typical timeline chart plus what makes delivery fast. */
export function LaunchTimeline({ headingId = "launch-title" }: { headingId?: string }) {
  return (
    <div>
      <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_1fr] lg:gap-16">
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
        <Reveal delay={120} className="mx-auto w-full max-w-[16rem] lg:mr-0 lg:max-w-[19rem]">
          <RocketLaunch />
        </Reveal>
      </div>

      {/* Chart (tablet and up) */}
      <Reveal className="card mt-12 hidden p-6 md:block lg:p-8">
        <TimelineChart />
        <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-line pt-5 text-sm text-fg-muted">
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
      <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {speedFactors.map((f, i) => {
          const Icon = factorIcons[i % factorIcons.length];
          return (
            <Reveal as="li" key={f.title} delay={i * 70} className="card-flat p-5">
              <Icon aria-hidden className="size-5 text-brand-300" />
              <h3 className="mt-4 font-semibold">{f.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-fg-muted">{f.body}</p>
            </Reveal>
          );
        })}
      </ul>
    </div>
  );
}
