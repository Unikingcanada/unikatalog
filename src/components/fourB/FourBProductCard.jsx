import { useState } from "react";
import { APPROVALS } from "@/lib/fourBData";

const FOURBRED = "#cc0000";
const NAVY = "#0f2340";
const GOLD = "#c9a84c";

function ApprovalBadge({ code }) {
  const a = APPROVALS[code];
  if (!a) return null;
  return (
    <span title={a.fullLabel} style={{
      display: "inline-flex", alignItems: "center", gap: 3,
      fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 20,
      background: a.bg, color: a.color, border: `1px solid ${a.color}33`,
      whiteSpace: "nowrap"
    }}>
      {a.label}
    </span>
  );
}

function getRFQCart() {
  try { return JSON.parse(localStorage.getItem("uniking_rfq_cart") || "[]"); } catch { return []; }
}
function addToRFQCart(product) {
  const cart = getRFQCart();
  const exists = cart.find(i => i.id === product.id && i._source === "4b");
  if (exists) return false;
  cart.push({
    cartId: product.id + "_" + Date.now(),
    id: product.id, _source: "4b",
    series: product.name, name: product.name,
    type: "4B Electronics & Monitoring",
    category: product.subcategory,
    image_url: product.image,
    materials: "", application: product.applications?.[0] || "",
    quantity: 1, unit: "Each", notes: ""
  });
  localStorage.setItem("uniking_rfq_cart", JSON.stringify(cart));
  window.dispatchEvent(new Event("rfq_cart_updated"));
  return true;
}

export default function FourBProductCard({ product, onClick }) {
  const [hov, setHov] = useState(false);
  const [added, setAdded] = useState(() => getRFQCart().some(i => i.id === product.id));

  function handleRFQ(e) {
    e.stopPropagation();
    if (added) { window.dispatchEvent(new CustomEvent("uniking_go_rfq")); return; }
    addToRFQCart(product);
    setAdded(true);
  }

  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: "#fff",
        borderRadius: 10,
        border: `1px solid ${hov ? FOURBRED : "#e2e8f0"}`,
        boxShadow: hov ? "0 6px 24px rgba(204,0,0,0.10)" : "0 1px 4px rgba(0,0,0,0.06)",
        transition: "all 0.18s",
        display: "flex", flexDirection: "column",
        overflow: "hidden",
        cursor: "pointer",
      }}>

      {/* Red accent bar */}
      <div style={{ height: 3, background: FOURBRED, flexShrink: 0 }} />

      {/* Image */}
      <div onClick={() => onClick(product)}
        style={{ background: "#f8fafc", height: 160, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", position: "relative", borderBottom: "1px solid #f1f5f9" }}>
        <img
          src={product.image}
          alt={product.name}
          style={{ maxHeight: 144, maxWidth: "90%", objectFit: "contain", transition: "transform 0.25s", transform: hov ? "scale(1.04)" : "scale(1)" }}
          onError={e => { e.target.parentElement.style.background = "#f1f5f9"; e.target.style.display = "none"; }}
        />
        {/* 4B logo stamp */}
        <div style={{
          position: "absolute", top: 8, right: 8,
          background: FOURBRED, color: "#fff",
          fontSize: 9, fontWeight: 900, padding: "2px 7px", borderRadius: 4,
          letterSpacing: "0.5px"
        }}>4B</div>
      </div>

      {/* Content */}
      <div onClick={() => onClick(product)} style={{ padding: "13px 14px", flex: 1 }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: NAVY, lineHeight: 1.3, marginBottom: 5 }}>
          {product.name}
        </div>
        <div style={{ fontSize: 11, color: "#64748b", lineHeight: 1.55, marginBottom: 8,
          display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
          {product.description}
        </div>
        {/* Key function tag */}
        <div style={{ fontSize: 10, fontWeight: 700, color: FOURBRED, marginBottom: 8, lineHeight: 1.4 }}>
          {product.keyFunction}
        </div>
        {/* Approvals */}
        {product.approvals?.length > 0 && (
          <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
            {product.approvals.map(a => <ApprovalBadge key={a} code={a} />)}
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{ padding: "8px 14px", borderTop: "1px solid #f1f5f9", display: "flex", gap: 8, justifyContent: "space-between", alignItems: "center" }}>
        <span onClick={() => onClick(product)} style={{ fontSize: 11, fontWeight: 600, color: FOURBRED, cursor: "pointer" }}>
          View Details ›
        </span>
        <button onClick={handleRFQ} style={{
          padding: "5px 10px", borderRadius: 6, fontSize: 10, fontWeight: 700, cursor: "pointer",
          border: added ? "1px solid #16a34a" : `1px solid ${FOURBRED}`,
          background: added ? "#f0fdf4" : `${FOURBRED}10`,
          color: added ? "#16a34a" : FOURBRED,
          transition: "all 0.15s", whiteSpace: "nowrap"
        }}>
          {added ? "✓ In RFQ" : "+ RFQ"}
        </button>
      </div>
    </div>
  );
}

export { ApprovalBadge, addToRFQCart, getRFQCart };