/**
 * MovexSprocketModal — Click a sprocket to view specs and configure
 * options (teeth, bore shape, bore size, material, quantity) before
 * adding to the RFQ cart.
 */
import { useState, useMemo } from "react";

const C = {
  navy: "#0C2340", navyMid: "#1A3A5C", gold: "#C9A84C",
  border: "#e2e8f0", muted: "#64748b", bg: "#f8fafc", green: "#16a34a", text: "#0f172a",
};
const MOVEX_RED = "#E63946";

/** Parse a teeth string like "12-21T options" → ["12","13",...,"21"] */
function parseTeethOptions(teethStr) {
  if (!teethStr || typeof teethStr !== "string") return [];
  const m = teethStr.match(/(\d+)\s*[-–]\s*(\d+)\s*T/i);
  if (m) {
    const lo = parseInt(m[1], 10), hi = parseInt(m[2], 10);
    const out = [];
    for (let t = lo; t <= hi; t++) out.push(String(t));
    return out;
  }
  const single = teethStr.match(/(\d+)\s*T/i);
  if (single) return [single[1]];
  return [];
}

/** Parse bore string like "Square / Round" → ["Square", "Round"] */
function parseBoreShapes(boreStr) {
  if (!boreStr || typeof boreStr !== "string") return [];
  return boreStr.split(/\s*\/\s*/).map(s => s.trim()).filter(Boolean);
}

function OptionChip({ label, selected, onClick, disabled }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      style={{
        padding: "7px 13px", borderRadius: 8, cursor: disabled ? "default" : "pointer",
        border: `1.5px solid ${selected ? C.navyMid : C.border}`,
        background: selected ? C.navyMid : "#fff",
        color: selected ? "#fff" : C.text,
        fontSize: 12, fontWeight: 700, whiteSpace: "nowrap",
        transition: "all 0.12s", opacity: disabled ? 0.5 : 1,
      }}
    >
      {label}
    </button>
  );
}

function FieldLabel({ children }) {
  return <div style={{ fontSize: 10, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: 7 }}>{children}</div>;
}

export default function MovexSprocketModal({ sprocket, series, onClose, onAddToRFQ }) {
  const teethOptions = useMemo(() => parseTeethOptions(sprocket.teeth), [sprocket]);
  const boreShapes = useMemo(() => parseBoreShapes(sprocket.bore), [sprocket]);

  const [selectedTeeth, setSelectedTeeth] = useState(teethOptions.length ? "" : "");
  const [selectedBoreShape, setSelectedBoreShape] = useState(boreShapes[0] || "");
  const [boreSize, setBoreSize] = useState("");
  const [boreUnit, setBoreUnit] = useState("in");
  const [material, setMaterial] = useState(sprocket.material || "");
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState("");
  const [added, setAdded] = useState(false);

  const canAdd = (teethOptions.length === 0 || selectedTeeth !== "") &&
    (boreShapes.length === 0 || selectedBoreShape !== "");

  function handleAdd() {
    if (!canAdd) return;
    const descParts = [];
    if (selectedTeeth) descParts.push(`${selectedTeeth}T`);
    if (selectedBoreShape) descParts.push(selectedBoreShape);
    if (boreSize) descParts.push(`${boreSize}${boreUnit}`);
    if (material) descParts.push(material);
    const desc = descParts.join(" · ");

    const rfqItem = {
      ...sprocket,
      name: sprocket.name,
      series: `${series.name} — ${sprocket.name}`,
      type: "Movex Sprocket",
      category: "Modular Belting — Movex — Sprocket",
      teeth: selectedTeeth || sprocket.teeth,
      boreShape: selectedBoreShape || sprocket.bore,
      boreSize: boreSize ? `${boreSize} ${boreUnit}` : "To be confirmed",
      material: material || sprocket.material,
      quantity,
      unit: "Each",
      notes: [sprocket.notes, notes].filter(Boolean).join(" · "),
      _configured: true,
      _configSummary: desc,
    };
    onAddToRFQ(rfqItem);
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
              <div style={{ background: MOVEX_RED, borderRadius: 4, padding: "2px 7px" }}>
                <span style={{ fontSize: 9, fontWeight: 800, color: "#fff" }}>MOVEX</span>
              </div>
              <span style={{ color: "rgba(255,255,255,0.6)", fontSize: 11 }}>{series.name} · Sprocket</span>
            </div>
            <div style={{ color: "#fff", fontSize: 17, fontWeight: 900 }}>{sprocket.name}</div>
          </div>
          <button onClick={onClose} style={{ background: "rgba(255,255,255,0.15)", border: "none", borderRadius: "50%", width: 32, height: 32, cursor: "pointer", color: "#fff", fontSize: 17 }}>✕</button>
        </div>

        <div style={{ padding: "18px 22px" }}>
          {/* Image + quick specs */}
          <div style={{ display: "flex", gap: 14, marginBottom: 16 }}>
            <div style={{ width: 120, height: 100, flexShrink: 0, background: "#f0f4f8", borderRadius: 8, overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
              {sprocket.image ? (
                <img src={sprocket.image} alt={sprocket.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={e => { e.target.style.display = "none"; e.target.parentElement.innerHTML = "⚙️"; e.target.parentElement.style.fontSize = "32px"; }} />
              ) : (
                <span style={{ fontSize: 32 }}>⚙️</span>
              )}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: 8 }}>Catalog Specs</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, fontSize: 11 }}>
                <div><span style={{ fontWeight: 600, color: C.navyMid }}>Teeth:</span> <span style={{ color: C.muted }}>{sprocket.teeth || "—"}</span></div>
                <div><span style={{ fontWeight: 600, color: C.navyMid }}>Bore:</span> <span style={{ color: C.muted }}>{sprocket.bore || "—"}</span></div>
                <div><span style={{ fontWeight: 600, color: C.navyMid }}>Material:</span> <span style={{ color: C.muted }}>{sprocket.material || "—"}</span></div>
                <div><span style={{ fontWeight: 600, color: C.navyMid }}>Series:</span> <span style={{ color: C.muted }}>{series.name}</span></div>
              </div>
              {sprocket.notes && <div style={{ fontSize: 11, color: C.muted, marginTop: 8, lineHeight: 1.5 }}>{sprocket.notes}</div>}
            </div>
          </div>

          {/* Configurator */}
          <div style={{ background: C.bg, borderRadius: 10, padding: "16px 18px", marginBottom: 14 }}>

            {/* Teeth selection */}
            {teethOptions.length > 0 ? (
              <div style={{ marginBottom: 16 }}>
                <FieldLabel>Number of Teeth</FieldLabel>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {teethOptions.map(t => (
                    <OptionChip key={t} label={`${t}T`} selected={selectedTeeth === t} onClick={() => setSelectedTeeth(t)} />
                  ))}
                </div>
              </div>
            ) : (
              <div style={{ marginBottom: 16 }}>
                <FieldLabel>Number of Teeth</FieldLabel>
                <input
                  type="text"
                  value={selectedTeeth}
                  onChange={e => setSelectedTeeth(e.target.value)}
                  placeholder={sprocket.teeth && sprocket.teeth !== "Catalog-confirmed" && sprocket.teeth !== "Missing Data" ? sprocket.teeth : "Specify tooth count"}
                  style={{ width: "100%", padding: "8px 12px", border: `1.5px solid ${C.border}`, borderRadius: 8, fontSize: 12, color: C.text }}
                />
              </div>
            )}

            {/* Bore shape */}
            {boreShapes.length > 0 ? (
              <div style={{ marginBottom: 16 }}>
                <FieldLabel>Bore Shape</FieldLabel>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {boreShapes.map(shape => (
                    <OptionChip key={shape} label={shape} selected={selectedBoreShape === shape} onClick={() => setSelectedBoreShape(shape)} />
                  ))}
                </div>
              </div>
            ) : (
              <div style={{ marginBottom: 16 }}>
                <FieldLabel>Bore Shape</FieldLabel>
                <input
                  type="text"
                  value={selectedBoreShape}
                  onChange={e => setSelectedBoreShape(e.target.value)}
                  placeholder="Specify bore shape"
                  style={{ width: "100%", padding: "8px 12px", border: `1.5px solid ${C.border}`, borderRadius: 8, fontSize: 12, color: C.text }}
                />
              </div>
            )}

            {/* Bore size */}
            <div style={{ marginBottom: 16 }}>
              <FieldLabel>Bore Size (diameter)</FieldLabel>
              <div style={{ display: "flex", gap: 8 }}>
                <input
                  type="text"
                  value={boreSize}
                  onChange={e => setBoreSize(e.target.value)}
                  placeholder='e.g. 3/4, 19, 25'
                  style={{ flex: 1, padding: "8px 12px", border: `1.5px solid ${C.border}`, borderRadius: 8, fontSize: 12, color: C.text }}
                />
                <div style={{ display: "flex", borderRadius: 8, border: `1.5px solid ${C.border}`, overflow: "hidden" }}>
                  {["in", "mm"].map(u => (
                    <button key={u} type="button" onClick={() => setBoreUnit(u)}
                      style={{
                        padding: "8px 12px", border: "none", cursor: "pointer", fontSize: 12, fontWeight: 700,
                        background: boreUnit === u ? C.navyMid : "#fff", color: boreUnit === u ? "#fff" : C.muted,
                      }}>{u}</button>
                  ))}
                </div>
              </div>
              <div style={{ fontSize: 10, color: C.muted, marginTop: 5 }}>Leave blank if unknown — Uniking will confirm.</div>
            </div>

            {/* Material */}
            <div style={{ marginBottom: 16 }}>
              <FieldLabel>Material</FieldLabel>
              <select
                value={material}
                onChange={e => setMaterial(e.target.value)}
                style={{ width: "100%", padding: "8px 12px", border: `1.5px solid ${C.border}`, borderRadius: 8, fontSize: 12, color: C.text, background: "#fff", cursor: "pointer" }}
              >
                {sprocket.material && <option value={sprocket.material}>{sprocket.material}</option>}
                <option value="Polyamide (PA)">Polyamide (PA)</option>
                <option value="UHMW-PE">UHMW-PE</option>
                <option value="PP (Polypropylene)">PP (Polypropylene)</option>
                <option value="Other / Specify in notes">Other / Specify in notes</option>
              </select>
            </div>

            {/* Quantity */}
            <div style={{ marginBottom: 16 }}>
              <FieldLabel>Quantity</FieldLabel>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <button type="button" onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  style={{ width: 34, height: 34, border: `1.5px solid ${C.border}`, borderRadius: 8, background: "#fff", cursor: "pointer", fontSize: 16, fontWeight: 800, color: C.navyMid }}>−</button>
                <input
                  type="number" min="1" value={quantity}
                  onChange={e => setQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))}
                  style={{ width: 70, padding: "8px 10px", border: `1.5px solid ${C.border}`, borderRadius: 8, fontSize: 13, fontWeight: 700, color: C.text, textAlign: "center" }}
                />
                <button type="button" onClick={() => setQuantity(quantity + 1)}
                  style={{ width: 34, height: 34, border: `1.5px solid ${C.border}`, borderRadius: 8, background: "#fff", cursor: "pointer", fontSize: 16, fontWeight: 800, color: C.navyMid }}>+</button>
                <span style={{ fontSize: 11, color: C.muted, marginLeft: 4 }}>units</span>
              </div>
            </div>

            {/* Notes */}
            <div>
              <FieldLabel>Additional Notes (optional)</FieldLabel>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Keyway, setscrew, special bore, shaft details…"
                rows={2}
                style={{ width: "100%", padding: "8px 12px", border: `1.5px solid ${C.border}`, borderRadius: 8, fontSize: 12, color: C.text, resize: "vertical" }}
              />
            </div>
          </div>

          {/* Summary */}
          {canAdd && (
            <div style={{ background: "#eef3f8", borderRadius: 8, padding: "10px 14px", marginBottom: 14, fontSize: 11 }}>
              <span style={{ fontWeight: 700, color: C.navyMid }}>Your selection: </span>
              <span style={{ color: C.text }}>
                {[
                  selectedTeeth && `${selectedTeeth}T`,
                  selectedBoreShape,
                  boreSize && `${boreSize} ${boreUnit}`,
                  material,
                  `Qty ${quantity}`,
                ].filter(Boolean).join(" · ") || "Using catalog defaults"}
              </span>
            </div>
          )}

          {/* Actions */}
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={onClose} style={{ flex: 1, padding: "11px", background: "#f1f5f9", color: C.navyMid, border: "none", borderRadius: 9, cursor: "pointer", fontSize: 12, fontWeight: 700 }}>Cancel</button>
            <button
              onClick={handleAdd}
              disabled={!canAdd || added}
              style={{
                flex: 2, padding: "11px", border: "none", borderRadius: 9, cursor: canAdd && !added ? "pointer" : "default",
                background: added ? C.green : canAdd ? C.navyMid : "#cbd5e1",
                color: "#fff", fontSize: 12, fontWeight: 800,
                display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
              }}>
              {added ? "✓ Added to RFQ" : canAdd ? "+ Add to RFQ Cart" : "Select required options"}
            </button>
          </div>

          {/* External link */}
          {sprocket.url && (
            <div style={{ marginTop: 12, textAlign: "center" }}>
              <a href={sprocket.url} target="_blank" rel="noreferrer" style={{ fontSize: 11, color: MOVEX_RED, fontWeight: 700, textDecoration: "none" }}>View on Movex ↗</a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}