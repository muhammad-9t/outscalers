/**
 * Typical engagement timeline, shown in the "Speed to launch" section.
 * Ranges carried over from the previous outscalers process; adjust here.
 */
export type TimelinePhase = {
  id: string;
  title: string;
  duration: string;
  detail: string;
  /** Position on the illustrative chart, in weeks. `end: null` means ongoing. */
  start: number;
  end: number | null;
  tone: "human" | "ai" | "neutral";
};

export const timelinePhases: TimelinePhase[] = [
  {
    id: "discovery",
    title: "Discovery & plan",
    duration: "1–2 weeks",
    detail: "Requirements, architecture, timeline and risks agreed with you.",
    start: 0,
    end: 2,
    tone: "human",
  },
  {
    id: "build",
    title: "Build & test",
    duration: "4–12 weeks",
    detail: "AI-assisted development in two-week sprints, with a working demo at the end of each.",
    start: 2,
    end: 12,
    tone: "ai",
  },
  {
    id: "launch",
    title: "Launch",
    duration: "1–2 weeks",
    detail: "Production deployment, monitoring, documentation and handover.",
    start: 12,
    end: 14,
    tone: "neutral",
  },
  {
    id: "support",
    title: "Support & improve",
    duration: "Ongoing",
    detail: "Updates, performance reports and new features as you grow.",
    start: 14,
    end: null,
    tone: "neutral",
  },
];

/** Sprint demos during the build phase (week numbers on the chart). */
export const sprintDemos = [4, 6, 8, 10, 12];

/** Human review gates between phases (week numbers on the chart). */
export const reviewGates = [2, 12, 14];

export const speedFactors = [
  {
    title: "AI handles the groundwork",
    body: "AI drafts scaffolding, boilerplate and routine code, so engineers get to the real problem sooner — and review everything it produces.",
  },
  {
    title: "Proven architecture patterns",
    body: "We start from patterns we know work, instead of reinventing authentication, deployment or data models.",
  },
  {
    title: "Testing from day one",
    body: "Automated tests and CI run on every change, so problems surface early instead of at launch.",
  },
  {
    title: "Demos every two weeks",
    body: "You see working software every sprint, so feedback arrives while it's still cheap to act on.",
  },
];
