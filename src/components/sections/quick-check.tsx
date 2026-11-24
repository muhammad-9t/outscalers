"use client";

import { type CSSProperties, type KeyboardEvent, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Check, Gauge, HelpCircle, RotateCcw, X } from "lucide-react";
import { cn } from "@/lib/cn";
import {
  answerLabels,
  quickCheckLevels,
  quickCheckParam,
  quickCheckQuestions,
  type Answer,
} from "@/content/quick-check";

const total = quickCheckQuestions.length;
const options: Answer[] = ["y", "n", "d"];
const optionIcon = { y: Check, n: X, d: HelpCircle } as const;
// How long a flung card takes to leave before the next one rises
const FLING_MS = 460;

// Result ring (viewBox 0 0 200 200): one rounded segment per question
const SEG = 360 / total;
const GAP = 9;
const polar = (r: number, deg: number) => {
  const a = ((deg - 90) * Math.PI) / 180;
  return [100 + r * Math.cos(a), 100 + r * Math.sin(a)];
};
const arc = (r: number, from: number, to: number) => {
  const [x1, y1] = polar(r, from);
  const [x2, y2] = polar(r, to);
  return `M${x1} ${y1} A${r} ${r} 0 ${to - from > 180 ? 1 : 0} 1 ${x2} ${y2}`;
};

type Stage = "intro" | "questions" | "result";

/** The empty cards waiting underneath the top one: up to three, each a little lower and smaller. */
function Deck({ count }: { count: number }) {
  return (
    <>
      {Array.from({ length: Math.min(3, count) }, (_, i) => (
        <span key={i} aria-hidden className="qk-back" style={{ "--n": i + 1 } as CSSProperties} />
      ))}
    </>
  );
}

/** Eight tiles, one per question: orange with a tick for yes, grey cross for no, blue for unsure. */
function Tiles({ answers, current }: { answers: (Answer | null)[]; current?: number }) {
  return (
    <ol className="qk-tiles" aria-hidden>
      {answers.map((a, i) => {
        const Icon = a ? optionIcon[a] : null;
        return (
          <li key={i} className="qk-tile" data-a={a ?? undefined} data-current={i === current || undefined}>
            {Icon ? <Icon className="size-3.5" strokeWidth={3} /> : <span>{i + 1}</span>}
          </li>
        );
      })}
    </ol>
  );
}

/** Counts up to `to` once mounted (instantly with reduced motion). */
function useCountUp(to: number, run: boolean) {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!run) return;
    // With reduced motion the first frame already lands on the final number
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    const start = performance.now() + (reduce ? 0 : 350);
    const step = (now: number) => {
      const t = reduce ? 1 : Math.min(1, Math.max(0, (now - start) / 1100));
      setN(Math.round(to * (1 - Math.pow(1 - t, 3))));
      if (t < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [to, run]);
  return n;
}

/**
 * A short self-check as a deck of cards. The start card sits on a stack; each question is the top
 * card, and answering flings it away (yes to the right with an orange glow, no to the left,
 * "don't know" drops it) while the next card rises. Eight tiles track the answers. At the end the
 * last card flips to the result: a ring that fills segment by segment while the score counts up,
 * and a link that carries the answers to the contact form. Keys: Y / N / D, Backspace goes back.
 * Styles: .qk-* in globals.css.
 */
export function QuickCheck() {
  const [stage, setStage] = useState<Stage>("intro");
  const [answers, setAnswers] = useState<(Answer | null)[]>(() => Array(total).fill(null));
  const [index, setIndex] = useState(0);
  const [fling, setFling] = useState<Answer | null>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const moved = useRef(false); // skip moving focus on the first render

  const yes = answers.filter((a) => a === "y").length;
  const no = answers.filter((a) => a === "n").length;
  const unsure = answers.filter((a) => a === "d").length;
  const level = [...quickCheckLevels].reverse().find((l) => yes >= l.min)!;
  const shown = useCountUp(yes, stage === "result");

  // Move focus to the new question or the result, so keyboard and screen reader users follow along
  useEffect(() => {
    if (!moved.current) {
      moved.current = true;
      return;
    }
    heading.current?.focus({ preventScroll: true });
  }, [stage, index]);

  const answer = (a: Answer) => {
    if (fling) return;
    setAnswers((prev) => prev.map((v, j) => (j === index ? a : v)));
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setFling(a);
    window.setTimeout(
      () => {
        setFling(null);
        if (index + 1 < total) setIndex(index + 1);
        else setStage("result");
      },
      reduce ? 0 : FLING_MS,
    );
  };
  const back = () => (index === 0 ? setStage("intro") : setIndex(index - 1));
  const restart = () => {
    setAnswers(Array(total).fill(null));
    setIndex(0);
    setStage("questions");
  };

  // Keyboard shortcuts while a question is showing
  const onKeyDown = (e: KeyboardEvent) => {
    if (stage !== "questions" || e.metaKey || e.ctrlKey || e.altKey) return;
    const k = e.key.toLowerCase();
    if (k === "y" || k === "n" || k === "d") {
      e.preventDefault();
      answer(k);
    } else if (e.key === "Backspace") {
      e.preventDefault();
      back();
    }
  };

  return (
    <div className="container-site grid gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:items-center lg:gap-16">
      <div>
        <p className="eyebrow mb-4">Quick check</p>
        <h2 id="quick-check-title" className="text-display-lg font-semibold">
          How well do you know your software?
        </h2>
        <p className="mt-5 text-lead text-fg-muted">
          Eight questions, two minutes. Your answers stay in your browser until you choose to add them to your
          request.
        </p>
        <p className="mt-3 text-sm text-fg-subtle">&ldquo;Don&apos;t know&rdquo; counts as no. In an emergency it comes to the same thing.</p>
      </div>

      <div className="qk" onKeyDown={onKeyDown}>
        <div className="qk-stage" data-stage={stage}>
          {stage === "intro" && (
            <>
              <Deck count={3} />
              <div className="qk-card qk-intro" data-enter="rise">
                <span className="hs-gloss qk-intro-tile" data-tone="brand" aria-hidden>
                  <Gauge className="size-[46%]" strokeWidth={1.8} />
                </span>
                <p className="eyebrow mt-6">Ready when you are</p>
                <p className="mt-3 max-w-sm text-[0.9375rem] leading-relaxed text-fg-muted">
                  {total} questions about updates, backups, access and documentation. One card at a time.
                </p>
                <button type="button" onClick={() => setStage("questions")} className="btn btn-primary mt-7">
                  Get started <ArrowRight aria-hidden className="size-4" />
                </button>
              </div>
            </>
          )}

          {stage === "questions" && (
            <>
              <Deck count={total - index - 1} />
              <fieldset key={index} className="qk-card qk-q" data-enter="rise" data-fling={fling ?? undefined}>
                <legend className="sr-only">
                  Question {index + 1} of {total}
                </legend>
                <div className="flex items-center justify-between gap-3 text-sm text-fg-subtle">
                  <span className="qk-num">
                    {index + 1}
                    <span>/{total}</span>
                  </span>
                  <button type="button" onClick={back} className="qk-back-btn">
                    <ArrowLeft aria-hidden className="size-4" /> Back
                  </button>
                </div>
                <h3 ref={heading} tabIndex={-1} className="qk-question outline-none">
                  {quickCheckQuestions[index]}
                </h3>
                <div className="qk-answers">
                  {options.map((a) => {
                    const Icon = optionIcon[a];
                    return (
                      <button
                        key={a}
                        type="button"
                        onClick={() => answer(a)}
                        aria-pressed={answers[index] === a}
                        aria-keyshortcuts={a.toUpperCase()}
                        className="qk-answer"
                        data-a={a}
                      >
                        <Icon aria-hidden className="size-4" strokeWidth={2.6} />
                        {answerLabels[a]}
                      </button>
                    );
                  })}
                </div>
              </fieldset>
            </>
          )}

          {stage === "result" && (
            <div className="qk-card qk-result" data-enter="flip" aria-live="polite">
              <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center sm:gap-8">
                <div className="qk-ring">
                  <svg viewBox="0 0 200 200" aria-hidden>
                    {answers.map((a, i) => (
                      <path key={`t${i}`} d={arc(78, i * SEG + GAP / 2, (i + 1) * SEG - GAP / 2)} className="qk-ring-track" />
                    ))}
                    {answers.map((a, i) => (
                      <path
                        key={i}
                        d={arc(78, i * SEG + GAP / 2, (i + 1) * SEG - GAP / 2)}
                        pathLength={1}
                        className="qk-ring-seg"
                        data-a={a ?? undefined}
                        style={{ "--i": i } as CSSProperties}
                      />
                    ))}
                  </svg>
                  <p className="qk-score">
                    {shown}
                    <span>/{total}</span>
                  </p>
                </div>
                <div className="min-w-0 text-center sm:text-left">
                  <p className="text-sm text-fg-subtle">Your result</p>
                  <h3 ref={heading} tabIndex={-1} className="mt-1 text-2xl font-semibold outline-none">
                    {level.title}
                  </h3>
                  <dl className="mt-4 flex flex-wrap justify-center gap-2 sm:justify-start">
                    {(
                      [
                        ["Yes", yes, "y"],
                        ["No", no, "n"],
                        ["Don't know", unsure, "d"],
                      ] as const
                    ).map(([k, v, a]) => (
                      <div key={k} className="qk-legend" data-a={a}>
                        <dt>{k}</dt>
                        <dd>{v}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              </div>
              <p className="mt-6 text-[0.9375rem] leading-relaxed text-fg-muted">{level.body}</p>
              <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center">
                <Link href={`/contact?${quickCheckParam}=${answers.join("")}#start-project`} className="btn btn-primary">
                  Add the result to your request <ArrowRight aria-hidden className="size-4" />
                </Link>
                <button type="button" onClick={restart} className="qk-back-btn justify-center">
                  <RotateCcw aria-hidden className="size-4" /> Start again
                </button>
              </div>
            </div>
          )}
        </div>

        <div className={cn("qk-progress", stage === "intro" && "opacity-60")}>
          <Tiles answers={answers} current={stage === "questions" ? index : undefined} />
          <span className="text-sm text-fg-subtle">
            {stage === "result" ? `${yes} of ${total} yes` : stage === "questions" ? "Y · N · D to answer" : `${total} questions`}
          </span>
        </div>
      </div>
    </div>
  );
}
