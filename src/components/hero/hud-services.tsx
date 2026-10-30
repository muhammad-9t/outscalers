import Link from "next/link";
import { ServiceGlyph } from "@/components/illustrations/service-glyph";
import { services, serviceHref } from "@/content/services";
import { cn } from "@/lib/cn";

// Reveals a part when its node is hovered or keyboard-focused. The parts play in order:
// ring, line up, line across (200ms), then the panel (380ms).
const SHOW = "group-hover:opacity-100 group-focus-visible:opacity-100";

/**
 * Hero service links as icon-only HUD nodes. Hovering or focusing one draws a line out of it
 * and opens a heads-up panel with the service name and tagline.
 */
export function HudServices({ className }: { className?: string }) {
  return (
    <ul aria-label="What we do" className={cn("flex flex-wrap gap-3", className)}>
      {services.map((s, i) => {
        // The row sits against the right edge (or is centred on small screens), so the right-hand nodes open their panel to the left
        const flip = i >= services.length - 2;
        return (
          <li key={s.slug} className="relative">
            <Link
              href={serviceHref(s.slug)}
              aria-label={`${s.shortTitle}: ${s.tagline}`}
              className="group relative grid size-12 place-items-center rounded-full border border-line-strong bg-ink-900/60 backdrop-blur-sm transition-[border-color,box-shadow] duration-300 outline-none hover:border-brand-400/70 hover:shadow-[0_0_24px_-4px_var(--color-brand-500)] focus-visible:border-brand-400/70 focus-visible:shadow-[0_0_24px_-4px_var(--color-brand-500)]"
            >
              <ServiceGlyph slug={s.slug} className="size-5 text-brand-400 transition-transform duration-300 group-hover:scale-110" />

              {/* Spinning targeting ring */}
              <span
                aria-hidden
                className={cn(
                  "pointer-events-none absolute -inset-1.5 rounded-full border border-dashed border-brand-400/60 opacity-0 transition-opacity duration-300 motion-safe:animate-[spin_9s_linear_infinite]",
                  SHOW,
                )}
              />

              {/* Connector: up from the node, then across to the panel */}
              <span
                aria-hidden
                className="pointer-events-none absolute bottom-full left-1/2 h-8 w-px origin-bottom scale-y-0 bg-brand-400 transition-transform duration-200 group-hover:scale-y-100 group-focus-visible:scale-y-100"
              />
              <span
                aria-hidden
                className={cn(
                  "pointer-events-none absolute bottom-[calc(100%+2rem)] h-px w-7 scale-x-0 bg-brand-400 transition-transform duration-200 group-hover:scale-x-100 group-hover:delay-200 group-focus-visible:scale-x-100 group-focus-visible:delay-200",
                  flip ? "right-1/2 origin-right" : "left-1/2 origin-left",
                )}
              />
              <span
                aria-hidden
                className={cn(
                  "pointer-events-none absolute bottom-[calc(100%+2rem)] left-1/2 size-1.5 -translate-x-1/2 translate-y-1/2 rounded-full bg-brand-300 opacity-0 transition-opacity duration-150 group-hover:delay-200 group-focus-visible:delay-200",
                  SHOW,
                )}
              />

              {/* Heads-up panel, wiped open from the connector */}
              <span
                aria-hidden
                className={cn(
                  "pointer-events-none absolute bottom-[calc(100%+2rem)] z-20 translate-y-1/2 whitespace-nowrap border border-brand-400/40 bg-ink-950 px-3.5 py-2 text-left opacity-0 shadow-[0_0_30px_-10px_var(--color-brand-500)] transition-[clip-path,opacity] duration-300 group-hover:opacity-100 group-hover:delay-380 group-hover:[clip-path:inset(0_0_0_0)] group-focus-visible:opacity-100 group-focus-visible:delay-380 group-focus-visible:[clip-path:inset(0_0_0_0)]",
                  // Wipes open away from the connector
                  flip
                    ? "right-[calc(50%+1.75rem)] [clip-path:inset(0_0_0_100%)]"
                    : "left-[calc(50%+1.75rem)] [clip-path:inset(0_100%_0_0)]",
                )}
              >
                {/* Corner brackets */}
                <span className="absolute -top-px -left-px size-2 border-t-2 border-l-2 border-brand-300" />
                <span className="absolute -right-px -bottom-px size-2 border-r-2 border-b-2 border-brand-300" />
                <span className="block font-mono text-[10px] tracking-[0.18em] text-brand-300">
                  {`0${i + 1} // SERVICE`}
                </span>
                <span className="mt-0.5 block text-sm font-semibold text-fg">{s.shortTitle}</span>
                <span className="block font-mono text-[11px] text-fg-subtle">{s.tagline}</span>
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
