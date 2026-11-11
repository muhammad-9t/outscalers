/**
 * Team members on the About page: the shape, the limits and the clean-up applied to anything the admin saves.
 * Shared by the server (store, actions) and the client (editor), so it has no server-only imports.
 */

export const TEAM_TONES = ["brand", "human", "data", "amber"] as const;
export type TeamTone = (typeof TEAM_TONES)[number];

export type TeamMember = {
  /** Stable id (never shown) */
  id: string;
  name: string;
  role: string;
  location: string;
  bio: string;
  skills: string[];
  email: string;
  /** Avatar tile colour when there is no photo */
  tone: TeamTone;
  /** Uploaded photo, served from /team-photos/<file>.webp */
  photo?: string;
};

export const TEAM_LIMITS = {
  members: 60,
  name: 60,
  role: 60,
  location: 60,
  bio: 220,
  skill: 30,
  skills: 6,
  email: 120,
  photoBytes: 6 * 1024 * 1024,
} as const;

export const PHOTO_URL = /^\/team-photos\/[a-z0-9-]{8,64}\.webp$/;

const text = (v: unknown, max: number) => (typeof v === "string" ? v.replace(/\s+/g, " ").trim().slice(0, max) : "");

/** Turns whatever came in (JSON from the editor or the data file) into a clean list of members. */
export function sanitizeTeam(input: unknown): TeamMember[] {
  if (!Array.isArray(input)) return [];
  const seen = new Set<string>();
  const out: TeamMember[] = [];
  for (const raw of input.slice(0, TEAM_LIMITS.members)) {
    if (!raw || typeof raw !== "object") continue;
    const r = raw as Record<string, unknown>;
    let id = text(r.id, 40).replace(/[^a-zA-Z0-9-]/g, "");
    if (!id || seen.has(id)) id = `m-${Math.random().toString(36).slice(2, 10)}`;
    seen.add(id);
    const name = text(r.name, TEAM_LIMITS.name);
    if (!name) continue;
    const skillsIn = Array.isArray(r.skills) ? r.skills : typeof r.skills === "string" ? r.skills.split(",") : [];
    const email = text(r.email, TEAM_LIMITS.email);
    const photo = typeof r.photo === "string" && PHOTO_URL.test(r.photo) ? r.photo : undefined;
    out.push({
      id,
      name,
      role: text(r.role, TEAM_LIMITS.role),
      location: text(r.location, TEAM_LIMITS.location),
      bio: text(r.bio, TEAM_LIMITS.bio),
      skills: skillsIn.map((s) => text(s, TEAM_LIMITS.skill)).filter(Boolean).slice(0, TEAM_LIMITS.skills),
      email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : "",
      tone: TEAM_TONES.includes(r.tone as TeamTone) ? (r.tone as TeamTone) : "brand",
      ...(photo ? { photo } : {}),
    });
  }
  return out;
}
