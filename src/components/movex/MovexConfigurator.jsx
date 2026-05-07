/**
 * Movex Modular Belt Configurator
 * Mirrors IntraloxConfigurator structure 1:1 for Movex belts.
 */
import { useState, useRef } from "react";
import { MOVEX_SERIES } from "@/lib/movexData";
import BeltSchematic from "@/components/intralox/BeltSchematic";
import UniKingTearSheet from "@/components/intralox/UnkingTearSheet";
import { jsPDF } from "jspdf";

const C = {
  navy: "#0C2340", navyMid: "#1A3A5C", gold: "#C9A84C",
  border: "#e2e8f0", muted: "#64748b", bg: "#f8fafc", green: "#16a34a", text: "#0f172a",
};
const MOVEX_RED = "#E63946";

const STEP = { SERIES: 0, STYLE: 1, MATERIAL: 2, DIMENSIONS: 3, ATTACHMENTS: 4, REVIEW: 5 };
const STEP_LABELS = ["Series", "Style", "Material", "Dimensions", "Attachments", "Review"];

const UNITS_OPTIONS = [
  { key: "feet",   label: "Feet" },
  { key: "meters", label: "Meters" },
  { key: "inches", label: "Inches" },
];

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
      <button onClick={onClose} style={{ background: "#f1f5f9", border: "1px solid #e2e8f0", color: C.muted, borderRadius: 8, padding: "6px 12px", cursor: "pointer", fontSize: 13, fontWeight: 700 }}>✕</button>
    </div>
  );
}

function ProgressBar({ step }) {
  return (
    <div style={{ display: "flex", gap: 4, padding: "14px 24px 0" }}>
      {STEP_LABELS.map((_, i) => (
        <div key={i} style={{ flex: 1, height: 4, borderRadius: 4, background: i <= step ? C.navyMid : "#e2e8f0", transition: "background 0.2s" }} />
      ))}
    </div>
  );
}

function StepHeader({ number, title, subtitle }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
        <div style={{ width: 28, height: 28, borderRadius: "50%", background: C.navyMid, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 800, flexShrink: 0 }}>
          {number}
        </div>
        <div style={{ fontSize: 17, fontWeight: 800, color: C.text }}>{title}</div>
      </div>
      {subtitle && <div style={{ fontSize: 12, color: C.muted, marginLeft: 38 }}>{subtitle}</div>}
    </div>
  );
}

const body = { padding: "16px 24px 24px", overflowY: "auto", maxHeight: "calc(100vh - 200px)" };
const label = { fontSize: 12, fontWeight: 700, color: C.navyMid, marginBottom: 6, display: "block" };
const select = { width: "100%", padding: "9px 12px", border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 12, color: C.text, background: "#fff", marginBottom: 14, outline: "none" };
const input = { width: "100%", padding: "9px 12px", border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 12, color: C.text, background: "#fff", marginBottom: 14, outline: "none", boxSizing: "border-box" };
const nextBtn = { width: "100%", padding: "12px", background: C.navyMid, color: "#fff", border: "none", borderRadius: 10, cursor: "pointer", fontSize: 14, fontWeight: 800, marginTop: 6 };
const backBtn = { background: "#f1f5f9", border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 16px", cursor: "pointer", fontSize: 13 };

export default function MovexConfigurator({ initialSeries, initialStyle, onComplete, onClose }) {
  const [step, setStep] = useState(initialSeries ? (initialStyle ? STEP.MATERIAL : STEP.STYLE) : STEP.SERIES);
  const [config, setConfig] = useState({
    seriesId: initialSeries?.id || "",
    styleKey: initialStyle?.key || "",
    material: "",
    pinMaterial: "",
    widthIn: "",
    widthUnit: "inches",
    lengthValue: "",
    lengthUnit: "feet",
    hasFlight: false,
    flightHeight: "",
    hasSideguard: false,
    sideguardHeight: "",
    hasAttachment: false,
    attachmentNotes: "",
    notes: "",
    quantity: 1,
    quantityUnit: "Belts",
    uploads: [],
  });
  const [showTearSheet, setShowTearSheet] = useState(false);
  const fileInputRef = useRef();

  const seriesData = MOVEX_SERIES.find(s => s.id === config.seriesId) || initialSeries;
  const styleData = seriesData?.styles?.find(s => s.key === config.styleKey) || initialStyle;
  const hasBeltData = Array.isArray(styleData?.beltData);
  const beltRow = hasBeltData ? styleData.beltData.find(r => r.material === config.material) || styleData.beltData[0] : null;

  function set(k, v) { setConfig(p => ({ ...p, [k]: v })); }
  function back() { setStep(s => Math.max(0, s - 1)); }

  // ── Step 0: Series Select ─────────────────────────────────────────────────
  if (step === STEP.SERIES) {
    return (
      <div>
        <Header step={step} onClose={onClose} />
        <ProgressBar step={step} />
        <div style={body}>
          <StepHeader number={1} title="Select Belt Series" />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 10 }}>
            {MOVEX_SERIES.map(s => (
              <button key={s.id} onClick={() => { set("seriesId", s.id); set("styleKey", ""); setStep(STEP.STYLE); }}
                style={{
                  background: config.seriesId === s.id ? C.navyMid : "#fff", color: config.seriesId === s.id ? "#fff" : C.text,
                  border: `2px solid ${config.seriesId === s.id ? C.navyMid : C.border}`,
                  borderRadius: 10, padding: "12px 14px", cursor: "pointer", textAlign: "left", transition: "all 0.15s",
                }}>
                <div style={{ fontSize: 12, fontWeight: 800, marginBottom: 3 }}>{s.name}</div>
                <div style={{ fontSize: 10, opacity: 0.7 }}>{s.pitch_in !== "To be confirmed by Uniking" ? `Pitch: ${s.pitch_in}"` : ""} · {s.beltType}</div>
                <div style={{ fontSize: 10, opacity: 0.6, marginTop: 2 }}>{s.styles?.length} styles</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── Step 1: Style Select ──────────────────────────────────────────────────
  if (step === STEP.STYLE) {
    return (
      <div>
        <Header step={step} onClose={onClose} />
        <ProgressBar step={step} />
        <div style={body}>
          <StepHeader number={2} title="Select Belt Style" subtitle={seriesData?.name} />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 10 }}>
            {(seriesData?.styles || []).map(style => {
              const sel = config.styleKey === style.key;
              return (
                <button key={style.key} onClick={() => { set("styleKey", style.key); set("material", ""); setStep(STEP.MATERIAL); }}
                  style={{
                    background: sel ? C.navyMid : "#fff", color: sel ? "#fff" : C.text,
                    border: `2px solid ${sel ? C.navyMid : C.border}`,
                    borderRadius: 10, padding: "12px 14px", cursor: "pointer", textAlign: "left",
                    display: "flex", flexDirection: "column", gap: 4,
                  }}>
                  {style.image && <img src={style.image} alt={style.label} style={{ width: "100%", height: 80, objectFit: "cover", borderRadius: 6, marginBottom: 4 }} onError={e => e.target.style.display = "none"} />}
                  <div style={{ fontSize: 12, fontWeight: 800 }}>{style.label}</div>
                  <div style={{ fontSize: 10, opacity: 0.7 }}>{style.surface}</div>
                  <div style={{ fontSize: 10, opacity: 0.6 }}>{style.openArea} open area</div>
                  {style.beltData === "Missing Data – Needs Mapping" && <div style={{ fontSize: 9, color: sel ? "#fde68a" : "#f59e0b", marginTop: 2 }}>⚠ Data TBC</div>}
                </button>
              );
            })}
          </div>
          <div style={{ marginTop: 14 }}>
            <button onClick={back} style={backBtn}>← Back</button>
          </div>
        </div>
      </div>
    );
  }

  // ── Step 2: Material Select ───────────────────────────────────────────────
  if (step === STEP.MATERIAL) {
    const materials = hasBeltData ? styleData.beltData : [];
    return (
      <div>
        <Header step={step} onClose={onClose} />
        <ProgressBar step={step} />
        <div style={body}>
          <StepHeader number={3} title="Belt Material" subtitle={styleData?.label} />
          {hasBeltData ? (
            <>
              <div style={{ fontSize: 12, color: C.muted, marginBottom: 14 }}>Select belt module material. Strength and temperature ratings shown per catalog data.</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 14 }}>
                {materials.map((mat, i) => {
                  const sel = config.material === mat.material && config.pinMaterial === mat.pinMaterial;
                  return (
                    <button key={i} onClick={() => { set("material", mat.material); set("pinMaterial", mat.pinMaterial || ""); }}
                      style={{
                        background: sel ? "#eef3f8" : "#fff", border: `2px solid ${sel ? C.navyMid : C.border}`,
                        borderRadius: 10, padding: "12px 14px", cursor: "pointer", textAlign: "left",
                      }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: sel ? C.navyMid : C.text }}>{mat.label}</div>
                        {sel && <div style={{ fontSize: 10, background: C.navyMid, color: "#fff", padding: "2px 7px", borderRadius: 8, fontWeight: 700 }}>Selected</div>}
                      </div>
                      <div style={{ display: "flex", gap: 12, fontSize: 11, color: C.muted, marginTop: 4, flexWrap: "wrap" }}>
                        {mat.strengthNm && <span>Max load: <strong style={{ color: C.green }}>{mat.strengthNm.toLocaleString()} N/m ({mat.strengthLbsFt} lbs/ft)</strong></span>}
                        {mat.tempC && <span>Temp: <strong>{mat.tempC}°C / {mat.tempF}°F</strong></span>}
                        {mat.massKgM2 && <span>Mass: <strong>{mat.massKgM2} kg/m²</strong></span>}
                      </div>
                      {mat.pinMaterial && <div style={{ fontSize: 10, color: C.muted, marginTop: 3 }}>Pin: {mat.pinMaterial}</div>}
                      {mat.note && <div style={{ fontSize: 10, color: "#f59e0b", marginTop: 3 }}>⚠ {mat.note}</div>}
                    </button>
                  );
                })}
                {/* Unknown option */}
                <button onClick={() => { set("material", "UNKNOWN"); set("pinMaterial", ""); }}
                  style={{
                    background: config.material === "UNKNOWN" ? "#eef3f8" : "#fff",
                    border: `2px solid ${config.material === "UNKNOWN" ? C.navyMid : C.border}`,
                    borderRadius: 10, padding: "12px 14px", cursor: "pointer", textAlign: "left",
                  }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>Unknown / To be determined</div>
                  <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>I need help selecting the right material — Uniking will assist.</div>
                </button>
              </div>
            </>
          ) : (
            <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 8, padding: "14px", fontSize: 13, color: "#92400e", marginBottom: 14 }}>
              ⚠ Material data for this style is <strong>To be confirmed by Uniking</strong>. Please proceed and add notes below.
            </div>
          )}
          {config.material === "UNKNOWN" && (
            <div style={{ marginBottom: 14 }}>
              <label style={label}>Describe your application (so Uniking can recommend material)</label>
              <textarea value={config.notes} onChange={e => set("notes", e.target.value)}
                style={{ ...input, height: 80, resize: "vertical" }}
                placeholder="e.g. Food processing, wet environment, operating temp 0-40°C, product type..." />
            </div>
          )}
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={back} style={backBtn}>← Back</button>
            <button onClick={() => setStep(STEP.DIMENSIONS)} style={{ ...nextBtn, flex: 1 }}
              disabled={!config.material}>
              Next: Dimensions →
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Step 3: Dimensions ────────────────────────────────────────────────────
  if (step === STEP.DIMENSIONS) {
    const minW = seriesData?.min_width_in;
    const incW = seriesData?.width_increment_in;
    return (
      <div>
        <Header step={step} onClose={onClose} />
        <ProgressBar step={step} />
        <div style={body}>
          <StepHeader number={4} title="Belt Dimensions" />
          <div style={{ fontSize: 12, color: C.muted, marginBottom: 14 }}>
            {typeof minW === "number" && `Min width: ${minW}" (${seriesData?.min_width_mm} mm).`}
            {typeof incW === "number" && ` Width increment: ${incW}" (${seriesData?.width_increment_mm} mm).`}
            {seriesData?.width_increment_note && ` ${seriesData.width_increment_note}`}
          </div>

          <label style={label}>Belt Width (inches)</label>
          <input type="number" value={config.widthIn} onChange={e => set("widthIn", e.target.value)}
            style={input} placeholder={`e.g. ${typeof minW === "number" ? minW : "12"}`}
            min={typeof minW === "number" ? minW : 0} step={typeof incW === "number" ? incW : 0.5} />
          {typeof minW === "number" && typeof incW === "number" && config.widthIn && (
            <div style={{ marginTop: -10, marginBottom: 10, fontSize: 11, color: C.muted }}>
              Nearest valid width: <strong>{(Math.round((parseFloat(config.widthIn) - minW) / incW) * incW + minW).toFixed(2)}"</strong>
            </div>
          )}

          <label style={label}>Belt Length</label>
          <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
            <input type="number" value={config.lengthValue} onChange={e => set("lengthValue", e.target.value)}
              style={{ ...input, flex: 2, marginBottom: 0 }} placeholder="e.g. 10" min="0.1" step="0.1" />
            <select value={config.lengthUnit} onChange={e => set("lengthUnit", e.target.value)}
              style={{ ...select, flex: 1, marginBottom: 0 }}>
              {UNITS_OPTIONS.map(u => <option key={u.key} value={u.key}>{u.label}</option>)}
            </select>
          </div>

          <label style={label}>Additional Notes</label>
          <textarea value={config.notes} onChange={e => set("notes", e.target.value)}
            style={{ ...input, height: 70, resize: "vertical" }}
            placeholder="Any special requirements, operating conditions, etc." />

          <label style={label}>Attach Files (drawings, specs)</label>
          <input ref={fileInputRef} type="file" multiple onChange={e => set("uploads", Array.from(e.target.files))}
            style={{ marginBottom: 14, fontSize: 12 }} />

          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={back} style={backBtn}>← Back</button>
            <button onClick={() => setStep(STEP.ATTACHMENTS)} style={{ ...nextBtn, flex: 1 }}
              disabled={!config.widthIn || !config.lengthValue}>
              Next: Attachments →
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Step 4: Attachments ───────────────────────────────────────────────────
  if (step === STEP.ATTACHMENTS) {
    return (
      <div>
        <Header step={step} onClose={onClose} />
        <ProgressBar step={step} />
        <div style={body}>
          <StepHeader number={5} title="Attachments & Options" subtitle="Select any flights, sideguards, or attachments for this belt" />

          {/* Flights */}
          <div style={{ background: "#fff", border: `1px solid ${C.border}`, borderRadius: 10, padding: "14px", marginBottom: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: C.navyMid }}>Flights</div>
                <div style={{ fontSize: 11, color: C.muted }}>For incline conveying and product separation</div>
              </div>
              <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                <input type="checkbox" checked={config.hasFlight} onChange={e => set("hasFlight", e.target.checked)} />
                <span style={{ fontSize: 12 }}>Include</span>
              </label>
            </div>
            {config.hasFlight && (
              <div style={{ marginTop: 10 }}>
                <label style={{ ...label, marginBottom: 4 }}>Flight Height (inches)</label>
                <input type="text" value={config.flightHeight} onChange={e => set("flightHeight", e.target.value)}
                  style={{ ...input, marginBottom: 0 }} placeholder='e.g. 1", 2", 3" or custom' />
              </div>
            )}
          </div>

          {/* Sideguards */}
          <div style={{ background: "#fff", border: `1px solid ${C.border}`, borderRadius: 10, padding: "14px", marginBottom: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: C.navyMid }}>Sideguards / Sidewalls</div>
                <div style={{ fontSize: 11, color: C.muted }}>For product containment</div>
              </div>
              <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                <input type="checkbox" checked={config.hasSideguard} onChange={e => set("hasSideguard", e.target.checked)} />
                <span style={{ fontSize: 12 }}>Include</span>
              </label>
            </div>
            {config.hasSideguard && (
              <div style={{ marginTop: 10 }}>
                <label style={{ ...label, marginBottom: 4 }}>Sideguard Height (inches)</label>
                <input type="text" value={config.sideguardHeight} onChange={e => set("sideguardHeight", e.target.value)}
                  style={{ ...input, marginBottom: 0 }} placeholder='e.g. 2", 4" or specify' />
              </div>
            )}
          </div>

          {/* Other attachments */}
          <div style={{ background: "#fff", border: `1px solid ${C.border}`, borderRadius: 10, padding: "14px", marginBottom: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: C.navyMid }}>Other Attachments</div>
                <div style={{ fontSize: 11, color: C.muted }}>Nosebars, wearstrips, special components</div>
              </div>
              <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                <input type="checkbox" checked={config.hasAttachment} onChange={e => set("hasAttachment", e.target.checked)} />
                <span style={{ fontSize: 12 }}>Include</span>
              </label>
            </div>
            {config.hasAttachment && (
              <div style={{ marginTop: 10 }}>
                <label style={{ ...label, marginBottom: 4 }}>Describe attachment requirements</label>
                <textarea value={config.attachmentNotes} onChange={e => set("attachmentNotes", e.target.value)}
                  style={{ ...input, height: 60, resize: "vertical", marginBottom: 0 }}
                  placeholder="e.g. Narrow nosebar, UHMW wearstrips, custom tabs..." />
              </div>
            )}
          </div>

          {/* Quantity */}
          <div style={{ background: "#fff", border: `1px solid ${C.border}`, borderRadius: 10, padding: "14px", marginBottom: 14 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: C.navyMid, marginBottom: 10 }}>Quantity</div>
            <div style={{ display: "flex", gap: 8 }}>
              <input type="number" value={config.quantity} onChange={e => set("quantity", e.target.value)}
                style={{ ...input, flex: 2, marginBottom: 0 }} placeholder="1" min="1" step="1" />
              <select value={config.quantityUnit} onChange={e => set("quantityUnit", e.target.value)}
                style={{ ...select, flex: 1, marginBottom: 0 }}>
                <option>Belts</option>
                <option>Meters</option>
                <option>Feet</option>
                <option>Sets</option>
              </select>
            </div>
          </div>

          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={back} style={backBtn}>← Back</button>
            <button onClick={() => setStep(STEP.REVIEW)} style={{ ...nextBtn, flex: 1 }}>Review & Submit →</button>
          </div>
        </div>
      </div>
    );
  }

  // ── Step 5: Review ────────────────────────────────────────────────────────
  if (step === STEP.REVIEW) {
    const fields = [
      ["Brand", "Movex"],
      ["Series", seriesData?.name || "—"],
      ["Belt Type", seriesData?.beltType || "—"],
      ["Belt Style", styleData?.label || "—"],
      ["Surface", styleData?.surface || "—"],
      ["Open Area", styleData?.openArea || "—"],
      ["Module Material", config.material === "UNKNOWN" ? "To be confirmed by Uniking" : (hasBeltData ? (styleData.beltData.find(r => r.material === config.material)?.label || config.material) : "To be confirmed by Uniking")],
      ["Pin Material", config.pinMaterial || "To be confirmed by Uniking"],
      ["Belt Width", config.widthIn ? `${config.widthIn}"` : "To be confirmed by Uniking"],
      ["Belt Length", config.lengthValue ? `${config.lengthValue} ${config.lengthUnit}` : "To be confirmed by Uniking"],
      ["Flights", config.hasFlight ? `Yes — ${config.flightHeight || "height TBC"}` : "No"],
      ["Sideguards", config.hasSideguard ? `Yes — ${config.sideguardHeight || "height TBC"}` : "No"],
      ["Other Attachments", config.hasAttachment ? (config.attachmentNotes || "Yes — details TBC") : "No"],
      ["Quantity", `${config.quantity || 1} ${config.quantityUnit}`],
      ["Notes", config.notes || "—"],
      ["Pitch", seriesData?.pitch_in !== "To be confirmed by Uniking" && seriesData?.pitch_in ? `${seriesData.pitch_in}" (${seriesData.pitch_mm} mm)` : "To be confirmed by Uniking"],
      ["Catalog Reference", `Movex Imperial Catalog p. ${seriesData?.catalogPage || "—"}`],
    ];

    if (showTearSheet) return (
      <UniKingTearSheet
        config={config}
        series={{ ...seriesData, beltType: "Movex — " + (seriesData?.beltType || "") }}
        beltStyle={styleData}
        fields={fields}
        beltRow={beltRow}
        units="inches"
        onClose={() => setShowTearSheet(false)}
      />
    );

    function handleAddRFQ() {
      const summaryText = fields.map(([k, v]) => `${k}: ${v}`).join(" | ");
      const cart = JSON.parse(localStorage.getItem("uniking_rfq_cart") || "[]");
      cart.push({
        cartId: `movex_belt_${Date.now()}`,
        id: `movex_belt_${Date.now()}`,
        _source: "movex_belt_config",
        series: `${seriesData?.name} — ${styleData?.label}`,
        name: `${seriesData?.name} ${styleData?.label}`,
        type: "Modular Plastic Belt — Movex",
        style: styleData?.label || "",
        category: "Modular Belting — Movex",
        image_url: styleData?.image || seriesData?.image || "",
        materials: config.material,
        quantity: parseInt(config.quantity) || 1,
        unit: config.quantityUnit || "Belts",
        notes: summaryText,
      });
      localStorage.setItem("uniking_rfq_cart", JSON.stringify(cart));
      window.dispatchEvent(new Event("rfq_cart_updated"));
      onComplete(config);
    }

    return (
      <div>
        <Header step={step} onClose={onClose} />
        <ProgressBar step={step} />
        <div style={body}>
          <BeltSchematic config={{
            ...config,
            series: seriesData?.id,
            style: config.styleKey,
            width: config.widthIn,
            length: config.lengthValue,
            lengthUnit: config.lengthUnit,
            hasFlight: config.hasFlight,
            flightHeight: config.flightHeight,
            hasSideguard: config.hasSideguard,
          }} series={seriesData} beltStyle={styleData} units="inches" />

          <StepHeader number={6} title="Review & Submit" subtitle="Confirm your configuration before adding to RFQ" />

          <div style={{ background: C.bg, borderRadius: 10, border: `1px solid ${C.border}`, overflow: "hidden", marginBottom: 14 }}>
            {fields.map(([k, v], i) => (
              <div key={k} style={{ display: "flex", gap: 12, padding: "8px 14px", background: i % 2 === 0 ? "#f8fafc" : "#fff", borderBottom: i < fields.length - 1 ? `1px solid ${C.border}` : "none" }}>
                <span style={{ fontSize: 12, color: C.muted, fontWeight: 600, width: 160, flexShrink: 0 }}>{k}</span>
                <span style={{ fontSize: 12, color: v?.includes("To be confirmed") ? "#92400e" : C.text, flex: 1, fontStyle: v?.includes("To be confirmed") ? "italic" : "normal" }}>{v}</span>
              </div>
            ))}
          </div>

          {beltRow && (
            <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 8, padding: "10px 14px", fontSize: 12, color: "#166534", marginBottom: 12 }}>
              ✓ Catalog-confirmed: Max load {beltRow.strengthNm?.toLocaleString()} N/m ({beltRow.strengthLbsFt} lbs/ft) · Temp {beltRow.tempC}
            </div>
          )}

          {config.uploads?.length > 0 && (
            <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 8, padding: "10px 14px", fontSize: 12, color: "#1e40af", marginBottom: 12 }}>
              📎 {config.uploads.length} file{config.uploads.length !== 1 ? "s" : ""} attached
            </div>
          )}

          <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 8, padding: "10px 14px", fontSize: 12, color: "#92400e", marginBottom: 14 }}>
            <strong>Disclaimer:</strong> Final belt selection and specifications must be confirmed by Uniking before production.
          </div>

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button onClick={back} style={backBtn}>← Back</button>
            <button onClick={() => setShowTearSheet(true)} style={{ flex: 1, padding: "11px", background: C.gold, color: C.navy, border: "none", borderRadius: 10, cursor: "pointer", fontSize: 13, fontWeight: 800 }}>📄 View / Print Tear Sheet</button>
            <button onClick={handleAddRFQ} style={{ flex: 2, padding: "11px", background: C.green, color: "#fff", border: "none", borderRadius: 10, cursor: "pointer", fontSize: 14, fontWeight: 800, minWidth: "100%" }}>Add to RFQ ✓</button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}