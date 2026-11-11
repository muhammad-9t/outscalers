import { promises as fs } from "node:fs";
import path from "node:path";
import { photoDir } from "@/lib/team-store";

/** Serves uploaded team photos from the data folder (files added after the build aren't in /public). */
export async function GET(_req: Request, ctx: { params: Promise<{ file: string }> }) {
  const { file } = await ctx.params;
  if (!/^[a-z0-9-]{8,64}\.webp$/.test(file)) return new Response("Not found", { status: 404 });
  try {
    const body = await fs.readFile(path.join(photoDir(), file));
    return new Response(new Uint8Array(body), {
      headers: {
        "Content-Type": "image/webp",
        // Every upload gets a new file name, so the file itself never changes
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
