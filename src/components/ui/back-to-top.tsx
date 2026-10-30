"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUp } from "lucide-react";
import { cn } from "@/lib/cn";
import { scrollToY } from "@/lib/smooth-scroll";

const SHOW_AFTER = 600;
const RING = 2 * Math.PI * 20;

/** Floating "back to top" button with a ring that shows scroll progress. */
export function BackToTop() {
  const [visible, setVisible] = useState(false);
  const ringRef = useRef<SVGCircleElement>(null);

  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      const progress = Math.min(1, window.scrollY / max);
      ringRef.current?.style.setProperty("stroke-dashoffset", String(RING * (1 - progress)));
      setVisible(window.scrollY > SHOW_AFTER);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  const backToTop = () => {
    scrollToY(0);
    // Return keyboard focus to the start of the page.
    document.querySelector<HTMLElement>("header a")?.focus({ preventScroll: true });
  };

  return (
    <button
      type="button"
      onClick={backToTop}
      aria-label="Back to top"
      className={cn(
        "group fixed bottom-5 z-50 grid size-11 place-items-center rounded-full border border-line-strong bg-ink-850/90 text-fg-muted shadow-lg shadow-black/40 backdrop-blur transition-all duration-300 hover:border-brand-400/60 hover:text-fg sm:bottom-6",
        visible ? "visible translate-y-0 opacity-100" : "invisible translate-y-3 opacity-0",
      )}
      // Centred in the right-hand margin on wide screens, lined up with the homepage rocket.
      style={{ right: "max(16px, calc((100vw - 76rem) / 4 - 22px))" }}
    >
      <svg aria-hidden viewBox="0 0 44 44" className="absolute inset-0 size-full -rotate-90">
        <circle
          ref={ringRef}
          cx={22}
          cy={22}
          r={20}
          className="fill-none stroke-brand-400"
          strokeWidth={1.6}
          strokeLinecap="round"
          strokeDasharray={RING}
          strokeDashoffset={RING}
        />
      </svg>
      <ArrowUp aria-hidden className="size-4 transition-transform duration-200 group-hover:-translate-y-0.5" />
    </button>
  );
}
