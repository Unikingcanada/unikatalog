/**
 * ChainCatalogHome — Landing grid for the unified chain catalog.
 * Brand-neutral. Browse by chain type.
 */
import { useState } from "react";
import { CHAIN_CATEGORIES, CHAIN_PRODUCTS, searchChainProducts } from "@/lib/chainCatalogData";

const C = {
  navy: "#0C2340", navyMid: "#1A3A5C", navyLight: "#2A5080",
  gold: "#C9A84C", border: "#e2e8f0", muted: "#64748b", bg: "#f8fafc", text: "#0f172a",
};

export default function ChainCatalogHome({ onSelectCategory, onSelectProduct, onBack }) {
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState(null);

  function handleSearch(e) {
    const q = e.target.value;
    setSearch(q);
    if (q.trim().length >= 2) {
      setSearchResults(searchChainProducts(q));
    } else {
      setSearchResults(null);
    }
  }

  function addRFQ(e, product) {
    e.stopPropagation();
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
  }

  const totalProducts = CHAIN_PRODUCTS.length;

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "'Inter','Segoe UI',Arial,sans-serif" }}>

      {/* Hero */}
      <div style={{ background: `linear-gradient(135deg, ${C.navy} 0%, ${C.navyLight} 100%)`, padding: "28px clamp(16px,4vw,40px) 24px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          {onBack && (
            <button onClick={onBack}
              style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", color: "#fff", borderRadius: 7, padding: "5px 12px", cursor: "pointer", fontSize: 12, marginBottom: 16 }}>
              ← Back
            </button>
          )}
          <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 10, letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: 6 }}>
            Procurement Catalog
          </div>
          <h1 style={{ color: "#fff", fontSize: 28, fontWeight: 900, margin: "0 0 8px" }}>Industrial Chain Catalog</h1>
          <p style={{ color: "rgba(255,255,255,0.65)", fontSize: 13, maxWidth: 600, lineHeight: 1.7, margin: "0 0 20px" }}>
            Unified, brand-neutral catalog. Browse by chain type and standard number. Sources: MAC Chain + Allied-Locke Industries.
          </p>

          {/* Search */}
          <div style={{ maxWidth: 500, position: "relative" }}>
            <input
              type="text"
              value={search}
              onChange={handleSearch}
              placeholder='Search by chain number, type, or industry (e.g. "40", "roller", "mining")'
              style={{
                width: "100%", boxSizing: "border-box",
                padding: "12px 16px 12px 40px",
                borderRadius: 10, border: "none",
                fontSize: 13, outline: "none",
                boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
              }}
            />
            <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", fontSize: 14, color: C.muted }}>🔍</span>
          </div>

          {/* Stats */}
          <div style={{ display: "flex", gap: 16, marginTop: 20, flexWrap: "wrap" }}>
            {[
              ["Chain Types", CHAIN_CATEGORIES.length],
              ["Products in Catalog", totalProducts + "+"],
              ["Sources", "MAC Chain + Allied-Locke"],
              ["Standard", "ANSI / ISO / BS"],
            ].map(([k, v]) => (
              <div key={k} style={{ background: "rgba(255,255,255,0.08)", borderRadius: 8, padding: "8px 16px", textAlign: "center" }}>
                <div style={{ fontSize: 16, fontWeight: 900, color: C.gold }}>{v}</div>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.55)", marginTop: 2 }}>{k}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Search Results */}
      {searchResults && (
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "20px clamp(16px,4vw,40px)" }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.navyMid, marginBottom: 12 }}>
            {searchResults.length} result{searchResults.length !== 1 ? "s" : ""} for "{search}"
          </div>
          {searchResults.length === 0 ? (
            <div style={{ background: "#fff", borderRadius: 12, padding: "24px", textAlign: "center", color: C.muted, border: `1px solid ${C.border}` }}>
              No chains found. Try a different chain number or type, or <a href="#" onClick={e => { e.preventDefault(); setSearch(""); setSearchResults(null); }} style={{ color: C.navyMid, fontWeight: 700 }}>browse categories below</a>.
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px,1fr))", gap: 14, marginBottom: 32 }}>
              {searchResults.map(p => (
                <ChainSearchCard key={p.id} product={p} onView={() => onSelectProduct(p)} onAddRFQ={addRFQ} />
              ))}
            </div>
          )}
          <button onClick={() => { setSearch(""); setSearchResults(null); }}
            style={{ background: C.navyMid, color: "#fff", border: "none", borderRadius: 8, padding: "8px 20px", cursor: "pointer", fontSize: 12, fontWeight: 700 }}>
            Clear Search — Browse All Categories
          </button>
        </div>
      )}

      {/* Category Grid */}
      {!searchResults && (
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "28px clamp(16px,4vw,40px) 80px" }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 18 }}>Browse by Chain Type</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(310px, 1fr))", gap: 18 }}>
            {CHAIN_CATEGORIES.map(cat => (
              <CategoryCard key={cat.key} category={cat} onClick={() => onSelectCategory(cat)} />
            ))}
          </div>

          {/* Source note */}
          <div style={{ marginTop: 40, background: "#fff", borderRadius: 12, border: `1px solid ${C.border}`, padding: "18px 22px" }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: C.navyMid, marginBottom: 6 }}>Data Sources</div>
            <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.7 }}>
              This catalog combines data from <strong>MAC Chain</strong> and <strong>Allied-Locke Industries</strong>. Chains are listed by standard number — not by brand. Where both sources list the same chain, specifications have been merged. All specifications should be confirmed with Uniking before production. "Missing Data – Needs Mapping" items exist in the catalog but require additional data entry.
            </div>
            <div style={{ display: "flex", gap: 12, marginTop: 12, flexWrap: "wrap" }}>
              <a href="https://macchain.com/chains" target="_blank" rel="noreferrer"
                style={{ fontSize: 11, fontWeight: 700, color: C.navyMid, textDecoration: "none" }}>
                📄 MAC Chain Website ↗
              </a>
              <a href="https://chains.alliedlocke.com/category/all-categories" target="_blank" rel="noreferrer"
                style={{ fontSize: 11, fontWeight: 700, color: C.navyMid, textDecoration: "none" }}>
                📄 Allied-Locke Catalog ↗
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CategoryCard({ category, onClick }) {
  const [hov, setHov] = useState(false);
  const count = CHAIN_PRODUCTS.filter(p => p.category === category.key).length;
  return (
    <div
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      onClick={onClick}
      style={{
        background: "#fff",
        borderRadius: 14,
        border: `2px solid ${hov ? category.color : C.border}`,
        overflow: "hidden",
        cursor: "pointer",
        transition: "all 0.18s",
        boxShadow: hov ? "0 8px 28px rgba(15,35,64,0.12)" : "0 1px 4px rgba(0,0,0,0.04)",
        transform: hov ? "translateY(-2px)" : "none",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Color bar */}
      <div style={{ height: 4, background: category.color }} />

      {/* Image */}
      {category.image && (
        <div style={{ height: 90, overflow: "hidden", background: "#f8fafc" }}>
          <img src={category.image} alt={category.label}
            style={{ width: "100%", height: "100%", objectFit: "cover", opacity: hov ? 1 : 0.85, transition: "opacity 0.15s" }} />
        </div>
      )}

      {/* Content */}
      <div style={{ padding: "16px 18px", flex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
          <span style={{ fontSize: 18 }}>{category.icon}</span>
          <div style={{ fontSize: 15, fontWeight: 800, color: C.text }}>{category.label}</div>
        </div>
        <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.65, marginBottom: 12 }}>{category.description}</div>

        {/* Subcategory tags */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 12 }}>
          {category.subcategories?.slice(0, 4).map(sub => (
            <span key={sub.key} style={{ fontSize: 10, fontWeight: 600, background: `${category.color}12`, color: category.color, padding: "2px 7px", borderRadius: 8 }}>{sub.label}</span>
          ))}
          {(category.subcategories?.length || 0) > 4 && (
            <span style={{ fontSize: 10, fontWeight: 600, background: "#f1f5f9", color: C.muted, padding: "2px 7px", borderRadius: 8 }}>+{category.subcategories.length - 4} more</span>
          )}
        </div>
      </div>

      {/* Footer */}
      <div style={{ padding: "10px 18px 14px", borderTop: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: 11, color: C.muted }}>{count > 0 ? `${count} products` : "View catalog"}</span>
        <span style={{ fontSize: 12, fontWeight: 700, color: category.color }}>Browse →</span>
      </div>
    </div>
  );
}

function ChainSearchCard({ product, onView, onAddRFQ }) {
  return (
    <div style={{ background: "#fff", borderRadius: 12, border: `1px solid ${C.border}`, overflow: "hidden", cursor: "pointer" }} onClick={onView}>
      <div style={{ display: "flex", gap: 0 }}>
        {product.image && (
          <div style={{ width: 70, flexShrink: 0, background: "#f8fafc" }}>
            <img src={product.image} alt={product.chain_number} style={{ width: "100%", height: 70, objectFit: "cover" }} />
          </div>
        )}
        <div style={{ padding: "12px 14px", flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: C.text, marginBottom: 2 }}>{product.chain_number}</div>
          <div style={{ fontSize: 11, color: C.muted, marginBottom: 6 }}>{product.product_type}</div>
          <div style={{ fontSize: 11, color: C.text, lineHeight: 1.5 }}>{product.description?.slice(0, 80)}…</div>
        </div>
      </div>
      <div style={{ padding: "8px 14px 10px", borderTop: `1px solid ${C.border}`, display: "flex", gap: 8 }}>
        <button onClick={onView}
          style={{ flex: 1, padding: "6px", background: C.navyMid, color: "#fff", border: "none", borderRadius: 7, cursor: "pointer", fontSize: 11, fontWeight: 700 }}>
          View Details
        </button>
        <button onClick={e => onAddRFQ(e, product)}
          style={{ flex: 1, padding: "6px", background: C.gold, color: C.navy, border: "none", borderRadius: 7, cursor: "pointer", fontSize: 11, fontWeight: 700 }}>
          + RFQ
        </button>
      </div>
    </div>
  );
}