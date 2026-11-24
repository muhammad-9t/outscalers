"use client";

import { type CSSProperties, type PointerEvent as ReactPointerEvent, type ReactNode, useEffect, useLayoutEffect, useRef, useState } from "react";
import { List, PackageOpen, RotateCcw } from "lucide-react";

type Group = { group: string; items: string[] };
/** One colour per tool group (groups run up to six per service). */
const TONES = ["brand", "human", "data", "success", "muted", "danger"] as const;

/* ------------------------------------------------------------------------------------------
 * A tiny 2D physics world. Every tool pill is a capsule (a segment with a radius), so pills
 * roll, tumble and stack. The bucket walls are static capsules, and the mouse cursor is an
 * infinitely heavy round "pusher". Units are CSS pixels and seconds.
 * ---------------------------------------------------------------------------------------- */
type Body = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  a: number; // angle
  w: number; // angular velocity
  hl: number; // half length of the capsule's core segment
  r: number; // radius (half the pill height)
  im: number; // inverse mass
  iI: number; // inverse inertia
};
type Pill = Body & { el: HTMLElement; wpx: number; hpx: number; alive: boolean; spawnAt: number; slot: number; im0: number; iI0: number };
type Wall = Body; // im = iI = 0

const GRAVITY = 2000;
const SUBSTEPS = 6;
const RESTITUTION = 0.25;
const FRICTION = 0.45;
const MAX_SPEED = 2600;
const STAGGER = 0.1; // seconds between pills dropping in

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

/** Closest points between segments P1Q1 and P2Q2 (Ericson, Real-Time Collision Detection 5.1.9). */
function closest(p1x: number, p1y: number, q1x: number, q1y: number, p2x: number, p2y: number, q2x: number, q2y: number) {
  const d1x = q1x - p1x, d1y = q1y - p1y, d2x = q2x - p2x, d2y = q2y - p2y;
  const rx = p1x - p2x, ry = p1y - p2y;
  const a = d1x * d1x + d1y * d1y, e = d2x * d2x + d2y * d2y, f = d2x * rx + d2y * ry;
  let s = 0, t = 0;
  if (a > 1e-9 || e > 1e-9) {
    if (a <= 1e-9) t = clamp(f / e, 0, 1);
    else {
      const c = d1x * rx + d1y * ry;
      if (e <= 1e-9) s = clamp(-c / a, 0, 1);
      else {
        const b = d1x * d2x + d1y * d2y, denom = a * e - b * b;
        s = denom !== 0 ? clamp((b * f - c * e) / denom, 0, 1) : 0;
        t = (b * s + f) / e;
        if (t < 0) { t = 0; s = clamp(-c / a, 0, 1); }
        else if (t > 1) { t = 1; s = clamp((b - c) / a, 0, 1); }
      }
    }
  }
  return [p1x + d1x * s, p1y + d1y * s, p2x + d2x * t, p2y + d2y * t] as const;
}

const ends = (b: Body) => {
  const dx = Math.cos(b.a) * b.hl, dy = Math.sin(b.a) * b.hl;
  return [b.x - dx, b.y - dy, b.x + dx, b.y + dy] as const;
};

/** Pushes A and B apart and exchanges impulses (with friction) if their capsules overlap. */
function collide(A: Body, B: Body) {
  const [a1x, a1y, a2x, a2y] = ends(A);
  const [b1x, b1y, b2x, b2y] = ends(B);
  const [c1x, c1y, c2x, c2y] = closest(a1x, a1y, a2x, a2y, b1x, b1y, b2x, b2y);
  let nx = c2x - c1x, ny = c2y - c1y;
  const dist = Math.hypot(nx, ny);
  const pen = A.r + B.r - dist;
  if (pen <= 0) return;
  if (dist > 1e-6) { nx /= dist; ny /= dist; } else { nx = 0; ny = -1; }
  const imSum = A.im + B.im;
  if (imSum === 0) return;

  // Position: split the overlap by inverse mass
  const corr = (Math.max(pen - 0.3, 0) * 0.85) / imSum;
  A.x -= nx * corr * A.im; A.y -= ny * corr * A.im;
  B.x += nx * corr * B.im; B.y += ny * corr * B.im;

  // Velocity at the contact point
  const px = c1x + nx * A.r, py = c1y + ny * A.r;
  const rax = px - A.x, ray = py - A.y, rbx = px - B.x, rby = py - B.y;
  const rvx = B.vx - B.w * rby - (A.vx - A.w * ray);
  const rvy = B.vy + B.w * rbx - (A.vy + A.w * rax);
  const vn = rvx * nx + rvy * ny;
  if (vn >= 0) return;
  const rnA = rax * ny - ray * nx, rnB = rbx * ny - rby * nx;
  const j = (-(1 + RESTITUTION) * vn) / (imSum + rnA * rnA * A.iI + rnB * rnB * B.iI);
  A.vx -= nx * j * A.im; A.vy -= ny * j * A.im; A.w -= rnA * j * A.iI;
  B.vx += nx * j * B.im; B.vy += ny * j * B.im; B.w += rnB * j * B.iI;

  // Friction along the tangent, limited by the normal impulse
  let tx = rvx - vn * nx, ty = rvy - vn * ny;
  const tl = Math.hypot(tx, ty);
  if (tl < 1e-6) return;
  tx /= tl; ty /= tl;
  const rtA = rax * ty - ray * tx, rtB = rbx * ty - rby * tx;
  const jt = clamp(-(rvx * tx + rvy * ty) / (imSum + rtA * rtA * A.iI + rtB * rtB * B.iI), -FRICTION * j, FRICTION * j);
  A.vx -= tx * jt * A.im; A.vy -= ty * jt * A.im; A.w -= rtA * jt * A.iI;
  B.vx += tx * jt * B.im; B.vy += ty * jt * B.im; B.w += rtB * jt * B.iI;
}

const wall = (ax: number, ay: number, bx: number, by: number, r = 5): Wall => ({
  x: (ax + bx) / 2, y: (ay + by) / 2, vx: 0, vy: 0, w: 0, im: 0, iI: 0, r,
  a: Math.atan2(by - ay, bx - ax), hl: Math.hypot(bx - ax, by - ay) / 2,
});

/** The bucket: a glass tub, wider at the top, sitting on the stage floor. */
function bucketShape(W: number, H: number) {
  const top = Math.min(W * 0.92, 660);
  const bottom = top * 0.8;
  const height = H * 0.74;
  const cx = W / 2, floor = H - 14, rim = floor - height;
  return { cx, floor, rim, tl: cx - top / 2, tr: cx + top / 2, bl: cx - bottom / 2, br: cx + bottom / 2 };
}

function makeWalls(W: number, H: number) {
  const b = bucketShape(W, H);
  return [
    wall(b.tl, b.rim, b.bl, b.floor),
    wall(b.bl, b.floor, b.br, b.floor),
    wall(b.br, b.floor, b.tr, b.rim),
    // Stage edges keep anything thrown out of the bucket on screen
    wall(-40, H + 40, W + 40, H + 40, 40),
    wall(-40, -900, -40, H + 40, 40),
    wall(W + 40, -900, W + 40, H + 40, 40),
  ];
}

type Pointer = { on: boolean; mouse: boolean; x: number; y: number; vx: number; vy: number; at: number; grab: number };
type World = { pills: Pill[]; walls: Wall[]; W: number; H: number; ptr: Pointer };
const newWorld = (): World => ({ pills: [], walls: [], W: 0, H: 0, ptr: { on: false, mouse: false, x: 0, y: 0, vx: 0, vy: 0, at: 0, grab: -1 } });

/** Advances the world by dt seconds. */
function advance(world: World, dt: number, t: number) {
  const { pills, walls, ptr } = world;
  const h = dt / SUBSTEPS;
  const pusher: Body = { x: ptr.x, y: ptr.y, vx: ptr.vx, vy: ptr.vy, a: 0, w: 0, hl: 0, r: 22, im: 0, iI: 0 };
  const usePusher = ptr.on && ptr.mouse && ptr.grab < 0;

  for (let s = 0; s < SUBSTEPS; s++) {
    for (let k = 0; k < pills.length; k++) {
      const p = pills[k];
      if (!p.alive) {
        if (t < p.spawnAt) continue;
        const b = bucketShape(world.W, world.H);
        const mouth = (b.tr - b.tl) * 0.7;
        p.alive = true;
        p.x = b.cx - mouth / 2 + ((p.slot * 0.618) % 1) * mouth;
        p.y = -p.hpx;
        p.a = (((p.slot * 0.37) % 1) - 0.5) * 0.9;
        p.vx = 0; p.vy = 120; p.w = (((p.slot * 0.53) % 1) - 0.5) * 4;
        p.el.style.opacity = "1";
      }
      // A held pill is picked up: it follows the pointer exactly and shoves the others aside
      // (infinite mass), and it can be lifted out over the glass
      const held = k === ptr.grab;
      p.im = held ? 0 : p.im0;
      p.iI = held ? 0 : p.iI0;
      if (held) {
        // Dragged: steer towards the pointer, keep the momentum for a throw
        p.vx = clamp((ptr.x - p.x) * 22, -MAX_SPEED, MAX_SPEED);
        p.vy = clamp((ptr.y - p.y) * 22, -MAX_SPEED, MAX_SPEED);
        p.w *= 0.9;
      } else p.vy += GRAVITY * h;
      p.vx *= 0.9995; p.vy *= 0.9995; p.w *= 0.997;
      const sp = Math.hypot(p.vx, p.vy);
      if (sp > MAX_SPEED) { p.vx *= MAX_SPEED / sp; p.vy *= MAX_SPEED / sp; }
      p.w = clamp(p.w, -25, 25);
      p.x += p.vx * h; p.y += p.vy * h; p.a += p.w * h;
    }
    for (let i = 0; i < pills.length; i++) {
      const A = pills[i];
      if (!A.alive) continue;
      for (let j = i + 1; j < pills.length; j++) if (pills[j].alive) collide(A, pills[j]);
      for (const w of walls) collide(w, A);
      if (usePusher) collide(pusher, A);
    }
  }
}

function paint(world: World) {
  for (const p of world.pills) {
    if (p.alive) p.el.style.transform = `translate3d(${p.x - p.wpx / 2}px, ${p.y - p.hpx / 2}px, 0) rotate(${p.a}rad)`;
  }
}

/**
 * Tools and techniques: a grouped list of chips, plus a "See our stack" button that pours every
 * tool into a glass bucket the visitor can play with (push pills with the cursor, or drag and
 * throw them). Styles: .stk-* in globals.css.
 */
export function StackBucket({ heading, groups }: { heading: ReactNode; groups: Group[] }) {
  const [open, setOpen] = useState(false);
  const [round, setRound] = useState(0);
  const [size, setSize] = useState<{ W: number; H: number } | null>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const worldRef = useRef<World>(newWorld());
  const loopRef = useRef<{ raf: number; t: number; last: number; quietSince: number; wake: () => void } | null>(null);
  const items = groups.flatMap((g, gi) => g.items.map((item) => ({ item, tone: TONES[gi % TONES.length] })));

  // Track the stage size; the walls are rebuilt to match
  useEffect(() => {
    const stage = stageRef.current;
    if (!open || !stage) return;
    const ro = new ResizeObserver(([e]) => setSize({ W: e.contentRect.width, H: e.contentRect.height }));
    ro.observe(stage);
    return () => ro.disconnect();
  }, [open, round]);

  useEffect(() => {
    if (!size) return;
    const world = worldRef.current;
    world.W = size.W;
    world.H = size.H;
    world.walls = makeWalls(size.W, size.H);
    for (const p of world.pills) {
      p.x = clamp(p.x, p.r, size.W - p.r);
      p.y = Math.min(p.y, size.H - p.r);
    }
    loopRef.current?.wake();
  }, [size]);

  // Build the pills and run the loop while the bucket is open
  useLayoutEffect(() => {
    const stage = stageRef.current;
    if (!open || !stage || !size) return;
    const els = Array.from(stage.querySelectorAll<HTMLElement>("[data-pill]"));
    const n = els.length;
    const world = worldRef.current;
    // Layout effects run before the size effect above, so set the walls here too
    world.W = size.W;
    world.H = size.H;
    world.walls = makeWalls(size.W, size.H);
    world.pills = els.map((el, i) => {
      const wpx = el.offsetWidth, hpx = el.offsetHeight;
      const r = hpx / 2, hl = Math.max(0, (wpx - hpx) / 2);
      const m = (wpx * hpx) / 1000;
      el.style.opacity = "0";
      return {
        el, wpx, hpx, r, hl, x: 0, y: 0, vx: 0, vy: 0, a: 0, w: 0, alive: false,
        im: 1 / m, iI: 1 / ((m * (wpx * wpx + hpx * hpx)) / 12),
        im0: 1 / m, iI0: 1 / ((m * (wpx * wpx + hpx * hpx)) / 12),
        // Shuffle the drop order so groups mix in the bucket
        spawnAt: ((i * 7) % n) * STAGGER, slot: (i * 7) % n,
      };
    });

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      // Settle instantly: simulate the whole drop off-screen, then show the result
      for (let t = 0; t < n * STAGGER + 4; t += 1 / 60) advance(world, 1 / 60, t);
      paint(world);
      return;
    }

    const loop = { raf: 0, t: 0, last: 0, quietSince: 0, wake: () => {} };
    const frame = (now: number) => {
      const dt = Math.min((now - (loop.last || now)) / 1000, 1 / 30) || 1 / 60;
      loop.last = now;
      loop.t += dt;
      advance(world, dt, loop.t);
      paint(world);
      // Sleep once everything has dropped and settled and nobody is interacting
      const moving = world.pills.some((p) => !p.alive || Math.hypot(p.vx, p.vy) > 6 || Math.abs(p.w) > 0.2);
      if (moving || world.ptr.grab >= 0 || (world.ptr.on && world.ptr.mouse)) loop.quietSince = now;
      if (now - loop.quietSince > 800) { loop.raf = 0; return; }
      loop.raf = requestAnimationFrame(frame);
    };
    loop.wake = () => {
      if (loop.raf) return;
      loop.last = 0;
      loop.quietSince = performance.now();
      loop.raf = requestAnimationFrame(frame);
    };
    loopRef.current = loop;
    loop.wake();
    return () => {
      cancelAnimationFrame(loop.raf);
      loopRef.current = null;
    };
    // `size` is read through advance; a resize re-runs walls only, not the drop
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, round, size !== null]);

  // Pointer: the mouse pushes pills; mouse or touch can grab, drag and throw one
  const toLocal = (e: ReactPointerEvent) => {
    // Kept inside the stage, so a dragged pill can't be pulled off it
    const r = stageRef.current!.getBoundingClientRect();
    return [clamp(e.clientX - r.left, 16, r.width - 16), clamp(e.clientY - r.top, 16, r.height - 16)] as const;
  };
  const onMove = (e: ReactPointerEvent) => {
    const p = worldRef.current.ptr;
    const [x, y] = toLocal(e);
    const now = performance.now();
    const dt = Math.max((now - p.at) / 1000, 1 / 240);
    if (p.on && dt < 0.1) {
      p.vx = p.vx * 0.5 + ((x - p.x) / dt) * 0.5;
      p.vy = p.vy * 0.5 + ((y - p.y) / dt) * 0.5;
    } else { p.vx = 0; p.vy = 0; }
    Object.assign(p, { on: true, mouse: e.pointerType === "mouse", x, y, at: now });
    loopRef.current?.wake();
  };
  const onDown = (e: ReactPointerEvent) => {
    // Grab the nearest pill within reach of the press: the hovering cursor pushes pills, so the
    // one you aim for has often slid a little from under the pointer by the time you click
    const world = worldRef.current;
    const [x, y] = toLocal(e);
    let i = -1;
    let best = 24;
    world.pills.forEach((p, k) => {
      if (!p.alive) return;
      const [ax, ay, bx, by] = ends(p);
      const [cx, cy] = closest(ax, ay, bx, by, x, y, x, y);
      const gap = Math.hypot(x - cx, y - cy) - p.r;
      if (gap < best) { best = gap; i = k; }
    });
    if (i < 0) return;
    onMove(e);
    world.ptr.grab = i;
    world.pills[i]?.el.classList.add("is-held");
    stageRef.current?.setPointerCapture(e.pointerId);
    e.preventDefault();
  };
  const onUp = (e: ReactPointerEvent) => {
    const world = worldRef.current;
    world.pills[world.ptr.grab]?.el.classList.remove("is-held");
    world.ptr.grab = -1;
    if (stageRef.current?.hasPointerCapture(e.pointerId)) stageRef.current.releasePointerCapture(e.pointerId);
    if (e.pointerType !== "mouse") worldRef.current.ptr.on = false;
  };
  const onLeave = () => {
    if (worldRef.current.ptr.grab < 0) worldRef.current.ptr.on = false;
  };

  const b = size ? bucketShape(size.W, size.H) : null;
  const tub = b
    ? `M${b.tl} ${b.rim} L${b.bl} ${b.floor - 18} Q${b.bl + 1.5} ${b.floor} ${b.bl + 20} ${b.floor} L${b.br - 20} ${b.floor} Q${b.br - 1.5} ${b.floor} ${b.br} ${b.floor - 18} L${b.tr} ${b.rim}`
    : "";

  return (
    <div className="grid gap-10 lg:gap-12">
      <div className="text-center">
        {heading}
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <button type="button" className="btn btn-secondary stk-toggle" aria-pressed={open} onClick={() => setOpen((o) => !o)}>
            {open ? <List aria-hidden className="size-4" /> : <PackageOpen aria-hidden className="size-4" />}
            {open ? "Show as list" : "See our stack"}
          </button>
          {open && (
            <button type="button" className="stk-again" onClick={() => setRound((r) => r + 1)}>
              <RotateCcw aria-hidden className="size-4" /> Drop again
            </button>
          )}
        </div>
        {open && <p className="mt-4 hidden text-sm text-fg-subtle sm:block">Push the tools with your cursor, or grab one and throw it.</p>}
      </div>

      <div className="min-w-0">
        <dl className={open ? "sr-only" : "mx-auto grid max-w-5xl gap-8 text-center sm:grid-cols-2 lg:grid-cols-3"}>
          {groups.map((c, gi) => (
            <div key={c.group} data-reveal style={{ "--reveal-delay": `${gi * 60}ms` } as CSSProperties}>
              <dt className="text-sm font-semibold text-fg">{c.group}</dt>
              <dd className="mt-3 flex flex-wrap justify-center gap-2">
                {c.items.map((item) => (
                  <span key={item} className="chip">
                    {item}
                  </span>
                ))}
              </dd>
            </div>
          ))}
        </dl>

        {open && (
          <div className="stk">
            <div
              key={round}
              ref={stageRef}
              className="stk-stage"
              aria-hidden
              onPointerMove={onMove}
              onPointerDown={onDown}
              onPointerUp={onUp}
              onPointerCancel={onUp}
              onPointerLeave={onLeave}
            >
              {b && (
                <svg className="stk-back" width="100%" height="100%">
                  <ellipse cx={b.cx} cy={b.floor + 6} rx={(b.br - b.bl) / 2 + 24} ry="10" className="stk-shadow" />
                  <path d={`${tub} Z`} className="stk-glass" />
                </svg>
              )}
              {items.map(({ item, tone }, i) => (
                <span key={item} data-pill={i} data-tone={tone} className="stk-pill">
                  {item}
                </span>
              ))}
              {b && (
                <svg className="stk-front" width="100%" height="100%">
                  <path d={tub} className="stk-edge" />
                  <line x1={b.tl - 4} y1={b.rim} x2={b.tr + 4} y2={b.rim} className="stk-rim" />
                  <path d={`M${b.tl + 16} ${b.rim + 14} L${b.bl + 16} ${b.floor - 26}`} className="stk-shine" />
                </svg>
              )}
            </div>
            <ul className="stk-legend" aria-hidden>
              {groups.map((g, gi) => (
                <li key={g.group} data-tone={TONES[gi % TONES.length]}>
                  {g.group}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
