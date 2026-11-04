import { Mail, MapPin, Phone } from "lucide-react";
import { pageMetadata, siteConfig } from "@/lib/site";
import { PageHero } from "@/components/sections/page-hero";
import { ContactForm } from "@/components/contact/contact-form";
import { Reveal, Section } from "@/components/ui/primitives";

export const metadata = pageMetadata({
  title: "Contact",
  description:
    "Start a project with Outscalers. Tell us what you want to build, automate or improve.",
  path: "/contact",
});

const steps = [
  "An engineer reads your message and replies with questions or first thoughts.",
  "A short call to understand goals, constraints and timelines.",
  "A proposed approach, team and plan — including where AI helps and where it doesn't.",
];

export default function ContactPage() {
  const { contact, offices } = siteConfig;

  return (
    <>
      <PageHero
        eyebrow="Contact"
        title="Let's talk about what you're building."
        lead="Share a little about your project and we'll get back to you. No obligation, no sales script."
        crumbs={[
          { label: "Home", href: "/" },
          { label: "Contact", href: "/contact" },
        ]}
        className="pb-10 sm:pb-12 lg:pb-14"
      />

      <Section tone="dark" className="!pt-10 sm:!pt-12" labelledBy="start-project">
        <div className="container-site grid gap-10 lg:grid-cols-[1.5fr_1fr] lg:gap-14">
          <Reveal className="card p-6 sm:p-10">
            <h2 id="start-project" className="text-2xl font-semibold">
              Start a project
            </h2>
            <p className="mt-2 text-[0.9375rem] text-fg-muted">{contact.responseTime}</p>
            <div className="mt-8">
              <ContactForm email={contact.email} />
            </div>
          </Reveal>

          <div className="space-y-5">
            <Reveal delay={80} className="card p-6">
              <h2 className="flex items-center gap-2 font-semibold">
                <Mail aria-hidden className="size-5 text-brand-400" /> Email
              </h2>
              <a href={`mailto:${contact.email}`} className="mt-2 inline-block text-sm text-brand-300 hover:text-brand-200">
                {contact.email}
              </a>
            </Reveal>

            <Reveal delay={140} className="card p-6">
              <h2 className="font-semibold">What happens next</h2>
              <ol className="mt-4 space-y-3">
                {steps.map((s, i) => (
                  <li key={s} className="flex gap-3 text-sm text-fg-muted">
                    <span className="grid size-6 shrink-0 place-items-center rounded-full border border-line-strong font-mono text-[11px] text-brand-300">
                      {i + 1}
                    </span>
                    {s}
                  </li>
                ))}
              </ol>
            </Reveal>
          </div>
        </div>
      </Section>

      <Section tone="raised" tight labelledBy="offices-title">
        <div className="container-site">
          <h2 id="offices-title" className="text-display-md font-semibold">
            Our offices
          </h2>
          <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {offices.map((o, i) => (
              <Reveal as="li" key={o.country} delay={i * 60} className="card p-6">
                <p className="font-mono text-xs uppercase tracking-wider text-brand-300">{o.country}</p>
                <address className="mt-3 space-y-3 text-sm not-italic text-fg-muted">
                  <span className="flex gap-2.5">
                    <MapPin aria-hidden className="mt-0.5 size-4 shrink-0 text-fg-subtle" />
                    {o.address}
                  </span>
                  <a href={`tel:${o.phone.replace(/[^+\d]/g, "")}`} className="flex gap-2.5 text-fg hover:text-brand-200">
                    <Phone aria-hidden className="mt-0.5 size-4 shrink-0 text-fg-subtle" />
                    {o.phone}
                  </a>
                </address>
              </Reveal>
            ))}
          </ul>
        </div>
      </Section>
    </>
  );
}
