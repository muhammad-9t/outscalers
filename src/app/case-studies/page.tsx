import type { CSSProperties } from "react";
import { FileClock } from "lucide-react";
import { caseStudies } from "@/content/case-studies";
import { pageMetadata } from "@/lib/site";
import { PageHero } from "@/components/sections/page-hero";
import { CaseStudyCard } from "@/components/sections/case-study-card";
import { CtaBand } from "@/components/sections/cta-band";
import { Reveal, Section } from "@/components/ui/primitives";

export const metadata = pageMetadata({
  title: "Case Studies",
  description:
    "Examples of software, cloud, data and security engineering work by Outscalers — the challenges, our approach and the technology involved.",
  path: "/case-studies",
});

export default function CaseStudiesPage() {
  const hasDrafts = caseStudies.some((c) => c.status === "draft");

  return (
    <>
      <PageHero
        eyebrow="Case studies"
        title="Real problems, engineered carefully"
        lead="How we approach challenges in scaling, reliability and compliance. We publish client names and results only with permission."
        crumbs={[
          { label: "Home", href: "/" },
          { label: "Case Studies", href: "/case-studies" },
        ]}
      />
      <Section labelledBy="cs-list-title">
        <div className="container-site">
          <h2 id="cs-list-title" className="sr-only">
            All case studies
          </h2>
          {hasDrafts && (
            <Reveal className="mb-10 flex gap-3 rounded-xl border border-brand-300/30 bg-brand-300/5 p-4 text-sm text-fg-muted sm:items-center">
              <FileClock aria-hidden className="size-5 shrink-0 text-brand-300" />
              <p>
                Profiles marked <strong className="font-semibold text-brand-300">Draft</strong> are being confirmed
                with clients. Verified results, screenshots and client details will be added once approved.
              </p>
            </Reveal>
          )}
          <ul className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {caseStudies.map((c, i) => (
              <li key={c.slug} data-reveal style={{ "--reveal-delay": `${i * 80}ms` } as CSSProperties}>
                <CaseStudyCard study={c} />
              </li>
            ))}
          </ul>
        </div>
      </Section>
      <CtaBand title="Could your project be our next case study?" />
    </>
  );
}
