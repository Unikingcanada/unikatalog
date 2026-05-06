/**
 * ChainFamilyBrowser.jsx
 * Landing grid for the normalized chain procurement platform.
 * Shows 18 chain families. Brand-neutral.
 */
import { useState, useMemo } from "react";
import { CHAIN_FAMILIES } from "@/lib/chainFamilyData";
import { CHAIN_PRODUCTS } from "@/lib/chainCatalogData";
import { ALL_NORMALIZED_CHAINS } from "@/lib/chainNormalizedIndex";

const C = {
  navy: "#003c5b", navyMid: "#1A3A5C", navyLight: "#2A5080",
  border: "#e2e8f0", bg: "#f8fafc", card: "#ffffff",
  text: "#0f172a", muted: "#64748b",
  gold: "#C9A84C",
};

function FamilyCard({ family, count, onClick }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      onClick={() => onClick(family)}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: hov ? family.color : C.card,
        border: "1px solid " + (hov ? family.color : C.border),
        borderRadius: 10,
        padding: "18px 18px 16px",
        cursor: "pointer",
        transition: "all 0.18s",
        display: "flex",
        flexDirection: "column",
        gap: 6,
        boxShadow: hov ? "0 6px 20px rgba(0,0,0,0.15)" : "0 1px 3px rgba(0,0,0,0.05)",
        transform: hov ? "translateY(-2px)" : "none",
      }}
    >
      <div style={{ fontSize: 13, fontWeight: 800, color: hov ? "#fff" : C.text, lineHeight: 1.3 }}>{family.label}</div>
      <div style={{ fontSize: 11, color: hov ? "rgba(255,255,255,0.7)" : C.muted, lineHeight: 1.5 }}>{family.description?.slice(0, 80)}…</div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 4 }}>
        <span style={{ fontSize: 10, color: hov ? "rgba(255,255,255,0.55)" : C.muted }}>{family.pitch_range}</span>
        <span style={{ fontSize: 11, fontWeight: 700, color: hov ? "rgba(255,255,255,0.8)" : family.color }}>
          {count > 0 ? `${count} products` : "View →"}
        </span>
      </div>
    </div>
  );
}

export default function ChainFamilyBrowser({ onSelectFamily, onOpenConfigurator }) {
  const [search, setSearch] = useState("");

  const familyCounts = useMemo(() => {
    const counts = {};
    CHAIN_FAMILIES.forEach(fam => {
      // Count normalized chains first, fall back to legacy
      const normalized = ALL_NORMALIZED_CHAINS.filter(c => c.chain_family === fam.key).length;
      if (normalized > 0) {
        counts[fam.key] = normalized;
      } else {
        counts[fam.key] = CHAIN_PRODUCTS.filter(p => {
          if (p.category !== fam.catalog_key) return false;
          if (fam.subcategory_filter?.length && !fam.subcategory_filter.includes(p.subcategory)) return false;
          return true;
        }).length;
      }
    });
    return counts;
  }, []);

  const filtered = useMemo(() => {
    if (!search.trim()) return CHAIN_FAMILIES;
    const q = search.toLowerCase();
    return CHAIN_FAMILIES.filter(f =>
      f.label.toLowerCase().includes(q) ||
      f.description?.toLowerCase().includes(q) ||
      f.applications?.some(a => a.toLowerCase().includes(q))
    );
  }, [search]);

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 22, fontWeight: 800, color: C.text, marginBottom: 4 }}>Chain Procurement Platform</div>
            <div style={{ fontSize: 13, color: C.muted }}>
              Normalized, brand-neutral. Browse by chain family — not by manufacturer.
            </div>
          </div>
          <button onClick={() => onOpenConfigurator && onOpenConfigurator()}
            style={{ padding: "10px 20px", background: C.navyMid, color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 700, fontSize: 13, whiteSpace: "nowrap" }}>
            ⚙ Chain Configurator
          </button>
        </div>
        {/* Search */}
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search chain families, applications, pitch..."
          style={{ width: "100%", maxWidth: 400, padding: "9px 14px", border: "1px solid " + C.border, borderRadius: 7, fontSize: 13, outline: "none", boxSizing: "border-box" }} />
      </div>

      {/* Disclaimer */}
      <div style={{ padding: "10px 14px", background: "#fffbeb", border: "1px solid #fbbf24", borderRadius: 6, fontSize: 12, color: "#92400e", marginBottom: 20 }}>
        ℹ Final specifications, availability, and pricing must be confirmed by Uniking before supply. This platform merges data from multiple sources.
      </div>

      {/* Family grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 12 }}>
        {filtered.map(fam => (
          <FamilyCard key={fam.key} family={fam} count={familyCounts[fam.key] || 0} onClick={onSelectFamily} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div style={{ textAlign: "center", padding: "40px 0", color: C.muted, fontSize: 14 }}>
          No chain families match your search. Try a different term or use the configurator.
        </div>
      )}

      {/* Footer note */}
      <div style={{ marginTop: 24, padding: "12px 16px", background: C.bg, borderRadius: 8, border: "1px solid " + C.border, fontSize: 11, color: C.muted, lineHeight: 1.6 }}>
        Platform sourced from: Allied-Locke, MAC Chain, Donghua, Tsubaki, Peer, Rexnord, Renold, Iwis, Can-Am, Connexus, Webster, Viking, Summit, Kobo.
        Do not duplicate products by brand — use normalized chain numbers.
      </div>
    </div>
  );
}