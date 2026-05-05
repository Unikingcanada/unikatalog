import { useState } from "react";
import { MATERIALS } from "@/lib/tableTopChainData";

const C = {
  navy: "#0C2340", navyMid: "#1A3A5C", gold: "#C9A84C",
  border: "#e2e8f0", muted: "#64748b", bg: "#f8fafc", text: "#0f172a",
};

const FRICTION_BAR = { "Low": 1, "Low-Medium": 2, "Medium": 3, "High": 5 };
const WEAR_BAR     = { "Good": 2, "Very Good": 3, "Excellent — longer than acetal": 5, "Excellent": 4, "Very Good": 3, "Fair (requires lubrication)": 1, "Superior (molybdenum)": 4 };

function RatingBar({ value, max = 5, color }) {
  const filled = FRICTION_BAR[value] || WEAR_BAR[value] || 3;
  return (
    <div style={{ display: "flex", gap: 2, alignItems: "center" }}>
      {Array.from({ length: max }).map((_, i) => (
        <div key={i} style={{ width: 12, height: 5, borderRadius: 2, background: i < filled ? color : "#e2e8f0" }} />
      ))}
    </div>
  );
}

function MaterialRow({ mat, product, onAddRFQ, selected, onSelect }) {
  const isPlas = product.chainType === "Plastic";
  const accentColor = isPlas ? "#0057A8" : "#374151";

  return (
    <tr
      onClick={() => onSelect(mat.id)}
      style={{ background: selected ? "#eef3f8" : "white", cursor: "pointer", transition: "background 0.12s" }}
    >
      <td style={{ padding: "10px 12px", borderBottom: `1px solid ${C.border}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          {selected && <span style={{ color: accentColor, fontWeight: 900 }}>✓</span>}
          <div>
            <div style={{ fontSize: 12, fontWeight: 800, color: C.text }}>{mat.name}</div>
            <div style={{ fontSize: 10, color: C.muted, marginTop: 1 }}>{mat.type}</div>
          </div>
        </div>
      </td>
      <td style={{ padding: "10px 12px", borderBottom: `1px solid ${C.border}` }}>
        <span style={{ fontSize: 9, fontWeight: 700, padding: "2px 8px", borderRadius: 8, background: mat.badge, color: mat.badgeText }}>
          {mat.category}
        </span>
      </td>
      <td style={{ padding: "10px 12px", borderBottom: `1px solid ${C.border}` }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
          <div style={{ fontSize: 9, color: C.muted }}>Friction</div>
          <RatingBar value={mat.friction} color="#f59e0b" />
          <div style={{ fontSize: 8, color: C.muted }}>{mat.friction}</div>
        </div>
      </td>
      <td style={{ padding: "10px 12px", borderBottom: `1px solid ${C.border}` }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
          <div style={{ fontSize: 9, color: C.muted }}>Wear Res.</div>
          <RatingBar value={mat.wear} color="#16a34a" />
          <div style={{ fontSize: 8, color: C.muted }}>{mat.wear?.slice(0, 20)}</div>
        </div>
      </td>
      <td style={{ padding: "10px 12px", borderBottom: `1px solid ${C.border}` }}>
        <div style={{ fontSize: 10, color: C.muted }}>{mat.tempRange}</div>
      </td>
      <td style={{ padding: "10px 12px", borderBottom: `1px solid ${C.border}` }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
          {mat.applications.slice(0, 2).map(a => (
            <span key={a} style={{ fontSize: 8, background: "#f1f5f9", color: C.muted, padding: "1px 5px", borderRadius: 5 }}>{a}</span>
          ))}
        </div>
      </td>
      <td style={{ padding: "10px 12px", borderBottom: `1px solid ${C.border}` }}>
        {mat.exclusive ? (
          <span style={{ fontSize: 9, fontWeight: 700, color: "#6d28d9", background: "#ede9fe", padding: "2px 7px", borderRadius: 8 }}>
            {mat.brandNote}
          </span>
        ) : (
          <span style={{ fontSize: 9, color: C.muted }}>{mat.brandNote}</span>
        )}
      </td>
      <td style={{ padding: "10px 12px", borderBottom: `1px solid ${C.border}` }}>
        <button
          onClick={(e) => { e.stopPropagation(); onAddRFQ(product, mat); }}
          style={{
            padding: "5px 11px", background: selected ? accentColor : "#f1f5f9",
            color: selected ? "#fff" : C.navyMid, border: "none", borderRadius: 7,
            cursor: "pointer", fontSize: 10, fontWeight: 800, whiteSpace: "nowrap",
          }}
        >
          + RFQ
        </button>
      </td>
    </tr>
  );
}

export default function ChainProductDetail({ product, onBack, onAddRFQ }) {
  const [selectedMat, setSelectedMat] = useState(null);
  const [imgErr, setImgErr] = useState(false);

  const isPlas = product.chainType === "Plastic";
  const accentColor = isPlas ? "#0057A8" : "#374151";
  const materialList = (product.materials || []).map(m => MATERIALS[m]).filter(Boolean);

  const plastic = materialList.filter(m => m.category === "Plastic");
  const steel   = materialList.filter(m => m.category === "Steel");

  function handleAddRFQSelected() {
    const mat = MATERIALS[selectedMat];
    if (mat) onAddRFQ(product, mat);
  }

  return (
    <div style={{ background: C.bg, minHeight: "100%" }}>
      {/* Header */}
      <div style={{ background: `linear-gradient(135deg, ${C.navy}, ${accentColor})`, padding: "22px 28px" }}>
        <button onClick={onBack} style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", color: "#fff", borderRadius: 7, padding: "5px 12px", cursor: "pointer", fontSize: 12, marginBottom: 14 }}>
          ← Back to Catalog
        </button>
        <div style={{ display: "flex", gap: 20, alignItems: "flex-start", flexWrap: "wrap" }}>
          {/* Product image */}
          <div style={{ width: 140, height: 120, flexShrink: 0, borderRadius: 10, overflow: "hidden", background: "rgba(255,255,255,0.1)", border: "2px solid rgba(255,255,255,0.2)" }}>
            {!imgErr ? (
              <img src={product.image} alt={product.series} style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={() => setImgErr(true)} />
            ) : (
              <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32 }}>{isPlas ? "🔵" : "⚙️"}</div>
            )}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", gap: 8, marginBottom: 6, flexWrap: "wrap" }}>
              <span style={{ background: accentColor, color: "#fff", fontSize: 9, fontWeight: 800, padding: "2px 8px", borderRadius: 5 }}>{product.chainType.toUpperCase()} TABLE TOP CHAIN</span>
              <span style={{ background: "rgba(255,255,255,0.15)", color: "#fff", fontSize: 9, fontWeight: 700, padding: "2px 8px", borderRadius: 5 }}>{product.pitch_in} PITCH · {product.pitch_mm} MM</span>
            </div>
            <h1 style={{ color: "#fff", fontSize: 24, fontWeight: 900, margin: "0 0 6px" }}>{product.series}</h1>
            <p style={{ color: "rgba(255,255,255,0.75)", fontSize: 13, margin: "0 0 12px", maxWidth: 600, lineHeight: 1.65 }}>{product.description}</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {product.features?.map(f => (
                <span key={f} style={{ background: "rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.88)", fontSize: 10, fontWeight: 600, padding: "3px 10px", borderRadius: 14 }}>✓ {f}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div style={{ padding: "20px 28px", maxWidth: 1200, margin: "0 auto" }}>

        {/* Applications */}
        <div style={{ background: "#fff", borderRadius: 12, border: `1px solid ${C.border}`, padding: "16px 20px", marginBottom: 18 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.navyMid, marginBottom: 10 }}>Typical Applications</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
            {product.applications?.map(a => (
              <span key={a} style={{ fontSize: 11, background: "#eef3f8", color: C.navyMid, padding: "4px 12px", borderRadius: 16, fontWeight: 600 }}>{a}</span>
            ))}
          </div>
        </div>

        {/* MATERIAL SELECTION TABLE */}
        <div style={{ background: "#fff", borderRadius: 12, border: `1px solid ${C.border}`, overflow: "hidden", marginBottom: 18 }}>
          <div style={{ background: accentColor, padding: "12px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: 15, fontWeight: 900, color: "#fff" }}>Material Selection</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.75)", marginTop: 2 }}>
                Select the optimal material for your application · Click a row to select, then Add to RFQ
              </div>
            </div>
            {selectedMat && (
              <button onClick={handleAddRFQSelected}
                style={{ background: "#16a34a", color: "#fff", border: "none", borderRadius: 8, padding: "8px 18px", cursor: "pointer", fontWeight: 800, fontSize: 12 }}>
                ✓ Add Selected to RFQ
              </button>
            )}
          </div>

          {/* Plastic materials */}
          {plastic.length > 0 && (
            <>
              <div style={{ background: "#eef3f8", padding: "6px 20px", borderTop: `1px solid ${C.border}` }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: "#0057A8", textTransform: "uppercase", letterSpacing: "0.5px" }}>Plastic Materials</span>
              </div>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 700 }}>
                  <thead>
                    <tr style={{ background: "#f8fafc" }}>
                      {["Material", "Category", "Friction", "Wear Resistance", "Temp Range", "Applications", "Availability", ""].map(h => (
                        <th key={h} style={{ padding: "7px 12px", fontSize: 9, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: "0.5px", textAlign: "left", borderBottom: `1px solid ${C.border}`, whiteSpace: "nowrap" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {plastic.map(mat => (
                      <MaterialRow key={mat.id} mat={mat} product={product} onAddRFQ={onAddRFQ} selected={selectedMat === mat.id} onSelect={setSelectedMat} />
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* Steel materials */}
          {steel.length > 0 && (
            <>
              <div style={{ background: "#f1f5f9", padding: "6px 20px", borderTop: `1px solid ${C.border}` }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: "#374151", textTransform: "uppercase", letterSpacing: "0.5px" }}>Steel Materials</span>
              </div>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 700 }}>
                  <thead>
                    <tr style={{ background: "#f8fafc" }}>
                      {["Material", "Category", "Friction", "Wear Resistance", "Temp Range", "Applications", "Availability", ""].map(h => (
                        <th key={h} style={{ padding: "7px 12px", fontSize: 9, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: "0.5px", textAlign: "left", borderBottom: `1px solid ${C.border}`, whiteSpace: "nowrap" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {steel.map(mat => (
                      <MaterialRow key={mat.id} mat={mat} product={product} onAddRFQ={onAddRFQ} selected={selectedMat === mat.id} onSelect={setSelectedMat} />
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>

        {/* Disclaimer */}
        <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 8, padding: "10px 14px", fontSize: 11, color: "#92400e", marginBottom: 12 }}>
          <strong>Data Notice:</strong> Specifications sourced from Movex Catalog pp. 7–108 and System Plast Smart Guide. All material selection must be confirmed by Uniking before purchase. NGE is an exclusive material designation of System Plast (Regal Rexnord).
        </div>
        <div style={{ fontSize: 10, color: C.muted }}>Catalog reference: {product.catalogRef}</div>
      </div>
    </div>
  );
}