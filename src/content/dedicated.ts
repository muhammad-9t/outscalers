/**
 * Dedicated developers (staff augmentation) page: all copy in one place.
 * Terms confirmed by Outscalers (Nov 2026): start in 1–2 weeks, interview first, 1-month trial with
 * replacement, minimum 1 developer and 6-month contract, contract via the German or Italian company,
 * NDA/terms as the client requires, monthly billing in EUR/USD/GBP. Keep every claim true and provable
 * (no hard price comparisons: UWG §6).
 */

export const dedicated = {
  path: "/services/dedicated-developers",
  /** Opens the contact form with "Dedicated developers" preselected */
  contactHref: "/contact?need=dedicated#start-project",
  title: "Dedicated developers",
  metaDescription:
    "Hire dedicated developers who join your team in 1–2 weeks. Contracted through our German or Italian company, engineers from our 100+ in-house team. Interview first, 1-month trial.",
  tagline: "Engineers who join your team",

  hero: {
    eyebrow: "Dedicated developers",
    title: ["Your team, extended.", "Developers who start in 1–2 weeks."],
    lead: "In-house engineers who work as part of your team: your hours, your tools, your meetings. Contracted through our European company.",
    cta: "Tell us the role you need",
    proof: [
      { value: "100+", label: "in-house engineers" },
      { value: "1–2 weeks", label: "to start" },
      { value: "From 1", label: "developer" },
    ],
  },

  steps: [
    { title: "Tell us the role", body: "Stack, seniority and team size." },
    { title: "Interview your candidates", body: "You choose who joins." },
    { title: "Start in 1–2 weeks", body: "Under your NDA and contract terms." },
    { title: "1-month trial", body: "Not the right fit? We replace them, even in the first week." },
  ],

  model: {
    title: ["European contract.", "Pakistan team."],
    contract: {
      label: "Your contract",
      points: [
        "Signed with our company in Germany or Italy, under EU law",
        "Meetings at your office when needed",
        "Invoiced monthly in EUR, USD or GBP",
      ],
    },
    team: {
      label: "Your team",
      points: [
        "Engineers working from our office in Pakistan",
        "They follow your hours, rules, meetings and processes",
        "Overseen by our project managers and CTO",
      ],
    },
    note: "No recruiting, payroll, insurance or local employment overhead. A fraction of local hiring costs.",
    aside: "European developers are also available on request.",
  },

  reasons: [
    { icon: "interview", title: "Interview before you hire", body: "You meet every candidate and decide." },
    { icon: "swap", title: "Replacement guarantee", body: "A free swap during the first month." },
    { icon: "brand", title: "White-label", body: "They work as your team, under your brand." },
    { icon: "terms", title: "Your terms", body: "NDA, IP and contract terms as your company requires." },
    { icon: "ai", title: "AI-accelerated", body: "Modern AI tooling, every change reviewed." },
    { icon: "oversight", title: "Quality oversight", body: "Our PMs and CTO monitor delivery, so you always have a backup." },
  ],

  /** "Your first month": six full-screen stages (confirmed: weekly PM check-in, 1-month notice, we provide the laptop) */
  journey: [
    {
      id: "onboarding",
      when: "Day 1",
      title: "Onboarding",
      summary: "Your developer is set up and ready on the first day.",
      you: "Give access to Slack, Jira and GitHub, and introduce your team lead.",
      we: "NDA signed, laptop provided, developer ready to start.",
    },
    {
      id: "first-tasks",
      when: "Week 1",
      title: "First tasks",
      summary: "Small tickets first, to learn your codebase and conventions.",
      you: "Assign the first tickets and review the first pull requests.",
      we: "Your developer learns how your team builds and ships.",
    },
    {
      id: "rhythm",
      when: "Every day",
      title: "Your rhythm",
      summary: "They work like the rest of your team.",
      you: "Run stand-ups and planning as usual.",
      we: "Your hours, your meetings, your tools.",
    },
    {
      id: "check-in",
      when: "Every week",
      title: "Quality check",
      summary: "We stay involved, so you always have a backup.",
      you: "Share feedback any time.",
      we: "Our PM checks in with you weekly; our CTO oversees quality.",
    },
    {
      id: "trial",
      when: "Month 1",
      title: "Trial review",
      summary: "One month to be sure it's the right fit.",
      you: "Decide: continue, adjust or replace.",
      we: "A free replacement if it's not the right fit.",
    },
    {
      id: "long-term",
      when: "After that",
      title: "Long-term",
      summary: "The same developer, building with you month after month.",
      you: "Add developers any time; after the 6-month minimum, scale down with one month's notice.",
      we: "Monthly invoice and continuity on your project.",
    },
  ],

  roles: [
    "React / Next.js",
    "Node.js",
    "Python",
    "Flutter",
    "React Native",
    "iOS / Android",
    "AI & ML",
    "DevOps / AWS",
    "QA automation",
    "UI/UX design",
    "Project managers",
  ],
  rolesNote: "From 1 developer to teams of 15.",

  faq: [
    { q: "What is the minimum engagement?", a: "One developer, with a 6-month minimum contract." },
    { q: "Who do we sign with?", a: "Our company in Germany or Italy, under EU law, with the NDA and terms your company requires." },
    { q: "Whose working hours do they follow?", a: "Yours. They follow your schedule, meetings and processes, like the rest of your team." },
    { q: "How is it billed?", a: "Monthly, per developer, in your currency: EUR, USD or GBP." },
  ],
} as const;

export type DedicatedIcon = (typeof dedicated.reasons)[number]["icon"];
