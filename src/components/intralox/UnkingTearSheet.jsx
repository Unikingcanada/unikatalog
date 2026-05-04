/**
 * UniKing Branded Tear Sheet
 * Opens as a full-screen print/download modal with beautiful Uniking branding.
 * Includes: series image, live schematic SVG, all config specs, contact info.
 */

import { useRef } from "react";
import BeltSchematic from "./BeltSchematic";

const UNIKING_LOGO = "https://media.base44.com/images/public/69dd9ffccab4dd693d4d92f5/e48ee59d9_Unitingthestrongestlinks_20251031_225809_0000.png";
const INTRALOX_RED = "#E31837";
const NAVY = "#0F2340";
const NAVY_MID = "#1A3A5C";
const GOLD = "#C9A84C";

export default function UniKingTearSheet({ config, series, beltStyle, fields, beltRow, units, onClose }) {
  const printRef = useRef();

  function handlePrint() {
    const content = printRef.current;
    if (!content) return;
    const win = window.open("", "_blank", "width=900,height=1200");
    if (!win) { alert("Please allow popups to print the tear sheet."); return; }
    win.document.write(`<!DOCTYPE html><html lang="en"><head>
      <meta charset="UTF-8"/>
      <title>Uniking — ${series?.name || "Belt"} Tear Sheet</title>
      <style>
        *{margin:0;padding:0;box-sizing:border-box;}
        body{font-family:'Segoe UI',Arial,sans-serif;color:#111;background:#fff;-webkit-print-color-adjust:exact;print-color-adjust:exact;}
        @page{size:letter portrait;margin:0.5in;}
        @media print{.no-print{display:none!important;}}
      </style>
    </head><body>${content.innerHTML}</body></html>`);
    win.document.close();
    setTimeout(() => { win.focus(); win.print(); }, 600);
  }

  function handleDownloadPDF() {
    handlePrint();
  }

  const date = new Date().toLocaleDateString("en-CA", { year: "numeric", month: "long", day: "numeric" });
  const refNum = `UK-${series?.id || "BELT"}-${Date.now().toString().slice(-6)}`;

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(10,20,40,0.82)", zIndex: 9999,
      display: "flex", flexDirection: "column", alignItems: "center",
      overflowY: "auto", padding: "20px 16px",
    }}>
      {/* Toolbar */}
      <div className="no-print" style={{
        width: "100%", maxWidth: 860, background: NAVY, borderRadius: "12px 12px 0 0",
        padding: "12px 20px", display: "flex", alignItems: "center", gap: 10, flexShrink: 0,
      }}>
        <img src={UNIKING_LOGO} alt="Uniking" style={{ height: 28, filter: "brightness(0) invert(1)", opacity: 0.9 }} />
        <div style={{ flex: 1, color: "#fff", fontSize: 13, fontWeight: 700 }}>Belt Configuration Tear Sheet</div>
        <button onClick={handlePrint} style={{
          background: GOLD, color: NAVY, border: "none", borderRadius: 8,
          padding: "8px 18px", cursor: "pointer", fontSize: 13, fontWeight: 800,
        }}>🖨 Print / Save PDF</button>
        <button onClick={handleDownloadPDF} style={{
          background: "#1e40af", color: "#fff", border: "none", borderRadius: 8,
          padding: "8px 18px", cursor: "pointer", fontSize: 13, fontWeight: 700,
        }}>⬇ Download</button>
        <button onClick={onClose} style={{
          background: "rgba(255,255,255,0.12)", color: "#fff", border: "1px solid rgba(255,255,255,0.25)",
          borderRadius: 8, padding: "8px 14px", cursor: "pointer", fontSize: 13, fontWeight: 700,
        }}>✕ Close</button>
      </div>

      {/* Tear Sheet Paper */}
      <div ref={printRef} style={{
        width: "100%", maxWidth: 860, background: "#fff",
        borderRadius: "0 0 12px 12px", overflow: "hidden",
        boxShadow: "0 24px 80px rgba(0,0,0,0.4)",
      }}>

        {/* ── HEADER ── */}
        <div style={{ background: NAVY, padding: "24px 32px", display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
          <div>
            <img src={UNIKING_LOGO} alt="Uniking Canada" style={{ height: 36, filter: "brightness(0) invert(1)", opacity: 0.95, marginBottom: 8, display: "block" }} />
            <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 10, letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: 2 }}>Modular Plastic Belt — Configuration Sheet</div>
            <div style={{ color: "rgba(255,255,255,0.35)", fontSize: 9 }}>Source: 2026 Intralox MPB Engineering Manual</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ display: "inline-block", background: INTRALOX_RED, borderRadius: 4, padding: "3px 9px", marginBottom: 8 }}>
              <span style={{ fontSize: 9, fontWeight: 800, color: "#fff", letterSpacing: "0.8px" }}>INTRALOX AUTHORIZED</span>
            </div>
            <div style={{ color: "#fff", fontSize: 22, fontWeight: 900, lineHeight: 1.1 }}>{series?.name || "—"}</div>
            <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 13, marginTop: 4 }}>{beltStyle?.label || "Configuration"}</div>
            <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 10, marginTop: 6 }}>{date}</div>
            <div style={{ color: GOLD, fontSize: 10, fontWeight: 700, marginTop: 2 }}>Ref: {refNum}</div>
          </div>
        </div>

        {/* Accent bar */}
        <div style={{ height: 5, background: `linear-gradient(90deg, ${INTRALOX_RED} 0%, ${GOLD} 50%, ${NAVY} 100%)` }} />

        {/* ── BODY ── */}
        <div style={{ padding: "24px 32px" }}>

          {/* Two-col: Series image + Schematic */}
          <div style={{ display: "flex", gap: 20, marginBottom: 22 }}>
            {/* Series image */}
            <div style={{ width: 220, flexShrink: 0 }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: NAVY_MID, textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 6 }}>Belt Surface</div>
              {series?.image || beltStyle?.image ? (
                <img
                  src={beltStyle?.image || series?.image}
                  alt={beltStyle?.label || series?.name}
                  style={{ width: "100%", height: 140, objectFit: "cover", borderRadius: 8, border: "1.5px solid #e2e8f0" }}
                />
              ) : (
                <div style={{
                  width: "100%", height: 140, background: "#f0f4f8", borderRadius: 8,
                  border: "1.5px dashed #c8d4e0", display: "flex", alignItems: "center",
                  justifyContent: "center", flexDirection: "column", gap: 6,
                }}>
                  <div style={{ fontSize: 28, opacity: 0.25 }}>🔩</div>
                  <div style={{ fontSize: 9, color: "#94a3b8", textAlign: "center", padding: "0 10px" }}>Image to be added by Uniking</div>
                </div>
              )}
              {/* Series key specs below image */}
              <div style={{ marginTop: 10, background: "#f8fafc", borderRadius: 6, padding: "8px 10px", border: "1px solid #e2e8f0" }}>
                {[
                  ["Pitch", series?.pitch_in && series.pitch_in !== "To be confirmed by Uniking" ? `${series.pitch_in}" (${series.pitch_mm}mm)` : "TBC"],
                  ["Type", series?.beltType],
                  ["Open Area", beltStyle?.openArea || "—"],
                  ["Surface", beltStyle?.surface || "—"],
                  ["Catalog", series?.catalogPage ? `p.${series.catalogPage}` : "—"],
                ].map(([k, v]) => (
                  <div key={k} style={{ display: "flex", justifyContent: "space-between", fontSize: 10, marginBottom: 3 }}>
                    <span style={{ color: "#64748b", fontWeight: 600 }}>{k}:</span>
                    <span style={{ color: NAVY_MID, fontWeight: 700 }}>{v}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Schematic */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: NAVY_MID, textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 6 }}>Engineering Schematic (Top View)</div>
              <div style={{ border: "1.5px solid #c8d8e8", borderRadius: 8, overflow: "hidden", background: "#fff" }}>
                <BeltSchematic config={config} series={series} beltStyle={beltStyle} units={units} />
              </div>
            </div>
          </div>

          {/* Strength highlight */}
          {beltRow && (
            <div style={{
              background: "#f0fdf4", border: "1.5px solid #86efac", borderRadius: 8,
              padding: "10px 16px", marginBottom: 14, display: "flex", gap: 24,
            }}>
              <span style={{ fontSize: 11, color: "#166534", fontWeight: 600 }}>✓ Catalog-Confirmed Data:</span>
              <span style={{ fontSize: 11, color: "#166534" }}>Strength: <strong>{beltRow.strengthLbfFt?.toLocaleString()} lbf/ft ({beltRow.strengthNm?.toLocaleString()} N/m)</strong></span>
              <span style={{ fontSize: 11, color: "#166534" }}>Temp: <strong>{beltRow.tempF}°F / {beltRow.tempC}°C</strong></span>
              <span style={{ fontSize: 11, color: "#166534" }}>Mass: <strong>{beltRow.massLbFt2} lb/ft²</strong></span>
            </div>
          )}

          {/* ── Configuration Table ── */}
          <div style={{ marginBottom: 18 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: NAVY_MID, textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: 8 }}>Configuration Specifications</div>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
              <thead>
                <tr style={{ background: NAVY_MID }}>
                  <th style={{ padding: "7px 12px", color: "#fff", fontWeight: 700, textAlign: "left", width: "38%" }}>Parameter</th>
                  <th style={{ padding: "7px 12px", color: "#fff", fontWeight: 700, textAlign: "left" }}>Specified Value</th>
                </tr>
              </thead>
              <tbody>
                {fields.map(([k, v], i) => (
                  <tr key={k} style={{ background: i % 2 === 0 ? "#f8fafc" : "#fff" }}>
                    <td style={{ padding: "7px 12px", fontWeight: 700, color: NAVY_MID, borderBottom: "1px solid #f1f5f9" }}>{k}</td>
                    <td style={{
                      padding: "7px 12px", borderBottom: "1px solid #f1f5f9",
                      color: v?.includes("To be confirmed") ? "#92400e" : "#0f172a",
                      fontStyle: v?.includes("To be confirmed") ? "italic" : "normal",
                    }}>{v}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Applications */}
          {(series?.applications?.length > 0 || beltStyle?.applications?.length > 0) && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: NAVY_MID, textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: 6 }}>Applications</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                {[...(beltStyle?.applications || []), ...(series?.applications || [])].slice(0, 8).map((a, i) => (
                  <span key={i} style={{ background: "#eef3f8", color: NAVY_MID, fontSize: 10, fontWeight: 600, padding: "3px 9px", borderRadius: 10 }}>{a}</span>
                ))}
              </div>
            </div>
          )}

          {/* Disclaimer */}
          <div style={{
            background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 8,
            padding: "10px 14px", fontSize: 10, color: "#92400e", marginBottom: 16,
          }}>
            ⚠ <strong>Disclaimer:</strong> Final belt selection and specifications must be confirmed by Uniking before production. Contact Intralox for precise belt measurements and stock status before designing equipment or ordering a belt. All data sourced from 2026 Intralox MPB Engineering Manual.
          </div>

          {/* ── FOOTER ── */}
          <div style={{
            background: NAVY, borderRadius: 10, padding: "16px 24px",
            display: "flex", justifyContent: "space-between", alignItems: "center",
          }}>
            <div>
              <img src={UNIKING_LOGO} alt="Uniking" style={{ height: 22, filter: "brightness(0) invert(1)", opacity: 0.9, marginBottom: 4, display: "block" }} />
              <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 9 }}>Uniting the Strongest Links</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ color: GOLD, fontSize: 11, fontWeight: 800 }}>rfq@unikingcanada.com</div>
              <div style={{ color: "rgba(255,255,255,0.55)", fontSize: 9, marginTop: 2 }}>unikingcanada.com</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 9 }}>Ref: {refNum}</div>
              <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 9, marginTop: 2 }}>{date}</div>
              <div style={{ color: "rgba(255,255,255,0.35)", fontSize: 8, marginTop: 2 }}>Source: 2026 Intralox MPB Eng. Manual</div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}