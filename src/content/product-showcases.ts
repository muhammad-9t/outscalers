/**
 * Rich product pages ("show the product, not a description"). A product with an entry here gets the
 * new product page (src/components/product/*); others keep the older case-study layout until their
 * assets arrive. Copy, colours, logo and interface visuals come from each product's own brand kit and
 * website (Nizamio: ~/pro/nizamio-brand-kit and nizamio.com, demo data only).
 *
 * To add a product: logo SVG, brand colours, a hero image (devices on a transparent background),
 * one preview per feature, and its facts. Images live in /public/portfolio/<slug>/.
 */

export type ShowcaseImage = { src: string; alt: string; width: number; height: number };

export type ProductShowcase = {
  /** The product's own colours: primary (buttons, accents), deep (headings), tint (soft panels), sun (highlights) */
  brand: { primary: string; deep: string; tint: string; sun: string; stage: string };
  logo: ShowcaseImage;
  /** The product's own headline (from its website); headlineAccent = its last words, shown in the primary colour */
  headline: string;
  headlineAccent?: string;
  lead: string;
  platforms: string[];
  live: { href: string; label: string };
  hero: ShowcaseImage;
  /** Feature tabs: one real interface preview each */
  features: {
    slug: string;
    name: string;
    mascot?: string;
    title: string;
    line: string;
    highlights: string[];
    soon?: boolean;
    image: ShowcaseImage;
  }[];
  /** Apps in the product family */
  apps?: { name: string; icon: string; platforms: string; line: string }[];
  appsImage?: ShowcaseImage;
};

const NIZ = "/portfolio/nizamio";
const preview = (slug: string, alt: string): ShowcaseImage => ({ src: `${NIZ}/site/module-${slug}.png`, alt, width: 1122, height: 624 });

export const productShowcases: Record<string, ProductShowcase> = {
  "nizamio-cloud-erp": {
    brand: { primary: "#0E7490", deep: "#164E63", tint: "#E6F2F5", sun: "#FFC83D", stage: "#F7F5F0" },
    logo: { src: `${NIZ}/brand/nizamio-logo.svg`, alt: "Nizamio", width: 168, height: 47 },
    headline: "Run your whole business from one platform",
    headlineAccent: "one platform",
    lead: "A cloud ERP for growing businesses: CRM, POS, inventory and accounting on the web, plus free Ledger and POS apps for iOS and Android.",
    platforms: ["Web app", "iOS", "Android"],
    live: { href: "https://nizamio.com/", label: "Visit nizamio.com" },
    hero: {
      src: `${NIZ}/site/hero.png`,
      alt: "Nizamio dashboard with sales, profit and receivables, beside the Ledger and POS mobile apps",
      width: 2048,
      height: 1356,
    },
    features: [
      {
        slug: "crm",
        name: "CRM",
        mascot: `${NIZ}/brand/mascot-dosti.svg`,
        title: "Close more deals",
        line: "Your whole pipeline, from lead to loyal customer.",
        highlights: ["Customer management", "Lead tracking & pipeline", "Sales forecasting", "Communications log"],
        image: preview("crm", "Nizamio CRM leads pipeline with new, contacted and won deals"),
      },
      {
        slug: "pos",
        name: "POS",
        mascot: `${NIZ}/brand/mascot-tilly.svg`,
        title: "Run your counter",
        line: "Fast checkout at every counter, every branch.",
        highlights: ["Fast, flexible checkout", "Multiple payment methods", "Cash management", "Real-time reporting"],
        image: preview("pos", "Nizamio POS checkout screen"),
      },
      {
        slug: "inventory",
        name: "Inventory",
        mascot: `${NIZ}/brand/mascot-stocky.svg`,
        title: "Optimise your supply chain",
        line: "Stock, suppliers and reorders across every location.",
        highlights: ["Stock across locations", "Warehouse management", "Supplier management", "Low-stock alerts"],
        image: preview("inventory", "Nizamio inventory with stock levels per location"),
      },
      {
        slug: "accounting",
        name: "Accounting",
        mascot: `${NIZ}/brand/mascot-billo.svg`,
        title: "Stay audit-ready",
        line: "Invoices, ledgers and reports you can trust.",
        highlights: ["Invoicing & receivables", "Bill management", "General ledger", "Financial reports"],
        image: preview("accounting", "Nizamio profit and loss with sales, expenses and invoices"),
      },
      {
        slug: "hrm",
        name: "HRM",
        mascot: `${NIZ}/brand/mascot-badgy.svg`,
        title: "Manage your team",
        line: "Payroll, attendance and leave in one place.",
        highlights: ["Employee records", "Attendance & shifts", "Payroll", "Leave management"],
        soon: true,
        image: preview("hrm", "Nizamio HRM team overview"),
      },
    ],
    apps: [
      { name: "Nizamio", icon: `${NIZ}/brand/app-web.svg`, platforms: "Web app", line: "The full ERP for every branch." },
      { name: "Nizamio Ledger", icon: `${NIZ}/brand/app-ledger.svg`, platforms: "iOS & Android · Free", line: "Your business book, in your pocket." },
      { name: "Nizamio POS", icon: `${NIZ}/brand/app-pos.svg`, platforms: "iOS & Android · Free", line: "Sell and print receipts from your phone." },
    ],
    appsImage: {
      src: `${NIZ}/site/phones.png`,
      alt: "Nizamio Ledger app: splash screen and a customer ledger with WhatsApp and SMS reminders",
      width: 1040,
      height: 980,
    },
  },
};
