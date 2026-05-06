/**
 * ChainPlatformView.jsx
 * Main orchestrator for the normalized chain procurement platform.
 * Navigation: Family Browser → Product List → Product Detail
 * Includes Chain Configurator modal.
 */
import { useState, useMemo } from "react";
import { CHAIN_FAMILIES } from "@/lib/chainFamilyData";
import { CHAIN_PRODUCTS } from "@/lib/chainCatalogData";
import { NORMALIZED_CHAINS, getChainsByFamily } from "@/lib/chainNormalizedDictionary";
import ChainFamilyBrowser from "./ChainFamilyBrowser";
import NormalizedChainCard from "./NormalizedChainCard";
import ChainDetailView from "./ChainDetailView";
import ChainConfigurator from "./ChainConfigurator";
import ChainImportPanel from "./ChainImportPanel";

const C = {
  navy: "#003c5b", navyMid: "#1A3A5C",
  border: "#e2e8f0", bg: "#f8fafc", card: "#ffffff",
  text: "#0f172a", muted: "#64748b",
};

function ViewToggle({ view, onChange }) {
  return (
    <div style={{ display: "flex", border: "1px solid " + C.border, borderRadius: 7, overflow: "hidden" }}>
      {[{ key: "grid", icon: "⊞" }, { key: "list", icon: "☰" }].map(({ key, icon }) => (
        <button key={key} onClick={() => onChange(key)}
          style={{ padding: "6px 11px", background: view === key ? C.navy : "#fff", color: view === key ? "#fff" : C.muted, border: "none", cursor: "pointer", fontSize: 15, fontWeight: 700, borderRight: key === "grid" ? "1px solid " + C.border : "none" }}>
          {icon}
        </button>
      ))}
    </div>
  );
}

function ProductListView({ family, products, onSelect, onConfigure }) {
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState("grid");
  const [compareItems, setCompareItems] = useState([]);
  const [subcategory, setSubcategory] = useState("all");

  const subcats = useMemo(() => {
    const s = new Set(products.map(p => p.subcategory).filter(Boolean));
    return [...s];
  }, [products]);

  const filtered = useMemo(() => {
    let list = products;
    if (subcategory !== "all") list = list.filter(p => p.subcategory === subcategory);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(p =>
        [p.chain_number, p.part_number, p.product_type, p.description, p.specs?.pitch_in]
          .some(v => v?.toLowerCase?.().includes(q)) ||
        p.industries?.some(i => i.toLowerCase().includes(q)) ||
        p.features?.some(f => f.toLowerCase().includes(q))
      );
    }
    return list;
  }, [products, search, subcategory]);

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
        <div>
          <div style={{ fontSize: 19, fontWeight: 800, color: C.text }}>{family.label}</div>
          <div style={{ fontSize: 13, color: C.muted, marginTop: 2 }}>{filtered.length} product{filtered.length !== 1 ? "s" : ""}</div>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          <button onClick={() => onConfigure(null, family.key)}
            style={{ padding: "8px 16px", background: C.navyMid, color: "#fff", border: "none", borderRadius: 7, cursor: "pointer", fontWeight: 700, fontSize: 12 }}>
            ⚙ Configure This Family
          </button>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..."
            style={{ padding: "7px 12px", border: "1px solid " + C.border, borderRadius: 6, fontSize: 12, outline: "none", width: 160 }} />
          <ViewToggle view={viewMode} onChange={setViewMode} />
        </div>
      </div>

      {/* Family description */}
      {family.description && (
        <div style={{ padding: "10px 14px", background: C.bg, borderLeft: "3px solid " + C.navyMid, borderRadius: 4, fontSize: 12, color: C.muted, lineHeight: 1.6, marginBottom: 16 }}>
          {family.description}
          {family.applications?.length > 0 && (
            <div style={{ marginTop: 6, display: "flex", gap: 5, flexWrap: "wrap" }}>
              {family.applications.map((a, i) => (
                <span key={i} style={{ fontSize: 10, padding: "1px 7px", borderRadius: 20, background: "#e0f2fe", color: "#0369a1", fontWeight: 600 }}>{a}</span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Subcategory filter */}
      {subcats.length > 1 && (
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 16, overflowX: "auto", paddingBottom: 4 }}>
          {["all", ...subcats].map(sub => {
            const cat = CHAIN_FAMILIES.flatMap(f => []).find(s => s?.key === sub);
            return (
              <button key={sub} onClick={() => setSubcategory(sub)}
                style={{ padding: "5px 12px", borderRadius: 20, border: "1px solid " + (subcategory === sub ? C.navyMid : C.border), background: subcategory === sub ? C.navyMid : C.card, color: subcategory === sub ? "#fff" : C.muted, cursor: "pointer", fontSize: 11, fontWeight: 700, whiteSpace: "nowrap" }}>
                {sub === "all" ? "All" : sub.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}
              </button>
            );
          })}
        </div>
      )}

      {/* Products */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "48px 0", color: C.muted, fontSize: 14 }}>No products found. Adjust your search.</div>
      ) : viewMode === "grid" ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))", gap: 14 }}>
          {filtered.map(p => (
            <NormalizedChainCard key={p.id} product={p}
              onView={onSelect}
              onConfigure={prod => onConfigure(prod, family.key)}
              onCompare={prod => setCompareItems(prev => prev.some(x => x.id === prod.id) ? prev.filter(x => x.id !== prod.id) : prev.length < 4 ? [...prev, prod] : prev)}
              inCompare={compareItems.some(x => x.id === p.id)}
            />
          ))}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {filtered.map(p => (
            <div key={p.id} onClick={() => onSelect(p)}
              style={{ background: C.card, border: "1px solid " + C.border, borderRadius: 8, display: "flex", alignItems: "center", gap: 0, overflow: "hidden", cursor: "pointer" }}>
              <div style={{ width: 3, alignSelf: "stretch", background: C.navyMid, flexShrink: 0 }} />
              {(p.image || p.image_url) && (
                <div style={{ width: 60, height: 50, display: "flex", alignItems: "center", justifyContent: "center", background: C.bg, borderRight: "1px solid #f1f5f9", flexShrink: 0 }}>
                  <img src={p.image || p.image_url} alt="" style={{ maxHeight: 44, maxWidth: 54, objectFit: "contain" }} onError={e => e.target.style.display = "none"} />
                </div>
              )}
              <div style={{ flex: 1, padding: "9px 14px", minWidth: 0 }}>
                <div style={{ fontWeight: 800, fontSize: 14, color: C.text }}>{p.chain_number || p.part_number}</div>
                <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{p.product_type}{p.specs?.pitch_in ? " · " + p.specs.pitch_in + "\" pitch" : ""}</div>
              </div>
              <div style={{ padding: "0 14px", display: "flex", gap: 8, alignItems: "center", flexShrink: 0 }}>
                <button onClick={e => { e.stopPropagation(); onConfigure(p, family.key); }}
                  style={{ padding: "5px 10px", borderRadius: 5, fontSize: 11, fontWeight: 700, cursor: "pointer", border: "none", background: C.navyMid, color: "#fff" }}>
                  Configure
                </button>
                <span style={{ fontSize: 11, fontWeight: 600, color: C.navyMid, whiteSpace: "nowrap" }}>View ›</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ChainPlatformView({ onBack, onGoRFQ }) {
  const [view, setView] = useState("families"); // families | products | detail | import
  const [selectedFamily, setSelectedFamily] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showConfigurator, setShowConfigurator] = useState(false);
  const [configFamily, setConfigFamily] = useState(null);
  const [configChain, setConfigChain] = useState(null);

  const familyProducts = useMemo(() => {
    if (!selectedFamily) return [];
    // First try normalized dictionary (new data)
    const normalized = getChainsByFamily(selectedFamily);
    if (normalized.length > 0) return normalized;
    // Fall back to legacy CHAIN_PRODUCTS (existing catalog data)
    const fam = CHAIN_FAMILIES.find(f => f.key === selectedFamily);
    if (!fam) return [];
    return CHAIN_PRODUCTS.filter(p => {
      if (p.category !== fam.catalog_key) return false;
      if (fam.subcategory_filter?.length && !fam.subcategory_filter.includes(p.subcategory)) return false;
      return true;
    });
  }, [selectedFamily]);

  function handleSelectFamily(family) {
    setSelectedFamily(family.key);
    setSelectedProduct(null);
    setView("products");
    window.scrollTo(0, 0);
  }

  function handleSelectProduct(product) {
    setSelectedProduct(product);
    setView("detail");
    window.scrollTo(0, 0);
  }

  function handleConfigure(product, familyKey) {
    setConfigChain(product || null);
    setConfigFamily(familyKey || selectedFamily || null);
    setShowConfigurator(true);
  }

  function handleBackFromProducts() {
    setSelectedFamily(null);
    setView("families");
    window.scrollTo(0, 0);
  }

  function handleBackFromDetail() {
    setSelectedProduct(null);
    setView(selectedFamily ? "products" : "families");
    window.scrollTo(0, 0);
  }

  // Top bar
  const TopBar = () => (
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
      {onBack && <button onClick={onBack} className="uk-btn-back">← Products</button>}
      {view !== "families" && (
        <button onClick={() => { setView("families"); setSelectedFamily(null); setSelectedProduct(null); window.scrollTo(0,0); }} className="uk-btn-back">
          ← {view === "detail" ? (CHAIN_FAMILIES.find(f => f.key === selectedFamily)?.label || "Chains") : view === "import" ? "Chain Families" : "Chain Families"}
        </button>
      )}
      <span style={{ fontSize: 12, color: "#94a3b8" }}>
        {view === "families" && "Chain Platform"}
        {view === "products" && CHAIN_FAMILIES.find(f => f.key === selectedFamily)?.label}
        {view === "detail" && (selectedProduct?.chain_number || selectedProduct?.part_number)}
        {view === "import" && "Import Engine"}
      </span>
      {view === "families" && (
        <button onClick={() => { setView("import"); window.scrollTo(0,0); }}
          style={{ marginLeft: "auto", padding: "6px 14px", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 7, cursor: "pointer", fontSize: 11, fontWeight: 700, color: "#334155" }}>
          ⬆ Import Engine
        </button>
      )}
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "'Inter','Segoe UI',Arial,sans-serif" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "20px clamp(12px,4vw,36px)", boxSizing: "border-box" }}>
        <TopBar />

        {view === "import" && (
          <ChainImportPanel onBack={() => { setView("families"); window.scrollTo(0,0); }} />
        )}

        {view === "families" && (
          <ChainFamilyBrowser
            onSelectFamily={handleSelectFamily}
            onOpenConfigurator={() => handleConfigure(null, null)}
          />
        )}

        {view === "products" && selectedFamily && (
          <ProductListView
            family={CHAIN_FAMILIES.find(f => f.key === selectedFamily)}
            products={familyProducts}
            onSelect={handleSelectProduct}
            onConfigure={handleConfigure}
          />
        )}

        {view === "detail" && selectedProduct && (
          <ChainDetailView
            product={selectedProduct}
            familyLabel={CHAIN_FAMILIES.find(f => f.key === selectedFamily)?.label}
            onBack={handleBackFromDetail}
            onConfigure={handleConfigure}
          />
        )}
      </div>

      {/* Configurator modal */}
      {showConfigurator && (
        <div onClick={() => setShowConfigurator(false)}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 2000, display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "16px", overflowY: "auto" }}>
          <div onClick={e => e.stopPropagation()}
            style={{ background: C.card, borderRadius: 12, width: "100%", maxWidth: 800, padding: "24px clamp(16px,4vw,32px)", boxShadow: "0 24px 80px rgba(0,0,0,0.35)", marginTop: "auto", marginBottom: "auto", boxSizing: "border-box" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <div>
                <div style={{ fontSize: 18, fontWeight: 800, color: C.text }}>Chain Configurator</div>
                <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>Build your RFQ line item step by step</div>
              </div>
              <button onClick={() => setShowConfigurator(false)} style={{ background: "#f1f5f9", border: "none", fontSize: 18, cursor: "pointer", color: C.muted, padding: "6px 10px", borderRadius: 8 }}>×</button>
            </div>
            <ChainConfigurator
              initialFamily={configFamily}
              initialChain={configChain}
              onClose={() => setShowConfigurator(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}