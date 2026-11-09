import { absoluteUrl, mainNav, siteConfig } from "@/lib/site";

/** Sitelink-oriented navigation entries (important pages Google can surface under the brand result). */
const sitelinkPages = [
  {
    name: "About",
    path: "/about",
    description:
      "From freelance roots to a remote-first engineering company — Outscalers teams across Germany, Italy, Hong Kong and Pakistan.",
  },
  {
    name: "Contact Us",
    path: "/contact",
    description:
      "Start a project or book a call. Tell us what you want to build, automate or improve — we reply within one business day.",
  },
  {
    name: "Services",
    path: "/services",
    description:
      "AI solutions, custom software development, process automation, data & cloud, and security & quality engineering.",
  },
  {
    name: "Custom Software Development",
    path: "/services/software-development",
    description:
      "Web apps, mobile apps, SaaS platforms, APIs and enterprise systems — human-led engineering accelerated by AI.",
  },
  {
    name: "How We Work",
    path: "/how-we-work",
    description:
      "Discovery, architecture, AI-assisted implementation, human code review, testing and deployment — clear accountability.",
  },
  {
    name: "Portfolio",
    path: "/portfolio",
    description:
      "Selected Outscalers projects and case studies across AI, software, automation, data and security.",
  },
] as const;

/** Organization + WebSite + sitelink navigation JSON-LD for the root layout. */
export function siteJsonLd() {
  const logo = absoluteUrl("/icon-192.png");
  const primaryPhone = siteConfig.offices[0]?.phone;

  return [
    {
      "@context": "https://schema.org",
      "@type": ["Organization", "ProfessionalService"],
      "@id": `${siteConfig.url}/#organization`,
      name: siteConfig.name,
      legalName: siteConfig.name,
      url: siteConfig.url,
      logo: { "@type": "ImageObject", url: logo },
      image: logo,
      description: siteConfig.serpDescription,
      email: siteConfig.contact.email,
      telephone: primaryPhone,
      foundingDate: String(siteConfig.founded),
      sameAs: siteConfig.social.map((s) => s.href),
      knowsAbout: [
        "Software development",
        "IT outsourcing",
        "Artificial intelligence",
        "Business process automation",
        "Data engineering",
        "Cloud infrastructure",
        "Software quality and security",
      ],
      areaServed: "Worldwide",
      contactPoint: [
        {
          "@type": "ContactPoint",
          contactType: "sales",
          email: siteConfig.contact.email,
          telephone: primaryPhone,
          url: absoluteUrl("/contact"),
          availableLanguage: ["English", "German", "Italian"],
        },
      ],
      address: siteConfig.offices.map((o) => ({
        "@type": "PostalAddress",
        streetAddress: o.address,
        addressLocality: o.city,
        addressCountry: o.country,
      })),
      department: siteConfig.offices.map((o) => ({
        "@type": "LocalBusiness",
        name: `${siteConfig.name} (${o.city})`,
        url: siteConfig.url,
        telephone: o.phone,
        email: siteConfig.contact.email,
        address: {
          "@type": "PostalAddress",
          streetAddress: o.address,
          addressLocality: o.city,
          addressCountry: o.country,
        },
      })),
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "@id": `${siteConfig.url}/#website`,
      name: siteConfig.name,
      alternateName: siteConfig.tagline,
      url: siteConfig.url,
      description: siteConfig.serpDescription,
      publisher: { "@id": `${siteConfig.url}/#organization` },
      inLanguage: "en",
      hasPart: sitelinkPages.map((p) => ({
        "@type": "WebPage",
        name: p.name,
        url: absoluteUrl(p.path),
        description: p.description,
        isPartOf: { "@id": `${siteConfig.url}/#website` },
      })),
    },
    {
      "@context": "https://schema.org",
      "@type": "ItemList",
      "@id": `${siteConfig.url}/#sitelinks`,
      name: `${siteConfig.name} main pages`,
      itemListElement: sitelinkPages.map((p, i) => ({
        "@type": "SiteNavigationElement",
        position: i + 1,
        name: p.name,
        description: p.description,
        url: absoluteUrl(p.path),
      })),
    },
    {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: `${siteConfig.name} primary navigation`,
      itemListElement: mainNav
        .filter((item) => item.href !== "/")
        .map((item, i) => ({
          "@type": "SiteNavigationElement",
          position: i + 1,
          name: item.label,
          url: absoluteUrl(item.href),
        })),
    },
  ];
}

/** BreadcrumbList for nested pages (services, case studies). */
export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

/** Service page structured data. */
export function serviceJsonLd(input: {
  name: string;
  description: string;
  path: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: input.name,
    description: input.description,
    url: absoluteUrl(input.path),
    provider: { "@id": `${siteConfig.url}/#organization` },
    areaServed: "Worldwide",
  };
}
