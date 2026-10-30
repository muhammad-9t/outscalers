import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { ServiceGlyph } from "@/components/illustrations/service-glyph";
import { serviceHref, type Service } from "@/content/services";

/**
 * One service as a full-screen HUD panel: grid background, targeting ring around the glyph,
 * and the deliverables in a framed readout. Used as a slide in the services horizontal scroll.
 */
export function ServicePanel({ service: s, index, total }: { service: Service; index: number; total: number }) {
  const n = String(index + 1).padStart(2, "0");
  return (
    <li className="relative w-full shrink-0 overflow-hidden border-b border-line py-16 sm:py-20 lg:flex lg:h-full lg:items-center lg:border-b-0 lg:py-0 lg:pt-18">
      {/* Grid lines, fading out toward the edges */}
      <div
        aria-hidden
        className="bg-grid pointer-events-none absolute inset-0 opacity-70 mask-[radial-gradient(ellipse_70%_65%_at_60%_50%,black,transparent)]"
      />
      {/* Oversized index behind the content */}
      <span
        aria-hidden
        className="pointer-events-none absolute -right-6 bottom-0 font-display text-[clamp(10rem,24vw,22rem)] leading-none font-semibold text-fg/[0.03] select-none"
      >
        {n}
      </span>

      <div className="container-site relative grid w-full items-center gap-12 lg:grid-cols-[1.1fr_1fr] lg:gap-20">
        <div>
          <p className="font-mono text-[11px] tracking-[0.18em] text-brand-300 uppercase">
            {`Service ${n} / ${String(total).padStart(2, "0")} // ${s.shortTitle}`}
          </p>

          {/* Glyph inside a spinning targeting ring */}
          <div className="relative mt-8 grid size-20 place-items-center">
            <span
              aria-hidden
              className="absolute inset-0 rounded-full border border-dashed border-brand-400/50 motion-safe:animate-[spin_14s_linear_infinite]"
            />
            <span aria-hidden className="absolute inset-2.5 rounded-full border border-line-strong" />
            <span className="grid size-12 place-items-center rounded-full bg-ink-850 text-brand-300 shadow-[0_0_30px_-6px_var(--color-brand-500)]">
              <ServiceGlyph slug={s.slug} className="size-6" />
            </span>
          </div>

          <h3 className="mt-8 text-display-lg font-semibold">
            <Link href={serviceHref(s.slug)} className="transition-colors hover:text-brand-200">
              {s.title}
            </Link>
          </h3>
          <p className="mt-5 max-w-xl text-lead text-fg-muted">{s.summary}</p>
          <Link href={serviceHref(s.slug)} className="link-arrow mt-8" aria-label={`Explore ${s.title}`}>
            Explore service <ArrowUpRight aria-hidden className="size-4" />
          </Link>
        </div>

        {/* Deliverables as a framed HUD readout */}
        <div className="relative border border-line bg-ink-950/60 p-6 backdrop-blur-sm sm:p-7">
          <span aria-hidden className="absolute -top-px -left-px size-3 border-t-2 border-l-2 border-brand-400" />
          <span aria-hidden className="absolute -right-px -bottom-px size-3 border-r-2 border-b-2 border-brand-400" />
          {/* Scan line sweeping the readout */}
          <span aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-px overflow-hidden">
            <span className="block h-full w-1/3 bg-brand-400/70 motion-safe:animate-[hud-scan_3.2s_ease-in-out_infinite]" />
          </span>
          <p className="flex items-center gap-2 font-mono text-[10px] tracking-[0.18em] text-fg-subtle uppercase">
            <span aria-hidden className="size-1.5 rounded-full bg-brand-400 motion-safe:animate-pulse" />
            What we deliver
          </p>
          <ul className="mt-5 divide-y divide-line">
            {s.deliverables.map((d, i) => (
              <li key={d.title} className="group flex items-center gap-4 py-3">
                <span className="font-mono text-xs text-brand-300/80">{String(i + 1).padStart(2, "0")}</span>
                <span className="text-[0.9375rem] text-fg">{d.title}</span>
                <span
                  aria-hidden
                  className="ml-auto h-px w-6 bg-line-strong transition-[width,background-color] duration-300 group-hover:w-10 group-hover:bg-brand-400"
                />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </li>
  );
}
