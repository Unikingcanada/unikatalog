import { useState, useEffect, useMemo } from "react";
import { CatalogProduct } from "@/api/entities";

const VENDOR_COLORS = {
  Intralox: { bg: "#e8f0fe", text: "#1a56db", border: "#c3d9fd" },
  Movex: { bg: "#fef3c7", text: "#92400e", border: "#fde68a" },
  Rollepaal: { bg: "#f0fdf4", text: "#166534", border: "#bbf7d0" },
};

const CATEGORY_ICONS = {
  "Straight-Running Belts": "➡️",
  "Radius Belts": "↩️",
  "Spiral Belts": "🌀",
  "Side-Flexing Belts": "↪️",
};

function Badge({ label, color = "#e5e7eb", textColor = "#374151" }) {
  return (
    <span style={{
      display: "inline-block", padding: "2px 8px", borderRadius: 99,
      background: color, color: textColor, fontSize: 11, fontWeight: 600,
      letterSpacing: 0.3, whiteSpace: "nowrap",
    }}>{label}</span>
  );
}

function ProductCard({ product, onClick }) {
  const vc = VENDOR_COLORS[product.vendor] || { bg: "#f3f4f6", text: "#374151", border: "#e5e7eb" };
  const hasDocs = product.tech_doc_url || product.cad_url;
  const catIcon = CATEGORY_ICONS[product.category] || "";

  return (
    <div
      onClick={() => onClick(product)}
      style={{
        background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10,
        padding: "16px 18px", cursor: "pointer", transition: "box-shadow 0.15s, border-color 0.15s",
        display: "flex", flexDirection: "column", gap: 10,
      }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.09)"; e.currentTarget.style.borderColor = "#93c5fd"; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.borderColor = "#e5e7eb"; }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, color: "#1a3a5c" }}>{product.series}</div>
          <div style={{ fontSize: 13, color: "#6b7280", marginTop: 2 }}>{product.style}</div>
        </div>
        <Badge label={product.vendor} color={vc.bg} textColor={vc.text} />
      </div>

      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {product.pitch_in && <Badge label={`${product.pitch_in}" pitch`} color="#f0fdf4" textColor="#166534" />}
        {product.open_area && product.open_area !== "0%" && (
          <Badge label={`${product.open_area} open`} color="#fef9c3" textColor="#854d0e" />
        )}
        {product.hinge_style && (
          <Badge label={`${product.hinge_style} hinge`} color="#f3f4f6" textColor="#4b5563" />
        )}
        {product.category && (
          <Badge label={`${catIcon} ${product.category}`.trim()} color="#f5f3ff" textColor="#6d28d9" />
        )}
      </div>

      {product.notes && (
        <div style={{ fontSize: 12, color: "#6b7280", lineHeight: 1.5, borderTop: "1px solid #f3f4f6", paddingTop: 8 }}>
          {product.notes}
        </div>
      )}

      {product.materials && (
        <div style={{ fontSize: 11, color: "#9ca3af" }}>
          <span style={{ fontWeight: 600 }}>Materials:</span> {product.materials}
        </div>
      )}

      {hasDocs && (
        <div style={{ display: "flex", gap: 6, marginTop: 2 }}>
          {product.tech_doc_url && <Badge label="📄 Tech Doc" color="#eff6ff" textColor="#1d4ed8" />}
          {product.cad_url && <Badge label="📐 CAD" color="#f0fdf4" textColor="#166534" />}
        </div>
      )}
    </div>
  );
}

function ProductModal({ product, onClose }) {
  if (!product) return null;
  const vc = VENDOR_COLORS[product.vendor] || { bg: "#f3f4f6", text: "#374151" };
  const catIcon = CATEGORY_ICONS[product.category] || "";

  return (
    <div
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}
      onClick={onClose}
    >
      <div
        style={{ background: "#fff", borderRadius: 14, width: "100%", maxWidth: 560, maxHeight: "90vh", overflowY: "auto", padding: "28px 30px", position: "relative" }}
        onClick={e => e.stopPropagation()}
      >
        <button onClick={onClose} style={{ position: "absolute", top: 16, right: 16, background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "#9ca3af" }}>✕</button>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
          <Badge label={product.vendor} color={vc.bg} textColor={vc.text} />
          {product.category && <Badge label={`${catIcon} ${product.category}`.trim()} color="#f5f3ff" textColor="#6d28d9" />}
        </div>

        <div style={{ fontSize: 22, fontWeight: 800, color: "#1a3a5c" }}>{product.series}</div>
        <div style={{ fontSize: 15, color: "#6b7280", marginBottom: 18 }}>{product.style}</div>

        {product.notes && (
          <div style={{ fontSize: 14, color: "#374151", lineHeight: 1.6, marginBottom: 18, padding: "12px 14px", background: "#f8fafc", borderRadius: 8, borderLeft: "3px solid #1a3a5c" }}>
            {product.notes}
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px 24px", marginBottom: 18 }}>
          {[
            ["Pitch", product.pitch_in ? `${product.pitch_in}" (${product.pitch_mm} mm)` : "—"],
            ["Open Area", product.open_area || "—"],
            ["Hinge Style", product.hinge_style || "—"],
            ["Min Width", product.min_width_in ? `${product.min_width_in}"` : "—"],
          ].map(([label, val]) => (
            <div key={label}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: 0.5 }}>{label}</div>
              <div style={{ fontSize: 14, color: "#1a3a5c", fontWeight: 600, marginTop: 3 }}>{val}</div>
            </div>
          ))}
        </div>

        {product.materials && (
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 }}>Available Materials</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {product.materials.split(",").map(m => (
                <Badge key={m} label={m.trim()} color="#f3f4f6" textColor="#374151" />
              ))}
            </div>
          </div>
        )}

        <div style={{ display: "flex", gap: 10 }}>
          {product.tech_doc_url ? (
            <a href={product.tech_doc_url} target="_blank" rel="noreferrer"
              style={{ flex: 1, padding: "11px 14px", background: "#1a3a5c", color: "#fff", borderRadius: 8, textDecoration: "none", textAlign: "center", fontSize: 13, fontWeight: 600 }}>
              📄 Technical Document
            </a>
          ) : (
            <div style={{ flex: 1, padding: "11px 14px", background: "#f3f4f6", color: "#9ca3af", borderRadius: 8, textAlign: "center", fontSize: 13 }}>
              Tech Doc — Coming Soon
            </div>
          )}
          {product.cad_url ? (
            <a href={product.cad_url} target="_blank" rel="noreferrer"
              style={{ flex: 1, padding: "11px 14px", background: "#166534", color: "#fff", borderRadius: 8, textDecoration: "none", textAlign: "center", fontSize: 13, fontWeight: 600 }}>
              📐 CAD Drawing
            </a>
          ) : (
            <div style={{ flex: 1, padding: "11px 14px", background: "#f3f4f6", color: "#9ca3af", borderRadius: 8, textAlign: "center", fontSize: 13 }}>
              CAD — Coming Soon
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Catalog() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [filterVendor, setFilterVendor] = useState("All");
  const [filterCategory, setFilterCategory] = useState("All");
  const [filterPitch, setFilterPitch] = useState("All");
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    CatalogProduct.filter({})
      .then(data => {
        setProducts(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to load catalog:", err);
        setError("Failed to load products. Please refresh.");
        setLoading(false);
      });
  }, []);

  const vendors = useMemo(() => ["All", ...Array.from(new Set(products.map(p => p.vendor))).sort()], [products]);
  const categories = useMemo(() => ["All", ...Array.from(new Set(products.map(p => p.category))).sort()], [products]);
  const pitches = useMemo(() => [
    "All",
    ...Array.from(new Set(products.map(p => p.pitch_in).filter(Boolean)))
      .sort((a, b) => parseFloat(a) - parseFloat(b))
      .map(p => `${p}"`)
  ], [products]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return products.filter(p => {
      if (q) {
        const haystack = [p.series, p.style, p.materials, p.notes, p.search_tags, p.category, p.vendor]
          .filter(Boolean).join(" ").toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      if (filterVendor !== "All" && p.vendor !== filterVendor) return false;
      if (filterCategory !== "All" && p.category !== filterCategory) return false;
      if (filterPitch !== "All" && `${p.pitch_in}"` !== filterPitch) return false;
      return true;
    });
  }, [products, search, filterVendor, filterCategory, filterPitch]);

  const grouped = useMemo(() => {
    const map = {};
    for (const p of filtered) {
      if (!map[p.series]) map[p.series] = [];
      map[p.series].push(p);
    }
    return Object.entries(map).sort((a, b) => {
      const aNum = parseFloat(a[1][0]?.series_number) || 0;
      const bNum = parseFloat(b[1][0]?.series_number) || 0;
      return aNum - bNum;
    });
  }, [filtered]);

  const activeFilters = search || filterVendor !== "All" || filterCategory !== "All" || filterPitch !== "All";

  const selectStyle = {
    padding: "8px 12px", border: "1px solid #e5e7eb", borderRadius: 8,
    fontSize: 13, color: "#374151", background: "#fff", cursor: "pointer", outline: "none",
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f4f6f9", fontFamily: "Arial, sans-serif" }}>

      {/* Header */}
      <div style={{ background: "#1a3a5c", padding: "24px 32px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div>
            <div style={{ color: "#fff", fontSize: 22, fontWeight: 800 }}>🔩 Uniking Parts Catalog</div>
            <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 13, marginTop: 4 }}>
              {loading ? "Loading..." : `${products.length} products · ${new Set(products.map(p => p.vendor)).size} vendor${new Set(products.map(p => p.vendor)).size !== 1 ? "s" : ""}`}
            </div>
          </div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", letterSpacing: 0.5 }}>INTERNAL USE ONLY · NO PRICING</div>
        </div>
      </div>

      {/* Filters */}
      <div style={{ background: "#fff", borderBottom: "1px solid #e5e7eb", padding: "14px 32px", position: "sticky", top: 0, zIndex: 10 }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="🔍  Search series, style, material, keyword..."
            style={{ flex: 1, minWidth: 220, padding: "8px 14px", border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 13, outline: "none" }}
          />
          <select value={filterVendor} onChange={e => setFilterVendor(e.target.value)} style={selectStyle}>
            {vendors.map(v => <option key={v}>{v}</option>)}
          </select>
          <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} style={selectStyle}>
            {categories.map(c => <option key={c}>{c}</option>)}
          </select>
          <select value={filterPitch} onChange={e => setFilterPitch(e.target.value)} style={selectStyle}>
            {pitches.map(p => <option key={p}>{p}</option>)}
          </select>
          {activeFilters && (
            <button
              onClick={() => { setSearch(""); setFilterVendor("All"); setFilterCategory("All"); setFilterPitch("All"); }}
              style={{ padding: "8px 14px", border: "1px solid #fca5a5", borderRadius: 8, background: "#fef2f2", color: "#dc2626", fontSize: 12, fontWeight: 600, cursor: "pointer" }}
            >
              ✕ Clear
            </button>
          )}
          <div style={{ fontSize: 12, color: "#9ca3af", marginLeft: "auto" }}>
            {!loading && `${filtered.length} result${filtered.length !== 1 ? "s" : ""}`}
          </div>
        </div>
      </div>

      {/* Body */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "28px 32px" }}>
        {loading && (
          <div style={{ textAlign: "center", padding: 80 }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>⚙️</div>
            <div style={{ color: "#6b7280", fontSize: 15 }}>Loading catalog...</div>
          </div>
        )}

        {error && (
          <div style={{ textAlign: "center", padding: 60, color: "#dc2626" }}>{error}</div>
        )}

        {!loading && !error && grouped.length === 0 && (
          <div style={{ textAlign: "center", padding: 80 }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>🔍</div>
            <div style={{ color: "#6b7280", fontSize: 15 }}>No products match your filters.</div>
            {activeFilters && (
              <button onClick={() => { setSearch(""); setFilterVendor("All"); setFilterCategory("All"); setFilterPitch("All"); }}
                style={{ marginTop: 16, padding: "8px 20px", background: "#1a3a5c", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontSize: 13 }}>
                Clear Filters
              </button>
            )}
          </div>
        )}

        {!loading && !error && grouped.map(([series, items]) => (
          <div key={series} style={{ marginBottom: 32 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#1a3a5c" }}>{series}</div>
              <div style={{ fontSize: 12, color: "#9ca3af" }}>{items.length} style{items.length !== 1 ? "s" : ""}</div>
              <div style={{ flex: 1, height: 1, background: "#e5e7eb" }} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 14 }}>
              {items.map(p => <ProductCard key={p.id} product={p} onClick={setSelectedProduct} />)}
            </div>
          </div>
        ))}
      </div>

      <ProductModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />
    </div>
  );
}
