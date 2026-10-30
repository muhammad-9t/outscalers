# Outscalers — Human + AI Engineering website

Marketing site for Outscalers, built with Next.js 16 (App Router, Cache Components), TypeScript (strict), Tailwind CSS 4 and Lucide icons. Every page is statically prerendered.

## Scripts

```bash
npm install
npm run dev      # http://localhost:3000
npm run build
npm run start
npm run lint
```

> **Windows note:** this folder lives under a path that contains `&` (`Outscalers&Ai`), which breaks npm's `.cmd` shims. If `npm run …` fails, call the binaries directly:
> `node node_modules/next/dist/bin/next dev`, `node node_modules/next/dist/bin/next build`, `node node_modules/eslint/bin/eslint.js .`
> (or move the project to a path without `&`).

Set `NEXT_PUBLIC_SITE_URL` to the production origin, which canonical URLs, Open Graph and the sitemap use.

## Structure

```
src/
  app/                     routes (one folder per page), sitemap, robots, OG image, icon
  content/                 all copy and data: services, process phases, case studies
  lib/site.ts              company config: contact, offices, social, booking links, metadata helper
  components/
    layout/                header (desktop dropdown + mobile menu), footer, logo
    hero/hero-scene.tsx    animated Human → AI → Review → Tested editor scene (client)
    illustrations/         original SVG artwork (collaboration, agents, workflows, data, security…)
    sections/              reusable page sections (page hero, service blocks, CTA, cards, delivery model)
    contact/               contact form (client)
    ui/                    primitives (buttons, section, heading, reveal) and the scroll-reveal observer
```

The design tokens (colours, type scale, radii, motion) live in `src/app/globals.css` under `@theme`. Shared component classes (`.btn`, `.card`, `.chip`, `.eyebrow`, `.section`) are defined there too.

## Motion and accessibility

- The hero animation is a deterministic script with no AI or network calls. It pauses when off-screen or when the tab is hidden, has a pause button, and shows its final state under `prefers-reduced-motion`.
- Scroll reveals only hide content once JavaScript is running, so without JS everything stays visible.
- Each page has one `h1`, labelled landmarks and sections, visible focus styles and a skip link. Meaningful SVGs carry a `title` and `desc`; decorative ones are `aria-hidden`.

## Content still to confirm before launch

Search for `TODO(verify)` and check these items:

1. **Contact form:** there is no backend yet. The form opens the visitor's email client (`mailto`). Replace it with a server action or form service when one is chosen.
2. **Case studies** (`src/content/case-studies.ts`): the three profiles come from the previous Vercel site and are marked **Draft** on the page. Confirm them with clients, then add client names, screenshots and verified `results`, or remove them. `humanAiApproach` should only be filled in if AI-assisted delivery was actually used on that project.
3. **How We Work ground rules** (`src/app/how-we-work/page.tsx`): confirm these match company policy, especially the client-data rule.
4. **Team profiles:** the About page has a placeholder for them.
5. **Digital marketing**, which is listed on outscalers.com, isn't on this engineering-focused site. Add it if it should stay.
