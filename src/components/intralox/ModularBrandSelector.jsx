// Brand selector grid for Modular Belting category
// Shows: Intralox, Movex, Rexnord, Regina, Uni, Forbo / Forbo Siegling

const C = {
  navy: "#0F2340", navyMid: "#1A3A5C", navyLight: "#2A5080",
  gold: "#C9A84C", border: "#e2e8f0", muted: "#64748b", bg: "#f8fafc", text: "#0f172a",
};
const INTRALOX_RED = "#E31837";
const LOGO_URL = "https://media.base44.com/images/public/69dd9ffccab4dd693d4d92f5/e48ee59d9_Unitingthestrongestlinks_20251031_225809_0000.png";
const INTRALOX_LOGO = "https://media.base44.com/images/public/69ebd56ae74b0ffcc2427c7a/64536dc1d_intralox-logo-box-194a1e40631d2cf9cd7d463fa5afc04b.svg";

const BRANDS = [
  {
    key: "intralox",
    name: "Intralox",
    tagline: "Modular Plastic Belting (MPB)",
    description: "The world leader in modular plastic belting. Straight-running, radius, and spiral belt systems from Series 100 to Series 10000.",
    logo: INTRALOX_LOGO,
    logoBg: "#fff",
    accentColor: INTRALOX_RED,
    available: true,
    features: ["Straight-Running", "Radius", "Spiral", "Belt Support Tools", "24 Straight + 6 Radius + 2 Spiral Series"],
  },
  {
    key: "systemplast",
    name: "System Plast",
    tagline: "Modular Belts & Sprockets — Regal Rexnord",
    description: "System Plast (Regal Rexnord) offers a comprehensive range of modular plastic belts and sprockets. 8 mm to 63.5 mm pitch. NGevo material for longer wear life.",
    logo: "https://media.base44.com/images/public/69ebd56ae74b0ffcc2427c7a/65db03af1_System-Plast-logo.png",
    logoBg: "#fff",
    accentColor: "#0057A8",
    available: true,
    features: ["8 mm to 63.5 mm Pitch", "NGevo Material", "Raised Rib (2500RR)", "Anti-Slip (2508/2630)", "Magnetic Chainbelt", "Smart Guide Rev.005"],
  },
  {
    key: "rexnord",
    name: "Rexnord",
    tagline: "Modular Conveyor Belts & Components",
    description: "Rexnord offers a complete line of modular plastic conveyor belts, chains, and accessories for food, packaging, and industrial applications.",
    logo: "https://media.base44.com/images/public/69ebd56ae74b0ffcc2427c7a/8086b3ebe_1762088522rexnord-logo-new.svg",
    logoBg: "#fff",
    accentColor: "#B71C1C",
    available: false,
    features: ["MatTop Chains", "TableTop Chains", "Modular Belts", "Packaging Lines"],
  },
  {
    key: "movex",
    name: "Movex",
    tagline: "Italian Innovation — Blueline® Food Grade",
    description: "Movex S.p.A. (Italy) manufactures high-quality modular belts for beverage, food, logistics, and automotive industries. The Blueline® range covers meat, poultry, seafood, and bakery.",
    logo: "https://media.base44.com/images/public/69ebd56ae74b0ffcc2427c7a/8acc5f5a2_movex-logo-news-01.png",
    logoBg: "#fff",
    accentColor: "#E63946",
    available: true,
    features: ["8 mm to 50.8 mm Pitch", "Blueline® Food Grade", "Sideflexing Belts", "BluLub® Self-Lubricating POM", "Interchangeable Design"],
  },
  {
    key: "uni",
    name: "Uni-Chains",
    tagline: "Plastic Conveyor Chains & Belts",
    description: "Uni-Chains (formerly Uni-Kæden) manufactures a comprehensive range of modular plastic belts, flat-top chains, and conveyor components.",
    logo: "https://media.base44.com/images/public/69ebd56ae74b0ffcc2427c7a/9bea8e86c_uni.webp",
    logoBg: "#fff",
    accentColor: "#E85D04",
    available: false,
    features: ["Sideflexing Chains", "Flat Top Chains", "Modular Belts", "Food Grade Materials"],
  },
  {
    key: "regina",
    name: "Regina",
    tagline: "Power Transmission & Conveying Solutions",
    description: "Regina provides modular plastic belts alongside roller chains and conveyor components for diverse industrial applications.",
    logo: "https://media.base44.com/images/public/69ebd56ae74b0ffcc2427c7a/faa575d0c_Regina-Logo-e1587655270372.webp",
    logoBg: "#fff",
    accentColor: "#F5C400",
    available: false,
    features: ["Modular Plastic Belts", "Roller Chains", "TableTop Chains", "Industrial Conveying"],
  },
  {
    key: "forbo",
    name: "Forbo / Forbo Siegling",
    tagline: "Conveyor & Processing Belts",
    description: "Forbo Siegling offers Siegling Transilon conveyor belts, Siegling Prolink modular belts, and comprehensive processing belt solutions.",
    logo: "https://media.base44.com/images/public/69ebd56ae74b0ffcc2427c7a/0b95c51db_logo-forbo.webp",
    logoBg: "#fff",
    accentColor: "#0077C8",
    available: false,
    features: ["Transilon Conveyor Belts", "Prolink Modular Belts", "Processing Belts", "Flat Belts"],
  },
];

import { useState } from "react";

export default function ModularBrandSelector({ onSelectBrand, onBack }) {
  const [hovered, setHovered] = useState(null);

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "'Inter','Segoe UI',Arial,sans-serif" }}>

      {/* Hero */}
      <div style={{ background: `linear-gradient(135deg, ${C.navy} 0%, ${C.navyLight} 100%)`, padding: "32px clamp(16px,4vw,32px) 28px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 8 }}>
            Modular Plastic Belting
          </div>
          <h1 style={{ color: "#fff", fontSize: 28, fontWeight: 900, margin: "0 0 10px" }}>Select a Brand</h1>
          <p style={{ color: "rgba(255,255,255,0.65)", fontSize: 14, margin: 0, maxWidth: 560, lineHeight: 1.75 }}>
            Browse modular plastic belting by manufacturer. Select a brand to view available series, belt styles, sprockets, and configurator tools.
          </p>
        </div>
      </div>

      {/* Brand grid */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px clamp(16px,4vw,32px) 80px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 20 }}>
          {BRANDS.map((brand, idx) => (
            <div
              key={brand.key + idx}
              onMouseEnter={() => setHovered(brand.key)}
              onMouseLeave={() => setHovered(null)}
              onClick={() => brand.available && onSelectBrand(brand.key)}
              style={{
                background: "#fff",
                borderRadius: 14,
                border: `2px solid ${hovered === brand.key && brand.available ? brand.accentColor : C.border}`,
                overflow: "hidden",
                transition: "all 0.18s",
                boxShadow: hovered === brand.key && brand.available ? "0 8px 28px rgba(15,35,64,0.12)" : "0 1px 4px rgba(0,0,0,0.05)",
                transform: hovered === brand.key && brand.available ? "translateY(-3px)" : "none",
                cursor: brand.available ? "pointer" : "default",
                opacity: brand.available ? 1 : 0.7,
                display: "flex",
                flexDirection: "column",
              }}
            >
              {/* Brand color accent */}
              <div style={{ height: 4, background: brand.accentColor }} />

              {/* Brand header */}
              <div style={{ padding: "18px 20px 14px", display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{ width: 80, height: 44, borderRadius: 8, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, border: `1px solid ${C.border}`, padding: "4px 8px" }}>
                  <img src={brand.logo} alt={brand.name} style={{ maxWidth: 72, maxHeight: 36, objectFit: "contain" }} />
                </div>
                <div>
                  <div style={{ fontSize: 17, fontWeight: 800, color: C.text }}>{brand.name}</div>
                  <div style={{ fontSize: 11, color: C.muted, marginTop: 1 }}>{brand.tagline}</div>
                </div>
                {!brand.available && (
                  <div style={{ marginLeft: "auto", fontSize: 10, fontWeight: 700, background: "#f1f5f9", color: C.muted, padding: "3px 8px", borderRadius: 20, whiteSpace: "nowrap", flexShrink: 0 }}>
                    Coming Soon
                  </div>
                )}
              </div>

              {/* Description */}
              <div style={{ padding: "0 20px 14px", flex: 1 }}>
                <p style={{ fontSize: 12, color: C.muted, margin: 0, lineHeight: 1.7 }}>{brand.description}</p>
              </div>

              {/* Features */}
              <div style={{ padding: "0 20px 14px" }}>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {brand.features.map(f => (
                    <span key={f} style={{ fontSize: 10, fontWeight: 600, background: "#f1f5f9", color: C.navyMid, padding: "3px 8px", borderRadius: 10 }}>{f}</span>
                  ))}
                </div>
              </div>

              {/* CTA */}
              <div style={{ padding: "12px 20px 16px", borderTop: `1px solid ${C.border}` }}>
                {brand.available ? (
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: brand.accentColor }}>View Products →</span>
                    <div style={{ width: 28, height: 28, borderRadius: "50%", background: hovered === brand.key ? brand.accentColor : "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", transition: "background 0.15s" }}>
                      <span style={{ color: hovered === brand.key ? "#fff" : C.muted, fontSize: 14, fontWeight: 700 }}>›</span>
                    </div>
                  </div>
                ) : (
                  <div style={{ fontSize: 11, color: C.muted, fontStyle: "italic" }}>
                    Contact Uniking to inquire about {brand.name} products.
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Info note */}
        <div style={{ marginTop: 40, background: "#fff", borderRadius: 12, border: `1px solid ${C.border}`, padding: "18px 22px", display: "flex", gap: 14, alignItems: "flex-start" }}>
          <div style={{ fontSize: 20 }}>ℹ️</div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: C.navyMid, marginBottom: 4 }}>Additional Brands Available</div>
            <div style={{ fontSize: 13, color: C.muted, lineHeight: 1.7 }}>
              Uniking Canada sources modular belting from all major manufacturers. If you don't see your preferred brand, contact us — we can supply Movex, Rexnord, Regina, Uni-Chains, Forbo Siegling, and other brands. All configurations are reviewed and confirmed before production.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}