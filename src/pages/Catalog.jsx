import { useState, useEffect, useMemo } from "react";
import { CatalogProduct } from "@/api/entities";
import { ElevatorBucket } from "@/api/entities";

// ── Brand colours ─────────────────────────────────────────────
const NAVY   = "#1a3a5c";
const GOLD   = "#c8972b";
const RED    = "#c0392b";

// ── Product-type taxonomy ─────────────────────────────────────
// Every record gets mapped to one of these types
function getProductType(record, source) {
  if (source === "belt") {
    const cat = (record.category || "").toLowerCase();
    const style = (record.style || "").toLowerCase();
    if (cat.includes("wire") || style.includes("wire")) return "Wire Mesh Belt";
    return "Modular Plastic Belt";
  }
  // bucket entity
  const profile = (record.profile || "").toLowerCase();
  const series  = (record.series  || "").toLowerCase();
  if (profile === "belting" || series.includes("belt") || series.includes("pathfinder") || series.includes("industrial belt")) return "Elevator Belt";
  if (profile === "hardware" || series.includes("bolt") || series.includes("splice"))  return "Hardware & Accessories";
  return "Elevator Bucket";
}

const TYPE_META = {
  "Elevator Bucket":      { icon: "🪣", color: "#1e3a5c", bg: "#e8f0fe" },
  "Elevator Belt":        { icon: "🔗", color: "#7c3aed", bg: "#ede9fe" },
  "Hardware & Accessories":{ icon: "🔩", color: "#92400e", bg: "#fef3c7" },
  "Modular Plastic Belt": { icon: "🔵", color: "#065f46", bg: "#d1fae5" },
  "Wire Mesh Belt":       { icon: "⬡",  color: "#1e40af", bg: "#dbeafe" },
};

const VENDOR_COLOR = {
  "Intralox":       { dot: "#0070c0", label: "Intralox" },
  "Maxi-Lift":      { dot: RED,       label: "Maxi-Lift" },
  "4B Components":  { dot: "#16a34a", label: "4B Components" },
};

// ── Helpers ───────────────────────────────────────────────────
function Badge({ label, bg = "#f3f4f6", color = "#374151", size = "sm" }) {
  const p = size === "xs" ? "1px 6px" : "3px 10px";
  const fs = size === "xs" ? 10 : 11;
  return (
    <span style={{ display:"inline-flex", alignItems:"center", padding:p, borderRadius:99,
      background:bg, color, fontSize:fs, fontWeight:700, whiteSpace:"nowrap", lineHeight:1.4 }}>
      {label}
    </span>
  );
}

function VendorDot({ vendor }) {
  const v = VENDOR_COLOR[vendor] || { dot:"#9ca3af", label: vendor };
  return (
    <span style={{ display:"inline-flex", alignItems:"center", gap:5, fontSize:11, color:"#6b7280", fontWeight:600 }}>
      <span style={{ width:8, height:8, borderRadius:"50%", background:v.dot, display:"inline-block" }} />
      {v.label}
    </span>
  );
}

// ── Logo ──────────────────────────────────────────────────────
function UniKingLogo({ size = 26 }) {
  return (
    <span style={{ fontFamily:"'Arial Black',Arial,sans-serif", fontWeight:900, fontSize:size, letterSpacing:-1, lineHeight:1 }}>
      <span style={{ color:"#9ca3af" }}>UNI</span>
      <span style={{ color:"#fff" }}>KING</span>
    </span>
  );
}

// ── Card ──────────────────────────────────────────────────────
function ProductCard({ record, type, onClick }) {
  const tm = TYPE_META[type] || TYPE_META["Elevator Bucket"];
  const vendor = record.vendor || "—";
  const vc = VENDOR_COLOR[vendor] || { dot:"#9ca3af" };

  // Sub-label differs by source
  const sub = record.category           // modular belt
    || record.style                       // bucket
    || "";

  const matField = record.materials || record.material || "—";

  return (
    <div onClick={onClick}
      style={{ background:"#fff", borderRadius:12, border:"1px solid #e5e7eb",
        cursor:"pointer", display:"flex", flexDirection:"column", overflow:"hidden",
        transition:"transform .15s, box-shadow .15s" }}
      onMouseEnter={e => { e.currentTarget.style.transform="translateY(-2px)"; e.currentTarget.style.boxShadow="0 8px 24px rgba(0,0,0,0.10)"; }}
      onMouseLeave={e => { e.currentTarget.style.transform="none"; e.currentTarget.style.boxShadow="none"; }}>

      {/* colour band */}
      <div style={{ height:6, background:`linear-gradient(90deg, ${vc.dot}, ${tm.color})` }} />

      <div style={{ padding:"12px 14px", flex:1, display:"flex", flexDirection:"column", gap:7 }}>
        {/* type + vendor row */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <Badge label={`${tm.icon} ${type}`} bg={tm.bg} color={tm.color} size="xs" />
          <VendorDot vendor={vendor} />
        </div>

        {/* series / name */}
        <div>
          <div style={{ fontSize:13, fontWeight:800, color:NAVY, lineHeight:1.2 }}>
            {record.series || record.name || "—"}
          </div>
          {sub && (
            <div style={{ fontSize:11, color:"#6b7280", marginTop:2 }}>{sub}</div>
          )}
        </div>

        {/* key spec chips */}
        <div style={{ display:"flex", gap:5, flexWrap:"wrap" }}>
          {record.pitch_in    && <Badge label={`${record.pitch_in}" pitch`} bg="#f0f9ff" color="#0369a1" size="xs" />}
          {record.duty        && <Badge label={record.duty}                 bg="#fafafa"  color="#374151" size="xs" />}
          {record.application && <Badge label={record.application}          bg="#f5f3ff"  color="#6d28d9" size="xs" />}
          {record.profile && !["Standard Profile","Hardware","Belting","Continuous Column"].includes(record.profile) &&
            <Badge label={record.profile} bg="#fff7ed" color="#c2410c" size="xs" />}
          {record.open_area   && <Badge label={`${record.open_area} open`}  bg="#f0fdf4"  color="#166534" size="xs" />}
        </div>

        {/* materials */}
        <div style={{ fontSize:11, color:"#6b7280", lineHeight:1.4,
          display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical", overflow:"hidden" }}>
          {matField}
        </div>
      </div>

      <div style={{ padding:"8px 14px", borderTop:"1px solid #f3f4f6",
        display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <span style={{ fontSize:10, color:"#9ca3af" }}>
          {record.page_range ? `pp. ${record.page_range}` : ""}
        </span>
        <span style={{ fontSize:11, color:NAVY, fontWeight:700 }}>View details →</span>
      </div>
    </div>
  );
}

// ── Detail Modal ──────────────────────────────────────────────
function DetailModal({ record, type, onClose }) {
  const [tab, setTab] = useState("overview");
  if (!record) return null;

  const tm = TYPE_META[type] || TYPE_META["Elevator Bucket"];
  const isBelt    = !!record.pitch_in;   // CatalogProduct
  const isBucket  = !!record.duty && !record.pitch_in;

  const specs = isBelt ? [
    ["Series",        record.series],
    ["Category",      record.category],
    ["Style",         record.style],
    ["Pitch",         record.pitch_in ? `${record.pitch_in}" (${record.pitch_mm}mm)` : "—"],
    ["Min Width",     record.min_width_in ? `${record.min_width_in}"` : "—"],
    ["Open Area",     record.open_area || "—"],
    ["Hinge Style",   record.hinge_style || "—"],
    ["Catalog Pages", record.page_range ? `pp. ${record.page_range}` : "—"],
  ] : [
    ["Series",        record.series],
    ["Style",         record.style],
    ["Duty",          record.duty],
    ["Application",   record.application],
    ["Profile",       record.profile],
    ["Discharge",     record.discharge_type],
    ["Color",         record.color || "—"],
    ["Catalog Pages", record.page_range ? `pp. ${record.page_range}` : "—"],
  ];

  const tabs = [
    ["overview", "📋 Overview"],
    ...(isBucket && record.bucket_sizes ? [["sizes", "📏 Sizes"]] : []),
    ...((record.materials || record.material) ? [["materials", "🧪 Materials"]] : []),
    ...((record.belt_data || record.tech_doc_url) ? [["resources", "📎 Resources"]] : []),
  ];

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.55)", zIndex:1000,
      display:"flex", alignItems:"center", justifyContent:"center", padding:16 }} onClick={onClose}>
      <div style={{ background:"#fff", borderRadius:16, width:"100%", maxWidth:660, maxHeight:"93vh",
        overflowY:"auto", display:"flex", flexDirection:"column" }} onClick={e => e.stopPropagation()}>

        {/* Header strip */}
        <div style={{ background:`linear-gradient(135deg, ${NAVY}, #2d5986)`, borderRadius:"16px 16px 0 0",
          padding:"20px 22px 18px", position:"relative" }}>
          <button onClick={onClose} style={{ position:"absolute", top:14, right:14, background:"rgba(255,255,255,0.15)",
            border:"none", borderRadius:"50%", width:32, height:32, cursor:"pointer", color:"#fff", fontSize:16 }}>✕</button>
          <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:10 }}>
            <Badge label={`${tm.icon} ${type}`} bg={tm.bg} color={tm.color} />
            <VendorDot vendor={record.vendor} />
          </div>
          <div style={{ fontSize:22, fontWeight:900, color:"#fff", lineHeight:1.1 }}>
            {record.series}
          </div>
          <div style={{ fontSize:13, color:"rgba(255,255,255,0.7)", marginTop:4 }}>
            {record.style || record.category || ""}
          </div>
        </div>

        {/* Notes */}
        {record.notes && (
          <div style={{ margin:"14px 20px 0", fontSize:13, color:"#374151", lineHeight:1.7,
            padding:"10px 14px", background:"#f8fafc", borderRadius:8, borderLeft:`3px solid ${NAVY}` }}>
            {record.notes}
          </div>
        )}

        {/* Tabs */}
        <div style={{ display:"flex", borderBottom:"2px solid #f3f4f6", margin:"12px 20px 0", gap:0 }}>
          {tabs.map(([id, label]) => (
            <button key={id} onClick={() => setTab(id)}
              style={{ padding:"9px 14px", border:"none", background:"none", cursor:"pointer",
                fontSize:12, fontWeight:700, color: tab===id ? NAVY : "#9ca3af",
                borderBottom: tab===id ? `2px solid ${NAVY}` : "2px solid transparent", marginBottom:-2 }}>
              {label}
            </button>
          ))}
        </div>

        {/* Tab body */}
        <div style={{ padding:"14px 20px", flex:1 }}>
          {tab === "overview" && (
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
              {specs.map(([label, val]) => val && val !== "—" && (
                <div key={label} style={{ padding:"10px 12px", background:"#f8fafc",
                  borderRadius:8, border:"1px solid #f1f5f9" }}>
                  <div style={{ fontSize:10, fontWeight:700, color:"#9ca3af", textTransform:"uppercase",
                    letterSpacing:.5, marginBottom:3 }}>{label}</div>
                  <div style={{ fontSize:13, color:NAVY, fontWeight:700 }}>{val}</div>
                </div>
              ))}
            </div>
          )}

          {tab === "sizes" && record.bucket_sizes && (
            <div>
              <p style={{ fontSize:12, color:"#6b7280", marginBottom:12 }}>
                Sizes shown as <strong>Length × Projection</strong> (inches).
              </p>
              <div style={{ display:"flex", flexWrap:"wrap", gap:7 }}>
                {record.bucket_sizes.split(",").map(s => s.trim()).filter(Boolean).map(sz => (
                  <span key={sz} style={{ padding:"6px 13px", background:NAVY, color:"#fff",
                    borderRadius:7, fontSize:13, fontWeight:700 }}>{sz}"</span>
                ))}
              </div>
            </div>
          )}

          {tab === "materials" && (
            <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
              {(record.materials || record.material || "").split(",").map(m => m.trim()).filter(Boolean).map((m, i) => (
                <div key={i} style={{ padding:"10px 14px", background:"#f8fafc", borderRadius:8,
                  border:"1px solid #e5e7eb", fontSize:13, color:NAVY, fontWeight:600 }}>
                  🧪 {m}
                </div>
              ))}
            </div>
          )}

          {tab === "resources" && (
            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              {record.tech_doc_url && (
                <a href={record.tech_doc_url} target="_blank" rel="noreferrer"
                  style={{ display:"flex", alignItems:"center", gap:10, padding:"12px 16px",
                    background:"#f0f9ff", borderRadius:10, color:"#0369a1", textDecoration:"none",
                    fontWeight:700, fontSize:13 }}>
                  📄 Technical Data Sheet ↗
                </a>
              )}
              {record.cad_url && (
                <a href={record.cad_url} target="_blank" rel="noreferrer"
                  style={{ display:"flex", alignItems:"center", gap:10, padding:"12px 16px",
                    background:"#f0fdf4", borderRadius:10, color:"#166534", textDecoration:"none",
                    fontWeight:700, fontSize:13 }}>
                  📐 CAD Drawing ↗
                </a>
              )}
              {record.belt_data && (
                <div style={{ padding:"12px 16px", background:"#fafafa", borderRadius:10,
                  fontSize:12, color:"#374151", border:"1px solid #e5e7eb" }}>
                  <div style={{ fontWeight:700, marginBottom:6, color:NAVY }}>Belt Performance Data</div>
                  <pre style={{ margin:0, fontFamily:"monospace", fontSize:11, whiteSpace:"pre-wrap" }}>
                    {typeof record.belt_data === "object"
                      ? JSON.stringify(record.belt_data, null, 2)
                      : record.belt_data}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>

        <div style={{ padding:"0 20px 20px" }}>
          <div style={{ fontSize:10, color:"#d1d5db", textAlign:"center" }}>
            Uniking Canada · logistics@unikingcanada.com · No pricing shown — contact for quote
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main Catalog ──────────────────────────────────────────────
export default function Catalog() {
  const [belts,   setBelts]   = useState([]);
  const [buckets, setBuckets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState("");
  const [filterType,    setFilterType]    = useState("All");
  const [filterVendor,  setFilterVendor]  = useState("All");
  const [filterApp,     setFilterApp]     = useState("All");
  const [selected, setSelected] = useState(null);
  const [selectedType, setSelectedType] = useState(null);

  useEffect(() => {
    Promise.all([
      CatalogProduct.list(),
      ElevatorBucket.list(),
    ]).then(([b, bk]) => {
      setBelts(b   || []);
      setBuckets(bk || []);
      setLoading(false);
    });
  }, []);

  // Merge all records into one array with type tag
  const allProducts = useMemo(() => {
    const tagged = [
      ...belts.map(r => ({ ...r, _source:"belt",   _type: getProductType(r,"belt") })),
      ...buckets.map(r => ({ ...r, _source:"bucket", _type: getProductType(r,"bucket") })),
    ];
    return tagged;
  }, [belts, buckets]);

  // Derive filter options
  const types    = useMemo(() => ["All", ...new Set(allProducts.map(p => p._type))], [allProducts]);
  const vendors  = useMemo(() => ["All", ...new Set(allProducts.map(p => p.vendor).filter(Boolean))], [allProducts]);
  const apps     = useMemo(() => ["All", ...new Set(allProducts.map(p => p.application).filter(Boolean))], [allProducts]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return allProducts.filter(p => {
      if (filterType   !== "All" && p._type        !== filterType)   return false;
      if (filterVendor !== "All" && p.vendor        !== filterVendor) return false;
      if (filterApp    !== "All" && p.application   !== filterApp)    return false;
      if (!q) return true;
      return [
        p.series, p.style, p.category, p.materials, p.material,
        p.notes, p.duty, p.application, p.search_tags, p.vendor,
      ].some(v => v?.toLowerCase().includes(q));
    });
  }, [allProducts, search, filterType, filterVendor, filterApp]);

  // Group by product type, then by vendor
  const grouped = useMemo(() => {
    const typeOrder = ["Elevator Bucket","Elevator Belt","Hardware & Accessories","Modular Plastic Belt","Wire Mesh Belt"];
    const map = {};
    for (const p of filtered) {
      if (!map[p._type]) map[p._type] = [];
      map[p._type].push(p);
    }
    return typeOrder.filter(t => map[t]).map(t => [t, map[t]]);
  }, [filtered]);

  const clearAll = () => { setFilterType("All"); setFilterVendor("All"); setFilterApp("All"); setSearch(""); };
  const hasFilters = filterType !== "All" || filterVendor !== "All" || filterApp !== "All" || search;

  const selSt = {
    padding:"7px 12px", borderRadius:8, border:"1px solid rgba(255,255,255,0.2)",
    background:"rgba(255,255,255,0.1)", color:"#fff", fontSize:12, cursor:"pointer",
    appearance:"none", minWidth:130,
  };

  return (
    <div style={{ minHeight:"100vh", background:"#f1f5f9", fontFamily:"system-ui, Arial, sans-serif" }}>

      {/* ── Top header ── */}
      <div style={{ background:NAVY, position:"sticky", top:0, zIndex:500, boxShadow:"0 2px 16px rgba(0,0,0,0.25)" }}>
        <div style={{ maxWidth:1360, margin:"0 auto", padding:"14px 24px",
          display:"flex", alignItems:"center", gap:18, flexWrap:"wrap" }}>

          {/* Logo */}
          <div>
            <UniKingLogo size={26} />
            <div style={{ fontSize:9, color:"rgba(255,255,255,0.35)", letterSpacing:2,
              textTransform:"uppercase", marginTop:1 }}>PRODUCT CATALOG</div>
          </div>

          <div style={{ width:1, height:36, background:"rgba(255,255,255,0.15)", flexShrink:0 }} />

          {/* Vendor legend */}
          <div style={{ display:"flex", gap:14 }}>
            {Object.entries(VENDOR_COLOR).map(([name, v]) => (
              <span key={name} style={{ display:"flex", alignItems:"center", gap:5,
                fontSize:11, color:"rgba(255,255,255,0.7)", fontWeight:600, cursor:"pointer" }}
                onClick={() => setFilterVendor(filterVendor === name ? "All" : name)}>
                <span style={{ width:8, height:8, borderRadius:"50%", background:v.dot }} />
                {v.label}
              </span>
            ))}
          </div>

          {/* Search */}
          <div style={{ flex:1, minWidth:180, position:"relative" }}>
            <span style={{ position:"absolute", left:10, top:"50%", transform:"translateY(-50%)",
              color:"rgba(255,255,255,0.4)", fontSize:14 }}>🔍</span>
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search series, material, application…"
              style={{ width:"100%", padding:"8px 14px 8px 32px", borderRadius:8, border:"none",
                fontSize:13, outline:"none", background:"rgba(255,255,255,0.12)", color:"#fff",
                boxSizing:"border-box" }} />
          </div>

          <div style={{ fontSize:12, color:"rgba(255,255,255,0.4)", whiteSpace:"nowrap" }}>
            {filtered.length} / {allProducts.length} products
          </div>
        </div>

        {/* ── Filter bar ── */}
        <div style={{ borderTop:"1px solid rgba(255,255,255,0.08)", padding:"10px 24px",
          maxWidth:1360, margin:"0 auto", display:"flex", gap:10, flexWrap:"wrap", alignItems:"center" }}>

          <span style={{ fontSize:10, color:"rgba(255,255,255,0.35)", fontWeight:700,
            textTransform:"uppercase", letterSpacing:1 }}>Filter:</span>

          {/* Product type — PRIMARY filter, shown as chips */}
          {types.map(t => {
            const tm = TYPE_META[t];
            const active = filterType === t;
            return (
              <button key={t} onClick={() => setFilterType(active ? "All" : t)}
                style={{ padding:"6px 13px", borderRadius:99, border:"none", cursor:"pointer",
                  fontSize:11, fontWeight:700, transition:"all .15s",
                  background: active ? "#fff" : "rgba(255,255,255,0.1)",
                  color: active ? NAVY : "rgba(255,255,255,0.7)" }}>
                {tm ? `${tm.icon} ${t}` : t}
              </button>
            );
          })}

          <div style={{ width:1, height:20, background:"rgba(255,255,255,0.15)" }} />

          {/* Supplier */}
          <select value={filterVendor} onChange={e => setFilterVendor(e.target.value)} style={selSt}>
            {vendors.map(v => <option key={v} style={{ color:"#000" }}>{v === "All" ? "All Suppliers" : v}</option>)}
          </select>

          {/* Application */}
          <select value={filterApp} onChange={e => setFilterApp(e.target.value)} style={selSt}>
            {apps.map(a => <option key={a} style={{ color:"#000" }}>{a === "All" ? "All Applications" : a}</option>)}
          </select>

          {hasFilters && (
            <button onClick={clearAll}
              style={{ padding:"6px 12px", background:"rgba(255,255,255,0.08)", color:"rgba(255,255,255,0.6)",
                border:"1px solid rgba(255,255,255,0.15)", borderRadius:7, fontSize:11, cursor:"pointer" }}>
              Clear all ×
            </button>
          )}
        </div>
      </div>

      {/* ── Product grid ── */}
      <div style={{ maxWidth:1360, margin:"0 auto", padding:"28px 24px" }}>
        {loading ? (
          <div style={{ textAlign:"center", padding:100, color:"#9ca3af", fontSize:16 }}>
            Loading catalog…
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign:"center", padding:100 }}>
            <div style={{ fontSize:48, marginBottom:12 }}>🔍</div>
            <div style={{ fontSize:16, fontWeight:700, color:"#374151" }}>No products match your filters</div>
            <button onClick={clearAll} style={{ marginTop:16, padding:"10px 22px", background:NAVY,
              color:"#fff", border:"none", borderRadius:8, cursor:"pointer", fontSize:13, fontWeight:700 }}>
              Clear filters
            </button>
          </div>
        ) : (
          grouped.map(([type, items]) => {
            const tm = TYPE_META[type] || {};
            return (
              <div key={type} style={{ marginBottom:44 }}>
                {/* Section header */}
                <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:18 }}>
                  <div style={{ width:4, height:28, borderRadius:2, background:tm.color || NAVY }} />
                  <div>
                    <div style={{ fontSize:18, fontWeight:900, color:NAVY }}>
                      {tm.icon} {type}
                    </div>
                    <div style={{ fontSize:11, color:"#9ca3af", marginTop:1 }}>
                      {items.length} product{items.length !== 1 ? "s" : ""}
                      {" · "}
                      {[...new Set(items.map(p => p.vendor))].join(", ")}
                    </div>
                  </div>
                </div>

                <div style={{ display:"grid",
                  gridTemplateColumns:"repeat(auto-fill, minmax(240px, 1fr))", gap:14 }}>
                  {items.map(p => (
                    <ProductCard key={p.id} record={p} type={type}
                      onClick={() => { setSelected(p); setSelectedType(type); }} />
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer */}
      <div style={{ maxWidth:1360, margin:"0 auto", padding:"0 24px 36px",
        fontSize:11, color:"#9ca3af", textAlign:"center" }}>
        Uniking Canada · 12985 Rue Brault, Mirabel, QC J7J 0W2 · logistics@unikingcanada.com<br />
        For reference only — no pricing displayed. Contact Uniking for availability and quotation.
      </div>

      {selected && (
        <DetailModal record={selected} type={selectedType}
          onClose={() => { setSelected(null); setSelectedType(null); }} />
      )}
    </div>
  );
}
