import type { CaseStudy } from "@/content/case-studies";
import { cn } from "@/lib/cn";

/** Qualitative diagrams for case studies — intentionally free of numbers or results. */
export function CaseVisual({ visual, className }: { visual: CaseStudy["visual"]; className?: string }) {
  return (
    <svg viewBox="0 0 400 220" aria-hidden focusable="false" className={cn("h-auto w-full", className)}>
      <g className="fill-line" opacity={0.8}>
        {Array.from({ length: 6 }, (_, r) =>
          Array.from({ length: 11 }, (_, c) => <circle key={`${r}-${c}`} cx={20 + c * 36} cy={20 + r * 36} r={1} />),
        )}
      </g>
      {visual === "scale" && <ScaleVisual />}
      {visual === "traffic" && <TrafficVisual />}
      {visual === "compliance" && <ComplianceVisual />}
    </svg>
  );
}

function ScaleVisual() {
  const services = [
    [250, 40],
    [320, 40],
    [250, 100],
    [320, 100],
    [250, 160],
    [320, 160],
  ];
  return (
    <g>
      <rect x={40} y={50} width={90} height={120} rx={12} className="fill-ink-800 stroke-line-strong" strokeWidth={1.4} />
      {[72, 96, 120, 144].map((y) => (
        <rect key={y} x={56} y={y} width={58} height={10} rx={3} className="fill-ink-700" />
      ))}
      <text x={85} y={192} textAnchor="middle" className="fill-fg-subtle font-mono" fontSize={10}>
        monolith
      </text>
      <path d="M146 110H196" className="flow-dash fill-none stroke-brand-400" strokeWidth={1.6} />
      <circle cx={212} cy={110} r={10} className="fill-ink-800 stroke-brand-400" strokeWidth={1.4} />
      {services.map(([x, y]) => (
        <g key={`${x}${y}`}>
          <path d={`M222 110C232 110 236 ${y + 15} ${x} ${y + 15}`} className="fill-none stroke-brand-500/40" strokeWidth={1.1} />
          <rect x={x} y={y} width={52} height={30} rx={8} className="fill-ink-850 stroke-brand-400/70" strokeWidth={1.3} />
          <circle cx={x + 12} cy={y + 15} r={3} className="fill-brand-400" />
          <rect x={x + 20} y={y + 12} width={22} height={6} rx={3} className="fill-ink-700" />
        </g>
      ))}
    </g>
  );
}

function TrafficVisual() {
  return (
    <g>
      <line x1={30} y1={190} x2={380} y2={190} className="stroke-line-strong" />
      <path
        d="M30 170C80 168 110 165 140 150S180 50 210 46 250 120 290 150 350 168 380 168"
        className="fill-none stroke-human-accent"
        strokeWidth={2}
      />
      <path
        d="M30 160H120V128H160V42H240V120H300V156H380"
        className="fill-none stroke-brand-400"
        strokeWidth={1.8}
        strokeDasharray="5 4"
      />
      <rect x={176} y={20} width={68} height={18} rx={9} className="fill-ink-850 stroke-human-accent/50" />
      <text x={210} y={33} textAnchor="middle" className="fill-human-accent font-mono" fontSize={9.5}>
        peak event
      </text>
      <g className="font-mono" fontSize={9.5}>
        <line x1={40} y1={208} x2={56} y2={208} className="stroke-human-accent" strokeWidth={2} />
        <text x={62} y={211} className="fill-fg-subtle">traffic</text>
        <line x1={120} y1={208} x2={136} y2={208} className="stroke-brand-400" strokeWidth={2} strokeDasharray="5 4" />
        <text x={142} y={211} className="fill-fg-subtle">capacity scales with demand</text>
      </g>
    </g>
  );
}

function ComplianceVisual() {
  return (
    <g>
      <rect x={36} y={36} width={170} height={150} rx={14} className="fill-ink-850 stroke-line-strong" strokeWidth={1.4} />
      {[62, 94, 126, 158].map((y, i) => (
        <g key={y}>
          <circle cx={58} cy={y} r={7} className="fill-ink-700" />
          <rect x={74} y={y - 5} width={i % 2 ? 80 : 100} height={10} rx={4} className="fill-ink-700" />
          <rect x={180} y={y - 6} width={12} height={12} rx={3} className="fill-none stroke-brand-400/70" />
        </g>
      ))}
      <g transform="translate(229 100)">
        <rect x={-18} y={-4} width={36} height={30} rx={6} className="fill-ink-800 stroke-brand-300" strokeWidth={1.6} />
        <path d="M-10-4v-8a10 10 0 0 1 20 0v8" className="fill-none stroke-brand-300" strokeWidth={1.6} />
        <circle cy={11} r={3} className="fill-brand-300" />
      </g>
      <rect x={252} y={48} width={124} height={128} rx={12} className="fill-ink-900 stroke-line-strong" strokeWidth={1.2} />
      <text x={266} y={70} className="fill-fg-subtle font-mono" fontSize={9.5} letterSpacing="0.08em">
        AUDIT LOG
      </text>
      {[90, 112, 134, 156].map((y) => (
        <g key={y}>
          <path d={`m266 ${y - 2} 3 3 6-6`} className="fill-none stroke-brand-400" strokeWidth={1.6} strokeLinecap="round" />
          <rect x={282} y={y - 5} width={78} height={7} rx={3} className="fill-ink-700" />
        </g>
      ))}
    </g>
  );
}
