import type { CSSProperties, ReactNode } from "react";
import { BookOpen, Check, FileText, GitMerge, LockKeyhole, MessageSquare, Rocket, Sparkles, UserRound } from "lucide-react";

/*
 * One animated widget per delivery phase. Every moving part carries `data-a` (the animation) and
 * `--d` (its delay); the animations only run while the panel has `data-active` (see
 * HorizontalScroll), so each widget builds itself as its panel arrives in the light. Without
 * motion, everything simply shows in its final state. Styles: .phw-* in globals.css.
 */

const d = (s: number, extra?: CSSProperties) => ({ "--d": `${s}s`, ...extra }) as CSSProperties;

function Frame({ title, aside, className, children }: { title: string; aside?: ReactNode; className?: string; children: ReactNode }) {
  return (
    <div className={`phw ${className ?? ""}`} data-a="rise" style={d(0)}>
      <div className="phw-head">
        <span className="font-semibold">{title}</span>
        {aside}
      </div>
      {children}
    </div>
  );
}

/** 1. Discovery: notes from the workshop drop onto the board, AI condenses the documents, scope is agreed. */
export function DiscoveryWidget() {
  const notes = [
    { k: "Goals", t: "Faster order handling", tone: "human", r: "-4deg" },
    { k: "Users", t: "Kitchen staff, managers", tone: "brand", r: "3deg" },
    { k: "Limits", t: "Live before May", tone: "data", r: "-2deg" },
  ];
  return (
    <Frame title="Kick-off workshop" aside={<span className="phw-chip">3 people</span>} className="phw-disc">
      <div className="phw-notes">
        {notes.map((n, i) => (
          <span key={n.k} className="phw-note" data-tone={n.tone} data-a="drop" style={d(0.35 + i * 0.18, { "--r": n.r } as CSSProperties)}>
            <b>{n.k}</b>
            {n.t}
          </span>
        ))}
      </div>
      <div className="phw-ai" data-a="slide" style={d(1.05)}>
        <span className="phw-ai-icon">
          <Sparkles className="size-3.5" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-semibold">AI summary</span>
          <span className="block text-xs text-fg-muted">24 pages of documents → a 1-page brief</span>
        </span>
      </div>
      <span className="phw-stamp" data-a="stamp" style={d(1.7)}>
        <Check className="size-4" strokeWidth={3} /> Scope agreed
      </span>
    </Frame>
  );
}

/** 2. Architecture: the system diagram draws itself; decisions are written down. */
export function ArchitectureWidget() {
  const nodes = [
    { k: "Web app", x: "4%", y: "6%" },
    { k: "Mobile", x: "4%", y: "62%" },
    // The API box is taller (it carries the "Secured" chip), so it sits higher to keep its centre on the wires
    { k: "API", x: "40%", y: "25%", lock: true },
    { k: "Database", x: "73%", y: "34%" },
  ];
  return (
    <Frame title="System design" aside={<span className="phw-chip" data-tone="brand"><Sparkles className="size-3" /> 3 options compared</span>} className="phw-arch">
      <div className="phw-diagram">
        {/* Wires run a little into each box (the boxes cover the ends), so they always meet; revealed by a wipe */}
        <svg viewBox="0 0 300 150" preserveAspectRatio="none" aria-hidden data-a="wipe" style={d(0.6)}>
          {["M90 25 C 110 25, 104 67, 124 67", "M90 109 C 110 109, 104 67, 124 67", "M198 67 H 222"].map((p) => (
            <path key={p} d={p} className="phw-wire" />
          ))}
        </svg>
        {nodes.map((n, i) => (
          <span key={n.k} className="phw-node" data-a="pop" style={d(0.25 + i * 0.15, { left: n.x, top: n.y })}>
            {n.k}
            {n.lock && (
              <span className="phw-lock" data-a="pop" style={d(1.4)}>
                <LockKeyhole aria-hidden className="size-3" /> Secured
              </span>
            )}
          </span>
        ))}
      </div>
      <div className="phw-log" data-a="slide" style={d(1.6)}>
        <span className="phw-avatar">
          <UserRound className="size-3.5" />
        </span>
        <span className="text-sm">
          <b className="font-semibold">Decision:</b> Postgres, because reports need joins
        </span>
      </div>
    </Frame>
  );
}

/** 3. Implementation: the engineer writes the core, AI suggests the loop, the engineer accepts and commits. */
export function ImplementationWidget() {
  const lines: { code: ReactNode; who: "human" | "ai" }[] = [
    { code: <><i>export function</i> <u>routeOrder</u>(order) {"{"}</>, who: "human" },
    { code: <>  <i>const</i> station = pickStation(order);</>, who: "human" },
    { code: <>  <i>for</i> (<i>const</i> line <i>of</i> order.lines) {"{"}</>, who: "ai" },
    { code: <>    station.queue.push(line);</>, who: "ai" },
    { code: <>  {"}"}</>, who: "ai" },
    { code: <>  <i>return</i> notify(station);</>, who: "human" },
    { code: <>{"}"}</>, who: "human" },
  ];
  return (
    <Frame
      title="orders.ts"
      aside={
        <span className="flex gap-3 text-xs text-fg-muted">
          <span className="phw-who" data-tone="human">Engineer</span>
          <span className="phw-who" data-tone="brand">AI suggestion</span>
        </span>
      }
      className="phw-code"
    >
      <ol className="phw-lines">
        {lines.map((l, i) => (
          <li key={i} className="phw-line" data-who={l.who}>
            <span className="phw-gutter">{i + 1}</span>
            <code data-a={l.who === "ai" ? "ghost" : "type"} style={d(l.who === "ai" ? 1.15 : 0.3 + i * 0.22)}>
              {l.code}
            </code>
          </li>
        ))}
        <span className="phw-tip" data-a="tip" style={d(1.35)}>
          Tab to accept · reviewed line by line
        </span>
      </ol>
      <div className="phw-commit" data-a="slide" style={d(2.6)}>
        <GitMerge className="size-4 text-data-accent" />
        <span className="min-w-0 flex-1 truncate text-sm">feat: route orders to kitchen stations</span>
        <span className="phw-ok">
          <Check className="size-3" strokeWidth={3} /> Committed
        </span>
      </div>
    </Frame>
  );
}

/** 4. Review: the diff comes in, a reviewer asks a question, then the approval lands. */
export function ReviewWidget() {
  const diff = [
    { s: "+", t: "if (!order.lines.length) return;" },
    { s: "+", t: "const station = pickStation(order);" },
    { s: "-", t: "const station = stations[0];" },
    { s: "+", t: "expect(route(empty)).toBeNull();" },
  ];
  return (
    <Frame title="#214 Route orders to stations" aside={<span className="phw-chip" data-tone="brand"><Sparkles className="size-3" /> AI flagged 2 lines</span>} className="phw-review">
      <ul className="phw-diff">
        {diff.map((r, i) => (
          <li key={i} data-sign={r.s === "+" ? "add" : "del"} data-a="slide" style={d(0.3 + i * 0.15)}>
            <span>{r.s}</span>
            <code>{r.t}</code>
          </li>
        ))}
      </ul>
      <div className="phw-comment" data-a="pop" style={d(1.05)}>
        <span className="phw-avatar">
          <MessageSquare className="size-3.5" />
        </span>
        <span className="text-sm">What happens if an order has no lines? <b className="font-semibold">Fixed, with a test.</b></span>
      </div>
      <span className="phw-stamp phw-stamp-big" data-a="stamp" style={d(1.75)}>
        <Check className="size-5" strokeWidth={3} /> Approved
      </span>
    </Frame>
  );
}

/** 5. Testing: suites run and tick green, coverage fills, and a tester finds the edge case. */
export function TestingWidget() {
  const suites = [
    { k: "Unit", n: "96 passed" },
    { k: "Integration", n: "24 passed" },
    { k: "End-to-end", n: "8 passed" },
    { k: "Accessibility", n: "No issues" },
  ];
  return (
    <Frame title="Test run" aside={<span className="phw-chip">128 tests</span>} className="phw-test">
      <span className="phw-bar">
        <span data-a="fill" style={d(0.3)} />
      </span>
      <div className="phw-test-body">
        <ul className="phw-suites">
          {suites.map((s, i) => (
            <li key={s.k}>
              <span className="phw-tick" data-a="tick" style={d(0.5 + i * 0.3)}>
                <Check className="size-3" strokeWidth={3.5} />
              </span>
              <span className="flex-1">{s.k}</span>
              <span className="text-xs text-fg-muted">{s.n}</span>
            </li>
          ))}
        </ul>
        <span className="phw-ring">
          <svg viewBox="0 0 44 44" aria-hidden>
            <circle cx="22" cy="22" r="18" />
            <circle cx="22" cy="22" r="18" pathLength={100} data-a="ring" style={d(0.5)} />
          </svg>
          <span>
            <b>92%</b>
            <small>coverage</small>
          </span>
        </span>
      </div>
      <div className="phw-log" data-a="slide" style={d(1.9)}>
        <span className="phw-avatar">
          <UserRound className="size-3.5" />
        </span>
        <span className="text-sm">
          <b className="font-semibold">Tester:</b> found a double-tap edge case. Fixed.
        </span>
      </div>
    </Frame>
  );
}

/** 6. Deployment: the release moves Build → Staging → Production, goes live, and is watched. */
export function DeploymentWidget() {
  const stages = [
    { k: "Build", icon: FileText },
    { k: "Staging", icon: BookOpen },
    { k: "Production", icon: Rocket },
  ];
  return (
    <Frame title="Release 1.4" aside={<span className="phw-live" data-a="pop" style={d(1.9)}>Live</span>} className="phw-deploy">
      <div className="phw-pipe">
        <span className="phw-pipe-track">
          <span data-a="fill" style={d(0.3, { "--dur": "1.5s" } as CSSProperties)} />
        </span>
        {stages.map((s, i) => (
          <span key={s.k} className="phw-stage" data-a="light" style={d(0.3 + i * 0.7)}>
            <span className="phw-stage-dot">
              <s.icon className="size-4" />
            </span>
            {s.k}
          </span>
        ))}
      </div>
      <div className="phw-uptime">
        <span>
          <span className="block text-xs text-fg-muted">Uptime, first week</span>
          <span className="text-xl font-semibold">99.98%</span>
        </span>
        <svg viewBox="0 0 150 40" preserveAspectRatio="none" aria-hidden data-a="wipe" style={d(2)}>
          <path d="M0 30 C 15 28, 22 12, 36 16 S 58 30, 72 20 S 96 6, 110 12 S 134 18, 150 6" />
        </svg>
      </div>
      <div className="phw-log" data-a="slide" style={d(2.3)}>
        <span className="phw-avatar">
          <UserRound className="size-3.5" />
        </span>
        <span className="text-sm">Alerts go to the on-call engineer. Rollback ready.</span>
      </div>
    </Frame>
  );
}

export const phaseWidgets = [DiscoveryWidget, ArchitectureWidget, ImplementationWidget, ReviewWidget, TestingWidget, DeploymentWidget];
