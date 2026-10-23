export type ServiceSlug =
  | "ai-solutions"
  | "software-development"
  | "automation"
  | "data-cloud"
  | "security-quality";

export type Service = {
  slug: ServiceSlug;
  title: string;
  shortTitle: string;
  summary: string;
  metaDescription: string;
  hero: { eyebrow: string; title: string; lead: string };
  problems: { title: string; body: string }[];
  deliverables: { title: string; body: string }[];
  approach: { ai: string[]; human: string[] };
  capabilities: { group: string; items: string[] }[];
  process: { title: string; body: string }[];
  related: ServiceSlug[];
};

export const services: Service[] = [
  {
    slug: "ai-solutions",
    title: "AI Solutions & Agents",
    shortTitle: "AI Solutions",
    summary:
      "Assistants, agents and document intelligence connected to your own data and systems — designed with guardrails and human escalation paths.",
    metaDescription:
      "LLM integrations, AI assistants, agents, knowledge retrieval and document intelligence, engineered with guardrails and human oversight by Outscalers.",
    hero: {
      eyebrow: "AI Solutions & Agents",
      title: "AI that works inside your business, not beside it.",
      lead: "We design and build AI assistants, agents and document workflows that use your knowledge, respect your permissions and hand off to people when confidence is low.",
    },
    problems: [
      {
        title: "Knowledge is scattered",
        body: "Answers live across documents, tickets, wikis and inboxes. Teams spend time searching instead of deciding.",
      },
      {
        title: "Documents need manual handling",
        body: "Invoices, contracts and forms are read and re-keyed by hand, which is slow and error-prone.",
      },
      {
        title: "AI pilots stall before production",
        body: "Prototypes look promising, but lack evaluation, access control, monitoring and a clear owner.",
      },
    ],
    deliverables: [
      {
        title: "LLM integrations",
        body: "Language models connected to your products and internal tools through well-defined, testable APIs.",
      },
      {
        title: "Conversational assistants",
        body: "Assistants for customers or staff, grounded in approved content and scoped to clear tasks.",
      },
      {
        title: "AI agents",
        body: "Agents that call tools and APIs to complete multi-step tasks — with permissions, limits and approval steps.",
      },
      {
        title: "Knowledge retrieval (RAG)",
        body: "Search and answer systems over your own content, with source references so answers can be checked.",
      },
      {
        title: "Document intelligence",
        body: "Extraction and classification for structured and semi-structured documents, with review queues for exceptions.",
      },
      {
        title: "Multimodal workflows",
        body: "Pipelines that combine text, images and scanned documents where your use case needs them.",
      },
    ],
    approach: {
      ai: [
        "Drafts prompts, retrieval logic and integration code for engineers to refine",
        "Generates evaluation cases and edge-case variations",
        "Summarises model behaviour across test runs",
      ],
      human: [
        "Define the use case, success criteria and acceptable risk",
        "Choose models, data boundaries and access controls",
        "Review outputs against real examples before release",
        "Own escalation rules and production monitoring",
      ],
    },
    capabilities: [
      { group: "Models & APIs", items: ["Hosted LLM APIs", "Open-weight models", "Embeddings", "Function / tool calling"] },
      { group: "Retrieval", items: ["Vector search", "Hybrid search", "Chunking strategies", "Source citation"] },
      { group: "Safety & quality", items: ["Evaluation suites", "Guardrails", "PII handling", "Human-in-the-loop review"] },
      { group: "Delivery", items: ["Python", "Node.js", "REST & webhooks", "Observability"] },
    ],
    process: [
      { title: "Use-case framing", body: "Identify where AI adds measurable value and where a simpler solution is better." },
      { title: "Data & risk review", body: "Map sources, permissions and failure modes before any model is chosen." },
      { title: "Prototype with evaluation", body: "Build a working slice and test it against real, representative examples." },
      { title: "Harden & integrate", body: "Add guardrails, logging, fallbacks and integrations with your systems." },
      { title: "Launch & monitor", body: "Release gradually, review feedback and tune behaviour with your team." },
    ],
    related: ["automation", "data-cloud", "security-quality"],
  },
  {
    slug: "software-development",
    title: "Custom Software Development",
    shortTitle: "Software Development",
    summary:
      "Web and mobile applications, SaaS platforms, APIs and enterprise systems — built by engineers who own the architecture, with AI accelerating the routine work.",
    metaDescription:
      "Custom web applications, mobile apps, SaaS platforms, APIs and enterprise software from Outscalers — human-led engineering accelerated by AI-assisted workflows.",
    hero: {
      eyebrow: "Custom Software Development",
      title: "Software built around how your business actually works.",
      lead: "From first release to long-term platform, we design, build and maintain software with modern architecture and practical engineering standards. AI speeds up delivery; engineers stay accountable for every decision.",
    },
    problems: [
      {
        title: "Off-the-shelf tools don't fit",
        body: "Workarounds and spreadsheets fill the gaps between products that were never designed for your process.",
      },
      {
        title: "Legacy systems slow you down",
        body: "Ageing codebases are hard to change, hard to test and risky to deploy.",
      },
      {
        title: "Products need to scale",
        body: "Growth exposes performance bottlenecks, fragile integrations and missing automation.",
      },
    ],
    deliverables: [
      { title: "Web applications", body: "Responsive, accessible web apps for customers, partners and internal teams." },
      { title: "Mobile applications", body: "Native and cross-platform iOS and Android apps that share APIs with your web platform." },
      { title: "UI/UX design", body: "Research-informed interface design and prototypes, validated with users before build." },
      { title: "SaaS platforms", body: "Multi-tenant products with billing, roles, auditing and room to grow." },
      { title: "APIs & backend systems", body: "Well-documented services that are testable, observable and versioned." },
      { title: "Enterprise applications", body: "Line-of-business systems integrated with your existing tools and identity provider." },
      { title: "Modernisation & performance", body: "Incremental refactoring, profiling and optimisation of existing applications." },
    ],
    approach: {
      ai: [
        "Scaffolds boilerplate, data models and repetitive UI",
        "Suggests tests and documentation from existing code",
        "Helps engineers explore unfamiliar or legacy codebases faster",
      ],
      human: [
        "Own architecture, data design and technology choices",
        "Review every change before it is merged",
        "Make trade-offs on security, performance and maintainability",
        "Communicate progress and decisions with your team",
      ],
    },
    capabilities: [
      { group: "Frontend", items: ["React", "Next.js", "TypeScript", "Accessible UI"] },
      { group: "Mobile", items: ["React Native", "Flutter", "iOS", "Android", "Ionic"] },
      { group: "CMS & commerce", items: ["WordPress", "Drupal", "Magento", "Shopify"] },
      { group: "Backend", items: ["Node.js", "Python", "REST & GraphQL", "Background jobs"] },
      { group: "Data", items: ["PostgreSQL", "Caching", "Search", "Migrations"] },
      { group: "Platform", items: ["AWS", "Containers", "CI/CD", "Monitoring"] },
    ],
    process: [
      { title: "Discovery", body: "Understand users, constraints and the outcomes the software must support." },
      { title: "Architecture", body: "Choose a structure that fits today's needs and can evolve." },
      { title: "Iterative delivery", body: "Short cycles with working demos, code review and automated tests." },
      { title: "Release", body: "Production deployment, documentation and handover or ongoing support." },
    ],
    related: ["ai-solutions", "data-cloud", "security-quality"],
  },
  {
    slug: "automation",
    title: "Business Process Automation",
    shortTitle: "Automation",
    summary:
      "Connect the systems you already use, remove repetitive manual steps and orchestrate workflows — with people approving the decisions that matter.",
    metaDescription:
      "Workflow automation, system integrations and intelligent process orchestration from Outscalers, with human approval steps where they matter.",
    hero: {
      eyebrow: "Business Process Automation",
      title: "Less copy-paste. More time for work that needs people.",
      lead: "We map your workflows, connect the systems behind them and automate the repetitive steps — keeping people in control of approvals, exceptions and judgment calls.",
    },
    problems: [
      { title: "Manual hand-offs", body: "Data is re-entered between systems, creating delays and inconsistencies." },
      { title: "Invisible bottlenecks", body: "Nobody can see where a request is stuck or why it is taking so long." },
      { title: "Brittle point integrations", body: "One-off scripts break silently when a connected system changes." },
    ],
    deliverables: [
      { title: "Workflow automation", body: "Multi-step workflows with triggers, conditions, retries and audit trails." },
      { title: "System integrations", body: "Reliable connections between CRMs, ERPs, finance tools, databases and internal apps." },
      { title: "Repetitive-task reduction", body: "Automation for data entry, reconciliation, reporting and notifications." },
      { title: "Intelligent orchestration", body: "AI-assisted classification and routing, with confidence thresholds and human review queues." },
    ],
    approach: {
      ai: [
        "Classifies and extracts information from incoming requests",
        "Drafts integration code and data mappings for review",
        "Flags unusual cases for human attention",
      ],
      human: [
        "Map the real process with the people who run it",
        "Decide which steps should never be automated",
        "Approve exceptions and high-impact actions",
        "Monitor outcomes and adjust rules over time",
      ],
    },
    capabilities: [
      { group: "Integration", items: ["REST & webhooks", "Message queues", "Scheduled jobs", "File-based exchange"] },
      { group: "Orchestration", items: ["Workflow engines", "Retries & idempotency", "Audit logging", "Alerting"] },
      { group: "Intelligence", items: ["Classification", "Extraction", "Routing", "Review queues"] },
    ],
    process: [
      { title: "Map the workflow", body: "Document each step, owner, system and exception path." },
      { title: "Prioritise", body: "Start with the steps that are frequent, rules-based and low-risk." },
      { title: "Automate with checkpoints", body: "Build the flow with approval steps and clear fallbacks." },
      { title: "Measure and extend", body: "Track throughput and exceptions, then expand coverage." },
    ],
    related: ["ai-solutions", "software-development", "data-cloud"],
  },
  {
    slug: "data-cloud",
    title: "Data Engineering & Cloud",
    shortTitle: "Data & Cloud",
    summary:
      "Data pipelines, analytics foundations and cloud infrastructure that are reliable today and ready for AI workloads tomorrow.",
    metaDescription:
      "Data pipelines, analytics foundations, cloud architecture, deployment workflows and AI-ready infrastructure from Outscalers.",
    hero: {
      eyebrow: "Data Engineering & Cloud",
      title: "Reliable data and infrastructure, ready for what's next.",
      lead: "We build the pipelines, storage and cloud platforms that turn raw data into trustworthy insight — and give your AI initiatives a solid foundation.",
    },
    problems: [
      { title: "Data you can't trust", body: "Reports disagree because data arrives late, duplicated or inconsistent." },
      { title: "Infrastructure that doesn't scale", body: "Traffic spikes and growing workloads expose fragile, manually managed environments." },
      { title: "AI without a foundation", body: "Models need clean, governed and accessible data that most organisations don't yet have." },
    ],
    deliverables: [
      { title: "Data pipelines", body: "Batch and streaming ingestion with validation, lineage and monitoring." },
      { title: "Analytics foundations", body: "Modelled warehouses and data marts that support consistent reporting." },
      { title: "Cloud architecture", body: "Scalable, highly available environments designed for your workload and budget." },
      { title: "Deployment workflows", body: "Infrastructure as code, CI/CD pipelines and repeatable environments." },
      { title: "AI-ready infrastructure", body: "Storage, retrieval and compute patterns that support AI and ML workloads." },
      { title: "Performance & cost optimisation", body: "Profiling, right-sizing and caching to improve speed and control spend." },
    ],
    approach: {
      ai: [
        "Drafts transformation logic and infrastructure templates",
        "Generates data-quality checks from schemas",
        "Summarises logs and metrics during investigations",
      ],
      human: [
        "Design data models, ownership and governance",
        "Decide on cloud architecture, security boundaries and cost trade-offs",
        "Review every infrastructure change before it is applied",
        "Own on-call runbooks and incident response",
      ],
    },
    capabilities: [
      { group: "Data", items: ["PostgreSQL", "Python", "ETL / ELT", "Data quality checks"] },
      { group: "Cloud", items: ["AWS", "Containers", "Serverless", "CDN & caching"] },
      { group: "Operations", items: ["Infrastructure as code", "CI/CD", "Monitoring", "Cost management", "Network management"] },
    ],
    process: [
      { title: "Assess", body: "Review current data flows, infrastructure and pain points." },
      { title: "Design", body: "Define target architecture, data models and migration path." },
      { title: "Build in stages", body: "Deliver incrementally so value arrives early and risk stays low." },
      { title: "Operate", body: "Monitoring, alerting, documentation and ongoing optimisation." },
    ],
    related: ["ai-solutions", "software-development", "security-quality"],
  },
  {
    slug: "security-quality",
    title: "Security & Quality Engineering",
    shortTitle: "Security & Quality",
    summary:
      "Automated testing, code review, security practices and monitoring — human judgment and automated checks working as complementary safeguards.",
    metaDescription:
      "Automated testing, code review, security practices, validation and production readiness from Outscalers — human review and automated checks working together.",
    hero: {
      eyebrow: "Security & Quality Engineering",
      title: "Confidence comes from layered safeguards.",
      lead: "No single check catches everything. We combine automated testing and scanning with experienced human review so software reaches production ready — and stays that way.",
    },
    problems: [
      { title: "Releases feel risky", body: "Limited test coverage means every deployment is a gamble." },
      { title: "AI-generated code needs scrutiny", body: "Code produced quickly still needs review for correctness, security and maintainability." },
      { title: "Compliance pressure", body: "Customers and regulators expect evidence of secure development practices." },
    ],
    deliverables: [
      { title: "Automated testing", body: "Unit, integration and end-to-end tests wired into your delivery pipeline." },
      { title: "Code review practice", body: "Structured human review, including dedicated review of AI-assisted changes." },
      { title: "Secure development", body: "Dependency scanning, secret detection, threat modelling and secure defaults." },
      { title: "Validation & QA", body: "Exploratory and acceptance testing against real user scenarios." },
      { title: "Monitoring & alerting", body: "Error tracking, performance metrics and alerts that reach the right people." },
      { title: "Production readiness", body: "Release checklists, rollback plans and documentation before go-live." },
    ],
    approach: {
      ai: [
        "Suggests test cases and edge conditions",
        "Highlights suspicious patterns for reviewers to inspect",
        "Summarises scan results and changes for faster triage",
      ],
      human: [
        "Review code and architecture for security and correctness",
        "Run exploratory testing that automation cannot anticipate",
        "Decide what is acceptable to release",
        "Lead incident response and post-incident improvements",
      ],
    },
    capabilities: [
      { group: "Testing", items: ["Unit & integration", "End-to-end", "Performance testing", "Accessibility checks"] },
      { group: "Security", items: ["Dependency scanning", "Secret detection", "Access control review", "Threat modelling"] },
      { group: "Operations", items: ["Error tracking", "Metrics & logs", "Alerting", "Release checklists"] },
    ],
    process: [
      { title: "Baseline", body: "Assess current tests, pipelines and security practices." },
      { title: "Close critical gaps", body: "Address the highest-risk areas first." },
      { title: "Automate safeguards", body: "Embed checks into CI/CD so they run on every change." },
      { title: "Sustain", body: "Review metrics regularly and keep standards current." },
    ],
    related: ["software-development", "data-cloud", "ai-solutions"],
  },
];

export function getService(slug: ServiceSlug): Service {
  const service = services.find((s) => s.slug === slug);
  if (!service) throw new Error(`Unknown service: ${slug}`);
  return service;
}

export const serviceHref = (slug: ServiceSlug) => `/services/${slug}`;
