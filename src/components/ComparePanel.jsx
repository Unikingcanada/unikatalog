import { useState } from "react";

const C = {
  navy: "#0F2340", navyMid: "#1A3A5C", navyLight: "#2A5080",
  gold: "#C9A84C", border: "#e2e8f0", muted: "#64748b", bg: "#f8fafc", text: "#0f172a",
};

function CompareTable({ products, onClose }) {
  // Gather all unique spec keys from all products
  const allKeys = [];
  const seen = new Set();
  for (const p of products) {
    for (const k of Object.keys(p.specs || {})) {
      if (!seen.has(k)) { seen.add(k); allKeys.push(k); }
    }
  }

  // Base fields to always show
  const baseFields = [
    { key: "_type", label: "Type" },
    { key: "_brand", label: "Brand" },
    { key: "_series", label: "Series / Model" },
    { key: "_style", label: "Style / Category" },
    { key: "_materials", label: "Materials" },
    { key: "_application", label: "Application" },
    { key: "_duty", label: "Duty" },
  ];

  function getBaseVal(p, key) {
    const map = {
      _type: p.type, _brand: p.brand, _series: p.series,
      _style: p.style !== p.series ? p.style : null,
      _materials: p.materials || p.material,
      _application: p.application, _duty: p.duty,
    };
    return map[key] || null;
  }

  // Check if a row has any non-null value
  function rowHasData(values) {
    return values.some(v => v != null && v !== "" && v !== "N/A" && String(v) !== "undefined");
  }

  const specRows = allKeys
    .map(k => ({ key: k, values: products.map(p => p.specs?.[k]) }))
    .filter(r => rowHasData(r.values));

  const baseRows = baseFields
    .map(f => ({ key: f.key, label: f.label, values: products.map(p => getBaseVal(p, f.key)) }))
    .filter(r => rowHasData(r.values));

  // Highlight rows where values differ
  function isDifferent(values) {
    const cleaned = values.map(v => (v == null || v === "" || v === "N/A") ? null : String(v));
    const nonNull = cleaned.filter(Boolean);
    if (nonNull.length < 2) return false;
    return new Set(nonNull).size > 1;
  }

  const COL_MIN = 200;
  const cols = products.length;

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.65)", zIndex: 2000, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-start", padding: "16px", overflowY: "auto" }}>
      <div style={{ background: "#fff", borderRadius: 14, width: "100%", maxWidth: 1100, boxShadow: "0 24px 80px rgba(0,0,0,0.3)", marginBottom: 16 }} onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div style={{ background: C.navy, borderRadius: "14px 14px 0 0", padding: "18px 24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ color: C.gold, fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", marginBottom: 4 }}>Side-by-Side Comparison</div>
            <div style={{ color: "#fff", fontSize: 17, fontWeight: 800 }}>{cols} Products Selected</div>
          </div>
          <button onClick={onClose} style={{ background: "rgba(255,255,255,0.15)", border: "none", color: "#fff", width: 34, height: 34, borderRadius: "50%", cursor: "pointer", fontSize: 18 }}>×</button>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: cols * COL_MIN + 180 }}>
            <thead>
              <tr style={{ background: "#f8fafc", borderBottom: "2px solid " + C.border }}>
                <th style={{ padding: "14px 16px", textAlign: "left", fontSize: 11, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: "0.6px", width: 160, minWidth: 140 }}>Specification</th>
                {products.map((p, i) => (
                  <th key={i} style={{ padding: "14px 16px", textAlign: "left", minWidth: COL_MIN, borderLeft: "1px solid " + C.border }}>
                    {p.image_url && (
                      <img src={p.image_url} alt="" style={{ height: 48, maxWidth: "100%", objectFit: "contain", display: "block", marginBottom: 8, borderRadius: 4 }} onError={e => e.target.style.display = "none"} />
                    )}
                    <div style={{ fontSize: 14, fontWeight: 800, color: C.text, lineHeight: 1.3 }}>{p.series}</div>
                    {p.type && <div style={{ fontSize: 10, color: C.muted, marginTop: 3, fontWeight: 600 }}>{p.type}</div>}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* Base rows */}
              {baseRows.map((row, ri) => {
                const diff = isDifferent(row.values);
                return (
                  <tr key={row.key} style={{ background: diff ? "#fffbeb" : ri % 2 === 0 ? "#fff" : "#f8fafc", borderBottom: "1px solid " + C.border }}>
                    <td style={{ padding: "9px 16px", fontSize: 12, color: C.muted, fontWeight: 600 }}>
                      {diff && <span style={{ marginRight: 5, fontSize: 10 }}>⚡</span>}
                      {row.label}
                    </td>
                    {row.values.map((v, ci) => (
                      <td key={ci} style={{ padding: "9px 16px", fontSize: 13, color: v ? C.text : "#cbd5e1", borderLeft: "1px solid " + C.border, fontWeight: diff && v ? 600 : 400 }}>
                        {v ? String(v) : "—"}
                      </td>
                    ))}
                  </tr>
                );
              })}

              {/* Spec rows */}
              {specRows.length > 0 && (
                <tr>
                  <td colSpan={cols + 1} style={{ padding: "8px 16px", background: C.navyMid, fontSize: 10, fontWeight: 800, color: "rgba(255,255,255,0.7)", textTransform: "uppercase", letterSpacing: "0.8px" }}>
                    Detailed Specifications
                  </td>
                </tr>
              )}
              {specRows.map((row, ri) => {
                const diff = isDifferent(row.values);
                return (
                  <tr key={row.key} style={{ background: diff ? "#fffbeb" : ri % 2 === 0 ? "#fff" : "#f8fafc", borderBottom: "1px solid " + C.border }}>
                    <td style={{ padding: "9px 16px", fontSize: 12, color: C.muted, fontWeight: 600 }}>
                      {diff && <span style={{ marginRight: 5, fontSize: 10 }}>⚡</span>}
                      {row.key}
                    </td>
                    {row.values.map((v, ci) => (
                      <td key={ci} style={{ padding: "9px 16px", fontSize: 13, color: (v != null && v !== "" && v !== "N/A") ? C.text : "#cbd5e1", borderLeft: "1px solid " + C.border, fontWeight: diff && v ? 600 : 400 }}>
                        {(v != null && v !== "" && v !== "N/A") ? String(v) : "—"}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div style={{ padding: "14px 24px", borderTop: "1px solid " + C.border, background: "#f8fafc", borderRadius: "0 0 14px 14px", display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 11, color: C.muted }}>⚡ = values differ between products</span>
          <button onClick={onClose} style={{ marginLeft: "auto", padding: "8px 20px", background: C.navy, color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 700, fontSize: 13 }}>Close</button>
        </div>
      </div>
    </div>
  );
}

// Floating compare bar — shows when 2+ products selected
export function CompareBar({ selected, onCompare, onClear, onRemove }) {
  if (selected.length === 0) return null;
  return (
    <div style={{
      position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 1500,
      background: C.navy, borderTop: "3px solid " + C.gold,
      padding: "12px 24px", display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap",
      boxShadow: "0 -4px 20px rgba(0,0,0,0.3)"
    }}>
      <div style={{ color: C.gold, fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px", flexShrink: 0 }}>
        Compare ({selected.length}/4)
      </div>
      <div style={{ display: "flex", gap: 8, flex: 1, flexWrap: "wrap", minWidth: 0 }}>
        {selected.map((p, i) => (
          <div key={p.id + i} style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,0.1)", borderRadius: 20, padding: "4px 10px 4px 8px" }}>
            {p.image_url && (
              <img src={p.image_url} alt="" style={{ width: 20, height: 20, objectFit: "contain", borderRadius: 2 }} onError={e => e.target.style.display = "none"} />
            )}
            <span style={{ color: "#fff", fontSize: 12, fontWeight: 600, maxWidth: 140, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.series}</span>
            <button onClick={() => onRemove(p.id)} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.5)", cursor: "pointer", fontSize: 14, lineHeight: 1, padding: 0, flexShrink: 0 }}>×</button>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
        <button onClick={onClear} style={{ padding: "7px 14px", background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 7, color: "#fff", cursor: "pointer", fontSize: 12, fontWeight: 600 }}>
          Clear
        </button>
        <button onClick={onCompare} disabled={selected.length < 2}
          style={{ padding: "7px 18px", background: selected.length >= 2 ? C.gold : "rgba(255,255,255,0.1)", border: "none", borderRadius: 7, color: selected.length >= 2 ? C.navy : "rgba(255,255,255,0.4)", cursor: selected.length >= 2 ? "pointer" : "default", fontSize: 13, fontWeight: 800 }}>
          Compare {selected.length >= 2 ? "→" : "(select 2+)"}
        </button>
      </div>
    </div>
  );
}

export default function ComparePanel({ products, onClose }) {
  return <CompareTable products={products} onClose={onClose} />;
}