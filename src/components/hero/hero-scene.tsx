"use client";

import { useEffect, useRef, useState } from "react";
import {
  Check,
  ChevronDown,
  FileCode2,
  FileText,
  FlaskConical,
  GitBranch,
  Pause,
  Play,
  Sparkles,
  UserRound,
} from "lucide-react";
import { cn } from "@/lib/cn";

/* ------------------------------------------------------------------
   Script: a simulated, deterministic story — nothing here calls an AI.
   Human idea → AI-assisted implementation → Human review → Tested solution
   ------------------------------------------------------------------ */

type TokenKind = "kw" | "fn" | "str" | "num" | "type" | "p" | "h" | "arrow";
type Token = [TokenKind, string];
type Line = Token[];

const BRIEF: Line[] = [
  [["h", "# Brief: support triage"]],
  [],
  [["p", "Route incoming tickets by urgency."]],
  [["p", "Urgent "], ["arrow", "→"], ["p", " on-call queue."]],
  [["p", "Not sure? "], ["arrow", "→"], ["p", " a person decides."]],
];

const CODE: Line[] = [
  [["kw", "import"], ["p", " { "], ["fn", "classify"], ["p", ", "], ["fn", "routeTo"], ["p", " } "], ["kw", "from"], ["str", ' "./lib"'], ["p", ";"]],
  [],
  [["kw", "export async function "], ["fn", "triage"], ["p", "(ticket: "], ["type", "Ticket"], ["p", ") {"]],
  [["p", "  "], ["kw", "const"], ["p", " { urgency, score } ="]],
  [["p", "    "], ["kw", "await "], ["fn", "classify"], ["p", "(ticket);"]],
  [],
  [["p", "  "], ["kw", "if"], ["p", " (score < "], ["num", "0.8"], ["p", ") {"]],
  [["p", "    "], ["kw", "return "], ["fn", "routeTo"], ["p", "("], ["str", '"human-review"'], ["p", ", ticket);"]],
  [["p", "  }"]],
  [],
  [["p", "  "], ["kw", "const"], ["p", " queue = urgency === "], ["str", '"high"']],
  [["p", "    ? "], ["str", '"on-call"'], ["p", " : "], ["str", '"standard"'], ["p", ";"]],
  [["p", "  "], ["kw", "return "], ["fn", "routeTo"], ["p", "(queue, ticket);"]],
  [["p", "}"]],
];

const REVIEW_LINES = [6, 7, 8]; // zero-based: the confidence fallback
const PROMPT = "Implement triage() from BRIEF.md";
const AI_TEXT =
  "Drafting triage(): classify each ticket, send urgent ones to on-call, and route anything below the confidence threshold to a person.";
const AI_WORDS = AI_TEXT.split(" ");
const TEST_CMD = "$ npm test";
const TEST_LINES = [
  "✓ routes urgent tickets to on-call",
  "✓ sends low-confidence tickets to a person",
  "✓ handles tickets without a body",
];

const lineLength = (line: Line) => line.reduce((n, [, text]) => n + text.length, 0);
const totalChars = (lines: Line[]) => lines.reduce((n, l) => n + lineLength(l) + 1, 0);

// Timeline (ms), computed once.
const T = (() => {
  let t = 500;
  const briefStart = t;
  t += totalChars(BRIEF) * 24;
  const briefEnd = t;
  t += 450;
  const promptAt = t;
  t += 900;
  const streamStart = t;
  t += AI_WORDS.length * 55;
  const streamEnd = t;
  t += 450;
  const codeStart = t;
  t += totalChars(CODE) * 11;
  const codeEnd = t;
  t += 600;
  const reviewStart = t;
  t += 1800;
  const approvedAt = t;
  t += 700;
  const testStart = t;
  t += TEST_CMD.length * 45;
  const testCmdEnd = t;
  t += (TEST_LINES.length + 1) * 450;
  const testEnd = t;
  t += 500;
  const doneAt = t;
  const loop = doneAt + 5500;
  return { briefStart, briefEnd, promptAt, streamStart, streamEnd, codeStart, codeEnd, reviewStart, approvedAt, testStart, testCmdEnd, testEnd, doneAt, loop };
})();

const END = T.loop - 1;

export const STAGES = [
  { label: "Human idea", short: "Human idea", detail: "An engineer defines the problem" },
  { label: "AI-assisted implementation", short: "AI drafting", detail: "AI drafts code from the brief" },
  { label: "Human review", short: "Human review", detail: "An engineer reviews and approves" },
  { label: "Tested solution", short: "Tested solution", detail: "Automated tests confirm behaviour" },
] as const;

function stageAt(t: number) {
  if (t < T.promptAt) return 0;
  if (t < T.reviewStart) return 1;
  if (t < T.testStart) return 2;
  return 3;
}

/** Truncates lines of tokens to the first `count` characters (newlines count as one). */
function sliceLines(lines: Line[], count: number) {
  const out: Line[] = [];
  let remaining = count;
  for (const line of lines) {
    if (remaining <= 0) break;
    const visible: Line = [];
    for (const [kind, text] of line) {
      if (remaining <= 0) break;
      visible.push([kind, text.slice(0, remaining)]);
      remaining -= Math.min(text.length, remaining);
    }
    out.push(visible);
    remaining -= 1;
  }
  return out;
}

const tokenClass: Record<TokenKind, string> = {
  kw: "text-[#7cc4ff]",
  fn: "text-brand-300",
  str: "text-[#a5e3a0]",
  num: "text-[#f3a6c8]",
  type: "text-[#c4b5fd]",
  p: "text-[#c9d4e0]",
  h: "font-semibold text-fg",
  arrow: "text-brand-400",
};

function Caret({ tone = "brand" }: { tone?: "brand" | "human" }) {
  return (
    <span
      aria-hidden
      className={cn(
        "ml-px inline-block h-[1.1em] w-[2px] translate-y-[0.2em] animate-caret",
        tone === "human" ? "bg-human-accent" : "bg-brand-300",
      )}
    />
  );
}

function CodeLines({
  lines,
  totalLines,
  caret,
  caretTone,
  highlight,
  highlightTone,
}: {
  lines: Line[];
  totalLines: number;
  caret: boolean;
  caretTone?: "brand" | "human";
  highlight?: number[];
  highlightTone?: "review" | "approved";
}) {
  return (
    <ol className="font-mono text-[10.5px] leading-[17px] sm:text-[12px] sm:leading-[20px]">
      {Array.from({ length: totalLines }, (_, i) => {
        const line = lines[i];
        const isLast = i === lines.length - 1;
        const lit = highlight?.includes(i);
        return (
          <li
            key={i}
            className={cn(
              "flex border-l-2 border-transparent pr-3 transition-colors duration-500",
              lit && highlightTone === "review" && "border-human-accent bg-human-accent/[0.07]",
              lit && highlightTone === "approved" && "border-brand-400 bg-brand-400/[0.07]",
            )}
          >
            <span className="w-7 shrink-0 select-none pr-2 text-right text-fg-subtle/60 sm:w-9 sm:pr-3">{i + 1}</span>
            <span className="whitespace-pre">
              {line?.map(([kind, text], j) => (
                <span key={j} className={tokenClass[kind]}>
                  {text}
                </span>
              ))}
              {caret && isLast && <Caret tone={caretTone} />}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

export function HeroScene() {
  const [t, setT] = useState(0);
  const [paused, setPaused] = useState(false);
  const [inView, setInView] = useState(false);
  const [pageVisible, setPageVisible] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);
  const elapsed = useRef(0);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => {
      setReducedMotion(mq.matches);
      if (mq.matches) {
        elapsed.current = END;
        setT(END);
      }
    };
    apply();
    mq.addEventListener("change", apply);

    const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: 0.15 });
    if (rootRef.current) io.observe(rootRef.current);

    const onVisibility = () => setPageVisible(document.visibilityState === "visible");
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      mq.removeEventListener("change", apply);
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  const playing = inView && pageVisible && !paused && !reducedMotion;

  // Advance the timeline only while visible and playing; render at ~30fps.
  useEffect(() => {
    if (!playing) return;
    let raf = 0;
    let last = performance.now();
    let lastCommit = 0;
    const tick = (now: number) => {
      elapsed.current = (elapsed.current + Math.min(now - last, 100)) % T.loop;
      last = now;
      if (now - lastCommit > 33) {
        lastCommit = now;
        setT(elapsed.current);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing]);

  // Derive the whole scene from t.
  const stage = stageAt(t);
  const briefChars = Math.max(0, Math.floor((t - T.briefStart) / 24));
  const briefLines = sliceLines(BRIEF, briefChars);
  const showPrompt = t >= T.promptAt;
  const thinking = t >= T.promptAt + 250 && t < T.streamStart;
  const aiWordCount = t < T.streamStart ? 0 : Math.min(AI_WORDS.length, Math.floor((t - T.streamStart) / 55) + 1);
  const codeChars = Math.max(0, Math.floor((t - T.codeStart) / 11));
  const codeLines = sliceLines(CODE, codeChars);
  const activeTab = t < T.codeStart ? "brief" : "code";
  const inReview = t >= T.reviewStart && t < T.approvedAt;
  const approved = t >= T.approvedAt;
  const testCmdChars = Math.max(0, Math.floor((t - T.testStart) / 45));
  const testLinesShown = t < T.testCmdEnd ? 0 : Math.min(TEST_LINES.length + 1, Math.floor((t - T.testCmdEnd) / 450) + 1);
  const done = t >= T.doneAt;

  const status = done
    ? "Reviewed · tested · ready to deploy"
    : stage === 3
      ? "Running test suite…"
      : stage === 2
        ? "In human review"
        : stage === 1
          ? activeTab === "code" ? "AI drafting in triage.ts…" : "AI assistant working…"
          : "Engineer writing the brief";

  return (
    <div ref={rootRef} className="relative">
      {/* Stage tracker — readable text that tells the story even without motion */}
      <ol className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-4" aria-label="How a feature moves through our workflow">
        {STAGES.map((s, i) => {
          const state = done || i < stage ? "done" : i === stage ? "current" : "next";
          return (
            <li
              key={s.label}
              aria-current={state === "current" ? "step" : undefined}
              className={cn(
                "flex items-center gap-2.5 rounded-xl border px-3 py-2 transition-colors duration-500",
                state === "current" && "border-brand-500/50 bg-brand-500/[0.08]",
                state === "done" && "border-line-strong bg-ink-850",
                state === "next" && "border-line bg-ink-900/40",
              )}
            >
              <span
                aria-hidden
                className={cn(
                  "grid size-6 shrink-0 place-items-center rounded-full font-mono text-[10px] font-semibold",
                  state === "done" && "bg-brand-400 text-ink-950",
                  state === "current" && "bg-ink-950 text-brand-300 ring-1 ring-brand-400",
                  state === "next" && "bg-ink-800 text-fg-subtle",
                )}
              >
                {state === "done" ? <Check className="size-3.5" strokeWidth={3} /> : `0${i + 1}`}
              </span>
              <span className="min-w-0">
                <span className={cn("block truncate text-[12.5px] font-semibold sm:text-[13px]", state === "next" ? "text-fg-muted" : "text-fg")}>
                  <span className="sm:hidden">{s.short}</span>
                  <span className="hidden sm:inline">{s.label}</span>
                </span>
                <span className="hidden truncate text-[11px] text-fg-subtle md:block">{s.detail}</span>
              </span>
            </li>
          );
        })}
      </ol>

      {/* Editor window — decorative, described for assistive tech by the tracker above */}
      <div
        className="relative overflow-hidden rounded-2xl border border-line-strong bg-[#0a0f18] shadow-[0_40px_120px_-40px_rgba(255,112,14,0.28)]"
      >
        {/* Title bar */}
        <div className="flex h-9 items-center gap-3 border-b border-line bg-ink-950/80 px-3">
          <span aria-hidden className="flex gap-1.5">
            <span className="size-2.5 rounded-full bg-[#2a3647]" />
            <span className="size-2.5 rounded-full bg-[#2a3647]" />
            <span className="size-2.5 rounded-full bg-[#2a3647]" />
          </span>
          <span aria-hidden className="flex-1 truncate text-center font-mono text-[11px] text-fg-subtle">
            support-triage — simulated workflow
          </span>
          {!reducedMotion && (
            <button
              type="button"
              onClick={() => setPaused((p) => !p)}
              className="grid size-6 place-items-center rounded-md text-fg-subtle transition-colors hover:bg-ink-700 hover:text-fg"
            >
              <span className="sr-only">{paused ? "Play animation" : "Pause animation"}</span>
              {paused ? <Play aria-hidden className="size-3.5" /> : <Pause aria-hidden className="size-3.5" />}
            </button>
          )}
        </div>

        <div aria-hidden className="flex">
          {/* Explorer */}
          <div className="hidden w-44 shrink-0 border-r border-line bg-ink-950/50 py-3 lg:block">
            <p className="px-4 font-mono text-[10px] uppercase tracking-wider text-fg-subtle">Explorer</p>
            <div className="mt-2 px-2 font-mono text-[11.5px] leading-6 text-fg-muted">
              <p className="flex items-center gap-1 px-2">
                <ChevronDown className="size-3" /> support-triage
              </p>
              <p className="flex items-center gap-1 pl-5">
                <ChevronDown className="size-3" /> src
              </p>
              {[
                { name: "triage.ts", icon: FileCode2, active: activeTab === "code", badge: codeChars > 0 ? "M" : null },
                { name: "triage.test.ts", icon: FlaskConical, active: false, badge: null },
                { name: "lib.ts", icon: FileCode2, active: false, badge: null },
              ].map((f) => (
                <p
                  key={f.name}
                  className={cn("flex items-center gap-1.5 rounded pl-9 pr-2", f.active && "bg-ink-700/70 text-fg")}
                >
                  <f.icon className="size-3 text-data-accent" />
                  <span className="flex-1">{f.name}</span>
                  {f.badge && <span className="text-[10px] text-human-accent">{f.badge}</span>}
                </p>
              ))}
              <p className={cn("flex items-center gap-1.5 rounded pl-5 pr-2", activeTab === "brief" && "bg-ink-700/70 text-fg")}>
                <FileText className="size-3 text-brand-400" /> BRIEF.md
              </p>
            </div>
          </div>

          {/* Editor + terminal */}
          <div className="min-w-0 flex-1">
            {/* Tabs */}
            <div className="flex h-8 items-end gap-px overflow-hidden border-b border-line bg-ink-950/40 px-1 font-mono text-[11px]">
              {[
                { id: "brief", label: "BRIEF.md", icon: FileText },
                { id: "code", label: "triage.ts", icon: FileCode2 },
                { id: "test", label: "triage.test.ts", icon: FlaskConical },
              ].map((tab) => (
                <span
                  key={tab.id}
                  className={cn(
                    "flex h-7 items-center gap-1.5 rounded-t-md border-x border-t px-3 transition-colors duration-300",
                    activeTab === tab.id
                      ? "border-line bg-[#0a0f18] text-fg"
                      : "border-transparent text-fg-subtle",
                    tab.id === "test" && "hidden sm:flex",
                  )}
                >
                  <tab.icon className="size-3" />
                  {tab.label}
                </span>
              ))}
            </div>

            {/* Code area — fixed height avoids layout shift */}
            <div className="relative h-[318px] overflow-hidden py-3 sm:h-[346px]">
              {activeTab === "brief" ? (
                <div>
                  <span className="mb-1 ml-9 inline-flex items-center gap-1.5 rounded-md bg-human-accent/10 px-2 py-0.5 font-sans text-[10.5px] font-medium text-human-accent sm:ml-12">
                    <UserRound className="size-3" /> Engineer is typing
                  </span>
                  <CodeLines lines={briefLines} totalLines={BRIEF.length} caret caretTone="human" />
                </div>
              ) : (
                <CodeLines
                  lines={codeLines}
                  totalLines={CODE.length}
                  caret={t < T.codeEnd + 300}
                  highlight={t >= T.reviewStart ? REVIEW_LINES : undefined}
                  highlightTone={approved ? "approved" : "review"}
                />
              )}

              {/* Review comment */}
              {t >= T.reviewStart && (
                <div
                  className={cn(
                    "animate-fade-up absolute inset-x-2 bottom-2 flex items-center gap-2.5 rounded-xl border bg-ink-850/95 px-3 py-2 sm:inset-x-3",
                    approved ? "border-brand-500/40" : "border-human-accent/40",
                  )}
                >
                  <span
                    className={cn(
                      "grid size-6 shrink-0 place-items-center rounded-full",
                      approved ? "bg-brand-400/15 text-brand-300" : "bg-human-accent/15 text-human-accent",
                    )}
                  >
                    {approved ? <Check className="size-3.5" strokeWidth={3} /> : <UserRound className="size-3.5" />}
                  </span>
                  <p className="min-w-0 text-[11px] leading-snug text-fg-muted">
                    <span className="font-semibold text-fg">{approved ? "Approved by engineer · " : "Engineer review · "}</span>
                    {inReview
                      ? "Checking the fallback: low-confidence tickets must reach a person…"
                      : "Threshold matches what the support team agreed. Approved for testing."}
                  </p>
                </div>
              )}
            </div>

            {/* Mobile AI strip */}
            <div className="flex min-h-14 items-start gap-2 border-t border-line bg-ink-950/50 px-3 py-2.5 md:hidden">
              <Sparkles className="mt-0.5 size-3.5 shrink-0 text-brand-400" />
              <p className="line-clamp-2 text-[11px] leading-snug text-fg-muted">
                {aiWordCount > 0 ? AI_WORDS.slice(0, aiWordCount).join(" ") : showPrompt ? "Thinking…" : "AI assistant waiting for the brief"}
              </p>
            </div>

            {/* Terminal */}
            <div className="h-[118px] border-t border-line bg-ink-950/70 px-3 py-2 font-mono text-[10.5px] leading-[17px] sm:h-[132px] sm:text-[11.5px] sm:leading-[19px]">
              <p className="mb-1 text-[10px] uppercase tracking-wider text-fg-subtle">Terminal</p>
              {t >= T.testStart && (
                <p className="text-fg">
                  {TEST_CMD.slice(0, testCmdChars)}
                  {t < T.testCmdEnd && <Caret />}
                </p>
              )}
              {TEST_LINES.slice(0, testLinesShown).map((line) => (
                <p key={line} className="animate-fade-up text-brand-300">
                  {line}
                </p>
              ))}
              {testLinesShown > TEST_LINES.length && (
                <p className="animate-fade-up font-semibold text-fg">
                  Tests <span className="text-brand-400">3 passed</span> <span className="text-fg-subtle">(3)</span>
                </p>
              )}
            </div>
          </div>

          {/* AI assistant panel */}
          <div className="hidden w-[248px] shrink-0 flex-col border-l border-line bg-ink-950/40 md:flex xl:w-[288px]">
            <p className="flex h-8 items-center gap-1.5 border-b border-line px-3 font-mono text-[10px] uppercase tracking-wider text-fg-subtle">
              <Sparkles className="size-3 text-brand-400" /> AI assistant
            </p>
            <div className="flex-1 space-y-3 p-3 text-[12px] leading-relaxed">
              {showPrompt && (
                <div className="animate-fade-up ml-6 rounded-xl rounded-tr-sm border border-human-accent/25 bg-human-accent/[0.06] px-3 py-2">
                  <p className="mb-0.5 text-[10px] font-semibold uppercase tracking-wide text-human-accent">Engineer</p>
                  <p className="text-fg">{PROMPT}</p>
                </div>
              )}
              {thinking && (
                <p className="flex items-center gap-1.5 text-fg-subtle">
                  <span className="size-1.5 animate-pulse-soft rounded-full bg-brand-400" />
                  Reading BRIEF.md…
                </p>
              )}
              {aiWordCount > 0 && (
                <div className="rounded-xl rounded-tl-sm border border-brand-500/25 bg-brand-500/[0.06] px-3 py-2">
                  <p className="mb-0.5 text-[10px] font-semibold uppercase tracking-wide text-brand-300">AI draft</p>
                  <p className="text-fg-muted">
                    {AI_WORDS.slice(0, aiWordCount).join(" ")}
                    {aiWordCount < AI_WORDS.length && <Caret />}
                  </p>
                </div>
              )}
              {t >= T.codeEnd && (
                <p className="animate-fade-up flex items-start gap-1.5 rounded-lg border border-line px-2.5 py-2 text-[11px] text-fg-muted">
                  <UserRound className="mt-0.5 size-3 shrink-0 text-human-accent" />
                  Draft added to triage.ts. Waiting for engineer review before tests run.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Status bar */}
        <div
          aria-hidden
          className={cn(
            "flex h-7 items-center gap-3 border-t px-3 font-mono text-[10.5px] transition-colors duration-500",
            done ? "border-brand-500/40 bg-brand-500/15 text-brand-200" : "border-line bg-ink-950 text-fg-subtle",
          )}
        >
          <span className="flex items-center gap-1">
            <GitBranch className="size-3" /> feature/triage
          </span>
          <span className="ml-auto flex items-center gap-1.5 truncate">
            {done && <Check className="size-3" strokeWidth={3} />}
            {status}
          </span>
        </div>
      </div>

      <p className="mt-3 text-center text-xs text-fg-subtle">
        Illustrative animation. In real projects, every AI-assisted change is reviewed and tested by our engineers.
      </p>
    </div>
  );
}
