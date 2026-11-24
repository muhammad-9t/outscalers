"use client";

import { type CSSProperties, useRef } from "react";
import { CalendarCheck, Check, Mail, MessageSquareText, Send, UserRound } from "lucide-react";
import { useTilt } from "@/components/about/use-tilt";

/**
 * Contact hero visual, in the same widget style as the About hero: a reply-time card with an
 * engineer online, a 30-minute call card and a "message sent" project card, with glossy icon
 * tiles in front. Tilts in 3D with the mouse. Styles: .aj-* (shared) and .cv-* in globals.css.
 */
export function ContactVisual() {
  const ref = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<HTMLDivElement>(null);
  useTilt(ref, sceneRef);

  return (
    <div ref={ref} className="aj cv" role="img" aria-label="An engineer replies within one business day; book a 30-minute call or send your project details">
      <div ref={sceneRef} className="aj-scene">
        <span aria-hidden className="aj-glow aj-glow-a" />
        <span aria-hidden className="aj-glow aj-glow-b" />

        {/* Reply time */}
        <div className="aj-card cv-a" style={{ "--z": "-40px", "--i": 0 } as CSSProperties}>
          <div className="flex items-center justify-between">
            <span className="aj-year">Reply time</span>
            <span className="cv-online">Online</span>
          </div>
          <div className="mt-3 flex items-center gap-3">
            <span className="cv-avatar" data-tone="human">
              <UserRound className="size-4" />
            </span>
            <span>
              <span className="block font-semibold">An engineer replies</span>
              <span className="block text-sm text-fg-muted">Within one business day</span>
            </span>
          </div>
        </div>

        {/* Book a call */}
        <div className="aj-card cv-b" style={{ "--z": "0px", "--i": 1 } as CSSProperties}>
          <div className="flex items-center justify-between">
            <span className="aj-year">Free call</span>
            <span className="aj-icon" data-tone="human">
              <CalendarCheck className="size-4" />
            </span>
          </div>
          <p className="mt-2 font-semibold">30 minutes, no obligation</p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            <span className="aj-chip">Europe hours</span>
            <span className="aj-chip">Asia hours</span>
          </div>
        </div>

        {/* Your project */}
        <div className="aj-card cv-c" style={{ "--z": "60px", "--i": 2 } as CSSProperties}>
          <div className="flex items-center justify-between">
            <span className="aj-year aj-live">Your project</span>
            <span className="aj-icon" data-tone="brand">
              <MessageSquareText className="size-4" />
            </span>
          </div>
          <p className="mt-2 text-lg font-semibold">Tell us what you&apos;re building</p>
          <span className="mt-2.5 block space-y-1.5">
            <span className="aj-code" data-tone="muted" style={{ width: "86%" }} />
            <span className="aj-code" data-tone="muted" style={{ width: "64%" }} />
          </span>
          <div className="mt-3 flex items-center justify-between">
            <span className="cv-sent">
              <Check aria-hidden className="size-3.5" strokeWidth={3} /> Message sent
            </span>
            <span className="cv-send" aria-hidden>
              <Send className="size-4" />
            </span>
          </div>
        </div>

        {/* Glossy tiles */}
        {[
          { icon: Mail, x: 84, y: 0, tone: "brand" },
          { icon: CalendarCheck, x: 0, y: 46, tone: "human" },
          { icon: MessageSquareText, x: 86, y: 78, tone: "data" },
        ].map((t, i) => (
          <span
            key={i}
            aria-hidden
            className="aj-tile"
            data-tone={t.tone}
            style={{ "--x": `${t.x}%`, "--y": `${t.y}%`, "--z": "110px", "--i": i } as CSSProperties}
          >
            <t.icon className="size-[48%]" strokeWidth={1.8} />
          </span>
        ))}
      </div>
    </div>
  );
}
