import type { CSSProperties } from "react";
import type { CaseStudy } from "@/content/case-studies";
import { cn } from "@/lib/cn";

/** An animation on one SVG element; `.cv-anim` turns it off for reduced motion. */
const anim = (name: string, duration: number, delay = 0, timing = "ease-in-out"): CSSProperties => ({
  animation: `${name} ${duration}s ${timing} ${delay}s infinite both`,
});

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

// Packets leave the monolith, pass the hub and fan out to each service row in turn
const PACKET_S = 2.4;

function ScaleVisual() {
  const rows = [40, 100, 160];
  const services = rows.flatMap((y, row) => [
    [250, y, row],
    [320, y, row],
  ]);
  return (
    <g>
      {/* Connectors first, so they always sit under the boxes: hub → first column, then along each row */}
      {rows.map((y) => (
        <g key={y} className="fill-none stroke-brand-500/40" strokeWidth={1.1}>
          <path d={`M222 110C236 110 236 ${y + 15} 250 ${y + 15}`} />
          <path d={`M302 ${y + 15}H320`} />
        </g>
      ))}
      <rect x={40} y={50} width={90} height={120} rx={12} className="fill-ink-800 stroke-line-strong" strokeWidth={1.4} />
      {[72, 96, 120, 144].map((y, i) => (
        <rect key={y} x={56} y={y} width={58} height={10} rx={3} className="cv-anim fill-ink-700" style={anim("cv-shimmer", 3.2, i * 0.25)} />
      ))}
      <text x={85} y={192} textAnchor="middle" className="fill-fg-subtle font-mono" fontSize={10}>
        monolith
      </text>
      <path d="M146 110H196" className="flow-dash fill-none stroke-brand-400" strokeWidth={1.6} />

      {/* Packets, one per row, running behind the boxes */}
      <g className="motion-reduce:hidden">
        {rows.map((y, i) => (
          // Hidden until its run begins, or it would sit at the SVG origin
          <circle key={y} r={2.6} opacity={0} className="fill-brand-300 drop-shadow-[0_0_4px_var(--color-brand-400)]">
            <animateMotion
              dur={`${PACKET_S * 3}s`}
              begin={`${i * PACKET_S}s`}
              repeatCount="indefinite"
              keyPoints="0;1;1"
              keyTimes="0;0.33;1"
              calcMode="linear"
              path={`M146 110H212C236 110 236 ${y + 15} 250 ${y + 15}H346`}
            />
            <animate
              attributeName="opacity"
              dur={`${PACKET_S * 3}s`}
              begin={`${i * PACKET_S}s`}
              repeatCount="indefinite"
              values="1;1;0;0"
              keyTimes="0;0.32;0.33;1"
            />
          </circle>
        ))}
      </g>

      {/* The hub pings every time a packet passes */}
      <circle cx={212} cy={110} r={10} className="cv-anim fill-none stroke-brand-400" strokeWidth={1.2} style={anim("cv-ping", PACKET_S, 0.1, "ease-out")} />
      <circle cx={212} cy={110} r={10} className="fill-ink-800 stroke-brand-400" strokeWidth={1.4} />

      {services.map(([x, y, row]) => (
        <g key={`${x}${y}`}>
          <rect x={x} y={y} width={52} height={30} rx={8} className="fill-ink-850 stroke-brand-400/70" strokeWidth={1.3} />
          {/* Status light blinks as its row's packet arrives */}
          <circle
            cx={x + 12}
            cy={y + 15}
            r={3}
            className="cv-anim fill-brand-400"
            style={anim("cv-blink", PACKET_S * 3, row * PACKET_S + (x === 250 ? 0.45 : 0.7))}
          />
          <rect x={x + 20} y={y + 12} width={22} height={6} rx={3} className="fill-ink-700" />
        </g>
      ))}
    </g>
  );
}

const TRAFFIC = "M30 170C80 168 110 165 140 150S180 50 210 46 250 120 290 150 350 168 380 168";

function TrafficVisual() {
  return (
    <g>
      <line x1={30} y1={190} x2={380} y2={190} className="stroke-line-strong" />
      <path d={TRAFFIC} className="fill-none stroke-human-accent" strokeWidth={2} />
      {/* Capacity steps sized from the traffic curve: always ~12 units of headroom above it; the dashes flow */}
      <path
        d="M30 145H118V107H158V34H262V93H300V141H380"
        className="cv-anim fill-none stroke-brand-400"
        strokeWidth={1.8}
        strokeDasharray="5 4"
        style={anim("cv-dash", 1.2, 0, "linear")}
      />
      {/* A dot rides the traffic curve */}
      <g className="motion-reduce:hidden">
        <circle r={7} className="fill-human-accent/20">
          <animateMotion dur="6s" repeatCount="indefinite" path={TRAFFIC} />
        </circle>
        <circle r={3.5} className="fill-human-accent drop-shadow-[0_0_5px_var(--color-human-accent)]">
          <animateMotion dur="6s" repeatCount="indefinite" path={TRAFFIC} />
        </circle>
      </g>
      <g className="cv-anim" style={anim("cv-glow", 6, 2.1)}>
        <rect x={176} y={6} width={68} height={18} rx={9} className="fill-ink-850 stroke-human-accent/50" />
        <text x={210} y={19} textAnchor="middle" className="fill-human-accent font-mono" fontSize={9.5}>
          peak event
        </text>
      </g>
      <g className="font-mono" fontSize={9.5}>
        <line x1={40} y1={208} x2={56} y2={208} className="stroke-human-accent" strokeWidth={2} />
        <text x={62} y={211} className="fill-fg-subtle">traffic</text>
        <line x1={120} y1={208} x2={136} y2={208} className="stroke-brand-400" strokeWidth={2} strokeDasharray="5 4" />
        <text x={142} y={211} className="fill-fg-subtle">capacity scales with demand</text>
      </g>
    </g>
  );
}

// One cycle: the four records are checked, the lock closes, then the audit log fills in
const AUDIT_S = 5.6;

function ComplianceVisual() {
  return (
    <g>
      <rect x={36} y={36} width={170} height={150} rx={14} className="fill-ink-850 stroke-line-strong" strokeWidth={1.4} />
      {[62, 94, 126, 158].map((y, i) => (
        <g key={y}>
          <circle cx={58} cy={y} r={7} className="fill-ink-700" />
          <rect x={74} y={y - 5} width={i % 2 ? 80 : 100} height={10} rx={4} className="fill-ink-700" />
          <rect x={180} y={y - 6} width={12} height={12} rx={3} className="fill-none stroke-brand-400/70" />
          <path
            d={`m182.5 ${y} 2.5 2.5 4.5-5`}
            className="cv-anim fill-none stroke-brand-300"
            strokeWidth={1.6}
            strokeLinecap="round"
            strokeLinejoin="round"
            style={anim("cv-tick", AUDIT_S, i * 0.45)}
          />
        </g>
      ))}
      <g transform="translate(229 100)">
        <rect x={-18} y={-4} width={36} height={30} rx={6} className="fill-ink-800 stroke-brand-300" strokeWidth={1.6} />
        {/* The shackle drops shut once every record is checked */}
        <path
          d="M-10-4v-8a10 10 0 0 1 20 0v8"
          className="cv-anim fill-none stroke-brand-300"
          strokeWidth={1.6}
          style={anim("cv-shackle", AUDIT_S)}
        />
        <circle cy={11} r={3} className="cv-anim fill-brand-300" style={anim("cv-lock-glow", AUDIT_S)} />
      </g>
      <rect x={252} y={48} width={124} height={128} rx={12} className="fill-ink-900 stroke-line-strong" strokeWidth={1.2} />
      <text x={266} y={70} className="fill-fg-subtle font-mono" fontSize={9.5} letterSpacing="0.08em">
        AUDIT LOG
      </text>
      {[90, 112, 134, 156].map((y, i) => (
        <g key={y} className="cv-anim" style={anim("cv-log", AUDIT_S, i * 0.3)}>
          <path d={`m266 ${y - 2} 3 3 6-6`} className="fill-none stroke-brand-400" strokeWidth={1.6} strokeLinecap="round" />
          <rect x={282} y={y - 5} width={78} height={7} rx={3} className="fill-ink-700" />
        </g>
      ))}
    </g>
  );
}
