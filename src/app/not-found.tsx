import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Compass, FolderOpen, Layers, Mail } from "lucide-react";
import { ButtonLink } from "@/components/ui/primitives";
import { pageMetadata } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "Page not found",
  description: "The page you requested could not be found on outscalers.com.",
  path: "/404",
  noIndex: true,
});

const places = [
  { href: "/services", label: "Services", body: "What we build", icon: Layers, tone: "brand" },
  { href: "/portfolio", label: "Portfolio", body: "Work we have shipped", icon: FolderOpen, tone: "human" },
  { href: "/contact", label: "Contact", body: "Talk to an engineer", icon: Mail, tone: "data" },
] as const;

/** 404: a big soft "404" with a lost compass tile drifting over it, and three ways back. Styles: .nf-*. */
export default function NotFound() {
  return (
    <section className="relative overflow-hidden bg-ink-950 pb-24 pt-32 sm:pt-36">
      <div aria-hidden className="nf-glow" />
      <div className="container-narrow relative text-center">
        <div className="nf-mark" aria-hidden>
          <span className="nf-num">404</span>
          <span className="hs-gloss nf-tile" data-tone="brand">
            <Compass className="size-[48%]" strokeWidth={1.8} />
          </span>
        </div>
        <h1 className="mt-4 text-display-lg font-semibold">This page doesn&apos;t exist.</h1>
        <p className="mx-auto mt-5 max-w-md text-lead text-fg-muted">
          The link may be outdated, or the page may have moved. Let&apos;s get you back on track.
        </p>
        <div className="mt-9 flex justify-center">
          <ButtonLink href="/">Go to homepage</ButtonLink>
        </div>
        <ul className="mt-12 grid gap-3 text-left sm:grid-cols-3">
          {places.map((p) => (
            <li key={p.href}>
              <Link href={p.href} className="card card-interactive group flex items-center gap-3 p-4">
                <span className="sd-icon" data-tone={p.tone}>
                  <p.icon aria-hidden className="size-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-semibold">{p.label}</span>
                  <span className="block text-sm text-fg-muted">{p.body}</span>
                </span>
                <ArrowUpRight aria-hidden className="size-4 text-fg-subtle transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
