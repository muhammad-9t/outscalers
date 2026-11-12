import type { CSSProperties, ReactNode } from "react";

/*
 * Home hero: an isometric "operations hub". A raised platform carries the AI core (a glowing glass
 * building), towers, tanks and modules. Two holographic screens float behind it, set in the same
 * isometric planes, with a live line chart, pulsing bars, a neural net, gauges and KPI bars, and a scan
 * line sweeping down. Light beams carry data from the core up to the screens; cables on the floor bring
 * orange pulses into the platform.
 * Pure SVG + CSS animation (no script); colours come from the theme tokens. Styles: .hub-* in globals.css.
 */

// Isometric projection: world (x, y, z) → screen
const K = 24;
const OX = 320;
const OY = 222;
const C = Math.cos(Math.PI / 6);
const S = 0.5;
const P = (x: number, y: number, z: number): [number, number] => [OX + (x - y) * C * K, OY + (x + y) * S * K - z * K];
const pts = (...ps: [number, number][]) => ps.map(([a, b]) => `${a.toFixed(1)},${b.toFixed(1)}`).join(" ");
const n = (v: number) => Number(v.toFixed(1));

type Box = { x: number; y: number; z?: number; w: number; d: number; h: number; glass?: boolean };

/** An isometric block: right face, left face, top, and floor lines (or glass windows). */
function Block({ x, y, z = 0, w, d, h, glass }: Box) {
  const right = pts(P(x + w, y, z), P(x + w, y + d, z), P(x + w, y + d, z + h), P(x + w, y, z + h));
  const left = pts(P(x, y + d, z), P(x + w, y + d, z), P(x + w, y + d, z + h), P(x, y + d, z + h));
  const top = pts(P(x, y, z + h), P(x + w, y, z + h), P(x + w, y + d, z + h), P(x, y + d, z + h));
  const floors: ReactNode[] = [];
  const step = glass ? 0.45 : 0.5;
  for (let f = step; f < h - 0.1; f += step) {
    floors.push(
      <polyline key={`r${f}`} points={pts(P(x + w, y, z + f), P(x + w, y + d, z + f))} />,
      <polyline key={`l${f}`} points={pts(P(x, y + d, z + f), P(x + w, y + d, z + f))} />,
    );
  }
  return (
    <g>
      <polygon points={right} className={glass ? "hub-glass-r" : "fill-ink-750"} />
      <polygon points={left} className={glass ? "hub-glass-l" : "fill-ink-800"} />
      <polygon points={top} className={glass ? "hub-glass-t" : "fill-ink-700"} />
      <g className={glass ? "hub-glass-lines" : "stroke-line-strong"} strokeWidth={0.7} fill="none">
        {floors}
      </g>
      <polygon points={right} className="fill-none stroke-line-strong" strokeWidth={0.6} />
      <polygon points={left} className="fill-none stroke-line-strong" strokeWidth={0.6} />
      <polygon points={top} className="fill-none stroke-line-strong" strokeWidth={0.6} />
    </g>
  );
}

/** An isometric cylinder (chimney / tank). */
function Tower({ x, y, r, h, z = 0, glow }: { x: number; y: number; r: number; h: number; z?: number; glow?: boolean }) {
  const [bx, by] = P(x, y, z);
  const [tx, ty] = P(x, y, z + h);
  const rx = r * K * 1.22;
  const ry = r * K * 0.7;
  return (
    <g>
      <path
        d={`M${n(tx - rx)},${n(ty)} L${n(bx - rx)},${n(by)} A${n(rx)} ${n(ry)} 0 0 0 ${n(bx + rx)},${n(by)} L${n(tx + rx)},${n(ty)} Z`}
        className="fill-ink-800 stroke-line-strong"
        strokeWidth={0.6}
      />
      {[0.3, 0.6].map((f) => (
        <path
          key={f}
          d={`M${n(tx - rx)},${n(ty + (by - ty) * f)} A${n(rx)} ${n(ry)} 0 0 0 ${n(tx + rx)},${n(ty + (by - ty) * f)}`}
          className="fill-none stroke-line-strong"
          strokeWidth={0.6}
        />
      ))}
      <ellipse cx={n(tx)} cy={n(ty)} rx={n(rx)} ry={n(ry)} className={glow ? "hub-tower-glow" : "fill-ink-700 stroke-line-strong"} strokeWidth={0.6} />
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
        {/* Bloom: a blurred copy of the frame glows around the edges (static, so the blur is cheap) */}
        <rect x={0} y={0} width={w} height={4} rx={0.18} className="hub-bloom" strokeWidth={0.18} filter="url(#hub-bloom)" />
        <rect x={0} y={0} width={w} height={4} rx={0.18} className="hub-panel" strokeWidth={0.04} />
        <g clipPath={`url(#${id}-clip)`}>
          {/* Where the projector beam lands: the bottom of the screen is lit brighter */}
          <rect x={0} y={0} width={w} height={4} fill="url(#hub-land)" className="hub-land" />
          {children}
          <rect x={0} y={0} width={w} height={0.5} className="hub-scan" fill="url(#hub-scan-grad)" />
        </g>
        <line x1={0.3} y1={3.98} x2={w - 0.3} y2={3.98} className="hub-edge-lit" strokeWidth={0.05} strokeLinecap="round" />
        {/* Corner brackets */}
        <g className="stroke-human-accent" strokeWidth={0.05} fill="none">
          <path d="M0.05 0.45V0.05H0.45" />
          <path d={`M${w - 0.45} 3.95H${w - 0.05}V3.55`} />
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
  const line = [2.4, 2.1, 2.25, 1.8, 1.95, 1.5, 1.6, 1.15, 1.3, 0.95];
  const linePath = line.map((v, i) => `${i ? "L" : "M"}${(0.6 + i * 0.6).toFixed(2)} ${v.toFixed(2)}`).join(" ");
  const bars = [1.2, 1.9, 1.5, 2.3, 1.7, 2.6, 2.1];
  const coreTop = P(5, 4, 3.6);

  return (
    <div className={className}>
      <svg
        viewBox="40 0 540 470"
        role="img"
        aria-labelledby="hub-title"
        className="hub h-auto w-full overflow-visible"
      >
        <title id="hub-title">
          An operations hub: an AI core on a platform, with holographic screens showing live charts, tests and approvals
        </title>
        <defs>
          <linearGradient id="hub-panel-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="var(--color-human-accent)" stopOpacity="0.2" />
            <stop offset="1" stopColor="var(--color-human-accent)" stopOpacity="0.04" />
          </linearGradient>
          <linearGradient id="hub-scan-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="var(--color-human-accent)" stopOpacity="0" />
            <stop offset="1" stopColor="var(--color-human-accent)" stopOpacity="0.35" />
          </linearGradient>
          <linearGradient id="hub-area" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="var(--color-human-accent)" stopOpacity="0.45" />
            <stop offset="1" stopColor="var(--color-human-accent)" stopOpacity="0" />
          </linearGradient>
          <radialGradient id="hub-core-glow">
            <stop offset="0" stopColor="var(--color-brand-400)" stopOpacity="0.5" />
            <stop offset="1" stopColor="var(--color-brand-400)" stopOpacity="0" />
          </radialGradient>
          <filter id="hub-bloom" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="0.22" />
          </filter>
          <linearGradient id="hub-land" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0.45" stopColor="var(--color-human-accent)" stopOpacity="0" />
            <stop offset="1" stopColor="var(--color-human-accent)" stopOpacity="0.28" />
          </linearGradient>
          <linearGradient id="hub-column" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0" stopColor="var(--color-human-accent)" stopOpacity="0.55" />
            <stop offset="1" stopColor="var(--color-human-accent)" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="hub-side" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="var(--color-ink-750)" />
            <stop offset="1" stopColor="var(--color-ink-950)" />
          </linearGradient>
          <radialGradient id="hub-shadow">
            <stop offset="0" stopColor="black" stopOpacity="0.55" />
            <stop offset="1" stopColor="black" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="hub-floor-glow">
            <stop offset="0" stopColor="var(--color-human-accent)" stopOpacity="0.22" />
            <stop offset="1" stopColor="var(--color-human-accent)" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* ---------- Holographic screens (behind everything) ---------- */}
        <Screen matrix={leftPlane} w={8} id="hub-l">
          <text x={0.35} y={0.6} className="hub-label">SYSTEM HEALTH</text>
          <circle cx={7.55} cy={0.42} r={0.09} className="hub-blink fill-brand-400" />
          {/* Gauges */}
          {[
            { cx: 1.4, label: "UPTIME", value: "99.9%" },
            { cx: 3.6, label: "TESTS", value: "212" },
          ].map((g, i) => (
            <g key={g.label}>
              <circle cx={g.cx} cy={2.15} r={0.85} className="fill-none stroke-human-accent/25" strokeWidth={0.12} />
              <circle
                cx={g.cx}
                cy={2.15}
                r={0.85}
                pathLength={100}
                strokeDasharray="62 38"
                className="hub-spin fill-none stroke-human-accent"
                strokeWidth={0.12}
                strokeLinecap="round"
                style={delay(i * -1.7)}
              />
              <circle cx={g.cx} cy={2.15} r={0.6} pathLength={100} strokeDasharray="4 6" className="hub-spin-rev fill-none stroke-brand-400" strokeWidth={0.06} />
              <text x={g.cx} y={2.25} textAnchor="middle" className="hub-value">{g.value}</text>
              <text x={g.cx} y={3.4} textAnchor="middle" className="hub-label">{g.label}</text>
            </g>
          ))}
          {/* KPI bars */}
          {[
            { label: "REVIEW", w: 0.92 },
            { label: "COVERAGE", w: 0.78 },
            { label: "DEPLOY", w: 0.64 },
          ].map((k, i) => (
            <g key={k.label} transform={`translate(5 ${1.25 + i * 0.75})`}>
              <text x={0} y={0} className="hub-label">{k.label}</text>
              <rect x={0} y={0.18} width={2.5} height={0.14} rx={0.07} className="fill-human-accent/20" />
              <rect x={0} y={0.18} width={2.5 * k.w} height={0.14} rx={0.07} className="hub-grow fill-human-accent" style={delay(i * 0.4)} />
            </g>
          ))}
          <g transform="translate(5 3.25)">
            <rect x={0} y={0} width={2.5} height={0.5} rx={0.25} className="fill-brand-400/15 stroke-brand-400" strokeWidth={0.04} />
            <text x={1.25} y={0.33} textAnchor="middle" className="hub-label hub-label-ai">APPROVED ✓</text>
          </g>
        </Screen>

        <Screen matrix={rightPlane} w={10} id="hub-r">
          <text x={0.35} y={0.6} className="hub-label">LIVE OPERATIONS</text>
          <circle cx={9.55} cy={0.42} r={0.09} className="hub-blink fill-brand-400" />
          {/* Throughput: a wide line chart */}
          <g>
            {[1.4, 2.2, 3].map((y) => (
              <line key={y} x1={0.5} y1={y} x2={6.2} y2={y} className="stroke-human-accent/15" strokeWidth={0.02} />
            ))}
            <path d={`${linePath} L6 3 L0.6 3 Z`} fill="url(#hub-area)" className="hub-fade" />
            <path d={linePath} pathLength={1} className="hub-draw fill-none stroke-human-accent" strokeWidth={0.06} strokeLinejoin="round" />
            <circle cx={6} cy={0.95} r={0.11} className="hub-blink fill-brand-400" />
            <text x={0.5} y={3.55} className="hub-label">THROUGHPUT</text>
            <text x={3.2} y={3.55} className="hub-label hub-label-ai">▲ 38%</text>
          </g>
          {/* Releases */}
          <g>
            {bars.map((b, i) => (
              <rect
                key={i}
                x={6.9 + i * 0.36}
                y={3 - b}
                width={0.22}
                height={b}
                rx={0.04}
                className={i === 5 ? "hub-bar fill-brand-400" : "hub-bar fill-human-accent/70"}
                style={delay(i * 0.18)}
              />
            ))}
            <text x={6.9} y={3.55} className="hub-label">RELEASES</text>
          </g>
        </Screen>

        {/* ---------- Projector light: cones from the core up to each screen, and a rising column ---------- */}
        {(() => {
          const [sx, sy] = P(5, 3.8, 3.7);
          const cones = [
            { id: "r", a: P(0.3, -0.7, 4.2), b: P(9.7, -0.7, 4.2) },
            { id: "l", a: P(-0.7, 7.7, 4.2), b: P(-0.7, 0.3, 4.2) },
          ];
          return (
            <g className="hub-light">
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
                    <stop offset="0" stopColor="var(--color-human-accent)" stopOpacity="0.5" />
                    <stop offset="0.6" stopColor="var(--color-human-accent)" stopOpacity="0.14" />
                    <stop offset="1" stopColor="var(--color-human-accent)" stopOpacity="0.3" />
                  </linearGradient>
                ))}
              </defs>
              {cones.map((c, i) => (
                <polygon
                  key={c.id}
                  points={pts([sx - 7, sy], c.a, c.b, [sx + 7, sy])}
                  fill={`url(#hub-cone-${c.id})`}
                  className="hub-cone"
                  style={delay(i * -1.6)}
                />
              ))}
              {/* Brighter rays along the cone edges */}
              {cones.flatMap((c) => [c.a, c.b]).map(([x, y], i) => (
                <line key={i} x1={sx} y1={sy} x2={x} y2={y} className="hub-ray" strokeWidth={0.8} />
              ))}
              {/* Light column rising out of the core */}
              <polygon points={pts([sx - 16, sy], [sx - 5, sy - 190], [sx + 5, sy - 190], [sx + 16, sy])} fill="url(#hub-column)" className="hub-cone" />
              <ellipse cx={sx} cy={sy} rx={26} ry={10} className="hub-aperture" />
            </g>
          );
        })()}

        {/* ---------- Shadow and glow under the platform ---------- */}
        <ellipse cx={P(5, 4, 0)[0]} cy={P(5, 4, 0)[1] + 46} rx={250} ry={92} fill="url(#hub-shadow)" className="hub-shadow" />
        <ellipse cx={P(5, 4, 0)[0]} cy={P(5, 4, 0)[1] + 10} rx={240} ry={110} fill="url(#hub-floor-glow)" />

        {/* ---------- Platform ---------- */}
        <polygon points={pts(P(10, 0, 0), P(10, 8, 0), P(10, 8, -0.6), P(10, 0, -0.6))} fill="url(#hub-side)" className="stroke-line-strong" strokeWidth={0.8} />
        <polygon points={pts(P(0, 8, 0), P(10, 8, 0), P(10, 8, -0.6), P(0, 8, -0.6))} fill="url(#hub-side)" className="stroke-line-strong" strokeWidth={0.8} />
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
        {/* Glowing deck edge */}
        <polyline points={pts(P(0, 8, 0), P(10, 8, 0), P(10, 0, 0))} className="hub-edge fill-none" strokeWidth={1.2} />
        <polyline points={pts(P(0.25, 7.75, 0), P(9.75, 7.75, 0), P(9.75, 0.25, 0))} className="fill-none stroke-human-accent/25" strokeWidth={0.6} />

        {/* ---------- Buildings, back to front ---------- */}
        <Tower x={1.1} y={1.1} r={0.42} h={3.4} />
        <Tower x={2.1} y={0.8} r={0.32} h={4.1} />
        <Block x={6.9} y={0.8} w={1.6} d={1.4} h={1.2} />
        <Tower x={8.9} y={1.2} r={0.36} h={2.8} />
        <Block x={0.7} y={2.6} w={1.6} d={1.6} h={1.6} />
        {/* AI core */}
        <ellipse cx={coreTop[0]} cy={coreTop[1] + 30} rx={90} ry={70} fill="url(#hub-core-glow)" className="hub-pulse" />
        <Block x={3.4} y={2.4} w={3.2} d={2.8} h={3.2} glass />
        <Block x={4.2} y={3.1} w={1.6} d={1.4} h={0.5} z={3.2} glass />
        <Block x={7} y={2.8} w={2.1} d={2} h={2} />
        <Tower x={1} y={5.6} r={0.35} h={1.4} />
        <Tower x={1.9} y={5.5} r={0.35} h={1.4} />
        <Block x={8.4} y={5.4} w={0.9} d={0.9} h={0.9} />
        <Block x={3.6} y={6} w={2.6} d={1.5} h={0.9} />

      </svg>
    </div>
  );
}
