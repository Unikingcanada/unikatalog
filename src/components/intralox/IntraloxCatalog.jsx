import { useState } from "react";
import { STRAIGHT_SERIES, RADIUS_SERIES, SPIRAL_SERIES, BELT_SUPPORT_TOOLS } from "@/lib/intraloxData";
import IntraloxSeriesCard from "./IntraloxSeriesCard";
import IntraloxSeriesDetail from "./IntraloxSeriesDetail";
import IntraloxConfigurator from "./IntraloxConfigurator";
import ModularBrandSelector from "./ModularBrandSelector";

const C = {
  navy: "#0F2340", navyMid: "#1A3A5C", navyLight: "#2A5080",
  gold: "#C9A84C", border: "#e2e8f0", muted: "#64748b", bg: "#f8fafc", text: "#0f172a",
};
const INTRALOX_RED = "#E31837";
const MPB_MANUAL_URL = "https://assets-us-01.kc-usercontent.com/19eb64b5-1815-003a-d268-e7109927ccad/b2679b1e-559b-4919-b559-6992adc8b1f3/5012156.4%202026%20MPB%20Engineering%20Manual.pdf";

const TABS = [
  { key: "straight", label: "Straight-Running", count: STRAIGHT_SERIES.length, desc: "All straight-running belt series" },
  { key: "radius", label: "Radius", count: RADIUS_SERIES.length, desc: "Horizontal curve belt series" },
  { key: "spiral", label: "Spiral", count: SPIRAL_SERIES.length, desc: "Spiral freezer / cooler belt series (2600–2950)" },
  { key: "tools", label: "Belt Support Tools", count: BELT_SUPPORT_TOOLS.length, desc: "Shafts, rings, wearstrips, scrapers, transfer plates & more" },
];

function BeltTypeTag({ type }) {
  const cfg = {
    "Straight-Running": { bg: "#e0f2fe", color: "#0369a1" },
    "Radius":           { bg: "#fce7f3", color: "#be185d" },
    "Spiral":           { bg: "#ede9fe", color: "#7c3aed" },
    "Belt Support Tool":{ bg: "#d1fae5", color: "#065f46" },
  }[type] || { bg: "#f1f5f9", color: "#334155" };
  return (
    <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 20, background: cfg.bg, color: cfg.color, letterSpacing: "0.3px" }}>
      {type}
    </span>
  );
}

function SupportToolCard({ tool, onGoRFQ }) {
  const [hov, setHov] = useState(false);
  function addRFQ(e) {
    e.stopPropagation();
    const cart = JSON.parse(localStorage.getItem("uniking_rfq_cart") || "[]");
    const exists = cart.find(i => i.id === tool.id);
    if (!exists) {
      cart.push({ cartId: tool.id + "_" + Date.now(), id: tool.id, _source: "intralox_bst", series: tool.name, name: tool.name, type: "Belt Support Tool — Intralox", category: "Belt Support Tool", quantity: 1, unit: "Each", notes: `Ref: 2026 catalog p.${tool.catalogPage}` });
      localStorage.setItem("uniking_rfq_cart", JSON.stringify(cart));
      window.dispatchEvent(new Event("rfq_cart_updated"));
    }
  }
  return (
    <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ background: "#fff", borderRadius: 12, border: `2px solid ${hov ? C.navyMid : C.border}`, padding: "18px 20px", transition: "all 0.15s", boxShadow: hov ? "0 4px 16px rgba(15,35,64,0.10)" : "none" }}>
      <BeltTypeTag type="Belt Support Tool" />
      <div style={{ fontSize: 15, fontWeight: 800, color: C.text, marginTop: 10, marginBottom: 6 }}>{tool.name}</div>
      <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.7, marginBottom: 12 }}>{tool.description}</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 14 }}>
        {tool.applications.map(a => (
          <span key={a} style={{ fontSize: 10, background: "#f1f5f9", color: C.navyMid, padding: "2px 8px", borderRadius: 10, fontWeight: 600 }}>{a}</span>
        ))}
      </div>
      <div style={{ fontSize: 11, color: C.muted, marginBottom: 14 }}>📄 2026 Catalog page {tool.catalogPage}</div>
      <div style={{ display: "flex", gap: 8 }}>
        <a href={tool.techChartUrl} target="_blank" rel="noreferrer"
          style={{ flex: 1, padding: "8px", textAlign: "center", background: "#f1f5f9", color: C.navyMid, borderRadius: 8, fontSize: 11, fontWeight: 700, textDecoration: "none" }}>
          View Manual
        </a>
        <button onClick={addRFQ}
          style={{ flex: 1, padding: "8px", background: C.navyMid, color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontSize: 11, fontWeight: 700 }}>
          + Add to RFQ
        </button>
      </div>
    </div>
  );
}

export default function IntraloxCatalog({ onBack, onGoRFQ, skipBrandSelector = false }) {
  const [brand, setBrand] = useState(skipBrandSelector ? "intralox" : null);
  const [activeTab, setActiveTab] = useState("straight");
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

  function handleNavBack() {
    if (view === "configure") { setView(selectedSeries ? "series" : "grid"); return; }
    if (view === "series") { setSelectedSeries(null); setView("grid"); return; }
    if (brand && !skipBrandSelector) { setBrand(null); return; }
    onBack();
  }

  // Show brand selector first unless already drilled into Intralox
  if (!brand) {
    return (
      <ModularBrandSelector
        onSelectBrand={b => { if (b === "intralox") setBrand("intralox"); }}
        onBack={onBack}
      />
    );
  }

  const tabSeries = { straight: STRAIGHT_SERIES, radius: RADIUS_SERIES, spiral: SPIRAL_SERIES, tools: [] }[activeTab] || [];

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "'Inter','Segoe UI',Arial,sans-serif" }}>

      {/* Top nav */}
      <div style={{ background: C.navy, borderBottom: `3px solid ${INTRALOX_RED}`, position: "sticky", top: 0, zIndex: 200 }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 clamp(12px,4vw,20px)", display: "flex", alignItems: "center", justifyContent: "space-between", height: 56 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <a href="#" onClick={e => { e.preventDefault(); handleNavBack(); }}
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
            onBack={() => { setSelectedSeries(null); setView("grid"); }}
            onGoRFQ={onGoRFQ}
          />
        </div>
      )}

      {/* Main grid */}
      {view === "grid" && (
        <>
          {/* Hero */}
          <div style={{ background: `linear-gradient(135deg, ${C.navy} 0%, ${C.navyLight} 100%)`, padding: "28px 20px 24px" }}>
            <div style={{ maxWidth: 1200, margin: "0 auto" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                <div style={{ background: INTRALOX_RED, borderRadius: 5, padding: "4px 10px" }}>
                  <span style={{ fontSize: 10, fontWeight: 800, color: "#fff", letterSpacing: "0.8px" }}>INTRALOX</span>
                </div>
                <span style={{ color: "rgba(255,255,255,0.6)", fontSize: 12 }}>2026 Catalog · Modular Plastic Belting (MPB)</span>
              </div>
              <h1 style={{ color: "#fff", fontSize: 24, fontWeight: 900, margin: "0 0 8px" }}>Intralox Modular Plastic Belts</h1>
              <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 13, margin: "0 0 16px", maxWidth: 600, lineHeight: 1.7 }}>
                {STRAIGHT_SERIES.length} straight-running, {RADIUS_SERIES.length} radius, {SPIRAL_SERIES.length} spiral series, and {BELT_SUPPORT_TOOLS.length} belt support tools — sourced from the 2026 Intralox MPB Engineering Manual. Browse all belt styles, configure your belt, and add directly to RFQ.
              </p>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {["2026 Catalog", "Series 100 to 10000", "FDA-Compliant Materials", "Snap-Lock & Open-Hinge", "EZ Clean™ Sprockets"].map(tag => (
                  <span key={tag} style={{ background: "rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.85)", padding: "5px 12px", borderRadius: 20, fontSize: 11, fontWeight: 600 }}>{tag}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Tab filter bar */}
          <div style={{ background: "#fff", borderBottom: `1px solid ${C.border}`, position: "sticky", top: 56, zIndex: 100 }}>
            <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 clamp(12px,4vw,20px)", display: "flex", gap: 0, overflowX: "auto" }}>
              {TABS.map(tab => (
                <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                  style={{
                    padding: "14px 20px",
                    border: "none",
                    background: "none",
                    cursor: "pointer",
                    fontSize: 13,
                    fontWeight: activeTab === tab.key ? 800 : 500,
                    color: activeTab === tab.key ? INTRALOX_RED : C.muted,
                    borderBottom: activeTab === tab.key ? `3px solid ${INTRALOX_RED}` : "3px solid transparent",
                    whiteSpace: "nowrap",
                    transition: "all 0.15s",
                  }}>
                  {tab.label}
                  <span style={{ marginLeft: 6, fontSize: 10, fontWeight: 600, background: activeTab === tab.key ? INTRALOX_RED : "#f1f5f9", color: activeTab === tab.key ? "#fff" : C.muted, padding: "1px 6px", borderRadius: 10 }}>
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Series grid */}
          <div style={{ maxWidth: 1200, margin: "0 auto", padding: "24px clamp(12px,4vw,28px) 80px" }}>
            {/* Section description */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 18, fontWeight: 800, color: C.text, marginBottom: 4 }}>
                {TABS.find(t => t.key === activeTab)?.label}
              </div>
              <div style={{ fontSize: 13, color: C.muted }}>
                {activeTab === "straight" && `${STRAIGHT_SERIES.length} series — 2026 catalog pages 31–329. Click View Series for belt styles, sprockets & technical data, or Configure to build your RFQ.`}
                {activeTab === "radius" && `${RADIUS_SERIES.length} series — 2026 catalog pages 331–405. Radius belts navigate horizontal curves.`}
                {activeTab === "spiral" && `${SPIRAL_SERIES.length} series — 2026 catalog pages 407–455. Spiral belts for freezer/cooler towers.`}
                {activeTab === "tools" && `${BELT_SUPPORT_TOOLS.length} belt support tools — 2026 catalog pages 457–481. Square shafts, retainer rings, returnway rings, OneTrack™ rollers, sprocket spacers, round bore adapters, scroll idlers, wearstrips, custom wearstrips, pusher bars, transfer plates, EZ Clean CIP, hold down rollers, abrasion resistance system, hinge rods, and EZ Mount scrapers.`}
              </div>
            </div>

            {/* Belt Support Tools */}
            {activeTab === "tools" && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 18 }}>
                {BELT_SUPPORT_TOOLS.map(tool => (
                  <SupportToolCard key={tool.id} tool={tool} onGoRFQ={onGoRFQ} />
                ))}
              </div>
            )}

            {/* Series cards */}
            {activeTab !== "tools" && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(270px, 1fr))", gap: 18, marginBottom: 48 }}>
                {tabSeries.map(series => (
                  <IntraloxSeriesCard
                    key={series.id}
                    series={series}
                    onViewSeries={handleViewSeries}
                    onConfigure={s => handleConfigure(s.styles?.[0], s)}
                  />
                ))}
              </div>
            )}

            {/* Intralox resources */}
            <div style={{ background: "#fff", borderRadius: 14, border: `1px solid ${C.border}`, padding: "24px 28px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                <div style={{ background: INTRALOX_RED, borderRadius: 4, padding: "3px 8px" }}>
                  <span style={{ fontSize: 9, fontWeight: 800, color: "#fff" }}>INTRALOX</span>
                </div>
                <div style={{ fontSize: 16, fontWeight: 800, color: C.navyMid }}>Engineering Resources</div>
              </div>
              <div style={{ fontSize: 13, color: C.muted, marginBottom: 16 }}>Official Intralox engineering documents and tools — 2026 catalog edition.</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 10 }}>
                {[
                  ["2026 MPB Engineering Manual", MPB_MANUAL_URL],
                  ["Intralox Belt Finder", "https://www.intralox.com/belt-finder"],
                  ["CalcLab (Intralox Engineering Tool)", "https://www.intralox.com/resources/calclab"],
                  ["Intralox Modular Plastic Belting Overview", "https://www.intralox.com/belt-finder/modular-plastic-belting"],
                  ["Series 800 Belts", "https://www.intralox.com/belt-finder/modular-plastic-belting/series-800"],
                  ["Series 1100 Belts", "https://www.intralox.com/belt-finder/modular-plastic-belting/series-1100"],
                  ["Series 1400 Belts", "https://www.intralox.com/belt-finder/modular-plastic-belting/series-1400"],
                  ["Series 1800 Belts", "https://www.intralox.com/belt-finder/modular-plastic-belting/series-1800"],
                ].map(([label, url]) => (
                  <a key={label} href={url} target="_blank" rel="noreferrer"
                    style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", background: C.bg, borderRadius: 8, border: `1px solid ${C.border}`, color: C.navyMid, fontWeight: 600, fontSize: 12, textDecoration: "none" }}>
                    <span style={{ fontSize: 16 }}>📄</span>{label}
                  </a>
                ))}
              </div>
              <div style={{ marginTop: 16, padding: "12px 14px", background: "#fffbeb", borderRadius: 8, border: "1px solid #fde68a", fontSize: 11, color: "#92400e" }}>
                ⚠ All specifications shown are sourced from the 2026 Intralox MPB Engineering Manual and Belt Finder. Final belt selection must be confirmed by Uniking before production. Contact Intralox for precise measurements and stock status.
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}