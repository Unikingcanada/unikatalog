// Hero + 4 section tiles: Buckets / Belts / Hardware / Splices
const NAVY = "#1a3a5c";

const TILES = [
  {
    key: "buckets",
    icon: "🪣",
    label: "Buckets",
    desc: "Agricultural & industrial elevator buckets — Maxi-Lift, Tapco, 4B",
    color: "#b45309", bg: "#fffbeb", border: "#fde68a", accentBar: "linear-gradient(90deg,#b45309,#f59e0b)",
  },
  {
    key: "belts",
    icon: "📏",
    label: "Belts",
    desc: "Rubber & PVC elevator belting — grain, abrasion-resistant, FDA, steel web cord",
    color: "#065f46", bg: "#ecfdf5", border: "#6ee7b7", accentBar: "linear-gradient(90deg,#065f46,#10b981)",
  },
  {
    key: "hardware",
    icon: "🔩",
    label: "Hardware",
    desc: "Elevator bolts — Norway, Fanged, Easifit, Euro DIN, REF 70, nuts & washers",
    color: "#4338ca", bg: "#ede9fe", border: "#a5b4fc", accentBar: "linear-gradient(90deg,#4338ca,#818cf8)",
  },
  {
    key: "splices",
    icon: "🔗",
    label: "Splices",
    desc: "Mechanical belt splices — Vise, Gripwell, Supergrip, Braime Clamp",
    color: "#0369a1", bg: "#e0f2fe", border: "#7dd3fc", accentBar: "linear-gradient(90deg,#0369a1,#38bdf8)",
  },
];

export default function ElevSectionNav({ onSelect }) {
  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "24px clamp(12px,4vw,32px) 32px" }}>
      {/* Hero */}
      <div style={{ background: `linear-gradient(135deg, ${NAVY} 0%, #2d5986 100%)`, borderRadius: 16, padding: "28px 32px", marginBottom: 28, display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
        <div style={{ fontSize: 36 }}>🪣</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 24, fontWeight: 900, color: "#fff", marginBottom: 6 }}>Elevator Buckets & Accessories</div>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.65)", lineHeight: 1.6, maxWidth: 560 }}>
            Complete bucket elevator components catalog — Maxi-Lift, Tapco & 4B buckets, belting, hardware and splices. Select a category to browse and configure.
          </div>
        </div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {["Maxi-Lift", "Tapco", "4B"].map(s => (
            <span key={s} style={{ fontSize: 10, fontWeight: 700, padding: "3px 10px", borderRadius: 99, background: "rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.75)", border: "1px solid rgba(255,255,255,0.2)" }}>{s}</span>
          ))}
        </div>
      </div>

      {/* Tile grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 240px), 1fr))", gap: 16 }}>
        {TILES.map(t => (
          <div key={t.key}
            onClick={() => onSelect(t.key)}
            style={{ background: "#fff", border: `1px solid ${t.border}`, borderRadius: 14, padding: "22px 20px", cursor: "pointer", transition: "all 0.18s", display: "flex", flexDirection: "column", gap: 12, boxShadow: "0 1px 4px rgba(0,0,0,0.04)", overflow: "hidden", position: "relative" }}
            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = `0 8px 28px ${t.color}22`; e.currentTarget.style.borderColor = t.color; }}
            onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,0.04)"; e.currentTarget.style.borderColor = t.border; }}>
            <div style={{ height: 3, background: t.accentBar, borderRadius: 2, position: "absolute", top: 0, left: 0, right: 0 }} />
            <div style={{ width: 48, height: 48, borderRadius: 12, background: t.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, flexShrink: 0, marginTop: 4 }}>
              {t.icon}
            </div>
            <div>
              <div style={{ fontSize: 17, fontWeight: 900, color: "#0f172a", marginBottom: 6 }}>{t.label}</div>
              <div style={{ fontSize: 12, color: "#6b7280", lineHeight: 1.6 }}>{t.desc}</div>
            </div>
            <div style={{ marginTop: "auto", fontSize: 12, fontWeight: 700, color: t.color }}>Browse {t.label} →</div>
          </div>
        ))}
      </div>
    </div>
  );
}