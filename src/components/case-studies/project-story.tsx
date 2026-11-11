"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import Link from "next/link";
import { ArrowRight, CalendarCheck, Flag, GitCommitHorizontal, GitPullRequest, Palette, Rocket, Sparkles } from "lucide-react";
import type { Milestone, ProjectStory as Story, StoryKind } from "@/content/project-stories";
import type { TeamMember } from "@/lib/team";
import { MemberAvatar } from "@/components/about/team-badges";
import { cn } from "@/lib/cn";

/*
 * Project story: a pinned section that slides sideways as the page scrolls down. A line draws itself
 * across the screen (a wave, a rounded zigzag or a looping line, per project) and each milestone card
 * swings into place as the line reaches it: kickoff, design sign-off, commits, reviews, deadlines, launch,
 * with the people who did it. Large screens only; elsewhere (and for reduced motion) it is a vertical
 * timeline. Styles: .ps-* in globals.css.
 */

const QUERY = "(min-width: 64rem) and (prefers-reduced-motion: no-preference)";

// Track geometry (px, before the fit-to-height scale)
const H = 700;
const MID = 350;
const INTRO = 480;
const STEP = 360;
const OUTRO = 460;
const AMP = 70;
const CARD_GAP = 34;

const KIND: Record<StoryKind, { label: string; Icon: typeof Flag; tone: string }> = {
  kickoff: { label: "Kickoff", Icon: Flag, tone: "var(--color-brand-400)" },
  design: { label: "Design", Icon: Palette, tone: "var(--color-data-accent)" },
  commit: { label: "Code", Icon: GitCommitHorizontal, tone: "var(--color-human-accent)" },
  review: { label: "Pushed & reviewed", Icon: GitPullRequest, tone: "var(--color-human-accent)" },
  deadline: { label: "Deadline", Icon: CalendarCheck, tone: "var(--color-signal)" },
  launch: { label: "Launch", Icon: Rocket, tone: "var(--color-brand-400)" },
  release: { label: "Release", Icon: Sparkles, tone: "var(--color-brand-400)" },
};

type Node = { x: number; y: number; up: boolean };

/** Builds the line and where each milestone sits on it. */
/** `lead` is where the page's content column starts, so the intro lines up with the rest of the page. */
function geometry(style: Story["line"], count: number, lead: number) {
  const start = lead + INTRO;
  const x0 = start - 140;
  const x1 = start + count * STEP + 140;
  const xs = Array.from({ length: count }, (_, i) => start + STEP / 2 + i * STEP);
  const nodes: Node[] = [];
  let d = "";

  if (style === "wave") {
    // A smooth wave whose crests and troughs land on the milestones
    const y = (x: number) => MID + AMP * Math.sin((Math.PI * (x - xs[0])) / STEP - Math.PI / 2);
    d = `M${x0} ${y(x0).toFixed(1)}`;
    for (let x = x0 + 6; x <= x1; x += 6) d += ` L${x} ${y(x).toFixed(1)}`;
    xs.forEach((x) => nodes.push({ x, y: y(x), up: y(x) < MID }));
  } else if (style === "zigzag") {
    // Straight runs with rounded turns at each milestone
    const pts = [{ x: x0, y: MID }, ...xs.map((x, i) => ({ x, y: MID + (i % 2 ? AMP : -AMP) })), { x: x1, y: MID }];
    d = `M${pts[0].x} ${pts[0].y}`;
    const R = 46;
    for (let k = 1; k < pts.length - 1; k++) {
      const [a, n, b] = [pts[k - 1], pts[k], pts[k + 1]];
      const la = Math.hypot(n.x - a.x, n.y - a.y);
      const lb = Math.hypot(b.x - n.x, b.y - n.y);
      const p = { x: n.x - ((n.x - a.x) / la) * R, y: n.y - ((n.y - a.y) / la) * R };
      const q = { x: n.x + ((b.x - n.x) / lb) * R, y: n.y + ((b.y - n.y) / lb) * R };
      d += ` L${p.x.toFixed(1)} ${p.y.toFixed(1)} Q${n.x} ${n.y} ${q.x.toFixed(1)} ${q.y.toFixed(1)}`;
      // The marker sits on the rounded tip
      nodes.push({ x: (p.x + 2 * n.x + q.x) / 4, y: (p.y + 2 * n.y + q.y) / 4, up: n.y < MID });
    }
    d += ` L${x1} ${MID}`;
  } else {
    // A gentle wave that ties a loop at every milestone
    const A = 34;
    const R = 26;
    const y = (x: number) => MID + A * Math.sin((Math.PI * (x - xs[0])) / STEP - Math.PI / 2);
    d = `M${x0} ${y(x0).toFixed(1)}`;
    let from = x0;
    xs.forEach((x) => {
      for (let t = from + 6; t < x; t += 6) d += ` L${t} ${y(t).toFixed(1)}`;
      const ny = y(x);
      const up = ny < MID;
      // The loop curls toward the centre line; the card hangs on the outside
      const s = up ? 1 : -1;
      d += ` L${x} ${ny.toFixed(1)} a${R} ${R} 0 1 1 0 ${2 * R * s} a${R} ${R} 0 1 1 0 ${-2 * R * s}`;
      nodes.push({ x, y: ny, up });
      from = x;
    });
    for (let t = from + 6; t <= x1; t += 6) d += ` L${t} ${y(t).toFixed(1)}`;
  }
  return { d, nodes, x0, x1, width: x1 + OUTRO };
}

export function ProjectStory({ story, people, project }: { story: Story; people: TeamMember[]; project: string }) {
  const [on, setOn] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(QUERY);
    const sync = () => setOn(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  const byId = useMemo(() => new Map(people.map((p) => [p.id, p])), [people]);
  const cast = (m: Milestone) => m.people.map((id) => byId.get(id)).filter((p): p is TeamMember => Boolean(p));

  return on ? (
    <Pinned story={story} cast={cast} project={project} />
  ) : (
    <Vertical story={story} cast={cast} project={project} />
  );
}

type Props = { story: Story; cast: (m: Milestone) => TeamMember[]; project: string };

function Pinned({ story, cast, project }: Props) {
  const outer = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const path = useRef<SVGPathElement>(null);
  const head = useRef<SVGGElement>(null);
  const ticker = useRef<HTMLParagraphElement>(null);
  // Left edge of the content column (max 80rem wide, 1.5rem gutters), in unscaled track px
  const [lead, setLead] = useState(24);
  useEffect(() => {
    const fit = () => {
      const scale = Math.min(1, (window.innerHeight - 24) / H);
      const next = Math.round(Math.max(24, (window.innerWidth / scale - 1280) / 2 + 24));
      setLead((l) => (Math.abs(l - next) > 1 ? next : l));
    };
    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, []);
  const g = useMemo(() => geometry(story.line, story.milestones.length, lead), [story, lead]);

  useEffect(() => {
    const o = outer.current;
    const t = track.current;
    const p = path.current;
    if (!o || !t || !p) return;
    const total = p.getTotalLength();
    // Lookup from length along the line to x, so the line draws exactly up to the reading head
    const table: { len: number; x: number }[] = [];
    let maxX = -Infinity;
    for (let i = 0; i <= 400; i++) {
      const len = (i / 400) * total;
      maxX = Math.max(maxX, p.getPointAtLength(len).x);
      table.push({ len, x: maxX });
    }
    const lenAt = (x: number) => {
      if (x <= table[0].x) return 0;
      for (let i = 1; i < table.length; i++) if (table[i].x >= x) return table[i].len;
      return total;
    };
    const cards = [...t.querySelectorAll<HTMLElement>("[data-ps-card]")];
    const dots = [...t.querySelectorAll<SVGGElement>("[data-ps-node]")];

    let scale = 1;
    let distance = 0;
    let room = 0;
    let frame = 0;
    let immersive = false;
    const root = document.documentElement;
    let shown = -2;

    const measure = () => {
      scale = Math.min(1, (window.innerHeight - 24) / H);
      if (stage.current) stage.current.style.transform = `scale(${scale})`;
      distance = Math.max(0, g.width * scale - window.innerWidth);
      // Always some scroll room, so the line still draws on very wide screens
      o.style.height = `${window.innerHeight + Math.max(distance, window.innerHeight)}px`;
      room = Math.max(distance, window.innerHeight);
      update();
    };

    const update = () => {
      frame = 0;
      const box = o.getBoundingClientRect();
      const prog = room ? Math.min(1, Math.max(0, -box.top / room)) : 0;
      // While the story is pinned, the site header slides away so nothing covers the top cards
      const pinned = box.top <= 1 && box.bottom >= window.innerHeight - 1;
      if (pinned !== immersive) {
        immersive = pinned;
        if (pinned) root.dataset.immersive = "";
        else delete root.dataset.immersive;
      }
      const tx = prog * distance;
      t.style.transform = `translate3d(${-tx}px,0,0)`;
      // The reading head sits a little right of centre; at the very end it runs to the finish
      // The reading head: just right of centre while sliding, and always reaching the finish by the end
      const onScreen = (tx + window.innerWidth * 0.64) / scale;
      const sweep = g.x0 + prog * (g.x1 + 200 - g.x0);
      const reach = Math.min(Math.max(onScreen, sweep), (tx + window.innerWidth) / scale);
      const len = lenAt(reach);
      p.style.strokeDashoffset = String(1 - len / total);
      const pt = p.getPointAtLength(len);
      if (head.current) head.current.setAttribute("transform", `translate(${pt.x.toFixed(1)} ${pt.y.toFixed(1)})`);
      let last = -1;
      g.nodes.forEach((n, i) => {
        const lit = n.x <= reach;
        cards[i]?.classList.toggle("is-on", lit);
        dots[i]?.classList.toggle("is-on", lit);
        if (lit) last = i;
      });
      if (last !== shown && ticker.current) {
        shown = last;
        const m = story.milestones[last];
        ticker.current.textContent = m ? `${m.when} · ${m.title}` : "Scroll to follow the project";
      }
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", measure);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", measure);
      o.style.height = "";
      delete root.dataset.immersive;
    };
  }, [g, story]);

  return (
    <div ref={outer} className="relative">
      <div className="sticky top-0 h-svh overflow-hidden">
        <div ref={stage} className="absolute top-1/2 left-0 origin-left" style={{ height: H, marginTop: -H / 2, width: "100vw" }}>
          <div ref={track} className="absolute inset-y-0 left-0 will-change-transform" style={{ width: g.width }}>
            {/* Faint rings and dots behind the story */}
            <svg aria-hidden width={g.width} height={H} className="absolute inset-0 overflow-visible">
              {g.nodes.map((n, i) => (
                <g key={i} className="stroke-line" fill="none">
                  <circle cx={n.x} cy={MID} r={150} strokeWidth={1} />
                  <circle cx={n.x} cy={MID} r={210} strokeWidth={1} strokeDasharray="2 6" />
                </g>
              ))}
              {g.nodes.map((n, i) => (
                <circle
                  key={`dot${i}`}
                  cx={n.x + (i % 2 ? 120 : -110)}
                  cy={MID + (i % 2 ? -190 : 200)}
                  r={i % 3 === 0 ? 9 : 6}
                  className={cn("ps-float", ["fill-brand-400/60", "fill-human-accent/60", "fill-data-accent/60"][i % 3])}
                  style={{ "--d": `${i * -0.8}s` } as CSSProperties}
                />
              ))}
              {/* The line: a faint full track, then the drawn part that follows the scroll */}
              <path d={g.d} fill="none" className="stroke-line-strong" strokeWidth={2} strokeDasharray="1 7" strokeLinecap="round" />
              <path
                ref={path}
                d={g.d}
                fill="none"
                pathLength={1}
                strokeDasharray="1"
                strokeDashoffset="1"
                className="ps-line"
                strokeWidth={3.5}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {g.nodes.map((n, i) => {
                const k = KIND[story.milestones[i].kind];
                return (
                  <g key={`n${i}`} data-ps-node className="ps-node" transform={`translate(${n.x} ${n.y})`}>
                    <circle r={15} className="fill-ink-950" style={{ stroke: k.tone }} strokeWidth={2.5} />
                    <circle r={5} style={{ fill: k.tone }} />
                    <line x1={0} y1={n.up ? -15 : 15} x2={0} y2={n.up ? -CARD_GAP : CARD_GAP} style={{ stroke: k.tone }} strokeWidth={1.5} strokeDasharray="2 3" />
                  </g>
                );
              })}
              {/* The reading head */}
              <g ref={head} className="ps-head">
                <circle r={22} className="fill-brand-400/20" />
                <circle r={7} className="fill-brand-400" />
              </g>
            </svg>

            {/* Intro */}
            <div className="absolute top-1/2 w-[400px] -translate-y-1/2" style={{ left: lead }}>
              <p className="eyebrow">The project story</p>
              <h2 id="story-title" className="mt-4 text-display-md font-semibold">
                How {project} came together
              </h2>
              <p className="mt-4 text-[1.0625rem] leading-relaxed text-fg-muted">{story.summary}</p>
              {story.sample && (
                <p className="mt-4 inline-flex items-center gap-2 rounded-full border border-line-strong px-3 py-1 font-mono text-[11px] tracking-[0.14em] text-fg-subtle uppercase">
                  Sample timeline
                </p>
              )}
              <p className="mt-6 flex items-center gap-2 font-mono text-xs tracking-[0.16em] text-brand-300 uppercase">
                Scroll to follow it <ArrowRight aria-hidden className="size-4" />
              </p>
            </div>

            {/* Milestone cards */}
            {story.milestones.map((m, i) => {
              const n = g.nodes[i];
              return (
                <div
                  key={i}
                  data-ps-card
                  className={cn("ps-card absolute w-[290px]", n.up ? "ps-up" : "ps-down")}
                  style={
                    {
                      left: n.x - 145,
                      top: n.up ? undefined : n.y + CARD_GAP,
                      bottom: n.up ? H - n.y + CARD_GAP : undefined,
                      "--tilt": `${i % 2 ? 1.6 : -1.6}deg`,
                    } as CSSProperties
                  }
                >
                  <MilestoneCard m={m} people={cast(m)} />
                </div>
              );
            })}

            {/* Finish */}
            <div className="absolute top-1/2 -translate-y-1/2" style={{ left: g.x1 + 40, width: OUTRO - 80 }}>
              <p className="font-display text-5xl font-semibold">
                Shipped<span className="text-brand-400">.</span>
              </p>
              <p className="mt-3 text-[1.0625rem] leading-relaxed text-fg-muted">
                {story.milestones.length} milestones, one team, and a person signing off every step.
              </p>
              <Link href="/contact" className="link-arrow mt-5">
                Tell us about your project <ArrowRight aria-hidden className="size-4" />
              </Link>
            </div>
          </div>
        </div>

        {/* Where we are in the story */}
        <p
          ref={ticker}
          aria-live="polite"
          className="absolute bottom-6 left-1/2 -translate-x-1/2 rounded-full border border-line bg-ink-950/70 px-4 py-1.5 font-mono text-xs tracking-[0.16em] whitespace-nowrap text-fg-muted uppercase backdrop-blur-sm"
        >
          Scroll to follow the project
        </p>
      </div>
    </div>
  );
}

function Vertical({ story, cast, project }: Props) {
  return (
    <div className="container-site">
      <p className="eyebrow">The project story</p>
      <h2 id="story-title" className="mt-4 text-display-md font-semibold">
        How {project} came together
      </h2>
      <p className="mt-4 max-w-2xl text-[1.0625rem] leading-relaxed text-fg-muted">{story.summary}</p>
      {story.sample && (
        <p className="mt-4 inline-flex rounded-full border border-line-strong px-3 py-1 font-mono text-[11px] tracking-[0.14em] text-fg-subtle uppercase">
          Sample timeline
        </p>
      )}
      <ol className="relative mt-10 space-y-6 border-l-2 border-dashed border-line-strong pl-8">
        {story.milestones.map((m, i) => {
          const k = KIND[m.kind];
          return (
            <li key={i} className="relative">
              <span aria-hidden className="absolute top-5 -left-[2.6rem] grid size-5 place-items-center rounded-full border-2 bg-ink-950" style={{ borderColor: k.tone }}>
                <span className="size-1.5 rounded-full" style={{ background: k.tone }} />
              </span>
              <MilestoneCard m={m} people={cast(m)} />
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function MilestoneCard({ m, people }: { m: Milestone; people: TeamMember[] }) {
  const k = KIND[m.kind];
  return (
    <article className="ps-face rounded-2xl border border-line bg-ink-850 p-4">
      <div className="flex items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 font-mono text-[10px] tracking-[0.14em] uppercase" style={{ color: k.tone, background: `color-mix(in oklab, ${k.tone} 14%, transparent)` }}>
          <k.Icon aria-hidden className="size-3.5" /> {k.label}
        </span>
        <span className="font-mono text-[11px] tracking-[0.12em] text-fg-subtle uppercase">{m.when}</span>
      </div>
      <h3 className="mt-2.5 font-semibold leading-snug">{m.title}</h3>
      <p className="mt-1 text-sm leading-relaxed text-fg-muted">{m.body}</p>
      <div className="mt-3 flex items-end justify-between gap-3 border-t border-line pt-3">
        {m.stat && (
          <p className="leading-none">
            <span className="block font-display text-2xl font-semibold" style={{ color: k.tone }}>
              {m.stat.value}
            </span>
            <span className="mt-1 block text-xs text-fg-subtle">{m.stat.label}</span>
          </p>
        )}
        {people.length > 0 && (
          <div className="flex min-w-0 items-center gap-2">
            <span className="flex -space-x-2">
              {people.slice(0, 3).map((p) => (
                <MemberAvatar key={p.id} member={p} className="size-8 rounded-full ring-2 ring-ink-850" />
              ))}
            </span>
            <span className="min-w-0 text-right leading-tight">
              <span className="block truncate text-xs font-semibold">
                {people[0].name}
                {people.length > 1 && <span className="font-normal text-fg-subtle"> +{people.length - 1}</span>}
              </span>
              <span className="block truncate text-[11px] text-fg-subtle">{people[0].role}</span>
            </span>
          </div>
        )}
      </div>
    </article>
  );
}
