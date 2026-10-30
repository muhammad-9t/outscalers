import { cn } from "@/lib/cn";

// Brain outline in local coordinates (centre ≈ 164,138), frontal lobe facing right.
const BRAIN =
  "M110 160C98 150 100 126 118 118C122 102 144 96 158 102C170 92 196 94 204 108C220 110 228 126 222 140C230 152 222 170 206 170C200 180 184 182 176 174C166 182 148 182 142 172C130 178 114 172 110 160Z";
const FOLDS = [
  "M120 141C132 133 140 147 152 139",
  "M158 112C160 126 172 128 176 118",
  "M186 110C184 124 196 132 206 126",
  "M197 147C187 141 177 151 185 161",
  "M138 159C148 151 160 161 168 153",
  "M166 137C176 133 184 139 190 133",
  "M138 120C142 128 136 134 128 132",
];

// AI "brain": a neural graph inside the same outline.
const AI_HUB = [166, 138] as const;
const AI_NODES = [
  [124, 130],
  [150, 110],
  [188, 108],
  [210, 134],
  [198, 160],
  [162, 168],
  [130, 156],
] as const;

// Placement: each brain is scaled 1.5× around its centre; the AI brain is mirrored to face the human one.
const SCALE = 1.5;
const HUMAN_X = 130;
const AI_X = 430;
const BRAIN_Y = 180;
const place = (x: number, mirror = false) =>
  `translate(${x} ${BRAIN_Y}) scale(${mirror ? -SCALE : SCALE} ${SCALE}) translate(-164 -138)`;

/**
 * Hero artwork: a human brain (line art with folds) faces an AI brain (dots and a neural graph).
 * Work flows both ways through a shared core, which feeds one reviewed, tested result.
 */
export function HeroDuo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="20 30 520 282"
      role="img"
      aria-labelledby="hd-title hd-desc"
      className={cn("h-auto w-full overflow-visible", className)}
    >
      <title id="hd-title">Human and AI, working together</title>
      <desc id="hd-desc">
        A human brain and an AI brain made of dots and network connections exchange ideas and code through a shared
        core, which produces work that is human-reviewed and tested.
      </desc>
      <defs>
        <radialGradient id="hd-glow-human" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#7cc4ff" stopOpacity="0.22" />
          <stop offset="100%" stopColor="#7cc4ff" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="hd-glow-ai" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ff700e" stopOpacity="0.26" />
          <stop offset="100%" stopColor="#ff700e" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="hd-core-stroke" x1="0" x2="1">
          <stop offset="0%" stopColor="#7cc4ff" />
          <stop offset="100%" stopColor="#ff700e" />
        </linearGradient>
        <radialGradient id="hd-core-fill" cx="50%" cy="50%" r="50%">
          <stop offset="0%" style={{ stopColor: "var(--color-ink-700)" }} />
          <stop offset="100%" style={{ stopColor: "var(--color-ink-850)" }} />
        </radialGradient>
        <pattern id="hd-dots" width="5" height="5" patternUnits="userSpaceOnUse">
          <circle cx="2.5" cy="2.5" r="0.8" fill="#ff700e" fillOpacity="0.6" />
        </pattern>
        <clipPath id="hd-ai-clip">
          <path d={BRAIN} />
        </clipPath>
      </defs>

      <circle cx={HUMAN_X} cy={BRAIN_Y} r={140} fill="url(#hd-glow-human)" />
      <circle cx={AI_X} cy={BRAIN_Y} r={140} fill="url(#hd-glow-ai)" />

      {/* Human brain */}
      <g transform={place(HUMAN_X)}>
        <path d={BRAIN} className="fill-human-accent/8 stroke-human-accent" strokeWidth={1.4} strokeLinejoin="round" />
        <g className="fill-none stroke-human-accent/60" strokeWidth={1.1} strokeLinecap="round">
          {FOLDS.map((d) => (
            <path key={d} d={d} />
          ))}
          <path d="M128 174C124 186 138 192 148 185" />
        </g>
        <path d="M160 180C162 188 163 192 163 196" className="fill-none stroke-human-accent/50" strokeWidth={1.3} strokeLinecap="round" />
        <circle cx={222} cy={140} r={3} className="animate-pulse-soft fill-human-accent" />
      </g>

      {/* AI brain: same outline, mirrored, built from dots and a neural graph */}
      <g transform={place(AI_X, true)}>
        <path d={BRAIN} className="fill-ink-900/70" />
        <rect x={95} y={90} width={140} height={100} fill="url(#hd-dots)" clipPath="url(#hd-ai-clip)" />
        <path d={BRAIN} className="fill-none stroke-brand-400" strokeWidth={1.4} strokeDasharray="3 3.5" strokeLinejoin="round" />
        <g className="stroke-brand-300/70" strokeWidth={1}>
          {AI_NODES.map(([x, y], i) => {
            const [nx, ny] = AI_NODES[(i + 1) % AI_NODES.length];
            return (
              <g key={i}>
                <line x1={AI_HUB[0]} y1={AI_HUB[1]} x2={x} y2={y} />
                <line x1={x} y1={y} x2={nx} y2={ny} opacity={0.5} />
              </g>
            );
          })}
        </g>
        <g className="fill-ink-950 stroke-brand-300" strokeWidth={1.3}>
          {AI_NODES.map(([x, y]) => (
            <circle key={`${x}-${y}`} cx={x} cy={y} r={3.6} />
          ))}
        </g>
        <circle cx={AI_HUB[0]} cy={AI_HUB[1]} r={6.5} className="fill-brand-400" />
        <circle cx={222} cy={140} r={3} className="animate-pulse-soft fill-brand-300" />
      </g>

      {/* Exchange through the shared core */}
      <path d="M217 183C232 172 244 172 250 176" className="flow-dash fill-none stroke-human-accent" strokeWidth={1.8} />
      <path d="M343 183C328 172 316 172 310 176" className="flow-dash fill-none stroke-brand-400" strokeWidth={1.8} />
      <path d="M262 207C246 236 196 250 152 236" className="flow-dash fill-none stroke-brand-400/70" strokeWidth={1.5} />
      <path d="M298 207C314 236 364 250 408 236" className="flow-dash fill-none stroke-human-accent/70" strokeWidth={1.5} />

      <circle cx={280} cy={183} r={42} className="animate-pulse-soft fill-none" stroke="url(#hd-core-stroke)" strokeOpacity={0.35} />
      <circle cx={280} cy={183} r={28} fill="url(#hd-core-fill)" stroke="url(#hd-core-stroke)" strokeWidth={2} />
      <text x={280} y={188} textAnchor="middle" className="fill-fg font-mono" fontSize={13} fontWeight={600}>
        {"</>"}
      </text>

      {/* Labels */}
      <g className="font-mono" fontSize={10.5} letterSpacing="0.1em">
        <text x={HUMAN_X} y={286} textAnchor="middle" className="fill-human-accent">HUMAN</text>
        <text x={HUMAN_X} y={302} textAnchor="middle" className="fill-fg-subtle max-sm:hidden" letterSpacing="0.02em">
          judgment · context · accountability
        </text>
        <text x={AI_X} y={286} textAnchor="middle" className="fill-brand-300">AI</text>
        <text x={AI_X} y={302} textAnchor="middle" className="fill-fg-subtle max-sm:hidden" letterSpacing="0.02em">
          speed · scale · patterns
        </text>
      </g>

      {/* Outcome, above the core: the core feeds one reviewed, tested result */}
      <path d="M280 141V92" className="flow-dash fill-none stroke-brand-400/70" strokeWidth={1.6} />
      <rect x={164} y={36} width={232} height={54} rx={14} className="fill-ink-850" stroke="url(#hd-core-stroke)" strokeWidth={1.5} />
      <circle cx={192} cy={63} r={12} className="fill-brand-400" />
      <path d="m186 63 4.5 4.5 7.5-8.5" className="fill-none stroke-on-brand" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" />
      <text x={214} y={59} className="fill-fg font-sans" fontSize={13} fontWeight={600}>
        Shipped with confidence
      </text>
      <text x={214} y={76} className="fill-fg-subtle font-mono" fontSize={10}>
        human-reviewed · tested
      </text>
    </svg>
  );
}
