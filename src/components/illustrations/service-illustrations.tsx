import type { CSSProperties, ReactNode } from "react";
import type { ServiceSlug } from "@/content/services";
import { cn } from "@/lib/cn";

type Tone = "neutral" | "ai" | "human";

const boxTone: Record<Tone, string> = {
  neutral: "fill-ink-850 stroke-line-strong",
  ai: "fill-ink-850 stroke-brand-400",
  human: "fill-ink-850 stroke-human-accent",
};
const labelTone: Record<Tone, string> = {
  neutral: "fill-fg",
  ai: "fill-brand-200",
  human: "fill-human-accent",
};

function Box({
  x,
  y,
  w,
  h = 42,
  label,
  sub,
  tone = "neutral",
}: {
  x: number;
  y: number;
  w: number;
  h?: number;
  label: string;
  sub?: string;
  tone?: Tone;
}) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={10} className={boxTone[tone]} strokeWidth={1.3} />
      <text
        x={x + w / 2}
        y={sub ? y + h / 2 - 3 : y + h / 2 + 4}
        textAnchor="middle"
        className={cn("font-sans", labelTone[tone])}
        fontSize={11.5}
        fontWeight={600}
      >
        {label}
      </text>
      {sub && (
        <text x={x + w / 2} y={y + h / 2 + 11} textAnchor="middle" className="fill-fg-subtle font-mono" fontSize={9}>
          {sub}
        </text>
      )}
    </g>
  );
}

function Frame({
  title,
  desc,
  viewBox = "0 0 480 360",
  className,
  children,
}: {
  title: string;
  desc: string;
  viewBox?: string;
  className?: string;
  children: ReactNode;
}) {
  const id = title.toLowerCase().replace(/[^a-z]+/g, "-");
  return (
    <svg viewBox={viewBox} role="img" aria-labelledby={`${id}-t ${id}-d`} className={cn("h-auto w-full", className)}>
      <title id={`${id}-t`}>{title}</title>
      <desc id={`${id}-d`}>{desc}</desc>
      <defs>
        <marker id={`${id}-arrow`} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M0 0 10 5 0 10z" className="fill-fg-subtle" />
        </marker>
      </defs>
      {children}
    </svg>
  );
}

const flow = "flow-dash fill-none";

export function AgentsNetwork({ className }: { className?: string }) {
  return (
    <Frame
      className={className}
      title="AI agent architecture"
      desc="An AI agent draws on a knowledge base, documents and a database inside guardrails. Routine answers are returned with sources, while actions above a limit go to a person for approval before systems are updated."
    >
      <circle cx={232} cy={180} r={80} className="fill-none stroke-brand-500/40" strokeDasharray="3 6" />
      <text x={232} y={92} textAnchor="middle" className="fill-brand-300/80 font-mono" fontSize={9} letterSpacing="0.1em">
        GUARDRAILS · PERMISSIONS
      </text>

      {[60, 160, 260].map((y) => (
        <path key={y} d={`M124 ${y + 21}C170 ${y + 21} 160 180 188 180`} className={cn(flow, "stroke-fg-subtle/70")} strokeWidth={1.3} />
      ))}
      <Box x={14} y={60} w={110} label="Knowledge base" />
      <Box x={14} y={160} w={110} label="Documents" />
      <Box x={14} y={260} w={110} label="Database" />

      <path d="M268 166C300 120 300 82 330 81" className={cn(flow, "stroke-brand-400/80")} strokeWidth={1.4} />
      <path d="M272 182C300 182 306 181 330 181" className={cn(flow, "stroke-human-accent/80")} strokeWidth={1.4} />
      <path d="M396 202V260" className="fill-none stroke-fg-subtle" strokeWidth={1.3} markerEnd="url(#ai-agent-architecture-arrow)" />

      <polygon points="232,136 270,158 270,202 232,224 194,202 194,158" className="fill-ink-800 stroke-brand-300" strokeWidth={1.8} />
      <circle cx={232} cy={180} r={6} className="animate-pulse-soft fill-brand-400" />
      <text x={232} y={208} textAnchor="middle" className="fill-fg font-sans" fontSize={12} fontWeight={600}>
        Agent
      </text>
      <path d="M232 152l2.2 5 5 2.2-5 2.2-2.2 5-2.2-5-5-2.2 5-2.2z" className="fill-brand-300" />

      <Box x={330} y={60} w={136} label="Answer + sources" sub="routine request" tone="ai" />
      <Box x={330} y={160} w={136} label="Human approval" sub="above set limits" tone="human" />
      <Box x={330} y={262} w={136} label="Update CRM" sub="after approval" />
    </Frame>
  );
}

// Isometric plate geometry: centre x, half-width, half-height and thickness.
// Plate contents are drawn on a square and flattened by HH / HW so they sit inside the plate.
const LAYER_CX = 210;
const LAYER_HW = 120;
const LAYER_HH = 35;
const LAYER_T = 8;

export function SoftwareLayers({ className }: { className?: string }) {
  const [cx, hw, hh, t] = [LAYER_CX, LAYER_HW, LAYER_HH, LAYER_T];
  const left = cx - hw;
  const right = cx + hw;
  const layers = [
    { y: 285, label: "Data", sub: "models · storage", accent: false },
    { y: 215, label: "Services", sub: "business logic", accent: false },
    { y: 145, label: "APIs", sub: "versioned · tested", accent: false },
    { y: 75, label: "Interface", sub: "web · mobile", accent: true },
  ];
  return (
    <Frame
      className={className}
      title="Layered software architecture"
      desc="Four stacked layers: data, services, APIs and interface. AI assists implementation across layers while engineers review the architecture."
    >
      {layers.map(({ y, label, sub, accent }) => (
        <g key={label}>
          <polygon points={`${left},${y} ${cx},${y + hh} ${cx},${y + hh + t} ${left},${y + t}`} className="fill-ink-750" />
          <polygon points={`${cx},${y + hh} ${right},${y} ${right},${y + t} ${cx},${y + hh + t}`} className="fill-ink-700" />
          <polygon
            points={`${cx},${y - hh} ${right},${y} ${cx},${y + hh} ${left},${y}`}
            className={accent ? "fill-ink-800 stroke-brand-400" : "fill-ink-850 stroke-line-strong"}
            strokeWidth={1.3}
          />
          <g transform={`translate(${cx} ${y}) scale(1 ${hh / hw}) rotate(45)`}>
            {label === "Interface" && (
              <g className="fill-none stroke-brand-300/80" strokeWidth={1.2} vectorEffect="non-scaling-stroke">
                <rect x={-60} y={-60} width={120} height={22} rx={4} vectorEffect="non-scaling-stroke" />
                <rect x={-60} y={-28} width={56} height={84} rx={4} vectorEffect="non-scaling-stroke" />
                <rect x={6} y={-28} width={54} height={40} rx={4} vectorEffect="non-scaling-stroke" />
                <rect x={6} y={18} width={54} height={38} rx={4} vectorEffect="non-scaling-stroke" />
              </g>
            )}
            {label === "APIs" && (
              <g className="stroke-data-accent/70" strokeWidth={1.2}>
                {[-40, -10, 20, 50].map((o) => (
                  <line key={o} x1={-60} y1={o} x2={60} y2={o} vectorEffect="non-scaling-stroke" strokeDasharray="6 5" />
                ))}
              </g>
            )}
            {label === "Services" && (
              <g className="fill-none stroke-fg-subtle" strokeWidth={1.2}>
                {[-50, 10].map((x) =>
                  [-50, 10].map((yy) => (
                    <rect key={`${x}${yy}`} x={x} y={yy} width={40} height={40} rx={6} vectorEffect="non-scaling-stroke" />
                  )),
                )}
              </g>
            )}
            {label === "Data" && (
              <g className="fill-none stroke-brand-500/70" strokeWidth={1.2}>
                {[-36, 0, 36].map((o) => (
                  <circle key={o} cx={o} cy={-o} r={18} vectorEffect="non-scaling-stroke" />
                ))}
              </g>
            )}
          </g>
          <line x1={right + 4} y1={y} x2={right + 16} y2={y} className="stroke-line-strong" />
          <text x={right + 20} y={y - 1} className={accent ? "fill-brand-200 font-sans" : "fill-fg font-sans"} fontSize={12} fontWeight={600}>
            {label}
          </text>
          <text x={right + 20} y={y + 13} className="fill-fg-subtle font-mono" fontSize={9}>
            {sub}
          </text>
        </g>
      ))}

      <g className="font-mono" fontSize={9.5}>
        {/* Pills sit level with the APIs (y 145) and Services (y 215) plates and connect to their left corners */}
        <rect x={4} y={133} width={74} height={24} rx={12} className="fill-ink-850 stroke-brand-500/60" />
        <text x={41} y={149} textAnchor="middle" className="fill-brand-300">AI assist</text>
        <path d={`M78 145H${left - 2}`} className={cn(flow, "stroke-brand-400/70")} strokeWidth={1.2} />
        <circle cx={left} cy={145} r={2.5} className="fill-brand-400" />
        <rect x={4} y={203} width={74} height={24} rx={12} className="fill-ink-850 stroke-human-accent/60" />
        <text x={41} y={219} textAnchor="middle" className="fill-human-accent">Eng. review</text>
        <path d={`M78 215H${left - 2}`} className={cn(flow, "stroke-human-accent/70")} strokeWidth={1.2} />
        <circle cx={left} cy={215} r={2.5} className="fill-human-accent" />
      </g>
    </Frame>
  );
}

export function AutomationFlow({ className }: { className?: string }) {
  return (
    <Frame
      className={className}
      title="Automated workflow with human checkpoints"
      desc="A request is received, AI extracts and classifies it, and a rules check decides the path: routine cases run automatically, exceptions go to a person for approval. Both paths update connected systems and write an audit log."
    >
      <path d="M140 62H176" className="fill-none stroke-fg-subtle" strokeWidth={1.3} markerEnd="url(#automated-workflow-with-human-checkpoints-arrow)" />
      <path d="M318 62H366" className="fill-none stroke-fg-subtle" strokeWidth={1.3} markerEnd="url(#automated-workflow-with-human-checkpoints-arrow)" />
      {/* Branches leave the Rules diamond from its bottom corner (routine) and lower-left edge (exception) */}
      <path d="M402 96V148" className={cn(flow, "stroke-brand-400/80")} strokeWidth={1.4} markerEnd="url(#automated-workflow-with-human-checkpoints-arrow)" />
      <path d="M385 79C330 100 248 110 248 148" className={cn(flow, "stroke-human-accent/80")} strokeWidth={1.4} markerEnd="url(#automated-workflow-with-human-checkpoints-arrow)" />
      <text x={410} y={126} className="fill-brand-300 font-mono" fontSize={9}>routine</text>
      <text x={270} y={132} className="fill-human-accent font-mono" fontSize={9}>exception</text>
      <path d="M402 194V266Q402 292 376 292H320" className="fill-none stroke-fg-subtle" strokeWidth={1.3} markerEnd="url(#automated-workflow-with-human-checkpoints-arrow)" />
      <path d="M248 194V268" className="fill-none stroke-fg-subtle" strokeWidth={1.3} markerEnd="url(#automated-workflow-with-human-checkpoints-arrow)" />
      <path d="M176 292H146" className="fill-none stroke-fg-subtle" strokeWidth={1.3} markerEnd="url(#automated-workflow-with-human-checkpoints-arrow)" />

      <Box x={12} y={40} w={128} h={44} label="Request received" sub="email · form · API" />
      <Box x={178} y={40} w={140} h={44} label="AI extracts & classifies" sub="confidence scored" tone="ai" />
      <polygon points="402,28 436,62 402,96 368,62" className="fill-ink-800 stroke-line-strong" strokeWidth={1.3} />
      <text x={402} y={66} textAnchor="middle" className="fill-fg font-sans" fontSize={10.5} fontWeight={600}>
        Rules
      </text>
      <Box x={340} y={150} w={124} h={44} label="Automated step" sub="within limits" tone="ai" />
      <Box x={178} y={150} w={140} h={44} label="Human approval" sub="judgment needed" tone="human" />
      <Box x={178} y={270} w={140} h={44} label="Systems updated" sub="CRM · ERP · finance" />
      <Box x={12} y={270} w={132} h={44} label="Audit log" sub="every decision traced" />
    </Frame>
  );
}

export function DataPipeline({ className }: { className?: string }) {
  return (
    <Frame
      className={className}
      viewBox="0 0 520 360"
      title="Data pipeline on cloud infrastructure"
      desc="Data from application databases, SaaS tools and files is ingested, validated and stored in a warehouse within a managed cloud environment, then used for analytics and AI workloads."
    >
      <rect x={132} y={70} width={262} height={220} rx={22} className="fill-ink-900/60 stroke-data-accent/40" strokeDasharray="5 6" />
      <text x={148} y={92} className="fill-data-accent/90 font-mono" fontSize={9} letterSpacing="0.1em">
        CLOUD · INFRASTRUCTURE AS CODE
      </text>

      {/* Sources merge at an entry point on the cloud boundary, then flow into Ingest */}
      {[110, 180, 250].map((y) => (
        <path key={y} d={`M108 ${y}C124 ${y} 118 180 130 180`} className={cn(flow, "stroke-fg-subtle/70")} strokeWidth={1.3} />
      ))}
      <circle cx={132} cy={180} r={3} className="fill-data-accent" />
      <path d="M135 180H146" className="fill-none stroke-fg-subtle" strokeWidth={1.3} markerEnd="url(#data-pipeline-on-cloud-infrastructure-arrow)" />
      <Box x={8} y={90} w={100} h={40} label="App database" />
      <Box x={8} y={160} w={100} h={40} label="SaaS tools" />
      <Box x={8} y={230} w={100} h={40} label="Files & events" />

      <Box x={148} y={158} w={66} h={44} label="Ingest" />
      <path d="M214 180H230" className="fill-none stroke-fg-subtle" strokeWidth={1.3} markerEnd="url(#data-pipeline-on-cloud-infrastructure-arrow)" />
      <Box x={232} y={158} w={72} h={44} label="Validate" sub="checks" tone="ai" />
      <path d="M304 180H320" className="fill-none stroke-fg-subtle" strokeWidth={1.3} markerEnd="url(#data-pipeline-on-cloud-infrastructure-arrow)" />

      {/* Warehouse cylinder */}
      <g>
        <path d="M322 160v44c0 7 14 12 32 12s32-5 32-12v-44" className="fill-ink-800 stroke-brand-400" strokeWidth={1.4} />
        <ellipse cx={354} cy={160} rx={32} ry={11} className="fill-ink-750 stroke-brand-400" strokeWidth={1.4} />
        <path d="M322 182c0 7 14 12 32 12s32-5 32-12" className="fill-none stroke-brand-400/50" strokeWidth={1.2} />
        <text x={354} y={236} textAnchor="middle" className="fill-fg font-sans" fontSize={11} fontWeight={600}>
          Warehouse
        </text>
      </g>

      {/* Outputs leave the warehouse's right side and enter the middle of each box's left edge */}
      <path d="M386 170C404 170 398 118 414 118" className={cn(flow, "stroke-brand-400/80")} strokeWidth={1.4} markerEnd="url(#data-pipeline-on-cloud-infrastructure-arrow)" />
      <path d="M386 194C404 194 398 242 414 242" className={cn(flow, "stroke-brand-400/80")} strokeWidth={1.4} markerEnd="url(#data-pipeline-on-cloud-infrastructure-arrow)" />
      <Box x={416} y={96} w={96} h={44} label="Analytics" sub="dashboards" />
      <Box x={416} y={220} w={96} h={44} label="AI workloads" sub="retrieval · ML" tone="ai" />
    </Frame>
  );
}

export function SecurityLayers({ className }: { className?: string }) {
  const rings = [
    { r: 68, label: "Automated tests", tone: "stroke-brand-400/70", text: "fill-brand-300" },
    { r: 98, label: "Security scanning", tone: "stroke-data-accent/60", text: "fill-data-accent" },
    { r: 128, label: "Human code review", tone: "stroke-human-accent/80", text: "fill-human-accent" },
    { r: 158, label: "Monitoring & alerting", tone: "stroke-fg-subtle/70", text: "fill-fg-muted" },
  ];
  return (
    <Frame
      className={className}
      viewBox="0 0 480 380"
      title="Layered security and quality safeguards"
      desc="A release at the centre is protected by four layers: automated tests, security scanning, human code review, and monitoring with alerting. An issue from outside is stopped by the layers."
    >
      {rings.map(({ r, tone }, i) => (
        <circle
          key={r}
          cx={240}
          cy={196}
          r={r}
          className={cn("fill-none sec-orbit", tone)}
          style={{ "--orbit-dur": `${70 + i * 25}s`, "--orbit-dir": i % 2 ? "reverse" : "normal" } as CSSProperties}
          strokeWidth={1.4}
          strokeDasharray={i % 2 ? "4 6" : undefined}
        />
      ))}
      {/* Review ring flashes when it stops the issue */}
      <circle cx={240} cy={196} r={128} className="sec-review-flash fill-none stroke-human-accent" strokeWidth={3} />
      {rings.map(({ r, label, text }, i) => (
        <g key={label}>
          {/* Each layer's sentinel dot patrols its ring */}
          <g className="sec-orbit" style={{ "--orbit-dur": `${14 + i * 6}s`, "--orbit-dir": i % 2 ? "reverse" : "normal" } as CSSProperties}>
            <circle cx={240 - r * Math.cos(Math.PI / 4 + i * 0.12)} cy={196 - r * Math.sin(Math.PI / 4 + i * 0.12)} r={4} className={cn(text, "stroke-ink-900")} strokeWidth={2} />
          </g>
          <text x={240 + r * 0.72} y={196 - r * 0.72 + 4} className={cn("font-mono stroke-ink-900", text)} fontSize={9.5} strokeWidth={4} paintOrder="stroke">
            {label}
          </text>
        </g>
      ))}
      <circle cx={240} cy={196} r={38} className="sec-ping fill-none stroke-brand-300" strokeWidth={1.4} />
      <circle cx={240} cy={196} r={38} className="fill-ink-800 stroke-brand-300" strokeWidth={1.8} />
      <path d="M240 178l-14 5v9c0 8 6 14 14 17 8-3 14-9 14-17v-9z" className="fill-none stroke-brand-300" strokeWidth={1.6} strokeLinejoin="round" />
      <path d="m234 195 4 4 8-8" className="fill-none stroke-brand-300" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
      <text x={240} y={250} textAnchor="middle" className="fill-fg font-sans" fontSize={11} fontWeight={600}>
        Release
      </text>

      {/* Issue travels in and is stopped at the review layer */}
      <path d="M40 340 128 268" className="flow-dash fill-none stroke-fg-subtle" strokeWidth={1.3} />
      <g transform="translate(40 340)">
        <circle r={4.5} className="sec-threat fill-danger" />
      </g>
      <g transform="translate(140 258)">
        <circle r={10} className="sec-impact fill-none stroke-human-accent" strokeWidth={1.4} />
        <g className="sec-block">
          <circle r={10} className="fill-ink-900 stroke-human-accent" strokeWidth={1.4} />
          <path d="m-4-4 8 8m0-8-8 8" className="stroke-human-accent" strokeWidth={1.6} strokeLinecap="round" />
        </g>
      </g>
      <text x={20} y={360} className="fill-fg-subtle font-mono" fontSize={9}>
        issue caught before release
      </text>
    </Frame>
  );
}

export function ServiceIllustration({ slug, className }: { slug: ServiceSlug; className?: string }) {
  switch (slug) {
    case "ai-solutions":
      return <AgentsNetwork className={className} />;
    case "software-development":
      return <SoftwareLayers className={className} />;
    case "automation":
      return <AutomationFlow className={className} />;
    case "data-cloud":
      return <DataPipeline className={className} />;
    case "security-quality":
      return <SecurityLayers className={className} />;
  }
}
