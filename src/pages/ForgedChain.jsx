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
  bolt_n_go: "https://base44.app/api/apps/69dd9ffccab4dd693d4d92f5/files/mp/public/69dd9ffccab4dd693d4d92f5/4730baa88_4b142ha-chain.jpg",
  chain_installed:    "https://base44.app/api/apps/69dd9ffccab4dd693d4d92f5/files/mp/public/69dd9ffccab4dd693d4d92f5/4730baa88_4b142ha-chain.jpg",
  double_installed:   "https://base44.app/api/apps/69dd9ffccab4dd693d4d92f5/files/mp/public/69dd9ffccab4dd693d4d92f5/5927207c6_double-link-installed.jpg",
  sprocket_installed: "https://base44.app/api/apps/69dd9ffccab4dd693d4d92f5/files/mp/public/69dd9ffccab4dd693d4d92f5/1869b08c5_sprocket-installed.jpg",
  // Pin images — each pin type gets its own cropped region from the combined photo
  pin_all:            "https://base44.app/api/apps/69dd9ffccab4dd693d4d92f5/files/mp/public/69dd9ffccab4dd693d4d92f5/728ea1a69_chain-pins.jpg",
  // Flight images
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

// Pin type individual images (using object-position to crop the combined photo)
const PIN_IMG_POSITION = {
  "Forged Head Pin + Collar and Roll Pin": "top",    // top row in combined photo
  "Forged Head Pin + One Clamp":           "center", // middle row
  "Plain Pin + Two Clamps":               "bottom",  // bottom row
};

function getLinkImg(t) { return t==="Double"?IMG.double:t==="Triple"?IMG.triple:IMG.standard; }
function tryParse(v) { try { return JSON.parse(v||"[]"); } catch { return []; } }

const MM_TO_IN = 0.03937008;
const IN_TO_MM = 25.4;
function toDisplay(mm, imperial) {
  if (!mm && mm !== 0) return "";
  return imperial ? (parseFloat(mm) * MM_TO_IN).toFixed(3) : String(mm);
}
function toMM(val, imperial) {
  const n = parseFloat(val);
  if (isNaN(n)) return "";
  return imperial ? String(Math.round(n * IN_TO_MM * 10) / 10) : String(n);
}

function getRFQCart() { try { return JSON.parse(localStorage.getItem("rfq_cart")||"[]"); } catch { return []; } }
function saveRFQCart(c) { localStorage.setItem("rfq_cart", JSON.stringify(c)); }
function addToRFQ(item) {
  const cart = getRFQCart();
  cart.push({ ...item, id: Date.now() });
  saveRFQCart(cart);
  return cart.length;
}

// ── PIN PRODUCT PAGE ──────────────────────────────────────────────────────────
function PinModal({ pinName, chainLink, onClose, onAddRFQ }) {
  const [material, setMaterial] = useState("");
  const [qty, setQty] = useState("");
  const [added, setAdded] = useState(false);

  const position = PIN_IMG_POSITION[pinName] || "center";

  const pinDescriptions = {
    "Forged Head Pin + Collar and Roll Pin": "Drop-forged head pin retained by a collar and roll pin. Standard assembly method — provides maximum strength and is the most common configuration for heavy-duty drag conveyor chains.",
    "Forged Head Pin + One Clamp":           "Forged head pin retained by a single clamp. Easier to service than roll pin style — ideal for applications requiring frequent disassembly or inspection.",
    "Plain Pin + Two Clamps":                "Plain (unheaded) pin retained by two clamps, one on each end. Allows removal from either side — preferred in confined spaces or where bidirectional disassembly is needed.",
  };

  const handleAdd = () => {
    if (!material || !qty) return;
    onAddRFQ({ description: `4B Drop Forged Chain Pin — ${pinName} | Chain: ${chainLink} | Material: ${material} | Qty: ${qty} pins` });
    setAdded(true);
    setTimeout(() => onClose(), 1500);
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", zIndex: 10000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ background: "white", borderRadius: 16, width: "100%", maxWidth: 480, maxHeight: "90vh", overflowY: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
        <div style={{ background: `linear-gradient(135deg, ${C.navy}, ${C.navyMid})`, padding: "20px 24px", borderRadius: "16px 16px 0 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ color: "white", fontWeight: 800, fontSize: 16 }}>{pinName}</div>
            <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 12 }}>For chain: {chainLink}</div>
          </div>
          <button onClick={onClose} style={{ background: "rgba(255,255,255,0.1)", border: "none", color: "white", cursor: "pointer", borderRadius: 8, padding: "6px 12px", fontSize: 13 }}>✕</button>
        </div>

        {/* Pin image — cropped to show just this pin type */}
        <div style={{ overflow: "hidden", height: 160, position: "relative", background: "#f8fafc" }}>
          <img src={IMG.pin_all} alt={pinName}
            style={{ width: "100%", height: "480px", objectFit: "cover", objectPosition: `center ${position}`, position: "absolute", top: position === "top" ? 0 : position === "bottom" ? "auto" : "50%", transform: position === "center" ? "translateY(-50%)" : "none", bottom: position === "bottom" ? 0 : "auto" }} />
        </div>

        <div style={{ padding: "20px 24px" }}>
          <p style={{ fontSize: 13, color: C.text, lineHeight: 1.7, marginBottom: 20 }}>{pinDescriptions[pinName]}</p>

          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: C.muted, marginBottom: 8 }}>Pin Material</div>
            <div style={{ display: "flex", gap: 10 }}>
              {["Alloy Steel", "Stainless Steel"].map(m => (
                <button key={m} onClick={() => setMaterial(m)}
                  style={{ flex: 1, background: material === m ? C.navyMid : "#f1f5f9", color: material === m ? "white" : C.text,
                    border: `2px solid ${material === m ? C.navyMid : C.border}`, borderRadius: 8, padding: "10px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                  {m}
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: C.muted, marginBottom: 8 }}>Quantity (number of pins)</div>
            <input type="number" value={qty} onChange={e => setQty(e.target.value)} placeholder="e.g. 100"
              style={{ width: "100%", border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 14px", fontSize: 13, outline: "none", boxSizing: "border-box" }} />
          </div>

          <button onClick={handleAdd} disabled={!material || !qty}
            style={{ width: "100%", background: added ? C.green : (!material || !qty ? "#e5e7eb" : C.navyMid), color: !material || !qty ? C.muted : "white",
              border: "none", borderRadius: 10, padding: "14px", fontSize: 14, fontWeight: 700, cursor: !material || !qty ? "default" : "pointer" }}>
            {added ? "✓ Added to RFQ!" : "Add to RFQ"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── SPROCKET PRODUCT PAGE ─────────────────────────────────────────────────────
function SprocketModal({ sprocket, chainLink, sprocketFamily, onClose, onAddRFQ }) {
  const [boreSize, setBoreSize] = useState("");
  const [boreType, setBoreType] = useState("");
  const [qty, setQty] = useState("");
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    if (!boreSize || !qty) return;
    const desc = `4B Sprocket ${sprocketFamily} — ${sprocket.teeth} Teeth | PCD=${sprocket.pcd_mm}mm | T=${sprocket.T_mm}mm | WB1=${sprocket.WB1_mm}mm | ØA=${sprocket.A_mm}mm | ØB=${sprocket.B_mm}mm | Bore: ${boreSize}${boreType ? ` (${boreType})` : ""} | Qty: ${qty} | For chain: ${chainLink}`;
    onAddRFQ({ description: desc });
    setAdded(true);
    setTimeout(() => onClose(), 1500);
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", zIndex: 10001, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ background: "white", borderRadius: 16, width: "100%", maxWidth: 480, maxHeight: "90vh", overflowY: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
        <div style={{ background: `linear-gradient(135deg, ${C.navy}, ${C.navyMid})`, padding: "20px 24px", borderRadius: "16px 16px 0 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ color: "white", fontWeight: 800, fontSize: 16 }}>{sprocketFamily} — {sprocket.teeth} Teeth</div>
            <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 12 }}>For chain: {chainLink}</div>
          </div>
          <button onClick={onClose} style={{ background: "rgba(255,255,255,0.1)", border: "none", color: "white", cursor: "pointer", borderRadius: 8, padding: "6px 12px", fontSize: 13 }}>✕</button>
        </div>

        <div style={{ padding: 20 }}>
          <img src={IMG.sprocket_installed} alt="Sprocket"
            style={{ width: "100%", height: 140, objectFit: "cover", borderRadius: 10, marginBottom: 16, border: `1px solid ${C.border}` }} />

          {/* Specs table */}
          <div style={{ background: "#f8fafc", borderRadius: 10, border: `1px solid ${C.border}`, overflow: "hidden", marginBottom: 20 }}>
            <div style={{ background: C.navyMid, color: "white", padding: "8px 14px", fontSize: 12, fontWeight: 700 }}>Specifications</div>
            <div style={{ padding: "0 14px" }}>
              {[["Teeth", sprocket.teeth], ["PCD", `${sprocket.pcd_mm} mm`], ["Pitch Circle (P1)", `${sprocket.P1_mm} mm`], ["ØA", `${sprocket.A_mm} mm`], ["ØB", `${sprocket.B_mm} mm`], ["C max", `${sprocket.C_max_mm} mm`], ["Bolt Size", sprocket.D_mm], ["No. Bolts", sprocket.bolts], ["Thickness (T)", `${sprocket.T_mm} mm`], ["WB1", `${sprocket.WB1_mm} mm`]].map(([k, v]) => (
                <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: `1px solid ${C.border}`, fontSize: 13 }}>
                  <span style={{ color: C.muted }}>{k}</span><span style={{ fontWeight: 600 }}>{v}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Bore size */}
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: C.muted, marginBottom: 8 }}>Bore Size (required)</div>
            <input type="text" value={boreSize} onChange={e => setBoreSize(e.target.value)} placeholder='e.g. 60mm, 2.5", 70mm keyed'
              style={{ width: "100%", border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 14px", fontSize: 13, outline: "none", boxSizing: "border-box" }} />
          </div>

          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: C.muted, marginBottom: 8 }}>Bore Type (optional)</div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {["Plain Bore", "Keyed", "Taper Lock", "QD Bush"].map(b => (
                <button key={b} onClick={() => setBoreType(b === boreType ? "" : b)}
                  style={{ background: boreType === b ? C.navyMid : "#f1f5f9", color: boreType === b ? "white" : C.text,
                    border: `1px solid ${boreType === b ? C.navyMid : C.border}`, borderRadius: 8, padding: "6px 14px", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                  {b}
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: C.muted, marginBottom: 8 }}>Quantity</div>
            <input type="number" value={qty} onChange={e => setQty(e.target.value)} placeholder="e.g. 2"
              style={{ width: "100%", border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 14px", fontSize: 13, outline: "none", boxSizing: "border-box" }} />
          </div>

          <button onClick={handleAdd} disabled={!boreSize || !qty}
            style={{ width: "100%", background: added ? C.green : (!boreSize || !qty ? "#e5e7eb" : C.navyMid), color: !boreSize || !qty ? C.muted : "white",
              border: "none", borderRadius: 10, padding: "14px", fontSize: 14, fontWeight: 700, cursor: !boreSize || !qty ? "default" : "pointer" }}>
            {added ? "✓ Added to RFQ!" : "Add Sprocket to RFQ"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── BOLT N GO PRODUCT PAGE ───────────────────────────────────────────────────
function BoltNGoModal({ chain, onClose, onAddRFQ }) {
  const [footage, setFootage] = useState("");
  const [unit, setUnit] = useState("feet");
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    if (!footage) return;
    onAddRFQ({ description: `4B Bolt N Go Chain ${chain.chain_link} (${chain.link_type} Link, P=${chain.P_mm}mm, ${chain.min_breaking_load_kn}kN) | ${footage} ${unit}` });
    setAdded(true);
    setTimeout(() => onClose(), 1500);
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", zIndex: 10000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ background: "white", borderRadius: 16, width: "100%", maxWidth: 480, boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
        <div style={{ background: `linear-gradient(135deg, ${C.green}, #15803d)`, padding: "20px 24px", borderRadius: "16px 16px 0 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ color: "white", fontWeight: 800, fontSize: 16 }}>⚡ Bolt N Go — {chain.chain_link}</div>
            <div style={{ color: "rgba(255,255,255,0.8)", fontSize: 12 }}>Pre-assembled, ready-to-install chain</div>
          </div>
          <button onClick={onClose} style={{ background: "rgba(255,255,255,0.2)", border: "none", color: "white", cursor: "pointer", borderRadius: 8, padding: "6px 12px", fontSize: 13 }}>✕</button>
        </div>
        <div style={{ padding: "20px 24px" }}>
          <img src={IMG.bolt_n_go} alt="Bolt N Go Chain"
            style={{ width: "100%", height: 140, objectFit: "cover", borderRadius: 10, marginBottom: 16, border: `1px solid ${C.border}` }} />
          <p style={{ fontSize: 13, color: C.text, lineHeight: 1.7, marginBottom: 20 }}>
            Bolt N Go chain arrives pre-assembled with pins and clamps installed — ready to drop into your conveyor without any assembly. Saves significant installation time in the field.
          </p>
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: C.muted, marginBottom: 8 }}>Unit</div>
            <div style={{ display: "flex", gap: 10 }}>
              {["feet", "metres", "links"].map(u => (
                <button key={u} onClick={() => setUnit(u)}
                  style={{ flex: 1, background: unit === u ? C.navyMid : "#f1f5f9", color: unit === u ? "white" : C.text,
                    border: `2px solid ${unit === u ? C.navyMid : C.border}`, borderRadius: 8, padding: "8px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                  {u}
                </button>
              ))}
            </div>
          </div>
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: C.muted, marginBottom: 8 }}>Quantity ({unit})</div>
            <input type="number" value={footage} onChange={e => setFootage(e.target.value)} placeholder={`e.g. ${unit === "links" ? "50" : "100"}`}
              style={{ width: "100%", border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 14px", fontSize: 13, outline: "none", boxSizing: "border-box" }} />
          </div>
          <button onClick={handleAdd} disabled={!footage}
            style={{ width: "100%", background: added ? C.green : (!footage ? "#e5e7eb" : C.navyMid), color: !footage ? C.muted : "white",
              border: "none", borderRadius: 10, padding: "14px", fontSize: 14, fontWeight: 700, cursor: !footage ? "default" : "pointer" }}>
            {added ? "✓ Added to RFQ!" : "Add Bolt N Go to RFQ"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── LIVE FLIGHT SCHEMATIC (single attachment, updates as dims typed) ────────────
function FlightSchematic({ att, imperial }) {
  const style = att?.flightStyle || "B";
  const unit = imperial ? "in" : "mm";
  const W_raw = parseFloat(att?.dims?.W) || 0;
  const H_raw = parseFloat(att?.dims?.H) || 0;
  const bar_raw = parseFloat(att?.dims?.barSize) || 0;
  const K_raw = parseFloat(att?.dims?.K) || 0;
  const hasUHMW = att?.uhmw;
  const uhmwT_raw = parseFloat(att?.uhmwDims?.thickness) || 0;
  const hasBacking = att?.hasBackingPlate;
  const bpT_raw = parseFloat(att?.backingPlateThickness) || 0;
  const seq = parseInt(att?.sequence) || 4;

  // SVG canvas
  const VW = 380, VH = 260;
  const cx = VW / 2;
  // Chain attachment points — two circles representing the chain
  // No chain shown in schematic — just the attachment profile
  const baseY = 210;

  // Scale flight dims to SVG pixels — relative to canvas
  const maxW = 300, maxH = 120;
  const W_px = W_raw > 0 ? Math.min(Math.max(W_raw * 0.55, 40), maxW) : 160;
  const H_px = H_raw > 0 ? Math.min(Math.max(H_raw * 0.55, 20), maxH) : 60;
  const bar_px = bar_raw > 0 ? Math.min(Math.max(bar_raw * 0.55, 6), 28) : 12;
  const K_px  = K_raw > 0 ? Math.min(Math.max(K_raw * 0.4, 6), 36) : 14;
  const uhmwT_px = uhmwT_raw > 0 ? Math.min(Math.max(uhmwT_raw * 0.4, 4), 20) : 8;
  const bpT_px = bpT_raw > 0 ? Math.min(Math.max(bpT_raw * 0.4, 4), 14) : 6;
  const wallT = Math.max(bar_px * 0.55, 6);

  // Colors
  const flightFill = "#4a7cba";
  const flightStroke = C.navyMid;
  const shadowFill = "#2e5a8a";
  const uhmwFill = "rgba(180,210,255,0.75)";
  // No chain graphic — clean attachment-only view

  // ── Flight body based on style ──
  let flightElem = null;
  let dimAnnotations = [];

  if (style === "B") {
    // Bar flight — horizontal bar sitting on chain
    const barY = baseY - bar_px;
    flightElem = (
      <g>
        <rect x={cx - W_px/2} y={barY} width={W_px} height={bar_px} fill={flightFill} stroke={flightStroke} strokeWidth="1.5" rx="2" />
        <rect x={cx + W_px/2} y={barY + 2} width={5} height={bar_px} fill={shadowFill} />
        <rect x={cx - W_px/2} y={barY + bar_px} width={W_px + 5} height={4} fill={shadowFill} />
      </g>
    );
    dimAnnotations = [
      // W arrow
      { type: "h", x1: cx - W_px/2, x2: cx + W_px/2, y: barY - 18, label: W_raw > 0 ? `W = ${toDisplay(W_raw, imperial)} ${unit}` : "W = ?" },
      // Bar size
      { type: "v", x: cx - W_px/2 - 22, y1: barY, y2: barY + bar_px, label: bar_raw > 0 ? `${toDisplay(bar_raw, imperial)}` : "?" },
    ];
  } else if (style === "U" || style === "CU") {
    const topY = baseY - H_px;
    const closed = style === "CU";
    flightElem = (
      <g>
        {/* Left wall */}
        <rect x={cx - W_px/2} y={topY} width={wallT} height={H_px} fill={flightFill} stroke={flightStroke} strokeWidth="1.5" />
        {/* Right wall */}
        <rect x={cx + W_px/2 - wallT} y={topY} width={wallT} height={H_px} fill={flightFill} stroke={flightStroke} strokeWidth="1.5" />
        {/* Bottom bar */}
        <rect x={cx - W_px/2} y={baseY - wallT} width={W_px} height={wallT} fill={flightFill} stroke={flightStroke} strokeWidth="1.5" />
        {/* Top cap if Closed U */}
        {closed && <rect x={cx - W_px/2} y={topY} width={W_px} height={wallT} fill={shadowFill} stroke={flightStroke} strokeWidth="1" />}
        {/* Shadow */}
        <rect x={cx + W_px/2} y={topY + 3} width={5} height={H_px} fill={shadowFill} />
      </g>
    );
    dimAnnotations = [
      { type: "h", x1: cx - W_px/2, x2: cx + W_px/2, y: topY - 18, label: W_raw > 0 ? `W = ${toDisplay(W_raw, imperial)} ${unit}` : "W = ?" },
      { type: "v", x: cx + W_px/2 + 22, y1: topY, y2: baseY, label: H_raw > 0 ? `H = ${toDisplay(H_raw, imperial)} ${unit}` : "H = ?" },
    ];
  } else if (style === "OO") {
    const topY = baseY - H_px;
    flightElem = (
      <g>
        {/* Left wall */}
        <rect x={cx - W_px/2} y={topY} width={wallT} height={H_px} fill={flightFill} stroke={flightStroke} strokeWidth="1.5" />
        {/* Right wall */}
        <rect x={cx + W_px/2 - wallT} y={topY} width={wallT} height={H_px} fill={flightFill} stroke={flightStroke} strokeWidth="1.5" />
        {/* Bottom bar */}
        <rect x={cx - W_px/2} y={baseY - wallT} width={W_px} height={wallT} fill={flightFill} stroke={flightStroke} strokeWidth="1.5" />
        {/* Top cap (OO is closed top too) */}
        <rect x={cx - W_px/2} y={topY} width={W_px} height={wallT} fill={shadowFill} stroke={flightStroke} strokeWidth="1" />
        {/* OO lips extending outward */}
        <rect x={cx - W_px/2 - K_px} y={baseY - wallT} width={K_px} height={wallT} fill={shadowFill} stroke={flightStroke} strokeWidth="1" />
        <rect x={cx + W_px/2} y={baseY - wallT} width={K_px} height={wallT} fill={shadowFill} stroke={flightStroke} strokeWidth="1" />
        {/* Shadow */}
        <rect x={cx + W_px/2 + K_px} y={topY + 3} width={5} height={H_px} fill={shadowFill} />
      </g>
    );
    dimAnnotations = [
      { type: "h", x1: cx - W_px/2 - K_px, x2: cx + W_px/2 + K_px, y: topY - 18, label: W_raw > 0 ? `W = ${toDisplay(W_raw, imperial)} ${unit}` : "W = ?" },
      { type: "v", x: cx + W_px/2 + K_px + 22, y1: topY, y2: baseY, label: H_raw > 0 ? `H = ${toDisplay(H_raw, imperial)} ${unit}` : "H = ?" },
      { type: "h", x1: cx + W_px/2, x2: cx + W_px/2 + K_px, y: baseY + 18, label: K_raw > 0 ? `K = ${toDisplay(K_raw, imperial)} ${unit}` : "K = ?" },
    ];
  } else {
    // Paddle / filler: solid flat plate
    const plateH = Math.max(H_px, 20);
    flightElem = (
      <g>
        <rect x={cx - W_px/2} y={baseY - plateH} width={W_px} height={plateH} fill={flightFill} stroke={flightStroke} strokeWidth="1.5" />
        <rect x={cx + W_px/2} y={baseY - plateH + 3} width={5} height={plateH} fill={shadowFill} />
      </g>
    );
    dimAnnotations = [
      { type: "h", x1: cx - W_px/2, x2: cx + W_px/2, y: baseY - plateH - 18, label: W_raw > 0 ? `W = ${toDisplay(W_raw, imperial)} ${unit}` : "W = ?" },
      { type: "v", x: cx - W_px/2 - 22, y1: baseY - plateH, y2: baseY, label: H_raw > 0 ? `H = ${toDisplay(H_raw, imperial)} ${unit}` : "H = ?" },
    ];
  }

  // UHMW overlay (front face of flight)
  const uhmwElem = hasUHMW && uhmwT_px > 0 ? (() => {
    if (style === "B") {
      return <rect x={cx - W_px/2} y={baseY - bar_px - uhmwT_px} width={W_px} height={uhmwT_px} fill={uhmwFill} stroke="#4a80cc" strokeWidth="1" strokeDasharray="4,2" />;
    }
    const topY = baseY - H_px;
    // Interior face liner
    return (
      <g>
        <rect x={cx - W_px/2 + wallT} y={topY + wallT} width={uhmwT_px} height={H_px - wallT*2} fill={uhmwFill} stroke="#4a80cc" strokeWidth="0.8" strokeDasharray="3,2" />
        <rect x={cx + W_px/2 - wallT - uhmwT_px} y={topY + wallT} width={uhmwT_px} height={H_px - wallT*2} fill={uhmwFill} stroke="#4a80cc" strokeWidth="0.8" strokeDasharray="3,2" />
      </g>
    );
  })() : null;

  // Backing plate
  const bpElem = hasBacking ? (
    <g>
      <rect x={cx - W_px/2 + 6} y={baseY + 6} width={W_px - 12} height={bpT_px + 4} fill="#8a9ab8" stroke={C.navyMid} strokeWidth="1" />
      <text x={cx} y={baseY + 14 + bpT_px} textAnchor="middle" fontSize="9" fill={C.muted}>Backing Plate</text>
    </g>
  ) : null;

  // ── Arrow annotation helper ──
  const arrowHead = (id, dir) => (
    <marker key={id} id={id} markerWidth="6" markerHeight="6" refX={dir==="end"?5:1} refY="3" orient="auto">
      <path d={dir==="end"?"M0,1 L5,3 L0,5 Z":"M5,1 L0,3 L5,5 Z"} fill="#555" />
    </marker>
  );

  const renderAnnotation = (ann, idx) => {
    const aId = `a${idx}s`; const bId = `a${idx}e`;
    if (ann.type === "h") {
      return (
        <g key={idx}>
          <defs>{arrowHead(aId,"start")}{arrowHead(bId,"end")}</defs>
          <line x1={ann.x1} y1={ann.y} x2={ann.x2} y2={ann.y} stroke="#555" strokeWidth="1" markerStart={`url(#${aId})`} markerEnd={`url(#${bId})`} />
          <line x1={ann.x1} y1={ann.y - 6} x2={ann.x1} y2={ann.y + 6} stroke="#555" strokeWidth="0.8" />
          <line x1={ann.x2} y1={ann.y - 6} x2={ann.x2} y2={ann.y + 6} stroke="#555" strokeWidth="0.8" />
          <rect x={(ann.x1+ann.x2)/2 - 32} y={ann.y - 18} width={64} height={14} fill="white" rx="3" />
          <text x={(ann.x1+ann.x2)/2} y={ann.y - 7} textAnchor="middle" fontSize="10" fontWeight="600" fill={C.navyMid}>{ann.label}</text>
        </g>
      );
    } else {
      return (
        <g key={idx}>
          <defs>{arrowHead(aId,"start")}{arrowHead(bId,"end")}</defs>
          <line x1={ann.x} y1={ann.y1} x2={ann.x} y2={ann.y2} stroke="#555" strokeWidth="1" markerStart={`url(#${aId})`} markerEnd={`url(#${bId})`} />
          <line x1={ann.x - 6} y1={ann.y1} x2={ann.x + 6} y2={ann.y1} stroke="#555" strokeWidth="0.8" />
          <line x1={ann.x - 6} y1={ann.y2} x2={ann.x + 6} y2={ann.y2} stroke="#555" strokeWidth="0.8" />
          <rect x={ann.x - 28} y={(ann.y1+ann.y2)/2 - 8} width={56} height={14} fill="white" rx="3" />
          <text x={ann.x} y={(ann.y1+ann.y2)/2 + 4} textAnchor="middle" fontSize="10" fontWeight="600" fill={C.navyMid}>{ann.label}</text>
        </g>
      );
    }
  };

  // Sequence annotation
  const seqLabel = seq > 0 ? `1 flight every ${seq} links` : "";

  return (
    <div style={{ background: "#f8fafc", borderRadius: 12, border: `1px solid ${C.border}`, padding: "8px", marginBottom: 16 }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: 1, marginBottom: 4, paddingLeft: 4 }}>
        Live Preview — {att?.flightName || "Flight"}{seqLabel ? ` · ${seqLabel}` : ""}
      </div>
      <svg viewBox={`0 0 ${VW} ${VH}`} width="100%" style={{ display: "block" }}>
        {flightElem}
        {uhmwElem}
        {bpElem}
        {dimAnnotations.map((a, i) => renderAnnotation(a, i))}
        {/* UHMW label */}
        {hasUHMW && <text x={cx} y={VH - 10} textAnchor="middle" fontSize="9" fill="#4a80cc" fontWeight="600">UHMW liner shown in blue</text>}
      </svg>
    </div>
  );
}

// ── SEQUENCE SCHEMATIC (review page — multi-attachment) ───────────────────────
function SequenceSchematic({ chain, attachments }) {
  const att = attachments[0];
  const seq = parseInt(att?.sequence) || 4;
  const style = att?.flightStyle;
  const fw = parseFloat(att?.dims?.W) || 300;
  const fh = parseFloat(att?.dims?.H) || 120;
  const barSize = parseFloat(att?.dims?.barSize) || 16;
  const hasUHMW = att?.uhmw;
  const uhmwT = parseFloat(att?.uhmwDims?.thickness) || 12;
  const hasBacking = att?.hasBackingPlate;
  const backingSeq = parseInt(att?.backingPlateSequence) || 2;

  const W = 520, H = 180;
  const numLinks = Math.max(seq * 2 + 1, 5);
  const linkW = Math.min(54, (W - 60) / numLinks);
  const startX = 30;
  const chainY = H - 55;
  const links = Array.from({ length: numLinks }, (_, i) => i);

  const drawFlight = (i) => {
    const cx2 = startX + i * linkW + linkW / 2;
    const baseY2 = chainY - 10;
    const scale = Math.min(fw / 300, 1.0);
    const flightW2 = Math.min(fw * scale * 0.16, 72);
    const flightH2 = Math.min(fh * scale * 0.5, 58);
    const bar2 = Math.max(barSize * 0.16, 4);
    const t2 = Math.max(bar2, 5);
    let el = null;
    if (style === "B") {
      el = <rect x={cx2 - flightW2/2} y={baseY2 - bar2} width={flightW2} height={bar2} fill="#5a7aaa" stroke={C.navyMid} strokeWidth="1" />;
    } else if (style === "U" || style === "CU") {
      el = <g>
        <rect x={cx2 - flightW2/2} y={baseY2 - flightH2} width={t2} height={flightH2} fill="#5a7aaa" stroke={C.navyMid} strokeWidth="1" />
        <rect x={cx2 + flightW2/2 - t2} y={baseY2 - flightH2} width={t2} height={flightH2} fill="#5a7aaa" stroke={C.navyMid} strokeWidth="1" />
        <rect x={cx2 - flightW2/2} y={baseY2 - t2} width={flightW2} height={t2} fill="#5a7aaa" stroke={C.navyMid} strokeWidth="1" />
        {style === "CU" && <rect x={cx2 - flightW2/2} y={baseY2 - flightH2} width={flightW2} height={t2} fill="#3a5a8a" stroke={C.navyMid} strokeWidth="1" />}
      </g>;
    } else if (style === "OO") {
      const kH2 = flightH2 * 0.28;
      el = <g>
        <rect x={cx2 - flightW2/2} y={baseY2 - flightH2} width={t2} height={flightH2} fill="#5a7aaa" stroke={C.navyMid} strokeWidth="1" />
        <rect x={cx2 + flightW2/2 - t2} y={baseY2 - flightH2} width={t2} height={flightH2} fill="#5a7aaa" stroke={C.navyMid} strokeWidth="1" />
        <rect x={cx2 - flightW2/2} y={baseY2 - t2} width={flightW2} height={t2} fill="#5a7aaa" stroke={C.navyMid} strokeWidth="1" />
        <rect x={cx2 - flightW2/2} y={baseY2 - flightH2} width={flightW2} height={t2} fill="#3a5a8a" stroke={C.navyMid} strokeWidth="1" />
        <rect x={cx2 - flightW2/2 - kH2} y={baseY2 - t2} width={kH2} height={t2} fill="#3a5a8a" />
        <rect x={cx2 + flightW2/2} y={baseY2 - t2} width={kH2} height={t2} fill="#3a5a8a" />
      </g>;
    } else {
      el = <rect x={cx2 - flightW2/2} y={baseY2 - Math.max(flightH2,12)} width={flightW2} height={Math.max(flightH2,12)} fill="#5a7aaa" stroke={C.navyMid} strokeWidth="1" />;
    }
    const uhmwEl = hasUHMW ? <rect x={cx2 - flightW2/2} y={baseY2 - bar2 - uhmwT * 0.35} width={flightW2} height={uhmwT * 0.35} fill="rgba(180,210,255,0.7)" stroke="#4a80cc" strokeWidth="0.7" strokeDasharray="3,2" /> : null;
    const bpEl = hasBacking && (Math.floor(i / backingSeq) * backingSeq === i) ? <rect x={cx2 - flightW2/2 + 3} y={chainY + 10} width={flightW2 - 6} height={5} fill="#8a9ab8" stroke={C.navyMid} strokeWidth="0.7" /> : null;
    return <g key={`f${i}`}>{el}{uhmwEl}{bpEl}</g>;
  };

  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: C.navyMid, marginBottom: 6 }}>Chain Assembly — Sequence View</div>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ background: "#f8fafc", borderRadius: 10, border: `1px solid ${C.border}` }}>
        <defs>
          <marker id="sa" markerWidth="5" markerHeight="5" refX="4" refY="2.5" orient="auto"><path d="M0,0.5 L4,2.5 L0,4.5 Z" fill="#666"/></marker>
          <marker id="sb" markerWidth="5" markerHeight="5" refX="1" refY="2.5" orient="auto"><path d="M4,0.5 L0,2.5 L4,4.5 Z" fill="#666"/></marker>
        </defs>
        {links.filter(i => (i + 1) % seq === 0).map(i => drawFlight(i))}
        {/* Pitch arrow */}
        <line x1={startX} y1={chainY + 32} x2={startX + linkW} y2={chainY + 32} stroke="#666" strokeWidth="0.8" markerEnd="url(#sa)" markerStart="url(#sb)" />
        <text x={startX + linkW/2} y={chainY + 43} textAnchor="middle" fontSize="8" fill="#666">P={chain?.P_mm}mm</text>
        {/* Spacing arrow between flights */}
        {(() => {
          const f1 = links.find(i => (i+1) % seq === 0);
          const f2 = links.find(i => (i+1) % seq === 0 && i > f1);
          if (f1 == null || f2 == null) return null;
          const x1 = startX + f1 * linkW + linkW/2, x2 = startX + f2 * linkW + linkW/2;
          return <g>
            <line x1={x1} y1={chainY - 65} x2={x2} y2={chainY - 65} stroke={C.navyMid} strokeWidth="0.8" markerEnd="url(#sa)" markerStart="url(#sb)" />
            <text x={(x1+x2)/2} y={chainY - 70} textAnchor="middle" fontSize="8" fill={C.navyMid}>Every {seq} links</text>
          </g>;
        })()}
      </svg>
    </div>
  );
}

// ── CHAIN CONFIGURATOR (WIZARD) ──────────────────────────────────────────────
const STEEL_TYPES = ["Mild Steel (A36/S235)", "Carbon Steel (1045)", "Stainless Steel 304", "Stainless Steel 316", "Hardox 400", "AR400 Abrasion Resistant"];
const PIN_OPTIONS = [
  { name: "Forged Head Pin + Collar and Roll Pin", desc: "Standard — maximum strength, most common heavy-duty config." },
  { name: "Forged Head Pin + One Clamp",           desc: "Easier to service — ideal for frequent disassembly." },
  { name: "Plain Pin + Two Clamps",                desc: "Removal from either side — preferred in confined spaces." },
];
function emptyAttachment(idx) {
  return { id: idx, flightName: "", flightStyle: "", sequence: "4", dims: { W:"", H:"", G:"", K:"", barSize:"", barShape:"Round", steelType:"" }, hasBackingPlate: false, backingPlateThickness:"", backingPlateSequence:"2", uhmw: false, uhmwDims: { thickness:"", overallW:"", overallH:"", type:"Regular UHMW", bottomStyle:"Flush to bottom", overlap:"", boltDiameter:"", nutStyle:"", boltPlacement:"" } };
}

function FieldRow({ label, note, children }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: C.muted, marginBottom: 4 }}>{label}{note && <span style={{ fontWeight: 400, marginLeft: 6, color: "#94a3b8" }}>— {note}</span>}</div>
      {children}
    </div>
  );
}
function TextInput({ value, onChange, placeholder, unit }) {
  // Local string state so user can type freely without conversion interrupting
  const [local, setLocal] = useState(value ?? "");
  // Re-sync when parent pushes a new value (e.g. unit toggle recalculates)
  useEffect(() => { setLocal(value ?? ""); }, [value]);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <input
        type="text"
        inputMode="decimal"
        value={local}
        placeholder={placeholder || ""}
        onChange={e => setLocal(e.target.value)}
        onBlur={e => { const v = e.target.value; if (v !== value) onChange(v); }}
        style={{ flex: 1, border: `1px solid ${C.border}`, borderRadius: 8, padding: "9px 12px", fontSize: 13, outline: "none", boxSizing: "border-box" }}
      />
      {unit && <span style={{ fontSize: 12, color: C.muted, minWidth: 24 }}>{unit}</span>}
    </div>
  );
}
function SelectInput({ value, onChange, options }) {
  return (
    <select value={value} onChange={e => onChange(e.target.value)}
      style={{ width: "100%", border: `1px solid ${C.border}`, borderRadius: 8, padding: "9px 12px", fontSize: 13, outline: "none", background: "white" }}>
      <option value="">Select...</option>
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  );
}

function ChainConfigurator({ chain, onComplete, onClose }) {
  // Steps: 0=Flights? 1=FlightType 2=Dimensions 3=More? 4=Pins 5=Footage 6=Review
  const [step, setStep] = useState(0);
  const [footage, setFootage] = useState("");
  const [footageUnit, setFootageUnit] = useState("feet");
  const [hasFlights, setHasFlights] = useState(null);
  const [attachments, setAttachments] = useState([emptyAttachment(0)]);
  const [activeAtt, setActiveAtt] = useState(0);
  const [pinStyle, setPinStyle] = useState("");
  const [pinMaterial, setPinMaterial] = useState("");
  const [imperial, setImperial] = useState(false);

  const flights = tryParse(chain.flight_options);
  const att = attachments[activeAtt] || emptyAttachment(0);

  const stepLabels = ["Flights?", "Flight Type", "Dimensions", "More?", "Pins", "Footage", "Review"];
  const unit = imperial ? "in" : "mm";

  function updateAtt(field, val) { setAttachments(prev => prev.map((a,i) => i===activeAtt ? {...a,[field]:val} : a)); }
  function updateDim(field, val) { setAttachments(prev => prev.map((a,i) => i===activeAtt ? {...a,dims:{...a.dims,[field]:val}} : a)); }
  function updateUhmw(field, val) { setAttachments(prev => prev.map((a,i) => i===activeAtt ? {...a,uhmwDims:{...a.uhmwDims,[field]:val}} : a)); }

  const ConfigHeader = () => (
    <div style={{ background: `linear-gradient(135deg, ${C.navy}, ${C.navyMid})`, padding: "14px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <div>
        <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 11, marginBottom: 2 }}>Configuring: {chain.chain_link}</div>
        <div style={{ color: "white", fontSize: 13, fontWeight: 700 }}>Step {step+1} of 7 — {stepLabels[step]||""}</div>
      </div>
      <button onClick={onClose} style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.3)", color: "white", cursor: "pointer", borderRadius: 8, padding: "6px 14px", fontSize: 13, fontWeight: 700 }}>✕ Exit</button>
    </div>
  );

  // Step 0: Flights?
  if (step === 0) return (
    <div>
      <ConfigHeader />
      <div style={{ padding: 24 }}>
        <div style={{ fontSize: 16, fontWeight: 800, color: C.navyMid, marginBottom: 4 }}>Does this chain need flights / attachments?</div>
        <div style={{ color: C.muted, fontSize: 12, marginBottom: 20 }}>Flights are bar, U-type, or OO-type steel attachments welded or bolted to links to push or carry material.</div>
        <div style={{ display: "flex", gap: 12 }}>
          {[["Yes", true], ["No — Chain Links Only", false]].map(([label, val]) => (
            <button key={label} onClick={() => { setHasFlights(val); setStep(val ? 1 : 4); }}
              style={{ flex: 1, background: C.navyMid, color: "white", border: "none", borderRadius: 10, padding: "18px", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  // Step 1: Flight type — AUTO-ADVANCE on selection
  if (step === 1) return (
    <div>
      <ConfigHeader />
      <div style={{ padding: 24 }}>
        <div style={{ fontSize: 16, fontWeight: 800, color: C.navyMid, marginBottom: 4 }}>
          {attachments.length > 1 ? `Attachment ${activeAtt+1} — ` : ""}Flight / Attachment Type
        </div>
        <div style={{ color: C.muted, fontSize: 12, marginBottom: 16 }}>Tap a profile to select — you'll move straight to dimensions.</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {flights.map(f => (
            <button key={f.name}
              onClick={() => { updateAtt("flightName", f.name); updateAtt("flightStyle", f.style); setTimeout(() => setStep(2), 120); }}
              style={{ background: att.flightName === f.name ? C.navyMid : C.card, border: `2px solid ${att.flightName === f.name ? C.navyMid : C.border}`,
                borderRadius: 10, padding: "12px 16px", cursor: "pointer", textAlign: "left", display: "flex", alignItems: "center", gap: 12, transition: "all 0.15s" }}>
              {IMG[f.name] && <img src={IMG[f.name]} alt={f.name} style={{ width: 48, height: 34, objectFit: "cover", borderRadius: 6, border: `1px solid ${C.border}`, flexShrink: 0 }} />}
              <span style={{ fontSize: 13, fontWeight: 600, color: att.flightName === f.name ? "white" : C.text }}>{f.name}</span>
            </button>
          ))}
        </div>
        <button onClick={() => setStep(0)} style={{ background: "#f1f5f9", border: `1px solid ${C.border}`, borderRadius: 8, padding: "8px 16px", cursor: "pointer", fontSize: 12, marginTop: 16 }}>← Back</button>
      </div>
    </div>
  );

  // Step 2: Dimensions — live SVG schematic
  if (step === 2) return (
    <div>
      <ConfigHeader />
      <div style={{ padding: "16px 24px 24px", maxHeight: "75vh", overflowY: "auto" }}>
        <div style={{ fontSize: 15, fontWeight: 800, color: C.navyMid, marginBottom: 12 }}>{att.flightName} — Dimensions</div>

        {/* Live schematic */}
        <FlightSchematic att={att} imperial={imperial} />

        {/* Metric / Imperial toggle */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16, background: "#f0f7ff", borderRadius: 8, padding: "8px 14px" }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: C.muted }}>Units:</span>
          {[["mm", false], ["inches", true]].map(([label, val]) => (
            <button key={label} onClick={() => setImperial(val)}
              style={{ background: imperial === val ? C.navyMid : "white", color: imperial === val ? "white" : C.muted,
                border: `1px solid ${imperial === val ? C.navyMid : C.border}`, borderRadius: 6, padding: "4px 14px", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
              {label}
            </button>
          ))}
        </div>

        {/* Width — all styles */}
        <FieldRow label={`Overall Flight Width (W)`} note="tip to tip across chain">
          <TextInput value={toDisplay(att.dims.W, imperial)} onChange={v => updateDim("W", toMM(v, imperial))} unit={unit} />
        </FieldRow>

        {/* Height — U, CU, OO, Paddle */}
        {(att.flightStyle === "U" || att.flightStyle === "CU" || att.flightStyle === "OO" || att.flightStyle === "P") && (
          <FieldRow label="Flight Height (H)">
            <TextInput value={toDisplay(att.dims.H, imperial)} onChange={v => updateDim("H", toMM(v, imperial))} unit={unit} />
          </FieldRow>
        )}

        {/* Gap — Closed U */}
        {att.flightStyle === "CU" && (
          <FieldRow label="Internal Gap (G)" note="opening width inside closed U">
            <TextInput value={toDisplay(att.dims.G, imperial)} onChange={v => updateDim("G", toMM(v, imperial))} unit={unit} />
          </FieldRow>
        )}

        {/* Lip — OO */}
        {att.flightStyle === "OO" && (
          <FieldRow label="Lip Extension (K)" note="how far OO lip extends beyond side wall">
            <TextInput value={toDisplay(att.dims.K, imperial)} onChange={v => updateDim("K", toMM(v, imperial))} unit={unit} />
          </FieldRow>
        )}

        {/* Bar size — bar flights */}
        {att.flightStyle === "B" && (
          <FieldRow label="Bar Size" note="diameter (round) or side (square/flat)">
            <div style={{ display: "flex", gap: 8 }}>
              <TextInput value={toDisplay(att.dims.barSize, imperial)} onChange={v => updateDim("barSize", toMM(v, imperial))} unit={unit} />
              <SelectInput value={att.dims.barShape} onChange={v => updateDim("barShape", v)} options={["Round", "Square", "Flat"]} />
            </div>
          </FieldRow>
        )}

        <FieldRow label="Steel Type">
          <SelectInput value={att.dims.steelType} onChange={v => updateDim("steelType", v)} options={STEEL_TYPES} />
        </FieldRow>

        <FieldRow label="Attachment Sequence — every N links" note="e.g. 4 = one flight per 4 links">
          <TextInput value={att.sequence} onChange={v => updateAtt("sequence", v)} placeholder="4" unit="links" />
        </FieldRow>

        <FieldRow label="Backing Plate?">
          <div style={{ display: "flex", gap: 10 }}>
            {[["Yes", true], ["No", false]].map(([label, val]) => (
              <button key={label} onClick={() => updateAtt("hasBackingPlate", val)}
                style={{ flex: 1, background: att.hasBackingPlate === val ? C.navyMid : "#f1f5f9", color: att.hasBackingPlate === val ? "white" : C.text,
                  border: `2px solid ${att.hasBackingPlate === val ? C.navyMid : C.border}`, borderRadius: 8, padding: "8px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                {label}
              </button>
            ))}
          </div>
        </FieldRow>
        {att.hasBackingPlate && (
          <>
            <FieldRow label="Backing Plate Thickness">
              <TextInput value={toDisplay(att.backingPlateThickness, imperial)} onChange={v => updateAtt("backingPlateThickness", toMM(v, imperial))} unit={unit} />
            </FieldRow>
            <FieldRow label="Backing Plate Sequence — every N attachments">
              <TextInput value={att.backingPlateSequence} onChange={v => updateAtt("backingPlateSequence", v)} placeholder="2" unit="attachments" />
            </FieldRow>
          </>
        )}

        <FieldRow label="UHMW Wear Liner?">
          <div style={{ display: "flex", gap: 10 }}>
            {[["Yes", true], ["No", false]].map(([label, val]) => (
              <button key={label} onClick={() => updateAtt("uhmw", val)}
                style={{ flex: 1, background: att.uhmw === val ? C.navyMid : "#f1f5f9", color: att.uhmw === val ? "white" : C.text,
                  border: `2px solid ${att.uhmw === val ? C.navyMid : C.border}`, borderRadius: 8, padding: "8px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                {label}
              </button>
            ))}
          </div>
        </FieldRow>
        {att.uhmw && (
          <div style={{ background: "#f0f7ff", borderRadius: 10, padding: "14px 16px", marginTop: 4 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: C.navyMid, marginBottom: 12 }}>UHMW Details</div>
            <FieldRow label="Thickness"><TextInput value={toDisplay(att.uhmwDims.thickness, imperial)} onChange={v => updateUhmw("thickness", toMM(v, imperial))} unit={unit} /></FieldRow>
            <FieldRow label="Overall Width"><TextInput value={toDisplay(att.uhmwDims.overallW, imperial)} onChange={v => updateUhmw("overallW", toMM(v, imperial))} unit={unit} /></FieldRow>
            <FieldRow label="Overall Height"><TextInput value={toDisplay(att.uhmwDims.overallH, imperial)} onChange={v => updateUhmw("overallH", toMM(v, imperial))} unit={unit} /></FieldRow>
            <FieldRow label="UHMW Type"><SelectInput value={att.uhmwDims.type} onChange={v => updateUhmw("type", v)} options={["Regular UHMW", "High Heat UHMW"]} /></FieldRow>
            <FieldRow label="Bottom Style"><SelectInput value={att.uhmwDims.bottomStyle} onChange={v => updateUhmw("bottomStyle", v)} options={["Flush to bottom", "Overlap"]} /></FieldRow>
            {att.uhmwDims.bottomStyle === "Overlap" && (
              <FieldRow label="Overlap Amount"><TextInput value={toDisplay(att.uhmwDims.overlap, imperial)} onChange={v => updateUhmw("overlap", toMM(v, imperial))} unit={unit} /></FieldRow>
            )}
            <FieldRow label="Bolt Diameter"><TextInput value={toDisplay(att.uhmwDims.boltDiameter, imperial)} onChange={v => updateUhmw("boltDiameter", toMM(v, imperial))} unit={unit} /></FieldRow>
            <FieldRow label="Nut Style"><SelectInput value={att.uhmwDims.nutStyle} onChange={v => updateUhmw("nutStyle", v)} options={["Nylock", "Standard Hex", "Wing Nut"]} /></FieldRow>
            <FieldRow label="Bolt Placement"><SelectInput value={att.uhmwDims.boltPlacement} onChange={v => updateUhmw("boltPlacement", v)} options={["Top", "Side", "Bottom"]} /></FieldRow>
          </div>
        )}

        <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
          <button onClick={() => setStep(1)} style={{ background: "#f1f5f9", border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 20px", cursor: "pointer", fontSize: 13 }}>← Back</button>
          <button onClick={() => setStep(3)}
            style={{ flex: 1, background: C.navyMid, color: "white", border: "none", borderRadius: 8, padding: "10px 24px", cursor: "pointer", fontSize: 13, fontWeight: 700 }}>
            Next →
          </button>
        </div>
      </div>
    </div>
  );

  // Step 3: More attachments?
  if (step === 3) return (
    <div>
      <ConfigHeader />
      <div style={{ padding: 24 }}>
        <div style={{ fontSize: 16, fontWeight: 800, color: C.navyMid, marginBottom: 4 }}>Add Another Attachment Pattern?</div>
        <div style={{ color: C.muted, fontSize: 12, marginBottom: 20 }}>Some conveyors use two different flight patterns on the same chain.</div>
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: C.muted, marginBottom: 10 }}>Current attachments:</div>
          {attachments.map((a, i) => (
            <div key={i} style={{ background: "#f8fafc", borderRadius: 8, padding: "8px 12px", marginBottom: 8, border: `1px solid ${C.border}`, fontSize: 13, color: C.text }}>
              <strong>Attachment {i+1}:</strong> {a.flightName || "Not set"} — every {a.sequence||"?"} links
            </div>
          ))}
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={() => {
            const nextIdx = attachments.length;
            setAttachments(prev => [...prev, emptyAttachment(nextIdx)]);
            setActiveAtt(nextIdx);
            setStep(1);
          }} style={{ flex: 1, background: "#f0f7ff", border: `2px solid ${C.navyMid}`, color: C.navyMid, borderRadius: 10, padding: 14, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
            + Add Another
          </button>
          <button onClick={() => setStep(4)}
            style={{ flex: 1, background: C.navyMid, color: "white", border: "none", borderRadius: 10, padding: 14, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
            Done →
          </button>
        </div>
        <button onClick={() => setStep(2)} style={{ background: "#f1f5f9", border: `1px solid ${C.border}`, borderRadius: 8, padding: "8px 16px", cursor: "pointer", fontSize: 12, marginTop: 12 }}>← Back</button>
      </div>
    </div>
  );

  // Step 4: Pin style & material
  if (step === 4) return (
    <div>
      <ConfigHeader />
      <div style={{ padding: 24 }}>
        <div style={{ fontSize: 16, fontWeight: 800, color: C.navyMid, marginBottom: 4 }}>Pin Style & Material</div>
        <div style={{ color: C.muted, fontSize: 12, marginBottom: 16 }}>Select how this chain will be assembled.</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
          {PIN_OPTIONS.map(p => {
            const pos = PIN_IMG_POSITION[p.name] || "center";
            return (
              <button key={p.name} onClick={() => setPinStyle(p.name)}
                style={{ background: pinStyle === p.name ? C.navyMid : C.card, border: `2px solid ${pinStyle === p.name ? C.navyMid : C.border}`,
                  borderRadius: 10, padding: 0, cursor: "pointer", overflow: "hidden", display: "flex", alignItems: "center" }}>
                <div style={{ width: 72, height: 52, overflow: "hidden", flexShrink: 0, position: "relative" }}>
                  <img src={IMG.pin_all} alt={p.name}
                    style={{ width: "100%", height: 156, objectFit: "cover", objectPosition: `center ${pos}`, position: "absolute",
                      top: pos==="top"?0:pos==="bottom"?"auto":"50%", transform: pos==="center"?"translateY(-50%)":"none", bottom: pos==="bottom"?0:"auto" }} />
                </div>
                <span style={{ fontSize: 13, fontWeight: 600, color: pinStyle === p.name ? "white" : C.text, padding: "0 16px" }}>{p.name}</span>
              </button>
            );
          })}
        </div>
        {pinStyle && (
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: C.muted, marginBottom: 8 }}>Pin Material</div>
            <div style={{ display: "flex", gap: 10 }}>
              {["Alloy Steel", "Stainless Steel"].map(m => (
                <button key={m} onClick={() => setPinMaterial(m)}
                  style={{ flex: 1, background: pinMaterial === m ? C.green : "#f1f5f9", color: pinMaterial === m ? "white" : C.text,
                    border: `2px solid ${pinMaterial === m ? C.green : C.border}`, borderRadius: 8, padding: 10, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                  {m}
                </button>
              ))}
            </div>
          </div>
        )}
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={() => setStep(hasFlights ? 3 : 0)} style={{ background: "#f1f5f9", border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 20px", cursor: "pointer", fontSize: 13 }}>← Back</button>
          <button onClick={() => { if (pinStyle && pinMaterial) setStep(5); }} disabled={!pinStyle || !pinMaterial}
            style={{ flex: 1, background: pinStyle && pinMaterial ? C.navyMid : "#e5e7eb", color: pinStyle && pinMaterial ? "white" : C.muted, border: "none", borderRadius: 8, padding: "10px 24px", cursor: pinStyle && pinMaterial ? "pointer" : "default", fontSize: 13, fontWeight: 700 }}>
            Next →
          </button>
        </div>
      </div>
    </div>
  );

  // Step 5: Footage (last question before review)
  if (step === 5) return (
    <div>
      <ConfigHeader />
      <div style={{ padding: 24 }}>
        <div style={{ fontSize: 16, fontWeight: 800, color: C.navyMid, marginBottom: 4 }}>How much chain do you need?</div>
        <div style={{ color: C.muted, fontSize: 12, marginBottom: 20 }}>Enter the total length required.</div>
        <FieldRow label="Unit">
          <div style={{ display: "flex", gap: 10 }}>
            {["feet", "metres", "links"].map(u => (
              <button key={u} onClick={() => setFootageUnit(u)}
                style={{ flex: 1, background: footageUnit === u ? C.navyMid : "#f1f5f9", color: footageUnit === u ? "white" : C.text,
                  border: `2px solid ${footageUnit === u ? C.navyMid : C.border}`, borderRadius: 8, padding: "10px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                {u}
              </button>
            ))}
          </div>
        </FieldRow>
        <FieldRow label={`Quantity (${footageUnit})`}>
          <TextInput value={footage} onChange={setFootage} placeholder={footageUnit === "links" ? "e.g. 50" : "e.g. 100"} />
        </FieldRow>
        <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
          <button onClick={() => setStep(4)} style={{ background: "#f1f5f9", border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 20px", cursor: "pointer", fontSize: 13 }}>← Back</button>
          <button onClick={() => { if (footage) setStep(6); }} disabled={!footage}
            style={{ flex: 1, background: footage ? C.navyMid : "#e5e7eb", color: footage ? "white" : C.muted, border: "none", borderRadius: 8, padding: "12px 28px", cursor: footage ? "pointer" : "default", fontSize: 13, fontWeight: 700 }}>
            Review →
          </button>
        </div>
      </div>
    </div>
  );

  // Step 6: Review
  if (step === 6) {
    const chainDesc = `4B Drop Forged Chain ${chain.chain_link} (${chain.link_type} Link, P=${chain.P_mm}mm, ${chain.min_breaking_load_kn}kN) — ${footage} ${footageUnit}`;
    const flightDescs = hasFlights ? attachments.map((a, i) => {
      let d = `Attachment ${i+1}: ${a.flightName} every ${a.sequence} links`;
      const dp = [];
      if (a.dims.W) dp.push(`W=${a.dims.W}mm`);
      if (a.dims.H) dp.push(`H=${a.dims.H}mm`);
      if (a.dims.barSize) dp.push(`Bar ${a.dims.barSize}mm ${a.dims.barShape||""}`);
      if (a.dims.steelType) dp.push(a.dims.steelType);
      if (dp.length) d += ` [${dp.join(", ")}]`;
      if (a.hasBackingPlate) d += ` | BP T=${a.backingPlateThickness}mm every ${a.backingPlateSequence} att.`;
      if (a.uhmw) d += ` | UHMW T=${a.uhmwDims.thickness}mm ${a.uhmwDims.type}`;
      return d;
    }).join(" | ") : "No flights — chain links only";
    const fullDesc = [chainDesc, flightDescs, `Pin: ${pinStyle} — ${pinMaterial}`].join(" · ");
    return (
      <div>
        <ConfigHeader />
        <div style={{ padding: 24 }}>
          <div style={{ fontSize: 16, fontWeight: 800, color: C.navyMid, marginBottom: 16 }}>Configuration Summary</div>
          {hasFlights && <SequenceSchematic chain={chain} attachments={attachments} />}
          <div style={{ background: "#f8fafc", borderRadius: 10, border: `1px solid ${C.border}`, padding: "16px 18px", marginTop: 12 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, marginBottom: 8, textTransform: "uppercase" }}>RFQ Line Item</div>
            <div style={{ fontSize: 12, color: C.text, lineHeight: 1.7, fontFamily: "monospace", background: "#fff", borderRadius: 6, padding: "10px 14px", border: `1px solid ${C.border}` }}>{fullDesc}</div>
          </div>
          <div style={{ marginTop: 16, display: "flex", gap: 10 }}>
            <button onClick={() => setStep(5)} style={{ background: "#f1f5f9", border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 20px", cursor: "pointer", fontSize: 13 }}>← Back</button>
            <button onClick={() => onComplete({ description: fullDesc, chain, footage, footageUnit, attachments: hasFlights ? attachments : [], pinStyle, pinMaterial })}
              style={{ flex: 1, background: C.green, color: "white", border: "none", borderRadius: 8, padding: "12px 24px", cursor: "pointer", fontSize: 14, fontWeight: 700 }}>
              Add to RFQ Cart
            </button>
          </div>
        </div>
      </div>
    );
  }
  return null;
}

function ChainModal({ chain, variant, onClose, onAddRFQ }) {
  const [tab, setTab] = useState("specs");
  // If Bolt N Go variant selected, open BoltNGo directly; else open configurator
  const [showConfigurator, setShowConfigurator] = useState(variant !== "bng");
  const [showBoltNGo, setShowBoltNGo] = useState(variant === "bng");
  const [rfqAdded, setRfqAdded] = useState(false);
  const [selectedSprocket, setSelectedSprocket] = useState(null);
  const [selectedPin, setSelectedPin] = useState(null);

  const sprockets = tryParse(chain.sprocket_data);
  const trailers = tryParse(chain.trailer_data);

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", zIndex: 9000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ background: "white", borderRadius: 16, width: "100%", maxWidth: 720, maxHeight: "92vh", overflowY: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>

        {showConfigurator ? (
          <ChainConfigurator chain={chain}
            onComplete={(item) => { onAddRFQ(item); setShowConfigurator(false); }}
            onClose={() => setShowConfigurator(false)} />
        ) : showBoltNGo ? (
          <BoltNGoModal chain={chain} onClose={() => setShowBoltNGo(false)} onAddRFQ={(item) => { onAddRFQ(item); setShowBoltNGo(false); }} />
        ) : (
          <>
            {/* Header */}
            <div style={{ background: `linear-gradient(135deg, ${C.navy}, ${C.navyMid})`, padding: "20px 24px", borderRadius: "16px 16px 0 0", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div style={{ color: C.gold, fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", marginBottom: 4 }}>4B Drop Forged Chain</div>
                <div style={{ color: "white", fontSize: 22, fontWeight: 900 }}>{chain.chain_link}</div>
                <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 12, marginTop: 2 }}>{chain.link_type} Link · P = {chain.P_mm} mm</div>
              </div>
              <button onClick={onClose} style={{ background: "rgba(255,255,255,0.1)", border: "none", color: "white", cursor: "pointer", borderRadius: 8, padding: "6px 12px", fontSize: 13 }}>✕ Close</button>
            </div>

            {/* Image + badges + actions */}
            <div style={{ display: "flex", gap: 20, padding: "20px 24px 0", alignItems: "flex-start" }}>
              <img src={getLinkImg(chain.link_type)} alt={chain.link_type}
                style={{ width: 130, height: 130, objectFit: "cover", borderRadius: 10, border: `1px solid ${C.border}`, flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                {chain.notes && <div style={{ fontSize: 13, color: C.muted, marginBottom: 12 }}>{chain.notes}</div>}
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
                  {chain.stainless_available && <span style={{ background: "#f1f5f9", color: C.muted, fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 99 }}>Stainless Available</span>}
                </div>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <button onClick={() => setShowConfigurator(true)}
                    style={{ background: C.navyMid, color: "white", border: "none", borderRadius: 9, padding: "10px 22px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
                    Configure + Build Quote
                  </button>
                  <button onClick={() => { onAddRFQ({ description: `4B Drop Forged Chain ${chain.chain_link} (${chain.link_type} Link, P=${chain.P_mm}mm, ${chain.min_breaking_load_kn}kN, W=${chain.W_mm}mm) — Links Only` }); setRfqAdded(true); }}
                    style={{ background: rfqAdded ? C.green : "#f1f5f9", color: rfqAdded ? "white" : C.text, border: `1px solid ${rfqAdded ? C.green : C.border}`, borderRadius: 9, padding: "10px 22px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
                    {rfqAdded ? "✓ Added" : "Add to RFQ (Links Only)"}
                  </button>
                  {chain.bolt_n_go_compatible && (
                    <button onClick={() => setShowBoltNGo(true)}
                      style={{ background: C.greenBg, color: C.green, border: `2px solid ${C.green}`, borderRadius: 9, padding: "10px 22px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
                      ⚡ Order Bolt N Go
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div style={{ display: "flex", gap: 4, padding: "16px 24px 0", borderBottom: `1px solid ${C.border}`, overflowX: "auto" }}>
              {[["specs","Specifications"], ["sprockets",`Sprockets (${sprockets.length})`], ["pins","Pins (3)"], ["segments","Segments"]].map(([k, l]) => (
                <button key={k} onClick={() => setTab(k)}
                  style={{ padding: "8px 16px", border: "none", cursor: "pointer", fontWeight: 600, fontSize: 12, borderRadius: "8px 8px 0 0", whiteSpace: "nowrap",
                    background: tab === k ? C.navyMid : "transparent", color: tab === k ? "white" : C.muted }}>
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

              {/* SPROCKETS — clickable cards, bore size on RFQ */}
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
                          <div style={{ fontSize: 12, color: C.muted, marginTop: 4 }}>Click any row to order a specific sprocket. Bore size collected at checkout.</div>
                        </div>
                      </div>
                      <div style={{ overflowX: "auto" }}>
                        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                          <thead><tr style={{ background: C.navyMid, color: "white" }}>
                            {["Teeth","PCD mm","ØA mm","ØB mm","ØC max","Bolts","T mm","WB1 mm",""].map(h => (
                              <th key={h} style={{ padding: "8px 10px", textAlign: "center", fontWeight: 600 }}>{h}</th>
                            ))}
                          </tr></thead>
                          <tbody>
                            {sprockets.map((s, i) => (
                              <tr key={i} style={{ background: i % 2 ? "#f5f7fb" : "white", cursor: "pointer" }}
                                onClick={() => setSelectedSprocket(s)}
                                onMouseEnter={e => e.currentTarget.style.background = "#e8f0fe"}
                                onMouseLeave={e => e.currentTarget.style.background = i % 2 ? "#f5f7fb" : "white"}>
                                {[s.teeth, s.pcd_mm, s.A_mm, s.B_mm, s.C_max_mm, s.bolts, s.T_mm, s.WB1_mm].map((v, j) => (
                                  <td key={j} style={{ padding: "8px 10px", textAlign: "center", borderBottom: `1px solid ${C.border}` }}>{v}</td>
                                ))}
                                <td style={{ padding: "6px 8px", textAlign: "center", borderBottom: `1px solid ${C.border}` }}>
                                  <span style={{ background: C.navyMid, color: "white", borderRadius: 6, padding: "3px 10px", fontSize: 11, fontWeight: 700 }}>Select →</span>
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
                                {["PCD mm","C max (smooth)","WB2 smooth","WB3 segmental","T1 rim",""].map(h => (
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
                                      <button onClick={() => onAddRFQ({ description: `4B Trailer/Return Wheel ${chain.sprocket_family} — PCD=${t.pcd_mm}mm, WB2=${t.WB2_smooth_mm}mm, WB3=${t.WB3_segmental_mm}mm, T1=${t.T1_rim_width_mm}mm` })}
                                        style={{ background: C.navyLight, color: "white", border: "none", borderRadius: 6, padding: "4px 10px", cursor: "pointer", fontSize: 11, fontWeight: 700 }}>+ RFQ</button>
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

              {/* PINS — each as its own card with image */}
              {tab === "pins" && (
                <div>
                  <div style={{ fontSize: 13, color: C.muted, marginBottom: 16 }}>Each pin style is an individual orderable product. Click a pin to view details and add to RFQ.</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                    {PIN_OPTIONS.map((p, idx) => {
                      const pos = PIN_IMG_POSITION[p.name] || "center";
                      const descs = {
                        "Forged Head Pin + Collar and Roll Pin": "Standard assembly — forged head retained by collar and roll pin. Maximum strength.",
                        "Forged Head Pin + One Clamp": "Forged head with single clamp. Easy to service, ideal for frequent disassembly.",
                        "Plain Pin + Two Clamps": "Plain pin with two clamps — removable from either side. Best for confined spaces.",
                      };
                      return (
                        <div key={p.name} onClick={() => setSelectedPin(p.name)}
                          style={{ display: "flex", gap: 0, borderRadius: 12, border: `2px solid ${C.border}`, overflow: "hidden", cursor: "pointer", transition: "all 0.15s" }}
                          onMouseEnter={e => { e.currentTarget.style.borderColor = C.navyMid; e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.1)"; }}
                          onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.boxShadow = ""; }}>
                          {/* Cropped image */}
                          <div style={{ width: 100, height: 80, overflow: "hidden", flexShrink: 0, position: "relative", background: "#f0f4f8" }}>
                            <img src={IMG.pin_all} alt={p.name}
                              style={{ width: "100%", height: 240, objectFit: "cover", objectPosition: `center ${pos}`,
                                position: "absolute", top: pos === "top" ? 0 : pos === "bottom" ? "auto" : "50%",
                                transform: pos === "center" ? "translateY(-50%)" : "none", bottom: pos === "bottom" ? 0 : "auto" }} />
                          </div>
                          <div style={{ padding: "12px 16px", flex: 1 }}>
                            <div style={{ fontWeight: 700, color: C.navyMid, fontSize: 13, marginBottom: 4 }}>{p.name}</div>
                            <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.5 }}>{descs[p.name]}</div>
                          </div>
                          <div style={{ display: "flex", alignItems: "center", padding: "0 16px" }}>
                            <span style={{ background: C.navyMid, color: "white", borderRadius: 6, padding: "4px 12px", fontSize: 11, fontWeight: 700 }}>Order →</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* SEGMENTS */}
              {tab === "segments" && (
                <div style={{ textAlign: "center", padding: 32, color: C.muted }}>
                  <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 8 }}>Segment / Trailer Data</div>
                  <div style={{ fontSize: 13 }}>Contact Uniking Canada for segment specifications for this chain series.</div>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Sprocket product modal */}
      {selectedSprocket && (
        <SprocketModal sprocket={selectedSprocket} chainLink={chain.chain_link} sprocketFamily={chain.sprocket_family}
          onClose={() => setSelectedSprocket(null)} onAddRFQ={(item) => { onAddRFQ(item); setSelectedSprocket(null); }} />
      )}

      {/* Pin product modal */}
      {selectedPin && (
        <PinModal pinName={selectedPin} chainLink={chain.chain_link}
          onClose={() => setSelectedPin(null)} onAddRFQ={(item) => { onAddRFQ(item); setSelectedPin(null); }} />
      )}
    </div>
  );
}

// ── MAIN PAGE v2 ─────────────────────────────────────────────────────────────────
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

  const groupByPitch = (arr) => arr.reduce((acc, c) => {
    const key = `${c.P_mm}mm`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(c);
    return acc;
  }, {});

  const allGroups = groupByPitch(chains);

  // ChainCard — bolt_n_go_compatible chains show a Standard / Bolt N Go toggle before opening modal
  const ChainCard = ({ chain }) => {
    const [variant, setVariant] = useState("standard"); // "standard" | "bng"
    const isBNG = chain.bolt_n_go_compatible;

    const handleOpen = () => {
      setSelected({ chain, variant });
    };

    return (
      <div style={{ background: "white", borderRadius: 12, border: `1px solid ${C.border}`, overflow: "hidden", transition: "all 0.15s" }}
        onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 6px 20px rgba(0,0,0,0.10)"; }}
        onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; }}>
        <div style={{ height: 3, background: isBNG && variant === "bng" ? `linear-gradient(90deg, ${C.green}, #15803d)` : `linear-gradient(90deg, ${C.navyMid}, ${C.navyLight})` }} />
        <div style={{ padding: 14 }}>
          <div style={{ display: "flex", gap: 12, alignItems: "flex-start", marginBottom: 10 }}>
            <img src={getLinkImg(chain.link_type)} alt={chain.link_type}
              style={{ width: 64, height: 64, objectFit: "cover", borderRadius: 8, border: `1px solid ${C.border}`, flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: 16, fontWeight: 800, color: C.navy }}>{chain.chain_link}</div>
              <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{chain.link_type} Link</div>
              <div style={{ fontSize: 11, color: C.muted }}>P = {chain.P_mm} mm | H = {chain.H_mm} mm</div>
            </div>
          </div>

          {/* Variant toggle — only shown for Bolt N Go compatible chains */}
          {isBNG && (
            <div style={{ display: "flex", gap: 0, marginBottom: 10, borderRadius: 8, overflow: "hidden", border: `1px solid ${C.border}` }}>
              <button onClick={e => { e.stopPropagation(); setVariant("standard"); }}
                style={{ flex: 1, padding: "6px 0", fontSize: 11, fontWeight: 700, cursor: "pointer", border: "none",
                  background: variant === "standard" ? C.navyMid : "#f8fafc",
                  color: variant === "standard" ? "white" : C.muted,
                  borderRight: `1px solid ${C.border}` }}>
                Standard
              </button>
              <button onClick={e => { e.stopPropagation(); setVariant("bng"); }}
                style={{ flex: 1, padding: "6px 0", fontSize: 11, fontWeight: 700, cursor: "pointer", border: "none",
                  background: variant === "bng" ? C.green : "#f8fafc",
                  color: variant === "bng" ? "white" : C.muted }}>
                ⚡ Bolt N Go
              </button>
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: C.muted }}>Breaking Load</span>
              <span style={{ fontWeight: 700, color: C.text }}>{chain.min_breaking_load_kn} kN</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: C.muted }}>Weight / Link</span>
              <span style={{ fontWeight: 600 }}>{chain.weight_per_link_kg} kg</span>
            </div>
          </div>
          {chain.stainless_available && (
            <div style={{ marginTop: 8 }}>
              <span style={{ fontSize: 9, background: "#f1f5f9", color: C.muted, padding: "1px 6px", borderRadius: 8 }}>Stainless Avail.</span>
            </div>
          )}
        </div>
        <div onClick={handleOpen} style={{ padding: "8px 14px", borderTop: `1px solid ${C.border}`, background: variant === "bng" ? C.greenBg : "#f8fafc",
          display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }}>
          <span style={{ fontSize: 11, color: variant === "bng" ? C.green : C.muted, fontWeight: variant === "bng" ? 700 : 400 }}>
            {variant === "bng" ? "⚡ Bolt N Go selected" : "Click to configure"}
          </span>
          <span style={{ fontSize: 11, color: variant === "bng" ? C.green : C.navyMid, fontWeight: 700 }}>Details →</span>
        </div>
      </div>
    );
  };

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "Inter, Arial, sans-serif" }}>
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
      <div style={{ background: "white", borderBottom: `1px solid ${C.border}`, padding: "10px 32px", display: "flex", gap: 24, flexWrap: "wrap" }}>
        {["Case Hardened C57–C62", "Ductile Core C40", "Pitches 102–260 mm", "Double & Triple Strand", "Custom Flights Available", "Stainless Available"].map(f => (
          <span key={f} style={{ fontSize: 11, color: C.muted, fontWeight: 600 }}>✓ {f}</span>
        ))}
      </div>

      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "28px 20px" }}>
        <div style={{ fontSize: 13, color: C.muted, marginBottom: 20 }}>
          Configure with flights, pins, and attachments. Chains marked <span style={{ color: C.green, fontWeight: 700 }}>⚡ Bolt N Go</span> are also available pre-assembled — toggle on the card before opening.
        </div>
        {Object.entries(allGroups).map(([pitch, items]) => (
          <div key={pitch} style={{ marginBottom: 36 }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: C.navyMid, textTransform: "uppercase", letterSpacing: 1, marginBottom: 12, paddingBottom: 6, borderBottom: `2px solid ${C.border}`, display: "flex", alignItems: "center", gap: 10 }}>
              {pitch} Pitch
              {items.some(c => c.bolt_n_go_compatible) && (
                <span style={{ background: C.greenBg, color: C.green, fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 99 }}>⚡ Bolt N Go available</span>
              )}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 16 }}>
              {items.map(chain => <ChainCard key={chain.id} chain={chain} />)}
            </div>
          </div>
        ))}
      </div>

      {selected && <ChainModal chain={selected.chain} variant={selected.variant} onClose={() => setSelected(null)} onAddRFQ={handleAddRFQ} />}
    </div>
  );
}
