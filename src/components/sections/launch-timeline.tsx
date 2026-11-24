import { Fragment, type CSSProperties } from "react";
import { CalendarCheck, Compass, FlaskConical, Hammer, LayoutTemplate, LifeBuoy, Rocket, Sparkles, UserCheck } from "lucide-react";
import { reviewGates, speedFactors, sprintDemos, timelinePhases, type TimelinePhase } from "@/content/timeline";
import { Reveal, SectionHeading } from "@/components/ui/primitives";

const phaseTone: Record<TimelinePhase["tone"], "human" | "brand" | "data"> = { human: "human", ai: "brand", neutral: "data" };
const phaseIcons: Record<string, typeof Compass> = { discovery: Compass, build: Hammer, launch: Rocket, support: LifeBuoy };
const factorIcons = [Sparkles, LayoutTemplate, FlaskConical, CalendarCheck];
const factorTones = ["brand", "human", "data", "brand"] as const;

/** One short line per phase (the longer descriptions live in content/timeline for other uses). */
const shortDetail: Record<string, string> = {
  discovery: "Scope, risks and plan agreed with you.",
  build: "Two-week sprints, a demo after each.",
  launch: "Deployed, monitored and handed over.",
  support: "Updates and new features as you grow.",
};

const stats = [
  { value: "6–16", label: "weeks to v1.0" },
  { value: "2 wks", label: "between demos" },
  { value: String(reviewGates.length), label: "human review gates" },
];

/**
 * "Speed to launch": the typical timeline as a track of phase cards with a human review gate
 * between each one, plus a row of chips for what makes delivery fast. Kept short on purpose.
 * Styles: .lt-* in globals.css.
 */
export function LaunchTimeline({ headingId = "launch-title" }: { headingId?: string }) {
  return (
    <div>
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end lg:gap-16">
        <div>
          <SectionHeading id={headingId} eyebrow="Speed to launch" title="Fast to launch. Never rushed." />
          <Reveal delay={80}>
            <p className="mt-5 max-w-xl text-lead text-fg-muted">AI does the groundwork. People review every release.</p>
          </Reveal>
        </div>
        <Reveal as="dl" delay={120} className="grid grid-cols-3 gap-3">
          {stats.map((st) => (
            <div key={st.label} className="lt-stat">
              <dt className="sr-only">{st.label}</dt>
              <dd className="font-display text-2xl font-semibold sm:text-3xl">{st.value}</dd>
              <dd aria-hidden className="mt-1 text-sm leading-snug text-fg-muted">
                {st.label}
              </dd>
            </div>
          ))}
        </Reveal>
      </div>

      {/* Phase track, with a review gate between phases */}
      <Reveal as="ol" className="lt-track mt-12" aria-label="Typical project timeline">
        {timelinePhases.map((p, i) => {
          const tone = phaseTone[p.tone];
          const Icon = phaseIcons[p.id] ?? Compass;
          return (
            <Fragment key={p.id}>
              {i > 0 && (
                <li className="lt-gate" style={{ "--i": i * 2 - 1 } as CSSProperties}>
                  <span className="lt-gate-badge" aria-hidden>
                    <UserCheck className="size-4" />
                  </span>
                  <span className="lt-gate-label">Review gate</span>
                </li>
              )}
              <li className="lt-phase" data-tone={tone} data-wide={p.id === "build" || undefined} style={{ "--i": i * 2 } as CSSProperties}>
                <div className="flex items-center justify-between gap-3">
                  <span className="hs-gloss lt-tile" data-tone={tone} aria-hidden>
                    <Icon className="size-[48%]" strokeWidth={1.8} />
                  </span>
                  <span className="lt-duration">{p.duration}</span>
                </div>
                <h3 className="mt-5 text-xl font-semibold">{p.title}</h3>
                <p className="mt-2 text-[0.9375rem] leading-relaxed text-fg-muted">{shortDetail[p.id] ?? p.detail}</p>
                {p.id === "build" && (
                  <span className="mt-4 flex items-center gap-1.5" aria-hidden>
                    {sprintDemos.map((w) => (
                      <span key={w} className="lt-demo" />
                    ))}
                  </span>
                )}
              </li>
            </Fragment>
          );
        })}
      </Reveal>
      <p className="mt-4 text-sm text-fg-subtle">Typical ranges. Your timeline is agreed after discovery, based on scope.</p>

      {/* What makes it fast: one row of chips */}
      <Reveal as="ul" delay={80} className="mt-10 flex flex-wrap items-center gap-3" aria-label="What makes it fast">
        {speedFactors.map((f, i) => {
          const Icon = factorIcons[i % factorIcons.length];
          return (
            <li key={f.title} className="lt-factor">
              <span className="hs-gloss lt-tile-sm" data-tone={factorTones[i % factorTones.length]} aria-hidden>
                <Icon className="size-[50%]" strokeWidth={1.8} />
              </span>
              {f.title}
            </li>
          );
        })}
      </Reveal>
    </div>
  );
}
