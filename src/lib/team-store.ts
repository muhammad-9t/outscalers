import { promises as fs } from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { cacheLife, cacheTag } from "next/cache";
import sharp from "sharp";
import { defaultTeam } from "@/content/team";
import { sanitizeTeam, type TeamMember } from "@/lib/team";

/*
 * Server-side team storage. The list lives in DATA_DIR/team.json and photos in DATA_DIR/team-photos/.
 * DATA_DIR defaults to ./data in the app folder (gitignored, so deploys keep it). On the server the
 * site's user (www-data) must be able to write there.
 */

export const TEAM_TAG = "team";
const dataDir = () => process.env.DATA_DIR || path.join(process.cwd(), "data");
const teamFile = () => path.join(dataDir(), "team.json");
export const photoDir = () => path.join(dataDir(), "team-photos");

/** Reads the saved team straight from disk (for the admin screen). Falls back to the starting team. */
export async function readTeamFile(): Promise<TeamMember[]> {
  try {
    const team = sanitizeTeam(JSON.parse(await fs.readFile(teamFile(), "utf8")));
    return team;
  } catch {
    return defaultTeam;
  }
}

/** The team for the public About page: cached, and refreshed the moment the admin saves. */
export async function getTeam(): Promise<TeamMember[]> {
  "use cache";
  cacheTag(TEAM_TAG);
  cacheLife("max");
  return readTeamFile();
}

/** Saves the team (written to a temp file first, so a crash never leaves half a file) and removes unused photos. */
export async function writeTeam(team: TeamMember[]) {
  await fs.mkdir(dataDir(), { recursive: true });
  const tmp = `${teamFile()}.${process.pid}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(team, null, 2), "utf8");
  await fs.rename(tmp, teamFile());

  // Clean up photos no member uses any more
  const used = new Set(team.map((m) => m.photo?.split("/").pop()).filter(Boolean));
  try {
    for (const f of await fs.readdir(photoDir())) {
      if (f.endsWith(".webp") && !used.has(f)) await fs.unlink(path.join(photoDir(), f)).catch(() => {});
    }
  } catch {
    // No photo folder yet
  }
}

/** Re-encodes an uploaded image as a square 720px WebP (this also strips anything that isn't pixels). */
export async function savePhoto(input: Buffer): Promise<string> {
  await fs.mkdir(photoDir(), { recursive: true });
  const file = `${randomUUID()}.webp`;
  await sharp(input, { limitInputPixels: 40_000_000 })
    .rotate()
    .resize(720, 720, { fit: "cover", position: "attention" })
    .webp({ quality: 82 })
    .toFile(path.join(photoDir(), file));
  return `/team-photos/${file}`;
}
