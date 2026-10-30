import Link from "next/link";
import { Boxes, LifeBuoy, Rocket } from "lucide-react";
import { services, serviceHref } from "@/content/services";
import { pageMetadata } from "@/lib/site";
import { ServiceGlyph } from "@/components/illustrations/service-glyph";
import { PageHero } from "@/components/sections/page-hero";
import { CtaBand } from "@/components/sections/cta-band";
import { HorizontalScroll } from "@/components/ui/horizontal-scroll";
import { ServicePanel } from "@/components/sections/service-panel";
import { Reveal, Section, SectionHeading } from "@/components/ui/primitives";

export const metadata = pageMetadata({
  title: "Services",
  description:
    "AI solutions and agents, custom software development, business process automation, data engineering and cloud, and security and quality engineering from Outscalers.",
  path: "/services",
});

const engagements = [
  {
    icon: Rocket,
    title: "Project delivery",
    body: "A dedicated team takes a defined product or initiative from discovery to launch, with clear milestones and regular demos.",
  },
  {
    icon: Boxes,
    title: "Team augmentation",
    body: "Our engineers join your team, work in your tools and processes, and bring AI-assisted practices with them.",
  },
  {
    icon: LifeBuoy,
    title: "Ongoing support & improvement",
    body: "Maintenance, monitoring, performance optimisation and feature enhancements after launch.",
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

      <Section tone="raised" labelledBy="engage-title">
        <div className="container-site">
          <SectionHeading
            id="engage-title"
            eyebrow="Ways to work together"
            title="Engagement models"
            lead="Choose the model that fits your team today. Many clients move between them over time."
          />
          <ul className="mt-12 grid gap-5 md:grid-cols-3">
            {engagements.map((e, i) => (
              <Reveal as="li" key={e.title} delay={i * 80} className="card p-7">
                <e.icon aria-hidden className="size-6 text-brand-300" strokeWidth={1.7} />
                <h3 className="mt-5 text-lg font-semibold">{e.title}</h3>
                <p className="mt-2 text-[0.9375rem] leading-relaxed text-fg-muted">{e.body}</p>
              </Reveal>
            ))}
          </ul>
        </div>
      </Section>

      <CtaBand />
    </>
  );
}
