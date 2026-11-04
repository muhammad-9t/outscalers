"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, RotateCcw } from "lucide-react";
import { cn } from "@/lib/cn";
import {
  answerLabels,
  quickCheckLevels,
  quickCheckParam,
  quickCheckQuestions,
  type Answer,
} from "@/content/quick-check";

const total = quickCheckQuestions.length;
const options = Object.keys(answerLabels) as Answer[];
const pad = (n: number) => String(n).padStart(2, "0");
// How long an answered question takes to slide out before the next one comes in
const LEAVE_MS = 260;

// Dial geometry (viewBox 0 0 200 200): one arc segment per question, ticks around the outside
const CX = 100;
const SEG = 360 / total;
const GAP = 5;

const polar = (r: number, deg: number) => {
  const a = ((deg - 90) * Math.PI) / 180;
  return [CX + r * Math.cos(a), CX + r * Math.sin(a)];
};
const arc = (r: number, from: number, to: number) => {
  const [x1, y1] = polar(r, from);
  const [x2, y2] = polar(r, to);
  return `M${x1} ${y1} A${r} ${r} 0 ${to - from > 180 ? 1 : 0} 1 ${x2} ${y2}`;
};
const ticks = Array.from({ length: 64 }, (_, i) => i * (360 / 64));

const strokeFor = (a: Answer | null) =>
  a === "y"
    ? "stroke-brand-400 drop-shadow-[0_0_6px_var(--color-brand-400)]"
    : a === "d"
      ? "stroke-human-accent/55"
      : a === "n"
        ? "stroke-fg-subtle/45"
        : "stroke-ink-700";

const fillFor = (a: Answer | null) =>
  a === "y"
    ? "bg-brand-400 shadow-[0_0_8px_var(--color-brand-400)]"
    : a === "d"
      ? "bg-human-accent/55"
      : a === "n"
        ? "bg-fg-subtle/45"
        : "bg-ink-700";

/** The HUD dial: one segment per question, coloured by its answer, with the score in the middle. */
function Dial({ answers, size = "size-44" }: { answers: (Answer | null)[]; size?: string }) {
  const yes = answers.filter((a) => a === "y").length;
  return (
    <div className={cn("relative shrink-0", size)}>
      <svg viewBox="0 0 200 200" className="absolute inset-0 size-full" aria-hidden>
        {ticks.map((deg, i) => {
          const [x1, y1] = polar(96, deg);
          const [x2, y2] = polar(i % 8 === 0 ? 88 : 92, deg);
          return (
            <line
              key={deg}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              strokeWidth={i % 8 === 0 ? 1.6 : 1}
              className={i % 8 === 0 ? "stroke-brand-400/70" : "stroke-line-strong"}
            />
          );
        })}
        {/* Slowly turning scanner ring */}
        <g className="origin-center motion-safe:animate-[spin_28s_linear_infinite]">
          <circle cx={CX} cy={CX} r="82" fill="none" strokeWidth="1" strokeDasharray="2 7" className="stroke-brand-400/40" />
          <path d={arc(82, 0, 40)} fill="none" strokeWidth="2" strokeLinecap="round" className="stroke-brand-300" />
        </g>
        {answers.map((a, i) => (
          <path
            key={i}
            d={arc(68, i * SEG + GAP / 2, (i + 1) * SEG - GAP / 2)}
            fill="none"
            strokeWidth="12"
            className={cn("transition-[stroke] duration-500", strokeFor(a))}
          />
        ))}
        <circle cx={CX} cy={CX} r="54" fill="none" strokeWidth="1" className="stroke-line" />
        <circle cx={CX} cy={CX} r="50" className="fill-ink-950/60" />
      </svg>
      <div className="absolute inset-0 grid place-content-center text-center">
        <p className="font-display text-5xl font-semibold leading-none">
          {yes}
          <span className="text-2xl text-fg-subtle">/{total}</span>
        </p>
        <p className="mt-1.5 font-mono text-xs tracking-widest text-brand-300">{Math.round((yes / total) * 100)}%</p>
      </div>
    </div>
  );
}

/** One bar per question, numbered, coloured by its answer; the current question gets a pulsing outline. */
function Strip({ answers, current }: { answers: (Answer | null)[]; current?: number }) {
  return (
    <ol className="grid grid-cols-8 gap-1.5" aria-hidden>
      {answers.map((a, i) => (
        <li key={i} className="text-center">
          <span
            className={cn(
              "block h-1.5 rounded-full transition-colors duration-300",
              fillFor(a),
              i === current && "outline outline-1 outline-offset-2 outline-brand-400 motion-safe:animate-[pulse-soft_1.6s_ease-in-out_infinite]",
            )}
          />
          <span className={cn("mt-1.5 block font-mono text-[10px]", i === current ? "text-brand-300" : "text-fg-subtle")}>
            {pad(i + 1)}
          </span>
        </li>
      ))}
    </ol>
  );
}

type Stage = "intro" | "questions" | "result";

/**
 * A short self-check: a start screen, then one question at a time (each answered question slides
 * away and the next comes in), then a result dial with a link that carries the answers to the contact form.
 */
export function QuickCheck() {
  const [stage, setStage] = useState<Stage>("intro");
  const [answers, setAnswers] = useState<(Answer | null)[]>(() => Array(total).fill(null));
  const [index, setIndex] = useState(0);
  const [leaving, setLeaving] = useState(false);
  const heading = useRef<HTMLHeadingElement>(null);
  const moved = useRef(false); // skip moving focus on the first render

  const yes = answers.filter((a) => a === "y").length;
  const no = answers.filter((a) => a === "n").length;
  const unsure = answers.filter((a) => a === "d").length;
  const level = [...quickCheckLevels].reverse().find((l) => yes >= l.min)!;

  // Move focus to the new question or the result, so keyboard and screen reader users follow along
  useEffect(() => {
    if (!moved.current) {
      moved.current = true;
      return;
    }
    heading.current?.focus({ preventScroll: true });
  }, [stage, index]);

  const answer = (a: Answer) => {
    if (leaving) return;
    setAnswers((prev) => prev.map((v, j) => (j === index ? a : v)));
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setLeaving(true);
    window.setTimeout(
      () => {
        setLeaving(false);
        if (index + 1 < total) setIndex(index + 1);
        else setStage("result");
      },
      reduce ? 0 : LEAVE_MS,
    );
  };

  const restart = () => {
    setAnswers(Array(total).fill(null));
    setIndex(0);
    setStage("questions");
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

      <div className="card relative overflow-hidden p-6 sm:p-8 lg:min-h-[27rem]">
        <div aria-hidden className="bg-grid pointer-events-none absolute inset-0 opacity-30" />

        {stage === "intro" && (
          <div className="relative flex flex-col items-center gap-6 text-center motion-safe:animate-[qc-in_0.4s_var(--ease-out-soft)_both] sm:flex-row sm:text-left lg:h-full lg:min-h-[23rem]">
            <Dial answers={answers} />
            <div>
              <p className="flex items-center justify-center gap-2 font-mono text-sm uppercase tracking-[0.14em] text-brand-200 sm:justify-start">
                <span aria-hidden className="size-2 rounded-full bg-brand-400 motion-safe:animate-[pulse-soft_1.6s_ease-in-out_infinite]" />
                Standing by
              </p>
              <p className="mt-3 text-[0.9375rem] leading-relaxed text-fg-muted">
                {total} questions about updates, backups, access and documentation. One at a time, about two minutes.
              </p>
              <button type="button" onClick={() => setStage("questions")} className="btn btn-primary mt-6">
                Get started <ArrowRight aria-hidden className="size-4" />
              </button>
            </div>
          </div>
        )}

        {stage === "questions" && (
          <div className="relative flex flex-col lg:min-h-[23rem]">
            <div className="flex items-center justify-between gap-4 font-mono text-xs uppercase tracking-[0.16em] text-fg-subtle">
              <span>
                Question <span className="text-brand-300">{pad(index + 1)}</span> / {pad(total)}
              </span>
              <span>{Math.round((index / total) * 100)}% done</span>
            </div>
            <div className="mt-4">
              <Strip answers={answers} current={index} />
            </div>

            <fieldset
              key={index}
              className={cn(
                "mt-10 flex-1",
                leaving
                  ? "motion-safe:animate-[qc-out_0.26s_ease-in_both]"
                  : "motion-safe:animate-[qc-in_0.4s_var(--ease-out-soft)_both]",
              )}
            >
              <legend className="sr-only">
                Question {index + 1} of {total}
              </legend>
              <h3 ref={heading} tabIndex={-1} className="text-2xl font-semibold leading-snug outline-none sm:text-[1.75rem]">
                {quickCheckQuestions[index]}
              </h3>
              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                {options.map((a) => (
                  <button
                    key={a}
                    type="button"
                    onClick={() => answer(a)}
                    aria-pressed={answers[index] === a}
                    className={cn(
                      "min-h-14 rounded-xl border px-4 text-base font-semibold transition-colors",
                      answers[index] === a
                        ? "border-brand-400 bg-brand-400 text-on-brand"
                        : "border-line-strong bg-ink-900/60 text-fg hover:border-brand-400 hover:bg-ink-800",
                    )}
                  >
                    {answerLabels[a]}
                  </button>
                ))}
              </div>
            </fieldset>

            <div className="mt-8 flex items-center justify-between">
              <button
                type="button"
                onClick={() => (index === 0 ? setStage("intro") : setIndex(index - 1))}
                className="inline-flex items-center gap-2 text-sm font-medium text-fg-muted hover:text-fg"
              >
                <ArrowLeft aria-hidden className="size-4" /> Back
              </button>
              <span className="font-mono text-xs text-fg-subtle">
                {yes} yes · {no + unsure} no
              </span>
            </div>
          </div>
        )}

        {stage === "result" && (
          <div className="relative motion-safe:animate-[qc-in_0.5s_var(--ease-out-soft)_both]" aria-live="polite">
            <div className="flex flex-col items-center gap-6 sm:flex-row sm:gap-8">
              <Dial answers={answers} />
              <div className="w-full min-w-0">
                <p className="font-mono text-xs uppercase tracking-[0.18em] text-fg-subtle">Result</p>
                <h3
                  ref={heading}
                  tabIndex={-1}
                  className="mt-1.5 flex items-center gap-2 font-mono text-sm uppercase tracking-[0.14em] text-brand-200 outline-none"
                >
                  <span aria-hidden className="size-2 rounded-full bg-brand-400" />
                  {level.title}
                </h3>
                <p className="mt-3 text-sm text-fg-muted">
                  {yes} of {total} answered with yes
                </p>
                <div className="mt-4">
                  <Strip answers={answers} />
                </div>
              </div>
            </div>

            <dl className="mt-6 flex flex-wrap gap-x-5 gap-y-1 font-mono text-xs text-fg-subtle">
              {(
                [
                  ["Yes", yes, "bg-brand-400"],
                  ["No", no, "bg-fg-subtle/45"],
                  ["Don't know", unsure, "bg-human-accent/55"],
                ] as const
              ).map(([k, v, dot]) => (
                <div key={k} className="flex items-center gap-1.5">
                  <span aria-hidden className={cn("size-2 rounded-full", dot)} />
                  <dt>{k}</dt>
                  <dd className="text-fg">{v}</dd>
                </div>
              ))}
            </dl>

            <p className="mt-6 text-[0.9375rem] leading-relaxed text-fg-muted">{level.body}</p>
            <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center">
              <Link href={`/contact?${quickCheckParam}=${answers.join("")}#start-project`} className="btn btn-primary">
                Add the result to your request <ArrowRight aria-hidden className="size-4" />
              </Link>
              <button
                type="button"
                onClick={restart}
                className="inline-flex items-center justify-center gap-2 text-sm font-medium text-fg-muted hover:text-fg"
              >
                <RotateCcw aria-hidden className="size-4" /> Start again
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
