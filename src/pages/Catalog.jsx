// v6 — Bucket UX: style card → style modal (material switcher) → size grid → size spec + SVG → RFQ
import { useState, useEffect, useMemo } from "react";
import { UniCatalog, CatalogProduct, ElevatorBucket, MacChainProduct } from "@/api/entities";

const NAVY = "#1a3a5c";
const AMBER = "#b45309";
const BASE = "https://maxilift.com/hs-fs/hubfs/";

// ── Material color system ────────────────────────────────────────────────────
const MAT_DEF = {
  "Poly":        { color:"#c2410c", bg:"#fff7ed", border:"#fed7aa", dot:"#f97316", label:"Poly (HDPE)",  temp:"-60°F to +180°F", fda:true,  use:"Grain & food products" },
  "Polyethylene":{ color:"#c2410c", bg:"#fff7ed", border:"#fed7aa", dot:"#f97316", label:"Poly (HDPE)",  temp:"-60°F to +180°F", fda:true,  use:"Grain & food products" },
  "HDPE":        { color:"#c2410c", bg:"#fff7ed", border:"#fed7aa", dot:"#f97316", label:"Poly (HDPE)",  temp:"-60°F to +180°F", fda:true,  use:"Grain & food products" },
  "Nylon":       { color:"#92400e", bg:"#fef9c3", border:"#fde68a", dot:"#d97706", label:"Nylon",        temp:"-60°F to +300°F", fda:false, use:"Hot, impact & abrasive" },
  "Urethane":    { color:"#065f46", bg:"#d1fae5", border:"#6ee7b7", dot:"#10b981", label:"Urethane",     temp:"-60°F to +180°F", fda:true,  use:"Heavy abrasion, sticky" },
  "FDA Nylon":   { color:"#4338ca", bg:"#e0e7ff", border:"#a5b4fc", dot:"#6366f1", label:"FDA Nylon",    temp:"-60°F to +300°F", fda:true,  use:"Hot food-grade" },
  "Ductile Iron":{ color:"#374151", bg:"#f3f4f6", border:"#d1d5db", dot:"#6b7280", label:"Ductile Iron", temp:"Up to 600°F",     fda:false, use:"Sand, glass, shot blast" },
  "Mild Steel":  { color:"#374151", bg:"#f1f5f9", border:"#cbd5e1", dot:"#64748b", label:"Mild Steel",   temp:"High temp",       fda:false, use:"Packed bulk materials" },
  "Welded Steel":{ color:"#1e3a5f", bg:"#e0e7ff", border:"#93c5fd", dot:"#3b82f6", label:"Welded Steel", temp:"High temp",       fda:false, use:"Industrial bulk, ore" },
  "Carbon Steel":{ color:"#374151", bg:"#f1f5f9", border:"#cbd5e1", dot:"#64748b", label:"Carbon Steel", temp:"High temp",       fda:false, use:"Heavy industrial" },
};

function getMat(str) {
  if (!str) return { key: str||"", color:NAVY, bg:"#f3f4f6", border:"#e5e7eb", dot:"#9ca3af", label:str||"", temp:"—", fda:false, use:"—" };
  const s = str.trim();
  for (const [k, v] of Object.entries(MAT_DEF)) {
    if (s.toLowerCase().includes(k.toLowerCase())) return { key: s, ...v };
  }
  return { key: s, color:NAVY, bg:"#f3f4f6", border:"#e5e7eb", dot:"#9ca3af", label:s, temp:"—", fda:false, use:"—" };
}

// Parse material string → array of individual material names
function parseMaterials(str) {
  if (!str) return [];
  // Split on " / ", "/", ", " or ","
  return str.split(/\s*\/\s*|\s*,\s*/).map(s => s.trim()).filter(Boolean).map(s => {
    // Normalize "Polyethylene (HDPE)" → "Poly"
    if (s.toLowerCase().includes("polyethylene") || s.toLowerCase() === "hdpe") return "Poly";
    if (s.toLowerCase().includes("fda nylon")) return "FDA Nylon";
    if (s.toLowerCase().includes("nylon")) return "Nylon";
    if (s.toLowerCase().includes("urethane")) return "Urethane";
    if (s.toLowerCase().includes("ductile iron")) return "Ductile Iron";
    if (s.toLowerCase().includes("welded steel")) return "Welded Steel";
    if (s.toLowerCase().includes("carbon steel")) return "Carbon Steel";
    if (s.toLowerCase().includes("mild steel")) return "Mild Steel";
    if (s.toLowerCase().includes("poly")) return "Poly";
    return s;
  }).filter((v, i, a) => a.indexOf(v) === i); // dedupe
}

// ── Material images from Maxi-Lift CDN ───────────────────────────────────────
// Agricultural: Poly = series main image; Nylon/Urethane/FDA Nylon = CDN variants
// Industrial: all 4 materials have CDN images
const MAT_IMG_AG = {
  "Nylon":     BASE + "image%2025%20(6).png?width=500",
  "Urethane":  BASE + "image%2025%20(7).png?width=500",
  "FDA Nylon": BASE + "image%2025%20(8).png?width=500",
};
const MAT_IMG_IND = {
  "Poly":      BASE + "image%2025%20(10).png?width=500",
  "Nylon":     BASE + "image%2025%20(9)-1.png?width=500",
  "Urethane":  BASE + "image%2025%20(11).png?width=500",
  "FDA Nylon": BASE + "image%2025%20(12).png?width=500",
};

function getMatImage(rec, material) {
  const isInd = (rec.application || "").toLowerCase().includes("ind");
  const map = isInd ? MAT_IMG_IND : MAT_IMG_AG;
  if (map[material]) return map[material];
  return rec.image_url || null; // fallback to series main image
}

// ── Generic bucket SVG outline diagram ───────────────────────────────────────
function BucketDiagram({ size }) {
  function parseFrac(s) {
    if (!s) return 0;
    s = String(s).trim();
    const m = s.match(/^(\d+)-(\d+)\/(\d+)$/);
    if (m) return parseInt(m[1]) + parseInt(m[2]) / parseInt(m[3]);
    const m2 = s.match(/^(\d+)\/(\d+)$/);
    if (m2) return parseInt(m2[1]) / parseInt(m2[2]);
    return parseFloat(s) || 0;
  }
  const proj  = parseFrac(size.projection_in) || 6;
  const depth = parseFrac(size.depth_in) || 5;
  const sizeStr = size.size || "8x5";
  const lenNum  = parseFrac(size.length_in) || parseFloat(sizeStr.split("x")[0]) || 8;
  const wall    = parseFrac(size.wall_thickness) || 0.4;

  const scale = Math.min(220 / (lenNum * 1.3), 150 / (proj * 1.4));
  const W = lenNum * scale;
  const H = proj * scale;
  const D = depth * scale;
  const cx = 30, cy = 20;

  const bPts = [
    [cx, cy],
    [cx + W, cy],
    [cx + W, cy + H],
    [cx + W * 0.85, cy + H + D * 0.25],
    [cx, cy + H],
  ].map(p => p.join(",")).join(" ");

  const svgW = W + 90;
  const svgH = H + D + 60;

  return (
    <svg viewBox={`0 0 ${svgW} ${svgH}`} style={{ width: "100%", maxWidth: 300 }}>
      <polygon points={bPts} fill="#eef3fa" stroke={NAVY} strokeWidth={2} strokeLinejoin="round" />
      {/* Length arrow */}
      <line x1={cx} y1={cy - 14} x2={cx + W} y2={cy - 14} stroke="#1d4ed8" strokeWidth={1.5} markerEnd="url(#arr)" />
      <text x={(cx + cx + W) / 2} y={cy - 4} textAnchor="middle" fontSize={9} fill="#1d4ed8" fontWeight="700">
        {lenNum.toFixed(2)}&quot; (L)
      </text>
      {/* Projection arrow */}
      <line x1={cx + W + 14} y1={cy} x2={cx + W + 14} y2={cy + H} stroke="#065f46" strokeWidth={1.5} />
      <text x={cx + W + 18} y={(cy + cy + H) / 2} fontSize={9} fill="#065f46" fontWeight="700" dominantBaseline="middle">
        {proj.toFixed(2)}&quot; (P)
      </text>
      {/* Depth arrow */}
      <line x1={cx + W * 0.2} y1={cy + H + 18} x2={cx + W * 0.2 + D * 0.6} y2={cy + H + 18} stroke="#7c3aed" strokeWidth={1.5} />
      <text x={cx + W * 0.2 + D * 0.3} y={cy + H + 30} textAnchor="middle" fontSize={9} fill="#7c3aed" fontWeight="700">
        {depth.toFixed(2)}&quot; (D)
      </text>
      {/* Size label */}
      <text x={cx + W / 2} y={cy + H / 2 + 5} textAnchor="middle" fontSize={12} fill={NAVY} fontWeight="900">
        {sizeStr}&quot;
      </text>
      <defs>
        <marker id="arr" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="#1d4ed8" />
        </marker>
      </defs>
    </svg>
  );
}

// ── Spec row ─────────────────────────────────────────────────────────────────
function SpecRow({ label, value, hi }) {
  if (value == null || value === "" || value === "—") return null;
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center",
      padding: "8px 12px", background: hi ? "#fffbeb" : "#f8fafc",
      borderRadius: 8, border: hi ? `1px solid ${AMBER}33` : "1px solid #f1f5f9" }}>
      <span style={{ fontSize: 11, color: "#6b7280", fontWeight: 600 }}>{label}</span>
      <span style={{ fontSize: 12, color: hi ? AMBER : NAVY, fontWeight: 800 }}>{value}</span>
    </div>
  );
}

// ── Size Detail Modal ─────────────────────────────────────────────────────────
function SizeDetailModal({ rec, size, material, onClose, onBack }) {
  const [qty, setQty] = useState(1);
  const [notes, setNotes] = useState("");
  const [added, setAdded] = useState(false);
  const md = getMat(material);

  function addToRFQ() {
    const cart = JSON.parse(localStorage.getItem("uniking_rfq_cart") || "[]");
    cart.push({
      id: `bucket-${rec.id}-${size.size}-${Date.now()}`,
      type: "Elevator Bucket",
      series: rec.series,
      style: rec.style,
      application: rec.application,
      material,
      size: size.size,
      discharge: rec.discharge_type,
      qty,
      notes,
      unitSpec: `${size.size}" proj:${size.projection_in}" depth:${size.depth_in}"`,
    });
    localStorage.setItem("uniking_rfq_cart", JSON.stringify(cart));
    setAdded(true);
    setTimeout(() => setAdded(false), 2500);
  }

  const hasCap = size.capacity_cu_in || size.capacity_cu_ft;

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.75)", zIndex: 2000,
      display: "flex", alignItems: "center", justifyContent: "center", padding: 12 }}
      onClick={onClose}>
      <div style={{ background: "#fff", borderRadius: 16, width: "100%", maxWidth: 680,
        maxHeight: "96vh", overflowY: "auto", display: "flex", flexDirection: "column" }}
        onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div style={{ background: `linear-gradient(135deg,${NAVY},#2d5986)`,
          borderRadius: "16px 16px 0 0", padding: "16px 20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
            <button onClick={onBack}
              style={{ background: "rgba(255,255,255,.15)", border: "none", borderRadius: 8,
                padding: "5px 12px", color: "#fff", cursor: "pointer", fontSize: 12, fontWeight: 700 }}>
              ← Back to Sizes
            </button>
            <button onClick={onClose}
              style={{ marginLeft: "auto", background: "rgba(255,255,255,.15)", border: "none",
                borderRadius: "50%", width: 28, height: 28, cursor: "pointer", color: "#fff", fontSize: 14 }}>✕</button>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <div style={{ fontSize: 26, fontWeight: 900, color: "#fff" }}>{size.size}&quot;</div>
            <div style={{ padding: "4px 12px", borderRadius: 99, background: md.bg, color: md.color, fontSize: 12, fontWeight: 800 }}>
              {material}
            </div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,.5)" }}>{rec.series}</div>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0, flex: 1 }}>
          {/* Left: SVG diagram */}
          <div style={{ padding: "20px 16px", borderRight: "1px solid #f1f5f9",
            display: "flex", flexDirection: "column", gap: 14, alignItems: "center" }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#9ca3af",
              textTransform: "uppercase", letterSpacing: 1, alignSelf: "flex-start" }}>Dimension Diagram</div>
            <BucketDiagram size={size} />
            <div style={{ width: "100%", padding: "12px", background: md.bg,
              borderRadius: 10, border: `1px solid ${md.border}`, textAlign: "center" }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: md.color,
                textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>Selected Material</div>
              <div style={{ fontSize: 15, fontWeight: 900, color: md.color }}>{material}</div>
              <div style={{ fontSize: 10, color: md.color, opacity: .75, marginTop: 2 }}>{md.temp}</div>
              {md.fda && (
                <div style={{ marginTop: 5, fontSize: 9, fontWeight: 700, color: "#065f46",
                  background: "#d1fae5", borderRadius: 99, padding: "2px 8px", display: "inline-block" }}>
                  FDA Approved ✓
                </div>
              )}
            </div>
          </div>

          {/* Right: Specs */}
          <div style={{ padding: "20px 16px", display: "flex", flexDirection: "column", gap: 7 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#9ca3af",
              textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>Specifications</div>
            <SpecRow label="Size" value={size.size + '"'} hi />
            <SpecRow label="Length" value={size.length_in ? size.length_in + '"' : null} />
            <SpecRow label="Projection" value={size.projection_in ? size.projection_in + '"' : null} />
            <SpecRow label="Depth" value={size.depth_in ? size.depth_in + '"' : null} />
            <SpecRow label="Wall Thickness" value={size.wall_thickness ? size.wall_thickness + '"' : null} />
            <SpecRow label="Weight" value={size.weight_hdpe_lbs ? size.weight_hdpe_lbs + ' lbs (HDPE)' : size.weight_lbs ? size.weight_lbs + ' lbs' : null} />
            <SpecRow label="Capacity" value={size.capacity_cu_in ? size.capacity_cu_in + ' cu.in' : size.capacity_cu_ft ? size.capacity_cu_ft + ' cu.ft' : null} />
            <SpecRow label="Std. Spacing" value={size.std_spacing_in ? size.std_spacing_in + '"' : null} />
            <SpecRow label="Bolt Size" value={size.bolt_size || null} />
            <SpecRow label="# Holes" value={size.holes || null} />
          </div>
        </div>

        {/* RFQ Footer */}
        <div style={{ padding: "16px 20px", borderTop: "1px solid #f1f5f9" }}>
          <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 12, flexWrap: "wrap" }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: NAVY }}>Qty:</div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <button onClick={() => setQty(Math.max(1, qty - 1))}
                style={{ width: 30, height: 30, borderRadius: 6, border: "1px solid #d1d5db",
                  background: "#f9fafb", cursor: "pointer", fontSize: 16 }}>−</button>
              <input type="number" min={1} value={qty}
                onChange={e => setQty(Math.max(1, parseInt(e.target.value) || 1))}
                style={{ width: 52, textAlign: "center", padding: "5px", borderRadius: 6,
                  border: "1px solid #d1d5db", fontSize: 13, fontWeight: 700 }} />
              <button onClick={() => setQty(qty + 1)}
                style={{ width: 30, height: 30, borderRadius: 6, border: "1px solid #d1d5db",
                  background: "#f9fafb", cursor: "pointer", fontSize: 16 }}>+</button>
            </div>
            <input value={notes} onChange={e => setNotes(e.target.value)}
              placeholder="Notes (venting, profile, application...)"
              style={{ flex: 1, minWidth: 160, padding: "7px 12px", borderRadius: 8,
                border: "1px solid #d1d5db", fontSize: 12, outline: "none" }} />
          </div>
          <button onClick={addToRFQ}
            style={{ width: "100%", padding: "13px", borderRadius: 10, border: "none",
              background: added ? "#065f46" : NAVY, color: "#fff",
              fontSize: 14, fontWeight: 800, cursor: "pointer", transition: "background .2s" }}>
            {added ? `✓ Added — ${rec.series} · ${material} · ${size.size}"` : `Add to RFQ — ${rec.series} · ${material} · ${size.size}"`}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Style Modal ───────────────────────────────────────────────────────────────
function BucketStyleModal({ rec, onClose }) {
  const materials = parseMaterials(rec.material);
  const [activeMat, setActiveMat] = useState(materials[0] || "");
  const [showLP, setShowLP] = useState(false);
  const [selectedSize, setSelectedSize] = useState(null);

  let sizes = [];
  try { sizes = rec.bucket_sizes_detail ? JSON.parse(rec.bucket_sizes_detail) : []; } catch {}

  const md      = getMat(activeMat);
  const matImg  = getMatImage(rec, activeMat);

  function parseFrac(s) {
    if (!s) return 0;
    s = String(s).trim();
    const m = s.match(/^(\d+)-(\d+)\/(\d+)$/);
    if (m) return parseInt(m[1]) + parseInt(m[2]) / parseInt(m[3]);
    return parseFloat(s) || 0;
  }

  function isLP(s) {
    const d = parseFrac(s.depth_in), p = parseFrac(s.projection_in);
    return d > 0 && p > 0 && (d / p < 0.7);
  }
  const stdSizes = sizes.filter(s => !isLP(s));
  const lpSizes  = sizes.filter(s => isLP(s));
  const showSizes = showLP ? lpSizes : stdSizes;

  if (selectedSize) {
    return (
      <SizeDetailModal
        rec={rec}
        size={selectedSize}
        material={activeMat}
        onClose={onClose}
        onBack={() => setSelectedSize(null)}
      />
    );
  }

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.65)", zIndex: 1000,
      display: "flex", alignItems: "center", justifyContent: "center", padding: 12 }}
      onClick={onClose}>
      <div style={{ background: "#fff", borderRadius: 16, width: "100%", maxWidth: 860,
        maxHeight: "96vh", overflowY: "auto" }}
        onClick={e => e.stopPropagation()}>

        {/* Hero */}
        <div style={{ display: "flex", borderRadius: "16px 16px 0 0", overflow: "hidden", minHeight: 240 }}>

          {/* Image pane — swaps on material click */}
          <div style={{ width: 220, flexShrink: 0,
            background: `linear-gradient(160deg,${NAVY},#1e4976)`,
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: 16, position: "relative" }}>
            {matImg ? (
              <img key={matImg} src={matImg} alt={`${rec.series} ${activeMat}`}
                style={{ maxWidth: 190, maxHeight: 190, objectFit: "contain",
                  transition: "opacity .2s", background: "transparent" }}
                onError={e => { e.target.style.display = "none"; }} />
            ) : (
              <div style={{ color: "rgba(255,255,255,.15)", fontSize: 56 }}>🪣</div>
            )}
            <div style={{ position: "absolute", bottom: 10, left: 0, right: 0, textAlign: "center" }}>
              <span style={{ padding: "3px 12px", borderRadius: 99, fontSize: 11, fontWeight: 800,
                background: md.bg, color: md.color }}>{activeMat || rec.material}</span>
            </div>
          </div>

          {/* Info pane */}
          <div style={{ flex: 1, background: `linear-gradient(135deg,#1e4070,#2d5986)`,
            padding: "18px 22px", position: "relative" }}>
            <button onClick={onClose}
              style={{ position: "absolute", top: 12, right: 14, background: "rgba(255,255,255,.15)",
                border: "none", borderRadius: "50%", width: 32, height: 32,
                cursor: "pointer", color: "#fff", fontSize: 16 }}>✕</button>

            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
              <span style={{ padding: "3px 10px", borderRadius: 99, fontSize: 11, fontWeight: 700,
                background: "#fef3c7", color: AMBER }}>Elevator Bucket</span>
              {rec.application && (
                <span style={{ padding: "3px 10px", borderRadius: 99, fontSize: 11, fontWeight: 700,
                  background: rec.application.toLowerCase().includes("ag") ? "#d1fae5" : "#dbeafe",
                  color: rec.application.toLowerCase().includes("ag") ? "#065f46" : "#1d4ed8" }}>
                  {rec.application}
                </span>
              )}
              {rec.discharge_type && (
                <span style={{ padding: "3px 10px", borderRadius: 99, fontSize: 11, fontWeight: 600,
                  background: "rgba(255,255,255,.12)", color: "#fff" }}>{rec.discharge_type}</span>
              )}
            </div>

            <div style={{ fontSize: 24, fontWeight: 900, color: "#fff", marginBottom: 4 }}>{rec.series}</div>
            {rec.style && <div style={{ fontSize: 13, color: "rgba(255,255,255,.5)", marginBottom: 14 }}>{rec.style}</div>}

            {/* Material selector */}
            {materials.length > 0 && (
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,.4)",
                  textTransform: "uppercase", letterSpacing: 1, marginBottom: 7 }}>Select Material</div>
                <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
                  {materials.map(m => {
                    const d = getMat(m);
                    const active = activeMat === m;
                    return (
                      <button key={m} onClick={() => setActiveMat(m)}
                        style={{ padding: "7px 14px", borderRadius: 99, cursor: "pointer",
                          transition: "all .15s",
                          border: active ? `2px solid ${d.color}` : "2px solid rgba(255,255,255,.2)",
                          background: active ? d.bg : "rgba(255,255,255,.08)",
                          color: active ? d.color : "#fff",
                          fontWeight: active ? 800 : 600, fontSize: 12 }}>
                        <span style={{ display: "inline-block", width: 8, height: 8,
                          borderRadius: "50%", background: d.dot,
                          marginRight: 6, verticalAlign: "middle" }} />
                        {m}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Active material info bar */}
            {activeMat && (
              <div style={{ padding: "9px 14px", borderRadius: 10,
                background: "rgba(255,255,255,.07)", border: "1px solid rgba(255,255,255,.1)",
                display: "flex", gap: 16, flexWrap: "wrap" }}>
                <div>
                  <div style={{ fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,.4)",
                    textTransform: "uppercase", letterSpacing: 1, marginBottom: 2 }}>Temp Range</div>
                  <div style={{ fontSize: 11, color: "#fff", fontWeight: 700 }}>{md.temp}</div>
                </div>
                <div>
                  <div style={{ fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,.4)",
                    textTransform: "uppercase", letterSpacing: 1, marginBottom: 2 }}>Best For</div>
                  <div style={{ fontSize: 11, color: "#fff", fontWeight: 700 }}>{md.use}</div>
                </div>
                <div>
                  <div style={{ fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,.4)",
                    textTransform: "uppercase", letterSpacing: 1, marginBottom: 2 }}>FDA</div>
                  <div style={{ fontSize: 11, fontWeight: 800,
                    color: md.fda ? "#6ee7b7" : "#fca5a5" }}>
                    {md.fda ? "✓ Approved" : "✗ Not approved"}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Notes */}
        {rec.notes && (
          <div style={{ margin: "14px 20px 0", padding: "10px 14px", background: "#f8fafc",
            borderRadius: 8, borderLeft: `3px solid ${AMBER}`, fontSize: 12, color: "#374151", lineHeight: 1.7 }}>
            {rec.notes}
          </div>
        )}

        {/* Overview chips */}
        <div style={{ padding: "14px 20px 10px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(170px,1fr))", gap: 8 }}>
            {[
              ["Duty", rec.duty],
              ["Discharge", rec.discharge_type],
              ["Profile", rec.profile],
              ["Sizes Available", sizes.length > 0 ? `${sizes.length} sizes` : rec.bucket_sizes],
              ["Low-Profile", lpSizes.length > 0 ? `${lpSizes.length} LP sizes` : null],
              ["Catalog", rec.page_range ? `pp. ${rec.page_range}` : null],
            ].filter(([, v]) => v).map(([l, v]) => (
              <div key={l} style={{ padding: "8px 12px", background: "#f8fafc",
                borderRadius: 8, border: "1px solid #f1f5f9" }}>
                <div style={{ fontSize: 9, fontWeight: 700, color: "#9ca3af",
                  textTransform: "uppercase", letterSpacing: .5, marginBottom: 2 }}>{l}</div>
                <div style={{ fontSize: 12, color: NAVY, fontWeight: 700 }}>{v}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Sizes */}
        {sizes.length > 0 && (
          <div style={{ padding: "4px 20px 24px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between",
              marginBottom: 12, paddingTop: 14, borderTop: "1px solid #f3f4f6" }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 800, color: NAVY }}>Available Sizes</div>
                <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 2 }}>
                  Click any size for full spec sheet + add to RFQ
                </div>
              </div>
              {lpSizes.length > 0 && (
                <div style={{ display: "flex", gap: 6 }}>
                  <button onClick={() => setShowLP(false)}
                    style={{ padding: "5px 12px", borderRadius: 7, cursor: "pointer",
                      border: `1px solid ${!showLP ? NAVY : "#e5e7eb"}`,
                      background: !showLP ? NAVY : "#f9fafb",
                      color: !showLP ? "#fff" : "#374151",
                      fontSize: 11, fontWeight: 700 }}>Standard</button>
                  <button onClick={() => setShowLP(true)}
                    style={{ padding: "5px 12px", borderRadius: 7, cursor: "pointer",
                      border: `1px solid ${showLP ? AMBER : "#e5e7eb"}`,
                      background: showLP ? "#fffbeb" : "#f9fafb",
                      color: showLP ? AMBER : "#374151",
                      fontSize: 11, fontWeight: 700 }}>Low Profile</button>
                </div>
              )}
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
              {showSizes.map((s, i) => (
                <button key={i} onClick={() => setSelectedSize(s)}
                  style={{ padding: "10px 14px", borderRadius: 10, cursor: "pointer",
                    border: "2px solid #e5e7eb", background: "#f8fafc",
                    transition: "all .15s", textAlign: "left" }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = AMBER; e.currentTarget.style.background = "#fffbeb"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "#e5e7eb"; e.currentTarget.style.background = "#f8fafc"; }}>
                  <div style={{ fontSize: 15, fontWeight: 900, color: NAVY }}>{s.size}&quot;</div>
                  <div style={{ fontSize: 10, color: "#9ca3af", marginTop: 2, lineHeight: 1.5 }}>
                    {s.projection_in && `${s.projection_in}" proj`}
                    {s.depth_in && ` · ${s.depth_in}" deep`}
                  </div>
                  {s.capacity_cu_in && (
                    <div style={{ fontSize: 10, color: AMBER, fontWeight: 700, marginTop: 2 }}>
                      {s.capacity_cu_in} cu.in
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Bucket Card ───────────────────────────────────────────────────────────────
function BucketCard({ rec, onClick }) {
  const materials = parseMaterials(rec.material);
  const isAg = (rec.application || "").toLowerCase().includes("ag");
  let sizeCount = 0;
  try { sizeCount = rec.bucket_sizes_detail ? JSON.parse(rec.bucket_sizes_detail).length : 0; } catch {}

  return (
    <div onClick={onClick}
      style={{ background: "#fff", borderRadius: 14, border: "1px solid #e5e7eb",
        cursor: "pointer", overflow: "hidden", display: "flex", flexDirection: "column",
        transition: "transform .15s, box-shadow .15s" }}
      onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 8px 28px rgba(0,0,0,.11)"; }}
      onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; }}>

      <div style={{ height: 4, background: `linear-gradient(90deg,${AMBER},${AMBER}66)` }} />

      {/* Image */}
      <div style={{ background: "#f8fafc", display: "flex", alignItems: "center",
        justifyContent: "center", height: 150, overflow: "hidden", position: "relative" }}>
        {rec.image_url ? (
          <img src={rec.image_url} alt={rec.series}
            style={{ maxHeight: 130, maxWidth: "90%", objectFit: "contain", padding: 8 }}
            onError={e => { e.target.style.display = "none"; }} />
        ) : <div style={{ color: "#d1d5db", fontSize: 44 }}>🪣</div>}

        {/* Material color dots */}
        {materials.length > 0 && (
          <div style={{ position: "absolute", bottom: 8, right: 8, display: "flex", gap: 4 }}>
            {materials.slice(0, 4).map(m => {
              const d = getMat(m);
              return (
                <span key={m} title={m}
                  style={{ width: 12, height: 12, borderRadius: "50%", background: d.dot,
                    border: "2px solid #fff", boxShadow: "0 1px 3px rgba(0,0,0,.25)", display: "block" }} />
              );
            })}
          </div>
        )}
      </div>

      <div style={{ padding: "12px 14px 8px", flex: 1 }}>
        <div style={{ display: "flex", gap: 5, marginBottom: 6, flexWrap: "wrap" }}>
          <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 99,
            background: isAg ? "#d1fae5" : "#dbeafe",
            color: isAg ? "#065f46" : "#1d4ed8" }}>
            {rec.application}
          </span>
          {rec.duty && (
            <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 99,
              background: "#f3f4f6", color: "#374151" }}>{rec.duty}</span>
          )}
        </div>
        <div style={{ fontSize: 14, fontWeight: 900, color: NAVY, lineHeight: 1.25, marginBottom: 4 }}>
          {rec.series}
        </div>
        {rec.style && (
          <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 6 }}>{rec.style}</div>
        )}
        {/* Material pills */}
        <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
          {materials.slice(0, 4).map(m => {
            const d = getMat(m);
            return (
              <span key={m} style={{ fontSize: 10, padding: "2px 8px", borderRadius: 99,
                background: d.bg, color: d.color, fontWeight: 700 }}>{m}</span>
            );
          })}
        </div>
      </div>

      <div style={{ padding: "8px 14px 12px", display: "flex",
        justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #f9fafb" }}>
        <span style={{ fontSize: 10, color: "#9ca3af" }}>
          {sizeCount > 0 ? `${sizeCount} sizes` : ""}
          {rec.page_range ? ` · pp. ${rec.page_range}` : ""}
        </span>
        <span style={{ fontSize: 11, color: AMBER, fontWeight: 800 }}>View & Configure →</span>
      </div>
    </div>
  );
}

// ── Generic product card & modal (kept from v5) ───────────────────────────────
function Badge({ label, bg = "#f3f4f6", color = "#374151", xs }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center",
      padding: xs ? "1px 7px" : "3px 10px", borderRadius: 99,
      background: bg, color, fontSize: xs ? 10 : 11, fontWeight: 700, whiteSpace: "nowrap" }}>
      {label}
    </span>
  );
}

const TYPE_META = {
  "Elevator Bucket":        { color: "#b45309", bg: "#fef3c7" },
  "Elevator Belt":          { color: "#7c3aed", bg: "#ede9fe" },
  "Modular Plastic Belt":   { color: "#065f46", bg: "#d1fae5" },
  "Wire Mesh Belt":         { color: "#1e40af", bg: "#dbeafe" },
  "Steel Hinged Belt":      { color: "#374151", bg: "#f3f4f6" },
  "Table Top Chain":        { color: "#0e7490", bg: "#cffafe" },
  "ANSI/BS Chain":          { color: "#4338ca", bg: "#e0e7ff" },
  "ANSI Roller Chain":      { color: "#3730a3", bg: "#e0e7ff" },
  "ANSI Roller Chain Attachments": { color: "#6d28d9", bg: "#ede9fe" },
  "Cast Chain":             { color: "#7f1d1d", bg: "#fee2e2" },
  "Engineered Chain":       { color: "#1d4ed8", bg: "#dbeafe" },
  "Forged Chain":           { color: "#92400e", bg: "#ffedd5" },
  "Welded Steel Chain":     { color: "#374151", bg: "#f1f5f9" },
  "Overhead Chain":         { color: "#0f766e", bg: "#ccfbf1" },
  "Conveyor Roller":        { color: "#0369a1", bg: "#e0f2fe" },
  "Monitoring System":      { color: "#047857", bg: "#d1fae5" },
};

function GenericCard({ rec, type, onClick }) {
  const tm = TYPE_META[type] || { color: NAVY, bg: "#f3f4f6" };
  return (
    <div onClick={onClick}
      style={{ background: "#fff", borderRadius: 12, border: "1px solid #e5e7eb",
        cursor: "pointer", overflow: "hidden", display: "flex", flexDirection: "column",
        transition: "transform .15s, box-shadow .15s" }}
      onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 6px 20px rgba(0,0,0,.10)"; }}
      onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; }}>
      <div style={{ height: 4, background: `linear-gradient(90deg,${tm.color},${tm.color}66)` }} />
      {rec.image_url && (
        <div style={{ background: "#f8fafc", display: "flex", alignItems: "center",
          justifyContent: "center", height: 130, overflow: "hidden" }}>
          <img src={rec.image_url} alt={rec.series}
            style={{ maxHeight: 120, maxWidth: "100%", objectFit: "contain", padding: 8 }}
            onError={e => { e.target.style.display = "none"; }} />
        </div>
      )}
      <div style={{ padding: "12px 14px", flex: 1, display: "flex", flexDirection: "column", gap: 5 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 6 }}>
          <Badge label={type} bg={tm.bg} color={tm.color} xs />
          {rec.pitch_in && <span style={{ fontSize: 10, color: "#9ca3af" }}>{rec.pitch_in}" pitch</span>}
        </div>
        <div style={{ fontSize: 13, fontWeight: 800, color: NAVY, lineHeight: 1.25 }}>
          {rec.series || rec.name || "—"}
        </div>
        {(rec.style || rec.category) && <div style={{ fontSize: 11, color: "#6b7280" }}>{rec.style || rec.category}</div>}
        <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
          {rec.hinge_style && <Badge label={rec.hinge_style} bg="#f9fafb" color="#374151" xs />}
          {rec.open_area && rec.open_area !== "0%" && <Badge label={`${rec.open_area} open`} bg="#f0fdf4" color="#15803d" xs />}
          {!rec.hinge_style && rec.duty && <Badge label={rec.duty} bg="#f9fafb" color="#374151" xs />}
        </div>
        {(rec.notes || rec.materials || rec.material) && (
          <div style={{ fontSize: 11, color: "#6b7280", lineHeight: 1.5,
            display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
            {rec.notes || rec.materials || rec.material}
          </div>
        )}
      </div>
      <div style={{ padding: "8px 14px", borderTop: "1px solid #f3f4f6",
        display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 10, color: "#d1d5db" }}>{rec.page_range ? `pp. ${rec.page_range}` : ""}</span>
        <span style={{ fontSize: 11, color: tm.color, fontWeight: 700 }}>Details →</span>
      </div>
    </div>
  );
}

function MacSpecTable({ headers, rows }) {
  let pH = headers, pR = rows;
  try { if (typeof headers === "string") pH = JSON.parse(headers); } catch {}
  try { if (typeof rows === "string") pR = JSON.parse(rows); } catch {}
  if (!pH?.length || !pR?.length) return null;
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
        <thead><tr style={{ background: NAVY }}>
          {pH.map((h, i) => <th key={i} style={{ padding: "8px 10px", color: "#fff", fontWeight: 700, textAlign: "left", fontSize: 11, whiteSpace: "nowrap" }}>{h}</th>)}
        </tr></thead>
        <tbody>{pR.map((row, i) => (
          <tr key={i} style={{ background: i % 2 === 0 ? "#f8fafc" : "#fff", borderBottom: "1px solid #e5e7eb" }}>
            {(Array.isArray(row) ? row : pH.map(h => row[h])).map((cell, j) => (
              <td key={j} style={{ padding: "7px 10px", color: j === 0 ? NAVY : "#374151", fontWeight: j === 0 ? 700 : 400, whiteSpace: "nowrap" }}>
                {cell != null ? String(cell) : "—"}
              </td>
            ))}
          </tr>
        ))}</tbody>
      </table>
    </div>
  );
}

function BeltDataTable({ beltData }) {
  let rows = [];
  try { rows = typeof beltData === "string" ? JSON.parse(beltData) : beltData; } catch { return null; }
  if (!rows?.length) return null;
  const cols = [
    { key: "material", label: "Material" }, { key: "strength_lbf", label: "Strength (lbf)" },
    { key: "temp_min_f", label: "Min (°F)" }, { key: "temp_max_f", label: "Max (°F)" },
    { key: "mass_lbft2", label: "Mass (lb/ft²)" },
  ].filter(c => rows.some(r => r[c.key] != null && r[c.key] !== ""));
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
        <thead><tr style={{ background: NAVY }}>
          {cols.map(c => <th key={c.key} style={{ padding: "8px 10px", color: "#fff", fontWeight: 700, textAlign: "left", fontSize: 11 }}>{c.label}</th>)}
        </tr></thead>
        <tbody>{rows.map((row, i) => (
          <tr key={i} style={{ background: i % 2 === 0 ? "#f8fafc" : "#fff", borderBottom: "1px solid #e5e7eb" }}>
            {cols.map(c => <td key={c.key} style={{ padding: "7px 10px", color: c.key === "material" ? NAVY : "#374151", fontWeight: c.key === "material" ? 700 : 400 }}>{row[c.key] != null ? String(row[c.key]) : "—"}</td>)}
          </tr>
        ))}</tbody>
      </table>
    </div>
  );
}

function GenericModal({ rec, type, onClose }) {
  const [tab, setTab] = useState("overview");
  const [added, setAdded] = useState(false);
  if (!rec) return null;
  const tm = TYPE_META[type] || { color: NAVY, bg: "#f3f4f6" };
  const isMac = rec._src === "mac";
  let beltRows = [];
  if (rec.belt_data) { try { beltRows = typeof rec.belt_data === "string" ? JSON.parse(rec.belt_data) : rec.belt_data; } catch {} }
  let parsedSpecs = null;
  if (rec.key_specs) { try { parsedSpecs = JSON.parse(rec.key_specs); } catch {} }
  const mats = (rec.materials || rec.material || "").split(/[,/]/).map(s => s.trim()).filter(Boolean);
  const specs = [
    ["Series", rec.series], ["Style", rec.style || rec.category], ["Vendor", rec.vendor],
    ["Duty", rec.duty], ["Application", rec.application], ["Model", rec.model_code],
    ["Pitch", rec.pitch_in ? `${rec.pitch_in}" (${rec.pitch_mm}mm)` : null],
    ["Min Width", rec.min_width_in ? `${rec.min_width_in}"` : null],
    ["Open Area", rec.open_area], ["Hinge Style", rec.hinge_style],
    ["Pages", rec.page_range ? `pp. ${rec.page_range}` : null],
  ];
  const tabs = [
    isMac && rec.basic_headers ? ["macspecs", "Specifications"] : ["overview", "Specs"],
    isMac && rec.more_headers && ["macmore", "More Specs"],
    mats.length > 0 && !isMac && ["materials", "Materials"],
    beltRows.length > 0 && ["beltdata", "Belt Data"],
    parsedSpecs && ["keyspecs", "Key Specs"],
    (rec.catalog_url || rec.tech_doc_url || rec.cad_url) && ["resources", "Resources"],
  ].filter(Boolean);

  function addToRFQ() {
    const cart = JSON.parse(localStorage.getItem("uniking_rfq_cart") || "[]");
    cart.push({ id: `${rec._src}-${rec.id}-${Date.now()}`, type, series: rec.series || rec.part_number, style: rec.style || rec.category, notes: "", qty: 1 });
    localStorage.setItem("uniking_rfq_cart", JSON.stringify(cart));
    setAdded(true);
    setTimeout(() => setAdded(false), 2500);
  }

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.55)", zIndex: 1000,
      display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }} onClick={onClose}>
      <div style={{ background: "#fff", borderRadius: 16, width: "100%", maxWidth: 700,
        maxHeight: "93vh", overflowY: "auto" }} onClick={e => e.stopPropagation()}>
        <div style={{ background: `linear-gradient(135deg,${NAVY},#2d5986)`, borderRadius: "16px 16px 0 0", padding: "20px 22px 16px", position: "relative" }}>
          <button onClick={onClose} style={{ position: "absolute", top: 12, right: 14, background: "rgba(255,255,255,.15)", border: "none", borderRadius: "50%", width: 32, height: 32, cursor: "pointer", color: "#fff", fontSize: 16 }}>✕</button>
          <div style={{ display: "flex", gap: 8, marginBottom: 10, flexWrap: "wrap" }}>
            <Badge label={type} bg={tm.bg} color={tm.color} />
            {rec.vendor && <Badge label={rec.vendor} bg="rgba(255,255,255,.15)" color="#fff" />}
          </div>
          <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
            {rec.image_url && (
              <div style={{ background: "#fff", borderRadius: 10, padding: 8, flexShrink: 0, width: 120, height: 90, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <img src={rec.image_url} alt={rec.series} style={{ maxWidth: 110, maxHeight: 80, objectFit: "contain" }} onError={e => { e.target.parentElement.style.display = "none"; }} />
              </div>
            )}
            <div>
              <div style={{ fontSize: 21, fontWeight: 900, color: "#fff", lineHeight: 1.15 }}>{isMac ? (rec.part_number || rec.series) : rec.series}</div>
              {(rec.style || rec.category) && <div style={{ fontSize: 13, color: "rgba(255,255,255,.65)", marginTop: 4 }}>{rec.style || rec.category}</div>}
              <div style={{ display: "flex", gap: 6, marginTop: 8, flexWrap: "wrap" }}>
                {rec.pitch_in && <Badge label={`${rec.pitch_in}" pitch`} bg="rgba(255,255,255,.15)" color="#fff" />}
                {rec.hinge_style && <Badge label={rec.hinge_style} bg="rgba(255,255,255,.15)" color="#fff" />}
                {rec.open_area && <Badge label={`${rec.open_area} open`} bg="rgba(255,255,255,.15)" color="#fff" />}
              </div>
            </div>
          </div>
        </div>
        {(rec.notes || rec.description) && (
          <div style={{ margin: "14px 20px 0", fontSize: 13, color: "#374151", lineHeight: 1.7, padding: "10px 14px", background: "#f8fafc", borderRadius: 8, borderLeft: `3px solid ${tm.color}` }}>
            {rec.notes || rec.description}
          </div>
        )}
        {rec.features && (
          <div style={{ margin: "10px 20px 0" }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>Features</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {(Array.isArray(rec.features) ? rec.features : rec.features.split(";")).map((f, i) => f && f.trim && f.trim() && (
                <span key={i} style={{ fontSize: 11, padding: "3px 9px", borderRadius: 99, background: tm.bg, color: tm.color, fontWeight: 600 }}>✓ {typeof f === "string" ? f.trim() : f}</span>
              ))}
            </div>
          </div>
        )}
        <div style={{ display: "flex", borderBottom: "2px solid #f3f4f6", margin: "14px 20px 0", overflowX: "auto" }}>
          {tabs.map(([id, label]) => (
            <button key={id} onClick={() => setTab(id)}
              style={{ padding: "8px 14px", border: "none", background: "none", cursor: "pointer", fontSize: 12, fontWeight: 700, whiteSpace: "nowrap",
                color: tab === id ? tm.color : "#9ca3af", borderBottom: tab === id ? `2px solid ${tm.color}` : "2px solid transparent", marginBottom: -2 }}>
              {label}
            </button>
          ))}
        </div>
        <div style={{ padding: "16px 20px 0" }}>
          {tab === "macspecs" && <MacSpecTable headers={rec.basic_headers} rows={rec.basic_rows} />}
          {tab === "macmore" && <MacSpecTable headers={rec.more_headers} rows={rec.more_rows} />}
          {tab === "overview" && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {specs.filter(([, v]) => v && v !== "—" && v !== "null").map(([l, v]) => (
                <div key={l} style={{ padding: "10px 12px", background: "#f8fafc", borderRadius: 8, border: "1px solid #f1f5f9" }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: .5, marginBottom: 3 }}>{l}</div>
                  <div style={{ fontSize: 13, color: NAVY, fontWeight: 600 }}>{v}</div>
                </div>
              ))}
            </div>
          )}
          {tab === "materials" && <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>{mats.map((m, i) => <span key={i} style={{ padding: "8px 14px", borderRadius: 99, background: tm.bg, color: tm.color, fontWeight: 700, fontSize: 13 }}>{m}</span>)}</div>}
          {tab === "beltdata" && <BeltDataTable beltData={rec.belt_data} />}
          {tab === "keyspecs" && parsedSpecs && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {Object.entries(parsedSpecs).map(([k, v]) => (
                <div key={k} style={{ padding: "10px 12px", background: "#f8fafc", borderRadius: 8 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: .5, marginBottom: 3 }}>{k.replace(/_/g, " ")}</div>
                  <div style={{ fontSize: 13, color: NAVY, fontWeight: 600 }}>{String(v)}</div>
                </div>
              ))}
            </div>
          )}
          {tab === "resources" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {rec.catalog_url && <a href={rec.catalog_url} target="_blank" rel="noreferrer" style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", background: "#f8fafc", borderRadius: 10, border: "1px solid #e5e7eb", color: NAVY, fontWeight: 700, fontSize: 13, textDecoration: "none" }}>📄 Catalog PDF</a>}
              {rec.tech_doc_url && <a href={rec.tech_doc_url} target="_blank" rel="noreferrer" style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", background: "#f8fafc", borderRadius: 10, border: "1px solid #e5e7eb", color: NAVY, fontWeight: 700, fontSize: 13, textDecoration: "none" }}>📐 Technical Docs</a>}
              {rec.cad_url && <a href={rec.cad_url} target="_blank" rel="noreferrer" style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", background: "#f8fafc", borderRadius: 10, border: "1px solid #e5e7eb", color: NAVY, fontWeight: 700, fontSize: 13, textDecoration: "none" }}>📁 CAD Drawing</a>}
            </div>
          )}
        </div>
        <div style={{ padding: "16px 20px 24px", marginTop: 12 }}>
          <button onClick={addToRFQ} style={{ width: "100%", padding: "12px 20px", borderRadius: 10, border: "none", background: added ? "#065f46" : NAVY, color: "#fff", fontSize: 14, fontWeight: 800, cursor: "pointer" }}>
            {added ? "✓ Added to RFQ Cart" : "Add to RFQ Cart"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── MAIN ──────────────────────────────────────────────────────────────────────
export default function Catalog() {
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [appFilter, setAppFilter] = useState("All");
  const [seriesFilter, setSeriesFilter] = useState("All");
  const [hingeFilter, setHingeFilter] = useState("All");
  const [pitchFilter, setPitchFilter] = useState("All");
  const [selected, setSelected] = useState(null);
  const [selectedType, setSelectedType] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const [intralox, unicatalog, buckets, macChains] = await Promise.all([
          CatalogProduct.list(),
          UniCatalog.list(),
          ElevatorBucket.list(),
          MacChainProduct.list(),
        ]);

        setAllProducts([
          ...intralox.map(r => ({ ...r, _src: "intralox", _type: r.category || "Modular Plastic Belt" })),
          ...unicatalog.map(r => ({ ...r, _src: "uni", _type: r.product_type })),
          ...buckets.map(r => ({ ...r, _src: "bucket", _type: "Elevator Bucket" })),
          ...macChains.map(r => ({
            ...r, _src: "mac",
            _type: r.product_type === "ANSI Roller Chain" ? "ANSI Roller Chain" :
              r.product_type === "ANSI Roller Chain Attachments" ? "ANSI Roller Chain Attachments" : "Engineered Chain",
            vendor: "", series: r.part_number || r.series,
            style: r.subcategory || r.category,
            image_url: r.product_image || r.image_url,
          })),
        ]);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    }
    load();
  }, []);

  const types = useMemo(() =>
    ["All", ...new Set(allProducts.map(p => p._type).filter(Boolean))].sort((a, b) => a === "All" ? -1 : a.localeCompare(b)),
    [allProducts]);

  const isBucketView = typeFilter === "Elevator Bucket";

  const filtered = useMemo(() => {
    let list = allProducts;
    if (typeFilter !== "All") list = list.filter(p => p._type === typeFilter);
    if (isBucketView && appFilter !== "All")
      list = list.filter(p => (p.application || "").toLowerCase().includes(appFilter.toLowerCase()));
    if (seriesFilter !== "All") list = list.filter(p => p.series === seriesFilter);
    if (hingeFilter !== "All") list = list.filter(p => p.hinge_style === hingeFilter);
    if (pitchFilter !== "All") list = list.filter(p => `${p.pitch_in}"` === pitchFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(p => [p.series, p.style, p.category, p.notes, p.materials,
        p.material, p.search_tags, p.application, p.part_number, p.description]
        .some(f => f && f.toLowerCase().includes(q)));
    }
    return list.sort((a, b) => {
      const pn = s => { const m = (s || "").trim().match(/^(\d+(?:\.\d+)?)(.*)/); if (!m) return [0, 0, s || ""]; const st = (m[2] || "").match(/-(\d+)$/); return [parseFloat(m[1]), st ? parseInt(st[1]) : 1, m[2] || ""]; };
      const [an, as2, ar] = pn(a.series), [bn, bs2, br] = pn(b.series);
      return an !== bn ? an - bn : as2 !== bs2 ? as2 - bs2 : ar.localeCompare(br);
    });
  }, [allProducts, typeFilter, appFilter, isBucketView, seriesFilter, hingeFilter, pitchFilter, search]);

  const seriesOptions = useMemo(() => {
    const base = typeFilter === "All" ? allProducts : allProducts.filter(p => p._type === typeFilter);
    return ["All", ...new Set(base.map(p => p.series).filter(Boolean))].sort((a, b) => a === "All" ? -1 : a.localeCompare(b));
  }, [allProducts, typeFilter]);

  const hingeOptions = useMemo(() =>
    ["All", ...new Set(allProducts.filter(p => p.hinge_style).map(p => p.hinge_style))].sort(),
    [allProducts]);

  const pitchOptions = useMemo(() =>
    ["All", ...new Set(allProducts.filter(p => p.pitch_in).map(p => `${p.pitch_in}"`))]
      .sort((a, b) => a === "All" ? -1 : parseFloat(a) - parseFloat(b)),
    [allProducts]);

  const bucketAg    = filtered.filter(p => p._src === "bucket" && (p.application || "").toLowerCase().includes("ag"));
  const bucketInd   = filtered.filter(p => p._src === "bucket" && (p.application || "").toLowerCase().includes("ind"));
  const bucketOther = filtered.filter(p => p._src === "bucket" && !bucketAg.includes(p) && !bucketInd.includes(p));
  const nonBuckets  = filtered.filter(p => p._src !== "bucket");

  const anyFilter = typeFilter !== "All" || appFilter !== "All" || seriesFilter !== "All" ||
    hingeFilter !== "All" || pitchFilter !== "All" || search;

  const Sel = ({ value, onChange, options, label }) => (
    <select value={value} onChange={e => onChange(e.target.value)}
      style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid #d1d5db", fontSize: 13,
        color: NAVY, background: "#fff", cursor: "pointer", fontWeight: value !== "All" ? 700 : 400 }}>
      <option value="All">{label}</option>
      {options.filter(o => o !== "All").map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  );

  // Render bucket sections
  function BucketSection({ title, items, accentColor }) {
    if (!items.length) return null;
    return (
      <div style={{ marginBottom: 40 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
          <div style={{ height: 3, width: 32, background: accentColor, borderRadius: 99 }} />
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 900, color: NAVY }}>{title}</h2>
          <span style={{ fontSize: 12, color: "#9ca3af" }}>{items.length} series</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))", gap: 16 }}>
          {items.map(rec => (
            <BucketCard key={rec.id} rec={rec}
              onClick={() => { setSelected(rec); setSelectedType("bucket"); }} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", fontFamily: "'Inter','Segoe UI',sans-serif" }}>
      {/* Top Bar */}
      <div style={{ background: NAVY, padding: "0 24px", display: "flex", alignItems: "center",
        justifyContent: "space-between", height: 56, boxShadow: "0 2px 8px rgba(0,0,0,.18)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <a href="/" style={{ color: "rgba(255,255,255,.5)", textDecoration: "none", fontSize: 12 }}>Home</a>
          <span style={{ color: "rgba(255,255,255,.3)", fontSize: 12 }}>/</span>
          <span style={{ color: "#fff", fontSize: 13, fontWeight: 700 }}>Product Catalog</span>
        </div>
        <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
          <span style={{ fontSize: 11, color: "rgba(255,255,255,.4)" }}>
            {loading ? "Loading..." : `${filtered.length} products`}
          </span>
          <a href="/rfq-cart" style={{ padding: "6px 14px", borderRadius: 8,
            background: "rgba(255,255,255,.12)", border: "1px solid rgba(255,255,255,.2)",
            color: "#fff", fontSize: 12, fontWeight: 700, textDecoration: "none" }}>RFQ Cart</a>
        </div>
      </div>

      {/* Filters */}
      <div style={{ background: "#fff", borderBottom: "1px solid #e5e7eb", padding: "14px 24px" }}>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", maxWidth: 1200, margin: "0 auto" }}>
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search series, style, application, material..."
            style={{ flex: 1, minWidth: 240, padding: "8px 14px", borderRadius: 8,
              border: "1px solid #d1d5db", fontSize: 13, outline: "none" }} />
          <Sel value={typeFilter} onChange={v => { setTypeFilter(v); setSeriesFilter("All"); setAppFilter("All"); }} options={types} label="All Types" />
          {isBucketView && <Sel value={appFilter} onChange={setAppFilter} options={["All", "Agricultural", "Industrial"]} label="All Applications" />}
          {seriesOptions.length > 2 && <Sel value={seriesFilter} onChange={setSeriesFilter} options={seriesOptions} label="All Series" />}
          {!isBucketView && hingeOptions.length > 2 && <Sel value={hingeFilter} onChange={setHingeFilter} options={hingeOptions} label="Hinge Style" />}
          {!isBucketView && pitchOptions.length > 2 && <Sel value={pitchFilter} onChange={setPitchFilter} options={pitchOptions} label="Pitch" />}
          {anyFilter && (
            <button onClick={() => { setTypeFilter("All"); setSeriesFilter("All"); setHingeFilter("All"); setPitchFilter("All"); setAppFilter("All"); setSearch(""); }}
              style={{ padding: "8px 14px", borderRadius: 8, border: "1px solid #d1d5db", background: "#f9fafb", cursor: "pointer", fontSize: 13, color: "#6b7280" }}>
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: 24 }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: 80, color: "#9ca3af", fontSize: 14 }}>Loading catalog...</div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: 80, color: "#9ca3af", fontSize: 14 }}>No products match your search.</div>
        ) : (
          <>
            {/* Buckets always render as BucketCards */}
            {(typeFilter === "All" || isBucketView) && (bucketAg.length > 0 || bucketInd.length > 0 || bucketOther.length > 0) && (
              <div>
                {typeFilter === "All" && (
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
                    <div style={{ height: 3, width: 32, background: AMBER, borderRadius: 99 }} />
                    <h2 style={{ margin: 0, fontSize: 18, fontWeight: 900, color: NAVY }}>Elevator Buckets</h2>
                  </div>
                )}
                <BucketSection title={isBucketView && appFilter !== "All" ? "" : "Agricultural Buckets"} items={bucketAg} accentColor="#065f46" />
                <BucketSection title={isBucketView && appFilter !== "All" ? "" : "Industrial Buckets"} items={bucketInd} accentColor="#1d4ed8" />
                <BucketSection title="Steel / Other Buckets" items={bucketOther} accentColor="#374151" />
              </div>
            )}

            {/* All other product types */}
            {(typeFilter === "All" || !isBucketView) && nonBuckets.length > 0 && (
              <>
                {typeFilter === "All" && (bucketAg.length > 0 || bucketInd.length > 0) && (
                  <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "32px 0 18px" }}>
                    <div style={{ height: 3, width: 32, background: NAVY, borderRadius: 99 }} />
                    <h2 style={{ margin: 0, fontSize: 18, fontWeight: 900, color: NAVY }}>Conveyor Components</h2>
                  </div>
                )}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))", gap: 16 }}>
                  {nonBuckets.map(rec => (
                    <GenericCard key={rec.id} rec={rec} type={rec._type}
                      onClick={() => { setSelected(rec); setSelectedType(rec._type); }} />
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>

      {selected && selectedType === "bucket" && (
        <BucketStyleModal rec={selected} onClose={() => { setSelected(null); setSelectedType(null); }} />
      )}
      {selected && selectedType !== "bucket" && (
        <GenericModal rec={selected} type={selectedType} onClose={() => { setSelected(null); setSelectedType(null); }} />
      )}
    </div>
  );
}
