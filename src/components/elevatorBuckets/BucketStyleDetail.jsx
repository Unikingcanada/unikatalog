// Full style detail — material toggle, spec table, compare, RFQ modal
import { useState, useMemo, useEffect } from "react";
import HolePatternModal from "./HolePatternModal";
import { addCompareItem, removeCompareItem, isInCompare, buildCompareItem, getCompareItems } from "@/lib/bucketCompareState";

const NAVY = "#1a3a5c";
const AMBER = "#b45309";

const MAT_STYLES = {
  "Polyethylene": { color: "#1d4ed8", bg: "#dbeafe", border: "#bfdbfe", dot: "#3b82f6", label: "Polyethylene (HDPE)", temp: "-120°F to 180°F", fda: true },
  "Nylon":        { color: "#374151", bg: "#f3f4f6", border: "#d1d5db", dot: "#9ca3af", label: "Nylon", temp: "-60°F to 300°F", fda: false },
  "Urethane":     { color: "#b45309", bg: "#fef3c7", border: "#fde68a", dot: "#f59e0b", label: "Urethane", temp: "-60°F to 180°F", fda: true },
  "Carbon Steel": { color: "#374151", bg: "#e5e7eb", border: "#d1d5db", dot: "#6b7280", label: "Carbon Steel", temp: "High Temp", fda: false },
  "Mild Steel":   { color: "#374151", bg: "#e5e7eb", border: "#d1d5db", dot: "#6b7280", label: "Mild Steel", temp: "High Temp", fda: false },
  "Stainless Steel": { color: "#1e3a8a", bg: "#e0e7ff", border: "#a5b4fc", dot: "#6366f1", label: "Stainless Steel", temp: "High Temp", fda: true },
  "Ductile Iron": { color: "#92400e", bg: "#fde8d8", border: "#fcd9bd", dot: "#c2410c", label: "Ductile Iron", temp: "Up to 800°F", fda: false },
  "Aluminum":     { color: "#0369a1", bg: "#e0f2fe", border: "#7dd3fc", dot: "#0ea5e9", label: "Aluminum", temp: "Up to 400°F", fda: false },
  "Nylathane":    { color: "#0f766e", bg: "#ccfbf1", border: "#5eead4", dot: "#14b8a6", label: "Nylathane™", temp: "-40°F to 284°F", fda: true },
  "Nyrim":        { color: "#6d28d9", bg: "#ede9fe", border: "#c4b5fd", dot: "#8b5cf6", label: "Nyrim", temp: "-60°F to 300°F", fda: false },
};

function getMat(str) {
  if (!str) return { color: NAVY, bg: "#f3f4f6", border: "#e5e7eb", dot: "#9ca3af", label: str || "", temp: "—", fda: false };
  for (const [k, v] of Object.entries(MAT_STYLES)) {
    if (str.toLowerCase().includes(k.toLowerCase())) return { key: str, ...v };
  }
  return { key: str, color: NAVY, bg: "#f3f4f6", border: "#e5e7eb", dot: "#9ca3af", label: str, temp: "—", fda: false };
}

function parseMaterials(rec) {
  if (rec.materials && Array.isArray(rec.materials) && rec.materials.length > 0) return rec.materials;
  if (!rec.material) return [];
  return rec.material.split(/\s*[\/,]\s*/).map(s => s.trim()).filter(Boolean).filter((v, i, a) => a.indexOf(v) === i);
}

// SVG bucket schematic placeholder
function BucketSchematic() {
  return (
    <svg viewBox="0 0 220 160" width="100%" style={{ maxWidth: 220, display: "block" }} xmlns="http://www.w3.org/2000/svg">
      <rect x="20" y="20" width="180" height="120" rx="6" fill="#f1f5f9" stroke="#cbd5e1" strokeWidth="1.5"/>
      <rect x="40" y="4" width="140" height="22" rx="4" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="1.5"/>
      <line x1="20" y1="80" x2="200" y2="80" stroke="#94a3b8" strokeWidth="1" strokeDasharray="4 3"/>
      {/* Hole dots */}
      <circle cx="70" cy="50" r="5" fill="#fff" stroke="#64748b" strokeWidth="1.5"/>
      <circle cx="150" cy="50" r="5" fill="#fff" stroke="#64748b" strokeWidth="1.5"/>
      {/* Dimension labels */}
      <text x="110" y="100" textAnchor="middle" fontSize="9" fill="#94a3b8" fontFamily="Arial">A = Length</text>
      <text x="205" y="55" textAnchor="start" fontSize="8" fill="#0369a1" fontFamily="Arial">B</text>
      <text x="205" y="105" textAnchor="start" fontSize="8" fill="#0369a1" fontFamily="Arial">C</text>
      <text x="110" y="150" textAnchor="middle" fontSize="8" fill="#94a3b8" fontFamily="Arial">D = Depth · E = C/C Holes</text>
      {/* Arrows */}
      <line x1="20" y1="145" x2="200" y2="145" stroke="#94a3b8" strokeWidth="1" markerEnd="url(#arr)"/>
      <defs>
        <marker id="arr" markerWidth="5" markerHeight="5" refX="4" refY="2.5" orient="auto">
          <path d="M0,0 L5,2.5 L0,5 Z" fill="#94a3b8"/>
        </marker>
      </defs>
    </svg>
  );
}

export default function BucketStyleDetail({ rec, onBack }) {
  const materials = parseMaterials(rec);
  const [activeMat, setActiveMat] = useState(materials[0] || "");
  const [rfqSize, setRfqSize] = useState(null);
  const [compareSet, setCompareSet] = useState(new Set());
  const [compareItems, setCompareItems] = useState(() => getCompareItems());
  const [maxWarning, setMaxWarning] = useState(false);

  // Sync compare state from global storage
  useEffect(() => {
    const h = () => setCompareItems(getCompareItems());
    window.addEventListener("bucket_compare_updated", h);
    return () => window.removeEventListener("bucket_compare_updated", h);
  }, []);

  const sizesByMaterial = useMemo(() => {
    try { return rec.sizes_by_material ? JSON.parse(rec.sizes_by_material) : null; } catch { return null; }
  }, [rec]);

  const baseSizes = useMemo(() => {
    if (sizesByMaterial) {
      const firstMat = materials[0] || Object.keys(sizesByMaterial)[0];
      return sizesByMaterial[firstMat] || Object.values(sizesByMaterial)[0] || [];
    }
    try { return rec.bucket_sizes_detail ? JSON.parse(rec.bucket_sizes_detail) : []; } catch { return []; }
  }, [sizesByMaterial, rec, materials]);

  const weightMap = useMemo(() => {
    if (!sizesByMaterial || !activeMat) return {};
    const matSizes = sizesByMaterial[activeMat] || [];
    const map = {};
    matSizes.forEach(s => { map[s.sizeNominal || s.size] = s.weightLbs || s.weight_lbs; });
    return map;
  }, [sizesByMaterial, activeMat]);

  const md = getMat(activeMat);
  const isPending = rec.specs_status === "pending";
  const isAg = (rec.category || rec.application || "").toLowerCase().includes("ag");

  // Determine which columns have any data
  const COL_DEFS = [
    { key: "sizeNominal", label: "Size", bold: true, fallback: "size" },
    { key: "sizeMetric", label: "Metric (mm)", fallback: null },
    { key: "lengthIn", label: 'Length"', fallback: "length_in" },
    { key: "projectionIn", label: 'Projection"', fallback: "projection_in" },
    { key: "depthIn", label: 'Depth"', fallback: "depth_in" },
    { key: "thicknessIn", label: 'Thickness"', fallback: null },
    { key: "capacityWL_cuIn", label: "Cap WL (cu.in)", fallback: "capacity_cu_in" },
    { key: "capacityWLplus10", label: "WL+10% (cu.in)", fallback: null },
    { key: "minSpacingIn", label: "Min Spacing", fallback: "std_spacing_in" },
    { key: "numHoles", label: "# Holes", fallback: "holes" },
    { key: "boltDiameterIn", label: "Bolt Dia", fallback: "bolt_size" },
    { key: "holeCenterToCenter", label: "Hole C/C", fallback: null },
    { key: "holeDistFromTop", label: "From Top", fallback: null },
    { key: "drillingPattern", label: "Drilling", fallback: "drilling_pattern" },
  ];

  const activeCols = COL_DEFS.filter(c =>
    baseSizes.some(s => {
      const v = s[c.key] ?? (c.fallback ? s[c.fallback] : undefined);
      return v != null && v !== "";
    })
  );

  function getCell(col, size) {
    const v = size[col.key] ?? (col.fallback ? size[col.fallback] : undefined);
    return v != null && v !== "" ? String(v) : "—";
  }

  function toggleCompare(sizeNominal) {
    setCompareSet(prev => {
      const next = new Set(prev);
      if (next.has(sizeNominal)) next.delete(sizeNominal);
      else next.add(sizeNominal);
      return next;
    });
  }

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
      weightLbs: weightMap[size.sizeNominal || size.size] || size.weightLbs || size.weight_lbs,
    };
  }

  // Compare sticky bar
  const compareArr = baseSizes.filter(s => compareSet.has(s.sizeNominal || s.size));

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "24px clamp(12px,4vw,32px)", paddingBottom: (compareSet.size > 0 || compareItems.length > 0) ? 100 : 32 }}>
      {/* Back + Breadcrumb */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
        <button onClick={onBack} className="uk-btn-back">← Back</button>
        <div style={{ fontSize: 12, color: "#9ca3af", display: "flex", gap: 4, flexWrap: "wrap" }}>
          <span>Elevator Buckets</span>
          <span>›</span>
          <span>{rec.supplier || rec.vendor}</span>
          <span>›</span>
          <span>{isAg ? "Agricultural" : "Industrial"}</span>
          <span>›</span>
          <span style={{ color: NAVY, fontWeight: 600 }}>{rec.styleName || rec.series}</span>
        </div>
      </div>

      {/* Header card */}
      <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 14, padding: "20px 24px", marginBottom: 20 }}>
        <div style={{ display: "flex", gap: 18, alignItems: "flex-start", flexWrap: "wrap" }}>
          {/* Image or schematic */}
          <div style={{ width: 110, height: 88, background: "#f8fafc", border: "1px solid #e5e7eb", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, overflow: "hidden" }}>
            {rec.image_url ? (
              <img src={rec.image_url} alt={rec.series}
                style={{ maxWidth: 98, maxHeight: 78, objectFit: "contain" }}
                onError={e => { e.target.style.display = "none"; }} />
            ) : (
              <BucketSchematic />
            )}
          </div>
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
              <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 99, background: isAg ? "#d1fae5" : "#dbeafe", color: isAg ? "#065f46" : "#1d4ed8" }}>
                {rec.category || (isAg ? "Agricultural" : "Industrial")}
              </span>
              {rec.supplier && <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 99, background: "#f3f4f6", color: "#374151" }}>{rec.supplier || rec.vendor}</span>}
              {rec.discharge_type && <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 99, background: "#f3f4f6", color: "#6b7280" }}>{rec.discharge_type}</span>}
              {rec.duty && <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 99, background: "#fef3c7", color: "#b45309" }}>{rec.duty}</span>}
            </div>
            <div style={{ fontSize: 22, fontWeight: 900, color: NAVY, marginBottom: 6 }}>{rec.styleName || rec.series}</div>
            {rec.application && <div style={{ fontSize: 13, color: "#6b7280", lineHeight: 1.55, marginBottom: 8 }}>{rec.application}</div>}
            {rec.standardHoleNotes && (
              <div style={{ fontSize: 12, color: "#374151", background: "#fff8ed", borderLeft: `3px solid ${AMBER}`, borderRadius: 4, padding: "8px 12px", lineHeight: 1.6 }}>{rec.standardHoleNotes}</div>
            )}
            {rec.notes && !rec.standardHoleNotes && (
              <div style={{ fontSize: 12, color: "#374151", background: "#f8fafc", borderLeft: `3px solid #94a3b8`, borderRadius: 4, padding: "8px 12px", lineHeight: 1.6 }}>{rec.notes}</div>
            )}
          </div>
        </div>
      </div>

      {/* Material toggle */}
      {materials.length > 0 && (
        <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: "16px 20px", marginBottom: 20 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>Material — click to filter weights</div>
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
              <span>FDA approved: <b style={{ color: md.fda ? "#065f46" : "#dc2626" }}>{md.fda ? "Yes" : "No"}</b></span>
              {sizesByMaterial && <span style={{ fontSize: 11, color: "#9ca3af" }}>· Weight column updates per material</span>}
            </div>
          )}
          {/* Capacity note */}
          <div style={{ marginTop: 10, fontSize: 11, color: "#6b7280", background: "#f8fafc", borderRadius: 6, padding: "7px 12px", lineHeight: 1.6 }}>
            <b>Note:</b> Capacity figures are at Water Level (WL). Usable capacity = WL + 10% for CC-style buckets. For Style AA: usable = gross × 0.75.
          </div>
        </div>
      )}

      {/* Cross-manufacturer compare hint */}
      {!isPending && baseSizes.length > 0 && (
        <div style={{ fontSize: 12, color: "#9ca3af", marginBottom: 12, fontStyle: "italic" }}>
          Want to compare this style against other manufacturers? Use the <b style={{ color: "#7c3aed" }}>Compare</b> buttons on any row below.
        </div>
      )}

      {/* Max compare warning */}
      {maxWarning && (
        <div style={{ background: "#fff7ed", border: "1px solid #fed7aa", borderRadius: 8, padding: "10px 16px", fontSize: 12, color: "#c2410c", fontWeight: 600, marginBottom: 12 }}>
          Maximum 6 buckets can be compared at once. Remove one to add another.
        </div>
      )}

      {/* Spec table or pending state */}
      {isPending ? (
        <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: "48px 24px", textAlign: "center", marginBottom: 20 }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>📋</div>
          <div style={{ fontSize: 15, fontWeight: 700, color: NAVY, marginBottom: 6 }}>Specifications Coming Soon</div>
          <div style={{ fontSize: 13, color: "#6b7280", maxWidth: 420, margin: "0 auto 20px", lineHeight: 1.6 }}>
            Full size data for this style is being verified from the manufacturer catalog. Contact Uniking for immediate specifications.
          </div>
          <button onClick={() => {
            const cart = JSON.parse(localStorage.getItem("uniking_rfq_cart") || "[]");
            cart.push({ id: `bucket-${rec.id}-${Date.now()}`, type: "Elevator Bucket", series: rec.styleName || rec.series, style: rec.style, supplier: rec.supplier || rec.vendor, material: activeMat, notes: "Size and specs TBD — please contact for specifications", qty: 1 });
            localStorage.setItem("uniking_rfq_cart", JSON.stringify(cart));
            window.dispatchEvent(new Event("rfq_cart_updated"));
            alert("Added to RFQ — Uniking will follow up with specifications.");
          }} style={{ padding: "10px 24px", borderRadius: 8, border: "none", background: NAVY, color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
            Request Quote for {rec.styleName || rec.series}
          </button>
        </div>
      ) : baseSizes.length > 0 ? (
        <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, overflow: "hidden", marginBottom: 20 }}>
          <div style={{ padding: "14px 20px", borderBottom: "1px solid #f3f4f6", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 800, color: NAVY }}>Available Sizes</div>
              <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 2 }}>
                {sizesByMaterial && activeMat ? `Weights shown for ${activeMat} · ` : ""}
                Click "+ RFQ" to specify drilling and add to quote
              </div>
            </div>
            <div style={{ fontSize: 12, color: "#9ca3af" }}>{baseSizes.length} sizes</div>
          </div>
          <div className="table-scroll">
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
              <thead>
                <tr style={{ background: NAVY }}>
                  {activeCols.map(c => (
                    <th key={c.key} style={{ padding: "10px 12px", color: "#fff", fontWeight: 700, textAlign: "left", whiteSpace: "nowrap", position: "sticky", top: 0 }}>{c.label}</th>
                  ))}
                  {sizesByMaterial && (
                    <th style={{ padding: "10px 12px", color: "#fbbf24", fontWeight: 700, whiteSpace: "nowrap" }}>Weight ({activeMat || "—"}) lbs</th>
                  )}
                  <th style={{ padding: "10px 12px", color: "#86efac", fontWeight: 700, whiteSpace: "nowrap" }}>+ Compare</th>
                  <th style={{ padding: "10px 12px", color: "#fff", fontWeight: 700, whiteSpace: "nowrap" }}>RFQ</th>
                </tr>
              </thead>
              <tbody>
                {baseSizes.map((size, i) => {
                  const nom = size.sizeNominal || size.size;
                  const inCompare = compareSet.has(nom);
                  return (
                    <tr key={i}
                      style={{ background: i % 2 === 0 ? "#f8fafc" : "#fff", borderBottom: "1px solid #f3f4f6" }}
                      onMouseEnter={e => e.currentTarget.style.background = "#fef3c7"}
                      onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? "#f8fafc" : "#fff"}>
                      {activeCols.map(c => (
                        <td key={c.key} style={{ padding: "9px 12px", color: c.bold ? NAVY : "#374151", fontWeight: c.bold ? 800 : 500, whiteSpace: "nowrap" }}>
                          {getCell(c, size)}
                        </td>
                      ))}
                      {sizesByMaterial && (
                        <td style={{ padding: "9px 12px", color: AMBER, fontWeight: 700, whiteSpace: "nowrap" }}>
                          {weightMap[nom] != null ? `${weightMap[nom]}` : "—"}
                        </td>
                      )}
                      <td style={{ padding: "8px 12px", whiteSpace: "nowrap" }}>
                        {(() => {
                          const compareItem = buildCompareItem(rec, size, activeMat);
                          const inGlobal = compareItems.some(ci => ci.id === compareItem.id);
                          return (
                            <button
                              onClick={() => {
                                if (inGlobal) {
                                  removeCompareItem(compareItem.id);
                                  setMaxWarning(false);
                                } else {
                                  const result = addCompareItem(compareItem);
                                  if (!result.ok) setMaxWarning(true);
                                  else setMaxWarning(false);
                                }
                              }}
                              style={{
                                padding: "5px 10px", borderRadius: 6, cursor: "pointer", fontSize: 11, fontWeight: 700, transition: "all 0.15s", whiteSpace: "nowrap",
                                border: inGlobal ? "none" : "1px solid #7c3aed",
                                background: inGlobal ? "#7c3aed" : "#faf5ff",
                                color: inGlobal ? "#fff" : "#7c3aed",
                              }}
                              onMouseEnter={e => { if (!inGlobal) { e.currentTarget.style.background = "#7c3aed"; e.currentTarget.style.color = "#fff"; }}}
                              onMouseLeave={e => { if (!inGlobal) { e.currentTarget.style.background = "#faf5ff"; e.currentTarget.style.color = "#7c3aed"; }}}>
                              {inGlobal ? "✓ In Compare" : "Compare"}
                            </button>
                          );
                        })()}
                      </td>
                      <td style={{ padding: "8px 12px", whiteSpace: "nowrap" }}>
                        <button onClick={() => setRfqSize(buildRFQSize(size))}
                          style={{ padding: "5px 12px", borderRadius: 6, border: "1px solid #2563eb", background: "#eff6ff", color: "#2563eb", fontSize: 11, fontWeight: 700, cursor: "pointer", transition: "all 0.12s" }}
                          onMouseEnter={e => { e.currentTarget.style.background = "#2563eb"; e.currentTarget.style.color = "#fff"; }}
                          onMouseLeave={e => { e.currentTarget.style.background = "#eff6ff"; e.currentTarget.style.color = "#2563eb"; }}>
                          + RFQ
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: "40px 24px", textAlign: "center", marginBottom: 20 }}>
          <div style={{ fontSize: 32, marginBottom: 10 }}>📋</div>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 6 }}>Size data not yet entered for this style</div>
          <button onClick={() => {
            const cart = JSON.parse(localStorage.getItem("uniking_rfq_cart") || "[]");
            cart.push({ id: `bucket-${rec.id}-${Date.now()}`, type: "Elevator Bucket", series: rec.styleName || rec.series, supplier: rec.supplier || rec.vendor, material: activeMat, notes: "Size TBD", qty: 1 });
            localStorage.setItem("uniking_rfq_cart", JSON.stringify(cart));
            window.dispatchEvent(new Event("rfq_cart_updated"));
          }} style={{ marginTop: 14, padding: "10px 22px", borderRadius: 8, border: "none", background: NAVY, color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
            Request Quote
          </button>
        </div>
      )}

      {/* Notes */}
      {rec.notes && (
        <div style={{ background: "#fff8ed", border: "1px solid #fde68a", borderRadius: 10, padding: "14px 18px", fontSize: 12, color: "#374151", lineHeight: 1.7, marginBottom: 20 }}>
          <b>Notes:</b> {rec.notes}
        </div>
      )}

      {/* RFQ modal */}
      {rfqSize && (
        <HolePatternModal
          rec={{ ...rec, series: rec.styleName || rec.series }}
          size={rfqSize}
          material={activeMat}
          onClose={() => setRfqSize(null)}
          onAdded={() => setRfqSize(null)}
        />
      )}

      {/* Compare sticky bar */}
      {compareSet.size >= 1 && (
        <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 200, background: "#1a1a2e", borderTop: "2px solid #7c3aed", padding: "12px 24px", display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <div style={{ flex: 1, display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: "#c4b5fd" }}>Compare Selected ({compareSet.size}):</span>
            {compareArr.map(s => (
              <span key={s.sizeNominal || s.size} style={{ fontSize: 11, background: "#ede9fe", color: "#7c3aed", padding: "3px 10px", borderRadius: 99, fontWeight: 600 }}>
                {s.sizeNominal || s.size}
              </span>
            ))}
          </div>
          <button onClick={() => setCompareSet(new Set())}
            style={{ padding: "7px 16px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.2)", background: "transparent", color: "#9ca3af", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
            Clear
          </button>
          <button onClick={() => {
            const html = buildCompareHTML(compareArr, rec, activeMat, weightMap, activeCols);
            const blob = new Blob([html], { type: "text/html" });
            window.open(URL.createObjectURL(blob), "_blank");
          }} style={{ padding: "7px 18px", borderRadius: 8, border: "none", background: "#7c3aed", color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
            Compare & Export →
          </button>
        </div>
      )}
    </div>
  );
}

function buildCompareHTML(sizes, rec, material, weightMap, activeCols) {
  const date = new Date().toLocaleDateString("en-CA", { year: "numeric", month: "long", day: "numeric" });
  const cols = [...activeCols, { key: "_weight", label: `Weight (${material}) lbs` }];
  return `<!DOCTYPE html><html><head><title>Compare — ${rec.styleName || rec.series}</title>
<style>
* { margin:0; padding:0; box-sizing:border-box; }
body { font-family:'Segoe UI',Arial,sans-serif; color:#111; background:#fff; }
.header { background:#0f2340; color:#fff; padding:20px 32px; display:flex; justify-content:space-between; align-items:center; }
.accent { height:4px; background:linear-gradient(90deg,#7c3aed,#1a3a5c); }
.body { padding:24px 32px; }
h2 { font-size:20px; font-weight:900; color:#0f2340; margin-bottom:4px; }
.sub { font-size:12px; color:#6b7280; margin-bottom:16px; }
table { width:100%; border-collapse:collapse; font-size:12px; }
thead tr { background:#0f2340; }
thead th { padding:9px 12px; color:#fff; font-weight:700; text-align:left; white-space:nowrap; }
tbody tr:nth-child(even) { background:#f8fafc; }
tbody td { padding:8px 12px; border-bottom:1px solid #e5e7eb; }
tbody td:first-child { font-weight:700; color:#1a3a5c; }
.footer { margin-top:20px; font-size:10px; color:#94a3b8; border-top:1px solid #e5e7eb; padding-top:12px; }
.no-print { margin:12px 32px; display:flex; gap:10px; }
@media print { .no-print { display:none!important; } }
.btn { padding:8px 16px; border:none; border-radius:6px; cursor:pointer; font-size:12px; font-weight:700; }
</style></head><body>
<div class="no-print">
  <button class="btn" style="background:#0f2340;color:#fff;" onclick="window.print()">Print / Save PDF</button>
  <button class="btn" style="background:#f1f5f9;color:#334155;border:1px solid #e2e8f0;" onclick="window.close()">Close</button>
</div>
<div class="header">
  <div>
    <img src="https://media.base44.com/images/public/69dd9ffccab4dd693d4d92f5/e48ee59d9_Unitingthestrongestlinks_20251031_225809_0000.png" style="max-height:28px;filter:brightness(0) invert(1);opacity:.9;" />
    <div style="margin-top:6px;font-size:13px;font-weight:700;color:#fff;">${rec.styleName || rec.series} — Size Comparison</div>
  </div>
  <div style="font-size:11px;color:rgba(255,255,255,.5);text-align:right;">
    <div>${rec.supplier || rec.vendor} · ${material}</div><div>${date}</div>
  </div>
</div>
<div class="accent"></div>
<div class="body">
  <h2>${rec.styleName || rec.series}</h2>
  <div class="sub">${material} · ${rec.application || ""}</div>
  <table>
    <thead><tr>${cols.map(c => `<th>${c.label}</th>`).join("")}</tr></thead>
    <tbody>
      ${sizes.map((s, i) => `<tr>${cols.map(c => {
        if (c.key === "_weight") return `<td>${weightMap[s.sizeNominal || s.size] != null ? weightMap[s.sizeNominal || s.size] + " lbs" : "—"}</td>`;
        const v = s[c.key] ?? (c.fallback ? s[c.fallback] : undefined);
        return `<td>${v != null && v !== "" ? v : "—"}</td>`;
      }).join("")}</tr>`).join("")}
    </tbody>
  </table>
  <div class="footer">Uniking Canada · unikingcanada.com · rfq@unikingcanada.com · No pricing included</div>
</div></body></html>`;
}