/** The shape of a team entry (the list itself lives in src/content/team.ts). */

export type TeamTone = "brand" | "human" | "data" | "amber";

/** Icon keys; the matching Lucide icons are mapped in src/components/about/team-badges.tsx */
export type TeamIcon =
  | "compass"
  | "cpu"
  | "route"
  | "sparkles"
  | "layers"
  | "smartphone"
  | "brain"
  | "cloud"
  | "shield"
  | "lock"
  | "palette"
  | "kanban";

/**
 * A role on the team. Shown by role only (no personal names, photos or contact details).
 * `leadership` roles hang as badges on the About page; `team` roles are the specialist teams grid.
 */
export type TeamMember = {
  /** Stable id (never shown), also used by the product stories */
  id: string;
  group: "leadership" | "team";
  role: string;
  /** One short line about what this role owns */
  bio: string;
  icon: TeamIcon;
  tone: TeamTone;
};
