/**
 * chainEquivalencyEngine.js
 *
 * Manufacturer equivalency engine for the normalized chain procurement platform.
 *
 * PURPOSE:
 * - Resolve manufacturer-specific codes to their normalized chain_id
 * - Prevent duplicate chain creation for equivalent products
 * - Support RFQ substitution logic ("open to equivalent")
 * - Support procurement team lookup: "What is Tsubaki RS80?"
 *
 * RULES:
 * - The source of truth is NORMALIZED_CHAINS[].source_refs[]
 * - This file provides a FLAT lookup index built from that data
 * - Do NOT add a manufacturer here unless it's in NORMALIZED_CHAINS source_refs
 * - If a manufacturer code maps to multiple chains, flag it as ambiguous
 * - If a code is brand-specific (not a standard number), map it to the normalized chain_id
 *
 * MANUFACTURER CODE FORMATS:
 * - Tsubaki:   RS80, 80-1, 80H-1, RS80H, Lambda80, etc.
 * - Donghua:   80A-1, 80AH-1, etc.
 * - Peer:      80-1, 80H-1, etc.
 * - Renold:    16A-1 (ISO 606 designation), 16AH-1, etc.
 * - Rexnord:   80, C55B, 10B-2, etc.
 * - Can-Am:    80, 80H, etc.
 * - Allied-Locke: 80, 80H, 80SS, WHX78, etc.
 * - MAC Chain: WH78, WH124, etc.
 */

import { NORMALIZED_CHAINS, getChainById } from "./chainNormalizedDictionary.js";

// ─── Build flat equivalency index from normalized dictionary ──────────────────
// Index structure: { "tsubaki::rs80": "ANSI-80", "donghua::80a-1": "ANSI-80", ... }

function buildEquivalencyIndex() {
  const index = {};
  for (const chain of NORMALIZED_CHAINS) {
    for (const ref of (chain.source_refs || [])) {
      const key = `${ref.manufacturer.toLowerCase()}::${ref.code.toLowerCase()}`;
      if (index[key]) {
        // Collision — flag ambiguous
        console.warn(`[EquivalencyEngine] Ambiguous key: ${key} maps to both ${index[key]} and ${chain.chain_id}`);
      } else {
        index[key] = {
          chain_id: chain.chain_id,
          confidence: ref.confidence,
          notes: ref.notes || null,
        };
      }
    }
  }
  return index;
}

export const EQUIVALENCY_INDEX = buildEquivalencyIndex();

// ─── Additional known aliases (brand-specific model names) ───────────────────
// These extend the index with non-standard brand codes that are not in source_refs
// but are commonly encountered in the field.
// Format: "manufacturer::code" → chain_id

export const KNOWN_ALIASES = {
  // Tsubaki
  "tsubaki::rs25":          "ANSI-25",
  "tsubaki::rs35":          "ANSI-35",
  "tsubaki::rs40":          "ANSI-40",
  "tsubaki::rs50":          "ANSI-50",
  "tsubaki::rs60":          "ANSI-60",
  "tsubaki::rs80":          "ANSI-80",
  "tsubaki::rs100":         "ANSI-100",
  "tsubaki::rs120":         "ANSI-120",
  "tsubaki::rs160":         "ANSI-160",
  "tsubaki::lambda40":      "ANSI-40",
  "tsubaki::lambda60":      "ANSI-60",
  "tsubaki::lambda80":      "ANSI-80",
  "tsubaki::sigma80":       "ANSI-80",

  // Renold (ISO 606 codes → ANSI chain_id)
  "renold::04a-1":          "ANSI-25",
  "renold::06a-1":          "ANSI-35",
  "renold::08a-1":          "ANSI-40",
  "renold::10a-1":          "ANSI-50",
  "renold::12a-1":          "ANSI-60",
  "renold::16a-1":          "ANSI-80",
  "renold::20a-1":          "ANSI-100",
  "renold::24a-1":          "ANSI-120",
  "renold::32a-1":          "ANSI-160",

  // Donghua (ANSI designation codes)
  "donghua::25a-1":         "ANSI-25",
  "donghua::35a-1":         "ANSI-35",
  "donghua::40a-1":         "ANSI-40",
  "donghua::40ah-1":        "ANSI-40H",
  "donghua::50a-1":         "ANSI-50",
  "donghua::60a-1":         "ANSI-60",
  "donghua::60ah-1":        "ANSI-60H",
  "donghua::80a-1":         "ANSI-80",
  "donghua::80ah-1":        "ANSI-80H",
  "donghua::100a-1":        "ANSI-100",
  "donghua::120a-1":        "ANSI-120",
  "donghua::160a-1":        "ANSI-160",

  // Peer
  "peer::25-1":             "ANSI-25",
  "peer::35-1":             "ANSI-35",
  "peer::40-1":             "ANSI-40",
  "peer::40h-1":            "ANSI-40H",
  "peer::50-1":             "ANSI-50",
  "peer::60-1":             "ANSI-60",
  "peer::60h-1":            "ANSI-60H",
  "peer::80-1":             "ANSI-80",
  "peer::80h-1":            "ANSI-80H",
  "peer::100-1":            "ANSI-100",
  "peer::120-1":            "ANSI-120",

  // Rexnord
  "rexnord::25":            "ANSI-25",
  "rexnord::40":            "ANSI-40",
  "rexnord::60":            "ANSI-60",
  "rexnord::80":            "ANSI-80",
  "rexnord::x348":          "X348",
  "rexnord::x458":          "X458",

  // Allied-Locke Super Series cross-ref
  "allied-locke::40ss":     "ANSI-40",
  "allied-locke::60ss":     "ANSI-60",
  "allied-locke::80ss":     "ANSI-80",
  "allied-locke::whx78":    "WH-78",
  "allied-locke::whx124":   "WH-124",
};

// ─── Core equivalency lookup functions ───────────────────────────────────────

/**
 * Look up a normalized chain_id from a manufacturer + code.
 * Returns { chain_id, normalized_chain, confidence, notes } or null.
 */
export function resolveEquivalent(manufacturer, code) {
  if (!manufacturer || !code) return null;
  const key = `${manufacturer.toLowerCase()}::${code.toLowerCase()}`;

  // Check main index (built from source_refs)
  const fromIndex = EQUIVALENCY_INDEX[key];
  if (fromIndex) {
    return {
      chain_id: fromIndex.chain_id,
      normalized_chain: getChainById(fromIndex.chain_id),
      confidence: fromIndex.confidence,
      notes: fromIndex.notes,
    };
  }

  // Check known aliases
  const fromAliases = KNOWN_ALIASES[key];
  if (fromAliases) {
    return {
      chain_id: fromAliases,
      normalized_chain: getChainById(fromAliases),
      confidence: "Needs Review",
      notes: "Resolved via alias table — verify before procurement",
    };
  }

  return null;
}

/**
 * Get all manufacturer equivalents for a normalized chain_id.
 * Returns array of { manufacturer, code, confidence, notes }
 */
export function getEquivalentsForChain(chain_id) {
  const chain = getChainById(chain_id);
  if (!chain) return [];
  return (chain.source_refs || []).map(ref => ({
    manufacturer: ref.manufacturer,
    code: ref.code,
    confidence: ref.confidence,
    notes: ref.notes || null,
  }));
}

/**
 * Get all equivalents grouped by confidence level.
 */
export function getEquivalentsByConfidence(chain_id) {
  const all = getEquivalentsForChain(chain_id);
  return {
    confirmed: all.filter(r => r.confidence === "Confirmed"),
    needs_review: all.filter(r => r.confidence === "Needs Review"),
    missing: all.filter(r => r.confidence === "Missing Data – Needs Mapping"),
  };
}

/**
 * Build a substitution suggestion list for an RFQ line item.
 * Returns up to 3 confirmed alternatives.
 */
export function getSubstitutionSuggestions(chain_id, preferredManufacturer = null) {
  const equivalents = getEquivalentsForChain(chain_id);
  const confirmed = equivalents.filter(r => r.confidence === "Confirmed");

  // If preferred manufacturer given, sort them first
  if (preferredManufacturer) {
    confirmed.sort((a, b) => {
      const aMatch = a.manufacturer.toLowerCase().includes(preferredManufacturer.toLowerCase());
      const bMatch = b.manufacturer.toLowerCase().includes(preferredManufacturer.toLowerCase());
      return (bMatch ? 1 : 0) - (aMatch ? 1 : 0);
    });
  }

  return confirmed.slice(0, 4);
}

/**
 * Validate that an equivalency lookup is not creating a duplicate.
 * Returns true if the manufacturer+code already exists in the index.
 */
export function equivalencyExists(manufacturer, code) {
  const key = `${manufacturer.toLowerCase()}::${code.toLowerCase()}`;
  return key in EQUIVALENCY_INDEX || key in KNOWN_ALIASES;
}

/**
 * Get summary statistics for the equivalency engine.
 */
export function getEquivalencyStats() {
  const totalChains = NORMALIZED_CHAINS.length;
  const totalMappings = Object.keys(EQUIVALENCY_INDEX).length + Object.keys(KNOWN_ALIASES).length;
  const manufacturers = new Set();
  for (const chain of NORMALIZED_CHAINS) {
    for (const ref of (chain.source_refs || [])) manufacturers.add(ref.manufacturer);
  }
  return {
    total_normalized_chains: totalChains,
    total_equivalency_mappings: totalMappings,
    manufacturers_covered: manufacturers.size,
    manufacturer_list: [...manufacturers].sort(),
  };
}

export default {
  resolveEquivalent,
  getEquivalentsForChain,
  getEquivalentsByConfidence,
  getSubstitutionSuggestions,
  equivalencyExists,
  getEquivalencyStats,
};