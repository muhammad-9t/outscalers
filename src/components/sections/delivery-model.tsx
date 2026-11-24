import type { CSSProperties } from "react";
import {
  Activity,
  Bot,
  Bug,
  CheckCheck,
  ClipboardList,
  CodeXml,
  Database,
  Eye,
  FlaskConical,
  FolderKanban,
  GitBranch,
  GitPullRequest,
  ListChecks,
  Lock,
  type LucideIcon,
  MessagesSquare,
  Network,
  Rocket,
  RotateCcw,
  ShieldCheck,
  Hand,
  NotebookPen,
  Sparkles,
  Target,
  UserRound,
} from "lucide-react";
import { processPhases } from "@/content/process";
import { cn } from "@/lib/cn";
import { FlowLinks, type FlowLink } from "./flow-links";

type Tone = "human" | "brand" | "data";
type Tool = { icon: LucideIcon; label: string; tone: Tone };

/** Who owns each phase, and the working tools shown as app-style tiles on its card */
const details: Record<string, { owner: string; tools: Tool[] }> = {
  discovery: {
    owner: "Product lead",
    tools: [
      { icon: MessagesSquare, label: "Workshops", tone: "human" },
      { icon: ClipboardList, label: "Requirements", tone: "brand" },
      { icon: Target, label: "Success criteria", tone: "data" },
    ],
  },
  architecture: {
    owner: "Senior engineer",
    tools: [
      { icon: Network, label: "Architecture", tone: "data" },
      { icon: Database, label: "Data model", tone: "human" },
      { icon: Lock, label: "Security", tone: "brand" },
    ],
  },
  implementation: {
    owner: "Engineering team",
    tools: [
      { icon: CodeXml, label: "Code", tone: "human" },
      { icon: GitBranch, label: "Version control", tone: "data" },
      { icon: Bot, label: "AI assistant", tone: "brand" },
    ],
  },
  review: {
    owner: "Reviewing engineer",
    tools: [
      { icon: GitPullRequest, label: "Pull request", tone: "data" },
      { icon: Eye, label: "Code review", tone: "human" },
      { icon: CheckCheck, label: "Approval", tone: "brand" },
    ],
  },
  testing: {
    owner: "QA engineer",
    tools: [
      { icon: FlaskConical, label: "Automated tests", tone: "brand" },
      { icon: Bug, label: "Exploratory testing", tone: "human" },
      { icon: ListChecks, label: "Release checklist", tone: "data" },
    ],
  },
  deployment: {
    owner: "DevOps engineer",
    tools: [
      { icon: Rocket, label: "Release", tone: "brand" },
      { icon: Activity, label: "Monitoring", tone: "human" },
      { icon: RotateCcw, label: "Rollback plan", tone: "data" },
    ],
  },
};

const levels = ["", "light", "moderate", "high"];

function Bars({ value, tone }: { value: number; tone: "human" | "ai" }) {
  return (
    <span className="flex gap-0.5" aria-hidden>
      {[1, 2, 3].map((n) => (
        <span
          key={n}
          className={cn(
            "h-1.5 w-3.5 rounded-full",
            n <= value ? (tone === "human" ? "bg-human-accent/80" : "bg-brand-400/80") : "bg-ink-700",
          )}
        />
      ))}
    </span>
  );
}

const links: FlowLink[] = [
  { from: "client", to: "p1", a: "b", b: "t" },
  { from: "client", to: "notes", a: "r", b: "l" },
  { from: "p1", to: "p2", a: "r", b: "l" },
  { from: "p2", to: "p3", a: "t", b: "l", ai: true, label: "AI assists" },
  { from: "p3", to: "p4", a: "b", b: "t", label: "Human review" },
  { from: "p4", to: "p5", a: "l", b: "r" },
  { from: "p5", to: "p6", a: "l", b: "r" },
  { from: "p6", to: "live", a: "b", b: "t" },
];

function PhaseCard({ i }: { i: number }) {
  const p = processPhases[i];
  const d = details[p.id];
  return (
    <article className="flow-card flow-task">
      <header className="flex items-center justify-between gap-3">
        <span className="text-xs font-semibold text-brand-300">Phase {i + 1}</span>
        <span className="flex items-center gap-1.5 text-xs font-semibold text-brand-300">
          AI <Bars value={p.aiWeight} tone="ai" />
        </span>
      </header>
      <h3 className="mt-0.5 text-lg font-semibold leading-snug">{p.title}</h3>
      {/* Owner on the left, working tools on the right: one row keeps the card short */}
      <div className="mt-1.5 flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2 text-sm text-fg-muted">
          <span className="flex shrink-0 -space-x-1.5" aria-hidden>
            <span className="flow-avatar" data-tone="human">
              <UserRound className="size-3.5" />
            </span>
            <span className="flow-avatar" data-tone="brand">
              <Bot className="size-3.5" />
            </span>
          </span>
          <span className="truncate">
            <span className="sr-only">Owned by </span>
            {d.owner}
          </span>
        </div>
        <ul className="flex shrink-0 gap-1" aria-label="Toolkit">
          {d.tools.map((t) => (
            <li key={t.label} className="flow-tile" data-tone={t.tone} title={t.label}>
              <t.icon aria-hidden className="size-3.5" />
              <span className="sr-only">{t.label}</span>
            </li>
          ))}
        </ul>
      </div>
      <p className="mt-2.5 flex items-start gap-2 border-t border-line pt-2 text-sm text-fg">
        <ShieldCheck aria-hidden className="mt-0.5 size-4 shrink-0 text-brand-400" />
        <span>
          <span className="sr-only">Human checkpoint: </span>
          {p.checkpoint}
        </span>
      </p>
      <p className="sr-only">
        People lead this phase. AI involvement is {levels[p.aiWeight]}: {p.ai[0]}.
      </p>
    </article>
  );
}

/**
 * Six-phase delivery model drawn as a work-flow canvas (large screens): a client pill and notes
 * card, then compact phase cards joined by rounded connectors that snake 01→03, 04→06. AI joins
 * phase 03 along a dashed curve, shown as a tilted stack with the AI draft behind the card.
 * Phones get one column with CSS lines. Styles: .flow-* in globals.css; lines: flow-links.tsx.
 */
export function DeliveryModel() {
  return (
    <div>
      <div data-reveal className="mb-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-fg-muted">
        <span className="flex items-center gap-2">
          <span aria-hidden className="h-1.5 w-6 rounded-full bg-human-accent/80" /> People: lead and decide in every phase
        </span>
        <span className="flex items-center gap-2">
          <span aria-hidden className="h-1.5 w-6 rounded-full bg-brand-400/80" /> AI: assists where it adds value
        </span>
      </div>

      <div data-reveal className="flow relative">
        <ol className="flow-grid">
          <li data-flow="client" className="flow-node flow-client" style={{ "--i": 0 } as CSSProperties}>
            <div className="flow-card flow-pill">
              <span className="text-fg-muted">Client:</span>
              <span className="flow-tile" data-tone="brand" aria-hidden>
                <FolderKanban className="size-3.5" />
              </span>
              <span className="font-semibold text-fg">Your project</span>
              <span className="text-xs text-fg-subtle">Kick-off · week 1</span>
            </div>
          </li>

          <li data-flow="notes" aria-hidden className="flow-node flow-notes" style={{ "--i": 1 } as CSSProperties}>
            <div className="flow-card flow-pill">
              <span className="flow-tile" data-tone="data">
                <NotebookPen className="size-3.5" />
              </span>
              <span className="font-medium text-fg">Client notes</span>
              <span className="text-xs text-fg-subtle">Updated today</span>
            </div>
          </li>

          {processPhases.map((p, i) => (
            <li
              key={p.id}
              data-flow={`p${i + 1}`}
              data-step={i + 1}
              className="flow-node flow-phase"
              style={{ "--i": i + 2 } as CSSProperties}
            >
              {i === 2 && (
                <>
                  {/* AI's work arrives as a draft, stacked behind the card that people own */}
                  <div aria-hidden className="flow-card flow-stack">
                    <span className="flex items-center gap-1.5 font-mono text-xs tracking-wide text-brand-300">
                      <Sparkles className="size-3.5" /> AI DRAFT
                    </span>
                    <span className="mt-1 block text-sm text-fg-muted">{p.ai[0]}</span>
                  </div>
                  <Hand aria-hidden className="flow-hand" />
                </>
              )}
              <PhaseCard i={i} />
            </li>
          ))}

          <li data-flow="live" className="flow-node flow-live-node" style={{ "--i": 8 } as CSSProperties}>
            <div className="flow-card flow-pill">
              <span className="flow-live" aria-hidden />
              <span className="font-semibold text-fg">Live</span>
              <span className="text-fg-muted">monitored and improving with you</span>
            </div>
          </li>
        </ol>
        <FlowLinks links={links} />
      </div>
    </div>
  );
}
