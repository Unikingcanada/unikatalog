/**
 * BeltSchematic — overhead view of a modular plastic belt
 * Renders surface-accurate SVG patterns for flat top, flush grid, open grid,
 * raised rib, friction top, etc. Shows hinges/rods at pitch intervals,
 * flights as bars across the width, and sideguards along edges.
 */

const C = {
  navy: "#0F2340", navyMid: "#1A3A5C",
  gold: "#C9A84C", border: "#e2e8f0", muted: "#64748b", bg: "#f8fafc",
};

// Belt surface style config keyed on style key substring matches
function getSurfaceConfig(styleKey = "", moduleMaterial = "") {
  const k = styleKey.toLowerCase();

  // Material tint
  const matColor =
    moduleMaterial === "AC" || moduleMaterial === "XAC" ? "#b8cfe8" :
    moduleMaterial === "NY" || moduleMaterial === "HHR" ? "#e8c97a" :
    moduleMaterial === "PE" ? "#a8d4f0" :
    moduleMaterial === "DPP" ? "#c8e8b0" :
    "#c8dcea"; // PP default — blue-grey

  const darkMat = moduleMaterial === "NY" || moduleMaterial === "HHR" ? "#c9a84c" :
    moduleMaterial === "PE" ? "#7ab8dc" :
    moduleMaterial === "AC" || moduleMaterial === "XAC" ? "#8aafc8" :
    "#8aafc8";

  if (k.includes("flush grid") || k.includes("flush_grid")) {
    return { type: "flush_grid", matColor, darkMat, label: "Flush Grid" };
  }
  if (k.includes("open grid") || k.includes("open_grid")) {
    return { type: "open_grid", matColor, darkMat, label: "Open Grid" };
  }
  if (k.includes("friction top") || k.includes("friction_top")) {
    return { type: "friction_top", matColor, darkMat, label: "Friction Top" };
  }
  if (k.includes("raised rib") || k.includes("raised_rib") || k.includes("rib")) {
    return { type: "raised_rib", matColor, darkMat, label: "Raised Rib" };
  }
  if (k.includes("perforated") || k.includes("perf")) {
    return { type: "perforated", matColor, darkMat, label: "Perforated" };
  }
  if (k.includes("knob top") || k.includes("knob")) {
    return { type: "knob_top", matColor, darkMat, label: "Knob Top" };
  }
  // Default: flat top
  return { type: "flat_top", matColor, darkMat, label: "Flat Top" };
}

// SVG <defs> pattern definitions
function SurfacePatternDefs({ id, surface, pitchPx }) {
  const { type, matColor, darkMat } = surface;
  const p = pitchPx; // one pitch = one module row

  if (type === "flush_grid") {
    // Rectangular modules with visible gaps — flush grid look
    const gap = 2;
    const moduleW = p * 0.6;
    const moduleH = p - gap;
    return (
      <defs>
        <pattern id={id} x="0" y="0" width={p} height={p} patternUnits="userSpaceOnUse">
          {/* Background (gap colour) */}
          <rect width={p} height={p} fill="#5a7a9a" opacity="0.35" />
          {/* Left module */}
          <rect x={gap / 2} y={gap / 2} width={moduleW * 0.48} height={moduleH} rx="1" fill={matColor} />
          {/* Right module */}
          <rect x={gap / 2 + moduleW * 0.52} y={gap / 2} width={moduleW * 0.48} height={moduleH} rx="1" fill={matColor} />
          {/* Hinge line */}
          <line x1={0} y1={p} x2={p} y2={p} stroke={darkMat} strokeWidth="1.5" opacity="0.7" />
        </pattern>
      </defs>
    );
  }

  if (type === "open_grid") {
    // Wire-frame grid — large open area
    const cell = p / 3;
    return (
      <defs>
        <pattern id={id} x="0" y="0" width={p} height={p} patternUnits="userSpaceOnUse">
          <rect width={p} height={p} fill="transparent" />
          {/* Horizontal ribs */}
          {[0, 1, 2, 3].map(i => (
            <rect key={`h${i}`} x={0} y={i * cell - 1} width={p} height={2.5} rx="1" fill={matColor} opacity="0.9" />
          ))}
          {/* Vertical strands */}
          {[0, 1, 2, 3].map(i => (
            <rect key={`v${i}`} x={i * cell - 1} y={0} width={2} height={p} rx="1" fill={darkMat} opacity="0.6" />
          ))}
        </pattern>
      </defs>
    );
  }

  if (type === "friction_top") {
    // Solid top with rubber insert texture (diagonal hatch)
    return (
      <defs>
        <pattern id={`${id}_hatch`} x="0" y="0" width="6" height="6" patternUnits="userSpaceOnUse">
          <line x1="0" y1="6" x2="6" y2="0" stroke="#8a6020" strokeWidth="1" opacity="0.35" />
        </pattern>
        <pattern id={id} x="0" y="0" width={p} height={p} patternUnits="userSpaceOnUse">
          <rect width={p} height={p} fill={matColor} />
          {/* Rubber insert inset */}
          <rect x={4} y={3} width={p - 8} height={p - 6} rx="2" fill="#c8a060" opacity="0.7" />
          <rect x={4} y={3} width={p - 8} height={p - 6} rx="2" fill="url(#${id}_hatch)" />
          {/* Hinge line */}
          <line x1={0} y1={p} x2={p} y2={p} stroke={darkMat} strokeWidth="1.5" opacity="0.7" />
        </pattern>
      </defs>
    );
  }

  if (type === "raised_rib") {
    // Parallel ribs running across the belt
    const ribCount = 4;
    const ribSpacing = p / (ribCount + 1);
    return (
      <defs>
        <pattern id={id} x="0" y="0" width={p} height={p} patternUnits="userSpaceOnUse">
          <rect width={p} height={p} fill={matColor} opacity="0.85" />
          {Array.from({ length: ribCount }).map((_, i) => (
            <rect key={i} x={0} y={(i + 1) * ribSpacing - 2} width={p} height={3.5} rx="1" fill={darkMat} opacity="0.6" />
          ))}
          <line x1={0} y1={p} x2={p} y2={p} stroke={darkMat} strokeWidth="1.5" opacity="0.8" />
        </pattern>
      </defs>
    );
  }

  if (type === "perforated") {
    const cols = 3, rows = 3;
    const cw = p / cols, ch = p / rows;
    const r = Math.min(cw, ch) * 0.28;
    return (
      <defs>
        <pattern id={id} x="0" y="0" width={p} height={p} patternUnits="userSpaceOnUse">
          <rect width={p} height={p} fill={matColor} opacity="0.9" />
          {Array.from({ length: rows }).map((_, ri) =>
            Array.from({ length: cols }).map((_, ci) => (
              <circle key={`${ri}-${ci}`} cx={(ci + 0.5) * cw} cy={(ri + 0.5) * ch} r={r} fill="#2a5080" opacity="0.35" />
            ))
          )}
          <line x1={0} y1={p} x2={p} y2={p} stroke={darkMat} strokeWidth="1.5" opacity="0.7" />
        </pattern>
      </defs>
    );
  }

  if (type === "knob_top") {
    const cols = 3, rows = 3;
    const cw = p / cols, ch = p / rows;
    return (
      <defs>
        <pattern id={id} x="0" y="0" width={p} height={p} patternUnits="userSpaceOnUse">
          <rect width={p} height={p} fill={matColor} opacity="0.85" />
          {Array.from({ length: rows }).map((_, ri) =>
            Array.from({ length: cols }).map((_, ci) => (
              <circle key={`${ri}-${ci}`} cx={(ci + 0.5) * cw} cy={(ri + 0.5) * ch} r={Math.min(cw, ch) * 0.22}
                fill={darkMat} opacity="0.7" />
            ))
          )}
          <line x1={0} y1={p} x2={p} y2={p} stroke={darkMat} strokeWidth="1.5" opacity="0.7" />
        </pattern>
      </defs>
    );
  }

  // Flat top — solid modules with hinge lines
  return (
    <defs>
      <pattern id={id} x="0" y="0" width={p} height={p} patternUnits="userSpaceOnUse">
        <rect width={p} height={p} fill={matColor} opacity="0.92" />
        {/* Subtle module-edge shading */}
        <rect x={0} y={0} width={p} height={2} fill={darkMat} opacity="0.18" />
        {/* Hinge/rod line at each pitch */}
        <line x1={0} y1={p - 1} x2={p} y2={p - 1} stroke={darkMat} strokeWidth="2" opacity="0.55" />
      </pattern>
    </defs>
  );
}

export default function BeltSchematic({ config, series, beltStyle, units }) {
  const VW = 560, VH = 240;

  // Belt drawing area
  const beltX = 52, beltY = 44, beltW = 456, beltH = 110;

  const widthNum = parseFloat(config?.beltWidth) || 0;
  const lengthNum = parseFloat(config?.beltLength) || 0;

  // Pitch in pixels — use real series pitch if available, else default
  const pitchIn = parseFloat(series?.pitch_in) || 1.0;
  // Map pitch_in to a nice pixel size for the schematic (scaled)
  // 1" pitch → ~18px, 0.5" → ~10px, 1.5" → ~26px — capped for visual clarity
  const pitchPx = Math.max(14, Math.min(32, pitchIn * 18));

  const styleKey = beltStyle?.key || beltStyle?.label || "";
  const surface = getSurfaceConfig(styleKey, config?.moduleMaterial || "");
  const patternId = `belt_surf_${surface.type}`;

  const hasFlights = config?.flights === "yes";
  const hasSideguards = config?.sideguards === "yes";

  // Width label
  const widthLabel = widthNum > 0
    ? (units === "mm" ? `W = ${Math.round(widthNum * 25.4)} mm` : `W = ${widthNum}"`)
    : "Width TBD";
  const lengthLabel = lengthNum > 0
    ? `L = ${lengthNum} ${config?.beltLengthUnit || "ft"}`
    : "Length TBD";

  // Flight positions (evenly spaced bars across belt length for illustration)
  const flightPositions = hasFlights ? [0.22, 0.5, 0.78] : [];

  // Hinge rod markers along edges (showing pitch intervals)
  const hingeCount = Math.floor(beltW / pitchPx);

  return (
    <div style={{
      background: "linear-gradient(160deg, #0a1a2e 0%, #0f2340 100%)",
      borderRadius: 14, padding: "12px 12px 10px",
      marginBottom: 16,
      border: "1px solid rgba(255,255,255,0.07)",
      boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06)",
    }}>
      <div style={{
        fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.35)",
        textTransform: "uppercase", letterSpacing: "1px",
        marginBottom: 6, textAlign: "center",
      }}>
        overhead view — {series?.name || "series"}{beltStyle?.label ? ` · ${beltStyle.label}` : ""}{surface.label !== "Flat Top" ? ` · ${surface.label}` : ""}
      </div>

      <svg width="100%" viewBox={`0 0 ${VW} ${VH}`} style={{ display: "block", overflow: "visible" }}>

        {/* Surface pattern defs */}
        <SurfacePatternDefs id={patternId} surface={surface} pitchPx={pitchPx} />

        {/* Arrow markers for dimension lines */}
        <defs>
          <marker id="arr_r" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
            <path d="M0,0 L6,3 L0,6 Z" fill="#7a9ab8" />
          </marker>
          <marker id="arr_l" markerWidth="6" markerHeight="6" refX="1" refY="3" orient="auto">
            <path d="M6,0 L0,3 L6,6 Z" fill="#7a9ab8" />
          </marker>
          <marker id="arr_d" markerWidth="6" markerHeight="6" refX="3" refY="5" orient="auto">
            <path d="M0,0 L3,6 L6,0 Z" fill="#7a9ab8" />
          </marker>
          <marker id="arr_u" markerWidth="6" markerHeight="6" refX="3" refY="1" orient="auto">
            <path d="M0,6 L3,0 L6,6 Z" fill="#7a9ab8" />
          </marker>
          {/* Drop shadow filter */}
          <filter id="belt_shadow" x="-5%" y="-5%" width="110%" height="120%">
            <feDropShadow dx="0" dy="3" stdDeviation="4" floodColor="#000" floodOpacity="0.4" />
          </filter>
        </defs>

        {/* ── Belt body ────────────────────────────────────────── */}
        {/* Shadow */}
        <rect x={beltX} y={beltY + 3} width={beltW} height={beltH}
          fill="rgba(0,0,0,0.35)" rx={2} />

        {/* Surface fill */}
        <rect x={beltX} y={beltY} width={beltW} height={beltH}
          fill={`url(#${patternId})`} rx={2}
          filter="url(#belt_shadow)" />

        {/* Belt border */}
        <rect x={beltX} y={beltY} width={beltW} height={beltH}
          fill="none" stroke={C.navyMid} strokeWidth="2" rx={2} />

        {/* ── Hinge rod lines running across the full width ──── */}
        {/* These show the modular construction — one line per pitch */}
        {Array.from({ length: hingeCount + 1 }).map((_, i) => {
          const rx = beltX + i * pitchPx;
          if (rx > beltX + beltW) return null;
          return (
            <line key={`h${i}`} x1={rx} y1={beltY} x2={rx} y2={beltY + beltH}
              stroke="rgba(255,255,255,0.08)" strokeWidth="0.5" />
          );
        })}

        {/* ── Rod pins on edges (pitch markers) ──────────────── */}
        {Array.from({ length: hingeCount + 1 }).map((_, i) => {
          const rx = beltX + i * pitchPx;
          if (rx > beltX + beltW + 1) return null;
          return (
            <g key={`pin${i}`}>
              {/* Top edge pin */}
              <circle cx={rx} cy={beltY} r={2.5}
                fill="#4a7a9a" stroke="#2a5070" strokeWidth="1" />
              {/* Bottom edge pin */}
              <circle cx={rx} cy={beltY + beltH} r={2.5}
                fill="#4a7a9a" stroke="#2a5070" strokeWidth="1" />
            </g>
          );
        })}

        {/* ── Sideguards ───────────────────────────────────────── */}
        {hasSideguards && (
          <>
            {/* Top sideguard */}
            <rect x={beltX} y={beltY - 10} width={beltW} height={10}
              fill={C.gold} opacity={0.85} rx={1} />
            <rect x={beltX} y={beltY - 10} width={beltW} height={10}
              fill="none" stroke="#a07828" strokeWidth="1" rx={1} />
            {/* Bottom sideguard */}
            <rect x={beltX} y={beltY + beltH} width={beltW} height={10}
              fill={C.gold} opacity={0.85} rx={1} />
            <rect x={beltX} y={beltY + beltH} width={beltW} height={10}
              fill="none" stroke="#a07828" strokeWidth="1" rx={1} />
            <text x={beltX + beltW + 6} y={beltY - 4} fontSize={8} fill={C.gold} fontWeight="700">Sideguard</text>
          </>
        )}

        {/* ── Sprocket/nosebar ends ─────────────────────────────── */}
        {/* Left sprocket drum */}
        <ellipse cx={beltX} cy={beltY + beltH / 2} rx={10} ry={beltH / 2 + 3}
          fill="#1a3a5c" stroke="#2a5a8c" strokeWidth="2" />
        {/* Sprocket teeth suggestion */}
        {Array.from({ length: 7 }).map((_, i) => {
          const angle = (i / 7) * Math.PI * 2;
          const tx = beltX + Math.cos(angle) * (beltH / 2 + 3);
          const ty = beltY + beltH / 2 + Math.sin(angle) * (beltH / 2 + 3);
          return <circle key={i} cx={tx} cy={ty} r={2.5} fill="#3a6a9c" opacity={0.7} />;
        })}

        {/* Right sprocket/nosebar drum */}
        <ellipse cx={beltX + beltW} cy={beltY + beltH / 2} rx={10} ry={beltH / 2 + 3}
          fill="#1a3a5c" stroke="#2a5a8c" strokeWidth="2" />
        {Array.from({ length: 7 }).map((_, i) => {
          const angle = (i / 7) * Math.PI * 2;
          const tx = beltX + beltW + Math.cos(angle) * (beltH / 2 + 3);
          const ty = beltY + beltH / 2 + Math.sin(angle) * (beltH / 2 + 3);
          return <circle key={i} cx={tx} cy={ty} r={2.5} fill="#3a6a9c" opacity={0.7} />;
        })}

        {/* ── Flights ───────────────────────────────────────────── */}
        {flightPositions.map((t, i) => {
          const fx = beltX + beltW * t;
          const fxSnapped = beltX + Math.round((fx - beltX) / pitchPx) * pitchPx;
          return (
            <g key={`flight${i}`}>
              {/* Flight bar shadow */}
              <rect x={fxSnapped - 4} y={beltY - 2} width={8} height={beltH + 4}
                fill="rgba(0,0,0,0.3)" rx={2} />
              {/* Flight bar */}
              <rect x={fxSnapped - 3.5} y={beltY - 8} width={7} height={beltH + 16}
                fill="#2a5a8c" stroke="#4a8abc" strokeWidth="1" rx={2} />
              {/* Flight highlight */}
              <rect x={fxSnapped - 2} y={beltY - 8} width={2} height={beltH + 16}
                fill="rgba(255,255,255,0.2)" rx={1} />
            </g>
          );
        })}

        {/* ── Pitch label ───────────────────────────────────────── */}
        {series?.pitch_in && series.pitch_in !== "To be confirmed by Uniking" && (
          <g>
            {/* Pitch bracket over first two hinge lines */}
            <line x1={beltX} y1={beltY - 16} x2={beltX + pitchPx} y2={beltY - 16}
              stroke="#7a9ab8" strokeWidth="1"
              markerEnd="url(#arr_r)" markerStart="url(#arr_l)" />
            <text x={beltX + pitchPx / 2} y={beltY - 20} textAnchor="middle"
              fontSize={8} fill={C.gold} fontWeight="700">
              {series.pitch_in}" pitch
            </text>
          </g>
        )}

        {/* ── Width dimension (left side, vertical) ─────────────── */}
        <line x1={beltX - 20} y1={beltY} x2={beltX - 20} y2={beltY + beltH}
          stroke="#7a9ab8" strokeWidth="1"
          markerEnd="url(#arr_d)" markerStart="url(#arr_u)" />
        <text x={beltX - 26} y={beltY + beltH / 2 + 4}
          textAnchor="middle" fontSize={9} fill="#94a3b8" fontWeight="600"
          transform={`rotate(-90,${beltX - 26},${beltY + beltH / 2 + 4})`}>
          {widthLabel}
        </text>

        {/* ── Length dimension (bottom) ──────────────────────────── */}
        <line x1={beltX} y1={beltY + beltH + (hasSideguards ? 22 : 14)}
          x2={beltX + beltW} y2={beltY + beltH + (hasSideguards ? 22 : 14)}
          stroke="#7a9ab8" strokeWidth="1"
          markerEnd="url(#arr_r)" markerStart="url(#arr_l)" />
        <text x={beltX + beltW / 2} y={beltY + beltH + (hasSideguards ? 35 : 26)}
          textAnchor="middle" fontSize={9} fill="#94a3b8" fontWeight="600">
          {lengthLabel}
        </text>

        {/* ── Material label ────────────────────────────────────── */}
        {config?.moduleMaterial && config.moduleMaterial !== "UNKNOWN" && (
          <text x={beltX + beltW / 2} y={VH - 4}
            textAnchor="middle" fontSize={8} fill="rgba(255,255,255,0.3)">
            {config.moduleMaterial}{config.rodMaterial && config.rodMaterial !== "UNKNOWN" ? ` / Rod: ${config.rodMaterial}` : ""}
          </text>
        )}

        {/* ── Flight label ──────────────────────────────────────── */}
        {hasFlights && (
          <text x={beltX + beltW + 12} y={beltY + beltH / 2 + 4}
            fontSize={8} fill="#7ab4d8" fontWeight="600">
            Flights
          </text>
        )}

        {/* ── Travel direction arrow ────────────────────────────── */}
        <text x={beltX + beltW / 2} y={beltY + beltH / 2 + 4}
          textAnchor="middle" fontSize={10} fill="rgba(255,255,255,0.12)" fontWeight="700">
          ━━━━━━━━━━▶
        </text>

      </svg>
    </div>
  );
}