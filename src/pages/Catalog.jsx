// v2 - images + belt data + sorted series
import { useState, useEffect, useMemo } from "react";
import { UniCatalog } from "@/api/entities";
import { CatalogProduct } from "@/api/entities";
import { ElevatorBucket } from "@/api/entities";
import { MacChainProduct } from "@/api/entities";

const NAVY = "#1a3a5c";

const TYPE_META = {
  "Elevator Bucket":        { color: "#b45309", bg: "#fef3c7" },
  "Elevator Belt":          { color: "#7c3aed", bg: "#ede9fe" },
  "Hardware & Accessories": { color: "#92400e", bg: "#fef9c3" },
  "Modular Plastic Belt":   { color: "#065f46", bg: "#d1fae5" },
  "Wire Mesh Belt":         { color: "#1e40af", bg: "#dbeafe" },
  "Steel Hinged Belt":      { color: "#374151", bg: "#f3f4f6" },
  "Table Top Chain":        { color: "#0e7490", bg: "#cffafe" },
  "ANSI/BS Chain":          { color: "#4338ca", bg: "#e0e7ff" },
  "ANSI Roller Chain":      { color: "#3730a3", bg: "#e0e7ff" },
  "ANSI Roller Chain Attachments": { color: "#6d28d9", bg: "#ede9fe" },
  "Cast Chain":             { color: "#7f1d1d", bg: "#fee2e2" },
  "Engineered Chain":       { color: "#1d4ed8", bg: "#dbeafe" },
  "Forged Chain":           { color: "#92400e", bg: "#ffedd5" },
  "Welded Steel Chain":     { color: "#374151", bg: "#f1f5f9" },
  "Overhead Chain":         { color: "#0f766e", bg: "#ccfbf1" },
  "Sharptop Chain":         { color: "#166534", bg: "#dcfce7" },
  "Thermoforming Chain":    { color: "#9333ea", bg: "#f3e8ff" },
  "Kiln Chain":             { color: "#c2410c", bg: "#ffedd5" },
  "Conveyor Roller":        { color: "#0369a1", bg: "#e0f2fe" },
  "Magnetic Conveyor":      { color: "#be185d", bg: "#fce7f3" },
  "Monitoring System":      { color: "#047857", bg: "#d1fae5" },
};

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

function BeltDataTable({ beltData }) {
  if (!beltData) return null;
  let rows = [];
  try { rows = typeof beltData === "string" ? JSON.parse(beltData) : beltData; } catch { return null; }
  if (!rows.length) return null;

  const cols = [
    { key: "material", label: "Material" },
    { key: "strength_lbf", label: "Strength (lbf)" },
    { key: "strength_nm", label: "Strength (N/m)" },
    { key: "temp_min_f", label: "Min Temp (°F)" },
    { key: "temp_max_f", label: "Max Temp (°F)" },
    { key: "mass_lbft2", label: "Mass (lb/ft²)" },
    { key: "mass_kgm2", label: "Mass (kg/m²)" },
  ].filter(c => rows.some(r => r[c.key] != null && r[c.key] !== ""));

  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
        <thead>
          <tr style={{ background: NAVY }}>
            {cols.map(c => (
              <th key={c.key} style={{ padding: "8px 10px", color: "#fff", fontWeight: 700,
                textAlign: "left", whiteSpace: "nowrap", fontSize: 11 }}>{c.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} style={{ background: i % 2 === 0 ? "#f8fafc" : "#fff", borderBottom: "1px solid #e5e7eb" }}>
              {cols.map(c => (
                <td key={c.key} style={{ padding: "7px 10px", color: c.key === "material" ? NAVY : "#374151",
                  fontWeight: c.key === "material" ? 700 : 400, whiteSpace: "nowrap" }}>
                  {row[c.key] != null ? String(row[c.key]) : "—"}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Card({ rec, type, onClick }) {
  const tm = TYPE_META[type] || { color: NAVY, bg: "#f3f4f6" };
  const hasImage = !!rec.image_url;

  return (
    <div onClick={onClick}
      style={{ background: "#fff", borderRadius: 12, border: "1px solid #e5e7eb",
        cursor: "pointer", display: "flex", flexDirection: "column", overflow: "hidden",
        transition: "transform .15s, box-shadow .15s" }}
      onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 6px 20px rgba(0,0,0,.10)"; }}
      onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; }}>

      <div style={{ height: 4, background: `linear-gradient(90deg,${tm.color},${tm.color}66)` }} />

      {/* Product Image */}
      {hasImage && (
        <div style={{ background: "#f8fafc", borderBottom: "1px solid #f1f5f9",
          display: "flex", alignItems: "center", justifyContent: "center", height: 130, overflow: "hidden" }}>
          <img src={rec.image_url} alt={rec.series}
            style={{ maxHeight: 120, maxWidth: "100%", objectFit: "contain", padding: "8px" }}
            onError={e => { e.target.style.display = "none"; }} />
        </div>
      )}

      <div style={{ padding: "12px 14px", flex: 1, display: "flex", flexDirection: "column", gap: 5 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 6 }}>
          <Badge label={type} bg={tm.bg} color={tm.color} xs />
          {rec.pitch_in && (
            <span style={{ fontSize: 10, color: "#9ca3af" }}>{rec.pitch_in}" pitch</span>
          )}
        </div>

        <div style={{ fontSize: 13, fontWeight: 800, color: NAVY, lineHeight: 1.25 }}>
          {rec.series || rec.name || "—"}
        </div>
        {(rec.style || rec.category) && (
          <div style={{ fontSize: 11, color: "#6b7280" }}>{rec.style || rec.category}</div>
        )}

        <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
          {rec.hinge_style && <Badge label={rec.hinge_style} bg="#f9fafb" color="#374151" xs />}
          {rec.open_area && rec.open_area !== "0%" && <Badge label={`${rec.open_area} open`} bg="#f0fdf4" color="#15803d" xs />}
          {rec.duty && !rec.hinge_style && <Badge label={rec.duty} bg="#f9fafb" color="#374151" xs />}
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

function MacSpecTable({ headers, rows }) {
  if (!headers || !rows || !headers.length) return null;
  let parsedHeaders = headers, parsedRows = rows;
  try { if (typeof headers === "string") parsedHeaders = JSON.parse(headers); } catch {}
  try { if (typeof rows === "string") parsedRows = JSON.parse(rows); } catch {}
  if (!parsedHeaders.length || !parsedRows.length) return null;
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
        <thead>
          <tr style={{ background: NAVY }}>
            {parsedHeaders.map((h, i) => (
              <th key={i} style={{ padding: "8px 10px", color: "#fff", fontWeight: 700,
                textAlign: "left", whiteSpace: "nowrap", fontSize: 11 }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {parsedRows.map((row, i) => (
            <tr key={i} style={{ background: i % 2 === 0 ? "#f8fafc" : "#fff", borderBottom: "1px solid #e5e7eb" }}>
              {(Array.isArray(row) ? row : parsedHeaders.map(h => row[h])).map((cell, j) => (
                <td key={j} style={{ padding: "7px 10px", color: j === 0 ? NAVY : "#374151",
                  fontWeight: j === 0 ? 700 : 400, whiteSpace: "nowrap" }}>
                  {cell != null ? String(cell) : "—"}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Modal({ rec, type, onClose }) {
  const [tab, setTab] = useState("overview");
  if (!rec) return null;
  const tm = TYPE_META[type] || { color: NAVY, bg: "#f3f4f6" };

  const isIntralox = !!rec.pitch_in;
  const isBucket = type === "Elevator Bucket";
  const isMac = rec._src === "mac";

  let beltRows = [];
  if (rec.belt_data) {
    try { beltRows = typeof rec.belt_data === "string" ? JSON.parse(rec.belt_data) : rec.belt_data; } catch {}
  }
  const hasBeltData = beltRows.length > 0;

  let parsedSpecs = null;
  if (rec.key_specs) { try { parsedSpecs = JSON.parse(rec.key_specs); } catch {} }

  const matStr = rec.materials || rec.material || "";
  const mats = matStr.split(/[,/]/).map(m => m.trim()).filter(Boolean);

  const specs = isIntralox ? [
    ["Series", rec.series], ["Category", rec.category], ["Style", rec.style],
    ["Pitch", rec.pitch_in ? `${rec.pitch_in}" (${rec.pitch_mm}mm)` : "—"],
    ["Min Width", rec.min_width_in ? `${rec.min_width_in}"` : "—"],
    ["Open Area", rec.open_area], ["Hinge Style", rec.hinge_style],
    ["Pages", rec.page_range ? `pp. ${rec.page_range}` : "—"],
  ] : isMac ? [] : [
    ["Series", rec.series], ["Style", rec.style || rec.category],
    ["Vendor", rec.vendor], ["Duty", rec.duty],
    ["Application", rec.application],
    ["Model / Part No.", rec.model_code],
    ["Sizes Available", rec.sizes_available],
    ["Pages", rec.page_range ? `pp. ${rec.page_range}` : "—"],
  ];

  const hasMacSpecs = isMac && rec.basic_headers && rec.basic_rows;
  const hasMacMore = isMac && rec.more_headers && rec.more_rows;

  const tabs = [
    hasMacSpecs ? ["macspecs", "Specifications"] : ["overview", "Specs"],
    hasMacMore && ["macmore", "More Specs"],
    mats.length > 0 && !isMac && ["materials", "Materials"],
    hasBeltData && ["beltdata", "Belt Data"],
    parsedSpecs && ["keyspecs", "Key Specs"],
    isBucket && rec.bucket_sizes && ["sizes", "Sizes"],
    (rec.catalog_url || rec.tech_doc_url || rec.cad_url) && ["resources", "Resources"],
  ].filter(Boolean);

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.55)", zIndex: 1000,
      display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }} onClick={onClose}>
      <div style={{ background: "#fff", borderRadius: 16, width: "100%", maxWidth: 700,
        maxHeight: "93vh", overflowY: "auto" }} onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div style={{ background: `linear-gradient(135deg,${NAVY},#2d5986)`,
          borderRadius: "16px 16px 0 0", padding: "20px 22px 16px", position: "relative" }}>
          <button onClick={onClose} style={{ position: "absolute", top: 12, right: 14,
            background: "rgba(255,255,255,.15)", border: "none", borderRadius: "50%",
            width: 32, height: 32, cursor: "pointer", color: "#fff", fontSize: 16 }}>✕</button>

          <div style={{ display: "flex", gap: 8, marginBottom: 10, flexWrap: "wrap" }}>
            <Badge label={type} bg={tm.bg} color={tm.color} />
            {rec.vendor && <Badge label={rec.vendor} bg="rgba(255,255,255,.15)" color="#fff" />}
          </div>

          <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
            {rec.image_url && (
              <div style={{ background: "rgba(255,255,255,.1)", borderRadius: 10, padding: 8,
                flexShrink: 0, width: 120, height: 90, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <img src={rec.image_url} alt={rec.series}
                  style={{ maxWidth: 110, maxHeight: 80, objectFit: "contain" }}
                  onError={e => { e.target.parentElement.style.display = "none"; }} />
              </div>
            )}
            <div>
              <div style={{ fontSize: 21, fontWeight: 900, color: "#fff", lineHeight: 1.15 }}>{isMac ? (rec.part_number || rec.series) : rec.series}</div>
              {(rec.style || rec.category) && (
                <div style={{ fontSize: 13, color: "rgba(255,255,255,.65)", marginTop: 4 }}>{rec.style || rec.category}</div>
              )}
              <div style={{ display: "flex", gap: 6, marginTop: 8, flexWrap: "wrap" }}>
                {rec.pitch_in && <Badge label={`${rec.pitch_in}" pitch`} bg="rgba(255,255,255,.15)" color="#fff" />}
                {rec.hinge_style && <Badge label={rec.hinge_style} bg="rgba(255,255,255,.15)" color="#fff" />}
                {rec.open_area && <Badge label={`${rec.open_area} open`} bg="rgba(255,255,255,.15)" color="#fff" />}
              </div>
            </div>
          </div>
        </div>

        {/* Notes */}
        {(rec.notes || rec.description) && (
          <div style={{ margin: "14px 20px 0", fontSize: 13, color: "#374151", lineHeight: 1.7,
            padding: "10px 14px", background: "#f8fafc", borderRadius: 8, borderLeft: `3px solid ${tm.color}` }}>
            {rec.notes || rec.description}
          </div>
        )}

        {/* Features */}
        {rec.features && (
          <div style={{ margin: "10px 20px 0" }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>Features</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {(Array.isArray(rec.features) ? rec.features : rec.features.split(";")).map((f, i) => f && f.trim() && (
                <span key={i} style={{ fontSize: 11, padding: "3px 9px", borderRadius: 99,
                  background: tm.bg, color: tm.color, fontWeight: 600 }}>✓ {typeof f === "string" ? f.trim() : f}</span>
              ))}
            </div>
          </div>
        )}

        {/* Tabs */}
        <div style={{ display: "flex", borderBottom: "2px solid #f3f4f6", margin: "14px 20px 0", overflowX: "auto" }}>
          {tabs.map(([id, label]) => (
            <button key={id} onClick={() => setTab(id)}
              style={{ padding: "8px 14px", border: "none", background: "none", cursor: "pointer",
                fontSize: 12, fontWeight: 700, whiteSpace: "nowrap",
                color: tab === id ? tm.color : "#9ca3af",
                borderBottom: tab === id ? `2px solid ${tm.color}` : "2px solid transparent", marginBottom: -2 }}>
              {label}
            </button>
          ))}
        </div>

        <div style={{ padding: "16px 20px 24px" }}>

          {/* Mac Specs */}
          {tab === "macspecs" && (
            <MacSpecTable headers={rec.basic_headers} rows={rec.basic_rows} />
          )}
          {tab === "macmore" && (
            <MacSpecTable headers={rec.more_headers} rows={rec.more_rows} />
          )}

          {/* Overview */}
          {tab === "overview" && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {specs.filter(([, v]) => v && v !== "—" && v !== "null").map(([l, v]) => (
                <div key={l} style={{ padding: "10px 12px", background: "#f8fafc", borderRadius: 8, border: "1px solid #f1f5f9" }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: .5, marginBottom: 3 }}>{l}</div>
                  <div style={{ fontSize: 13, color: NAVY, fontWeight: 600 }}>{v}</div>
                </div>
              ))}
            </div>
          )}

          {/* Materials */}
          {tab === "materials" && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {mats.map((m, i) => (
                <span key={i} style={{ padding: "8px 14px", borderRadius: 99, background: tm.bg,
                  color: tm.color, fontWeight: 700, fontSize: 13 }}>{m}</span>
              ))}
            </div>
          )}

          {/* Belt Data */}
          {tab === "beltdata" && (
            <div>
              <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 12, lineHeight: 1.6 }}>
                Mechanical properties per material option. Strength ratings are per metre of belt width.
              </div>
              <BeltDataTable beltData={rec.belt_data} />
            </div>
          )}

          {/* Key Specs */}
          {tab === "keyspecs" && parsedSpecs && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {Object.entries(parsedSpecs).map(([k, v]) => (
                <div key={k} style={{ padding: "10px 12px", background: "#f8fafc", borderRadius: 8 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: .5, marginBottom: 3 }}>
                    {k.replace(/_/g, " ")}
                  </div>
                  <div style={{ fontSize: 13, color: NAVY, fontWeight: 600 }}>{String(v)}</div>
                </div>
              ))}
            </div>
          )}

          {/* Sizes */}
          {tab === "sizes" && rec.bucket_sizes && (
            <div style={{ fontSize: 13, color: "#374151", lineHeight: 1.8, whiteSpace: "pre-wrap" }}>
              {rec.bucket_sizes}
            </div>
          )}

          {/* Resources */}
          {tab === "resources" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {rec.catalog_url && (
                <a href={rec.catalog_url} target="_blank" rel="noreferrer"
                  style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px",
                    background: "#f8fafc", borderRadius: 10, border: "1px solid #e5e7eb",
                    color: NAVY, fontWeight: 700, fontSize: 13, textDecoration: "none" }}>
                  <span style={{ fontSize: 18 }}>📄</span> View Catalog PDF
                </a>
              )}
              {rec.tech_doc_url && (
                <a href={rec.tech_doc_url} target="_blank" rel="noreferrer"
                  style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px",
                    background: "#f8fafc", borderRadius: 10, border: "1px solid #e5e7eb",
                    color: NAVY, fontWeight: 700, fontSize: 13, textDecoration: "none" }}>
                  <span style={{ fontSize: 18 }}>📐</span> Technical Documentation
                </a>
              )}
              {rec.cad_url && (
                <a href={rec.cad_url} target="_blank" rel="noreferrer"
                  style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px",
                    background: "#f8fafc", borderRadius: 10, border: "1px solid #e5e7eb",
                    color: NAVY, fontWeight: 700, fontSize: 13, textDecoration: "none" }}>
                  <span style={{ fontSize: 18 }}>📁</span> CAD Drawing
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Catalog() {
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [seriesFilter, setSeriesFilter] = useState("All");
  const [hingeFilter, setHingeFilter] = useState("All");
  const [pitchFilter, setPitchFilter] = useState("All");
  const [selected, setSelected] = useState(null);
  const [selectedType, setSelectedType] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const [intralox, unicatalog, buckets, macChains] = await Promise.all([
          CatalogProduct.list(),
          UniCatalog.list(),
          ElevatorBucket.list(),
          MacChainProduct.list(),
        ]);
        const combined = [
          ...intralox.map(r => ({ ...r, _src: "intralox", _type: r.category || "Modular Plastic Belt" })),
          ...unicatalog.map(r => ({ ...r, _src: "uni", _type: r.product_type })),
          ...buckets.map(r => ({ ...r, _src: "bucket", _type: getBucketType(r) })),
          ...macChains.map(r => ({
            ...r,
            _src: "mac",
            _type: r.product_type === "ANSI Roller Chain" ? "ANSI Roller Chain" : r.product_type === "ANSI Roller Chain Attachments" ? "ANSI Roller Chain Attachments" : "Engineered Chain",
            vendor: "",  // suppress vendor branding
            series: r.part_number || r.series,
            style: r.subcategory || r.category,
            image_url: r.product_image || r.image_url,
          })),
        ];
        setAllProducts(combined);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const types = useMemo(() => {
    const s = new Set(allProducts.map(p => p._type).filter(Boolean));
    return ["All", ...Array.from(s).sort()];
  }, [allProducts]);

  const seriesOptions = useMemo(() => {
    const filtered = typeFilter === "All" ? allProducts : allProducts.filter(p => p._type === typeFilter);
    const s = new Set(filtered.map(p => p.series).filter(Boolean));
    return ["All", ...Array.from(s).sort((a, b) => {
      const na = parseFloat(a.replace(/\D/g, "")) || 0;
      const nb = parseFloat(b.replace(/\D/g, "")) || 0;
      return na - nb || a.localeCompare(b);
    })];
  }, [allProducts, typeFilter]);

  const hingeOptions = useMemo(() => {
    const s = new Set(allProducts.filter(p => p.hinge_style).map(p => p.hinge_style));
    return ["All", ...Array.from(s).sort()];
  }, [allProducts]);

  const pitchOptions = useMemo(() => {
    const s = new Set(allProducts.filter(p => p.pitch_in).map(p => `${p.pitch_in}"`));
    return ["All", ...Array.from(s).sort((a, b) => parseFloat(a) - parseFloat(b))];
  }, [allProducts]);

  const filtered = useMemo(() => {
    let list = allProducts;
    if (typeFilter !== "All") list = list.filter(p => p._type === typeFilter);
    if (seriesFilter !== "All") list = list.filter(p => p.series === seriesFilter);
    if (hingeFilter !== "All") list = list.filter(p => p.hinge_style === hingeFilter);
    if (pitchFilter !== "All") list = list.filter(p => `${p.pitch_in}"` === pitchFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(p =>
        [p.series, p.style, p.category, p.notes, p.materials, p.search_tags, p.application, p.part_number, p.subcategory, p.description]
          .some(f => f && f.toLowerCase().includes(q))
      );
    }
    return list.sort((a, b) => {
      // Parse part number: base numeric + strand suffix (-2, -3, -4)
      const parsePN = (s) => {
        const str = (s || "").trim();
        const m = str.match(/^(\d+(?:\.\d+)?)(.*)/);
        if (!m) return [0, 0, str];
        const base = parseFloat(m[1]);
        const rest = m[2] || "";
        const strand = rest.match(/-(\d+)$/);
        const strandNum = strand ? parseInt(strand[1]) : 1;
        return [base, strandNum, rest];
      };
      const [an, as2, ar] = parsePN(a.series);
      const [bn, bs2, br] = parsePN(b.series);
      if (an !== bn) return an - bn;
      if (as2 !== bs2) return as2 - bs2;
      return ar.localeCompare(br);
    });
  }, [allProducts, typeFilter, seriesFilter, hingeFilter, pitchFilter, search]);

  // Group by series for display
  const grouped = useMemo(() => {
    if (typeFilter === "All" || seriesFilter !== "All") return null;
    const map = {};
    filtered.forEach(p => {
      const key = p.series || "Other";
      if (!map[key]) map[key] = [];
      map[key].push(p);
    });
    return map;
  }, [filtered, typeFilter, seriesFilter]);

  const Sel = ({ value, onChange, options, label }) => (
    <select value={value} onChange={e => onChange(e.target.value)}
      style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid #d1d5db", fontSize: 13,
        color: NAVY, background: "#fff", cursor: "pointer", fontWeight: value !== "All" ? 700 : 400 }}>
      <option value="All">{label}</option>
      {options.filter(o => o !== "All").map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", fontFamily: "'Inter','Segoe UI',sans-serif" }}>

      {/* Top Bar */}
      <div style={{ background: NAVY, padding: "0 24px", display: "flex", alignItems: "center",
        justifyContent: "space-between", height: 56, boxShadow: "0 2px 8px rgba(0,0,0,.18)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <a href="/" style={{ color: "rgba(255,255,255,.5)", textDecoration: "none", fontSize: 12 }}>Home</a>
          <span style={{ color: "rgba(255,255,255,.3)", fontSize: 12 }}>/</span>
          <span style={{ color: "#fff", fontSize: 13, fontWeight: 700 }}>Product Catalog</span>
        </div>
        <div style={{ fontSize: 11, color: "rgba(255,255,255,.45)" }}>
          {loading ? "Loading..." : `${filtered.length} products`}
        </div>
      </div>

      {/* Search + Filters */}
      <div style={{ background: "#fff", borderBottom: "1px solid #e5e7eb", padding: "14px 24px" }}>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", maxWidth: 1200, margin: "0 auto" }}>
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search series, style, application, material..."
            style={{ flex: 1, minWidth: 240, padding: "8px 14px", borderRadius: 8,
              border: "1px solid #d1d5db", fontSize: 13, outline: "none" }}
          />
          <Sel value={typeFilter} onChange={v => { setTypeFilter(v); setSeriesFilter("All"); }} options={types} label="All Types" />
          {seriesOptions.length > 2 && (
            <Sel value={seriesFilter} onChange={setSeriesFilter} options={seriesOptions} label="All Series" />
          )}
          {hingeFilter !== "All" || hingeOptions.length > 2 ? (
            <Sel value={hingeFilter} onChange={setHingeFilter} options={hingeOptions} label="Hinge Style" />
          ) : null}
          {pitchOptions.length > 2 && (
            <Sel value={pitchFilter} onChange={setPitchFilter} options={pitchOptions} label="Pitch" />
          )}
          {(typeFilter !== "All" || seriesFilter !== "All" || hingeFilter !== "All" || pitchFilter !== "All" || search) && (
            <button onClick={() => { setTypeFilter("All"); setSeriesFilter("All"); setHingeFilter("All"); setPitchFilter("All"); setSearch(""); }}
              style={{ padding: "8px 14px", borderRadius: 8, border: "1px solid #d1d5db",
                background: "#f9fafb", cursor: "pointer", fontSize: 13, color: "#6b7280" }}>
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "24px" }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: 80, color: "#9ca3af", fontSize: 14 }}>Loading catalog...</div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: 80, color: "#9ca3af", fontSize: 14 }}>No products match your search.</div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 16 }}>
            {filtered.map((rec, i) => (
              <Card key={rec.id || i} rec={rec} type={rec._type}
                onClick={() => { setSelected(rec); setSelectedType(rec._type); }} />
            ))}
          </div>
        )}
      </div>

      {selected && (
        <Modal rec={selected} type={selectedType} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}
