import { ImageResponse } from "next/og";

export const alt = "Outscalers: Build software faster. Build it smarter. AI-Accelerated, Human-Led.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background: "radial-gradient(circle at 80% 0%, #993f00 0%, #080d15 55%)",
          color: "#eaf0f6",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 32, fontWeight: 700 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, border: "2px solid #ff700e", display: "flex" }} />
          Outscalers
          <span style={{ marginLeft: 12, fontSize: 18, letterSpacing: 3, color: "#ff9c57", textTransform: "uppercase" }}>
            AI-Accelerated. Human-Led.
          </span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", fontSize: 76, fontWeight: 700, lineHeight: 1.05 }}>
          <span>Build software faster.</span>
          <span style={{ color: "#ff9c57" }}>Build it smarter.</span>
        </div>
        <div style={{ display: "flex", fontSize: 26, color: "#a3afbf" }}>
          100+ in-house engineers · Software · AI · Automation · Cloud · Security
        </div>
      </div>
    ),
    size,
  );
}
