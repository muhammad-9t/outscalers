import type { CSSProperties, ReactNode } from "react";
import { Check, Sparkles, UserRound } from "lucide-react";
import type { Service } from "@/content/services";
import { ButtonLink, Reveal, Section, SectionHeading } from "@/components/ui/primitives";
import { PageHero } from "@/components/sections/page-hero";
import { ServiceIllustration } from "@/components/illustrations/service-illustrations";
import { CtaBand } from "@/components/sections/cta-band";
import { breadcrumbJsonLd, serviceJsonLd } from "@/lib/seo";
import { cn } from "@/lib/cn";

const tones = ["brand", "human", "data"] as const;
const delay = (ms: number) => ({ "--reveal-delay": `${ms}ms` }) as CSSProperties;

/** `visual` replaces the older diagram illustration with a page's floating-card widget. */
export function ServiceHero({ service, visual }: { service: Service; visual?: ReactNode }) {
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
        visual ?? (
          <div className="mx-auto w-full max-w-xl lg:max-w-none lg:scale-105">
            <ServiceIllustration slug={service.slug} />
          </div>
        )
      }
    />
  );
}

/** What we deliver: one short line per card, optionally with the tech stack as a row of chips. */
export function DeliverablesBlock({
  service,
  tone = "raised",
  title = "What we deliver",
  withStack = false,
}: {
  service: Service;
  tone?: "dark" | "raised" | "deep";
  title?: string;
  /** Adds the technologies (from `capabilities`) as one row of chips under the cards */
  withStack?: boolean;
}) {
  const stack = [...new Set(service.capabilities.flatMap((c) => c.items))];
  return (
    <Section tone={tone} labelledBy="deliver-title">
      <div className="container-site">
        <SectionHeading id="deliver-title" eyebrow="Deliverables" title={title} />
        {/* Even rows: four cards sit in one row, otherwise rows of three */}
        <ul className={cn("mt-12 grid gap-4 sm:grid-cols-2", service.deliverables.length === 4 ? "lg:grid-cols-4" : "lg:grid-cols-3")}>
          {service.deliverables.map((d, i) => (
            <li key={d.title} data-reveal suppressHydrationWarning style={delay((i % 3) * 70)} className="card card-interactive p-6 sm:p-7">
              <span className="sd-icon" data-tone={tones[i % 3]}>
                <Check aria-hidden className="size-4" strokeWidth={2.5} />
              </span>
              <h3 className="mt-5 text-lg font-semibold">{d.title}</h3>
              <p className="mt-2 text-[0.9375rem] leading-relaxed text-fg-muted">{d.body}</p>
            </li>
          ))}
        </ul>
        {withStack && <StackChips items={stack} />}
      </div>
    </Section>
  );
}

/** The technologies we use, as one compact row of chips. */
function StackChips({ items }: { items: string[] }) {
  return (
    <Reveal className="mt-10">
      <p className="text-sm font-semibold text-fg-muted">Technologies we use</p>
      <ul className="mt-3 flex flex-wrap gap-2">
        {items.map((t) => (
          <li key={t} className="chip">
            {t}
          </li>
        ))}
      </ul>
    </Reveal>
  );
}

/** One compact card: what engineers own next to what AI assists with (three points each). */
export function RolesStrip({ service, tone = "dark" }: { service: Service; tone?: "dark" | "raised" }) {
  const cols = [
    { label: "Engineers own", icon: UserRound, tone: "human", items: service.approach.human.slice(0, 3) },
    { label: "AI assists", icon: Sparkles, tone: "brand", items: service.approach.ai.slice(0, 3) },
  ] as const;
  return (
    <Section tone={tone} tight id="approach" labelledBy="approach-title">
      <div className="container-site">
        <SectionHeading id="approach-title" eyebrow="AI-accelerated, human-led" title="Who does what" />
        <Reveal className="card mt-10 grid divide-line p-6 sm:p-8 md:grid-cols-2 md:divide-x">
          {cols.map((c, i) => (
            <div key={c.label} className={cn(i === 0 ? "pb-6 md:pr-8 md:pb-0" : "border-t border-line pt-6 md:border-t-0 md:pt-0 md:pl-8")}>
              <p className="flex items-center gap-3 font-semibold">
                <span className="hs-gloss sd-tile" data-tone={c.tone} aria-hidden>
                  <c.icon className="size-[48%]" strokeWidth={1.8} />
                </span>
                {c.label}
              </p>
              <ul className="mt-4 space-y-2.5">
                {c.items.map((t) => (
                  <li key={t} className="flex gap-3 text-[0.9375rem] leading-relaxed text-fg-muted">
                    <span aria-hidden className={cn("sd-mark", c.tone === "human" && "sd-mark-human")}>
                      <Check className="size-3" strokeWidth={3} />
                    </span>
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </Reveal>
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
