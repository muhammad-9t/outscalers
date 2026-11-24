import { ChevronRight, Compass, Globe2, MessagesSquare } from "lucide-react";
import { pageMetadata, siteConfig } from "@/lib/site";
import Link from "next/link";
import { CtaBand } from "@/components/sections/cta-band";
import { OfficeNetwork } from "@/components/illustrations/office-network";
import { AboutJourney } from "@/components/about/about-journey";
import { EvolutionJourney } from "@/components/about/evolution-journey";
import { evolution } from "@/content/evolution";
import { TeamBadges } from "@/components/about/team-badges";
import { BeamSentence } from "@/components/about/beam-sentence";
import { ValuesGrid } from "@/components/about/values-grid";
import { OfficeCards } from "@/components/about/office-cards";
import { getTeam } from "@/lib/team-store";
import { ButtonLink, Reveal, Section, SectionHeading } from "@/components/ui/primitives";

export const metadata = pageMetadata({
  title: "About",
  description:
    "Outscalers is a global technology partner. From freelance roots in 2017 to remote-first teams across Germany, Italy, Hong Kong and Pakistan — human expertise, AI-powered engineering.",
  path: "/about",
  keywords: ["About Outscalers", "IT outsourcing partner", "software engineering team", "remote-first"],
});

const howWeOperate = [
  {
    icon: Globe2,
    title: "Remote-first",
    body: "Distributed teams across Europe and Asia, working remotely by design.",
  },
  {
    icon: MessagesSquare,
    title: "English-speaking, nearshore teams",
    body: "Clear communication and working hours that overlap with European and Asian clients.",
  },
  {
    icon: Compass,
    title: "Multidisciplinary",
    body: "Software developers, QA engineers, designers and project managers in one team.",
  },
];

export default async function AboutPage() {
  return (
    <>
      {/* Hero: centred story on top, the journey as a rising staircase below */}
      <section className="relative overflow-hidden bg-ink-950 pb-16 pt-28 sm:pb-20 lg:pb-24 lg:pt-36">
        <div aria-hidden className="bg-grid pointer-events-none absolute inset-0 opacity-50" />
        <div aria-hidden className="glow-brand pointer-events-none absolute left-1/2 -top-48 size-[40rem] -translate-x-1/2 opacity-50" />
        <div className="container-site relative">
          <nav aria-label="Breadcrumb" className="mb-8 flex justify-center">
            <ol className="flex flex-wrap items-center gap-1.5 text-sm text-fg-subtle">
              <li>
                <Link href="/" className="transition-colors hover:text-fg">
                  Home
                </Link>
              </li>
              <li className="flex items-center gap-1.5">
                <ChevronRight aria-hidden className="size-3.5" />
                <span aria-current="page" className="text-fg-muted">
                  About Us
                </span>
              </li>
            </ol>
          </nav>
          <div className="mx-auto max-w-4xl text-center">
            <p className="eyebrow mx-auto mb-5">About us</p>
            <h1 className="text-display-lg font-semibold">
              Built on engineering talent. <span className="text-gradient">Evolving with <em className="about-accent">AI</em>.</span>
            </h1>
            <p className="mx-auto mt-6 max-w-3xl text-lead text-fg-muted">
              Our journey began in 2017 with freelance software development. In {siteConfig.founded} it became Outscalers, founded in
              Rawalpindi, Pakistan, to connect strong engineering talent from Germany and Pakistan with organisations around the world.
              Today we combine that human expertise with AI to deliver better software, faster.
            </p>
            <div className="mt-9 flex justify-center">
              <ButtonLink href="/contact" arrow>
                Work with us
              </ButtonLink>
            </div>
          </div>

          <div data-reveal className="relative mt-16 lg:mt-20">
            <AboutJourney variant="strip" />
          </div>

          {/* Quick facts */}
          <dl className="mx-auto mt-14 grid max-w-3xl grid-cols-3 divide-x divide-line border-y border-line text-center">
            {[
              ["2017", "Building since"],
              ["DE + PK", "Engineering teams"],
              ["Human + AI", "On every project"],
            ].map(([v, l]) => (
              <div key={l} className="px-3 py-4">
                <dt className="sr-only">{l}</dt>
                <dd className="font-display text-xl font-semibold sm:text-2xl">{v}</dd>
                <dd aria-hidden className="mt-0.5 text-sm text-fg-muted">
                  {l}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Mission & vision */}
      <Section labelledBy="mission-title">
        <div className="container-site grid gap-5 md:grid-cols-2">
          <Reveal className="card p-7 sm:p-10">
            <p className="eyebrow">Mission</p>
            <h2 id="mission-title" className="mt-4 text-display-md font-semibold">
              Bridge talent and opportunity
            </h2>
            <p className="mt-4 text-[1.0625rem] leading-relaxed text-fg-muted">
              We bring together experienced developers from Germany and Pakistan and connect them with companies
              worldwide that need dependable software solutions.
            </p>
          </Reveal>
          <Reveal delay={100} className="card p-7 sm:p-10">
            <p className="eyebrow">Vision</p>
            <h2 className="mt-4 text-display-md font-semibold">Partnerships that move businesses forward</h2>
            <p className="mt-4 text-[1.0625rem] leading-relaxed text-fg-muted">
              We build long-term partnerships that strengthen engineering capability and support growth and innovation
              on a global scale.
            </p>
          </Reveal>
        </div>
      </Section>

      {/* Statement: slides past a beam of light as you scroll, lighting up letter by letter */}
      <BeamSentence text="We help ambitious businesses scale faster and smarter." />

      {/* Evolution: a scroll story on large screens, cards on small ones */}
      <Section labelledBy="evolution-title" className="lg:pb-0">
        <div className="container-site">
          <SectionHeading
            id="evolution-title"
            eyebrow="Our evolution"
            title="From freelancing to Human + AI engineering"
            lead="The fundamentals haven't changed: skilled people, sound engineering and honest communication. What has changed is the scale of our teams, and how much faster good engineers can move with the right tools."
            className="mb-12 lg:mb-0"
          />
        </div>
        <EvolutionJourney steps={evolution} />
      </Section>

      {/* Values */}
      <Section tone="raised" labelledBy="values-title">
        <div className="container-site">
          <SectionHeading id="values-title" eyebrow="Values" title="What guides our work" />
          <ValuesGrid />
        </div>
      </Section>

      {/* Locations and operating model */}
      <Section tone="dark" labelledBy="offices-title">
        <div className="container-site">
          <SectionHeading
            id="offices-title"
            eyebrow="Where we are"
            title="One team across four countries"
          />
          <div className="mt-12 grid gap-10 lg:grid-cols-[1.3fr_1fr] lg:items-center">
            <Reveal className="card p-4 sm:p-8">
              <OfficeNetwork />
            </Reveal>
            <ul className="space-y-4">
              {howWeOperate.map((h, i) => (
                <Reveal as="li" key={h.title} delay={i * 80} className="op-item flex gap-4">
                  <span className="hs-gloss op-tile" data-tone={(["human", "brand", "data"] as const)[i % 3]} aria-hidden>
                    <h.icon className="size-[46%]" strokeWidth={1.8} />
                  </span>
                  <div>
                    <h3 className="font-semibold">{h.title}</h3>
                    <p className="mt-1 text-[0.9375rem] leading-relaxed text-fg-muted">{h.body}</p>
                  </div>
                </Reveal>
              ))}
            </ul>
          </div>
          <OfficeCards />
        </div>
      </Section>

      {/* Team: hanging ID badges that flip to a holographic profile */}
      <Section tone="raised" labelledBy="team-title" className="overflow-hidden">
        <div className="container-site">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <Reveal>
              <p className="eyebrow">Our people</p>
              <h2 id="team-title" className="mt-4 text-display-lg font-semibold">
                Meet the people
                <br />
                <span className="text-gradient">behind the work.</span>
              </h2>
            </Reveal>
            <Reveal delay={80} className="max-w-xs">
              <p className="text-[0.9375rem] leading-relaxed text-fg-muted">
                Different minds, shared curiosity. Engineers, designers and testers who own what reaches production.
              </p>
              <p className="mt-3 flex items-center gap-2 text-sm font-medium text-fg-subtle">
                <span aria-hidden className="size-1.5 rounded-full bg-brand-400" /> One team, DE + PK
              </p>
            </Reveal>
          </div>
          <div className="mt-12 lg:mt-14">
            <TeamBadges team={await getTeam()} />
          </div>
        </div>
      </Section>

      <CtaBand />
    </>
  );
}
