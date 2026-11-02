/**
 * EurobeltCatalog — Main entry component for the Eurobelt Modular Belting section.
 * Mirrors the MovexCatalog structure: Series Grid → Series Detail.
 */
import { useState } from "react";
import EurobeltSeriesCard from "./EurobeltSeriesCard";
import EurobeltSeriesDetail from "./EurobeltSeriesDetail";
import { EUROBELT_SERIES, EUROBELT_WEBSITE, EUROBELT_CATALOG_URL } from "@/lib/eurobeltData";

const C = {
  navy: "#0C2340", navyMid: "#1A3A5C", gold: "#C9A84C",
  border: "#e2e8f0", muted: "#64748b", bg: "#f8fafc", text: "#0f172a",
};
const EUROBELT_BLUE = "#0066B3";

const FILTERS = [
  { key: "all",          label: "All Series" },
  { key: "straight",     label: "Straight-Running" },
  { key: "sideflexing",  label: "Sideflexing" },
  { key: "norods",       label: "No-Rod (Quickbelts)" },
];

function getFiltered(typeFilter) {
  return EUROBELT_SERIES.filter(s => {
    if (typeFilter === "all") return true;
    if (typeFilter === "straight") return !s.beltType.includes("Sideflexing") && !s.beltType.includes("No Rods");
    if (typeFilter === "sideflexing") return s.beltType.includes("Sideflexing");
    if (typeFilter === "norods") return s.beltType.includes("No Rods");
    return true;
  });
}

export default function EurobeltCatalog({ onBack }) {
  const [view, setView] = useState("grid");
  const [selectedSeries, setSelectedSeries] = useState(null);
  const [typeFilter, setTypeFilter] = useState("all");

  const filtered = getFiltered(typeFilter);
  const straight = filtered.filter(s => !s.beltType.includes("Sideflexing") && !s.beltType.includes("No Rods"));
  const sideflexing = filtered.filter(s => s.beltType.includes("Sideflexing"));
  const norods = filtered.filter(s => s.beltType.includes("No Rods"));

  function handleViewSeries(series) {
    setSelectedSeries(series);
    setView("detail");
  }

  if (view === "detail" && selectedSeries) {
    return <EurobeltSeriesDetail series={selectedSeries} onBack={() => setView("grid")} />;
  }

  return (
    <div>
      {/* Header */}
      <div style={{ background: `linear-gradient(135deg, ${C.navy} 0%, ${C.navyMid} 100%)`, padding: "24px 28px" }}>
        {onBack && (
          <button onClick={onBack} style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", color: "#fff", borderRadius: 7, padding: "5px 12px", cursor: "pointer", fontSize: 12, marginBottom: 16 }}>← Back to Brands</button>
        )}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
              <div style={{ background: EUROBELT_BLUE, borderRadius: 6, padding: "4px 10px" }}>
                <span style={{ fontSize: 11, fontWeight: 900, color: "#fff", letterSpacing: "1px" }}>EUROBELT</span>
              </div>
              <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 12 }}>Modular Belting · Since 1972</span>
            </div>
            <h1 style={{ color: "#fff", fontSize: 26, fontWeight: 900, margin: "0 0 6px" }}>Eurobelt Modular Belt Catalog</h1>
            <p style={{ color: "rgba(255,255,255,0.65)", fontSize: 13, maxWidth: 560, lineHeight: 1.6, margin: 0 }}>
              {EUROBELT_SERIES.length} belt series from 12 mm to 50 mm pitch. Straight-running, sideflexing, and no-rod Quickbelts. Designed and manufactured in Spain by AFHER EUROBELT, S.A.
            </p>
          </div>
          <div style={{ display: "flex", gap: 8, flexDirection: "column", alignItems: "flex-end" }}>
            <a href={EUROBELT_CATALOG_URL} target="_blank" rel="noreferrer" style={{ background: EUROBELT_BLUE, color: "#fff", padding: "8px 16px", borderRadius: 8, fontSize: 12, fontWeight: 700, textDecoration: "none" }}>📄 General Catalogue</a>
            <a href={EUROBELT_WEBSITE} target="_blank" rel="noreferrer" style={{ color: C.gold, fontSize: 12, fontWeight: 700, textDecoration: "none" }}>eurobelt.com ↗</a>
          </div>
        </div>
        <div style={{ display: "flex", gap: 16, marginTop: 20, flexWrap: "wrap" }}>
          {[["Belt Series", EUROBELT_SERIES.length], ["Pitch Range", "12 – 50 mm"], ["Sideflexing", EUROBELT_SERIES.filter(s => s.beltType.includes("Sideflexing")).length], ["Materials", "15+"]].map(([k, v]) => (
            <div key={k} style={{ background: "rgba(255,255,255,0.08)", borderRadius: 8, padding: "8px 16px", minWidth: 100, textAlign: "center" }}>
              <div style={{ fontSize: 18, fontWeight: 900, color: C.gold }}>{v}</div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.6)", marginTop: 2 }}>{k}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div style={{ background: "#fff", borderBottom: `1px solid ${C.border}`, padding: "12px 20px", display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
        {FILTERS.map(f => (
          <button key={f.key} onClick={() => setTypeFilter(f.key)} style={{
            padding: "5px 12px", borderRadius: 20, border: `1px solid ${typeFilter === f.key ? EUROBELT_BLUE : C.border}`,
            background: typeFilter === f.key ? EUROBELT_BLUE : "#fff", color: typeFilter === f.key ? "#fff" : C.muted,
            cursor: "pointer", fontSize: 11, fontWeight: typeFilter === f.key ? 700 : 400,
          }}>{f.label}</button>
        ))}
        <div style={{ marginLeft: "auto", fontSize: 11, color: C.muted }}>{filtered.length} series shown</div>
      </div>

      {/* Grid */}
      <div style={{ padding: "20px", background: C.bg }}>
        {(typeFilter === "all" || typeFilter === "straight") && straight.length > 0 && (
          <div style={{ marginBottom: 28 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: "1px", marginBottom: 14, display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ flex: 1, height: 1, background: C.border }} /><span>Straight-Running ({straight.length})</span><div style={{ flex: 1, height: 1, background: C.border }} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))", gap: 14 }}>
              {straight.map(s => <EurobeltSeriesCard key={s.id} series={s} onViewSeries={handleViewSeries} />)}
            </div>
          </div>
        )}
        {(typeFilter === "all" || typeFilter === "sideflexing") && sideflexing.length > 0 && (
          <div style={{ marginBottom: 28 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: "1px", marginBottom: 14, display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ flex: 1, height: 1, background: C.border }} /><span>Sideflexing ({sideflexing.length})</span><div style={{ flex: 1, height: 1, background: C.border }} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))", gap: 14 }}>
              {sideflexing.map(s => <EurobeltSeriesCard key={s.id} series={s} onViewSeries={handleViewSeries} />)}
            </div>
          </div>
        )}
        {(typeFilter === "all" || typeFilter === "norods") && norods.length > 0 && (
          <div style={{ marginBottom: 28 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: "1px", marginBottom: 14, display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ flex: 1, height: 1, background: C.border }} /><span>No-Rod Quickbelts ({norods.length})</span><div style={{ flex: 1, height: 1, background: C.border }} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))", gap: 14 }}>
              {norods.map(s => <EurobeltSeriesCard key={s.id} series={s} onViewSeries={handleViewSeries} />)}
            </div>
          </div>
        )}
        {filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: "40px 20px", color: C.muted }}>
            <div style={{ fontSize: 32, marginBottom: 10 }}>🔍</div>
            <div style={{ fontSize: 14, fontWeight: 700 }}>No series match your filters</div>
          </div>
        )}
      </div>

      <div style={{ background: "#fff", borderTop: `1px solid ${C.border}`, padding: "16px 28px" }}>
        <div style={{ fontSize: 11, color: C.muted, maxWidth: 800 }}>
          <strong>Source:</strong> Eurobelt (AFHER EUROBELT, S.A.) — Spain, since 1972. All specifications sourced from eurobelt.com. 15+ material options including POM (Acetal), PP, PBT, PE, antistatic, detectable, and flame-retardant variants. Final belt selection must be confirmed by Uniking before production.
        </div>
      </div>
    </div>
  );
}