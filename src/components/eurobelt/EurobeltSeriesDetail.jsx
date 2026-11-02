/**
 * EurobeltSeriesDetail — Detail view for a Eurobelt belt series.
 * Shows models (styles), materials, sprockets, accessories, and RFQ integration.
 */
import { useState } from "react";

const C = {
  navy: "#0E1F3A", navyMid: "#0E1F3A", border: "#D9D6CE",
  muted: "#3A4A66", bg: "#F4F2ED", green: "#2E7D46", text: "#0E1F3A",
};
const EUROBELT_BLUE = "#0066B3";

function TabButton({ label, active, onClick }) {
  return (
    <button onClick={onClick} style={{
      padding: "8px 14px", background: active ? C.navyMid : "transparent",
      color: active ? "#fff" : C.muted, border: "none", borderRadius: "8px 8px 0 0",
      cursor: "pointer", fontSize: 12, fontWeight: active ? 700 : 500,
      borderBottom: active ? "none" : `2px solid ${C.border}`, whiteSpace: "nowrap",
    }}>{label}</button>
  );
}

function ModelCard({ model, series, onAddRFQ }) {
  const [hov, setHov] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  return (
    <>
      <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
        style={{
          background: "#fff", borderRadius: 10, border: `2px solid ${hov ? EUROBELT_BLUE : C.border}`,
          padding: "14px 16px", transition: "all 0.16s", display: "flex", flexDirection: "column", gap: 6,
        }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: C.navyMid }}>{model.label}</div>
        <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
          <span style={{ background: "#F4F2ED", color: C.navyMid, fontSize: 9, fontWeight: 700, padding: "2px 7px", borderRadius: 7 }}>{model.surface}</span>
          {model.openArea && model.openArea !== "0%" && <span style={{ background: "#f0fdf4", color: "#2E7D46", fontSize: 9, fontWeight: 600, padding: "2px 7px", borderRadius: 7 }}>{model.openArea} open</span>}
        </div>
        <p style={{ fontSize: 11, color: C.muted, lineHeight: 1.5, margin: 0 }}>{model.description}</p>
        <div style={{ display: "flex", gap: 10, fontSize: 10, color: C.muted, marginTop: 2 }}>
          {model.thickness_mm && <span>Thickness: <strong>{model.thickness_mm} mm</strong></span>}
          {model.rod_mm > 0 && <span>Rod: <strong>Ø{model.rod_mm} mm</strong></span>}
          {model.rollerDia_mm && <span>Roller: <strong>Ø{model.rollerDia_mm} mm</strong></span>}
        </div>
        <div style={{ display: "flex", gap: 6, marginTop: 4 }}>
          <button onClick={() => setShowDetails(true)} style={{ flex: 1, padding: "7px", background: "#ECEAE4", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 10, fontWeight: 700, color: C.navyMid }}>Specs & Materials</button>
          <button onClick={() => onAddRFQ({ ...model, series: series.name })} style={{ flex: 1, padding: "7px", background: C.navyMid, border: "none", borderRadius: 6, cursor: "pointer", fontSize: 10, fontWeight: 800, color: "#fff" }}>+ Add to RFQ</button>
        </div>
      </div>
      {showDetails && (
        <ModelDetailsModal model={model} series={series} onClose={() => setShowDetails(false)} onAddRFQ={onAddRFQ} />
      )}
    </>
  );
}

function ModelDetailsModal({ model, series, onClose, onAddRFQ }) {
  const [selectedMaterial, setSelectedMaterial] = useState("POM_W");
  const [quantity, setQuantity] = useState(1);
  const [width, setWidth] = useState("");
  const [notes, setNotes] = useState("");

  const materialEntries = Object.entries({
    POM_W: "POM White (Acetal)",
    POM_B: "POM Blue (Acetal)",
    POM_G: "POM Green (Acetal)",
    POM_BK: "POM Black (Acetal)",
    PP_W: "PP White (Polypropylene)",
    PBT: "PBT Beige",
    POM_AS: "POM Antistatic",
    POM_DT: "POM Detectable",
    POM_FR: "POM Flame Retardant",
  });

  function handleAdd() {
    onAddRFQ({
      ...model,
      series: series.name,
      _configured: true,
      material: materialEntries.find(([k]) => k === selectedMaterial)?.[1] || selectedMaterial,
      width: width || "To be confirmed",
      quantity,
      notes,
      _configSummary: `${model.label} · ${materialEntries.find(([k]) => k === selectedMaterial)?.[1] || selectedMaterial}${width ? ` · ${width} mm` : ""} · Qty ${quantity}`,
    });
    onClose();
  }

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.65)", zIndex: 1000, display: "flex", alignItems: "flex-start", justifyContent: "center", padding: 16, overflowY: "auto" }}>
      <div onClick={e => e.stopPropagation()} style={{ background: "#fff", borderRadius: 16, width: "100%", maxWidth: 600, boxShadow: "0 24px 80px rgba(0,0,0,0.3)", marginBottom: 16 }}>
        <div style={{ background: C.navyMid, borderRadius: "16px 16px 0 0", padding: "14px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <span style={{ color: "rgba(255,255,255,0.6)", fontSize: 11 }}>{series.name}</span>
            <div style={{ color: "#fff", fontSize: 16, fontWeight: 900 }}>{model.label}</div>
          </div>
          <button onClick={onClose} style={{ background: "rgba(255,255,255,0.15)", border: "none", borderRadius: "50%", width: 30, height: 30, cursor: "pointer", color: "#fff" }}>✕</button>
        </div>
        <div style={{ padding: "18px 22px" }}>
          <p style={{ fontSize: 13, color: C.text, lineHeight: 1.7, marginBottom: 14 }}>{model.description}</p>
          <div style={{ background: C.bg, borderRadius: 8, padding: "12px 14px", marginBottom: 14 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: 8 }}>Specifications</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, fontSize: 11 }}>
              <div><span style={{ fontWeight: 600, color: C.navyMid }}>Pitch:</span> <span style={{ color: C.muted }}>{series.pitch_mm} mm ({series.pitch_in}")</span></div>
              <div><span style={{ fontWeight: 600, color: C.navyMid }}>Surface:</span> <span style={{ color: C.muted }}>{model.surface}</span></div>
              <div><span style={{ fontWeight: 600, color: C.navyMid }}>Open Area:</span> <span style={{ color: C.muted }}>{model.openArea}</span></div>
              <div><span style={{ fontWeight: 600, color: C.navyMid }}>Thickness:</span> <span style={{ color: C.muted }}>{model.thickness_mm} mm</span></div>
              {model.rod_mm > 0 && <div><span style={{ fontWeight: 600, color: C.navyMid }}>Rod Dia:</span> <span style={{ color: C.muted }}>Ø{model.rod_mm} mm</span></div>}
              {model.rollerDia_mm && <div><span style={{ fontWeight: 600, color: C.navyMid }}>Roller Dia:</span> <span style={{ color: C.muted }}>Ø{model.rollerDia_mm} mm</span></div>}
            </div>
          </div>
          <div style={{ background: C.bg, borderRadius: 10, padding: "14px 16px", marginBottom: 14 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: 8 }}>Select Material</div>
            <select value={selectedMaterial} onChange={e => setSelectedMaterial(e.target.value)}
              style={{ width: "100%", padding: "8px 12px", border: `1.5px solid ${C.border}`, borderRadius: 8, fontSize: 12, color: C.text, background: "#fff", cursor: "pointer", marginBottom: 12 }}>
              {materialEntries.map(([key, label]) => <option key={key} value={key}>{label}</option>)}
            </select>
            <div style={{ fontSize: 10, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: 7 }}>Width (mm)</div>
            <input type="text" value={width} onChange={e => setWidth(e.target.value)} placeholder="e.g. 300, 600" style={{ width: "100%", padding: "8px 12px", border: `1.5px solid ${C.border}`, borderRadius: 8, fontSize: 12, color: C.text, marginBottom: 12 }} />
            <div style={{ fontSize: 10, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: 7 }}>Quantity</div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <button type="button" onClick={() => setQuantity(Math.max(1, quantity - 1))} style={{ width: 32, height: 32, border: `1.5px solid ${C.border}`, borderRadius: 8, background: "#fff", cursor: "pointer", fontSize: 16, fontWeight: 800, color: C.navyMid }}>−</button>
              <input type="number" min="1" value={quantity} onChange={e => setQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))} style={{ width: 64, padding: "8px 10px", border: `1.5px solid ${C.border}`, borderRadius: 8, fontSize: 13, fontWeight: 700, textAlign: "center" }} />
              <button type="button" onClick={() => setQuantity(quantity + 1)} style={{ width: 32, height: 32, border: `1.5px solid ${C.border}`, borderRadius: 8, background: "#fff", cursor: "pointer", fontSize: 16, fontWeight: 800, color: C.navyMid }}>+</button>
            </div>
            <div style={{ fontSize: 10, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: 7 }}>Notes (optional)</div>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Special requirements, flights, sideguards…" rows={2} style={{ width: "100%", padding: "8px 12px", border: `1.5px solid ${C.border}`, borderRadius: 8, fontSize: 12, color: C.text, resize: "vertical" }} />
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={onClose} style={{ flex: 1, padding: "10px", background: "#ECEAE4", color: C.navyMid, border: "none", borderRadius: 9, cursor: "pointer", fontSize: 12, fontWeight: 700 }}>Cancel</button>
            <button onClick={handleAdd} style={{ flex: 2, padding: "10px", background: C.navyMid, color: "#fff", border: "none", borderRadius: 9, cursor: "pointer", fontSize: 12, fontWeight: 800 }}>+ Add to RFQ Cart</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function EurobeltSeriesDetail({ series, onBack }) {
  const [activeTab, setActiveTab] = useState("models");
  const [rfqMsg, setRfqMsg] = useState(null);

  const tabs = [
    { key: "models", label: `Models (${series.styles?.length || 0})` },
    { key: "sprockets", label: `Sprockets (${series.sprockets?.length || 0})` },
    { key: "accessories", label: "Accessories" },
  ];

  function addToRFQ(item) {
    const cart = JSON.parse(localStorage.getItem("uniking_rfq_cart") || "[]");
    const isConfigured = item._configured;
    cart.push({
      cartId: `eurobelt_${item.label?.replace(/\s/g, "_")}_${Date.now()}`,
      id: `eurobelt_${Date.now()}`,
      _source: "eurobelt_component",
      series: `${series.name} — ${item.label || item.name}`,
      name: item.label || item.name,
      type: "Eurobelt Modular Belt",
      style: series.name,
      category: "Modular Belting — Eurobelt",
      image_url: series.image || "",
      materials: item.material || "",
      width: item.width,
      quantity: item.quantity || 1,
      unit: "Each",
      notes: item._configSummary || item.notes || "",
    });
    localStorage.setItem("uniking_rfq_cart", JSON.stringify(cart));
    window.dispatchEvent(new Event("rfq_cart_updated"));
    setRfqMsg(`${item.label || item.name} added to RFQ cart`);
    setTimeout(() => setRfqMsg(null), 3000);
  }

  return (
    <div>
      {/* Header */}
      <div style={{ background: `linear-gradient(135deg, ${C.navy}, ${C.navyMid})`, padding: "20px 24px" }}>
        <button onClick={onBack} style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", color: "#fff", borderRadius: 7, padding: "5px 12px", cursor: "pointer", fontSize: 12, marginBottom: 12 }}>← Back</button>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
          <div style={{ background: EUROBELT_BLUE, borderRadius: 5, padding: "3px 8px" }}>
            <span style={{ fontSize: 10, fontWeight: 800, color: "#fff" }}>EUROBELT</span>
          </div>
          <span style={{ color: "rgba(255,255,255,0.6)", fontSize: 12 }}>{series.beltType}</span>
        </div>
        <h1 style={{ color: "#fff", fontSize: 22, fontWeight: 900, margin: "0 0 4px" }}>{series.name}</h1>
        <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 13, margin: "0 0 12px", maxWidth: 600 }}>{series.description}</p>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <span style={{ background: "rgba(0,102,179,0.3)", color: "#fff", padding: "4px 10px", borderRadius: 16, fontSize: 11, fontWeight: 700 }}>Pitch: {series.pitch_mm} mm ({series.pitch_in}")</span>
          <span style={{ background: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.8)", padding: "4px 10px", borderRadius: 16, fontSize: 11 }}>{series.styles?.length} models</span>
        </div>
      </div>

      {rfqMsg && <div style={{ background: C.green, color: "#fff", padding: "10px 20px", fontSize: 13, fontWeight: 700, textAlign: "center" }}>✓ {rfqMsg}</div>}

      {/* Tabs */}
      <div style={{ background: "#fff", borderBottom: `1px solid ${C.border}`, padding: "0 20px", display: "flex", gap: 2, overflowX: "auto" }}>
        {tabs.map(t => <TabButton key={t.key} label={t.label} active={activeTab === t.key} onClick={() => setActiveTab(t.key)} />)}
      </div>

      <div style={{ padding: "20px", background: C.bg, minHeight: 400 }}>
        {/* Models */}
        {activeTab === "models" && (
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: C.navyMid, marginBottom: 4 }}>Models — {series.name}</div>
            <div style={{ fontSize: 12, color: C.muted, marginBottom: 12 }}>Click <strong>Specs & Materials</strong> to select material, width, and quantity before adding to RFQ.</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 12 }}>
              {(series.styles || []).map(model => (
                <ModelCard key={model.key} model={model} series={series} onAddRFQ={addToRFQ} />
              ))}
            </div>
          </div>
        )}

        {/* Sprockets */}
        {activeTab === "sprockets" && (
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: C.navyMid, marginBottom: 12 }}>Compatible Sprockets — {series.name}</div>
            {series.sprockets?.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {series.sprockets.map((sp, i) => (
                  <div key={i} style={{ background: "#fff", borderRadius: 10, border: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: 12, padding: "12px 16px" }}>
                    <div style={{ width: 48, height: 48, flexShrink: 0, background: "#F4F2ED", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>⚙️</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 800, color: C.navyMid }}>{sp.name}</div>
                      <div style={{ fontSize: 11, color: C.muted }}>Material: <strong>{sp.material}</strong> · Bore: <strong>{sp.bore}</strong></div>
                      {sp.notes && <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{sp.notes}</div>}
                    </div>
                    <button onClick={() => addToRFQ(sp)} style={{ padding: "7px 14px", background: C.navy, color: "#fff", border: "none", borderRadius: 7, cursor: "pointer", fontSize: 11, fontWeight: 800 }}>+ RFQ</button>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 8, padding: "14px", fontSize: 13, color: "#92400e" }}>
                Sprocket data: <strong>Contact Uniking for details.</strong>
              </div>
            )}
          </div>
        )}

        {/* Accessories */}
        {activeTab === "accessories" && (
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: C.navyMid, marginBottom: 12 }}>Accessories — {series.name}</div>
            {series.accessories?.length > 0 ? (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 10 }}>
                {series.accessories.map((acc, i) => (
                  <div key={i} style={{ background: "#fff", borderRadius: 10, border: `1px solid ${C.border}`, padding: "12px 16px" }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: C.navyMid }}>{acc.name}</div>
                    <div style={{ fontSize: 10, color: C.muted, marginTop: 2, lineHeight: 1.4 }}>{acc.notes}</div>
                    <button onClick={() => addToRFQ(acc)} style={{ marginTop: 8, padding: "6px 12px", background: C.navy, color: "#fff", border: "none", borderRadius: 7, cursor: "pointer", fontSize: 10, fontWeight: 800 }}>+ Add to RFQ</button>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 8, padding: "14px", fontSize: 13, color: "#92400e" }}>
                Accessories: <strong>Contact Uniking for details.</strong>
              </div>
            )}
          </div>
        )}

        {/* Resources */}
        <div style={{ marginTop: 20, background: "#fff", borderRadius: 10, border: `1px solid ${C.border}`, padding: "14px 18px" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: C.navyMid, marginBottom: 8 }}>Engineering Resources</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <a href={series.url} target="_blank" rel="noreferrer" style={{ background: EUROBELT_BLUE, color: "#fff", padding: "8px 16px", borderRadius: 8, fontWeight: 700, fontSize: 11, textDecoration: "none" }}>🔗 {series.name} on Eurobelt</a>
            <a href="https://www.eurobelt.com/wp-content/uploads/2025/Gama%20productos/GamaProductos_2025_ING.pdf" target="_blank" rel="noreferrer" style={{ background: C.navyMid, color: "#fff", padding: "8px 16px", borderRadius: 8, fontWeight: 700, fontSize: 11, textDecoration: "none" }}>📄 General Catalogue</a>
          </div>
        </div>
      </div>
    </div>
  );
}