"use client";

import { useEffect, useRef, type ReactNode, type RefObject } from "react";
import { useRouter } from "next/navigation";
import { LogoMark } from "@/components/layout/logo";
import { scrollToY } from "@/lib/smooth-scroll";

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

const HOLD = 0.35; // pause before the cards start and after they finish, as a share of the viewport height
const EASE = 0.12; // how quickly the cards catch up with the scroll each frame (lower = softer)

// Opening a project from the screen, in ms
const FADE = 300; // the cards fade out
const HOLD_LOGO = 1000; // the dark screen shows the logo
const ZOOM = 700; // the screen grows to fill the viewport
const REVEAL = 450; // the dark screen fades away over the new page

/**
 * Plays the "opening" sequence for a link clicked on the laptop screen, then navigates.
 * The overlay is a clone of `template` appended to <body>, so it outlives this page and
 * fades out only once the new page has rendered. `html[data-launch]` lets the new page zoom in.
 * `done` runs once the portfolio is hidden, after its screen has been reset: Next keeps the page
 * alive, so going back must find the cards visible again.
 */
function launch(href: string, screen: HTMLElement, content: HTMLElement, template: HTMLElement, push: (href: string) => void, done: () => void) {
  const ease = "cubic-bezier(0.65, 0, 0.35, 1)";
  const rect = screen.getBoundingClientRect();
  const ghost = template.cloneNode(true) as HTMLElement;
  ghost.hidden = false;
  // The logo's gradient id would resolve to the hidden template's copy, which doesn't paint
  ghost.querySelectorAll("linearGradient[id]").forEach((g) => {
    const id = `${g.id}-launch`;
    ghost.querySelectorAll(`[fill="url(#${g.id})"]`).forEach((el) => el.setAttribute("fill", `url(#${id})`));
    g.id = id;
  });
  Object.assign(ghost.style, {
    left: `${rect.left}px`,
    top: `${rect.top}px`,
    width: `${rect.width}px`,
    height: `${rect.height}px`,
    borderRadius: getComputedStyle(screen).borderRadius,
    opacity: "0",
  });
  document.body.append(ghost);
  const logo = ghost.querySelector("[data-launch-logo]");
  const fade = content.animate({ opacity: [1, 0], filter: ["blur(0)", "blur(4px)"] }, { duration: FADE, fill: "forwards" });
  ghost.animate({ opacity: [0, 1] }, { duration: FADE, delay: FADE * 0.6, fill: "forwards" });
  logo?.animate(
    { opacity: [0, 1], transform: ["scale(0.85)", "scale(1)"] },
    { duration: 500, delay: FADE, easing: "cubic-bezier(0.22, 1, 0.36, 1)", fill: "both" },
  );

  window.setTimeout(() => {
    const zoom = ghost.animate(
      { left: ["0px"], top: ["0px"], width: ["100vw"], height: ["100vh"], borderRadius: ["0px"] },
      { duration: ZOOM, easing: ease, fill: "forwards" },
    );
    logo?.animate({ transform: ["scale(1)", "scale(1.12)"] }, { duration: ZOOM, easing: ease, fill: "forwards" });
    zoom.onfinish = () => {
      const root = document.documentElement;
      root.dataset.launch = "";
      push(href);
      // Wait for the new route to render (or give up after 6s), then lift the dark screen
      const started = performance.now();
      const reveal = () => {
        if (location.pathname !== href && performance.now() - started < 6000) return void requestAnimationFrame(reveal);
        requestAnimationFrame(() => {
          fade.cancel();
          done();
          ghost.animate({ opacity: [1, 0] }, { duration: REVEAL, easing: "ease-out", fill: "forwards" }).onfinish = () => ghost.remove();
          window.setTimeout(() => delete root.dataset.launch, 900);
        });
      };
      reveal();
    };
  }, FADE + HOLD_LOGO);
}

/**
 * A front-view laptop whose screen holds `children`. On large screens the laptop
 * pins in the viewport at real proportions and the page scroll slides a horizontal
 * track inside the screen (no nested scrollbar): the children mark the track with
 * `data-track` and its visible window with `data-track-viewport`.
 * Below `lg` it is plain content, no frame.
 *
 * `frameRef` is where the 3D laptop hands off; `data-handoff-stage` marks the
 * element whose arrival drives that hand-off.
 */
export function LaptopFrame({ frameRef, children }: { frameRef: RefObject<HTMLDivElement | null>; children: ReactNode }) {
  const stageRef = useRef<HTMLDivElement>(null);
  const screenRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const launchRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Opening a project from the screen: play the launch sequence instead of jumping straight there
  useEffect(() => {
    const screen = screenRef.current;
    const content = contentRef.current;
    const template = launchRef.current;
    if (!screen || !content || !template) return;
    let busy = false;
    const onClick = (e: MouseEvent) => {
      const link = e.target instanceof Element ? e.target.closest<HTMLAnchorElement>("a[href^='/']") : null;
      if (!link || busy || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      if (!window.matchMedia("(min-width: 64rem)").matches || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      e.preventDefault();
      busy = true;
      const href = link.getAttribute("href")!;
      router.prefetch(href);
      launch(href, screen, content, template, router.push, () => (busy = false));
    };
    content.addEventListener("click", onClick);
    return () => content.removeEventListener("click", onClick);
  }, [router]);

  useEffect(() => {
    const stage = stageRef.current;
    const screen = screenRef.current;
    const content = contentRef.current;
    if (!stage || !screen || !content) return;
    const lg = window.matchMedia("(min-width: 64rem)");
    const parts = () => {
      const track = content.querySelector<HTMLElement>("[data-track]");
      const viewport = content.querySelector<HTMLElement>("[data-track-viewport]");
      return track && viewport ? { track, viewport, travel: Math.max(0, track.scrollWidth - viewport.clientWidth) } : null;
    };

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const hold = () => window.innerHeight * HOLD;

    let raf = 0;
    let height = "";
    let x = 0; // current track offset, eased towards the scroll position
    const update = () => {
      raf = 0;
      const p = parts();
      if (!p) return;
      if (!lg.matches) {
        stage.style.height = height = "";
        p.track.style.transform = "";
        x = 0;
        return;
      }
      // The stage is one viewport, plus the track's travel (one pixel of scroll moves the cards one pixel),
      // plus a pause before the cards start and after the last one arrives.
      // Only write the height when it changes: a layout write on every scroll would force reflows.
      const next = `${window.innerHeight + p.travel + hold() * 2}px`;
      if (next !== height) stage.style.height = height = next;
      const progress = clamp((-stage.getBoundingClientRect().top - hold()) / Math.max(p.travel, 1), 0, 1);
      const target = -progress * p.travel;
      // Ease after the scroll for a softer slide; keep animating until it catches up
      x = reduced.matches ? target : x + (target - x) * EASE;
      if (Math.abs(target - x) < 0.5) x = target;
      else schedule();
      p.track.style.transform = `translate3d(${x}px, 0, 0)`;
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    // Keyboard users: bring a focused card into the screen by scrolling the page
    const onFocus = (e: FocusEvent) => {
      const p = parts();
      if (!lg.matches || !p || !(e.target instanceof HTMLElement) || !p.track.contains(e.target)) return;
      p.viewport.scrollLeft = 0; // the browser may scroll the clipped track itself
      screen.scrollTop = 0;
      const offset = e.target.getBoundingClientRect().left - p.track.getBoundingClientRect().left;
      const wanted = clamp(offset - p.viewport.clientWidth / 3, 0, p.travel);
      scrollToY(stage.getBoundingClientRect().top + window.scrollY + hold() + wanted, { smooth: false });
    };

    const ro = new ResizeObserver(schedule);
    ro.observe(content);
    ro.observe(screen);
    const track = content.querySelector("[data-track]");
    if (track) ro.observe(track);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    lg.addEventListener("change", schedule);
    content.addEventListener("focusin", onFocus);
    update();
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      lg.removeEventListener("change", schedule);
      content.removeEventListener("focusin", onFocus);
    };
  }, []);

  return (
    <div ref={stageRef} data-handoff-stage className="relative">
      <div className="lg:sticky lg:top-0 lg:flex lg:h-svh lg:items-center lg:justify-center lg:pt-18">
        {/* --handoff is driven by the 3D scene; without WebGL the frame simply shows */}
        <div
          ref={frameRef}
          style={{ opacity: "var(--handoff, 1)" }}
          className="mx-auto w-full lg:w-[min(100%,calc((100svh-8rem)*1.52))]"
        >
          {/* Lid: same 3.2 : 2.1 proportions as the 3D model */}
          <div className="flex flex-col lg:aspect-[3.2/2.1] lg:rounded-[clamp(14px,2vw,28px)] lg:bg-device-metal lg:p-[1.6%] lg:shadow-2xl">
            <div className="relative flex min-h-0 flex-1 flex-col lg:rounded-[clamp(10px,1.6vw,22px)] lg:bg-device-bezel lg:px-[3%] lg:pb-[3%] lg:pt-[2.2%]">
              <span aria-hidden className="absolute left-1/2 top-[0.7%] hidden size-1.5 -translate-x-1/2 rounded-full bg-device-key lg:block" />
              <div ref={screenRef} className="min-h-0 flex-1 lg:overflow-hidden lg:rounded-md lg:bg-ink-950">
                <div ref={contentRef} className="lg:flex lg:h-full lg:flex-col lg:p-[3%]">
                  {children}
                </div>
              </div>
            </div>
          </div>
          {/* Launch overlay template, cloned onto <body> when a project opens. Always dark, like a screen waking up. */}
          <div
            ref={launchRef}
            hidden
            aria-hidden
            data-theme="dark"
            className="fixed z-[100] flex flex-col items-center justify-center overflow-hidden bg-ink-950 text-fg"
          >
            <div data-launch-logo className="flex flex-col items-center">
              <LogoMark className="size-16" />
              <span className="mt-4 font-display text-2xl font-semibold tracking-tight">Outscalers</span>
              <span className="mt-3 flex items-center gap-1 font-mono text-[11px] uppercase tracking-[0.2em] text-fg-subtle">
                Opening
                <span className="launch-dot" />
                <span className="launch-dot [animation-delay:0.15s]" />
                <span className="launch-dot [animation-delay:0.3s]" />
              </span>
            </div>
          </div>
          <div aria-hidden className="mx-[-3%] hidden h-4 rounded-b-[clamp(10px,1.5vw,20px)] bg-device-metal lg:block">
            <div className="mx-auto h-1.5 w-[16%] rounded-b-md bg-device-trackpad" />
          </div>
        </div>
      </div>
    </div>
  );
}
