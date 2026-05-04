import { useState, useRef } from "react";

// ── Constants ────────────────────────────────────────────────────────────────

const C = {
  navy: "#0F2340", navyMid: "#1A3A5C", navyLight: "#2A5080",
  gold: "#C9A84C", goldLight: "#e8c96d",
  green: "#16a34a", greenBg: "#dcfce7",
  border: "#e2e8f0", text: "#0f172a", muted: "#64748b",
  bg: "#f8fafc", card: "#ffffff"
};

const LOGO = "https://media.base44.com/images/public/69dd9ffccab4dd693d4d92f5/e48ee59d9_Unitingthestrongestlinks_20251031_225809_0000.png";

// ── Wire Mesh Belt Subcategory Data ──────────────────────────────────────────

const BELT_STYLES = [
  {
    key: "flat_flex",
    label: "Flat Flex Belt",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80",
    description: "Interlocked spirals forming a flat, flexible wire belt. Ideal for baking, cooling, and food processing lines.",
    applications: ["Baking & cooling", "Freezing tunnels", "Snack food conveying", "Pasteurization"],
    advantages: ["High open area", "Easy cleaning", "Lightweight", "Flexible side-flexing possible"],
    pitchOptions: ["1/2\"", "3/4\"", "1\""],
    edgeOptions: ["Straight selvage (welded)", "Beaded edge", "Clinched edge", "Side-bar (chain edge)"],
    driveOptions: ["Sprocket drive", "Friction drive"],
    wireGauges: ["12 ga", "14 ga", "16 ga", "18 ga"],
    materials: ["304 Stainless Steel", "316 Stainless Steel", "Carbon Steel (galvanized)", "Inconel (high-temp)"],
  },
  {
    key: "compound_balanced",
    label: "Compound Balanced / Balanced Weave",
    image: "https://images.unsplash.com/photo-1565087124596-dfd8a6f78d8d?w=400&q=80",
    description: "Alternating left and right spirals locked by cross rods for a stable, balanced structure. General conveying and heating.",
    applications: ["General conveying", "Heat treating", "Tempering", "Annealing"],
    advantages: ["Dimensional stability", "High strength", "Suitable for high temps", "Available in very fine mesh"],
    pitchOptions: ["To be confirmed by Uniking"],
    edgeOptions: ["Welded edge", "Knuckled edge", "Side-bar"],
    driveOptions: ["Sprocket drive", "Flat nose bar"],
    wireGauges: ["10 ga", "12 ga", "14 ga", "16 ga"],
    materials: ["304 Stainless Steel", "316 Stainless Steel", "Inconel 600", "Carbon Steel"],
  },
  {
    key: "flat_wire",
    label: "Flat Wire Belt",
    image: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&q=80",
    description: "Flat transverse wires crimped and interlocked, providing a smooth, nearly solid surface. Perfect for small products and precision conveying.",
    applications: ["Bread & baked goods", "Cookie conveying", "Vegetable blanching", "Automation"],
    advantages: ["Very smooth surface", "Low product fallthrough", "Easy product transfer", "Easily spliced"],
    pitchOptions: ["3/8\"", "1/2\"", "5/8\"", "3/4\""],
    edgeOptions: ["Welded selvedge", "Rod edge"],
    driveOptions: ["Sprocket drive", "Smooth nose bar"],
    wireGauges: ["12 ga", "14 ga", "16 ga"],
    materials: ["304 Stainless Steel", "316 Stainless Steel", "Carbon Steel"],
  },
  {
    key: "eye_flex",
    label: "Eye-Flex / Eye-Link Belt",
    image: "https://images.unsplash.com/photo-1606770347049-ad9e22fddf79?w=400&q=80",
    description: "Open eye-shaped wire links on cross rods. Very high open area for draining, drying and cooling applications.",
    applications: ["Seafood & poultry processing", "Vegetable washing", "Drainage conveying", "Cooling & drying"],
    advantages: ["Highest open area", "Excellent drainage", "Hygienic design", "Simple repair"],
    pitchOptions: ["1/2\"", "3/4\"", "1\""],
    edgeOptions: ["Welded selvedge", "Clinched edge"],
    driveOptions: ["Sprocket drive"],
    wireGauges: ["12 ga", "14 ga", "16 ga"],
    materials: ["304 Stainless Steel", "316 Stainless Steel"],
  },
  {
    key: "spiral",
    label: "Spiral / Omni-Grid Belt",
    image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&q=80",
    description: "Tight-wound spiral wires on cross rods for spiral freezers, proofing towers and vertical oven systems. Supports high tension loads.",
    applications: ["Spiral freezers", "Spiral coolers", "Proofing towers", "Vertical ovens"],
    advantages: ["High tension capability", "Side-flexing for curves", "Compact footprint", "Long service life"],
    pitchOptions: ["To be confirmed by Uniking"],
    edgeOptions: ["Side-bar (chain drive edge)", "Clipped edge"],
    driveOptions: ["Drum drive (spiral system)", "Chain drive"],
    wireGauges: ["12 ga", "14 ga"],
    materials: ["304 Stainless Steel", "316 Stainless Steel"],
  },
  {
    key: "ladder_link",
    label: "Ladder Link / Sani-Grid",
    image: "https://images.unsplash.com/photo-1607799279861-4dd421887fb3?w=400&q=80",
    description: "Open ladder-like wire structure with large open area. Used where maximum airflow and easy sanitation are required.",
    applications: ["Sanitary conveying", "Cooling & airflow", "Baking & retort", "Pharmaceutical"],
    advantages: ["Maximum open area", "Easy to sanitize", "Low weight", "Available in multiple pitches"],
    pitchOptions: ["To be confirmed by Uniking"],
    edgeOptions: ["Welded edge", "Clinched edge"],
    driveOptions: ["Sprocket drive", "Flat nose bar"],
    wireGauges: ["10 ga", "12 ga", "14 ga"],
    materials: ["304 Stainless Steel", "316 Stainless Steel"],
  },
  {
    key: "filter_belt",
    label: "Filter / Woven Wire Belt",
    image: "https://images.unsplash.com/photo-1609429019995-8c40f49535a5?w=400&q=80",
    description: "Tightly woven wire mesh for filtration, drainage, and precision separation applications.",
    applications: ["Filtration", "Separation", "Fines removal", "Grading & sorting"],
    advantages: ["Precise mesh opening", "High filtration efficiency", "Durable construction", "Multiple mesh counts"],
    pitchOptions: ["To be confirmed by Uniking"],
    edgeOptions: ["Welded edge", "Hemmed edge"],
    driveOptions: ["Smooth drum", "Sprocket drive"],
    wireGauges: ["16 ga", "18 ga", "20 ga", "22 ga"],
    materials: ["304 Stainless Steel", "316 Stainless Steel", "Carbon Steel"],
  },
  {
    key: "furnace_belt",
    label: "Furnace / High-Temperature Belt",
    image: "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=400&q=80",
    description: "Heavy-duty wire mesh designed for high-temperature furnace, heat treating, and annealing applications. Built to withstand 1000°C+.",
    applications: ["Heat treatment furnaces", "Annealing", "Brazing", "Sintering", "Glass tempering"],
    advantages: ["High-temp alloys available", "Oxidation resistant", "Dimensionally stable at temp", "Long service life in furnace"],
    pitchOptions: ["To be confirmed by Uniking"],
    edgeOptions: ["Welded selvedge", "Side-bar"],
    driveOptions: ["Sprocket drive", "Friction drive"],
    wireGauges: ["8 ga", "10 ga", "12 ga", "14 ga"],
    materials: ["Inconel 600", "Inconel 601", "RA330", "330 Stainless Steel", "304 Stainless Steel"],
  },
];

// ── SVG Wire Mesh Belt Schematic ─────────────────────────────────────────────

function WireMeshSchematic({ config }) {
  const {
    beltStyle, beltWidth, beltLength, pitch, wireDiameter,
    edgeStyle, driveMethod, flowDirection, material
  } = config;

  const style = BELT_STYLES.find(s => s.key === beltStyle);
  const W = 560, H = 220;
  const beltX = 60, beltY = 60;
  const beltW = 440, beltH = 80;

  // Parse width/length
  const widthNum = parseFloat(beltWidth) || 0;
  const lengthNum = parseFloat(beltLength) || 0;

  // Colors
  const wireColor = material?.includes("Carbon") ? "#8B7355" : "#6B8CAE";
  const frameColor = C.navyMid;

  // Generate wire mesh pattern lines
  const meshLines = [];
  const spacing = 18;
  // Longitudinal wires
  for (let x = beltX + 10; x < beltX + beltW - 10; x += spacing) {
    meshLines.push(
      <line key={`v${x}`} x1={x} y1={beltY + 4} x2={x} y2={beltY + beltH - 4}
        stroke={wireColor} strokeWidth={1.2} opacity={0.6} />
    );
  }
  // Cross rods / transverse wires
  for (let y = beltY + 10; y < beltY + beltH - 6; y += 14) {
    meshLines.push(
      <line key={`h${y}`} x1={beltX + 4} y1={y} x2={beltX + beltW - 4} y2={y}
        stroke={wireColor} strokeWidth={1.8} opacity={0.8} />
    );
  }

  // Drive ends
  const leftDrum = driveMethod?.toLowerCase().includes("drum") || driveMethod?.toLowerCase().includes("friction");
  const rightDrum = true;

  // Edge indicators
  const hasChainEdge = edgeStyle?.toLowerCase().includes("chain") || edgeStyle?.toLowerCase().includes("side-bar");
  const hasBead = edgeStyle?.toLowerCase().includes("bead");

  return (
    <div style={{ background: "#0f2340", borderRadius: 12, padding: "12px 12px 8px", marginBottom: 16, border: "1px solid rgba(255,255,255,0.08)" }}>
      <div style={{ fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 6, textAlign: "center" }}>
        Live Belt Schematic — {style?.label || "Select a belt style"}
      </div>
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display: "block" }}>

        {/* Belt body fill */}
        <rect x={beltX} y={beltY} width={beltW} height={beltH}
          fill="#1e3a5c" stroke={frameColor} strokeWidth={2} rx={2} />

        {/* Wire mesh pattern */}
        {meshLines}

        {/* Edge highlight top */}
        <rect x={beltX} y={beltY} width={beltW} height={hasChainEdge ? 8 : 4}
          fill={hasChainEdge ? C.gold : wireColor} opacity={0.9} rx={1} />
        {/* Edge highlight bottom */}
        <rect x={beltX} y={beltY + beltH - (hasChainEdge ? 8 : 4)} width={beltW} height={hasChainEdge ? 8 : 4}
          fill={hasChainEdge ? C.gold : wireColor} opacity={0.9} rx={1} />
        {hasBead && (
          <>
            <ellipse cx={beltX} cy={beltY + 4} rx={5} ry={4} fill={wireColor} opacity={0.9} />
            <ellipse cx={beltX} cy={beltY + beltH - 4} rx={5} ry={4} fill={wireColor} opacity={0.9} />
            <ellipse cx={beltX + beltW} cy={beltY + 4} rx={5} ry={4} fill={wireColor} opacity={0.9} />
            <ellipse cx={beltX + beltW} cy={beltY + beltH - 4} rx={5} ry={4} fill={wireColor} opacity={0.9} />
          </>
        )}

        {/* Left drive */}
        <ellipse cx={beltX} cy={beltY + beltH / 2} rx={14} ry={beltH / 2 + 4}
          fill={leftDrum ? "#334155" : "#1e3a5c"} stroke={frameColor} strokeWidth={2} />
        {/* Right nose / drive */}
        <ellipse cx={beltX + beltW} cy={beltY + beltH / 2} rx={14} ry={beltH / 2 + 4}
          fill="#334155" stroke={frameColor} strokeWidth={2} />

        {/* Sprocket teeth hint on drive side */}
        {!leftDrum && [0.2, 0.4, 0.6, 0.8].map((t, i) => (
          <rect key={i} x={beltX - 20} y={beltY + beltH * t - 3} width={10} height={6}
            fill={C.gold} rx={2} opacity={0.8} />
        ))}

        {/* Flow direction arrow */}
        {flowDirection && (
          <g>
            <defs>
              <marker id="flowArr" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
                <path d="M0,0 L8,4 L0,8 Z" fill={C.gold} />
              </marker>
            </defs>
            <line
              x1={flowDirection === "Right to Left" ? beltX + beltW - 20 : beltX + 20}
              y1={beltY + beltH / 2}
              x2={flowDirection === "Right to Left" ? beltX + 30 : beltX + beltW - 30}
              y2={beltY + beltH / 2}
              stroke={C.gold} strokeWidth={2.5} strokeDasharray="8,5"
              markerEnd={flowDirection === "Right to Left" ? undefined : "url(#flowArr)"}
              markerStart={flowDirection === "Right to Left" ? "url(#flowArr)" : undefined}
            />
            <text x={W / 2} y={beltY + beltH / 2 + 5} textAnchor="middle" fontSize={9} fill={C.gold} fontWeight="700">
              {flowDirection}
            </text>
          </g>
        )}

        {/* Width dimension */}
        <defs>
          <marker id="wArr" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
            <path d="M0,0 L6,3 L0,6 Z" fill="#94a3b8" />
          </marker>
          <marker id="wArrL" markerWidth="6" markerHeight="6" refX="1" refY="3" orient="auto">
            <path d="M6,0 L0,3 L6,6 Z" fill="#94a3b8" />
          </marker>
        </defs>

        {/* Width arrow (vertical) */}
        <line x1={beltX - 30} y1={beltY} x2={beltX - 30} y2={beltY + beltH}
          stroke="#94a3b8" strokeWidth={1} markerEnd="url(#wArr)" markerStart="url(#wArrL)" />
        <text x={beltX - 48} y={beltY + beltH / 2 + 4}
          textAnchor="middle" fontSize={9} fill="#94a3b8"
          transform={`rotate(-90, ${beltX - 48}, ${beltY + beltH / 2 + 4})`}>
          {widthNum > 0 ? `W = ${widthNum}"` : "Width = ?"}
        </text>

        {/* Length arrow (horizontal) */}
        <line x1={beltX} y1={beltY + beltH + 22} x2={beltX + beltW} y2={beltY + beltH + 22}
          stroke="#94a3b8" strokeWidth={1} markerEnd="url(#wArr)" markerStart="url(#wArrL)" />
        <text x={beltX + beltW / 2} y={beltY + beltH + 36}
          textAnchor="middle" fontSize={9} fill="#94a3b8" fontWeight="700">
          {lengthNum > 0 ? `L = ${lengthNum} ft` : "Length = ?"}
        </text>

        {/* Pitch indicator */}
        {pitch && pitch !== "To be confirmed by Uniking" && (
          <text x={beltX + beltW / 2} y={beltY - 8}
            textAnchor="middle" fontSize={8} fill={C.gold} fontWeight="600">
            Pitch: {pitch}
          </text>
        )}

        {/* Edge label */}
        {edgeStyle && (
          <text x={beltX + beltW + 20} y={beltY + beltH / 2 + 4}
            fontSize={8} fill="#94a3b8" fontWeight="600" dominantBaseline="middle">
            {hasChainEdge ? "Chain Edge →" : hasBead ? "Beaded →" : "Selvedge →"}
          </text>
        )}

        {/* Wire dia label */}
        {wireDiameter && (
          <text x={beltX + 12} y={beltY + beltH + 52}
            fontSize={8} fill="#94a3b8">
            Wire: {wireDiameter}
          </text>
        )}

      </svg>
    </div>
  );
}

// ── Subcategory Card ──────────────────────────────────────────────────────────

function BeltStyleCard({ style, onViewSpecs, onConfigure }) {
  const [hov, setHov] = useState(false);

  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: "#fff", borderRadius: 14,
        border: `2px solid ${hov ? C.navyMid : C.border}`,
        overflow: "hidden", transition: "all 0.18s",
        boxShadow: hov ? "0 10px 30px rgba(15,35,64,0.12)" : "0 1px 4px rgba(0,0,0,0.06)",
        transform: hov ? "translateY(-3px)" : "none",
        display: "flex", flexDirection: "column"
      }}>

      {/* Image */}
      <div style={{ height: 160, overflow: "hidden", position: "relative", background: "#f0f4f8" }}>
        <img src={style.image} alt={style.label}
          style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.3s", transform: hov ? "scale(1.04)" : "scale(1)" }}
          onError={(e) => { e.target.style.display = "none"; }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(15,35,64,0.75) 0%, transparent 55%)" }} />
        <div style={{ position: "absolute", bottom: 10, left: 14 }}>
          <div style={{ color: "#fff", fontSize: 13, fontWeight: 800, lineHeight: 1.2 }}>{style.label}</div>
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: "12px 14px", flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
        <p style={{ fontSize: 12, color: C.muted, lineHeight: 1.6, margin: 0 }}>{style.description}</p>

        <div>
          <div style={{ fontSize: 10, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: 4 }}>Applications</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
            {style.applications.slice(0, 3).map(a => (
              <span key={a} style={{ background: "#eef3f8", color: C.navyMid, fontSize: 10, fontWeight: 600, padding: "2px 7px", borderRadius: 10 }}>{a}</span>
            ))}
            {style.applications.length > 3 && (
              <span style={{ background: "#f1f5f9", color: C.muted, fontSize: 10, padding: "2px 7px", borderRadius: 10 }}>+{style.applications.length - 3} more</span>
            )}
          </div>
        </div>

        <div>
          <div style={{ fontSize: 10, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: 4 }}>Key Advantages</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
            {style.advantages.slice(0, 3).map(a => (
              <span key={a} style={{ background: "#f0fdf4", color: "#16a34a", fontSize: 10, fontWeight: 600, padding: "2px 7px", borderRadius: 10 }}>✓ {a}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div style={{ padding: "10px 14px", borderTop: "1px solid " + C.border, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        <button onClick={() => onViewSpecs(style)}
          style={{ padding: "8px", background: "#f1f5f9", color: C.navyMid, border: "none", borderRadius: 8, cursor: "pointer", fontSize: 12, fontWeight: 700 }}>
          View Specs
        </button>
        <button onClick={() => onConfigure(style)}
          style={{ padding: "8px", background: C.navyMid, color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontSize: 12, fontWeight: 800 }}>
          Configure →
        </button>
      </div>
    </div>
  );
}

// ── Specs Modal ────────────────────────────────────────────────────────────

function SpecsModal({ style, onConfigure, onClose }) {
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.65)", zIndex: 1000, display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "16px", overflowY: "auto" }}>
      <div onClick={e => e.stopPropagation()} style={{ background: "#fff", borderRadius: 16, width: "100%", maxWidth: 680, boxShadow: "0 24px 80px rgba(0,0,0,0.3)", marginBottom: 16 }}>

        <div style={{ background: C.navyMid, borderRadius: "16px 16px 0 0", padding: "20px 24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ color: C.gold, fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 4 }}>Wire Mesh Belt</div>
            <div style={{ color: "#fff", fontSize: 18, fontWeight: 900 }}>{style.label}</div>
          </div>
          <button onClick={onClose} style={{ background: "rgba(255,255,255,0.15)", border: "none", borderRadius: "50%", width: 34, height: 34, cursor: "pointer", color: "#fff", fontSize: 18 }}>✕</button>
        </div>

        <div style={{ padding: "20px 24px" }}>
          <p style={{ fontSize: 14, color: C.text, lineHeight: 1.75, marginBottom: 20 }}>{style.description}</p>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>

            {[
              ["Applications", style.applications],
              ["Advantages", style.advantages],
            ].map(([title, items]) => (
              <div key={title}>
                <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 8 }}>{title}</div>
                {items.map(item => (
                  <div key={item} style={{ fontSize: 13, color: C.text, marginBottom: 4, display: "flex", alignItems: "flex-start", gap: 6 }}>
                    <span style={{ color: C.navyMid, marginTop: 2, flexShrink: 0 }}>•</span>{item}
                  </div>
                ))}
              </div>
            ))}
          </div>

          <div style={{ background: C.bg, borderRadius: 10, padding: "14px 16px", marginBottom: 20 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 10 }}>Available Options</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, fontSize: 12, color: C.text }}>
              <div>
                <div style={{ fontWeight: 700, color: C.navyMid, marginBottom: 4 }}>Pitch Options</div>
                {style.pitchOptions.map(p => <div key={p} style={{ color: C.muted, marginBottom: 2 }}>• {p}</div>)}
              </div>
              <div>
                <div style={{ fontWeight: 700, color: C.navyMid, marginBottom: 4 }}>Wire Gauges</div>
                {style.wireGauges.map(g => <div key={g} style={{ color: C.muted, marginBottom: 2 }}>• {g}</div>)}
              </div>
              <div>
                <div style={{ fontWeight: 700, color: C.navyMid, marginBottom: 4 }}>Edge Styles</div>
                {style.edgeOptions.map(e => <div key={e} style={{ color: C.muted, marginBottom: 2 }}>• {e}</div>)}
              </div>
              <div>
                <div style={{ fontWeight: 700, color: C.navyMid, marginBottom: 4 }}>Drive Methods</div>
                {style.driveOptions.map(d => <div key={d} style={{ color: C.muted, marginBottom: 2 }}>• {d}</div>)}
              </div>
            </div>
          </div>

          <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 8, padding: "10px 14px", fontSize: 12, color: "#92400e", marginBottom: 20 }}>
            <strong>Note:</strong> Final belt selection and specifications must be confirmed by Uniking before production. Dimensions and mesh openings to be verified against your conveyor drawings.
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={onClose} style={{ flex: 1, padding: "11px", background: "#f1f5f9", color: C.navyMid, border: "none", borderRadius: 10, cursor: "pointer", fontSize: 13, fontWeight: 700 }}>Close</button>
            <button onClick={() => { onClose(); onConfigure(style); }}
              style={{ flex: 2, padding: "11px", background: C.navyMid, color: "#fff", border: "none", borderRadius: 10, cursor: "pointer", fontSize: 13, fontWeight: 800 }}>
              Configure This Belt →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Configurator Wizard ───────────────────────────────────────────────────────

const STEPS = [
  "Belt Style", "Application", "Equipment", "Width",
  "Length", "Mesh / Pitch", "Wire", "Edge", "Drive",
  "Material", "Environment", "Product", "Quantity", "Uploads", "Notes", "Review"
];

const INDUSTRIES = [
  "Food & Beverage", "Bakery", "Seafood & Poultry", "Snack Food",
  "Heat Treating / Metal", "Pharmaceutical", "Automotive", "Packaging",
  "Chemical / Industrial", "Other"
];
const EQUIPMENT_TYPES = [
  "Straight conveyor", "Spiral conveyor / freezer tower", "Curved conveyor",
  "Oven / dryer", "Blancher / cooker", "Freezer tunnel", "Washer / rinser",
  "Other — please specify in notes"
];
const TEMP_ENVS = [
  "Ambient (< 100°F / 38°C)", "Moderate heat (100–400°F / 38–200°C)",
  "High heat (400–1000°F / 200–540°C)", "Very high heat (> 1000°F / 540°C)",
  "Freezing (below 0°F / -18°C)", "Wet / washdown", "Caustic / chemical"
];

function Wizard({ initialStyle, onComplete, onClose }) {
  const [step, setStep] = useState(initialStyle ? 1 : 0);
  const [config, setConfig] = useState({
    beltStyle: initialStyle?.key || "",
    industry: "", equipmentType: "",
    beltWidth: "", beltLength: "",
    pitch: "", meshSpec: "",
    wireDiameter: "", wireGauge: "",
    edgeStyle: "", driveMethod: "",
    material: "", tempEnv: "",
    product: "", quantity: "1", quantityUnit: "Each",
    uploads: [], notes: ""
  });
  const fileInputRef = useRef();

  const currentStyle = BELT_STYLES.find(s => s.key === config.beltStyle);

  function update(field, val) { setConfig(p => ({ ...p, [field]: val })); }
  function next() { setStep(s => Math.min(s + 1, STEPS.length - 1)); }
  function back() { setStep(s => Math.max(s - 1, 0)); }

  const Header = () => (
    <div style={{ background: `linear-gradient(135deg, ${C.navy}, ${C.navyMid})`, padding: "14px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <div>
        <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 11, marginBottom: 2 }}>
          Wire Mesh Belt Configurator — Step {step + 1} of {STEPS.length}
        </div>
        <div style={{ color: "#fff", fontSize: 14, fontWeight: 700 }}>{STEPS[step]}</div>
      </div>
      <button onClick={onClose} style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.3)", color: "#fff", cursor: "pointer", borderRadius: 8, padding: "6px 14px", fontSize: 13, fontWeight: 700 }}>✕ Exit</button>
    </div>
  );

  const ProgressBar = () => (
    <div style={{ background: "#e5e7eb", height: 4, borderRadius: 0 }}>
      <div style={{ background: C.gold, height: "100%", width: `${((step + 1) / STEPS.length) * 100}%`, transition: "width 0.3s", borderRadius: 0 }} />
    </div>
  );

  const NavButtons = ({ canNext = true, nextLabel = "Next →" }) => (
    <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
      {step > 0 && (
        <button onClick={back} style={{ background: "#f1f5f9", border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 20px", cursor: "pointer", fontSize: 13 }}>← Back</button>
      )}
      <button onClick={next} disabled={!canNext}
        style={{ flex: 1, background: canNext ? C.navyMid : "#e5e7eb", color: canNext ? "#fff" : C.muted, border: "none", borderRadius: 8, padding: "12px 24px", cursor: canNext ? "pointer" : "default", fontSize: 13, fontWeight: 700 }}>
        {nextLabel}
      </button>
    </div>
  );

  const SkipLink = ({ label = "I don't know / Skip" }) => (
    <button onClick={next} style={{ background: "none", border: "none", color: C.muted, fontSize: 12, cursor: "pointer", marginTop: 8, textDecoration: "underline" }}>
      {label}
    </button>
  );

  const OptionBtn = ({ label, selected, onClick }) => (
    <button onClick={onClick}
      style={{ background: selected ? C.navyMid : "#f1f5f9", color: selected ? "#fff" : C.text, border: `2px solid ${selected ? C.navyMid : C.border}`, borderRadius: 10, padding: "10px 14px", cursor: "pointer", textAlign: "left", fontSize: 13, fontWeight: selected ? 700 : 400, transition: "all 0.15s" }}>
      {label}
    </button>
  );

  const SLabel = ({ children, note }) => (
    <div style={{ fontWeight: 700, fontSize: 12, color: C.muted, textTransform: "uppercase", letterSpacing: "0.4px", marginBottom: 6, marginTop: 14 }}>
      {children}{note && <span style={{ fontWeight: 400, marginLeft: 6, color: "#94a3b8" }}>— {note}</span>}
    </div>
  );

  // ── Step 0: Belt Style ────────────────────────────────────────────────────
  if (step === 0) return (
    <div>
      <Header /><ProgressBar />
      <div style={{ padding: 20, maxHeight: "70vh", overflowY: "auto" }}>
        <div style={{ fontSize: 15, fontWeight: 800, color: C.navyMid, marginBottom: 4 }}>What belt style do you need?</div>
        <div style={{ color: C.muted, fontSize: 12, marginBottom: 16 }}>Select the wire mesh construction that best fits your application.</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {BELT_STYLES.map(s => (
            <button key={s.key} onClick={() => { update("beltStyle", s.key); setTimeout(next, 120); }}
              style={{ background: config.beltStyle === s.key ? C.navyMid : "#fff", border: `2px solid ${config.beltStyle === s.key ? C.navyMid : C.border}`, borderRadius: 10, padding: "12px 16px", cursor: "pointer", textAlign: "left", display: "flex", alignItems: "center", gap: 12, transition: "all 0.15s" }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: config.beltStyle === s.key ? "#fff" : C.text }}>{s.label}</div>
                <div style={{ fontSize: 11, color: config.beltStyle === s.key ? "rgba(255,255,255,0.7)" : C.muted, marginTop: 2 }}>{s.description.slice(0, 70)}…</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  // ── Step 1: Application / Industry ────────────────────────────────────────
  if (step === 1) return (
    <div>
      <Header /><ProgressBar />
      <div style={{ padding: 20, maxHeight: "70vh", overflowY: "auto" }}>
        <WireMeshSchematic config={config} />
        <div style={{ fontSize: 15, fontWeight: 800, color: C.navyMid, marginBottom: 4 }}>What industry / application?</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 10 }}>
          {INDUSTRIES.map(ind => (
            <OptionBtn key={ind} label={ind} selected={config.industry === ind} onClick={() => update("industry", ind)} />
          ))}
        </div>
        <NavButtons canNext={!!config.industry} />
        <div style={{ textAlign: "center" }}><SkipLink /></div>
      </div>
    </div>
  );

  // ── Step 2: Equipment Type ─────────────────────────────────────────────────
  if (step === 2) return (
    <div>
      <Header /><ProgressBar />
      <div style={{ padding: 20, maxHeight: "70vh", overflowY: "auto" }}>
        <WireMeshSchematic config={config} />
        <div style={{ fontSize: 15, fontWeight: 800, color: C.navyMid, marginBottom: 4 }}>What type of conveyor or equipment?</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 10 }}>
          {EQUIPMENT_TYPES.map(eq => (
            <OptionBtn key={eq} label={eq} selected={config.equipmentType === eq} onClick={() => update("equipmentType", eq)} />
          ))}
        </div>
        <NavButtons canNext={!!config.equipmentType} />
        <div style={{ textAlign: "center" }}><SkipLink /></div>
      </div>
    </div>
  );

  // ── Step 3: Belt Width ─────────────────────────────────────────────────────
  if (step === 3) return (
    <div>
      <Header /><ProgressBar />
      <div style={{ padding: 20, maxHeight: "70vh", overflowY: "auto" }}>
        <WireMeshSchematic config={config} />
        <div style={{ fontSize: 15, fontWeight: 800, color: C.navyMid, marginBottom: 4 }}>Belt Width</div>
        <SLabel note="inside measurement between edges">Belt Width (inches)</SLabel>
        <input type="number" value={config.beltWidth} onChange={e => update("beltWidth", e.target.value)}
          placeholder='e.g. 36 (for 36" wide belt)'
          style={{ width: "100%", boxSizing: "border-box", padding: "10px 14px", borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 14, outline: "none" }} />
        <NavButtons canNext={!!config.beltWidth} />
        <div style={{ textAlign: "center" }}><SkipLink label="I don't know yet" /></div>
      </div>
    </div>
  );

  // ── Step 4: Belt Length ────────────────────────────────────────────────────
  if (step === 4) return (
    <div>
      <Header /><ProgressBar />
      <div style={{ padding: 20, maxHeight: "70vh", overflowY: "auto" }}>
        <WireMeshSchematic config={config} />
        <div style={{ fontSize: 15, fontWeight: 800, color: C.navyMid, marginBottom: 4 }}>Belt Length</div>
        <SLabel>Conveyor Length / Belt Running Length (feet)</SLabel>
        <input type="number" value={config.beltLength} onChange={e => update("beltLength", e.target.value)}
          placeholder="e.g. 20 (feet)"
          style={{ width: "100%", boxSizing: "border-box", padding: "10px 14px", borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 14, outline: "none" }} />
        <div style={{ marginTop: 8, fontSize: 12, color: C.muted, background: "#eff6ff", borderRadius: 6, padding: "8px 12px" }}>
          ℹ The total belt length (including return) will be calculated based on conveyor length. Uniking will confirm before production.
        </div>
        <NavButtons canNext={!!config.beltLength} />
        <div style={{ textAlign: "center" }}><SkipLink label="I don't know yet" /></div>
      </div>
    </div>
  );

  // ── Step 5: Pitch / Mesh ───────────────────────────────────────────────────
  if (step === 5) return (
    <div>
      <Header /><ProgressBar />
      <div style={{ padding: 20, maxHeight: "70vh", overflowY: "auto" }}>
        <WireMeshSchematic config={config} />
        <div style={{ fontSize: 15, fontWeight: 800, color: C.navyMid, marginBottom: 4 }}>Pitch / Opening / Mesh Specification</div>
        {currentStyle && (
          <>
            <SLabel>Pitch Option</SLabel>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 10 }}>
              {currentStyle.pitchOptions.map(p => (
                <button key={p} onClick={() => update("pitch", p)}
                  style={{ background: config.pitch === p ? C.navyMid : "#f1f5f9", color: config.pitch === p ? "#fff" : C.text, border: `2px solid ${config.pitch === p ? C.navyMid : C.border}`, borderRadius: 8, padding: "8px 14px", cursor: "pointer", fontSize: 13, fontWeight: config.pitch === p ? 700 : 400 }}>
                  {p}
                </button>
              ))}
            </div>
          </>
        )}
        <SLabel>Additional Mesh Specification</SLabel>
        <input type="text" value={config.meshSpec} onChange={e => update("meshSpec", e.target.value)}
          placeholder="e.g. 3/4 inch pitch, 14 gauge, compound balanced…"
          style={{ width: "100%", boxSizing: "border-box", padding: "10px 14px", borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 13, outline: "none" }} />
        <NavButtons canNext={true} />
        <div style={{ textAlign: "center" }}><SkipLink /></div>
      </div>
    </div>
  );

  // ── Step 6: Wire Diameter / Gauge ─────────────────────────────────────────
  if (step === 6) return (
    <div>
      <Header /><ProgressBar />
      <div style={{ padding: 20, maxHeight: "70vh", overflowY: "auto" }}>
        <div style={{ fontSize: 15, fontWeight: 800, color: C.navyMid, marginBottom: 4 }}>Wire Diameter or Gauge</div>
        {currentStyle && (
          <>
            <SLabel>Wire Gauge</SLabel>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
              {currentStyle.wireGauges.map(g => (
                <button key={g} onClick={() => update("wireGauge", g)}
                  style={{ background: config.wireGauge === g ? C.navyMid : "#f1f5f9", color: config.wireGauge === g ? "#fff" : C.text, border: `2px solid ${config.wireGauge === g ? C.navyMid : C.border}`, borderRadius: 8, padding: "8px 14px", cursor: "pointer", fontSize: 13, fontWeight: config.wireGauge === g ? 700 : 400 }}>
                  {g}
                </button>
              ))}
              <button onClick={() => update("wireGauge", "")}
                style={{ background: !config.wireGauge ? "#fef3c7" : "#f1f5f9", color: !config.wireGauge ? "#92400e" : C.muted, border: `2px solid ${!config.wireGauge ? "#f59e0b" : C.border}`, borderRadius: 8, padding: "8px 14px", cursor: "pointer", fontSize: 13 }}>
                I don't know
              </button>
            </div>
          </>
        )}
        <SLabel>Wire Diameter (if known)</SLabel>
        <input type="text" value={config.wireDiameter} onChange={e => update("wireDiameter", e.target.value)}
          placeholder='e.g. 0.080" or 2mm'
          style={{ width: "100%", boxSizing: "border-box", padding: "10px 14px", borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 13, outline: "none" }} />
        <NavButtons canNext={true} />
      </div>
    </div>
  );

  // ── Step 7: Edge / Selvedge ───────────────────────────────────────────────
  if (step === 7) return (
    <div>
      <Header /><ProgressBar />
      <div style={{ padding: 20, maxHeight: "70vh", overflowY: "auto" }}>
        <WireMeshSchematic config={config} />
        <div style={{ fontSize: 15, fontWeight: 800, color: C.navyMid, marginBottom: 4 }}>Edge / Selvedge Style</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 10 }}>
          {(currentStyle?.edgeOptions || ["Welded selvedge", "Clinched edge", "Chain edge", "Beaded edge"]).map(e => (
            <OptionBtn key={e} label={e} selected={config.edgeStyle === e} onClick={() => update("edgeStyle", e)} />
          ))}
          <OptionBtn label="I don't know — to be confirmed by Uniking" selected={config.edgeStyle === "TBD"} onClick={() => update("edgeStyle", "TBD")} />
        </div>
        <NavButtons canNext={true} />
      </div>
    </div>
  );

  // ── Step 8: Drive Method ──────────────────────────────────────────────────
  if (step === 8) return (
    <div>
      <Header /><ProgressBar />
      <div style={{ padding: 20, maxHeight: "70vh", overflowY: "auto" }}>
        <WireMeshSchematic config={config} />
        <div style={{ fontSize: 15, fontWeight: 800, color: C.navyMid, marginBottom: 4 }}>Drive Method</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 10 }}>
          {(currentStyle?.driveOptions || ["Sprocket drive", "Friction / drum drive", "Chain drive"]).map(d => (
            <OptionBtn key={d} label={d} selected={config.driveMethod === d} onClick={() => update("driveMethod", d)} />
          ))}
          <OptionBtn label="I don't know — to be confirmed by Uniking" selected={config.driveMethod === "TBD"} onClick={() => update("driveMethod", "TBD")} />
        </div>
        <NavButtons canNext={true} />
      </div>
    </div>
  );

  // ── Step 9: Material ──────────────────────────────────────────────────────
  if (step === 9) return (
    <div>
      <Header /><ProgressBar />
      <div style={{ padding: 20, maxHeight: "70vh", overflowY: "auto" }}>
        <div style={{ fontSize: 15, fontWeight: 800, color: C.navyMid, marginBottom: 4 }}>Wire Material</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 10 }}>
          {(currentStyle?.materials || ["304 Stainless Steel", "316 Stainless Steel", "Carbon Steel", "Inconel"]).map(m => (
            <OptionBtn key={m} label={m} selected={config.material === m} onClick={() => update("material", m)} />
          ))}
          <OptionBtn label="I don't know — to be confirmed by Uniking" selected={config.material === "TBD"} onClick={() => update("material", "TBD")} />
        </div>
        <NavButtons canNext={!!config.material} />
      </div>
    </div>
  );

  // ── Step 10: Temperature / Environment ───────────────────────────────────
  if (step === 10) return (
    <div>
      <Header /><ProgressBar />
      <div style={{ padding: 20, maxHeight: "70vh", overflowY: "auto" }}>
        <div style={{ fontSize: 15, fontWeight: 800, color: C.navyMid, marginBottom: 4 }}>Temperature / Operating Environment</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 10 }}>
          {TEMP_ENVS.map(t => (
            <OptionBtn key={t} label={t} selected={config.tempEnv === t} onClick={() => update("tempEnv", t)} />
          ))}
          <OptionBtn label="I don't know" selected={config.tempEnv === "TBD"} onClick={() => update("tempEnv", "TBD")} />
        </div>
        <NavButtons canNext={!!config.tempEnv} />
      </div>
    </div>
  );

  // ── Step 11: Product Being Conveyed ───────────────────────────────────────
  if (step === 11) return (
    <div>
      <Header /><ProgressBar />
      <div style={{ padding: 20, maxHeight: "70vh", overflowY: "auto" }}>
        <div style={{ fontSize: 15, fontWeight: 800, color: C.navyMid, marginBottom: 4 }}>Product Being Conveyed</div>
        <div style={{ color: C.muted, fontSize: 12, marginBottom: 14 }}>Helps us select the right belt surface, opening size and material compatibility.</div>
        <textarea value={config.product} onChange={e => update("product", e.target.value)}
          placeholder="e.g. Frozen chicken pieces, biscuits, automotive parts, glass bottles…"
          rows={3}
          style={{ width: "100%", boxSizing: "border-box", padding: "10px 14px", borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 13, outline: "none", resize: "vertical" }} />
        <NavButtons canNext={true} />
        <div style={{ textAlign: "center" }}><SkipLink /></div>
      </div>
    </div>
  );

  // ── Step 12: Quantity ─────────────────────────────────────────────────────
  if (step === 12) return (
    <div>
      <Header /><ProgressBar />
      <div style={{ padding: 20 }}>
        <div style={{ fontSize: 15, fontWeight: 800, color: C.navyMid, marginBottom: 4 }}>Quantity</div>
        <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
          {["Each", "Belts", "Feet", "Sets"].map(u => (
            <button key={u} onClick={() => update("quantityUnit", u)}
              style={{ flex: 1, background: config.quantityUnit === u ? C.navyMid : "#f1f5f9", color: config.quantityUnit === u ? "#fff" : C.text, border: `2px solid ${config.quantityUnit === u ? C.navyMid : C.border}`, borderRadius: 8, padding: "8px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
              {u}
            </button>
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button onClick={() => update("quantity", String(Math.max(1, parseInt(config.quantity) - 1)))}
            style={{ width: 38, height: 38, borderRadius: 8, border: `1px solid ${C.border}`, background: "#fff", cursor: "pointer", fontSize: 20 }}>−</button>
          <input type="number" value={config.quantity} min="1" onChange={e => update("quantity", e.target.value)}
            style={{ width: 72, textAlign: "center", padding: "8px", borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 16, fontWeight: 700, outline: "none" }} />
          <button onClick={() => update("quantity", String(parseInt(config.quantity) + 1))}
            style={{ width: 38, height: 38, borderRadius: 8, border: `1px solid ${C.border}`, background: "#fff", cursor: "pointer", fontSize: 20 }}>+</button>
          <span style={{ fontSize: 13, color: C.muted }}>{config.quantityUnit}</span>
        </div>
        <NavButtons canNext={true} />
      </div>
    </div>
  );

  // ── Step 13: Uploads ──────────────────────────────────────────────────────
  if (step === 13) return (
    <div>
      <Header /><ProgressBar />
      <div style={{ padding: 20 }}>
        <div style={{ fontSize: 15, fontWeight: 800, color: C.navyMid, marginBottom: 4 }}>Upload Photos, Drawings or Existing Belt Details</div>
        <div style={{ color: C.muted, fontSize: 12, marginBottom: 16 }}>Attach images, DWG files, spec sheets or photos of your existing belt to help us match the replacement exactly. (Optional)</div>
        <div
          onClick={() => fileInputRef.current?.click()}
          style={{ border: "2px dashed " + C.border, borderRadius: 10, padding: "28px 20px", textAlign: "center", background: C.bg, cursor: "pointer", marginBottom: 12 }}>
          <div style={{ fontSize: 28, marginBottom: 8 }}>📎</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: C.navyMid }}>Tap to attach files</div>
          <div style={{ fontSize: 12, color: C.muted, marginTop: 4 }}>Images, PDFs, DWG, CAD…</div>
          <input ref={fileInputRef} type="file" multiple accept="*/*" style={{ display: "none" }}
            onChange={e => update("uploads", [...config.uploads, ...Array.from(e.target.files).filter(f => f.size <= 15 * 1024 * 1024)])} />
        </div>
        {config.uploads.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 12 }}>
            {config.uploads.map((f, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", background: "#f8fafc", borderRadius: 8, border: `1px solid ${C.border}` }}>
                <span style={{ fontSize: 18 }}>{f.type.startsWith("image/") ? "🖼️" : "📄"}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navyMid, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{f.name}</div>
                  <div style={{ fontSize: 11, color: C.muted }}>{(f.size / 1024).toFixed(0)} KB</div>
                </div>
                <button onClick={() => update("uploads", config.uploads.filter((_, j) => j !== i))}
                  style={{ background: "none", border: "none", color: "#9ca3af", cursor: "pointer", fontSize: 20 }}>×</button>
              </div>
            ))}
          </div>
        )}
        <NavButtons canNext={true} nextLabel="Continue →" />
      </div>
    </div>
  );

  // ── Step 14: Notes ────────────────────────────────────────────────────────
  if (step === 14) return (
    <div>
      <Header /><ProgressBar />
      <div style={{ padding: 20 }}>
        <div style={{ fontSize: 15, fontWeight: 800, color: C.navyMid, marginBottom: 4 }}>Additional Notes</div>
        <div style={{ color: C.muted, fontSize: 12, marginBottom: 12 }}>Any special requirements, replacement belt details, critical dimensions, or anything else Uniking should know.</div>
        <textarea value={config.notes} onChange={e => update("notes", e.target.value)}
          placeholder="e.g. Replacing Ashworth Omni-Grid belt, existing belt is 36&quot; wide × 24 ft, replacing due to stretched spirals…"
          rows={5}
          style={{ width: "100%", boxSizing: "border-box", padding: "12px 14px", borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 13, outline: "none", resize: "vertical" }} />
        <NavButtons canNext={true} nextLabel="Review Summary →" />
      </div>
    </div>
  );

  // ── Step 15: Review ───────────────────────────────────────────────────────
  if (step === 15) {
    const styleObj = BELT_STYLES.find(s => s.key === config.beltStyle);
    const fields = [
      ["Belt Style", styleObj?.label || config.beltStyle],
      ["Industry", config.industry],
      ["Equipment", config.equipmentType],
      ["Width", config.beltWidth ? `${config.beltWidth}"` : ""],
      ["Length", config.beltLength ? `${config.beltLength} ft` : ""],
      ["Pitch", config.pitch],
      ["Mesh Spec", config.meshSpec],
      ["Wire Gauge", config.wireGauge],
      ["Wire Diameter", config.wireDiameter],
      ["Edge Style", config.edgeStyle === "TBD" ? "To be confirmed by Uniking" : config.edgeStyle],
      ["Drive Method", config.driveMethod === "TBD" ? "To be confirmed by Uniking" : config.driveMethod],
      ["Material", config.material === "TBD" ? "To be confirmed by Uniking" : config.material],
      ["Temp / Environment", config.tempEnv === "TBD" ? "To be confirmed by Uniking" : config.tempEnv],
      ["Product Conveyed", config.product],
      ["Quantity", `${config.quantity} ${config.quantityUnit}`],
      ["Notes", config.notes],
    ].filter(([, v]) => v && v.trim());

    const summaryText = fields.map(([k, v]) => `${k}: ${v}`).join(" | ");

    function handlePrintTearSheet() {
      const html = `<!DOCTYPE html><html><head><title>Wire Mesh Belt — ${styleObj?.label}</title>
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family:'Segoe UI',Arial,sans-serif; color:#111; background:#fff; }
  @media print { body { -webkit-print-color-adjust:exact; print-color-adjust:exact; } }
  .header { background:#0f2340; color:#fff; padding:22px 32px; display:flex; align-items:center; justify-content:space-between; }
  .accent-bar { height:4px; background:linear-gradient(90deg,#C9A84C,#1a3a5c); }
  .body { padding:24px 32px; }
  h1 { font-size:24px; font-weight:900; color:#0f2340; margin-bottom:4px; }
  .subtitle { font-size:13px; color:#64748b; margin-bottom:20px; }
  table { width:100%; border-collapse:collapse; font-size:12px; margin-bottom:20px; }
  thead tr { background:#0f2340; }
  thead th { padding:8px 12px; color:#fff; font-weight:700; text-align:left; }
  tbody tr:nth-child(even) { background:#f8fafc; }
  tbody td { padding:8px 12px; border-bottom:1px solid #e5e7eb; }
  tbody td:first-child { font-weight:600; color:#0f2340; width:35%; }
  .warn { background:#fffbeb; border:1px solid #fde68a; border-radius:6px; padding:10px 14px; font-size:11px; color:#92400e; margin:16px 0; }
  .footer { margin-top:20px; padding-top:12px; border-top:1px solid #e5e7eb; display:flex; justify-content:space-between; font-size:10px; color:#94a3b8; }
  .no-print { margin:16px 32px; display:flex; gap:10px; }
  @media print { .no-print { display:none !important; } }
  .btn { padding:8px 18px; border:none; border-radius:6px; cursor:pointer; font-size:13px; font-weight:700; }
  .btn-primary { background:#0f2340; color:#fff; }
  .btn-secondary { background:#f1f5f9; color:#334155; border:1px solid #e2e8f0; }
</style></head><body>
<div class="no-print">
  <button class="btn btn-primary" onclick="window.print()">Print / Save PDF</button>
  <button class="btn btn-secondary" onclick="window.close()">Close</button>
</div>
<div class="header">
  <img src="${LOGO}" style="max-height:38px;filter:brightness(0) invert(1);opacity:0.92;" alt="Uniking Canada"/>
  <div style="text-align:right;font-size:11px;color:rgba(255,255,255,0.55)">
    <div style="font-size:14px;font-weight:700;color:#fff;">Wire Mesh Belt Configuration</div>
    <div>${new Date().toLocaleDateString("en-CA", { year: "numeric", month: "long", day: "numeric" })}</div>
  </div>
</div>
<div class="accent-bar"></div>
<div class="body">
  <h1>${styleObj?.label || "Wire Mesh Belt"}</h1>
  <div class="subtitle">Wire Mesh Conveyor Belt — Uniking Canada Configuration Sheet</div>
  <div class="warn">⚠ Final belt selection and specifications must be confirmed by Uniking before production. Dimensions and mesh openings to be verified against your conveyor drawings.</div>
  <table>
    <thead><tr><th>Parameter</th><th>Specified Value</th></tr></thead>
    <tbody>
      ${fields.map(([k, v]) => `<tr><td>${k}</td><td>${v}</td></tr>`).join("")}
    </tbody>
  </table>
  ${config.uploads.length > 0 ? `<div style="margin-bottom:16px;font-size:12px;color:#334155"><strong>Attachments included:</strong> ${config.uploads.map(f => f.name).join(", ")}</div>` : ""}
  <div class="footer">
    <div>
      unikingcanada.com · rfq@unikingcanada.com<br/>
      <span style="font-size:9px;text-transform:uppercase;letter-spacing:1px;color:#cbd5e1;">No pricing information included</span>
    </div>
    <div style="text-align:right">Wire Mesh Belt · ${styleObj?.label || ""}</div>
  </div>
</div>
</body></html>`;
      const blob = new Blob([html], { type: "text/html" });
      window.open(URL.createObjectURL(blob), "_blank");
    }

    function handleAddRFQ() {
      const cart = JSON.parse(localStorage.getItem("uniking_rfq_cart") || "[]");
      cart.push({
        cartId: "wiremesh_" + Date.now(),
        id: "wiremesh_" + Date.now(),
        _source: "wiremesh_config",
        series: styleObj?.label || "Wire Mesh Belt",
        name: styleObj?.label || "Wire Mesh Belt",
        type: "Wire Mesh Belt",
        style: config.edgeStyle || "",
        category: config.industry || "Wire Mesh Belt",
        image_url: styleObj?.image || "",
        materials: config.material || "",
        quantity: parseInt(config.quantity) || 1,
        unit: config.quantityUnit || "Each",
        notes: summaryText
      });
      localStorage.setItem("uniking_rfq_cart", JSON.stringify(cart));
      window.dispatchEvent(new Event("rfq_cart_updated"));
      onComplete(config);
    }

    return (
      <div>
        <Header /><ProgressBar />
        <div style={{ padding: 20, maxHeight: "70vh", overflowY: "auto" }}>
          <WireMeshSchematic config={config} />
          <div style={{ fontSize: 15, fontWeight: 800, color: C.navyMid, marginBottom: 12 }}>Configuration Summary</div>

          <div style={{ background: C.bg, borderRadius: 10, border: `1px solid ${C.border}`, overflow: "hidden", marginBottom: 16 }}>
            {fields.map(([k, v], i) => (
              <div key={k} style={{ display: "flex", gap: 12, padding: "8px 14px", background: i % 2 === 0 ? "#f8fafc" : "#fff", borderBottom: i < fields.length - 1 ? `1px solid ${C.border}` : "none" }}>
                <span style={{ fontSize: 12, color: C.muted, fontWeight: 600, width: 130, flexShrink: 0 }}>{k}</span>
                <span style={{ fontSize: 12, color: C.text, flex: 1 }}>{v}</span>
              </div>
            ))}
          </div>

          {config.uploads.length > 0 && (
            <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 8, padding: "10px 14px", fontSize: 12, color: "#166534", marginBottom: 12 }}>
              📎 {config.uploads.length} file{config.uploads.length !== 1 ? "s" : ""} attached: {config.uploads.map(f => f.name).join(", ")}
            </div>
          )}

          <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 8, padding: "10px 14px", fontSize: 12, color: "#92400e", marginBottom: 14 }}>
            <strong>Disclaimer:</strong> Final belt selection and specifications must be confirmed by Uniking before production.
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={back} style={{ background: "#f1f5f9", border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 16px", cursor: "pointer", fontSize: 13 }}>← Back</button>
            <button onClick={handlePrintTearSheet}
              style={{ flex: 1, padding: "11px", background: C.gold, color: C.navy, border: "none", borderRadius: 10, cursor: "pointer", fontSize: 13, fontWeight: 800 }}>
              Print Tear Sheet
            </button>
            <button onClick={handleAddRFQ}
              style={{ flex: 2, padding: "11px", background: C.green, color: "#fff", border: "none", borderRadius: 10, cursor: "pointer", fontSize: 14, fontWeight: 800 }}>
              Add to RFQ ✓
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

// ── Main Wire Mesh Configurator View ─────────────────────────────────────────

export default function WireMeshConfigurator({ onBack, onGoRFQ }) {
  const [viewingStyle, setViewingStyle] = useState(null);
  const [configuringStyle, setConfiguringStyle] = useState(null);
  const [rfqAdded, setRfqAdded] = useState(false);

  function handleComplete() {
    setConfiguringStyle(null);
    setRfqAdded(true);
    setTimeout(() => setRfqAdded(false), 4000);
  }

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "'Inter','Segoe UI',Arial,sans-serif" }}>

      {/* Top Nav */}
      <div style={{ background: C.navy, borderBottom: `3px solid ${C.gold}`, position: "sticky", top: 0, zIndex: 200 }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 clamp(12px,4vw,20px)", display: "flex", alignItems: "center", justifyContent: "space-between", height: 56 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <a href="#" onClick={(e) => { e.preventDefault(); onBack(); }} style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 28, height: 28, background: C.gold, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ color: C.navy, fontWeight: 900, fontSize: 13 }}>U</span>
              </div>
              <span style={{ color: "#fff", fontWeight: 700, fontSize: 15 }}>UniKonnect</span>
            </a>
            <div style={{ width: 1, height: 22, background: "rgba(255,255,255,0.15)" }} />
            <span style={{ color: C.gold, fontSize: 13, fontWeight: 600 }}>Wire Mesh Belt Configurator</span>
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            {rfqAdded && (
              <span style={{ background: C.green, color: "#fff", padding: "5px 12px", borderRadius: 8, fontSize: 12, fontWeight: 700 }}>✓ Added to RFQ</span>
            )}
            <a href="#" onClick={(e) => { e.preventDefault(); onGoRFQ(); }}
              style={{ background: C.gold, color: C.navy, padding: "7px 16px", borderRadius: 8, fontSize: 13, fontWeight: 700, textDecoration: "none" }}>
              RFQ Cart
            </a>
          </div>
        </div>
      </div>

      {/* Hero */}
      <div style={{ background: `linear-gradient(135deg, ${C.navy} 0%, ${C.navyLight} 100%)`, padding: "32px 20px 28px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ color: C.gold, fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", marginBottom: 6 }}>
            Ashworth · Cambridge · Lumsden · Twentebelt · Wire Belt Co.
          </div>
          <h1 style={{ color: "#fff", fontSize: 24, fontWeight: 900, margin: "0 0 8px" }}>Wire Mesh Conveyor Belting</h1>
          <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 13, margin: "0 0 16px", maxWidth: 560, lineHeight: 1.7 }}>
            Select a belt style to view specifications or use our step-by-step configurator to build your RFQ. All configurations are reviewed and confirmed by Uniking before production.
          </p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {["Food Grade 304 SS", "High-Temp Alloys", "Spiral & Flat Flex", "Custom Width & Length", "Welded / Chain Edge"].map(tag => (
              <span key={tag} style={{ background: "rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.85)", padding: "5px 12px", borderRadius: 20, fontSize: 11, fontWeight: 600 }}>{tag}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Grid */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "24px clamp(12px,4vw,28px) 80px" }}>
        <div style={{ fontSize: 13, color: C.muted, marginBottom: 20 }}>
          {BELT_STYLES.length} belt styles available. Click <strong>View Specs</strong> for full product details or <strong>Configure →</strong> to build a step-by-step RFQ.
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(270px, 1fr))", gap: 18 }}>
          {BELT_STYLES.map(style => (
            <BeltStyleCard
              key={style.key}
              style={style}
              onViewSpecs={setViewingStyle}
              onConfigure={setConfiguringStyle}
            />
          ))}
        </div>

        {/* Resources section */}
        <div style={{ marginTop: 48, background: "#fff", borderRadius: 14, border: `1px solid ${C.border}`, padding: "24px 28px" }}>
          <div style={{ fontSize: 16, fontWeight: 800, color: C.navyMid, marginBottom: 4 }}>Engineering Resources</div>
          <div style={{ fontSize: 13, color: C.muted, marginBottom: 16 }}>Product identification forms and installation guides for wire mesh belting.</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 10 }}>
            {[
              ["Flat Flex Belting ID Form", "https://unikingcanada.com/products-ressources/uniking-flat-flex-belting.pdf"],
              ["Flat Wire Belting ID Form", "https://unikingcanada.com/products-ressources/uniking-flat-wire-belting.pdf"],
              ["Mesh Belt ID Form", "https://unikingcanada.com/products-ressources/uniking-mesh-belt.pdf"],
              ["Belt Design Guidelines", "https://unikingcanada.com/products-ressources/uniking-wire-mesh-belt-design-guidelines.pdf"],
              ["Spiral Belt Installation", "https://unikingcanada.com/products-ressources/uniking-installation-of-spiral-belting.pdf"],
              ["Cleaning & Lubricating", "https://unikingcanada.com/products-ressources/uniking-cleaning-and-lubricating.pdf"],
              ["Filter Belt ID Form", "https://unikingcanada.com/products-ressources/uniking-filter-belt.pdf"],
              ["Ladder Link Sani-Grid ID Form", "https://unikingcanada.com/products-ressources/uniking-ladder-link-sani-grid-belting.pdf"],
            ].map(([label, url]) => (
              <a key={label} href={url} target="_blank" rel="noreferrer"
                style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", background: C.bg, borderRadius: 8, border: `1px solid ${C.border}`, color: C.navyMid, fontWeight: 600, fontSize: 12, textDecoration: "none" }}>
                <span style={{ fontSize: 16 }}>📄</span>{label}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Specs Modal */}
      {viewingStyle && (
        <SpecsModal
          style={viewingStyle}
          onConfigure={setConfiguringStyle}
          onClose={() => setViewingStyle(null)}
        />
      )}

      {/* Configurator Wizard */}
      {configuringStyle && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.65)", zIndex: 1100, display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "16px", overflowY: "auto" }}>
          <div style={{ background: "#fff", borderRadius: 16, width: "100%", maxWidth: 620, boxShadow: "0 24px 80px rgba(0,0,0,0.3)", marginBottom: 16 }}>
            <Wizard
              initialStyle={configuringStyle}
              onComplete={handleComplete}
              onClose={() => setConfiguringStyle(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
}