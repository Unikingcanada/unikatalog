/**
 * ChainFamilyBrowser.jsx
 * Landing grid for the normalized chain procurement platform.
 * Shows 18 chain families. Brand-neutral.
 *
 * AUTHORITATIVE: Uses getChainCountByFamily() for unique, active chains only.
 */
import { useState, useMemo } from "react";
import { CHAIN_FAMILIES } from "@/lib/chainFamilyData";
import { CHAIN_PRODUCTS } from "@/lib/chainCatalogData";
import { getChainCountByFamily, getUniqueActiveChains } from "@/lib/chainCountHelpers";
import { getLiveChainsSync } from "@/lib/chainLiveDbSource";
import { useNavigate } from "react-router-dom";

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

export default function ChainFamilyBrowser({ onSelectFamily, onOpenConfigurator, liveChainSource = null, onSelectChain = null }) {
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const familyCounts = useMemo(() => {
    const counts = {};
    CHAIN_FAMILIES.forEach(fam => {
      // Use authoritative count: unique, active chains only
      const normalized = getChainCountByFamily(fam.key);
      if (normalized > 0) {
        counts[fam.key] = normalized;
      } else {
        // Fall back to legacy CHAIN_PRODUCTS only if no normalized chains found
        counts[fam.key] = CHAIN_PRODUCTS.filter(p => {
          if (p.category !== fam.catalog_key) return false;
          if (fam.subcategory_filter?.length && !fam.subcategory_filter.includes(p.subcategory)) return false;
          return true;
        }).length;
      }
    });
    return counts;
  }, []);

  const { familiesFiltered, chainsMatched, debugInfo } = useMemo(() => {
    if (!search.trim()) return { familiesFiltered: CHAIN_FAMILIES, chainsMatched: [], debugInfo: null };

    const q = search.toLowerCase().trim();

    // Search families by label, description, applications
    const familiesFiltered = CHAIN_FAMILIES.filter(f =>
      f.label.toLowerCase().includes(q) ||
      f.description?.toLowerCase().includes(q) ||
      f.applications?.some(a => a.toLowerCase().includes(q))
    );

    // Use AUTHORITATIVE live DB source passed from ChainPlatformView
    // Falls back to getUniqueActiveChains() for backward compat
    const allSearchableChains = liveChainSource?.live || getUniqueActiveChains();
    const allSearchableCount = allSearchableChains.length;

    // Search individual normalized chains
    const chainsMatched = allSearchableChains.filter(c => {
      // Search fields: chain_id, chain_number, display_name, standard, chain_family, description, application_tags
      return (
        c.chain_id?.toLowerCase?.().includes(q) ||
        c.chain_number?.toLowerCase?.().includes(q) ||
        c.display_name?.toLowerCase?.().includes(q) ||
        c.standard?.toLowerCase?.().includes(q) ||
        c.chain_family?.toLowerCase?.().includes(q) ||
        c.description?.toLowerCase?.().includes(q) ||
        c.application_tags?.some(t => t.toLowerCase().includes(q))
      );
    }).sort((a, b) => {
      // Exact chain_id match first (case-insensitive)
      const exactA = a.chain_id?.toUpperCase() === q.toUpperCase();
      const exactB = b.chain_id?.toUpperCase() === q.toUpperCase();
      if (exactA && !exactB) return -1;
      if (!exactA && exactB) return 1;
      return 0;
    });

    // Debug info
    const debugInfo = {
      dbRecordsSearched: allSearchableCount,
      matchesReturned: chainsMatched.length,
    };

    return { familiesFiltered, chainsMatched, debugInfo };
  }, [search]);

  // ── Live DB family counts (override static counts when liveChainSource is available) ──
  const liveFamilyCounts = useMemo(() => {
    if (!liveChainSource?.live) return null;
    const counts = {};
    for (const chain of liveChainSource.live) {
      const fk = chain.chain_family?.trim();
      if (fk) counts[fk] = (counts[fk] || 0) + 1;
    }
    return counts;
  }, [liveChainSource]);

  const resolvedFamilyCounts = useMemo(() => {
    if (!liveFamilyCounts) return familyCounts;
    const merged = { ...familyCounts };
    CHAIN_FAMILIES.forEach(fam => {
      if (liveFamilyCounts[fam.key] != null) {
        merged[fam.key] = liveFamilyCounts[fam.key];
      }
    });
    return merged;
  }, [familyCounts, liveFamilyCounts]);

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

      {/* Search debug info (admin) */}
      {search.trim() && debugInfo && (
        <div style={{ fontSize: 11, color: C.muted, marginBottom: 16, padding: "8px 0" }}>
          <div>Search source: Normalized_Chains DB ({debugInfo.dbRecordsSearched} live records)</div>
          <div style={{ marginTop: 2, color: "#16a34a", fontWeight: 600 }}>
            {debugInfo.matchesReturned} matching chain record{debugInfo.matchesReturned !== 1 ? "s" : ""}
          </div>
        </div>
      )}

      {/* Matching Chains Section */}
      {chainsMatched.length > 0 && (
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 15, fontWeight: 800, color: C.text, marginBottom: 12 }}>
            Matching Chains ({chainsMatched.length})
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 12 }}>
            {chainsMatched.slice(0, 12).map(chain => {
              // Resolve chain_family (display label) to family key
              const familyKey = CHAIN_FAMILIES.find(f => f.key === chain.chain_family)?.key || chain.chain_family;
              return (
              <div
                key={chain.chain_id}
                onClick={() => {
                  // If onSelectChain prop available, go direct to detail; else go to family
                  if (onSelectChain) {
                    onSelectChain(chain);
                  } else {
                    onSelectFamily({ key: familyKey });
                  }
                }}
                style={{
                  background: C.card,
                  border: "1px solid " + C.border,
                  borderRadius: 10,
                  padding: 14,
                  cursor: "pointer",
                  transition: "all 0.18s",
                  display: "flex",
                  flexDirection: "column",
                  gap: 6,
                  boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                  position: "relative",
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.boxShadow = "0 6px 20px rgba(0,0,0,0.15)";
                  e.currentTarget.style.borderColor = C.navyMid;
                  e.currentTarget.style.transform = "translateY(-2px)";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.05)";
                  e.currentTarget.style.borderColor = C.border;
                  e.currentTarget.style.transform = "none";
                }}
              >
                <div style={{ fontSize: 13, fontWeight: 800, color: C.text }}>{chain.chain_id}</div>
                <div style={{ fontSize: 11, color: C.muted }}>{chain.display_name}</div>
                <div style={{ fontSize: 10, color: C.muted, display: "flex", gap: 8, flexWrap: "wrap", marginTop: 2 }}>
                  <span>{chain.chain_family}</span>
                  {chain.pitch_in && <span>•</span>}
                  {chain.pitch_in && <span>{chain.pitch_in}"</span>}
                  {chain.pitch_mm && <span>({chain.pitch_mm}mm)</span>}
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 6, paddingTop: 6, borderTop: "1px solid " + C.border }}>
                  <span style={{ fontSize: 10, fontWeight: 600, color: chain.status === "Active" || !chain.status ? "#16a34a" : C.muted }}>
                    {chain.status || "Active"}
                  </span>
                  <span style={{ fontSize: 11, fontWeight: 600, color: C.navyMid }}>View Details →</span>
                </div>
              </div>
            );
            })}
          </div>
          {chainsMatched.length > 12 && (
            <div style={{ fontSize: 11, color: C.muted, marginTop: 8 }}>
              … and {chainsMatched.length - 12} more chain{chainsMatched.length - 12 !== 1 ? "s" : ""}
            </div>
          )}
        </div>
      )}

      {/* Matching Families Section */}
      {familiesFiltered.length > 0 && (
        <div>
          {chainsMatched.length > 0 && (
            <div style={{ fontSize: 15, fontWeight: 800, color: C.text, marginBottom: 12 }}>
              Matching Families ({familiesFiltered.length})
            </div>
          )}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 12 }}>
            {familiesFiltered.map(fam => (
              <FamilyCard key={fam.key} family={fam} count={resolvedFamilyCounts[fam.key] || 0} onClick={onSelectFamily} />
            ))}
          </div>
        </div>
      )}

      {chainsMatched.length === 0 && familiesFiltered.length === 0 && (
        <div style={{ textAlign: "center", padding: "40px 0", color: C.muted, fontSize: 14 }}>
          No chain families or individual chains match your search. Try a different term or use the configurator.
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