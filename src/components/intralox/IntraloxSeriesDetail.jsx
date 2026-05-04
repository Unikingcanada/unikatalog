import { useState } from "react";

const C = {
  navy: "#0F2340", navyMid: "#1A3A5C", navyLight: "#2A5080",
  gold: "#C9A84C", border: "#e2e8f0", muted: "#64748b",
  bg: "#f8fafc", green: "#16a34a", text: "#0f172a"
};
const INTRALOX_RED = "#E31837";

function TabButton({ label, active, onClick }) {
  return (
    <button onClick={onClick} style={{
      padding: "8px 16px", background: active ? C.navyMid : "transparent",
      color: active ? "#fff" : C.muted, border: "none", borderRadius: "8px 8px 0 0",
      cursor: "pointer", fontSize: 12, fontWeight: active ? 700 : 500,
      borderBottom: active ? "none" : `2px solid ${C.border}`,
      whiteSpace: "nowrap"
    }}>{label}</button>
  );
}

function BeltStyleCard({ style, onViewSpecs, onConfigure }) {
  const [hov, setHov] = useState(false);
  return (
    <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        background: "#fff", borderRadius: 12, border: `2px solid ${hov ? C.navyMid : C.border}`,
        overflow: "hidden", transition: "all 0.16s", boxShadow: hov ? "0 6px 20px rgba(15,35,64,0.1)" : "0 1px 4px rgba(0,0,0,0.05)"
      }}>
      <div style={{ height: 120, overflow: "hidden", background: "#f0f4f8" }}>
        {style.image ? (
          <img src={style.image} alt={style.label}
            style={{ width: "100%", height: "100%", objectFit: "cover", transform: hov ? "scale(1.03)" : "scale(1)", transition: "transform 0.3s" }}
            onError={e => e.target.style.display = "none"} />
        ) : (
          <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: C.muted, fontSize: 28 }}>⛓️</div>
        )}
      </div>
      <div style={{ padding: "10px 12px" }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: C.navyMid, marginBottom: 2 }}>{style.label}</div>
        <div style={{ display: "flex", gap: 6, marginBottom: 6, flexWrap: "wrap" }}>
          <span style={{ background: "#eef3f8", color: C.navyMid, fontSize: 10, fontWeight: 600, padding: "1px 7px", borderRadius: 8 }}>
            Open Area: {style.openArea}
          </span>
          <span style={{ background: "#f1f5f9", color: C.muted, fontSize: 10, padding: "1px 7px", borderRadius: 8 }}>
            {style.surface}
          </span>
        </div>
        <p style={{ fontSize: 11, color: C.muted, lineHeight: 1.5, margin: "0 0 8px" }}>{style.description?.slice(0, 90)}…</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
          <button onClick={() => onViewSpecs(style)}
            style={{ padding: "6px", background: "#f1f5f9", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 11, fontWeight: 700, color: C.navyMid }}>
            View Specs
          </button>
          <button onClick={() => onConfigure(style)}
            style={{ padding: "6px", background: C.navyMid, border: "none", borderRadius: 6, cursor: "pointer", fontSize: 11, fontWeight: 800, color: "#fff" }}>
            Configure →
          </button>
        </div>
      </div>
    </div>
  );
}

function SprocketRow({ sprocket, onAddRFQ }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", background: "#fff", borderBottom: "1px solid #f1f5f9" }}>
      {sprocket.image ? (
        <img src={sprocket.image} alt={sprocket.name}
          style={{ width: 52, height: 40, objectFit: "cover", borderRadius: 6, background: "#f8fafc", flexShrink: 0 }}
          onError={e => e.target.style.display = "none"} />
      ) : (
        <div style={{ width: 52, height: 40, background: "#f1f5f9", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>⚙️</div>
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: C.navyMid }}>{sprocket.name}</div>
        <div style={{ fontSize: 11, color: C.muted, marginTop: 1 }}>
          Material: <strong>{sprocket.material}</strong>
          {sprocket.notes && <span style={{ marginLeft: 8 }}>— {sprocket.notes.slice(0, 60)}{sprocket.notes.length > 60 ? "…" : ""}</span>}
        </div>
      </div>
      {sprocket.url && (
        <a href={sprocket.url} target="_blank" rel="noreferrer"
          style={{ color: INTRALOX_RED, fontSize: 11, fontWeight: 600, textDecoration: "none", flexShrink: 0, marginRight: 8 }}>
          Intralox ↗
        </a>
      )}
      <button onClick={() => onAddRFQ(sprocket)}
        style={{ padding: "6px 12px", background: C.navy, color: "#fff", border: "none", borderRadius: 7, cursor: "pointer", fontSize: 11, fontWeight: 800, flexShrink: 0, whiteSpace: "nowrap" }}>
        + RFQ
      </button>
    </div>
  );
}

function AccessoryRow({ acc, onAddRFQ }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", background: "#fff", borderBottom: "1px solid #f1f5f9" }}>
      {acc.image ? (
        <img src={acc.image} alt={acc.name}
          style={{ width: 52, height: 40, objectFit: "cover", borderRadius: 6, background: "#f8fafc", flexShrink: 0 }}
          onError={e => e.target.style.display = "none"} />
      ) : (
        <div style={{ width: 52, height: 40, background: "#f1f5f9", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>🔩</div>
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: C.navyMid }}>{acc.name}</div>
        <div style={{ fontSize: 11, color: C.muted }}>{acc.notes}</div>
      </div>
      <button onClick={() => onAddRFQ(acc)}
        style={{ padding: "6px 12px", background: C.navy, color: "#fff", border: "none", borderRadius: 7, cursor: "pointer", fontSize: 11, fontWeight: 800, flexShrink: 0 }}>
        + RFQ
      </button>
    </div>
  );
}

function SpecsModal({ series, style, onConfigure, onClose }) {
  const hasBeltData = Array.isArray(style.beltData);
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.65)", zIndex: 1000, display: "flex", alignItems: "flex-start", justifyContent: "center", padding: 16, overflowY: "auto" }}>
      <div onClick={e => e.stopPropagation()} style={{ background: "#fff", borderRadius: 16, width: "100%", maxWidth: 700, boxShadow: "0 24px 80px rgba(0,0,0,0.3)", marginBottom: 16 }}>

        <div style={{ background: C.navyMid, borderRadius: "16px 16px 0 0", padding: "18px 24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <div style={{ background: INTRALOX_RED, borderRadius: 4, padding: "2px 7px" }}>
                <span style={{ fontSize: 9, fontWeight: 800, color: "#fff", letterSpacing: "0.5px" }}>INTRALOX</span>
              </div>
              <span style={{ color: "rgba(255,255,255,0.6)", fontSize: 11 }}>{series.name}</span>
            </div>
            <div style={{ color: "#fff", fontSize: 18, fontWeight: 900 }}>{style.label}</div>
          </div>
          <button onClick={onClose} style={{ background: "rgba(255,255,255,0.15)", border: "none", borderRadius: "50%", width: 34, height: 34, cursor: "pointer", color: "#fff", fontSize: 18 }}>✕</button>
        </div>

        <div style={{ padding: "20px 24px" }}>
          {style.image && (
            <img src={style.image} alt={style.label}
              style={{ width: "100%", height: 180, objectFit: "cover", borderRadius: 10, marginBottom: 16 }}
              onError={e => e.target.style.display = "none"} />
          )}

          <p style={{ fontSize: 14, color: C.text, lineHeight: 1.75, marginBottom: 16 }}>{style.description}</p>

          {/* Key specs */}
          <div style={{ background: C.bg, borderRadius: 10, padding: "14px 16px", marginBottom: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 10 }}>Belt Specifications</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, fontSize: 12 }}>
              {[
                ["Series", series.name],
                ["Belt Type", series.beltType],
                ["Belt Pitch", series.pitch_in && series.pitch_in !== "To be confirmed by Uniking" ? `${series.pitch_in}" (${series.pitch_mm} mm)` : "To be confirmed by Uniking"],
                ["Surface Type", style.surface],
                ["Open Area", style.openArea],
                ["2026 Catalog Page", series.catalogPage ? `p. ${series.catalogPage}` : null],
                ["Min Width", series.min_width_in ? `${series.min_width_in}" (${series.min_width_mm} mm)` : "To be confirmed by Uniking"],
                ["Width Increments", series.width_increment_in ? `${series.width_increment_in}" (${series.width_increment_mm} mm)` : "To be confirmed by Uniking"],
                ["Rod Diameter", series.rod_dia_in ? `${series.rod_dia_in}" (${series.rod_dia_mm} mm)` : "To be confirmed by Uniking"],
                ["Rod Retention", series.rod_retention || "To be confirmed by Uniking"],
                ["Hinge Style", series.hinge || "To be confirmed by Uniking"],
                ["Nosebar (if applicable)", series.nosebar_in ? `${series.nosebar_in}" (${series.nosebar_mm} mm)` : "—"],
              ].filter(([, v]) => v != null && v !== "").map(([k, v]) => (
                <div key={k}>
                  <div style={{ fontWeight: 600, color: C.navyMid }}>{k}</div>
                  <div style={{ color: C.muted, marginTop: 1 }}>{v}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Belt data table */}
          {hasBeltData ? (
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 8 }}>Belt Data by Material</div>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
                  <thead>
                    <tr style={{ background: C.navyMid }}>
                      {["Belt Material", "Rod Material", "Strength (lbf/ft)", "Strength (N/m)", "Temp °F", "Temp °C", "Mass (lb/ft²)", "Mass (kg/m²)"].map(h => (
                        <th key={h} style={{ padding: "7px 10px", color: "#fff", fontWeight: 700, textAlign: "left", whiteSpace: "nowrap" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {style.beltData.map((row, i) => (
                      <tr key={i} style={{ background: i % 2 === 0 ? "#f8fafc" : "#fff" }}>
                        <td style={{ padding: "6px 10px", fontWeight: 600, color: C.navyMid }}>{row.material}</td>
                        <td style={{ padding: "6px 10px", color: C.muted }}>{row.rodMaterial}</td>
                        <td style={{ padding: "6px 10px" }}>{row.strengthLbfFt?.toLocaleString()}</td>
                        <td style={{ padding: "6px 10px" }}>{row.strengthNm?.toLocaleString()}</td>
                        <td style={{ padding: "6px 10px" }}>{row.tempF}</td>
                        <td style={{ padding: "6px 10px" }}>{row.tempC}</td>
                        <td style={{ padding: "6px 10px" }}>{row.massLbFt2}</td>
                        <td style={{ padding: "6px 10px" }}>{row.massKgM2}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {style.beltData.some(r => r.note) && (
                <div style={{ marginTop: 6, fontSize: 10, color: C.muted }}>
                  {style.beltData.filter(r => r.note).map((r, i) => <div key={i}>* {r.note}</div>)}
                </div>
              )}
            </div>
          ) : (
            <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 8, padding: "10px 14px", fontSize: 12, color: "#92400e", marginBottom: 16 }}>
              Belt data: <strong>To be confirmed by Uniking.</strong> Contact us for full specifications.
            </div>
          )}

          {/* Applications */}
          {style.applications?.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 8 }}>Applications</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {style.applications.map(a => (
                  <span key={a} style={{ background: "#eef3f8", color: C.navyMid, fontSize: 11, fontWeight: 600, padding: "3px 9px", borderRadius: 10 }}>{a}</span>
                ))}
              </div>
            </div>
          )}

          {/* Product notes */}
          {style.notes?.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 8 }}>Product Notes</div>
              {style.notes.map((n, i) => (
                <div key={i} style={{ fontSize: 12, color: C.text, marginBottom: 4, display: "flex", gap: 6 }}>
                  <span style={{ color: INTRALOX_RED, flexShrink: 0 }}>•</span>{n}
                </div>
              ))}
            </div>
          )}

          <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 8, padding: "10px 14px", fontSize: 12, color: "#92400e", marginBottom: 16 }}>
            <strong>Disclaimer:</strong> Final belt selection and specifications must be confirmed by Uniking before production. Contact Intralox for precise belt measurements and stock status.
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={onClose} style={{ flex: 1, padding: "11px", background: "#f1f5f9", color: C.navyMid, border: "none", borderRadius: 10, cursor: "pointer", fontSize: 13, fontWeight: 700 }}>Close</button>
            <button onClick={() => { onClose(); onConfigure(style); }}
              style={{ flex: 2, padding: "11px", background: C.navyMid, color: "#fff", border: "none", borderRadius: 10, cursor: "pointer", fontSize: 13, fontWeight: 800 }}>
              Configure This Belt →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function IntraloxSeriesDetail({ series, onConfigure, onBack, onGoRFQ }) {
  const [activeTab, setActiveTab] = useState("styles");
  const [viewingStyle, setViewingStyle] = useState(null);
  const [rfqMsg, setRfqMsg] = useState(null);

  const tabs = [
    { key: "styles", label: "Belt Styles" },
    { key: "sprockets", label: "Compatible Sprockets" },
    { key: "flights", label: "Flights & Sideguards" },
    { key: "accessories", label: "Accessories" },
    { key: "techcharts", label: "Technical Charts" },
  ];

  function addToRFQ(item) {
    const cart = JSON.parse(localStorage.getItem("uniking_rfq_cart") || "[]");
    cart.push({
      cartId: `intralox_${item.name?.replace(/\s/g, "_")}_${Date.now()}`,
      id: `intralox_${Date.now()}`,
      _source: "intralox_component",
      series: `${series.name} — ${item.name}`,
      name: item.name,
      type: item.type || "Intralox Component",
      style: series.name,
      category: "Modular Belting — Intralox",
      image_url: item.image || "",
      materials: item.material || "",
      quantity: 1,
      unit: "Each",
      notes: item.notes || "",
    });
    localStorage.setItem("uniking_rfq_cart", JSON.stringify(cart));
    window.dispatchEvent(new Event("rfq_cart_updated"));
    setRfqMsg(`${item.name} added to RFQ cart`);
    setTimeout(() => setRfqMsg(null), 3000);
  }

  const flights = series.accessories?.filter(a => a.type === "flight") || [];
  const sideguards = series.accessories?.filter(a => a.type === "sideguard") || [];
  const otherAcc = series.accessories?.filter(a => a.type !== "flight" && a.type !== "sideguard") || [];

  return (
    <div>
      {/* Header */}
      <div style={{ background: `linear-gradient(135deg, ${C.navy}, ${C.navyMid})`, padding: "20px 24px" }}>
        <button onClick={onBack} style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", color: "#fff", borderRadius: 7, padding: "5px 12px", cursor: "pointer", fontSize: 12, marginBottom: 12 }}>← Back</button>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
          <div style={{ background: INTRALOX_RED, borderRadius: 5, padding: "3px 8px" }}>
            <span style={{ fontSize: 10, fontWeight: 800, color: "#fff", letterSpacing: "0.5px" }}>INTRALOX</span>
          </div>
          <span style={{ color: "rgba(255,255,255,0.6)", fontSize: 12 }}>Modular Plastic Belting</span>
        </div>
        <h1 style={{ color: "#fff", fontSize: 22, fontWeight: 900, margin: "0 0 4px" }}>{series.name}</h1>
        <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 13, margin: "0 0 12px", maxWidth: 600 }}>{series.description}</p>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
          {series.pitch_in && series.pitch_in !== "To be confirmed by Uniking" && (
            <span style={{ background: "rgba(201,168,76,0.25)", color: C.gold, padding: "4px 10px", borderRadius: 16, fontSize: 11, fontWeight: 700 }}>Pitch: {series.pitch_in}" ({series.pitch_mm} mm)</span>
          )}
          {series.min_width_in && <span style={{ background: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.8)", padding: "4px 10px", borderRadius: 16, fontSize: 11 }}>Min width: {series.min_width_in}"</span>}
          {series.width_increment_in && <span style={{ background: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.8)", padding: "4px 10px", borderRadius: 16, fontSize: 11 }}>Width incr: {series.width_increment_in}"</span>}
          <span style={{ background: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.8)", padding: "4px 10px", borderRadius: 16, fontSize: 11 }}>{series.styles?.length || 0} Belt Style{series.styles?.length !== 1 ? "s" : ""}</span>
          <span style={{ background: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.85)", padding: "4px 10px", borderRadius: 16, fontSize: 11 }}>{series.beltType}</span>
          <button onClick={() => onConfigure(series.styles?.[0])}
            style={{ background: C.gold, color: C.navy, border: "none", borderRadius: 8, padding: "7px 18px", cursor: "pointer", fontSize: 13, fontWeight: 800, marginLeft: "auto" }}>
            Configure Belt →
          </button>
        </div>
      </div>

      {/* RFQ toast */}
      {rfqMsg && (
        <div style={{ background: "#16a34a", color: "#fff", padding: "10px 20px", fontSize: 13, fontWeight: 700, textAlign: "center" }}>
          ✓ {rfqMsg}
        </div>
      )}

      {/* Tabs */}
      <div style={{ background: "#fff", borderBottom: `1px solid ${C.border}`, padding: "0 20px", display: "flex", gap: 2, overflowX: "auto" }}>
        {tabs.map(t => <TabButton key={t.key} label={t.label} active={activeTab === t.key} onClick={() => setActiveTab(t.key)} />)}
      </div>

      {/* Tab content */}
      <div style={{ padding: "20px", background: C.bg, minHeight: 400 }}>

        {/* Belt Styles */}
        {activeTab === "styles" && (
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: C.navyMid, marginBottom: 4 }}>Belt Styles — {series.name}</div>
            <div style={{ fontSize: 12, color: C.muted, marginBottom: 16 }}>
              {series.styles?.length || 0} styles shown. Visit <a href={`https://www.intralox.com/belt-finder/modular-plastic-belting/${series.id.toLowerCase()}`} target="_blank" rel="noreferrer" style={{ color: INTRALOX_RED }}>Intralox Belt Finder ↗</a> for the complete listing.
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))", gap: 14 }}>
              {(series.styles || []).map(style => (
                <BeltStyleCard key={style.key} style={style}
                  onViewSpecs={setViewingStyle}
                  onConfigure={s => onConfigure(s, series)} />
              ))}
            </div>
          </div>
        )}

        {/* Sprockets */}
        {activeTab === "sprockets" && (
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: C.navyMid, marginBottom: 4 }}>Compatible Sprockets — {series.name}</div>
            <div style={{ fontSize: 12, color: C.muted, marginBottom: 12 }}>
              Only sprockets confirmed compatible with {series.name}. Click "+ RFQ" to add directly to your quote.
            </div>
            <div style={{ background: "#fff", borderRadius: 10, border: `1px solid ${C.border}`, overflow: "hidden" }}>
              <div style={{ display: "grid", gridTemplateColumns: "60px 1fr 100px 100px 70px", background: C.navyMid, padding: "8px 14px", gap: 12 }}>
                {["", "Sprocket Name & Notes", "Material", "Intralox", "Action"].map(h => (
                  <div key={h} style={{ fontSize: 10, fontWeight: 700, color: "#fff", textTransform: "uppercase" }}>{h}</div>
                ))}
              </div>
              {series.sprockets.map((sp, i) => <SprocketRow key={i} sprocket={sp} onAddRFQ={addToRFQ} />)}
            </div>
            <div style={{ marginTop: 10, fontSize: 11, color: C.muted }}>
              Sprocket pitch, tooth count, and bore data: <a href={series.techChartUrl} target="_blank" rel="noreferrer" style={{ color: INTRALOX_RED }}>Engineering Manual p.{series.engineeringManualPage} ↗</a>. Contact Uniking for detailed sprocket selection.
            </div>
          </div>
        )}

        {/* Flights & Sideguards */}
        {activeTab === "flights" && (
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: C.navyMid, marginBottom: 12 }}>Flights & Sideguards — {series.name}</div>
            {(flights.length > 0 || sideguards.length > 0) ? (
              <div>
                {flights.length > 0 && (
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: 8 }}>Flights</div>
                    <div style={{ background: "#fff", borderRadius: 10, border: `1px solid ${C.border}`, overflow: "hidden" }}>
                      {flights.map((f, i) => <AccessoryRow key={i} acc={f} onAddRFQ={addToRFQ} />)}
                    </div>
                  </div>
                )}
                {sideguards.length > 0 && (
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: 8 }}>Sideguards</div>
                    <div style={{ background: "#fff", borderRadius: 10, border: `1px solid ${C.border}`, overflow: "hidden" }}>
                      {sideguards.map((s, i) => <AccessoryRow key={i} acc={s} onAddRFQ={addToRFQ} />)}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 8, padding: "14px", fontSize: 13, color: "#92400e" }}>
                Flights and sideguards availability: <strong>To be confirmed by Uniking.</strong> Contact us for {series.name} accessory options.
              </div>
            )}
          </div>
        )}

        {/* Accessories */}
        {activeTab === "accessories" && (
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: C.navyMid, marginBottom: 12 }}>Accessories & Components — {series.name}</div>
            {otherAcc.length > 0 ? (
              <div style={{ background: "#fff", borderRadius: 10, border: `1px solid ${C.border}`, overflow: "hidden" }}>
                {otherAcc.map((a, i) => <AccessoryRow key={i} acc={a} onAddRFQ={addToRFQ} />)}
              </div>
            ) : (
              <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 8, padding: "14px", fontSize: 13, color: "#92400e" }}>
                Additional accessories: <strong>To be confirmed by Uniking.</strong> Contact us for {series.name} compatible accessories.
              </div>
            )}
          </div>
        )}

        {/* Technical Charts */}
        {activeTab === "techcharts" && (
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: C.navyMid, marginBottom: 12 }}>Technical Charts — {series.name}</div>
            <div style={{ background: "#fff", borderRadius: 10, border: `1px solid ${C.border}`, padding: "20px 24px", marginBottom: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: C.navyMid, marginBottom: 8 }}>Engineering Manual Reference</div>
              <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.7, marginBottom: 12 }}>
                Full belt data tables, sprocket selection charts, width increment tables, and installation guides are available in the official Intralox Engineering Manual.
              </p>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <a href={series.techChartUrl} target="_blank" rel="noreferrer"
                  style={{ background: INTRALOX_RED, color: "#fff", padding: "10px 20px", borderRadius: 8, fontWeight: 700, fontSize: 13, textDecoration: "none" }}>
                  📄 Download Engineering Manual
                </a>
                <a href={`https://www.intralox.com/belt-finder/modular-plastic-belting/${series.id.toLowerCase()}`} target="_blank" rel="noreferrer"
                  style={{ background: C.navyMid, color: "#fff", padding: "10px 20px", borderRadius: 8, fontWeight: 700, fontSize: 13, textDecoration: "none" }}>
                  🔗 Intralox Belt Finder
                </a>
              </div>
            </div>

            {/* Inline belt data for series with known data */}
            {(series.styles || []).filter(s => Array.isArray(s.beltData)).map(style => (
              <div key={style.key} style={{ background: "#fff", borderRadius: 10, border: `1px solid ${C.border}`, padding: "16px 20px", marginBottom: 12 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: C.navyMid, marginBottom: 10 }}>{series.name} — {style.label} Belt Data</div>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
                    <thead>
                      <tr style={{ background: C.navyMid }}>
                        {["Belt Material", "Rod Material", "Strength lbf/ft", "Strength N/m", "Temp °F", "Temp °C", "Mass lb/ft²", "Mass kg/m²"].map(h => (
                          <th key={h} style={{ padding: "7px 10px", color: "#fff", fontWeight: 700, textAlign: "left", whiteSpace: "nowrap" }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {style.beltData.map((row, i) => (
                        <tr key={i} style={{ background: i % 2 === 0 ? "#f8fafc" : "#fff" }}>
                          <td style={{ padding: "6px 10px", fontWeight: 600, color: C.navyMid }}>{row.material}</td>
                          <td style={{ padding: "6px 10px", color: C.muted }}>{row.rodMaterial}</td>
                          <td style={{ padding: "6px 10px" }}>{row.strengthLbfFt?.toLocaleString()}</td>
                          <td style={{ padding: "6px 10px" }}>{row.strengthNm?.toLocaleString()}</td>
                          <td style={{ padding: "6px 10px" }}>{row.tempF}</td>
                          <td style={{ padding: "6px 10px" }}>{row.tempC}</td>
                          <td style={{ padding: "6px 10px" }}>{row.massLbFt2}</td>
                          <td style={{ padding: "6px 10px" }}>{row.massKgM2}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {style.beltData.some(r => r.note) && (
                  <div style={{ marginTop: 6, fontSize: 10, color: C.muted }}>
                    {style.beltData.filter(r => r.note).map((r, i) => <div key={i}>* {r.note}</div>)}
                  </div>
                )}
              </div>
            ))}
            <div style={{ fontSize: 11, color: C.muted, marginTop: 8 }}>
              Source: Intralox 2024 MPB Engineering Manual — Section {series.engineeringManualPage}. All specifications subject to confirmation.
            </div>
          </div>
        )}
      </div>

      {/* Specs modal */}
      {viewingStyle && (
        <SpecsModal
          series={series}
          style={viewingStyle}
          onConfigure={s => onConfigure(s, series)}
          onClose={() => setViewingStyle(null)}
        />
      )}
    </div>
  );
}