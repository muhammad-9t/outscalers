"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";

/**
 * off       – not decided yet (server render / first paint)
 * flying    – climbs the margin as the page scrolls
 * launching – reached the end of the page: rumble, lift-off, gone
 * away      – waiting for the visitor to return to the top
 * landing   – drops back in on a retro-burn and touches down, then flies again
 * disabled  – reduced motion
 */
type Phase = "off" | "flying" | "launching" | "away" | "landing" | "disabled";

const ROCKET_H = 64;
const groundY = () => window.innerHeight * 0.82;
// Climb stops ~20% from the top so the launch stays clear of the header.
const flightY = (progress: number) => groundY() - progress * window.innerHeight * 0.62;
const pageProgress = () => {
  const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
  return Math.min(1, Math.max(0, window.scrollY / max));
};

/**
 * A small rocket in the right-hand margin of the homepage. It climbs as the page scrolls,
 * launches off-screen at the end, and lands again when the visitor scrolls back to the top.
 * Hidden for reduced motion and on screens without a side margin.
 */
export function ScrollRocket() {
  const [phase, setPhase] = useState<Phase>("off");
  const wrapRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const trailRef = useRef<HTMLDivElement>(null);
  const flameRef = useRef<SVGGElement>(null);
  const hintRef = useRef<HTMLSpanElement>(null);
  const glowRef = useRef<HTMLSpanElement>(null);
  const streaksRef = useRef<HTMLSpanElement>(null);
  const puffsRef = useRef<HTMLSpanElement>(null);
  const anims = useRef<Animation[]>([]);
  // Full-screen launch effects: ignition glow, rising firelight and embers.
  const stageRef = useRef<HTMLDivElement>(null);
  const fireRef = useRef<HTMLSpanElement>(null);
  const embersRef = useRef<HTMLSpanElement>(null);

  const play = (el: Element | null, frames: Keyframe[], opts: KeyframeAnimationOptions) => {
    if (!el) return;
    anims.current.push(el.animate(frames, opts));
  };
  const clearAnims = () => {
    anims.current.forEach((a) => a.cancel());
    anims.current = [];
  };
  const setThrust = (v: number) => flameRef.current?.style.setProperty("--thrust", String(v));
  const puff = () => {
    puffsRef.current?.querySelectorAll("span").forEach((p, i) => {
      const dx = (i - 1) * 16;
      play(
        p,
        [
          { opacity: 0.75, transform: "translate(-50%, 0) scale(0.3)" },
          { opacity: 0, transform: `translate(calc(-50% + ${dx}px), 8px) scale(2.4)` },
        ],
        { duration: 1200 + i * 120, easing: "cubic-bezier(.2,.7,.3,1)" },
      );
    });
  };

  /**
   * Two seconds of light, kept to the right-hand margin: an ignition glow under the rocket,
   * an exhaust plume running down its trail, and embers rising through the plume.
   */
  const igniteStage = () => {
    const rect = wrapRef.current?.getBoundingClientRect();
    const stage = stageRef.current?.getBoundingClientRect();
    if (!rect || !stage) return;
    const x = rect.left + rect.width / 2 - stage.left;
    const nozzle = rect.top + ROCKET_H - 6;
    const vh = window.innerHeight;

    const plume = fireRef.current;
    if (plume) {
      plume.style.left = `${x - 100}px`;
      plume.style.top = `${nozzle - 4}px`;
      play(
        plume,
        [
          { opacity: 0, transform: "scaleX(0.6) scaleY(0)" },
          { opacity: 0.8, transform: "scaleX(0.8) scaleY(0.6)", offset: 0.18 },
          { opacity: 1, transform: "scaleX(1) scaleY(1)", offset: 0.32 },
          { opacity: 0.9, transform: "scaleX(1.12) scaleY(0.97)", offset: 0.45 },
          { opacity: 0.75, transform: "scaleX(0.95) scaleY(1.02)", offset: 0.6 },
          { opacity: 0.45, transform: "scaleX(1.08) scaleY(1)", offset: 0.78 },
          { opacity: 0, transform: "scaleX(1.2) scaleY(1)" },
        ],
        { duration: 2200, easing: "ease-in-out" },
      );
    }

    embersRef.current?.querySelectorAll("span").forEach((ember, i) => {
      const startY = nozzle + 40 + Math.random() * (vh - nozzle - 60);
      const rise = 140 + Math.random() * 220;
      const drift = (Math.random() - 0.5) * 70;
      ember.style.left = `${x + (Math.random() - 0.5) * 50}px`;
      ember.style.top = `${startY}px`;
      play(
        ember,
        [
          { opacity: 0, transform: "translate(0, 0) scale(0.6)" },
          { opacity: 1, transform: `translate(${drift * 0.3}px, ${-rise * 0.3}px) scale(1)`, offset: 0.2 },
          { opacity: 0, transform: `translate(${drift}px, ${-rise}px) scale(0.4)` },
        ],
        { duration: 1200 + Math.random() * 600, delay: 250 + i * 55, easing: "cubic-bezier(.2,.6,.4,1)" },
      );
    });
  };

  // Decide once, on the client, whether the rocket should fly at all.
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const decide = () => setPhase(reduce.matches ? "disabled" : "flying");
    decide();
  }, []);

  // Flying: follow the scroll position; vibration and streaks follow scroll speed.
  useEffect(() => {
    if (phase !== "flying") return;
    clearAnims();

    let raf = 0;
    let lastY = window.scrollY;
    let lastT = performance.now();
    let speed = 0;

    const render = (now = performance.now()) => {
      const progress = pageProgress();
      const top = flightY(progress);
      if (wrapRef.current) wrapRef.current.style.transform = `translate3d(0, ${top}px, 0)`;
      if (trailRef.current) {
        trailRef.current.style.top = `${top + ROCKET_H}px`;
        trailRef.current.style.opacity = String(Math.min(1, progress * 6));
      }
      if (bodyRef.current) bodyRef.current.style.transform = `rotate(${Math.sin(now / 70) * speed * 2.2}deg)`;
      if (streaksRef.current) streaksRef.current.style.opacity = String(Math.min(0.9, speed * 1.1));
      if (hintRef.current) hintRef.current.style.opacity = progress > 0.02 ? "0" : "1";
      setThrust(0.55 + speed * 0.95);

      if (progress >= 0.995) {
        setPhase("launching");
        return false;
      }
      return true;
    };

    const tick = (now: number) => {
      const y = window.scrollY;
      const dt = Math.max(16, now - lastT);
      speed = Math.max(Math.min(1, Math.abs(y - lastY) / dt / 2.5), speed * 0.9);
      lastY = y;
      lastT = now;
      const keepFlying = render(now);
      if (keepFlying && speed > 0.01) {
        raf = requestAnimationFrame(tick);
      } else {
        raf = 0;
        if (keepFlying) {
          speed = 0;
          render(now);
        }
      }
    };

    const onScroll = () => {
      if (!raf) {
        lastT = performance.now();
        raf = requestAnimationFrame(tick);
      }
    };
    const onResize = () => render();

    render();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, [phase]);

  // Launching: rumble on the spot, then accelerate off the top of the screen.
  useEffect(() => {
    if (phase !== "launching") return;
    const y = flightY(1);
    const at = (dy: number, dx = 0, scale = 1) => `translate3d(${dx}px, ${y + dy}px, 0) scale(${scale})`;
    const timers: number[] = [];
    const later = (ms: number, fn: () => void) => timers.push(window.setTimeout(fn, ms));

    if (bodyRef.current) bodyRef.current.style.transform = "rotate(0deg)";
    if (hintRef.current) hintRef.current.style.opacity = "0";
    setThrust(1.4);
    igniteStage();
    puff();
    play(
      wrapRef.current,
      [at(0), at(1, -1.5), at(0, 1.5), at(1, -1.2), at(0, 1.2), at(1, -0.8), at(0)].map((transform) => ({ transform })),
      { duration: 480 },
    );

    later(460, () => {
      setThrust(2);
      play(
        wrapRef.current,
        [
          { transform: at(0), opacity: 1 },
          { transform: at(-40), opacity: 1, offset: 0.22 },
          { transform: `translate3d(0, ${-0.4 * window.innerHeight}px, 0) scale(0.8)`, opacity: 0 },
        ],
        { duration: 1400, easing: "cubic-bezier(.55,0,.8,.35)", fill: "forwards" },
      );
      play(streaksRef.current, [{ opacity: 1 }, { opacity: 0 }], { duration: 1200, fill: "forwards" });
      play(trailRef.current, [{ opacity: 1, transform: "scaleY(1)" }, { opacity: 0, transform: "scaleY(1.15)" }], {
        duration: 1300,
        easing: "ease-in",
        fill: "forwards",
      });
    });
    later(2400, () => setPhase("away"));
    return () => timers.forEach((t) => window.clearTimeout(t));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- helpers only touch refs
  }, [phase]);

  // Away: wait for the visitor to come back to the top of the page.
  useEffect(() => {
    if (phase !== "away") return;
    const check = () => {
      if (window.scrollY <= 4) setPhase("landing");
    };
    check();
    window.addEventListener("scroll", check, { passive: true });
    return () => window.removeEventListener("scroll", check);
  }, [phase]);

  // Landing: drop in from above on a retro-burn, decelerate, touch down with a small bounce.
  useEffect(() => {
    if (phase !== "landing") return;
    clearAnims();
    const g = groundY();
    const timers: number[] = [];
    const later = (ms: number, fn: () => void) => timers.push(window.setTimeout(fn, ms));

    if (trailRef.current) trailRef.current.style.opacity = "0";
    if (hintRef.current) hintRef.current.style.opacity = "0";
    if (streaksRef.current) streaksRef.current.style.opacity = "0";
    setThrust(1.8);
    play(
      wrapRef.current,
      [
        { transform: `translate3d(0, ${-0.18 * window.innerHeight}px, 0)`, opacity: 0 },
        { opacity: 1, offset: 0.12 },
        { transform: `translate3d(0, ${g - 18}px, 0)`, offset: 0.84 },
        { transform: `translate3d(0, ${g + 5}px, 0)`, offset: 0.92 },
        { transform: `translate3d(0, ${g}px, 0)`, opacity: 1 },
      ],
      { duration: 2700, easing: "cubic-bezier(.3,.5,.35,1)", fill: "forwards" },
    );
    play(glowRef.current, [{ opacity: 0.6 }, { opacity: 0.25 }], { duration: 2700, fill: "forwards" });
    later(1300, () => setThrust(1.2));
    later(2000, () => setThrust(0.8));
    later(2300, () => {
      setThrust(0.55);
      puff();
      play(glowRef.current, [{ opacity: 0.25 }, { opacity: 0 }], { duration: 900, fill: "forwards" });
    });
    later(2800, () => setPhase("flying"));
    return () => timers.forEach((t) => window.clearTimeout(t));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- helpers only touch refs
  }, [phase]);

  if (phase === "off" || phase === "disabled") return null;

  return (
    <>
    {/* Launch light layer: the right-hand margin plus a soft spill into the page, below the header */}
    <div
      ref={stageRef}
      aria-hidden
      className="pointer-events-none fixed inset-y-0 right-0 z-30 hidden overflow-hidden mix-blend-screen xl:block"
      style={{
        width: "calc((100vw - 76rem) / 2 + 14rem)",
        maskImage: "linear-gradient(to left, #000 calc(100% - 14rem), transparent)",
        WebkitMaskImage: "linear-gradient(to left, #000 calc(100% - 14rem), transparent)",
      }}
    >
      {/* Exhaust plume: a cone from the nozzle, narrow at the top and widening as it fades down */}
      <span ref={fireRef} className="absolute bottom-0 w-[200px] origin-top opacity-0" style={{ filter: "blur(8px)" }}>
        <span
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, rgba(255,170,80,1), rgba(255,112,14,0.75) 20%, rgba(255,112,14,0.3) 55%, transparent 90%)",
            clipPath: "polygon(48% 0, 52% 0, 90% 100%, 10% 100%)",
          }}
        />
      </span>
      <span ref={embersRef}>
        {Array.from({ length: 18 }, (_, i) => (
          <span
            key={i}
            className={cn("absolute size-2 rounded-full opacity-0 shadow-[0_0_8px_rgba(255,140,40,0.9)]", i % 3 === 0 ? "bg-signal" : "bg-brand-400")}
          />
        ))}
      </span>
    </div>
    <div
      aria-hidden
      className="scroll-rocket pointer-events-none fixed inset-y-0 z-40 hidden w-8 xl:block"
      style={{ right: "max(12px, calc((100vw - 76rem) / 4 - 16px))" }}
    >
      {/* Exhaust trail from the rocket to the bottom of the screen */}
      <div
        ref={trailRef}
        className="absolute bottom-0 left-1/2 w-px origin-bottom -translate-x-1/2 bg-linear-to-b from-brand-400/80 via-brand-400/25 to-transparent"
        style={{ top: "100%", opacity: 0 }}
      />

      <div ref={wrapRef} className="absolute left-0 top-0 w-8 will-change-transform" style={{ transform: "translate3d(0, 82vh, 0)" }}>
        {/* Engine glow, launch burst and speed streaks */}
        <span
          ref={glowRef}
          className="absolute left-1/2 top-10 size-24 -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(255,112,14,0.45),transparent_70%)] opacity-0"
        />
        <span ref={streaksRef} className="absolute inset-y-1 -left-2.5 -right-2.5 opacity-0">
          <span className="absolute left-0 top-2 h-10 w-px bg-linear-to-b from-transparent via-fg-subtle/60 to-transparent" />
          <span className="absolute right-0 top-5 h-12 w-px bg-linear-to-b from-transparent via-fg-subtle/60 to-transparent" />
        </span>

        {/* Rocket */}
        <div ref={bodyRef} className="relative origin-[50%_70%]">
          <svg viewBox="0 0 32 64" className="h-16 w-8 overflow-visible">
            <g ref={flameRef} className="scroll-rocket-flame">
              <path d="M11 44c-1 9 3 14 5 20 2-6 6-11 5-20Z" className="fill-brand-400" />
              <path d="M13.5 44c-.5 6 1.5 9 2.5 13 1-4 3-7 2.5-13Z" className="fill-signal" />
            </g>
            <path d="M9 32 3 42v4l6-4Z" className="fill-brand-500 stroke-brand-300" strokeWidth={0.8} strokeLinejoin="round" />
            <path d="M23 32l6 10v4l-6-4Z" className="fill-brand-500 stroke-brand-300" strokeWidth={0.8} strokeLinejoin="round" />
            <path d="M9 42V20C9 12 12.5 6 16 2c3.5 4 7 10 7 18v22Z" className="fill-ink-850 stroke-fg/85" strokeWidth={1.2} strokeLinejoin="round" />
            <path d="M16 2c-2.2 2.6-4 5.6-5.2 9h10.4C20 7.6 18.2 4.6 16 2Z" className="fill-brand-400" />
            <circle cx={16} cy={20} r={3.4} className="fill-human-accent/30 stroke-human-accent" strokeWidth={1.1} />
            <path d="M9 34h14" className="stroke-brand-400/70" strokeWidth={1} />
            <path d="M12 42h8l-1 2.5h-6Z" className="fill-ink-700" />
          </svg>
        </div>

        {/* Smoke puffs at the nozzle */}
        <span ref={puffsRef} className="absolute inset-x-0 top-[3.6rem]">
          {[0, 1, 2].map((i) => (
            <span key={i} className="absolute left-1/2 top-0 size-4 rounded-full bg-ink-600/80 opacity-0" />
          ))}
        </span>

        <span
          ref={hintRef}
          className="absolute bottom-full left-1/2 mb-4 -translate-x-1/2 rotate-180 whitespace-nowrap font-mono text-[10px] uppercase tracking-widest text-fg-subtle transition-opacity duration-500 [writing-mode:vertical-rl]"
        >
          scroll to launch
        </span>
      </div>
    </div>
    </>
  );
}
