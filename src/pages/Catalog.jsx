import { useState, useEffect, useMemo } from "react";
import { UniCatalog } from "@/api/entities";
import { CatalogProduct } from "@/api/entities";
import { ElevatorBucket } from "@/api/entities";

const NAVY = "#1a3a5c";

const TYPE_META = {
  "Elevator Bucket":       { icon: "🪣", color: "#b45309", bg: "#fef3c7" },
  "Elevator Belt":         { icon: "🔗", color: "#7c3aed", bg: "#ede9fe" },
  "Hardware & Accessories":{ icon: "🔩", color: "#92400e", bg: "#fef9c3" },
  "Modular Plastic Belt":  { icon: "🔵", color: "#065f46", bg: "#d1fae5" },
  "Wire Mesh Belt":        { icon: "⬡",  color: "#1e40af", bg: "#dbeafe" },
  "Steel Hinged Belt":     { icon: "⛓",  color: "#374151", bg: "#f3f4f6" },
  "Table Top Chain":       { icon: "🔗", color: "#0e7490", bg: "#cffafe" },
  "ANSI/BS Chain":         { icon: "⚙️", color: "#4338ca", bg: "#e0e7ff" },
  "Cast Chain":            { icon: "🏭", color: "#7f1d1d", bg: "#fee2e2" },
  "Engineered Chain":      { icon: "🔧", color: "#1d4ed8", bg: "#dbeafe" },
  "Forged Chain":          { icon: "⚒️", color: "#92400e", bg: "#ffedd5" },
  "Welded Steel Chain":    { icon: "🔗", color: "#374151", bg: "#f1f5f9" },
  "Overhead Chain":        { icon: "🏗",  color: "#0f766e", bg: "#ccfbf1" },
  "Sharptop Chain":        { icon: "🔪", color: "#166534", bg: "#dcfce7" },
  "Thermoforming Chain":   { icon: "🧱", color: "#9333ea", bg: "#f3e8ff" },
  "Kiln Chain":            { icon: "🔥", color: "#c2410c", bg: "#ffedd5" },
  "Conveyor Roller":       { icon: "🎡", color: "#0369a1", bg: "#e0f2fe" },
  "Magnetic Conveyor":     { icon: "🧲", color: "#be185d", bg: "#fce7f3" },
  "Monitoring System":     { icon: "📡", color: "#047857", bg: "#d1fae5" },
};

// Map ElevatorBucket profile → product_type
function getBucketType(b) {
  const p = (b.profile || "").toLowerCase();
  const s = (b.series || "").toLowerCase();
  if (p === "belting" || s.includes("belt") || s.includes("pathfinder") || s.includes("industrial belt")) return "Elevator Belt";
  if (p === "hardware" || s.includes("bolt") || s.includes("splice")) return "Hardware & Accessories";
  return "Elevator Bucket";
}

function Badge({ label, bg = "#f3f4f6", color = "#374151", xs }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", padding: xs ? "1px 7px" : "3px 10px",
      borderRadius: 99, background: bg, color, fontSize: xs ? 10 : 11, fontWeight: 700, whiteSpace: "nowrap" }}>
      {label}
    </span>
  );
}

function Card({ rec, type, onClick }) {
  const tm = TYPE_META[type] || { icon: "📦", color: NAVY, bg: "#f3f4f6" };
  return (
    <div onClick={onClick}
      style={{ background: "#fff", borderRadius: 12, border: "1px solid #e5e7eb",
        cursor: "pointer", display: "flex", flexDirection: "column", overflow: "hidden",
        transition: "transform .15s, box-shadow .15s" }}
      onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 6px 20px rgba(0,0,0,.10)"; }}
      onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; }}>

      <div style={{ height: 5, background: `linear-gradient(90deg,${tm.color},${tm.color}88)` }} />

      <div style={{ padding: "12px 14px", flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 6 }}>
          <Badge label={`${tm.icon} ${type}`} bg={tm.bg} color={tm.color} xs />
          <span style={{ fontSize: 10, color: "#9ca3af", textAlign: "right", lineHeight: 1.3 }}>
            {rec.vendor || "—"}
          </span>
        </div>

        <div style={{ fontSize: 13, fontWeight: 800, color: NAVY, lineHeight: 1.25 }}>
          {rec.series || rec.name || "—"}
        </div>
        {(rec.style || rec.category) && (
          <div style={{ fontSize: 11, color: "#6b7280" }}>{rec.style || rec.category}</div>
        )}

        <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
          {rec.duty && <Badge label={rec.duty} bg="#f9fafb" color="#374151" xs />}
          {rec.application && (
            <Badge label={rec.application.split(",")[0].trim()} bg="#f0f9ff" color="#0369a1" xs />
          )}
        </div>

        {(rec.notes || rec.materials || rec.material) && (
          <div style={{ fontSize: 11, color: "#6b7280", lineHeight: 1.5,
            display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
            {rec.notes || rec.materials || rec.material}
          </div>
        )}
      </div>

      <div style={{ padding: "8px 14px", borderTop: "1px solid #f3f4f6",
        display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 10, color: "#d1d5db" }}>
          {rec.page_range ? `pp. ${rec.page_range}` : ""}
        </span>
        <span style={{ fontSize: 11, color: tm.color, fontWeight: 700 }}>Details →</span>
      </div>
    </div>
  );
}

function Modal({ rec, type, onClose }) {
  const [tab, setTab] = useState("overview");
  if (!rec) return null;
  const tm = TYPE_META[type] || { icon: "📦", color: NAVY, bg: "#f3f4f6" };

  const isBucket = type === "Elevator Bucket";
  const isIntralox = !!rec.pitch_in;

  const specs = isIntralox ? [
    ["Series", rec.series], ["Category", rec.category], ["Style", rec.style],
    ["Pitch", rec.pitch_in ? `${rec.pitch_in}" (${rec.pitch_mm}mm)` : "—"],
    ["Min Width", rec.min_width_in ? `${rec.min_width_in}"` : "—"],
    ["Open Area", rec.open_area], ["Hinge", rec.hinge_style],
    ["Pages", rec.page_range ? `pp. ${rec.page_range}` : "—"],
  ] : [
    ["Series", rec.series], ["Style", rec.style || rec.category],
    ["Vendor", rec.vendor], ["Duty", rec.duty],
    ["Application", rec.application],
    ["Model / Part No.", rec.model_code],
    ["Sizes Available", rec.sizes_available],
    ["Pages", rec.page_range ? `pp. ${rec.page_range}` : "—"],
  ];

  let parsedSpecs = null;
  if (rec.key_specs) {
    try { parsedSpecs = JSON.parse(rec.key_specs); } catch {}
  }

  const matStr = rec.materials || rec.material || "";
  const mats = matStr.split(/[,/]/).map(m => m.trim()).filter(Boolean);

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.55)", zIndex: 1000,
      display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }} onClick={onClose}>
      <div style={{ background: "#fff", borderRadius: 16, width: "100%", maxWidth: 640,
        maxHeight: "93vh", overflowY: "auto" }} onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div style={{ background: `linear-gradient(135deg,${NAVY},#2d5986)`,
          borderRadius: "16px 16px 0 0", padding: "20px 22px 18px", position: "relative" }}>
          <button onClick={onClose} style={{ position: "absolute", top: 12, right: 14,
            background: "rgba(255,255,255,.15)", border: "none", borderRadius: "50%",
            width: 32, height: 32, cursor: "pointer", color: "#fff", fontSize: 16 }}>✕</button>
          <div style={{ display: "flex", gap: 8, marginBottom: 10, flexWrap: "wrap" }}>
            <Badge label={`${tm.icon} ${type}`} bg={tm.bg} color={tm.color} />
            {rec.vendor && <Badge label={rec.vendor} bg="rgba(255,255,255,.15)" color="#fff" />}
          </div>
          <div style={{ fontSize: 21, fontWeight: 900, color: "#fff", lineHeight: 1.15 }}>{rec.series}</div>
          {(rec.style || rec.category) && (
            <div style={{ fontSize: 13, color: "rgba(255,255,255,.65)", marginTop: 4 }}>{rec.style || rec.category}</div>
          )}
        </div>

        {/* Notes */}
        {rec.notes && (
          <div style={{ margin: "14px 20px 0", fontSize: 13, color: "#374151", lineHeight: 1.7,
            padding: "10px 14px", background: "#f8fafc", borderRadius: 8, borderLeft: `3px solid ${tm.color}` }}>
            {rec.notes}
          </div>
        )}

        {/* Features */}
        {rec.features && (
          <div style={{ margin: "10px 20px 0" }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>Features</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {rec.features.split(";").map((f, i) => f.trim() && (
                <span key={i} style={{ fontSize: 11, padding: "3px 9px", borderRadius: 99,
                  background: tm.bg, color: tm.color, fontWeight: 600 }}>✓ {f.trim()}</span>
              ))}
            </div>
          </div>
        )}

        {/* Tabs */}
        <div style={{ display: "flex", borderBottom: "2px solid #f3f4f6", margin: "12px 20px 0" }}>
          {[["overview","📋 Specs"], mats.length && ["materials","🧪 Materials"],
            parsedSpecs && ["keyspecs","⚙️ Key Specs"],
            isBucket && rec.bucket_sizes && ["sizes","📏 Sizes"],
            (rec.catalog_url || rec.tech_doc_url) && ["resources","📎 Resources"],
          ].filter(Boolean).map(([id, label]) => (
            <button key={id} onClick={() => setTab(id)}
              style={{ padding: "8px 13px", border: "none", background: "none", cursor: "pointer",
                fontSize: 12, fontWeight: 700, color: tab === id ? tm.color : "#9ca3af",
                borderBottom: tab === id ? `2px solid ${tm.color}` : "2px solid transparent", marginBottom: -2 }}>
              {label}
            </button>
          ))}
        </div>

        <div style={{ padding: "14px 20px 20px" }}>
          {tab === "overview" && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {specs.filter(([, v]) => v && v !== "—" && v !== "null").map(([l, v]) => (
                <div key={l} style={{ padding: "10px 12px", background: "#f8fafc", borderRadius: 8, border: "1px solid #f1f5f9" }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: .5, marginBottom: 3 }}>{l}</div>
                  <div style={{ fontSize: 13, color: NAVY, fontWeight: 700 }}>{String(v)}</div>
                </div>
              ))}
            </div>
          )}
          {tab === "materials" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {mats.map((m, i) => (
                <div key={i} style={{ padding: "10px 14px", background: "#f8fafc", borderRadius: 8, border: "1px solid #e5e7eb", fontSize: 13, color: NAVY, fontWeight: 600 }}>
                  🧪 {m}
                </div>
              ))}
            </div>
          )}
          {tab === "keyspecs" && parsedSpecs && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {Object.entries(parsedSpecs).map(([k, v]) => (
                <div key={k} style={{ padding: "10px 12px", background: "#f8fafc", borderRadius: 8, border: "1px solid #f1f5f9" }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: .5, marginBottom: 3 }}>
                    {k.replace(/_/g, " ")}
                  </div>
                  <div style={{ fontSize: 13, color: NAVY, fontWeight: 700 }}>{String(v)}</div>
                </div>
              ))}
            </div>
          )}
          {tab === "sizes" && rec.bucket_sizes && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
              {rec.bucket_sizes.split(",").map(s => s.trim()).filter(Boolean).map(sz => (
                <span key={sz} style={{ padding: "6px 13px", background: NAVY, color: "#fff", borderRadius: 7, fontSize: 13, fontWeight: 700 }}>{sz}"</span>
              ))}
            </div>
          )}
          {tab === "resources" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {rec.catalog_url && (
                <a href={rec.catalog_url} target="_blank" rel="noreferrer"
                  style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px",
                    background: "#f0f9ff", borderRadius: 10, color: "#0369a1", textDecoration: "none", fontWeight: 700, fontSize: 13 }}>
                  📄 View Source Catalog PDF ↗
                </a>
              )}
              {rec.tech_doc_url && (
                <a href={rec.tech_doc_url} target="_blank" rel="noreferrer"
                  style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px",
                    background: "#f0fdf4", borderRadius: 10, color: "#166534", textDecoration: "none", fontWeight: 700, fontSize: 13 }}>
                  📐 Technical Data Sheet ↗
                </a>
              )}
              {rec.cad_url && (
                <a href={rec.cad_url} target="_blank" rel="noreferrer"
                  style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px",
                    background: "#fdf4ff", borderRadius: 10, color: "#7e22ce", textDecoration: "none", fontWeight: 700, fontSize: 13 }}>
                  📐 CAD Drawing ↗
                </a>
              )}
              <a href="mailto:logistics@unikingcanada.com"
                style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px",
                  background: NAVY, borderRadius: 10, color: "#fff", textDecoration: "none", fontWeight: 700, fontSize: 13 }}>
                ✉️ Request a Quote
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Catalog() {
  const [uniRecs,   setUniRecs]   = useState([]);
  const [intralox,  setIntralox]  = useState([]);
  const [buckets,   setBuckets]   = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [search,    setSearch]    = useState("");
  const [activeType, setActiveType] = useState("All");
  const [filterVendor, setFilterVendor] = useState("All");
  const [selected,  setSelected]  = useState(null);
  const [selType,   setSelType]   = useState(null);

  useEffect(() => {
    Promise.all([UniCatalog.list(), CatalogProduct.list(), ElevatorBucket.list()])
      .then(([u, i, b]) => {
        setUniRecs(u || []);
        setIntralox(i || []);
        setBuckets(b || []);
        setLoading(false);
      });
  }, []);

  // Merge everything into one flat array with a _type tag
  const allProducts = useMemo(() => [
    ...uniRecs.map(r => ({ ...r, _type: r.product_type, _src: "uni" })),
    ...intralox.map(r => ({ ...r, _type: "Modular Plastic Belt", _src: "intralox",
      vendor: r.vendor || "Intralox", series: r.series })),
    ...buckets.map(r => ({ ...r, _type: getBucketType(r), _src: "bucket",
      materials: r.material, notes: r.notes })),
  ], [uniRecs, intralox, buckets]);

  const types = useMemo(() => {
    const seen = new Set(allProducts.map(p => p._type));
    return ["All", ...Object.keys(TYPE_META).filter(t => seen.has(t))];
  }, [allProducts]);

  const vendors = useMemo(() => {
    const v = new Set(allProducts.map(p => p.vendor).filter(Boolean));
    return ["All", ...Array.from(v).sort()];
  }, [allProducts]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return allProducts.filter(p => {
      if (activeType !== "All" && p._type !== activeType) return false;
      if (filterVendor !== "All" && p.vendor !== filterVendor) return false;
      if (!q) return true;
      return [p.series, p.style, p.category, p.materials, p.material,
        p.notes, p.application, p.search_tags, p.vendor, p.features]
        .some(v => v?.toLowerCase().includes(q));
    });
  }, [allProducts, search, activeType, filterVendor]);

  // Group by type in defined order
  const grouped = useMemo(() => {
    const map = {};
    for (const p of filtered) {
      if (!map[p._type]) map[p._type] = [];
      map[p._type].push(p);
    }
    return Object.keys(TYPE_META).filter(t => map[t]).map(t => [t, map[t]]);
  }, [filtered]);

  const totalCount = allProducts.length;
  const clearAll = () => { setActiveType("All"); setFilterVendor("All"); setSearch(""); };
  const hasFilters = activeType !== "All" || filterVendor !== "All" || search;

  const selSt = {
    padding: "7px 12px", borderRadius: 8, border: "1px solid rgba(255,255,255,.2)",
    background: "rgba(255,255,255,.1)", color: "#fff", fontSize: 12, cursor: "pointer",
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f1f5f9", fontFamily: "system-ui, Arial, sans-serif" }}>

      {/* ── Sticky Header ── */}
      <div style={{ background: NAVY, position: "sticky", top: 0, zIndex: 500, boxShadow: "0 2px 16px rgba(0,0,0,.25)" }}>
        <div style={{ maxWidth: 1360, margin: "0 auto", padding: "14px 24px",
          display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>

          {/* Logo */}
          <div>
            <span style={{ fontFamily: "'Arial Black',Arial,sans-serif", fontWeight: 900, fontSize: 26,
              letterSpacing: -1, lineHeight: 1 }}>
              <span style={{ color: "#9ca3af" }}>UNI</span><span style={{ color: "#fff" }}>KING</span>
            </span>
            <div style={{ fontSize: 9, color: "rgba(255,255,255,.3)", letterSpacing: 2, textTransform: "uppercase" }}>
              PRODUCT CATALOG
            </div>
          </div>

          <div style={{ width: 1, height: 36, background: "rgba(255,255,255,.15)" }} />
          <div style={{ fontSize: 12, color: "rgba(255,255,255,.5)" }}>
            {totalCount} products · 17 catalogs · {Object.keys(TYPE_META).length} product types
          </div>

          {/* Search */}
          <div style={{ flex: 1, minWidth: 200, position: "relative" }}>
            <span style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)",
              color: "rgba(255,255,255,.35)", fontSize: 14 }}>🔍</span>
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search product, material, application, vendor…"
              style={{ width: "100%", padding: "8px 14px 8px 34px", borderRadius: 8, border: "none",
                fontSize: 13, outline: "none", background: "rgba(255,255,255,.12)", color: "#fff", boxSizing: "border-box" }} />
          </div>

          <div style={{ fontSize: 12, color: "rgba(255,255,255,.4)", whiteSpace: "nowrap" }}>
            {filtered.length} / {totalCount} shown
          </div>
        </div>

        {/* ── Filter Bar ── */}
        <div style={{ borderTop: "1px solid rgba(255,255,255,.08)", maxWidth: 1360, margin: "0 auto",
          padding: "10px 24px", display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>

          <span style={{ fontSize: 10, color: "rgba(255,255,255,.3)", fontWeight: 700,
            textTransform: "uppercase", letterSpacing: 1, marginRight: 4 }}>Type:</span>

          {types.map(t => {
            const tm = TYPE_META[t];
            const active = activeType === t;
            const count = t === "All" ? allProducts.length : allProducts.filter(p => p._type === t).length;
            return (
              <button key={t} onClick={() => setActiveType(active && t !== "All" ? "All" : t)}
                style={{ padding: "5px 12px", borderRadius: 99, border: "none", cursor: "pointer",
                  fontSize: 11, fontWeight: 700, transition: "all .12s",
                  background: active ? "#fff" : "rgba(255,255,255,.1)",
                  color: active ? NAVY : "rgba(255,255,255,.65)" }}>
                {tm ? `${tm.icon} ${t}` : t}
                <span style={{ marginLeft: 5, fontSize: 10, opacity: .65 }}>({count})</span>
              </button>
            );
          })}

          <div style={{ width: 1, height: 20, background: "rgba(255,255,255,.15)", margin: "0 4px" }} />

          <select value={filterVendor} onChange={e => setFilterVendor(e.target.value)} style={selSt}>
            {vendors.map(v => <option key={v} style={{ color: "#000" }}>{v === "All" ? "All Suppliers" : v}</option>)}
          </select>

          {hasFilters && (
            <button onClick={clearAll}
              style={{ padding: "5px 12px", background: "rgba(255,255,255,.08)", color: "rgba(255,255,255,.55)",
                border: "1px solid rgba(255,255,255,.15)", borderRadius: 7, fontSize: 11, cursor: "pointer" }}>
              Clear ×
            </button>
          )}
        </div>
      </div>

      {/* ── Grid ── */}
      <div style={{ maxWidth: 1360, margin: "0 auto", padding: "28px 24px" }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: 100, color: "#9ca3af", fontSize: 16 }}>Loading catalog…</div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: 100 }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🔍</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: "#374151" }}>No products match your filters</div>
            <button onClick={clearAll} style={{ marginTop: 16, padding: "10px 22px", background: NAVY,
              color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 700 }}>
              Clear filters
            </button>
          </div>
        ) : (
          grouped.map(([type, items]) => {
            const tm = TYPE_META[type] || {};
            const vendorList = [...new Set(items.map(p => p.vendor).filter(Boolean))].slice(0, 4).join(", ");
            return (
              <div key={type} style={{ marginBottom: 44 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
                  <div style={{ width: 4, height: 32, borderRadius: 2, background: tm.color || NAVY, flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: 17, fontWeight: 900, color: NAVY }}>{tm.icon} {type}</div>
                    <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 1 }}>
                      {items.length} product{items.length !== 1 ? "s" : ""} · {vendorList}
                    </div>
                  </div>
                  <div style={{ flex: 1, height: 1, background: "#e2e8f0" }} />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(230px,1fr))", gap: 14 }}>
                  {items.map(p => (
                    <Card key={p.id} rec={p} type={type}
                      onClick={() => { setSelected(p); setSelType(type); }} />
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer */}
      <div style={{ maxWidth: 1360, margin: "0 auto", padding: "0 24px 36px",
        fontSize: 11, color: "#9ca3af", textAlign: "center" }}>
        Uniking Canada · 12985 Rue Brault, Mirabel, QC J7J 0W2 · logistics@unikingcanada.com<br />
        For reference only — no pricing displayed. Contact Uniking for availability and quotation.
      </div>

      {selected && <Modal rec={selected} type={selType} onClose={() => { setSelected(null); setSelType(null); }} />}
    </div>
  );
}
