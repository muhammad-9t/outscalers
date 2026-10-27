"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import type { ShowcaseScreen } from "@/content/portfolio";
import { cn } from "@/lib/cn";
import { tokenize, type TokenKind } from "./code-tokens";

/* ------------------------------------------------------------------
   The light, phone/tablet stand-in for the 3D laptop: a flat CSS laptop
   whose screen plays the same story once when it scrolls into view —
   the engineer types, AI suggests the rest, an engineer reviews it.
   ------------------------------------------------------------------ */

const LINE_MS = 260;

const tokenClass: Record<TokenKind, string> = {
  kw: "text-code-kw",
  str: "text-code-str",
  num: "text-code-num",
  fn: "text-brand-300",
  type: "text-code-type",
  com: "text-fg-subtle",
  dec: "text-code-type",
  text: "text-code-text",
};

// 0 idle · 1 engineer typing · 2 AI suggesting · 3 engineer reviewing · 4 reviewed
const STATUS = [
  ["", ""],
  ["● Engineer writing the logic", "text-human-accent"],
  ["✦ AI drafting the rest", "text-brand-300"],
  ["● Engineer reviewing the AI draft", "text-human-accent"],
  ["✓ Reviewed by an engineer · ready for tests", "text-brand-300"],
] as const;

export function MiniLaptop({ screen }: { screen: ShowcaseScreen }) {
  const ref = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const timers: number[] = [];
    const play = () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return setPhase(4);
      const typed = screen.aiFrom * LINE_MS + 300;
      setPhase(1);
      timers.push(window.setTimeout(() => setPhase(2), typed));
      timers.push(window.setTimeout(() => setPhase(3), typed + 1300));
      timers.push(window.setTimeout(() => setPhase(4), typed + 2000));
    };
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        play();
      },
      { threshold: 0.5 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      timers.forEach(clearTimeout);
    };
  }, [screen.aiFrom]);

  return (
    <div ref={ref} aria-hidden className="mx-auto w-full max-w-xl">
      <div className="rounded-xl bg-device-metal p-[1.5%] shadow-xl">
        <div className="rounded-lg bg-device-bezel p-[2.5%]">
          <div className="overflow-hidden rounded bg-code-bg font-mono text-[9px] leading-[15px] sm:text-[11px] sm:leading-[18px]">
            <p className="flex items-center gap-1 border-b border-line px-2 py-1 text-fg-subtle">
              <span className="size-1.5 rounded-full bg-line-strong" />
              <span className="size-1.5 rounded-full bg-line-strong" />
              <span className="size-1.5 rounded-full bg-line-strong" />
              <span className="flex-1 text-center">{screen.file}</span>
            </p>
            <ol className="min-h-[11.5rem] py-2 sm:min-h-[13.5rem]">
              {screen.code.map((line, i) => {
                const ai = i >= screen.aiFrom;
                const shown = ai ? phase >= 2 : phase >= 1;
                const ghost = ai && phase < 3;
                return (
                  <li
                    key={i}
                    className={cn(
                      "flex border-l-2 pr-2 transition-[clip-path,opacity,border-color] ease-linear",
                      ai && phase >= 3 ? "border-brand-400" : "border-transparent",
                      shown ? "[clip-path:inset(0_0_0_0)]" : "[clip-path:inset(0_100%_0_0)]",
                      ghost ? "opacity-50" : "opacity-100",
                    )}
                    style={{ transitionDuration: `${LINE_MS}ms`, transitionDelay: ai ? "0ms" : `${i * LINE_MS}ms` } as CSSProperties}
                  >
                    <span className="w-6 shrink-0 select-none pr-2 text-right text-fg-subtle/60">{i + 1}</span>
                    <span className="whitespace-pre">
                      {tokenize(line).map(([kind, text], j) => (
                        <span key={j} className={ghost ? "text-brand-300" : tokenClass[kind]}>
                          {text}
                        </span>
                      ))}
                    </span>
                  </li>
                );
              })}
            </ol>
            <p className={cn("h-6 truncate border-t border-line px-2 py-1 font-sans font-semibold", STATUS[phase][1])}>
              {STATUS[phase][0]}
            </p>
          </div>
        </div>
      </div>
      <div className="mx-[-4%] h-2 rounded-b-lg bg-device-metal sm:h-3">
        <div className="mx-auto h-1 w-[16%] rounded-b bg-device-trackpad" />
      </div>
    </div>
  );
}
