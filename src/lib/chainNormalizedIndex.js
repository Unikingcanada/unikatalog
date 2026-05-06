/**
 * chainNormalizedIndex.js
 *
 * UNIFIED EXPORT — merges the base dictionary + expansion into one array.
 * All consumers should import from here, not from individual files.
 *
 * Usage:
 *   import { ALL_NORMALIZED_CHAINS, getChainById, getChainsByFamily } from "@/lib/chainNormalizedIndex";
 *
 * This is the single source of truth for all normalized chain data.
 */

import { NORMALIZED_CHAINS } from "./chainNormalizedDictionary";
import { NORMALIZED_CHAINS_EXPANSION } from "./chainNormalizedExpansion";

/** Complete normalized chain catalog — base + expansion, deduplicated by chain_id */
export const ALL_NORMALIZED_CHAINS = (() => {
  const seen = new Set();
  const merged = [];
  for (const chain of [...NORMALIZED_CHAINS, ...NORMALIZED_CHAINS_EXPANSION]) {
    if (!seen.has(chain.chain_id)) {
      seen.add(chain.chain_id);
      merged.push(chain);
    }
  }
  return merged;
})();

// ─── Re-exported lookup helpers ────────────────────────────────────────────

/** Get normalized chain by chain_id */
export function getChainById(chain_id) {
  return ALL_NORMALIZED_CHAINS.find(c => c.chain_id === chain_id) || null;
}

/** Get all chains for a given family key */
export function getChainsByFamily(family_key) {
  return ALL_NORMALIZED_CHAINS.filter(c => c.chain_family === family_key);
}

/** Find by manufacturer code (equivalency lookup) */
export function findByManufacturerCode(manufacturer, code) {
  if (!manufacturer || !code) return null;
  const mL = manufacturer.toLowerCase();
  const cL = code.toLowerCase();
  return ALL_NORMALIZED_CHAINS.find(chain =>
    chain.source_refs?.some(ref =>
      ref.manufacturer.toLowerCase() === mL &&
      ref.code.toLowerCase() === cL
    )
  ) || null;
}

/** Text search across chain_number, family, description, standard, source codes */
export function searchChains(query) {
  if (!query?.trim()) return ALL_NORMALIZED_CHAINS;
  const q = query.toLowerCase();
  return ALL_NORMALIZED_CHAINS.filter(c =>
    c.chain_number?.toLowerCase().includes(q) ||
    c.display_name?.toLowerCase().includes(q) ||
    c.chain_family?.toLowerCase().includes(q) ||
    c.description?.toLowerCase().includes(q) ||
    c.standard?.toLowerCase().includes(q) ||
    c.source_refs?.some(ref =>
      ref.code.toLowerCase().includes(q) ||
      ref.manufacturer.toLowerCase().includes(q)
    )
  );
}

/** Get all unique manufacturers across all chains */
export function getAllManufacturers() {
  const mfrs = new Set();
  for (const chain of ALL_NORMALIZED_CHAINS) {
    for (const ref of (chain.source_refs || [])) {
      mfrs.add(ref.manufacturer);
    }
  }
  return [...mfrs].sort();
}

/** Get all chains a manufacturer makes (confirmed only by default) */
export function getChainsByManufacturer(manufacturer, confirmedOnly = true) {
  const mL = manufacturer.toLowerCase();
  return ALL_NORMALIZED_CHAINS.filter(chain =>
    chain.source_refs?.some(ref =>
      ref.manufacturer.toLowerCase() === mL &&
      (!confirmedOnly || ref.confidence === "Confirmed")
    )
  );
}

/** Check if chain_id already exists (deduplication guard) */
export function chainExists(chain_id) {
  return ALL_NORMALIZED_CHAINS.some(c => c.chain_id === chain_id);
}

/** Get catalog coverage stats */
export function getCoverageStats() {
  const byFamily = {};
  const byManufacturer = {};
  const byConfidence = { Confirmed: 0, "Needs Review": 0, "Missing Data – Needs Mapping": 0 };

  for (const chain of ALL_NORMALIZED_CHAINS) {
    // Family count
    byFamily[chain.chain_family] = (byFamily[chain.chain_family] || 0) + 1;

    // Source refs
    for (const ref of (chain.source_refs || [])) {
      byManufacturer[ref.manufacturer] = (byManufacturer[ref.manufacturer] || 0) + 1;
      if (ref.confidence in byConfidence) byConfidence[ref.confidence]++;
    }
  }

  return {
    total_chains: ALL_NORMALIZED_CHAINS.length,
    total_source_refs: ALL_NORMALIZED_CHAINS.reduce((n, c) => n + (c.source_refs?.length || 0), 0),
    by_family: byFamily,
    by_manufacturer: byManufacturer,
    by_confidence: byConfidence,
    manufacturers: Object.keys(byManufacturer).sort(),
  };
}

export default ALL_NORMALIZED_CHAINS;