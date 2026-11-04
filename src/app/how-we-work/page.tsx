import type { CSSProperties } from "react";
import { CircleCheck, ShieldCheck, Sparkles, UserRound } from "lucide-react";
import { processPhases } from "@/content/process";
import { pageMetadata } from "@/lib/site";
import { PageHero } from "@/components/sections/page-hero";
import { CtaBand } from "@/components/sections/cta-band";
import { DeliveryConsole } from "@/components/how-we-work/delivery-console";
import { WorkflowLoop } from "@/components/illustrations/workflow-loop";
import { LaunchTimeline } from "@/components/sections/launch-timeline";
import { Reveal, Section, SectionHeading } from "@/components/ui/primitives";

export const metadata = pageMetadata({
  title: "How We Work",
  description:
    "How Outscalers combines human engineering and AI: from validated requirements and architecture to AI-assisted implementation, human code review, testing, deployment and monitoring.",
  path: "/how-we-work",
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
            title="A loop, not a conveyor belt"
            lead="Review can always send work back. What we learn in production shapes the next iteration."
          />
          <Reveal className="card mt-10 overflow-x-auto p-4 sm:p-8">
            <WorkflowLoop className="min-w-[36rem]" />
          </Reveal>
        </div>
      </Section>

      {/* Typical timeline */}
      <Section tone="raised" labelledBy="hww-launch-title">
        <div className="container-site">
          <LaunchTimeline headingId="hww-launch-title" />
        </div>
      </Section>

      {/* Phase-by-phase narrative */}
      <Section labelledBy="phases-title">
        <div className="container-site">
          <SectionHeading
            id="phases-title"
            eyebrow="Phase by phase"
            title="Who does what, and where the checkpoints are"
          />
          <ol className="relative mt-14 space-y-6 lg:space-y-8">
            <span aria-hidden className="absolute bottom-6 left-[1.15rem] top-6 hidden w-px bg-gradient-to-b from-brand-500/60 via-line-strong to-transparent md:block lg:hidden" />
            {processPhases.map((p, i) => (
              // On large screens each card sticks below the header, a step lower than the last, so they stack as you scroll
              <li
                key={p.id}
                data-reveal
                className="relative md:pl-16 isolate lg:sticky lg:top-(--stack-top) lg:pl-0"
                style={{ "--stack-top": `calc(6rem + ${i * 1.25}rem)` } as CSSProperties}
              >
                {/* Phase number: in the timeline gutter, or inside the card once the cards stack */}
                <span className="relative z-10 mb-4 grid size-10 place-items-center rounded-full border border-brand-500/50 bg-ink-950 font-mono text-sm text-brand-300 md:absolute md:left-0 md:top-6 md:mb-0 lg:top-8 lg:left-8">
                  0{i + 1}
                </span>
                <article className="card overflow-hidden bg-ink-850 lg:shadow-[0_-20px_40px_-24px_rgb(0_0_0/0.7)]" aria-labelledby={`phase-${p.id}`}>
                  <div className="grid gap-8 p-6 sm:p-8 lg:grid-cols-[1fr_1.5fr] lg:gap-12">
                    <div className="lg:pl-14">
                      <h3 id={`phase-${p.id}`} className="text-display-md font-semibold">
                        {p.title}
                      </h3>
                      <p className="mt-3 text-[1.0625rem] leading-relaxed text-fg-muted">{p.summary}</p>
                    </div>
                    <div className="grid gap-6 sm:grid-cols-2">
                      <div>
                        <h4 className="chip chip-human">
                          <UserRound aria-hidden className="size-3.5" /> People
                        </h4>
                        <ul className="stagger-in mt-4 space-y-2.5 text-[0.9375rem]">
                          {p.human.map((h, j) => (
                            <li key={h} className="flex gap-2.5" style={{ "--i": j } as CSSProperties}>
                              <span aria-hidden className="mt-2 size-1.5 shrink-0 rounded-full bg-human-accent" />
                              {h}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="chip chip-ai">
                          <Sparkles aria-hidden className="size-3.5" /> AI assists
                        </h4>
                        <ul
                          className="stagger-in mt-4 space-y-2.5 text-[0.9375rem] text-fg-muted"
                          style={{ "--stagger-base": "380ms" } as CSSProperties}
                        >
                          {p.ai.map((a, j) => (
                            <li key={a} className="flex gap-2.5" style={{ "--i": j } as CSSProperties}>
                              <span aria-hidden className="mt-2 size-1.5 shrink-0 rounded-full bg-brand-400" />
                              {a}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                  <p className="checkpoint-bar flex items-center gap-2.5 border-t border-line bg-ink-900/60 px-6 py-3.5 text-sm sm:px-8">
                    <ShieldCheck aria-hidden className="checkpoint-icon size-4 shrink-0 text-brand-400" />
                    <span className="font-mono text-xs uppercase tracking-wider text-fg-subtle">Checkpoint</span>
                    <span>{p.checkpoint}</span>
                  </p>
                </article>
              </li>
            ))}
          </ol>
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

      <CtaBand />
    </>
  );
}
