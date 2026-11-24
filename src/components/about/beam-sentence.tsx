"use client";

import { type CSSProperties, useEffect, useRef } from "react";
import { PendantLamp } from "@/components/ui/pendant-lamp";
import { usePendulum } from "@/components/ui/use-pendulum";

/**
 * About page statement: a tall section pins to the screen while one huge sentence slides from
 * right to left across a dark brick wall as you scroll. A pendant lamp throws a triangle of light;
 * the sentence is only visible inside that light and fades into the dark outside it. With
 * reduced motion the sentence simply shows, wrapped. Drag the lamp and it swings like a pendulum,
 * sweeping the light across the wall, then settles back in the centre. Styles: .beam-* in globals.css.
 */
export function BeamSentence({ text }: { text: string }) {
  const sectionRef = useRef<HTMLElement>(null);
  const litRef = useRef<HTMLDivElement>(null);
  const dimRef = useRef<HTMLDivElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const lampRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const lit = litRef.current;
    const dim = dimRef.current;
    if (!section || !lit || !dim) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // Eased (Lenis-like): the sentence glides towards the scroll position instead of moving in lockstep
    let raf = 0;
    let target = 0;
    let shown = -1;
    const progress = () => {
      const r = section.getBoundingClientRect();
      return Math.min(1, Math.max(0, -r.top / Math.max(1, r.height - innerHeight)));
    };
    const render = (p: number) => {
      const w = lit.scrollWidth;
      // From just right of the light until the last letter has left it on the left
      const x = innerWidth * 0.75 - (w + innerWidth * 0.5) * p;
      const t = `translate3d(${x}px, -50%, 0)`;
      lit.style.transform = t;
      dim.style.transform = t;
      section.style.setProperty("--beam-p", String(p));
    };
    const update = () => {
      raf = 0;
      target = progress();
      shown = shown < 0 ? target : shown + (target - shown) * 0.08;
      if (Math.abs(target - shown) < 0.0004) shown = target;
      render(shown);
      if (shown !== target) raf = requestAnimationFrame(update);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    addEventListener("scroll", onScroll, { passive: true });
    addEventListener("resize", onScroll);
    document.fonts?.ready.then(update);
    return () => {
      removeEventListener("scroll", onScroll);
      removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  // Pendulum: drag the lamp to swing it; on release it swings back and settles in the centre.
  // The angle drives the lamp, the light triangle and the lit part of the sentence (CSS variables).
  usePendulum(stickyRef, lampRef, () => {
    const rem = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
    const rim = 12.25 * rem; // wire top to the rim of the shade
    return { rim, apex: rim - 3.6 * rem }; // the light triangle starts hidden behind the shade
  });

  return (
    <section ref={sectionRef} aria-label="Our promise" className="beam">
      <div ref={stickyRef} className="beam-sticky">
        {/* A brick wall in the dark, and the triangle of light from the lamp */}
        <span aria-hidden className="beam-wall" />
        <span aria-hidden className="beam-shade" />
        <span aria-hidden className="beam-cone" />

        {/* The sentence: barely there in the dark, bright only inside the light */}
        <div aria-hidden className="beam-plane beam-plane-dim">
          <div ref={dimRef} className="beam-track">
            <span className="beam-text beam-dim">{text}</span>
          </div>
        </div>
        <div className="beam-plane beam-plane-lit">
          <div ref={litRef} className="beam-track">
            <p className="beam-text beam-lit">{text}</p>
          </div>
        </div>

        <span aria-hidden className="beam-light">
          {/* Pendant lamp on a wire; the shade hides the bulb, light only spills out underneath */}
          <PendantLamp ref={lampRef} className="beam-lamp" title="Drag the lamp to swing it" idPrefix="beam" />
          <span className="beam-glow" />
          {Array.from({ length: 8 }, (_, i) => (
            <span key={i} className="beam-fly" style={{ "--f": i } as CSSProperties} />
          ))}
        </span>
        <span aria-hidden className="beam-hint">Scroll · drag the lamp</span>
      </div>
    </section>
  );
}
