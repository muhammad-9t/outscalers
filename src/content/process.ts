export type ProcessPhase = {
  id: string;
  title: string;
  /** One word for the phase rail. */
  short: string;
  summary: string;
  human: string[];
  ai: string[];
  checkpoint: string;
  /** Relative AI involvement (1–3). People stay fully involved in every phase. */
  aiWeight: 1 | 2 | 3;
};

/** The Human + AI delivery model, shared by the homepage and How We Work. */
export const processPhases: ProcessPhase[] = [
  {
    id: "discovery",
    aiWeight: 1,
    title: "Discovery & planning",
    short: "Discovery",
    summary: "We start with your goals, users and constraints — not with a model or a framework.",
    human: ["Run stakeholder interviews and workshops", "Validate requirements and priorities", "Assess risks and define success criteria"],
    ai: ["Summarise documents and existing systems", "Draft structured requirement outlines for review"],
    checkpoint: "Scope and success criteria agreed with you",
  },
  {
    id: "architecture",
    aiWeight: 1,
    title: "Architecture & design",
    short: "Architecture",
    summary: "Engineers make the structural decisions that determine cost, security and longevity.",
    human: ["Choose architecture, data models and technologies", "Define security and access boundaries", "Document key decisions and trade-offs"],
    ai: ["Compare implementation options for discussion", "Generate diagrams and draft specifications"],
    checkpoint: "Architecture reviewed by a senior engineer",
  },
  {
    id: "implementation",
    aiWeight: 3,
    title: "AI-assisted implementation",
    short: "Implementation",
    summary: "AI accelerates routine work so engineers can focus on the problems that need judgment.",
    human: ["Write and direct the critical logic", "Break work into reviewable changes", "Decide what AI output to keep, change or discard"],
    ai: ["Scaffold boilerplate and repetitive code", "Suggest implementations and refactors", "Draft tests and documentation"],
    checkpoint: "Every change lives in version control with context",
  },
  {
    id: "review",
    aiWeight: 1,
    title: "Human code review",
    short: "Review",
    summary: "AI-assisted code is reviewed with the same care as any other code — often more.",
    human: ["Review correctness, readability and security", "Check behaviour against requirements", "Approve or request changes before merge"],
    ai: ["Highlight potential issues for reviewers to inspect", "Summarise large changes"],
    checkpoint: "No change merges without human approval",
  },
  {
    id: "testing",
    aiWeight: 2,
    title: "Automated & human-led testing",
    short: "Testing",
    summary: "Automated checks run on every change; people test what automation can't anticipate.",
    human: ["Exploratory and acceptance testing", "Security and edge-case validation", "Sign off on release readiness"],
    ai: ["Propose test cases and edge conditions", "Help triage test failures"],
    checkpoint: "Tests pass and release checklist is complete",
  },
  {
    id: "deployment",
    aiWeight: 1,
    title: "Deployment & improvement",
    short: "Deployment",
    summary: "We ship carefully, watch closely and keep improving after launch.",
    human: ["Plan releases and rollback strategies", "Monitor production and respond to incidents", "Prioritise improvements with you"],
    ai: ["Summarise logs and metrics", "Draft release notes and runbook updates"],
    checkpoint: "Monitoring in place and ownership clear",
  },
];
