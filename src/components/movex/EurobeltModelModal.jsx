/**
 * EurobeltModelModal — Click a Eurobelt model to view specs and configure
 * options (material, width, quantity) before adding to the RFQ cart.
 * Mirrors the MovexSprocketModal pattern.
 */
import { useState } from "react";

const C = {
  navy: "#0E1F3A", navyMid: "#0E1F3A", border: "#D9D6CE",
  muted: "#3A4A66", bg: "#F4F2ED", green: "#2E7D46", text: "#0E1F3A",
};
const EUROBELT_BLUE = "#0066B3";

const MATERIALS = [
  { key: "POM_W",  label: "POM White (Acetal)",           abbr: "POM-W"  },
  { key: "POM_B",  label: "POM Blue (Acetal)",            abbr: "POM-B"  },
  { key: "POM_G",  label: "POM Green (Acetal)",           abbr: "POM-G"  },
  { key: "POM_BK", label: "POM Black (Acetal)",           abbr: "POM-BK" },
  { key: "PP_W",   label: "PP White (Polypropylene)",     abbr: "PP-W"   },
  { key: "PBT",    label: "PBT Beige",                    abbr: "PBT"    },
  { key: "POM_AS", label: "POM Antistatic",               abbr: "POM-AS" },
  { key: "POM_DT", label: "POM Detectable",               abbr: "POM-DT" },
  { key: "POM_FR", label: "POM Flame Retardant",          abbr: "POM-FR" },
];

function OptionChip({ label, selected, onClick }) {
  return (
    <button type="button" onClick={onClick}
      style={{
        padding: "7px 13px", borderRadius: 8, cursor: "pointer",
        border: `1.5px solid ${selected ? C.navyMid : C.border}`,
        background: selected ? C.navyMid : "#fff",
        color: selected ? "#fff" : C.text,
        fontSize: 12, fontWeight: 700, whiteSpace: "nowrap",
      }}>{label}</button>
  );
}

function FieldLabel({ children }) {
  return <div style={{ fontSize: 10, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: 7 }}>{children}</div>;
}

export default function EurobeltModelModal({ model, series, onClose, onAddToRFQ }) {
  const [material, setMaterial] = useState("POM_W");
  const [width, setWidth] = useState("");
  const [widthUnit, setWidthUnit] = useState("mm");
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState("");
  const [added, setAdded] = useState(false);

  const materialLabel = MATERIALS.find(m => m.key === material)?.label || material;

  function handleAdd() {
    const descParts = [model.label, materialLabel];
    if (width) descParts.push(`${width} ${widthUnit}`);
    descParts.push(`Qty ${quantity}`);

    onAddToRFQ({
      ...model,
      name: model.label,
      series: `${series.name} — ${model.label}`,
      type: "Eurobelt Modular Belt",
      category: "Modular Belting — Movex — Eurobelt",
      material: materialLabel,
      width: width ? `${width} ${widthUnit}` : "To be confirmed",
      quantity,
      unit: "Each",
      notes: [model.description, notes].filter(Boolean).join(" · "),
      _configured: true,
      _configSummary: descParts.join(" · "),
    });
    setAdded(true);
    setTimeout(() => onClose(), 1200);
  }

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.65)", zIndex: 1000, display: "flex", alignItems: "flex-start", justifyContent: "center", padding: 16, overflowY: "auto" }}>
      <div onClick={e => e.stopPropagation()} style={{ background: "#fff", borderRadius: 16, width: "100%", maxWidth: 640, boxShadow: "0 24px 80px rgba(0,0,0,0.3)", marginBottom: 16 }}>

        {/* Header */}
        <div style={{ background: C.navyMid, borderRadius: "16px 16px 0 0", padding: "16px 22px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <div style={{ background: EUROBELT_BLUE, borderRadius: 4, padding: "2px 7px" }}>
                <span style={{ fontSize: 9, fontWeight: 800, color: "#fff" }}>EUROBELT</span>
              </div>
              <span style={{ color: "rgba(255,255,255,0.6)", fontSize: 11 }}>{series.name} · Belt Model</span>
            </div>
            <div style={{ color: "#fff", fontSize: 17, fontWeight: 900 }}>{model.label}</div>
          </div>
          <button onClick={onClose} style={{ background: "rgba(255,255,255,0.15)", border: "none", borderRadius: "50%", width: 32, height: 32, cursor: "pointer", color: "#fff", fontSize: 17 }}>✕</button>
        </div>

        <div style={{ padding: "18px 22px" }}>
          {/* Image + quick specs */}
          <div style={{ display: "flex", gap: 14, marginBottom: 16 }}>
            <div style={{ width: 120, height: 100, flexShrink: 0, background: "#F4F2ED", borderRadius: 8, overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
              {(model.image || series.image) ? (
                <img src={model.image || series.image} alt={model.label} style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={e => { e.target.style.display = "none"; e.target.parentElement.innerHTML = "🔗"; e.target.parentElement.style.fontSize = "32px"; }} />
              ) : (
                <span style={{ fontSize: 32 }}>🔗</span>
              )}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: 8 }}>Catalog Specs</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, fontSize: 11 }}>
                <div><span style={{ fontWeight: 600, color: C.navyMid }}>Pitch:</span> <span style={{ color: C.muted }}>{series.pitch_mm} mm ({series.pitch_in}")</span></div>
                <div><span style={{ fontWeight: 600, color: C.navyMid }}>Surface:</span> <span style={{ color: C.muted }}>{model.surface}</span></div>
                <div><span style={{ fontWeight: 600, color: C.navyMid }}>Open Area:</span> <span style={{ color: C.muted }}>{model.openArea}</span></div>
                <div><span style={{ fontWeight: 600, color: C.navyMid }}>Thickness:</span> <span style={{ color: C.muted }}>{model.thickness_mm} mm</span></div>
                {model.rod_mm > 0 && <div><span style={{ fontWeight: 600, color: C.navyMid }}>Rod Dia:</span> <span style={{ color: C.muted }}>Ø{model.rod_mm} mm</span></div>}
                {model.rollerDia_mm && <div><span style={{ fontWeight: 600, color: C.navyMid }}>Roller:</span> <span style={{ color: C.muted }}>Ø{model.rollerDia_mm} mm</span></div>}
              </div>
              <div style={{ fontSize: 11, color: C.muted, marginTop: 8, lineHeight: 1.5 }}>{model.description}</div>
            </div>
          </div>

          {/* Configurator */}
          <div style={{ background: C.bg, borderRadius: 10, padding: "16px 18px", marginBottom: 14 }}>
            {/* Material */}
            <div style={{ marginBottom: 16 }}>
              <FieldLabel>Material</FieldLabel>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {MATERIALS.map(m => (
                  <OptionChip key={m.key} label={m.abbr} selected={material === m.key} onClick={() => setMaterial(m.key)} />
                ))}
              </div>
              <div style={{ fontSize: 10, color: C.muted, marginTop: 6 }}>Selected: <strong>{materialLabel}</strong></div>
            </div>

            {/* Width */}
            <div style={{ marginBottom: 16 }}>
              <FieldLabel>Belt Width</FieldLabel>
              <div style={{ display: "flex", gap: 8 }}>
                <input type="text" value={width} onChange={e => setWidth(e.target.value)} placeholder="e.g. 300, 600" style={{ flex: 1, padding: "8px 12px", border: `1.5px solid ${C.border}`, borderRadius: 8, fontSize: 12, color: C.text }} />
                <div style={{ display: "flex", borderRadius: 8, border: `1.5px solid ${C.border}`, overflow: "hidden" }}>
                  {["mm", "in"].map(u => (
                    <button key={u} type="button" onClick={() => setWidthUnit(u)} style={{ padding: "8px 12px", border: "none", cursor: "pointer", fontSize: 12, fontWeight: 700, background: widthUnit === u ? C.navyMid : "#fff", color: widthUnit === u ? "#fff" : C.muted }}>{u}</button>
                  ))}
                </div>
              </div>
              <div style={{ fontSize: 10, color: C.muted, marginTop: 5 }}>Leave blank if unknown — Uniking will confirm.</div>
            </div>

            {/* Quantity */}
            <div style={{ marginBottom: 16 }}>
              <FieldLabel>Quantity</FieldLabel>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <button type="button" onClick={() => setQuantity(Math.max(1, quantity - 1))} style={{ width: 34, height: 34, border: `1.5px solid ${C.border}`, borderRadius: 8, background: "#fff", cursor: "pointer", fontSize: 16, fontWeight: 800, color: C.navyMid }}>−</button>
                <input type="number" min="1" value={quantity} onChange={e => setQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))} style={{ width: 70, padding: "8px 10px", border: `1.5px solid ${C.border}`, borderRadius: 8, fontSize: 13, fontWeight: 700, color: C.text, textAlign: "center" }} />
                <button type="button" onClick={() => setQuantity(quantity + 1)} style={{ width: 34, height: 34, border: `1.5px solid ${C.border}`, borderRadius: 8, background: "#fff", cursor: "pointer", fontSize: 16, fontWeight: 800, color: C.navyMid }}>+</button>
                <span style={{ fontSize: 11, color: C.muted, marginLeft: 4 }}>units</span>
              </div>
            </div>

            {/* Notes */}
            <div>
              <FieldLabel>Additional Notes (optional)</FieldLabel>
              <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Flights, sideguards, special requirements…" rows={2} style={{ width: "100%", padding: "8px 12px", border: `1.5px solid ${C.border}`, borderRadius: 8, fontSize: 12, color: C.text, resize: "vertical" }} />
            </div>
          </div>

          {/* Summary */}
          <div style={{ background: "#F4F2ED", borderRadius: 8, padding: "10px 14px", marginBottom: 14, fontSize: 11 }}>
            <span style={{ fontWeight: 700, color: C.navyMid }}>Your selection: </span>
            <span style={{ color: C.text }}>{[model.label, materialLabel, width && `${width} ${widthUnit}`, `Qty ${quantity}`].filter(Boolean).join(" · ")}</span>
          </div>

          {/* Actions */}
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={onClose} style={{ flex: 1, padding: "11px", background: "#ECEAE4", color: C.navyMid, border: "none", borderRadius: 9, cursor: "pointer", fontSize: 12, fontWeight: 700 }}>Cancel</button>
            <button onClick={handleAdd} disabled={added} style={{ flex: 2, padding: "11px", border: "none", borderRadius: 9, cursor: added ? "default" : "pointer", background: added ? C.green : C.navyMid, color: "#fff", fontSize: 12, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
              {added ? "✓ Added to RFQ" : "+ Add to RFQ Cart"}
            </button>
          </div>

          {/* External link */}
          {series.url && (
            <div style={{ marginTop: 12, textAlign: "center" }}>
              <a href={series.url} target="_blank" rel="noreferrer" style={{ fontSize: 11, color: EUROBELT_BLUE, fontWeight: 700, textDecoration: "none" }}>View on Eurobelt ↗</a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}