"use client";

import { useId, useRef, useState, type CSSProperties, type KeyboardEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/cn";

export type ShowcaseItem = {
  slug: string;
  name: string;
  /** One short line about the product */
  line: string;
  facts: string[];
  href: string;
  image: { src: string; alt: string; width: number; height: number };
  /** Products with a brand kit: their logo and colours (otherwise a neutral stage) */
  logo?: { src: string; alt: string; width: number; height: number };
  brand?: { primary: string; deep: string; tint: string; stage: string };
  /** Brand screens are devices on a transparent background; others are page screenshots that get a frame */
  framed: boolean;
};

/**
 * Home "Products we've built": one product at a time on a large stage, with tabs to switch
 * (click or arrow keys). No auto-play: the visitor chooses.
 */
export function ProductShowcase({ items, displayClass }: { items: ShowcaseItem[]; displayClass: string }) {
  const [active, setActive] = useState(0);
  const id = useId();
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const p = items[active];

  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const step = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
    if (!step) return;
    e.preventDefault();
    const next = (active + step + items.length) % items.length;
    setActive(next);
    tabs.current[next]?.focus();
  };

  const stage = p.brand
    ? ({
        "--p": p.brand.primary,
        "--pd": p.brand.deep,
        background: `radial-gradient(120% 80% at 80% 0%, ${p.brand.tint} 0%, ${p.brand.stage} 65%)`,
      } as CSSProperties)
    : ({ "--p": "#111", "--pd": "#000", background: "linear-gradient(160deg, #f4f6f9, #e9edf2)" } as CSSProperties);

  return (
    <div>
      <div
        role="tablist"
        aria-label="Products"
        onKeyDown={onKey}
        className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:px-0"
      >
        {items.map((t, i) => (
          <button
            key={t.slug}
            ref={(el) => {
              tabs.current[i] = el;
            }}
            role="tab"
            type="button"
            id={`${id}-tab-${i}`}
            aria-selected={i === active}
            aria-controls={`${id}-panel`}
            tabIndex={i === active ? 0 : -1}
            onClick={() => setActive(i)}
            className={cn(
              "shrink-0 rounded-full border px-4 py-2 text-sm font-semibold whitespace-nowrap transition-colors",
              i === active ? "border-brand-400 bg-brand-500/10 text-fg" : "border-line-strong text-fg-muted hover:border-fg-subtle hover:text-fg",
            )}
          >
            {t.name}
          </button>
        ))}
      </div>

      <div
        id={`${id}-panel`}
        role="tabpanel"
        aria-labelledby={`${id}-tab-${active}`}
        style={stage}
        className="mt-6 grid items-center gap-8 overflow-hidden rounded-[2rem] p-6 sm:rounded-[2.5rem] sm:p-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-10 lg:p-12"
      >
        <div key={`${p.slug}-text`} className="pp-fade">
          {p.logo ? (
            <Image src={p.logo.src} alt={p.logo.alt} width={p.logo.width} height={p.logo.height} className="h-auto w-36 sm:w-40" />
          ) : (
            <p className="font-display text-2xl font-semibold text-[#111]">{p.name}</p>
          )}
          <p className={cn("mt-5 text-2xl leading-tight text-[#111] sm:text-3xl", p.brand ? displayClass : "font-display font-semibold")}>
            {p.line}
          </p>
          <ul className="mt-5 flex flex-wrap gap-2" aria-label="Facts">
            {p.facts.map((f) => (
              <li key={f} className="rounded-full border border-black/10 bg-white/70 px-3 py-1 text-sm font-medium text-[#4A4840]">
                {f}
              </li>
            ))}
          </ul>
          <Link
            href={p.href}
            className="mt-7 inline-flex items-center gap-2 rounded-full bg-[var(--p)] px-5 py-2.5 font-semibold text-white transition-colors hover:bg-[var(--pd)]"
          >
            View product <ArrowRight aria-hidden className="size-4" />
          </Link>
        </div>

        <div key={`${p.slug}-image`} className="pp-fade">
          <Image
            src={p.image.src}
            alt={p.image.alt}
            width={p.image.width}
            height={p.image.height}
            sizes="(min-width: 1024px) 640px, 100vw"
            className={cn(
              "h-auto w-full",
              p.framed && "rounded-xl border border-black/10 shadow-[0_24px_48px_-28px_rgb(15_23_42/0.55)]",
            )}
          />
        </div>
      </div>
    </div>
  );
}
