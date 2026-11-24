import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import { Check, CircleAlert, FileClock, Sparkles, Wrench } from "lucide-react";
import { caseStudies, getCaseStudy } from "@/content/case-studies";
import { services } from "@/content/services";
import { pageMetadata } from "@/lib/site";
import { breadcrumbJsonLd } from "@/lib/seo";
import { CaseStudyCard } from "@/components/sections/case-study-card";
import { CtaBand } from "@/components/sections/cta-band";
import { CaseHero } from "@/components/case-studies/case-hero";
import { Reveal, Section, SectionHeading } from "@/components/ui/primitives";
import { ProjectStory } from "@/components/case-studies/project-story";
import { projectStories } from "@/content/project-stories";
import { team as teamMembers } from "@/content/team";

/*
 * Product pages read `params`, so their content can't be part of the shared instant-navigation shell.
 * All of them are prerendered at build time (see generateStaticParams), so navigation waits only for
 * static content; a loading skeleton would just add a flash. Opt out of instant validation on purpose.
 */
export const instant = false;

export function generateStaticParams() {
  return caseStudies.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: PageProps<"/case-studies/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const study = getCaseStudy(slug);
  if (!study) return {};
  return pageMetadata({ title: study.title, description: study.summary, path: `/case-studies/${study.slug}` });
}

/** A soft card with a glossy tile heading and a list (challenge in blue, solution in orange). */
function ListCard({ title, items, tone, icon: Icon, mark }: { title: string; items: string[]; tone: "human" | "brand"; icon: typeof Check; mark: "dot" | "check" }) {
  return (
    <Reveal className={`card p-6 sm:p-8 ${tone === "brand" ? "sd-fit-brand" : "sd-fit-human"}`}>
      <h2 className="flex items-center gap-3 text-xl font-semibold">
        <span className="hs-gloss sd-tile" data-tone={tone} aria-hidden>
          <Icon className="size-[48%]" strokeWidth={1.8} />
        </span>
        {title}
      </h2>
      <ul className="mt-6 space-y-3.5">
        {items.map((item) => (
          <li key={item} className="flex gap-3 text-[1.0625rem] leading-relaxed text-fg-muted">
            <span aria-hidden className="sd-mark">
              {mark === "check" ? <Check className="size-3" strokeWidth={3} /> : <span className="size-1.5 rounded-full bg-current" />}
            </span>
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
  const team = story ? teamMembers : [];
  const studyServices = services.filter((s) => study.services.includes(s.slug));
  const crumbsLd = breadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Portfolio", path: "/portfolio" },
    { name: study.title, path: `/case-studies/${study.slug}` },
  ]);

  return (
    <>
      <CaseHero study={study} services={studyServices} />

      <Section labelledBy="overview-title">
        <div className="container-site">
          {study.status === "draft" && (
            <div className="csx-note mx-auto mb-12 max-w-3xl">
              <FileClock aria-hidden className="size-5 shrink-0 text-brand-300" />
              <p>
                <strong className="font-semibold text-fg">Draft profile.</strong> This summary is pending client
                confirmation. Client name, screenshots and verified results will be added once approved.
              </p>
            </div>
          )}
          <Reveal className="mx-auto max-w-3xl text-center">
            <p className="eyebrow mx-auto">Overview</p>
            <h2 id="overview-title" className="sr-only">
              Overview
            </h2>
            <p className="mt-6 text-xl leading-relaxed text-fg sm:text-2xl sm:leading-relaxed">{study.overview}</p>
          </Reveal>

          <div className="mt-16 grid gap-5 md:grid-cols-2">
            <ListCard title="The challenge" items={study.challenge} tone="human" icon={CircleAlert} mark="dot" />
            <ListCard title="Our solution" items={study.solution} tone="brand" icon={Wrench} mark="check" />
          </div>

          {study.humanAiApproach && (
            <div className="mt-16">
              <h2 className="text-display-md font-semibold">Human + AI approach</h2>
              <ul className="mt-8 grid gap-3 md:grid-cols-2">
                {study.humanAiApproach.map((a, i) => (
                  <Reveal as="li" key={a} delay={i * 60} className="sd-row items-center">
                    <span className="sd-icon" data-tone={i % 2 ? "human" : "brand"}>
                      <Sparkles aria-hidden className="size-4" />
                    </span>
                    <span className="text-[1.0625rem] leading-relaxed text-fg-muted">{a}</span>
                  </Reveal>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-16">
            <h2 className="text-display-md font-semibold">How we built it</h2>
            <ol className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {study.implementation.map((step, i) => (
                <Reveal as="li" key={step} delay={i * 70} className="card card-interactive p-6">
                  <span className="sd-num">{i + 1}</span>
                  <p className="mt-4 text-[1.0625rem] leading-relaxed text-fg-muted">{step}</p>
                </Reveal>
              ))}
            </ol>
          </div>

          {/* Results: shown only once there are real, verified numbers */}
          {study.results.length > 0 && (
            <div className="mt-16">
              <h2 className="text-display-md font-semibold">Results</h2>
              <ul className="mt-8 grid gap-4 sm:grid-cols-2">
                {study.results.map((res, i) => (
                  <Reveal as="li" key={res} delay={i * 60} className="sd-row items-center">
                    <span className="sd-icon" data-tone="brand">
                      <Check aria-hidden className="size-4" strokeWidth={2.5} />
                    </span>
                    <span className="text-[1.0625rem] font-medium">{res}</span>
                  </Reveal>
                ))}
              </ul>
            </div>
          )}
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
                <li key={g.src} data-reveal suppressHydrationWarning>
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
                    <figcaption className="mt-5 flex items-start gap-4">
                      <span className="sd-num shrink-0">{i + 1}</span>
                      <span className="pt-1 text-[1.0625rem] leading-relaxed text-fg-muted">
                        <b className="font-semibold text-fg">{g.title}.</b> {g.caption}
                      </span>
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
                <li key={c.slug} data-reveal suppressHydrationWarning>
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
