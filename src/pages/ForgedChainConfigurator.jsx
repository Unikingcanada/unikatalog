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

function tryParse(val) {
  try { return JSON.parse(val || "[]"); } catch { return []; }
}

// ── Hero image map (using existing catalog images as stand-ins, or SVG placeholders) ──
function ChainHeroSVG({ chain, size = 180 }) {
  const { P_mm = 142, H_mm = 50, T_mm = 12, D_mm = 25 } = chain;
  const scale = Math.min((size * 0.6) / P_mm, (size * 0.4) / H_mm, 1.6);
  const sW = Math.round(P_mm * scale);
  const sH = Math.round(H_mm * scale);
  const sT = Math.max(5, Math.round(T_mm * scale));
  const sD = Math.round(D_mm * scale * 0.55);
  const cx = size / 2, cy = size / 2;
  const x0 = cx - sW / 2, x1 = cx + sW / 2;
  const y0 = cy - sH / 2, y1 = cy + sH / 2;
  const hL = { x: x0 + sD * 0.9, y: cy };
  const hR = { x: x1 - sD * 0.9, y: cy };

  return (
    <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size}>
      {/* shadow */}
      <ellipse cx={cx} cy={y1 + 8} rx={sW * 0.45} ry={6} fill="rgba(0,0,0,0.10)" />
      {/* body */}
      <rect x={x0} y={y0} width={sW} height={sH} rx={sH * 0.38} ry={sH * 0.38}
        fill="#c8d4e8" stroke={C.navyMid} strokeWidth="2" />
      {/* inner cutout */}
      <rect x={x0 + sD * 1.7} y={y0 + sT} width={sW - sD * 3.4} height={sH - sT * 2}
        rx={5} ry={5} fill="#a8b8d0" stroke={C.navyMid} strokeWidth="1.2" />
      {/* pin holes */}
      <circle cx={hL.x} cy={hL.y} r={sD / 2} fill="#6a8cb8" stroke={C.navyMid} strokeWidth="1.8" />
      <circle cx={hR.x} cy={hR.y} r={sD / 2} fill="#6a8cb8" stroke={C.navyMid} strokeWidth="1.8" />
      {/* pitch label */}
      <text x={cx} y={y1 + 20} textAnchor="middle" fontSize="9" fill={C.muted} fontFamily="Arial">P = {P_mm} mm</text>
    </svg>
  );
}

// ── Live Schematic with labeled dimensions ──
function LiveSchematicSVG({ chain, selectedFlight, selectedPin }) {
  if (!chain) return null;
  const { P_mm = 142, H_mm = 50, T_mm = 12, W_mm = 42, M_mm = 18.7, D_mm = 25, F_mm, E_mm, link_type } = chain;
  const W = 340, H = 240;
  const scale = Math.min((W * 0.5) / P_mm, (H * 0.45) / H_mm, 1.6);
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
      <defs>
        {arr("ar", false)}{arr("al", true)}
      </defs>

      {/* Double/Triple bars */}
      {(isDouble || isTriple) && <>
        <rect x={x0 - 6} y={y0 - 12} width={sW + 12} height={8} rx={2} fill="#a8b8d0" stroke={C.navyMid} strokeWidth="1.2" opacity="0.85" />
        <rect x={x0 - 6} y={y1 + 4} width={sW + 12} height={8} rx={2} fill="#a8b8d0" stroke={C.navyMid} strokeWidth="1.2" opacity="0.85" />
        {isTriple && <rect x={x0 - 6} y={y1 + 16} width={sW + 12} height={8} rx={2} fill="#a8b8d0" stroke={C.navyMid} strokeWidth="1.2" opacity="0.7" />}
      </>}

      {/* Link body */}
      <rect x={x0} y={y0} width={sW} height={sH} rx={sH * 0.36} ry={sH * 0.36}
        fill="#c8d4e8" stroke={C.navyMid} strokeWidth="2" />
      <rect x={x0 + sD * 1.7} y={y0 + sT} width={sW - sD * 3.4} height={sH - sT * 2}
        rx={5} ry={5} fill="#a8b8d0" stroke={C.navyMid} strokeWidth="1.2" />
      <circle cx={hL.x} cy={hL.y} r={sD / 2} fill="#6a8cb8" stroke={C.navyMid} strokeWidth="1.8" />
      <circle cx={hR.x} cy={hR.y} r={sD / 2} fill="#6a8cb8" stroke={C.navyMid} strokeWidth="1.8" />

      {/* P — pitch */}
      <line x1={hL.x} y1={y1 + 18} x2={hR.x} y2={y1 + 18} stroke="#444" strokeWidth="0.8" markerEnd="url(#ar)" markerStart="url(#al)" />
      <line x1={hL.x} y1={cy + sD / 2} x2={hL.x} y2={y1 + 16} stroke="#bbb" strokeWidth="0.6" strokeDasharray="3,2" />
      <line x1={hR.x} y1={cy + sD / 2} x2={hR.x} y2={y1 + 16} stroke="#bbb" strokeWidth="0.6" strokeDasharray="3,2" />
      <text x={cx} y={y1 + 28} textAnchor="middle" fontSize="8.5" fill="#333">P = {P_mm} mm</text>

      {/* H — height */}
      <line x1={x1 + 12} y1={y0} x2={x1 + 12} y2={y1} stroke="#444" strokeWidth="0.8" markerEnd="url(#ar)" markerStart="url(#al)" />
      <text x={x1 + 16} y={cy + 3} textAnchor="start" fontSize="8" fill="#333">H={H_mm}</text>

      {/* T — thickness */}
      <line x1={x1 + 28} y1={y0} x2={x1 + 28} y2={y0 + sT} stroke="#444" strokeWidth="0.8" markerEnd="url(#ar)" markerStart="url(#al)" />
      <text x={x1 + 32} y={y0 + sT / 2 + 3} textAnchor="start" fontSize="7.5" fill="#555">T={T_mm}</text>

      {/* W — width top */}
      <line x1={x0} y1={y0 - 14} x2={x1} y2={y0 - 14} stroke="#444" strokeWidth="0.8" markerEnd="url(#ar)" markerStart="url(#al)" />
      <text x={cx} y={y0 - 17} textAnchor="middle" fontSize="8.5" fill="#333">W = {W_mm} mm</text>

      {/* D — pin hole */}
      <line x1={hL.x - sD / 2} y1={cy - sD / 2 - 5} x2={hL.x + sD / 2} y2={cy - sD / 2 - 5} stroke="#c33" strokeWidth="0.8" markerEnd="url(#ar)" markerStart="url(#al)" />
      <text x={hL.x} y={cy - sD / 2 - 8} textAnchor="middle" fontSize="7.5" fill="#c33">D={D_mm}</text>

      {/* Selected flight/pin labels */}
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

  const dims = [
    ["Pitch (P)", `${chain.P_mm} mm`], ["Height (H)", `${chain.H_mm} mm`],
    ["Thickness (T)", `${chain.T_mm} mm`], ["Width (W)", `${chain.W_mm} mm`],
    ["Pin-to-Edge (M)", `${chain.M_mm} mm`], ["Pin Hole Dia (D)", `${chain.D_mm} mm`],
    ...(chain.F_mm ? [["Overall Width (F)", `${chain.F_mm} mm`], ["Bar Gap (E)", `${chain.E_mm} mm`]] : []),
    ["Breaking Load", `${chain.min_breaking_load_kn} kN`],
    ["Case Hardness", chain.case_hardness], ["Case Depth", `${chain.case_depth_mm} mm`],
    ["Core Hardness", chain.core_hardness], ["Weight / Link", `${chain.weight_per_link_kg} kg`],
  ].map(([k, v], i) => `<tr style="background:${i%2?"#f5f7fb":"white"}"><td style="padding:5px 10px;color:#555">${k}</td><td style="padding:5px 10px;font-weight:600">${v}</td></tr>`).join("");

  w.document.write(`<!DOCTYPE html><html><head><title>Forged Chain ${chain.chain_link}</title>
  <style>body{font-family:Arial,sans-serif;margin:28px;color:#222}@media print{body{margin:14px}}</style></head><body>
  <div style="display:flex;justify-content:space-between;align-items:center;border-bottom:3px solid #1B3A6B;padding-bottom:10px;margin-bottom:18px">
    <div><div style="font-size:22px;font-weight:800;color:#1B3A6B">Drop Forged Chain — ${chain.chain_link}</div>
    <div style="color:#555;font-size:12px;margin-top:3px">${chain.link_type} Link &nbsp;·&nbsp; ${chain.min_breaking_load_kn} kN &nbsp;·&nbsp; P = ${chain.P_mm} mm ${chain.bolt_n_go_compatible?"&nbsp;·&nbsp; ⚡ Bolt N Go Compatible":""}</div></div>
    <div style="text-align:right;font-size:10px;color:#888">UNIKING CANADA<br>514.886.5270<br>unikingcanada.com</div>
  </div>
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:24px">
    <table style="width:100%;border-collapse:collapse;font-size:12px">${dims}</table>
    <div>
      ${selectedFlight ? `<div style="margin-bottom:10px;padding:10px;background:#f0f4fa;border-radius:6px"><strong>Selected Flight:</strong> ${selectedFlight}</div>` : ""}
      ${selectedPin ? `<div style="margin-bottom:10px;padding:10px;background:#f0f4fa;border-radius:6px"><strong>Selected Pin:</strong> ${selectedPin}</div>` : ""}
      ${chain.bolt_n_go_compatible ? `<div style="padding:10px;background:#dcfce7;border-left:3px solid #16a34a;border-radius:4px;font-size:11px"><strong>⚡ Bolt N Go System</strong><br>Hollow pin with bolt and lock nut — no circlips, no welding. Flights bolt directly to chain.</div>` : ""}
      ${chain.notes ? `<div style="margin-top:10px;padding:10px;background:#fff8e1;border-left:3px solid #f0a800;border-radius:4px;font-size:11px">${chain.notes}</div>` : ""}
    </div>
  </div>
  ${spTable}
  <div style="margin-top:24px;font-size:10px;color:#aaa;border-top:1px solid #eee;padding-top:8px">For reference only — no pricing. Specifications subject to change. Contact Uniking Canada for application-specific guidance.</div>
  </body></html>`);
  w.document.close();
  setTimeout(() => w.print(), 400);
}

// ── FLIGHT ICONS (inline SVG) ─────────────────────────────────────────────
const FLIGHT_ICONS = {
  "Square Bar Flight": (<svg viewBox="0 0 70 50" width="56" height="40"><rect x="5" y="23" width="60" height="7" fill="#8a9ab0" stroke="#1B3A6B" strokeWidth="1.5"/><rect x="26" y="8" width="7" height="21" fill="#6a7a90" stroke="#1B3A6B" strokeWidth="1.2"/><circle cx="16" cy="26" r="5" fill="#6a8cb8" stroke="#1B3A6B" strokeWidth="1.5"/><circle cx="52" cy="26" r="5" fill="#6a8cb8" stroke="#1B3A6B" strokeWidth="1.5"/></svg>),
  "Flat Bar Flight": (<svg viewBox="0 0 70 50" width="56" height="40"><rect x="5" y="23" width="60" height="7" fill="#8a9ab0" stroke="#1B3A6B" strokeWidth="1.5"/><rect x="22" y="12" width="20" height="5" fill="#6a7a90" stroke="#1B3A6B" strokeWidth="1.2"/><circle cx="16" cy="26" r="5" fill="#6a8cb8" stroke="#1B3A6B" strokeWidth="1.5"/><circle cx="52" cy="26" r="5" fill="#6a8cb8" stroke="#1B3A6B" strokeWidth="1.5"/></svg>),
  "Paddle Flight": (<svg viewBox="0 0 70 50" width="56" height="40"><rect x="5" y="23" width="60" height="7" fill="#8a9ab0" stroke="#1B3A6B" strokeWidth="1.5"/><ellipse cx="35" cy="12" rx="12" ry="7" fill="#6a7a90" stroke="#1B3A6B" strokeWidth="1.2"/><rect x="32" y="12" width="6" height="13" fill="#6a7a90" stroke="#1B3A6B" strokeWidth="1"/><circle cx="16" cy="26" r="5" fill="#6a8cb8" stroke="#1B3A6B" strokeWidth="1.5"/><circle cx="52" cy="26" r="5" fill="#6a8cb8" stroke="#1B3A6B" strokeWidth="1.5"/></svg>),
  "U Flight": (<svg viewBox="0 0 70 50" width="56" height="40"><rect x="5" y="25" width="60" height="7" fill="#8a9ab0" stroke="#1B3A6B" strokeWidth="1.5"/><path d="M22,25 L22,10 L17,10" fill="none" stroke="#1B3A6B" strokeWidth="2"/><path d="M46,25 L46,10 L51,10" fill="none" stroke="#1B3A6B" strokeWidth="2"/><circle cx="16" cy="29" r="5" fill="#6a8cb8" stroke="#1B3A6B" strokeWidth="1.5"/><circle cx="52" cy="29" r="5" fill="#6a8cb8" stroke="#1B3A6B" strokeWidth="1.5"/></svg>),
  "Closed U Flight": (<svg viewBox="0 0 70 50" width="56" height="40"><rect x="5" y="25" width="60" height="7" fill="#8a9ab0" stroke="#1B3A6B" strokeWidth="1.5"/><path d="M22,25 L22,9 L46,9 L46,25" fill="#c8d4e8" stroke="#1B3A6B" strokeWidth="1.8"/><circle cx="16" cy="29" r="5" fill="#6a8cb8" stroke="#1B3A6B" strokeWidth="1.5"/><circle cx="52" cy="29" r="5" fill="#6a8cb8" stroke="#1B3A6B" strokeWidth="1.5"/></svg>),
  "Closed U Flight with Filler Plates": (<svg viewBox="0 0 70 50" width="56" height="40"><rect x="5" y="25" width="60" height="7" fill="#8a9ab0" stroke="#1B3A6B" strokeWidth="1.5"/><path d="M22,25 L22,9 L46,9 L46,25" fill="#c8d4e8" stroke="#1B3A6B" strokeWidth="1.8"/><rect x="22" y="9" width="24" height="4" fill="#9ab0c8" stroke="#1B3A6B" strokeWidth="0.8"/><circle cx="16" cy="29" r="5" fill="#6a8cb8" stroke="#1B3A6B" strokeWidth="1.5"/><circle cx="52" cy="29" r="5" fill="#6a8cb8" stroke="#1B3A6B" strokeWidth="1.5"/></svg>),
  "00 Flight": (<svg viewBox="0 0 70 50" width="56" height="40"><rect x="5" y="22" width="60" height="7" fill="#8a9ab0" stroke="#1B3A6B" strokeWidth="1.5"/><rect x="18" y="8" width="30" height="5" fill="#6a7a90" stroke="#1B3A6B" strokeWidth="1.2"/><rect x="18" y="38" width="30" height="5" fill="#6a7a90" stroke="#1B3A6B" strokeWidth="1.2"/><circle cx="16" cy="25" r="5" fill="#6a8cb8" stroke="#1B3A6B" strokeWidth="1.5"/><circle cx="52" cy="25" r="5" fill="#6a8cb8" stroke="#1B3A6B" strokeWidth="1.5"/></svg>),
  "Return Cups": (<svg viewBox="0 0 70 50" width="56" height="40"><rect x="5" y="22" width="60" height="7" fill="#8a9ab0" stroke="#1B3A6B" strokeWidth="1.5"/><path d="M24,29 Q35,44 46,29" fill="#b0c4d8" stroke="#1B3A6B" strokeWidth="1.5"/><circle cx="16" cy="25" r="5" fill="#6a8cb8" stroke="#1B3A6B" strokeWidth="1.5"/><circle cx="52" cy="25" r="5" fill="#6a8cb8" stroke="#1B3A6B" strokeWidth="1.5"/></svg>),
  "00 Flight with Filler Plates": (<svg viewBox="0 0 70 50" width="56" height="40"><rect x="5" y="22" width="60" height="7" fill="#8a9ab0" stroke="#1B3A6B" strokeWidth="1.5"/><rect x="18" y="8" width="30" height="5" fill="#6a7a90" stroke="#1B3A6B" strokeWidth="1.2"/><rect x="18" y="38" width="30" height="5" fill="#6a7a90" stroke="#1B3A6B" strokeWidth="1.2"/><rect x="15" y="8" width="4" height="35" fill="#9ab0c8" stroke="#1B3A6B" strokeWidth="0.8"/><rect x="50" y="8" width="4" height="35" fill="#9ab0c8" stroke="#1B3A6B" strokeWidth="0.8"/><circle cx="16" cy="25" r="5" fill="#6a8cb8" stroke="#1B3A6B" strokeWidth="1.5"/><circle cx="52" cy="25" r="5" fill="#6a8cb8" stroke="#1B3A6B" strokeWidth="1.5"/></svg>),
  "Custom Flight": (<svg viewBox="0 0 70 50" width="56" height="40"><rect x="5" y="22" width="60" height="7" fill="#8a9ab0" stroke="#1B3A6B" strokeWidth="1.5"/><text x="35" y="18" textAnchor="middle" fontSize="8" fill="#1B3A6B" fontWeight="bold">CUSTOM</text><circle cx="16" cy="25" r="5" fill="#6a8cb8" stroke="#1B3A6B" strokeWidth="1.5"/><circle cx="52" cy="25" r="5" fill="#6a8cb8" stroke="#1B3A6B" strokeWidth="1.5"/></svg>),
};

const TYPE_COLOR = { Standard: C.navyMid, Double: "#7c3aed", Triple: "#b45309" };
const TYPE_BG    = { Standard: "#e8edf5", Double: "#ede9fe", Triple: "#fef3c7" };

// ════════════════════════════════════════════════════════════════════════════
// PRODUCT DETAIL PAGE
// ════════════════════════════════════════════════════════════════════════════
function ProductDetail({ chain, onBack }) {
  const [activeTab, setActiveTab] = useState("specs");
  const [selectedFlight, setSelectedFlight] = useState(null);
  const [selectedPin, setSelectedPin]       = useState(null);

  const flights   = tryParse(chain.flight_options);
  const pins      = tryParse(chain.pin_options);
  const sprockets = tryParse(chain.sprocket_data);
  const trailers  = tryParse(chain.trailer_data);

  const tabs = [
    { id: "specs",     label: "Specs" },
    { id: "configure", label: "Configure" },
    { id: "flights",   label: "Flights" },
    { id: "pins",      label: "Pins" },
    { id: "sprockets", label: `Sprockets${sprockets.length ? ` (${sprockets.length})` : ""}` },
  ];

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "Arial, sans-serif" }}>

      {/* Top bar */}
      <div style={{ position: "sticky", top: 0, zIndex: 20, background: C.navy, color: "white",
        display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", boxShadow: "0 2px 8px rgba(0,0,0,0.25)" }}>
        <button onClick={onBack} style={{ background: "rgba(255,255,255,0.15)", border: "none", color: "white",
          borderRadius: 8, padding: "6px 12px", cursor: "pointer", fontSize: 13, display: "flex", alignItems: "center", gap: 4 }}>
          ← Back
        </button>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 800, fontSize: 17 }}>{chain.chain_link}</div>
          <div style={{ fontSize: 11, opacity: 0.75 }}>{chain.link_type} Link · {chain.min_breaking_load_kn} kN · P={chain.P_mm} mm</div>
        </div>
        <button onClick={() => printTearSheet(chain, selectedFlight, selectedPin)}
          style={{ background: C.gold, border: "none", color: C.navy, borderRadius: 8,
            padding: "8px 14px", cursor: "pointer", fontSize: 12, fontWeight: 700 }}>
          Print
        </button>
      </div>

      {/* Hero section */}
      <div style={{ background: "white", padding: "24px 20px 0", textAlign: "center",
        borderBottom: `1px solid ${C.border}` }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 8 }}>
          <ChainHeroSVG chain={chain} size={200} />
        </div>
        <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap", paddingBottom: 16 }}>
          <span style={{ background: TYPE_BG[chain.link_type], color: TYPE_COLOR[chain.link_type],
            borderRadius: 20, padding: "3px 12px", fontSize: 12, fontWeight: 700 }}>{chain.link_type} Link</span>
          {chain.bolt_n_go_compatible && (
            <span style={{ background: C.greenBg, color: C.green, borderRadius: 20, padding: "3px 12px", fontSize: 12, fontWeight: 700 }}>⚡ Bolt N Go</span>
          )}
          {chain.stainless_available && (
            <span style={{ background: "#e8f0fe", color: C.navyMid, borderRadius: 20, padding: "3px 12px", fontSize: 12 }}>Stainless Available</span>
          )}
        </div>
      </div>

      {/* Tab bar */}
      <div style={{ background: "white", borderBottom: `2px solid ${C.border}`,
        display: "flex", overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            style={{ flexShrink: 0, padding: "12px 16px", border: "none", background: "transparent", cursor: "pointer",
              fontSize: 13, fontWeight: activeTab === t.id ? 700 : 400,
              color: activeTab === t.id ? C.navyMid : C.muted,
              borderBottom: activeTab === t.id ? `3px solid ${C.navyMid}` : "3px solid transparent",
              marginBottom: -2, whiteSpace: "nowrap" }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div style={{ padding: "16px" }}>

        {/* ── SPECS ── */}
        {activeTab === "specs" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ background: "white", borderRadius: 12, padding: 16, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
              <div style={{ fontWeight: 700, color: C.navyMid, marginBottom: 12, fontSize: 14 }}>Link Dimensions</div>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <tbody>
                  {[
                    ["Pitch (P)", `${chain.P_mm} mm`],
                    ["Height (H)", `${chain.H_mm} mm`],
                    ["Thickness (T)", `${chain.T_mm} mm`],
                    ["Width (W)", `${chain.W_mm} mm`],
                    ["Pin-to-Edge (M)", `${chain.M_mm} mm`],
                    ["Pin Hole Dia (D)", `${chain.D_mm} mm`],
                    ...(chain.F_mm ? [["Overall Width (F)", `${chain.F_mm} mm`], ["Bar Gap (E)", `${chain.E_mm} mm`], ["Hole Dia (B)", `${chain.B_mm} mm`]] : []),
                  ].map(([k, v], i) => (
                    <tr key={k} style={{ background: i % 2 ? "#f7f9fd" : "white" }}>
                      <td style={{ padding: "8px 10px", color: C.muted, fontSize: 13 }}>{k}</td>
                      <td style={{ padding: "8px 10px", fontWeight: 700, color: C.navyMid, textAlign: "right" }}>{v}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ background: "white", borderRadius: 12, padding: 16, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
              <div style={{ fontWeight: 700, color: C.navyMid, marginBottom: 12, fontSize: 14 }}>Material & Strength</div>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <tbody>
                  {[
                    ["Min Breaking Load", `${chain.min_breaking_load_kn} kN`],
                    ["Case Hardness", chain.case_hardness],
                    ["Case Depth", `${chain.case_depth_mm} mm`],
                    ["Core Hardness", chain.core_hardness],
                    ["Weight / Link", `${chain.weight_per_link_kg} kg`],
                    ["Bolt N Go", chain.bolt_n_go_compatible ? "Compatible ✅" : "Not compatible"],
                    ["Stainless Steel", chain.stainless_available ? "Available on request" : "N/A"],
                  ].map(([k, v], i) => (
                    <tr key={k} style={{ background: i % 2 ? "#f7f9fd" : "white" }}>
                      <td style={{ padding: "8px 10px", color: C.muted, fontSize: 13 }}>{k}</td>
                      <td style={{ padding: "8px 10px", fontWeight: 600, textAlign: "right" }}>{v}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {chain.bolt_n_go_compatible && (
              <div style={{ background: C.greenBg, borderLeft: `4px solid ${C.green}`, borderRadius: 10, padding: "14px 16px" }}>
                <div style={{ fontWeight: 700, color: C.green, fontSize: 14, marginBottom: 4 }}>⚡ Bolt N Go System</div>
                <div style={{ fontSize: 13, color: "#166534", lineHeight: 1.5 }}>
                  Hollow pin with standard bolt and lock nut. No circlips, no welding. Flights bolt directly — no need to remove chain from conveyor.
                </div>
                <div style={{ marginTop: 6, fontSize: 10, color: "#4ade80" }}>US Pat. 7,080,728 · Canadian Pat. 2,548,660</div>
              </div>
            )}

            {chain.notes && (
              <div style={{ background: "#fff8e1", borderLeft: "4px solid #f0a800", borderRadius: 10, padding: "12px 16px", fontSize: 13, color: "#555" }}>
                {chain.notes}
              </div>
            )}
          </div>
        )}

        {/* ── CONFIGURE (Live Schematic) ── */}
        {activeTab === "configure" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ background: "white", borderRadius: 12, padding: 16, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
              <div style={{ fontWeight: 700, color: C.navyMid, marginBottom: 12, fontSize: 14 }}>Live Schematic</div>
              <div style={{ background: "#f4f7fb", borderRadius: 10, padding: "20px 8px", display: "flex", justifyContent: "center" }}>
                <LiveSchematicSVG chain={chain} selectedFlight={selectedFlight} selectedPin={selectedPin} />
              </div>
            </div>

            {/* Quick selectors */}
            <div style={{ background: "white", borderRadius: 12, padding: 16, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
              <div style={{ fontWeight: 700, color: C.navyMid, marginBottom: 10, fontSize: 14 }}>Select Flight</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {flights.map(f => (
                  <button key={f.name} onClick={() => setSelectedFlight(selectedFlight === f.name ? null : f.name)}
                    style={{ padding: "6px 12px", borderRadius: 20, border: `1.5px solid ${selectedFlight === f.name ? C.navyMid : C.border}`,
                      background: selectedFlight === f.name ? C.navyMid : "white",
                      color: selectedFlight === f.name ? "white" : C.text,
                      fontSize: 12, cursor: "pointer", fontWeight: selectedFlight === f.name ? 700 : 400 }}>
                    {f.name}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ background: "white", borderRadius: 12, padding: 16, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
              <div style={{ fontWeight: 700, color: C.navyMid, marginBottom: 10, fontSize: 14 }}>Select Pin</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {pins.map(p => (
                  <button key={p.name} onClick={() => setSelectedPin(selectedPin === p.name ? null : p.name)}
                    style={{ padding: "6px 12px", borderRadius: 20, border: `1.5px solid ${selectedPin === p.name ? C.green : C.border}`,
                      background: selectedPin === p.name ? C.green : "white",
                      color: selectedPin === p.name ? "white" : C.text,
                      fontSize: 12, cursor: "pointer", fontWeight: selectedPin === p.name ? 700 : 400 }}>
                    {p.name}
                  </button>
                ))}
              </div>
            </div>

            {(selectedFlight || selectedPin) && (
              <div style={{ background: C.navyMid, borderRadius: 12, padding: 16, color: "white" }}>
                <div style={{ fontWeight: 700, marginBottom: 8, fontSize: 14 }}>Your Configuration</div>
                {selectedFlight && <div style={{ fontSize: 13, marginBottom: 4 }}>✓ Flight: <strong>{selectedFlight}</strong></div>}
                {selectedPin    && <div style={{ fontSize: 13, marginBottom: 8 }}>✓ Pin: <strong>{selectedPin}</strong></div>}
                <button onClick={() => printTearSheet(chain, selectedFlight, selectedPin)}
                  style={{ background: C.gold, color: C.navy, border: "none", borderRadius: 8,
                    padding: "8px 16px", fontWeight: 700, fontSize: 13, cursor: "pointer", width: "100%" }}>
                  Print Tear Sheet with This Config
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── FLIGHTS ── */}
        {activeTab === "flights" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ fontSize: 13, color: C.muted, marginBottom: 4 }}>
              Tap a flight to select it. Your selection appears on the live schematic and printed tear sheet.
            </div>
            {flights.map(f => {
              const sel = selectedFlight === f.name;
              return (
                <button key={f.name} onClick={() => setSelectedFlight(sel ? null : f.name)}
                  style={{ background: "white", border: `2px solid ${sel ? C.navyMid : C.border}`, borderRadius: 12,
                    padding: "14px 16px", cursor: "pointer", textAlign: "left", display: "flex", alignItems: "center", gap: 14,
                    boxShadow: sel ? `0 0 0 3px ${C.bg}` : "0 1px 3px rgba(0,0,0,0.05)" }}>
                  <div style={{ flexShrink: 0 }}>
                    {FLIGHT_ICONS[f.name] || <div style={{ width: 56, height: 40, background: "#eee", borderRadius: 6 }} />}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 13, color: sel ? C.navyMid : C.text }}>{f.name}</div>
                  </div>
                  {sel && <div style={{ color: C.navyMid, fontWeight: 700, fontSize: 16 }}>✓</div>}
                </button>
              );
            })}
          </div>
        )}

        {/* ── PINS ── */}
        {activeTab === "pins" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ fontSize: 13, color: C.muted, marginBottom: 4 }}>
              Select the pin type for this chain link.
            </div>
            {pins.map((p, i) => {
              const sel = selectedPin === p.name;
              const isBNG = p.name.toLowerCase().includes("bolt");
              return (
                <button key={i} onClick={() => setSelectedPin(sel ? null : p.name)}
                  style={{ background: "white", border: `2px solid ${sel ? C.green : C.border}`, borderRadius: 12,
                    padding: "14px 16px", cursor: "pointer", textAlign: "left", display: "flex", alignItems: "center", gap: 14,
                    boxShadow: sel ? `0 0 0 3px #dcfce7` : "0 1px 3px rgba(0,0,0,0.05)" }}>
                  <div style={{ width: 40, height: 40, borderRadius: "50%", flexShrink: 0,
                    background: isBNG ? C.greenBg : C.bg,
                    display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>
                    {isBNG ? "⚡" : "🔩"}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 13, color: sel ? C.green : C.text }}>{p.name}</div>
                    {p.description && <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>{p.description}</div>}
                  </div>
                  {sel && <div style={{ color: C.green, fontWeight: 700, fontSize: 16 }}>✓</div>}
                </button>
              );
            })}
          </div>
        )}

        {/* ── SPROCKETS ── */}
        {activeTab === "sprockets" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {sprockets.length > 0 ? (
              <div style={{ background: "white", borderRadius: 12, padding: 16, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
                <div style={{ fontWeight: 700, color: C.navyMid, marginBottom: 4, fontSize: 14 }}>
                  Standard Sprockets — {chain.sprocket_family}
                </div>
                <div style={{ fontSize: 12, color: C.muted, marginBottom: 12 }}>
                  Heat treated steel. Bore & keyway to spec. Wear-reversible options available.
                </div>
                <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12, minWidth: 480 }}>
                    <thead>
                      <tr style={{ background: C.navyMid, color: "white" }}>
                        {["Teeth", "PCD mm", "ØA", "ØB", "ØC max", "T", "WB1"].map(h => (
                          <th key={h} style={{ padding: "7px 8px", textAlign: "center", fontWeight: 600, whiteSpace: "nowrap" }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {sprockets.map((s, i) => (
                        <tr key={i} style={{ background: i % 2 ? "#f7f9fd" : "white" }}>
                          <td style={{ padding: "7px 8px", textAlign: "center", fontWeight: 700 }}>{s.teeth}</td>
                          <td style={{ padding: "7px 8px", textAlign: "center" }}>{s.pcd_mm}</td>
                          <td style={{ padding: "7px 8px", textAlign: "center" }}>{s.A_mm}</td>
                          <td style={{ padding: "7px 8px", textAlign: "center" }}>{s.B_mm}</td>
                          <td style={{ padding: "7px 8px", textAlign: "center" }}>{s.C_max_mm}</td>
                          <td style={{ padding: "7px 8px", textAlign: "center" }}>{s.T_mm}</td>
                          <td style={{ padding: "7px 8px", textAlign: "center" }}>{s.WB1_mm}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div style={{ background: "white", borderRadius: 12, padding: 28, textAlign: "center", color: C.muted }}>
                No sprocket data listed for this series. Contact Uniking Canada for availability.
              </div>
            )}

            {trailers.length > 0 && (
              <div style={{ background: "white", borderRadius: 12, padding: 16, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
                <div style={{ fontWeight: 700, color: C.navyMid, marginBottom: 4, fontSize: 14 }}>Trailers — {chain.sprocket_family}</div>
                <div style={{ fontSize: 12, color: C.muted, marginBottom: 12 }}>Segmental stub and asymmetric smooth trailers.</div>
                <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12, minWidth: 380 }}>
                    <thead>
                      <tr style={{ background: "#3d6494", color: "white" }}>
                        {["PCD mm", "ØC Smooth", "WB2 Smooth", "WB3 Seg.", "T1 Rim"].map(h => (
                          <th key={h} style={{ padding: "7px 8px", textAlign: "center" }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {trailers.map((t, i) => (
                        <tr key={i} style={{ background: i % 2 ? "#f7f9fd" : "white" }}>
                          <td style={{ padding: "7px 8px", textAlign: "center", fontWeight: 700 }}>{t.pcd_mm}</td>
                          <td style={{ padding: "7px 8px", textAlign: "center" }}>{t.C_max_smooth_mm}</td>
                          <td style={{ padding: "7px 8px", textAlign: "center" }}>{t.WB2_smooth_mm}</td>
                          <td style={{ padding: "7px 8px", textAlign: "center" }}>{t.WB3_segmental_mm}</td>
                          <td style={{ padding: "7px 8px", textAlign: "center" }}>{t.T1_rim_width_mm}</td>
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
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// PRODUCT GRID (Home)
// ════════════════════════════════════════════════════════════════════════════
export default function ForgedChainConfigurator() {
  const [chains, setChains]       = useState([]);
  const [loading, setLoading]     = useState(true);
  const [filter, setFilter]       = useState("All");
  const [selectedChain, setSelected] = useState(null);

  useEffect(() => {
    ForgedChain.list().then(data => {
      const sorted = [...data].sort((a, b) => {
        const n = x => parseInt(x.chain_link.replace(/\D/g, "")) || 0;
        return n(a) - n(b) || a.chain_link.localeCompare(b.chain_link);
      });
      setChains(sorted);
      setLoading(false);
    });
  }, []);

  if (selectedChain) {
    return <ProductDetail chain={selectedChain} onBack={() => setSelected(null)} />;
  }

  const filtered = filter === "All" ? chains : chains.filter(c => c.link_type === filter);

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "Arial, sans-serif" }}>

      {/* Header */}
      <div style={{ background: C.navy, color: "white", padding: "16px 18px" }}>
        <div style={{ fontSize: 10, letterSpacing: 2, opacity: 0.6, textTransform: "uppercase" }}>Uniking Canada</div>
        <div style={{ fontSize: 20, fontWeight: 800, marginTop: 2 }}>Drop Forged Chain</div>
        <div style={{ fontSize: 12, opacity: 0.65, marginTop: 2 }}>Heat treated alloy steel · Rockwell C57–C62</div>
      </div>

      {/* Filter pills */}
      <div style={{ background: "white", padding: "12px 16px", borderBottom: `1px solid ${C.border}`,
        display: "flex", gap: 8, overflowX: "auto" }}>
        {["All", "Standard", "Double", "Triple"].map(t => (
          <button key={t} onClick={() => setFilter(t)}
            style={{ flexShrink: 0, padding: "6px 16px", borderRadius: 20, border: "none", cursor: "pointer", fontSize: 13,
              background: filter === t ? C.navyMid : C.bg,
              color: filter === t ? "white" : C.text,
              fontWeight: filter === t ? 700 : 400 }}>
            {t}
          </button>
        ))}
      </div>

      {/* Count */}
      <div style={{ padding: "10px 18px 2px", fontSize: 12, color: C.muted }}>
        {loading ? "Loading..." : `${filtered.length} chain link${filtered.length !== 1 ? "s" : ""}`}
      </div>

      {/* Cards grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 12, padding: "10px 14px 30px" }}>
        {filtered.map(c => {
          const typeColor = TYPE_COLOR[c.link_type] || C.navyMid;
          const typeBg    = TYPE_BG[c.link_type]    || C.bg;
          return (
            <button key={c.id} onClick={() => setSelected(c)}
              style={{ background: "white", border: `1px solid ${C.border}`, borderRadius: 14,
                padding: "16px 12px 14px", cursor: "pointer", textAlign: "center",
                boxShadow: "0 2px 6px rgba(0,0,0,0.06)", transition: "transform 0.15s, box-shadow 0.15s",
                display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 6px 16px rgba(0,0,0,0.1)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "0 2px 6px rgba(0,0,0,0.06)"; }}>

              {/* Chain SVG */}
              <ChainHeroSVG chain={c} size={130} />

              {/* Name */}
              <div style={{ fontWeight: 800, fontSize: 16, color: C.navy }}>{c.chain_link}</div>

              {/* Badges row */}
              <div style={{ display: "flex", gap: 4, flexWrap: "wrap", justifyContent: "center" }}>
                <span style={{ background: typeBg, color: typeColor, borderRadius: 10,
                  padding: "2px 8px", fontSize: 10, fontWeight: 700 }}>{c.link_type}</span>
                {c.bolt_n_go_compatible && (
                  <span style={{ background: C.greenBg, color: C.green, borderRadius: 10,
                    padding: "2px 8px", fontSize: 10, fontWeight: 700 }}>BNG</span>
                )}
              </div>

              {/* Key spec */}
              <div style={{ fontSize: 11, color: C.muted }}>
                {c.min_breaking_load_kn} kN · P={c.P_mm} mm
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
