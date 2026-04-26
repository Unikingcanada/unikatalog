import { useState, useEffect, useMemo } from "react";
import { UniCatalog, CatalogProduct, ElevatorBucket } from "@/api/entities";

// ─── Constants ────────────────────────────────────────────────────────────────

const SHOW_BRAND = new Set(["Modular Belt", "Elevator Bucket", "4B Electronics"]);
const BRAND_GATED = new Set(["Modular Belt", "Elevator Bucket"]);

const PRODUCT_TYPES = [
  {
    key: "Modular Belt",
    label: "Modular Plastic Belting",
    description: "Straight-running, radius, spiral and side-flexing modular plastic belt systems",
    filters: ["category", "style", "pitch_in", "hinge_style", "materials"],
  },
  {
    key: "Elevator Bucket",
    label: "Elevator Buckets & Hardware",
    description: "Agricultural and industrial elevator buckets, belting, splices and hardware",
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
    description: "Steel hinged slat and plate conveyor belts for chip and scrap handling",
    filters: ["style", "materials"],
  },
  {
    key: "Conveyor Roller",
    label: "Conveyor Rollers",
    description: "Standard, lagging, motorized drive and specialty conveyor rollers",
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

const FILTER_LABELS = {
  category:       "Belt Category",
  style:          "Style / Type",
  pitch_in:       "Pitch",
  materials:      "Material",
  material:       "Material",
  hinge_style:    "Hinge Style",
  duty:           "Duty Rating",
  discharge_type: "Discharge Type",
  application:    "Application",
  profile:        "Profile",
};

// ─── Normalisation ────────────────────────────────────────────────────────────

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
    pitch_in: r.pitch_in ? `${r.pitch_in}"` : "",
    pitch_mm: r.pitch_mm ? `${r.pitch_mm} mm` : "",
    materials: r.materials || "",
    hinge_style: r.hinge_style || "",
    open_area: r.open_area || "",
    application: r.category || "",
    duty: "",
    notes: r.notes || "",
    catalog_url: "",
    tech_doc_url: r.tech_doc_url || "",
    specs: {
      "Belt Category":  r.category || null,
      "Style":          r.style || null,
      "Pitch":          r.pitch_in ? `${r.pitch_in}" (${r.pitch_mm} mm)` : null,
      "Hinge Style":    r.hinge_style || null,
      "Open Area":      r.open_area || null,
      "Min Belt Width": r.min_width_in ? `${r.min_width_in}"` : null,
      "Materials":      r.materials || null,
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
    discharge_type: r.discharge_type && r.discharge_type !== "N/A" ? r.discharge_type : "",
    duty: r.duty || "",
    material: r.material || "",
    materials: r.material || "",
    profile: r.profile && r.profile !== "N/A" ? r.profile : "",
    notes: r.notes || "",
    catalog_url: "",
    tech_doc_url: r.tech_doc_url || "",
    specs: {
      "Brand":            r.vendor || null,
      "Discharge Type":   r.discharge_type && r.discharge_type !== "N/A" ? r.discharge_type : null,
      "Profile":          r.profile && r.profile !== "N/A" ? r.profile : null,
      "Duty":             r.duty || null,
      "Material":         r.material || null,
      "Available Sizes":  r.bucket_sizes || null,
      "Application":      r.application || null,
    },
  };
}

// UniCatalog covers all other product types
// "Modular Plastic Belt" in UniCatalog → mapped to "Modular Belt" key
const UNI_TYPE_REMAP = {
  "Modular Plastic Belt": "Modular Belt",
};

function normalizeUniCatalog(r) {
  const rawType = r.product_type || "General";
  const type = UNI_TYPE_REMAP[rawType] || rawType;
  const specs = parseSpecs(r.key_specs);
  // Strip vendor keys from specs if type is not brand-gated
  const cleanSpecs = Object.fromEntries(
    Object.entries(specs)
      .filter(([k]) => !["suppliers","supplier","vendor","vendors","brand"].includes(k.toLowerCase()))
      .map(([k, v]) => [k.replace(/_/g, " "), v])
  );
  return {
    id: r.id, _source: "unicatalog",
    type,
    brand: SHOW_BRAND.has(type) ? (r.vendor || "") : "",
    series: r.series || "",
    style: r.style || "",
    category: r.style || "",
    application: r.application || "",
    materials: r.materials || "",
    material: r.materials || "",
    duty: r.duty || "",
    notes: [r.features, r.notes].filter(Boolean).join(" "),
    catalog_url: r.catalog_url || "",
    tech_doc_url: r.tech_doc_url || "",
    specs: {
      "Style":       r.style || null,
      "Application": r.application || null,
      "Materials":   r.materials || null,
      "Duty":        r.duty || null,
      ...cleanSpecs,
    },
  };
}

// ─── Filters ──────────────────────────────────────────────────────────────────

function getFilterOptions(products, field) {
  const vals = new Set();
  for (const p of products) {
    const raw = p[field];
    if (!raw) continue;
    String(raw).split(",").map(s => s.trim()).filter(Boolean).forEach(v => vals.add(v));
  }
  return [...vals].sort();
}

function applyFilters(products, activeFilters) {
  return products.filter(p =>
    Object.entries(activeFilters).every(([field, val]) => {
      if (!val) return true;
      return String(p[field] || "").toLowerCase().includes(val.toLowerCase());
    })
  );
}

// ─── Colour palette ───────────────────────────────────────────────────────────

const C = {
  navy:    "#0f2340",
  navyMid: "#1a3a5c",
  navyLt:  "#2d5986",
  slate:   "#334155",
  muted:   "#64748b",
  border:  "#e2e8f0",
  borderHover: "#cbd5e1",
  bg:      "#f8fafc",
  bgCard:  "#ffffff",
  text:    "#0f172a",
};

// ─── Shared UI pieces ─────────────────────────────────────────────────────────

function TopBar() {
  return (
    <div style={{ background: C.navy, height: 56, display: "flex", alignItems: "center", padding: "0 40px", justifyContent: "space-between", flexShrink: 0 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ color: "#fff", fontWeight: 800, fontSize: 15, letterSpacing: "0.5px" }}>UNIKING CANADA</span>
        <span style={{ color: "rgba(255,255,255,0.25)", fontSize: 13 }}>/</span>
        <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 13 }}>Product Catalog</span>
      </div>
      <span style={{ color: "rgba(255,255,255,0.25)", fontSize: 11, letterSpacing: "1px", textTransform: "uppercase" }}>Confidential · Internal Use Only</span>
    </div>
  );
}

function Breadcrumb({ items, onNav }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, marginBottom: 24, flexWrap: "wrap" }}>
      {items.map((item, i) => (
        <span key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}>
          {i > 0 && <span style={{ color: C.border, fontSize: 14 }}>›</span>}
          {i < items.length - 1
            ? <span onClick={() => onNav(i)} style={{ color: C.navyMid, cursor: "pointer", fontWeight: 500 }}>{item}</span>
            : <span style={{ color: C.text, fontWeight: 700 }}>{item}</span>}
        </span>
      ))}
    </div>
  );
}

// ─── Type grid (home screen) ──────────────────────────────────────────────────

function TypeGrid({ types, counts, onSelect }) {
  const [hovered, setHovered] = useState(null);
  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: C.text, margin: "0 0 6px" }}>Product Lines</h1>
        <p style={{ margin: 0, color: C.muted, fontSize: 13 }}>
          Select a product category to browse technical specifications and documentation.
        </p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(276px, 1fr))", gap: 14 }}>
        {types.map(t => {
          const isHov = hovered === t.key;
          return (
            <div
              key={t.key}
              onClick={() => onSelect(t.key)}
              onMouseEnter={() => setHovered(t.key)}
              onMouseLeave={() => setHovered(null)}
              style={{
                background: isHov ? C.navyMid : C.bgCard,
                border: `1px solid ${isHov ? C.navyMid : C.border}`,
                borderRadius: 8, padding: "18px 20px", cursor: "pointer",
                transition: "background 0.13s, border-color 0.13s",
                display: "flex", flexDirection: "column", gap: 6,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: isHov ? "#fff" : C.text, lineHeight: 1.3 }}>{t.label}</div>
                <div style={{ fontSize: 11, fontWeight: 600, color: isHov ? "rgba(255,255,255,0.5)" : C.muted, background: isHov ? "rgba(255,255,255,0.1)" : C.bg, borderRadius: 10, padding: "2px 8px", marginLeft: 8, flexShrink: 0 }}>
                  {counts[t.key] || 0}
                </div>
              </div>
              <div style={{ fontSize: 12, color: isHov ? "rgba(255,255,255,0.6)" : C.muted, lineHeight: 1.6 }}>{t.description}</div>
              <div style={{ marginTop: 6, fontSize: 11, fontWeight: 600, letterSpacing: "0.5px", color: isHov ? "rgba(255,255,255,0.45)" : C.navyLt }}>
                VIEW PRODUCTS ›
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Brand grid ───────────────────────────────────────────────────────────────

function BrandGrid({ products, typeDef, onSelect }) {
  const brands = useMemo(() => {
    const map = {};
    for (const p of products) {
      if (!p.brand) continue;
      map[p.brand] = (map[p.brand] || 0) + 1;
    }
    return Object.entries(map).sort((a, b) => a[0].localeCompare(b[0]));
  }, [products]);

  const [hovered, setHovered] = useState(null);

  return (
    <div>
      <div style={{ marginBottom: 26 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: C.text, margin: "0 0 4px" }}>Select Manufacturer</h2>
        <p style={{ margin: 0, color: C.muted, fontSize: 13 }}>{typeDef?.description}</p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 12 }}>
        {brands.map(([brand, count]) => {
          const isHov = hovered === brand;
          return (
            <div
              key={brand}
              onClick={() => onSelect(brand)}
              onMouseEnter={() => setHovered(brand)}
              onMouseLeave={() => setHovered(null)}
              style={{
                background: isHov ? C.navyMid : C.bgCard,
                border: `1px solid ${isHov ? C.navyMid : C.border}`,
                borderRadius: 8, padding: "18px 20px", cursor: "pointer",
                transition: "background 0.13s, border-color 0.13s",
              }}
            >
              <div style={{ fontSize: 15, fontWeight: 700, color: isHov ? "#fff" : C.text, marginBottom: 4 }}>{brand}</div>
              <div style={{ fontSize: 12, color: isHov ? "rgba(255,255,255,0.55)" : C.muted, marginBottom: 14 }}>
                {count} product{count !== 1 ? "s" : ""}
              </div>
              <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.5px", color: isHov ? "rgba(255,255,255,0.45)" : C.navyLt }}>VIEW RANGE ›</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Filter bar ───────────────────────────────────────────────────────────────

function FilterBar({ typeKey, allProducts, activeFilters, onChange }) {
  const fields = TYPE_MAP[typeKey]?.filters || [];
  const hasActive = Object.values(activeFilters).some(Boolean);

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 14, alignItems: "flex-end", marginBottom: 22 }}>
      {fields.map(field => {
        const options = getFilterOptions(allProducts, field);
        if (options.length < 2) return null;
        const label = FILTER_LABELS[field] || field;
        const active = activeFilters[field] || "";
        return (
          <div key={field}>
            <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.8px", color: C.muted, marginBottom: 4 }}>{label}</div>
            <select
              value={active}
              onChange={e => onChange(field, e.target.value)}
              style={{
                padding: "7px 10px", border: `1px solid ${active ? C.navyMid : C.border}`,
                borderRadius: 5, fontSize: 12, color: active ? C.navyMid : C.slate,
                fontWeight: active ? 600 : 400, background: active ? "#eef3f8" : "#fff",
                cursor: "pointer", outline: "none", minWidth: 150,
              }}
            >
              <option value="">All</option>
              {options.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
        );
      })}
      {hasActive && (
        <button
          onClick={() => onChange("__clear__", null)}
          style={{ padding: "7px 14px", background: "none", border: `1px solid ${C.border}`, borderRadius: 5, fontSize: 12, color: C.muted, cursor: "pointer", alignSelf: "flex-end" }}
        >
          Clear All
        </button>
      )}
    </div>
  );
}

// ─── Spec table ───────────────────────────────────────────────────────────────

function SpecTable({ specs }) {
  const entries = Object.entries(specs).filter(([, v]) => v != null && v !== "" && v !== "N/A" && String(v) !== "undefined");
  if (!entries.length) return <div style={{ color: C.muted, fontSize: 13 }}>No specifications available.</div>;
  return (
    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
      <tbody>
        {entries.map(([k, v], i) => (
          <tr key={k} style={{ background: i % 2 ? "#f8fafc" : "#fff" }}>
            <td style={{ padding: "8px 12px", color: C.muted, fontWeight: 600, width: "40%", verticalAlign: "top", borderBottom: `1px solid ${C.border}` }}>{k}</td>
            <td style={{ padding: "8px 12px", color: C.text, borderBottom: `1px solid ${C.border}`, lineHeight: 1.5 }}>{String(v)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// ─── Product modal ────────────────────────────────────────────────────────────

function ProductModal({ product, showBrand, onClose }) {
  if (!product) return null;
  const typeDef = TYPE_MAP[product.type];

  return (
    <div
      onClick={onClose}
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{ background: "#fff", borderRadius: 10, width: "100%", maxWidth: 660, maxHeight: "90vh", display: "flex", flexDirection: "column", boxShadow: "0 24px 64px rgba(0,0,0,0.22)" }}
      >
        {/* Header */}
        <div style={{ background: C.navyMid, padding: "22px 28px", borderRadius: "10px 10px 0 0", flexShrink: 0 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "1.5px", color: "rgba(255,255,255,0.4)", marginBottom: 5 }}>
                {typeDef?.label || product.type}{showBrand && product.brand ? ` · ${product.brand}` : ""}
              </div>
              <div style={{ fontSize: 19, fontWeight: 800, color: "#fff", lineHeight: 1.25 }}>{product.series}</div>
              {product.style && product.style !== product.series && (
                <div style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", marginTop: 3 }}>{product.style}</div>
              )}
            </div>
            <button onClick={onClose} style={{ background: "rgba(255,255,255,0.12)", border: "none", color: "#fff", width: 30, height: 30, borderRadius: 6, cursor: "pointer", fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: "22px 28px", overflowY: "auto" }}>

          {product.application && product.application !== product.category && (
            <div style={{ marginBottom: 18 }}>
              <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", color: C.muted, marginBottom: 5 }}>Application</div>
              <div style={{ fontSize: 13, color: C.slate, lineHeight: 1.7 }}>{product.application}</div>
            </div>
          )}

          <div style={{ marginBottom: 18 }}>
            <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", color: C.muted, marginBottom: 6 }}>Specifications</div>
            <div style={{ border: `1px solid ${C.border}`, borderRadius: 6, overflow: "hidden" }}>
              <SpecTable specs={product.specs} />
            </div>
          </div>

          {product.notes && (
            <div style={{ marginBottom: 18 }}>
              <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", color: C.muted, marginBottom: 5 }}>Notes</div>
              <div style={{ fontSize: 13, color: C.slate, lineHeight: 1.75, background: C.bg, padding: "12px 14px", borderRadius: 6 }}>{product.notes}</div>
            </div>
          )}

          {(product.catalog_url || product.tech_doc_url) && (
            <div style={{ display: "flex", gap: 10 }}>
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

// ─── Product card ─────────────────────────────────────────────────────────────

function ProductCard({ product, showBrand, onClick }) {
  const [hovered, setHovered] = useState(false);
  const topSpecs = Object.entries(product.specs)
    .filter(([, v]) => v != null && v !== "" && v !== "N/A" && String(v) !== "undefined")
    .slice(0, 4);

  return (
    <div
      onClick={() => onClick(product)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: C.bgCard, borderRadius: 8, cursor: "pointer",
        border: `1px solid ${hovered ? C.navyMid : C.border}`,
        boxShadow: hovered ? "0 4px 16px rgba(26,58,92,0.09)" : "none",
        transition: "border-color 0.13s, box-shadow 0.13s",
        display: "flex", flexDirection: "column", overflow: "hidden",
      }}
    >
      <div style={{ height: 3, background: C.navyMid, flexShrink: 0 }} />

      <div style={{ padding: "14px 16px", flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
        {showBrand && product.brand && (
          <span style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.8px", color: C.navyMid, background: "#eef3f8", padding: "2px 7px", borderRadius: 3, alignSelf: "flex-start" }}>
            {product.brand}
          </span>
        )}
        <div style={{ fontSize: 14, fontWeight: 700, color: C.text, lineHeight: 1.3 }}>{product.series}</div>
        {product.style && product.style !== product.series && (
          <div style={{ fontSize: 12, color: C.muted }}>{product.style}</div>
        )}
        {topSpecs.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginTop: 6 }}>
            {topSpecs.map(([k, v]) => (
              <div key={k} style={{ fontSize: 11, background: C.bg, border: `1px solid ${C.border}`, borderRadius: 3, padding: "2px 7px", color: C.slate }}>
                <span style={{ color: C.muted }}>{k}: </span>
                {String(v).length > 22 ? String(v).slice(0, 22) + "…" : String(v)}
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ borderTop: `1px solid ${C.bg}`, padding: "8px 16px", background: hovered ? "#f1f5f9" : C.bgCard, transition: "background 0.13s" }}>
        <span style={{ fontSize: 11, fontWeight: 600, color: C.navyMid }}>View Specifications ›</span>
      </div>
    </div>
  );
}

// ─── Product list (with search + filters) ────────────────────────────────────

function ProductList({ typeKey, brand, products: allProducts, showBrand }) {
  const [activeFilters, setActiveFilters] = useState({});
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);

  const filtered = useMemo(() => {
    let list = allProducts;
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(p =>
        [p.series, p.style, p.notes, p.materials, p.material, p.application, p.category]
          .some(f => (f || "").toLowerCase().includes(q))
      );
    }
    return applyFilters(list, activeFilters);
  }, [allProducts, search, activeFilters]);

  function handleFilter(field, val) {
    if (field === "__clear__") { setActiveFilters({}); return; }
    setActiveFilters(prev => ({ ...prev, [field]: val }));
  }

  const typeDef = TYPE_MAP[typeKey];

  return (
    <div>
      {/* Header row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20, gap: 16, flexWrap: "wrap" }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: C.text, margin: "0 0 3px" }}>
            {brand ? `${brand} — ${typeDef?.label || typeKey}` : typeDef?.label || typeKey}
          </h2>
          <div style={{ fontSize: 12, color: C.muted }}>
            {filtered.length} of {allProducts.length} products
          </div>
        </div>
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search series, material, application..."
          style={{ padding: "8px 14px", border: `1px solid ${C.border}`, borderRadius: 6, fontSize: 13, outline: "none", color: C.text, minWidth: 280 }}
        />
      </div>

      <FilterBar typeKey={typeKey} allProducts={allProducts} activeFilters={activeFilters} onChange={handleFilter} />

      {filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 0", color: C.muted, fontSize: 14 }}>No products match the selected filters.</div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(286px, 1fr))", gap: 14 }}>
          {filtered.map(p => (
            <ProductCard key={p.id} product={p} showBrand={showBrand} onClick={setSelected} />
          ))}
        </div>
      )}

      {selected && <ProductModal product={selected} showBrand={showBrand} onClose={() => setSelected(null)} />}
    </div>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────

export default function Home() {
  const [allData, setAllData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("home");
  const [selectedType, setSelectedType] = useState(null);
  const [selectedBrand, setSelectedBrand] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const [cat, elev, uni] = await Promise.all([
          CatalogProduct.list(),
          ElevatorBucket.list(),
          UniCatalog.list(),
        ]);
        setAllData([
          ...cat.map(normalizeCatalogProduct),
          ...elev.map(normalizeElevatorBucket),
          ...uni.map(normalizeUniCatalog),
        ]);
      } catch (e) {
        console.error("Catalog load error:", e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // Count per type
  const typeCounts = useMemo(() => {
    const c = {};
    for (const p of allData) c[p.type] = (c[p.type] || 0) + 1;
    return c;
  }, [allData]);

  // Available types that actually have data
  const availableTypes = useMemo(() =>
    PRODUCT_TYPES.filter(t => (typeCounts[t.key] || 0) > 0),
    [typeCounts]
  );

  const typeProducts = useMemo(() =>
    allData.filter(p => p.type === selectedType),
    [allData, selectedType]
  );

  const viewProducts = useMemo(() =>
    selectedBrand ? typeProducts.filter(p => p.brand === selectedBrand) : typeProducts,
    [typeProducts, selectedBrand]
  );

  const isBrandGated = selectedType && BRAND_GATED.has(selectedType);
  const showBrand = selectedType && SHOW_BRAND.has(selectedType) && !selectedBrand;

  function selectType(typeKey) {
    setSelectedType(typeKey);
    setSelectedBrand(null);
    setView(BRAND_GATED.has(typeKey) ? "brands" : "products");
  }

  function selectBrand(brand) {
    setSelectedBrand(brand);
    setView("products");
  }

  function navTo(level) {
    if (level === 0) { setView("home"); setSelectedType(null); setSelectedBrand(null); }
    else if (level === 1 && isBrandGated) { setView("brands"); setSelectedBrand(null); }
  }

  const breadcrumbs = ["All Products"];
  if (selectedType) breadcrumbs.push(TYPE_MAP[selectedType]?.label || selectedType);
  if (selectedBrand) breadcrumbs.push(selectedBrand);

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "'Inter','Segoe UI',Arial,sans-serif", display: "flex", flexDirection: "column" }}>
      <TopBar />

      <div style={{ flex: 1, maxWidth: 1280, width: "100%", margin: "0 auto", padding: "32px 40px", boxSizing: "border-box" }}>

        {view !== "home" && <Breadcrumb items={breadcrumbs} onNav={navTo} />}

        {loading ? (
          <div style={{ textAlign: "center", padding: 80, color: C.muted, fontSize: 14 }}>Loading catalog...</div>
        ) : view === "home" ? (
          <TypeGrid types={availableTypes} counts={typeCounts} onSelect={selectType} />
        ) : view === "brands" ? (
          <BrandGrid products={typeProducts} typeDef={TYPE_MAP[selectedType]} onSelect={selectBrand} />
        ) : (
          <ProductList
            typeKey={selectedType}
            brand={selectedBrand}
            products={viewProducts}
            showBrand={showBrand}
          />
        )}
      </div>

      <div style={{ borderTop: `1px solid ${C.border}`, padding: "14px 40px", textAlign: "center", fontSize: 11, color: "#cbd5e1" }}>
        Uniking Canada · Technical Product Reference · Confidential — Internal Use Only
      </div>
    </div>
  );
}
