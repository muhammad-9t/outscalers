import type { TeamMember } from "@/lib/team";

/**
 * The team shown on the About page and in the product stories, by role only.
 * Keep the ids: the product stories (src/content/project-stories.ts) refer to them.
 */

/** Real numbers only. Shown in the About page team section. */
export const teamStats = [
  { value: "100+", label: "In-house engineers" },
  { value: "4–15", label: "Engineers per client team" },
] as const;

export const team: TeamMember[] = [
  // Leadership
  {
    id: "founder",
    group: "leadership",
    role: "Founder & CEO",
    bio: "Sets the direction and stays close to every client partnership.",
    icon: "compass",
    tone: "brand",
  },
  {
    id: "eng-lead",
    group: "leadership",
    role: "CTO / Head of Engineering",
    bio: "Owns architecture, engineering standards and code review.",
    icon: "cpu",
    tone: "human",
  },
  {
    id: "delivery-lead",
    group: "leadership",
    role: "Head of Delivery",
    bio: "Makes sure every team ships on time and communicates clearly.",
    icon: "route",
    tone: "amber",
  },
  {
    id: "ai-lead",
    group: "leadership",
    role: "AI Lead",
    bio: "Decides where AI helps, where it doesn't, and how its work is reviewed.",
    icon: "sparkles",
    tone: "data",
  },

  // Specialist teams
  {
    id: "fullstack",
    group: "team",
    role: "Full-stack engineers",
    bio: "Web apps, APIs and SaaS platforms.",
    icon: "layers",
    tone: "brand",
  },
  {
    id: "mobile",
    group: "team",
    role: "Mobile engineers",
    bio: "iOS and Android apps with Flutter and React Native.",
    icon: "smartphone",
    tone: "human",
  },
  {
    id: "ai-ml",
    group: "team",
    role: "AI & ML engineers",
    bio: "Assistants, agents and document AI on your own data.",
    icon: "brain",
    tone: "data",
  },
  {
    id: "devops",
    group: "team",
    role: "DevOps & cloud",
    bio: "CI/CD, infrastructure and monitoring.",
    icon: "cloud",
    tone: "human",
  },
  {
    id: "qa-lead",
    group: "team",
    role: "QA & test automation",
    bio: "Automated and manual testing before anything ships.",
    icon: "shield",
    tone: "amber",
  },
  {
    id: "cyber-security",
    group: "team",
    role: "Cyber security",
    bio: "Security reviews, threat modelling and hardening.",
    icon: "lock",
    tone: "human",
  },
  {
    id: "design-lead",
    group: "team",
    role: "UI/UX design",
    bio: "Interfaces and prototypes tested with real users.",
    icon: "palette",
    tone: "brand",
  },
  {
    id: "pm",
    group: "team",
    role: "Project & delivery managers",
    bio: "Your single point of contact, with demos every two weeks.",
    icon: "kanban",
    tone: "data",
  },
];
