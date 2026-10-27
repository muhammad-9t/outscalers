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
    slug: "fintech-platform-scaling",
    file: "accounts.service.ts",
    code: [
      'import { Router } from "express";',
      'import { db, redact } from "./db";',
      "",
      "export const accounts = Router();",
      "",
      'accounts.get("/:id", async (req, res) => {',
      "  const account = await db.account.find(req.params.id);",
      "  if (!account) return res.sendStatus(404);",
      "  // GDPR: mask personal data by default",
      "  res.json(redact(account));",
      "});",
    ],
    aiFrom: 6,
  },
  {
    slug: "ecommerce-peak-traffic",
    file: "edge-cache.ts",
    code: [
      'export const config = { runtime: "edge" };',
      "",
      "export default async function handler(req: Request) {",
      "  const cached = await cache.match(req);",
      "  if (cached) return cached;",
      "",
      "  const res = await fetch(origin(req));",
      "  await cache.put(req, res.clone(), { ttl: 300 });",
      "  return res;",
      "}",
    ],
    aiFrom: 3,
  },
  {
    slug: "healthcare-saas-compliance",
    file: "patients.py",
    code: [
      "from audit import log_access",
      "from auth import require_role",
      "",
      '@require_role("clinician")',
      "def get_patient(patient_id: str, user: User):",
      "    record = PatientRecord.get(patient_id)",
      '    log_access(user, record, reason="care")',
      "    return record.redacted_for(user.role)",
    ],
    aiFrom: 5,
  },
  {
    slug: "sample-ai-support-assistant",
    file: "assistant.py",
    code: [
      "def draft_reply(ticket: Ticket) -> Review:",
      "    context = search_help_center(ticket.text, k=5)",
      "    draft = llm.generate(",
      "        prompt=REPLY_PROMPT,",
      "        context=context,",
      "    )",
      "    # A support agent approves every reply",
      "    return Review(draft, assignee=ticket.owner)",
    ],
    aiFrom: 1,
  },
];
