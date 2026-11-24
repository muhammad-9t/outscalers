import Link from "next/link";
import { Mail } from "lucide-react";
import { mainNav, siteConfig } from "@/lib/site";
import { services, serviceHref } from "@/content/services";
import { dedicated } from "@/content/dedicated";
import { Flag, SocialIcon } from "@/components/ui/brand-icons";
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
        <div className="grid gap-12 md:grid-cols-3 xl:grid-cols-[1.6fr_0.6fr_1fr_1fr]">
          <div className="md:col-span-3 xl:col-span-1">
            <Link href="/" className="inline-block rounded-lg" aria-label="Outscalers — home">
              <Logo />
            </Link>
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-fg-muted">
              Human expertise. AI-powered execution. Software that moves your business forward.
            </p>
            <a
              href={`mailto:${contact.email}`}
              className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-fg transition-colors hover:text-brand-300"
            >
              <Mail aria-hidden className="size-4 text-brand-400" />
              {contact.email}
            </a>
            <p className="mt-4 text-sm text-fg-subtle">Offices in</p>
            <ul className="mt-2 flex flex-wrap gap-x-3.5 gap-y-2 text-[0.8125rem] text-fg-muted">
              {siteConfig.offices.map((o) => (
                <li key={o.country} className="flex items-center gap-1.5 whitespace-nowrap">
                  <Flag country={o.country} className="h-3 w-[1.125rem] shrink-0 ring-1 ring-line" />
                  {o.country}
                </li>
              ))}
            </ul>
          </div>

          <nav aria-label="Footer: company">
            <h2 className="text-sm font-semibold text-fg">Company</h2>
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

          <nav aria-label="Footer: services">
            <h2 className="text-sm font-semibold text-fg">Services</h2>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <Link href={dedicated.path} className="text-fg-muted transition-colors hover:text-fg">
                  {dedicated.title}
                </Link>
              </li>
              {services.map((s) => (
                <li key={s.slug}>
                  <Link href={serviceHref(s.slug)} className="text-fg-muted transition-colors hover:text-fg">
                    {s.title}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h2 className="text-sm font-semibold text-fg">Start a conversation</h2>
            <p className="mt-4 text-sm leading-relaxed text-fg-muted">
              Tell us about the problem you are solving. An engineer — not a sales script — will reply.
            </p>
            {social.length > 0 && (
              <ul aria-label="Social media" className="mt-6 flex flex-wrap gap-2.5">
                {social.map((s) => (
                  <li key={s.href}>
                    <a
                      href={s.href}
                      rel="noopener noreferrer"
                      target="_blank"
                      title={s.label}
                      className="grid size-10 place-items-center rounded-lg border border-line-strong text-fg-muted transition-colors hover:border-brand-400 hover:text-brand-300"
                    >
                      <SocialIcon name={s.label} className="size-[1.125rem]" />
                      <span className="sr-only">{s.label} (opens in a new tab)</span>
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
          {/* Legal links (Imprint to be added before launch) */}
          <Link href="/privacy" className="transition-colors hover:text-fg">
            Privacy Policy
          </Link>
        </div>
      </div>
    </footer>
  );
}
