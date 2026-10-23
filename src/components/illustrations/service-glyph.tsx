import type { ServiceSlug } from "@/content/services";
import { cn } from "@/lib/cn";

/** Custom line glyphs for each service, drawn on a 24px grid to match Lucide stroke weights. */
export function ServiceGlyph({ slug, className }: { slug: ServiceSlug; className?: string }) {
  const common = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.6,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className: cn("size-5", className),
    "aria-hidden": true,
    focusable: "false" as const,
  };

  switch (slug) {
    case "ai-solutions":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="3" />
          <circle cx="4.5" cy="6" r="1.6" />
          <circle cx="19.5" cy="6" r="1.6" />
          <circle cx="12" cy="20.5" r="1.6" />
          <path d="M6 7 9.6 10.2M18 7l-3.6 3.2M12 15v3.9" />
          <path d="M19 15.5l.6 1.4 1.4.6-1.4.6-.6 1.4-.6-1.4-1.4-.6 1.4-.6z" fill="currentColor" stroke="none" />
        </svg>
      );
    case "software-development":
      return (
        <svg {...common}>
          <rect x="3" y="4" width="18" height="15" rx="2.5" />
          <path d="M3 8h18" />
          <path d="m9.5 11.5-2.5 2.2 2.5 2.2M14.5 11.5l2.5 2.2-2.5 2.2" />
        </svg>
      );
    case "automation":
      return (
        <svg {...common}>
          <rect x="2.5" y="4" width="6" height="6" rx="1.6" />
          <rect x="15.5" y="14" width="6" height="6" rx="1.6" />
          <path d="M8.5 7h5a3 3 0 0 1 3 3v1.5" />
          <path d="m14.8 10.2 1.7 1.8 1.7-1.8" />
          <path d="M15.5 17h-5a3 3 0 0 1-3-3v-1" />
        </svg>
      );
    case "data-cloud":
      return (
        <svg {...common}>
          <ellipse cx="9" cy="6.5" rx="5.5" ry="2.2" />
          <path d="M3.5 6.5v8c0 1.2 2.5 2.2 5.5 2.2M14.5 6.5v3" />
          <path d="M3.5 10.5c0 1.2 2.5 2.2 5.5 2.2" />
          <path d="M14 20.5h4.8a2.7 2.7 0 0 0 .4-5.4 3.6 3.6 0 0 0-6.8.9A2.3 2.3 0 0 0 14 20.5z" />
        </svg>
      );
    case "security-quality":
      return (
        <svg {...common}>
          <path d="M12 2.8 4.5 5.6v5.6c0 4.6 3.1 8.4 7.5 10 4.4-1.6 7.5-5.4 7.5-10V5.6z" />
          <path d="m8.7 12.2 2.3 2.3 4.4-4.6" />
        </svg>
      );
  }
}
