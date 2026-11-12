"use client";

import { useEffect, useRef } from "react";

/**
 * Contact page: a tight bundle of fine glowing strands that starts under the header and grows downward
 * as the page scrolls. The growing tip sits at the same share of the screen as the scroll position
 * (30% scrolled → the tip is 30% down the screen), so the trail is always "as far as you've read".
 * The strands keep flowing while they grow. The canvas is sticky inside the page wrapper and only
 * draws the part of the trail that is on screen.
 */

const TAU = Math.PI * 2;

type Bundle = {
  key: "brand" | "human" | "pale";
  strands: number;
  width: number; // px between the outer strands
  x: number; // centre line, share of the viewport width
  sway: number; // how far the centre line wanders, share of the width
  freq: number; // wander cycles per 1000px of page
  phase: number;
  speed: number;
};

const BUNDLES: Bundle[] = [
  { key: "brand", strands: 40, width: 60, x: 0.8, sway: 0.07, freq: 0.9, phase: 0, speed: 1 },
  { key: "human", strands: 26, width: 36, x: 0.78, sway: 0.1, freq: 0.7, phase: 2.4, speed: -0.8 },
  { key: "pale", strands: 18, width: 24, x: 0.82, sway: 0.09, freq: 1.2, phase: 4.3, speed: 1.3 },
];

const STEP = 7; // px between points along a strand

const hexToRgb = (hex: string) => {
  const h = hex.trim().replace("#", "");
  const n = parseInt(h.length === 3 ? h.replace(/./g, "$&$&") : h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255] as const;
};

const ease = (x: number) => 1 - Math.pow(1 - x, 3);

export function VenomTrail() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    const wrap = canvas?.parentElement?.parentElement;
    if (!canvas || !ctx || !wrap) return;

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
    let lastT = 0;
    let lastY = window.scrollY;
    let vel = 0;
    let flow = 0;
    let tipShown = 0; // eased tip position (screen px), so fast scrolls still grow smoothly

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

    const draw = (t: number, dt: number) => {
      ctx.clearRect(0, 0, W, H);
      if (!W || !H) return;
      const r = wrap.getBoundingClientRect();
      const top = -r.top; // how far the wrapper has scrolled past the top of the screen
      const p = Math.min(1, Math.max(0, top / Math.max(1, r.height - H)));
      // Intro: the trail drops out of the header to just under the hero text
      const intro = reduced ? 1 : ease(Math.min(1, (t - start) / 1600));
      const head = 88; // the header's height: the trail starts right under it
      const rest = head + (H * 0.42 - head) * intro;
      // Tip on screen: from `rest` at the top of the page to the bottom of the screen at the end
      const target = Math.max(rest, rest + p * (H - rest));
      tipShown = dt && !reduced ? tipShown + (target - tipShown) * Math.min(1, dt * 6) : target;
      const tip = tipShown;
      const startY = Math.max(0, head - top); // the trail's top, in screen px (it scrolls away with the header)

      ctx.globalCompositeOperation = light ? "source-over" : "lighter";
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      const mobile = W < 640;

      for (const b of BUNDLES) {
        const [cr, cg, cb] = colors[b.key];
        const tw = flow * b.speed + b.phase;
        // Centre line in page coordinates, so it scrolls with the page while it wanders
        const cx = (pageY: number) =>
          W * ((mobile ? 0.88 : b.x) + b.sway * Math.sin((TAU * b.freq * pageY) / 1000 + tw * 0.35 + b.phase));
        const width = b.width * (mobile ? 0.6 : 1) * (1 + vel * 0.8);

        // Soft glow along the bundle (dark only)
        if (!light) {
          ctx.beginPath();
          for (let y = startY; y <= tip; y += STEP * 2) {
            const x = cx(y + top);
            if (y === startY) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.lineWidth = width * 1.3;
          ctx.strokeStyle = `rgba(${cr},${cg},${cb},0.035)`;
          ctx.stroke();
        }

        for (let j = 0; j < b.strands; j++) {
          const u = j / (b.strands - 1) - 0.5;
          const a = (light ? 0.24 : 0.32) * Math.max(0.15, 1 - Math.abs(u) * 1.6) + 0.02;
          ctx.beginPath();
          let first = true;
          for (let y = startY; y <= tip + 0.5; y += STEP) {
            const py = y + top;
            // The bundle twists as it runs down; it pinches to a point at the growing tip and at its start
            const twist = Math.cos((TAU * py) / 900 + tw * 1.3);
            const pinch = Math.min(1, (tip - y) / 160) * Math.min(1, (y - startY + 40) / 120);
            const wobble = Math.sin(py * 0.02 + j * 0.8 + t * 0.0014) * (1 + vel * 3);
            const x = cx(py) + u * width * twist * pinch + wobble;
            if (first) {
              ctx.moveTo(x, y);
              first = false;
            } else ctx.lineTo(x, y);
          }
          ctx.lineWidth = Math.abs(u) < 0.1 ? 1.1 : 0.7;
          ctx.strokeStyle = `rgba(${cr},${cg},${cb},${a})`;
          ctx.stroke();
        }
      }

      // Glowing head at the tip of the main bundle
      const main = BUNDLES[0];
      const tipX = W * ((mobile ? 0.88 : main.x) + main.sway * Math.sin((TAU * main.freq * (tip + top)) / 1000 + (flow * main.speed + main.phase) * 0.35 + main.phase));
      const [cr, cg, cb] = colors.brand;
      const g = ctx.createRadialGradient(tipX, tip, 0, tipX, tip, 46);
      g.addColorStop(0, `rgba(${cr},${cg},${cb},${light ? 0.35 : 0.6})`);
      g.addColorStop(1, `rgba(${cr},${cg},${cb},0)`);
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(tipX, tip, 46, 0, TAU);
      ctx.fill();
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
      flow += dt * (0.4 + vel * 2);
      draw(t, dt);
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
    if (reduced) draw(0, 0);
    const onScroll = () => reduced && draw(0, 0);
    window.addEventListener("scroll", onScroll, { passive: true });
    const ro = new ResizeObserver(() => {
      resize();
      if (!running) draw(performance.now(), 0);
    });
    ro.observe(canvas);
    const io = new IntersectionObserver(([e]) => (e.isIntersecting ? startLoop() : stopLoop()));
    io.observe(wrap);
    const mo = new MutationObserver(() => {
      readTheme();
      if (!running) draw(performance.now(), 0);
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
