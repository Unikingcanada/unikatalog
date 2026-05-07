// Shows all bucket series for a given supplier as styled cards
import { useState } from "react";

const NAVY = "#1a3a5c";
const AMBER = "#b45309";

function parseMaterials(str) {
  if (!str) return [];
  return str.split(/\s*[\/,]\s*/).map(s => s.trim()).filter(Boolean).filter((v, i, a) => a.indexOf(v) === i);
}

const MAT_DOTS = {
  "Poly": "#f97316", "Polyethylene": "#f97316", "Nylon": "#d97706",
  "Urethane": "#10b981", "FDA Nylon": "#6366f1", "Mild Steel": "#64748b",
  "Carbon Steel": "#64748b", "Stainless Steel": "#3b82f6", "Nylathane": "#10b981",
  "Nyrim": "#6366f1", "Aluminum": "#9ca3af", "Reinforced Poly": "#f97316",
};

function BucketCard({ rec, onClick }) {
  const materials = parseMaterials(rec.material);
  const isAg = (rec.application || "").toLowerCase().includes("ag");
  let sizeCount = 0;
  try { sizeCount = rec.bucket_sizes_detail ? JSON.parse(rec.bucket_sizes_detail).length : 0; } catch {}

  return (
    <div onClick={onClick}
      style={{ background: "#fff", borderRadius: 14, border: "1px solid #e5e7eb", cursor: "pointer", overflow: "hidden", display: "flex", flexDirection: "column", transition: "transform 0.15s, box-shadow 0.15s" }}
      onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 8px 28px rgba(0,0,0,0.11)"; e.currentTarget.style.borderColor = AMBER; }}
      onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; e.currentTarget.style.borderColor = "#e5e7eb"; }}>
      <div style={{ height: 3, background: `linear-gradient(90deg, ${AMBER}, ${AMBER}66)` }} />
      <div style={{ background: "#f8fafc", display: "flex", alignItems: "center", justifyContent: "center", height: 130, overflow: "hidden", position: "relative" }}>
        {rec.image_url
          ? <img src={rec.image_url} alt={rec.series} style={{ maxHeight: 115, maxWidth: "90%", objectFit: "contain", padding: 8 }} onError={e => e.target.style.display = "none"} />
          : <div style={{ color: "#d1d5db", fontSize: 44 }}>🪣</div>}
        {materials.length > 0 && (
          <div style={{ position: "absolute", bottom: 8, right: 8, display: "flex", gap: 4 }}>
            {materials.slice(0, 4).map(m => (
              <span key={m} title={m} style={{ width: 11, height: 11, borderRadius: "50%", background: MAT_DOTS[m] || "#9ca3af", border: "2px solid #fff", boxShadow: "0 1px 3px rgba(0,0,0,0.2)", display: "block" }} />
            ))}
          </div>
        )}
      </div>
      <div style={{ padding: "12px 14px 8px", flex: 1 }}>
        <div style={{ display: "flex", gap: 5, marginBottom: 6, flexWrap: "wrap" }}>
          <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 99, background: isAg ? "#d1fae5" : "#dbeafe", color: isAg ? "#065f46" : "#1d4ed8" }}>
            {isAg ? "Agricultural" : "Industrial"}
          </span>
          {rec.duty && <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 99, background: "#f3f4f6", color: "#374151" }}>{rec.duty}</span>}
        </div>
        <div style={{ fontSize: 14, fontWeight: 900, color: NAVY, lineHeight: 1.25, marginBottom: 4 }}>{rec.series}</div>
        {rec.style && <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 6 }}>{rec.style}</div>}
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
          {materials.slice(0, 4).map(m => {
            const dot = MAT_DOTS[m] || "#9ca3af";
            return <span key={m} style={{ fontSize: 10, padding: "2px 8px", borderRadius: 99, background: "#f3f4f6", color: "#374151", fontWeight: 600 }}>{m}</span>;
          })}
        </div>
      </div>
      <div style={{ padding: "8px 14px 12px", display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #f9fafb" }}>
        <span style={{ fontSize: 10, color: "#9ca3af" }}>{sizeCount > 0 ? `${sizeCount} sizes` : rec.bucket_sizes || ""}</span>
        <span style={{ fontSize: 11, color: AMBER, fontWeight: 800 }}>View & Configure →</span>
      </div>
    </div>
  );
}

function normSupplier(vendor) {
  if (!vendor) return "";
  const v = vendor.toLowerCase();
  if (v.includes("maxi") || v === "maxilift") return "Maxi-Lift";
  if (v.includes("tapco")) return "Tapco";
  if (v === "4b" || v.includes("4b braime")) return "4B";
  return vendor;
}

export default function BucketStyleGrid({ supplier, buckets, onSelectStyle, onBack }) {
  const [search, setSearch] = useState("");
  const supplierBuckets = buckets.filter(b => normSupplier(b.supplier || b.vendor) === supplier);

  const filtered = search.trim()
    ? supplierBuckets.filter(b => {
        const q = search.toLowerCase();
        return (b.series || "").toLowerCase().includes(q) || (b.style || "").toLowerCase().includes(q) || (b.application || "").toLowerCase().includes(q) || (b.material || "").toLowerCase().includes(q);
      })
    : supplierBuckets;

  const agBuckets = filtered.filter(b => (b.application || "").toLowerCase().includes("ag"));
  const indBuckets = filtered.filter(b => !(b.application || "").toLowerCase().includes("ag"));

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "24px clamp(12px,4vw,32px)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
        <button onClick={onBack} style={{ background: "#f1f5f9", border: "1px solid #e2e8f0", color: "#334155", borderRadius: 7, padding: "6px 14px", cursor: "pointer", fontSize: 12, fontWeight: 600, flexShrink: 0 }}>
          ← Suppliers
        </button>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 20, fontWeight: 900, color: NAVY }}>{supplier} Buckets</div>
          <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 2 }}>{supplierBuckets.length} series in catalog</div>
        </div>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search styles..."
          style={{ padding: "8px 14px", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 13, outline: "none", width: 200 }} />
      </div>

      {filtered.length === 0 && (
        <div style={{ textAlign: "center", padding: "60px 20px", color: "#9ca3af" }}>
          <div style={{ fontSize: 13 }}>No series match your search. This supplier's full catalog is being added — contact Uniking for any style.</div>
        </div>
      )}

      {agBuckets.length > 0 && (
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: "#065f46", textTransform: "uppercase", letterSpacing: 1, marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#10b981", display: "inline-block" }} />
            Agricultural
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 14 }}>
            {agBuckets.map(rec => <BucketCard key={rec.id} rec={rec} onClick={() => onSelectStyle(rec)} />)}
          </div>
        </div>
      )}

      {indBuckets.length > 0 && (
        <div>
          <div style={{ fontSize: 13, fontWeight: 800, color: "#1d4ed8", textTransform: "uppercase", letterSpacing: 1, marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#3b82f6", display: "inline-block" }} />
            Industrial
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 14 }}>
            {indBuckets.map(rec => <BucketCard key={rec.id} rec={rec} onClick={() => onSelectStyle(rec)} />)}
          </div>
        </div>
      )}
    </div>
  );
}