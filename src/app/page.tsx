import type { CSSProperties } from "react";
import Link from "next/link";
import {
  Boxes,
  Handshake,
  History,
  Layers3,
  ShieldCheck,
  Sparkles,
  UserCheck,
  Workflow,
  BrainCircuit,
  AppWindow,
  Wrench,
} from "lucide-react";
import { HeroCircuit } from "@/components/hero/hero-circuit";
import { HeroScene } from "@/components/hero/hero-scene";
import { ScrollRocket } from "@/components/hero/scroll-rocket";
import { HumanAiCollab } from "@/components/illustrations/human-ai-collab";
import { HeroDuo } from "@/components/illustrations/hero-duo";
import { ServiceGlyph } from "@/components/illustrations/service-glyph";
import { ServiceCard } from "@/components/sections/service-cards";
import { DeliveryModel } from "@/components/sections/delivery-model";
import { LaunchTimeline } from "@/components/sections/launch-timeline";
import { CaseStudyCard } from "@/components/sections/case-study-card";
import { CtaBand } from "@/components/sections/cta-band";
import { ArrowLink, ButtonLink, Reveal, Section, SectionHeading } from "@/components/ui/primitives";
import { services, serviceHref } from "@/content/services";
import { caseStudies } from "@/content/case-studies";
import { pageMetadata } from "@/lib/site";

export const metadata = pageMetadata({
  description:
    "Outscalers combines experienced engineers with AI to build intelligent software, automate business processes and modernise systems — with human review and accountability at every step.",
  path: "/",
});

const differentiators = [
  {
    icon: UserCheck,
    title: "Human accountability",
    body: "A named engineer owns every decision and every merged change. AI never ships code on its own.",
  },
  {
    icon: Sparkles,
    title: "AI-enhanced delivery",
    body: "AI handles the repetitive work — scaffolding, drafts, test ideas — so engineering time goes where it matters.",
  },
  {
    icon: Wrench,
    title: "Tailored solutions",
    body: "We start from your process and constraints, then choose the simplest technology that solves the problem.",
  },
  {
    icon: ShieldCheck,
    title: "Security & quality practices",
    body: "Code review, automated testing and security checks are part of every project, not optional extras.",
  },
  {
    icon: Layers3,
    title: "Scalable architecture",
    body: "Systems designed to grow with you — with the cloud, data and performance foundations to support it.",
  },
  {
    icon: Handshake,
    title: "Long-term partnership",
    body: "Project delivery, team augmentation or ongoing support — we stay involved after launch.",
  },
];

const needs = [
  {
    icon: Workflow,
    title: "Automate repetitive workflows",
    body: "Connect your systems and remove manual hand-offs, with approval steps for decisions that need a person.",
    href: serviceHref("automation"),
  },
  {
    icon: AppWindow,
    title: "Build a new digital product",
    body: "Web, mobile and SaaS products — from first release to a platform that scales.",
    href: serviceHref("software-development"),
  },
  {
    icon: History,
    title: "Modernise legacy systems",
    body: "Refactor, migrate and test ageing applications incrementally, without risky big-bang rewrites.",
    href: serviceHref("software-development"),
  },
  {
    icon: BrainCircuit,
    title: "Add intelligence to your business",
    body: "Assistants, agents and document intelligence grounded in your own data, with guardrails.",
    href: serviceHref("ai-solutions"),
  },
];

const industries = ["Healthcare", "Banking", "Insurance", "Logistics", "Telecom", "Education", "Construction", "Oil & gas"];

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section aria-labelledby="hero-title" className="relative flex flex-col justify-center overflow-hidden bg-ink-950 pb-16 pt-24 sm:pb-24 lg:min-h-svh lg:pb-16 lg:pt-24 short:pb-6 short:pt-20">
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="bg-grid absolute inset-0 opacity-60" />
          <div className="glow-brand absolute -top-60 left-1/2 size-240 -translate-x-1/2 animate-drift opacity-50" />
        </div>
        <HeroCircuit />
        <div className="container-site relative">
          {/* Stacked and centred: illustration, then the message */}
          <div className="flex flex-col items-center text-center">
            <div data-reveal className="w-full max-w-sm sm:max-w-md lg:max-w-120 short:max-w-[40vh]">
              <HeroDuo />
            </div>
            <p className="eyebrow mt-6 sm:mt-8 short:mt-3">Human + AI engineering company</p>
            <h1 id="hero-title" className="mt-5 text-display-xl font-semibold short:mt-3 short:text-[clamp(2.6rem,8.5vh,4.75rem)]">
              Human Intelligence.
              <br />
              <span className="text-gradient">AI-Powered Engineering.</span>
            </h1>
            <p className="mt-7 max-w-2xl text-lead text-fg-muted short:mt-4 short:max-w-3xl">
              We combine experienced engineers with artificial intelligence to build intelligent software, automate
              complex workflows, and help businesses move from ideas to real-world solutions.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3 short:mt-6">
              <ButtonLink href="/contact" arrow>
                Start a Project
              </ButtonLink>
              <ButtonLink href="/services" variant="secondary">
                Explore Our Services
              </ButtonLink>
            </div>
            <ul aria-label="What we do" className="mt-9 flex flex-wrap justify-center gap-2 short:mt-5">
              {services.map((s) => (
                <li key={s.slug}>
                  <Link href={serviceHref(s.slug)} className="chip transition-colors hover:border-brand-500/50 hover:text-fg">
                    <ServiceGlyph slug={s.slug} className="size-3.5 text-brand-400" />
                    {s.shortTitle}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Workflow in action: the animated editor scene, in its own section below the hero */}
      <Section tone="deep" tight labelledBy="scene-title" className="!pt-6 sm:!pt-10">
        <div className="container-site">
          <SectionHeading
            id="scene-title"
            eyebrow="See it in action"
            title="From idea to tested code, with a person at every step"
            align="center"
            className="mb-10"
          />
          <HeroScene />
        </div>
      </Section>

      {/* Company introduction */}
      <Section labelledBy="intro-title">
        <div className="container-site grid items-center gap-14 lg:grid-cols-2 lg:gap-20">
          <div>
            <SectionHeading
              id="intro-title"
              eyebrow="Who we are"
              title="An engineering partner that has grown up with AI — not around it."
            />
            <Reveal className="prose-site mt-6 max-w-xl" delay={80}>
              <p>
                Founded in 2023, Outscalers brings together engineering talent from Germany and Pakistan in remote-first,
                English-speaking teams of developers, QA engineers, designers and project managers. We build software,
                platforms and infrastructure for organisations worldwide.
              </p>
              <p>
                Today our engineers work alongside AI. It speeds up research, drafting and routine implementation, while
                our people stay responsible for architecture, critical decisions, security and the quality of what
                reaches production.
              </p>
            </Reveal>
            <Reveal delay={160} className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="card-flat p-5">
                <p className="chip chip-human">People own</p>
                <p className="mt-3 text-sm leading-relaxed text-fg-muted">
                  Requirements, architecture, code review, security decisions and release approval.
                </p>
              </div>
              <div className="card-flat p-5">
                <p className="chip chip-ai">AI accelerates</p>
                <p className="mt-3 text-sm leading-relaxed text-fg-muted">
                  Research, scaffolding, drafts, test ideas, documentation and log analysis.
                </p>
              </div>
            </Reveal>
          </div>
          <Reveal delay={120} className="relative mx-auto w-full max-w-lg">
            <HumanAiCollab />
          </Reveal>
        </div>
      </Section>

      {/* Services */}
      <Section tone="raised" labelledBy="services-title">
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
          <ul className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {services.map((s, i) => (
              <li key={s.slug} data-reveal style={{ "--reveal-delay": `${(i % 3) * 80}ms` } as CSSProperties}>
                <ServiceCard slug={s.slug} index={i} />
              </li>
            ))}
            <li data-reveal style={{ "--reveal-delay": "160ms" } as CSSProperties}>
              <div className="flex h-full flex-col justify-between rounded-card border border-dashed border-line-strong p-6 sm:p-7">
                <div>
                  <span className="grid size-12 place-items-center rounded-xl border border-line-strong text-fg-muted">
                    <Boxes aria-hidden className="size-6" />
                  </span>
                  <h3 className="mt-6 text-xl font-semibold">Team augmentation</h3>
                  <p className="mt-3 text-[0.9375rem] leading-relaxed text-fg-muted">
                    Need extra engineering capacity? Our engineers can join your team and work within your processes and
                    tools.
                  </p>
                </div>
                <ArrowLink href="/contact" className="mt-6 text-sm">
                  Discuss your team
                </ArrowLink>
              </div>
            </li>
          </ul>
        </div>
      </Section>

      {/* Human + AI delivery model */}
      <Section tone="deep" labelledBy="model-title" className="overflow-hidden">
        <div aria-hidden className="bg-dots pointer-events-none absolute inset-0 opacity-30" />
        <div className="container-site relative">
          <div className="grid gap-8 lg:grid-cols-[1.2fr_1fr] lg:items-end">
            <SectionHeading
              id="model-title"
              eyebrow="Human + AI, working together"
              title="AI speeds up the work. People decide what ships."
            />
            <Reveal delay={80}>
              <p className="text-lead text-fg-muted">
                Every phase has a human owner and a checkpoint. AI contributes most during implementation — and
                nothing it produces reaches production without review and testing.
              </p>
            </Reveal>
          </div>
          <div className="mt-12">
            <DeliveryModel />
          </div>
          <Reveal className="mt-10">
            <ArrowLink href="/how-we-work">Read the full delivery process</ArrowLink>
          </Reveal>
        </div>
      </Section>

      {/* Speed to launch */}
      <Section tone="raised" labelledBy="launch-title">
        <div className="container-site">
          <LaunchTimeline />
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
            {caseStudies.map((c, i) => (
              <li key={c.slug} data-reveal style={{ "--reveal-delay": `${i * 80}ms` } as CSSProperties}>
                <CaseStudyCard study={c} />
              </li>
            ))}
          </ul>
        </div>
      </Section>

      {/* Why Outscalers — light section for contrast */}
      <Section tone="deep" labelledBy="why-title">
        <div className="container-site">
          <SectionHeading
            id="why-title"
            eyebrow="Why Outscalers"
            title="Modern tools. Accountable engineering."
            lead="What you can expect from working with us."
          />
          <ul className="mt-12 grid gap-px overflow-hidden rounded-card border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
            {differentiators.map((d, i) => (
              <li
                key={d.title}
                data-reveal
                style={{ "--reveal-delay": `${(i % 3) * 70}ms` } as CSSProperties}
                className="bg-ink-850 p-7"
              >
                <d.icon aria-hidden className="size-6 text-brand-300" strokeWidth={1.7} />
                <h3 className="mt-5 text-lg font-semibold">{d.title}</h3>
                <p className="mt-2 text-[0.9375rem] leading-relaxed text-fg-muted">{d.body}</p>
              </li>
            ))}
          </ul>
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
          <ul className="mt-12 grid gap-5 md:grid-cols-2">
            {needs.map((n, i) => (
              <li key={n.title} data-reveal style={{ "--reveal-delay": `${(i % 2) * 80}ms` } as CSSProperties}>
                <Link href={n.href} className="card card-interactive group flex h-full gap-5 p-6 sm:p-7">
                  <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-brand-500/10 text-brand-300">
                    <n.icon aria-hidden className="size-5" />
                  </span>
                  <span>
                    <span className="block font-display text-lg font-semibold">{n.title}</span>
                    <span className="mt-2 block text-[0.9375rem] leading-relaxed text-fg-muted">{n.body}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
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
