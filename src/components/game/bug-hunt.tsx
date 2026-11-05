"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Pause, Play, X } from "lucide-react";
import { cn } from "@/lib/cn";
import { lockScroll } from "@/lib/smooth-scroll";

/*
 * Bug Hunt: the pet robot defends production. Bugs drop from the top; the robot moves along the bottom
 * and fires its beam at them. Three bugs in production and it's game over. Drawn on one canvas, in the
 * site's colour tokens, so it matches either palette. Loaded only when the game is opened.
 */

type Phase = "ready" | "playing" | "paused" | "over";
type BugKind = "bug" | "race" | "legacy";
type PowerKind = "review" | "ai" | "coffee";

const BEST_KEY = "bug-hunt-best";
const LIVES = 3;
const SPRINT_S = 25; // a new sprint (faster, more bugs) every this many seconds
const REVIEW_CATCHES = 3;
const POWER_S = 8;
const DROP_CHANCE = 0.09;

const KINDS: Record<BugKind, { hp: number; r: number; speed: [number, number]; points: number }> = {
  bug: { hp: 1, r: 13, speed: [70, 110], points: 10 },
  race: { hp: 1, r: 11, speed: [115, 165], points: 20 }, // zig-zags
  legacy: { hp: 3, r: 22, speed: [38, 58], points: 40 }, // slow and tough
};

const LINES = {
  start: "Bugs incoming! Don't let them reach production.",
  kill: ["Squashed!", "Bug fixed. Ship it!", "Another one for the changelog.", "Clean code, clean hit.", "That's a closed ticket."],
  legacy: "Legacy code: finally refactored.",
  lost: ["One slipped into production!", "Hotfix needed!", "That one's going to page someone."],
  power: {
    review: "Code review is on: it catches the next 3 bugs.",
    ai: "AI assist: triple beam! An engineer is still aiming.",
    coffee: "Coffee! Fire rate doubled.",
  } as Record<PowerKind, string>,
};

const overLine = (score: number) =>
  score < 150 ? "Even our engineers miss one sometimes." : score < 500 ? "Not bad! Ready for a real sprint?" : "Impressive. Ever thought about a career in QA?";

type Bug = { x: number; y: number; kind: BugKind; hp: number; r: number; speed: number; t: number; flash: number };
type Shot = { x: number; y: number; vx: number; vy: number };
type Drop = { x: number; y: number; kind: PowerKind; t: number };
type Spark = { x: number; y: number; vx: number; vy: number; life: number; max: number; color: string };

const rand = (a: number, b: number) => a + Math.random() * (b - a);
const pick = <T,>(xs: T[]) => xs[Math.floor(Math.random() * xs.length)];

type Colors = Record<
  "bg" | "grid" | "line" | "fg" | "muted" | "subtle" | "brand" | "brandSoft" | "brandPale" | "human" | "data" | "danger" | "metal" | "ink" | "inkDeep" | "signal",
  string
>;
const readColors = (): Colors => {
  const s = getComputedStyle(document.documentElement);
  const v = (n: string) => s.getPropertyValue(`--color-${n}`).trim();
  return {
    bg: v("ink-950"),
    grid: v("line"),
    line: v("line-strong"),
    fg: v("fg"),
    muted: v("fg-muted"),
    subtle: v("fg-subtle"),
    brand: v("brand-400"),
    brandSoft: v("brand-300"),
    brandPale: v("brand-200"),
    human: v("human-accent"),
    data: v("data-accent"),
    danger: v("danger"),
    metal: v("device-metal"),
    ink: v("ink-800"),
    inkDeep: v("ink-950"),
    signal: v("signal"),
  };
};

const BUG_COLOR = (c: Colors, k: BugKind) => (k === "race" ? c.data : k === "legacy" ? c.metal : c.danger);
const POWER_COLOR = (c: Colors, k: PowerKind) => (k === "review" ? c.human : k === "ai" ? c.brandSoft : c.signal);
const POWER_LABEL: Record<PowerKind, string> = { review: "CR", ai: "AI", coffee: "☕" };

function rr(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
}

/** The pet, as on the site: head with a face screen, antenna and thrusters. (x, y) is its centre. */
function drawRobot(ctx: CanvasRenderingContext2D, c: Colors, x: number, y: number, t: number, tilt: number, firing: boolean, hurt: boolean) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(tilt);
  // Thrusters
  const flame = 10 + Math.sin(t * 40) * 3;
  ctx.fillStyle = c.brand;
  ctx.globalAlpha = 0.85;
  for (const fx of [-9, 9]) {
    ctx.beginPath();
    ctx.moveTo(fx - 4, 19);
    ctx.lineTo(fx, 19 + flame);
    ctx.lineTo(fx + 4, 19);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  // Arms
  ctx.fillStyle = c.ink;
  ctx.strokeStyle = c.line;
  ctx.lineWidth = 1.2;
  for (const ax of [-31, 23]) {
    rr(ctx, ax, -6, 8, 14, 4);
    ctx.fill();
    ctx.stroke();
  }
  // Antenna
  ctx.strokeStyle = c.line;
  ctx.beginPath();
  ctx.moveTo(0, -21);
  ctx.lineTo(0, -31);
  ctx.stroke();
  ctx.fillStyle = firing ? c.brandPale : c.brand;
  ctx.beginPath();
  ctx.arc(0, -32, 2.8, 0, Math.PI * 2);
  ctx.fill();
  // Head and face screen
  ctx.fillStyle = c.ink;
  ctx.strokeStyle = c.line;
  ctx.lineWidth = 1.5;
  rr(ctx, -28, -21, 56, 42, 20);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = c.inkDeep;
  ctx.strokeStyle = c.brand;
  ctx.globalAlpha = 0.9;
  rr(ctx, -21, -13, 42, 26, 12);
  ctx.fill();
  ctx.stroke();
  ctx.globalAlpha = 1;
  // Eyes: focused while firing, wincing when hurt
  ctx.fillStyle = c.brandSoft;
  ctx.strokeStyle = c.brandSoft;
  if (hurt) {
    ctx.lineWidth = 2.4;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(-11, -5);
    ctx.lineTo(-5, -1);
    ctx.lineTo(-11, 3);
    ctx.moveTo(11, -5);
    ctx.lineTo(5, -1);
    ctx.lineTo(11, 3);
    ctx.stroke();
  } else {
    const h = firing ? 5 : 11;
    rr(ctx, -11, -1 - h / 2, 6, h, 3);
    ctx.fill();
    rr(ctx, 5, -1 - h / 2, 6, h, 3);
    ctx.fill();
  }
  ctx.restore();
}

/** A beetle-like bug with wiggling legs. Legacy bugs are bigger and show their remaining hits. */
function drawBug(ctx: CanvasRenderingContext2D, c: Colors, b: Bug) {
  const col = b.flash > 0 ? c.fg : BUG_COLOR(c, b.kind);
  const r = b.r;
  ctx.save();
  ctx.translate(b.x, b.y);
  ctx.rotate(Math.PI); // head down: they're heading for production
  ctx.strokeStyle = col;
  ctx.lineWidth = Math.max(1.4, r / 9);
  ctx.lineCap = "round";
  // Legs
  const wiggle = Math.sin(b.t * 14) * r * 0.18;
  for (const side of [-1, 1]) {
    for (let i = -1; i <= 1; i++) {
      ctx.beginPath();
      ctx.moveTo(side * r * 0.5, i * r * 0.45);
      ctx.lineTo(side * r * 1.05, i * r * 0.55 + (i === 0 ? -wiggle : wiggle) * side);
      ctx.stroke();
    }
  }
  // Antennae
  ctx.beginPath();
  ctx.moveTo(-r * 0.2, -r * 0.95);
  ctx.lineTo(-r * 0.5, -r * 1.45);
  ctx.moveTo(r * 0.2, -r * 0.95);
  ctx.lineTo(r * 0.5, -r * 1.45);
  ctx.stroke();
  // Body and head
  ctx.fillStyle = col;
  ctx.globalAlpha = 0.9;
  ctx.beginPath();
  ctx.ellipse(0, r * 0.1, r * 0.62, r * 0.82, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(0, -r * 0.78, r * 0.36, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
  // Shell line
  ctx.strokeStyle = c.inkDeep;
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(0, -r * 0.55);
  ctx.lineTo(0, r * 0.85);
  ctx.stroke();
  ctx.restore();
  if (b.kind === "legacy") {
    ctx.fillStyle = c.muted;
    ctx.font = "600 10px ui-monospace, monospace";
    ctx.textAlign = "center";
    ctx.fillText(`LEGACY ${"■".repeat(b.hp)}`, b.x, b.y - r - 12);
  }
}

export function BugHunt({ onClose }: { onClose: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState<Phase>("ready");
  const phaseRef = useRef<Phase>("ready");
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(LIVES);
  const [sprint, setSprint] = useState(1);
  const [best, setBest] = useState(0);
  const [newBest, setNewBest] = useState(false);
  const [line, setLine] = useState<string | null>(null);
  const [powers, setPowers] = useState<{ review: number; ai: boolean; coffee: boolean }>({ review: 0, ai: false, coffee: false });
  const lineTimer = useRef(0);
  const reset = useRef<() => void>(() => {});

  const go = useCallback((p: Phase) => {
    phaseRef.current = p;
    setPhase(p);
  }, []);

  const comment = useCallback((text: string, ms = 2200) => {
    window.clearTimeout(lineTimer.current);
    setLine(text);
    lineTimer.current = window.setTimeout(() => setLine(null), ms);
  }, []);

  const start = useCallback(() => {
    reset.current();
    go("playing");
    comment(LINES.start, 2600);
    canvasRef.current?.focus();
  }, [comment, go]);

  // Page scrolling is frozen while the game is open; focus returns to where it was afterwards
  useEffect(() => {
    const before = document.activeElement as HTMLElement | null;
    lockScroll(true);
    rootRef.current?.focus();
    try {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- reading the saved best score once
      setBest(Number(localStorage.getItem(BEST_KEY) ?? 0));
    } catch {}
    return () => {
      lockScroll(false);
      window.clearTimeout(lineTimer.current);
      before?.focus?.();
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    let c = readColors();
    let W = 0;
    let H = 0;
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = canvas.clientWidth;
      H = canvas.clientHeight;
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    const mo = new MutationObserver(() => (c = readColors()));
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

    // Game state; only the scoreboard goes through React
    const g = {
      t: 0,
      score: 0,
      lives: LIVES,
      sprint: 1,
      kills: 0,
      px: 0,
      tilt: 0,
      lastPx: 0,
      nextShot: 0,
      spawnIn: 1,
      review: 0,
      ai: 0,
      coffee: 0,
      hurt: 0,
      shake: 0,
      bugs: [] as Bug[],
      shots: [] as Shot[],
      drops: [] as Drop[],
      sparks: [] as Spark[],
    };
    const input = { left: false, right: false, fire: false, mx: null as number | null };

    reset.current = () => {
      Object.assign(g, { t: 0, score: 0, lives: LIVES, sprint: 1, kills: 0, px: W / 2, lastPx: W / 2, tilt: 0, nextShot: 0, spawnIn: 1 });
      Object.assign(g, { review: 0, ai: 0, coffee: 0, hurt: 0, shake: 0, bugs: [], shots: [], drops: [], sparks: [] });
      input.mx = null;
      setScore(0);
      setLives(LIVES);
      setSprint(1);
      setNewBest(false);
      setPowers({ review: 0, ai: false, coffee: false });
    };
    g.px = g.lastPx = W / 2;

    const robotY = () => H - 96;
    const prodY = () => H - 34;
    const reviewY = () => H - 150;

    const burst = (x: number, y: number, color: string, n: number, speed = 220) => {
      for (let i = 0; i < n; i++) {
        const a = Math.random() * Math.PI * 2;
        const s = rand(speed * 0.3, speed);
        g.sparks.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: 0, max: rand(0.3, 0.7), color });
      }
    };
    const syncPowers = () => setPowers({ review: g.review, ai: g.ai > 0, coffee: g.coffee > 0 });

    const spawn = () => {
      const s = g.sprint;
      const roll = Math.random();
      const kind: BugKind = s >= 2 && roll < 0.12 + s * 0.02 ? "legacy" : s >= 2 && roll < 0.38 + s * 0.03 ? "race" : "bug";
      const k = KINDS[kind];
      const x = rand(k.r + 40, W - k.r - 40);
      g.bugs.push({ x, y: -k.r * 2, kind, hp: k.hp, r: k.r, speed: rand(...k.speed) * (1 + (s - 1) * 0.09), t: Math.random() * 10, flash: 0 });
    };

    const loseLife = (x: number) => {
      g.lives -= 1;
      g.shake = 0.35;
      g.hurt = 0.5;
      burst(x, prodY(), c.danger, 18, 260);
      setLives(g.lives);
      if (g.lives <= 0) {
        g.shake = 0.5;
        try {
          const prev = Number(localStorage.getItem(BEST_KEY) ?? 0);
          if (g.score > prev) {
            localStorage.setItem(BEST_KEY, String(g.score));
            setBest(g.score);
            setNewBest(true);
          }
        } catch {}
        go("over");
        comment(overLine(g.score), 6000);
      } else comment(pick(LINES.lost));
    };

    const update = (dt: number) => {
      g.t += dt;
      const s = 1 + Math.floor(g.t / SPRINT_S);
      if (s !== g.sprint) {
        g.sprint = s;
        setSprint(s);
        comment(`Sprint ${s}: they're getting faster.`);
      }

      // Move: the mouse leads; arrow keys or A/D work too
      const speed = g.coffee > 0 ? 720 : 520;
      if (input.left || input.right) {
        input.mx = null;
        g.px += ((input.right ? 1 : 0) - (input.left ? 1 : 0)) * speed * dt;
      } else if (input.mx !== null) g.px += (input.mx - g.px) * Math.min(1, dt * 14);
      g.px = Math.min(W - 36, Math.max(36, g.px));
      g.tilt += ((g.px - g.lastPx) / Math.max(dt, 1e-3) / 2600 - g.tilt) * Math.min(1, dt * 10);
      g.tilt = Math.max(-0.35, Math.min(0.35, g.tilt));
      g.lastPx = g.px;

      // Fire while the button or Space is held
      if (input.fire && g.t >= g.nextShot) {
        g.nextShot = g.t + (g.coffee > 0 ? 0.11 : 0.21);
        const y = robotY() - 36;
        const angles = g.ai > 0 ? [-0.2, 0, 0.2] : [0];
        for (const a of angles) g.shots.push({ x: g.px, y, vx: Math.sin(a) * 780, vy: -Math.cos(a) * 780 });
      }
      for (const sh of g.shots) {
        sh.x += sh.vx * dt;
        sh.y += sh.vy * dt;
      }
      g.shots = g.shots.filter((sh) => sh.y > -20 && sh.x > -20 && sh.x < W + 20);

      // Bugs arrive faster each sprint
      g.spawnIn -= dt;
      if (g.spawnIn <= 0) {
        spawn();
        g.spawnIn = Math.max(0.32, 1.25 - g.sprint * 0.11) * rand(0.7, 1.3);
      }
      for (const b of g.bugs) {
        b.t += dt;
        b.flash = Math.max(0, b.flash - dt);
        b.y += b.speed * dt;
        b.x += Math.sin(b.t * (b.kind === "race" ? 5 : 1.6)) * (b.kind === "race" ? 150 : 22) * dt;
        b.x = Math.min(W - b.r, Math.max(b.r, b.x));
      }

      // Hits
      for (const b of g.bugs) {
        for (const sh of g.shots) {
          if (sh.y < -10 || Math.hypot(sh.x - b.x, sh.y - b.y) > b.r + 5) continue;
          burst(sh.x, b.y, BUG_COLOR(c, b.kind), 4, 140);
          sh.y = -100; // spent
          b.hp -= 1;
          b.flash = 0.08;
          if (b.hp <= 0) {
            g.score += KINDS[b.kind].points * g.sprint;
            g.kills += 1;
            setScore(g.score);
            burst(b.x, b.y, BUG_COLOR(c, b.kind), b.kind === "legacy" ? 26 : 14);
            if (b.kind === "legacy") comment(LINES.legacy);
            else if (g.kills % 12 === 0) comment(pick(LINES.kill), 1600);
            if (Math.random() < DROP_CHANCE) g.drops.push({ x: b.x, y: b.y, kind: pick<PowerKind>(["review", "ai", "coffee"]), t: 0 });
          }
          break;
        }
      }
      g.shots = g.shots.filter((sh) => sh.y > -50);

      // Code review catches bugs before production; the rest cost a life
      const survivors: Bug[] = [];
      for (const b of g.bugs) {
        if (b.hp <= 0) continue;
        if (g.review > 0 && b.y > reviewY()) {
          g.review -= 1;
          burst(b.x, reviewY(), c.human, 16);
          syncPowers();
          if (g.review === 0) comment("Code review is out of capacity.", 1600);
          continue;
        }
        if (b.y - b.r > prodY()) {
          loseLife(b.x);
          if (phaseRef.current !== "playing") return;
          continue;
        }
        survivors.push(b);
      }
      g.bugs = survivors;

      // Power-ups: catch them with the robot
      for (const d of g.drops) {
        d.t += dt;
        d.y += 150 * dt;
        if (Math.abs(d.x - g.px) < 40 && Math.abs(d.y - robotY()) < 34) {
          d.y = H + 100;
          if (d.kind === "review") g.review = REVIEW_CATCHES;
          if (d.kind === "ai") g.ai = POWER_S;
          if (d.kind === "coffee") g.coffee = POWER_S;
          burst(g.px, robotY(), POWER_COLOR(c, d.kind), 18);
          comment(LINES.power[d.kind]);
          syncPowers();
        }
      }
      g.drops = g.drops.filter((d) => d.y < H + 30);
      const hadAi = g.ai > 0;
      const hadCoffee = g.coffee > 0;
      g.ai = Math.max(0, g.ai - dt);
      g.coffee = Math.max(0, g.coffee - dt);
      if (hadAi !== g.ai > 0 || hadCoffee !== g.coffee > 0) syncPowers();

      g.hurt = Math.max(0, g.hurt - dt);
      g.shake = Math.max(0, g.shake - dt);
    };

    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      ctx.save();
      if (g.shake > 0) ctx.translate(rand(-1, 1) * g.shake * 16, rand(-1, 1) * g.shake * 10);

      // Grid
      ctx.strokeStyle = c.grid;
      ctx.globalAlpha = 0.45;
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let x = (W % 48) / 2; x < W; x += 48) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, H);
      }
      for (let y = (g.t * 30) % 48; y < H; y += 48) {
        ctx.moveTo(0, y);
        ctx.lineTo(W, y);
      }
      ctx.stroke();
      ctx.globalAlpha = 1;

      // Production line, and the code review line while it is active
      ctx.font = "600 11px ui-monospace, monospace";
      ctx.textAlign = "left";
      ctx.setLineDash([8, 6]);
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = c.danger;
      ctx.beginPath();
      ctx.moveTo(0, prodY());
      ctx.lineTo(W, prodY());
      ctx.stroke();
      ctx.fillStyle = c.danger;
      ctx.fillText("PRODUCTION", 16, prodY() + 18);
      if (g.review > 0) {
        ctx.strokeStyle = c.human;
        ctx.lineDashOffset = -g.t * 30;
        ctx.beginPath();
        ctx.moveTo(0, reviewY());
        ctx.lineTo(W, reviewY());
        ctx.stroke();
        ctx.fillStyle = c.human;
        ctx.fillText(`CODE REVIEW ×${g.review}`, 16, reviewY() - 8);
      }
      ctx.setLineDash([]);
      ctx.lineDashOffset = 0;

      // Beam shots
      ctx.lineCap = "round";
      for (const sh of g.shots) {
        const len = 0.022;
        ctx.strokeStyle = c.brand;
        ctx.globalAlpha = 0.35;
        ctx.lineWidth = 7;
        ctx.beginPath();
        ctx.moveTo(sh.x, sh.y);
        ctx.lineTo(sh.x - sh.vx * len, sh.y - sh.vy * len);
        ctx.stroke();
        ctx.globalAlpha = 1;
        ctx.strokeStyle = c.brandPale;
        ctx.lineWidth = 2.2;
        ctx.stroke();
      }

      for (const b of g.bugs) drawBug(ctx, c, b);

      // Power-ups
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      for (const d of g.drops) {
        const col = POWER_COLOR(c, d.kind);
        const pulse = 1 + Math.sin(d.t * 8) * 0.08;
        ctx.strokeStyle = col;
        ctx.lineWidth = 2;
        ctx.fillStyle = c.inkDeep;
        ctx.beginPath();
        ctx.arc(d.x, d.y, 14 * pulse, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = col;
        ctx.font = "700 11px ui-monospace, monospace";
        ctx.fillText(POWER_LABEL[d.kind], d.x, d.y + 0.5);
      }
      ctx.textBaseline = "alphabetic";

      // Sparks
      for (const sp of g.sparks) {
        ctx.globalAlpha = 1 - sp.life / sp.max;
        ctx.fillStyle = sp.color;
        ctx.fillRect(sp.x - 1.5, sp.y - 1.5, 3, 3);
      }
      ctx.globalAlpha = 1;

      // Robot, with a glow while a power-up runs
      if (g.ai > 0 || g.coffee > 0) {
        ctx.fillStyle = g.ai > 0 ? c.brandSoft : c.signal;
        ctx.globalAlpha = 0.12 + Math.sin(g.t * 6) * 0.04;
        ctx.beginPath();
        ctx.arc(g.px, robotY(), 48, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      }
      drawRobot(ctx, c, g.px, robotY() + Math.sin(g.t * 3) * 3, g.t, g.tilt, input.fire, g.hurt > 0);
      ctx.restore();
    };

    let raf = 0;
    let last = performance.now();
    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (phaseRef.current === "playing") update(dt);
      // Sparks keep fading after a game ends
      for (const sp of g.sparks) {
        sp.life += dt;
        sp.x += sp.vx * dt;
        sp.y += sp.vy * dt;
        sp.vy += 300 * dt;
      }
      g.sparks = g.sparks.filter((sp) => sp.life < sp.max);
      draw();
    };
    raf = requestAnimationFrame(frame);

    const keyDir = (e: KeyboardEvent, down: boolean) => {
      const k = e.key.toLowerCase();
      if (k === "arrowleft" || k === "a") input.left = down;
      else if (k === "arrowright" || k === "d") input.right = down;
      else if (k === " " || k === "arrowup" || k === "w") input.fire = down;
      else return false;
      return true;
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key.toLowerCase() === "p" && (phaseRef.current === "playing" || phaseRef.current === "paused")) {
        go(phaseRef.current === "playing" ? "paused" : "playing");
        return;
      }
      if (e.key === "Enter" && phaseRef.current !== "playing") {
        e.preventDefault();
        if (phaseRef.current === "paused") go("playing");
        else start();
        return;
      }
      if (keyDir(e, true)) e.preventDefault();
    };
    const onKeyUp = (e: KeyboardEvent) => keyDir(e, false);
    const onMove = (e: PointerEvent) => {
      input.mx = e.clientX - canvas.getBoundingClientRect().left;
    };
    const onDown = (e: PointerEvent) => {
      if (e.button !== 0) return;
      input.fire = true;
      onMove(e);
    };
    const onUp = () => (input.fire = false);
    // Switching tabs pauses
    const onHide = () => document.hidden && phaseRef.current === "playing" && go("paused");

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("blur", onUp);
    document.addEventListener("visibilitychange", onHide);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      mo.disconnect();
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("blur", onUp);
      document.removeEventListener("visibilitychange", onHide);
    };
  }, [comment, go, onClose, start]);

  const hudLabel = "font-mono text-[10px] tracking-[0.16em] text-fg-subtle uppercase";
  // Straight into <body>, above the header and everything else
  return createPortal(
    <div
      ref={rootRef}
      role="dialog"
      aria-modal="true"
      aria-label="Bug Hunt game"
      tabIndex={-1}
      className="pointer-events-auto fixed inset-0 z-[100] bg-ink-950 outline-none"
    >
      <canvas
        ref={canvasRef}
        tabIndex={-1}
        aria-label="Game area: move with the mouse or arrow keys, hold the mouse button or Space to fire"
        className={cn("absolute inset-0 size-full touch-none outline-none select-none", phase === "playing" && "cursor-crosshair")}
      />

      {/* Scoreboard */}
      <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between gap-4 p-4 sm:p-6">
        <div className="flex gap-6">
          <div>
            <p className={hudLabel}>Score</p>
            <p className="font-mono text-2xl font-semibold text-fg tabular-nums">{score}</p>
          </div>
          <div>
            <p className={hudLabel}>Sprint</p>
            <p className="font-mono text-2xl font-semibold text-brand-300 tabular-nums">{sprint}</p>
          </div>
          <div>
            <p className={hudLabel}>Production</p>
            <p className="mt-2 flex gap-1.5" aria-label={`${lives} of ${LIVES} lives left`}>
              {Array.from({ length: LIVES }, (_, i) => (
                <span key={i} className={cn("size-3 border transition-colors", i < lives ? "border-danger bg-danger/70" : "border-line-strong")} />
              ))}
            </p>
          </div>
        </div>
        <div className="pointer-events-auto flex items-start gap-2">
          <div className="mr-2 text-right">
            <p className={hudLabel}>Best</p>
            <p className="font-mono text-2xl font-semibold text-fg-muted tabular-nums">{best}</p>
          </div>
          {(phase === "playing" || phase === "paused") && (
            <button
              type="button"
              aria-label={phase === "paused" ? "Resume" : "Pause"}
              onClick={() => go(phase === "paused" ? "playing" : "paused")}
              className="grid size-9 place-items-center border border-line-strong text-fg-muted transition-colors hover:text-fg"
            >
              {phase === "paused" ? <Play aria-hidden className="size-4" /> : <Pause aria-hidden className="size-4" />}
            </button>
          )}
          <button
            type="button"
            aria-label="Close the game"
            onClick={onClose}
            className="grid size-9 place-items-center border border-line-strong text-fg-muted transition-colors hover:text-fg"
          >
            <X aria-hidden className="size-4" />
          </button>
        </div>
      </div>

      {/* Active power-ups */}
      <div className="pointer-events-none absolute top-24 left-4 flex flex-col gap-1.5 sm:left-6">
        {powers.ai && <span className="font-mono text-xs text-brand-300">AI ASSIST · triple beam</span>}
        {powers.coffee && <span className="font-mono text-xs text-signal">COFFEE · fire rate ×2</span>}
        {powers.review > 0 && <span className="font-mono text-xs text-human-accent">CODE REVIEW · {powers.review} left</span>}
      </div>

      {/* What the robot says */}
      <p
        aria-live="polite"
        className={cn(
          "pointer-events-none absolute top-20 left-1/2 max-w-[min(32rem,calc(100vw-2rem))] -translate-x-1/2 border border-brand-400/40 bg-ink-950/90 px-3 py-1.5 text-sm text-fg shadow-[0_0_24px_-8px_var(--color-brand-500)] transition-opacity duration-300",
          line && phase !== "ready" ? "opacity-100" : "opacity-0",
        )}
      >
        <span className="mr-1.5 font-mono text-xs text-brand-300">{">"}</span>
        {line}
      </p>

      {/* Start, pause and game over screens */}
      {phase !== "playing" && (
        <div className="absolute inset-0 grid place-items-center p-4">
          <div className="w-full max-w-md border border-brand-400/40 bg-ink-950/95 p-6 text-center shadow-[0_0_40px_-12px_var(--color-brand-500)] sm:p-8">
            <p className="font-mono text-xs tracking-[0.2em] text-brand-300 uppercase">
              {phase === "ready" ? "Mini game" : phase === "paused" ? "Paused" : "Game over"}
            </p>
            <h2 className="mt-2 font-display text-3xl font-semibold text-fg">
              {phase === "over" ? `${score} points` : "Bug Hunt"}
            </h2>
            {phase === "ready" && (
              <>
                <p className="mt-3 text-sm leading-relaxed text-fg-muted">
                  Bugs are heading for production. Stop them before three get through.
                </p>
                <ul className="mt-5 grid gap-1.5 text-left text-sm text-fg-muted">
                  <li><span className="text-fg">Move:</span> mouse, or ← → / A D</li>
                  <li><span className="text-fg">Fire:</span> hold the mouse button, or Space</li>
                  <li><span className="text-fg">Power-ups:</span> catch them. <span className="text-human-accent">CR</span> code review, <span className="text-brand-300">AI</span> triple beam, <span className="text-signal">☕</span> faster fire</li>
                  <li><span className="text-fg">Pause:</span> P · <span className="text-fg">Quit:</span> Esc</li>
                </ul>
              </>
            )}
            {phase === "over" && (
              <p className="mt-3 text-sm leading-relaxed text-fg-muted">
                {newBest ? "New best score! " : `Best: ${best}. `}
                {overLine(score)}
              </p>
            )}
            <div className="mt-6 flex justify-center gap-3">
              <button
                type="button"
                onClick={() => (phase === "paused" ? go("playing") : start())}
                className="btn btn-primary"
              >
                {phase === "ready" ? "Start" : phase === "paused" ? "Resume" : "Play again"}
              </button>
              <button type="button" onClick={onClose} className="btn btn-secondary">
                Back to the site
              </button>
            </div>
          </div>
        </div>
      )}
    </div>,
    document.body,
  );
}
