import { Quote } from "lucide-react";
import { testimonials } from "@/content/testimonials";
import { Reveal } from "@/components/ui/primitives";

/** Client quotes as a simple grid (only shown while `showTestimonials` is on). */
export function TestimonialGrid() {
  return (
    <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {testimonials.slice(0, 6).map((t, i) => (
        <Reveal as="li" key={t.name} delay={(i % 3) * 70} className="card flex flex-col p-6 sm:p-7">
          <Quote aria-hidden className="size-6 text-brand-400" />
          <blockquote className="mt-4 flex-1 text-[1.0625rem] leading-relaxed text-fg">{t.quote}</blockquote>
          <p className="mt-5 border-t border-line pt-4 text-sm">
            <span className="font-semibold text-fg">{t.name}</span>
            <span className="block text-fg-muted">{t.role}</span>
          </p>
        </Reveal>
      ))}
    </ul>
  );
}
