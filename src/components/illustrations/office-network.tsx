import { siteConfig } from "@/lib/site";
import { cn } from "@/lib/cn";

// Approximate coordinates, projected onto a simple equirectangular grid (cropped to Europe–Asia).
const coords: Record<string, [lon: number, lat: number]> = {
  Mannheim: [8.5, 49.5],
  Turin: [7.7, 45.1],
  Rawalpindi: [73.1, 33.6],
  "Tsim Sha Tsui": [114.2, 22.3],
};

const W = 600;
const H = 300;
const LON0 = -10;
const LON1 = 130;
const LAT0 = 62;
const LAT1 = 8;

const project = ([lon, lat]: [number, number]) => [
  ((lon - LON0) / (LON1 - LON0)) * W,
  ((LAT0 - lat) / (LAT0 - LAT1)) * H,
] as const;

/** Abstract map of the four offices connected as one distributed team. */
export function OfficeNetwork({ className }: { className?: string }) {
  const points = siteConfig.offices.map((o) => ({ ...o, xy: project(coords[o.city] ?? [0, 0]) }));
  const hub = points.find((p) => p.city === "Rawalpindi")!.xy;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      role="img"
      aria-label={`Outscalers offices in ${siteConfig.offices.map((o) => `${o.city}, ${o.country}`).join("; ")}, working as one distributed team`}
      className={cn("h-auto w-full", className)}
    >
      <g className="fill-line-strong">
        {Array.from({ length: 14 }, (_, r) =>
          Array.from({ length: 30 }, (_, c) => <circle key={`${r}-${c}`} cx={10 + c * 20} cy={10 + r * 21} r={1.1} />),
        )}
      </g>
      {points.map((p) =>
        p.xy === hub ? null : (
          <path
            key={p.city}
            d={`M${hub[0]} ${hub[1]}Q${(hub[0] + p.xy[0]) / 2} ${Math.min(hub[1], p.xy[1]) - 60} ${p.xy[0]} ${p.xy[1]}`}
            className="flow-dash fill-none stroke-brand-400/70"
            strokeWidth={1.4}
          />
        ),
      )}
      {points.map((p) => {
        const [x, y] = p.xy;
        const labelLeft = x > W - 140;
        return (
          <g key={p.city}>
            <circle cx={x} cy={y} r={14} className="animate-pulse-soft fill-brand-400/15" />
            <circle cx={x} cy={y} r={5} className="fill-brand-400 stroke-ink-900" strokeWidth={2} />
            <text
              x={labelLeft ? x - 14 : x + 14}
              y={p.city === "Turin" ? y + 16 : y - 8}
              textAnchor={labelLeft ? "end" : "start"}
              className="fill-fg font-sans"
              fontSize={13}
              fontWeight={600}
            >
              {p.country}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
