import type { CSSProperties } from "react";
import { CircleCheck } from "lucide-react";
import { processPhases } from "@/content/process";
import { pageMetadata } from "@/lib/site";
import { PageHero } from "@/components/sections/page-hero";
import { CtaBand } from "@/components/sections/cta-band";
import { DeliveryConsole } from "@/components/how-we-work/delivery-console";
import { WorkflowJourney } from "@/components/how-we-work/workflow-stage";
import { LaunchTimeline } from "@/components/sections/launch-timeline";
import { PhasePanel } from "@/components/how-we-work/phase-panel";
import { HorizontalScroll } from "@/components/ui/horizontal-scroll";
import { VenomFlow } from "@/components/how-we-work/venom-flow";
import { Reveal, Section, SectionHeading } from "@/components/ui/primitives";

export const metadata = pageMetadata({
  title: "How We Work",
  description:
    "See how Outscalers delivers: discovery, architecture, AI-assisted implementation, human code review, testing and deployment — a clear engineering process with accountability at every stage.",
  path: "/how-we-work",
  keywords: ["software delivery process", "AI-assisted development", "code review", "Outscalers methodology"],
});

const principles = [
  "AI-generated code is never merged without review by an engineer.",
  "Architecture, security and data-access decisions are made by people.",
  "Client data is only used with AI tools you have approved for it.",
  "Nothing is deployed to production without passing tests and human sign-off.",
  "When AI isn't the right tool, we don't use it.",
];

export default function HowWeWorkPage() {
  return (
    <>
      {/* One ink-950 background for the whole page, with the venom flow behind every section
          (the sections themselves go transparent so it shows through). */}
      <div className="glass-scope relative isolate bg-ink-950 [&>section]:bg-transparent">
      <VenomFlow />
      <PageHero
        eyebrow="How we work"
        title={
          <>
            Engineers in charge. <span className="text-gradient">AI in the toolkit.</span>
          </>
        }
        lead="Our delivery process puts experienced people at every decision point and uses AI where it makes the work faster or better. Here's what that looks like in practice."
        crumbs={[
          { label: "Home", href: "/" },
          { label: "How We Work", href: "/how-we-work" },
        ]}
        visual={<DeliveryConsole />}
      />

      {/* Workflow overview */}
      <Section tone="dark" tight labelledBy="loop-title">
        <div className="container-site">
          <SectionHeading
            id="loop-title"
            eyebrow="The workflow"
            title="AI does the work. People stay in control."
            lead="Scroll through one feature, from idea to production, and see where engineers hold the controls at every step."
          />
        </div>
        <WorkflowJourney />
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
          <SectionHeading
            id="phases-title"
            eyebrow="Phase by phase"
            title="Who does what, and where the checkpoints are"
          />
        </div>
        <div className="mt-10 lg:mt-0">
          <HorizontalScroll label="Delivery phases" stops={processPhases.map((p) => p.short)}>
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
          <ul className="space-y-3">
            {principles.map((p, i) => (
              <Reveal as="li" key={p} delay={i * 60} className="card-flat flex items-start gap-4 p-5">
                <CircleCheck
                  aria-hidden
                  className="check-draw mt-0.5 size-5 shrink-0 text-brand-400"
                  strokeWidth={1.8}
                  style={{ "--draw-delay": `${i * 60 + 300}ms` } as CSSProperties}
                />
                <span className="text-[1.0625rem] font-medium">{p}</span>
              </Reveal>
            ))}
          </ul>
        </div>
      </Section>
      </div>

      <CtaBand />
    </>
  );
}
