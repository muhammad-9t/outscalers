import { Compass, Globe2, HeartHandshake, MessagesSquare, Repeat, Target, Users } from "lucide-react";
import { pageMetadata, siteConfig } from "@/lib/site";
import { PageHero } from "@/components/sections/page-hero";
import { CtaBand } from "@/components/sections/cta-band";
import { OfficeNetwork } from "@/components/illustrations/office-network";
import { HumanAiCollab } from "@/components/illustrations/human-ai-collab";
import { EvolutionJourney } from "@/components/about/evolution-journey";
import { evolution } from "@/content/evolution";
import { ButtonLink, Reveal, Section, SectionHeading } from "@/components/ui/primitives";

export const metadata = pageMetadata({
  title: "About",
  description:
    "Outscalers is a global technology partner. From freelance roots in 2017 to remote-first teams across Germany, Italy, Hong Kong and Pakistan — human expertise, AI-powered engineering.",
  path: "/about",
  keywords: ["About Outscalers", "IT outsourcing partner", "software engineering team", "remote-first"],
});

const values = [
  {
    icon: Target,
    title: "Excellence",
    body: "We hold our work to high engineering standards — clean architecture, reviewed code and tested releases.",
  },
  {
    icon: HeartHandshake,
    title: "Customer-centric",
    body: "We start from your goals and constraints, and measure success by what changes for your business.",
  },
  {
    icon: Repeat,
    title: "Continuous improvement",
    body: "We keep learning — which is why AI is now part of how we work, applied with care.",
  },
  {
    icon: Users,
    title: "Accountability",
    body: "People own decisions and outcomes. Tools, including AI, never carry the responsibility.",
  },
];

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

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="About us"
        title={
          <>
            Built on engineering talent. <span className="text-gradient">Evolving with AI.</span>
          </>
        }
        lead={`Our journey began in 2017 with freelance software development. In ${siteConfig.founded} it became Outscalers, founded in Rawalpindi, Pakistan, to connect strong engineering talent from Germany and Pakistan with organisations around the world. Today we combine that human expertise with AI to deliver better software, faster.`}
        crumbs={[
          { label: "Home", href: "/" },
          { label: "About Us", href: "/about" },
        ]}
        actions={
          <ButtonLink href="/contact" arrow>
            Work with us
          </ButtonLink>
        }
        visual={<HumanAiCollab />}
      />

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
          <ul className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((v, i) => (
              <Reveal as="li" key={v.title} delay={i * 70} className="card p-6">
                <v.icon aria-hidden className="size-6 text-brand-300" strokeWidth={1.7} />
                <h3 className="mt-5 text-lg font-semibold">{v.title}</h3>
                <p className="mt-2 text-[0.9375rem] leading-relaxed text-fg-muted">{v.body}</p>
              </Reveal>
            ))}
          </ul>
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
                <Reveal as="li" key={h.title} delay={i * 80} className="flex gap-4">
                  <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-brand-500/10 text-brand-300">
                    <h.icon aria-hidden className="size-5" />
                  </span>
                  <div>
                    <h3 className="font-semibold">{h.title}</h3>
                    <p className="mt-1 text-[0.9375rem] leading-relaxed text-fg-muted">{h.body}</p>
                  </div>
                </Reveal>
              ))}
            </ul>
          </div>
          <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {siteConfig.offices.map((o, i) => (
              <Reveal as="li" key={o.country} delay={i * 60} className="card-flat p-5">
                <p className="font-mono text-xs uppercase tracking-wider text-brand-300">{o.country}</p>
                <address className="mt-2 text-sm not-italic leading-relaxed text-fg-muted">{o.address}</address>
              </Reveal>
            ))}
          </ul>
        </div>
      </Section>

      {/* Team placeholder */}
      <Section tone="raised" tight labelledBy="team-title">
        <div className="container-narrow text-center">
          <Reveal>
            <p className="eyebrow">Our people</p>
            <h2 id="team-title" className="mt-4 text-display-md font-semibold">
              The engineers behind the work
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-[1.0625rem] leading-relaxed text-fg-muted">
              Team profiles are coming soon. In the meantime, the best way to meet us is a conversation about your
              project.
            </p>
            <ButtonLink href="/contact" variant="secondary" className="mt-8">
              Talk to an engineer
            </ButtonLink>
          </Reveal>
        </div>
      </Section>

      <CtaBand />
    </>
  );
}
