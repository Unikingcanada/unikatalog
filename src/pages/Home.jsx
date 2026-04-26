import { useState, useEffect, useMemo } from "react";
import { UniCatalog, CatalogProduct, ElevatorBucket } from "@/api/entities";

const SHOW_BRAND = new Set(["Modular Belt", "Elevator Bucket", "4B Electronics"]);
const BRAND_GATED = new Set(["Modular Belt", "Elevator Bucket"]);

const PRODUCT_TYPES = [
  { key: "Modular Belt", label: "Modular Plastic Belting", description: "Straight-running, radius, spiral and side-flexing modular plastic belt systems", filters: ["category", "style", "pitch_in", "hinge_style", "materials"] },
  { key: "Elevator Bucket", label: "Elevator Buckets & Hardware", description: "Agricultural and industrial elevator buckets, belting, splices and hardware", filters: ["application", "discharge_type", "duty", "material", "profile"] },
  { key: "Table Top Chain", label: "Table Top Chain", description: "Straight-running and side-flexing table top chains in steel and plastic", filters: ["style", "materials", "duty"] },
  { key: "ANSI/BS Chain", label: "ANSI / British Standard Chain", description: "Standard precision roller chains to ANSI and BS specifications", filters: ["style", "materials", "duty"] },
  { key: "Engineered Chain", label: "Engineered Chain", description: "Heavy-duty engineered steel chains for demanding industrial applications", filters: ["style", "materials", "duty"] },
  { key: "Cast Chain", label: "Cast Chain", description: "Malleable and ductile cast iron conveyor chains", filters: ["style", "materials"] },
  { key: "Welded Steel Chain", label: "Welded Steel Chain", description: "Welded steel drag and conveyor chains for bulk material handling", filters: ["style", "duty"] },
  { key: "Forged Chain", label: "Forged Chain", description: "Forged steel chains for high-load and abrasive environments", filters: ["style", "materials", "duty"] },
  { key: "Overhead Chain", label: "Overhead Conveyor Chain", description: "Overhead conveyor and power-and-free chain systems", filters: ["style", "materials"] },
  { key: "Sharptop Chain", label: "Sharp Top Chain", description: "Sharp top and spike top chains for agricultural and forestry applications", filters: ["style", "materials"] },
  { key: "Kiln Chain", label: "Kiln Chain", description: "High-temperature kiln and dryer chains for cement and mineral processing", filters: ["style", "materials"] },
  { key: "Thermoforming Chain", label: "Thermoforming Chain", description: "Precision chains for plastic thermoforming and packaging machinery", filters: ["style", "materials"] },
  { key: "Wire Mesh Belt", label: "Wire Mesh Belt", description: "Stainless and carbon steel wire mesh conveyor belts for food and industrial processing", filters: ["style", "materials", "duty"] },
  { key: "Steel Hinged Belt", label: "Steel Hinged Belt", description: "Steel hinged slat and plate conveyor belts for chip and scrap handling", filters: ["style", "materials"] },
  { key: "Conveyor Roller", label: "Conveyor Rollers", description: "Standard, lagging, motorized drive and specialty conveyor rollers", filters: ["style", "duty"] },
  { key: "Monitoring System", label: "4B Electronics & Monitoring", description: "Bucket elevator and conveyor safety monitoring systems and sensors", filters: ["style"] },
  { key: "Magnetic Conveyor", label: "Magnetic Conveyor", description: "Magnetic conveyor systems for ferrous material handling", filters: ["style"] },
];

const TYPE_MAP = Object.fromEntries(PRODUCT_TYPES.map(t => [t.key, t]));

const FILTER_LABELS = {
  category: "Belt Category", style: "Style / Type", pitch_in: "Pitch",
  materials: "Material", material: "Material", hinge_style: "Hinge Style",
  duty: "Duty Rating", discharge_type: "Discharge Type", application: "Application", profile: "Profile",
};

const C = {
  navy: "#0f2340", navyMid: "#1a3a5c", navyLt: "#2d5986",
  slate: "#334155", muted: "#64748b", border: "#e2e8f0",
  bg: "#f8fafc", bgCard: "#ffffff", text: "#0f172a",
};

function parseSpecs(raw) {
  if (!raw) return {};
  if (typeof raw === "object") return raw;
  try { return JSON.parse(raw); } catch (e) { return {}; }
}

function normalizeCatalogProduct(r) {
  return {
    id: r.id, _source: "catalogproduct",
    type: "Modular Belt",
    brand: r.vendor || "Intralox",
    series: r.series || "",
    style: r.style || "",
    category: r.category || "",
    pitch_in: r.pitch_in ? r.pitch_in + '"' : "",
    pitch_mm: r.pitch_mm ? r.pitch_mm + " mm" : "",
    materials: r.materials || "",
    hinge_style: r.hinge_style || "",
    open_area: r.open_area || "",
    application: r.category || "",
    duty: "",
    notes: r.notes || "",
    catalog_url: "",
    tech_doc_url: r.tech_doc_url || "",
    image_url: r.image_url || "",
    belt_data: r.belt_data || null,
    specs: {
      "Belt Category": r.category || null,
      "Style": r.style || null,
      "Pitch": r.pitch_in ? r.pitch_in + '" (' + r.pitch_mm + ' mm)' : null,
      "Hinge Style": r.hinge_style || null,
      "Open Area": r.open_area || null,
      "Min Belt Width": r.min_width_in ? r.min_width_in + '"' : null,
      "Materials": r.materials || null,
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
    image_url: r.image_url || "",
    belt_data: null,
    specs: {
      "Brand": r.vendor || null,
      "Discharge Type": r.discharge_type && r.discharge_type !== "N/A" ? r.discharge_type : null,
      "Profile": r.profile && r.profile !== "N/A" ? r.profile : null,
      "Duty": r.duty || null,
      "Material": r.material || null,
      "Available Sizes": r.bucket_sizes || null,
      "Application": r.application || null,
    },
  };
}

const UNI_TYPE_REMAP = { "Modular Plastic Belt": "Modular Belt" };

function normalizeUniCatalog(r) {
  const rawType = r.product_type || "General";
  const type = UNI_TYPE_REMAP[rawType] || rawType;
  const specs = parseSpecs(r.key_specs);
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
    image_url: r.image_url || "",
    belt_data: null,
    specs: {
      "Style": r.style || null,
      "Application": r.application || null,
      "Materials": r.materials || null,
      "Duty": r.duty || null,
      ...cleanSpecs,
    },
  };
}

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
            ? <span onClick={() => onNav(i)} style={{ color: C.navyMid, cursor: "pointer", fontWeight: 600 }}>{item}</span>
            : <span style={{ color: C.muted, fontWeight: 400 }}>{item}</span>
          }
        </span>
      ))}
    </div>
  );
}

function TypeGrid({ types, counts, onSelect }) {
  const [hovered, setHovered] = useState(null);
  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 22, fontWeight: 800, color: C.text, marginBottom: 4 }}>Product Catalog</div>
        <div style={{ fontSize: 14, color: C.muted }}>Select a product category to browse specifications</div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 14 }}>
        {types.map(t => (
          <div
            key={t.key}
            onClick={() => onSelect(t.key)}
            onMouseEnter={() => setHovered(t.key)}
            onMouseLeave={() => setHovered(null)}
            style={{
              background: hovered === t.key ? C.navyMid : C.bgCard,
              border: "1px solid " + (hovered === t.key ? C.navyMid : C.border),
              borderRadius: 8, padding: "18px 20px", cursor: "pointer",
              transition: "all 0.15s", display: "flex", flexDirection: "column", gap: 6,
            }}
          >
            <div style={{ fontSize: 14, fontWeight: 700, color: hovered === t.key ? "#fff" : C.text }}>{t.label}</div>
            <div style={{ fontSize: 12, color: hovered === t.key ? "rgba(255,255,255,0.65)" : C.muted, lineHeight: 1.5 }}>{t.description}</div>
            <div style={{ fontSize: 11, color: hovered === t.key ? "rgba(255,255,255,0.45)" : C.muted, marginTop: 4 }}>
              {counts[t.key] || 0} products
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function BrandGrid({ products, typeDef, onSelect }) {
  const brands = useMemo(() => {
    const s = new Set(products.map(p => p.brand).filter(Boolean));
    return [...s].sort();
  }, [products]);
  const [hovered, setHovered] = useState(null);
  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 20, fontWeight: 800, color: C.text, marginBottom: 4 }}>{typeDef?.label}</div>
        <div style={{ fontSize: 13, color: C.muted }}>Select a brand to browse products</div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12 }}>
        {brands.map(b => (
          <div
            key={b}
            onClick={() => onSelect(b)}
            onMouseEnter={() => setHovered(b)}
            onMouseLeave={() => setHovered(null)}
            style={{
              background: hovered === b ? C.navyMid : C.bgCard,
              border: "1px solid " + (hovered === b ? C.navyMid : C.border),
              borderRadius: 8, padding: "20px 22px", cursor: "pointer",
              transition: "all 0.15s", textAlign: "center",
            }}
          >
            <div style={{ fontSize: 16, fontWeight: 700, color: hovered === b ? "#fff" : C.text, marginBottom: 4 }}>{b}</div>
            <div style={{ fontSize: 12, color: hovered === b ? "rgba(255,255,255,0.5)" : C.muted }}>
              {products.filter(p => p.brand === b).length} products
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

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
            <select value={active} onChange={e => onChange(field, e.target.value)}
              style={{ padding: "7px 10px", border: "1px solid " + (active ? C.navyMid : C.border), borderRadius: 5, fontSize: 12, color: active ? C.navyMid : C.slate, fontWeight: active ? 600 : 400, background: active ? "#eef3f8" : "#fff", cursor: "pointer", outline: "none", minWidth: 150 }}>
              <option value="">All</option>
              {options.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
        );
      })}
      {hasActive && (
        <button onClick={() => onChange("__clear__", null)}
          style={{ padding: "7px 14px", background: "none", border: "1px solid " + C.border, borderRadius: 5, fontSize: 12, color: C.muted, cursor: "pointer", alignSelf: "flex-end" }}>
          Clear All
        </button>
      )}
    </div>
  );
}

function SpecTable({ specs }) {
  const entries = Object.entries(specs).filter(([, v]) => v != null && v !== "" && v !== "N/A" && String(v) !== "undefined");
  if (!entries.length) return <div style={{ color: C.muted, fontSize: 13 }}>No specifications available.</div>;
  return (
    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
      <tbody>
        {entries.map(([k, v], i) => (
          <tr key={k} style={{ background: i % 2 ? "#f8fafc" : "#fff" }}>
            <td style={{ padding: "8px 12px", color: C.muted, fontWeight: 600, width: "40%", verticalAlign: "top", borderBottom: "1px solid " + C.border }}>{k}</td>
            <td style={{ padding: "8px 12px", color: C.text, borderBottom: "1px solid " + C.border, lineHeight: 1.5 }}>{String(v)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function BeltDataTable({ data }) {
  if (!data) return null;
  let rows;
  try { rows = typeof data === "string" ? JSON.parse(data) : data; } catch (e) { return null; }
  if (!Array.isArray(rows) || !rows.length) return null;
  const keys = ["material","strength_lbf","strength_nm","temp_min_f","temp_max_f","mass_lbft2","mass_kgm2"];
  const labels = { material:"Material", strength_lbf:"Strength (lbf)", strength_nm:"Strength (N/m)", temp_min_f:"Min °F", temp_max_f:"Max °F", mass_lbft2:"lb/ft²", mass_kgm2:"kg/m²" };
  const cols = keys.filter(k => rows.some(r => r[k] != null && r[k] !== ""));
  return (
    <div style={{ overflowX: "auto", borderRadius: 6, border: "1px solid " + C.border }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
        <thead>
          <tr style={{ background: C.navyMid }}>
            {cols.map(k => <th key={k} style={{ padding: "8px 10px", color: "#fff", fontWeight: 700, textAlign: "left", whiteSpace: "nowrap" }}>{labels[k]}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} style={{ background: i % 2 === 0 ? "#f8fafc" : "#fff", borderBottom: "1px solid " + C.border }}>
              {cols.map(k => (
                <td key={k} style={{ padding: "7px 10px", color: k === "material" ? C.navyMid : C.text, fontWeight: k === "material" ? 700 : 400, whiteSpace: "nowrap" }}>
                  {row[k] != null ? String(row[k]) : "—"}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ProductModal({ product, showBrand, onClose }) {
  const [tab, setTab] = useState("specs");
  if (!product) return null;
  const typeDef = TYPE_MAP[product.type];

  let beltRows = [];
  if (product.belt_data) {
    try {
      const p = typeof product.belt_data === "string" ? JSON.parse(product.belt_data) : product.belt_data;
      if (Array.isArray(p)) beltRows = p;
    } catch (e) {}
  }
  const hasBelt = beltRows.length > 0;

  const tabs = [
    ["specs", "Specifications"],
    hasBelt ? ["belt", "Belt Data"] : null,
    (product.catalog_url || product.tech_doc_url) ? ["docs", "Documents"] : null,
  ].filter(Boolean);

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div onClick={e => e.stopPropagation()} style={{ background: "#fff", borderRadius: 10, width: "100%", maxWidth: 680, maxHeight: "90vh", display: "flex", flexDirection: "column", boxShadow: "0 24px 64px rgba(0,0,0,0.22)" }}>

        {/* Header */}
        <div style={{ background: C.navyMid, padding: "20px 26px", borderRadius: "10px 10px 0 0", flexShrink: 0 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div style={{ display: "flex", gap: 16, alignItems: "flex-start", flex: 1 }}>
              {product.image_url ? (
                <div style={{ background: "rgba(255,255,255,0.1)", borderRadius: 8, padding: 6, flexShrink: 0, width: 100, height: 76, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <img src={product.image_url} alt="" style={{ maxWidth: 90, maxHeight: 68, objectFit: "contain" }} onError={e => { e.target.parentElement.style.display = "none"; }} />
                </div>
              ) : null}
              <div>
                <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "1.5px", color: "rgba(255,255,255,0.4)", marginBottom: 5 }}>
                  {typeDef?.label || product.type}{showBrand && product.brand ? " · " + product.brand : ""}
                </div>
                <div style={{ fontSize: 19, fontWeight: 800, color: "#fff", lineHeight: 1.25 }}>{product.series}</div>
                {product.style && product.style !== product.series ? (
                  <div style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", marginTop: 3 }}>{product.style}</div>
                ) : null}
                <div style={{ display: "flex", gap: 6, marginTop: 8, flexWrap: "wrap" }}>
                  {product.pitch_in ? <span style={{ background: "rgba(255,255,255,.15)", color: "#fff", padding: "2px 8px", borderRadius: 99, fontSize: 10, fontWeight: 700 }}>{product.pitch_in}</span> : null}
                  {product.hinge_style ? <span style={{ background: "rgba(255,255,255,.15)", color: "#fff", padding: "2px 8px", borderRadius: 99, fontSize: 10, fontWeight: 700 }}>{product.hinge_style}</span> : null}
                  {product.open_area ? <span style={{ background: "rgba(255,255,255,.15)", color: "#fff", padding: "2px 8px", borderRadius: 99, fontSize: 10, fontWeight: 700 }}>{product.open_area} open</span> : null}
                </div>
              </div>
            </div>
            <button onClick={onClose} style={{ background: "rgba(255,255,255,0.12)", border: "none", color: "#fff", width: 30, height: 30, borderRadius: 6, cursor: "pointer", fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>×</button>
          </div>
        </div>

        {/* Tabs */}
        {tabs.length > 1 ? (
          <div style={{ display: "flex", borderBottom: "2px solid " + C.border, padding: "0 26px" }}>
            {tabs.map(([id, label]) => (
              <button key={id} onClick={() => setTab(id)} style={{ padding: "10px 14px", border: "none", background: "none", cursor: "pointer", fontSize: 12, fontWeight: 700, color: tab === id ? C.navyMid : C.muted, borderBottom: tab === id ? "2px solid " + C.navyMid : "2px solid transparent", marginBottom: -2 }}>
                {label}
              </button>
            ))}
          </div>
        ) : null}

        {/* Body */}
        <div style={{ padding: "20px 26px 24px", overflowY: "auto" }}>

          {tab === "specs" && (
            <div>
              {product.notes ? (
                <div style={{ marginBottom: 16, fontSize: 13, color: C.slate, lineHeight: 1.75, background: C.bg, padding: "12px 14px", borderRadius: 6, borderLeft: "3px solid " + C.navyMid }}>
                  {product.notes}
                </div>
              ) : null}
              <div style={{ border: "1px solid " + C.border, borderRadius: 6, overflow: "hidden" }}>
                <SpecTable specs={product.specs} />
              </div>
            </div>
          )}

          {tab === "belt" && (
            <div>
              <p style={{ fontSize: 12, color: C.muted, marginBottom: 12 }}>Mechanical properties per material option. Strength ratings are per metre of belt width.</p>
              <BeltDataTable data={product.belt_data} />
            </div>
          )}

          {tab === "docs" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {product.catalog_url ? (
                <a href={product.catalog_url} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: 10, padding: "11px 14px", background: C.bg, borderRadius: 8, border: "1px solid " + C.border, color: C.navyMid, fontWeight: 700, fontSize: 13, textDecoration: "none" }}>
                  📄 View Catalog PDF
                </a>
              ) : null}
              {product.tech_doc_url ? (
                <a href={product.tech_doc_url} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: 10, padding: "11px 14px", background: C.bg, borderRadius: 8, border: "1px solid " + C.border, color: C.navyMid, fontWeight: 700, fontSize: 13, textDecoration: "none" }}>
                  📐 Technical Documentation
                </a>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ProductCard({ product, showBrand, onClick }) {
  const [hovered, setHovered] = useState(false);
  const topSpecs = Object.entries(product.specs)
    .filter(([, v]) => v != null && v !== "" && v !== "N/A" && String(v) !== "undefined")
    .slice(0, 3);

  return (
    <div onClick={() => onClick(product)} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      style={{ background: C.bgCard, borderRadius: 8, cursor: "pointer", border: "1px solid " + (hovered ? C.navyMid : C.border), boxShadow: hovered ? "0 4px 16px rgba(26,58,92,0.09)" : "none", transition: "border-color 0.13s, box-shadow 0.13s", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <div style={{ height: 3, background: C.navyMid, flexShrink: 0 }} />

      {product.image_url ? (
        <div style={{ background: "#f8fafc", borderBottom: "1px solid #f1f5f9", height: 110, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
          <img src={product.image_url} alt="" style={{ maxHeight: 98, maxWidth: "86%", objectFit: "contain" }} onError={e => { e.target.parentElement.style.display = "none"; }} />
        </div>
      ) : null}

      <div style={{ padding: "13px 15px", flex: 1, display: "flex", flexDirection: "column", gap: 5 }}>
        {showBrand && product.brand ? (
          <span style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.8px", color: C.navyMid, background: "#eef3f8", padding: "2px 7px", borderRadius: 3, alignSelf: "flex-start" }}>
            {product.brand}
          </span>
        ) : null}
        <div style={{ fontSize: 14, fontWeight: 700, color: C.text, lineHeight: 1.3 }}>{product.series}</div>
        {product.style && product.style !== product.series ? (
          <div style={{ fontSize: 12, color: C.muted }}>{product.style}</div>
        ) : null}
        {topSpecs.length > 0 ? (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginTop: 4 }}>
            {topSpecs.map(([k, v]) => (
              <div key={k} style={{ fontSize: 11, background: C.bg, border: "1px solid " + C.border, borderRadius: 3, padding: "2px 7px", color: C.slate }}>
                <span style={{ color: C.muted }}>{k}: </span>
                {String(v).length > 20 ? String(v).slice(0, 20) + "…" : String(v)}
              </div>
            ))}
          </div>
        ) : null}
      </div>

      <div style={{ borderTop: "1px solid " + C.bg, padding: "8px 15px", background: hovered ? "#f1f5f9" : C.bgCard, transition: "background 0.13s" }}>
        <span style={{ fontSize: 11, fontWeight: 600, color: C.navyMid }}>View Specifications ›</span>
      </div>
    </div>
  );
}

function ProductList({ typeKey, brand, products: allProducts, showBrand }) {
  const [activeFilters, setActiveFilters] = useState({});
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);

  const filtered = useMemo(() => {
    let list = applyFilters(allProducts, activeFilters);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(p => [p.series, p.style, p.category, p.notes, p.materials, p.application].some(f => f && f.toLowerCase().includes(q)));
    }
    return list.sort((a, b) => {
      const na = parseFloat((a.series || "").replace(/[^\d.]/g, "")) || 0;
      const nb = parseFloat((b.series || "").replace(/[^\d.]/g, "")) || 0;
      if (na !== nb) return na - nb;
      return (a.style || "").localeCompare(b.style || "");
    });
  }, [allProducts, activeFilters, search]);

  function handleFilter(field, val) {
    if (field === "__clear__") { setActiveFilters({}); return; }
    setActiveFilters(prev => ({ ...prev, [field]: val }));
  }

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, flexWrap: "wrap", gap: 10 }}>
        <div>
          <div style={{ fontSize: 19, fontWeight: 800, color: C.text }}>{TYPE_MAP[typeKey]?.label || typeKey}{brand ? " — " + brand : ""}</div>
          <div style={{ fontSize: 13, color: C.muted, marginTop: 2 }}>{filtered.length} product{filtered.length !== 1 ? "s" : ""}</div>
        </div>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..."
          style={{ padding: "8px 13px", border: "1px solid " + C.border, borderRadius: 6, fontSize: 13, outline: "none", width: 220 }} />
      </div>

      <FilterBar typeKey={typeKey} allProducts={allProducts} activeFilters={activeFilters} onChange={handleFilter} />

      {filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: 60, color: C.muted, fontSize: 14 }}>No products match your filters.</div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 14 }}>
          {filtered.map(p => <ProductCard key={p.id} product={p} showBrand={showBrand} onClick={setSelected} />)}
        </div>
      )}

      {selected ? <ProductModal product={selected} showBrand={showBrand} onClose={() => setSelected(null)} /> : null}
    </div>
  );
}

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

  const typeCounts = useMemo(() => {
    const c = {};
    for (const p of allData) c[p.type] = (c[p.type] || 0) + 1;
    return c;
  }, [allData]);

  const availableTypes = useMemo(() => PRODUCT_TYPES.filter(t => (typeCounts[t.key] || 0) > 0), [typeCounts]);
  const typeProducts = useMemo(() => allData.filter(p => p.type === selectedType), [allData, selectedType]);
  const viewProducts = useMemo(() => selectedBrand ? typeProducts.filter(p => p.brand === selectedBrand) : typeProducts, [typeProducts, selectedBrand]);

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
        {view !== "home" ? <Breadcrumb items={breadcrumbs} onNav={navTo} /> : null}
        {loading ? (
          <div style={{ textAlign: "center", padding: 80, color: C.muted, fontSize: 14 }}>Loading catalog...</div>
        ) : view === "home" ? (
          <TypeGrid types={availableTypes} counts={typeCounts} onSelect={selectType} />
        ) : view === "brands" ? (
          <BrandGrid products={typeProducts} typeDef={TYPE_MAP[selectedType]} onSelect={selectBrand} />
        ) : (
          <ProductList typeKey={selectedType} brand={selectedBrand} products={viewProducts} showBrand={showBrand} />
        )}
      </div>
      <div style={{ borderTop: "1px solid " + C.border, padding: "14px 40px", textAlign: "center", fontSize: 11, color: "#cbd5e1" }}>
        Uniking Canada · Technical Product Reference · Confidential — Internal Use Only
      </div>
    </div>
  );
}
