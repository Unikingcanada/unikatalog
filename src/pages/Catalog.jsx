import { useState, useEffect, useMemo, useRef } from "react";
import { CatalogProduct } from "@/api/entities";

// ── Brand ──────────────────────────────────────────────────────
const NAVY = "#1a3a5c";
const SILVER = "#9ca3af";
const LOGO_URL = "https://media.base44.com/files/public/69dd9ffccab4dd693d4d92f5/3312120fe_2025Logo.pdf";

// ── Category images from Intralox CDN ──────────────────────────
const CDN = "https://assets-us-01.kc-usercontent.com:443/19eb64b5-1815-003a-d268-e7109927ccad/";
const CATEGORY_IMAGES = {
  "Straight-Running Belts": CDN + "645daf38-238c-422a-a113-6c9089f27218/modular-plastic-belting-straight-running-40_21.jpg",
  "Radius Belts":           CDN + "35a6b869-7f0a-446e-8ace-19b9e7bb088d/modular-plastic-belting-radius-3_2.jpg",
  "Spiral Belts":           CDN + "f045209f-e054-4c2f-a058-7cc4476e062b/modular-plastic-belting-40_21.jpg",
  "Side-Flexing Belts":     CDN + "c2fa89b2-fb58-480b-92e2-af0c0ec2f66a/5010999_S2300-Dual-Turn-box-line_40-21_2400px.jpg",
};

const CATEGORY_ICONS = {
  "Straight-Running Belts": "➡️",
  "Radius Belts": "↩️",
  "Spiral Belts": "🌀",
  "Side-Flexing Belts": "↪️",
};

const VENDOR_COLORS = {
  Intralox: { bg: "#e8f0fe", text: "#1a56db" },
  Movex:    { bg: "#fef3c7", text: "#92400e" },
  Rollepaal:{ bg: "#f0fdf4", text: "#166534" },
};

// ── Helpers ─────────────────────────────────────────────────────
function Badge({ label, color = "#e5e7eb", textColor = "#374151", small }) {
  return (
    <span style={{
      display: "inline-block",
      padding: small ? "1px 6px" : "2px 8px",
      borderRadius: 99,
      background: color, color: textColor,
      fontSize: small ? 10 : 11, fontWeight: 600, letterSpacing: 0.3, whiteSpace: "nowrap",
    }}>{label}</span>
  );
}

// ── Uniking Logo (SVG text — matches branding) ──────────────────
function UniKingLogo({ size = 28 }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 0, lineHeight: 1 }}>
      <span style={{ fontSize: size, fontWeight: 900, color: SILVER, letterSpacing: -1, fontFamily: "Arial Black, Arial, sans-serif" }}>UNI</span>
      <span style={{ fontSize: size, fontWeight: 900, color: NAVY, letterSpacing: -1, fontFamily: "Arial Black, Arial, sans-serif" }}>KING</span>
    </div>
  );
}

// ── Product image with fallback ─────────────────────────────────
function ProductImage({ src, alt, style = {} }) {
  const [err, setErr] = useState(false);
  if (!src || err) {
    return (
      <div style={{
        ...style, background: "#f1f5f9", display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center", gap: 6, color: "#94a3b8",
      }}>
        <svg width="36" height="36" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <path d="M21 15l-5-5L5 21" />
        </svg>
        <span style={{ fontSize: 10, textAlign: "center", padding: "0 8px" }}>No Image Available</span>
      </div>
    );
  }
  return <img src={src} alt={alt} onError={() => setErr(true)} style={{ ...style, objectFit: "cover" }} />;
}

// ── Tear Sheet (print modal) ────────────────────────────────────
function TearSheet({ product, onClose }) {
  const printRef = useRef();

  const handlePrint = () => {
    const content = printRef.current.innerHTML;
    const win = window.open("", "_blank", "width=900,height=700");
    win.document.write(`
      <!DOCTYPE html><html><head>
      <title>Uniking — ${product.series} ${product.style}</title>
      <style>
        * { margin:0; padding:0; box-sizing:border-box; }
        body { font-family: Arial, sans-serif; background: #fff; }
        @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
      </style>
      </head><body>${content}</body></html>
    `);
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); }, 400);
  };

  if (!product) return null;
  const catImg = CATEGORY_IMAGES[product.category];
  const materials = product.materials ? product.materials.split(",").map(m => m.trim()) : [];

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 2000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}
      onClick={onClose}>
      <div style={{ background: "#fff", borderRadius: 12, width: "100%", maxWidth: 680, maxHeight: "92vh", overflowY: "auto", position: "relative" }}
        onClick={e => e.stopPropagation()}>

        {/* Action bar */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 20px", borderBottom: "1px solid #e5e7eb" }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: NAVY }}>📄 Product Tear Sheet</div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={handlePrint} style={{ padding: "7px 16px", background: NAVY, color: "#fff", border: "none", borderRadius: 7, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
              🖨️ Print / Save PDF
            </button>
            <button onClick={onClose} style={{ padding: "7px 12px", background: "#f3f4f6", border: "none", borderRadius: 7, fontSize: 13, cursor: "pointer", color: "#6b7280" }}>✕</button>
          </div>
        </div>

        {/* Tear Sheet content */}
        <div ref={printRef} style={{ fontFamily: "Arial, sans-serif" }}>
          {/* Header */}
          <div style={{ background: NAVY, padding: "20px 28px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 0, marginBottom: 2 }}>
                <span style={{ fontSize: 26, fontWeight: 900, color: "#b0bec5", letterSpacing: -1, fontFamily: "Arial Black, Arial, sans-serif" }}>UNI</span>
                <span style={{ fontSize: 26, fontWeight: 900, color: "#fff", letterSpacing: -1, fontFamily: "Arial Black, Arial, sans-serif" }}>KING</span>
              </div>
              <div style={{ fontSize: 9, color: "rgba(255,255,255,0.5)", letterSpacing: 2, textTransform: "uppercase" }}>UNITING THE STRONGEST LINKS</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: 1 }}>Product Data Sheet</div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>unikingcanada.com · Internal Use Only</div>
            </div>
          </div>

          {/* Product hero */}
          <div style={{ display: "flex", minHeight: 160 }}>
            <div style={{ flex: 1, padding: "20px 24px" }}>
              <div style={{ fontSize: 11, color: "#6b7280", textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>
                {product.vendor} · {product.category}
              </div>
              <div style={{ fontSize: 26, fontWeight: 800, color: NAVY, lineHeight: 1.1 }}>{product.series}</div>
              <div style={{ fontSize: 16, color: "#4b5563", marginTop: 4, marginBottom: 12 }}>{product.style}</div>
              {product.notes && (
                <div style={{ fontSize: 13, color: "#374151", lineHeight: 1.6, padding: "10px 12px", background: "#f8fafc", borderLeft: `3px solid ${NAVY}`, borderRadius: 4 }}>
                  {product.notes}
                </div>
              )}
            </div>
            <div style={{ width: 180, flexShrink: 0 }}>
              <ProductImage
                src={product.image_url || catImg}
                alt={product.series}
                style={{ width: "100%", height: "100%", minHeight: 160 }}
              />
            </div>
          </div>

          {/* Specs table */}
          <div style={{ padding: "0 24px 20px" }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: NAVY, textTransform: "uppercase", letterSpacing: 1, marginBottom: 10, paddingBottom: 6, borderBottom: `2px solid ${NAVY}` }}>
              Technical Specifications
            </div>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <tbody>
                {[
                  ["Series", product.series],
                  ["Belt Style", product.style],
                  ["Category", product.category],
                  ["Pitch", product.pitch_in ? `${product.pitch_in}" (${product.pitch_mm} mm)` : "—"],
                  ["Open Area", product.open_area || "—"],
                  ["Hinge Style", product.hinge_style || "—"],
                  ["Minimum Width", product.min_width_in ? `${product.min_width_in}"` : "—"],
                ].map(([label, val], i) => (
                  <tr key={label} style={{ background: i % 2 === 0 ? "#f8fafc" : "#fff" }}>
                    <td style={{ padding: "7px 10px", fontWeight: 700, color: "#374151", width: "35%" }}>{label}</td>
                    <td style={{ padding: "7px 10px", color: "#1a3a5c" }}>{val}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Materials */}
          {materials.length > 0 && (
            <div style={{ padding: "0 24px 20px" }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: NAVY, textTransform: "uppercase", letterSpacing: 1, marginBottom: 10, paddingBottom: 6, borderBottom: `2px solid ${NAVY}` }}>
                Available Materials
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {materials.map(m => (
                  <div key={m} style={{ padding: "6px 12px", background: "#f1f5f9", borderRadius: 6, fontSize: 12, fontWeight: 600, color: NAVY, border: "1px solid #e2e8f0" }}>{m}</div>
                ))}
              </div>
            </div>
          )}

          {/* Docs */}
          <div style={{ padding: "0 24px 20px" }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: NAVY, textTransform: "uppercase", letterSpacing: 1, marginBottom: 10, paddingBottom: 6, borderBottom: `2px solid ${NAVY}` }}>
              Resources
            </div>
            <div style={{ display: "flex", gap: 12 }}>
              <div style={{ flex: 1, padding: "10px 14px", background: product.tech_doc_url ? NAVY : "#f3f4f6", color: product.tech_doc_url ? "#fff" : "#9ca3af", borderRadius: 7, fontSize: 12, fontWeight: 600, textAlign: "center" }}>
                📄 {product.tech_doc_url ? "Technical Document Available" : "Tech Doc — Coming Soon"}
              </div>
              <div style={{ flex: 1, padding: "10px 14px", background: product.cad_url ? "#166534" : "#f3f4f6", color: product.cad_url ? "#fff" : "#9ca3af", borderRadius: 7, fontSize: 12, fontWeight: 600, textAlign: "center" }}>
                📐 {product.cad_url ? "CAD Drawing Available" : "CAD — Coming Soon"}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div style={{ background: "#f8fafc", borderTop: "2px solid #e2e8f0", padding: "12px 24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ fontSize: 10, color: "#94a3b8" }}>
              Uniking Canada · 12985 Rue Brault, Mirabel, QC J7J 0W2 · logistics@unikingcanada.com
            </div>
            <div style={{ fontSize: 10, color: "#94a3b8" }}>
              {new Date().toLocaleDateString("en-CA")} · Internal Use Only · No Pricing
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Product Detail Modal ─────────────────────────────────────────
function ProductModal({ product, onClose, onTearSheet }) {
  if (!product) return null;
  const vc = VENDOR_COLORS[product.vendor] || { bg: "#f3f4f6", text: "#374151" };
  const catImg = CATEGORY_IMAGES[product.category];
  const imgSrc = product.image_url || catImg;
  const materials = product.materials ? product.materials.split(",").map(m => m.trim()) : [];

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}
      onClick={onClose}>
      <div style={{ background: "#fff", borderRadius: 14, width: "100%", maxWidth: 580, maxHeight: "92vh", overflowY: "auto", position: "relative" }}
        onClick={e => e.stopPropagation()}>

        {/* Image */}
        <div style={{ height: 200, position: "relative", borderRadius: "14px 14px 0 0", overflow: "hidden" }}>
          <ProductImage src={imgSrc} alt={product.series} style={{ width: "100%", height: "100%" }} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(26,58,92,0.85) 0%, transparent 60%)" }} />
          <button onClick={onClose} style={{ position: "absolute", top: 12, right: 12, background: "rgba(0,0,0,0.4)", border: "none", borderRadius: "50%", width: 32, height: 32, cursor: "pointer", color: "#fff", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
          <div style={{ position: "absolute", bottom: 14, left: 18, right: 18 }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: "#fff" }}>{product.series}</div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.8)", marginTop: 2 }}>{product.style}</div>
          </div>
        </div>

        <div style={{ padding: "20px 24px" }}>
          {/* Badges */}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
            <Badge label={product.vendor} color={vc.bg} textColor={vc.text} />
            {product.category && <Badge label={`${CATEGORY_ICONS[product.category] || ""} ${product.category}`.trim()} color="#f5f3ff" textColor="#6d28d9" />}
          </div>

          {/* Notes */}
          {product.notes && (
            <div style={{ fontSize: 13, color: "#374151", lineHeight: 1.6, marginBottom: 16, padding: "10px 12px", background: "#f8fafc", borderRadius: 8, borderLeft: `3px solid ${NAVY}` }}>
              {product.notes}
            </div>
          )}

          {/* Specs grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px 20px", marginBottom: 16 }}>
            {[
              ["Pitch", product.pitch_in ? `${product.pitch_in}" (${product.pitch_mm} mm)` : "—"],
              ["Open Area", product.open_area || "—"],
              ["Hinge Style", product.hinge_style || "—"],
              ["Min Width", product.min_width_in ? `${product.min_width_in}"` : "—"],
            ].map(([label, val]) => (
              <div key={label}>
                <div style={{ fontSize: 10, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: 0.5 }}>{label}</div>
                <div style={{ fontSize: 14, color: NAVY, fontWeight: 600, marginTop: 3 }}>{val}</div>
              </div>
            ))}
          </div>

          {/* Materials */}
          {materials.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 }}>Available Materials</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {materials.map(m => <Badge key={m} label={m} color="#f3f4f6" textColor="#374151" />)}
              </div>
            </div>
          )}

          {/* Docs */}
          <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
            {product.tech_doc_url
              ? <a href={product.tech_doc_url} target="_blank" rel="noreferrer" style={{ flex: 1, padding: "10px 12px", background: NAVY, color: "#fff", borderRadius: 8, textDecoration: "none", textAlign: "center", fontSize: 12, fontWeight: 600 }}>📄 Tech Doc</a>
              : <div style={{ flex: 1, padding: "10px 12px", background: "#f3f4f6", color: "#9ca3af", borderRadius: 8, textAlign: "center", fontSize: 12 }}>📄 Tech Doc — Soon</div>
            }
            {product.cad_url
              ? <a href={product.cad_url} target="_blank" rel="noreferrer" style={{ flex: 1, padding: "10px 12px", background: "#166534", color: "#fff", borderRadius: 8, textDecoration: "none", textAlign: "center", fontSize: 12, fontWeight: 600 }}>📐 CAD</a>
              : <div style={{ flex: 1, padding: "10px 12px", background: "#f3f4f6", color: "#9ca3af", borderRadius: 8, textAlign: "center", fontSize: 12 }}>📐 CAD — Soon</div>
            }
          </div>

          {/* Tear Sheet CTA */}
          <button onClick={() => onTearSheet(product)} style={{ width: "100%", padding: "11px", background: "#f0f4ff", border: `1px solid #c3d9fd`, borderRadius: 8, color: NAVY, fontSize: 13, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            📄 View Uniking Tear Sheet
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Product Card ─────────────────────────────────────────────────
function ProductCard({ product, onClick }) {
  const vc = VENDOR_COLORS[product.vendor] || { bg: "#f3f4f6", text: "#374151" };
  const catImg = CATEGORY_IMAGES[product.category];
  const imgSrc = product.image_url || catImg;

  return (
    <div onClick={() => onClick(product)}
      style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, overflow: "hidden", cursor: "pointer", transition: "box-shadow 0.15s, border-color 0.15s", display: "flex", flexDirection: "column" }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 6px 20px rgba(26,58,92,0.12)"; e.currentTarget.style.borderColor = "#93c5fd"; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.borderColor = "#e5e7eb"; }}>

      {/* Image */}
      <div style={{ height: 130, position: "relative", overflow: "hidden", flexShrink: 0 }}>
        <ProductImage src={imgSrc} alt={product.series} style={{ width: "100%", height: "100%" }} />
        <div style={{ position: "absolute", top: 8, right: 8 }}>
          <Badge label={product.vendor} color={vc.bg} textColor={vc.text} />
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: "12px 14px", display: "flex", flexDirection: "column", gap: 8, flex: 1 }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: NAVY }}>{product.series}</div>
          <div style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>{product.style}</div>
        </div>

        <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
          {product.pitch_in && <Badge label={`${product.pitch_in}" pitch`} color="#f0fdf4" textColor="#166534" small />}
          {product.open_area && product.open_area !== "0%" && <Badge label={`${product.open_area} open`} color="#fef9c3" textColor="#854d0e" small />}
          {product.hinge_style && <Badge label={`${product.hinge_style} hinge`} color="#f3f4f6" textColor="#4b5563" small />}
        </div>

        {product.notes && (
          <div style={{ fontSize: 11, color: "#6b7280", lineHeight: 1.45, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
            {product.notes}
          </div>
        )}

        <div style={{ marginTop: "auto", paddingTop: 6, borderTop: "1px solid #f3f4f6", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", gap: 4 }}>
            {product.tech_doc_url && <Badge label="📄" color="#eff6ff" textColor="#1d4ed8" small />}
            {product.cad_url && <Badge label="📐" color="#f0fdf4" textColor="#166534" small />}
          </div>
          <span style={{ fontSize: 10, color: "#9ca3af" }}>View details →</span>
        </div>
      </div>
    </div>
  );
}

// ── Main Catalog ─────────────────────────────────────────────────
export default function Catalog() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [filterVendor, setFilterVendor] = useState("All");
  const [filterCategory, setFilterCategory] = useState("All");
  const [filterPitch, setFilterPitch] = useState("All");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [tearSheetProduct, setTearSheetProduct] = useState(null);

  useEffect(() => {
    CatalogProduct.filter({})
      .then(data => { setProducts(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => { setError("Failed to load. Please refresh."); setLoading(false); });
  }, []);

  const vendors    = useMemo(() => ["All", ...Array.from(new Set(products.map(p => p.vendor))).sort()], [products]);
  const categories = useMemo(() => ["All", ...Array.from(new Set(products.map(p => p.category))).sort()], [products]);
  const pitches    = useMemo(() => ["All", ...Array.from(new Set(products.map(p => p.pitch_in).filter(Boolean))).sort((a,b)=>parseFloat(a)-parseFloat(b)).map(p=>`${p}"`)], [products]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return products.filter(p => {
      if (q) {
        const hay = [p.series, p.style, p.materials, p.notes, p.search_tags, p.category, p.vendor].filter(Boolean).join(" ").toLowerCase();
        if (!hay.includes(q)) return false;
      }
      if (filterVendor !== "All" && p.vendor !== filterVendor) return false;
      if (filterCategory !== "All" && p.category !== filterCategory) return false;
      if (filterPitch !== "All" && `${p.pitch_in}"` !== filterPitch) return false;
      return true;
    });
  }, [products, search, filterVendor, filterCategory, filterPitch]);

  const grouped = useMemo(() => {
    const map = {};
    for (const p of filtered) { if (!map[p.series]) map[p.series] = []; map[p.series].push(p); }
    return Object.entries(map).sort((a,b) => (parseFloat(a[1][0]?.series_number)||0) - (parseFloat(b[1][0]?.series_number)||0));
  }, [filtered]);

  const activeFilters = search || filterVendor !== "All" || filterCategory !== "All" || filterPitch !== "All";

  const sel = {
    padding: "8px 12px", border: "1px solid #e5e7eb", borderRadius: 8,
    fontSize: 13, color: "#374151", background: "#fff", cursor: "pointer", outline: "none",
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f4f6f9", fontFamily: "Arial, sans-serif" }}>

      {/* ── Header ── */}
      <div style={{ background: NAVY, padding: "18px 32px" }}>
        <div style={{ maxWidth: 1140, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <UniKingLogo size={30} />
            <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", letterSpacing: 3, textTransform: "uppercase" }}>UNITING THE STRONGEST LINKS</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ color: "#fff", fontSize: 17, fontWeight: 700 }}>🔩 Parts Catalog</div>
            <div style={{ color: "rgba(255,255,255,0.55)", fontSize: 12, marginTop: 2 }}>
              {loading ? "Loading..." : `${products.length} products · ${new Set(products.map(p=>p.vendor)).size} vendor${new Set(products.map(p=>p.vendor)).size!==1?"s":""}`}
            </div>
          </div>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", letterSpacing: 0.5, textAlign: "right" }}>
            INTERNAL USE ONLY<br/>NO PRICING
          </div>
        </div>
      </div>

      {/* ── Filters ── */}
      <div style={{ background: "#fff", borderBottom: "1px solid #e5e7eb", padding: "12px 32px", position: "sticky", top: 0, zIndex: 10, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
        <div style={{ maxWidth: 1140, margin: "0 auto", display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          <input value={search} onChange={e=>setSearch(e.target.value)}
            placeholder="🔍  Search series, style, material, keyword..."
            style={{ flex: 1, minWidth: 200, padding: "8px 14px", border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 13, outline: "none" }}
          />
          <select value={filterVendor}   onChange={e=>setFilterVendor(e.target.value)}   style={sel}>{vendors.map(v=><option key={v}>{v}</option>)}</select>
          <select value={filterCategory} onChange={e=>setFilterCategory(e.target.value)} style={sel}>{categories.map(c=><option key={c}>{c}</option>)}</select>
          <select value={filterPitch}    onChange={e=>setFilterPitch(e.target.value)}    style={sel}>{pitches.map(p=><option key={p}>{p}</option>)}</select>
          {activeFilters && (
            <button onClick={()=>{setSearch("");setFilterVendor("All");setFilterCategory("All");setFilterPitch("All");}}
              style={{ padding:"8px 14px",border:"1px solid #fca5a5",borderRadius:8,background:"#fef2f2",color:"#dc2626",fontSize:12,fontWeight:600,cursor:"pointer" }}>
              ✕ Clear
            </button>
          )}
          <div style={{ fontSize: 12, color: "#9ca3af", marginLeft: "auto" }}>
            {!loading && `${filtered.length} result${filtered.length!==1?"s":""}`}
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div style={{ maxWidth: 1140, margin: "0 auto", padding: "28px 32px" }}>
        {loading && (
          <div style={{ textAlign:"center",padding:80 }}>
            <div style={{ fontSize:36,marginBottom:12 }}>⚙️</div>
            <div style={{ color:"#6b7280",fontSize:15 }}>Loading catalog...</div>
          </div>
        )}
        {error && <div style={{ textAlign:"center",padding:60,color:"#dc2626" }}>{error}</div>}

        {!loading && !error && grouped.length === 0 && (
          <div style={{ textAlign:"center",padding:80 }}>
            <div style={{ fontSize:36,marginBottom:12 }}>🔍</div>
            <div style={{ color:"#6b7280",fontSize:15 }}>No products match your filters.</div>
            {activeFilters && <button onClick={()=>{setSearch("");setFilterVendor("All");setFilterCategory("All");setFilterPitch("All");}} style={{ marginTop:16,padding:"8px 20px",background:NAVY,color:"#fff",border:"none",borderRadius:8,cursor:"pointer",fontSize:13 }}>Clear Filters</button>}
          </div>
        )}

        {!loading && !error && grouped.map(([series, items]) => (
          <div key={series} style={{ marginBottom: 36 }}>
            <div style={{ display:"flex",alignItems:"center",gap:10,marginBottom:14 }}>
              <div style={{ fontSize:15,fontWeight:700,color:NAVY }}>{series}</div>
              <div style={{ fontSize:12,color:"#9ca3af" }}>{items.length} style{items.length!==1?"s":""}</div>
              <div style={{ flex:1,height:1,background:"#e5e7eb" }} />
            </div>
            <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(250px,1fr))",gap:16 }}>
              {items.map(p=><ProductCard key={p.id} product={p} onClick={setSelectedProduct} />)}
            </div>
          </div>
        ))}
      </div>

      {/* ── Modals ── */}
      {selectedProduct && !tearSheetProduct && (
        <ProductModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onTearSheet={(p) => { setTearSheetProduct(p); setSelectedProduct(null); }}
        />
      )}
      {tearSheetProduct && (
        <TearSheet product={tearSheetProduct} onClose={() => setTearSheetProduct(null)} />
      )}
    </div>
  );
}
