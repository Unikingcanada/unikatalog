// Hole Pattern Confirmation Modal — shown when user clicks "Add to RFQ" on a size row
import { useState } from "react";

const NAVY = "#1a3a5c";

export default function HolePatternModal({ rec, size, material, onClose, onAdded }) {
  const [phase, setPhase] = useState("confirm"); // confirm | custom
  const [qty, setQty] = useState(1);
  const [notes, setNotes] = useState("");
  const [customDrilling, setCustomDrilling] = useState({
    holeDiameter: "", numberOfHoles: "", horizontalSpacing: "", verticalSpacing: "", notes: ""
  });
  const [added, setAdded] = useState(false);

  // Parse standard hole spacing from entity field
  let stdHoles = null;
  try { stdHoles = rec.standard_hole_spacing ? JSON.parse(rec.standard_hole_spacing) : null; } catch {}
  // Fallback from size data
  if (!stdHoles && size) {
    stdHoles = {
      holeDiameter: size.bolt_size || "17/32\"",
      numberOfHoles: size.holes || "2",
      horizontalSpacing: size.std_spacing_in ? size.std_spacing_in + '"' : "—",
      verticalSpacing: "—",
      notes: size.drilling_pattern || ""
    };
  }

  function buildCartItem(drillingType, custom) {
    return {
      id: `bucket-${rec.id}-${size.size || size.part_number}-${Date.now()}`,
      cartId: `bucket-${rec.id}-${Date.now()}`,
      type: "Elevator Bucket",
      _source: "elevbucket",
      series: rec.series,
      name: rec.series,
      style: rec.style || "",
      application: rec.application || "",
      material,
      size: size.size || size.part_number || "",
      part_number: size.part_number || "",
      discharge: rec.discharge_type || "",
      qty,
      notes,
      unitSpec: [
        size.length_in ? `L:${size.length_in}"` : null,
        size.projection_in ? `P:${size.projection_in}"` : null,
        size.depth_in ? `D:${size.depth_in}"` : null,
      ].filter(Boolean).join(" · "),
      drillingType,
      customDrilling: drillingType === "custom" ? custom : null,
    };
  }

  function addStandard() {
    const cart = JSON.parse(localStorage.getItem("uniking_rfq_cart") || "[]");
    cart.push(buildCartItem("standard", null));
    localStorage.setItem("uniking_rfq_cart", JSON.stringify(cart));
    window.dispatchEvent(new Event("rfq_cart_updated"));
    setAdded(true);
    setTimeout(() => { onAdded && onAdded(); onClose(); }, 1400);
  }

  function addCustom() {
    const cart = JSON.parse(localStorage.getItem("uniking_rfq_cart") || "[]");
    cart.push(buildCartItem("custom", { ...customDrilling, qty, notes }));
    localStorage.setItem("uniking_rfq_cart", JSON.stringify(cart));
    window.dispatchEvent(new Event("rfq_cart_updated"));
    setAdded(true);
    setTimeout(() => { onAdded && onAdded(); onClose(); }, 1400);
  }

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.72)", zIndex: 3000, display: "flex", alignItems: "center", justifyContent: "center", padding: 12 }}
      onClick={onClose}>
      <div style={{ background: "#fff", borderRadius: 16, width: "100%", maxWidth: 540, maxHeight: "96vh", overflowY: "auto", boxShadow: "0 24px 80px rgba(0,0,0,0.35)" }}
        onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div style={{ background: `linear-gradient(135deg, ${NAVY}, #2d5986)`, borderRadius: "16px 16px 0 0", padding: "18px 22px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>Add to RFQ</div>
              <div style={{ fontSize: 20, fontWeight: 900, color: "#fff" }}>{rec.series} — {size.size || size.part_number}"</div>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", marginTop: 2 }}>{material} · {rec.application}</div>
            </div>
            <button onClick={onClose} style={{ background: "rgba(255,255,255,0.15)", border: "none", borderRadius: "50%", width: 32, height: 32, cursor: "pointer", color: "#fff", fontSize: 16 }}>✕</button>
          </div>
        </div>

        <div style={{ padding: "22px 24px" }}>
          {/* Schematic or placeholder */}
          {(rec.schematic_image || rec.image_url) && (
            <div style={{ textAlign: "center", marginBottom: 18 }}>
              <img src={rec.schematic_image || rec.image_url} alt={`${rec.series} schematic`}
                style={{ maxHeight: 160, maxWidth: "100%", objectFit: "contain", border: "1px solid #e5e7eb", borderRadius: 10, padding: 10, background: "#f8fafc" }}
                onError={e => e.target.parentElement.style.display = "none"} />
            </div>
          )}

          {/* Standard hole spacing display */}
          {stdHoles && (
            <div style={{ background: "#f8fafc", border: "1px solid #e5e7eb", borderRadius: 10, padding: "14px 16px", marginBottom: 20 }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: NAVY, marginBottom: 10 }}>Standard Drilling Pattern</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {[
                  ["Hole Diameter", stdHoles.holeDiameter],
                  ["Number of Holes", stdHoles.numberOfHoles],
                  ["Horizontal Spacing (C/C)", stdHoles.horizontalSpacing],
                  ["Vertical Spacing (top→bottom)", stdHoles.verticalSpacing],
                ].map(([label, value]) => (
                  <div key={label} style={{ background: "#fff", border: "1px solid #f1f5f9", borderRadius: 7, padding: "8px 10px" }}>
                    <div style={{ fontSize: 9, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 3 }}>{label}</div>
                    <div style={{ fontSize: 13, fontWeight: 800, color: NAVY }}>{value || "—"}</div>
                  </div>
                ))}
              </div>
              {stdHoles.notes && <div style={{ marginTop: 8, fontSize: 11, color: "#6b7280", lineHeight: 1.5 }}>{stdHoles.notes}</div>}
            </div>
          )}

          {/* Qty + notes */}
          <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 16, flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: NAVY }}>Qty:</span>
              <button onClick={() => setQty(Math.max(1, qty - 1))} style={{ width: 28, height: 28, borderRadius: 6, border: "1px solid #d1d5db", background: "#f9fafb", cursor: "pointer", fontSize: 15 }}>−</button>
              <input type="number" min={1} value={qty} onChange={e => setQty(Math.max(1, parseInt(e.target.value) || 1))}
                style={{ width: 50, textAlign: "center", padding: "5px", borderRadius: 6, border: "1px solid #d1d5db", fontSize: 13, fontWeight: 700 }} />
              <button onClick={() => setQty(qty + 1)} style={{ width: 28, height: 28, borderRadius: 6, border: "1px solid #d1d5db", background: "#f9fafb", cursor: "pointer", fontSize: 15 }}>+</button>
            </div>
            <input value={notes} onChange={e => setNotes(e.target.value)} placeholder="Notes (application, venting...)"
              style={{ flex: 1, minWidth: 140, padding: "7px 12px", borderRadius: 8, border: "1px solid #d1d5db", fontSize: 12, outline: "none" }} />
          </div>

          {phase === "confirm" && (
            <>
              <div style={{ fontSize: 14, fontWeight: 800, color: "#0f172a", marginBottom: 14, textAlign: "center" }}>
                Does this match your existing hole pattern?
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
                <button onClick={addStandard} disabled={added}
                  style={{ padding: "14px", borderRadius: 10, border: "none", background: added ? "#065f46" : "#16a34a", color: "#fff", fontSize: 14, fontWeight: 800, cursor: "pointer", transition: "background 0.2s" }}>
                  {added ? "✓ Added!" : "✓ Yes — Standard Drilling"}
                </button>
                <button onClick={() => setPhase("custom")}
                  style={{ padding: "14px", borderRadius: 10, border: "2px solid #b45309", background: "#fffbeb", color: "#b45309", fontSize: 13, fontWeight: 800, cursor: "pointer" }}>
                  ✎ No — Enter Custom Drilling
                </button>
              </div>
            </>
          )}

          {phase === "custom" && (
            <>
              <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 10, padding: "16px", marginBottom: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: "#b45309", marginBottom: 12 }}>Custom Drilling Specification</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  {[
                    ["holeDiameter", "Hole Diameter (in)", 'e.g. 17/32"'],
                    ["numberOfHoles", "Number of Holes", "e.g. 2"],
                    ["horizontalSpacing", "Horizontal Spacing C/C", 'e.g. 3-1/2"'],
                    ["verticalSpacing", "Vertical Spacing (top→bot)", 'e.g. 1-1/4"'],
                  ].map(([field, label, placeholder]) => (
                    <div key={field}>
                      <label style={{ fontSize: 10, fontWeight: 700, color: "#92400e", display: "block", marginBottom: 4, textTransform: "uppercase", letterSpacing: 0.6 }}>{label}</label>
                      <input value={customDrilling[field]} onChange={e => setCustomDrilling(prev => ({ ...prev, [field]: e.target.value }))}
                        placeholder={placeholder}
                        style={{ width: "100%", padding: "8px 10px", borderRadius: 7, border: "1px solid #fde68a", fontSize: 12, outline: "none", background: "#fff", boxSizing: "border-box" }} />
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: 10 }}>
                  <label style={{ fontSize: 10, fontWeight: 700, color: "#92400e", display: "block", marginBottom: 4, textTransform: "uppercase", letterSpacing: 0.6 }}>Additional Notes</label>
                  <textarea value={customDrilling.notes} onChange={e => setCustomDrilling(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Any additional drilling details..."
                    style={{ width: "100%", padding: "8px 10px", borderRadius: 7, border: "1px solid #fde68a", fontSize: 12, outline: "none", background: "#fff", height: 60, resize: "vertical", boxSizing: "border-box" }} />
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <button onClick={() => setPhase("confirm")}
                  style={{ padding: "12px", borderRadius: 10, border: "1px solid #e5e7eb", background: "#f9fafb", color: "#374151", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
                  ← Back
                </button>
                <button onClick={addCustom} disabled={added}
                  style={{ padding: "12px", borderRadius: 10, border: "none", background: added ? "#065f46" : NAVY, color: "#fff", fontSize: 13, fontWeight: 800, cursor: "pointer" }}>
                  {added ? "✓ Added!" : "Add to RFQ with Custom Drilling"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}