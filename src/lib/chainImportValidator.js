/**
 * Chain Import Validator — strict Chains-only validation layer
 * Implements: duplicate prevention, relationship safety, orphan detection, dry-run mode
 * NO fuzzy matching. NO AI merge. Exact chain_id only.
 */
import { base44 } from "@/api/base44Client";

/**
 * Validate and classify staged records for chain imports
 * @param {Array} stagedRecords - records from staging layer
 * @param {Object} opts - { dryRun: bool, existingChains: Map<chain_id, record> }
 * @returns {Promise<Object>} { valid, new, existing, duplicates, invalid, orphanRisks, summary }
 */
export async function validateChainImport(stagedRecords, opts = {}) {
  const { dryRun = false, existingChains = new Map() } = opts;
  
  const result = {
    valid: [],
    new: [],
    existing: [],
    duplicates: [],
    invalid: [],
    orphanRisks: [],
    summary: {
      totalRows: stagedRecords.length,
      newCount: 0,
      existingCount: 0,
      duplicateCount: 0,
      invalidCount: 0,
      orphanRiskCount: 0,
      missingFamily: 0,
      missingRequired: 0,
    },
  };

  const seenIds = new Set();

  for (const rec of stagedRecords) {
    const chainId = rec.chain_id;
    const family = rec.chain_family;
    const chainNum = rec.chain_number;
    
    // Check required fields
    if (!chainId || !chainNum) {
      result.invalid.push({
        ...rec,
        reason: `Missing required field: ${!chainId ? "chain_id" : "chain_number"}`,
      });
      result.summary.missingRequired++;
      continue;
    }

    // Check family assignment
    if (!family) {
      result.invalid.push({
        ...rec,
        reason: "Missing chain_family assignment — categorization required",
      });
      result.summary.missingFamily++;
      continue;
    }

    // Exact duplicate within this batch?
    if (seenIds.has(chainId)) {
      result.duplicates.push({
        ...rec,
        reason: "Duplicate chain_id within batch",
      });
      result.summary.duplicateCount++;
      continue;
    }
    seenIds.add(chainId);

    // Existing in DB?
    if (existingChains.has(chainId)) {
      result.existing.push({
        ...rec,
        existingRecord: existingChains.get(chainId),
        reason: "Chain already exists — would require admin approval to update",
      });
      result.summary.existingCount++;
      continue;
    }

    // Valid — mark as new
    result.valid.push(rec);
    result.new.push(rec);
    result.summary.newCount++;
  }

  // Check for orphan relationships if not dry-run
  if (!dryRun && result.valid.length > 0) {
    // In a real scenario, check if related records (dimensions, performance, etc.)
    // reference chain_ids that don't exist. For now, flag if there are any pending.
    result.orphanRisks = result.valid
      .filter(c => !c.dimensions_provided && !c.performance_provided)
      .map(c => ({
        chain_id: c.chain_id,
        reason: "No dimensional or performance data provided — related entities may be incomplete",
      }));
    result.summary.orphanRiskCount = result.orphanRisks.length;
  }

  return result;
}

/**
 * Fetch existing Normalized_Chains records as a Map<chain_id, record>
 */
export async function fetchExistingChains() {
  try {
    const chains = await base44.entities.Normalized_Chains.list("-created_date", 10000);
    const map = new Map();
    for (const c of chains) {
      map.set(c.chain_id, c);
    }
    return map;
  } catch (e) {
    console.error("Error fetching existing chains:", e);
    return new Map();
  }
}

/**
 * Check for orphan relationships in related entities
 * @param {Array<string>} chainIds - chain_ids to check
 * @returns {Promise<Object>} { orphans: { Dimensions, Performance, etc. } }
 */
export async function checkOrphanRisks(chainIds) {
  const chainIdSet = new Set(chainIds);
  const orphans = {};

  try {
    // Check Dimensions
    const dims = await base44.entities.Chain_Dimensions.list("-updated_date", 10000);
    orphans.Dimensions = dims.filter(d => !chainIdSet.has(d.chain_id));

    // Check Performance
    const perf = await base44.entities.Performance_Data.list("-updated_date", 10000);
    orphans.Performance = perf.filter(p => !chainIdSet.has(p.chain_id));

    // Check Equivalents
    const equiv = await base44.entities.Manufacturer_Equivalents.list("-updated_date", 10000);
    orphans.Equivalents = equiv.filter(e => !chainIdSet.has(e.chain_id));

    // Check Attachments
    const attach = await base44.entities.Chain_Attachments.list("-updated_date", 10000);
    orphans.Attachments = attach.filter(a => !chainIdSet.has(a.chain_id));

    // Check Sprockets
    const sprocket = await base44.entities.Chain_Sprockets.list("-updated_date", 10000);
    orphans.Sprockets = sprocket.filter(s => !chainIdSet.has(s.chain_id));

    // Check Media
    const media = await base44.entities.Chain_Media.list("-updated_date", 10000);
    orphans.Media = media.filter(m => !chainIdSet.has(m.chain_id));

    // Check Downloads
    const dl = await base44.entities.Chain_Downloads.list("-updated_date", 10000);
    orphans.Downloads = dl.filter(d => d.chain_id !== "ALL" && !chainIdSet.has(d.chain_id));

    return orphans;
  } catch (e) {
    console.error("Error checking orphan risks:", e);
    return orphans;
  }
}

/**
 * Generate review flags for chains needing attention
 * @param {Array} invalidRecords - records that failed validation
 * @param {Array} orphanRisks - records with orphan relationship risks
 */
export async function generateReviewFlags(invalidRecords, orphanRisks) {
  const flags = [];

  for (const rec of invalidRecords) {
    flags.push({
      chain_id: rec.chain_id || "UNKNOWN",
      flag_type: "Data Entry Error",
      severity: "High",
      description: rec.reason,
      affected_field: "import_validation",
    });
  }

  for (const risk of orphanRisks) {
    flags.push({
      chain_id: risk.chain_id,
      flag_type: "Missing Dimensions",
      severity: "Medium",
      description: `Import validation: ${risk.reason}`,
      affected_field: "related_entities",
    });
  }

  return flags;
}