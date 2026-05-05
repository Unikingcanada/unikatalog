import { useState, useEffect, useMemo } from "react";

const C = {
  navy: "#003c5b", navyMid: "#1A3A5C", navyLight: "#2A5080",
  bg: "#f8fafc", card: "#ffffff", border: "#e2e8f0", text: "#0f172a", muted: "#64748b"
};

function stripVendor(text) {
  if (!text) return text;
  return text.replace(/Allied[\s\-]?Locke[\s\S]*?(\||$)/gi, '').replace(/Allied[\s\-]?Locke/gi, '').replace(/\|\s*$/, '').replace(/^\s*\|\s*/, '').trim();
}

function getRFQCart() {
  try { return JSON.parse(localStorage.getItem("uniking_rfq_cart") || "[]"); } catch { return []; }
}
function addToRFQCart(product) {
  const cart = getRFQCart();
  const exists = cart.find((i) => i.id === product.id && i._source === product._source);
  if (exists) return false;
  cart.push({ cartId: product.id + "_" + Date.now(), id: product.id, _source: product._source, series: product.series, name: product.series, type: product.type, style: product.style || "", category: product.category || "", image_url: product.image_url || "", materials: product.materials || "", quantity: 1, unit: "Feet", notes: "" });
  localStorage.setItem("uniking_rfq_cart", JSON.stringify(cart));
  window.dispatchEvent(new Event("rfq_cart_updated"));
  return true;
}

const WELDED_SERIES_LABELS = {
  "Offset Sidebar": "Offset Sidebar (WR Series)",
  "Straight Sidebar": "Straight Sidebar (WRC Series)",
  "Drag Chain": "Drag Chain (WD Series)",
  "Mega Mac": "Mega Mac (WD-MM Series)",
  "Super Mac": "Super Mac (WD-SM Series)"
};

function ViewToggle({ view, onChange }) {
  return (
    <div style={{ display: "flex", border: "1px solid " + C.border, borderRadius: 7, overflow: "hidden" }}>
      {[{ key: "grid", icon: "⊞" }, { key: "list", icon: "☰" }].map(({ key, icon }) =>
        <button key={key} onClick={() => onChange(key)} style={{ padding: "6px 11px", background: view === key ? C.navy : "#fff", color: view === key ? "#fff" : C.muted, border: "none", cursor: "pointer", fontSize: 15, fontWeight: 700, borderRight: key === "grid" ? "1px solid " + C.border : "none" }}>{icon}</button>
      )}
    </div>
  );
}

function WeldedChainCard({ chain, hovered, setHovered, onSelect }) {
  const isHov = hovered === chain.part_number;
  const [added, setAdded] = useState(() => getRFQCart().some((i) => i.id === chain.id));
  useEffect(() => {
    const update = () => setAdded(getRFQCart().some((i) => i.id === chain.id));
    window.addEventListener("rfq_cart_updated", update);
    return () => window.removeEventListener("rfq_cart_updated", update);
  }, [chain.id]);
  function handleRFQ(e) {
    e.stopPropagation();
    if (added) { window.dispatchEvent(new CustomEvent("uniking_go_rfq")); return; }
    addToRFQCart({ id: chain.id, _source: "mac", series: chain.part_number, type: chain.product_type || chain.category || "", style: chain.subcategory || "", category: chain.category || "", image_url: chain.product_image || "", materials: "", application: "" });
    setAdded(true);
  }
  return (
    <div onMouseEnter={() => setHovered(chain.part_number)} onMouseLeave={() => setHovered(null)}
      style={{ background: isHov ? C.navyMid : C.card, border: "1px solid " + (isHov ? C.navyMid : C.border), borderRadius: 10, overflow: "hidden", transition: "all 0.15s", display: "flex", flexDirection: "column" }}>
      {chain.product_image && <div onClick={() => onSelect(chain)} style={{ cursor: "pointer", background: C.bg, borderBottom: "1px solid #f1f5f9", padding: 8, display: "flex", alignItems: "center", justifyContent: "center", height: 110 }}><img src={chain.product_image} alt={chain.part_number} style={{ maxHeight: 98, maxWidth: "86%", objectFit: "contain" }} /></div>}
      <div onClick={() => onSelect(chain)} style={{ padding: "14px 16px", flex: 1, cursor: "pointer" }}>
        <div style={{ fontSize: 15, fontWeight: 800, color: isHov ? "#fff" : C.text, marginBottom: 4 }}>{chain.part_number}</div>
        <div style={{ fontSize: 12, color: isHov ? "rgba(255,255,255,0.65)" : C.muted, marginBottom: 8 }}>{stripVendor(chain.description)?.slice(0, 80)}</div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {chain.related_sprockets?.length > 0 && <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 20, background: isHov ? "rgba(255,255,255,0.15)" : C.bg, color: isHov ? "#fff" : C.muted, border: "1px solid " + (isHov ? "rgba(255,255,255,0.2)" : C.border) }}>{chain.related_sprockets.length} Sprockets</span>}
          {chain.related_pins?.length > 0 && <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 20, background: isHov ? "rgba(255,255,255,0.15)" : C.bg, color: isHov ? "#fff" : C.muted, border: "1px solid " + (isHov ? "rgba(255,255,255,0.2)" : C.border) }}>{chain.related_pins.length} Pins</span>}
          {chain.related_attachments?.length > 0 && <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 20, background: isHov ? "rgba(255,255,255,0.15)" : C.bg, color: isHov ? "#fff" : C.muted, border: "1px solid " + (isHov ? "rgba(255,255,255,0.2)" : C.border) }}>{chain.related_attachments.length} Attachments</span>}
        </div>
      </div>
      <div style={{ padding: "8px 16px", borderTop: "1px solid " + (isHov ? "rgba(255,255,255,0.1)" : C.bg), display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span onClick={() => onSelect(chain)} style={{ fontSize: 11, fontWeight: 600, color: isHov ? "rgba(255,255,255,0.7)" : C.navyMid, cursor: "pointer" }}>View Specs ›</span>
        <button onClick={handleRFQ} style={{ padding: "4px 10px", borderRadius: 5, fontSize: 11, fontWeight: 700, cursor: "pointer", border: added ? "1px solid #16a34a" : "1px solid #2563eb", background: added ? "#f0fdf4" : isHov ? "rgba(255,255,255,0.15)" : "#eff6ff", color: added ? "#16a34a" : isHov ? "#fff" : "#2563eb", transition: "all 0.15s" }}>
          {added ? "✓ In RFQ" : "+ Add to RFQ"}
        </button>
      </div>
    </div>
  );
}

function WeldedChainRow({ chain, onSelect }) {
  const [hov, setHov] = useState(false);
  const [added, setAdded] = useState(() => getRFQCart().some((i) => i.id === chain.id));
  useEffect(() => {
    const update = () => setAdded(getRFQCart().some((i) => i.id === chain.id));
    window.addEventListener("rfq_cart_updated", update);
    return () => window.removeEventListener("rfq_cart_updated", update);
  }, [chain.id]);
  function handleRFQ(e) {
    e.stopPropagation();
    if (added) { window.dispatchEvent(new CustomEvent("uniking_go_rfq")); return; }
    addToRFQCart({ id: chain.id, _source: "mac", series: chain.part_number, type: chain.product_type || chain.category || "", style: chain.subcategory || "", category: chain.category || "", image_url: chain.product_image || "", materials: "", application: "" });
    setAdded(true);
  }
  return (
    <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ background: C.card, border: "1px solid " + (hov ? C.navyMid : C.border), borderRadius: 8, display: "flex", alignItems: "center", overflow: "hidden", transition: "all 0.15s" }}>
      <div style={{ width: 3, alignSelf: "stretch", background: C.navyMid, flexShrink: 0 }} />
      {chain.product_image && <div onClick={() => onSelect(chain)} style={{ width: 64, height: 56, display: "flex", alignItems: "center", justifyContent: "center", background: "#f8fafc", borderRight: "1px solid #f1f5f9", flexShrink: 0, cursor: "pointer" }}><img src={chain.product_image} alt="" style={{ maxHeight: 48, maxWidth: 56, objectFit: "contain" }} onError={(e) => e.target.style.display = "none"} /></div>}
      <div onClick={() => onSelect(chain)} style={{ flex: 1, padding: "10px 14px", cursor: "pointer", minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 800, color: C.text }}>{chain.part_number}</div>
        <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>{chain.subcategory}{chain.product_type ? " · " + chain.product_type : ""}</div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "0 14px", flexShrink: 0 }}>
        <button onClick={handleRFQ} style={{ padding: "5px 10px", borderRadius: 5, fontSize: 11, fontWeight: 700, cursor: "pointer", border: added ? "1px solid #16a34a" : "1px solid #2563eb", background: added ? "#f0fdf4" : "#eff6ff", color: added ? "#16a34a" : "#2563eb" }}>
          {added ? "✓ In RFQ" : "+ RFQ"}
        </button>
        <span onClick={() => onSelect(chain)} style={{ fontSize: 11, fontWeight: 600, color: C.navyMid, whiteSpace: "nowrap", cursor: "pointer" }}>View ›</span>
      </div>
    </div>
  );
}

// MacProductModal is imported inline in Home.jsx — we pass it as a prop here to avoid circular deps
export default function WeldedSeriesView({ MacProductModal }) {
  const [selectedSeries, setSelectedSeries] = useState(null);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [weldedView, setWeldedView] = useState("grid");
  const [hovered, setHovered] = useState(null);
  const [rawMacRecords, setRawMacRecords] = useState(null);
  const [sprocketMap, setSprocketMap] = useState({});
  const [sprocketsLoaded, setSprocketsLoaded] = useState(false);

  useEffect(() => {
    async function fetchWelded() {
      try {
        const res = await fetch("/api/fn/getCatalogData", { method: "GET" });
        if (!res.ok) throw new Error(`getCatalogData returned ${res.status}`);
        const { macChainProducts } = await res.json();
        setRawMacRecords((macChainProducts || []).filter((r) => r.category === "Welded Steel Chain"));
      } catch (e) {
        console.error("WeldedSeriesView fetch error:", e);
        setRawMacRecords([]);
      }
    }
    fetchWelded();
  }, []);

  const loadSprockets = async () => {
    if (sprocketsLoaded) return;
    setSprocketsLoaded(true);
    try {
      const res = await fetch("/api/fn/getCatalogData", { method: "GET" });
      const { macChainProducts } = await res.json();
      const all = (macChainProducts || []).filter((r) => r.product_type === "Sprocket");
      const m = {};
      for (const r of all) {
        if (r.slug) m[r.slug] = r;
        if (r.part_number) m[r.part_number.toLowerCase()] = r;
      }
      setSprocketMap(m);
    } catch (e) { console.error("Sprocket load error:", e); }
  };

  const slugMap = useMemo(() => {
    const m = {};
    for (const r of rawMacRecords || []) { if (r.slug) m[r.slug] = r; }
    return m;
  }, [rawMacRecords]);

  const weldedChains = useMemo(() => {
    if (!rawMacRecords?.length) return [];
    return rawMacRecords.filter((r) => r.category === "Welded Steel Chain" && r.product_type === "Chain");
  }, [rawMacRecords]);

  const grouped = useMemo(() => {
    const g = {};
    for (const r of weldedChains) {
      const sub = r.subcategory || "Other";
      if (!g[sub]) g[sub] = [];
      if (!g[sub].find((x) => x.part_number === r.part_number)) g[sub].push(r);
    }
    return g;
  }, [weldedChains]);

  const seriesOrder = ["Offset Sidebar", "Straight Sidebar", "Drag Chain", "Mega Mac", "Super Mac"];

  if (selectedSeries) {
    const chains = grouped[selectedSeries] || [];
    return (
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
          <button onClick={() => setSelectedSeries(null)} style={{ background: "none", border: "1px solid " + C.border, borderRadius: 6, padding: "6px 14px", cursor: "pointer", fontSize: 13, color: C.muted }}>← Back</button>
          <div>
            <div style={{ fontSize: 20, fontWeight: 800, color: C.text }}>{WELDED_SERIES_LABELS[selectedSeries] || selectedSeries}</div>
            <div style={{ fontSize: 13, color: C.muted }}>{chains.length} chain series available</div>
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
          <ViewToggle view={weldedView} onChange={setWeldedView} />
        </div>
        {weldedView === "grid"
          ? <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px,1fr))", gap: 14 }}>{chains.map((chain) => <WeldedChainCard key={chain.id || chain.part_number} chain={chain} hovered={hovered} setHovered={setHovered} onSelect={setSelectedRecord} />)}</div>
          : <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>{chains.map((chain) => <WeldedChainRow key={chain.id || chain.part_number} chain={chain} onSelect={setSelectedRecord} />)}</div>
        }
        {selectedRecord && MacProductModal && <MacProductModal record={selectedRecord} slugMap={slugMap} sprocketMap={sprocketMap} loadSprockets={loadSprockets} onSelect={setSelectedRecord} onClose={() => setSelectedRecord(null)} />}
      </div>
    );
  }

  if (rawMacRecords === null) return <div style={{ padding: 40, textAlign: "center", color: C.muted }}><div style={{ fontSize: 32, marginBottom: 12 }}>⛓</div><div style={{ fontSize: 16, fontWeight: 600 }}>Loading Welded Steel Chain data...</div></div>;
  if (weldedChains.length === 0) return <div style={{ padding: 40, textAlign: "center", color: C.muted }}><div style={{ fontSize: 32, marginBottom: 12 }}>⛓</div><div style={{ fontSize: 16, fontWeight: 600 }}>No chain records found</div></div>;

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 22, fontWeight: 800, color: C.text, marginBottom: 4 }}>Welded Steel Chain</div>
        <div style={{ fontSize: 14, color: C.muted }}>Select a chain series to browse products, specifications, and compatible components</div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px,1fr))", gap: 14 }}>
        {seriesOrder.filter((s) => grouped[s]?.length > 0).map((sub) =>
          <div key={sub} onClick={() => setSelectedSeries(sub)}
            onMouseEnter={() => setHovered(sub)} onMouseLeave={() => setHovered(null)}
            style={{ background: hovered === sub ? C.navyMid : C.card, border: "1px solid " + (hovered === sub ? C.navyMid : C.border), borderRadius: 8, padding: "18px 20px", cursor: "pointer", transition: "all 0.15s" }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: hovered === sub ? "#fff" : C.text, marginBottom: 4 }}>{WELDED_SERIES_LABELS[sub] || sub}</div>
            <div style={{ fontSize: 12, color: hovered === sub ? "rgba(255,255,255,0.6)" : C.muted, marginBottom: 8 }}>{grouped[sub].length} chain series</div>
            <div style={{ fontSize: 11, color: hovered === sub ? "rgba(255,255,255,0.45)" : C.muted }}>Browse →</div>
          </div>
        )}
      </div>
    </div>
  );
}