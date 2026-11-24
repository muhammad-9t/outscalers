import { caseStudies, type CaseStudy } from "./case-studies";
import type { ServiceSlug } from "./services";

export type PortfolioProject = {
  slug: string;
  name: string;
  industry: string;
  summary: string;
  services: ServiceSlug[];
  stack: string[];
  /** Links the card to a full write-up at /case-studies/[slug]. */
  caseStudy: CaseStudy | null;
  /**
   * `sample` projects are placeholders that show the page layout and must be
   * replaced with real, client-approved projects before launch.
   */
  status: "sample" | "draft" | "published";
};

const fromCaseStudies: PortfolioProject[] = caseStudies.map((c) => ({
  slug: c.slug,
  name: c.title,
  industry: c.client ?? c.industry,
  summary: c.summary,
  services: c.services,
  stack: c.stack,
  caseStudy: c,
  status: c.status,
}));

const samples: PortfolioProject[] = [
  {
    slug: "sample-ai-support-assistant",
    name: "AI assistant for customer support",
    industry: "Customer service",
    summary: "An assistant that drafts answers from a company's own help content, with an agent approving every reply.",
    services: ["ai-solutions"],
    stack: ["Python", "LLM API", "Vector search"],
    caseStudy: null,
    status: "sample",
  },
  {
    slug: "sample-invoice-automation",
    name: "Automated invoice processing",
    industry: "Logistics",
    summary: "Reading supplier invoices, matching them to orders and flagging mismatches for the finance team.",
    services: ["automation", "ai-solutions"],
    stack: ["Node.js", "Document AI", "Workflow engine"],
    caseStudy: null,
    status: "sample",
  },
  {
    slug: "sample-field-service-app",
    name: "Field service mobile app",
    industry: "Facilities management",
    summary: "A mobile app for technicians to receive jobs, capture photos and close work orders offline.",
    services: ["software-development"],
    stack: ["React Native", "TypeScript", "Node.js"],
    caseStudy: null,
    status: "sample",
  },
  {
    slug: "sample-analytics-platform",
    name: "Cloud analytics platform",
    industry: "Retail",
    summary: "Bringing sales, stock and web data into one warehouse with dashboards the business can trust.",
    services: ["data-cloud"],
    stack: ["dbt", "BigQuery", "Terraform"],
    caseStudy: null,
    status: "sample",
  },
  {
    slug: "sample-security-hardening",
    name: "Security hardening for a SaaS product",
    industry: "B2B software",
    summary: "Fixing findings from a penetration test and adding automated security checks to every release.",
    services: ["security-quality"],
    stack: ["OWASP ZAP", "GitHub Actions", "AWS"],
    caseStudy: null,
    status: "sample",
  },
  {
    slug: "sample-knowledge-search",
    name: "Internal knowledge search",
    industry: "Professional services",
    summary: "One search box across documents, wikis and tickets, with answers that cite their sources.",
    services: ["ai-solutions", "data-cloud"],
    stack: ["Python", "Elasticsearch", "LLM API"],
    caseStudy: null,
    status: "sample",
  },
];

export const portfolio: PortfolioProject[] = [...fromCaseStudies, ...samples];

/**
 * Projects featured in the scroll showcase, with the code the 3D laptop types out.
 * Lines before `aiFrom` are "typed" by the engineer; the rest arrive as an AI
 * suggestion that is then accepted. The code is illustrative, not client code.
 */
export type ShowcaseScreen = { slug: string; file: string; code: string[]; aiFrom: number };

export const showcaseScreens: ShowcaseScreen[] = [
  {
    slug: "nizamio-cloud-erp",
    file: "stock.service.ts",
    code: [
      'import { db } from "./db";',
      'import { notify } from "./alerts";',
      "",
      "export async function sell(item: Item, qty: number) {",
      "  const stock = await db.stock.decrement(item.id, qty);",
      "  await db.ledger.record({ item, qty, branch: item.branch });",
      "  if (stock.level <= stock.reorderAt) {",
      '    await notify(item.branch, "low-stock", item);',
      "  }",
      "  return stock;",
      "}",
    ],
    aiFrom: 4,
  },
  {
    slug: "hisoq",
    file: "kitchen.tickets.ts",
    code: [
      'import { kds } from "./kitchen-display";',
      "",
      "export function routeOrder(order: Order) {",
      "  for (const line of order.lines) {",
      "    const station = line.item.station;",
      "    kds.push(station, {",
      "      table: order.table,",
      "      item: line.item.name,",
      "      modifiers: line.modifiers,",
      '      priority: order.type === "dine-in" ? 1 : 2,',
      "    });",
      "  }",
      "}",
    ],
    aiFrom: 5,
  },
  {
    slug: "outscalers-hub",
    file: "assistant.ts",
    code: [
      "export async function answer(user: Employee, q: string) {",
      "  if (asksAboutLeave(q)) {",
      "    const leave = await hr.leaveBalance(user.id);",
      "    return `You have ${leave.left} of ${leave.total} left.`;",
      "  }",
      "  const policies = await search(q, { role: user.role });",
      "  // Answers only from policies this user may read",
      "  return summarise(policies);",
      "}",
    ],
    aiFrom: 5,
  },
  {
    slug: "go-raahi-tours",
    file: "bookings.ts",
    code: [
      "export async function book(trip: Listing, guest: User) {",
      "  const free = await isAvailable(trip.id, guest.dates);",
      '  if (!free) throw new Error("Those dates are taken");',
      "",
      "  const booking = await db.bookings.create({",
      "    listing: trip.id,",
      "    company: trip.companyId,",
      "    guest: guest.id,",
      "  });",
      '  await messages.notify(trip.companyId, "new-booking");',
      "  return booking;",
      "}",
    ],
    aiFrom: 4,
  },
  {
    slug: "yallasplit",
    file: "settle-up.ts",
    code: [
      "export function settleUp(balances: Balance[]) {",
      "  const owes = balances.filter((b) => b.amount < 0);",
      "  const gets = balances.filter((b) => b.amount > 0);",
      "  const payments: Payment[] = [];",
      "  // Fewest payments: match biggest debts first",
      "  while (owes.length && gets.length) {",
      "    const [from, to] = [largest(owes), largest(gets)];",
      "    payments.push(pay(from, to));",
      "  }",
      "  return payments;",
      "}",
    ],
    aiFrom: 4,
  },
  {
    slug: "zakatly",
    file: "zakat.ts",
    code: [
      "const ZAKAT_RATE = 0.025;",
      "",
      "export function zakatDue(assets: Assets, nisab: number) {",
      "  const wealth = assets.cash + assets.gold + assets.trade;",
      "  const net = wealth - assets.debtsDue;",
      "  // Zakat is due only above the nisab, after one lunar year",
      "  if (net < nisab || !assets.heldOneYear) return 0;",
      "  return net * ZAKAT_RATE;",
      "}",
    ],
    aiFrom: 3,
  },
];
