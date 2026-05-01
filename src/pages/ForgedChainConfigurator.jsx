import { useState, useEffect } from "react";
import { ForgedChain } from "@/api/entities";

const C = {
  navy: "#0F2340",
  navyMid: "#1B3A6B",
  navyLight: "#2a5080",
  gold: "#C9A84C",
  bg: "#f4f7fb",
  card: "#ffffff",
  border: "#e2e8f0",
  text: "#1e293b",
  muted: "#64748b",
  green: "#16a34a",
  greenBg: "#dcfce7",
};

// ── Real 4B image assets ──────────────────────────────────────────────────────
const IMG = {
  // Hero / card images
  "standard": "https://base44.app/api/apps/69dd9ffccab4dd693d4d92f5/files/mp/public/69dd9ffccab4dd693d4d92f5/6db3d3f32_standard-link.jpg",
  "double":   "https://base44.app/api/apps/69dd9ffccab4dd693d4d92f5/files/mp/public/69dd9ffccab4dd693d4d92f5/8b574a65e_double-link.jpg",
  "triple":   "https://base44.app/api/apps/69dd9ffccab4dd693d4d92f5/files/mp/public/69dd9ffccab4dd693d4d92f5/fa0ba96be_triple-link.jpg",
  "hero":     "https://base44.app/api/apps/69dd9ffccab4dd693d4d92f5/files/mp/public/69dd9ffccab4dd693d4d92f5/4ed6677f2_forged-chain.jpg",
  // Chain installed / gallery
  "chain_installed": "https://base44.app/api/apps/69dd9ffccab4dd693d4d92f5/files/mp/public/69dd9ffccab4dd693d4d92f5/4730baa88_4b142ha-chain.jpg",
  "return_cups_installed": "https://base44.app/api/apps/69dd9ffccab4dd693d4d92f5/files/mp/public/69dd9ffccab4dd693d4d92f5/8b6d72063_4b142ha-chain-return-cups.jpg",
  "double_installed": "https://base44.app/api/apps/69dd9ffccab4dd693d4d92f5/files/mp/public/69dd9ffccab4dd693d4d92f5/5927207c6_double-link-installed.jpg",
  "sprocket_installed": "https://base44.app/api/apps/69dd9ffccab4dd693d4d92f5/files/mp/public/69dd9ffccab4dd693d4d92f5/1869b08c5_sprocket-installed.jpg",
  "chain_pins": "https://base44.app/api/apps/69dd9ffccab4dd693d4d92f5/files/mp/public/69dd9ffccab4dd693d4d92f5/728ea1a69_chain-pins.jpg",
  // Flight images
  "Square Bar Flight":                    "https://base44.app/api/apps/69dd9ffccab4dd693d4d92f5/files/mp/public/69dd9ffccab4dd693d4d92f5/a79564d01_SQUARE-BAR.jpg",
  "Flat Bar Flight":                      "https://base44.app/api/apps/69dd9ffccab4dd693d4d92f5/files/mp/public/69dd9ffccab4dd693d4d92f5/57feb5aa4_FLAT-BAR.jpg",
  "Paddle Flight":                        "https://base44.app/api/apps/69dd9ffccab4dd693d4d92f5/files/mp/public/69dd9ffccab4dd693d4d92f5/a3b67f93e_PADDLE-FLIGHT.jpg",
  "U Flight":                             "https://base44.app/api/apps/69dd9ffccab4dd693d4d92f5/files/mp/public/69dd9ffccab4dd693d4d92f5/4d1c1743b_U-FLIGHT.jpg",
  "Closed U Flight":                      "https://base44.app/api/apps/69dd9ffccab4dd693d4d92f5/files/mp/public/69dd9ffccab4dd693d4d92f5/604e3bf5d_CLOSED-U.jpg",
  "Closed U Flight with Filler Plates":   "https://base44.app/api/apps/69dd9ffccab4dd693d4d92f5/files/mp/public/69dd9ffccab4dd693d4d92f5/8d578750f_CLOSED-U-WITH-FILLER-PLATES.jpg",
  "00 Flight":                            "https://base44.app/api/apps/69dd9ffccab4dd693d4d92f5/files/mp/public/69dd9ffccab4dd693d4d92f5/4dd6a6dd2_OO-FLIGHT.jpg",
  "00 Flight with Filler Plates":         "https://base44.app/api/apps/69dd9ffccab4dd693d4d92f5/files/mp/public/69dd9ffccab4dd693d4d92f5/253dff3e1_OO-WITH-FILLER-PLATES.jpg",
  "Return Cups":                          "https://base44.app/api/apps/69dd9ffccab4dd693d4d92f5/files/mp/public/69dd9ffccab4dd693d4d92f5/2be898a6a_RETURN-CUPS.jpg",
};

function getLinkImage(link_type) {
  if (link_type === "Double") return IMG.double;
  if (link_type === "Triple") return IMG.triple;
  return IMG.standard;
}

function tryParse(val) {
  try { return JSON.parse(val || "[]"); } catch { return []; }
}

// ── Live Schematic ────────────────────────────────────────────────────────────
function LiveSchematicSVG({ chain, selectedFlight, selectedPin }) {
  if (!chain) return null;
  const { P_mm = 142, H_mm = 50, T_mm = 12, W_mm = 42, D_mm = 25, link_type } = chain;
  const W = 340, H = 220;
  const scale = Math.min((W * 0.5) / P_mm, (H * 0.42) / H_mm, 1.6);
  const sW = Math.round(P_mm * scale);
  const sH = Math.round(H_mm * scale);
  const sT = Math.max(4, Math.round(T_mm * scale));
  const sD = Math.round(D_mm * scale * 0.55);
  const cx = W / 2, cy = H / 2 - 10;
  const x0 = cx - sW / 2, x1 = cx + sW / 2;
  const y0 = cy - sH / 2, y1 = cy + sH / 2;
  const hL = { x: x0 + sD * 0.9, y: cy };
  const hR = { x: x1 - sD * 0.9, y: cy };
  const isDouble = link_type === "Double";
  const isTriple = link_type === "Triple";

  const arr = (id, rev) => (
    <marker key={id} id={id} markerWidth="5" markerHeight="5" refX={rev ? "1" : "4"} refY="2.5" orient="auto">
      <path d={rev ? "M5,0 L0,2.5 L5,5 Z" : "M0,0 L5,2.5 L0,5 Z"} fill="#555" />
    </marker>
  );

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", maxWidth: 360 }}>
      <defs>{arr("ar", false)}{arr("al", true)}</defs>

      {(isDouble || isTriple) && <>
        <rect x={x0 - 6} y={y0 - 12} width={sW + 12} height={8} rx={2} fill="#a8b8d0" stroke={C.navyMid} strokeWidth="1.2" opacity="0.85" />
        <rect x={x0 - 6} y={y1 + 4} width={sW + 12} height={8} rx={2} fill="#a8b8d0" stroke={C.navyMid} strokeWidth="1.2" opacity="0.85" />
        {isTriple && <rect x={x0 - 6} y={y1 + 16} width={sW + 12} height={8} rx={2} fill="#a8b8d0" stroke={C.navyMid} strokeWidth="1.2" opacity="0.7" />}
      </>}

      <rect x={x0} y={y0} width={sW} height={sH} rx={sH * 0.36} ry={sH * 0.36}
        fill="#c8d4e8" stroke={C.navyMid} strokeWidth="2" />
      <rect x={x0 + sD * 1.7} y={y0 + sT} width={sW - sD * 3.4} height={sH - sT * 2}
        rx={5} ry={5} fill="#a8b8d0" stroke={C.navyMid} strokeWidth="1.2" />
      <circle cx={hL.x} cy={hL.y} r={sD / 2} fill="#6a8cb8" stroke={C.navyMid} strokeWidth="1.8" />
      <circle cx={hR.x} cy={hR.y} r={sD / 2} fill="#6a8cb8" stroke={C.navyMid} strokeWidth="1.8" />

      <line x1={hL.x} y1={y1 + 18} x2={hR.x} y2={y1 + 18} stroke="#444" strokeWidth="0.8" markerEnd="url(#ar)" markerStart="url(#al)" />
      <line x1={hL.x} y1={cy + sD / 2} x2={hL.x} y2={y1 + 16} stroke="#bbb" strokeWidth="0.6" strokeDasharray="3,2" />
      <line x1={hR.x} y1={cy + sD / 2} x2={hR.x} y2={y1 + 16} stroke="#bbb" strokeWidth="0.6" strokeDasharray="3,2" />
      <text x={cx} y={y1 + 28} textAnchor="middle" fontSize="8.5" fill="#333">P = {P_mm} mm</text>

      <line x1={x1 + 12} y1={y0} x2={x1 + 12} y2={y1} stroke="#444" strokeWidth="0.8" markerEnd="url(#ar)" markerStart="url(#al)" />
      <text x={x1 + 16} y={cy + 3} textAnchor="start" fontSize="8" fill="#333">H={H_mm}</text>

      <line x1={x1 + 28} y1={y0} x2={x1 + 28} y2={y0 + sT} stroke="#444" strokeWidth="0.8" markerEnd="url(#ar)" markerStart="url(#al)" />
      <text x={x1 + 32} y={y0 + sT / 2 + 3} textAnchor="start" fontSize="7.5" fill="#555">T={T_mm}</text>

      <line x1={x0} y1={y0 - 14} x2={x1} y2={y0 - 14} stroke="#444" strokeWidth="0.8" markerEnd="url(#ar)" markerStart="url(#al)" />
      <text x={cx} y={y0 - 17} textAnchor="middle" fontSize="8.5" fill="#333">W = {W_mm} mm</text>

      <line x1={hL.x - sD / 2} y1={cy - sD / 2 - 5} x2={hL.x + sD / 2} y2={cy - sD / 2 - 5} stroke="#c33" strokeWidth="0.8" markerEnd="url(#ar)" markerStart="url(#al)" />
      <text x={hL.x} y={cy - sD / 2 - 8} textAnchor="middle" fontSize="7.5" fill="#c33">D={D_mm}</text>

      {selectedFlight && (
        <g>
          <rect x={4} y={H - 22} width={W - 8} height={16} rx={4} fill={C.navyMid} opacity="0.9" />
          <text x={W / 2} y={H - 11} textAnchor="middle" fontSize="9" fill="white">Flight: {selectedFlight}</text>
        </g>
      )}
      {selectedPin && !selectedFlight && (
        <g>
          <rect x={4} y={H - 22} width={W - 8} height={16} rx={4} fill={C.green} opacity="0.9" />
          <text x={W / 2} y={H - 11} textAnchor="middle" fontSize="9" fill="white">Pin: {selectedPin}</text>
        </g>
      )}
    </svg>
  );
}

// ── Print Tear Sheet ──────────────────────────────────────────────────────────
function printTearSheet(chain, selectedFlight, selectedPin) {
  const w = window.open("", "_blank");
  const sprockets = tryParse(chain.sprocket_data);
  const trailers = tryParse(chain.trailer_data);

  const spTable = sprockets.length ? `
    <h3 style="color:#1B3A6B;margin-top:20px">Sprocket Data — ${chain.sprocket_family}</h3>
    <table style="width:100%;border-collapse:collapse;font-size:11px">
      <thead><tr style="background:#1B3A6B;color:white">
        <th style="padding:5px">Teeth</th><th>PCD</th><th>ØA</th><th>ØB</th><th>ØC max</th><th>T</th><th>WB1</th>
      </tr></thead><tbody>
      ${sprockets.map((s, i) => `<tr style="background:${i % 2 ? "#f5f7fb" : "white"}">
        <td style="padding:4px;text-align:center">${s.teeth}</td><td style="text-align:center">${s.pcd_mm}</td>
        <td style="text-align:center">${s.A_mm}</td><td style="text-align:center">${s.B_mm}</td>
        <td style="text-align:center">${s.C_max_mm}</td><td style="text-align:center">${s.T_mm}</td>
        <td style="text-align:center">${s.WB1_mm}</td>
      </tr>`).join("")}
      </tbody></table>` : "";

  const trTable = trailers.length ? `
    <h3 style="color:#1B3A6B;margin-top:16px">Trailer / Return Wheel Data</h3>
    <table style="width:100%;border-collapse:collapse;font-size:11px">
      <thead><tr style="background:#1B3A6B;color:white">
        <th style="padding:5px">PCD</th><th>C max (smooth)</th><th>WB2 (smooth)</th><th>WB3 (segmental)</th><th>T1 rim</th>
      </tr></thead><tbody>
      ${trailers.map((t, i) => `<tr style="background:${i % 2 ? "#f5f7fb" : "white"}">
        <td style="padding:4px;text-align:center">${t.pcd_mm}</td><td style="text-align:center">${t.C_max_smooth_mm}</td>
        <td style="text-align:center">${t.WB2_smooth_mm}</td><td style="text-align:center">${t.WB3_segmental_mm}</td>
        <td style="text-align:center">${t.T1_rim_width_mm}</td>
      </tr>`).join("")}
      </tbody></table>` : "";

  const dims = [
    ["Pitch (P)", `${chain.P_mm} mm`], ["Height (H)", `${chain.H_mm} mm`],
    ["Plate Thickness (T)", `${chain.T_mm} mm`], ["Width (W)", `${chain.W_mm} mm`],
    ["Pin-to-Edge (M)", `${chain.M_mm} mm`], ["Pin Hole Dia (D)", `${chain.D_mm} mm`],
    ...(chain.F_mm ? [["Overall Width (F)", `${chain.F_mm} mm`], ["Bar Gap (E)", `${chain.E_mm} mm`]] : []),
    ["Min Breaking Load", `${chain.min_breaking_load_kn} kN`],
    ["Case Hardness", chain.case_hardness], ["Case Depth", `${chain.case_depth_mm} mm`],
    ["Core Hardness", chain.core_hardness], ["Weight / Link", `${chain.weight_per_link_kg} kg`],
    ["Stainless Available", chain.stainless_available ? "Yes" : "No"],
  ].map(([k, v], i) => `<tr style="background:${i % 2 ? "#f5f7fb" : "white"}">
    <td style="padding:5px 10px;color:#555;width:180px">${k}</td>
    <td style="padding:5px 10px;font-weight:600">${v}</td></tr>`).join("");

  const flightImg = selectedFlight && IMG[selectedFlight]
    ? `<div style="margin-top:16px"><strong>Selected Flight: ${selectedFlight}</strong><br>
       <img src="${IMG[selectedFlight]}" style="max-width:160px;margin-top:8px;border-radius:6px;border:1px solid #e2e8f0" /></div>`
    : "";

  w.document.write(`<!DOCTYPE html><html><head><title>Forged Chain ${chain.chain_link}</title>
  <style>body{font-family:Arial,sans-serif;margin:28px;color:#222}@media print{body{margin:14px}}</style></head><body>
  <div style="display:flex;justify-content:space-between;align-items:center;border-bottom:3px solid #1B3A6B;padding-bottom:10px;margin-bottom:18px">
    <div>
      <div style="font-size:22px;font-weight:800;color:#1B3A6B">Drop Forged Chain — ${chain.chain_link}</div>
      <div style="color:#555;font-size:12px;margin-top:3px">${chain.link_type} Link &nbsp;·&nbsp; ${chain.min_breaking_load_kn} kN &nbsp;·&nbsp; P = ${chain.P_mm} mm
        ${chain.bolt_n_go_compatible ? "&nbsp;·&nbsp; ⚡ Bolt N Go Compatible" : ""}
      </div>
    </div>
    <div style="text-align:right;font-size:10px;color:#888">UNIKING CANADA<br>514.886.5270<br>unikingcanada.com</div>
  </div>
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:24px">
    <div>
      <table style="width:100%;border-collapse:collapse;font-size:12px">${dims}</table>
      ${flightImg}
      ${selectedPin ? `<div style="margin-top:12px;padding:8px 12px;background:#f0f4fa;border-radius:6px;font-size:12px"><strong>Pin Style:</strong> ${selectedPin}</div>` : ""}
    </div>
    <div style="text-align:center">
      <img src="${getLinkImageForType(chain.link_type)}" style="max-width:220px;border-radius:8px;border:1px solid #e2e8f0" />
      <div style="font-size:10px;color:#888;margin-top:6px">${chain.link_type} Link — ${chain.chain_link}</div>
      ${chain.bolt_n_go_compatible ? `<div style="margin-top:12px;padding:10px;background:#dcfce7;border-left:3px solid #16a34a;border-radius:4px;font-size:11px">
        <strong>⚡ Bolt N Go System Compatible</strong><br>Quick assembly — no welding required.</div>` : ""}
    </div>
  </div>
  ${spTable}${trTable}
  <div style="margin-top:24px;padding-top:10px;border-top:1px solid #e2e8f0;font-size:9px;color:#aaa;text-align:center">
    Technical data subject to change. Contact Uniking Canada for current specifications. Not for resale.
  </div>
  </body></html>`);
  w.document.close();
  setTimeout(() => w.print(), 600);
}

function getLinkImageForType(link_type) {
  if (link_type === "Double") return IMG.double;
  if (link_type === "Triple") return IMG.triple;
  return IMG.standard;
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function ForgedChainConfigurator() {
  const [chains, setChains] = useState([]);
  const [selected, setSelected] = useState(null);
  const [tab, setTab] = useState("specs");
  const [selectedFlight, setSelectedFlight] = useState(null);
  const [selectedPin, setSelectedPin] = useState(null);
  const [galleryImg, setGalleryImg] = useState(null);

  useEffect(() => {
    ForgedChain.list().then(data => {
      const sorted = [...data].sort((a, b) => a.P_mm - b.P_mm || a.chain_link.localeCompare(b.chain_link));
      setChains(sorted);
      if (sorted.length) setSelected(sorted[0]);
    });
  }, []);

  const flights = selected ? tryParse(selected.flight_options) : [];
  const pins = selected ? tryParse(selected.pin_options) : [];
  const sprockets = selected ? tryParse(selected.sprocket_data) : [];
  const trailers = selected ? tryParse(selected.trailer_data) : [];

  const galleryImages = [
    { src: IMG.chain_installed, label: "Chain Assembly" },
    { src: IMG.double_installed, label: "Double Link" },
    { src: IMG.return_cups_installed, label: "Return Cups" },
    { src: IMG.sprocket_installed, label: "Sprocket Mounted" },
    { src: IMG.chain_pins, label: "Pin Styles" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "Inter, Arial, sans-serif" }}>

      {/* Header */}
      <div style={{ background: `linear-gradient(135deg, ${C.navy} 0%, ${C.navyMid} 100%)`, padding: "20px 32px", display: "flex", alignItems: "center", gap: 16 }}>
        <button onClick={() => window.history.back()}
          style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", color: "white", padding: "6px 14px", borderRadius: 6, cursor: "pointer", fontSize: 13 }}>
          ← Back
        </button>
        <div>
          <div style={{ color: "white", fontSize: 22, fontWeight: 800, letterSpacing: 0.3 }}>Drop Forged Chain Configurator</div>
          <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 12, marginTop: 2 }}>For Drag Conveyors · 4B Components</div>
        </div>
      </div>

      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "28px 20px", display: "grid", gridTemplateColumns: "320px 1fr", gap: 24 }}>

        {/* LEFT — Chain Selector */}
        <div>
          {/* Hero image */}
          <div style={{ borderRadius: 10, overflow: "hidden", marginBottom: 16, background: C.card, border: `1px solid ${C.border}` }}>
            <img src={IMG.hero} alt="4B Drop Forged Chain" style={{ width: "100%", height: 180, objectFit: "cover" }} />
            <div style={{ padding: "12px 14px" }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: C.navyMid }}>4B Drop Forged Chain</div>
              <div style={{ fontSize: 11, color: C.muted, marginTop: 3, lineHeight: 1.5 }}>
                Case hardened alloy steel · Rockwell C57–C62 surface · C40 ductile core
              </div>
            </div>
          </div>

          {/* Chain list */}
          <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>Select Chain Link</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {chains.map(chain => {
              const isActive = selected?.id === chain.id;
              return (
                <button key={chain.id} onClick={() => { setSelected(chain); setSelectedFlight(null); setSelectedPin(null); setTab("specs"); }}
                  style={{
                    background: isActive ? C.navyMid : C.card,
                    border: `2px solid ${isActive ? C.navyMid : C.border}`,
                    borderRadius: 10, padding: "10px 12px", cursor: "pointer",
                    display: "flex", alignItems: "center", gap: 12, textAlign: "left",
                    transition: "all 0.15s",
                  }}>
                  <img src={getLinkImage(chain.link_type)} alt={chain.link_type}
                    style={{ width: 52, height: 52, objectFit: "cover", borderRadius: 6, border: "1px solid rgba(0,0,0,0.1)", background: "#f8fafc", flexShrink: 0 }} />
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14, color: isActive ? "white" : C.text }}>{chain.chain_link}</div>
                    <div style={{ fontSize: 11, color: isActive ? "rgba(255,255,255,0.7)" : C.muted, marginTop: 2 }}>
                      {chain.link_type} · P={chain.P_mm}mm · {chain.min_breaking_load_kn} kN
                    </div>
                    <div style={{ display: "flex", gap: 5, marginTop: 4, flexWrap: "wrap" }}>
                      {chain.bolt_n_go_compatible && (
                        <span style={{ fontSize: 9, background: "#dcfce7", color: C.green, padding: "1px 5px", borderRadius: 8, fontWeight: 700 }}>⚡ Bolt N Go</span>
                      )}
                      {chain.stainless_available && (
                        <span style={{ fontSize: 9, background: "#f1f5f9", color: C.muted, padding: "1px 5px", borderRadius: 8 }}>Stainless Avail.</span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* RIGHT — Detail Panel */}
        {selected && (
          <div>
            {/* Title row */}
            <div style={{ background: C.card, borderRadius: 12, border: `1px solid ${C.border}`, padding: "20px 24px", marginBottom: 20, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div style={{ fontSize: 26, fontWeight: 800, color: C.navy }}>{selected.chain_link}</div>
                <div style={{ color: C.muted, fontSize: 13, marginTop: 4 }}>
                  {selected.link_type} Link &nbsp;·&nbsp; Pitch {selected.P_mm} mm &nbsp;·&nbsp; {selected.min_breaking_load_kn} kN min breaking load
                </div>
                {selected.notes && <div style={{ marginTop: 8, fontSize: 12, color: C.muted, fontStyle: "italic" }}>{selected.notes}</div>}
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <img src={getLinkImage(selected.link_type)} alt={selected.link_type}
                  style={{ width: 90, height: 90, objectFit: "cover", borderRadius: 8, border: `1px solid ${C.border}` }} />
                <button onClick={() => printTearSheet(selected, selectedFlight, selectedPin)}
                  style={{ alignSelf: "flex-start", background: C.navyMid, color: "white", border: "none", borderRadius: 8, padding: "8px 16px", cursor: "pointer", fontSize: 12, fontWeight: 600 }}>
                  Print Tear Sheet
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div style={{ display: "flex", gap: 4, marginBottom: 16, background: C.card, padding: 6, borderRadius: 10, border: `1px solid ${C.border}` }}>
              {[
                { key: "specs", label: "Specifications" },
                { key: "schematic", label: "Schematic" },
                { key: "flights", label: `Flights (${flights.length})` },
                { key: "pins", label: `Pins (${pins.length})` },
                { key: "sprockets", label: `Sprockets (${sprockets.length})` },
                { key: "gallery", label: "Gallery" },
              ].map(t => (
                <button key={t.key} onClick={() => setTab(t.key)}
                  style={{ flex: 1, padding: "8px 4px", borderRadius: 7, border: "none", cursor: "pointer", fontWeight: 600, fontSize: 12,
                    background: tab === t.key ? C.navyMid : "transparent", color: tab === t.key ? "white" : C.muted, transition: "all 0.15s" }}>
                  {t.label}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div style={{ background: C.card, borderRadius: 12, border: `1px solid ${C.border}`, padding: 24 }}>

              {/* SPECS */}
              {tab === "specs" && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: C.navyMid, marginBottom: 12, textTransform: "uppercase", letterSpacing: 0.5 }}>Dimensions</div>
                    {[
                      ["Pitch (P)", `${selected.P_mm} mm`],
                      ["Height (H)", `${selected.H_mm} mm`],
                      ["Plate Thickness (T)", `${selected.T_mm} mm`],
                      ["Width (W)", `${selected.W_mm} mm`],
                      ["Pin-to-Edge (M)", `${selected.M_mm} mm`],
                      ["Pin Hole Dia (D)", `${selected.D_mm} mm`],
                      ...(selected.F_mm ? [["Overall Width (F)", `${selected.F_mm} mm`], ["Bar Gap (E)", `${selected.E_mm} mm`]] : []),
                    ].map(([k, v]) => (
                      <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: `1px solid ${C.border}`, fontSize: 13 }}>
                        <span style={{ color: C.muted }}>{k}</span>
                        <span style={{ fontWeight: 600, color: C.text }}>{v}</span>
                      </div>
                    ))}
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: C.navyMid, marginBottom: 12, textTransform: "uppercase", letterSpacing: 0.5 }}>Mechanical Properties</div>
                    {[
                      ["Min Breaking Load", `${selected.min_breaking_load_kn} kN`],
                      ["Case Hardness", selected.case_hardness],
                      ["Case Depth", `${selected.case_depth_mm} mm`],
                      ["Core Hardness", selected.core_hardness],
                      ["Weight per Link", `${selected.weight_per_link_kg} kg`],
                      ["Link Type", selected.link_type],
                      ["Stainless Available", selected.stainless_available ? "Yes" : "No"],
                      ["Bolt N Go", selected.bolt_n_go_compatible ? "✓ Compatible" : "No"],
                    ].map(([k, v]) => (
                      <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: `1px solid ${C.border}`, fontSize: 13 }}>
                        <span style={{ color: C.muted }}>{k}</span>
                        <span style={{ fontWeight: 600, color: k === "Bolt N Go" && v.includes("✓") ? C.green : C.text }}>{v}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* SCHEMATIC */}
              {tab === "schematic" && (
                <div style={{ display: "flex", gap: 32, alignItems: "flex-start" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: C.navyMid, marginBottom: 12 }}>Dimension Schematic</div>
                    <div style={{ background: "#f8fafc", borderRadius: 10, padding: 16, border: `1px solid ${C.border}` }}>
                      <LiveSchematicSVG chain={selected} selectedFlight={selectedFlight} selectedPin={selectedPin} />
                    </div>
                  </div>
                  <div style={{ width: 200 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: C.muted, marginBottom: 10, textTransform: "uppercase" }}>Quick Reference</div>
                    {[
                      ["P", selected.P_mm, "Pitch"],
                      ["H", selected.H_mm, "Height"],
                      ["T", selected.T_mm, "Thickness"],
                      ["W", selected.W_mm, "Width"],
                      ["D", selected.D_mm, "Pin Hole"],
                      ["M", selected.M_mm, "Pin-to-Edge"],
                      ...(selected.F_mm ? [["F", selected.F_mm, "Overall W"], ["E", selected.E_mm, "Bar Gap"]] : []),
                    ].map(([sym, val, lbl]) => (
                      <div key={sym} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                        <span style={{ width: 22, height: 22, borderRadius: 4, background: C.navyMid, color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, flexShrink: 0 }}>{sym}</span>
                        <span style={{ fontSize: 12, color: C.muted }}>{lbl}</span>
                        <span style={{ marginLeft: "auto", fontSize: 12, fontWeight: 700, color: C.text }}>{val} mm</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* FLIGHTS */}
              {tab === "flights" && (
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: C.navyMid, marginBottom: 4 }}>Welded Flight Configurations</div>
                  <div style={{ fontSize: 12, color: C.muted, marginBottom: 16 }}>Custom flights available — contact Uniking Canada for special requirements.</div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 14 }}>
                    {flights.map(f => {
                      const isActive = selectedFlight === f.name;
                      const imgSrc = IMG[f.name];
                      return (
                        <button key={f.name} onClick={() => setSelectedFlight(isActive ? null : f.name)}
                          style={{
                            background: isActive ? C.navyMid : C.card,
                            border: `2px solid ${isActive ? C.navyMid : C.border}`,
                            borderRadius: 10, padding: 0, cursor: "pointer", overflow: "hidden",
                            transition: "all 0.15s", textAlign: "left",
                          }}>
                          {imgSrc ? (
                            <img src={imgSrc} alt={f.name}
                              style={{ width: "100%", height: 110, objectFit: "contain", background: "#f8fafc", display: "block", padding: "8px 0" }} />
                          ) : (
                            <div style={{ width: "100%", height: 110, background: "#f0f4fa", display: "flex", alignItems: "center", justifyContent: "center", color: C.muted, fontSize: 28 }}>⛓</div>
                          )}
                          <div style={{ padding: "8px 10px" }}>
                            <div style={{ fontSize: 11, fontWeight: 700, color: isActive ? "white" : C.text, lineHeight: 1.3 }}>{f.name}</div>
                            {f.style !== "Custom" && <div style={{ fontSize: 10, color: isActive ? "rgba(255,255,255,0.65)" : C.muted, marginTop: 2 }}>Style {f.style}</div>}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                  {selectedFlight && (
                    <div style={{ marginTop: 20, padding: "14px 18px", background: "#f0f4fa", borderRadius: 10, border: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: 16 }}>
                      {IMG[selectedFlight] && <img src={IMG[selectedFlight]} alt={selectedFlight} style={{ width: 100, height: 80, objectFit: "contain", borderRadius: 6, background: "#fff", padding: 4, border: `1px solid ${C.border}` }} />}
                      <div>
                        <div style={{ fontWeight: 700, color: C.navyMid }}>Selected: {selectedFlight}</div>
                        <div style={{ fontSize: 12, color: C.muted, marginTop: 3 }}>This flight configuration will be noted on your tear sheet.</div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* PINS */}
              {tab === "pins" && (
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: C.navyMid, marginBottom: 4 }}>Pin & Assembly Options</div>
                  <div style={{ marginBottom: 16 }}>
                    <img src={IMG.chain_pins} alt="Pin styles" style={{ width: "100%", maxWidth: 360, height: 180, objectFit: "contain", borderRadius: 8, background: "#f8fafc", border: `1px solid ${C.border}` }} />
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {pins.map(p => {
                      const isActive = selectedPin === p.name;
                      return (
                        <button key={p.name} onClick={() => setSelectedPin(isActive ? null : p.name)}
                          style={{
                            background: isActive ? C.navyMid : C.card,
                            border: `2px solid ${isActive ? C.navyMid : C.border}`,
                            borderRadius: 10, padding: "14px 18px", cursor: "pointer",
                            display: "flex", alignItems: "center", gap: 12, textAlign: "left",
                            transition: "all 0.15s",
                          }}>
                          <div style={{ width: 32, height: 32, borderRadius: "50%", background: isActive ? "rgba(255,255,255,0.15)" : "#f0f4fa", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>🔩</div>
                          <div style={{ fontWeight: 600, fontSize: 13, color: isActive ? "white" : C.text }}>{p.name}</div>
                          {isActive && <span style={{ marginLeft: "auto", fontSize: 11, color: "rgba(255,255,255,0.7)" }}>Selected ✓</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* SPROCKETS */}
              {tab === "sprockets" && (
                <div>
                  {sprockets.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "40px 20px", color: C.muted }}>
                      <img src={IMG.sprocket_installed} alt="Sprocket" style={{ width: 180, height: 130, objectFit: "cover", borderRadius: 8, marginBottom: 12, opacity: 0.6 }} />
                      <div style={{ fontWeight: 600 }}>No sprocket data for this chain size.</div>
                      <div style={{ fontSize: 12, marginTop: 4 }}>Contact Uniking Canada for sprocket options.</div>
                    </div>
                  ) : (
                    <div>
                      <div style={{ display: "flex", gap: 16, marginBottom: 18, alignItems: "flex-start" }}>
                        <img src={IMG.sprocket_installed} alt="Sprocket installed" style={{ width: 160, height: 110, objectFit: "cover", borderRadius: 8, border: `1px solid ${C.border}` }} />
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 700, color: C.navyMid }}>Sprocket Data — {selected.sprocket_family}</div>
                          <div style={{ fontSize: 12, color: C.muted, marginTop: 4 }}>High grade heat treated steel · Rockwell C53–C57 · Segmented teeth available</div>
                        </div>
                      </div>
                      <div style={{ overflowX: "auto" }}>
                        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                          <thead>
                            <tr style={{ background: C.navyMid, color: "white" }}>
                              {["Teeth","PCD mm","ØA mm","ØB mm","ØC max","Bolts","T mm","WB1 mm"].map(h => (
                                <th key={h} style={{ padding: "8px 10px", textAlign: "center", fontWeight: 600 }}>{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {sprockets.map((s, i) => (
                              <tr key={i} style={{ background: i % 2 ? "#f5f7fb" : "white" }}>
                                {[s.teeth, s.pcd_mm, s.A_mm, s.B_mm, s.C_max_mm, s.bolts, s.T_mm, s.WB1_mm].map((v, j) => (
                                  <td key={j} style={{ padding: "7px 10px", textAlign: "center", borderBottom: `1px solid ${C.border}` }}>{v}</td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      {trailers.length > 0 && (
                        <div style={{ marginTop: 24 }}>
                          <div style={{ fontSize: 13, fontWeight: 700, color: C.navyMid, marginBottom: 10 }}>Trailer / Return Wheel Data</div>
                          <div style={{ overflowX: "auto" }}>
                            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                              <thead>
                                <tr style={{ background: C.navyLight, color: "white" }}>
                                  {["PCD mm","C max (smooth)","WB2 smooth","WB3 segmental","T1 rim"].map(h => (
                                    <th key={h} style={{ padding: "8px 10px", textAlign: "center", fontWeight: 600 }}>{h}</th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                {trailers.map((t, i) => (
                                  <tr key={i} style={{ background: i % 2 ? "#f5f7fb" : "white" }}>
                                    {[t.pcd_mm, t.C_max_smooth_mm, t.WB2_smooth_mm, t.WB3_segmental_mm, t.T1_rim_width_mm].map((v, j) => (
                                      <td key={j} style={{ padding: "7px 10px", textAlign: "center", borderBottom: `1px solid ${C.border}` }}>{v}</td>
                                    ))}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* GALLERY */}
              {tab === "gallery" && (
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: C.navyMid, marginBottom: 16 }}>Product Gallery — 4B Drop Forged Chain</div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 14 }}>
                    {galleryImages.map((g, i) => (
                      <div key={i} onClick={() => setGalleryImg(g)} style={{ cursor: "pointer", borderRadius: 10, overflow: "hidden", border: `1px solid ${C.border}`, background: "#f8fafc" }}>
                        <img src={g.src} alt={g.label} style={{ width: "100%", height: 160, objectFit: "cover", display: "block" }} />
                        <div style={{ padding: "8px 12px", fontSize: 12, color: C.muted, fontWeight: 600 }}>{g.label}</div>
                      </div>
                    ))}
                    {/* Link types */}
                    {[{ src: IMG.standard, label: "Standard Link" }, { src: IMG.double, label: "Double Link" }, { src: IMG.triple, label: "Triple Link" }].map((g, i) => (
                      <div key={"lt" + i} onClick={() => setGalleryImg(g)} style={{ cursor: "pointer", borderRadius: 10, overflow: "hidden", border: `1px solid ${C.border}`, background: "#f8fafc" }}>
                        <img src={g.src} alt={g.label} style={{ width: "100%", height: 160, objectFit: "contain", display: "block", padding: "8px 0", background: "#f8fafc" }} />
                        <div style={{ padding: "8px 12px", fontSize: 12, color: C.muted, fontWeight: 600 }}>{g.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Gallery lightbox */}
      {galleryImg && (
        <div onClick={() => setGalleryImg(null)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999, cursor: "pointer" }}>
          <div onClick={e => e.stopPropagation()} style={{ background: "white", borderRadius: 14, padding: 20, maxWidth: "80vw", maxHeight: "80vh", overflow: "hidden" }}>
            <img src={galleryImg.src} alt={galleryImg.label} style={{ maxWidth: "100%", maxHeight: "60vh", objectFit: "contain", borderRadius: 8 }} />
            <div style={{ textAlign: "center", marginTop: 12, fontWeight: 700, color: C.navyMid }}>{galleryImg.label}</div>
            <button onClick={() => setGalleryImg(null)} style={{ display: "block", margin: "12px auto 0", background: C.navyMid, color: "white", border: "none", borderRadius: 8, padding: "8px 24px", cursor: "pointer" }}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
