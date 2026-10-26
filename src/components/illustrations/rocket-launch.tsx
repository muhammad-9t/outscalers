import { cn } from "@/lib/cn";

type Burst = { cx: number; cy: number; r: number; tone: string; delay: string };

const bursts: Burst[] = [
  { cx: 322, cy: 72, r: 46, tone: "stroke-brand-400/55 fill-brand-400/55", delay: "0s" },
  { cx: 92, cy: 96, r: 34, tone: "stroke-human-accent/55 fill-human-accent/55", delay: "0.9s" },
  { cx: 384, cy: 204, r: 26, tone: "stroke-signal/55 fill-signal/55", delay: "1.6s" },
];

const stars = [
  [40, 40], [150, 30], [230, 22], [400, 120], [60, 180], [26, 260], [392, 290], [270, 140], [140, 210],
];

function Firework({ cx, cy, r, tone, delay }: Burst) {
  const rays = 12;
  return (
    <g className={cn("anim-burst", tone)} style={{ animationDelay: delay }}>
      {Array.from({ length: rays }, (_, i) => {
        const a = (i / rays) * Math.PI * 2;
        const x1 = cx + Math.cos(a) * r * 0.35;
        const y1 = cy + Math.sin(a) * r * 0.35;
        const x2 = cx + Math.cos(a) * r;
        const y2 = cy + Math.sin(a) * r;
        return (
          <g key={i}>
            <line x1={x1} y1={y1} x2={x2} y2={y2} strokeWidth={1.6} strokeLinecap="round" fill="none" />
            <circle cx={x2 + Math.cos(a) * 5} cy={y2 + Math.sin(a) * 5} r={2} stroke="none" />
          </g>
        );
      })}
      <circle cx={cx} cy={cy} r={3} stroke="none" />
    </g>
  );
}

/** A rocket lifting off its launch tower towards fireworks: shipping, celebrated. */
export function RocketLaunch({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 420 360" role="img" aria-labelledby="rl-title rl-desc" className={cn("h-auto w-full overflow-visible", className)}>
      <title id="rl-title">Launch day</title>
      <desc id="rl-desc">
        A rocket lifts off from its launch tower above clouds of smoke and follows a dashed path towards fireworks, next
        to a label reading version 1.0 live.
      </desc>
      <defs>
        <radialGradient id="rl-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ff700e" stopOpacity="0.14" />
          <stop offset="100%" stopColor="#ff700e" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Stars */}
      <g className="fill-fg-subtle">
        {stars.map(([x, y]) => (
          <circle key={`${x}-${y}`} cx={x} cy={y} r={1.3} />
        ))}
      </g>
      <path d="M248 40l2 5 5 2-5 2-2 5-2-5-5-2 5-2z" className="fill-fg-muted" />
      <path d="M44 228l1.5 3.5 3.5 1.5-3.5 1.5-1.5 3.5-1.5-3.5-3.5-1.5 3.5-1.5z" className="fill-fg-muted" />

      {/* Fireworks */}
      {bursts.map((b) => (
        <Firework key={`${b.cx}-${b.cy}`} {...b} />
      ))}

      {/* Release tag */}
      <g>
        <rect x={280} y={132} width={104} height={22} rx={11} className="fill-ink-850 stroke-brand-400/40" />
        <circle cx={294} cy={143} r={3} className="animate-pulse-soft fill-brand-400" />
        <text x={302} y={147} className="fill-fg-muted font-mono" fontSize={10}>
          v1.0 · live
        </text>
      </g>

      {/* Trajectory */}
      <path d="M210 62C212 36 236 22 270 30S310 64 318 70" className="flow-dash fill-none stroke-fg-subtle/70" strokeWidth={1.4} />

      {/* Exhaust glow */}
      <circle cx={210} cy={320} r={90} fill="url(#rl-glow)" />

      {/* Launch tower */}
      <g className="fill-none stroke-line-strong" strokeWidth={1.6}>
        <path d="M128 336V150M152 336V150M128 150h24" />
        {Array.from({ length: 6 }, (_, i) => 150 + i * 31).map((y) => (
          <path key={y} d={`M128 ${y}l24 31M152 ${y}l-24 31`} opacity={0.7} />
        ))}
        <path d="M152 186h30M152 232h30" className="stroke-fg-subtle" />
      </g>

      {/* Rocket */}
      <g className="anim-rocket">
        <g className="anim-flame">
          <path d="M-10 262C-12 285-4 300 0 320 4 300 12 285 10 262Z" transform="translate(210 0)" className="fill-brand-400" />
          <path d="M-5 262C-6 278-2 290 0 304 2 290 6 278 5 262Z" transform="translate(210 0)" className="fill-signal" />
        </g>
        <g transform="translate(210 0)">
          <path d="M-22 210-42 252v12l20-14Z" className="fill-brand-500 stroke-brand-300" strokeWidth={1.4} strokeLinejoin="round" />
          <path d="M22 210 42 252v12l-20-14Z" className="fill-brand-500 stroke-brand-300" strokeWidth={1.4} strokeLinejoin="round" />
          <path d="M-12 250h24l-3 12H-9Z" className="fill-ink-700 stroke-fg/60" strokeWidth={1.4} strokeLinejoin="round" />
          <path d="M-22 250V150C-22 112-10 88 0 70 10 88 22 112 22 150V250Z" className="fill-ink-850 stroke-fg/85" strokeWidth={2} strokeLinejoin="round" />
          <path d="M0 70C-8 84-14 98-17 114H17C14 98 8 84 0 70Z" className="fill-brand-400" />
          <circle cy={158} r={11} className="fill-human-accent/25 stroke-human-accent" strokeWidth={2} />
          <path d="M-5 153a7 7 0 0 1 6-3" className="fill-none stroke-fg/70" strokeWidth={1.4} strokeLinecap="round" />
          <path d="M-22 204h44M-22 212h44" className="stroke-brand-400/70" strokeWidth={1.6} />
          <text y={190} textAnchor="middle" className="fill-fg-subtle font-mono" fontSize={9}>
            {"</>"}
          </text>
        </g>
      </g>

      {/* Smoke */}
      <g className="fill-ink-800 stroke-line" strokeWidth={1.2}>
        <circle cx={150} cy={334} r={13} />
        <circle cx={172} cy={326} r={17} />
        <circle cx={248} cy={326} r={17} />
        <circle cx={270} cy={334} r={13} />
        <circle cx={192} cy={334} r={20} />
        <circle cx={228} cy={334} r={20} />
        <circle cx={210} cy={338} r={18} />
      </g>

      {/* Ground */}
      <path d="M40 350H380" className="stroke-line-strong" strokeDasharray="3 6" />
      <text x={110} y={348} textAnchor="end" className="fill-fg-subtle font-mono" fontSize={10}>
        T-0
      </text>
    </svg>
  );
}
