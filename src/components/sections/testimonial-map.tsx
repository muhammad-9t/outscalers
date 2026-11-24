import type { CSSProperties } from "react";
import { testimonials, type Testimonial } from "@/content/testimonials";

/**
 * Testimonials as a world of people: avatars are laid out in rough continent shapes,
 * with smaller "people" circles filling out the map and dashed lines joining near
 * neighbours. When the map scrolls into view every circle pops in with a spring, in a wave
 * from the centre; hovering (or focusing) an avatar grows it and opens its quote.
 * CSS only (see .tm-* in globals.css).
 */

type Size = "xs" | "sm" | "md";
type Slot = { x: number; y: number; size?: Size; city?: string };

/** Hand-placed so nothing overlaps. `city` slots hold the testimonial from that city. */
const slots: Slot[] = [
  // North America
  { x: 7, y: 26, size: "xs" }, { x: 13, y: 14, size: "sm" }, { x: 19, y: 31, city: "Toronto" }, { x: 25, y: 15, size: "sm" },
  { x: 31, y: 8, size: "xs" }, { x: 33, y: 27, city: "New York" }, { x: 11, y: 43, size: "sm" }, { x: 23, y: 47, size: "md" },
  { x: 29, y: 39, size: "xs" }, { x: 20, y: 59, size: "xs" },
  // South America
  { x: 28, y: 62, size: "md" }, { x: 33, y: 71, size: "sm" }, { x: 29, y: 81, size: "sm" }, { x: 35, y: 85, size: "xs" }, { x: 31, y: 93, size: "xs" },
  // Europe
  { x: 45, y: 20, city: "London" }, { x: 50, y: 9, size: "sm" }, { x: 51, y: 25, city: "Amsterdam" }, { x: 57, y: 14, city: "Berlin" },
  { x: 55, y: 32, city: "Munich" }, { x: 62, y: 7, size: "xs" }, { x: 44, y: 34, size: "xs" },
  // Africa
  { x: 47, y: 48, size: "md" }, { x: 54, y: 45, size: "sm" }, { x: 50, y: 60, size: "sm" }, { x: 58, y: 58, size: "md" },
  { x: 54, y: 73, size: "md" }, { x: 60, y: 80, size: "xs" },
  // Middle East
  { x: 61, y: 41, city: "Riyadh" }, { x: 67, y: 33, city: "Dubai" }, { x: 63, y: 23, size: "xs" },
  // South & East Asia
  { x: 72, y: 20, city: "Islamabad" }, { x: 76, y: 31, city: "Lahore" }, { x: 79, y: 10, size: "sm" }, { x: 85, y: 21, size: "md" },
  { x: 91, y: 12, size: "xs" }, { x: 94, y: 27, size: "sm" }, { x: 88, y: 36, size: "xs" }, { x: 80, y: 45, size: "sm" }, { x: 71, y: 51, size: "xs" },
  // South-East Asia & Oceania
  { x: 85, y: 56, city: "Singapore" }, { x: 91, y: 65, size: "xs" }, { x: 80, y: 71, size: "sm" }, { x: 87, y: 80, city: "Sydney" }, { x: 94, y: 87, size: "xs" },
];

/** Stage proportions (width / height) */
const ASPECT = 1.9;
const tones = ["human", "brand", "data"] as const;

/** Pop-in delay: a wave that starts in the middle of the map */
const delay = (x: number, y: number) => Math.round(Math.hypot(x - 50, (y - 45) / ASPECT) * 22);

/**
 * Crowd photos for the decorative circles. These are AI-generated faces of people who do not
 * exist (thispersondoesnotexist.com), so no real person's likeness is used. Quoted avatars use
 * the `photo` from testimonials.ts (initials when none is set).
 */
const CROWD_PHOTOS = 33;
let crowd = 0;

const nodes = slots.map((s, i) => ({
  ...s,
  d: delay(s.x, s.y),
  tone: tones[i % tones.length],
  person: s.city ? testimonials.find((t) => t.city === s.city) : undefined,
  face: s.city ? undefined : `/testimonials/crowd/${String((crowd++ % CROWD_PHOTOS) + 1).padStart(2, "0")}.webp`,
}));

/** Each node links to its two nearest neighbours */
const links = (() => {
  const seen = new Set<string>();
  const out: { a: (typeof nodes)[number]; b: (typeof nodes)[number] }[] = [];
  const dist = (a: Slot, b: Slot) => Math.hypot(a.x - b.x, (a.y - b.y) / ASPECT);
  nodes.forEach((a, i) => {
    nodes
      .map((b, j) => ({ j, d: dist(a, b) }))
      .filter(({ j, d }) => j !== i && d < 10)
      .sort((p, q) => p.d - q.d)
      .slice(0, 2)
      .forEach(({ j }) => {
        const key = i < j ? `${i}-${j}` : `${j}-${i}`;
        if (!seen.has(key)) {
          seen.add(key);
          out.push({ a, b: nodes[j] });
        }
      });
  });
  return out;
})();

const initials = (name: string) =>
  name
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

const pos = (x: number, y: number, d: number) => ({ "--x": x, "--y": y, "--d": `${d}ms` }) as CSSProperties;

function Person({ p, x, y, d, tone, i }: { p: Testimonial; x: number; y: number; d: number; tone: string; i: number }) {
  const id = `tm-quote-${i}`;
  // Keep the quote card inside the map: anchor it by the side the avatar is on, and open it
  // below avatars near the top
  const align = x < 25 ? "start" : x > 75 ? "end" : "center";
  return (
    <li className="tm-node" data-tone={tone} data-size={p.featured ? "featured" : "person"} style={pos(x, y, d)}>
      <span className="tm-pop">
        <button type="button" className="tm-avatar" aria-describedby={id} aria-label={`${p.name}, ${p.role}, ${p.city}`}>
          {p.photo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={p.photo} alt="" className="size-full rounded-full object-cover" />
          ) : (
            initials(p.name)
          )}
        </button>
      </span>
      <figure id={id} role="tooltip" className="tm-card" data-align={align} data-below={y < 40 ? "" : undefined}>
        <blockquote className="text-sm leading-relaxed text-fg">“{p.quote}”</blockquote>
        <figcaption className="mt-3 text-sm">
          <span className="font-semibold text-fg">{p.name}</span>
          <span className="block text-fg-muted">
            {p.role} · {p.city}
          </span>
        </figcaption>
      </figure>
    </li>
  );
}

export function TestimonialMap() {
  return (
    // Phones scroll the map sideways inside its own box; the page itself never scrolls sideways
    <div className="-mx-4 overflow-x-auto px-4 py-2 sm:mx-0 sm:overflow-visible sm:px-0">
      <div data-reveal className="tm-stage relative min-w-[680px]" style={{ aspectRatio: ASPECT }}>
        <svg aria-hidden className="absolute inset-0 size-full overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none">
          {links.map(({ a, b }, i) => (
            <line
              key={i}
              className="tm-link"
              x1={a.x}
              y1={a.y}
              x2={b.x}
              y2={b.y}
              vectorEffect="non-scaling-stroke"
              style={{ "--d": `${Math.max(a.d, b.d) + 300}ms` } as CSSProperties}
            />
          ))}
        </svg>

        <ul aria-label="Client testimonials">
          {nodes.map((n, i) =>
            n.person ? (
              <Person key={i} p={n.person} x={n.x} y={n.y} d={n.d} tone={n.tone} i={i} />
            ) : (
              <li key={i} aria-hidden className="tm-node" data-tone={n.tone} data-size={n.size} style={pos(n.x, n.y, n.d)}>
                <span className="tm-pop">
                  <span className="tm-avatar tm-filler">
                    {/* eslint-disable-next-line @next/next/no-img-element -- 128px decorative thumbnails */}
                    <img src={n.face} alt="" loading="lazy" decoding="async" className="size-full rounded-full object-cover" />
                  </span>
                </span>
              </li>
            ),
          )}
        </ul>
      </div>
    </div>
  );
}
