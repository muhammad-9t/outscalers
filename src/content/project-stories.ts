/**
 * The project story on each case study: a horizontally scrolling timeline of how the project went.
 * `people` are team member ids from the team editor (/admin/team), so names, roles and photos stay in sync;
 * unknown ids are skipped.
 * PLACEHOLDER: all dates, numbers and people below are samples until Outscalers sends the real history.
 * While `sample` is true the section is labelled "Sample timeline".
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
  sample: boolean;
  summary: string;
  milestones: Milestone[];
};

export const projectStories: Record<string, ProjectStory> = {
  "nizamio-cloud-erp": {
    line: "wave",
    sample: true,
    summary: "From a first workshop to five modules, a dashboard and a mobile app in production.",
    milestones: [
      { when: "Week 1", kind: "kickoff", title: "Kickoff & discovery", body: "Mapped how sales, stock, finance and staff were really run across branches.", stat: { value: "5", label: "modules scoped" }, people: ["founder", "eng-lead"] },
      { when: "Week 3", kind: "design", title: "Design signed off", body: "Dashboard, mobile flows and the landing page approved by the client.", stat: { value: "42", label: "screens designed" }, people: ["design-lead"] },
      { when: "Week 4", kind: "commit", title: "First commit", body: "One shared data model for HRM, CRM, POS, inventory and accounting.", stat: { value: "1", label: "data model" }, people: ["eng-lead"] },
      { when: "Week 9", kind: "review", title: "Code pushed & reviewed", body: "Every change reviewed by an engineer before it merged.", stat: { value: "1,248", label: "commits" }, people: ["eng-lead", "qa-lead"] },
      { when: "Week 12", kind: "deadline", title: "Beta deadline met", body: "Multi-branch beta delivered on the agreed date.", stat: { value: "0", label: "days late" }, people: ["founder", "qa-lead"] },
      { when: "Week 14", kind: "launch", title: "Live in production", body: "Web dashboard and mobile app released, with monitoring on.", stat: { value: "v1.0", label: "shipped" }, people: ["founder", "eng-lead", "design-lead", "qa-lead"] },
    ],
  },
  "go-raahi-tours": {
    line: "zigzag",
    sample: true,
    summary: "A booking platform for local car-rental and tour companies, from idea to launch.",
    milestones: [
      { when: "Week 1", kind: "kickoff", title: "Kickoff", body: "Agreed the traveller and company journeys, and what “trusted” means.", stat: { value: "2", label: "user types" }, people: ["founder", "design-lead"] },
      { when: "Week 2", kind: "design", title: "Flows approved", body: "Explore, companies, bookings and messages designed and signed off.", stat: { value: "28", label: "screens" }, people: ["design-lead"] },
      { when: "Week 5", kind: "commit", title: "Bookings working", body: "First end-to-end booking from search to confirmation.", stat: { value: "1st", label: "booking" }, people: ["eng-lead"] },
      { when: "Week 8", kind: "review", title: "Messaging & notifications", body: "Travellers and companies talk in the app; every change reviewed.", stat: { value: "640", label: "commits" }, people: ["eng-lead", "qa-lead"] },
      { when: "Week 10", kind: "deadline", title: "Season deadline met", body: "Ready before the travel season, as promised.", stat: { value: "On", label: "time" }, people: ["founder"] },
      { when: "Week 11", kind: "launch", title: "Launched", body: "Live with the first local companies and their listings.", stat: { value: "v1.0", label: "live" }, people: ["founder", "eng-lead", "design-lead", "qa-lead"] },
    ],
  },
  yallasplit: {
    line: "loops",
    sample: true,
    summary: "An expense-splitting app for iOS and Android, with income and budgets built in.",
    milestones: [
      { when: "Week 1", kind: "kickoff", title: "Kickoff", body: "Groups, splits and settle-up: the core loop agreed first.", stat: { value: "3", label: "core flows" }, people: ["founder", "eng-lead"] },
      { when: "Week 3", kind: "design", title: "App design approved", body: "Light and dark themes, groups, expenses and settlements.", stat: { value: "36", label: "screens" }, people: ["design-lead"] },
      { when: "Week 5", kind: "commit", title: "Multi-currency in", body: "Expenses in any currency with automatic conversion.", stat: { value: "50+", label: "currencies" }, people: ["eng-lead"] },
      { when: "Week 8", kind: "review", title: "Smart settlements", body: "Fewer payments between friends; reviewed and tested by people.", stat: { value: "212", label: "tests passing" }, people: ["eng-lead", "qa-lead"] },
      { when: "Week 11", kind: "deadline", title: "Store deadline met", body: "Submitted to the App Store and Google Play on the agreed date.", stat: { value: "2", label: "stores" }, people: ["qa-lead", "founder"] },
      { when: "Week 12", kind: "release", title: "Released", body: "Live for iOS and Android, with the landing page.", stat: { value: "v1.0", label: "released" }, people: ["founder", "eng-lead", "design-lead", "qa-lead"] },
    ],
  },
  zakatly: {
    line: "wave",
    sample: true,
    summary: "An Islamic charity app for Android, from the Zakat rules to Google Play.",
    milestones: [
      { when: "Week 1", kind: "kickoff", title: "Kickoff", body: "Agreed the Zakat rules, the giving types and what people need to track.", stat: { value: "2", label: "giving types" }, people: ["founder", "eng-lead"] },
      { when: "Week 2", kind: "design", title: "Design approved", body: "A calm green and gold theme for contributions, the calculator and reports.", stat: { value: "24", label: "screens" }, people: ["design-lead"] },
      { when: "Week 4", kind: "commit", title: "Contributions working", body: "Add a contribution with beneficiary, project, cycle and payment method.", stat: { value: "1st", label: "contribution" }, people: ["eng-lead"] },
      { when: "Week 6", kind: "review", title: "Calculator & reports", body: "Zakat due and charity distribution checked against the rules; every change reviewed.", stat: { value: "180", label: "tests passing" }, people: ["eng-lead", "qa-lead"] },
      { when: "Week 8", kind: "deadline", title: "Ready before Ramadan", body: "Submitted to Google Play on the agreed date.", stat: { value: "On", label: "time" }, people: ["qa-lead", "founder"] },
      { when: "Week 9", kind: "release", title: "Released", body: "Live on Google Play.", stat: { value: "v1.0", label: "released" }, people: ["founder", "eng-lead", "design-lead", "qa-lead"] },
    ],
  },
  hisoq: {
    line: "zigzag",
    sample: true,
    summary: "A multi-tenant restaurant platform, from the first service walk-through to live branches.",
    milestones: [
      { when: "Week 1", kind: "kickoff", title: "Kickoff", body: "Followed a service from guest order to close-out to see where data got lost.", stat: { value: "6", label: "modules scoped" }, people: ["founder", "eng-lead"] },
      { when: "Week 3", kind: "design", title: "Design approved", body: "Dashboard, POS, kitchen display and menu screens signed off.", stat: { value: "48", label: "screens" }, people: ["design-lead"] },
      { when: "Week 5", kind: "commit", title: "Multi-tenant core", body: "Brands, branches, roles and permissions on one shared data model.", stat: { value: "1", label: "data model" }, people: ["eng-lead"] },
      { when: "Week 9", kind: "review", title: "POS & kitchen live sync", body: "Orders flow from the POS to the kitchen display in real time; every change reviewed.", stat: { value: "960", label: "commits" }, people: ["eng-lead", "qa-lead"] },
      { when: "Week 12", kind: "deadline", title: "Pilot deadline met", body: "First restaurants onboarded on the agreed date.", stat: { value: "0", label: "days late" }, people: ["founder", "qa-lead"] },
      { when: "Week 13", kind: "launch", title: "Launched", body: "Live at hisoq.com with self-serve sign-up.", stat: { value: "v1.0", label: "live" }, people: ["founder", "eng-lead", "design-lead", "qa-lead"] },
    ],
  },
  "outscalers-hub": {
    line: "loops",
    sample: true,
    summary: "Our own CRM: built for our team first, then opened to other businesses.",
    milestones: [
      { when: "Week 1", kind: "kickoff", title: "Kickoff", body: "Listed every spreadsheet and tool our own team used to run HR, finance and clients.", stat: { value: "10", label: "modules scoped" }, people: ["founder", "eng-lead"] },
      { when: "Week 3", kind: "design", title: "Design approved", body: "Web modules, the Knowledge Vault and the mobile app designed together.", stat: { value: "60", label: "screens" }, people: ["design-lead"] },
      { when: "Week 5", kind: "commit", title: "Roles & permissions", body: "Role-based access and the audit trail built first, so every module is secure from day one.", stat: { value: "1", label: "access model" }, people: ["eng-lead"] },
      { when: "Week 10", kind: "review", title: "AI assistant", body: "Answers leave and policy questions from real data; every answer path reviewed by people.", stat: { value: "1,050", label: "commits" }, people: ["eng-lead", "qa-lead"] },
      { when: "Week 13", kind: "deadline", title: "Team moved over", body: "The whole Outscalers team switched to the Hub on the agreed date.", stat: { value: "0", label: "days late" }, people: ["founder", "qa-lead"] },
      { when: "Week 14", kind: "launch", title: "Launched", body: "Live at crm.outscalers.com, with the mobile app.", stat: { value: "v1.0", label: "live" }, people: ["founder", "eng-lead", "design-lead", "qa-lead"] },
    ],
  },
};
