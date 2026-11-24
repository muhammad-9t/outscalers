import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { PortfolioProject } from "@/content/portfolio";
import { CaseArt } from "@/components/illustrations/case-art";

/** One product as a compact card: screenshot, product name, one-line title, and a link to its page. */
function ProjectCard({ project }: { project: PortfolioProject }) {
  if (!project.caseStudy) return null;
  return (
    <Link href={`/case-studies/${project.slug}`} className="card card-interactive group flex h-full flex-col overflow-hidden">
      <div className="relative border-b border-line bg-ink-900/60 p-4">
        <CaseArt study={project.caseStudy} />
      </div>
      <div className="flex flex-1 flex-col px-5 py-4">
        <p className="text-xs font-medium text-fg-subtle">{project.industry}</p>
        <h3 className="mt-1.5 text-base font-semibold leading-snug line-clamp-2">{project.name}</h3>
        <span className="mt-auto inline-flex items-center gap-1 pt-3 text-xs font-semibold text-brand-300">
          View product
          <ArrowUpRight aria-hidden className="size-3.5 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </span>
      </div>
    </Link>
  );
}

/**
 * Quick index of all products. Below lg: a normal grid. On lg (inside the portfolio laptop): one
 * horizontal row the page scroll slides through; cards size off the row's height (cqh) so a whole
 * card always fits.
 */
export function PortfolioGrid({ projects }: { projects: PortfolioProject[] }) {
  return (
    <div className="lg:flex lg:min-h-0 lg:flex-1 lg:flex-col">
      {/* Bleeds to the laptop screen edges (cancels the screen's 3% padding, which is 3/94 of this box); the track puts it back as inner padding */}
      <div data-track-viewport className="lg:mx-[-3.1915%] lg:min-h-0 lg:flex-1 lg:overflow-hidden lg:[container-type:size]">
        <ul data-track className="grid gap-4 md:grid-cols-2 lg:flex lg:h-full lg:w-max lg:px-[3%] lg:will-change-transform">
          {projects.map((p) => (
            <li key={p.slug} className="animate-fade-up lg:h-full lg:w-[74cqh] lg:min-w-56 lg:shrink-0">
              <ProjectCard project={p} />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
