import { FileClock } from "lucide-react";
import { portfolio, showcaseScreens } from "@/content/portfolio";
import { pageMetadata } from "@/lib/site";
import { PageHero } from "@/components/sections/page-hero";
import { PortfolioGrid } from "@/components/sections/portfolio-grid";
import { PortfolioShowcase } from "@/components/portfolio/portfolio-showcase";
import { CtaBand } from "@/components/sections/cta-band";
import { Reveal, SectionHeading } from "@/components/ui/primitives";

export const metadata = pageMetadata({
  title: "Portfolio",
  description:
    "Projects by Outscalers across AI, software development, automation, data and cloud, and security — with in-depth case studies.",
  path: "/portfolio",
});

export default function PortfolioPage() {
  const hasUnconfirmed = portfolio.some((p) => p.status !== "published");
  const featured = showcaseScreens.flatMap((screen) => {
    const project = portfolio.find((p) => p.slug === screen.slug);
    return project ? [{ project, screen }] : [];
  });

  return (
    <>
      {/* Scroll showcase: the 3D laptop enters beside the hero, then follows each featured project */}
      <PortfolioShowcase
        chapters={featured}
        hero={
          <PageHero
            eyebrow="Portfolio"
            title="Projects we've engineered"
            lead="Software, AI, automation, data and security work for growing businesses. Selected projects include a full case study; client names and results are published only with permission."
            crumbs={[
              { label: "Home", href: "/" },
              { label: "Portfolio", href: "/portfolio" },
            ]}
            bare
            className="lg:flex lg:min-h-[80svh] lg:flex-col lg:justify-center"
          />
        }
        intro={
          <section aria-labelledby="featured-title" className="pt-16 sm:pt-20">
            <div className="container-site">
              <SectionHeading
                id="featured-title"
                eyebrow="Featured work"
                title="Engineers lead, AI accelerates"
                lead="Scroll through selected projects. On each screen an engineer writes the core logic, AI drafts the rest, and an engineer reviews it before anything ships."
              />
              {hasUnconfirmed && (
                <Reveal className="mt-8 flex max-w-2xl gap-3 rounded-xl border border-brand-300/30 bg-brand-300/5 p-4 text-sm text-fg-muted sm:items-center">
                  <FileClock aria-hidden className="size-5 shrink-0 text-brand-300" />
                  <p>
                    Projects marked <strong className="font-semibold text-brand-300">Draft</strong> are being confirmed
                    with clients, and <strong className="font-semibold text-brand-300">Sample</strong> projects are
                    placeholders that will be replaced with real work. Code on screen is illustrative.
                  </p>
                </Reveal>
              )}
            </div>
          </section>
        }
        outroHeading={
          <SectionHeading
            id="portfolio-list-title"
            eyebrow="All projects"
            title="Browse by service"
            className="mb-10 lg:mb-[2%] lg:[&_.eyebrow]:mb-2 lg:[&_h2]:text-3xl short:[&_.eyebrow]:hidden short:[&_h2]:text-2xl"
          />
        }
        outro={<PortfolioGrid projects={portfolio} />}
      />
      <CtaBand title="Could your project be next in our portfolio?" />
    </>
  );
}
