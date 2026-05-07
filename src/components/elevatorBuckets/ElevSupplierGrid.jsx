// Supplier selector — shows Maxi-Lift / Tapco / 4B as neutral brand cards
import { SUPPLIER_INFO } from "@/lib/elevatorAccessoriesData";

const NAVY = "#1a3a5c";

const SUPPLIER_STYLES = {
  "Maxi-Lift": {
    styles: [
      { key: "Tiger-Tuff", app: "Agricultural", desc: "CC-style high-impact ag bucket — most popular style" },
      { key: "Tiger-CC", app: "Agricultural", desc: "Standard CC agricultural bucket" },
      { key: "HD-Max", app: "Agricultural", desc: "Heavy duty maximum capacity ag bucket" },
      { key: "HD-Max Low Profile", app: "Agricultural", desc: "Low-profile version of HD-Max" },
      { key: "HD-Stax", app: "Agricultural", desc: "Stackable heavy duty ag bucket" },
      { key: "Dura-Buket", app: "Agricultural", desc: "Durable general-purpose ag bucket" },
      { key: "Peanut Buket", app: "Agricultural", desc: "Specialty peanut harvesting bucket" },
      { key: "Maxi-Tuff AA", app: "Industrial", desc: "AA-style industrial maximum capacity" },
      { key: "Maxi-Tuff MF", app: "Industrial", desc: "Minimum flare industrial bucket" },
      { key: "Tiger-Tuff Industrial", app: "Industrial", desc: "Industrial-rated Tiger-Tuff" },
      { key: "Tiger-CC Industrial", app: "Industrial", desc: "Industrial CC-style high-impact bucket" },
      { key: "DI-Max AA", app: "Industrial", desc: "Ductile iron / maximum capacity industrial AA" },
      { key: "DI-Max AC", app: "Industrial", desc: "Ductile iron AC-style industrial bucket" },
    ],
  },
  "Tapco": {
    styles: [
      { key: "CC-HD", app: "Agricultural", desc: "Heavy Duty CC bucket" },
      { key: "CC-XD", app: "Agricultural", desc: "Xtreme Duty CC bucket" },
      { key: "CCHD-LP", app: "Agricultural", desc: "CC-HD Low Profile" },
      { key: "CCXD-LP", app: "Agricultural", desc: "CC-XD Low Profile" },
      { key: "U-HD", app: "Agricultural", desc: "U-style Heavy Duty" },
      { key: "AA", app: "Industrial", desc: "AA-style maximum capacity" },
      { key: "AA-RB", app: "Industrial", desc: "AA with reinforced back" },
      { key: "Super EuroBucket", app: "Industrial", desc: "European-style high capacity" },
      { key: "AC", app: "Industrial", desc: "AC-style steel bucket" },
      { key: "ACS", app: "Industrial", desc: "Fabricated steel AC bucket" },
      { key: "Super Capacity (SC)", app: "Industrial", desc: "Maximum capacity super bucket" },
    ],
  },
  "4B": {
    styles: [
      { key: "Starco Low Profile (Plastic)", app: "Agricultural", desc: "Plastic low-profile Starco bucket" },
      { key: "Starco Low Profile (Steel)", app: "Industrial", desc: "Steel low-profile Starco bucket" },
      { key: "Super Starco (Steel)", app: "Industrial", desc: "Heavy-duty steel Starco bucket" },
      { key: "A Type (Steel)", app: "Industrial", desc: "Standard A-type steel bucket" },
      { key: "D Type (Steel)", app: "Industrial", desc: "D-type steel bucket" },
      { key: "GB Spidex (Steel)", app: "Industrial", desc: "Spidex reinforced steel bucket" },
      { key: "AC Nylathane", app: "Industrial", desc: "AC-style Nylathane compound bucket" },
    ],
  },
};

export default function ElevSupplierGrid({ buckets, onSelectSupplier, onBack }) {
  const suppliers = ["Maxi-Lift", "Tapco", "4B"];

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "24px clamp(12px,4vw,32px)" }}>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 20, fontWeight: 900, color: NAVY, marginBottom: 4 }}>Elevator Buckets — Select Supplier</div>
        <div style={{ fontSize: 13, color: "#6b7280" }}>
          We supply from three major bucket manufacturers. Select a brand to browse styles and request a quote.
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 300px), 1fr))", gap: 16 }}>
        {suppliers.map(sup => {
          const info = SUPPLIER_INFO[sup] || {};
          const styles = SUPPLIER_STYLES[sup]?.styles || [];
          const dbCount = buckets.filter(b => b.vendor === sup).length;
          const agStyles = styles.filter(s => s.app === "Agricultural");
          const indStyles = styles.filter(s => s.app === "Industrial");
          return (
            <div key={sup}
              onClick={() => onSelectSupplier(sup)}
              style={{ background: "#fff", border: `1px solid ${info.border || "#e5e7eb"}`, borderRadius: 14, padding: "22px 20px", cursor: "pointer", transition: "all 0.18s", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = `0 8px 28px ${info.color || "#ccc"}22`; e.currentTarget.style.borderColor = info.color || "#e5e7eb"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,0.04)"; e.currentTarget.style.borderColor = info.border || "#e5e7eb"; }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: info.bg, border: `1px solid ${info.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>🪣</div>
                <div>
                  <div style={{ fontSize: 17, fontWeight: 900, color: "#0f172a" }}>{sup}</div>
                  <div style={{ fontSize: 11, color: info.color, fontWeight: 600 }}>{info.tagline}</div>
                </div>
              </div>
              {agStyles.length > 0 && (
                <div style={{ marginBottom: 8 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: "#065f46", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 4 }}>Agricultural</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                    {agStyles.map(s => <span key={s.key} style={{ fontSize: 10, background: "#ecfdf5", color: "#065f46", padding: "2px 8px", borderRadius: 99, fontWeight: 600 }}>{s.key}</span>)}
                  </div>
                </div>
              )}
              {indStyles.length > 0 && (
                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: "#1d4ed8", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 4 }}>Industrial</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                    {indStyles.map(s => <span key={s.key} style={{ fontSize: 10, background: "#eff6ff", color: "#1d4ed8", padding: "2px 8px", borderRadius: 99, fontWeight: 600 }}>{s.key}</span>)}
                  </div>
                </div>
              )}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #f3f4f6", paddingTop: 10, marginTop: 4 }}>
                <span style={{ fontSize: 11, color: "#9ca3af" }}>{dbCount > 0 ? `${dbCount} series in catalog` : `${styles.length} styles`}</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: info.color }}>Browse →</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}