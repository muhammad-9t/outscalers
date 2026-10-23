import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { CaseStudy } from "@/content/case-studies";
import { CaseVisual } from "@/components/illustrations/case-visual";

export function CaseStudyCard({ study }: { study: CaseStudy }) {
  return (
    <Link href={`/case-studies/${study.slug}`} className="card card-interactive group flex h-full flex-col overflow-hidden">
      <div className="relative border-b border-line bg-ink-900/60 p-4">
        <CaseVisual visual={study.visual} />
        {study.status === "draft" && (
          <span className="absolute right-3 top-3 rounded-full border border-brand-300/40 bg-ink-950/80 px-2.5 py-1 font-mono text-[10px] uppercase tracking-wide text-brand-300">
            Draft profile
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-6">
        <p className="font-mono text-xs uppercase tracking-wider text-fg-subtle">{study.client ?? study.industry}</p>
        <h3 className="mt-3 text-lg font-semibold leading-snug">{study.title}</h3>
        <p className="mt-3 flex-1 text-[0.9375rem] leading-relaxed text-fg-muted">{study.summary}</p>
        <ul className="mt-5 flex flex-wrap gap-1.5" aria-label="Technologies">
          {study.stack.slice(0, 3).map((t) => (
            <li key={t} className="chip !py-0.5 text-xs">
              {t}
            </li>
          ))}
        </ul>
        <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-300">
          Read case study
          <ArrowUpRight aria-hidden className="size-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </span>
      </div>
    </Link>
  );
}
