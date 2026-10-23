import { siteConfig } from "@/lib/site";
import { cn } from "@/lib/cn";

type LonLat = [lon: number, lat: number];

// Approximate office coordinates.
const coords: Record<string, LonLat> = {
  Mannheim: [8.5, 49.5],
  Turin: [7.7, 45.1],
  Rawalpindi: [73.1, 33.6],
  "Tsim Sha Tsui": [114.2, 22.3],
};

// Map frame: Europe, Africa (north), the Middle East and Asia, on an equirectangular grid.
const W = 600;
const H = 300;
const LON0 = -20;
const LON1 = 150;
const LAT0 = 72;
const LAT1 = -12;

/** Deliberately rough, hand-simplified landmasses. Only used to decide where map dots go. */
const LAND: LonLat[][] = [
  // Eurasia, traced from Iberia: Atlantic → Arctic → Pacific → South Asia → Arabia → Mediterranean
  [
    [-10, 36], [-9, 43], [-2, 43.5], [-4.5, 48.5], [2, 51], [8, 54], [12, 54.5], [20, 54.5], [22, 59], [28, 60],
    [30, 62], [33, 66], [42, 67], [55, 68.5], [68, 72], [80, 73], [100, 77], [115, 73], [130, 71], [150, 71],
    [150, 60], [140, 59], [135, 54], [141, 48], [133, 43], [129, 35], [126, 37.5], [121, 40], [119, 37], [122, 30],
    [117, 23.5], [109, 21], [106, 18], [109, 12], [105, 8.6], [100, 13.5], [100, 9], [104, 1.5], [100, 3.5], [98, 9],
    [97.5, 16.5], [94, 18.5], [91, 22.5], [87, 21], [80, 15.5], [77.5, 8], [73, 17], [69, 22.5], [66.5, 25.5],
    [57, 25.5], [56, 27], [50, 30], [48, 29.5], [51, 24.5], [56, 26.3], [59.5, 22.5], [57, 18.5], [52, 16],
    [45, 12.8], [43, 13], [39, 22], [35, 28], [34, 29.5], [32.3, 31.2], [35.5, 33.5], [36, 36.5], [30, 36.5],
    [26.5, 40], [23, 37], [19.5, 40], [18.5, 40], [16, 38], [15.5, 40], [12, 41.5], [10, 44], [7, 43.7],
    [3, 43.3], [3, 42], [0, 39], [-0.7, 37.6], [-2, 36.7], [-5.5, 36],
  ],
  // Scandinavia
  [
    [5, 58], [5, 62], [10, 64], [14, 67], [18, 69.5], [25, 71], [30, 70], [29, 66], [25, 65.5], [21, 64],
    [17.5, 62], [19, 60], [17, 57], [13, 56], [11, 58.5], [8, 58],
  ],
  // Great Britain and Ireland
  [
    [-5.5, 50], [1.5, 51], [1.7, 52.8], [-0.5, 54], [-1.5, 55.5], [-2, 57.5], [-4, 58.7], [-6, 58], [-5.5, 56],
    [-4.5, 54.5], [-3, 53.5], [-4.5, 52],
  ],
  [[-10, 51.5], [-6, 52], [-6, 54], [-8, 55.3], [-10, 54]],
  // Africa (north of the frame edge)
  [
    [-6, 35.8], [-10, 30], [-13, 27.5], [-17, 21], [-17, 14.5], [-15, 11], [-12, 7.5], [-8, 4.5], [-3, 5],
    [2, 6.2], [6, 4.3], [9, 4], [9.5, 1], [9, -2], [12, -5], [13, -12], [40, -12], [40, -10], [39.5, -5], [42, -1],
    [46, 2], [51, 11.5], [44, 10.5], [43, 12], [39, 15.5], [37, 19], [35.5, 24], [33, 28], [32.3, 31.2], [29, 30.9],
    [25, 31.8], [20, 30.8], [15, 32.3], [11, 33.3], [10, 37], [3, 36.8], [-2, 35.1],
  ],
  // Sri Lanka, Japan, Taiwan, Philippines
  [[79.8, 6], [81.8, 7.2], [81, 9.6], [80, 9.7]],
  [
    [130, 31], [131.5, 31.5], [132, 33.8], [135, 33.5], [136.8, 34.5], [140, 35.2], [141, 38], [142, 40],
    [141.5, 41.5], [140, 40], [139.5, 38], [137, 37], [136, 35.7], [133, 35.5], [130.8, 34.2],
  ],
  [[140, 41.5], [141.7, 42.5], [145.5, 43.3], [144, 44.2], [141.8, 45.5], [141, 43.2]],
  [[120.1, 23], [121, 22], [122, 25], [121.5, 25.3]],
  [[120, 18.5], [122.5, 18.5], [122, 14], [124, 12.5], [126, 9], [126, 6.5], [123, 7], [122, 10.5], [120.5, 14]],
  // Indonesia and New Guinea
  [[109, 1.5], [111, 2.5], [113.5, 4], [116, 7], [119, 5], [117.5, 1], [116.5, -3.5], [114.5, -4], [110.5, -3], [109, -0.5]],
  [[95.3, 5.6], [97.5, 5.2], [100, 2], [104, -1.5], [106, -5.8], [104, -5.8], [101, -3], [98.5, 0], [96, 3]],
  [[105.2, -6.8], [106, -6], [111, -6.4], [114.5, -7.6], [114, -8.6], [110, -8.2], [106.5, -7.4]],
  [[119.5, -5.5], [120.5, -1], [121, 1], [125, 1.5], [123, 0.5], [122, -1], [123, -4.5], [121, -3.5]],
  [
    [131, -1], [135, -3.5], [138, -1.5], [141, -2.6], [146, -5], [147.5, -6.5], [150, -10.5], [147, -10],
    [143.5, -9], [141, -9.2], [138, -8.4], [137.5, -5], [133, -4], [132, -2.5],
  ],
];

const project = ([lon, lat]: LonLat) =>
  [((lon - LON0) / (LON1 - LON0)) * W, ((LAT0 - lat) / (LAT0 - LAT1)) * H] as const;

function inPolygon([x, y]: LonLat, poly: LonLat[]) {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i];
    const [xj, yj] = poly[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

// Land dots on a regular grid, computed once at module load (server-side only).
const STEP = 8;
const LAND_DOTS: [number, number][] = [];
for (let py = STEP / 2; py < H; py += STEP) {
  for (let px = STEP / 2; px < W; px += STEP) {
    const lonlat: LonLat = [LON0 + (px / W) * (LON1 - LON0), LAT0 - (py / H) * (LAT0 - LAT1)];
    if (LAND.some((poly) => inPolygon(lonlat, poly))) LAND_DOTS.push([px, py]);
  }
}

/** Dotted map of the four offices, connected as one distributed team. */
export function OfficeNetwork({ className }: { className?: string }) {
  const points = siteConfig.offices.map((o) => ({ ...o, xy: project(coords[o.city] ?? [0, 0]) }));
  const hub = points.find((p) => p.city === "Rawalpindi")!.xy;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      role="img"
      aria-label={`Map of Outscalers offices in ${siteConfig.offices.map((o) => `${o.city}, ${o.country}`).join("; ")}, working as one distributed team`}
      className={cn("h-auto w-full", className)}
    >
      <g className="fill-fg-subtle/45">
        {LAND_DOTS.map(([x, y]) => (
          <circle key={`${x}-${y}`} cx={x} cy={y} r={1.5} />
        ))}
      </g>
      {points.map((p) =>
        p.xy === hub ? null : (
          <path
            key={p.city}
            d={`M${hub[0]} ${hub[1]}Q${(hub[0] + p.xy[0]) / 2} ${Math.min(hub[1], p.xy[1]) - 60} ${p.xy[0]} ${p.xy[1]}`}
            className="flow-dash fill-none stroke-brand-400/80"
            strokeWidth={1.4}
          />
        ),
      )}
      {points.map((p) => {
        const [x, y] = p.xy;
        const labelLeft = x > W - 140;
        return (
          <g key={p.city}>
            <circle cx={x} cy={y} r={14} className="animate-pulse-soft fill-brand-400/20" />
            <circle cx={x} cy={y} r={5} className="fill-brand-400 stroke-ink-900" strokeWidth={2} />
            <text
              x={labelLeft ? x - 14 : x + 14}
              y={p.city === "Turin" ? y + 16 : y - 8}
              textAnchor={labelLeft ? "end" : "start"}
              className="fill-fg font-sans stroke-ink-850"
              fontSize={13}
              fontWeight={600}
              strokeWidth={4}
              paintOrder="stroke"
            >
              {p.country}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
