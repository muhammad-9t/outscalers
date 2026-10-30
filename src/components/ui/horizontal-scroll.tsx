"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { ScrollRobot } from "./scroll-robot";

// Only on large screens, and never for reduced motion: there the panels stay a normal vertical list.
const QUERY = "(min-width: 64rem) and (prefers-reduced-motion: no-preference)";

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

/**
 * Pins its panels to the screen and moves them sideways as the page scrolls down,
 * then lets the page continue once the last panel is in view. A small robot rides a
 * rail along the bottom, gliding after the scroll from stop to stop (one stop per panel).
 */
export function HorizontalScroll({ children, label, stops }: { children: ReactNode; label: string; stops: string[] }) {
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

    const read = () => {
      target = distance ? clamp(-o.getBoundingClientRect().top / distance, 0, 1) : 0;
      t.style.transform = `translate3d(${-target * distance}px, 0, 0)`;
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
      distance = Math.max(0, t.scrollWidth - t.clientWidth);
      o.style.height = `${window.innerHeight + distance}px`;
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
    };
  }, [on, stops.length]);

  return (
    <div ref={outer} className="relative">
      <div data-pet-hide={on || undefined} className={cn(on && "sticky top-0 h-svh overflow-hidden")}>
        <ol ref={track} aria-label={label} className={cn("flex", on ? "h-full will-change-transform" : "flex-col")}>
          {children}
        </ol>
        {on && (
          <div aria-hidden className="container-site absolute inset-x-0 bottom-9">
            <div ref={rail} className="relative h-px w-full bg-line">
              <span ref={bar} className="block h-full origin-left scale-x-0 bg-brand-400" />
              {/* One stop per panel */}
              {stops.map((name, i) => (
                <span
                  key={name}
                  className="absolute top-0 -translate-x-1/2"
                  style={{ left: `${(i / (stops.length - 1)) * 100}%` }}
                >
                  <span
                    className={cn(
                      "block size-2 -translate-y-1/2 rotate-45 border transition-colors duration-300",
                      i <= stop ? "border-brand-400 bg-brand-400" : "border-line-strong bg-ink-950",
                    )}
                  />
                  <span
                    className={cn(
                      "absolute top-2.5 left-1/2 -translate-x-1/2 font-mono text-[10px] transition-colors duration-300",
                      i === stop ? "text-brand-300" : "text-fg-subtle",
                    )}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </span>
              ))}
              {/* The robot, riding the rail */}
              {/* Zero-width anchor at the robot's centre, so the readout can sit a fixed gap to either side */}
              <div ref={rider} className="absolute bottom-1 left-0 w-0">
                <div className="absolute bottom-0 left-0 -translate-x-1/2 motion-safe:animate-[hover-bob_2.4s_ease-in-out_infinite]">
                  <ScrollRobot bodyRef={body} eyeRef={eye} flameRef={flame} />
                </div>
                {/* Readout of the current stop; flips to the left near the end of the rail */}
                <span
                  className={cn(
                    "absolute bottom-7 border border-brand-400/40 bg-ink-950/90 px-2 py-1 font-mono text-[10px] tracking-[0.14em] whitespace-nowrap text-brand-200 uppercase",
                    stop >= stops.length - 1 ? "right-9" : "left-9",
                  )}
                >
                  {`${String(stop + 1).padStart(2, "0")} // ${stops[stop]}`}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
