"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, type RefObject } from "react";
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
const STAGE_SCALE = 1.0;
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
    pot: v("figure-pot"),
    leaf: v("figure-leaf"),
    metal: v("device-metal"),
    bezel: v("device-bezel"),
    keys: v("device-keys"),
    key: v("device-key"),
    trackpad: v("device-trackpad"),
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
  // Clothes: matte with a soft fabric sheen instead of plastic gloss
  const cloth = (color: string) =>
    new THREE.MeshPhysicalMaterial({
      color,
      roughness: 0.85,
      sheen: 1,
      sheenRoughness: 0.55,
      sheenColor: new THREE.Color(color).lerp(new THREE.Color(1, 1, 1), 0.45),
    });
  const gloss = (color: string) =>
    new THREE.MeshPhysicalMaterial({ color, roughness: 0.18, metalness: 0.05, clearcoat: 1, clearcoatRoughness: 0.08 });
  return {
    skin: new THREE.MeshPhysicalMaterial({ color: c.skin, roughness: 0.55, clearcoat: 0.12, clearcoatRoughness: 0.6 }),
    hair: new THREE.MeshPhysicalMaterial({ color: c.hair, roughness: 0.5, clearcoat: 0.35, clearcoatRoughness: 0.45 }),
    shirt: cloth(c.human),
    pants: cloth(c.pants),
    shoe: vinyl(c.shoe, 0.45),
    chair: vinyl(c.chair, 0.6),
    pot: vinyl(c.pot, 0.6),
    leaf: vinyl(c.leaf, 0.5),
    wood: new THREE.MeshStandardMaterial({ color: c.wood, roughness: 0.55 }),
    metal: new THREE.MeshStandardMaterial({ color: c.metal, metalness: 0.75, roughness: 0.35 }),
    dark: new THREE.MeshStandardMaterial({ color: c.keys, roughness: 0.8 }),
    key: new THREE.MeshStandardMaterial({ color: c.key, roughness: 0.7, envMapIntensity: 0.3 }),
    trackpad: new THREE.MeshStandardMaterial({ color: c.trackpad, metalness: 0.55, roughness: 0.35 }),
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

const SHOULDER = (s: number): V3 => [s * 0.25, 1.73, 0.105];
// Elbows sit above the desk edge and the hands above the keys, so nothing cuts into the laptop
const ELBOW = (s: number): V3 => [s * 0.46, 1.53, 0.36];
const HAND = (s: number): V3 => [s * 0.2, 1.6, 0.78];
const FOREARM_LEN = new THREE.Vector3(...ELBOW(1)).distanceTo(new THREE.Vector3(...HAND(1)));
const ORIGIN = new THREE.Vector3();

/* Hand, built along local +z (wrist at the origin), palm facing down (-y). Kept plain:
   each finger is one smooth piece that starts inside the palm, packed close to its neighbours. */
const PALM_GEO = new RoundedBoxGeometry(0.12, 0.05, 0.12, 4, 0.024);
/** Finger x positions, little finger to index for the right hand (mirrored for the left). */
const FINGER_X = [0.042, 0.014, -0.014, -0.042];
/** Finger lengths: middle longest, little finger shortest. */
const FINGER_LEN = [0.048, 0.06, 0.064, 0.056];

/** Each finger dips on its own rhythm; the dip is small, so fingertips only touch the tops of the keys. */
function Hand({ side, material, handRef }: { side: number; material: THREE.Material; handRef: (el: THREE.Group | null) => void }) {
  const fingers = useRef<(THREE.Group | null)[]>([]);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    fingers.current.forEach((g, i) => {
      if (!g) return;
      // Short presses at uneven intervals
      const press = Math.pow(Math.max(0, Math.sin(t * 5 + i * 2.1 + side * 1.4) * Math.sin(t * 2.2 + i)), 3);
      g.rotation.x = 0.12 + press * 0.22;
    });
  });

  return (
    <group ref={handRef} scale={0.9}>
      {/* Wrist bends very slightly toward the keys */}
      <group rotation={[0.08, 0, 0]}>
        <mesh geometry={PALM_GEO} position={[0, 0, 0.055]} material={material} />
        {FINGER_X.map((x, i) => (
          <group
            key={i}
            ref={(el) => {
              fingers.current[i] = el;
            }}
            position={[x * side, 0.004, 0.08]}
          >
            <mesh position={[0, 0, FINGER_LEN[i] / 2]} rotation={[Math.PI / 2, 0, 0]} material={material}>
              <capsuleGeometry args={[0.018, FINGER_LEN[i], 6, 12]} />
            </mesh>
          </group>
        ))}
        {/* Thumb, on the inner side, angled forward and in */}
        <group position={[-side * 0.05, -0.006, 0.05]} rotation={[0.25, -side * 0.45, 0]}>
          <mesh position={[0, 0, 0.026]} rotation={[Math.PI / 2, 0, 0]} material={material}>
            <capsuleGeometry args={[0.019, 0.034, 6, 12]} />
          </mesh>
        </group>
      </group>
    </group>
  );
}

/** Seated engineer facing +z, typing; the hands and head move a little every frame. */
function Engineer({ m }: { m: Mats }) {
  const forearms = useRef<(THREE.Mesh | null)[]>([]);
  const hands = useRef<(THREE.Group | null)[]>([]);
  const head = useRef<THREE.Group>(null);
  const eyes = useRef<(THREE.Mesh | null)[]>([]);
  const tmp = useMemo(
    () => ({
      e: new THREE.Vector3(),
      h: new THREE.Vector3(),
      d: new THREE.Vector3(),
      f: new THREE.Vector3(),
      x: new THREE.Vector3(),
      z: new THREE.Vector3(),
      m: new THREE.Matrix4(),
      b: new THREE.Matrix4(),
    }),
    [],
  );

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    [-1, 1].forEach((s, i) => {
      const fa = forearms.current[i];
      const hd = hands.current[i];
      if (!fa || !hd) return;
      // Typing: quick, slightly out of step between the hands
      const tap = Math.max(0, Math.sin(t * 8 + i * 1.7)) * 0.025;
      tmp.e.set(...ELBOW(s));
      tmp.h.set(...HAND(s)).add(tmp.d.set(Math.sin(t * 2.1 + i) * 0.02, tap, Math.sin(t * 1.3 + i * 2) * 0.015));
      tmp.d.copy(tmp.h).sub(tmp.e).normalize();
      // Forearm axis = d; its local z is the "up" side, so scaling z flattens the wrist vertically
      tmp.z.copy(UP).addScaledVector(tmp.d, -UP.dot(tmp.d)).normalize();
      tmp.x.crossVectors(tmp.d, tmp.z);
      fa.quaternion.setFromRotationMatrix(tmp.b.makeBasis(tmp.x, tmp.d, tmp.z));
      fa.position.copy(tmp.e).addScaledVector(tmp.d, FOREARM_LEN / 2);
      // The hand starts just inside the wrist (no seam) and points along the forearm, nearly level, palm down
      hd.position.copy(tmp.e).addScaledVector(tmp.d, FOREARM_LEN - 0.015);
      tmp.f.set(tmp.d.x, tmp.d.y * 0.25, tmp.d.z).normalize();
      hd.quaternion.setFromRotationMatrix(tmp.m.lookAt(tmp.f, ORIGIN, UP));
    });
    // Blink every few seconds
    const blink = t % 3.7 < 0.13 ? 0.12 : 1;
    eyes.current.forEach((e) => e?.scale.set(1, blink, 1));
    if (head.current) {
      head.current.rotation.x = 0.12 + Math.sin(t * 0.6) * 0.04;
      head.current.rotation.y = Math.sin(t * 0.3) * 0.08;
    }
  });

  return (
    <group>
      {/* Torso: a t-shirt over a waist-to-chest profile, flattened front to back and leaning in */}
      <group position={[0, 1.0, -0.02]} rotation={[TORSO_LEAN, 0, 0]}>
        <mesh geometry={TORSO_GEO} scale={[1, 1, 0.68]} material={m.shirt} />
        {/* Collar */}
        <mesh position={[0, 0.835, 0]} rotation={[Math.PI / 2, 0, 0]} scale={[1, 0.72, 1]} material={m.shirt}>
          <torusGeometry args={[0.072, 0.02, 10, 32]} />
        </mesh>
        {/* Small brand badge on the chest */}
        <mesh position={[0.1, 0.56, 0.163]} material={m.logo}>
          <circleGeometry args={[0.024, 24]} />
        </mesh>
      </group>
      <Limb a={[0, 1.8, 0.12]} b={[0, 1.96, 0.15]} r={0.055} material={m.skin} />
      {/* Headphones resting around the neck (brand orange) */}
      <mesh position={[0, 1.855, 0.13]} rotation={[-Math.PI / 2, 0, -Math.PI * 0.15]} material={m.brand}>
        <torusGeometry args={[0.105, 0.014, 10, 40, Math.PI * 1.3]} />
      </mesh>
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * 0.118, 1.835, 0.19]} rotation={[0.5, 0, Math.PI / 2]} material={m.brand}>
          <cylinderGeometry args={[0.052, 0.052, 0.042, 28]} />
        </mesh>
      ))}

      {/* Head: oval skull and jaw, nose, ears, brows, styled hair, headphones */}
      <group ref={head} position={[0, 1.95, 0.15]}>
        <mesh position={[0, 0.17, 0]} scale={[0.95, 1.08, 1.02]} material={m.skin}>
          <sphereGeometry args={[0.155, 40, 30]} />
        </mesh>
        <mesh position={[0, 0.09, 0.025]} scale={[0.95, 0.85, 1]} material={m.skin}>
          <sphereGeometry args={[0.12, 32, 24]} />
        </mesh>
        <mesh position={[0, 0.135, 0.152]} scale={[0.75, 1.1, 1]} material={m.skin}>
          <sphereGeometry args={[0.026, 16, 12]} />
        </mesh>
        {[-1, 1].map((s, i) => (
          <group key={s}>
            <mesh position={[s * 0.148, 0.14, -0.005]} scale={[0.45, 1, 0.75]} material={m.skin}>
              <sphereGeometry args={[0.038, 16, 12]} />
            </mesh>
            <mesh
              ref={(el) => {
                eyes.current[i] = el;
              }}
              position={[s * 0.052, 0.175, 0.138]}
              material={m.eye}
            >
              <sphereGeometry args={[0.016, 14, 10]} />
            </mesh>
            <mesh position={[s * 0.055, 0.212, 0.142]} rotation={[0, 0, Math.PI / 2 - s * 0.1]} material={m.hair}>
              <capsuleGeometry args={[0.008, 0.04, 4, 8]} />
            </mesh>
          </group>
        ))}
        {/* A small smile */}
        <mesh position={[0, 0.088, 0.142]} rotation={[0.2, 0, Math.PI]} material={m.eye}>
          <torusGeometry args={[0.026, 0.0055, 8, 20, Math.PI]} />
        </mesh>
        {/* Haircut: a thin layer that follows the skull (hairline at the forehead, short above
            the ears, down to the nape at the back), with textured tufts on top */}
        <group position={[0, 0.17, 0]} scale={[0.95, 1.08, 1.02]}>
          <mesh material={m.hair}>
            <sphereGeometry args={[0.161, 40, 20, 0, TAU, 0, Math.PI * 0.3]} />
          </mesh>
          <mesh material={m.hair}>
            <sphereGeometry args={[0.16, 40, 16, Math.PI * 0.78, Math.PI * 1.44, Math.PI * 0.29, Math.PI * 0.23]} />
          </mesh>
          <mesh material={m.hair}>
            <sphereGeometry args={[0.159, 32, 10, Math.PI * 1.12, Math.PI * 0.76, Math.PI * 0.5, Math.PI * 0.16]} />
          </mesh>
        </group>
        {HAIR_TUFTS.map(([x, y, z, ry, rz, k], n) => (
          <mesh key={n} position={[x, y, z]} rotation={[-0.25, ry, rz]} scale={[1.25 * k, 0.5 * k, 1.15 * k]} material={m.hair}>
            <sphereGeometry args={[0.07, 20, 14]} />
          </mesh>
        ))}
      </group>

      {/* Arms: t-shirt sleeve to mid upper arm, then skin */}
      {[-1, 1].map((s, i) => {
        const sh = SHOULDER(s);
        const el = ELBOW(s);
        const mid: V3 = [lerp(sh[0], el[0], 0.55), lerp(sh[1], el[1], 0.55), lerp(sh[2], el[2], 0.55)];
        return (
        <group key={s}>
          <mesh position={sh} material={m.shirt}>
            <sphereGeometry args={[0.088, 24, 18]} />
          </mesh>
          <Limb a={sh} b={mid} r={0.083} material={m.shirt} />
          <Limb a={mid} b={el} r={0.058} material={m.skin} />
          <mesh
            ref={(el) => {
              forearms.current[i] = el;
            }}
            scale={[1, 1, 0.66]}
            material={m.skin}
          >
            {/* Tapers from the elbow (hidden in the sleeve) to a flatter, narrower wrist */}
            <cylinderGeometry args={[0.042, 0.058, FOREARM_LEN, 24]} />
          </mesh>
          <Hand
            side={s}
            material={m.skin}
            handRef={(h) => {
              hands.current[i] = h;
            }}
          />
        </group>
        );
      })}

      {/* Legs: thigh, knee, shin, sneakers */}
      {[-1, 1].map((s) => (
        <group key={s}>
          <Limb a={[s * 0.12, 1.04, 0.02]} b={[s * 0.15, 1.02, 0.56]} r={0.1} material={m.pants} />
          <mesh position={[s * 0.15, 1.02, 0.56]} material={m.pants}>
            <sphereGeometry args={[0.088, 20, 16]} />
          </mesh>
          <Limb a={[s * 0.15, 1.02, 0.56]} b={[s * 0.16, 0.2, 0.62]} r={0.074} material={m.pants} />
          <mesh geometry={SNEAKER_GEO} position={[s * 0.16, 0.1, 0.68]} material={m.shoe} />
          <mesh geometry={SOLE_GEO} position={[s * 0.16, 0.035, 0.685]} material={m.dark} />
        </group>
      ))}
    </group>
  );
}

const SNEAKER_GEO = new RoundedBoxGeometry(0.13, 0.1, 0.27, 4, 0.045);
const SOLE_GEO = new RoundedBoxGeometry(0.14, 0.035, 0.29, 3, 0.015);
/** Torso profile (radius, height) from the hips up: waist, chest, then the shoulder slope into the neck. */
const TORSO_GEO = new THREE.LatheGeometry(
  [
    [0.001, 0], [0.19, 0], [0.215, 0.06], [0.2, 0.25], [0.225, 0.45], [0.245, 0.6], [0.24, 0.7], [0.2, 0.78], [0.1, 0.84], [0.001, 0.86],
  ].map(([r, y]) => new THREE.Vector2(r, y)),
  40,
);
const TORSO_LEAN = 0.17;
const HAIR_TUFTS: [number, number, number, number, number, number][] = [
  [0, 0.335, 0.075, 0, 0, 1],
  [0.06, 0.33, 0.05, 0.3, -0.3, 0.95],
  [-0.06, 0.325, 0.06, -0.3, 0.3, 0.9],
  [0.03, 0.348, -0.01, 0.2, -0.15, 1],
  [-0.035, 0.346, -0.02, -0.2, 0.15, 1],
  [0, 0.33, -0.085, 0, 0, 0.95],
  [0.08, 0.3, -0.03, 0.4, -0.5, 0.85],
  [-0.08, 0.3, -0.02, -0.4, 0.5, 0.85],
];
const SEAT_GEO = new RoundedBoxGeometry(0.86, 0.13, 0.8, 3, 0.06);
const BACK_GEO = new RoundedBoxGeometry(0.62, 0.6, 0.09, 3, 0.05);
const DESK_GEO = new RoundedBoxGeometry(3, 0.08, 1.15, 3, 0.03);
const LAPTOP_BASE_GEO = new RoundedBoxGeometry(0.96, 0.04, 0.64, 2, 0.018);

/* Laptop keyboard: the engineer sits at -z, the hinge is at +z, so rows run from the
   space-bar row (nearest him) back toward the screen. Top of the base is y = 1.51. */
const KEY_GEO_S = new RoundedBoxGeometry(0.056, 0.012, 0.05, 2, 0.006);
const SPACE_GEO = new RoundedBoxGeometry(0.26, 0.012, 0.05, 2, 0.006);
const KEY_PITCH = 0.068;
const KEY_COLS = 12;
const KEY_ROWS = 5;
const KEY_Z0 = 0.775;
const KEY_Y = 1.512;
/** Every key except the space bar: the front row keeps 4 keys either side of it. */
const KEY_SLOTS = Array.from({ length: KEY_ROWS * KEY_COLS }, (_, n) => [n % KEY_COLS, Math.floor(n / KEY_COLS)] as const).filter(
  ([col, row]) => row > 0 || col < 4 || col >= KEY_COLS - 4,
);
const keyX = (col: number) => (col - (KEY_COLS - 1) / 2) * KEY_PITCH;

function Keyboard({ m }: { m: Mats }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  useLayoutEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    const mat = new THREE.Matrix4();
    KEY_SLOTS.forEach(([col, row], n) => mesh.setMatrixAt(n, mat.makeTranslation(keyX(col), KEY_Y + 0.006, KEY_Z0 + row * 0.062)));
    mesh.instanceMatrix.needsUpdate = true;
  }, []);
  return (
    <group>
      {/* Dark keyboard well, then the keys (one draw call) and the space bar */}
      <mesh position={[0, KEY_Y + 0.0005, KEY_Z0 + 0.124]} rotation={[-Math.PI / 2, 0, 0]} material={m.dark}>
        <planeGeometry args={[KEY_COLS * KEY_PITCH + 0.02, KEY_ROWS * 0.062 + 0.02]} />
      </mesh>
      <instancedMesh ref={ref} args={[KEY_GEO_S, m.key, KEY_SLOTS.length]} />
      <mesh geometry={SPACE_GEO} position={[0, KEY_Y + 0.006, KEY_Z0]} material={m.key} />
      {/* Trackpad, in front of the keys */}
      <mesh position={[0, KEY_Y + 0.0006, 0.625]} rotation={[-Math.PI / 2, 0, 0]} material={m.trackpad}>
        <planeGeometry args={[0.3, 0.13]} />
      </mesh>
    </group>
  );
}
const LAPTOP_LID_GEO = new RoundedBoxGeometry(0.96, 0.64, 0.025, 2, 0.012);
const CARD_GEO = new RoundedBoxGeometry(1.72, 1.02, 0.06, 3, 0.04);
const TOKEN_BOX_GEO = new RoundedBoxGeometry(0.36, 0.36, 0.36, 4, 0.09);

function Chair({ m }: { m: Mats }) {
  return (
    <group>
      <mesh geometry={SEAT_GEO} position={[0, 0.92, 0.02]} material={m.chair} />
      <mesh geometry={BACK_GEO} position={[0, 1.34, -0.42]} rotation={[-0.12, 0, 0]} material={m.chair} />
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

      {/* Laptop: screen faces the engineer, logo faces away. Scaled about the bottom of its base
          so it is sized for a person (the keys stay under his fingers) */}
      <group position={[0, 1.47, 0.86]} scale={0.82}>
      <group position={[0, -1.47, -0.86]}>
      <mesh geometry={LAPTOP_BASE_GEO} position={[0, 1.49, 0.86]} material={m.metal} />
      <Keyboard m={m} />
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
      </group>
      </group>

      {/* Plant */}
      <group position={[-1.08, 1.47, 1.2]}>
        <mesh position={[0, 0.11, 0]} material={m.pot}>
          <cylinderGeometry args={[0.11, 0.085, 0.22, 24]} />
        </mesh>
        {[0, 1, 2, 3, 4].map((k) => (
          <mesh
            key={k}
            position={[Math.sin(k * 1.3) * 0.07, 0.34 + (k % 2) * 0.06, Math.cos(k * 1.3) * 0.07]}
            rotation={[Math.cos(k * 1.3) * 0.5, 0, -Math.sin(k * 1.3) * 0.5]}
            scale={[0.55, 1, 0.3]}
            material={m.leaf}
          >
            <sphereGeometry args={[0.14, 16, 12]} />
          </mesh>
        ))}
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
  const mouse = useRef({ x: 0, y: 0, sx: 0, sy: 0 });

  // Each screen fades in on its own, so it needs its own materials
  const cardMats = useMemo(
    () =>
      textures.map((tex) => ({
        frame: Object.assign(m.frame.clone(), { transparent: true }),
        image: new THREE.MeshBasicMaterial({ map: tex, transparent: true, toneMapped: false }),
      })),
    [textures, m],
  );
  useEffect(
    () => () =>
      cardMats.forEach((cm) => {
        cm.frame.dispose();
        cm.image.dispose();
      }),
    [cardMats],
  );

  // The canvas never takes pointer events, so follow the mouse on the window
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  useFrame(({ clock }, dt) => {
    const st = stage.current;
    const tr = track.current;
    if (!st || !tr) return;
    const t = clock.elapsedTime;
    // Ease toward the scroll position so wheel steps glide instead of jumping
    const target = progressRef.current ?? 0;
    smoothed.current = smoothed.current === null ? target : lerp(smoothed.current, target, 1 - Math.exp(-Math.min(dt, 1 / 30) * 3.5));
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
      // A tilted ring: low at the front, high at the back, so the big words in the middle stay readable
      const ring = tmpV.set(cx + Math.sin(a) * r, 0.55 - Math.cos(a) * 1.6 + exit * (i % 2 ? 2 : -2), centreZ + Math.cos(a) * r);
      const side = i % 2 ? -1 : 1;
      card.position.set(
        lerp(side * (5 + i), ring.x, cin),
        lerp(((i % 3) - 1) * 3, ring.y, cin),
        lerp(-26, ring.z, cin),
      );
      card.visible = cin > 0.005;
      card.scale.setScalar(lerp(0.55, 1, cin) * 0.8);
      const mats = cardMats[i];
      if (mats) mats.frame.opacity = mats.image.opacity = cin;
      card.lookAt(camera.position);
      card.rotateY(Math.sin(a) * 0.35 + (1 - cin) * side * 1.2);
      card.rotateZ((1 - cin) * side * 0.5);
    });

    // Glossy tokens: a tighter ring, the other way round, spinning on their own axes
    tokens.current.forEach((tok, j) => {
      if (!tok) return;
      const a = (j / TOKENS.length) * TAU + theta * 1.15 + t * 0.035;
      const r = 2.7 * (1 + exit * 3);
      tok.position.set(
        cx * 1.05 + Math.sin(a) * r,
        -0.2 + ((j % 3) - 1) * 0.85 + Math.sin(t * 1.1 + j) * 0.08,
        centreZ + Math.cos(a) * r * 0.9,
      );
      tok.rotation.set(theta * 1.4 + j + t * 0.18, theta + j * 2 + t * 0.24, 0);
      tok.scale.setScalar(enter * lerp(0.75, 1, slide));
    });

    // Finale: push the camera into the laptop screen
    const ms = mouse.current;
    const km = 1 - Math.exp(-Math.min(dt, 1 / 30) * 3);
    ms.sx += (ms.x - ms.sx) * km;
    ms.sy += (ms.y - ms.sy) * km;
    camera.position.set(CAMERA_POS.x + ms.sx * 0.7 * (1 - exit), CAMERA_POS.y - ms.sy * 0.4 * (1 - exit), CAMERA_POS.z);
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

      {textures.map((_, i) => (
        <group
          key={covers[i]}
          ref={(el) => {
            cards.current[i] = el;
          }}
        >
          <mesh geometry={CARD_GEO} material={cardMats[i]?.frame} />
          <mesh position={[0, 0, 0.032]} material={cardMats[i]?.image}>
            <planeGeometry args={[1.64, 0.94]} />
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
