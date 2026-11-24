import { ChevronRight } from "lucide-react";
import { pageMetadata, siteConfig } from "@/lib/site";
import Link from "next/link";
import { CtaBand } from "@/components/sections/cta-band";
import { OfficeNetwork } from "@/components/illustrations/office-network";
import { AboutJourney } from "@/components/about/about-journey";
import { EvolutionJourney } from "@/components/about/evolution-journey";
import { evolution } from "@/content/evolution";
import { TeamBadges, TeamGrid } from "@/components/about/team-badges";
import { BeamSentence } from "@/components/about/beam-sentence";
import { OfficeCards } from "@/components/about/office-cards";
import { team as teamMembers, teamStats } from "@/content/team";
import { ButtonLink, Reveal, Section, SectionHeading } from "@/components/ui/primitives";

export const metadata = pageMetadata({
  title: "About",
  description:
    "Outscalers is a global technology partner. From freelance roots in 2017 to remote-first teams across Germany, Italy, Hong Kong and Pakistan — human expertise, AI-powered engineering.",
  path: "/about",
  keywords: ["About Outscalers", "IT outsourcing partner", "software engineering team", "remote-first"],
});

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
              Freelance roots in 2017, Outscalers since {siteConfig.founded}. Today, 100+ in-house engineers in Pakistan, with
              offices in Germany, Italy and Hong Kong.
            </p>
            <div className="mt-9 flex justify-center">
              <ButtonLink href="/contact" arrow>
                Work with us
              </ButtonLink>
            </div>
          </div>

          <div data-reveal suppressHydrationWarning className="relative mt-16 lg:mt-20">
            <AboutJourney variant="strip" />
          </div>

          {/* Quick facts */}
          <dl className="mx-auto mt-14 grid max-w-3xl grid-cols-3 divide-x divide-line border-y border-line text-center">
            {[
              ["2017", "Engineering since"],
              ["100+", "In-house engineers"],
              ["4 offices", "DE · IT · HK · PK"],
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

      {/* Statement: slides past a beam of light as you scroll, lighting up letter by letter */}
      <BeamSentence text="We help ambitious businesses scale faster and smarter." />

      {/* Evolution: a scroll story on large screens, cards on small ones */}
      <Section labelledBy="evolution-title" className="lg:pb-0">
        <div className="container-site">
          <SectionHeading
            id="evolution-title"
            eyebrow="Our evolution"
            title="From freelancing to AI-accelerated engineering"
            lead="Skilled people, sound engineering, honest communication. Only the scale and the tools have changed."
            className="mb-12 lg:mb-0"
          />
        </div>
        <EvolutionJourney steps={evolution} />
      </Section>

      {/* Locations and operating model */}
      <Section tone="dark" labelledBy="offices-title">
        <div className="container-site">
          <SectionHeading
            id="offices-title"
            eyebrow="Where we are"
            title="Core team in Pakistan. Offices in Europe and Asia."
          />
          <Reveal className="card mt-12 p-4 sm:p-8">
            <OfficeNetwork />
          </Reveal>
          <OfficeCards />
        </div>
      </Section>

      {/* Team: leadership badges hanging from a string, then the specialist teams */}
      <Section tone="raised" labelledBy="team-title" className="overflow-hidden">
        <div className="container-site">
          <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
            <Reveal>
              <p className="eyebrow">Our people</p>
              <h2 id="team-title" className="mt-4 text-display-lg font-semibold">
                One company.
                <br />
                <span className="text-gradient">Many dedicated teams.</span>
              </h2>
              <p className="mt-4 max-w-md text-[0.9375rem] leading-relaxed text-fg-muted">
                In-house engineers working as dedicated teams for companies worldwide.
              </p>
            </Reveal>
            <Reveal delay={80}>
              <dl className="flex gap-8 sm:gap-10">
                {teamStats.map((s) => (
                  <div key={s.label} className="flex flex-col-reverse">
                    <dt className="mt-1 text-sm text-fg-muted">{s.label}</dt>
                    <dd className="font-display text-4xl font-semibold text-gradient sm:text-5xl">{s.value}</dd>
                  </div>
                ))}
              </dl>
            </Reveal>
          </div>
          <div className="mt-12 lg:mt-14">
            <TeamBadges team={teamMembers.filter((m) => m.group === "leadership")} />
          </div>
          <h3 className="mt-14 mb-6 font-display text-xl font-semibold">Our teams</h3>
          <TeamGrid team={teamMembers.filter((m) => m.group === "team")} />
        </div>
      </Section>

      <CtaBand />
    </>
  );
}
