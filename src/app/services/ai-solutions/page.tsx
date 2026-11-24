import { Check, CircleCheck, Signpost, Eye, FileSearch, KeyRound, LifeBuoy, X } from "lucide-react";
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
import { AiHeroVisual } from "@/components/services/ai-hero-visual";

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
  { icon: KeyRound, tone: "brand", title: "Permission-aware", body: "Assistants only see what the user is allowed to see." },
  { icon: FileSearch, tone: "human", title: "Grounded answers", body: "Responses reference their sources so people can verify them." },
  { icon: LifeBuoy, tone: "brand", title: "Human escalation", body: "Low-confidence or sensitive cases route to a person." },
  { icon: Eye, tone: "data", title: "Observable", body: "Inputs, outputs and feedback are logged for review and tuning." },
] as const;

export default function AiSolutionsPage() {
  return (
    <>
      <ServiceHero service={service} visual={<AiHeroVisual />} />
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
            <Reveal className="card sd-fit-brand p-6 sm:p-8">
              <h3 className="flex items-center gap-3 text-lg font-semibold">
                <span className="hs-gloss sd-tile" data-tone="brand" aria-hidden>
                  <CircleCheck className="size-[48%]" strokeWidth={1.8} />
                </span>
                Often a good fit
              </h3>
              <ul className="mt-6 space-y-3 text-[0.9375rem] text-fg-muted">
                {goodFit.map((g) => (
                  <li key={g} className="flex gap-3">
                    <span aria-hidden className="sd-mark">
                      <Check className="size-3" strokeWidth={3} />
                    </span>
                    {g}
                  </li>
                ))}
              </ul>
            </Reveal>
            <Reveal delay={100} className="card sd-fit-human p-6 sm:p-8">
              <h3 className="flex items-center gap-3 text-lg font-semibold">
                <span className="hs-gloss sd-tile" data-tone="human" aria-hidden>
                  <Signpost className="size-[48%]" strokeWidth={1.8} />
                </span>
                Usually needs another approach
              </h3>
              <ul className="mt-6 space-y-3 text-[0.9375rem] text-fg-muted">
                {poorFit.map((g) => (
                  <li key={g} className="flex gap-3">
                    <span aria-hidden className="sd-mark">
                      <X className="size-3" strokeWidth={3} />
                    </span>
                    {g}
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
          <h3 className="mt-14 text-xl font-semibold">Guardrails built into every assistant</h3>
          <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {guardrails.map((g, i) => (
              <Reveal as="li" key={g.title} delay={i * 60} className="card card-interactive p-6">
                <span className="sd-icon" data-tone={g.tone}>
                  <g.icon aria-hidden className="size-4" />
                </span>
                <h4 className="mt-5 font-semibold">{g.title}</h4>
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
