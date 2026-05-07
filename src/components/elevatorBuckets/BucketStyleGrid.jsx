// Bucket style grid with category tabs + material pills + product images
import { useState } from "react";

const NAVY = "#1a3a5c";

const MAT_STYLES = {
  "Polyethylene": { bg: "#dbeafe", color: "#1d4ed8" },
  "Nylon":        { bg: "#f3f4f6", color: "#374151" },
  "Urethane":     { bg: "#fef3c7", color: "#b45309" },
  "Carbon Steel": { bg: "#e5e7eb", color: "#374151" },
  "Mild Steel":   { bg: "#e5e7eb", color: "#374151" },
  "Stainless Steel": { bg: "#e0e7ff", color: "#3730a3" },
  "Ductile Iron": { bg: "#fde8d8", color: "#92400e" },
  "Aluminum":     { bg: "#e0f2fe", color: "#0369a1" },
  "Nylathane":    { bg: "#ccfbf1", color: "#0f766e" },
  "Nyrim":        { bg: "#ede9fe", color: "#6d28d9" },
};

function getMat(m) {
  for (const [k, v] of Object.entries(MAT_STYLES)) {
    if (m.toLowerCase().includes(k.toLowerCase())) return v;
  }
  return { bg: "#f1f5f9", color: "#334155" };
}

function parseMaterials(rec) {
  if (rec.materials && Array.isArray(rec.materials) && rec.materials.length > 0) return rec.materials;
  if (!rec.material) return [];
  return rec.material.split(/\s*[\/,]\s*/).map(s => s.trim()).filter(Boolean).filter((v,i,a) => a.indexOf(v) === i);
}

function normSupplier(vendor) {
  if (!vendor) return "";
  const v = vendor.toLowerCase();
  if (v.includes("maxi") || v === "maxilift") return "Maxi-Lift";
  if (v.includes("tapco")) return "Tapco";
  if (v === "4b" || v.includes("4b braime")) return "4B";
  return vendor;
}

function BucketCard({ rec, onClick }) {
  const [hov, setHov] = useState(false);
  const mats = parseMaterials(rec);
  const isAg = (rec.category || rec.application || "").toLowerCase().includes("ag");
  let sizeCount = 0;
  try {
    const sbm = rec.sizes_by_material ? JSON.parse(rec.sizes_by_material) : null;
    if (sbm) { const vals = Object.values(sbm); sizeCount = vals[0]?.length || 0; }
    else if (rec.bucket_sizes_detail) sizeCount = JSON.parse(rec.bucket_sizes_detail).length;
  } catch {}
  const isPending = rec.specs_status === "pending";

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: "#fff",
        borderRadius: 14,
        border: `1px solid ${hov ? "#b45309" : "#e5e7eb"}`,
        cursor: "pointer",
        overflow: "hidden",
        display: "flex", flexDirection: "column",
        transition: "all 0.15s",
        transform: hov ? "translateY(-3px)" : "none",
        boxShadow: hov ? "0 8px 28px rgba(0,0,0,0.11)" : "0 1px 4px rgba(0,0,0,0.04)",
      }}>
      <div style={{ height: 3, background: `linear-gradient(90deg, ${NAVY}, #2d5986)` }} />
      {/* Image */}
      <div style={{ background: "#f8fafc", display: "flex", alignItems: "center", justifyContent: "center", height: 130, overflow: "hidden", position: "relative" }}>
        {rec.image_url ? (
          <img src={rec.image_url} alt={rec.series}
            style={{ maxHeight: 115, maxWidth: "88%", objectFit: "contain", padding: 8 }}
            onError={e => { e.target.style.display = "none"; e.target.nextSibling.style.display = "flex"; }} />
        ) : null}
        {/* SVG placeholder shown if no image or image fails */}
        <div style={{ display: rec.image_url ? "none" : "flex", width: "100%", height: "100%", alignItems: "center", justifyContent: "center" }}>
          <svg width="80" height="64" viewBox="0 0 80 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="8" y="16" width="64" height="44" rx="4" fill="#e2e8f0" stroke="#cbd5e1" strokeWidth="1.5"/>
            <rect x="20" y="4" width="40" height="16" rx="3" fill="#cbd5e1" stroke="#94a3b8" strokeWidth="1.5"/>
            <text x="40" y="44" textAnchor="middle" fontSize="9" fill="#94a3b8" fontFamily="Arial">Bucket</text>
            <text x="40" y="55" textAnchor="middle" fontSize="7" fill="#94a3b8" fontFamily="Arial">No Image</text>
          </svg>
        </div>
        {/* Category badge */}
        <div style={{ position: "absolute", top: 8, left: 8 }}>
          <span style={{ fontSize: 9, fontWeight: 700, padding: "2px 7px", borderRadius: 99, background: isAg ? "#d1fae5" : "#dbeafe", color: isAg ? "#065f46" : "#1d4ed8" }}>
            {isAg ? "AG" : "IND"}
          </span>
        </div>
        {isPending && (
          <div style={{ position: "absolute", top: 8, right: 8 }}>
            <span style={{ fontSize: 9, fontWeight: 700, padding: "2px 7px", borderRadius: 99, background: "#fef3c7", color: "#b45309" }}>Specs Soon</span>
          </div>
        )}
      </div>
      {/* Body */}
      <div style={{ padding: "12px 14px 8px", flex: 1 }}>
        <div style={{ fontSize: 13, fontWeight: 900, color: NAVY, lineHeight: 1.25, marginBottom: 4 }}>{rec.styleName || rec.series}</div>
        {rec.discharge_type && <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 6 }}>{rec.discharge_type}</div>}
        {rec.application && <div style={{ fontSize: 11, color: "#6b7280", lineHeight: 1.5, marginBottom: 8, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{rec.application}</div>}
        {/* Material pills */}
        {mats.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
            {mats.map(m => {
              const s = getMat(m);
              return <span key={m} style={{ fontSize: 10, padding: "2px 7px", borderRadius: 99, background: s.bg, color: s.color, fontWeight: 600 }}>{m}</span>;
            })}
          </div>
        )}
      </div>
      {/* Footer */}
      <div style={{ padding: "8px 14px 12px", display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #f9fafb" }}>
        <span style={{ fontSize: 10, color: "#9ca3af" }}>{sizeCount > 0 ? `${sizeCount} sizes` : rec.bucket_sizes || ""}</span>
        <span style={{ fontSize: 11, color: NAVY, fontWeight: 800 }}>View Specs →</span>
      </div>
    </div>
  );
}

export default function BucketStyleGrid({ supplier, buckets, onSelectStyle, onBack }) {
  const [tab, setTab] = useState("ag");
  const [search, setSearch] = useState("");

  const supplierBuckets = buckets.filter(b => normSupplier(b.supplier || b.vendor) === supplier);

  const agBuckets = supplierBuckets.filter(b => (b.category || b.application || "").toLowerCase().includes("ag"));
  const indBuckets = supplierBuckets.filter(b => !(b.category || b.application || "").toLowerCase().includes("ag"));

  // Default to the tab that has content
  const activeTab = tab === "ag" && agBuckets.length === 0 ? "ind" : tab === "ind" && indBuckets.length === 0 ? "ag" : tab;
  const activeBuckets = activeTab === "ag" ? agBuckets : indBuckets;

  const filtered = search.trim()
    ? activeBuckets.filter(b => {
        const q = search.toLowerCase();
        return (b.series || "").toLowerCase().includes(q) || (b.styleName || "").toLowerCase().includes(q) || (b.application || "").toLowerCase().includes(q) || (b.material || "").toLowerCase().includes(q);
      })
    : activeBuckets;

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "24px clamp(12px,4vw,32px)" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
        <button onClick={onBack} className="uk-btn-back">← Suppliers</button>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 20, fontWeight: 900, color: NAVY }}>{supplier}</div>
          <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 2 }}>{supplierBuckets.length} styles available</div>
        </div>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search styles..."
          style={{ padding: "8px 14px", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 13, outline: "none", width: 200 }} />
      </div>

      {/* Category tabs */}
      <div className="uk-tab-bar" style={{ marginBottom: 24 }}>
        <button className={`uk-tab-btn${activeTab === "ag" ? " active" : ""}`} onClick={() => setTab("ag")} style={{ opacity: agBuckets.length === 0 ? 0.4 : 1 }}>
          Agricultural {agBuckets.length > 0 && <span style={{ marginLeft: 5, fontSize: 10, background: "#d1fae5", color: "#065f46", borderRadius: 99, padding: "1px 7px", fontWeight: 700 }}>{agBuckets.length}</span>}
        </button>
        <button className={`uk-tab-btn${activeTab === "ind" ? " active" : ""}`} onClick={() => setTab("ind")} style={{ opacity: indBuckets.length === 0 ? 0.4 : 1 }}>
          Industrial {indBuckets.length > 0 && <span style={{ marginLeft: 5, fontSize: 10, background: "#dbeafe", color: "#1d4ed8", borderRadius: 99, padding: "1px 7px", fontWeight: 700 }}>{indBuckets.length}</span>}
        </button>
      </div>

      {filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 20px", color: "#9ca3af" }}>
          <div style={{ fontSize: 32, marginBottom: 10 }}>🪣</div>
          <div style={{ fontSize: 13 }}>{search ? "No styles match your search." : "No styles in this category — check the other tab or contact Uniking."}</div>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 14 }}>
          {filtered.map(rec => (
            <BucketCard key={rec.id} rec={rec} onClick={() => onSelectStyle(rec)} />
          ))}
        </div>
      )}
    </div>
  );
}