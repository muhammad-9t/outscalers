import type { CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Sparkles } from "lucide-react";
import type { CaseStudy } from "@/content/case-studies";
import type { ProductShowcase } from "@/content/product-showcases";
import type { ProjectStory } from "@/content/project-stories";
import { CaseArt } from "@/components/illustrations/case-art";
import { CtaBand } from "@/components/sections/cta-band";
import { Reveal, Section, SectionHeading } from "@/components/ui/primitives";
import { FeatureTabs } from "./feature-tabs";
import { cn } from "@/lib/cn";
import { productDisplay } from "@/lib/fonts";

const display = productDisplay;

/**
 * Product page, "show the product": the product's own brand on a light stage inside the dark site,
 * a large real interface, feature tabs with real previews, its app family, a compact build summary,
 * and the next product. Data: src/content/product-showcases.ts (+ case-studies.ts, project-stories.ts).
 */
export function ProductPage({
  study,
  showcase: s,
  story,
  next,
}: {
  study: CaseStudy;
  showcase: ProductShowcase;
  story?: ProjectStory;
  next?: CaseStudy;
}) {
  const stage = {
    "--p": s.brand.primary,
    "--pd": s.brand.deep,
    "--pt": s.brand.tint,
    "--sun": s.brand.sun,
    background: `radial-gradient(120% 70% at 50% 0%, ${s.brand.tint} 0%, ${s.brand.stage} 60%)`,
  } as CSSProperties;
  const [head, accent] = splitAccent(s.headline, s.headlineAccent);

  const facts = [
    story && { k: "Built in", v: story.facts.duration },
    story && { k: "Screens", v: story.facts.screens },
    { k: "Platforms", v: s.platforms.join(" · ") },
    story && { k: "Status", v: story.facts.status },
  ].filter(Boolean) as { k: string; v: string }[];

  return (
    <>
      {/* Hero: the product on its own light stage */}
      <section className="relative bg-ink-950 pt-24 pb-10 sm:pt-28">
        <div className="container-site">
          <nav aria-label="Breadcrumb" className="mb-6 text-sm text-fg-subtle">
            <Link href="/" className="transition-colors hover:text-fg">
              Home
            </Link>{" "}
            /{" "}
            <Link href="/portfolio" className="transition-colors hover:text-fg">
              Portfolio
            </Link>{" "}
            / <span aria-current="page">{study.client ?? study.title}</span>
          </nav>

          <div style={stage} className="relative overflow-hidden rounded-[2rem] px-5 pt-12 sm:rounded-[2.5rem] sm:px-10 sm:pt-16">
            <div className="mx-auto max-w-3xl text-center">
              <Image src={s.logo.src} alt={s.logo.alt} width={s.logo.width} height={s.logo.height} priority className="mx-auto h-auto w-40 sm:w-48" />
              <h1 className={cn("mt-8 text-[2rem] leading-[1.08] text-[#111] sm:text-5xl lg:text-6xl", display.className)}>
                {head} {accent && <span className="text-[var(--p)]">{accent}</span>}
              </h1>
              <p className="mx-auto mt-5 max-w-2xl text-lg text-[#4A4840]">{s.lead}</p>
              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <a
                  href={s.live.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[var(--p)] px-6 py-3 font-semibold text-white transition-colors hover:bg-[var(--pd)] sm:w-auto"
                >
                  {s.live.label}
                  <ArrowUpRight aria-hidden className="size-4" />
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
                <ul className="flex flex-wrap justify-center gap-2" aria-label="Platforms">
                  {s.platforms.map((p) => (
                    <li key={p} className="rounded-full border border-black/10 bg-white/70 px-3 py-1.5 text-sm font-medium text-[#4A4840]">
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <Image
              src={s.hero.src}
              alt={s.hero.alt}
              width={s.hero.width}
              height={s.hero.height}
              priority
              sizes="(min-width: 1280px) 1024px, 100vw"
              className="relative mx-auto mt-12 h-auto w-full max-w-5xl"
            />
          </div>

          {/* Facts, in our own style under the stage */}
          <dl className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-4">
            {facts.map((f) => (
              <div key={f.k} className="bg-ink-900 px-5 py-4">
                <dt className="text-xs font-medium tracking-wide text-fg-subtle uppercase">{f.k}</dt>
                <dd className="mt-1 font-display text-lg font-semibold text-fg">
                  {f.k === "Status" && <span aria-hidden className="mr-1.5 inline-block size-2 rounded-full bg-success align-middle" />}
                  {f.v}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* What it does */}
      <Section tight labelledBy="pp-features-title">
        <div className="container-site">
          <SectionHeading id="pp-features-title" eyebrow={`Inside ${study.client}`} title="What it does" align="center" />
          <Reveal className="mt-10">
            <div style={stage} className="rounded-[2rem] px-4 py-10 sm:rounded-[2.5rem] sm:px-10 sm:py-14">
              <FeatureTabs features={s.features} titleClass={display.className} />
            </div>
          </Reveal>
        </div>
      </Section>

      {/* The app family */}
      {s.apps && s.appsImage && (
        <Section tight labelledBy="pp-apps-title">
          <div className="container-site">
            <Reveal>
              <div style={stage} className="grid items-center gap-10 overflow-hidden rounded-[2rem] px-5 py-10 sm:rounded-[2.5rem] sm:px-10 sm:py-14 lg:grid-cols-2">
                <Image
                  src={s.appsImage.src}
                  alt={s.appsImage.alt}
                  width={s.appsImage.width}
                  height={s.appsImage.height}
                  sizes="(min-width: 1024px) 520px, 100vw"
                  className="mx-auto h-auto w-full max-w-md"
                />
                <div>
                  <h2 id="pp-apps-title" className={cn("text-3xl leading-tight text-[#111] sm:text-4xl", display.className)}>
                    One account. <span className="text-[var(--p)]">Three apps.</span>
                  </h2>
                  <ul className="mt-8 grid gap-3">
                    {s.apps.map((a) => (
                      <li key={a.name} className="flex items-center gap-4 rounded-2xl border border-black/5 bg-white p-4 shadow-sm">
                        <Image src={a.icon} alt="" width={48} height={48} className="size-12 shrink-0 rounded-xl" />
                        <div className="min-w-0">
                          <p className="font-semibold text-[#111]">
                            {a.name}{" "}
                            <span className="block text-xs font-medium text-[#4A4840] sm:ml-1 sm:inline">{a.platforms}</span>
                          </p>
                          <p className="text-sm text-[#4A4840]">{a.line}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Reveal>
          </div>
        </Section>
      )}

      {/* How we built it: compact, in our own style */}
      <Section tone="raised" labelledBy="pp-build-title">
        <div className="container-site">
          <div className="grid gap-10 lg:grid-cols-[1fr_1.6fr] lg:gap-16">
            <div>
              <SectionHeading id="pp-build-title" eyebrow="Built by Outscalers" title="How we built it" />
              {story && <p className="mt-5 text-fg-muted">{story.facts.team}</p>}
              <p className="mt-4 flex items-start gap-2 text-sm text-fg-subtle">
                <Sparkles aria-hidden className="mt-0.5 size-4 shrink-0 text-brand-400" />
                AI-accelerated, with every change reviewed by an engineer.
              </p>
            </div>
            <div>
              {story && (
                <ol className="grid gap-3 sm:grid-cols-2">
                  {story.milestones.map((m, i) => (
                    <Reveal as="li" key={m.title} delay={i * 60} className="card p-5">
                      <p className="text-xs font-medium text-fg-subtle">{m.when}</p>
                      <p className="mt-1 font-semibold">{m.title}</p>
                      <p className="mt-1 text-sm text-fg-muted">{m.body}</p>
                    </Reveal>
                  ))}
                </ol>
              )}
              <ul className="mt-6 flex flex-wrap gap-2" aria-label="Technologies">
                {study.stack.map((t) => (
                  <li key={t} className="chip">
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </Section>

      {/* Next product */}
      {next && (
        <Section tight labelledBy="pp-next-title">
          <div className="container-site">
            <Link href={`/case-studies/${next.slug}`} className="card card-interactive group grid items-center gap-6 overflow-hidden p-5 sm:grid-cols-[1fr_1.2fr] sm:p-8">
              <div>
                <p className="eyebrow">Next product</p>
                <h2 id="pp-next-title" className="mt-4 text-2xl font-semibold sm:text-3xl">
                  {next.client ?? next.title}
                </h2>
                <p className="mt-2 text-fg-muted">{next.summary}</p>
                <span className="link-arrow mt-5">
                  View product <ArrowRight aria-hidden className="size-4 transition-transform group-hover:translate-x-0.5" />
                </span>
              </div>
              <div className="rounded-xl bg-ink-900/60 p-3">
                <CaseArt study={next} />
              </div>
            </Link>
          </div>
        </Section>
      )}

      <CtaBand title="Want a product like this? Let's build it faster." />
    </>
  );
}

/** Splits the headline so its last words can be coloured in the product's primary colour. */
function splitAccent(headline: string, accent?: string): [string, string | undefined] {
  if (!accent || !headline.endsWith(accent)) return [headline, undefined];
  return [headline.slice(0, -accent.length).trimEnd(), accent];
}
