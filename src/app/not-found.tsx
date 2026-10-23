import { ButtonLink } from "@/components/ui/primitives";

export default function NotFound() {
  return (
    <section className="relative overflow-hidden bg-ink-950 pb-24 pt-36">
      <div aria-hidden className="bg-grid pointer-events-none absolute inset-0 opacity-50" />
      <div className="container-narrow relative text-center">
        <p className="font-mono text-sm text-brand-300">
          <span className="text-fg-subtle">$</span> GET this-page → 404
        </p>
        <h1 className="mt-6 text-display-lg font-semibold">This page doesn&apos;t exist.</h1>
        <p className="mx-auto mt-5 max-w-md text-lead text-fg-muted">
          The link may be outdated, or the page may have moved. Let&apos;s get you back on track.
        </p>
        <div className="mt-9 flex flex-wrap justify-center gap-3">
          <ButtonLink href="/">Go to homepage</ButtonLink>
          <ButtonLink href="/contact" variant="secondary">
            Contact us
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
