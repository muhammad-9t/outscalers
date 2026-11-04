import type { CSSProperties } from "react";
import { Check, Sparkles, UserRound } from "lucide-react";
import type { Service } from "@/content/services";
import { ButtonLink, Reveal, Section, SectionHeading } from "@/components/ui/primitives";
import { PageHero } from "@/components/sections/page-hero";
import { RelatedServices } from "@/components/sections/service-cards";
import { ServiceIllustration } from "@/components/illustrations/service-illustrations";
import { CtaBand } from "@/components/sections/cta-band";
import { breadcrumbJsonLd, serviceJsonLd } from "@/lib/seo";
import { cn } from "@/lib/cn";

const delay = (ms: number) => ({ "--reveal-delay": `${ms}ms` }) as CSSProperties;

export function ServiceHero({ service }: { service: Service }) {
  return (
    <PageHero
      eyebrow={service.hero.eyebrow}
      title={service.hero.title}
      lead={service.hero.lead}
      crumbs={[
        { label: "Home", href: "/" },
        { label: "Services", href: "/services" },
        { label: service.title, href: `/services/${service.slug}` },
      ]}
      actions={
        <ButtonLink href="#approach" variant="secondary">
          Our approach
        </ButtonLink>
      }
      visual={
        <div className="mx-auto w-full max-w-xl lg:max-w-none lg:scale-105">
          <ServiceIllustration slug={service.slug} />
        </div>
      }
    />
  );
}

/** Business problems. `numbered` renders a compact editorial list; `cards` a three-up grid. */
export function ProblemsBlock({
  service,
  variant = "cards",
  title = "Problems we help solve",
  tone = "dark",
}: {
  service: Service;
  variant?: "cards" | "numbered";
  title?: string;
  tone?: "dark" | "raised";
}) {
  return (
    <Section tone={tone} labelledBy="problems-title">
      <div className="container-site">
        {variant === "cards" ? (
          <>
            <SectionHeading id="problems-title" eyebrow="The challenge" title={title} />
            <ul className="mt-12 grid gap-5 md:grid-cols-3">
              {service.problems.map((p, i) => (
                <li key={p.title} data-reveal style={delay(i * 80)} className="card p-6 sm:p-7">
                  <span className="font-mono text-xs text-human-accent">Problem 0{i + 1}</span>
                  <h3 className="mt-3 text-lg font-semibold">{p.title}</h3>
                  <p className="mt-2 text-[0.9375rem] leading-relaxed text-fg-muted">{p.body}</p>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <div className="grid gap-12 lg:grid-cols-[1fr_1.3fr] lg:gap-20">
            <SectionHeading id="problems-title" eyebrow="The challenge" title={title} />
            <ol className="divide-y divide-line border-y border-line">
              {service.problems.map((p, i) => (
                <li key={p.title} data-reveal style={delay(i * 80)} className="grid gap-2 py-6 sm:grid-cols-[3rem_1fr]">
                  <span className="font-mono text-sm text-human-accent">0{i + 1}</span>
                  <div>
                    <h3 className="text-lg font-semibold">{p.title}</h3>
                    <p className="mt-1.5 text-[0.9375rem] leading-relaxed text-fg-muted">{p.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        )}
      </div>
    </Section>
  );
}

/** What we deliver. `grid` for many items, `split` pairs a sticky heading with a list. */
export function DeliverablesBlock({
  service,
  variant = "grid",
  tone = "raised",
  title = "What we deliver",
}: {
  service: Service;
  variant?: "grid" | "split";
  tone?: "dark" | "raised" | "deep";
  title?: string;
}) {
  return (
    <Section tone={tone} labelledBy="deliver-title">
      <div className="container-site">
        {variant === "grid" ? (
          <>
            <SectionHeading id="deliver-title" eyebrow="Deliverables" title={title} />
            <ul className="mt-12 grid gap-px overflow-hidden rounded-card border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
              {service.deliverables.map((d, i) => (
                <li key={d.title} data-reveal style={delay((i % 3) * 70)} className="bg-ink-850 p-6 sm:p-7">
                  <Check aria-hidden className="size-5 text-brand-400" />
                  <h3 className="mt-4 text-lg font-semibold">{d.title}</h3>
                  <p className="mt-2 text-[0.9375rem] leading-relaxed text-fg-muted">{d.body}</p>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <div className="grid gap-12 lg:grid-cols-[1fr_1.4fr] lg:gap-20">
            <div className="lg:sticky lg:top-28 lg:self-start">
              <SectionHeading id="deliver-title" eyebrow="Deliverables" title={title} />
            </div>
            <ul className="grid gap-4">
              {service.deliverables.map((d, i) => (
                <li key={d.title} data-reveal style={delay(i * 50)} className="card-flat flex gap-4 p-5 sm:p-6">
                  <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg bg-brand-500/10 text-brand-300">
                    <Check aria-hidden className="size-4" />
                  </span>
                  <div>
                    <h3 className="font-semibold">{d.title}</h3>
                    <p className="mt-1 text-[0.9375rem] leading-relaxed text-fg-muted">{d.body}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </Section>
  );
}

/** Side-by-side: what AI assists with vs what engineers own. */
export function ApproachBlock({ service, tone = "dark" }: { service: Service; tone?: "deep" | "dark" }) {
  return (
    <Section tone={tone} id="approach" labelledBy="approach-title">
      <div className="container-site">
        <SectionHeading
          id="approach-title"
          eyebrow="Human + AI approach"
          title="Clear roles for people and AI"
          lead="AI makes our engineers faster. It doesn't replace their judgment — and its output is always reviewed."
        />
        <div className="mt-12 grid gap-5 lg:grid-cols-2">
          <Reveal className="card p-6 sm:p-8">
            <p className="chip chip-human">
              <UserRound aria-hidden className="size-3.5" /> Engineers own
            </p>
            <ul className="mt-6 space-y-4">
              {service.approach.human.map((h) => (
                <li key={h} className="flex gap-3 text-[0.9375rem] leading-relaxed text-fg">
                  <span aria-hidden className="mt-2 size-1.5 shrink-0 rounded-full bg-human-accent" />
                  {h}
                </li>
              ))}
            </ul>
          </Reveal>
          <Reveal delay={100} className="card p-6 sm:p-8">
            <p className="chip chip-ai">
              <Sparkles aria-hidden className="size-3.5" /> AI assists
            </p>
            <ul className="mt-6 space-y-4">
              {service.approach.ai.map((a) => (
                <li key={a} className="flex gap-3 text-[0.9375rem] leading-relaxed text-fg-muted">
                  <span aria-hidden className="mt-2 size-1.5 shrink-0 rounded-full bg-brand-400" />
                  {a}
                </li>
              ))}
            </ul>
            <p className="mt-6 border-t border-line pt-4 text-sm text-fg-subtle">
              AI suggestions are drafts. An engineer reviews, tests and approves before anything is merged.
            </p>
          </Reveal>
        </div>
      </div>
    </Section>
  );
}

export function CapabilitiesBlock({ service, tone = "dark" }: { service: Service; tone?: "dark" | "raised" }) {
  return (
    <Section tone={tone} tight labelledBy="caps-title">
      <div className="container-site grid gap-10 lg:grid-cols-[1fr_2fr] lg:gap-16">
        <SectionHeading id="caps-title" eyebrow="Technical capabilities" title="Tools and techniques" />
        <dl className="grid gap-8 sm:grid-cols-2">
          {service.capabilities.map((c, i) => (
            <Reveal key={c.group} delay={i * 60}>
              <dt className="font-mono text-xs uppercase tracking-wider text-fg-subtle">{c.group}</dt>
              <dd className="mt-3 flex flex-wrap gap-2">
                {c.items.map((item) => (
                  <span key={item} className="chip">
                    {item}
                  </span>
                ))}
              </dd>
            </Reveal>
          ))}
        </dl>
      </div>
    </Section>
  );
}

/** Delivery process: horizontal steps on large screens, or a vertical timeline. */
export function ProcessBlock({
  service,
  variant = "steps",
  tone = "raised",
}: {
  service: Service;
  variant?: "steps" | "timeline";
  tone?: "raised" | "dark" | "deep";
}) {
  return (
    <Section tone={tone} labelledBy="process-title">
      <div className="container-site">
        {variant === "steps" ? (
          <>
            <SectionHeading id="process-title" eyebrow="Delivery process" title="How an engagement runs" />
            <ol
              className={cn(
                "relative mt-12 grid gap-8 sm:grid-cols-2",
                service.process.length === 5 ? "lg:grid-cols-5" : "lg:grid-cols-4",
              )}
            >
              <span aria-hidden className="absolute left-0 right-0 top-4 hidden h-px bg-gradient-to-r from-brand-500/60 via-line-strong to-transparent lg:block" />
              {service.process.map((p, i) => (
                <li key={p.title} data-reveal style={delay(i * 90)} className="relative">
                  <span className="relative grid size-8 place-items-center rounded-full border border-brand-500/50 bg-ink-900 font-mono text-xs text-brand-300">
                    {i + 1}
                  </span>
                  <h3 className="mt-5 font-semibold">{p.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-fg-muted">{p.body}</p>
                </li>
              ))}
            </ol>
          </>
        ) : (
          <div className="grid gap-12 lg:grid-cols-[1fr_1.35fr] lg:gap-16">
            <SectionHeading
              id="process-title"
              eyebrow="Delivery process"
              title="How an engagement runs"
              lead="A staged path from first review to a running system, so you see progress early and can adjust at every step."
              className="lg:sticky lg:top-28 lg:self-start"
            />
            <ol className="relative">
              <span
                aria-hidden
                className="absolute bottom-8 left-5 top-8 w-px bg-linear-to-b from-brand-500/70 via-line-strong to-line"
              />
              {service.process.map((p, i) => (
                <li key={p.title} data-reveal style={delay(i * 80)} className="relative flex gap-5 pb-5 last:pb-0">
                  <span className="relative z-10 mt-5 grid size-10 shrink-0 place-items-center rounded-full border border-brand-500/60 bg-ink-900 font-mono text-sm text-brand-300">
                    {i + 1}
                  </span>
                  <div className="card flex-1 p-5 sm:p-6">
                    <p className="font-mono text-[0.6875rem] uppercase tracking-wider text-fg-subtle">
                      Step {String(i + 1).padStart(2, "0")} / {String(service.process.length).padStart(2, "0")}
                    </p>
                    <h3 className="mt-2 text-lg font-semibold">{p.title}</h3>
                    <p className="mt-1.5 text-[0.9375rem] leading-relaxed text-fg-muted">{p.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        )}
      </div>
    </Section>
  );
}

export function ServiceFooter({ service, ctaTitle }: { service: Service; ctaTitle: string }) {
  const path = `/services/${service.slug}`;
  const jsonLd = [
    breadcrumbJsonLd([
      { name: "Home", path: "/" },
      { name: "Services", path: "/services" },
      { name: service.title, path },
    ]),
    serviceJsonLd({ name: service.title, description: service.metaDescription, path }),
  ];

  return (
    <>
      <Section tone="dark" labelledBy="related-title">
        <div className="container-site">
          <SectionHeading id="related-title" eyebrow="Related services" title="Often combined with" />
          <div className="mt-10">
            <RelatedServices slugs={service.related} />
          </div>
        </div>
      </Section>
      <CtaBand
        title={ctaTitle}
        lead="Share your goals and constraints. We'll come back with practical options, a realistic plan and the questions worth asking."
      />
      {jsonLd.map((block, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(block) }} />
      ))}
    </>
  );
}
