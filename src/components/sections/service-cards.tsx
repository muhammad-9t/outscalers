import type { CSSProperties } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { services, serviceHref, type ServiceSlug } from "@/content/services";
import { ServiceGlyph } from "@/components/illustrations/service-glyph";
import { cn } from "@/lib/cn";

/** Service cards. The whole card is one link; the heading carries the accessible name. */
export function ServiceCard({ slug, index, className }: { slug: ServiceSlug; index?: number; className?: string }) {
  const s = services.find((x) => x.slug === slug)!;
  return (
    <Link
      href={serviceHref(slug)}
      className={cn("card card-interactive group flex h-full flex-col overflow-hidden p-6 sm:p-7", className)}
    >
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-400/0 to-transparent transition-colors duration-500 group-hover:via-brand-400/70" />
      <div className="flex items-start justify-between">
        <span className="grid size-12 place-items-center rounded-xl border border-line-strong bg-ink-800 text-brand-300 transition-colors duration-300 group-hover:border-brand-500/50 group-hover:bg-brand-500/10">
          <ServiceGlyph slug={slug} className="size-6" />
        </span>
        {index !== undefined && (
          <span aria-hidden className="font-mono text-xs text-fg-subtle">
            0{index + 1}
          </span>
        )}
      </div>
      <h3 className="mt-6 text-xl font-semibold">{s.title}</h3>
      <p className="mt-3 flex-1 text-[0.9375rem] leading-relaxed text-fg-muted">{s.summary}</p>
      <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-300">
        Explore service
        <ArrowUpRight aria-hidden className="size-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
      </span>
    </Link>
  );
}

export function RelatedServices({ slugs }: { slugs: ServiceSlug[] }) {
  return (
    <ul className="grid gap-5 md:grid-cols-3">
      {slugs.map((slug, i) => (
        <li key={slug} data-reveal style={{ "--reveal-delay": `${i * 80}ms` } as CSSProperties}>
          <ServiceCard slug={slug} />
        </li>
      ))}
    </ul>
  );
}
