import { useState } from "react";
import { IMG_STYLE_COUNTS } from "@/lib/intraloxData";

const C = {
  navy: "#0F2340", navyMid: "#1A3A5C", navyLight: "#2A5080",
  gold: "#C9A84C", border: "#e2e8f0", muted: "#64748b", bg: "#f8fafc", text: "#0f172a",
};
const INTRALOX_RED = "#E31837";

const BELT_TYPE_COLORS = {
  "Straight-Running": { bg: "#e0f2fe", color: "#0369a1" },
  "Radius":           { bg: "#fce7f3", color: "#be185d" },
  "Spiral":           { bg: "#ede9fe", color: "#7c3aed" },
  "Side-Flexing":     { bg: "#fef9c3", color: "#92400e" },
  "Belt Support Tool":{ bg: "#d1fae5", color: "#065f46" },
};

export default function IntraloxSeriesCard({ series, onViewSeries }) {
  const [hov, setHov] = useState(false);
  const typeCfg = BELT_TYPE_COLORS[series.beltType] || { bg: "#f1f5f9", color: "#334155" };

  const pitchLabel = series.pitch_in && series.pitch_in !== "To be confirmed by Uniking"
    ? `${series.pitch_in}" pitch`
    : null;

  // Accurate style count from Belt Finder data
  const styleCount = IMG_STYLE_COUNTS?.[series.id] || series.styles?.length || null;

  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: "#fff",
        borderRadius: 14,
        border: `2px solid ${hov ? C.navyMid : C.border}`,
        overflow: "hidden",
        transition: "all 0.18s",
        boxShadow: hov ? "0 10px 30px rgba(15,35,64,0.12)" : "0 1px 4px rgba(0,0,0,0.05)",
        transform: hov ? "translateY(-3px)" : "none",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Image */}
      <div style={{ height: 155, overflow: "hidden", position: "relative", background: "#f0f4f8" }}>
        {series.image ? (
          <img src={series.image} alt={series.name}
            style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.3s", transform: hov ? "scale(1.04)" : "scale(1)" }}
            onError={e => e.target.style.display = "none"}
          />
        ) : (
          <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 8 }}>
            <div style={{ fontSize: 32, opacity: 0.2 }}>⬜</div>
            <div style={{ fontSize: 10, color: C.muted, textAlign: "center", padding: "0 12px" }}>Image to be added by Uniking</div>
          </div>
        )}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(15,35,64,0.65) 0%, transparent 55%)" }} />

        {/* Tags over image */}
        <div style={{ position: "absolute", top: 10, left: 12, display: "flex", gap: 6 }}>
          <span style={{ fontSize: 9, fontWeight: 800, padding: "3px 7px", borderRadius: 10, background: typeCfg.bg, color: typeCfg.color }}>
            {series.beltType}
          </span>
          {pitchLabel && (
            <span style={{ fontSize: 9, fontWeight: 700, padding: "3px 7px", borderRadius: 10, background: "rgba(255,255,255,0.9)", color: C.navyMid }}>
              {pitchLabel}
            </span>
          )}
        </div>

        {/* Intralox badge + series name + style count at bottom */}
        <div style={{ position: "absolute", bottom: 10, left: 12, right: 12, display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
          <div>
            <div style={{ color: "#fff", fontSize: 16, fontWeight: 900, lineHeight: 1.2, textShadow: "0 1px 4px rgba(0,0,0,0.5)" }}>{series.name}</div>
            {styleCount && (
              <div style={{ color: "rgba(255,255,255,0.85)", fontSize: 10, fontWeight: 600, marginTop: 2 }}>{styleCount} Style{styleCount !== 1 ? "s" : ""}</div>
            )}
          </div>
          <div style={{ background: INTRALOX_RED, borderRadius: 4, padding: "2px 6px", flexShrink: 0 }}>
            <span style={{ fontSize: 8, fontWeight: 800, color: "#fff", letterSpacing: "0.5px" }}>INTRALOX</span>
          </div>
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: "12px 14px", flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
        {/* Catalog page ref + style count */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          {series.catalogPage && (
            <div style={{ fontSize: 10, color: C.muted }}>📄 2026 Catalog p.{series.catalogPage}</div>
          )}
          {styleCount && (
            <div style={{ fontSize: 10, fontWeight: 700, color: C.navyMid, background: "#eef3f8", padding: "2px 8px", borderRadius: 10 }}>
              {styleCount} Style{styleCount !== 1 ? "s" : ""}
            </div>
          )}
        </div>

        {/* Description */}
        <p style={{ fontSize: 12, color: C.muted, lineHeight: 1.6, margin: 0 }}>
          {series.description?.slice(0, 110)}{series.description?.length > 110 ? "…" : ""}
        </p>

        {/* Applications */}
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: 4 }}>Applications</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
            {(series.applications || []).slice(0, 3).map(a => (
              <span key={a} style={{ background: "#eef3f8", color: C.navyMid, fontSize: 10, fontWeight: 600, padding: "2px 7px", borderRadius: 10 }}>{a}</span>
            ))}
            {(series.applications || []).length > 3 && (
              <span style={{ background: "#f1f5f9", color: C.muted, fontSize: 10, padding: "2px 7px", borderRadius: 10 }}>+{series.applications.length - 3} more</span>
            )}
          </div>
        </div>

        {/* Key advantages */}
        {series.advantages && series.advantages.length > 0 && (
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: 4 }}>Key Advantages</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
              {series.advantages.slice(0, 2).map(a => (
                <span key={a} style={{ background: "#f0fdf4", color: "#16a34a", fontSize: 10, fontWeight: 600, padding: "2px 7px", borderRadius: 10 }}>✓ {a.slice(0, 40)}{a.length > 40 ? "…" : ""}</span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div style={{ padding: "10px 14px", borderTop: `1px solid ${C.border}` }}>
        <button onClick={() => onViewSeries(series)}
          style={{ width: "100%", padding: "9px", background: C.navyMid, color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontSize: 12, fontWeight: 700 }}>
          View Series →
        </button>
      </div>
    </div>
  );
}