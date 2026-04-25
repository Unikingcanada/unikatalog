import { useState, useEffect, useMemo } from "react";
import { UniCatalog, CatalogProduct, ElevatorBucket } from "@/api/entities";

// ─── Vendor display rules ─────────────────────────────────────────────────────
// Only these product types show vendor name
const SHOW_VENDOR_TYPES = new Set([
  "Modular Plastic Belt",
  "Modular Belt",
  "Elevator Bucket",
  "Elevator Buckets",
  "4B Electronics",
  "Monitoring System",
]);

function shouldShowVendor(productType) {
  return SHOW_VENDOR_TYPES.has(productType);
}

// ─── Product type display order & labels ─────────────────────────────────────
const TYPE_ORDER = [
  "Modular Plastic Belt",
  "Modular Belt",
  "Elevator Bucket",
  "Monitoring System",
  "Table Top Chain",
  "ANSI/BS Chain",
  "Engineered Chain",
  "Cast Chain",
  "Welded Steel Chain",
  "Forged Chain",
  "Overhead Chain",
  "Kiln Chain",
  "Sharptop Chain",
  "Thermoforming Chain",
  "Wire Mesh Belt",
  "Steel Hinged Belt",
  "Conveyor Roller",
  "Magnetic Conveyor",
];

// ─── Normalize all records to a common shape ─────────────────────────────────
function normalizeUniCatalog(r) {
  return {
    id: r.id,
    _source: "unicatalog",
    product_type: r.product_type || "General",
    vendor: r.vendor || "",
    series: r.series || "",
    style: r.style || "",
    application: r.application || "",
    materials: r.materials || "",
    duty: r.duty || "",
    features: r.features || "",
    notes: r.notes || "",
    catalog_url: r.catalog_url || "",
    tech_doc_url: r.tech_doc_url || "",
    key_specs: (() => { try { return typeof r.key_specs === "string" ? JSON.parse(r.key_specs) : (r.key_specs || {}); } catch { return {}; } })(),
  };
}

function normalizeCatalogProduct(r) {
  return {
    id: r.id,
    _source: "catalogproduct",
    product_type: "Modular Belt",
    vendor: r.vendor || "Intralox",
    series: r.series || "",
    style: r.style || "",
    application: r.category || "",
    materials: r.materials || "",
    duty: "",
    features: r.notes || "",
    notes: r.notes || "",
    catalog_url: "",
    tech_doc_url: r.tech_doc_url || "",
    key_specs: {
      "Pitch (in)": r.pitch_in,
      "Pitch (mm)": r.pitch_mm,
      "Open Area": r.open_area,
      "Hinge Style": r.hinge_style,
      "Category": r.category,
    },
  };
}

function normalizeElevatorBucket(r) {
  return {
    id: r.id,
    _source: "elevbucket",
    product_type: "Elevator Bucket",
    vendor: r.vendor || "",
    series: r.series || "",
    style: r.style || "",
    application: r.application || "",
    materials: r.material || "",
    duty: r.duty || "",
    features: r.notes || "",
    notes: r.notes || "",
    catalog_url: "",
    tech_doc_url: r.tech_doc_url || "",
    key_specs: {
      "Discharge Type": r.discharge_type,
      "Profile": r.profile,
      "Available Sizes": r.bucket_sizes,
    },
  };
}

// ─── Colors per product type ──────────────────────────────────────────────────
const TYPE_COLORS = {
  "Modular Plastic Belt": "#1a3a5c",
  "Modular Belt": "#1a3a5c",
  "Elevator Bucket": "#2c5282",
  "Monitoring System": "#1e4d6b",
  "Table Top Chain": "#374151",
  "ANSI/BS Chain": "#374151",
  "Engineered Chain": "#374151",
  "Cast Chain": "#374151",
  "Welded Steel Chain": "#374151",
  "Forged Chain": "#374151",
  "Overhead Chain": "#374151",
  "Kiln Chain": "#374151",
  "Sharptop Chain": "#374151",
  "Thermoforming Chain": "#374151",
  "Wire Mesh Belt": "#4b5563",
  "Steel Hinged Belt": "#4b5563",
  "Conveyor Roller": "#1f2937",
  "Magnetic Conveyor": "#1f2937",
};

function typeColor(t) { return TYPE_COLORS[t] || "#1a3a5c"; }

// ─── Spec table component ─────────────────────────────────────────────────────
function SpecTable({ specs }) {
  const entries = Object.entries(specs).filter(([, v]) => v != null && v !== "" && v !== "N/A");
  if (!entries.length) return null;
  return (
    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12, marginTop: 8 }}>
      <tbody>
        {entries.map(([k, v]) => (
          <tr key={k} style={{ borderBottom: "1px solid #f1f5f9" }}>
            <td style={{ padding: "5px 8px", color: "#64748b", fontWeight: 600, width: "45%", verticalAlign: "top" }}>{k}</td>
            <td style={{ padding: "5px 8px", color: "#1e293b" }}>{v}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// ─── Product detail modal ─────────────────────────────────────────────────────
function ProductModal({ product, onClose }) {
  if (!product) return null;
  const showVendor = shouldShowVendor(product.product_type);

  return (
    <div
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}
      onClick={onClose}
    >
      <div
        style={{ background: "#fff", borderRadius: 10, width: "100%", maxWidth: 680, maxHeight: "90vh", overflowY: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ background: typeColor(product.product_type), padding: "24px 28px", borderRadius: "10px 10px 0 0" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "1.5px", color: "rgba(255,255,255,0.55)", marginBottom: 6 }}>
                {product.product_type}
              </div>
              <div style={{ fontSize: 20, fontWeight: 800, color: "#fff", lineHeight: 1.2 }}>{product.series}</div>
              {product.style && <div style={{ fontSize: 14, color: "rgba(255,255,255,0.7)", marginTop: 4 }}>{product.style}</div>}
              {showVendor && product.vendor && (
                <div style={{ marginTop: 8, display: "inline-block", background: "rgba(255,255,255,0.15)", borderRadius: 4, padding: "3px 10px", fontSize: 11, color: "rgba(255,255,255,0.85)", letterSpacing: "0.5px" }}>
                  {product.vendor}
                </div>
              )}
            </div>
            <button onClick={onClose} style={{ background: "rgba(255,255,255,0.15)", border: "none", color: "#fff", width: 32, height: 32, borderRadius: 6, cursor: "pointer", fontSize: 18, lineHeight: "32px", textAlign: "center" }}>×</button>
          </div>
        </div>

        <div style={{ padding: "24px 28px" }}>

          {/* Application */}
          {product.application && (
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", color: "#64748b", marginBottom: 6 }}>Application</div>
              <div style={{ fontSize: 14, color: "#1e293b", lineHeight: 1.6 }}>{product.application}</div>
            </div>
          )}

          {/* Specifications */}
          {Object.keys(product.key_specs).length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", color: "#64748b", marginBottom: 6 }}>Specifications</div>
              <div style={{ border: "1px solid #e2e8f0", borderRadius: 6, overflow: "hidden" }}>
                <SpecTable specs={product.key_specs} />
              </div>
            </div>
          )}

          {/* Materials */}
          {product.materials && (
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", color: "#64748b", marginBottom: 6 }}>Materials</div>
              <div style={{ fontSize: 14, color: "#1e293b" }}>{product.materials}</div>
            </div>
          )}

          {/* Features / Notes */}
          {(product.features || product.notes) && (
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", color: "#64748b", marginBottom: 6 }}>Notes</div>
              <div style={{ fontSize: 13, color: "#334155", lineHeight: 1.7, background: "#f8fafc", padding: 14, borderRadius: 6 }}>
                {product.features || product.notes}
              </div>
            </div>
          )}

          {/* Duty */}
          {product.duty && (
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", color: "#64748b", marginBottom: 6 }}>Duty Rating</div>
              <div style={{ fontSize: 13, color: "#1e293b" }}>{product.duty}</div>
            </div>
          )}

          {/* Links */}
          {(product.catalog_url || product.tech_doc_url) && (
            <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
              {product.catalog_url && (
                <a href={product.catalog_url} target="_blank" rel="noopener noreferrer"
                  style={{ display: "inline-block", padding: "9px 18px", background: typeColor(product.product_type), color: "#fff", borderRadius: 6, fontSize: 12, fontWeight: 600, textDecoration: "none", letterSpacing: "0.3px" }}>
                  View Catalog
                </a>
              )}
              {product.tech_doc_url && (
                <a href={product.tech_doc_url} target="_blank" rel="noopener noreferrer"
                  style={{ display: "inline-block", padding: "9px 18px", background: "#f1f5f9", color: "#1e293b", borderRadius: 6, fontSize: 12, fontWeight: 600, textDecoration: "none", letterSpacing: "0.3px" }}>
                  Technical Document
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Product card ─────────────────────────────────────────────────────────────
function ProductCard({ product, onClick }) {
  const showVendor = shouldShowVendor(product.product_type);
  const color = typeColor(product.product_type);

  return (
    <div
      onClick={() => onClick(product)}
      style={{
        background: "#fff",
        border: "1px solid #e2e8f0",
        borderRadius: 8,
        overflow: "hidden",
        cursor: "pointer",
        transition: "box-shadow 0.15s, transform 0.15s",
        display: "flex",
        flexDirection: "column",
      }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.10)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.transform = "none"; }}
    >
      {/* Color band */}
      <div style={{ height: 4, background: color }} />

      <div style={{ padding: "16px 18px", flex: 1, display: "flex", flexDirection: "column" }}>
        {/* Series + vendor */}
        <div style={{ marginBottom: 10 }}>
          <div style={{ fontSize: 15, fontWeight: 800, color: "#0f172a", lineHeight: 1.3, marginBottom: 2 }}>
            {product.series}
          </div>
          {product.style && (
            <div style={{ fontSize: 12, color: "#64748b" }}>{product.style}</div>
          )}
          {showVendor && product.vendor && (
            <div style={{ marginTop: 6, display: "inline-block", background: "#f1f5f9", border: "1px solid #e2e8f0", borderRadius: 4, padding: "2px 8px", fontSize: 11, color: "#475569", fontWeight: 600 }}>
              {product.vendor}
            </div>
          )}
        </div>

        {/* Application */}
        {product.application && (
          <div style={{ fontSize: 12, color: "#475569", lineHeight: 1.5, flex: 1, marginBottom: 12 }}>
            {product.application.length > 100 ? product.application.slice(0, 100) + "…" : product.application}
          </div>
        )}

        {/* Key specs preview */}
        {Object.keys(product.key_specs).length > 0 && (
          <div style={{ borderTop: "1px solid #f1f5f9", paddingTop: 10, display: "flex", flexWrap: "wrap", gap: 6 }}>
            {Object.entries(product.key_specs).filter(([, v]) => v != null && v !== "").slice(0, 3).map(([k, v]) => (
              <div key={k} style={{ background: "#f8fafc", borderRadius: 4, padding: "3px 8px", fontSize: 11, color: "#334155" }}>
                <span style={{ color: "#94a3b8" }}>{k}: </span>{v}
              </div>
            ))}
          </div>
        )}

        {/* Materials */}
        {product.materials && (
          <div style={{ marginTop: 8, fontSize: 11, color: "#94a3b8" }}>
            {product.materials.length > 70 ? product.materials.slice(0, 70) + "…" : product.materials}
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{ borderTop: "1px solid #f1f5f9", padding: "10px 18px", display: "flex", justifyContent: "flex-end" }}>
        <span style={{ fontSize: 11, fontWeight: 600, color: color, letterSpacing: "0.3px" }}>View Details</span>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function Home() {
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const [uni, cat, elev] = await Promise.all([
          UniCatalog.list(),
          CatalogProduct.list(),
          ElevatorBucket.list(),
        ]);
        const unified = [
          ...uni.map(normalizeUniCatalog),
          ...cat.map(normalizeCatalogProduct),
          ...elev.map(normalizeElevatorBucket),
        ];
        setAllProducts(unified);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // ── Derive product types with counts ──
  const productTypes = useMemo(() => {
    const counts = {};
    for (const p of allProducts) {
      counts[p.product_type] = (counts[p.product_type] || 0) + 1;
    }
    const types = Object.keys(counts);
    types.sort((a, b) => {
      const ai = TYPE_ORDER.indexOf(a), bi = TYPE_ORDER.indexOf(b);
      if (ai === -1 && bi === -1) return a.localeCompare(b);
      if (ai === -1) return 1;
      if (bi === -1) return -1;
      return ai - bi;
    });
    return types.map(t => ({ type: t, count: counts[t] }));
  }, [allProducts]);

  // ── Filter ──
  const filtered = useMemo(() => {
    let list = allProducts;
    if (selectedType) list = list.filter(p => p.product_type === selectedType);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(p =>
        [p.series, p.style, p.application, p.materials, p.features, p.notes, p.vendor]
          .some(f => (f || "").toLowerCase().includes(q))
      );
    }
    return list;
  }, [allProducts, selectedType, search]);

  const activeColor = selectedType ? typeColor(selectedType) : "#1a3a5c";

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", fontFamily: "'Inter', 'Segoe UI', Arial, sans-serif" }}>

      {/* ── Top header ── */}
      <div style={{ background: "#0f172a", padding: "0 32px" }}>
        <div style={{ maxWidth: 1300, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: 60 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div>
              <span style={{ fontSize: 16, fontWeight: 800, color: "#fff", letterSpacing: "0.5px" }}>UNIKING</span>
              <span style={{ fontSize: 16, fontWeight: 300, color: "rgba(255,255,255,0.45)", marginLeft: 8 }}>Product Catalog</span>
            </div>
          </div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", letterSpacing: "0.5px", textTransform: "uppercase" }}>
            Confidential — Internal Use Only
          </div>
        </div>
      </div>

      {/* ── Hero / search bar ── */}
      <div style={{ background: "linear-gradient(135deg, #1a3a5c 0%, #0f2340 100%)", padding: "32px 32px 28px" }}>
        <div style={{ maxWidth: 1300, margin: "0 auto" }}>
          <div style={{ fontSize: 24, fontWeight: 800, color: "#fff", marginBottom: 4 }}>Technical Product Reference</div>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", marginBottom: 20 }}>
            {allProducts.length} products across {productTypes.length} product lines
          </div>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by series, material, application, specification..."
            style={{
              width: "100%", maxWidth: 560, padding: "11px 16px", borderRadius: 6,
              border: "1px solid rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.08)",
              color: "#fff", fontSize: 13, outline: "none", boxSizing: "border-box",
            }}
          />
        </div>
      </div>

      <div style={{ maxWidth: 1300, margin: "0 auto", padding: "28px 32px", display: "flex", gap: 28, alignItems: "flex-start" }}>

        {/* ── Sidebar: product type nav ── */}
        <div style={{ width: 230, flexShrink: 0, position: "sticky", top: 24 }}>
          <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, overflow: "hidden" }}>
            <div style={{ padding: "12px 16px", background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", color: "#64748b" }}>Product Lines</div>
            </div>
            {loading ? (
              <div style={{ padding: 16, color: "#94a3b8", fontSize: 13 }}>Loading...</div>
            ) : (
              <div>
                {/* All */}
                <div
                  onClick={() => setSelectedType(null)}
                  style={{
                    padding: "11px 16px", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center",
                    background: selectedType === null ? "#1a3a5c" : "transparent",
                    borderBottom: "1px solid #f1f5f9",
                    transition: "background 0.1s",
                  }}
                >
                  <span style={{ fontSize: 13, fontWeight: selectedType === null ? 700 : 500, color: selectedType === null ? "#fff" : "#334155" }}>All Products</span>
                  <span style={{ fontSize: 11, background: selectedType === null ? "rgba(255,255,255,0.2)" : "#f1f5f9", color: selectedType === null ? "#fff" : "#64748b", borderRadius: 10, padding: "1px 7px", fontWeight: 600 }}>
                    {allProducts.length}
                  </span>
                </div>
                {productTypes.map(({ type, count }) => (
                  <div
                    key={type}
                    onClick={() => { setSelectedType(type); setSearch(""); }}
                    style={{
                      padding: "10px 16px", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center",
                      background: selectedType === type ? typeColor(type) : "transparent",
                      borderBottom: "1px solid #f1f5f9",
                      transition: "background 0.1s",
                    }}
                    onMouseEnter={e => { if (selectedType !== type) e.currentTarget.style.background = "#f8fafc"; }}
                    onMouseLeave={e => { if (selectedType !== type) e.currentTarget.style.background = "transparent"; }}
                  >
                    <span style={{ fontSize: 12.5, fontWeight: selectedType === type ? 700 : 400, color: selectedType === type ? "#fff" : "#334155", lineHeight: 1.3 }}>{type}</span>
                    <span style={{ fontSize: 11, background: selectedType === type ? "rgba(255,255,255,0.2)" : "#f1f5f9", color: selectedType === type ? "#fff" : "#64748b", borderRadius: 10, padding: "1px 7px", fontWeight: 600, flexShrink: 0, marginLeft: 6 }}>
                      {count}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Main content ── */}
        <div style={{ flex: 1, minWidth: 0 }}>

          {/* Section header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <div>
              <div style={{ fontSize: 18, fontWeight: 800, color: "#0f172a" }}>
                {selectedType || "All Products"}
              </div>
              <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>
                {filtered.length} {filtered.length === 1 ? "product" : "products"}{search ? ` matching "${search}"` : ""}
              </div>
            </div>
            {selectedType && (
              <button
                onClick={() => setSelectedType(null)}
                style={{ background: "none", border: "1px solid #e2e8f0", borderRadius: 6, padding: "6px 14px", fontSize: 12, color: "#64748b", cursor: "pointer" }}
              >
                Clear filter
              </button>
            )}
          </div>

          {loading ? (
            <div style={{ textAlign: "center", padding: 60, color: "#94a3b8" }}>Loading catalog...</div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: "center", padding: 60, color: "#94a3b8" }}>No products found.</div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
              {filtered.map(p => (
                <ProductCard key={p.id} product={p} onClick={setSelectedProduct} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Footer ── */}
      <div style={{ borderTop: "1px solid #e2e8f0", padding: "20px 32px", textAlign: "center", fontSize: 11, color: "#94a3b8" }}>
        Uniking Canada — Confidential Technical Reference — Internal Use Only
      </div>

      {/* ── Detail modal ── */}
      {selectedProduct && (
        <ProductModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />
      )}
    </div>
  );
}
