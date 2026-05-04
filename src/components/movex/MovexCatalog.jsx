/**
 * MovexCatalog — Main entry component for the Movex Modular Belting section.
 * Mirrors the IntraloxCatalog structure exactly: Brand Selector → Series Grid → Series Detail → Configurator.
 */
import { useState } from "react";
import MovexSeriesCard from "./MovexSeriesCard";
import MovexSeriesDetail from "./MovexSeriesDetail";
import MovexConfigurator from "./MovexConfigurator";
import { MOVEX_SERIES, MOVEX_STRAIGHT_SERIES, MOVEX_SIDEFLEXING_SERIES, MOVEX_CATALOG_URL, MOVEX_BLUELINE_URL } from "@/lib/movexData";

const C = {
  navy: "#0C2340", navyMid: "#1A3A5C", gold: "#C9A84C",
  border: "#e2e8f0", muted: "#64748b", bg: "#f8fafc", text: "#0f172a",
};
const MOVEX_RED = "#E63946";

const FILTER_TYPES = [
  { key: "all",       label: "All Series" },
  { key: "straight",  label: "Straight-Running" },
  { key: "sideflexing", label: "Sideflexing" },
  { key: "blueline",  label: "Blueline® Food" },
];

const FILTER_PITCH = [
  { key: "all",  label: "All Pitches" },
  { key: "8mm",  label: "8 mm (0.315\")" },
  { key: "10mm", label: "10 mm (0.394\")" },
  { key: "12.7mm", label: "12.7 mm (0.5\")" },
  { key: "19.05mm", label: "19.05 mm (0.75\")" },
  { key: "25.4mm", label: "25.4 mm (1\")" },
  { key: "50.8mm", label: "50.8 mm (2\")" },
];

function getFilteredSeries(typeFilter, pitchFilter) {
  return MOVEX_SERIES.filter(s => {
    const matchType = typeFilter === "all" || 
      (typeFilter === "straight" && s.beltType.includes("Straight")) ||
      (typeFilter === "sideflexing" && s.beltType === "Sideflexing") ||
      (typeFilter === "blueline" && s.name.includes("Blueline"));
    const pitchMm = parseFloat(s.pitch_mm);
    const matchPitch = pitchFilter === "all" ||
      (pitchFilter === "8mm" && pitchMm === 8) ||
      (pitchFilter === "10mm" && pitchMm === 10) ||
      (pitchFilter === "12.7mm" && pitchMm === 12.7) ||
      (pitchFilter === "19.05mm" && pitchMm === 19.05) ||
      (pitchFilter === "25.4mm" && pitchMm === 25.4) ||
      (pitchFilter === "50.8mm" && pitchMm === 50.8);
    return matchType && matchPitch;
  });
}

export default function MovexCatalog({ onBack }) {
  const [view, setView] = useState("grid"); // grid | detail | configurator
  const [selectedSeries, setSelectedSeries] = useState(null);
  const [configSeries, setConfigSeries] = useState(null);
  const [configStyle, setConfigStyle] = useState(null);
  const [typeFilter, setTypeFilter] = useState("all");
  const [pitchFilter, setPitchFilter] = useState("all");

  const filtered = getFilteredSeries(typeFilter, pitchFilter);

  function handleViewSeries(series) {
    setSelectedSeries(series);
    setView("detail");
  }

  function handleConfigure(style, series) {
    setConfigStyle(style);
    setConfigSeries(series || selectedSeries);
    setView("configurator");
  }

  function handleConfiguratorComplete(config) {
    setView("detail");
  }

  // ── Configurator overlay ──────────────────────────────────────────────────
  if (view === "configurator") {
    return (
      <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", zIndex: 900, display: "flex", alignItems: "flex-start", justifyContent: "center", padding: 20, overflowY: "auto" }}>
        <div style={{ background: "#fff", borderRadius: 16, width: "100%", maxWidth: 640, boxShadow: "0 24px 80px rgba(0,0,0,0.3)" }}>
          <MovexConfigurator
            initialSeries={configSeries}
            initialStyle={configStyle}
            onComplete={handleConfiguratorComplete}
            onClose={() => setView("detail")}
          />
        </div>
      </div>
    );
  }

  // ── Series Detail ─────────────────────────────────────────────────────────
  if (view === "detail" && selectedSeries) {
    return (
      <MovexSeriesDetail
        series={selectedSeries}
        onConfigure={handleConfigure}
        onBack={() => setView("grid")}
      />
    );
  }

  // ── Series Grid ───────────────────────────────────────────────────────────
  return (
    <div>
      {/* Header */}
      <div style={{ background: `linear-gradient(135deg, ${C.navy} 0%, ${C.navyMid} 100%)`, padding: "24px 28px" }}>
        {onBack && (
          <button onClick={onBack} style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", color: "#fff", borderRadius: 7, padding: "5px 12px", cursor: "pointer", fontSize: 12, marginBottom: 16 }}>
            ← Back to Brands
          </button>
        )}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
              <div style={{ background: MOVEX_RED, borderRadius: 6, padding: "4px 10px" }}>
                <span style={{ fontSize: 11, fontWeight: 900, color: "#fff", letterSpacing: "1px" }}>MOVEX</span>
              </div>
              <div style={{ background: "#1e40af", borderRadius: 6, padding: "4px 10px" }}>
                <span style={{ fontSize: 11, fontWeight: 800, color: "#fff" }}>Blueline®</span>
              </div>
              <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 12 }}>Modular Belting</span>
            </div>
            <h1 style={{ color: "#fff", fontSize: 26, fontWeight: 900, margin: "0 0 6px" }}>Movex Modular Belt Catalog</h1>
            <p style={{ color: "rgba(255,255,255,0.65)", fontSize: 13, maxWidth: 560, lineHeight: 1.6, margin: 0 }}>
              {MOVEX_SERIES.length} belt series covering 8 mm to 50.8 mm pitch. Straight-running, sideflexing, and Blueline® food-grade variants. Source: 2024 Movex Imperial Catalog + Blueline® V4 2025.
            </p>
          </div>
          <div style={{ display: "flex", gap: 10, flexDirection: "column", alignItems: "flex-end" }}>
            <div style={{ display: "flex", gap: 8 }}>
              <a href={MOVEX_CATALOG_URL} target="_blank" rel="noreferrer"
                style={{ background: MOVEX_RED, color: "#fff", padding: "8px 16px", borderRadius: 8, fontSize: 12, fontWeight: 700, textDecoration: "none" }}>
                📄 Imperial Catalog
              </a>
              <a href={MOVEX_BLUELINE_URL} target="_blank" rel="noreferrer"
                style={{ background: "#1e40af", color: "#fff", padding: "8px 16px", borderRadius: 8, fontSize: 12, fontWeight: 700, textDecoration: "none" }}>
                📄 Blueline® Catalog
              </a>
            </div>
            <a href="https://www.movexii.com/en/prodcat/modular-belts" target="_blank" rel="noreferrer"
              style={{ color: C.gold, fontSize: 12, fontWeight: 700, textDecoration: "none" }}>
              movexii.com/modular-belts ↗
            </a>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: "flex", gap: 16, marginTop: 20, flexWrap: "wrap" }}>
          {[
            ["Belt Series", MOVEX_SERIES.length],
            ["Total Styles", MOVEX_SERIES.reduce((a, s) => a + (s.styles?.length || 0), 0)],
            ["Pitch Range", "8 – 50.8 mm"],
            ["Food-Grade", "Blueline®"],
          ].map(([k, v]) => (
            <div key={k} style={{ background: "rgba(255,255,255,0.08)", borderRadius: 8, padding: "8px 16px", minWidth: 100, textAlign: "center" }}>
              <div style={{ fontSize: 18, fontWeight: 900, color: C.gold }}>{v}</div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.6)", marginTop: 2 }}>{k}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div style={{ background: "#fff", borderBottom: `1px solid ${C.border}`, padding: "12px 20px", display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ display: "flex", gap: 5 }}>
          {FILTER_TYPES.map(f => (
            <button key={f.key} onClick={() => setTypeFilter(f.key)}
              style={{
                padding: "5px 12px", borderRadius: 20, border: `1px solid ${typeFilter === f.key ? C.navyMid : C.border}`,
                background: typeFilter === f.key ? C.navyMid : "#fff", color: typeFilter === f.key ? "#fff" : C.muted,
                cursor: "pointer", fontSize: 11, fontWeight: typeFilter === f.key ? 700 : 400,
              }}>{f.label}</button>
          ))}
        </div>
        <div style={{ width: 1, height: 24, background: C.border }} />
        <select value={pitchFilter} onChange={e => setPitchFilter(e.target.value)}
          style={{ padding: "5px 10px", border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 11, color: C.text, cursor: "pointer" }}>
          {FILTER_PITCH.map(f => <option key={f.key} value={f.key}>{f.label}</option>)}
        </select>
        <div style={{ marginLeft: "auto", fontSize: 11, color: C.muted }}>{filtered.length} series shown</div>
      </div>

      {/* Series Grid */}
      <div style={{ padding: "20px", background: C.bg }}>

        {/* Straight-Running */}
        {(typeFilter === "all" || typeFilter === "straight" || typeFilter === "blueline") && (() => {
          const straightFiltered = filtered.filter(s => s.beltType.includes("Straight") || s.beltType.includes("Special"));
          if (straightFiltered.length === 0) return null;
          return (
            <div style={{ marginBottom: 28 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: "1px", marginBottom: 14, display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ flex: 1, height: 1, background: C.border }} />
                <span>Straight-Running ({straightFiltered.length})</span>
                <div style={{ flex: 1, height: 1, background: C.border }} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))", gap: 14 }}>
                {straightFiltered.map(series => (
                  <MovexSeriesCard key={series.id} series={series} onViewSeries={handleViewSeries} />
                ))}
              </div>
            </div>
          );
        })()}

        {/* Sideflexing */}
        {(typeFilter === "all" || typeFilter === "sideflexing") && (() => {
          const sfFiltered = filtered.filter(s => s.beltType === "Sideflexing");
          if (sfFiltered.length === 0) return null;
          return (
            <div style={{ marginBottom: 28 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: "1px", marginBottom: 14, display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ flex: 1, height: 1, background: C.border }} />
                <span>Sideflexing ({sfFiltered.length})</span>
                <div style={{ flex: 1, height: 1, background: C.border }} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))", gap: 14 }}>
                {sfFiltered.map(series => (
                  <MovexSeriesCard key={series.id} series={series} onViewSeries={handleViewSeries} />
                ))}
              </div>
            </div>
          );
        })()}

        {/* No results */}
        {filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: "40px 20px", color: C.muted }}>
            <div style={{ fontSize: 32, marginBottom: 10 }}>🔍</div>
            <div style={{ fontSize: 14, fontWeight: 700 }}>No series match your filters</div>
            <div style={{ fontSize: 12, marginTop: 4 }}>Try clearing the filters above</div>
          </div>
        )}
      </div>

      {/* Footer disclaimer */}
      <div style={{ background: "#fff", borderTop: `1px solid ${C.border}`, padding: "16px 28px" }}>
        <div style={{ fontSize: 11, color: C.muted, maxWidth: 800 }}>
          <strong>Source:</strong> Movex Conveyor Modular Belts & Chains Catalog (Imperial, 2024) + Blueline® Modular Belts & Sprockets V4 (2025).
          All specifications sourced from official Movex publications. Items marked "Missing Data – Needs Mapping" exist in catalog but have not yet been fully entered.
          Final belt selection and specifications must be confirmed by Uniking before production.
        </div>
      </div>
    </div>
  );
}