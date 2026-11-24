import type { CSSProperties } from "react";
import {
  ArrowLeftRight,
  ArrowRight,
  BadgeCheck,
  Building2,
  ChevronDown,
  FileSignature,
  MessagesSquare,
  ScanEye,
  Sparkles,
  UsersRound,
  type LucideIcon,
} from "lucide-react";
import { dedicated, type DedicatedIcon } from "@/content/dedicated";
import { pageMetadata } from "@/lib/site";
import { breadcrumbJsonLd, serviceJsonLd } from "@/lib/seo";
import { PageHero } from "@/components/sections/page-hero";
import { CtaBand } from "@/components/sections/cta-band";
import { ButtonLink, Reveal, Section, SectionHeading } from "@/components/ui/primitives";
import { HorizontalScroll } from "@/components/ui/horizontal-scroll";
import { PhaseBackdrop, PhaseLight } from "@/components/how-we-work/phase-light";
import { JourneyPanel } from "@/components/dedicated/journey-panel";

export const metadata = pageMetadata({
  title: "Dedicated Developers",
  description: dedicated.metaDescription,
  path: dedicated.path,
  keywords: ["dedicated developers", "staff augmentation", "hire developers", "offshore developers Pakistan", "IT outsourcing"],
});

const ICONS: Record<DedicatedIcon, LucideIcon> = {
  interview: MessagesSquare,
  swap: ArrowLeftRight,
  brand: BadgeCheck,
  terms: FileSignature,
  ai: Sparkles,
  oversight: ScanEye,
};
const tones = ["brand", "human", "data"] as const;
const delay = (ms: number) => ({ "--reveal-delay": `${ms}ms` }) as CSSProperties;

/** Hero visual: the contract in Europe, the team in Pakistan, joined into one team. */
function ModelVisual() {
  return (
    <div className="relative mx-auto grid w-full max-w-md gap-4" aria-hidden>
      <div className="card p-5">
        <p className="flex items-center gap-2 font-mono text-[11px] tracking-[0.16em] text-fg-subtle uppercase">
          <Building2 className="size-3.5 text-human-accent" /> Contract · EU
        </p>
        <p className="mt-2 font-semibold">Germany or Italy</p>
        <p className="text-sm text-fg-muted">EU law · your NDA · monthly invoice</p>
      </div>
      <div className="mx-auto flex items-center gap-2 text-xs font-semibold text-brand-300">
        <span className="h-6 w-px bg-brand-400/60" /> one team <span className="h-6 w-px bg-brand-400/60" />
      </div>
      <div className="card p-5">
        <p className="flex items-center gap-2 font-mono text-[11px] tracking-[0.16em] text-fg-subtle uppercase">
          <UsersRound className="size-3.5 text-brand-400" /> Team · Pakistan
        </p>
        <p className="mt-2 font-semibold">Your dedicated developers</p>
        <p className="text-sm text-fg-muted">Your hours · your tools · your stand-ups</p>
        <div className="mt-4 flex -space-x-2">
          {["brand", "human", "data", "brand"].map((t, i) => (
            <span
              key={i}
              className="grid size-9 place-items-center rounded-full border-2 border-ink-850 text-xs font-semibold"
              style={{ background: `color-mix(in oklab, var(--color-${t === "brand" ? "brand-400" : `${t}-accent`}) 30%, var(--color-ink-850))` }}
            >
              {["FE", "BE", "QA", "PM"][i]}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function DedicatedDevelopersPage() {
  const { hero, steps, model, journey, reasons, roles, rolesNote, faq } = dedicated;
  const jsonLd = [
    breadcrumbJsonLd([
      { name: "Home", path: "/" },
      { name: "Services", path: "/services" },
      { name: dedicated.title, path: dedicated.path },
    ]),
    serviceJsonLd({ name: dedicated.title, description: dedicated.metaDescription, path: dedicated.path }),
  ];

  return (
    <>
      <PageHero
        eyebrow={hero.eyebrow}
        title={
          <>
            {hero.title[0]} <span className="text-gradient">{hero.title[1]}</span>
          </>
        }
        lead={hero.lead}
        crumbs={[
          { label: "Home", href: "/" },
          { label: "Services", href: "/services" },
          { label: dedicated.title, href: dedicated.path },
        ]}
        actions={
          <div className="flex w-full flex-col gap-6">
            <ButtonLink href={dedicated.contactHref} arrow className="w-full justify-center sm:w-fit">
              {hero.cta}
            </ButtonLink>
            <dl className="flex flex-wrap gap-x-8 gap-y-3">
              {hero.proof.map((p) => (
                <div key={p.label} className="flex flex-col-reverse">
                  <dt className="text-sm text-fg-muted">{p.label}</dt>
                  <dd className="font-display text-2xl font-semibold">{p.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        }
        visual={<ModelVisual />}
      />

      {/* How it works */}
      <Section tone="raised" labelledBy="steps-title">
        <div className="container-site">
          <SectionHeading id="steps-title" eyebrow="How it works" title="From request to first commit in 1–2 weeks" />
          <ol className="relative mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <span aria-hidden className="absolute top-4 right-0 left-0 hidden h-px bg-gradient-to-r from-brand-500/60 via-line-strong to-transparent lg:block" />
            {steps.map((s, i) => (
              <li key={s.title} data-reveal suppressHydrationWarning style={delay(i * 90)} className="relative">
                <span className="sd-num relative">{i + 1}</span>
                <h3 className="mt-5 font-semibold">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-fg-muted">{s.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </Section>

      {/* The model: European contract, Pakistan team */}
      <Section labelledBy="model-title">
        <div className="container-site">
          <SectionHeading
            id="model-title"
            eyebrow="How the contract works"
            align="center"
            title={
              <>
                {model.title[0]} <span className="text-gradient">{model.title[1]}</span>
              </>
            }
          />
          <div className="mt-12 grid gap-5 md:grid-cols-2">
            {[
              { ...model.contract, icon: Building2, tone: "human" as const },
              { ...model.team, icon: UsersRound, tone: "brand" as const },
            ].map((col, i) => (
              <Reveal key={col.label} delay={i * 100} className="card p-7 sm:p-8">
                <h3 className="flex items-center gap-3 text-xl font-semibold">
                  <span className="hs-gloss op-tile" data-tone={col.tone} aria-hidden>
                    <col.icon className="size-[46%]" strokeWidth={1.8} />
                  </span>
                  {col.label}
                </h3>
                <ul className="mt-6 space-y-3">
                  {col.points.map((p) => (
                    <li key={p} className="flex gap-3 text-[1.0625rem] leading-relaxed text-fg-muted">
                      <ArrowRight aria-hidden className="mt-1.5 size-4 shrink-0 text-brand-400" />
                      {p}
                    </li>
                  ))}
                </ul>
              </Reveal>
            ))}
          </div>
          <Reveal className="mt-8 text-center">
            <p className="text-lg font-semibold">{model.note}</p>
            <p className="mt-2 text-sm text-fg-subtle">{model.aside}</p>
          </Reveal>
        </div>
      </Section>

      {/* Your first month: full-screen stages that pin and slide sideways under the lamp */}
      <Section labelledBy="journey-title" className="pb-0!">
        <div className="container-site">
          <SectionHeading id="journey-title" eyebrow="Your first month" title="What happens after you hire" />
        </div>
        <div className="mt-10 lg:mt-0">
          <HorizontalScroll label="Your first month" stops={journey.map((s) => s.when)} speed={0.5} dark stage={<PhaseLight />} backdrop={<PhaseBackdrop />}>
            {journey.map((s, i) => (
              <JourneyPanel key={s.id} stage={s} index={i} total={journey.length} />
            ))}
          </HorizontalScroll>
        </div>
      </Section>

      {/* Why teams choose us */}
      <Section tone="raised" labelledBy="why-title">
        <div className="container-site">
          <SectionHeading id="why-title" eyebrow="Why teams choose us" title="Less risk than hiring. Less overhead too." />
          <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {reasons.map((r, i) => {
              const Icon = ICONS[r.icon];
              return (
                <Reveal as="li" key={r.title} delay={i * 60} className="card flex gap-4 p-6">
                  <span className="hs-gloss op-tile shrink-0" data-tone={tones[i % 3]} aria-hidden>
                    <Icon className="size-[46%]" strokeWidth={1.8} />
                  </span>
                  <div>
                    <h3 className="font-semibold">{r.title}</h3>
                    <p className="mt-1 text-[0.9375rem] leading-relaxed text-fg-muted">{r.body}</p>
                  </div>
                </Reveal>
              );
            })}
          </ul>
        </div>
      </Section>

      {/* Roles */}
      <Section labelledBy="roles-title">
        <div className="container-site">
          <SectionHeading id="roles-title" eyebrow="Roles you can hire" title="The skills your roadmap needs" lead={rolesNote} />
          <Reveal>
            <ul className="mt-10 flex flex-wrap gap-2.5">
              {roles.map((r) => (
                <li key={r} className="chip text-[0.9375rem]">
                  {r}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </Section>

      {/* FAQ */}
      <Section tone="raised" labelledBy="faq-title">
        <div className="container-site grid gap-10 lg:grid-cols-[1fr_1.4fr] lg:gap-16">
          <SectionHeading id="faq-title" eyebrow="FAQ" title="Good to know" />
          <div className="space-y-3">
            {faq.map((f) => (
              <details key={f.q} className="group card p-0 [&_summary::-webkit-details-marker]:hidden">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-5 font-semibold sm:p-6">
                  {f.q}
                  <ChevronDown aria-hidden className="size-5 shrink-0 text-fg-subtle transition-transform group-open:rotate-180" />
                </summary>
                <p className="-mt-1 px-5 pb-5 text-[0.9375rem] leading-relaxed text-fg-muted sm:px-6 sm:pb-6">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </Section>

      <CtaBand
        title="Need developers? Let's talk about the role."
        lead="Tell us the stack, seniority and team size. We'll come back with candidates you can interview."
      />
      {jsonLd.map((block, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(block) }} />
      ))}
    </>
  );
}
