import type { Ref } from "react";

/**
 * Small hovering HUD robot. Its parts are driven from outside through refs:
 * the body leans, the eye looks ahead and the thrusters flare while it travels.
 */
export function ScrollRobot({
  bodyRef,
  eyeRef,
  flameRef,
}: {
  bodyRef: Ref<SVGGElement>;
  eyeRef: Ref<SVGGElement>;
  flameRef: Ref<SVGGElement>;
}) {
  return (
    <svg viewBox="0 0 64 76" className="block h-auto w-14 overflow-visible" aria-hidden>
      {/* Shadow on the rail */}
      <ellipse cx={32} cy={74} rx={14} ry={2} className="fill-brand-500/25" />
      <g ref={bodyRef} style={{ transformOrigin: "32px 40px" }}>
        {/* Thrusters, flaring with speed */}
        <g ref={flameRef} style={{ transformOrigin: "32px 54px" }}>
          <path d="M22 54 25 66 28 54Z" className="fill-brand-400/80" />
          <path d="M36 54 39 66 42 54Z" className="fill-brand-400/80" />
          <path d="M23.5 54 25 60 26.5 54Z" className="fill-brand-200" />
          <path d="M37.5 54 39 60 40.5 54Z" className="fill-brand-200" />
        </g>
        {/* Antenna */}
        <line x1={32} y1={14} x2={32} y2={5} className="stroke-line-strong" strokeWidth={1.5} />
        <circle cx={32} cy={4} r={2.4} className="fill-brand-400 motion-safe:animate-pulse" />
        {/* Ears */}
        <rect x={6} y={26} width={5} height={12} rx={2} className="fill-ink-800 stroke-line-strong" />
        <rect x={53} y={26} width={5} height={12} rx={2} className="fill-ink-800 stroke-line-strong" />
        {/* Head */}
        <rect x={10} y={14} width={44} height={40} rx={16} className="fill-ink-850 stroke-line-strong" strokeWidth={1.5} />
        {/* Visor with the eye */}
        <rect x={16} y={24} width={32} height={16} rx={8} className="fill-ink-950 stroke-brand-400/60" />
        <g ref={eyeRef}>
          <circle cx={32} cy={32} r={6} className="fill-brand-400/25" />
          <circle cx={32} cy={32} r={3.2} className="fill-brand-300" />
        </g>
        {/* Status light */}
        <circle cx={32} cy={47} r={1.6} className="fill-human-accent" />
      </g>
    </svg>
  );
}
