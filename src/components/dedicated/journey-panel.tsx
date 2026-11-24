import type { CSSProperties } from "react";
import {
  Building2,
  CalendarCheck,
  ListTodo,
  type LucideIcon,
  MessagesSquare,
  Repeat,
  TrendingUp,
  UserPlus,
  UserRound,
} from "lucide-react";
import type { dedicated } from "@/content/dedicated";
import { journeyWidgets } from "./journey-widgets";

type Stage = (typeof dedicated.journey)[number];

const icons: Record<string, LucideIcon> = {
  onboarding: UserPlus,
  "first-tasks": ListTodo,
  rhythm: Repeat,
  "check-in": MessagesSquare,
  trial: CalendarCheck,
  "long-term": TrendingUp,
};

/** Same six layouts as the How We Work phase panels (styles: .php-*), so the lamp light falls the same way */
const layouts = ["split", "split-rev", "split-tilt", "split-rev-tilt", "split-wide", "split-rev-wide"] as const;

/** One stage of "Your first month" as a full-screen slide: title, what you do, what we do, and a widget. */
export function JourneyPanel({ stage: s, index, total }: { stage: Stage; index: number; total: number }) {
  const Icon = icons[s.id] ?? UserPlus;
  const Widget = journeyWidgets[index] ?? journeyWidgets[0];
  const t = (sec: number) => ({ "--d": `${sec}s` }) as CSSProperties;

  return (
    <li className="php relative w-full shrink-0" data-layout={layouts[index % layouts.length]}>
      <div className="container-site php-inner">
        <div className="php-head">
          <div className="php-kicker" data-a="rise" style={t(0)}>
            <span className="hs-gloss php-tile" data-tone={index % 2 ? "brand" : "human"} aria-hidden>
              <Icon className="size-[48%]" strokeWidth={1.8} />
            </span>
            <p className="eyebrow">
              {s.when} · {index + 1} of {total}
            </p>
          </div>
          <h3 className="php-title text-display-lg font-semibold" data-a="rise" style={t(0.1)}>
            {s.title}
          </h3>
        </div>
        <div className="php-text">
          <p className="text-lead text-fg-muted" data-a="rise" style={t(0.25)}>
            {s.summary}
          </p>
          <p className="php-gate" data-a="rise" style={t(0.35)}>
            <UserRound aria-hidden className="size-4 shrink-0" />
            <span>
              <b className="font-semibold">You: </b>
              {s.you}
            </span>
          </p>
          <p className="php-gate" data-a="rise" style={t(0.45)}>
            <Building2 aria-hidden className="size-4 shrink-0" />
            <span>
              <b className="font-semibold">We: </b>
              {s.we}
            </span>
          </p>
        </div>
        <div className="php-widget">
          <Widget />
        </div>
      </div>
    </li>
  );
}
