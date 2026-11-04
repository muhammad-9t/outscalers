import { cn } from "@/lib/cn";
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
import { EventHorizon } from "@/components/hero/event-horizon";
import { ScrollRocket } from "@/components/hero/scroll-rocket";
import { HeroControl } from "@/components/illustrations/hero-control";
import { HudServices } from "@/components/hero/hud-services";
import { HudLog } from "@/components/hero/hero-hud";
import { ServiceCard } from "@/components/sections/service-cards";
import { DeliveryModel } from "@/components/sections/delivery-model";
import { LaunchTimeline } from "@/components/sections/launch-timeline";
import { CaseStudyCard } from "@/components/sections/case-study-card";
import { CtaBand } from "@/components/sections/cta-band";
import { ArrowLink, Reveal, Section, SectionHeading } from "@/components/ui/primitives";
import { services, serviceHref } from "@/content/services";
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
      <section aria-labelledby="hero-title" className="relative flex flex-col justify-center overflow-hidden bg-ink-950 pb-16 pt-24 sm:pb-24 lg:min-h-svh lg:pb-14 lg:pt-28 short:pb-6 short:pt-20">
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="bg-grid absolute inset-0 opacity-60" />
        </div>
        <HeroCircuit />
        <div className="container-site relative">
          {/* The message comes first: the headline runs across the top, then the lead and services sit beside
              the human-control animation. Small screens stack them: message, services, animation. */}
          <div className="relative z-10 flex flex-col items-center text-center lg:items-start lg:text-left">
            {/* Live session log in the empty top right, beside the headline, on wide screens only.
                Inside this block (not the padded container) so it lines up with the content edge. */}
            <div className="absolute top-0 right-0 hidden w-72 text-left xl:block">
              <HudLog />
            </div>
            <p className="eyebrow">Human + AI engineering company</p>
            <h1 id="hero-title" className="mt-5 text-display-xl font-semibold lg:text-[clamp(2.75rem,4.4vw,4.75rem)] short:mt-3 short:text-[clamp(2.5rem,min(4.4vw,8vh),4.5rem)]">
              Human Intelligence.
              <br />
              <span className="text-gradient">AI-Powered Engineering.</span>
            </h1>
          </div>
          <div className="mt-8 grid items-center gap-12 lg:mt-10 lg:grid-cols-[minmax(0,1fr)_auto] lg:gap-10 short:mt-5">
            <div className="relative z-10 flex flex-col items-center text-center lg:items-start lg:text-left">
              <p className="max-w-xl text-lead text-fg-muted">
                Experienced engineers and AI, building intelligent software that takes your ideas to production.
              </p>
              <div className="mt-12 flex flex-col items-center gap-3 lg:items-start short:mt-6">
                <p aria-hidden className="font-mono text-[11px] tracking-[0.18em] text-fg-subtle uppercase">
                  {"// Services"}
                </p>
                <HudServices className="justify-center lg:justify-start" />
              </div>
            </div>
            <div data-reveal className="mx-auto w-full max-w-md sm:max-w-xl lg:mx-0 lg:w-auto lg:max-w-none">
              <HeroControl />
            </div>
          </div>
        </div>
      </section>

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
            <Reveal delay={160} className="grid gap-4 sm:grid-cols-2 lg:h-full lg:grid-cols-1 lg:grid-rows-2">
              {[
                {
                  label: "People own",
                  tag: "01 // Human",
                  tone: "human",
                  text: "Every decision that shapes the product, and the final say on what ships.",
                  items: ["Requirements", "Architecture", "Code review", "Security decisions", "Release approval"],
                },
                {
                  label: "AI accelerates",
                  tag: "02 // AI",
                  tone: "ai",
                  text: "Speed on the routine work, with every output reviewed by an engineer.",
                  items: ["Research", "Scaffolding", "Drafts & test ideas", "Documentation", "Log analysis"],
                },
              ].map((c) => (
                <div
                  key={c.label}
                  className={cn(
                    "group relative flex flex-col border bg-ink-900/40 p-5 transition-[border-color,box-shadow] duration-300",
                    c.tone === "human"
                      ? "border-human-accent/25 hover:border-human-accent/60 hover:shadow-[0_0_28px_-10px_var(--color-human-accent)]"
                      : "border-brand-400/25 hover:border-brand-400/60 hover:shadow-[0_0_28px_-10px_var(--color-brand-500)]",
                  )}
                >
                  {/* Corner brackets */}
                  <span
                    aria-hidden
                    className={cn(
                      "absolute -top-px -left-px size-2.5 border-t-2 border-l-2",
                      c.tone === "human" ? "border-human-accent" : "border-brand-400",
                    )}
                  />
                  <span
                    aria-hidden
                    className={cn(
                      "absolute -right-px -bottom-px size-2.5 border-r-2 border-b-2",
                      c.tone === "human" ? "border-human-accent" : "border-brand-400",
                    )}
                  />
                  <p
                    aria-hidden
                    className={cn(
                      "font-mono text-[10px] tracking-[0.18em] uppercase",
                      c.tone === "human" ? "text-human-accent" : "text-brand-300",
                    )}
                  >
                    {c.tag}
                  </p>
                  <h3 className="mt-1 font-semibold">{c.label}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-fg-muted">{c.text}</p>
                  <ul className="mt-6 space-y-2.5 border-t border-line pt-5 text-sm text-fg-muted lg:mt-auto lg:grid lg:grid-cols-2 lg:gap-x-6 lg:gap-y-2.5 lg:space-y-0">
                    {c.items.map((it) => (
                      <li key={it} className="flex items-center gap-2.5">
                        <span
                          aria-hidden
                          className={cn("size-1.5 shrink-0", c.tone === "human" ? "bg-human-accent" : "bg-brand-400")}
                        />
                        {it}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </Reveal>
          </div>
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
      <Section labelledBy="model-title" className="overflow-hidden">
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
      <Section labelledBy="why-title">
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
