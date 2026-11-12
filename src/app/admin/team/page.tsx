import type { Metadata } from "next";
import { Suspense } from "react";
import { connection } from "next/server";
import { adminConfigured, isAdmin } from "@/lib/admin-auth";
import { readTeamFile } from "@/lib/team-store";
import { TeamEditor } from "@/components/admin/team-editor";
import { AdminLogin } from "@/components/admin/admin-login";

// Private page: not linked anywhere, not indexed, not in the sitemap.
export const metadata: Metadata = {
  title: "Team editor",
  robots: { index: false, follow: false, nocache: true },
};

export default function TeamAdminPage() {
  return (
    <section className="min-h-svh bg-ink-950 pt-28 pb-20">
      <div className="container-site">
        <Suspense fallback={<p className="text-fg-muted">Loading…</p>}>
          <Gate />
        </Suspense>
      </div>
    </section>
  );
}

async function Gate() {
  // Always decided per request (never prerendered at build time, when the password may not be set)
  await connection();
  if (!adminConfigured()) {
    return (
      <div className="card mx-auto max-w-md p-7">
        <h1 className="text-xl font-semibold">Team editor is switched off</h1>
        <p className="mt-2 text-[0.9375rem] text-fg-muted">
          Set <code className="font-mono text-brand-300">ADMIN_PASSWORD</code> in the server&apos;s environment and restart the
          site to use it.
        </p>
      </div>
    );
  }
  if (!(await isAdmin())) return <AdminLogin />;
  return <TeamEditor initial={await readTeamFile()} />;
}
