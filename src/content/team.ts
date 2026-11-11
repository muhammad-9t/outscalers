import type { TeamMember } from "@/lib/team";

/**
 * Starting team, used until someone saves the team in the admin screen (/admin/team).
 * After the first save, the live list comes from data/team.json on the server.
 * PLACEHOLDERS: names, roles, photos, skills and contact details still need to come from Outscalers.
 */
export const defaultTeam: TeamMember[] = [
  {
    id: "founder",
    name: "Team member",
    role: "Founder & CEO",
    location: "Rawalpindi, PK",
    bio: "Connects strong engineering talent with companies that need dependable software.",
    skills: ["Strategy", "Delivery", "Partnerships"],
    email: "contact@outscalers.com",
    tone: "brand",
  },
  {
    id: "eng-lead",
    name: "Team member",
    role: "Engineering Lead",
    location: "Mannheim, DE",
    bio: "Owns architecture and code review, and decides where AI helps and where it doesn't.",
    skills: ["Architecture", "Code review", "Cloud"],
    email: "contact@outscalers.com",
    tone: "human",
  },
  {
    id: "design-lead",
    name: "Team member",
    role: "Lead Designer",
    location: "Remote",
    bio: "Turns requirements into clear, friendly interfaces for web and mobile.",
    skills: ["UI/UX", "Design systems", "Prototyping"],
    email: "contact@outscalers.com",
    tone: "amber",
  },
  {
    id: "qa-lead",
    name: "Team member",
    role: "QA Lead",
    location: "Rawalpindi, PK",
    bio: "Makes sure nothing ships until the tests pass and a person signs it off.",
    skills: ["Test automation", "Release checks", "Security"],
    email: "contact@outscalers.com",
    tone: "data",
  },
];
