import { Mail } from "lucide-react";
import { pageMetadata, siteConfig } from "@/lib/site";
import { PageHero } from "@/components/sections/page-hero";
import { ContactForm } from "@/components/contact/contact-form";
import { ContactVisual } from "@/components/contact/contact-visual";
import { ContactSidebar } from "@/components/contact/contact-sidebar";
import { OfficeCards } from "@/components/about/office-cards";
import { Reveal, Section, SectionHeading } from "@/components/ui/primitives";

export const metadata = pageMetadata({
  title: "Contact Us",
  description:
    "Have an idea? Contact Outscalers to start a project or book a call. We reply within one business day across Europe and Asia time zones.",
  path: "/contact",
  keywords: ["contact Outscalers", "book a call", "IT outsourcing enquiry", "software project quote"],
});

export default function ContactPage() {
  const { contact, scheduling } = siteConfig;

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
        visual={<ContactVisual />}
        className="pb-10 sm:pb-12 lg:pb-14"
      />

      <Section tone="dark" className="!pt-10 !pb-12 sm:!pt-12 sm:!pb-16" labelledBy="start-project">
        <div className="container-site grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] lg:items-stretch">
          {/* Form */}
          <Reveal className="ct-card flex flex-col p-6 sm:p-9">
            <div className="flex items-center gap-3.5">
              <span className="hs-gloss ct-tile" data-tone="brand" aria-hidden>
                <Mail className="size-[48%]" strokeWidth={1.8} />
              </span>
              <div>
                <h2 id="start-project" className="text-2xl font-semibold">
                  Start a project
                </h2>
                <p className="text-[0.9375rem] text-fg-muted">{contact.responseTime}</p>
              </div>
            </div>
            <div className="mt-8 flex flex-1 flex-col">
              <ContactForm email={contact.email} />
            </div>
          </Reveal>

          {/* Sidebar */}
          <ContactSidebar email={contact.email} scheduling={scheduling} />
        </div>
      </Section>

      <Section tone="raised" tight className="!pt-4 sm:!pt-6" labelledBy="offices-title">
        <div className="container-site">
          <SectionHeading id="offices-title" eyebrow="Offices" title="Our offices" />
          <OfficeCards />
        </div>
      </Section>
    </>
  );
}
