/**
 * ChainProductCard — Individual chain product card.
 * No configure button. View Details + Add to RFQ only.
 */
import { useState } from "react";

const C = {
  navy: "#0C2340", navyMid: "#1A3A5C",
  gold: "#C9A84C", border: "#e2e8f0", muted: "#64748b", bg: "#f8fafc", text: "#0f172a",
};

export default function ChainProductCard({ product, accentColor = "#0C2340", onViewDetails }) {
  const [hov, setHov] = useState(false);
  const [added, setAdded] = useState(false);

  const hasNotes = product.notes && product.notes.toLowerCase().includes("missing data");
  const needsConfirmation = product.notes && product.notes.toLowerCase().includes("confirm");

  function addRFQ(e) {
    e.stopPropagation();
    const cart = JSON.parse(localStorage.getItem("uniking_rfq_cart") || "[]");
    const exists = cart.find(i => i.id === product.id);
    if (!exists) {
      cart.push({
        cartId: product.id + "_" + Date.now(),
        id: product.id,
        _source: "chain_catalog",
        series: product.chain_number,
        name: `${product.chain_number} — ${product.product_type}`,
        type: product.product_type,
        category: "Chain",
        quantity: 1,
        unit: "Foot",
        notes: `Source: ${product.source}${hasNotes ? " | Missing Data – Needs Mapping" : ""}`,
      });
      localStorage.setItem("uniking_rfq_cart", JSON.stringify(cart));
      window.dispatchEvent(new Event("rfq_cart_updated"));
    }
    setAdded(true);
    setTimeout(() => setAdded(false), 2500);
  }

  return (
    <div
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      onClick={() => onViewDetails(product)}
      style={{
        background: "#fff",
        borderRadius: 12,
        border: `2px solid ${hov ? accentColor : C.border}`,
        overflow: "hidden",
        cursor: "pointer",
        transition: "all 0.16s",
        boxShadow: hov ? "0 6px 24px rgba(12,35,64,0.12)" : "0 1px 3px rgba(0,0,0,0.04)",
        transform: hov ? "translateY(-2px)" : "none",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Image */}
      <div style={{ height: 110, background: "#f1f5f9", overflow: "hidden", position: "relative" }}>
        {product.image ? (
          <img src={product.image} alt={product.chain_number}
            style={{ width: "100%", height: "100%", objectFit: "cover", transition: "opacity 0.15s", opacity: hov ? 1 : 0.85 }} />
        ) : (
          <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: C.muted, fontSize: 28 }}>⛓️</div>
        )}
        {hasNotes && (
          <div style={{ position: "absolute", top: 6, right: 6, background: "#fef3c7", color: "#92400e", fontSize: 9, fontWeight: 700, padding: "2px 6px", borderRadius: 5 }}>
            DATA NEEDED
          </div>
        )}
        <div style={{ position: "absolute", top: 6, left: 6, background: accentColor, color: "#fff", fontSize: 9, fontWeight: 800, padding: "2px 6px", borderRadius: 5, letterSpacing: "0.5px" }}>
          {product.product_type?.split(" ").slice(0, 3).join(" ")}
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: "14px 16px", flex: 1 }}>
        <div style={{ fontSize: 17, fontWeight: 900, color: C.text, marginBottom: 4 }}>{product.chain_number}</div>
        <div style={{ fontSize: 12, color: accentColor, fontWeight: 700, marginBottom: 8 }}>{product.product_type}</div>
        <div style={{ fontSize: 11, color: C.muted, lineHeight: 1.65, marginBottom: 10 }}>
          {product.description?.slice(0, 110)}{product.description?.length > 110 ? "…" : ""}
        </div>

        {/* Specs mini-summary */}
        {product.specs?.pitch_in && product.specs.pitch_in !== "Missing Data – Needs Mapping" && (
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
            <span style={{ fontSize: 10, fontWeight: 600, background: "#f1f5f9", color: C.navyMid, padding: "2px 7px", borderRadius: 6 }}>
              Pitch: {product.specs.pitch_in}"
            </span>
            {product.specs.avg_ultimate_lbs && (
              <span style={{ fontSize: 10, fontWeight: 600, background: "#f1f5f9", color: C.navyMid, padding: "2px 7px", borderRadius: 6 }}>
                Strength: {product.specs.avg_ultimate_lbs} lb
              </span>
            )}
          </div>
        )}

        {/* Industries */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
          {product.industries?.slice(0, 3).map(ind => (
            <span key={ind} style={{ fontSize: 9, fontWeight: 600, background: `${accentColor}12`, color: accentColor, padding: "1px 6px", borderRadius: 8 }}>{ind}</span>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div style={{ padding: "10px 14px 12px", borderTop: `1px solid ${C.border}`, display: "flex", gap: 8 }}>
        <button onClick={e => { e.stopPropagation(); onViewDetails(product); }}
          style={{ flex: 1, padding: "8px", background: C.navyMid, color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontSize: 11, fontWeight: 700 }}>
          View Details
        </button>
        <button onClick={addRFQ}
          style={{ flex: 1, padding: "8px", background: added ? "#16a34a" : C.gold, color: added ? "#fff" : C.navy, border: "none", borderRadius: 8, cursor: "pointer", fontSize: 11, fontWeight: 700, transition: "background 0.2s" }}>
          {added ? "✓ Added" : "+ RFQ"}
        </button>
      </div>
    </div>
  );
}