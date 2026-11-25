"use client";

import { useId, useRef, useState, type KeyboardEvent } from "react";
import Image from "next/image";
import { Check } from "lucide-react";
import type { ProductShowcase } from "@/content/product-showcases";
import { cn } from "@/lib/cn";

/**
 * The product's features as tabs (like the module tabs on nizamio.com): one real interface preview,
 * a short title and four highlights per tab. Arrow keys move between tabs. Colours come from the
 * product's brand (CSS variables set on the stage: --p primary, --pd deep, --pt tint).
 */
export function FeatureTabs({ features, titleClass }: { features: ProductShowcase["features"]; titleClass: string }) {
  const [active, setActive] = useState(0);
  const id = useId();
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const f = features[active];

  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const step = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
    if (!step) return;
    e.preventDefault();
    const next = (active + step + features.length) % features.length;
    setActive(next);
    tabs.current[next]?.focus();
  };

  return (
    <div>
      <div role="tablist" aria-label="Features" onKeyDown={onKey} className="flex flex-wrap justify-center gap-2">
        {features.map((t, i) => (
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
              "inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-sm font-semibold transition-colors",
              i === active
                ? "border-[var(--p)] bg-white text-[var(--pd)] shadow-sm"
                : "border-black/10 bg-white/60 text-[#4A4840] hover:border-black/20 hover:text-[#111]",
            )}
          >
            {t.mascot && <Image src={t.mascot} alt="" width={22} height={22} className="size-[22px]" />}
            {t.name}
            {t.soon && (
              <span className="rounded-full bg-[var(--sun)] px-1.5 py-px text-[10px] font-bold tracking-wide text-[#111] uppercase">
                Soon
              </span>
            )}
          </button>
        ))}
      </div>

      <div
        id={`${id}-panel`}
        role="tabpanel"
        aria-labelledby={`${id}-tab-${active}`}
        className="mt-10 grid items-center gap-10 lg:grid-cols-[1.25fr_1fr] lg:gap-14"
      >
        <div className="rounded-[2rem] bg-[var(--pt)] p-4 sm:p-6">
          <Image
            key={f.slug}
            src={f.image.src}
            alt={f.image.alt}
            width={f.image.width}
            height={f.image.height}
            sizes="(min-width: 1024px) 640px, 100vw"
            className="pp-fade h-auto w-full rounded-2xl shadow-[0_20px_40px_-24px_rgb(22_78_99/0.45)]"
          />
        </div>
        <div key={`${f.slug}-text`} className="pp-fade">
          <p className="text-sm font-semibold tracking-wide text-[var(--p)] uppercase">{f.name}</p>
          <h3 className={cn("mt-2 text-3xl leading-tight text-[#111] sm:text-4xl", titleClass)}>{f.title}</h3>
          <p className="mt-3 text-lg text-[#4A4840]">{f.line}</p>
          <ul className="mt-6 grid gap-2.5 sm:grid-cols-2">
            {f.highlights.map((h) => (
              <li key={h} className="flex items-center gap-2.5 text-[0.9375rem] text-[#111]">
                <span className="grid size-5 shrink-0 place-items-center rounded-full bg-[var(--p)] text-white">
                  <Check aria-hidden className="size-3" strokeWidth={3} />
                </span>
                {h}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
