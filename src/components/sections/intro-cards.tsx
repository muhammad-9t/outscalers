import type { CSSProperties, ReactNode } from "react";
import { Bot, Check, CheckCheck, FileText, GitPullRequest, Rocket, Search, ShieldCheck, Sparkles, SquareTerminal, UserRound, Zap } from "lucide-react";
import { cn } from "@/lib/cn";

/**
 * "Who we are" cards on the home page. On hover (or keyboard focus) a card lifts and
 * three small "material" tiles fan out of its top edge with a springy wobble, small working widgets
 * (icon bubbles, status pills, a progress bar, a chart) pop in around them, and the other card blurs back. Pure CSS (see .intro-* in globals.css); the tiles are decorative.
 */

type Tone = "human" | "ai";

const cards: { label: string; tag: string; tone: Tone; text: string; items: string[] }[] = [
  {
    label: "People own",
    tag: "01 // Human",
    tone: "human",
    text: "Every decision that shapes the product, and the final say on what ships.",
    items: ["Requirements", "Architecture", "Code review", "Security decisions", "Release approval"],
  },
  {
    label: "AI accelerates",
    tag: "02 // AI",
    tone: "ai",
    text: "Speed on the routine work, with every output reviewed by an engineer.",
    items: ["Research", "Scaffolding", "Drafts & test ideas", "Documentation", "Log analysis"],
  },
];

/** Fan positions: left, centre (front, highest), right */
const fan = [
  { x: "-96px", y: "-4px", r: "-13deg" },
  { x: "0px", y: "-26px", r: "0deg" },
  { x: "96px", y: "-4px", r: "13deg" },
];

function Tile({ i, title, icon, tone, children }: { i: number; title: string; icon: ReactNode; tone: Tone; children: ReactNode }) {
  const p = fan[i];
  return (
    <div
      className="intro-tile"
      style={{ "--i": i, "--x": p.x, "--y": p.y, "--r": p.r, zIndex: i === 1 ? 2 : 1 } as CSSProperties}
    >
      <div className="intro-face relative rounded-lg border border-line-strong bg-ink-850 p-2.5 shadow-[0_18px_40px_-18px_rgb(0_0_0/0.7)]">
        <div className="flex items-center gap-1.5 text-xs font-medium text-fg-subtle">
          <span className={tone === "human" ? "text-human-accent" : "text-brand-300"}>{icon}</span>
          {title}
        </div>
        <div className="mt-2 space-y-1.5">{children}</div>
      </div>
    </div>
  );
}

/** A small working widget that pops in around the fan; x/y from the fan's bottom centre */
function Widget({ i, x, y, r, bubble, children }: { i: number; x: number; y: number; r: number; bubble?: boolean; children: ReactNode }) {
  return (
    <div
      className={cn(
        "intro-sat border border-line-strong bg-ink-850 shadow-[0_14px_30px_-14px_rgb(0_0_0/0.7)]",
        bubble ? "grid size-9 place-items-center rounded-xl" : "flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium text-fg",
      )}
      style={{ "--i": i, "--x": `${x}px`, "--y": `${y}px`, "--r": `${r}deg` } as CSSProperties}
    >
      {children}
    </div>
  );
}

const Bar = ({ w, className }: { w: string; className?: string }) => (
  <div className={cn("h-1.5 rounded-full bg-line-strong", className)} style={{ width: w }} />
);

function HumanTiles() {
  return (
    <>
      <Tile i={0} title="Spec" icon={<FileText className="size-3" />} tone="human">
        {["80%", "64%", "72%"].map((w) => (
          <div key={w} className="flex items-center gap-1.5">
            <span className="grid size-3 shrink-0 place-items-center rounded-sm bg-human-accent/20 text-human-accent">
              <Check className="size-2.5" strokeWidth={3} />
            </span>
            <Bar w={w} />
          </div>
        ))}
      </Tile>
      <Tile i={1} title="Review" icon={<Check className="size-3" />} tone="human">
        <div className="flex items-center gap-1.5 font-mono text-[10px] text-code-str">
          + <Bar w="70%" className="bg-code-str/40" />
        </div>
        <div className="flex items-center gap-1.5 font-mono text-[10px] text-danger">
          − <Bar w="52%" className="bg-danger/40" />
        </div>
        <div className="flex items-center gap-1.5 font-mono text-[10px] text-code-str">
          + <Bar w="60%" className="bg-code-str/40" />
        </div>
        <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-human-accent/15 px-2 py-0.5 text-[10px] font-semibold text-human-accent">
          <Check className="size-2.5" strokeWidth={3} /> Approved
        </span>
      </Tile>
      <Tile i={2} title="Release" icon={<Rocket className="size-3" />} tone="human">
        <div className="flex items-center gap-2">
          <ShieldCheck className="size-6 shrink-0 text-human-accent" />
          <div className="flex-1 space-y-1">
            <Bar w="90%" />
            <Bar w="60%" />
          </div>
        </div>
        <div className="mt-1 h-4 rounded-md bg-human-accent/80" />
      </Tile>
      <Widget i={3} x={-205} y={-118} r={-8} bubble>
        <GitPullRequest className="size-4 text-human-accent" />
      </Widget>
      <Widget i={4} x={-120} y={-150} r={-6}>
        <span className="flex -space-x-1">
          {[0, 1].map((n) => (
            <span key={n} className="grid size-4 place-items-center rounded-full border border-ink-850 bg-human-accent/25 text-human-accent">
              <UserRound className="size-2.5" />
            </span>
          ))}
        </span>
        2 reviewers
      </Widget>
      <Widget i={5} x={0} y={-188} r={0}>
        <Check className="size-3 text-code-str" strokeWidth={3} /> 24 tests passed
      </Widget>
      <Widget i={6} x={125} y={-150} r={7} bubble>
        <ShieldCheck className="size-4 text-human-accent" />
      </Widget>
      <Widget i={7} x={215} y={-112} r={8}>
        <Rocket className="size-3 text-human-accent" /> Release
        <span className="h-1.5 w-10 overflow-hidden rounded-full bg-line-strong">
          <span className="block h-full w-4/5 rounded-full bg-human-accent" />
        </span>
      </Widget>
    </>
  );
}

function AiTiles() {
  return (
    <>
      <Tile i={0} title="Research" icon={<Search className="size-3" />} tone="ai">
        <div className="flex h-4 items-center gap-1 rounded-md border border-line-strong px-1.5">
          <Search className="size-2.5 text-fg-subtle" />
          <Bar w="55%" />
        </div>
        {["85%", "70%"].map((w) => (
          <div key={w} className="flex items-center gap-1.5">
            <Sparkles className="size-2.5 shrink-0 text-brand-300" />
            <Bar w={w} />
          </div>
        ))}
      </Tile>
      <Tile i={1} title="Draft" icon={<Sparkles className="size-3" />} tone="ai">
        <Bar w="45%" className="bg-code-kw/50" />
        <Bar w="78%" className="ml-2 bg-code-str/45" />
        <Bar w="62%" className="ml-2 bg-brand-400/50" />
        <Bar w="30%" className="bg-code-kw/50" />
        <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-brand-400/15 px-2 py-0.5 text-[10px] font-semibold text-brand-300">
          <Sparkles className="size-2.5" /> AI draft
        </span>
      </Tile>
      <Tile i={2} title="Docs" icon={<FileText className="size-3" />} tone="ai">
        <Bar w="50%" className="h-2 bg-fg-subtle/50" />
        <Bar w="92%" />
        <Bar w="80%" />
        <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-human-accent/15 px-2 py-0.5 text-[10px] font-semibold text-human-accent">
          <Check className="size-2.5" strokeWidth={3} /> Reviewed
        </span>
      </Tile>
      <Widget i={3} x={-205} y={-118} r={-8} bubble>
        <Bot className="size-4 text-brand-300" />
      </Widget>
      <Widget i={4} x={-120} y={-150} r={-6}>
        <Zap className="size-3 text-brand-300" /> 3 suggestions
      </Widget>
      <Widget i={5} x={0} y={-188} r={0}>
        <span className="flex h-3.5 items-end gap-0.5" aria-hidden>
          {[40, 70, 55, 90, 65].map((h, n) => (
            <span key={n} className="w-1 rounded-sm bg-brand-400/80" style={{ height: `${h}%` }} />
          ))}
        </span>
        Logs summarised
      </Widget>
      <Widget i={6} x={125} y={-150} r={7} bubble>
        <SquareTerminal className="size-4 text-brand-300" />
      </Widget>
      <Widget i={7} x={215} y={-112} r={8}>
        <CheckCheck className="size-3 text-human-accent" /> Approved
      </Widget>
    </>
  );
}

export function IntroCards({ className }: { className?: string }) {
  return (
    <div className={cn("intro-cards grid gap-4 sm:grid-cols-2 lg:h-full lg:grid-cols-1 lg:grid-rows-2", className)}>
      {cards.map((c) => (
        <div
          key={c.label}
          // Focusable so keyboard users get the same reveal as a hover
          tabIndex={0}
          className={cn(
            "intro-card relative flex flex-col border bg-ink-900/40 p-5 outline-none focus-visible:ring-2",
            c.tone === "human"
              ? "border-human-accent/25 hover:border-human-accent/60 hover:shadow-[0_0_28px_-10px_var(--color-human-accent)] focus-visible:ring-human-accent"
              : "border-brand-400/25 hover:border-brand-400/60 hover:shadow-[0_0_28px_-10px_var(--color-brand-500)] focus-visible:ring-brand-400",
          )}
        >
          {/* Materials that fan out on hover */}
          <div aria-hidden className="intro-fan">
            {c.tone === "human" ? <HumanTiles /> : <AiTiles />}
          </div>

          <p
            aria-hidden
            className={cn(
              "text-xs font-semibold",
              c.tone === "human" ? "text-human-accent" : "text-brand-300",
            )}
          >
            {c.tag}
          </p>
          <h3 className="mt-1 font-semibold">{c.label}</h3>
          <p className="mt-2 text-sm leading-relaxed text-fg-muted">{c.text}</p>
          <ul className="mt-6 space-y-2.5 border-t border-line pt-5 text-sm text-fg-muted lg:mt-auto lg:grid lg:grid-cols-2 lg:gap-x-6 lg:gap-y-2.5 lg:space-y-0">
            {c.items.map((it, i) => (
              <li key={it} className="flex items-center gap-2.5">
                <span
                  aria-hidden
                  className={cn("intro-dot size-1.5 shrink-0", c.tone === "human" ? "bg-human-accent" : "bg-brand-400")}
                  style={{ "--i": i } as CSSProperties}
                />
                {it}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
