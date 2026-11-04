"use client";

import { useRef } from "react";
import { CalendarClock, X } from "lucide-react";
import { siteConfig } from "@/lib/site";
import { cn } from "@/lib/cn";

/** Button that opens a modal with the "Book a call" scheduling links. */
export function BookCallDialog({ label, className }: { label: string; className?: string }) {
  const ref = useRef<HTMLDialogElement>(null);
  const close = () => ref.current?.close();

  return (
    <>
      <button type="button" onClick={() => ref.current?.showModal()} className={cn("btn btn-primary", className)}>
        {label}
      </button>

      <dialog
        ref={ref}
        aria-labelledby="book-call-title"
        data-lenis-prevent
        // Clicks on the backdrop land on the dialog itself; clicks inside land on its children.
        onClick={(e) => e.target === e.currentTarget && close()}
        className="m-auto w-[calc(100%-2rem)] max-w-md rounded-[var(--radius-card)] border border-line-strong bg-ink-900 p-0 text-fg backdrop:bg-black/70 backdrop:backdrop-blur-sm"
      >
        <div className="p-6 sm:p-7">
          <div className="flex items-start justify-between gap-4">
            <h2 id="book-call-title" className="flex items-center gap-2 text-lg font-semibold">
              <CalendarClock aria-hidden className="size-5 text-brand-400" /> Book a call
            </h2>
            <button
              type="button"
              onClick={close}
              className="-m-1 grid size-9 place-items-center rounded-lg text-fg-muted hover:text-fg"
            >
              <span className="sr-only">Close</span>
              <X aria-hidden className="size-5" />
            </button>
          </div>
          <p className="mt-2 text-[0.9375rem] text-fg-muted">Pick a 30-minute slot that suits your time zone.</p>
          <ul className="mt-5 grid gap-2">
            {siteConfig.scheduling.map((s) => (
              <li key={s.href}>
                <a
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-secondary w-full justify-between"
                >
                  {s.label}
                  <span className="sr-only"> (opens in a new tab)</span>
                  <span aria-hidden>↗</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </dialog>
    </>
  );
}
