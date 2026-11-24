/**
 * The project story on each product page: a short timeline of how the product was built.
 * `people` are role ids from src/content/team.ts. Facts come from Outscalers (Nov 2026);
 * keep every number real.
 */

export type StoryKind = "kickoff" | "design" | "commit" | "review" | "deadline" | "launch" | "release";

export type Milestone = {
  when: string;
  kind: StoryKind;
  title: string;
  body: string;
  stat?: { value: string; label: string };
  people: string[];
};

export type ProjectStory = {
  /** The line that carries the story */
  line: "wave" | "zigzag" | "loops";
  /** At a glance: shown above the timeline */
  facts: { duration: string; team: string; screens: string; status: string };
  summary: string;
  milestones: Milestone[];
};

const SMALL_TEAM = "1 full-stack developer · 1 QA · 1 project manager";

export const projectStories: Record<string, ProjectStory> = {
  "nizamio-cloud-erp": {
    line: "wave",
    facts: { duration: "10 months", team: "2 senior engineers · 1 mobile developer · 2 QA · 1 product owner", screens: "100+", status: "Live" },
    summary: "Five business modules, a web dashboard and a mobile app, built as one platform.",
    milestones: [
      { when: "Months 1–2", kind: "design", title: "Discovery & design", body: "HRM, CRM, POS, inventory and accounting mapped onto one data model.", people: ["pm", "design-lead"] },
      { when: "Months 3–7", kind: "commit", title: "Web modules built", body: "All five modules and the admin dashboard, every change reviewed.", people: ["fullstack", "eng-lead"] },
      { when: "Months 8–9", kind: "review", title: "Mobile app & testing", body: "iOS and Android app, tested end to end by QA.", people: ["mobile", "qa-lead"] },
      { when: "Month 10", kind: "launch", title: "Live", body: "Web dashboard, mobile app and landing page released.", people: ["pm", "fullstack", "mobile", "qa-lead"] },
    ],
  },
  "go-raahi-tours": {
    line: "zigzag",
    facts: { duration: "3 months", team: SMALL_TEAM, screens: "~30", status: "Live" },
    summary: "A booking platform for local car-rental and tour companies.",
    milestones: [
      { when: "Weeks 1–2", kind: "design", title: "Flows designed", body: "Traveller and company journeys agreed first.", people: ["pm", "fullstack"] },
      { when: "Weeks 3–11", kind: "commit", title: "Built & reviewed", body: "Search, bookings and messaging, tested by QA.", people: ["fullstack", "qa-lead"] },
      { when: "Week 12", kind: "launch", title: "Live", body: "Launched with the first local companies.", people: ["pm", "fullstack", "qa-lead"] },
    ],
  },
  yallasplit: {
    line: "loops",
    facts: { duration: "2 months", team: SMALL_TEAM, screens: "~25", status: "Live" },
    summary: "An expense-splitting app for iOS and Android.",
    milestones: [
      { when: "Week 1", kind: "design", title: "Core loop designed", body: "Groups, expenses and settle-up agreed first.", people: ["pm", "fullstack"] },
      { when: "Weeks 2–7", kind: "commit", title: "Built & reviewed", body: "Multi-currency, budgets and smart settlements, tested by QA.", people: ["fullstack", "qa-lead"] },
      { when: "Week 8", kind: "release", title: "Released", body: "Live on the App Store and Google Play.", people: ["pm", "fullstack", "qa-lead"] },
    ],
  },
  zakatly: {
    line: "wave",
    facts: { duration: "1 month", team: SMALL_TEAM, screens: "~15", status: "Live" },
    summary: "An Islamic charity app for Android, from the Zakat rules to Google Play.",
    milestones: [
      { when: "Week 1", kind: "design", title: "Rules & design", body: "Zakat rules, giving types and screens agreed.", people: ["pm", "fullstack"] },
      { when: "Weeks 2–3", kind: "commit", title: "Built & reviewed", body: "Calculator, contributions and reports, tested by QA.", people: ["fullstack", "qa-lead"] },
      { when: "Week 4", kind: "release", title: "Released", body: "Live on Google Play.", people: ["pm", "fullstack", "qa-lead"] },
    ],
  },
  hisoq: {
    line: "zigzag",
    facts: { duration: "6 months", team: "Full-stack · QA · project manager", screens: "50+", status: "Live" },
    summary: "A multi-tenant restaurant platform, from the first service walk-through to live branches.",
    milestones: [
      { when: "Month 1", kind: "design", title: "Discovery & design", body: "Followed a service from order to close-out; dashboard, POS and kitchen screens designed.", people: ["pm", "fullstack"] },
      { when: "Months 2–4", kind: "commit", title: "Platform built", body: "Brands, branches, roles, POS, kitchen display and inventory.", people: ["fullstack"] },
      { when: "Month 5", kind: "review", title: "Testing & pilot", body: "Live order sync and reports tested with QA.", people: ["fullstack", "qa-lead"] },
      { when: "Month 6", kind: "launch", title: "Live", body: "Live at hisoq.com with self-serve sign-up.", people: ["pm", "fullstack", "qa-lead"] },
    ],
  },
  "outscalers-hub": {
    line: "loops",
    facts: { duration: "6 months", team: "Full-stack · mobile · QA · project manager", screens: "50+", status: "Live" },
    summary: "Our own CRM: built for our team first, then opened to other businesses.",
    milestones: [
      { when: "Month 1", kind: "design", title: "Discovery & design", body: "Every spreadsheet our team used, turned into modules.", people: ["pm", "fullstack"] },
      { when: "Months 2–4", kind: "commit", title: "Web modules built", body: "HR, finance, clients and the Knowledge Vault, with role-based access.", people: ["fullstack"] },
      { when: "Month 5", kind: "review", title: "Mobile app & AI assistant", body: "Attendance, company feed and an assistant reviewed by people.", people: ["mobile", "qa-lead"] },
      { when: "Month 6", kind: "launch", title: "Live", body: "Live at crm.outscalers.com, with the mobile app.", people: ["pm", "fullstack", "mobile", "qa-lead"] },
    ],
  },
};
