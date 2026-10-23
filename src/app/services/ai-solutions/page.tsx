import { CircleCheck, CircleSlash, Eye, FileSearch, KeyRound, LifeBuoy } from "lucide-react";
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

const service = getService("ai-solutions");

export const metadata = pageMetadata({ title: service.title, description: service.metaDescription, path: "/services/ai-solutions" });

const goodFit = [
  "Answering questions from a large body of internal documents",
  "Extracting fields from documents that vary in layout",
  "Classifying and routing requests by intent or urgency",
  "Drafting responses that a person reviews before sending",
];
const poorFit = [
  "Decisions that must be fully explainable rule-by-rule",
  "Calculations that need exact, deterministic results",
  "High-impact actions with no human checkpoint",
  "Problems a simple form or workflow would already solve",
];

const guardrails = [
  { icon: KeyRound, title: "Permission-aware", body: "Assistants only see what the user is allowed to see." },
  { icon: FileSearch, title: "Grounded answers", body: "Responses reference their sources so people can verify them." },
  { icon: LifeBuoy, title: "Human escalation", body: "Low-confidence or sensitive cases route to a person." },
  { icon: Eye, title: "Observable", body: "Inputs, outputs and feedback are logged for review and tuning." },
];

export default function AiSolutionsPage() {
  return (
    <>
      <ServiceHero service={service} />
      <ProblemsBlock service={service} variant="numbered" title="Why AI initiatives stall" />
      <DeliverablesBlock service={service} title="AI capabilities we deliver" />

      {/* Signature: where AI fits */}
      <Section tone="dark" labelledBy="fit-title">
        <div className="container-site">
          <SectionHeading
            id="fit-title"
            eyebrow="Honest assessment"
            title="Where AI fits — and where it doesn't"
            lead="Not every problem needs a language model. We'll tell you when a simpler solution is the better investment."
          />
          <div className="mt-12 grid gap-5 md:grid-cols-2">
            <Reveal className="card p-6 sm:p-8">
              <h3 className="flex items-center gap-2 text-lg font-semibold">
                <CircleCheck aria-hidden className="size-5 text-brand-400" /> Often a good fit
              </h3>
              <ul className="mt-5 space-y-3 text-[0.9375rem] text-fg-muted">
                {goodFit.map((g) => (
                  <li key={g} className="flex gap-3">
                    <span aria-hidden className="mt-2 size-1.5 shrink-0 rounded-full bg-brand-400" />
                    {g}
                  </li>
                ))}
              </ul>
            </Reveal>
            <Reveal delay={100} className="card p-6 sm:p-8">
              <h3 className="flex items-center gap-2 text-lg font-semibold">
                <CircleSlash aria-hidden className="size-5 text-human-accent" /> Usually needs another approach
              </h3>
              <ul className="mt-5 space-y-3 text-[0.9375rem] text-fg-muted">
                {poorFit.map((g) => (
                  <li key={g} className="flex gap-3">
                    <span aria-hidden className="mt-2 size-1.5 shrink-0 rounded-full bg-human-accent" />
                    {g}
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
          <ul className="mt-5 grid gap-px overflow-hidden rounded-card border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
            {guardrails.map((g, i) => (
              <Reveal as="li" key={g.title} delay={i * 60} className="bg-ink-850 p-6">
                <g.icon aria-hidden className="size-5 text-brand-300" />
                <h3 className="mt-4 font-semibold">{g.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-fg-muted">{g.body}</p>
              </Reveal>
            ))}
          </ul>
        </div>
      </Section>

      <ApproachBlock service={service} />
      <ProcessBlock service={service} variant="timeline" tone="raised" />
      <CapabilitiesBlock service={service} />
      <ServiceFooter service={service} ctaTitle="Have an AI idea? Let's test whether it holds up." />
    </>
  );
}
