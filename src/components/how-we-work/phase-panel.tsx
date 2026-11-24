import type { CSSProperties } from "react";
import { Blocks, CodeXml, Compass, FlagTriangleRight, FlaskConical, Rocket, Sparkles, UserCheck, UserRound, type LucideIcon } from "lucide-react";
import type { ProcessPhase } from "@/content/process";
import { phaseWidgets } from "./phase-widgets";

const aiLevel = ["", "Low", "Medium", "High"];
const icons: Record<string, LucideIcon> = {
  discovery: Compass,
  architecture: Blocks,
  implementation: CodeXml,
  review: UserCheck,
  testing: FlaskConical,
  deployment: Rocket,
};

/**
 * The lamp's light is a cone: narrow under the lamp, wide near the floor. So every phase puts its
 * title centred under the lamp and its text + widget in a row lower down, where the light is
 * widest. The row differs per phase: order, tilt and proportions.
 */
const layouts = ["split", "split-rev", "split-tilt", "split-rev-tilt", "split-wide", "split-rev-wide"] as const;

/**
 * One delivery phase as a full-screen slide in the How We Work horizontal scroll: the phase and
 * title, then a short summary (who leads, the checkpoint) beside one animated widget that builds
 * itself when the panel arrives under the lamp. Styles: .php-* and .phw-*.
 */
export function PhasePanel({ phase: p, index, total }: { phase: ProcessPhase; index: number; total: number }) {
  const Icon = icons[p.id] ?? Compass;
  const Widget = phaseWidgets[index] ?? phaseWidgets[0];
  const t = (s: number) => ({ "--d": `${s}s` }) as CSSProperties;

  return (
    <li className="php relative w-full shrink-0" data-layout={layouts[index % layouts.length]}>
      <div className="container-site php-inner">
        <div className="php-head">
          <div className="php-kicker" data-a="rise" style={t(0)}>
            <span className="hs-gloss php-tile" data-tone={p.aiWeight >= 2 ? "brand" : "human"} aria-hidden>
              <Icon className="size-[48%]" strokeWidth={1.8} />
            </span>
            <p className="eyebrow">
              Phase {index + 1} of {total}
            </p>
          </div>
          <h3 className="php-title text-display-lg font-semibold" data-a="rise" style={t(0.1)}>
            {p.title}
          </h3>
        </div>
        <div className="php-text">
          <p className="text-lead text-fg-muted" data-a="rise" style={t(0.25)}>
            {p.summary}
          </p>
          <div className="php-chips" data-a="rise" style={t(0.35)}>
            <span className="php-chip" data-tone="human">
              <UserRound aria-hidden className="size-3.5" /> People lead
            </span>
            <span className="php-chip" data-tone="brand">
              <Sparkles aria-hidden className="size-3.5" /> AI: {aiLevel[p.aiWeight]}
            </span>
          </div>
          <p className="php-gate" data-a="rise" style={t(0.45)}>
            <FlagTriangleRight aria-hidden className="size-4 shrink-0" />
            <span>
              <span className="sr-only">Checkpoint: </span>
              {p.checkpoint}
            </span>
          </p>
        </div>
        <div className="php-widget">
          <Widget />
        </div>
      </div>
    </li>
  );
}
