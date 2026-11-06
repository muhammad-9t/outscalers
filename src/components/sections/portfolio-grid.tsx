"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { PortfolioProject } from "@/content/portfolio";
import { services, type ServiceSlug } from "@/content/services";
import { CaseArt } from "@/components/illustrations/case-art";
import { ServiceGlyph } from "@/components/illustrations/service-glyph";
import { cn } from "@/lib/cn";

const badgeLabel = { sample: "Sample project", draft: "Draft profile", published: null } as const;

/** Placeholder artwork for projects without a case-study diagram: a browser frame with the service glyph. */
function ProjectVisual({ service }: { service: ServiceSlug }) {
  return (
    <div className="bg-dots grid aspect-[400/220] place-items-center rounded-lg">
      <div className="w-3/4 overflow-hidden rounded-lg border border-line-strong bg-ink-900 shadow-lg">
        <div className="flex h-5 items-center gap-1 border-b border-line px-2">
          <span className="size-1.5 rounded-full bg-line-strong" />
          <span className="size-1.5 rounded-full bg-line-strong" />
          <span className="size-1.5 rounded-full bg-line-strong" />
        </div>
        <div className="flex items-center gap-4 p-4">
          <span className="grid size-12 shrink-0 place-items-center rounded-xl border border-brand-500/30 bg-brand-500/10">
            <ServiceGlyph slug={service} className="size-6 text-brand-400" />
          </span>
          <span className="flex-1 space-y-2">
            <span className="block h-2 w-4/5 rounded bg-ink-700" />
            <span className="block h-2 w-3/5 rounded bg-ink-700" />
            <span className="block h-2 w-2/3 rounded bg-ink-800" />
          </span>
        </div>
      </div>
    </div>
  );
}

function ProjectCard({ project }: { project: PortfolioProject }) {
  const badge = badgeLabel[project.status];
  const body = (
    <>
      <div className="relative border-b border-line bg-ink-900/60 p-4">
        {project.caseStudy ? <CaseArt study={project.caseStudy} /> : <ProjectVisual service={project.services[0]} />}
        {badge && (
          <span className="absolute right-3 top-3 rounded-full border border-brand-300/40 bg-ink-950/80 px-2.5 py-1 font-mono text-[10px] uppercase tracking-wide text-brand-300">
            {badge}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col px-5 py-4">
        <p className="font-mono text-[10.5px] uppercase tracking-wider text-fg-subtle">{project.industry}</p>
        <h3 className="mt-1.5 text-base font-semibold leading-snug short:line-clamp-2">{project.name}</h3>
        <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-fg-muted short:hidden">{project.summary}</p>
        <div className="mt-auto flex flex-col items-start gap-2 pt-3">
          <ul className="flex flex-wrap gap-1" aria-label="Technologies">
            {project.stack.slice(0, 3).map((t, i) => (
              <li key={t} className={cn("chip px-2! py-0! text-[11px]", i === 2 && "short:hidden")}>
                {t}
              </li>
            ))}
          </ul>
          {project.caseStudy ? (
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-brand-300">
              Case study
              <ArrowUpRight aria-hidden className="size-3.5 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </span>
          ) : (
            <span className="text-xs text-fg-subtle">Coming soon</span>
          )}
        </div>
      </div>
    </>
  );

  return project.caseStudy ? (
    <Link href={`/case-studies/${project.slug}`} className="card card-interactive group flex h-full flex-col overflow-hidden">
      {body}
    </Link>
  ) : (
    <article className="card flex h-full flex-col overflow-hidden">{body}</article>
  );
}

export function PortfolioGrid({ projects }: { projects: PortfolioProject[] }) {
  const [filter, setFilter] = useState<ServiceSlug | "all">("all");
  const shown = filter === "all" ? projects : projects.filter((p) => p.services.includes(filter));
  const options = [
    { slug: "all" as const, label: "All projects" },
    ...services.filter((s) => projects.some((p) => p.services.includes(s.slug))).map((s) => ({ slug: s.slug, label: s.shortTitle })),
  ];

  // Below lg: a normal grid. On lg (inside the portfolio laptop): one horizontal row the page
  // scroll slides through; cards size off the row's height (cqh) so a whole card always fits.
  return (
    <div className="lg:flex lg:min-h-0 lg:flex-1 lg:flex-col">
      <div role="group" aria-label="Filter by service" className="mb-8 flex flex-wrap gap-2 lg:mb-[2.5%] lg:gap-1.5">
        {options.map((o) => (
          <button
            key={o.slug}
            type="button"
            aria-pressed={filter === o.slug}
            onClick={() => setFilter(o.slug)}
            className={cn(
              "chip cursor-pointer transition-colors hover:border-brand-500/50 hover:text-fg lg:text-[12.5px]",
              filter === o.slug && "border-brand-400! bg-brand-500/10 text-fg!",
            )}
          >
            {o.slug !== "all" && <ServiceGlyph slug={o.slug} className="size-3.5 text-brand-400 short:hidden" />}
            {o.label}
          </button>
        ))}
      </div>
      <p aria-live="polite" className="sr-only">
        {shown.length} projects shown
      </p>
      {/* Bleeds to the laptop screen edges (cancels the screen's 3% padding, which is 3/94 of this box); the track puts it back as inner padding */}
      <div data-track-viewport className="lg:mx-[-3.1915%] lg:min-h-0 lg:flex-1 lg:overflow-hidden lg:[container-type:size]">
        <ul data-track className="grid gap-4 md:grid-cols-2 lg:flex lg:h-full lg:w-max lg:px-[3%] lg:will-change-transform">
          {shown.map((p) => (
            <li key={p.slug} className="animate-fade-up lg:h-full lg:w-[74cqh] lg:min-w-56 lg:shrink-0">
              <ProjectCard project={p} />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
