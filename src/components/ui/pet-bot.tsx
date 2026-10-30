"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, X } from "lucide-react";
import { cn } from "@/lib/cn";

// Only with a real mouse, and never for reduced motion
const QUERY = "(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)";
const IDLE_MS = 4500; // cursor still this long: the pet locks on with its beam and tells a joke
const BEAM_MS = 1600;
const SIZE = 64; // rendered width of the pet

const GREETINGS: Record<string, string> = {
  "/": "Hi! I'm your Outscalers guide.",
  "/services": "Scroll down for a tour of our services.",
  "/how-we-work": "Here's how people and AI work together.",
  "/portfolio": "Take a look at what we've built.",
  "/about": "Meet the team behind Outscalers.",
  "/contact": "Got an idea? Tell us about it!",
};
// Told when the cursor rests, in a random order
const JOKES = [
  "Why do developers love dark mode? Light attracts bugs.",
  "I asked an AI to fix a bug. It wrote a poem about it. Our engineers fixed the bug.",
  "There are 10 kinds of people: those who read binary and those who don't.",
  "I'd tell you a UDP joke, but you might not get it.",
  "I'm not lazy. I'm in low-power mode.",
  "A human reviewed this joke. It still shipped.",
  "Knock knock. Race condition. Who's there?",
  "I'd make a cloud joke, but it would go over your head.",
  "My code works and I don't know why. Luckily, our engineers do.",
  "I tried to scale my jokes. Now they're bad at scale.",
  // The designer and their creativity
  "AI can draft a layout. Our designer gives it a soul.",
  "Why did the designer leave the font? It wasn't their type.",
  "Our designer nudged that button one pixel left. Then back. Perfection.",
  "Comic Sans walked into a bar. Our designer walked out.",
  "Our designer doesn't make mistakes. Just happy little iterations.",
  "\"Just make it pop,\" they said. Our designer made it sing.",
  // Ghost, from Call of Duty
  "Ghost from Call of Duty hides behind a skull mask. I hide behind a visor. Same energy.",
  "Ghost never misses. Neither do our code reviews.",
  "Like Ghost, I move in silence. Well, apart from the jokes.",
  // The team, from countless Counter-Strike: Source nights together
  "Our team was forged in Counter-Strike: Source. Ask anyone about de_dust2.",
  "Glitch found a wall-bang spot. Now Glitch finds bugs the same way.",
  "Death never asks for a medic. Mostly because CS: Source doesn't have one.",
  "Ghost once planted the bomb and nobody noticed. Same with Ghost's deploys.",
  "No-mercy never shows mercy. Not to enemies, and not to legacy code.",
  "Codex rushed B without a plan. Now Codex writes the plans.",
  "Dr. Doom calls every round \"a calculated risk\". The scoreboard disagrees.",
  "Dragos 302 has 302 excuses for that missed AWP shot. We've heard 301.",
  "Spartan held the bridge alone. Then asked why nobody came. Classic Spartan.",
  "Frustrated is the calmest one on the team. Don't let the name fool you.",
  "Killer Man asked for a knife round. We ended up with a deadline instead.",
  "Killer Man tops the scoreboard and the commit log. Some people just like killing it.",
  "Glitch, Death, Ghost, No-mercy, Codex, Dr. Doom, Dragos 302, Spartan, Frustrated, Killer Man. Terrorists win? Not on our server.",
  "Our stand-ups are just CS: Source callouts. \"Two on B, one lurking in the backlog.\"",
  "Counter-Terrorists win. Clients win. Frustrated still blames the lag.",
];


// Told once per visit, at the first rest: a nod to the person behind the design
const SECRET = [
  "Psst… want to know a secret?",
  "Someone on our team dreamed up this whole site. My beam, my jokes, even my smile.",
  "Who? Let's just say… some creators prefer to stay a mystery. For now.",
];
const SECRET_KEY = "pet-secret-told";

// When the cursor keeps chasing the pet, it teases back: one line per stage, escalating
const CHASE_LINES = [
  ["Hey! Are you following me?", "Still chasing? I run on electricity, you run on coffee.", "Okay, you win. Ever thought about a career in QA?"],
  ["Catch me if you can!", "Your cursor might need a speed upgrade.", "Impressive persistence. Our engineers would approve."],
  ["I see you sneaking up on me…", "Nice try. I have 360° sensors.", "Fine, fine. You're officially my favourite human."],
];
const CHASE_STAGES = [1, 3.5, 6]; // seconds of chasing before each line

// Guide tips: a question and a button to another page. Pages not yet visited this session come first.
type Tip = { href: string; text: string; cta: string };
const TIPS: Tip[] = [
  { href: "/portfolio", text: "Have you seen our portfolio yet?", cta: "Open portfolio" },
  { href: "/services", text: "Want to see what we can build for you?", cta: "View services" },
  { href: "/how-we-work", text: "Curious how our engineers work with AI?", cta: "How we work" },
  { href: "/about", text: "Want to meet the team behind Outscalers?", cta: "About us" },
  { href: "/contact", text: "Have an idea in mind? Let's talk.", cta: "Get in touch" },
];
// Nothing runs on a clock: a tip appears once the visitor has read most of the page (and has stopped
// scrolling), at most once per page; jokes come when the cursor rests.
const TIP_AT_PROGRESS = 0.75; // share of the page scrolled
const TIP_MIN_ON_PAGE_MS = 8000; // short pages that barely scroll get their tip after this long
const SCROLL_SETTLE_MS = 700; // scrolling has stopped for this long
const JOKE_COOLDOWN_MS = 2500; // quiet time after a line before the next joke
const TIP_SHOW_MS = 10000;
// Long enough to read: about 0.38s per word, within 3.2 to 9 seconds
const readMs = (text: string) => Math.min(9000, Math.max(3200, 1800 + text.split(/\s+/).length * 380));
const VISITED_KEY = "pet-visited";
const TIPS_OFF_KEY = "pet-tips-off";

const store = {
  get: (k: string) => {
    try {
      return sessionStorage.getItem(k);
    } catch {
      return null;
    }
  },
  set: (k: string, v: string) => {
    try {
      sessionStorage.setItem(k, v);
    } catch {}
  },
};

type Mood = "idle" | "happy" | "focus";

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

/**
 * The Outscalers pet: a small hovering bot that follows the mouse on every page and looks at the
 * cursor. It greets visitors with a line about the current page. When the cursor rests it locks on
 * with a light beam that gives the cursor spot a small tug, and tells a joke. Once a page has been
 * mostly read it suggests another page with a button; while that suggestion is open the pet stays
 * put so it can be clicked. While the visitor is moving or scrolling it stays quiet.
 * The pet itself is decorative and hidden from assistive tech; only the suggestion is interactive.
 */
export function PetBot() {
  const pathname = usePathname();
  const [on, setOn] = useState(false);
  // The page only learns where the cursor is once it moves, so the pet stays hidden until then
  const [ready, setReady] = useState(false);
  const readyRef = useRef(false);
  // Kept across page changes, so the pet doesn't jump when navigating
  const mouseRef = useRef({ x: 0, y: 0 });
  const posRef = useRef({ x: 0, y: 0 });
  const [mood, setMood] = useState<Mood>("idle");
  const [line, setLine] = useState<string | null>(null);
  const [beaming, setBeaming] = useState(false);
  const [flip, setFlip] = useState(false);
  const [tip, setTip] = useState<Tip | null>(null);
  const [tipBelow, setTipBelow] = useState(false);
  const tipOpen = useRef(false);
  const tipTimer = useRef<number>(0);

  const pet = useRef<HTMLDivElement>(null);
  const body = useRef<SVGGElement>(null);
  const eyes = useRef<SVGGElement>(null);
  const lids = useRef<SVGGElement>(null);
  const flame = useRef<SVGGElement>(null);
  const beam = useRef<SVGLineElement>(null);
  const beamGlow = useRef<SVGLineElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const hideTimer = useRef<number>(0);

  const busyUntil = useRef(0); // a line is on screen until then
  const jokeIdx = useRef(-1);
  const secretTimers = useRef<number[]>([]);

  /** Shows a line. Returns false if it was skipped so as not to talk over something still being read. */
  const say = useCallback((text: string, ms = readMs(text), m: Mood = "happy", force = false) => {
    const now = performance.now();
    if (tipOpen.current || (!force && now < busyUntil.current)) return false;
    window.clearTimeout(hideTimer.current);
    setLine(text);
    setMood(m);
    busyUntil.current = Math.max(busyUntil.current, now + ms);
    hideTimer.current = window.setTimeout(() => {
      setLine(null);
      setMood("idle");
    }, ms);
    return true;
  }, []);

  /** The secret the first time (three beats, each with time to read it), then a joke. */
  const talk = useCallback(() => {
    if (!store.get(SECRET_KEY)) {
      store.set(SECRET_KEY, "1");
      let t = 0;
      for (const l of SECRET) {
        secretTimers.current.push(window.setTimeout(() => say(l, undefined, "happy", true), t));
        t += readMs(l) + 400;
      }
      busyUntil.current = performance.now() + t;
      return;
    }
    if (jokeIdx.current < 0) jokeIdx.current = Math.floor(Math.random() * JOKES.length);
    say(JOKES[jokeIdx.current++ % JOKES.length], undefined, "happy", true);
  }, [say]);

  useEffect(() => {
    const mq = window.matchMedia(QUERY);
    const sync = () => setOn(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  const closeTip = useCallback((silence = false) => {
    window.clearTimeout(tipTimer.current);
    tipOpen.current = false;
    setTip(null);
    setMood("idle");
    // Closing suggestions twice turns them off for the rest of the visit
    if (silence) store.set(TIPS_OFF_KEY, String(Number(store.get(TIPS_OFF_KEY) ?? 0) + 1));
  }, []);

  const holdTip = useCallback(
    (ms: number) => {
      window.clearTimeout(tipTimer.current);
      tipTimer.current = window.setTimeout(() => closeTip(), ms);
    },
    [closeTip],
  );

  // A greeting about the page shortly after arriving, then one guide suggestion once the page has been read
  useEffect(() => {
    if (!on || !ready) return;
    const visited = new Set<string>(JSON.parse(store.get(VISITED_KEY) ?? "[]"));
    visited.add(pathname);
    store.set(VISITED_KEY, JSON.stringify([...visited]));

    const key = Object.keys(GREETINGS).find((k) => k !== "/" && pathname.startsWith(k)) ?? (pathname === "/" ? "/" : null);
    const greet = window.setTimeout(() => say(key ? GREETINGS[key] : "Hi there!", undefined, "happy", true), 700);

    const enteredAt = performance.now();
    let lastScroll = 0;
    let tipped = false;
    let settle = 0;
    const maybeTip = () => {
      const now = performance.now();
      if (tipped || tipOpen.current || now < busyUntil.current + 1000) return;
      if (now - lastScroll < SCROLL_SETTLE_MS || now - enteredAt < TIP_MIN_ON_PAGE_MS) return;
      if (Number(store.get(TIPS_OFF_KEY) ?? 0) >= 2) return;
      const el = pet.current;
      if (!el || el.style.opacity === "0") return; // the pet is hidden right now
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (max > 300 && window.scrollY / max < TIP_AT_PROGRESS) return; // not read far enough yet
      tipped = true;
      setTipBelow(el.getBoundingClientRect().top < 150); // not enough room above near the top of the screen
      const others = TIPS.filter((t) => !pathname.startsWith(t.href));
      const fresh = others.filter((t) => !visited.has(t.href));
      const pool = fresh.length ? fresh : others;
      tipOpen.current = true;
      setTip(pool[Math.floor(Math.random() * pool.length)]);
      setMood("happy");
      holdTip(TIP_SHOW_MS);
    };
    const onScroll = () => {
      lastScroll = performance.now();
      window.clearTimeout(settle);
      settle = window.setTimeout(maybeTip, SCROLL_SETTLE_MS + 50);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    // Also catches short pages, and a tip that had to wait for a line to finish
    const poll = window.setInterval(maybeTip, 1500);

    return () => {
      window.clearTimeout(greet);
      window.clearTimeout(settle);
      window.clearInterval(poll);
      window.removeEventListener("scroll", onScroll);
      secretTimers.current.forEach((t) => window.clearTimeout(t));
      secretTimers.current = [];
      window.clearTimeout(tipTimer.current);
      tipOpen.current = false;
      setTip(null);
    };
  }, [on, ready, pathname, holdTip, say]);

  useEffect(() => {
    if (!on) return;
    const mouse = mouseRef.current;
    const pos = posRef.current;
    const vel = { x: 0, y: 0 };
    let lastMove = performance.now();
    let beamAt = 0; // when the current beam started; 0 = none
    let beamedThisRest = false;
    let side = readyRef.current && mouse.x < 150 ? -1 : 1; // 1: the pet sits up-left of the cursor, -1: up-right
    let shownSide = 1;
    let nextBlink = performance.now() + 2500;
    let frame = 0;
    // Chase detection
    let lastMx = mouse.x;
    let lastMy = mouse.y;
    let lastNow = performance.now();
    let chase = 0; // seconds of chasing so far
    let stage = 0; // chase lines already said this chase
    let chaseSet = Math.floor(Math.random() * CHASE_LINES.length);
    // Hide while a section that has its own robot (the services rail) fills the screen
    let hideEl: Element | null = document.querySelector("[data-pet-hide]");

    const onMove = (e: PointerEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      if (!readyRef.current) {
        // First sight of the cursor: appear right beside it instead of gliding in from elsewhere
        readyRef.current = true;
        side = mouse.x < 150 ? -1 : 1;
        pos.x = clamp(mouse.x - side * 78 - SIZE / 2, 8, window.innerWidth - SIZE - 8);
        pos.y = clamp(mouse.y - 92, 8, window.innerHeight - SIZE - 24);
        setReady(true);
      }
      lastMove = performance.now();
      beamedThisRest = false;
      if (beamAt) {
        beamAt = 0;
        setBeaming(false);
      }
    };

    const loop = (now: number) => {
      frame = requestAnimationFrame(loop);
      const el = pet.current;
      if (!el) return;

      hideEl ??= document.querySelector("[data-pet-hide]");
      const r = hideEl?.getBoundingClientRect();
      const hidden = !!r && r.top <= 1 && r.bottom >= window.innerHeight - 1;
      el.style.opacity = hidden || !readyRef.current ? "0" : "1";
      if (!readyRef.current) return; // nothing to follow yet

      // Keep to one side of the cursor so it never covers what is being pointed at
      if (mouse.x < 150) side = -1;
      else if (mouse.x > window.innerWidth - 150) side = 1;
      if (side !== shownSide && !tipOpen.current) setFlip((shownSide = side) < 0);
      // While a suggestion is open the pet stays put, so its button can be reached
      const tx = tipOpen.current ? pos.x : clamp(mouse.x - side * 78 - SIZE / 2, 8, window.innerWidth - SIZE - 8);
      const ty = tipOpen.current ? pos.y : clamp(mouse.y - 92, 8, window.innerHeight - SIZE - 24);
      const nx = pos.x + (tx - pos.x) * 0.075;
      const ny = pos.y + (ty - pos.y) * 0.075;
      vel.x = vel.x * 0.8 + (nx - pos.x) * 0.2;
      vel.y = vel.y * 0.8 + (ny - pos.y) * 0.2;
      pos.x = nx;
      pos.y = ny;
      el.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0)`;

      // Lean with the motion; thrusters flare with speed
      const speed = Math.hypot(vel.x, vel.y);
      if (body.current) body.current.style.transform = `rotate(${clamp(vel.x * 2.2, -18, 18)}deg)`;
      if (flame.current) flame.current.style.transform = `scaleY(${0.35 + clamp(speed / 6, 0, 1)})`;

      // Eyes follow the cursor
      const ex = pos.x + SIZE / 2;
      const ey = pos.y + SIZE * 0.45;
      const dx = mouse.x - ex;
      const dy = mouse.y - ey;
      const d = Math.hypot(dx, dy) || 1;
      if (eyes.current) eyes.current.style.transform = `translate(${(dx / d) * 4}px, ${(dy / d) * 3}px)`;

      // Chasing: the cursor keeps moving toward the pet while close to it
      const dt = Math.min(0.1, (now - lastNow) / 1000);
      lastNow = now;
      const mdx = mouse.x - lastMx;
      const mdy = mouse.y - lastMy;
      lastMx = mouse.x;
      lastMy = mouse.y;
      const mspeed = Math.hypot(mdx, mdy);
      const towards = mspeed > 1.5 && d < 260 && -(mdx * dx + mdy * dy) / (mspeed * d) > 0.55;
      if (towards) chase += dt;
      else chase = Math.max(0, chase - dt * 0.6);
      if (stage < CHASE_STAGES.length && chase > CHASE_STAGES[stage]) {
        // Waits for any line still being read, then teases
        if (say(CHASE_LINES[chaseSet][stage])) stage++;
      }
      if (chase === 0 && stage > 0) {
        // The chase is over; next time, a different set of lines
        stage = 0;
        chaseSet = (chaseSet + 1) % CHASE_LINES.length;
      }

      // Blink now and then
      if (lids.current) {
        if (now > nextBlink) {
          lids.current.style.transform = "scaleY(0.1)";
          if (now > nextBlink + 130) {
            lids.current.style.transform = "";
            nextBlink = now + 2500 + Math.random() * 3000;
          }
        }
      }

      // Cursor at rest: lock on with a beam that tugs the cursor spot toward the pet
      if (!hidden && readyRef.current && !tipOpen.current && !beamedThisRest && now - lastMove > IDLE_MS) {
        beamedThisRest = true;
        beamAt = now;
        setBeaming(true);
        if (now > busyUntil.current + JOKE_COOLDOWN_MS) talk();
      }
      if (beamAt) {
        const t = (now - beamAt) / BEAM_MS;
        if (t >= 1) {
          beamAt = 0;
          setBeaming(false);
        } else {
          const tug = Math.sin(t * Math.PI) * 14;
          const cx = mouse.x - (dx / d) * tug;
          const cy = mouse.y - (dy / d) * tug;
          for (const b of [beam.current, beamGlow.current]) {
            b?.setAttribute("x1", String(ex));
            b?.setAttribute("y1", String(ey));
            b?.setAttribute("x2", String(cx));
            b?.setAttribute("y2", String(cy));
          }
          if (ring.current) ring.current.style.transform = `translate3d(${cx}px, ${cy}px, 0)`;
        }
      }
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    // Fires on load when the page appears under a still cursor, in browsers that report it
    document.addEventListener("pointerover", onMove, { passive: true });
    frame = requestAnimationFrame(loop);
    return () => {
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerover", onMove);
      cancelAnimationFrame(frame);
      hideEl = null;
    };
  }, [on, pathname, say, talk]);

  useEffect(() => () => window.clearTimeout(hideTimer.current), []);

  if (!on) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-40">
      {/* Beam from the pet's eyes to the resting cursor */}
      <svg aria-hidden className={cn("absolute inset-0 size-full transition-opacity duration-300", beaming ? "opacity-100" : "opacity-0")}>
        <line ref={beamGlow} className="stroke-brand-400/25" strokeWidth={9} strokeLinecap="round" />
        <line ref={beam} className="stroke-brand-200" strokeWidth={1.5} strokeLinecap="round" strokeDasharray="6 5">
          <animate attributeName="stroke-dashoffset" from="22" to="0" dur="0.5s" repeatCount="indefinite" />
        </line>
      </svg>
      <div ref={ring} aria-hidden className={cn("absolute top-0 left-0 transition-opacity duration-300", beaming ? "opacity-100" : "opacity-0")}>
        <span className="absolute -top-4 -left-4 size-8 rounded-full border-2 border-brand-300 animate-[pet-ping_0.8s_ease-out_infinite]" />
        <span className="absolute -top-1.5 -left-1.5 size-3 rounded-full bg-brand-300/70 shadow-[0_0_16px_var(--color-brand-400)]" />
      </div>

      {/* The pet */}
      <div ref={pet} className="absolute top-0 left-0 transition-opacity duration-300 will-change-transform">
        {line && !tip && (
          <p
            aria-hidden
            className={cn(
              "absolute bottom-full mb-2 w-max max-w-64 border border-brand-400/40 bg-ink-950/90 px-2.5 py-1.5 text-xs leading-snug text-fg shadow-[0_0_24px_-8px_var(--color-brand-500)] backdrop-blur-sm",
              flip ? "left-2" : "right-2",
            )}
          >
            <span className="mr-1.5 font-mono text-[10px] text-brand-300">{">"}</span>
            {line}
          </p>
        )}
        {tip && (
          // A suggestion: the one interactive part of the pet
          <div
            role="dialog"
            aria-label="Suggestion from the Outscalers guide"
            onMouseEnter={() => window.clearTimeout(tipTimer.current)}
            onMouseLeave={() => holdTip(2500)}
            className={cn(
              "pointer-events-auto absolute w-64 border border-brand-400/50 bg-ink-950/95 p-3.5 shadow-[0_0_30px_-8px_var(--color-brand-500)] backdrop-blur-sm",
              tipBelow ? "top-full mt-2" : "bottom-full mb-2",
              flip ? "left-2" : "right-2",
            )}
          >
            <span aria-hidden className="absolute -top-px -left-px size-2 border-t-2 border-l-2 border-brand-300" />
            <span aria-hidden className="absolute -right-px -bottom-px size-2 border-r-2 border-b-2 border-brand-300" />
            <button
              type="button"
              aria-label="Close suggestion"
              onClick={() => closeTip(true)}
              className="absolute top-1.5 right-1.5 grid size-6 place-items-center rounded text-fg-subtle transition-colors hover:text-fg"
            >
              <X aria-hidden className="size-3.5" />
            </button>
            <p className="font-mono text-[10px] tracking-[0.16em] text-brand-300 uppercase">Guide</p>
            <p className="mt-1 pr-5 text-sm leading-snug text-fg">{tip.text}</p>
            <Link
              href={tip.href}
              onClick={() => closeTip()}
              className="btn btn-primary btn-sm mt-3 w-full justify-center"
            >
              {tip.cta}
              <ArrowRight aria-hidden className="size-3.5" />
            </Link>
          </div>
        )}
        <div aria-hidden className="animate-[hover-bob_2.4s_ease-in-out_infinite]">
          <svg viewBox="0 0 72 82" width={SIZE} className="block overflow-visible">
            <ellipse cx={36} cy={80} rx={15} ry={2} className="fill-brand-500/25" />
            <g ref={body} style={{ transformOrigin: "36px 40px" }}>
              {/* Thrusters */}
              <g ref={flame} style={{ transformOrigin: "36px 58px" }}>
                <path d="M26 58 29 71 32 58Z" className="fill-brand-400/80" />
                <path d="M40 58 43 71 46 58Z" className="fill-brand-400/80" />
                <path d="M27.5 58 29 64 30.5 58Z" className="fill-brand-200" />
                <path d="M41.5 58 43 64 44.5 58Z" className="fill-brand-200" />
              </g>
              {/* Arms; the right one waves while it greets */}
              <rect x={1} y={34} width={8} height={14} rx={4} className="fill-ink-800 stroke-line-strong" />
              <g
                style={{ transformOrigin: "67px 40px" }}
                className={cn(mood === "happy" && "animate-[pet-wave_0.9s_ease-in-out_2]")}
              >
                <rect x={63} y={34} width={8} height={14} rx={4} className="fill-ink-800 stroke-line-strong" />
              </g>
              {/* Antenna */}
              <line x1={36} y1={16} x2={36} y2={6} className="stroke-line-strong" strokeWidth={1.5} />
              <circle cx={36} cy={5} r={2.6} className={cn("fill-brand-400", mood === "focus" ? "animate-ping" : "animate-pulse")} />
              {/* Head */}
              <rect x={8} y={16} width={56} height={42} rx={20} className="fill-ink-850 stroke-line-strong" strokeWidth={1.5} />
              {/* Face screen */}
              <rect x={15} y={24} width={42} height={26} rx={12} className="fill-ink-950 stroke-brand-400/50" />
              <g ref={eyes}>
                {mood === "happy" ? (
                  <g className="fill-none stroke-brand-300" strokeWidth={2.6} strokeLinecap="round">
                    <path d="M24 38q4-6 8 0" />
                    <path d="M40 38q4-6 8 0" />
                  </g>
                ) : (
                  <g ref={lids} style={{ transformOrigin: "36px 36px" }} className="fill-brand-300">
                    <rect x={25} y={mood === "focus" ? 33 : 30} width={6} height={mood === "focus" ? 6 : 11} rx={3} />
                    <rect x={41} y={mood === "focus" ? 33 : 30} width={6} height={mood === "focus" ? 6 : 11} rx={3} />
                  </g>
                )}
              </g>
              {/* Blush, in the human-accent colour */}
              <circle cx={21} cy={44} r={2.2} className="fill-human-accent/40" />
              <circle cx={51} cy={44} r={2.2} className="fill-human-accent/40" />
            </g>
          </svg>
        </div>
      </div>
    </div>
  );
}
