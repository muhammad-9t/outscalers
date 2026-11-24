"use client";

import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { CheckCircle2, Loader2, Rocket, Send, UsersRound } from "lucide-react";
import { cn } from "@/lib/cn";
import {
  NEED_DEDICATED,
  NEED_PROJECT,
  devCounts,
  interests,
  locations,
  needParam,
  readContact,
  validateContact,
  type ContactErrors,
  type ContactField,
} from "@/lib/contact";
import { quickCheckParam, quickCheckSummary } from "@/content/quick-check";
import { SelectField } from "./select-field";

type Field = ContactField;
type Status = "idle" | "sending" | "sent" | "error" | "limited";

const inputClass =
  "mt-2 block w-full rounded-xl border border-line-strong bg-ink-900 px-4 py-3 text-[0.9375rem] text-fg placeholder:text-fg-subtle transition-colors focus:border-brand-400 focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-300 aria-[invalid=true]:border-danger";

/** Project enquiry form. Posts to /api/contact, which emails the team over SMTP. */
export function ContactForm({ email }: { email: string }) {
  const [errors, setErrors] = useState<ContactErrors>({});
  const [status, setStatus] = useState<Status>("idle");
  const [need, setNeed] = useState("");
  const formRef = useRef<HTMLFormElement>(null);
  // When the form appeared; the server ignores submissions made faster than a person could type them
  const shownAt = useRef(0);
  useEffect(() => {
    shownAt.current = performance.now();
  }, []);
  const id = useId();
  const fid = (f: Field) => `${id}-${f}`;

  // Arriving from the Services quick check: start the message with the visitor's answers.
  useEffect(() => {
    const summary = quickCheckSummary(new URLSearchParams(window.location.search).get(quickCheckParam));
    const message = formRef.current?.elements.namedItem("message");
    if (summary && message instanceof HTMLTextAreaElement && !message.value) message.value = summary;
  }, []);

  // Arriving with ?need=dedicated or ?need=project: preselect that card (the URL isn't known on the server)
  useEffect(() => {
    const preset = needParam[new URLSearchParams(window.location.search).get("need") ?? ""];
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (preset) setNeed(preset);
  }, []);

  function focusFirst(found: ContactErrors) {
    const firstInvalid = Object.keys(found)[0] as Field | undefined;
    if (firstInvalid) formRef.current?.querySelector<HTMLElement>(`#${CSS.escape(fid(firstInvalid))}`)?.focus();
    return Boolean(firstInvalid);
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === "sending") return;
    const form = e.currentTarget;
    const data = new FormData(form);
    const values = readContact((k) => data.get(k));
    const found = validateContact(values);
    setErrors(found);
    if (focusFirst(found)) return;

    setStatus("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
          website: String(data.get("website") ?? ""),
          elapsed: Math.round(performance.now() - shownAt.current),
        }),
      });
      if (res.status === 429) {
        setStatus("limited");
        return;
      }
      if (res.status === 422) {
        const { errors: serverErrors } = (await res.json()) as { errors: ContactErrors };
        setErrors(serverErrors);
        setStatus("idle");
        focusFirst(serverErrors);
        return;
      }
      if (!res.ok) throw new Error(String(res.status));
      form.reset();
      setNeed("");
      setStatus("sent");
    } catch {
      setStatus("error");
    }
  }

  const describedBy = (f: Field, hint?: string) =>
    [errors[f] ? `${fid(f)}-error` : null, hint ?? null].filter(Boolean).join(" ") || undefined;

  const errorText = (f: Field) =>
    errors[f] ? (
      <p id={`${fid(f)}-error`} className="mt-1.5 text-sm text-danger">
        {errors[f]}
      </p>
    ) : null;

  return (
    <form ref={formRef} noValidate onSubmit={onSubmit} className="flex flex-1 flex-col gap-5" aria-describedby={`${id}-note`} aria-busy={status === "sending"}>
      {/* Honeypot for bots; hidden from people and assistive tech. */}
      <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label>
          Website <input name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor={fid("firstName")} className="text-sm font-medium">
            First name <span aria-hidden className="text-brand-300">*</span>
          </label>
          <input
            id={fid("firstName")}
            name="firstName"
            autoComplete="given-name"
            required
            aria-invalid={Boolean(errors.firstName)}
            aria-describedby={describedBy("firstName")}
            className={inputClass}
          />
          {errorText("firstName")}
        </div>
        <div>
          <label htmlFor={fid("lastName")} className="text-sm font-medium">
            Last name <span aria-hidden className="text-brand-300">*</span>
          </label>
          <input
            id={fid("lastName")}
            name="lastName"
            autoComplete="family-name"
            required
            aria-invalid={Boolean(errors.lastName)}
            aria-describedby={describedBy("lastName")}
            className={inputClass}
          />
          {errorText("lastName")}
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor={fid("email")} className="text-sm font-medium">
            Work email <span aria-hidden className="text-brand-300">*</span>
          </label>
          <input
            id={fid("email")}
            name="email"
            type="email"
            autoComplete="email"
            required
            aria-invalid={Boolean(errors.email)}
            aria-describedby={describedBy("email")}
            className={inputClass}
          />
          {errorText("email")}
        </div>
        <div>
          <label htmlFor={fid("company")} className="text-sm font-medium">
            Company <span className="font-normal text-fg-subtle">(optional)</span>
          </label>
          <input id={fid("company")} name="company" autoComplete="organization" className={inputClass} />
        </div>
      </div>

      {/* What do you need? Two cards; each shows its own follow-up questions */}
      <fieldset>
        <legend className="text-sm font-medium">What do you need?</legend>
        <div className="mt-2 grid gap-3 sm:grid-cols-2">
          {[
            { value: NEED_DEDICATED, icon: UsersRound, hint: "Engineers who join my team" },
            { value: NEED_PROJECT, icon: Rocket, hint: "Build a product for me" },
          ].map((o) => (
            <label
              key={o.value}
              className="flex cursor-pointer items-center gap-3 rounded-xl border border-line-strong bg-ink-900 px-4 py-3.5 transition-colors hover:border-fg-subtle has-checked:border-brand-400 has-checked:bg-brand-500/10 has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-brand-300"
            >
              <input
                type="radio"
                name="need"
                value={o.value}
                checked={need === o.value}
                onChange={() => setNeed(o.value)}
                className="sr-only"
              />
              <o.icon aria-hidden className="size-5 shrink-0 text-brand-400" />
              <span>
                <span className="block font-semibold">{o.value}</span>
                <span className="block text-sm text-fg-muted">{o.hint}</span>
              </span>
            </label>
          ))}
        </div>
        {errorText("need")}
      </fieldset>

      {need === NEED_DEDICATED && (
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor={fid("devCount")} className="text-sm font-medium">
              How many developers?
            </label>
            <SelectField id={fid("devCount")} name="devCount" options={devCounts} placeholder="Select (optional)" className={inputClass} />
            {errorText("devCount")}
          </div>
          <div>
            <label htmlFor={fid("location")} className="text-sm font-medium">
              Team location
            </label>
            <SelectField id={fid("location")} name="location" options={locations} placeholder="Select (optional)" className={inputClass} />
            {errorText("location")}
          </div>
        </div>
      )}

      {need === NEED_PROJECT && (
        <div>
          <label htmlFor={fid("interest")} className="text-sm font-medium">
            What should we build?
          </label>
          <SelectField
            id={fid("interest")}
            name="interest"
            options={interests}
            placeholder="Select an area (optional)"
            className={inputClass}
          />
          {errorText("interest")}
        </div>
      )}

      {/* Grows to fill the card when the sidebar beside it is taller */}
      <div className="flex flex-1 flex-col">
        <label htmlFor={fid("message")} className="text-sm font-medium">
          {need === NEED_DEDICATED ? "Tell us about the role" : "Tell us about your project"}{" "}
          <span aria-hidden className="text-brand-300">*</span>
        </label>
        <textarea
          id={fid("message")}
          name="message"
          rows={6}
          required
          aria-invalid={Boolean(errors.message)}
          aria-describedby={describedBy("message", `${fid("message")}-hint`)}
          className={cn(inputClass, "flex-1 resize-y")}
        />
        <p id={`${fid("message")}-hint`} className="mt-1.5 text-sm text-fg-subtle">
          {need === NEED_DEDICATED
            ? "Which stack and seniority do you need, and when should they start?"
            : "What do you want to build, and what's in the way? Rough timelines help too."}
        </p>
        {errorText("message")}
      </div>

      <div className="flex flex-col gap-4 pt-2 sm:flex-row sm:items-center sm:justify-between">
        <p id={`${id}-note`} className="text-sm text-fg-subtle">
          Your message goes straight to our team at {email}. We only use your details to reply (see our{" "}
          <Link href="/privacy" className="underline underline-offset-2 hover:text-fg">
            privacy policy
          </Link>
          ).
        </p>
        <button type="submit" disabled={status === "sending"} className="btn btn-primary shrink-0 disabled:cursor-wait disabled:opacity-70">
          {status === "sending" ? (
            <>
              Sending <Loader2 aria-hidden className="size-4 animate-spin" />
            </>
          ) : (
            <>
              Send message <Send aria-hidden className="size-4" />
            </>
          )}
        </button>
      </div>

      <div role="status" aria-live="polite" className="empty:hidden">
        {status === "sent" && (
          <p className="flex items-start gap-2 rounded-xl border border-brand-400/40 bg-brand-500/10 px-4 py-3 text-sm text-brand-200">
            <CheckCircle2 aria-hidden className="mt-0.5 size-4 shrink-0" />
            Thanks! Your message is on its way. We&apos;ll reply within one business day.
          </p>
        )}
        {status === "limited" && (
          <p className="rounded-xl border border-danger/40 bg-danger/10 px-4 py-3 text-sm text-danger">
            You&apos;ve sent several messages in a short time. Please try again later, or email us directly at{" "}
            <a href={`mailto:${email}`} className="underline underline-offset-2">
              {email}
            </a>
            .
          </p>
        )}
        {status === "error" && (
          <p className="rounded-xl border border-danger/40 bg-danger/10 px-4 py-3 text-sm text-danger">
            Sorry, we couldn&apos;t send your message. Please try again, or email us directly at{" "}
            <a href={`mailto:${email}`} className="underline underline-offset-2">
              {email}
            </a>
            .
          </p>
        )}
      </div>
    </form>
  );
}
