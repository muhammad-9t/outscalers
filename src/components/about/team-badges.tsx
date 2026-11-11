"use client";

import { useEffect, useRef, useState, type CSSProperties, type PointerEvent, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowUpRight, ChevronLeft, ChevronRight, Mail, MapPin, PencilLine, RotateCcw } from "lucide-react";
import type { TeamMember } from "@/lib/team";
import { StoryWidget } from "@/components/about/story-board";
import { cn } from "@/lib/cn";

/*
 * "Meet the people": ID badges hanging from a garland string, in a slider that takes any number of
 * members (they come from the team editor at /admin/team). Each badge sways, swings when the pointer
 * passes, tilts toward it, and flips in 3D (click / tap / Enter) to a holographic back with the profile,
 * skills, contact and a QR code. The story widget hangs last. Drag, swipe or use the arrows to slide.
 * Hidden for visitors: Ctrl+Shift+E opens the editor, and a logged-in admin sees an "Edit team" button.
 * Styles: .tb-* in globals.css.
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

export function TeamBadges({ team }: { team: TeamMember[] }) {
  const router = useRouter();
  const trackRef = useRef<HTMLUListElement>(null);
  const [edge, setEdge] = useState({ start: true, end: false, progress: 0 });
  const [admin, setAdmin] = useState(false);

  // Admin-only extras: the editor shortcut, and the edit button for a logged-in admin
  useEffect(() => {
    // Reading a cookie after hydration (it isn't known on the server), so this one setState is intended
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setAdmin(/(?:^|;\s*)os_admin_ui=1/.test(document.cookie));
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "e") {
        e.preventDefault();
        router.push("/admin/team");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [router]);

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
      {admin && (
        <Link
          href="/admin/team"
          className="absolute -top-14 right-0 z-10 inline-flex items-center gap-1.5 rounded-full border border-brand-400/50 bg-ink-900/80 px-3 py-1.5 text-xs font-semibold text-brand-300 backdrop-blur hover:bg-ink-800"
        >
          <PencilLine aria-hidden className="size-3.5" /> Edit team
        </Link>
      )}

      <ul
        ref={trackRef}
        aria-label="Team members"
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
          {team.length} people · drag or swipe · click a card to flip
        </p>
        {scrollable && (
          <div className="ml-auto flex items-center gap-3">
            <span aria-hidden className="hidden h-0.5 w-32 overflow-hidden rounded-full bg-line sm:block">
              <span className="block h-full rounded-full bg-brand-400 transition-[width] duration-200" style={{ width: `${Math.max(8, edge.progress * 100)}%` }} />
            </span>
            <SlideButton label="Previous people" disabled={edge.start} onClick={() => slide(-1)}>
              <ChevronLeft aria-hidden className="size-5" />
            </SlideButton>
            <SlideButton label="More people" disabled={edge.end} onClick={() => slide(1)}>
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
  const [flipped, setFlipped] = useState(false);

  const onMove = (e: PointerEvent<HTMLButtonElement>) => {
    if (e.pointerType !== "mouse") return;
    const r = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;
    const el = e.currentTarget;
    el.style.setProperty("--tx", `${(x - 0.5) * 16}deg`);
    el.style.setProperty("--ty", `${(0.5 - y) * 12}deg`);
    el.style.setProperty("--mx", `${x * 100}%`);
    el.style.setProperty("--my", `${y * 100}%`);
  };
  const onLeave = (e: PointerEvent<HTMLButtonElement>) => {
    e.currentTarget.style.setProperty("--tx", "0deg");
    e.currentTarget.style.setProperty("--ty", "0deg");
  };

  return (
        <button
          type="button"
          aria-pressed={flipped}
          aria-label={`${m.name}, ${m.role}. ${flipped ? "Show the front of the card" : "Flip the card for the full profile"}`}
          onClick={() => setFlipped((f) => !f)}
          onPointerMove={onMove}
          onPointerLeave={onLeave}
          className="tb-card group block w-full text-left outline-none"
        >
          <span className={cn("tb-inner", flipped && "is-flipped")}>
            {/* Front */}
            <span className="tb-face tb-front flex flex-col rounded-[1.1rem] border border-line bg-ink-850 p-3.5">
              <span className="flex items-center justify-between font-mono text-[10px] tracking-[0.16em] text-fg-subtle uppercase">
                <span>People · Studio</span>
                <span>#{no}</span>
              </span>
              <MemberAvatar member={m} className="mt-2.5 aspect-square w-full rounded-xl" />
              <span className="mt-3.5 block font-display text-lg leading-tight font-semibold text-fg">{m.name}</span>
              <span className="mt-0.5 block text-sm text-fg-muted">{m.role}</span>
              <span className="mt-4 flex items-center justify-between border-t border-line pt-3">
                <span className="font-mono text-[10px] tracking-[0.16em] text-fg-subtle uppercase">View profile</span>
                <span className="grid size-7 place-items-center rounded-full bg-fg text-ink-950 transition-transform duration-300 group-hover:rotate-45">
                  <ArrowUpRight aria-hidden className="size-3.5" />
                </span>
              </span>
            </span>

            {/* Back: holographic profile */}
            <span className="tb-face tb-back flex flex-col rounded-[1.1rem] p-3.5">
              <span className="tb-sheen" aria-hidden />
              <span className="relative flex items-center justify-between font-mono text-[10px] tracking-[0.16em] uppercase opacity-70">
                <span>Profile / {no}</span>
                <RotateCcw aria-hidden className="size-3.5" />
              </span>
              <span className="relative mt-3 flex items-center gap-2.5">
                <MemberAvatar member={m} className="size-10 shrink-0 rounded-lg" />
                <span className="min-w-0">
                  <span className="block truncate font-display text-[0.95rem] leading-tight font-semibold">{m.name}</span>
                  <span className="block truncate text-xs opacity-75">{m.role}</span>
                </span>
              </span>
              <span className="relative mt-2 flex items-center gap-1 text-xs opacity-75">
                <MapPin aria-hidden className="size-3" />
                {m.location}
              </span>
              <span className="relative mt-3 block text-[0.8125rem] leading-snug">{m.bio}</span>
              <span className="relative mt-3 block font-mono text-[9.5px] tracking-[0.16em] uppercase opacity-60">
                Selected skills
              </span>
              <span className="relative mt-1.5 flex flex-wrap gap-1">
                {m.skills.map((s) => (
                  <span key={s} className="rounded-full border border-current/20 px-2 py-0.5 text-[11px]">
                    {s}
                  </span>
                ))}
              </span>
              <span className="relative mt-auto flex items-end justify-between gap-2 pt-3">
                <span className="min-w-0">
                  <span className="block font-mono text-[9.5px] tracking-[0.16em] uppercase opacity-60">Let&apos;s connect</span>
                  <span className="mt-1 flex items-center gap-1 truncate text-xs">
                    <Mail aria-hidden className="size-3 shrink-0" />
                    <span className="truncate">{m.email}</span>
                  </span>
                </span>
                <Qr seed={m.id + m.role} />
              </span>
            </span>
          </span>
        </button>
  );
}

/** Drawn avatar (head and shoulders) on a tinted tile, until a real photo is added. */
export function MemberAvatar({ member: m, className }: { member: TeamMember; className?: string }) {
  const tone = TONE[m.tone];
  if (m.photo) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={m.photo} alt="" className={cn("object-cover", className)} />;
  }
  return (
    <span
      aria-hidden
      className={cn("relative block overflow-hidden", className)}
      style={{ background: `linear-gradient(160deg, color-mix(in oklab, ${tone} 34%, transparent), color-mix(in oklab, ${tone} 12%, transparent))` }}
    >
      <svg viewBox="0 0 100 100" className="absolute inset-0 size-full">
        <circle cx="50" cy="40" r="17" style={{ fill: `color-mix(in oklab, ${tone} 75%, var(--color-ink-850))` }} />
        <path d="M18 100c2-20 15-32 32-32s30 12 32 32Z" style={{ fill: `color-mix(in oklab, ${tone} 60%, var(--color-ink-850))` }} />
      </svg>
    </span>
  );
}

const QR_N = 17;

/** Cells of a QR-style pattern: the same every time for a given seed (a small xorshift generator). */
function qrCells(seed: string) {
  let h = 2166136261;
  for (const c of seed) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  const finder = (x: number, y: number) => x < 7 && y < 7;
  const cells: [number, number][] = [];
  for (let y = 0; y < QR_N; y++)
    for (let x = 0; x < QR_N; x++) {
      h ^= h << 13;
      h ^= h >>> 17;
      h ^= h << 5;
      if (finder(x, y) || finder(QR_N - 1 - x, y) || finder(x, QR_N - 1 - y)) continue;
      if ((h >>> 0) % 1000 > 500) cells.push([x, y]);
    }
  return cells;
}

function QrFinder({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x="0.5" y="0.5" width="6" height="6" fill="none" stroke="currentColor" strokeWidth="1" />
      <rect x="2" y="2" width="3" height="3" fill="currentColor" />
    </g>
  );
}

/** A small QR-style mark (decorative). */
function Qr({ seed }: { seed: string }) {
  const N = QR_N;
  const cells = qrCells(seed);
  return (
    <svg aria-hidden viewBox={`0 0 ${N} ${N}`} className="size-12 shrink-0 rounded-sm bg-white/70 p-0.5" shapeRendering="crispEdges">
      <QrFinder x={0} y={0} />
      <QrFinder x={N - 7} y={0} />
      <QrFinder x={0} y={N - 7} />
      {cells.map(([x, y]) => (
        <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" fill="currentColor" />
      ))}
    </svg>
  );
}
