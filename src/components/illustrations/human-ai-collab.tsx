import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/cn";

// Exchange and convergence paths; light pulses travel along them
const INTENT = "M204 112H276";
const DRAFT = "M276 178H204";
const FROM_HUMAN = "M112 236V262C112 274 120 280 132 280H200C212 280 220 286 220 298";
const FROM_AI = "M368 236V262C368 274 360 280 348 280H280C268 280 260 286 260 298";

const CYCLE = 4.8;

/** A dot that travels along a path; hidden for reduced motion. */
function Pulse({ path, begin = 0, className }: { path: string; begin?: number; className: string }) {
  return (
    <circle r={3} opacity={0} className={cn("motion-reduce:hidden", className)}>
      <animateMotion dur={`${CYCLE}s`} begin={`${begin}s`} repeatCount="indefinite" path={path} keyPoints="0;1;1" keyTimes="0;0.3;1" calcMode="linear" />
      <animate attributeName="opacity" values="0;1;1;0;0" keyTimes="0;0.05;0.28;0.31;1" dur={`${CYCLE}s`} begin={`${begin}s`} repeatCount="indefinite" />
    </circle>
  );
}

/** An animation on one SVG element; `.cv-anim` switches it off for reduced motion. */
const loop = (name: string, delay = 0): CSSProperties => ({ animation: `${name} ${CYCLE}s ease-in-out ${delay}s infinite both` });

/** A card heading: icon slot, title and a mono caption. */
function CardHead({ x, title, sub, tone, children }: { x: number; title: string; sub: string; tone: "human" | "ai"; children: ReactNode }) {
  return (
    <g>
      <circle cx={x + 24} cy={88} r={14} className={tone === "human" ? "fill-human-accent/10 stroke-human-accent" : "fill-brand-500/10 stroke-brand-400"} strokeWidth={1.3} />
      {children}
      <text x={x + 46} y={86} className="fill-fg font-sans" fontSize={12.5} fontWeight={600}>
        {title}
      </text>
      <text x={x + 46} y={100} className="fill-fg-subtle font-mono" fontSize={9}>
        {sub}
      </text>
    </g>
  );
}

/**
 * The engineer (decisions) and the AI assistant (drafts) exchanging work, converging on one reviewed
 * solution. Engineers set intent and approve; AI drafts in between.
 */
export function HumanAiCollab({ className }: { className?: string }) {
  const decisions = ["Goal & scope", "Architecture", "Final approval"];
  const drafts = [
    { label: "Code draft", w: 0.85 },
    { label: "Test cases", w: 0.6 },
    { label: "Summaries", w: 0.4 },
  ];
  return (
    <svg
      viewBox="0 0 480 360"
      role="img"
      aria-labelledby="hac-t hac-d"
      className={cn("h-auto w-full", className)}
    >
      <title id="hac-t">Engineers and AI working together</title>
      <desc id="hac-d">
        An engineer sets the intent and makes the decisions; an AI assistant returns drafts of code, tests and summaries.
        Both feed one solution that is approved by a person and tested.
      </desc>
      <defs>
        <linearGradient id="hac-result" x1="0" x2="1">
          <stop offset="0%" style={{ stopColor: "var(--color-human-accent)" }} />
          <stop offset="100%" style={{ stopColor: "var(--color-brand-400)" }} />
        </linearGradient>
        <marker id="hac-arrow-h" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M1 1 9 5 1 9" fill="none" className="stroke-human-accent" strokeWidth={1.6} strokeLinecap="round" />
        </marker>
        <marker id="hac-arrow-a" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M1 1 9 5 1 9" fill="none" className="stroke-brand-400" strokeWidth={1.6} strokeLinecap="round" />
        </marker>
      </defs>

      {/* Dot grid */}
      <g className="fill-line" opacity={0.7}>
        {Array.from({ length: 9 }, (_, r) =>
          Array.from({ length: 13 }, (_, c) => <circle key={`${r}-${c}`} cx={12 + c * 38} cy={16 + r * 42} r={1} />),
        )}
      </g>

      <text x={20} y={46} className="fill-human-accent font-mono" fontSize={9.5} letterSpacing="0.14em">
        ENGINEER JUDGMENT
      </text>
      <text x={460} y={46} textAnchor="end" className="fill-brand-300 font-mono" fontSize={9.5} letterSpacing="0.14em">
        AI CAPABILITY
      </text>

      {/* Engineer card */}
      <rect x={20} y={60} width={184} height={176} rx={14} className="fill-ink-850 stroke-human-accent/50" strokeWidth={1.3} />
      <CardHead x={20} title="Engineer" sub="decides · reviews" tone="human">
        <circle cx={44} cy={84} r={4} className="fill-none stroke-human-accent" strokeWidth={1.4} />
        <path d="M36 96c1.5-5 4.5-7 8-7s6.5 2 8 7" className="fill-none stroke-human-accent" strokeWidth={1.4} strokeLinecap="round" />
      </CardHead>
      <line x1={36} y1={116} x2={188} y2={116} className="stroke-line" />
      {decisions.map((d, i) => {
        const y = 140 + i * 30;
        return (
          <g key={d}>
            <rect x={36} y={y - 8} width={16} height={16} rx={4} className="fill-none stroke-human-accent/60" strokeWidth={1.2} />
            <path
              d={`m40 ${y} 3 3 5.5-6`}
              className="cv-anim fill-none stroke-human-accent"
              strokeWidth={1.8}
              strokeLinecap="round"
              strokeLinejoin="round"
              style={loop("cv-tick", i * 0.5)}
            />
            <text x={62} y={y + 4} className="fill-fg-muted font-sans" fontSize={11.5}>
              {d}
            </text>
          </g>
        );
      })}

      {/* AI card */}
      <rect x={276} y={60} width={184} height={176} rx={14} className="fill-ink-850 stroke-brand-400/50" strokeWidth={1.3} />
      <CardHead x={276} title="AI assistant" sub="drafts · suggests" tone="ai">
        <path d="M300 77l2.6 6.4 6.4 2.6-6.4 2.6-2.6 6.4-2.6-6.4-6.4-2.6 6.4-2.6z" className="fill-brand-300" />
      </CardHead>
      <line x1={292} y1={116} x2={444} y2={116} className="stroke-line" />
      {drafts.map((d, i) => {
        const y = 138 + i * 30;
        return (
          <g key={d.label}>
            <text x={292} y={y} className="fill-fg-muted font-sans" fontSize={11.5}>
              {d.label}
            </text>
            <rect x={292} y={y + 7} width={152} height={4} rx={2} className="fill-ink-700" />
            <rect
              x={292}
              y={y + 7}
              width={152 * d.w}
              height={4}
              rx={2}
              className="cv-anim fill-brand-400"
              style={{ ...loop("hac-fill", 0.3 + i * 0.4), transformOrigin: "left center" }}
            />
          </g>
        );
      })}

      {/* The exchange: intent goes to the AI, drafts come back */}
      <path d={INTENT} className="fill-none stroke-human-accent/70" strokeWidth={1.4} markerEnd="url(#hac-arrow-h)" />
      <path d={DRAFT} className="fill-none stroke-brand-400/70" strokeWidth={1.4} markerEnd="url(#hac-arrow-a)" />
      <g className="font-mono" fontSize={9}>
        <rect x={216} y={92} width={48} height={14} rx={7} className="fill-ink-950 stroke-human-accent/40" />
        <text x={240} y={102} textAnchor="middle" className="fill-human-accent">
          intent
        </text>
        <rect x={216} y={184} width={48} height={14} rx={7} className="fill-ink-950 stroke-brand-400/40" />
        <text x={240} y={194} textAnchor="middle" className="fill-brand-300">
          draft
        </text>
      </g>
      <Pulse path={INTENT} className="fill-human-accent drop-shadow-[0_0_4px_var(--color-human-accent)]" />
      <Pulse path={DRAFT} begin={1.2} className="fill-brand-300 drop-shadow-[0_0_4px_var(--color-brand-400)]" />

      {/* Both feed one reviewed solution */}
      <path d={FROM_HUMAN} className="flow-dash fill-none stroke-human-accent/60" strokeWidth={1.3} />
      <path d={FROM_AI} className="flow-dash fill-none stroke-brand-400/60" strokeWidth={1.3} />
      <Pulse path={FROM_HUMAN} begin={2.2} className="fill-human-accent" />
      <Pulse path={FROM_AI} begin={2.2} className="fill-brand-300" />

      <rect x={120} y={298} width={240} height={48} rx={12} className="fill-ink-850" stroke="url(#hac-result)" strokeWidth={1.6} />
      <circle cx={146} cy={322} r={11} className="cv-anim fill-brand-400" style={loop("hac-badge", 0)} />
      <path d="m141 322 3.5 3.5 6.5-7" className="fill-none stroke-on-brand" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <text x={166} y={318} className="fill-fg font-sans" fontSize={12.5} fontWeight={600}>
        Reviewed solution
      </text>
      <text x={166} y={333} className="fill-fg-subtle font-mono" fontSize={9}>
        human-approved · tested
      </text>
    </svg>
  );
}
