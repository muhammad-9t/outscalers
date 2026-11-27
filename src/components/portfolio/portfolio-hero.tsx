"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import dynamic from "next/dynamic";
import { PageHero, type Crumb } from "@/components/sections/page-hero";

const OrbitScene = dynamic(() => import("./orbit-scene").then((m) => m.OrbitScene), { ssr: false });

const clamp = (v: number) => Math.min(1, Math.max(0, v));
const smooth = (t: number) => t * t * (3 - 2 * t);

/** Big words that pass behind the engineer while the desk circles: [text, fade in from, peak, fade out by]. */
const PHRASES: [string, number, number, number, number][] = [
  ["Human-led.", 0.2, 0.27, 0.36, 0.43],
  ["AI-accelerated.", 0.42, 0.49, 0.58, 0.65],
  ["Shipped.", 0.64, 0.71, 0.8, 0.88],
];

/**
 * Portfolio hero. On desktops (without reduced motion) the section is pinned for a long
 * scroll while a 3D engineer at a desk circles the stage; phones get the plain hero.
 */
export function PortfolioHero({
  eyebrow,
  title,
  lead,
  crumbs,
  covers,
}: {
  eyebrow: string;
  title: ReactNode;
  lead: ReactNode;
  crumbs: Crumb[];
  /** Project screenshots that orbit the desk. */
  covers: string[];
}) {
  const sectionRef = useRef<HTMLElement>(null);
  const copyRef = useRef<HTMLDivElement>(null);
  const cueRef = useRef<HTMLDivElement>(null);
  const phraseRefs = useRef<(HTMLParagraphElement | null)[]>([]);
  const progressRef = useRef(0);
  const [orbit, setOrbit] = useState(false);
  const [active, setActive] = useState(false);
  const [themeKey, setThemeKey] = useState(0);

  useEffect(() => {
    const lg = window.matchMedia("(min-width: 64rem)");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setOrbit(lg.matches && !reduce.matches);
    apply();
    lg.addEventListener("change", apply);
    reduce.addEventListener("change", apply);

    // The 3D colours are read once, so rebuild the scene when the theme changes
    const root = document.documentElement;
    const mo = new MutationObserver(() => setThemeKey((k) => k + 1));
    mo.observe(root, { attributes: true, attributeFilter: ["data-theme"] });

    const io = new IntersectionObserver(([e]) => setActive(e.isIntersecting));
    if (sectionRef.current) io.observe(sectionRef.current);
    return () => {
      lg.removeEventListener("change", apply);
      reduce.removeEventListener("change", apply);
      mo.disconnect();
      io.disconnect();
    };
  }, []);

  useEffect(() => {
    const copy = copyRef.current;
    const phrases = phraseRefs.current;
    if (!orbit) {
      copy?.style.removeProperty("opacity");
      copy?.style.removeProperty("transform");
      return;
    }
    let raf = 0;
    const update = () => {
      raf = 0;
      const el = sectionRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const p = clamp(-r.top / Math.max(r.height - window.innerHeight, 1));
      progressRef.current = p;

      // The copy steps back as the desk moves to centre stage
      const out = smooth(clamp((p - 0.03) / 0.15));
      if (copy) {
        copy.style.opacity = String(1 - out);
        copy.style.transform = `translate3d(0, ${-out * 80}px, 0) scale(${1 - out * 0.06})`;
        copy.style.visibility = out >= 1 ? "hidden" : "";
      }
      if (cueRef.current) cueRef.current.style.opacity = String(1 - smooth(clamp(p / 0.05)));
      PHRASES.forEach(([, a, b, c, d], i) => {
        const node = phrases[i];
        if (!node) return;
        const fin = smooth(clamp((p - a) / (b - a)));
        const fout = smooth(clamp((p - c) / (d - c)));
        node.style.opacity = String(fin * (1 - fout));
        node.style.transform = `translate3d(0, ${(1 - fin) * 60 - fout * 60}px, 0) scale(${0.92 + fin * 0.08 + fout * 0.06})`;
        node.style.filter = `blur(${(1 - fin) * 10 + fout * 10}px)`;
      });
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
  }, [orbit]);

  return (
    // z-20: above the showcase's 3D laptop layer (z-10), so the laptop comes out from under this scene
    <section ref={sectionRef} aria-label="Portfolio introduction" className="ph-orbit relative z-20">
      <div className="ph-pin">
        {orbit && (
          <>
            <div aria-hidden className="pointer-events-none absolute inset-0 flex items-center justify-center">
              {PHRASES.map(([text], i) => (
                <p
                  key={text}
                  ref={(el) => {
                    phraseRefs.current[i] = el;
                  }}
                  className="ph-phrase"
                >
                  {text}
                </p>
              ))}
            </div>
            <div aria-hidden className="pointer-events-none absolute inset-0">
              <OrbitScene key={themeKey} active={active} progressRef={progressRef} covers={covers} />
            </div>
            {/* Tells visitors the hero moves with the scroll; fades as soon as they start */}
            <div ref={cueRef} aria-hidden className="ph-cue">
              <span className="ph-cue-mouse" />
              Scroll
            </div>
          </>
        )}
        <div ref={copyRef} className="ph-copy relative z-10">
          <PageHero
            eyebrow={eyebrow}
            title={title}
            lead={lead}
            crumbs={crumbs}
            bare
            className="lg:overflow-visible lg:[&_.text-lead]:max-w-xl lg:[&_h1]:max-w-xl"
          />
        </div>
      </div>
    </section>
  );
}
