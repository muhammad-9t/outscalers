"use client";

import { useCallback, useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { usePathname, useRouter } from "next/navigation";
import { ArrowRight, Gamepad2, Mic, X } from "lucide-react";
import { cn } from "@/lib/cn";
import { scrollToY } from "@/lib/smooth-scroll";
import { PAGE_NAMES, SCROLL_SPEED, parseCommand, useAutoScroll, useVoice, type VoiceCommand } from "./pet-voice";

// Only with a real mouse, and never for reduced motion
const QUERY = "(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)";
const IDLE_MS = 4500; // cursor still this long: the pet locks on with its beam and tells a joke
const BEAM_MS = 1600;
const SIZE = 64; // rendered width of the pet
const H = (SIZE * 82) / 72; // rendered height of the pet

// Punching: three quick punches knock the pet out; it lies powered off, can be dragged around, then reboots
const PUNCHES_TO_KO = 3;
const PUNCH_RESET_MS = 4000; // punches further apart than this start the count again
const OFF_MS = 7000;
const BOOT_MS = 1300;
const PUNCH_LINES = ["Ouch! What was that for?", "Hey! Robots have feelings too."];
const KO_LINE = "Critical hit… powering down.";
const BOOT_LINE = "Rebooting… systems coming back online.";
const WAKE_LINES = [
  "I'm back! Let's pretend that never happened.",
  "Systems online. I felt that in every circuit.",
  "Back online. Nice combo, but I want a rematch.",
];

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
  "Every good team needs a captain. Ours is Codex: calm calls, clear plans, rounds won.",
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
type Tip = { href: string; text: string; cta: string; action?: "voice" | "game" };
// Offered once per visit, early on, in browsers that can do speech recognition
const VOICE_TIP: Tip = {
  href: "",
  text: "Tired of using the mouse? Turn on voice and just tell me: “open portfolio”, “scroll”, “stop”, “go back”… The Voice button bottom left does it too.",
  cta: "Turn on voice",
  action: "voice",
};
// Offered once per visit, after a few jokes
const GAME_TIP: Tip = {
  href: "",
  text: "Want to play? Bugs are heading for production, and I need a co-pilot to stop them.",
  cta: "Play Bug Hunt",
  action: "game",
};
const GAME_OFFERED_KEY = "pet-game-offered";

// The arcade: click and hold the pet this long to open it
const HOLD_MS = 600;
const ARCADE_HINT_KEY = "pet-arcade-hint";
const ARCADE_HINT_MS = 900; // cursor resting on the pet this long before the hint
const BUG_HUNT_BEST_KEY = "bug-hunt-best"; // written by the game
const GAMES: { id: string; name: string; blurb: string; ready: boolean }[] = [
  { id: "bug-hunt", name: "Bug Hunt", blurb: "Stop the bugs before they reach production.", ready: true },
  { id: "deploy-run", name: "Deploy Run", blurb: "Dodge the blockers on the way to release.", ready: false },
  { id: "ship-it", name: "Ship It", blurb: "Catch the good commits, dodge the bugs.", ready: false },
];
const JOKES_BEFORE_GAME = 3;

// The game is only downloaded when it is opened
const BugHunt = dynamic(() => import("@/components/game/bug-hunt").then((m) => m.BugHunt), { ssr: false });
// Said when the cursor rests on the Voice button
const VOICE_NUDGES = [
  "Go on, try it. Freedom from the mouse awaits!",
  "Click it, and your voice becomes the remote control.",
  "Hands off the mouse! Just talk to me.",
  "Try it. I promise I'm a good listener.",
  "One click and you can browse like a sci-fi captain.",
];
const VOICE_OFFERED_KEY = "pet-voice-offered";
const VOICE_OFFER_MS = 6000; // on the page this long before the offer
const VOICE_HELP =
  "Try: “open portfolio”, “scroll”, “scroll slow”, “faster”, “stop”, “go to top”, “go back”, “next page”, “reload”, “tell me a joke”, “play a game”, or “stop listening”.";
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
type Power = "on" | "off" | "boot";

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
  const [power, setPower] = useState<Power>("on");
  const [ouch, setOuch] = useState(false); // wincing eyes right after a punch
  const [grabbing, setGrabbing] = useState(false);
  const ouchTimer = useRef<number>(0);
  // Punch and fall physics. Kept across page changes, like the position.
  const phys = useRef({
    mode: "on" as Power,
    vx: 0, // fall velocity while powered off, px/s
    vy: 0,
    rot: 0, // tilt of the whole body, deg
    rotV: 0,
    kx: 0, // knock-back offset from a punch, springs back to 0
    ky: 0,
    kvx: 0,
    kvy: 0,
    hits: 0,
    lastHit: 0,
    stunUntil: 0, // stays put after a punch so the next one can land
    wakeAt: 0,
    bootAt: 0,
    drag: false,
    gx: 0, // where it was grabbed, relative to its top-left corner
    gy: 0,
    lie: 1, // which side it falls on
    hover: false,
  });

  const pet = useRef<HTMLDivElement>(null);
  const tumble = useRef<HTMLDivElement>(null);
  const squash = useRef<HTMLDivElement>(null);
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
  const jokesTold = useRef(0);
  const gameDue = useRef(false); // enough jokes told: offer the game at the next chance
  const [game, setGame] = useState(false);
  const gameOpen = useRef(false);
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
    if (++jokesTold.current >= JOKES_BEFORE_GAME) gameDue.current = true;
  }, [say]);

  const openGame = useCallback(() => {
    gameOpen.current = true;
    gameDue.current = false;
    store.set(GAME_OFFERED_KEY, "1");
    setGame(true);
  }, []);
  const closeGame = useCallback(() => {
    gameOpen.current = false;
    setGame(false);
    say("Thanks for playing! Production is safe… for now.", undefined, "happy", true);
  }, [say]);

  // The arcade: a menu of games beside the pet, opened by clicking and holding it (or by voice)
  const [arcade, setArcade] = useState(false);
  const arcadeOpen = useRef(false);
  const [bestScore, setBestScore] = useState(0);
  const openArcade = useCallback(() => {
    window.clearTimeout(tipTimer.current);
    setTip(null);
    tipOpen.current = true; // the pet stays put and quiet while the menu is open
    arcadeOpen.current = true;
    setTipBelow((pet.current?.getBoundingClientRect().top ?? 300) < 290);
    try {
      setBestScore(Number(localStorage.getItem(BUG_HUNT_BEST_KEY) ?? 0));
    } catch {}
    setArcade(true);
    setMood("happy");
  }, []);
  const closeArcade = useCallback(() => {
    tipOpen.current = false;
    arcadeOpen.current = false;
    setArcade(false);
    setMood("idle");
  }, []);
  useEffect(() => {
    if (!arcade) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && closeArcade();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [arcade, closeArcade]);

  // Voice commands: the pet answers each one in its speech bubble
  const router = useRouter();
  const scrollPace = useRef<{ speed: keyof typeof SCROLL_SPEED; up: boolean }>({ speed: "normal", up: false });
  const auto = useAutoScroll(() =>
    say(scrollPace.current.up ? "We're at the top." : "That's the end of the page. Say “go to top” to go back up.", undefined, "happy", true),
  );
  const stopVoice = useRef<() => void>(() => {});
  const nudgeAt = useRef(0);
  const nudgeIdx = useRef(0);
  const voiceState = useRef({ supported: false, listening: false });

  const onCommand = useCallback(
    (cmd: VoiceCommand) => {
      const p = phys.current;
      if (p.mode !== "on" && cmd.type !== "mute") return; // knocked out: can't hear a thing
      if (gameOpen.current && cmd.type !== "mute") return; // busy playing
      const ok = (text: string, ms = 2200) => say(text, ms, "happy", true);
      const scroll = (speed: keyof typeof SCROLL_SPEED, up: boolean) => {
        scrollPace.current = { speed, up };
        auto.run((up ? -1 : 1) * SCROLL_SPEED[speed]);
      };
      const history = (window as unknown as { navigation?: { canGoBack: boolean; canGoForward: boolean } }).navigation;
      switch (cmd.type) {
        case "open":
          auto.stop();
          ok(`Opening ${cmd.label}.`);
          router.push(cmd.href);
          break;
        case "scroll":
          scroll(cmd.speed, cmd.up);
          ok(
            cmd.up
              ? "Scrolling up."
              : cmd.speed === "slow"
                ? "Scrolling slowly. Say “stop” when you're done."
                : cmd.speed === "fast"
                  ? "Full speed ahead!"
                  : "Scrolling. Say “slower”, “faster” or “stop”.",
            2800,
          );
          break;
        case "faster":
        case "slower": {
          const { speed, up } = scrollPace.current;
          const next = cmd.type === "faster" ? (speed === "slow" ? "normal" : "fast") : speed === "fast" ? "normal" : "slow";
          scroll(next, up);
          ok(cmd.type === "faster" ? (next === "fast" ? "Full speed ahead!" : "A bit faster.") : "Nice and slow.", 1800);
          break;
        }
        case "stop":
          auto.stop();
          ok("Stopped.", 1500);
          break;
        case "top":
          auto.stop();
          scrollToY(0);
          ok("Back to the top.", 1800);
          break;
        case "bottom":
          auto.stop();
          scrollToY(document.documentElement.scrollHeight);
          ok("All the way down.", 1800);
          break;
        case "back":
          auto.stop();
          if (history ? history.canGoBack : window.history.length > 1) {
            ok("Going back.", 1500);
            router.back();
          } else ok("There's no previous page yet. Try “open services”.");
          break;
        case "forward":
          auto.stop();
          if (history && !history.canGoForward) ok("There's no next page in your history. Try “open portfolio”.");
          else {
            ok("Going forward.", 1500);
            router.forward();
          }
          break;
        case "reload":
          ok("Reloading…", 1500);
          window.setTimeout(() => window.location.reload(), 500);
          break;
        case "joke":
          talk();
          break;
        case "help":
          say(VOICE_HELP, undefined, "happy", true);
          break;
        case "where": {
          const key = Object.keys(PAGE_NAMES).find((k) => k !== "/" && pathname.startsWith(k));
          ok(`You're on ${key ? PAGE_NAMES[key] : pathname === "/" ? PAGE_NAMES["/"] : "a page off the map"}.`);
          break;
        }
        case "hello":
          ok("Hi! Say “help” to hear what I can do.");
          break;
        case "dance":
          ok("Watch this!", 1800);
          [0, 240, 480, 720].forEach((t, i) =>
            window.setTimeout(() => {
              if (p.mode !== "on") return;
              p.rotV += (i % 2 ? -1 : 1) * 900;
              p.kvy -= 320;
            }, t),
          );
          break;
        case "game":
          auto.stop();
          if (arcadeOpen.current) closeArcade();
          openGame();
          break;
        case "arcade":
          auto.stop();
          openArcade();
          break;
        case "which":
          // A page name on its own works as the answer
          ok("Which page? Just say “portfolio”, “services”, “how we work”, “about” or “contact”.", 4500);
          break;
        case "thanks":
          ok("Anytime! That's what I'm here for.");
          break;
        case "mute":
          auto.stop();
          stopVoice.current();
          ok("Okay, I've stopped listening.");
          break;
        default:
          // Often just background talk, so it never interrupts a line still being read
          say("Sorry, I didn't catch that. Say “help” for ideas.", 2600, "focus");
      }
    },
    [auto, closeArcade, openArcade, openGame, pathname, router, say, talk],
  );

  const voice = useVoice(
    (guesses) => {
      // The first guess that is a real command wins; "open …" without a clear page, then nothing, come last
      const parsed = guesses.map((text) => ({ text, cmd: parseCommand(text) }));
      const rank = (c: VoiceCommand) => (c.type === "unknown" ? 2 : c.type === "which" ? 1 : 0);
      const pick = parsed.reduce((a, b) => (rank(b.cmd) < rank(a.cmd) ? b : a));
      onCommand(pick.cmd);
      return pick.text;
    },
    (err) =>
      say(
        err === "blocked"
          ? "I can't hear you: the microphone is blocked. Allow it in the address bar, then try again."
          : "My speech service is offline right now. Try again in a moment.",
        undefined,
        "focus",
        true,
      ),
  );
  useEffect(() => {
    stopVoice.current = voice.stop;
    voiceState.current = { supported: voice.supported, listening: voice.listening };
  }, [voice.stop, voice.supported, voice.listening]);
  // No pet on touch screens (or with reduced motion), so no listening there either
  useEffect(() => {
    if (!on && voice.listening) voice.stop();
  }, [on, voice]);

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

  /** A punch from the cursor at (cx, cy). */
  const punch = useCallback(
    (cx: number, cy: number) => {
      const p = phys.current;
      const pos = posRef.current;
      const now = performance.now();
      if (tipOpen.current) closeTip();
      // Knocked away from the fist, with a spin, a squash and a wince
      const dx = pos.x + SIZE / 2 - cx;
      const dy = pos.y + H / 2 - cy;
      const d = Math.hypot(dx, dy) || 1;
      const dir = dx >= 0 ? 1 : -1;
      p.kvx += (dx / d) * 560;
      p.kvy += (dy / d) * 560 - 140;
      p.rotV += dir * 560;
      p.stunUntil = now + 900;
      p.hits = now - p.lastHit > PUNCH_RESET_MS ? 1 : p.hits + 1;
      p.lastHit = now;
      squash.current?.animate(
        [
          { transform: "scale(1, 1)" },
          { transform: "scale(1.2, 0.78)", offset: 0.2 },
          { transform: "scale(0.9, 1.1)", offset: 0.55 },
          { transform: "scale(1.03, 0.98)", offset: 0.8 },
          { transform: "scale(1, 1)" },
        ],
        { duration: 480, easing: "ease-out" },
      );
      setOuch(true);
      window.clearTimeout(ouchTimer.current);
      ouchTimer.current = window.setTimeout(() => setOuch(false), 500);
      if (p.hits < PUNCHES_TO_KO) {
        say(PUNCH_LINES[p.hits - 1] ?? PUNCH_LINES[0], 2200, "focus", true);
        return;
      }
      // Knockout: the punch carries it off and it drops, powered off
      p.hits = 0;
      p.mode = "off";
      p.wakeAt = now + OFF_MS;
      p.lie = dir;
      pos.x += p.kx;
      pos.y += p.ky;
      p.vx = p.kvx * 1.2;
      p.vy = Math.min(p.kvy, -260);
      p.kx = p.ky = p.kvx = p.kvy = 0;
      setPower("off");
      setBeaming(false);
      say(KO_LINE, 2000, "idle", true);
    },
    [closeTip, say],
  );

  // While the pet is on, a quick click is a punch (on release) and click-and-hold opens the arcade
  const [charging, setCharging] = useState(false);
  const hold = useRef({ timer: 0, active: false });
  const hintTimer = useRef(0);

  /** Pressing the pet: starts a hold while it is on, grabs it while it is powered off. */
  const onPetDown = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>) => {
      if (e.button !== 0) return;
      e.preventDefault();
      const p = phys.current;
      const pos = posRef.current;
      window.clearTimeout(hintTimer.current);
      if (p.mode === "off") {
        e.currentTarget.setPointerCapture(e.pointerId);
        p.drag = true;
        p.gx = e.clientX - pos.x;
        p.gy = e.clientY - pos.y;
        setGrabbing(true);
        return;
      }
      if (p.mode !== "on" || arcadeOpen.current) return;
      e.currentTarget.setPointerCapture(e.pointerId);
      const h = hold.current;
      h.active = true;
      setCharging(true);
      window.clearTimeout(h.timer);
      h.timer = window.setTimeout(() => {
        h.active = false;
        setCharging(false);
        store.set(ARCADE_HINT_KEY, "1"); // found it, no need for the hint
        openArcade();
      }, HOLD_MS);
    },
    [openArcade],
  );

  const onPetUp = useCallback((e: ReactPointerEvent<HTMLDivElement>) => {
    const p = phys.current;
    if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId);
    const h = hold.current;
    if (h.active) {
      // Let go before the arcade opened: that was a punch (a lost capture just cancels)
      h.active = false;
      window.clearTimeout(h.timer);
      setCharging(false);
      if (e.type === "pointerup") punch(e.clientX, e.clientY);
      return;
    }
    if (!p.drag) return;
    p.drag = false;
    // Thrown with the speed it was carried at; it lands before it wakes up
    p.wakeAt = Math.max(p.wakeAt, performance.now() + 1500);
    setGrabbing(false);
  }, [punch]);

  /** Resting the cursor on the pet: once per visit it mentions the arcade. */
  const onPetEnter = useCallback(() => {
    phys.current.hover = true;
    if (store.get(ARCADE_HINT_KEY)) return;
    window.clearTimeout(hintTimer.current);
    hintTimer.current = window.setTimeout(() => {
      if (!phys.current.hover || phys.current.mode !== "on" || hold.current.active || tipOpen.current) return;
      if (say("Psst… click and hold me for games.", 3200, "happy")) store.set(ARCADE_HINT_KEY, "1");
    }, ARCADE_HINT_MS);
  }, [say]);
  const onPetLeave = useCallback(() => {
    phys.current.hover = false;
    window.clearTimeout(hintTimer.current);
  }, []);

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
      if (tipped || tipOpen.current || phys.current.mode !== "on" || now < busyUntil.current + 1000) return;
      if (now - lastScroll < SCROLL_SETTLE_MS) return;
      const el = pet.current;
      if (!el || el.style.opacity === "0") return; // the pet is hidden right now
      // Voice is offered once per visit, early, before any page suggestion
      const v = voiceState.current;
      if (v.supported && !v.listening && !store.get(VOICE_OFFERED_KEY)) {
        if (now - enteredAt < VOICE_OFFER_MS) return;
        store.set(VOICE_OFFERED_KEY, "1");
        setTipBelow(el.getBoundingClientRect().top < 190);
        tipOpen.current = true;
        setTip(VOICE_TIP);
        setMood("happy");
        holdTip(TIP_SHOW_MS + 4000);
        return;
      }
      if (gameDue.current && !gameOpen.current && !store.get(GAME_OFFERED_KEY)) {
        store.set(GAME_OFFERED_KEY, "1");
        gameDue.current = false;
        setTipBelow(el.getBoundingClientRect().top < 170);
        tipOpen.current = true;
        setTip(GAME_TIP);
        setMood("happy");
        holdTip(TIP_SHOW_MS + 4000);
        return;
      }
      if (now - enteredAt < TIP_MIN_ON_PAGE_MS) return;
      if (Number(store.get(TIPS_OFF_KEY) ?? 0) >= 2) return;
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

    /** Springs the body's tilt toward a target angle. */
    const spin = (target: number, k: number, damp: number, dt: number) => {
      const p = phys.current;
      p.rotV += ((target - p.rot) * k - p.rotV * damp) * dt;
      p.rot += p.rotV * dt;
      if (tumble.current) tumble.current.style.transform = `rotate(${p.rot.toFixed(2)}deg)`;
    };

    /** Powered off: falls, bounces and lies on its side, or dangles while carried. Then reboots. */
    const powered = (now: number, dt: number, el: HTMLDivElement) => {
      const p = phys.current;
      const W = window.innerWidth;
      const VH = window.innerHeight;
      const rad = (p.rot * Math.PI) / 180;
      // How far the body reaches below its centre; less once it has tipped over
      const reach = 34 * Math.abs(Math.cos(rad)) + 27 * Math.abs(Math.sin(rad));
      const floor = VH - 4 - H / 2 - reach;
      if (p.mode === "boot") {
        const t = Math.min(1, (now - p.bootAt) / BOOT_MS);
        pos.y += (floor - 28 - pos.y) * Math.min(1, dt * 4);
        spin(0, 90, 11, dt);
        if (flame.current) flame.current.style.transform = `scaleY(${(t * 0.6).toFixed(3)})`;
        if (t >= 1) {
          p.mode = "on";
          vel.x = vel.y = 0;
          setPower("on");
          say(WAKE_LINES[Math.floor(Math.random() * WAKE_LINES.length)], undefined, "happy", true);
        }
      } else if (p.drag) {
        const tx = clamp(mouse.x - p.gx, -SIZE / 2, W - SIZE / 2);
        const ty = clamp(mouse.y - p.gy, -H / 2, VH - H / 2);
        const nx = pos.x + (tx - pos.x) * 0.55;
        const ny = pos.y + (ty - pos.y) * 0.55;
        if (dt > 0.001) {
          p.vx = p.vx * 0.5 + clamp((nx - pos.x) / dt, -2400, 2400) * 0.5;
          p.vy = p.vy * 0.5 + clamp((ny - pos.y) / dt, -2400, 2400) * 0.5;
        }
        pos.x = nx;
        pos.y = ny;
        // Limp: it swings against the motion, like something being carried
        spin(clamp(-p.vx * 0.045, -65, 65) + p.lie * 12, 55, 4.5, dt);
      } else {
        p.vy += 2600 * dt;
        pos.x += p.vx * dt;
        pos.y += p.vy * dt;
        if (pos.x < 4 || pos.x > W - SIZE - 4) {
          pos.x = clamp(pos.x, 4, W - SIZE - 4);
          p.vx *= -0.45;
          p.rotV -= p.lie * 90;
        }
        const grounded = pos.y >= floor - 0.5;
        if (pos.y >= floor) {
          pos.y = floor;
          if (p.vy > 320) {
            p.vy *= -0.3; // a small bounce
            p.rotV += p.lie * 140;
          } else p.vy = 0;
          p.vx *= Math.max(0, 1 - 7 * dt);
        }
        spin(p.lie * 84, grounded ? 140 : 16, grounded ? 13 : 2.5, dt);
        if (flame.current) flame.current.style.transform = "scaleY(0)";
        if (now >= p.wakeAt && grounded) {
          p.mode = "boot";
          p.bootAt = now;
          setPower("boot");
          say(BOOT_LINE, BOOT_MS + 400, "idle", true);
          // The eyes flicker back on
          eyes.current?.animate(
            [
              { opacity: 0 },
              { opacity: 1, offset: 0.12 },
              { opacity: 0.1, offset: 0.24 },
              { opacity: 0.9, offset: 0.4 },
              { opacity: 0.25, offset: 0.55 },
              { opacity: 1 },
            ],
            { duration: 900, easing: "linear" },
          );
        }
      }
      el.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0)`;
      if (body.current) body.current.style.transform = "";
      if (eyes.current) eyes.current.style.transform = "";
    };

    const loop = (now: number) => {
      frame = requestAnimationFrame(loop);
      const el = pet.current;
      if (!el) return;
      const p = phys.current;
      const dt = Math.min(0.05, (now - lastNow) / 1000);
      lastNow = now;

      // Hide while any section with its own robot or stage (services and phase rails, the workflow stage) fills
      // the screen. Looked up every frame: those sections only switch the marker on once they are active.
      const hidden = Array.from(document.querySelectorAll("[data-pet-hide]")).some((h) => {
        const r = h.getBoundingClientRect();
        return r.top <= 1 && r.bottom >= window.innerHeight - 1;
      });
      el.style.opacity = hidden || !readyRef.current ? "0" : "1";
      if (!readyRef.current) return; // nothing to follow yet

      // Knock-back from a punch: a spring that pulls the pet back to where it was hit
      p.kvx += (-p.kx * 170 - p.kvx * 13) * dt;
      p.kvy += (-p.ky * 170 - p.kvy * 13) * dt;
      p.kx += p.kvx * dt;
      p.ky += p.kvy * dt;

      if (p.mode !== "on") {
        if (beamAt) {
          beamAt = 0;
          setBeaming(false);
        }
        powered(now, dt, el);
        return;
      }

      // Keep to one side of the cursor so it never covers what is being pointed at
      if (mouse.x < 150) side = -1;
      else if (mouse.x > window.innerWidth - 150) side = 1;
      if (side !== shownSide && !tipOpen.current) setFlip((shownSide = side) < 0);
      // Stays put while a suggestion is open (so its button can be reached), while the cursor is on it
      // and right after a punch (so it can be punched again)
      const still = tipOpen.current || p.hover || now < p.stunUntil;
      const tx = still ? pos.x : clamp(mouse.x - side * 78 - SIZE / 2, 8, window.innerWidth - SIZE - 8);
      const ty = still ? pos.y : clamp(mouse.y - 92, 8, window.innerHeight - SIZE - 24);
      const nx = pos.x + (tx - pos.x) * 0.075;
      const ny = pos.y + (ty - pos.y) * 0.075;
      vel.x = vel.x * 0.8 + (nx - pos.x) * 0.2;
      vel.y = vel.y * 0.8 + (ny - pos.y) * 0.2;
      pos.x = nx;
      pos.y = ny;
      el.style.transform = `translate3d(${pos.x + p.kx}px, ${pos.y + p.ky}px, 0)`;
      spin(0, 120, 10, dt);

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
      if (!hidden && readyRef.current && !tipOpen.current && !gameOpen.current && !beamedThisRest && now - lastMove > IDLE_MS) {
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
    };
  }, [on, pathname, say, talk]);

  useEffect(
    () => () => {
      window.clearTimeout(hideTimer.current);
      window.clearTimeout(ouchTimer.current);
      window.clearTimeout(hold.current.timer);
      window.clearTimeout(hintTimer.current);
    },
    [],
  );

  if (!on) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-40">
      {game && <BugHunt onClose={closeGame} />}
      {/* Voice: a mic button that is always there; while on it becomes a bar with what it heard */}
      {voice.supported && !voice.listening && (
        <button
          type="button"
          onClick={() => {
            if (tipOpen.current) closeTip();
            voice.start();
            say("I'm listening! Say “help” to hear what I can do.", undefined, "happy", true);
          }}
          onMouseEnter={() => {
            // A nudge from the pet, at most every few seconds
            const now = performance.now();
            if (phys.current.mode !== "on" || now < nudgeAt.current) return;
            nudgeAt.current = now + 5000;
            say(VOICE_NUDGES[nudgeIdx.current++ % VOICE_NUDGES.length], 3000, "happy", true);
          }}
          title="Voice commands"
          className="group pointer-events-auto absolute bottom-5 left-5 flex items-center gap-2 border border-line-strong bg-ink-950/90 py-1.5 pr-3 pl-2.5 text-xs text-fg-muted backdrop-blur-sm transition-colors hover:border-brand-400/50 hover:text-fg"
        >
          <Mic aria-hidden className="size-3.5 text-brand-300" />
          <span className="font-mono text-[10px] tracking-[0.16em] uppercase">Voice</span>
          <span className="sr-only">Turn on voice commands</span>
        </button>
      )}
      {voice.listening && (
        <div
          role="status"
          className="pointer-events-auto absolute bottom-5 left-5 flex max-w-[calc(100vw-2.5rem)] items-center gap-2.5 border border-brand-400/40 bg-ink-950/90 py-1.5 pr-1.5 pl-3 text-xs text-fg shadow-[0_0_24px_-8px_var(--color-brand-500)] backdrop-blur-sm"
        >
          <span aria-hidden className="relative flex size-2.5 shrink-0">
            <span className="absolute inset-0 animate-ping rounded-full bg-brand-400/70" />
            <span className="relative size-2.5 rounded-full bg-brand-400" />
          </span>
          <Mic aria-hidden className="size-3.5 shrink-0 text-brand-300" />
          <span className="font-mono text-[10px] tracking-[0.16em] text-brand-300 uppercase">Listening</span>
          {voice.heard && <span className="max-w-56 truncate text-fg-muted">“{voice.heard}”</span>}
          <button
            type="button"
            aria-label="Turn off voice commands"
            onClick={() => {
              auto.stop();
              voice.stop();
            }}
            className="grid size-6 shrink-0 place-items-center rounded text-fg-subtle transition-colors hover:text-fg"
          >
            <X aria-hidden className="size-3.5" />
          </button>
        </div>
      )}
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
        {/* Fills while the pet is held; full means the arcade opens */}
        <svg
          aria-hidden
          viewBox="0 0 100 100"
          className="pointer-events-none absolute top-1/2 left-1/2 size-24 -translate-x-1/2 -translate-y-[46%] -rotate-90"
        >
          <circle
            cx={50}
            cy={50}
            r={46}
            pathLength={100}
            strokeWidth={3}
            strokeLinecap="round"
            strokeDasharray="100 100"
            className="fill-none stroke-brand-300"
            style={{
              opacity: charging ? 1 : 0,
              strokeDashoffset: charging ? 0 : 100,
              transition: charging ? `stroke-dashoffset ${HOLD_MS}ms linear, opacity 0.15s` : "opacity 0.15s",
            }}
          />
        </svg>
        {arcade && (
          <div
            role="dialog"
            aria-label="Arcade"
            className={cn(
              "pointer-events-auto absolute w-72 border border-brand-400/50 bg-ink-950/95 p-3.5 shadow-[0_0_30px_-8px_var(--color-brand-500)] backdrop-blur-sm",
              tipBelow ? "top-full mt-2" : "bottom-full mb-2",
              flip ? "left-2" : "right-2",
            )}
          >
            <span aria-hidden className="absolute -top-px -left-px size-2 border-t-2 border-l-2 border-brand-300" />
            <span aria-hidden className="absolute -right-px -bottom-px size-2 border-r-2 border-b-2 border-brand-300" />
            <button
              type="button"
              aria-label="Close the arcade"
              onClick={closeArcade}
              className="absolute top-1.5 right-1.5 grid size-6 place-items-center rounded text-fg-subtle transition-colors hover:text-fg"
            >
              <X aria-hidden className="size-3.5" />
            </button>
            <p className="flex items-center gap-1.5 font-mono text-[10px] tracking-[0.16em] text-brand-300 uppercase">
              <Gamepad2 aria-hidden className="size-3.5" />
              Arcade
            </p>
            <p className="mt-1 pr-5 text-sm leading-snug text-fg">Pick a game. More are on the way.</p>
            <ul className="mt-3 grid gap-2">
              {GAMES.map((g) => (
                <li
                  key={g.id}
                  className={cn(
                    "flex items-center gap-3 border p-2.5",
                    g.ready ? "border-line-strong bg-ink-850/60" : "border-line opacity-60",
                  )}
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-fg">
                      {g.name}
                      {g.id === "bug-hunt" && bestScore > 0 && (
                        <span className="ml-2 font-mono text-xs font-normal text-fg-subtle">best {bestScore}</span>
                      )}
                    </p>
                    <p className="text-xs leading-snug text-fg-muted">{g.blurb}</p>
                  </div>
                  {g.ready ? (
                    <button
                      type="button"
                      onClick={() => {
                        closeArcade();
                        openGame();
                      }}
                      className="btn btn-primary btn-sm shrink-0"
                    >
                      Play
                    </button>
                  ) : (
                    <span className="shrink-0 font-mono text-[10px] tracking-[0.14em] text-fg-subtle uppercase">Soon</span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
        {line && !tip && !arcade && (
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
            {tip.action === "game" ? (
              <button
                type="button"
                onClick={() => {
                  closeTip();
                  openGame();
                }}
                className="btn btn-primary btn-sm mt-3 w-full justify-center"
              >
                <Gamepad2 aria-hidden className="size-3.5" />
                {tip.cta}
              </button>
            ) : tip.action === "voice" ? (
              <>
                <button
                  type="button"
                  onClick={() => {
                    closeTip();
                    voice.start();
                    say("I'm listening! Say “help” to hear what I can do.", undefined, "happy", true);
                  }}
                  className="btn btn-primary btn-sm mt-3 w-full justify-center"
                >
                  <Mic aria-hidden className="size-3.5" />
                  {tip.cta}
                </button>
                <p className="mt-2 text-xs leading-snug text-fg-subtle">
                  Your browser asks for the microphone, and its speech service turns what you say into text.
                </p>
              </>
            ) : (
              <Link
                href={tip.href}
                onClick={() => closeTip()}
                className="btn btn-primary btn-sm mt-3 w-full justify-center"
              >
                {tip.cta}
                <ArrowRight aria-hidden className="size-3.5" />
              </Link>
            )}
          </div>
        )}
        <div
          aria-hidden
          className="animate-[hover-bob_2.4s_ease-in-out_infinite]"
          style={{ animationPlayState: power === "on" ? "running" : "paused" }}
        >
          {/* Punch it while it's on; grab and drag it while it's powered off */}
          <div
            ref={tumble}
            onPointerDown={onPetDown}
            onPointerUp={onPetUp}
            onLostPointerCapture={onPetUp}
            onPointerEnter={onPetEnter}
            onPointerLeave={onPetLeave}
            className={cn(
              "pointer-events-auto touch-none select-none",
              power === "on" && "cursor-pointer",
              power === "off" && (grabbing ? "cursor-grabbing" : "cursor-grab"),
            )}
          >
          <div ref={squash}>
          <svg viewBox="0 0 72 82" width={SIZE} className="block overflow-visible">
            <ellipse
              cx={36}
              cy={80}
              rx={15}
              ry={2}
              className={cn("fill-brand-500/25 transition-opacity duration-500", power !== "on" && "opacity-0")}
            />
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
                className={cn(power === "on" && mood === "happy" && "animate-[pet-wave_0.9s_ease-in-out_2]")}
              >
                <rect x={63} y={34} width={8} height={14} rx={4} className="fill-ink-800 stroke-line-strong" />
              </g>
              {/* Antenna */}
              <line x1={36} y1={16} x2={36} y2={6} className="stroke-line-strong" strokeWidth={1.5} />
              <circle
                cx={36}
                cy={5}
                r={2.6}
                className={cn(
                  "transition-colors duration-500",
                  power === "off" ? "fill-line-strong" : "fill-brand-400",
                  power === "on" && (mood === "focus" ? "animate-ping" : "animate-pulse"),
                  power === "boot" && "animate-ping",
                )}
              />
              {/* Head */}
              <rect x={8} y={16} width={56} height={42} rx={20} className="fill-ink-850 stroke-line-strong" strokeWidth={1.5} />
              {/* Face screen */}
              <rect
                x={15}
                y={24}
                width={42}
                height={26}
                rx={12}
                className={cn("fill-ink-950 transition-colors duration-500", power === "off" ? "stroke-line-strong" : "stroke-brand-400/50")}
              />
              <g ref={eyes}>
                {power === "off" ? (
                  // Knocked out
                  <g className="fill-none stroke-fg-muted" strokeWidth={2.4} strokeLinecap="round">
                    <path d="M25 31l6 6m0-6-6 6" />
                    <path d="M41 31l6 6m0-6-6 6" />
                  </g>
                ) : ouch ? (
                  // Wincing after a punch
                  <g className="fill-none stroke-brand-300" strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M25 31l6 4.5-6 4.5" />
                    <path d="M47 31l-6 4.5 6 4.5" />
                  </g>
                ) : mood === "happy" ? (
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
              <g className={cn("transition-opacity duration-500", power === "off" && "opacity-0")}>
                <circle cx={21} cy={44} r={2.2} className="fill-human-accent/40" />
                <circle cx={51} cy={44} r={2.2} className="fill-human-accent/40" />
              </g>
            </g>
          </svg>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
}
