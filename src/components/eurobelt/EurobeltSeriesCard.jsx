/**
 * EurobeltSeriesCard — Product card for a Eurobelt belt series.
 */
import { useState } from "react";

const C = {
  navy: "#0E1F3A", navyMid: "#0E1F3A", border: "#D9D6CE",
  muted: "#3A4A66", bg: "#F4F2ED", text: "#0E1F3A",
};
const EUROBELT_BLUE = "#0066B3";

export default function EurobeltSeriesCard({ series, onViewSeries }) {
  const [hov, setHov] = useState(false);
  const styleCount = series.styles?.length || 0;

  return (
    <div onClick={() => onViewSeries(series)}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        background: "#fff", borderRadius: 12, border: `2px solid ${hov ? EUROBELT_BLUE : C.border}`,
        overflow: "hidden", cursor: "pointer", transition: "all 0.16s",
        boxShadow: hov ? "0 6px 20px rgba(14,31,58,0.1)" : "0 1px 4px rgba(0,0,0,0.05)",
        transform: hov ? "translateY(-2px)" : "none",
      }}>
      <div style={{ height: 130, overflow: "hidden", background: "#F4F2ED", position: "relative" }}>
        {series.image ? (
          <img src={series.image} alt={series.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={e => { e.target.style.display = "none"; }} />
        ) : (
          <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: C.muted, fontSize: 24 }}>🔗</div>
        )}
        <div style={{ position: "absolute", top: 6, left: 6, background: EUROBELT_BLUE, color: "#fff", fontSize: 9, fontWeight: 800, padding: "2px 7px", borderRadius: 5 }}>
          {series.beltType.includes("Sideflexing") ? "Sideflexing" : "Straight"}
        </div>
      </div>
      <div style={{ padding: "12px 14px" }}>
        <div style={{ fontSize: 14, fontWeight: 800, color: C.navyMid, marginBottom: 4 }}>{series.name}</div>
        <div style={{ fontSize: 11, color: C.muted, marginBottom: 8, lineHeight: 1.5 }}>
          {series.description?.slice(0, 85)}{series.description?.length > 85 ? "…" : ""}
        </div>
        <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 8 }}>
          <span style={{ background: "#F4F2ED", color: C.navyMid, fontSize: 9, fontWeight: 700, padding: "2px 7px", borderRadius: 7 }}>
            {series.pitch_mm} mm ({series.pitch_in}")
          </span>
          <span style={{ background: "#ECEAE4", color: C.muted, fontSize: 9, fontWeight: 600, padding: "2px 7px", borderRadius: 7 }}>
            {styleCount} model{styleCount !== 1 ? "s" : ""}
          </span>
        </div>
        <div style={{ fontSize: 11, fontWeight: 700, color: EUROBELT_BLUE, display: "flex", alignItems: "center", gap: 4 }}>
          View Series →
        </div>
      </div>
    </div>
  );
}