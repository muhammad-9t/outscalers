"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { scrollByY } from "@/lib/smooth-scroll";

/* Voice commands for the pet, through the browser's Web Speech API (Chrome, Edge and Safari; not Firefox).
   The browser's speech service turns speech into text; the site only matches that text against commands. */

// The Web Speech API is not in TypeScript's DOM types, so just the parts used here
type Alternative = { transcript: string };
type Result = ArrayLike<Alternative> & { isFinal: boolean };
type Recognition = {
  lang: string;
  phrases?: unknown[];
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  start(): void;
  abort(): void;
  onresult: ((e: { resultIndex: number; results: ArrayLike<Result> }) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
};
type RecognitionCtor = new () => Recognition;

const getRecognition = (): RecognitionCtor | null => {
  if (typeof window === "undefined") return null;
  const w = window as unknown as { SpeechRecognition?: RecognitionCtor; webkitSpeechRecognition?: RecognitionCtor };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
};

// The words the commands use; browsers that support it are told to expect them
const VOCABULARY = [
  "portfolio", "services", "how we work", "about us", "contact", "home page", "start a project",
  "AI solutions", "software development", "automation", "data and cloud", "security",
  "open", "scroll", "scroll slow", "stop", "faster", "slower", "go back", "next page", "reload", "go to top", "help",
];

/** The visitor's own English variant (accents are recognised better), or US English. */
const pickLang = () => navigator.languages?.find((l) => /^en\b/i.test(l)) ?? "en-US";

const normalise = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s']/gu, " ")
    .replace(/\s+/g, " ")
    .trim();

const VOICE_KEY = "pet-voice-on";
const session = {
  get: (k: string) => {
    try {
      return sessionStorage.getItem(k);
    } catch {
      return null;
    }
  },
  set: (k: string, v: string | null) => {
    try {
      if (v === null) sessionStorage.removeItem(k);
      else sessionStorage.setItem(k, v);
    } catch {}
  },
};

export type VoiceError = "blocked" | "network" | null;

/**
 * Listens continuously while on. Each finished phrase goes to `onPhrase` as the recogniser's guesses, best
 * first (lower case, no punctuation); it returns the guess it used, which is shown as what was heard.
 * Stays on across page changes in the same tab, and resumes after a reload if it was on.
 */
export function useVoice(
  onPhrase: (guesses: string[]) => string | void,
  onError: (e: Exclude<VoiceError, null>) => void,
) {
  const [supported, setSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const [heard, setHeard] = useState<string | null>(null);
  const rec = useRef<Recognition | null>(null);
  const wanted = useRef(false);
  const restart = useRef<number>(0);
  const phraseRef = useRef(onPhrase);
  const errorRef = useRef(onError);
  useEffect(() => {
    phraseRef.current = onPhrase;
    errorRef.current = onError;
  });

  const stop = useCallback(() => {
    wanted.current = false;
    window.clearTimeout(restart.current);
    session.set(VOICE_KEY, null);
    try {
      rec.current?.abort();
    } catch {}
    setListening(false);
    setHeard(null);
  }, []);

  const start = useCallback(() => {
    const Ctor = getRecognition();
    if (!Ctor) return;
    if (!rec.current) {
      const r = new Ctor();
      r.lang = pickLang();
      r.continuous = true;
      r.interimResults = false;
      r.maxAlternatives = 5;
      // Newer Chrome can be told which phrases to expect, which helps with names like "portfolio"
      const Phrase = (window as unknown as { SpeechRecognitionPhrase?: new (p: string, boost: number) => unknown })
        .SpeechRecognitionPhrase;
      if (Phrase && "phrases" in r) {
        try {
          r.phrases = VOCABULARY.map((p) => new Phrase(p, 5));
        } catch {}
      }
      r.onresult = (e) => {
        for (let i = e.resultIndex; i < e.results.length; i++) {
          const res = e.results[i];
          if (!res.isFinal) continue;
          const guesses = Array.from(res, (a) => normalise(a.transcript)).filter(Boolean);
          if (!guesses.length) continue;
          setHeard(phraseRef.current(guesses) || guesses[0]);
        }
      };
      r.onerror = (e) => {
        if (e.error === "not-allowed" || e.error === "service-not-allowed") {
          stop();
          errorRef.current("blocked");
        } else if (e.error === "phrases-not-supported") {
          r.phrases = []; // this recogniser can't take hints; it restarts without them
        } else if (e.error === "network") {
          stop();
          errorRef.current("network");
        } // "no-speech" and "aborted" are normal: it just restarts
      };
      // Browsers end recognition after a pause; keep going while it is wanted
      r.onend = () => {
        if (!wanted.current) return;
        restart.current = window.setTimeout(() => {
          try {
            if (wanted.current) r.start();
          } catch {}
        }, 250);
      };
      rec.current = r;
    }
    wanted.current = true;
    session.set(VOICE_KEY, "1");
    try {
      rec.current.start();
    } catch {} // already running
    setListening(true);
  }, [stop]);

  useEffect(() => {
    // Supported only where the API exists; checked after mounting so server and client markup agree
    const ok = !!getRecognition();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reading a browser capability once
    setSupported(ok);
    if (ok && session.get(VOICE_KEY)) start();
    return () => {
      wanted.current = false;
      window.clearTimeout(restart.current);
      try {
        rec.current?.abort();
      } catch {}
    };
  }, [start]);

  return { supported, listening, heard, start, stop };
}

/** Scrolls the page by itself at a steady speed until stopped, the end is reached, or the visitor scrolls. */
export function useAutoScroll(onEnd: () => void) {
  const speed = useRef(0); // px per second; negative scrolls up
  const raf = useRef(0);
  const endRef = useRef(onEnd);
  useEffect(() => {
    endRef.current = onEnd;
  });

  const stop = useCallback(() => {
    speed.current = 0;
    cancelAnimationFrame(raf.current);
  }, []);

  const run = useCallback(
    (pxPerSecond: number) => {
      cancelAnimationFrame(raf.current);
      speed.current = pxPerSecond;
      let last = performance.now();
      let carry = 0; // sub-pixel remainder, so slow speeds still move
      const tick = (now: number) => {
        const dt = Math.min(0.05, (now - last) / 1000);
        last = now;
        const max = document.documentElement.scrollHeight - window.innerHeight;
        const atEnd = speed.current > 0 ? window.scrollY >= max - 1 : window.scrollY <= 0;
        if (atEnd) {
          stop();
          endRef.current();
          return;
        }
        carry += speed.current * dt;
        const step = Math.trunc(carry);
        if (step) {
          scrollByY(step);
          carry -= step;
        }
        raf.current = requestAnimationFrame(tick);
      };
      raf.current = requestAnimationFrame(tick);
    },
    [stop],
  );

  // Taking over the scrolling by hand stops it
  useEffect(() => {
    const takeOver = () => speed.current && stop();
    const onKey = (e: KeyboardEvent) => {
      if (["ArrowUp", "ArrowDown", "PageUp", "PageDown", "Home", "End", " "].includes(e.key)) takeOver();
    };
    window.addEventListener("wheel", takeOver, { passive: true });
    window.addEventListener("touchstart", takeOver, { passive: true });
    window.addEventListener("keydown", onKey);
    return () => {
      cancelAnimationFrame(raf.current);
      window.removeEventListener("wheel", takeOver);
      window.removeEventListener("touchstart", takeOver);
      window.removeEventListener("keydown", onKey);
    };
  }, [stop]);

  return { run, stop, speed };
}

export const SCROLL_SPEED = { slow: 70, normal: 170, fast: 450 } as const;

export type VoiceCommand =
  | { type: "open"; href: string; label: string }
  | { type: "scroll"; speed: keyof typeof SCROLL_SPEED; up: boolean }
  | { type: "faster" | "slower" }
  | { type: "stop" | "top" | "bottom" | "back" | "forward" | "reload" }
  | { type: "joke" | "help" | "where" | "hello" | "dance" | "thanks" | "mute" }
  | { type: "which" } // "open …" without a page it could make out
  | { type: "unknown" };

// Checked in order, so specific pages come before general ones ("how we work" before "work")
const PAGES: { words: RegExp; href: string; label: string }[] = [
  { words: /\b(start a project|start project|project form|hire you)\b/, href: "/contact#start-project", label: "the project form" },
  { words: /\b(ai|a i|artificial intelligence|agents?)\b/, href: "/services/ai-solutions", label: "AI Solutions & Agents" },
  { words: /\b(software|development|app)\b/, href: "/services/software-development", label: "Custom Software Development" },
  { words: /\b(automation|automate)\b/, href: "/services/automation", label: "Business Process Automation" },
  { words: /\b(data|cloud)\b/, href: "/services/data-cloud", label: "Data Engineering & Cloud" },
  { words: /\b(security|quality|testing)\b/, href: "/services/security-quality", label: "Security & Quality Engineering" },
  { words: /\b(how we work|how you work|process|workflow)\b/, href: "/how-we-work", label: "How We Work" },
  { words: /\b(services?|what you do)\b/, href: "/services", label: "Services" },
  {
    words: /\b(portfolios?|port ?folio|fort ?folio|port ?polio|projects|case stud(y|ies)|your work|our work)\b/,
    href: "/portfolio",
    label: "Portfolio",
  },
  { words: /\b(about|team|who you are)\b/, href: "/about", label: "About Us" },
  { words: /\b(contact|get in touch|talk to you|email)\b/, href: "/contact", label: "Contact" },
  { words: /\b(home|homepage|home page|start page|main page)\b/, href: "/", label: "the home page" },
];

/** Turns a phrase into a command. Phrases are short, so simple keyword matching is enough. */
export function parseCommand(t: string): VoiceCommand {
  const has = (re: RegExp) => re.test(t);
  if (has(/\b(stop listening|microphone off|mic off|turn off voice|voice off|goodbye|bye)\b/)) return { type: "mute" };
  if (has(/\b(stop|pause|halt|freeze|enough|wait)\b/)) return { type: "stop" };
  if (has(/\b(top|beginning)\b/)) return { type: "top" };
  if (has(/\b(bottom|the end|footer)\b/)) return { type: "bottom" };
  if (has(/\b(faster|speed up|quicker)\b/)) return { type: "faster" };
  if (has(/\b(slower|slow down)\b/)) return { type: "slower" };
  if (has(/\b(scroll|scrolling|keep going|move down|go down|read)\b/) || (has(/\bup\b/) && has(/\b(go|move)\b/)))
    return { type: "scroll", up: has(/\bup\b/), speed: has(/\bslow/) ? "slow" : has(/\b(fast|quick)/) ? "fast" : "normal" };
  if (has(/\b(go back|previous|back)\b/)) return { type: "back" };
  if (has(/\b(next page|forward|next)\b/)) return { type: "forward" };
  if (has(/\b(reload|refresh)\b/)) return { type: "reload" };
  if (has(/\b(joke|funny|laugh)\b/)) return { type: "joke" };
  if (has(/\b(help|commands|what can i say|what can you do)\b/)) return { type: "help" };
  if (has(/\b(where am i|which page|what page)\b/)) return { type: "where" };
  if (has(/\b(dance|spin|party)\b/)) return { type: "dance" };
  if (has(/\b(thanks|thank you|good job|well done|good bot|good robot)\b/)) return { type: "thanks" };
  const asked = has(/\b(open|go to|goto|show|take me|navigate|visit|bring me)\b/);
  const page = PAGES.find((p) => p.words.test(t)) ?? closePage(t);
  // "open …", "go to …", "show me …", or just a page name on its own
  if (page && (asked || t.split(" ").length <= 3)) return { type: "open", href: page.href, label: page.label };
  if (has(/^(hi|hello|hey|good (morning|afternoon|evening))\b/)) return { type: "hello" };
  if (asked) return { type: "which" };
  return { type: "unknown" };
}

/** Edit distance between two words. */
function distance(a: string, b: string) {
  const row = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    let prev = row[0];
    row[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const cur = row[j];
      row[j] = Math.min(row[j] + 1, row[j - 1] + 1, prev + (a[i - 1] === b[j - 1] ? 0 : 1));
      prev = cur;
    }
  }
  return row[b.length];
}

// Page names a misheard word can be close to
const NAMES: [string, string][] = [
  ["portfolio", "/portfolio"],
  ["services", "/services"],
  ["contact", "/contact"],
  ["about", "/about"],
  ["automation", "/services/automation"],
  ["software", "/services/software-development"],
  ["security", "/services/security-quality"],
  ["workflow", "/how-we-work"],
  ["process", "/how-we-work"],
  ["homepage", "/"],
];

/** A page whose name is one or two letters off a word in the phrase (or two words run together). */
function closePage(t: string) {
  const words = t.split(" ").filter((w) => w.length >= 4);
  const pairs = t.split(" ").slice(1).map((w, i) => t.split(" ")[i] + w); // "port folio" → "portfolio"
  let best: { href: string; score: number } | null = null;
  for (const w of [...words, ...pairs]) {
    for (const [name, href] of NAMES) {
      const score = distance(w, name) / name.length;
      if (score <= 0.3 && (!best || score < best.score)) best = { href, score };
    }
  }
  return best ? PAGES.find((p) => p.href === best.href) : undefined;
}

export const PAGE_NAMES: Record<string, string> = {
  "/": "the home page",
  "/services": "Services",
  "/how-we-work": "How We Work",
  "/portfolio": "Portfolio",
  "/about": "About Us",
  "/contact": "Contact",
};
