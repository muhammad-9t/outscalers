import { FileCode2, FlaskConical, GitPullRequest, History, Sparkles, UserRound } from "lucide-react";
import { getService } from "@/content/services";
import { pageMetadata } from "@/lib/site";
import { Reveal, Section, SectionHeading } from "@/components/ui/primitives";
import { DeliverablesBlock, ServiceFooter, ServiceHero } from "@/components/sections/service-blocks";
import { SoftwareHeroVisual } from "@/components/services/software-hero-visual";

const service = getService("software-development");

export const metadata = pageMetadata({
  title: service.title,
  description: service.metaDescription,
  path: "/services/software-development",
});

const workflow = [
  { icon: FileCode2, task: "Feature implementation", ai: "Suggests code for well-specified, routine parts", human: "Writes critical logic; accepts, edits or rejects suggestions" },
  { icon: History, task: "Understanding legacy code", ai: "Summarises modules and traces dependencies", human: "Verifies findings and plans safe changes" },
  { icon: FlaskConical, task: "Testing", ai: "Proposes test cases and edge conditions", human: "Decides what must be tested and validates coverage" },
  { icon: GitPullRequest, task: "Code review", ai: "Flags potential issues for attention", human: "Performs the review and approves the merge" },
];

export default function SoftwareDevelopmentPage() {
  return (
    <>
      <ServiceHero service={service} visual={<SoftwareHeroVisual />} />
      <DeliverablesBlock service={service} title="Software we build" withStack />

      {/* Signature: AI in the engineering workflow */}
      <Section id="approach" labelledBy="workflow-title">
        <div className="container-site">
          <SectionHeading
            id="workflow-title"
            eyebrow="AI-assisted, human-led"
            title="How AI fits into our engineering workflow"
            lead="AI speeds up specific tasks. An engineer stays responsible for every one."
          />
          <div className="mt-12 hidden gap-4 px-6 md:grid md:grid-cols-[minmax(0,0.85fr)_1fr_1fr]" aria-hidden>
            <span className="text-sm font-semibold text-fg-muted">Task</span>
            <span className="sdsw-legend" data-tone="brand">
              <Sparkles className="size-3.5" /> AI assists by
            </span>
            <span className="sdsw-legend" data-tone="human">
              <UserRound className="size-3.5" /> Engineer is responsible for
            </span>
          </div>
          <ul className="mt-6 grid gap-3 md:mt-4" aria-label="Division of work between AI tools and engineers">
            {workflow.map((row, i) => (
              <Reveal as="li" key={row.task} delay={i * 60} className="sdsw-task">
                <h3 className="flex items-center gap-3 font-semibold">
                  <span className="sd-icon" data-tone={i % 2 ? "data" : "human"}>
                    <row.icon aria-hidden className="size-4" />
                  </span>
                  {row.task}
                </h3>
                <p className="sdsw-cell" data-tone="brand">
                  <span className="sdsw-cell-label">
                    <Sparkles aria-hidden className="size-3.5" /> AI
                  </span>
                  {row.ai}
                </p>
                <p className="sdsw-cell" data-tone="human">
                  <span className="sdsw-cell-label">
                    <UserRound aria-hidden className="size-3.5" /> Engineer
                  </span>
                  {row.human}
                </p>
              </Reveal>
            ))}
          </ul>
        </div>
      </Section>

      <ServiceFooter service={service} ctaTitle="Have software to build or modernise? Let's plan it." />
    </>
  );
}
