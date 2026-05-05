/**
 * ChainConfigurator.jsx
 * Step-by-step chain configurator.
 * Adapts to chain family and number. Outputs an RFQ line item.
 */
import { useState } from "react";
import { CHAIN_FAMILIES, MATERIAL_OPTIONS, LENGTH_UNITS, ATTACHMENT_SPACINGS, PERFORMANCE_TIERS } from "@/lib/chainFamilyData";
import { CHAIN_PRODUCTS } from "@/lib/chainCatalogData";

const C = {
  navy: "#003c5b", navyMid: "#1A3A5C",
  border: "#e2e8f0", bg: "#f8fafc", card: "#ffffff",
  text: "#0f172a", muted: "#64748b", slate: "#334155",
  green: "#16a34a", greenBg: "#f0fdf4",
  blue: "#2563eb", blueBg: "#eff6ff",
  gold: "#C9A84C",
};

function StepHeader({ number, title, subtitle }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
        <div style={{ width: 28, height: 28, borderRadius: "50%", background: C.navyMid, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 800, flexShrink: 0 }}>
          {number}
        </div>
        <div style={{ fontSize: 15, fontWeight: 800, color: C.text }}>{title}</div>
      </div>
      {subtitle && <div style={{ fontSize: 12, color: C.muted, marginLeft: 38 }}>{subtitle}</div>}
    </div>
  );
}

function SelectGrid({ options, value, onChange, renderItem }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 8 }}>
      {options.map((opt, i) => {
        const key = typeof opt === "string" ? opt : opt.key || opt.chain_number || opt.id;
        const label = typeof opt === "string" ? opt : opt.label || opt.display_name || opt.chain_number || opt.part_number;
        const isSelected = value === key;
        return (
          <div key={i} onClick={() => onChange(key, opt)}
            style={{ padding: "10px 12px", borderRadius: 8, border: "2px solid " + (isSelected ? C.navyMid : C.border), background: isSelected ? C.navyMid : C.card, cursor: "pointer", transition: "all 0.15s" }}>
            {renderItem ? renderItem(opt, isSelected) : (
              <div style={{ fontSize: 13, fontWeight: 700, color: isSelected ? "#fff" : C.text }}>{label}</div>
            )}
          </div>
        );
      })}
    </div>
  );
}

const INITIAL_STATE = {
  step: 1,
  family: null, familyObj: null,
  chain_number: null, chainObj: null,
  application: "",
  material: null,
  construction_options: [],
  length: "",
  length_unit: "ft",
  quantity: 1,
  need_attachments: null,
  selected_attachments: [],
  attachment_spacing: "",
  need_pins: null,
  selected_pins: [],
  need_sprockets: null,
  selected_sprockets: [],
  uploads: [],
  notes: "",
  performance_tier: "standard",
  preferred_brand: "",
  open_to_equivalent: true,
};

function addToRFQCart(item) {
  try {
    const cart = JSON.parse(localStorage.getItem("uniking_rfq_cart") || "[]");
    cart.push({ cartId: "cfg_" + Date.now(), ...item, quantity: item.quantity || 1, unit: item.length_unit || "ft" });
    localStorage.setItem("uniking_rfq_cart", JSON.stringify(cart));
    window.dispatchEvent(new Event("rfq_cart_updated"));
  } catch (e) {}
}

export default function ChainConfigurator({ onClose, initialFamily, initialChain }) {
  const [state, setState] = useState({
    ...INITIAL_STATE,
    family: initialFamily || null,
    familyObj: initialFamily ? CHAIN_FAMILIES.find(f => f.key === initialFamily) : null,
    chain_number: initialChain?.chain_number || null,
    chainObj: initialChain || null,
    step: initialChain ? 3 : initialFamily ? 2 : 1,
  });
  const [submitted, setSubmitted] = useState(false);

  function set(key, val) {
    setState(prev => ({ ...prev, [key]: val }));
  }

  function next() { setState(prev => ({ ...prev, step: prev.step + 1 })); }
  function back() { setState(prev => ({ ...prev, step: Math.max(1, prev.step - 1) })); }

  // Chain numbers for selected family
  const familyChains = state.family
    ? CHAIN_PRODUCTS.filter(p => {
        const fam = CHAIN_FAMILIES.find(f => f.key === state.family);
        if (!fam) return false;
        if (p.category !== fam.catalog_key) return false;
        if (fam.subcategory_filter?.length && !fam.subcategory_filter.includes(p.subcategory)) return false;
        return true;
      })
    : [];

  const chainAttachments = state.chainObj?.related_attachments || [];
  const chainPins = state.chainObj?.related_pins || [];
  const chainSprockets = state.chainObj?.related_sprockets || [];

  function buildRFQLine() {
    const parts = [
      state.chainObj?.display_name || state.chain_number || "Chain",
      state.familyObj?.label,
      state.material ? (MATERIAL_OPTIONS.find(m => m.key === state.material)?.label) : null,
      state.selected_attachments.length ? state.selected_attachments.map(a => a.code || a).join(", ") + " Attachments" : null,
      state.attachment_spacing ? "@ " + state.attachment_spacing : null,
      state.length ? state.length + " " + state.length_unit : null,
      "Qty " + state.quantity,
    ].filter(Boolean);
    return parts.join(" – ");
  }

  function handleSubmit() {
    const rfqLine = buildRFQLine();
    addToRFQCart({
      id: "cfg_" + (state.chain_number || "chain") + "_" + Date.now(),
      _source: "configurator",
      series: rfqLine,
      type: state.familyObj?.label || "Chain",
      style: state.chain_number || "",
      category: state.family || "",
      image_url: state.chainObj?.image || "",
      materials: state.material || "",
      application: state.application || "",
      quantity: state.quantity,
      unit: state.length_unit,
      notes: [
        state.notes,
        state.performance_tier !== "standard" ? "Performance tier: " + PERFORMANCE_TIERS.find(t => t.key === state.performance_tier)?.label : null,
        state.preferred_brand ? "Preferred brand: " + state.preferred_brand : null,
        state.open_to_equivalent ? "Open to equivalent" : "Specified brand only",
        state.selected_pins.length ? "Pins/Links: " + state.selected_pins.map(p => p.code || p).join(", ") : null,
        state.selected_sprockets.length ? "Sprockets: " + state.selected_sprockets.map(s => s.code || s).join(", ") : null,
        state.need_attachments === false ? "No attachments required" : null,
        state.need_pins === false ? "No pins/links required" : null,
        state.need_sprockets === false ? "No sprockets required" : null,
      ].filter(Boolean).join(" | "),
    });
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div style={{ padding: "32px 24px", textAlign: "center" }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>✅</div>
        <div style={{ fontSize: 20, fontWeight: 800, color: C.text, marginBottom: 8 }}>Added to RFQ</div>
        <div style={{ fontSize: 13, color: C.muted, marginBottom: 6, lineHeight: 1.6, maxWidth: 500, margin: "0 auto 20px" }}>
          {buildRFQLine()}
        </div>
        <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
          <button onClick={() => { window.dispatchEvent(new CustomEvent("uniking_go_rfq")); if (onClose) onClose(); }}
            style={{ padding: "10px 22px", background: C.navyMid, color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 700, fontSize: 13 }}>
            View RFQ Cart
          </button>
          <button onClick={() => { setState(INITIAL_STATE); setSubmitted(false); }}
            style={{ padding: "10px 22px", background: C.bg, color: C.text, border: "1px solid " + C.border, borderRadius: 8, cursor: "pointer", fontWeight: 700, fontSize: 13 }}>
            Configure Another
          </button>
          {onClose && <button onClick={onClose} style={{ padding: "10px 22px", background: C.bg, color: C.muted, border: "1px solid " + C.border, borderRadius: 8, cursor: "pointer", fontSize: 13 }}>Close</button>}
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 760, margin: "0 auto" }}>
      {/* Progress bar */}
      <div style={{ display: "flex", gap: 4, marginBottom: 24 }}>
        {[1,2,3,4,5,6].map(n => (
          <div key={n} style={{ flex: 1, height: 4, borderRadius: 4, background: n <= state.step ? C.navyMid : C.border, transition: "background 0.2s" }} />
        ))}
      </div>

      {/* STEP 1 — Family */}
      {state.step === 1 && (
        <div>
          <StepHeader number={1} title="Select Chain Family" subtitle="Browse by application type, not brand" />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 8, marginBottom: 20 }}>
            {CHAIN_FAMILIES.map(fam => (
              <div key={fam.key} onClick={() => { set("family", fam.key); set("familyObj", fam); set("chain_number", null); set("chainObj", null); setState(prev => ({ ...prev, family: fam.key, familyObj: fam, chain_number: null, chainObj: null, step: 2 })); }}
                style={{ padding: "12px 14px", borderRadius: 8, border: "2px solid " + C.border, background: C.card, cursor: "pointer", transition: "all 0.15s" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = C.navyMid; e.currentTarget.style.background = "#f0f4f8"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.background = C.card; }}>
                <div style={{ fontSize: 18, marginBottom: 4 }}>{fam.icon}</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 3 }}>{fam.label}</div>
                <div style={{ fontSize: 11, color: C.muted }}>{fam.pitch_range}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* STEP 2 — Chain number */}
      {state.step === 2 && (
        <div>
          <StepHeader number={2} title="Select Chain Number" subtitle={state.familyObj?.label} />
          {familyChains.length > 0 ? (
            <div>
              <div style={{ display: "flex", marginBottom: 16 }}>
                <input placeholder="Search chain number or description..." onChange={e => set("_search", e.target.value)}
                  style={{ flex: 1, padding: "8px 12px", border: "1px solid " + C.border, borderRadius: 6, fontSize: 13, outline: "none" }} />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 380, overflowY: "auto", paddingRight: 4 }}>
                {familyChains
                  .filter(p => !state._search || [p.chain_number, p.part_number, p.product_type, p.description].some(v => v?.toLowerCase().includes(state._search?.toLowerCase())))
                  .map(p => (
                    <div key={p.id} onClick={() => { setState(prev => ({ ...prev, chain_number: p.chain_number, chainObj: p, step: 3 })); }}
                      style={{ padding: "10px 14px", borderRadius: 8, border: "2px solid " + (state.chain_number === p.chain_number ? C.navyMid : C.border), background: state.chain_number === p.chain_number ? "#f0f4f8" : C.card, cursor: "pointer", display: "flex", alignItems: "center", gap: 12 }}>
                      {p.image && <img src={p.image} alt={p.part_number} style={{ width: 40, height: 32, objectFit: "contain", flexShrink: 0 }} onError={e => e.target.style.display = "none"} />}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 700, fontSize: 13, color: C.text }}>{p.chain_number || p.part_number}</div>
                        <div style={{ fontSize: 12, color: C.muted }}>{p.product_type} {p.specs?.pitch_in ? "· " + p.specs.pitch_in + "\" pitch" : ""}</div>
                      </div>
                      <div style={{ fontSize: 11, color: C.muted, whiteSpace: "nowrap" }}>Select →</div>
                    </div>
                  ))}
              </div>
            </div>
          ) : (
            <div style={{ padding: "24px", background: C.bg, borderRadius: 8, border: "1px solid " + C.border, textAlign: "center" }}>
              <div style={{ fontSize: 13, color: C.muted, marginBottom: 12 }}>
                No chain numbers on file for this family yet. Add your requirement in the notes below.
              </div>
              <input placeholder="Describe your chain requirement..." value={state.notes} onChange={e => set("notes", e.target.value)}
                style={{ width: "100%", padding: "8px 12px", border: "1px solid " + C.border, borderRadius: 6, fontSize: 13, outline: "none", boxSizing: "border-box" }} />
            </div>
          )}
          <div style={{ marginTop: 16, display: "flex", gap: 8 }}>
            <button onClick={back} style={{ padding: "9px 18px", background: C.bg, color: C.text, border: "1px solid " + C.border, borderRadius: 7, cursor: "pointer", fontWeight: 600, fontSize: 13 }}>← Back</button>
            {(state.chain_number || state.notes) && familyChains.length === 0 && (
              <button onClick={next} style={{ padding: "9px 18px", background: C.navyMid, color: "#fff", border: "none", borderRadius: 7, cursor: "pointer", fontWeight: 700, fontSize: 13 }}>Next →</button>
            )}
          </div>
        </div>
      )}

      {/* STEP 3 — Application + Material + Performance */}
      {state.step === 3 && (
        <div>
          <StepHeader number={3} title="Application & Material" subtitle={state.chain_number ? "Chain: " + state.chain_number : ""} />
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.8px", color: C.muted, display: "block", marginBottom: 6 }}>Application / Industry</label>
              <input value={state.application} onChange={e => set("application", e.target.value)} placeholder="e.g. Grain conveying, automotive assembly, mining drag..."
                style={{ width: "100%", padding: "8px 12px", border: "1px solid " + C.border, borderRadius: 6, fontSize: 13, outline: "none", boxSizing: "border-box" }} />
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.8px", color: C.muted, display: "block", marginBottom: 8 }}>Material / Coating</label>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 6 }}>
                {MATERIAL_OPTIONS.map(m => (
                  <div key={m.key} onClick={() => set("material", m.key)}
                    style={{ padding: "8px 12px", borderRadius: 6, border: "2px solid " + (state.material === m.key ? C.navyMid : C.border), background: state.material === m.key ? C.navyMid : C.card, cursor: "pointer", transition: "all 0.15s" }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: state.material === m.key ? "#fff" : C.text }}>{m.label}</div>
                    <div style={{ fontSize: 10, color: state.material === m.key ? "rgba(255,255,255,0.65)" : C.muted }}>{m.note}</div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.8px", color: C.muted, display: "block", marginBottom: 8 }}>Performance Tier</label>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {PERFORMANCE_TIERS.map(t => (
                  <div key={t.key} onClick={() => set("performance_tier", t.key)}
                    style={{ padding: "8px 14px", borderRadius: 6, border: "2px solid " + (state.performance_tier === t.key ? t.color : C.border), background: state.performance_tier === t.key ? t.color + "18" : C.card, cursor: "pointer" }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: t.color }}>{t.label}</div>
                    <div style={{ fontSize: 10, color: C.muted }}>{t.description}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div style={{ marginTop: 20, display: "flex", gap: 8 }}>
            <button onClick={back} style={{ padding: "9px 18px", background: C.bg, color: C.text, border: "1px solid " + C.border, borderRadius: 7, cursor: "pointer", fontWeight: 600, fontSize: 13 }}>← Back</button>
            <button onClick={next} style={{ padding: "9px 18px", background: C.navyMid, color: "#fff", border: "none", borderRadius: 7, cursor: "pointer", fontWeight: 700, fontSize: 13 }}>Next →</button>
          </div>
        </div>
      )}

      {/* STEP 4 — Quantity + Length */}
      {state.step === 4 && (
        <div>
          <StepHeader number={4} title="Length & Quantity" />
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ display: "flex", gap: 10, alignItems: "flex-end", flexWrap: "wrap" }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.8px", color: C.muted, display: "block", marginBottom: 6 }}>Length Required</label>
                <input type="number" min="0" value={state.length} onChange={e => set("length", e.target.value)} placeholder="e.g. 20"
                  style={{ width: 120, padding: "8px 12px", border: "1px solid " + C.border, borderRadius: 6, fontSize: 14, fontWeight: 700, outline: "none" }} />
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.8px", color: C.muted, display: "block", marginBottom: 6 }}>Unit</label>
                <select value={state.length_unit} onChange={e => set("length_unit", e.target.value)}
                  style={{ padding: "9px 10px", border: "1px solid " + C.border, borderRadius: 6, fontSize: 13, outline: "none" }}>
                  {LENGTH_UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.8px", color: C.muted, display: "block", marginBottom: 6 }}>Quantity</label>
                <input type="number" min="1" value={state.quantity} onChange={e => set("quantity", parseInt(e.target.value) || 1)}
                  style={{ width: 80, padding: "8px 12px", border: "1px solid " + C.border, borderRadius: 6, fontSize: 14, fontWeight: 700, outline: "none" }} />
              </div>
            </div>
          </div>
          <div style={{ marginTop: 20, display: "flex", gap: 8 }}>
            <button onClick={back} style={{ padding: "9px 18px", background: C.bg, color: C.text, border: "1px solid " + C.border, borderRadius: 7, cursor: "pointer", fontWeight: 600, fontSize: 13 }}>← Back</button>
            <button onClick={next} style={{ padding: "9px 18px", background: C.navyMid, color: "#fff", border: "none", borderRadius: 7, cursor: "pointer", fontWeight: 700, fontSize: 13 }}>Next →</button>
          </div>
        </div>
      )}

      {/* STEP 5 — Components (Attachments, Pins, Sprockets) */}
      {state.step === 5 && (
        <div>
          <StepHeader number={5} title="Components & Accessories" />
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

            {/* Attachments */}
            <div>
              <div style={{ fontWeight: 700, fontSize: 13, color: C.text, marginBottom: 8 }}>Are attachments required?</div>
              <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                {["Yes","No","Unknown / Ask Uniking"].map(opt => (
                  <button key={opt} onClick={() => set("need_attachments", opt === "Yes" ? true : opt === "No" ? false : null)}
                    style={{ padding: "7px 14px", borderRadius: 6, border: "2px solid " + (state.need_attachments === (opt === "Yes" ? true : opt === "No" ? false : null) ? C.navyMid : C.border), background: C.card, cursor: "pointer", fontSize: 12, fontWeight: 700, color: C.text }}>
                    {opt}
                  </button>
                ))}
              </div>
              {state.need_attachments === true && (
                <div style={{ background: C.bg, border: "1px solid " + C.border, borderRadius: 8, padding: 12 }}>
                  {chainAttachments.length > 0 ? (
                    <div>
                      <div style={{ fontSize: 11, color: C.muted, marginBottom: 8 }}>Source-confirmed attachments only:</div>
                      {chainAttachments.map((att, i) => (
                        <label key={i} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, cursor: "pointer" }}>
                          <input type="checkbox" checked={state.selected_attachments.some(a => (a.code || a) === (att.code || att.name))}
                            onChange={e => {
                              if (e.target.checked) set("selected_attachments", [...state.selected_attachments, att]);
                              else set("selected_attachments", state.selected_attachments.filter(a => (a.code || a) !== (att.code || att.name)));
                            }} />
                          <span style={{ fontSize: 12, color: C.text }}>{att.code || att.name} — {att.type || att.description}</span>
                        </label>
                      ))}
                    </div>
                  ) : (
                    <div style={{ fontSize: 12, color: C.muted }}>No confirmed attachments on file. Describe in notes below.</div>
                  )}
                  {state.selected_attachments.length > 0 && (
                    <div style={{ marginTop: 10 }}>
                      <label style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.8px", color: C.muted, display: "block", marginBottom: 6 }}>Attachment Spacing</label>
                      <select value={state.attachment_spacing} onChange={e => set("attachment_spacing", e.target.value)}
                        style={{ padding: "7px 10px", border: "1px solid " + C.border, borderRadius: 6, fontSize: 12, outline: "none" }}>
                        <option value="">Select spacing...</option>
                        {ATTACHMENT_SPACINGS.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Pins / Links */}
            <div>
              <div style={{ fontWeight: 700, fontSize: 13, color: C.text, marginBottom: 8 }}>Connecting links / pins required?</div>
              <div style={{ display: "flex", gap: 8 }}>
                {["Yes","No","Unknown"].map(opt => (
                  <button key={opt} onClick={() => set("need_pins", opt === "Yes" ? true : opt === "No" ? false : null)}
                    style={{ padding: "7px 14px", borderRadius: 6, border: "2px solid " + (state.need_pins === (opt === "Yes" ? true : opt === "No" ? false : null) ? C.navyMid : C.border), background: C.card, cursor: "pointer", fontSize: 12, fontWeight: 700, color: C.text }}>
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            {/* Sprockets */}
            <div>
              <div style={{ fontWeight: 700, fontSize: 13, color: C.text, marginBottom: 8 }}>Sprockets required?</div>
              <div style={{ display: "flex", gap: 8 }}>
                {["Yes","No","Unknown"].map(opt => (
                  <button key={opt} onClick={() => set("need_sprockets", opt === "Yes" ? true : opt === "No" ? false : null)}
                    style={{ padding: "7px 14px", borderRadius: 6, border: "2px solid " + (state.need_sprockets === (opt === "Yes" ? true : opt === "No" ? false : null) ? C.navyMid : C.border), background: C.card, cursor: "pointer", fontSize: 12, fontWeight: 700, color: C.text }}>
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div style={{ marginTop: 20, display: "flex", gap: 8 }}>
            <button onClick={back} style={{ padding: "9px 18px", background: C.bg, color: C.text, border: "1px solid " + C.border, borderRadius: 7, cursor: "pointer", fontWeight: 600, fontSize: 13 }}>← Back</button>
            <button onClick={next} style={{ padding: "9px 18px", background: C.navyMid, color: "#fff", border: "none", borderRadius: 7, cursor: "pointer", fontWeight: 700, fontSize: 13 }}>Next →</button>
          </div>
        </div>
      )}

      {/* STEP 6 — Review & Notes */}
      {state.step === 6 && (
        <div>
          <StepHeader number={6} title="Review & Submit" subtitle="Confirm your configuration before adding to RFQ" />

          {/* Summary */}
          <div style={{ background: C.bg, border: "1px solid " + C.border, borderRadius: 8, padding: 16, marginBottom: 16 }}>
            <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", color: C.muted, marginBottom: 8 }}>RFQ Line Item</div>
            <div style={{ fontSize: 15, fontWeight: 800, color: C.text, lineHeight: 1.5 }}>{buildRFQLine()}</div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.8px", color: C.muted, display: "block", marginBottom: 6 }}>Preferred Manufacturer (optional)</label>
              <input value={state.preferred_brand} onChange={e => set("preferred_brand", e.target.value)} placeholder="e.g. Allied-Locke, Tsubaki, Peer, or leave blank"
                style={{ width: "100%", padding: "8px 12px", border: "1px solid " + C.border, borderRadius: 6, fontSize: 13, outline: "none", boxSizing: "border-box" }} />
            </div>
            <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
              <input type="checkbox" checked={state.open_to_equivalent} onChange={e => set("open_to_equivalent", e.target.checked)} />
              <span style={{ fontSize: 13, color: C.text }}>Open to equivalent / substitute if specified brand is unavailable</span>
            </label>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.8px", color: C.muted, display: "block", marginBottom: 6 }}>Additional Notes / Drawings</label>
              <textarea value={state.notes} onChange={e => set("notes", e.target.value)} rows={4}
                placeholder="Describe any special requirements, existing chain details, operating conditions, or attach drawing references..."
                style={{ width: "100%", padding: "8px 12px", border: "1px solid " + C.border, borderRadius: 6, fontSize: 13, outline: "none", resize: "vertical", boxSizing: "border-box" }} />
            </div>
          </div>

          <div style={{ marginTop: 20, display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button onClick={back} style={{ padding: "9px 18px", background: C.bg, color: C.text, border: "1px solid " + C.border, borderRadius: 7, cursor: "pointer", fontWeight: 600, fontSize: 13 }}>← Back</button>
            <button onClick={handleSubmit}
              style={{ padding: "11px 28px", background: C.green, color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 800, fontSize: 14, letterSpacing: "0.02em" }}>
              ✓ Add to RFQ
            </button>
          </div>
        </div>
      )}
    </div>
  );
}