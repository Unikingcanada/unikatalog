import { useState, useRef } from "react";
import { INTRALOX_SERIES, INTRALOX_INDUSTRIES } from "@/lib/intraloxData";
import { getSeriesFlightData, INDENT_OPTIONS, INDENT_PLACEMENT_OPTIONS, FRICTION_TOP_OPTIONS } from "@/lib/intraloxFlightData";
import BeltSchematic from "./BeltSchematic";
import UniKingTearSheet from "./UnkingTearSheet";

const C = {
  navy: "#0F2340", navyMid: "#1A3A5C", gold: "#C9A84C",
  green: "#16a34a", border: "#e2e8f0", muted: "#64748b", bg: "#f8fafc", text: "#0f172a"
};
const INTRALOX_RED = "#E31837";
const INTRALOX_LOGO = "https://media.base44.com/images/public/69ebd56ae74b0ffcc2427c7a/64536dc1d_intralox-logo-box-194a1e40631d2cf9cd7d463fa5afc04b.svg";
const LOGO = "https://media.base44.com/images/public/69dd9ffccab4dd693d4d92f5/e48ee59d9_Unitingthestrongestlinks_20251031_225809_0000.png";

// Catalog-confirmed materials from 2026 Intralox MPB Engineering Manual
const MODULE_MATERIALS = [
  { key: "PP",  label: "Polypropylene (PP)",              tempF: "34 to 220",  tempC: "1 to 104",   notes: "General purpose, FDA-compliant, most common" },
  { key: "PE",  label: "Polyethylene (PE)",               tempF: "-50 to 150", tempC: "-46 to 66",  notes: "Low-temp, chemical resistant, FDA-compliant" },
  { key: "AC",  label: "Acetal (AC)",                     tempF: "-50 to 200", tempC: "-46 to 93",  notes: "High-strength, low friction, FDA-compliant" },
  { key: "NY",  label: "Nylon (NY)",                      tempF: "-50 to 225", tempC: "-46 to 107", notes: "High temp, high strength" },
  { key: "HHR", label: "HHR Nylon",                       tempF: "-50 to 310", tempC: "-46 to 154", notes: "Highest heat resistance in Intralox line" },
  { key: "PK",  label: "PK",                              tempF: "-40 to 176", tempC: "-40 to 80",  notes: "Chemical resistant" },
  { key: "DPP", label: "Detectable Polypropylene A22",    tempF: "0 to 150",   tempC: "-18 to 66",  notes: "Metal/X-ray detectable, FDA-compliant" },
  { key: "XAC", label: "X-ray Detectable Acetal",        tempF: "-50 to 200", tempC: "-46 to 93",  notes: "X-ray and metal detectable, FDA-compliant" },
  { key: "UNKNOWN", label: "Unknown — Uniking to recommend", tempF: "—", tempC: "—", notes: "Describe your application and Uniking will recommend the best material combination." },
];

const ROD_MATERIALS = [
  { key: "PP",  label: "Polypropylene (PP)",  tempF: "34 to 220",  tempC: "1 to 104",   notes: "Standard rod, general purpose" },
  { key: "PE",  label: "Polyethylene (PE)",   tempF: "-50 to 150", tempC: "-46 to 66",  notes: "Low-temp, chemical resistant" },
  { key: "NY",  label: "Nylon (NY)",          tempF: "-50 to 225", tempC: "-46 to 107", notes: "High-strength rod" },
  { key: "HHR", label: "HHR Nylon",          tempF: "-50 to 310", tempC: "-46 to 154", notes: "Highest heat resistance" },
  { key: "PK",  label: "PK",                 tempF: "-40 to 176", tempC: "-40 to 80",  notes: "Chemical resistant" },
  { key: "SS",  label: "Stainless Steel",     tempF: "—",          tempC: "—",          notes: "Metal rod — To be confirmed by Uniking for specific series" },
  { key: "UNKNOWN", label: "Unknown — Uniking to recommend", tempF: "—", tempC: "—", notes: "Uniking will recommend the correct rod material." },
];

const LENGTH_UNITS = ["mm", "inches", "feet", "metres"];

// Steps definition — used only for progress/display
const STEPS = [
  "Series", "Belt Style", "Industry", "Module Material", "Rod Material",
  "Belt Width", "Belt Length", "Flights", "Sideguards", "Attachments",
  "Product Conveyed", "Quantity", "Uploads", "Notes", "Review"
];
const STEP = {
  SERIES: 0, STYLE: 1, INDUSTRY: 2, MODULE_MAT: 3, ROD_MAT: 4,
  WIDTH: 5, LENGTH: 6, FLIGHTS: 7, SIDEGUARDS: 8, ATTACHMENTS: 9,
  PRODUCT: 10, QUANTITY: 11, UPLOADS: 12, NOTES: 13, REVIEW: 14
};

// ── Shared sub-components ──────────────────────────────────────────────────────
function Header({ step, onClose }) {
  return (
    <div style={{ background: `linear-gradient(135deg, ${C.navy}, ${C.navyMid})`, padding: "14px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
          <img src={INTRALOX_LOGO} alt="Intralox" style={{ height: 16, width: "auto", filter: "brightness(0) invert(1)", opacity: 0.9 }} />
          <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 11 }}>Belt Configurator — Step {step + 1}/{STEPS.length}</span>
        </div>
        <div style={{ color: "#fff", fontSize: 14, fontWeight: 700 }}>{STEPS[step]}</div>
      </div>
      <button onClick={onClose} style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.3)", color: "#fff", cursor: "pointer", borderRadius: 8, padding: "6px 14px", fontSize: 13, fontWeight: 700 }}>✕ Exit</button>
    </div>
  );
}

function ProgressBar({ step }) {
  return (
    <div style={{ background: "#e5e7eb", height: 4 }}>
      <div style={{ background: C.gold, height: "100%", width: `${((step + 1) / STEPS.length) * 100}%`, transition: "width 0.3s" }} />
    </div>
  );
}

function NavButtons({ step, onBack, onNext, canNext = true, nextLabel = "Next →" }) {
  return (
    <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
      {step > 0 && <button onClick={onBack} style={{ background: "#f1f5f9", border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 20px", cursor: "pointer", fontSize: 13 }}>← Back</button>}
      <button onClick={onNext} disabled={!canNext}
        style={{ flex: 1, background: canNext ? C.navyMid : "#e5e7eb", color: canNext ? "#fff" : C.muted, border: "none", borderRadius: 8, padding: "12px 24px", cursor: canNext ? "pointer" : "default", fontSize: 13, fontWeight: 700 }}>
        {nextLabel}
      </button>
    </div>
  );
}

function SLabel({ children }) {
  return <div style={{ fontWeight: 700, fontSize: 12, color: C.muted, textTransform: "uppercase", letterSpacing: "0.4px", marginBottom: 6, marginTop: 14 }}>{children}</div>;
}

function Opt({ label, sub, selected, onClick }) {
  return (
    <button onClick={onClick} style={{ background: selected ? C.navyMid : "#f1f5f9", color: selected ? "#fff" : C.text, border: `2px solid ${selected ? C.navyMid : C.border}`, borderRadius: 10, padding: "10px 14px", cursor: "pointer", textAlign: "left", fontSize: 13, fontWeight: selected ? 700 : 400, transition: "all 0.15s" }}>
      {label}
      {sub && <div style={{ fontSize: 11, color: selected ? "rgba(255,255,255,0.7)" : C.muted, marginTop: 2 }}>{sub}</div>}
    </button>
  );
}

// ── Main Configurator ──────────────────────────────────────────────────────────
export default function IntraloxConfigurator({ initialSeries, initialStyle, onComplete, onClose }) {
  const [step, setStep] = useState(initialSeries ? (initialStyle ? STEP.INDUSTRY : STEP.STYLE) : STEP.SERIES);
  const [units, setUnits] = useState("inches"); // global unit toggle
  const [showTearSheet, setShowTearSheet] = useState(false);
  const [config, setConfig] = useState({
    seriesId: initialSeries?.id || "",
    beltStyleKey: initialStyle?.key || "",
    industry: "",
    moduleMaterial: "",
    rodMaterial: "",
    beltWidth: "",
    beltLength: "",
    beltLengthUnit: "feet",
    flights: "",           // "" | "no" | "yes"
    flightType: "",        // key of selected flight type
    flightHeightIn: "",    // selected height in inches
    flightHeightCustom: "", // custom height if "custom"
    flightIndentOption: "", // key from INDENT_OPTIONS
    flightIndentPlacement: "", // key from INDENT_PLACEMENT_OPTIONS
    flightIndentCustom: "", // custom indent value
    flightMaterial: "",    // selected flight material
    flightFrictionTopOption: "", // for friction top belts
    flightDetails: "",
    sideguards: "",        // "" | "no" | "yes"
    sideguardDetails: "",
    attachments: "",       // "" | "no" | "yes"
    attachmentDetails: "",
    product: "",
    quantity: "1",
    quantityUnit: "Belts",
    uploads: [],
    notes: "",
    unknownFields: [],
    applicationDescription: "",
  });
  const fileInputRef = useRef();

  const series = INTRALOX_SERIES.find(s => s.id === config.seriesId) || initialSeries;
  const beltStyle = series?.styles?.find(s => s.key === config.beltStyleKey) || initialStyle;

  // Catalog-sourced belt data for selected style
  const catalogRow = Array.isArray(beltStyle?.beltData)
    ? beltStyle.beltData.find(r =>
        MODULE_MATERIALS.find(m => m.key === config.moduleMaterial)?.label.startsWith(r.material.split(" ")[0]) ||
        r.material === MODULE_MATERIALS.find(m => m.key === config.moduleMaterial)?.label
      )
    : null;

  function set(field, val) { setConfig(p => ({ ...p, [field]: val })); }
  function markUnknown(field) {
    const existing = config.unknownFields || [];
    if (!existing.includes(field)) set("unknownFields", [...existing, field]);
  }
  function next() { setStep(s => Math.min(s + 1, STEPS.length - 1)); }
  function back() { setStep(s => Math.max(s - 1, 0)); }

  const body = { padding: 20, maxHeight: "70vh", overflowY: "auto" };

  // Units toggle pill
  const UnitToggle = () => (
    <div style={{ display: "flex", alignItems: "center", gap: 4, background: "#f1f5f9", borderRadius: 20, padding: "3px 6px", marginBottom: 12, width: "fit-content" }}>
      <span style={{ fontSize: 10, color: C.muted, marginRight: 2 }}>Units:</span>
      {["inches", "mm"].map(u => (
        <button key={u} onClick={() => setUnits(u)}
          style={{ padding: "4px 12px", borderRadius: 16, border: "none", cursor: "pointer", fontSize: 11, fontWeight: 700, background: units === u ? C.navyMid : "transparent", color: units === u ? "#fff" : C.muted }}>
          {u}
        </button>
      ))}
    </div>
  );

  // ── STEP 0: Series ──────────────────────────────────────────────────────────
  if (step === STEP.SERIES) return (
    <div><Header step={step} onClose={onClose} /><ProgressBar step={step} />
      <div style={body}>
        <div style={{ fontSize: 15, fontWeight: 800, color: C.navyMid, marginBottom: 4 }}>Select Series</div>
        <div style={{ fontSize: 12, color: C.muted, marginBottom: 14 }}>Choose the Intralox belt series for your application.</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {INTRALOX_SERIES.map(s => (
            <button key={s.id} onClick={() => { set("seriesId", s.id); set("beltStyleKey", ""); setTimeout(next, 120); }}
              style={{ background: config.seriesId === s.id ? C.navyMid : "#fff", border: `2px solid ${config.seriesId === s.id ? C.navyMid : C.border}`, borderRadius: 10, padding: "12px 16px", cursor: "pointer", textAlign: "left", display: "flex", gap: 12, transition: "all 0.15s" }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: config.seriesId === s.id ? "#fff" : C.text }}>{s.name}</div>
                <div style={{ fontSize: 11, color: config.seriesId === s.id ? "rgba(255,255,255,0.7)" : C.muted, marginTop: 2 }}>
                  {s.beltType} · {s.pitch_in && s.pitch_in !== "To be confirmed by Uniking" ? `${s.pitch_in}" pitch · ` : ""}{s.styles?.length || 0} style{s.styles?.length !== 1 ? "s" : ""} · {(s.applications || []).slice(0, 2).join(", ")}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  // ── STEP 1: Belt Style ──────────────────────────────────────────────────────
  if (step === STEP.STYLE) return (
    <div><Header step={step} onClose={onClose} /><ProgressBar step={step} />
      <div style={body}>
        <BeltSchematic config={config} series={series} beltStyle={beltStyle} units={units} />
        <div style={{ fontSize: 15, fontWeight: 800, color: C.navyMid, marginBottom: 4 }}>Select Belt Style</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {series?.styles?.map(s => (
            <button key={s.key} onClick={() => { set("beltStyleKey", s.key); setTimeout(next, 120); }}
              style={{ background: config.beltStyleKey === s.key ? C.navyMid : "#fff", border: `2px solid ${config.beltStyleKey === s.key ? C.navyMid : C.border}`, borderRadius: 10, padding: "12px 16px", cursor: "pointer", textAlign: "left", transition: "all 0.15s" }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: config.beltStyleKey === s.key ? "#fff" : C.text }}>{s.label}</div>
              <div style={{ fontSize: 11, color: config.beltStyleKey === s.key ? "rgba(255,255,255,0.7)" : C.muted, marginTop: 2 }}>
                Open Area: {s.openArea} · {s.surface}{s.applications?.length ? " · " + s.applications.slice(0, 2).join(", ") : ""}
              </div>
            </button>
          ))}
        </div>
        <NavButtons step={step} onBack={back} onNext={next} canNext={!!config.beltStyleKey} />
      </div>
    </div>
  );

  // ── STEP 2: Industry (auto-advance on selection) ────────────────────────────
  if (step === STEP.INDUSTRY) return (
    <div><Header step={step} onClose={onClose} /><ProgressBar step={step} />
      <div style={body}>
        <BeltSchematic config={config} series={series} beltStyle={beltStyle} units={units} />
        <div style={{ fontSize: 15, fontWeight: 800, color: C.navyMid, marginBottom: 4 }}>Industry / Application</div>
        <div style={{ fontSize: 12, color: C.muted, marginBottom: 12 }}>Select your industry — you'll automatically proceed to the next step.</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {INTRALOX_INDUSTRIES.map(i => (
            <Opt key={i} label={i} selected={config.industry === i}
              onClick={() => { set("industry", i); setTimeout(next, 180); }} />
          ))}
        </div>
        <NavButtons step={step} onBack={back} onNext={next} canNext={!!config.industry} />
      </div>
    </div>
  );

  // ── STEP 3: Module Material ─────────────────────────────────────────────────
  if (step === STEP.MODULE_MAT) {
    // If series has specific beltData, only show materials available for that style
    const availableFromCatalog = Array.isArray(beltStyle?.beltData)
      ? [...new Set(beltStyle.beltData.map(r => r.material))]
      : null;

    return (
      <div><Header step={step} onClose={onClose} /><ProgressBar step={step} />
        <div style={body}>
          <BeltSchematic config={config} series={series} beltStyle={beltStyle} units={units} />
          <div style={{ fontSize: 15, fontWeight: 800, color: C.navyMid, marginBottom: 4 }}>Module Material</div>
          <div style={{ fontSize: 12, color: C.muted, marginBottom: 12 }}>Select the belt module material. Temperature and strength ratings sourced from the 2026 Intralox Engineering Manual.</div>

          {availableFromCatalog ? (
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: C.green, marginBottom: 8 }}>✓ Materials confirmed for {series?.name} {beltStyle?.label}:</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {beltStyle.beltData.map((row, i) => {
                  const matKey = MODULE_MATERIALS.find(m => m.label.startsWith(row.material.split(" ")[0]) || m.label === row.material)?.key || row.material;
                  return (
                    <button key={i} onClick={() => { set("moduleMaterial", matKey); set("rodMaterial", ""); setTimeout(next, 120); }}
                      style={{ background: config.moduleMaterial === matKey ? C.navyMid : "#fff", border: `2px solid ${config.moduleMaterial === matKey ? C.navyMid : C.border}`, borderRadius: 10, padding: "12px 16px", cursor: "pointer", textAlign: "left", transition: "all 0.15s" }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: config.moduleMaterial === matKey ? "#fff" : C.text }}>{row.material}</div>
                      <div style={{ fontSize: 11, color: config.moduleMaterial === matKey ? "rgba(255,255,255,0.7)" : C.muted, marginTop: 2 }}>
                        Strength: {row.strengthLbfFt?.toLocaleString()} lbf/ft ({row.strengthNm?.toLocaleString()} N/m) · Temp: {row.tempF}°F / {row.tempC}°C · Mass: {row.massLbFt2} lb/ft²
                      </div>
                    </button>
                  );
                })}
                <Opt label="Unknown — Uniking to recommend" sub="Describe your application and Uniking will recommend the correct material"
                  selected={config.moduleMaterial === "UNKNOWN"}
                  onClick={() => { set("moduleMaterial", "UNKNOWN"); markUnknown("moduleMaterial"); setTimeout(next, 120); }} />
              </div>
            </div>
          ) : (
            <div>
              <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 8, padding: "10px 14px", fontSize: 12, color: "#92400e", marginBottom: 12 }}>
                Catalog-specific material data not available for this style. Showing all Intralox catalog materials with standard ratings. Final selection to be confirmed by Uniking.
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {MODULE_MATERIALS.map(m => (
                  <button key={m.key} onClick={() => { set("moduleMaterial", m.key); set("rodMaterial", ""); if (m.key === "UNKNOWN") { markUnknown("moduleMaterial"); } setTimeout(next, 120); }}
                    style={{ background: config.moduleMaterial === m.key ? C.navyMid : "#fff", border: `2px solid ${config.moduleMaterial === m.key ? C.navyMid : C.border}`, borderRadius: 10, padding: "12px 16px", cursor: "pointer", textAlign: "left", transition: "all 0.15s" }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: config.moduleMaterial === m.key ? "#fff" : C.text }}>{m.label}</div>
                    <div style={{ fontSize: 11, color: config.moduleMaterial === m.key ? "rgba(255,255,255,0.7)" : C.muted, marginTop: 2 }}>
                      {m.key === "UNKNOWN" ? m.notes : `Temp: ${m.tempF}°F / ${m.tempC}°C · ${m.notes}`}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {config.moduleMaterial === "UNKNOWN" && (
            <div style={{ marginTop: 12 }}>
              <SLabel>Describe your application so Uniking can recommend the correct material:</SLabel>
              <textarea value={config.applicationDescription} onChange={e => set("applicationDescription", e.target.value)}
                placeholder="e.g. Direct food contact, high temperature baking, chemical wash-down, low temperature freezer…"
                rows={3} style={{ width: "100%", boxSizing: "border-box", padding: "10px 14px", borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 13, outline: "none", resize: "vertical" }} />
            </div>
          )}

          <NavButtons step={step} onBack={back} onNext={next} canNext={!!config.moduleMaterial} />
        </div>
      </div>
    );
  }

  // ── STEP 4: Rod Material ────────────────────────────────────────────────────
  if (step === STEP.ROD_MAT) {
    // From catalog if available for selected module material
    const catalogRods = Array.isArray(beltStyle?.beltData) && config.moduleMaterial !== "UNKNOWN"
      ? (() => {
          const modLabel = MODULE_MATERIALS.find(m => m.key === config.moduleMaterial)?.label || "";
          const matchedLabel = beltStyle.beltData.find(r => modLabel.startsWith(r.material.split(" ")[0]) || r.material === modLabel)?.material;
          if (!matchedLabel) return null;
          return beltStyle.beltData
            .filter(r => r.material === matchedLabel)
            .map(r => ({ ...r, rodKey: ROD_MATERIALS.find(rm => rm.label.startsWith(r.rodMaterial.split(" ")[0]) || rm.label === r.rodMaterial)?.key || r.rodMaterial }));
        })()
      : null;

    return (
      <div><Header step={step} onClose={onClose} /><ProgressBar step={step} />
        <div style={body}>
          <BeltSchematic config={config} series={series} beltStyle={beltStyle} units={units} />
          <div style={{ fontSize: 15, fontWeight: 800, color: C.navyMid, marginBottom: 4 }}>Rod Material</div>
          {series?.rod_dia_in && (
            <div style={{ fontSize: 12, color: C.muted, marginBottom: 10 }}>
              Rod diameter: {units === "mm" ? `${series.rod_dia_mm} mm` : `${series.rod_dia_in}"`}
              {series.rod_retention ? ` · Retention: ${series.rod_retention}` : ""}
            </div>
          )}

          {catalogRods && catalogRods.length > 0 ? (
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: C.green, marginBottom: 8 }}>✓ Catalog-confirmed rod materials for this module/style combination:</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {catalogRods.map((row, i) => (
                  <button key={i} onClick={() => { set("rodMaterial", row.rodKey); setTimeout(next, 120); }}
                    style={{ background: config.rodMaterial === row.rodKey ? C.navyMid : "#fff", border: `2px solid ${config.rodMaterial === row.rodKey ? C.navyMid : C.border}`, borderRadius: 10, padding: "12px 16px", cursor: "pointer", textAlign: "left", transition: "all 0.15s" }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: config.rodMaterial === row.rodKey ? "#fff" : C.text }}>{row.rodMaterial}</div>
                    <div style={{ fontSize: 11, color: config.rodMaterial === row.rodKey ? "rgba(255,255,255,0.7)" : C.muted, marginTop: 2 }}>
                      Strength: {row.strengthLbfFt?.toLocaleString()} lbf/ft · Temp: {row.tempF}°F / {row.tempC}°C
                    </div>
                  </button>
                ))}
                <Opt label="Unknown — Uniking to recommend" selected={config.rodMaterial === "UNKNOWN"}
                  onClick={() => { set("rodMaterial", "UNKNOWN"); markUnknown("rodMaterial"); setTimeout(next, 120); }} />
              </div>
            </div>
          ) : (
            <div>
              <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 8, padding: "10px 14px", fontSize: 12, color: "#92400e", marginBottom: 12 }}>
                Rod material to be confirmed by Uniking for this series/style. Standard catalog options shown.
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {ROD_MATERIALS.map(r => (
                  <button key={r.key} onClick={() => { set("rodMaterial", r.key); if (r.key === "UNKNOWN") markUnknown("rodMaterial"); setTimeout(next, 120); }}
                    style={{ background: config.rodMaterial === r.key ? C.navyMid : "#fff", border: `2px solid ${config.rodMaterial === r.key ? C.navyMid : C.border}`, borderRadius: 10, padding: "12px 16px", cursor: "pointer", textAlign: "left", transition: "all 0.15s" }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: config.rodMaterial === r.key ? "#fff" : C.text }}>{r.label}</div>
                    <div style={{ fontSize: 11, color: config.rodMaterial === r.key ? "rgba(255,255,255,0.7)" : C.muted, marginTop: 2 }}>
                      {r.key === "UNKNOWN" ? r.notes : `Temp: ${r.tempF}°F / ${r.tempC}°C · ${r.notes}`}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
          <NavButtons step={step} onBack={back} onNext={next} canNext={!!config.rodMaterial} />
        </div>
      </div>
    );
  }

  // ── STEP 5: Belt Width ──────────────────────────────────────────────────────
  if (step === STEP.WIDTH) {
    const minIn = series?.min_width_in;
    const incrIn = series?.width_increment_in;
    const minMm = series?.min_width_mm;
    const incrMm = series?.width_increment_mm;

    const widthVal = parseFloat(config.beltWidth) || 0;
    let validationMsg = null;
    if (widthVal > 0 && minIn && incrIn && units === "inches") {
      if (widthVal < minIn) validationMsg = { ok: false, msg: `⚠ Minimum width is ${minIn}" for ${series.name}` };
      else {
        const diff = (widthVal - minIn) % incrIn;
        if (diff > 0.01) validationMsg = { ok: false, msg: `⚠ Must be in ${incrIn}" increments from ${minIn}". Nearest: ${(minIn + Math.round((widthVal - minIn) / incrIn) * incrIn).toFixed(2)}"` };
        else validationMsg = { ok: true, msg: "✓ Valid width" };
      }
    }
    if (widthVal > 0 && minMm && incrMm && units === "mm") {
      if (widthVal < minMm) validationMsg = { ok: false, msg: `⚠ Minimum width is ${minMm} mm for ${series.name}` };
      else {
        const diff = (widthVal - minMm) % incrMm;
        if (diff > 0.5) validationMsg = { ok: false, msg: `⚠ Must be in ${incrMm} mm increments from ${minMm} mm.` };
        else validationMsg = { ok: true, msg: "✓ Valid width" };
      }
    }

    return (
      <div><Header step={step} onClose={onClose} /><ProgressBar step={step} />
        <div style={body}>
          <UnitToggle />
          <BeltSchematic config={config} series={series} beltStyle={beltStyle} units={units} />
          <div style={{ fontSize: 15, fontWeight: 800, color: C.navyMid, marginBottom: 4 }}>Belt Width</div>
          {series && (
            <div style={{ fontSize: 12, color: C.muted, marginBottom: 10 }}>
              {units === "mm"
                ? `Min: ${minMm ?? "TBC"} mm · Increments: ${incrMm ?? "TBC"} mm`
                : `Min: ${minIn ?? "TBC"}" · Increments: ${incrIn ?? "TBC"}"`
              } · Confirm with Intralox for exact widths.
            </div>
          )}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <input type="number" value={config.beltWidth} onChange={e => set("beltWidth", e.target.value)}
              placeholder={units === "mm" ? `e.g. ${minMm || 76}` : `e.g. ${minIn || 3}`}
              style={{ flex: 1, padding: "10px 14px", borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 14, outline: "none" }} />
            <div style={{ background: "#f1f5f9", borderRadius: 8, padding: "10px 14px", fontSize: 13, fontWeight: 700, color: C.navyMid, whiteSpace: "nowrap" }}>{units}</div>
          </div>
          {validationMsg && (
            <div style={{ marginTop: 8, padding: "8px 12px", background: validationMsg.ok ? "#f0fdf4" : "#fef2f2", borderRadius: 7, fontSize: 12, fontWeight: 600, color: validationMsg.ok ? "#16a34a" : "#dc2626" }}>
              {validationMsg.msg}
            </div>
          )}
          <NavButtons step={step} onBack={back} onNext={next} canNext={true} />
          <div style={{ textAlign: "center" }}>
            <button onClick={() => { set("beltWidth", ""); markUnknown("beltWidth"); next(); }} style={{ background: "none", border: "none", color: C.muted, fontSize: 12, cursor: "pointer", textDecoration: "underline", marginTop: 8 }}>I don't know yet</button>
          </div>
        </div>
      </div>
    );
  }

  // ── STEP 6: Belt Length ─────────────────────────────────────────────────────
  if (step === STEP.LENGTH) return (
    <div><Header step={step} onClose={onClose} /><ProgressBar step={step} />
      <div style={body}>
        <UnitToggle />
        <BeltSchematic config={config} series={series} beltStyle={beltStyle} units={units} />
        <div style={{ fontSize: 15, fontWeight: 800, color: C.navyMid, marginBottom: 4 }}>Belt Length</div>
        <div style={{ fontSize: 12, color: C.muted, marginBottom: 10 }}>Enter the conveyor length. Uniking will calculate total belt length including return.</div>
        <div style={{ display: "flex", gap: 10 }}>
          <input type="number" value={config.beltLength} onChange={e => set("beltLength", e.target.value)}
            placeholder="e.g. 15"
            style={{ flex: 1, padding: "10px 14px", borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 14, outline: "none" }} />
          <select value={config.beltLengthUnit} onChange={e => set("beltLengthUnit", e.target.value)}
            style={{ padding: "10px 14px", borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 13, outline: "none", background: "#fff", fontWeight: 700, color: C.navyMid }}>
            {LENGTH_UNITS.map(u => <option key={u} value={u}>{u}</option>)}
          </select>
        </div>
        <div style={{ marginTop: 8, fontSize: 12, color: C.muted, background: "#eff6ff", borderRadius: 6, padding: "8px 12px" }}>
          ℹ Total belt running length = conveyor length × 2 + sprocket/nosebar allowance. Intralox must confirm before ordering.
        </div>
        <NavButtons step={step} onBack={back} onNext={next} canNext={true} />
        <div style={{ textAlign: "center" }}>
          <button onClick={() => { set("beltLength", ""); markUnknown("beltLength"); next(); }} style={{ background: "none", border: "none", color: C.muted, fontSize: 12, cursor: "pointer", textDecoration: "underline", marginTop: 8 }}>I don't know yet</button>
        </div>
      </div>
    </div>
  );

  // ── STEP 7: Flights (smart wizard) ──────────────────────────────────────────
  if (step === STEP.FLIGHTS) {
    const flightData = getSeriesFlightData(series?.id);
    const catalogFlights = flightData.flightTypes || [];
    const isFrictionTop = beltStyle?.key?.includes("friction");
    const selectedFlightType = catalogFlights.find(f => f.key === config.flightType);

    // SubStep 0: Do you need flights?
    if (!config.flights) return (
      <div><Header step={step} onClose={onClose} /><ProgressBar step={step} />
        <div style={body}>
          <BeltSchematic config={config} series={series} beltStyle={beltStyle} units={units} />
          <div style={{ fontSize: 15, fontWeight: 800, color: C.navyMid, marginBottom: 4 }}>Flights / Attachments</div>
          <div style={{ fontSize: 12, color: C.muted, marginBottom: 12 }}>
            Flights (also called attachments) are molded modules that create cleats, scoops, or buckets on the belt surface for incline conveying or product containment.
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <Opt label="No flights / attachments required" sub="Standard belt only"
              selected={config.flights === "no"}
              onClick={() => { set("flights", "no"); setTimeout(next, 150); }} />
            <Opt label="Yes — flights / attachments required" sub="Select type, height, and indent options"
              selected={config.flights === "yes"}
              onClick={() => set("flights", "yes")} />
          </div>
          <NavButtons step={step} onBack={back} onNext={next} canNext={config.flights !== ""} />
        </div>
      </div>
    );

    // If no flights, proceed
    if (config.flights === "no") return (
      <div><Header step={step} onClose={onClose} /><ProgressBar step={step} />
        <div style={body}>
          <div style={{ textAlign: "center", padding: "32px 16px", color: C.green, fontSize: 14, fontWeight: 700 }}>✓ No flights — standard belt selected</div>
          <NavButtons step={step} onBack={() => { set("flights", ""); }} onNext={next} canNext={true} />
        </div>
      </div>
    );

    // Friction top indent selection
    if (config.flights === "yes" && isFrictionTop) return (
      <div><Header step={step} onClose={onClose} /><ProgressBar step={step} />
        <div style={body}>
          <BeltSchematic config={config} series={series} beltStyle={beltStyle} units={units} />
          <div style={{ fontSize: 15, fontWeight: 800, color: C.navyMid, marginBottom: 4 }}>Friction Top — Indent Configuration</div>
          <div style={{ fontSize: 12, color: C.muted, marginBottom: 4 }}>
            Friction top belts have rubber or polyurethane inserts. The insert does not extend to the belt edge — the indent defines the clear width on each side.
          </div>
          <div style={{ background: "#eff6ff", borderRadius: 8, padding: "10px 14px", fontSize: 12, color: "#1e40af", marginBottom: 14 }}>
            ℹ Intralox catalog: Minimum indent without sideguards is <strong>1.3 in (33 mm)</strong>. Indent options and placement must be specified.
          </div>
          <SLabel>Friction Top Indent Option</SLabel>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 12 }}>
            {FRICTION_TOP_OPTIONS.map(o => (
              <Opt key={o.key} label={o.label} selected={config.flightFrictionTopOption === o.key}
                onClick={() => set("flightFrictionTopOption", o.key)} />
            ))}
          </div>
          {config.flightFrictionTopOption === "full_width" && (
            <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 8, padding: "10px 14px", fontSize: 12, color: "#92400e" }}>
              ⚠ Full-width (no indent) is non-standard. Contact Intralox Customer Service to confirm availability.
            </div>
          )}
          <NavButtons step={step} onBack={() => { set("flights", ""); set("flightFrictionTopOption", ""); }}
            onNext={next} canNext={!!config.flightFrictionTopOption} />
        </div>
      </div>
    );

    // Main flight wizard (catalog flights available)
    if (config.flights === "yes" && catalogFlights.length > 0) {
      // Sub-step A: Select flight type
      if (!config.flightType) return (
        <div><Header step={step} onClose={onClose} /><ProgressBar step={step} />
          <div style={body}>
            <BeltSchematic config={config} series={series} beltStyle={beltStyle} units={units} />
            <div style={{ fontSize: 15, fontWeight: 800, color: C.navyMid, marginBottom: 2 }}>Select Flight Type</div>
            <div style={{ fontSize: 11, color: C.green, fontWeight: 700, marginBottom: 12 }}>
              ✓ {catalogFlights.length} catalog-confirmed flight type{catalogFlights.length !== 1 ? "s" : ""} for {series?.name}
            </div>
            {flightData.seriesNote && (
              <div style={{ background: "#f0f9ff", border: "1px solid #bae6fd", borderRadius: 8, padding: "8px 12px", fontSize: 12, color: "#0369a1", marginBottom: 12 }}>
                {flightData.seriesNote}
              </div>
            )}
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {catalogFlights.map(ft => (
                <button key={ft.key} onClick={() => { set("flightType", ft.key); set("flightHeightIn", ""); set("flightIndentOption", ""); set("flightIndentPlacement", ""); set("flightMaterial", ""); }}
                  style={{ background: config.flightType === ft.key ? C.navyMid : "#fff", border: `2px solid ${config.flightType === ft.key ? C.navyMid : C.border}`, borderRadius: 10, padding: 0, cursor: "pointer", textAlign: "left", overflow: "hidden", transition: "all 0.15s" }}>
                  <div style={{ display: "flex", gap: 0 }}>
                    {ft.image && (
                      <div style={{ width: 80, flexShrink: 0, background: "#f0f4f8", overflow: "hidden" }}>
                        <img src={ft.image} alt={ft.name} style={{ width: "100%", height: 72, objectFit: "cover" }} onError={e => e.target.style.display = "none"} />
                      </div>
                    )}
                    <div style={{ padding: "12px 14px", flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 800, color: config.flightType === ft.key ? "#fff" : C.navyMid }}>{ft.name}</div>
                      <div style={{ fontSize: 11, color: config.flightType === ft.key ? "rgba(255,255,255,0.7)" : C.muted, marginTop: 2, lineHeight: 1.5 }}>{ft.description?.slice(0, 120)}</div>
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 6 }}>
                        <span style={{ fontSize: 10, background: config.flightType === ft.key ? "rgba(255,255,255,0.15)" : "#eef3f8", color: config.flightType === ft.key ? "#fff" : C.navyMid, padding: "1px 7px", borderRadius: 8, fontWeight: 600 }}>
                          Heights: {ft.availableHeightsIn.join('",')}"{ft.customHeightAvailable ? " + custom" : ""}
                        </span>
                        <span style={{ fontSize: 10, background: config.flightType === ft.key ? "rgba(255,255,255,0.15)" : "#f1f5f9", color: config.flightType === ft.key ? "#fff" : C.muted, padding: "1px 7px", borderRadius: 8 }}>
                          {ft.materials.slice(0, 3).join(", ")}
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
            <NavButtons step={step} onBack={() => { set("flights", ""); }} onNext={() => {}} canNext={false}
              nextLabel="Select a flight type above →" />
          </div>
        </div>
      );

      // Sub-step B: Select height
      if (config.flightType && !config.flightHeightIn) return (
        <div><Header step={step} onClose={onClose} /><ProgressBar step={step} />
          <div style={body}>
            <BeltSchematic config={config} series={series} beltStyle={beltStyle} units={units} />
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <button onClick={() => set("flightType", "")} style={{ background: "none", border: "none", color: C.navyMid, cursor: "pointer", fontSize: 12, fontWeight: 600 }}>← Flight Type</button>
            </div>
            <div style={{ fontSize: 15, fontWeight: 800, color: C.navyMid, marginBottom: 2 }}>Flight Height — {selectedFlightType?.name}</div>
            <div style={{ fontSize: 12, color: C.muted, marginBottom: 14 }}>Select a standard height or cut to custom height.</div>
            <SLabel>Standard Heights (catalog)</SLabel>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))", gap: 8, marginBottom: 12 }}>
              {(selectedFlightType?.availableHeightsIn || []).map(h => (
                <button key={h} onClick={() => set("flightHeightIn", String(h))}
                  style={{ background: config.flightHeightIn === String(h) ? C.navyMid : "#f1f5f9", color: config.flightHeightIn === String(h) ? "#fff" : C.text, border: `2px solid ${config.flightHeightIn === String(h) ? C.navyMid : C.border}`, borderRadius: 10, padding: "14px 8px", cursor: "pointer", textAlign: "center", fontWeight: 700 }}>
                  <div style={{ fontSize: 18 }}>{h}"</div>
                  <div style={{ fontSize: 10, opacity: 0.7, marginTop: 2 }}>{selectedFlightType.availableHeightsMm?.[selectedFlightType.availableHeightsIn.indexOf(h)] ?? Math.round(h * 25.4)} mm</div>
                </button>
              ))}
              {selectedFlightType?.customHeightAvailable && (
                <button onClick={() => set("flightHeightIn", "custom")}
                  style={{ background: config.flightHeightIn === "custom" ? C.gold : "#f1f5f9", color: config.flightHeightIn === "custom" ? C.navy : C.muted, border: `2px solid ${config.flightHeightIn === "custom" ? C.gold : C.border}`, borderRadius: 10, padding: "14px 8px", cursor: "pointer", textAlign: "center", fontWeight: 700 }}>
                  <div style={{ fontSize: 14 }}>Custom</div>
                  <div style={{ fontSize: 10, opacity: 0.7, marginTop: 2 }}>Specify</div>
                </button>
              )}
            </div>
            {config.flightHeightIn === "custom" && (
              <div style={{ marginBottom: 12 }}>
                <SLabel>Custom Height (specify in inches or mm)</SLabel>
                <input type="text" value={config.flightHeightCustom} onChange={e => set("flightHeightCustom", e.target.value)}
                  placeholder={`e.g. 2.5" or 64mm (min ${selectedFlightType?.customHeightMinIn || 0.5}")`}
                  style={{ width: "100%", boxSizing: "border-box", padding: "10px 14px", borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 13, outline: "none" }} />
                {selectedFlightType?.customHeightMinIn && (
                  <div style={{ fontSize: 11, color: C.muted, marginTop: 4 }}>Minimum height: {selectedFlightType.customHeightMinIn}" ({Math.round(selectedFlightType.customHeightMinIn * 25.4)} mm)</div>
                )}
              </div>
            )}
            <NavButtons step={step} onBack={() => set("flightType", "")}
              onNext={() => {}} canNext={false} nextLabel="Select a height above →" />
          </div>
        </div>
      );

      // Sub-step C: Select indent
      if (config.flightType && config.flightHeightIn && !config.flightIndentOption) return (
        <div><Header step={step} onClose={onClose} /><ProgressBar step={step} />
          <div style={body}>
            <BeltSchematic config={config} series={series} beltStyle={beltStyle} units={units} />
            <div style={{ display: "flex", gap: 8, marginBottom: 4 }}>
              <button onClick={() => set("flightHeightIn", "")} style={{ background: "none", border: "none", color: C.navyMid, cursor: "pointer", fontSize: 12, fontWeight: 600 }}>← Height</button>
            </div>
            <div style={{ fontSize: 15, fontWeight: 800, color: C.navyMid, marginBottom: 4 }}>Indent Selection — {selectedFlightType?.name}</div>
            <div style={{ background: "#eff6ff", borderRadius: 8, padding: "10px 14px", fontSize: 12, color: "#1e40af", marginBottom: 12 }}>
              ℹ The indent is the clear distance from the belt edge to the edge of the flight module.<br/>
              <strong>Catalog minimum: 1.3" (33 mm) without sideguards.</strong>
            </div>
            <SLabel>Indent Size</SLabel>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 12 }}>
              {INDENT_OPTIONS.filter(o => (selectedFlightType?.indentOptions || ["1.3_in"]).includes(o.key) || o.key === "custom").map(o => (
                <Opt key={o.key} label={o.label} sub={o.notes} selected={config.flightIndentOption === o.key}
                  onClick={() => set("flightIndentOption", o.key)} />
              ))}
            </div>
            {config.flightIndentOption === "custom" && (
              <div style={{ marginBottom: 12 }}>
                <SLabel>Custom Indent Value</SLabel>
                <input type="text" value={config.flightIndentCustom} onChange={e => set("flightIndentCustom", e.target.value)}
                  placeholder='e.g. 1.5" or 38mm'
                  style={{ width: "100%", boxSizing: "border-box", padding: "10px 14px", borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 13, outline: "none" }} />
              </div>
            )}
            {config.flightIndentOption && config.flightIndentOption !== "none" && (
              <div style={{ marginTop: 12 }}>
                <SLabel>Indent Placement</SLabel>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {INDENT_PLACEMENT_OPTIONS.filter(p => (selectedFlightType?.indentPlacements || ["left","right","both","alternating","none"]).includes(p.key)).map(p => (
                    <Opt key={p.key} label={p.label} selected={config.flightIndentPlacement === p.key}
                      onClick={() => set("flightIndentPlacement", p.key)} />
                  ))}
                </div>
              </div>
            )}
            <NavButtons step={step} onBack={() => set("flightHeightIn", "")}
              onNext={() => {}}
              canNext={false}
              nextLabel="Select indent options above →" />
          </div>
        </div>
      );

      // Sub-step D: Select material
      if (config.flightType && config.flightHeightIn && config.flightIndentOption && !config.flightMaterial) return (
        <div><Header step={step} onClose={onClose} /><ProgressBar step={step} />
          <div style={body}>
            <div style={{ display: "flex", gap: 8, marginBottom: 4 }}>
              <button onClick={() => set("flightIndentOption", "")} style={{ background: "none", border: "none", color: C.navyMid, cursor: "pointer", fontSize: 12, fontWeight: 600 }}>← Indent</button>
            </div>
            <div style={{ fontSize: 15, fontWeight: 800, color: C.navyMid, marginBottom: 4 }}>Flight Material — {selectedFlightType?.name}</div>
            <div style={{ fontSize: 12, color: C.muted, marginBottom: 12 }}>Select the material for the flight modules.</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {(selectedFlightType?.materials || []).map(m => (
                <Opt key={m} label={m} selected={config.flightMaterial === m}
                  onClick={() => set("flightMaterial", m)} />
              ))}
              <Opt label="Unknown — Uniking to recommend" sub="Describe your application in the Notes step"
                selected={config.flightMaterial === "unknown"}
                onClick={() => set("flightMaterial", "unknown")} />
            </div>
            <NavButtons step={step} onBack={() => set("flightIndentOption", "")}
              onNext={next} canNext={!!config.flightMaterial} />
          </div>
        </div>
      );

      // All sub-steps complete — show summary and proceed
      if (config.flightType && config.flightHeightIn && config.flightIndentOption && config.flightMaterial) {
        const heightLabel = config.flightHeightIn === "custom" ? config.flightHeightCustom : `${config.flightHeightIn}" (${Math.round(parseFloat(config.flightHeightIn) * 25.4)} mm)`;
        const indentLabel = INDENT_OPTIONS.find(o => o.key === config.flightIndentOption)?.label || config.flightIndentOption;
        const placementLabel = INDENT_PLACEMENT_OPTIONS.find(p => p.key === config.flightIndentPlacement)?.label || "";
        return (
          <div><Header step={step} onClose={onClose} /><ProgressBar step={step} />
            <div style={body}>
              <BeltSchematic config={config} series={series} beltStyle={beltStyle} units={units} />
              <div style={{ fontSize: 15, fontWeight: 800, color: C.navyMid, marginBottom: 12 }}>Flight Configuration Summary</div>
              <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 10, padding: "14px 16px", marginBottom: 14 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#166534", marginBottom: 8 }}>✓ Flight configured:</div>
                {[
                  ["Type", selectedFlightType?.name],
                  ["Height", heightLabel],
                  ["Indent", indentLabel],
                  ["Placement", placementLabel],
                  ["Material", config.flightMaterial],
                ].filter(([, v]) => v).map(([k, v]) => (
                  <div key={k} style={{ display: "flex", gap: 10, fontSize: 12, marginBottom: 3 }}>
                    <span style={{ color: C.muted, width: 80, flexShrink: 0 }}>{k}:</span>
                    <span style={{ color: C.text, fontWeight: 600 }}>{v}</span>
                  </div>
                ))}
              </div>
              {selectedFlightType?.notes?.map((n, i) => (
                <div key={i} style={{ fontSize: 11, color: "#92400e", background: "#fffbeb", borderRadius: 6, padding: "6px 10px", marginBottom: 6 }}>⚠ {n}</div>
              ))}
              {selectedFlightType?.cadUrl && (
                <a href={selectedFlightType.cadUrl} target="_blank" rel="noreferrer"
                  style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, color: "#E31837", fontWeight: 600, marginBottom: 12, textDecoration: "none" }}>
                  📐 View CAD drawings for {selectedFlightType.name} ↗
                </a>
              )}
              <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                <button onClick={() => { set("flightType", ""); set("flightHeightIn", ""); set("flightIndentOption", ""); set("flightMaterial", ""); }}
                  style={{ background: "none", border: `1px solid ${C.border}`, borderRadius: 8, padding: "8px 14px", cursor: "pointer", fontSize: 12, color: C.muted }}>
                  ← Change flight
                </button>
              </div>
              <NavButtons step={step} onBack={back} onNext={next} canNext={true} nextLabel="Confirm & Continue →" />
            </div>
          </div>
        );
      }
    }

    // No catalog flights for this series — describe requirements
    return (
      <div><Header step={step} onClose={onClose} /><ProgressBar step={step} />
        <div style={body}>
          <BeltSchematic config={config} series={series} beltStyle={beltStyle} units={units} />
          <div style={{ fontSize: 15, fontWeight: 800, color: C.navyMid, marginBottom: 4 }}>Flights — {series?.name}</div>
          <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 8, padding: "10px 14px", fontSize: 12, color: "#92400e", marginBottom: 12 }}>
            ⚠ Catalog-specific flight data for {series?.name} is to be confirmed by Uniking. Please describe your requirements below — type, height, indent, and material.
          </div>
          <SLabel>Flight Requirements</SLabel>
          <textarea value={config.flightDetails} onChange={e => set("flightDetails", e.target.value)}
            placeholder="e.g. 3&quot; Scoop Flights, 1.3&quot; indent both sides, Acetal, every 6 pitches; or 2&quot; Streamline flights, full-width, PP…"
            rows={4} style={{ width: "100%", boxSizing: "border-box", padding: "10px 14px", borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 13, outline: "none", resize: "vertical" }} />
          <div style={{ fontSize: 11, color: C.muted, marginTop: 6 }}>
            Include: flight type, height, indent size &amp; placement, material, and any spacing requirements.
          </div>
          <NavButtons step={step} onBack={() => set("flights", "")} onNext={next} canNext={!!config.flightDetails} />
        </div>
      </div>
    );
  }

  // ── STEP 8: Sideguards ──────────────────────────────────────────────────────
  if (step === STEP.SIDEGUARDS) {
    const sgOpts = series?.accessories?.filter(a => a.type === "sideguard") || [];
    return (
      <div><Header step={step} onClose={onClose} /><ProgressBar step={step} />
        <div style={body}>
          <BeltSchematic config={config} series={series} beltStyle={beltStyle} units={units} />
          <div style={{ fontSize: 15, fontWeight: 800, color: C.navyMid, marginBottom: 4 }}>Sideguards</div>
          <div style={{ fontSize: 12, color: C.muted, marginBottom: 12 }}>Are sideguards required for this belt?</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <Opt label="No sideguards required" selected={config.sideguards === "no"}
              onClick={() => { set("sideguards", "no"); setTimeout(next, 150); }} />
            <Opt label="Yes — sideguards required" selected={config.sideguards === "yes"}
              onClick={() => set("sideguards", "yes")} />
          </div>

          {config.sideguards === "yes" && (
            <div style={{ marginTop: 16 }}>
              {sgOpts.length > 0 ? (
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: C.green, marginBottom: 8 }}>✓ Catalog-confirmed sideguard options for {series?.name}:</div>
                  {sgOpts.map((sg, i) => (
                    <div key={i} style={{ background: "#f8fafc", border: `1px solid ${C.border}`, borderRadius: 8, padding: "12px 14px", marginBottom: 8 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: C.navyMid }}>{sg.name}</div>
                      <div style={{ fontSize: 12, color: C.muted }}>{sg.notes}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 8, padding: "10px 14px", fontSize: 12, color: "#92400e", marginBottom: 10 }}>
                  ⚠ Specific sideguard options for {series?.name} are to be confirmed by Uniking.
                </div>
              )}
              <SLabel>Sideguard Details / Requirements</SLabel>
              <textarea value={config.sideguardDetails} onChange={e => set("sideguardDetails", e.target.value)}
                placeholder="e.g. 75mm tall, both sides, polypropylene, continuous sideguards for incline containment…"
                rows={3} style={{ width: "100%", boxSizing: "border-box", padding: "10px 14px", borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 13, outline: "none", resize: "vertical" }} />
            </div>
          )}
          <NavButtons step={step} onBack={back} onNext={next} canNext={config.sideguards !== ""} />
        </div>
      </div>
    );
  }

  // ── STEP 9: Attachments — auto-skip (Flights step now covers all attachments) ─
  if (step === STEP.ATTACHMENTS) {
    // Auto-advance — flights/attachments are now handled in Step 7
    if (!config.attachments) set("attachments", "covered_in_flights");
    setTimeout(next, 50);
    return <div><Header step={step} onClose={onClose} /><ProgressBar step={step} /><div style={body}><div style={{ textAlign: "center", padding: 30, color: C.muted, fontSize: 13 }}>Continuing…</div></div></div>;
  }

  // ── STEP 10: Product Conveyed ───────────────────────────────────────────────
  if (step === STEP.PRODUCT) return (
    <div><Header step={step} onClose={onClose} /><ProgressBar step={step} />
      <div style={body}>
        <div style={{ fontSize: 15, fontWeight: 800, color: C.navyMid, marginBottom: 4 }}>Product Being Conveyed</div>
        <div style={{ fontSize: 12, color: C.muted, marginBottom: 12 }}>Helps validate belt material and surface selection.</div>
        <textarea value={config.product} onChange={e => set("product", e.target.value)}
          placeholder="e.g. Whole chickens, canned goods, packaged snacks, automotive parts…" rows={4}
          style={{ width: "100%", boxSizing: "border-box", padding: "10px 14px", borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 13, outline: "none", resize: "vertical" }} />
        <NavButtons step={step} onBack={back} onNext={next} canNext={true} />
      </div>
    </div>
  );

  // ── STEP 11: Quantity ───────────────────────────────────────────────────────
  if (step === STEP.QUANTITY) return (
    <div><Header step={step} onClose={onClose} /><ProgressBar step={step} />
      <div style={body}>
        <div style={{ fontSize: 15, fontWeight: 800, color: C.navyMid, marginBottom: 4 }}>Quantity</div>
        <div style={{ fontSize: 12, color: C.muted, marginBottom: 14 }}>How many belts/components do you require?</div>
        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          {["Belts", "Sets", "Each"].map(u => (
            <button key={u} onClick={() => set("quantityUnit", u)}
              style={{ flex: 1, background: config.quantityUnit === u ? C.navyMid : "#f1f5f9", color: config.quantityUnit === u ? "#fff" : C.text, border: `2px solid ${config.quantityUnit === u ? C.navyMid : C.border}`, borderRadius: 8, padding: "8px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
              {u}
            </button>
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button onClick={() => set("quantity", String(Math.max(1, parseInt(config.quantity) - 1)))} style={{ width: 38, height: 38, borderRadius: 8, border: `1px solid ${C.border}`, background: "#fff", cursor: "pointer", fontSize: 20 }}>−</button>
          <input type="number" value={config.quantity} min="1" onChange={e => set("quantity", e.target.value)} style={{ width: 72, textAlign: "center", padding: "8px", borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 16, fontWeight: 700, outline: "none" }} />
          <button onClick={() => set("quantity", String(parseInt(config.quantity) + 1))} style={{ width: 38, height: 38, borderRadius: 8, border: `1px solid ${C.border}`, background: "#fff", cursor: "pointer", fontSize: 20 }}>+</button>
          <span style={{ fontSize: 13, color: C.muted }}>{config.quantityUnit}</span>
        </div>
        <NavButtons step={step} onBack={back} onNext={next} canNext={true} />
      </div>
    </div>
  );

  // ── STEP 12: Uploads ────────────────────────────────────────────────────────
  if (step === STEP.UPLOADS) return (
    <div><Header step={step} onClose={onClose} /><ProgressBar step={step} />
      <div style={body}>
        <div style={{ fontSize: 15, fontWeight: 800, color: C.navyMid, marginBottom: 4 }}>Upload Drawings / Photos</div>
        <div style={{ fontSize: 12, color: C.muted, marginBottom: 14 }}>Attach conveyor drawings, belt photos, or existing belt details. (Optional)</div>
        <div onClick={() => fileInputRef.current?.click()} style={{ border: "2px dashed " + C.border, borderRadius: 10, padding: "28px 20px", textAlign: "center", background: C.bg, cursor: "pointer", marginBottom: 12 }}>
          <div style={{ fontSize: 28, marginBottom: 8 }}>📎</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: C.navyMid }}>Tap to attach files</div>
          <div style={{ fontSize: 12, color: C.muted, marginTop: 4 }}>Images, PDFs, DWG, CAD…</div>
          <input ref={fileInputRef} type="file" multiple accept="*/*" style={{ display: "none" }}
            onChange={e => set("uploads", [...config.uploads, ...Array.from(e.target.files).filter(f => f.size <= 15 * 1024 * 1024)])} />
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
                <button onClick={() => set("uploads", config.uploads.filter((_, j) => j !== i))} style={{ background: "none", border: "none", color: "#9ca3af", cursor: "pointer", fontSize: 20 }}>×</button>
              </div>
            ))}
          </div>
        )}
        <NavButtons step={step} onBack={back} onNext={next} canNext={true} nextLabel="Continue →" />
      </div>
    </div>
  );

  // ── STEP 13: Notes ──────────────────────────────────────────────────────────
  if (step === STEP.NOTES) return (
    <div><Header step={step} onClose={onClose} /><ProgressBar step={step} />
      <div style={body}>
        <div style={{ fontSize: 15, fontWeight: 800, color: C.navyMid, marginBottom: 4 }}>Additional Notes</div>
        <div style={{ fontSize: 12, color: C.muted, marginBottom: 12 }}>Special requirements, existing belt details, conveyor OEM, or anything Uniking should know.</div>
        <textarea value={config.notes} onChange={e => set("notes", e.target.value)}
          placeholder="e.g. Replacing existing Intralox S800 Flat Top belt, same conveyor, SS sprockets required, direct food contact, CFIA facility…"
          rows={5} style={{ width: "100%", boxSizing: "border-box", padding: "12px 14px", borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 13, outline: "none", resize: "vertical" }} />
        {config.unknownFields?.length > 0 && (
          <div style={{ marginTop: 10, background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 8, padding: "10px 14px", fontSize: 12, color: "#92400e" }}>
            ⚠ Fields flagged for Uniking review: {config.unknownFields.join(", ")}
          </div>
        )}
        <NavButtons step={step} onBack={back} onNext={next} canNext={true} nextLabel="Review Summary →" />
      </div>
    </div>
  );

  // ── STEP 14: Review & Tear Sheet ────────────────────────────────────────────
  if (step === STEP.REVIEW) {
    const seriesData = INTRALOX_SERIES.find(s => s.id === config.seriesId) || series;
    const styleData = seriesData?.styles?.find(s => s.key === config.beltStyleKey) || beltStyle;
    const modMat = MODULE_MATERIALS.find(m => m.key === config.moduleMaterial);
    const rodMat = ROD_MATERIALS.find(r => r.key === config.rodMaterial);

    // Find best belt data row for strength/temp display
    const beltRow = Array.isArray(styleData?.beltData)
      ? styleData.beltData.find(r => modMat && (r.material === modMat.label || modMat.label.startsWith(r.material.split(" ")[0])))
      : null;

    const strengthRating = beltRow
      ? `${beltRow.strengthLbfFt?.toLocaleString()} lbf/ft (${beltRow.strengthNm?.toLocaleString()} N/m)`
      : "To be confirmed by Uniking";
    const tempRating = beltRow
      ? `${beltRow.tempF}°F / ${beltRow.tempC}°C`
      : modMat?.key !== "UNKNOWN" ? `${modMat?.tempF}°F / ${modMat?.tempC}°C (standard)` : "To be confirmed by Uniking";

    const fields = [
      ["Series", seriesData?.name],
      ["Belt Type", seriesData?.beltType],
      ["Belt Pitch", seriesData?.pitch_in && seriesData.pitch_in !== "To be confirmed by Uniking" ? `${seriesData.pitch_in}" (${seriesData.pitch_mm} mm)` : "To be confirmed by Uniking"],
      ["2026 Catalog Page", seriesData?.catalogPage ? `p. ${seriesData.catalogPage}` : null],
      ["Belt Style", styleData?.label],
      ["Industry / Application", config.industry],
      ["Product Conveyed", config.product],
      ["Module Material", modMat?.key === "UNKNOWN" ? "To be confirmed by Uniking" : modMat?.label],
      ["Rod Material", rodMat?.key === "UNKNOWN" ? "To be confirmed by Uniking" : rodMat?.label],
      ["Strength Rating", strengthRating],
      ["Temperature Rating", tempRating],
      ["Belt Width", config.beltWidth ? `${config.beltWidth} ${units}` : config.unknownFields?.includes("beltWidth") ? "To be confirmed by Uniking" : ""],
      ["Belt Length", config.beltLength ? `${config.beltLength} ${config.beltLengthUnit}` : config.unknownFields?.includes("beltLength") ? "To be confirmed by Uniking" : ""],
      ["Flights", config.flights === "no" ? "None" : config.flights === "yes" ? (() => {
        if (config.flightFrictionTopOption) return `Friction Top — ${config.flightFrictionTopOption.replace(/_/g, " ")}`;
        if (config.flightType) {
          const parts = [config.flightType.replace(/_/g, " "), config.flightHeightIn === "custom" ? config.flightHeightCustom : config.flightHeightIn ? `${config.flightHeightIn}"` : "", config.flightIndentOption?.replace(/_/g, " "), config.flightIndentPlacement?.replace(/_/g, " "), config.flightMaterial].filter(Boolean);
          return parts.join(" · ");
        }
        return config.flightDetails || "Yes — details to be confirmed by Uniking";
      })() : ""],
      ["Sideguards", config.sideguards === "no" ? "None" : config.sideguards === "yes" ? (config.sideguardDetails || "Yes — details to be confirmed by Uniking") : ""],
      ["Attachments / Top Finish", config.attachments === "no" ? "None / Standard" : config.attachments === "yes" ? (config.attachmentDetails || "Yes — details to be confirmed by Uniking") : ""],
      ["Quantity", `${config.quantity} ${config.quantityUnit}`],
      ["Notes", config.notes],
    ].filter(([, v]) => v && String(v).trim());

    // ── Tear sheet ──
    if (showTearSheet) return (
      <UniKingTearSheet
        config={config}
        series={seriesData}
        beltStyle={styleData}
        fields={fields}
        beltRow={beltRow}
        units={units}
        onClose={() => setShowTearSheet(false)}
      />
    );

    // ── Legacy HTML generator (kept for fallback) ──
    function generateTearSheetHTML() {
      return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<title>Intralox ${seriesData?.name} — ${styleData?.label || "Belt Configuration"}</title>
<style>
*{margin:0;padding:0;box-sizing:border-box;}
body{font-family:'Segoe UI',Arial,sans-serif;color:#111;background:#fff;font-size:13px;}
@media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact;}}
.no-print{padding:12px 24px;background:#f8fafc;border-bottom:1px solid #e2e8f0;display:flex;gap:10px;align-items:center;}
@media print{.no-print{display:none!important;}}
.btn{padding:8px 18px;border:none;border-radius:6px;cursor:pointer;font-size:13px;font-weight:700;}
.btn-primary{background:#0f2340;color:#fff;}
.btn-secondary{background:#f1f5f9;color:#334155;border:1px solid #e2e8f0;}
.header{background:#0f2340;color:#fff;padding:22px 32px;display:flex;align-items:flex-start;justify-content:space-between;}
.intralox-badge{display:inline-block;background:#E31837;border-radius:4px;padding:3px 8px;font-size:9px;font-weight:800;color:#fff;letter-spacing:.5px;margin-bottom:6px;}
.uniking-logo{max-height:28px;filter:brightness(0) invert(1);opacity:0.9;display:block;margin-top:4px;}
.accent-bar{height:4px;background:linear-gradient(90deg,#E31837 0%,#C9A84C 50%,#0f2340 100%);}
.body{padding:24px 32px;}
h1{font-size:20px;font-weight:900;color:#0f2340;margin-bottom:2px;}
.subtitle{font-size:12px;color:#64748b;margin-bottom:18px;}
table{width:100%;border-collapse:collapse;font-size:12px;margin-bottom:18px;}
thead tr{background:#0f2340;}
thead th{padding:8px 12px;color:#fff;font-weight:700;text-align:left;}
tbody tr:nth-child(even){background:#f8fafc;}
tbody td{padding:8px 12px;border-bottom:1px solid #e5e7eb;}
tbody td:first-child{font-weight:600;color:#0f2340;width:38%;}
.warn{background:#fffbeb;border:1px solid #fde68a;border-radius:6px;padding:10px 14px;font-size:11px;color:#92400e;margin:14px 0;}
.strength-box{background:#f0fdf4;border:1px solid #bbf7d0;border-radius:6px;padding:10px 14px;font-size:12px;color:#166534;margin-bottom:14px;}
.unknown-box{background:#fef3c7;border:1px solid #fde68a;border-radius:6px;padding:8px 12px;font-size:11px;color:#92400e;margin-bottom:10px;}
.footer{margin-top:20px;padding-top:12px;border-top:1px solid #e5e7eb;display:flex;justify-content:space-between;font-size:10px;color:#94a3b8;}
.rfq-ref{background:#0f2340;color:#fff;border-radius:6px;padding:8px 16px;font-size:11px;font-weight:700;display:inline-block;margin-bottom:14px;}
</style>
</head>
<body>
<div class="no-print">
  <button class="btn btn-primary" onclick="window.print()">🖨 Print / Save as PDF</button>
  <button class="btn btn-secondary" onclick="window.close()">Close</button>
  <span style="font-size:11px;color:#64748b;margin-left:8px;">Use your browser's Print dialog to save as PDF. Select "Save as PDF" as the destination.</span>
</div>
<div class="header">
  <div>
    <div class="intralox-badge">INTRALOX</div>
    <img src="${LOGO}" class="uniking-logo" alt="Uniking Canada" />
    <div style="margin-top:8px;font-size:11px;color:rgba(255,255,255,0.55)">Modular Plastic Belt Configuration Sheet</div>
  </div>
  <div style="text-align:right">
    <div style="font-size:18px;font-weight:900;color:#fff;">${seriesData?.name || "—"}</div>
    <div style="font-size:12px;color:rgba(255,255,255,0.7);margin-top:2px;">${styleData?.label || "Belt Configuration"}</div>
    <div style="font-size:10px;color:rgba(255,255,255,0.45);margin-top:6px;">${new Date().toLocaleDateString("en-CA", { year: "numeric", month: "long", day: "numeric" })}</div>
  </div>
</div>
<div class="accent-bar"></div>
<div class="body">
  <h1>${seriesData?.name} — ${styleData?.label || "Belt Configuration"}</h1>
  <div class="subtitle">Intralox Modular Plastic Belt · Uniking Canada · Source: 2026 Intralox MPB Engineering Manual</div>

  <div class="warn">⚠ Final belt selection and specifications must be confirmed by Uniking before production. Contact Intralox for precise belt measurements and stock status before designing equipment or ordering a belt.</div>

  ${beltRow ? `<div class="strength-box">✓ Confirmed strength: <strong>${beltRow.strengthLbfFt?.toLocaleString()} lbf/ft (${beltRow.strengthNm?.toLocaleString()} N/m)</strong> &nbsp;|&nbsp; Temp: <strong>${beltRow.tempF}°F / ${beltRow.tempC}°C</strong> &nbsp;|&nbsp; Mass: <strong>${beltRow.massLbFt2} lb/ft² (${beltRow.massKgM2} kg/m²)</strong></div>` : ""}

  ${config.unknownFields?.length > 0 ? `<div class="unknown-box">⚠ Fields flagged for Uniking review: ${config.unknownFields.join(", ")}</div>` : ""}

  <table>
    <thead><tr><th>Parameter</th><th>Specified Value</th></tr></thead>
    <tbody>
${fields.map(([k, v]) => `      <tr><td>${k}</td><td>${v?.includes("To be confirmed") ? `<em style="color:#92400e">${v}</em>` : v}</td></tr>`).join("\n")}
    </tbody>
  </table>

  ${config.applicationDescription ? `<div style="margin-bottom:14px;padding:10px 14px;background:#f8fafc;border-radius:6px;border:1px solid #e2e8f0;font-size:12px;"><strong>Application Description:</strong> ${config.applicationDescription}</div>` : ""}
  ${config.uploads?.length > 0 ? `<div style="margin-bottom:14px;font-size:12px;color:#334155;"><strong>Attached Files:</strong> ${config.uploads.map(f => f.name).join(", ")}</div>` : ""}

  <div class="rfq-ref">📋 Add to RFQ: rfq@unikingcanada.com</div>

  <div class="footer">
    <div>unikingcanada.com · rfq@unikingcanada.com<br/><span style="font-size:9px;text-transform:uppercase;letter-spacing:1px;">Source: 2026 Intralox MPB Engineering Manual</span></div>
    <div style="text-align:right">${seriesData?.name} · ${styleData?.label || ""} · Qty: ${config.quantity} ${config.quantityUnit}</div>
  </div>
</div>
</body>
</html>`;
    }

    function handlePrintTearSheet() {
      const html = generateTearSheetHTML();
      // Write into a hidden iframe and trigger print — avoids popup blocker
      const iframe = document.createElement("iframe");
      iframe.style.cssText = "position:fixed;top:-9999px;left:-9999px;width:1px;height:1px;opacity:0;";
      document.body.appendChild(iframe);
      iframe.contentDocument.open();
      iframe.contentDocument.write(html);
      iframe.contentDocument.close();
      iframe.contentWindow.focus();
      setTimeout(() => {
        iframe.contentWindow.print();
        setTimeout(() => document.body.removeChild(iframe), 2000);
      }, 500);
    }

    function handleDownloadTearSheet() {
      const html = generateTearSheetHTML();
      const fileName = `Intralox-${(seriesData?.name || "belt").replace(/\s/g, "-")}-${(styleData?.label || "config").replace(/\s/g, "-")}.html`;
      // Use data URI to avoid popup blocker issues in iframes
      const dataUri = "data:text/html;charset=utf-8," + encodeURIComponent(html);
      const a = document.createElement("a");
      a.href = dataUri;
      a.download = fileName;
      a.style.display = "none";
      document.body.appendChild(a);
      a.click();
      setTimeout(() => document.body.removeChild(a), 1000);
    }

    function handleAddRFQ() {
      const summaryText = fields.map(([k, v]) => `${k}: ${v}`).join(" | ");
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
        materials: modMat?.label || "",
        quantity: parseInt(config.quantity) || 1,
        unit: config.quantityUnit || "Belts",
        notes: summaryText,
      });
      localStorage.setItem("uniking_rfq_cart", JSON.stringify(cart));
      window.dispatchEvent(new Event("rfq_cart_updated"));
      onComplete(config);
    }

    return (
      <div><Header step={step} onClose={onClose} /><ProgressBar step={step} />
        <div style={body}>
          <BeltSchematic config={config} series={seriesData} beltStyle={styleData} units={units} />
          <div style={{ fontSize: 15, fontWeight: 800, color: C.navyMid, marginBottom: 12 }}>Configuration Summary</div>

          <div style={{ background: C.bg, borderRadius: 10, border: `1px solid ${C.border}`, overflow: "hidden", marginBottom: 14 }}>
            {fields.map(([k, v], i) => (
              <div key={k} style={{ display: "flex", gap: 12, padding: "8px 14px", background: i % 2 === 0 ? "#f8fafc" : "#fff", borderBottom: i < fields.length - 1 ? `1px solid ${C.border}` : "none" }}>
                <span style={{ fontSize: 12, color: C.muted, fontWeight: 600, width: 150, flexShrink: 0 }}>{k}</span>
                <span style={{ fontSize: 12, color: v?.includes("To be confirmed") ? "#92400e" : C.text, flex: 1, fontStyle: v?.includes("To be confirmed") ? "italic" : "normal" }}>{v}</span>
              </div>
            ))}
          </div>

          {beltRow && (
            <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 8, padding: "10px 14px", fontSize: 12, color: "#166534", marginBottom: 12 }}>
              ✓ Catalog-confirmed strength: {beltRow.strengthLbfFt?.toLocaleString()} lbf/ft · Temp: {beltRow.tempF}°F / {beltRow.tempC}°C
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

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button onClick={back} style={{ background: "#f1f5f9", border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 16px", cursor: "pointer", fontSize: 13 }}>← Back</button>
            <button onClick={() => setShowTearSheet(true)} style={{ flex: 1, padding: "11px", background: C.gold, color: C.navy, border: "none", borderRadius: 10, cursor: "pointer", fontSize: 13, fontWeight: 800 }}>📄 View / Print Tear Sheet</button>
            <button onClick={handleAddRFQ} style={{ flex: 2, padding: "11px", background: C.green, color: "#fff", border: "none", borderRadius: 10, cursor: "pointer", fontSize: 14, fontWeight: 800, minWidth: "100%" }}>Add to RFQ ✓</button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}