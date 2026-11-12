"use client";

import { useEffect, useRef } from "react";

/**
 * "Venom" flow for How We Work: silky ribbons of fine glowing strands behind the whole page.
 * They grow in from the right like tendrils when the page opens, then follow the scroll: each ribbon
 * drifts, tilts and twists with the page position, and swirls harder the faster you scroll.
 * The canvas is sticky inside the page wrapper, so it never covers the footer.
 * Colours come from the theme tokens (orange brand, blue human accent) and follow light/dark mode.
 */

const TAU = Math.PI * 2;

type Ribbon = {
  key: "brand" | "human" | "pale";
  strands: number;
  width: number; // ribbon width as a share of the viewport height
  phase: number;
  speed: number;
  freq: number;
  base: number; // resting height as a share of the viewport
};

const RIBBONS: Ribbon[] = [
  { key: "brand", strands: 54, width: 0.17, phase: 0, speed: 1, freq: 0.85, base: 0.52 },
  { key: "human", strands: 36, width: 0.1, phase: 2.2, speed: -0.75, freq: 1.15, base: 0.4 },
  { key: "pale", strands: 26, width: 0.07, phase: 4.1, speed: 1.3, freq: 0.7, base: 0.62 },
];

const POINTS = 90;

const hexToRgb = (hex: string) => {
  const h = hex.trim().replace("#", "");
  const n = parseInt(h.length === 3 ? h.replace(/./g, "$&$&") : h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255] as const;
};

const smooth = (x: number) => x * x * (3 - 2 * x);

export function VenomFlow() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    const wrap = canvas?.parentElement?.parentElement; // the page wrapper the flow spans
    if (!canvas || !ctx || !wrap) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let W = 0;
    let H = 0;
    let light = false;
    let colors: Record<Ribbon["key"], readonly [number, number, number]> = {
      brand: [255, 112, 14],
      human: [124, 196, 255],
      pale: [255, 211, 179],
    };
    let raf = 0;
    let running = false;
    let start = 0;
    let lastY = window.scrollY;
    let lastT = 0;
    let vel = 0; // smoothed scroll speed, 0..1
    let flow = 0; // phase that advances with time and with scrolling

    const readTheme = () => {
      const css = getComputedStyle(document.documentElement);
      const get = (n: string, fallback: string) => hexToRgb(css.getPropertyValue(`--color-${n}`) || fallback);
      light = document.documentElement.dataset.theme === "light";
      colors = {
        brand: get("brand-400", "#ff700e"),
        human: get("human-accent", "#7cc4ff"),
        // Light: the pale shade would vanish on a light page, so the third ribbon uses the deeper orange
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

    // Scroll progress through the wrapper, 0 at the top of the page and 1 at its end
    const progress = () => {
      const r = wrap.getBoundingClientRect();
      return Math.min(1, Math.max(0, -r.top / Math.max(1, r.height - window.innerHeight)));
    };

    const draw = (t: number) => {
      ctx.clearRect(0, 0, W, H);
      if (!W || !H) return;
      const p = progress();
      // Venom intro: the ribbons grow in from the right edge over ~2.4s
      const reveal = reduced ? 1 : smooth(Math.min(1, (t - start) / 2400));
      ctx.globalCompositeOperation = light ? "source-over" : "lighter";
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      for (const r of RIBBONS) {
        const [cr, cg, cb] = colors[r.key];
        // Path of the ribbon for this scroll position: it rises and falls, tilts and changes its wave
        const base = r.base + 0.24 * Math.sin(p * TAU * 1.2 + r.phase);
        const tilt = 0.5 * Math.cos(p * TAU * 0.8 + r.phase * 0.7);
        const amp = 0.13 + 0.08 * Math.sin(p * TAU * 2 + r.phase) + vel * 0.12;
        const tw = flow * r.speed + r.phase;

        const centre = (s: number) => H * (base + tilt * (s - 0.5) + amp * Math.sin(TAU * r.freq * s + tw));

        // Soft glow under the ribbon: a few wide, faint passes along its centre
        // Faded in only once the tendrils have arrived, so the growing tips stay clean
        const glowIn = Math.pow(reveal, 6);
        if (!light && glowIn > 0.01) {
          for (const [lw, a0] of [
            [r.width * H * 0.9, 0.025],
            [r.width * H * 0.4, 0.035],
          ] as const) {
            const a = a0 * glowIn;
            ctx.beginPath();
            for (let k = 0; k <= POINTS; k++) {
              const s = k / POINTS;
              if (1 - s > reveal * 1.15) continue;
              const x = (-0.15 + 1.3 * s) * W;
              if (k === 0 || 1 - (k - 1) / POINTS > reveal * 1.15) ctx.moveTo(x, centre(s));
              else ctx.lineTo(x, centre(s));
            }
            ctx.lineWidth = lw;
            ctx.strokeStyle = `rgba(${cr},${cg},${cb},${a})`;
            ctx.stroke();
          }
        }

        for (let j = 0; j < r.strands; j++) {
          const u = j / (r.strands - 1) - 0.5;
          const edge = 1 - Math.abs(u) * 1.6;
          const a = (light ? 0.2 : 0.3) * Math.max(0.12, edge) + (light ? 0.02 : 0.015);
          ctx.beginPath();
          let started = false;
          for (let k = 0; k <= POINTS; k++) {
            const s = k / POINTS;
            // How far this point is behind the growing tip (the ribbon grows from the right)
            const lead = reveal * 1.15 - (1 - s);
            if (lead < 0) continue;
            const x = (-0.15 + 1.3 * s) * W;
            // The ribbon twists along its length; the ends and the growing tip pinch into thin tendrils
            const twist = Math.cos(TAU * 1.3 * s + tw * 1.4);
            const pinch = Math.pow(Math.sin(Math.PI * Math.min(1, Math.max(0, s * 1.15 - 0.05))), 0.6);
            const tip = Math.min(1, lead / 0.18);
            const spread = r.width * H * (1 + vel * 0.6);
            const wobble = Math.sin(s * 17 + j * 0.9 + t * 0.0012) * (1.2 + vel * 4);
            const y = centre(s) + u * spread * twist * pinch * tip + wobble;
            if (!started) {
              ctx.moveTo(x, y);
              started = true;
            } else ctx.lineTo(x, y);
          }
          if (!started) continue;
          ctx.lineWidth = Math.abs(u) < 0.08 ? 1.1 : 0.7;
          ctx.strokeStyle = `rgba(${cr},${cg},${cb},${a})`;
          ctx.stroke();
        }
      }
      ctx.globalCompositeOperation = "source-over";
    };

    const frame = (t: number) => {
      if (!start) start = t;
      const dt = lastT ? Math.min((t - lastT) / 1000, 0.05) : 0;
      lastT = t;
      const y = window.scrollY;
      const speed = dt ? Math.abs(y - lastY) / dt : 0;
      lastY = y;
      vel += (Math.min(1, speed / 2500) - vel) * Math.min(1, dt * 4);
      // Time keeps the strands flowing; scrolling pushes them along faster
      flow += dt * (0.35 + vel * 2.2);
      draw(t);
      if (running) raf = requestAnimationFrame(frame);
    };

    const startLoop = () => {
      if (running || reduced) return;
      running = true;
      lastT = 0;
      raf = requestAnimationFrame(frame);
    };
    const stopLoop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };

    readTheme();
    resize();
    if (reduced) draw(0);
    const onScroll = () => reduced && draw(0);
    window.addEventListener("scroll", onScroll, { passive: true });
    const ro = new ResizeObserver(() => {
      resize();
      if (!running) draw(performance.now());
    });
    ro.observe(canvas);
    const io = new IntersectionObserver(([e]) => (e.isIntersecting ? startLoop() : stopLoop()));
    io.observe(wrap);
    const mo = new MutationObserver(() => {
      readTheme();
      if (!running) draw(performance.now());
    });
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    const onVis = () => (document.hidden ? stopLoop() : startLoop());
    document.addEventListener("visibilitychange", onVis);

    return () => {
      stopLoop();
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("visibilitychange", onVis);
      ro.disconnect();
      io.disconnect();
      mo.disconnect();
    };
  }, []);

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 z-0">
      <canvas ref={canvasRef} className="sticky top-0 block h-svh w-full" />
    </div>
  );
}
