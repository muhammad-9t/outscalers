import { getService } from "@/content/services";
import { pageMetadata } from "@/lib/site";
import { Reveal, Section, SectionHeading } from "@/components/ui/primitives";
import { DeliverablesBlock, RolesStrip, ServiceFooter, ServiceHero } from "@/components/sections/service-blocks";
import { SecurityHeroVisual } from "@/components/services/security-hero-visual";

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

const level: Record<Coverage, { n: number; label: string }> = {
  primary: { n: 2, label: "Lead" },
  supporting: { n: 1, label: "Support" },
  none: { n: 0, label: "Not used" },
};

/** How much a safeguard rests on automation or on people: two soft segments. Styles: .sdsq-meter. */
function Meter({ who, value, tone }: { who: string; value: Coverage; tone: "brand" | "human" }) {
  const l = level[value];
  return (
    <div className="sdsq-meter" data-tone={tone} data-level={l.n}>
      <p className="sdsq-meter-head">
        {who}
        <b>
          {l.label}
          <span className="sr-only"> ({value === "none" ? "not applicable" : value})</span>
        </b>
      </p>
      <span className="sdsq-segs" aria-hidden>
        <span data-on={l.n >= 1 || undefined} />
        <span data-on={l.n >= 2 || undefined} />
      </span>
    </div>
  );
}

export default function SecurityQualityPage() {
  return (
    <>
      <ServiceHero service={service} visual={<SecurityHeroVisual />} />

      {/* Signature: safeguards matrix */}
      <Section labelledBy="matrix-title">
        <div className="container-site">
          <SectionHeading
            id="matrix-title"
            eyebrow="Complementary safeguards"
            title="Automated checks and human review cover different risks"
            lead="Automation is consistent and fast. People notice what was never written down. We rely on both."
          />
          <ul className="mt-12 grid gap-3" aria-label="Which safeguards are led by automation and which by people">
            {safeguards.map((g, i) => (
              <Reveal as="li" key={g.name} delay={i * 60} className="sdsq-safe">
                <div>
                  <h3 className="font-semibold">{g.name}</h3>
                  <p className="mt-1 text-[0.9375rem] text-fg-muted">Helps catch: {g.catches.charAt(0).toLowerCase() + g.catches.slice(1)}</p>
                </div>
                <Meter who="Automated" value={g.automated} tone="brand" />
                <Meter who="People" value={g.human} tone="human" />
              </Reveal>
            ))}
          </ul>
        </div>
      </Section>

      <DeliverablesBlock service={service} tone="raised" title="Security and quality services" withStack />
      <RolesStrip service={service} />
      <ServiceFooter service={service} ctaTitle="Want more confidence in every release?" />
    </>
  );
}
