"use client";

import { useEffect, useMemo, useRef, type RefObject } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import type { ShowcaseScreen } from "@/content/portfolio";
import { tokenize } from "./code-tokens";

/* ------------------------------------------------------------------
   A laptop built from primitives. It stays pinned while the showcase
   scrolls: the lid opens as the section arrives, then the laptop swaps
   sides for each project while its screen types out that project's code
   (engineer first, then an AI suggestion that gets reviewed).
   ------------------------------------------------------------------ */

const SCREEN_W = 1024;
const SCREEN_H = 640;
const LID_OPEN = -0.22;
const LID_CLOSED = Math.PI / 2;
const CAMERA_Y = 0.4;

// Screen timeline, in seconds
const TYPE_SPEED = 45; // chars per second
const GHOST_DELAY = 0.3;
const ACCEPT_DELAY = 1.1;
const REVIEW_DELAY = 0.6;

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const smooth = (t: number) => t * t * (3 - 2 * t);

/* ---------------------------- Screen ---------------------------- */

type Palette = Record<"bg" | "onPill" | "bar" | "line" | "sub" | "text" | "kw" | "str" | "num" | "type" | "fn" | "brand" | "human", string>;

function readPalette(): Palette {
  const s = getComputedStyle(document.documentElement);
  const v = (name: string) => s.getPropertyValue(name).trim();
  return {
    bg: v("--color-code-bg"),
    onPill: v("--color-device-bezel"),
    bar: v("--color-ink-950"),
    line: v("--color-line-strong"),
    sub: v("--color-fg-subtle"),
    text: v("--color-code-text"),
    kw: v("--color-code-kw"),
    str: v("--color-code-str"),
    num: v("--color-code-num"),
    type: v("--color-code-type"),
    fn: v("--color-brand-300"),
    brand: v("--color-brand-400"),
    human: v("--color-human-accent"),
  };
}

function timeline(screen: ShowcaseScreen) {
  const humanChars = screen.code.slice(0, screen.aiFrom).reduce((n, l) => n + l.length + 1, 0);
  const ghostAt = humanChars / TYPE_SPEED + GHOST_DELAY;
  const acceptAt = ghostAt + ACCEPT_DELAY;
  const reviewAt = acceptAt + REVIEW_DELAY;
  return { ghostAt, acceptAt, reviewAt };
}

function pill(ctx: CanvasRenderingContext2D, x: number, y: number, label: string, color: string, onColor: string) {
  ctx.font = "600 15px ui-sans-serif, system-ui, sans-serif";
  const w = ctx.measureText(label).width + 20;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.roundRect(x, y, w, 24, 12);
  ctx.fill();
  ctx.fillStyle = onColor;
  ctx.fillText(label, x + 10, y + 17);
}

/** Draws the editor at time `t` (seconds since the project came into view). Returns true once finished. */
function drawScreen(ctx: CanvasRenderingContext2D, screen: ShowcaseScreen, t: number, p: Palette) {
  const { ghostAt, acceptAt, reviewAt } = timeline(screen);
  const mono = "22px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";
  const lineH = 38;
  const top = 92;
  const codeX = 84;

  ctx.fillStyle = p.bg;
  ctx.fillRect(0, 0, SCREEN_W, SCREEN_H);

  // Title bar
  ctx.fillStyle = p.bar;
  ctx.fillRect(0, 0, SCREEN_W, 48);
  ctx.fillStyle = p.line;
  for (const x of [26, 48, 70]) {
    ctx.beginPath();
    ctx.arc(x, 24, 6, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.font = "18px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";
  ctx.fillStyle = p.sub;
  ctx.textAlign = "center";
  ctx.fillText(screen.file, SCREEN_W / 2, 31);
  ctx.textAlign = "left";

  let budget = Math.floor(t * TYPE_SPEED);
  let caret: [number, number] | null = null;

  for (const [i, line] of screen.code.entries()) {
    const y = top + i * lineH;
    const isAi = i >= screen.aiFrom;
    if (isAi && t < ghostAt) continue;
    if (!isAi && budget <= 0) continue;

    ctx.font = mono;
    ctx.fillStyle = p.sub;
    ctx.textAlign = "right";
    ctx.fillText(String(i + 1), 54, y);
    ctx.textAlign = "left";

    if (isAi && t >= acceptAt) {
      ctx.fillStyle = p.brand;
      ctx.fillRect(66, y - 24, 4, lineH - 4);
    }

    const visible = isAi ? line : line.slice(0, budget);
    if (!isAi) {
      if (budget <= line.length) caret = [codeX + ctx.measureText(visible).width, y];
      budget -= line.length + 1;
    }

    let x = codeX;
    const ghost = isAi && t < acceptAt;
    ctx.globalAlpha = ghost ? 0.5 : 1;
    for (const [kind, text] of tokenize(visible)) {
      ctx.fillStyle = ghost ? p.brand : kind === "com" ? p.sub : kind === "dec" ? p.type : p[kind === "text" ? "text" : kind];
      ctx.fillText(text, x, y);
      x += ctx.measureText(text).width;
    }
    ctx.globalAlpha = 1;
  }

  // Engineer's caret while typing
  if (caret && t < ghostAt) {
    const [cx, cy] = caret;
    ctx.fillStyle = p.human;
    ctx.fillRect(cx + 2, cy - 22, 3, 28);
    pill(ctx, cx + 14, cy - 19, "Engineer", p.human, p.onPill);
  }
  // AI suggestion label, under the suggested lines
  if (t >= ghostAt && t < acceptAt) {
    pill(ctx, codeX, top + screen.code.length * lineH - 22, "AI suggestion · Tab to accept", p.brand, p.onPill);
  }

  // Status bar
  ctx.fillStyle = p.bar;
  ctx.fillRect(0, SCREEN_H - 48, SCREEN_W, 48);
  const status =
    t < ghostAt
      ? (["● Engineer writing the logic", p.human] as const)
      : t < acceptAt
        ? (["✦ AI drafting the rest", p.brand] as const)
        : t < reviewAt
          ? (["● Engineer reviewing the AI draft", p.human] as const)
          : (["✓ Reviewed by an engineer · ready for tests", p.brand] as const);
  ctx.font = "600 18px ui-sans-serif, system-ui, sans-serif";
  ctx.fillStyle = status[1];
  ctx.fillText(status[0], 24, SCREEN_H - 18);

  return t >= reviewAt;
}

/* ---------------------------- Laptop ---------------------------- */

const KEY_ROWS = Array.from({ length: 5 }, (_, r) => r);
const KEY_COLS = Array.from({ length: 13 }, (_, c) => c);

type Props = {
  screens: ShowcaseScreen[];
  /** The page hero: the laptop starts on its right-hand side. */
  heroRef: RefObject<HTMLDivElement | null>;
  /** The project chapters, one viewport tall each. */
  chaptersRef: RefObject<HTMLDivElement | null>;
  /** The HTML laptop frame around the project grid, where the 3D laptop hands off. */
  frameRef: RefObject<HTMLDivElement | null>;
  reducedMotion: boolean;
};

/**
 * Where the HTML frame is, and how far its stage has scrolled in: 0 when the stage
 * enters at the bottom → 1 when it reaches the top, which is when the frame pins.
 */
function frame3d(el: HTMLDivElement | null, vh: number) {
  if (!el) return { left: 0, top: vh * 2, width: 0, progress: 0 };
  const r = el.getBoundingClientRect();
  const stageTop = (el.closest("[data-handoff-stage]") ?? el).getBoundingClientRect().top;
  return { left: r.left, top: r.top, width: r.width, progress: clamp((vh - stageTop) / vh, 0, 1) };
}

function Laptop({ screens, heroRef, chaptersRef, frameRef, reducedMotion }: Props) {
  const group = useRef<THREE.Group>(null);
  const lid = useRef<THREE.Group>(null);
  const screenMat = useRef<THREE.MeshBasicMaterial>(null);
  const { size, viewport } = useThree();
  const device = useMemo(() => {
    const s = getComputedStyle(document.documentElement);
    const v = (name: string) => s.getPropertyValue(`--color-device-${name}`).trim();
    return { metal: v("metal"), bezel: v("bezel"), keys: v("keys"), key: v("key"), trackpad: v("trackpad") };
  }, []);
  const state = useRef({
    x: 0,
    y: 0,
    rotY: 0,
    scale: 1,
    ready: false,
    chapter: -1,
    start: 0,
    done: false,
    dirty: true,
    palette: null as Palette | null,
  });

  const canvas = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = SCREEN_W;
    c.height = SCREEN_H;
    return c;
  }, []);
  const texture = useMemo(() => {
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 8;
    return tex;
  }, [canvas]);

  // Redraw the screen in the new colours when the site theme changes
  useEffect(() => {
    const s = state.current;
    const mo = new MutationObserver(() => {
      s.palette = null;
      s.dirty = true;
    });
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => {
      mo.disconnect();
      texture.dispose();
    };
  }, [texture]);

  useFrame((frame, dt) => {
    const hero = heroRef.current;
    const chapters = chaptersRef.current;
    const g = group.current;
    const l = lid.current;
    if (!hero || !chapters || !g || !l) return;
    const s = state.current;
    const now = frame.clock.elapsedTime;
    const vh = window.innerHeight;
    const n = screens.length;
    const mobile = size.width < 1024;

    // Chapter index (0 … n-1) once the chapters reach the top of the viewport
    const ch = chapters.getBoundingClientRect();
    const c = clamp(-ch.top / vh, 0, n - 1);
    const i0 = Math.floor(c);
    const i1 = Math.min(i0 + 1, n - 1);
    const f = smooth(c - i0);

    // 0 at the top of the page → 1 when the first chapter fills the viewport
    const chaptersTop = ch.top + window.scrollY;
    const approach = smooth(clamp(window.scrollY / Math.max(chaptersTop, 1), 0, 1));

    const pose = (i: number) => {
      const side = i % 2 === 0 ? 1 : -1; // even chapters: text left, laptop right
      return mobile
        ? { x: 0, y: viewport.height * 0.2, rotY: -side * 0.35, scale: Math.min(1, viewport.width / 4.3) }
        : { x: side * viewport.width * 0.24, y: 0, rotY: -side * 0.45, scale: 1 };
    };
    // Hero pose: right of the hero copy, centred on where the hero sits at the top of the page
    const hr = hero.getBoundingClientRect();
    const heroCentre = hr.top + window.scrollY + hr.height / 2;
    const heroPose = mobile
      ? { ...pose(0), scale: 0 } // no room beside the copy on small screens: grow in on scroll
      : { x: viewport.width * 0.24, y: (0.5 - heroCentre / vh) * viewport.height, rotY: -0.4, scale: 0.8 };

    const a = pose(i0);
    const b = pose(i1);
    const chapterPose = {
      x: lerp(a.x, b.x, f),
      y: a.y + Math.sin(Math.PI * (c - i0)) * 0.25,
      rotY: lerp(a.rotY, b.rotY, f),
      scale: lerp(a.scale, b.scale, f),
    };
    const target = {
      x: lerp(heroPose.x, chapterPose.x, approach),
      y: lerp(heroPose.y, chapterPose.y, approach),
      rotY: lerp(heroPose.rotY, chapterPose.rotY, approach),
      scale: lerp(heroPose.scale, chapterPose.scale, approach),
    };

    const k = reducedMotion || !s.ready ? 1 : 1 - Math.exp(-dt * 6);
    s.ready = true;
    s.x += (target.x - s.x) * k;
    s.y += (target.y - s.y) * k;
    s.rotY += (target.rotY - s.rotY) * k;
    s.scale += (target.scale - s.scale) * k;

    // Entrance on first visit: the laptop rises and turns in, then the lid opens
    const enter = reducedMotion ? 1 : smooth(clamp((now - 0.15) / 1.3, 0, 1));
    const open = reducedMotion ? 1 : smooth(clamp((now - 0.7) / 1.1, 0, 1));
    const scale = s.scale * enter;
    const floating = {
      x: s.x,
      y: s.y - 0.95 * scale + lerp(-0.8, 0, enter),
      rotY: s.rotY + lerp(-1.1, 0, enter) + (reducedMotion ? 0 : Math.sin(now * 0.6) * 0.03),
    };

    // Hand-off: as the HTML laptop frame scrolls in, turn to face the viewer and line the
    // lid up with the frame exactly (no damping, so it tracks the scroll), then cross-fade.
    const fr = frame3d(frameRef.current, vh);
    const upp = viewport.height / vh; // world units per CSS pixel at z = 0
    const frontScale = (fr.width * upp) / 3.2; // lid width ↔ frame width
    const front = {
      x: (fr.left + fr.width / 2 - size.width / 2) * upp,
      y: (vh / 2 - fr.top) * upp - 2.2 * frontScale, // lid top ↔ frame top (the camera looks at the origin)
      z: 1.05 * frontScale, // brings the upright lid onto the z = 0 plane
    };
    const w = smooth(clamp(fr.progress / 0.8, 0, 1));
    const fade = clamp((fr.progress - 0.8) / 0.2, 0, 1);

    g.scale.setScalar(lerp(scale, frontScale, w));
    g.position.set(lerp(floating.x, front.x, w), lerp(floating.y, front.y, w), lerp(0, front.z, w));
    g.rotation.set(lerp(0.2, 0, w), lerp(floating.rotY, 0, w), 0);
    l.rotation.x = lerp(lerp(LID_CLOSED, LID_OPEN, open), 0, w);
    frame.gl.domElement.style.opacity = String(1 - fade);
    frameRef.current?.style.setProperty("--handoff", String(fade));

    // Screen: restart the typing when the project changes, and wait until the lid is open
    const chapter = Math.round(c);
    if (chapter !== s.chapter || open < 0.8) {
      if (chapter !== s.chapter) s.dirty = true;
      s.chapter = chapter;
      s.start = now;
      s.done = false;
    }
    if (!s.done || s.dirty) {
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      s.palette ??= readPalette();
      s.done = drawScreen(ctx, screens[chapter], reducedMotion ? Infinity : now - s.start, s.palette);
      s.dirty = false;
      if (screenMat.current?.map) screenMat.current.map.needsUpdate = true;
    }
  });

  return (
    <group ref={group}>
      {/* Base */}
      <mesh position={[0, 0.05, 0]}>
        <boxGeometry args={[3.2, 0.1, 2.15]} />
        <meshStandardMaterial color={device.metal} metalness={0.55} roughness={0.38} />
      </mesh>
      <mesh position={[0, 0.101, -0.32]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[2.86, 1.04]} />
        <meshStandardMaterial color={device.keys} roughness={0.9} />
      </mesh>
      {KEY_ROWS.map((r) =>
        KEY_COLS.map((col) => (
          <mesh key={`${r}-${col}`} position={[-1.32 + col * 0.22, 0.112, -0.73 + r * 0.2]}>
            <boxGeometry args={[0.18, 0.02, 0.16]} />
            <meshStandardMaterial color={device.key} roughness={0.7} />
          </mesh>
        )),
      )}
      <mesh position={[0, 0.101, 0.6]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[1.1, 0.62]} />
        <meshStandardMaterial color={device.trackpad} metalness={0.4} roughness={0.5} />
      </mesh>

      {/* Lid, hinged at the back edge of the base */}
      <group ref={lid} position={[0, 0.1, -1.05]}>
        <mesh position={[0, 1.05, -0.03]}>
          <boxGeometry args={[3.2, 2.1, 0.06]} />
          <meshStandardMaterial color={device.metal} metalness={0.55} roughness={0.38} />
        </mesh>
        <mesh position={[0, 1.05, 0.001]}>
          <planeGeometry args={[3.1, 2.0]} />
          <meshStandardMaterial color={device.bezel} roughness={0.25} />
        </mesh>
        <mesh position={[0, 1.08, 0.002]}>
          <planeGeometry args={[2.9, 2.9 * (SCREEN_H / SCREEN_W)]} />
          <meshBasicMaterial ref={screenMat} map={texture} toneMapped={false} />
        </mesh>
      </group>
    </group>
  );
}

function Lights() {
  const colors = useMemo(() => {
    const s = getComputedStyle(document.documentElement);
    return { brand: s.getPropertyValue("--color-brand-400").trim(), human: s.getPropertyValue("--color-human-accent").trim() };
  }, []);
  return (
    <>
      <ambientLight intensity={0.7} />
      <directionalLight position={[3, 5, 5]} intensity={1.8} />
      <pointLight position={[-4, 1.5, -2]} color={colors.brand} intensity={20} />
      <pointLight position={[4, -0.5, -2]} color={colors.human} intensity={18} />
    </>
  );
}

export function LaptopScene({ active, ...props }: Props & { active: boolean }) {
  return (
    <Canvas
      camera={{ position: [0, CAMERA_Y, 10.5], fov: 30 }}
      dpr={[1, 2]}
      frameloop={active ? "always" : "never"}
      gl={{ antialias: true, alpha: true }}
      fallback={null}
    >
      <Lights />
      <Laptop {...props} />
    </Canvas>
  );
}
