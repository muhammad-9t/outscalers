import type { CSSProperties } from "react";
import { HEAD_PATH } from "./human-ai-collab";
import { cn } from "@/lib/cn";

// AI "brain": a neural graph occupying the same region as the human brain.
const AI_HUB = [166, 138] as const;
const AI_NODES = [
  [118, 128],
  [150, 108],
  [190, 104],
  [216, 132],
  [204, 166],
  [162, 172],
  [128, 160],
] as const;

/**
 * Hero artwork: a human profile (line art, with a brain) faces an AI profile (the same
 * silhouette built from dots and a neural graph). Work flows both ways through a shared core.
 */
export function HeroDuo({ className }: { className?: string }) {
  return (
    <svg viewBox="28 96 504 334" role="img" aria-labelledby="hd-title hd-desc" className={cn("h-auto w-full overflow-visible", className)}>
      <title id="hd-title">Human and AI, face to face</title>
      <desc id="hd-desc">
        A human profile with a brain faces an AI profile made of dots and network connections. Ideas and code flow
        between them through a shared core, which produces reviewed and tested work.
      </desc>
      <defs>
        <radialGradient id="hd-glow-human" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#7cc4ff" stopOpacity="0.22" />
          <stop offset="100%" stopColor="#7cc4ff" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="hd-glow-ai" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ff700e" stopOpacity="0.28" />
          <stop offset="100%" stopColor="#ff700e" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="hd-head" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#1a2433" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#0b111b" stopOpacity="0.6" />
        </linearGradient>
        <linearGradient id="hd-core-stroke" x1="0" x2="1">
          <stop offset="0%" stopColor="#7cc4ff" />
          <stop offset="100%" stopColor="#ff700e" />
        </linearGradient>
        <radialGradient id="hd-core-fill" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#1f2a3a" />
          <stop offset="100%" stopColor="#0b111b" />
        </radialGradient>
        <pattern id="hd-dots" width="8" height="8" patternUnits="userSpaceOnUse">
          <circle cx="4" cy="4" r="1.25" fill="#ff700e" fillOpacity="0.55" />
        </pattern>
        <clipPath id="hd-ai-clip">
          <path d={HEAD_PATH} />
        </clipPath>
      </defs>

      <circle cx={130} cy={180} r={150} fill="url(#hd-glow-human)" />
      <circle cx={430} cy={180} r={150} fill="url(#hd-glow-ai)" />

      {/* Human */}
      <g transform="translate(0 30) scale(0.85)">
        <path d={HEAD_PATH} fill="url(#hd-head)" />
        <path
          d={HEAD_PATH}
          className="draw-path fill-none stroke-fg/85"
          strokeWidth={2.2}
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ "--path-length": 780 } as CSSProperties}
          data-reveal
        />
        <path d="M120 176c-8-3-14 4-13 13 1 8 6 14 13 13" className="fill-none stroke-fg/35" strokeWidth={1.6} strokeLinecap="round" />
        <path
          d="M110 160C98 150 100 126 118 118C122 102 144 96 158 102C170 92 196 94 204 108C220 110 228 126 222 140C230 152 222 170 206 170C200 180 184 182 176 174C166 182 148 182 142 172C130 178 114 172 110 160Z"
          className="fill-human-accent/[0.08] stroke-human-accent"
          strokeWidth={1.8}
          strokeLinejoin="round"
        />
        <g className="fill-none stroke-human-accent/60" strokeWidth={1.4} strokeLinecap="round">
          <path d="M120 141C132 133 140 147 152 139" />
          <path d="M158 112C160 126 172 128 176 118" />
          <path d="M186 110C184 124 196 132 206 126" />
          <path d="M197 147C187 141 177 151 185 161" />
          <path d="M138 159C148 151 160 161 168 153" />
          <path d="M166 137C176 133 184 139 190 133" />
          <path d="M128 174C124 186 138 192 148 185" />
        </g>
        <circle cx={222} cy={140} r={4} className="animate-pulse-soft fill-human-accent" />
      </g>

      {/* AI: same silhouette, mirrored, made of dots and a neural graph */}
      <g transform="translate(560 30) scale(-0.85 0.85)">
        <path d={HEAD_PATH} className="fill-ink-900/70" />
        <rect x={60} y={80} width={210} height={245} fill="url(#hd-dots)" clipPath="url(#hd-ai-clip)" />
        <path
          d={HEAD_PATH}
          className="fill-none stroke-brand-400"
          strokeWidth={2}
          strokeDasharray="4 5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <g className="stroke-brand-300/70" strokeWidth={1.4}>
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
        <g className="fill-ink-950 stroke-brand-300" strokeWidth={1.8}>
          {AI_NODES.map(([x, y]) => (
            <circle key={`${x}-${y}`} cx={x} cy={y} r={5} />
          ))}
        </g>
        <circle cx={AI_HUB[0]} cy={AI_HUB[1]} r={9} className="fill-brand-400" />
        <circle cx={222} cy={140} r={4} className="animate-pulse-soft fill-brand-300" />
      </g>

      {/* Exchange through the shared core */}
      <path d="M189 149C226 140 246 168 254 182" className="flow-dash fill-none stroke-human-accent" strokeWidth={1.8} />
      <path d="M371 149C334 140 314 168 306 182" className="flow-dash fill-none stroke-brand-400" strokeWidth={1.8} />
      <path d="M258 214C248 236 232 244 214 244" className="flow-dash fill-none stroke-brand-400/80" strokeWidth={1.6} />
      <path d="M302 214C312 236 328 244 346 244" className="flow-dash fill-none stroke-human-accent/80" strokeWidth={1.6} />

      <circle cx={280} cy={198} r={44} className="animate-pulse-soft fill-none" stroke="url(#hd-core-stroke)" strokeOpacity={0.35} />
      <circle cx={280} cy={198} r={30} fill="url(#hd-core-fill)" stroke="url(#hd-core-stroke)" strokeWidth={2} />
      <text x={280} y={203} textAnchor="middle" className="fill-fg font-mono" fontSize={14} fontWeight={600}>
        {"</>"}
      </text>

      {/* Labels */}
      <g className="font-mono" fontSize={10.5} letterSpacing="0.1em">
        <text x={135} y={326} textAnchor="middle" className="fill-human-accent">HUMAN</text>
        <text x={135} y={342} textAnchor="middle" className="fill-fg-subtle max-sm:hidden" letterSpacing="0.02em">judgment · context · accountability</text>
        <text x={425} y={326} textAnchor="middle" className="fill-brand-300">AI</text>
        <text x={425} y={342} textAnchor="middle" className="fill-fg-subtle max-sm:hidden" letterSpacing="0.02em">speed · scale · patterns</text>
      </g>
      {/* Outcome: the core feeds one reviewed, tested result */}
      <path d="M280 242V368" className="flow-dash fill-none stroke-brand-400/70" strokeWidth={1.6} />
      <rect x={164} y={370} width={232} height={54} rx={14} className="fill-ink-850" stroke="url(#hd-core-stroke)" strokeWidth={1.5} />
      <circle cx={192} cy={397} r={12} className="fill-brand-400" />
      <path d="m186 397 4.5 4.5 7.5-8.5" className="fill-none stroke-ink-950" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" />
      <text x={214} y={393} className="fill-fg font-sans" fontSize={13} fontWeight={600}>
        Shipped with confidence
      </text>
      <text x={214} y={410} className="fill-fg-subtle font-mono" fontSize={10}>
        human-reviewed · tested
      </text>
    </svg>
  );
}
