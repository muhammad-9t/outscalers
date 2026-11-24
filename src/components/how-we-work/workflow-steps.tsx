"use client";

import { type CSSProperties, type KeyboardEvent, type ReactNode, useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  Check,
  CodeXml,
  FlaskConical,
  GitPullRequest,
  Lightbulb,
  MessageSquareText,
  RefreshCw,
  Rocket,
  ShieldCheck,
  Sparkles,
  UserCheck,
  UserRound,
  UsersRound,
  type LucideIcon,
} from "lucide-react";
import { useTilt } from "@/components/about/use-tilt";

type Tone = "human" | "brand" | "data";
type Tile = { icon: LucideIcon; x: number; y: number; tone: Tone };
type Step = { label: string; sub: string; body: string; control: string; tone: Tone; Icon: LucideIcon; tiles: Tile[]; scene: () => ReactNode };

const toneLabel: Record<Tone, string> = { human: "People lead", brand: "AI assists", data: "Automated" };
const AUTO_MS = 6000;

const z = (z: number, i: number) => ({ "--z": `${z}px`, "--i": i }) as CSSProperties;

const Tick = () => (
  <span className="wf-tick" aria-hidden>
    <Check className="size-3" strokeWidth={3} />
  </span>
);

const steps: Step[] = [
  {
    label: "Idea",
    sub: "People define",
    body: "Your team and our engineers agree the goal, the scope and what done looks like.",
    control: "Nothing is built until people agree what to build.",
    tone: "human",
    Icon: Lightbulb,
    tiles: [
      { icon: UsersRound, x: 82, y: 4, tone: "human" },
      { icon: Lightbulb, x: 2, y: 70, tone: "brand" },
    ],
    scene: () => (
      <>
        <div className="aj-card wf-a" style={z(10, 0)}>
          <div className="flex items-center justify-between">
            <span className="aj-year">Kick-off</span>
            <span className="flex -space-x-2">
              {(["human", "brand", "data"] as const).map((t) => (
                <span key={t} className="evw-avatar" data-tone={t}>
                  <UserRound className="size-3.5" />
                </span>
              ))}
            </span>
          </div>
          <p className="mt-2 text-lg font-semibold">Invoice export</p>
          <ul className="mt-3 space-y-2 text-sm">
            {["Goal: monthly PDF export", "Users: the finance team", "Done when: one click, under 5 seconds"].map((t) => (
              <li key={t} className="aj-row">
                <Tick /> {t}
              </li>
            ))}
          </ul>
        </div>
        <div className="aj-card wf-b" style={z(60, 1)}>
          <div className="flex items-center justify-between">
            <span className="aj-year aj-live">Scope</span>
            <span className="aj-icon" data-tone="human">
              <UserCheck className="size-4" />
            </span>
          </div>
          <p className="mt-2 font-semibold">Agreed with you</p>
          <span className="wf-pill mt-2.5" data-tone="human">
            <Check aria-hidden className="size-3.5" strokeWidth={3} /> Signed off
          </span>
        </div>
      </>
    ),
  },
  {
    label: "Implement",
    sub: "AI-assisted",
    body: "Engineers direct the work. AI drafts scaffolding, routine code and first tests.",
    control: "AI drafts inside the agreed scope. Engineers steer every change.",
    tone: "brand",
    Icon: CodeXml,
    tiles: [
      { icon: Sparkles, x: 84, y: 2, tone: "brand" },
      { icon: CodeXml, x: 1, y: 66, tone: "human" },
    ],
    scene: () => (
      <>
        <div className="aj-card wf-a" style={z(10, 0)}>
          <div className="flex items-center justify-between">
            <span className="aj-year aj-live">AI draft</span>
            <span className="aj-icon" data-tone="brand">
              <Sparkles className="size-4" />
            </span>
          </div>
          <p className="mt-2 text-lg font-semibold">export-invoice.ts</p>
          <span className="mt-3 block space-y-2">
            {["82%", "64%", "74%", "52%", "68%"].map((w, i) => (
              <span key={i} className="aj-code" data-tone={i === 2 ? "human" : "brand"} style={{ width: w }} />
            ))}
          </span>
          <span className="wf-pill mt-3.5" data-tone="brand">
            Inside the agreed scope
          </span>
        </div>
        <div className="aj-card wf-b" style={z(60, 1)}>
          <div className="flex items-center justify-between">
            <span className="aj-year">Engineer</span>
            <span className="aj-icon" data-tone="human">
              <UserRound className="size-4" />
            </span>
          </div>
          <p className="mt-2 font-semibold">Steering the draft</p>
          <dl className="mt-2.5 grid grid-cols-3 gap-1.5 text-center text-sm">
            {[
              ["12", "Keep"],
              ["3", "Change"],
              ["1", "Drop"],
            ].map(([v, k]) => (
              <div key={k} className="wf-stat">
                <dd className="font-semibold">{v}</dd>
                <dt className="text-xs text-fg-muted">{k}</dt>
              </div>
            ))}
          </dl>
        </div>
      </>
    ),
  },
  {
    label: "Review",
    sub: "Engineer approves",
    body: "Every change is read by an engineer. If it isn't right, it goes back to implementation.",
    control: "No change moves on without an engineer's approval.",
    tone: "human",
    Icon: UserCheck,
    tiles: [
      { icon: GitPullRequest, x: 84, y: 4, tone: "human" },
      { icon: MessageSquareText, x: 2, y: 68, tone: "data" },
    ],
    scene: () => (
      <>
        <div className="aj-card wf-a" style={z(10, 0)}>
          <div className="flex items-center justify-between">
            <span className="aj-year">Pull request</span>
            <span className="aj-icon" data-tone="human">
              <GitPullRequest className="size-4" />
            </span>
          </div>
          <p className="mt-2 text-lg font-semibold">Invoice export to PDF</p>
          <span className="mt-3 block space-y-2">
            {[
              ["+", "78%"],
              ["+", "60%"],
              ["−", "44%"],
            ].map(([s, w], i) => (
              <span key={i} className="rv-line" data-sign={s === "+" ? "add" : "del"}>
                <span className="rv-sign">{s}</span>
                <span className="aj-code" data-tone={s === "+" ? "brand" : "muted"} style={{ width: w }} />
              </span>
            ))}
          </span>
          <span className="rv-comment mt-3.5">
            <span className="cv-avatar rv-avatar">
              <UserRound className="size-3.5" />
            </span>
            <span className="text-sm text-fg-muted">Handle empty months first.</span>
          </span>
        </div>
        <div className="aj-card wf-b" style={z(60, 1)}>
          <div className="flex items-center justify-between">
            <span className="aj-year">Status</span>
            <span className="aj-icon" data-tone="human">
              <UserCheck className="size-4" />
            </span>
          </div>
          <p className="mt-2 text-sm text-fg-muted line-through">Changes requested</p>
          <span className="wf-pill mt-2" data-tone="human">
            <Check aria-hidden className="size-3.5" strokeWidth={3} /> Approved
          </span>
        </div>
      </>
    ),
  },
  {
    label: "Test",
    sub: "Automated + manual",
    body: "Automated suites run on every change, and people test what automation can't.",
    control: "Automated suites and people check every release.",
    tone: "data",
    Icon: FlaskConical,
    tiles: [
      { icon: FlaskConical, x: 84, y: 2, tone: "data" },
      { icon: ShieldCheck, x: 2, y: 68, tone: "human" },
    ],
    scene: () => (
      <>
        <div className="aj-card wf-a" style={z(10, 0)}>
          <div className="flex items-center justify-between">
            <span className="aj-year aj-live">Test run</span>
            <span className="aj-icon" data-tone="data">
              <FlaskConical className="size-4" />
            </span>
          </div>
          <p className="mt-2 text-lg font-semibold">213 of 213 passed</p>
          <span className="aj-bar" data-tone="data" style={{ "--w": "100%", "--i": 0 } as CSSProperties} />
          <ul className="mt-3.5 space-y-2 text-sm">
            {["Unit and integration tests", "Security scan clean", "Performance under 5 seconds"].map((t) => (
              <li key={t} className="aj-row">
                <Tick /> {t}
              </li>
            ))}
          </ul>
        </div>
        <div className="aj-card wf-b" style={z(60, 1)}>
          <div className="flex items-center justify-between">
            <span className="aj-year">Manual QA</span>
            <span className="aj-icon" data-tone="human">
              <UserRound className="size-4" />
            </span>
          </div>
          <p className="mt-2 font-semibold">Edge cases checked</p>
          <span className="wf-pill mt-2.5" data-tone="human">
            <Check aria-hidden className="size-3.5" strokeWidth={3} /> Ready to release
          </span>
        </div>
      </>
    ),
  },
  {
    label: "Deploy",
    sub: "Monitored",
    body: "Releases ship with monitoring. What we learn in production feeds the next idea.",
    control: "Production is watched. What we learn feeds the next idea.",
    tone: "data",
    Icon: Rocket,
    tiles: [
      { icon: Rocket, x: 84, y: 2, tone: "brand" },
      { icon: RefreshCw, x: 2, y: 68, tone: "data" },
    ],
    scene: () => (
      <>
        <div className="aj-card wf-a" style={z(10, 0)}>
          <div className="flex items-center justify-between">
            <span className="aj-year aj-live">Production</span>
            <span className="aj-icon aj-icon-solid">
              <Rocket className="size-4" />
            </span>
          </div>
          <p className="mt-2 text-lg font-semibold">v1.8 is live</p>
          <div className="mt-3 flex items-end justify-between gap-4">
            <span className="text-sm text-fg-muted">
              Response time
              <span className="block text-base font-semibold text-fg">320 ms</span>
            </span>
            <span className="evw-chart" aria-hidden>
              {[40, 55, 48, 70, 62, 85, 78].map((h, i) => (
                <span key={i} style={{ height: `${h}%` }} />
              ))}
            </span>
          </div>
        </div>
        <div className="aj-card wf-b" style={z(60, 1)}>
          <div className="flex items-center justify-between">
            <span className="aj-year">Learned</span>
            <span className="aj-icon" data-tone="data">
              <RefreshCw className="size-4" />
            </span>
          </div>
          <p className="mt-2 font-semibold">Exports peak at month-end</p>
          <span className="mt-2 flex items-center gap-1.5 text-sm text-brand-300">
            Next idea <ArrowRight aria-hidden className="size-3.5" />
          </span>
        </div>
      </>
    ),
  },
];

/**
 * The workflow, one step at a time: step tabs with glossy tiles on the left, and the step's
 * widget scene on the right (it blurs out and the next sharpens in). Advances on its own while in
 * view until the visitor picks a step. Styles: .wf-* in globals.css (scenes reuse .aj-* and .evw-*).
 */
export function WorkflowSteps() {
  const [active, setActive] = useState(0);
  const [auto, setAuto] = useState(true);
  const [inView, setInView] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const scene = useRef<HTMLDivElement>(null);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  useTilt(stage, scene, 6, 9);

  useEffect(() => {
    // Reduced motion: never counts as in view, so the steps don't advance on their own
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const el = root.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: 0.35 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!auto || !inView) return;
    const t = window.setTimeout(() => setActive((a) => (a + 1) % steps.length), AUTO_MS);
    return () => window.clearTimeout(t);
  }, [auto, inView, active]);

  const pick = (i: number, focus = false) => {
    setAuto(false);
    setActive(i);
    if (focus) tabs.current[i]?.focus();
  };

  const onKey = (e: KeyboardEvent) => {
    const k = e.key;
    if (!["ArrowDown", "ArrowUp", "ArrowRight", "ArrowLeft", "Home", "End"].includes(k)) return;
    e.preventDefault();
    const n = steps.length;
    const next = k === "Home" ? 0 : k === "End" ? n - 1 : k === "ArrowDown" || k === "ArrowRight" ? (active + 1) % n : (active - 1 + n) % n;
    pick(next, true);
  };

  return (
    <div ref={root} className="wf container-site mt-12 grid gap-10 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:items-center lg:gap-16">
      <div role="tablist" aria-label="Workflow steps" aria-orientation="vertical" onKeyDown={onKey} className="grid gap-2.5">
        {steps.map((s, i) => {
          const on = i === active;
          return (
            <button
              key={s.label}
              ref={(el) => {
                tabs.current[i] = el;
              }}
              type="button"
              role="tab"
              id={`wf-tab-${i}`}
              aria-selected={on}
              aria-controls="wf-panel"
              tabIndex={on ? 0 : -1}
              onClick={() => pick(i)}
              className="wf-tab"
              data-active={on || undefined}
              data-tone={s.tone}
            >
              <span className="hs-gloss wf-tab-tile" data-tone={s.tone} aria-hidden>
                <s.Icon className="size-[48%]" strokeWidth={1.8} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <span className="text-xl font-semibold">{s.label}</span>
                  <span className="wf-sub">{s.sub}</span>
                </span>
                <span className="wf-tab-more">
                  <span className="block overflow-hidden">
                    <span className="mt-2 block text-[0.9375rem] leading-relaxed text-fg-muted">{s.body}</span>
                    <span className="wf-control mt-3">{s.control}</span>
                  </span>
                </span>
              </span>
              {on && auto && inView && <span key={active} aria-hidden className="wf-progress" style={{ animationDuration: `${AUTO_MS}ms` }} />}
            </button>
          );
        })}
        <p className="mt-2 flex flex-wrap gap-x-5 gap-y-2 text-sm text-fg-muted">
          {(Object.keys(toneLabel) as Tone[]).map((t) => (
            <span key={t} className="flex items-center gap-2">
              <span aria-hidden className="wf-dot" data-tone={t} /> {toneLabel[t]}
            </span>
          ))}
        </p>
      </div>

      <div id="wf-panel" role="tabpanel" aria-labelledby={`wf-tab-${active}`} className="min-w-0">
        <p className="sr-only" aria-live="polite">
          {steps[active].label}: {steps[active].body}
        </p>
        <div ref={stage} className="aj wf-stage" aria-hidden>
          <div ref={scene} className="aj-scene">
            <span className="aj-glow aj-glow-a" />
            <span className="aj-glow aj-glow-b" />
            {steps.map((s, i) => (
              <div key={s.label} className="evw-scene wf-scene" data-active={i === active || undefined}>
                {s.scene()}
                {s.tiles.map((t, j) => (
                  <span
                    key={j}
                    className="aj-tile"
                    data-tone={t.tone}
                    style={{ "--x": `${t.x}%`, "--y": `${t.y}%`, "--z": "110px", "--i": j + 2 } as CSSProperties}
                  >
                    <t.icon className="size-[48%]" strokeWidth={1.8} />
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
