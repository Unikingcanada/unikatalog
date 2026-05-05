const C = { navy: "#0F2340", navyMid: "#1A3A5C", gold: "#C9A84C", border: "#e2e8f0", muted: "#64748b", text: "#0f172a", bg: "#f8fafc" };

const FEATURES = [
  { icon: "⚡", title: "Positive Gripping Action", desc: "Hardened tooth tips penetrate material surface for positive, slip-free grip — even on wet, muddy, or ice-covered logs." },
  { icon: "🎯", title: "Controlled Feed", desc: "Precise log positioning into saws and machinery. Consistent feeding speed eliminates variation and reduces saw damage." },
  { icon: "🔒", title: "Reduced Slippage", desc: "Eliminates log roll-back and slippage under load. Critical for safe, accurate processing of round logs and cants." },
  { icon: "🏭", title: "High-Speed Sawmill Ready", desc: "Engineered for continuous high-speed sawmill operation. Solid rollers, quad-staked pins, and heat-treated construction." },
];

export default function SharpTopIntro({ onExplore }) {
  return (
    <div style={{ background: "#fff", borderRadius: 14, border: `1px solid ${C.border}`, overflow: "hidden", marginBottom: 28 }}>
      {/* Hero band */}
      <div style={{ background: `linear-gradient(135deg, ${C.navy} 0%, #1e4a6e 100%)`, padding: "28px 32px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
          <span style={{ fontSize: 22 }}>⛓</span>
          <span style={{ color: C.gold, fontSize: 12, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase" }}>Forestry Industry · Sawmill Chain</span>
        </div>
        <h2 style={{ color: "#fff", fontSize: 26, fontWeight: 900, margin: "0 0 8px", lineHeight: 1.2 }}>
          SharpTop Conveyor Chains
        </h2>
        <p style={{ color: "rgba(255,255,255,0.75)", fontSize: 14, margin: "0 0 18px", maxWidth: 680, lineHeight: 1.7 }}>
          SharpTop chains are specialized conveyor chains with pointed or toothed sideplate profiles designed to
          grip logs, cants, and lumber for controlled feeding and positioning into saws and processing machinery.
          Built for the harsh demands of the sawmill industry — rugged, long-lasting, and resistant to deformation.
        </p>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {["Quad-Staked Pins", "Solid Rollers", "Heat Treated & Shot Peened", "Ground Bottom Surfaces", "Induction Hardened Available"].map(tag => (
            <span key={tag} style={{ background: "rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.9)", padding: "4px 12px", borderRadius: 20, fontSize: 11, fontWeight: 600 }}>{tag}</span>
          ))}
        </div>
      </div>

      {/* Key features */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 0, borderTop: `3px solid ${C.gold}` }}>
        {FEATURES.map((f, i) => (
          <div key={i} style={{ padding: "18px 20px", borderRight: i < FEATURES.length - 1 ? `1px solid ${C.border}` : "none", borderBottom: "none" }}>
            <div style={{ fontSize: 22, marginBottom: 8 }}>{f.icon}</div>
            <div style={{ fontSize: 13, fontWeight: 800, color: C.text, marginBottom: 5 }}>{f.title}</div>
            <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.6 }}>{f.desc}</div>
          </div>
        ))}
      </div>

      {/* Normalization note */}
      <div style={{ padding: "12px 32px", background: "#f0f9ff", borderTop: `1px solid #bae6fd`, display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        <span style={{ fontSize: 13 }}>ℹ️</span>
        <span style={{ fontSize: 12, color: "#0369a1", lineHeight: 1.6 }}>
          <strong>Brand-Neutral Catalog:</strong> This catalog is normalized by chain size and configuration — not by brand.
          Viking, Summit, and Connexus chains with the same specifications are the same product.
          Select the chain number and configuration that matches your application.
        </span>
      </div>
    </div>
  );
}