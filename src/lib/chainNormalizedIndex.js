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
import { NORMALIZED_CHAINS_EXPANSION_2 } from "./chainNormalizedExpansion2";
import { DH_MERGE_REFS, DH_NEW_CHAINS } from "./donghuaNormalizedChains";
export { AL_SOURCE, AL_CATEGORIES, AL_ANSI_SINGLE_STRAND, AL_WELDED_MILL_CHAINS, AL_ATTACHMENT_CATEGORIES, AL_MATERIAL_VARIANTS, getALSpecByChainId, getALConflicts, buildALSourceEntry } from "./alliedLockeSourceRecord";
export { DH_SOURCE, DH_CATEGORIES, DH_MATERIAL_VARIANTS } from "./donghuaSourceRecord";

/** Complete normalized chain catalog — base + all expansions, deduplicated by chain_id,
 *  with Donghua merge-refs patched onto existing entries */
export const ALL_NORMALIZED_CHAINS = (() => {
  const seen = new Set();
  const merged = [];

  // 1. Collect all base + expansion chains, deduplicating by chain_id
  for (const chain of [
    ...NORMALIZED_CHAINS,
    ...NORMALIZED_CHAINS_EXPANSION,
    ...NORMALIZED_CHAINS_EXPANSION_2,
    ...DH_NEW_CHAINS,
  ]) {
    if (!seen.has(chain.chain_id)) {
      seen.add(chain.chain_id);
      // Deep-clone so we don't mutate source objects
      merged.push({ ...chain, source_refs: [...(chain.source_refs || [])] });
    }
  }

  // 2. Patch DH_MERGE_REFS onto existing chains (add Donghua as source where not already present)
  for (const ref of DH_MERGE_REFS) {
    const chain = merged.find(c => c.chain_id === ref.chain_id);
    if (!chain) continue;
    const alreadyHasDH = chain.source_refs.some(
      r => r.manufacturer === "Donghua" && r.code === ref.code
    );
    if (!alreadyHasDH) {
      chain.source_refs.push({
        manufacturer: "Donghua",
        code: ref.code,
        confidence: ref.confidence,
        catalog_page: ref.catalog_page,
        catalog_url: "http://en.dhchain.com/wp-content/uploads/2020/11/2020111706240075.pdf",
        notes: ref.notes || null,
      });
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