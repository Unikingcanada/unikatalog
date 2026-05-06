/**
 * ChainCategoryView — Shows all products for a given chain category, grouped by subcategory.
 */
import { useState } from "react";
import { CHAIN_PRODUCTS, getProductsByCategory } from "@/lib/chainCatalogData";
import ChainProductCard from "./ChainProductCard";

const C = {
  navy: "#0C2340", navyMid: "#1A3A5C", navyLight: "#2A5080",
  gold: "#C9A84C", border: "#e2e8f0", muted: "#64748b", bg: "#f8fafc", text: "#0f172a",
};

export default function ChainCategoryView({ category, onBack, onSelectProduct }) {
  const [subcategoryFilter, setSubcategoryFilter] = useState("all");
  const [search, setSearch] = useState("");

  const products = getProductsByCategory(category.key);

  const filtered = products.filter(p => {
    const matchSub = subcategoryFilter === "all" || p.subcategory === subcategoryFilter;
    const matchSearch = !search || p.chain_number?.toLowerCase().includes(search.toLowerCase()) ||
      p.product_type?.toLowerCase().includes(search.toLowerCase()) ||
      p.description?.toLowerCase().includes(search.toLowerCase());
    return matchSub && matchSearch;
  });

  // Group by subcategory
  const grouped = {};
  const subcatOrder = category.subcategories?.map(s => s.key) || [];
  subcatOrder.forEach(key => {
    const items = filtered.filter(p => p.subcategory === key);
    if (items.length > 0) grouped[key] = items;
  });
  // Any uncategorized
  const uncategorized = filtered.filter(p => !subcatOrder.includes(p.subcategory));
  if (uncategorized.length > 0) grouped["_other"] = uncategorized;

  const subcatLabel = (key) => {
    if (key === "_other") return "Other";
    return category.subcategories?.find(s => s.key === key)?.label || key;
  };

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "'Inter','Segoe UI',Arial,sans-serif" }}>

      {/* Header */}
      <div style={{ background: `linear-gradient(135deg, ${C.navy} 0%, ${C.navyLight} 100%)`, padding: "24px clamp(16px,4vw,40px)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <button onClick={onBack}
            style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", color: "#fff", borderRadius: 7, padding: "5px 12px", cursor: "pointer", fontSize: 12, marginBottom: 14 }}>
            ← Back to Chain Catalog
          </button>
          <h1 style={{ color: "#fff", fontSize: 24, fontWeight: 900, margin: 0, marginBottom: 6 }}>{category.label}</h1>
          <p style={{ color: "rgba(255,255,255,0.65)", fontSize: 13, maxWidth: 580, lineHeight: 1.7, margin: "0 0 16px" }}>{category.description}</p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
            <div style={{ position: "relative" }}>
              <input
                type="text" value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search this category…"
                style={{ padding: "8px 12px 8px 34px", borderRadius: 8, border: "none", fontSize: 12, width: 220, outline: "none" }}
              />
              <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", fontSize: 12, color: C.muted }}>🔍</span>
            </div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.6)" }}>{filtered.length} products</div>
          </div>
        </div>
      </div>

      {/* Subcategory filter bar */}
      {category.subcategories?.length > 1 && (
        <div style={{ background: "#fff", borderBottom: `1px solid ${C.border}`, padding: "10px clamp(16px,4vw,40px)", display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
          <button onClick={() => setSubcategoryFilter("all")}
            style={{ padding: "5px 14px", borderRadius: 20, border: `1px solid ${subcategoryFilter === "all" ? category.color : C.border}`, background: subcategoryFilter === "all" ? category.color : "#fff", color: subcategoryFilter === "all" ? "#fff" : C.muted, cursor: "pointer", fontSize: 11, fontWeight: subcategoryFilter === "all" ? 700 : 400 }}>
            All ({products.length})
          </button>
          {category.subcategories.map(sub => {
            const count = products.filter(p => p.subcategory === sub.key).length;
            if (count === 0) return null;
            return (
              <button key={sub.key} onClick={() => setSubcategoryFilter(sub.key)}
                style={{ padding: "5px 14px", borderRadius: 20, border: `1px solid ${subcategoryFilter === sub.key ? category.color : C.border}`, background: subcategoryFilter === sub.key ? category.color : "#fff", color: subcategoryFilter === sub.key ? "#fff" : C.muted, cursor: "pointer", fontSize: 11, fontWeight: subcategoryFilter === sub.key ? 700 : 400 }}>
                {sub.label} ({count})
              </button>
            );
          })}
        </div>
      )}

      {/* Product grid */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "24px clamp(16px,4vw,40px) 80px" }}>
        {Object.keys(grouped).length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 20px", color: C.muted }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
            <div style={{ fontSize: 14, fontWeight: 700 }}>No products match your filters.</div>
          </div>
        ) : (
          Object.entries(grouped).map(([subKey, items]) => (
            <div key={subKey} style={{ marginBottom: 36 }}>
              {/* Subcategory header */}
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                <div style={{ background: category.color, color: "#fff", fontSize: 10, fontWeight: 800, padding: "4px 12px", borderRadius: 6, textTransform: "uppercase", letterSpacing: "0.5px", whiteSpace: "nowrap" }}>
                  {subcatLabel(subKey)}
                </div>
                <div style={{ flex: 1, height: 1, background: C.border }} />
                <span style={{ fontSize: 11, color: C.muted, whiteSpace: "nowrap" }}>{items.length} products</span>
              </div>

              {/* Cards */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(270px, 1fr))", gap: 16 }}>
                {items.map(product => (
                  <ChainProductCard key={product.id} product={product} accentColor={category.color} onViewDetails={onSelectProduct} />
                ))}
              </div>
            </div>
          ))
        )}

        {/* Disclaimer */}
        <div style={{ background: "#fff", borderRadius: 10, border: `1px solid ${C.border}`, padding: "14px 18px", fontSize: 11, color: C.muted }}>
          ⚠ All specifications are sourced from MAC Chain and Allied-Locke Industries catalogs. Final product selection and specifications must be confirmed by Uniking before procurement. Items marked "Missing Data – Needs Mapping" require additional data entry.
        </div>
      </div>
    </div>
  );
}