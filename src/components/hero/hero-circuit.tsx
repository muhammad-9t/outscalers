import type { CSSProperties } from "react";

/* ------------------------------------------------------------------
   Decorative circuit traces behind the home hero, with human (blue)
   and AI (orange) signals travelling along them.
   Pure SVG + CSS, so it costs no JS. Coordinates are in a 1440×900 box.
   ------------------------------------------------------------------ */

type Tone = "human" | "ai";
type Trace = { d: string; tone: Tone; dur: number; delay: number; reverse?: boolean };

const TRACES: Trace[] = [
  // Left cluster
  { d: "M290 495 H420 L480 435 H640", tone: "human", dur: 4.2, delay: 0 },
  { d: "M290 520 H460 L520 460 V300 L560 260 H700", tone: "human", dur: 5.6, delay: 1.4 },
  { d: "M290 545 H600", tone: "human", dur: 3.4, delay: 2.2 },
  { d: "M290 570 H440 L500 630 H660", tone: "human", dur: 4.6, delay: 0.8 },
  { d: "M290 595 H400 L460 655 V780 L500 820 H620", tone: "human", dur: 6, delay: 3 },
  { d: "M195 470 V360 L240 315 H360", tone: "human", dur: 4, delay: 1.9, reverse: true },
  { d: "M245 470 V400 L300 345 V200", tone: "human", dur: 4.8, delay: 0.4 },
  { d: "M195 610 V720 L150 765 H40", tone: "human", dur: 4.4, delay: 2.6, reverse: true },
  { d: "M245 610 V700 L290 745 H380", tone: "human", dur: 3.8, delay: 1.1 },
  { d: "M150 520 H60 L20 480", tone: "human", dur: 3, delay: 0.6, reverse: true },
  { d: "M150 570 H90 L50 610 V900", tone: "human", dur: 5, delay: 2.9 },
  // Right cluster
  { d: "M1150 275 H1000 L950 225 H820", tone: "ai", dur: 4.2, delay: 0.5 },
  { d: "M1150 300 H980 L920 360 V520 L870 570 H760", tone: "ai", dur: 5.8, delay: 2 },
  { d: "M1150 325 H860", tone: "ai", dur: 3.4, delay: 1.2 },
  { d: "M1150 350 H1020 L960 410 H800", tone: "ai", dur: 4.6, delay: 3.1 },
  { d: "M1150 375 H1060 L1000 435 V620 L960 660 H860", tone: "ai", dur: 6, delay: 0.2 },
  { d: "M1195 250 V120 L1240 75 H1360", tone: "ai", dur: 4, delay: 1.6, reverse: true },
  { d: "M1245 250 V160 L1300 105 V0", tone: "ai", dur: 4.4, delay: 2.7 },
  { d: "M1195 390 V500 L1150 545 H1080", tone: "ai", dur: 3.6, delay: 0.9 },
  { d: "M1245 390 V560 L1300 615 H1440", tone: "ai", dur: 5.2, delay: 1.8, reverse: true },
  { d: "M1290 300 H1380 L1440 240", tone: "ai", dur: 3, delay: 2.4 },
  { d: "M1290 340 H1400", tone: "ai", dur: 2.6, delay: 0.3, reverse: true },
  // Loose traces for balance
  { d: "M0 140 H160 L220 80 H420", tone: "human", dur: 5, delay: 3.6 },
  { d: "M1440 780 H1260 L1200 840 H1000", tone: "ai", dur: 5, delay: 1 },
  { d: "M600 900 V840 L640 800 H760", tone: "ai", dur: 4, delay: 2.3 },
  { d: "M840 0 V60 L880 100 H980", tone: "human", dur: 4, delay: 0.7 },
];

const TOKENS = [
  { text: "{ }", left: "6%", top: "28%", delay: 0 },
  { text: "=>", left: "17%", top: "84%", delay: 2.5 },
  { text: "fn()", left: "28%", top: "16%", delay: 5 },
  { text: "0x1F", left: "4%", top: "62%", delay: 7.5 },
  { text: "</>", left: "90%", top: "70%", delay: 1.2 },
  { text: "git push", left: "73%", top: "88%", delay: 3.8 },
  { text: "01101", left: "93%", top: "18%", delay: 6.2 },
  { text: "await", left: "68%", top: "12%", delay: 8.6 },
];

const toneColor: Record<Tone, string> = {
  human: "var(--color-human-accent)",
  ai: "var(--color-brand-400)",
};

/** Start and end points of an "M x y ... H x / V y / L x y" path, for the pad dots. */
function endPoints(d: string): [number, number][] {
  let x = 0;
  let y = 0;
  let start: [number, number] = [0, 0];
  for (const [, cmd, args] of d.matchAll(/([MLHV])\s*([\d.\s]+)/g)) {
    const n = args.trim().split(/\s+/).map(Number);
    if (cmd === "H") x = n[0];
    else if (cmd === "V") y = n[0];
    else [x, y] = n;
    if (cmd === "M") start = [x, y];
  }
  return [start, [x, y]];
}

export function HeroCircuit() {
  return (
    <div aria-hidden className="hero-circuit pointer-events-none absolute inset-0">
      <svg className="absolute inset-0 size-full" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice" fill="none">
        {/* Traces + pads */}
        <g stroke="var(--color-line-strong)" strokeWidth="1.5" strokeLinejoin="round">
          {TRACES.map((t) => (
            <path key={t.d} d={t.d} />
          ))}
        </g>
        <g fill="var(--color-ink-950)" stroke="var(--color-line-strong)" strokeWidth="1.5">
          {TRACES.flatMap((t) =>
            endPoints(t.d).map(([x, y]) => <circle key={`${t.d}-${x}-${y}`} cx={x} cy={y} r="4" />),
          )}
        </g>

        {/* Signals: a short dash running along each trace */}
        <g strokeLinecap="round" strokeLinejoin="round">
          {TRACES.map((t) => {
            const style = {
              stroke: toneColor[t.tone],
              animationDuration: `${t.dur}s`,
              animationDelay: `-${t.delay}s`,
              animationDirection: t.reverse ? "reverse" : "normal",
            } as CSSProperties;
            return <path key={t.d} d={t.d} pathLength={100} strokeWidth="2.5" className="circuit-pulse" style={style} />;
          })}
        </g>
      </svg>

      {/* Drifting code tokens */}
      {TOKENS.map((t) => (
        <span
          key={t.text}
          className="code-float absolute hidden font-mono text-xs text-fg-subtle sm:block"
          style={{ left: t.left, top: t.top, animationDelay: `-${t.delay}s` }}
        >
          {t.text}
        </span>
      ))}
    </div>
  );
}
