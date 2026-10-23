import { getService } from "@/content/services";
import { pageMetadata } from "@/lib/site";
import { Reveal, Section, SectionHeading } from "@/components/ui/primitives";
import {
  ApproachBlock,
  CapabilitiesBlock,
  DeliverablesBlock,
  ProblemsBlock,
  ProcessBlock,
  ServiceFooter,
  ServiceHero,
} from "@/components/sections/service-blocks";

const service = getService("software-development");

export const metadata = pageMetadata({
  title: service.title,
  description: service.metaDescription,
  path: "/services/software-development",
});

const workflow = [
  { task: "Project setup & boilerplate", ai: "Generates scaffolding from agreed conventions", human: "Defines the conventions and structure" },
  { task: "Feature implementation", ai: "Suggests code for well-specified, routine parts", human: "Writes critical logic; accepts, edits or rejects suggestions" },
  { task: "Understanding legacy code", ai: "Summarises modules and traces dependencies", human: "Verifies findings and plans safe changes" },
  { task: "Testing", ai: "Proposes test cases and edge conditions", human: "Decides what must be tested and validates coverage" },
  { task: "Documentation", ai: "Drafts READMEs, API docs and change notes", human: "Reviews for accuracy and completeness" },
  { task: "Code review", ai: "Flags potential issues for attention", human: "Performs the review and approves the merge" },
];

export default function SoftwareDevelopmentPage() {
  return (
    <>
      <ServiceHero service={service} />
      <ProblemsBlock service={service} />
      <DeliverablesBlock service={service} variant="split" title="Software we build" />

      {/* Signature: AI in the engineering workflow */}
      <Section tone="deep" labelledBy="workflow-title">
        <div className="container-site">
          <SectionHeading
            id="workflow-title"
            eyebrow="AI-assisted, human-led"
            title="How AI fits into our engineering workflow"
            lead="AI is a tool our engineers use for specific tasks. Here's where — and who stays responsible."
          />
          <Reveal className="mt-12 overflow-hidden rounded-card border border-line">
            <table className="w-full text-left text-[0.9375rem]">
              <caption className="sr-only">Division of work between AI tools and engineers</caption>
              <thead className="hidden bg-ink-800 font-mono text-xs uppercase tracking-wider text-fg-subtle md:table-header-group">
                <tr>
                  <th scope="col" className="px-6 py-4 font-medium">Task</th>
                  <th scope="col" className="px-6 py-4 font-medium text-brand-300">AI assists by</th>
                  <th scope="col" className="px-6 py-4 font-medium text-human-accent">Engineer is responsible for</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {workflow.map((row) => (
                  <tr key={row.task} className="grid bg-ink-850 md:table-row">
                    <th scope="row" className="px-6 pt-5 font-semibold md:py-5">{row.task}</th>
                    <td className="px-6 pt-2 text-fg-muted md:py-5">
                      <span className="mr-2 font-mono text-[11px] uppercase text-brand-300 md:hidden">AI:</span>
                      {row.ai}
                    </td>
                    <td className="px-6 pb-5 pt-2 text-fg md:py-5">
                      <span className="mr-2 font-mono text-[11px] uppercase text-human-accent md:hidden">Engineer:</span>
                      {row.human}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Reveal>
        </div>
      </Section>

      <ApproachBlock service={service} tone="dark" />
      <ProcessBlock service={service} />
      <CapabilitiesBlock service={service} />
      <ServiceFooter service={service} ctaTitle="Have software to build or modernise? Let's plan it." />
    </>
  );
}
