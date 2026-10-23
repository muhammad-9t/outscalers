import type { CSSProperties } from "react";
import { cn } from "@/lib/cn";

// Side profile facing right: neck, skull, forehead, brow, nose, lips, chin, jaw.
export const HEAD_PATH =
  "M112 320C110 296 104 278 102 262C80 246 68 214 68 180C68 120 112 84 166 84C212 84 240 112 244 150C245 160 246 168 246 172L262 202C265 207 264 211 259 212L249 214C252 220 253 224 250 228C248 230 248 232 251 236C252 244 250 254 244 260C236 268 222 270 208 270C202 280 200 300 204 320";

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
        An engineer&apos;s profile, with a human brain traced as circuitry, and an AI network exchange ideas and
        code. Both feed into a single reviewed software solution.
      </desc>
      <defs>
        <radialGradient id="hac-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ff700e" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#ff700e" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="hac-head" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#1a2433" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#0b111b" stopOpacity="0.6" />
        </linearGradient>
        <radialGradient id="hac-mind" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#7cc4ff" stopOpacity="0.22" />
          <stop offset="100%" stopColor="#7cc4ff" stopOpacity="0" />
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

      {/* Human profile: soft silhouette fill, then the outline drawn on reveal */}
      <path d={HEAD_PATH} fill="url(#hac-head)" />
      <path
        d={HEAD_PATH}
        className="draw-path fill-none stroke-fg/85"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ "--path-length": 780 } as CSSProperties}
        data-reveal
      />
      {/* Ear */}
      <path
        d="M120 176c-8-3-14 4-13 13 1 8 6 14 13 13"
        className="fill-none stroke-fg/35"
        strokeWidth={1.5}
        strokeLinecap="round"
      />

      {/* Brain: lobes, folds traced as circuitry, cerebellum and stem */}
      <circle cx={164} cy={142} r={70} fill="url(#hac-mind)" />
      <path
        d="M110 160C98 150 100 126 118 118C122 102 144 96 158 102C170 92 196 94 204 108C220 110 228 126 222 140C230 152 222 170 206 170C200 180 184 182 176 174C166 182 148 182 142 172C130 178 114 172 110 160Z"
        className="fill-human-accent/[0.07] stroke-human-accent"
        strokeWidth={1.6}
        strokeLinejoin="round"
      />
      <g className="fill-none stroke-human-accent/60" strokeWidth={1.3} strokeLinecap="round">
        <path d="M120 141C132 133 140 147 152 139" />
        <path d="M158 112C160 126 172 128 176 118" />
        <path d="M186 110C184 124 196 132 206 126" />
        <path d="M197 147C187 141 177 151 185 161" />
        <path d="M138 159C148 151 160 161 168 153" />
        <path d="M166 137C176 133 184 139 190 133" />
        <path d="M138 120C142 128 136 134 128 132" />
      </g>
      <path d="M128 174C124 186 138 192 148 185" className="fill-none stroke-human-accent/70" strokeWidth={1.4} strokeLinecap="round" />
      <path d="M160 180C162 192 164 200 166 212" className="fill-none stroke-human-accent/50" strokeWidth={1.6} strokeLinecap="round" />
      <g className="fill-human-accent">
        {[
          [152, 139],
          [176, 118],
          [206, 126],
          [185, 161],
          [168, 153],
          [190, 133],
          [128, 132],
        ].map(([x, y]) => (
          <circle key={`${x}-${y}`} cx={x} cy={y} r={2.6} />
        ))}
      </g>
      <circle cx={222} cy={140} r={3.4} className="animate-pulse-soft fill-human-accent" />

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
      <path d="M158 322C158 334 166 338 176 340" className="flow-dash fill-none stroke-human-accent/60" strokeWidth={1.4} />
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
