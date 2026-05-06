import { useState } from "react";

const C = {
  navy: "#003c5b", navyMid: "#1A3A5C", navyLight: "#2A5080",
  card: "#ffffff", border: "#e2e8f0", text: "#0f172a", muted: "#64748b",
};

const CHAIN_SUBTYPE_KEYS = new Set([
  "ANSI/BS Chain", "Engineered Chain", "Cast Chain",
  "Welded Steel Chain", "Forged Chain", "Overhead Chain", "Sharptop Chain",
  "Kiln Chain", "Thermoforming Chain", "Conveyor Chain", "Table Top Chain",
  "Pintle Chain", "Long Link Chain", "Special Application Chain"
]);

const CATEGORY_IMAGES = {
  "__chain__":             "https://media.base44.com/images/public/69ebd56ae74b0ffcc2427c7a/b20f0b73a_Gemini_Generated_Image_4tqfl4tqfl4tqfl4.png",
  "Modular Belt":          "https://media.base44.com/images/public/69ebd56ae74b0ffcc2427c7a/27e386ff8_modular-plastic-belting-3_2.jpg",
  "Elevator Bucket":       "https://media.base44.com/images/public/69ebd56ae74b0ffcc2427c7a/7799388e1_image.png",
  "__tabletop__":          "https://media.base44.com/images/public/69ebd56ae74b0ffcc2427c7a/61c0323ef_Gemini_Generated_Image_knktp3knktp3knkt1.png",
  "Wire Mesh Belt":        "https://media.base44.com/images/public/69ebd56ae74b0ffcc2427c7a/a5f69a754_image.png",
  "Steel Hinged Belt":     "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=600&q=80&auto=format&fit=crop",
  "ANSI/BS Chain":         "https://chains.alliedlocke.com/ImgMedium/PRC%20Ansi%20Drawing.jpg",
  "Engineered Chain":      "https://chains.alliedlocke.com/ImgMedium/SS188%20copy.jpg",
  "Cast Chain":            "https://chains.alliedlocke.com/ImgMedium/Cast%20Manganese.jpg",
  "Welded Steel Chain":    "https://chains.alliedlocke.com/ImgMedium/WH124.jpg",
  "Forged Chain":          "https://base44.app/api/apps/69dd9ffccab4dd693d4d92f5/files/mp/public/69dd9ffccab4dd693d4d92f5/4ed6677f2_forged-chain.jpg",
  "Overhead Chain":        "https://chains.alliedlocke.com/ImgMedium/Drop%20Forged%20Rivetless.jpg",
  "Sharptop Chain":        "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600&q=80&auto=format&fit=crop",
  "Kiln Chain":            "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600&q=80&auto=format&fit=crop",
  "Thermoforming Chain":   "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600&q=80&auto=format&fit=crop",
  "Conveyor Chain":        "https://chains.alliedlocke.com/ImgMedium/MSR6018.jpg",
  "Table Top Chain":       "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600&q=80&auto=format&fit=crop",
  "Conveyor Rollers":      "https://media.base44.com/images/public/69ebd56ae74b0ffcc2427c7a/9b340da5c_interroll.webp",
  "Monitoring System":     "https://media.base44.com/images/public/69ebd56ae74b0ffcc2427c7a/f0fd064f3_image.png",
  "Magnetic Conveyor":     "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=600&q=80&auto=format&fit=crop",
  "Pintle Chain":          "https://chains.alliedlocke.com/ImgMedium/steel-pintle-chains.jpg",
  "Long Link Chain":       "https://chains.alliedlocke.com/ImgMedium/PRC%20Ansi%20Drawing.jpg",
  "Special Application Chain": "https://chains.alliedlocke.com/ImgMedium/MXS881.jpg",
};

export default function TypeGrid({ types, counts, onSelect }) {
  const [hovered, setHovered] = useState(null);

  const chainTypes = types.filter((t) => CHAIN_SUBTYPE_KEYS.has(t.key));
  const nonChainTypes = types.filter((t) => !CHAIN_SUBTYPE_KEYS.has(t.key));
  const totalChainProducts = chainTypes.reduce((sum, t) => sum + (counts[t.key] || 0), 0);

  const displayItems = [
    { key: "__chain__", label: "Chain", description: "Roller chain, engineered, welded steel, pintle and specialty chains for all industrial applications", _isChain: true },
    ...nonChainTypes,
  ];

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 22, fontWeight: 800, color: C.text, marginBottom: 4 }}>Product Catalog</div>
        <div style={{ fontSize: 14, color: C.muted }}>Select a product category to browse specifications</div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 260px), 1fr))", gap: 14 }}>
        {displayItems.map((t) => {
          const isHov = hovered === t.key;
          const img = CATEGORY_IMAGES[t.key];
          return (
            <div key={t.key}
              onClick={() => onSelect(t.key)}
              onMouseEnter={() => setHovered(t.key)}
              onMouseLeave={() => setHovered(null)}
              style={{
                 background: C.card,
                 border: "1px solid " + (isHov ? C.navyMid : C.border),
                 borderRadius: 10,
                 cursor: "pointer",
                 transition: "all 0.18s",
                 display: "flex",
                 flexDirection: "column",
                 overflow: "hidden",
                 boxShadow: isHov ? "0 6px 24px rgba(0,60,91,0.15)" : "0 1px 4px rgba(0,60,91,0.05)",
                 transform: isHov ? "translateY(-2px)" : "none",
               }}>
              {/* Image */}
              {img && (
                <div style={{ height: 140, overflow: "hidden", position: "relative", background: "#e2e8f0", flexShrink: 0 }}>
                  <img
                    src={img}
                    alt={t.label}
                    style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.3s", transform: isHov ? "scale(1.06)" : "scale(1)" }}
                    onError={(e) => { e.target.parentElement.style.display = "none"; }}
                  />
                  <div style={{ position: "absolute", inset: 0, background: isHov ? "rgba(15,35,64,0.45)" : "rgba(15,35,64,0.18)", transition: "background 0.18s" }} />
                </div>
              )}
              {/* Content */}
              <div style={{ padding: "14px 16px", flex: 1, display: "flex", flexDirection: "column", gap: 5 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: isHov ? C.navyMid : C.text }}>{t.label}</div>
                <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.5 }}>{t.description}</div>
                <div style={{ fontSize: 11, color: isHov ? C.navyMid : C.muted, marginTop: 4, fontWeight: isHov ? 600 : 400 }}>
                  {t._isChain
                    ? `${chainTypes.length} subcategories · ${totalChainProducts} products`
                    : counts[t.key] ? `${counts[t.key]} products` : "View →"}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}