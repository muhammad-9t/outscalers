"use client";

import { type CSSProperties, useRef } from "react";
import { PendantLamp } from "@/components/ui/pendant-lamp";
import { cssLengthPx, usePendulum } from "@/components/ui/use-pendulum";

/** The wall behind the panels: About's dark brick wall, only visible where the lamp lights it. */
export function PhaseBackdrop() {
  return (
    <div aria-hidden className="phl-back">
      <span className="beam-wall" />
      <span className="beam-shade" />
    </div>
  );
}

/**
 * How We Work phases: the same pendant lamp as the About page's beam sentence, hanging over the
 * pinned panels in a dark room. The light leaves through the rim of the shade (the tip of the cone
 * is hidden inside it) and its triangle is the only place content can be seen: a dark layer with a
 * cone-shaped hole covers everything else. Drag the lamp and it swings like a pendulum, sweeping
 * the light (and the reveal) across the panels, then settles. Flies circle the bulb, as on About.
 * Drawn over the panels and under the rail. Styles: .phl-* (plus .beam-glow / .beam-fly).
 */
export function PhaseLight() {
  const hostRef = useRef<HTMLDivElement>(null);
  const lampRef = useRef<SVGSVGElement>(null);
  // Rim and cone tip come from the CSS (they change on short screens)
  usePendulum(hostRef, lampRef, (host) => {
    const rim = cssLengthPx(host, "--bulb-y", 8.75);
    return { rim, apex: rim - cssLengthPx(host, "--apex-off", 1.3) };
  });

  return (
    <div ref={hostRef} className="phl">
      <span aria-hidden className="phl-dark" />
      <span aria-hidden className="phl-cone" />
      <span className="phl-light">
        <PendantLamp ref={lampRef} className="phl-lamp" title="Drag the lamp to swing it" idPrefix="phl" />
        <span aria-hidden className="beam-glow" />
        {Array.from({ length: 6 }, (_, i) => (
          <span key={i} aria-hidden className="beam-fly" style={{ "--f": i } as CSSProperties} />
        ))}
      </span>
    </div>
  );
}
