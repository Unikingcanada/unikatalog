import { useState } from "react";

const C = {
  navy: "#0F2340", navyMid: "#1A3A5C", gold: "#C9A84C",
  border: "#e2e8f0", muted: "#64748b", bg: "#f8fafc", green: "#16a34a"
};

const INTRALOX_RED = "#E31837";

export default function IntraloxSeriesCard({ series, onViewSeries, onConfigure }) {
  const [hov, setHov] = useState(false);

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
        boxShadow: hov ? "0 10px 30px rgba(15,35,64,0.12)" : "0 1px 4px rgba(0,0,0,0.06)",
        transform: hov ? "translateY(-3px)" : "none",
        display: "flex", flexDirection: "column"
      }}>

      {/* Image */}
      <div style={{ height: 160, overflow: "hidden", position: "relative", background: "#f0f4f8" }}>
        <img src={series.image} alt={series.name}
          style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.3s", transform: hov ? "scale(1.04)" : "scale(1)" }}
          onError={e => e.target.style.display = "none"} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(15,35,64,0.75) 0%, transparent 55%)" }} />

        {/* Intralox logo badge */}
        <div style={{ position: "absolute", top: 10, right: 10, background: "#fff", borderRadius: 6, padding: "3px 8px", display: "flex", alignItems: "center", gap: 4 }}>
          <div style={{ width: 8, height: 8, background: INTRALOX_RED, borderRadius: "50%" }} />
          <span style={{ fontSize: 9, fontWeight: 800, color: INTRALOX_RED, letterSpacing: "0.5px" }}>INTRALOX</span>
        </div>

        <div style={{ position: "absolute", bottom: 10, left: 14 }}>
          <div style={{ color: "#fff", fontSize: 17, fontWeight: 900, lineHeight: 1.2 }}>{series.name}</div>
          <div style={{ color: "rgba(255,255,255,0.75)", fontSize: 11, marginTop: 2 }}>
            Pitch: {series.pitch_in}" ({series.pitch_mm} mm) · {series.styleCount}+ Styles
          </div>
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: "12px 14px", flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
        <p style={{ fontSize: 12, color: C.muted, lineHeight: 1.6, margin: 0 }}>{series.description}</p>

        <div>
          <div style={{ fontSize: 10, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: 4 }}>Applications</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
            {series.applications.slice(0, 3).map(a => (
              <span key={a} style={{ background: "#eef3f8", color: C.navyMid, fontSize: 10, fontWeight: 600, padding: "2px 7px", borderRadius: 10 }}>{a}</span>
            ))}
            {series.applications.length > 3 && (
              <span style={{ background: "#f1f5f9", color: C.muted, fontSize: 10, padding: "2px 7px", borderRadius: 10 }}>+{series.applications.length - 3}</span>
            )}
          </div>
        </div>

        <div>
          <div style={{ fontSize: 10, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: 4 }}>Key Advantages</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
            {series.advantages.slice(0, 2).map(a => (
              <span key={a} style={{ background: "#f0fdf4", color: C.green, fontSize: 10, fontWeight: 600, padding: "2px 7px", borderRadius: 10 }}>✓ {a.slice(0, 35)}{a.length > 35 ? "…" : ""}</span>
            ))}
          </div>
        </div>

        {/* Pitch badge */}
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <span style={{ background: "#0F2340", color: C.gold, fontSize: 10, fontWeight: 800, padding: "3px 8px", borderRadius: 6 }}>
            {series.pitch_in}" Pitch
          </span>
          <span style={{ fontSize: 10, color: C.muted }}>Min width: {series.min_width_in}"</span>
          <span style={{ fontSize: 10, color: C.muted }}>Incr: {series.width_increment_in}"</span>
        </div>
      </div>

      {/* Actions */}
      <div style={{ padding: "10px 14px", borderTop: "1px solid " + C.border, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        <button onClick={() => onViewSeries(series)}
          style={{ padding: "8px", background: "#f1f5f9", color: C.navyMid, border: "none", borderRadius: 8, cursor: "pointer", fontSize: 12, fontWeight: 700 }}>
          View Series
        </button>
        <button onClick={() => onConfigure(series)}
          style={{ padding: "8px", background: C.navyMid, color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontSize: 12, fontWeight: 800 }}>
          Configure →
        </button>
      </div>
    </div>
  );
}