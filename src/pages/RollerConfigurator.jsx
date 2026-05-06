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

function LoadTable({ table }) {
  if (!table) return null;
  const { cols_mm, rows } = table;
  return (
    <div style={{ overflowX: "auto", borderRadius: 7, border: "1px solid " + C.border, marginTop: 12 }}>
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

function RollerSchematic({ series, rl, tubeIdx }) {
  const tube = series.tubes[tubeIdx] || series.tubes[0];
  const tubeMm = tube?.tube_mm || 50;
  const wallMm = tube?.wall_mm || 1.5;
  const rlVal = parseInt(rl) || 600;
  const scale = Math.min(340, rlVal) / rlVal;
  const drawRL = rlVal * scale;
  const svgW = drawRL + 80;
  const svgH = tubeMm * 2.2 + 40;
  const cx = 40;
  const cy = svgH / 2;
  const tubeY1 = cy - tubeMm / 2;
  const tubeY2 = cy + tubeMm / 2;
  const innerY1 = cy - (tubeMm / 2 - wallMm);
  const innerY2 = cy + (tubeMm / 2 - wallMm);
  const color = series.color || NAVY;

  return (
    <div style={{ background: "#f1f5f9", borderRadius: 10, padding: "16px 12px", marginBottom: 16, border: "1px solid " + C.border }}>
      <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, color: C.muted, marginBottom: 8 }}>Schematic — RL = {rlVal} mm</div>
      <svg width="100%" viewBox={`0 0 ${svgW + 20} ${svgH}`} style={{ maxWidth: 480, display: "block", margin: "0 auto" }}>
        {/* Shaft lines */}
        <line x1={cx - 20} y1={cy} x2={cx} y2={cy} stroke="#94a3b8" strokeWidth={3} />
        <line x1={cx + drawRL} y1={cy} x2={cx + drawRL + 20} y2={cy} stroke="#94a3b8" strokeWidth={3} />
        {/* Tube outer */}
        <rect x={cx} y={tubeY1} width={drawRL} height={tubeMm} rx={tubeMm / 6} fill={color} fillOpacity={0.18} stroke={color} strokeWidth={1.5} />
        {/* Tube inner (wall) */}
        <rect x={cx + wallMm * 2} y={innerY1} width={drawRL - wallMm * 4} height={tubeMm - wallMm * 2} rx={(tubeMm - wallMm * 2) / 6} fill="#fff" fillOpacity={0.6} stroke={color} strokeWidth={0.5} strokeDasharray="4 2" />
        {/* RL dimension arrow */}
        <line x1={cx} y1={tubeY2 + 12} x2={cx + drawRL} y2={tubeY2 + 12} stroke="#64748b" strokeWidth={1} markerEnd="url(#arr)" markerStart="url(#arrR)" />
        <defs>
          <marker id="arr" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill="#64748b" /></marker>
          <marker id="arrR" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto-start-reverse"><path d="M0,0 L6,3 L0,6 Z" fill="#64748b" /></marker>
        </defs>
        <text x={cx + drawRL / 2} y={tubeY2 + 26} textAnchor="middle" fontSize={10} fill="#64748b">RL = {rlVal} mm</text>
        {/* Tube label */}
        <text x={cx + drawRL / 2} y={cy + 4} textAnchor="middle" fontSize={11} fill={color} fontWeight="700">Ø{tubeMm} × {wallMm} mm</text>
      </svg>
    </div>
  );
}

function SeriesCard({ series, onClick, selected }) {
  const [hov, setHov] = useState(false);
  const isSelected = selected?.id === series.id;
  return (
    <div
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      onClick={() => onClick(series)}
      style={{
        background: isSelected ? NAVY : hov ? "#f0f7ff" : C.card,
        border: "2px solid " + (isSelected ? NAVY : hov ? "#2563eb" : C.border),
        borderRadius: 10, padding: "14px 16px", cursor: "pointer",
        transition: "all 0.15s", display: "flex", flexDirection: "column", gap: 6
      }}>
      {series.image_url && (
        <img src={series.image_url} alt={series.name}
          style={{ width: "100%", height: 90, objectFit: "contain", borderRadius: 6, background: isSelected ? "rgba(255,255,255,0.1)" : "#f8fafc", marginBottom: 4 }}
          onError={e => e.target.style.display = "none"} />
      )}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 13, fontWeight: 800, color: isSelected ? "#fff" : C.text }}>{series.name}</span>
        <span style={{ fontSize: 10, fontWeight: 700, background: DUTY_COLOR[series.duty] + "22", color: DUTY_COLOR[series.duty], padding: "2px 7px", borderRadius: 99, border: "1px solid " + DUTY_COLOR[series.duty] + "44" }}>{series.duty}</span>
      </div>
      <div style={{ fontSize: 11, color: isSelected ? "rgba(255,255,255,0.75)" : C.muted }}>{series.subtitle}</div>
      <div style={{ fontSize: 11, color: isSelected ? "rgba(255,255,255,0.55)" : "#94a3b8" }}>
        Max {series.maxLoad_N.toLocaleString()} N · {series.maxSpeed_ms} m/s · p.{series.page_range}
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 2 }}>
        {series.tags.map(t => (
          <span key={t} style={{ fontSize: 9, padding: "1px 6px", borderRadius: 99, background: isSelected ? "rgba(255,255,255,0.15)" : "#e0f2fe", color: isSelected ? "#fff" : "#0369a1", fontWeight: 600 }}>{t}</span>
        ))}
      </div>
    </div>
  );
}

function TearSheetPrint({ series, config }) {
  const { tube, shaft, rl, sleeve, grooves } = config;
  const html = `<!DOCTYPE html><html><head><title>Roller Tear Sheet — ${series.name}</title>
<style>*{margin:0;padding:0;box-sizing:border-box;}body{font-family:'Segoe UI',Arial,sans-serif;color:#111;}
.hdr{background:#0f2340;color:#fff;padding:20px 32px;display:flex;justify-content:space-between;align-items:center;}
.bar{height:4px;background:linear-gradient(90deg,#2d8a4e,#1a3a5c);}
.body{padding:24px 32px;}h2{font-size:22px;font-weight:900;color:#0f2340;margin-bottom:4px;}
.sub{font-size:13px;color:#64748b;margin-bottom:16px;}.spec{background:#f8fafc;border:1px solid #e5e7eb;border-radius:6px;padding:12px 16px;margin-bottom:12px;}
.spec-row{display:flex;gap:10px;margin-bottom:6px;font-size:13px;}.lbl{color:#94a3b8;font-weight:600;width:160px;flex-shrink:0;}
.val{color:#0f2340;font-weight:700;}.notes{background:#fff8ed;border-left:3px solid #f59e0b;padding:10px 14px;font-size:12px;color:#334155;line-height:1.7;margin-top:12px;}
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
    <div>${new Date().toLocaleDateString("en-CA",{year:"numeric",month:"long",day:"numeric"})}</div>
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

export default function RollerConfigurator({ onBack, onGoRFQ }) {
  const [selected, setSelected] = useState(null);
  const [tubeIdx, setTubeIdx] = useState(0);
  const [shaftIdx, setShaftIdx] = useState(0);
  const [sleeveIdx, setSleeveIdx] = useState(0);
  const [rl, setRl] = useState("600");
  const [groovesQty, setGroovesQty] = useState(0);
  const [activeTab, setActiveTab] = useState("spec");
  const [rfqAdded, setRfqAdded] = useState(false);
  const [filter, setFilter] = useState("All");

  const isEmbedded = typeof onBack === "function";

  function selectSeries(s) {
    setSelected(s);
    setTubeIdx(0);
    setShaftIdx(0);
    setSleeveIdx(0);
    setGroovesQty(0);
    setRl("600");
    setActiveTab("spec");
    setRfqAdded(false);
    window.scrollTo(0, 0);
  }

  function addToRFQ() {
    if (!selected) return;
    const cart = getRFQCart();
    const id = "roller-" + selected.id + "-" + Date.now();
    const tube = selected.tubes[tubeIdx];
    cart.push({
      cartId: id, id, _source: "roller",
      series: selected.name,
      name: selected.name,
      type: "Conveyor Rollers",
      style: tube?.label || "",
      category: selected.subtitle,
      image_url: selected.image_url || "",
      materials: tube?.materials?.join(", ") || "",
      application: selected.applications?.[0] || "",
      quantity: 1, unit: "Each", notes: `RL=${rl}mm | Shaft: ${selected.shafts[shaftIdx]?.label || ""} | Sleeve: ${selected.sleeves[sleeveIdx] || "None"}`
    });
    saveRFQCart(cart);
    setRfqAdded(true);
  }

  const duties = ["All", "Light", "Medium", "Heavy"];
  const filtered = filter === "All" ? ROLLER_SERIES : ROLLER_SERIES.filter(s => s.duty === filter);

  const tube = selected?.tubes[tubeIdx];
  const shaft = selected?.shafts[shaftIdx];
  const sleeve = selected?.sleeves[sleeveIdx];
  const hasGrooves = selected && (selected.grooves === true || (typeof selected.grooves === "object" && selected.grooves));

  const config = {
    tube: tube?.label,
    shaft: shaft?.label,
    rl,
    sleeve,
    grooves: groovesQty > 0 ? `${groovesQty} groove(s)` : "None"
  };

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "'Inter','Segoe UI',Arial,sans-serif" }}>
      {/* Top Bar */}
      <div style={{ background: NAVY, height: 56, display: "flex", alignItems: "center", padding: "0 24px", justifyContent: "space-between", boxShadow: "0 2px 8px rgba(0,0,0,.2)", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {isEmbedded && (
            <button onClick={onBack} style={{ background: "rgba(255,255,255,.12)", border: "1px solid rgba(255,255,255,.2)", color: "#fff", borderRadius: 7, padding: "5px 13px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>← Back</button>
          )}
          <img src="https://media.base44.com/images/public/69dd9ffccab4dd693d4d92f5/e48ee59d9_Unitingthestrongestlinks_20251031_225809_0000.png"
            style={{ maxHeight: 26, filter: "brightness(0) invert(1)", opacity: 0.9 }} alt="Uniking" />
          <span style={{ color: "#fff", fontWeight: 800, fontSize: 14 }}>Conveyor Roller Configurator</span>
          <span style={{ color: "rgba(255,255,255,.45)", fontSize: 12 }}>Interroll Series</span>
        </div>
        <button onClick={isEmbedded ? onGoRFQ : () => {}} style={{ background: "rgba(255,255,255,.12)", border: "1px solid rgba(255,255,255,.2)", color: "#fff", borderRadius: 7, padding: "5px 13px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
          📋 RFQ Cart
        </button>
      </div>

      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "20px clamp(12px,3vw,32px)", display: "flex", gap: 24, flexWrap: "wrap" }}>

        {/* Left: Series Grid */}
        <div style={{ width: "clamp(260px, 30%, 320px)", flexShrink: 0 }}>
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, color: C.muted, marginBottom: 10 }}>Select Series</div>

          {/* Duty filter */}
          <div style={{ display: "flex", gap: 6, marginBottom: 14, flexWrap: "wrap" }}>
            {duties.map(d => (
              <button key={d} onClick={() => setFilter(d)}
                style={{ padding: "4px 12px", borderRadius: 99, fontSize: 11, fontWeight: 700, cursor: "pointer", border: "1px solid " + (filter === d ? NAVY : C.border), background: filter === d ? NAVY : "#fff", color: filter === d ? "#fff" : C.muted, transition: "all .13s" }}>
                {d}
              </button>
            ))}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {filtered.map(s => <SeriesCard key={s.id} series={s} onClick={selectSeries} selected={selected} />)}
          </div>
        </div>

        {/* Right: Configurator */}
        <div style={{ flex: 1, minWidth: 300 }}>
          {!selected ? (
            <div style={{ textAlign: "center", padding: "80px 20px", color: C.muted }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>⚙️</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: NAVY_MID, marginBottom: 8 }}>Select a Roller Series</div>
              <div style={{ fontSize: 14 }}>Choose from {ROLLER_SERIES.length} Interroll series on the left to configure your roller and view specifications.</div>
            </div>
          ) : (
            <div>
              {/* Series Header */}
              <div style={{ background: NAVY_MID, borderRadius: 12, padding: "20px 24px", marginBottom: 20, display: "flex", gap: 20, alignItems: "flex-start", flexWrap: "wrap" }}>
                {selected.image_url && (
                  <div style={{ background: "rgba(255,255,255,.1)", borderRadius: 8, padding: 8, display: "flex", alignItems: "center", justifyContent: "center", width: 110, height: 82, flexShrink: 0 }}>
                    <img src={selected.image_url} alt={selected.name} style={{ maxWidth: 100, maxHeight: 74, objectFit: "contain" }} onError={e => e.target.parentElement.style.display = "none"} />
                  </div>
                )}
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                    <span style={{ fontSize: 20, fontWeight: 900, color: "#fff" }}>{selected.name}</span>
                    <span style={{ fontSize: 11, fontWeight: 700, background: DUTY_COLOR[selected.duty] + "33", color: DUTY_COLOR[selected.duty], padding: "2px 8px", borderRadius: 99, border: "1px solid " + DUTY_COLOR[selected.duty] + "66" }}>{selected.duty}</span>
                  </div>
                  <div style={{ fontSize: 13, color: "rgba(255,255,255,.7)", marginBottom: 8 }}>{selected.subtitle}</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    <span style={{ fontSize: 11, color: "rgba(255,255,255,.55)", background: "rgba(255,255,255,.1)", padding: "2px 8px", borderRadius: 4 }}>Max {selected.maxLoad_N.toLocaleString()} N</span>
                    <span style={{ fontSize: 11, color: "rgba(255,255,255,.55)", background: "rgba(255,255,255,.1)", padding: "2px 8px", borderRadius: 4 }}>{selected.maxSpeed_ms} m/s</span>
                    <span style={{ fontSize: 11, color: "rgba(255,255,255,.55)", background: "rgba(255,255,255,.1)", padding: "2px 8px", borderRadius: 4 }}>{selected.temp_min_C}°C to +{selected.temp_max_C}°C</span>
                    <span style={{ fontSize: 11, color: "rgba(255,255,255,.55)", background: "rgba(255,255,255,.1)", padding: "2px 8px", borderRadius: 4 }}>Catalog pp. {selected.page_range}</span>
                  </div>
                </div>
              </div>

              {/* Schematic */}
              <RollerSchematic series={selected} rl={rl} tubeIdx={tubeIdx} />

              {/* Configuration Options */}
              <div style={{ background: C.card, borderRadius: 12, border: "1px solid " + C.border, padding: "20px 22px", marginBottom: 16 }}>
                <div style={{ fontSize: 12, fontWeight: 800, textTransform: "uppercase", letterSpacing: 1, color: C.muted, marginBottom: 16 }}>Configure</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 14 }}>

                  {/* Tube */}
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700, color: C.muted, display: "block", marginBottom: 4 }}>Tube</label>
                    <select value={tubeIdx} onChange={e => setTubeIdx(Number(e.target.value))}
                      style={{ width: "100%", padding: "8px 10px", border: "1px solid " + C.border, borderRadius: 6, fontSize: 12, outline: "none" }}>
                      {selected.tubes.map((t, i) => <option key={i} value={i}>{t.label}</option>)}
                    </select>
                  </div>

                  {/* Shaft */}
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700, color: C.muted, display: "block", marginBottom: 4 }}>Shaft Type</label>
                    <select value={shaftIdx} onChange={e => setShaftIdx(Number(e.target.value))}
                      style={{ width: "100%", padding: "8px 10px", border: "1px solid " + C.border, borderRadius: 6, fontSize: 12, outline: "none" }}>
                      {selected.shafts.map((s, i) => <option key={i} value={i}>{s.label}</option>)}
                    </select>
                  </div>

                  {/* RL */}
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700, color: C.muted, display: "block", marginBottom: 4 }}>Body Length RL (mm)</label>
                    <input type="number" value={rl} min={100} max={3000} step={10} onChange={e => setRl(e.target.value)}
                      style={{ width: "100%", padding: "8px 10px", border: "1px solid " + C.border, borderRadius: 6, fontSize: 12, outline: "none" }} />
                  </div>

                  {/* Sleeve */}
                  {selected.sleeves?.length > 0 && (
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 700, color: C.muted, display: "block", marginBottom: 4 }}>Sleeve / Surface</label>
                      <select value={sleeveIdx} onChange={e => setSleeveIdx(Number(e.target.value))}
                        style={{ width: "100%", padding: "8px 10px", border: "1px solid " + C.border, borderRadius: 6, fontSize: 12, outline: "none" }}>
                        {selected.sleeves.map((s, i) => <option key={i} value={i}>{s}</option>)}
                      </select>
                    </div>
                  )}

                  {/* Grooves */}
                  {hasGrooves && (
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 700, color: C.muted, display: "block", marginBottom: 4 }}>Grooves (round belt)</label>
                      <select value={groovesQty} onChange={e => setGroovesQty(Number(e.target.value))}
                        style={{ width: "100%", padding: "8px 10px", border: "1px solid " + C.border, borderRadius: 6, fontSize: 12, outline: "none" }}>
                        {[0, 1, 2, 3, 4].map(n => <option key={n} value={n}>{n === 0 ? "No grooves" : `${n} groove${n > 1 ? "s" : ""}`}</option>)}
                      </select>
                      <div style={{ fontSize: 10, color: C.muted, marginTop: 3 }}>
                        {typeof selected.grooves === "object" && selected.grooves.note ? selected.grooves.note : ""}
                      </div>
                    </div>
                  )}

                </div>

                {/* Dimension formula */}
                <div style={{ marginTop: 14, background: "#f0f7ff", borderRadius: 6, padding: "9px 12px", fontSize: 11, color: NAVY_MID, lineHeight: 1.7 }}>
                  <b>Dimension Formula:</b> {selected.dim_formula}
                </div>
              </div>

              {/* Tabs */}
              <div style={{ display: "flex", gap: 6, marginBottom: 14, borderBottom: "2px solid " + C.border, paddingBottom: 0 }}>
                {[["spec", "Specifications"], ["load", "Load Table"], ["apps", "Applications"], ["sprockets", selected.sprockets ? "Drive Heads" : null]].filter(([, l]) => l).map(([key, label]) => (
                  <button key={key} onClick={() => setActiveTab(key)}
                    style={{ padding: "8px 16px", border: "none", background: "none", cursor: "pointer", fontSize: 12, fontWeight: 700, color: activeTab === key ? NAVY : C.muted, borderBottom: activeTab === key ? "2px solid " + NAVY : "2px solid transparent", marginBottom: -2, transition: "all .13s" }}>
                    {label}
                  </button>
                ))}
              </div>

              {/* Tab: Specs */}
              {activeTab === "spec" && (
                <div style={{ background: C.card, borderRadius: 10, border: "1px solid " + C.border, padding: "18px 22px" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                    <tbody>
                      {[
                        ["Drive Type", selected.driveType],
                        ["Max Load", selected.maxLoad_N.toLocaleString() + " N"],
                        ["Max Speed", selected.maxSpeed_ms + " m/s"],
                        ["Temperature", `${selected.temp_min_C}°C to +${selected.temp_max_C}°C`],
                        ["Antistatic", selected.antistatic],
                        ["Selected Tube", tube?.label || "—"],
                        ["Selected Shaft", shaft?.label || "—"],
                        ["Body Length (RL)", rl + " mm"],
                        ["Sleeve", sleeve || "None"],
                        ["Grooves", groovesQty > 0 ? groovesQty + " groove(s)" : "None"],
                      ].map(([k, v], i) => (
                        <tr key={k} style={{ background: i % 2 === 0 ? C.bg : "#fff", borderBottom: "1px solid " + C.border }}>
                          <td style={{ padding: "8px 12px", color: C.muted, fontWeight: 600, width: "42%" }}>{k}</td>
                          <td style={{ padding: "8px 12px", color: C.text, fontWeight: 600 }}>{v}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {selected.notes && (
                    <div style={{ marginTop: 14, background: "#fff8ed", borderLeft: "3px solid #f59e0b", borderRadius: 4, padding: "10px 14px", fontSize: 12, color: C.slate, lineHeight: 1.75 }}>
                      {selected.notes}
                    </div>
                  )}
                </div>
              )}

              {/* Tab: Load Table */}
              {activeTab === "load" && (
                <div style={{ background: C.card, borderRadius: 10, border: "1px solid " + C.border, padding: "18px 22px" }}>
                  <div style={{ fontSize: 12, color: C.muted, marginBottom: 8 }}>Max allowable load (N) by roller body length (mm). Values from Interroll catalog pp. {selected.page_range}.</div>
                  <LoadTable table={selected.load_table} />
                </div>
              )}

              {/* Tab: Applications */}
              {activeTab === "apps" && (
                <div style={{ background: C.card, borderRadius: 10, border: "1px solid " + C.border, padding: "18px 22px" }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: NAVY_MID, marginBottom: 12 }}>Typical Applications</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {selected.applications.map((a, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "10px 14px", background: C.bg, borderRadius: 7, border: "1px solid " + C.border }}>
                        <span style={{ color: "#16a34a", fontWeight: 800, fontSize: 16 }}>✓</span>
                        <span style={{ fontSize: 13, color: C.text }}>{a}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tab: Drive Heads / Sprockets */}
              {activeTab === "sprockets" && selected.sprockets && (
                <div style={{ background: C.card, borderRadius: 10, border: "1px solid " + C.border, padding: "18px 22px" }}>
                  {selected.sprockets.note && <div style={{ fontSize: 12, color: C.muted, marginBottom: 12 }}>{selected.sprockets.note}</div>}
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 10 }}>
                    {selected.sprockets.drives.map((d, i) => (
                      <div key={i} style={{ background: C.bg, borderRadius: 8, border: "1px solid " + C.border, padding: "12px 14px" }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: NAVY_MID, marginBottom: 4 }}>{d.label}</div>
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

              {/* Action Buttons */}
              <div style={{ display: "flex", gap: 10, marginTop: 18, flexWrap: "wrap" }}>
                <button onClick={addToRFQ}
                  style={{ padding: "10px 22px", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: "pointer", border: "none", background: rfqAdded ? "#16a34a" : "#2563eb", color: "#fff", transition: "background .15s" }}>
                  {rfqAdded ? "✓ Added to RFQ" : "+ Add to RFQ"}
                </button>
                <button onClick={() => TearSheetPrint({ series: selected, config })}
                  style={{ padding: "10px 22px", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: "pointer", border: "1px solid " + NAVY, background: "#fff", color: NAVY }}>
                  Print Tear Sheet
                </button>
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
}