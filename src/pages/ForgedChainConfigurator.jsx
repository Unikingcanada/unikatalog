import { useState, useEffect } from "react";
import { ForgedChain } from "@/api/entities";

const UNIKING_BLUE = "#1B3A6B";
const UNIKING_LIGHT = "#E8EDF5";

// ── SVG Schematic ──────────────────────────────────────────────────────────
function ChainLinkSVG({ chain, linkType }) {
  if (!chain) return null;
  const { P_mm = 142, H_mm = 50, T_mm = 12, W_mm = 42, M_mm = 18.7, D_mm = 25, F_mm, E_mm } = chain;

  // Normalize to SVG canvas (500 x 260)
  const scale = Math.min(380 / P_mm, 160 / H_mm, 1.8);
  const sW = Math.round(P_mm * scale);
  const sH = Math.round(H_mm * scale);
  const sT = Math.max(4, Math.round(T_mm * scale));
  const sD = Math.round(D_mm * scale * 0.6);
  const sM = Math.round(M_mm * scale * 0.5);
  const cx = 250, cy = 130;
  const x0 = cx - sW / 2, x1 = cx + sW / 2;
  const y0 = cy - sH / 2, y1 = cy + sH / 2;
  const isDouble = linkType === "Double";
  const isTriple = linkType === "Triple";
  const sF = F_mm ? Math.round(F_mm * scale * 0.7) : null;

  // Pin holes
  const holeR = sD / 2;
  const holeL = { x: x0 + sD * 0.8, y: cy };
  const holeR2 = { x: x1 - sD * 0.8, y: cy };

  return (
    <svg viewBox="0 0 500 260" style={{ width: "100%", maxWidth: 560, display: "block", margin: "0 auto" }}>
      <defs>
        <marker id="arr" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="#555" />
        </marker>
        <marker id="arrl" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto-start-reverse">
          <path d="M0,0 L6,3 L0,6 Z" fill="#555" />
        </marker>
      </defs>

      {/* Link body */}
      <rect x={x0} y={y0} width={sW} height={sH} rx={sH * 0.35} ry={sH * 0.35}
        fill="#d0d8e8" stroke={UNIKING_BLUE} strokeWidth="2.5" />

      {/* Inner cutout */}
      <rect x={x0 + sD * 1.6} y={y0 + sT} width={sW - sD * 3.2} height={sH - sT * 2}
        rx={6} ry={6} fill="#b8c4d8" stroke={UNIKING_BLUE} strokeWidth="1.5" />

      {/* Pin holes */}
      <circle cx={holeL.x} cy={holeL.y} r={holeR} fill="#7a9cc8" stroke={UNIKING_BLUE} strokeWidth="2" />
      <circle cx={holeR2.x} cy={holeR2.y} r={holeR} fill="#7a9cc8" stroke={UNIKING_BLUE} strokeWidth="2" />

      {/* Double/Triple strand indicator */}
      {(isDouble || isTriple) && sF && (
        <>
          <rect x={x0 - 8} y={y0 - 14} width={sW + 16} height={10} rx={3}
            fill="#a8b8d0" stroke={UNIKING_BLUE} strokeWidth="1.5" opacity="0.85" />
          <rect x={x0 - 8} y={y1 + 4} width={sW + 16} height={10} rx={3}
            fill="#a8b8d0" stroke={UNIKING_BLUE} strokeWidth="1.5" opacity="0.85" />
          {isTriple && (
            <rect x={x0 - 8} y={y1 + 18} width={sW + 16} height={10} rx={3}
              fill="#a8b8d0" stroke={UNIKING_BLUE} strokeWidth="1.5" opacity="0.7" />
          )}
        </>
      )}

      {/* === Dimension lines === */}
      {/* P — pitch */}
      <line x1={holeL.x} y1={y1 + 22} x2={holeR2.x} y2={y1 + 22} stroke="#555" strokeWidth="1" markerEnd="url(#arr)" markerStart="url(#arrl)" />
      <text x={cx} y={y1 + 34} textAnchor="middle" fontSize="10" fill="#333">P = {P_mm} mm</text>
      <line x1={holeL.x} y1={cy} x2={holeL.x} y2={y1 + 20} stroke="#999" strokeWidth="0.8" strokeDasharray="3,2" />
      <line x1={holeR2.x} y1={cy} x2={holeR2.x} y2={y1 + 20} stroke="#999" strokeWidth="0.8" strokeDasharray="3,2" />

      {/* H — height */}
      <line x1={x1 + 14} y1={y0} x2={x1 + 14} y2={y1} stroke="#555" strokeWidth="1" markerEnd="url(#arr)" markerStart="url(#arrl)" />
      <text x={x1 + 20} y={cy + 4} textAnchor="start" fontSize="10" fill="#333">H={H_mm}</text>

      {/* T — thickness (top) */}
      <line x1={x1 + 36} y1={y0} x2={x1 + 36} y2={y0 + sT} stroke="#555" strokeWidth="1" markerEnd="url(#arr)" markerStart="url(#arrl)" />
      <text x={x1 + 42} y={y0 + sT / 2 + 4} textAnchor="start" fontSize="9" fill="#333">T={T_mm}</text>

      {/* W — width across */}
      <line x1={x0} y1={y0 - 18} x2={x1} y2={y0 - 18} stroke="#555" strokeWidth="1" markerEnd="url(#arr)" markerStart="url(#arrl)" />
      <text x={cx} y={y0 - 22} textAnchor="middle" fontSize="10" fill="#333">W = {W_mm} mm</text>

      {/* M — pin-to-edge */}
      <line x1={holeL.x - holeR} y1={y0 - 6} x2={x0} y2={y0 - 6} stroke="#555" strokeWidth="1" markerEnd="url(#arr)" markerStart="url(#arrl)" />
      <text x={(holeL.x - holeR + x0) / 2} y={y0 - 9} textAnchor="middle" fontSize="8" fill="#555">M={M_mm}</text>

      {/* D — hole dia */}
      <line x1={holeL.x - holeR} y1={cy - 6} x2={holeL.x + holeR} y2={cy - 6} stroke="#d44" strokeWidth="1" markerEnd="url(#arr)" markerStart="url(#arrl)" />
      <text x={holeL.x} y={cy - 9} textAnchor="middle" fontSize="8" fill="#c33">D={D_mm}</text>

      {/* F/E labels for double/triple */}
      {sF && (
        <>
          <text x={cx} y={22} textAnchor="middle" fontSize="9" fill={UNIKING_BLUE}>F = {F_mm} mm (overall width)</text>
          <text x={cx} y={34} textAnchor="middle" fontSize="9" fill="#555">E = {E_mm} mm (bar gap)</text>
        </>
      )}

      {/* Link type badge */}
      <rect x={8} y={8} width={80} height={18} rx={4} fill={UNIKING_BLUE} />
      <text x={48} y={21} textAnchor="middle" fontSize="10" fill="white" fontWeight="bold">
        {linkType} Link
      </text>
    </svg>
  );
}

// ── Flight visual grid ─────────────────────────────────────────────────────
const FLIGHT_ICONS = {
  "Square Bar Flight": (
    <svg viewBox="0 0 80 60" width="70" height="52">
      <rect x="10" y="28" width="60" height="8" fill="#8a9ab0" stroke="#1B3A6B" strokeWidth="1.5" />
      <rect x="30" y="10" width="8" height="28" fill="#6a7a90" stroke="#1B3A6B" strokeWidth="1.5" />
      <circle cx="20" cy="32" r="5" fill="#7a9cc8" stroke="#1B3A6B" strokeWidth="1.5" />
      <circle cx="58" cy="32" r="5" fill="#7a9cc8" stroke="#1B3A6B" strokeWidth="1.5" />
    </svg>
  ),
  "Flat Bar Flight": (
    <svg viewBox="0 0 80 60" width="70" height="52">
      <rect x="10" y="28" width="60" height="8" fill="#8a9ab0" stroke="#1B3A6B" strokeWidth="1.5" />
      <rect x="28" y="15" width="20" height="5" fill="#6a7a90" stroke="#1B3A6B" strokeWidth="1.5" />
      <circle cx="20" cy="32" r="5" fill="#7a9cc8" stroke="#1B3A6B" strokeWidth="1.5" />
      <circle cx="58" cy="32" r="5" fill="#7a9cc8" stroke="#1B3A6B" strokeWidth="1.5" />
    </svg>
  ),
  "Paddle Flight": (
    <svg viewBox="0 0 80 60" width="70" height="52">
      <rect x="10" y="28" width="60" height="8" fill="#8a9ab0" stroke="#1B3A6B" strokeWidth="1.5" />
      <ellipse cx="38" cy="16" rx="14" ry="8" fill="#6a7a90" stroke="#1B3A6B" strokeWidth="1.5" />
      <rect x="34" y="16" width="6" height="14" fill="#6a7a90" stroke="#1B3A6B" strokeWidth="1" />
      <circle cx="20" cy="32" r="5" fill="#7a9cc8" stroke="#1B3A6B" strokeWidth="1.5" />
      <circle cx="58" cy="32" r="5" fill="#7a9cc8" stroke="#1B3A6B" strokeWidth="1.5" />
    </svg>
  ),
  "U Flight": (
    <svg viewBox="0 0 80 60" width="70" height="52">
      <rect x="10" y="30" width="60" height="7" fill="#8a9ab0" stroke="#1B3A6B" strokeWidth="1.5" />
      <path d="M26,30 L26,12 L20,12" fill="none" stroke="#1B3A6B" strokeWidth="2.5" />
      <path d="M50,30 L50,12 L56,12" fill="none" stroke="#1B3A6B" strokeWidth="2.5" />
      <circle cx="20" cy="34" r="5" fill="#7a9cc8" stroke="#1B3A6B" strokeWidth="1.5" />
      <circle cx="58" cy="34" r="5" fill="#7a9cc8" stroke="#1B3A6B" strokeWidth="1.5" />
    </svg>
  ),
  "Closed U Flight": (
    <svg viewBox="0 0 80 60" width="70" height="52">
      <rect x="10" y="30" width="60" height="7" fill="#8a9ab0" stroke="#1B3A6B" strokeWidth="1.5" />
      <path d="M26,30 L26,10 L52,10 L52,30" fill="#c8d4e8" stroke="#1B3A6B" strokeWidth="2" />
      <circle cx="20" cy="34" r="5" fill="#7a9cc8" stroke="#1B3A6B" strokeWidth="1.5" />
      <circle cx="58" cy="34" r="5" fill="#7a9cc8" stroke="#1B3A6B" strokeWidth="1.5" />
    </svg>
  ),
  "Closed U Flight with Filler Plates": (
    <svg viewBox="0 0 80 60" width="70" height="52">
      <rect x="10" y="30" width="60" height="7" fill="#8a9ab0" stroke="#1B3A6B" strokeWidth="1.5" />
      <path d="M26,30 L26,10 L52,10 L52,30" fill="#c8d4e8" stroke="#1B3A6B" strokeWidth="2" />
      <rect x="26" y="10" width="26" height="4" fill="#a0b0c8" stroke="#1B3A6B" strokeWidth="1" />
      <circle cx="20" cy="34" r="5" fill="#7a9cc8" stroke="#1B3A6B" strokeWidth="1.5" />
      <circle cx="58" cy="34" r="5" fill="#7a9cc8" stroke="#1B3A6B" strokeWidth="1.5" />
    </svg>
  ),
  "00 Flight": (
    <svg viewBox="0 0 80 60" width="70" height="52">
      <rect x="10" y="28" width="60" height="7" fill="#8a9ab0" stroke="#1B3A6B" strokeWidth="1.5" />
      <rect x="22" y="10" width="32" height="5" fill="#6a7a90" stroke="#1B3A6B" strokeWidth="1.5" />
      <rect x="22" y="44" width="32" height="5" fill="#6a7a90" stroke="#1B3A6B" strokeWidth="1.5" />
      <circle cx="20" cy="32" r="5" fill="#7a9cc8" stroke="#1B3A6B" strokeWidth="1.5" />
      <circle cx="58" cy="32" r="5" fill="#7a9cc8" stroke="#1B3A6B" strokeWidth="1.5" />
    </svg>
  ),
  "Return Cups": (
    <svg viewBox="0 0 80 60" width="70" height="52">
      <rect x="10" y="28" width="60" height="7" fill="#8a9ab0" stroke="#1B3A6B" strokeWidth="1.5" />
      <path d="M28,35 Q38,52 50,35" fill="#b0c4d8" stroke="#1B3A6B" strokeWidth="2" />
      <circle cx="20" cy="32" r="5" fill="#7a9cc8" stroke="#1B3A6B" strokeWidth="1.5" />
      <circle cx="58" cy="32" r="5" fill="#7a9cc8" stroke="#1B3A6B" strokeWidth="1.5" />
    </svg>
  ),
  "00 Flight with Filler Plates": (
    <svg viewBox="0 0 80 60" width="70" height="52">
      <rect x="10" y="28" width="60" height="7" fill="#8a9ab0" stroke="#1B3A6B" strokeWidth="1.5" />
      <rect x="22" y="10" width="32" height="5" fill="#6a7a90" stroke="#1B3A6B" strokeWidth="1.5" />
      <rect x="22" y="44" width="32" height="5" fill="#6a7a90" stroke="#1B3A6B" strokeWidth="1.5" />
      <rect x="18" y="10" width="4" height="39" fill="#9ab0c8" stroke="#1B3A6B" strokeWidth="1" />
      <rect x="58" y="10" width="4" height="39" fill="#9ab0c8" stroke="#1B3A6B" strokeWidth="1" />
      <circle cx="20" cy="32" r="5" fill="#7a9cc8" stroke="#1B3A6B" strokeWidth="1.5" />
      <circle cx="58" cy="32" r="5" fill="#7a9cc8" stroke="#1B3A6B" strokeWidth="1.5" />
    </svg>
  ),
  "Custom Flight": (
    <svg viewBox="0 0 80 60" width="70" height="52">
      <rect x="10" y="28" width="60" height="7" fill="#8a9ab0" stroke="#1B3A6B" strokeWidth="1.5" />
      <text x="40" y="22" textAnchor="middle" fontSize="9" fill={UNIKING_BLUE} fontWeight="bold">CUSTOM</text>
      <circle cx="20" cy="32" r="5" fill="#7a9cc8" stroke="#1B3A6B" strokeWidth="1.5" />
      <circle cx="58" cy="32" r="5" fill="#7a9cc8" stroke="#1B3A6B" strokeWidth="1.5" />
    </svg>
  ),
};

// ── Print Tear Sheet ───────────────────────────────────────────────────────
function printTearSheet(chain, selectedFlight, selectedPin) {
  const w = window.open("", "_blank");
  const flights = tryParse(chain.flight_options);
  const pins = tryParse(chain.pin_options);
  const sprockets = tryParse(chain.sprocket_data);
  const trailers = tryParse(chain.trailer_data);

  const dimRows = [
    ["Pitch (P)", chain.P_mm, "mm"],
    ["Height (H)", chain.H_mm, "mm"],
    ["Thickness (T)", chain.T_mm, "mm"],
    ["Width (W)", chain.W_mm, "mm"],
    ["Pin-to-Edge (M)", chain.M_mm, "mm"],
    ["Pin Hole Dia (D)", chain.D_mm, "mm"],
    ...(chain.F_mm ? [["Overall Width (F)", chain.F_mm, "mm"], ["Bar Gap (E)", chain.E_mm, "mm"]] : []),
  ].map(([k, v, u]) => `<tr><td style="padding:4px 10px;border-bottom:1px solid #eee;color:#555">${k}</td><td style="padding:4px 10px;border-bottom:1px solid #eee;font-weight:600">${v} ${u}</td></tr>`).join("");

  const spTable = sprockets.length ? `
    <h3 style="color:#1B3A6B;margin-top:20px">Sprocket Data (${chain.sprocket_family})</h3>
    <table style="width:100%;border-collapse:collapse;font-size:11px">
      <thead><tr style="background:#1B3A6B;color:white">
        <th style="padding:5px">Teeth</th><th>PCD (mm)</th><th>ØA</th><th>ØB</th><th>ØC max</th><th>T</th><th>WB1</th>
      </tr></thead><tbody>
      ${sprockets.map((s, i) => `<tr style="background:${i % 2 ? "#f5f7fb" : "white"}">
        <td style="padding:4px;text-align:center">${s.teeth}</td>
        <td style="text-align:center">${s.pcd_mm}</td>
        <td style="text-align:center">${s.A_mm}</td>
        <td style="text-align:center">${s.B_mm}</td>
        <td style="text-align:center">${s.C_max_mm}</td>
        <td style="text-align:center">${s.T_mm}</td>
        <td style="text-align:center">${s.WB1_mm}</td>
      </tr>`).join("")}
      </tbody>
    </table>` : "";

  w.document.write(`<!DOCTYPE html><html><head><title>Forged Chain ${chain.chain_link} — Uniking Canada</title>
  <style>body{font-family:Arial,sans-serif;margin:30px;color:#222}h1{color:#1B3A6B}table{border-collapse:collapse}@media print{body{margin:15px}}</style>
  </head><body>
  <div style="display:flex;justify-content:space-between;align-items:center;border-bottom:3px solid #1B3A6B;padding-bottom:12px;margin-bottom:20px">
    <div><h1 style="margin:0;font-size:22px">Drop Forged Chain — ${chain.chain_link}</h1>
    <div style="color:#555;font-size:13px">${chain.link_type} Link &nbsp;|&nbsp; ${chain.min_breaking_load_kn} kN Breaking Load &nbsp;|&nbsp; ${chain.bolt_n_go_compatible ? "Bolt N Go Compatible" : "Standard Pin"}</div></div>
    <div style="text-align:right;font-size:11px;color:#888">UNIKING CANADA<br>514.886.5270<br>unikingcanada.com</div>
  </div>
  <div style="display:flex;gap:30px">
    <div style="flex:1">
      <h3 style="color:#1B3A6B;margin-bottom:8px">Link Dimensions</h3>
      <table style="width:100%">${dimRows}</table>
      <table style="margin-top:8px;width:100%">
        <tr><td style="padding:4px 10px;border-bottom:1px solid #eee;color:#555">Case Hardness</td><td style="padding:4px 10px;border-bottom:1px solid #eee">${chain.case_hardness}</td></tr>
        <tr><td style="padding:4px 10px;border-bottom:1px solid #eee;color:#555">Case Depth</td><td style="padding:4px 10px;border-bottom:1px solid #eee">${chain.case_depth_mm} mm</td></tr>
        <tr><td style="padding:4px 10px;border-bottom:1px solid #eee;color:#555">Core Hardness</td><td style="padding:4px 10px;border-bottom:1px solid #eee">${chain.core_hardness}</td></tr>
        <tr><td style="padding:4px 10px;color:#555">Weight / Link</td><td style="padding:4px 10px">${chain.weight_per_link_kg} kg</td></tr>
      </table>
    </div>
    <div style="flex:1">
      ${selectedFlight ? `<h3 style="color:#1B3A6B">Selected Flight</h3><div style="padding:8px;background:#f0f4fa;border-radius:6px;font-weight:600">${selectedFlight}</div>` : ""}
      ${selectedPin ? `<h3 style="color:#1B3A6B;margin-top:12px">Selected Pin</h3><div style="padding:8px;background:#f0f4fa;border-radius:6px;font-weight:600">${selectedPin}</div>` : ""}
      ${chain.notes ? `<div style="margin-top:16px;padding:10px;background:#fff8e1;border-left:3px solid #f0a800;font-size:12px">${chain.notes}</div>` : ""}
    </div>
  </div>
  ${spTable}
  <div style="margin-top:30px;font-size:10px;color:#aaa;border-top:1px solid #eee;padding-top:8px">
    This document is for reference only and does not include pricing. Specifications subject to change. Contact Uniking Canada for application-specific recommendations.
  </div>
  </body></html>`);
  w.document.close();
  setTimeout(() => w.print(), 500);
}

function tryParse(val) {
  try { return JSON.parse(val || "[]"); } catch { return []; }
}

// ── Main Component ─────────────────────────────────────────────────────────
export default function ForgedChainConfigurator() {
  const [chains, setChains] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("specs");
  const [filterType, setFilterType] = useState("All");
  const [selectedId, setSelectedId] = useState(null);
  const [selectedFlight, setSelectedFlight] = useState(null);
  const [selectedPin, setSelectedPin] = useState(null);

  useEffect(() => {
    ForgedChain.list().then(data => {
      const sorted = data.sort((a, b) => {
        const n = x => parseInt(x.chain_link.replace(/\D/g, "")) || 0;
        return n(a) - n(b) || a.chain_link.localeCompare(b.chain_link);
      });
      setChains(sorted);
      if (sorted.length) setSelectedId(sorted[0].id);
      setLoading(false);
    });
  }, []);

  const filtered = filterType === "All" ? chains : chains.filter(c => c.link_type === filterType);
  const chain = chains.find(c => c.id === selectedId);
  const flights = chain ? tryParse(chain.flight_options) : [];
  const pins = chain ? tryParse(chain.pin_options) : [];
  const sprockets = chain ? tryParse(chain.sprocket_data) : [];
  const trailers = chain ? tryParse(chain.trailer_data) : [];

  const tabs = [
    { id: "specs", label: "Specifications" },
    { id: "schematic", label: "Live Schematic" },
    { id: "flights", label: "Flight Options" },
    { id: "pins", label: "Pin Options" },
    { id: "sprockets", label: "Sprockets & Trailers" },
  ];

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "#f0f4fa", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center", color: UNIKING_BLUE }}>
        <div style={{ fontSize: 32, marginBottom: 10 }}>⚙</div>
        <div style={{ fontSize: 16 }}>Loading Forged Chain Configurator...</div>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#f0f4fa", fontFamily: "Arial, sans-serif" }}>
      {/* Header */}
      <div style={{ background: UNIKING_BLUE, color: "white", padding: "18px 28px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontSize: 11, letterSpacing: 2, opacity: 0.7, textTransform: "uppercase" }}>Uniking Canada</div>
          <div style={{ fontSize: 22, fontWeight: 700, marginTop: 2 }}>Drop Forged Chain Configurator</div>
        </div>
        <div style={{ fontSize: 12, opacity: 0.7, textAlign: "right" }}>
          Heat Treated Alloy Steel<br />Rockwell C57–C62
        </div>
      </div>

      <div style={{ display: "flex", gap: 0, minHeight: "calc(100vh - 70px)" }}>
        {/* Sidebar */}
        <div style={{ width: 230, background: "white", borderRight: "1px solid #dce3f0", padding: "16px 0", flexShrink: 0 }}>
          {/* Filter buttons */}
          <div style={{ padding: "0 12px 12px", borderBottom: "1px solid #eee", marginBottom: 8 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: "#888", letterSpacing: 1, textTransform: "uppercase", marginBottom: 6 }}>Filter by Type</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
              {["All", "Standard", "Double", "Triple"].map(t => (
                <button key={t} onClick={() => setFilterType(t)}
                  style={{ padding: "3px 9px", fontSize: 11, borderRadius: 20, border: "none", cursor: "pointer",
                    background: filterType === t ? UNIKING_BLUE : "#e8edf5",
                    color: filterType === t ? "white" : "#444", fontWeight: filterType === t ? 700 : 400 }}>
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Chain list */}
          <div style={{ overflowY: "auto" }}>
            {filtered.map(c => {
              const isSelected = c.id === selectedId;
              return (
                <button key={c.id} onClick={() => { setSelectedId(c.id); setSelectedFlight(null); setSelectedPin(null); setActiveTab("specs"); }}
                  style={{ width: "100%", textAlign: "left", padding: "10px 16px", border: "none", cursor: "pointer",
                    background: isSelected ? UNIKING_LIGHT : "transparent",
                    borderLeft: isSelected ? `4px solid ${UNIKING_BLUE}` : "4px solid transparent",
                    transition: "all 0.15s" }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: isSelected ? UNIKING_BLUE : "#222" }}>{c.chain_link}</div>
                  <div style={{ fontSize: 11, color: "#666", marginTop: 1 }}>
                    {c.link_type} · {c.min_breaking_load_kn} kN
                    {c.bolt_n_go_compatible && <span style={{ marginLeft: 4, background: "#d4edda", color: "#276131", borderRadius: 3, padding: "1px 5px", fontSize: 10 }}>BNG</span>}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Main content */}
        <div style={{ flex: 1, overflow: "auto" }}>
          {chain && (
            <>
              {/* Chain header */}
              <div style={{ background: "white", padding: "18px 28px", borderBottom: "1px solid #dce3f0", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <div style={{ fontSize: 26, fontWeight: 800, color: UNIKING_BLUE }}>{chain.chain_link}</div>
                  <div style={{ color: "#555", fontSize: 13, marginTop: 3, display: "flex", gap: 14, flexWrap: "wrap" }}>
                    <span>{chain.link_type} Link</span>
                    <span style={{ color: "#bbb" }}>|</span>
                    <span>{chain.min_breaking_load_kn} kN Breaking Load</span>
                    <span style={{ color: "#bbb" }}>|</span>
                    <span>P = {chain.P_mm} mm</span>
                    <span style={{ color: "#bbb" }}>|</span>
                    <span>{chain.weight_per_link_kg} kg/link</span>
                    {chain.bolt_n_go_compatible && <span style={{ background: "#d4edda", color: "#276131", borderRadius: 4, padding: "2px 8px", fontWeight: 700, fontSize: 12 }}>Bolt 'N' Go Compatible</span>}
                    {chain.stainless_available && <span style={{ background: "#e8f0fe", color: "#1B3A6B", borderRadius: 4, padding: "2px 8px", fontSize: 12 }}>Stainless Available</span>}
                  </div>
                </div>
                <button onClick={() => printTearSheet(chain, selectedFlight, selectedPin)}
                  style={{ padding: "8px 18px", background: UNIKING_BLUE, color: "white", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 13, fontWeight: 700, whiteSpace: "nowrap" }}>
                  Print Tear Sheet
                </button>
              </div>

              {/* Tabs */}
              <div style={{ background: "white", borderBottom: "2px solid #dce3f0", display: "flex", paddingLeft: 20 }}>
                {tabs.map(t => (
                  <button key={t.id} onClick={() => setActiveTab(t.id)}
                    style={{ padding: "11px 18px", border: "none", background: "transparent", cursor: "pointer", fontSize: 13, fontWeight: activeTab === t.id ? 700 : 400,
                      color: activeTab === t.id ? UNIKING_BLUE : "#666",
                      borderBottom: activeTab === t.id ? `3px solid ${UNIKING_BLUE}` : "3px solid transparent",
                      marginBottom: -2 }}>
                    {t.label}
                    {t.id === "sprockets" && sprockets.length > 0 && <span style={{ marginLeft: 5, background: UNIKING_BLUE, color: "white", borderRadius: 10, padding: "1px 6px", fontSize: 10 }}>{sprockets.length}</span>}
                  </button>
                ))}
              </div>

              {/* Tab content */}
              <div style={{ padding: 28 }}>

                {/* ── SPECS ── */}
                {activeTab === "specs" && (
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
                    <div style={{ background: "white", borderRadius: 10, padding: 22, boxShadow: "0 1px 4px rgba(0,0,0,0.07)" }}>
                      <div style={{ fontWeight: 700, color: UNIKING_BLUE, marginBottom: 14, fontSize: 15 }}>Link Dimensions</div>
                      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                        <tbody>
                          {[
                            ["Pitch (P)", chain.P_mm, "mm"],
                            ["Height (H)", chain.H_mm, "mm"],
                            ["Thickness (T)", chain.T_mm, "mm"],
                            ["Width (W)", chain.W_mm, "mm"],
                            ["Pin-to-Edge (M)", chain.M_mm, "mm"],
                            ["Pin Hole Dia (D)", chain.D_mm, "mm"],
                            ...(chain.F_mm ? [["Overall Width (F)", chain.F_mm, "mm"], ["Bar Gap (E)", chain.E_mm, "mm"], ["Hole Dia (B)", chain.B_mm, "mm"]] : []),
                          ].map(([k, v, u], i) => (
                            <tr key={i} style={{ background: i % 2 ? "#f7f9fd" : "white" }}>
                              <td style={{ padding: "7px 10px", color: "#555" }}>{k}</td>
                              <td style={{ padding: "7px 10px", fontWeight: 700, color: UNIKING_BLUE }}>{v} {u}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div style={{ background: "white", borderRadius: 10, padding: 22, boxShadow: "0 1px 4px rgba(0,0,0,0.07)" }}>
                      <div style={{ fontWeight: 700, color: UNIKING_BLUE, marginBottom: 14, fontSize: 15 }}>Material & Strength</div>
                      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                        <tbody>
                          {[
                            ["Min Breaking Load", `${chain.min_breaking_load_kn} kN`],
                            ["Case Hardness", chain.case_hardness],
                            ["Case Depth", `${chain.case_depth_mm} mm`],
                            ["Core Hardness", chain.core_hardness],
                            ["Weight Per Link", `${chain.weight_per_link_kg} kg`],
                            ["Bolt 'N' Go", chain.bolt_n_go_compatible ? "✅ Compatible" : "Not Compatible"],
                            ["Stainless Steel", chain.stainless_available ? "✅ Available on Request" : "N/A"],
                          ].map(([k, v], i) => (
                            <tr key={i} style={{ background: i % 2 ? "#f7f9fd" : "white" }}>
                              <td style={{ padding: "7px 10px", color: "#555" }}>{k}</td>
                              <td style={{ padding: "7px 10px", fontWeight: 600 }}>{v}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {chain.notes && (
                        <div style={{ marginTop: 14, padding: "10px 12px", background: "#fff8e1", borderLeft: `3px solid #f0a800`, borderRadius: 4, fontSize: 12, color: "#555" }}>
                          {chain.notes}
                        </div>
                      )}
                    </div>
                    {/* Bolt N Go callout */}
                    {chain.bolt_n_go_compatible && (
                      <div style={{ gridColumn: "1 / -1", background: "#e8f5e9", border: "1px solid #a5d6a7", borderRadius: 10, padding: 18, display: "flex", gap: 16, alignItems: "flex-start" }}>
                        <div style={{ fontSize: 28 }}>⚡</div>
                        <div>
                          <div style={{ fontWeight: 700, color: "#276131", fontSize: 14, marginBottom: 4 }}>Bolt 'N' Go System Compatible</div>
                          <div style={{ color: "#3d5a3e", fontSize: 13 }}>
                            This chain uses a high-strength hollow pin with standard bolt and mechanical lock nut. No circlips, no welding of flights, no need to remove chain from the conveyor for installation.
                            Just bolt the links and flights together — easy, simple, and reliable.
                          </div>
                          <div style={{ marginTop: 6, fontSize: 11, color: "#555" }}>US Pat. 7,080,728 · Canadian Pat. 2,548,660 · Mexican Pat. 272,056</div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* ── SCHEMATIC ── */}
                {activeTab === "schematic" && (
                  <div style={{ background: "white", borderRadius: 10, padding: 28, boxShadow: "0 1px 4px rgba(0,0,0,0.07)" }}>
                    <div style={{ fontWeight: 700, color: UNIKING_BLUE, fontSize: 15, marginBottom: 6 }}>Live Link Schematic — {chain.chain_link}</div>
                    <div style={{ fontSize: 12, color: "#888", marginBottom: 20 }}>Dimensions update dynamically for each selected chain link</div>
                    <div style={{ background: "#f7f9fd", border: "1px solid #dce3f0", borderRadius: 8, padding: "24px 16px" }}>
                      <ChainLinkSVG chain={chain} linkType={chain.link_type} />
                    </div>
                    <div style={{ marginTop: 18, display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
                      {[
                        { label: "P — Pitch", val: chain.P_mm, unit: "mm", desc: "Center-to-center pin distance" },
                        { label: "H — Height", val: chain.H_mm, unit: "mm", desc: "Overall link height" },
                        { label: "T — Thickness", val: chain.T_mm, unit: "mm", desc: "Plate thickness" },
                        { label: "W — Width", val: chain.W_mm, unit: "mm", desc: "Inner width between plates" },
                        { label: "M — Pin to Edge", val: chain.M_mm, unit: "mm", desc: "Distance from pin to outer edge" },
                        { label: "D — Pin Hole", val: chain.D_mm, unit: "mm", desc: "Pin hole diameter" },
                      ].map(({ label, val, unit, desc }) => (
                        <div key={label} style={{ background: "#f0f4fa", borderRadius: 8, padding: "10px 14px" }}>
                          <div style={{ fontWeight: 700, fontSize: 13, color: UNIKING_BLUE }}>{label}</div>
                          <div style={{ fontSize: 20, fontWeight: 800, color: "#222", margin: "3px 0" }}>{val} <span style={{ fontSize: 13, fontWeight: 400 }}>{unit}</span></div>
                          <div style={{ fontSize: 11, color: "#888" }}>{desc}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* ── FLIGHTS ── */}
                {activeTab === "flights" && (
                  <div>
                    <div style={{ background: "white", borderRadius: 10, padding: 20, marginBottom: 20, boxShadow: "0 1px 4px rgba(0,0,0,0.07)" }}>
                      <div style={{ fontWeight: 700, color: UNIKING_BLUE, fontSize: 15, marginBottom: 4 }}>Welded Flight Attachments</div>
                      <div style={{ fontSize: 13, color: "#666" }}>Select a flight type to add it to your tear sheet. Custom flights are available based on customer specifications.</div>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(165px, 1fr))", gap: 14 }}>
                      {flights.map(f => {
                        const isSelected = selectedFlight === f.name;
                        return (
                          <button key={f.name} onClick={() => setSelectedFlight(isSelected ? null : f.name)}
                            style={{ background: "white", border: `2px solid ${isSelected ? UNIKING_BLUE : "#dce3f0"}`, borderRadius: 10,
                              padding: "16px 10px 12px", cursor: "pointer", textAlign: "center",
                              boxShadow: isSelected ? `0 0 0 3px ${UNIKING_LIGHT}` : "0 1px 3px rgba(0,0,0,0.06)",
                              transition: "all 0.15s" }}>
                            <div style={{ display: "flex", justifyContent: "center", marginBottom: 8 }}>
                              {FLIGHT_ICONS[f.name] || <div style={{ width: 70, height: 52, background: "#eee", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: "#aaa" }}>diagram</div>}
                            </div>
                            <div style={{ fontSize: 12, fontWeight: 700, color: isSelected ? UNIKING_BLUE : "#333", lineHeight: 1.3 }}>{f.name}</div>
                            {isSelected && <div style={{ marginTop: 5, fontSize: 10, color: UNIKING_BLUE, fontWeight: 700 }}>Selected ✓</div>}
                          </button>
                        );
                      })}
                    </div>
                    <div style={{ marginTop: 16, padding: "10px 16px", background: "#f7f9fd", borderRadius: 8, fontSize: 12, color: "#666" }}>
                      Style codes: B Style (Bar/Paddle), U Style (Open), CU Style (Closed), OO Style (Double-sided) — see ID Form for field measurement details.
                    </div>
                  </div>
                )}

                {/* ── PIN OPTIONS ── */}
                {activeTab === "pins" && (
                  <div>
                    <div style={{ background: "white", borderRadius: 10, padding: 20, marginBottom: 20, boxShadow: "0 1px 4px rgba(0,0,0,0.07)" }}>
                      <div style={{ fontWeight: 700, color: UNIKING_BLUE, fontSize: 15, marginBottom: 4 }}>Standard Pin Options</div>
                      <div style={{ fontSize: 13, color: "#666" }}>All pin options available for this chain. Click to select for your configuration.</div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                      {pins.map((p, i) => {
                        const isSelected = selectedPin === p.name;
                        const isBNG = p.name.includes("Bolt");
                        return (
                          <button key={i} onClick={() => setSelectedPin(isSelected ? null : p.name)}
                            style={{ background: "white", border: `2px solid ${isSelected ? UNIKING_BLUE : "#dce3f0"}`,
                              borderRadius: 10, padding: "16px 20px", cursor: "pointer", textAlign: "left",
                              display: "flex", alignItems: "center", gap: 16,
                              boxShadow: isSelected ? `0 0 0 3px ${UNIKING_LIGHT}` : "0 1px 3px rgba(0,0,0,0.06)", transition: "all 0.15s" }}>
                            <div style={{ width: 44, height: 44, borderRadius: "50%", background: isBNG ? "#e8f5e9" : UNIKING_LIGHT,
                              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 20 }}>
                              {isBNG ? "⚡" : "🔩"}
                            </div>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontWeight: 700, fontSize: 14, color: isSelected ? UNIKING_BLUE : "#222" }}>{p.name}</div>
                              {p.description && <div style={{ fontSize: 12, color: "#666", marginTop: 3 }}>{p.description}</div>}
                              {isBNG && !chain.bolt_n_go_compatible && (
                                <div style={{ marginTop: 4, fontSize: 11, color: "#d44", fontWeight: 600 }}>Note: Requires Bolt 'N' Go compatible link</div>
                              )}
                            </div>
                            {isSelected && <div style={{ fontSize: 13, color: UNIKING_BLUE, fontWeight: 700 }}>✓ Selected</div>}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* ── SPROCKETS & TRAILERS ── */}
                {activeTab === "sprockets" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                    {sprockets.length > 0 ? (
                      <div style={{ background: "white", borderRadius: 10, padding: 22, boxShadow: "0 1px 4px rgba(0,0,0,0.07)" }}>
                        <div style={{ fontWeight: 700, color: UNIKING_BLUE, fontSize: 15, marginBottom: 4 }}>
                          Standard Sprockets — {chain.sprocket_family}
                        </div>
                        <div style={{ fontSize: 12, color: "#888", marginBottom: 14 }}>
                          Heat treated steel, min. 57 HRC. Bore and keyway to customer specification. Wear reversible options available.
                        </div>
                        <div style={{ overflowX: "auto" }}>
                          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                            <thead>
                              <tr style={{ background: UNIKING_BLUE, color: "white" }}>
                                {["Teeth", "PCD (mm)", "ØP1 (mm)", "ØA (mm)", "ØB (mm)", "ØC max (mm)", "Bolts", "T (mm)", "X (mm)", "WB1 (mm)"].map(h => (
                                  <th key={h} style={{ padding: "8px 10px", textAlign: "center", fontWeight: 600 }}>{h}</th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {sprockets.map((s, i) => (
                                <tr key={i} style={{ background: i % 2 ? "#f7f9fd" : "white" }}>
                                  <td style={{ padding: "6px 10px", textAlign: "center", fontWeight: 700 }}>{s.teeth}</td>
                                  <td style={{ padding: "6px 10px", textAlign: "center" }}>{s.pcd_mm}</td>
                                  <td style={{ padding: "6px 10px", textAlign: "center" }}>{s.P1_mm ?? "—"}</td>
                                  <td style={{ padding: "6px 10px", textAlign: "center" }}>{s.A_mm}</td>
                                  <td style={{ padding: "6px 10px", textAlign: "center" }}>{s.B_mm}</td>
                                  <td style={{ padding: "6px 10px", textAlign: "center" }}>{s.C_max_mm}</td>
                                  <td style={{ padding: "6px 10px", textAlign: "center" }}>{s.bolts ?? "—"}</td>
                                  <td style={{ padding: "6px 10px", textAlign: "center" }}>{s.T_mm}</td>
                                  <td style={{ padding: "6px 10px", textAlign: "center" }}>{s.X_mm}</td>
                                  <td style={{ padding: "6px 10px", textAlign: "center" }}>{s.WB1_mm}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    ) : (
                      <div style={{ background: "white", borderRadius: 10, padding: 28, textAlign: "center", color: "#888", boxShadow: "0 1px 4px rgba(0,0,0,0.07)" }}>
                        <div style={{ fontSize: 18, marginBottom: 8 }}>ℹ</div>
                        <div>Sprocket data not listed for this series. Contact Uniking Canada for availability.</div>
                      </div>
                    )}

                    {trailers.length > 0 && (
                      <div style={{ background: "white", borderRadius: 10, padding: 22, boxShadow: "0 1px 4px rgba(0,0,0,0.07)" }}>
                        <div style={{ fontWeight: 700, color: UNIKING_BLUE, fontSize: 15, marginBottom: 4 }}>Trailers — {chain.sprocket_family}</div>
                        <div style={{ fontSize: 12, color: "#888", marginBottom: 14 }}>
                          Segmental Stub Trailers and Asymmetric Smooth Trailers. Different hub widths apply (WB2 for smooth, WB3 for segmental).
                        </div>
                        <div style={{ overflowX: "auto" }}>
                          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                            <thead>
                              <tr style={{ background: "#3d6494", color: "white" }}>
                                {["PCD (mm)", "ØC max Smooth (mm)", "WB2 Smooth (mm)", "WB3 Segmental (mm)", "T1 Rim Width (mm)"].map(h => (
                                  <th key={h} style={{ padding: "8px 10px", textAlign: "center" }}>{h}</th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {trailers.map((t, i) => (
                                <tr key={i} style={{ background: i % 2 ? "#f7f9fd" : "white" }}>
                                  <td style={{ padding: "6px 10px", textAlign: "center", fontWeight: 700 }}>{t.pcd_mm}</td>
                                  <td style={{ padding: "6px 10px", textAlign: "center" }}>{t.C_max_smooth_mm}</td>
                                  <td style={{ padding: "6px 10px", textAlign: "center" }}>{t.WB2_smooth_mm}</td>
                                  <td style={{ padding: "6px 10px", textAlign: "center" }}>{t.WB3_segmental_mm}</td>
                                  <td style={{ padding: "6px 10px", textAlign: "center" }}>{t.T1_rim_width_mm}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                        <div style={{ marginTop: 10, fontSize: 11, color: "#999" }}>
                          * Symmetric smooth trailers available on demand. Contact Uniking Canada for custom bore and keyway specifications.
                        </div>
                      </div>
                    )}
                  </div>
                )}

              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
