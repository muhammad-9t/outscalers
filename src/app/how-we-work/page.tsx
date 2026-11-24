import Link from "next/link";
import { ArrowRight, ChevronRight, GitPullRequest, LockKeyhole, ShieldCheck, UserCheck, UsersRound, type LucideIcon } from "lucide-react";
import { dedicated } from "@/content/dedicated";
import { pageMetadata } from "@/lib/site";
import { CtaBand } from "@/components/sections/cta-band";
import { ReviewVisual } from "@/components/how-we-work/review-visual";
import { WorkflowSteps } from "@/components/how-we-work/workflow-steps";
import { Reveal, Section, SectionHeading } from "@/components/ui/primitives";

export const metadata = pageMetadata({
  title: "How We Work",
  description:
    "See how Outscalers delivers: discovery, architecture, AI-assisted implementation, human code review, testing and deployment — a clear engineering process with accountability at every stage.",
  path: "/how-we-work",
  keywords: ["software delivery process", "AI-assisted development", "code review", "Outscalers methodology"],
});

const principles: { text: string; icon: LucideIcon; tone: "brand" | "human" | "data" }[] = [
  { text: "AI-generated code is never merged without review by an engineer.", icon: GitPullRequest, tone: "human" },
  { text: "Architecture, security and data-access decisions are made by people.", icon: UserCheck, tone: "brand" },
  { text: "Client data is only used with AI tools you have approved for it.", icon: LockKeyhole, tone: "data" },
  { text: "Nothing is deployed to production without passing tests and human sign-off.", icon: ShieldCheck, tone: "human" },
];

const legend = [
  { tone: "human", label: "People decide" },
  { tone: "brand", label: "AI drafts" },
  { tone: "data", label: "Checks run automatically" },
] as const;

export default function HowWeWorkPage() {
  return (
    <>
      {/* Hero: split header (headline left, lead right), with the review scene full width below */}
      <section className="relative overflow-hidden bg-ink-950 pb-12 pt-28 sm:pb-16 lg:pt-36">
        <div aria-hidden className="glow-brand pointer-events-none absolute -right-40 -top-40 size-[36rem] opacity-60" />
        <div className="container-site relative">
          <nav aria-label="Breadcrumb" className="mb-8">
            <ol className="flex flex-wrap items-center gap-1.5 text-sm text-fg-subtle">
              <li>
                <Link href="/" className="transition-colors hover:text-fg">
                  Home
                </Link>
              </li>
              <li className="flex items-center gap-1.5">
                <ChevronRight aria-hidden className="size-3.5" />
                <span aria-current="page" className="text-fg-muted">
                  How We Work
                </span>
              </li>
            </ol>
          </nav>
          <div className="grid gap-8 lg:grid-cols-[1.25fr_1fr] lg:items-end lg:gap-16">
            <div>
              <p className="eyebrow mb-5">How we work</p>
              <h1 className="text-display-lg font-semibold">
                AI-accelerated. <span className="text-gradient">Human-led.</span>
              </h1>
            </div>
            <div>
              <p className="text-lead text-fg-muted">
                Our delivery process puts experienced people at every decision point and uses AI where it makes the work
                faster or better. Here&apos;s what that looks like in practice.
              </p>
              <ul className="mt-6 flex flex-wrap gap-2">
                {legend.map((l) => (
                  <li key={l.label} className="hw-legend">
                    <span aria-hidden className="wf-dot" data-tone={l.tone} /> {l.label}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div data-reveal suppressHydrationWarning className="mt-10 lg:mt-12">
            <ReviewVisual />
          </div>
        </div>
      </section>

      {/* Workflow overview */}
      <Section tone="dark" labelledBy="loop-title" className="overflow-x-clip">
        <div className="container-site">
          <SectionHeading
            id="loop-title"
            eyebrow="The workflow"
            title="AI speeds up the work. Engineers decide what ships."
            lead="Follow one feature from idea to production, and see where engineers hold the controls at every step."
          />
        </div>
        <WorkflowSteps />
      </Section>

      {/* Principles */}
      <Section tone="raised" labelledBy="principles-title">
        <div className="container-site grid gap-12 lg:grid-cols-[1fr_1.3fr] lg:gap-20">
          <SectionHeading
            id="principles-title"
            eyebrow="Responsible AI in delivery"
            title="Ground rules we work by"
            lead="They apply to every project."
          />
          <ul className="grid gap-3">
            {principles.map((p, i) => (
              <Reveal as="li" key={p.text} delay={i * 60} className="hw-rule">
                <span className="hs-gloss hw-rule-tile" data-tone={p.tone} aria-hidden>
                  <p.icon className="size-[48%]" strokeWidth={1.8} />
                </span>
                <span className="text-[1.0625rem] font-medium">{p.text}</span>
              </Reveal>
            ))}
          </ul>
        </div>
      </Section>

      {/* Dedicated developers follow the client's own process */}
      <Section tight labelledBy="hww-dedicated-title">
        <div className="container-site">
          <Reveal>
            <Link
              href={dedicated.path}
              className="card card-interactive group flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:p-8"
            >
              <span className="hs-gloss op-tile shrink-0" data-tone="data" aria-hidden>
                <UsersRound className="size-[46%]" strokeWidth={1.8} />
              </span>
              <span className="min-w-0 flex-1">
                <span id="hww-dedicated-title" className="block text-xl font-semibold">
                  Hiring dedicated developers instead?
                </span>
                <span className="mt-1 block text-fg-muted">They join your team and follow your process, tools and hours.</span>
              </span>
              <span className="link-arrow shrink-0">
                {dedicated.title} <ArrowRight aria-hidden className="size-4 transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>
          </Reveal>
        </div>
      </Section>

      <CtaBand />
    </>
  );
}
