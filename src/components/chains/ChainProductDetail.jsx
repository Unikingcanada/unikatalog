/**
 * ChainProductDetail — Full detail page for a chain product.
 * Tabs: Specifications | Related Pins | Related Sprockets | Related Attachments | Options | Source Data
 */
import { useState } from "react";

const C = {
  navy: "#0C2340", navyMid: "#1A3A5C", navyLight: "#2A5080",
  gold: "#C9A84C", border: "#e2e8f0", muted: "#64748b", bg: "#f8fafc", text: "#0f172a",
};

const TABS = [
  { key: "specs", label: "Specifications" },
  { key: "pins", label: "Related Pins" },
  { key: "sprockets", label: "Related Sprockets" },
  { key: "attachments", label: "Related Attachments" },
  { key: "options", label: "Options / Add-Ons" },
  { key: "source", label: "Source Data" },
];

const SPEC_LABELS = {
  pitch_in: 'Pitch (in)',
  roller_width_in: 'Roller Width (in)',
  roller_dia_in: 'Roller Diameter (in)',
  pin_dia_in: 'Pin Diameter (in)',
  plate_height_in: 'Sidebar Height (in)',
  plate_thick_in: 'Sidebar Thickness (in)',
  avg_ultimate_lbs: 'Avg. Ultimate Strength (lbs)',
  weight_lbs_ft: 'Weight (lbs/ft)',
  riv_end_to_cl_in: 'Rivet End to Centerline (in)',
  conn_end_to_cl_in: 'Connect End to Centerline (in)',
  lacing: 'Lacing Pattern',
  notes: 'Notes',
};

export default function ChainProductDetail({ product, accentColor = "#0C2340", onBack, onGoRFQ }) {
  const [activeTab, setActiveTab] = useState("specs");
  const [rfqAdded, setRfqAdded] = useState({});

  function addToRFQ(item, type) {
    const cart = JSON.parse(localStorage.getItem("uniking_rfq_cart") || "[]");
    const key = `${product.id}_${type}_${item.code || item.name}`;
    const exists = cart.find(i => i.cartId && i.cartId.startsWith(key));
    if (!exists) {
      cart.push({
        cartId: key + "_" + Date.now(),
        id: key,
        _source: "chain_catalog",
        series: product.chain_number,
        name: item.name || item.code,
        type: type,
        category: "Chain Component",
        quantity: 1,
        unit: "Each",
        notes: `For chain: ${product.chain_number} — ${product.product_type}. Source: ${product.source}.`,
      });
      localStorage.setItem("uniking_rfq_cart", JSON.stringify(cart));
      window.dispatchEvent(new Event("rfq_cart_updated"));
    }
    setRfqAdded(prev => ({ ...prev, [item.code || item.name]: true }));
    setTimeout(() => setRfqAdded(prev => ({ ...prev, [item.code || item.name]: false })), 2500);
  }

  function addChainToRFQ() {
    const cart = JSON.parse(localStorage.getItem("uniking_rfq_cart") || "[]");
    const exists = cart.find(i => i.id === product.id);
    if (!exists) {
      cart.push({
        cartId: product.id + "_" + Date.now(),
        id: product.id,
        _source: "chain_catalog",
        series: product.chain_number,
        name: `${product.chain_number} — ${product.product_type}`,
        type: product.product_type,
        category: "Chain",
        quantity: 1,
        unit: "Foot",
        notes: `Source: ${product.source}`,
      });
      localStorage.setItem("uniking_rfq_cart", JSON.stringify(cart));
      window.dispatchEvent(new Event("rfq_cart_updated"));
    }
    setRfqAdded(prev => ({ ...prev, _chain: true }));
    setTimeout(() => setRfqAdded(prev => ({ ...prev, _chain: false })), 2500);
  }

  const hasNotes = product.notes && product.notes.toLowerCase().includes("missing data");
  const specs = product.specs || {};

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "'Inter','Segoe UI',Arial,sans-serif" }}>

      {/* Top bar */}
      <div style={{ background: C.navy, padding: "14px clamp(16px,4vw,40px)", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 200 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button onClick={onBack}
            style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", color: "#fff", borderRadius: 7, padding: "5px 12px", cursor: "pointer", fontSize: 12 }}>
            ← Back
          </button>
          <div style={{ color: "rgba(255,255,255,0.55)", fontSize: 12 }}>Chain Catalog</div>
          <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 12 }}>›</div>
          <div style={{ color: "#fff", fontSize: 12, fontWeight: 700 }}>{product.chain_number}</div>
        </div>
        <button onClick={onGoRFQ}
          style={{ background: C.gold, color: C.navy, border: "none", borderRadius: 8, padding: "7px 16px", cursor: "pointer", fontSize: 12, fontWeight: 700 }}>
          RFQ Cart
        </button>
      </div>

      {/* Hero section */}
      <div style={{ background: `linear-gradient(135deg, ${C.navy} 0%, ${C.navyLight} 100%)`, padding: "28px clamp(16px,4vw,40px)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", gap: 28, flexWrap: "wrap", alignItems: "flex-start" }}>

          {/* Product image */}
          <div style={{ width: 180, height: 140, flexShrink: 0, borderRadius: 12, overflow: "hidden", background: "#1a3a5c", display: "flex", alignItems: "center", justifyContent: "center" }}>
            {product.image ? (
              <img src={product.image} alt={product.chain_number} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              <span style={{ fontSize: 48, opacity: 0.5 }}>⛓️</span>
            )}
          </div>

          {/* Info */}
          <div style={{ flex: 1, minWidth: 260 }}>
            {hasNotes && (
              <div style={{ background: "#fef3c7", color: "#92400e", fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 6, display: "inline-block", marginBottom: 10 }}>
                ⚠ Missing Data – Needs Mapping
              </div>
            )}
            <div style={{ color: "rgba(255,255,255,0.55)", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", marginBottom: 4 }}>
              {product.product_type}
            </div>
            <h1 style={{ color: "#fff", fontSize: 30, fontWeight: 900, margin: "0 0 10px" }}>{product.chain_number}</h1>
            <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 13, lineHeight: 1.75, margin: "0 0 14px", maxWidth: 540 }}>{product.description}</p>

            {/* Industries */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 16 }}>
              {product.industries?.map(ind => (
                <span key={ind} style={{ background: "rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.85)", fontSize: 10, fontWeight: 600, padding: "4px 10px", borderRadius: 20 }}>{ind}</span>
              ))}
            </div>

            {/* Key features */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 18 }}>
              {product.features?.slice(0, 4).map(f => (
                <span key={f} style={{ background: `${accentColor}40`, color: "#fff", fontSize: 10, fontWeight: 600, padding: "3px 8px", borderRadius: 8 }}>✓ {f}</span>
              ))}
            </div>

            {/* RFQ button */}
            <button onClick={addChainToRFQ}
              style={{ background: rfqAdded._chain ? "#16a34a" : C.gold, color: rfqAdded._chain ? "#fff" : C.navy, border: "none", borderRadius: 10, padding: "12px 28px", cursor: "pointer", fontSize: 13, fontWeight: 800, transition: "background 0.2s" }}>
              {rfqAdded._chain ? "✓ Added to RFQ" : `+ Add ${product.chain_number} to RFQ`}
            </button>
          </div>
        </div>
      </div>

      {/* Tab bar */}
      <div style={{ background: "#fff", borderBottom: `1px solid ${C.border}`, position: "sticky", top: 56, zIndex: 100 }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 clamp(16px,4vw,40px)", display: "flex", gap: 0, overflowX: "auto" }}>
          {TABS.map(tab => {
            const count = tab.key === "pins" ? product.related_pins?.length
              : tab.key === "sprockets" ? product.related_sprockets?.length
              : tab.key === "attachments" ? product.related_attachments?.length
              : tab.key === "options" ? product.options?.length
              : null;
            return (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                style={{ padding: "14px 18px", border: "none", background: "none", cursor: "pointer", fontSize: 12, fontWeight: activeTab === tab.key ? 800 : 500, color: activeTab === tab.key ? accentColor : C.muted, borderBottom: activeTab === tab.key ? `3px solid ${accentColor}` : "3px solid transparent", whiteSpace: "nowrap", transition: "all 0.15s" }}>
                {tab.label}
                {count != null && count > 0 && (
                  <span style={{ marginLeft: 5, fontSize: 9, fontWeight: 700, background: activeTab === tab.key ? accentColor : "#f1f5f9", color: activeTab === tab.key ? "#fff" : C.muted, padding: "1px 5px", borderRadius: 8 }}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab content */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "28px clamp(16px,4vw,40px) 80px" }}>

        {/* ── SPECIFICATIONS ── */}
        {activeTab === "specs" && (
          <div>
            <div style={{ fontSize: 16, fontWeight: 800, color: C.text, marginBottom: 16 }}>Specifications</div>
            <div style={{ background: "#fff", borderRadius: 12, border: `1px solid ${C.border}`, overflow: "hidden" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <tbody>
                  {Object.entries(specs).map(([key, value]) => {
                    if (!value || value === "") return null;
                    const label = SPEC_LABELS[key] || key.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
                    const isNote = key === "notes";
                    return (
                      <tr key={key} style={{ borderBottom: `1px solid ${C.border}` }}>
                        <td style={{ padding: "12px 18px", fontSize: 12, fontWeight: 700, color: C.navyMid, background: "#f8fafc", width: "35%", borderRight: `1px solid ${C.border}` }}>
                          {label}
                        </td>
                        <td style={{ padding: "12px 18px", fontSize: 12, color: isNote ? "#92400e" : C.text, background: isNote ? "#fffbeb" : "#fff" }}>
                          {String(value)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Features */}
            {product.features?.length > 0 && (
              <div style={{ marginTop: 24 }}>
                <div style={{ fontSize: 14, fontWeight: 800, color: C.text, marginBottom: 12 }}>Key Features</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 10 }}>
                  {product.features.map(f => (
                    <div key={f} style={{ background: "#fff", border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 14px", display: "flex", gap: 8, alignItems: "flex-start" }}>
                      <span style={{ color: accentColor, fontWeight: 900, flexShrink: 0 }}>✓</span>
                      <span style={{ fontSize: 12, color: C.text }}>{f}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── RELATED PINS ── */}
        {activeTab === "pins" && (
          <div>
            <div style={{ fontSize: 16, fontWeight: 800, color: C.text, marginBottom: 16 }}>Related Pins & Connecting Links</div>
            {(!product.related_pins || product.related_pins.length === 0) ? (
              <EmptyTab message="No related pins listed. Contact Uniking for connecting link recommendations." />
            ) : (
              <div style={{ display: "grid", gap: 12 }}>
                {product.related_pins.map((pin, i) => (
                  <ComponentRow
                    key={i} item={pin} type="Connecting Link / Pin"
                    accentColor={accentColor}
                    added={rfqAdded[pin.code || pin.name]}
                    onAddRFQ={() => addToRFQ(pin, "Connecting Link")}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── RELATED SPROCKETS ── */}
        {activeTab === "sprockets" && (
          <div>
            <div style={{ fontSize: 16, fontWeight: 800, color: C.text, marginBottom: 16 }}>Related Sprockets</div>
            {(!product.related_sprockets || product.related_sprockets.length === 0) ? (
              <EmptyTab message="No related sprockets listed. Contact Uniking for sprocket recommendations." />
            ) : (
              <div style={{ display: "grid", gap: 12 }}>
                {product.related_sprockets.map((spr, i) => (
                  <ComponentRow
                    key={i} item={spr} type="Sprocket"
                    accentColor={accentColor}
                    added={rfqAdded[spr.code || spr.name]}
                    onAddRFQ={() => addToRFQ(spr, "Sprocket")}
                    extra={spr.teeth ? `${spr.teeth} teeth` : null}
                    extra2={spr.bore ? `Bore: ${spr.bore}` : null}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── RELATED ATTACHMENTS ── */}
        {activeTab === "attachments" && (
          <div>
            <div style={{ fontSize: 16, fontWeight: 800, color: C.text, marginBottom: 16 }}>Related Attachments</div>
            {(!product.related_attachments || product.related_attachments.length === 0) ? (
              <EmptyTab message="No standard attachments listed for this chain. Contact Uniking for custom attachment options." />
            ) : (
              <div style={{ display: "grid", gap: 12 }}>
                {product.related_attachments.map((att, i) => (
                  <ComponentRow
                    key={i} item={att} type="Attachment"
                    accentColor={accentColor}
                    added={rfqAdded[att.code || att.name]}
                    onAddRFQ={() => addToRFQ(att, "Attachment")}
                    extra={att.type}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── OPTIONS ── */}
        {activeTab === "options" && (
          <div>
            <div style={{ fontSize: 16, fontWeight: 800, color: C.text, marginBottom: 16 }}>Options / Add-Ons</div>
            {(!product.options || product.options.length === 0) ? (
              <EmptyTab message="No standard options listed. Contact Uniking for custom options." />
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px,1fr))", gap: 12 }}>
                {product.options.map((opt, i) => (
                  <div key={i} style={{ background: "#fff", border: `1px solid ${C.border}`, borderRadius: 10, padding: "14px 18px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: C.text }}>{opt}</div>
                      <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>Option for {product.chain_number}</div>
                    </div>
                    <button
                      onClick={() => addToRFQ({ code: `${product.chain_number}-OPT-${i}`, name: `${product.chain_number} — ${opt}` }, "Option")}
                      style={{ background: rfqAdded[`${product.chain_number}-OPT-${i}`] ? "#16a34a" : accentColor, color: "#fff", border: "none", borderRadius: 7, padding: "7px 14px", cursor: "pointer", fontSize: 11, fontWeight: 700, flexShrink: 0, whiteSpace: "nowrap", transition: "background 0.2s" }}>
                      {rfqAdded[`${product.chain_number}-OPT-${i}`] ? "✓" : "+ RFQ"}
                    </button>
                  </div>
                ))}
              </div>
            )}
            <div style={{ marginTop: 20, background: "#f0f9ff", border: "1px solid #bae6fd", borderRadius: 10, padding: "12px 16px", fontSize: 11, color: "#0369a1" }}>
              ℹ Options listed are sourced from official MAC Chain and Allied-Locke catalogs. Not all options are available for all sizes. Contact Uniking to confirm availability.
            </div>
          </div>
        )}

        {/* ── SOURCE DATA ── */}
        {activeTab === "source" && (
          <div>
            <div style={{ fontSize: 16, fontWeight: 800, color: C.text, marginBottom: 16 }}>Source Data</div>
            <div style={{ background: "#fff", borderRadius: 12, border: `1px solid ${C.border}`, padding: "20px 24px" }}>
              <div style={{ display: "grid", gap: 14 }}>
                <Row label="Chain Number" value={product.chain_number} />
                <Row label="Part Number" value={product.part_number} />
                <Row label="Product Type" value={product.product_type} />
                <Row label="Category" value={product.category} />
                <Row label="Subcategory" value={product.subcategory} />
                <Row label="Data Source" value={product.source} />
                {product.source_url && (
                  <div style={{ display: "flex", gap: 16, borderBottom: `1px solid ${C.border}`, paddingBottom: 12 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: C.navyMid, minWidth: 160 }}>Source URL</div>
                    <a href={product.source_url} target="_blank" rel="noreferrer" style={{ fontSize: 12, color: "#0369a1", textDecoration: "underline" }}>
                      {product.source_url}
                    </a>
                  </div>
                )}
                {product.notes && (
                  <Row label="Notes" value={product.notes} isNote />
                )}
              </div>
            </div>
            <div style={{ marginTop: 16, background: "#fffbeb", borderRadius: 10, border: "1px solid #fde68a", padding: "12px 16px", fontSize: 11, color: "#92400e" }}>
              ⚠ All specifications are sourced from MAC Chain and Allied-Locke Industries. Specifications marked "to be confirmed" require verification with Uniking before procurement.
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

function Row({ label, value, isNote }) {
  return (
    <div style={{ display: "flex", gap: 16, borderBottom: `1px solid #f1f5f9`, paddingBottom: 12 }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: "#1A3A5C", minWidth: 160 }}>{label}</div>
      <div style={{ fontSize: 12, color: isNote ? "#92400e" : "#0f172a", background: isNote ? "#fffbeb" : "transparent", borderRadius: 4, padding: isNote ? "2px 8px" : 0 }}>
        {value || "—"}
      </div>
    </div>
  );
}

function ComponentRow({ item, type, accentColor, added, onAddRFQ, extra, extra2 }) {
  const C2 = { border: "#e2e8f0", muted: "#64748b", text: "#0f172a", navyMid: "#1A3A5C" };
  const toConfirm = (item.notes || item.description || "").toLowerCase().includes("confirm");
  return (
    <div style={{ background: "#fff", border: `1px solid ${C2.border}`, borderRadius: 10, padding: "14px 18px", display: "flex", gap: 14, alignItems: "flex-start" }}>
      {item.image && (
        <div style={{ width: 54, height: 44, borderRadius: 7, overflow: "hidden", background: "#f1f5f9", flexShrink: 0 }}>
          <img src={item.image} alt={item.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </div>
      )}
      <div style={{ flex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 4 }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: C2.text }}>{item.code && item.code !== item.name ? item.code : item.name}</div>
          <span style={{ fontSize: 9, fontWeight: 700, background: `${accentColor}15`, color: accentColor, padding: "1px 6px", borderRadius: 6 }}>{type}</span>
          {extra && <span style={{ fontSize: 10, color: C2.muted }}>{extra}</span>}
          {extra2 && <span style={{ fontSize: 10, color: C2.muted }}>·  {extra2}</span>}
          {toConfirm && <span style={{ fontSize: 9, fontWeight: 700, background: "#fef3c7", color: "#92400e", padding: "1px 6px", borderRadius: 6 }}>Confirm with Uniking</span>}
        </div>
        {item.name && item.name !== item.code && <div style={{ fontSize: 11, color: C2.muted, marginBottom: 3 }}>{item.name}</div>}
        {item.description && <div style={{ fontSize: 11, color: C2.muted }}>{item.description}</div>}
        {item.notes && <div style={{ fontSize: 10, color: "#b45309", marginTop: 3 }}>{item.notes}</div>}
      </div>
      <button onClick={onAddRFQ}
        style={{ background: added ? "#16a34a" : accentColor, color: "#fff", border: "none", borderRadius: 8, padding: "8px 14px", cursor: "pointer", fontSize: 11, fontWeight: 700, flexShrink: 0, transition: "background 0.2s" }}>
        {added ? "✓" : "+ RFQ"}
      </button>
    </div>
  );
}

function EmptyTab({ message }) {
  return (
    <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0", padding: "36px", textAlign: "center", color: "#64748b" }}>
      <div style={{ fontSize: 28, marginBottom: 10 }}>📋</div>
      <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 4 }}>No data available</div>
      <div style={{ fontSize: 12 }}>{message}</div>
    </div>
  );
}