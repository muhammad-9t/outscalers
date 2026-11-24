import type { CSSProperties } from "react";
import Link from "next/link";
import { ArrowUpRight, Bot, Cloud, CodeXml, type LucideIcon, ShieldCheck, Users, Workflow } from "lucide-react";
import { ServiceGlyph } from "@/components/illustrations/service-glyph";
import { services, serviceHref, type ServiceSlug } from "@/content/services";

/**
 * Home "What we build with you" stage: four big staggered words on a grid, with a tilted pill
 * for every service laid over them and glossy 3D-style icon tiles floating around. When the
 * stage scrolls into view the words rise one by one, the pills drop in with a spring and the
 * icons pop, then keep floating. Phones get the words with the pills as a wrapped list below.
 * Styles: .svc-* in globals.css.
 */

const words = ["Build.", "Automate.", "Secure.", "Scale."];

/** Pill placement on large screens (% of the stage) and tilt */
const pillPos: Record<ServiceSlug | "team", { x: number; y: number; r: number; tone: "ink" | "brand" }> = {
  "ai-solutions": { x: 8, y: 23, r: -5, tone: "ink" },
  "software-development": { x: 55, y: 18, r: 4, tone: "brand" },
  automation: { x: 27, y: 47, r: -3, tone: "brand" },
  "data-cloud": { x: 63, y: 52, r: 5, tone: "ink" },
  "security-quality": { x: 12, y: 75, r: 4, tone: "ink" },
  team: { x: 52, y: 80, r: -4, tone: "brand" },
};

/** Floating icon tiles: position (% of the stage), size, tilt, colour and float timing */
const objects: { icon: LucideIcon; x: number; y: number; s: number; r: number; tone: "brand" | "human" | "data"; t: number }[] = [
  { icon: Bot, x: 3, y: 4, s: 4.5, r: -12, tone: "brand", t: 0 },
  { icon: CodeXml, x: 80, y: 2, s: 4, r: 10, tone: "human", t: 1.2 },
  { icon: Workflow, x: 90, y: 36, s: 3.5, r: 14, tone: "data", t: 0.6 },
  { icon: Cloud, x: 1, y: 50, s: 3.5, r: -8, tone: "human", t: 1.8 },
  { icon: ShieldCheck, x: 86, y: 72, s: 4.5, r: -10, tone: "brand", t: 0.9 },
  { icon: Users, x: 36, y: 90, s: 3.25, r: 8, tone: "data", t: 2.2 },
];

export function ServicesStage() {
  const items = [
    ...services.map((s) => ({ key: s.slug as ServiceSlug | "team", href: serviceHref(s.slug), title: s.title, text: s.tagline, slug: s.slug })),
    { key: "team" as const, href: "/services/dedicated-developers", title: "Dedicated developers", text: "Engineers who join your team and tools", slug: undefined },
  ];

  return (
    <div data-reveal suppressHydrationWarning className="svc-stage relative mt-10 overflow-hidden">
      <div aria-hidden className="bg-grid pointer-events-none absolute inset-0 opacity-70" />
      {/* Warm radial lighting, as in the hero (cool sky/indigo in light mode) */}
      <div aria-hidden className="svc-glow svc-glow-a" />
      <div aria-hidden className="svc-glow svc-glow-b" />

      {/* Big words (decorative: the services themselves are the links below) */}
      <div aria-hidden className="svc-words relative flex flex-col items-center">
        {words.map((w, i) => (
          <span key={w} className="svc-word" style={{ "--i": i } as CSSProperties}>
            {w}
          </span>
        ))}
      </div>

      {/* Floating 3D icon tiles */}
      {objects.map((o, i) => (
        <span
          key={i}
          aria-hidden
          className="svc-object"
          data-tone={o.tone}
          style={{ "--x": `${o.x}%`, "--y": `${o.y}%`, "--s": `${o.s}rem`, "--r": `${o.r}deg`, "--t": `${o.t}s`, "--i": i } as CSSProperties}
        >
          <span className="svc-object-face">
            <o.icon className="size-[45%]" strokeWidth={1.8} />
          </span>
        </span>
      ))}

      {/* Services as tilted pills */}
      <ul aria-label="Services" className="svc-pills">
        {items.map((s, i) => {
          const p = pillPos[s.key];
          return (
            <li
              key={s.key}
              className="svc-pill-wrap"
              style={{ "--x": `${p.x}%`, "--y": `${p.y}%`, "--r": `${p.r}deg`, "--i": i } as CSSProperties}
            >
              <Link href={s.href} className="svc-pill group" data-tone={p.tone}>
                <span className="svc-pill-icon" aria-hidden>
                  {s.slug ? <ServiceGlyph slug={s.slug} className="size-4" /> : <Users className="size-4" />}
                </span>
                <span>
                  <span className="block font-semibold">{s.title}</span>
                  <span className="svc-pill-text block">{s.text}</span>
                </span>
                <ArrowUpRight aria-hidden className="size-4 shrink-0 opacity-70 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
