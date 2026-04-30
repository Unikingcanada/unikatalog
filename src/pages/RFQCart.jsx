import { useState, useEffect, useRef } from "react";
import { createPageUrl } from "@/utils";

const NAVY = "#0f2340";
const C = {
  navy: "#0f2340", navyMid: "#1a3a5c", accent: "#2563eb",
  border: "#e2e8f0", bg: "#f8fafc", muted: "#64748b", text: "#0f172a",
};
const UNIT_OPTIONS = ["Feet", "Meters", "Pieces", "Sets", "Rolls", "Inches", "Yards", "Each"];

function Label({ children, required }) {
  return (
    <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: 6 }}>
      {children}{required && <span style={{ color: "#ef4444", marginLeft: 2 }}>*</span>}
    </div>
  );
}

function FieldInput({ value, onChange, placeholder, type = "text", required }) {
  const [focused, setFocused] = useState(false);
  return (
    <input
      type={type} value={value} onChange={onChange} placeholder={placeholder} required={required}
      onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
      style={{
        width: "100%", boxSizing: "border-box", padding: "12px 14px",
        borderRadius: 8, border: "1.5px solid " + (focused ? C.accent : C.border),
        fontSize: 15, color: C.text, outline: "none", background: "#fff",
        transition: "border-color 0.15s", WebkitAppearance: "none",
      }}
    />
  );
}

function StepBar({ step }) {
  const steps = ["Cart", "Details", "Submit"];
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 28 }}>
      {steps.map((label, i) => {
        const active = i === step;
        const done = i < step;
        return (
          <div key={i} style={{ display: "flex", alignItems: "center" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
              <div style={{
                width: 34, height: 34, borderRadius: "50%",
                background: done ? "#16a34a" : active ? NAVY : "#e2e8f0",
                color: done || active ? "#fff" : "#94a3b8",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 13, fontWeight: 800,
              }}>
                {done ? "✓" : i + 1}
              </div>
              <div style={{ fontSize: 11, fontWeight: active ? 700 : 500, color: active ? NAVY : done ? "#16a34a" : "#94a3b8" }}>
                {label}
              </div>
            </div>
            {i < steps.length - 1 && (
              <div style={{ width: 56, height: 2, background: done ? "#16a34a" : "#e2e8f0", margin: "0 4px", marginBottom: 18 }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function RFQCart() {
  const [step, setStep] = useState(0);
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ name: "", company: "", email: "", phone: "", notes: "" });
  const [attachments, setAttachments] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [removeAnim, setRemoveAnim] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef();

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("uniking_rfq_cart") || "[]");
      setItems(stored);
    } catch { setItems([]); }
  }, []);

  useEffect(() => { window.scrollTo({ top: 0, behavior: "smooth" }); }, [step]);

  const saveItems = (newItems) => {
    setItems(newItems);
    localStorage.setItem("uniking_rfq_cart", JSON.stringify(newItems));
    window.dispatchEvent(new Event("rfq_cart_updated"));
  };

  const updateItem = (idx, field, val) => saveItems(items.map((item, i) => i === idx ? { ...item, [field]: val } : item));

  const removeItem = (idx) => {
    setRemoveAnim(idx);
    setTimeout(() => { saveItems(items.filter((_, i) => i !== idx)); setRemoveAnim(null); }, 250);
  };

  const handleFiles = (files) => {
    const newFiles = Array.from(files).filter(f => f.size <= 10 * 1024 * 1024);
    setAttachments(prev => [...prev, ...newFiles]);
  };

  const handleDrop = (e) => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); };

  const handleSubmit = async () => {
    setError(""); setSubmitting(true);
    try {
      const attachmentData = await Promise.all(
        attachments.map(file => new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve({ name: file.name, type: file.type, size: file.size, data: reader.result });
          reader.readAsDataURL(file);
        }))
      );
      const res = await fetch("/api/fn/sendRFQEmail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customer: form, items, attachments: attachmentData }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send");
      setSubmitted(true);
      saveItems([]);
    } catch (err) {
      setError("Something went wrong. Please try again or email rfq@unikingcanada.com directly.");
    } finally { setSubmitting(false); }
  };

  // SUCCESS
  if (submitted) {
    return (
      <div style={{ minHeight: "100vh", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center", padding: 24, fontFamily: "Arial,sans-serif" }}>
        <div style={{ background: "#fff", borderRadius: 16, padding: "48px 32px", maxWidth: 440, width: "100%", textAlign: "center" }}>
          <div style={{ width: 68, height: 68, background: "#dcfce7", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", fontSize: 30 }}>✓</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: NAVY, marginBottom: 10 }}>RFQ Submitted!</div>
          <div style={{ fontSize: 14, color: C.muted, lineHeight: 1.75, marginBottom: 28 }}>
            Your request has been sent to our team.<br />
            A confirmation was sent to <strong>{form.email}</strong>.
          </div>
          <a href={createPageUrl("Home")} style={{ display: "inline-block", background: NAVY, color: "#fff", padding: "13px 32px", borderRadius: 8, fontWeight: 700, fontSize: 14, textDecoration: "none" }}>
            Back to Catalog
          </a>
        </div>
      </div>
    );
  }

  // STEP 0 — CART
  const renderStep0 = () => (
    <div>
      {items.length === 0 ? (
        <div style={{ textAlign: "center", padding: "48px 16px" }}>
          <div style={{ fontSize: 48, opacity: 0.2, marginBottom: 14 }}>📋</div>
          <div style={{ fontSize: 18, fontWeight: 800, color: NAVY, marginBottom: 8 }}>Your cart is empty</div>
          <div style={{ fontSize: 14, color: C.muted, marginBottom: 24 }}>Browse the catalog and click "Add to RFQ" on any product.</div>
          <a href={createPageUrl("Home")} style={{ display: "inline-block", background: NAVY, color: "#fff", padding: "12px 28px", borderRadius: 8, fontWeight: 700, fontSize: 14, textDecoration: "none" }}>
            Browse Catalog
          </a>
        </div>
      ) : (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <div style={{ fontSize: 15, fontWeight: 800, color: NAVY }}>{items.length} Product{items.length !== 1 ? "s" : ""}</div>
            <button type="button" onClick={() => saveItems([])} style={{ background: "none", border: "none", color: "#ef4444", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Clear All</button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 20 }}>
            {items.map((item, idx) => (
              <div key={item.cartId || idx} style={{
                background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0", overflow: "hidden",
                opacity: removeAnim === idx ? 0 : 1, transform: removeAnim === idx ? "translateX(12px)" : "none",
                transition: "opacity 0.22s, transform 0.22s",
              }}>
                <div style={{ display: "flex" }}>
                  {item.image_url && (
                    <div style={{ width: 76, flexShrink: 0, background: "#f8fafc", borderRight: "1px solid #f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", padding: 8 }}>
                      <img src={item.image_url} alt="" style={{ maxWidth: "100%", maxHeight: 58, objectFit: "contain" }} onError={e => e.target.style.display = "none"} />
                    </div>
                  )}
                  <div style={{ flex: 1, padding: "12px 14px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 800, color: NAVY }}>{item.series || item.name || "Product"}</div>
                        <div style={{ fontSize: 12, color: C.muted, marginTop: 1 }}>{item.type}{item.style ? " · " + item.style : ""}</div>
                      </div>
                      <button type="button" onClick={() => removeItem(idx)}
                        style={{ background: "none", border: "none", color: "#d1d5db", cursor: "pointer", fontSize: 22, lineHeight: 1, padding: "0 4px" }}
                        onMouseEnter={e => e.target.style.color = "#ef4444"}
                        onMouseLeave={e => e.target.style.color = "#d1d5db"}>×</button>
                    </div>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      <div>
                        <Label>Qty</Label>
                        <input type="number" min="1" value={item.quantity || 1}
                          onChange={e => updateItem(idx, "quantity", e.target.value)}
                          style={{ width: 70, padding: "8px 10px", borderRadius: 6, border: "1px solid #e2e8f0", fontSize: 14, fontWeight: 700, color: NAVY, outline: "none" }} />
                      </div>
                      <div>
                        <Label>Unit</Label>
                        <select value={item.unit || "Feet"} onChange={e => updateItem(idx, "unit", e.target.value)}
                          style={{ padding: "8px 10px", borderRadius: 6, border: "1px solid #e2e8f0", fontSize: 13, color: NAVY, outline: "none", background: "#fff" }}>
                          {UNIT_OPTIONS.map(u => <option key={u}>{u}</option>)}
                        </select>
                      </div>
                      <div style={{ width: "100%" }}>
                        <Label>Notes / Specs</Label>
                        <input type="text" placeholder="Width, material, application..."
                          value={item.notes || ""}
                          onChange={e => updateItem(idx, "notes", e.target.value)}
                          style={{ width: "100%", boxSizing: "border-box", padding: "8px 10px", borderRadius: 6, border: "1px solid #e2e8f0", fontSize: 13, color: NAVY, outline: "none" }} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <a href={createPageUrl("Home")} style={{ display: "inline-block", fontSize: 13, color: C.accent, fontWeight: 600, textDecoration: "none", marginBottom: 24 }}>
            + Add more products
          </a>

          <button onClick={() => setStep(1)}
            style={{ width: "100%", background: NAVY, color: "#fff", padding: "16px 20px", borderRadius: 10, fontWeight: 800, fontSize: 16, border: "none", cursor: "pointer", boxShadow: "0 4px 14px rgba(15,35,64,0.2)", display: "block" }}>
            Next: Add Your Details →
          </button>
        </div>
      )}
    </div>
  );

  // STEP 1 — DETAILS
  const renderStep1 = () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0", padding: "20px" }}>
        <div style={{ fontSize: 15, fontWeight: 800, color: NAVY, marginBottom: 18 }}>Contact Information</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div><Label required>Full Name</Label><FieldInput value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Jane Smith" required /></div>
          <div><Label>Company</Label><FieldInput value={form.company} onChange={e => setForm(f => ({ ...f, company: e.target.value }))} placeholder="Acme Industries Ltd." /></div>
          <div><Label required>Email Address</Label><FieldInput type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="jane@company.com" required /></div>
          <div><Label>Phone Number</Label><FieldInput type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="+1 (514) 000-0000" /></div>
        </div>
      </div>

      <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0", padding: "20px" }}>
        <div style={{ fontSize: 15, fontWeight: 800, color: NAVY, marginBottom: 12 }}>Additional Notes</div>
        <Label>Anything else our team should know?</Label>
        <textarea
          value={form.notes}
          onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
          placeholder="Application details, timeline, budget, current supplier, or any other context..."
          rows={5}
          style={{ width: "100%", boxSizing: "border-box", padding: "12px 14px", borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 14, color: C.text, outline: "none", resize: "vertical", fontFamily: "Arial,sans-serif", lineHeight: 1.6 }}
          onFocus={e => e.target.style.borderColor = C.accent}
          onBlur={e => e.target.style.borderColor = "#e2e8f0"}
        />
      </div>

      <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0", padding: "20px" }}>
        <div style={{ fontSize: 15, fontWeight: 800, color: NAVY, marginBottom: 4 }}>
          Attachments <span style={{ fontSize: 12, fontWeight: 500, color: C.muted }}>(optional)</span>
        </div>
        <div style={{ fontSize: 13, color: C.muted, marginBottom: 14 }}>Photos, drawings, spec sheets — any format, max 10MB each</div>
        <div
          onDragOver={e => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current.click()}
          style={{ border: "2px dashed " + (dragOver ? C.accent : "#cbd5e1"), borderRadius: 10, padding: "28px 20px", textAlign: "center", background: dragOver ? "#eff6ff" : "#f8fafc", cursor: "pointer" }}>
          <div style={{ fontSize: 30, marginBottom: 8 }}>📎</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: C.navyMid }}>Tap to attach files</div>
          <div style={{ fontSize: 12, color: C.muted, marginTop: 4 }}>Images, PDFs, DWG, Excel, Word…</div>
          <input ref={fileInputRef} type="file" multiple accept="*/*" onChange={e => handleFiles(e.target.files)} style={{ display: "none" }} />
        </div>
        {attachments.length > 0 && (
          <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 8 }}>
            {attachments.map((file, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", background: "#f8fafc", borderRadius: 8, border: "1px solid #e2e8f0" }}>
                <span style={{ fontSize: 18 }}>{file.type.startsWith("image/") ? "🖼️" : file.type === "application/pdf" ? "📄" : "📁"}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: NAVY, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{file.name}</div>
                  <div style={{ fontSize: 11, color: C.muted }}>{(file.size / 1024).toFixed(0)} KB</div>
                </div>
                <button type="button" onClick={() => setAttachments(prev => prev.filter((_, j) => j !== i))}
                  style={{ background: "none", border: "none", color: "#9ca3af", cursor: "pointer", fontSize: 20, lineHeight: 1 }}
                  onMouseEnter={e => e.target.style.color = "#ef4444"}
                  onMouseLeave={e => e.target.style.color = "#9ca3af"}>×</button>
              </div>
            ))}
          </div>
        )}
      </div>

      {error && <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, padding: "12px 14px", fontSize: 13, color: "#dc2626" }}>{error}</div>}

      <div style={{ display: "flex", gap: 10 }}>
        <button onClick={() => { setError(""); setStep(0); }}
          style={{ flex: 1, background: "#fff", color: NAVY, padding: "14px 16px", borderRadius: 10, fontWeight: 700, fontSize: 15, border: "1.5px solid #e2e8f0", cursor: "pointer" }}>
          ← Back
        </button>
        <button onClick={() => {
          if (!form.name || !form.email) { setError("Please fill in your name and email."); return; }
          setError(""); setStep(2);
        }}
          style={{ flex: 2, background: NAVY, color: "#fff", padding: "14px 16px", borderRadius: 10, fontWeight: 800, fontSize: 15, border: "none", cursor: "pointer", boxShadow: "0 4px 14px rgba(15,35,64,0.2)" }}>
          Review & Submit →
        </button>
      </div>
    </div>
  );

  // STEP 2 — REVIEW + SUBMIT
  const renderStep2 = () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0", padding: "18px" }}>
        <div style={{ fontSize: 12, fontWeight: 800, color: C.muted, textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: 12 }}>Products ({items.length})</div>
        {items.map((item, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: i < items.length - 1 ? "1px solid #f1f5f9" : "none" }}>
            {item.image_url && <img src={item.image_url} alt="" style={{ width: 36, height: 36, objectFit: "contain", borderRadius: 4, background: "#f8fafc" }} onError={e => e.target.style.display = "none"} />}
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: NAVY }}>{item.series || item.name}</div>
              <div style={{ fontSize: 11, color: C.muted }}>{item.type}</div>
            </div>
            <div style={{ fontSize: 13, fontWeight: 700, color: C.navyMid, whiteSpace: "nowrap" }}>{item.quantity || 1} {item.unit || "Feet"}</div>
          </div>
        ))}
      </div>

      <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0", padding: "18px" }}>
        <div style={{ fontSize: 12, fontWeight: 800, color: C.muted, textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: 12 }}>Contact</div>
        {[["Name", form.name], ["Company", form.company], ["Email", form.email], ["Phone", form.phone]].filter(([, v]) => v).map(([k, v]) => (
          <div key={k} style={{ display: "flex", gap: 10, padding: "5px 0", fontSize: 13 }}>
            <span style={{ color: C.muted, width: 72, flexShrink: 0 }}>{k}</span>
            <span style={{ color: NAVY, fontWeight: 600 }}>{v}</span>
          </div>
        ))}
        {form.notes && (
          <div style={{ marginTop: 10, padding: "10px 12px", background: "#f8fafc", borderRadius: 7, fontSize: 13, color: C.text, lineHeight: 1.5 }}>{form.notes}</div>
        )}
      </div>

      {attachments.length > 0 && (
        <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0", padding: "18px" }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: C.muted, textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: 10 }}>Attachments ({attachments.length})</div>
          {attachments.map((f, i) => <div key={i} style={{ fontSize: 13, color: NAVY, fontWeight: 500, padding: "3px 0" }}>📎 {f.name}</div>)}
        </div>
      )}

      {error && <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, padding: "12px 14px", fontSize: 13, color: "#dc2626" }}>{error}</div>}

      <div style={{ display: "flex", gap: 10 }}>
        <button onClick={() => { setError(""); setStep(1); }}
          style={{ flex: 1, background: "#fff", color: NAVY, padding: "14px 16px", borderRadius: 10, fontWeight: 700, fontSize: 15, border: "1.5px solid #e2e8f0", cursor: "pointer" }}>
          ← Back
        </button>
        <button onClick={handleSubmit} disabled={submitting}
          style={{ flex: 2, background: submitting ? "#94a3b8" : NAVY, color: "#fff", padding: "14px 16px", borderRadius: 10, fontWeight: 800, fontSize: 15, border: "none", cursor: submitting ? "not-allowed" : "pointer", boxShadow: submitting ? "none" : "0 4px 14px rgba(15,35,64,0.22)" }}>
          {submitting ? "Sending..." : "Submit RFQ ✓"}
        </button>
      </div>
      <div style={{ fontSize: 11, color: "#94a3b8", textAlign: "center", lineHeight: 1.6 }}>
        Sent to rfq@unikingcanada.com · We typically respond within 1–2 business days.
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "Arial,sans-serif" }}>
      <div style={{ background: NAVY, height: 56, display: "flex", alignItems: "center", padding: "0 20px", justifyContent: "space-between" }}>
        <a href={createPageUrl("Home")} style={{ color: "#93c5fd", fontSize: 13, fontWeight: 600, textDecoration: "none" }}>← Back to Catalog</a>
        <img src="https://media.base44.com/images/public/69dd9ffccab4dd693d4d92f5/e48ee59d9_Unitingthestrongestlinks_20251031_225809_0000.png" style={{ maxHeight: 26, width: "auto", filter: "brightness(0) invert(1)", opacity: 0.9 }} alt="Uniking Canada" />
        <span style={{ width: 80 }} />
      </div>

      <div style={{ maxWidth: 600, margin: "0 auto", padding: "28px 16px 80px" }}>
        <div style={{ fontSize: 22, fontWeight: 800, color: NAVY, marginBottom: 4 }}>Request for Quotation</div>
        <div style={{ fontSize: 13, color: C.muted, marginBottom: 24 }}>
          {step === 0 && "Review your selected products."}
          {step === 1 && "Tell us who you are and add any details."}
          {step === 2 && "Everything look good? Submit your RFQ."}
        </div>
        <StepBar step={step} />
        {step === 0 && renderStep0()}
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
      </div>
    </div>
  );
}
