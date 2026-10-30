import { Check, Minus } from "lucide-react";
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

const service = getService("security-quality");

export const metadata = pageMetadata({
  title: service.title,
  description: service.metaDescription,
  path: "/services/security-quality",
});

type Coverage = "primary" | "supporting" | "none";

const safeguards: { name: string; catches: string; automated: Coverage; human: Coverage }[] = [
  { name: "Unit & integration tests", catches: "Regressions in known behaviour", automated: "primary", human: "supporting" },
  { name: "Dependency & secret scanning", catches: "Known vulnerabilities, leaked credentials", automated: "primary", human: "supporting" },
  { name: "Code review", catches: "Logic errors, unsafe patterns, poor design", automated: "supporting", human: "primary" },
  { name: "Threat modelling", catches: "Architectural and business-logic risks", automated: "none", human: "primary" },
  { name: "Exploratory testing", catches: "Unexpected user paths and edge cases", automated: "none", human: "primary" },
  { name: "Monitoring & alerting", catches: "Issues that only appear in production", automated: "primary", human: "supporting" },
];

function CoverageCell({ value, tone }: { value: Coverage; tone: "ai" | "human" }) {
  if (value === "none")
    return (
      <span className="inline-flex items-center gap-1.5 text-fg-subtle">
        <Minus aria-hidden className="size-4" /> Not applicable
      </span>
    );
  return (
    <span className={value === "primary" ? (tone === "ai" ? "text-brand-300" : "text-human-accent") : "text-fg-muted"}>
      <span className="inline-flex items-center gap-1.5">
        <Check aria-hidden className="size-4" />
        {value === "primary" ? "Primary" : "Supporting"}
      </span>
    </span>
  );
}

export default function SecurityQualityPage() {
  return (
    <>
      <ServiceHero service={service} />
      <ProblemsBlock service={service} variant="numbered" title="Why quality needs more than one safeguard" />

      {/* Signature: safeguards matrix */}
      <Section labelledBy="matrix-title">
        <div className="container-site">
          <SectionHeading
            id="matrix-title"
            eyebrow="Complementary safeguards"
            title="Automated checks and human review cover different risks"
            lead="Automation is consistent and fast. People notice what was never written down. We rely on both."
          />
          <Reveal className="mt-12 overflow-x-auto rounded-card border border-line">
            <table className="w-full min-w-[40rem] text-left text-[0.9375rem]">
              <caption className="sr-only">Which safeguards are led by automation and which by people</caption>
              <thead className="bg-ink-800 font-mono text-xs uppercase tracking-wider text-fg-subtle">
                <tr>
                  <th scope="col" className="px-6 py-4 font-medium">Safeguard</th>
                  <th scope="col" className="px-6 py-4 font-medium">Helps catch</th>
                  <th scope="col" className="px-6 py-4 font-medium">Automated</th>
                  <th scope="col" className="px-6 py-4 font-medium">Human</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line bg-ink-850">
                {safeguards.map((s) => (
                  <tr key={s.name}>
                    <th scope="row" className="px-6 py-4 font-semibold">{s.name}</th>
                    <td className="px-6 py-4 text-fg-muted">{s.catches}</td>
                    <td className="px-6 py-4"><CoverageCell value={s.automated} tone="ai" /></td>
                    <td className="px-6 py-4"><CoverageCell value={s.human} tone="human" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Reveal>
        </div>
      </Section>

      <DeliverablesBlock service={service} tone="dark" title="Security and quality services" />
      <ApproachBlock service={service} />
      <ProcessBlock service={service} />
      <CapabilitiesBlock service={service} />
      <ServiceFooter service={service} ctaTitle="Want more confidence in every release?" />
    </>
  );
}
