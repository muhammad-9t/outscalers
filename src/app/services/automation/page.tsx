import { Clock3, Sparkles, UserRound, Zap } from "lucide-react";
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
import { AutomationHeroVisual } from "@/components/services/automation-hero-visual";

const service = getService("automation");

export const metadata = pageMetadata({ title: service.title, description: service.metaDescription, path: "/services/automation" });

type Step = { text: string; kind: "manual" | "auto" | "ai" | "human" };

const before: Step[] = [
  { text: "Invoice arrives by email", kind: "manual" },
  { text: "Someone opens and reads it", kind: "manual" },
  { text: "Details re-typed into finance system", kind: "manual" },
  { text: "Manager approval chased by email", kind: "manual" },
  { text: "Status tracked in a spreadsheet", kind: "manual" },
];
const after: Step[] = [
  { text: "Invoice captured automatically", kind: "auto" },
  { text: "AI extracts supplier, amount and dates", kind: "ai" },
  { text: "Rules check against purchase orders", kind: "auto" },
  { text: "Exceptions and large amounts approved by a person", kind: "human" },
  { text: "Finance system updated, with an audit trail", kind: "auto" },
];

/** One workflow as a column of soft steps joined by a thin line. Styles: .sdau-flow in globals.css. */
function StepList({ steps, tone }: { steps: Step[]; tone: "muted" | "brand" }) {
  return (
    <ol className="sdau-flow" data-tone={tone}>
      {steps.map((s) => (
        <li key={s.text} className="sdau-flow-step" data-kind={s.kind}>
          <span className="sdau-flow-mark" aria-hidden>
            {s.kind === "ai" ? <Sparkles className="size-3.5" /> : s.kind === "human" ? <UserRound className="size-3.5" /> : null}
          </span>
          <span>
            {s.text}
            {s.kind === "ai" && <span className="sr-only"> (AI-assisted)</span>}
            {s.kind === "human" && <span className="sr-only"> (a person decides)</span>}
          </span>
        </li>
      ))}
    </ol>
  );
}

export default function AutomationPage() {
  return (
    <>
      <ServiceHero service={service} visual={<AutomationHeroVisual />} />

      {/* Signature: before / after */}
      <Section tone="dark" labelledBy="compare-title">
        <div className="container-site">
          <SectionHeading
            id="compare-title"
            eyebrow="Example workflow"
            title="Same process. Fewer manual steps. People still decide."
            lead="An illustrative invoice-handling workflow before and after automation. Your workflow will differ — we map it with you first."
          />
          <div className="mt-12 grid gap-5 lg:grid-cols-2">
            <Reveal className="card flex flex-col p-6 sm:p-8">
              <h3 className="flex items-center gap-3 text-lg font-semibold">
                <span className="sdau-head-tile" aria-hidden>
                  <Clock3 className="size-[48%]" strokeWidth={1.8} />
                </span>
                Before: by hand
              </h3>
              <div className="mt-6 flex-1">
                <StepList steps={before} tone="muted" />
              </div>
              <p className="sdau-sum">5 manual steps, approvals chased by email</p>
            </Reveal>
            <Reveal delay={120} className="card sdau-after flex flex-col p-6 sm:p-8">
              <h3 className="flex items-center gap-3 text-lg font-semibold">
                <span className="hs-gloss sd-tile" data-tone="brand" aria-hidden>
                  <Zap className="size-[48%]" strokeWidth={1.8} />
                </span>
                After: automated, with checkpoints
              </h3>
              <div className="mt-6 flex-1">
                <StepList steps={after} tone="brand" />
              </div>
              <p className="sdau-sum" data-tone="brand">One decision left for a person, with a full audit trail</p>
            </Reveal>
          </div>
        </div>
      </Section>

      <ProblemsBlock service={service} variant="numbered" tone="raised" title="Signs a process is ready for automation" />
      <DeliverablesBlock service={service} tone="dark" title="Automation we deliver" />
      <ApproachBlock service={service} tone="dark" />
      <ProcessBlock service={service} />
      <CapabilitiesBlock service={service} />
      <ServiceFooter service={service} ctaTitle="Which process is costing your team the most time?" />
    </>
  );
}
