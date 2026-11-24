import type { CSSProperties } from "react";
import { HeroScene } from "@/components/hero/hero-scene";
import { EventHorizon } from "@/components/hero/event-horizon";
import { ScrollRocket } from "@/components/hero/scroll-rocket";
import { HeroShowcase } from "@/components/hero/hero-showcase";
import { DeliveryModel } from "@/components/sections/delivery-model";
import { LaunchEnvelope } from "@/components/sections/launch-envelope";
import { CaseStudyCard } from "@/components/sections/case-study-card";
import { CtaBand } from "@/components/sections/cta-band";
import { IntroCards } from "@/components/sections/intro-cards";
import { ServicesStage } from "@/components/sections/services-stage";
import { NeedsBento } from "@/components/sections/needs-bento";
import { WhyShowcase } from "@/components/sections/why-showcase";
import { TestimonialMap } from "@/components/sections/testimonial-map";
import { testimonialsAreSample } from "@/content/testimonials";
import { ArrowLink, Reveal, Section, SectionHeading } from "@/components/ui/primitives";
import { caseStudies } from "@/content/case-studies";
import { pageMetadata } from "@/lib/site";

export const metadata = pageMetadata({
  description:
    "Outscalers pairs human engineering with AI across Custom Software Development, AI Solutions & Agents, Business Process Automation, Data & Cloud, and Security & Quality.",
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

const industries = ["Healthcare", "Banking", "Insurance", "Logistics", "Telecom", "Education", "Construction", "Oil & gas"];

export default function HomePage() {
  return (
    <>
      {/* Hero: Mosey-inspired interactive multi-slide Human + AI Engineering showcase */}
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
          {/* Glowing horizon, as wide as the editor, which rests on its edge */}
          <EventHorizon className="relative -mt-6" />
          <div className="relative -mt-50">
            <HeroScene />
          </div>
        </div>
      </Section>

      {/* Company introduction */}
      <Section labelledBy="intro-title">
        <div className="container-site grid items-center gap-14 lg:grid-cols-2 lg:items-stretch lg:gap-20">
          <div>
            <SectionHeading
              id="intro-title"
              eyebrow="Who we are"
              title="An engineering partner that has grown up with AI — not around it."
            />
            <Reveal className="prose-site mt-6 max-w-xl" delay={80}>
              <p>
                Developers, QA engineers, designers and project managers building software, platforms and infrastructure
                for organisations worldwide. AI speeds up the routine work; our people stay responsible for what reaches
                production.
              </p>
            </Reveal>
            <Reveal delay={120} className="mt-8">
              <dl className="flex flex-wrap gap-x-8 gap-y-3 border-y border-line py-4 font-mono">
                {[
                  ["2017", "Building since"],
                  ["DE + PK", "Engineering teams"],
                  ["Remote-first", "English-speaking"],
                ].map(([v, k]) => (
                  <div key={k} className="flex flex-col-reverse">
                    <dt className="text-[10px] tracking-[0.18em] text-fg-subtle uppercase">{k}</dt>
                    <dd className="text-lg font-semibold text-fg">{v}</dd>
                  </div>
                ))}
              </dl>
            </Reveal>
          </div>
          {/* The cards stack and share the height of the text column */}
          <div className="lg:h-full">
            <Reveal delay={160} className="lg:h-full">
              <IntroCards />
            </Reveal>
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

      {/* Human + AI delivery model */}
      <Section tight labelledBy="model-title" className="overflow-hidden">
        <div className="container-site relative">
          {/* Wide screens: the title sits on two lines next to the lead, so the intro stays short */}
          <div className="grid gap-8 lg:grid-cols-[1.2fr_1fr] lg:items-end xl:grid-cols-[auto_minmax(0,1fr)] xl:gap-14">
            <SectionHeading
              id="model-title"
              eyebrow="Human + AI, working together"
              className="xl:max-w-none"
              title={
                <>
                  AI speeds up the work. <br className="hidden xl:inline" />
                  People decide what ships.
                </>
              }
            />
            <Reveal delay={80}>
              <p className="text-lead text-fg-muted">
                Every phase has a human owner and a checkpoint. AI contributes most during implementation — and
                nothing it produces reaches production without review and testing.
              </p>
            </Reveal>
          </div>
          <div className="mt-10">
            <DeliveryModel />
          </div>
          <Reveal className="mt-8">
            <ArrowLink href="/how-we-work">Read the full delivery process</ArrowLink>
          </Reveal>
        </div>
      </Section>

      {/* Speed to launch */}
      <Section tone="raised" tight labelledBy="launch-title">
        <div className="container-site">
          <LaunchEnvelope />
        </div>
      </Section>

      {/* Case studies */}
      <Section labelledBy="cases-title">
        <div className="container-site">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <SectionHeading
              id="cases-title"
              eyebrow="Case studies"
              title="Engineering work in context"
              lead="A look at the kinds of problems we solve. Verified outcomes are published only with client approval."
            />
            <Reveal className="shrink-0">
              <ArrowLink href="/portfolio">View our portfolio</ArrowLink>
            </Reveal>
          </div>
          <ul className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {caseStudies.slice(0, 3).map((c, i) => (
              <li key={c.slug} data-reveal style={{ "--reveal-delay": `${i * 80}ms` } as CSSProperties}>
                <CaseStudyCard study={c} />
              </li>
            ))}
          </ul>
        </div>
      </Section>

      {/* Testimonials: a world of clients; hover a face to read their story */}
      <Section labelledBy="voices-title">
        <div className="container-site">
          <SectionHeading
            id="voices-title"
            eyebrow="Client voices"
            title="Teams around the world, one way of working"
            lead="Hover a face (or tap it) to read what working with our engineers was like."
            align="center"
          />
          {testimonialsAreSample && (
            <Reveal className="mx-auto mt-6 w-fit rounded-full border border-brand-300/30 bg-brand-300/5 px-4 py-1.5 text-sm text-fg-muted">
              <strong className="font-semibold text-brand-300">Sample</strong> testimonials: real client quotes will
              replace these.
            </Reveal>
          )}
          <div className="mt-14">
            <TestimonialMap />
          </div>
        </div>
      </Section>

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

      {/* Business needs */}
      <Section tone="raised" labelledBy="needs-title">
        <div className="container-site">
          <SectionHeading
            id="needs-title"
            eyebrow="Where we help"
            title="Start from the business problem"
            lead="Most projects begin with one of these needs. We'll help you find the right combination of software, automation and AI."
          />
          <NeedsBento />
          <Reveal className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
            <p className="text-sm text-fg-subtle">Industries we serve:</p>
            <ul className="flex flex-wrap gap-2">
              {industries.map((name) => (
                <li key={name} className="chip">
                  {name}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </Section>

      <CtaBand />
      <ScrollRocket />
    </>
  );
}
