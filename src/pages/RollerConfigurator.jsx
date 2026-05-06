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

// ─── Top Bar ──────────────────────────────────────────────────────────────────
function TopBar({ onBack, onGoRFQ }) {
  return (
    <div style={{ background: NAVY, height: 56, display: "flex", alignItems: "center", padding: "0 24px", justifyContent: "space-between", boxShadow: "0 2px 8px rgba(0,0,0,.2)", flexShrink: 0 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        {onBack && <button onClick={onBack} style={{ background: "rgba(255,255,255,.12)", border: "1px solid rgba(255,255,255,.2)", color: "#fff", borderRadius: 7, padding: "5px 13px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>← Back</button>}
        <img src="https://media.base44.com/images/public/69dd9ffccab4dd693d4d92f5/e48ee59d9_Unitingthestrongestlinks_20251031_225809_0000.png"
          style={{ maxHeight: 26, filter: "brightness(0) invert(1)", opacity: 0.9 }} alt="Uniking" />
        <span style={{ color: "#fff", fontWeight: 800, fontSize: 14 }}>Conveyor Rollers</span>
        <span style={{ color: "rgba(255,255,255,.4)", fontSize: 12 }}>Interroll Series</span>
      </div>
      <button onClick={onGoRFQ} style={{ background: "rgba(255,255,255,.12)", border: "1px solid rgba(255,255,255,.2)", color: "#fff", borderRadius: 7, padding: "5px 13px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
        📋 RFQ Cart
      </button>
    </div>
  );
}

// ─── Load Table ───────────────────────────────────────────────────────────────
function LoadTable({ table }) {
  if (!table) return null;
  const { cols_mm, rows } = table;
  return (
    <div style={{ overflowX: "auto", borderRadius: 7, border: "1px solid " + C.border, marginTop: 8 }}>
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

// ─── Shaft extension lookup (Interroll "B" dimension per shaft type) ─────────
// Returns the standard shaft projection beyond the tube face on each side, in mm
function getShaftExtMm(shaftObj) {
  if (!shaftObj) return 10;
  const code = shaftObj.code || "";
  if (/spring/i.test(code)) return 13;    // spring adds ~13mm each side
  if (/male/i.test(code)) return 16;      // male thread projects more
  if (/variable/i.test(code)) return 10;
  if (/bolt_ip55/i.test(code)) return 10;
  if (/fixed_17|female_17/i.test(code)) return 10; // Ø17 shaft — standard 10mm ext
  if (/female_20|male_20|fixed_20|spring_20/i.test(code)) return 10; // Ø20 shaft series 1450/3950
  if (/fixed_ss_pin/i.test(code)) return 8;  // 1500/1520 SS pin
  return 10; // female / fixed / flat — standard 10mm
}

// ─── Roller Schematic ─────────────────────────────────────────────────────────
function RollerSchematic({ series, rl, tubeIdx, sleeve, shaftObj, imperial, groovesQty, driveHead, varRHmm, varLHmm }) {
  const tube = series.tubes[tubeIdx] || series.tubes[0];
  const tubeMm = tube?.tube_mm || 50;
  const wallMm = tube?.wall_mm || 1.5;
  const rlVal = parseInt(rl) || 600;
  const shaftExtMm = getShaftExtMm(shaftObj);

  // ── Tapered (conical) detection ───────────────────────────────────────────
  const conicity = tube?.conicity;
  const taperedTable = conicity && series.tapered_elements?.[conicity];
  let taperedRow = null;
  if (taperedTable) {
    taperedRow = taperedTable.reduce((prev, cur) =>
      Math.abs(cur.rl_mm - rlVal) < Math.abs(prev.rl_mm - rlVal) ? cur : prev
    );
  }
  const isTapered = !!taperedRow;

  // Shaft type classification (kept for reference but tips are plain bars)
  const shaftCode = shaftObj?.code || "";

  // Fixed SVG canvas — extra height for cleaner dim lines
  const VW = 580, VH = isTapered ? 250 : 220;
  const shaftVisLen = 48;
  const cx = shaftVisLen + 4;
  const drawRL = VW - shaftVisLen * 2 - 8;

  const maxVisualDia = 110;
  const minVisualDia = 24;

  const smallDiaMm = isTapered ? taperedRow.min_dia_mm : tubeMm;
  const largeDiaMm = isTapered ? taperedRow.max_dia_mm : tubeMm;
  const visualSmall = Math.max(minVisualDia, Math.min(maxVisualDia, (smallDiaMm / 120) * maxVisualDia));
  const visualLarge = Math.max(minVisualDia, Math.min(maxVisualDia, (largeDiaMm / 120) * maxVisualDia));
  const visualDia = isTapered ? visualLarge : Math.max(minVisualDia, Math.min(maxVisualDia, (tubeMm / 89) * maxVisualDia));
  const visualWall = Math.max(3, wallMm * (visualDia / tubeMm));

  const color = series.color || NAVY;
  const cy = VH / 2 - 14;

  const smallHalf = visualSmall / 2;
  const largeHalf = visualLarge / 2;

  const tubeY1 = cy - visualDia / 2;
  const tubeY2 = cy + visualDia / 2;
  const innerY1 = tubeY1 + visualWall;
  const innerY2 = tubeY2 - visualWall;

  // Bearing housing end-cap geometry
  const capW = Math.max(8, visualWall * 2.2);    // width of bearing seat ring
  const capH = visualDia * 0.72;                 // height of bearing cap (smaller than tube)
  const capY = cy - capH / 2;
  const capColor = "#94a3b8";

  const hasSleeve = sleeve && sleeve !== "None";
  const sleeveThick = hasSleeve ? Math.max(4, visualDia * 0.09) : 0;
  let sleeveColor = "#f59e0b";
  if (/pu/i.test(sleeve || "")) sleeveColor = "#a78bfa";
  if (/pvc/i.test(sleeve || "")) sleeveColor = "#60a5fa";
  if (/lagging/i.test(sleeve || "")) sleeveColor = "#6b7280";

  const isVariable = varRHmm != null && varLHmm != null;
  const leftExtMm = isVariable ? varLHmm : shaftExtMm;
  const rightExtMm = isVariable ? varRHmm : shaftExtMm;

  const fmtMm = v => imperial ? `${(v / 25.4).toFixed(2)}"` : `${v} mm`;
  const rlLabel = `RL = ${fmtMm(rlVal)}`;
  const elMm = rlVal + leftExtMm + rightExtMm;
  const elLabel = `EL = ${fmtMm(elMm)}`;
  const bLabel = isVariable ? null : `B = ${fmtMm(shaftExtMm)}`;
  const lhLabel = isVariable ? `LH = ${fmtMm(leftExtMm)}` : null;
  const rhLabel = isVariable ? `RH = ${fmtMm(rightExtMm)}` : null;

  const topRef = isTapered ? cy - largeHalf : tubeY1;
  const botRef = isTapered ? cy + largeHalf : tubeY2;
  // Dimension line positions — stacked below the tube with spacing
  const dimY_RL  = botRef + 20;
  const dimY_EL  = botRef + 42;
  const shaftDimY = topRef - 22;

  const tapOuterPoints = `${cx},${cy - smallHalf} ${cx + drawRL},${cy - largeHalf} ${cx + drawRL},${cy + largeHalf} ${cx},${cy + smallHalf}`;
  const innerSmall = smallHalf - visualWall;
  const innerLarge = largeHalf - visualWall;
  const tapInnerPoints = `${cx + visualWall * 2},${cy - innerSmall} ${cx + drawRL - visualWall * 2},${cy - innerLarge} ${cx + drawRL - visualWall * 2},${cy + innerLarge} ${cx + visualWall * 2},${cy + innerSmall}`;

  // ── Helper: boxed callout label (engineering drawing style) ──────────────
  function DimLabel({ x, y, text, color: lc = "#64748b", anchor = "middle" }) {
    const pad = 4, h = 16;
    const approxW = text.length * 6 + pad * 2;
    const lx = anchor === "middle" ? x - approxW / 2 : anchor === "end" ? x - approxW : x;
    return (
      <g>
        <rect x={lx} y={y - h / 2} width={approxW} height={h} rx={3}
          fill="#fff" stroke={lc} strokeWidth={1} />
        <text x={x} y={y + 4.5} textAnchor={anchor} fontSize={9.5}
          fill={lc} fontWeight="700" fontFamily="Arial,sans-serif">{text}</text>
      </g>
    );
  }

  return (
    <div style={{ background: "#f1f5f9", borderRadius: 10, padding: "14px 16px", border: "1px solid " + C.border }}>
      <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, color: C.muted, marginBottom: 8 }}>
        Engineering Schematic — {rlLabel} · EL = {fmtMm(elMm)}
        {isTapered && <span style={{ marginLeft: 8, color: series.color, fontWeight: 800 }}>· Tapered {conicity}</span>}
      </div>
      <svg viewBox={`0 0 ${VW} ${VH}`} width="100%" height={VH} style={{ display: "block", maxWidth: 620 }}>
        <defs>
          <marker id="arr" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
            <path d="M0,0 L6,3 L0,6 Z" fill="#64748b" />
          </marker>
          <marker id="arrL" markerWidth="6" markerHeight="6" refX="1" refY="3" orient="auto">
            <path d="M6,0 L0,3 L6,6 Z" fill="#64748b" />
          </marker>
          <marker id="arrB" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
            <path d="M0,0 L6,3 L0,6 Z" fill="#2563eb" />
          </marker>
          <marker id="arrBL" markerWidth="6" markerHeight="6" refX="1" refY="3" orient="auto">
            <path d="M6,0 L0,3 L6,6 Z" fill="#2563eb" />
          </marker>
          <marker id="arrV" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
            <path d="M0,0 L6,3 L0,6 Z" fill="#b45309" />
          </marker>
          <marker id="arrVL" markerWidth="6" markerHeight="6" refX="1" refY="3" orient="auto">
            <path d="M6,0 L0,3 L6,6 Z" fill="#b45309" />
          </marker>
          <marker id="arrG" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
            <path d="M0,0 L6,3 L0,6 Z" fill="#16a34a" />
          </marker>
          <marker id="arrGL" markerWidth="6" markerHeight="6" refX="1" refY="3" orient="auto">
            <path d="M6,0 L0,3 L6,6 Z" fill="#16a34a" />
          </marker>
        </defs>

        {/* ── Shaft arms ── */}
        <line x1={0} y1={cy} x2={cx} y2={cy}
          stroke={isVariable ? "#b45309" : "#64748b"} strokeWidth={isVariable ? 6 : 5} strokeLinecap="round" />
        <line x1={cx + drawRL} y1={cy} x2={VW} y2={cy}
          stroke={isVariable ? "#b45309" : "#64748b"} strokeWidth={isVariable ? 6 : 5} strokeLinecap="round" />



        {isTapered ? (
          <>
            <polygon points={tapOuterPoints}
              fill={color} fillOpacity={0.18} stroke={color} strokeWidth={2} />
            <polygon points={tapInnerPoints}
              fill="#fff" fillOpacity={0.55} stroke={color} strokeWidth={0.8} strokeDasharray="5 3" />
            <text x={cx + drawRL / 2} y={cy + 4}
              textAnchor="middle" fontSize={11} fill={color} fontWeight="700" fontFamily="Arial,sans-serif">
              {conicity} Tapered
            </text>
            <line x1={cx} y1={cy - smallHalf - 4} x2={cx} y2={cy + smallHalf + 4} stroke="#16a34a" strokeWidth={1.2} />
            <line x1={cx - 1} y1={cy - smallHalf} x2={cx - 1} y2={cy + smallHalf}
              stroke="#16a34a" strokeWidth={1} markerEnd="url(#arrG)" markerStart="url(#arrGL)" />
            <text x={cx - 5} y={cy - smallHalf - 6}
              textAnchor="middle" fontSize={9} fill="#16a34a" fontWeight="700" fontFamily="Arial,sans-serif">
              d={fmtMm(smallDiaMm)}
            </text>
            <line x1={cx + drawRL + 1} y1={cy - largeHalf} x2={cx + drawRL + 1} y2={cy + largeHalf}
              stroke="#16a34a" strokeWidth={1} markerEnd="url(#arrG)" markerStart="url(#arrGL)" />
            <text x={cx + drawRL + 5} y={cy - largeHalf - 6}
              textAnchor="start" fontSize={9} fill="#16a34a" fontWeight="700" fontFamily="Arial,sans-serif">
              D={fmtMm(largeDiaMm)}
            </text>
          </>
        ) : (
          <>
            {/* Sleeve overlay */}
            {hasSleeve && (
              <rect x={cx} y={tubeY1 - sleeveThick} width={drawRL} height={visualDia + sleeveThick * 2}
                rx={visualDia / 6} fill={sleeveColor} fillOpacity={0.35} stroke={sleeveColor} strokeWidth={1.5} />
            )}

            {/* Tube body */}
            <rect x={cx} y={tubeY1} width={drawRL} height={visualDia}
              rx={visualDia / 10} fill={color} fillOpacity={0.13} stroke={color} strokeWidth={2.2} />

            {/* Inner bore (hollow section) */}
            <rect x={cx + visualWall} y={innerY1} width={drawRL - visualWall * 2} height={innerY2 - innerY1}
              rx={(innerY2 - innerY1) / 10} fill="#fff" fillOpacity={0.6} stroke={color} strokeWidth={0.8} strokeDasharray="6 3" />

            {/* ── A: Bearing housing end-caps — left side ── */}
            <rect x={cx} y={capY} width={capW} height={capH}
              rx={3} fill={capColor} fillOpacity={0.25} stroke={capColor} strokeWidth={1.5} />
            {/* inner ring */}
            <rect x={cx + capW * 0.25} y={capY + capH * 0.15} width={capW * 0.5} height={capH * 0.7}
              rx={2} fill="#fff" fillOpacity={0.7} stroke={capColor} strokeWidth={1} />

            {/* ── A: Bearing housing end-caps — right side ── */}
            <rect x={cx + drawRL - capW} y={capY} width={capW} height={capH}
              rx={3} fill={capColor} fillOpacity={0.25} stroke={capColor} strokeWidth={1.5} />
            <rect x={cx + drawRL - capW + capW * 0.25} y={capY + capH * 0.15} width={capW * 0.5} height={capH * 0.7}
              rx={2} fill="#fff" fillOpacity={0.7} stroke={capColor} strokeWidth={1} />

            {/* Sleeve label */}
            {hasSleeve && (
              <text x={cx + drawRL - 6} y={tubeY1 - sleeveThick - 4}
                textAnchor="end" fontSize={9} fill={sleeveColor} fontWeight="700" fontFamily="Arial,sans-serif">
                {sleeve}
              </text>
            )}

            {/* Tube label */}
            <text x={cx + drawRL / 2} y={cy + 5}
              textAnchor="middle" fontSize={12} fill={color} fontWeight="700" fontFamily="Arial,sans-serif">
              Ø{tubeMm} × {wallMm} mm
            </text>

            {/* Grooves */}
            {groovesQty > 0 && (() => {
              const grooveW = 4;
              const grooveDepth = Math.min(8, visualDia * 0.12);
              const spacing = drawRL / (groovesQty + 1);
              return Array.from({ length: groovesQty }, (_, gi) => {
                const gx = cx + spacing * (gi + 1);
                return (
                  <g key={gi}>
                    <rect x={gx - grooveW / 2} y={tubeY1} width={grooveW} height={grooveDepth}
                      fill="#fff" stroke="#94a3b8" strokeWidth={1} />
                    <rect x={gx - grooveW / 2} y={tubeY2 - grooveDepth} width={grooveW} height={grooveDepth}
                      fill="#fff" stroke="#94a3b8" strokeWidth={1} />
                    {gi === 0 && (
                      <text x={gx} y={tubeY1 - 5} textAnchor="middle" fontSize={8} fill="#94a3b8" fontFamily="Arial,sans-serif">
                        groove
                      </text>
                    )}
                  </g>
                );
              });
            })()}

            {/* Drive head / sprocket */}
            {driveHead && (() => {
              const spOD = driveHead.OD_mm || 57;
              const isDouble = /double/i.test(driveHead.type || "");
              const isPolyVee = /polyvee/i.test(driveHead.pitch || "");
              const isRoundBelt = /round/i.test(driveHead.pitch || "");
              const spVisR = Math.min(50, Math.max(16, (spOD / tubeMm) * (visualDia / 2) * 1.15));
              const numTeeth = driveHead.teeth || (isPolyVee ? 0 : 12);
              const toothH = isPolyVee || isRoundBelt ? 0 : Math.max(4, spVisR * 0.13);
              const toothW = numTeeth > 0 ? Math.max(3, (2 * spVisR * 0.85) / numTeeth * 0.6) : 0;
              const singleHubW = Math.max(12, spVisR * 0.5);
              const hubGap = isDouble ? Math.max(5, spVisR * 0.18) : 0;
              const sx = cx + drawRL - singleHubW * 0.3;
              const sy = cy;
              const hubTop = sy - spVisR;
              const hubBot = sy + spVisR;
              const boreR = Math.max(4, spVisR * 0.2);

              function renderDisc(x0, w, key) {
                const dcx = x0 + w / 2;
                const visTeeth = numTeeth > 0 ? Math.max(3, Math.round(numTeeth / 3.5)) : 0;
                const tSpacing = w / (visTeeth + 1);
                const topT = Array.from({ length: visTeeth }, (_, i) => {
                  const tx = x0 + tSpacing * (i + 1);
                  return `M${tx - toothW/2},${hubTop} L${tx},${hubTop - toothH} L${tx + toothW/2},${hubTop}`;
                }).join(" ");
                const botT = Array.from({ length: visTeeth }, (_, i) => {
                  const tx = x0 + tSpacing * (i + 1);
                  return `M${tx - toothW/2},${hubBot} L${tx},${hubBot + toothH} L${tx + toothW/2},${hubBot}`;
                }).join(" ");
                const polyVeeGrooves = isPolyVee ? Array.from({ length: Math.max(4, Math.floor(w / 5)) }, (_, i) => {
                  const gx = x0 + (i + 1) * w / (Math.floor(w / 5) + 1);
                  const gDepth = spVisR * 0.15;
                  return `M${gx},${hubTop} L${gx},${hubTop + gDepth} M${gx},${hubBot} L${gx},${hubBot - gDepth}`;
                }).join(" ") : null;
                return (
                  <g key={key}>
                    <rect x={x0} y={hubTop} width={w} height={spVisR * 2}
                      fill={isPolyVee ? "#a78bfa" : isRoundBelt ? "#60a5fa" : "#f59e0b"}
                      fillOpacity={0.2} stroke={isPolyVee ? "#7c3aed" : isRoundBelt ? "#2563eb" : "#d97706"}
                      strokeWidth={1.8} rx={1.5} />
                    {numTeeth > 0 && <path d={topT} fill={isPolyVee ? "#a78bfa" : "#f59e0b"} fillOpacity={0.8}
                      stroke={isPolyVee ? "#7c3aed" : "#d97706"} strokeWidth={0.8} strokeLinejoin="round" />}
                    {numTeeth > 0 && <path d={botT} fill={isPolyVee ? "#a78bfa" : "#f59e0b"} fillOpacity={0.8}
                      stroke={isPolyVee ? "#7c3aed" : "#d97706"} strokeWidth={0.8} strokeLinejoin="round" />}
                    {isPolyVee && <path d={polyVeeGrooves} fill="none" stroke="#7c3aed" strokeWidth={1.5} strokeOpacity={0.6} />}
                    {isRoundBelt && <ellipse cx={dcx} cy={hubTop} rx={w * 0.35} ry={spVisR * 0.12}
                      fill="#60a5fa" fillOpacity={0.6} stroke="#2563eb" strokeWidth={0.8} />}
                    {isRoundBelt && <ellipse cx={dcx} cy={hubBot} rx={w * 0.35} ry={spVisR * 0.12}
                      fill="#60a5fa" fillOpacity={0.6} stroke="#2563eb" strokeWidth={0.8} />}
                    {[0.25, 0.5, 0.75].map((f, i) => (
                      <line key={i} x1={x0 + w * f} y1={hubTop + 3} x2={x0 + w * f} y2={hubBot - 3}
                        stroke={isPolyVee ? "#7c3aed" : "#d97706"} strokeWidth={0.5} strokeOpacity={0.3} />
                    ))}
                    <circle cx={dcx} cy={sy} r={boreR}
                      fill="#fff" stroke={isPolyVee ? "#7c3aed" : "#d97706"} strokeWidth={1.2} />
                  </g>
                );
              }
              const labelColor = isPolyVee ? "#7c3aed" : isRoundBelt ? "#1d4ed8" : "#b45309";
              const labelCx = sx + (isDouble ? singleHubW * 2 + hubGap : singleHubW) / 2;
              return (
                <g>
                  {renderDisc(sx, singleHubW, "disc1")}
                  {isDouble && renderDisc(sx + singleHubW + hubGap, singleHubW, "disc2")}
                  {isDouble && <rect x={sx + singleHubW} y={sy - spVisR * 0.4} width={hubGap} height={spVisR * 0.8}
                    fill="#e5e7eb" fillOpacity={0.6} />}
                  <line x1={sx - 7} y1={hubTop - toothH} x2={sx - 7} y2={hubBot + toothH}
                    stroke={labelColor} strokeWidth={0.8} strokeDasharray="2 2" />
                  <text x={sx - 9} y={sy + 4} textAnchor="end" fontSize={7.5} fill={labelColor}
                    fontWeight="700" fontFamily="Arial,sans-serif">Ø{spOD}</text>
                  <text x={labelCx} y={hubBot + toothH + 13} textAnchor="middle" fontSize={8}
                    fill={labelColor} fontWeight="700" fontFamily="Arial,sans-serif">
                    {driveHead.pitch}{numTeeth > 0 ? ` T${numTeeth}` : ""}{isDouble ? " ×2" : ""}
                  </text>
                </g>
              );
            })()}
          </>
        )}

        {/* ── C: Boxed dimension callout — RL ── */}
        <line x1={cx} y1={dimY_RL} x2={cx + drawRL} y2={dimY_RL}
          stroke="#64748b" strokeWidth={1} markerEnd="url(#arr)" markerStart="url(#arrL)" />
        {/* Extension tick lines */}
        <line x1={cx} y1={botRef + 4} x2={cx} y2={dimY_RL + 2} stroke="#64748b" strokeWidth={0.7} strokeDasharray="2 2" />
        <line x1={cx + drawRL} y1={botRef + 4} x2={cx + drawRL} y2={dimY_RL + 2} stroke="#64748b" strokeWidth={0.7} strokeDasharray="2 2" />
        <DimLabel x={cx + drawRL / 2} y={dimY_RL} text={rlLabel} color="#475569" />

        {/* ── C: Boxed dimension callout — EL ── */}
        <line x1={4} y1={dimY_EL} x2={VW - 4} y2={dimY_EL}
          stroke="#374151" strokeWidth={1} strokeDasharray="5 3" markerEnd="url(#arr)" markerStart="url(#arrL)" />
        <DimLabel x={VW / 2} y={dimY_EL} text={elLabel} color="#1f2937" />

        {/* ── C: Boxed dimension callout — B / LH (left) ── */}
        <line x1={4} y1={shaftDimY} x2={cx - 2} y2={shaftDimY}
          stroke={isVariable ? "#b45309" : "#2563eb"} strokeWidth={1}
          markerEnd={isVariable ? "url(#arrV)" : "url(#arrB)"}
          markerStart={isVariable ? "url(#arrVL)" : "url(#arrBL)"} />
        <line x1={4} y1={topRef - 4} x2={4} y2={shaftDimY + 2}
          stroke={isVariable ? "#b45309" : "#2563eb"} strokeWidth={0.7} strokeDasharray="2 2" />
        <line x1={cx} y1={topRef - 4} x2={cx} y2={shaftDimY + 2}
          stroke={isVariable ? "#b45309" : "#2563eb"} strokeWidth={0.7} strokeDasharray="2 2" />
        <DimLabel x={cx / 2} y={shaftDimY} text={isVariable ? lhLabel : bLabel}
          color={isVariable ? "#b45309" : "#2563eb"} />

        {/* ── C: Boxed dimension callout — B / RH (right) ── */}
        <line x1={cx + drawRL + 2} y1={shaftDimY} x2={VW - 4} y2={shaftDimY}
          stroke={isVariable ? "#b45309" : "#2563eb"} strokeWidth={1}
          markerEnd={isVariable ? "url(#arrV)" : "url(#arrB)"}
          markerStart={isVariable ? "url(#arrVL)" : "url(#arrBL)"} />
        <line x1={cx + drawRL} y1={topRef - 4} x2={cx + drawRL} y2={shaftDimY + 2}
          stroke={isVariable ? "#b45309" : "#2563eb"} strokeWidth={0.7} strokeDasharray="2 2" />
        <line x1={VW - 4} y1={topRef - 4} x2={VW - 4} y2={shaftDimY + 2}
          stroke={isVariable ? "#b45309" : "#2563eb"} strokeWidth={0.7} strokeDasharray="2 2" />
        <DimLabel x={cx + drawRL + shaftVisLen / 2} y={shaftDimY}
          text={isVariable ? rhLabel : bLabel}
          color={isVariable ? "#b45309" : "#2563eb"} />
      </svg>

      {/* Legend row */}
      <div style={{ marginTop: 8, display: "flex", gap: 14, flexWrap: "wrap", fontSize: 11 }}>
        {hasSleeve && !isTapered && (
          <div style={{ display: "flex", alignItems: "center", gap: 5, color: sleeveColor }}>
            <div style={{ width: 12, height: 12, borderRadius: 2, background: sleeveColor, opacity: 0.7 }} />
            <span style={{ fontWeight: 600 }}>{sleeve}</span>
          </div>
        )}
        {isTapered && (
          <div style={{ display: "flex", alignItems: "center", gap: 5, color: "#16a34a" }}>
            <div style={{ width: 16, height: 2, background: "#16a34a" }} />
            <span>d = small end · D = large end</span>
          </div>
        )}
        {!isTapered && (
          <div style={{ display: "flex", alignItems: "center", gap: 5, color: "#94a3b8" }}>
            <div style={{ width: 10, height: 10, borderRadius: 2, background: "#94a3b8", opacity: 0.4, border: "1px solid #94a3b8" }} />
            <span>Bearing housing</span>
          </div>
        )}
        {groovesQty > 0 && (
          <div style={{ display: "flex", alignItems: "center", gap: 5, color: "#94a3b8" }}>
            <div style={{ width: 6, height: 10, border: "1px solid #94a3b8", background: "#fff" }} />
            <span>{groovesQty} groove{groovesQty > 1 ? "s" : ""}</span>
          </div>
        )}
        {driveHead && (
          <div style={{ display: "flex", alignItems: "center", gap: 5, color: "#d97706" }}>
            <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#f59e0b", opacity: 0.7 }} />
            <span style={{ fontWeight: 600 }}>{driveHead.label}</span>
          </div>
        )}
        <div style={{ display: "flex", alignItems: "center", gap: 5, color: "#475569" }}>
          <div style={{ width: 16, height: 1.5, background: "#475569" }} />
          <span>RL = body</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 5, color: "#1f2937" }}>
          <div style={{ width: 16, height: 1.5, background: "#1f2937", borderTop: "2px dashed #374151" }} />
          <span>EL = end-to-end</span>
        </div>
        {isVariable ? (
          <div style={{ display: "flex", alignItems: "center", gap: 5, color: "#b45309" }}>
            <div style={{ width: 16, height: 1.5, background: "#b45309" }} />
            <span>LH / RH shaft extensions</span>
          </div>
        ) : (
          <div style={{ display: "flex", alignItems: "center", gap: 5, color: "#2563eb" }}>
            <div style={{ width: 16, height: 1.5, background: "#2563eb" }} />
            <span>B = shaft extension</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Interroll Part Number Builder ───────────────────────────────────────────
// Format: BearingPartNo.TubePartNo ShaftPartNo-BF"
// Example: 1.131.G49 C40-14.88"
// BF (Between Frame) = RL in inches + shaft extension
// Bearing codes by series platform
const BEARING_CODES = {
  "1100": "1.111",
  "1200": "1.121",
  "1450": "1.145",
  "1500": "1.150",
  "1700": "1.170",
  "3500": "1.350",
  "3800": "1.380",
  "3950": "1.395",
  "MSC50": "1.MSC",
};

// Tube part codes: G = galvanized/zinc-plated, S = stainless, A = aluminum, P = PVC
// Format: [Material prefix][tube OD in mm]
function getTubeCode(tubeObj) {
  if (!tubeObj) return "???";
  const dia = tubeObj.tube_mm;
  const mats = (tubeObj.materials || []).join(",").toLowerCase();
  let prefix = "G"; // default galvanized
  if (mats.includes("stainless")) prefix = "S";
  else if (mats.includes("aluminum")) prefix = "A";
  else if (mats.includes("pvc")) prefix = "P";
  return `${prefix}${dia}`;
}

// Shaft codes per Interroll convention
const SHAFT_CODE_MAP = {
  spring:          "SP",
  fixed:           "FX",
  female_M6:       "F06",
  female_M8:       "F08",
  female_M20:      "F20",
  female_17:       "F17",
  female_12:       "F12",
  female_14:       "F14",
  female_8:        "F08",
  female_10:       "F10",
  female_11hex:    "F11H",
  female:          "F",
  male:            "M",
  male_8:          "M08",
  male_10:         "M10",
  male_12:         "M12",
  male_14:         "M14",
  male_20:         "M20",
  flat:            "FL",
  variable:        "VAR",
  tapered_shuttle: "TH",
  tapered_th:      "TH",
  fixed_20:        "FX20",
  spring_20:       "SP20",
  fixed_ss_pin:    "SS",
  spring_11hex_ss: "SP11H",
  fixed_11hex_ss:  "FX11H",
  female_M8_11hex_ss: "F11H",
  bolt_ip55:       "IP55",
  spring_11hex:    "SP11H",
  fixed_11hex:     "FX11H",
  female_20:       "F20",
};

function getShaftCode(shaftObj) {
  if (!shaftObj) return "???";
  return SHAFT_CODE_MAP[shaftObj.code] || shaftObj.code?.toUpperCase() || "???";
}

// Sleeve suffix codes
function getSleeveCode(sleeve) {
  if (!sleeve || sleeve === "None") return "";
  if (/pvc/i.test(sleeve)) return "-PVC";
  if (/pu/i.test(sleeve)) return "-PU";
  if (/lagging/i.test(sleeve)) return "-LAG";
  return "";
}

function buildPartNumber(series, tubeObj, shaftObj, rl, sleeve, groovesQty, bearingObj) {
  const bearingCode = bearingObj?.code || BEARING_CODES[series.platform] || BEARING_CODES[series.id] || "1.???";
  const tubeCode = getTubeCode(tubeObj);
  const shaftCode = getShaftCode(shaftObj);
  const sleeveCode = getSleeveCode(sleeve);
  const grooveCode = groovesQty > 0 ? `G${groovesQty}` : "";
  // BF in inches = RL mm / 25.4, rounded to 2 decimals
  const rlVal = parseInt(rl) || 600;
  const bfInches = (rlVal / 25.4).toFixed(2);
  // Options suffix
  const optSuffix = [grooveCode, sleeveCode.replace("-", "")].filter(Boolean).join(".");
  const optPart = optSuffix ? ` [${optSuffix}]` : "";
  return `${bearingCode}.${tubeCode} ${shaftCode}-${bfInches}"${optPart}`;
}

// ─── Tear Sheet ───────────────────────────────────────────────────────────────
function buildTearSheetHTML(series, config) {
  const { tubeObj, shaftObj, rl, sleeve, groovesQty, bearingObj } = config;
  const partNumber = buildPartNumber(series, tubeObj, shaftObj, rl, sleeve, groovesQty, bearingObj);
  const rlVal = parseInt(rl) || 600;
  const tubeMm = tubeObj?.tube_mm || 50;
  const wallMm = tubeObj?.wall_mm || 1.5;
  const color = series.color || "#1A3A5C";
  const bMm = getShaftExtMm(shaftObj);
  const elMm = rlVal + bMm * 2;

  // Sleeve
  const hasSleeve = sleeve && sleeve !== "None";
  let sleeveColor = "#f59e0b";
  if (/pu/i.test(sleeve || "")) sleeveColor = "#a78bfa";
  if (/pvc/i.test(sleeve || "")) sleeveColor = "#60a5fa";
  if (/lagging/i.test(sleeve || "")) sleeveColor = "#6b7280";

  // SVG layout
  const shaftArm = 44;
  const drawRL = Math.min(400, rlVal * 0.55 + 160);
  const cx = shaftArm + 4;
  const svgW = drawRL + shaftArm * 2 + 8;
  const svgH = Math.max(120, tubeMm * 2.2 + 80);
  const cy = svgH / 2 - 10;
  const tubeY1 = cy - tubeMm / 2;
  const tubeY2 = cy + tubeMm / 2;
  const innerY1 = cy - (tubeMm / 2 - wallMm);
  const sleeveThick = hasSleeve ? Math.max(4, tubeMm * 0.1) : 0;
  const dimY1 = tubeY2 + 14;
  const dimY2 = tubeY2 + 28;
  const bDimY = tubeY1 - (hasSleeve ? sleeveThick : 0) - 14;

  const schematicSVG = `<svg width="${svgW}" height="${svgH}" viewBox="0 0 ${svgW} ${svgH}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <marker id="a1" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill="#64748b"/></marker>
      <marker id="a2" markerWidth="6" markerHeight="6" refX="1" refY="3" orient="auto"><path d="M6,0 L0,3 L6,6 Z" fill="#64748b"/></marker>
      <marker id="b1" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill="#2563eb"/></marker>
      <marker id="b2" markerWidth="6" markerHeight="6" refX="1" refY="3" orient="auto"><path d="M6,0 L0,3 L6,6 Z" fill="#2563eb"/></marker>
    </defs>
    <!-- Shaft arms -->
    <line x1="0" y1="${cy}" x2="${cx}" y2="${cy}" stroke="#64748b" stroke-width="4" stroke-linecap="round"/>
    <line x1="${cx+drawRL}" y1="${cy}" x2="${svgW}" y2="${cy}" stroke="#64748b" stroke-width="4" stroke-linecap="round"/>
    <!-- Sleeve overlay -->
    ${hasSleeve ? `<rect x="${cx}" y="${tubeY1-sleeveThick}" width="${drawRL}" height="${tubeMm+sleeveThick*2}" rx="${tubeMm/6}" fill="${sleeveColor}" fill-opacity="0.3" stroke="${sleeveColor}" stroke-width="1.5"/>` : ""}
    <!-- Tube body -->
    <rect x="${cx}" y="${tubeY1}" width="${drawRL}" height="${tubeMm}" rx="${tubeMm/6}" fill="${color}" fill-opacity="0.18" stroke="${color}" stroke-width="2"/>
    <!-- Inner bore -->
    <rect x="${cx+wallMm*2}" y="${innerY1}" width="${drawRL-wallMm*4}" height="${tubeMm-wallMm*2}" rx="${(tubeMm-wallMm*2)/6}" fill="white" fill-opacity="0.7" stroke="${color}" stroke-width="0.7" stroke-dasharray="4 2"/>
    <!-- Sleeve label -->
    ${hasSleeve ? `<text x="${cx+drawRL-4}" y="${tubeY1-sleeveThick-3}" text-anchor="end" font-size="8" fill="${sleeveColor}" font-weight="bold" font-family="Arial,sans-serif">${sleeve}</text>` : ""}
    <!-- Tube label -->
    <text x="${cx+drawRL/2}" y="${cy+4}" text-anchor="middle" font-size="10" fill="${color}" font-weight="bold" font-family="Arial,sans-serif">&#216;${tubeMm} x ${wallMm}mm</text>
    <!-- RL dim line -->
    <line x1="${cx}" y1="${dimY1}" x2="${cx+drawRL}" y2="${dimY1}" stroke="#64748b" stroke-width="1" marker-end="url(#a1)" marker-start="url(#a2)"/>
    <text x="${cx+drawRL/2}" y="${dimY1+11}" text-anchor="middle" font-size="9" fill="#64748b" font-family="Arial,sans-serif" font-weight="600">RL = ${rlVal} mm (${(rlVal/25.4).toFixed(3)}")</text>
    <!-- EL dim line -->
    <line x1="0" y1="${dimY2}" x2="${svgW}" y2="${dimY2}" stroke="#374151" stroke-width="1" stroke-dasharray="3 2" marker-end="url(#a1)" marker-start="url(#a2)"/>
    <text x="${svgW/2}" y="${dimY2+11}" text-anchor="middle" font-size="9" fill="#374151" font-family="Arial,sans-serif" font-weight="600">EL = ${elMm} mm (${(elMm/25.4).toFixed(3)}")</text>
    <!-- B dim left -->
    <line x1="0" y1="${bDimY}" x2="${cx}" y2="${bDimY}" stroke="#2563eb" stroke-width="1" marker-end="url(#b1)" marker-start="url(#b2)"/>
    <text x="${cx/2}" y="${bDimY-3}" text-anchor="middle" font-size="8" fill="#2563eb" font-weight="bold" font-family="Arial,sans-serif">B=${bMm}mm</text>
    <!-- B dim right -->
    <line x1="${cx+drawRL}" y1="${bDimY}" x2="${svgW}" y2="${bDimY}" stroke="#2563eb" stroke-width="1" marker-end="url(#b1)" marker-start="url(#b2)"/>
    <text x="${cx+drawRL+shaftArm/2}" y="${bDimY-3}" text-anchor="middle" font-size="8" fill="#2563eb" font-weight="bold" font-family="Arial,sans-serif">B=${bMm}mm</text>
  </svg>`;

  const date = new Date().toLocaleDateString("en-CA", { year: "numeric", month: "long", day: "numeric" });

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Roller Tear Sheet - ${series.name}</title>
  <style>
    *{margin:0;padding:0;box-sizing:border-box;}
    body{font-family:'Segoe UI',Arial,sans-serif;color:#111;}
    .hdr{background:#0f2340;color:#fff;padding:20px 32px;display:flex;justify-content:space-between;align-items:center;}
    .bar{height:4px;background:linear-gradient(90deg,#2d8a4e,#1a3a5c);}
    .body{padding:24px 32px;}
    h2{font-size:22px;font-weight:900;color:#0f2340;margin-bottom:4px;}
    .sub{font-size:13px;color:#64748b;margin-bottom:12px;}
    .pn{background:#0f2340;color:#fff;display:inline-block;padding:7px 16px;border-radius:6px;font-size:14px;font-weight:800;letter-spacing:1px;margin-bottom:16px;}
    .pn-lbl{font-size:9px;color:rgba(255,255,255,.5);text-transform:uppercase;letter-spacing:1px;margin-bottom:3px;}
    .schematic{background:#f1f5f9;border:1px solid #e2e8f0;border-radius:8px;padding:14px 16px;margin-bottom:18px;}
    .schem-title{font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#64748b;margin-bottom:8px;}
    .spec{background:#f8fafc;border:1px solid #e5e7eb;border-radius:6px;padding:12px 16px;margin-bottom:12px;}
    .spec-row{display:flex;gap:10px;margin-bottom:6px;font-size:13px;}
    .lbl{color:#94a3b8;font-weight:600;width:170px;flex-shrink:0;}
    .val{color:#0f2340;font-weight:700;}
    .notes{background:#fff8ed;border-left:3px solid #f59e0b;padding:10px 14px;font-size:12px;color:#334155;line-height:1.7;margin-top:12px;}
    .no-print{margin:16px 32px;display:flex;gap:10px;}
    @media print{.no-print{display:none!important;}}
    .btn{padding:8px 18px;border:none;border-radius:6px;cursor:pointer;font-size:13px;font-weight:700;}
    .btn-p{background:#0f2340;color:#fff;}
    .btn-s{background:#f1f5f9;color:#334155;border:1px solid #e2e8f0;}
    .footer{margin-top:24px;padding-top:12px;border-top:1px solid #e5e7eb;font-size:10px;color:#94a3b8;}
  </style>
</head>
<body>
<div class="no-print">
  <button class="btn btn-p" onclick="window.print()">Print / Save PDF</button>
  <button class="btn btn-s" onclick="window.close()">Close</button>
</div>
<div class="hdr">
  <img src="https://media.base44.com/images/public/69dd9ffccab4dd693d4d92f5/e48ee59d9_Unitingthestrongestlinks_20251031_225809_0000.png" style="max-height:34px;filter:brightness(0) invert(1);opacity:.9;" />
  <div style="text-align:right;font-size:11px;color:rgba(255,255,255,.5);">
    <div style="font-size:14px;font-weight:700;color:#fff;">Conveyor Roller - ${series.name}</div>
    <div>${date}</div>
  </div>
</div>
<div class="bar"></div>
<div class="body">
  <div style="display:flex;gap:20px;align-items:flex-start;margin-bottom:16px;flex-wrap:wrap;">
    ${series.image_url ? `<img src="${series.image_url}" alt="${series.name}" style="max-height:100px;max-width:150px;object-fit:contain;border:1px solid #e5e7eb;border-radius:6px;padding:8px;background:#f8fafc;" />` : ""}
    <div>
      <h2>${series.name}</h2>
      <div class="sub">${series.subtitle} - Catalog pages ${series.page_range}</div>
      <div class="pn-lbl">Interroll Part Number (Reference)</div>
      <div class="pn">${partNumber}</div>
    </div>
  </div>
  <div class="schematic">
    <div class="schem-title">Dimensional Schematic — RL = ${rlVal} mm &nbsp;|&nbsp; B = ${bMm} mm each side &nbsp;|&nbsp; EL = ${elMm} mm</div>
    ${schematicSVG}
  </div>
  <div class="spec">
    ${bearingObj ? `<div class="spec-row"><span class="lbl">Bearing</span><span class="val">${bearingObj.label}</span></div>` : ""}
    <div class="spec-row"><span class="lbl">Tube</span><span class="val">${tubeObj?.label || "---"}</span></div>
    <div class="spec-row"><span class="lbl">Shaft Type</span><span class="val">${shaftObj?.label || "---"}</span></div>
    <div class="spec-row"><span class="lbl">Body Length (RL)</span><span class="val">${rlVal} mm &nbsp;(${(rlVal/25.4).toFixed(3)}")</span></div>
    <div class="spec-row"><span class="lbl">Shaft Extension B (each side)</span><span class="val">${bMm} mm &nbsp;(${(bMm/25.4).toFixed(3)}")</span></div>
    <div class="spec-row"><span class="lbl">End Length (EL = RL + 2B)</span><span class="val">${elMm} mm &nbsp;(${(elMm/25.4).toFixed(3)}")</span></div>
    <div class="spec-row"><span class="lbl">Sleeve / Surface</span><span class="val">${sleeve || "None"}</span></div>
    <div class="spec-row"><span class="lbl">Grooves</span><span class="val">${groovesQty > 0 ? groovesQty + " groove(s)" : "None"}</span></div>
    <div class="spec-row"><span class="lbl">Drive Type</span><span class="val">${series.driveType}</span></div>
    <div class="spec-row"><span class="lbl">Max Load</span><span class="val">${series.maxLoad_N.toLocaleString()} N</span></div>
    <div class="spec-row"><span class="lbl">Max Speed</span><span class="val">${series.maxSpeed_ms} m/s</span></div>
    <div class="spec-row"><span class="lbl">Temperature Range</span><span class="val">${series.temp_min_C}&#176;C to +${series.temp_max_C}&#176;C</span></div>
    <div class="spec-row"><span class="lbl">Antistatic</span><span class="val">${series.antistatic}</span></div>
    <div class="spec-row"><span class="lbl">Dimension Formula</span><span class="val">${series.dim_formula}</span></div>
  </div>
  <div class="notes">${series.notes}</div>
  <div class="footer">Uniking Canada - unikingcanada.com - rfq@unikingcanada.com - Specifications per Interroll catalog. Confirm before supply.</div>
</div>
</body>
</html>`;
}

// ─── VIEW 1: Series Grid ──────────────────────────────────────────────────────
function SeriesGrid({ onSelect }) {
  const [filter, setFilter] = useState("All");
  const [hov, setHov] = useState(null);
  const duties = ["All", "Light", "Medium", "Heavy"];
  const filtered = filter === "All" ? ROLLER_SERIES : ROLLER_SERIES.filter(s => s.duty === filter);

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "24px clamp(12px,3vw,32px)" }}>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 22, fontWeight: 800, color: C.text, marginBottom: 4 }}>Conveyor Roller Series</div>
        <div style={{ fontSize: 14, color: C.muted }}>Select a series to view specifications and configure your roller</div>
      </div>

      {/* Duty filter */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
        {duties.map(d => (
          <button key={d} onClick={() => setFilter(d)}
            style={{ padding: "6px 16px", borderRadius: 99, fontSize: 12, fontWeight: 700, cursor: "pointer", border: "1px solid " + (filter === d ? NAVY : C.border), background: filter === d ? NAVY : "#fff", color: filter === d ? "#fff" : C.muted, transition: "all .13s" }}>
            {d === "All" ? `All (${ROLLER_SERIES.length})` : `${d} (${ROLLER_SERIES.filter(s => s.duty === d).length})`}
          </button>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 16 }}>
        {filtered.map(s => (
          <div key={s.id}
            onMouseEnter={() => setHov(s.id)} onMouseLeave={() => setHov(null)}
            onClick={() => onSelect(s)}
            style={{ background: C.card, border: "1px solid " + (hov === s.id ? NAVY_MID : C.border), borderRadius: 12, overflow: "hidden", cursor: "pointer", transition: "all .15s", boxShadow: hov === s.id ? "0 6px 20px rgba(0,60,91,.12)" : "0 1px 4px rgba(0,0,0,.05)", transform: hov === s.id ? "translateY(-2px)" : "none" }}>
            {/* Accent bar */}
            <div style={{ height: 3, background: s.color || NAVY }} />
            {/* Image */}
            {s.image_url && (
              <div style={{ background: "#f8fafc", height: 120, display: "flex", alignItems: "center", justifyContent: "center", borderBottom: "1px solid " + C.border }}>
                <img src={s.image_url} alt={s.name} style={{ maxHeight: 108, maxWidth: "88%", objectFit: "contain" }} onError={e => e.target.parentElement.style.display = "none"} />
              </div>
            )}
            <div style={{ padding: "14px 16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
                <span style={{ fontSize: 14, fontWeight: 800, color: C.text }}>{s.name}</span>
                <span style={{ fontSize: 10, fontWeight: 700, background: DUTY_COLOR[s.duty] + "18", color: DUTY_COLOR[s.duty], padding: "2px 7px", borderRadius: 99, border: "1px solid " + DUTY_COLOR[s.duty] + "44", whiteSpace: "nowrap", marginLeft: 6 }}>{s.duty}</span>
              </div>
              <div style={{ fontSize: 12, color: C.muted, marginBottom: 8 }}>{s.subtitle}</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 10 }}>
                <span style={{ fontSize: 11, color: C.slate }}><b>{s.maxLoad_N.toLocaleString()} N</b> max</span>
                <span style={{ color: C.border }}>·</span>
                <span style={{ fontSize: 11, color: C.slate }}><b>{s.maxSpeed_ms} m/s</b></span>
                <span style={{ color: C.border }}>·</span>
                <span style={{ fontSize: 11, color: C.slate }}>pp. {s.page_range}</span>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 12 }}>
                {s.tags.map(t => <span key={t} style={{ fontSize: 9, padding: "2px 7px", borderRadius: 99, background: "#e0f2fe", color: "#0369a1", fontWeight: 600 }}>{t}</span>)}
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: 12, color: C.muted }}>View details →</span>
                <div style={{ width: 28, height: 28, borderRadius: 6, background: NAVY, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ color: "#fff", fontSize: 14, fontWeight: 700 }}>›</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── VIEW 2: Series Detail ────────────────────────────────────────────────────
function SeriesDetail({ series, onBack, onConfigure }) {
  const [tab, setTab] = useState("overview");
  const tabs = [
    ["overview", "Overview"],
    ["load", "Load Table"],
    ["apps", "Applications"],
    series.sprockets ? ["sprockets", "Drive Heads"] : null,
  ].filter(Boolean);

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", padding: "24px clamp(12px,3vw,32px)" }}>
      {/* Breadcrumb */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: C.muted, marginBottom: 20 }}>
        <span onClick={onBack} style={{ cursor: "pointer", color: NAVY_MID, fontWeight: 600 }}>All Series</span>
        <span>›</span>
        <span style={{ color: C.muted }}>{series.name}</span>
      </div>

      {/* Hero */}
      <div style={{ background: NAVY_MID, borderRadius: 14, padding: "24px 28px", marginBottom: 24, display: "flex", gap: 24, alignItems: "flex-start", flexWrap: "wrap" }}>
        {series.image_url && (
          <div style={{ background: "rgba(255,255,255,.1)", borderRadius: 10, padding: 10, display: "flex", alignItems: "center", justifyContent: "center", width: 130, height: 100, flexShrink: 0 }}>
            <img src={series.image_url} alt={series.name} style={{ maxWidth: 118, maxHeight: 88, objectFit: "contain" }} onError={e => e.target.parentElement.style.display = "none"} />
          </div>
        )}
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
            <span style={{ fontSize: 24, fontWeight: 900, color: "#fff" }}>{series.name}</span>
            <span style={{ fontSize: 11, fontWeight: 700, background: DUTY_COLOR[series.duty] + "33", color: DUTY_COLOR[series.duty], padding: "3px 10px", borderRadius: 99, border: "1px solid " + DUTY_COLOR[series.duty] + "66" }}>{series.duty} Duty</span>
          </div>
          <div style={{ fontSize: 15, color: "rgba(255,255,255,.75)", marginBottom: 12 }}>{series.subtitle}</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
            {[
              ["Max Load", series.maxLoad_N.toLocaleString() + " N"],
              ["Max Speed", series.maxSpeed_ms + " m/s"],
              ["Temp Range", series.temp_min_C + "°C to +" + series.temp_max_C + "°C"],
              ["Antistatic", series.antistatic],
              ["Catalog", "pp. " + series.page_range],
            ].map(([l, v]) => (
              <div key={l} style={{ background: "rgba(255,255,255,.1)", borderRadius: 6, padding: "6px 12px" }}>
                <div style={{ fontSize: 9, color: "rgba(255,255,255,.45)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 2 }}>{l}</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#fff" }}>{v}</div>
              </div>
            ))}
          </div>
          {/* Configure Button */}
          <button onClick={onConfigure}
            style={{ padding: "11px 28px", borderRadius: 9, fontSize: 14, fontWeight: 800, cursor: "pointer", border: "none", background: series.color || "#2563eb", color: "#fff", letterSpacing: "0.02em", boxShadow: "0 4px 14px rgba(0,0,0,.25)", transition: "opacity .15s" }}
            onMouseEnter={e => e.target.style.opacity = ".85"} onMouseLeave={e => e.target.style.opacity = "1"}>
            ⚙ Configure This Roller
          </button>
        </div>
      </div>

      {/* Notes */}
      {series.notes && (
        <div style={{ background: "#fff8ed", borderLeft: "4px solid #f59e0b", borderRadius: 6, padding: "12px 16px", fontSize: 13, color: C.slate, lineHeight: 1.75, marginBottom: 20 }}>
          {series.notes}
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: "flex", gap: 0, borderBottom: "2px solid " + C.border, marginBottom: 20 }}>
        {tabs.map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)}
            style={{ padding: "10px 18px", border: "none", background: "none", cursor: "pointer", fontSize: 13, fontWeight: 700, color: tab === key ? NAVY : C.muted, borderBottom: tab === key ? "2px solid " + NAVY : "2px solid transparent", marginBottom: -2, whiteSpace: "nowrap" }}>
            {label}
          </button>
        ))}
      </div>

      {/* Tab: Overview — tubes + shafts */}
      {tab === "overview" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          <div style={{ background: C.card, borderRadius: 10, border: "1px solid " + C.border, padding: "18px 20px" }}>
            <div style={{ fontSize: 12, fontWeight: 800, textTransform: "uppercase", letterSpacing: 1, color: C.muted, marginBottom: 12 }}>Available Tubes</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {series.tubes.map((t, i) => (
                <div key={i} style={{ padding: "8px 12px", background: C.bg, borderRadius: 6, fontSize: 12, color: C.text, border: "1px solid " + C.border }}>{t.label}</div>
              ))}
            </div>
          </div>
          <div style={{ background: C.card, borderRadius: 10, border: "1px solid " + C.border, padding: "18px 20px" }}>
            <div style={{ fontSize: 12, fontWeight: 800, textTransform: "uppercase", letterSpacing: 1, color: C.muted, marginBottom: 12 }}>Shaft Options</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {series.shafts.map((s, i) => (
                <div key={i} style={{ padding: "8px 12px", background: C.bg, borderRadius: 6, fontSize: 12, color: C.text, border: "1px solid " + C.border }}>{s.label}</div>
              ))}
            </div>
            {series.sleeves?.length > 0 && (
              <>
                <div style={{ fontSize: 12, fontWeight: 800, textTransform: "uppercase", letterSpacing: 1, color: C.muted, margin: "16px 0 10px" }}>Surface Options</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {series.sleeves.map((s, i) => <span key={i} style={{ padding: "4px 10px", background: "#ede9fe", color: "#6d28d9", borderRadius: 99, fontSize: 11, fontWeight: 600 }}>{s}</span>)}
                </div>
              </>
            )}
          </div>
          <div style={{ gridColumn: "1 / -1", background: C.card, borderRadius: 10, border: "1px solid " + C.border, padding: "18px 20px" }}>
            <div style={{ fontSize: 12, fontWeight: 800, textTransform: "uppercase", letterSpacing: 1, color: C.muted, marginBottom: 10 }}>Drive Type</div>
            <div style={{ fontSize: 13, color: C.text }}>{series.driveType}</div>
            <div style={{ fontSize: 11, color: C.muted, marginTop: 10, lineHeight: 1.7 }}><b>Dimension Formula:</b> {series.dim_formula}</div>
          </div>
        </div>
      )}

      {/* Tab: Load Table */}
      {tab === "load" && (
        <div style={{ background: C.card, borderRadius: 10, border: "1px solid " + C.border, padding: "18px 20px" }}>
          <div style={{ fontSize: 12, color: C.muted, marginBottom: 8 }}>Max allowable load (N) by roller body length (mm). From Interroll catalog pp. {series.page_range}.</div>
          <LoadTable table={series.load_table} />
        </div>
      )}

      {/* Tab: Applications */}
      {tab === "apps" && (
        <div style={{ background: C.card, borderRadius: 10, border: "1px solid " + C.border, padding: "18px 20px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {series.applications.map((a, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", background: C.bg, borderRadius: 7, border: "1px solid " + C.border }}>
                <span style={{ color: "#16a34a", fontWeight: 800, fontSize: 16 }}>✓</span>
                <span style={{ fontSize: 13, color: C.text }}>{a}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Drive Heads */}
      {tab === "sprockets" && series.sprockets && (
        <div style={{ background: C.card, borderRadius: 10, border: "1px solid " + C.border, padding: "18px 20px" }}>
          {series.sprockets.note && <div style={{ fontSize: 12, color: C.muted, marginBottom: 12 }}>{series.sprockets.note}</div>}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 10 }}>
            {series.sprockets.drives.map((d, i) => (
              <div key={i} style={{ background: C.bg, borderRadius: 8, border: "1px solid " + C.border, padding: "12px 14px" }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: NAVY_MID, marginBottom: 6 }}>{d.label}</div>
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

      {/* Bottom Configure CTA */}
      <div style={{ marginTop: 28, padding: "20px 24px", background: "#f0f7ff", borderRadius: 12, border: "1px solid #bfdbfe", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: NAVY_MID }}>Ready to configure?</div>
          <div style={{ fontSize: 12, color: C.muted }}>Select your tube, shaft, length and options — then add to RFQ or print a tear sheet.</div>
        </div>
        <button onClick={onConfigure}
          style={{ padding: "11px 28px", borderRadius: 9, fontSize: 14, fontWeight: 800, cursor: "pointer", border: "none", background: NAVY, color: "#fff" }}>
          ⚙ Configure This Roller
        </button>
      </div>
    </div>
  );
}

// ─── VIEW 3: Configurator ─────────────────────────────────────────────────────
function Configurator({ series, onBack, onGoRFQ }) {
  const [tubeIdx, setTubeIdx] = useState(0);
  const [shaftIdx, setShaftIdx] = useState(0);
  const [sleeveIdx, setSleeveIdx] = useState(0);
  const [bearingIdx, setBearingIdx] = useState(0);
  const [rl, setRl] = useState("600");
  const [groovesQty, setGroovesQty] = useState(0);
  const [rfqAdded, setRfqAdded] = useState(false);
  const [imperial, setImperial] = useState(false);
  const [sprocketIdx, setSprocketIdx] = useState(0);
  const [varShaftRH, setVarShaftRH] = useState("50");
  const [varShaftLH, setVarShaftLH] = useState("50");

  const tube = series.tubes[tubeIdx];
  const shaft = series.shafts[shaftIdx];
  const sleeve = series.sleeves?.[sleeveIdx];
  const bearings = series.bearings || [];
  const bearing = bearings[bearingIdx] || null;
  const hasGrooves = series.grooves === true || (typeof series.grooves === "object" && series.grooves);
  const driveHeads = series.sprockets?.drives || null;
  const driveHead = driveHeads ? driveHeads[sprocketIdx] : null;
  const isVariable = /variable/i.test(shaft?.code || "");
  const varRHmm = imperial ? Math.round(parseFloat(varShaftRH) * 25.4) : (parseInt(varShaftRH) || 50);
  const varLHmm = imperial ? Math.round(parseFloat(varShaftLH) * 25.4) : (parseInt(varShaftLH) || 50);

  const config = {
    tubeObj: tube,
    shaftObj: shaft,
    rl,
    sleeve,
    groovesQty,
    bearingObj: bearing
  };

  function addToRFQ() {
    const cart = getRFQCart();
    const id = "roller-" + series.id + "-" + Date.now();
    cart.push({
      cartId: id, id, _source: "roller",
      series: series.name, name: series.name,
      type: "Conveyor Rollers",
      style: tube?.label || "",
      category: series.subtitle,
      image_url: series.image_url || "",
      materials: tube?.materials?.join(", ") || "",
      application: series.applications?.[0] || "",
      quantity: 1, unit: "Each",
      notes: `RL=${rl}mm | Bearing: ${bearing?.label || "std"} | Shaft: ${shaft?.label || ""}${isVariable ? ` | LH=${varLHmm}mm RH=${varRHmm}mm` : ""} | Sleeve: ${sleeve || "None"}${driveHead ? " | Drive: " + driveHead.label : ""}${groovesQty > 0 ? " | Grooves: " + groovesQty : ""}`
    });
    saveRFQCart(cart);
    setRfqAdded(true);
  }

  // ── Config options panel (shared content) ────────────────────────────────
  const OptionsPanel = (
    <div style={{ background: C.card, borderRadius: 12, border: "1px solid " + C.border, padding: "22px 24px", marginBottom: 20 }}>
      <div style={{ fontSize: 12, fontWeight: 800, textTransform: "uppercase", letterSpacing: 1, color: C.muted, marginBottom: 18 }}>Configuration Options</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16 }}>
        {bearings.length > 0 && (
          <div style={{ gridColumn: "1 / -1" }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: C.muted, display: "block", marginBottom: 5 }}>Bearing Type</label>
            <select value={bearingIdx} onChange={e => setBearingIdx(Number(e.target.value))}
              style={{ width: "100%", padding: "9px 10px", border: "1px solid " + C.border, borderRadius: 7, fontSize: 12, outline: "none", background: "#fff" }}>
              {bearings.map((b, i) => <option key={i} value={i}>{b.label}</option>)}
            </select>
            {bearing?.note && <div style={{ fontSize: 10, color: C.muted, marginTop: 4, lineHeight: 1.5 }}>{bearing.note}</div>}
          </div>
        )}
        <div>
          <label style={{ fontSize: 11, fontWeight: 700, color: C.muted, display: "block", marginBottom: 5 }}>Tube</label>
          <select value={tubeIdx} onChange={e => setTubeIdx(Number(e.target.value))}
            style={{ width: "100%", padding: "9px 10px", border: "1px solid " + C.border, borderRadius: 7, fontSize: 12, outline: "none", background: "#fff" }}>
            {series.tubes.map((t, i) => {
              const label = imperial && t.tube_mm
                ? `${(t.tube_mm / 25.4).toFixed(3)}" OD × ${t.wall_mm ? (t.wall_mm / 25.4).toFixed(4) + '" wall' : ''} — ${t.materials?.join("/")||""}`
                : t.label;
              return <option key={i} value={i}>{label}</option>;
            })}
          </select>
        </div>
        <div>
          <label style={{ fontSize: 11, fontWeight: 700, color: C.muted, display: "block", marginBottom: 5 }}>Shaft Type</label>
          <select value={shaftIdx} onChange={e => setShaftIdx(Number(e.target.value))}
            style={{ width: "100%", padding: "9px 10px", border: "1px solid " + C.border, borderRadius: 7, fontSize: 12, outline: "none", background: "#fff" }}>
            {series.shafts.map((s, i) => {
              const bMm = getShaftExtMm(s);
              const label = imperial && bMm ? `${s.label} — B=${(bMm / 25.4).toFixed(3)}"` : s.label;
              return <option key={i} value={i}>{label}</option>;
            })}
          </select>
        </div>
        {isVariable && (
          <div style={{ gridColumn: "1 / -1", background: "#fef3c7", border: "1px solid #fde68a", borderRadius: 8, padding: "14px 16px" }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: "#b45309", marginBottom: 10, textTransform: "uppercase", letterSpacing: 1 }}>Variable Shaft Extensions</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: "#92400e", display: "block", marginBottom: 5 }}>LH (Left) — {imperial ? "in" : "mm"}</label>
                <input type="number" value={varShaftLH} min={imperial ? "0.5" : "10"} max={imperial ? "20" : "500"} step={imperial ? "0.125" : "5"}
                  onChange={e => setVarShaftLH(e.target.value)}
                  style={{ width: "100%", padding: "9px 10px", border: "1px solid #fde68a", borderRadius: 7, fontSize: 13, fontWeight: 700, outline: "none", background: "#fff", color: "#92400e" }} />
                <div style={{ fontSize: 10, color: "#b45309", marginTop: 3 }}>
                  = {imperial ? `${Math.round(parseFloat(varShaftLH||0)*25.4)} mm` : `${((parseInt(varShaftLH)||0)/25.4).toFixed(3)}"`}
                </div>
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: "#92400e", display: "block", marginBottom: 5 }}>RH (Right) — {imperial ? "in" : "mm"}</label>
                <input type="number" value={varShaftRH} min={imperial ? "0.5" : "10"} max={imperial ? "20" : "500"} step={imperial ? "0.125" : "5"}
                  onChange={e => setVarShaftRH(e.target.value)}
                  style={{ width: "100%", padding: "9px 10px", border: "1px solid #fde68a", borderRadius: 7, fontSize: 13, fontWeight: 700, outline: "none", background: "#fff", color: "#92400e" }} />
                <div style={{ fontSize: 10, color: "#b45309", marginTop: 3 }}>
                  = {imperial ? `${Math.round(parseFloat(varShaftRH||0)*25.4)} mm` : `${((parseInt(varShaftRH)||0)/25.4).toFixed(3)}"`}
                </div>
              </div>
            </div>
            <div style={{ marginTop: 10, fontSize: 11, color: "#92400e", background: "#fff", border: "1px solid #fde68a", borderRadius: 6, padding: "7px 10px" }}>
              EL = RL + LH + RH = {imperial
                ? `${((parseInt(rl)||600)/25.4).toFixed(3)}" + ${parseFloat(varShaftLH||0).toFixed(3)}" + ${parseFloat(varShaftRH||0).toFixed(3)}" = ${(((parseInt(rl)||600) + varLHmm + varRHmm)/25.4).toFixed(3)}"`
                : `${parseInt(rl)||600} + ${varLHmm} + ${varRHmm} = ${(parseInt(rl)||600) + varLHmm + varRHmm} mm`}
            </div>
          </div>
        )}
        <div>
          <label style={{ fontSize: 11, fontWeight: 700, color: C.muted, display: "block", marginBottom: 5 }}>
            Body Length (RL) — {imperial ? "in" : "mm"}
            <span style={{ color: "#94a3b8", fontWeight: 400 }}>
              {imperial ? ` = ${parseInt(rl)||600} mm` : ` = ${((parseInt(rl)||600)/25.4).toFixed(3)}"`}
            </span>
          </label>
          {imperial ? (
            <input type="number" value={((parseInt(rl)||600)/25.4).toFixed(3)}
              min={(100/25.4).toFixed(3)} max={(3000/25.4).toFixed(3)} step="0.125"
              onChange={e => setRl(String(Math.round(parseFloat(e.target.value)*25.4)))}
              style={{ width: "100%", padding: "9px 10px", border: "1px solid " + C.border, borderRadius: 7, fontSize: 12, outline: "none" }} />
          ) : (
            <input type="number" value={rl} min={100} max={3000} step={10} onChange={e => setRl(e.target.value)}
              style={{ width: "100%", padding: "9px 10px", border: "1px solid " + C.border, borderRadius: 7, fontSize: 12, outline: "none" }} />
          )}
        </div>
        {series.sleeves?.length > 0 && (
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: C.muted, display: "block", marginBottom: 5 }}>Sleeve / Surface</label>
            <select value={sleeveIdx} onChange={e => setSleeveIdx(Number(e.target.value))}
              style={{ width: "100%", padding: "9px 10px", border: "1px solid " + C.border, borderRadius: 7, fontSize: 12, outline: "none", background: "#fff" }}>
              {series.sleeves.map((s, i) => <option key={i} value={i}>{s}</option>)}
            </select>
          </div>
        )}
        {hasGrooves && (
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: C.muted, display: "block", marginBottom: 5 }}>Grooves (round belt)</label>
            <select value={groovesQty} onChange={e => setGroovesQty(Number(e.target.value))}
              style={{ width: "100%", padding: "9px 10px", border: "1px solid " + C.border, borderRadius: 7, fontSize: 12, outline: "none", background: "#fff" }}>
              {[0,1,2,3,4].map(n => <option key={n} value={n}>{n === 0 ? "No grooves" : `${n} groove${n>1?"s":""}`}</option>)}
            </select>
            {groovesQty > 0 && (
              <div style={{ marginTop: 6, background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 6, padding: "8px 10px", fontSize: 11, color: "#15803d" }}>
                <b>{groovesQty} groove{groovesQty>1?"s":""}</b> — spacing {imperial ? `${(((parseInt(rl)||600)/25.4)/(groovesQty+1)).toFixed(3)}"` : `${Math.round((parseInt(rl)||600)/(groovesQty+1))} mm`} apart
              </div>
            )}
            {typeof series.grooves === "object" && series.grooves.note && (
              <div style={{ fontSize: 10, color: C.muted, marginTop: 4, lineHeight: 1.5 }}>{series.grooves.note}</div>
            )}
          </div>
        )}
        {driveHeads && (
          <div style={{ gridColumn: "1 / -1" }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: "#d97706", display: "block", marginBottom: 5 }}>⚙ Drive Head / Sprocket</label>
            <select value={sprocketIdx} onChange={e => setSprocketIdx(Number(e.target.value))}
              style={{ width: "100%", padding: "9px 10px", border: "1px solid #fde68a", borderRadius: 7, fontSize: 12, outline: "none", background: "#fffbeb" }}>
              {driveHeads.map((d, i) => <option key={i} value={i}>{d.label}</option>)}
            </select>
            {driveHead && (
              <div style={{ marginTop: 8, display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px,1fr))", gap: 8 }}>
                {[
                  ["Pitch", driveHead.pitch],
                  driveHead.teeth ? ["Teeth", driveHead.teeth] : null,
                  driveHead.OD_mm ? ["OD", imperial ? `${(driveHead.OD_mm/25.4).toFixed(3)}"` : `${driveHead.OD_mm} mm`] : null,
                  driveHead.EL_formula ? ["EL Formula", driveHead.EL_formula] : null,
                  driveHead.max_load_N ? ["Max Load", `${driveHead.max_load_N.toLocaleString()} N`] : null,
                  driveHead.type ? ["Type", driveHead.type] : null,
                  driveHead.material ? ["Material", driveHead.material] : null,
                ].filter(Boolean).map(([k, v]) => (
                  <div key={k} style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 6, padding: "6px 10px" }}>
                    <div style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.8, color: "#d97706", marginBottom: 2 }}>{k}</div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "#92400e" }}>{v}</div>
                  </div>
                ))}
              </div>
            )}
            {series.sprockets?.note && <div style={{ fontSize: 10, color: C.muted, marginTop: 6, lineHeight: 1.5 }}>{series.sprockets.note}</div>}
          </div>
        )}
      </div>
      <div style={{ marginTop: 16, background: "#f0f7ff", borderRadius: 7, padding: "10px 14px", fontSize: 11, color: NAVY_MID, lineHeight: 1.7 }}>
        <b>Dimension Formula:</b> {series.dim_formula}
      </div>
    </div>
  );

  // ── Summary table ──────────────────────────────────────────────────────────
  const SummaryPanel = (
    <div style={{ background: C.card, borderRadius: 12, border: "1px solid " + C.border, padding: "20px 24px", marginBottom: 20 }}>
      <div style={{ fontSize: 12, fontWeight: 800, textTransform: "uppercase", letterSpacing: 1, color: C.muted, marginBottom: 14 }}>Configuration Summary</div>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
        <tbody>
          {(() => {
            const rlVal = parseInt(rl) || 600;
            const bMm = getShaftExtMm(shaft);
            const elMm = rlVal + bMm * 2;
            const fmtMm = v => imperial ? `${(v / 25.4).toFixed(3)}"` : `${v} mm`;
            return [
              bearing ? ["Bearing", bearing.label] : null,
              ["Tube", imperial && tube?.tube_mm
                ? `${(tube.tube_mm/25.4).toFixed(3)}" OD × ${tube.wall_mm ? (tube.wall_mm/25.4).toFixed(4)+'" wall' : ''} — ${tube.materials?.join("/")||""}`
                : (tube?.label || "—")],
              ["Shaft", imperial && getShaftExtMm(shaft)
                ? `${shaft?.label || "—"} — B=${(getShaftExtMm(shaft)/25.4).toFixed(3)}"`
                : (shaft?.label || "—")],
              isVariable ? ["LH Extension", imperial ? `${parseFloat(varShaftLH||0).toFixed(3)}"` : `${varLHmm} mm`] : null,
              isVariable ? ["RH Extension", imperial ? `${parseFloat(varShaftRH||0).toFixed(3)}"` : `${varRHmm} mm`] : null,
              ["Body Length (RL)", fmtMm(rlVal)],
              isVariable ? ["End Length (EL = RL+LH+RH)", fmtMm(rlVal + varLHmm + varRHmm)] : ["Shaft Ext. B (each side)", fmtMm(bMm)],
              isVariable ? null : ["End Length (EL)", fmtMm(elMm)],
              driveHead ? ["Drive Head", `${driveHead.label}${driveHead.OD_mm ? " — OD " + (imperial ? (driveHead.OD_mm/25.4).toFixed(3)+'"' : driveHead.OD_mm+" mm") : ""}`] : null,
              ["Sleeve / Surface", sleeve || "None"],
              ["Grooves", groovesQty > 0 ? `${groovesQty} groove(s) — ${imperial ? ((parseInt(rl)||600)/25.4/(groovesQty+1)).toFixed(3)+'"' : Math.round((parseInt(rl)||600)/(groovesQty+1))+" mm"} spacing` : "None"],
              ["Drive Type", series.driveType],
              ["Max Load", series.maxLoad_N.toLocaleString() + " N"],
              ["Max Speed", series.maxSpeed_ms + " m/s"],
              ["Temperature", series.temp_min_C + "°C to +" + series.temp_max_C + "°C"],
              ["Antistatic", series.antistatic],
            ].filter(Boolean);
          })().map(([k, v], i) => (
            <tr key={k} style={{ background: i % 2 === 0 ? C.bg : "#fff", borderBottom: "1px solid " + C.border }}>
              <td style={{ padding: "8px 12px", color: C.muted, fontWeight: 600, width: "45%" }}>{k}</td>
              <td style={{ padding: "8px 12px", color: C.text, fontWeight: 600 }}>{v}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {series.notes && (
        <div style={{ marginTop: 14, background: "#fff8ed", borderLeft: "3px solid #f59e0b", borderRadius: 4, padding: "10px 14px", fontSize: 12, color: C.slate, lineHeight: 1.75 }}>
          {series.notes}
        </div>
      )}
    </div>
  );

  // ── Right sticky panel: schematic + part number + actions ──────────────────
  const StickyRight = (
    <div style={{ position: "sticky", top: 16, display: "flex", flexDirection: "column", gap: 12 }}>
      {/* Metric / Imperial toggle */}
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <div style={{ display: "flex", background: C.border, borderRadius: 8, padding: 2, gap: 2 }}>
          {[["mm", false], ["in", true]].map(([label, val]) => (
            <button key={label} onClick={() => setImperial(val)}
              style={{ padding: "4px 14px", borderRadius: 6, fontSize: 12, fontWeight: 700, cursor: "pointer", border: "none", background: imperial === val ? NAVY : "transparent", color: imperial === val ? "#fff" : C.muted, transition: "all .13s" }}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Live Schematic */}
      <RollerSchematic series={series} rl={rl} tubeIdx={tubeIdx} sleeve={sleeve} shaftObj={shaft} imperial={imperial} groovesQty={groovesQty} driveHead={driveHead} varRHmm={isVariable ? varRHmm : null} varLHmm={isVariable ? varLHmm : null} />

      {/* Live Part Number */}
      <div style={{ background: NAVY, borderRadius: 8, padding: "10px 16px" }}>
        <div style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: "1.2px", color: "rgba(255,255,255,.45)", marginBottom: 3 }}>Interroll Part Number</div>
        <div style={{ fontSize: 15, fontWeight: 900, color: "#fff", letterSpacing: "0.5px", fontFamily: "monospace", wordBreak: "break-all" }}>
          {buildPartNumber(series, tube, shaft, rl, sleeve, groovesQty, bearing)}
        </div>
        <div style={{ fontSize: 10, color: "rgba(255,255,255,.45)", lineHeight: 1.6, marginTop: 6 }}>
          {(() => {
            const rlV = parseInt(rl) || 600;
            const bMm = getShaftExtMm(shaft);
            const elMm = rlV + bMm * 2;
            return imperial
              ? `RL = ${(rlV/25.4).toFixed(3)}" · B = ${(bMm/25.4).toFixed(3)}" · EL = ${(elMm/25.4).toFixed(3)}"`
              : `RL = ${rlV} mm · B = ${bMm} mm · EL = ${elMm} mm`;
          })()}
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <button onClick={addToRFQ}
          style={{ flex: 1, padding: "11px 16px", borderRadius: 9, fontSize: 13, fontWeight: 800, cursor: "pointer", border: "none", background: rfqAdded ? "#16a34a" : "#2563eb", color: "#fff", transition: "background .15s", minWidth: 120 }}>
          {rfqAdded ? "✓ Added to RFQ" : "+ Add to RFQ"}
        </button>
        <button onClick={() => {
          const html = buildTearSheetHTML(series, { tubeObj: tube, shaftObj: shaft, rl, sleeve, groovesQty, bearingObj: bearing });
          const blob = new Blob([html], { type: "text/html" });
          window.open(URL.createObjectURL(blob), "_blank");
        }} style={{ padding: "11px 14px", borderRadius: 9, fontSize: 13, fontWeight: 700, cursor: "pointer", border: "1px solid " + NAVY, background: "#fff", color: NAVY }}>
          🖨 Tear Sheet
        </button>
      </div>
      {rfqAdded && (
        <button onClick={onGoRFQ}
          style={{ width: "100%", padding: "10px", borderRadius: 9, fontSize: 13, fontWeight: 700, cursor: "pointer", border: "1px solid #16a34a", background: "#f0fdf4", color: "#16a34a" }}>
          View RFQ Cart →
        </button>
      )}
    </div>
  );

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "24px clamp(12px,3vw,32px)" }}>
      {/* Breadcrumb */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: C.muted, marginBottom: 16 }}>
        <span onClick={() => onBack("list")} style={{ cursor: "pointer", color: NAVY_MID, fontWeight: 600 }}>All Series</span>
        <span>›</span>
        <span onClick={() => onBack("detail")} style={{ cursor: "pointer", color: NAVY_MID, fontWeight: 600 }}>{series.name}</span>
        <span>›</span>
        <span style={{ color: C.muted }}>Configure</span>
      </div>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
        {series.image_url && (
          <div style={{ background: C.card, border: "1px solid " + C.border, borderRadius: 8, padding: 8, width: 64, height: 50, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <img src={series.image_url} alt={series.name} style={{ maxWidth: 56, maxHeight: 42, objectFit: "contain" }} onError={e => e.target.parentElement.style.display = "none"} />
          </div>
        )}
        <div>
          <div style={{ fontSize: 20, fontWeight: 900, color: C.text }}>{series.name} — Configurator</div>
          <div style={{ fontSize: 13, color: C.muted }}>{series.subtitle}</div>
        </div>
      </div>

      {/* ── B: Side-by-side layout — left: options, right: sticky schematic ── */}
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(0,520px)", gap: 24, alignItems: "start" }}>
        {/* Left: scrollable options + summary */}
        <div>
          {OptionsPanel}
          {SummaryPanel}
        </div>
        {/* Right: sticky schematic + part number + actions */}
        <div>
          {StickyRight}
        </div>
      </div>
    </div>
  );
}

// ─── Main Orchestrator ────────────────────────────────────────────────────────
export default function RollerConfigurator({ onBack, onGoRFQ }) {
  const [view, setView] = useState("list"); // list | detail | configure
  const [selected, setSelected] = useState(null);

  function handleSelectSeries(s) {
    setSelected(s);
    setView("detail");
    window.scrollTo(0, 0);
  }

  function handleConfigure() {
    setView("configure");
    window.scrollTo(0, 0);
  }

  function handleBack(to) {
    if (to === "list") { setView("list"); setSelected(null); }
    else if (to === "detail") { setView("detail"); }
    else { setView("list"); setSelected(null); }
    window.scrollTo(0, 0);
  }

  function handleTopBack() {
    if (view === "configure") { setView("detail"); window.scrollTo(0, 0); }
    else if (view === "detail") { setView("list"); setSelected(null); window.scrollTo(0, 0); }
    else { onBack && onBack(); }
  }

  const topBackLabel = view === "configure" ? `← ${selected?.name}` : view === "detail" ? "← All Series" : "← Back";

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "'Inter','Segoe UI',Arial,sans-serif" }}>
      <TopBar onBack={handleTopBack} onGoRFQ={onGoRFQ || (() => {})} />
      {view === "list" && <SeriesGrid onSelect={handleSelectSeries} />}
      {view === "detail" && selected && <SeriesDetail series={selected} onBack={() => handleBack("list")} onConfigure={handleConfigure} />}
      {view === "configure" && selected && <Configurator series={selected} onBack={handleBack} onGoRFQ={onGoRFQ || (() => {})} />}
    </div>
  );
}