"use client";

import { type RefObject, useEffect } from "react";

/**
 * Mouse tilt for a 3D scene, kept cheap: pointer moves only record a target angle; one
 * requestAnimationFrame loop eases the scene towards it and writes a single transform on one
 * element (no CSS variables on the parent, so nothing else restyles), then stops when settled.
 * Mouse only; off for reduced motion.
 */
export function useTilt(hostRef: RefObject<HTMLElement | null>, targetRef: RefObject<HTMLElement | null>, maxX = 9, maxY = 13) {
  useEffect(() => {
    const host = hostRef.current;
    const target = targetRef.current;
    if (!host || !target) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let tx = 0;
    let ty = 0;
    let x = 0;
    let y = 0;
    let raf = 0;
    let rect: DOMRect | null = null;

    const frame = () => {
      x += (tx - x) * 0.12;
      y += (ty - y) * 0.12;
      target.style.transform = `rotateX(${x.toFixed(2)}deg) rotateY(${y.toFixed(2)}deg)`;
      raf = Math.abs(tx - x) > 0.02 || Math.abs(ty - y) > 0.02 ? requestAnimationFrame(frame) : 0;
    };
    const kick = () => {
      if (!raf) raf = requestAnimationFrame(frame);
    };
    const onEnter = () => {
      rect = host.getBoundingClientRect();
    };
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      rect ??= host.getBoundingClientRect();
      ty = ((e.clientX - rect.left) / rect.width - 0.5) * 2 * maxY;
      tx = -((e.clientY - rect.top) / rect.height - 0.5) * 2 * maxX;
      kick();
    };
    const onLeave = () => {
      rect = null;
      tx = 0;
      ty = 0;
      kick();
    };
    host.addEventListener("pointerenter", onEnter);
    host.addEventListener("pointermove", onMove);
    host.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(raf);
      host.removeEventListener("pointerenter", onEnter);
      host.removeEventListener("pointermove", onMove);
      host.removeEventListener("pointerleave", onLeave);
    };
  }, [hostRef, targetRef, maxX, maxY]);
}
