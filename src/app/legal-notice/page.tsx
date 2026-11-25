import Link from "next/link";
import { pageMetadata, siteConfig } from "@/lib/site";

/*
 * Legal notice (Note legali): who runs this website, as required for Italian businesses
 * (business name, registered office, VAT number, REA). Data from the Registro Imprese di Torino.
 */

export const metadata = pageMetadata({
  title: "Legal Notice",
  description: "Company information for outscalers.com: business name, registered office, VAT number and contact.",
  path: "/legal-notice",
});

const { legal, contact } = siteConfig;
const italy = siteConfig.offices.find((o) => o.country === "Italy");
const hongKong = siteConfig.offices.find((o) => o.country === "Hong Kong");

const facts: [string, string][] = [
  ["Business name", legal.name],
  ["Legal form", legal.form],
  ["Owner", legal.owner],
  ["Registered office", legal.address],
  ["VAT number (Partita IVA)", legal.vat],
  ["Business register", `Registro Imprese di Torino, REA ${legal.rea}`],
  ["Activity", legal.activity],
  ["Email", contact.email],
  ...(italy ? ([["Phone", italy.phone]] as [string, string][]) : []),
];

export default function LegalNoticePage() {
  return (
    <section className="relative bg-ink-950 pt-28 pb-20 sm:pt-36 sm:pb-28">
      <div className="container-narrow">
        <nav aria-label="Breadcrumb" className="mb-8 text-sm text-fg-subtle">
          <Link href="/" className="transition-colors hover:text-fg">
            Home
          </Link>{" "}
          / <span aria-current="page">Legal Notice</span>
        </nav>
        <h1 className="text-display-lg font-semibold">Legal Notice</h1>
        <p className="mt-4 text-fg-subtle">Note legali</p>

        <dl className="mt-12 divide-y divide-line border-y border-line">
          {facts.map(([k, v]) => (
            <div key={k} className="grid gap-1 py-4 sm:grid-cols-[14rem_1fr] sm:gap-6">
              <dt className="text-sm text-fg-subtle">{k}</dt>
              <dd className="font-medium">
                {k === "Email" ? (
                  <a href={`mailto:${v}`} className="underline underline-offset-2 hover:text-brand-300">
                    {v}
                  </a>
                ) : (
                  v
                )}
              </dd>
            </div>
          ))}
        </dl>

        <div className="prose-site mt-12 space-y-8">
          <section aria-labelledby="ln-companies">
            <h2 id="ln-companies" className="text-xl font-semibold text-fg">
              Our companies
            </h2>
            <p className="mt-3">
              Outscalers works through these companies. Your contract is with the company named in your agreement.
            </p>
            <ul className="mt-5 grid gap-3">
              {legal.companies.map((c) => (
                <li key={c.name} className="card p-5">
                  <div className="text-xs font-medium tracking-wide text-fg-subtle uppercase">
                    {c.country} · {c.role}
                  </div>
                  <div className="mt-1.5 font-semibold text-fg">{c.name}</div>
                  <div className="mt-1 text-sm text-fg-muted">{c.address}</div>
                  <div className="mt-1 text-sm text-fg-muted">
                    {c.taxLabel} {c.taxId}
                  </div>
                </li>
              ))}
            </ul>
            <p className="mt-5">
              We also have an office in {hongKong ? `${hongKong.city}, Hong Kong` : "Hong Kong"}. All office addresses are on our{" "}
              <Link href="/contact" className="underline underline-offset-2 hover:text-fg">
                contact page
              </Link>
              .
            </p>
          </section>
          <section aria-labelledby="ln-content">
            <h2 id="ln-content" className="text-xl font-semibold text-fg">
              Content and links
            </h2>
            <p className="mt-3">
              We keep this website accurate and up to date, but cannot guarantee that every detail is complete at all times.
              Links to other websites are provided for convenience; their owners are responsible for their content.
            </p>
            <p>
              Texts, images and code on this website belong to {legal.name} unless stated otherwise. Product screenshots show
              products built by our team.
            </p>
          </section>
          <section aria-labelledby="ln-privacy">
            <h2 id="ln-privacy" className="text-xl font-semibold text-fg">
              Privacy
            </h2>
            <p className="mt-3">
              How we handle personal data is explained in our{" "}
              <Link href="/privacy" className="underline underline-offset-2 hover:text-fg">
                privacy policy
              </Link>
              .
            </p>
          </section>
        </div>
      </div>
    </section>
  );
}
