import { useState, useEffect, useMemo } from "react";
import { DonghuaChain } from "@/api/entities";

const NAVY = "#0f2340";
const NAVY_MID = "#1a3a5c";
const NAVY_LT = "#2d5986";
const C = {
  navy: NAVY, navyMid: NAVY_MID, navyLt: NAVY_LT,
  slate: "#334155", muted: "#64748b", border: "#e2e8f0",
  bg: "#f8fafc", bgCard: "#ffffff", text: "#0f172a",
};

const CHAIN_TYPE_META = {
  "Drive Chain":         { color: "#1d4ed8", bg: "#dbeafe", label: "Drive Chain" },
  "Conveyor Chain":      { color: "#065f46", bg: "#d1fae5", label: "Conveyor Chain" },
  "Engineering Chain":   { color: "#7c3aed", bg: "#ede9fe", label: "Engineering Chain" },
  "Agricultural Chain":  { color: "#b45309", bg: "#fef3c7", label: "Agricultural Chain" },
};

const SERIES_META = {
  "Standard Roller Chain":          { color: "#1d4ed8", bg: "#eff6ff" },
  "Double Pitch Chain":             { color: "#0e7490", bg: "#ecfeff" },
  "Heavy Duty Roller Chain":        { color: "#1e3a8a", bg: "#dbeafe" },
  "Short Pitch Chain":              { color: "#374151", bg: "#f9fafb" },
  "Conveyor Chain (M Series)":      { color: "#065f46", bg: "#d1fae5" },
  "S/WH/WR Engineering":            { color: "#5b21b6", bg: "#f5f3ff" },
  "Welded Steel Mill Chain":        { color: "#374151", bg: "#f1f5f9" },
  "Welded Steel Drag Chain":        { color: "#4b5563", bg: "#f3f4f6" },
  "Block Chain":                    { color: "#7f1d1d", bg: "#fee2e2" },
  "Engineering Steel Bush Chain":   { color: "#7c3aed", bg: "#ede9fe" },
  "Palm Oil Chain":                 { color: "#166534", bg: "#dcfce7" },
  "Sugar Mill Chain":               { color: "#92400e", bg: "#fef9c3" },
  "S Type Steel Agricultural Chain":{ color: "#b45309", bg: "#fef3c7" },
  "CA Type Steel Agricultural Chain":{ color: "#c2410c", bg: "#fff7ed" },
  "Combine Harvester Chain":        { color: "#86198f", bg: "#fdf4ff" },
  "Steel Pintle Chain":             { color: "#374151", bg: "#f3f4f6" },
  "O-Ring Agricultural Chain":      { color: "#0f766e", bg: "#f0fdfa" },
};

const SPEC_FIELDS = [
  { key: "pitch_mm",          label: "Pitch" },
  { key: "roller_dia_mm",     label: "Roller Dia." },
  { key: "inner_width_mm",    label: "Inner Width" },
  { key: "pin_dia_mm",        label: "Pin Dia." },
  { key: "pin_length_mm",     label: "Pin Length" },
  { key: "plate_height_mm",   label: "Plate Height" },
  { key: "plate_thickness_mm",label: "Plate Thick." },
  { key: "transverse_pitch_mm",label: "Trans. Pitch" },
];

function TopBar() {
  return (
    <div style={{ background: NAVY, height: 56, display: "flex", alignItems: "center",
      padding: "0 40px", justifyContent: "space-between", flexShrink: 0 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ color: "#fff", fontWeight: 800, fontSize: 15, letterSpacing: "0.5px" }}>UNIKING CANADA</span>
        <span style={{ color: "rgba(255,255,255,0.25)", fontSize: 13 }}>/</span>
        <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 13 }}>Donghua Chain Catalog</span>
      </div>
      <span style={{ color: "rgba(255,255,255,0.25)", fontSize: 11, letterSpacing: "1px", textTransform: "uppercase" }}>
        Confidential · Internal Use Only
      </span>
    </div>
  );
}

function Badge({ label, bg = "#f3f4f6", color = "#374151", xs }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center",
      padding: xs ? "1px 7px" : "3px 10px", borderRadius: 99,
      background: bg, color, fontSize: xs ? 10 : 11, fontWeight: 700, whiteSpace: "nowrap" }}>
      {label}
    </span>
  );
}

function SpecPill({ label, value }) {
  if (value == null || value === "" || value === "—") return null;
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center",
      background: "#f8fafc", borderRadius: 8, padding: "8px 12px", minWidth: 80, border: "1px solid #e2e8f0" }}>
      <span style={{ fontSize: 14, fontWeight: 800, color: NAVY_MID }}>{value}</span>
      <span style={{ fontSize: 10, color: "#94a3b8", marginTop: 2, textAlign: "center" }}>{label}</span>
    </div>
  );
}

function ChainCard({ chain, onClick }) {
  const sm = SERIES_META[chain.series] || { color: NAVY_MID, bg: "#f3f4f6" };
  const tm = CHAIN_TYPE_META[chain.chain_type] || { color: NAVY_MID, bg: "#f3f4f6" };

  const displayNo = chain.ansi_no || chain.bs_no || chain.iso_no || chain.chain_no;
  const strands = chain.strands && chain.strands !== "Simplex" ? chain.strands : null;

  return (
    <div onClick={onClick}
      style={{ background: "#fff", borderRadius: 12, border: "1px solid #e5e7eb",
        cursor: "pointer", display: "flex", flexDirection: "column", overflow: "hidden",
        transition: "transform .15s, box-shadow .15s" }}
      onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 6px 20px rgba(0,0,0,.10)"; }}
      onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; }}>

      <div style={{ height: 4, background: `linear-gradient(90deg,${sm.color},${sm.color}66)` }} />

      <div style={{ padding: "12px 14px", flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 6 }}>
          <Badge label={chain.chain_type || "Chain"} bg={tm.bg} color={tm.color} xs />
          {chain.pitch_mm && (
            <span style={{ fontSize: 10, color: "#9ca3af", whiteSpace: "nowrap" }}>{chain.pitch_mm} mm pitch</span>
          )}
        </div>

        <div style={{ fontSize: 16, fontWeight: 900, color: NAVY, letterSpacing: "-0.3px" }}>
          {displayNo}
        </div>

        <div style={{ fontSize: 11, color: "#6b7280", fontWeight: 600 }}>{chain.series}</div>

        <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
          {strands && <Badge label={strands} bg="#f9fafb" color="#374151" xs />}
          {chain.tensile_strength_kn && (
            <Badge label={`${chain.tensile_strength_kn} kN`} bg="#eff6ff" color="#1d4ed8" xs />
          )}
        </div>

        {chain.application && (
          <div style={{ fontSize: 11, color: "#6b7280", lineHeight: 1.5,
            display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
            {chain.application}
          </div>
        )}
      </div>

      <div style={{ padding: "8px 14px", borderTop: "1px solid #f3f4f6",
        display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 10, color: "#d1d5db" }}>
          {chain.page_range ? `pp. ${chain.page_range}` : ""}
        </span>
        <span style={{ fontSize: 11, color: sm.color, fontWeight: 700 }}>Specs →</span>
      </div>
    </div>
  );
}

function ChainModal({ chain, onClose }) {
  if (!chain) return null;
  const sm = SERIES_META[chain.series] || { color: NAVY_MID, bg: "#f3f4f6" };
  const tm = CHAIN_TYPE_META[chain.chain_type] || { color: NAVY_MID, bg: "#f3f4f6" };
  const displayNo = chain.ansi_no || chain.bs_no || chain.iso_no || chain.chain_no;

  const hasDimData = SPEC_FIELDS.some(f => chain[f.key] != null && chain[f.key] !== "");

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.55)", zIndex: 1000,
      display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }} onClick={onClose}>
      <div style={{ background: "#fff", borderRadius: 16, width: "100%", maxWidth: 700,
        maxHeight: "93vh", overflowY: "auto" }} onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div style={{ background: `linear-gradient(135deg,${NAVY},${NAVY_LT})`,
          borderRadius: "16px 16px 0 0", padding: "20px 24px 18px", position: "relative" }}>
          <button onClick={onClose} style={{ position: "absolute", top: 12, right: 14,
            background: "rgba(255,255,255,.15)", border: "none", borderRadius: "50%",
            width: 32, height: 32, cursor: "pointer", color: "#fff", fontSize: 16 }}>✕</button>

          <div style={{ display: "flex", gap: 8, marginBottom: 10, flexWrap: "wrap" }}>
            <Badge label={chain.chain_type || "Chain"} bg={tm.bg} color={tm.color} />
            <Badge label={chain.series} bg="rgba(255,255,255,.15)" color="#fff" />
            {chain.strands && chain.strands !== "Simplex" && (
              <Badge label={chain.strands} bg="rgba(255,255,255,.1)" color="rgba(255,255,255,.7)" />
            )}
          </div>

          <div style={{ fontSize: 28, fontWeight: 900, color: "#fff", letterSpacing: "-0.5px" }}>
            {displayNo}
          </div>
          {chain.chain_no !== displayNo && (
            <div style={{ fontSize: 12, color: "rgba(255,255,255,.55)", marginTop: 2 }}>
              Donghua No. {chain.chain_no}
            </div>
          )}
        </div>

        {/* Body */}
        <div style={{ padding: "22px 24px", display: "flex", flexDirection: "column", gap: 20 }}>

          {/* Application */}
          {chain.application && (
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase",
                letterSpacing: "0.8px", marginBottom: 6 }}>Application</div>
              <div style={{ fontSize: 14, color: C.slate, lineHeight: 1.6 }}>{chain.application}</div>
            </div>
          )}

          {/* Notes */}
          {chain.notes && (
            <div style={{ background: "#fffbeb", borderRadius: 8, padding: "12px 14px",
              borderLeft: "3px solid #f59e0b" }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#92400e", marginBottom: 4 }}>Notes</div>
              <div style={{ fontSize: 13, color: "#78350f", lineHeight: 1.6 }}>{chain.notes}</div>
            </div>
          )}

          {/* Dimensions */}
          {hasDimData && (
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase",
                letterSpacing: "0.8px", marginBottom: 10 }}>Dimensions (mm)</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))", gap: 8 }}>
                {SPEC_FIELDS.map(({ key, label }) =>
                  chain[key] != null && chain[key] !== "" ? (
                    <SpecPill key={key} label={label} value={chain[key]} />
                  ) : null
                )}
              </div>
            </div>
          )}

          {/* Strength & Weight */}
          {(chain.tensile_strength_kn || chain.tensile_strength_lbf || chain.avg_tensile_kn || chain.weight_kg_m) && (
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase",
                letterSpacing: "0.8px", marginBottom: 10 }}>Performance</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 8 }}>
                {chain.tensile_strength_kn && (
                  <div style={{ background: "#eff6ff", borderRadius: 8, padding: "10px 14px", border: "1px solid #bfdbfe" }}>
                    <div style={{ fontSize: 15, fontWeight: 800, color: "#1d4ed8" }}>{chain.tensile_strength_kn} kN</div>
                    <div style={{ fontSize: 10, color: "#3b82f6", marginTop: 2 }}>Min Tensile Strength</div>
                  </div>
                )}
                {chain.tensile_strength_lbf && (
                  <div style={{ background: "#eff6ff", borderRadius: 8, padding: "10px 14px", border: "1px solid #bfdbfe" }}>
                    <div style={{ fontSize: 15, fontWeight: 800, color: "#1d4ed8" }}>{chain.tensile_strength_lbf.toLocaleString()} lbf</div>
                    <div style={{ fontSize: 10, color: "#3b82f6", marginTop: 2 }}>Min Tensile Strength</div>
                  </div>
                )}
                {chain.avg_tensile_kn && (
                  <div style={{ background: "#f0fdf4", borderRadius: 8, padding: "10px 14px", border: "1px solid #bbf7d0" }}>
                    <div style={{ fontSize: 15, fontWeight: 800, color: "#15803d" }}>{chain.avg_tensile_kn} kN</div>
                    <div style={{ fontSize: 10, color: "#16a34a", marginTop: 2 }}>Average Tensile</div>
                  </div>
                )}
                {chain.weight_kg_m && (
                  <div style={{ background: "#f8fafc", borderRadius: 8, padding: "10px 14px", border: "1px solid #e2e8f0" }}>
                    <div style={{ fontSize: 15, fontWeight: 800, color: NAVY_MID }}>{chain.weight_kg_m} kg/m</div>
                    <div style={{ fontSize: 10, color: "#64748b", marginTop: 2 }}>Weight per Metre</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Chain Numbers Cross-Reference */}
          {(chain.ansi_no || chain.bs_no || chain.iso_no || chain.chain_no) && (
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase",
                letterSpacing: "0.8px", marginBottom: 10 }}>Chain Number Cross-Reference</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))", gap: 8 }}>
                {chain.ansi_no && <SpecPill label="ANSI No." value={chain.ansi_no} />}
                {chain.bs_no && <SpecPill label="BS No." value={chain.bs_no} />}
                {chain.iso_no && <SpecPill label="ISO No." value={chain.iso_no} />}
                {chain.chain_no && <SpecPill label="Donghua No." value={chain.chain_no} />}
              </div>
            </div>
          )}

          {/* Materials */}
          {chain.materials && (
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase",
                letterSpacing: "0.8px", marginBottom: 6 }}>Materials</div>
              <div style={{ fontSize: 13, color: C.slate }}>{chain.materials}</div>
            </div>
          )}

          {/* Resources */}
          {chain.catalog_url && (
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase",
                letterSpacing: "0.8px", marginBottom: 8 }}>Resources</div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <a href={chain.catalog_url} target="_blank" rel="noopener noreferrer"
                  style={{ display: "inline-flex", alignItems: "center", gap: 6,
                    background: NAVY, color: "#fff", borderRadius: 8, padding: "9px 16px",
                    textDecoration: "none", fontSize: 12, fontWeight: 700 }}
                  onClick={e => e.stopPropagation()}>
                  View Catalog PDF
                </a>
              </div>
            </div>
          )}

          <div style={{ fontSize: 10, color: "#d1d5db", textAlign: "right" }}>
            {chain.page_range ? `Catalog reference: pp. ${chain.page_range}` : ""}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── SERIES ORDER ─────────────────────────────────────────────────────────────

const SERIES_ORDER = [
  "Standard Roller Chain",
  "Short Pitch Chain",
  "Heavy Duty Roller Chain",
  "Double Pitch Chain",
  "Conveyor Chain (M Series)",
  "S/WH/WR Engineering",
  "Engineering Steel Bush Chain",
  "Welded Steel Mill Chain",
  "Welded Steel Drag Chain",
  "Block Chain",
  "Palm Oil Chain",
  "Sugar Mill Chain",
  "S Type Steel Agricultural Chain",
  "CA Type Steel Agricultural Chain",
  "Combine Harvester Chain",
  "Steel Pintle Chain",
  "O-Ring Agricultural Chain",
];

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────

export default function DonghuaChainPage() {
  const [chains, setChains] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("All");
  const [filterSeries, setFilterSeries] = useState("All");
  const [filterStrands, setFilterStrands] = useState("All");
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    (async () => {
      const all = [];
      let skip = 0;
      while (true) {
        const res = await DonghuaChain.list({ limit: 500, skip });
        all.push(...(res.data || res));
        if ((res.data || res).length < 500) break;
        skip += 500;
      }
      setChains(all);
      setLoading(false);
    })();
  }, []);

  const chainTypes = useMemo(() => ["All", ...new Set(chains.map(c => c.chain_type).filter(Boolean))], [chains]);
  const seriesOptions = useMemo(() => {
    const raw = chains
      .filter(c => filterType === "All" || c.chain_type === filterType)
      .map(c => c.series)
      .filter(Boolean);
    const uniq = [...new Set(raw)];
    return ["All", ...uniq.sort((a, b) => {
      const ai = SERIES_ORDER.indexOf(a), bi = SERIES_ORDER.indexOf(b);
      if (ai >= 0 && bi >= 0) return ai - bi;
      if (ai >= 0) return -1;
      if (bi >= 0) return 1;
      return a.localeCompare(b);
    })];
  }, [chains, filterType]);

  const strandsOptions = useMemo(() => {
    const raw = chains.map(c => c.strands).filter(Boolean);
    return ["All", ...new Set(raw)];
  }, [chains]);

  const filtered = useMemo(() => {
    let out = chains;
    if (filterType !== "All") out = out.filter(c => c.chain_type === filterType);
    if (filterSeries !== "All") out = out.filter(c => c.series === filterSeries);
    if (filterStrands !== "All") out = out.filter(c => c.strands === filterStrands);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      out = out.filter(c =>
        [c.chain_no, c.ansi_no, c.bs_no, c.iso_no, c.series, c.chain_type, c.application, c.materials]
          .some(v => v && String(v).toLowerCase().includes(q))
      );
    }
    return out;
  }, [chains, filterType, filterSeries, filterStrands, search]);

  // Group by series for display
  const grouped = useMemo(() => {
    const map = {};
    for (const c of filtered) {
      const s = c.series || "Other";
      if (!map[s]) map[s] = [];
      map[s].push(c);
    }
    // Sort groups by SERIES_ORDER
    return Object.entries(map).sort(([a], [b]) => {
      const ai = SERIES_ORDER.indexOf(a), bi = SERIES_ORDER.indexOf(b);
      if (ai >= 0 && bi >= 0) return ai - bi;
      if (ai >= 0) return -1;
      if (bi >= 0) return 1;
      return a.localeCompare(b);
    });
  }, [filtered]);

  // Stats
  const stats = useMemo(() => {
    const seriesSet = new Set(chains.map(c => c.series).filter(Boolean));
    const typeSet = new Set(chains.map(c => c.chain_type).filter(Boolean));
    return { total: chains.length, series: seriesSet.size, types: typeSet.size };
  }, [chains]);

  const selectFilter = (setter, val) => {
    setter(val);
    if (setter === setFilterType) { setFilterSeries("All"); }
  };

  return (
    <div style={{ minHeight: "100vh", background: C.bg, display: "flex", flexDirection: "column", fontFamily: "'Inter', system-ui, sans-serif" }}>
      <TopBar />

      {/* Hero */}
      <div style={{ background: `linear-gradient(135deg, ${NAVY} 0%, ${NAVY_LT} 100%)`, padding: "32px 40px 28px" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          {/* Breadcrumb */}
          <div style={{ fontSize: 12, color: "rgba(255,255,255,.5)", marginBottom: 16, display: "flex", gap: 6, alignItems: "center" }}>
            <a href="/" style={{ color: "rgba(255,255,255,.5)", textDecoration: "none" }}>Home</a>
            <span style={{ color: "rgba(255,255,255,.25)" }}>›</span>
            <span style={{ color: "rgba(255,255,255,.8)" }}>Donghua Chain Catalog</span>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 16 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
                <span style={{ background: "rgba(255,255,255,.12)", border: "1px solid rgba(255,255,255,.18)",
                  borderRadius: 8, padding: "4px 12px", fontSize: 11, color: "rgba(255,255,255,.7)",
                  fontWeight: 700, letterSpacing: "0.5px" }}>DONGHUA CHAIN GROUP</span>
              </div>
              <h1 style={{ color: "#fff", fontSize: 26, fontWeight: 900, margin: 0, letterSpacing: "-0.3px" }}>
                Industrial Chain Catalog
              </h1>
              <p style={{ color: "rgba(255,255,255,.55)", fontSize: 13, margin: "6px 0 0" }}>
                Drive, conveyor, engineering, and agricultural chain specifications
              </p>
            </div>
            {!loading && (
              <div style={{ display: "flex", gap: 16 }}>
                {[
                  { val: stats.total, lab: "Chain Nos." },
                  { val: stats.series, lab: "Series" },
                  { val: stats.types, lab: "Chain Types" },
                ].map(({ val, lab }) => (
                  <div key={lab} style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 24, fontWeight: 900, color: "#fff" }}>{val}</div>
                    <div style={{ fontSize: 10, color: "rgba(255,255,255,.5)", fontWeight: 600 }}>{lab}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div style={{ background: "#fff", borderBottom: "1px solid #e2e8f0", padding: "14px 40px" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
          {/* Search */}
          <div style={{ position: "relative", flex: "1 1 220px" }}>
            <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)",
              color: "#94a3b8", fontSize: 14 }}>🔍</span>
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search by chain number, series, application…"
              style={{ width: "100%", paddingLeft: 32, paddingRight: 12, height: 38, borderRadius: 8,
                border: "1px solid #e2e8f0", fontSize: 13, background: C.bg, boxSizing: "border-box",
                outline: "none", color: C.text }} />
          </div>

          {/* Chain Type */}
          <select value={filterType} onChange={e => selectFilter(setFilterType, e.target.value)}
            style={{ height: 38, borderRadius: 8, border: "1px solid #e2e8f0", padding: "0 10px",
              fontSize: 13, background: "#fff", color: C.text, minWidth: 160 }}>
            {chainTypes.map(t => <option key={t}>{t}</option>)}
          </select>

          {/* Series */}
          <select value={filterSeries} onChange={e => setFilterSeries(e.target.value)}
            style={{ height: 38, borderRadius: 8, border: "1px solid #e2e8f0", padding: "0 10px",
              fontSize: 13, background: "#fff", color: C.text, minWidth: 200 }}>
            {seriesOptions.map(s => <option key={s}>{s}</option>)}
          </select>

          {/* Strands */}
          <select value={filterStrands} onChange={e => setFilterStrands(e.target.value)}
            style={{ height: 38, borderRadius: 8, border: "1px solid #e2e8f0", padding: "0 10px",
              fontSize: 13, background: "#fff", color: C.text, minWidth: 130 }}>
            {strandsOptions.map(s => <option key={s}>{s === "All" ? "All Strands" : s}</option>)}
          </select>

          {/* Result count */}
          <span style={{ fontSize: 12, color: "#94a3b8", whiteSpace: "nowrap" }}>
            {filtered.length} result{filtered.length !== 1 ? "s" : ""}
          </span>

          {/* Clear */}
          {(search || filterType !== "All" || filterSeries !== "All" || filterStrands !== "All") && (
            <button onClick={() => { setSearch(""); setFilterType("All"); setFilterSeries("All"); setFilterStrands("All"); }}
              style={{ height: 38, padding: "0 14px", borderRadius: 8, border: "1px solid #e2e8f0",
                background: "#fff", color: "#64748b", fontSize: 12, cursor: "pointer", fontWeight: 600 }}>
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Body */}
      <div style={{ flex: 1, padding: "28px 40px", maxWidth: 1280, margin: "0 auto", width: "100%" }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: 80, color: "#94a3b8" }}>Loading chain catalog…</div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: 80, color: "#94a3b8" }}>
            No chains match your search.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
            {grouped.map(([seriesName, items]) => {
              const sm = SERIES_META[seriesName] || { color: NAVY_MID, bg: "#f3f4f6" };
              return (
                <div key={seriesName}>
                  {/* Series Header */}
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                    <div style={{ width: 4, height: 22, borderRadius: 2, background: sm.color }} />
                    <span style={{ fontSize: 16, fontWeight: 800, color: NAVY }}>{seriesName}</span>
                    <span style={{ background: sm.bg, color: sm.color, fontSize: 11, fontWeight: 700,
                      padding: "2px 9px", borderRadius: 99 }}>{items.length}</span>
                  </div>
                  {/* Cards Grid */}
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 14 }}>
                    {items.map(c => (
                      <ChainCard key={c.id} chain={c} onClick={() => setSelected(c)} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {selected && <ChainModal chain={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
