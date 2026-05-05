/**
 * NormalizedChainCard.jsx
 * Standard card for normalized chain products.
 * Works for all chain families.
 */
import { useState, useEffect } from "react";

const C = {
  navy: "#003c5b", navyMid: "#1A3A5C", navyLight: "#2A5080",
  border: "#e2e8f0", bg: "#f8fafc", card: "#ffffff",
  text: "#0f172a", muted: "#64748b", slate: "#334155",
  green: "#16a34a", greenBg: "#f0fdf4",
  blue: "#2563eb", blueBg: "#eff6ff",
};

function getRFQCart() {
  try { return JSON.parse(localStorage.getItem("uniking_rfq_cart") || "[]"); } catch { return []; }
}

export default function NormalizedChainCard({ product, onView, onConfigure, onCompare, inCompare }) {
  const [hovered, setHovered] = useState(false);
  const [added, setAdded] = useState(() => getRFQCart().some(i => i.id === product.id));

  useEffect(() => {
    const update = () => setAdded(getRFQCart().some(i => i.id === product.id));
    window.addEventListener("rfq_cart_updated", update);
    return () => window.removeEventListener("rfq_cart_updated", update);
  }, [product.id]);

  const pitch = product.specs?.pitch_in || product.pitch_in || "";
  const chainNumber = product.chain_number || product.part_number || product.display_name || product.series;
  const family = product.product_type || product.family_label || "";
  const topSpecs = Object.entries(product.specs || {})
    .filter(([k, v]) => v != null && v !== "" && v !== "N/A" && !["notes", "type"].includes(k))
    .slice(0, 3);

  const sourceCount = product.source_data?.length || (product.source ? 1 : 0);
  const hasAttachments = (product.related_attachments?.length || 0) > 0;
  const hasSprockets = (product.related_sprockets?.length || 0) > 0;
  const hasPins = (product.related_pins?.length || 0) > 0;

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: C.card,
        borderRadius: 10,
        border: "1px solid " + (hovered ? C.navyLight : C.border),
        boxShadow: hovered ? "0 6px 20px rgba(15,35,64,0.12)" : "0 1px 4px rgba(15,35,64,0.05)",
        transition: "all 0.18s",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        transform: hovered ? "translateY(-2px)" : "none",
      }}
    >
      {/* Top accent */}
      <div style={{ height: 3, background: C.navyMid, flexShrink: 0 }} />

      {/* Image */}
      {(product.image || product.image_url) && (
        <div onClick={() => onView(product)} style={{ background: C.bg, borderBottom: "1px solid #f1f5f9", height: 100, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", overflow: "hidden" }}>
          <img src={product.image || product.image_url} alt={chainNumber} style={{ maxHeight: 88, maxWidth: "86%", objectFit: "contain" }} onError={e => e.target.parentElement.style.display = "none"} />
        </div>
      )}

      {/* Content */}
      <div onClick={() => onView(product)} style={{ padding: "12px 14px", flex: 1, cursor: "pointer" }}>
        {/* Family label */}
        <div style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.8px", color: C.muted, marginBottom: 5 }}>{family}</div>
        {/* Chain number */}
        <div style={{ fontSize: 15, fontWeight: 800, color: C.text, lineHeight: 1.25, marginBottom: 3 }}>{chainNumber}</div>
        {/* Pitch */}
        {pitch && <div style={{ fontSize: 11, color: C.muted, marginBottom: 8 }}>{pitch}″ pitch</div>}
        {/* Top specs */}
        {topSpecs.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 8 }}>
            {topSpecs.map(([k, v]) => (
              <span key={k} style={{ fontSize: 10, background: C.bg, border: "1px solid " + C.border, borderRadius: 3, padding: "1px 6px", color: C.slate }}>
                {String(v).length > 18 ? String(v).slice(0, 18) + "…" : String(v)}
              </span>
            ))}
          </div>
        )}
        {/* Badges */}
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
          {sourceCount > 0 && <span style={{ fontSize: 10, padding: "1px 6px", borderRadius: 3, background: "#f0fdf4", color: C.green, border: "1px solid #bbf7d0", fontWeight: 700 }}>{sourceCount} source{sourceCount > 1 ? "s" : ""}</span>}
          {hasAttachments && <span style={{ fontSize: 10, padding: "1px 6px", borderRadius: 3, background: C.blueBg, color: C.blue, border: "1px solid #bfdbfe" }}>Att.</span>}
          {hasSprockets && <span style={{ fontSize: 10, padding: "1px 6px", borderRadius: 3, background: C.blueBg, color: C.blue, border: "1px solid #bfdbfe" }}>Spkt.</span>}
          {hasPins && <span style={{ fontSize: 10, padding: "1px 6px", borderRadius: 3, background: C.blueBg, color: C.blue, border: "1px solid #bfdbfe" }}>Pins</span>}
        </div>
      </div>

      {/* Actions */}
      <div style={{ borderTop: "1px solid " + C.bg, padding: "8px 12px", background: hovered ? "#f1f5f9" : C.card, display: "flex", alignItems: "center", gap: 6, justifyContent: "space-between" }}>
        <span onClick={() => onView(product)} style={{ fontSize: 11, fontWeight: 600, color: C.navyMid, cursor: "pointer", whiteSpace: "nowrap" }}>
          View Details ›
        </span>
        <div style={{ display: "flex", gap: 5 }}>
          {onCompare && (
            <button onClick={e => { e.stopPropagation(); onCompare(product); }}
              style={{ padding: "3px 7px", borderRadius: 5, fontSize: 10, fontWeight: 700, cursor: "pointer", border: inCompare ? "1px solid #7c3aed" : "1px solid #cbd5e1", background: inCompare ? "#ede9fe" : C.bg, color: inCompare ? "#7c3aed" : C.muted }}>
              {inCompare ? "✓" : "Cmp"}
            </button>
          )}
          <button onClick={e => { e.stopPropagation(); onConfigure && onConfigure(product); }}
            style={{ padding: "4px 8px", borderRadius: 5, fontSize: 10, fontWeight: 700, cursor: "pointer", border: "1px solid " + C.navyMid, background: C.navyMid, color: "#fff", whiteSpace: "nowrap" }}>
            Configure
          </button>
        </div>
      </div>
    </div>
  );
}