"use client";

import { useEffect, useRef, useState } from "react";
import { Check, GitBranch } from "lucide-react";
import { cn } from "@/lib/cn";
import { scrollToY } from "@/lib/smooth-scroll";
import { steps, toneClass, WorkflowRail } from "./workflow-rail";
import { scenes } from "./workflow-screen";
import { AiPanel, aiStates, files } from "./workflow-console";

// Large screens with motion only; everyone else gets the vertical rail
const QUERY = "(min-width: 64rem) and (prefers-reduced-motion: no-preference)";
const n = steps.length;
// Page scroll per step, in svh
const STEP_SVH = 95;

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

// How much the AI does on its own at each step (0–1), always under the limit engineers set
const autonomy = [
  { level: 0, label: "None" },
  { level: 0.55, label: "Scoped" },
  { level: 0.08, label: "Paused" },
  { level: 0.3, label: "Checked" },
  { level: 0.18, label: "Watched" },
];
const LIMIT = 0.6;

// How the AI is held at each step
const control = [
  "Nothing is built until people agree what to build.",
  "AI drafts inside the agreed scope. Engineers steer every change.",
  "No change moves on without an engineer's approval.",
  "Automated suites and people check every release.",
  "Production is watched. What we learn feeds the next idea.",
];

/**
 * How far step `i` is from being centred, eased: 0 while it is the step on screen (with a hold in the
 * middle), rising to 1 as it moves out. Negative while it is still coming in. The first step is already
 * in place at the top, and the last stays once reached.
 */
function offset(P: number, i: number) {
  let d = P - i - 0.5;
  if (i === 0) d = Math.max(0, d);
  if (i === n - 1) d = Math.min(0, d);
  const e = clamp((Math.abs(d) - 0.18) / 0.32, 0, 1);
  return Math.sign(d) * e;
}

/** One step's file header and scene, as shown in the editor. */
function EditorView({ step }: { step: number }) {
  const sc = scenes[step];
  return (
    <>
      <p className="border-b border-line px-4 py-2 text-[11px] text-fg-subtle">{sc.file}</p>
      <div className="p-4">{sc.render()}</div>
    </>
  );
}

function Stage() {
  const outer = useRef<HTMLDivElement>(null);
  const texts = useRef<(HTMLDivElement | null)[]>([]);
  const floor = useRef<HTMLDivElement>(null);
  const segments = useRef<(HTMLSpanElement | null)[]>([]);
  const [current, setCurrent] = useState(0);
  const [previous, setPrevious] = useState(-1); // the view being replaced, kept for its fade-out

  useEffect(() => {
    const o = outer.current;
    if (!o) return;
    let frame = 0;
    let last = -1;
    const update = () => {
      frame = 0;
      const r = o.getBoundingClientRect();
      const dist = r.height - window.innerHeight;
      const raw = dist > 0 ? clamp(-r.top / dist, 0, 1) : 0;
      const P = raw * n;

      for (let i = 0; i < n; i++) {
        const e = offset(P, i);
        const a = Math.abs(e);
        // Text: comes in from depth, holds, then flies past the camera
        const t = texts.current[i];
        if (t) {
          t.style.opacity = String(1 - a);
          t.style.visibility = a >= 1 ? "hidden" : "visible";
          t.style.transform =
            e < 0
              ? `translate3d(0, ${a * 70}px, ${-a * 700}px) rotateX(${-a * 28}deg)`
              : `translate3d(0, ${-a * 90}px, ${a * 380}px) rotateX(${a * 16}deg)`;
        }
      }

      const c = clamp(Math.floor(P), 0, n - 1);
      if (floor.current) floor.current.style.backgroundPosition = `0 ${P * 260}px`;
      // Each step's segment fills as the page scrolls through that step
      segments.current.forEach((el, i) => {
        if (el) el.style.transform = `scaleX(${clamp(P - i, 0, 1)})`;
      });
      if (c !== last) {
        setPrevious(last);
        setCurrent((last = c));
      }
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    frame = requestAnimationFrame(update);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  const goTo = (i: number) => {
    const o = outer.current;
    if (!o) return;
    const top = o.getBoundingClientRect().top + window.scrollY;
    const dist = o.offsetHeight - window.innerHeight;
    scrollToY(top + ((i + 0.5) / n) * dist);
  };

  return (
    <div ref={outer} style={{ height: `${n * STEP_SVH + 100}svh` }} className="relative">
      <div data-pet-hide className="sticky top-0 h-svh overflow-hidden [perspective:1400px]">
        {/* Moving grid floor, for depth */}
        <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-[55%] [perspective:600px]">
          <div
            ref={floor}
            className="absolute inset-x-[-30%] bottom-[-20%] h-[160%] origin-bottom opacity-40 [mask-image:linear-gradient(to_top,black,transparent_75%)] [transform:rotateX(72deg)]"
            style={{
              backgroundImage:
                "linear-gradient(var(--color-line) 1px, transparent 1px), linear-gradient(90deg, var(--color-line) 1px, transparent 1px)",
              backgroundSize: "64px 64px",
            }}
          />
        </div>

        <div className="container-site relative grid h-full grid-cols-[minmax(0,0.8fr)_minmax(0,1.3fr)] items-center gap-12 pt-20 pb-28">
          {/* Step text, stacked; one is on screen at a time */}
          <div className="relative h-[26rem] [transform-style:preserve-3d]">
            {steps.map((s, i) => {
              const t = toneClass[s.tone];
              return (
                <div
                  key={s.label}
                  ref={(el) => {
                    texts.current[i] = el;
                  }}
                  aria-hidden={i !== current}
                  className="absolute inset-0 flex flex-col justify-center pt-24 will-change-transform"
                  style={{ opacity: i === 0 ? 1 : 0 }}
                >
                  <span
                    aria-hidden
                    className="pointer-events-none -mb-6 -ml-2 font-display text-[9rem] leading-none font-semibold text-transparent select-none [-webkit-text-stroke:1px_var(--color-line-strong)]"
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <p className="relative font-mono text-xs tracking-[0.18em] text-fg-subtle uppercase">
                    Step {String(i + 1).padStart(2, "0")} / {String(n).padStart(2, "0")}
                  </p>
                  <h3 className="relative mt-4 flex flex-wrap items-center gap-4 text-display-lg font-semibold">
                    {s.label}
                    <span className={cn("rounded-full border px-3 py-1 font-mono text-sm font-normal", t.chip)}>{s.sub}</span>
                  </h3>
                  <p className="relative mt-5 text-lead text-fg-muted">{s.body}</p>
                  <p className="relative mt-6 border-l-2 border-brand-400 pl-4 text-[1.0625rem] text-fg">{control[i]}</p>
                </div>
              );
            })}
          </div>

          {/* The editor window: files, the step's view, and the AI assistant */}
          <div aria-hidden>
            <div className="relative">
              <div className="glow-brand pointer-events-none absolute -inset-16 opacity-35" />
              <div className="glass relative overflow-hidden rounded-2xl border border-line-strong bg-ink-950 shadow-[0_40px_100px_-40px_rgb(0_0_0/0.9)]">
                {/* Title bar */}
                <div className="flex items-center gap-4 border-b border-line bg-ink-900/70 px-4 py-2.5 font-mono text-xs">
                  <span className="flex gap-1.5">
                    <span className="size-2.5 rounded-full bg-ink-700" />
                    <span className="size-2.5 rounded-full bg-ink-700" />
                    <span className="size-2.5 rounded-full bg-ink-700" />
                  </span>
                  <span className="text-fg-subtle">invoice-export</span>
                  <span className="ml-auto rounded border border-line px-2 py-0.5 text-[10px] tracking-[0.14em] text-brand-300 uppercase">
                    Step {String(current + 1).padStart(2, "0")} · {steps[current].label}
                  </span>
                </div>

                <div className="grid h-[24rem] grid-cols-[9.5rem_minmax(0,1fr)_12rem] max-2xl:grid-cols-[minmax(0,1fr)_12rem]">
                  {/* Files */}
                  <div className="border-r border-line bg-ink-900/40 p-3 font-mono text-[11px] max-2xl:hidden">
                    <p className="mb-2 px-1.5 text-[10px] tracking-[0.16em] text-fg-subtle uppercase">Project</p>
                    <ul className="space-y-0.5">
                      {files.map((f, i) => (
                        <li
                          key={f.name}
                          className={cn(
                            "flex items-center gap-2 rounded-md px-1.5 py-1.5 transition-colors duration-500",
                            i === current ? "bg-brand-500/10 text-brand-200" : "text-fg-subtle",
                          )}
                        >
                          <f.Icon className="size-3.5 shrink-0" />
                          <span className="truncate">{f.name}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* The step's view. The window stays still: on each new step a scan line sweeps down
                      and reveals the new view over the old one as it fades */}
                  <div className="relative overflow-hidden font-mono text-[0.75rem]">
                    {previous >= 0 && previous !== current && (
                      <div key={`prev-${previous}`} className="absolute inset-0 animate-[view-out_0.6s_ease-out_both]">
                        <EditorView step={previous} />
                      </div>
                    )}
                    <div key={current} className="absolute inset-0 bg-ink-950 animate-[view-wipe_0.75s_cubic-bezier(0.2,0.7,0.2,1)_both]">
                      <EditorView step={current} />
                    </div>
                    <span
                      key={`sweep-${current}`}
                      className="pointer-events-none absolute inset-x-0 h-px bg-brand-300 shadow-[0_0_18px_3px_var(--color-brand-400)] animate-[view-sweep_0.75s_cubic-bezier(0.2,0.7,0.2,1)_both]"
                    />
                    <div className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent_0_3px,rgb(255_255_255/0.015)_3px_4px)]" />
                  </div>

                  <AiPanel step={current} />
                </div>

                {/* Status bar */}
                <div className="flex items-center gap-5 border-t border-line bg-ink-900/70 px-4 py-2 font-mono text-[10px] tracking-[0.12em] text-fg-subtle uppercase">
                  <span className="flex items-center gap-1.5">
                    <GitBranch className="size-3" /> feature/invoice-export
                  </span>
                  <span>
                    AI <span className="text-brand-300">{aiStates[current].status}</span>
                  </span>
                  <span className="ml-auto">
                    Human control <span className="text-brand-300">100%</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* HUD: live control meters, the step track, and a counter (padded right on narrower screens to clear the back-to-top button) */}
        <div className="absolute inset-x-0 bottom-0 border-t border-line bg-ink-950/85 backdrop-blur-md">
          <div className="container-site grid grid-cols-[14rem_minmax(0,1fr)_auto] items-center gap-8 py-4 max-[90rem]:pr-20!">
            <div className="space-y-2.5 font-mono text-[10px] tracking-[0.14em] uppercase">
              <div>
                <p className="flex justify-between text-fg-subtle">
                  Human control <span className="text-brand-300">100%</span>
                </p>
                <span className="mt-1 block h-1 rounded-full bg-brand-400 shadow-[0_0_8px_var(--color-brand-400)]" />
              </div>
              <div>
                <p className="flex justify-between text-fg-subtle">
                  AI autonomy <span className="text-fg">{autonomy[current].label}</span>
                </p>
                <span className="relative mt-1 block h-1 rounded-full bg-ink-700">
                  <span
                    className="absolute inset-y-0 left-0 rounded-full bg-human-accent transition-[width] duration-700 ease-out"
                    style={{ width: `${autonomy[current].level * 100}%` }}
                  />
                  {/* The limit engineers set: autonomy never passes it */}
                  <span className="absolute -top-1 -bottom-1 w-px bg-fg-muted" style={{ left: `${LIMIT * 100}%` }} />
                </span>
                <p className="mt-1 text-[9px] text-fg-subtle" style={{ paddingLeft: `calc(${LIMIT * 100}% - 1.25rem)` }}>
                  limit
                </p>
              </div>
            </div>

            <ol className="grid grid-cols-5 gap-3">
              {steps.map((s, i) => {
                const state = i < current ? "done" : i === current ? "active" : "queued";
                return (
                  <li key={s.label}>
                    <button
                      type="button"
                      onClick={() => goTo(i)}
                      aria-current={i === current ? "step" : undefined}
                      className="group block w-full text-left"
                    >
                      <span className="relative block h-0.5 overflow-hidden rounded-full bg-line transition-colors group-hover:bg-line-strong">
                        <span
                          ref={(el) => {
                            segments.current[i] = el;
                          }}
                          className="absolute inset-0 origin-left bg-brand-400 shadow-[0_0_8px_var(--color-brand-400)]"
                          style={{ transform: "scaleX(0)" }}
                        />
                      </span>
                      <span className="mt-2.5 flex items-center gap-2 font-mono text-[11px] tracking-[0.14em] uppercase">
                        <span
                          className={cn(
                            "grid size-4 shrink-0 place-items-center rounded-full border transition-colors duration-500",
                            state === "done" && "border-brand-400 bg-brand-400 text-on-brand",
                            state === "active" && "border-brand-400 text-brand-300",
                            state === "queued" && "border-line-strong text-fg-subtle",
                          )}
                        >
                          {state === "done" ? (
                            <Check aria-hidden className="size-2.5" strokeWidth={3} />
                          ) : state === "active" ? (
                            <span className="size-1.5 rounded-full bg-brand-400 motion-safe:animate-[pulse-soft_1.6s_ease-in-out_infinite]" />
                          ) : null}
                        </span>
                        <span
                          className={cn(
                            "truncate transition-colors group-hover:text-fg",
                            state === "active" ? "text-brand-200" : state === "done" ? "text-fg-muted" : "text-fg-subtle",
                          )}
                        >
                          <span className="text-fg-subtle">{String(i + 1).padStart(2, "0")}</span> {s.label}
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ol>

            <p className="font-mono text-fg-subtle" aria-hidden>
              <span key={current} className="inline-block font-display text-3xl font-semibold text-fg motion-safe:animate-[fade-up_0.35s_var(--ease-out-soft)_both]">
                {String(current + 1).padStart(2, "0")}
              </span>
              <span className="text-sm"> / {String(n).padStart(2, "0")}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/** The workflow, told one step per screen with scroll-driven 3D on large screens; the vertical rail elsewhere. */
export function WorkflowJourney() {
  const [on, setOn] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(QUERY);
    const sync = () => setOn(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  if (on) return <Stage />;
  return (
    <div className="container-site mt-12">
      <WorkflowRail />
    </div>
  );
}
