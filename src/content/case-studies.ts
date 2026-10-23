import type { ServiceSlug } from "./services";

export type CaseStudy = {
  slug: string;
  title: string;
  industry: string;
  /** Client name is only shown once disclosure is approved. */
  client: string | null;
  summary: string;
  overview: string;
  challenge: string[];
  solution: string[];
  /** Only populated when Human + AI practices were actually used on the project. */
  humanAiApproach: string[] | null;
  stack: string[];
  implementation: string[];
  /** Only verified, client-approved results. Empty until confirmed. */
  results: string[];
  services: ServiceSlug[];
  visual: "scale" | "traffic" | "compliance";
  /**
   * `draft` profiles are based on project summaries from the previous website
   * and still need client approval, verified results and screenshots.
   */
  status: "draft" | "published";
};

export const caseStudies: CaseStudy[] = [
  {
    slug: "fintech-platform-scaling",
    title: "Scaling a fintech platform for rapid user growth",
    industry: "Financial services",
    client: null,
    summary:
      "Re-architecting a growing fintech product into services that could scale with demand while meeting data-protection requirements.",
    overview:
      "A fintech startup needed its platform to keep pace with fast user growth. The engagement focused on moving from a monolithic application to a service-based architecture with stronger data-protection controls.",
    challenge: [
      "A single application was becoming a bottleneck as usage grew.",
      "Personal and financial data required careful handling under GDPR.",
      "The team needed to keep shipping features while the platform evolved.",
    ],
    solution: [
      "Incremental migration to a microservices architecture.",
      "Data-protection controls designed into services and storage.",
      "Automated testing and continuous integration to keep releases safe.",
    ],
    humanAiApproach: null,
    stack: ["Node.js", "PostgreSQL", "AWS", "Microservices"],
    implementation: [
      "Services were extracted one domain at a time to limit risk.",
      "Monitoring was introduced alongside each new service.",
    ],
    results: [],
    services: ["software-development", "data-cloud", "security-quality"],
    visual: "scale",
    status: "draft",
  },
  {
    slug: "ecommerce-peak-traffic",
    title: "Preparing an e-commerce platform for peak traffic",
    industry: "Retail & e-commerce",
    client: null,
    summary:
      "Cloud-native infrastructure and CDN caching to keep an online store responsive during seasonal traffic spikes.",
    overview:
      "An e-commerce business needed its platform to stay available and responsive through high-traffic sales events such as Black Friday, without permanently over-provisioning infrastructure.",
    challenge: [
      "Traffic during sales events was many times higher than normal.",
      "Infrastructure costs were high outside of peak periods.",
      "Slow pages during peaks risked lost orders.",
    ],
    solution: [
      "Cloud-native infrastructure that scales with demand.",
      "CDN and caching strategy for catalogue and static content.",
      "Load testing ahead of known peak events.",
    ],
    humanAiApproach: null,
    stack: ["AWS", "CDN", "Containers", "PostgreSQL"],
    implementation: [
      "Capacity was planned around expected peak events.",
      "Caching rules were tuned per content type.",
    ],
    results: [],
    services: ["data-cloud", "software-development"],
    visual: "traffic",
    status: "draft",
  },
  {
    slug: "healthcare-saas-compliance",
    title: "Compliance-ready patient data management for a healthcare SaaS",
    industry: "Healthcare",
    client: null,
    summary:
      "Strengthening security and compliance practices so a healthcare SaaS product could grow while handling patient data responsibly.",
    overview:
      "A healthcare SaaS provider needed to scale its patient data management capabilities while meeting HIPAA requirements and the expectations of its healthcare customers.",
    challenge: [
      "Patient data required strict access control and auditability.",
      "Customers expected evidence of secure development practices.",
      "The product needed to support a growing number of users.",
    ],
    solution: [
      "Access controls and audit logging designed around HIPAA requirements.",
      "Secure development practices embedded in the delivery pipeline.",
      "Scalable data storage and processing for patient records.",
    ],
    humanAiApproach: null,
    stack: ["Python", "PostgreSQL", "AWS"],
    implementation: [
      "Security requirements were captured as testable acceptance criteria.",
      "Audit trails were added to sensitive operations.",
    ],
    results: [],
    services: ["security-quality", "data-cloud", "software-development"],
    visual: "compliance",
    status: "draft",
  },
];

export function getCaseStudy(slug: string) {
  return caseStudies.find((c) => c.slug === slug);
}
