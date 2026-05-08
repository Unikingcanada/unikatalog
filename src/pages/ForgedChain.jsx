/**
 * ForgedChain — Drop Forged / Rivetless Forged Chain catalog view
 * Rendered inline from Home.jsx as <ForgedChainView onBack={...} onGoRFQ={...} />
 */
import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";

const NAVY = "#1a3a5c";
const AMBER = "#b45309";

function getRFQCart() {
  try { return JSON.parse(localStorage.getItem("uniking_rfq_cart") || "[]"); } catch { return []; }
}

function addToRFQCart(item) {
  const cart = getRFQCart();
  if (cart.find(i => i.id === item.id)) return false;
  cart.push(item);
  localStorage.setItem("uniking_rfq_cart", JSON.stringify(cart));
  window.dispatchEvent(new Event("rfq_cart_updated"));
  return true;
}

function ChainCard({ record, onRFQ }) {
  const [added, setAdded] = useState(() => getRFQCart().some(i => i.id === record.id));
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const h = () => setAdded(getRFQCart().some(i => i.id === record.id));
    window.addEventListener("rfq_cart_updated", h);
    return () => window.removeEventListener("rfq_cart_updated", h);
  }, [record.id]);

  function handleRFQ(e) {
    e.stopPropagation();
    if (added) { window.dispatchEvent(new CustomEvent("uniking_go_rfq")); return; }
    addToRFQCart({
      id: record.id,
      _source: "forged_chain",
      type: "Forged Chain",
      series: record.part_number || record.chain_number || record.display_name || "",
      name: record.part_number || record.display_name || "",
      style: record.subcategory || record.chain_family || "",
      category: "Forged Chain",
      materials: record.materials || "",
      qty: 1, unit: "Feet", notes: ""
    });
    setAdded(true);
  }

  const headers = Array.isArray(record.basic_headers) ? record.basic_headers : [];
  const rows = Array.isArray(record.basic_rows) ? record.basic_rows : [];

  return (
    <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, overflow: "hidden" }}>
      <div style={{ height: 3, background: NAVY }} />
      <div style={{ padding: "16px 18px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10, flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 15, fontWeight: 800, color: NAVY, marginBottom: 4 }}>
              {record.part_number || record.chain_number || record.display_name}
            </div>
            {record.subcategory && (
              <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 99, background: "#fef3c7", color: AMBER }}>{record.subcategory}</span>
            )}
            {record.description && (
              <div style={{ fontSize: 12, color: "#6b7280", lineHeight: 1.6, marginTop: 8 }}>{record.description}</div>
            )}
          </div>
          {record.product_image && (
            <img src={record.product_image} alt={record.part_number}
              style={{ width: 80, height: 64, objectFit: "contain", borderRadius: 8, border: "1px solid #e5e7eb", background: "#f8fafc", padding: 4, flexShrink: 0 }}
              onError={e => { e.target.style.display = "none"; }} />
          )}
        </div>

        {Array.isArray(record.features) && record.features.length > 0 && (
          <ul style={{ margin: "10px 0 0", paddingLeft: 16 }}>
            {record.features.slice(0, expanded ? 99 : 3).map((f, i) => (
              <li key={i} style={{ fontSize: 12, color: "#374151", marginBottom: 3 }}>{f}</li>
            ))}
          </ul>
        )}
        {Array.isArray(record.features) && record.features.length > 3 && (
          <button onClick={() => setExpanded(p => !p)}
            style={{ fontSize: 11, color: NAVY, fontWeight: 600, background: "none", border: "none", cursor: "pointer", marginTop: 4, padding: 0 }}>
            {expanded ? "Show less" : `+ ${record.features.length - 3} more`}
          </button>
        )}

        {headers.length > 0 && rows.length > 0 && (
          <div style={{ overflowX: "auto", marginTop: 12, borderRadius: 6, border: "1px solid #e5e7eb" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
              <thead>
                <tr style={{ background: NAVY }}>
                  {headers.map((h, i) => <th key={i} style={{ padding: "7px 10px", color: "#fff", fontWeight: 700, textAlign: "left", whiteSpace: "nowrap" }}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, ri) => (
                  <tr key={ri} style={{ background: ri % 2 === 0 ? "#f8fafc" : "#fff" }}>
                    {row.map((cell, ci) => (
                      <td key={ci} style={{ padding: "6px 10px", color: ci === 0 ? NAVY : "#374151", fontWeight: ci === 0 ? 700 : 400, whiteSpace: "nowrap", borderBottom: "1px solid #f3f4f6" }}>
                        {cell ?? "—"}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div style={{ padding: "10px 18px", borderTop: "1px solid #f3f4f6", display: "flex", justifyContent: "flex-end" }}>
        <button onClick={handleRFQ}
          style={{ padding: "6px 16px", borderRadius: 7, fontSize: 12, fontWeight: 700, cursor: "pointer", border: added ? "1px solid #16a34a" : "1px solid #2563eb", background: added ? "#f0fdf4" : "#eff6ff", color: added ? "#16a34a" : "#2563eb", transition: "all 0.12s" }}>
          {added ? "✓ In RFQ" : "+ Add to RFQ"}
        </button>
      </div>
    </div>
  );
}

export default function ForgedChain({ onBack, onGoRFQ }) {
  const [chains, setChains] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    base44.entities.MacChainProduct.filter({ category: "Engineered Chain" })
      .then(data => {
        const forged = (data || []).filter(r =>
          (r.subcategory || "").toLowerCase().includes("forged") ||
          (r.product_type || "").toLowerCase().includes("forged") ||
          (r.description || "").toLowerCase().includes("forged")
        );
        setChains(forged);
      })
      .catch(() => setChains([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = chains.filter(c => {
    const q = search.toLowerCase();
    if (!q) return true;
    return [c.part_number, c.subcategory, c.description, c.product_type].filter(Boolean).join(" ").toLowerCase().includes(q);
  });

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "24px clamp(12px,4vw,32px)" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24, flexWrap: "wrap" }}>
        {onBack && <button onClick={onBack} className="uk-btn-back">← Back</button>}
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 22, fontWeight: 900, color: NAVY }}>Drop Forged & Rivetless Chains</div>
          <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 2 }}>Heavy-duty forged chains for drag, overhead and high-load conveying applications</div>
        </div>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..."
          style={{ padding: "8px 14px", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 13, outline: "none", width: 180 }} />
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: 80, color: "#9ca3af" }}>Loading forged chains...</div>
      ) : filtered.length === 0 ? (
        <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 14, padding: "56px 32px", textAlign: "center" }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>⛓️</div>
          <div style={{ fontSize: 18, fontWeight: 800, color: NAVY, marginBottom: 8 }}>
            {chains.length === 0 ? "Forged Chain Catalog Coming Soon" : "No Results"}
          </div>
          <div style={{ fontSize: 13, color: "#6b7280", maxWidth: 440, margin: "0 auto 24px", lineHeight: 1.7 }}>
            {chains.length === 0
              ? "Our drop forged and rivetless chain product data is being loaded into the catalog. Contact Uniking for current specifications, pricing and availability."
              : "Try adjusting your search terms."}
          </div>
          {chains.length === 0 && (
            <button onClick={() => {
              const cart = getRFQCart();
              cart.push({ id: `forged-rfq-${Date.now()}`, _source: "forged_chain", type: "Forged Chain", series: "Drop Forged / Rivetless Chain", name: "Drop Forged / Rivetless Chain", style: "TBD", category: "Forged Chain", materials: "", qty: 1, unit: "Feet", notes: "Please contact for specifications and availability" });
              localStorage.setItem("uniking_rfq_cart", JSON.stringify(cart));
              window.dispatchEvent(new Event("rfq_cart_updated"));
              if (onGoRFQ) onGoRFQ();
            }}
              style={{ padding: "10px 24px", borderRadius: 8, border: "none", background: NAVY, color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
              Request a Quote
            </button>
          )}
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 16 }}>
          {filtered.map(chain => <ChainCard key={chain.id} record={chain} />)}
        </div>
      )}
    </div>
  );
}