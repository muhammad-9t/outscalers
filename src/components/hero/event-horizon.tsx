"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/cn";

/** Distance from the canvas bottom to the horizon line. The glass editor overlaps this strip, so the light spilling into it shows through. */
export const HORIZON_INSET = 200;

type Particle = { a: number; d: number; v: number; swirl: number; size: number; tone: number; age: number; vis: number; glyph: string };

// Code fragments that drift into the horizon in place of plain particles
const GLYPHS = [
  "{ }", "</>", "=>", "( )", "[ ]", ";", "fn", "const", "if", "return", "async", "await", "0", "1", "&&", "!=",
  "++", "//", "#", "λ", "import", "def", "SELECT", "</div>", "AI", "true", "null", "let", "map()", "===",
];

// Fragments arrive within this angle of the horizon on each side (about 58°)
const SIDE = Math.PI * 0.32;

const hexToRgb = (hex: string) => {
  const h = hex.trim().replace("#", "");
  const n = parseInt(h.length === 3 ? h.replace(/./g, "$&$&") : h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255] as const;
};

/**
 * A black-hole style horizon: an empty centre wrapped in a bell of fine glowing strands
 * that ripple like liquid and flare out along the horizon. Code fragments are drawn in from every direction.
 * Colours come from the theme tokens, so it follows light and dark mode.
 */
export function EventHorizon({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    let W = 0;
    let H = 0;
    let span = 0; // width of the content column (the editor), which the horizon flare is limited to
    let R = 0; // particles fade out once they reach this distance from the centre
    let U = 0; // size of the glow: height of the tallest strand
    let r0 = 0; // radius of the empty centre the strands wrap around
    const glow = document.createElement("canvas");
    let cx = 0;
    let hy = 0;
    let light = false;
    let mono = "ui-monospace, monospace";
    let colors: Record<string, readonly [number, number, number]> = {};
    let particles: Particle[] = [];
    let raf = 0;
    let last = 0;
    let running = false;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const rgba = (key: string, a: number) => {
      const [r, g, b] = colors[key];
      return `rgba(${r},${g},${b},${a})`;
    };

    const readTheme = () => {
      const css = getComputedStyle(canvas);
      const get = (name: string) => hexToRgb(css.getPropertyValue(`--color-${name}`) || "#ff700e");
      light = document.documentElement.dataset.theme === "light";
      const jet = css.getPropertyValue("--font-jetbrains-mono").trim();
      mono = jet ? `${jet}, ui-monospace, monospace` : "ui-monospace, monospace";
      colors = { b200: get("brand-200"), b300: get("brand-300"), b400: get("brand-400"), b500: get("brand-500"), b600: get("brand-600"), core: get("ink-950") };
      // Light: the pale text shades are darkened for reading, which turns brown on a canvas, so use the vivid fills
      if (light) {
        colors.b200 = colors.b400;
        colors.b300 = colors.b500;
      }
      const [r, g, b] = colors.b200;
      colors.hot = light ? colors.b400 : [r + (255 - r) * 0.6, g + (255 - g) * 0.6, b + (255 - b) * 0.6];
    };

    const spawn = (anywhere: boolean): Particle => {
      const far = Math.hypot(W / 2, hy) * 1.05;
      return {
        // Upper half, from the outer sides only, so the space under the heading stays clear
        a: Math.random() < 0.5 ? Math.PI + Math.random() * SIDE : 2 * Math.PI - Math.random() * SIDE,
        d: anywhere ? R * 1.2 + Math.random() * (far - R * 1.2) : far * (0.75 + Math.random() * 0.3),
        v: 18 + Math.random() * 30,
        swirl: (Math.random() < 0.5 ? -1 : 1) * (0.15 + Math.random() * 0.35),
        size: 0.8 + Math.random() * 0.8,
        tone: Math.random(),
        age: anywhere ? 1 : 0,
        vis: 1,
        glyph: GLYPHS[Math.floor(Math.random() * GLYPHS.length)],
      };
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = canvas.clientWidth;
      H = canvas.clientHeight;
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const col = canvas.parentElement;
      if (col) {
        const cs = getComputedStyle(col);
        span = col.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
      }
      span = Math.min(span || W, W);
      cx = W / 2;
      hy = H - HORIZON_INSET;
      U = Math.min(hy * 1.25, span * 0.32, 360);
      r0 = U * 0.36;
      R = U * 0.6;
      const count = Math.round(Math.min(34, Math.max(14, W / 42)));
      particles = Array.from({ length: count }, () => spawn(true));
      paintGlow(dpr);
    };

    // Height of a bell-shaped strand at horizontal offset dx: flat-topped, with a skirt that hugs the horizon.
    const bell = (dx: number, h: number, sigma: number) => h * Math.exp(-Math.pow(Math.abs(dx) / sigma, 2.4));

    const STRANDS = 40;

    // The innermost arch. Every strand, and the glow behind them, is a scaled copy of it (scale k).
    const h0 = () => r0 * 1.04;
    const s0 = () => h0() * 1.25;
    const archY = (x: number) => Math.max(bell(x, h0(), s0()), Math.sqrt(Math.max(0, r0 * r0 - x * x)));
    const kMax = () => (U * 0.62) / h0();
    const reachOf = (k: number) => Math.min(span / 2, s0() * k * 2.6);

    // The glow behind the strands barely changes, so it is painted once per resize or theme change.
    // It is a narrow band that follows the strands' shape, ending just past the outermost one.
    const paintGlow = (dpr: number) => {
      glow.width = Math.round(W * dpr);
      glow.height = Math.round(H * dpr);
      const gx = glow.getContext("2d");
      if (!gx || U <= 0) return;
      gx.setTransform(dpr, 0, 0, dpr, 0, 0);
      gx.filter = "blur(10px)";
      const trace = (k: number, forward: boolean) => {
        const reach = reachOf(k);
        for (let j = 0; j <= 160; j++) {
          const x = (forward ? -1 : 1) * reach * (1 - (2 * j) / 160);
          gx.lineTo(cx + x, hy - k * archY(x / k));
        }
      };
      const kOut = kMax() * 1.03;
      const reach = reachOf(kOut);
      const g = gx.createLinearGradient(cx - reach, 0, cx + reach, 0);
      g.addColorStop(0, rgba("b400", 0));
      g.addColorStop(0.25, rgba("b400", light ? 0.06 : 0.3));
      g.addColorStop(0.75, rgba("b400", light ? 0.06 : 0.3));
      g.addColorStop(1, rgba("b400", 0));
      gx.fillStyle = g;
      gx.beginPath();
      trace(kOut, true);
      trace(0.94, false); // overlaps the hole's rim so there's no dark seam under the innermost strand
      gx.closePath();
      gx.fill();
      // A brighter blurred line along the innermost strand: the white-hot part
      gx.lineWidth = r0 * 0.12;
      gx.strokeStyle = rgba("hot", light ? 0.1 : 0.45);
      gx.beginPath();
      trace(1.04, true);
      gx.stroke();
      gx.filter = "none";
    };

    const draw = (t: number, dt: number) => {
      ctx.clearRect(0, 0, W, H);
      // Nothing to draw while the canvas is collapsed (e.g. mid-navigation); the radii would go negative
      if (U <= 0 || r0 <= 0) return;
      const add = light ? "source-over" : "lighter";

      ctx.globalCompositeOperation = add;
      let g: CanvasGradient;

      // Code fragments, pulled toward the centre
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      // Boxes of the fragments drawn so far this frame. A fragment that would land on one fades out
      // until it is clear again, so no two words ever sit on top of each other.
      const placed: [number, number, number, number][] = [];
      for (const p of particles) {
        if (dt) {
          const pull = 1 + (R * 2.2) / Math.max(p.d - R * 0.9, 8);
          p.d -= p.v * pull * dt;
          p.a += p.swirl * (R / p.d) * dt;
          p.age = Math.min(1, p.age + dt * 0.8);
        }
        if (p.d < R * 1.02) Object.assign(p, spawn(false));
        const fade = Math.min(1, (p.d - R) / (R * 0.6)) * p.age;
        if (fade <= 0) continue;
        const x = cx + Math.cos(p.a) * p.d;
        const y = hy + Math.sin(p.a) * p.d;
        if (y > hy) continue;
        // Fragments shrink as they near the centre, as if falling in
        const shrink = 0.45 + 0.55 * Math.min(1, (p.d - R) / (R * 1.4));
        const key = p.tone < 0.45 ? "b300" : p.tone < 0.8 ? "b200" : "b400";
        const px = (9 + p.size * 2.4) * shrink;
        ctx.font = `500 ${px.toFixed(1)}px ${mono}`;
        const hw = ctx.measureText(p.glyph).width / 2 + 6;
        const hh = px / 2 + 5;
        const hit = placed.some(([bx, by, bw, bh]) => Math.abs(x - bx) < hw + bw && Math.abs(y - by) < hh + bh);
        p.vis = hit ? Math.max(0, p.vis - dt * 6) : Math.min(1, p.vis + dt * 2);
        if (!dt) p.vis = hit ? 0 : 1;
        if (p.vis <= 0) continue;
        placed.push([x, y, hw, hh]);
        // Dimmer toward the middle, so the words stay at the sides and away from the heading
        const side = Math.min(1, Math.abs(x - cx) / (U * 1.6));
        const a = (light ? 0.45 : 0.5) * fade * p.vis * (0.25 + 0.75 * side);
        ctx.fillStyle = rgba(key, a * (0.8 + 0.2 * Math.sin(t * 0.003 + p.size * 9)));
        ctx.fillText(p.glyph, x, y);
      }

      // Bell glow (pre-painted), breathing slowly
      ctx.globalAlpha = 0.55 + 0.1 * Math.sin(t * 0.0011);
      // Skipped while the canvas has no size (drawImage throws on a 0×0 source)
      if (glow.width && glow.height) ctx.drawImage(glow, 0, 0, W, H);
      ctx.globalAlpha = 1;

      // Strands: fine glowing lines, white-hot on the inside and cooler outward.
      // Each one ripples, and a slow swell travels outward through them, so the bell looks liquid.
      // Every strand is a scaled copy of the innermost arch, so the outer ones keep the same shape.
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      for (let i = 0; i < STRANDS; i++) {
        const f = i / (STRANDS - 1);
        const swell = 1 + 0.025 * Math.sin(t * 0.0013 - f * 7);
        const k = (1 + (kMax() - 1) * Math.pow(f, 1.3)) * swell; // packed close together near the centre
        const sigma = s0() * k;
        const reach = reachOf(k);
        const a = light ? 0.5 * Math.pow(1 - f, 1.2) + 0.06 : 0.38 * Math.pow(1 - f, 1.4) + 0.03;
        const key = f < 0.12 ? "hot" : f < 0.45 ? "b200" : f < 0.75 ? "b300" : "b400";
        const fade = ctx.createLinearGradient(cx - reach, 0, cx + reach, 0);
        fade.addColorStop(0, rgba(key, 0));
        fade.addColorStop(0.22, rgba(key, a));
        fade.addColorStop(0.78, rgba(key, a));
        fade.addColorStop(1, rgba(key, 0));
        ctx.strokeStyle = fade;
        ctx.beginPath();
        for (let x = -reach; x <= reach; x += 5) {
          const ripple = 1 + 0.03 * Math.sin((x / sigma) * 5 - t * 0.0021 + i * 1.7) * Math.exp(-Math.pow(x / sigma, 2));
          const y = hy - k * archY(x / k) * ripple;
          if (x === -reach) ctx.moveTo(cx + x, y);
          else ctx.lineTo(cx + x, y);
        }
        // A wide, faint pass for the glow, then the fine line on top
        ctx.globalAlpha = light ? 0.02 : 0.08;
        ctx.lineWidth = 5;
        ctx.stroke();
        ctx.globalAlpha = 1;
        ctx.lineWidth = f < 0.12 ? 1.3 : 0.8;
        ctx.stroke();
        // Pulses of light running along the strand; inner strands flow faster
        ctx.setLineDash([24 + 40 * f, 180 + 120 * f]);
        ctx.lineDashOffset = -t * (0.09 - 0.05 * f) - i * 37;
        const pa = (light ? 0.35 : 0.3) * (1 - f * 0.7);
        const pulse = ctx.createLinearGradient(cx - reach, 0, cx + reach, 0);
        pulse.addColorStop(0, rgba("hot", 0));
        pulse.addColorStop(0.28, rgba("hot", pa));
        pulse.addColorStop(0.72, rgba("hot", pa));
        pulse.addColorStop(1, rgba("hot", 0));
        ctx.strokeStyle = pulse;
        ctx.lineWidth = f < 0.12 ? 1.4 : 1;
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Flare along the horizon
      ctx.globalCompositeOperation = add;
      for (const [rx, ry, a, key] of [
        [span * 0.5, 22, light ? 0.12 : 0.55, "b400"],
        [span * 0.42, 5, light ? 0.7 : 0.9, "b300"],
        [U * 1.6, 2, 1, "hot"],
      ] as const) {
        ctx.save();
        ctx.translate(cx, hy);
        ctx.scale(1, ry / rx);
        g = ctx.createRadialGradient(0, 0, 0, 0, 0, rx);
        g.addColorStop(0, rgba(key, a));
        g.addColorStop(1, rgba(key, 0));
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(0, 0, rx, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // Depth: inside the innermost strand the arch reads as a deep hole. It glows at its rim and fades
      // into darkness toward the centre, with nested arches shrinking inward for perspective.
      {
        const h0 = r0 * 1.04 * (1 + 0.025 * Math.sin(t * 0.0013));
        const s0 = h0 * 1.25;
        const reach0 = s0 * 2.6;
        const arch = (k: number) => {
          ctx.beginPath();
          ctx.moveTo(cx - reach0 * k, hy);
          for (let x = -reach0; x <= reach0; x += 4) {
            ctx.lineTo(cx + x * k, hy - Math.max(bell(x, h0, s0), Math.sqrt(Math.max(0, r0 * r0 - x * x))) * k);
          }
          ctx.lineTo(cx + reach0 * k, hy);
        };
        ctx.save();
        arch(1);
        ctx.closePath();
        ctx.clip();
        ctx.translate(cx, hy);
        ctx.scale(s0 / h0, 1);
        // Darkness deepening toward the centre
        ctx.globalCompositeOperation = "source-over";
        let d = ctx.createRadialGradient(0, 0, 0, 0, 0, h0);
        d.addColorStop(0, rgba("core", 1));
        d.addColorStop(0.5, rgba("core", 0.95));
        d.addColorStop(0.8, rgba("core", 0.5));
        d.addColorStop(1, rgba("core", 0));
        ctx.fillStyle = d;
        ctx.fillRect(-h0 * 3, -h0, h0 * 6, h0);
        // Glow at the rim, fading inward
        ctx.globalCompositeOperation = add;
        d = ctx.createRadialGradient(0, 0, 0, 0, 0, h0);
        d.addColorStop(0.5, rgba("b400", 0));
        d.addColorStop(0.8, rgba("b400", light ? 0.05 : 0.24));
        d.addColorStop(1, rgba("hot", light ? 0.14 : 0.42));
        ctx.fillStyle = d;
        ctx.fillRect(-h0 * 3, -h0, h0 * 6, h0);
        ctx.restore();

        // Nested arches drifting inward, dimmer as they go deeper
        ctx.save();
        arch(1);
        ctx.closePath();
        ctx.clip();
        ctx.globalCompositeOperation = add;
        ctx.lineWidth = 1;
        const drift = (t * 0.00035) % 1;
        for (let n = 0; n < 7; n++) {
          const k = Math.pow(0.8, n + drift);
          ctx.strokeStyle = rgba("b300", (light ? 0.25 : 0.35) * k * k * Math.min(1, (n + drift) * 2));
          arch(k);
          ctx.stroke();
        }
        ctx.restore();
      }

      // Light spilling below the horizon, behind the glass editor, so the glow fades into it
      ctx.save();
      ctx.beginPath();
      ctx.rect(0, hy, W, H - hy);
      ctx.clip();
      ctx.globalCompositeOperation = add;
      // Each layer fades out before the canvas bottom, so there is no hard edge inside the editor.
      for (const [rx, depth, a, key] of [
        [U * 1.6, 0.95, light ? 0.06 : 0.85, "b400"],
        [U * 0.8, 0.6, light ? 0.05 : 0.6, "hot"],
      ] as const) {
        ctx.save();
        ctx.translate(cx, hy);
        ctx.scale(1, (HORIZON_INSET * depth) / rx);
        g = ctx.createRadialGradient(0, 0, 0, 0, 0, rx);
        g.addColorStop(0, rgba(key, a));
        g.addColorStop(0.5, rgba(key, a * 0.35));
        g.addColorStop(1, rgba(key, 0));
        ctx.fillStyle = g;
        ctx.fillRect(-rx, 0, rx * 2, rx);
        ctx.restore();
      }
      ctx.restore();

      // Fade the left and right edges so everything ends softly at the editor's width
      ctx.globalCompositeOperation = "destination-out";
      const edge = Math.min(90, W * 0.1);
      for (const [x0, x1] of [
        [0, edge],
        [W, W - edge],
      ]) {
        const e = ctx.createLinearGradient(x0, 0, x1, 0);
        e.addColorStop(0, "rgba(0,0,0,1)");
        e.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = e;
        ctx.fillRect(Math.min(x0, x1), 0, edge, H);
      }
      ctx.globalCompositeOperation = "source-over";
    };

    const frame = (t: number) => {
      const dt = last ? Math.min((t - last) / 1000, 0.05) : 0;
      last = t;
      draw(t, dt);
      if (running) raf = requestAnimationFrame(frame);
    };

    const start = () => {
      if (running || reduced) return;
      running = true;
      last = 0;
      raf = requestAnimationFrame(frame);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };

    readTheme();
    resize();
    draw(0, 0);

    const ro = new ResizeObserver(() => {
      resize();
      if (!running) draw(0, 0);
    });
    ro.observe(canvas);
    const io = new IntersectionObserver(([e]) => (e.isIntersecting ? start() : stop()));
    io.observe(canvas);
    const mo = new MutationObserver(() => {
      readTheme();
      paintGlow(Math.min(window.devicePixelRatio || 1, 2));
      if (!running) draw(0, 0);
    });
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme", "class"] });

    return () => {
      stop();
      ro.disconnect();
      io.disconnect();
      mo.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className={cn("block h-86 w-full mask-[linear-gradient(to_bottom,transparent,black_18%)] sm:h-94 lg:h-[clamp(23.5rem,44vh,30rem)]", className)}
    />
  );
}
