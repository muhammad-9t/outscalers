"use client";

import { useEffect, useRef, type RefObject } from "react";

/* ------------------------------------------------------------------
   A perspective tunnel behind the portfolio showcase. All lines run to a
   vanishing point (the "focus"): rectangular rings close tightly around it
   and stream towards the viewer, opening out into a wide grid across the
   rest of the screen, while radial lines converge on it. The focus follows
   the 3D laptop, so the tunnel always sits behind it.

   Performance: two 2D canvases. The static layer (glow + radial lines) only
   redraws when the focus moves; the ring layer is the only thing animated,
   at ~30 fps and capped resolution, and nothing runs off-screen.
   ------------------------------------------------------------------ */

export type TunnelFocus = { x: number; y: number };

const RINGS = 22;
const RAYS = 44;
const Z_NEAR = 0.12; // ring depth at the viewer (huge, off-screen)
const Z_FAR = 7; // ring depth at the back of the tunnel (tiny)
const SPEED = 0.045; // ring cycles per second
const FRAME_MS = 1000 / 30;
const MAX_DPR = 1.5;

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

/** "#rrggbb" token → rgba(), so a gradient can fade to the same colour rather than through black. */
function withAlpha(hex: string, alpha: number) {
  const n = parseInt(hex.replace("#", "").slice(0, 6), 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`;
}

function readColors() {
  const s = getComputedStyle(document.documentElement);
  const v = (name: string) => s.getPropertyValue(name).trim();
  return { ai: v("--color-brand-400"), human: v("--color-human-accent"), glow: v("--color-brand-500") };
}

export function PerspectiveTunnel({
  focusRef,
  active,
  reducedMotion,
}: {
  /** Vanishing point in CSS pixels of the viewport; null until the laptop reports it. */
  focusRef: RefObject<TunnelFocus | null>;
  active: boolean;
  reducedMotion: boolean;
}) {
  const staticRef = useRef<HTMLCanvasElement>(null);
  const ringsRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const staticCanvas = staticRef.current;
    const ringCanvas = ringsRef.current;
    const sx = staticCanvas?.getContext("2d");
    const rx = ringCanvas?.getContext("2d");
    if (!staticCanvas || !ringCanvas || !sx || !rx) return;

    let colors = readColors();
    let w = 0;
    let h = 0;
    let staticDirty = true;
    const drawn = { x: NaN, y: NaN }; // focus the static layer was last drawn for

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
      w = ringCanvas.clientWidth;
      h = ringCanvas.clientHeight;
      for (const [c, ctx] of [
        [staticCanvas, sx],
        [ringCanvas, rx],
      ] as const) {
        c.width = Math.round(w * dpr);
        c.height = Math.round(h * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      }
      staticDirty = true;
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(ringCanvas);
    const mo = new MutationObserver(() => {
      colors = readColors();
      staticDirty = true;
    });
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

    const base = () => Math.max(w, h) * 0.16; // half-height of the tunnel mouth at depth 1 (16:10 box)
    const farReach = () => Math.max(w, h) * 0.85; // distance at which lines are faintest

    // Glow + radial lines, faded with distance from the focus. Only redrawn when the focus moves.
    const drawStatic = (fx: number, fy: number) => {
      sx.clearRect(0, 0, w, h);
      const glow = sx.createRadialGradient(fx, fy, 0, fx, fy, h * 0.42);
      glow.addColorStop(0, withAlpha(colors.glow, 0.3));
      glow.addColorStop(1, withAlpha(colors.glow, 0));
      sx.fillStyle = glow;
      sx.fillRect(0, 0, w, h);

      const reach = Math.hypot(w, h) * 1.2;
      const backW = (base() * 1.6) / Z_FAR;
      const backH = base() / Z_FAR;
      const fade = sx.createRadialGradient(fx, fy, 0, fx, fy, farReach());
      fade.addColorStop(0, withAlpha(colors.human, 0.24));
      fade.addColorStop(0.45, withAlpha(colors.human, 0.13));
      fade.addColorStop(1, withAlpha(colors.human, 0.03));
      sx.strokeStyle = fade;
      sx.lineWidth = 1;
      sx.beginPath();
      for (let i = 0; i < RAYS; i++) {
        const a = (i / RAYS) * Math.PI * 2;
        const cx = Math.cos(a);
        const cy = Math.sin(a);
        // Start on the back ring so the rays meet the tunnel rather than a single point
        const k = Math.min(backW / Math.abs(cx || 1e-6), backH / Math.abs(cy || 1e-6));
        sx.moveTo(fx + cx * k, fy + cy * k);
        sx.lineTo(fx + cx * reach, fy + cy * reach);
      }
      sx.stroke();
      drawn.x = fx;
      drawn.y = fy;
      staticDirty = false;
    };

    // Rings streaming towards the viewer; bigger (nearer) rings are fainter so the far side stays calm
    const drawRings = (fx: number, fy: number, phase: number) => {
      rx.clearRect(0, 0, w, h);
      rx.strokeStyle = colors.ai;
      rx.lineWidth = 1;
      const b = base();
      const far = farReach();
      for (let i = 0; i < RINGS; i++) {
        const t = (i / RINGS + phase) % 1; // 0 = far, 1 = near
        const z = Z_FAR * Math.pow(Z_NEAR / Z_FAR, t);
        const hw = (b * 1.6) / z;
        const hh = b / z;
        const distanceFade = 1 - 0.85 * clamp(hw / far, 0, 1);
        rx.globalAlpha = clamp(t * 5, 0, 1) * clamp((1 - t) * 3, 0, 1) * 0.55 * distanceFade;
        rx.strokeRect(fx - hw, fy - hh, hw * 2, hh * 2);
      }
      rx.globalAlpha = 1;
    };

    // Smoothed vanishing point; defaults to the right-hand side
    const focus = { x: w * 0.72, y: h * 0.5 };
    const start = performance.now();
    let last = -Infinity;
    let raf = 0;

    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      if (now - last < FRAME_MS) return;
      last = now;

      const target = focusRef.current ?? { x: w * 0.72, y: h * 0.5 };
      const ease = reducedMotion ? 1 : 0.25;
      focus.x += (target.x - focus.x) * ease;
      focus.y += (target.y - focus.y) * ease;

      if (staticDirty || Math.abs(focus.x - drawn.x) > 0.5 || Math.abs(focus.y - drawn.y) > 0.5) {
        drawStatic(focus.x, focus.y);
      }
      // With reduced motion the rings hold still but still follow the focus
      drawRings(focus.x, focus.y, reducedMotion ? 0.35 : (((now - start) / 1000) * SPEED) % 1);
    };

    if (active) raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      mo.disconnect();
    };
  }, [active, reducedMotion, focusRef]);

  return (
    <>
      <canvas ref={staticRef} aria-hidden className="absolute inset-0 size-full" />
      <canvas ref={ringsRef} aria-hidden className="absolute inset-0 size-full" />
    </>
  );
}
