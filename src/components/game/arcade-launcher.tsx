"use client";

import { useEffect, useRef, useState } from "react";
import { Gamepad2, X } from "lucide-react";
import { cn } from "@/lib/cn";
import { GAMES, readBest } from "./games";

const HINT_KEY = "arcade-tap-hint";
const HINT_DELAY_MS = 6000;
const HINT_SHOW_MS = 4500;

/** The pet's face, small, for the button. */
function BotFace() {
  return (
    <svg aria-hidden viewBox="0 0 72 60" className="w-7">
      <line x1={36} y1={14} x2={36} y2={5} className="stroke-line-strong" strokeWidth={2} />
      <circle cx={36} cy={5} r={3} className="fill-brand-400" />
      <rect x={8} y={14} width={56} height={42} rx={20} className="fill-ink-850 stroke-line-strong" strokeWidth={2} />
      <rect x={15} y={22} width={42} height={26} rx={12} className="fill-ink-950 stroke-brand-400/60" strokeWidth={1.5} />
      <g className="fill-none stroke-brand-300" strokeWidth={3} strokeLinecap="round">
        <path d="M24 37q4-6 8 0" />
        <path d="M40 37q4-6 8 0" />
      </g>
    </svg>
  );
}

/**
 * Touch screens have no pet following the cursor, so the arcade gets its own button in the corner.
 * Tapping it opens the games as a sheet from the bottom. Once per visit a small hint points it out.
 */
export function ArcadeLauncher({ onPlay }: { onPlay: () => void }) {
  const [open, setOpen] = useState(false);
  const [hint, setHint] = useState(false);
  const [best, setBest] = useState(0);
  const panel = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);

  // One hint per visit, a little after arriving
  useEffect(() => {
    let seen = false;
    try {
      seen = !!sessionStorage.getItem(HINT_KEY);
    } catch {}
    if (seen) return;
    let hide = 0;
    const show = window.setTimeout(() => {
      setHint(true);
      try {
        sessionStorage.setItem(HINT_KEY, "1");
      } catch {}
      hide = window.setTimeout(() => setHint(false), HINT_SHOW_MS);
    }, HINT_DELAY_MS);
    return () => {
      window.clearTimeout(show);
      window.clearTimeout(hide);
    };
  }, []);

  // Esc closes; focus moves into the sheet and back to the button afterwards
  useEffect(() => {
    if (!open) return;
    panel.current?.focus();
    const btn = button.current;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      btn?.focus();
    };
  }, [open]);

  return (
    <>
      <button
        ref={button}
        type="button"
        aria-label="Open the arcade"
        aria-expanded={open}
        onClick={() => {
          setHint(false);
          setBest(readBest());
          setOpen(true);
        }}
        className="fixed bottom-[max(1.25rem,env(safe-area-inset-bottom))] left-4 z-40 grid size-12 place-items-center border border-line-strong bg-ink-950/90 shadow-[0_0_24px_-10px_var(--color-brand-500)] backdrop-blur-sm transition-colors active:border-brand-400/60"
      >
        <BotFace />
      </button>
      <p
        aria-hidden
        className={cn(
          "pointer-events-none fixed bottom-[max(1.25rem,env(safe-area-inset-bottom))] left-[4.25rem] z-40 mb-2.5 border border-brand-400/40 bg-ink-950/90 px-2.5 py-1.5 text-xs text-fg shadow-[0_0_24px_-8px_var(--color-brand-500)] transition-all duration-300",
          hint ? "translate-x-0 opacity-100" : "-translate-x-2 opacity-0",
        )}
      >
        <span className="mr-1.5 font-mono text-[10px] text-brand-300">{">"}</span>
        Bored? Tap me for games.
      </p>

      {open && (
        <div className="fixed inset-0 z-90">
          <button
            type="button"
            aria-label="Close the arcade"
            tabIndex={-1}
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-ink-950/70 animate-[fade-in_0.2s_ease-out]"
          />
          <div
            ref={panel}
            role="dialog"
            aria-modal="true"
            aria-label="Arcade"
            tabIndex={-1}
            className="absolute inset-x-0 bottom-0 border-t border-brand-400/50 bg-ink-950 px-4 pt-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-[0_-10px_40px_-12px_var(--color-brand-500)] outline-none animate-[arcade-sheet_0.28s_cubic-bezier(0.2,0.9,0.3,1)]"
          >
            <div className="mx-auto max-w-lg">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="flex items-center gap-1.5 font-mono text-[10px] tracking-[0.16em] text-brand-300 uppercase">
                    <Gamepad2 aria-hidden className="size-3.5" />
                    Arcade
                  </p>
                  <p className="mt-1 text-sm text-fg">Pick a game. More are on the way.</p>
                </div>
                <button
                  type="button"
                  aria-label="Close the arcade"
                  onClick={() => setOpen(false)}
                  className="grid size-9 shrink-0 place-items-center text-fg-subtle transition-colors hover:text-fg"
                >
                  <X aria-hidden className="size-4" />
                </button>
              </div>
              <ul className="mt-4 grid gap-2">
                {GAMES.map((g) => (
                  <li
                    key={g.id}
                    className={cn(
                      "flex items-center gap-3 border p-3",
                      g.ready ? "border-line-strong bg-ink-850/60" : "border-line opacity-60",
                    )}
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-fg">
                        {g.name}
                        {g.id === "bug-hunt" && best > 0 && (
                          <span className="ml-2 font-mono text-xs font-normal text-fg-subtle">best {best}</span>
                        )}
                      </p>
                      <p className="text-xs leading-snug text-fg-muted">{g.blurb}</p>
                    </div>
                    {g.ready ? (
                      <button
                        type="button"
                        onClick={() => {
                          setOpen(false);
                          onPlay();
                        }}
                        className="btn btn-primary btn-sm shrink-0"
                      >
                        Play
                      </button>
                    ) : (
                      <span className="shrink-0 font-mono text-[10px] tracking-[0.14em] text-fg-subtle uppercase">Soon</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
