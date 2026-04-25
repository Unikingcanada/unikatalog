import { useState, useEffect, useMemo } from "react";
import { UniCatalog, CatalogProduct, ElevatorBucket } from "@/api/entities";

// ─── Constants ────────────────────────────────────────────────────────────────

// Only these types show brand name
const SHOW_BRAND = new Set(["Modular Belt", "Elevator Bucket", "4B Electronics"]);

// Types that require brand selection before product list
const BRAND_GATED = new Set(["Modular Belt", "Elevator Bucket"]);

// Product type definitions with icons (text-based, no emoji) and filter configs
const PRODUCT_TYPES = [
  {
    key: "Modular Belt",
    label: "Modular Plastic Belting",
    description: "Straight-running, radius, spiral and side-flexing modular plastic belt systems",
    filters: ["category", "style", "pitch_in", "materials", "hinge_style"],
  },
  {
    key: "Elevator Bucket",
    label: "Elevator Buckets",
    description: "Agricultural and industrial elevator buckets, belting, hardware and accessories",
    filters: ["application", "discharge_type", "duty", "material", "profile"],
  },
  {
    key: "Table Top Chain",
    label: "Table Top Chain",
    description: "Straight-running and side-flexing table top chains in steel and plastic",
    filters: ["style", "materials", "duty"],
  },
  {
    key: "ANSI/BS Chain",
    label: "ANSI / British Standard Chain",
    description: "Standard precision roller chains to ANSI and BS specifications",
    filters: ["style", "materials", "duty"],
  },
  {
    key: "Engineered Chain",
    label: "Engineered Chain",
    description: "Heavy-duty engineered steel chains for demanding industrial applications",
    filters: ["style", "materials", "duty"],
  },
  {
    key: "Cast Chain",
    label: "Cast Chain",
    description: "Malleable and ductile cast iron conveyor chains",
    filters: ["style", "materials"],
  },
  {
    key: "Welded Steel Chain",
    label: "Welded Steel Chain",
    description: "Welded steel drag and conveyor chains for bulk material handling",
    filters: ["style", "duty"],
  },
  {
    key: "Forged Chain",
    label: "Forged Chain",
    description: "Forged steel chains for high-load and abrasive environments",
    filters: ["style", "materials", "duty"],
  },
  {
    key: "Overhead Chain",
    label: "Overhead Conveyor Chain",
    description: "Overhead conveyor and power-and-free chain systems",
    filters: ["style", "materials"],
  },
  {
    key: "Sharptop Chain",
    label: "Sharp Top Chain",
    description: "Sharp top and spike top chains for agricultural and forestry applications",
    filters: ["style", "materials"],
  },
  {
    key: "Kiln Chain",
    label: "Kiln Chain",
    description: "High-temperature kiln and dryer chains for cement and mineral processing",
    filters: ["style", "materials"],
  },
  {
    key: "Thermoforming Chain",
    label: "Thermoforming Chain",
    description: "Precision chains for plastic thermoforming and packaging machinery",
    filters: ["style", "materials"],
  },
  {
    key: "Wire Mesh Belt",
    label: "Wire Mesh Belt",
    description: "Stainless and carbon steel wire mesh conveyor belts for food and industrial processing",
    filters: ["style", "materials", "duty"],
  },
  {
    key: "Steel Hinged Belt",
    label: "Steel Hinged Belt",
    description: "Steel hinged slat and plate conveyor belts",
    filters: ["style", "materials"],
  },
  {
    key: "Conveyor Roller",
    label: "Conveyor Rollers",
    description: "Standard, lagging, motorized and specialty conveyor rollers",
    filters: ["style", "duty"],
  },
  {
    key: "Monitoring System",
    label: "4B Electronics & Monitoring",
    description: "Bucket elevator and conveyor safety monitoring systems and sensors",
    filters: ["style"],
  },
  {
    key: "Magnetic Conveyor",
    label: "Magnetic Conveyor",
    description: "Magnetic conveyor systems for ferrous material handling",
    filters: ["style"],
  },
];

const TYPE_MAP = Object.fromEntries(PRODUCT_TYPES.map(t => [t.key, t]));

// Filter label overrides per field
const FILTER_LABELS = {
  category:       "Belt Category",
  style:          "Style / Type",
  pitch_in:       "Pitch (inches)",
  materials:      "Material",
  material:       "Material",
  hinge_style:    "Hinge Style",
  duty:           "Duty Rating",
  discharge_type: "Discharge Type",
  application:    "Application",
  profile:        "Profile",
};

// ─── Data normalisation ───────────────────────────────────────────────────────

function parseSpecs(raw) {
  if (!raw) return {};
  if (typeof raw === "object") return raw;
  try { return JSON.parse(raw); } catch { return {}; }
}

function normalizeCatalogProduct(r) {
  return {
    id: r.id, _source: "catalogproduct",
    type: "Modular Belt",
    brand: r.vendor || "Intralox",
    series: r.series || "",
    style: r.style || "",
    category: r.category || "",
    pitch_in: r.pitch_in ? String(r.pitch_in) + '"' : "",
    pitch_mm: r.pitch_mm ? String(r.pitch_mm) + " mm" : "",
    materials: r.materials || "",
    hinge_style: r.hinge_style || "",
    open_area: r.open_area || "",
    min_width_in: r.min_width_in ? r.min_width_in + '" min width' : "",
    application: r.category || "",
    duty: "",
    notes: r.notes || "",
    catalog_url: "",
    tech_doc_url: r.tech_doc_url || "",
    specs: {
      "Belt Category":  r.category,
      "Style":          r.style,
      "Pitch":          r.pitch_in ? `${r.pitch_in}" (${r.pitch_mm} mm)` : null,
      "Hinge Style":    r.hinge_style,
      "Open Area":      r.open_area,
      "Min Belt Width": r.min_width_in ? `${r.min_width_in}"` : null,
      "Materials":      r.materials,
    },
  };
}

function normalizeElevatorBucket(r) {
  return {
    id: r.id, _source: "elevbucket",
    type: "Elevator Bucket",
    brand: r.vendor || "",
    series: r.series || "",
    style: r.style || "",
    category: r.profile || "",
    application: r.application || "",
    discharge_type: r.discharge_type || "",
    duty: r.duty || "",
    material: r.material || "",
    materials: r.material || "",
    profile: r.profile || "",
    notes: r.notes || "",
    catalog_url: "",
    tech_doc_url: r.tech_doc_url || "",
    specs: {
      "Vendor":           r.vendor,
      "Discharge Type":   r.discharge_type,
      "Profile":          r.profile,
      "Duty":             r.duty,
      "Material":         r.material,
      "Available Sizes":  r.bucket_sizes,
      "Application":      r.application,
    },
  };
}

function normalizeUniCatalog(r) {
  const specs = parseSpecs(r.key_specs);
  return {
    id: r.id, _source: "unicatalog",
    type: r.product_type || "General",
    brand: "",
    series: r.series || "",
    style: r.style || "",
    category: r.style || "",
    application: r.application || "",
    materials: r.materials || "",
    material: r.materials || "",
    duty: r.duty || "",
    notes: (r.features || "") + (r.notes ? (r.features ? " " + r.notes : r.notes) : ""),
    catalog_url: r.catalog_url || "",
    tech_doc_url: r.tech_doc_url || "",
    specs: {
      "Style":       r.style,
      "Application": r.application,
      "Materials":   r.materials,
      "Duty":        r.duty,
      ...Object.fromEntries(Object.entries(specs).map(([k, v]) => [k.replace(/_/g," "), v])),
    },
  };
}

// ─── Filter logic ─────────────────────────────────────────────────────────────

function getFilterValues(products, field) {
  const vals = new Set();
  for (const p of products) {
    const raw = p[field];
    if (!raw) continue;
    // Some fields may be comma-separated — split and add individually
    const parts = String(raw).split(",").map(s => s.trim()).filter(Boolean);
    for (const part of parts) vals.add(part);
  }
  return [...vals].sort();
}

function applyFilters(products, activeFilters) {
  return products.filter(p =>
    Object.entries(activeFilters).every(([field, val]) => {
      if (!val) return true;
      const raw = String(p[field] || "").toLowerCase();
      return raw.includes(val.toLowerCase());
    })
  );
}

// ─── Components ───────────────────────────────────────────────────────────────

const C = {
  navy:    "#0f2340",
  navyMid: "#1a3a5c",
  navyLt:  "#2d5986",
  slate:   "#334155",
  muted:   "#64748b",
  border:  "#e2e8f0",
  bg:      "#f8fafc",
  bgCard:  "#ffffff",
  text:    "#0f172a",
  accent:  "#1a3a5c",
};

function TopBar() {
  return (
    <div style={{ background: C.navy, height: 56, display: "flex", alignItems: "center", padding: "0 40px", justifyContent: "space-between", flexShrink: 0 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ width: 28, height: 28, background: C.navyLt, borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ width: 16, height: 2, background: "#fff", boxShadow: "0 -5px 0 #fff, 0 5px 0 #fff" }} />
        </div>
        <span style={{ color: "#fff", fontWeight: 800, fontSize: 15, letterSpacing: "0.3px" }}>UNIKING CANADA</span>
        <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 13, marginLeft: 4 }}>/ Product Catalog</span>
      </div>
      <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 11, letterSpacing: "1px", textTransform: "uppercase" }}>Confidential — Internal Use</span>
    </div>
  );
}

function Breadcrumb({ items, onNav }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: C.muted, marginBottom: 24 }}>
      {items.map((item, i) => (
        <span key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {i > 0 && <span style={{ color: C.border }}>›</span>}
          {i < items.length - 1 ? (
            <span onClick={() => onNav(i)} style={{ color: C.navyMid, cursor: "pointer", fontWeight: 500 }}>{item}</span>
          ) : (
            <span style={{ color: C.text, fontWeight: 600 }}>{item}</span>
          )}
        </span>
      ))}
    </div>
  );
}

// Home: grid of product type cards
function TypeGrid({ types, onSelect }) {
  const [hovered, setHovered] = useState(null);
  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: C.text, margin: 0 }}>Product Lines</h1>
        <p style={{ margin: "6px 0 0", color: C.muted, fontSize: 14 }}>
          Select a product category to browse specifications and technical documentation.
        </p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
        {types.map(t => (
          <div
            key={t.key}
            onClick={() => onSelect(t.key)}
            onMouseEnter={() => setHovered(t.key)}
            onMouseLeave={() => setHovered(null)}
            style={{
              background: hovered === t.key ? C.navyMid : C.bgCard,
              border: `1px solid ${hovered === t.key ? C.navyMid : C.border}`,
              borderRadius: 8,
              padding: "20px 22px",
              cursor: "pointer",
              transition: "background 0.15s, border-color 0.15s",
            }}
          >
            <div style={{ fontSize: 15, fontWeight: 700, color: hovered === t.key ? "#fff" : C.text, marginBottom: 6 }}>
              {t.label}
            </div>
            <div style={{ fontSize: 12, color: hovered === t.key ? "rgba(255,255,255,0.65)" : C.muted, lineHeight: 1.6 }}>
              {t.description}
            </div>
            <div style={{ marginTop: 14, fontSize: 11, fontWeight: 600, color: hovered === t.key ? "rgba(255,255,255,0.5)" : C.navyMid, letterSpacing: "0.5px" }}>
              VIEW PRODUCTS ›
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Brand selection grid (for Modular Belt & Elevator Bucket)
function BrandGrid({ products, onSelect }) {
  const brands = useMemo(() => {
    const map = {};
    for (const p of products) {
      if (!p.brand) continue;
      if (!map[p.brand]) map[p.brand] = 0;
      map[p.brand]++;
    }
    return Object.entries(map).sort((a, b) => a[0].localeCompare(b[0]));
  }, [products]);

  const [hovered, setHovered] = useState(null);

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: C.text, margin: 0 }}>Select Manufacturer</h2>
        <p style={{ margin: "5px 0 0", color: C.muted, fontSize: 13 }}>Choose a brand to view their product range.</p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 14 }}>
        {brands.map(([brand, count]) => (
          <div
            key={brand}
            onClick={() => onSelect(brand)}
            onMouseEnter={() => setHovered(brand)}
            onMouseLeave={() => setHovered(null)}
            style={{
              background: hovered === brand ? C.navyMid : C.bgCard,
              border: `1px solid ${hovered === brand ? C.navyMid : C.border}`,
              borderRadius: 8,
              padding: "18px 20px",
              cursor: "pointer",
              transition: "background 0.15s, border-color 0.15s",
            }}
          >
            <div style={{ fontSize: 15, fontWeight: 700, color: hovered === brand ? "#fff" : C.text, marginBottom: 4 }}>{brand}</div>
            <div style={{ fontSize: 12, color: hovered === brand ? "rgba(255,255,255,0.55)" : C.muted }}>{count} product{count !== 1 ? "s" : ""}</div>
            <div style={{ marginTop: 12, fontSize: 11, fontWeight: 600, color: hovered === brand ? "rgba(255,255,255,0.5)" : C.navyMid, letterSpacing: "0.5px" }}>
              VIEW RANGE ›
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Filter chip row
function FilterBar({ typeKey, products, activeFilters, onChange }) {
  const typeDef = TYPE_MAP[typeKey];
  if (!typeDef) return null;

  const filterFields = typeDef.filters || [];

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginBottom: 24 }}>
      {filterFields.map(field => {
        const options = getFilterValues(products, field);
        if (options.length < 2) return null;
        const label = FILTER_LABELS[field] || field;
        const active = activeFilters[field] || "";
        return (
          <div key={field} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <label style={{ fontSize: 11, fontWeight: 600, color: C.muted, letterSpacing: "0.5px", textTransform: "uppercase" }}>{label}</label>
            <select
              value={active}
              onChange={e => onChange(field, e.target.value)}
              style={{
                padding: "7px 10px",
                border: `1px solid ${active ? C.navyMid : C.border}`,
                borderRadius: 5,
                fontSize: 12,
                color: active ? C.navyMid : C.slate,
                fontWeight: active ? 600 : 400,
                background: active ? "#eef3f8" : "#fff",
                cursor: "pointer",
                outline: "none",
                minWidth: 140,
              }}
            >
              <option value="">All</option>
              {options.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
        );
      })}
      {Object.values(activeFilters).some(Boolean) && (
        <div style={{ display: "flex", alignItems: "flex-end" }}>
          <button
            onClick={() => onChange("__clear__", null)}
            style={{ padding: "7px 14px", background: "none", border: `1px solid ${C.border}`, borderRadius: 5, fontSize: 12, color: C.muted, cursor: "pointer" }}
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
}

// Spec table in modal
function SpecTable({ specs }) {
  const entries = Object.entries(specs).filter(([, v]) => v != null && v !== "" && v !== "N/A" && v !== "undefined");
  if (!entries.length) return null;
  return (
    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
      <tbody>
        {entries.map(([k, v], i) => (
          <tr key={k} style={{ background: i % 2 ? "#f8fafc" : "#fff" }}>
            <td style={{ padding: "8px 12px", color: C.muted, fontWeight: 600, width: "42%", verticalAlign: "top", borderBottom: `1px solid ${C.border}` }}>{k}</td>
            <td style={{ padding: "8px 12px", color: C.text, borderBottom: `1px solid ${C.border}` }}>{v}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// Product detail modal
function ProductModal({ product, showBrand, onClose }) {
  if (!product) return null;
  return (
    <div
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}
      onClick={onClose}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{ background: "#fff", borderRadius: 10, width: "100%", maxWidth: 660, maxHeight: "88vh", overflowY: "auto", boxShadow: "0 24px 64px rgba(0,0,0,0.25)", display: "flex", flexDirection: "column" }}
      >
        {/* Modal header */}
        <div style={{ background: C.navyMid, padding: "22px 28px", borderRadius: "10px 10px 0 0", flexShrink: 0 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "1.5px", color: "rgba(255,255,255,0.45)", marginBottom: 5 }}>
                {TYPE_MAP[product.type]?.label || product.type}
                {showBrand && product.brand ? ` · ${product.brand}` : ""}
              </div>
              <div style={{ fontSize: 20, fontWeight: 800, color: "#fff", lineHeight: 1.2 }}>{product.series}</div>
              {product.style && product.style !== product.series && (
                <div style={{ fontSize: 13, color: "rgba(255,255,255,0.65)", marginTop: 4 }}>{product.style}</div>
              )}
            </div>
            <button onClick={onClose} style={{ background: "rgba(255,255,255,0.15)", border: "none", color: "#fff", width: 30, height: 30, borderRadius: 6, cursor: "pointer", fontSize: 17, display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
          </div>
        </div>

        <div style={{ padding: "24px 28px", overflowY: "auto" }}>
          {/* Application */}
          {product.application && product.application !== product.category && (
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", color: C.muted, marginBottom: 6 }}>Application</div>
              <div style={{ fontSize: 13, color: C.slate, lineHeight: 1.7 }}>{product.application}</div>
            </div>
          )}

          {/* Specifications */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", color: C.muted, marginBottom: 8 }}>Specifications</div>
            <div style={{ border: `1px solid ${C.border}`, borderRadius: 6, overflow: "hidden" }}>
              <SpecTable specs={product.specs} />
            </div>
          </div>

          {/* Notes */}
          {product.notes && (
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", color: C.muted, marginBottom: 6 }}>Notes</div>
              <div style={{ fontSize: 13, color: C.slate, lineHeight: 1.75, background: C.bg, padding: "12px 14px", borderRadius: 6 }}>
                {product.notes}
              </div>
            </div>
          )}

          {/* Links */}
          {(product.catalog_url || product.tech_doc_url) && (
            <div style={{ display: "flex", gap: 10, paddingTop: 4 }}>
              {product.catalog_url && (
                <a href={product.catalog_url} target="_blank" rel="noopener noreferrer"
                  style={{ padding: "9px 18px", background: C.navyMid, color: "#fff", borderRadius: 6, fontSize: 12, fontWeight: 600, textDecoration: "none" }}>
                  View Catalog PDF
                </a>
              )}
              {product.tech_doc_url && (
                <a href={product.tech_doc_url} target="_blank" rel="noopener noreferrer"
                  style={{ padding: "9px 18px", background: C.bg, border: `1px solid ${C.border}`, color: C.slate, borderRadius: 6, fontSize: 12, fontWeight: 600, textDecoration: "none" }}>
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

// Product card
function ProductCard({ product, showBrand, onClick }) {
  const [hovered, setHovered] = useState(false);
  const topSpecs = Object.entries(product.specs)
    .filter(([, v]) => v != null && v !== "" && v !== "N/A")
    .slice(0, 4);

  return (
    <div
      onClick={() => onClick(product)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: C.bgCard,
        border: `1px solid ${hovered ? C.navyMid : C.border}`,
        borderRadius: 8,
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
        transition: "border-color 0.15s, box-shadow 0.15s",
        boxShadow: hovered ? "0 4px 16px rgba(26,58,92,0.10)" : "none",
        overflow: "hidden",
      }}
    >
      {/* Top accent bar */}
      <div style={{ height: 3, background: C.navyMid, flexShrink: 0 }} />

      <div style={{ padding: "16px 18px", flex: 1, display: "flex", flexDirection: "column" }}>
        {/* Brand badge */}
        {showBrand && product.brand && (
          <div style={{ marginBottom: 8 }}>
            <span style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.8px", color: C.navyMid, background: "#eef3f8", padding: "2px 8px", borderRadius: 3 }}>
              {product.brand}
            </span>
          </div>
        )}

        {/* Series / name */}
        <div style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 3, lineHeight: 1.3 }}>{product.series}</div>
        {product.style && product.style !== product.series && (
          <div style={{ fontSize: 12, color: C.muted, marginBottom: 10 }}>{product.style}</div>
        )}

        {/* Spec chips */}
        {topSpecs.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginTop: "auto", paddingTop: 12, borderTop: `1px solid ${C.bg}` }}>
            {topSpecs.map(([k, v]) => (
              <div key={k} style={{ fontSize: 11, background: C.bg, border: `1px solid ${C.border}`, borderRadius: 4, padding: "2px 7px", color: C.slate }}>
                <span style={{ color: C.muted }}>{k}: </span>{String(v).length > 24 ? String(v).slice(0,24)+"…" : v}
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ borderTop: `1px solid ${C.bg}`, padding: "9px 18px", background: hovered ? "#f1f5f9" : C.bgCard, transition: "background 0.15s" }}>
        <span style={{ fontSize: 11, fontWeight: 600, color: C.navyMid, letterSpacing: "0.3px" }}>View Specifications ›</span>
      </div>
    </div>
  );
}

// Product list view with search + filters
function ProductList({ typeKey, brand, products: allProducts, showBrand, onBack }) {
  const [activeFilters, setActiveFilters] = useState({});
  const [search, setSearch] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);

  const filtered = useMemo(() => {
    let list = allProducts;
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(p =>
        [p.series, p.style, p.notes, p.materials, p.material, p.application, p.category]
          .some(f => (f || "").toLowerCase().includes(q))
      );
    }
    list = applyFilters(list, activeFilters);
    return list;
  }, [allProducts, search, activeFilters]);

  function handleFilterChange(field, val) {
    if (field === "__clear__") { setActiveFilters({}); return; }
    setActiveFilters(prev => ({ ...prev, [field]: val }));
  }

  return (
    <div>
      {/* Search */}
      <div style={{ display: "flex", gap: 12, marginBottom: 20, alignItems: "center" }}>
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search series, material, application..."
          style={{ flex: 1, maxWidth: 400, padding: "9px 14px", border: `1px solid ${C.border}`, borderRadius: 6, fontSize: 13, outline: "none", color: C.text }}
        />
        <div style={{ fontSize: 13, color: C.muted }}>{filtered.length} of {allProducts.length} products</div>
      </div>

      {/* Filters */}
      <FilterBar typeKey={typeKey} products={allProducts} activeFilters={activeFilters} onChange={handleFilterChange} />

      {/* Grid */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: 60, color: C.muted, fontSize: 14 }}>No products match the selected filters.</div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(290px, 1fr))", gap: 14 }}>
          {filtered.map(p => (
            <ProductCard key={p.id} product={p} showBrand={showBrand} onClick={setSelectedProduct} />
          ))}
        </div>
      )}

      {selectedProduct && (
        <ProductModal product={selectedProduct} showBrand={showBrand} onClose={() => setSelectedProduct(null)} />
      )}
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────

export default function Home() {
  const [allData, setAllData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Navigation state
  const [view, setView] = useState("home");   // "home" | "brands" | "products"
  const [selectedType, setSelectedType] = useState(null);
  const [selectedBrand, setSelectedBrand] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const [uni, cat, elev] = await Promise.all([
          UniCatalog.list(),
          CatalogProduct.list(),
          ElevatorBucket.list(),
        ]);
        setAllData([
          ...cat.map(normalizeCatalogProduct),
          ...elev.map(normalizeElevatorBucket),
          ...uni.map(normalizeUniCatalog),
        ]);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // Products for current type
  const typeProducts = useMemo(() =>
    allData.filter(p => p.type === selectedType),
    [allData, selectedType]
  );

  // Products for current brand (within type)
  const brandProducts = useMemo(() =>
    selectedBrand ? typeProducts.filter(p => p.brand === selectedBrand) : typeProducts,
    [typeProducts, selectedBrand]
  );

  const isBrandGated = selectedType && BRAND_GATED.has(selectedType);
  const showBrand = selectedType && SHOW_BRAND.has(selectedType);

  // Nav handlers
  function selectType(typeKey) {
    setSelectedType(typeKey);
    setSelectedBrand(null);
    if (BRAND_GATED.has(typeKey)) {
      setView("brands");
    } else {
      setView("products");
    }
  }

  function selectBrand(brand) {
    setSelectedBrand(brand);
    setView("products");
  }

  function navTo(level) {
    if (level === 0) { setView("home"); setSelectedType(null); setSelectedBrand(null); }
    if (level === 1) { setView("brands"); setSelectedBrand(null); }
  }

  // Breadcrumb items
  const breadcrumbs = (() => {
    const items = ["All Products"];
    if (selectedType) items.push(TYPE_MAP[selectedType]?.label || selectedType);
    if (selectedBrand) items.push(selectedBrand);
    return items;
  })();

  const availableTypes = PRODUCT_TYPES.filter(t =>
    allData.some(p => p.type === t.key)
  );

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "'Inter','Segoe UI',Arial,sans-serif", display: "flex", flexDirection: "column" }}>
      <TopBar />

      <div style={{ flex: 1, maxWidth: 1280, width: "100%", margin: "0 auto", padding: "32px 40px", boxSizing: "border-box" }}>

        {/* Breadcrumb */}
        {view !== "home" && (
          <Breadcrumb items={breadcrumbs} onNav={navTo} />
        )}

        {loading ? (
          <div style={{ textAlign: "center", padding: 80, color: C.muted, fontSize: 14 }}>Loading catalog...</div>
        ) : view === "home" ? (
          <TypeGrid types={availableTypes} onSelect={selectType} />
        ) : view === "brands" ? (
          <BrandGrid products={typeProducts} onSelect={selectBrand} />
        ) : (
          <ProductList
            typeKey={selectedType}
            brand={selectedBrand}
            products={brandProducts}
            showBrand={showBrand && !selectedBrand}
            onBack={() => isBrandGated ? navTo(1) : navTo(0)}
          />
        )}
      </div>

      <div style={{ borderTop: `1px solid ${C.border}`, padding: "16px 40px", textAlign: "center", fontSize: 11, color: "#cbd5e1" }}>
        Uniking Canada · Technical Product Reference · Confidential — Internal Use Only
      </div>
    </div>
  );
}
