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
};
