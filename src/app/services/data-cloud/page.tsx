import { Check, ShieldCheck } from "lucide-react";
import { getService } from "@/content/services";
import { pageMetadata } from "@/lib/site";
import { Reveal, Section, SectionHeading } from "@/components/ui/primitives";
import { DeliverablesBlock, RolesStrip, ServiceFooter, ServiceHero } from "@/components/sections/service-blocks";
import { DataHeroVisual } from "@/components/services/data-hero-visual";

const service = getService("data-cloud");

export const metadata = pageMetadata({ title: service.title, description: service.metaDescription, path: "/services/data-cloud" });

const stages = [
  { name: "Source", body: "Application databases, SaaS tools, files and events." },
  { name: "Ingest", body: "Reliable batch or streaming collection with retries." },
  { name: "Validate", body: "Schema, freshness and quality checks before data is trusted." },
  { name: "Store & model", body: "Warehouse models designed around business questions." },
  { name: "Serve", body: "Dashboards, APIs and AI workloads built on the same data." },
];

const readiness = [
  "Data has a clear owner and definition",
  "Access is governed and auditable",
  "Pipelines are monitored, with alerts",
  "Infrastructure is defined as code",
  "Costs are visible and attributed",
  "Sensitive data is identified and protected",
];

export default function DataCloudPage() {
  return (
    <>
      <ServiceHero service={service} visual={<DataHeroVisual />} />

      {/* Signature: pipeline stages + AI readiness */}
      <Section labelledBy="pipeline-title">
        <div className="container-site">
          <SectionHeading
            id="pipeline-title"
            eyebrow="From raw data to decisions"
            title="A pipeline you can trust end to end"
          />
          <ol className="mt-12 grid gap-3 md:grid-cols-5">
            {stages.map((s, i) => (
              <Reveal as="li" key={s.name} delay={i * 80} className="relative">
                <div className="card card-interactive h-full p-5">
                  <span className="sd-num">{i + 1}</span>
                  <h3 className="mt-4 font-semibold">{s.name}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-fg-muted">{s.body}</p>
                </div>
                {i < stages.length - 1 && (
                  <span aria-hidden className="sddc-link" />
                )}
              </Reveal>
            ))}
          </ol>

          <Reveal className="card mt-12 grid gap-8 p-6 sm:p-8 lg:grid-cols-[1fr_2fr] lg:items-center">
            <div>
              <span className="hs-gloss sd-tile" data-tone="data" aria-hidden>
                <ShieldCheck className="size-[48%]" strokeWidth={1.8} />
              </span>
              <h3 className="mt-5 text-xl font-semibold">Is your data ready for AI?</h3>
              <p className="mt-2 text-[0.9375rem] leading-relaxed text-fg-muted">
                AI projects succeed or fail on their data foundation. We check these first.
              </p>
            </div>
            <ul className="grid gap-3 sm:grid-cols-2">
              {readiness.map((r) => (
                <li key={r} className="sddc-check">
                  <span aria-hidden className="sd-mark sddc-mark">
                    <Check className="size-3" strokeWidth={3} />
                  </span>
                  {r}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </Section>

      <DeliverablesBlock service={service} tone="raised" title="Data and cloud services" withStack />
      <RolesStrip service={service} />
      <ServiceFooter service={service} ctaTitle="Ready to build on a stronger data foundation?" />
    </>
  );
}
