"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, type RefObject } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import type { ShowcaseScreen } from "@/content/portfolio";
import type { FocusPoint } from "./focus-glow";
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

/** Rounded rectangle centred on the origin, for the MacBook-style outlines. */
function roundedRect(w: number, h: number, r: number) {
  const x = -w / 2;
  const y = -h / 2;
  const s = new THREE.Shape();
  s.moveTo(x + r, y);
  s.lineTo(x + w - r, y);
  s.quadraticCurveTo(x + w, y, x + w, y + r);
  s.lineTo(x + w, y + h - r);
  s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  s.lineTo(x + r, y + h);
  s.quadraticCurveTo(x, y + h, x, y + h - r);
  s.lineTo(x, y + r);
  s.quadraticCurveTo(x, y, x + r, y);
  return s;
}

/** The display inside the bezel: a thin, even black border (0.05) and a slim chin, with rounded corners.
 *  The bezel spans y 0.04–2.06 on the lid; LaptopFrame's padding mirrors these proportions. */
const SCREEN = { w: 3.02, h: 3.02 * (SCREEN_H / SCREEN_W), y: 2.01 - (3.02 * (SCREEN_H / SCREEN_W)) / 2, r: 0.05 };

/** A rounded-rectangle panel whose UVs span 0–1 across it, so a texture fills it edge to edge. */
function roundedPanel(w: number, h: number, r: number) {
  const g = new THREE.ShapeGeometry(roundedRect(w, h, r), 12);
  const pos = g.attributes.position;
  const uv = g.attributes.uv;
  for (let i = 0; i < pos.count; i++) uv.setXY(i, (pos.getX(i) + w / 2) / w, (pos.getY(i) + h / 2) / h);
  uv.needsUpdate = true;
  return g;
}

/** Height of the base top deck (the lid hinges here). */
const DECK = 0.13;
/** Where the lid hinges on the base (z). */
const HINGE_Z = -1.05;
/** Height of the HTML frame's base strip (h-4), which the 3D base matches at the hand-off. */
const BASE_STRIP_PX = 16;
const BEVEL = 0.015;
const LID_T = 0.04;
const LID_BEVEL = 0.012;

/** Built once: rounded base and lid shells with soft bevels, rounded panels and keys. */
const KEY_GEO = new RoundedBoxGeometry(0.18, 0.02, 0.16, 2, 0.008);
function makeGeometries() {
  const base = new THREE.ExtrudeGeometry(roundedRect(3.2, 2.15, 0.2), {
    depth: DECK - BEVEL * 2,
    bevelEnabled: true,
    bevelThickness: BEVEL,
    bevelSize: BEVEL,
    bevelSegments: 3,
    curveSegments: 14,
  });
  base.rotateX(-Math.PI / 2);
  base.translate(0, BEVEL, 0);

  const lid = new THREE.ExtrudeGeometry(roundedRect(3.2, 2.1, 0.18), {
    depth: LID_T,
    bevelEnabled: true,
    bevelThickness: LID_BEVEL,
    bevelSize: LID_BEVEL,
    bevelSegments: 3,
    curveSegments: 14,
  });
  // Front face on z = 0, like the flat box it replaces (the hand-off maths relies on it)
  lid.translate(0, 1.05, -(LID_T + LID_BEVEL));

  const flat = (w: number, h: number, r: number) => new THREE.ShapeGeometry(roundedRect(w, h, r), 14);
  return {
    base,
    lid,
    bezel: flat(3.12, 2.02, 0.14),
    well: flat(2.9, 1.08, 0.06),
    trackpad: flat(1.25, 0.66, 0.06),
    shadow: new THREE.PlaneGeometry(4.6, 3.4),
    screen: roundedPanel(SCREEN.w, SCREEN.h, SCREEN.r),
    sheen: roundedPanel(SCREEN.w, SCREEN.h, SCREEN.r),
  };
}

/** Soft contact shadow and screen-glass sheen, drawn once into small canvases. */
function makeTextures() {
  const shadow = document.createElement("canvas");
  shadow.width = shadow.height = 128;
  const sc = shadow.getContext("2d")!;
  const g = sc.createRadialGradient(64, 64, 0, 64, 64, 64);
  g.addColorStop(0, "rgba(0,0,0,0.55)");
  g.addColorStop(0.55, "rgba(0,0,0,0.22)");
  g.addColorStop(1, "rgba(0,0,0,0)");
  sc.fillStyle = g;
  sc.fillRect(0, 0, 128, 128);

  const sheen = document.createElement("canvas");
  sheen.width = sheen.height = 256;
  const hc = sheen.getContext("2d")!;
  const lg = hc.createLinearGradient(0, 0, 256, 256);
  lg.addColorStop(0, "rgba(255,255,255,0.10)");
  lg.addColorStop(0.42, "rgba(255,255,255,0.03)");
  lg.addColorStop(0.43, "rgba(255,255,255,0)");
  lg.addColorStop(1, "rgba(255,255,255,0)");
  hc.fillStyle = lg;
  hc.fillRect(0, 0, 256, 256);

  return { shadow: new THREE.CanvasTexture(shadow), sheen: new THREE.CanvasTexture(sheen) };
}

const KEY_ROWS = 5;
const KEY_COLS = 13;

/** All 65 keys as one instanced mesh: a single draw call instead of 65. */
function Keys({ color }: { color: string }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  useLayoutEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    const m = new THREE.Matrix4();
    for (let r = 0; r < KEY_ROWS; r++) {
      for (let c = 0; c < KEY_COLS; c++) {
        mesh.setMatrixAt(r * KEY_COLS + c, m.makeTranslation(-1.32 + c * 0.22, DECK + 0.011, -0.73 + r * 0.2));
      }
    }
    mesh.instanceMatrix.needsUpdate = true;
  }, []);
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, KEY_ROWS * KEY_COLS]}>
      <primitive object={KEY_GEO} attach="geometry" />
      <meshStandardMaterial color={color} roughness={0.8} envMapIntensity={0.12} />
    </instancedMesh>
  );
}

/** With on-demand rendering, a frame is only drawn when the page scrolls or resizes (or the scene asks). */
function InvalidateOnScroll() {
  const invalidate = useThree((s) => s.invalidate);
  useEffect(() => {
    const onChange = () => invalidate(); // not invalidate directly: it would take the event as a frame count
    onChange();
    window.addEventListener("scroll", onChange, { passive: true });
    window.addEventListener("resize", onChange);
    return () => {
      window.removeEventListener("scroll", onChange);
      window.removeEventListener("resize", onChange);
    };
  }, [invalidate]);
  return null;
}

type Props = {
  screens: ShowcaseScreen[];
  /** The page hero: the laptop starts on its right-hand side. */
  heroRef: RefObject<HTMLDivElement | null>;
  /** The project chapters, one viewport tall each. */
  chaptersRef: RefObject<HTMLDivElement | null>;
  /** The HTML laptop frame around the project grid, where the 3D laptop hands off. */
  frameRef: RefObject<HTMLDivElement | null>;
  /** Receives the laptop screen's position in viewport pixels, the vanishing point of the tunnel behind it. */
  focusRef: RefObject<FocusPoint | null>;
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

const SCREEN_CENTRE = new THREE.Vector3();

function Laptop({ screens, heroRef, chaptersRef, frameRef, focusRef, reducedMotion }: Props) {
  const group = useRef<THREE.Group>(null);
  const lid = useRef<THREE.Group>(null);
  const base = useRef<THREE.Group>(null);
  const screenMat = useRef<THREE.MeshBasicMaterial>(null);
  const { size, viewport } = useThree();
  const geo = useMemo(() => makeGeometries(), []);
  const tex = useMemo(() => makeTextures(), []);
  useEffect(
    () => () => {
      Object.values(geo).forEach((g) => g.dispose());
      Object.values(tex).forEach((t) => t.dispose());
    },
    [geo, tex],
  );
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
    drawnAt: -Infinity,
    fade: -1,
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
    const bs = base.current;
    if (!hero || !chapters || !g || !l || !bs) return;
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

    // 0 once the (possibly pinned) hero has finished → 1 when the first chapter fills the viewport
    const chaptersTop = ch.top + window.scrollY;
    const hr = hero.getBoundingClientRect();
    const from = Math.max(0, hr.bottom + window.scrollY - vh);
    const approach = smooth(clamp((window.scrollY - from) / Math.max(chaptersTop - from, 1), 0, 1));

    const pose = (i: number) => {
      const side = i % 2 === 0 ? 1 : -1; // even chapters: text left, laptop right
      return mobile
        ? { x: 0, y: viewport.height * 0.2, rotY: -side * 0.35, scale: Math.min(1, viewport.width / 4.3) }
        : { x: side * viewport.width * 0.24, y: 0, rotY: -side * 0.45, scale: 1 };
    };
    // The hero has its own 3D scene, so the laptop grows in once the hero is done
    const heroPose = { ...pose(0), rotY: pose(0).rotY - 0.8, scale: 0 };

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

    // dt is clamped: with on-demand rendering the first frame after a pause can be long
    const k = reducedMotion || !s.ready ? 1 : 1 - Math.exp(-Math.min(dt, 1 / 30) * 6);
    s.ready = true;
    s.x += (target.x - s.x) * k;
    s.y += (target.y - s.y) * k;
    s.rotY += (target.rotY - s.rotY) * k;
    s.scale += (target.scale - s.scale) * k;
    const settling =
      Math.abs(target.x - s.x) + Math.abs(target.y - s.y) + Math.abs(target.rotY - s.rotY) + Math.abs(target.scale - s.scale) > 1e-3;

    // Entrance on first visit: the laptop rises and turns in, then the lid opens
    const enter = reducedMotion ? 1 : smooth(clamp((now - 0.15) / 1.3, 0, 1));
    const open = reducedMotion ? 1 : smooth(clamp((now - 0.7) / 1.1, 0, 1));
    const scale = s.scale * enter;
    const floating = {
      x: s.x,
      y: s.y - 0.95 * scale + lerp(-0.8, 0, enter),
      rotY: s.rotY + lerp(-1.1, 0, enter),
    };

    // Hand-off: as the HTML laptop frame scrolls in, turn to face the viewer and line the
    // lid up with the frame exactly (no damping, so it tracks the scroll), then cross-fade.
    const fr = frame3d(frameRef.current, vh);
    const upp = viewport.height / vh; // world units per CSS pixel at z = 0
    const frontScale = (fr.width * upp) / 3.2; // lid width ↔ frame width
    // Seen head-on, the HTML frame's base is a slim strip (16px tall, 3% wider than the lid each side),
    // so the 3D base folds into a matching lip: depth collapses toward the hinge, height shrinks to the strip
    const lipY = frontScale > 0 ? Math.min(1, (BASE_STRIP_PX * upp) / (DECK * frontScale)) : 1;
    const front = {
      x: (fr.left + fr.width / 2 - size.width / 2) * upp,
      y: (vh / 2 - fr.top) * upp - (DECK * lipY + 2.1) * frontScale, // lid top ↔ frame top (the camera looks at the origin)
      z: 1.05 * frontScale, // brings the upright lid onto the z = 0 plane
    };
    const w = smooth(clamp(fr.progress / 0.8, 0, 1));
    const fade = clamp((fr.progress - 0.8) / 0.2, 0, 1);

    const sy = lerp(1, lipY, w);
    const sz = lerp(1, 0.03, w);
    bs.scale.set(lerp(1, 1.06, w), sy, sz);
    bs.position.z = HINGE_Z * (1 - sz); // folds toward the hinge, not the centre
    l.position.y = DECK * sy;
    g.scale.setScalar(lerp(scale, frontScale, w));
    g.position.set(lerp(floating.x, front.x, w), lerp(floating.y, front.y, w), lerp(0, front.z, w));
    g.rotation.set(lerp(0.2, 0, w), lerp(floating.rotY, 0, w), 0);
    l.rotation.x = lerp(lerp(LID_CLOSED, LID_OPEN, open), 0, w);
    g.visible = fade < 1; // nothing to draw once the HTML frame has taken over
    // Only touch the DOM when the value changes (avoids style recalcs every frame)
    if (fade !== s.fade) {
      s.fade = fade;
      frame.gl.domElement.style.opacity = String(1 - fade);
      frameRef.current?.style.setProperty("--handoff", String(fade));
    }

    // Tell the tunnel where the screen is so its vanishing point sits right behind it
    g.updateMatrixWorld();
    const p = l.localToWorld(SCREEN_CENTRE.set(0, SCREEN.y, 0)).project(frame.camera);
    focusRef.current = { x: ((p.x + 1) / 2) * size.width, y: ((1 - p.y) / 2) * size.height };

    // Screen: restart the typing when the project changes, and wait until the lid is open
    const chapter = Math.round(c);
    if (chapter !== s.chapter || open < 0.8) {
      if (chapter !== s.chapter) s.dirty = true;
      s.chapter = chapter;
      s.start = now;
      s.done = false;
    }
    // Typing redraws are capped at ~30 fps: each one re-uploads the screen texture
    if (s.dirty || (!s.done && now - s.drawnAt >= 1 / 30)) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        s.palette ??= readPalette();
        s.done = drawScreen(ctx, screens[chapter], reducedMotion ? Infinity : now - s.start, s.palette);
        s.dirty = false;
        s.drawnAt = now;
        if (screenMat.current?.map) screenMat.current.map.needsUpdate = true;
      }
    }

    // Rendering is on demand: keep going only while something is still moving
    if (settling || enter < 1 || open < 1 || !s.done) frame.invalidate();
  });

  return (
    <group ref={group}>
      <group ref={base}>
      {/* Soft contact shadow under the base */}
      <mesh geometry={geo.shadow} position={[0, -0.005, 0.05]} rotation={[-Math.PI / 2, 0, 0]} renderOrder={-1}>
        <meshBasicMaterial map={tex.shadow} transparent depthWrite={false} toneMapped={false} />
      </mesh>

      {/* Base: rounded aluminium shell, keyboard well, keys and trackpad */}
      <mesh geometry={geo.base}>
        <meshStandardMaterial color={device.metal} metalness={0.75} roughness={0.38} />
      </mesh>
      <mesh geometry={geo.well} position={[0, DECK + 0.001, -0.32]} rotation={[-Math.PI / 2, 0, 0]}>
        <meshStandardMaterial color={device.keys} roughness={0.9} envMapIntensity={0.15} />
      </mesh>
      <Keys color={device.key} />
      <mesh geometry={geo.trackpad} position={[0, DECK + 0.001, 0.62]} rotation={[-Math.PI / 2, 0, 0]}>
        <meshStandardMaterial color={device.trackpad} metalness={0.55} roughness={0.38} />
      </mesh>
      {/* Hinge */}
      <mesh position={[0, DECK - 0.01, -1.02]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.045, 0.045, 2.5, 20]} />
        <meshStandardMaterial color={device.keys} metalness={0.6} roughness={0.4} />
      </mesh>
      </group>

      {/* Lid, hinged at the back edge of the base */}
      <group ref={lid} position={[0, DECK, HINGE_Z]}>
        <mesh geometry={geo.lid}>
          <meshStandardMaterial color={device.metal} metalness={0.75} roughness={0.38} />
        </mesh>
        <mesh geometry={geo.bezel} position={[0, 1.05, 0.001]}>
          <meshStandardMaterial color={device.bezel} roughness={0.2} metalness={0.2} />
        </mesh>
        {/* Camera */}
        <mesh position={[0, 2.035, 0.002]}>
          <circleGeometry args={[0.014, 16]} />
          <meshBasicMaterial color={device.keys} />
        </mesh>
        <mesh geometry={geo.screen} position={[0, SCREEN.y, 0.002]}>
          <meshBasicMaterial ref={screenMat} map={texture} toneMapped={false} />
        </mesh>
        {/* Glass sheen over the screen */}
        <mesh geometry={geo.sheen} position={[0, SCREEN.y, 0.003]}>
          <meshBasicMaterial map={tex.sheen} transparent depthWrite={false} toneMapped={false} />
        </mesh>
      </group>
    </group>
  );
}

const WHITE = new THREE.Color(1, 1, 1);

/** Soft studio reflections for the aluminium, generated once (no image download). */
export function Environment() {
  const get = useThree((st) => st.get);
  useEffect(() => {
    const { gl, scene, invalidate } = get();
    const pmrem = new THREE.PMREMGenerator(gl);
    const room = new RoomEnvironment();
    const env = pmrem.fromScene(room, 0.04).texture;
    scene.environment = env;
    scene.environmentIntensity = 0.42;
    invalidate();
    return () => {
      scene.environment = null;
      env.dispose();
      room.dispose();
      pmrem.dispose();
    };
  }, [get]);
  return null;
}

export function Lights() {
  const colors = useMemo(() => {
    const s = getComputedStyle(document.documentElement);
    return {
      brand: s.getPropertyValue("--color-brand-400").trim(),
      human: s.getPropertyValue("--color-human-accent").trim(),
      ground: s.getPropertyValue("--color-device-bezel").trim(),
    };
  }, []);
  return (
    <>
      <ambientLight intensity={0.3} />
      <hemisphereLight args={[WHITE, colors.ground, 0.5]} />
      <directionalLight position={[3, 5, 5]} intensity={2} />
      {/* Rim light from behind, so the rounded edges catch a highlight */}
      <directionalLight position={[-2, 3, -5]} intensity={1.4} />
      <pointLight position={[-4, 1.5, -2]} color={colors.brand} intensity={20} />
      <pointLight position={[4, -0.5, -2]} color={colors.human} intensity={18} />
    </>
  );
}

export function LaptopScene({ active, ...props }: Props & { active: boolean }) {
  return (
    <Canvas
      camera={{ position: [0, CAMERA_Y, 10.5], fov: 30 }}
      dpr={[1, 1.5]}
      frameloop={active ? "demand" : "never"}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      fallback={null}
    >
      <InvalidateOnScroll />
      <Environment />
      <Lights />
      <Laptop {...props} />
    </Canvas>
  );
}
