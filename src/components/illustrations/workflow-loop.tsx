import type { CSSProperties } from "react";
import { cn } from "@/lib/cn";

type Node = { x: number; label: string; sub: string; tone: "human" | "ai" | "neutral" };

const nodes: Node[] = [
  { x: 60, label: "Idea", sub: "people define", tone: "human" },
  { x: 200, label: "Implement", sub: "AI-assisted", tone: "ai" },
  { x: 340, label: "Review", sub: "engineer approves", tone: "human" },
  { x: 480, label: "Test", sub: "automated + manual", tone: "neutral" },
  { x: 620, label: "Deploy", sub: "monitored", tone: "neutral" },
];

const ring: Record<Node["tone"], string> = {
  human: "stroke-human-accent",
  ai: "stroke-brand-400",
  neutral: "stroke-fg-subtle",
};

/** Idea → AI-assisted implementation → human review → testing → deployment, with feedback loops. */
export function WorkflowLoop({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 680 230"
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
        <marker id="wl-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M0 0 10 5 0 10z" className="fill-fg-subtle" />
        </marker>
      </defs>

      {/* Main track */}
      <line x1={60} y1={110} x2={620} y2={110} className="stroke-line-strong" strokeWidth={2} />
      <line
        x1={60}
        y1={110}
        x2={620}
        y2={110}
        className="draw-path stroke-brand-400"
        strokeWidth={2}
        style={{ "--path-length": 560 } as CSSProperties}
        data-reveal
      />

      {/* Changes requested: review → implement */}
      <path d="M340 76C340 30 200 30 200 72" className="flow-dash fill-none stroke-human-accent/80" strokeWidth={1.5} markerEnd="url(#wl-arrow)" />
      <text x={270} y={28} textAnchor="middle" className="fill-human-accent font-mono" fontSize={11}>
        changes requested
      </text>

      {/* Learnings: deploy → idea */}
      <path d="M650 110C676 110 676 196 620 196H60C4 196 4 110 26 110" className="flow-dash fill-none stroke-fg-subtle/70" strokeWidth={1.3} markerEnd="url(#wl-arrow)" />
      <text x={340} y={224} textAnchor="middle" className="fill-fg-subtle font-mono" fontSize={11}>
        monitoring and feedback shape the next iteration
      </text>

      {nodes.map((n) => (
        <g key={n.label}>
          <circle cx={n.x} cy={110} r={30} className={cn("fill-ink-850", ring[n.tone])} strokeWidth={1.8} />
          <text x={n.x} y={114} textAnchor="middle" className="fill-fg font-sans" fontSize={12.5} fontWeight={600}>
            {n.label}
          </text>
          <text x={n.x} y={160} textAnchor="middle" className="fill-fg-subtle font-mono" fontSize={10.5}>
            {n.sub}
          </text>
        </g>
      ))}
    </svg>
  );
}
