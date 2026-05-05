/**
 * SystemPlastCatalog — Main entry component for the System Plast Modular Belts & Sprockets section.
 * Mirrors IntraloxCatalog / MovexCatalog structure exactly.
 */
import { useState } from "react";
import SystemPlastSeriesCard from "./SystemPlastSeriesCard";
import SystemPlastSeriesDetail from "./SystemPlastSeriesDetail";
import SystemPlastConfigurator from "./SystemPlastConfigurator";
import { SP_SERIES, SP_STRAIGHT_SERIES, SP_SIDEFLEXING_SERIES, SP_SMART_GUIDE_URL } from "@/lib/systemPlastData";

const C = {
  navy: "#0C2340", navyMid: "#1A3A5C", gold: "#C9A84C",
  border: "#e2e8f0", muted: "#64748b", bg: "#f8fafc", text: "#0f172a",
};
const SP_BLUE = "#0057A8";

const FILTER_TYPES = [
  { key: "all",         label: "All Series" },
  { key: "straight",    label: "Straight-Running" },
  { key: "sideflexing", label: "Sideflexing" },
  { key: "special",     label: "Special (Magnetic/Anti-Slip)" },
];

const FILTER_PITCH = [
  { key: "all",     label: "All Pitches" },
  { key: "8mm",     label: "8 mm (1/3\")" },
  { key: "12.7mm",  label: "12.7 mm (1/2\")" },
  { key: "19.05mm", label: "19.05 mm (3/4\")" },
  { key: "25.4mm",  label: "25.4 mm (1\")" },
  { key: "50.8mm",  label: "50.8 mm (2\")" },
  { key: "63.5mm",  label: "63.5 mm (2.5\")" },
];

function getFiltered(typeFilter, pitchFilter) {
  return SP_SERIES.filter(s => {
    const matchType =
      typeFilter === "all" ||
      (typeFilter === "straight"    && s.beltType === "Straight-Running") ||
      (typeFilter === "sideflexing" && s.beltType === "Sideflexing") ||
      (typeFilter === "special"     && s.beltType === "Straight-Running / Special");
    const pm = parseFloat(s.pitch_mm);
    const matchPitch =
      pitchFilter === "all" ||
      (pitchFilter === "8mm"     && pm === 8) ||
      (pitchFilter === "12.7mm"  && pm === 12.7) ||
      (pitchFilter === "19.05mm" && pm === 19.05) ||
      (pitchFilter === "25.4mm"  && pm === 25.4) ||
      (pitchFilter === "50.8mm"  && pm === 50.8) ||
      (pitchFilter === "63.5mm"  && pm === 63.5);
    return matchType && matchPitch;
  });
}

export default function SystemPlastCatalog({ onBack, onGoRFQ }) {
  const [view, setView]                   = useState("grid");
  const [selectedSeries, setSelectedSeries] = useState(null);
  const [configSeries, setConfigSeries]   = useState(null);
  const [configStyle, setConfigStyle]     = useState(null);
  const [typeFilter, setTypeFilter]       = useState("all");
  const [pitchFilter, setPitchFilter]     = useState("all");
  const [rfqAdded, setRfqAdded]           = useState(false);

  const filtered = getFiltered(typeFilter, pitchFilter);

  function handleViewSeries(series) {
    setSelectedSeries(series);
    setView("detail");
    window.scrollTo(0, 0);
  }

  function handleConfigure(style, series) {
    setConfigStyle(style);
    setConfigSeries(series || selectedSeries);
    setView("configurator");
    window.scrollTo(0, 0);
  }

  function handleConfigComplete() {
    setView("detail");
    setRfqAdded(true);
    setTimeout(() => setRfqAdded(false), 4000);
  }

  // ── Configurator Overlay ──────────────────────────────────────────────────
  if (view === "configurator") {
    return (
      <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", zIndex: 900, display: "flex", alignItems: "flex-start", justifyContent: "center", padding: 20, overflowY: "auto" }}>
        <div style={{ background: "#fff", borderRadius: 16, width: "100%", maxWidth: 640, boxShadow: "0 24px 80px rgba(0,0,0,0.3)" }}>
          <SystemPlastConfigurator
            initialSeries={configSeries}
            initialStyle={configStyle}
            onComplete={handleConfigComplete}
            onClose={() => setView("detail")}
          />
        </div>
      </div>
    );
  }

  // ── Series Detail ─────────────────────────────────────────────────────────
  if (view === "detail" && selectedSeries) {
    return (
      <>
        {/* Sticky top nav */}
        <div style={{ background: C.navy, borderBottom: `3px solid ${SP_BLUE}`, position: "sticky", top: 0, zIndex: 200 }}>
          <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 clamp(12px,4vw,20px)", display: "flex", alignItems: "center", justifyContent: "space-between", height: 56 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <button onClick={() => { setSelectedSeries(null); setView("grid"); }}
                style={{ textDecoration: "none", background: "none", border: "none", display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                <div style={{ width: 28, height: 28, background: C.gold, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ color: C.navy, fontWeight: 900, fontSize: 13 }}>U</span>
                </div>
                <span style={{ color: "#fff", fontWeight: 700, fontSize: 15 }}>UniKonnect</span>
              </button>
              <div style={{ width: 1, height: 22, background: "rgba(255,255,255,0.15)" }} />
              <div style={{ background: SP_BLUE, borderRadius: 4, padding: "2px 6px" }}>
                <span style={{ fontSize: 9, fontWeight: 800, color: "#fff", letterSpacing: "0.5px" }}>SYSTEM PLAST</span>
              </div>
              <span style={{ color: C.gold, fontSize: 13, fontWeight: 600 }}>Modular Belts & Sprockets</span>
            </div>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              {rfqAdded && <span style={{ background: "#16a34a", color: "#fff", padding: "5px 12px", borderRadius: 8, fontSize: 12, fontWeight: 700 }}>✓ Added to RFQ</span>}
              {onGoRFQ && <button onClick={onGoRFQ} style={{ background: C.gold, color: C.navy, padding: "7px 16px", borderRadius: 8, fontSize: 13, fontWeight: 700, border: "none", cursor: "pointer" }}>RFQ Cart</button>}
            </div>
          </div>
        </div>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 0 80px" }}>
          <SystemPlastSeriesDetail
            series={selectedSeries}
            onConfigure={handleConfigure}
            onBack={() => { setSelectedSeries(null); setView("grid"); }}
            onGoRFQ={onGoRFQ}
          />
        </div>
      </>
    );
  }

  // ── Series Grid ───────────────────────────────────────────────────────────
  return (
    <div>
      {/* Header */}
      <div style={{ background: `linear-gradient(135deg, ${C.navy} 0%, ${SP_BLUE} 100%)`, padding: "24px 28px" }}>
        {onBack && (
          <button onClick={onBack} style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", color: "#fff", borderRadius: 7, padding: "5px 12px", cursor: "pointer", fontSize: 12, marginBottom: 16 }}>
            ← Back to Brands
          </button>
        )}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
              <div style={{ background: "rgba(255,255,255,0.2)", borderRadius: 6, padding: "4px 10px" }}>
                <span style={{ fontSize: 11, fontWeight: 900, color: "#fff", letterSpacing: "1px" }}>SYSTEM PLAST</span>
              </div>
              <div style={{ background: "rgba(255,255,255,0.1)", borderRadius: 6, padding: "4px 10px" }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.85)" }}>Regal Rexnord</span>
              </div>
              <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 12 }}>Modular Belts & Sprockets</span>
            </div>
            <h1 style={{ color: "#fff", fontSize: 26, fontWeight: 900, margin: "0 0 6px" }}>System Plast Modular Belt Catalog</h1>
            <p style={{ color: "rgba(255,255,255,0.65)", fontSize: 13, maxWidth: 560, lineHeight: 1.6, margin: 0 }}>
              {SP_SERIES.length} belt series covering 8 mm to 63.5 mm pitch. Straight-running, sideflexing, magnetic chainbelt, and heavy-duty anti-slip variants. Source: Smart Guide Rev. 005.
            </p>
          </div>
          <div style={{ display: "flex", gap: 10, flexDirection: "column", alignItems: "flex-end" }}>
            <a href={SP_SMART_GUIDE_URL} target="_blank" rel="noreferrer"
              style={{ background: SP_BLUE, color: "#fff", padding: "8px 16px", borderRadius: 8, fontSize: 12, fontWeight: 700, textDecoration: "none" }}>
              📄 Smart Guide
            </a>
            <a href="https://www.systemplastsmartguide.com" target="_blank" rel="noreferrer"
              style={{ color: C.gold, fontSize: 12, fontWeight: 700, textDecoration: "none" }}>
              systemplastsmartguide.com ↗
            </a>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: "flex", gap: 16, marginTop: 20, flexWrap: "wrap" }}>
          {[
            ["Belt Series", SP_SERIES.length],
            ["Total Styles", SP_SERIES.reduce((a, s) => a + (s.styles?.length || 0), 0)],
            ["Pitch Range", "8 – 63.5 mm"],
            ["Source", "Smart Guide Rev.005"],
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
                padding: "5px 12px", borderRadius: 20, border: `1px solid ${typeFilter === f.key ? SP_BLUE : C.border}`,
                background: typeFilter === f.key ? SP_BLUE : "#fff", color: typeFilter === f.key ? "#fff" : C.muted,
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

      {/* Grid */}
      <div style={{ padding: "20px", background: C.bg }}>

        {/* Straight-Running */}
        {(typeFilter === "all" || typeFilter === "straight") && (() => {
          const arr = filtered.filter(s => s.beltType === "Straight-Running");
          if (!arr.length) return null;
          return (
            <div style={{ marginBottom: 28 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: "1px", marginBottom: 14, display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ flex: 1, height: 1, background: C.border }} />
                <span>Straight-Running ({arr.length})</span>
                <div style={{ flex: 1, height: 1, background: C.border }} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))", gap: 14 }}>
                {arr.map(s => <SystemPlastSeriesCard key={s.id} series={s} onViewSeries={handleViewSeries} />)}
              </div>
            </div>
          );
        })()}

        {/* Special */}
        {(typeFilter === "all" || typeFilter === "special") && (() => {
          const arr = filtered.filter(s => s.beltType === "Straight-Running / Special");
          if (!arr.length) return null;
          return (
            <div style={{ marginBottom: 28 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: "1px", marginBottom: 14, display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ flex: 1, height: 1, background: C.border }} />
                <span>Special — Magnetic Chainbelt ({arr.length})</span>
                <div style={{ flex: 1, height: 1, background: C.border }} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))", gap: 14 }}>
                {arr.map(s => <SystemPlastSeriesCard key={s.id} series={s} onViewSeries={handleViewSeries} />)}
              </div>
            </div>
          );
        })()}

        {/* Sideflexing */}
        {(typeFilter === "all" || typeFilter === "sideflexing") && (() => {
          const arr = filtered.filter(s => s.beltType === "Sideflexing");
          if (!arr.length) return null;
          return (
            <div style={{ marginBottom: 28 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: "1px", marginBottom: 14, display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ flex: 1, height: 1, background: C.border }} />
                <span>Sideflexing ({arr.length})</span>
                <div style={{ flex: 1, height: 1, background: C.border }} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))", gap: 14 }}>
                {arr.map(s => <SystemPlastSeriesCard key={s.id} series={s} onViewSeries={handleViewSeries} />)}
              </div>
            </div>
          );
        })()}

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
        <div style={{ fontSize: 11, color: C.muted, maxWidth: 900 }}>
          <strong>Source:</strong> System Plast Smart Guide Rev. 005 (Regal Rexnord · www.systemplastsmartguide.com).
          Modular Belts & Sprockets section only. Items marked "Missing Data – Needs Mapping" exist in the Smart Guide but have not yet been fully entered.
          Final belt selection and specifications must be confirmed by Uniking before production.
        </div>
      </div>
    </div>
  );
}