import type { CSSProperties } from "react";
import { cn } from "@/lib/cn";

/**
 * Human profile (judgment) and a neural cluster (AI capability) exchanging work,
 * converging on one reviewed solution.
 */
export function HumanAiCollab({ className }: { className?: string }) {
  const nodes = [
    [372, 112],
    [430, 84],
    [446, 160],
    [356, 196],
    [430, 236],
    [378, 270],
  ] as const;
  const hub = [400, 176] as const;

  return (
    <svg
      viewBox="0 0 480 420"
      role="img"
      aria-labelledby="hac-title hac-desc"
      className={cn("h-auto w-full", className)}
    >
      <title id="hac-title">Human and AI collaboration</title>
      <desc id="hac-desc">
        An engineer&apos;s profile and an AI network exchange ideas and code, and both feed into a single reviewed
        software solution.
      </desc>
      <defs>
        <radialGradient id="hac-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ff700e" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#ff700e" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="hac-out" x1="0" x2="1">
          <stop offset="0%" stopColor="#7cc4ff" />
          <stop offset="100%" stopColor="#ff700e" />
        </linearGradient>
      </defs>

      {/* Dot field */}
      <g className="fill-line-strong" aria-hidden>
        {Array.from({ length: 9 }, (_, r) =>
          Array.from({ length: 12 }, (_, c) => <circle key={`${r}-${c}`} cx={20 + c * 40} cy={20 + r * 44} r={1} />),
        )}
      </g>

      {/* Human profile */}
      <path
        d="M120 302c-30 0-50-20-50-50v-50c0-60 40-106 96-106 50 0 86 34 88 80l15 30c3 6 0 10-6 11l-8 1v21c0 12-8 20-20 20h-20v43"
        className="draw-path fill-none stroke-fg/80"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ "--path-length": 640 } as CSSProperties}
        data-reveal
      />
      {/* Thought nodes inside the head */}
      <g className="fill-none stroke-human-accent/70" strokeWidth={1.4}>
        <path d="M128 160 156 142 188 160 170 192 138 194z" />
        <path d="M156 142 170 192M128 160 188 160" opacity={0.5} />
      </g>
      <g className="fill-human-accent">
        {[
          [128, 160],
          [156, 142],
          [188, 160],
          [170, 192],
          [138, 194],
        ].map(([x, y]) => (
          <circle key={`${x}${y}`} cx={x} cy={y} r={3.2} />
        ))}
      </g>

      {/* AI network */}
      <circle cx={hub[0]} cy={hub[1]} r={90} fill="url(#hac-glow)" />
      <g className="stroke-brand-500/50" strokeWidth={1.2}>
        {nodes.map(([x, y], i) => (
          <line key={i} x1={hub[0]} y1={hub[1]} x2={x} y2={y} />
        ))}
        <path d="M372 112 430 84 446 160 430 236 378 270 356 196z" className="fill-none" opacity={0.6} />
      </g>
      <g className="fill-ink-900 stroke-brand-400" strokeWidth={1.6}>
        {nodes.map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r={6} />
        ))}
      </g>
      <circle cx={hub[0]} cy={hub[1]} r={18} className="fill-ink-850 stroke-brand-300" strokeWidth={2} />
      <circle cx={hub[0]} cy={hub[1]} r={7} className="animate-pulse-soft fill-brand-400" />

      {/* Exchange between human and AI */}
      <path d="M262 150C298 128 330 128 354 140" className="flow-dash fill-none stroke-human-accent/80" strokeWidth={1.6} />
      <path d="M352 214C326 232 292 230 262 210" className="flow-dash fill-none stroke-brand-400/90" strokeWidth={1.6} />
      <g className="font-mono" fontSize={11}>
        <rect x={282} y={104} width={50} height={20} rx={6} className="fill-ink-850 stroke-human-accent/40" />
        <text x={307} y={118} textAnchor="middle" className="fill-human-accent">
          intent
        </text>
        <rect x={280} y={228} width={54} height={20} rx={6} className="fill-ink-850 stroke-brand-500/50" />
        <text x={307} y={242} textAnchor="middle" className="fill-brand-300">
          {"</> draft"}
        </text>
      </g>

      {/* Convergence to the reviewed solution */}
      <path d="M150 302C150 330 190 344 214 352" className="flow-dash fill-none stroke-human-accent/60" strokeWidth={1.4} />
      <path d="M380 278C380 320 320 344 300 352" className="flow-dash fill-none stroke-brand-400/70" strokeWidth={1.4} />
      <rect x={160} y={340} width={196} height={52} rx={12} className="fill-ink-850" stroke="url(#hac-out)" strokeWidth={1.5} />
      <circle cx={186} cy={366} r={11} className="fill-brand-400" />
      <path d="m180.5 366 4 4 7-8" className="fill-none stroke-ink-950" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
      <text x={206} y={362} className="fill-fg font-sans" fontSize={12.5} fontWeight={600}>
        Reviewed solution
      </text>
      <text x={206} y={378} className="fill-fg-subtle font-mono" fontSize={10}>
        human-approved · tested
      </text>

      {/* Labels */}
      <g className="font-mono" fontSize={10} letterSpacing="0.08em">
        <text x={70} y={74} className="fill-human-accent">ENGINEER JUDGMENT</text>
        <text x={352} y={58} className="fill-brand-300">AI CAPABILITY</text>
      </g>
    </svg>
  );
}
