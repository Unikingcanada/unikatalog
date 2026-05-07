// /BucketCompare — Cross-manufacturer bucket comparison page
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getCompareItems, removeCompareItem, clearCompare } from "@/lib/bucketCompareState";
import AppLayout from "@/components/layout/AppLayout";

const NAVY = "#1a3a5c";
const SUP_COLOR = { "Maxi-Lift": "#b45309", "Tapco": "#1d4ed8", "4B": "#b91c1c" };
const SUP_BG    = { "Maxi-Lift": "#fffbeb", "Tapco": "#eff6ff",  "4B": "#fef2f2" };

const ROWS = [
  { key: "supplier",          label: "Supplier",                unit: "",        highlight: null },
  { key: "category",          label: "Category",                unit: "",        highlight: null },
  { key: "dischargeType",     label: "Discharge Type",          unit: "",        highlight: null },
  { key: "material",          label: "Material",                unit: "",        highlight: null },
  { key: "sizeNominal",       label: "Size (Nominal)",          unit: "in",      highlight: null },
  { key: "sizeMetric",        label: "Size (Metric)",           unit: "mm",      highlight: null },
  { key: "lengthIn",          label: "Length",                  unit: "in",      highlight: null },
  { key: "projectionIn",      label: "Projection",              unit: "in",      highlight: null },
  { key: "depthIn",           label: "Depth",                   unit: "in",      highlight: null },
  { key: "thicknessIn",       label: "Wall Thickness",          unit: "in",      highlight: null },
  { key: "capacityWL_cuIn",   label: "Capacity at Water Level", unit: "cu in",   highlight: "high" },
  { key: "capacityWLplus10",  label: "Capacity WL + 10%",       unit: "cu in",   highlight: "high" },
  { key: "weightLbs",         label: "Weight",                  unit: "lbs",     highlight: "low" },
  { key: "minSpacingIn",      label: "Minimum Belt Spacing",    unit: "in",      highlight: "low" },
  { key: "numHoles",          label: "Number of Bolt Holes",    unit: "",        highlight: null },
  { key: "boltDiameterIn",    label: "Bolt Diameter",           unit: "in",      highlight: null },
  { key: "holeCenterToCenter",label: "Hole Center-to-Center",   unit: "in",      highlight: null },
  { key: "holeDistFromTop",   label: "Distance from Top",       unit: "in",      highlight: null },
];

function fmt(v) {
  if (v == null || v === "") return "—";
  return String(v);
}

function computeHighlights(items, row) {
  if (!row.highlight) return {};
  const vals = items.map(item => {
    const v = item[row.key];
    return v != null && v !== "" ? parseFloat(v) : null;
  });
  const nums = vals.filter(v => v != null);
  if (nums.length < 2) return {};
  const best = row.highlight === "high" ? Math.max(...nums) : Math.min(...nums);
  const worst = row.highlight === "high" ? Math.min(...nums) : Math.max(...nums);
  const result = {};
  vals.forEach((v, i) => {
    if (v == null) return;
    if (v === best) result[i] = "best";
    if (v === worst && worst !== best) result[i] = "worst";
  });
  return result;
}

function isAllSame(items, key) {
  const vals = items.map(i => String(i[key] ?? "")).filter(Boolean);
  if (vals.length === 0) return true;
  return vals.every(v => v === vals[0]);
}

function exportComparison(items) {
  const date = new Date().toLocaleDateString("en-CA", { year: "numeric", month: "long", day: "numeric" });
  const logo = "https://media.base44.com/images/public/69dd9ffccab4dd693d4d92f5/e48ee59d9_Unitingthestrongestlinks_20251031_225809_0000.png";

  const colHeaders = items.map(item => `
    <th>
      <div class="sup-pill" style="background:${SUP_BG[item.supplier]||"#f3f4f6"};color:${SUP_COLOR[item.supplier]||NAVY}">${item.supplier}</div>
      <div class="col-style">${item.styleName}</div>
      <div class="col-size">${item.sizeNominal}${item.sizeMetric ? ` / ${item.sizeMetric}` : ""}</div>
      <div class="col-mat">${item.material}</div>
    </th>`).join("");

  const bodyRows = ROWS.map(row => {
    const cells = items.map(item => `<td>${fmt(item[row.key])}</td>`).join("");
    return `<tr><td class="row-label">${row.label}${row.unit ? `<span class="unit">${row.unit}</span>` : ""}</td>${cells}</tr>`;
  }).join("");

  const html = `<!DOCTYPE html><html><head><title>Bucket Comparison — UniKatalog</title>
<style>
*{margin:0;padding:0;box-sizing:border-box;}
body{font-family:'Segoe UI',Arial,sans-serif;color:#111;background:#fff;}
.header{background:#0f2340;color:#fff;padding:20px 32px;display:flex;justify-content:space-between;align-items:center;}
.accent{height:4px;background:linear-gradient(90deg,#2563eb,#1a3a5c);}
.body{padding:24px 32px;}
h2{font-size:20px;font-weight:900;color:#0f2340;margin-bottom:4px;}
.sub{font-size:12px;color:#6b7280;margin-bottom:20px;}
table{width:100%;border-collapse:collapse;font-size:11px;}
thead th{background:#0f2340;color:#fff;padding:10px 12px;text-align:center;border:1px solid #2563eb;}
thead th:first-child{text-align:left;}
.sup-pill{display:inline-block;padding:2px 8px;border-radius:99px;font-size:9px;font-weight:700;margin-bottom:3px;}
.col-style{font-size:12px;font-weight:700;color:#fff;margin-bottom:2px;}
.col-size{font-size:10px;color:rgba(255,255,255,0.7);}
.col-mat{font-size:9px;color:rgba(255,255,255,0.5);}
tbody tr:nth-child(even){background:#f8fafc;}
tbody td{padding:8px 12px;border:1px solid #e5e7eb;text-align:center;}
.row-label{text-align:left;font-weight:600;color:#1a3a5c;background:#f8fafc;white-space:nowrap;}
.unit{margin-left:4px;font-weight:400;font-size:9px;color:#94a3b8;}
.footer{margin-top:20px;font-size:10px;color:#94a3b8;border-top:1px solid #e5e7eb;padding-top:12px;}
.no-print{margin:12px 32px;display:flex;gap:10px;}
.btn{padding:8px 16px;border:none;border-radius:6px;cursor:pointer;font-size:12px;font-weight:700;}
@media print{.no-print{display:none!important;}}
</style></head><body>
<div class="no-print">
  <button class="btn" style="background:#0f2340;color:#fff;" onclick="window.print()">Print / Save PDF</button>
  <button class="btn" style="background:#f1f5f9;color:#334155;border:1px solid #e2e8f0;" onclick="window.close()">Close</button>
</div>
<div class="header">
  <div>
    <img src="${logo}" style="max-height:28px;filter:brightness(0) invert(1);opacity:.9;" />
    <div style="margin-top:6px;font-size:15px;font-weight:700;">Elevator Bucket Comparison</div>
  </div>
  <div style="font-size:11px;color:rgba(255,255,255,.5);text-align:right;">
    <div>Generated by UniKatalog</div><div>${date}</div>
  </div>
</div>
<div class="accent"></div>
<div class="body">
  <h2>Elevator Bucket Comparison</h2>
  <div class="sub">Generated ${date} — ${items.length} buckets compared · Uniking Canada</div>
  <table>
    <thead><tr><th>Specification</th>${colHeaders}</tr></thead>
    <tbody>${bodyRows}</tbody>
  </table>
  <div class="footer">UniKatalog — Uniking Canada · unikingcanada.com · rfq@unikingcanada.com · No pricing included. Confirm all specifications before supply.</div>
</div></body></html>`;

  const blob = new Blob([html], { type: "text/html" });
  window.open(URL.createObjectURL(blob), "_blank");
}

export default function BucketCompare() {
  const [items, setItems] = useState([]);
  const [highlightDiff, setHighlightDiff] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    setItems(getCompareItems());
    const h = () => setItems(getCompareItems());
    window.addEventListener("bucket_compare_updated", h);
    return () => window.removeEventListener("bucket_compare_updated", h);
  }, []);

  function handleRemove(id) {
    const next = removeCompareItem(id);
    setItems(next);
  }

  // Empty state
  if (items.length === 0) {
    return (
      <AppLayout onBack={() => navigate("/ElevatorBuckets")}>
        <div style={{ maxWidth: 700, margin: "80px auto", textAlign: "center", padding: "0 24px", fontFamily: "'Inter','Segoe UI',sans-serif" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>⚖️</div>
          <div style={{ fontSize: 22, fontWeight: 900, color: NAVY, marginBottom: 10 }}>No buckets selected for comparison yet</div>
          <div style={{ fontSize: 14, color: "#6b7280", lineHeight: 1.7, marginBottom: 28 }}>
            Browse the catalog and click <b>"Compare"</b> on any size row to get started. You can compare up to 6 buckets across any supplier, style, and material.
          </div>
          <button onClick={() => navigate("/ElevatorBuckets")}
            style={{ padding: "12px 28px", borderRadius: 10, border: "none", background: NAVY, color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
            Browse Buckets →
          </button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout onBack={() => navigate("/ElevatorBuckets")}>
      <div style={{ maxWidth: 1400, margin: "0 auto", padding: "24px clamp(12px,4vw,32px) 40px", fontFamily: "'Inter','Segoe UI',sans-serif" }}>

        {/* Page header */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 22, fontWeight: 900, color: NAVY }}>Bucket Comparison</div>
            <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 2 }}>{items.length} buckets selected — up to 6 supported</div>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
            {/* Highlight toggle */}
            <label style={{ display: "flex", alignItems: "center", gap: 7, cursor: "pointer", fontSize: 12, color: "#374151", fontWeight: 600 }}>
              <div onClick={() => setHighlightDiff(!highlightDiff)}
                style={{ width: 36, height: 20, borderRadius: 10, background: highlightDiff ? "#2563eb" : "#d1d5db", position: "relative", transition: "background 0.2s", cursor: "pointer", flexShrink: 0 }}>
                <div style={{ position: "absolute", top: 2, left: highlightDiff ? 18 : 2, width: 16, height: 16, borderRadius: "50%", background: "#fff", transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.3)" }} />
              </div>
              Highlight Differences
            </label>
            <button onClick={() => exportComparison(items)}
              style={{ padding: "8px 18px", borderRadius: 8, border: "none", background: NAVY, color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
              Export Comparison ↗
            </button>
            <button onClick={() => { clearCompare(); navigate("/ElevatorBuckets"); }}
              style={{ padding: "8px 14px", borderRadius: 8, border: "1px solid #e5e7eb", background: "#f8fafc", color: "#64748b", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
              Clear All
            </button>
          </div>
        </div>

        {/* Comparison table */}
        <div style={{ overflowX: "auto", borderRadius: 14, border: "1px solid #e5e7eb", background: "#fff" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12, tableLayout: "fixed" }}>
            <colgroup>
              <col style={{ width: 200 }} />
              {items.map((_, i) => <col key={i} style={{ width: 180 }} />)}
            </colgroup>
            <thead>
              <tr style={{ background: NAVY }}>
                <th style={{ padding: "12px 16px", color: "rgba(255,255,255,0.5)", fontWeight: 600, fontSize: 11, textAlign: "left", borderRight: "1px solid rgba(255,255,255,0.1)" }}>
                  SPECIFICATION
                </th>
                {items.map(item => {
                  const sc = SUP_COLOR[item.supplier] || NAVY;
                  const sb = SUP_BG[item.supplier] || "#f3f4f6";
                  return (
                    <th key={item.id} style={{ padding: "10px 12px", textAlign: "center", borderRight: "1px solid rgba(255,255,255,0.1)", verticalAlign: "top", position: "relative" }}>
                      <button onClick={() => handleRemove(item.id)}
                        style={{ position: "absolute", top: 6, right: 8, background: "rgba(255,255,255,0.12)", border: "none", color: "#94a3b8", borderRadius: 99, width: 20, height: 20, cursor: "pointer", fontSize: 13, lineHeight: 1 }}>×</button>
                      <span style={{ display: "inline-block", fontSize: 9, fontWeight: 700, padding: "2px 8px", borderRadius: 99, background: sb, color: sc, marginBottom: 5 }}>{item.supplier}</span>
                      <div style={{ fontSize: 13, fontWeight: 800, color: "#fff", marginBottom: 3 }}>{item.styleName}</div>
                      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.6)" }}>{item.sizeNominal}{item.sizeMetric ? ` / ${item.sizeMetric}` : ""}</div>
                      <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>{item.material}</div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {ROWS.map((row, ri) => {
                const highlights = computeHighlights(items, row);
                const allSame = isAllSame(items, row.key);
                const rowMuted = highlightDiff && allSame;

                return (
                  <tr key={row.key}
                    style={{ borderBottom: "1px solid #f1f5f9", background: rowMuted ? "#fafafa" : (ri % 2 === 0 ? "#fff" : "#f8fafc") }}>
                    <td style={{ padding: "10px 16px", fontWeight: 700, color: rowMuted ? "#9ca3af" : NAVY, fontSize: 12, borderRight: "1px solid #e5e7eb", whiteSpace: "nowrap" }}>
                      {row.label}
                      {row.unit && <span style={{ marginLeft: 5, fontSize: 10, fontWeight: 400, color: "#9ca3af" }}>{row.unit}</span>}
                    </td>
                    {items.map((item, ci) => {
                      const hl = highlights[ci];
                      let cellBg = "transparent";
                      let cellColor = rowMuted ? "#9ca3af" : "#374151";
                      if (hl === "best") { cellBg = "#dcfce7"; cellColor = "#15803d"; }
                      if (hl === "worst") { cellBg = "#fff7ed"; cellColor = "#c2410c"; }

                      return (
                        <td key={item.id} style={{ padding: "10px 12px", textAlign: "center", background: cellBg, color: cellColor, fontWeight: hl ? 700 : 500, fontSize: 12, borderRight: "1px solid #f1f5f9" }}>
                          {fmt(item[row.key])}
                          {row.unit && item[row.key] != null && item[row.key] !== "" && (
                            <span style={{ fontSize: 10, color: hl === "best" ? "#15803d" : hl === "worst" ? "#c2410c" : "#9ca3af", marginLeft: 3 }}>{row.unit}</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Add more hint */}
        {items.length < 6 && (
          <div style={{ marginTop: 16, padding: "14px 20px", background: "#f0f9ff", border: "1px solid #bae6fd", borderRadius: 10, fontSize: 13, color: "#0369a1" }}>
            <b>Add more buckets:</b> Navigate back to any supplier's spec table and click "Compare" on any size row to add it here. Up to {6 - items.length} more can be added.
          </div>
        )}
      </div>
    </AppLayout>
  );
}