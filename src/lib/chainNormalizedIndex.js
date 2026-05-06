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
import { DH_DEEP_MERGE_REFS, DH_DEEP_NEW_CHAINS } from "./donghuaDeepExpansion";
import { DH_PHASE4_MERGE_REFS, DH_PHASE4_NEW_CHAINS } from "./donghuaPhase4Expansion";
import { ANSI_EXPANSION_MERGE_REFS, ANSI_EXPANSION_CHAINS } from "./ansiFamilyExpansion";
import { UK_MERGE_REFS, UK_NEW_CHAINS } from "./unikingBulkChains";
export { AL_SOURCE, AL_CATEGORIES, AL_ANSI_SINGLE_STRAND, AL_WELDED_MILL_CHAINS, AL_ATTACHMENT_CATEGORIES, AL_MATERIAL_VARIANTS, getALSpecByChainId, getALConflicts, buildALSourceEntry } from "./alliedLockeSourceRecord";
export { DH_SOURCE, DH_CATEGORIES, DH_MATERIAL_VARIANTS } from "./donghuaSourceRecord";
export { UK_BULK_SOURCE, UK_APPLICATION_TAGS, UK_CATALOG_SECTIONS } from "./unikingBulkSourceRecord";

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
    ...DH_DEEP_NEW_CHAINS,
    ...DH_PHASE4_NEW_CHAINS,
    ...ANSI_EXPANSION_CHAINS,
    ...UK_NEW_CHAINS,
  ]) {
    if (!seen.has(chain.chain_id)) {
      seen.add(chain.chain_id);
      // Deep-clone so we don't mutate source objects
      merged.push({ ...chain, source_refs: [...(chain.source_refs || [])] });
    }
  }

  // 2a. Patch DH_MERGE_REFS (Phase 1–2) onto existing chains
  for (const ref of DH_MERGE_REFS) {
    const chain = merged.find(c => c.chain_id === ref.chain_id);
    if (!chain) continue;
    const alreadyHas = chain.source_refs.some(
      r => r.manufacturer === "Donghua" && r.code === ref.code
    );
    if (!alreadyHas) {
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

  // 2b. Patch DH_DEEP_MERGE_REFS (Phase 3 deep ingestion) onto existing chains
  for (const ref of DH_DEEP_MERGE_REFS) {
    const chain = merged.find(c => c.chain_id === ref.chain_id);
    if (!chain) continue;
    const alreadyHas = chain.source_refs.some(
      r => r.manufacturer === "Donghua" && r.code === ref.code
    );
    if (!alreadyHas) {
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

  // 2c. Patch DH_PHASE4_MERGE_REFS (Phase 4 deep structured ingestion)
  for (const ref of DH_PHASE4_MERGE_REFS) {
    const chain = merged.find(c => c.chain_id === ref.chain_id);
    if (!chain) continue;
    const alreadyHas = chain.source_refs.some(
      r => r.manufacturer === "Donghua" && r.code === ref.code
    );
    if (!alreadyHas) {
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

  // 2d. Patch ANSI_EXPANSION_MERGE_REFS (Family Expansion Phase 1 — ANSI enrichment)
  for (const ref of ANSI_EXPANSION_MERGE_REFS) {
    const chain = merged.find(c => c.chain_id === ref.chain_id);
    if (!chain) continue;
    const alreadyHas = chain.source_refs.some(
      r => r.manufacturer === ref.manufacturer && r.code === ref.code
    );
    if (!alreadyHas) {
      chain.source_refs.push({
        manufacturer: ref.manufacturer,
        code: ref.code,
        confidence: ref.confidence,
        notes: ref.notes || null,
        catalog_page: ref.catalog_page || null,
      });
    }
  }

  // 3. Patch UK_MERGE_REFS onto existing chains (add Uniking as primary baseline source)
  for (const ref of UK_MERGE_REFS) {
    const chain = merged.find(c => c.chain_id === ref.chain_id);
    if (!chain) continue;
    const alreadyHas = chain.source_refs.some(
      r => r.manufacturer === "Uniking" && r.code === ref.code
    );
    if (!alreadyHas) {
      // Uniking is priority 0 — insert at FRONT of source_refs array
      chain.source_refs.unshift({
        manufacturer: "Uniking",
        code: ref.code,
        confidence: ref.confidence,
        catalog_page: ref.catalog_page,
        catalog_url: "https://unikingcanada.com/catalogs/uniking-industrial-bulk-material-catalog-industry-conveyor-chains-supplier-canada.pdf",
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