import Link from "next/link";
import type { ComponentProps, CSSProperties, ElementType, ReactNode } from "react";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/cn";

type ButtonVariant = "primary" | "secondary";

export function ButtonLink({
  href,
  variant = "primary",
  size,
  arrow,
  className,
  children,
  ...rest
}: ComponentProps<typeof Link> & { variant?: ButtonVariant; size?: "sm"; arrow?: boolean }) {
  return (
    <Link
      href={href}
      className={cn("btn", `btn-${variant}`, size === "sm" && "btn-sm", "group", className)}
      {...rest}
    >
      {children}
      {arrow && (
        <ArrowRight aria-hidden className="size-4 transition-transform duration-200 group-hover:translate-x-0.5" />
      )}
    </Link>
  );
}

export function ArrowLink({ href, children, className }: { href: string; children: ReactNode; className?: string }) {
  return (
    <Link href={href} className={cn("link-arrow", className)}>
      {children}
      <ArrowRight aria-hidden className="size-4" />
    </Link>
  );
}

type Tone = "dark" | "deep" | "raised" | "light";

const toneClass: Record<Tone, string> = {
  // One background everywhere: every dark tone uses the same ink-950 as the home hero and editor
  dark: "bg-ink-950",
  deep: "bg-ink-950",
  raised: "bg-ink-950",
  light: "tone-light bg-paper text-paper-fg",
};

export function Section({
  tone = "dark",
  tight,
  id,
  className,
  children,
  labelledBy,
}: {
  tone?: Tone;
  tight?: boolean;
  id?: string;
  className?: string;
  children: ReactNode;
  labelledBy?: string;
}) {
  return (
    <section
      id={id}
      aria-labelledby={labelledBy}
      className={cn("relative", tight ? "section-tight" : "section", toneClass[tone], className)}
    >
      {children}
    </section>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  lead,
  id,
  align = "left",
  as: Heading = "h2",
  className,
}: {
  eyebrow?: string;
  title: ReactNode;
  lead?: ReactNode;
  id?: string;
  align?: "left" | "center";
  as?: ElementType;
  className?: string;
}) {
  return (
    <div
      data-reveal
      className={cn("max-w-3xl", align === "center" && "mx-auto text-center", className)}
    >
      {eyebrow && <p className="eyebrow mb-4">{eyebrow}</p>}
      <Heading id={id} className="text-display-lg font-semibold">
        {title}
      </Heading>
      {lead && (
        <p className="mt-5 text-lead text-fg-muted [.tone-light_&]:text-paper-muted">{lead}</p>
      )}
    </div>
  );
}

/** Marks content for a scroll-triggered reveal. Content stays visible without JS. */
export function Reveal({
  children,
  delay = 0,
  className,
  as: Tag = "div",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  as?: ElementType;
}) {
  return (
    <Tag data-reveal className={className} style={{ "--reveal-delay": `${delay}ms` } as CSSProperties}>
      {children}
    </Tag>
  );
}
