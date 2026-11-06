"use client";

import { useRef, type CSSProperties, type KeyboardEvent, type PointerEvent } from "react";
import Image from "next/image";
import type { CaseImage } from "@/content/case-studies";
import { cn } from "@/lib/cn";
import { LogoMark } from "@/components/layout/logo";

/* ------------------------------------------------------------------
   An isometric CSS 3D laptop showing a product screenshot, with a
   cursor that tours the page (hover the nav, a module card, click
   the call to action). Click, hold and drag (or use the arrow keys)
   to turn it in any direction. Motion lives in globals.css (.pl-*).
   ------------------------------------------------------------------ */

/** Keyboard rows: number of keys per row (the last row has a wide space bar). */
const ROWS = [14, 14, 13, 12];

/** Default cursor stops (left%, top%): rest, hover, click, click, click. */
const TOUR: [number, number][] = [
  [62, 70],
  [39, 5],
  [50, 57],
  [81, 5],
  [45, 91],
];

/**
 * Degrees per dragged pixel. Left/right turns the laptop on its base like a turntable;
 * up/down raises or lowers the camera, within limits so the base underside and the
 * back of the lid (from the front) never show.
 */
const DRAG_SPEED = 0.45;
const TILT_MIN = -14;
const TILT_MAX = 30;

/** Stacked haze planes in front of the screen; together they read as a beam of light. */
const BEAM = [1, 2, 3, 4, 5, 6];

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

export function ProductLaptop({ image, className }: { image: CaseImage; className?: string }) {
  const rig = useRef<HTMLDivElement>(null);
  const angle = useRef({ x: 0, y: 0 });
  const drag = useRef<{ id: number; x: number; y: number; ax: number; ay: number } | null>(null);

  const stops = Object.fromEntries(
    (image.cursor ?? TOUR).flatMap(([x, y], i) => [
      [`--c${i}x`, `${x}%`],
      [`--c${i}y`, `${y}%`],
    ]),
  ) as CSSProperties;

  const apply = (x: number, y: number, smooth: boolean) => {
    angle.current = { x: clamp(x, TILT_MIN, TILT_MAX), y };
    const el = rig.current;
    if (!el) return;
    el.classList.toggle("pl-smooth", smooth);
    el.style.setProperty("--tilt", `${angle.current.x}deg`);
    el.style.setProperty("--turn", `${angle.current.y}deg`);
  };

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { id: e.pointerId, x: e.clientX, y: e.clientY, ax: angle.current.x, ay: angle.current.y };
  };
  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    apply(d.ax - (e.clientY - d.y) * DRAG_SPEED, d.ay - (e.clientX - d.x) * DRAG_SPEED, false);
  };
  const onPointerUp = (e: PointerEvent<HTMLDivElement>) => {
    if (drag.current?.id === e.pointerId) drag.current = null;
  };
  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const { x, y } = angle.current;
    const step = { ArrowLeft: [0, 15], ArrowRight: [0, -15], ArrowUp: [8, 0], ArrowDown: [-8, 0] }[e.key];
    if (e.key === "Home" || e.key === "Escape") return apply(0, 0, true);
    if (!step) return;
    e.preventDefault();
    apply(x + step[0], y + step[1], true);
  };

  return (
    <div className={cn("mx-auto w-full max-w-xl", className)}>
      <div
        role="group"
        tabIndex={0}
        aria-label="3D laptop showing the product. Drag or use the arrow keys to turn it; Home resets."
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onDoubleClick={() => apply(0, 0, true)}
        onKeyDown={onKeyDown}
        className="pl-scene relative aspect-[10/8] w-full cursor-grab touch-pan-y select-none rounded-card outline-none focus-visible:ring-2 focus-visible:ring-brand-400 active:cursor-grabbing lg:touch-none"
      >
        {/* Soft floor shadow */}
        <div aria-hidden className="absolute inset-x-[12%] bottom-[8%] h-[22%] rounded-[50%] bg-black/60 blur-2xl" />

        <div className="absolute inset-0 [transform-style:preserve-3d]">
          <div ref={rig} className="pl-rig absolute left-[14%] top-[44%] w-[72%]">
            {/* Base: keyboard deck lying on the floor plane */}
            <div className="pl-base relative aspect-[16/10.4] rounded-[3%] bg-device-metal shadow-[inset_0_0_0_1px_rgba(255,255,255,0.18)]">
              <div aria-hidden className="absolute inset-x-[7%] top-[7%] flex h-[52%] flex-col gap-[3%] rounded-[2%] bg-device-keys p-[1.6%]">
                {ROWS.map((n, r) => (
                  <div key={r} className="flex flex-1 gap-[0.8%]">
                    {Array.from({ length: n }, (_, k) => (
                      <span key={k} className="flex-1 rounded-[2px] bg-device-key" />
                    ))}
                  </div>
                ))}
                <div className="flex flex-1 gap-[0.8%]">
                  <span className="w-[10%] rounded-[2px] bg-device-key" />
                  <span className="w-[10%] rounded-[2px] bg-device-key" />
                  <span className="flex-1 rounded-[2px] bg-device-key" />
                  <span className="w-[10%] rounded-[2px] bg-device-key" />
                  <span className="w-[14%] rounded-[2px] bg-device-key" />
                </div>
              </div>
              {/* Trackpad */}
              <div aria-hidden className="absolute bottom-[6%] left-1/2 h-[27%] w-[36%] -translate-x-1/2 rounded-[4%] bg-device-trackpad/70 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.15)]" />
              {/* Light from the screen spilling onto the keyboard */}
              <div aria-hidden className="pl-spill pointer-events-none absolute inset-0 rounded-[3%]" />
              {/* Lighting on the deck: sheen that slides as it turns */}
              <div aria-hidden className="pl-lit-base pointer-events-none absolute inset-0 rounded-[3%]" />
              {/* Front edge (thickness) */}
              <div aria-hidden className="pl-edge absolute inset-x-0 top-full h-[4%] rounded-b-[30%] bg-device-metal brightness-75">
                <div className="pl-lit-edge absolute inset-0 rounded-b-[30%]" />
              </div>

              {/* Lid, hinged at the back edge of the base: screen on the front, metal on the back */}
              <div className="pl-lid absolute inset-x-0 bottom-full aspect-[16/10.4]">
                <div aria-hidden className="pl-lid-back absolute inset-0 grid place-items-center rounded-[3%] bg-device-metal shadow-[inset_0_0_0_1px_rgba(255,255,255,0.2)]">
                  <LogoMark bare className="size-auto w-[18%] drop-shadow-[0_1px_1px_rgba(0,0,0,0.3)]" />
                  <div className="pl-lit-back pointer-events-none absolute inset-0 rounded-[3%]" />
                </div>
                <div className="pl-face absolute inset-0 rounded-[3%] bg-device-bezel p-[2.4%] shadow-[0_0_0_1.5px_var(--color-device-metal)]">
                  <div className="relative h-full overflow-hidden rounded-[1.2%] bg-white">
                    <Image
                      src={image.src}
                      alt={image.alt}
                      fill
                      priority
                      draggable={false}
                      sizes="(min-width: 1024px) 560px, 90vw"
                      className="object-cover object-top"
                    />
                    {/* Glass: edge falloff and a reflection that moves as it turns */}
                    <div aria-hidden className="pl-glass pointer-events-none absolute inset-0" />
                    {/* Turns darker as the screen faces away from the light */}
                    <div aria-hidden className="pl-lit-screen pointer-events-none absolute inset-0" />
                    {/* Cursor tour */}
                    <div aria-hidden className="pl-cursor absolute size-[8%]" style={stops}>
                      <span className="pl-click absolute -left-[60%] -top-[60%] size-[120%] rounded-full border-2 border-brand-400" />
                      <svg viewBox="0 0 24 24" className="relative size-full drop-shadow-[0_2px_3px_rgba(0,0,0,0.45)]">
                        <path d="M4 2.5v17.2l4.7-4.4 3 6.6 3.1-1.4-3-6.5h6.6z" fill="#0b0f16" stroke="#fff" strokeWidth="1.4" strokeLinejoin="round" />
                      </svg>
                    </div>
                  </div>
                </div>
                {/* Light beam out of the screen: its own 3D layer in front of the screen */}
                <div aria-hidden className="pl-beam-layer absolute inset-[2.4%]">
                  {BEAM.map((i) => (
                    <span key={i} className="pl-beam" style={{ "--i": i } as CSSProperties} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <p className="mt-8 text-center font-mono text-xs uppercase tracking-wider text-fg-subtle">Drag to turn it around</p>
    </div>
  );
}
