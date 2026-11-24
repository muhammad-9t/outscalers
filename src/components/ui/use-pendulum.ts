"use client";

import { type RefObject, useEffect } from "react";

/**
 * A pendant lamp you can drag and swing: on release it swings back like a damped pendulum and
 * settles in the centre, with a barely-there idle sway. Shared by the About beam sentence and the
 * How We Work phases.
 *
 * The angle is written as CSS variables on `host`, which the lamp, its light cone, glow and flies
 * read: --sway (degrees), --rim-x/--rim-y (the shade's rim, where light leaves it) and
 * --apex-x/--apex-y (the tip of the light cone, hidden inside the shade). `geometry` returns the
 * wire-top-to-rim and wire-top-to-apex distances in px; it is re-read on resize.
 * Off for reduced motion; only runs while the host is on screen.
 */
export function usePendulum(
  hostRef: RefObject<HTMLElement | null>,
  lampRef: RefObject<SVGSVGElement | null>,
  geometry: (host: HTMLElement) => { rim: number; apex: number },
  enabled = true,
) {
  useEffect(() => {
    const host = hostRef.current;
    const lamp = lampRef.current;
    if (!enabled || !host || !lamp) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const MAX = 65; // degrees
    let { rim: RIM, apex: APEX } = geometry(host);
    let angle = 0; // degrees, clockwise
    let vel = 0; // degrees per second
    let dragging = false;
    let last = performance.now();
    let lastAngle = 0;
    let running = false;
    let raf = 0;

    const apply = () => {
      const rad = (angle * Math.PI) / 180;
      const cx = host.clientWidth / 2;
      host.style.setProperty("--sway", `${angle}deg`);
      host.style.setProperty("--apex-x", `${cx - APEX * Math.sin(rad)}px`);
      host.style.setProperty("--apex-y", `${APEX * Math.cos(rad)}px`);
      host.style.setProperty("--rim-x", `${cx - RIM * Math.sin(rad)}px`);
      host.style.setProperty("--rim-y", `${RIM * Math.cos(rad)}px`);
    };

    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (!dragging) {
        // Damped pendulum around a barely-there idle sway
        const rest = Math.sin(now / 1100) * 0.6;
        const acc = -9 * (angle - rest) - 0.9 * vel;
        vel += acc * dt;
        angle += vel * dt;
      }
      apply();
      if (running) raf = requestAnimationFrame(tick);
    };

    const pointerAngle = (e: PointerEvent) => {
      const b = host.getBoundingClientRect();
      const dx = e.clientX - (b.left + b.width / 2);
      const dy = Math.max(20, e.clientY - b.top);
      // Lamp hangs below the pivot; pulling it right swings it anticlockwise (negative angle)
      return Math.max(-MAX, Math.min(MAX, (-Math.atan2(dx, dy) * 180) / Math.PI));
    };
    const onDown = (e: PointerEvent) => {
      dragging = true;
      lamp.setPointerCapture(e.pointerId);
      host.classList.add("is-dragging");
      lastAngle = angle;
      e.preventDefault();
    };
    const onMove = (e: PointerEvent) => {
      if (!dragging) return;
      const now = performance.now();
      const a = pointerAngle(e);
      const dt = Math.max(0.008, (now - last) / 1000);
      vel = (a - lastAngle) / dt;
      lastAngle = a;
      angle = a;
    };
    const onUp = () => {
      if (!dragging) return;
      dragging = false;
      vel = Math.max(-400, Math.min(400, vel));
      host.classList.remove("is-dragging");
    };
    const onResize = () => {
      ({ rim: RIM, apex: APEX } = geometry(host));
      apply();
    };
    lamp.addEventListener("pointerdown", onDown);
    lamp.addEventListener("pointermove", onMove);
    lamp.addEventListener("pointerup", onUp);
    lamp.addEventListener("pointercancel", onUp);
    window.addEventListener("resize", onResize);

    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !running) {
        running = true;
        last = performance.now();
        raf = requestAnimationFrame(tick);
      } else if (!entry.isIntersecting) {
        running = false;
        cancelAnimationFrame(raf);
      }
    });
    io.observe(host);
    apply();
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
      lamp.removeEventListener("pointerdown", onDown);
      lamp.removeEventListener("pointermove", onMove);
      lamp.removeEventListener("pointerup", onUp);
      lamp.removeEventListener("pointercancel", onUp);
      window.removeEventListener("resize", onResize);
    };
    // geometry is a stable reader; re-running on its identity would reset the swing
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hostRef, lampRef, enabled]);
}

/** Reads a length custom property (rem or px) from an element's computed style, in px. */
export function cssLengthPx(el: HTMLElement, name: string, fallbackRem: number) {
  const rem = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
  const v = getComputedStyle(el).getPropertyValue(name).trim();
  const n = parseFloat(v);
  if (!Number.isFinite(n)) return fallbackRem * rem;
  return v.endsWith("rem") ? n * rem : n;
}
