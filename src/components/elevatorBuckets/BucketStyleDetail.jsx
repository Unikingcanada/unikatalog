// Full style detail view — material toggle + size spec table with per-material weights + hole pattern modal
import { useState, useMemo } from "react";
import HolePatternModal from "./HolePatternModal";

const NAVY = "#1a3a5c";
const AMBER = "#b45309";

const MAT_DEF = {
  "Polyethylene": { color: "#c2410c", bg: "#fff7ed", border: "#fed7aa", dot: "#f97316", label: "Polyethylene (HDPE)", temp: "-60°F to +180°F", fda: true },
  "Poly": { color: "#c2410c", bg: "#fff7ed", border: "#fed7aa", dot: "#f97316", label: "Poly (HDPE)", temp: "-60°F to +180°F", fda: true },
  "Nylon": { color: "#92400e", bg: "#fef9c3", border: "#fde68a", dot: "#d97706", label: "Nylon", temp: "-60°F to +300°F", fda: false },
  "Urethane": { color: "#065f46", bg: "#d1fae5", border: "#6ee7b7", dot: "#10b981", label: "Urethane", temp: "-60°F to +180°F", fda: true },
  "FDA Nylon": { color: "#4338ca", bg: "#e0e7ff", border: "#a5b4fc", dot: "#6366f1", label: "FDA Nylon", temp: "-60°F to +300°F", fda: true },
  "Ductile Iron": { color: "#374151", bg: "#f1f5f9", border: "#cbd5e1", dot: "#64748b", label: "Ductile Iron", temp: "Up to 800°F", fda: false },
  "Mild Steel": { color: "#374151", bg: "#f1f5f9", border: "#cbd5e1", dot: "#64748b", label: "Mild Steel", temp: "High temp", fda: false },
  "Carbon Steel": { color: "#374151", bg: "#f1f5f9", border: "#cbd5e1", dot: "#475569", label: "Carbon Steel", temp: "High temp", fda: false },
  "Stainless Steel": { color: "#1e3a5f", bg: "#e0e7ff", border: "#93c5fd", dot: "#3b82f6", label: "Stainless Steel", temp: "High temp", fda: true },
  "Aluminum": { color: "#6b7280", bg: "#f3f4f6", border: "#d1d5db", dot: "#9ca3af", label: "Aluminum", temp: "Up to 400°F", fda: false },
  "Nylathane": { color: "#065f46", bg: "#d1fae5", border: "#6ee7b7", dot: "#10b981", label: "Nylathane", temp: "-60°F to +200°F", fda: true },
  "Nyrim": { color: "#4338ca", bg: "#e0e7ff", border: "#a5b4fc", dot: "#6366f1", label: "Nyrim/Nylon", temp: "-60°F to +300°F", fda: false },
};

function getMat(str) {
  if (!str) return { color: NAVY, bg: "#f3f4f6", border: "#e5e7eb", dot: "#9ca3af", label: str || "", temp: "—", fda: false };
  for (const [k, v] of Object.entries(MAT_DEF)) {
    if (str.toLowerCase().includes(k.toLowerCase())) return { key: str, ...v };
  }
  return { key: str, color: NAVY, bg: "#f3f4f6", border: "#e5e7eb", dot: "#9ca3af", label: str, temp: "—", fda: false };
}

function parseMaterialsArr(rec) {
  // Prefer the array field; fall back to parsing the string field
  if (rec.materials && Array.isArray(rec.materials) && rec.materials.length > 0) return rec.materials;
  if (!rec.material) return [];
  return rec.material.split(/\s*[\/,]\s*/).map(s => s.trim()).filter(Boolean).filter((v, i, a) => a.indexOf(v) === i);
}

export default function BucketStyleDetail({ rec, onBack }) {
  const materials = parseMaterialsArr(rec);
  const [activeMat, setActiveMat] = useState(materials[0] || "");
  const [rfqSize, setRfqSize] = useState(null);

  // Parse sizes_by_material (new structure) or fall back to bucket_sizes_detail (legacy)
  const sizesByMaterial = useMemo(() => {
    try { return rec.sizes_by_material ? JSON.parse(rec.sizes_by_material) : null; } catch { return null; }
  }, [rec]);

  // Get the base sizes (from first material or legacy field)
  const baseSizes = useMemo(() => {
    if (sizesByMaterial) {
      const firstMat = materials[0] || Object.keys(sizesByMaterial)[0];
      return sizesByMaterial[firstMat] || Object.values(sizesByMaterial)[0] || [];
    }
    try { return rec.bucket_sizes_detail ? JSON.parse(rec.bucket_sizes_detail) : []; } catch { return []; }
  }, [sizesByMaterial, rec, materials]);

  // Weight lookup for current material
  const weightMap = useMemo(() => {
    if (!sizesByMaterial || !activeMat) return {};
    const matSizes = sizesByMaterial[activeMat] || [];
    const map = {};
    matSizes.forEach(s => { map[s.sizeNominal] = s.weightLbs; });
    return map;
  }, [sizesByMaterial, activeMat]);

  const md = getMat(activeMat);
  const isAg = (rec.category || rec.application || "").toLowerCase().includes("ag");
  const isPending = rec.specs_status === "pending";

  // Determine which columns have data across all sizes
  const COLS = [
    { key: "sizeNominal", label: "Size", bold: true },
    { key: "sizeMetric", label: "Metric (mm)" },
    { key: "lengthIn", label: 'Length (in)"' },
    { key: "projectionIn", label: 'Projection (in)"' },
    { key: "depthIn", label: 'Depth (in)"' },
    { key: "thicknessIn", label: 'Thickness (in)"' },
    { key: "capacityWL_cuIn", label: "Cap. WL (cu.in)" },
    { key: "capacityWLplus10", label: "WL+10% (cu.in)" },
    { key: "_weight", label: "Weight (lbs)", dynamic: true },
    { key: "minSpacingIn", label: "Min Spacing (in)" },
    { key: "numHoles", label: "# Holes" },
    { key: "boltDiameterIn", label: "Bolt Dia." },
    { key: "holeCenterToCenter", label: "Hole C/C" },
    { key: "holeDistFromTop", label: "From Top" },
    { key: "drillingPattern", label: "Drilling" },
    // legacy fields
    { key: "size", label: "Size", bold: true },
    { key: "length_in", label: 'Length"' },
    { key: "projection_in", label: 'Projection"' },
    { key: "depth_in", label: 'Depth"' },
    { key: "capacity_cu_in", label: "Capacity (cu.in)" },
    { key: "weight_lbs", label: "Weight (lbs)" },
    { key: "drilling_pattern", label: "Drilling" },
  ];

  const activeCols = COLS.filter(c => {
    if (c.dynamic) return sizesByMaterial != null;
    if (c.key === "_weight") return false;
    return baseSizes.some(s => s[c.key] != null && s[c.key] !== "");
  });

  function getCellValue(col, size) {
    if (col.dynamic && col.key === "_weight") {
      const w = weightMap[size.sizeNominal];
      return w != null ? `${w}` : "—";
    }
    const v = size[col.key];
    return v != null && v !== "" ? String(v) : "—";
  }

  // Build a size object for the modal that works with both schema types
  function buildRFQSize(size) {
    return {
      size: size.sizeNominal || size.size,
      part_number: size.part_number || "",
      projection_in: size.projectionIn || size.projection_in,
      depth_in: size.depthIn || size.depth_in,
      length_in: size.lengthIn || size.length_in,
      holes: size.numHoles || size.holes,
      bolt_size: size.boltDiameterIn || size.bolt_size,
      std_spacing_in: size.minSpacingIn || size.std_spacing_in,
      drilling_pattern: size.drillingPattern || size.drilling_pattern,
      holeDistFromTop: size.holeDistFromTop,
      holeCenterToCenter: size.holeCenterToCenter,
      weightLbs: weightMap[size.sizeNominal] || size.weightLbs || size.weight_lbs,
    };
  }

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "24px clamp(12px,4vw,32px)" }}>
      <button onClick={onBack} style={{ background: "#f1f5f9", border: "1px solid #e2e8f0", color: "#334155", borderRadius: 7, padding: "6px 14px", cursor: "pointer", fontSize: 12, fontWeight: 600, marginBottom: 18 }}>
        ← Back to Styles
      </button>

      {/* Header card */}
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
              <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 99, background: isAg ? "#d1fae5" : "#dbeafe", color: isAg ? "#065f46" : "#1d4ed8" }}>
                {rec.category || (isAg ? "Agricultural" : "Industrial")}
              </span>
              {rec.supplier && <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 99, background: "#f3f4f6", color: "#374151" }}>{rec.supplier}</span>}
              {rec.discharge_type && <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 99, background: "#f3f4f6", color: "#6b7280" }}>{rec.discharge_type}</span>}
              {rec.duty && <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 99, background: "#fef3c7", color: "#b45309" }}>{rec.duty}</span>}
            </div>
            <div style={{ fontSize: 22, fontWeight: 900, color: NAVY, marginBottom: 4 }}>{rec.styleName || rec.series}</div>
            {rec.application && <div style={{ fontSize: 13, color: "#6b7280", marginBottom: 8, lineHeight: 1.5 }}>{rec.application}</div>}
            {rec.standardHoleNotes && <div style={{ fontSize: 12, color: "#374151", background: "#fff8ed", borderLeft: `3px solid ${AMBER}`, borderRadius: 4, padding: "8px 12px", lineHeight: 1.6 }}>{rec.standardHoleNotes}</div>}
            {rec.notes && !rec.standardHoleNotes && <div style={{ fontSize: 12, color: "#374151", background: "#f8fafc", borderLeft: `3px solid #94a3b8`, borderRadius: 4, padding: "8px 12px", lineHeight: 1.6 }}>{rec.notes}</div>}
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
              <span>Temp range: <b style={{ color: NAVY }}>{md.temp}</b></span>
              <span>FDA: <b style={{ color: md.fda ? "#065f46" : "#dc2626" }}>{md.fda ? "✓ Approved" : "✗ Not approved"}</b></span>
              {sizesByMaterial && <span style={{ fontSize: 11, color: "#9ca3af" }}>Weights update per material selection</span>}
            </div>
          )}
        </div>
      )}

      {/* Pending / specs coming soon */}
      {isPending ? (
        <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: "40px 24px", textAlign: "center", color: "#9ca3af", marginBottom: 20 }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>📋</div>
          <div style={{ fontSize: 15, fontWeight: 700, color: NAVY, marginBottom: 6 }}>Specifications Coming Soon</div>
          <div style={{ fontSize: 13, color: "#6b7280", maxWidth: 420, margin: "0 auto 20px", lineHeight: 1.6 }}>
            Full size data for this style is being added from the 4B catalog. Contact Uniking to request a quote or get specifications immediately.
          </div>
          <button onClick={() => {
            const cart = JSON.parse(localStorage.getItem("uniking_rfq_cart") || "[]");
            cart.push({ id: `bucket-${rec.id || Date.now()}-${Date.now()}`, type: "Elevator Bucket", series: rec.styleName || rec.series, style: rec.style, supplier: rec.supplier || rec.vendor, category: rec.category, application: rec.application, material: activeMat, notes: "Size and specs TBD \u2014 please contact for specifications", qty: 1, drillingType: "standard" });
            localStorage.setItem("uniking_rfq_cart", JSON.stringify(cart));
            window.dispatchEvent(new Event("rfq_cart_updated"));
            alert("Added to RFQ \u2014 Uniking will follow up with specifications.");
          }} style={{ padding: "10px 22px", borderRadius: 8, border: "none", background: NAVY, color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
            Request Quote for {rec.styleName || rec.series}
          </button>
        </div>
      ) : baseSizes.length > 0 ? (
        <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, overflow: "hidden", marginBottom: 20 }}>
          <div style={{ padding: "14px 20px", borderBottom: "1px solid #f3f4f6", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 800, color: NAVY }}>Available Sizes</div>
              <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 2 }}>
                {sizesByMaterial && activeMat ? `Showing weights for ${activeMat} · ` : ""}
                Click "+ RFQ" to specify quantity and drilling preference
              </div>
            </div>
            <div style={{ fontSize: 12, color: "#9ca3af" }}>{baseSizes.length} sizes</div>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
              <thead>
                <tr style={{ background: NAVY }}>
                  {activeCols.map(c => (
                    <th key={c.key} style={{ padding: "10px 12px", color: "#fff", fontWeight: 700, textAlign: "left", whiteSpace: "nowrap" }}>{c.label}</th>
                  ))}
                  {/* Dynamic weight column */}
                  {sizesByMaterial && (
                    <th style={{ padding: "10px 12px", color: "#f59e0b", fontWeight: 700, whiteSpace: "nowrap" }}>Weight (lbs)</th>
                  )}
                  <th style={{ padding: "10px 12px", color: "#fff", fontWeight: 700, whiteSpace: "nowrap" }}>RFQ</th>
                </tr>
              </thead>
              <tbody>
                {baseSizes.map((size, i) => (
                  <tr key={i} style={{ background: i % 2 === 0 ? "#f8fafc" : "#fff", borderBottom: "1px solid #f3f4f6" }}
                    onMouseEnter={e => e.currentTarget.style.background = "#fef3c7"}
                    onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? "#f8fafc" : "#fff"}>
                    {activeCols.map(c => (
                      <td key={c.key} style={{ padding: "9px 12px", color: c.bold ? NAVY : "#374151", fontWeight: c.bold ? 800 : 500, whiteSpace: "nowrap" }}>
                        {getCellValue(c, size)}
                      </td>
                    ))}
                    {sizesByMaterial && (
                      <td style={{ padding: "9px 12px", color: AMBER, fontWeight: 700, whiteSpace: "nowrap" }}>
                        {weightMap[size.sizeNominal] != null ? `${weightMap[size.sizeNominal]} lbs` : "—"}
                      </td>
                    )}
                    <td style={{ padding: "8px 12px", whiteSpace: "nowrap" }}>
                      <button onClick={() => setRfqSize(buildRFQSize(size))}
                        style={{ padding: "5px 12px", borderRadius: 6, border: "1px solid #2563eb", background: "#eff6ff", color: "#2563eb", fontSize: 11, fontWeight: 700, cursor: "pointer", transition: "all 0.12s" }}
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
          {/* Capacity note for industrial styles */}
          {(rec.notes || "").toLowerCase().includes("0.75") && (
            <div style={{ padding: "10px 20px", background: "#f8fafc", borderTop: "1px solid #f3f4f6", fontSize: 11, color: "#6b7280" }}>
              ⚠ Capacity WL+10% column shows usable capacity per Tapco spec (Gross × 0.75 for industrial AA/AC styles). Contact Uniking to confirm.
            </div>
          )}
        </div>
      ) : (
        <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: "32px 24px", textAlign: "center", color: "#9ca3af", marginBottom: 20 }}>
          <div style={{ fontSize: 32, marginBottom: 10 }}>📋</div>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 6 }}>Size data not yet entered for this style</div>
          <button onClick={() => {
            const cart = JSON.parse(localStorage.getItem("uniking_rfq_cart") || "[]");
            cart.push({ id: `bucket-${rec.id || Date.now()}-${Date.now()}`, type: "Elevator Bucket", series: rec.styleName || rec.series, style: rec.style, supplier: rec.supplier || rec.vendor, material: activeMat, notes: "Size TBD", qty: 1, drillingType: "standard" });
            localStorage.setItem("uniking_rfq_cart", JSON.stringify(cart));
            window.dispatchEvent(new Event("rfq_cart_updated"));
          }} style={{ marginTop: 14, padding: "10px 22px", borderRadius: 8, border: "none", background: NAVY, color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
            Request Quote for {rec.styleName || rec.series}
          </button>
        </div>
      )}

      {/* Notes */}
      {rec.notes && (
        <div style={{ background: "#fff8ed", border: "1px solid #fde68a", borderRadius: 10, padding: "14px 18px", fontSize: 12, color: "#374151", lineHeight: 1.7 }}>
          <b>Notes:</b> {rec.notes}
        </div>
      )}

      {/* Hole pattern RFQ modal */}
      {rfqSize && (
        <HolePatternModal
          rec={{ ...rec, series: rec.styleName || rec.series }}
          size={rfqSize}
          material={activeMat}
          onClose={() => setRfqSize(null)}
          onAdded={() => setRfqSize(null)}
        />
      )}
    </div>
  );
}