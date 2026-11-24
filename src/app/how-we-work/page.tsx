import Link from "next/link";
import { Ban, ChevronRight, GitPullRequest, LockKeyhole, ShieldCheck, UserCheck, type LucideIcon } from "lucide-react";
import { processPhases } from "@/content/process";
import { pageMetadata } from "@/lib/site";
import { CtaBand } from "@/components/sections/cta-band";
import { ReviewVisual } from "@/components/how-we-work/review-visual";
import { WorkflowSteps } from "@/components/how-we-work/workflow-steps";
import { LaunchTimeline } from "@/components/sections/launch-timeline";
import { PhasePanel } from "@/components/how-we-work/phase-panel";
import { PhaseBackdrop, PhaseLight } from "@/components/how-we-work/phase-light";
import { HorizontalScroll } from "@/components/ui/horizontal-scroll";
import { Reveal, Section, SectionHeading } from "@/components/ui/primitives";

export const metadata = pageMetadata({
  title: "How We Work",
  description:
    "See how Outscalers delivers: discovery, architecture, AI-assisted implementation, human code review, testing and deployment — a clear engineering process with accountability at every stage.",
  path: "/how-we-work",
  keywords: ["software delivery process", "AI-assisted development", "code review", "Outscalers methodology"],
});

const principles: { text: string; icon: LucideIcon; tone: "brand" | "human" | "data" }[] = [
  { text: "AI-generated code is never merged without review by an engineer.", icon: GitPullRequest, tone: "human" },
  { text: "Architecture, security and data-access decisions are made by people.", icon: UserCheck, tone: "brand" },
  { text: "Client data is only used with AI tools you have approved for it.", icon: LockKeyhole, tone: "data" },
  { text: "Nothing is deployed to production without passing tests and human sign-off.", icon: ShieldCheck, tone: "human" },
  { text: "When AI isn't the right tool, we don't use it.", icon: Ban, tone: "brand" },
];

const legend = [
  { tone: "human", label: "People decide" },
  { tone: "brand", label: "AI drafts" },
  { tone: "data", label: "Checks run automatically" },
] as const;

export default function HowWeWorkPage() {
  return (
    <>
      {/* Hero: split header (headline left, lead right), with the review scene full width below */}
      <section className="relative overflow-hidden bg-ink-950 pb-12 pt-28 sm:pb-16 lg:pt-36">
        <div aria-hidden className="glow-brand pointer-events-none absolute -right-40 -top-40 size-[36rem] opacity-60" />
        <div className="container-site relative">
          <nav aria-label="Breadcrumb" className="mb-8">
            <ol className="flex flex-wrap items-center gap-1.5 text-sm text-fg-subtle">
              <li>
                <Link href="/" className="transition-colors hover:text-fg">
                  Home
                </Link>
              </li>
              <li className="flex items-center gap-1.5">
                <ChevronRight aria-hidden className="size-3.5" />
                <span aria-current="page" className="text-fg-muted">
                  How We Work
                </span>
              </li>
            </ol>
          </nav>
          <div className="grid gap-8 lg:grid-cols-[1.25fr_1fr] lg:items-end lg:gap-16">
            <div>
              <p className="eyebrow mb-5">How we work</p>
              <h1 className="text-display-lg font-semibold">
                Engineers in charge. <span className="text-gradient">AI in the toolkit.</span>
              </h1>
            </div>
            <div>
              <p className="text-lead text-fg-muted">
                Our delivery process puts experienced people at every decision point and uses AI where it makes the work
                faster or better. Here&apos;s what that looks like in practice.
              </p>
              <ul className="mt-6 flex flex-wrap gap-2">
                {legend.map((l) => (
                  <li key={l.label} className="hw-legend">
                    <span aria-hidden className="wf-dot" data-tone={l.tone} /> {l.label}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div data-reveal className="mt-10 lg:mt-12">
            <ReviewVisual />
          </div>
        </div>
      </section>

      {/* Workflow overview */}
      <Section tone="dark" labelledBy="loop-title" className="overflow-x-clip">
        <div className="container-site">
          <SectionHeading
            id="loop-title"
            eyebrow="The workflow"
            title="AI does the work. People stay in control."
            lead="Follow one feature from idea to production, and see where engineers hold the controls at every step."
          />
        </div>
        <WorkflowSteps />
      </Section>

      {/* Typical timeline */}
      <Section tone="raised" labelledBy="hww-launch-title">
        <div className="container-site">
          <LaunchTimeline headingId="hww-launch-title" />
        </div>
      </Section>

      {/* Phase by phase: full-screen panels that pin and slide sideways as you scroll, like the services */}
      <Section labelledBy="phases-title" className="pb-0!">
        <div className="container-site">
          <SectionHeading id="phases-title" eyebrow="Phase by phase" title="Who does what, and where the checkpoints are" />
        </div>
        <div className="mt-10 lg:mt-0">
          <HorizontalScroll label="Delivery phases" stops={processPhases.map((p) => p.short)} speed={0.5} dark stage={<PhaseLight />} backdrop={<PhaseBackdrop />}>
            {processPhases.map((p, i) => (
              <PhasePanel key={p.id} phase={p} index={i} total={processPhases.length} />
            ))}
          </HorizontalScroll>
        </div>
      </Section>

      {/* Principles */}
      <Section tone="raised" labelledBy="principles-title">
        <div className="container-site grid gap-12 lg:grid-cols-[1fr_1.3fr] lg:gap-20">
          <SectionHeading
            id="principles-title"
            eyebrow="Responsible AI in delivery"
            title="Ground rules we work by"
            lead="Speed is only useful if the result can be trusted. These rules apply to every project."
          />
          <ul className="grid gap-3">
            {principles.map((p, i) => (
              <Reveal as="li" key={p.text} delay={i * 60} className="hw-rule">
                <span className="hs-gloss hw-rule-tile" data-tone={p.tone} aria-hidden>
                  <p.icon className="size-[48%]" strokeWidth={1.8} />
                </span>
                <span className="text-[1.0625rem] font-medium">{p.text}</span>
              </Reveal>
            ))}
          </ul>
        </div>
      </Section>

      <CtaBand />
    </>
  );
}
