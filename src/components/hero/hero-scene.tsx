"use client";

import { useEffect, useRef, useState } from "react";
import { Check, FileCode2, FlaskConical, Lightbulb, Pause, Play, Sparkles, UserCheck, UserRound } from "lucide-react";
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
  kw: "text-code-kw",
  fn: "text-brand-300",
  str: "text-code-str",
  num: "text-code-num",
  type: "text-code-type",
  p: "text-code-text",
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
  const showPrompt = t >= T.promptAt;
  const thinking = t >= T.promptAt + 250 && t < T.streamStart;
  const aiWordCount = t < T.streamStart ? 0 : Math.min(AI_WORDS.length, Math.floor((t - T.streamStart) / 55) + 1);
  const codeChars = Math.max(0, Math.floor((t - T.codeStart) / 11));
  const codeLines = sliceLines(CODE, codeChars);
  const activeTab = t < T.codeStart ? "brief" : "code";
  const inReview = t >= T.reviewStart && t < T.approvedAt;
  const approved = t >= T.approvedAt;
  const testLinesShown = t < T.testCmdEnd ? 0 : Math.min(TEST_LINES.length + 1, Math.floor((t - T.testCmdEnd) / 450) + 1);
  const done = t >= T.doneAt;

  const status = done
    ? "Reviewed, tested, ready to ship"
    : stage === 3
      ? "Running tests…"
      : stage === 2
        ? approved ? "Approved by an engineer" : "In human review"
        : stage === 1
          ? activeTab === "code" ? "AI drafting triage.ts…" : "AI reading the brief…"
          : "Engineer writing the brief";

  // The brief as plain text, typed into the engineer's message (skipping the heading line)
  const briefText = BRIEF.slice(2).map((l) => l.map(([, x]) => x).join("")).join(" ");
  const headChars = lineLength(BRIEF[0]) + 2;
  const briefShown = briefText.slice(0, Math.max(0, briefChars - headChars));
  const stepIcons = [Lightbulb, Sparkles, UserCheck, FlaskConical];
  const stepTones = ["human", "brand", "human", "data"] as const;

  return (
    <div ref={rootRef} className="hsx relative flex flex-col">
      {/* Steps: first in the DOM for screen readers, shown under the window */}
      <ol className="hsx-steps order-last" aria-label="How a feature moves through our workflow">
        {STAGES.map((st, i) => {
          const state = done || i < stage ? "done" : i === stage ? "current" : "next";
          const Icon = stepIcons[i];
          return (
            <li key={st.label} className="hsx-step" data-state={state} aria-current={state === "current" ? "step" : undefined}>
              <span className="hsx-step-icon hs-gloss" data-tone={stepTones[i]} aria-hidden>
                {state === "done" ? <Check className="size-[50%]" strokeWidth={3} /> : <Icon className="size-[50%]" strokeWidth={1.8} />}
              </span>
              <span className="min-w-0">
                <span className="block truncate text-sm font-semibold">
                  <span className="sm:hidden">{st.short}</span>
                  <span className="hidden sm:inline">{st.label}</span>
                </span>
                <span className="hidden truncate text-xs text-fg-subtle md:block">{st.detail}</span>
              </span>
            </li>
          );
        })}
      </ol>

      {/* The window. Decorative: the steps above describe it for assistive tech; only the pause button is interactive */}
      <div className="hsx-window">
        <div className="hsx-bar">
          <span aria-hidden className="flex gap-1.5">
            <span className="hsx-dot" />
            <span className="hsx-dot" />
            <span className="hsx-dot" />
          </span>
          <span aria-hidden className="hsx-status" data-done={done || undefined}>
            {status}
          </span>
          <button type="button" onClick={() => setPaused((p) => !p)} className="hsx-pause">
            <span className="sr-only">{paused ? "Play animation" : "Pause animation"}</span>
            {paused ? <Play aria-hidden className="size-3.5" /> : <Pause aria-hidden className="size-3.5" />}
          </button>
        </div>

        <div aria-hidden className="hsx-body">
          {/* Code card */}
          <div className="hsx-code">
            <div className="hsx-code-head">
              <span className="hsx-file">
                <FileCode2 className="size-3.5" /> triage.ts
              </span>
              {stage >= 1 && activeTab === "code" && !approved && (
                <span className="hsx-badge" data-tone={inReview ? "human" : "brand"}>
                  {inReview ? <UserCheck className="size-3" /> : <Sparkles className="size-3" />}
                  {inReview ? "Engineer reviewing" : "AI draft"}
                </span>
              )}
              {approved && (
                <span className="hsx-badge sm:hidden" data-tone="success">
                  <Check className="size-3" strokeWidth={3} /> Approved
                </span>
              )}
            </div>
            {activeTab === "brief" ? (
              <div className="hsx-skeleton">
                {[72, 46, 88, 60, 80, 40, 66].map((w, i) => (
                  <span key={i} style={{ width: `${w}%` }} />
                ))}
                <p>The AI starts drafting once the brief is in.</p>
              </div>
            ) : (
              <CodeLines
                lines={codeLines}
                totalLines={CODE.length}
                caret={t < T.codeEnd}
                highlight={inReview || approved ? REVIEW_LINES : undefined}
                highlightTone={approved ? "approved" : "review"}
              />
            )}
            {approved && (
              <span className="hsx-stamp">
                <Check className="size-4" strokeWidth={3} /> Approved
              </span>
            )}

            {/* Checks, in place of a terminal */}
            <ul className="hsx-checks">
              {TEST_LINES.map((line, i) => {
                const ok = testLinesShown > i + 1 || done;
                const running = stage === 3 && !ok;
                return (
                  <li key={line} data-state={ok ? "ok" : running ? "run" : "wait"}>
                    <span className="hsx-check-icon">{ok ? <Check className="size-3" strokeWidth={3.5} /> : null}</span>
                    {line.replace("✓ ", "")}
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Chat */}
          <div className="hsx-chat">
            {briefChars > 0 && (
              <div className="hsx-msg" data-who="human">
                <span className="hsx-who">
                  <span className="hsx-avatar" data-tone="human">
                    <UserRound className="size-3.5" />
                  </span>
                  Engineer
                </span>
                <p>
                  {briefShown || "Brief: support triage"}
                  {!showPrompt && <Caret tone="human" />}
                </p>
                {showPrompt && <span className="hsx-chip">{PROMPT}</span>}
              </div>
            )}
            {(thinking || aiWordCount > 0) && (
              <div className="hsx-msg" data-who="ai">
                <span className="hsx-who">
                  <span className="hsx-avatar" data-tone="brand">
                    <Sparkles className="size-3.5" />
                  </span>
                  AI assistant
                </span>
                {thinking ? (
                  <span className="hsx-typing">
                    <span />
                    <span />
                    <span />
                  </span>
                ) : (
                  <p>{AI_WORDS.slice(0, aiWordCount).join(" ")}</p>
                )}
              </div>
            )}
            {t >= T.reviewStart && (
              <div className="hsx-msg" data-who="human">
                <span className="hsx-who">
                  <span className="hsx-avatar" data-tone="human">
                    <UserCheck className="size-3.5" />
                  </span>
                  Reviewer
                </span>
                <p>{approved ? "The fallback for unsure tickets is right. Approved." : "Checking the fallback for unsure tickets…"}</p>
              </div>
            )}
            {t >= T.testStart && (
              <div className="hsx-msg" data-who="tests">
                <span className="hsx-who">
                  <span className="hsx-avatar" data-tone="data">
                    <FlaskConical className="size-3.5" />
                  </span>
                  Tests
                </span>
                <p>{done ? `${TEST_LINES.length} passed. Ready to ship.` : "Running the test suite…"}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
