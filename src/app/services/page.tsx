import Link from "next/link";
import { Check } from "lucide-react";
import { services, serviceHref } from "@/content/services";
import { cn } from "@/lib/cn";
import { pageMetadata } from "@/lib/site";
import { ServiceGlyph } from "@/components/illustrations/service-glyph";
import { PageHero } from "@/components/sections/page-hero";
import { BookCallDialog } from "@/components/contact/book-call-dialog";
import { CtaBand } from "@/components/sections/cta-band";
import { QuickCheck } from "@/components/sections/quick-check";
import { HorizontalScroll } from "@/components/ui/horizontal-scroll";
import { ServicePanel } from "@/components/sections/service-panel";
import { Reveal, Section, SectionHeading } from "@/components/ui/primitives";

export const metadata = pageMetadata({
  title: "Services",
  description:
    "Software development, AI solutions, business process automation, data and cloud, and security engineering from Outscalers — reliable outsourcing models that help organisations streamline delivery with dedicated teams.",
  path: "/services",
  keywords: [
    "software outsourcing",
    "AI solutions",
    "custom software development",
    "process automation",
    "data engineering",
  ],
});

const plans = [
  {
    kind: "One-off",
    title: "Assessment",
    lead: "The health and security check for anyone who wants to know what they have first.",
    price: "Fixed price, agreed in advance",
    items: [
      "Map of all applications and interfaces",
      "Component inventory with versions and end-of-life dates",
      "Review against all 20 points of our standard",
      "Risks ranked by urgency, with effort estimates",
      "Final meeting and a quote for maintenance",
    ],
    note: "Credited if you go on to book maintenance.",
  },
  {
    kind: "Monthly · Core service",
    featured: true,
    title: "Maintenance",
    lead: "For software that has to keep running.",
    price: "Fixed monthly price",
    items: [
      "Updates and security patches",
      "New security advisories checked continuously against your component inventory",
      "Monitoring and backups with restore tests",
      "System dossier, kept up to date",
      "Fixed monthly allowance for changes",
      "Agreed response time for critical vulnerabilities",
      "Monthly report and a dedicated contact person",
    ],
    note: "Minimum term 6 months, then cancellable monthly.",
  },
  {
    kind: "Monthly",
    title: "Developer team",
    lead: "For ongoing development.",
    price: "Monthly per developer",
    items: [
      "Junior and senior developers, dedicated to your project",
      "Working with AI tools every day",
      "Review by a second developer for every change",
      "Project management from Mannheim",
      "Working directly in your Jira, GitHub, Slack or Teams",
      "Maintenance standard included",
    ],
    note: "Minimum term 6 months, then cancellable monthly.",
  },
];

/** Hub diagram linking the five services around a shared Human + AI core. */
function ServiceMap() {
  const positions = [
    { x: 50, y: 10 },
    { x: 87, y: 40 },
    { x: 74, y: 88 },
    { x: 26, y: 88 },
    { x: 13, y: 40 },
  ];
  return (
    <div className="relative mx-auto aspect-square w-full max-w-md">
      <svg aria-hidden viewBox="0 0 100 100" className="absolute inset-0 h-full w-full">
        <circle cx={50} cy={52} r={38} className="fill-none stroke-line-strong" strokeWidth={0.3} strokeDasharray="1 1.5" />
        {positions.map((p, i) => (
          <line key={i} x1={50} y1={52} x2={p.x} y2={p.y} className="flow-dash stroke-brand-500/50" strokeWidth={0.35} />
        ))}
      </svg>
      <div className="absolute left-1/2 top-[52%] grid size-28 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-brand-500/40 bg-ink-850 text-center shadow-[0_0_60px_-10px_rgba(255,112,14,0.35)]">
        <span className="font-display text-sm font-semibold leading-tight">
          Human
          <br />+ AI
          <span className="mt-0.5 block font-mono text-[10px] font-normal text-fg-subtle">delivery</span>
        </span>
      </div>
      <ul>
        {services.map((s, i) => (
          <li
            key={s.slug}
            className="absolute -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${positions[i].x}%`, top: `${positions[i].y}%` }}
          >
            <Link
              href={serviceHref(s.slug)}
              className="flex flex-col items-center gap-1.5 rounded-xl p-1 text-center transition-transform hover:-translate-y-0.5"
            >
              <span className="grid size-11 place-items-center rounded-xl border border-line-strong bg-ink-800 text-brand-300 sm:size-12">
                <ServiceGlyph slug={s.slug} className="size-5 sm:size-6" />
              </span>
              <span className="max-w-[6.5rem] text-[11px] font-medium leading-tight text-fg-muted sm:text-xs">{s.shortTitle}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function ServicesPage() {
  return (
    <>
      <PageHero
        eyebrow="Services"
        title={
          <>
            Engineering services for an <span className="text-gradient">AI-enabled</span> business
          </>
        }
        lead="Custom software, intelligent systems, automation and the data, cloud and security foundations underneath them — delivered by one team using human expertise and AI together."
        crumbs={[
          { label: "Home", href: "/" },
          { label: "Services", href: "/services" },
        ]}
        visual={<ServiceMap />}
      />

      {/* Full-screen service panels; on large screens they pin and slide sideways as you scroll */}
      <Section labelledBy="list-title" className="py-0!">
        <h2 id="list-title" className="sr-only">
          Our services
        </h2>
        <HorizontalScroll label="Our services" stops={services.map((s) => s.shortTitle)}>
          {services.map((s, i) => (
            <ServicePanel key={s.slug} service={s} index={i} total={services.length} />
          ))}
        </HorizontalScroll>
      </Section>

      <Section tone="raised" labelledBy="pricing-title">
        <div className="container-site">
          <SectionHeading
            id="pricing-title"
            eyebrow="Pricing"
            title={<>Three ways to work<br className="hidden sm:block" /> with Outscalers</>}
            lead="You pay for maintenance, not for a full-time position. You get your quote at a fixed price before you decide."
          />
          <ul className="mt-12 grid items-stretch gap-5 lg:grid-cols-3">
            {plans.map((p, i) => (
              <Reveal
                as="li"
                key={p.title}
                delay={i * 80}
                className={cn("card flex flex-col p-7 sm:p-8", p.featured && "border-brand-500/50")}
              >
                <p className={cn("font-mono text-xs uppercase tracking-widest", p.featured ? "text-brand-300" : "text-fg-subtle")}>
                  {p.kind}
                </p>
                <h3 className="mt-4 text-2xl font-semibold">{p.title}</h3>
                <p className="mt-3 text-[0.9375rem] leading-relaxed text-fg-muted">{p.lead}</p>
                <p className="mt-5 border-y border-line py-4 font-display text-lg font-semibold">{p.price}</p>
                <ul className="mt-5 space-y-3">
                  {p.items.map((item) => (
                    <li key={item} className="flex gap-3 text-[0.9375rem] leading-relaxed">
                      <Check aria-hidden className="mt-1 size-4 shrink-0 text-brand-400" strokeWidth={2.2} />
                      {item}
                    </li>
                  ))}
                </ul>
                <p className="mt-auto pt-8 text-sm text-fg-subtle">{p.note}</p>
                {p.featured && <BookCallDialog label="Request an assessment" className="mt-5 w-full" />}
              </Reveal>
            ))}
          </ul>
          <p className="mt-8 max-w-3xl text-[0.9375rem] leading-relaxed text-fg-muted">
            <strong className="font-semibold text-fg">What determines the price:</strong> the number and type of systems,
            their condition when we take over, the response times you need and the change allowance.
          </p>
        </div>
      </Section>

      <Section tone="dark" labelledBy="quick-check-title">
        <QuickCheck />
      </Section>

      <CtaBand />
    </>
  );
}
