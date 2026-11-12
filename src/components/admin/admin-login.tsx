"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { LockKeyhole } from "lucide-react";
import { login } from "@/app/admin/team/actions";

export function AdminLogin() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [pending, start] = useTransition();

  return (
    <form
      className="card mx-auto max-w-sm p-7"
      onSubmit={(e) => {
        e.preventDefault();
        setError("");
        start(async () => {
          const r = await login(password);
          if (r.ok) router.refresh();
          else setError(r.error);
        });
      }}
    >
      <span className="grid size-11 place-items-center rounded-xl border border-line-strong text-brand-300">
        <LockKeyhole aria-hidden className="size-5" />
      </span>
      <h1 className="mt-5 text-xl font-semibold">Team editor</h1>
      <p className="mt-1 text-[0.9375rem] text-fg-muted">For the Outscalers team only.</p>
      <label className="mt-6 block text-sm font-medium" htmlFor="admin-pw">
        Password
      </label>
      <input
        id="admin-pw"
        type="password"
        autoComplete="current-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        aria-invalid={Boolean(error)}
        className="mt-2 block w-full rounded-xl border border-line-strong bg-ink-900 px-4 py-3 text-[0.9375rem] text-fg focus:border-brand-400 focus:outline-none aria-[invalid=true]:border-danger"
        required
        autoFocus
      />
      {error && (
        <p role="alert" className="mt-2 text-sm text-danger">
          {error}
        </p>
      )}
      <button type="submit" disabled={pending} className="btn btn-primary mt-6 w-full justify-center">
        {pending ? "Checking…" : "Log in"}
      </button>
    </form>
  );
}
