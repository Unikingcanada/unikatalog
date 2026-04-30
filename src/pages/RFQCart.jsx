import { useState, useEffect } from "react";
import { createPageUrl } from "@/utils";

const NAVY = "#0f2340";
const C = {
  navy: "#0f2340", navyMid: "#1a3a5c", accent: "#2563eb",
  border: "#e2e8f0", bg: "#f8fafc", muted: "#64748b", text: "#0f172a",
};

const UNIT_OPTIONS = ["Feet", "Meters", "Pieces", "Sets", "Rolls", "Inches", "Yards", "Each"];

function RFQCart() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ name: "", company: "", email: "", phone: "", project: "", message: "" });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [removeAnim, setRemoveAnim] = useState(null);

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("uniking_rfq_cart") || "[]");
      setItems(stored);
    } catch {
      setItems([]);
    }
  }, []);

  const saveItems = (newItems) => {
    setItems(newItems);
    localStorage.setItem("uniking_rfq_cart", JSON.stringify(newItems));
    window.dispatchEvent(new Event("rfq_cart_updated"));
  };

  const updateItem = (idx, field, val) => {
    const updated = items.map((item, i) => i === idx ? { ...item, [field]: val } : item);
    saveItems(updated);
  };

  const removeItem = (idx) => {
    setRemoveAnim(idx);
    setTimeout(() => {
      const updated = items.filter((_, i) => i !== idx);
      saveItems(updated);
      setRemoveAnim(null);
    }, 250);
  };

  const clearCart = () => {
    saveItems([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email) { setError("Name and email are required."); return; }
    if (items.length === 0) { setError("Your RFQ cart is empty."); return; }
    setError("");
    setSubmitting(true);

    try {
      const res = await fetch("/api/fn/sendRFQEmail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customer: form, items }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send");
      setSubmitted(true);
      clearCart();
    } catch (err) {
      setError("There was a problem sending your RFQ. Please try again or contact us directly at rfq@unikingcanada.com.");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div style={{ minHeight: "100vh", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
        <div style={{ background: "#fff", borderRadius: 16, padding: "48px 40px", maxWidth: 480, width: "100%",
          textAlign: "center", boxShadow: "0 4px 24px rgba(0,0,0,0.08)", border: "1px solid #e2e8f0" }}>
          <div style={{ width: 64, height: 64, background: "#dcfce7", borderRadius: "50%",
            display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", fontSize: 28 }}>✓</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: NAVY, marginBottom: 10 }}>RFQ Submitted!</div>
          <div style={{ fontSize: 14, color: C.muted, lineHeight: 1.7, marginBottom: 28 }}>
            Thank you! Your request has been sent to our team. We'll review your requirements and get back to you as soon as possible.
            <br/><br/>
            A confirmation has been sent to your email.
          </div>
          <a href={createPageUrl("Home")}
            style={{ display: "inline-block", background: NAVY, color: "#fff", padding: "12px 28px",
              borderRadius: 8, fontWeight: 700, fontSize: 14, textDecoration: "none" }}>
            Back to Catalog
          </a>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "'Inter',Arial,sans-serif" }}>
      {/* Header */}
      <div style={{ background: NAVY, padding: "0 32px", borderBottom: "1px solid #1e3a5f" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", alignItems: "center",
          justifyContent: "space-between", height: 60 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <a href={createPageUrl("Home")}
              style={{ color: "#93c5fd", fontSize: 13, textDecoration: "none", fontWeight: 500 }}>
              ← Back to Catalog
            </a>
          </div>
          <div style={{ color: "#fff", fontSize: 14, fontWeight: 700, letterSpacing: 1, opacity: 0.9 }}>
            UNIKING CANADA
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 24px" }}>
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 26, fontWeight: 800, color: NAVY }}>Request for Quotation</div>
          <div style={{ fontSize: 14, color: C.muted, marginTop: 4 }}>
            Review your selected products and submit your RFQ to our team.
          </div>
        </div>

        {items.length === 0 ? (
          <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0",
            padding: "60px 32px", textAlign: "center" }}>
            <div style={{ fontSize: 40, marginBottom: 16, opacity: 0.3 }}>📋</div>
            <div style={{ fontSize: 17, fontWeight: 700, color: NAVY, marginBottom: 8 }}>Your RFQ cart is empty</div>
            <div style={{ fontSize: 14, color: C.muted, marginBottom: 24 }}>
              Browse the catalog and click "Add to RFQ" on any product to get started.
            </div>
            <a href={createPageUrl("Home")}
              style={{ display: "inline-block", background: NAVY, color: "#fff", padding: "11px 24px",
                borderRadius: 8, fontWeight: 700, fontSize: 14, textDecoration: "none" }}>
              Browse Catalog
            </a>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: 24, alignItems: "start" }}>

            {/* Left: Items */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: NAVY }}>
                  {items.length} Product{items.length !== 1 ? "s" : ""} Selected
                </div>
                <button onClick={clearCart}
                  style={{ background: "none", border: "none", color: "#ef4444", fontSize: 13,
                    fontWeight: 600, cursor: "pointer", padding: "4px 8px" }}>
                  Clear All
                </button>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {items.map((item, idx) => (
                  <div key={item.cartId || idx}
                    style={{
                      background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0",
                      overflow: "hidden", opacity: removeAnim === idx ? 0 : 1,
                      transform: removeAnim === idx ? "translateX(20px)" : "none",
                      transition: "opacity 0.25s, transform 0.25s",
                    }}>
                    <div style={{ display: "flex", gap: 0 }}>
                      {/* Image */}
                      {item.image_url && (
                        <div style={{ width: 90, flexShrink: 0, background: "#f8fafc",
                          borderRight: "1px solid #f1f5f9", display: "flex",
                          alignItems: "center", justifyContent: "center", padding: 8 }}>
                          <img src={item.image_url} alt={item.series}
                            style={{ maxWidth: "100%", maxHeight: 70, objectFit: "contain" }}
                            onError={e => e.target.style.display = "none"} />
                        </div>
                      )}

                      {/* Content */}
                      <div style={{ flex: 1, padding: "14px 16px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                          <div>
                            <div style={{ fontSize: 14, fontWeight: 800, color: NAVY, marginBottom: 2 }}>
                              {item.series || item.name || "Product"}
                            </div>
                            <div style={{ fontSize: 12, color: C.muted }}>
                              {item.type}{item.style || item.category ? ` · ${item.style || item.category}` : ""}
                            </div>
                          </div>
                          <button onClick={() => removeItem(idx)}
                            style={{ background: "none", border: "none", color: "#9ca3af",
                              cursor: "pointer", fontSize: 18, lineHeight: 1, padding: "0 4px",
                              borderRadius: 4, transition: "color 0.15s" }}
                            onMouseEnter={e => e.target.style.color = "#ef4444"}
                            onMouseLeave={e => e.target.style.color = "#9ca3af"}>
                            ×
                          </button>
                        </div>

                        {/* Qty + Unit + Notes */}
                        <div style={{ display: "flex", gap: 10, marginTop: 12, flexWrap: "wrap" }}>
                          <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                            <label style={{ fontSize: 10, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: 0.5 }}>Quantity</label>
                            <input
                              type="number" min="1" value={item.quantity || 1}
                              onChange={e => updateItem(idx, "quantity", e.target.value)}
                              style={{ width: 80, padding: "7px 10px", borderRadius: 6,
                                border: "1px solid #e2e8f0", fontSize: 14, fontWeight: 600,
                                color: NAVY, outline: "none" }} />
                          </div>
                          <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                            <label style={{ fontSize: 10, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: 0.5 }}>Unit</label>
                            <select value={item.unit || "Feet"}
                              onChange={e => updateItem(idx, "unit", e.target.value)}
                              style={{ padding: "7px 10px", borderRadius: 6, border: "1px solid #e2e8f0",
                                fontSize: 13, color: NAVY, outline: "none", background: "#fff" }}>
                              {UNIT_OPTIONS.map(u => <option key={u}>{u}</option>)}
                            </select>
                          </div>
                          <div style={{ flex: 1, minWidth: 200, display: "flex", flexDirection: "column", gap: 3 }}>
                            <label style={{ fontSize: 10, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: 0.5 }}>Notes / Specs</label>
                            <input
                              type="text" placeholder="e.g. width, material preference, application..."
                              value={item.notes || ""}
                              onChange={e => updateItem(idx, "notes", e.target.value)}
                              style={{ padding: "7px 10px", borderRadius: 6, border: "1px solid #e2e8f0",
                                fontSize: 13, color: NAVY, outline: "none", width: "100%" }} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <a href={createPageUrl("Home")}
                style={{ display: "inline-flex", alignItems: "center", gap: 6, marginTop: 16,
                  color: C.accent, fontSize: 13, fontWeight: 600, textDecoration: "none" }}>
                + Add more products
              </a>
            </div>

            {/* Right: Customer Form */}
            <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0",
              padding: "24px", position: "sticky", top: 24 }}>
              <div style={{ fontSize: 16, fontWeight: 800, color: NAVY, marginBottom: 20,
                paddingBottom: 12, borderBottom: "2px solid #f1f5f9" }}>
                Your Information
              </div>

              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {[
                  { field: "name", label: "Full Name", placeholder: "John Smith", required: true },
                  { field: "company", label: "Company", placeholder: "Acme Industries Ltd." },
                  { field: "email", label: "Email Address", placeholder: "john@company.com", type: "email", required: true },
                  { field: "phone", label: "Phone Number", placeholder: "+1 (514) 000-0000", type: "tel" },
                  { field: "project", label: "Project / Reference", placeholder: "Project name or PO reference" },
                ].map(({ field, label, placeholder, type = "text", required }) => (
                  <div key={field} style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                    <label style={{ fontSize: 12, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: 0.5 }}>
                      {label}{required && <span style={{ color: "#ef4444" }}> *</span>}
                    </label>
                    <input
                      type={type} value={form[field]} required={required}
                      placeholder={placeholder}
                      onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}
                      style={{ padding: "9px 12px", borderRadius: 7, border: "1px solid #e2e8f0",
                        fontSize: 13, color: NAVY, outline: "none", width: "100%",
                        boxSizing: "border-box", transition: "border-color 0.15s" }}
                      onFocus={e => e.target.style.borderColor = "#2563eb"}
                      onBlur={e => e.target.style.borderColor = "#e2e8f0"} />
                  </div>
                ))}

                <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                  <label style={{ fontSize: 12, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: 0.5 }}>
                    Additional Notes
                  </label>
                  <textarea
                    value={form.message} rows={3}
                    placeholder="Describe your application, timeline, or any other details..."
                    onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                    style={{ padding: "9px 12px", borderRadius: 7, border: "1px solid #e2e8f0",
                      fontSize: 13, color: NAVY, outline: "none", resize: "vertical",
                      fontFamily: "inherit", boxSizing: "border-box" }}
                    onFocus={e => e.target.style.borderColor = "#2563eb"}
                    onBlur={e => e.target.style.borderColor = "#e2e8f0"} />
                </div>

                {error && (
                  <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 7,
                    padding: "10px 12px", fontSize: 13, color: "#dc2626" }}>
                    {error}
                  </div>
                )}

                <button type="submit" disabled={submitting}
                  style={{ background: submitting ? "#64748b" : NAVY, color: "#fff",
                    padding: "13px 20px", borderRadius: 8, fontWeight: 800, fontSize: 14,
                    border: "none", cursor: submitting ? "not-allowed" : "pointer",
                    marginTop: 4, transition: "background 0.2s, transform 0.1s",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
                  onMouseEnter={e => { if (!submitting) e.target.style.background = "#1a3a5c"; }}
                  onMouseLeave={e => { if (!submitting) e.target.style.background = NAVY; }}>
                  {submitting ? "Sending..." : `Submit RFQ — ${items.length} Product${items.length !== 1 ? "s" : ""}`}
                </button>

                <div style={{ fontSize: 11, color: "#94a3b8", textAlign: "center", lineHeight: 1.5 }}>
                  Your request will be sent to rfq@unikingcanada.com.<br/>
                  We typically respond within 1–2 business days.
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default RFQCart;
