import { absoluteUrl, siteConfig } from "@/lib/site";

/** Organization + WebSite JSON-LD for the root layout. */
export function siteJsonLd() {
  const logo = absoluteUrl("/icon.svg");
  return [
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      "@id": `${siteConfig.url}/#organization`,
      name: siteConfig.name,
      url: siteConfig.url,
      logo,
      image: logo,
      description: siteConfig.description,
      email: siteConfig.contact.email,
      foundingDate: String(siteConfig.founded),
      sameAs: siteConfig.social.map((s) => s.href),
      contactPoint: [
        {
          "@type": "ContactPoint",
          contactType: "sales",
          email: siteConfig.contact.email,
          availableLanguage: ["English", "German", "Italian"],
        },
      ],
      address: siteConfig.offices.map((o) => ({
        "@type": "PostalAddress",
        addressLocality: o.city,
        addressCountry: o.country,
        streetAddress: o.address,
      })),
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "@id": `${siteConfig.url}/#website`,
      name: siteConfig.name,
      url: siteConfig.url,
      description: siteConfig.description,
      publisher: { "@id": `${siteConfig.url}/#organization` },
      inLanguage: "en",
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
