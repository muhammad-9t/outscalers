"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import type { EvolutionStep } from "@/content/evolution";
import { cn } from "@/lib/cn";
import { scrollToY } from "@/lib/smooth-scroll";
import { EvolutionNetwork } from "./evolution-network";

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));
const STEP_SVH = 75; // scroll distance per chapter, in viewport heights (%)

/** How visible chapter i is at progress p: fully at p = i, gone half a chapter away. */
const chapterStyle = (i: number, p: number): CSSProperties => ({
  opacity: clamp(1 - Math.abs(p - i) * 2.2, 0, 1),
  transform: `translate3d(0, ${((i - p) * 48).toFixed(1)}px, 0)`,
});

/**
 * "Our evolution": on large screens the section pins and the page scroll moves through the
 * chapters, while the network on the right reshapes for each one. On smaller screens it is
 * a list of cards, each with its own network that grows into shape as it scrolls into view.
 */
export function EvolutionJourney({ steps }: { steps: EvolutionStep[] }) {
  const outerRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef(0);
  const chapterRefs = useRef<(HTMLDivElement | null)[]>([]);
  const fillRef = useRef<HTMLDivElement>(null);
  const dotRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const last = steps.length - 1;

  useEffect(() => {
    const outer = outerRef.current;
    if (!outer) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const rect = outer.getBoundingClientRect();
      const span = rect.height - window.innerHeight;
      const p = clamp(-rect.top / Math.max(span, 1), 0, 1) * last;
      progressRef.current = p;
      chapterRefs.current.forEach((el, i) => el && Object.assign(el.style, chapterStyle(i, p)));
      if (fillRef.current) fillRef.current.style.transform = `scaleY(${(p / last).toFixed(4)})`;
      dotRefs.current.forEach((el, i) => el?.toggleAttribute("data-reached", p >= i - 0.5));
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [last]);

  // Jump to a chapter from the rail
  const goTo = (i: number) => {
    const outer = outerRef.current;
    if (!outer) return;
    const span = outer.offsetHeight - window.innerHeight;
    const top = outer.getBoundingClientRect().top + window.scrollY + (span * i) / last;
    scrollToY(top);
  };

  return (
    <>
      {/* Large screens: pinned scroll story */}
      <div ref={outerRef} className="relative hidden lg:block" style={{ height: `${steps.length * STEP_SVH + 25}svh` }}>
        <div className="sticky top-0 flex h-svh items-center pt-18">
          <div className="container-site grid w-full grid-cols-[auto_1fr_1fr] items-center gap-14 xl:gap-20">
            {/* Progress rail */}
            <nav aria-label="Chapters" className="relative flex h-[min(26rem,60svh)] flex-col justify-between">
              <div aria-hidden className="absolute left-[5px] top-1.5 bottom-1.5 w-px bg-line-strong" />
              <div
                ref={fillRef}
                aria-hidden
                className="absolute left-[5px] top-1.5 bottom-1.5 w-px origin-top bg-brand-400"
                style={{ transform: "scaleY(0)" }}
              />
              {steps.map((s, i) => (
                <button
                  key={s.when}
                  ref={(el) => {
                    dotRefs.current[i] = el;
                  }}
                  type="button"
                  onClick={() => goTo(i)}
                  data-reached={i === 0 ? "" : undefined}
                  className="group relative flex items-center gap-3 font-mono text-xs text-fg-subtle transition-colors hover:text-fg data-reached:text-fg-muted"
                >
                  <span className="size-[11px] rounded-full border-2 border-line-strong bg-ink-950 transition-colors group-data-reached:border-brand-400 group-data-reached:bg-brand-400" />
                  {s.when}
                </button>
              ))}
            </nav>

            {/* Chapters, cross-fading as the page scrolls */}
            <div className="relative h-[min(26rem,60svh)]">
              {steps.map((s, i) => (
                <div
                  key={s.when}
                  ref={(el) => {
                    chapterRefs.current[i] = el;
                  }}
                  className="absolute inset-x-0 top-1/2 -mt-[9rem] will-change-transform"
                  style={chapterStyle(i, 0)}
                >
                  <p
                    className={cn(
                      "text-[clamp(3.5rem,6vw,5.5rem)] font-semibold leading-none tracking-tight",
                      i === last ? "text-gradient" : "text-fg",
                    )}
                  >
                    {s.when}
                  </p>
                  <p className="eyebrow mt-5">{s.label}</p>
                  <h3 className="mt-3 text-2xl font-semibold leading-snug xl:text-3xl">{s.title}</h3>
                  <p className="mt-4 max-w-xl leading-relaxed text-fg-muted">{s.body}</p>
                </div>
              ))}
            </div>

            <EvolutionNetwork progressRef={progressRef} className="mx-auto aspect-square w-full max-w-[min(34rem,70svh)]" />
          </div>
        </div>
      </div>

      {/* Smaller screens: one card per chapter */}
      <ol className="container-site space-y-5 lg:hidden">
        {steps.map((s, i) => (
          <li key={s.when} className="card overflow-hidden">
            <div className="border-b border-line bg-ink-900/60 px-6 py-4">
              <EvolutionNetwork stage={i} startStage={Math.max(i - 1, 0)} className="mx-auto aspect-square w-full max-w-64" />
            </div>
            <div className="p-6">
              <p className={cn("text-4xl font-semibold tracking-tight", i === last ? "text-gradient" : "text-fg")}>{s.when}</p>
              <p className="eyebrow mt-4">{s.label}</p>
              <h3 className="mt-2 text-xl font-semibold">{s.title}</h3>
              <p className="mt-3 text-[0.9375rem] leading-relaxed text-fg-muted">{s.body}</p>
            </div>
          </li>
        ))}
      </ol>
    </>
  );
}
