/**
 * Slides for the "Our story" board that opens from the story widget in the About team section.
 * `image` slides show a real picture (WebP in /public); the others are drawn from the theme colours.
 * PLACEHOLDER: team and office photos still to come from Outscalers. Add them as `image` slides.
 */
export type StorySlide = {
  id: string;
  kicker: string;
  title: string;
  body: string;
  /** Drawn backdrop when there is no image */
  tone: "brand" | "human" | "data" | "amber";
  /** Big background word or year on drawn slides */
  mark?: string;
  image?: { src: string; alt: string };
  link?: { label: string; href: string };
};

export const story: StorySlide[] = [
  {
    id: "dream",
    kicker: "01 · Dream",
    title: "Bridge talent and opportunity.",
    body: "Bring together experienced developers from Germany and Pakistan and connect them with companies worldwide that need dependable software.",
    tone: "brand",
    mark: "Dream",
  },
  {
    id: "beginning",
    kicker: "02 · Beginning",
    title: "It started with freelance work in 2017.",
    body: "Web and mobile projects for clients abroad, and relationships built on quality work and reliable delivery.",
    tone: "amber",
    mark: "2017",
  },
  {
    id: "team",
    kicker: "03 · From projects to a team",
    title: "Outscalers took shape in 2023.",
    body: "Founded in Rawalpindi: developers, QA engineers, designers and project managers delivering together, remote-first.",
    tone: "human",
    mark: "2023",
  },
  {
    id: "intelligence",
    kicker: "04 · Intelligence",
    title: "Human expertise. AI acceleration.",
    body: "AI speeds up the routine work. Our engineers decide what ships, review every change and stay accountable for it.",
    tone: "data",
    mark: "AI",
  },
  {
    id: "nizamio",
    kicker: "05 · Work we're proud of",
    title: "Nizamio, a cloud ERP.",
    body: "HRM, CRM, POS, inventory and accounting in one platform, with a mobile app for owners on the move.",
    tone: "brand",
    image: { src: "/portfolio/nizamio/dashboard.webp", alt: "Nizamio key features next to the admin dashboard on a tablet" },
    link: { label: "Read the case study", href: "/case-studies/nizamio-cloud-erp" },
  },
  {
    id: "goraahi",
    kicker: "06 · Work we're proud of",
    title: "GO Raahi Tours.",
    body: "Car rentals and guided tours from trusted local companies, booked in one place.",
    tone: "human",
    image: { src: "/portfolio/go-raahi/web-app.webp", alt: "GO Raahi Tours home page on a laptop" },
    link: { label: "Read the case study", href: "/case-studies/go-raahi-tours" },
  },
  {
    id: "yallasplit",
    kicker: "07 · Work we're proud of",
    title: "YallaSplit.",
    body: "Split group expenses and settle up in seconds, with budgets and income tracking built in.",
    tone: "amber",
    image: { src: "/portfolio/yallasplit/groups.webp", alt: "YallaSplit Groups screen in dark mode on a phone" },
    link: { label: "Read the case study", href: "/case-studies/yallasplit" },
  },
  {
    id: "connect",
    kicker: "08 · Let's connect",
    title: "Have an idea? Let's engineer what's next.",
    body: "Tell us what you want to build. An engineer, not a sales script, will reply.",
    tone: "brand",
    mark: "Hi",
    link: { label: "Contact us", href: "/contact" },
  },
];
