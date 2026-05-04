import { useState } from "react";

const C = {
  navy: "#0C2340", navyMid: "#1A3A5C", gold: "#C9A84C",
  border: "#e2e8f0", muted: "#64748b", bg: "#f8fafc",
};
const MOVEX_RED = "#E63946";

const BELT_TYPE_THEMES = {
  "Straight-Running": { bg: "#eef3f8", color: "#1A3A5C", label: "Straight-Running" },
  "Sideflexing":      { bg: "#fdf4e3", color: "#92400e", label: "Sideflexing" },
  "Straight-Running / Special": { bg: "#f0fdf4", color: "#166534", label: "Special" },
};

function PitchBadge({ series }) {
  const p = series.pitch_in;
  if (!p || p === "To be confirmed by Uniking") return null;
  return (
    <span style={{ background: "rgba(201,168,76,0.15)", color: C.gold, padding: "3px 8px", borderRadius: 10, fontSize: 10, fontWeight: 700 }}>
      Pitch: {p}" ({series.pitch_mm} mm)
    </span>
  );
}

export default function MovexSeriesCard({ series, onViewSeries }) {
  const [hov, setHov] = useState(false);
  const theme = BELT_TYPE_THEMES[series.beltType] || BELT_TYPE_THEMES["Straight-Running"];
  const styleCount = series.styles?.length || 0;

  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      onClick={() => onViewSeries(series)}
      style={{
        background: "#fff", borderRadius: 14,
        border: `2px solid ${hov ? C.navyMid : C.border}`,
        overflow: "hidden", transition: "all 0.18s",
        boxShadow: hov ? "0 10px 30px rgba(12,35,64,0.13)" : "0 1px 4px rgba(0,0,0,0.05)",
        transform: hov ? "translateY(-3px)" : "none",
        display: "flex", flexDirection: "column",
        cursor: "pointer",
      }}
    >
      {/* Image */}
      <div style={{ height: 150, overflow: "hidden", background: "#f0f4f8", position: "relative", flexShrink: 0 }}>
        {series.image ? (
          <img src={series.image} alt={series.name}
            style={{ width: "100%", height: "100%", objectFit: "cover", transform: hov ? "scale(1.04)" : "scale(1)", transition: "transform 0.3s" }}
            onError={e => { e.target.style.display = "none"; }}
          />
        ) : (
          <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 6, color: C.muted }}>
            <div style={{ fontSize: 30, opacity: 0.3 }}>⚙️</div>
            <div style={{ fontSize: 9, color: C.muted }}>Image pending</div>
          </div>
        )}
        {/* Movex badge */}
        <div style={{ position: "absolute", top: 8, left: 8, background: MOVEX_RED, borderRadius: 4, padding: "2px 7px" }}>
          <span style={{ fontSize: 9, fontWeight: 800, color: "#fff", letterSpacing: "0.5px" }}>MOVEX</span>
        </div>
        {/* Blueline badge */}
        {series.name.includes("Blueline") && (
          <div style={{ position: "absolute", top: 8, right: 8, background: "#1e40af", borderRadius: 4, padding: "2px 7px" }}>
            <span style={{ fontSize: 9, fontWeight: 800, color: "#fff" }}>Blueline®</span>
          </div>
        )}
        {/* Style count */}
        <div style={{ position: "absolute", bottom: 8, right: 8, background: "rgba(0,0,0,0.55)", borderRadius: 6, padding: "2px 8px" }}>
          <span style={{ fontSize: 9, color: "#fff", fontWeight: 700 }}>{styleCount} Style{styleCount !== 1 ? "s" : ""}</span>
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: "12px 14px", flex: 1, display: "flex", flexDirection: "column" }}>
        <div style={{ fontSize: 14, fontWeight: 800, color: C.navy, marginBottom: 6 }}>{series.name}</div>
        <div style={{ display: "flex", gap: 5, marginBottom: 8, flexWrap: "wrap" }}>
          <span style={{ background: theme.bg, color: theme.color, fontSize: 9, fontWeight: 700, padding: "2px 7px", borderRadius: 8, textTransform: "uppercase", letterSpacing: "0.4px" }}>
            {theme.label}
          </span>
          <PitchBadge series={series} />
        </div>
        <p style={{ fontSize: 11, color: C.muted, lineHeight: 1.5, flex: 1, margin: "0 0 10px" }}>
          {series.description?.slice(0, 110)}{series.description?.length > 110 ? "…" : ""}
        </p>
        {/* Application tags */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 10 }}>
          {(series.applications || []).slice(0, 3).map(a => (
            <span key={a} style={{ background: "#f1f5f9", color: C.muted, fontSize: 9, padding: "1px 6px", borderRadius: 6 }}>{a}</span>
          ))}
        </div>
        <button
          onClick={e => { e.stopPropagation(); onViewSeries(series); }}
          style={{
            width: "100%", padding: "9px", background: hov ? C.navyMid : C.navy,
            color: "#fff", border: "none", borderRadius: 8, cursor: "pointer",
            fontSize: 12, fontWeight: 800, transition: "background 0.15s",
          }}
        >
          View Series →
        </button>
      </div>
    </div>
  );
}