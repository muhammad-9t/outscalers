"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { setLenis } from "@/lib/smooth-scroll";

// Mouse wheels scroll in jumps, so they get the smoothing. Touch screens and trackpads already glide,
// and visitors who asked for less motion keep the browser's own scrolling.
const QUERY = "(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)";

/** Smooth wheel scrolling with Lenis on desktop. Renders nothing. */
export function SmoothScroll() {
  useEffect(() => {
    const mq = window.matchMedia(QUERY);
    let lenis: Lenis | null = null;

    const sync = () => {
      if (mq.matches && !lenis) {
        lenis = new Lenis({ lerp: 0.12, anchors: true, autoRaf: true, allowNestedScroll: true, stopInertiaOnNavigate: true });
        setLenis(lenis);
      } else if (!mq.matches && lenis) {
        lenis.destroy();
        lenis = null;
        setLenis(null);
      }
    };

    sync();
    mq.addEventListener("change", sync);
    return () => {
      mq.removeEventListener("change", sync);
      lenis?.destroy();
      setLenis(null);
    };
  }, []);

  return null;
}
