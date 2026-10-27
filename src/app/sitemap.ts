import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/site";
import { services, serviceHref } from "@/content/services";
import { caseStudies } from "@/content/case-studies";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = ["/", "/services", "/how-we-work", "/portfolio", "/about", "/contact"];
  return [
    ...pages.map((path) => ({ url: absoluteUrl(path), priority: path === "/" ? 1 : 0.8 })),
    ...services.map((s) => ({ url: absoluteUrl(serviceHref(s.slug)), priority: 0.8 })),
    ...caseStudies.map((c) => ({ url: absoluteUrl(`/case-studies/${c.slug}`), priority: 0.6 })),
  ];
}
