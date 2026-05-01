import { useState, useEffect } from "react";
import { ForgedChain } from "@/api/entities";

const C = {
  navy: "#0F2340", navyMid: "#1B3A6B", navyLight: "#2a5080",
  gold: "#C9A84C", bg: "#f4f7fb", card: "#ffffff",
  border: "#e2e8f0", text: "#1e293b", muted: "#64748b",
  green: "#16a34a", greenBg: "#dcfce7", orange: "#c2410c", orangeBg: "#ffedd5",
};

const IMG = {
  standard: "https://base44.app/api/apps/69dd9ffccab4dd693d4d92f5/files/mp/public/69dd9ffccab4dd693d4d92f5/6db3d3f32_standard-link.jpg",
  double:   "https://base44.app/api/apps/69dd9ffccab4dd693d4d92f5/files/mp/public/69dd9ffccab4dd693d4d92f5/8b574a65e_double-link.jpg",
  triple:   "https://base44.app/api/apps/69dd9ffccab4dd693d4d92f5/files/mp/public/69dd9ffccab4dd693d4d92f5/fa0ba96be_triple-link.jpg",
  hero:     "https://base44.app/api/apps/69dd9ffccab4dd693d4d92f5/files/mp/public/69dd9ffccab4dd693d4d92f5/4ed6677f2_forged-chain.jpg",
  chain_installed:        "https://base44.app/api/apps/69dd9ffccab4dd693d4d92f5/files/mp/public/69dd9ffccab4dd693d4d92f5/4730baa88_4b142ha-chain.jpg",
  double_installed:       "https://base44.app/api/apps/69dd9ffccab4dd693d4d92f5/files/mp/public/69dd9ffccab4dd693d4d92f5/5927207c6_double-link-installed.jpg",
  sprocket_installed:     "https://base44.app/api/apps/69dd9ffccab4dd693d4d92f5/files/mp/public/69dd9ffccab4dd693d4d92f5/1869b08c5_sprocket-installed.jpg",
  chain_pins:             "https://base44.app/api/apps/69dd9ffccab4dd693d4d92f5/files/mp/public/69dd9ffccab4dd693d4d92f5/728ea1a69_chain-pins.jpg",
  "Square Bar Flight":                  "https://base44.app/api/apps/69dd9ffccab4dd693d4d92f5/files/mp/public/69dd9ffccab4dd693d4d92f5/a79564d01_SQUARE-BAR.jpg",
  "Flat Bar Flight":                    "https://base44.app/api/apps/69dd9ffccab4dd693d4d92f5/files/mp/public/69dd9ffccab4dd693d4d92f5/57feb5aa4_FLAT-BAR.jpg",
  "Paddle Flight":                      "https://base44.app/api/apps/69dd9ffccab4dd693d4d92f5/files/mp/public/69dd9ffccab4dd693d4d92f5/a3b67f93e_PADDLE-FLIGHT.jpg",
  "U Flight":                           "https://base44.app/api/apps/69dd9ffccab4dd693d4d92f5/files/mp/public/69dd9ffccab4dd693d4d92f5/4d1c1743b_U-FLIGHT.jpg",
  "Closed U Flight":                    "https://base44.app/api/apps/69dd9ffccab4dd693d4d92f5/files/mp/public/69dd9ffccab4dd693d4d92f5/604e3bf5d_CLOSED-U.jpg",
  "Closed U Flight with Filler Plates": "https://base44.app/api/apps/69dd9ffccab4dd693d4d92f5/files/mp/public/69dd9ffccab4dd693d4d92f5/8d578750f_CLOSED-U-WITH-FILLER-PLATES.jpg",
  "00 Flight":                          "https://base44.app/api/apps/69dd9ffccab4dd693d4d92f5/files/mp/public/69dd9ffccab4dd693d4d92f5/4dd6a6dd2_OO-FLIGHT.jpg",
  "00 Flight with Filler Plates":       "https://base44.app/api/apps/69dd9ffccab4dd693d4d92f5/files/mp/public/69dd9ffccab4dd693d4d92f5/253dff3e1_OO-WITH-FILLER-PLATES.jpg",
  "Return Cups":                        "https://base44.app/api/apps/69dd9ffccab4dd693d4d92f5/files/mp/public/69dd9ffccab4dd693d4d92f5/2be898a6a_RETURN-CUPS.jpg",
};

function getLinkImg(t) { return t==="Double"?IMG.double:t==="Triple"?IMG.triple:IMG.standard; }
function tryParse(v) { try { return JSON.parse(v||"[]"); } catch { return []; } }

// ── RFQ Context ───────────────────────────────────────────────────────────────
function getRFQCart() { try { return JSON.parse(localStorage.getItem("rfq_cart")||"[]"); } catch { return []; } }
function saveRFQCart(c) { localStorage.setItem("rfq_cart", JSON.stringify(c)); }
function addToRFQ(item) {
  const cart = getRFQCart();
  cart.push({ ...item, id: Date.now() });
  saveRFQCart(cart);
  return cart.length;
}

// ── Flight style SVG schematics (based on Uniking ID Form) ───────────────────
function FlightSchematicSVG({ style, dims = {}, compact = false }) {
  const W = compact ? 160 : 280, H = compact ? 110 : 190;
  const { W: fw = 200, P: fp = 142, H: fh = 80, G: fg = 40, K: fk = 30, barSize = 10 } = dims;
  const sc = compact ? 0.55 : 1;
  const cx = W / 2, cy = H / 2;

  // Chain body (simplified link)
  const chainW = Math.min(60 * sc, W * 0.35), chainH = 22 * sc;
  const chainX = cx - chainW / 2, chainY = cy + (compact ? 28 : 50);

  const link = (
    <g>
      <rect x={chainX} y={chainY} width={chainW} height={chainH} rx={chainH * 0.4}
        fill="#c8d4e8" stroke={C.navyMid} strokeWidth={compact ? 1 : 1.5} />
      <circle cx={chainX + chainH * 0.55} cy={chainY + chainH / 2} r={chainH * 0.28} fill="#6a8cb8" stroke={C.navyMid} strokeWidth="1" />
      <circle cx={chainX + chainW - chainH * 0.55} cy={chainY + chainH / 2} r={chainH * 0.28} fill="#6a8cb8" stroke={C.navyMid} strokeWidth="1" />
    </g>
  );

  const label = (x, y, txt, color="#333", size=compact?7:9) => (
    <text x={x} y={y} textAnchor="middle" fontSize={size} fill={color} fontFamily="Arial">{txt}</text>
  );
  const dimLine = (x1, y1, x2, y2, id) => (
    <g>
      <defs><marker id={id+"a"} markerWidth="4" markerHeight="4" refX="3" refY="2" orient="auto"><path d="M0,0 L4,2 L0,4 Z" fill="#555"/></marker>
      <marker id={id+"b"} markerWidth="4" markerHeight="4" refX="1" refY="2" orient="auto"><path d="M4,0 L0,2 L4,4 Z" fill="#555"/></marker></defs>
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#555" strokeWidth="0.7" markerEnd={`url(#${id}a)`} markerStart={`url(#${id}b)`}/>
    </g>
  );

  // B Style — Bar Flight (Square/Flat/Paddle all same profile)
  if (style === "B") {
    const bW = Math.min(fw * 0.55 * sc, W * 0.7), bH = barSize * sc * 1.5;
    const bX = cx - bW / 2, bY = chainY - bH - 4 * sc;
    return (
      <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H}>
        {link}
        <rect x={bX} y={bY} width={bW} height={bH} fill="#8fa8c8" stroke={C.navyMid} strokeWidth={compact?1:1.5} />
        {!compact && <>
          {dimLine(bX, bY - 14, bX + bW, bY - 14, "bw")}
          {label(cx, bY - 17, `W = ${fw} mm`, "#1B3A6B")}
          {dimLine(bX + bW + 8, bY, bX + bW + 8, bY + bH, "bh")}
          {label(bX + bW + 22, bY + bH / 2 + 3, `${barSize}`, "#555")}
        </>}
        {label(cx, H - 8, "B Style — Bar Flight", C.navyMid, compact ? 7 : 10)}
      </svg>
    );
  }

  // U Style
  if (style === "U") {
    const uW = Math.min(fw * 0.55 * sc, W * 0.7), uH = fh * 0.55 * sc;
    const uX = cx - uW / 2, uY = chainY - uH - 4 * sc;
    const t = barSize * sc;
    return (
      <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H}>
        {link}
        {/* U shape: left wall, bottom, right wall */}
        <rect x={uX} y={uY} width={t} height={uH} fill="#8fa8c8" stroke={C.navyMid} strokeWidth={compact?1:1.4} />
        <rect x={uX} y={uY + uH - t} width={uW} height={t} fill="#8fa8c8" stroke={C.navyMid} strokeWidth={compact?1:1.4} />
        <rect x={uX + uW - t} y={uY} width={t} height={uH} fill="#8fa8c8" stroke={C.navyMid} strokeWidth={compact?1:1.4} />
        {!compact && <>
          {dimLine(uX, uY - 14, uX + uW, uY - 14, "uw")}
          {label(cx, uY - 17, `W = ${fw} mm`, "#1B3A6B")}
          {dimLine(uX - 14, uY, uX - 14, uY + uH, "uh")}
          {label(uX - 28, uY + uH / 2 + 3, `H=${fh}`, "#555")}
        </>}
        {label(cx, H - 8, "U Style Flight", C.navyMid, compact ? 7 : 10)}
      </svg>
    );
  }

  // CU Style (Closed U)
  if (style === "CU") {
    const uW = Math.min(fw * 0.55 * sc, W * 0.7), uH = fh * 0.55 * sc;
    const uX = cx - uW / 2, uY = chainY - uH - 4 * sc;
    const t = barSize * sc, gH = fg * 0.4 * sc;
    return (
      <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H}>
        {link}
        <rect x={uX} y={uY} width={t} height={uH} fill="#8fa8c8" stroke={C.navyMid} strokeWidth={compact?1:1.4} />
        <rect x={uX} y={uY + uH - t} width={uW} height={t} fill="#8fa8c8" stroke={C.navyMid} strokeWidth={compact?1:1.4} />
        <rect x={uX + uW - t} y={uY} width={t} height={uH} fill="#8fa8c8" stroke={C.navyMid} strokeWidth={compact?1:1.4} />
        {/* Top plate (closed) */}
        <rect x={uX} y={uY} width={uW} height={t} fill="#7090b8" stroke={C.navyMid} strokeWidth={compact?1:1.4} />
        {/* G gap label */}
        {!compact && <>
          {dimLine(uX + t, uY + t + 2, uX + t, uY + uH - t - 2, "cug")}
          {label(uX + t + 18, uY + uH / 2, `G=${fg}`, "#c33")}
          {dimLine(uX, uY - 14, uX + uW, uY - 14, "cuw")}
          {label(cx, uY - 17, `W = ${fw} mm`, "#1B3A6B")}
          {dimLine(uX - 14, uY, uX - 14, uY + uH, "cuh")}
          {label(uX - 28, uY + uH / 2, `H=${fh}`, "#555")}
        </>}
        {label(cx, H - 8, "CU Style — Closed U Flight", C.navyMid, compact ? 7 : 10)}
      </svg>
    );
  }

  // OO Style
  if (style === "OO") {
    const uW = Math.min(fw * 0.55 * sc, W * 0.7), uH = fh * 0.55 * sc;
    const uX = cx - uW / 2, uY = chainY - uH - 4 * sc;
    const t = barSize * sc, kH = fk * 0.35 * sc;
    return (
      <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H}>
        {link}
        {/* Side walls */}
        <rect x={uX} y={uY} width={t} height={uH} fill="#8fa8c8" stroke={C.navyMid} strokeWidth={compact?1:1.4} />
        <rect x={uX + uW - t} y={uY} width={t} height={uH} fill="#8fa8c8" stroke={C.navyMid} strokeWidth={compact?1:1.4} />
        {/* Bottom */}
        <rect x={uX} y={uY + uH - t} width={uW} height={t} fill="#8fa8c8" stroke={C.navyMid} strokeWidth={compact?1:1.4} />
        {/* Top */}
        <rect x={uX} y={uY} width={uW} height={t} fill="#7090b8" stroke={C.navyMid} strokeWidth={compact?1:1.4} />
        {/* K — extended bottom lip */}
        <rect x={uX - kH} y={uY + uH - t} width={kH} height={t} fill="#6080a8" stroke={C.navyMid} strokeWidth={compact?1:1.2} opacity="0.8" />
        <rect x={uX + uW} y={uY + uH - t} width={kH} height={t} fill="#6080a8" stroke={C.navyMid} strokeWidth={compact?1:1.2} opacity="0.8" />
        {!compact && <>
          {dimLine(uX, uY - 14, uX + uW, uY - 14, "oow")}
          {label(cx, uY - 17, `W = ${fw} mm`, "#1B3A6B")}
          {dimLine(uX - 18, uY, uX - 18, uY + uH, "ooh")}
          {label(uX - 32, uY + uH / 2, `H=${fh}`, "#555")}
          {dimLine(uX - kH, uY + uH + 8, uX, uY + uH + 8, "ook")}
          {label(uX - kH / 2, uY + uH + 18, `K=${fk}`, "#c33")}
        </>}
        {label(cx, H - 8, "OO Style Flight", C.navyMid, compact ? 7 : 10)}
      </svg>
    );
  }

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H}>
      {link}
      {label(cx, cy - 10, style, C.navyMid, 14)}
    </svg>
  );
}

// ── Sequence Schematic ────────────────────────────────────────────────────────
function SequenceSchematic({ chain, attachments }) {
  if (!attachments || !attachments.length) return null;
  const pitchPx = 70, linkH = 20, W = 600, H = 200;
  const numLinks = 8;
  const links = Array.from({ length: numLinks }, (_, i) => i);

  const getStyle = (idx) => {
    let result = null;
    attachments.forEach(att => {
      const every = parseInt(att.sequence) || 1;
      const offset = parseInt(att.sequenceOffset) || 0;
      if ((idx - offset) % every === 0 && idx >= offset) result = att;
    });
    return result;
  };

  const flightColors = { B: "#4a80b8", U: "#c9a84c", CU: "#7c4ddb", OO: "#c2410c", T: "#16a34a" };

  return (
    <div style={{ background: "#f8fafc", borderRadius: 10, border: `1px solid ${C.border}`, padding: 16, overflowX: "auto" }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: C.navyMid, marginBottom: 8 }}>Sequence Preview</div>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", minWidth: 480 }}>
        {/* Chain line */}
        <line x1={20} y1={H / 2 + 10} x2={W - 20} y2={H / 2 + 10} stroke="#c8d4e8" strokeWidth="2" />

        {links.map(i => {
          const x = 30 + i * pitchPx;
          const y = H / 2;
          const att = getStyle(i);
          const linkImg = null;
          const style = att?.flightStyle;
          const fc = style ? (flightColors[style] || "#888") : null;
          const fH = att ? Math.max(30, (parseInt(att.dims?.H) || 60) * 0.5) : 0;

          return (
            <g key={i}>
              {/* Link */}
              <rect x={x - 22} y={y} width={44} height={linkH} rx={8} fill="#c8d4e8" stroke={C.navyMid} strokeWidth="1.2" />
              <circle cx={x - 12} cy={y + 10} r={5} fill="#6a8cb8" stroke={C.navyMid} strokeWidth="1" />
              <circle cx={x + 12} cy={y + 10} r={5} fill="#6a8cb8" stroke={C.navyMid} strokeWidth="1" />

              {/* Flight */}
              {att && (
                <g>
                  {/* B style */}
                  {(style === "B") && (
                    <>
                      <rect x={x - 20} y={y - fH - 2} width={40} height={8} fill={fc} stroke={C.navy} strokeWidth="0.8" opacity="0.9" />
                      <text x={x} y={y - fH - 6} textAnchor="middle" fontSize="7" fill={C.navy}>{att.flightName?.split(" ")[0]}</text>
                    </>
                  )}
                  {/* U/CU/OO style */}
                  {["U","CU","OO"].includes(style) && (
                    <>
                      <rect x={x - 16} y={y - fH - 2} width={4} height={fH} fill={fc} stroke={C.navy} strokeWidth="0.7" opacity="0.9" />
                      <rect x={x - 16} y={y - fH - 2} width={32} height={4} fill={fc} stroke={C.navy} strokeWidth="0.7" opacity="0.9" />
                      <rect x={x + 12} y={y - fH - 2} width={4} height={fH} fill={fc} stroke={C.navy} strokeWidth="0.7" opacity="0.9" />
                      {style === "CU" && <rect x={x - 16} y={y - 6} width={32} height={4} fill={fc} stroke={C.navy} strokeWidth="0.7" opacity="0.7" />}
                      <text x={x} y={y - fH - 6} textAnchor="middle" fontSize="7" fill={C.navy}>{style}</text>
                    </>
                  )}
                  {/* UHMW plate indicator */}
                  {att.uhmw && (
                    <rect x={x - 18} y={y - fH - 10} width={36} height={6} fill="#e0f2fe" stroke="#0369a1" strokeWidth="0.7" opacity="0.85" />
                  )}
                </g>
              )}

              {/* Link number */}
              <text x={x} y={y + 32} textAnchor="middle" fontSize="8" fill={C.muted}>{i + 1}</text>
            </g>
          );
        })}

        {/* Legend */}
        {attachments.map((att, i) => (
          <g key={i}>
            <rect x={20 + i * 140} y={H - 22} width={10} height={10} fill={flightColors[att.flightStyle] || "#888"} rx={2} />
            <text x={34 + i * 140} y={H - 13} fontSize="8" fill={C.text}>{att.flightName} every {att.sequence}</text>
          </g>
        ))}
      </svg>
    </div>
  );
}

// ── Flight Configurator Wizard ────────────────────────────────────────────────
const FLIGHT_STYLES = [
  { id: "B-square", name: "Square Bar Flight", style: "B", img: IMG["Square Bar Flight"] },
  { id: "B-flat",   name: "Flat Bar Flight",   style: "B", img: IMG["Flat Bar Flight"] },
  { id: "B-paddle", name: "Paddle Flight",     style: "B", img: IMG["Paddle Flight"] },
  { id: "U",        name: "U Flight",           style: "U", img: IMG["U Flight"] },
  { id: "CU",       name: "Closed U Flight",    style: "CU", img: IMG["Closed U Flight"] },
  { id: "CU-fp",    name: "Closed U with Filler Plates", style: "CU", img: IMG["Closed U Flight with Filler Plates"] },
  { id: "OO",       name: "00 Flight",          style: "OO", img: IMG["00 Flight"] },
  { id: "OO-fp",    name: "00 Flight with Filler Plates", style: "OO", img: IMG["00 Flight with Filler Plates"] },
  { id: "RC",       name: "Return Cups",        style: "B",  img: IMG["Return Cups"] },
];

const PIN_OPTIONS = [
  { name: "Forged Head Pin + Collar and Roll Pin", img: IMG.chain_pins, materials: ["Alloy Steel", "Stainless Steel"] },
  { name: "Forged Head Pin + One Clamp",           img: IMG.chain_pins, materials: ["Alloy Steel", "Stainless Steel"] },
  { name: "Plain Pin + Two Clamps",                img: IMG.chain_pins, materials: ["Alloy Steel", "Stainless Steel"] },
];

function FieldRow({ label, children }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
      <label style={{ width: 180, fontSize: 12, color: C.muted, flexShrink: 0 }}>{label}</label>
      <div style={{ flex: 1 }}>{children}</div>
    </div>
  );
}

function TextInput({ value, onChange, placeholder, unit }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        style={{ border: `1px solid ${C.border}`, borderRadius: 6, padding: "6px 10px", fontSize: 13, width: 100, outline: "none" }} />
      {unit && <span style={{ fontSize: 11, color: C.muted }}>{unit}</span>}
    </div>
  );
}

function SelectInput({ value, onChange, options }) {
  return (
    <select value={value} onChange={e => onChange(e.target.value)}
      style={{ border: `1px solid ${C.border}`, borderRadius: 6, padding: "6px 10px", fontSize: 13, outline: "none", background: "white" }}>
      <option value="">— Select —</option>
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  );
}

function emptyAttachment(idx = 0) {
  return {
    _key: Date.now() + idx,
    flightId: "", flightName: "", flightStyle: "",
    dims: { W: "", P: "", H: "", G: "", K: "", barSize: "", steelType: "", perpendicular: "No", carryBackCups: "No", cupsSize: "", configuration: "", notchDetails: "", holeDetails: "", mangTipping: "No", plateBlanking: "No" },
    uhmw: false,
    uhmwDims: { thickness: "", overallW: "", overallH: "", type: "Regular", bottomStyle: "Flush", overlap: "", sequence: "" },
    sequence: "1", sequenceOffset: "0",
  };
}

function FlightWizard({ chain, onComplete, onCancel }) {
  const [step, setStep] = useState(0);
  const [hasFlights, setHasFlights] = useState(null);
  const [attachments, setAttachments] = useState([emptyAttachment(0)]);
  const [activeAtt, setActiveAtt] = useState(0);
  const [addingAnother, setAddingAnother] = useState(false);
  const [pinStyle, setPinStyle] = useState(null);
  const [pinMaterial, setPinMaterial] = useState("");

  const att = attachments[activeAtt] || attachments[0];
  const setAtt = (fn) => setAttachments(prev => prev.map((a, i) => i === activeAtt ? fn(a) : a));

  const updateDims = (key, val) => setAtt(a => ({ ...a, dims: { ...a.dims, [key]: val } }));
  const updateUhmw = (key, val) => setAtt(a => ({ ...a, uhmwDims: { ...a.uhmwDims, [key]: val } }));

  const styleFields = {
    B:  ["W", "P", "barSize", "steelType", "perpendicular", "carryBackCups", "cupsSize", "configuration"],
    T:  ["W", "P", "barSize", "steelType", "perpendicular", "carryBackCups", "cupsSize", "configuration", "notchDetails", "holeDetails"],
    U:  ["W", "P", "H", "barSize", "steelType", "mangTipping", "plateBlanking"],
    CU: ["W", "P", "H", "G", "barSize", "steelType", "mangTipping", "plateBlanking"],
    OO: ["W", "P", "H", "G", "K", "barSize", "steelType", "mangTipping", "plateBlanking"],
  };

  const fieldLabels = {
    W: "Width (W)", P: "Pitch (P)", H: "Height (H)", G: "Gap (G)", K: "Extension (K)",
    barSize: "Bar Size", steelType: "Steel Type", perpendicular: "Perpendicular to chain?",
    carryBackCups: "Carry Back Cups?", cupsSize: "Cup Size", configuration: "Configuration",
    notchDetails: "Notch Details", holeDetails: "Hole Details",
    mangTipping: "Manganese Tipping?", plateBlanking: "Plate Blanking?",
  };

  const boolFields = ["perpendicular", "carryBackCups", "mangTipping", "plateBlanking"];
  const fields = styleFields[att.flightStyle] || [];

  // Step 0: has flights?
  if (step === 0) return (
    <div style={{ padding: "32px 24px", textAlign: "center" }}>
      <div style={{ fontSize: 20, fontWeight: 800, color: C.navyMid, marginBottom: 8 }}>Does this chain have flight attachments?</div>
      <div style={{ color: C.muted, fontSize: 13, marginBottom: 28 }}>Flights are welded steel bars or profiles bolted or welded to the chain for material conveying.</div>
      <div style={{ display: "flex", gap: 16, justifyContent: "center" }}>
        <button onClick={() => { setHasFlights(true); setStep(1); }}
          style={{ background: C.navyMid, color: "white", border: "none", borderRadius: 10, padding: "14px 36px", fontSize: 15, fontWeight: 700, cursor: "pointer" }}>
          Yes, with Flights
        </button>
        <button onClick={() => { setHasFlights(false); setStep(5); }}
          style={{ background: "#f1f5f9", color: C.text, border: `1px solid ${C.border}`, borderRadius: 10, padding: "14px 36px", fontSize: 15, fontWeight: 700, cursor: "pointer" }}>
          No Flights (Chain Only)
        </button>
      </div>
    </div>
  );

  // Step 1: pick flight style
  if (step === 1) return (
    <div style={{ padding: "24px" }}>
      <div style={{ fontSize: 16, fontWeight: 800, color: C.navyMid, marginBottom: 4 }}>
        {attachments.length > 1 || addingAnother ? `Attachment #${activeAtt + 1} — ` : ""}Select Flight Style
      </div>
      <div style={{ color: C.muted, fontSize: 12, marginBottom: 18 }}>Based on the Uniking Flight Identification Form</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 12 }}>
        {FLIGHT_STYLES.map(fs => (
          <button key={fs.id} onClick={() => { setAtt(a => ({ ...a, flightId: fs.id, flightName: fs.name, flightStyle: fs.style })); setStep(2); }}
            style={{ background: att.flightId === fs.id ? C.navyMid : C.card, border: `2px solid ${att.flightId === fs.id ? C.navyMid : C.border}`,
              borderRadius: 10, padding: 0, cursor: "pointer", overflow: "hidden", textAlign: "left", transition: "all 0.15s" }}>
            {fs.img && <img src={fs.img} alt={fs.name} style={{ width: "100%", height: 100, objectFit: "contain", background: "#f8fafc", display: "block", padding: "6px 0" }} />}
            <div style={{ padding: "8px 10px", fontSize: 11, fontWeight: 700, color: att.flightId === fs.id ? "white" : C.text }}>{fs.name}</div>
          </button>
        ))}
      </div>
    </div>
  );

  // Step 2: flight measurements
  if (step === 2) return (
    <div style={{ padding: "24px" }}>
      <div style={{ display: "flex", gap: 24, alignItems: "flex-start" }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 16, fontWeight: 800, color: C.navyMid, marginBottom: 4 }}>{att.flightName} — Measurements</div>
          <div style={{ color: C.muted, fontSize: 12, marginBottom: 20 }}>Enter dimensions based on the ID Form. All measurements in mm unless noted.</div>
          {fields.map(f => (
            <FieldRow key={f} label={fieldLabels[f]}>
              {boolFields.includes(f) ? (
                <SelectInput value={att.dims[f]} onChange={v => updateDims(f, v)} options={["Yes", "No"]} />
              ) : f === "steelType" ? (
                <SelectInput value={att.dims[f]} onChange={v => updateDims(f, v)} options={["Mild Steel", "Stainless Steel 304", "Stainless Steel 316", "Hardox", "AR400"]} />
              ) : (
                <TextInput value={att.dims[f]} onChange={v => updateDims(f, v)} placeholder="0" unit={["W","P","H","G","K"].includes(f) ? "mm" : ""} />
              )}
            </FieldRow>
          ))}
          {att.flightStyle && (
            <div style={{ marginTop: 12 }}>
              <FieldRow label="Sequence (every N links)">
                <SelectInput value={att.sequence} onChange={v => setAtt(a => ({ ...a, sequence: v }))} options={["1","2","3","4","5","6","8","10","12"]} />
              </FieldRow>
            </div>
          )}
        </div>
        <div style={{ width: 200, flexShrink: 0 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, marginBottom: 8, textTransform: "uppercase" }}>Reference Drawing</div>
          <div style={{ background: "#f8fafc", borderRadius: 10, border: `1px solid ${C.border}`, padding: 8 }}>
            <FlightSchematicSVG style={att.flightStyle} dims={{ W: parseInt(att.dims.W)||200, H: parseInt(att.dims.H)||80, G: parseInt(att.dims.G)||40, K: parseInt(att.dims.K)||30, barSize: parseInt(att.dims.barSize)||10 }} />
          </div>
          {att.img && <img src={IMG[att.flightName]} alt={att.flightName} style={{ width: "100%", marginTop: 10, borderRadius: 8, border: `1px solid ${C.border}` }} onError={() => {}} />}
        </div>
      </div>
      <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
        <button onClick={() => setStep(1)} style={{ background: "#f1f5f9", border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 20px", cursor: "pointer", fontSize: 13 }}>← Back</button>
        <button onClick={() => setStep(3)} style={{ background: C.navyMid, color: "white", border: "none", borderRadius: 8, padding: "10px 24px", cursor: "pointer", fontSize: 13, fontWeight: 700 }}>Next →</button>
      </div>
    </div>
  );

  // Step 3: UHMW plates
  if (step === 3) return (
    <div style={{ padding: "24px" }}>
      <div style={{ fontSize: 16, fontWeight: 800, color: C.navyMid, marginBottom: 4 }}>UHMW Wear Plates</div>
      <div style={{ color: C.muted, fontSize: 12, marginBottom: 20 }}>Does this flight have UHMW polyethylene plates bolted to it?</div>
      <div style={{ display: "flex", gap: 12, marginBottom: 24 }}>
        <button onClick={() => setAtt(a => ({ ...a, uhmw: true }))}
          style={{ flex: 1, background: att.uhmw ? C.navyMid : "#f1f5f9", color: att.uhmw ? "white" : C.text, border: `2px solid ${att.uhmw ? C.navyMid : C.border}`, borderRadius: 10, padding: "14px", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
          Yes, with UHMW Plates
        </button>
        <button onClick={() => setAtt(a => ({ ...a, uhmw: false }))}
          style={{ flex: 1, background: !att.uhmw ? C.navyMid : "#f1f5f9", color: !att.uhmw ? "white" : C.text, border: `2px solid ${!att.uhmw ? C.navyMid : C.border}`, borderRadius: 10, padding: "14px", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
          No UHMW
        </button>
      </div>

      {att.uhmw && (
        <div style={{ background: "#f0f7ff", borderRadius: 10, border: `1px solid #bfdbfe`, padding: "18px 20px" }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.navyMid, marginBottom: 14 }}>UHMW Plate Details</div>
          <FieldRow label="Plate Thickness"><TextInput value={att.uhmwDims.thickness} onChange={v => updateUhmw("thickness", v)} unit="mm" /></FieldRow>
          <FieldRow label="Overall Width"><TextInput value={att.uhmwDims.overallW} onChange={v => updateUhmw("overallW", v)} unit="mm" /></FieldRow>
          <FieldRow label="Overall Height"><TextInput value={att.uhmwDims.overallH} onChange={v => updateUhmw("overallH", v)} unit="mm" /></FieldRow>
          <FieldRow label="UHMW Type">
            <SelectInput value={att.uhmwDims.type} onChange={v => updateUhmw("type", v)} options={["Regular UHMW", "High Heat UHMW"]} />
          </FieldRow>
          <FieldRow label="Bottom Style">
            <SelectInput value={att.uhmwDims.bottomStyle} onChange={v => updateUhmw("bottomStyle", v)} options={["Flush to bottom", "Overlap"]} />
          </FieldRow>
          {att.uhmwDims.bottomStyle === "Overlap" && (
            <FieldRow label="Overlap Amount"><TextInput value={att.uhmwDims.overlap} onChange={v => updateUhmw("overlap", v)} unit="mm" /></FieldRow>
          )}
        </div>
      )}

      <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
        <button onClick={() => setStep(2)} style={{ background: "#f1f5f9", border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 20px", cursor: "pointer", fontSize: 13 }}>← Back</button>
        <button onClick={() => setStep(4)} style={{ background: C.navyMid, color: "white", border: "none", borderRadius: 8, padding: "10px 24px", cursor: "pointer", fontSize: 13, fontWeight: 700 }}>Next →</button>
      </div>
    </div>
  );

  // Step 4: Add another attachment?
  if (step === 4) return (
    <div style={{ padding: "24px" }}>
      <div style={{ fontSize: 16, fontWeight: 800, color: C.navyMid, marginBottom: 4 }}>Second Attachment?</div>
      <div style={{ color: C.muted, fontSize: 12, marginBottom: 20 }}>
        Some chains have two different flight styles — e.g. OO flights every 4th with filler plates, and OO flights every 4th between them without. Add another attachment pattern?
      </div>

      {/* Summary of current attachments */}
      <div style={{ marginBottom: 20 }}>
        {attachments.map((a, i) => (
          <div key={a._key} style={{ background: "#f0f7ff", borderRadius: 8, padding: "10px 14px", marginBottom: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <span style={{ fontWeight: 700, color: C.navyMid, fontSize: 13 }}>Attachment {i + 1}: </span>
              <span style={{ fontSize: 13, color: C.text }}>{a.flightName}</span>
              <span style={{ fontSize: 12, color: C.muted }}> · Every {a.sequence} link(s)</span>
              {a.uhmw && <span style={{ fontSize: 11, background: "#bfdbfe", color: "#1d4ed8", borderRadius: 8, padding: "1px 7px", marginLeft: 8 }}>+ UHMW</span>}
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: 12 }}>
        <button onClick={() => {
          const newAtt = emptyAttachment(attachments.length);
          setAttachments(prev => [...prev, newAtt]);
          setActiveAtt(attachments.length);
          setAddingAnother(true);
          setStep(1);
        }}
          style={{ flex: 1, background: "#f0f7ff", border: `2px solid ${C.navyMid}`, color: C.navyMid, borderRadius: 10, padding: "14px", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
          + Add Another Attachment
        </button>
        <button onClick={() => setStep(5)}
          style={{ flex: 1, background: C.navyMid, color: "white", border: "none", borderRadius: 10, padding: "14px", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
          Done with Attachments →
        </button>
      </div>
      <div style={{ marginTop: 12 }}>
        <button onClick={() => setStep(3)} style={{ background: "#f1f5f9", border: `1px solid ${C.border}`, borderRadius: 8, padding: "8px 16px", cursor: "pointer", fontSize: 12 }}>← Back</button>
      </div>
    </div>
  );

  // Step 5: Pin selection
  if (step === 5) return (
    <div style={{ padding: "24px" }}>
      <div style={{ fontSize: 16, fontWeight: 800, color: C.navyMid, marginBottom: 4 }}>Pin Style & Material</div>
      <div style={{ color: C.muted, fontSize: 12, marginBottom: 16 }}>Select how this chain will be assembled.</div>
      <div style={{ marginBottom: 14 }}>
        <img src={IMG.chain_pins} alt="Pin styles" style={{ width: "100%", maxWidth: 340, height: 160, objectFit: "contain", borderRadius: 8, background: "#f8fafc", border: `1px solid ${C.border}` }} />
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
        {PIN_OPTIONS.map(p => (
          <button key={p.name} onClick={() => setPinStyle(p.name)}
            style={{ background: pinStyle === p.name ? C.navyMid : C.card, border: `2px solid ${pinStyle === p.name ? C.navyMid : C.border}`,
              borderRadius: 10, padding: "12px 16px", cursor: "pointer", textAlign: "left", fontSize: 13, fontWeight: 600,
              color: pinStyle === p.name ? "white" : C.text, transition: "all 0.15s" }}>
            {p.name}
          </button>
        ))}
      </div>
      {pinStyle && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: C.muted, marginBottom: 8 }}>Pin Material</div>
          <div style={{ display: "flex", gap: 10 }}>
            {["Alloy Steel", "Stainless Steel"].map(m => (
              <button key={m} onClick={() => setPinMaterial(m)}
                style={{ flex: 1, background: pinMaterial === m ? C.green : "#f1f5f9", color: pinMaterial === m ? "white" : C.text,
                  border: `2px solid ${pinMaterial === m ? C.green : C.border}`, borderRadius: 8, padding: "10px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                {m}
              </button>
            ))}
          </div>
        </div>
      )}
      <div style={{ display: "flex", gap: 10 }}>
        <button onClick={() => setStep(hasFlights ? 4 : 0)} style={{ background: "#f1f5f9", border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 20px", cursor: "pointer", fontSize: 13 }}>← Back</button>
        <button onClick={() => { if (pinStyle && pinMaterial) setStep(6); }}
          disabled={!pinStyle || !pinMaterial}
          style={{ background: pinStyle && pinMaterial ? C.navyMid : "#e5e7eb", color: pinStyle && pinMaterial ? "white" : C.muted, border: "none", borderRadius: 8, padding: "10px 24px", cursor: pinStyle && pinMaterial ? "pointer" : "default", fontSize: 13, fontWeight: 700 }}>
          Review & Add to RFQ →
        </button>
      </div>
    </div>
  );

  // Step 6: Review + sequence schematic + Add to RFQ
  if (step === 6) {
    // Build description string
    const chainDesc = `4B Drop Forged Chain ${chain.chain_link} (${chain.link_type} Link, P=${chain.P_mm}mm, ${chain.min_breaking_load_kn}kN)`;
    const flightDescs = hasFlights ? attachments.map((a, i) => {
      let d = `Attachment ${i + 1}: ${a.flightName} every ${a.sequence} link(s)`;
      const dims = a.dims;
      const dimParts = [];
      if (dims.W) dimParts.push(`W=${dims.W}mm`);
      if (dims.H) dimParts.push(`H=${dims.H}mm`);
      if (dims.G) dimParts.push(`G=${dims.G}mm`);
      if (dims.K) dimParts.push(`K=${dims.K}mm`);
      if (dims.barSize) dimParts.push(`Bar ${dims.barSize}mm`);
      if (dims.steelType) dimParts.push(dims.steelType);
      if (dimParts.length) d += ` [${dimParts.join(", ")}]`;
      if (a.uhmw) {
        d += ` + UHMW (${a.uhmwDims.type}, T=${a.uhmwDims.thickness}mm, W=${a.uhmwDims.overallW}mm, H=${a.uhmwDims.overallH}mm, ${a.uhmwDims.bottomStyle}${a.uhmwDims.overlap ? ` OL=${a.uhmwDims.overlap}mm` : ""})`;
      }
      return d;
    }).join(" | ") : "No flights";
    const pinDesc = `Pin: ${pinStyle} — ${pinMaterial}`;
    const fullDesc = [chainDesc, flightDescs, pinDesc].join(" · ");

    return (
      <div style={{ padding: "24px" }}>
        <div style={{ fontSize: 16, fontWeight: 800, color: C.navyMid, marginBottom: 16 }}>Configuration Summary</div>

        {hasFlights && <SequenceSchematic chain={chain} attachments={attachments} />}

        <div style={{ marginTop: 20, background: "#f8fafc", borderRadius: 10, border: `1px solid ${C.border}`, padding: "16px 18px" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, marginBottom: 8, textTransform: "uppercase" }}>RFQ Line Item Description</div>
          <div style={{ fontSize: 12, color: C.text, lineHeight: 1.7, fontFamily: "monospace", background: "#fff", borderRadius: 6, padding: "10px 14px", border: `1px solid ${C.border}` }}>
            {fullDesc}
          </div>
        </div>

        <div style={{ marginTop: 16, display: "flex", gap: 10 }}>
          <button onClick={() => setStep(5)} style={{ background: "#f1f5f9", border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 20px", cursor: "pointer", fontSize: 13 }}>← Back</button>
          <button onClick={() => onComplete({ description: fullDesc, chain, attachments, pinStyle, pinMaterial })}
            style={{ flex: 1, background: C.green, color: "white", border: "none", borderRadius: 8, padding: "12px 24px", cursor: "pointer", fontSize: 14, fontWeight: 700 }}>
            Add to RFQ Cart
          </button>
        </div>
      </div>
    );
  }

  return null;
}

// ── Product Modal ─────────────────────────────────────────────────────────────
function ChainModal({ chain, onClose, onAddRFQ }) {
  const [tab, setTab] = useState("specs");
  const [showConfigurator, setShowConfigurator] = useState(false);
  const [rfqAdded, setRfqAdded] = useState(false);

  const sprockets = tryParse(chain.sprocket_data);
  const trailers = tryParse(chain.trailer_data);
  const pins = tryParse(chain.pin_options);

  if (showConfigurator) return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div style={{ background: "white", borderRadius: 16, width: "100%", maxWidth: 860, maxHeight: "92vh", overflow: "auto", position: "relative" }}>
        <div style={{ background: C.navyMid, padding: "14px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", borderRadius: "16px 16px 0 0" }}>
          <div style={{ color: "white", fontWeight: 800, fontSize: 16 }}>Configure {chain.chain_link}</div>
          <button onClick={() => setShowConfigurator(false)} style={{ background: "rgba(255,255,255,0.15)", border: "none", color: "white", borderRadius: 8, padding: "6px 14px", cursor: "pointer" }}>✕ Close</button>
        </div>
        <FlightWizard chain={chain} onCancel={() => setShowConfigurator(false)} onComplete={(result) => {
          onAddRFQ(result);
          setShowConfigurator(false);
          setRfqAdded(true);
        }} />
      </div>
    </div>
  );

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", zIndex: 9000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div style={{ background: "white", borderRadius: 16, width: "100%", maxWidth: 840, maxHeight: "92vh", overflow: "auto", position: "relative" }}>

        {/* Modal header */}
        <div style={{ background: `linear-gradient(135deg, ${C.navy}, ${C.navyMid})`, padding: "18px 24px", borderRadius: "16px 16px 0 0", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ color: "white", fontSize: 22, fontWeight: 800 }}>{chain.chain_link}</div>
            <div style={{ color: "rgba(255,255,255,0.65)", fontSize: 13, marginTop: 3 }}>
              Drop Forged Chain · {chain.link_type} Link · P = {chain.P_mm} mm · {chain.min_breaking_load_kn} kN
            </div>
          </div>
          <button onClick={onClose} style={{ background: "rgba(255,255,255,0.15)", border: "none", color: "white", borderRadius: 8, padding: "8px 16px", cursor: "pointer", fontSize: 13 }}>✕</button>
        </div>

        {/* Hero + actions */}
        <div style={{ display: "flex", gap: 20, padding: "20px 24px 0", alignItems: "flex-start" }}>
          <img src={getLinkImg(chain.link_type)} alt={chain.link_type}
            style={{ width: 130, height: 130, objectFit: "cover", borderRadius: 10, border: `1px solid ${C.border}`, flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            {chain.notes && <div style={{ fontSize: 13, color: C.muted, marginBottom: 12 }}>{chain.notes}</div>}
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {chain.bolt_n_go_compatible && <span style={{ background: C.greenBg, color: C.green, fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 99 }}>⚡ Bolt N Go Compatible</span>}
              {chain.stainless_available && <span style={{ background: "#f1f5f9", color: C.muted, fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 99 }}>Stainless Available</span>}
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 16, flexWrap: "wrap" }}>
              <button onClick={() => setShowConfigurator(true)}
                style={{ background: C.navyMid, color: "white", border: "none", borderRadius: 9, padding: "10px 22px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
                Configure + Build Quote
              </button>
              <button onClick={() => { onAddRFQ({ description: `4B Drop Forged Chain ${chain.chain_link} (${chain.link_type} Link, P=${chain.P_mm}mm, ${chain.min_breaking_load_kn}kN, W=${chain.W_mm}mm)`, chain }); setRfqAdded(true); }}
                style={{ background: rfqAdded ? C.green : "#f1f5f9", color: rfqAdded ? "white" : C.text, border: `1px solid ${rfqAdded ? C.green : C.border}`, borderRadius: 9, padding: "10px 22px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
                {rfqAdded ? "✓ Added to RFQ" : "Add to RFQ (Chain Only)"}
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 4, padding: "16px 24px 0", borderBottom: `1px solid ${C.border}` }}>
          {[["specs","Specifications"], ["sprockets",`Sprockets (${sprockets.length})`], ["pins","Pins"], ["segments","Segments"]].map(([k, l]) => (
            <button key={k} onClick={() => setTab(k)}
              style={{ padding: "8px 16px", border: "none", cursor: "pointer", fontWeight: 600, fontSize: 12, borderRadius: "8px 8px 0 0",
                background: tab === k ? C.navyMid : "transparent", color: tab === k ? "white" : C.muted, borderBottom: tab === k ? "none" : undefined }}>
              {l}
            </button>
          ))}
        </div>

        <div style={{ padding: "20px 24px 28px" }}>
          {/* SPECS */}
          {tab === "specs" && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: C.navyMid, marginBottom: 10, textTransform: "uppercase" }}>Dimensions</div>
                {[["Pitch (P)", `${chain.P_mm} mm`], ["Height (H)", `${chain.H_mm} mm`], ["Plate Thickness (T)", `${chain.T_mm} mm`], ["Width (W)", `${chain.W_mm} mm`], ["Pin-to-Edge (M)", `${chain.M_mm} mm`], ["Pin Hole Dia (D)", `${chain.D_mm} mm`], ...(chain.F_mm ? [["Overall Width (F)", `${chain.F_mm} mm`], ["Bar Gap (E)", `${chain.E_mm} mm`]] : [])].map(([k,v]) => (
                  <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: `1px solid ${C.border}`, fontSize: 13 }}>
                    <span style={{ color: C.muted }}>{k}</span><span style={{ fontWeight: 600 }}>{v}</span>
                  </div>
                ))}
              </div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: C.navyMid, marginBottom: 10, textTransform: "uppercase" }}>Mechanical</div>
                {[["Min Breaking Load", `${chain.min_breaking_load_kn} kN`], ["Case Hardness", chain.case_hardness || "C57–C62"], ["Case Depth", `${chain.case_depth_mm || 0.7} mm`], ["Core Hardness", chain.core_hardness || "C40"], ["Weight / Link", `${chain.weight_per_link_kg} kg`], ["Link Type", chain.link_type], ["Stainless Avail.", chain.stainless_available ? "Yes" : "No"]].map(([k,v]) => (
                  <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: `1px solid ${C.border}`, fontSize: 13 }}>
                    <span style={{ color: C.muted }}>{k}</span><span style={{ fontWeight: 600 }}>{v}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SPROCKETS */}
          {tab === "sprockets" && (
            <div>
              {sprockets.length === 0 ? (
                <div style={{ textAlign: "center", padding: 32, color: C.muted }}>No sprocket data available. Contact Uniking Canada.</div>
              ) : (
                <>
                  <div style={{ display: "flex", gap: 16, marginBottom: 16 }}>
                    <img src={IMG.sprocket_installed} alt="Sprocket" style={{ width: 160, height: 110, objectFit: "cover", borderRadius: 8, border: `1px solid ${C.border}` }} />
                    <div>
                      <div style={{ fontWeight: 700, color: C.navyMid, fontSize: 14 }}>Sprocket Family: {chain.sprocket_family}</div>
                      <div style={{ fontSize: 12, color: C.muted, marginTop: 4, marginBottom: 12 }}>Each tooth count is a separate product. Add individual sprockets to RFQ.</div>
                    </div>
                  </div>
                  <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                      <thead><tr style={{ background: C.navyMid, color: "white" }}>
                        {["Teeth","PCD mm","ØA mm","ØB mm","ØC max","Bolts","T mm","WB1 mm","Add to RFQ"].map(h => (
                          <th key={h} style={{ padding: "8px 10px", textAlign: "center", fontWeight: 600 }}>{h}</th>
                        ))}
                      </tr></thead>
                      <tbody>
                        {sprockets.map((s, i) => (
                          <tr key={i} style={{ background: i % 2 ? "#f5f7fb" : "white" }}>
                            {[s.teeth, s.pcd_mm, s.A_mm, s.B_mm, s.C_max_mm, s.bolts, s.T_mm, s.WB1_mm].map((v, j) => (
                              <td key={j} style={{ padding: "7px 10px", textAlign: "center", borderBottom: `1px solid ${C.border}` }}>{v}</td>
                            ))}
                            <td style={{ padding: "5px 8px", textAlign: "center", borderBottom: `1px solid ${C.border}` }}>
                              <button onClick={() => onAddRFQ({ description: `4B Sprocket ${chain.sprocket_family} — ${s.teeth} Teeth, PCD=${s.pcd_mm}mm, T=${s.T_mm}mm, WB1=${s.WB1_mm}mm, ØA=${s.A_mm}mm, ØB=${s.B_mm}mm, Bolts=${s.bolts}` })}
                                style={{ background: C.navyMid, color: "white", border: "none", borderRadius: 6, padding: "4px 10px", cursor: "pointer", fontSize: 11, fontWeight: 700 }}>
                                + RFQ
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {trailers.length > 0 && (
                    <div style={{ marginTop: 20 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: C.navyMid, marginBottom: 10 }}>Trailer / Return Wheels</div>
                      <div style={{ overflowX: "auto" }}>
                        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                          <thead><tr style={{ background: C.navyLight, color: "white" }}>
                            {["PCD mm","C max (smooth)","WB2 smooth","WB3 segmental","T1 rim","Add to RFQ"].map(h => (
                              <th key={h} style={{ padding: "8px 10px", textAlign: "center", fontWeight: 600 }}>{h}</th>
                            ))}
                          </tr></thead>
                          <tbody>
                            {trailers.map((t, i) => (
                              <tr key={i} style={{ background: i % 2 ? "#f5f7fb" : "white" }}>
                                {[t.pcd_mm, t.C_max_smooth_mm, t.WB2_smooth_mm, t.WB3_segmental_mm, t.T1_rim_width_mm].map((v, j) => (
                                  <td key={j} style={{ padding: "7px 10px", textAlign: "center", borderBottom: `1px solid ${C.border}` }}>{v}</td>
                                ))}
                                <td style={{ padding: "5px 8px", textAlign: "center", borderBottom: `1px solid ${C.border}` }}>
                                  <button onClick={() => onAddRFQ({ description: `4B Trailer/Return Wheel for ${chain.sprocket_family} — PCD=${t.pcd_mm}mm, C max=${t.C_max_smooth_mm}mm, WB2=${t.WB2_smooth_mm}mm, WB3=${t.WB3_segmental_mm}mm, T1=${t.T1_rim_width_mm}mm` })}
                                    style={{ background: C.navyLight, color: "white", border: "none", borderRadius: 6, padding: "4px 10px", cursor: "pointer", fontSize: 11, fontWeight: 700 }}>
                                    + RFQ
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* PINS */}
          {tab === "pins" && (
            <div>
              <div style={{ marginBottom: 14 }}>
                <img src={IMG.chain_pins} alt="Pin styles" style={{ width: "100%", maxWidth: 340, height: 160, objectFit: "contain", borderRadius: 8, background: "#f8fafc", border: `1px solid ${C.border}` }} />
              </div>
              <div style={{ fontSize: 12, color: C.muted, marginBottom: 14 }}>Each pin style + material combination is a separate product. Add to RFQ individually.</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {pins.flatMap(p =>
                  ["Alloy Steel", "Stainless Steel"].map(mat => ({
                    key: `${p.name}--${mat}`,
                    name: p.name,
                    material: mat,
                    desc: `4B Forged Chain Pin — ${p.name}, ${mat}, for chain ${chain.chain_link} (P=${chain.P_mm}mm)`,
                  }))
                ).map(item => (
                  <div key={item.key} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#f8fafc", borderRadius: 10, border: `1px solid ${C.border}`, padding: "12px 16px" }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 13, color: C.text }}>{item.name}</div>
                      <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{item.material}</div>
                    </div>
                    <button onClick={() => onAddRFQ({ description: item.desc })}
                      style={{ background: C.navyMid, color: "white", border: "none", borderRadius: 8, padding: "8px 16px", cursor: "pointer", fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
                      + Add to RFQ
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SEGMENTS */}
          {tab === "segments" && (
            <div>
              {trailers.length === 0 && sprockets.length === 0 ? (
                <div style={{ textAlign: "center", padding: 32, color: C.muted }}>No segment data available. Contact Uniking Canada.</div>
              ) : (
                <div>
                  <div style={{ fontSize: 13, color: C.muted, marginBottom: 16 }}>Segmented sprockets and return wheel segments for {chain.chain_link}.</div>
                  {sprockets.length > 0 && (
                    <div style={{ marginBottom: 20 }}>
                      <div style={{ fontWeight: 700, color: C.navyMid, fontSize: 13, marginBottom: 10 }}>Sprocket Segments — {chain.sprocket_family}</div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        {sprockets.map((s, i) => (
                          <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#f8fafc", borderRadius: 10, border: `1px solid ${C.border}`, padding: "10px 16px" }}>
                            <div>
                              <span style={{ fontWeight: 700, fontSize: 13, color: C.text }}>{s.teeth}-Tooth Segmented Sprocket</span>
                              <span style={{ fontSize: 11, color: C.muted, marginLeft: 10 }}>PCD={s.pcd_mm}mm · ØA={s.A_mm}mm</span>
                            </div>
                            <button onClick={() => onAddRFQ({ description: `4B Segmented Sprocket ${chain.sprocket_family} — ${s.teeth} Teeth (Segmented), PCD=${s.pcd_mm}mm, T=${s.T_mm}mm, WB1=${s.WB1_mm}mm` })}
                              style={{ background: C.orange, color: "white", border: "none", borderRadius: 8, padding: "8px 14px", cursor: "pointer", fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
                              + Add to RFQ
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function ForgedChainConfigurator() {
  const [chains, setChains] = useState([]);
  const [selected, setSelected] = useState(null);
  const [rfqToast, setRfqToast] = useState(null);

  useEffect(() => {
    ForgedChain.list().then(data => {
      setChains([...data].sort((a, b) => a.P_mm - b.P_mm || a.chain_link.localeCompare(b.chain_link)));
    });
  }, []);

  const handleAddRFQ = (item) => {
    const count = addToRFQ(item);
    setRfqToast(`Added to RFQ (${count} item${count !== 1 ? "s" : ""})`);
    setTimeout(() => setRfqToast(null), 3000);
  };

  const groupByPitch = chains.reduce((acc, c) => {
    const key = `${c.P_mm}mm`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(c);
    return acc;
  }, {});

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "Inter, Arial, sans-serif" }}>

      {/* Toast */}
      {rfqToast && (
        <div style={{ position: "fixed", bottom: 24, right: 24, background: C.green, color: "white", padding: "12px 20px", borderRadius: 10, fontWeight: 700, fontSize: 13, zIndex: 99999, boxShadow: "0 4px 16px rgba(0,0,0,0.2)" }}>
          ✓ {rfqToast}
        </div>
      )}

      {/* Header */}
      <div style={{ background: `linear-gradient(135deg, ${C.navy} 0%, ${C.navyMid} 100%)`, padding: "20px 32px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <button onClick={() => window.history.back()}
            style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", color: "white", padding: "6px 14px", borderRadius: 6, cursor: "pointer", fontSize: 13 }}>
            ← Back
          </button>
          <div>
            <div style={{ color: "white", fontSize: 22, fontWeight: 800 }}>Drop Forged Chain</div>
            <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 12, marginTop: 2 }}>4B Components · For Drag Conveyors</div>
          </div>
        </div>
        <img src={IMG.hero} alt="4B Forged Chain" style={{ height: 64, borderRadius: 8, opacity: 0.9 }} />
      </div>

      {/* Feature bar */}
      <div style={{ background: "white", borderBottom: `1px solid ${C.border}`, padding: "10px 32px", display: "flex", gap: 24 }}>
        {["Case Hardened C57–C62", "Ductile Core C40", "Pitches 102–260 mm", "Double & Triple Strand", "Custom Flights Available", "Stainless Available"].map(f => (
          <span key={f} style={{ fontSize: 11, color: C.muted, fontWeight: 600 }}>✓ {f}</span>
        ))}
      </div>

      {/* Grid */}
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "28px 20px" }}>
        {Object.entries(groupByPitch).map(([pitch, items]) => (
          <div key={pitch} style={{ marginBottom: 36 }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: C.navyMid, textTransform: "uppercase", letterSpacing: 1, marginBottom: 14, paddingBottom: 6, borderBottom: `2px solid ${C.border}` }}>
              {pitch} Pitch
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 16 }}>
              {items.map(chain => (
                <div key={chain.id} onClick={() => setSelected(chain)}
                  style={{ background: "white", borderRadius: 12, border: `1px solid ${C.border}`, cursor: "pointer", overflow: "hidden", transition: "all 0.15s" }}
                  onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 6px 20px rgba(0,0,0,0.10)"; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; }}>
                  <div style={{ height: 3, background: `linear-gradient(90deg, ${C.navyMid}, ${C.navyLight})` }} />
                  <div style={{ padding: 14 }}>
                    <div style={{ display: "flex", gap: 12, alignItems: "flex-start", marginBottom: 10 }}>
                      <img src={getLinkImg(chain.link_type)} alt={chain.link_type}
                        style={{ width: 64, height: 64, objectFit: "cover", borderRadius: 8, border: `1px solid ${C.border}`, flexShrink: 0 }} />
                      <div>
                        <div style={{ fontSize: 16, fontWeight: 800, color: C.navy }}>{chain.chain_link}</div>
                        <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{chain.link_type} Link</div>
                        <div style={{ fontSize: 11, color: C.muted }}>P = {chain.P_mm} mm</div>
                      </div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 12 }}>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ color: C.muted }}>Breaking Load</span>
                        <span style={{ fontWeight: 700, color: C.text }}>{chain.min_breaking_load_kn} kN</span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ color: C.muted }}>Height</span>
                        <span style={{ fontWeight: 600 }}>{chain.H_mm} mm</span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ color: C.muted }}>Weight / Link</span>
                        <span style={{ fontWeight: 600 }}>{chain.weight_per_link_kg} kg</span>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 5, marginTop: 10, flexWrap: "wrap" }}>
                      {chain.bolt_n_go_compatible && <span style={{ fontSize: 9, background: C.greenBg, color: C.green, padding: "1px 6px", borderRadius: 8, fontWeight: 700 }}>⚡ Bolt N Go</span>}
                      {chain.stainless_available && <span style={{ fontSize: 9, background: "#f1f5f9", color: C.muted, padding: "1px 6px", borderRadius: 8 }}>Stainless Avail.</span>}
                    </div>
                  </div>
                  <div style={{ padding: "8px 14px", borderTop: `1px solid ${C.border}`, background: "#f8fafc", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 11, color: C.muted }}>Click to view details</span>
                    <span style={{ fontSize: 11, color: C.navyMid, fontWeight: 700 }}>Details →</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {selected && <ChainModal chain={selected} onClose={() => setSelected(null)} onAddRFQ={(item) => { handleAddRFQ(item); }} />}
    </div>
  );
}
