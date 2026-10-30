import type { CSSProperties } from "react";
import { cn } from "@/lib/cn";

// Side profile facing right: neck, skull, forehead, brow, nose, lips, chin, jaw.
export const HEAD_PATH =
  "M112 320C110 296 104 278 102 262C80 246 68 214 68 180C68 120 112 84 166 84C212 84 240 112 244 150C245 160 246 168 246 172L262 202C265 207 264 211 259 212L249 214C252 220 253 224 250 228C248 230 248 232 251 236C252 244 250 254 244 260C236 268 222 270 208 270C202 280 200 300 204 320";

const BRAIN_PATH =
  "M110 160C98 150 100 126 118 118C122 102 144 96 158 102C170 92 196 94 204 108C220 110 228 126 222 140C230 152 222 170 206 170C200 180 184 182 176 174C166 182 148 182 142 172C130 178 114 172 110 160Z";

// Exchange and convergence paths. Light pulses travel along them.
const INTENT = "M256 150C292 124 334 112 363 112";
const DRAFT = "M351 200C326 222 292 224 268 214";
const TO_HUMAN = "M158 300C158 326 200 318 200 336";
const TO_AI = "M378 277C378 314 318 316 318 336";

/** A dot that travels along a path; hidden for reduced motion. */
function Pulse({ path, dur, begin = "0s", className }: { path: string; dur: string; begin?: string; className: string }) {
  return (
    <circle r={3} className={cn("motion-reduce:hidden", className)}>
      <animateMotion dur={dur} begin={begin} repeatCount="indefinite" path={path} />
      <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.15;0.8;1" dur={dur} begin={begin} repeatCount="indefinite" />
    </circle>
  );
}

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
          <stop offset="0%" style={{ stopColor: "var(--color-ink-700)" }} stopOpacity="0.9" />
          <stop offset="100%" style={{ stopColor: "var(--color-ink-850)" }} stopOpacity="0.6" />
        </linearGradient>
        <radialGradient id="hac-mind" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#7cc4ff" stopOpacity="0.22" />
          <stop offset="100%" stopColor="#7cc4ff" stopOpacity="0" />
        </radialGradient>
        {/* Fades the open bottom of the neck instead of ending it on a hard edge */}
        <linearGradient id="hac-neck-fade" x1="0" y1="262" x2="0" y2="322" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#fff" />
          <stop offset="100%" stopColor="#000" />
        </linearGradient>
        <mask id="hac-neck-mask" maskUnits="userSpaceOnUse" x="0" y="0" width="480" height="420">
          <rect x="0" y="0" width="480" height="262" fill="#fff" />
          <rect x="0" y="262" width="480" height="60" fill="url(#hac-neck-fade)" />
        </mask>
        <marker id="hac-arrow-human" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M0 0 10 5 0 10z" className="fill-human-accent" />
        </marker>
        <marker id="hac-arrow-ai" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M0 0 10 5 0 10z" className="fill-brand-400" />
        </marker>
        <clipPath id="hac-brain">
          <path d={BRAIN_PATH} />
        </clipPath>
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
      <g mask="url(#hac-neck-mask)">
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
      </g>
      {/* Ear, behind the jaw */}
      <g className="fill-none stroke-fg/45" strokeWidth={1.5} strokeLinecap="round">
        <path d="M128 192c-11-4-19 5-18 17 1 11 9 17 18 15" />
        <path d="M124 201c-4 2-4 9 1 11" />
      </g>

      {/* Brain: lobes, folds traced as circuitry, cerebellum and stem */}
      <circle cx={164} cy={142} r={70} fill="url(#hac-mind)" />
      <path
        d={BRAIN_PATH}
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
      {/* Scan line sweeping the brain */}
      <g clipPath="url(#hac-brain)" className="motion-reduce:hidden">
        <rect x={96} y={96} width={136} height={2} className="fill-human-accent/70">
          <animate attributeName="y" values="96;184;96" dur="4.5s" repeatCount="indefinite" />
        </rect>
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
      {/* Targeting rings around the hub */}
      <circle
        cx={hub[0]}
        cy={hub[1]}
        r={30}
        className="fill-none stroke-brand-400/60 motion-safe:animate-[spin_10s_linear_infinite]"
        strokeWidth={1.2}
        strokeDasharray="10 7"
        style={{ transformOrigin: `${hub[0]}px ${hub[1]}px` }}
      />
      <circle
        cx={hub[0]}
        cy={hub[1]}
        r={76}
        className="fill-none stroke-brand-400/25 motion-safe:animate-[spin_40s_linear_infinite_reverse]"
        strokeWidth={1}
        strokeDasharray="2 10 40 10"
        style={{ transformOrigin: `${hub[0]}px ${hub[1]}px` }}
      />
      <circle cx={hub[0]} cy={hub[1]} r={18} className="fill-ink-850 stroke-brand-300" strokeWidth={2} />
      <circle cx={hub[0]} cy={hub[1]} r={7} className="animate-pulse-soft fill-brand-400" />

      {/* Exchange between human and AI */}
      {/* Intent: forehead → top-left AI node. Draft: left AI node → back to the face. Pills sit on each line's midpoint. */}
      <path d={INTENT} className="flow-dash fill-none stroke-human-accent/80" strokeWidth={1.6} markerEnd="url(#hac-arrow-human)" />
      <path d={DRAFT} className="flow-dash fill-none stroke-brand-400/90" strokeWidth={1.6} markerEnd="url(#hac-arrow-ai)" />
      {/* Pulses run under the pills */}
      <Pulse path={INTENT} dur="3s" className="fill-human-accent" />
      <Pulse path={DRAFT} dur="3s" begin="1.5s" className="fill-brand-300" />
      <g className="font-mono" fontSize={11}>
        <rect x={290} y={111} width={50} height={20} rx={6} className="fill-ink-850 stroke-human-accent/40" />
        <text x={315} y={125} textAnchor="middle" className="fill-human-accent">
          intent
        </text>
        <rect x={276} y={209} width={64} height={20} rx={6} className="fill-ink-850 stroke-brand-500/50" />
        <text x={308} y={223} textAnchor="middle" className="fill-brand-300">
          {"</> draft"}
        </text>
      </g>

      {/* Convergence to the reviewed solution */}
      {/* Both sides enter the top edge of the solution card */}
      <path d={TO_HUMAN} className="flow-dash fill-none stroke-human-accent/60" strokeWidth={1.4} markerEnd="url(#hac-arrow-human)" />
      <path d={TO_AI} className="flow-dash fill-none stroke-brand-400/70" strokeWidth={1.4} markerEnd="url(#hac-arrow-ai)" />

      {/* Pulses into the result */}
      <Pulse path={TO_HUMAN} dur="2.4s" begin="0.6s" className="fill-human-accent" />
      <Pulse path={TO_AI} dur="2.4s" begin="1.8s" className="fill-brand-300" />

      <rect x={160} y={340} width={196} height={52} rx={12} className="fill-ink-850" stroke="url(#hac-out)" strokeWidth={1.5} />
      <circle cx={186} cy={366} r={11} className="fill-brand-400" />
      <path d="m180.5 366 4 4 7-8" className="fill-none stroke-on-brand" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
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
