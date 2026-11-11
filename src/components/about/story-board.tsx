"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import Link from "next/link";
import { ArrowUpRight, ChevronLeft, ChevronRight, Play, X } from "lucide-react";
import { story, type StorySlide } from "@/content/story";
import { siteConfig } from "@/lib/site";
import { LogoMark } from "@/components/layout/logo";
import { SocialIcon } from "@/components/ui/brand-icons";
import { cn } from "@/lib/cn";

/*
 * The story widget: a badge that hangs with the team, and opens a full-screen, Instagram-style story board.
 * Opening is dramatic: the board grows out of the card (a clip-path from the card's rectangle to the
 * full screen), then the story frame rises in. Slides advance on their own (progress bars at the top),
 * tap or arrow keys to move, press and hold to pause, Esc to close (it shrinks back into the card).
 * Styles: .sb-* in globals.css.
 */

const SLIDE_MS = 6500;

const TONE: Record<StorySlide["tone"], string> = {
  brand: "var(--color-brand-400)",
  human: "var(--color-human-accent)",
  data: "var(--color-data-accent)",
  amber: "var(--color-signal)",
};

export function StoryWidget() {
  const cardRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const closing = useRef(false);

  const reduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // The card's rectangle as a clip-path inset, so the board can grow out of it and shrink back
  const cardClip = () => {
    const r = cardRef.current?.getBoundingClientRect();
    if (!r) return "inset(50% 50% 50% 50% round 18px)";
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    return `inset(${r.top}px ${vw - r.right}px ${vh - r.bottom}px ${r.left}px round 18px)`;
  };

  const openBoard = () => {
    const d = dialogRef.current;
    if (!d) return;
    setIndex(0);
    setPaused(false);
    setOpen(true);
    d.showModal();
    if (reduced()) return;
    d.animate([{ clipPath: cardClip() }, { clipPath: "inset(0px 0px 0px 0px round 0px)" }], {
      duration: 800,
      easing: "cubic-bezier(0.7, 0, 0.2, 1)",
    });
  };

  // The story frame rises in once the board has mostly opened (it only mounts after `open`)
  useEffect(() => {
    if (!open || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    frameRef.current?.animate(
      [
        { transform: "translateY(60px) scale(0.86) rotateX(18deg)", opacity: 0 },
        { transform: "none", opacity: 1 },
      ],
      { duration: 900, delay: 380, easing: "cubic-bezier(0.2, 0.9, 0.2, 1)", fill: "backwards" },
    );
  }, [open]);

  const closeBoard = useCallback(() => {
    const d = dialogRef.current;
    if (!d || closing.current) return;
    const done = () => {
      closing.current = false;
      d.close();
      setOpen(false);
      cardRef.current?.focus();
    };
    if (reduced()) return done();
    closing.current = true;
    const a = d.animate([{ clipPath: "inset(0px 0px 0px 0px round 0px)" }, { clipPath: cardClip() }], {
      duration: 620,
      easing: "cubic-bezier(0.7, 0, 0.3, 1)",
      fill: "forwards",
    });
    a.onfinish = () => {
      done();
      a.cancel();
    };
  }, []);

  const next = useCallback(() => setIndex((i) => Math.min(story.length - 1, i + 1)), []);
  const prev = useCallback(() => setIndex((i) => Math.max(0, i - 1)), []);

  // Esc goes through our animated close instead of the dialog's instant one; arrows move between slides
  useEffect(() => {
    const d = dialogRef.current;
    if (!d) return;
    const onCancel = (e: Event) => {
      e.preventDefault();
      closeBoard();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    };
    d.addEventListener("cancel", onCancel);
    d.addEventListener("keydown", onKey);
    return () => {
      d.removeEventListener("cancel", onCancel);
      d.removeEventListener("keydown", onKey);
    };
  }, [closeBoard, next, prev]);

  // Pause while the tab is hidden
  useEffect(() => {
    if (!open) return;
    const onVis = () => setPaused(document.hidden);
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, [open]);

  const slide = story[index];
  const last = index === story.length - 1;

  return (
    <>
      {/* The widget card, hanging with the team badges */}
      <button
        ref={cardRef}
        type="button"
        onClick={openBoard}
        aria-haspopup="dialog"
        className="group block w-full rounded-[1.1rem] text-left outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-4 focus-visible:ring-offset-ink-950"
      >
        <span className="sb-card flex flex-col rounded-[1.1rem] border border-line bg-ink-850 p-3.5">
          <span className="flex items-center justify-between font-mono text-[10px] tracking-[0.16em] text-fg-subtle uppercase">
            <span>Story · Studio</span>
            <span>#{String(story.length).padStart(2, "0")}</span>
          </span>
          {/* Story ring around the mark, like an unseen story */}
          <span className="mt-4 flex justify-center">
            <span className="sb-ring relative grid size-24 place-items-center rounded-full p-[3px]">
              <span className="grid size-full place-items-center rounded-full bg-ink-850">
                <LogoMark bare tight className="h-11 w-9" />
              </span>
              <span className="absolute -right-0.5 -bottom-0.5 grid size-8 place-items-center rounded-full bg-brand-400 text-on-brand shadow-[0_0_20px_-4px_var(--color-brand-400)] transition-transform duration-300 group-hover:scale-110">
                <Play aria-hidden className="ml-0.5 size-3.5 fill-current" />
              </span>
            </span>
          </span>
          <span className="mt-4 block text-center leading-none">
            <span className="block font-display text-base font-semibold text-brand-300 italic">Dream</span>
            <span className="mt-1 block font-display text-2xl font-bold text-fg">Beginning</span>
            <span className="mt-1.5 flex items-center justify-center gap-2 font-display text-base font-semibold text-human-accent">
              <span aria-hidden className="h-px w-5 bg-human-accent" />
              Intelligence
            </span>
          </span>
          <span className="mt-4 block text-center text-sm text-fg-muted">Watch our story</span>
          <span className="mt-4 flex items-center justify-between border-t border-line pt-3">
            <span className="font-mono text-[10px] tracking-[0.16em] text-fg-subtle uppercase">
              Let&apos;s <span className="text-brand-300">connect</span>
            </span>
            <span className="flex gap-1.5 text-fg-subtle" aria-hidden>
              {siteConfig.social.slice(0, 3).map((s) => (
                <SocialIcon key={s.label} name={s.label} className="size-3.5" />
              ))}
            </span>
          </span>
        </span>
      </button>

      {/* The story board */}
      <dialog
        ref={dialogRef}
        aria-label="Our story"
        data-lenis-prevent
        className="sb-board fixed inset-0 m-0 h-dvh max-h-none w-screen max-w-none overflow-hidden bg-transparent p-0 text-fg backdrop:bg-transparent"
      >
        {open && (
          <div data-theme="dark" className="relative grid h-full w-full place-items-center bg-ink-950 text-fg">
            {/* Ambient backdrop: the current slide, huge and blurred */}
            <div aria-hidden key={`bg-${slide.id}`} className="sb-ambient absolute inset-0 overflow-hidden">
              {slide.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={slide.image.src} alt="" className="size-full scale-125 object-cover opacity-35 blur-3xl" />
              ) : (
                <div
                  className="size-full"
                  style={{ background: `radial-gradient(60% 60% at 50% 40%, color-mix(in oklab, ${TONE[slide.tone]} 30%, transparent), transparent 70%)` }}
                />
              )}
            </div>

            {/* Arrows outside the frame on wide screens */}
            <button
              type="button"
              onClick={prev}
              disabled={index === 0}
              className="absolute left-[max(1rem,calc(50%-22rem))] z-20 hidden size-11 place-items-center rounded-full border border-line-strong bg-ink-900/70 text-fg transition-opacity hover:border-brand-400/60 disabled:opacity-30 sm:grid"
            >
              <span className="sr-only">Previous</span>
              <ChevronLeft aria-hidden className="size-5" />
            </button>
            <button
              type="button"
              onClick={last ? closeBoard : next}
              className="absolute right-[max(1rem,calc(50%-22rem))] z-20 hidden size-11 place-items-center rounded-full border border-line-strong bg-ink-900/70 text-fg hover:border-brand-400/60 sm:grid"
            >
              <span className="sr-only">{last ? "Close" : "Next"}</span>
              {last ? <X aria-hidden className="size-5" /> : <ChevronRight aria-hidden className="size-5" />}
            </button>

            {/* The story frame */}
            <div style={{ perspective: "1200px" }} className="relative z-10 h-full w-full sm:h-auto sm:w-auto">
              <div
                ref={frameRef}
                onPointerDown={() => setPaused(true)}
                onPointerUp={() => setPaused(false)}
                onPointerLeave={() => setPaused(false)}
                className="relative h-full w-full overflow-hidden bg-ink-900 sm:aspect-[9/16] sm:h-[min(88dvh,50rem)] sm:w-auto sm:rounded-[1.4rem] sm:border sm:border-line-strong sm:shadow-[0_40px_120px_-30px_rgb(0_0_0/0.9)]"
              >
                {/* Media */}
                <div key={slide.id} className="sb-slide absolute inset-0">
                  {slide.image ? (
                    // Landscape shots: the whole picture in the upper part, over a blurred fill of itself
                    <div className="relative size-full overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={slide.image.src} alt="" aria-hidden className="absolute inset-0 size-full scale-125 object-cover opacity-55 blur-2xl" />
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={slide.image.src}
                        alt={slide.image.alt}
                        className="sb-kenburns absolute inset-x-0 top-[17%] h-[46%] w-full object-contain px-3 drop-shadow-[0_24px_40px_rgb(0_0_0/0.6)]"
                      />
                    </div>
                  ) : (
                    <Drawn slide={slide} />
                  )}
                  <div aria-hidden className="absolute inset-0 bg-[linear-gradient(to_bottom,rgb(0_0_0/0.55),transparent_22%,transparent_45%,rgb(0_0_0/0.85))]" />
                </div>

                {/* Progress bars */}
                <div className="absolute inset-x-3 top-3 z-20 flex gap-1" aria-hidden>
                  {story.map((s, i) => (
                    <span key={s.id} className="h-[3px] flex-1 overflow-hidden rounded-full bg-white/25">
                      <span
                        key={i === index ? `on-${index}` : `off-${i}`}
                        onAnimationEnd={i === index && !last ? next : undefined}
                        className={cn("block h-full rounded-full bg-white", i < index ? "w-full" : i > index ? "w-0" : "sb-fill")}
                        style={i === index ? ({ "--sb-ms": `${SLIDE_MS}ms`, animationPlayState: paused ? "paused" : "running" } as CSSProperties) : undefined}
                      />
                    </span>
                  ))}
                </div>

                {/* Header */}
                <div className="absolute inset-x-3 top-6 z-20 flex items-center gap-2.5">
                  <span className="sb-ring grid size-9 place-items-center rounded-full p-[2px]">
                    <span className="grid size-full place-items-center rounded-full bg-ink-900">
                      <LogoMark bare tight className="h-5 w-4" />
                    </span>
                  </span>
                  <span className="min-w-0 flex-1 leading-tight">
                    <span className="block text-sm font-semibold text-white">Outscalers</span>
                    <span className="block font-mono text-[10px] tracking-[0.14em] text-white/70 uppercase">Our story</span>
                  </span>
                  <button
                    type="button"
                    onClick={closeBoard}
                    className="relative z-30 grid size-9 place-items-center rounded-full text-white/85 hover:bg-white/10 hover:text-white"
                  >
                    <span className="sr-only">Close our story</span>
                    <X aria-hidden className="size-5" />
                  </button>
                </div>

                {/* Tap zones: left third back, the rest forward */}
                <button type="button" onClick={prev} className="absolute inset-y-0 left-0 z-10 w-1/3 outline-none" tabIndex={-1}>
                  <span className="sr-only">Previous</span>
                </button>
                <button type="button" onClick={next} className="absolute inset-y-0 right-0 z-10 w-2/3 outline-none" tabIndex={-1}>
                  <span className="sr-only">Next</span>
                </button>

                {/* Caption */}
                <div key={`t-${slide.id}`} className="sb-caption pointer-events-none absolute inset-x-0 bottom-0 z-20 p-6 pb-8 text-white">
                  <p className="font-mono text-[11px] tracking-[0.18em] uppercase" style={{ color: TONE[slide.tone] }}>
                    {slide.kicker}
                  </p>
                  <h2 className="mt-2 font-display text-2xl leading-tight font-semibold text-balance sm:text-[1.75rem]">{slide.title}</h2>
                  <p className="mt-2.5 text-[0.9375rem] leading-relaxed text-white/80">{slide.body}</p>
                  {slide.link && (
                    <Link
                      href={slide.link.href}
                      className="pointer-events-auto mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-300 hover:text-brand-200"
                    >
                      {slide.link.label}
                      <ArrowUpRight aria-hidden className="size-4" />
                    </Link>
                  )}
                </div>
              </div>
            </div>

            <p className="absolute bottom-4 z-20 hidden font-mono text-[10px] tracking-[0.18em] text-fg-subtle uppercase sm:block">
              Tap or ← → to move · hold to pause · Esc to close
            </p>
          </div>
        )}
      </dialog>
    </>
  );
}

/** Backdrop for slides without a photo: tone glow, a huge outlined word and a slow orbit. */
function Drawn({ slide }: { slide: StorySlide }) {
  const tone = TONE[slide.tone];
  return (
    <div
      className="relative size-full overflow-hidden"
      style={{ background: `radial-gradient(90% 70% at 70% 20%, color-mix(in oklab, ${tone} 45%, transparent), transparent 70%), var(--color-ink-900)` }}
    >
      <div aria-hidden className="bg-grid absolute inset-0 opacity-40" />
      <span
        aria-hidden
        className="sb-orbit absolute top-[18%] left-1/2 size-[130%] -translate-x-1/2 rounded-full border border-dashed"
        style={{ borderColor: `color-mix(in oklab, ${tone} 40%, transparent)` }}
      />
      {slide.mark && (
        <span
          aria-hidden
          className="sb-mark absolute top-[16%] left-1/2 -translate-x-1/2 font-display text-[7.5rem] leading-none font-bold whitespace-nowrap text-transparent"
          style={{ WebkitTextStroke: `1.5px color-mix(in oklab, ${tone} 75%, white)` }}
        >
          {slide.mark}
        </span>
      )}
    </div>
  );
}
