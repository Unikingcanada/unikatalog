// Elevator Belts catalog — all suppliers, no brand preference
import { useState } from "react";
import { BELTS, SUPPLIER_INFO } from "@/lib/elevatorAccessoriesData";

const NAVY = "#1a3a5c";

function addToRFQ(belt, notes) {
  const cart = JSON.parse(localStorage.getItem("uniking_rfq_cart") || "[]");
  cart.push({
    id: `belt-${belt.id}-${Date.now()}`,
    cartId: `belt-${belt.id}-${Date.now()}`,
    type: "Elevator Belt",
    _source: "elev_belt",
    series: `${belt.supplier} ${belt.grade} ${belt.type} Belt`,
    name: `${belt.grade} ${belt.type} Belt`,
    supplier: belt.supplier,
    grade: belt.grade,
    notes,
    qty: 1,
    unit: "Linear Feet",
  });
  localStorage.setItem("uniking_rfq_cart", JSON.stringify(cart));
  window.dispatchEvent(new Event("rfq_cart_updated"));
}

function BeltCard({ belt }) {
  const [added, setAdded] = useState(false);
  const [notes, setNotes] = useState("");
  const info = SUPPLIER_INFO[belt.supplier] || {};

  function handleAdd() {
    addToRFQ(belt, notes);
    setAdded(true);
    setTimeout(() => setAdded(false), 2500);
  }

  return (
    <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 14, overflow: "hidden", display: "flex", flexDirection: "column" }}>
      <div style={{ height: 3, background: info.color || NAVY }} />
      <div style={{ padding: "16px 18px", flex: 1 }}>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
          <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 99, background: info.bg || "#f3f4f6", color: info.color || "#374151" }}>
            {belt.supplier}
          </span>
          <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 99, background: "#f1f5f9", color: "#334155" }}>{belt.type}</span>
          <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 99, background: "#f1f5f9", color: "#334155" }}>{belt.grade}</span>
        </div>
        <div style={{ fontSize: 15, fontWeight: 800, color: NAVY, marginBottom: 6 }}>{belt.grade} {belt.type} Belt</div>
        <div style={{ fontSize: 12, color: "#6b7280", lineHeight: 1.6, marginBottom: 10 }}>{belt.description}</div>
        <div style={{ marginBottom: 10 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 5 }}>Available Widths</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
            {belt.widths.map(w => <span key={w} style={{ fontSize: 10, padding: "2px 7px", borderRadius: 6, background: "#f1f5f9", color: "#334155", fontWeight: 600 }}>{w}</span>)}
          </div>
        </div>
        <div style={{ marginBottom: 10 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 5 }}>Splice Compatibility</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
            {belt.spliceCompatibility.map(s => <span key={s} style={{ fontSize: 10, padding: "2px 7px", borderRadius: 6, background: "#e0f2fe", color: "#0369a1", fontWeight: 600 }}>{s}</span>)}
          </div>
        </div>
        <div style={{ fontSize: 11, color: "#6b7280" }}>Temp: <b style={{ color: NAVY }}>{belt.temp}</b></div>
        {belt.notes && <div style={{ marginTop: 8, fontSize: 11, color: "#6b7280", lineHeight: 1.5, background: "#f8fafc", borderRadius: 6, padding: "7px 10px" }}>{belt.notes}</div>}
      </div>
      <div style={{ padding: "12px 18px", borderTop: "1px solid #f3f4f6" }}>
        <input value={notes} onChange={e => setNotes(e.target.value)} placeholder="Notes (width, length, quantity...)"
          style={{ width: "100%", padding: "7px 10px", border: "1px solid #e2e8f0", borderRadius: 7, fontSize: 12, outline: "none", marginBottom: 8, boxSizing: "border-box" }} />
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={handleAdd}
            style={{ flex: 1, padding: "9px", borderRadius: 8, border: "none", background: added ? "#16a34a" : "#2563eb", color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer", transition: "background 0.2s" }}>
            {added ? "✓ Added to RFQ" : "+ Add to RFQ"}
          </button>
          {belt.url && (
            <a href={belt.url} target="_blank" rel="noreferrer"
              style={{ padding: "9px 12px", borderRadius: 8, border: "1px solid #e2e8f0", background: "#f9fafb", color: "#6b7280", fontSize: 11, fontWeight: 600, textDecoration: "none" }}>
              ↗
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ElevBeltsView({ onBack }) {
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("All");
  const types = ["All", ...new Set(BELTS.map(b => b.type))];
  const filtered = BELTS.filter(b => {
    const matchType = filterType === "All" || b.type === filterType;
    const q = search.toLowerCase();
    const matchSearch = !q || b.supplier.toLowerCase().includes(q) || b.grade.toLowerCase().includes(q) || b.description.toLowerCase().includes(q);
    return matchType && matchSearch;
  });

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "24px clamp(12px,4vw,32px)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
        <button onClick={onBack} style={{ background: "#f1f5f9", border: "1px solid #e2e8f0", color: "#334155", borderRadius: 7, padding: "6px 14px", cursor: "pointer", fontSize: 12, fontWeight: 600 }}>← Back</button>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 20, fontWeight: 900, color: NAVY }}>Elevator Belts</div>
          <div style={{ fontSize: 12, color: "#9ca3af" }}>Rubber & PVC elevator belting — all widths, all suppliers</div>
        </div>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..."
          style={{ padding: "8px 14px", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 13, outline: "none", width: 180 }} />
      </div>
      <div style={{ display: "flex", gap: 6, marginBottom: 20, flexWrap: "wrap" }}>
        {types.map(t => (
          <button key={t} onClick={() => setFilterType(t)}
            style={{ padding: "6px 14px", borderRadius: 99, border: `1px solid ${filterType === t ? NAVY : "#e2e8f0"}`, background: filterType === t ? NAVY : "#fff", color: filterType === t ? "#fff" : "#374151", fontSize: 12, fontWeight: filterType === t ? 700 : 500, cursor: "pointer" }}>
            {t}
          </button>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
        {filtered.map(belt => <BeltCard key={belt.id} belt={belt} />)}
      </div>
    </div>
  );
}