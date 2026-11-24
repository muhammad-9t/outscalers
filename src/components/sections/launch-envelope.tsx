import type { CSSProperties } from "react";
import {
  CalendarCheck,
  Check,
  ClipboardList,
  CodeXml,
  Flag,
  FlaskConical,
  LayoutTemplate,
  type LucideIcon,
  Rocket,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { reviewGates, speedFactors, sprintDemos, timelinePhases } from "@/content/timeline";
import { Reveal } from "@/components/ui/primitives";

/**
 * Home "Speed to launch": Point A (kick-off) and Point B (v1.0 live) lead into a closed envelope.
 * Hovering (or focusing) it opens the flap and the four phase widgets jump out and fan; the
 * envelope's bottom fades into the page. Touch screens show it open. Phones get a plain grid.
 * Styles: .env-* in globals.css. The full chart lives on How We Work (launch-timeline.tsx).
 */

const stats = [
  { value: "6–16", label: "weeks to v1.0" },
  { value: "2 wks", label: "between demos" },
  { value: String(reviewGates.length), label: "human review gates" },
];
const factorIcons = [Sparkles, LayoutTemplate, FlaskConical, CalendarCheck];

const weeks = ["Week 0–2", "Week 2–12", "Week 12–14", "Week 14+"];
/** Fan positions when open (centre x in % of the envelope, tilt) */
const fan = [
  { x: 14, r: -8, y: 1.4 },
  { x: 38, r: -2.5, y: 0 },
  { x: 62, r: 2.5, y: 0.2 },
  { x: 86, r: 8, y: 1.6 },
];

/** Look of each phase card: icon, accent colour and the line at the bottom */
const cardStyle: { icon: LucideIcon; tone: "human" | "brand" | "data"; foot: string }[] = [
  { icon: ClipboardList, tone: "human", foot: "Human review gate" },
  { icon: CodeXml, tone: "brand", foot: "Demo every 2 weeks" },
  { icon: Rocket, tone: "brand", foot: "Human review gate" },
  { icon: TrendingUp, tone: "data", foot: "Improving with you" },
];
const WEEKS = 16;

export function LaunchEnvelope() {
  return (
    <div>
      {/* Heading */}
      <div data-reveal className="mx-auto max-w-3xl text-center">
        <p className="mx-auto mb-5 flex w-fit items-center gap-2 rounded-full border border-line-strong bg-ink-850 px-4 py-1.5 text-sm text-fg-muted shadow-sm">
          <Rocket aria-hidden className="size-4 text-brand-300" /> Speed to launch
        </p>
        <h2 id="launch-title" className="text-display-lg font-semibold">
          Fast to{" "}
          <span aria-hidden className="env-title-tile">
            <Rocket className="size-[55%]" strokeWidth={1.8} />
          </span>{" "}
          launch. <span className="env-title-fade">Never rushed.</span>
        </h2>
        <p className="mx-auto mt-5 max-w-xl text-lead text-fg-muted">
          AI takes on the repetitive groundwork, so working software arrives sooner — while every release still goes
          through human review and testing.
        </p>
      </div>

      {/* Point A → envelope ← Point B */}
      <div data-reveal tabIndex={0} aria-label="Typical timeline from kick-off to launch" className="env mt-10">
        <div className="env-point env-point-a">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl border border-line-strong bg-ink-800 text-fg-muted">
            <Flag aria-hidden className="size-5" />
          </span>
          <span>
            <span className="block font-semibold text-fg">Point A</span>
            <span className="block text-sm text-fg-muted">Your idea · week 0</span>
          </span>
        </div>
        <div className="env-point env-point-b">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-400 text-on-brand">
            <Rocket aria-hidden className="size-5" />
          </span>
          <span>
            <span className="block font-semibold text-fg">Point B</span>
            <span className="block text-sm text-fg-muted">v1.0 live in 6–16 weeks</span>
          </span>
        </div>
        <svg aria-hidden className="env-links" viewBox="0 0 100 100" preserveAspectRatio="none">
          <path d="M12 15 V30 H21 V49" vectorEffect="non-scaling-stroke" />
          <path d="M88 22 V34 H79 V49" vectorEffect="non-scaling-stroke" />
        </svg>

        <div className="env-body">
          <span aria-hidden className="env-back" />
          <ol className="env-papers">
            {timelinePhases.map((p, i) => (
              <li
                key={p.id}
                className="env-paper"
                data-tone={cardStyle[i].tone}
                style={{ "--i": i, "--x": `${fan[i].x}%`, "--r": `${fan[i].r}deg`, "--y": `${fan[i].y}rem` } as CSSProperties}
              >
                {(() => {
                  const c = cardStyle[i];
                  const end = p.end ?? WEEKS;
                  return (
                    <>
                      <span className="env-card-top">
                        <span className="env-card-icon" aria-hidden>
                          <c.icon className="size-4" />
                        </span>
                        <span className="text-xs font-medium text-fg-subtle">{weeks[i]}</span>
                        <span aria-hidden className="ml-auto text-xs font-semibold text-fg-subtle">{i + 1}</span>
                      </span>
                      <h3 className="mt-3 text-lg font-semibold leading-snug">{p.title}</h3>
                      <span className="env-card-duration">{p.duration}</span>
                      {/* Where this phase sits in a typical 16-week project */}
                      <span aria-hidden className="env-card-track">
                        <span
                          className="env-card-seg"
                          data-open={p.end === null ? "" : undefined}
                          style={{ left: `${(p.start / WEEKS) * 100}%`, width: `${((end - p.start) / WEEKS) * 100}%` }}
                        />
                        {i === 1 &&
                          sprintDemos.map((w) => (
                            <span key={w} className="env-card-demo" style={{ left: `${(w / WEEKS) * 100}%` }} />
                          ))}
                      </span>
                      <span className="env-card-foot">
                        <span className="env-card-check" aria-hidden>
                          <Check className="size-3" strokeWidth={3} />
                        </span>
                        {c.foot}
                      </span>
                    </>
                  );
                })()}
                <span className="sr-only">{p.detail}</span>
              </li>
            ))}
          </ol>
          {/* Front pocket and the flap that opens on hover */}
          <svg aria-hidden className="env-front" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path className="env-front-fill" d="M0 0 H100 V100 H0 Z" />
            <path className="env-fold" d="M0 100 L50 48 L100 100 M0 0 L44 52 M100 0 L56 52" vectorEffect="non-scaling-stroke" />
          </svg>
          <svg aria-hidden className="env-flap" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path d="M0 0 H100 L50 100 Z" vectorEffect="non-scaling-stroke" />
          </svg>
          <span aria-hidden className="env-hint">Hover to open</span>
          <span aria-hidden className="env-fade" />
        </div>
      </div>

      {/* Numbers and what makes it fast */}
      <Reveal className="mt-8 grid gap-4 lg:grid-cols-[auto_minmax(0,1fr)] lg:items-center">
        <dl className="grid grid-cols-3 divide-x divide-line rounded-card border border-line bg-ink-850">
          {stats.map((st) => (
            <div key={st.label} className="px-5 py-3">
              <dt className="sr-only">{st.label}</dt>
              <dd className="font-display text-2xl font-semibold sm:text-3xl">{st.value}</dd>
              <dd aria-hidden className="text-sm text-fg-muted">{st.label}</dd>
            </div>
          ))}
        </dl>
        <ul className="flex flex-wrap gap-2.5 lg:justify-end">
          {speedFactors.map((f, i) => {
            const Icon = factorIcons[i];
            return (
              <li key={f.title} className="flex items-center gap-2 rounded-full border border-line bg-ink-850 px-4 py-2 font-semibold" title={f.body}>
                <Icon aria-hidden className="size-5 text-brand-300" /> {f.title}
              </li>
            );
          })}
        </ul>
      </Reveal>
      <p className="mt-3 text-center text-xs text-fg-subtle lg:text-right">
        Typical ranges. Your timeline is agreed after discovery, based on scope.
      </p>
    </div>
  );
}
