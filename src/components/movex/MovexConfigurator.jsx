/**
 * Movex Modular Belt Configurator
 * Mirrors IntraloxConfigurator's 15-step flow: Series → Style → Industry →
 * Material → Pin → Width → Length → Flights → Sideguards → Attachments →
 * Product → Quantity → Uploads → Notes → Review.
 */
import { useState, useRef } from "react";
import { MOVEX_SERIES, MOVEX_INDUSTRIES } from "@/lib/movexData";
import BeltSchematic from "@/components/intralox/BeltSchematic";
import UniKingTearSheet from "@/components/intralox/UnkingTearSheet";

const C = {
  navy: "#0E1F3A", navyMid: "#0E1F3A", gold: "#F26522",
  green: "#2E7D46", border: "#D9D6CE", muted: "#3A4A66", bg: "#F4F2ED", text: "#0E1F3A",
};
const MOVEX_RED = "#E63946";

const LENGTH_UNITS = ["mm", "inches", "feet", "metres"];

const STEPS = [
  "Series", "Belt Style", "Industry", "Belt Material", "Pin Material",
  "Belt Width", "Belt Length", "Flights", "Sideguards", "Attachments",
  "Product Conveyed", "Quantity", "Uploads", "Notes", "Review",
];
const STEP = {
  SERIES: 0, STYLE: 1, INDUSTRY: 2, MATERIAL: 3, PIN: 4,
  WIDTH: 5, LENGTH: 6, FLIGHTS: 7, SIDEGUARDS: 8, ATTACHMENTS: 9,
  PRODUCT: 10, QUANTITY: 11, UPLOADS: 12, NOTES: 13, REVIEW: 14,
};

// ── Shared sub-components ───────────────────────────────────────────────────
function Header({ step, onClose }) {
  return (
    <div style={{ padding: "20px 24px 0", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
          <div style={{ background: MOVEX_RED, borderRadius: 4, padding: "2px 8px" }}>
            <span style={{ fontSize: 10, fontWeight: 800, color: "#fff" }}>MOVEX</span>
          </div>
          <span style={{ fontSize: 13, fontWeight: 700, color: C.text }}>Belt Configurator</span>
        </div>
        <div style={{ fontSize: 12, color: C.muted }}>Build your RFQ line item step by step</div>
      </div>
      <button onClick={onClose} style={{ background: "#ECEAE4", border: "1px solid #D9D6CE", color: C.muted, borderRadius: 8, padding: "6px 12px", cursor: "pointer", fontSize: 13, fontWeight: 700 }}>✕</button>
    </div>
  );
}

function ProgressBar({ step }) {
  return (
    <div style={{ display: "flex", gap: 4, padding: "14px 24px 0" }}>
      {STEPS.map((_, n) => (
        <div key={n} style={{ flex: 1, height: 4, borderRadius: 4, background: n <= step ? C.navyMid : "#D9D6CE", transition: "background 0.2s" }} />
      ))}
    </div>
  );
}

function StepHeader({ number, title, subtitle }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
        <div style={{ width: 28, height: 28, borderRadius: "50%", background: C.navyMid, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 800, flexShrink: 0 }}>{number}</div>
        <div style={{ fontSize: 17, fontWeight: 800, color: C.text }}>{title}</div>
      </div>
      {subtitle && <div style={{ fontSize: 12, color: C.muted, marginLeft: 38 }}>{subtitle}</div>}
    </div>
  );
}

function NavButtons({ step, onBack, onNext, canNext = true, nextLabel = "Next →" }) {
  return (
    <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
      {step > 0 && <button onClick={onBack} style={{ background: "#ECEAE4", border: "1px solid " + C.border, borderRadius: 8, padding: "10px 20px", cursor: "pointer", fontSize: 13 }}>← Back</button>}
      <button onClick={onNext} disabled={!canNext}
        style={{ flex: 1, background: canNext ? C.navyMid : "#D9D6CE", color: canNext ? "#fff" : C.muted, border: "none", borderRadius: 8, padding: "12px 24px", cursor: canNext ? "pointer" : "default", fontSize: 13, fontWeight: 700 }}>
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
    <button onClick={onClick} style={{ background: selected ? C.navyMid : "#ECEAE4", color: selected ? "#fff" : C.text, border: "2px solid " + (selected ? C.navyMid : C.border), borderRadius: 10, padding: "10px 14px", cursor: "pointer", textAlign: "left", fontSize: 13, fontWeight: selected ? 700 : 400, transition: "all 0.15s" }}>
      {label}
      {sub && <div style={{ fontSize: 11, color: selected ? "rgba(255,255,255,0.7)" : C.muted, marginTop: 2 }}>{sub}</div>}
    </button>
  );
}

// ── Main Configurator ───────────────────────────────────────────────────────
export default function MovexConfigurator({ initialSeries, initialStyle, onComplete, onClose }) {
  const [step, setStep] = useState(initialSeries ? (initialStyle ? STEP.INDUSTRY : STEP.STYLE) : STEP.SERIES);
  const [units, setUnits] = useState("inches");
  const [showTearSheet, setShowTearSheet] = useState(false);
  const [config, setConfig] = useState({
    seriesId: initialSeries?.id || "",
    styleKey: initialStyle?.key || "",
    industry: "",
    material: "",
    pinMaterial: "",
    beltWidth: "",
    beltLength: "",
    beltLengthUnit: "feet",
    flights: "",
    flightDetails: "",
    sideguards: "",
    sideguardDetails: "",
    attachments: "",
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

  const seriesData = MOVEX_SERIES.find(s => s.id === config.seriesId) || initialSeries;
  const styleData = seriesData?.styles?.find(s => s.key === config.styleKey) || initialStyle;
  const hasBeltData = Array.isArray(styleData?.beltData);

  const beltRow = hasBeltData
    ? styleData.beltData.find(r => r.material === config.material && r.pinMaterial === config.pinMaterial) || styleData.beltData.find(r => r.material === config.material)
    : null;

  function set(field, val) { setConfig(p => ({ ...p, [field]: val })); }
  function markUnknown(field) {
    const existing = config.unknownFields || [];
    if (!existing.includes(field)) set("unknownFields", [...existing, field]);
  }
  function next() { setStep(s => Math.min(s + 1, STEPS.length - 1)); }
  function back() { setStep(s => Math.max(s - 1, 0)); }

  const bodyStyle = { padding: "16px 24px 24px", maxHeight: "70vh", overflowY: "auto" };

  const UnitToggle = () => (
    <div style={{ display: "flex", alignItems: "center", gap: 4, background: "#ECEAE4", borderRadius: 20, padding: "3px 6px", marginBottom: 12, width: "fit-content" }}>
      <span style={{ fontSize: 10, color: C.muted, marginRight: 2 }}>Units:</span>
      {["inches", "mm"].map(u => (
        <button key={u} onClick={() => setUnits(u)}
          style={{ padding: "4px 12px", borderRadius: 16, border: "none", cursor: "pointer", fontSize: 11, fontWeight: 700, background: units === u ? C.navyMid : "transparent", color: units === u ? "#fff" : C.muted }}>
          {u}
        </button>
      ))}
    </div>
  );

  // ── STEP 0: Series ───────────────────────────────────────────────────────
  if (step === STEP.SERIES) return (
    <div><Header step={step} onClose={onClose} /><ProgressBar step={step} />
      <div style={bodyStyle}>
        <StepHeader number={1} title="Select Belt Series" subtitle="Choose the Movex/Blueline® belt series for your application" />
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {MOVEX_SERIES.map(s => (
            <button key={s.id} onClick={() => { set("seriesId", s.id); set("styleKey", ""); setTimeout(next, 120); }}
              style={{ background: config.seriesId === s.id ? C.navyMid : "#fff", border: "2px solid " + (config.seriesId === s.id ? C.navyMid : C.border), borderRadius: 10, padding: "12px 16px", cursor: "pointer", textAlign: "left", display: "flex", gap: 12, transition: "all 0.15s" }}>
              <div style={{ flexShrink: 0, width: 48, height: 40, borderRadius: 6, overflow: "hidden", background: "#F4F2ED" }}>
                {s.image && <img src={s.image} alt={s.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={e => e.target.style.display = "none"} />}
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: config.seriesId === s.id ? "#fff" : C.text }}>{s.name}</div>
                <div style={{ fontSize: 11, color: config.seriesId === s.id ? "rgba(255,255,255,0.7)" : C.muted, marginTop: 2 }}>
                  {s.beltType} · {s.pitch_in && s.pitch_in !== "To be confirmed by Uniking" ? s.pitch_in + '" pitch · ' : ""}{s.styles?.length || 0} style{s.styles?.length !== 1 ? "s" : ""} · {(s.applications || []).slice(0, 2).join(", ")}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  // ── STEP 1: Belt Style ───────────────────────────────────────────────────
  if (step === STEP.STYLE) return (
    <div><Header step={step} onClose={onClose} /><ProgressBar step={step} />
      <div style={bodyStyle}>
        <BeltSchematic config={config} series={seriesData} beltStyle={styleData} units={units} />
        <StepHeader number={2} title="Select Belt Style" subtitle={seriesData?.name} />
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {seriesData?.styles?.map(s => (
            <button key={s.key} onClick={() => { set("styleKey", s.key); set("material", ""); set("pinMaterial", ""); setTimeout(next, 120); }}
              style={{ background: config.styleKey === s.key ? C.navyMid : "#fff", border: "2px solid " + (config.styleKey === s.key ? C.navyMid : C.border), borderRadius: 10, padding: "12px 16px", cursor: "pointer", textAlign: "left", display: "flex", gap: 12, transition: "all 0.15s" }}>
              <div style={{ flexShrink: 0, width: 48, height: 40, borderRadius: 6, overflow: "hidden", background: "#F4F2ED" }}>
                {(s.image || seriesData?.image) && <img src={s.image || seriesData.image} alt={s.label} style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={e => e.target.style.display = "none"} />}
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: config.styleKey === s.key ? "#fff" : C.text }}>{s.label}</div>
                <div style={{ fontSize: 11, color: config.styleKey === s.key ? "rgba(255,255,255,0.7)" : C.muted, marginTop: 2 }}>
                  Open Area: {s.openArea} · {s.surface}{s.applications?.length ? " · " + s.applications.slice(0, 2).join(", ") : ""}
                </div>
              </div>
            </button>
          ))}
        </div>
        <NavButtons step={step} onBack={back} onNext={next} canNext={!!config.styleKey} />
      </div>
    </div>
  );

  // ── STEP 2: Industry ─────────────────────────────────────────────────────
  if (step === STEP.INDUSTRY) return (
    <div><Header step={step} onClose={onClose} /><ProgressBar step={step} />
      <div style={bodyStyle}>
        <BeltSchematic config={config} series={seriesData} beltStyle={styleData} units={units} />
        <StepHeader number={3} title="Industry / Application" subtitle="Select your industry — you'll automatically proceed to the next step" />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {MOVEX_INDUSTRIES.map(i => (
            <Opt key={i} label={i} selected={config.industry === i}
              onClick={() => { set("industry", i); setTimeout(next, 180); }} />
          ))}
        </div>
        <NavButtons step={step} onBack={back} onNext={next} canNext={!!config.industry} />
      </div>
    </div>
  );

  // ── STEP 3: Belt Material ────────────────────────────────────────────────
  if (step === STEP.MATERIAL) {
    const materials = hasBeltData ? [...new Set(styleData.beltData.map(r => r.material))] : [];
    return (
      <div><Header step={step} onClose={onClose} /><ProgressBar step={step} />
        <div style={bodyStyle}>
          <BeltSchematic config={config} series={seriesData} beltStyle={styleData} units={units} />
          <StepHeader number={4} title="Belt Material" subtitle={styleData?.label} />
          {hasBeltData ? (
            <>
              <div style={{ fontSize: 11, fontWeight: 700, color: C.green, marginBottom: 8 }}>✓ Materials confirmed for {seriesData?.name} {styleData?.label}:</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {materials.map(matKey => {
                  const rows = styleData.beltData.filter(r => r.material === matKey);
                  const first = rows[0];
                  return (
                    <button key={matKey} onClick={() => { set("material", matKey); set("pinMaterial", ""); setTimeout(next, 120); }}
                      style={{ background: config.material === matKey ? C.navyMid : "#fff", border: "2px solid " + (config.material === matKey ? C.navyMid : C.border), borderRadius: 10, padding: "12px 16px", cursor: "pointer", textAlign: "left", transition: "all 0.15s" }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: config.material === matKey ? "#fff" : C.text }}>{first.label || matKey}</div>
                      <div style={{ fontSize: 11, color: config.material === matKey ? "rgba(255,255,255,0.7)" : C.muted, marginTop: 2 }}>
                        Strength: {first.strengthNm?.toLocaleString()} N/m ({first.strengthLbsFt} lbs/ft) · Temp: {first.tempC}°C · Mass: {first.massKgM2} kg/m²
                      </div>
                      <div style={{ fontSize: 10, color: config.material === matKey ? "rgba(255,255,255,0.5)" : C.muted, marginTop: 3 }}>
                        Pin options: {rows.map(r => r.pinMaterial).join(", ")}
                      </div>
                    </button>
                  );
                })}
                <Opt label="Unknown — Uniking to recommend" sub="Describe your application and Uniking will recommend the correct material"
                  selected={config.material === "UNKNOWN"}
                  onClick={() => { set("material", "UNKNOWN"); markUnknown("material"); setTimeout(next, 120); }} />
              </div>
            </>
          ) : (
            <>
              <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 8, padding: "10px 14px", fontSize: 12, color: "#92400e", marginBottom: 12 }}>
                ⚠ Material data for this style is <strong>To be confirmed by Uniking</strong>. Please proceed and add notes below.
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {Object.entries({
                  LFA: "LFA — Low Friction Acetal (White)",
                  LFC: "LFC — Low Friction Acetal (Cyan)",
                  LFW: "LFW — Low Friction Acetal (White)",
                  LFB: "LFB — Low Friction Acetal (Blue)",
                  POM: "POM — Acetal Resin (Standard)",
                  MX: "MX — Performance PBT",
                  PP: "PP — Polypropylene",
                  PKC: "PKC — Polyketone (Cyan)",
                  PKW: "PKW — Polyketone (White)",
                  MDX: "MDX — Metal Detectable X-Ray POM",
                }).map(([key, label]) => (
                  <button key={key} onClick={() => { set("material", key); setTimeout(next, 120); }}
                    style={{ background: config.material === key ? C.navyMid : "#fff", border: "2px solid " + (config.material === key ? C.navyMid : C.border), borderRadius: 10, padding: "12px 16px", cursor: "pointer", textAlign: "left", transition: "all 0.15s" }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: config.material === key ? "#fff" : C.text }}>{label}</div>
                  </button>
                ))}
                <Opt label="Unknown — Uniking to recommend" sub="Describe your application and Uniking will recommend the correct material"
                  selected={config.material === "UNKNOWN"}
                  onClick={() => { set("material", "UNKNOWN"); markUnknown("material"); setTimeout(next, 120); }} />
              </div>
            </>
          )}
          {config.material === "UNKNOWN" && (
            <div style={{ marginTop: 12 }}>
              <SLabel>Describe your application so Uniking can recommend the correct material:</SLabel>
              <textarea value={config.applicationDescription} onChange={e => set("applicationDescription", e.target.value)}
                placeholder="e.g. Direct food contact, high temperature baking, chemical wash-down, low temperature freezer…"
                rows={3} style={{ width: "100%", boxSizing: "border-box", padding: "10px 14px", borderRadius: 8, border: "1px solid " + C.border, fontSize: 13, outline: "none", resize: "vertical" }} />
            </div>
          )}
          <NavButtons step={step} onBack={back} onNext={next} canNext={!!config.material} />
        </div>
      </div>
    );
  }

  // ── STEP 4: Pin Material ─────────────────────────────────────────────────
  if (step === STEP.PIN) {
    const pinRows = hasBeltData && config.material !== "UNKNOWN"
      ? styleData.beltData.filter(r => r.material === config.material)
      : [];
    const fallbackPins = ["PBT Pin", "PP Pin", "PE Pin", "PBT White", "Stainless Steel"];
    return (
      <div><Header step={step} onClose={onClose} /><ProgressBar step={step} />
        <div style={bodyStyle}>
          <BeltSchematic config={config} series={seriesData} beltStyle={styleData} units={units} />
          <StepHeader number={5} title="Pin Material" subtitle={styleData?.label} />
          {seriesData?.fixation && seriesData.fixation !== "Missing Data – Needs Mapping" && (
            <div style={{ fontSize: 12, color: C.muted, marginBottom: 10 }}>Fixation: {seriesData.fixation}</div>
          )}
          {pinRows.length > 0 ? (
            <>
              <div style={{ fontSize: 11, fontWeight: 700, color: C.green, marginBottom: 8 }}>✓ Catalog-confirmed pin materials for this module:</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {pinRows.map((row, i) => (
                  <button key={i} onClick={() => { set("pinMaterial", row.pinMaterial); setTimeout(next, 120); }}
                    style={{ background: config.pinMaterial === row.pinMaterial ? C.navyMid : "#fff", border: "2px solid " + (config.pinMaterial === row.pinMaterial ? C.navyMid : C.border), borderRadius: 10, padding: "12px 16px", cursor: "pointer", textAlign: "left", transition: "all 0.15s" }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: config.pinMaterial === row.pinMaterial ? "#fff" : C.text }}>{row.pinMaterial}</div>
                    <div style={{ fontSize: 11, color: config.pinMaterial === row.pinMaterial ? "rgba(255,255,255,0.7)" : C.muted, marginTop: 2 }}>
                      Strength: {row.strengthNm?.toLocaleString()} N/m ({row.strengthLbsFt} lbs/ft) · Temp: {row.tempC}°C
                    </div>
                  </button>
                ))}
                <Opt label="Unknown — Uniking to recommend" selected={config.pinMaterial === "UNKNOWN"}
                  onClick={() => { set("pinMaterial", "UNKNOWN"); markUnknown("pinMaterial"); setTimeout(next, 120); }} />
              </div>
            </>
          ) : (
            <>
              <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 8, padding: "10px 14px", fontSize: 12, color: "#92400e", marginBottom: 12 }}>
                Pin material to be confirmed by Uniking for this series/style. Standard catalog options shown.
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {fallbackPins.map(p => (
                  <button key={p} onClick={() => { set("pinMaterial", p); setTimeout(next, 120); }}
                    style={{ background: config.pinMaterial === p ? C.navyMid : "#fff", border: "2px solid " + (config.pinMaterial === p ? C.navyMid : C.border), borderRadius: 10, padding: "12px 16px", cursor: "pointer", textAlign: "left", transition: "all 0.15s" }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: config.pinMaterial === p ? "#fff" : C.text }}>{p}</div>
                  </button>
                ))}
                <Opt label="Unknown — Uniking to recommend" selected={config.pinMaterial === "UNKNOWN"}
                  onClick={() => { set("pinMaterial", "UNKNOWN"); markUnknown("pinMaterial"); setTimeout(next, 120); }} />
              </div>
            </>
          )}
          <NavButtons step={step} onBack={back} onNext={next} canNext={!!config.pinMaterial} />
        </div>
      </div>
    );
  }

  // ── STEP 5: Belt Width ───────────────────────────────────────────────────
  if (step === STEP.WIDTH) {
    const minIn = seriesData?.min_width_in;
    const incrIn = seriesData?.width_increment_in;
    const minMm = seriesData?.min_width_mm;
    const incrMm = seriesData?.width_increment_mm;
    const widthVal = parseFloat(config.beltWidth) || 0;
    let validationMsg = null;
    if (widthVal > 0 && minIn && incrIn && units === "inches") {
      if (widthVal < minIn) validationMsg = { ok: false, msg: "⚠ Minimum width is " + minIn + '" for ' + seriesData.name };
      else {
        const diff = (widthVal - minIn) % incrIn;
        if (diff > 0.01) validationMsg = { ok: false, msg: '⚠ Must be in ' + incrIn + '" increments from ' + minIn + '". Nearest: ' + (minIn + Math.round((widthVal - minIn) / incrIn) * incrIn).toFixed(2) + '"' };
        else validationMsg = { ok: true, msg: "✓ Valid width" };
      }
    }
    if (widthVal > 0 && minMm && incrMm && units === "mm") {
      if (widthVal < minMm) validationMsg = { ok: false, msg: "⚠ Minimum width is " + minMm + " mm for " + seriesData.name };
      else {
        const diff = (widthVal - minMm) % incrMm;
        if (diff > 0.5) validationMsg = { ok: false, msg: "⚠ Must be in " + incrMm + " mm increments from " + minMm + " mm." };
        else validationMsg = { ok: true, msg: "✓ Valid width" };
      }
    }
    const widthPlaceholder = units === "mm" ? ("e.g. " + (minMm || 50)) : ('e.g. ' + (minIn || 3));
    return (
      <div><Header step={step} onClose={onClose} /><ProgressBar step={step} />
        <div style={bodyStyle}>
          <UnitToggle />
          <BeltSchematic config={config} series={seriesData} beltStyle={styleData} units={units} />
          <StepHeader number={6} title="Belt Width" />
          {seriesData && (
            <div style={{ fontSize: 12, color: C.muted, marginBottom: 10 }}>
              {units === "mm"
                ? "Min: " + (minMm ?? "TBC") + " mm · Increments: " + (incrMm ?? "TBC") + " mm"
                : 'Min: ' + (minIn ?? "TBC") + '" · Increments: ' + (incrIn ?? "TBC")
              } · Confirm with Movex for exact widths.
            </div>
          )}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <input type="number" value={config.beltWidth} onChange={e => set("beltWidth", e.target.value)}
              placeholder={widthPlaceholder}
              style={{ flex: 1, padding: "10px 14px", borderRadius: 8, border: "1px solid " + C.border, fontSize: 14, outline: "none" }} />
            <div style={{ background: "#ECEAE4", borderRadius: 8, padding: "10px 14px", fontSize: 13, fontWeight: 700, color: C.navyMid, whiteSpace: "nowrap" }}>{units}</div>
          </div>
          {validationMsg && (
            <div style={{ marginTop: 8, padding: "8px 12px", background: validationMsg.ok ? "#f0fdf4" : "#fef2f2", borderRadius: 7, fontSize: 12, fontWeight: 600, color: validationMsg.ok ? "#2E7D46" : "#C62828" }}>
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

  // ── STEP 6: Belt Length ──────────────────────────────────────────────────
  if (step === STEP.LENGTH) return (
    <div><Header step={step} onClose={onClose} /><ProgressBar step={step} />
      <div style={bodyStyle}>
        <UnitToggle />
        <BeltSchematic config={config} series={seriesData} beltStyle={styleData} units={units} />
        <StepHeader number={7} title="Belt Length" />
        <div style={{ fontSize: 12, color: C.muted, marginBottom: 10 }}>Enter the conveyor length. Uniking will calculate total belt length including return.</div>
        <div style={{ display: "flex", gap: 10 }}>
          <input type="number" value={config.beltLength} onChange={e => set("beltLength", e.target.value)}
            placeholder="e.g. 15" style={{ flex: 1, padding: "10px 14px", borderRadius: 8, border: "1px solid " + C.border, fontSize: 14, outline: "none" }} />
          <select value={config.beltLengthUnit} onChange={e => set("beltLengthUnit", e.target.value)}
            style={{ padding: "10px 14px", borderRadius: 8, border: "1px solid " + C.border, fontSize: 13, outline: "none", background: "#fff", fontWeight: 700, color: C.navyMid }}>
            {LENGTH_UNITS.map(u => <option key={u} value={u}>{u}</option>)}
          </select>
        </div>
        <div style={{ marginTop: 8, fontSize: 12, color: C.muted, background: "#FDF0E9", borderRadius: 6, padding: "8px 12px" }}>
          ℹ Total belt running length = conveyor length × 2 + sprocket/nosebar allowance. Movex must confirm before ordering.
        </div>
        <NavButtons step={step} onBack={back} onNext={next} canNext={true} />
        <div style={{ textAlign: "center" }}>
          <button onClick={() => { set("beltLength", ""); markUnknown("beltLength"); next(); }} style={{ background: "none", border: "none", color: C.muted, fontSize: 12, cursor: "pointer", textDecoration: "underline", marginTop: 8 }}>I don't know yet</button>
        </div>
      </div>
    </div>
  );

  // ── STEP 7: Flights ──────────────────────────────────────────────────────
  if (step === STEP.FLIGHTS) return (
    <div><Header step={step} onClose={onClose} /><ProgressBar step={step} />
      <div style={bodyStyle}>
        <BeltSchematic config={config} series={seriesData} beltStyle={styleData} units={units} />
        <StepHeader number={8} title="Flights / Attachments" subtitle="Flights are molded modules for incline conveying or product containment" />
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <Opt label="No flights / attachments required" sub="Standard belt only"
            selected={config.flights === "no"}
            onClick={() => { set("flights", "no"); setTimeout(next, 150); }} />
          <Opt label="Yes — flights / attachments required" sub="Describe type, height, and spacing"
            selected={config.flights === "yes"}
            onClick={() => set("flights", "yes")} />
        </div>
        {config.flights === "yes" && (
          <div style={{ marginTop: 16 }}>
            <SLabel>Flight Requirements</SLabel>
            <textarea value={config.flightDetails} onChange={e => set("flightDetails", e.target.value)}
              placeholder='e.g. 2" straight flights, every 6 pitches, both sides; or scoop flights for incline...'
              rows={4} style={{ width: "100%", boxSizing: "border-box", padding: "10px 14px", borderRadius: 8, border: "1px solid " + C.border, fontSize: 13, outline: "none", resize: "vertical" }} />
          </div>
        )}
        <NavButtons step={step} onBack={back} onNext={next} canNext={config.flights !== ""} />
      </div>
    </div>
  );

  // ── STEP 8: Sideguards ───────────────────────────────────────────────────
  if (step === STEP.SIDEGUARDS) {
    const sgOpts = seriesData?.accessories?.filter(a => a.type === "sideguard") || [];
    return (
      <div><Header step={step} onClose={onClose} /><ProgressBar step={step} />
        <div style={bodyStyle}>
          <BeltSchematic config={config} series={seriesData} beltStyle={styleData} units={units} />
          <StepHeader number={9} title="Sideguards" subtitle="Are sideguards required for this belt?" />
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
                  <div style={{ fontSize: 12, fontWeight: 700, color: C.green, marginBottom: 8 }}>✓ Catalog-confirmed sideguard options for {seriesData?.name}:</div>
                  {sgOpts.map((sg, i) => (
                    <div key={i} style={{ background: "#F4F2ED", border: "1px solid " + C.border, borderRadius: 8, padding: "12px 14px", marginBottom: 8 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: C.navyMid }}>{sg.name}</div>
                      <div style={{ fontSize: 12, color: C.muted }}>{sg.notes}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 8, padding: "10px 14px", fontSize: 12, color: "#92400e", marginBottom: 10 }}>
                  ⚠ Specific sideguard options for {seriesData?.name} are to be confirmed by Uniking.
                </div>
              )}
              <SLabel>Sideguard Details / Requirements</SLabel>
              <textarea value={config.sideguardDetails} onChange={e => set("sideguardDetails", e.target.value)}
                placeholder="e.g. 75mm tall, both sides, polypropylene, continuous sideguards for incline containment…"
                rows={3} style={{ width: "100%", boxSizing: "border-box", padding: "10px 14px", borderRadius: 8, border: "1px solid " + C.border, fontSize: 13, outline: "none", resize: "vertical" }} />
            </div>
          )}
          <NavButtons step={step} onBack={back} onNext={next} canNext={config.sideguards !== ""} />
        </div>
      </div>
    );
  }

  // ── STEP 9: Attachments (auto-skip) ──────────────────────────────────────
  if (step === STEP.ATTACHMENTS) {
    if (!config.attachments) set("attachments", "covered_in_flights");
    setTimeout(next, 50);
    return <div><Header step={step} onClose={onClose} /><ProgressBar step={step} /><div style={bodyStyle}><div style={{ textAlign: "center", padding: 30, color: C.muted, fontSize: 13 }}>Continuing…</div></div></div>;
  }

  // ── STEP 10: Product Conveyed ─────────────────────────────────────────────
  if (step === STEP.PRODUCT) return (
    <div><Header step={step} onClose={onClose} /><ProgressBar step={step} />
      <div style={bodyStyle}>
        <StepHeader number={11} title="Product Being Conveyed" subtitle="Helps validate belt material and surface selection" />
        <textarea value={config.product} onChange={e => set("product", e.target.value)}
          placeholder="e.g. Whole chickens, canned goods, packaged snacks, automotive parts…" rows={4}
          style={{ width: "100%", boxSizing: "border-box", padding: "10px 14px", borderRadius: 8, border: "1px solid " + C.border, fontSize: 13, outline: "none", resize: "vertical" }} />
        <NavButtons step={step} onBack={back} onNext={next} canNext={true} />
      </div>
    </div>
  );

  // ── STEP 11: Quantity ─────────────────────────────────────────────────────
  if (step === STEP.QUANTITY) return (
    <div><Header step={step} onClose={onClose} /><ProgressBar step={step} />
      <div style={bodyStyle}>
        <StepHeader number={12} title="Quantity" subtitle="How many belts/components do you require?" />
        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          {["Belts", "Sets", "Each"].map(u => (
            <button key={u} onClick={() => set("quantityUnit", u)}
              style={{ flex: 1, background: config.quantityUnit === u ? C.navyMid : "#ECEAE4", color: config.quantityUnit === u ? "#fff" : C.text, border: "2px solid " + (config.quantityUnit === u ? C.navyMid : C.border), borderRadius: 8, padding: "8px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
              {u}
            </button>
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button onClick={() => set("quantity", String(Math.max(1, parseInt(config.quantity) - 1)))} style={{ width: 38, height: 38, borderRadius: 8, border: "1px solid " + C.border, background: "#fff", cursor: "pointer", fontSize: 20 }}>−</button>
          <input type="number" value={config.quantity} min="1" onChange={e => set("quantity", e.target.value)} style={{ width: 72, textAlign: "center", padding: "8px", borderRadius: 8, border: "1px solid " + C.border, fontSize: 16, fontWeight: 700, outline: "none" }} />
          <button onClick={() => set("quantity", String(parseInt(config.quantity) + 1))} style={{ width: 38, height: 38, borderRadius: 8, border: "1px solid " + C.border, background: "#fff", cursor: "pointer", fontSize: 20 }}>+</button>
          <span style={{ fontSize: 13, color: C.muted }}>{config.quantityUnit}</span>
        </div>
        <NavButtons step={step} onBack={back} onNext={next} canNext={true} />
      </div>
    </div>
  );

  // ── STEP 12: Uploads ──────────────────────────────────────────────────────
  if (step === STEP.UPLOADS) return (
    <div><Header step={step} onClose={onClose} /><ProgressBar step={step} />
      <div style={bodyStyle}>
        <StepHeader number={13} title="Upload Drawings / Photos" subtitle="Attach conveyor drawings, belt photos, or existing belt details (optional)" />
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
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", background: "#F4F2ED", borderRadius: 8, border: "1px solid " + C.border }}>
                <span style={{ fontSize: 18 }}>{f.type.startsWith("image/") ? "🖼️" : "📄"}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navyMid, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{f.name}</div>
                  <div style={{ fontSize: 11, color: C.muted }}>{(f.size / 1024).toFixed(0)} KB</div>
                </div>
                <button onClick={() => set("uploads", config.uploads.filter((_, j) => j !== i))} style={{ background: "none", border: "none", color: "#8A94A6", cursor: "pointer", fontSize: 20 }}>×</button>
              </div>
            ))}
          </div>
        )}
        <NavButtons step={step} onBack={back} onNext={next} canNext={true} nextLabel="Continue →" />
      </div>
    </div>
  );

  // ── STEP 13: Notes ───────────────────────────────────────────────────────
  if (step === STEP.NOTES) return (
    <div><Header step={step} onClose={onClose} /><ProgressBar step={step} />
      <div style={bodyStyle}>
        <StepHeader number={14} title="Additional Notes" subtitle="Special requirements, existing belt details, conveyor OEM, or anything Uniking should know" />
        <textarea value={config.notes} onChange={e => set("notes", e.target.value)}
          placeholder="e.g. Replacing existing Movex 520 Flat Top belt, same conveyor, SS sprockets required, direct food contact, CFIA facility…"
          rows={5} style={{ width: "100%", boxSizing: "border-box", padding: "12px 14px", borderRadius: 8, border: "1px solid " + C.border, fontSize: 13, outline: "none", resize: "vertical" }} />
        {config.unknownFields?.length > 0 && (
          <div style={{ marginTop: 10, background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 8, padding: "10px 14px", fontSize: 12, color: "#92400e" }}>
            ⚠ Fields flagged for Uniking review: {config.unknownFields.join(", ")}
          </div>
        )}
        <NavButtons step={step} onBack={back} onNext={next} canNext={true} nextLabel="Review Summary →" />
      </div>
    </div>
  );

  // ── STEP 14: Review ──────────────────────────────────────────────────────
  if (step === STEP.REVIEW) {
    const materialLabel = config.material === "UNKNOWN" ? "To be confirmed by Uniking"
      : hasBeltData ? (styleData.beltData.find(r => r.material === config.material)?.label || config.material)
      : config.material || "To be confirmed by Uniking";
    const pinLabel = config.pinMaterial === "UNKNOWN" ? "To be confirmed by Uniking" : (config.pinMaterial || "To be confirmed by Uniking");

    const fields = [
      ["Brand", "Movex"],
      ["Series", seriesData?.name],
      ["Belt Type", seriesData?.beltType],
      ["Belt Pitch", seriesData?.pitch_in && seriesData.pitch_in !== "To be confirmed by Uniking" ? seriesData.pitch_in + '" (' + seriesData.pitch_mm + ' mm)' : "To be confirmed by Uniking"],
      ["Belt Style", styleData?.label],
      ["Surface", styleData?.surface],
      ["Open Area", styleData?.openArea],
      ["Industry / Application", config.industry],
      ["Product Conveyed", config.product],
      ["Belt Material", materialLabel],
      ["Pin Material", pinLabel],
      ["Strength Rating", beltRow ? beltRow.strengthNm?.toLocaleString() + " N/m (" + beltRow.strengthLbsFt + " lbs/ft)" : "To be confirmed by Uniking"],
      ["Temperature Rating", beltRow ? beltRow.tempC + "°C / " + beltRow.tempF + "°F" : "To be confirmed by Uniking"],
      ["Belt Width", config.beltWidth ? config.beltWidth + " " + units : config.unknownFields?.includes("beltWidth") ? "To be confirmed by Uniking" : ""],
      ["Belt Length", config.beltLength ? config.beltLength + " " + config.beltLengthUnit : config.unknownFields?.includes("beltLength") ? "To be confirmed by Uniking" : ""],
      ["Flights", config.flights === "no" ? "None" : config.flights === "yes" ? (config.flightDetails || "Yes — details to be confirmed by Uniking") : ""],
      ["Sideguards", config.sideguards === "no" ? "None" : config.sideguards === "yes" ? (config.sideguardDetails || "Yes — details to be confirmed by Uniking") : ""],
      ["Quantity", config.quantity + " " + config.quantityUnit],
      ["Fixation", seriesData?.fixation && seriesData.fixation !== "Missing Data – Needs Mapping" ? seriesData.fixation : "To be confirmed by Uniking"],
      ["Catalog Reference", seriesData?.catalogPage ? "Movex p. " + seriesData.catalogPage : "—"],
      ["Notes", config.notes],
    ].filter(([, v]) => v && String(v).trim());

    if (showTearSheet) return (
      <UniKingTearSheet
        config={config}
        series={{ ...seriesData, beltType: "Movex — " + (seriesData?.beltType || "") }}
        beltStyle={styleData}
        fields={fields}
        beltRow={beltRow}
        units={units}
        onClose={() => setShowTearSheet(false)}
      />
    );

    function handleAddRFQ() {
      const summaryText = fields.map(([k, v]) => k + ": " + v).join(" | ");
      const cart = JSON.parse(localStorage.getItem("uniking_rfq_cart") || "[]");
      cart.push({
        cartId: "movex_belt_" + Date.now(),
        id: "movex_belt_" + Date.now(),
        _source: "movex_belt_config",
        series: (seriesData?.name || "") + " — " + (styleData?.label || ""),
        name: (seriesData?.name || "") + " " + (styleData?.label || ""),
        type: "Modular Plastic Belt — Movex",
        style: styleData?.label || "",
        category: "Modular Belting — Movex",
        image_url: styleData?.image || seriesData?.image || "",
        materials: materialLabel,
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
        <div style={bodyStyle}>
          <BeltSchematic config={config} series={seriesData} beltStyle={styleData} units={units} />
          <StepHeader number={15} title="Review & Submit" subtitle="Confirm your configuration before adding to RFQ" />

          <div style={{ background: C.bg, borderRadius: 10, border: "1px solid " + C.border, overflow: "hidden", marginBottom: 14 }}>
            {fields.map(([k, v], i) => (
              <div key={k} style={{ display: "flex", gap: 12, padding: "8px 14px", background: i % 2 === 0 ? "#F4F2ED" : "#fff", borderBottom: i < fields.length - 1 ? "1px solid " + C.border : "none" }}>
                <span style={{ fontSize: 12, color: C.muted, fontWeight: 600, width: 150, flexShrink: 0 }}>{k}</span>
                <span style={{ fontSize: 12, color: v?.includes("To be confirmed") ? "#92400e" : C.text, flex: 1, fontStyle: v?.includes("To be confirmed") ? "italic" : "normal" }}>{v}</span>
              </div>
            ))}
          </div>

          {beltRow && (
            <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 8, padding: "10px 14px", fontSize: 12, color: "#2E7D46", marginBottom: 12 }}>
              ✓ Catalog-confirmed: Max load {beltRow.strengthNm?.toLocaleString()} N/m ({beltRow.strengthLbsFt} lbs/ft) · Temp {beltRow.tempC}°C / {beltRow.tempF}°F · Mass {beltRow.massKgM2} kg/m²
            </div>
          )}

          {config.unknownFields?.length > 0 && (
            <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 8, padding: "10px 14px", fontSize: 12, color: "#92400e", marginBottom: 12 }}>
              ⚠ Flagged for Uniking review: {config.unknownFields.join(", ")}
            </div>
          )}

          {config.uploads.length > 0 && (
            <div style={{ background: "#FDF0E9", border: "1px solid #F8C9B0", borderRadius: 8, padding: "10px 14px", fontSize: 12, color: "#0E1F3A", marginBottom: 12 }}>
              📎 {config.uploads.length} file{config.uploads.length !== 1 ? "s" : ""} attached
            </div>
          )}

          <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 8, padding: "10px 14px", fontSize: 12, color: "#92400e", marginBottom: 14 }}>
            <strong>Disclaimer:</strong> Final belt selection and specifications must be confirmed by Uniking before production.
          </div>

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button onClick={back} style={{ background: "#ECEAE4", border: "1px solid " + C.border, borderRadius: 8, padding: "10px 16px", cursor: "pointer", fontSize: 13 }}>← Back</button>
            <button onClick={() => setShowTearSheet(true)} style={{ flex: 1, padding: "11px", background: C.gold, color: C.navy, border: "none", borderRadius: 10, cursor: "pointer", fontSize: 13, fontWeight: 800 }}>📄 View / Print Tear Sheet</button>
            <button onClick={handleAddRFQ} style={{ flex: 2, padding: "11px", background: C.green, color: "#fff", border: "none", borderRadius: 10, cursor: "pointer", fontSize: 14, fontWeight: 800, minWidth: "100%" }}>Add to RFQ ✓</button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}