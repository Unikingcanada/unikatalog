// Full style detail view — material toggle + size spec table + hole pattern modal
import { useState } from "react";
import HolePatternModal from "./HolePatternModal";

const NAVY = "#1a3a5c";
const AMBER = "#b45309";

const MAT_DEF = {
  "Poly": { color: "#c2410c", bg: "#fff7ed", border: "#fed7aa", dot: "#f97316", label: "Poly (HDPE)", temp: "-60°F to +180°F", fda: true },
  "Polyethylene": { color: "#c2410c", bg: "#fff7ed", border: "#fed7aa", dot: "#f97316", label: "Poly (HDPE)", temp: "-60°F to +180°F", fda: true },
  "Nylon": { color: "#92400e", bg: "#fef9c3", border: "#fde68a", dot: "#d97706", label: "Nylon", temp: "-60°F to +300°F", fda: false },
  "Urethane": { color: "#065f46", bg: "#d1fae5", border: "#6ee7b7", dot: "#10b981", label: "Urethane", temp: "-60°F to +180°F", fda: true },
  "FDA Nylon": { color: "#4338ca", bg: "#e0e7ff", border: "#a5b4fc", dot: "#6366f1", label: "FDA Nylon", temp: "-60°F to +300°F", fda: true },
  "Nyrim": { color: "#4338ca", bg: "#e0e7ff", border: "#a5b4fc", dot: "#6366f1", label: "Nyrim/Nylon", temp: "-60°F to +300°F", fda: false },
  "Nylathane": { color: "#065f46", bg: "#d1fae5", border: "#6ee7b7", dot: "#10b981", label: "Nylathane", temp: "-60°F to +200°F", fda: true },
  "Mild Steel": { color: "#374151", bg: "#f1f5f9", border: "#cbd5e1", dot: "#64748b", label: "Mild Steel", temp: "High temp", fda: false },
  "Carbon Steel": { color: "#374151", bg: "#f1f5f9", border: "#cbd5e1", dot: "#64748b", label: "Carbon Steel", temp: "High temp", fda: false },
  "Stainless Steel": { color: "#1e3a5f", bg: "#e0e7ff", border: "#93c5fd", dot: "#3b82f6", label: "Stainless Steel", temp: "High temp", fda: true },
  "Aluminum": { color: "#6b7280", bg: "#f3f4f6", border: "#d1d5db", dot: "#9ca3af", label: "Aluminum", temp: "Moderate temp", fda: false },
  "Reinforced Poly": { color: "#c2410c", bg: "#fff7ed", border: "#fed7aa", dot: "#f97316", label: "Reinforced Poly", temp: "-40°F to +180°F", fda: false },
};

function getMat(str) {
  if (!str) return { color: NAVY, bg: "#f3f4f6", border: "#e5e7eb", dot: "#9ca3af", label: str || "", temp: "—", fda: false };
  for (const [k, v] of Object.entries(MAT_DEF)) {
    if (str.toLowerCase().includes(k.toLowerCase())) return { key: str, ...v };
  }
  return { key: str, color: NAVY, bg: "#f3f4f6", border: "#e5e7eb", dot: "#9ca3af", label: str, temp: "—", fda: false };
}

function parseMaterials(str) {
  if (!str) return [];
  return str.split(/\s*[\/,]\s*/).map(s => s.trim()).filter(Boolean)
    .filter((v, i, a) => a.indexOf(v) === i);
}

export default function BucketStyleDetail({ rec, onBack, onClose }) {
  const materials = parseMaterials(rec.material);
  const [activeMat, setActiveMat] = useState(materials[0] || "");
  const [rfqSize, setRfqSize] = useState(null);

  let sizes = [];
  try { sizes = rec.bucket_sizes_detail ? JSON.parse(rec.bucket_sizes_detail) : []; } catch {}

  const md = getMat(activeMat);
  const isAg = (rec.application || "").toLowerCase().includes("ag");

  const COLS = [
    { key: "size", label: "Size", bold: true },
    { key: "part_number", label: "Part No." },
    { key: "length_in", label: 'Length (in)"' },
    { key: "projection_in", label: 'Projection (in)"' },
    { key: "depth_in", label: 'Depth (in)"' },
    { key: "capacity_cu_in", label: "Capacity (cu.in)" },
    { key: "weight_lbs", label: "Weight (lbs)" },
    { key: "water_level_capacity", label: "Water Level" },
    { key: "drilling_pattern", label: "Drilling" },
  ];
  const activeCols = COLS.filter(c => sizes.some(s => s[c.key] != null && s[c.key] !== ""));

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "24px clamp(12px,4vw,32px)" }}>
      {/* Back + header */}
      <button onClick={onBack} style={{ background: "#f1f5f9", border: "1px solid #e2e8f0", color: "#334155", borderRadius: 7, padding: "6px 14px", cursor: "pointer", fontSize: 12, fontWeight: 600, marginBottom: 18 }}>
        ← Back to Styles
      </button>

      {/* Style header card */}
      <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 14, padding: "20px 24px", marginBottom: 20 }}>
        <div style={{ display: "flex", gap: 16, alignItems: "flex-start", flexWrap: "wrap" }}>
          {(rec.image_url || rec.schematic_image) && (
            <div style={{ width: 90, height: 72, background: "#f8fafc", border: "1px solid #e5e7eb", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <img src={rec.image_url || rec.schematic_image} alt={rec.series}
                style={{ maxWidth: 80, maxHeight: 64, objectFit: "contain" }}
                onError={e => e.target.parentElement.style.display = "none"} />
            </div>
          )}
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
              <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 99, background: isAg ? "#d1fae5" : "#dbeafe", color: isAg ? "#065f46" : "#1d4ed8" }}>{rec.application || "General"}</span>
              {rec.vendor && <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 99, background: "#f3f4f6", color: "#374151" }}>{rec.vendor}</span>}
              {rec.discharge_type && <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 99, background: "#f3f4f6", color: "#6b7280" }}>{rec.discharge_type}</span>}
            </div>
            <div style={{ fontSize: 22, fontWeight: 900, color: NAVY, marginBottom: 4 }}>{rec.series}</div>
            {rec.style && <div style={{ fontSize: 13, color: "#6b7280", marginBottom: 8 }}>{rec.style}</div>}
            {rec.notes && <div style={{ fontSize: 12, color: "#374151", background: "#f8fafc", borderLeft: `3px solid ${AMBER}`, borderRadius: 4, padding: "8px 12px", lineHeight: 1.6 }}>{rec.notes}</div>}
          </div>
        </div>
      </div>

      {/* Material toggle */}
      {materials.length > 0 && (
        <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: "16px 20px", marginBottom: 20 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>Select Material</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {materials.map(m => {
              const d = getMat(m);
              const active = activeMat === m;
              return (
                <button key={m} onClick={() => setActiveMat(m)}
                  style={{ padding: "8px 16px", borderRadius: 99, cursor: "pointer", transition: "all 0.15s", border: active ? `2px solid ${d.color}` : "2px solid #e5e7eb", background: active ? d.bg : "#f9fafb", color: active ? d.color : "#374151", fontWeight: active ? 800 : 600, fontSize: 13 }}>
                  <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", background: d.dot, marginRight: 7, verticalAlign: "middle" }} />
                  {d.label || m}
                  {d.fda && <span style={{ marginLeft: 6, fontSize: 9, fontWeight: 700, color: "#065f46", background: "#d1fae5", borderRadius: 99, padding: "1px 6px" }}>FDA</span>}
                </button>
              );
            })}
          </div>
          {activeMat && (
            <div style={{ marginTop: 10, display: "flex", gap: 14, flexWrap: "wrap", fontSize: 12, color: "#6b7280" }}>
              <span>Temp: <b style={{ color: NAVY }}>{md.temp}</b></span>
              <span>FDA: <b style={{ color: md.fda ? "#065f46" : "#dc2626" }}>{md.fda ? "✓ Approved" : "✗ Not approved"}</b></span>
            </div>
          )}
        </div>
      )}

      {/* Size spec table */}
      {sizes.length > 0 ? (
        <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, overflow: "hidden", marginBottom: 20 }}>
          <div style={{ padding: "14px 20px", borderBottom: "1px solid #f3f4f6", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 800, color: NAVY }}>Available Sizes</div>
              <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 2 }}>Click "Add to RFQ" to specify quantity and drilling preference</div>
            </div>
            <div style={{ fontSize: 12, color: "#9ca3af" }}>{sizes.length} sizes</div>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
              <thead>
                <tr style={{ background: NAVY }}>
                  {activeCols.map(c => (
                    <th key={c.key} style={{ padding: "10px 12px", color: "#fff", fontWeight: 700, textAlign: "left", whiteSpace: "nowrap" }}>{c.label}</th>
                  ))}
                  <th style={{ padding: "10px 12px", color: "#fff", fontWeight: 700, whiteSpace: "nowrap" }}>RFQ</th>
                </tr>
              </thead>
              <tbody>
                {sizes.map((s, i) => (
                  <tr key={i} style={{ background: i % 2 === 0 ? "#f8fafc" : "#fff", borderBottom: "1px solid #f3f4f6" }}
                    onMouseEnter={e => e.currentTarget.style.background = "#fef3c7"}
                    onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? "#f8fafc" : "#fff"}>
                    {activeCols.map(c => (
                      <td key={c.key} style={{ padding: "9px 12px", color: c.bold ? NAVY : "#374151", fontWeight: c.bold ? 800 : 500, whiteSpace: "nowrap" }}>
                        {s[c.key] != null ? String(s[c.key]) : "—"}
                      </td>
                    ))}
                    <td style={{ padding: "8px 12px", whiteSpace: "nowrap" }}>
                      <button onClick={() => setRfqSize(s)}
                        style={{ padding: "5px 12px", borderRadius: 6, border: "1px solid #2563eb", background: "#eff6ff", color: "#2563eb", fontSize: 11, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap", transition: "all 0.12s" }}
                        onMouseEnter={e => { e.currentTarget.style.background = "#2563eb"; e.currentTarget.style.color = "#fff"; }}
                        onMouseLeave={e => { e.currentTarget.style.background = "#eff6ff"; e.currentTarget.style.color = "#2563eb"; }}>
                        + RFQ
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: "32px 24px", textAlign: "center", color: "#9ca3af", marginBottom: 20 }}>
          <div style={{ fontSize: 32, marginBottom: 10 }}>📋</div>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 6 }}>Size data not yet available in catalog</div>
          <div style={{ fontSize: 12 }}>Contact Uniking to request sizing specifications for this style.</div>
          <button onClick={() => {
            const cart = JSON.parse(localStorage.getItem("uniking_rfq_cart") || "[]");
            cart.push({ id: `bucket-${rec.id}-${Date.now()}`, type: "Elevator Bucket", series: rec.series, style: rec.style, vendor: rec.vendor, application: rec.application, material: activeMat, notes: "Size TBD — please contact for sizing options", qty: 1, drillingType: "standard" });
            localStorage.setItem("uniking_rfq_cart", JSON.stringify(cart));
            window.dispatchEvent(new Event("rfq_cart_updated"));
          }}
            style={{ marginTop: 14, padding: "10px 22px", borderRadius: 8, border: "none", background: NAVY, color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
            Request Quote for {rec.series}
          </button>
        </div>
      )}

      {/* Hole pattern RFQ modal */}
      {rfqSize && (
        <HolePatternModal
          rec={rec}
          size={rfqSize}
          material={activeMat}
          onClose={() => setRfqSize(null)}
          onAdded={() => setRfqSize(null)}
        />
      )}
    </div>
  );
}