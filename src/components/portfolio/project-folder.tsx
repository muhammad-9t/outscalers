import Image from "next/image";
import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import { ArrowUpRight } from "lucide-react";
import type { PortfolioProject } from "@/content/portfolio";

const badgeLabel = { sample: "Sample", draft: "Draft", published: null } as const;

/** Up to three distinct screenshots for the folder: the cover first, then the gallery. */
function folderImages(project: PortfolioProject) {
  const cs = project.caseStudy;
  const all = [cs?.cover, ...(cs?.gallery ?? [])].filter((x): x is NonNullable<typeof x> => Boolean(x));
  const seen = new Set<string>();
  return all.filter((img) => !seen.has(img.src) && seen.add(img.src)).slice(0, 3);
}

/**
 * A featured project as a folder object: a dark back with a tab, the project's screenshots sticking
 * out of the top, and a short frosted glass front flap carrying only the project name. On hover or
 * keyboard focus the flap tips open, the screenshots rise and fan out, and "View case study" appears.
 * The whole folder links to the case study. Styles: .pf-* in globals.css.
 */
export function ProjectFolder({ project, index, total }: { project: PortfolioProject; index: number; total: number }) {
  const badge = badgeLabel[project.status];
  const images = folderImages(project);
  const count = `${String(index + 1).padStart(2, "0")} / ${String(total).padStart(2, "0")}`;
  const href = project.caseStudy ? `/case-studies/${project.slug}` : null;

  const body: ReactNode = (
    <>
      <span className="pf-back" aria-hidden />

      <span className="pf-papers" aria-hidden>
        {images.length > 0
          ? images.map((img, i) => (
              <span key={img.src} className="pf-paper" style={{ "--i": i, "--n": images.length } as CSSProperties}>
                <Image src={img.src} alt="" fill sizes="(min-width: 1024px) 16rem, 60vw" className="object-cover object-top" />
              </span>
            ))
          : [0, 1, 2].map((i) => (
              <span key={i} className="pf-paper pf-paper-blank" style={{ "--i": i, "--n": 3 } as CSSProperties}>
                <span />
                <span />
                <span />
              </span>
            ))}
      </span>

      <span className="pf-front">
        <span className="flex items-center gap-2">
          <span className="pf-count">{count}</span>
          {badge && <span className="pf-count">{badge}</span>}
        </span>
        <span className="mt-auto flex items-end justify-between gap-3">
          <span className="pf-name">{project.industry}</span>
          <span className="pf-cta" aria-hidden>
            {href ? "View product" : "Coming soon"}
            {href && <ArrowUpRight className="size-4" />}
          </span>
        </span>
      </span>
    </>
  );

  return href ? (
    <Link href={href} className="pf mx-auto lg:mx-0" aria-label={`${project.name}. View product`}>
      {body}
    </Link>
  ) : (
    <div className="pf mx-auto lg:mx-0" role="group" aria-label={project.name}>
      {body}
    </div>
  );
}
