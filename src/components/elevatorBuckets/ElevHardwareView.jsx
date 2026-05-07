// Elevator Hardware — loads from ElevatorAccessory entity (category: Hardware)
import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";

const NAVY = "#1a3a5c";

const SUP_STYLE = {
  "Maxi-Lift": { color: "#b45309", bg: "#fffbeb" },
  "Tapco":     { color: "#1d4ed8", bg: "#eff6ff" },
  "4B":        { color: "#b91c1c", bg: "#fef2f2" },
};

function HardwareCard({ item }) {
  const [added, setAdded] = useState(false);
  const [notes, setNotes] = useState("");
  const info = SUP_STYLE[item.supplier] || { color: NAVY, bg: "#f3f4f6" };

  function handleAdd() {
    const cart = JSON.parse(localStorage.getItem("uniking_rfq_cart") || "[]");
    cart.push({
      id: `hw-acc-${item.id || item.productName}-${Date.now()}`,
      cartId: `hw-acc-${Date.now()}`,
      type: "Elevator Hardware",
      _source: "elev_hw",
      series: `${item.supplier} — ${item.productName}`,
      name: item.productName,
      supplier: item.supplier,
      notes: notes || item.description,
      qty: 1, unit: "Each",
    });
    localStorage.setItem("uniking_rfq_cart", JSON.stringify(cart));
    window.dispatchEvent(new Event("rfq_cart_updated"));
    setAdded(true);
    setTimeout(() => setAdded(false), 2500);
  }

  return (
    <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 14, overflow: "hidden", display: "flex", flexDirection: "column" }}>
      <div style={{ height: 3, background: info.color }} />
      {item.imageURL && (
        <div style={{ background: "#f8fafc", height: 90, display: "flex", alignItems: "center", justifyContent: "center", borderBottom: "1px solid #f3f4f6" }}>
          <img src={item.imageURL} alt={item.productName}
            style={{ maxHeight: 78, maxWidth: "85%", objectFit: "contain" }}
            onError={e => e.target.parentElement.style.display = "none"} />
        </div>
      )}
      <div style={{ padding: "14px 16px", flex: 1 }}>
        <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 8 }}>
          <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 99, background: info.bg, color: info.color }}>{item.supplier}</span>
          <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 99, background: "#f3f4f6", color: "#374151" }}>Hardware</span>
        </div>
        <div style={{ fontSize: 14, fontWeight: 800, color: NAVY, marginBottom: 5 }}>{item.productName}</div>
        <div style={{ fontSize: 12, color: "#6b7280", lineHeight: 1.6, marginBottom: 10 }}>{item.description}</div>
        {item.specs && (
          <div style={{ fontSize: 11, color: "#374151", background: "#f8fafc", borderRadius: 6, padding: "7px 10px", lineHeight: 1.6 }}>{item.specs}</div>
        )}
      </div>
      <div style={{ padding: "12px 16px", borderTop: "1px solid #f3f4f6" }}>
        <input value={notes} onChange={e => setNotes(e.target.value)} placeholder="Notes (size, qty, grade...)"
          style={{ width: "100%", padding: "7px 10px", border: "1px solid #e2e8f0", borderRadius: 7, fontSize: 12, outline: "none", marginBottom: 8, boxSizing: "border-box" }} />
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={handleAdd}
            style={{ flex: 1, padding: "9px", borderRadius: 8, border: "none", background: added ? "#16a34a" : "#2563eb", color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer", transition: "background 0.2s" }}>
            {added ? "✓ Added to RFQ" : "+ Add to RFQ"}
          </button>
          {item.url && <a href={item.url} target="_blank" rel="noreferrer" style={{ padding: "9px 12px", borderRadius: 8, border: "1px solid #e2e8f0", background: "#f9fafb", color: "#6b7280", fontSize: 11, textDecoration: "none" }}>↗</a>}
        </div>
      </div>
    </div>
  );
}

export default function ElevHardwareView({ onBack }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterSup, setFilterSup] = useState("All");

  useEffect(() => {
    base44.entities.ElevatorAccessory.filter({ category: "Hardware" })
      .then(data => setItems(data || []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  const suppliers = ["All", ...new Set(items.map(i => i.supplier).filter(Boolean))];
  const filtered = items.filter(i => {
    const matchSup = filterSup === "All" || i.supplier === filterSup;
    const q = search.toLowerCase();
    return (!q || (i.productName || "").toLowerCase().includes(q) || (i.description || "").toLowerCase().includes(q)) && matchSup;
  });

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "24px clamp(12px,4vw,32px)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
        <button onClick={onBack} className="uk-btn-back">← Back</button>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 20, fontWeight: 900, color: NAVY }}>Elevator Hardware</div>
          <div style={{ fontSize: 12, color: "#9ca3af" }}>Elevator bolts, nuts & washers — Norway, Fanged, Easifit, Euro DIN, REF 70</div>
        </div>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..."
          style={{ padding: "8px 14px", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 13, outline: "none", width: 180 }} />
      </div>
      <div style={{ display: "flex", gap: 6, marginBottom: 20, flexWrap: "wrap" }}>
        {suppliers.map(s => (
          <button key={s} onClick={() => setFilterSup(s)}
            style={{ padding: "6px 14px", borderRadius: 99, border: `1px solid ${filterSup === s ? NAVY : "#e2e8f0"}`, background: filterSup === s ? NAVY : "#fff", color: filterSup === s ? "#fff" : "#374151", fontSize: 12, fontWeight: filterSup === s ? 700 : 500, cursor: "pointer" }}>
            {s}
          </button>
        ))}
      </div>
      {loading ? (
        <div style={{ textAlign: "center", padding: 60, color: "#9ca3af" }}>Loading hardware...</div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: 60, color: "#9ca3af" }}>No hardware found.</div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 16 }}>
          {filtered.map(item => <HardwareCard key={item.id} item={item} />)}
        </div>
      )}
    </div>
  );
}