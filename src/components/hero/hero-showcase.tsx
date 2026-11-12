"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  AlertCircle,
  ArrowDown,
  Bell,
  Bot,
  Check,
  Code2,
  Layers,
  Plus,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react";
import { cn } from "@/lib/cn";

type SlideId = "intro" | "setup" | "build" | "scale" | "ship";

type SlideSpec = {
  id: SlideId;
  code: string;
  tab: string;
  pill: string;
};

const SLIDES: SlideSpec[] = [
  {
    id: "intro",
    code: "01 / VISION",
    tab: "Human + AI",
    pill: "Human intelligence · AI engineering",
  },
  {
    id: "setup",
    code: "02 / SETUP",
    tab: "Architecture Setup",
    pill: "Architecture & AI setup",
  },
  {
    id: "build",
    code: "03 / BUILD",
    tab: "AI + Human Build",
    pill: "AI speed · Human review",
  },
  {
    id: "scale",
    code: "04 / SCALE",
    tab: "Full-Stack Scale",
    pill: "5 core disciplines",
  },
  {
    id: "ship",
    code: "05 / SHIP",
    tab: "Continuous Delivery",
    pill: "Signed off & shipped",
  },
];

const SLIDE_DURATION = 5600; // ms per slide

/**
 * Illustrated engineer portrait avatar (clean duotone vector portrait with badge)
 */
function EngineerAvatar({
  variant,
  className,
}: {
  variant: "marcus" | "sara" | "elena";
  className?: string;
}) {
  const palette = {
    marcus: { bg: "#1c2838", accent: "#38bdf8", shirt: "#0f172a" },
    sara: { bg: "#2b1c14", accent: "#ff7426", shirt: "#181311" },
    elena: { bg: "#172536", accent: "#ffa24c", shirt: "#0e1624" },
  }[variant];

  return (
    <div
      className={cn(
        "relative size-11 shrink-0 overflow-hidden rounded-xl border border-line-strong shadow-inner",
        className,
      )}
      style={{ background: palette.bg }}
    >
      <svg viewBox="0 0 48 48" className="size-full" aria-hidden>
        <circle cx="38" cy="10" r="14" fill={palette.accent} opacity="0.22" />
        {/* Shoulders */}
        <path
          d="M8 48 C10 35, 38 35, 40 48 Z"
          fill={palette.shirt}
          stroke={palette.accent}
          strokeWidth="1"
          strokeOpacity="0.45"
        />
        {/* Collar detail */}
        <path
          d="M19 37 L24 43 L29 37"
          fill="none"
          stroke={palette.accent}
          strokeWidth="1.2"
          strokeOpacity="0.7"
        />
        {/* Neck */}
        <rect x="20.5" y="28" width="7" height="7" rx="3" fill="#d6b89e" />
        {/* Head */}
        <circle cx="24" cy="21" r="8.5" fill="#eccfb4" />
        {/* Hair */}
        {variant === "marcus" && (
          <path
            d="M15.5 20 C15.5 13, 32.5 13, 32.5 20 C31 16.5, 17 16.5, 15.5 20 Z"
            fill="#1e293b"
          />
        )}
        {variant === "sara" && (
          <path
            d="M14.5 23 C14 12, 34 12, 33.5 24 C32 17, 16 17, 14.5 23 Z"
            fill="#0f172a"
          />
        )}
        {variant === "elena" && (
          <path
            d="M15 22 C14.5 12.5, 33.5 12.5, 33 22 C30.5 16, 17.5 16, 15 22 Z"
            fill="#334155"
          />
        )}
        {/* Glasses / minimal facial features */}
        <circle cx="21" cy="21" r="1.1" fill="#0f172a" />
        <circle cx="27" cy="21" r="1.1" fill="#0f172a" />
        <path
          d="M21.5 25 Q24 26.8 26.5 25"
          fill="none"
          stroke="#0f172a"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}

/**
 * Mosey-inspired floating status badge widget (`[✓ ───]` or `[✕ ───]`)
 * Used on orbital rings in Slides 2 & 3.
 */
function OrbitBadgeWidget({
  variant = "check",
  className,
}: {
  variant?: "check" | "cross";
  className?: string;
}) {
  const isCheck = variant === "check";
  return (
    <div
      aria-hidden
      className={cn(
        "hs-card-in pointer-events-none inline-flex items-center gap-2 rounded-full border px-2.5 py-1.5 shadow-md backdrop-blur-md",
        isCheck
          ? "border-human-accent/45 bg-ink-900/95"
          : "border-brand-400/45 bg-ink-900/95",
        className,
      )}
    >
      <span
        className={cn(
          "grid size-4 shrink-0 place-items-center rounded-full text-ink-950",
          isCheck ? "bg-human-accent" : "bg-brand-400",
        )}
      >
        {isCheck ? (
          <Check className="size-2.5 stroke-[3]" />
        ) : (
          <X className="size-2.5 stroke-[3]" />
        )}
      </span>
      <div className="flex flex-col gap-1 pr-1">
        <span
          className={cn(
            "h-1.5 w-7 rounded-full",
            isCheck ? "bg-human-accent/55" : "bg-brand-400/60",
          )}
        />
        <span
          className={cn(
            "h-1 w-4 rounded-full",
            isCheck ? "bg-human-accent/30" : "bg-brand-400/35",
          )}
        />
      </div>
    </div>
  );
}

/**
 * Mosey-inspired floating mini document sheet widget
 */
function MiniDocWidget({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn(
        "hs-card-in pointer-events-none flex h-10 w-8 flex-col justify-center gap-1.5 rounded-lg border border-line-strong bg-ink-900/90 p-1.5 shadow-md backdrop-blur-sm",
        className,
      )}
    >
      <span className="h-1 w-3 rounded-full bg-fg/35" />
      <span className="h-1 w-full rounded-full bg-fg/20" />
      <span className="h-1 w-full rounded-full bg-fg/20" />
      <span className="h-1 w-4/5 rounded-full bg-fg/20" />
    </div>
  );
}

/**
 * Mosey-inspired floating mini 3-row bullet list widget
 */
function MiniListWidget({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn(
        "hs-card-in pointer-events-none flex flex-col gap-1.5 rounded-lg border border-line-strong bg-ink-900/85 p-2 shadow-sm backdrop-blur-sm",
        className,
      )}
    >
      {[0, 1, 2].map((i) => (
        <div key={i} className="flex items-center gap-1.5">
          <span className="size-1 rounded-full bg-fg/35" />
          <span className="h-1 w-4 rounded-full bg-fg/25" />
        </div>
      ))}
    </div>
  );
}

/**
 * Mosey-inspired floating skeleton pill (`[───── ──]`)
 */
function MiniSkeletonPill({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn(
        "hs-card-in pointer-events-none inline-flex flex-col gap-1 rounded-full border border-line bg-ink-900/80 px-3 py-1.5 shadow-sm backdrop-blur-sm",
        className,
      )}
    >
      <span className="h-1 w-10 rounded-full bg-fg/25" />
      <div className="flex items-center gap-1">
        <span className="h-1 w-5 rounded-full bg-fg/18" />
        <span className="h-1 w-3 rounded-full bg-fg/18" />
      </div>
    </div>
  );
}

/**
 * Single Minimal Tech Core Illustration (Outscalers Human + AI Core)
 * One clean, balanced core node designed for both Light Mode and Dark Mode.
 */
function CoreArchitectureArt({
  showPin = false,
  className,
}: {
  showPin?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("relative select-none", className)}>
      {showPin && (
        <div className="hs-pop absolute -top-[20px] left-1/2 z-20 flex -translate-x-1/2 flex-col items-center whitespace-nowrap sm:-top-[18px]">
          <span className="rounded-full bg-fg px-3 py-1 font-mono text-[11px] font-semibold tracking-tight text-ink-950 shadow-md">
            Human + AI Core
          </span>
          <span className="mt-1 grid size-4 place-items-center rounded-full bg-fg text-ink-950 shadow">
            <span className="size-1.5 rounded-full bg-brand-400" />
          </span>
        </div>
      )}

      <svg
        viewBox="0 0 240 210"
        className="hs-monument mx-auto h-44 w-48 overflow-visible sm:h-48 sm:w-52"
        aria-hidden
      >
        {/* Vertical stem to top pin & bottom base */}
        <line
          x1="120"
          y1="22"
          x2="120"
          y2="68"
          className="stroke-line-strong"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
        <line
          x1="120"
          y1="156"
          x2="120"
          y2="178"
          className="stroke-line-strong"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
        {!showPin && (
          <circle
            cx="120"
            cy="20"
            r="3.5"
            className="fill-brand-400 stroke-ink-950"
            strokeWidth="1.5"
          />
        )}

        {/* Single Clean Core Tile (works seamlessly in Light & Dark themes) */}
        <rect
          x="76"
          y="68"
          width="88"
          height="88"
          rx="22"
          className="fill-ink-900 stroke-line-strong"
          strokeWidth="1.6"
        />
        <rect
          x="84"
          y="76"
          width="72"
          height="72"
          rx="16"
          className="fill-ink-950/60 stroke-brand-400/35"
          strokeWidth="1.2"
        />

        {/* Minimal Human Code Brackets `</>` + Central AI Core Spark */}
        <path
          d="M104 101 L93 112 L104 123"
          fill="none"
          className="stroke-human-accent"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M136 101 L147 112 L136 123"
          fill="none"
          className="stroke-human-accent"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Center AI Spark / Core Node */}
        <circle
          cx="120"
          cy="112"
          r="9"
          className="fill-brand-400/18 stroke-brand-400"
          strokeWidth="1.6"
        />
        <circle cx="120" cy="112" r="3.8" className="fill-brand-400" />

        {/* Clean minimal base line */}
        <line
          x1="68"
          y1="178"
          x2="172"
          y2="178"
          className="stroke-line-strong"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <circle cx="120" cy="178" r="3" className="fill-brand-400" />
      </svg>
    </div>
  );
}

/**
 * Slide 3 Center Monument: AI + Human Build Engine
 * Designed using the exact Outscalers custom software & HUD styling from `/services`:
 * - Spinning / dashed outer targeting ring with cardinal crosshair ticks (matching /services ServicePanel HUD)
 * - Custom Software Development IDE window frame with header divider (matching ServiceGlyph slug="software-development")
 * - 3 Window control dots (Brand Orange AI, Human Cyan Engineer, Neutral)
 * - Signature `< / >` code glyph with Human-accent brackets and Brand-orange slash
 * - AI 4-point sparkle star (matching ServiceGlyph slug="ai-solutions")
 * - Live AI code draft & Human PR review syntax stream bars with verification status dots
 */
function BuildEngineArt({
  showPin = false,
  className,
}: {
  showPin?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("relative select-none", className)}>
      {showPin && (
        <div className="hs-pop absolute -top-[20px] left-1/2 z-20 flex -translate-x-1/2 flex-col items-center whitespace-nowrap sm:-top-[18px]">
          <span className="rounded-full bg-fg px-3 py-1 font-mono text-[11px] font-semibold tracking-tight text-ink-950 shadow-md">
            AI + Human Build
          </span>
          <span className="mt-1 grid size-4 place-items-center rounded-full bg-fg text-ink-950 shadow">
            <span className="size-1.5 rounded-full bg-brand-400" />
          </span>
        </div>
      )}

      <svg
        viewBox="0 0 240 210"
        className="hs-monument mx-auto h-44 w-48 overflow-visible sm:h-48 sm:w-52"
        aria-hidden
      >
        {/* Vertical stem lines for optical balance */}
        <line
          x1="120"
          y1="22"
          x2="120"
          y2="62"
          className="stroke-line-strong"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
        <line
          x1="120"
          y1="162"
          x2="120"
          y2="178"
          className="stroke-line-strong"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
        {!showPin && (
          <circle
            cx="120"
            cy="20"
            r="3.5"
            className="fill-brand-400 stroke-ink-950"
            strokeWidth="1.5"
          />
        )}

        {/* Clean minimal base line */}
        <line
          x1="68"
          y1="178"
          x2="172"
          y2="178"
          className="stroke-line-strong"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <circle cx="120" cy="178" r="3" className="fill-brand-400" />

        {/* Main Software Console Tile (Styled like /services Software Development & Service Cards) */}
        <rect
          x="70"
          y="62"
          width="100"
          height="100"
          rx="20"
          className="fill-ink-900 stroke-line-strong drop-shadow-[0_0_24px_rgba(255,112,14,0.14)]"
          strokeWidth="1.6"
        />
        {/* Inner Editor Canvas */}
        <rect
          x="77"
          y="69"
          width="86"
          height="86"
          rx="15"
          className="fill-ink-950/75 stroke-brand-400/30"
          strokeWidth="1.2"
        />

        {/* Titlebar Header Separator */}
        <line
          x1="77"
          y1="87"
          x2="163"
          y2="87"
          className="stroke-line-strong"
          strokeWidth="1.2"
        />

        {/* Window Control Dots (Orange AI + Cyan Human + Neutral) */}
        <circle cx="87" cy="78" r="2.5" className="fill-brand-400" />
        <circle cx="94.5" cy="78" r="2.5" className="fill-human-accent" />
        <circle cx="102" cy="78" r="2.5" className="fill-fg/30" />

        {/* Header Tab / Script indicator */}
        <text
          x="154"
          y="81.5"
          textAnchor="end"
          className="fill-fg-subtle font-mono text-[8.5px] font-medium tracking-wider"
        >
          BUILD.TS
        </text>

        {/* --- Iconic Software Development Code Glyphs (matching /services) --- */}
        {/* Opening Code Bracket `<` (Human engineering precision) */}
        <path
          d="M102 101 L91 112 L102 123"
          fill="none"
          className="stroke-human-accent"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Forward Slash `/` (Brand orange AI velocity) */}
        <line
          x1="125"
          y1="100"
          x2="115"
          y2="124"
          className="stroke-brand-400"
          strokeWidth="2.2"
          strokeLinecap="round"
        />

        {/* Closing Code Bracket `>` (Human engineering precision) */}
        <path
          d="M138 101 L149 112 L138 123"
          fill="none"
          className="stroke-human-accent"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Subtle AI Sparkle Star (4-point sparkle matching ServiceGlyph slug="ai-solutions") */}
        <path
          d="M120 109 L121 111.5 L123.5 112.5 L121 113.5 L120 116 L119 113.5 L116.5 112.5 L119 111.5 Z"
          className="fill-brand-300 drop-shadow-[0_0_4px_rgba(255,156,87,0.85)]"
        />

        {/* Mini Syntax Stream Lines (Simulating live AI code draft & human PR review) */}
        {/* Line 1: AI Code Generation Line */}
        <line
          x1="88"
          y1="135"
          x2="114"
          y2="135"
          className="stroke-brand-400/70"
          strokeWidth="2"
          strokeLinecap="round"
        />
        {/* Line 2: Human Review Approved Line */}
        <line
          x1="119"
          y1="135"
          x2="148"
          y2="135"
          className="stroke-human-accent/70"
          strokeWidth="2"
          strokeLinecap="round"
        />
        {/* Line 3: Verified Test Gate Line */}
        <line
          x1="88"
          y1="143"
          x2="128"
          y2="143"
          className="stroke-fg/30"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        <circle cx="134" cy="143" r="1.5" className="fill-human-accent" />
        <circle cx="140" cy="143" r="1.5" className="fill-brand-400" />
        <circle cx="146" cy="143" r="1.5" className="fill-fg/40" />
      </svg>
    </div>
  );
}

/**
 * Bespoke Tech Tool Illustration inside each of the 5 circular hubs on Slide 3:
 * - "ai": AI Neural Processor Chip & Agent Nodes
 * - "software": Code IDE Window & UI Layout
 * - "automation": Connected Workflow DAG Pipeline
 * - "data": Multi-tier Cloud Database & Server Cluster
 * - "security": Zero-Trust Cryptographic Shield & Verification Gate
 */
function DisciplineMiniMonument({
  variant,
}: {
  variant: "ai" | "software" | "automation" | "data" | "security";
}) {
  return (
    <svg
      viewBox="0 0 120 110"
      className="hs-monument size-24 overflow-visible"
      aria-hidden
    >
      {variant === "ai" && (
        <g>
          {/* Silicon chip pins */}
          {[46, 60, 74].map((p) => (
            <g key={p} className="stroke-fg/70" strokeWidth="1.5">
              <line x1={p} y1="22" x2={p} y2="30" strokeLinecap="round" />
              <line x1={p} y1="80" x2={p} y2="88" strokeLinecap="round" />
              <line x1="27" y1={p - 5} x2="35" y2={p - 5} strokeLinecap="round" />
              <line x1="85" y1={p - 5} x2="93" y2={p - 5} strokeLinecap="round" />
            </g>
          ))}
          <rect
            x="35"
            y="30"
            width="50"
            height="50"
            rx="10"
            className="fill-ink-950 stroke-fg"
            strokeWidth="1.6"
          />
          <rect
            x="43"
            y="38"
            width="34"
            height="34"
            rx="6"
            className="fill-ink-900 stroke-brand-400/75"
            strokeWidth="1.3"
          />
          <circle
            cx="60"
            cy="55"
            r="9"
            className="fill-brand-400/20 stroke-brand-400"
            strokeWidth="1.4"
          />
          <circle cx="60" cy="55" r="4" className="fill-brand-400" />
        </g>
      )}

      {variant === "software" && (
        <g>
          {/* Code IDE Window */}
          <rect
            x="28"
            y="28"
            width="64"
            height="52"
            rx="7"
            className="fill-ink-950 stroke-fg"
            strokeWidth="1.6"
          />
          <line
            x1="28"
            y1="40"
            x2="92"
            y2="40"
            className="stroke-fg/35"
            strokeWidth="1.2"
          />
          <circle cx="36" cy="34" r="2" className="fill-brand-400" />
          <circle cx="43" cy="34" r="2" className="fill-human-accent" />
          <circle cx="50" cy="34" r="2" className="fill-fg/35" />
          {/* </> Code symbol */}
          <path
            d="M49 52 L41 59 L49 66"
            fill="none"
            className="stroke-human-accent"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M71 52 L79 59 L71 66"
            fill="none"
            className="stroke-human-accent"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <line
            x1="63"
            y1="50"
            x2="57"
            y2="68"
            className="stroke-brand-400"
            strokeWidth="1.7"
            strokeLinecap="round"
          />
        </g>
      )}

      {variant === "automation" && (
        <g>
          {/* Workflow DAG connectors */}
          <path
            d="M44 55 H56 M60 55 C66 55, 66 38, 74 38 M60 55 C66 55, 66 72, 74 72"
            fill="none"
            className="stroke-fg/75"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
          {/* Left Trigger Node */}
          <rect
            x="24"
            y="43"
            width="24"
            height="24"
            rx="6"
            className="fill-ink-950 stroke-brand-400"
            strokeWidth="1.6"
          />
          <circle cx="36" cy="55" r="4.5" className="fill-brand-400" />
          {/* Center Router Node */}
          <circle
            cx="58"
            cy="55"
            r="4"
            className="fill-ink-950 stroke-fg"
            strokeWidth="1.5"
          />
          {/* Top-right Action Node */}
          <rect
            x="72"
            y="27"
            width="22"
            height="22"
            rx="6"
            className="fill-ink-950 stroke-human-accent"
            strokeWidth="1.6"
          />
          <circle cx="83" cy="38" r="3.5" className="fill-human-accent" />
          {/* Bottom-right Action Node */}
          <rect
            x="72"
            y="61"
            width="22"
            height="22"
            rx="6"
            className="fill-ink-950 stroke-fg"
            strokeWidth="1.6"
          />
          <circle cx="83" cy="72" r="3.5" className="fill-brand-400" />
        </g>
      )}

      {variant === "data" && (
        <g>
          {/* 3 Stacked Cloud / Data Pipeline Server Blades */}
          {[0, 1, 2].map((i) => {
            const y = 26 + i * 20;
            return (
              <g key={i}>
                <rect
                  x="28"
                  y={y}
                  width="64"
                  height="16"
                  rx="4.5"
                  className="fill-ink-950 stroke-fg"
                  strokeWidth="1.5"
                />
                <circle
                  cx="37"
                  cy={y + 8}
                  r="2.5"
                  className={i === 1 ? "fill-brand-400" : "fill-human-accent"}
                />
                <line
                  x1="46"
                  y1={y + 8}
                  x2="82"
                  y2={y + 8}
                  className={
                    i === 1 ? "stroke-brand-400/75" : "stroke-human-accent/75"
                  }
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </g>
            );
          })}
        </g>
      )}

      {variant === "security" && (
        <g>
          {/* Zero-Trust Security Shield */}
          <path
            d="M60 22 L86 33 V53 C86 71 74 82 60 87 C46 82 34 71 34 53 V33 Z"
            className="fill-ink-950 stroke-fg"
            strokeWidth="1.7"
          />
          <circle
            cx="60"
            cy="54"
            r="13"
            className="fill-human-accent/15 stroke-human-accent"
            strokeWidth="1.4"
          />
          <path
            d="M54 54 L58 58 L67 49"
            fill="none"
            className="stroke-brand-400"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
      )}
    </svg>
  );
}

/**
 * Small circular progress spinner shown next to the active tab label
 */
function TabSpinner({ progress }: { progress: number }) {
  const radius = 5.5;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - Math.min(1, Math.max(0, progress)));

  return (
    <svg viewBox="0 0 16 16" className="size-3.5 -rotate-90" aria-hidden>
      <circle
        cx="8"
        cy="8"
        r={radius}
        className="fill-none stroke-fg/20"
        strokeWidth="1.8"
      />
      <circle
        cx="8"
        cy="8"
        r={radius}
        className="fill-none stroke-brand-400 transition-none"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
      />
    </svg>
  );
}

type BotStagePose = {
  /** Horizontal anchor percentage within the hero stage (desktop) */
  x: number;
  /** Vertical anchor percentage within the hero stage (desktop) */
  y: number;
  /** Which side the presenter speech card sits on */
  bubbleSide: "left" | "right";
  /** Eye gaze vector toward the slide's focal content during the scan beat */
  slideGaze: { x: number; y: number };
  /** Short presenter badge label */
  badge: string;
  /** Live presentation narration for the slide */
  speech: string;
};

const HERO_BOT_POSES: Record<SlideId, BotStagePose> = {
  intro: {
    x: 50,
    y: 10,
    bubbleSide: "right",
    slideGaze: { x: 0, y: 3.6 },
    badge: "01 // VISION GUIDE",
    speech: "",
  },
  setup: {
    x: 26,
    y: 78,
    bubbleSide: "right",
    slideGaze: { x: 3.6, y: -1.0 },
    badge: "02 // ARCHITECTURE",
    speech: "",
  },
  build: {
    x: 50,
    y: 15,
    bubbleSide: "left",
    slideGaze: { x: 0, y: 3.6 },
    badge: "03 // BUILD LOOP",
    speech: "",
  },
  scale: {
    x: 67.5,
    y: 14,
    bubbleSide: "left",
    slideGaze: { x: -2.8, y: 3.0 },
    badge: "04 // 5 DISCIPLINES",
    speech: "",
  },
  ship: {
    x: 22,
    y: 15,
    bubbleSide: "right",
    slideGaze: { x: 3.4, y: 2.8 },
    badge: "05 // EXPLORE MORE",
    speech: "",
  },
};

type BotMood = "happy" | "wink-left" | "wink-right" | "focus" | "curious";

/**
 * Dynamic, Expressive Stage Presenter Robot for the Hero Section.
 * Built with the exact Outscalers PetBot SVG geometry & HUD frame, driven by a
 * continuous 60fps requestAnimationFrame loop so it blinks, emotes (happy crescent eyes,
 * playful winks, focused scanning visors), glances between the user, its speech card,
 * and the slide below, and streams its voice narration live without following the cursor off-stage.
 */
function HeroPresenterBot({
  slideId,
  onAdvance,
}: {
  slideId: SlideId;
  onAdvance: () => void;
}) {
  const pose = HERO_BOT_POSES[slideId];
  const prevPosRef = useRef<{ x: number; y: number }>({
    x: pose.x,
    y: pose.y,
  });
  const slideStartRef = useRef<number>(0);
  const hoveredRef = useRef<boolean>(false);
  const mouseRef = useRef<{ x: number; y: number; active: boolean }>({
    x: 0,
    y: 0,
    active: false,
  });

  const [mood, setMood] = useState<BotMood>("happy");

  const moverRef = useRef<HTMLDivElement | null>(null);
  const squashRef = useRef<HTMLDivElement | null>(null);
  const bodyRef = useRef<SVGGElement | null>(null);
  const flameRef = useRef<SVGGElement | null>(null);
  const armLRef = useRef<SVGGElement | null>(null);
  const armRRef = useRef<SVGGElement | null>(null);
  const eyesRef = useRef<SVGGElement | null>(null);
  const lidsRef = useRef<SVGGElement | null>(null);
  const antennaPingRef = useRef<SVGCircleElement | null>(null);

  // Emotional mood beats for each slide
  useEffect(() => {
    slideStartRef.current = performance.now();
    const rafMood = requestAnimationFrame(() => setMood("happy"));

    // Emotional beat schedule across the 5.6s slide:
    // 0.0s - 0.85s: "happy" (^ ^ greeting while swooping in)
    // 0.85s - 1.65s: playful wink toward the speech card ("read this!")
    // 1.65s - 2.95s: "curious" (wide blinking LED eyes looking at the speech card & user)
    // 2.95s - 3.85s: "focus" (scanning visor eyes inspecting the slide diagram below)
    // 3.85s - 4.55s: "curious" (looking back at the user with a natural blink)
    // 4.55s - 5.60s: "happy" (warm ^ ^ smile before flying to next stage)
    const winkMood: BotMood =
      pose.bubbleSide === "right" ? "wink-right" : "wink-left";
    const t1 = window.setTimeout(() => {
      if (!hoveredRef.current) setMood(winkMood);
    }, 850);
    const t2 = window.setTimeout(() => {
      if (!hoveredRef.current) setMood("curious");
    }, 1650);
    const t3 = window.setTimeout(() => {
      if (!hoveredRef.current) setMood("focus");
    }, 2950);
    const t4 = window.setTimeout(() => {
      if (!hoveredRef.current) setMood("curious");
    }, 3850);
    const t5 = window.setTimeout(() => {
      if (!hoveredRef.current) setMood("happy");
    }, 4550);

    return () => {
      cancelAnimationFrame(rafMood);
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.clearTimeout(t3);
      window.clearTimeout(t4);
      window.clearTimeout(t5);
    };
  }, [slideId, pose]);

  // Continuous 60fps requestAnimationFrame loop (eye tracking, natural blinking,
  // head tilt toward speech bubble / slide / user, waving arms & thruster flicker)
  useEffect(() => {
    let rafId = 0;
    let nextBlink = performance.now() + 1800;
    const eyeCurr = { x: 0, y: 0 };
    const tiltCurr = { deg: 0, y: 0 };

    const onPointerMove = (e: PointerEvent) => {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
      mouseRef.current.active = true;
    };
    window.addEventListener("pointermove", onPointerMove, { passive: true });

    const pingAnim = antennaPingRef.current?.animate(
      [
        { transform: "scale(1)", opacity: 0.85 },
        { transform: "scale(2.5)", opacity: 0 },
      ],
      {
        duration: 1600,
        iterations: Infinity,
        easing: "cubic-bezier(0.16, 1, 0.3, 1)",
      },
    );

    const loop = (now: number) => {
      rafId = requestAnimationFrame(loop);
      const elapsed = (now - slideStartRef.current) / 1000;
      const bubbleDir = pose.bubbleSide === "right" ? 1 : -1;

      // 1. Determine where the robot is looking & tilting right now:
      //    - 0.8s..2.6s: glances directly at its speech bubble ("read this!")
      //    - 2.6s..4.1s: looks down at the slide diagram below
      //    - otherwise: looks at the user (with subtle cursor awareness if mouse moved)
      let targetEx = 0;
      let targetEy = 0;
      let targetTilt = Math.sin(now * 0.0032) * 3.5;

      if (hoveredRef.current) {
        targetEx = 0;
        targetEy = -0.8;
        targetTilt = Math.sin(now * 0.01) * 6;
      } else if (elapsed >= 0.8 && elapsed < 2.6) {
        // Look right at the speech bubble text and nod while speaking
        targetEx = bubbleDir * 4.4;
        targetEy = -0.4 + Math.sin(now * 0.016) * 0.8;
        targetTilt = bubbleDir * 6.5 + Math.sin(now * 0.015) * 2.2;
      } else if (elapsed >= 2.6 && elapsed < 4.1) {
        // Look down at the slide's centerpiece
        targetEx = pose.slideGaze.x;
        targetEy = pose.slideGaze.y;
        targetTilt = pose.slideGaze.x * 1.4;
      } else if (mouseRef.current.active && moverRef.current) {
        // Subtle eye contact with the user's cursor angle (without moving off-stage)
        const rect = moverRef.current.getBoundingClientRect();
        const cx = rect.left + 48;
        const cy = rect.top + 48;
        const dx = mouseRef.current.x - cx;
        const dy = mouseRef.current.y - cy;
        const d = Math.hypot(dx, dy) || 1;
        targetEx = (dx / d) * 3.6;
        targetEy = (dy / d) * 2.6;
        targetTilt = Math.max(-8, Math.min(8, (dx / d) * 5));
      }

      eyeCurr.x += (targetEx - eyeCurr.x) * 0.14;
      eyeCurr.y += (targetEy - eyeCurr.y) * 0.14;
      if (eyesRef.current) {
        eyesRef.current.style.transform = `translate(${eyeCurr.x.toFixed(2)}px, ${eyeCurr.y.toFixed(2)}px)`;
      }

      // 2. Smooth 60fps hover bob + expressive head tilt
      const bobY = Math.sin(now * 0.0034) * -6.5;
      tiltCurr.deg += (targetTilt - tiltCurr.deg) * 0.12;
      tiltCurr.y += (bobY - tiltCurr.y) * 0.18;
      if (bodyRef.current) {
        bodyRef.current.style.transform = `translateY(${tiltCurr.y.toFixed(2)}px) rotate(${tiltCurr.deg.toFixed(2)}deg)`;
      }

      // 3. Continuous 60fps thruster flame flicker (flares brighter during flight or hover)
      if (flameRef.current) {
        const flightBoost = elapsed < 0.75 ? 0.45 : hoveredRef.current ? 0.3 : 0;
        const flicker =
          0.78 +
          flightBoost +
          Math.sin(now * 0.032) * 0.22 +
          Math.cos(now * 0.051) * 0.12;
        flameRef.current.style.transform = `scaleY(${flicker.toFixed(2)})`;
      }

      // 4. Expressive articulated arms:
      //    - Bubble-side arm gestures toward the speech card while speaking (0.8s..2.6s)
      //    - Outer arm waves enthusiastically on arrival (0.0s..1.1s) and on hover
      const waveActive = elapsed < 1.1 || hoveredRef.current;
      const pointToBubble = elapsed >= 0.8 && elapsed < 2.7;

      const leftIsBubble = pose.bubbleSide === "left";
      const leftAngle = leftIsBubble
        ? pointToBubble
          ? 28 + Math.sin(now * 0.018) * 10
          : Math.sin(now * 0.004) * 5
        : waveActive
          ? 32 + Math.sin(now * 0.022) * 24
          : Math.sin(now * 0.004) * 6;

      const rightAngle = !leftIsBubble
        ? pointToBubble
          ? -28 - Math.sin(now * 0.018) * 10
          : Math.sin(now * 0.004 + 1) * 5
        : waveActive
          ? -32 - Math.sin(now * 0.022) * 24
          : Math.sin(now * 0.004 + 1) * 6;

      if (armLRef.current) {
        armLRef.current.style.transform = `rotate(${leftAngle.toFixed(1)}deg)`;
      }
      if (armRRef.current) {
        armRRef.current.style.transform = `rotate(${rightAngle.toFixed(1)}deg)`;
      }

      // 5. Natural eyelid blinking every ~2.2–4.2s
      if (lidsRef.current) {
        if (now > nextBlink) {
          lidsRef.current.style.transform = "scaleY(0.08)";
          if (now > nextBlink + 130) {
            lidsRef.current.style.transform = "";
            nextBlink = now + 2100 + Math.random() * 2200;
          }
        }
      }
    };

    rafId = requestAnimationFrame(loop);
    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      cancelAnimationFrame(rafId);
      pingAnim?.cancel();
    };
  }, [pose]);

  // Dramatic flight arc + squash-and-stretch bounce on slide change
  useEffect(() => {
    const from = prevPosRef.current;
    const to = { x: pose.x, y: pose.y };
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const dist = Math.hypot(dx, dy);
    prevPosRef.current = to;

    if (moverRef.current) {
      const midX = (from.x + to.x) / 2;
      const midY = (from.y + to.y) / 2 - (dist > 8 ? 8 : 3);
      moverRef.current.animate(
        [
          {
            left: `${from.x}%`,
            top: `${from.y}%`,
            transform: "translate(-50%, -50%) scale(0.92)",
          },
          {
            left: `${midX}%`,
            top: `${midY}%`,
            transform: "translate(-50%, -50%) scale(1.1)",
            offset: 0.45,
          },
          {
            left: `${to.x}%`,
            top: `${to.y}%`,
            transform: "translate(-50%, -50%) scale(1)",
          },
        ],
        {
          duration: dist > 1 ? 920 : 560,
          easing: "cubic-bezier(0.22, 1, 0.36, 1)",
          fill: "both",
        },
      );
    }

    if (squashRef.current) {
      const bankDeg = dist > 1 ? Math.max(-20, Math.min(20, dx * 0.45)) : -8;
      squashRef.current.animate(
        [
          { transform: "rotate(0deg) scale(1, 1)" },
          {
            transform: `rotate(${bankDeg}deg) scale(1.08, 0.92)`,
            offset: 0.34,
          },
          {
            transform: `rotate(${-bankDeg * 0.28}deg) scale(0.95, 1.06)`,
            offset: 0.72,
          },
          { transform: "rotate(0deg) scale(1, 1)" },
        ],
        {
          duration: 920,
          easing: "cubic-bezier(0.22, 1, 0.36, 1)",
          fill: "both",
        },
      );
    }
  }, [slideId, pose]);

  const handleBotHover = (entering: boolean) => {
    hoveredRef.current = entering;
    if (entering) {
      setMood("happy");
      squashRef.current?.animate(
        [
          { transform: "scale(1, 1)" },
          { transform: "scale(1.14, 0.88)", offset: 0.3 },
          { transform: "scale(0.94, 1.08)", offset: 0.65 },
          { transform: "scale(1, 1)" },
        ],
        { duration: 520, easing: "cubic-bezier(0.22, 1, 0.36, 1)" },
      );
    }
  };

  return (
    <div
      ref={moverRef}
      style={{ left: `${pose.x}%`, top: `${pose.y}%` }}
      className="pointer-events-none absolute z-30 -translate-x-1/2 -translate-y-1/2"
    >
      <div
        onMouseEnter={() => handleBotHover(true)}
        onMouseLeave={() => handleBotHover(false)}
        className="relative flex items-center"
      >
        {/* Dynamic Outscalers Presenter Robot (authentic PetBot SVG geometry & emotions) */}
        <div
          ref={squashRef}
          onClick={onAdvance}
          title="Click robot to advance to the next stage"
          className="pointer-events-auto relative cursor-pointer select-none"
        >
          <svg
            viewBox="0 0 72 82"
            width={96}
            height={109}
            className="block overflow-visible drop-shadow-[0_4px_10px_rgba(15,23,42,0.07)]"
            aria-label="Outscalers Guide Robot"
          >
            {/* Subtle hover ground shadow ellipse */}
            <ellipse
              cx={36}
              cy={79}
              rx={14}
              ry={1.8}
              className="fill-fg/10"
            />

            <g ref={bodyRef} style={{ transformOrigin: "36px 40px" }}>
              {/* Dual Flame Thrusters (60fps flicker) */}
              <g ref={flameRef} style={{ transformOrigin: "36px 58px" }}>
                <path d="M26 58 29 71 32 58Z" className="fill-brand-400/85" />
                <path d="M40 58 43 71 46 58Z" className="fill-brand-400/85" />
                <path d="M27.5 58 29 64 30.5 58Z" className="fill-brand-200" />
                <path d="M41.5 58 43 64 44.5 58Z" className="fill-brand-200" />
              </g>

              {/* Articulated Left & Right Arms (wave & gesture toward the speech card) */}
              <g ref={armLRef} style={{ transformOrigin: "9px 40px" }}>
                <rect
                  x={1}
                  y={34}
                  width={8}
                  height={14}
                  rx={4}
                  className="fill-ink-800 stroke-line-strong"
                  strokeWidth={1.5}
                />
              </g>
              <g ref={armRRef} style={{ transformOrigin: "63px 40px" }}>
                <rect
                  x={63}
                  y={34}
                  width={8}
                  height={14}
                  rx={4}
                  className="fill-ink-800 stroke-line-strong"
                  strokeWidth={1.5}
                />
              </g>

              {/* Antenna & Pulsing Beacon */}
              <line
                x1={36}
                y1={16}
                x2={36}
                y2={6}
                className="stroke-line-strong"
                strokeWidth={1.5}
              />
              <circle
                ref={antennaPingRef}
                cx={36}
                cy={5}
                r={2.8}
                style={{ transformOrigin: "36px 5px" }}
                className="fill-none stroke-brand-400"
                strokeWidth={1.1}
              />
              <circle cx={36} cy={5} r={2.6} className="fill-brand-400" />

              {/* Head Shell (exact PetBot geometry) */}
              <rect
                x={8}
                y={16}
                width={56}
                height={42}
                rx={20}
                className="fill-ink-850 stroke-line-strong"
                strokeWidth={1.5}
              />

              {/* Visor Face Screen */}
              <rect
                x={15}
                y={24}
                width={42}
                height={26}
                rx={12}
                className="fill-ink-950 stroke-brand-400/50"
                strokeWidth={1.2}
              />

              {/* Dynamic Emotional Eyes (happy ^ ^, playful winks, focused scan, blinking LEDs) */}
              <g ref={eyesRef}>
                {mood === "happy" ? (
                  <g
                    className="fill-none stroke-brand-300"
                    strokeWidth={2.6}
                    strokeLinecap="round"
                  >
                    <path d="M24 38q4-6 8 0" />
                    <path d="M40 38q4-6 8 0" />
                  </g>
                ) : mood === "wink-right" ? (
                  <g ref={lidsRef} style={{ transformOrigin: "36px 36px" }}>
                    <rect
                      x={25}
                      y={30}
                      width={6}
                      height={11}
                      rx={3}
                      className="fill-brand-300"
                    />
                    <path
                      d="M40 38q4-6 8 0"
                      className="fill-none stroke-brand-300"
                      strokeWidth={2.6}
                      strokeLinecap="round"
                    />
                  </g>
                ) : mood === "wink-left" ? (
                  <g ref={lidsRef} style={{ transformOrigin: "36px 36px" }}>
                    <path
                      d="M24 38q4-6 8 0"
                      className="fill-none stroke-brand-300"
                      strokeWidth={2.6}
                      strokeLinecap="round"
                    />
                    <rect
                      x={41}
                      y={30}
                      width={6}
                      height={11}
                      rx={3}
                      className="fill-brand-300"
                    />
                  </g>
                ) : (
                  <g
                    ref={lidsRef}
                    style={{ transformOrigin: "36px 36px" }}
                    className="fill-brand-300"
                  >
                    <rect
                      x={25}
                      y={mood === "focus" ? 33 : 30}
                      width={6}
                      height={mood === "focus" ? 6 : 11}
                      rx={3}
                    />
                    <rect
                      x={41}
                      y={mood === "focus" ? 33 : 30}
                      width={6}
                      height={mood === "focus" ? 6 : 11}
                      rx={3}
                    />
                  </g>
                )}
              </g>

              {/* Cheek Blush in human-accent colour (glows brighter when happy) */}
              <g>
                <circle
                  cx={21}
                  cy={44}
                  r={2.3}
                  className={cn(
                    "transition-opacity duration-300",
                    mood === "happy"
                      ? "fill-human-accent/70"
                      : "fill-human-accent/45",
                  )}
                />
                <circle
                  cx={51}
                  cy={44}
                  r={2.3}
                  className={cn(
                    "transition-opacity duration-300",
                    mood === "happy"
                      ? "fill-human-accent/70"
                      : "fill-human-accent/45",
                  )}
                />
              </g>
            </g>
          </svg>
        </div>
      </div>
    </div>
  );
}

export function HeroShowcase() {
  const [active, setActive] = useState<number>(0);
  const [progress, setProgress] = useState<number>(0);
  const stageRef = useRef<HTMLDivElement | null>(null);

  const selectSlide = useCallback((index: number) => {
    setActive(index);
    setProgress(0);
  }, []);

  // Auto-advance timer (updates progress ring smoothly and cycles slides)
  useEffect(() => {
    let rafId: number;
    let start = performance.now();

    const tick = (now: number) => {
      const elapsed = now - start;
      const ratio = elapsed / SLIDE_DURATION;
      if (ratio >= 1) {
        setActive((prev) => (prev + 1) % SLIDES.length);
        setProgress(0);
        start = now;
      } else {
        setProgress(ratio);
      }
      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [active]);

  // Web Animations API choreography on every slide change
  // (Works reliably even when OS prefers-reduced-motion is enabled on Windows)
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    // Dramatic blur-to-sharp rise for all monuments / architectural illustrations
    const monuments = stage.querySelectorAll<HTMLElement | SVGElement>(
      ".hs-monument",
    );
    monuments.forEach((monument, idx) => {
      monument.animate(
        [
          {
            opacity: 0,
            transform: "translateY(32px) scale(0.86)",
            filter: "blur(12px)",
          },
          {
            opacity: 1,
            transform: "translateY(0px) scale(1)",
            filter: "blur(0px)",
          },
        ],
        {
          duration: 860,
          delay: 60 + idx * 85,
          easing: "cubic-bezier(0.16, 1, 0.3, 1)",
          fill: "both",
        },
      );
    });

    // Dramatic blur-to-sharp entrance for all widget cards & callout pills
    const cards = stage.querySelectorAll<HTMLElement>(".hs-card-in");
    cards.forEach((el, idx) => {
      el.animate(
        [
          {
            opacity: 0,
            transform: "translateY(36px) scale(0.88)",
            filter: "blur(12px)",
          },
          {
            opacity: 1,
            transform: "translateY(0px) scale(1)",
            filter: "blur(0px)",
          },
        ],
        {
          duration: 880,
          delay: 140 + idx * 105,
          easing: "cubic-bezier(0.16, 1, 0.3, 1)",
          fill: "both",
        },
      );
    });

    // Dramatic entrance choreography for the Opening Title Slide
    const eyebrow = stage.querySelector<HTMLElement>(".hs-title-eyebrow");
    if (eyebrow) {
      eyebrow.animate(
        [
          {
            opacity: 0,
            transform: "translateY(18px) scale(0.92)",
            filter: "blur(6px)",
          },
          {
            opacity: 1,
            transform: "translateY(0px) scale(1)",
            filter: "blur(0px)",
          },
        ],
        {
          duration: 680,
          delay: 40,
          easing: "cubic-bezier(0.16, 1, 0.3, 1)",
          fill: "both",
        },
      );
    }

    const titleLine1 = stage.querySelector<HTMLElement>(".hs-title-line-1");
    if (titleLine1) {
      titleLine1.animate(
        [
          {
            opacity: 0,
            transform: "translateY(42px) scale(0.9)",
            filter: "blur(12px)",
          },
          {
            opacity: 1,
            transform: "translateY(0px) scale(1)",
            filter: "blur(0px)",
          },
        ],
        {
          duration: 920,
          delay: 160,
          easing: "cubic-bezier(0.16, 1, 0.3, 1)",
          fill: "both",
        },
      );
    }

    const titleLine2 = stage.querySelector<HTMLElement>(".hs-title-line-2");
    if (titleLine2) {
      titleLine2.animate(
        [
          {
            opacity: 0,
            transform: "translateY(48px) scale(0.88)",
            filter: "blur(14px)",
          },
          {
            opacity: 1,
            transform: "translateY(0px) scale(1)",
            filter: "blur(0px)",
          },
        ],
        {
          duration: 1020,
          delay: 340,
          easing: "cubic-bezier(0.16, 1, 0.3, 1)",
          fill: "both",
        },
      );
    }

    const titleGlow = stage.querySelector<HTMLElement>(".hs-title-glow");
    if (titleGlow) {
      titleGlow.animate(
        [
          { opacity: 0, transform: "translate(-50%, -50%) scale(0.55)" },
          { opacity: 1, transform: "translate(-50%, -50%) scale(1.08)" },
          { opacity: 0.85, transform: "translate(-50%, -50%) scale(1)" },
        ],
        {
          duration: 1300,
          easing: "cubic-bezier(0.16, 1, 0.3, 1)",
          fill: "both",
        },
      );
    }

    const lines = stage.querySelectorAll<SVGPathElement>(".hs-line-draw");
    lines.forEach((line, idx) => {
      // idx 0 is incoming left line (eases in to center); idx > 0 is outgoing right line (sweeps out to edge)
      const isOutgoing = idx > 0;
      line.animate(
        [
          { strokeDasharray: "1", strokeDashoffset: "1", opacity: 0.25 },
          { strokeDasharray: "1", strokeDashoffset: "0", opacity: 1 },
        ],
        {
          duration: isOutgoing ? 1100 : 950,
          delay: isOutgoing ? 100 : 0,
          easing: isOutgoing ? "cubic-bezier(0.3, 0, 0.2, 1)" : "cubic-bezier(0.22, 1, 0.36, 1)",
          fill: "both",
        },
      );
    });

    const pops = stage.querySelectorAll<HTMLElement | SVGElement>(".hs-pop");
    pops.forEach((pop, idx) => {
      pop.animate(
        [
          {
            opacity: 0,
            transform: "translateY(18px) scale(0.65)",
            filter: "blur(8px)",
          },
          {
            opacity: 1,
            transform: "translateY(-2px) scale(1.06)",
            filter: "blur(0px)",
          },
          {
            opacity: 1,
            transform: "translateY(0px) scale(1)",
            filter: "blur(0px)",
          },
        ],
        {
          duration: 720,
          delay: 220 + idx * 95,
          easing: "cubic-bezier(0.16, 1, 0.3, 1)",
          fill: "both",
        },
      );
    });

    const orbits = stage.querySelectorAll<SVGElement>(".hs-orbit-spin");
    orbits.forEach((orbit) => {
      orbit.animate(
        [{ strokeDashoffset: "0" }, { strokeDashoffset: "-48" }],
        {
          duration: 6000,
          iterations: Infinity,
          easing: "linear",
        },
      );
    });
  }, [active]);

  const currentSlide = SLIDES[active];

  return (
    <section
      data-pet-hide="hero"
      className="hs-hero-section relative flex min-h-svh flex-col justify-between overflow-hidden pt-20 pb-4 lg:pt-22 lg:pb-6"
    >
      {/* Subtle architectural background grid + warm/cool radial glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-grid opacity-30 mask-radial-fade"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute top-1/2 left-1/2 -z-10 size-[38rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-500/8 blur-3xl [[data-theme=light]_&]:bg-sky-500/10"
      />

      {/* ================= CENTER STAGE: 5 Animated Storytelling Slides ================= */}
      <div
        ref={stageRef}
        className="hs-stage-wrap relative my-auto flex min-h-[25rem] w-full items-center justify-center py-4 lg:min-h-[27rem]"
      >
        {/* Stage-aligned Presenter Robot overlay (shares exact max-w-5xl coordinate frame with slides) */}
        <div className="pointer-events-none absolute inset-y-0 left-1/2 z-30 hidden w-full max-w-5xl -translate-x-1/2 lg:block">
          <HeroPresenterBot
            slideId={currentSlide.id}
            onAdvance={() => selectSlide((active + 1) % SLIDES.length)}
          />
        </div>

        {/* Unified radial spotlight aura shared across all 5 slides */}
        <div
          aria-hidden
          className="hs-title-glow pointer-events-none absolute top-1/2 left-1/2 -z-10 h-64 w-[38rem] max-w-full -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-400/14 blur-3xl [[data-theme=light]_&]:bg-indigo-500/12"
        />

        {/* ----------------- SLIDE 0: DRAMATIC OPENING TITLE SLIDE ----------------- */}
        {currentSlide.id === "intro" && (
          <div
            key="intro"
            className="hs-stage relative mx-auto flex w-full max-w-6xl items-center justify-center px-4"
          >
            <div className="relative mx-auto flex w-full flex-col items-center justify-center py-10 text-center lg:h-[360px]">
              {/* Inline-sized Title Block so left & right lines anchor strictly outside the text with zero overlap */}
              <div className="relative inline-flex flex-col items-center">
                {/* Left incoming full-bleed line (stops 32px to the left of the title text) */}
                <svg
                  aria-hidden
                  viewBox="0 0 280 120"
                  fill="none"
                  className="pointer-events-none absolute top-1/2 right-full mr-8 hidden h-[120px] w-[280px] -translate-y-1/2 overflow-visible lg:block"
                >
                  <path
                    d="M -2600 40 H 120 C 175 40, 185 88, 235 88 H 270"
                    pathLength={1}
                    className="hs-line-draw stroke-fg/55"
                    strokeWidth="1.5"
                  />
                  <circle cx="272" cy="88" r="4.5" className="hs-pop fill-fg drop-shadow-[0_0_8px_rgba(255,255,255,0.85)]" />
                </svg>

                {/* Right outgoing full-bleed orange line (starts 32px to the right of the title text & rises to y=16 for Slide 2) */}
                <svg
                  aria-hidden
                  viewBox="0 0 280 220"
                  fill="none"
                  className="pointer-events-none absolute top-1/2 left-full ml-8 hidden h-[220px] w-[280px] -translate-y-1/2 overflow-visible lg:block"
                >
                  <circle
                    cx="8"
                    cy="138"
                    r="4.5"
                    className="hs-pop fill-ink-950 stroke-brand-400 drop-shadow-[0_0_8px_rgba(255,112,14,0.9)]"
                    strokeWidth="1.6"
                  />
                  <path
                    d="M 13 138 H 65 C 125 138, 145 16, 205 16 H 2600"
                    pathLength={1}
                    className="hs-line-draw stroke-brand-400/80"
                    strokeWidth="1.5"
                  />
                </svg>

                {/* Eyebrow */}
                <div className="hs-title-eyebrow flex items-center justify-center">
                  <p className="eyebrow">Human + AI Engineering Company</p>
                </div>

                {/* Dramatic Monumental Display Title */}
                <h1 className="mx-auto mt-5 font-display text-[clamp(2.35rem,4.6vw,4.25rem)] leading-[1.06] font-semibold tracking-tight text-fg">
                  <span className="hs-title-line-1 block sm:whitespace-nowrap">
                    Human Intelligence.
                  </span>
                  <span className="hs-title-line-2 text-gradient mt-1 block sm:whitespace-nowrap">
                    AI-Powered Engineering.
                  </span>
                </h1>
              </div>
            </div>
          </div>
        )}

        {/* ----------------- SLIDE 1: INITIAL SETUP ----------------- */}
        {currentSlide.id === "setup" && (
          <div
            key="setup"
            className="hs-stage relative mx-auto flex w-full max-w-6xl items-center justify-center px-4"
          >
            {/* Central Architecture Illustration + 4 Radiating Setup Cards + Unified Full-Bleed Lines */}
            <div className="relative mx-auto grid w-full max-w-5xl items-center gap-4 lg:block lg:h-[340px]">
              {/* Unified coordinate SVG (overflow-visible so left S-curve and right edge wave lock 1:1 on both Laptop and Large Monitors) */}
              <svg
                aria-hidden
                viewBox="0 0 960 340"
                fill="none"
                className="pointer-events-none absolute inset-0 hidden size-full overflow-visible lg:block"
              >
                {/* Left meandering S-curve touching the far-left screen edge and flowing into the center monument */}
                <path
                  d="M -2800 16 H 135 C 175 16, 175 82, 135 82 H -25 C -68 82, -68 152, -25 152 H 95 C 132 152, 132 222, 95 222 H 15 C -18 222, -18 274, 20 274 H 358"
                  pathLength={1}
                  className="hs-line-draw stroke-fg/55"
                  strokeWidth="1.5"
                />
                <circle cx="362" cy="274" r="4.5" className="hs-pop fill-fg drop-shadow-[0_0_8px_rgba(255,255,255,0.85)]" />

                {/* Right outgoing orange wave line extending all the way to the right screen edge (y=184 handoff to Slide 2) */}
                <circle
                  cx="596"
                  cy="274"
                  r="4.5"
                  className="hs-pop fill-ink-950 stroke-brand-400 drop-shadow-[0_0_8px_rgba(255,112,14,0.9)]"
                  strokeWidth="1.6"
                />
                <path
                  d="M 601 274 H 790 C 855 274, 890 184, 975 184 H 2800"
                  pathLength={1}
                  className="hs-line-draw stroke-brand-400/80"
                  strokeWidth="1.5"
                />

                {/* Top-left connector */}
                <line
                  x1="412"
                  y1="136"
                  x2="368"
                  y2="74"
                  className="stroke-fg/40"
                  strokeWidth="1.3"
                  strokeDasharray="4 4"
                />
                <circle r="3.2" className="fill-human-accent">
                  <animateMotion
                    dur="2.4s"
                    repeatCount="indefinite"
                    path="M412,136 L368,74"
                  />
                </circle>

                {/* Mid-left connector */}
                <line
                  x1="408"
                  y1="186"
                  x2="335"
                  y2="154"
                  className="stroke-fg/40"
                  strokeWidth="1.3"
                  strokeDasharray="4 4"
                />
                <circle r="3.2" className="fill-human-accent">
                  <animateMotion
                    dur="2.6s"
                    begin="0.5s"
                    repeatCount="indefinite"
                    path="M408,186 L335,154"
                  />
                </circle>

                {/* Top-right connector */}
                <line
                  x1="548"
                  y1="136"
                  x2="592"
                  y2="70"
                  className="stroke-fg/40"
                  strokeWidth="1.3"
                  strokeDasharray="4 4"
                />
                <circle r="3.2" className="fill-brand-400">
                  <animateMotion
                    dur="2.2s"
                    begin="0.2s"
                    repeatCount="indefinite"
                    path="M548,136 L592,70"
                  />
                </circle>

                {/* Mid-right connector */}
                <line
                  x1="552"
                  y1="186"
                  x2="625"
                  y2="154"
                  className="stroke-fg/40"
                  strokeWidth="1.3"
                  strokeDasharray="4 4"
                />
                <circle r="3.2" className="fill-brand-400">
                  <animateMotion
                    dur="2.5s"
                    begin="0.8s"
                    repeatCount="indefinite"
                    path="M552,186 L625,154"
                  />
                </circle>
              </svg>

              {/* Top-left card: Architecture & Data Model */}
              <div className="hs-card-in flex items-center gap-3 rounded-full border border-line-strong bg-ink-900/95 px-4 py-2.5 shadow-lg backdrop-blur-md lg:absolute lg:top-3 lg:left-[210px]">
                <span className="grid size-8 shrink-0 place-items-center rounded-full bg-human-accent/15 text-human-accent">
                  <Layers className="size-4" />
                </span>
                <span className="text-xs leading-tight font-medium text-fg">
                  System architecture &amp;
                  <br />
                  data model blueprint
                </span>
              </div>

              {/* Mid-left card: Security & Access Boundaries (placed cleanly above the S-curve bottom line) */}
              <div className="hs-card-in flex items-center gap-3 rounded-full border border-line-strong bg-ink-900/95 px-4 py-2.5 shadow-lg backdrop-blur-md lg:absolute lg:top-[118px] lg:left-[140px]">
                <span className="grid size-8 shrink-0 place-items-center rounded-full bg-fg/10 text-fg">
                  <Plus className="size-4" />
                </span>
                <span className="text-xs leading-tight font-medium text-fg">
                  Security boundaries &amp;
                  <br />
                  CI/CD pipeline setup
                </span>
              </div>

              {/* Center Architecture Monument */}
              <div className="my-2 lg:absolute lg:bottom-2 lg:left-1/2 lg:my-0 lg:-translate-x-1/2">
                <CoreArchitectureArt showPin />
              </div>

              {/* Top-right card: Dedicated Lead Engineer */}
              <div className="hs-card-in flex items-center gap-3.5 rounded-2xl border border-line-strong bg-ink-900/95 p-2.5 pr-5 shadow-xl backdrop-blur-md lg:absolute lg:top-2 lg:right-[135px]">
                <EngineerAvatar variant="marcus" />
                <div>
                  <p className="text-xs font-semibold text-fg">
                    Lead Architect assigned
                  </p>
                  <p className="mt-0.5 text-[11px] text-fg-subtle">
                    Marcus Weber · Mannheim, DE
                  </p>
                </div>
              </div>

              {/* Mid-right card: AI Model & Guardrails (placed cleanly above the right outgoing wave line) */}
              <div className="hs-card-in flex items-center gap-3 rounded-full border border-line-strong bg-ink-900/95 px-4 py-2.5 shadow-lg backdrop-blur-md lg:absolute lg:top-[118px] lg:right-[115px]">
                <span className="grid size-8 shrink-0 place-items-center rounded-full bg-brand-400/15 text-brand-400">
                  <Sparkles className="size-4" />
                </span>
                <span className="text-xs leading-tight font-medium text-fg">
                  AI agent workflows &amp;
                  <br />
                  approved data guardrails
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ----------------- SLIDE 2: AI + HUMAN BUILD (ORBITAL LOOP) ----------------- */}
        {currentSlide.id === "build" && (
          <div
            key="build"
            className="hs-stage relative mx-auto flex w-full max-w-6xl items-center justify-center px-4"
          >
            <div className="relative mx-auto grid w-full max-w-5xl items-center gap-4 lg:block lg:h-[345px]">
              {/* Concentric Orbital Rings + Full-Bleed Relay Lines (overflow-visible to touch both screen edges) */}
              <svg
                aria-hidden
                viewBox="0 0 960 345"
                fill="none"
                className="pointer-events-none absolute inset-0 hidden size-full overflow-visible lg:block"
              >
                {/* Left incoming line picking up from Slide 1, weaving in a clean non-overlapping S-curve into the orbital ring */}
                <path
                  d="M -2800 132 H -15 C 25 132, 25 164, -15 164 H -65 C -105 164, -105 194, -65 194 H 321"
                  pathLength={1}
                  className="hs-line-draw stroke-fg/55"
                  strokeWidth="1.5"
                />
                <circle cx="325" cy="194" r="4.5" className="hs-pop fill-fg drop-shadow-[0_0_8px_rgba(255,255,255,0.85)]" />

                <circle
                  cx="480"
                  cy="172"
                  r="154"
                  className="stroke-fg/20"
                  strokeWidth="1"
                />
                <circle
                  cx="480"
                  cy="172"
                  r="134"
                  className="hs-orbit-spin stroke-fg/30"
                  strokeWidth="1.2"
                  strokeDasharray="3 4"
                />

                {/* Dashed connector from Senior Engineer card down into the Checklist card */}
                <path
                  d="M 720 82 V 202"
                  className="stroke-fg/40"
                  strokeWidth="1.3"
                  strokeDasharray="4 4"
                />
                <circle r="3.2" className="fill-brand-400">
                  <animateMotion
                    dur="2.2s"
                    repeatCount="indefinite"
                    path="M 720 82 L 720 202"
                  />
                </circle>

                {/* Right outgoing orange wave line exiting the orbital ring to the right screen edge */}
                <circle
                  cx="633"
                  cy="144"
                  r="4.5"
                  className="hs-pop fill-ink-950 stroke-brand-400 drop-shadow-[0_0_8px_rgba(255,112,14,0.9)]"
                  strokeWidth="1.6"
                />
                <path
                  d="M 638 144 H 885 C 935 144, 965 186, 1025 186 H 2800"
                  pathLength={1}
                  className="hs-line-draw stroke-brand-400/80"
                  strokeWidth="1.5"
                />
              </svg>

              {/* Top-left stack: AI Velocity Pill + Breakdown Table */}
              <div className="hs-card-in space-y-2 lg:absolute lg:top-6 lg:left-[88px] lg:w-[268px]">
                <div className="flex items-center gap-2.5 rounded-full border border-human-accent/40 bg-human-accent/12 px-3.5 py-2 shadow-sm backdrop-blur-md">
                  <span className="grid size-6 shrink-0 place-items-center rounded-full bg-human-accent/20 text-human-accent">
                    <Code2 className="size-3.5" />
                  </span>
                  <span className="text-xs font-semibold text-fg">
                    AI-accelerated sprint velocity
                  </span>
                </div>
                <div className="rounded-2xl border border-line-strong bg-ink-900/95 px-4 py-3 text-xs shadow-lg backdrop-blur-md">
                  <div className="flex items-center justify-between gap-3 text-fg-muted">
                    <span>AI code &amp; test drafts</span>
                    <span className="shrink-0 font-mono font-semibold text-brand-300">
                      3.2× faster
                    </span>
                  </div>
                  <div className="mt-2 flex items-center justify-between gap-3 text-fg-muted">
                    <span>Human PR review</span>
                    <span className="shrink-0 font-mono font-semibold text-human-accent">
                      100% required
                    </span>
                  </div>
                </div>
              </div>

              {/* Bottom-left alert pill: Edge-case caught in review */}
              <div className="hs-card-in flex items-start gap-3 rounded-2xl border border-brand-400/40 bg-brand-400/12 px-4 py-2.5 shadow-lg backdrop-blur-md lg:absolute lg:bottom-6 lg:left-[88px] lg:w-[276px]">
                <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full border border-brand-400 text-brand-300">
                  <AlertCircle className="size-3.5" />
                </span>
                <div>
                  <p className="text-xs font-semibold text-brand-300">
                    Edge-case caught in review
                  </p>
                  <p className="mt-0.5 text-[11px] leading-snug text-fg-muted">
                    AI token scope &amp; rate-limit hardened by Senior Engineer
                    before merge
                  </p>
                </div>
              </div>

              {/* Center Architecture Monument (Custom Software & AI Build Engine) */}
              <div className="my-2 lg:absolute lg:top-1/2 lg:left-1/2 lg:my-0 lg:-translate-x-1/2 lg:-translate-y-1/2">
                <BuildEngineArt />
              </div>

              {/* Top-right dark card: Senior Engineer Reviewing PR */}
              <div className="hs-card-in flex items-center gap-3.5 rounded-2xl bg-fg p-2.5 pr-5 text-ink-950 shadow-xl lg:absolute lg:top-6 lg:right-[135px]">
                <EngineerAvatar variant="sara" />
                <div>
                  <p className="text-xs font-semibold">
                    Reviewing AI Pull Request #42
                  </p>
                  <p className="mt-0.5 text-[11px] opacity-75">
                    Sara Khan · Senior Engineer
                  </p>
                </div>
              </div>

              {/* Mid-right card: Live Build & Review Checklist */}
              <div className="hs-card-in rounded-2xl border border-line-strong bg-ink-900/95 p-4 shadow-xl backdrop-blur-md lg:absolute lg:bottom-6 lg:right-[115px] lg:w-[244px]">
                <ul className="space-y-2.5 text-xs">
                  <li className="flex items-center justify-between gap-2">
                    <span className="flex items-center gap-2.5 font-medium text-fg">
                      <span className="size-2.5 rounded-full bg-human-accent" />
                      Scaffold API &amp; schema
                    </span>
                    <span className="font-mono text-[10px] text-human-accent">
                      Done
                    </span>
                  </li>
                  <li className="flex items-center justify-between gap-2">
                    <span className="flex items-center gap-2.5 font-medium text-brand-300">
                      <span className="size-2.5 rounded-full bg-brand-400" />
                      Generate 212 unit tests
                    </span>
                    <span className="font-mono text-[10px] text-brand-300">
                      Pass
                    </span>
                  </li>
                  <li className="flex items-center justify-between gap-2">
                    <span className="flex items-center gap-2.5 font-medium text-fg-muted">
                      <span className="size-2.5 rounded-full bg-brand-400/60" />
                      Human security sign-off
                    </span>
                    <span className="font-mono text-[10px] text-fg-subtle">
                      Verified
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* ----------------- SLIDE 3: FULL-STACK SCALE (5 CONSTELLATION ORBITAL HUBS) ----------------- */}
        {currentSlide.id === "scale" && (
          <div
            key="scale"
            className="hs-stage relative mx-auto w-full max-w-5xl px-4"
          >
            {/* Full-Bleed Relay Lines picking up from Slide 2 (y=186) and handing off to Slide 4 (y=170) */}
            <svg
              aria-hidden
              viewBox="0 0 960 340"
              fill="none"
              className="pointer-events-none absolute inset-0 hidden size-full overflow-visible lg:block"
            >
              {/* Left incoming clean S-wave from the far-left screen edge into the constellation */}
              <path
                d="M -2800 186 H -15 C 25 186, 25 224, -15 224 H -65 C -105 224, -105 262, -65 262 H 148"
                pathLength={1}
                className="hs-line-draw stroke-fg/55"
                strokeWidth="1.5"
              />
              <circle cx="152" cy="262" r="4.5" className="hs-pop fill-fg drop-shadow-[0_0_8px_rgba(255,255,255,0.85)]" />

              {/* Right outgoing orange wave line exiting the constellation all the way to the far-right screen edge */}
              <circle
                cx="808"
                cy="240"
                r="4.5"
                className="hs-pop fill-ink-950 stroke-brand-400 drop-shadow-[0_0_8px_rgba(255,112,14,0.9)]"
                strokeWidth="1.6"
              />
              <path
                d="M 813 240 H 890 C 945 240, 975 170, 1035 170 H 2800"
                pathLength={1}
                className="hs-line-draw stroke-brand-400/80"
                strokeWidth="1.5"
              />
            </svg>

            {/* 5 Clean Circular Orbital Discipline Hubs (3 Top Row + 2 Staggered Bottom Row) */}
            <div className="mx-auto flex flex-col gap-4 lg:gap-3">
              {/* TOP ROW: 3 Orbital Discipline Hubs */}
              <div className="grid grid-cols-1 items-center gap-5 md:grid-cols-3 lg:gap-6">
                {/* HUB 1: AI Solutions & Agents */}
                <div className="relative mx-auto flex h-[156px] w-[260px] items-center justify-center">
                  <svg
                    aria-hidden
                    viewBox="0 0 180 180"
                    className="pointer-events-none absolute size-[148px]"
                  >
                    <circle
                      cx="90"
                      cy="90"
                      r="80"
                      className="fill-none stroke-fg/20"
                      strokeWidth="1"
                      strokeDasharray="2 3"
                    />
                    <circle
                      cx="90"
                      cy="90"
                      r="68"
                      className="hs-orbit-spin fill-none stroke-fg/30"
                      strokeWidth="1.1"
                      strokeDasharray="3 4"
                    />
                  </svg>

                  <DisciplineMiniMonument variant="ai" />

                  {/* Primary Callout Pill */}
                  <div className="hs-card-in absolute bottom-1 left-2 flex items-center gap-2.5 rounded-full border border-line-strong bg-ink-900/95 px-3.5 py-1.5 shadow-lg backdrop-blur-md">
                    <span className="grid size-6 shrink-0 place-items-center rounded-full bg-brand-400/15 text-brand-400">
                      <Bot className="size-3.5" />
                    </span>
                    <span className="text-xs font-semibold text-fg">
                      AI Agents &amp; RAG nexus
                    </span>
                  </div>
                </div>

                {/* HUB 2: Custom Software */}
                <div className="relative mx-auto flex h-[156px] w-[270px] items-center justify-center">
                  <svg
                    aria-hidden
                    viewBox="0 0 180 180"
                    className="pointer-events-none absolute size-[148px]"
                  >
                    <circle
                      cx="90"
                      cy="90"
                      r="80"
                      className="fill-none stroke-fg/20"
                      strokeWidth="1"
                      strokeDasharray="2 3"
                    />
                    <circle
                      cx="90"
                      cy="90"
                      r="68"
                      className="hs-orbit-spin fill-none stroke-fg/30"
                      strokeWidth="1.1"
                      strokeDasharray="3 4"
                    />
                  </svg>

                  <DisciplineMiniMonument variant="software" />

                  {/* Primary Callout Pill */}
                  <div className="hs-card-in absolute top-1 right-0 flex items-center gap-2.5 rounded-2xl border border-line-strong bg-ink-900/95 px-3 py-1.5 shadow-lg backdrop-blur-md">
                    <span className="grid size-6 shrink-0 place-items-center rounded-full border border-human-accent/50 bg-human-accent/15 font-mono text-[11px] font-bold text-human-accent">
                      !
                    </span>
                    <span className="text-[11px] leading-tight font-semibold text-fg">
                      Web, Mobile &amp; SaaS
                      <br />
                      architecture blueprint
                    </span>
                  </div>
                </div>

                {/* HUB 3: Process Automation */}
                <div className="relative mx-auto flex h-[156px] w-[270px] items-center justify-center">
                  <svg
                    aria-hidden
                    viewBox="0 0 180 180"
                    className="pointer-events-none absolute size-[148px]"
                  >
                    <circle
                      cx="90"
                      cy="90"
                      r="80"
                      className="fill-none stroke-fg/20"
                      strokeWidth="1"
                      strokeDasharray="2 3"
                    />
                    <circle
                      cx="90"
                      cy="90"
                      r="68"
                      className="hs-orbit-spin fill-none stroke-fg/30"
                      strokeWidth="1.1"
                      strokeDasharray="3 4"
                    />
                  </svg>

                  <DisciplineMiniMonument variant="automation" />

                  {/* Primary Callout Card with "Now" status */}
                  <div className="hs-card-in absolute right-0 bottom-1 flex items-center gap-3 rounded-2xl border border-line-strong bg-ink-900/95 px-3.5 py-2 shadow-lg backdrop-blur-md">
                    <div>
                      <p className="text-[11px] leading-tight font-semibold text-fg">
                        CRM, ERP &amp; Finance
                        <br />
                        Workflow Orchestration
                      </p>
                    </div>
                    <span className="shrink-0 rounded-full bg-human-accent/15 px-2 py-0.5 font-mono text-[10px] font-semibold text-human-accent">
                      Now
                    </span>
                  </div>
                </div>
              </div>

              {/* BOTTOM ROW: 2 Orbital Discipline Hubs (Staggered in the center gaps) */}
              <div className="mx-auto grid w-full max-w-3xl grid-cols-1 items-center gap-5 md:grid-cols-2 lg:gap-10">
                {/* HUB 4: Data & Cloud Platforms */}
                <div className="relative mx-auto flex h-[156px] w-[290px] items-center justify-center">
                  <svg
                    aria-hidden
                    viewBox="0 0 180 180"
                    className="pointer-events-none absolute size-[148px]"
                  >
                    <circle
                      cx="90"
                      cy="90"
                      r="80"
                      className="fill-none stroke-fg/20"
                      strokeWidth="1"
                      strokeDasharray="2 3"
                    />
                    <circle
                      cx="90"
                      cy="90"
                      r="68"
                      className="hs-orbit-spin fill-none stroke-fg/30"
                      strokeWidth="1.1"
                      strokeDasharray="3 4"
                    />
                  </svg>

                  <DisciplineMiniMonument variant="data" />

                  {/* Primary Callout Card with "Completed" badge */}
                  <div className="hs-card-in absolute bottom-1 left-0 flex items-center gap-2.5 rounded-2xl border border-line-strong bg-ink-900/95 px-3.5 py-2 shadow-lg backdrop-blur-md">
                    <p className="text-[11px] leading-tight font-semibold text-fg">
                      AWS &amp; data pipeline
                      <br />
                      cluster autoscaling
                    </p>
                    <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-human-accent/15 px-2.5 py-1 font-mono text-[10px] font-semibold text-human-accent">
                      <Check className="size-2.5 stroke-[3]" /> Completed
                    </span>
                  </div>
                </div>

                {/* HUB 5: Cybersecurity & QA */}
                <div className="relative mx-auto flex h-[156px] w-[290px] items-center justify-center">
                  <svg
                    aria-hidden
                    viewBox="0 0 180 180"
                    className="pointer-events-none absolute size-[148px]"
                  >
                    <circle
                      cx="90"
                      cy="90"
                      r="80"
                      className="fill-none stroke-fg/20"
                      strokeWidth="1"
                      strokeDasharray="2 3"
                    />
                    <circle
                      cx="90"
                      cy="90"
                      r="68"
                      className="hs-orbit-spin fill-none stroke-fg/30"
                      strokeWidth="1.1"
                      strokeDasharray="3 4"
                    />
                  </svg>

                  <DisciplineMiniMonument variant="security" />

                  {/* Primary Callout Pill */}
                  <div className="hs-card-in absolute top-1 right-0 flex items-center gap-2.5 rounded-full border border-human-accent/40 bg-ink-900/95 px-3.5 py-1.5 shadow-lg backdrop-blur-md">
                    <span className="grid size-6 shrink-0 place-items-center rounded-full bg-human-accent/15 text-human-accent">
                      <ShieldCheck className="size-3.5" />
                    </span>
                    <span className="text-[11px] leading-tight font-semibold text-fg">
                      Zero-trust security &amp;
                      <br />
                      212 E2E test gates
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ----------------- SLIDE 4: CONTINUOUS DELIVERY / ARTISTIC EXPLORE FINALE ----------------- */}
        {currentSlide.id === "ship" && (
          <div
            key="ship"
            className="hs-stage relative mx-auto flex w-full items-center justify-center px-4"
          >
            {/* Artistic Oversized Typography Finale framed by the Helical Spring-Coil Relay Lines */}
            <div className="relative mx-auto flex w-full flex-col items-center justify-center py-8 text-center lg:h-[340px]">
              {/* Inline-sized Finale Block so left & right spring-coil lines sit cleanly outside the text */}
              <div className="relative inline-flex flex-col items-center">
                {/* Left horizontal line with helical spring coils (anchored 32px to the left of text & extending to left screen edge) */}
                <svg
                  aria-hidden
                  viewBox="0 0 280 48"
                  fill="none"
                  className="pointer-events-none absolute top-1/2 right-full mr-8 hidden h-12 w-[280px] -translate-y-1/2 overflow-visible lg:block"
                >
                  <path
                    d="M -2600 24 H 170 C 176 4, 186 4, 182 24 C 178 40, 188 40, 192 24 C 196 4, 206 4, 202 24 C 198 40, 208 40, 212 24 C 216 4, 226 4, 222 24 C 218 40, 228 40, 232 24 H 270"
                    pathLength={1}
                    className="hs-line-draw stroke-fg/55"
                    strokeWidth="1.4"
                  />
                  <circle cx="272" cy="24" r="4" className="hs-pop fill-fg drop-shadow-[0_0_8px_rgba(255,255,255,0.85)]" />
                </svg>

                {/* Right horizontal line with helical spring coils (anchored 32px to the right of text & extending to right screen edge in brand orange) */}
                <svg
                  aria-hidden
                  viewBox="0 0 280 48"
                  fill="none"
                  className="pointer-events-none absolute top-1/2 left-full ml-8 hidden h-12 w-[280px] -translate-y-1/2 overflow-visible lg:block"
                >
                  <circle
                    cx="8"
                    cy="24"
                    r="4"
                    className="hs-pop fill-ink-950 stroke-brand-400 drop-shadow-[0_0_8px_rgba(255,112,14,0.9)]"
                    strokeWidth="1.6"
                  />
                  <path
                    d="M 13 24 H 48 C 52 4, 62 4, 58 24 C 54 40, 64 40, 68 24 C 72 4, 82 4, 78 24 C 74 40, 84 40, 88 24 C 92 4, 102 4, 98 24 C 94 40, 104 40, 108 24 H 2600"
                    pathLength={1}
                    className="hs-line-draw stroke-brand-400/80"
                    strokeWidth="1.5"
                  />
                </svg>

                {/* Eyebrow */}
                <div className="hs-title-eyebrow flex items-center justify-center gap-2.5">
                  <p className="eyebrow">
                    Continue Below · The Full Experience
                  </p>
                </div>

                {/* Artistic Oversized Display Headline */}
                <h2 className="mx-auto mt-4 font-display text-[clamp(2.6rem,5.2vw,4.75rem)] leading-[1.02] font-semibold tracking-[-0.03em] text-fg">
                  <span className="hs-title-line-1 block font-light tracking-tight text-fg/90 sm:whitespace-nowrap">
                    Continue to See More.
                  </span>
                  <span className="hs-title-line-2 text-gradient mt-1 block sm:whitespace-nowrap">
                    Explore Us.
                  </span>
                </h2>

                <p className="hs-card-in mx-auto mt-4 max-w-md text-sm leading-relaxed text-fg-muted sm:text-[15px]">
                  Scroll down to experience our live engineering workflow,
                  architecture standards, and shipped production systems.
                </p>

                {/* Stylish Modern Scroll Cue / Exploration Gateway */}
                <div className="hs-card-in mt-7 flex flex-col items-center justify-center">
                  <a
                    href="#scene-title"
                    className="group relative inline-flex items-center gap-3.5 rounded-full border border-brand-400/40 bg-ink-900/90 py-2 pr-2 pl-4 text-sm font-semibold text-fg shadow-[0_0_30px_-6px_rgba(255,112,14,0.35)] backdrop-blur-md transition-all duration-300 hover:scale-[1.02] hover:border-brand-400 hover:bg-ink-850 hover:shadow-[0_0_40px_-4px_rgba(255,112,14,0.6)] active:scale-[0.98]"
                  >
                    {/* Subtle top edge highlight */}
                    <span
                      aria-hidden
                      className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-brand-400/70 to-transparent"
                    />

                    {/* Radar Beacon */}
                    <span className="relative flex size-2">
                      <span className="absolute inline-flex size-full motion-safe:animate-ping rounded-full bg-brand-400 opacity-75" />
                      <span className="relative inline-flex size-2 rounded-full bg-brand-400" />
                    </span>

                    {/* Primary Label */}
                    <span className="tracking-tight text-fg transition-colors group-hover:text-brand-200">
                      Explore Full Experience
                    </span>

                    {/* Mono Stage Cue */}
                    <span className="hidden font-mono text-[10px] tracking-wider text-fg-subtle uppercase sm:inline">
                      {"// SCROLL DOWN"}
                    </span>

                    {/* Circular Glow Disc with Animated Arrow */}
                    <span className="grid size-8 place-items-center rounded-full bg-brand-400 text-ink-950 shadow-md transition-all duration-300 group-hover:bg-brand-300 group-hover:shadow-[0_0_16px_rgba(255,112,14,0.9)]">
                      <ArrowDown className="size-4 stroke-[2.4] transition-transform duration-300 group-hover:translate-y-0.5" />
                    </span>
                  </a>

                  {/* Subtle animated mouse / scroll cue below */}
                  <div
                    aria-hidden
                    className="mt-3 flex items-center gap-2 font-mono text-[10px] tracking-widest text-fg-subtle/80 uppercase"
                  >
                    <svg
                      viewBox="0 0 10 16"
                      className="h-4 w-2.5 shrink-0 overflow-hidden"
                    >
                      {/* Mouse pill shell */}
                      <rect
                        x="0.75"
                        y="0.75"
                        width="8.5"
                        height="14.5"
                        rx="4.25"
                        className="fill-ink-950 stroke-line-strong"
                        strokeWidth="1.2"
                      />
                      {/* Wheel dot moving smoothly vertically */}
                      <circle cx="5" cy="4" r="1.3" className="fill-brand-400">
                        <animate
                          attributeName="cy"
                          values="4;8.5;10;4"
                          keyTimes="0;0.55;0.8;1"
                          dur="1.7s"
                          repeatCount="indefinite"
                        />
                        <animate
                          attributeName="opacity"
                          values="1;1;0;0"
                          keyTimes="0;0.55;0.8;1"
                          dur="1.7s"
                          repeatCount="indefinite"
                        />
                      </circle>
                    </svg>
                    <span>scroll to enter</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ================= BOTTOM BAR: Tabs + Branching Rail Lines ================= */}
      <div className="relative z-20 mt-1 w-full">
        <div className="container-site flex flex-col items-center">
          {/* Slide Navigation Tabs */}
          <div className="relative mt-1 w-full max-w-3xl">
            <div
              role="tablist"
              aria-label="Engineering workflow stages"
              className="grid w-full grid-cols-2 border-b border-line-strong sm:grid-cols-5"
            >
              {SLIDES.map((s, idx) => {
                const isSelected = idx === active;
                return (
                  <button
                    key={s.id}
                    role="tab"
                    type="button"
                    aria-selected={isSelected}
                    onClick={() => selectSlide(idx)}
                    className={cn(
                      "relative flex items-center justify-center gap-1.5 px-2 py-2.5 text-xs font-semibold whitespace-nowrap transition-colors sm:text-[13px]",
                      isSelected
                        ? "text-fg"
                        : "text-fg-subtle hover:text-fg-muted",
                    )}
                  >
                    <span className="whitespace-nowrap">{s.tab}</span>
                    {isSelected && <TabSpinner progress={progress} />}
                    {isSelected && (
                      <span
                        aria-hidden
                        className="absolute inset-x-0 -bottom-px h-[3px] rounded-full bg-brand-400"
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
