import type { CSSProperties, ReactNode } from "react";
import { ArrowRight, Bot, Check, Crown, HeartHandshake, Repeat, Sparkles, Target, UserRound, Users } from "lucide-react";
import { Reveal } from "@/components/ui/primitives";

/**
 * About "What guides our work": the four values as a bento of soft cards. Each card shows a small
 * widget of the value in practice (a quality gate, the client's goals, versions improving, who
 * owns the decision) above a glossy icon tile, title and text. Styles: .vg-* in globals.css.
 */

type Tone = "brand" | "human" | "data";

function Excellence() {
  return (
    <div className="vg-panel">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-fg">Quality gate</span>
        <span className="vg-pill" data-tone="human">
          <Check aria-hidden className="size-3" strokeWidth={3} /> Passed
        </span>
      </div>
      <ul className="mt-3 space-y-2 text-sm text-fg-muted">
        {["Clean architecture", "Code reviewed", "Release tested"].map((t, i) => (
          <li key={t} className="vg-check" style={{ "--i": i } as CSSProperties}>
            <span className="vg-tick" aria-hidden>
              <Check className="size-3" strokeWidth={3} />
            </span>
            {t}
          </li>
        ))}
      </ul>
    </div>
  );
}

function Customer() {
  return (
    <div className="vg-panel">
      <span className="text-sm font-semibold text-fg">Your goals</span>
      <div className="mt-3 space-y-3 text-sm text-fg-muted">
        {[
          ["Business impact", "86%", "brand"],
          ["Team adoption", "72%", "human"],
        ].map(([label, w, tone], i) => (
          <div key={label}>
            {label}
            <span className="vg-bar" data-tone={tone} style={{ "--w": w, "--i": i } as CSSProperties} />
          </div>
        ))}
      </div>
    </div>
  );
}

function Improvement() {
  return (
    <div className="vg-panel">
      <div className="flex items-center gap-2">
        {["v1", "v2", "v3"].map((v, i) => (
          <span key={v} className="flex items-center gap-2">
            <span className="vg-version" data-latest={i === 2 ? "" : undefined}>
              {v}
            </span>
            {i < 2 && <ArrowRight aria-hidden className="size-3.5 text-fg-subtle" />}
          </span>
        ))}
      </div>
      <svg aria-hidden viewBox="0 0 200 44" className="vg-spark mt-3 h-11 w-full">
        <path d="M2 40 L34 34 L62 36 L94 24 L126 26 L158 13 L198 5" fill="none" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" pathLength={1} />
      </svg>
      <span className="vg-pill mt-1" data-tone="brand">
        <Sparkles aria-hidden className="size-3" /> AI, applied with care
      </span>
    </div>
  );
}

function Accountability() {
  return (
    <div className="vg-panel">
      <div className="grid grid-cols-2 gap-2.5 text-sm">
        <div className="vg-role" data-owner="">
          <span className="vg-avatar" data-tone="human">
            <UserRound className="size-4" />
          </span>
          <span>
            <span className="block font-semibold text-fg">Engineer</span>
            <span className="flex items-center gap-1 text-fg-muted">
              <Crown aria-hidden className="size-3 text-brand-300" /> Owner
            </span>
          </span>
        </div>
        <div className="vg-role">
          <span className="vg-avatar" data-tone="brand">
            <Bot className="size-4" />
          </span>
          <span>
            <span className="block font-semibold text-fg">AI</span>
            <span className="text-fg-muted">Suggests</span>
          </span>
        </div>
      </div>
      <p className="mt-3 flex items-center gap-2 text-sm text-fg-muted">
        <span className="vg-tick" aria-hidden>
          <Check className="size-3" strokeWidth={3} />
        </span>
        Final call: <span className="font-semibold text-fg">the engineer</span>
      </p>
    </div>
  );
}

const values: { icon: typeof Target; tone: Tone; title: string; body: string; widget: ReactNode; wide?: boolean }[] = [
  {
    icon: Target,
    tone: "brand",
    title: "Excellence",
    body: "We hold our work to high engineering standards — clean architecture, reviewed code and tested releases.",
    widget: <Excellence />,
    wide: true,
  },
  {
    icon: HeartHandshake,
    tone: "human",
    title: "Customer-centric",
    body: "We start from your goals and constraints, and measure success by what changes for your business.",
    widget: <Customer />,
  },
  {
    icon: Repeat,
    tone: "data",
    title: "Continuous improvement",
    body: "We keep learning — which is why AI is now part of how we work, applied with care.",
    widget: <Improvement />,
  },
  {
    icon: Users,
    tone: "brand",
    title: "Accountability",
    body: "People own decisions and outcomes. Tools, including AI, never carry the responsibility.",
    widget: <Accountability />,
    wide: true,
  },
];

export function ValuesGrid() {
  return (
    <ul className="vg mt-12 grid gap-5 lg:grid-cols-12">
      {values.map((v, i) => (
        <Reveal as="li" key={v.title} delay={i * 80} className={`vg-card ${v.wide ? "lg:col-span-7" : "lg:col-span-5"}`}>
          <div aria-hidden>{v.widget}</div>
          <div className="mt-6 flex items-center gap-3">
            <span className="hs-gloss vg-tile" data-tone={v.tone} aria-hidden>
              <v.icon className="size-[48%]" strokeWidth={1.8} />
            </span>
            <h3 className="text-lg font-semibold">{v.title}</h3>
          </div>
          <p className="mt-3 text-[0.9375rem] leading-relaxed text-fg-muted">{v.body}</p>
        </Reveal>
      ))}
    </ul>
  );
}
