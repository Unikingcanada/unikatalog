import { useState, useEffect, useMemo } from "react";
import { createPageUrl } from "@/utils";
import { ElevatorBucket } from "@/api/entities";

const NAVY = "#1a3a5c";
const ML_RED = "#c0392b";
const BLUE_4B = "#1565c0";
const CATALOG_URL = "https://unikingcanada.com/catalogs/prod-uniking-canada-buckets-belts-and-accessories-catalog.pdf";

const VENDOR_CONFIG = {
  "Maxi-Lift":     { color: ML_RED,   badge: "#fee2e2", text: "#991b1b", icon: "🟠" },
  "4B Components": { color: BLUE_4B,  badge: "#dbeafe", text: "#1e40af", icon: "🔵" },
};

const DUTY_COLORS = {
  "Maximum Duty": { bg: "#fee2e2", text: "#991b1b" },
  "Heavy Duty":   { bg: "#fef3c7", text: "#92400e" },
  "Standard Duty":{ bg: "#f0fdf4", text: "#166534" },
};

const PROFILE_ICONS = {
  "Belting": "📏",
  "Hardware": "🔩",
  "Continuous Column": "♾️",
};

const APP_ICONS = { Agricultural: "🌾", Industrial: "🏭", "Agricultural/Industrial": "🌿" };

function Badge({ label, color = "#e5e7eb", textColor = "#374151", small }) {
  return (
    <span style={{ display: "inline-block", padding: small ? "1px 7px" : "3px 10px",
      borderRadius: 99, background: color, color: textColor,
      fontSize: small ? 10 : 11, fontWeight: 700, whiteSpace: "nowrap" }}>
      {label}
    </span>
  );
}

function UniKingLogo({ size = 24 }) {
  return (
    <div style={{ display: "flex", alignItems: "center", lineHeight: 1 }}>
      <span style={{ fontSize: size, fontWeight: 900, color: "#9ca3af", letterSpacing: -1, fontFamily: "'Arial Black',Arial,sans-serif" }}>UNI</span>
      <span style={{ fontSize: size, fontWeight: 900, color: "#fff", letterSpacing: -1, fontFamily: "'Arial Black',Arial,sans-serif" }}>KING</span>
    </div>
  );
}

function VendorLogo({ vendor, size = 16 }) {
  if (vendor === "Maxi-Lift") {
    return (
      <span style={{ fontFamily: "'Arial Black',Arial,sans-serif", fontWeight: 900,
        fontSize: size, letterSpacing: -0.5, color: ML_RED }}>
        MAXI<span style={{ color: "#555" }}>-LIFT</span>
      </span>
    );
  }
  return (
    <span style={{ fontFamily: "'Arial Black',Arial,sans-serif", fontWeight: 900,
      fontSize: size, color: BLUE_4B, letterSpacing: 0.5 }}>
      4B
    </span>
  );
}

// Visually distinct card header based on profile type
function ProductHero({ product }) {
  const isHardware = product.profile === "Hardware";
  const isBelting = product.profile === "Belting";
  const vc = VENDOR_CONFIG[product.vendor] || { color: NAVY };
  const dc = DUTY_COLORS[product.duty] || {};

  const icon = isHardware ? "🔩" : isBelting ? "📏" :
    product.profile === "Continuous Column" ? "♾️" :
    product.application === "Agricultural" ? "🌾" :
    product.application === "Industrial" ? "🏭" : "🌿";

  const accentColor = vc.color;

  return (
    <div style={{ height: 110, background: `linear-gradient(135deg, ${accentColor}18, ${accentColor}30)`,
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      gap: 5, borderBottom: `3px solid ${accentColor}40`, position: "relative", overflow: "hidden" }}>
      {/* Pattern */}
      <div style={{ position: "absolute", inset: 0, opacity: 0.04,
        backgroundImage: `repeating-linear-gradient(45deg, ${accentColor} 0px, ${accentColor} 1px, transparent 1px, transparent 12px)` }} />
      <div style={{ fontSize: 32, lineHeight: 1 }}>{icon}</div>
      <div style={{ fontSize: 10, fontWeight: 800, color: accentColor, letterSpacing: 1,
        textTransform: "uppercase", textAlign: "center", padding: "0 10px" }}>
        {product.series}
      </div>
      {product.color && (
        <div style={{ position: "absolute", top: 8, right: 8,
          width: 12, height: 12, borderRadius: "50%",
          background: product.color === "Orange" ? "#f97316" : product.color === "Red" ? "#ef4444" : "#888",
          boxShadow: "0 0 0 2px white" }} title={`${product.color} trademark color`} />
      )}
      <div style={{ position: "absolute", bottom: 8, left: 10 }}>
        <VendorLogo vendor={product.vendor} size={11} />
      </div>
    </div>
  );
}

// ── Detail Modal ────────────────────────────────────────────────
function BucketModal({ product, onClose }) {
  const [tab, setTab] = useState("specs");
  if (!product) return null;

  const vc = VENDOR_CONFIG[product.vendor] || { color: NAVY, badge: "#e5e7eb", text: "#374151" };
  const dc = DUTY_COLORS[product.duty] || { bg: "#f3f4f6", text: "#374151" };
  const sizes = product.bucket_sizes
    ? product.bucket_sizes.split(",").map(s => s.trim()).filter(Boolean)
    : [];
  const materials = product.material?.includes("/")
    ? product.material.split("/").map(m => m.trim())
    : [product.material];

  const isHardware = product.profile === "Hardware";
  const isBelting = product.profile === "Belting";
  const isBucket = !isHardware && !isBelting;

  const MAT_PROPS = {
    "Polyethylene": { icon: "🟢", desc: "Food grade · general purpose · -60°F to 180°F" },
    "HDPE":         { icon: "🟢", desc: "Food grade · general purpose · -60°F to 180°F" },
    "Nylon":        { icon: "🔴", desc: "Hot, abrasive applications · up to 300°F" },
    "Urethane":     { icon: "🟡", desc: "Sticky, abrasive applications · high impact · -60°F to 180°F" },
    "Ductile Iron": { icon: "⚙️", desc: "Maximum impact & abrasion resistance · replaces malleable iron" },
    "Welded Steel": { icon: "🔩", desc: "Fabricated steel · custom gauges and styles" },
    "Seamless Steel": { icon: "🔩", desc: "Deep drawn, no welds · lighter than fabricated" },
    "Aluminum":     { icon: "🪙", desc: "Lightweight · high grade" },
    "SBR Rubber":   { icon: "📏", desc: "General purpose · plied rubber belting" },
    "EPDM":         { icon: "📏", desc: "High temperature · premium belting" },
    "Premium Rubber": { icon: "📏", desc: "MSHA 2G / OSHA 284 · highest oil resistance" },
    "Stainless Steel": { icon: "✨", desc: "Stainless · food grade / corrosive environments" },
  };

  const getMat = (m) => {
    const key = Object.keys(MAT_PROPS).find(k => m.includes(k));
    return key ? MAT_PROPS[key] : { icon: "🔧", desc: "" };
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 1000,
      display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }} onClick={onClose}>
      <div style={{ background: "#fff", borderRadius: 16, width: "100%", maxWidth: 620,
        maxHeight: "92vh", overflowY: "auto", display: "flex", flexDirection: "column" }}
        onClick={e => e.stopPropagation()}>

        {/* Hero */}
        <div style={{ height: 180, background: `linear-gradient(135deg, ${vc.color}22, ${vc.color}44)`,
          borderRadius: "16px 16px 0 0", position: "relative", display: "flex",
          flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6 }}>
          <div style={{ position: "absolute", inset: 0, opacity: 0.05, borderRadius: "16px 16px 0 0",
            backgroundImage: `repeating-linear-gradient(45deg, ${vc.color} 0px, ${vc.color} 1px, transparent 1px, transparent 14px)` }} />
          <div style={{ fontSize: 44 }}>
            {isHardware ? "🔩" : isBelting ? "📏" : product.profile === "Continuous Column" ? "♾️" :
             product.application === "Agricultural" ? "🌾" : product.application === "Industrial" ? "🏭" : "🌿"}
          </div>
          <div style={{ fontSize: 20, fontWeight: 900, color: vc.color, textAlign: "center", padding: "0 20px" }}>
            {product.series}
          </div>
          <div style={{ fontSize: 12, color: "#6b7280", textAlign: "center", padding: "0 20px" }}>
            {product.style}
          </div>
          <button onClick={onClose} style={{ position: "absolute", top: 12, right: 12,
            background: "rgba(0,0,0,0.15)", border: "none", borderRadius: "50%",
            width: 32, height: 32, cursor: "pointer", color: "#fff", fontSize: 15,
            display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
          <div style={{ position: "absolute", top: 12, left: 14, background: "rgba(255,255,255,0.9)",
            borderRadius: 6, padding: "4px 10px" }}>
            <VendorLogo vendor={product.vendor} size={13} />
          </div>
        </div>

        {/* Badges */}
        <div style={{ display: "flex", gap: 7, flexWrap: "wrap", padding: "12px 18px 0" }}>
          <Badge label={`${APP_ICONS[product.application] || ""} ${product.application}`} color={vc.badge} textColor={vc.text} />
          {product.duty && <Badge label={product.duty} color={dc.bg} textColor={dc.text} />}
          {product.discharge_type && product.discharge_type !== "N/A" &&
            <Badge label={product.discharge_type} color="#f0fdf4" textColor="#166534" />}
        </div>

        {/* Notes */}
        {product.notes && (
          <div style={{ margin: "12px 18px 0", fontSize: 13, color: "#374151", lineHeight: 1.7,
            padding: "10px 14px", background: "#f8fafc", borderRadius: 8, borderLeft: `3px solid ${vc.color}` }}>
            {product.notes}
          </div>
        )}

        {/* Tabs */}
        <div style={{ display: "flex", borderBottom: "2px solid #f3f4f6", margin: "12px 18px 0" }}>
          {[
            ["specs", "📐 Specs"],
            isBucket && ["sizes", `📏 Sizes (${sizes.length})`],
            ["materials", "🧪 Materials"],
          ].filter(Boolean).map(([id, label]) => (
            <button key={id} onClick={() => setTab(id)}
              style={{ padding: "8px 14px", border: "none", background: "none",
                cursor: "pointer", fontSize: 12, fontWeight: 700,
                color: tab === id ? vc.color : "#9ca3af",
                borderBottom: tab === id ? `2px solid ${vc.color}` : "2px solid transparent",
                marginBottom: -2 }}>{label}</button>
          ))}
        </div>

        {/* Tab Content */}
        <div style={{ padding: "14px 18px 0" }}>
          {tab === "specs" && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {[
                ["Vendor", product.vendor],
                ["Application", product.application],
                ["Duty Level", product.duty],
                ["Profile", product.profile || "Standard"],
                ["Discharge Type", product.discharge_type || "—"],
                ["Catalog Pages", product.page_range ? `pp. ${product.page_range}` : "—"],
              ].filter(([, v]) => v && v !== "N/A").map(([l, v]) => (
                <div key={l} style={{ padding: "10px 12px", background: "#f8fafc", borderRadius: 8, border: "1px solid #f1f5f9" }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 3 }}>{l}</div>
                  <div style={{ fontSize: 13, color: NAVY, fontWeight: 700 }}>{v}</div>
                </div>
              ))}
            </div>
          )}

          {tab === "sizes" && (
            <div>
              <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 12 }}>
                Sizes shown as <strong>Length × Projection</strong> (inches). Contact Uniking for full dimensional tables.
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
                {sizes.map(sz => (
                  <span key={sz} style={{ padding: "5px 12px", background: NAVY, color: "#fff",
                    borderRadius: 7, fontSize: 13, fontWeight: 700, letterSpacing: 0.3 }}>{sz}"</span>
                ))}
              </div>
              {sizes.length === 0 && <p style={{ color: "#9ca3af", fontStyle: "italic" }}>Contact Uniking for available sizes.</p>}
            </div>
          )}

          {tab === "materials" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {materials.map((mat, i) => {
                const info = getMat(mat.trim());
                return (
                  <div key={i} style={{ display: "flex", gap: 12, padding: "10px 14px",
                    borderRadius: 8, background: "#f8fafc", border: "1px solid #e5e7eb",
                    alignItems: "flex-start" }}>
                    <span style={{ fontSize: 24 }}>{info.icon}</span>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: NAVY }}>{mat.trim()}</div>
                      <div style={{ fontSize: 11, color: "#6b7280", marginTop: 2 }}>{info.desc}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Actions */}
        <div style={{ padding: "16px 18px 18px", display: "flex", gap: 10, marginTop: "auto" }}>
          <a href={CATALOG_URL} target="_blank" rel="noreferrer"
            style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              padding: "10px", background: NAVY, color: "#fff", borderRadius: 8,
              fontSize: 13, fontWeight: 700, textDecoration: "none" }}>
            📄 View Full Catalog PDF ↗
          </a>
          <a href="mailto:logistics@unikingcanada.com"
            style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              padding: "10px", background: vc.color, color: "#fff", borderRadius: 8,
              fontSize: 13, fontWeight: 700, textDecoration: "none" }}>
            ✉️ Request a Quote
          </a>
        </div>
      </div>
    </div>
  );
}

// ── Product Card ────────────────────────────────────────────────
function BucketCard({ product, onClick }) {
  const vc = VENDOR_CONFIG[product.vendor] || { color: NAVY, badge: "#e5e7eb", text: "#374151" };
  const dc = DUTY_COLORS[product.duty] || { bg: "#f3f4f6", text: "#374151" };
  const sizeCount = product.bucket_sizes
    ? product.bucket_sizes.split(",").filter(s => s.trim()).length
    : 0;
  const isBucket = product.profile !== "Hardware" && product.profile !== "Belting";

  return (
    <div onClick={onClick}
      style={{ background: "#fff", borderRadius: 12, border: "1px solid #e5e7eb",
        overflow: "hidden", cursor: "pointer", display: "flex", flexDirection: "column",
        transition: "transform 0.15s, box-shadow 0.15s" }}
      onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 6px 20px rgba(0,0,0,0.10)"; }}
      onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; }}>

      <ProductHero product={product} />

      <div style={{ padding: "11px 13px", flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: "#374151", lineHeight: 1.25 }}>
          {product.style}
        </div>
        <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
          <Badge label={product.application} color={vc.badge} textColor={vc.text} small />
          {product.duty && <Badge label={product.duty} color={dc.bg} textColor={dc.text} small />}
        </div>
        {product.notes && (
          <div style={{ fontSize: 11, color: "#6b7280", lineHeight: 1.45,
            display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
            {product.notes}
          </div>
        )}
      </div>

      <div style={{ padding: "8px 13px", borderTop: "1px solid #f3f4f6",
        display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        {isBucket
          ? <span style={{ fontSize: 10, color: "#9ca3af" }}>📏 {sizeCount} sizes</span>
          : <span style={{ fontSize: 10, color: "#9ca3af" }}>{PROFILE_ICONS[product.profile] || ""} {product.profile}</span>
        }
        <span style={{ fontSize: 11, color: vc.color, fontWeight: 700 }}>Details →</span>
      </div>
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────────
export default function ElevatorBuckets() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterVendor, setFilterVendor] = useState("All");
  const [filterApp, setFilterApp] = useState("All");
  const [filterDuty, setFilterDuty] = useState("All");
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    ElevatorBucket.list().then(d => { setProducts(d || []); setLoading(false); });
  }, []);

  const vendors = useMemo(() => ["All", ...new Set(products.map(p => p.vendor).filter(Boolean))], [products]);
  const applications = useMemo(() => ["All", "Agricultural", "Industrial", "Agricultural/Industrial"], []);
  const duties = useMemo(() => ["All", "Maximum Duty", "Heavy Duty", "Standard Duty"], []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return products.filter(p => {
      if (filterVendor !== "All" && p.vendor !== filterVendor) return false;
      if (filterApp !== "All" && p.application !== filterApp) return false;
      if (filterDuty !== "All" && p.duty !== filterDuty) return false;
      if (!q) return true;
      return [p.series, p.style, p.material, p.notes, p.duty, p.application, p.search_tags, p.vendor]
        .some(v => v?.toLowerCase().includes(q));
    });
  }, [products, search, filterApp, filterDuty, filterVendor]);

  // Group: Agricultural buckets → Industrial buckets → Accessories
  const sections = useMemo(() => {
    const ag = filtered.filter(p => p.application === "Agricultural" && p.profile !== "Hardware" && p.profile !== "Belting");
    const agInd = filtered.filter(p => p.application === "Agricultural/Industrial" && p.profile !== "Hardware" && p.profile !== "Belting");
    const ind = filtered.filter(p => p.application === "Industrial" && p.profile !== "Hardware" && p.profile !== "Belting");
    const hw = filtered.filter(p => p.profile === "Hardware" || p.profile === "Belting");
    return [
      ag.length > 0 && { label: "🌾 Agricultural Buckets", items: ag },
      agInd.length > 0 && { label: "🌿 Agricultural & Industrial Buckets", items: agInd },
      ind.length > 0 && { label: "🏭 Industrial Buckets", items: ind },
      hw.length > 0 && { label: "🔩 Belting & Hardware", items: hw },
    ].filter(Boolean);
  }, [filtered]);

  const selSt = {
    padding: "7px 12px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.2)",
    background: "rgba(255,255,255,0.1)", color: "#fff", fontSize: 12, cursor: "pointer"
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f1f5f9", fontFamily: "system-ui,Arial,sans-serif" }}>

      {/* Header */}
      <div style={{ background: NAVY, position: "sticky", top: 0, zIndex: 500, boxShadow: "0 2px 12px rgba(0,0,0,0.25)" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "12px 20px",
          display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
          <div>
            <UniKingLogo size={22} />
            <div style={{ fontSize: 8, color: "rgba(255,255,255,0.4)", letterSpacing: 2, textTransform: "uppercase", marginTop: 1 }}>PRODUCT CATALOG</div>
          </div>
          <a href={createPageUrl("Home")} style={{ display: "flex", alignItems: "center", gap: 5, color: "rgba(255,255,255,0.6)", textDecoration: "none", fontSize: 11, fontWeight: 600, padding: "5px 10px", borderRadius: 6, border: "1px solid rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.07)", whiteSpace: "nowrap" }}>
            ← Catalog
          </a>
          <div style={{ width: 1, height: 32, background: "rgba(255,255,255,0.15)", flexShrink: 0 }} />
          <div>
            <div style={{ fontSize: 13, fontWeight: 800, color: "#fff" }}>Buckets, Belts & Accessories</div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.45)" }}>
              <span style={{ color: ML_RED, fontWeight: 700 }}>Maxi-Lift</span> · <span style={{ color: "#60a5fa", fontWeight: 700 }}>4B Components</span>
            </div>
          </div>
          <div style={{ flex: 1, minWidth: 160 }}>
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search series, material, application…"
              style={{ width: "100%", padding: "7px 13px", borderRadius: 8, border: "none",
                fontSize: 12, outline: "none", background: "rgba(255,255,255,0.12)",
                color: "#fff", boxSizing: "border-box" }} />
          </div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", whiteSpace: "nowrap" }}>
            {filtered.length}/{products.length} products
          </div>
          <a href={CATALOG_URL} target="_blank" rel="noreferrer"
            style={{ padding: "7px 12px", background: "rgba(255,255,255,0.1)", color: "#fff",
              borderRadius: 7, fontSize: 11, fontWeight: 700, textDecoration: "none",
              border: "1px solid rgba(255,255,255,0.2)", whiteSpace: "nowrap" }}>
            📄 Full PDF ↗
          </a>
        </div>

        {/* Filter bar */}
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", padding: "9px 20px",
          maxWidth: 1280, margin: "0 auto", display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          <span style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1 }}>Filter:</span>
          <select value={filterVendor} onChange={e => setFilterVendor(e.target.value)} style={selSt}>
            {vendors.map(v => <option key={v} style={{ color: "#000" }}>{v === "All" ? "All Vendors" : v}</option>)}
          </select>
          <select value={filterApp} onChange={e => setFilterApp(e.target.value)} style={selSt}>
            {applications.map(a => <option key={a} style={{ color: "#000" }}>{a === "All" ? "All Applications" : a}</option>)}
          </select>
          <select value={filterDuty} onChange={e => setFilterDuty(e.target.value)} style={selSt}>
            {duties.map(d => <option key={d} style={{ color: "#000" }}>{d === "All" ? "All Duty Levels" : d}</option>)}
          </select>
          {(filterVendor !== "All" || filterApp !== "All" || filterDuty !== "All" || search) && (
            <button onClick={() => { setFilterVendor("All"); setFilterApp("All"); setFilterDuty("All"); setSearch(""); }}
              style={{ padding: "7px 12px", background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.6)",
                border: "1px solid rgba(255,255,255,0.15)", borderRadius: 7, fontSize: 11, cursor: "pointer" }}>
              Clear ×
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "24px 20px" }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: 80, color: "#9ca3af", fontSize: 15 }}>Loading catalog…</div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: 80 }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🪣</div>
            <div style={{ fontSize: 15, color: "#6b7280", fontWeight: 600 }}>No products match your filters</div>
            <button onClick={() => { setFilterVendor("All"); setFilterApp("All"); setFilterDuty("All"); setSearch(""); }}
              style={{ marginTop: 14, padding: "8px 20px", background: NAVY, color: "#fff", border: "none",
                borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 700 }}>Clear Filters</button>
          </div>
        ) : (
          sections.map(({ label, items }) => (
            <div key={label} style={{ marginBottom: 40 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                <div style={{ fontSize: 14, fontWeight: 800, color: NAVY }}>{label}</div>
                <div style={{ fontSize: 11, color: "#9ca3af" }}>· {items.length} product{items.length !== 1 ? "s" : ""}</div>
                <div style={{ flex: 1, height: 1, background: "#e2e8f0" }} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(210px, 1fr))", gap: 14 }}>
                {items.map(p => (
                  <BucketCard key={p.id} product={p} onClick={() => setSelected(p)} />
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 20px 32px",
        fontSize: 11, color: "#9ca3af", textAlign: "center", lineHeight: 1.8 }}>
        Products distributed by <strong style={{ color: "#374151" }}>Uniking Canada</strong> ·
        12985 Rue Brault, Mirabel, QC J7J 0W2 ·
        <a href="mailto:logistics@unikingcanada.com" style={{ color: "#6b7280" }}> logistics@unikingcanada.com</a><br />
        Maxi-Lift® is a registered trademark of Maxi-Lift, Inc. · 4B Components Ltd.
      </div>

      {selected && <BucketModal product={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
