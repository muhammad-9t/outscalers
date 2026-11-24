"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/**
 * Marks `[data-reveal]` elements with `data-visible` as they scroll into view (CSS animates them in).
 * A single observer serves the whole page; it re-scans after route changes.
 * It sets a data attribute, not a class: the page's HTML can still be hydrating when this runs,
 * and React would report a changed `className` as a hydration mismatch.
 */
export function RevealObserver() {
  const pathname = usePathname();

  useEffect(() => {
    const root = document.documentElement;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const elements = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]:not([data-visible])"));

    if (reduceMotion || !("IntersectionObserver" in window)) {
      elements.forEach((el) => el.setAttribute("data-visible", ""));
      return;
    }

    root.classList.add("js-reveal");
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.setAttribute("data-visible", "");
            observer.unobserve(entry.target);
          }
        }
      },
      { rootMargin: "0px 0px -6% 0px", threshold: 0.04 },
    );
    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [pathname]);

  return null;
}
