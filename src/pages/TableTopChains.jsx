import { useState, useCallback } from "react";
import { CHAIN_CATEGORIES, MATERIALS } from "@/lib/tableTopChainData";
import ChainProductCard from "@/components/tableTopChain/ChainProductCard";
import ChainProductDetail from "@/components/tableTopChain/ChainProductDetail";
import RFQNotification from "@/components/tableTopChain/RFQNotification";
import { Link } from "react-router-dom";

const C = {
  navy: "#0C2340", navyMid: "#1A3A5C", gold: "#C9A84C",
  border: "#e2e8f0", muted: "#64748b", bg: "#f8fafc", text: "#0f172a",
};

function RFQModal({ item, onClose }) {
  const [qty, setQty] = useState(1);
  const [unit, setUnit] = useState("Meters");
  const [notes, setNotes] = useState("");
  const [done, setDone] = useState(false);

  function handleSubmit() {
    const matLabel = item.material
      ? `${item.material.name}${item.material.exclusive ? ` (${item.material.brandNote?.split("—")[0]?.trim()})` : ""}`
      : "Material TBC";
    const label = `${item.product.series} Table Top Chain – ${item.product.chainType} – ${matLabel}`;
    const cart = JSON.parse(localStorage.getItem("uniking_rfq_cart") || "[]");
    cart.push({
      cartId: `ttc_${Date.now()}`,
      id: `ttc_${Date.now()}`,
      _source: "table_top_chain",
      series: item.product.series,
      name: label,
      type: `${item.product.chainType} Table Top Chain`,
      category: "Table Top Chains",
      image_url: item.product.image || "",
      materials: item.material?.name || "To be confirmed",
      quantity: parseInt(qty) || 1,
      unit,
      notes: notes || item.product.catalogRef || "",
    });
    localStorage.setItem("uniking_rfq_cart", JSON.stringify(cart));
    window.dispatchEvent(new Event("rfq_cart_updated"));
    setDone(true);
    setTimeout(onClose, 1600);
  }

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 2000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div onClick={e => e.stopPropagation()} style={{ background: "#fff", borderRadius: 16, width: "100%", maxWidth: 500, boxShadow: "0 24px 80px rgba(0,0,0,0.3)", overflow: "hidden" }}>
        <div style={{ background: C.navy, padding: "16px 22px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ color: "#fff", fontSize: 16, fontWeight: 800 }}>Add to RFQ</div>
          <button onClick={onClose} style={{ background: "rgba(255,255,255,0.12)", border: "none", borderRadius: "50%", width: 30, height: 30, cursor: "pointer", color: "#fff", fontSize: 16 }}>✕</button>
        </div>
        {done ? (
          <div style={{ padding: "32px", textAlign: "center" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>✅</div>
            <div style={{ fontSize: 16, fontWeight: 800, color: "#16a34a" }}>Added to RFQ Cart</div>
          </div>
        ) : (
          <div style={{ padding: "20px 22px" }}>
            {/* Product summary */}
            <div style={{ background: C.bg, borderRadius: 10, padding: "12px 14px", marginBottom: 16, border: `1px solid ${C.border}` }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: C.navyMid }}>{item.product.series}</div>
              <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{item.product.chainType} Table Top Chain · {item.product.pitch_in} Pitch</div>
              {item.material && (
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 8 }}>
                  <span style={{ fontSize: 9, background: item.material.badge, color: item.material.badgeText, padding: "2px 7px", borderRadius: 7, fontWeight: 700 }}>{item.material.shortName}</span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: C.text }}>{item.material.name}</span>
                  {item.material.exclusive && (
                    <span style={{ fontSize: 9, background: "#ede9fe", color: "#6d28d9", padding: "1px 6px", borderRadius: 6, fontWeight: 700 }}>Exclusive</span>
                  )}
                </div>
              )}
              {!item.material && (
                <div style={{ fontSize: 11, color: "#92400e", marginTop: 6 }}>⚠ No material selected — Uniking will confirm</div>
              )}
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: C.navyMid, display: "block", marginBottom: 6 }}>Quantity</label>
              <div style={{ display: "flex", gap: 8 }}>
                <input type="number" value={qty} min="1" onChange={e => setQty(e.target.value)}
                  style={{ flex: 2, padding: "9px 12px", border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 12 }} />
                <select value={unit} onChange={e => setUnit(e.target.value)}
                  style={{ flex: 1, padding: "9px 12px", border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 12 }}>
                  <option>Meters</option>
                  <option>Feet</option>
                  <option>Links</option>
                  <option>Sets</option>
                </select>
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: C.navyMid, display: "block", marginBottom: 6 }}>Notes (Optional)</label>
              <textarea value={notes} onChange={e => setNotes(e.target.value)}
                style={{ width: "100%", padding: "9px 12px", border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 12, height: 70, resize: "vertical", boxSizing: "border-box" }}
                placeholder="Width, drive configuration, special requirements, operating conditions…" />
            </div>

            <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 7, padding: "8px 12px", fontSize: 10, color: "#92400e", marginBottom: 14 }}>
              Final specifications confirmed by Uniking before production.
            </div>

            <button onClick={handleSubmit} style={{ width: "100%", padding: "13px", background: "#16a34a", color: "#fff", border: "none", borderRadius: 10, cursor: "pointer", fontSize: 14, fontWeight: 900 }}>
              ✓ Confirm Add to RFQ
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function TableTopChains() {
  const [activeCat, setActiveCat] = useState("plastic");
  const [activeType, setActiveType] = useState(null);
  const [detailProduct, setDetailProduct] = useState(null);
  const [rfqItem, setRfqItem] = useState(null);
  const [rfqMsg, setRfqMsg] = useState(null);
  const [search, setSearch] = useState("");

  const category = CHAIN_CATEGORIES.find(c => c.id === activeCat);

  // When switching category reset type filter
  function handleCatChange(id) {
    setActiveCat(id);
    setActiveType(null);
    setSearch("");
  }

  const handleAddRFQ = useCallback((product, material) => {
    setRfqItem({ product, material });
  }, []);

  function handleRFQDirect(product, material) {
    // If material is provided directly (from material row), open modal right away
    setRfqItem({ product, material });
  }

  function handleRFQModalClose() {
    setRfqItem(null);
  }

  // Filter logic
  const typesToShow = activeType
    ? (category?.types || []).filter(t => t.id === activeType)
    : (category?.types || []);

  const searchLower = search.toLowerCase();
  function matchSearch(p) {
    if (!searchLower) return true;
    return (
      p.series.toLowerCase().includes(searchLower) ||
      p.shortDesc.toLowerCase().includes(searchLower) ||
      (p.applications || []).some(a => a.toLowerCase().includes(searchLower))
    );
  }

  // If detail view
  if (detailProduct) {
    return (
      <>
        <ChainProductDetail
          product={detailProduct}
          onBack={() => setDetailProduct(null)}
          onAddRFQ={handleRFQDirect}
        />
        {rfqItem && <RFQModal item={rfqItem} onClose={handleRFQModalClose} />}
        <RFQNotification message={rfqMsg} onDismiss={() => setRfqMsg(null)} />
      </>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "'Inter','Segoe UI',Arial,sans-serif" }}>

      {/* Top nav */}
      <div style={{ background: C.navy, borderBottom: "3px solid #C9A84C", position: "sticky", top: 0, zIndex: 200 }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 clamp(12px,4vw,20px)", display: "flex", alignItems: "center", justifyContent: "space-between", height: 56 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <Link to="/Home" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 28, height: 28, background: C.gold, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ color: C.navy, fontWeight: 900, fontSize: 13 }}>U</span>
              </div>
              <span style={{ color: "#fff", fontWeight: 700, fontSize: 15 }}>UniKonnect</span>
            </Link>
            <div style={{ width: 1, height: 22, background: "rgba(255,255,255,0.15)" }} />
            <span style={{ color: C.gold, fontSize: 13, fontWeight: 600 }}>Table Top Chains</span>
          </div>
          <Link to="/RFQCart" style={{ background: C.gold, color: C.navy, padding: "7px 16px", borderRadius: 8, fontSize: 13, fontWeight: 700, textDecoration: "none" }}>
            RFQ Cart
          </Link>
        </div>
      </div>

      {/* Hero */}
      <div style={{ background: `linear-gradient(135deg, ${C.navy} 0%, #1e3a6e 100%)`, padding: "28px clamp(16px,5vw,40px) 22px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8, flexWrap: "wrap" }}>
            <span style={{ background: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.8)", fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 14 }}>
              Multi-Brand · Product-First Procurement
            </span>
            <span style={{ background: "rgba(201,168,76,0.2)", color: C.gold, fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 14 }}>
              Movex · System Plast · Multi-Source
            </span>
          </div>
          <h1 style={{ color: "#fff", fontSize: 26, fontWeight: 900, margin: "0 0 8px" }}>Table Top Chain Catalog</h1>
          <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 13, margin: "0 0 14px", maxWidth: 620, lineHeight: 1.7 }}>
            Procurement-driven chain selection across all brands. Compare materials side-by-side. Add directly to RFQ. Brand is shown only when a material is exclusive.
          </p>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {["Plastic & Steel Chains", "1-inch to 2-inch Pitch", "Normalized Materials", "NGE · LF Acetal · Stainless Steel", "Straight-Running · Sideflexing · LBP"].map(tag => (
              <span key={tag} style={{ background: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.82)", fontSize: 10, padding: "3px 10px", borderRadius: 14 }}>{tag}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Main category selector */}
      <div style={{ background: "#fff", borderBottom: `1px solid ${C.border}`, position: "sticky", top: 56, zIndex: 100 }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 clamp(12px,4vw,20px)", display: "flex", alignItems: "center", gap: 0 }}>
          {CHAIN_CATEGORIES.map(cat => (
            <button key={cat.id} onClick={() => handleCatChange(cat.id)}
              style={{
                padding: "14px 24px", border: "none", background: "none", cursor: "pointer",
                fontSize: 14, fontWeight: activeCat === cat.id ? 800 : 500,
                color: activeCat === cat.id ? cat.color : C.muted,
                borderBottom: activeCat === cat.id ? `3px solid ${cat.color}` : "3px solid transparent",
                display: "flex", alignItems: "center", gap: 7, whiteSpace: "nowrap",
              }}>
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Category description + search + type filters */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "16px clamp(12px,4vw,20px) 0" }}>
        <div style={{ background: "#fff", borderRadius: 12, border: `1px solid ${C.border}`, padding: "14px 18px", marginBottom: 14, display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12, color: C.navyMid, fontWeight: 700 }}>{category?.label}</div>
            <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{category?.description}</div>
          </div>
          {/* Search */}
          <div style={{ position: "relative" }}>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search chains…"
              style={{ padding: "7px 12px 7px 30px", border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 12, width: 200, outline: "none" }}
            />
            <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", fontSize: 12, color: C.muted }}>🔍</span>
          </div>
        </div>

        {/* Type filter pills */}
        <div style={{ display: "flex", gap: 7, flexWrap: "wrap", marginBottom: 16 }}>
          <button
            onClick={() => setActiveType(null)}
            style={{ padding: "5px 14px", borderRadius: 20, border: `1px solid ${activeType === null ? category?.color : C.border}`, background: activeType === null ? category?.color : "#fff", color: activeType === null ? "#fff" : C.muted, cursor: "pointer", fontSize: 11, fontWeight: activeType === null ? 700 : 400 }}>
            All Types
          </button>
          {(category?.types || []).map(t => (
            <button key={t.id} onClick={() => setActiveType(t.id)}
              style={{ padding: "5px 14px", borderRadius: 20, border: `1px solid ${activeType === t.id ? category?.color : C.border}`, background: activeType === t.id ? category?.color : "#fff", color: activeType === t.id ? "#fff" : C.muted, cursor: "pointer", fontSize: 11, fontWeight: activeType === t.id ? 700 : 400 }}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Products by type */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 clamp(12px,4vw,20px) 60px" }}>
        {typesToShow.map(type => {
          const products = type.products.filter(matchSearch);
          if (products.length === 0) return null;
          return (
            <div key={type.id} style={{ marginBottom: 32 }}>
              {/* Type header */}
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                <div style={{ flex: 1, height: 1, background: C.border }} />
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 13, fontWeight: 800, color: C.navyMid }}>{type.label}</div>
                  <div style={{ fontSize: 10, color: C.muted, marginTop: 1 }}>{type.description}</div>
                </div>
                <div style={{ flex: 1, height: 1, background: C.border }} />
              </div>
              {/* Product grid */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: 16 }}>
                {products.map(product => (
                  <ChainProductCard
                    key={product.id}
                    product={product}
                    onViewDetails={setDetailProduct}
                    onAddRFQ={handleAddRFQ}
                  />
                ))}
              </div>
            </div>
          );
        })}

        {/* No results */}
        {typesToShow.every(t => t.products.filter(matchSearch).length === 0) && (
          <div style={{ textAlign: "center", padding: "40px 20px", color: C.muted }}>
            <div style={{ fontSize: 32, marginBottom: 10 }}>🔍</div>
            <div style={{ fontSize: 14, fontWeight: 700 }}>No chains found</div>
            <div style={{ fontSize: 12, marginTop: 4 }}>Try clearing your search or type filter</div>
          </div>
        )}

        {/* Footer note */}
        <div style={{ background: "#fff", borderRadius: 12, border: `1px solid ${C.border}`, padding: "16px 20px", marginTop: 16 }}>
          <div style={{ fontSize: 11, color: C.muted }}>
            <strong>Sources:</strong> Movex Conveyor Modular Belts & Chains Catalog (pp. 7–108) · System Plast Smart Guide Rev. 005 (Regal Rexnord).
            All specifications are non-brand-specific unless marked as exclusive. Final product selection and material confirmation by Uniking before purchase.
          </div>
        </div>
      </div>

      {/* RFQ Modal */}
      {rfqItem && <RFQModal item={rfqItem} onClose={handleRFQModalClose} />}
      <RFQNotification message={rfqMsg} onDismiss={() => setRfqMsg(null)} />
    </div>
  );
}