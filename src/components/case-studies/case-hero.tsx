import type { CSSProperties } from "react";
import Link from "next/link";
import { ArrowUpRight, Building2, ChevronRight, Code2, FileClock, Globe, Layers } from "lucide-react";
import type { CaseStudy } from "@/content/case-studies";
import { serviceHref, type Service } from "@/content/services";
import { ProductLaptop } from "@/components/illustrations/product-laptop";
import { CaseArt } from "@/components/illustrations/case-art";

const d = (i: number) => ({ "--i": i }) as CSSProperties;

/**
 * Case study hero: a product stage. Centred title and summary, then the product itself (the
 * draggable 3D laptop, or the case diagram) with four glass fact cards floating around it:
 * client, services, technology and the live link (or the draft status). On phones the facts sit
 * in a grid under the product. Styles: .csh-* in globals.css.
 */
export function CaseHero({ study, services }: { study: CaseStudy; services: Service[] }) {
  const site = study.url && (study.urlLabel ?? study.url.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, ""));
  return (
    <section className="csh relative overflow-hidden bg-ink-950 pb-16 pt-28 sm:pb-20 lg:pt-36">
      <div aria-hidden className="csh-glow" />
      <div className="container-site relative">
        <nav aria-label="Breadcrumb" className="flex justify-center">
          <ol className="flex flex-wrap items-center gap-1.5 text-sm text-fg-subtle">
            <li className="flex items-center gap-1.5">
              <Link href="/" className="transition-colors hover:text-fg">
                Home
              </Link>
            </li>
            <li className="flex items-center gap-1.5">
              <ChevronRight aria-hidden className="size-3.5" />
              <Link href="/portfolio" className="transition-colors hover:text-fg">
                Portfolio
              </Link>
            </li>
            <li className="flex items-center gap-1.5">
              <ChevronRight aria-hidden className="size-3.5" />
              <span aria-current="page" className="text-fg-muted">
                {study.client ?? study.industry}
              </span>
            </li>
          </ol>
        </nav>

        <div className="mx-auto mt-8 max-w-4xl text-center">
          <p className="eyebrow mx-auto">{study.industry}</p>
          <h1 className="mt-5 text-display-lg font-semibold [text-wrap:balance]">{study.title}</h1>
          <p className="mx-auto mt-6 max-w-2xl text-lead text-fg-muted">{study.summary}</p>
        </div>

        <div className="csh-stage">
          <div className="csh-product" data-reveal suppressHydrationWarning>
            {study.cover ? (
              <ProductLaptop image={study.cover} />
            ) : (
              <div className="card p-4 sm:p-6">
                <CaseArt study={study} priority />
              </div>
            )}
          </div>

          <dl className="csh-facts" aria-label="Project details">
            <div className="csh-fact" data-pos="tl" style={d(0)}>
              <span className="csh-fact-icon" data-tone="brand">
                <Building2 aria-hidden className="size-4" />
              </span>
              <span className="min-w-0">
                <dt className="text-xs text-fg-subtle">Product</dt>
                <dd className="font-semibold">{study.client ?? study.industry}</dd>
              </span>
            </div>

            <div className="csh-fact" data-pos="bl" style={d(1)}>
              <span className="csh-fact-icon" data-tone="human">
                <Layers aria-hidden className="size-4" />
              </span>
              <span className="min-w-0">
                <dt className="text-xs text-fg-subtle">Services</dt>
                <dd className="mt-0.5 grid gap-0.5">
                  {services.map((s) => (
                    <Link key={s.slug} href={serviceHref(s.slug)} className="text-sm font-semibold text-brand-300 hover:text-brand-200">
                      {s.shortTitle}
                    </Link>
                  ))}
                </dd>
              </span>
            </div>

            <div className="csh-fact" data-pos="tr" style={d(2)}>
              <span className="csh-fact-icon" data-tone="data">
                <Code2 aria-hidden className="size-4" />
              </span>
              <span className="min-w-0">
                <dt className="text-xs text-fg-subtle">Technology</dt>
                <dd className="mt-1.5 flex flex-wrap gap-1.5">
                  {study.stack.map((t) => (
                    <span key={t} className="csh-tag">
                      {t}
                    </span>
                  ))}
                </dd>
              </span>
            </div>

            {site ? (
              <div className="csh-fact" data-pos="br" style={d(3)}>
                <span className="csh-fact-icon" data-tone="success">
                  <Globe aria-hidden className="size-4" />
                </span>
                <span className="min-w-0">
                  <dt className="text-xs text-fg-subtle">{study.urlLabel ? "Get the app" : "Live"}</dt>
                  <dd>
                    <a href={study.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-semibold text-brand-300 hover:text-brand-200">
                      {site}
                      <ArrowUpRight aria-hidden className="size-3.5" />
                      <span className="sr-only"> (opens in a new tab)</span>
                    </a>
                  </dd>
                </span>
              </div>
            ) : (
              <div className="csh-fact" data-pos="br" style={d(3)}>
                <span className="csh-fact-icon" data-tone="brand">
                  <FileClock aria-hidden className="size-4" />
                </span>
                <span className="min-w-0">
                  <dt className="text-xs text-fg-subtle">Status</dt>
                  <dd className="font-semibold">{study.status === "draft" ? "Pending client approval" : "Live"}</dd>
                </span>
              </div>
            )}
          </dl>
        </div>
      </div>
    </section>
  );
}
