import type { CSSProperties, ReactNode } from "react";

/*
 * Home hero: an isometric "Human + AI Software Engineering Hub".
 * On the platform:
 *   - Left cluster (Blue / Human): Architecture & Code Review modules
 *   - Right cluster (Orange / AI): AI Compute Blades & Agent Accelerators
 *   - Centerpiece: Low-profile Human + AI Synthesis Core with a rooftop holographic emitter
 *   - Front module: Production & Security Gate
 * Above the platform, two isometric holographic HUD screens show:
 *   - Left screen: Live IDE Code & AI Diff Review ("CODE // HUMAN + AI")
 *   - Right screen: Live Delivery Pipeline, Velocity Curve & Production Releases
 * Pure SVG + CSS animation (no script); adapts cleanly to both dark and light themes.
 */

// Isometric projection: world (x, y, z) → screen
const K = 24;
const OX = 320;
const OY = 222;
const C = Math.cos(Math.PI / 6);
const S = 0.5;
const P = (x: number, y: number, z: number): [number, number] => [
  OX + (x - y) * C * K,
  OY + (x + y) * S * K - z * K,
];
const pts = (...ps: [number, number][]) =>
  ps.map(([a, b]) => `${a.toFixed(1)},${b.toFixed(1)}`).join(" ");
const pathPts = (...ps: [number, number][]) =>
  ps.map(([a, b], i) => `${i ? "L" : "M"}${a.toFixed(1)},${b.toFixed(1)}`).join(" ");
const n = (v: number) => Number(v.toFixed(1));

type ModuleBox = {
  x: number;
  y: number;
  z?: number;
  w: number;
  d: number;
  h: number;
  tone?: "human" | "brand" | "core";
  leds?: number;
};

/**
 * A sleek, low-profile isometric compute / engineering module (replaces industrial buildings).
 */
function ComputeModule({ x, y, z = 0, w, d, h, tone = "human", leds = 2 }: ModuleBox) {
  const isCore = tone === "core";
  const isBrand = tone === "brand";

  const right = pts(P(x + w, y, z), P(x + w, y + d, z), P(x + w, y + d, z + h), P(x + w, y, z + h));
  const left = pts(P(x, y + d, z), P(x + w, y + d, z), P(x + w, y + d, z + h), P(x, y + d, z + h));
  const top = pts(P(x, y, z + h), P(x + w, y, z + h), P(x + w, y + d, z + h), P(x, y + d, z + h));
  const frontCrest = pts(P(x, y + d, z + h), P(x + w, y + d, z + h), P(x + w, y, z + h));

  // Horizontal blade lines along the sides
  const blades: ReactNode[] = [];
  const step = isCore ? 0.36 : 0.38;
  for (let f = step; f < h - 0.1; f += step) {
    blades.push(
      <polyline key={`r${f}`} points={pts(P(x + w, y + 0.08, z + f), P(x + w, y + d - 0.08, z + f))} />,
      <polyline key={`l${f}`} points={pts(P(x + 0.08, y + d, z + f), P(x + w - 0.08, y + d, z + f))} />,
    );
  }

  // Inset circuit pad on the roof
  const pad = isCore ? 0.28 : 0.22;
  const roofPad = pts(
    P(x + pad, y + pad, z + h),
    P(x + w - pad, y + pad, z + h),
    P(x + w - pad, y + d - pad, z + h),
    P(x + pad, y + d - pad, z + h),
  );

  // Small status LEDs along the front-left top edge
  const ledDots = Array.from({ length: leds }, (_, i) => {
    const pos = P(x + 0.35 + i * 0.32, y + d - 0.22, z + h);
    return (
      <circle
        key={i}
        cx={pos[0]}
        cy={pos[1]}
        r={1.6}
        className={isBrand || (isCore && i % 2 === 1) ? "fill-brand-400" : "fill-human-accent"}
      />
    );
  });

  const fillR = isCore ? "var(--hub-core-r)" : isBrand ? "var(--hub-ai-r)" : "var(--hub-mod-r)";
  const fillL = isCore ? "var(--hub-core-l)" : isBrand ? "var(--hub-ai-l)" : "var(--hub-mod-l)";
  const fillT = isCore ? "var(--hub-core-t)" : isBrand ? "var(--hub-ai-t)" : "var(--hub-mod-t)";

  return (
    <g>
      <polygon points={right} fill={fillR} />
      <polygon points={left} fill={fillL} />
      <polygon points={top} fill={fillT} />

      <g
        className={
          isCore
            ? "hub-glass-lines"
            : isBrand
              ? "stroke-brand-400/40"
              : "stroke-human-accent/35"
        }
        strokeWidth={isCore ? 0.9 : 0.7}
        fill="none"
      >
        {blades}
      </g>

      {/* Outer wireframe */}
      <polygon points={right} className="fill-none stroke-line-strong" strokeWidth={0.65} />
      <polygon points={left} className="fill-none stroke-line-strong" strokeWidth={0.65} />
      <polygon
        points={top}
        className={
          isCore
            ? "fill-none stroke-brand-400/60"
            : isBrand
              ? "fill-none stroke-brand-400/45"
              : "fill-none stroke-human-accent/45"
        }
        strokeWidth={0.7}
      />

      {/* Recessed top circuit pad */}
      {!isCore && (
        <polygon
          points={roofPad}
          className={
            isBrand
              ? "fill-brand-400/10 stroke-brand-400/45"
              : "fill-human-accent/10 stroke-human-accent/45"
          }
          strokeWidth={0.55}
        />
      )}

      {/* Highlighted front crest */}
      <polyline
        points={frontCrest}
        className={
          isCore
            ? "fill-none stroke-brand-400/90"
            : isBrand
              ? "fill-none stroke-brand-400/75"
              : "fill-none stroke-human-accent/75"
        }
        strokeWidth={isCore ? 1.15 : 0.9}
      />

      {!isCore && ledDots}
    </g>
  );
}

/** A holographic screen in an isometric wall plane. Content is drawn in plane units (1 = one grid unit). */
function Screen({ matrix, w, id, children }: { matrix: string; w: number; id: string; children: ReactNode }) {
  return (
    <g transform={matrix}>
      <g transform="translate(0 -8.2)">
        <defs>
          <clipPath id={`${id}-clip`}>
            <rect x={0} y={0} width={w} height={4} rx={0.18} />
          </clipPath>
        </defs>
        {/* Soft outer bloom */}
        <rect x={0} y={0} width={w} height={4} rx={0.18} className="hub-bloom" strokeWidth={0.16} filter="url(#hub-bloom)" />
        <rect x={0} y={0} width={w} height={4} rx={0.18} className="hub-panel" strokeWidth={0.045} />
        <g clipPath={`url(#${id}-clip)`}>
          {/* Subtle HUD micro-grid */}
          <rect x={0} y={0} width={w} height={4} fill="url(#hub-screen-grid)" opacity={0.35} />
          {/* Window title bar */}
          <rect x={0} y={0} width={w} height={0.78} className="fill-human-accent/10" />
          <line x1={0.2} y1={0.78} x2={w - 0.2} y2={0.78} className="stroke-human-accent/25" strokeWidth={0.025} />
          {/* Projector landing glow */}
          <rect x={0} y={0} width={w} height={4} fill="url(#hub-land)" className="hub-land" />
          {children}
          <rect x={0} y={0} width={w} height={0.45} className="hub-scan" fill="url(#hub-scan-grad)" />
        </g>
        <line x1={0.3} y1={3.98} x2={w - 0.3} y2={3.98} className="hub-edge-lit" strokeWidth={0.055} strokeLinecap="round" />
        {/* 4 HUD corner brackets */}
        <g className="stroke-human-accent" strokeWidth={0.055} fill="none" strokeLinecap="round">
          <path d="M0.05 0.48V0.05H0.48" />
          <path d={`M${w - 0.48} 0.05H${w - 0.05}V0.48`} />
          <path d="M0.05 3.52V3.95H0.48" />
          <path d={`M${w - 0.48} 3.95H${w - 0.05}V3.52`} />
        </g>
      </g>
    </g>
  );
}

const delay = (s: number) => ({ "--d": `${s}s` }) as CSSProperties;

export function HeroHub({ className }: { className?: string }) {
  // Wall planes for the two screens: y = -0.7 (back right) and x = -0.7 (back left)
  const [rx0, ry0] = P(0, -0.7, 0);
  const [lx0, ly0] = P(-0.7, 8, 0);
  const rightPlane = `matrix(${n(C * K)} ${n(S * K)} 0 ${K} ${n(rx0)} ${n(ry0)})`;
  const leftPlane = `matrix(${n(C * K)} ${n(-S * K)} 0 ${K} ${n(lx0)} ${n(ly0)})`;

  // Line chart and bar values for the right screen
  const line = [2.48, 2.15, 2.28, 1.84, 1.96, 1.5, 1.6, 1.18, 1.3, 0.98];
  const lineCoords = line.map((v, i) => [0.6 + i * 0.6, v] as [number, number]);
  const linePath = lineCoords
    .map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(2)} ${y.toFixed(2)}`)
    .join(" ");
  const bars = [1.15, 1.8, 1.45, 2.2, 1.65, 2.5, 2.05];

  // Center of the low-profile AI + Human synthesis core roof
  const coreTop = P(5, 3.9, 2.35);

  // Deck circuit buses connecting Human modules (left), AI blades (right), and Prod Gate (front) to the Core
  const traces: { path: string; tone: "brand" | "human"; end: [number, number]; d: number }[] = [
    // From Human Architecture modules (left) into Core
    { path: pathPts(P(2.4, 2.2, 0), P(3.5, 2.2, 0), P(3.5, 2.8, 0)), tone: "human", end: P(2.4, 2.2, 0), d: 0 },
    { path: pathPts(P(2.4, 4.3, 0), P(3.4, 4.3, 0)), tone: "human", end: P(2.4, 4.3, 0), d: -1.1 },
    // From AI Compute blades (right) into Core
    { path: pathPts(P(7.2, 1.8, 0), P(5.8, 1.8, 0), P(5.8, 2.5, 0)), tone: "brand", end: P(7.2, 1.8, 0), d: -0.5 },
    { path: pathPts(P(7.2, 3.8, 0), P(6.6, 3.8, 0)), tone: "brand", end: P(7.2, 3.8, 0), d: -1.6 },
    { path: pathPts(P(7.2, 5.2, 0), P(6.3, 5.2, 0), P(6.3, 4.8, 0)), tone: "brand", end: P(7.2, 5.2, 0), d: -2.2 },
    // From Core out to the Front Production Gate
    { path: pathPts(P(4.6, 5.3, 0), P(4.6, 6.1, 0)), tone: "human", end: P(4.6, 6.1, 0), d: -0.8 },
    { path: pathPts(P(5.4, 5.3, 0), P(5.4, 6.1, 0)), tone: "brand", end: P(5.4, 6.1, 0), d: -1.4 },
  ];

  return (
    <div className={className}>
      <svg
        viewBox="40 0 540 470"
        role="img"
        aria-labelledby="hub-title"
        className="hub h-auto w-full overflow-visible"
      >
        <title id="hub-title">
          Human and AI software engineering hub: an architecture and AI synthesis core projecting live IDE code review and delivery pipeline screens
        </title>
        <defs>
          <pattern id="hub-screen-grid" width="0.5" height="0.5" patternUnits="userSpaceOnUse">
            <path d="M 0.5 0 L 0 0 0 0.5" fill="none" stroke="var(--color-human-accent)" strokeWidth="0.015" strokeOpacity="0.35" />
          </pattern>
          <linearGradient id="hub-panel-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="var(--color-human-accent)" stopOpacity="0.2" />
            <stop offset="0.55" stopColor="var(--color-ink-900)" stopOpacity="0.72" />
            <stop offset="1" stopColor="var(--color-human-accent)" stopOpacity="0.1" />
          </linearGradient>
          <linearGradient id="hub-scan-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="var(--color-human-accent)" stopOpacity="0" />
            <stop offset="1" stopColor="var(--color-human-accent)" stopOpacity="0.28" />
          </linearGradient>
          <linearGradient id="hub-area" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="var(--color-human-accent)" stopOpacity="0.4" />
            <stop offset="1" stopColor="var(--color-human-accent)" stopOpacity="0" />
          </linearGradient>
          <radialGradient id="hub-core-glow">
            <stop offset="0" stopColor="var(--color-brand-400)" stopOpacity="0.42" />
            <stop offset="0.55" stopColor="var(--color-human-accent)" stopOpacity="0.14" />
            <stop offset="1" stopColor="var(--color-brand-400)" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="hub-emitter-glow">
            <stop offset="0" stopColor="var(--color-brand-400)" stopOpacity="0.55" />
            <stop offset="0.5" stopColor="var(--color-human-accent)" stopOpacity="0.25" />
            <stop offset="1" stopColor="var(--color-brand-400)" stopOpacity="0" />
          </radialGradient>
          <filter id="hub-bloom" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="0.2" />
          </filter>
          <linearGradient id="hub-land" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0.5" stopColor="var(--color-human-accent)" stopOpacity="0" />
            <stop offset="1" stopColor="var(--color-human-accent)" stopOpacity="0.22" />
          </linearGradient>
          <linearGradient id="hub-column" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0" stopColor="var(--color-brand-400)" stopOpacity="0.38" />
            <stop offset="0.45" stopColor="var(--color-human-accent)" stopOpacity="0.18" />
            <stop offset="1" stopColor="var(--color-human-accent)" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="hub-side" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="var(--hub-side-top)" />
            <stop offset="1" stopColor="var(--hub-side-bot)" />
          </linearGradient>
          <radialGradient id="hub-shadow">
            <stop offset="0" stopColor="black" stopOpacity="0.55" />
            <stop offset="1" stopColor="black" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="hub-floor-glow">
            <stop offset="0" stopColor="var(--color-human-accent)" stopOpacity="0.2" />
            <stop offset="0.55" stopColor="var(--color-brand-400)" stopOpacity="0.08" />
            <stop offset="1" stopColor="var(--color-human-accent)" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* ---------- LEFT SCREEN: IDE Code & Human + AI Review ---------- */}
        <Screen matrix={leftPlane} w={8} id="hub-l">
          {/* Window controls + Title */}
          <circle cx={0.42} cy={0.4} r={0.07} className="fill-brand-400/80" />
          <circle cx={0.65} cy={0.4} r={0.07} className="fill-human-accent/80" />
          <text x={0.98} y={0.5} className="hub-label">IDE // CODE REVIEW</text>
          <circle cx={7.52} cy={0.4} r={0.085} className="hub-blink fill-brand-400" />

          {/* Left side (x = 0.35..4.45): Live Code + AI Diff Block */}
          <g transform="translate(0.35 1.02)">
            {/* Line 1: Human function signature */}
            <text x={0} y={0.24} className="hub-label">fn</text>
            <rect x={0.55} y={0.1} width={1.35} height={0.14} rx={0.05} className="fill-human-accent/80" />
            <rect x={2.02} y={0.1} width={0.95} height={0.14} rx={0.05} className="fill-human-accent/35" />

            {/* Line 2: Human context */}
            <rect x={0.35} y={0.45} width={1.1} height={0.13} rx={0.05} className="fill-human-accent/55" />
            <rect x={1.58} y={0.45} width={1.65} height={0.13} rx={0.05} className="fill-human-accent/25" />

            {/* Lines 3–4: AI-generated diff block with orange accent bar */}
            <rect x={0.15} y={0.76} width={3.85} height={0.92} rx={0.1} className="fill-brand-400/15 stroke-brand-400/45" strokeWidth={0.025} />
            <line x1={0.18} y1={0.82} x2={0.18} y2={1.62} className="stroke-brand-400" strokeWidth={0.07} strokeLinecap="round" />
            <text x={0.36} y={1.12} className="hub-label hub-label-ai">AI</text>
            <rect x={0.95} y={0.96} width={2.45} height={0.13} rx={0.05} className="hub-grow fill-brand-400" style={delay(0)} />
            <rect x={0.95} y={1.3} width={1.85} height={0.13} rx={0.05} className="hub-grow fill-brand-300/85" style={delay(0.35)} />

            {/* Line 5: Human return + approval */}
            <rect x={0.35} y={1.88} width={1.45} height={0.13} rx={0.05} className="fill-human-accent/70" />
            <rect x={1.92} y={1.88} width={0.85} height={0.13} rx={0.05} className="fill-human-accent/35" />

            {/* Bottom caption */}
            <text x={0} y={2.56} className="hub-label">HUMAN + AI</text>
          </g>

          {/* Vertical divider */}
          <line x1={4.65} y1={0.98} x2={4.65} y2={3.72} className="stroke-human-accent/20" strokeWidth={0.025} />

          {/* Right side (x = 4.95..7.65): Engineering Gates (no overlapping labels) */}
          {[
            { label: "SPEC", w: 0.94, tone: "human" },
            { label: "AI GEN", w: 0.84, tone: "brand" },
            { label: "REVIEW", w: 0.96, tone: "human" },
          ].map((k, i) => (
            <g key={k.label} transform={`translate(4.95 ${1.22 + i * 0.68})`}>
              <text x={0} y={0} className="hub-label">{k.label}</text>
              <circle
                cx={2.55}
                cy={-0.09}
                r={0.055}
                className={k.tone === "brand" ? "fill-brand-400" : "fill-human-accent"}
              />
              <rect x={0} y={0.14} width={2.65} height={0.14} rx={0.07} className="fill-human-accent/20" />
              <rect
                x={0}
                y={0.14}
                width={2.65 * k.w}
                height={0.14}
                rx={0.07}
                className={k.tone === "brand" ? "hub-grow fill-brand-400" : "hub-grow fill-human-accent"}
                style={delay(i * 0.35)}
              />
            </g>
          ))}
          <g transform="translate(4.95 3.22)">
            <rect x={0} y={0} width={2.65} height={0.5} rx={0.25} className="fill-brand-400/20 stroke-brand-400" strokeWidth={0.045} />
            <text x={1.32} y={0.33} textAnchor="middle" className="hub-label hub-label-ai">APPROVED ✓</text>
          </g>
        </Screen>

        {/* ---------- RIGHT SCREEN: Live Delivery Pipeline & Telemetry ---------- */}
        <Screen matrix={rightPlane} w={10} id="hub-r">
          <text x={0.4} y={0.5} className="hub-label">DELIVERY PIPELINE</text>
          <text x={7.5} y={0.5} className="hub-label hub-label-ai">212 PASS</text>
          <circle cx={9.52} cy={0.4} r={0.085} className="hub-blink fill-brand-400" />

          {/* Left side: Velocity & Throughput Chart */}
          <g>
            {[1.35, 1.9, 2.45, 3].map((y) => (
              <line key={y} x1={0.5} y1={y} x2={6.2} y2={y} className="stroke-human-accent/18" strokeWidth={0.02} strokeDasharray="0.12 0.12" />
            ))}
            <path d={`${linePath} L6 3 L0.6 3 Z`} fill="url(#hub-area)" className="hub-fade" />
            <path
              d={linePath}
              pathLength={1}
              className="hub-draw fill-none stroke-human-accent"
              strokeWidth={0.065}
              strokeLinejoin="round"
              strokeLinecap="round"
            />
            {lineCoords.map(([cx, cy], idx) =>
              idx % 2 === 1 ? (
                <circle
                  key={idx}
                  cx={cx}
                  cy={cy}
                  r={idx === lineCoords.length - 1 ? 0.11 : 0.065}
                  className={idx === lineCoords.length - 1 ? "hub-blink fill-brand-400" : "fill-human-accent"}
                />
              ) : null,
            )}
            <text x={0.5} y={3.58} className="hub-label">VELOCITY</text>
            <text x={2.85} y={3.58} className="hub-label hub-label-ai">▲ +38%</text>
          </g>

          {/* Vertical divider */}
          <line x1={6.55} y1={0.98} x2={6.55} y2={3.72} className="stroke-human-accent/20" strokeWidth={0.025} />

          {/* Right side: Production Releases */}
          <g>
            {bars.map((b, i) => (
              <g key={i}>
                <rect
                  x={6.95 + i * 0.36}
                  y={1.0}
                  width={0.22}
                  height={2.0}
                  rx={0.04}
                  className="fill-human-accent/12"
                />
                <rect
                  x={6.95 + i * 0.36}
                  y={3 - b}
                  width={0.22}
                  height={b}
                  rx={0.04}
                  className={i === 5 ? "hub-bar fill-brand-400" : "hub-bar fill-human-accent/75"}
                  style={delay(i * 0.18)}
                />
              </g>
            ))}
            <text x={6.95} y={3.58} className="hub-label">RELEASES</text>
          </g>
        </Screen>

        {/* ---------- Shadow and ambient glow under the platform ---------- */}
        <ellipse cx={P(5, 4, 0)[0]} cy={P(5, 4, 0)[1] + 44} rx={246} ry={88} fill="url(#hub-shadow)" className="hub-shadow" />
        <ellipse cx={P(5, 4, 0)[0]} cy={P(5, 4, 0)[1] + 10} rx={240} ry={108} fill="url(#hub-floor-glow)" />

        {/* ---------- Platform ---------- */}
        <polygon
          points={pts(P(10, 0, 0), P(10, 8, 0), P(10, 8, -0.6), P(10, 0, -0.6))}
          fill="url(#hub-side)"
          className="stroke-line-strong"
          strokeWidth={0.8}
        />
        <polygon
          points={pts(P(0, 8, 0), P(10, 8, 0), P(10, 8, -0.6), P(0, 8, -0.6))}
          fill="url(#hub-side)"
          className="stroke-line-strong"
          strokeWidth={0.8}
        />
        <polygon points={pts(P(0, 0, 0), P(10, 0, 0), P(10, 8, 0), P(0, 8, 0))} className="hub-deck" strokeWidth={0.8} />

        {/* Deck grid */}
        <g className="stroke-line" strokeWidth={0.5}>
          {Array.from({ length: 9 }, (_, i) => i + 1).map((i) => (
            <line key={`gx${i}`} x1={P(i, 0, 0)[0]} y1={P(i, 0, 0)[1]} x2={P(i, 8, 0)[0]} y2={P(i, 8, 0)[1]} />
          ))}
          {Array.from({ length: 7 }, (_, i) => i + 1).map((i) => (
            <line key={`gy${i}`} x1={P(0, i, 0)[0]} y1={P(0, i, 0)[1]} x2={P(10, i, 0)[0]} y2={P(10, i, 0)[1]} />
          ))}
        </g>

        {/* Deck circuit traces & energy pulses */}
        <g fill="none">
          {traces.map((t, i) => (
            <g key={i}>
              <path
                d={t.path}
                className={t.tone === "brand" ? "stroke-brand-400/30" : "stroke-human-accent/30"}
                strokeWidth={1.4}
                strokeLinejoin="round"
              />
              <path
                d={t.path}
                pathLength={100}
                strokeDasharray="18 82"
                className={t.tone === "brand" ? "hub-cable stroke-brand-400" : "hub-cable stroke-human-accent"}
                strokeWidth={1.7}
                strokeLinecap="round"
                strokeLinejoin="round"
                style={delay(t.d)}
              />
              <circle
                cx={t.end[0]}
                cy={t.end[1]}
                r={2.3}
                className={t.tone === "brand" ? "hub-node fill-brand-400" : "hub-node fill-human-accent"}
                style={delay(t.d)}
              />
            </g>
          ))}
        </g>

        {/* Glowing deck perimeter */}
        <polyline points={pts(P(0, 8, 0), P(10, 8, 0), P(10, 0, 0))} className="hub-edge fill-none" strokeWidth={1.35} />
        <polyline
          points={pts(P(0.25, 7.75, 0), P(9.75, 7.75, 0), P(9.75, 0.25, 0))}
          className="fill-none stroke-human-accent/30"
          strokeWidth={0.65}
        />

        {/* ---------- Back & Side Engineering / AI Compute Modules (Painter's Order) ---------- */}
        {/* Back-left: Human Spec & Architecture Nodes (Blue) */}
        <ComputeModule x={0.8} y={0.8} w={1.8} d={1.5} h={1.25} tone="human" leds={3} />
        <ComputeModule x={3.2} y={0.6} w={2.0} d={1.1} h={0.95} tone="human" leds={2} />

        {/* Back-right: AI Model & Context Cluster (Orange) */}
        <ComputeModule x={7.0} y={0.8} w={2.1} d={1.4} h={1.35} tone="brand" leds={3} />

        {/* Mid-left: Human Code Review Station (Blue) */}
        <ComputeModule x={0.8} y={3.1} w={1.8} d={2.0} h={1.45} tone="human" leds={3} />
        <ComputeModule x={0.8} y={5.6} w={1.8} d={1.4} h={0.95} tone="human" leds={2} />

        {/* ---------- Central Human + AI Synthesis Core ---------- */}
        <polygon
          points={pts(P(3.15, 2.25, 0.02), P(6.85, 2.25, 0.02), P(6.85, 5.55, 0.02), P(3.15, 5.55, 0.02))}
          className="fill-brand-400/12 stroke-brand-400/55"
          strokeWidth={0.85}
        />
        <ellipse cx={coreTop[0]} cy={coreTop[1] + 22} rx={92} ry={66} fill="url(#hub-core-glow)" className="hub-pulse" />

        {/* Sleek 2-tier Quantum / Code Synthesis Processor (low-profile, not a tall building) */}
        <ComputeModule x={3.4} y={2.5} w={3.2} d={2.8} h={1.85} tone="core" />
        <ComputeModule x={4.0} y={3.05} w={2.0} d={1.7} h={0.5} z={1.85} tone="core" />

        {/* Rooftop Dual-Ring Holographic Emitter (Human Blue + AI Orange) */}
        <g>
          <ellipse
            cx={coreTop[0]}
            cy={coreTop[1]}
            rx={26}
            ry={14.5}
            fill="var(--hub-emitter-bg)"
            className="stroke-human-accent/80"
            strokeWidth={1}
          />
          <ellipse
            cx={coreTop[0]}
            cy={coreTop[1]}
            rx={19}
            ry={10.5}
            pathLength={100}
            strokeDasharray="22 14"
            className="hub-spin fill-none stroke-human-accent"
            strokeWidth={1.2}
          />
          <ellipse
            cx={coreTop[0]}
            cy={coreTop[1]}
            rx={12.5}
            ry={7}
            pathLength={100}
            strokeDasharray="16 16"
            className="hub-spin-rev fill-none stroke-brand-400"
            strokeWidth={1.2}
          />
          <ellipse
            cx={coreTop[0]}
            cy={coreTop[1]}
            rx={6.5}
            ry={3.8}
            className="fill-brand-400 stroke-brand-200"
            strokeWidth={0.7}
          />
          <ellipse cx={coreTop[0]} cy={coreTop[1]} rx={30} ry={17} fill="url(#hub-emitter-glow)" className="hub-pulse" />
        </g>

        {/* ---------- Foreground Modules ---------- */}
        {/* Mid-right & Front-right: AI Agent & Test-Gen Blades (Orange) */}
        <ComputeModule x={7.2} y={2.8} w={2.0} d={1.8} h={1.55} tone="brand" leds={3} />
        <ComputeModule x={7.2} y={5.1} w={2.0} d={1.6} h={1.05} tone="brand" leds={2} />

        {/* Front-center: Production & Security Gate */}
        <ComputeModule x={3.6} y={6.0} w={2.8} d={1.35} h={0.85} tone="human" leds={4} />

        {/* ---------- Holographic Projection Cones & Data Streams (from Core Roof to Screens) ---------- */}
        {(() => {
          const [sx, sy] = coreTop;
          const cones = [
            { id: "r", a: P(0.3, -0.7, 4.2), b: P(9.7, -0.7, 4.2) },
            { id: "l", a: P(-0.7, 7.7, 4.2), b: P(-0.7, 0.3, 4.2) },
          ];
          return (
            <g className="hub-light pointer-events-none">
              <defs>
                {cones.map((c) => (
                  <linearGradient
                    key={c.id}
                    id={`hub-cone-${c.id}`}
                    gradientUnits="userSpaceOnUse"
                    x1={sx}
                    y1={sy}
                    x2={n((c.a[0] + c.b[0]) / 2)}
                    y2={n((c.a[1] + c.b[1]) / 2)}
                  >
                    <stop offset="0" stopColor="var(--color-brand-400)" stopOpacity="0.32" />
                    <stop offset="0.4" stopColor="var(--color-human-accent)" stopOpacity="0.14" />
                    <stop offset="1" stopColor="var(--color-human-accent)" stopOpacity="0.24" />
                  </linearGradient>
                ))}
              </defs>
              {cones.map((c, i) => (
                <polygon
                  key={c.id}
                  points={pts([sx - 8, sy], c.a, c.b, [sx + 8, sy])}
                  fill={`url(#hub-cone-${c.id})`}
                  className="hub-cone"
                  style={delay(i * -1.6)}
                />
              ))}
              {/* Data rays pulsing from emitter to screen corners & midpoints */}
              {cones
                .flatMap((c) => [c.a, [(c.a[0] + c.b[0]) / 2, (c.a[1] + c.b[1]) / 2] as [number, number], c.b])
                .map(([x, y], i) => (
                  <line
                    key={i}
                    x1={sx}
                    y1={sy}
                    x2={x}
                    y2={y}
                    pathLength={100}
                    strokeDasharray="14 86"
                    className={i % 3 === 1 ? "hub-beam stroke-brand-400/55" : "hub-ray"}
                    strokeWidth={i % 3 === 1 ? 1.05 : 0.75}
                    style={delay(i * -0.45)}
                  />
                ))}
              {/* Central light column rising out of the synthesis core */}
              <polygon
                points={pts([sx - 14, sy], [sx - 5, sy - 185], [sx + 5, sy - 185], [sx + 14, sy])}
                fill="url(#hub-column)"
                className="hub-cone"
              />
              {/* Rising code/data particles */}
              {[
                { dx: -6, dy: -16, r: 1.8, d: 0, tone: "brand" },
                { dx: 8, dy: -26, r: 1.5, d: -1.1, tone: "human" },
                { dx: -12, dy: -36, r: 1.4, d: -2.2, tone: "human" },
                { dx: 4, dy: -14, r: 1.9, d: -2.9, tone: "brand" },
              ].map((p, i) => (
                <circle
                  key={i}
                  cx={sx + p.dx}
                  cy={sy + p.dy}
                  r={p.r}
                  className={p.tone === "brand" ? "hub-rise fill-brand-400" : "hub-rise fill-human-accent"}
                  style={delay(p.d)}
                />
              ))}
            </g>
          );
        })()}
      </svg>
    </div>
  );
}
