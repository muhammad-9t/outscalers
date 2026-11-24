import type { CSSProperties, ReactNode } from "react";
import { CalendarDays, Check, Laptop, MessageSquare, Rocket, UserRound, UsersRound } from "lucide-react";

/*
 * One animated widget per stage of "Your first month" (Dedicated developers page). Built from the
 * How We Work widget styles (.phw-*): every moving part has `data-a` (the animation) and `--d` (its
 * delay), and only animates while its panel is active in the horizontal scroll. No invented numbers.
 */

const d = (s: number, extra?: CSSProperties) => ({ "--d": `${s}s`, ...extra }) as CSSProperties;

function Frame({ title, aside, className, children }: { title: string; aside?: ReactNode; className?: string; children: ReactNode }) {
  return (
    <div className={`phw ${className ?? ""}`} data-a="rise" style={d(0)}>
      <div className="phw-head">
        <span className="font-semibold">{title}</span>
        {aside}
      </div>
      {children}
    </div>
  );
}

/** A list whose items tick green one after another */
function Ticks({ items, start = 0.4 }: { items: { k: string; v?: string }[]; start?: number }) {
  return (
    <ul className="phw-suites">
      {items.map((s, i) => (
        <li key={s.k}>
          <span className="phw-tick" data-a="tick" style={d(start + i * 0.3)}>
            <Check className="size-3" strokeWidth={3.5} />
          </span>
          <span className="flex-1">{s.k}</span>
          {s.v && <span className="text-xs text-fg-muted">{s.v}</span>}
        </li>
      ))}
    </ul>
  );
}

function Note({ who, children, at }: { who: ReactNode; children: ReactNode; at: number }) {
  return (
    <div className="phw-log" data-a="slide" style={d(at)}>
      <span className="phw-avatar">{who}</span>
      <span className="text-sm">{children}</span>
    </div>
  );
}

/** 1. Day 1: the setup checklist ticks off, then "Ready". */
export function OnboardingWidget() {
  return (
    <Frame title="Day 1 checklist" aside={<span className="phw-chip"><Laptop className="size-3" /> Laptop from us</span>}>
      <Ticks items={[{ k: "NDA signed" }, { k: "Laptop set up" }, { k: "Slack invite accepted" }, { k: "Jira & GitHub access" }]} />
      <span className="phw-stamp" data-a="stamp" style={d(1.8)}>
        <Check className="size-4" strokeWidth={3} /> Ready to start
      </span>
    </Frame>
  );
}

/** 2. Week 1: small tickets land on the board, the first pull request is reviewed by your lead. */
export function FirstTasksWidget() {
  const notes = [
    { k: "Ticket", t: "Fix the search filter", tone: "human", r: "-4deg" },
    { k: "Ticket", t: "Add missing tests", tone: "brand", r: "3deg" },
    { k: "Docs", t: "Local setup guide", tone: "data", r: "-2deg" },
  ];
  return (
    <Frame title="Week 1 board" aside={<span className="phw-chip">Small tickets first</span>} className="phw-disc">
      <div className="phw-notes">
        {notes.map((n, i) => (
          <span key={n.t} className="phw-note" data-tone={n.tone} data-a="drop" style={d(0.35 + i * 0.18, { "--r": n.r } as CSSProperties)}>
            <b>{n.k}</b>
            {n.t}
          </span>
        ))}
      </div>
      <Note who={<MessageSquare className="size-3.5" />} at={1.1}>
        <b className="font-semibold">Your lead:</b> first pull request reviewed and merged.
      </Note>
    </Frame>
  );
}

/** 3. Every day: a day in your calendar, in your time zone. */
export function RhythmWidget() {
  return (
    <Frame title="Today, your time zone" aside={<span className="phw-chip"><CalendarDays className="size-3" /> Your calendar</span>}>
      <Ticks items={[{ k: "Team stand-up", v: "Morning" }, { k: "Feature work", v: "Focus time" }, { k: "Code review", v: "Afternoon" }, { k: "Sync with design", v: "Late" }]} />
      <Note who={<UserRound className="size-3.5" />} at={1.7}>
        Same tools, same meetings as the rest of your team.
      </Note>
    </Frame>
  );
}

/** 4. Every week: our PM's check-in with you. */
export function CheckInWidget() {
  return (
    <Frame title="Weekly check-in" aside={<span className="phw-chip" data-tone="brand">Our PM</span>} className="phw-review">
      <Ticks items={[{ k: "Delivery on track" }, { k: "Your feedback shared" }, { k: "Next week planned" }]} />
      <div className="phw-comment" data-a="pop" style={d(1.4)}>
        <span className="phw-avatar">
          <MessageSquare className="size-3.5" />
        </span>
        <span className="text-sm">Anything we should change? <b className="font-semibold">Tell us any time.</b></span>
      </div>
    </Frame>
  );
}

/** 5. Month 1: the trial review, with your three options. */
export function TrialWidget() {
  const options = [
    { k: "Continue", tone: "human" },
    { k: "Adjust", tone: "brand" },
    { k: "Replace (free)", tone: "data" },
  ];
  return (
    <Frame title="1-month review" aside={<span className="phw-chip">Your decision</span>}>
      <div className="flex flex-wrap gap-2 py-2">
        {options.map((o, i) => (
          <span key={o.k} className="phw-note" data-tone={o.tone} data-a="pop" style={d(0.4 + i * 0.2, { "--r": "0deg" } as CSSProperties)}>
            {o.k}
          </span>
        ))}
      </div>
      <span className="phw-stamp phw-stamp-big" data-a="stamp" style={d(1.4)}>
        <Check className="size-5" strokeWidth={3} /> Continue
      </span>
    </Frame>
  );
}

/** 6. After that: the team grows with you; one monthly invoice. */
export function LongTermWidget() {
  const stages = [
    { k: "Month 1", icon: UserRound },
    { k: "Month 6", icon: UsersRound },
    { k: "Ongoing", icon: Rocket },
  ];
  return (
    <Frame title="Your team" aside={<span className="phw-live" data-a="pop" style={d(1.9)}>Growing</span>} className="phw-deploy">
      <div className="phw-pipe">
        <span className="phw-pipe-track">
          <span data-a="fill" style={d(0.3, { "--dur": "1.5s" } as CSSProperties)} />
        </span>
        {stages.map((s, i) => (
          <span key={s.k} className="phw-stage" data-a="light" style={d(0.3 + i * 0.7)}>
            <span className="phw-stage-dot">
              <s.icon className="size-4" />
            </span>
            {s.k}
          </span>
        ))}
      </div>
      <Note who={<UserRound className="size-3.5" />} at={2.3}>
        One monthly invoice, in EUR, USD or GBP.
      </Note>
    </Frame>
  );
}

export const journeyWidgets = [OnboardingWidget, FirstTasksWidget, RhythmWidget, CheckInWidget, TrialWidget, LongTermWidget];
