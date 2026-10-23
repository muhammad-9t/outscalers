import Link from "next/link";
import { Mail } from "lucide-react";
import { mainNav, siteConfig } from "@/lib/site";
import { services, serviceHref } from "@/content/services";
import { Logo } from "./logo";

// Cached so the current year can be read during prerendering.
async function CopyrightYear() {
  "use cache";
  return <>{new Date().getFullYear()}</>;
}

export function Footer() {
  const { contact, social } = siteConfig;

  return (
    <footer className="relative border-t border-line bg-ink-950">
      <div aria-hidden className="bg-grid pointer-events-none absolute inset-0 opacity-30" />
      <div className="container-site relative py-14 lg:py-20">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <Link href="/" className="inline-block rounded-lg" aria-label="Outscalers — home">
              <Logo />
            </Link>
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-fg-muted">
              Human intelligence. AI-powered engineering. We combine experienced engineers with AI to build software,
              automate processes and help businesses move faster.
            </p>
            <a
              href={`mailto:${contact.email}`}
              className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-fg transition-colors hover:text-brand-300"
            >
              <Mail aria-hidden className="size-4 text-brand-400" />
              {contact.email}
            </a>
            <p className="mt-4 text-sm text-fg-subtle">
              Offices in {siteConfig.offices.map((o) => o.country).join(" · ")}
            </p>
          </div>

          <nav aria-label="Footer: company" className="lg:col-span-2">
            <h2 className="font-mono text-xs uppercase tracking-wider text-fg-subtle">Company</h2>
            <ul className="mt-4 space-y-2.5 text-sm">
              {mainNav.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="text-fg-muted transition-colors hover:text-fg">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Footer: services" className="lg:col-span-3">
            <h2 className="font-mono text-xs uppercase tracking-wider text-fg-subtle">Services</h2>
            <ul className="mt-4 space-y-2.5 text-sm">
              {services.map((s) => (
                <li key={s.slug}>
                  <Link href={serviceHref(s.slug)} className="text-fg-muted transition-colors hover:text-fg">
                    {s.title}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="lg:col-span-3">
            <h2 className="font-mono text-xs uppercase tracking-wider text-fg-subtle">Start a conversation</h2>
            <p className="mt-4 text-sm leading-relaxed text-fg-muted">
              Tell us about the problem you are solving. An engineer — not a sales script — will reply.
            </p>
            <Link href="/contact" className="btn btn-secondary btn-sm mt-5">
              Contact us
            </Link>
            {social.length > 0 && (
              <ul aria-label="Social media" className="mt-6 flex flex-wrap gap-x-4 gap-y-2 text-sm">
                {social.map((s) => (
                  <li key={s.href}>
                    <a href={s.href} rel="noopener noreferrer" target="_blank" className="text-fg-muted hover:text-fg">
                      {s.label}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="hairline mt-14" />
        <div className="mt-6 flex flex-col gap-3 text-xs text-fg-subtle sm:flex-row sm:items-center sm:justify-between">
          <p>
            © <CopyrightYear /> {siteConfig.name}. All rights reserved.
          </p>
          <p>Engineered by people. Accelerated by AI.</p>
        </div>
      </div>
    </footer>
  );
}
