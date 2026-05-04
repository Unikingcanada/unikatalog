import { useState, useRef } from "react";
import { INTRALOX_SERIES, INTRALOX_INDUSTRIES, INTRALOX_EQUIPMENT_TYPES, STRAIGHT_SERIES, RADIUS_SERIES, SPIRAL_SERIES } from "@/lib/intraloxData";
const ALL_SERIES = INTRALOX_SERIES;

const C = {
  navy: "#0F2340", navyMid: "#1A3A5C", gold: "#C9A84C", goldLight: "#e8c96d",
  green: "#16a34a", border: "#e2e8f0", muted: "#64748b", bg: "#f8fafc", text: "#0f172a"
};
const INTRALOX_RED = "#E31837";
const LOGO = "https://media.base44.com/images/public/69dd9ffccab4dd693d4d92f5/e48ee59d9_Unitingthestrongestlinks_20251031_225809_0000.png";

const STEPS = [
  "Series", "Belt Style", "Application", "Material", "Rod Material",
  "Belt Width", "Belt Length", "Drive / Sprockets", "Flights",
  "Sideguards", "Environment", "Product", "Quantity", "Uploads", "Notes", "Review"
];

// ── Live Schematic ────────────────────────────────────────────────────────────
function BeltSchematic({ config, series, beltStyle }) {
  const W = 560, H = 220;
  const beltX = 60, beltY = 60;
  const beltW = 440, beltH = 80;
  const widthNum = parseFloat(config.beltWidth) || 0;
  const lengthNum = parseFloat(config.beltLength) || 0;

  const isOpen = beltStyle?.surface?.toLowerCase().includes("grid") || beltStyle?.surface?.toLowerCase().includes("open");
  const wireColor = "#6B8CAE";
  const frameColor = C.navyMid;

  // Mesh pattern
  const meshLines = [];
  if (isOpen) {
    for (let x = beltX + 16; x < beltX + beltW - 8; x += 22) {
      meshLines.push(<line key={`v${x}`} x1={x} y1={beltY + 5} x2={x} y2={beltY + beltH - 5} stroke={wireColor} strokeWidth={1.5} opacity={0.5} />);
    }
  }
  for (let y = beltY + 12; y < beltY + beltH - 8; y += 16) {
    meshLines.push(<line key={`h${y}`} x1={beltX + 4} y1={y} x2={beltX + beltW - 4} y2={y} stroke={wireColor} strokeWidth={isOpen ? 1.2 : 2.2} opacity={isOpen ? 0.6 : 0.85} />);
  }

  // Material color hint
  const matColor = config.beltMaterial?.includes("Acetal") ? "#b0c4de"
    : config.beltMaterial?.includes("Polypropylene") ? "#d4e8c2"
    : config.beltMaterial?.includes("Nylon") ? "#ffd9a0"
    : config.beltMaterial?.includes("Polyethylene") ? "#c8e6ff"
    : "#dbe8f5";

  const hasFlights = config.flights && config.flights !== "none";
  const hasSideguards = config.sideguards && config.sideguards !== "none";

  return (
    <div style={{ background: "#0f2340", borderRadius: 12, padding: "12px 12px 8px", marginBottom: 16, border: "1px solid rgba(255,255,255,0.08)" }}>
      <div style={{ fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 6, textAlign: "center" }}>
        Live Belt Schematic — {series?.name || "Select Series"} {beltStyle?.label ? `· ${beltStyle.label}` : ""}
      </div>
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display: "block" }}>
        {/* Belt fill */}
        <rect x={beltX} y={beltY} width={beltW} height={beltH} fill={matColor} stroke={frameColor} strokeWidth={2} rx={2} opacity={0.9} />

        {/* Mesh pattern */}
        {meshLines}

        {/* Top/bottom edge */}
        {hasSideguards ? (
          <>
            <rect x={beltX} y={beltY} width={beltW} height={10} fill={C.gold} opacity={0.9} rx={1} />
            <rect x={beltX} y={beltY + beltH - 10} width={beltW} height={10} fill={C.gold} opacity={0.9} rx={1} />
          </>
        ) : (
          <>
            <rect x={beltX} y={beltY} width={beltW} height={4} fill={wireColor} opacity={0.7} rx={1} />
            <rect x={beltX} y={beltY + beltH - 4} width={beltW} height={4} fill={wireColor} opacity={0.7} rx={1} />
          </>
        )}

        {/* Flights */}
        {hasFlights && [0.2, 0.45, 0.7].map((t, i) => (
          <rect key={i} x={beltX + beltW * t} y={beltY - 14} width={6} height={14 + beltH + 14} fill={C.navyMid} opacity={0.7} rx={2} />
        ))}

        {/* Drive drums */}
        <ellipse cx={beltX} cy={beltY + beltH / 2} rx={13} ry={beltH / 2 + 4} fill="#1e3a5c" stroke={frameColor} strokeWidth={2} />
        <ellipse cx={beltX + beltW} cy={beltY + beltH / 2} rx={13} ry={beltH / 2 + 4} fill="#1e3a5c" stroke={frameColor} strokeWidth={2} />

        {/* Sprocket teeth on drive side */}
        {config.driveType && config.driveType !== "TBD" && [-20, -8, 4, 16, 28].map((offset, i) => (
          <rect key={i} x={beltX - 22} y={beltY + beltH / 2 + offset - 3} width={9} height={6} fill={C.gold} rx={2} opacity={0.8} />
        ))}

        {/* Pitch lines */}
        {series && (
          <text x={beltX + beltW / 2} y={beltY - 8} textAnchor="middle" fontSize={8} fill={C.gold} fontWeight="600">
            Pitch: {series.pitch_in}" ({series.pitch_mm} mm)
          </text>
        )}

        {/* Width dimension */}
        <defs>
          <marker id="ia" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill="#94a3b8" /></marker>
          <marker id="ib" markerWidth="6" markerHeight="6" refX="1" refY="3" orient="auto"><path d="M6,0 L0,3 L6,6 Z" fill="#94a3b8" /></marker>
        </defs>
        <line x1={beltX - 28} y1={beltY} x2={beltX - 28} y2={beltY + beltH} stroke="#94a3b8" strokeWidth={1} markerEnd="url(#ia)" markerStart="url(#ib)" />
        <text x={beltX - 46} y={beltY + beltH / 2 + 4} textAnchor="middle" fontSize={9} fill="#94a3b8" transform={`rotate(-90, ${beltX - 46}, ${beltY + beltH / 2 + 4})`}>
          {widthNum > 0 ? `W = ${widthNum}"` : "Width = ?"}
        </text>

        {/* Length dimension */}
        <line x1={beltX} y1={beltY + beltH + 22} x2={beltX + beltW} y2={beltY + beltH + 22} stroke="#94a3b8" strokeWidth={1} markerEnd="url(#ia)" markerStart="url(#ib)" />
        <text x={beltX + beltW / 2} y={beltY + beltH + 36} textAnchor="middle" fontSize={9} fill="#94a3b8" fontWeight="700">
          {lengthNum > 0 ? `L = ${lengthNum} ft` : "Length = ?"}
        </text>

        {/* Material label */}
        {config.beltMaterial && (
          <text x={beltX + 10} y={beltY + beltH + 54} fontSize={8} fill="#94a3b8">
            Material: {config.beltMaterial} {config.rodMaterial ? `/ Rod: ${config.rodMaterial}` : ""}
          </text>
        )}

        {/* Sideguard label */}
        {hasSideguards && (
          <text x={beltX + beltW + 20} y={beltY + 16} fontSize={8} fill={C.gold} fontWeight="600">Sideguard →</text>
        )}

        {/* Flight label */}
        {hasFlights && (
          <text x={beltX + 12} y={beltY + beltH + 60} fontSize={8} fill="#94a3b8">✦ Flights included</text>
        )}
      </svg>
    </div>
  );
}

// ── Wizard ────────────────────────────────────────────────────────────────────
export default function IntraloxConfigurator({ initialSeries, initialStyle, onComplete, onClose }) {
  const [step, setStep] = useState(initialSeries ? (initialStyle ? 2 : 1) : 0);
  const [config, setConfig] = useState({
    seriesId: initialSeries?.id || "",
    beltStyleKey: initialStyle?.key || "",
    industry: "", equipmentType: "",
    beltMaterial: "", rodMaterial: "",
    beltWidth: "", beltLength: "",
    driveType: "", sprocketType: "",
    flights: "none", sideguards: "none",
    environment: "", tempEnv: "",
    product: "",
    quantity: "1", quantityUnit: "Each",
    uploads: [], notes: "",
    unknownFields: [],
  });
  const fileInputRef = useRef();

  const series = INTRALOX_SERIES.find(s => s.id === config.seriesId) || initialSeries;
  const beltStyle = series?.styles?.find(s => s.key === config.beltStyleKey) || initialStyle;
  const hasBeltData = Array.isArray(beltStyle?.beltData);

  function update(field, val) { setConfig(p => ({ ...p, [field]: val })); }
  function markUnknown(field) {
    const existing = config.unknownFields || [];
    if (!existing.includes(field)) update("unknownFields", [...existing, field]);
    update(field, "I don't know — to be confirmed by Uniking");
    setTimeout(() => setStep(s => Math.min(s + 1, STEPS.length - 1)), 120);
  }
  function next() { setStep(s => Math.min(s + 1, STEPS.length - 1)); }
  function back() { setStep(s => Math.max(s - 1, 0)); }

  const Header = () => (
    <div style={{ background: `linear-gradient(135deg, ${C.navy}, ${C.navyMid})`, padding: "14px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
          <div style={{ background: INTRALOX_RED, borderRadius: 4, padding: "2px 6px" }}>
            <span style={{ fontSize: 8, fontWeight: 800, color: "#fff" }}>INTRALOX</span>
          </div>
          <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 11 }}>Modular Belt Configurator — Step {step + 1}/{STEPS.length}</span>
        </div>
        <div style={{ color: "#fff", fontSize: 14, fontWeight: 700 }}>{STEPS[step]}</div>
      </div>
      <button onClick={onClose} style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.3)", color: "#fff", cursor: "pointer", borderRadius: 8, padding: "6px 14px", fontSize: 13, fontWeight: 700 }}>✕ Exit</button>
    </div>
  );

  const ProgressBar = () => (
    <div style={{ background: "#e5e7eb", height: 4 }}>
      <div style={{ background: C.gold, height: "100%", width: `${((step + 1) / STEPS.length) * 100}%`, transition: "width 0.3s" }} />
    </div>
  );

  const NavButtons = ({ canNext = true, nextLabel = "Next →" }) => (
    <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
      {step > 0 && <button onClick={back} style={{ background: "#f1f5f9", border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 20px", cursor: "pointer", fontSize: 13 }}>← Back</button>}
      <button onClick={next} disabled={!canNext}
        style={{ flex: 1, background: canNext ? C.navyMid : "#e5e7eb", color: canNext ? "#fff" : C.muted, border: "none", borderRadius: 8, padding: "12px 24px", cursor: canNext ? "pointer" : "default", fontSize: 13, fontWeight: 700 }}>
        {nextLabel}
      </button>
    </div>
  );

  const Opt = ({ label, selected, onClick }) => (
    <button onClick={onClick} style={{ background: selected ? C.navyMid : "#f1f5f9", color: selected ? "#fff" : C.text, border: `2px solid ${selected ? C.navyMid : C.border}`, borderRadius: 10, padding: "10px 14px", cursor: "pointer", textAlign: "left", fontSize: 13, fontWeight: selected ? 700 : 400, transition: "all 0.15s" }}>
      {label}
    </button>
  );

  const SLabel = ({ children, note }) => (
    <div style={{ fontWeight: 700, fontSize: 12, color: C.muted, textTransform: "uppercase", letterSpacing: "0.4px", marginBottom: 6, marginTop: 14 }}>
      {children}{note && <span style={{ fontWeight: 400, marginLeft: 6, color: "#94a3b8" }}>— {note}</span>}
    </div>
  );

  const body = { padding: 20, maxHeight: "70vh", overflowY: "auto" };

  // Step 0: Series
  if (step === 0) return (
    <div><Header /><ProgressBar />
      <div style={body}>
        <div style={{ fontSize: 15, fontWeight: 800, color: C.navyMid, marginBottom: 4 }}>Select Series</div>
        <div style={{ fontSize: 12, color: C.muted, marginBottom: 14 }}>Choose the Intralox belt series for your application.</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {INTRALOX_SERIES.map(s => (
            <button key={s.id} onClick={() => { update("seriesId", s.id); update("beltStyleKey", ""); setTimeout(next, 120); }}
              style={{ background: config.seriesId === s.id ? C.navyMid : "#fff", border: `2px solid ${config.seriesId === s.id ? C.navyMid : C.border}`, borderRadius: 10, padding: "12px 16px", cursor: "pointer", textAlign: "left", display: "flex", gap: 12, transition: "all 0.15s" }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: config.seriesId === s.id ? "#fff" : C.text }}>{s.name}</div>
                <div style={{ fontSize: 11, color: config.seriesId === s.id ? "rgba(255,255,255,0.7)" : C.muted, marginTop: 2 }}>
                  {s.pitch_in && s.pitch_in !== "To be confirmed by Uniking" ? `Pitch: ${s.pitch_in}" · ` : ""}{s.styles?.length || 0} styles · {(s.applications || []).slice(0, 2).join(", ")}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  // Step 1: Belt Style
  if (step === 1) return (
    <div><Header /><ProgressBar />
      <div style={body}>
        <BeltSchematic config={config} series={series} beltStyle={beltStyle} />
        <div style={{ fontSize: 15, fontWeight: 800, color: C.navyMid, marginBottom: 4 }}>Select Belt Style</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {series?.styles?.map(s => (
            <button key={s.key} onClick={() => { update("beltStyleKey", s.key); setTimeout(next, 120); }}
              style={{ background: config.beltStyleKey === s.key ? C.navyMid : "#fff", border: `2px solid ${config.beltStyleKey === s.key ? C.navyMid : C.border}`, borderRadius: 10, padding: "12px 16px", cursor: "pointer", textAlign: "left", transition: "all 0.15s" }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: config.beltStyleKey === s.key ? "#fff" : C.text }}>{s.label}</div>
              <div style={{ fontSize: 11, color: config.beltStyleKey === s.key ? "rgba(255,255,255,0.7)" : C.muted, marginTop: 2 }}>
                Open Area: {s.openArea} · {s.surface} · {s.applications?.slice(0, 2).join(", ")}
              </div>
            </button>
          ))}
        </div>
        <NavButtons canNext={!!config.beltStyleKey} />
      </div>
    </div>
  );

  // Step 2: Application
  if (step === 2) return (
    <div><Header /><ProgressBar />
      <div style={body}>
        <BeltSchematic config={config} series={series} beltStyle={beltStyle} />
        <div style={{ fontSize: 15, fontWeight: 800, color: C.navyMid, marginBottom: 4 }}>Industry / Application</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 12 }}>
          {INTRALOX_INDUSTRIES.map(i => <Opt key={i} label={i} selected={config.industry === i} onClick={() => update("industry", i)} />)}
        </div>
        <SLabel>Equipment Type</SLabel>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {INTRALOX_EQUIPMENT_TYPES.map(e => <Opt key={e} label={e} selected={config.equipmentType === e} onClick={() => update("equipmentType", e)} />)}
        </div>
        <NavButtons canNext={!!config.industry} />
      </div>
    </div>
  );

  // Step 3: Belt Material
  if (step === 3) {
    const materials = hasBeltData ? [...new Set(beltStyle.beltData.map(r => r.material))] : null;
    return (
      <div><Header /><ProgressBar />
        <div style={body}>
          <BeltSchematic config={config} series={series} beltStyle={beltStyle} />
          <div style={{ fontSize: 15, fontWeight: 800, color: C.navyMid, marginBottom: 4 }}>Belt Material</div>
          {materials ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {materials.map(m => {
                const rows = beltStyle.beltData.filter(r => r.material === m);
                const temps = rows[0] ? `${rows[0].tempC}°C` : "";
                return (
                  <button key={m} onClick={() => { update("beltMaterial", m); update("rodMaterial", ""); setTimeout(next, 120); }}
                    style={{ background: config.beltMaterial === m ? C.navyMid : "#fff", border: `2px solid ${config.beltMaterial === m ? C.navyMid : C.border}`, borderRadius: 10, padding: "12px 16px", cursor: "pointer", textAlign: "left", transition: "all 0.15s" }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: config.beltMaterial === m ? "#fff" : C.text }}>{m}</div>
                    <div style={{ fontSize: 11, color: config.beltMaterial === m ? "rgba(255,255,255,0.7)" : C.muted, marginTop: 2 }}>Temp: {temps}</div>
                  </button>
                );
              })}
              <Opt label="I don't know — to be confirmed by Uniking" selected={config.beltMaterial === "I don't know — to be confirmed by Uniking"} onClick={() => markUnknown("beltMaterial")} />
            </div>
          ) : (
            <div>
              <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 8, padding: 12, fontSize: 13, color: "#92400e", marginBottom: 14 }}>
                Belt material data: To be confirmed by Uniking. Please specify your requirements in the Notes section.
              </div>
              <input value={config.beltMaterial} onChange={e => update("beltMaterial", e.target.value)} placeholder="e.g. Polypropylene, Acetal, Nylon…"
                style={{ width: "100%", boxSizing: "border-box", padding: "10px 14px", borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 13, outline: "none" }} />
            </div>
          )}
          <NavButtons canNext={true} />
        </div>
      </div>
    );
  }

  // Step 4: Rod Material
  if (step === 4) {
    const rodOptions = hasBeltData && config.beltMaterial
      ? [...new Set(beltStyle.beltData.filter(r => r.material === config.beltMaterial).map(r => r.rodMaterial))]
      : null;
    return (
      <div><Header /><ProgressBar />
        <div style={body}>
          <BeltSchematic config={config} series={series} beltStyle={beltStyle} />
          <div style={{ fontSize: 15, fontWeight: 800, color: C.navyMid, marginBottom: 4 }}>Rod Material</div>
          {series && <div style={{ fontSize: 12, color: C.muted, marginBottom: 10 }}>Default rod diameter: {series.rod_dia_in ? `${series.rod_dia_in}" (${series.rod_dia_mm} mm)` : "To be confirmed by Uniking"}</div>}
          {rodOptions && rodOptions.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {rodOptions.map(r => {
                const row = beltStyle.beltData.find(d => d.material === config.beltMaterial && d.rodMaterial === r);
                return (
                  <button key={r} onClick={() => { update("rodMaterial", r); setTimeout(next, 120); }}
                    style={{ background: config.rodMaterial === r ? C.navyMid : "#fff", border: `2px solid ${config.rodMaterial === r ? C.navyMid : C.border}`, borderRadius: 10, padding: "12px 16px", cursor: "pointer", textAlign: "left", transition: "all 0.15s" }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: config.rodMaterial === r ? "#fff" : C.text }}>{r}</div>
                    {row && <div style={{ fontSize: 11, color: config.rodMaterial === r ? "rgba(255,255,255,0.7)" : C.muted, marginTop: 2 }}>
                      Strength: {row.strengthLbfFt?.toLocaleString()} lbf/ft · Temp: {row.tempC}°C
                    </div>}
                  </button>
                );
              })}
              <Opt label="I don't know — to be confirmed by Uniking" selected={config.rodMaterial?.includes("don't know")} onClick={() => markUnknown("rodMaterial")} />
            </div>
          ) : (
            <div>
              <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 8, padding: 12, fontSize: 13, color: "#92400e", marginBottom: 14 }}>
                Rod material: To be confirmed by Uniking.
              </div>
              <input value={config.rodMaterial} onChange={e => update("rodMaterial", e.target.value)} placeholder="e.g. Polypropylene, Polyethylene…"
                style={{ width: "100%", boxSizing: "border-box", padding: "10px 14px", borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 13, outline: "none" }} />
            </div>
          )}
          <NavButtons canNext={true} />
        </div>
      </div>
    );
  }

  // Step 5: Belt Width
  if (step === 5) {
    const validationMsg = series && config.beltWidth
      ? (() => {
          const w = parseFloat(config.beltWidth);
          if (w < series.min_width_in) return `⚠ Minimum width is ${series.min_width_in}" for ${series.name}`;
          const increment = series.width_increment_in;
          const diff = (w - series.min_width_in) % increment;
          if (diff > 0.01) return `⚠ Width must be in ${increment}" increments from minimum ${series.min_width_in}". Nearest valid: ${(series.min_width_in + Math.round((w - series.min_width_in) / increment) * increment).toFixed(2)}"`;
          return `✓ Valid width`;
        })()
      : null;
    return (
      <div><Header /><ProgressBar />
        <div style={body}>
          <BeltSchematic config={config} series={series} beltStyle={beltStyle} />
          <div style={{ fontSize: 15, fontWeight: 800, color: C.navyMid, marginBottom: 4 }}>Belt Width</div>
          {series && <div style={{ fontSize: 12, color: C.muted, marginBottom: 10 }}>Min: {series.min_width_in}" · Increments: {series.width_increment_in}" · Confirm with Intralox for exact measurements.</div>}
          <SLabel>Belt Width (inches)</SLabel>
          <input type="number" value={config.beltWidth} onChange={e => update("beltWidth", e.target.value)} placeholder={`e.g. ${series?.min_width_in || 3} (minimum)`}
            style={{ width: "100%", boxSizing: "border-box", padding: "10px 14px", borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 14, outline: "none" }} />
          {validationMsg && (
            <div style={{ marginTop: 8, padding: "8px 12px", background: validationMsg.startsWith("✓") ? "#f0fdf4" : "#fef2f2", borderRadius: 7, fontSize: 12, fontWeight: 600, color: validationMsg.startsWith("✓") ? "#16a34a" : "#dc2626" }}>
              {validationMsg}
            </div>
          )}
          <NavButtons canNext={true} />
          <div style={{ textAlign: "center" }}>
            <button onClick={() => markUnknown("beltWidth")} style={{ background: "none", border: "none", color: C.muted, fontSize: 12, cursor: "pointer", textDecoration: "underline", marginTop: 8 }}>I don't know yet</button>
          </div>
        </div>
      </div>
    );
  }

  // Step 6: Belt Length
  if (step === 6) return (
    <div><Header /><ProgressBar />
      <div style={body}>
        <BeltSchematic config={config} series={series} beltStyle={beltStyle} />
        <div style={{ fontSize: 15, fontWeight: 800, color: C.navyMid, marginBottom: 4 }}>Belt Length (Conveyor Length)</div>
        <div style={{ fontSize: 12, color: C.muted, marginBottom: 10 }}>Enter the conveyor length. Uniking will calculate the total belt length including return.</div>
        <input type="number" value={config.beltLength} onChange={e => update("beltLength", e.target.value)} placeholder="e.g. 15 (feet)"
          style={{ width: "100%", boxSizing: "border-box", padding: "10px 14px", borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 14, outline: "none" }} />
        <div style={{ marginTop: 8, fontSize: 12, color: C.muted, background: "#eff6ff", borderRadius: 6, padding: "8px 12px" }}>ℹ Total belt running length = conveyor length × 2 + sprocket/nosebar allowance. Intralox must confirm before ordering.</div>
        <NavButtons canNext={true} />
        <div style={{ textAlign: "center" }}>
          <button onClick={() => markUnknown("beltLength")} style={{ background: "none", border: "none", color: C.muted, fontSize: 12, cursor: "pointer", textDecoration: "underline", marginTop: 8 }}>I don't know yet</button>
        </div>
      </div>
    </div>
  );

  // Step 7: Drive / Sprockets
  if (step === 7) return (
    <div><Header /><ProgressBar />
      <div style={body}>
        <BeltSchematic config={config} series={series} beltStyle={beltStyle} />
        <div style={{ fontSize: 15, fontWeight: 800, color: C.navyMid, marginBottom: 4 }}>Drive Type & Sprocket Selection</div>
        <SLabel>Drive Method</SLabel>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 14 }}>
          {["Sprocket drive (standard)", "Nosebar drive (tight transfer)", "Friction drive", "I don't know — to be confirmed by Uniking"].map(d => (
            <Opt key={d} label={d} selected={config.driveType === d} onClick={() => update("driveType", d)} />
          ))}
        </div>
        <SLabel>Sprocket Type</SLabel>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {series?.sprockets?.slice(0, 5).map(sp => (
            <Opt key={sp.name} label={`${sp.name} (${sp.material})`} selected={config.sprocketType === sp.name} onClick={() => update("sprocketType", sp.name)} />
          ))}
          <Opt label="To be confirmed by Uniking" selected={config.sprocketType === "TBD"} onClick={() => update("sprocketType", "TBD")} />
        </div>
        <NavButtons canNext={true} />
      </div>
    </div>
  );

  // Step 8: Flights
  if (step === 8) {
    const flightOpts = series?.accessories?.filter(a => a.type === "flight") || [];
    return (
      <div><Header /><ProgressBar />
        <div style={body}>
          <BeltSchematic config={config} series={series} beltStyle={beltStyle} />
          <div style={{ fontSize: 15, fontWeight: 800, color: C.navyMid, marginBottom: 4 }}>Flights (Optional)</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <Opt label="No flights required" selected={config.flights === "none"} onClick={() => update("flights", "none")} />
            {flightOpts.map(f => (
              <Opt key={f.name} label={f.name} selected={config.flights === f.name} onClick={() => update("flights", f.name)} />
            ))}
            <Opt label="Yes — to be confirmed by Uniking" selected={config.flights === "TBD"} onClick={() => update("flights", "TBD")} />
          </div>
          <NavButtons canNext={true} />
        </div>
      </div>
    );
  }

  // Step 9: Sideguards
  if (step === 9) {
    const sgOpts = series?.accessories?.filter(a => a.type === "sideguard") || [];
    return (
      <div><Header /><ProgressBar />
        <div style={body}>
          <BeltSchematic config={config} series={series} beltStyle={beltStyle} />
          <div style={{ fontSize: 15, fontWeight: 800, color: C.navyMid, marginBottom: 4 }}>Sideguards (Optional)</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <Opt label="No sideguards required" selected={config.sideguards === "none"} onClick={() => update("sideguards", "none")} />
            {sgOpts.map(sg => (
              <Opt key={sg.name} label={sg.name} selected={config.sideguards === sg.name} onClick={() => update("sideguards", sg.name)} />
            ))}
            <Opt label="Yes — to be confirmed by Uniking" selected={config.sideguards === "TBD"} onClick={() => update("sideguards", "TBD")} />
          </div>
          <NavButtons canNext={true} />
        </div>
      </div>
    );
  }

  // Step 10: Environment
  if (step === 10) return (
    <div><Header /><ProgressBar />
      <div style={body}>
        <div style={{ fontSize: 15, fontWeight: 800, color: C.navyMid, marginBottom: 4 }}>Temperature / Environment</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {[
            "Ambient / Room temperature", "Refrigerated (32–40°F / 0–4°C)",
            "Frozen (< 32°F / < 0°C)", "Low-temp freezing (-50°F / -46°C)",
            "Moderate heat (up to 150°F / 66°C)", "High heat (up to 220°F / 104°C)",
            "Very high heat (up to 310°F / 154°C)", "Wet / washdown",
            "Chemical / caustic exposure", "I don't know — to be confirmed by Uniking"
          ].map(e => <Opt key={e} label={e} selected={config.tempEnv === e} onClick={() => update("tempEnv", e)} />)}
        </div>
        <NavButtons canNext={!!config.tempEnv} />
      </div>
    </div>
  );

  // Step 11: Product
  if (step === 11) return (
    <div><Header /><ProgressBar />
      <div style={body}>
        <div style={{ fontSize: 15, fontWeight: 800, color: C.navyMid, marginBottom: 4 }}>Product Being Conveyed</div>
        <div style={{ fontSize: 12, color: C.muted, marginBottom: 12 }}>Helps validate belt material and surface selection.</div>
        <textarea value={config.product} onChange={e => update("product", e.target.value)}
          placeholder="e.g. Whole chickens, canned goods, packaged snacks, automotive parts…" rows={3}
          style={{ width: "100%", boxSizing: "border-box", padding: "10px 14px", borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 13, outline: "none", resize: "vertical" }} />
        <NavButtons canNext={true} />
      </div>
    </div>
  );

  // Step 12: Quantity
  if (step === 12) return (
    <div><Header /><ProgressBar />
      <div style={body}>
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
          <button onClick={() => update("quantity", String(Math.max(1, parseInt(config.quantity) - 1)))} style={{ width: 38, height: 38, borderRadius: 8, border: `1px solid ${C.border}`, background: "#fff", cursor: "pointer", fontSize: 20 }}>−</button>
          <input type="number" value={config.quantity} min="1" onChange={e => update("quantity", e.target.value)} style={{ width: 72, textAlign: "center", padding: "8px", borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 16, fontWeight: 700, outline: "none" }} />
          <button onClick={() => update("quantity", String(parseInt(config.quantity) + 1))} style={{ width: 38, height: 38, borderRadius: 8, border: `1px solid ${C.border}`, background: "#fff", cursor: "pointer", fontSize: 20 }}>+</button>
          <span style={{ fontSize: 13, color: C.muted }}>{config.quantityUnit}</span>
        </div>
        <NavButtons canNext={true} />
      </div>
    </div>
  );

  // Step 13: Uploads
  if (step === 13) return (
    <div><Header /><ProgressBar />
      <div style={body}>
        <div style={{ fontSize: 15, fontWeight: 800, color: C.navyMid, marginBottom: 4 }}>Upload Drawings / Photos</div>
        <div style={{ fontSize: 12, color: C.muted, marginBottom: 14 }}>Attach conveyor drawings, belt photos, or existing belt details. (Optional)</div>
        <div onClick={() => fileInputRef.current?.click()} style={{ border: "2px dashed " + C.border, borderRadius: 10, padding: "28px 20px", textAlign: "center", background: C.bg, cursor: "pointer", marginBottom: 12 }}>
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
                <button onClick={() => update("uploads", config.uploads.filter((_, j) => j !== i))} style={{ background: "none", border: "none", color: "#9ca3af", cursor: "pointer", fontSize: 20 }}>×</button>
              </div>
            ))}
          </div>
        )}
        <NavButtons canNext={true} nextLabel="Continue →" />
      </div>
    </div>
  );

  // Step 14: Notes
  if (step === 14) return (
    <div><Header /><ProgressBar />
      <div style={body}>
        <div style={{ fontSize: 15, fontWeight: 800, color: C.navyMid, marginBottom: 4 }}>Additional Notes</div>
        <div style={{ fontSize: 12, color: C.muted, marginBottom: 12 }}>Special requirements, existing belt details, conveyor OEM, or anything else Uniking should know.</div>
        <textarea value={config.notes} onChange={e => update("notes", e.target.value)}
          placeholder="e.g. Replacing existing Intralox S800 Flat Top belt, same conveyor, SS sprockets required, direct food contact, CFIA facility…"
          rows={5} style={{ width: "100%", boxSizing: "border-box", padding: "12px 14px", borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 13, outline: "none", resize: "vertical" }} />
        {config.unknownFields?.length > 0 && (
          <div style={{ marginTop: 10, background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 8, padding: "10px 14px", fontSize: 12, color: "#92400e" }}>
            ⚠ The following fields are flagged for Uniking review: {config.unknownFields.join(", ")}
          </div>
        )}
        <NavButtons canNext={true} nextLabel="Review Summary →" />
      </div>
    </div>
  );

  // Step 15: Review
  if (step === 15) {
    const seriesData = INTRALOX_SERIES.find(s => s.id === config.seriesId) || series;
    const styleData = seriesData?.styles?.find(s => s.key === config.beltStyleKey) || beltStyle;
    const beltRow = Array.isArray(styleData?.beltData)
      ? styleData.beltData.find(r => r.material === config.beltMaterial && r.rodMaterial === config.rodMaterial)
      : null;

    const fields = [
      ["Series", seriesData?.name],
      ["Belt Style", styleData?.label],
      ["Belt Pitch", seriesData ? `${seriesData.pitch_in}" (${seriesData.pitch_mm} mm)` : ""],
      ["Industry", config.industry],
      ["Equipment Type", config.equipmentType],
      ["Belt Material", config.beltMaterial],
      ["Rod Material", config.rodMaterial],
      ["Belt Width", config.beltWidth ? `${config.beltWidth}"` : ""],
      ["Belt Length (conveyor)", config.beltLength ? `${config.beltLength} ft` : ""],
      ["Drive Type", config.driveType],
      ["Sprocket Type", config.sprocketType],
      ["Flights", config.flights === "none" ? "None" : config.flights],
      ["Sideguards", config.sideguards === "none" ? "None" : config.sideguards],
      ["Temperature / Environment", config.tempEnv],
      ["Product Conveyed", config.product],
      ["Quantity", `${config.quantity} ${config.quantityUnit}`],
      ["Notes", config.notes],
    ].filter(([, v]) => v && v.trim && v.trim());

    const summaryText = fields.map(([k, v]) => `${k}: ${v}`).join(" | ");

    function handlePrintTearSheet() {
      const html = `<!DOCTYPE html><html><head><title>Intralox ${seriesData?.name} — ${styleData?.label}</title>
<style>*{margin:0;padding:0;box-sizing:border-box;}body{font-family:'Segoe UI',Arial,sans-serif;color:#111;background:#fff;}
@media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact;}}
.header{background:#0f2340;color:#fff;padding:22px 32px;display:flex;align-items:center;justify-content:space-between;}
.intralox-badge{background:#E31837;border-radius:4px;padding:3px 8px;font-size:10px;font-weight:800;color:#fff;letter-spacing:.5px;display:inline-block;margin-bottom:6px;}
.accent-bar{height:4px;background:linear-gradient(90deg,#E31837,#0f2340);}
.body{padding:24px 32px;}
h1{font-size:22px;font-weight:900;color:#0f2340;margin-bottom:4px;}
.subtitle{font-size:13px;color:#64748b;margin-bottom:20px;}
table{width:100%;border-collapse:collapse;font-size:12px;margin-bottom:20px;}
thead tr{background:#0f2340;}thead th{padding:8px 12px;color:#fff;font-weight:700;text-align:left;}
tbody tr:nth-child(even){background:#f8fafc;}tbody td{padding:8px 12px;border-bottom:1px solid #e5e7eb;}
tbody td:first-child{font-weight:600;color:#0f2340;width:35%;}
.warn{background:#fffbeb;border:1px solid #fde68a;border-radius:6px;padding:10px 14px;font-size:11px;color:#92400e;margin:16px 0;}
.footer{margin-top:20px;padding-top:12px;border-top:1px solid #e5e7eb;display:flex;justify-content:space-between;font-size:10px;color:#94a3b8;}
.no-print{margin:16px 32px;display:flex;gap:10px;}@media print{.no-print{display:none!important;}}
.btn{padding:8px 18px;border:none;border-radius:6px;cursor:pointer;font-size:13px;font-weight:700;}
.btn-primary{background:#0f2340;color:#fff;}.btn-secondary{background:#f1f5f9;color:#334155;border:1px solid #e2e8f0;}
</style></head><body>
<div class="no-print">
  <button class="btn btn-primary" onclick="window.print()">Print / Save PDF</button>
  <button class="btn btn-secondary" onclick="window.close()">Close</button>
</div>
<div class="header">
  <div>
    <div class="intralox-badge">INTRALOX</div>
    <img src="${LOGO}" style="max-height:28px;filter:brightness(0) invert(1);opacity:0.9;display:block;margin-top:4px;" alt="Uniking Canada"/>
  </div>
  <div style="text-align:right;font-size:11px;color:rgba(255,255,255,0.55)">
    <div style="font-size:14px;font-weight:700;color:#fff;">Modular Belt Configuration</div>
    <div>${new Date().toLocaleDateString("en-CA", { year: "numeric", month: "long", day: "numeric" })}</div>
  </div>
</div>
<div class="accent-bar"></div>
<div class="body">
  <h1>${seriesData?.name} — ${styleData?.label || "Belt Configuration"}</h1>
  <div class="subtitle">Intralox Modular Plastic Belt — Uniking Canada Configuration Sheet</div>
  <div class="warn">⚠ Final belt selection and specifications must be confirmed by Uniking before production. Contact Intralox for precise belt measurements and stock status before designing equipment or ordering a belt.</div>
  <table>
    <thead><tr><th>Parameter</th><th>Specified Value</th></tr></thead>
    <tbody>${fields.map(([k, v]) => `<tr><td>${k}</td><td>${v}</td></tr>`).join("")}</tbody>
  </table>
  ${beltRow ? `<div style="margin-bottom:16px;padding:12px;background:#f8fafc;border-radius:8px;border:1px solid #e2e8f0;font-size:12px;">
    <strong>Belt Strength:</strong> ${beltRow.strengthLbfFt?.toLocaleString()} lbf/ft (${beltRow.strengthNm?.toLocaleString()} N/m) &nbsp;|&nbsp; 
    <strong>Temperature:</strong> ${beltRow.tempF}°F / ${beltRow.tempC}°C &nbsp;|&nbsp;
    <strong>Belt Mass:</strong> ${beltRow.massLbFt2} lb/ft² (${beltRow.massKgM2} kg/m²)
  </div>` : ""}
  ${config.uploads.length > 0 ? `<div style="margin-bottom:16px;font-size:12px;color:#334155"><strong>Attachments:</strong> ${config.uploads.map(f => f.name).join(", ")}</div>` : ""}
  ${config.unknownFields?.length > 0 ? `<div class="warn">⚠ Fields flagged for Uniking review: ${config.unknownFields.join(", ")}</div>` : ""}
  <div class="footer">
    <div>unikingcanada.com · rfq@unikingcanada.com<br/><span style="font-size:9px;text-transform:uppercase;letter-spacing:1px;color:#cbd5e1;">Source: Intralox Belt Finder + 2024 MPB Engineering Manual</span></div>
    <div style="text-align:right">Intralox ${seriesData?.name} · ${styleData?.label}</div>
  </div>
</div></body></html>`;
      const blob = new Blob([html], { type: "text/html" });
      window.open(URL.createObjectURL(blob), "_blank");
    }

    function handleAddRFQ() {
      const cart = JSON.parse(localStorage.getItem("uniking_rfq_cart") || "[]");
      cart.push({
        cartId: `intralox_belt_${Date.now()}`,
        id: `intralox_belt_${Date.now()}`,
        _source: "intralox_belt_config",
        series: `${seriesData?.name} — ${styleData?.label}`,
        name: `${seriesData?.name} ${styleData?.label}`,
        type: "Modular Plastic Belt — Intralox",
        style: styleData?.label || "",
        category: "Modular Belting — Intralox",
        image_url: styleData?.image || seriesData?.image || "",
        materials: config.beltMaterial || "",
        quantity: parseInt(config.quantity) || 1,
        unit: config.quantityUnit || "Each",
        notes: summaryText,
      });
      localStorage.setItem("uniking_rfq_cart", JSON.stringify(cart));
      window.dispatchEvent(new Event("rfq_cart_updated"));
      onComplete(config);
    }

    return (
      <div><Header /><ProgressBar />
        <div style={body}>
          <BeltSchematic config={config} series={seriesData} beltStyle={styleData} />
          <div style={{ fontSize: 15, fontWeight: 800, color: C.navyMid, marginBottom: 12 }}>Configuration Summary</div>

          <div style={{ background: C.bg, borderRadius: 10, border: `1px solid ${C.border}`, overflow: "hidden", marginBottom: 14 }}>
            {fields.map(([k, v], i) => (
              <div key={k} style={{ display: "flex", gap: 12, padding: "8px 14px", background: i % 2 === 0 ? "#f8fafc" : "#fff", borderBottom: i < fields.length - 1 ? `1px solid ${C.border}` : "none" }}>
                <span style={{ fontSize: 12, color: C.muted, fontWeight: 600, width: 130, flexShrink: 0 }}>{k}</span>
                <span style={{ fontSize: 12, color: C.text, flex: 1 }}>{v}</span>
              </div>
            ))}
          </div>

          {beltRow && (
            <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 8, padding: "10px 14px", fontSize: 12, color: "#166534", marginBottom: 12 }}>
              ✓ Valid material combination — Strength: {beltRow.strengthLbfFt?.toLocaleString()} lbf/ft · Temp: {beltRow.tempC}°C
            </div>
          )}

          {config.unknownFields?.length > 0 && (
            <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 8, padding: "10px 14px", fontSize: 12, color: "#92400e", marginBottom: 12 }}>
              ⚠ Flagged for Uniking review: {config.unknownFields.join(", ")}
            </div>
          )}

          {config.uploads.length > 0 && (
            <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 8, padding: "10px 14px", fontSize: 12, color: "#1e40af", marginBottom: 12 }}>
              📎 {config.uploads.length} file{config.uploads.length !== 1 ? "s" : ""} attached
            </div>
          )}

          <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 8, padding: "10px 14px", fontSize: 12, color: "#92400e", marginBottom: 14 }}>
            <strong>Disclaimer:</strong> Final belt selection and specifications must be confirmed by Uniking before production.
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={back} style={{ background: "#f1f5f9", border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 16px", cursor: "pointer", fontSize: 13 }}>← Back</button>
            <button onClick={handlePrintTearSheet} style={{ flex: 1, padding: "11px", background: C.gold, color: C.navy, border: "none", borderRadius: 10, cursor: "pointer", fontSize: 13, fontWeight: 800 }}>Print Tear Sheet</button>
            <button onClick={handleAddRFQ} style={{ flex: 2, padding: "11px", background: C.green, color: "#fff", border: "none", borderRadius: 10, cursor: "pointer", fontSize: 14, fontWeight: 800 }}>Add to RFQ ✓</button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}