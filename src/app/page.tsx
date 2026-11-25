import { HeroScene } from "@/components/hero/hero-scene";
import { ScrollRocket } from "@/components/hero/scroll-rocket";
import { HeroShowcase } from "@/components/hero/hero-showcase";
import { LaunchEnvelope } from "@/components/sections/launch-envelope";
import { ProductShowcase, type ShowcaseItem } from "@/components/sections/product-showcase";
import { productShowcases } from "@/content/product-showcases";
import { projectStories } from "@/content/project-stories";
import { productDisplay } from "@/lib/fonts";
import { CtaBand } from "@/components/sections/cta-band";
import { ServicesStage } from "@/components/sections/services-stage";
import { WhyShowcase } from "@/components/sections/why-showcase";
import { TestimonialGrid } from "@/components/sections/testimonial-grid";
import { showTestimonials } from "@/content/testimonials";
import { ArrowLink, Reveal, Section, SectionHeading } from "@/components/ui/primitives";
import { caseStudies } from "@/content/case-studies";
import { pageMetadata } from "@/lib/site";

export const metadata = pageMetadata({
  description:
    "Dedicated developers who join your team, or a full team that builds your product. 100+ in-house engineers, accelerated by AI. Contracts via our German and Italian companies.",
  path: "/",
  keywords: [
    "Outscalers",
    "IT outsourcing",
    "software development",
    "AI engineering",
    "business process automation",
    "data engineering",
    "cloud infrastructure",
  ],
});

/** One entry per product for the home showcase: brand stage when the product has a showcase, else its cover. */
const showcaseItems: ShowcaseItem[] = caseStudies.flatMap((c) => {
  if (!c.cover) return [];
  const brand = productShowcases[c.slug];
  const facts = projectStories[c.slug]?.facts;
  // The product name is the title's part before the colon (e.g. "Outscalers Hub: …")
  const name = c.title.includes(":") ? c.title.slice(0, c.title.indexOf(":")) : (c.client ?? c.title);
  const tail = c.title.includes(":") ? c.title.slice(c.title.indexOf(":") + 1).trim() : c.summary;
  return [
    {
      slug: c.slug,
      name,
      line: brand ? brand.headline : tail.charAt(0).toUpperCase() + tail.slice(1),
      facts: [facts && `${facts.duration}`, facts && `${facts.screens} screens`, facts?.status].filter(Boolean) as string[],
      href: `/case-studies/${c.slug}`,
      image: brand ? brand.hero : c.cover,
      logo: brand?.logo,
      brand: brand && { primary: brand.brand.primary, deep: brand.brand.deep, tint: brand.brand.tint, stage: brand.brand.stage },
      framed: !brand,
    },
  ];
});

export default function HomePage() {
  return (
    <>
      {/* Hero: headline, one call to action, and optional story slides behind the tabs */}
      <HeroShowcase />

      {/* Workflow in action: the animated editor scene, in its own section below the hero */}
      <Section tone="deep" tight labelledBy="scene-title" className="overflow-hidden !pt-6 sm:!pt-10">
        <div className="container-site">
          <SectionHeading
            id="scene-title"
            eyebrow="See it in action"
            title="From idea to tested code, with a person at every step"
            align="center"
          />
          {/* The demo window on a soft brand glow */}
          <div className="relative mt-12">
            <div aria-hidden className="hsx-glow" />
            <HeroScene />
          </div>
        </div>
      </Section>

      {/* Services */}
      <Section tone="raised" tight labelledBy="services-title">
        <div className="container-site">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <SectionHeading
              id="services-title"
              eyebrow="Services"
              title="What we build with you"
              lead="Five connected capabilities, delivered by one team that understands how they fit together."
            />
            <Reveal className="shrink-0">
              <ArrowLink href="/services">All services</ArrowLink>
            </Reveal>
          </div>
          <ServicesStage />
        </div>
      </Section>

      {/* Fast to start: how a dedicated developer joins (the envelope) */}
      <Section tone="raised" tight labelledBy="launch-title">
        <div className="container-site">
          <LaunchEnvelope />
        </div>
      </Section>

      {/* Products we've built */}
      <Section labelledBy="cases-title">
        <div className="container-site">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <SectionHeading
              id="cases-title"
              eyebrow="Our work"
              title="Products we've built"
              lead="Real products, designed and built by our engineers with AI in the workflow."
            />
            <Reveal className="shrink-0">
              <ArrowLink href="/portfolio">View our portfolio</ArrowLink>
            </Reveal>
          </div>
          <Reveal className="mt-12">
            <ProductShowcase items={showcaseItems} displayClass={productDisplay.className} />
          </Reveal>
        </div>
      </Section>

      {/* Testimonials: hidden until real client quotes exist (switch in src/content/testimonials.ts) */}
      {showTestimonials && (
        <Section labelledBy="voices-title">
          <div className="container-site">
            <SectionHeading
              id="voices-title"
              eyebrow="Client voices"
              title="Teams around the world"
              lead="What working with our engineers is like."
              align="center"
            />
            <div className="mt-14">
              <TestimonialGrid />
            </div>
          </div>
        </Section>
      )}

      {/* Why Outscalers — light section for contrast */}
      <Section labelledBy="why-title">
        <div className="container-site">
          <SectionHeading
            id="why-title"
            eyebrow="Why Outscalers"
            align="center"
            title={
              <>
                Modern tools. <br />
                <em className="why-accent">Accountable</em> engineering.
              </>
            }
            lead="What you can expect from working with us."
          />
          <div className="mt-10">
            <WhyShowcase />
          </div>
        </div>
      </Section>

      <CtaBand />
      <ScrollRocket />
    </>
  );
}
