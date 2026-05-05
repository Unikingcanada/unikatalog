import { useState, useEffect } from "react";
import { TOOTH_CONFIGS, SHARPTOP_UPGRADES, COMPATIBLE_SPROCKETS, buildRFQLabel } from "@/lib/sharpTopData";

const C = { navy: "#0F2340", navyMid: "#1A3A5C", navyLight: "#2A5080", gold: "#C9A84C", border: "#e2e8f0", muted: "#64748b", text: "#0f172a", bg: "#f8fafc", green: "#16a34a", greenBg: "#f0fdf4" };

function getRFQCart() { try { return JSON.parse(localStorage.getItem("uniking_rfq_cart") || "[]"); } catch { return []; } }

function SpecRow({ label, value, note }) {
  if (!value && value !== 0) return (
    <tr>
      <td style={{ padding: "8px 12px", color: C.muted, fontWeight: 600, fontSize: 12, borderBottom: `1px solid ${C.border}`, width: "45%" }}>{label}</td>
      <td style={{ padding: "8px 12px", borderBottom: `1px solid ${C.border}`, fontSize: 12 }}>
        <span style={{ color: "#b45309", fontStyle: "italic", fontSize: 11 }}>To be confirmed by Uniking</span>
      </td>
    </tr>
  );
  return (
    <tr>
      <td style={{ padding: "8px 12px", color: C.muted, fontWeight: 600, fontSize: 12, borderBottom: `1px solid ${C.border}`, width: "45%" }}>{label}</td>
      <td style={{ padding: "8px 12px", color: C.text, fontWeight: 600, fontSize: 12, borderBottom: `1px solid ${C.border}` }}>
        {value} {note && <span style={{ color: C.muted, fontWeight: 400, fontSize: 11 }}>— {note}</span>}
      </td>
    </tr>
  );
}

function ConfigSelector({ product, selectedConfig, onSelect }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>
        Available Tooth Configurations ({product.available_configs.length})
      </div>
      {product.available_configs.map(code => {
        const cfg = TOOTH_CONFIGS[code];
        if (!cfg) return null;
        const isSelected = selectedConfig === code;
        const w = product.weight_by_config?.[code];
        return (
          <div
            key={code}
            onClick={() => onSelect(code)}
            style={{
              border: `2px solid ${isSelected ? C.navyMid : C.border}`,
              borderRadius: 10, padding: "12px 14px", cursor: "pointer",
              background: isSelected ? "#eef3f8" : "#fff",
              transition: "all 0.15s",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{
                  width: 20, height: 20, borderRadius: "50%",
                  border: `2px solid ${isSelected ? C.navyMid : C.border}`,
                  background: isSelected ? C.navyMid : "#fff",
                  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                }}>
                  {isSelected && <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#fff" }} />}
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: isSelected ? C.navyMid : C.text }}>{cfg.label}</div>
                  <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{cfg.frequency}</div>
                </div>
              </div>
              <div style={{ textAlign: "right", flexShrink: 0 }}>
                {w && <div style={{ fontSize: 11, color: C.muted }}>{w} lbs/ft</div>}
                {cfg.code === "IH" && <div style={{ fontSize: 9, background: "#fef3c7", color: "#92400e", padding: "2px 6px", borderRadius: 6, fontWeight: 700 }}>UPGRADE</div>}
              </div>
            </div>
            <div style={{ fontSize: 12, color: C.muted, marginTop: 8, marginLeft: 28, lineHeight: 1.6 }}>{cfg.desc}</div>
            {cfg.points && (
              <div style={{ marginTop: 8, marginLeft: 28, display: "flex", gap: 6 }}>
                <span style={{ fontSize: 10, background: "#eef3f8", color: C.navyMid, padding: "2px 8px", borderRadius: 10, fontWeight: 700 }}>
                  {cfg.points} point{cfg.points !== 1 ? "s" : ""}
                </span>
                <span style={{ fontSize: 10, background: "#f8fafc", color: C.muted, padding: "2px 8px", borderRadius: 10, border: `1px solid ${C.border}` }}>
                  {cfg.frequency}
                </span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function SprocketsTab({ product }) {
  const sprocketData = COMPATIBLE_SPROCKETS[product.base_ansi?.replace("H","").replace("SH","").replace("(BS)","").trim()] || null;
  return (
    <div>
      <div style={{ fontSize: 12, color: C.muted, marginBottom: 16, lineHeight: 1.6 }}>
        Compatible sprockets for {product.chain_number} base chain. Standard ANSI tooth counts — specify bore size when ordering.
      </div>
      {sprocketData ? sprocketData.map((sg, i) => (
        <div key={i} style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: C.navyMid, marginBottom: 8 }}>{sg.note}</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 10 }}>
            {sg.teeth.map(t => (
              <span key={t} style={{ fontSize: 12, background: "#f8fafc", border: `1px solid ${C.border}`, borderRadius: 6, padding: "4px 10px", fontWeight: 600, color: C.text }}>
                {t}T
              </span>
            ))}
          </div>
          <div style={{ fontSize: 11, color: C.muted }}>Material: {sg.material} · Bore: {sg.bore_options}</div>
        </div>
      )) : (
        <div style={{ padding: "16px", background: "#fffbeb", borderRadius: 8, border: "1px solid #fde68a", fontSize: 12, color: "#92400e" }}>
          ⚠ Sprocket data for this chain type — confirm compatibility with Uniking before ordering.
        </div>
      )}
      <div style={{ marginTop: 12, padding: "10px 14px", background: C.bg, borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 11, color: C.muted }}>
        All SharpTop chains use standard ANSI/BS base chain dimensions and are compatible with matching standard sprockets. Contact Uniking for custom tooth profiles, split sprockets, or wear-compensating designs.
      </div>
    </div>
  );
}

function UpgradesTab({ product, onAddUpgrade }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ fontSize: 12, color: C.muted, marginBottom: 4, lineHeight: 1.6 }}>
        Select add-on upgrades to enhance performance for your specific application.
      </div>
      {SHARPTOP_UPGRADES.map(u => (
        <div key={u.code} style={{ border: `1px solid ${C.border}`, borderRadius: 10, padding: "14px 16px", background: "#fff" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 800, color: C.text, marginBottom: 4 }}>{u.label}</div>
              <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.5 }}>{u.description}</div>
              <div style={{ fontSize: 11, color: "#b45309", marginTop: 6 }}>Lead time: {u.lead_time}</div>
            </div>
            <button
              onClick={() => onAddUpgrade(u)}
              style={{ flexShrink: 0, padding: "6px 14px", borderRadius: 7, fontSize: 11, fontWeight: 700, cursor: "pointer", background: "#eff6ff", color: "#2563eb", border: "1px solid #bfdbfe", whiteSpace: "nowrap" }}
            >
              + Enquire
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function SharpTopProductDetail({ product, onClose, onGoRFQ }) {
  const [tab, setTab] = useState("specs");
  const [selectedConfig, setSelectedConfig] = useState(product.standard_config);
  const [qty, setQty] = useState(1);
  const [notes, setNotes] = useState("");
  const [added, setAdded] = useState(false);

  const cfg = TOOTH_CONFIGS[selectedConfig];
  const rfqLabel = buildRFQLabel(product, selectedConfig);
  const strandLabel = product.strands === 1 ? "Single-Strand" : product.strands === 2 ? "Double-Strand" : product.strands === 3 ? "Triple-Strand" : `${product.strands}-Strand`;

  const TABS = [
    { key: "specs", label: "Specifications" },
    { key: "variants", label: `Configurations (${product.available_configs.length})` },
    { key: "sprockets", label: "Sprockets" },
    { key: "upgrades", label: "Options / Upgrades" },
  ];

  function handleAddRFQ() {
    const cart = getRFQCart();
    const cartId = `sharptop-${product.id}-${selectedConfig}-${Date.now()}`;
    cart.push({
      cartId, id: cartId, _source: "sharptop",
      series: product.chain_number,
      name: rfqLabel,
      type: "Sharptop Chain",
      category: product.subcategory,
      style: cfg?.shortLabel || selectedConfig,
      image_url: product.image_url || "",
      materials: product.materials || "",
      application: (product.applications || []).join(", "),
      quantity: qty, unit: "Feet", notes,
    });
    localStorage.setItem("uniking_rfq_cart", JSON.stringify(cart));
    window.dispatchEvent(new Event("rfq_cart_updated"));
    setAdded(true);
    setTimeout(() => setAdded(false), 3000);
  }

  function handleAddUpgrade(u) {
    const cart = getRFQCart();
    const cartId = `sharptop-upgrade-${product.id}-${u.code}-${Date.now()}`;
    cart.push({
      cartId, id: cartId, _source: "sharptop",
      series: product.chain_number + " + " + u.label,
      name: `${product.chain_number} — ${u.label}`,
      type: "Sharptop Chain Upgrade", category: "upgrade",
      style: u.code, quantity: 1, unit: "Each",
      notes: `Upgrade for: ${rfqLabel}`,
    });
    localStorage.setItem("uniking_rfq_cart", JSON.stringify(cart));
    window.dispatchEvent(new Event("rfq_cart_updated"));
  }

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 1000, display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "16px 12px", overflowY: "auto" }}>
      <div onClick={e => e.stopPropagation()} style={{ background: "#fff", borderRadius: 12, width: "100%", maxWidth: 780, boxShadow: "0 24px 64px rgba(0,0,0,0.22)", marginTop: "auto", marginBottom: "auto" }}>

        {/* Header */}
        <div style={{ background: C.navyMid, padding: "20px 26px", borderRadius: "12px 12px 0 0" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
            <div style={{ display: "flex", gap: 14, alignItems: "flex-start", flex: 1 }}>
              <div style={{ background: "#fff", borderRadius: 8, padding: 8, flexShrink: 0, width: 100, height: 72, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <img src={product.image_url} alt="" style={{ maxWidth: 88, maxHeight: 62, objectFit: "contain" }} onError={e => e.target.style.display="none"} />
              </div>
              <div>
                <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: 2, color: "rgba(255,255,255,0.45)", marginBottom: 4 }}>
                  SharpTop Chain · {strandLabel}
                </div>
                <div style={{ fontSize: 22, fontWeight: 900, color: "#fff", lineHeight: 1.2 }}>{product.chain_number}</div>
                <div style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", marginTop: 3 }}>{product.pitch_in}" pitch ({product.pitch_mm}mm)</div>
                <div style={{ display: "flex", gap: 6, marginTop: 8, flexWrap: "wrap" }}>
                  {product.featured && <span style={{ background: C.gold, color: C.navy, padding: "2px 8px", borderRadius: 99, fontSize: 9, fontWeight: 800 }}>MOST COMMON</span>}
                  <span style={{ background: "rgba(255,255,255,.15)", color: "#fff", padding: "2px 8px", borderRadius: 99, fontSize: 10, fontWeight: 700 }}>{strandLabel}</span>
                  {product.weight_lbs_ft && <span style={{ background: "rgba(255,255,255,.12)", color: "rgba(255,255,255,0.85)", padding: "2px 8px", borderRadius: 99, fontSize: 10 }}>{product.weight_lbs_ft} lbs/ft</span>}
                </div>
              </div>
            </div>
            <button onClick={onClose} style={{ background: "rgba(255,255,255,.12)", border: "none", color: "#fff", width: 30, height: 30, borderRadius: 6, cursor: "pointer", fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>×</button>
          </div>

          {/* Selected config badge */}
          {cfg && (
            <div style={{ marginTop: 14, padding: "8px 14px", background: "rgba(255,255,255,0.1)", borderRadius: 8, border: "1px solid rgba(255,255,255,0.15)", display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", fontWeight: 600 }}>Selected config:</span>
              <span style={{ fontSize: 11, color: "#fff", fontWeight: 800 }}>{cfg.label}</span>
            </div>
          )}

          {/* Description */}
          <div style={{ marginTop: 12, fontSize: 13, color: "rgba(255,255,255,0.7)", lineHeight: 1.7 }}>
            {product.description}
          </div>

          {/* Applications */}
          {product.applications?.length > 0 && (
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 10 }}>
              {product.applications.map(a => (
                <span key={a} style={{ background: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.8)", padding: "3px 10px", borderRadius: 20, fontSize: 10, fontWeight: 600 }}>{a}</span>
              ))}
            </div>
          )}
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", borderBottom: `2px solid ${C.border}`, padding: "0 26px", overflowX: "auto" }}>
          {TABS.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)} style={{
              padding: "10px 14px", border: "none", background: "none", cursor: "pointer",
              fontSize: 12, fontWeight: 700, whiteSpace: "nowrap",
              color: tab === t.key ? C.navyMid : C.muted,
              borderBottom: tab === t.key ? `2px solid ${C.navyMid}` : "2px solid transparent",
              marginBottom: -2,
            }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Body */}
        <div style={{ padding: "20px 26px 8px", overflowY: "auto", maxHeight: 400 }}>
          {tab === "specs" && (
            <div>
              {product.notes && (
                <div style={{ marginBottom: 16, background: "#fffbeb", borderLeft: `3px solid ${C.gold}`, borderRadius: 6, padding: "10px 14px", fontSize: 12, color: "#92400e", lineHeight: 1.6 }}>
                  📋 {product.notes}
                </div>
              )}
              <div style={{ border: `1px solid ${C.border}`, borderRadius: 8, overflow: "hidden" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <tbody>
                    <SpecRow label="Chain Number" value={product.chain_number} />
                    <SpecRow label="Pitch" value={`${product.pitch_in}" (${product.pitch_mm} mm)`} />
                    <SpecRow label="Strands" value={`${product.strands} (${strandLabel})`} />
                    <SpecRow label="Base ANSI" value={product.base_ansi} />
                    <SpecRow label="Roller Diameter" value={product.roller_dia_in ? `${product.roller_dia_in}" (${product.roller_dia_mm} mm)` : null} />
                    <SpecRow label="Width Between Plates" value={product.width_inner_in ? `${product.width_inner_in}" (${product.width_inner_mm} mm)` : null} />
                    <SpecRow label="Pin Diameter" value={product.pin_dia_in ? `${product.pin_dia_in}" (${product.pin_dia_mm} mm)` : null} />
                    <SpecRow label="Plate Thickness" value={product.plate_thickness_in ? `${product.plate_thickness_in}" (${product.plate_thickness_mm} mm)` : null} />
                    <SpecRow label="Weight per Foot" value={product.weight_lbs_ft ? `${product.weight_lbs_ft} lbs/ft` : null} />
                    <SpecRow label="Min. Tensile Strength" value={product.min_tensile_lbf ? `${product.min_tensile_lbf.toLocaleString()} lbf` : null} />
                    <SpecRow label="Materials" value={product.materials} />
                    <SpecRow label="Heat Treatment" value={product.heat_treatment} />
                    <SpecRow label="Standard Configuration" value={TOOTH_CONFIGS[product.standard_config]?.label} />
                  </tbody>
                </table>
              </div>
              <div style={{ marginTop: 12, padding: "10px 14px", background: "#f0f9ff", borderRadius: 8, border: "1px solid #bae6fd", fontSize: 11, color: "#0369a1" }}>
                ℹ All specifications are based on Connexus Industries catalog data (2024). Final confirmation recommended before procurement.
              </div>
            </div>
          )}

          {tab === "variants" && (
            <ConfigSelector product={product} selectedConfig={selectedConfig} onSelect={setSelectedConfig} />
          )}

          {tab === "sprockets" && <SprocketsTab product={product} />}
          {tab === "upgrades" && <UpgradesTab product={product} onAddUpgrade={handleAddUpgrade} />}
        </div>

        {/* RFQ Footer */}
        <div style={{ padding: "16px 26px 22px", borderTop: `1px solid ${C.border}` }}>
          <div style={{ marginBottom: 10, display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: C.muted }}>Configuration:</div>
            <div style={{ fontSize: 12, fontWeight: 800, color: C.navyMid }}>{cfg?.label || selectedConfig}</div>
          </div>
          <div style={{ display: "flex", gap: 10, marginBottom: 12, flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: C.muted }}>Qty (ft):</div>
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <button onClick={() => setQty(q => Math.max(1, q - 1))} style={{ width: 26, height: 26, borderRadius: 5, border: `1px solid ${C.border}`, background: "#f9fafb", cursor: "pointer", fontSize: 14 }}>−</button>
                <input type="number" min={1} value={qty} onChange={e => setQty(Math.max(1, parseInt(e.target.value)||1))} style={{ width: 52, textAlign: "center", padding: "4px", borderRadius: 5, border: `1px solid ${C.border}`, fontSize: 12, fontWeight: 700 }} />
                <button onClick={() => setQty(q => q + 1)} style={{ width: 26, height: 26, borderRadius: 5, border: `1px solid ${C.border}`, background: "#f9fafb", cursor: "pointer", fontSize: 14 }}>+</button>
              </div>
            </div>
            <input
              value={notes} onChange={e => setNotes(e.target.value)}
              placeholder="Notes (spacing, sprocket, application...)"
              style={{ flex: 1, minWidth: 160, padding: "6px 12px", borderRadius: 7, border: `1px solid ${C.border}`, fontSize: 12, outline: "none" }}
            />
          </div>
          <div style={{ marginBottom: 10, fontSize: 11, color: C.muted }}>
            RFQ Item: <strong style={{ color: C.text }}>{rfqLabel}</strong>
          </div>
          <button
            onClick={handleAddRFQ}
            style={{ width: "100%", padding: "13px", borderRadius: 10, border: "none", cursor: "pointer", fontSize: 14, fontWeight: 800, transition: "background 0.2s",
              background: added ? C.green : C.navyMid, color: "#fff" }}
          >
            {added ? `✓ Added — ${rfqLabel}` : `Add to RFQ — ${rfqLabel}`}
          </button>
        </div>
      </div>
    </div>
  );
}