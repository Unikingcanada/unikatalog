/**
 * TTCProductCard — Product card with selectable widths + dimension table
 */
import { useState } from "react";
import { MATERIALS, WIDTH_DIMENSIONS } from "@/lib/tableTopChainData";

const C = {
  navy: "#0C2340", navyMid: "#1A3A5C", gold: "#C9A84C",
  border: "#e2e8f0", muted: "#64748b", bg: "#f8fafc", text: "#0f172a",
  plastic: "#0057A8", steel: "#374151",
};

const TYPE_LABELS = {
  STRAIGHT: "Straight Running", SIDEFLEX: "Sideflexing", HEAVY: "Heavy Duty",
  LBP: "Low Back Pressure", HIGH_FRICTION: "High Friction", CASE: "Case Conveyor",
  MICRO: "Micro Pitch", FLUSH_GRID: "Flush Grid / Open",
};

const PITCH_COLORS = {
  '1.0" (25.4 mm)': "#4f46e5",
  '1.5" (38.1 mm)': "#0891b2",
  '0.43"–1.0" (11–25 mm)': "#7c3aed",
};

function WidthDimTable({ width }) {
  const dim = WIDTH_DIMENSIONS[width];
  if (!dim) return null;
  return (
    <div style={{
      marginTop: 8, background: "#f0f7ff", borderRadius: 8, padding: "10px 12px",
      border: "1px solid #bfdbfe", fontSize: 11,
    }}>
      <div style={{ fontWeight: 700, color: C.navyMid, marginBottom: 6, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.5px" }}>
        Dimensions for {width}
      </div>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <tbody>
          {[
            ["Overall Width", dim.overallWidth],
            ["Inside Width", dim.insideWidth],
            ["Plate Height", dim.plateHeight],
            ["Weight", `${dim.weightLbsFt} lbs/ft`],
          ].map(([label, val]) => (
            <tr key={label}>
              <td style={{ padding: "2px 6px 2px 0", color: C.muted, fontWeight: 600 }}>{label}</td>
              <td style={{ padding: "2px 0", color: C.text, fontWeight: 700, textAlign: "right" }}>{val}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function TTCProductCard({ product, onViewDetails, onAddRFQ }) {
  const [imgError, setImgError] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [selectedWidth, setSelectedWidth] = useState(null);

  const isSteelCat = product.category === "STEEL";
  const accentColor = isSteelCat ? C.steel : C.plastic;
  const matCount = product.materials.length;

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: "#fff", borderRadius: 12,
        border: `1.5px solid ${hovered ? accentColor : C.border}`,
        boxShadow: hovered ? "0 8px 32px rgba(0,0,0,0.10)" : "0 2px 8px rgba(0,0,0,0.04)",
        transition: "all 0.18s ease", display: "flex", flexDirection: "column",
        overflow: "hidden", cursor: "pointer",
      }}
    >
      {/* Image */}
      <div onClick={() => onViewDetails(product)} style={{
        background: C.bg, height: 140, display: "flex", alignItems: "center",
        justifyContent: "center", position: "relative", overflow: "hidden",
        borderBottom: `1px solid ${C.border}`,
      }}>
        {!imgError ? (
          <img src={product.image} alt={product.name} onError={() => setImgError(true)}
            style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.25s ease", transform: hovered ? "scale(1.04)" : "scale(1)" }} />
        ) : (
          <div style={{ textAlign: "center", color: C.muted }}>
            <div style={{ fontSize: 36, marginBottom: 6 }}>⛓️</div>
            <div style={{ fontSize: 11 }}>{product.series}</div>
          </div>
        )}
        <div style={{ position: "absolute", top: 8, left: 8, display: "flex", flexDirection: "column", gap: 4 }}>
          <span style={{ background: accentColor, color: "#fff", fontSize: 9, fontWeight: 800, padding: "2px 7px", borderRadius: 4 }}>
            {isSteelCat ? "STEEL" : "PLASTIC"}
          </span>
          <span style={{ background: "rgba(255,255,255,0.92)", color: accentColor, fontSize: 9, fontWeight: 700, padding: "2px 7px", borderRadius: 4, border: `1px solid ${accentColor}` }}>
            {TYPE_LABELS[product.type] || product.type}
          </span>
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: "12px 14px", flex: 1, display: "flex", flexDirection: "column", gap: 7 }}>
        {/* Title + pitch */}
        <div onClick={() => onViewDetails(product)}>
          <div style={{ fontSize: 14, fontWeight: 800, color: C.navyMid, marginBottom: 2 }}>{product.name}</div>
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            <span style={{ fontSize: 9, fontWeight: 700, color: PITCH_COLORS[product.pitch] || C.muted, background: "#f0f4ff", padding: "2px 7px", borderRadius: 10 }}>
              {product.pitch}
            </span>
            <span style={{ fontSize: 9, color: C.muted }}>Backflex: {product.backflexRadius}</span>
          </div>
        </div>

        {/* Description */}
        <p onClick={() => onViewDetails(product)} style={{ fontSize: 11, color: C.muted, lineHeight: 1.5, margin: 0, flex: 1 }}>
          {product.description}
        </p>

        {/* Applications */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
          {product.applications.slice(0, 3).map((app, i) => (
            <span key={i} style={{ fontSize: 9, color: C.navyMid, background: "#eef3f8", padding: "2px 7px", borderRadius: 10, fontWeight: 600 }}>{app}</span>
          ))}
          {product.applications.length > 3 && (
            <span style={{ fontSize: 9, color: C.muted, padding: "2px 4px" }}>+{product.applications.length - 3}</span>
          )}
        </div>

        {/* Materials count */}
        <div style={{
          background: "#f8fafc", borderRadius: 6, padding: "5px 10px",
          display: "flex", justifyContent: "space-between", alignItems: "center",
          border: `1px solid ${C.border}`,
        }}>
          <span style={{ fontSize: 10, color: C.muted, fontWeight: 600 }}>Available materials</span>
          <span style={{ fontSize: 12, fontWeight: 800, color: accentColor, background: `${accentColor}15`, padding: "1px 8px", borderRadius: 8 }}>{matCount}</span>
        </div>

        {/* Selectable Widths */}
        {product.widths?.length > 0 && (
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, color: C.navyMid, marginBottom: 5 }}>Select Width:</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
              {product.widths.map((w) => {
                const isSelected = selectedWidth === w;
                return (
                  <button
                    key={w}
                    onClick={(e) => { e.stopPropagation(); setSelectedWidth(isSelected ? null : w); }}
                    style={{
                      fontSize: 10, fontWeight: 700, padding: "3px 9px", borderRadius: 7,
                      border: `1.5px solid ${isSelected ? accentColor : C.border}`,
                      background: isSelected ? accentColor : "#fff",
                      color: isSelected ? "#fff" : C.text,
                      cursor: "pointer", transition: "all 0.12s",
                    }}
                  >
                    {w}
                  </button>
                );
              })}
            </div>
            {selectedWidth && <WidthDimTable width={selectedWidth} />}
          </div>
        )}

        {/* Action buttons */}
        <div style={{ display: "flex", gap: 6, marginTop: 4 }}>
          <button onClick={() => onViewDetails(product)} style={{
            flex: 2, padding: "9px", background: C.navyMid, color: "#fff",
            border: "none", borderRadius: 8, cursor: "pointer", fontSize: 12, fontWeight: 700,
          }}>
            View Details
          </button>
          <button onClick={(e) => { e.stopPropagation(); onAddRFQ(product, selectedWidth); }} style={{
            flex: 1, padding: "9px", background: "#fff", color: C.gold,
            border: `1.5px solid ${C.gold}`, borderRadius: 8, cursor: "pointer",
            fontSize: 11, fontWeight: 700,
          }}>
            + RFQ
          </button>
        </div>
      </div>
    </div>
  );
}