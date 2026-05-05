import { useState, useMemo } from "react";
import {
  SHARPTOP_SUBCATEGORIES,
  SHARPTOP_PRODUCTS,
  TOOTH_CONFIGS,
  getProductsBySubcategory,
} from "@/lib/sharpTopData";
import SharpTopIntro from "./SharpTopIntro";
import SharpTopProductCard from "./SharpTopProductCard";
import SharpTopProductDetail from "./SharpTopProductDetail";

const C = { navy: "#0F2340", navyMid: "#1A3A5C", gold: "#C9A84C", border: "#e2e8f0", muted: "#64748b", text: "#0f172a", bg: "#f8fafc" };

function SubcategoryGrid({ onSelect }) {
  const [hovered, setHovered] = useState(null);
  const counts = useMemo(() => {
    const c = {};
    for (const s of SHARPTOP_SUBCATEGORIES) c[s.key] = getProductsBySubcategory(s.key).length;
    return c;
  }, []);

  return (
    <div>
      <SharpTopIntro />
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 20, fontWeight: 800, color: C.text, marginBottom: 4 }}>SharpTop Chain Categories</div>
        <div style={{ fontSize: 13, color: C.muted }}>{SHARPTOP_PRODUCTS.length} normalized chain configurations across {SHARPTOP_SUBCATEGORIES.length} categories</div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(270px, 1fr))", gap: 14 }}>
        {SHARPTOP_SUBCATEGORIES.map(sub => {
          const isHov = hovered === sub.key;
          return (
            <div
              key={sub.key}
              onClick={() => onSelect(sub.key)}
              onMouseEnter={() => setHovered(sub.key)}
              onMouseLeave={() => setHovered(null)}
              style={{
                background: isHov ? C.navyMid : "#fff",
                border: `1px solid ${isHov ? C.navyMid : C.border}`,
                borderRadius: 10, cursor: "pointer", transition: "all 0.18s",
                display: "flex", flexDirection: "column", overflow: "hidden",
                boxShadow: isHov ? "0 6px 24px rgba(15,35,64,0.14)" : "0 1px 4px rgba(15,35,64,0.05)",
              }}
            >
              <div style={{ padding: "18px 20px", flex: 1 }}>
                <div style={{ fontSize: 22, marginBottom: 8 }}>{sub.icon}</div>
                <div style={{ fontSize: 14, fontWeight: 800, color: isHov ? "#fff" : C.text, marginBottom: 5 }}>{sub.label}</div>
                <div style={{ fontSize: 12, color: isHov ? "rgba(255,255,255,0.65)" : C.muted, lineHeight: 1.6, marginBottom: 10 }}>{sub.description}</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                  {sub.pitches.map(p => (
                    <span key={p} style={{ fontSize: 10, padding: "2px 8px", borderRadius: 10, background: isHov ? "rgba(255,255,255,0.15)" : "#f1f5f9", color: isHov ? "rgba(255,255,255,0.85)" : C.muted, fontWeight: 600 }}>{p}</span>
                  ))}
                </div>
              </div>
              <div style={{ padding: "10px 20px", borderTop: `1px solid ${isHov ? "rgba(255,255,255,0.1)" : C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 11, color: isHov ? "rgba(255,255,255,0.65)" : C.muted }}>{counts[sub.key]} products</span>
                <span style={{ fontSize: 11, color: isHov ? "rgba(255,255,255,0.8)" : C.navyMid, fontWeight: 700 }}>Browse →</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ProductGrid({ subcategoryKey, onBack, onGoRFQ }) {
  const sub = SHARPTOP_SUBCATEGORIES.find(s => s.key === subcategoryKey);
  const products = useMemo(() => getProductsBySubcategory(subcategoryKey), [subcategoryKey]);
  const [search, setSearch] = useState("");
  const [selectedConfig, setSelectedConfig] = useState("all");
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Collect all configs present in this subcategory
  const allConfigs = useMemo(() => {
    const s = new Set();
    products.forEach(p => p.available_configs?.forEach(c => s.add(c)));
    return ["all", ...s];
  }, [products]);

  const filtered = useMemo(() => {
    let list = products;
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(p =>
        p.chain_number.toLowerCase().includes(q) ||
        p.display_name.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q) ||
        p.applications?.some(a => a.toLowerCase().includes(q)) ||
        String(p.pitch_in).includes(q)
      );
    }
    if (selectedConfig !== "all") {
      list = list.filter(p => p.available_configs?.includes(selectedConfig));
    }
    return list;
  }, [products, search, selectedConfig]);

  return (
    <div>
      {/* Sub-header */}
      <div style={{ background: `linear-gradient(135deg, ${C.navy}, #1e4a6e)`, borderRadius: 12, padding: "20px 24px", marginBottom: 22, display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <span style={{ fontSize: 18 }}>{sub?.icon}</span>
            <span style={{ color: C.gold, fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.5 }}>SharpTop Chain</span>
          </div>
          <div style={{ fontSize: 20, fontWeight: 900, color: "#fff", marginBottom: 4 }}>{sub?.label}</div>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.65)", maxWidth: 550 }}>{sub?.description}</div>
          <div style={{ marginTop: 8, display: "flex", flexWrap: "wrap", gap: 5 }}>
            {sub?.pitches?.map(p => (
              <span key={p} style={{ background: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.8)", padding: "3px 10px", borderRadius: 20, fontSize: 10, fontWeight: 600 }}>{p}</span>
            ))}
          </div>
        </div>
        <div style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", flexShrink: 0 }}>{products.length} products</div>
      </div>

      {/* Filter bar */}
      <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap", alignItems: "center" }}>
        <input
          value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search chain number, pitch, application..."
          style={{ flex: 1, minWidth: 200, padding: "8px 14px", border: `1px solid ${C.border}`, borderRadius: 7, fontSize: 13, outline: "none" }}
        />
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {allConfigs.map(cfg => (
            <button
              key={cfg}
              onClick={() => setSelectedConfig(cfg)}
              style={{
                padding: "6px 12px", borderRadius: 7, fontSize: 11, fontWeight: 700, cursor: "pointer", transition: "all 0.15s",
                background: selectedConfig === cfg ? C.navyMid : "#fff",
                color: selectedConfig === cfg ? "#fff" : C.muted,
                border: `1px solid ${selectedConfig === cfg ? C.navyMid : C.border}`,
              }}
            >
              {cfg === "all" ? "All Configs" : TOOTH_CONFIGS[cfg]?.shortLabel || cfg}
            </button>
          ))}
        </div>
      </div>

      {/* Count */}
      <div style={{ fontSize: 12, color: C.muted, marginBottom: 16 }}>
        {filtered.length} product{filtered.length !== 1 ? "s" : ""}{search || selectedConfig !== "all" ? " (filtered)" : ""}
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: 40, color: C.muted, fontSize: 13 }}>No products match your filters.</div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 14 }}>
          {filtered.map(p => (
            <SharpTopProductCard key={p.id} product={p} onClick={setSelectedProduct} />
          ))}
        </div>
      )}

      {/* Config legend */}
      <div style={{ marginTop: 28, padding: "16px 20px", background: "#fff", borderRadius: 10, border: `1px solid ${C.border}` }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: C.navyMid, marginBottom: 10 }}>Configuration Reference</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 6 }}>
          {Object.values(TOOTH_CONFIGS).filter(c => c.code !== "IH").slice(0, 12).map(cfg => (
            <div key={cfg.code} style={{ fontSize: 11, color: C.muted, display: "flex", gap: 6, alignItems: "flex-start" }}>
              <span style={{ fontWeight: 800, color: C.navyMid, flexShrink: 0 }}>{cfg.shortLabel}:</span>
              <span style={{ lineHeight: 1.4 }}>{cfg.label.split("—")[1]?.trim() || cfg.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Product detail modal */}
      {selectedProduct && (
        <SharpTopProductDetail product={selectedProduct} onClose={() => setSelectedProduct(null)} onGoRFQ={onGoRFQ} />
      )}
    </div>
  );
}

export default function SharpTopCatalog({ onBack, onGoRFQ }) {
  const [selectedSub, setSelectedSub] = useState(null);

  // Back button
  function handleBack() {
    if (selectedSub) { setSelectedSub(null); return; }
    onBack();
  }

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "'Inter','Segoe UI',Arial,sans-serif" }}>
      {/* Top nav */}
      <div style={{ background: C.navy, position: "sticky", top: 0, zIndex: 200, borderBottom: `3px solid ${C.gold}` }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 clamp(12px,4vw,20px)", display: "flex", alignItems: "center", justifyContent: "space-between", height: 54 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button onClick={handleBack} style={{ background: "rgba(255,255,255,0.1)", border: "none", color: "#fff", padding: "5px 12px", borderRadius: 6, cursor: "pointer", fontSize: 12, fontWeight: 700 }}>
              ← {selectedSub ? "Categories" : "Back"}
            </button>
            <div style={{ width: 1, height: 22, background: "rgba(255,255,255,0.15)" }} />
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 26, height: 26, background: C.gold, borderRadius: 5, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ color: C.navy, fontWeight: 900, fontSize: 12 }}>U</span>
              </div>
              <span style={{ color: "#fff", fontWeight: 700, fontSize: 15 }}>SharpTop Chains</span>
              {selectedSub && (
                <>
                  <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 14 }}>›</span>
                  <span style={{ color: C.gold, fontSize: 13, fontWeight: 600 }}>
                    {SHARPTOP_SUBCATEGORIES.find(s => s.key === selectedSub)?.label}
                  </span>
                </>
              )}
            </div>
          </div>
          <button onClick={onGoRFQ} style={{ background: C.gold, color: C.navy, padding: "6px 16px", borderRadius: 7, fontSize: 12, fontWeight: 700, border: "none", cursor: "pointer" }}>
            RFQ Cart
          </button>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "24px clamp(12px,4vw,28px) 80px" }}>
        {!selectedSub ? (
          <SubcategoryGrid onSelect={setSelectedSub} />
        ) : (
          <ProductGrid subcategoryKey={selectedSub} onBack={() => setSelectedSub(null)} onGoRFQ={onGoRFQ} />
        )}
      </div>
    </div>
  );
}