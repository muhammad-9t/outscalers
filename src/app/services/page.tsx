import { ArrowRight, Check, ClipboardList, ShieldCheck, UsersRound } from "lucide-react";
import Link from "next/link";
import { dedicated } from "@/content/dedicated";
import { services } from "@/content/services";
import { pageMetadata } from "@/lib/site";
import { PageHero } from "@/components/sections/page-hero";
import { BookCallDialog } from "@/components/contact/book-call-dialog";
import { CtaBand } from "@/components/sections/cta-band";
import { QuickCheck } from "@/components/sections/quick-check";
import { HorizontalScroll } from "@/components/ui/horizontal-scroll";
import { ServicePanel } from "@/components/sections/service-panel";
import { ServicesVisual } from "@/components/services/services-visual";
import { Reveal, Section, SectionHeading } from "@/components/ui/primitives";

export const metadata = pageMetadata({
  title: "Services",
  description:
    "Application engineering, AI & data systems, automation, cloud & infrastructure, and security & quality — Outscalers delivers with human accountability and AI acceleration.",
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
    icon: ClipboardList,
    tone: "human",
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
    icon: ShieldCheck,
    tone: "brand",
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
    icon: UsersRound,
    tone: "data",
    title: "Developer team",
    lead: "For ongoing development.",
    price: "Monthly per developer",
    items: [
      "Junior and senior developers, dedicated to your project",
      "Working with AI tools every day",
      "Review by a second developer for every change",
      "A dedicated project lead who keeps delivery on track",
      "Working directly in your Jira, GitHub, Slack or Teams",
      "Maintenance standard included",
    ],
    note: "Minimum term 6 months, then cancellable monthly.",
  },
];

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
        visual={<ServicesVisual />}
        reverse
      />

      {/* Core offer first: dedicated developers who join the client's team */}
      <Section tight labelledBy="dedicated-title" className="!pt-0">
        <div className="container-site">
          <Reveal>
            <Link
              href={dedicated.path}
              className="card card-interactive group flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:p-8"
            >
              <span className="hs-gloss op-tile shrink-0" data-tone="data" aria-hidden>
                <UsersRound className="size-[46%]" strokeWidth={1.8} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="eyebrow">Our core service</span>
                <span id="dedicated-title" className="mt-3 block text-xl font-semibold sm:text-2xl">
                  Need developers in your team? Start in 1–2 weeks.
                </span>
                <span className="mt-1 block text-fg-muted">
                  Dedicated engineers from our 100+ in-house team, contracted through our European company.
                </span>
              </span>
              <span className="link-arrow shrink-0">
                {dedicated.title} <ArrowRight aria-hidden className="size-4 transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>
          </Reveal>
        </div>
      </Section>

      {/* Full-screen service panels; on large screens they pin and slide sideways as you scroll */}
      <Section labelledBy="list-title" className="py-0!">
        <h2 id="list-title" className="sr-only">
          Our services
        </h2>
        <HorizontalScroll label="Our services" stops={services.map((s) => s.shortTitle)} speed={0.6} trackProgress>
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
                className="sp-plan flex flex-col p-7 sm:p-8"
                data-tone={p.tone}
                data-featured={p.featured || undefined}
              >
                <div className="flex items-center justify-between gap-4">
                  <span className="hs-gloss sp-plan-tile" data-tone={p.tone} aria-hidden>
                    <p.icon className="size-[48%]" strokeWidth={1.8} />
                  </span>
                  <span className="sp-kind">{p.kind}</span>
                </div>
                <h3 className="mt-6 text-2xl font-semibold">{p.title}</h3>
                <p className="mt-3 text-[0.9375rem] leading-relaxed text-fg-muted">{p.lead}</p>
                <p className="sp-price mt-5 font-display text-lg font-semibold">{p.price}</p>
                <ul className="mt-5 space-y-3">
                  {p.items.map((item) => (
                    <li key={item} className="flex gap-3 text-[0.9375rem] leading-relaxed">
                      <span className="sp-check mt-0.5 size-6!" aria-hidden>
                        <Check className="size-3.5" strokeWidth={2.6} />
                      </span>
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
