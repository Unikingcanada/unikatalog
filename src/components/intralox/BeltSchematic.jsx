/**
 * BeltSchematic — engineering-style top-down CAD view of a modular plastic belt
 * Shows actual module bricks with interlocking hinge fingers, connecting rods,
 * flights as full-width bars, and dimension callouts — like the reference drawings.
 */

function getSurfaceConfig(styleKey = "") {
  const k = styleKey.toLowerCase();
  if (k.includes("flush grid") || k.includes("flush_grid")) return { type: "flush_grid" };
  if (k.includes("open grid") || k.includes("open_grid"))   return { type: "open_grid" };
  if (k.includes("friction top") || k.includes("friction")) return { type: "friction_top" };
  if (k.includes("raised rib") || k.includes("rib"))        return { type: "raised_rib" };
  if (k.includes("perforated") || k.includes("perf"))       return { type: "perforated" };
  if (k.includes("knob"))                                   return { type: "knob_top" };
  return { type: "flat_top" };
}

/**
 * Draw a single module row at position (x, y) with given width and pitch depth.
 * Renders the interlocking finger/hinge tabs on top and bottom edges.
 */
function ModuleRow({ x, y, beltW, pitchH, surface, rowIndex, fingerW, fingerH, gap }) {
  const isEven = rowIndex % 2 === 0;
  const fill = "#e8edf2";
  const stroke = "#5a7a95";
  const strokeW = 0.8;

  // Number of fingers across width
  const fingerCount = Math.max(2, Math.floor(beltW / (fingerW + gap)));
  const totalFingersW = fingerCount * fingerW + (fingerCount - 1) * gap;
  const offsetX = (beltW - totalFingersW) / 2;

  // Module body (the flat plate)
  const bodyTop = y + fingerH;
  const bodyH = pitchH - fingerH;

  const fingers = [];
  for (let i = 0; i < fingerCount; i++) {
    const fx = x + offsetX + i * (fingerW + gap);
    // Top fingers (hinge tabs pointing up)
    fingers.push(
      <rect key={`tf${i}`} x={fx} y={y} width={fingerW} height={fingerH}
        fill={fill} stroke={stroke} strokeWidth={strokeW} />
    );
    // Hinge pin hole in finger
    fingers.push(
      <circle key={`tp${i}`} cx={fx + fingerW / 2} cy={y + fingerH * 0.55} r={fingerH * 0.22}
        fill="#b0bec8" stroke={stroke} strokeWidth={0.5} />
    );
  }

  // Surface texture inside the body
  const surfaceDetails = [];
  if (surface.type === "flush_grid") {
    // Grid of rectangular cutouts
    const cellW = (fingerW + gap) * 0.75;
    const cellH = bodyH * 0.55;
    const cols = Math.floor(beltW / (cellW + gap * 1.5));
    const totalW = cols * cellW + (cols - 1) * gap * 1.5;
    const startX = x + (beltW - totalW) / 2;
    for (let c = 0; c < cols; c++) {
      surfaceDetails.push(
        <rect key={`g${c}`}
          x={startX + c * (cellW + gap * 1.5)}
          y={bodyTop + bodyH * 0.22}
          width={cellW} height={cellH}
          fill="none" stroke={stroke} strokeWidth={0.6} rx={1} />
      );
    }
  } else if (surface.type === "open_grid") {
    // Cross-hatch lines for open mesh
    const spacing = fingerW + gap;
    for (let lx = x + spacing; lx < x + beltW - spacing * 0.5; lx += spacing) {
      surfaceDetails.push(
        <line key={`v${lx}`} x1={lx} y1={bodyTop + 2} x2={lx} y2={bodyTop + bodyH - 2}
          stroke={stroke} strokeWidth={0.5} opacity={0.6} />
      );
    }
    for (let ly = bodyTop + bodyH * 0.3; ly < bodyTop + bodyH - 2; ly += bodyH * 0.35) {
      surfaceDetails.push(
        <line key={`h${ly}`} x1={x + 2} y1={ly} x2={x + beltW - 2} y2={ly}
          stroke={stroke} strokeWidth={0.5} opacity={0.6} />
      );
    }
  } else if (surface.type === "perforated") {
    const cols = Math.floor(beltW / (fingerW + gap));
    const colW = beltW / cols;
    const r = Math.min(colW, bodyH) * 0.2;
    for (let c = 0; c < cols; c++) {
      surfaceDetails.push(
        <circle key={`p${c}`} cx={x + (c + 0.5) * colW} cy={bodyTop + bodyH / 2}
          r={r} fill="none" stroke={stroke} strokeWidth={0.5} />
      );
    }
  } else if (surface.type === "raised_rib") {
    for (let ly = bodyTop + bodyH * 0.25; ly < bodyTop + bodyH - 2; ly += bodyH * 0.3) {
      surfaceDetails.push(
        <rect key={`r${ly}`} x={x + 2} y={ly - 1.5} width={beltW - 4} height={3}
          fill="#d0d8e0" stroke={stroke} strokeWidth={0.4} rx={1} />
      );
    }
  } else if (surface.type === "friction_top") {
    // Rubber insert rectangle with hatch marks
    const ins = { x: x + 4, y: bodyTop + bodyH * 0.15, w: beltW - 8, h: bodyH * 0.7 };
    surfaceDetails.push(
      <rect key="ins" x={ins.x} y={ins.y} width={ins.w} height={ins.h}
        fill="#d4c090" stroke="#9a7830" strokeWidth={0.6} rx={1} />
    );
    for (let lx = ins.x + 4; lx < ins.x + ins.w - 2; lx += 5) {
      surfaceDetails.push(
        <line key={`fh${lx}`} x1={lx} y1={ins.y + 1} x2={lx - 3} y2={ins.y + ins.h - 1}
          stroke="#9a7830" strokeWidth={0.4} opacity={0.5} />
      );
    }
  } else if (surface.type === "knob_top") {
    const cols = Math.floor(beltW / (fingerW + gap));
    const colW = beltW / cols;
    const r = Math.min(colW, bodyH) * 0.18;
    for (let c = 0; c < cols; c++) {
      surfaceDetails.push(
        <circle key={`k${c}`} cx={x + (c + 0.5) * colW} cy={bodyTop + bodyH / 2}
          r={r} fill="#c8d2dc" stroke={stroke} strokeWidth={0.5} />
      );
    }
  }

  return (
    <g>
      {/* Module body plate */}
      <rect x={x} y={bodyTop} width={beltW} height={bodyH}
        fill={fill} stroke={stroke} strokeWidth={strokeW} />

      {/* Surface details */}
      {surfaceDetails}

      {/* Top hinge fingers */}
      {fingers}

      {/* Rod line at hinge (connecting rod through all fingers) */}
      <line x1={x + offsetX} y1={y + fingerH * 0.55}
        x2={x + offsetX + totalFingersW} y2={y + fingerH * 0.55}
        stroke="#3a5a7a" strokeWidth={1.2} strokeDasharray="2,1" opacity={0.7} />
    </g>
  );
}

export default function BeltSchematic({ config, series, beltStyle, units }) {
  const styleKey = beltStyle?.key || beltStyle?.label || "";
  const surface = getSurfaceConfig(styleKey);

  // CAD drawing area — white background, dark lines
  const PAD = 48;          // padding for dimension callouts
  const beltW = 380;       // belt drawing width in SVG units
  const pitchIn = parseFloat(series?.pitch_in) || 1.0;

  // Scale pitch to pixels — 1" pitch = 28px, capped
  const pitchH = Math.max(20, Math.min(38, pitchIn * 28));
  const fingerH = pitchH * 0.38;
  const fingerW = pitchH * 0.55;
  const gap = pitchH * 0.18;

  // Show 4 module rows
  const rowCount = 4;
  const beltH = rowCount * pitchH;

  const svgW = beltW + PAD * 2 + 30;
  const svgH = beltH + PAD * 2 + 20;

  const beltX = PAD + 20;
  const beltY = PAD;

  const hasFlights = config?.flights === "yes";
  const hasSideguards = config?.sideguards === "yes";

  const widthNum = parseFloat(config?.beltWidth) || 0;
  const lengthNum = parseFloat(config?.beltLength) || 0;
  const widthLabel = widthNum > 0
    ? (units === "mm" ? `W = ${Math.round(widthNum * 25.4)} mm` : `W = ${widthNum}"`)
    : "W";
  const pitchLabel = series?.pitch_in && series.pitch_in !== "To be confirmed by Uniking"
    ? `${series.pitch_in}" (${series.pitch_mm} mm) pitch`
    : null;

  // Flight bar positions — snap to every other row boundary
  const flightRows = hasFlights ? [1, 3] : [];

  return (
    <div style={{
      background: "#fff",
      borderRadius: 10,
      border: "1.5px solid #c8d8e8",
      padding: "10px 10px 6px",
      marginBottom: 16,
      boxShadow: "0 2px 12px rgba(15,35,64,0.08)",
    }}>
      {/* Label bar */}
      <div style={{
        fontSize: 9, fontWeight: 700, color: "#5a7a95",
        textTransform: "uppercase", letterSpacing: "1px",
        marginBottom: 4, textAlign: "center",
      }}>
        {series?.name || "Modular Belt"}{beltStyle?.label ? ` · ${beltStyle.label}` : ""} — Top View
      </div>

      <svg width="100%" viewBox={`0 0 ${svgW} ${svgH}`}
        style={{ display: "block", fontFamily: "monospace" }}>

        {/* ── Dimension line: Width (top) ─────────────────────── */}
        <line x1={beltX} y1={beltY - 18} x2={beltX + beltW} y2={beltY - 18}
          stroke="#3a5a7a" strokeWidth={0.8} markerEnd="url(#a_r)" markerStart="url(#a_l)" />
        <text x={beltX + beltW / 2} y={beltY - 22} textAnchor="middle"
          fontSize={9} fill="#1a3a5c" fontWeight="700">{widthLabel}</text>
        {/* Tick marks */}
        <line x1={beltX} y1={beltY - 22} x2={beltX} y2={beltY - 12}
          stroke="#3a5a7a" strokeWidth={0.8} />
        <line x1={beltX + beltW} y1={beltY - 22} x2={beltX + beltW} y2={beltY - 12}
          stroke="#3a5a7a" strokeWidth={0.8} />

        {/* ── Pitch dimension (right side, one pitch height) ───── */}
        {pitchLabel && (
          <g>
            <line x1={beltX + beltW + 14} y1={beltY}
              x2={beltX + beltW + 14} y2={beltY + pitchH}
              stroke="#3a5a7a" strokeWidth={0.8}
              markerEnd="url(#a_d)" markerStart="url(#a_u)" />
            <line x1={beltX + beltW + 8} y1={beltY}
              x2={beltX + beltW + 20} y2={beltY}
              stroke="#3a5a7a" strokeWidth={0.8} />
            <line x1={beltX + beltW + 8} y1={beltY + pitchH}
              x2={beltX + beltW + 20} y2={beltY + pitchH}
              stroke="#3a5a7a" strokeWidth={0.8} />
            <text x={beltX + beltW + 18} y={beltY + pitchH / 2 + 4}
              fontSize={7} fill="#1a3a5c" fontWeight="700">{pitchLabel}</text>
          </g>
        )}

        {/* ── Module rows ──────────────────────────────────────── */}
        {Array.from({ length: rowCount }).map((_, i) => (
          <ModuleRow key={i}
            x={beltX} y={beltY + i * pitchH}
            beltW={beltW} pitchH={pitchH}
            surface={surface} rowIndex={i}
            fingerW={fingerW} fingerH={fingerH} gap={gap}
          />
        ))}

        {/* Belt outline border */}
        <rect x={beltX} y={beltY} width={beltW} height={beltH}
          fill="none" stroke="#2a4a6a" strokeWidth={1.5} />

        {/* ── Flights ───────────────────────────────────────────── */}
        {flightRows.map((ri, i) => {
          const fy = beltY + ri * pitchH;
          return (
            <g key={`fl${i}`}>
              {/* Flight bar — full width, extends slightly past belt edges */}
              <rect x={beltX - 3} y={fy - 5} width={beltW + 6} height={10}
                fill="#2a4a6a" stroke="#1a3050" strokeWidth={1} rx={1} />
              {/* Highlight */}
              <rect x={beltX - 3} y={fy - 5} width={beltW + 6} height={3}
                fill="rgba(255,255,255,0.2)" rx={1} />
              {/* Label */}
              <text x={beltX + beltW + 4} y={fy + 3}
                fontSize={7} fill="#2a4a6a" fontWeight="700">Flight</text>
            </g>
          );
        })}

        {/* ── Sideguards ───────────────────────────────────────── */}
        {hasSideguards && (
          <>
            <rect x={beltX - 8} y={beltY} width={8} height={beltH}
              fill="#c9a84c" stroke="#a07828" strokeWidth={0.8} />
            <rect x={beltX + beltW} y={beltY} width={8} height={beltH}
              fill="#c9a84c" stroke="#a07828" strokeWidth={0.8} />
            <text x={beltX - 10} y={beltY + beltH / 2}
              fontSize={7} fill="#a07828" fontWeight="700" textAnchor="middle"
              transform={`rotate(-90, ${beltX - 10}, ${beltY + beltH / 2})`}>Sideguard</text>
          </>
        )}

        {/* ── Arrow markers ────────────────────────────────────── */}
        <defs>
          <marker id="a_r" markerWidth="5" markerHeight="5" refX="4" refY="2.5" orient="auto">
            <path d="M0,0 L5,2.5 L0,5 Z" fill="#3a5a7a" />
          </marker>
          <marker id="a_l" markerWidth="5" markerHeight="5" refX="1" refY="2.5" orient="auto">
            <path d="M5,0 L0,2.5 L5,5 Z" fill="#3a5a7a" />
          </marker>
          <marker id="a_d" markerWidth="5" markerHeight="5" refX="2.5" refY="4" orient="auto">
            <path d="M0,0 L2.5,5 L5,0 Z" fill="#3a5a7a" />
          </marker>
          <marker id="a_u" markerWidth="5" markerHeight="5" refX="2.5" refY="1" orient="auto">
            <path d="M0,5 L2.5,0 L5,5 Z" fill="#3a5a7a" />
          </marker>
        </defs>

        {/* ── Belt info text ────────────────────────────────────── */}
        {config?.moduleMaterial && config.moduleMaterial !== "UNKNOWN" && (
          <text x={beltX} y={beltY + beltH + 14}
            fontSize={7.5} fill="#5a7a95">
            Material: {config.moduleMaterial}
            {config.rodMaterial && config.rodMaterial !== "UNKNOWN" ? `  |  Rod: ${config.rodMaterial}` : ""}
            {lengthNum > 0 ? `  |  L = ${lengthNum} ${config.beltLengthUnit || "ft"}` : ""}
          </text>
        )}

        {/* Travel direction arrow */}
        <g>
          <line x1={beltX + beltW * 0.35} y1={beltY + beltH + 24}
            x2={beltX + beltW * 0.65} y2={beltY + beltH + 24}
            stroke="#8aaab8" strokeWidth={1} markerEnd="url(#a_r)" />
          <text x={beltX + beltW * 0.35 - 4} y={beltY + beltH + 27}
            fontSize={7} fill="#8aaab8">travel direction</text>
        </g>

      </svg>
    </div>
  );
}