"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import dynamic from "next/dynamic";
import type { PortfolioProject, ShowcaseScreen } from "@/content/portfolio";
import { cn } from "@/lib/cn";
import { LaptopFrame } from "./laptop-frame";
import { MiniLaptop } from "./mini-laptop";
import { ProjectFolder } from "./project-folder";
import { FocusGlow, type FocusPoint } from "./focus-glow";

// three.js only loads on this page, and only in the browser
const LaptopScene = dynamic(() => import("./laptop-scene").then((m) => m.LaptopScene), { ssr: false });


/**
 * The 3D laptop is pinned across the whole showcase: it enters beside the page
 * hero, glides into each project chapter as the page scrolls, and finally turns
 * to face the viewer and becomes the pinned HTML laptop the project grid scrolls inside.
 */
export function PortfolioShowcase({
  hero,
  intro,
  chapters,
  outro,
  outroHeading,
}: {
  hero: ReactNode;
  intro: ReactNode;
  /** Shown at the top of the laptop frame’s screen, above `outro`. */
  outroHeading: ReactNode;
  /** Shown inside the laptop frame’s screen. */
  outro: ReactNode;
  chapters: { project: PortfolioProject; screen: ShowcaseScreen }[];
}) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const chaptersRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const focusRef = useRef<FocusPoint>(null);
  const [active, setActive] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  // 3D only on laptops and desktops; phones and tablets get the lighter MiniLaptop
  const [desktop, setDesktop] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const lg = window.matchMedia("(min-width: 64rem)");
    const apply = () => {
      setReducedMotion(mq.matches);
      setDesktop(lg.matches);
      // Without the 3D scene nothing drives the hand-off, so show the frame
      if (!lg.matches) {
        frameRef.current?.style.removeProperty("--handoff");
        focusRef.current = null; // the glow falls back to its default spot
      }
    };
    apply();
    mq.addEventListener("change", apply);
    lg.addEventListener("change", apply);

    // Only render frames while the showcase is near the viewport
    const io = new IntersectionObserver(([entry]) => setActive(entry.isIntersecting), { rootMargin: "100% 0px" });
    if (sectionRef.current) io.observe(sectionRef.current);
    return () => {
      mq.removeEventListener("change", apply);
      lg.removeEventListener("change", apply);
      io.disconnect();
    };
  }, []);


  return (
    <div ref={sectionRef} className="relative bg-ink-950">
      {/* Soft glow behind everything; it follows the laptop */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="sticky top-0 h-svh">
          <FocusGlow focusRef={focusRef} active={active} reducedMotion={reducedMotion} />
        </div>
      </div>

      {/* The layer spans the showcase, so the pinned laptop unpins with the last chapter.
          z-10 keeps it above the hero background; it never takes pointer events. */}
      {desktop && (
        <div aria-hidden className="pointer-events-none absolute inset-0 z-10">
          <div className="sticky top-0 h-svh">
            <LaptopScene
              active={active}
              screens={chapters.map((c) => c.screen)}
              heroRef={heroRef}
              chaptersRef={chaptersRef}
              frameRef={frameRef}
              focusRef={focusRef}
              reducedMotion={reducedMotion}
            />
          </div>
        </div>
      )}

      <div ref={heroRef}>{hero}</div>
      {intro}

      <div ref={chaptersRef}>
        {chapters.map(({ project, screen }, i) => {
          return (
            <article
              key={project.slug}
              className={cn(
                // Phones/tablets: stacked mockup + card. Desktop: one viewport per project beside the 3D laptop
                "container-site relative z-20 flex flex-col gap-5 py-8 lg:h-svh lg:flex-row lg:items-center lg:py-0",
                i % 2 === 0 ? "lg:justify-start" : "lg:justify-end",
              )}
            >
              <div className="lg:hidden">
                <MiniLaptop screen={screen} />
              </div>
              <ProjectFolder project={project} index={i} total={chapters.length} />
            </article>
          );
        })}
      </div>

      {/* Hand-off: the 3D laptop lines up with this frame, then fades out to reveal it */}
      <div className="relative z-20 pb-16 pt-12 sm:pb-24 lg:pt-0">
        <div className="container-site">
          <LaptopFrame frameRef={frameRef}>
            {outroHeading}
            {outro}
          </LaptopFrame>
        </div>
      </div>
    </div>
  );
}
