import type { Ref } from "react";

/**
 * The pendant lamp from the About page's beam sentence: a wire, a dark metal shade that hides the
 * bulb, and a glowing rim where the light spills out. Shared so the How We Work phases hang the
 * same lamp. It is a night-scene object, so it keeps its own colours in both themes.
 * `idPrefix` keeps the gradient ids unique if two lamps are ever on one page.
 */
export function PendantLamp({
  ref,
  className,
  title,
  idPrefix = "lamp",
}: {
  ref?: Ref<SVGSVGElement>;
  className?: string;
  title?: string;
  idPrefix?: string;
}) {
  const metal = `${idPrefix}-shade-metal`;
  const rim = `${idPrefix}-rim-light`;
  return (
    <svg ref={ref} className={className} viewBox="0 0 120 220" fill="none" aria-hidden={title ? undefined : true}>
      {title && <title>{title}</title>}
      <defs>
        <linearGradient id={metal} x1="0" x2="1">
          <stop offset="0" stopColor="#0c0e12" />
          <stop offset="0.45" stopColor="#2a2f38" />
          <stop offset="0.6" stopColor="#1a1e25" />
          <stop offset="1" stopColor="#0a0c10" />
        </linearGradient>
        <radialGradient id={rim} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#fff3dc" />
          <stop offset="0.6" stopColor="#ffc884" stopOpacity="0.9" />
          <stop offset="1" stopColor="#ff9a4a" stopOpacity="0" />
        </radialGradient>
      </defs>
      <path d="M60 0 V150" stroke="#14171c" strokeWidth="1.6" />
      <rect x="55" y="146" width="10" height="12" rx="2" fill="#1c2027" stroke="#2c323c" strokeWidth="0.8" />
      <path
        d="M54 158 C44 160 38 168 36 178 L22 206 C21 208 23 210 26 210 H94 C97 210 99 208 98 206 L84 178 C82 168 76 160 66 158 Z"
        fill={`url(#${metal})`}
        stroke="#2f3540"
        strokeWidth="1"
      />
      <path d="M40 178 C46 168 52 163 58 162" stroke="#4b5363" strokeWidth="1" strokeLinecap="round" opacity="0.6" />
      <ellipse cx="60" cy="210" rx="36" ry="2.6" fill={`url(#${rim})`} />
    </svg>
  );
}
