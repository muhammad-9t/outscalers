import type { CSSProperties } from "react";
import Link from "next/link";
import { ArrowRight, Bot, UserRound } from "lucide-react";
import { BookCallDialog } from "@/components/contact/book-call-dialog";

/** Two overlapping avatars (a person and the AI) and a hand-drawn smiley, set inline in the headline */
function TitleFaces() {
  return (
    <span aria-hidden className="cta-faces">
      <span className="cta-face" data-tone="human" style={{ "--i": 0 } as CSSProperties}>
        <UserRound className="size-[52%]" strokeWidth={2} />
      </span>
      <span className="cta-face" data-tone="brand" style={{ "--i": 1 } as CSSProperties}>
        <Bot className="size-[52%]" strokeWidth={2} />
      </span>
      <svg className="cta-smiley" viewBox="0 0 64 64" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path className="cta-draw" pathLength={1} d="M32 5c13 0 26 9 26 26 0 15-11 27-26 27C17 58 6 47 6 32 6 17 17 6 31 6" />
        <path className="cta-draw cta-draw-2" pathLength={1} d="M24 24v5M40 24v5" />
        <path className="cta-draw cta-draw-3" pathLength={1} d="M21 39c6 7 16 7 22 0" />
      </svg>
      <svg className="cta-sparks" viewBox="0 0 30 30" fill="none" strokeLinecap="round">
        <path d="M6 22 2 26M14 14l1-6M22 20l6-2" />
      </svg>
    </span>
  );
}

/**
 * Closing call to action, shared across pages. The headline carries a person + AI avatar pair and a
 * smiley that draws itself when the band scrolls into view (styles: .cta-* in globals.css).
 */
export function CtaBand({
  title = "Have an idea? Let's build it faster.",
  lead = "Tell us what you want to build, automate or improve. We'll respond with honest next steps — including when AI isn't the right answer.",
}: {
  title?: string;
  lead?: string;
}) {
  // Faces go after the question ("Have an idea? ☺ Let's …"), or at the end of other titles
  const q = title.indexOf("? ");
  const [first, rest] = q > 0 ? [title.slice(0, q + 1), title.slice(q + 2)] : [title, ""];

  return (
    <section aria-labelledby="cta-title" className="relative overflow-hidden bg-ink-950 py-20 sm:py-28">
      <div aria-hidden className="glow-brand pointer-events-none absolute -bottom-64 left-1/2 size-[44rem] -translate-x-1/2 opacity-50" />
      <div data-reveal suppressHydrationWarning className="cta container-site relative mx-auto max-w-5xl text-center">
        <p className="eyebrow mx-auto">Let&apos;s build something together</p>
        <h2 id="cta-title" className="cta-title mt-6 text-display-xl font-semibold">
          {first} <TitleFaces />
          {rest && (
            <>
              <br className="hidden sm:inline" /> {rest}
            </>
          )}
        </h2>
        <p className="mx-auto mt-6 max-w-xl text-lead text-fg-muted">{lead}</p>
        <div className="mt-9 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-6">
          <BookCallDialog label="Book a free call" className="w-full justify-center sm:w-auto" />
          <Link href="/contact" className="link-arrow">
            or send us a message <ArrowRight aria-hidden className="size-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
