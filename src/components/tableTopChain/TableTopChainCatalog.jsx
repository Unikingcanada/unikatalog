/**
 * TableTopChainCatalog — Main procurement catalog for Table Top Chains
 * Product-first, brand-neutral. Two top-level categories: Plastic & Steel.
 */
import { useState } from "react";
import { CHAIN_PRODUCTS, CHAIN_CATEGORIES, CHAIN_TYPES, getProductsByCategory } from "@/lib/tableTopChainData";
import TTCProductCard from "./TTCProductCard";
import TTCProductDetail from "./TTCProductDetail";
import TTCRFQModal from "./TTCRFQModal";

const C = {
  navy: "#0C2340", navyMid: "#1A3A5C", gold: "#C9A84C",
  border: "#e2e8f0", muted: "#64748b", bg: "#f8fafc", text: "#0f172a",
  plastic: "#0057A8", steel: "#374151",
};

const TYPE_LABELS = {
  STRAIGHT: "Straight Running",
  SIDEFLEX: "Sideflexing",
  HEAVY: "Heavy Duty",
  LBP: "Low Back Pressure",
  HIGH_FRICTION: "High Friction",
  CASE: "Case Conveyor",
  MICRO: "Micro Pitch",
  FLUSH_GRID: "Flush Grid / Open",
};

const TYPE_ORDER = ["STRAIGHT", "SIDEFLEX", "HEAVY", "LBP", "HIGH_FRICTION", "CASE", "FLUSH_GRID", "MICRO"];

function CategoryTab({ label, active, color, count, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        flex: 1,
        padding: "14px 20px",
        background: active ? color : "#fff",
        color: active ? "#fff" : color,
        border: `2px solid ${color}`,
        borderRadius: 10,
        cursor: "pointer",
        fontWeight: 800,
        fontSize: 14,
        transition: "all 0.18s ease",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
      }}
    >
      <span>{active ? "●" : "○"}</span>
      {label}
      <span style={{
        background: active ? "rgba(255,255,255,0.2)" : `${color}15`,
        color: active ? "#fff" : color,
        fontSize: 11, fontWeight: 800,
        padding: "2px 8px", borderRadius: 8,
      }}>{count}</span>
    </button>
  );
}

function QuickRFQToast({ item, onDismiss }) {
  return (
    <div style={{
      position: "fixed", bottom: 24, right: 24, zIndex: 9999,
      background: "#fff", borderRadius: 12, padding: "14px 18px",
      boxShadow: "0 8px 40px rgba(0,0,0,0.18)", border: "1.5px solid #86efac",
      maxWidth: 340, display: "flex", gap: 12, alignItems: "flex-start",
    }}>
      <span style={{ fontSize: 22, flexShrink: 0 }}>✅</span>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "#166534", marginBottom: 2 }}>Added to RFQ</div>
        <div style={{ fontSize: 11, color: "#4b7a5c", lineHeight: 1.5 }}>{item?.name}</div>
      </div>
      <button onClick={onDismiss} style={{ background: "none", border: "none", cursor: "pointer", color: C.muted, fontSize: 16, padding: 0, flexShrink: 0 }}>✕</button>
    </div>
  );
}

export default function TableTopChainCatalog({ onBack }) {
  const [activeCategory, setActiveCategory] = useState("PLASTIC");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState(null);
  const [rfqProduct, setRfqProduct] = useState(null);
  const [rfqInitialWidth, setRfqInitialWidth] = useState(null);

  const accentColor = activeCategory === "STEEL" ? C.steel : C.plastic;
  const allProducts = getProductsByCategory(activeCategory);

  // Get available types for this category
  const availableTypes = [...new Set(allProducts.map(p => p.type))];
  const orderedTypes = TYPE_ORDER.filter(t => availableTypes.includes(t));

  // Filter
  const filtered = allProducts.filter(p => {
    const matchType = typeFilter === "ALL" || p.type === typeFilter;
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase()) ||
      p.applications.some(a => a.toLowerCase().includes(search.toLowerCase()));
    return matchType && matchSearch;
  });

  // Group by type
  const grouped = {};
  orderedTypes.forEach(t => {
    const items = filtered.filter(p => p.type === t);
    if (items.length > 0) grouped[t] = items;
  });

  const plasticCount = getProductsByCategory("PLASTIC").length;
  const steelCount = getProductsByCategory("STEEL").length;

  function handleAddRFQ(product, selectedWidth) {
    setRfqProduct(product);
    setRfqInitialWidth(selectedWidth || null);
  }

  function handleRFQConfirm(cartItem) {
    const cart = JSON.parse(localStorage.getItem("uniking_rfq_cart") || "[]");
    cart.push(cartItem);
    localStorage.setItem("uniking_rfq_cart", JSON.stringify(cart));
    window.dispatchEvent(new Event("rfq_cart_updated"));
    setToast({ name: cartItem.name });
    setRfqProduct(null);
    setTimeout(() => setToast(null), 4000);
  }

  // ── Detail view ───────────────────────────────────────────────────────────
  if (selectedProduct) {
    return (
      <div>
        <TTCProductDetail
          product={selectedProduct}
          onBack={() => setSelectedProduct(null)}
          onAddRFQ={(item) => {
            setToast({ name: item.name });
            setTimeout(() => setToast(null), 4000);
          }}
        />
        {toast && <QuickRFQToast item={toast} onDismiss={() => setToast(null)} />}
      </div>
    );
  }

  // ── Catalog grid ──────────────────────────────────────────────────────────
  return (
    <div>
      {/* Header */}
      <div style={{ padding: "24px clamp(14px,4vw,28px) 16px", background: C.bg }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: "1px", marginBottom: 6 }}>Procurement Catalog</div>
        <h1 style={{ fontSize: 22, fontWeight: 900, color: C.text, margin: "0 0 6px" }}>Table Top Chains</h1>
        <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.7, margin: 0 }}>
          Unified product-first catalog. Select the right chain and material — regardless of brand.
          Source: Movex Imperial Catalog (p. 7–108) + System Plast Smart Guide.
        </p>
      </div>

      {/* Category Selector */}
      <div style={{ background: "#fff", borderBottom: `1px solid ${C.border}`, padding: "16px clamp(14px,4vw,28px)" }}>
        <div style={{ display: "flex", gap: 12, maxWidth: 600 }}>
          <CategoryTab
            label="Plastic Table Top Chains"
            active={activeCategory === "PLASTIC"}
            color={C.plastic}
            count={plasticCount}
            onClick={() => { setActiveCategory("PLASTIC"); setTypeFilter("ALL"); }}
          />
          <CategoryTab
            label="Steel Table Top Chains"
            active={activeCategory === "STEEL"}
            color={C.steel}
            count={steelCount}
            onClick={() => { setActiveCategory("STEEL"); setTypeFilter("ALL"); }}
          />
        </div>
      </div>

      {/* Filters */}
      <div style={{ background: "#fff", borderBottom: `1px solid ${C.border}`, padding: "10px clamp(14px,4vw,28px)", display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
        {/* Search */}
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by name, application…"
          style={{
            padding: "7px 12px", border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 12,
            outline: "none", minWidth: 200, color: C.text,
          }}
        />

        {/* Type filters */}
        <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
          <button
            onClick={() => setTypeFilter("ALL")}
            style={{
              padding: "5px 12px", borderRadius: 20,
              border: `1px solid ${typeFilter === "ALL" ? accentColor : C.border}`,
              background: typeFilter === "ALL" ? accentColor : "#fff",
              color: typeFilter === "ALL" ? "#fff" : C.muted,
              cursor: "pointer", fontSize: 11, fontWeight: typeFilter === "ALL" ? 700 : 400,
            }}
          >All Types</button>
          {orderedTypes.map(t => (
            <button key={t} onClick={() => setTypeFilter(t)}
              style={{
                padding: "5px 12px", borderRadius: 20,
                border: `1px solid ${typeFilter === t ? accentColor : C.border}`,
                background: typeFilter === t ? accentColor : "#fff",
                color: typeFilter === t ? "#fff" : C.muted,
                cursor: "pointer", fontSize: 11, fontWeight: typeFilter === t ? 700 : 400,
              }}
            >{TYPE_LABELS[t]}</button>
          ))}
        </div>
        <div style={{ marginLeft: "auto", fontSize: 11, color: C.muted }}>{filtered.length} products</div>
      </div>

      {/* Product Grid — grouped by type */}
      <div style={{ padding: "24px clamp(14px,4vw,28px)", background: C.bg }}>
        {Object.keys(grouped).map(typeKey => (
          <div key={typeKey} style={{ marginBottom: 32 }}>
            {/* Section header */}
            <div style={{
              display: "flex", alignItems: "center", gap: 12, marginBottom: 16,
            }}>
              <div style={{
                background: accentColor, color: "#fff", fontSize: 10, fontWeight: 800,
                padding: "4px 12px", borderRadius: 6, textTransform: "uppercase", letterSpacing: "0.5px",
                whiteSpace: "nowrap",
              }}>
                {TYPE_LABELS[typeKey]}
              </div>
              <div style={{ flex: 1, height: 1, background: C.border }} />
              <span style={{ fontSize: 11, color: C.muted, whiteSpace: "nowrap" }}>{grouped[typeKey].length} series</span>
            </div>

            {/* Cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 16 }}>
              {grouped[typeKey].map(product => (
                <TTCProductCard
                  key={product.id}
                  product={product}
                  onViewDetails={setSelectedProduct}
                  onAddRFQ={handleAddRFQ}
                />
              ))}
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: "48px 20px", color: C.muted }}>
            <div style={{ fontSize: 40, marginBottom: 10 }}>🔍</div>
            <div style={{ fontSize: 14, fontWeight: 700 }}>No products match your filters</div>
            <div style={{ fontSize: 12, marginTop: 4 }}>Try clearing search or selecting a different type</div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{ background: "#fff", borderTop: `1px solid ${C.border}`, padding: "14px clamp(14px,4vw,28px)" }}>
        <div style={{ fontSize: 11, color: C.muted, maxWidth: 800 }}>
          <strong>Sources:</strong> Movex Conveyor Modular Belts and Chains Catalog — Imperial Version (pages 7–108, 2024) and System Plast Smart Guide Rev.005.
          All specifications are sourced directly from official catalogs. Final selection and specifications must be confirmed by Uniking before production.
        </div>
      </div>

      {toast && <QuickRFQToast item={toast} onDismiss={() => setToast(null)} />}

      {rfqProduct && (
        <TTCRFQModal
          product={rfqProduct}
          initialWidth={rfqInitialWidth}
          onConfirm={handleRFQConfirm}
          onClose={() => setRfqProduct(null)}
        />
      )}
    </div>
  );
}