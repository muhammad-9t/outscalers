import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/site";
import { services, serviceHref } from "@/content/services";
import { caseStudies } from "@/content/case-studies";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const pages: { path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"] }[] = [
    { path: "/", priority: 1, changeFrequency: "weekly" },
    { path: "/services", priority: 0.9, changeFrequency: "weekly" },
    { path: "/how-we-work", priority: 0.8, changeFrequency: "monthly" },
    { path: "/portfolio", priority: 0.8, changeFrequency: "weekly" },
    { path: "/about", priority: 0.8, changeFrequency: "monthly" },
    { path: "/contact", priority: 0.9, changeFrequency: "monthly" },
  ];

  return [
    ...pages.map(({ path, priority, changeFrequency }) => ({
      url: absoluteUrl(path),
      lastModified: now,
      changeFrequency,
      priority,
    })),
    ...services.map((s) => ({
      url: absoluteUrl(serviceHref(s.slug)),
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
    ...caseStudies.map((c) => ({
      url: absoluteUrl(`/case-studies/${c.slug}`),
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];
}
