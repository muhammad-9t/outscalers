"use client";

import { useEffect, useRef, type ReactNode, type RefObject } from "react";

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

/**
 * A front-view laptop whose screen holds `children`. On large screens the laptop
 * pins in the viewport at real proportions and the page scroll moves the content
 * inside the screen (no nested scrollbar). Below `lg` it is plain content, no frame.
 *
 * `frameRef` is where the 3D laptop hands off; `data-handoff-stage` marks the
 * element whose arrival drives that hand-off.
 */
export function LaptopFrame({ frameRef, children }: { frameRef: RefObject<HTMLDivElement | null>; children: ReactNode }) {
  const stageRef = useRef<HTMLDivElement>(null);
  const screenRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stage = stageRef.current;
    const screen = screenRef.current;
    const content = contentRef.current;
    if (!stage || !screen || !content) return;
    const lg = window.matchMedia("(min-width: 64rem)");
    const travel = () => Math.max(0, content.offsetHeight - screen.clientHeight);

    let raf = 0;
    const update = () => {
      raf = 0;
      if (!lg.matches) {
        stage.style.height = "";
        content.style.transform = "";
        return;
      }
      // The stage is one viewport plus however far the content has to travel
      const t = travel();
      stage.style.height = `${window.innerHeight + t}px`;
      const progress = clamp(-stage.getBoundingClientRect().top / Math.max(t, 1), 0, 1);
      content.style.transform = `translate3d(0, ${-progress * t}px, 0)`;
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    // Keyboard users: bring a focused card into the screen by scrolling the page
    const onFocus = (e: FocusEvent) => {
      if (!lg.matches || !(e.target instanceof HTMLElement)) return;
      screen.scrollTop = 0; // the browser may scroll the clipped screen itself
      const offset = e.target.getBoundingClientRect().top - content.getBoundingClientRect().top;
      const wanted = clamp(offset - screen.clientHeight / 3, 0, travel());
      window.scrollTo({ top: stage.getBoundingClientRect().top + window.scrollY + wanted });
    };

    const ro = new ResizeObserver(schedule);
    ro.observe(content);
    ro.observe(screen);
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
                <div ref={contentRef} className="lg:p-8 lg:will-change-transform">
                  {children}
                </div>
              </div>
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
