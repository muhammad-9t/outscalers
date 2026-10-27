import type { Metadata } from "next";

/**
 * Central company configuration.
 *
 * Values marked `TODO(verify)` were not verifiable from the previous website
 * (which used placeholder contact details). Replace them before launch.
 */
export const siteConfig = {
  name: "Outscalers",
  shortName: "Outscalers",
  tagline: "Human Intelligence. AI-Powered Engineering.",
  description:
    "Outscalers combines experienced engineers with artificial intelligence to build intelligent software, automate business processes, and help businesses innovate faster.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://outscalers-it.vercel.app",
  founded: 2023,
  contact: {
    // TODO(verify): the live site lists no email address; confirm this inbox exists before launch.
    email: "hello@outscalers.com",
    responseTime: "We aim to reply within one business day.",
  },
  // Offices and phone numbers as published on outscalers.com/contact.
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
  // Booking links as published on outscalers.com.
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

/** Builds consistent page metadata: title, description, canonical and Open Graph. */
export function pageMetadata({
  title,
  description,
  path,
}: {
  title?: string;
  description: string;
  path: string;
}): Metadata {
  const fullTitle = title ? `${title} | ${siteConfig.name}` : `${siteConfig.name} — ${siteConfig.tagline}`;
  return {
    title: title ?? { absolute: fullTitle },
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      siteName: siteConfig.name,
      title: fullTitle,
      description,
      url: path,
      locale: "en_US",
    },
    twitter: { card: "summary_large_image", title: fullTitle, description },
  };
}
