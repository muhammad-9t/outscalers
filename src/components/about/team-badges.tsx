"use client";

import { useEffect, useRef, useState, type CSSProperties, type PointerEvent, type ReactNode } from "react";
import {
  Brain,
  ChevronLeft,
  ChevronRight,
  Cloud,
  Compass,
  Cpu,
  KanbanSquare,
  Layers,
  LockKeyhole,
  Palette,
  Route,
  ShieldCheck,
  Smartphone,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import type { TeamIcon, TeamMember } from "@/lib/team";
import { Reveal } from "@/components/ui/primitives";
import { StoryWidget } from "@/components/about/story-board";
import { cn } from "@/lib/cn";

/*
 * Leadership badges hanging from a garland string, in a slider. Each badge sways, swings when the
 * pointer passes and tilts toward it. Roles only: no names, photos or contact details. The story
 * widget hangs last. Also exports the specialist teams grid. Styles: .tb-* in globals.css.
 */

// The string sags 24px between hang points; thread lengths vary for the hand-hung look
const SAG = 24;
const DROP = [44, 76, 52, 70, 48, 62];

const TONE: Record<TeamMember["tone"], string> = {
  brand: "var(--color-brand-400)",
  human: "var(--color-human-accent)",
  data: "var(--color-data-accent)",
  amber: "var(--color-signal)",
};

const ICONS: Record<TeamIcon, LucideIcon> = {
  compass: Compass,
  cpu: Cpu,
  route: Route,
  sparkles: Sparkles,
  layers: Layers,
  smartphone: Smartphone,
  brain: Brain,
  cloud: Cloud,
  shield: ShieldCheck,
  lock: LockKeyhole,
  palette: Palette,
  kanban: KanbanSquare,
};

export function TeamBadges({ team }: { team: TeamMember[] }) {
  const trackRef = useRef<HTMLUListElement>(null);
  const [edge, setEdge] = useState({ start: true, end: false, progress: 0 });

  // Track where the slider is, for the arrows and the progress bar
  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const update = () => {
      const max = el.scrollWidth - el.clientWidth;
      setEdge({ start: el.scrollLeft < 4, end: el.scrollLeft > max - 4, progress: max > 0 ? el.scrollLeft / max : 1 });
    };
    update();
    el.addEventListener("scroll", update, { passive: true });
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", update);
      ro.disconnect();
    };
  }, []);

  const slide = (dir: 1 | -1) => {
    const el = trackRef.current;
    if (!el) return;
    const card = el.querySelector("li");
    const step = card ? card.getBoundingClientRect().width + 20 : el.clientWidth * 0.8;
    el.scrollBy({ left: dir * step * Math.max(1, Math.floor(el.clientWidth / step) - 1), behavior: "smooth" });
  };

  // Mouse drag to slide; a drag never counts as a click on a card
  const drag = useRef({ down: false, x: 0, left: 0, moved: false });
  const onDown = (e: PointerEvent<HTMLUListElement>) => {
    if (e.pointerType !== "mouse" || e.button !== 0) return;
    drag.current = { down: true, x: e.clientX, left: e.currentTarget.scrollLeft, moved: false };
  };
  const onMove = (e: PointerEvent<HTMLUListElement>) => {
    const d = drag.current;
    if (!d.down) return;
    const dx = e.clientX - d.x;
    if (Math.abs(dx) > 6) d.moved = true;
    if (d.moved) e.currentTarget.scrollLeft = d.left - dx;
  };
  const onUp = () => {
    drag.current.down = false;
  };

  const scrollable = !(edge.start && edge.end);

  return (
    <div className="relative">
      <ul
        ref={trackRef}
        aria-label="Leadership"
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerLeave={onUp}
        onClickCapture={(e) => {
          if (drag.current.moved) {
            e.stopPropagation();
            e.preventDefault();
            drag.current.moved = false;
          }
        }}
        className={cn(
          "tb-track flex snap-x snap-mandatory gap-5 overflow-x-auto overscroll-x-contain px-5 pb-10",
          scrollable && "cursor-grab active:cursor-grabbing",
          scrollable && !edge.start && !edge.end && "tb-fade-both",
          scrollable && edge.start && "tb-fade-end",
          scrollable && edge.end && !edge.start && "tb-fade-start",
        )}
      >
        {team.map((m, i) => (
          <li key={m.id} className="relative w-60 shrink-0 snap-start sm:w-64">
            <Garland first={i === 0} />
            <Hanger index={i}>
              <Badge member={m} number={i + 1} />
            </Hanger>
          </li>
        ))}
        {/* The story widget hangs last, and opens the story board */}
        <li className="relative w-60 shrink-0 snap-start sm:w-64">
          <Garland first={team.length === 0} last />
          <Hanger index={team.length}>
            <StoryWidget />
          </Hanger>
        </li>
      </ul>

      <div className="mt-2 flex flex-wrap items-center gap-4">
        <p className="font-mono text-[11px] tracking-[0.18em] text-fg-subtle uppercase">
          Leadership · drag or swipe
        </p>
        {scrollable && (
          <div className="ml-auto flex items-center gap-3">
            <span aria-hidden className="hidden h-0.5 w-32 overflow-hidden rounded-full bg-line sm:block">
              <span className="block h-full rounded-full bg-brand-400 transition-[width] duration-200" style={{ width: `${Math.max(8, edge.progress * 100)}%` }} />
            </span>
            <SlideButton label="Previous" disabled={edge.start} onClick={() => slide(-1)}>
              <ChevronLeft aria-hidden className="size-5" />
            </SlideButton>
            <SlideButton label="Next" disabled={edge.end} onClick={() => slide(1)}>
              <ChevronRight aria-hidden className="size-5" />
            </SlideButton>
          </div>
        )}
      </div>
    </div>
  );
}

function SlideButton({ label, children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { label: string }) {
  return (
    <button
      type="button"
      className="grid size-11 place-items-center rounded-full border border-line-strong text-fg transition-colors hover:border-brand-400/60 disabled:opacity-30"
      {...props}
    >
      <span className="sr-only">{label}</span>
      {children}
    </button>
  );
}

/** One span of the garland string: it sags across this card and joins the next card's span. */
function Garland({ first, last }: { first?: boolean; last?: boolean }) {
  return (
    <>
      <svg
        aria-hidden
        viewBox="0 0 100 40"
        preserveAspectRatio="none"
        className="pointer-events-none absolute top-0 -left-2.5 h-10 w-[calc(100%+1.25rem)] overflow-visible"
      >
        <path d="M0 2 Q50 46 100 2" className="fill-none stroke-fg-subtle/60" strokeWidth={1.5} vectorEffect="non-scaling-stroke" />
      </svg>
      {first && <span aria-hidden className="absolute -top-0.5 -left-4 size-2.5 rounded-full border-2 border-fg-subtle/70 bg-ink-950" />}
      {last && <span aria-hidden className="absolute -top-0.5 -right-4 size-2.5 rounded-full border-2 border-fg-subtle/70 bg-ink-950" />}
    </>
  );
}

/** A thread from the string, a clip and whatever card hangs from it. It sways, and swings when the mouse arrives. */
function Hanger({ index: i, children }: { index: number; children: ReactNode }) {
  const swingRef = useRef<HTMLDivElement>(null);
  const swing = (e: PointerEvent<HTMLDivElement>) => {
    const el = swingRef.current;
    if (e.pointerType !== "mouse" || !el) return;
    // Restart the swing on every pass
    el.classList.remove("is-swinging");
    void el.offsetWidth;
    el.classList.add("is-swinging");
  };
  return (
    <div
      className="tb-hanger"
      style={
        {
          marginTop: `${SAG}px`,
          "--drop": `${DROP[i % DROP.length]}px`,
          "--sway-delay": `${-i * 1.3}s`,
          "--sway-dur": `${5.5 + (i % 3) * 0.8}s`,
        } as CSSProperties
      }
    >
      <div ref={swingRef} className="tb-swing" onPointerEnter={swing}>
        {/* Thread from the string down to the clip */}
        <span aria-hidden className="tb-thread mx-auto block w-px bg-fg-subtle/60" />
        <span aria-hidden className="tb-clip relative z-10 mx-auto -mb-2.5 block h-5 w-7 rounded-md border border-line-strong bg-ink-800">
          <span className="absolute inset-x-1.5 top-1.5 h-1 rounded-full bg-fg-subtle/50" />
        </span>
        {children}
      </div>
    </div>
  );
}

function Badge({ member: m, number }: { member: TeamMember; number: number }) {
  const no = String(number).padStart(2, "0");

  // Tilts toward the pointer (decorative)
  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "mouse") return;
    const r = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;
    e.currentTarget.style.setProperty("--tx", `${(x - 0.5) * 16}deg`);
    e.currentTarget.style.setProperty("--ty", `${(0.5 - y) * 12}deg`);
  };
  const onLeave = (e: PointerEvent<HTMLDivElement>) => {
    e.currentTarget.style.setProperty("--tx", "0deg");
    e.currentTarget.style.setProperty("--ty", "0deg");
  };

  return (
    <div onPointerMove={onMove} onPointerLeave={onLeave} className="tb-card block w-full text-left">
      <div className="tb-inner">
        <div className="tb-face tb-front flex flex-col rounded-[1.1rem] border border-line bg-ink-850 p-3.5">
          <span className="flex items-center justify-between font-mono text-[10px] tracking-[0.16em] text-fg-subtle uppercase">
            <span>Leadership</span>
            <span>#{no}</span>
          </span>
          <MemberAvatar member={m} className="mt-2.5 aspect-[4/3] w-full rounded-xl" />
          <h3 className="mt-3.5 font-display text-lg leading-tight font-semibold text-fg">{m.role}</h3>
          <p className="mt-1.5 text-sm leading-snug text-fg-muted">{m.bio}</p>
        </div>
      </div>
    </div>
  );
}

/** The role's icon on a tinted tile (used on the badges and in the product stories). */
export function MemberAvatar({ member: m, className }: { member: TeamMember; className?: string }) {
  const tone = TONE[m.tone];
  const Icon = ICONS[m.icon];
  return (
    <span
      aria-hidden
      className={cn("grid place-items-center overflow-hidden", className)}
      style={{
        color: tone,
        background: `linear-gradient(160deg, color-mix(in oklab, ${tone} 30%, transparent), color-mix(in oklab, ${tone} 10%, transparent))`,
      }}
    >
      <Icon className="size-[42%] max-h-12 max-w-12" strokeWidth={1.7} />
    </span>
  );
}

/** The specialist teams: a simple grid of role cards. */
export function TeamGrid({ team }: { team: TeamMember[] }) {
  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {team.map((m, i) => (
        <Reveal as="li" key={m.id} delay={i * 50} className="card flex gap-4 p-5">
          <MemberAvatar member={m} className="size-11 shrink-0 rounded-xl" />
          <div className="min-w-0">
            <h3 className="font-semibold leading-snug">{m.role}</h3>
            <p className="mt-1 text-sm leading-relaxed text-fg-muted">{m.bio}</p>
          </div>
        </Reveal>
      ))}
    </ul>
  );
}
