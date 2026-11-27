"use client";

import { useEffect, useMemo, useRef, type RefObject } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { Environment, Lights } from "./laptop-scene";

/* ------------------------------------------------------------------
   Portfolio hero: an engineer at a desk, built from primitives.
   The hero is pinned while the page scrolls; `progress` (0 → 1) drives
   everything: the desk travels around a lit circular track, project
   screens fly in from the distance and orbit it, glossy tokens circle
   the other way, and at the end the camera pushes into the laptop screen.
   ------------------------------------------------------------------ */

type V3 = [number, number, number];

const clamp = (v: number, min = 0, max = 1) => Math.min(max, Math.max(min, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const smooth = (t: number) => t * t * (3 - 2 * t);
const span = (p: number, from: number, to: number) => smooth(clamp((p - from) / (to - from)));

const UP = new THREE.Vector3(0, 1, 0);
const TAU = Math.PI * 2;

/** Orbit timing (fractions of the pinned scroll). */
const ORBIT_FROM = 0.12;
const ORBIT_TO = 0.84;
/** Base heading, and the total turn: one and a half turns, ending over the engineer's shoulder. */
const HEADING = -0.55;
const TURN = Math.PI * 3 + 0.2;
/** Radius of the track the desk travels round, and of the project ring. */
const TRACK_R = 1.4;
const RING_R = 4.3;
const FLOOR_Y = -1.35;
const STAGE_SCALE = 0.9;
const CAMERA_POS = new THREE.Vector3(0, 2.6, 13);
const LOOK = new THREE.Vector3(0, -0.2, 0);

/** Position + rotation for a capsule running from a to b. */
function limb(a: V3, b: V3) {
  const va = new THREE.Vector3(...a);
  const d = new THREE.Vector3(...b).sub(va);
  const len = d.length();
  return {
    position: va.addScaledVector(d, 0.5),
    quaternion: new THREE.Quaternion().setFromUnitVectors(UP, d.normalize()),
    len,
  };
}

function Limb({ a, b, r, material }: { a: V3; b: V3; r: number; material: THREE.Material }) {
  const l = useMemo(() => limb(a, b), [a, b]);
  return (
    <mesh position={l.position} quaternion={l.quaternion} material={material}>
      <capsuleGeometry args={[r, l.len, 6, 14]} />
    </mesh>
  );
}

type Colors = ReturnType<typeof readColors>;

function readColors() {
  const s = getComputedStyle(document.documentElement);
  const v = (name: string) => s.getPropertyValue(`--color-${name}`).trim();
  return {
    skin: v("figure-skin"),
    hair: v("figure-hair"),
    pants: v("figure-pants"),
    shoe: v("figure-shoe"),
    wood: v("figure-wood"),
    chair: v("figure-chair"),
    metal: v("device-metal"),
    bezel: v("device-bezel"),
    keys: v("device-keys"),
    brand: v("brand-400"),
    brandSoft: v("brand-300"),
    human: v("human-accent"),
    codeBg: v("code-bg"),
    codeKw: v("code-kw"),
    codeStr: v("code-str"),
    codeText: v("code-text"),
  };
}

function makeMaterials(c: Colors) {
  // Soft vinyl-toy finish: a light clearcoat over a matte base
  const vinyl = (color: string, roughness = 0.5) =>
    new THREE.MeshPhysicalMaterial({ color, roughness, clearcoat: 0.55, clearcoatRoughness: 0.35 });
  const gloss = (color: string) =>
    new THREE.MeshPhysicalMaterial({ color, roughness: 0.18, metalness: 0.05, clearcoat: 1, clearcoatRoughness: 0.08 });
  return {
    skin: vinyl(c.skin, 0.6),
    hair: vinyl(c.hair, 0.7),
    shirt: vinyl(c.human, 0.55),
    pants: vinyl(c.pants, 0.7),
    shoe: vinyl(c.shoe, 0.45),
    chair: vinyl(c.chair, 0.6),
    wood: new THREE.MeshStandardMaterial({ color: c.wood, roughness: 0.55 }),
    metal: new THREE.MeshStandardMaterial({ color: c.metal, metalness: 0.75, roughness: 0.35 }),
    dark: new THREE.MeshStandardMaterial({ color: c.keys, roughness: 0.8 }),
    eye: new THREE.MeshBasicMaterial({ color: c.hair }),
    brand: gloss(c.brand),
    brandSoft: gloss(c.brandSoft),
    human: gloss(c.human),
    white: gloss(c.shoe),
    track: new THREE.MeshBasicMaterial({ color: c.brand, transparent: true, opacity: 0.85, toneMapped: false }),
    trackFaint: new THREE.MeshBasicMaterial({ color: c.brand, transparent: true, opacity: 0.22, toneMapped: false }),
    logo: new THREE.MeshBasicMaterial({ color: c.brand, toneMapped: false }),
    frame: new THREE.MeshStandardMaterial({ color: c.bezel, roughness: 0.3, metalness: 0.3 }),
  };
}
type Mats = ReturnType<typeof makeMaterials>;

/** The laptop's screen: an editor with code bars and an AI suggestion, drawn once. */
function makeScreenTexture(c: Colors) {
  const cv = document.createElement("canvas");
  cv.width = 512;
  cv.height = 320;
  const x = cv.getContext("2d")!;
  x.fillStyle = c.codeBg;
  x.fillRect(0, 0, 512, 320);
  x.fillStyle = c.keys;
  x.fillRect(0, 0, 512, 26);
  const rows: [number, number, string][] = [
    [30, 120, c.codeKw], [30, 210, c.codeText], [54, 160, c.codeStr], [54, 90, c.codeText],
    [30, 70, c.codeKw], [54, 240, c.codeText], [78, 140, c.codeStr], [54, 110, c.codeText],
  ];
  rows.forEach(([ox, w, col], i) => {
    x.fillStyle = col;
    x.beginPath();
    x.roundRect(ox, 46 + i * 24, w, 10, 5);
    x.fill();
  });
  // AI suggestion block
  x.globalAlpha = 0.55;
  x.fillStyle = c.brand;
  for (let i = 0; i < 3; i++) {
    x.beginPath();
    x.roundRect(54, 246 + i * 20 - 8 * 3, [200, 150, 230][i], 9, 4.5);
    x.fill();
  }
  x.globalAlpha = 1;
  x.fillRect(30, 222, 4, 58);
  const t = new THREE.CanvasTexture(cv);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

function makeShadowTexture() {
  const cv = document.createElement("canvas");
  cv.width = cv.height = 128;
  const x = cv.getContext("2d")!;
  const g = x.createRadialGradient(64, 64, 0, 64, 64, 64);
  g.addColorStop(0, "rgba(0,0,0,0.5)");
  g.addColorStop(0.6, "rgba(0,0,0,0.18)");
  g.addColorStop(1, "rgba(0,0,0,0)");
  x.fillStyle = g;
  x.fillRect(0, 0, 128, 128);
  return new THREE.CanvasTexture(cv);
}

/* ---------------------------- Figure ---------------------------- */

const SHOULDER = (s: number): V3 => [s * 0.38, 1.88, 0.1];
const ELBOW = (s: number): V3 => [s * 0.46, 1.42, 0.38];
const HAND = (s: number): V3 => [s * 0.2, 1.56, 0.78];
const FOREARM_LEN = new THREE.Vector3(...ELBOW(1)).distanceTo(new THREE.Vector3(...HAND(1)));

/** Seated engineer facing +z, typing; the hands and head move a little every frame. */
function Engineer({ m }: { m: Mats }) {
  const forearms = useRef<(THREE.Mesh | null)[]>([]);
  const hands = useRef<(THREE.Mesh | null)[]>([]);
  const head = useRef<THREE.Group>(null);
  const tmp = useMemo(() => ({ e: new THREE.Vector3(), h: new THREE.Vector3(), d: new THREE.Vector3() }), []);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    [-1, 1].forEach((s, i) => {
      const fa = forearms.current[i];
      const hd = hands.current[i];
      if (!fa || !hd) return;
      // Typing: quick, slightly out of step between the hands
      const tap = Math.max(0, Math.sin(t * 13 + i * 1.7)) * 0.03;
      tmp.e.set(...ELBOW(s));
      tmp.h.set(...HAND(s)).add(tmp.d.set(Math.sin(t * 2.1 + i) * 0.02, tap, Math.sin(t * 1.3 + i * 2) * 0.015));
      tmp.d.copy(tmp.h).sub(tmp.e).normalize();
      fa.quaternion.setFromUnitVectors(UP, tmp.d);
      fa.position.copy(tmp.e).addScaledVector(tmp.d, FOREARM_LEN / 2);
      hd.position.copy(tmp.e).addScaledVector(tmp.d, FOREARM_LEN + 0.04);
    });
    if (head.current) {
      head.current.rotation.x = 0.12 + Math.sin(t * 0.9) * 0.04;
      head.current.rotation.y = Math.sin(t * 0.45) * 0.08;
    }
  });

  return (
    <group>
      {/* Torso, leaning in toward the laptop */}
      <Limb a={[0, 1.18, -0.04]} b={[0, 1.84, 0.1]} r={0.31} material={m.shirt} />
      <Limb a={[0, 1.94, 0.12]} b={[0, 2.08, 0.15]} r={0.1} material={m.skin} />

      {/* Head with headphones */}
      <group ref={head} position={[0, 2.08, 0.15]}>
        <mesh position={[0, 0.24, 0.03]} material={m.skin}>
          <sphereGeometry args={[0.27, 32, 24]} />
        </mesh>
        <mesh position={[0, 0.31, -0.03]} scale={[1.02, 0.86, 1]} material={m.hair}>
          <sphereGeometry args={[0.28, 32, 24, 0, TAU, 0, Math.PI * 0.55]} />
        </mesh>
        {[-1, 1].map((s) => (
          <group key={s}>
            <mesh position={[s * 0.09, 0.27, 0.27]} material={m.eye}>
              <sphereGeometry args={[0.024, 12, 10]} />
            </mesh>
            <mesh position={[s * 0.285, 0.23, 0.03]} rotation={[0, 0, Math.PI / 2]} material={m.brand}>
              <cylinderGeometry args={[0.1, 0.1, 0.07, 24]} />
            </mesh>
          </group>
        ))}
        <mesh position={[0, 0.25, 0.03]} material={m.brand}>
          <torusGeometry args={[0.31, 0.028, 10, 40, Math.PI]} />
        </mesh>
      </group>

      {/* Arms */}
      {[-1, 1].map((s, i) => (
        <group key={s}>
          <mesh position={SHOULDER(s)} material={m.shirt}>
            <sphereGeometry args={[0.13, 20, 16]} />
          </mesh>
          <Limb a={SHOULDER(s)} b={ELBOW(s)} r={0.11} material={m.shirt} />
          <mesh
            ref={(el) => {
              forearms.current[i] = el;
            }}
            material={m.skin}
          >
            <capsuleGeometry args={[0.085, FOREARM_LEN, 6, 14]} />
          </mesh>
          <mesh
            ref={(el) => {
              hands.current[i] = el;
            }}
            scale={[1, 0.6, 1.25]}
            material={m.skin}
          >
            <sphereGeometry args={[0.085, 16, 12]} />
          </mesh>
        </group>
      ))}

      {/* Legs */}
      {[-1, 1].map((s) => (
        <group key={s}>
          <Limb a={[s * 0.17, 1.07, 0.0]} b={[s * 0.2, 1.04, 0.6]} r={0.135} material={m.pants} />
          <Limb a={[s * 0.2, 1.04, 0.6]} b={[s * 0.21, 0.24, 0.66]} r={0.11} material={m.pants} />
          <mesh position={[s * 0.21, 0.09, 0.74]} material={m.shoe}>
            <primitive object={SHOE_GEO} attach="geometry" />
          </mesh>
        </group>
      ))}
    </group>
  );
}

const SHOE_GEO = new RoundedBoxGeometry(0.22, 0.15, 0.38, 3, 0.06);
const SEAT_GEO = new RoundedBoxGeometry(0.86, 0.13, 0.8, 3, 0.06);
const BACK_GEO = new RoundedBoxGeometry(0.8, 0.86, 0.1, 3, 0.05);
const DESK_GEO = new RoundedBoxGeometry(3, 0.08, 1.15, 3, 0.03);
const LAPTOP_BASE_GEO = new RoundedBoxGeometry(0.96, 0.04, 0.64, 2, 0.018);
const LAPTOP_LID_GEO = new RoundedBoxGeometry(0.96, 0.64, 0.025, 2, 0.012);
const CARD_GEO = new RoundedBoxGeometry(1.72, 1.02, 0.06, 3, 0.04);
const TOKEN_BOX_GEO = new RoundedBoxGeometry(0.36, 0.36, 0.36, 4, 0.09);

function Chair({ m }: { m: Mats }) {
  return (
    <group>
      <mesh geometry={SEAT_GEO} position={[0, 0.92, 0.02]} material={m.chair} />
      <mesh geometry={BACK_GEO} position={[0, 1.55, -0.44]} rotation={[-0.12, 0, 0]} material={m.chair} />
      <mesh position={[0, 0.53, 0]} material={m.metal}>
        <cylinderGeometry args={[0.05, 0.05, 0.72, 16]} />
      </mesh>
      {Array.from({ length: 5 }, (_, i) => {
        const a = (i / 5) * TAU;
        return (
          <group key={i} rotation={[0, a, 0]}>
            <mesh position={[0, 0.14, 0.24]} rotation={[Math.PI / 2, 0, 0]} material={m.metal}>
              <cylinderGeometry args={[0.03, 0.03, 0.48, 10]} />
            </mesh>
            <mesh position={[0, 0.06, 0.46]} material={m.dark}>
              <sphereGeometry args={[0.06, 14, 10]} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

function Desk({ m, screen, screenRef }: { m: Mats; screen: THREE.Texture; screenRef: RefObject<THREE.Mesh | null> }) {
  return (
    <group>
      <mesh geometry={DESK_GEO} position={[0, 1.43, 1.0]} material={m.wood} />
      {[-1.36, 1.36].flatMap((x) =>
        [0.52, 1.48].map((z) => (
          <mesh key={`${x}${z}`} position={[x, 0.695, z]} material={m.metal}>
            <cylinderGeometry args={[0.04, 0.04, 1.39, 12]} />
          </mesh>
        )),
      )}

      {/* Laptop: screen faces the engineer, logo faces away */}
      <mesh geometry={LAPTOP_BASE_GEO} position={[0, 1.49, 0.86]} material={m.metal} />
      <group position={[0, 1.51, 1.17]} rotation={[-0.28, 0, 0]}>
        <mesh geometry={LAPTOP_LID_GEO} position={[0, 0.32, 0]} material={m.metal} />
        <mesh ref={screenRef} position={[0, 0.33, -0.014]} rotation={[0, Math.PI, 0]}>
          <planeGeometry args={[0.88, 0.55]} />
          <meshBasicMaterial map={screen} toneMapped={false} />
        </mesh>
        <mesh position={[0, 0.34, 0.014]} material={m.logo}>
          <circleGeometry args={[0.05, 24]} />
        </mesh>
        {/* Screen light on the engineer's face */}
        <pointLight position={[0, 0.35, -0.4]} color={m.logo.color} intensity={2.2} distance={2.2} />
      </group>

      {/* Mug */}
      <mesh position={[1.02, 1.56, 0.82]} material={m.white}>
        <cylinderGeometry args={[0.085, 0.075, 0.18, 24]} />
      </mesh>
      <mesh position={[1.12, 1.56, 0.82]} rotation={[0, 0, Math.PI / 2]} material={m.white}>
        <torusGeometry args={[0.05, 0.015, 8, 20]} />
      </mesh>
    </group>
  );
}

/* --------------------------- Orbiters --------------------------- */

/** A project screenshot on a slim glass slab, cropped to fill like object-fit: cover. */
function useCoverTextures(covers: string[]) {
  const textures = useMemo(() => {
    const loader = new THREE.TextureLoader();
    return covers.map((src) =>
      loader.load(src, (t) => {
        const img = t.image as HTMLImageElement;
        const imgA = img.width / img.height;
        const planeA = 1.64 / 0.94;
        if (imgA > planeA) {
          t.repeat.set(planeA / imgA, 1);
          t.offset.set((1 - planeA / imgA) / 2, 0);
        } else {
          t.repeat.set(1, imgA / planeA);
          t.offset.set(0, 1 - imgA / planeA); // keep the top of the page
        }
        t.colorSpace = THREE.SRGBColorSpace;
        t.anisotropy = 8;
        t.needsUpdate = true;
      }),
    );
  }, [covers]);
  useEffect(() => () => textures.forEach((t) => t.dispose()), [textures]);
  return textures;
}

const TOKENS = [
  { kind: "torus", mat: "brand" },
  { kind: "ico", mat: "human" },
  { kind: "box", mat: "brandSoft" },
  { kind: "sphere", mat: "white" },
  { kind: "octa", mat: "brand" },
  { kind: "knot", mat: "human" },
  { kind: "capsule", mat: "brand" },
] as const;

function TokenGeometry({ kind }: { kind: (typeof TOKENS)[number]["kind"] }) {
  switch (kind) {
    case "torus":
      return <torusGeometry args={[0.2, 0.08, 20, 40]} />;
    case "ico":
      return <icosahedronGeometry args={[0.22, 0]} />;
    case "box":
      return <primitive object={TOKEN_BOX_GEO} attach="geometry" />;
    case "sphere":
      return <sphereGeometry args={[0.18, 28, 20]} />;
    case "octa":
      return <octahedronGeometry args={[0.24, 0]} />;
    case "knot":
      return <torusKnotGeometry args={[0.14, 0.045, 80, 12]} />;
    case "capsule":
      return <capsuleGeometry args={[0.1, 0.22, 8, 16]} />;
  }
}

/* ----------------------------- Scene ----------------------------- */

const tmpV = new THREE.Vector3();
const tmpN = new THREE.Vector3();
const tmpLook = new THREE.Vector3();
const tmpSide = new THREE.Vector3();
const tmpEnd = new THREE.Vector3();

function Scene({ progressRef, covers }: { progressRef: RefObject<number>; covers: string[] }) {
  const { viewport, camera } = useThree();
  const colors = useMemo(() => readColors(), []);
  const m = useMemo(() => makeMaterials(colors), [colors]);
  const screen = useMemo(() => makeScreenTexture(colors), [colors]);
  const shadow = useMemo(() => makeShadowTexture(), []);
  const textures = useCoverTextures(covers);
  useEffect(
    () => () => {
      Object.values(m).forEach((mat) => mat.dispose());
      screen.dispose();
      shadow.dispose();
    },
    [m, screen, shadow],
  );

  const stage = useRef<THREE.Group>(null);
  const track = useRef<THREE.Group>(null);
  const screenRef = useRef<THREE.Mesh>(null);
  const cards = useRef<(THREE.Group | null)[]>([]);
  const tokens = useRef<(THREE.Mesh | null)[]>([]);
  const smoothed = useRef<number | null>(null);

  useFrame(({ clock }, dt) => {
    const st = stage.current;
    const tr = track.current;
    if (!st || !tr) return;
    const t = clock.elapsedTime;
    // Ease toward the scroll position so wheel steps glide instead of jumping
    const target = progressRef.current ?? 0;
    smoothed.current = smoothed.current === null ? target : lerp(smoothed.current, target, 1 - Math.exp(-Math.min(dt, 1 / 30) * 7));
    const p = smoothed.current;

    const enter = smooth(clamp((t - 0.1) / 1.2));
    const slide = span(p, 0.04, 0.26); // from beside the copy to centre stage
    const orbit = span(p, ORBIT_FROM, ORBIT_TO);
    const exit = span(p, 0.84, 1);
    const theta = orbit * TURN;

    const cx = lerp(viewport.width * 0.22, 0, slide);
    const centreZ = -1;
    const lift = Math.sin(orbit * Math.PI) * 0.35;

    // The desk rides round the track, turning with it
    st.position.set(cx + Math.sin(theta) * TRACK_R, FLOOR_Y + lift + lerp(-0.6, 0, enter), centreZ + Math.cos(theta) * TRACK_R);
    st.rotation.y = HEADING + theta + lerp(-0.9, 0, enter);
    st.scale.setScalar(STAGE_SCALE * lerp(0.85, 1, enter));
    tr.position.set(cx, FLOOR_Y + 0.005, centreZ);
    tr.scale.setScalar(lerp(0.001, 1, Math.max(slide, 0.001)) * enter);

    // Project screens fly in from the distance, then orbit against the desk
    const n = cards.current.length;
    cards.current.forEach((card, i) => {
      if (!card) return;
      const cin = span(p, 0.03 + i * 0.025, 0.22 + i * 0.025);
      const a = (i / n) * TAU + 0.5 - theta * 0.55;
      const r = RING_R * (1 + exit * 2.2);
      const ring = tmpV.set(cx + Math.sin(a) * r, 0.25 + Math.sin(a + 0.6) * 0.75 + exit * (i % 2 ? 2 : -2), centreZ + Math.cos(a) * r);
      const side = i % 2 ? -1 : 1;
      card.position.set(
        lerp(side * (5 + i), ring.x, cin),
        lerp(((i % 3) - 1) * 3, ring.y, cin),
        lerp(-26, ring.z, cin),
      );
      card.scale.setScalar(Math.max(cin, 0.0001) * 0.8);
      card.lookAt(camera.position);
      card.rotateY(Math.sin(a) * 0.35 + (1 - cin) * side * 1.2);
      card.rotateZ((1 - cin) * side * 0.5);
    });

    // Glossy tokens: a tighter ring, the other way round, spinning on their own axes
    tokens.current.forEach((tok, j) => {
      if (!tok) return;
      const a = (j / TOKENS.length) * TAU + theta * 1.15 + t * 0.06;
      const r = 2.7 * (1 + exit * 3);
      tok.position.set(
        cx * 1.05 + Math.sin(a) * r,
        -0.2 + ((j % 3) - 1) * 0.85 + Math.sin(t * 1.1 + j) * 0.08,
        centreZ + Math.cos(a) * r * 0.9,
      );
      tok.rotation.set(theta * 1.4 + j + t * 0.3, theta + j * 2 + t * 0.4, 0);
      tok.scale.setScalar(enter * lerp(0.75, 1, slide));
    });

    // Finale: push the camera into the laptop screen
    camera.position.copy(CAMERA_POS);
    tmpLook.copy(LOOK);
    if (exit > 0 && screenRef.current) {
      st.updateMatrixWorld();
      screenRef.current.getWorldPosition(tmpV);
      screenRef.current.getWorldDirection(tmpN);
      const k = smooth(exit);
      // Crane up over the engineer's right shoulder (clear of the head), then onto the screen
      tmpN.y = 0;
      tmpN.normalize();
      tmpSide.crossVectors(tmpN, UP);
      camera.position.lerp(tmpEnd.copy(tmpV).addScaledVector(tmpN, 1.0).addScaledVector(tmpSide, 1.7).addScaledVector(UP, 0.9), k);
      tmpLook.lerp(tmpV, k);
    }
    camera.lookAt(tmpLook);
  });

  return (
    <>
      <group ref={stage}>
        <mesh position={[0, 0.004, 0.5]} rotation={[-Math.PI / 2, 0, 0]} renderOrder={-1}>
          <planeGeometry args={[4.4, 3.4]} />
          <meshBasicMaterial map={shadow} transparent depthWrite={false} toneMapped={false} />
        </mesh>
        <Chair m={m} />
        <Engineer m={m} />
        <Desk m={m} screen={screen} screenRef={screenRef} />
      </group>

      {/* The circular track the desk rides on */}
      <group ref={track}>
        <mesh rotation={[-Math.PI / 2, 0, 0]} material={m.track}>
          <torusGeometry args={[TRACK_R, 0.014, 8, 160]} />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]} material={m.trackFaint}>
          <torusGeometry args={[TRACK_R + 1.5, 0.008, 8, 160]} />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]} material={m.trackFaint}>
          <torusGeometry args={[RING_R + 0.3, 0.006, 8, 200]} />
        </mesh>
      </group>

      {textures.map((tex, i) => (
        <group
          key={covers[i]}
          ref={(el) => {
            cards.current[i] = el;
          }}
        >
          <mesh geometry={CARD_GEO} material={m.frame} />
          <mesh position={[0, 0, 0.032]}>
            <planeGeometry args={[1.64, 0.94]} />
            <meshBasicMaterial map={tex} toneMapped={false} />
          </mesh>
        </group>
      ))}

      {TOKENS.map((tk, j) => (
        <mesh
          key={j}
          ref={(el) => {
            tokens.current[j] = el;
          }}
          material={m[tk.mat]}
        >
          <TokenGeometry kind={tk.kind} />
        </mesh>
      ))}
    </>
  );
}

export function OrbitScene({ active, progressRef, covers }: { active: boolean; progressRef: RefObject<number>; covers: string[] }) {
  return (
    <Canvas
      camera={{ position: CAMERA_POS.toArray(), fov: 30 }}
      dpr={[1, 1.5]}
      frameloop={active ? "always" : "never"}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      fallback={null}
    >
      <Environment />
      <Lights />
      <Scene progressRef={progressRef} covers={covers} />
    </Canvas>
  );
}
