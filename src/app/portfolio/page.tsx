import { portfolio, showcaseScreens } from "@/content/portfolio";
import { pageMetadata } from "@/lib/site";
import { PageHero } from "@/components/sections/page-hero";
import { PortfolioGrid } from "@/components/sections/portfolio-grid";
import { PortfolioShowcase } from "@/components/portfolio/portfolio-showcase";
import { CtaBand } from "@/components/sections/cta-band";
import { SectionHeading } from "@/components/ui/primitives";

export const metadata = pageMetadata({
  title: "Portfolio",
  description:
    "Products built by Outscalers engineers: a cloud ERP, a restaurant platform, a booking marketplace, mobile finance apps and our own CRM, all live.",
  path: "/portfolio",
  keywords: ["Outscalers portfolio", "software case studies", "AI projects", "IT outsourcing work"],
});

export default function PortfolioPage() {
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
            title="Products we've built"
            lead="Web platforms, mobile apps and AI tools, built end to end by our team."
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
                lead="Scroll through our products: engineers write the core, AI drafts the rest."
              />
            </div>
          </section>
        }
        outroHeading={
          <SectionHeading
            id="portfolio-list-title"
            eyebrow="All products"
            title="Jump to a product"
            className="mb-10 lg:mb-[2%] lg:[&_.eyebrow]:mb-2 lg:[&_h2]:text-3xl short:[&_.eyebrow]:hidden short:[&_h2]:text-2xl"
          />
        }
        outro={<PortfolioGrid projects={portfolio} />}
      />
      <CtaBand title="Want a product like these? Let's build it faster." />
    </>
  );
}
