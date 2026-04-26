import { useState, useEffect, useMemo } from "react";
import { CatalogProduct, UniCatalog, ElevatorBucket } from "@/api/entities";

const NAVY = "#1a3a5c";

const TYPE_META = {
  "Elevator Bucket":        { color: "#b45309", bg: "#fef3c7" },
  "Elevator Belt":          { color: "#7c3aed", bg: "#ede9fe" },
  "Hardware & Accessories": { color: "#92400e", bg: "#fef9c3" },
  "Modular Plastic Belt":   { color: "#065f46", bg: "#d1fae5" },
  "Wire Mesh Belt":         { color: "#1e40af", bg: "#dbeafe" },
  "Steel Hinged Belt":      { color: "#374151", bg: "#f3f4f6" },
  "Table Top Chain":        { color: "#0e7490", bg: "#cffafe" },
  "ANSI/BS Chain":          { color: "#4338ca", bg: "#e0e7ff" },
  "Cast Chain":             { color: "#7f1d1d", bg: "#fee2e2" },
  "Engineered Chain":       { color: "#1d4ed8", bg: "#dbeafe" },
  "Forged Chain":           { color: "#92400e", bg: "#ffedd5" },
  "Welded Steel Chain":     { color: "#374151", bg: "#f1f5f9" },
  "Overhead Chain":         { color: "#0f766e", bg: "#ccfbf1" },
  "Sharptop Chain":         { color: "#166534", bg: "#dcfce7" },
  "Thermoforming Chain":    { color: "#9333ea", bg: "#f3e8ff" },
  "Kiln Chain":             { color: "#c2410c", bg: "#ffedd5" },
  "Conveyor Roller":        { color: "#0369a1", bg: "#e0f2fe" },
  "Magnetic Conveyor":      { color: "#be185d", bg: "#fce7f3" },
  "Monitoring System":      { color: "#047857", bg: "#d1fae5" },
};

function parseJSON(raw) {
  if (!raw) return null;
  if (typeof raw === "object") return raw;
  try { return JSON.parse(raw); } catch (e) { return null; }
}

function getBucketType(b) {
  const p = (b.profile || "").toLowerCase();
  const s = (b.series || "").toLowerCase();
  if (p === "belting" || s.includes("belt") || s.includes("pathfinder") || s.includes("industrial belt")) return "Elevator Belt";
  if (p === "hardware" || s.includes("bolt") || s.includes("splice")) return "Hardware & Accessories";
  return "Elevator Bucket";
}

function sortSeries(a, b) {
  const na = parseFloat((a.series || "").replace(/[^\d.]/g, "")) || 0;
  const nb = parseFloat((b.series || "").replace(/[^\d.]/g, "")) || 0;
  if (na !== nb) return na - nb;
  return (a.style || "").localeCompare(b.style || "");
}

// ─── Tear Sheet ───────────────────────────────────────────────────────────────

function printTearSheet(rec, type) {
  const tm = TYPE_META[type] || { color: NAVY, bg: "#f3f4f6" };
  const isIntralox = !!rec.pitch_in;

  const specs = isIntralox ? [
    ["Belt Category", rec.category], ["Style", rec.style],
    ["Pitch", rec.pitch_in ? rec.pitch_in + '" (' + rec.pitch_mm + 'mm)' : null],
    ["Min Belt Width", rec.min_width_in ? rec.min_width_in + '"' : null],
    ["Open Area", rec.open_area], ["Hinge Style", rec.hinge_style],
    ["Materials", rec.materials],
  ] : [
    ["Series", rec.series], ["Style", rec.style || rec.category],
    ["Vendor", rec.vendor], ["Duty", rec.duty], ["Application", rec.application],
    ["Model", rec.model_code], ["Sizes Available", rec.sizes_available],
  ];
  const filteredSpecs = specs.filter(([, v]) => v && String(v) !== "null");

  const beltRows = parseJSON(rec.belt_data) || [];
  const sprocketRows = parseJSON(rec.sprocket_data) || [];

  const beltCols = ["material","strength_lbf","strength_nm","temp_min_f","temp_max_f","mass_lbft2","mass_kgm2"];
  const beltLabels = { material:"Material", strength_lbf:"Strength (lbf)", strength_nm:"Strength (N/m)", temp_min_f:"Min °F", temp_max_f:"Max °F", mass_lbft2:"lb/ft²", mass_kgm2:"kg/m²" };
  const activeBeltCols = beltCols.filter(k => beltRows.some(r => r[k] != null && r[k] !== ""));

  const sprocketCols = ["type","material","teeth","pitch_dia_in","pitch_dia_mm","outer_dia_in","outer_dia_mm","hub_width_in","hub_width_mm"];
  const sprocketLabels = { type:"Type", material:"Material", teeth:"Teeth", pitch_dia_in:"Pitch Dia (in)", pitch_dia_mm:"Pitch Dia (mm)", outer_dia_in:"Outer Dia (in)", outer_dia_mm:"Outer Dia (mm)", hub_width_in:"Hub W (in)", hub_width_mm:"Hub W (mm)" };
  const activeSprocketCols = sprocketCols.filter(k => sprocketRows.some(r => r[k] != null && r[k] !== ""));

  const w = window.open("", "_blank");
  w.document.write(`<!DOCTYPE html><html><head><title>Tear Sheet — ${rec.series}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Segoe UI', Arial, sans-serif; color: #111; background: #fff; }
  @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } .no-print { display: none !important; } }
  .header { background: #0f2340; color: #fff; padding: 22px 32px; display: flex; justify-content: space-between; align-items: center; }
  .header-title { font-size: 22px; font-weight: 800; }
  .header-sub { font-size: 11px; color: rgba(255,255,255,0.45); margin-top: 3px; }
  .header-meta { text-align: right; font-size: 11px; color: rgba(255,255,255,0.45); }
  .accent-bar { height: 4px; background: linear-gradient(90deg, ${tm.color}, #1a3a5c); }
  .body { padding: 24px 32px; }
  .product-hero { display: flex; gap: 24px; align-items: flex-start; margin-bottom: 20px; padding-bottom: 20px; border-bottom: 1px solid #e5e7eb; }
  .product-img { width: 140px; height: 100px; object-fit: contain; border: 1px solid #e5e7eb; border-radius: 6px; padding: 6px; background: #f8fafc; flex-shrink: 0; }
  .product-name { font-size: 26px; font-weight: 900; color: #0f2340; line-height: 1.1; }
  .product-type { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: ${tm.color}; margin-bottom: 6px; }
  .product-style { font-size: 14px; color: #64748b; margin-top: 4px; }
  .tags { display: flex; gap: 6px; margin-top: 10px; flex-wrap: wrap; }
  .tag { background: ${tm.bg}; color: ${tm.color}; border-radius: 99px; padding: 3px 10px; font-size: 11px; font-weight: 700; }
  .notes-box { background: #f8fafc; border-left: 3px solid #1a3a5c; border-radius: 4px; padding: 10px 14px; font-size: 12px; color: #334155; line-height: 1.7; margin-bottom: 18px; }
  .section-title { font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; color: #1a3a5c; margin-bottom: 8px; padding-bottom: 4px; border-bottom: 2px solid #e2e8f0; }
  .specs-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; margin-bottom: 20px; }
  .spec-cell { background: #f8fafc; border: 1px solid #f1f5f9; border-radius: 5px; padding: 7px 10px; }
  .spec-label { font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.6px; color: #94a3b8; margin-bottom: 2px; }
  .spec-value { font-size: 12px; font-weight: 600; color: #0f2340; }
  table { width: 100%; border-collapse: collapse; font-size: 11px; margin-bottom: 20px; }
  thead tr { background: #0f2340; }
  thead th { padding: 7px 10px; color: #fff; font-weight: 700; text-align: left; white-space: nowrap; }
  tbody tr:nth-child(even) { background: #f8fafc; }
  tbody td { padding: 6px 10px; border-bottom: 1px solid #e5e7eb; color: #334155; }
  tbody td:first-child { font-weight: 600; color: #0f2340; }
  .section-wrap { margin-bottom: 20px; }
  .footer { margin-top: 24px; padding-top: 12px; border-top: 1px solid #e5e7eb; display: flex; justify-content: space-between; align-items: center; }
  .footer-left { font-size: 10px; color: #94a3b8; }
  .footer-right { font-size: 10px; color: #94a3b8; text-align: right; }
  .no-print { margin: 16px 32px; display: flex; gap: 10px; }
  .btn { padding: 8px 18px; border: none; border-radius: 6px; cursor: pointer; font-size: 13px; font-weight: 700; }
  .btn-primary { background: #0f2340; color: #fff; }
  .btn-secondary { background: #f1f5f9; color: #334155; border: 1px solid #e2e8f0; }
</style></head><body>
<div class="no-print">
  <button class="btn btn-primary" onclick="window.print()">Print / Save PDF</button>
  <button class="btn btn-secondary" onclick="window.close()">Close</button>
</div>
<div class="header">
  <div>
    <div class="header-title">UNIKING CANADA</div>
    <div class="header-sub">Technical Product Reference</div>
  </div>
  <div class="header-meta">
    <div style="font-size:13px;font-weight:700;color:#fff;">${rec.series}</div>
    <div>${type}</div>
    <div style="margin-top:4px;">${new Date().toLocaleDateString("en-CA", { year:"numeric", month:"long", day:"numeric" })}</div>
  </div>
</div>
<div class="accent-bar"></div>
<div class="body">
  <div class="product-hero">
    ${rec.image_url ? `<img class="product-img" src="${rec.image_url}" alt="${rec.series}" />` : ""}
    <div>
      <div class="product-type">${type}${rec.vendor ? " · " + rec.vendor : ""}</div>
      <div class="product-name">${rec.series}</div>
      ${rec.style || rec.category ? `<div class="product-style">${rec.style || rec.category}</div>` : ""}
      <div class="tags">
        ${rec.pitch_in ? `<span class="tag">${rec.pitch_in}" pitch</span>` : ""}
        ${rec.hinge_style ? `<span class="tag">${rec.hinge_style}</span>` : ""}
        ${rec.open_area ? `<span class="tag">${rec.open_area} open</span>` : ""}
      </div>
    </div>
  </div>

  ${rec.notes ? `<div class="notes-box">${rec.notes}</div>` : ""}

  ${filteredSpecs.length ? `
  <div class="section-wrap">
    <div class="section-title">Specifications</div>
    <div class="specs-grid">
      ${filteredSpecs.map(([l, v]) => `<div class="spec-cell"><div class="spec-label">${l}</div><div class="spec-value">${v}</div></div>`).join("")}
    </div>
  </div>` : ""}

  ${beltRows.length && activeBeltCols.length ? `
  <div class="section-wrap">
    <div class="section-title">Belt Data — Material Properties</div>
    <table>
      <thead><tr>${activeBeltCols.map(k => `<th>${beltLabels[k]}</th>`).join("")}</tr></thead>
      <tbody>${beltRows.map(row => `<tr>${activeBeltCols.map(k => `<td>${row[k] != null ? row[k] : "—"}</td>`).join("")}</tr>`).join("")}</tbody>
    </table>
  </div>` : ""}

  ${sprocketRows.length && activeSprocketCols.length ? `
  <div class="section-wrap">
    <div class="section-title">Compatible Sprockets</div>
    <table>
      <thead><tr>${activeSprocketCols.map(k => `<th>${sprocketLabels[k]}</th>`).join("")}</tr></thead>
      <tbody>${sprocketRows.map(row => `<tr>${activeSprocketCols.map(k => `<td>${row[k] != null ? row[k] : "—"}</td>`).join("")}</tr>`).join("")}</tbody>
    </table>
  </div>` : ""}

  ${(rec.catalog_url || rec.tech_doc_url || rec.cad_url) ? `
  <div class="section-wrap">
    <div class="section-title">Technical Resources</div>
    <div style="display:flex;gap:12px;flex-wrap:wrap;margin-top:6px;">
      ${rec.catalog_url ? `<a href="${rec.catalog_url}" style="font-size:12px;color:#1a3a5c;font-weight:600;">View Catalog PDF</a>` : ""}
      ${rec.tech_doc_url ? `<a href="${rec.tech_doc_url}" style="font-size:12px;color:#1a3a5c;font-weight:600;">Technical Documentation</a>` : ""}
      ${rec.cad_url ? `<a href="${rec.cad_url}" style="font-size:12px;color:#1a3a5c;font-weight:600;">CAD Drawing</a>` : ""}
    </div>
  </div>` : ""}

  <div class="footer">
    <div class="footer-left">
      <div>Uniking Canada · info@unikingcanada.com</div>
      <div style="font-size:9px;text-transform:uppercase;letter-spacing:1px;color:#cbd5e1;margin-top:2px;">Confidential — Internal Use Only · No pricing information included</div>
    </div>
    <div class="footer-right">
      <div>${rec.series}${rec.style ? " / " + rec.style : ""}</div>
    </div>
  </div>
</div>
</body></html>`);
  w.document.close();
}

// ─── Sprocket Table ───────────────────────────────────────────────────────────

function SprocketTable({ data }) {
  const rows = parseJSON(data);
  if (!Array.isArray(rows) || !rows.length) return <div style={{ color: "#6b7280", fontSize: 13 }}>No sprocket data available for this series.</div>;

  const cols = ["type","material","teeth","pitch_dia_in","pitch_dia_mm","outer_dia_in","outer_dia_mm","hub_width_in","hub_width_mm"];
  const labels = { type:"Type", material:"Material", teeth:"Teeth", pitch_dia_in:"Pitch Dia (in)", pitch_dia_mm:"Pitch Dia (mm)", outer_dia_in:"Outer Dia (in)", outer_dia_mm:"Outer Dia (mm)", hub_width_in:"Hub W (in)", hub_width_mm:"Hub W (mm)" };
  const active = cols.filter(k => rows.some(r => r[k] != null && r[k] !== ""));

  const groups = {};
  for (const row of rows) {
    const t = row.type || "One-Piece";
    if (!groups[t]) groups[t] = [];
    groups[t].push(row);
  }

  return (
    <div>
      {Object.entries(groups).map(([grpType, grpRows]) => (
        <div key={grpType} style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.8, color: NAVY, marginBottom: 6 }}>{grpType} Sprockets</div>
          <div style={{ overflowX: "auto", borderRadius: 8, border: "1px solid #e5e7eb" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
              <thead>
                <tr style={{ background: NAVY }}>
                  {active.filter(k => k !== "type").map(k => (
                    <th key={k} style={{ padding: "8px 10px", color: "#fff", fontWeight: 700, textAlign: "left", whiteSpace: "nowrap" }}>{labels[k]}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {grpRows.map((row, i) => (
                  <tr key={i} style={{ background: i % 2 === 0 ? "#f8fafc" : "#fff", borderBottom: "1px solid #e5e7eb" }}>
                    {active.filter(k => k !== "type").map(k => (
                      <td key={k} style={{ padding: "7px 10px", color: k === "material" ? NAVY : "#374151", fontWeight: k === "material" ? 700 : 400, whiteSpace: "nowrap" }}>
                        {row[k] != null ? String(row[k]) : "—"}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Belt Data Table ──────────────────────────────────────────────────────────

function BeltDataTable({ data }) {
  const rows = parseJSON(data);
  if (!Array.isArray(rows) || !rows.length) return null;
  const keys = ["material","strength_lbf","strength_nm","temp_min_f","temp_max_f","mass_lbft2","mass_kgm2"];
  const labels = { material:"Material", strength_lbf:"Strength (lbf)", strength_nm:"Strength (N/m)", temp_min_f:"Min °F", temp_max_f:"Max °F", mass_lbft2:"lb/ft²", mass_kgm2:"kg/m²" };
  const cols = keys.filter(k => rows.some(r => r[k] != null && r[k] !== ""));
  return (
    <div style={{ overflowX: "auto", borderRadius: 8, border: "1px solid #e5e7eb" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
        <thead>
          <tr style={{ background: NAVY }}>
            {cols.map(k => <th key={k} style={{ padding: "8px 10px", color: "#fff", fontWeight: 700, textAlign: "left", whiteSpace: "nowrap" }}>{labels[k]}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} style={{ background: i % 2 === 0 ? "#f8fafc" : "#fff", borderBottom: "1px solid #e5e7eb" }}>
              {cols.map(k => (
                <td key={k} style={{ padding: "7px 10px", color: k === "material" ? NAVY : "#374151", fontWeight: k === "material" ? 700 : 400, whiteSpace: "nowrap" }}>
                  {row[k] != null ? String(row[k]) : "—"}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Modal ────────────────────────────────────────────────────────────────────

function Modal({ rec, type, onClose }) {
  const [tab, setTab] = useState("specs");
  if (!rec) return null;
  const tm = TYPE_META[type] || { color: NAVY, bg: "#f3f4f6" };
  const isIntralox = !!rec.pitch_in;

  const hasBelt = !!(parseJSON(rec.belt_data)?.length);
  const hasSprocket = !!(parseJSON(rec.sprocket_data)?.length);

  const matStr = rec.materials || rec.material || "";
  const mats = matStr.split(/[,/]/).map(m => m.trim()).filter(Boolean);

  const specs = isIntralox ? [
    ["Series", rec.series], ["Category", rec.category], ["Style", rec.style],
    ["Pitch", rec.pitch_in ? rec.pitch_in + '" (' + rec.pitch_mm + 'mm)' : null],
    ["Min Width", rec.min_width_in ? rec.min_width_in + '"' : null],
    ["Open Area", rec.open_area], ["Hinge Style", rec.hinge_style],
    ["Pages", rec.page_range ? "pp. " + rec.page_range : null],
  ] : [
    ["Series", rec.series], ["Style", rec.style || rec.category],
    ["Vendor", rec.vendor], ["Duty", rec.duty], ["Application", rec.application],
    ["Model", rec.model_code], ["Sizes", rec.sizes_available],
    ["Pages", rec.page_range ? "pp. " + rec.page_range : null],
  ];

  const tabs = [
    ["specs", "Specs"],
    mats.length ? ["mats", "Materials"] : null,
    hasBelt ? ["belt", "Belt Data"] : null,
    hasSprocket ? ["sprockets", "Sprockets"] : null,
    (rec.catalog_url || rec.tech_doc_url || rec.cad_url) ? ["res", "Resources"] : null,
  ].filter(Boolean);

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.5)", zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }} onClick={onClose}>
      <div style={{ background: "#fff", borderRadius: 16, width: "100%", maxWidth: 720, maxHeight: "92vh", overflowY: "auto" }} onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div style={{ background: "linear-gradient(135deg,#1a3a5c,#2d5986)", borderRadius: "16px 16px 0 0", padding: "18px 20px 16px", position: "relative" }}>
          <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
            {rec.image_url ? (
              <div style={{ background: "rgba(255,255,255,.1)", borderRadius: 8, padding: 6, flexShrink: 0, width: 110, height: 80, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <img src={rec.image_url} alt="" style={{ maxWidth: 100, maxHeight: 72, objectFit: "contain" }} onError={e => { e.target.parentElement.style.display = "none"; }} />
              </div>
            ) : null}
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", gap: 8, marginBottom: 6, flexWrap: "wrap" }}>
                <span style={{ background: tm.bg, color: tm.color, padding: "2px 9px", borderRadius: 99, fontSize: 11, fontWeight: 700 }}>{type}</span>
                {rec.vendor ? <span style={{ background: "rgba(255,255,255,.15)", color: "#fff", padding: "2px 9px", borderRadius: 99, fontSize: 11, fontWeight: 700 }}>{rec.vendor}</span> : null}
              </div>
              <div style={{ fontSize: 20, fontWeight: 900, color: "#fff", lineHeight: 1.2 }}>{rec.series}</div>
              {rec.style || rec.category ? <div style={{ fontSize: 12, color: "rgba(255,255,255,.6)", marginTop: 3 }}>{rec.style || rec.category}</div> : null}
              <div style={{ display: "flex", gap: 5, marginTop: 7, flexWrap: "wrap" }}>
                {rec.pitch_in ? <span style={{ background: "rgba(255,255,255,.15)", color: "#fff", padding: "2px 8px", borderRadius: 99, fontSize: 10, fontWeight: 700 }}>{rec.pitch_in}" pitch</span> : null}
                {rec.hinge_style ? <span style={{ background: "rgba(255,255,255,.15)", color: "#fff", padding: "2px 8px", borderRadius: 99, fontSize: 10, fontWeight: 700 }}>{rec.hinge_style}</span> : null}
                {rec.open_area ? <span style={{ background: "rgba(255,255,255,.15)", color: "#fff", padding: "2px 8px", borderRadius: 99, fontSize: 10, fontWeight: 700 }}>{rec.open_area} open</span> : null}
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, flexShrink: 0, alignItems: "flex-end" }}>
              <button onClick={onClose} style={{ background: "rgba(255,255,255,.15)", border: "none", borderRadius: "50%", width: 30, height: 30, cursor: "pointer", color: "#fff", fontSize: 15 }}>✕</button>
              <button onClick={() => printTearSheet(rec, type)} style={{ background: "rgba(255,255,255,.15)", border: "1px solid rgba(255,255,255,.3)", color: "#fff", padding: "5px 12px", borderRadius: 6, cursor: "pointer", fontSize: 11, fontWeight: 700, whiteSpace: "nowrap" }}>
                Print Tear Sheet
              </button>
            </div>
          </div>
        </div>

        {rec.notes ? <div style={{ margin: "12px 18px 0", padding: "10px 13px", background: "#f8fafc", borderRadius: 8, borderLeft: "3px solid " + tm.color, fontSize: 13, color: "#374151", lineHeight: 1.7 }}>{rec.notes}</div> : null}

        {/* Tabs */}
        <div style={{ display: "flex", borderBottom: "2px solid #f3f4f6", margin: "12px 18px 0", overflowX: "auto" }}>
          {tabs.map(([id, label]) => (
            <button key={id} onClick={() => setTab(id)} style={{ padding: "7px 13px", border: "none", background: "none", cursor: "pointer", fontSize: 12, fontWeight: 700, whiteSpace: "nowrap", color: tab === id ? tm.color : "#9ca3af", borderBottom: tab === id ? "2px solid " + tm.color : "2px solid transparent", marginBottom: -2 }}>
              {label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div style={{ padding: "14px 18px 22px" }}>
          {tab === "specs" && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {specs.filter(([, v]) => v && v !== "null").map(([l, v]) => (
                <div key={l} style={{ padding: "9px 11px", background: "#f8fafc", borderRadius: 8, border: "1px solid #f1f5f9" }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: .5, marginBottom: 2 }}>{l}</div>
                  <div style={{ fontSize: 13, color: NAVY, fontWeight: 600 }}>{v}</div>
                </div>
              ))}
            </div>
          )}
          {tab === "mats" && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {mats.map((m, i) => <span key={i} style={{ padding: "7px 14px", borderRadius: 99, background: tm.bg, color: tm.color, fontWeight: 700, fontSize: 13 }}>{m}</span>)}
            </div>
          )}
          {tab === "belt" && (
            <div>
              <p style={{ fontSize: 12, color: "#6b7280", marginBottom: 10 }}>Mechanical properties per material. Strength per metre of belt width.</p>
              <BeltDataTable data={rec.belt_data} />
            </div>
          )}
          {tab === "sprockets" && (
            <div>
              <p style={{ fontSize: 12, color: "#6b7280", marginBottom: 14 }}>All belts in the {rec.series} use the same sprocket family. Sprockets are shared across all styles within this series.</p>
              <SprocketTable data={rec.sprocket_data} />
            </div>
          )}
          {tab === "res" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {rec.catalog_url ? <a href={rec.catalog_url} target="_blank" rel="noreferrer" style={{ display: "flex", alignItems: "center", gap: 10, padding: "11px 14px", background: "#f8fafc", borderRadius: 10, border: "1px solid #e5e7eb", color: NAVY, fontWeight: 700, fontSize: 13, textDecoration: "none" }}>View Catalog PDF</a> : null}
              {rec.tech_doc_url ? <a href={rec.tech_doc_url} target="_blank" rel="noreferrer" style={{ display: "flex", alignItems: "center", gap: 10, padding: "11px 14px", background: "#f8fafc", borderRadius: 10, border: "1px solid #e5e7eb", color: NAVY, fontWeight: 700, fontSize: 13, textDecoration: "none" }}>Technical Documentation</a> : null}
              {rec.cad_url ? <a href={rec.cad_url} target="_blank" rel="noreferrer" style={{ display: "flex", alignItems: "center", gap: 10, padding: "11px 14px", background: "#f8fafc", borderRadius: 10, border: "1px solid #e5e7eb", color: NAVY, fontWeight: 700, fontSize: 13, textDecoration: "none" }}>CAD Drawing</a> : null}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────

export default function Catalog() {
  const [all, setAll] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeF, setTypeF] = useState("All");
  const [seriesF, setSeriesF] = useState("All");
  const [hingeF, setHingeF] = useState("All");
  const [pitchF, setPitchF] = useState("All");
  const [sel, setSel] = useState(null);

  useEffect(() => {
    Promise.all([CatalogProduct.list(), UniCatalog.list(), ElevatorBucket.list()])
      .then(([intralox, uni, buckets]) => {
        setAll([
          ...intralox.map(r => ({ ...r, _type: r.category || "Modular Plastic Belt" })),
          ...uni.map(r => ({ ...r, _type: r.product_type })),
          ...buckets.map(r => ({ ...r, _type: getBucketType(r) })),
        ]);
      })
      .catch(e => console.error(e))
      .finally(() => setLoading(false));
  }, []);

  const types = useMemo(() => ["All", ...Array.from(new Set(all.map(p => p._type).filter(Boolean))).sort()], [all]);
  const seriesOpts = useMemo(() => {
    const base = typeF === "All" ? all : all.filter(p => p._type === typeF);
    const s = Array.from(new Set(base.map(p => p.series).filter(Boolean)));
    s.sort((a, b) => { const na = parseFloat(a.replace(/[^\d.]/g, "")) || 0, nb = parseFloat(b.replace(/[^\d.]/g, "")) || 0; return na !== nb ? na - nb : a.localeCompare(b); });
    return ["All", ...s];
  }, [all, typeF]);
  const hingeOpts = useMemo(() => ["All", ...Array.from(new Set(all.filter(p => p.hinge_style).map(p => p.hinge_style))).sort()], [all]);
  const pitchOpts = useMemo(() => {
    const s = Array.from(new Set(all.filter(p => p.pitch_in).map(p => p.pitch_in + '"')));
    s.sort((a, b) => parseFloat(a) - parseFloat(b));
    return ["All", ...s];
  }, [all]);

  const filtered = useMemo(() => {
    let list = all;
    if (typeF !== "All") list = list.filter(p => p._type === typeF);
    if (seriesF !== "All") list = list.filter(p => p.series === seriesF);
    if (hingeF !== "All") list = list.filter(p => p.hinge_style === hingeF);
    if (pitchF !== "All") list = list.filter(p => (p.pitch_in + '"') === pitchF);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(p => [p.series, p.style, p.category, p.notes, p.materials, p.search_tags, p.application].some(f => f && f.toLowerCase().includes(q)));
    }
    return [...list].sort(sortSeries);
  }, [all, typeF, seriesF, hingeF, pitchF, search]);

  const hasFilters = typeF !== "All" || seriesF !== "All" || hingeF !== "All" || pitchF !== "All" || search;

  function Sel({ value, onChange, options, label }) {
    return (
      <select value={value} onChange={e => onChange(e.target.value)} style={{ padding: "8px 11px", borderRadius: 8, border: "1px solid #d1d5db", fontSize: 13, color: NAVY, background: "#fff", cursor: "pointer" }}>
        <option value="All">{label}</option>
        {options.filter(o => o !== "All").map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", fontFamily: "'Inter','Segoe UI',sans-serif" }}>
      <div style={{ background: NAVY, padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 56, boxShadow: "0 2px 8px rgba(0,0,0,.18)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <a href="/" style={{ color: "rgba(255,255,255,.5)", textDecoration: "none", fontSize: 12 }}>Home</a>
          <span style={{ color: "rgba(255,255,255,.3)" }}>/ </span>
          <span style={{ color: "#fff", fontSize: 13, fontWeight: 700 }}>Product Catalog</span>
        </div>
        <span style={{ fontSize: 11, color: "rgba(255,255,255,.45)" }}>{loading ? "Loading..." : filtered.length + " products"}</span>
      </div>

      <div style={{ background: "#fff", borderBottom: "1px solid #e5e7eb", padding: "13px 24px" }}>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", maxWidth: 1200, margin: "0 auto" }}>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search series, style, application, material..." style={{ flex: 1, minWidth: 220, padding: "8px 13px", borderRadius: 8, border: "1px solid #d1d5db", fontSize: 13, outline: "none" }} />
          <Sel value={typeF} onChange={v => { setTypeF(v); setSeriesF("All"); }} options={types} label="All Types" />
          {seriesOpts.length > 2 && <Sel value={seriesF} onChange={setSeriesF} options={seriesOpts} label="All Series" />}
          {hingeOpts.length > 2 && <Sel value={hingeF} onChange={setHingeF} options={hingeOpts} label="Hinge Style" />}
          {pitchOpts.length > 2 && <Sel value={pitchF} onChange={setPitchF} options={pitchOpts} label="Pitch" />}
          {hasFilters && (
            <button onClick={() => { setTypeF("All"); setSeriesF("All"); setHingeF("All"); setPitchF("All"); setSearch(""); }} style={{ padding: "8px 13px", borderRadius: 8, border: "1px solid #d1d5db", background: "#f9fafb", cursor: "pointer", fontSize: 13, color: "#6b7280" }}>
              Clear
            </button>
          )}
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "22px" }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: 80, color: "#9ca3af", fontSize: 14 }}>Loading catalog...</div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: 80, color: "#9ca3af", fontSize: 14 }}>No products found.</div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(230px,1fr))", gap: 14 }}>
            {filtered.map((rec, i) => {
              const tm = TYPE_META[rec._type] || { color: NAVY, bg: "#f3f4f6" };
              return (
                <div key={rec.id || i} onClick={() => setSel(rec)} style={{ background: "#fff", borderRadius: 12, border: "1px solid #e5e7eb", cursor: "pointer", display: "flex", flexDirection: "column", overflow: "hidden", transition: "transform .15s,box-shadow .15s" }}
                  onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 6px 20px rgba(0,0,0,.10)"; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; }}>
                  <div style={{ height: 4, background: "linear-gradient(90deg," + tm.color + "," + tm.color + "66)" }} />
                  {rec.image_url ? (
                    <div style={{ background: "#f8fafc", borderBottom: "1px solid #f1f5f9", height: 128, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                      <img src={rec.image_url} alt="" style={{ maxHeight: 116, maxWidth: "88%", objectFit: "contain" }} onError={e => { e.target.parentElement.style.display = "none"; }} />
                    </div>
                  ) : null}
                  <div style={{ padding: "11px 13px", flex: 1, display: "flex", flexDirection: "column", gap: 4 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 5 }}>
                      <span style={{ background: tm.bg, color: tm.color, padding: "1px 7px", borderRadius: 99, fontSize: 10, fontWeight: 700, whiteSpace: "nowrap" }}>{rec._type}</span>
                      {rec.pitch_in ? <span style={{ fontSize: 10, color: "#9ca3af" }}>{rec.pitch_in}"</span> : null}
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 800, color: NAVY, lineHeight: 1.25 }}>{rec.series || "—"}</div>
                    {(rec.style || rec.category) ? <div style={{ fontSize: 11, color: "#6b7280" }}>{rec.style || rec.category}</div> : null}
                    <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                      {rec.hinge_style ? <span style={{ background: "#f9fafb", color: "#374151", padding: "1px 6px", borderRadius: 99, fontSize: 10, fontWeight: 600 }}>{rec.hinge_style}</span> : null}
                      {rec.open_area && rec.open_area !== "0%" ? <span style={{ background: "#f0fdf4", color: "#15803d", padding: "1px 6px", borderRadius: 99, fontSize: 10, fontWeight: 600 }}>{rec.open_area} open</span> : null}
                    </div>
                  </div>
                  <div style={{ padding: "7px 13px", borderTop: "1px solid #f3f4f6", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 10, color: "#d1d5db" }}>{rec.page_range ? "pp." + rec.page_range : ""}</span>
                    <span style={{ fontSize: 11, color: tm.color, fontWeight: 700 }}>Details →</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {sel ? <Modal rec={sel} type={sel._type} onClose={() => setSel(null)} /> : null}
    </div>
  );
}
