"use client";

import { type CSSProperties, useRef } from "react";
import { BookOpen, Check, FileText, Pencil, Sparkles, UserRound } from "lucide-react";
import { useTilt } from "@/components/about/use-tilt";

/**
 * AI Solutions hero: one assistant chat window. A customer asks, the assistant answers from the
 * company's own documents (with citations), and an agent approves before it is sent. A confidence
 * gauge clips onto the window's corner and a hand-off note hangs below it; one glossy tile in front.
 * Tilts with the mouse. Styles: .aj-* (shared) and .sdai-* in globals.css.
 */
export function AiHeroVisual() {
  const ref = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<HTMLDivElement>(null);
  useTilt(ref, sceneRef);

  return (
    <div
      ref={ref}
      className="aj sdai"
      role="img"
      aria-label="An AI assistant answers a customer from the company's own documents with citations, at 92% confidence, and an agent approves the reply before it is sent"
    >
      <div ref={sceneRef} className="aj-scene">
        <span aria-hidden className="aj-glow aj-glow-a" />

        {/* The chat window */}
        <div className="aj-card sdai-win" style={{ "--z": "0px", "--i": 0 } as CSSProperties}>
          <div className="sdai-head">
            <span className="sdai-bot">
              <Sparkles className="size-4" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-semibold">Support assistant</span>
              <span className="cv-online">Answers from your help centre</span>
            </span>
          </div>

          <div className="sdai-body">
            <p className="sdai-msg sdai-msg-user">Can I get a refund on an annual plan?</p>
            <div className="sdai-msg sdai-msg-bot">
              <p>
                Yes. Annual plans can be refunded within 30 days of renewal, pro-rated for unused months.
              </p>
              <span className="mt-2.5 flex flex-wrap gap-1.5">
                <span className="sdai-cite">
                  <FileText className="size-3" /> Refund policy
                </span>
                <span className="sdai-cite">
                  <BookOpen className="size-3" /> Help centre
                </span>
              </span>
            </div>
          </div>

          <div className="sdai-foot">
            <span className="text-xs text-fg-muted">Waiting for agent review</span>
            <span className="flex gap-1.5">
              <span className="sdai-btn">
                <Pencil className="size-3" /> Edit
              </span>
              <span className="sdai-btn sdai-btn-go">
                <Check className="size-3" strokeWidth={3} /> Approve
              </span>
            </span>
          </div>
        </div>

        {/* Confidence gauge, clipped onto the window's corner */}
        <div className="aj-card sdai-conf" style={{ "--z": "70px", "--i": 1 } as CSSProperties}>
          <svg viewBox="0 0 44 44" className="sdai-ring" aria-hidden>
            <circle cx="22" cy="22" r="18" />
            <circle cx="22" cy="22" r="18" pathLength="100" style={{ strokeDasharray: "92 100" }} />
          </svg>
          <span>
            <span className="block text-lg font-semibold leading-none">92%</span>
            <span className="mt-1 block text-xs text-fg-muted">Confidence</span>
          </span>
        </div>

        {/* Low-confidence hand-off */}
        <div className="aj-card sdai-route" style={{ "--z": "50px", "--i": 2 } as CSSProperties}>
          <span className="cv-avatar sdai-avatar">
            <UserRound className="size-3.5" />
          </span>
          <span className="text-sm">
            Under 70%? <span className="font-semibold">A person takes over.</span>
          </span>
        </div>

        <span
          aria-hidden
          className="aj-tile sdai-tile"
          data-tone="brand"
          style={{ "--x": "0%", "--y": "0%", "--z": "110px", "--i": 1 } as CSSProperties}
        >
          <Sparkles className="size-[48%]" strokeWidth={1.8} />
        </span>
      </div>
    </div>
  );
}
