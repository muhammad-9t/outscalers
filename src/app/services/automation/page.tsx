import { ArrowDown, Sparkles, UserRound } from "lucide-react";
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
import { cn } from "@/lib/cn";

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

const kindStyle: Record<Step["kind"], string> = {
  manual: "border-line-strong text-fg-muted",
  auto: "border-line-strong text-fg",
  ai: "border-brand-500/50 text-fg",
  human: "border-human-accent/50 text-fg",
};

function StepList({ steps }: { steps: Step[] }) {
  return (
    <ol className="space-y-2">
      {steps.map((s, i) => (
        <li key={s.text}>
          <div className={cn("flex items-center gap-3 rounded-xl border bg-ink-900/60 px-4 py-3 text-[0.9375rem]", kindStyle[s.kind])}>
            {s.kind === "ai" && <Sparkles aria-label="AI-assisted" className="size-4 shrink-0 text-brand-400" />}
            {s.kind === "human" && <UserRound aria-label="Human decision" className="size-4 shrink-0 text-human-accent" />}
            {(s.kind === "auto" || s.kind === "manual") && (
              <span aria-hidden className={cn("size-1.5 shrink-0 rounded-full", s.kind === "auto" ? "bg-brand-400" : "bg-fg-subtle")} />
            )}
            {s.text}
          </div>
          {i < steps.length - 1 && <ArrowDown aria-hidden className="mx-auto my-1 size-3.5 text-fg-subtle" />}
        </li>
      ))}
    </ol>
  );
}

export default function AutomationPage() {
  return (
    <>
      <ServiceHero service={service} />

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
            <Reveal className="card p-6 sm:p-8">
              <h3 className="font-mono text-xs uppercase tracking-wider text-fg-subtle">Before: manual</h3>
              <div className="mt-6">
                <StepList steps={before} />
              </div>
            </Reveal>
            <Reveal delay={120} className="card border-brand-500/30 p-6 sm:p-8">
              <h3 className="font-mono text-xs uppercase tracking-wider text-brand-300">After: automated, with checkpoints</h3>
              <div className="mt-6">
                <StepList steps={after} />
              </div>
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
