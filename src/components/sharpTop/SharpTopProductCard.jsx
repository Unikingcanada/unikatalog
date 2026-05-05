import { useState, useEffect } from "react";
import { TOOTH_CONFIGS } from "@/lib/sharpTopData";

const C = { navy: "#0F2340", navyMid: "#1A3A5C", gold: "#C9A84C", border: "#e2e8f0", muted: "#64748b", text: "#0f172a", bg: "#f8fafc", green: "#16a34a" };

function getRFQCart() { try { return JSON.parse(localStorage.getItem("uniking_rfq_cart") || "[]"); } catch { return []; } }

export default function SharpTopProductCard({ product, onClick }) {
  const [hovered, setHovered] = useState(false);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    const check = () => setAdded(getRFQCart().some(i => i.id?.startsWith("sharptop-" + product.id)));
    check();
    window.addEventListener("rfq_cart_updated", check);
    return () => window.removeEventListener("rfq_cart_updated", check);
  }, [product.id]);

  function handleAddRFQ(e) {
    e.stopPropagation();
    if (added) { window.dispatchEvent(new CustomEvent("uniking_go_rfq")); return; }
    const cart = getRFQCart();
    const cartId = "sharptop-" + product.id + "-" + Date.now();
    cart.push({
      cartId, id: cartId, _source: "sharptop",
      series: product.chain_number,
      name: product.display_name,
      type: "Sharptop Chain",
      category: product.subcategory,
      style: TOOTH_CONFIGS[product.standard_config]?.shortLabel || product.standard_config,
      image_url: product.image_url || "",
      materials: product.materials || "",
      application: (product.applications || []).join(", "),
      quantity: 1, unit: "Feet", notes: `Config: ${product.standard_config}`,
    });
    localStorage.setItem("uniking_rfq_cart", JSON.stringify(cart));
    window.dispatchEvent(new Event("rfq_cart_updated"));
    setAdded(true);
  }

  const configCount = (product.available_configs || []).length;
  const strandLabel = product.strands === 1 ? "Single" : product.strands === 2 ? "Double" : product.strands === 3 ? "Triple" : `${product.strands}-Strand`;

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: "#fff", borderRadius: 10, overflow: "hidden",
        border: `1px solid ${hovered ? C.navyMid : C.border}`,
        boxShadow: hovered ? "0 6px 20px rgba(15,35,64,0.12)" : "0 1px 4px rgba(15,35,64,0.05)",
        transition: "all 0.15s", display: "flex", flexDirection: "column", cursor: "pointer",
      }}
      onClick={() => onClick(product)}
    >
      {/* Accent bar */}
      <div style={{ height: 3, background: `linear-gradient(90deg, ${C.gold}, ${C.navyMid})` }} />

      {/* Image */}
      <div style={{ height: 110, background: "#f8fafc", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden" }}>
        <img
          src={product.image_url}
          alt={product.chain_number}
          style={{ maxHeight: 96, maxWidth: "85%", objectFit: "contain" }}
          onError={e => e.target.style.display = "none"}
        />
        {product.featured && (
          <div style={{ position: "absolute", top: 6, right: 6, background: C.gold, color: C.navy, fontSize: 9, fontWeight: 800, padding: "2px 8px", borderRadius: 20, textTransform: "uppercase", letterSpacing: 0.5 }}>
            Most Common
          </div>
        )}
        <div style={{ position: "absolute", bottom: 6, left: 8, background: "rgba(15,35,64,0.75)", color: "#fff", fontSize: 9, fontWeight: 700, padding: "2px 8px", borderRadius: 10 }}>
          {strandLabel} · {product.pitch_in}" Pitch
        </div>
      </div>

      {/* Content */}
      <div onClick={() => onClick(product)} style={{ padding: "12px 14px", flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
        <div style={{ fontSize: 15, fontWeight: 800, color: C.text }}>{product.chain_number}</div>
        <div style={{ fontSize: 11, color: C.muted, lineHeight: 1.5 }}>
          {product.description?.slice(0, 90)}{product.description?.length > 90 ? "…" : ""}
        </div>

        {/* Quick specs */}
        <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginTop: 2 }}>
          <span style={{ fontSize: 10, background: "#eef3f8", color: C.navyMid, padding: "2px 8px", borderRadius: 10, fontWeight: 700 }}>
            {product.pitch_in}" ({product.pitch_mm}mm)
          </span>
          {product.weight_lbs_ft && (
            <span style={{ fontSize: 10, background: "#f8fafc", color: C.muted, padding: "2px 8px", borderRadius: 10, border: `1px solid ${C.border}` }}>
              {product.weight_lbs_ft} lbs/ft
            </span>
          )}
          {!product.weight_lbs_ft && (
            <span style={{ fontSize: 10, background: "#fef9c3", color: "#92400e", padding: "2px 8px", borderRadius: 10, border: "1px solid #fde68a" }}>
              Weight TBC
            </span>
          )}
        </div>

        {/* Configs available */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 2 }}>
          {(product.available_configs || []).slice(0, 5).map(cfg => (
            <span key={cfg} style={{ fontSize: 9, background: cfg === product.standard_config ? C.navyMid : "#f1f5f9", color: cfg === product.standard_config ? "#fff" : C.muted, padding: "2px 6px", borderRadius: 6, fontWeight: 700 }}>
              {cfg}
            </span>
          ))}
          {configCount > 5 && (
            <span style={{ fontSize: 9, color: C.muted, padding: "2px 6px" }}>+{configCount - 5} more</span>
          )}
        </div>
      </div>

      {/* Footer actions */}
      <div style={{ borderTop: `1px solid ${C.bg}`, padding: "8px 12px", background: hovered ? "#f1f5f9" : "#fff", transition: "background 0.13s", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 6 }}>
        <span style={{ fontSize: 11, fontWeight: 600, color: C.navyMid }}>View Details ›</span>
        <button
          onClick={handleAddRFQ}
          style={{ padding: "4px 10px", borderRadius: 5, fontSize: 10, fontWeight: 700, cursor: "pointer", transition: "all 0.15s", whiteSpace: "nowrap",
            border: added ? "1px solid #16a34a" : "1px solid #2563eb",
            background: added ? "#f0fdf4" : "#eff6ff",
            color: added ? "#16a34a" : "#2563eb" }}
        >
          {added ? "✓ RFQ" : "+ RFQ"}
        </button>
      </div>
    </div>
  );
}