import { useState } from "react";
import { SUBCATEGORIES, PRODUCTS, getProductsBySubcategory } from "@/lib/fourBData";
import FourBProductCard from "./FourBProductCard";
import FourBProductDetail from "./FourBProductDetail";

const FOURBRED = "#cc0000";
const NAVY = "#0f2340";
const NAVYMID = "#1a3a5c";
const BORDER = "#e2e8f0";
const BG = "#f8fafc";

const FOURBLOGO = "https://www.go4b.com/usa/images/misc/4b-logo.gif";

function SubcategoryCard({ sub, count, hovered, setHovered, onSelect }) {
  const isHov = hovered === sub.key;
  return (
    <div
      onClick={() => onSelect(sub.key)}
      onMouseEnter={() => setHovered(sub.key)}
      onMouseLeave={() => setHovered(null)}
      style={{
        background: "#fff",
        border: `1px solid ${isHov ? FOURBRED : BORDER}`,
        borderRadius: 10,
        cursor: "pointer",
        overflow: "hidden",
        transition: "all 0.18s",
        display: "flex", flexDirection: "column",
        boxShadow: isHov ? "0 6px 20px rgba(204,0,0,0.12)" : "0 1px 4px rgba(0,0,0,0.05)",
      }}>
      {/* Image */}
      <div style={{ height: 120, background: "#f1f5f9", overflow: "hidden", position: "relative", flexShrink: 0 }}>
        <img src={sub.heroImage} alt={sub.label}
          style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.3s", transform: isHov ? "scale(1.06)" : "scale(1)" }}
          onError={e => { e.target.parentElement.style.background = "#e2e8f0"; e.target.style.display = "none"; }} />
        <div style={{ position: "absolute", inset: 0, background: isHov ? "rgba(204,0,0,0.35)" : "rgba(0,0,0,0.15)", transition: "background 0.18s" }} />
        <div style={{ position: "absolute", top: 8, left: 8, fontSize: 22 }}>{sub.icon}</div>
      </div>
      {/* Content */}
      <div style={{ padding: "12px 14px", flex: 1, display: "flex", flexDirection: "column", gap: 5 }}>
        <div style={{ height: 2, background: FOURBRED, borderRadius: 2, marginBottom: 4, width: isHov ? "100%" : "30%", transition: "width 0.25s" }} />
        <div style={{ fontSize: 13, fontWeight: 800, color: isHov ? FOURBRED : NAVY }}>{sub.label}</div>
        <div style={{ fontSize: 11, color: "#64748b", lineHeight: 1.5 }}>{sub.description}</div>
        <div style={{ fontSize: 11, color: isHov ? FOURBRED : "#94a3b8", fontWeight: isHov ? 700 : 400, marginTop: 4 }}>
          {count ? `${count} products →` : "View →"}
        </div>
      </div>
    </div>
  );
}

export default function FourBCatalog({ onBack, onGoRFQ }) {
  const [activeSubcat, setActiveSubcat] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [hovered, setHovered] = useState(null);
  const [search, setSearch] = useState("");

  function handleBack() {
    if (activeSubcat) { setActiveSubcat(null); setSearch(""); return; }
    onBack();
  }

  const subcatProducts = activeSubcat ? getProductsBySubcategory(activeSubcat) : [];
  const filteredProducts = search.trim()
    ? subcatProducts.filter(p => {
        const q = search.toLowerCase();
        return (
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.keyFunction.toLowerCase().includes(q) ||
          p.features?.some(f => f.toLowerCase().includes(q))
        );
      })
    : subcatProducts;

  const activeSub = SUBCATEGORIES.find(s => s.key === activeSubcat);

  return (
    <div style={{ minHeight: "100vh", background: BG, fontFamily: "'Inter','Segoe UI',Arial,sans-serif" }}>

      {/* Product detail modal */}
      {selectedProduct && (
        <FourBProductDetail
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onSelectProduct={p => setSelectedProduct(p)}
        />
      )}

      {/* Home — subcategory grid */}
      {!activeSubcat && (
        <>
          {/* Subcategory grid */}
          <div style={{ maxWidth: 1200, margin: "0 auto", padding: "28px clamp(12px,4vw,28px) 80px" }}>
            {/* Page title */}
            <div style={{ marginBottom: 22 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 6 }}>4B Braime™ · Authorized Distributor</div>
              <h1 style={{ fontSize: 22, fontWeight: 900, color: NAVY, margin: "0 0 6px" }}>4B Electronics & Monitoring</h1>
              <p style={{ fontSize: 13, color: "#64748b", lineHeight: 1.7, margin: 0 }}>
                Industry-leading hazard monitoring, alignment, speed, temperature and level sensing systems for bucket elevators and conveyors. CSA, ATEX and CE approved for dust hazard environments.
              </p>
            </div>
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 13, color: "#64748b", fontWeight: 700 }}>
                {PRODUCTS.length} products across {SUBCATEGORIES.length} categories — all directly sourced from go4b.com
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 14, marginBottom: 48 }}>
              {SUBCATEGORIES.map(sub => (
                <SubcategoryCard
                  key={sub.key}
                  sub={sub}
                  count={getProductsBySubcategory(sub.key).length}
                  hovered={hovered}
                  setHovered={setHovered}
                  onSelect={setActiveSubcat}
                />
              ))}
            </div>

            {/* About 4B strip */}
            <div style={{ background: "#fff", borderRadius: 12, border: `1px solid ${BORDER}`, padding: "22px 28px", display: "flex", gap: 20, alignItems: "center", flexWrap: "wrap" }}>
              <div style={{ background: FOURBRED, color: "#fff", fontSize: 24, fontWeight: 900, padding: "6px 16px", borderRadius: 8, flexShrink: 0 }}>4B</div>
              <div style={{ flex: 1, minWidth: 200 }}>
                <div style={{ fontSize: 15, fontWeight: 800, color: NAVY, marginBottom: 4 }}>About 4B Braime™</div>
                <div style={{ fontSize: 12, color: "#64748b", lineHeight: 1.7 }}>
                  4B is an industry leader in developing high quality, innovative and dependable electronic monitoring components for bucket elevators and conveyors in dust hazard environments. All products are CSA, ATEX and CE approved where applicable.
                </div>
              </div>
              <a href="https://www.go4b.com/usa/about-4B/default.asp" target="_blank" rel="noopener noreferrer"
                style={{ background: FOURBRED, color: "#fff", padding: "9px 18px", borderRadius: 8, fontSize: 12, fontWeight: 700, textDecoration: "none", flexShrink: 0 }}>
                About 4B ↗
              </a>
            </div>
          </div>
        </>
      )}

      {/* Subcategory product list */}
      {activeSubcat && activeSub && (
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "28px clamp(12px,4vw,28px) 80px" }}>
          {/* Header */}
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24, gap: 16, flexWrap: "wrap" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                <span style={{ fontSize: 22 }}>{activeSub.icon}</span>
                <div style={{ fontSize: 20, fontWeight: 800, color: NAVY }}>{activeSub.label}</div>
              </div>
              <div style={{ fontSize: 13, color: "#64748b", maxWidth: 560, lineHeight: 1.6 }}>{activeSub.description}</div>
              <div style={{ marginTop: 8 }}>
                <span style={{ fontSize: 12, color: "#64748b" }}>{filteredProducts.length} of {subcatProducts.length} products</span>
                <a href={activeSub.url} target="_blank" rel="noopener noreferrer"
                  style={{ marginLeft: 14, fontSize: 11, fontWeight: 700, color: FOURBRED, textDecoration: "none" }}>
                  View on go4b.com ↗
                </a>
              </div>
            </div>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search products..."
              style={{ padding: "8px 14px", border: `1px solid ${BORDER}`, borderRadius: 8, fontSize: 13, outline: "none", width: 220 }}
            />
          </div>

          {/* Products grid */}
          {filteredProducts.length === 0 ? (
            <div style={{ textAlign: "center", padding: 60, color: "#94a3b8" }}>No products match your search.</div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: 16 }}>
              {filteredProducts.map(p => (
                <FourBProductCard key={p.id} product={p} onClick={setSelectedProduct} />
              ))}
            </div>
          )}

          {/* Disclaimer */}
          <div style={{ marginTop: 40, padding: "12px 16px", background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 8, fontSize: 11, color: "#92400e" }}>
            ⚠ All product information is sourced directly from 4B Braime™ (go4b.com). Approvals shown are as listed on the 4B website. Final product selection and specifications must be confirmed by Uniking before supply.
          </div>
        </div>
      )}
    </div>
  );
}