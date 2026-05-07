// Elevator Hardware catalog — bolts & nuts
import { useState } from "react";
import { HARDWARE, SUPPLIER_INFO } from "@/lib/elevatorAccessoriesData";

const NAVY = "#1a3a5c";

function HardwareCard({ item }) {
  const [added, setAdded] = useState(false);
  const [selectedSize, setSelectedSize] = useState(item.sizes[0] || "");
  const [selectedMat, setSelectedMat] = useState(item.materials[0] || "");
  const [notes, setNotes] = useState("");
  const info = SUPPLIER_INFO[item.supplier] || {};

  function handleAdd() {
    const cart = JSON.parse(localStorage.getItem("uniking_rfq_cart") || "[]");
    cart.push({
      id: `hw-${item.id}-${Date.now()}`,
      cartId: `hw-${item.id}-${Date.now()}`,
      type: "Elevator Hardware",
      _source: "elev_hw",
      series: item.name,
      name: item.name,
      supplier: item.supplier,
      size: selectedSize,
      material: selectedMat,
      grade: item.grade,
      notes,
      qty: 1,
      unit: "Each",
    });
    localStorage.setItem("uniking_rfq_cart", JSON.stringify(cart));
    window.dispatchEvent(new Event("rfq_cart_updated"));
    setAdded(true);
    setTimeout(() => setAdded(false), 2500);
  }

  return (
    <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 14, overflow: "hidden", display: "flex", flexDirection: "column" }}>
      <div style={{ height: 3, background: info.color || NAVY }} />
      <div style={{ padding: "16px 18px", flex: 1 }}>
        <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 8 }}>
          <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 99, background: info.bg || "#f3f4f6", color: info.color || "#374151" }}>{item.supplier}</span>
          <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 99, background: "#f1f5f9", color: "#374151" }}>{item.grade}</span>
        </div>
        <div style={{ fontSize: 15, fontWeight: 800, color: NAVY, marginBottom: 5 }}>{item.name}</div>
        <div style={{ fontSize: 12, color: "#6b7280", lineHeight: 1.6, marginBottom: 12 }}>{item.description}</div>
        {item.notes && <div style={{ marginBottom: 12, fontSize: 11, color: "#6b7280", background: "#f8fafc", borderRadius: 6, padding: "7px 10px", lineHeight: 1.5 }}>{item.notes}</div>}
        <div style={{ marginBottom: 10 }}>
          <label style={{ fontSize: 10, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: 0.8, display: "block", marginBottom: 5 }}>Size</label>
          <select value={selectedSize} onChange={e => setSelectedSize(e.target.value)}
            style={{ width: "100%", padding: "7px 10px", border: "1px solid #e2e8f0", borderRadius: 7, fontSize: 12, outline: "none", background: "#fff" }}>
            {item.sizes.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div style={{ marginBottom: 10 }}>
          <label style={{ fontSize: 10, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: 0.8, display: "block", marginBottom: 5 }}>Material</label>
          <select value={selectedMat} onChange={e => setSelectedMat(e.target.value)}
            style={{ width: "100%", padding: "7px 10px", border: "1px solid #e2e8f0", borderRadius: 7, fontSize: 12, outline: "none", background: "#fff" }}>
            {item.materials.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
      </div>
      <div style={{ padding: "12px 18px", borderTop: "1px solid #f3f4f6" }}>
        <input value={notes} onChange={e => setNotes(e.target.value)} placeholder="Notes (quantity, grade, application...)"
          style={{ width: "100%", padding: "7px 10px", border: "1px solid #e2e8f0", borderRadius: 7, fontSize: 12, outline: "none", marginBottom: 8, boxSizing: "border-box" }} />
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={handleAdd}
            style={{ flex: 1, padding: "9px", borderRadius: 8, border: "none", background: added ? "#16a34a" : "#2563eb", color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer", transition: "background 0.2s" }}>
            {added ? "✓ Added to RFQ" : "+ Add to RFQ"}
          </button>
          {item.url && <a href={item.url} target="_blank" rel="noreferrer" style={{ padding: "9px 12px", borderRadius: 8, border: "1px solid #e2e8f0", background: "#f9fafb", color: "#6b7280", fontSize: 11, fontWeight: 600, textDecoration: "none" }}>↗</a>}
        </div>
      </div>
    </div>
  );
}

export default function ElevHardwareView({ onBack }) {
  const [search, setSearch] = useState("");
  const filtered = HARDWARE.filter(h => !search || h.name.toLowerCase().includes(search.toLowerCase()) || h.supplier.toLowerCase().includes(search.toLowerCase()) || h.description.toLowerCase().includes(search.toLowerCase()));
  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "24px clamp(12px,4vw,32px)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
        <button onClick={onBack} style={{ background: "#f1f5f9", border: "1px solid #e2e8f0", color: "#334155", borderRadius: 7, padding: "6px 14px", cursor: "pointer", fontSize: 12, fontWeight: 600 }}>← Back</button>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 20, fontWeight: 900, color: NAVY }}>Elevator Hardware</div>
          <div style={{ fontSize: 12, color: "#9ca3af" }}>Elevator bolts & nuts — Standard, Sabre-Tooth, Norway Flat, Countersunk</div>
        </div>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..."
          style={{ padding: "8px 14px", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 13, outline: "none", width: 180 }} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
        {filtered.map(item => <HardwareCard key={item.id} item={item} />)}
      </div>
    </div>
  );
}