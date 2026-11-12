"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowDown, ArrowUp, ExternalLink, ImagePlus, LogOut, Plus, Save, Trash2, X } from "lucide-react";
import { logout, saveTeam, uploadPhoto } from "@/app/admin/team/actions";
import { TEAM_LIMITS, TEAM_TONES, type TeamMember } from "@/lib/team";
import { MemberAvatar } from "@/components/about/team-badges";
import { cn } from "@/lib/cn";

const input =
  "mt-1.5 block w-full rounded-lg border border-line-strong bg-ink-900 px-3 py-2 text-[0.9375rem] text-fg placeholder:text-fg-subtle focus:border-brand-400 focus:outline-none";
const label = "block text-xs font-medium text-fg-muted";

const blank = (): TeamMember => ({
  id: `m-${Math.random().toString(36).slice(2, 10)}`,
  name: "",
  role: "",
  location: "",
  bio: "",
  skills: [],
  email: "",
  tone: "brand",
});

/** The private team editor: add, edit, reorder and remove members, upload photos, then save. */
export function TeamEditor({ initial }: { initial: TeamMember[] }) {
  const router = useRouter();
  const [team, setTeam] = useState<TeamMember[]>(initial);
  const [saved, setSaved] = useState(JSON.stringify(initial));
  const [status, setStatus] = useState<{ tone: "ok" | "error"; text: string } | null>(null);
  const [saving, startSave] = useTransition();
  const dirty = JSON.stringify(team) !== saved;

  // Warn before leaving with unsaved changes
  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const update = (id: string, patch: Partial<TeamMember>) => setTeam((t) => t.map((m) => (m.id === id ? { ...m, ...patch } : m)));
  const move = (i: number, by: number) =>
    setTeam((t) => {
      const j = i + by;
      if (j < 0 || j >= t.length) return t;
      const next = [...t];
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });

  const save = () =>
    startSave(async () => {
      setStatus(null);
      const missing = team.filter((m) => !m.name.trim()).length;
      const r = await saveTeam(team);
      if (!r.ok) return setStatus({ tone: "error", text: r.error });
      const clean = r.data ?? [];
      setTeam(clean);
      setSaved(JSON.stringify(clean));
      setStatus({
        tone: "ok",
        text: `Saved ${clean.length} member${clean.length === 1 ? "" : "s"}. The About page is updated.${missing ? ` ${missing} without a name ${missing === 1 ? "was" : "were"} left out.` : ""}`,
      });
    });

  return (
    <div>
      {/* Toolbar */}
      <div className="sticky top-20 z-20 -mx-3 mb-8 flex flex-wrap items-center gap-3 rounded-2xl border border-line bg-ink-900/90 px-4 py-3 backdrop-blur-md">
        <div className="mr-auto">
          <h1 className="text-lg font-semibold">Team editor</h1>
          <p className="text-sm text-fg-muted">
            {team.length} member{team.length === 1 ? "" : "s"} · shown in this order on the About page
            {dirty && <span className="ml-2 text-brand-300">· unsaved changes</span>}
          </p>
        </div>
        <Link href="/about#team-title" className="btn btn-secondary btn-sm" target="_blank">
          <ExternalLink aria-hidden className="size-4" /> View About page
        </Link>
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          disabled={team.length >= TEAM_LIMITS.members}
          onClick={() => setTeam((t) => [...t, blank()])}
        >
          <Plus aria-hidden className="size-4" /> Add member
        </button>
        <button type="button" className="btn btn-primary btn-sm" disabled={!dirty || saving} onClick={save}>
          <Save aria-hidden className="size-4" /> {saving ? "Saving…" : "Save changes"}
        </button>
        <button
          type="button"
          className="grid size-9 place-items-center rounded-lg border border-line-strong text-fg-muted hover:text-fg"
          onClick={async () => {
            await logout();
            router.refresh();
          }}
        >
          <span className="sr-only">Log out</span>
          <LogOut aria-hidden className="size-4" />
        </button>
      </div>

      {status && (
        <p role="status" className={cn("mb-6 rounded-xl border px-4 py-3 text-sm", status.tone === "ok" ? "border-brand-400/40 text-fg" : "border-danger/50 text-danger")}>
          {status.text}
        </p>
      )}

      <ol className="grid gap-5 lg:grid-cols-2">
        {team.map((m, i) => (
          <li key={m.id} className="card p-5">
            <div className="flex gap-4">
              <PhotoField member={m} onChange={(photo) => update(m.id, { photo })} onError={(text) => setStatus({ tone: "error", text })} />
              <div className="grid min-w-0 flex-1 grid-cols-2 gap-3">
                <div className="col-span-2 sm:col-span-1">
                  <label className={label}>
                    Name *
                    <input className={input} value={m.name} maxLength={TEAM_LIMITS.name} onChange={(e) => update(m.id, { name: e.target.value })} />
                  </label>
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className={label}>
                    Role
                    <input className={input} value={m.role} maxLength={TEAM_LIMITS.role} onChange={(e) => update(m.id, { role: e.target.value })} />
                  </label>
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className={label}>
                    Location
                    <input className={input} value={m.location} maxLength={TEAM_LIMITS.location} onChange={(e) => update(m.id, { location: e.target.value })} />
                  </label>
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className={label}>
                    Card colour (no photo)
                    <select className={input} value={m.tone} onChange={(e) => update(m.id, { tone: e.target.value as TeamMember["tone"] })}>
                      {TEAM_TONES.map((t) => (
                        <option key={t} value={t}>
                          {{ brand: "Orange", human: "Blue", data: "Violet", amber: "Amber" }[t]}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
              </div>
            </div>
            <div className="mt-3 grid gap-3">
              <label className={label}>
                Short bio <span className="text-fg-subtle">({m.bio.length}/{TEAM_LIMITS.bio})</span>
                <textarea className={cn(input, "min-h-18 resize-y")} value={m.bio} maxLength={TEAM_LIMITS.bio} onChange={(e) => update(m.id, { bio: e.target.value })} />
              </label>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className={label}>
                  Skills <span className="text-fg-subtle">(comma separated, up to {TEAM_LIMITS.skills})</span>
                  <input
                    className={input}
                    defaultValue={m.skills.join(", ")}
                    onBlur={(e) => update(m.id, { skills: e.target.value.split(",").map((s) => s.trim()).filter(Boolean).slice(0, TEAM_LIMITS.skills) })}
                  />
                </label>
                <label className={label}>
                  Contact email
                  <input type="email" className={input} value={m.email} maxLength={TEAM_LIMITS.email} onChange={(e) => update(m.id, { email: e.target.value })} />
                </label>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2 border-t border-line pt-3">
              <span className="mr-auto font-mono text-xs text-fg-subtle">#{String(i + 1).padStart(2, "0")}</span>
              <IconButton label="Move up" disabled={i === 0} onClick={() => move(i, -1)}>
                <ArrowUp aria-hidden className="size-4" />
              </IconButton>
              <IconButton label="Move down" disabled={i === team.length - 1} onClick={() => move(i, 1)}>
                <ArrowDown aria-hidden className="size-4" />
              </IconButton>
              <IconButton
                label="Remove member"
                danger
                onClick={() => {
                  if (confirm(`Remove ${m.name || "this member"}?`)) setTeam((t) => t.filter((x) => x.id !== m.id));
                }}
              >
                <Trash2 aria-hidden className="size-4" />
              </IconButton>
            </div>
          </li>
        ))}
      </ol>
      {team.length === 0 && <p className="text-fg-muted">No members yet. Use “Add member” to start.</p>}
    </div>
  );
}

function IconButton({ label: l, danger, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { label: string; danger?: boolean }) {
  return (
    <button
      type="button"
      title={l}
      className={cn(
        "grid size-8 place-items-center rounded-lg border border-line-strong text-fg-muted transition-colors hover:text-fg disabled:opacity-30",
        danger && "hover:border-danger/60 hover:text-danger",
      )}
      {...props}
    >
      <span className="sr-only">{l}</span>
      {props.children}
    </button>
  );
}

function PhotoField({ member, onChange, onError }: { member: TeamMember; onChange: (photo?: string) => void; onError: (t: string) => void }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  return (
    <div className="w-24 shrink-0">
      <MemberAvatar member={member} className="aspect-square w-24 rounded-xl" />
      <input
        ref={fileRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/avif"
        className="sr-only"
        onChange={async (e) => {
          const file = e.target.files?.[0];
          e.target.value = "";
          if (!file) return;
          setBusy(true);
          const fd = new FormData();
          fd.set("photo", file);
          const r = await uploadPhoto(fd);
          setBusy(false);
          if (r.ok && r.data) onChange(r.data);
          else if (!r.ok) onError(r.error);
        }}
      />
      <div className="mt-2 flex gap-1">
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={busy}
          className="flex flex-1 items-center justify-center gap-1 rounded-lg border border-line-strong py-1 text-xs text-fg-muted hover:text-fg"
        >
          <ImagePlus aria-hidden className="size-3.5" /> {busy ? "…" : member.photo ? "Change" : "Photo"}
        </button>
        {member.photo && (
          <button type="button" onClick={() => onChange(undefined)} className="grid w-7 place-items-center rounded-lg border border-line-strong text-fg-muted hover:text-danger">
            <span className="sr-only">Remove photo</span>
            <X aria-hidden className="size-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
