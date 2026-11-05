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

/** Freezes page scrolling (for full-screen overlays such as the game), or lets it go again. */
export function lockScroll(locked: boolean) {
  if (lenis) {
    if (locked) lenis.stop();
    else lenis.start();
  }
  document.documentElement.style.overflow = locked ? "hidden" : "";
}

/** Scrolls the page by `dy` pixels at once (for animations that move the page a little every frame). */
export function scrollByY(dy: number) {
  if (lenis) lenis.scrollTo(lenis.targetScroll + dy, { immediate: true, force: true });
  else window.scrollBy(0, dy);
}
