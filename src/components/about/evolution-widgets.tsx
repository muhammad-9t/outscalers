"use client";

import { type CSSProperties, type ReactNode, type RefObject, useEffect, useRef } from "react";
import {
  Bot,
  Building2,
  CalendarCheck,
  Check,
  Cloud,
  CodeXml,
  Globe2,
  Handshake,
  KanbanSquare,
  Laptop,
  MapPin,
  MessageSquareText,
  Rocket,
  ShieldCheck,
  Smartphone,
  Sparkles,
  UserRound,
  Users,
  Video,
  Wifi,
  type LucideIcon,
} from "lucide-react";
import { useTilt } from "./use-tilt";

/**
 * "Our evolution" visual: one scene of widgets per chapter (2017 → today), built from the same
 * glass cards and glossy tiles as the About hero. On large screens the scene follows the scroll
 * position (progressRef) and the next chapter springs in as the previous one fades; on small
 * screens each chapter card shows its own scene (stage). Tilts with the mouse.
 * Styles: .aj-* (shared with the hero) and .evw-* in globals.css.
 */

type Tone = "human" | "brand" | "data" | "muted";
type Tile = { icon: LucideIcon; x: number; y: number; z: number; tone: Tone };

const Icon = ({ icon: I, tone, solid }: { icon: LucideIcon; tone?: Tone; solid?: boolean }) => (
  <span className={solid ? "aj-icon aj-icon-solid" : "aj-icon"} data-tone={tone}>
    <I className="size-4" />
  </span>
);
const Card = ({ pos, z, i, children, accent }: { pos: "a" | "b" | "c"; z: number; i: number; children: ReactNode; accent?: boolean }) => (
  <div className={`aj-card evw-${pos}${accent ? " evw-accent" : ""}`} style={{ "--z": `${z}px`, "--i": i } as CSSProperties}>
    {children}
  </div>
);
const Head = ({ year, icon, tone, live }: { year: string; icon: LucideIcon; tone: Tone; live?: boolean }) => (
  <div className="flex items-center justify-between">
    <span className={live ? "aj-year aj-live" : "aj-year"}>{year}</span>
    <Icon icon={icon} tone={tone} />
  </div>
);
const Bar = ({ w, tone, i = 0 }: { w: string; tone: Tone; i?: number }) => (
  <span className="aj-bar" data-tone={tone} style={{ "--w": w, "--i": i } as CSSProperties} />
);
const Avatars = ({ tones }: { tones: Tone[] }) => (
  <span className="flex -space-x-2">
    {tones.map((t, k) => (
      <span key={k} className="evw-avatar" data-tone={t}>
        <UserRound className="size-3.5" />
      </span>
    ))}
  </span>
);

const scenes: { tiles: Tile[]; cards: ReactNode }[] = [
  // 2017 · The beginning
  {
    tiles: [
      { icon: CodeXml, x: 82, y: 2, z: 110, tone: "data" },
      { icon: Smartphone, x: 0, y: 54, z: 110, tone: "human" },
      { icon: Globe2, x: 85, y: 80, z: 110, tone: "brand" },
    ],
    cards: (
      <>
        <Card pos="a" z={-40} i={0}>
          <Head year="2017" icon={UserRound} tone="human" />
          <p className="mt-2 font-semibold">Freelance developer</p>
          <p className="text-sm text-fg-muted">Web &amp; mobile solutions</p>
          <span className="mt-2.5 block space-y-1.5">
            <span className="aj-code" data-tone="data" style={{ width: "62%" }} />
            <span className="aj-code" data-tone="muted" style={{ width: "84%" }} />
            <span className="aj-code" data-tone="brand" style={{ width: "40%" }} />
          </span>
        </Card>
        <Card pos="b" z={0} i={1}>
          <Head year="Clients" icon={Globe2} tone="brand" />
          <p className="mt-2 font-semibold">International relationships</p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            <span className="aj-chip">Web apps</span>
            <span className="aj-chip">Mobile apps</span>
          </div>
        </Card>
        <Card pos="c" z={60} i={2} accent>
          <div className="flex items-center gap-3">
            <Icon icon={Check} solid />
            <span className="flex-1">
              <span className="block font-semibold">Project delivered</span>
              <span className="block text-sm text-fg-muted">Quality work, reliable delivery</span>
            </span>
          </div>
          <Bar w="100%" tone="brand" />
        </Card>
      </>
    ),
  },
  // 2020 · Adapting through COVID-19
  {
    tiles: [
      { icon: Wifi, x: 2, y: 4, z: 110, tone: "human" },
      { icon: Laptop, x: 86, y: 44, z: 110, tone: "data" },
      { icon: Cloud, x: 4, y: 84, z: 110, tone: "brand" },
    ],
    cards: (
      <>
        <Card pos="a" z={-40} i={0}>
          <Head year="2020" icon={Video} tone="human" />
          <p className="mt-2 font-semibold">Daily stand-up</p>
          <div className="mt-2.5 flex items-center justify-between">
            <Avatars tones={["human", "brand", "data", "human"]} />
            <span className="evw-live">Online</span>
          </div>
        </Card>
        <Card pos="b" z={0} i={1}>
          <Head year="Shift" icon={Cloud} tone="brand" />
          <p className="mt-2 font-semibold">Going digital</p>
          <p className="text-sm text-fg-muted">Remote work &amp; transformation</p>
          <Bar w="78%" tone="brand" />
        </Card>
        <Card pos="c" z={60} i={2} accent>
          <p className="font-semibold">Remote collaboration</p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            <span className="aj-chip">Video calls</span>
            <span className="aj-chip">Cloud tools</span>
            <span className="aj-chip">Async updates</span>
          </div>
        </Card>
      </>
    ),
  },
  // 2021–22 · Growing beyond freelancing
  {
    tiles: [
      { icon: Users, x: 2, y: 8, z: 110, tone: "human" },
      { icon: KanbanSquare, x: 87, y: 30, z: 110, tone: "data" },
      { icon: Handshake, x: 2, y: 84, z: 110, tone: "brand" },
    ],
    cards: (
      <>
        <Card pos="a" z={-40} i={0}>
          <Head year="2021–22" icon={Users} tone="human" />
          <p className="mt-2 font-semibold">Project team</p>
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            <span className="aj-chip">Developers</span>
            <span className="aj-chip">Specialists</span>
          </div>
        </Card>
        <Card pos="b" z={0} i={1}>
          <Head year="Sprint" icon={KanbanSquare} tone="data" />
          <div className="mt-3 grid grid-cols-3 gap-2">
            {(
              [
                ["To do", 2, "muted"],
                ["Doing", 2, "brand"],
                ["Done", 3, "human"],
              ] as const
            ).map(([label, n, tone]) => (
              <span key={label} className="block">
                <span className="block font-mono text-xs text-fg-subtle">{label}</span>
                <span className="mt-1.5 block space-y-1">
                  {Array.from({ length: n }, (_, k) => (
                    <span key={k} className="evw-ticket" data-tone={tone} />
                  ))}
                </span>
              </span>
            ))}
          </div>
        </Card>
        <Card pos="c" z={60} i={2} accent>
          <div className="flex items-center gap-3">
            <Icon icon={CalendarCheck} tone="brand" />
            <span className="flex-1">
              <span className="block font-semibold">Larger solutions</span>
              <span className="block text-sm text-fg-muted">Team delivery &amp; long-term support</span>
            </span>
          </div>
        </Card>
      </>
    ),
  },
  // 2023 · Outscalers takes shape
  {
    tiles: [
      { icon: Building2, x: 3, y: 6, z: 110, tone: "brand" },
      { icon: Globe2, x: 89, y: 46, z: 110, tone: "data" },
      { icon: Rocket, x: 90, y: 74, z: 110, tone: "brand" },
    ],
    cards: (
      <>
        <Card pos="a" z={-40} i={0}>
          <Head year="2023" icon={MapPin} tone="brand" />
          <p className="mt-2 font-semibold">Outscalers founded</p>
          <p className="text-sm text-fg-muted">Rawalpindi, Pakistan</p>
        </Card>
        <Card pos="b" z={0} i={1}>
          <Head year="Talent" icon={Users} tone="human" />
          <p className="mt-2 font-semibold">Engineering teams</p>
          <div className="mt-3 flex items-center gap-2">
            <span className="aj-chip">Germany</span>
            <span className="evw-link" />
            <span className="aj-chip">Pakistan</span>
          </div>
        </Card>
        <Card pos="c" z={60} i={2} accent>
          <div className="flex items-end justify-between gap-4">
            <span>
              <span className="block font-semibold">Scalable solutions</span>
              <span className="block text-sm text-fg-muted">Development &amp; outsourcing partner</span>
            </span>
            <span className="evw-chart" aria-hidden>
              {[35, 50, 62, 80, 100].map((h) => (
                <span key={h} style={{ height: `${h}%` }} />
              ))}
            </span>
          </div>
        </Card>
      </>
    ),
  },
  // Today · AI-powered engineering
  {
    tiles: [
      { icon: Sparkles, x: 88, y: 6, z: 110, tone: "brand" },
      { icon: Bot, x: 0, y: 40, z: 110, tone: "data" },
      { icon: ShieldCheck, x: 86, y: 84, z: 110, tone: "human" },
    ],
    cards: (
      <>
        <Card pos="a" z={-40} i={0}>
          <Head year="Today" icon={Sparkles} tone="brand" live />
          <ul className="mt-3 space-y-2.5 text-sm">
            <li className="aj-row">
              <Icon icon={UserRound} tone="human" />
              <span className="flex-1">
                Engineer
                <Bar w="92%" tone="human" />
              </span>
            </li>
            <li className="aj-row">
              <Icon icon={Sparkles} tone="brand" />
              <span className="flex-1">
                AI assist
                <Bar w="74%" tone="brand" i={1} />
              </span>
            </li>
          </ul>
        </Card>
        <Card pos="b" z={0} i={1}>
          <Head year="LLM" icon={MessageSquareText} tone="data" />
          <span className="mt-3 block space-y-2">
            <span className="evw-bubble">
              <span style={{ width: "70%" }} />
            </span>
            <span className="evw-bubble evw-bubble-ai">
              <Sparkles className="size-3.5 shrink-0" />
              <span style={{ width: "85%" }} />
            </span>
          </span>
        </Card>
        <Card pos="c" z={60} i={2} accent>
          <div className="flex items-center gap-3">
            <Icon icon={ShieldCheck} solid />
            <span className="flex-1">
              <span className="block font-semibold">Shipped with confidence</span>
              <span className="mt-2 flex flex-wrap gap-1.5">
                <span className="aj-chip">Reviewed</span>
                <span className="aj-chip">Tested</span>
                <span className="aj-chip">Secure</span>
              </span>
            </span>
          </div>
        </Card>
      </>
    ),
  },
];

export function EvolutionWidgets({
  progressRef,
  stage,
  className,
}: {
  progressRef?: RefObject<number>;
  stage?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const tiltRef = useRef<HTMLDivElement>(null);
  useTilt(ref, tiltRef);

  // Large screens: show the chapter nearest the scroll position (checked on scroll, not every frame)
  useEffect(() => {
    const root = ref.current;
    if (!root || !progressRef) return;
    const scenesEls = Array.from(root.querySelectorAll<HTMLElement>(".evw-scene"));
    let current = -1;
    let raf = 0;
    const check = () => {
      raf = 0;
      const active = Math.round(progressRef.current ?? 0);
      if (active === current) return;
      current = active;
      scenesEls.forEach((el, i) => el.toggleAttribute("data-active", i === active));
    };
    // Two frames: the journey updates the progress in its own frame first, then we read it
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(() => (raf = requestAnimationFrame(check)));
    };
    check();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
    };
  }, [progressRef]);

  const only = stage === undefined ? undefined : stage;
  return (
    <div ref={ref} aria-hidden className={`aj evw ${className ?? ""}`}>
      <div ref={tiltRef} className="aj-tilt">
      {scenes.map((s, i) =>
        only !== undefined && only !== i ? null : (
          <div key={i} className="aj-scene evw-scene" data-layout={i} data-active={only !== undefined || i === 0 ? "" : undefined}>
            <span className="aj-glow aj-glow-a" />
            <span className="aj-glow aj-glow-b" />
            {s.cards}
            {s.tiles.map((t, k) => (
              <span
                key={k}
                className="aj-tile"
                data-tone={t.tone}
                style={{ "--x": `${t.x}%`, "--y": `${t.y}%`, "--z": `${t.z}px`, "--i": k } as CSSProperties}
              >
                <t.icon className="size-[48%]" strokeWidth={1.8} />
              </span>
            ))}
          </div>
        ),
      )}
      </div>
    </div>
  );
}
