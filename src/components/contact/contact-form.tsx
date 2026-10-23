"use client";

import { useId, useRef, useState, type FormEvent } from "react";
import { Send } from "lucide-react";
import { cn } from "@/lib/cn";

type Field = "firstName" | "lastName" | "email" | "company" | "interest" | "message";
type Errors = Partial<Record<Field, string>>;

const interests = [
  "AI solutions & agents",
  "Custom software development",
  "Business process automation",
  "Data engineering & cloud",
  "Security & quality engineering",
  "Team augmentation",
  "Not sure yet",
];

function validate(data: FormData): Errors {
  const errors: Errors = {};
  const get = (k: Field) => String(data.get(k) ?? "").trim();
  if (!get("firstName")) errors.firstName = "Please enter your first name.";
  if (!get("lastName")) errors.lastName = "Please enter your last name.";
  const email = get("email");
  if (!email) errors.email = "Please enter your email address.";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = "Please enter a valid email address.";
  if (get("message").length < 20) errors.message = "Please tell us a little more (at least 20 characters).";
  return errors;
}

const inputClass =
  "mt-2 block w-full rounded-xl border border-line-strong bg-ink-900 px-4 py-3 text-[0.9375rem] text-fg placeholder:text-fg-subtle transition-colors focus:border-brand-400 focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-300 aria-[invalid=true]:border-danger";

/**
 * Project enquiry form. There is no backend yet, so a valid submission opens the
 * visitor's email client with the message pre-filled.
 * TODO: replace `mailto` with a server action or form service when one is chosen.
 */
export function ContactForm({ email }: { email: string }) {
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<"idle" | "opened">("idle");
  const formRef = useRef<HTMLFormElement>(null);
  const id = useId();
  const fid = (f: Field) => `${id}-${f}`;

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const found = validate(data);
    setErrors(found);
    const firstInvalid = Object.keys(found)[0] as Field | undefined;
    if (firstInvalid) {
      formRef.current?.querySelector<HTMLElement>(`#${CSS.escape(fid(firstInvalid))}`)?.focus();
      return;
    }

    const v = (k: Field) => String(data.get(k) ?? "").trim();
    const subject = `Project enquiry: ${v("interest") || "General"}`;
    const details = [
      `Name: ${v("firstName")} ${v("lastName")}`,
      `Email: ${v("email")}`,
      v("company") && `Company: ${v("company")}`,
      v("interest") && `Interested in: ${v("interest")}`,
    ].filter(Boolean);
    const body = `${details.join("\n")}\n\n${v("message")}`;

    window.location.href = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setStatus("opened");
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
    <form ref={formRef} noValidate onSubmit={onSubmit} className="space-y-5" aria-describedby={`${id}-note`}>
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

      <div>
        <label htmlFor={fid("interest")} className="text-sm font-medium">
          What can we help with?
        </label>
        <select id={fid("interest")} name="interest" defaultValue="" className={cn(inputClass, "appearance-none")}>
          <option value="">Select an area (optional)</option>
          {interests.map((i) => (
            <option key={i} value={i}>
              {i}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor={fid("message")} className="text-sm font-medium">
          Tell us about your project <span aria-hidden className="text-brand-300">*</span>
        </label>
        <textarea
          id={fid("message")}
          name="message"
          rows={6}
          required
          aria-invalid={Boolean(errors.message)}
          aria-describedby={describedBy("message", `${fid("message")}-hint`)}
          className={cn(inputClass, "resize-y")}
        />
        <p id={`${fid("message")}-hint`} className="mt-1.5 text-sm text-fg-subtle">
          What are you trying to achieve, and what&apos;s in the way? Rough timelines help too.
        </p>
        {errorText("message")}
      </div>

      <div className="flex flex-col gap-4 pt-2 sm:flex-row sm:items-center sm:justify-between">
        <p id={`${id}-note`} className="text-sm text-fg-subtle">
          Submitting opens your email app with your message ready to send to {email}.
        </p>
        <button type="submit" className="btn btn-primary shrink-0">
          Prepare email <Send aria-hidden className="size-4" />
        </button>
      </div>

      <p role="status" aria-live="polite" className="text-sm text-brand-200 empty:hidden">
        {status === "opened" &&
          `Your email app should now open with your message. If it didn't, please email us directly at ${email}.`}
      </p>
    </form>
  );
}
