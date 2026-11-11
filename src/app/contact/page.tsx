import { MapPin, Phone } from "lucide-react";
import { pageMetadata, siteConfig } from "@/lib/site";
import { PageHero } from "@/components/sections/page-hero";
import { ContactForm } from "@/components/contact/contact-form";
import { VenomTrail } from "@/components/contact/venom-trail";
import { Reveal, Section } from "@/components/ui/primitives";

export const metadata = pageMetadata({
  title: "Contact Us",
  description:
    "Have an idea? Contact Outscalers to start a project or book a call. We reply within one business day across Europe and Asia time zones.",
  path: "/contact",
  keywords: ["contact Outscalers", "book a call", "IT outsourcing enquiry", "software project quote"],
});

export default function ContactPage() {
  const { contact, offices } = siteConfig;

  return (
    <>
      {/* The venom trail grows down the page behind every section; the sections go transparent
          and the cards turn to glass so it shows through. */}
      <div className="glass-scope relative isolate bg-ink-950 [&>section]:bg-transparent">
      <VenomTrail />
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
        <div className="container-site">
          <Reveal className="card p-6 sm:p-10">
            <h2 id="start-project" className="text-2xl font-semibold">
              Start a project
            </h2>
            <p className="mt-2 text-[0.9375rem] text-fg-muted">{contact.responseTime}</p>
            <div className="mt-8">
              <ContactForm email={contact.email} />
            </div>
          </Reveal>
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
      </div>
    </>
  );
}
