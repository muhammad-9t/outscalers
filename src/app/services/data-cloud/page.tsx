import { Check } from "lucide-react";
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
      <ServiceHero service={service} />
      <ProblemsBlock service={service} />

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
                <div className="card h-full p-5">
                  <span className="font-mono text-xs text-brand-300">0{i + 1}</span>
                  <h3 className="mt-3 font-semibold">{s.name}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-fg-muted">{s.body}</p>
                </div>
                {i < stages.length - 1 && (
                  <span aria-hidden className="absolute -right-3 top-1/2 z-10 hidden h-px w-3 bg-brand-500/60 md:block" />
                )}
              </Reveal>
            ))}
          </ol>

          <Reveal className="mt-12 grid gap-8 rounded-card border border-line bg-ink-850 p-6 sm:p-8 lg:grid-cols-[1fr_2fr] lg:items-center">
            <div>
              <h3 className="text-xl font-semibold">Is your data ready for AI?</h3>
              <p className="mt-2 text-[0.9375rem] leading-relaxed text-fg-muted">
                AI projects succeed or fail on their data foundation. We check these first.
              </p>
            </div>
            <ul className="grid gap-3 sm:grid-cols-2">
              {readiness.map((r) => (
                <li key={r} className="flex items-start gap-2.5 text-[0.9375rem]">
                  <Check aria-hidden className="mt-0.5 size-4 shrink-0 text-brand-400" />
                  {r}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </Section>

      <DeliverablesBlock service={service} variant="split" tone="dark" title="Data and cloud services" />
      <ApproachBlock service={service} />
      <CapabilitiesBlock service={service} tone="raised" />
      <ProcessBlock service={service} variant="timeline" tone="dark" />
      <ServiceFooter service={service} ctaTitle="Ready to build on a stronger data foundation?" />
    </>
  );
}
