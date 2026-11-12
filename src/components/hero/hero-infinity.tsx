"use client";

import { useEffect, useRef } from "react";

/**
 * Home hero visual: an infinity loop woven from bundles of fine glowing strands.
 * The orange bundle is AI, the blue one is the engineers; they run the loop in opposite phase and cross
 * in the middle, so the two always meet. Pulses of light travel round the loop forever while the strands
 * slowly twist and breathe. Colours come from the theme tokens. Pauses off screen; still for reduced motion.
 */

const TAU = Math.PI * 2;
const SAMPLES = 220;

type Bundle = { key: "brand" | "human" | "pale"; strands: number; width: number; phase: number; speed: number; lift: number };

// Fewer, finer strands in narrow ribbons: calm and clean rather than busy
const BUNDLES: Bundle[] = [
  { key: "brand", strands: 22, width: 0.07, phase: 0, speed: 1, lift: 0 },
  { key: "human", strands: 18, width: 0.055, phase: Math.PI, speed: -0.85, lift: 0.012 },
  { key: "pale", strands: 8, width: 0.03, phase: Math.PI / 2, speed: 1.2, lift: -0.012 },
];

const hexToRgb = (hex: string) => {
  const h = hex.trim().replace("#", "");
  const n = parseInt(h.length === 3 ? h.replace(/./g, "$&$&") : h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255] as const;
};

export function HeroInfinity({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let W = 0;
    let H = 0;
    let light = false;
    let colors: Record<Bundle["key"], readonly [number, number, number]> = {
      brand: [255, 112, 14],
      human: [124, 196, 255],
      pale: [255, 211, 179],
    };
    let raf = 0;
    let running = false;
    let start = 0;

    // Base loop (lemniscate of Bernoulli) and its unit normals, in 0..1 units, computed once
    const base: { x: number; y: number; nx: number; ny: number }[] = [];
    for (let i = 0; i < SAMPLES; i++) {
      const t = (i / SAMPLES) * TAU;
      const d = 1 + Math.sin(t) ** 2;
      base.push({ x: Math.cos(t) / d, y: (Math.sin(t) * Math.cos(t)) / d, nx: 0, ny: 0 });
    }
    for (let i = 0; i < SAMPLES; i++) {
      const a = base[(i - 1 + SAMPLES) % SAMPLES];
      const b = base[(i + 1) % SAMPLES];
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const len = Math.hypot(dx, dy) || 1;
      base[i].nx = -dy / len;
      base[i].ny = dx / len;
    }

    const readTheme = () => {
      const css = getComputedStyle(document.documentElement);
      const get = (n: string, f: string) => hexToRgb(css.getPropertyValue(`--color-${n}`) || f);
      light = document.documentElement.dataset.theme === "light";
      colors = {
        brand: get("brand-400", "#ff700e"),
        human: get("human-accent", "#7cc4ff"),
        pale: light ? get("brand-500", "#e86100") : get("brand-tint", "#ffd3b3"),
      };
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      W = canvas.clientWidth;
      H = canvas.clientHeight;
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const draw = (t: number) => {
      ctx.clearRect(0, 0, W, H);
      if (!W || !H) return;
      const time = reduced ? 0 : (t - start) / 1000;
      // Draw-in on load: the loop traces itself over ~1.8s
      const intro = reduced ? 1 : Math.min(1, time / 1.8);
      const shown = Math.max(2, Math.floor(SAMPLES * (1 - Math.pow(1 - intro, 3))));
      // Half the loop's width; leaves room for the outer strands so nothing is clipped at the edges
      const sx = W * 0.4;
      const sy = sx * 1.3; // a little taller than true, so the lobes feel round
      const cx = W / 2;
      const cy = H / 2;
      const S = Math.min(W, H * 1.6);

      ctx.globalCompositeOperation = light ? "source-over" : "lighter";
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      for (const b of BUNDLES) {
        const [cr, cg, cb] = colors[b.key];
        const width = S * b.width;

        // Point k of strand u. Every term repeats a whole number of times round the loop, so there is no seam.
        const point = (k: number, u: number) => {
          const i = ((k % SAMPLES) + SAMPLES) % SAMPLES;
          const p = base[i];
          const s = i / SAMPLES;
          const twist = Math.cos(TAU * s + time * 0.45 * b.speed + b.phase);
          const breathe = 1 + 0.08 * Math.sin(time * 0.8 + TAU * 2 * s + b.phase);
          const off = u * width * twist * breathe + b.lift * S;
          return [cx + p.x * sx + p.nx * off, cy + p.y * sy + p.ny * off] as const;
        };

        for (let j = 0; j < b.strands; j++) {
          const u = j / (b.strands - 1) - 0.5;
          const a = (light ? 0.22 : 0.26) * Math.max(0.2, 1 - Math.abs(u) * 1.5) + 0.02;
          ctx.beginPath();
          for (let k = 0; k <= shown; k++) {
            const [x, y] = point(k, u);
            if (k === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.lineWidth = Math.abs(u) < 0.1 ? 1 : 0.6;
          ctx.strokeStyle = `rgba(${cr},${cg},${cb},${a})`;
          ctx.stroke();
        }

        // One comet of light running round the ribbon for ever: a bright head with a fading tail
        if (!reduced && intro >= 1) {
          const head = Math.floor((time * 34 * b.speed + (b.phase / TAU) * SAMPLES) % SAMPLES);
          const TAIL = 46;
          ctx.lineCap = "butt"; // flat ends, so the tail segments join into one smooth streak
          ctx.lineWidth = 1.6;
          for (const u of [-0.08, 0, 0.08]) {
            for (let k = 0; k < TAIL; k++) {
              const dir = b.speed > 0 ? 1 : -1;
              const [x0, y0] = point(head - dir * (k + 1), u);
              const [x1, y1] = point(head - dir * k, u);
              ctx.strokeStyle = `rgba(${cr},${cg},${cb},${(light ? 0.6 : 0.85) * Math.pow(1 - k / TAIL, 2)})`;
              ctx.beginPath();
              ctx.moveTo(x0, y0);
              ctx.lineTo(x1, y1);
              ctx.stroke();
            }
          }
        }
      }

      ctx.lineCap = "round";
      // Where the two lobes cross: a soft meeting point
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, S * 0.07);
      const [r1, g1, b1] = colors.brand;
      g.addColorStop(0, `rgba(${r1},${g1},${b1},${light ? 0.22 : 0.35})`);
      g.addColorStop(1, `rgba(${r1},${g1},${b1},0)`);
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(cx, cy, S * 0.07, 0, TAU);
      ctx.fill();
      ctx.globalCompositeOperation = "source-over";
    };

    const frame = (t: number) => {
      if (!start) start = t;
      draw(t);
      if (running) raf = requestAnimationFrame(frame);
    };
    const startLoop = () => {
      if (running || reduced) return;
      running = true;
      raf = requestAnimationFrame(frame);
    };
    const stopLoop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };

    readTheme();
    resize();
    if (reduced) draw(0);
    const ro = new ResizeObserver(() => {
      resize();
      if (!running) draw(performance.now());
    });
    ro.observe(canvas);
    const io = new IntersectionObserver(([e]) => (e.isIntersecting ? startLoop() : stopLoop()));
    io.observe(canvas);
    const mo = new MutationObserver(() => {
      readTheme();
      if (!running) draw(performance.now());
    });
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    const onVis = () => (document.hidden ? stopLoop() : startLoop());
    document.addEventListener("visibilitychange", onVis);

    return () => {
      stopLoop();
      document.removeEventListener("visibilitychange", onVis);
      ro.disconnect();
      io.disconnect();
      mo.disconnect();
    };
  }, []);

  return (
    <div className={className}>
      <div className="relative aspect-16/10 w-full">
        <canvas
          ref={canvasRef}
          role="img"
          aria-label="An infinity loop of orange AI strands and blue engineer strands, crossing in the middle"
          className="absolute inset-0 size-full"
        />
        {/* Lobe labels: people on the left, AI on the right */}
        <p aria-hidden className="absolute top-[8%] left-[6%] font-mono leading-tight">
          <span className="block text-sm tracking-[0.16em] text-human-accent">ENGINEER</span>
          <span className="mt-1 block text-[11px] tracking-[0.12em] text-fg-subtle">reviews · steers · approves</span>
        </p>
        <p aria-hidden className="absolute right-[6%] bottom-[8%] text-right font-mono leading-tight">
          <span className="block text-sm tracking-[0.16em] text-brand-300">AI OUTPUT</span>
          <span className="mt-1 block text-[11px] tracking-[0.12em] text-fg-subtle">fast · at scale · in the loop</span>
        </p>
      </div>
    </div>
  );
}
