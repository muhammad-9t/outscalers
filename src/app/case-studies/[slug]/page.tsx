import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Check, FileClock } from "lucide-react";
import { caseStudies, getCaseStudy } from "@/content/case-studies";
import { services, serviceHref } from "@/content/services";
import { pageMetadata } from "@/lib/site";
import { breadcrumbJsonLd } from "@/lib/seo";
import { PageHero } from "@/components/sections/page-hero";
import { CaseStudyCard } from "@/components/sections/case-study-card";
import { CtaBand } from "@/components/sections/cta-band";
import { CaseArt } from "@/components/illustrations/case-art";
import { ProductLaptop } from "@/components/illustrations/product-laptop";
import { Reveal, Section, SectionHeading } from "@/components/ui/primitives";
import { ProjectStory } from "@/components/case-studies/project-story";
import { projectStories } from "@/content/project-stories";
import { getTeam } from "@/lib/team-store";

export function generateStaticParams() {
  return caseStudies.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: PageProps<"/case-studies/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const study = getCaseStudy(slug);
  if (!study) return {};
  return pageMetadata({ title: study.title, description: study.summary, path: `/case-studies/${study.slug}` });
}

function Block({ title, items }: { title: string; items: string[] }) {
  return (
    <Reveal>
      <h2 className="text-display-md font-semibold">{title}</h2>
      <ul className="mt-5 space-y-3">
        {items.map((item) => (
          <li key={item} className="flex gap-3 text-[1.0625rem] leading-relaxed text-fg-muted">
            <span aria-hidden className="mt-2.5 size-1.5 shrink-0 rounded-full bg-brand-400" />
            {item}
          </li>
        ))}
      </ul>
    </Reveal>
  );
}

export default async function CaseStudyPage({ params }: PageProps<"/case-studies/[slug]">) {
  const { slug } = await params;
  const study = getCaseStudy(slug);
  if (!study) notFound();

  const related = caseStudies.filter((c) => c.slug !== study.slug).slice(0, 2);
  const story = projectStories[study.slug];
  const team = story ? await getTeam() : [];
  const studyServices = services.filter((s) => study.services.includes(s.slug));
  const crumbsLd = breadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Portfolio", path: "/portfolio" },
    { name: study.title, path: `/case-studies/${study.slug}` },
  ]);

  return (
    <>
      <PageHero
        eyebrow={study.industry}
        title={study.title}
        lead={study.summary}
        crumbs={[
          { label: "Home", href: "/" },
          { label: "Portfolio", href: "/portfolio" },
          { label: study.industry, href: `/case-studies/${study.slug}` },
        ]}
        visual={
          study.cover ? (
            <ProductLaptop image={study.cover} />
          ) : (
            <div className="card p-4 sm:p-6">
              <CaseArt study={study} priority />
            </div>
          )
        }
      />

      <Section labelledBy="overview-title">
        <div className="container-site grid gap-14 lg:grid-cols-[1fr_20rem] lg:gap-20">
          <div className="space-y-14">
            {study.status === "draft" && (
              <div className="flex gap-3 rounded-xl border border-brand-300/30 bg-brand-300/5 p-4 text-sm text-fg-muted">
                <FileClock aria-hidden className="size-5 shrink-0 text-brand-300" />
                <p>
                  <strong className="font-semibold text-brand-300">Draft profile.</strong> This summary is pending
                  client confirmation. Client name, screenshots and verified results will be added once approved.
                </p>
              </div>
            )}
            <Reveal>
              <h2 id="overview-title" className="text-display-md font-semibold">
                Overview
              </h2>
              <p className="mt-5 text-[1.0625rem] leading-relaxed text-fg-muted">{study.overview}</p>
            </Reveal>
            <Block title="The challenge" items={study.challenge} />
            <Block title="Our solution" items={study.solution} />
            {study.humanAiApproach && <Block title="Human + AI approach" items={study.humanAiApproach} />}
            <Block title="Implementation" items={study.implementation} />
            <Reveal>
              <h2 className="text-display-md font-semibold">Results</h2>
              {study.results.length > 0 ? (
                <ul className="mt-5 grid gap-3 sm:grid-cols-2">
                  {study.results.map((r) => (
                    <li key={r} className="card-flat flex gap-3 p-5">
                      <Check aria-hidden className="mt-0.5 size-5 shrink-0 text-brand-400" />
                      {r}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-5 rounded-xl border border-dashed border-line-strong p-5 text-[0.9375rem] text-fg-subtle">
                  Verified results will be published here once confirmed with the client.
                </p>
              )}
            </Reveal>
          </div>

          <aside aria-label="Project details" className="lg:sticky lg:top-28 lg:self-start">
            <dl className="card divide-y divide-line text-sm">
              <div className="p-5">
                <dt className="font-mono text-xs uppercase tracking-wider text-fg-subtle">Client</dt>
                <dd className="mt-1.5">{study.client ?? "Confidential"}</dd>
              </div>
              {study.url && (
                <div className="p-5">
                  <dt className="font-mono text-xs uppercase tracking-wider text-fg-subtle">Website</dt>
                  <dd className="mt-1.5">
                    <a
                      href={study.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-brand-300 hover:text-brand-200"
                    >
                      {study.url.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "")}
                      <span className="sr-only"> (opens in a new tab)</span>
                    </a>
                  </dd>
                </div>
              )}
              <div className="p-5">
                <dt className="font-mono text-xs uppercase tracking-wider text-fg-subtle">Industry</dt>
                <dd className="mt-1.5">{study.industry}</dd>
              </div>
              <div className="p-5">
                <dt className="font-mono text-xs uppercase tracking-wider text-fg-subtle">Services</dt>
                <dd className="mt-2">
                  <ul className="space-y-1.5">
                    {studyServices.map((s) => (
                      <li key={s.slug}>
                        <Link href={serviceHref(s.slug)} className="text-brand-300 hover:text-brand-200">
                          {s.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </dd>
              </div>
              <div className="p-5">
                <dt className="font-mono text-xs uppercase tracking-wider text-fg-subtle">Technology</dt>
                <dd className="mt-2.5 flex flex-wrap gap-1.5">
                  {study.stack.map((t) => (
                    <span key={t} className="chip text-xs">
                      {t}
                    </span>
                  ))}
                </dd>
              </div>
            </dl>
          </aside>
        </div>
      </Section>

      {/* Project story: slides sideways on large screens, a vertical timeline elsewhere */}
      {story && (
        <section aria-labelledby="story-title" className="relative bg-ink-950 max-lg:py-20 motion-reduce:py-20">
          <ProjectStory story={story} people={team} project={study.client ?? "this project"} />
        </section>
      )}

      {study.gallery && study.gallery.length > 0 && (
        <Section labelledBy="gallery-title">
          <div className="container-site">
            <SectionHeading id="gallery-title" eyebrow="Inside the product" title="What we built" />
            <ul className="mt-12 space-y-16 sm:space-y-20">
              {study.gallery.map((g, i) => (
                <li key={g.src} data-reveal>
                  <figure>
                    <div className="card overflow-hidden p-0">
                      <Image
                        src={g.src}
                        alt={g.alt}
                        width={g.width}
                        height={g.height}
                        sizes="(min-width: 1280px) 1200px, 100vw"
                        className="h-auto w-full"
                      />
                    </div>
                    <figcaption className="mt-5 flex flex-col gap-1 sm:flex-row sm:items-baseline sm:gap-4">
                      <span className="font-mono text-xs uppercase tracking-wider text-brand-300">
                        {String(i + 1).padStart(2, "0")} · {g.title}
                      </span>
                      <span className="text-[1.0625rem] leading-relaxed text-fg-muted">{g.caption}</span>
                    </figcaption>
                  </figure>
                </li>
              ))}
            </ul>
          </div>
        </Section>
      )}

      {related.length > 0 && (
        <Section tone="raised" labelledBy="related-cs-title">
          <div className="container-site">
            <SectionHeading id="related-cs-title" eyebrow="More work" title="Related case studies" />
            <ul className="mt-10 grid gap-5 md:grid-cols-2">
              {related.map((c) => (
                <li key={c.slug} data-reveal>
                  <CaseStudyCard study={c} />
                </li>
              ))}
            </ul>
          </div>
        </Section>
      )}

      <CtaBand />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(crumbsLd) }} />
    </>
  );
}
