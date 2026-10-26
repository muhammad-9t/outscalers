import type { CSSProperties } from "react";
import { CodeXml, FlaskConical, Lightbulb, Rocket, UserCheck, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";

type Tone = "human" | "ai" | "neutral";
type Node = { x: number; label: string; sub: string; tone: Tone; Icon: LucideIcon };

const Y = 104; // centre line of the pipeline
const R = 24; // node radius

const nodes: Node[] = [
  { x: 80, label: "Idea", sub: "people define", tone: "human", Icon: Lightbulb },
  { x: 220, label: "Implement", sub: "AI-assisted", tone: "ai", Icon: CodeXml },
  { x: 360, label: "Review", sub: "engineer approves", tone: "human", Icon: UserCheck },
  { x: 500, label: "Test", sub: "automated + manual", tone: "neutral", Icon: FlaskConical },
  { x: 640, label: "Deploy", sub: "monitored", tone: "neutral", Icon: Rocket },
];

const tone: Record<Tone, { ring: string; halo: string; icon: string; dot: string }> = {
  human: { ring: "stroke-human-accent", halo: "stroke-human-accent/20", icon: "text-human-accent", dot: "fill-human-accent" },
  ai: { ring: "stroke-brand-400", halo: "stroke-brand-400/25", icon: "text-brand-300", dot: "fill-brand-400" },
  neutral: { ring: "stroke-fg-subtle", halo: "stroke-fg-subtle/20", icon: "text-fg-muted", dot: "fill-fg-subtle" },
};

const legend: { label: string; tone: Tone; x: number }[] = [
  { label: "Human-led", tone: "human", x: 444 },
  { label: "AI-assisted", tone: "ai", x: 534 },
  { label: "Automated", tone: "neutral", x: 632 },
];

/** Idea → AI-assisted implementation → human review → testing → deployment, with feedback loops. */
export function WorkflowLoop({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 720 236"
      role="img"
      aria-labelledby="wl-title wl-desc"
      className={cn("h-auto w-full", className)}
    >
      <title id="wl-title">Our engineering workflow</title>
      <desc id="wl-desc">
        Work moves from an idea defined by people, to AI-assisted implementation, to engineer review, to testing and then
        deployment. Review can send work back for changes, and lessons from production feed new ideas.
      </desc>
      <defs>
        <marker id="wl-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M1 1 9 5 1 9" className="fill-none stroke-brand-400" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" />
        </marker>
        <marker id="wl-arrow-human" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M1 1 9 5 1 9" className="fill-none stroke-human-accent" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" />
        </marker>
        <marker id="wl-arrow-muted" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M1 1 9 5 1 9" className="fill-none stroke-fg-subtle" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" />
        </marker>
      </defs>

      {/* Legend */}
      <g className="font-mono" fontSize={10}>
        {legend.map((l) => (
          <g key={l.label} transform={`translate(${l.x} 22)`}>
            <circle r={3.5} className={tone[l.tone].dot} />
            <text x={9} y={3.5} className="fill-fg-muted">
              {l.label}
            </text>
          </g>
        ))}
      </g>

      {/* Connectors between steps, drawn in sequence on reveal */}
      {nodes.slice(0, -1).map((n, i) => {
        const x1 = n.x + R + 8;
        const x2 = nodes[i + 1].x - R - 8;
        return (
          <g key={n.label}>
            <line x1={x1} y1={Y} x2={x2} y2={Y} className="stroke-line-strong" strokeWidth={2} markerEnd="url(#wl-arrow)" />
            <line
              x1={x1}
              y1={Y}
              x2={x2}
              y2={Y}
              className="draw-path stroke-brand-400"
              strokeWidth={2}
              style={{ "--path-length": x2 - x1, "--draw-delay": `${i * 220}ms` } as CSSProperties}
              data-reveal
            />
          </g>
        );
      })}

      {/* Changes requested: review → implement */}
      <path
        d={`M360 ${Y - R - 6}C360 ${Y - 86} 220 ${Y - 86} 220 ${Y - R - 8}`}
        className="flow-dash fill-none stroke-human-accent/70"
        strokeWidth={1.4}
        markerEnd="url(#wl-arrow-human)"
      />
      <g transform={`translate(290 ${Y - 72})`}>
        <rect x={-50} y={-8} width={100} height={16} rx={8} className="fill-ink-850 stroke-human-accent/40" />
        <text y={3} textAnchor="middle" className="fill-human-accent font-mono" fontSize={8.5}>
          changes requested
        </text>
      </g>

      {/* Feedback: deploy → idea, routed around the pipeline */}
      <path
        d={`M${640 + R + 6} ${Y}H684Q700 ${Y} 700 ${Y + 16}V196Q700 212 684 212H36Q20 212 20 196V${Y + 16}Q20 ${Y} 36 ${Y}H${80 - R - 8}`}
        className="flow-dash fill-none stroke-fg-subtle/60"
        strokeWidth={1.3}
        markerEnd="url(#wl-arrow-muted)"
      />
      <g transform="translate(360 212)">
        <rect x={-160} y={-10} width={320} height={20} rx={10} className="fill-ink-850 stroke-line-strong" />
        <text y={3.5} textAnchor="middle" className="fill-fg-muted font-mono" fontSize={10}>
          monitoring &amp; feedback shape the next iteration
        </text>
      </g>

      {nodes.map(({ x, label, sub, tone: t, Icon }) => (
        <g key={label}>
          <circle cx={x} cy={Y} r={R + 6} className={cn("fill-none", tone[t].halo)} strokeWidth={1} />
          <circle cx={x} cy={Y} r={R} className={cn("fill-ink-850", tone[t].ring)} strokeWidth={1.6} />
          <Icon x={x - 10} y={Y - 10} width={20} height={20} strokeWidth={1.6} className={tone[t].icon} aria-hidden />
          <text x={x} y={Y + R + 26} textAnchor="middle" className="fill-fg font-sans" fontSize={13} fontWeight={600}>
            {label}
          </text>
          <text x={x} y={Y + R + 43} textAnchor="middle" className="fill-fg-subtle font-mono" fontSize={10}>
            {sub}
          </text>
        </g>
      ))}
    </svg>
  );
}
