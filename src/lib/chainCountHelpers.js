/**
 * chainCountHelpers.js
 *
 * AUTHORITATIVE COUNT SOURCE for the Chains-Only ecosystem.
 * All chain counts (Home card, Platform, Family, Subcat) must use these functions.
 *
 * RULE: Only count UNIQUE, ACTIVE chains
 * - No duplicates (same chain_id)
 * - No component SKUs (OL-xx, CL-xx connecting links)
 * - Status = "Active" or blank (not Discontinued/Pending Review)
 */

import { ALL_NORMALIZED_CHAINS } from "./chainNormalizedIndex";
import { CHAIN_FAMILIES } from "./chainFamilyData";
import { isComponentSku } from "./importCenterEngine";

/**
 * Get unique, active normalized chains.
 * Deduplicates by chain_id, filters status, excludes components.
 */
export function getUniqueActiveChains() {
  const seen = new Set();
  const unique = [];

  for (const chain of ALL_NORMALIZED_CHAINS) {
    // Skip duplicates (same chain_id)
    if (seen.has(chain.chain_id)) continue;

    // Skip non-Active status (Discontinued, Pending Review, etc.)
    if (chain.status && chain.status !== "Active") continue;

    // Skip component SKUs (connecting links, cotter pins, etc.)
    if (isComponentSku(chain.chain_id, chain.chain_number)) continue;

    seen.add(chain.chain_id);
    unique.push(chain);
  }

  return unique;
}

/**
 * Get total unique active chain count (for Home card)
 */
export function getTotalUniqueChainCount() {
  return getUniqueActiveChains().length;
}

/**
 * Get unique active chains by family
 */
export function getChainsByFamilyActive(familyKey) {
  return getUniqueActiveChains().filter(c => c.chain_family === familyKey);
}

/**
 * Get count for a specific family (for FamilyCard)
 */
export function getChainCountByFamily(familyKey) {
  return getChainsByFamilyActive(familyKey).length;
}

/**
 * Get all family counts at once (for ChainFamilyBrowser)
 */
export function getAllFamilyCounts() {
  const counts = {};
  CHAIN_FAMILIES.forEach(fam => {
    counts[fam.key] = getChainCountByFamily(fam.key);
  });
  return counts;
}

/**
 * Audit data for admin debug panel
 * Returns breakdown of what's in the DB vs what's actually used
 */
export function getChainAuditBreakdown() {
  const allChains = ALL_NORMALIZED_CHAINS;

  // Count unique chain_ids
  const uniqueIds = new Set(allChains.map(c => c.chain_id));
  const duplicateRecords = allChains.length - uniqueIds.size;

  // Count by status
  const statusCounts = {};
  const nonActiveDups = [];
  for (const chain of allChains) {
    const status = chain.status || "Active";
    statusCounts[status] = (statusCounts[status] || 0) + 1;
    if (status !== "Active" && uniqueIds.has(chain.chain_id)) {
      nonActiveDups.push(chain.chain_id);
    }
  }

  // Count component SKUs
  const components = allChains.filter(c =>
    isComponentSku(c.chain_id, c.chain_number)
  ).length;
  const uniqueComponents = new Set(
    allChains
      .filter(c => isComponentSku(c.chain_id, c.chain_number))
      .map(c => c.chain_id)
  ).size;

  // Categorized (assigned to a family) vs uncategorized
  const familyKeys = new Set(CHAIN_FAMILIES.map(f => f.key));
  const uniqueActives = getUniqueActiveChains();
  const categorized = uniqueActives.filter(c => familyKeys.has(c.chain_family)).length;
  const uncategorized = uniqueActives.length - categorized;

  // Per-family breakdown
  const perFamily = {};
  CHAIN_FAMILIES.forEach(fam => {
    perFamily[fam.key] = getChainCountByFamily(fam.key);
  });

  return {
    // Raw DB stats
    totalDbRecords: allChains.length,
    uniqueChainIds: uniqueIds.size,
    duplicateDbRecords: duplicateRecords,

    // Status breakdown
    statusCounts,

    // Component vs chain breakdown
    totalComponentRecords: components,
    uniqueComponentIds: uniqueComponents,

    // Visible in platform
    totalUniqueActiveChains: uniqueActives.length,
    categorized,
    uncategorized,

    // Per-family count
    perFamily,
  };
}