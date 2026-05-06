import { useState } from "react";
import { ROLLER_SERIES } from "@/lib/rollerSeriesData";

const NAVY = "#003c5b";
const NAVY_MID = "#1A3A5C";
const C = {
  bg: "#f8fafc", card: "#ffffff", border: "#e2e8f0",
  navy: NAVY, navyMid: NAVY_MID, muted: "#64748b", text: "#0f172a", slate: "#334155"
};
const DUTY_COLOR = { Light: "#3b82f6", Medium: "#f59e0b", Heavy: "#ef4444" };

function getRFQCart() { try { return JSON.parse(localStorage.getItem("uniking_rfq_cart") || "[]"); } catch { return []; } }
function saveRFQCart(items) { localStorage.setItem("uniking_rfq_cart", JSON.stringify(items)); window.dispatchEvent(new Event("rfq_cart_updated")); }

// ─── Top Bar ──────────────────────────────────────────────────────────────────
function TopBar({ onBack, onGoRFQ }) {
  return (
    <div style={{ background: NAVY, height: 56, display: "flex", alignItems: "center", padding: "0 24px", justifyContent: "space-between", boxShadow: "0 2px 8px rgba(0,0,0,.2)", flexShrink: 0 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        {onBack && <button onClick={onBack} style={{ background: "rgba(255,255,255,.12)", border: "1px solid rgba(255,255,255,.2)", color: "#fff", borderRadius: 7, padding: "5px 13px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>← Back</button>}
        <img src="https://media.base44.com/images/public/69dd9ffccab4dd693d4d92f5/e48ee59d9_Unitingthestrongestlinks_20251031_225809_0000.png"
          style={{ maxHeight: 26, filter: "brightness(0) invert(1)", opacity: 0.9 }} alt="Uniking" />
        <span style={{ color: "#fff", fontWeight: 800, fontSize: 14 }}>Conveyor Rollers</span>
        <span style={{ color: "rgba(255,255,255,.4)", fontSize: 12 }}>Interroll Series</span>
      </div>
      <button onClick={onGoRFQ} style={{ background: "rgba(255,255,255,.12)", border: "1px solid rgba(255,255,255,.2)", color: "#fff", borderRadius: 7, padding: "5px 13px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
        📋 RFQ Cart
      </button>
    </div>
  );
}

// ─── Load Table ───────────────────────────────────────────────────────────────
function LoadTable({ table }) {
  if (!table) return null;
  const { cols_mm, rows } = table;
  return (
    <div style={{ overflowX: "auto", borderRadius: 7, border: "1px solid " + C.border, marginTop: 8 }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
        <thead>
          <tr style={{ background: NAVY_MID }}>
            <th style={{ padding: "7px 10px", color: "#fff", textAlign: "left", whiteSpace: "nowrap" }}>Roller Configuration</th>
            {cols_mm.map(c => <th key={c} style={{ padding: "7px 10px", color: "#fff", textAlign: "right", whiteSpace: "nowrap" }}>{c} mm</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} style={{ background: i % 2 === 0 ? "#f8fafc" : "#fff", borderBottom: "1px solid " + C.border }}>
              <td style={{ padding: "7px 10px", color: NAVY_MID, fontWeight: 600, whiteSpace: "nowrap" }}>{row.label}</td>
              {cols_mm.map((c, ci) => (
                <td key={ci} style={{ padding: "7px 10px", textAlign: "right", color: row.loads[ci] ? C.text : "#cbd5e1" }}>
                  {row.loads[ci] != null ? <><b>{row.loads[ci]}</b> N</> : "—"}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Roller Schematic ─────────────────────────────────────────────────────────
function RollerSchematic({ series, rl, tubeIdx }) {
  const tube = series.tubes[tubeIdx] || series.tubes[0];
  const tubeMm = tube?.tube_mm || 50;
  const wallMm = tube?.wall_mm || 1.5;
  const rlVal = parseInt(rl) || 600;
  const scale = Math.min(360, rlVal) / rlVal;
  const drawRL = rlVal * scale;
  const svgW = drawRL + 80;
  const svgH = tubeMm * 2.2 + 40;
  const cx = 40;
  const cy = svgH / 2;
  const tubeY1 = cy - tubeMm / 2;
  const tubeY2 = cy + tubeMm / 2;
  const innerY1 = cy - (tubeMm / 2 - wallMm);
  const color = series.color || NAVY;
  return (
    <div style={{ background: "#f1f5f9", borderRadius: 10, padding: "14px 12px", border: "1px solid " + C.border }}>
      <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, color: C.muted, marginBottom: 8 }}>Live Schematic — RL = {rlVal} mm</div>
      <svg width="100%" viewBox={`0 0 ${svgW + 20} ${svgH}`} style={{ maxWidth: 500, display: "block", margin: "0 auto" }}>
        <line x1={cx - 20} y1={cy} x2={cx} y2={cy} stroke="#94a3b8" strokeWidth={3} />
        <line x1={cx + drawRL} y1={cy} x2={cx + drawRL + 20} y2={cy} stroke="#94a3b8" strokeWidth={3} />
        <rect x={cx} y={tubeY1} width={drawRL} height={tubeMm} rx={tubeMm / 6} fill={color} fillOpacity={0.18} stroke={color} strokeWidth={1.5} />
        <rect x={cx + wallMm * 2} y={innerY1} width={drawRL - wallMm * 4} height={tubeMm - wallMm * 2} rx={(tubeMm - wallMm * 2) / 6} fill="#fff" fillOpacity={0.6} stroke={color} strokeWidth={0.5} strokeDasharray="4 2" />
        <line x1={cx} y1={tubeY2 + 12} x2={cx + drawRL} y2={tubeY2 + 12} stroke="#64748b" strokeWidth={1} markerEnd="url(#arr)" markerStart="url(#arrR)" />
        <defs>
          <marker id="arr" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill="#64748b" /></marker>
          <marker id="arrR" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto-start-reverse"><path d="M0,0 L6,3 L0,6 Z" fill="#64748b" /></marker>
        </defs>
        <text x={cx + drawRL / 2} y={tubeY2 + 26} textAnchor="middle" fontSize={10} fill="#64748b">RL = {rlVal} mm</text>
        <text x={cx + drawRL / 2} y={cy + 4} textAnchor="middle" fontSize={11} fill={color} fontWeight="700">Ø{tubeMm} × {wallMm} mm</text>
      </svg>
    </div>
  );
}

// ─── Tear Sheet ───────────────────────────────────────────────────────────────
function printTearSheet(series, config) {
  const { tube, shaft, rl, sleeve, grooves } = config;
  const html = `<!DOCTYPE html><html><head><title>Roller Tear Sheet — ${series.name}</title>
<style>*{margin:0;padding:0;box-sizing:border-box;}body{font-family:'Segoe UI',Arial,sans-serif;color:#111;}
.hdr{background:#0f2340;color:#fff;padding:20px 32px;display:flex;justify-content:space-between;align-items:center;}
.bar{height:4px;background:linear-gradient(90deg,#2d8a4e,#1a3a5c);}
.body{padding:24px 32px;}h2{font-size:22px;font-weight:900;color:#0f2340;margin-bottom:4px;}
.sub{font-size:13px;color:#64748b;margin-bottom:16px;}
.spec{background:#f8fafc;border:1px solid #e5e7eb;border-radius:6px;padding:12px 16px;margin-bottom:12px;}
.spec-row{display:flex;gap:10px;margin-bottom:6px;font-size:13px;}.lbl{color:#94a3b8;font-weight:600;width:160px;flex-shrink:0;}
.val{color:#0f2340;font-weight:700;}
.notes{background:#fff8ed;border-left:3px solid #f59e0b;padding:10px 14px;font-size:12px;color:#334155;line-height:1.7;margin-top:12px;}
.no-print{margin:16px 32px;display:flex;gap:10px;}@media print{.no-print{display:none!important;}}
.btn{padding:8px 18px;border:none;border-radius:6px;cursor:pointer;font-size:13px;font-weight:700;}
.btn-p{background:#0f2340;color:#fff;}.btn-s{background:#f1f5f9;color:#334155;border:1px solid #e2e8f0;}
.footer{margin-top:24px;padding-top:12px;border-top:1px solid #e5e7eb;font-size:10px;color:#94a3b8;}
</style></head><body>
<div class="no-print"><button class="btn btn-p" onclick="window.print()">Print / Save PDF</button><button class="btn btn-s" onclick="window.close()">Close</button></div>
<div class="hdr">
  <img src="https://media.base44.com/images/public/69dd9ffccab4dd693d4d92f5/e48ee59d9_Unitingthestrongestlinks_20251031_225809_0000.png" style="max-height:34px;filter:brightness(0) invert(1);opacity:.9;" />
  <div style="text-align:right;font-size:11px;color:rgba(255,255,255,.5);">
    <div style="font-size:14px;font-weight:700;color:#fff;">Conveyor Roller — ${series.name}</div>
    <div>${new Date().toLocaleDateString("en-CA", { year: "numeric", month: "long", day: "numeric" })}</div>
  </div>
</div>
<div class="bar"></div>
<div class="body">
  ${series.image_url ? `<img src="${series.image_url}" alt="${series.name}" style="max-height:120px;max-width:300px;object-fit:contain;margin-bottom:16px;border:1px solid #e5e7eb;border-radius:6px;padding:8px;background:#f8fafc;" />` : ""}
  <h2>${series.name}</h2>
  <div class="sub">${series.subtitle} · Catalog pages ${series.page_range}</div>
  <div class="spec">
    <div class="spec-row"><span class="lbl">Tube</span><span class="val">${tube || "—"}</span></div>
    <div class="spec-row"><span class="lbl">Shaft Type</span><span class="val">${shaft || "—"}</span></div>
    <div class="spec-row"><span class="lbl">Body Length (RL)</span><span class="val">${rl ? rl + " mm" : "—"}</span></div>
    <div class="spec-row"><span class="lbl">Sleeve / Surface</span><span class="val">${sleeve || "None"}</span></div>
    <div class="spec-row"><span class="lbl">Grooves</span><span class="val">${grooves || "None"}</span></div>
    <div class="spec-row"><span class="lbl">Drive Type</span><span class="val">${series.driveType}</span></div>
    <div class="spec-row"><span class="lbl">Max Load</span><span class="val">${series.maxLoad_N.toLocaleString()} N</span></div>
    <div class="spec-row"><span class="lbl">Max Speed</span><span class="val">${series.maxSpeed_ms} m/s</span></div>
    <div class="spec-row"><span class="lbl">Temperature Range</span><span class="val">${series.temp_min_C}°C to +${series.temp_max_C}°C</span></div>
    <div class="spec-row"><span class="lbl">Antistatic</span><span class="val">${series.antistatic}</span></div>
    <div class="spec-row"><span class="lbl">Dimension Formula</span><span class="val">${series.dim_formula}</span></div>
  </div>
  <div class="notes">${series.notes}</div>
  <div class="footer">Uniking Canada · unikingcanada.com · rfq@unikingcanada.com · Specifications per Interroll catalog. Confirm before supply.</div>
</div></body></html>`;
  const blob = new Blob([html], { type: "text/html" });
  window.open(URL.createObjectURL(blob), "_blank");
}

// ─── VIEW 1: Series Grid ──────────────────────────────────────────────────────
function SeriesGrid({ onSelect }) {
  const [filter, setFilter] = useState("All");
  const [hov, setHov] = useState(null);
  const duties = ["All", "Light", "Medium", "Heavy"];
  const filtered = filter === "All" ? ROLLER_SERIES : ROLLER_SERIES.filter(s => s.duty === filter);

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "24px clamp(12px,3vw,32px)" }}>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 22, fontWeight: 800, color: C.text, marginBottom: 4 }}>Conveyor Roller Series</div>
        <div style={{ fontSize: 14, color: C.muted }}>Select a series to view specifications and configure your roller</div>
      </div>

      {/* Duty filter */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
        {duties.map(d => (
          <button key={d} onClick={() => setFilter(d)}
            style={{ padding: "6px 16px", borderRadius: 99, fontSize: 12, fontWeight: 700, cursor: "pointer", border: "1px solid " + (filter === d ? NAVY : C.border), background: filter === d ? NAVY : "#fff", color: filter === d ? "#fff" : C.muted, transition: "all .13s" }}>
            {d === "All" ? `All (${ROLLER_SERIES.length})` : `${d} (${ROLLER_SERIES.filter(s => s.duty === d).length})`}
          </button>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 16 }}>
        {filtered.map(s => (
          <div key={s.id}
            onMouseEnter={() => setHov(s.id)} onMouseLeave={() => setHov(null)}
            onClick={() => onSelect(s)}
            style={{ background: C.card, border: "1px solid " + (hov === s.id ? NAVY_MID : C.border), borderRadius: 12, overflow: "hidden", cursor: "pointer", transition: "all .15s", boxShadow: hov === s.id ? "0 6px 20px rgba(0,60,91,.12)" : "0 1px 4px rgba(0,0,0,.05)", transform: hov === s.id ? "translateY(-2px)" : "none" }}>
            {/* Accent bar */}
            <div style={{ height: 3, background: s.color || NAVY }} />
            {/* Image */}
            {s.image_url && (
              <div style={{ background: "#f8fafc", height: 120, display: "flex", alignItems: "center", justifyContent: "center", borderBottom: "1px solid " + C.border }}>
                <img src={s.image_url} alt={s.name} style={{ maxHeight: 108, maxWidth: "88%", objectFit: "contain" }} onError={e => e.target.parentElement.style.display = "none"} />
              </div>
            )}
            <div style={{ padding: "14px 16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
                <span style={{ fontSize: 14, fontWeight: 800, color: C.text }}>{s.name}</span>
                <span style={{ fontSize: 10, fontWeight: 700, background: DUTY_COLOR[s.duty] + "18", color: DUTY_COLOR[s.duty], padding: "2px 7px", borderRadius: 99, border: "1px solid " + DUTY_COLOR[s.duty] + "44", whiteSpace: "nowrap", marginLeft: 6 }}>{s.duty}</span>
              </div>
              <div style={{ fontSize: 12, color: C.muted, marginBottom: 8 }}>{s.subtitle}</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 10 }}>
                <span style={{ fontSize: 11, color: C.slate }}><b>{s.maxLoad_N.toLocaleString()} N</b> max</span>
                <span style={{ color: C.border }}>·</span>
                <span style={{ fontSize: 11, color: C.slate }}><b>{s.maxSpeed_ms} m/s</b></span>
                <span style={{ color: C.border }}>·</span>
                <span style={{ fontSize: 11, color: C.slate }}>pp. {s.page_range}</span>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 12 }}>
                {s.tags.map(t => <span key={t} style={{ fontSize: 9, padding: "2px 7px", borderRadius: 99, background: "#e0f2fe", color: "#0369a1", fontWeight: 600 }}>{t}</span>)}
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: 12, color: C.muted }}>View details →</span>
                <div style={{ width: 28, height: 28, borderRadius: 6, background: NAVY, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ color: "#fff", fontSize: 14, fontWeight: 700 }}>›</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── VIEW 2: Series Detail ────────────────────────────────────────────────────
function SeriesDetail({ series, onBack, onConfigure }) {
  const [tab, setTab] = useState("overview");
  const tabs = [
    ["overview", "Overview"],
    ["load", "Load Table"],
    ["apps", "Applications"],
    series.sprockets ? ["sprockets", "Drive Heads"] : null,
  ].filter(Boolean);

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", padding: "24px clamp(12px,3vw,32px)" }}>
      {/* Breadcrumb */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: C.muted, marginBottom: 20 }}>
        <span onClick={onBack} style={{ cursor: "pointer", color: NAVY_MID, fontWeight: 600 }}>All Series</span>
        <span>›</span>
        <span style={{ color: C.muted }}>{series.name}</span>
      </div>

      {/* Hero */}
      <div style={{ background: NAVY_MID, borderRadius: 14, padding: "24px 28px", marginBottom: 24, display: "flex", gap: 24, alignItems: "flex-start", flexWrap: "wrap" }}>
        {series.image_url && (
          <div style={{ background: "rgba(255,255,255,.1)", borderRadius: 10, padding: 10, display: "flex", alignItems: "center", justifyContent: "center", width: 130, height: 100, flexShrink: 0 }}>
            <img src={series.image_url} alt={series.name} style={{ maxWidth: 118, maxHeight: 88, objectFit: "contain" }} onError={e => e.target.parentElement.style.display = "none"} />
          </div>
        )}
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
            <span style={{ fontSize: 24, fontWeight: 900, color: "#fff" }}>{series.name}</span>
            <span style={{ fontSize: 11, fontWeight: 700, background: DUTY_COLOR[series.duty] + "33", color: DUTY_COLOR[series.duty], padding: "3px 10px", borderRadius: 99, border: "1px solid " + DUTY_COLOR[series.duty] + "66" }}>{series.duty} Duty</span>
          </div>
          <div style={{ fontSize: 15, color: "rgba(255,255,255,.75)", marginBottom: 12 }}>{series.subtitle}</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
            {[
              ["Max Load", series.maxLoad_N.toLocaleString() + " N"],
              ["Max Speed", series.maxSpeed_ms + " m/s"],
              ["Temp Range", series.temp_min_C + "°C to +" + series.temp_max_C + "°C"],
              ["Antistatic", series.antistatic],
              ["Catalog", "pp. " + series.page_range],
            ].map(([l, v]) => (
              <div key={l} style={{ background: "rgba(255,255,255,.1)", borderRadius: 6, padding: "6px 12px" }}>
                <div style={{ fontSize: 9, color: "rgba(255,255,255,.45)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 2 }}>{l}</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#fff" }}>{v}</div>
              </div>
            ))}
          </div>
          {/* Configure Button */}
          <button onClick={onConfigure}
            style={{ padding: "11px 28px", borderRadius: 9, fontSize: 14, fontWeight: 800, cursor: "pointer", border: "none", background: series.color || "#2563eb", color: "#fff", letterSpacing: "0.02em", boxShadow: "0 4px 14px rgba(0,0,0,.25)", transition: "opacity .15s" }}
            onMouseEnter={e => e.target.style.opacity = ".85"} onMouseLeave={e => e.target.style.opacity = "1"}>
            ⚙ Configure This Roller
          </button>
        </div>
      </div>

      {/* Notes */}
      {series.notes && (
        <div style={{ background: "#fff8ed", borderLeft: "4px solid #f59e0b", borderRadius: 6, padding: "12px 16px", fontSize: 13, color: C.slate, lineHeight: 1.75, marginBottom: 20 }}>
          {series.notes}
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: "flex", gap: 0, borderBottom: "2px solid " + C.border, marginBottom: 20 }}>
        {tabs.map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)}
            style={{ padding: "10px 18px", border: "none", background: "none", cursor: "pointer", fontSize: 13, fontWeight: 700, color: tab === key ? NAVY : C.muted, borderBottom: tab === key ? "2px solid " + NAVY : "2px solid transparent", marginBottom: -2, whiteSpace: "nowrap" }}>
            {label}
          </button>
        ))}
      </div>

      {/* Tab: Overview — tubes + shafts */}
      {tab === "overview" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          <div style={{ background: C.card, borderRadius: 10, border: "1px solid " + C.border, padding: "18px 20px" }}>
            <div style={{ fontSize: 12, fontWeight: 800, textTransform: "uppercase", letterSpacing: 1, color: C.muted, marginBottom: 12 }}>Available Tubes</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {series.tubes.map((t, i) => (
                <div key={i} style={{ padding: "8px 12px", background: C.bg, borderRadius: 6, fontSize: 12, color: C.text, border: "1px solid " + C.border }}>{t.label}</div>
              ))}
            </div>
          </div>
          <div style={{ background: C.card, borderRadius: 10, border: "1px solid " + C.border, padding: "18px 20px" }}>
            <div style={{ fontSize: 12, fontWeight: 800, textTransform: "uppercase", letterSpacing: 1, color: C.muted, marginBottom: 12 }}>Shaft Options</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {series.shafts.map((s, i) => (
                <div key={i} style={{ padding: "8px 12px", background: C.bg, borderRadius: 6, fontSize: 12, color: C.text, border: "1px solid " + C.border }}>{s.label}</div>
              ))}
            </div>
            {series.sleeves?.length > 0 && (
              <>
                <div style={{ fontSize: 12, fontWeight: 800, textTransform: "uppercase", letterSpacing: 1, color: C.muted, margin: "16px 0 10px" }}>Surface Options</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {series.sleeves.map((s, i) => <span key={i} style={{ padding: "4px 10px", background: "#ede9fe", color: "#6d28d9", borderRadius: 99, fontSize: 11, fontWeight: 600 }}>{s}</span>)}
                </div>
              </>
            )}
          </div>
          <div style={{ gridColumn: "1 / -1", background: C.card, borderRadius: 10, border: "1px solid " + C.border, padding: "18px 20px" }}>
            <div style={{ fontSize: 12, fontWeight: 800, textTransform: "uppercase", letterSpacing: 1, color: C.muted, marginBottom: 10 }}>Drive Type</div>
            <div style={{ fontSize: 13, color: C.text }}>{series.driveType}</div>
            <div style={{ fontSize: 11, color: C.muted, marginTop: 10, lineHeight: 1.7 }}><b>Dimension Formula:</b> {series.dim_formula}</div>
          </div>
        </div>
      )}

      {/* Tab: Load Table */}
      {tab === "load" && (
        <div style={{ background: C.card, borderRadius: 10, border: "1px solid " + C.border, padding: "18px 20px" }}>
          <div style={{ fontSize: 12, color: C.muted, marginBottom: 8 }}>Max allowable load (N) by roller body length (mm). From Interroll catalog pp. {series.page_range}.</div>
          <LoadTable table={series.load_table} />
        </div>
      )}

      {/* Tab: Applications */}
      {tab === "apps" && (
        <div style={{ background: C.card, borderRadius: 10, border: "1px solid " + C.border, padding: "18px 20px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {series.applications.map((a, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", background: C.bg, borderRadius: 7, border: "1px solid " + C.border }}>
                <span style={{ color: "#16a34a", fontWeight: 800, fontSize: 16 }}>✓</span>
                <span style={{ fontSize: 13, color: C.text }}>{a}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Drive Heads */}
      {tab === "sprockets" && series.sprockets && (
        <div style={{ background: C.card, borderRadius: 10, border: "1px solid " + C.border, padding: "18px 20px" }}>
          {series.sprockets.note && <div style={{ fontSize: 12, color: C.muted, marginBottom: 12 }}>{series.sprockets.note}</div>}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 10 }}>
            {series.sprockets.drives.map((d, i) => (
              <div key={i} style={{ background: C.bg, borderRadius: 8, border: "1px solid " + C.border, padding: "12px 14px" }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: NAVY_MID, marginBottom: 6 }}>{d.label}</div>
                <div style={{ fontSize: 11, color: C.muted }}>Pitch: {d.pitch}</div>
                {d.teeth && <div style={{ fontSize: 11, color: C.muted }}>Teeth: {d.teeth}</div>}
                {d.OD_mm && <div style={{ fontSize: 11, color: C.muted }}>OD: {d.OD_mm} mm</div>}
                {d.EL_formula && <div style={{ fontSize: 11, color: C.muted }}>EL = {d.EL_formula}</div>}
                {d.max_load_N && <div style={{ fontSize: 11, color: "#dc2626", fontWeight: 600 }}>Max {d.max_load_N} N</div>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bottom Configure CTA */}
      <div style={{ marginTop: 28, padding: "20px 24px", background: "#f0f7ff", borderRadius: 12, border: "1px solid #bfdbfe", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: NAVY_MID }}>Ready to configure?</div>
          <div style={{ fontSize: 12, color: C.muted }}>Select your tube, shaft, length and options — then add to RFQ or print a tear sheet.</div>
        </div>
        <button onClick={onConfigure}
          style={{ padding: "11px 28px", borderRadius: 9, fontSize: 14, fontWeight: 800, cursor: "pointer", border: "none", background: NAVY, color: "#fff" }}>
          ⚙ Configure This Roller
        </button>
      </div>
    </div>
  );
}

// ─── VIEW 3: Configurator ─────────────────────────────────────────────────────
function Configurator({ series, onBack, onGoRFQ }) {
  const [tubeIdx, setTubeIdx] = useState(0);
  const [shaftIdx, setShaftIdx] = useState(0);
  const [sleeveIdx, setSleeveIdx] = useState(0);
  const [rl, setRl] = useState("600");
  const [groovesQty, setGroovesQty] = useState(0);
  const [rfqAdded, setRfqAdded] = useState(false);

  const tube = series.tubes[tubeIdx];
  const shaft = series.shafts[shaftIdx];
  const sleeve = series.sleeves?.[sleeveIdx];
  const hasGrooves = series.grooves === true || (typeof series.grooves === "object" && series.grooves);

  const config = {
    tube: tube?.label,
    shaft: shaft?.label,
    rl,
    sleeve,
    grooves: groovesQty > 0 ? `${groovesQty} groove(s)` : "None"
  };

  function addToRFQ() {
    const cart = getRFQCart();
    const id = "roller-" + series.id + "-" + Date.now();
    cart.push({
      cartId: id, id, _source: "roller",
      series: series.name, name: series.name,
      type: "Conveyor Rollers",
      style: tube?.label || "",
      category: series.subtitle,
      image_url: series.image_url || "",
      materials: tube?.materials?.join(", ") || "",
      application: series.applications?.[0] || "",
      quantity: 1, unit: "Each",
      notes: `RL=${rl}mm | Shaft: ${shaft?.label || ""} | Sleeve: ${sleeve || "None"}`
    });
    saveRFQCart(cart);
    setRfqAdded(true);
  }

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "24px clamp(12px,3vw,32px)" }}>
      {/* Breadcrumb */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: C.muted, marginBottom: 20 }}>
        <span onClick={() => onBack("list")} style={{ cursor: "pointer", color: NAVY_MID, fontWeight: 600 }}>All Series</span>
        <span>›</span>
        <span onClick={() => onBack("detail")} style={{ cursor: "pointer", color: NAVY_MID, fontWeight: 600 }}>{series.name}</span>
        <span>›</span>
        <span style={{ color: C.muted }}>Configure</span>
      </div>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
        {series.image_url && (
          <div style={{ background: C.card, border: "1px solid " + C.border, borderRadius: 8, padding: 8, width: 70, height: 54, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <img src={series.image_url} alt={series.name} style={{ maxWidth: 60, maxHeight: 46, objectFit: "contain" }} onError={e => e.target.parentElement.style.display = "none"} />
          </div>
        )}
        <div>
          <div style={{ fontSize: 20, fontWeight: 900, color: C.text }}>{series.name} — Configurator</div>
          <div style={{ fontSize: 13, color: C.muted }}>{series.subtitle}</div>
        </div>
      </div>

      {/* Live Schematic */}
      <div style={{ marginBottom: 20 }}>
        <RollerSchematic series={series} rl={rl} tubeIdx={tubeIdx} />
      </div>

      {/* Config Options */}
      <div style={{ background: C.card, borderRadius: 12, border: "1px solid " + C.border, padding: "22px 24px", marginBottom: 20 }}>
        <div style={{ fontSize: 12, fontWeight: 800, textTransform: "uppercase", letterSpacing: 1, color: C.muted, marginBottom: 18 }}>Configuration Options</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))", gap: 16 }}>
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: C.muted, display: "block", marginBottom: 5 }}>Tube</label>
            <select value={tubeIdx} onChange={e => setTubeIdx(Number(e.target.value))}
              style={{ width: "100%", padding: "9px 10px", border: "1px solid " + C.border, borderRadius: 7, fontSize: 12, outline: "none", background: "#fff" }}>
              {series.tubes.map((t, i) => <option key={i} value={i}>{t.label}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: C.muted, display: "block", marginBottom: 5 }}>Shaft Type</label>
            <select value={shaftIdx} onChange={e => setShaftIdx(Number(e.target.value))}
              style={{ width: "100%", padding: "9px 10px", border: "1px solid " + C.border, borderRadius: 7, fontSize: 12, outline: "none", background: "#fff" }}>
              {series.shafts.map((s, i) => <option key={i} value={i}>{s.label}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: C.muted, display: "block", marginBottom: 5 }}>Body Length RL (mm)</label>
            <input type="number" value={rl} min={100} max={3000} step={10} onChange={e => setRl(e.target.value)}
              style={{ width: "100%", padding: "9px 10px", border: "1px solid " + C.border, borderRadius: 7, fontSize: 12, outline: "none" }} />
          </div>
          {series.sleeves?.length > 0 && (
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: C.muted, display: "block", marginBottom: 5 }}>Sleeve / Surface</label>
              <select value={sleeveIdx} onChange={e => setSleeveIdx(Number(e.target.value))}
                style={{ width: "100%", padding: "9px 10px", border: "1px solid " + C.border, borderRadius: 7, fontSize: 12, outline: "none", background: "#fff" }}>
                {series.sleeves.map((s, i) => <option key={i} value={i}>{s}</option>)}
              </select>
            </div>
          )}
          {hasGrooves && (
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: C.muted, display: "block", marginBottom: 5 }}>Grooves (round belt)</label>
              <select value={groovesQty} onChange={e => setGroovesQty(Number(e.target.value))}
                style={{ width: "100%", padding: "9px 10px", border: "1px solid " + C.border, borderRadius: 7, fontSize: 12, outline: "none", background: "#fff" }}>
                {[0, 1, 2, 3, 4].map(n => <option key={n} value={n}>{n === 0 ? "No grooves" : `${n} groove${n > 1 ? "s" : ""}`}</option>)}
              </select>
              {typeof series.grooves === "object" && series.grooves.note && (
                <div style={{ fontSize: 10, color: C.muted, marginTop: 4, lineHeight: 1.5 }}>{series.grooves.note}</div>
              )}
            </div>
          )}
        </div>

        <div style={{ marginTop: 16, background: "#f0f7ff", borderRadius: 7, padding: "10px 14px", fontSize: 11, color: NAVY_MID, lineHeight: 1.7 }}>
          <b>Dimension Formula:</b> {series.dim_formula}
        </div>
      </div>

      {/* Summary */}
      <div style={{ background: C.card, borderRadius: 12, border: "1px solid " + C.border, padding: "20px 24px", marginBottom: 20 }}>
        <div style={{ fontSize: 12, fontWeight: 800, textTransform: "uppercase", letterSpacing: 1, color: C.muted, marginBottom: 14 }}>Configuration Summary</div>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <tbody>
            {[
              ["Tube", tube?.label || "—"],
              ["Shaft", shaft?.label || "—"],
              ["Body Length (RL)", rl + " mm"],
              ["Sleeve / Surface", sleeve || "None"],
              ["Grooves", groovesQty > 0 ? groovesQty + " groove(s)" : "None"],
              ["Drive Type", series.driveType],
              ["Max Load", series.maxLoad_N.toLocaleString() + " N"],
              ["Max Speed", series.maxSpeed_ms + " m/s"],
              ["Temperature", series.temp_min_C + "°C to +" + series.temp_max_C + "°C"],
              ["Antistatic", series.antistatic],
            ].map(([k, v], i) => (
              <tr key={k} style={{ background: i % 2 === 0 ? C.bg : "#fff", borderBottom: "1px solid " + C.border }}>
                <td style={{ padding: "8px 12px", color: C.muted, fontWeight: 600, width: "40%" }}>{k}</td>
                <td style={{ padding: "8px 12px", color: C.text, fontWeight: 600 }}>{v}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {series.notes && (
          <div style={{ marginTop: 14, background: "#fff8ed", borderLeft: "3px solid #f59e0b", borderRadius: 4, padding: "10px 14px", fontSize: 12, color: C.slate, lineHeight: 1.75 }}>
            {series.notes}
          </div>
        )}
      </div>

      {/* Actions */}
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <button onClick={addToRFQ}
          style={{ padding: "12px 28px", borderRadius: 9, fontSize: 14, fontWeight: 800, cursor: "pointer", border: "none", background: rfqAdded ? "#16a34a" : "#2563eb", color: "#fff", transition: "background .15s" }}>
          {rfqAdded ? "✓ Added to RFQ" : "+ Add to RFQ"}
        </button>
        {rfqAdded && (
          <button onClick={onGoRFQ}
            style={{ padding: "12px 24px", borderRadius: 9, fontSize: 14, fontWeight: 700, cursor: "pointer", border: "1px solid #16a34a", background: "#f0fdf4", color: "#16a34a" }}>
            View RFQ Cart →
          </button>
        )}
        <button onClick={() => printTearSheet(series, config)}
          style={{ padding: "12px 24px", borderRadius: 9, fontSize: 14, fontWeight: 700, cursor: "pointer", border: "1px solid " + NAVY, background: "#fff", color: NAVY }}>
          🖨 Print Tear Sheet
        </button>
      </div>
    </div>
  );
}

// ─── Main Orchestrator ────────────────────────────────────────────────────────
export default function RollerConfigurator({ onBack, onGoRFQ }) {
  const [view, setView] = useState("list"); // list | detail | configure
  const [selected, setSelected] = useState(null);

  function handleSelectSeries(s) {
    setSelected(s);
    setView("detail");
    window.scrollTo(0, 0);
  }

  function handleConfigure() {
    setView("configure");
    window.scrollTo(0, 0);
  }

  function handleBack(to) {
    if (to === "list") { setView("list"); setSelected(null); }
    else if (to === "detail") { setView("detail"); }
    else { setView("list"); setSelected(null); }
    window.scrollTo(0, 0);
  }

  function handleTopBack() {
    if (view === "configure") { setView("detail"); window.scrollTo(0, 0); }
    else if (view === "detail") { setView("list"); setSelected(null); window.scrollTo(0, 0); }
    else { onBack && onBack(); }
  }

  const topBackLabel = view === "configure" ? `← ${selected?.name}` : view === "detail" ? "← All Series" : "← Back";

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "'Inter','Segoe UI',Arial,sans-serif" }}>
      <TopBar onBack={handleTopBack} onGoRFQ={onGoRFQ || (() => {})} />
      {view === "list" && <SeriesGrid onSelect={handleSelectSeries} />}
      {view === "detail" && selected && <SeriesDetail series={selected} onBack={() => handleBack("list")} onConfigure={handleConfigure} />}
      {view === "configure" && selected && <Configurator series={selected} onBack={handleBack} onGoRFQ={onGoRFQ || (() => {})} />}
    </div>
  );
}