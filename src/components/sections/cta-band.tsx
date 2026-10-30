import { ButtonLink } from "@/components/ui/primitives";

/** Closing call to action, shared across pages. */
export function CtaBand({
  title = "Have an idea? Let's engineer what's next.",
  lead = "Tell us what you want to build, automate or improve. We'll respond with honest next steps — including when AI isn't the right answer.",
}: {
  title?: string;
  lead?: string;
}) {
  return (
    <section aria-labelledby="cta-title" className="relative overflow-hidden bg-ink-950 py-20 sm:py-28">
      <div className="container-site relative">
        <div
          data-reveal
          className="relative overflow-hidden rounded-[1.75rem] border border-brand-500/25 bg-gradient-to-br from-ink-800 via-ink-850 to-ink-900 px-6 py-14 sm:px-12 sm:py-16 lg:px-16"
        >
          <div aria-hidden className="glow-brand pointer-events-none absolute -bottom-48 left-1/2 size-[40rem] -translate-x-1/2 opacity-70" />
          <svg
            aria-hidden
            className="pointer-events-none absolute inset-0 h-full w-full opacity-40"
            preserveAspectRatio="none"
            viewBox="0 0 800 300"
          >
            <path d="M0 240C160 240 220 120 400 120S640 40 800 40" className="flow-dash fill-none stroke-brand-500/60" strokeWidth={1} />
            <path d="M0 280C200 280 260 190 420 190S660 140 800 120" className="fill-none stroke-line-strong" strokeWidth={1} />
          </svg>

          <div className="relative grid items-end gap-10 lg:grid-cols-[1.4fr_1fr]">
            <div>
              <p className="font-mono text-sm text-brand-300">
                <span className="text-fg-subtle">$</span> outscalers start --project <span className="text-fg">your-idea</span>
                <span aria-hidden className="ml-1 inline-block h-4 w-2 translate-y-0.5 animate-caret bg-brand-300" />
              </p>
              <h2 id="cta-title" className="mt-6 text-display-lg font-semibold">
                {title}
              </h2>
              <p className="mt-5 max-w-xl text-lead text-fg-muted">{lead}</p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col lg:items-end">
              <ButtonLink href="/how-we-work" variant="secondary">
                See how we work
              </ButtonLink>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
