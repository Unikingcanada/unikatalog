// Elevator Belts — loads from ElevatorAccessory entity + static fallback
import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";

const NAVY = "#0E1F3A";

const SUP_STYLE = {
  "Maxi-Lift": { color: "#B8860B", bg: "#fffbeb", border: "#fde68a" },
  "Tapco":     { color: "#0E1F3A", bg: "#FDF0E9", border: "#F8C9B0" },
  "4B":        { color: "#C62828", bg: "#fef2f2", border: "#fecaca" },
};

function BeltCard({ item }) {
  const [added, setAdded] = useState(false);
  const [notes, setNotes] = useState("");
  const info = SUP_STYLE[item.supplier] || { color: NAVY, bg: "#F4F2ED", border: "#D9D6CE" };

  function handleAdd() {
    const cart = JSON.parse(localStorage.getItem("uniking_rfq_cart") || "[]");
    cart.push({
      id: `belt-acc-${item.id || item.productName}-${Date.now()}`,
      cartId: `belt-acc-${Date.now()}`,
      type: "Elevator Belt",
      _source: "elev_belt",
      series: `${item.supplier} — ${item.productName}`,
      name: item.productName,
      supplier: item.supplier,
      notes: notes || item.description,
      qty: 1, unit: "Linear Feet",
    });
    localStorage.setItem("uniking_rfq_cart", JSON.stringify(cart));
    window.dispatchEvent(new Event("rfq_cart_updated"));
    setAdded(true);
    setTimeout(() => setAdded(false), 2500);
  }

  return (
    <div style={{ background: "#fff", border: "1px solid #D9D6CE", borderRadius: 14, overflow: "hidden", display: "flex", flexDirection: "column" }}>
      <div style={{ height: 3, background: info.color }} />
      <div style={{ padding: "16px 18px", flex: 1 }}>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
          <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 99, background: info.bg, color: info.color }}>{item.supplier}</span>
          <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 99, background: "#FDF0E9", color: "#0E1F3A" }}>Belt</span>
        </div>
        <div style={{ fontSize: 15, fontWeight: 800, color: NAVY, marginBottom: 6 }}>{item.productName}</div>
        <div style={{ fontSize: 12, color: "#3A4A66", lineHeight: 1.6, marginBottom: 10 }}>{item.description}</div>
        {item.specs && (
          <div style={{ fontSize: 11, color: "#3A4A66", background: "#F4F2ED", borderRadius: 6, padding: "8px 10px", lineHeight: 1.6, marginBottom: 10 }}>{item.specs}</div>
        )}
        {item.url && (
          <a href={item.url} target="_blank" rel="noreferrer" style={{ fontSize: 11, color: NAVY, fontWeight: 600, textDecoration: "none" }}>View on manufacturer site ↗</a>
        )}
      </div>
      <div style={{ padding: "12px 18px", borderTop: "1px solid #F4F2ED" }}>
        <input value={notes} onChange={e => setNotes(e.target.value)} placeholder="Notes (width, length, quantity...)"
          style={{ width: "100%", padding: "7px 10px", border: "1px solid #D9D6CE", borderRadius: 7, fontSize: 12, outline: "none", marginBottom: 8, boxSizing: "border-box" }} />
        <button onClick={handleAdd}
          style={{ width: "100%", padding: "9px", borderRadius: 8, border: "none", background: added ? "#2E7D46" : "#F26522", color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer", transition: "background 0.2s" }}>
          {added ? "✓ Added to RFQ" : "+ Add to RFQ"}
        </button>
      </div>
    </div>
  );
}

export default function ElevBeltsView({ onBack }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterSup, setFilterSup] = useState("All");

  useEffect(() => {
    base44.entities.ElevatorAccessory.filter({ category: "Belt" })
      .then(data => setItems(data || []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  const suppliers = ["All", ...new Set(items.map(i => i.supplier).filter(Boolean))];
  const filtered = items.filter(i => {
    const matchSup = filterSup === "All" || i.supplier === filterSup;
    const q = search.toLowerCase();
    const matchSearch = !q || (i.productName || "").toLowerCase().includes(q) || (i.description || "").toLowerCase().includes(q);
    return matchSup && matchSearch;
  });

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "24px clamp(12px,4vw,32px)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
        <button onClick={onBack} className="uk-btn-back">← Back</button>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 20, fontWeight: 900, color: NAVY }}>Elevator Belts</div>
          <div style={{ fontSize: 12, color: "#8A94A6" }}>Rubber, PVC, FDA & steel web core elevator belting — all suppliers</div>
        </div>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..."
          style={{ padding: "8px 14px", border: "1px solid #D9D6CE", borderRadius: 8, fontSize: 13, outline: "none", width: 180 }} />
      </div>
      <div style={{ display: "flex", gap: 6, marginBottom: 20, flexWrap: "wrap" }}>
        {suppliers.map(s => (
          <button key={s} onClick={() => setFilterSup(s)}
            style={{ padding: "6px 14px", borderRadius: 99, border: `1px solid ${filterSup === s ? NAVY : "#D9D6CE"}`, background: filterSup === s ? NAVY : "#fff", color: filterSup === s ? "#fff" : "#3A4A66", fontSize: 12, fontWeight: filterSup === s ? 700 : 500, cursor: "pointer" }}>
            {s}
          </button>
        ))}
      </div>
      {loading ? (
        <div style={{ textAlign: "center", padding: 60, color: "#8A94A6" }}>Loading belts...</div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: 60, color: "#8A94A6" }}>No belts found.</div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
          {filtered.map(item => <BeltCard key={item.id} item={item} />)}
        </div>
      )}
    </div>
  );
}