import Link from "next/link";
import type { ReactNode } from "react";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/cn";

export type Crumb = { label: string; href: string };

/** Hero for inner pages: breadcrumb, headline, lead, actions and an optional visual. */
export function PageHero({
  eyebrow,
  title,
  lead,
  crumbs,
  actions,
  visual,
  bare,
  className,
}: {
  eyebrow: string;
  title: ReactNode;
  lead: ReactNode;
  crumbs?: Crumb[];
  actions?: ReactNode;
  visual?: ReactNode;
  /** No background of its own (grid, glow, fill), for pages that draw one behind the hero. */
  bare?: boolean;
  className?: string;
}) {
  return (
    <section className={cn("relative overflow-hidden pb-16 pt-28 sm:pb-20 lg:pb-24 lg:pt-36", !bare && "bg-ink-950", className)}>
      {!bare && <div aria-hidden className="bg-grid pointer-events-none absolute inset-0 opacity-50" />}
      {!bare && <div aria-hidden className="glow-brand pointer-events-none absolute -right-40 -top-40 size-[36rem] opacity-60" />}
      <div className="container-site relative">
        {crumbs && (
          <nav aria-label="Breadcrumb" className="mb-8">
            <ol className="flex flex-wrap items-center gap-1.5 text-sm text-fg-subtle">
              {crumbs.map((c, i) => (
                <li key={c.href} className="flex items-center gap-1.5">
                  {i > 0 && <ChevronRight aria-hidden className="size-3.5" />}
                  {i === crumbs.length - 1 ? (
                    <span aria-current="page" className="text-fg-muted">
                      {c.label}
                    </span>
                  ) : (
                    <Link href={c.href} className="transition-colors hover:text-fg">
                      {c.label}
                    </Link>
                  )}
                </li>
              ))}
            </ol>
          </nav>
        )}
        <div className={cn("grid items-center gap-12", Boolean(visual) && "lg:grid-cols-[1.05fr_1fr] lg:gap-16")}>
          <div>
            <p className="eyebrow mb-5">{eyebrow}</p>
            <h1 className="text-display-lg font-semibold">{title}</h1>
            <p className="mt-6 max-w-2xl text-lead text-fg-muted">{lead}</p>
            {actions && <div className="mt-9 flex flex-wrap gap-3">{actions}</div>}
          </div>
          {visual && (
            <div data-reveal className="relative">
              {visual}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
