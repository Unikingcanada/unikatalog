import { useState } from "react";

const C = {
  navy: "#0C2340", navyMid: "#1A3A5C", gold: "#C9A84C",
  border: "#e2e8f0", muted: "#64748b", bg: "#f8fafc", green: "#16a34a", text: "#0f172a",
};
const SP_BLUE = "#0057A8";
const SP_SMART_GUIDE_URL = "https://www.systemplastsmartguide.com/INT/Smart-Guide/";

function TabButton({ label, active, onClick }) {
  return (
    <button onClick={onClick} style={{
      padding: "8px 14px", background: active ? SP_BLUE : "transparent",
      color: active ? "#fff" : C.muted, border: "none", borderRadius: "8px 8px 0 0",
      cursor: "pointer", fontSize: 12, fontWeight: active ? 700 : 500,
      borderBottom: active ? "none" : `2px solid ${C.border}`, whiteSpace: "nowrap",
    }}>{label}</button>
  );
}

function StyleCard({ style, onViewSpecs, onConfigure }) {
  const [hov, setHov] = useState(false);
  const hasBeltData = Array.isArray(style.beltData);
  const isMissing = style.beltData === "Missing Data – Needs Mapping";
  return (
    <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        background: "#fff", borderRadius: 12, border: `2px solid ${hov ? C.navyMid : C.border}`,
        overflow: "hidden", transition: "all 0.16s", display: "flex", flexDirection: "column",
        boxShadow: hov ? "0 6px 20px rgba(12,35,64,0.1)" : "0 1px 4px rgba(0,0,0,0.05)",
      }}>
      <div style={{ height: 120, overflow: "hidden", background: "#eef3f8", position: "relative", flexShrink: 0 }}>
        {style.image ? (
          <img src={style.image} alt={style.label}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
            onError={e => { e.target.style.display = "none"; }} />
        ) : (
          <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 4, color: C.muted }}>
            <div style={{ fontSize: 22 }}>🖼️</div>
            <div style={{ fontSize: 8, textAlign: "center", padding: "0 8px" }}>Image pending</div>
          </div>
        )}
        {hasBeltData && <div style={{ position: "absolute", top: 6, right: 6, background: "#16a34a", color: "#fff", fontSize: 8, fontWeight: 700, padding: "2px 5px", borderRadius: 5 }}>✓ Data</div>}
        {isMissing && <div style={{ position: "absolute", top: 6, right: 6, background: "#f59e0b", color: "#fff", fontSize: 8, fontWeight: 700, padding: "2px 5px", borderRadius: 5 }}>⚠ TBC</div>}
      </div>
      <div style={{ padding: "10px 12px", flex: 1, display: "flex", flexDirection: "column" }}>
        <div style={{ fontSize: 12, fontWeight: 800, color: C.navyMid, marginBottom: 4 }}>{style.label}</div>
        <div style={{ display: "flex", gap: 4, marginBottom: 6, flexWrap: "wrap" }}>
          {style.openArea && style.openArea !== "N/A" && (
            <span style={{ background: "#eef3f8", color: C.navyMid, fontSize: 9, fontWeight: 600, padding: "1px 6px", borderRadius: 7 }}>{style.openArea} open</span>
          )}
          {style.surface && (
            <span style={{ background: "#f1f5f9", color: C.muted, fontSize: 9, padding: "1px 6px", borderRadius: 7 }}>{style.surface?.slice(0, 22)}</span>
          )}
        </div>
        <p style={{ fontSize: 10, color: C.muted, lineHeight: 1.5, margin: "0 0 8px", flex: 1 }}>
          {style.description?.slice(0, 90)}{style.description?.length > 90 ? "…" : ""}
        </p>
        {hasBeltData && (
          <div style={{ marginBottom: 8 }}>
            <div style={{ fontSize: 9, color: C.muted, fontWeight: 600, marginBottom: 2 }}>Materials:</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
              {style.beltData.slice(0, 3).map((r, i) => (
                <span key={i} style={{ fontSize: 8, background: "#f0fdf4", color: "#166534", padding: "1px 5px", borderRadius: 5, fontWeight: 600 }}>{r.material}</span>
              ))}
              {style.beltData.length > 3 && <span style={{ fontSize: 8, background: "#f1f5f9", color: C.muted, padding: "1px 5px", borderRadius: 5 }}>+{style.beltData.length - 3}</span>}
            </div>
          </div>
        )}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 5, marginTop: "auto" }}>
          <button onClick={() => onViewSpecs(style)} style={{ padding: "7px", background: "#f1f5f9", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 10, fontWeight: 700, color: C.navyMid }}>
            View Details
          </button>
          <button onClick={() => onConfigure(style)} style={{ padding: "7px", background: SP_BLUE, border: "none", borderRadius: 6, cursor: "pointer", fontSize: 10, fontWeight: 800, color: "#fff" }}>
            Configure →
          </button>
        </div>
      </div>
    </div>
  );
}

function SpecsModal({ series, style, onConfigure, onClose }) {
  const hasBeltData = Array.isArray(style.beltData);
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.65)", zIndex: 1000, display: "flex", alignItems: "flex-start", justifyContent: "center", padding: 16, overflowY: "auto" }}>
      <div onClick={e => e.stopPropagation()} style={{ background: "#fff", borderRadius: 16, width: "100%", maxWidth: 700, boxShadow: "0 24px 80px rgba(0,0,0,0.3)", marginBottom: 16 }}>
        <div style={{ background: SP_BLUE, borderRadius: "16px 16px 0 0", padding: "16px 22px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <div style={{ background: "rgba(255,255,255,0.2)", borderRadius: 4, padding: "2px 7px" }}>
                <span style={{ fontSize: 9, fontWeight: 800, color: "#fff" }}>SYSTEM PLAST</span>
              </div>
              <span style={{ color: "rgba(255,255,255,0.6)", fontSize: 11 }}>{series.name}</span>
            </div>
            <div style={{ color: "#fff", fontSize: 17, fontWeight: 900 }}>{style.label}</div>
          </div>
          <button onClick={onClose} style={{ background: "rgba(255,255,255,0.15)", border: "none", borderRadius: "50%", width: 32, height: 32, cursor: "pointer", color: "#fff", fontSize: 17 }}>✕</button>
        </div>
        <div style={{ padding: "18px 22px" }}>
          <p style={{ fontSize: 13, color: C.text, lineHeight: 1.75, marginBottom: 14 }}>{style.description}</p>

          <div style={{ background: C.bg, borderRadius: 8, padding: "12px 14px", marginBottom: 14 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: "0.7px", marginBottom: 8 }}>Belt Specifications</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, fontSize: 11 }}>
              {[
                ["Series", series.name],
                ["Belt Type", series.beltType],
                ["Pitch", series.pitch_in ? `${series.pitch_in}" (${series.pitch_mm} mm)` : "TBC"],
                ["Thickness", series.thickness_mm ? `${series.thickness_mm} mm (${series.thickness_in}")` : "TBC"],
                ["Surface", style.surface],
                ["Open Area", style.openArea],
                ["Backflex Radius", series.backflex_radius_mm ? `${series.backflex_radius_mm} mm (${series.backflex_radius_in}")` : "TBC"],
                ["Min Width", series.min_width_mm ? `${series.min_width_in}" (${series.min_width_mm} mm)` : "TBC"],
                ["Width Increment", series.width_increment_mm ? `${series.width_increment_in}" (${series.width_increment_mm} mm)` : "TBC"],
                ["Pin Material", series.pin_material || "TBC"],
                ["Fixation", series.fixation || "TBC"],
                ["Smart Guide Ref", series.smartGuideRef || "—"],
              ].filter(([, v]) => v && v !== "—").map(([k, v]) => (
                <div key={k}>
                  <div style={{ fontWeight: 600, color: C.navyMid, fontSize: 10 }}>{k}</div>
                  <div style={{ color: C.muted, marginTop: 1, fontSize: 11 }}>{v}</div>
                </div>
              ))}
            </div>
          </div>

          {hasBeltData ? (
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: "0.7px", marginBottom: 7 }}>Belt Data by Material</div>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 10 }}>
                  <thead>
                    <tr style={{ background: SP_BLUE }}>
                      {["Material", "Pin Material", "Max Load (N/m)", "Max Load (lbs/ft)", "Mass (kg/m²)", "Mass (lb/ft²)", "Temp °C", "Temp °F"].map(h => (
                        <th key={h} style={{ padding: "6px 8px", color: "#fff", fontWeight: 700, textAlign: "left", whiteSpace: "nowrap" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {style.beltData.map((row, i) => (
                      <tr key={i} style={{ background: i % 2 === 0 ? "#f8fafc" : "#fff" }}>
                        <td style={{ padding: "5px 8px", fontWeight: 700, color: C.navyMid }}>{row.label || row.material}</td>
                        <td style={{ padding: "5px 8px", color: C.muted }}>{row.pinMaterial}</td>
                        <td style={{ padding: "5px 8px" }}>{row.strengthNm?.toLocaleString()}</td>
                        <td style={{ padding: "5px 8px" }}>{row.strengthLbsFt?.toLocaleString()}</td>
                        <td style={{ padding: "5px 8px" }}>{row.massKgM2}</td>
                        <td style={{ padding: "5px 8px" }}>{row.massLbFt2}</td>
                        <td style={{ padding: "5px 8px" }}>{row.tempC}</td>
                        <td style={{ padding: "5px 8px" }}>{row.tempF}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {style.beltData.some(r => r.note) && (
                <div style={{ fontSize: 10, color: "#92400e", marginTop: 6, padding: "6px 10px", background: "#fffbeb", borderRadius: 6, border: "1px solid #fde68a" }}>
                  ℹ {style.beltData.find(r => r.note)?.note}
                </div>
              )}
            </div>
          ) : (
            <div style={{ background: style.beltData === "Missing Data – Needs Mapping" ? "#fef3c7" : "#fffbeb", border: "1px solid #fde68a", borderRadius: 7, padding: "10px 12px", fontSize: 11, color: "#92400e", marginBottom: 14 }}>
              {style.beltData === "Missing Data – Needs Mapping"
                ? <span>⚠ <strong>Missing Data – Needs Mapping.</strong> Contact Uniking for full specifications.</span>
                : <span>Belt data: <strong>To be confirmed by Uniking.</strong></span>}
            </div>
          )}

          {style.applications?.length > 0 && (
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: "0.7px", marginBottom: 6 }}>Applications</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                {style.applications.map(a => <span key={a} style={{ background: "#eef3f8", color: C.navyMid, fontSize: 10, fontWeight: 600, padding: "3px 8px", borderRadius: 9 }}>{a}</span>)}
              </div>
            </div>
          )}

          {style.notes?.length > 0 && (
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: "0.7px", marginBottom: 6 }}>Product Notes</div>
              {style.notes.map((n, i) => <div key={i} style={{ fontSize: 11, color: C.text, marginBottom: 3, display: "flex", gap: 5 }}><span style={{ color: SP_BLUE }}>•</span>{n}</div>)}
            </div>
          )}

          <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 7, padding: "9px 12px", fontSize: 11, color: "#92400e", marginBottom: 14 }}>
            <strong>Disclaimer:</strong> Final belt selection must be confirmed by Uniking before production.
          </div>

          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={onClose} style={{ flex: 1, padding: "10px", background: "#f1f5f9", color: C.navyMid, border: "none", borderRadius: 9, cursor: "pointer", fontSize: 12, fontWeight: 700 }}>Close</button>
            <button onClick={() => { onClose(); onConfigure(style); }} style={{ flex: 2, padding: "10px", background: SP_BLUE, color: "#fff", border: "none", borderRadius: 9, cursor: "pointer", fontSize: 12, fontWeight: 800 }}>
              Configure This Belt →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SystemPlastSeriesDetail({ series, onConfigure, onBack, onGoRFQ }) {
  const [activeTab, setActiveTab] = useState("styles");
  const [viewingStyle, setViewingStyle] = useState(null);
  const [rfqMsg, setRfqMsg] = useState(null);

  const tabs = [
    { key: "styles",      label: `Belt Styles (${series.styles?.length || 0})` },
    { key: "sprockets",   label: `Sprockets (${series.sprockets?.length || 0})` },
    { key: "accessories", label: "Accessories & Components" },
    { key: "techdata",    label: "Technical Data" },
  ];

  function addToRFQ(item) {
    const cart = JSON.parse(localStorage.getItem("uniking_rfq_cart") || "[]");
    cart.push({
      cartId: `sp_${item.name?.replace(/\s/g, "_")}_${Date.now()}`,
      id: `sp_${Date.now()}`,
      _source: "systemplast_component",
      series: `${series.name} — ${item.name}`,
      name: item.name,
      type: item.type || "System Plast Component",
      style: series.name,
      category: "Modular Belting — System Plast",
      image_url: item.image || "",
      materials: item.material || "",
      quantity: 1,
      unit: "Each",
      notes: item.notes || "",
    });
    localStorage.setItem("uniking_rfq_cart", JSON.stringify(cart));
    window.dispatchEvent(new Event("rfq_cart_updated"));
    setRfqMsg(`${item.name} added to RFQ`);
    setTimeout(() => setRfqMsg(null), 3000);
  }

  const accTypes = [...new Set((series.accessories || []).map(a => a.type))];

  return (
    <div>
      {/* Header */}
      <div style={{ background: `linear-gradient(135deg, ${C.navy}, #0057A8)`, padding: "20px 24px" }}>
        <button onClick={onBack} style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", color: "#fff", borderRadius: 7, padding: "5px 12px", cursor: "pointer", fontSize: 12, marginBottom: 12 }}>← Back</button>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
          <div style={{ background: "rgba(255,255,255,0.2)", borderRadius: 5, padding: "3px 8px" }}>
            <span style={{ fontSize: 10, fontWeight: 800, color: "#fff" }}>SYSTEM PLAST</span>
          </div>
          <div style={{ background: "rgba(255,255,255,0.1)", borderRadius: 5, padding: "3px 8px" }}>
            <span style={{ fontSize: 10, fontWeight: 600, color: "rgba(255,255,255,0.8)" }}>Smart Guide {series.smartGuideRef || series.catalogPage}</span>
          </div>
          <span style={{ color: "rgba(255,255,255,0.55)", fontSize: 12 }}>Modular Belts & Sprockets</span>
        </div>
        <h1 style={{ color: "#fff", fontSize: 22, fontWeight: 900, margin: "0 0 4px" }}>{series.name}</h1>
        <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 13, margin: "0 0 12px", maxWidth: 600 }}>{series.description}</p>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {series.pitch_in && (
            <span style={{ background: "rgba(201,168,76,0.2)", color: C.gold, padding: "4px 10px", borderRadius: 16, fontSize: 11, fontWeight: 700 }}>Pitch: {series.pitch_in}" ({series.pitch_mm} mm)</span>
          )}
          {series.thickness_mm && (
            <span style={{ background: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.8)", padding: "4px 10px", borderRadius: 16, fontSize: 11 }}>H: {series.thickness_mm} mm</span>
          )}
          {series.backflex_radius_mm && (
            <span style={{ background: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.8)", padding: "4px 10px", borderRadius: 16, fontSize: 11 }}>Backflex: {series.backflex_radius_mm} mm</span>
          )}
          {series.min_width_mm && (
            <span style={{ background: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.8)", padding: "4px 10px", borderRadius: 16, fontSize: 11 }}>Min W: {series.min_width_in}" ({series.min_width_mm} mm)</span>
          )}
          <span style={{ background: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.8)", padding: "4px 10px", borderRadius: 16, fontSize: 11 }}>{series.beltType}</span>
        </div>
      </div>

      {rfqMsg && <div style={{ background: "#16a34a", color: "#fff", padding: "10px 20px", fontSize: 13, fontWeight: 700, textAlign: "center" }}>✓ {rfqMsg}</div>}

      {/* Tabs */}
      <div style={{ background: "#fff", borderBottom: `1px solid ${C.border}`, padding: "0 20px", display: "flex", gap: 2, overflowX: "auto" }}>
        {tabs.map(t => <TabButton key={t.key} label={t.label} active={activeTab === t.key} onClick={() => setActiveTab(t.key)} />)}
      </div>

      {/* Tab Content */}
      <div style={{ padding: "20px", background: C.bg, minHeight: 400 }}>

        {/* Belt Styles */}
        {activeTab === "styles" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, flexWrap: "wrap", gap: 8 }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: C.navyMid }}>Belt Styles — {series.name}</div>
                <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>{series.styles?.length} catalog styles · <strong>View Details</strong> for specs or <strong>Configure</strong> to build your belt.</div>
              </div>
              <a href={series.techChartUrl} target="_blank" rel="noreferrer"
                style={{ fontSize: 11, color: SP_BLUE, fontWeight: 700, textDecoration: "none", whiteSpace: "nowrap" }}>
                Smart Guide ↗
              </a>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 12 }}>
              {(series.styles || []).map(style => (
                <StyleCard key={style.key} style={style}
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
            <div style={{ fontSize: 12, color: C.muted, marginBottom: 12 }}>Sprockets compatible with {series.name}. All material: reinforced polyamide unless noted.</div>
            {series.sprockets?.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {series.sprockets.map((sp, i) => (
                  <div key={i} style={{ background: "#fff", borderRadius: 10, border: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: 12, padding: "12px 16px" }}>
                    <div style={{ width: 48, height: 40, flexShrink: 0, background: "#eef3f8", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>⚙️</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 800, color: C.navyMid }}>{sp.name}</div>
                      <div style={{ fontSize: 11, color: C.muted, marginTop: 1 }}>
                        {sp.teeth && <span>Teeth: <strong>{sp.teeth}</strong> · </span>}
                        {sp.bore && <span>Bore: <strong>{sp.bore}</strong> · </span>}
                        <span>Material: <strong>{sp.material}</strong></span>
                      </div>
                      {sp.notes && <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{sp.notes.slice(0, 100)}</div>}
                      {sp.smartGuide && <div style={{ fontSize: 10, color: SP_BLUE, marginTop: 1 }}>Smart Guide: {sp.smartGuide}</div>}
                    </div>
                    <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                      {sp.url && <a href={sp.url} target="_blank" rel="noreferrer" style={{ color: SP_BLUE, fontSize: 11, fontWeight: 700, textDecoration: "none" }}>SG ↗</a>}
                      <button onClick={() => addToRFQ(sp)} style={{ padding: "6px 12px", background: C.navy, color: "#fff", border: "none", borderRadius: 7, cursor: "pointer", fontSize: 11, fontWeight: 800, whiteSpace: "nowrap" }}>+ RFQ</button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 8, padding: "14px", fontSize: 13, color: "#92400e" }}>
                Sprocket data: <strong>To be confirmed by Uniking.</strong>
              </div>
            )}
            <div style={{ marginTop: 12, fontSize: 11, color: C.muted }}>
              Full sprocket data: <a href={SP_SMART_GUIDE_URL} target="_blank" rel="noreferrer" style={{ color: SP_BLUE }}>System Plast Smart Guide ↗</a>
            </div>
          </div>
        )}

        {/* Accessories */}
        {activeTab === "accessories" && (
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: C.navyMid, marginBottom: 12 }}>Accessories & Components — {series.name}</div>
            {series.accessories?.length > 0 ? (
              accTypes.map(type => {
                const items = series.accessories.filter(a => a.type === type);
                return (
                  <div key={type} style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: "capitalize", letterSpacing: "0.5px", marginBottom: 8 }}>
                      {type === "flight" ? "Flights" : type === "sideguard" ? "Sideguards" : type === "track" ? "Tracks" : type === "special" ? "Special Belt Versions" : "Accessories"} ({items.length})
                    </div>
                    <div style={{ background: "#fff", borderRadius: 10, border: `1px solid ${C.border}`, overflow: "hidden" }}>
                      {items.map((acc, i) => (
                        <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", borderBottom: i < items.length - 1 ? `1px solid ${C.border}` : "none" }}>
                          <div style={{ width: 40, height: 36, flexShrink: 0, background: "#f1f5f9", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>
                            {acc.type === "flight" ? "🔧" : acc.type === "track" ? "🛤️" : acc.type === "sideguard" ? "🛡️" : acc.type === "special" ? "⚙️" : "📦"}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 12, fontWeight: 700, color: C.navyMid }}>{acc.name}</div>
                            <div style={{ fontSize: 10, color: C.muted, lineHeight: 1.4, marginTop: 1 }}>{acc.notes}</div>
                          </div>
                          {acc.url && <a href={acc.url} target="_blank" rel="noreferrer" style={{ fontSize: 10, color: SP_BLUE, fontWeight: 700, textDecoration: "none", flexShrink: 0 }}>SG ↗</a>}
                          <button onClick={() => addToRFQ(acc)} style={{ padding: "6px 11px", background: C.navy, color: "#fff", border: "none", borderRadius: 7, cursor: "pointer", fontSize: 10, fontWeight: 800, flexShrink: 0 }}>+ RFQ</button>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })
            ) : (
              <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 8, padding: "14px", fontSize: 13, color: "#92400e" }}>
                ⚠ Accessories for {series.name}: <strong>To be confirmed by Uniking.</strong> Refer to Smart Guide page {series.catalogPage}.
              </div>
            )}
          </div>
        )}

        {/* Technical Data */}
        {activeTab === "techdata" && (
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: C.navyMid, marginBottom: 12 }}>Technical Data — {series.name}</div>

            <div style={{ background: "#fff", borderRadius: 10, border: `1px solid ${C.border}`, padding: "16px 18px", marginBottom: 14 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: C.navyMid, marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.5px" }}>Series Specifications</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(190px, 1fr))", gap: 10 }}>
                {[
                  ["Belt Type", series.beltType],
                  ["Pitch", series.pitch_in ? `${series.pitch_in}" (${series.pitch_mm} mm)` : "TBC"],
                  ["Module Height", series.thickness_mm ? `${series.thickness_mm} mm (${series.thickness_in}")` : "TBC"],
                  ["Smart Guide Ref", series.smartGuideRef || series.catalogPage || "—"],
                  ["Min Width", series.min_width_mm ? `${series.min_width_in}" (${series.min_width_mm} mm)` : "TBC"],
                  ["Width Increment", series.width_increment_mm ? `${series.width_increment_in}" (${series.width_increment_mm} mm)` : "TBC"],
                  ["Backflex Radius", series.backflex_radius_mm ? `${series.backflex_radius_mm} mm (${series.backflex_radius_in}")` : "TBC"],
                  ["Pin Material", series.pin_material || "TBC"],
                  ["Fixation Type", series.fixation || "TBC"],
                  ["Belt Styles", `${series.styles?.length || 0} styles`],
                ].filter(([, v]) => v && v !== "—").map(([k, v]) => (
                  <div key={k} style={{ background: C.bg, borderRadius: 7, padding: "9px 11px" }}>
                    <div style={{ fontSize: 9, color: C.muted, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.4px" }}>{k}</div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: C.navyMid, marginTop: 2 }}>{v}</div>
                  </div>
                ))}
              </div>
            </div>

            {(series.styles || []).filter(s => Array.isArray(s.beltData)).map(style => (
              <div key={style.key} style={{ background: "#fff", borderRadius: 10, border: `1px solid ${C.border}`, padding: "14px 18px", marginBottom: 12 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: C.navyMid, marginBottom: 10 }}>{series.name} — {style.label}</div>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 10 }}>
                    <thead>
                      <tr style={{ background: SP_BLUE }}>
                        {["Material", "Pin", "Max Load (N/m)", "Max Load (lbs/ft)", "Mass (kg/m²)", "Mass (lb/ft²)", "Temp °C", "Temp °F"].map(h => (
                          <th key={h} style={{ padding: "6px 9px", color: "#fff", fontWeight: 700, textAlign: "left", whiteSpace: "nowrap" }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {style.beltData.map((row, i) => (
                        <tr key={i} style={{ background: i % 2 === 0 ? "#f8fafc" : "#fff" }}>
                          <td style={{ padding: "6px 9px", fontWeight: 700, color: C.navyMid }}>{row.label || row.material}</td>
                          <td style={{ padding: "6px 9px", color: C.muted }}>{row.pinMaterial}</td>
                          <td style={{ padding: "6px 9px" }}>{row.strengthNm?.toLocaleString()}</td>
                          <td style={{ padding: "6px 9px" }}>{row.strengthLbsFt?.toLocaleString()}</td>
                          <td style={{ padding: "6px 9px" }}>{row.massKgM2}</td>
                          <td style={{ padding: "6px 9px" }}>{row.massLbFt2}</td>
                          <td style={{ padding: "6px 9px" }}>{row.tempC}</td>
                          <td style={{ padding: "6px 9px" }}>{row.tempF}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}

            {(series.styles || []).filter(s => !Array.isArray(s.beltData)).length > 0 && (
              <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 8, padding: "12px 14px", marginBottom: 14 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#92400e", marginBottom: 6 }}>⚠ Styles pending full data mapping:</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                  {(series.styles || []).filter(s => !Array.isArray(s.beltData)).map(s => (
                    <span key={s.key} style={{ background: "#fef3c7", color: "#92400e", fontSize: 10, fontWeight: 600, padding: "2px 7px", borderRadius: 7 }}>{s.label}</span>
                  ))}
                </div>
              </div>
            )}

            <div style={{ background: "#fff", borderRadius: 10, border: `1px solid ${C.border}`, padding: "14px 18px" }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: C.navyMid, marginBottom: 8 }}>Engineering Resources</div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <a href={series.techChartUrl} target="_blank" rel="noreferrer"
                  style={{ background: SP_BLUE, color: "#fff", padding: "8px 16px", borderRadius: 8, fontWeight: 700, fontSize: 11, textDecoration: "none" }}>
                  📄 Smart Guide (p.{series.catalogPage})
                </a>
                <a href="https://www.systemplastsmartguide.com" target="_blank" rel="noreferrer"
                  style={{ background: C.navyMid, color: "#fff", padding: "8px 16px", borderRadius: 8, fontWeight: 700, fontSize: 11, textDecoration: "none" }}>
                  🔗 System Plast Smart Guide
                </a>
              </div>
              <div style={{ marginTop: 8, fontSize: 10, color: C.muted }}>
                Source: System Plast Smart Guide Rev. 005 (Regal Rexnord). All specs subject to confirmation by Uniking.
              </div>
            </div>
          </div>
        )}
      </div>

      {viewingStyle && (
        <SpecsModal series={series} style={viewingStyle}
          onConfigure={s => onConfigure(s, series)}
          onClose={() => setViewingStyle(null)} />
      )}
    </div>
  );
}