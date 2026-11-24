"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { scrollToY } from "@/lib/smooth-scroll";
import { ScrollRobot } from "./scroll-robot";

// Only on large screens, and never for reduced motion: there the panels stay a normal vertical list.
const QUERY = "(min-width: 64rem) and (prefers-reduced-motion: no-preference)";

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

/**
 * Pins its panels to the screen and moves them sideways as the page scrolls down,
 * then lets the page continue once the last panel is in view. A small robot rides a
 * rail along the bottom, gliding after the scroll from stop to stop (one stop per panel).
 *
 * Optional: `speed` < 1 makes the section shorter (less page scroll per panel); `stage` is a decor
 * layer drawn over the panels and under the rail, `backdrop` one drawn behind them; `dark` keeps
 * the pinned stage a night scene (dark tokens) in both themes. `trackProgress` writes each panel's
 * offset from the centre of the screen as --p (-1 entering from the left … 0 centred … 1 waiting on
 * the right) and its size as --ap, so panels can animate with the slide itself. The panel the robot is at gets `data-active`
 * (below lg / reduced motion: each panel as it scrolls into view), so panels can animate in.
 */
export function HorizontalScroll({
  children,
  label,
  stops,
  speed = 1,
  stage,
  backdrop,
  dark = false,
  trackProgress = false,
}: {
  children: ReactNode;
  label: string;
  stops: string[];
  speed?: number;
  stage?: ReactNode;
  backdrop?: ReactNode;
  dark?: boolean;
  trackProgress?: boolean;
}) {
  const outer = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLOListElement>(null);
  const rail = useRef<HTMLDivElement>(null);
  const bar = useRef<HTMLSpanElement>(null);
  const rider = useRef<HTMLDivElement>(null);
  const body = useRef<SVGGElement>(null);
  const eye = useRef<SVGGElement>(null);
  const flame = useRef<SVGGElement>(null);
  const [on, setOn] = useState(false);
  const [stop, setStop] = useState(0);
  const [near, setNear] = useState(false); // the pinned section is (nearly) on screen
  const travel = useRef(0); // horizontal distance the track covers, mirrored for the rail buttons

  useEffect(() => {
    const mq = window.matchMedia(QUERY);
    const sync = () => setOn(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    const o = outer.current;
    const t = track.current;
    if (!on || !o || !t) return;
    let distance = 0;
    let target = 0; // scroll progress, 0..1
    let cur = 0; // where the robot is; it eases toward the target so it follows rather than snaps
    let vel = 0;
    let last = -1;
    let frame = 0;
    let visible = false;
    let wasNear = false;

    const read = () => {
      const top = o.getBoundingClientRect().top;
      target = distance ? clamp(-top / (distance * speed), 0, 1) : 0;
      const isNear = top < window.innerHeight * 0.35 && top > -(distance * speed + window.innerHeight * 0.6);
      if (isNear !== wasNear) setNear((wasNear = isNear));
      t.style.transform = `translate3d(${-target * distance}px, 0, 0)`;
      if (trackProgress) {
        for (const k of Array.from(t.children) as HTMLElement[]) {
          const p = clamp((k.offsetLeft - target * distance) / Math.max(1, k.offsetWidth), -1.5, 1.5);
          k.style.setProperty("--p", p.toFixed(4));
          k.style.setProperty("--ap", Math.abs(p).toFixed(4));
        }
      }
      if (bar.current) bar.current.style.transform = `scaleX(${target})`;
    };

    const tick = () => {
      frame = 0;
      const step = (target - cur) * 0.12;
      cur += step;
      vel = vel * 0.8 + step * 0.2;
      const w = rail.current?.clientWidth ?? 0;
      if (rider.current) rider.current.style.transform = `translate3d(${cur * w}px, 0, 0)`;
      // Lean into the direction of travel, look ahead, and flare the thrusters with speed
      if (body.current) body.current.style.transform = `rotate(${clamp(vel * 3000, -16, 16)}deg)`;
      if (eye.current) eye.current.style.transform = `translateX(${clamp(vel * 2500, -1, 1) * 8}px)`;
      if (flame.current) flame.current.style.transform = `scaleY(${0.35 + clamp(Math.abs(vel) * 600, 0, 1)})`;
      const s = Math.round(cur * (stops.length - 1));
      if (s !== last) setStop((last = s));
      if (visible) frame = requestAnimationFrame(tick);
    };

    const measure = () => {
      // How far the track must travel so its last panel ends at the right edge
      // Measured from the panels, not scrollWidth, so decor that overflows a panel adds no travel
      const lastKid = t.lastElementChild as HTMLElement | null;
      distance = Math.max(0, (lastKid ? lastKid.offsetLeft + lastKid.offsetWidth : t.scrollWidth) - t.clientWidth);
      travel.current = distance;
      o.style.height = `${window.innerHeight + distance * speed}px`;
      read();
    };

    measure();
    cur = target;
    const ro = new ResizeObserver(measure);
    ro.observe(t);
    // Animate only while the section is on screen
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible && !frame) frame = requestAnimationFrame(tick);
    });
    io.observe(o);
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", read, { passive: true });
    return () => {
      ro.disconnect();
      io.disconnect();
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", read);
      cancelAnimationFrame(frame);
      o.style.height = "";
      t.style.transform = "";
      for (const k of Array.from(t.children) as HTMLElement[]) {
        k.style.removeProperty("--p");
        k.style.removeProperty("--ap");
      }
    };
  }, [on, stops.length, speed, trackProgress]);

  // Mark the active panel. Pinned: the one the robot is at, once the section is on screen.
  // Otherwise (stacked list): each panel as it scrolls into view, and it stays marked.
  useEffect(() => {
    const t = track.current;
    if (!t) return;
    const kids = Array.from(t.children) as HTMLElement[];
    if (on) {
      kids.forEach((k, i) => k.toggleAttribute("data-active", near && i === stop));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && e.target.setAttribute("data-active", "")),
      { rootMargin: "0px 0px -20% 0px" },
    );
    kids.forEach((k) => io.observe(k));
    return () => io.disconnect();
  }, [on, near, stop]);

  // Scrolls the page to the point where panel `i` is in view; the robot then glides there on its own.
  const goTo = (i: number) => {
    const o = outer.current;
    if (!o) return;
    const top = o.getBoundingClientRect().top + window.scrollY;
    scrollToY(top + (i / (stops.length - 1)) * travel.current * speed);
  };

  return (
    <div ref={outer} className="relative">
      <div
        data-pet-hide={on || undefined}
        data-pinned={on || undefined}
        data-theme={on && dark ? "dark" : undefined}
        className={cn(on && "sticky top-0 isolate h-svh overflow-hidden", on && dark && "bg-ink-950 text-fg")}
      >
        {on && backdrop}
        <ol ref={track} aria-label={label} className={cn("flex", on ? "h-full will-change-transform" : "flex-col")}>
          {children}
        </ol>
        {on && stage}
        {on && (
          <div className="container-site absolute inset-x-0 bottom-10 z-10">
            {/* Rail: a soft track with a gradient fill, one round node per panel, its name below.
                Styles: .hsr-* in globals.css. */}
            <div ref={rail} className="hsr-track">
              <span ref={bar} aria-hidden className="hsr-fill" />
              {stops.map((name, i) => (
                <button
                  type="button"
                  key={name}
                  onClick={() => goTo(i)}
                  aria-label={name}
                  aria-current={i === stop ? "step" : undefined}
                  data-state={i === stop ? "current" : i < stop ? "done" : undefined}
                  data-edge={i === 0 ? "start" : i === stops.length - 1 ? "end" : undefined}
                  className="hsr-stop"
                  style={{ left: `${(i / (stops.length - 1)) * 100}%` }}
                >
                  <span aria-hidden className="hsr-node" />
                  <span aria-hidden className="hsr-label">
                    {name}
                  </span>
                </button>
              ))}
              {/* The robot, riding the rail */}
              <div ref={rider} aria-hidden className="pointer-events-none absolute bottom-2 left-0 w-0">
                <div className="absolute bottom-0 left-0 -translate-x-1/2 motion-safe:animate-[hover-bob_2.4s_ease-in-out_infinite]">
                  <ScrollRobot bodyRef={body} eyeRef={eye} flameRef={flame} />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
