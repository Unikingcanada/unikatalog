/**
 * TTCProductDetail — Full product detail panel with material selection table
 * The CORE procurement feature: normalized material table across all brands.
 */
import { useState } from "react";
import { MATERIALS, getMaterialsForProduct } from "@/lib/tableTopChainData";

const C = {
  navy: "#0C2340", navyMid: "#1A3A5C", gold: "#C9A84C",
  border: "#e2e8f0", muted: "#64748b", bg: "#f8fafc", text: "#0f172a",
  plastic: "#0057A8", steel: "#374151", green: "#16a34a",
};

const TYPE_LABELS = {
  STRAIGHT: "Straight Running", SIDEFLEX: "Sideflexing", HEAVY: "Heavy Duty",
  LBP: "Low Back Pressure", HIGH_FRICTION: "High Friction", CASE: "Case Conveyor",
  MICRO: "Micro Pitch", FLUSH_GRID: "Flush Grid / Open",
};

function RFQModal({ product, material, onConfirm, onClose }) {
  const [qty, setQty] = useState(1);
  const [unit, setUnit] = useState("Feet");
  const [notes, setNotes] = useState("");

  const rfqLabel = `${product.name} Table Top Chain – ${product.category === "STEEL" ? "Steel" : "Plastic"} – ${material.name}${material.brand ? ` (${material.brand})` : ""}`;

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(10,20,40,0.6)", zIndex: 1000,
      display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
    }}>
      <div style={{
        background: "#fff", borderRadius: 14, padding: "24px", maxWidth: 460, width: "100%",
        boxShadow: "0 24px 80px rgba(0,0,0,0.3)",
      }}>
        <div style={{ fontSize: 16, fontWeight: 800, color: C.navyMid, marginBottom: 6 }}>Add to RFQ</div>
        <div style={{
          background: "#f0f4f8", borderRadius: 8, padding: "10px 14px",
          fontSize: 12, color: C.navyMid, fontWeight: 700, marginBottom: 16, lineHeight: 1.5,
        }}>
          {rfqLabel}
        </div>

        <div style={{ marginBottom: 12 }}>
          <label style={{ fontSize: 11, fontWeight: 700, color: C.muted, display: "block", marginBottom: 4 }}>Quantity</label>
          <div style={{ display: "flex", gap: 8 }}>
            <input type="number" value={qty} min={1} onChange={e => setQty(e.target.value)}
              style={{ flex: 2, padding: "8px 10px", border: `1px solid ${C.border}`, borderRadius: 7, fontSize: 13, outline: "none" }} />
            <select value={unit} onChange={e => setUnit(e.target.value)}
              style={{ flex: 1, padding: "8px 10px", border: `1px solid ${C.border}`, borderRadius: 7, fontSize: 12, outline: "none" }}>
              <option>Feet</option>
              <option>Meters</option>
              <option>Links</option>
              <option>Rolls</option>
            </select>
          </div>
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 11, fontWeight: 700, color: C.muted, display: "block", marginBottom: 4 }}>Notes (optional)</label>
          <textarea value={notes} onChange={e => setNotes(e.target.value)}
            placeholder="Conveyor width, operating conditions, required widths, etc."
            rows={3}
            style={{ width: "100%", padding: "8px 10px", border: `1px solid ${C.border}`, borderRadius: 7, fontSize: 12, outline: "none", resize: "vertical", boxSizing: "border-box" }}
          />
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={onClose}
            style={{ flex: 1, padding: "10px", background: "#f1f5f9", border: `1px solid ${C.border}`, borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 600 }}>
            Cancel
          </button>
          <button onClick={() => onConfirm({ rfqLabel, qty, unit, notes })}
            style={{ flex: 2, padding: "10px", background: C.green, color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 800 }}>
            ✓ Add to RFQ Cart
          </button>
        </div>
      </div>
    </div>
  );
}

function MaterialRow({ mat, onAddRFQ }) {
  const [hovered, setHovered] = useState(false);
  const isExclusive = mat.brand && !mat.brand.includes("multiple");
  const isMulti = mat.brand && mat.brand.includes("multiple");

  return (
    <tr
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ background: hovered ? "#f0f7ff" : "transparent", transition: "background 0.12s" }}
    >
      <td style={{ padding: "10px 12px", borderBottom: `1px solid ${C.border}` }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
          <span style={{ fontSize: 12, fontWeight: 800, color: C.navyMid }}>{mat.name}</span>
          <span style={{
            fontSize: 9, fontWeight: 600, padding: "1px 6px", borderRadius: 8,
            background: mat.color, color: C.navyMid, display: "inline-block", width: "fit-content",
          }}>{mat.type}</span>
          {mat.badge && (
            <span style={{
              fontSize: 9, fontWeight: 700, padding: "1px 6px", borderRadius: 8,
              background: "#dbeafe", color: "#1d4ed8", display: "inline-block", width: "fit-content",
            }}>{mat.badge}</span>
          )}
        </div>
      </td>
      <td style={{ padding: "10px 12px", borderBottom: `1px solid ${C.border}` }}>
        <span style={{
          fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 6,
          background: mat.category === "Steel" ? "#f1f5f9" : "#eff6ff",
          color: mat.category === "Steel" ? C.steel : C.plastic,
        }}>{mat.category}</span>
      </td>
      <td style={{ padding: "10px 12px", borderBottom: `1px solid ${C.border}`, fontSize: 11, color: C.text }}>{mat.friction}</td>
      <td style={{ padding: "10px 12px", borderBottom: `1px solid ${C.border}`, fontSize: 11, color: C.text }}>{mat.wearResistance}</td>
      <td style={{ padding: "10px 12px", borderBottom: `1px solid ${C.border}`, fontSize: 11, color: C.text }}>{mat.chemicalResistance}</td>
      <td style={{ padding: "10px 12px", borderBottom: `1px solid ${C.border}`, fontSize: 11, color: C.text }}>{mat.tempRange}</td>
      <td style={{ padding: "10px 12px", borderBottom: `1px solid ${C.border}`, fontSize: 11, color: C.muted, maxWidth: 180 }}>{mat.applications}</td>
      <td style={{ padding: "10px 12px", borderBottom: `1px solid ${C.border}` }}>
        <span style={{
          fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 6,
          background: mat.availability === "Standard" ? "#dcfce7" : "#fef9c3",
          color: mat.availability === "Standard" ? "#166534" : "#713f12",
        }}>{mat.availability}</span>
      </td>
      <td style={{ padding: "10px 12px", borderBottom: `1px solid ${C.border}`, fontSize: 10 }}>
        {isExclusive ? (
          <span style={{ color: "#7c3aed", fontWeight: 700, background: "#f5f3ff", padding: "2px 7px", borderRadius: 6 }}>{mat.brand}</span>
        ) : isMulti ? (
          <span style={{ color: C.muted, fontStyle: "italic" }}>Multiple manufacturers</span>
        ) : (
          <span style={{ color: C.muted }}>Multiple manufacturers</span>
        )}
      </td>
      <td style={{ padding: "10px 12px", borderBottom: `1px solid ${C.border}` }}>
        <button
          onClick={() => onAddRFQ(mat)}
          style={{
            background: C.navyMid, color: "#fff", border: "none",
            borderRadius: 7, padding: "6px 12px", cursor: "pointer",
            fontSize: 11, fontWeight: 700, whiteSpace: "nowrap",
          }}
        >
          + RFQ
        </button>
      </td>
    </tr>
  );
}

export default function TTCProductDetail({ product, onBack, onAddRFQ }) {
  const [imgError, setImgError] = useState(false);
  const [rfqMaterial, setRfqMaterial] = useState(null);
  const [addedItems, setAddedItems] = useState([]);

  const materials = getMaterialsForProduct(product);
  const isSteelCat = product.category === "STEEL";
  const accentColor = isSteelCat ? C.steel : C.plastic;

  function handleAddRFQ(mat) {
    setRfqMaterial(mat);
  }

  function handleConfirmRFQ({ rfqLabel, qty, unit, notes }) {
    const cartItem = {
      cartId: `ttc_${product.id}_${rfqMaterial.id}_${Date.now()}`,
      id: `ttc_${product.id}_${rfqMaterial.id}`,
      _source: "tabletop_chain",
      name: rfqLabel,
      series: product.name,
      type: `Table Top Chain — ${isSteelCat ? "Steel" : "Plastic"}`,
      category: TYPE_LABELS[product.type] || product.type,
      materials: rfqMaterial.name,
      quantity: parseInt(qty) || 1,
      unit: unit,
      notes: notes || "",
      image_url: product.image,
    };

    const cart = JSON.parse(localStorage.getItem("uniking_rfq_cart") || "[]");
    cart.push(cartItem);
    localStorage.setItem("uniking_rfq_cart", JSON.stringify(cart));
    window.dispatchEvent(new Event("rfq_cart_updated"));
    setAddedItems(prev => [...prev, rfqMaterial.id]);
    setRfqMaterial(null);

    if (onAddRFQ) onAddRFQ(cartItem);
  }

  return (
    <div>
      {rfqMaterial && (
        <RFQModal
          product={product}
          material={rfqMaterial}
          onConfirm={handleConfirmRFQ}
          onClose={() => setRfqMaterial(null)}
        />
      )}

      {/* Header */}
      <div style={{ background: `linear-gradient(135deg, ${C.navy} 0%, ${C.navyMid} 100%)`, padding: "20px 28px" }}>
        <button onClick={onBack} style={{
          background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)",
          color: "#fff", borderRadius: 7, padding: "5px 12px", cursor: "pointer",
          fontSize: 12, marginBottom: 16,
        }}>
          ← Back to Catalog
        </button>

        <div style={{ display: "flex", gap: 24, alignItems: "flex-start", flexWrap: "wrap" }}>
          {/* Image */}
          <div style={{
            width: 200, height: 160, background: "rgba(255,255,255,0.06)", borderRadius: 10,
            border: "1px solid rgba(255,255,255,0.15)", overflow: "hidden", flexShrink: 0,
          }}>
            {!imgError ? (
              <img src={product.image} alt={product.name} onError={() => setImgError(true)}
                style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.4)", fontSize: 40 }}>⛓️</div>
            )}
          </div>

          {/* Info */}
          <div style={{ flex: 1, minWidth: 240 }}>
            <div style={{ display: "flex", gap: 8, marginBottom: 10, flexWrap: "wrap" }}>
              <span style={{ background: accentColor, color: "#fff", fontSize: 10, fontWeight: 800, padding: "3px 10px", borderRadius: 5 }}>
                {isSteelCat ? "STEEL TABLE TOP CHAIN" : "PLASTIC TABLE TOP CHAIN"}
              </span>
              <span style={{ background: "rgba(255,255,255,0.15)", color: "#fff", fontSize: 10, fontWeight: 700, padding: "3px 10px", borderRadius: 5 }}>
                {TYPE_LABELS[product.type] || product.type}
              </span>
            </div>
            <h1 style={{ color: "#fff", fontSize: 26, fontWeight: 900, margin: "0 0 8px" }}>{product.name}</h1>
            <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 13, lineHeight: 1.6, margin: "0 0 14px", maxWidth: 600 }}>{product.description}</p>
            <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
              {[
                ["Pitch", product.pitch],
                ["Backflex Radius", product.backflexRadius],
                ["Delivery", product.deliveryUnit],
                ["Materials", `${materials.length} options`],
                ["Catalog Ref", `p. ${product.catalogPage}`],
              ].map(([k, v]) => (
                <div key={k} style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 13, fontWeight: 800, color: C.gold }}>{v}</div>
                  <div style={{ fontSize: 9, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "0.5px" }}>{k}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div style={{ padding: "24px 28px", background: C.bg }}>

        {/* Product Overview */}
        <div style={{ background: "#fff", borderRadius: 10, border: `1px solid ${C.border}`, padding: "20px", marginBottom: 20 }}>
          <h2 style={{ fontSize: 14, fontWeight: 800, color: C.navyMid, marginBottom: 14, textTransform: "uppercase", letterSpacing: "0.5px" }}>
            Product Overview
          </h2>
          <div style={{ display: "flex", gap: 32, flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: 200 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, marginBottom: 8 }}>KEY FEATURES</div>
              <ul style={{ margin: 0, padding: "0 0 0 16px" }}>
                {product.features.map((f, i) => (
                  <li key={i} style={{ fontSize: 12, color: C.text, lineHeight: 1.7 }}>{f}</li>
                ))}
              </ul>
            </div>
            <div style={{ flex: 1, minWidth: 200 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, marginBottom: 8 }}>APPLICATIONS</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                {product.applications.map((app, i) => (
                  <span key={i} style={{ fontSize: 11, color: C.navyMid, background: "#eef3f8", padding: "3px 10px", borderRadius: 10, fontWeight: 600 }}>{app}</span>
                ))}
              </div>
              {product.widths?.length > 0 && (
                <>
                  <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, marginBottom: 6, marginTop: 14 }}>AVAILABLE WIDTHS</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                    {product.widths.map((w, i) => (
                      <span key={i} style={{ fontSize: 11, color: C.text, background: "#f8fafc", border: `1px solid ${C.border}`, padding: "3px 9px", borderRadius: 8 }}>{w}</span>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Baseline Technical Data */}
        <div style={{ background: "#fff", borderRadius: 10, border: `1px solid ${C.border}`, padding: "20px", marginBottom: 20 }}>
          <h2 style={{ fontSize: 14, fontWeight: 800, color: C.navyMid, marginBottom: 14, textTransform: "uppercase", letterSpacing: "0.5px" }}>
            Baseline Technical Data
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12 }}>
            {[
              ["Chain Category", isSteelCat ? "Steel Table Top Chain" : "Plastic Table Top Chain"],
              ["Functional Type", TYPE_LABELS[product.type] || product.type],
              ["Pitch", product.pitch],
              ["Backflex Radius", product.backflexRadius],
              ["Delivery Unit", product.deliveryUnit],
              ["Pin Type", isSteelCat ? "Stainless Steel" : "Stainless Steel (plastic pin variant on some series)"],
              ["Catalog Reference", `Movex Imperial Catalog p. ${product.catalogPage}`],
              ["Available Widths", product.widths?.length > 0 ? product.widths.join(", ") : "To be confirmed by Uniking"],
            ].map(([k, v]) => (
              <div key={k} style={{ background: C.bg, borderRadius: 7, padding: "10px 12px", border: `1px solid ${C.border}` }}>
                <div style={{ fontSize: 9, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 3 }}>{k}</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: v.includes("To be confirmed") ? "#92400e" : C.text, fontStyle: v.includes("To be confirmed") ? "italic" : "normal" }}>{v}</div>
              </div>
            ))}
          </div>
          <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 7, padding: "8px 12px", marginTop: 12, fontSize: 11, color: "#92400e" }}>
            ⚠ All specifications and max load values must be confirmed by Uniking before production or equipment design.
          </div>
        </div>

        {/* Material Selection Table — CORE FEATURE */}
        <div style={{ background: "#fff", borderRadius: 10, border: `1.5px solid ${accentColor}30`, padding: "20px", marginBottom: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
            <div>
              <h2 style={{ fontSize: 14, fontWeight: 800, color: C.navyMid, margin: 0, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Material Selection
              </h2>
              <p style={{ fontSize: 11, color: C.muted, margin: "4px 0 0" }}>
                Select the optimal material for your application. Brand shown only for exclusive materials.
              </p>
            </div>
            <span style={{
              fontSize: 11, fontWeight: 700, background: `${accentColor}15`,
              color: accentColor, padding: "4px 12px", borderRadius: 8,
            }}>
              {materials.length} materials available
            </span>
          </div>

          {/* Desktop: full table */}
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
              <thead>
                <tr style={{ background: C.navyMid }}>
                  {["Material", "Category", "Friction", "Wear Resistance", "Chem. Resistance", "Temp Range", "Suitable Applications", "Availability", "Brand Source", ""].map((h, i) => (
                    <th key={i} style={{
                      padding: "9px 12px", color: "#fff", fontWeight: 700, textAlign: "left",
                      fontSize: 10, textTransform: "uppercase", letterSpacing: "0.5px",
                      borderRight: i < 9 ? "1px solid rgba(255,255,255,0.1)" : "none",
                      whiteSpace: "nowrap",
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {materials.map((mat, i) => (
                  <MaterialRow
                    key={mat.id}
                    mat={mat}
                    onAddRFQ={handleAddRFQ}
                    added={addedItems.includes(mat.id)}
                  />
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ marginTop: 12, fontSize: 10, color: C.muted, display: "flex", gap: 16, flexWrap: "wrap" }}>
            <span>🟣 <strong>Exclusive material</strong> — specific to one manufacturer</span>
            <span>⚫ <strong>Multiple manufacturers</strong> — available from various suppliers</span>
            <span>🟡 <strong>On request</strong> — contact Uniking for availability and lead time</span>
          </div>
        </div>

        {/* Added confirmation */}
        {addedItems.length > 0 && (
          <div style={{
            background: "#f0fdf4", border: "1px solid #86efac", borderRadius: 8,
            padding: "12px 16px", display: "flex", alignItems: "center", gap: 10,
          }}>
            <span style={{ fontSize: 16 }}>✅</span>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#166534" }}>Added to RFQ Cart</div>
              <div style={{ fontSize: 11, color: "#166534" }}>{addedItems.length} item{addedItems.length > 1 ? "s" : ""} added. Go to RFQ Cart to review and submit.</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}