/**
 * TTCRFQModal — Multi-step RFQ for Table Top Chains
 * Steps: 1) Material → 2) Width → 3) Length (10ft boxes) → 4) Preferred Brand
 */
import { useState } from "react";
import { MATERIALS, getMaterialsForProduct, WIDTH_DIMENSIONS } from "@/lib/tableTopChainData";

const C = {
  navy: "#0C2340", navyMid: "#1A3A5C", gold: "#C9A84C",
  border: "#e2e8f0", muted: "#64748b", bg: "#f8fafc", text: "#0f172a",
  plastic: "#0057A8", steel: "#374151", green: "#16a34a",
};

const PREFERRED_BRANDS = [
  "No Preference", "Movex", "System Plast", "Rexnord / Regal", "Intralox", "Habasit", "Other",
];

function StepIndicator({ step }) {
  const steps = ["Material", "Width", "Length", "Brand"];
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 0, marginBottom: 20 }}>
      {steps.map((label, i) => {
        const num = i + 1;
        const isActive = step === num;
        const isDone = step > num;
        return (
          <div key={i} style={{ display: "flex", alignItems: "center", flex: i < steps.length - 1 ? 1 : "none" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
              <div style={{
                width: 26, height: 26, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                background: isDone ? C.green : isActive ? C.navyMid : "#e2e8f0",
                color: isDone || isActive ? "#fff" : C.muted,
                fontSize: 11, fontWeight: 800,
              }}>
                {isDone ? "✓" : num}
              </div>
              <span style={{ fontSize: 9, fontWeight: 700, color: isActive ? C.navyMid : C.muted, whiteSpace: "nowrap" }}>{label}</span>
            </div>
            {i < steps.length - 1 && (
              <div style={{ flex: 1, height: 2, background: isDone ? C.green : "#e2e8f0", margin: "0 4px", marginBottom: 16 }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function TTCRFQModal({ product, initialWidth, onConfirm, onClose }) {
  const materials = getMaterialsForProduct(product);
  const isSteelCat = product.category === "STEEL";
  const accentColor = isSteelCat ? C.steel : C.plastic;

  const [step, setStep] = useState(1);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [selectedWidth, setSelectedWidth] = useState(initialWidth || null);
  const [boxes, setBoxes] = useState(1);   // each box = 10 ft
  const [preferredBrand, setPreferredBrand] = useState("No Preference");
  const [brandNotes, setBrandNotes] = useState("");

  const totalFt = boxes * 10;

  function handleConfirm() {
    const matLabel = selectedMaterial ? selectedMaterial.name : "TBD";
    const rfqLabel = `${product.name} — ${matLabel} — ${selectedWidth || "Width TBD"} — ${totalFt} ft (${boxes} box${boxes > 1 ? "es" : ""})`;
    const cartItem = {
      cartId: `ttc_${product.id}_${selectedMaterial?.id || "mat"}_${Date.now()}`,
      id: `ttc_${product.id}_${selectedMaterial?.id || "mat"}`,
      _source: "tabletop_chain",
      name: rfqLabel,
      series: product.name,
      type: `Table Top Chain — ${isSteelCat ? "Steel" : "Plastic"}`,
      category: product.type,
      materials: matLabel,
      quantity: boxes,
      unit: "Boxes (10 ft each)",
      notes: [
        selectedWidth ? `Width: ${selectedWidth}` : "",
        `Length: ${totalFt} ft (${boxes} × 10 ft box${boxes > 1 ? "es" : ""})`,
        preferredBrand !== "No Preference" ? `Preferred brand: ${preferredBrand}` : "",
        brandNotes ? `Brand notes: ${brandNotes}` : "",
      ].filter(Boolean).join(" | "),
      image_url: product.image,
    };
    onConfirm(cartItem);
  }

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(10,20,40,0.65)", zIndex: 1000,
      display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
    }}>
      <div style={{
        background: "#fff", borderRadius: 16, padding: "28px", maxWidth: 500, width: "100%",
        boxShadow: "0 24px 80px rgba(0,0,0,0.3)", maxHeight: "90vh", overflowY: "auto",
      }}>
        {/* Header */}
        <div style={{ marginBottom: 6 }}>
          <div style={{ fontSize: 17, fontWeight: 900, color: C.navyMid }}>Add to RFQ</div>
          <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>{product.name}</div>
        </div>
        <StepIndicator step={step} />

        {/* Step 1: Material */}
        {step === 1 && (
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: C.navyMid, marginBottom: 12 }}>Select Material</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {materials.map(mat => {
                const isSelected = selectedMaterial?.id === mat.id;
                return (
                  <button key={mat.id} onClick={() => setSelectedMaterial(mat)}
                    style={{
                      padding: "10px 14px", borderRadius: 9, cursor: "pointer", textAlign: "left",
                      border: `2px solid ${isSelected ? accentColor : C.border}`,
                      background: isSelected ? `${accentColor}0f` : "#fff",
                      transition: "all 0.12s",
                    }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <span style={{ fontSize: 13, fontWeight: 800, color: C.navyMid }}>{mat.name}</span>
                        {mat.badge && (
                          <span style={{ marginLeft: 7, fontSize: 9, fontWeight: 700, background: "#dbeafe", color: "#1d4ed8", padding: "1px 6px", borderRadius: 6 }}>{mat.badge}</span>
                        )}
                      </div>
                      {isSelected && <span style={{ color: C.green, fontSize: 16 }}>✓</span>}
                    </div>
                    <div style={{ fontSize: 10, color: C.muted, marginTop: 2 }}>{mat.tempRange}</div>
                  </button>
                );
              })}
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
              <button onClick={onClose} style={btnStyle("cancel")}>Cancel</button>
              <button onClick={() => setStep(2)} disabled={!selectedMaterial} style={btnStyle("next", !selectedMaterial)}>
                Next: Select Width →
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Width */}
        {step === 2 && (
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: C.navyMid, marginBottom: 12 }}>Select Width</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {product.widths.map(w => {
                const isSelected = selectedWidth === w;
                const dim = WIDTH_DIMENSIONS[w];
                return (
                  <button key={w} onClick={() => setSelectedWidth(w)}
                    style={{
                      padding: "8px 14px", borderRadius: 9, cursor: "pointer",
                      border: `2px solid ${isSelected ? accentColor : C.border}`,
                      background: isSelected ? `${accentColor}0f` : "#fff",
                      fontSize: 13, fontWeight: 800, color: isSelected ? accentColor : C.text,
                      transition: "all 0.12s", position: "relative",
                    }}>
                    {w}
                    {isSelected && dim && (
                      <div style={{ fontSize: 9, color: C.muted, fontWeight: 400, marginTop: 2 }}>
                        {dim.plateHeight} H · {dim.weightLbsFt} lbs/ft
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
            {selectedWidth && WIDTH_DIMENSIONS[selectedWidth] && (
              <div style={{ marginTop: 14, background: "#f0f7ff", borderRadius: 9, padding: "12px 14px", border: "1px solid #bfdbfe" }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: C.navyMid, marginBottom: 8, textTransform: "uppercase" }}>Dimensions — {selectedWidth}</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  {Object.entries({
                    "Overall Width": WIDTH_DIMENSIONS[selectedWidth].overallWidth,
                    "Inside Width": WIDTH_DIMENSIONS[selectedWidth].insideWidth,
                    "Plate Height": WIDTH_DIMENSIONS[selectedWidth].plateHeight,
                    "Weight": `${WIDTH_DIMENSIONS[selectedWidth].weightLbsFt} lbs/ft`,
                  }).map(([k, v]) => (
                    <div key={k} style={{ background: "#fff", borderRadius: 6, padding: "6px 10px", border: `1px solid ${C.border}` }}>
                      <div style={{ fontSize: 9, color: C.muted, fontWeight: 600 }}>{k}</div>
                      <div style={{ fontSize: 12, fontWeight: 800, color: C.navyMid }}>{v}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
              <button onClick={() => setStep(1)} style={btnStyle("back")}>← Back</button>
              <button onClick={() => setStep(3)} disabled={!selectedWidth} style={btnStyle("next", !selectedWidth)}>
                Next: Length →
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Length */}
        {step === 3 && (
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: C.navyMid, marginBottom: 4 }}>Select Length</div>
            <div style={{ fontSize: 11, color: C.muted, marginBottom: 14 }}>Chain is sold in <strong>10 ft boxes</strong>. Select the number of boxes needed.</div>

            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
              <button onClick={() => setBoxes(b => Math.max(1, b - 1))}
                style={{ width: 36, height: 36, borderRadius: 9, border: `1.5px solid ${C.border}`, background: "#f8fafc", fontSize: 20, cursor: "pointer", fontWeight: 700, color: C.navyMid }}>−</button>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 28, fontWeight: 900, color: C.navyMid }}>{boxes}</div>
                <div style={{ fontSize: 10, color: C.muted }}>box{boxes > 1 ? "es" : ""}</div>
              </div>
              <button onClick={() => setBoxes(b => b + 1)}
                style={{ width: 36, height: 36, borderRadius: 9, border: `1.5px solid ${C.border}`, background: "#f8fafc", fontSize: 20, cursor: "pointer", fontWeight: 700, color: C.navyMid }}>+</button>
              <div style={{ marginLeft: 8, background: "#f0f7ff", borderRadius: 9, padding: "10px 16px", border: "1px solid #bfdbfe" }}>
                <div style={{ fontSize: 18, fontWeight: 900, color: accentColor }}>{totalFt} ft</div>
                <div style={{ fontSize: 10, color: C.muted }}>total length</div>
              </div>
            </div>

            {/* Quick select presets */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 16 }}>
              {[1, 2, 5, 10, 20, 50].map(n => (
                <button key={n} onClick={() => setBoxes(n)}
                  style={{
                    padding: "4px 12px", borderRadius: 7, fontSize: 11, fontWeight: 700, cursor: "pointer",
                    border: `1.5px solid ${boxes === n ? accentColor : C.border}`,
                    background: boxes === n ? `${accentColor}15` : "#fff",
                    color: boxes === n ? accentColor : C.muted,
                  }}>
                  {n} box{n > 1 ? "es" : ""} ({n * 10} ft)
                </button>
              ))}
            </div>

            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => setStep(2)} style={btnStyle("back")}>← Back</button>
              <button onClick={() => setStep(4)} style={btnStyle("next")}>Next: Brand Preference →</button>
            </div>
          </div>
        )}

        {/* Step 4: Preferred Brand */}
        {step === 4 && (
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: C.navyMid, marginBottom: 4 }}>Preferred Brand</div>
            <div style={{ fontSize: 11, color: C.muted, marginBottom: 14 }}>Do you have a preferred manufacturer? We'll do our best to source accordingly.</div>

            <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginBottom: 14 }}>
              {PREFERRED_BRANDS.map(brand => (
                <button key={brand} onClick={() => setPreferredBrand(brand)}
                  style={{
                    padding: "7px 14px", borderRadius: 8, cursor: "pointer", fontSize: 12, fontWeight: 700,
                    border: `2px solid ${preferredBrand === brand ? accentColor : C.border}`,
                    background: preferredBrand === brand ? `${accentColor}10` : "#fff",
                    color: preferredBrand === brand ? accentColor : C.text,
                    transition: "all 0.12s",
                  }}>
                  {brand}
                </button>
              ))}
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: C.muted, display: "block", marginBottom: 4 }}>Additional notes (optional)</label>
              <textarea value={brandNotes} onChange={e => setBrandNotes(e.target.value)}
                placeholder="Conveyor design notes, special requirements, certifications needed..."
                rows={3}
                style={{ width: "100%", padding: "8px 10px", border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 12, outline: "none", resize: "vertical", boxSizing: "border-box" }}
              />
            </div>

            {/* Summary */}
            <div style={{ background: "#f8fafc", borderRadius: 9, padding: "12px 14px", border: `1px solid ${C.border}`, marginBottom: 16, fontSize: 11 }}>
              <div style={{ fontWeight: 700, color: C.navyMid, marginBottom: 6 }}>Order Summary</div>
              {[
                ["Product", product.name],
                ["Material", selectedMaterial?.name],
                ["Width", selectedWidth],
                ["Length", `${totalFt} ft (${boxes} × 10 ft box${boxes > 1 ? "es" : ""})`],
                ["Brand", preferredBrand],
              ].map(([k, v]) => (
                <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "2px 0", borderBottom: "1px solid #f1f5f9" }}>
                  <span style={{ color: C.muted, fontWeight: 600 }}>{k}</span>
                  <span style={{ color: C.text, fontWeight: 700 }}>{v}</span>
                </div>
              ))}
            </div>

            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => setStep(3)} style={btnStyle("back")}>← Back</button>
              <button onClick={handleConfirm} style={btnStyle("confirm")}>
                ✓ Add to RFQ Cart
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function btnStyle(type, disabled) {
  const base = { padding: "10px 16px", borderRadius: 9, cursor: disabled ? "not-allowed" : "pointer", fontSize: 13, fontWeight: 700, border: "none", transition: "opacity 0.12s", opacity: disabled ? 0.4 : 1 };
  if (type === "cancel") return { ...base, flex: 1, background: "#f1f5f9", color: "#64748b", border: "1px solid #e2e8f0" };
  if (type === "back")   return { ...base, flex: 1, background: "#f1f5f9", color: "#334155", border: "1px solid #e2e8f0" };
  if (type === "next")   return { ...base, flex: 2, background: "#1A3A5C", color: "#fff" };
  if (type === "confirm") return { ...base, flex: 2, background: "#16a34a", color: "#fff" };
  return base;
}