import type { CSSProperties } from "react";
import Link from "next/link";
import { ArrowUpRight, Check } from "lucide-react";
import { ServiceGlyph } from "@/components/illustrations/service-glyph";
import { serviceHref, type Service } from "@/content/services";

const tones = ["brand", "human", "data"] as const;

/** Where each deliverable starts before it flies into the grid (a golden-angle spread), in rem. */
function scatter(i: number) {
  const a = (i * 137.5 * Math.PI) / 180;
  const r = 16 + (i % 3) * 5;
  return {
    "--i": i,
    "--sx": `${(Math.cos(a) * r).toFixed(2)}rem`,
    "--sy": `${(Math.sin(a) * r * 0.65).toFixed(2)}rem`,
    "--sr": `${(i % 2 ? 1 : -1) * (28 + i * 9)}deg`,
  } as CSSProperties;
}

/**
 * One service as a full-screen slide in the services horizontal scroll, animated by the slide
 * itself (HorizontalScroll `trackProgress` writes --p / --ap): a giant outlined word drifts behind
 * in parallax, the glossy tile spins in, the title glides, and the deliverables fly in from a
 * scatter, tumbling in 3D, and lock into a grid exactly as the panel centres, then scatter again as
 * it leaves. Alternate panels are mirrored. Short copy on purpose: tagline + deliverable names.
 * Styles: .svp-* in globals.css.
 */
export function ServicePanel({ service: s, index, total }: { service: Service; index: number; total: number }) {
  const tone = tones[index % tones.length];
  return (
    <li className="svp relative w-full shrink-0" data-tone={tone} data-side={index % 2 ? "rev" : undefined}>
      <span aria-hidden className="svp-word">
        {s.shortTitle}
      </span>
      <div className="container-site svp-inner">
        <div className="svp-text">
          <div className="flex items-center gap-4">
            <span className="hs-gloss svp-tile" data-tone={tone} aria-hidden>
              <ServiceGlyph slug={s.slug} className="size-[46%]" />
            </span>
            <p className="eyebrow">
              Service {index + 1} of {total}
            </p>
          </div>
          <h3 className="svp-title text-display-lg font-semibold">
            <Link href={serviceHref(s.slug)} className="transition-colors hover:text-brand-200">
              {s.title}
            </Link>
          </h3>
          <p className="svp-line text-lead text-fg-muted">{s.tagline}.</p>
          <Link href={serviceHref(s.slug)} className="link-arrow svp-link" aria-label={`Explore ${s.title}`}>
            Explore service <ArrowUpRight aria-hidden className="size-4" />
          </Link>
        </div>

        <div className="svp-deck">
          <span aria-hidden className="svp-glow" />
          <ul className="svp-chips" aria-label={`What we deliver in ${s.shortTitle}`}>
            {s.deliverables.map((d, i) => (
              <li key={d.title} className="svp-chip" style={scatter(i)}>
                <span className="svp-check" aria-hidden>
                  <Check className="size-3.5" strokeWidth={2.6} />
                </span>
                {d.title}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </li>
  );
}
