// Supplier selector — equal-weight cards for Maxi-Lift / Tapco / 4B
const NAVY = "#1a3a5c";

const SUPPLIERS = [
  {
    key: "Maxi-Lift",
    logo: null,
    tagline: "Agricultural & Industrial Elevator Buckets",
    color: "#b45309", bg: "#fffbeb", border: "#fde68a",
    url: "https://maxilift.com",
    desc: "Tiger-Tuff, Maxi-Tuff, HD-Max and more — the broadest range of polyethylene, nylon and urethane bucket styles for grain elevators.",
    ag: ["Tiger-Tuff CC", "HD-Max", "HD-Max LP", "HD-Stax", "Dura-Buket"],
    ind: ["Maxi-Tuff AA", "Maxi-Tuff MF", "DI-Max AA", "DI-Max AC"],
  },
  {
    key: "Tapco",
    logo: null,
    tagline: "The Largest Manufacturer of Elevator Buckets in North America",
    color: "#1d4ed8", bg: "#eff6ff", border: "#bfdbfe",
    url: "https://tapcoinc.com",
    desc: "CC-HD, CC-XD, AA-RB and Super EuroBucket styles — high-efficiency buckets engineered for maximum throughput and durability.",
    ag: ["CC-HD", "CC-XD", "CCHD-LP", "CCXD-LP", "U-HD"],
    ind: ["AA", "AA-RB", "Super EuroBucket", "AC", "Super Capacity (SC)"],
  },
  {
    key: "4B",
    logo: null,
    tagline: "Worldwide Manufacturer of Bucket Elevator Components",
    color: "#b91c1c", bg: "#fef2f2", border: "#fecaca",
    url: "https://www.go4b.com",
    desc: "Starco, Super Starco, JUMBO CC-S, GB Spidex and Nylathane buckets — from agricultural grain to heavy industrial aggregates.",
    ag: ["Starco LP (Plastic)", "Starco LP (Steel)", "Super Starco LP", "GB Spidex"],
    ind: ["JUMBO CC-S", "AC Nylathane", "GB Spidex"],
  },
];

function normSupplier(vendor) {
  if (!vendor) return "";
  const v = vendor.toLowerCase();
  if (v.includes("maxi") || v === "maxilift") return "Maxi-Lift";
  if (v.includes("tapco")) return "Tapco";
  if (v === "4b" || v.includes("4b braime") || v.includes("4 b")) return "4B";
  return vendor;
}

export default function ElevSupplierGrid({ buckets, onSelectSupplier, onBack }) {
  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "24px clamp(12px,4vw,32px)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24, flexWrap: "wrap" }}>
        <button onClick={onBack} className="uk-btn-back">← Back</button>
        <div>
          <div style={{ fontSize: 22, fontWeight: 900, color: NAVY }}>Elevator Buckets</div>
          <div style={{ fontSize: 13, color: "#6b7280", marginTop: 2 }}>Select a supplier to browse bucket styles</div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 300px), 1fr))", gap: 18 }}>
        {SUPPLIERS.map(sup => {
          const dbCount = buckets.filter(b => normSupplier(b.supplier || b.vendor) === sup.key).length;
          return (
            <div key={sup.key}
              onClick={() => onSelectSupplier(sup.key)}
              style={{ background: "#fff", border: `1px solid ${sup.border}`, borderRadius: 16, padding: "24px 22px", cursor: "pointer", transition: "all 0.18s", boxShadow: "0 1px 4px rgba(0,0,0,0.04)", position: "relative", overflow: "hidden" }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = `0 10px 32px ${sup.color}22`; e.currentTarget.style.borderColor = sup.color; }}
              onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,0.04)"; e.currentTarget.style.borderColor = sup.border; }}>
              {/* Accent bar */}
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, ${sup.color}, ${sup.color}88)` }} />
              {/* Header */}
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                <div style={{ width: 44, height: 44, borderRadius: 10, background: sup.bg, border: `1px solid ${sup.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>🪣</div>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 900, color: "#0f172a" }}>{sup.key}</div>
                  <div style={{ fontSize: 11, color: sup.color, fontWeight: 600, lineHeight: 1.4 }}>{sup.tagline}</div>
                </div>
              </div>
              <div style={{ fontSize: 12, color: "#6b7280", lineHeight: 1.6, marginBottom: 14 }}>{sup.desc}</div>
              {/* Style tags */}
              <div style={{ marginBottom: 10 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: "#065f46", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 5 }}>Agricultural</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 8 }}>
                  {sup.ag.map(s => <span key={s} style={{ fontSize: 10, background: "#ecfdf5", color: "#065f46", padding: "2px 8px", borderRadius: 99, fontWeight: 600 }}>{s}</span>)}
                </div>
                <div style={{ fontSize: 10, fontWeight: 700, color: "#1d4ed8", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 5 }}>Industrial</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                  {sup.ind.map(s => <span key={s} style={{ fontSize: 10, background: "#eff6ff", color: "#1d4ed8", padding: "2px 8px", borderRadius: 99, fontWeight: 600 }}>{s}</span>)}
                </div>
              </div>
              {/* Footer */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #f3f4f6", paddingTop: 12, marginTop: 6 }}>
                <span style={{ fontSize: 11, color: "#9ca3af" }}>{dbCount > 0 ? `${dbCount} styles in catalog` : "Styles available"}</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: sup.color }}>Browse →</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}