import { useState, useEffect, useMemo } from "react";
import { ElevatorBucket } from "@/api/entities";

const NAVY = "#1a3a5c";
const ML_RED = "#c0392b";
const ML_ORANGE = "#e67e22";

const APP_ICONS = { Agricultural: "🌾", Industrial: "🏭", "Agricultural/Industrial": "🌾🏭" };
const DUTY_COLORS = {
  "Maximum Duty": { bg: "#fee2e2", text: "#991b1b" },
  "Heavy Duty":   { bg: "#fef3c7", text: "#92400e" },
  "Standard Duty":{ bg: "#f0fdf4", text: "#166534" },
};
const MAT_COLORS = {
  "Polyethylene (HDPE)": { bg: "#dbeafe", text: "#1e40af", abbr: "HDPE" },
  "Nylon":               { bg: "#f3e8ff", text: "#6b21a8", abbr: "NY" },
  "Urethane":            { bg: "#ffedd5", text: "#9a3412", abbr: "UR" },
  "Ductile Iron":        { bg: "#f1f5f9", text: "#334155", abbr: "DI" },
  "Welded Steel":        { bg: "#e2e8f0", text: "#475569", abbr: "WS" },
  "Polyethylene / Nylon / Urethane": { bg: "#ede9fe", text: "#5b21b6", abbr: "3-Mat" },
};
const getMC = (mat) => {
  const key = Object.keys(MAT_COLORS).find(k => mat?.includes(k.split(" ")[0]));
  return key ? MAT_COLORS[key] : { bg: "#f3f4f6", text: "#374151", abbr: mat?.substring(0,4) || "?" };
};

function Badge({ label, color = "#e5e7eb", textColor = "#374151", small }) {
  return (
    <span style={{ display: "inline-block", padding: small ? "1px 6px" : "3px 9px", borderRadius: 99,
      background: color, color: textColor, fontSize: small ? 10 : 11, fontWeight: 600, whiteSpace: "nowrap" }}>
      {label}
    </span>
  );
}

function UniKingLogo({ size = 26 }) {
  return (
    <div style={{ display: "flex", alignItems: "center", lineHeight: 1 }}>
      <span style={{ fontSize: size, fontWeight: 900, color: "#9ca3af", letterSpacing: -1, fontFamily: "'Arial Black',Arial,sans-serif" }}>UNI</span>
      <span style={{ fontSize: size, fontWeight: 900, color: "#fff", letterSpacing: -1, fontFamily: "'Arial Black',Arial,sans-serif" }}>KING</span>
    </div>
  );
}

function MaxiLiftLogo({ size = 18 }) {
  return (
    <span style={{ fontFamily: "'Arial Black',Arial,sans-serif", fontWeight: 900, fontSize: size,
      letterSpacing: -0.5, color: ML_RED }}>
      MAXI<span style={{ color: "#333" }}>-</span>LIFT
    </span>
  );
}

function BucketImage({ series, color, style: bStyle }) {
  // Placeholder with series name and color coding
  const bg = color === "Orange" ? "#f97316" : color === "Red" ? "#ef4444" : "#64748b";
  const icon = series?.includes("TIGER") ? "🐯" : series?.includes("MAXI") ? "💪" : series?.includes("DI-MAX") ? "⚙️" : series?.includes("Steel") ? "🔩" : "🪣";
  return (
    <div style={{ width: "100%", height: "100%", background: `linear-gradient(135deg, ${bg}22, ${bg}44)`,
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      gap: 6, border: `2px solid ${bg}44` }}>
      <div style={{ fontSize: 36 }}>{icon}</div>
      <div style={{ fontSize: 11, fontWeight: 800, color: bg, textAlign: "center", padding: "0 8px", letterSpacing: 0.3 }}>
        {series}
      </div>
      {color && (
        <div style={{ width: 20, height: 20, borderRadius: "50%", background: bg, boxShadow: `0 0 0 2px white, 0 0 0 3px ${bg}` }} />
      )}
    </div>
  );
}

// ── Product Detail Modal ────────────────────────────────────────
function BucketModal({ product, onClose }) {
  const [tab, setTab] = useState("specs");
  if (!product) return null;

  const dc = DUTY_COLORS[product.duty] || { bg: "#f3f4f6", text: "#374151" };
  const mc = getMC(product.material);
  const sizes = product.bucket_sizes ? product.bucket_sizes.split(",").map(s => s.trim()) : [];
  const materials = product.material?.includes("/")
    ? product.material.split("/").map(m => m.trim())
    : [product.material];

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", zIndex: 1000,
      display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }} onClick={onClose}>
      <div style={{ background: "#fff", borderRadius: 16, width: "100%", maxWidth: 640, maxHeight: "94vh",
        overflowY: "auto", display: "flex", flexDirection: "column" }} onClick={e => e.stopPropagation()}>

        {/* Hero */}
        <div style={{ height: 200, position: "relative", borderRadius: "16px 16px 0 0", overflow: "hidden", flexShrink: 0 }}>
          <BucketImage series={product.series} color={product.color} style={product.style} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(10,20,40,0.9) 0%, rgba(10,20,40,0.0) 55%)" }} />
          <button onClick={onClose} style={{ position: "absolute", top: 12, right: 12, background: "rgba(0,0,0,0.4)",
            border: "none", borderRadius: "50%", width: 34, height: 34, cursor: "pointer", color: "#fff", fontSize: 16,
            display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
          <div style={{ position: "absolute", top: 12, left: 14, background: "rgba(255,255,255,0.95)", borderRadius: 7, padding: "4px 10px" }}>
            <MaxiLiftLogo size={14} />
          </div>
          <div style={{ position: "absolute", bottom: 14, left: 18, right: 18 }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: "#fff", lineHeight: 1.1 }}>{product.series}</div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.8)", marginTop: 3 }}>{product.style}</div>
          </div>
        </div>

        {/* Badges */}
        <div style={{ display: "flex", gap: 7, flexWrap: "wrap", padding: "12px 18px 0" }}>
          <Badge label={`${APP_ICONS[product.application] || ""} ${product.application}`} color="#f5f3ff" textColor="#6d28d9" />
          <Badge label={product.duty} color={dc.bg} textColor={dc.text} />
          <Badge label={mc.abbr} color={mc.bg} textColor={mc.text} />
          {product.discharge_type && <Badge label={product.discharge_type} color="#f0fdf4" textColor="#166534" />}
        </div>

        {/* Notes */}
        {product.notes && (
          <div style={{ margin: "10px 18px 0", fontSize: 13, color: "#374151", lineHeight: 1.65,
            padding: "10px 14px", background: "#f8fafc", borderRadius: 8, borderLeft: `3px solid ${NAVY}` }}>
            {product.notes}
          </div>
        )}

        {/* Tabs */}
        <div style={{ display: "flex", borderBottom: "2px solid #f3f4f6", margin: "12px 18px 0", gap: 0 }}>
          {[["specs", "📐 Specs"], ["sizes", `📏 Sizes (${sizes.length})`], ["materials", "🧪 Materials"]].map(([id, label]) => (
            <button key={id} onClick={() => setTab(id)} style={{ padding: "9px 15px", border: "none", background: "none",
              cursor: "pointer", fontSize: 12, fontWeight: 700,
              color: tab === id ? NAVY : "#9ca3af",
              borderBottom: tab === id ? `2px solid ${NAVY}` : "2px solid transparent",
              marginBottom: -2 }}>{label}</button>
          ))}
        </div>

        {/* Tab content */}
        <div style={{ padding: "14px 18px", flex: 1 }}>
          {tab === "specs" && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {[
                ["Vendor", product.vendor],
                ["Series", product.series],
                ["Duty Level", product.duty],
                ["Application", product.application],
                ["Profile", product.profile || "Standard"],
                ["Discharge Type", product.discharge_type || "—"],
                ["Bucket Color", product.color || "—"],
                ["Catalog Pages", product.page_range ? `pp. ${product.page_range}` : "—"],
              ].map(([l, v]) => (
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
                All sizes shown as <strong>Length × Projection</strong> (inches). Contact Uniking for full dimensional specs.
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
                {sizes.map(sz => (
                  <span key={sz} style={{ padding: "6px 12px", background: NAVY, color: "#fff",
                    borderRadius: 7, fontSize: 13, fontWeight: 700, letterSpacing: 0.3 }}>
                    {sz}"
                  </span>
                ))}
              </div>
              {sizes.length === 0 && <div style={{ color: "#9ca3af", fontStyle: "italic" }}>Contact Uniking for available sizes.</div>}
            </div>
          )}

          {tab === "materials" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {materials.map((mat, i) => {
                const info = getMC(mat.trim());
                return (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px",
                    borderRadius: 8, background: info.bg, border: `1px solid ${info.text}22` }}>
                    <div style={{ minWidth: 36, height: 36, borderRadius: 6, background: info.text, color: "#fff",
                      display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 800 }}>
                      {info.abbr}
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: info.text }}>{mat.trim()}</div>
                      <div style={{ fontSize: 11, color: info.text + "99", marginTop: 2 }}>
                        {mat.includes("Polyethylene") && "Food grade applications · general purpose"}
                        {mat.includes("Nylon") && "Hot, abrasive applications · elevated temperatures"}
                        {mat.includes("Urethane") && "Sticky, abrasive applications · high impact"}
                        {mat.includes("Ductile Iron") && "Maximum strength · heavy industrial applications"}
                        {mat.includes("Welded Steel") && "Fabricated steel · heavy industrial applications"}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div style={{ fontSize: 10, color: "#9ca3af", fontStyle: "italic", marginTop: 4 }}>
                Contact Uniking Canada for material selection guidance and availability.
              </div>
            </div>
          )}
        </div>

        {/* CTA */}
        <div style={{ padding: "0 18px 18px" }}>
          <a href="https://www.maxilift.com" target="_blank" rel="noreferrer"
            style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              padding: "10px", background: ML_RED, color: "#fff", borderRadius: 8,
              fontSize: 13, fontWeight: 700, textDecoration: "none" }}>
            🌐 View on maxilift.com ↗
          </a>
        </div>
      </div>
    </div>
  );
}

// ── Product Card ────────────────────────────────────────────────
function BucketCard({ product, onClick }) {
  const dc = DUTY_COLORS[product.duty] || { bg: "#f3f4f6", text: "#374151" };
  const mc = getMC(product.material);
  const sizeCount = product.bucket_sizes ? product.bucket_sizes.split(",").length : 0;

  return (
    <div onClick={onClick} style={{ background: "#fff", borderRadius: 12, border: "1px solid #e5e7eb",
      overflow: "hidden", cursor: "pointer", display: "flex", flexDirection: "column",
      transition: "transform 0.15s, box-shadow 0.15s" }}
      onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 6px 20px rgba(0,0,0,0.12)"; }}
      onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; }}>

      {/* Image area */}
      <div style={{ height: 120, position: "relative", overflow: "hidden" }}>
        <BucketImage series={product.series} color={product.color} />
        <div style={{ position: "absolute", top: 8, left: 8 }}>
          <Badge label={product.application} color="rgba(255,255,255,0.92)" textColor={NAVY} small />
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: "12px 14px", flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 800, color: ML_RED, letterSpacing: 0.5 }}>{product.series}</div>
          <div style={{ fontSize: 13, fontWeight: 700, color: NAVY, marginTop: 2, lineHeight: 1.2 }}>{product.style}</div>
        </div>
        <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
          <Badge label={product.duty} color={dc.bg} textColor={dc.text} small />
          <Badge label={mc.abbr} color={mc.bg} textColor={mc.text} small />
        </div>
        {product.notes && (
          <div style={{ fontSize: 11, color: "#6b7280", lineHeight: 1.4,
            display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
            {product.notes}
          </div>
        )}
      </div>

      <div style={{ padding: "8px 14px", borderTop: "1px solid #f3f4f6",
        display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: 10, color: "#9ca3af" }}>📏 {sizeCount} sizes available</span>
        <span style={{ fontSize: 11, color: NAVY, fontWeight: 700 }}>View →</span>
      </div>
    </div>
  );
}

// ── Main App ────────────────────────────────────────────────────
export default function ElevatorBuckets() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterApp, setFilterApp] = useState("All");
  const [filterDuty, setFilterDuty] = useState("All");
  const [filterMat, setFilterMat] = useState("All");
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    ElevatorBucket.list().then(data => { setProducts(data || []); setLoading(false); });
  }, []);

  const applications = useMemo(() => ["All", ...new Set(products.map(p => p.application).filter(Boolean))], [products]);
  const duties = useMemo(() => ["All", "Maximum Duty", "Heavy Duty", "Standard Duty"], []);
  const materials = useMemo(() => ["All", "Polyethylene (HDPE)", "Nylon", "Urethane", "Ductile Iron", "Welded Steel"], []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return products.filter(p => {
      if (filterApp !== "All" && p.application !== filterApp) return false;
      if (filterDuty !== "All" && p.duty !== filterDuty) return false;
      if (filterMat !== "All" && !p.material?.includes(filterMat.split(" ")[0])) return false;
      if (!q) return true;
      return [p.series, p.style, p.material, p.notes, p.duty, p.application, p.search_tags]
        .some(v => v?.toLowerCase().includes(q));
    });
  }, [products, search, filterApp, filterDuty, filterMat]);

  // Group by series
  const grouped = useMemo(() => {
    const map = {};
    for (const p of filtered) {
      if (!map[p.series]) map[p.series] = [];
      map[p.series].push(p);
    }
    return Object.entries(map);
  }, [filtered]);

  const selSt = { padding: "7px 12px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.2)",
    background: "rgba(255,255,255,0.1)", color: "#fff", fontSize: 12, cursor: "pointer" };

  return (
    <div style={{ minHeight: "100vh", background: "#f1f5f9", fontFamily: "system-ui, Arial, sans-serif" }}>

      {/* Header */}
      <div style={{ background: NAVY, position: "sticky", top: 0, zIndex: 500, boxShadow: "0 2px 12px rgba(0,0,0,0.2)" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "14px 24px",
          display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
          <div>
            <UniKingLogo size={24} />
            <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", letterSpacing: 2, textTransform: "uppercase", marginTop: 2 }}>
              PRODUCT CATALOG
            </div>
          </div>
          <div style={{ width: 1, height: 36, background: "rgba(255,255,255,0.2)", flexShrink: 0 }} />
          <div>
            <MaxiLiftLogo size={16} />
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", marginTop: 2 }}>Elevator Buckets & Accessories</div>
          </div>
          <div style={{ flex: 1, minWidth: 180 }}>
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search series, material, application…"
              style={{ width: "100%", padding: "8px 14px", borderRadius: 8, border: "none",
                fontSize: 13, outline: "none", background: "rgba(255,255,255,0.12)", color: "#fff", boxSizing: "border-box" }} />
          </div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", whiteSpace: "nowrap" }}>
            {filtered.length} of {products.length}
          </div>
        </div>

        {/* Filters */}
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.1)", padding: "10px 24px",
          maxWidth: 1280, margin: "0 auto", display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", fontWeight: 600, textTransform: "uppercase", letterSpacing: 1 }}>Filter:</span>
          <select value={filterApp} onChange={e => setFilterApp(e.target.value)} style={selSt}>
            {applications.map(a => <option key={a} style={{ color: "#000" }}>{a === "All" ? "All Applications" : a}</option>)}
          </select>
          <select value={filterDuty} onChange={e => setFilterDuty(e.target.value)} style={selSt}>
            {duties.map(d => <option key={d} style={{ color: "#000" }}>{d === "All" ? "All Duty Levels" : d}</option>)}
          </select>
          <select value={filterMat} onChange={e => setFilterMat(e.target.value)} style={selSt}>
            {materials.map(m => <option key={m} style={{ color: "#000" }}>{m === "All" ? "All Materials" : m}</option>)}
          </select>
          {(filterApp !== "All" || filterDuty !== "All" || filterMat !== "All" || search) && (
            <button onClick={() => { setFilterApp("All"); setFilterDuty("All"); setFilterMat("All"); setSearch(""); }}
              style={{ padding: "7px 12px", background: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.7)",
                border: "1px solid rgba(255,255,255,0.2)", borderRadius: 7, fontSize: 12, cursor: "pointer" }}>
              Clear ×
            </button>
          )}
        </div>
      </div>

      {/* Grid */}
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "24px" }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: 80, color: "#9ca3af", fontSize: 16 }}>Loading catalog…</div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: 80 }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🪣</div>
            <div style={{ fontSize: 16, color: "#6b7280", fontWeight: 600 }}>No products found</div>
          </div>
        ) : (
          grouped.map(([series, items]) => (
            <div key={series} style={{ marginBottom: 36 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                <div style={{ fontSize: 15, fontWeight: 800, color: NAVY }}>{series}</div>
                <div style={{ fontSize: 11, fontWeight: 800, color: ML_RED }}>{items[0]?.duty}</div>
                <div style={{ fontSize: 11, color: "#9ca3af" }}>· {items.length} variant{items.length !== 1 ? "s" : ""}</div>
                <div style={{ flex: 1, height: 1, background: "#e5e7eb", marginLeft: 8 }} />
                <div style={{ fontSize: 10, color: "#9ca3af" }}>{APP_ICONS[items[0]?.application]} {items[0]?.application}</div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 14 }}>
                {items.map(p => (
                  <BucketCard key={p.id} product={p} onClick={() => setSelected(p)} />
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer note */}
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 24px 32px", fontSize: 11, color: "#9ca3af", textAlign: "center" }}>
        Maxi-Lift® is a registered trademark of Maxi-Lift, Inc. · 16400 Midway Rd, Dallas, TX · maxilift.com · 1-800-527-0657<br />
        Distributed by Uniking Canada · 12985 Rue Brault, Mirabel, QC J7J 0W2 · logistics@unikingcanada.com
      </div>

      {selected && <BucketModal product={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
