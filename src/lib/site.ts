import type { Metadata } from "next";

/**
 * Central company configuration.
 *
 * Contact details match the live outscalers.com offices and scheduling links.
 */
export const siteConfig = {
  name: "Outscalers",
  shortName: "Outscalers",
  tagline: "Human Intelligence. AI-Powered Engineering.",
  description:
    "Outscalers is an IT outsourcing and software engineering partner that combines experienced engineers with artificial intelligence to build intelligent software, automate business processes, and help businesses innovate faster.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://outscalers.com",
  founded: 2023,
  /** Preserved from the previous outscalers.com Nuxt site for Search Console / Pinterest. */
  verification: {
    google: "SAgrb0LEaBTrtCyq9oBAImvHyxBJ5fRmVXJ5NvvTszQ",
    other: {
      "p:domain_verify": "99e60f715796a6be7e001a5ab9cb9823",
    },
  },
  contact: {
    email: "contact@outscalers.com",
    responseTime: "We aim to reply within one business day.",
  },
  offices: [
    { country: "Germany", city: "Mannheim", address: "Rahnfelsstraße 10, 68163 Mannheim, Germany", phone: "+49 173 4250811" },
    { country: "Italy", city: "Turin", address: "Corso Principe Oddone 44, 10152 Turin, Italy", phone: "+39 348 1393925" },
    {
      country: "Hong Kong",
      city: "Tsim Sha Tsui",
      address: "New Mandarin Plaza Tower B, Unit 1010–1015, 10/F, 14 Science Museum Rd, Tsim Sha Tsui, Hong Kong",
      phone: "+852 5400 0964",
    },
    { country: "Pakistan", city: "Rawalpindi", address: "Bank Road, Saddar, Rawalpindi, Pakistan", phone: "+92 327 7834010" },
  ],
  scheduling: [
    { label: "Europe time zones", href: "https://calendly.com/dev-abo/30min" },
    { label: "Asia time zones", href: "https://calendly.com/outscalers/30min" },
  ],
  social: [
    { label: "LinkedIn", href: "https://www.linkedin.com/company/outscalers/" },
    { label: "Facebook", href: "https://www.facebook.com/Outscalers" },
    { label: "Instagram", href: "https://www.instagram.com/outscalers/" },
    { label: "YouTube", href: "https://www.youtube.com/channel/UCm-SZGnv3bZHLQ1RLOCJqaA" },
  ],
} as const;

export type NavItem = { label: string; href: string };

export const mainNav: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "Services", href: "/services" },
  { label: "How We Work", href: "/how-we-work" },
  { label: "Portfolio", href: "/portfolio" },
  { label: "About Us", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export function absoluteUrl(path = "/") {
  return new URL(path, siteConfig.url).toString();
}

type PageMetadataInput = {
  /** Short title; rendered as "{title} | Outscalers". Omit on the homepage. */
  title?: string;
  description: string;
  path: string;
  keywords?: string[];
  /** When true, ask crawlers not to index (e.g. 404). */
  noIndex?: boolean;
};

/** Builds unique page metadata: title, description, canonical, Open Graph and Twitter. */
export function pageMetadata({ title, description, path, keywords, noIndex }: PageMetadataInput): Metadata {
  const fullTitle = title ? `${title} | ${siteConfig.name}` : `${siteConfig.name} — ${siteConfig.tagline}`;
  const url = absoluteUrl(path);

  return {
    title: title ?? { absolute: fullTitle },
    description,
    keywords: keywords?.length ? keywords : undefined,
    applicationName: siteConfig.name,
    authors: [{ name: siteConfig.name, url: siteConfig.url }],
    creator: siteConfig.name,
    publisher: siteConfig.name,
    category: "technology",
    alternates: { canonical: url },
    robots: noIndex
      ? { index: false, follow: true }
      : { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 } },
    openGraph: {
      type: "website",
      siteName: siteConfig.name,
      title: fullTitle,
      description,
      url,
      locale: "en_US",
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
    },
  };
}
