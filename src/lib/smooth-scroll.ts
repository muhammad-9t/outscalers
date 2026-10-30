import type Lenis from "lenis";

// The live Lenis instance, set by <SmoothScroll /> on desktops with a mouse. Null everywhere else.
let lenis: Lenis | null = null;

export const setLenis = (l: Lenis | null) => {
  lenis = l;
};

/**
 * Scrolls the page to `top`. Goes through Lenis when it is running, so the two never fight
 * over the scroll position, and falls back to the browser otherwise.
 */
export function scrollToY(top: number, { smooth = true }: { smooth?: boolean } = {}) {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (lenis) lenis.scrollTo(top, { immediate: !smooth || reduce, force: true });
  else window.scrollTo({ top, behavior: smooth && !reduce ? "smooth" : "instant" });
}
