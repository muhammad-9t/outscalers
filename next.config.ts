import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  async redirects() {
    return [
      // Case-study index lives under portfolio on the new site.
      { source: "/case-studies", destination: "/portfolio", permanent: true },

      // Legacy Nuxt routes (outscalers.com) → closest new pages.
      { source: "/careers", destination: "/contact", permanent: true },
      { source: "/jobs", destination: "/contact", permanent: true },
      { source: "/apply", destination: "/contact", permanent: true },
      { source: "/contact-ceo", destination: "/contact", permanent: true },
      { source: "/blog", destination: "/about", permanent: true },
      { source: "/blog/:slug*", destination: "/about", permanent: true },
      { source: "/ourTeam", destination: "/about", permanent: true },
      { source: "/our-team", destination: "/about", permanent: true },
      { source: "/developerDetails", destination: "/about", permanent: true },
    ];
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
