import type { CSSProperties } from "react";
import {
  ArrowLeftRight,
  Building2,
  Check,
  Clock3,
  Flag,
  type LucideIcon,
  MessagesSquare,
  Rocket,
  UserPlus,
  UsersRound,
} from "lucide-react";
import { dedicated } from "@/content/dedicated";
import { ArrowLink, Reveal } from "@/components/ui/primitives";

/**
 * Home "Fast to start": Point A (your request) and Point B (developer starts) lead into a closed
 * envelope. Hovering (or focusing) it opens the flap and the four step cards jump out and fan; the
 * envelope's bottom fades into the page. Touch screens show it open. Phones get a plain grid.
 * Content: how a dedicated developer joins (terms confirmed by Outscalers). Styles: .env-* in globals.css.
 */

/** The four steps, on a 6-week track (start/end in weeks; end null = keeps going) */
const phases = [
  { id: "role", title: "Tell us the role", duration: "Stack, seniority, team size", detail: "You share the role you need.", start: 0, end: 0.4 },
  { id: "interview", title: "Interview candidates", duration: "You choose who joins", detail: "You interview our engineers and pick your team.", start: 0.4, end: 1 },
  { id: "start", title: "Developer starts", duration: "Your tools, hours and meetings", detail: "They join your team under your NDA and contract terms.", start: 1, end: 2 },
  { id: "trial", title: "1-month trial", duration: "Replacement if needed", detail: "Not the right fit? We replace them, even in the first week.", start: 2, end: null },
] as const;

const stats = [
  { value: "1–2 wks", label: "to start" },
  { value: "From 1", label: "developer" },
  { value: "1 month", label: "trial" },
];
const factors: { icon: LucideIcon; title: string }[] = [
  { icon: UsersRound, title: "100+ in-house engineers" },
  { icon: Building2, title: "Contract via Germany or Italy" },
  { icon: Clock3, title: "Your hours, your tools" },
  { icon: MessagesSquare, title: "Interview first" },
];

const steps = ["Day 1", "Week 1", "Week 1–2", "Month 1"];

/** Fan positions when open (centre x in % of the envelope, tilt) */
const fan = [
  { x: 14, r: -8, y: 1.4 },
  { x: 38, r: -2.5, y: 0 },
  { x: 62, r: 2.5, y: 0.2 },
  { x: 86, r: 8, y: 1.6 },
];

/** Look of each step card: icon, accent colour and the line at the bottom */
const cardStyle: { icon: LucideIcon; tone: "human" | "brand" | "data"; foot: string }[] = [
  { icon: Flag, tone: "human", foot: "You decide the profile" },
  { icon: MessagesSquare, tone: "brand", foot: "You interview" },
  { icon: UserPlus, tone: "brand", foot: "Under your NDA" },
  { icon: ArrowLeftRight, tone: "data", foot: "Free replacement" },
];

const WEEKS = 6;

export function LaunchEnvelope() {
  return (
    <div>
      {/* Heading */}
      <div data-reveal suppressHydrationWarning className="mx-auto max-w-3xl text-center">
        <p className="mx-auto mb-5 flex w-fit items-center gap-2 rounded-full border border-line-strong bg-ink-850 px-4 py-1.5 text-sm text-fg-muted shadow-sm">
          <Rocket aria-hidden className="size-4 text-brand-300" /> Dedicated developers
        </p>
        <h2 id="launch-title" className="text-display-lg font-semibold">
          Fast to{" "}
          <span aria-hidden className="env-title-tile">
            <Rocket className="size-[55%]" strokeWidth={1.8} />
          </span>{" "}
          start. <span className="env-title-fade">Never rushed.</span>
        </h2>
        <p className="mx-auto mt-5 max-w-xl text-lead text-fg-muted">
          Tell us the role today. Interview candidates this week. Your developer joins your team in 1–2 weeks.
        </p>
      </div>

      {/* Point A → envelope ← Point B */}
      <div data-reveal suppressHydrationWarning tabIndex={0} aria-label="How a dedicated developer joins your team" className="env mt-10">
        <div className="env-point env-point-a">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl border border-line-strong bg-ink-800 text-fg-muted">
            <Flag aria-hidden className="size-5" />
          </span>
          <span>
            <span className="block font-semibold text-fg">Point A</span>
            <span className="block text-sm text-fg-muted">Your request · day 1</span>
          </span>
        </div>
        <div className="env-point env-point-b">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-400 text-on-brand">
            <Rocket aria-hidden className="size-5" />
          </span>
          <span>
            <span className="block font-semibold text-fg">Point B</span>
            <span className="block text-sm text-fg-muted">Developer starts · in 1–2 weeks</span>
          </span>
        </div>
        <svg aria-hidden className="env-links" viewBox="0 0 100 100" preserveAspectRatio="none">
          <path d="M12 15 V30 H21 V49" vectorEffect="non-scaling-stroke" />
          <path d="M88 22 V34 H79 V49" vectorEffect="non-scaling-stroke" />
        </svg>

        <div className="env-body">
          <span aria-hidden className="env-back" />
          <ol className="env-papers">
            {phases.map((p, i) => (
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
                        <span className="text-xs font-medium text-fg-subtle">{steps[i]}</span>
                        <span aria-hidden className="ml-auto text-xs font-semibold text-fg-subtle">{i + 1}</span>
                      </span>
                      <h3 className="mt-3 text-lg font-semibold leading-snug">{p.title}</h3>
                      <span className="env-card-duration">{p.duration}</span>
                      {/* Where this step sits in the first weeks */}
                      <span aria-hidden className="env-card-track">
                        <span
                          className="env-card-seg"
                          data-open={p.end === null ? "" : undefined}
                          style={{ left: `${(p.start / WEEKS) * 100}%`, width: `${((end - p.start) / WEEKS) * 100}%` }}
                        />
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
            <div key={st.label} className="px-3 py-3 sm:px-5">
              <dt className="sr-only">{st.label}</dt>
              <dd className="font-display text-xl font-semibold whitespace-nowrap sm:text-3xl">{st.value}</dd>
              <dd aria-hidden className="text-sm text-fg-muted">{st.label}</dd>
            </div>
          ))}
        </dl>
        <ul className="flex flex-wrap gap-2.5 lg:justify-end">
          {factors.map((f) => (
            <li key={f.title} className="flex items-center gap-2 rounded-full border border-line bg-ink-850 px-4 py-2 font-semibold">
              <f.icon aria-hidden className="size-5 text-brand-300" /> {f.title}
            </li>
          ))}
        </ul>
      </Reveal>
      <div className="mt-5 flex flex-col items-center justify-between gap-3 sm:flex-row">
        <p className="text-xs text-fg-subtle">Typical timing. Start dates depend on the role and seniority.</p>
        <ArrowLink href={dedicated.path}>How dedicated developers work</ArrowLink>
      </div>
    </div>
  );
}
