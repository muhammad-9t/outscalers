"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

// Same rule as the pet itself: a real mouse and no reduced-motion preference
const QUERY = "(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)";

// The pet's code is only downloaded when it will actually be shown
const PetBot = dynamic(() => import("./pet-bot").then((m) => m.PetBot), { ssr: false });

/**
 * Loads the pet robot on desktop only, once the page has finished loading and the browser is idle,
 * so phones never download it and it never competes with the page's own content.
 */
export function PetLoader() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!window.matchMedia(QUERY).matches) return;
    const start = () => setShow(true);
    const idle = (cb: () => void) =>
      typeof window.requestIdleCallback === "function" ? window.requestIdleCallback(cb, { timeout: 3000 }) : setTimeout(cb, 1500);
    const run = () => idle(start);
    if (document.readyState === "complete") run();
    else window.addEventListener("load", run, { once: true });
    return () => window.removeEventListener("load", run);
  }, []);

  return show ? <PetBot /> : null;
}
