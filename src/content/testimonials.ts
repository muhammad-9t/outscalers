/**
 * Testimonials shown on the home page "world" map.
 * PLACEHOLDER: every quote, name and role below is a sample until Outscalers sends real,
 * client-approved testimonials and photos. The sample photos are AI-generated faces of people who
 * do not exist (thispersondoesnotexist.com). While `testimonialsAreSample` is true the section says so.
 */

export type Testimonial = {
  name: string;
  role: string;
  /** Also picks the avatar spot on the home page map (see testimonial-map.tsx) */
  city: string;
  quote: string;
  /** Optional photo; initials are shown until one is set */
  photo?: string;
  /** Bigger avatar on the map */
  featured?: boolean;
};

export const testimonialsAreSample = true;

export const testimonials: Testimonial[] = [
  { name: "Lena K.", photo: "/testimonials/people/lena.webp", role: "Product lead, logistics SaaS", city: "Berlin", featured: true, quote: "Every pull request came with a clear review note. We always knew who decided what, and why." },
  { name: "Markus W.", photo: "/testimonials/people/markus.webp", role: "CTO, fintech startup", city: "Munich", quote: "They moved fast with AI on the routine work, but an engineer signed off every change." },
  { name: "Sophie R.", photo: "/testimonials/people/sophie.webp", role: "Founder, e-commerce brand", city: "London", featured: true, quote: "Our store stayed fast through the busiest week of the year. No drama, just a calm team." },
  { name: "Daan V.", photo: "/testimonials/people/daan.webp", role: "Head of engineering, travel platform", city: "Amsterdam", quote: "Clear weekly demos and honest estimates. It felt like an extension of our own team." },
  { name: "Omar A.", photo: "/testimonials/people/omar.webp", role: "Operations director, restaurant group", city: "Dubai", featured: true, quote: "POS, kitchen and reports finally talk to each other. Our managers got their evenings back." },
  { name: "Noura S.", photo: "/testimonials/people/noura.webp", role: "Founder, charity platform", city: "Riyadh", quote: "They understood the rules behind our product, not just the screens." },
  { name: "Ahmed R.", photo: "/testimonials/people/ahmed.webp", role: "CEO, cloud ERP company", city: "Islamabad", featured: true, quote: "Five modules, one data model and a mobile app, delivered on the date we agreed." },
  { name: "Sana M.", photo: "/testimonials/people/sana.webp", role: "Product owner, marketplace", city: "Lahore", quote: "Bookings, messages and payments in one place. Our users noticed the difference in a week." },
  { name: "Rachel T.", photo: "/testimonials/people/rachel.webp", role: "VP Product, health-tech", city: "New York", featured: true, quote: "Security and audit trails were designed in from day one, not bolted on at the end." },
  { name: "Ethan B.", photo: "/testimonials/people/ethan.webp", role: "Founder, SaaS startup", city: "Toronto", quote: "From idea to a launched v1 in twelve weeks, with tests we actually trust." },
  { name: "Wei L.", photo: "/testimonials/people/wei.webp", role: "Engineering manager, data platform", city: "Singapore", featured: true, quote: "Pipelines that are documented and monitored. Handover took a day, not a month." },
  { name: "Chloe H.", photo: "/testimonials/people/chloe.webp", role: "Director, professional services", city: "Sydney", quote: "Time zones were never a problem. We woke up to progress and clear notes every morning." },
];

