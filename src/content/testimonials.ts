/**
 * Client quotes for the home page (simple grid, see testimonial-grid.tsx).
 * PLACEHOLDER: every quote, name and role below is a SAMPLE. Replace them with real, client-approved
 * quotes before turning `showTestimonials` on. (The old AI-generated photos have been deleted.)
 */

export type Testimonial = {
  name: string;
  role: string;
  /** Where the client is based (not shown yet) */
  city: string;
  quote: string;
  /** Optional photo; initials are shown until one is set */
  photo?: string;
  /** Bigger avatar on the map */
  featured?: boolean;
};

/**
 * HIDDEN: the "Client voices" section on the home page only shows when this is true.
 * Our clients hire our engineers under their own brand and don't want to be named, so the
 * section stays off. Before turning it on, replace every sample entry below with real,
 * approved quotes.
 */
export const showTestimonials = false;

export const testimonials: Testimonial[] = [
  { name: "Lena K.", role: "Product lead, logistics SaaS", city: "Berlin", featured: true, quote: "Every pull request came with a clear review note. We always knew who decided what, and why." },
  { name: "Markus W.", role: "CTO, fintech startup", city: "Munich", quote: "They moved fast with AI on the routine work, but an engineer signed off every change." },
  { name: "Sophie R.", role: "Founder, e-commerce brand", city: "London", featured: true, quote: "Our store stayed fast through the busiest week of the year. No drama, just a calm team." },
  { name: "Daan V.", role: "Head of engineering, travel platform", city: "Amsterdam", quote: "Clear weekly demos and honest estimates. It felt like an extension of our own team." },
  { name: "Omar A.", role: "Operations director, restaurant group", city: "Dubai", featured: true, quote: "POS, kitchen and reports finally talk to each other. Our managers got their evenings back." },
  { name: "Noura S.", role: "Founder, charity platform", city: "Riyadh", quote: "They understood the rules behind our product, not just the screens." },
  { name: "Ahmed R.", role: "CEO, cloud ERP company", city: "Islamabad", featured: true, quote: "Five modules, one data model and a mobile app, delivered on the date we agreed." },
  { name: "Sana M.", role: "Product owner, marketplace", city: "Lahore", quote: "Bookings, messages and payments in one place. Our users noticed the difference in a week." },
  { name: "Rachel T.", role: "VP Product, health-tech", city: "New York", featured: true, quote: "Security and audit trails were designed in from day one, not bolted on at the end." },
  { name: "Ethan B.", role: "Founder, SaaS startup", city: "Toronto", quote: "From idea to a launched v1 in twelve weeks, with tests we actually trust." },
  { name: "Wei L.", role: "Engineering manager, data platform", city: "Singapore", featured: true, quote: "Pipelines that are documented and monitored. Handover took a day, not a month." },
  { name: "Chloe H.", role: "Director, professional services", city: "Sydney", quote: "Time zones were never a problem. We woke up to progress and clear notes every morning." },
];

