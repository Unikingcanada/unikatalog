import { useState } from "react";
import { MATERIALS } from "@/lib/tableTopChainData";

const C = {
  navy: "#0C2340", navyMid: "#1A3A5C", muted: "#64748b", border: "#e2e8f0", bg: "#f8fafc", text: "#0f172a",
};

export default function ChainProductCard({ product, onViewDetails, onAddRFQ }) {
  const [hov, setHov] = useState(false);
  const [imgErr, setImgErr] = useState(false);

  const isPlas = product.chainType === "Plastic";
  const accentColor = isPlas ? "#0057A8" : "#374151";
  const materialList = (product.materials || []).map(m => MATERIALS[m]).filter(Boolean);

  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: "#fff", borderRadius: 14,
        border: `2px solid ${hov ? accentColor : C.border}`,
        overflow: "hidden", transition: "all 0.17s",
        boxShadow: hov ? `0 10px 30px ${isPlas ? "rgba(0,87,168,0.12)" : "rgba(55,65,81,0.12)"}` : "0 1px 4px rgba(0,0,0,0.05)",
        transform: hov ? "translateY(-3px)" : "none",
        display: "flex", flexDirection: "column",
      }}
    >
      {/* Image */}
      <div style={{ height: 150, background: "#f1f5f9", overflow: "hidden", position: "relative", flexShrink: 0 }}>
        {!imgErr ? (
          <img
            src={product.image}
            alt={product.series}
            style={{ width: "100%", height: "100%", objectFit: "cover", transform: hov ? "scale(1.04)" : "scale(1)", transition: "transform 0.3s" }}
            onError={() => setImgErr(true)}
          />
        ) : (
          <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 6 }}>
            <div style={{ fontSize: 30, opacity: 0.2 }}>{isPlas ? "🔵" : "⚙️"}</div>
            <div style={{ fontSize: 10, color: C.muted }}>Image pending</div>
          </div>
        )}
        {/* Chain type badge */}
        <div style={{ position: "absolute", top: 8, left: 8, background: accentColor, borderRadius: 5, padding: "2px 8px" }}>
          <span style={{ fontSize: 9, fontWeight: 800, color: "#fff", letterSpacing: "0.5px" }}>{product.chainType.toUpperCase()}</span>
        </div>
        {/* Pitch badge */}
        <div style={{ position: "absolute", bottom: 8, right: 8, background: "rgba(0,0,0,0.55)", borderRadius: 6, padding: "2px 8px" }}>
          <span style={{ fontSize: 9, color: "#fff", fontWeight: 700 }}>{product.pitch_in} Pitch</span>
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: "12px 14px", flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
        <div style={{ fontSize: 14, fontWeight: 900, color: C.navy }}>{product.series}</div>
        <p style={{ fontSize: 11, color: C.muted, lineHeight: 1.5, margin: 0, flex: 1 }}>{product.shortDesc}</p>

        {/* Material chips */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 3, marginTop: 2 }}>
          {materialList.slice(0, 3).map(m => (
            <span key={m.id} style={{ fontSize: 8, background: m.badge, color: m.badgeText, padding: "2px 6px", borderRadius: 6, fontWeight: 700 }}>
              {m.shortName}
            </span>
          ))}
          {materialList.length > 3 && (
            <span style={{ fontSize: 8, background: "#f1f5f9", color: C.muted, padding: "2px 6px", borderRadius: 6 }}>+{materialList.length - 3} more</span>
          )}
        </div>

        {/* Applications */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
          {(product.applications || []).slice(0, 2).map(a => (
            <span key={a} style={{ fontSize: 8, background: "#f8fafc", color: C.muted, padding: "1px 5px", borderRadius: 5 }}>{a}</span>
          ))}
        </div>

        {/* Actions */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 7, marginTop: 4 }}>
          <button
            onClick={() => onViewDetails(product)}
            style={{ padding: "8px", background: "#f1f5f9", border: "none", borderRadius: 7, cursor: "pointer", fontSize: 11, fontWeight: 700, color: C.navyMid }}
          >
            View Details
          </button>
          <button
            onClick={() => onAddRFQ(product, null)}
            style={{ padding: "8px", background: accentColor, border: "none", borderRadius: 7, cursor: "pointer", fontSize: 11, fontWeight: 800, color: "#fff" }}
          >
            + RFQ
          </button>
        </div>
      </div>
    </div>
  );
}