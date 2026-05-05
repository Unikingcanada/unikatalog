/**
 * ChainDetailView.jsx
 * Full chain detail page — top section + tabbed specs.
 */
import { useState } from "react";
import ChainDetailTabs from "./ChainDetailTabs";

const C = {
  navy: "#003c5b", navyMid: "#1A3A5C",
  border: "#e2e8f0", bg: "#f8fafc", card: "#ffffff",
  text: "#0f172a", muted: "#64748b", slate: "#334155",
  green: "#16a34a", greenBg: "#f0fdf4",
  blue: "#2563eb", blueBg: "#eff6ff",
};

function getRFQCart() {
  try { return JSON.parse(localStorage.getItem("uniking_rfq_cart") || "[]"); } catch { return []; }
}
function addToRFQCart(product) {
  const cart = getRFQCart();
  const exists = cart.find(i => i.id === product.id && i._source === product._source);
  if (exists) { window.dispatchEvent(new CustomEvent("uniking_go_rfq")); return; }
  cart.push({
    cartId: product.id + "_" + Date.now(),
    id: product.id, _source: product._source || "normalized",
    series: product.chain_number || product.part_number || product.series || "",
    name: product.display_name || product.chain_number || product.part_number || "",
    type: product.product_type || product.family_label || "",
    style: product.specs?.pitch_in ? product.specs.pitch_in + '" pitch' : "",
    category: product.chain_family || product.category || "",
    image_url: product.image || product.image_url || "",
    materials: product.materials || "",
    application: product.industries?.join(", ") || product.application || "",
    quantity: 1, unit: "Feet", notes: product.notes || "",
  });
  localStorage.setItem("uniking_rfq_cart", JSON.stringify(cart));
  window.dispatchEvent(new Event("rfq_cart_updated"));
}

export default function ChainDetailView({ product, familyLabel, onBack, onConfigure }) {
  const [rfqAdded, setRfqAdded] = useState(() => getRFQCart().some(i => i.id === product.id));
  const chainNumber = product.display_name || product.chain_number || product.part_number || product.series;
  const pitch = product.specs?.pitch_in || product.pitch_in;
  const industries = product.industries || product.application_tags || [];

  function handleAddRFQ() {
    addToRFQCart(product);
    setRfqAdded(true);
  }

  return (
    <div>
      {/* Back button */}
      <button onClick={onBack} style={{ background: "#f1f5f9", border: "1px solid " + C.border, color: C.slate, borderRadius: 7, padding: "6px 14px", cursor: "pointer", fontSize: 12, fontWeight: 600, marginBottom: 16 }}>
        ← Back
      </button>

      {/* Top section */}
      <div style={{ background: C.navyMid, borderRadius: 12, padding: "clamp(16px,4vw,28px)", marginBottom: 24, color: "#fff" }}>
        <div style={{ display: "flex", gap: 20, alignItems: "flex-start", flexWrap: "wrap" }}>
          {/* Image */}
          {(product.image || product.image_url) && (
            <div style={{ background: "#fff", borderRadius: 8, padding: 8, width: 120, height: 90, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <img src={product.image || product.image_url} alt={chainNumber} style={{ maxWidth: 104, maxHeight: 74, objectFit: "contain" }} onError={e => e.target.parentElement.style.display = "none"} />
            </div>
          )}
          {/* Info */}
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "1.5px", color: "rgba(255,255,255,0.5)", marginBottom: 6 }}>
              {familyLabel || product.product_type}
            </div>
            <div style={{ fontSize: 22, fontWeight: 900, color: "#fff", lineHeight: 1.2, marginBottom: 4 }}>{chainNumber}</div>
            {pitch && <div style={{ fontSize: 13, color: "rgba(255,255,255,0.65)", marginBottom: 8 }}>{pitch}″ pitch</div>}
            {product.standard && <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", marginBottom: 8 }}>{product.standard}</div>}
            {product.description && (
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.75)", lineHeight: 1.6, marginBottom: 12, maxWidth: 520 }}>{product.description}</div>
            )}
            {/* Application tags */}
            {industries.length > 0 && (
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
                {industries.slice(0, 6).map((ind, i) => (
                  <span key={i} style={{ fontSize: 10, padding: "2px 8px", borderRadius: 20, background: "rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.8)", fontWeight: 600 }}>
                    {ind}
                  </span>
                ))}
              </div>
            )}
          </div>
          {/* Actions */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-end", flexShrink: 0 }}>
            <button onClick={handleAddRFQ}
              style={{ padding: "10px 20px", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 800, fontSize: 13, whiteSpace: "nowrap", background: rfqAdded ? "#f0fdf4" : "#16a34a", color: rfqAdded ? "#16a34a" : "#fff", transition: "all 0.15s" }}>
              {rfqAdded ? "✓ In RFQ" : "+ Add to RFQ"}
            </button>
            {onConfigure && (
              <button onClick={() => onConfigure(product)}
                style={{ padding: "9px 20px", background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.3)", color: "#fff", borderRadius: 8, cursor: "pointer", fontWeight: 700, fontSize: 12, whiteSpace: "nowrap" }}>
                ⚙ Configure
              </button>
            )}
            {(product.diagram_image || product.drawing_url) && (
              <a href={product.diagram_image || product.drawing_url} target="_blank" rel="noopener noreferrer"
                style={{ padding: "7px 16px", background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.25)", color: "#fff", borderRadius: 8, fontWeight: 600, fontSize: 11, textDecoration: "none", whiteSpace: "nowrap" }}>
                📐 Drawing
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ background: C.card, border: "1px solid " + C.border, borderRadius: 10, padding: "20px clamp(14px,3vw,24px)" }}>
        <ChainDetailTabs product={product} onAddRFQ={(p) => { addToRFQCart(p); setRfqAdded(true); }} />
      </div>

      {/* Needs-review banner */}
      {product.needs_review && (
        <div style={{ marginTop: 14, padding: "10px 14px", background: "#fffbeb", border: "1px solid #fbbf24", borderRadius: 6, fontSize: 12, color: "#92400e" }}>
          ⚠ This product has specifications pending Uniking engineering review. Final specs must be confirmed before supply.
        </div>
      )}
    </div>
  );
}