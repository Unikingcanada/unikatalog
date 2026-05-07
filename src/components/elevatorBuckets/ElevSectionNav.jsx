// Top-level section navigator — 4 tiles: Buckets / Belts / Hardware / Splices
export default function ElevSectionNav({ onSelect }) {
  const NAVY = "#1a3a5c";
  const TILES = [
    {
      key: "buckets",
      icon: "🪣",
      label: "Buckets",
      desc: "Agricultural & industrial elevator buckets — Maxi-Lift, Tapco, 4B",
      color: "#b45309", bg: "#fffbeb", border: "#fde68a",
    },
    {
      key: "belts",
      icon: "📏",
      label: "Belts",
      desc: "Rubber & PVC elevator belting — all widths, all suppliers",
      color: "#065f46", bg: "#ecfdf5", border: "#6ee7b7",
    },
    {
      key: "hardware",
      icon: "🔩",
      label: "Hardware",
      desc: "Elevator bolts & nuts — Standard, Sabre-Tooth, Norway Flat, Countersunk",
      color: "#4338ca", bg: "#ede9fe", border: "#a5b4fc",
    },
    {
      key: "splices",
      icon: "🔗",
      label: "Splices",
      desc: "Mechanical belt splices — Dura-Splice, Maxi-Splice, Jackson Plate, 4B Fasteners",
      color: "#0369a1", bg: "#e0f2fe", border: "#7dd3fc",
    },
  ];

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "28px clamp(12px,4vw,32px)" }}>
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 22, fontWeight: 900, color: NAVY, marginBottom: 6 }}>Elevator Buckets & Accessories</div>
        <div style={{ fontSize: 14, color: "#6b7280", lineHeight: 1.6 }}>
          Select a category to browse and configure components for your bucket elevator system.
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 240px), 1fr))", gap: 16 }}>
        {TILES.map(t => (
          <SectionTile key={t.key} tile={t} onClick={() => onSelect(t.key)} />
        ))}
      </div>
    </div>
  );
}

function SectionTile({ tile, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        background: "#fff",
        border: `1px solid ${tile.border}`,
        borderRadius: 14,
        padding: "22px 20px",
        cursor: "pointer",
        transition: "all 0.18s",
        display: "flex",
        flexDirection: "column",
        gap: 10,
        boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
      }}
      onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = `0 8px 28px ${tile.color}22`; e.currentTarget.style.borderColor = tile.color; }}
      onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,0.04)"; e.currentTarget.style.borderColor = tile.border; }}
    >
      <div style={{ width: 44, height: 44, borderRadius: 12, background: tile.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>
        {tile.icon}
      </div>
      <div>
        <div style={{ fontSize: 17, fontWeight: 900, color: "#0f172a", marginBottom: 5 }}>{tile.label}</div>
        <div style={{ fontSize: 12, color: "#6b7280", lineHeight: 1.6 }}>{tile.desc}</div>
      </div>
      <div style={{ marginTop: "auto", fontSize: 12, fontWeight: 700, color: tile.color }}>Browse {tile.label} →</div>
    </div>
  );
}