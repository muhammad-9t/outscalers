"use server";

import { cookies } from "next/headers";
import { updateTag } from "next/cache";
import { checkPassword, createSessionValue, isAdmin, SESSION_COOKIE, UI_COOKIE } from "@/lib/admin-auth";
import { readTeamFile, savePhoto, TEAM_TAG, writeTeam } from "@/lib/team-store";
import { sanitizeTeam, TEAM_LIMITS, type TeamMember } from "@/lib/team";

type Result<T = undefined> = { ok: true; data?: T } | { ok: false; error: string };

const secure = process.env.NODE_ENV === "production";

export async function login(password: string): Promise<Result> {
  if (typeof password !== "string" || !checkPassword(password)) {
    // Slow down guessing
    await new Promise((r) => setTimeout(r, 800));
    return { ok: false, error: "Wrong password." };
  }
  const { value, maxAge } = createSessionValue();
  const jar = await cookies();
  jar.set(SESSION_COOKIE, value, { httpOnly: true, sameSite: "lax", secure, path: "/", maxAge });
  jar.set(UI_COOKIE, "1", { httpOnly: false, sameSite: "lax", secure, path: "/", maxAge });
  return { ok: true };
}

export async function logout(): Promise<Result> {
  const jar = await cookies();
  jar.delete(SESSION_COOKIE);
  jar.delete(UI_COOKIE);
  return { ok: true };
}

export async function loadTeam(): Promise<Result<TeamMember[]>> {
  if (!(await isAdmin())) return { ok: false, error: "Please log in again." };
  return { ok: true, data: await readTeamFile() };
}

export async function saveTeam(input: unknown): Promise<Result<TeamMember[]>> {
  if (!(await isAdmin())) return { ok: false, error: "Please log in again." };
  const team = sanitizeTeam(input);
  try {
    await writeTeam(team);
  } catch (e) {
    console.error("Saving the team failed", e);
    return { ok: false, error: "Could not save on the server (check that the data folder is writable)." };
  }
  updateTag(TEAM_TAG); // the About page shows the new team straight away
  return { ok: true, data: team };
}

export async function uploadPhoto(form: FormData): Promise<Result<string>> {
  if (!(await isAdmin())) return { ok: false, error: "Please log in again." };
  const file = form.get("photo");
  if (!(file instanceof File) || !file.size) return { ok: false, error: "No image selected." };
  if (file.size > TEAM_LIMITS.photoBytes) return { ok: false, error: "Image is larger than 6 MB." };
  if (!/^image\/(png|jpe?g|webp|avif|gif)$/.test(file.type)) return { ok: false, error: "Use a PNG, JPG, WebP or AVIF image." };
  try {
    const url = await savePhoto(Buffer.from(await file.arrayBuffer()));
    return { ok: true, data: url };
  } catch (e) {
    console.error("Photo upload failed", e);
    return { ok: false, error: "That image could not be read." };
  }
}
