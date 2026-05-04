import { useState } from "react";
import { INTRALOX_SERIES } from "@/lib/intraloxData";
import IntraloxSeriesCard from "./IntraloxSeriesCard";
import IntraloxSeriesDetail from "./IntraloxSeriesDetail";
import IntraloxConfigurator from "./IntraloxConfigurator";

const C = {
  navy: "#0F2340", navyMid: "#1A3A5C", navyLight: "#2A5080",
  gold: "#C9A84C", border: "#e2e8f0", muted: "#64748b", bg: "#f8fafc"
};
const INTRALOX_RED = "#E31837";
const LOGO = "https://media.base44.com/images/public/69dd9ffccab4dd693d4d92f5/e48ee59d9_Unitingthestrongestlinks_20251031_225809_0000.png";

export default function IntraloxCatalog({ onBack, onGoRFQ }) {
  const [view, setView] = useState("grid"); // grid | series | configure
  const [selectedSeries, setSelectedSeries] = useState(null);
  const [configuringStyle, setConfiguringStyle] = useState(null);
  const [configuringSeries, setConfiguringSeries] = useState(null);
  const [rfqAdded, setRfqAdded] = useState(false);

  function handleViewSeries(series) {
    setSelectedSeries(series);
    setView("series");
    window.scrollTo(0, 0);
  }

  function handleConfigure(style, series) {
    setConfiguringStyle(style || null);
    setConfiguringSeries(series || selectedSeries);
    setView("configure");
    window.scrollTo(0, 0);
  }

  function handleComplete() {
    setView(selectedSeries ? "series" : "grid");
    setConfiguringStyle(null);
    setRfqAdded(true);
    setTimeout(() => setRfqAdded(false), 4000);
  }

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "'Inter','Segoe UI',Arial,sans-serif" }}>

      {/* Top nav */}
      <div style={{ background: C.navy, borderBottom: `3px solid ${INTRALOX_RED}`, position: "sticky", top: 0, zIndex: 200 }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 clamp(12px,4vw,20px)", display: "flex", alignItems: "center", justifyContent: "space-between", height: 56 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <a href="#" onClick={e => { e.preventDefault(); if (view === "configure") setView(selectedSeries ? "series" : "grid"); else if (view === "series") setView("grid"); else onBack(); }}
              style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 28, height: 28, background: C.gold, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ color: C.navy, fontWeight: 900, fontSize: 13 }}>U</span>
              </div>
              <span style={{ color: "#fff", fontWeight: 700, fontSize: 15 }}>UniKonnect</span>
            </a>
            <div style={{ width: 1, height: 22, background: "rgba(255,255,255,0.15)" }} />
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ background: INTRALOX_RED, borderRadius: 4, padding: "2px 6px" }}>
                <span style={{ fontSize: 9, fontWeight: 800, color: "#fff", letterSpacing: "0.5px" }}>INTRALOX</span>
              </div>
              <span style={{ color: C.gold, fontSize: 13, fontWeight: 600 }}>Modular Plastic Belting</span>
            </div>
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            {rfqAdded && (
              <span style={{ background: "#16a34a", color: "#fff", padding: "5px 12px", borderRadius: 8, fontSize: 12, fontWeight: 700 }}>✓ Added to RFQ</span>
            )}
            <a href="#" onClick={e => { e.preventDefault(); onGoRFQ(); }}
              style={{ background: C.gold, color: C.navy, padding: "7px 16px", borderRadius: 8, fontSize: 13, fontWeight: 700, textDecoration: "none" }}>
              RFQ Cart
            </a>
          </div>
        </div>
      </div>

      {/* Configurator modal */}
      {view === "configure" && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.65)", zIndex: 1100, display: "flex", alignItems: "flex-start", justifyContent: "center", padding: 16, overflowY: "auto" }}>
          <div style={{ background: "#fff", borderRadius: 16, width: "100%", maxWidth: 620, boxShadow: "0 24px 80px rgba(0,0,0,0.3)", marginBottom: 16 }}>
            <IntraloxConfigurator
              initialSeries={configuringSeries}
              initialStyle={configuringStyle}
              onComplete={handleComplete}
              onClose={() => setView(selectedSeries ? "series" : "grid")}
            />
          </div>
        </div>
      )}

      {/* Series detail */}
      {view === "series" && selectedSeries && (
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 0 80px" }}>
          <IntraloxSeriesDetail
            series={selectedSeries}
            onConfigure={handleConfigure}
            onBack={() => setView("grid")}
            onGoRFQ={onGoRFQ}
          />
        </div>
      )}

      {/* Main grid */}
      {view === "grid" && (
        <>
          {/* Hero */}
          <div style={{ background: `linear-gradient(135deg, ${C.navy} 0%, ${C.navyLight} 100%)`, padding: "32px 20px 28px" }}>
            <div style={{ maxWidth: 1200, margin: "0 auto" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                <div style={{ background: INTRALOX_RED, borderRadius: 5, padding: "4px 10px" }}>
                  <span style={{ fontSize: 10, fontWeight: 800, color: "#fff", letterSpacing: "0.8px" }}>INTRALOX</span>
                </div>
                <span style={{ color: "rgba(255,255,255,0.6)", fontSize: 12 }}>Modular Plastic Belting (MPB)</span>
              </div>
              <h1 style={{ color: "#fff", fontSize: 26, fontWeight: 900, margin: "0 0 8px" }}>Intralox Modular Plastic Belts</h1>
              <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 13, margin: "0 0 16px", maxWidth: 580, lineHeight: 1.7 }}>
                Select a series to view all belt styles, compatible sprockets, flights, sideguards, and technical data. Configure your belt and add directly to RFQ.
              </p>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {["FDA-Compliant Materials", "Series 800 to Series 1800+", "Snap-Lock & Open-Hinge Designs", "EZ Clean™ Sprockets", "Custom Width & Length"].map(tag => (
                  <span key={tag} style={{ background: "rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.85)", padding: "5px 12px", borderRadius: 20, fontSize: 11, fontWeight: 600 }}>{tag}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Series grid */}
          <div style={{ maxWidth: 1200, margin: "0 auto", padding: "24px clamp(12px,4vw,28px) 80px" }}>
            <div style={{ fontSize: 13, color: C.muted, marginBottom: 20 }}>
              {INTRALOX_SERIES.length} primary series shown. Click <strong>View Series</strong> for belt styles, sprockets & technical data, or <strong>Configure →</strong> to build your RFQ.
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(270px, 1fr))", gap: 18, marginBottom: 48 }}>
              {INTRALOX_SERIES.map(series => (
                <IntraloxSeriesCard
                  key={series.id}
                  series={series}
                  onViewSeries={handleViewSeries}
                  onConfigure={s => handleConfigure(s.styles?.[0], s)}
                />
              ))}
            </div>

            {/* Intralox resources */}
            <div style={{ background: "#fff", borderRadius: 14, border: `1px solid ${C.border}`, padding: "24px 28px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                <div style={{ background: INTRALOX_RED, borderRadius: 4, padding: "3px 8px" }}>
                  <span style={{ fontSize: 9, fontWeight: 800, color: "#fff" }}>INTRALOX</span>
                </div>
                <div style={{ fontSize: 16, fontWeight: 800, color: C.navyMid }}>Engineering Resources</div>
              </div>
              <div style={{ fontSize: 13, color: C.muted, marginBottom: 16 }}>Official Intralox engineering documents and tools.</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 10 }}>
                {[
                  ["2024 MPB Engineering Manual", "https://assets-us-01.kc-usercontent.com/19eb64b5-1815-003a-d268-e7109927ccad/29565722-6cc9-4393-b3cc-448e84cf7465/5012156.2_2024%20MPB%20Engineering%20Manual_EN-US.pdf"],
                  ["Intralox Belt Finder", "https://www.intralox.com/belt-finder"],
                  ["CalcLab (Intralox Engineering Tool)", "https://www.intralox.com/resources/calclab"],
                  ["Series 800 Belts", "https://www.intralox.com/belt-finder/modular-plastic-belting/series-800"],
                  ["Series 1100 Belts", "https://www.intralox.com/belt-finder/modular-plastic-belting/series-1100"],
                  ["Series 1400 Belts", "https://www.intralox.com/belt-finder/modular-plastic-belting/series-1400"],
                ].map(([label, url]) => (
                  <a key={label} href={url} target="_blank" rel="noreferrer"
                    style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", background: C.bg, borderRadius: 8, border: `1px solid ${C.border}`, color: C.navyMid, fontWeight: 600, fontSize: 12, textDecoration: "none" }}>
                    <span style={{ fontSize: 16 }}>📄</span>{label}
                  </a>
                ))}
              </div>
              <div style={{ marginTop: 16, padding: "12px 14px", background: "#fffbeb", borderRadius: 8, border: "1px solid #fde68a", fontSize: 11, color: "#92400e" }}>
                ⚠ All specifications shown are sourced from Intralox Belt Finder and the 2024 MPB Engineering Manual. Final belt selection must be confirmed by Uniking before production. Contact Intralox for precise measurements and stock status.
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}