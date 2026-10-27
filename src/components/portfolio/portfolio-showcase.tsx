"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { PortfolioProject, ShowcaseScreen } from "@/content/portfolio";
import { cn } from "@/lib/cn";
import { LaptopFrame } from "./laptop-frame";
import { MiniLaptop } from "./mini-laptop";

// three.js only loads on this page, and only in the browser
const LaptopScene = dynamic(() => import("./laptop-scene").then((m) => m.LaptopScene), { ssr: false });

const badgeLabel = { sample: "Sample project", draft: "Draft profile", published: null } as const;

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
      if (!lg.matches) frameRef.current?.style.removeProperty("--handoff");
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

  const total = String(chapters.length).padStart(2, "0");

  return (
    <div ref={sectionRef} className="relative bg-ink-950">
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
              reducedMotion={reducedMotion}
            />
          </div>
        </div>
      )}

      <div ref={heroRef}>{hero}</div>
      {intro}

      <div ref={chaptersRef}>
        {chapters.map(({ project, screen }, i) => {
          const badge = badgeLabel[project.status];
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
              <div className="card mx-auto w-full max-w-xl bg-ink-900/85 p-6 backdrop-blur-md sm:p-8 lg:mx-0 lg:max-w-md">
                <p className="flex items-center justify-between gap-3 font-mono text-xs uppercase tracking-wider">
                  <span className="text-brand-300">
                    {String(i + 1).padStart(2, "0")} / {total}
                  </span>
                  {badge && <span className="text-fg-subtle">{badge}</span>}
                </p>
                <p className="mt-5 font-mono text-xs uppercase tracking-wider text-fg-subtle">{project.industry}</p>
                <h3 className="mt-2 text-2xl font-semibold leading-tight sm:text-3xl">{project.name}</h3>
                <p className="mt-4 leading-relaxed text-fg-muted">{project.summary}</p>
                <ul className="mt-5 flex flex-wrap gap-1.5" aria-label="Technologies">
                  {project.stack.slice(0, 4).map((t) => (
                    <li key={t} className="chip py-0.5! text-xs">
                      {t}
                    </li>
                  ))}
                </ul>
                {project.caseStudy ? (
                  <Link
                    href={`/case-studies/${project.slug}`}
                    className="group mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-300"
                  >
                    Read case study
                    <ArrowUpRight aria-hidden className="size-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </Link>
                ) : (
                  <p className="mt-6 text-sm text-fg-subtle">Case study coming soon</p>
                )}
              </div>
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
