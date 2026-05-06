/**
 * chainImportEngine.js
 *
 * Normalized Chain Import + Mapping System
 * =========================================
 * CHAINS ECOSYSTEM ONLY — do NOT import or call from other ecosystems.
 *
 * WHAT THIS DOES:
 * - Takes raw catalog records from any manufacturer source
 * - Determines if a normalized equivalent already exists
 * - If yes: merges new source_ref, performance data, images, attachments
 * - If no: flags as a new normalized chain candidate (does NOT auto-create)
 * - Returns a structured ImportResult with full audit trail
 *
 * FAIL-SAFE RULES (enforced at each step):
 * - Never deletes products
 * - Never overwrites normalized baseline dimensions automatically
 * - Never duplicates normalized chains
 * - Never duplicates source_refs
 * - Never overwrites better images with worse ones
 * - Conflict detection — preserves both values, flags for review
 * - All imports are "staged" (preview) unless explicitly committed
 *
 * SUPPORTED MANUFACTURERS (see MANUFACTURER_PROFILES):
 * Allied-Locke, MAC Chain, Donghua, Peer, Tsubaki, Rexnord,
 * Renold, Connexus, Can-Am, Webster, FMC
 */

import { NORMALIZED_CHAINS, getChainById, findByManufacturerCode, chainExists } from "./chainNormalizedDictionary.js";
import { equivalencyExists, resolveEquivalent, KNOWN_ALIASES } from "./chainEquivalencyEngine.js";
import { ATTACHMENT_LIBRARY, getAttachmentByCode } from "./chainAttachmentLibrary.js";
import { SPROCKET_SERIES } from "./chainSprocketCompatibility.js";

// ─── Confidence Levels ────────────────────────────────────────────────────────
export const CONFIDENCE = {
  CONFIRMED:   "Confirmed",
  NEEDS_REVIEW: "Needs Review",
  MISSING:     "Missing Data – Needs Mapping",
};

// ─── Import Status Codes ──────────────────────────────────────────────────────
export const IMPORT_STATUS = {
  MERGED:          "merged",          // Source added to existing normalized chain
  NEW_CANDIDATE:   "new_candidate",   // No match — new normalized chain needed
  DUPLICATE_SKIP:  "duplicate_skip",  // Source already mapped — nothing to do
  CONFLICT:        "conflict",        // Data conflicts — flagged for review
  ATTACHMENT_MAPPED: "attachment_mapped", // Attachment normalized to existing code
  ATTACHMENT_NEW:  "attachment_new",  // Attachment has no equivalent — new code needed
  SPROCKET_MAPPED: "sprocket_mapped", // Sprocket normalized to existing series
  SPROCKET_NEW:    "sprocket_new",    // Sprocket has no equivalent series
};

// ─── Manufacturer Profiles ────────────────────────────────────────────────────
// Describes known manufacturer coding conventions and field mappings.
// Add new manufacturers here without changing architecture.

export const MANUFACTURER_PROFILES = {
  "Allied-Locke": {
    name: "Allied-Locke",
    chain_number_field: "part_number",
    description_field: "description",
    tensile_field: null,
    working_load_field: null,
    pitch_field: null,
    image_field: "product_image",
    drawing_field: "diagram_image",
    catalog_url_field: "catalog_url",
    code_style: "ANSI",
    confidence_default: CONFIDENCE.CONFIRMED,
    notes: "Primary Uniking source — Allied-Locke / MAC Chain catalog",
  },
  "MAC Chain": {
    name: "MAC Chain",
    chain_number_field: "part_number",
    description_field: "description",
    tensile_field: null,
    working_load_field: null,
    pitch_field: null,
    image_field: "product_image",
    drawing_field: "diagram_image",
    catalog_url_field: "catalog_url",
    code_style: "ANSI",
    confidence_default: CONFIDENCE.CONFIRMED,
    notes: "MAC Chain — mirrors Allied-Locke product line",
  },
  "Donghua": {
    name: "Donghua",
    chain_number_field: "chain_no",
    description_field: "series",
    tensile_field: "tensile_strength_kn",
    working_load_field: null,
    pitch_field: "pitch_mm",
    image_field: "image_url",
    drawing_field: null,
    catalog_url_field: "catalog_url",
    code_style: "ISO/ANSI",
    confidence_default: CONFIDENCE.CONFIRMED,
    notes: "Donghua chain — ANSI and ISO designations",
  },
  "Tsubaki": {
    name: "Tsubaki",
    chain_number_field: "part_number",
    description_field: "description",
    tensile_field: "tensile_kn",
    working_load_field: "working_load_kn",
    pitch_field: "pitch_in",
    image_field: "image_url",
    drawing_field: "drawing_url",
    catalog_url_field: "catalog_url",
    code_style: "Tsubaki/ANSI",
    confidence_default: CONFIDENCE.CONFIRMED,
    notes: "RS/Lambda/Sigma series designations",
  },
  "Peer": {
    name: "Peer",
    chain_number_field: "part_number",
    description_field: "description",
    tensile_field: "tensile_lbs",
    working_load_field: "working_load_lbs",
    pitch_field: "pitch_in",
    image_field: "image_url",
    drawing_field: null,
    catalog_url_field: "catalog_url",
    code_style: "ANSI",
    confidence_default: CONFIDENCE.CONFIRMED,
    notes: "Peer chain standard ANSI codes",
  },
  "Rexnord": {
    name: "Rexnord",
    chain_number_field: "part_number",
    description_field: "description",
    tensile_field: "tensile_lbs",
    working_load_field: "working_load_lbs",
    pitch_field: "pitch_in",
    image_field: "image_url",
    drawing_field: "drawing_url",
    catalog_url_field: "catalog_url",
    code_style: "ANSI/Rexnord",
    confidence_default: CONFIDENCE.NEEDS_REVIEW,
    notes: "Rexnord — verify before procurement",
  },
  "Renold": {
    name: "Renold",
    chain_number_field: "part_number",
    description_field: "description",
    tensile_field: "tensile_kn",
    working_load_field: null,
    pitch_field: "pitch_mm",
    image_field: "image_url",
    drawing_field: "drawing_url",
    catalog_url_field: "catalog_url",
    code_style: "ISO 606",
    confidence_default: CONFIDENCE.CONFIRMED,
    notes: "ISO 606 designations — map to ANSI equivalent",
  },
  "Connexus": {
    name: "Connexus",
    chain_number_field: "part_number",
    description_field: "description",
    tensile_field: null,
    working_load_field: null,
    pitch_field: null,
    image_field: "image_url",
    drawing_field: null,
    catalog_url_field: "catalog_url",
    code_style: "ANSI",
    confidence_default: CONFIDENCE.NEEDS_REVIEW,
    notes: "Connexus — ANSI style codes, verify specs",
  },
  "Can-Am": {
    name: "Can-Am",
    chain_number_field: "part_number",
    description_field: "description",
    tensile_field: null,
    working_load_field: null,
    pitch_field: null,
    image_field: "image_url",
    drawing_field: null,
    catalog_url_field: "catalog_url",
    code_style: "ANSI",
    confidence_default: CONFIDENCE.NEEDS_REVIEW,
    notes: "Can-Am chains — ANSI codes",
  },
  "Webster": {
    name: "Webster",
    chain_number_field: "part_number",
    description_field: "description",
    tensile_field: null,
    working_load_field: null,
    pitch_field: null,
    image_field: "image_url",
    drawing_field: null,
    catalog_url_field: "catalog_url",
    code_style: "Webster",
    confidence_default: CONFIDENCE.NEEDS_REVIEW,
    notes: "Webster specialty chains — manual mapping may be needed",
  },
  "FMC": {
    name: "FMC",
    chain_number_field: "part_number",
    description_field: "description",
    tensile_field: null,
    working_load_field: null,
    pitch_field: null,
    image_field: "image_url",
    drawing_field: null,
    catalog_url_field: "catalog_url",
    code_style: "FMC",
    confidence_default: CONFIDENCE.NEEDS_REVIEW,
    notes: "FMC engineered chains — manual review required",
  },
};

// ─── Image Priority Scorer ────────────────────────────────────────────────────
// Returns the better of two image URLs based on quality signals.
// Priority: exact product photo > manufacturer site > placeholder > null

const IMAGE_QUALITY_SIGNALS = {
  high: [/picture/i, /photo/i, /prod/i, /chain\.\w{3,4}$/i],
  medium: [/ImgMedium/i, /catalog/i, /alliedlocke/i, /macchain/i, /tsubaki/i, /donghua/i],
  low: [/generated_image/i, /unsplash/i, /placeholder/i, /generic/i],
};

function scoreImage(url) {
  if (!url) return -1;
  for (const pattern of IMAGE_QUALITY_SIGNALS.high) if (pattern.test(url)) return 3;
  for (const pattern of IMAGE_QUALITY_SIGNALS.medium) if (pattern.test(url)) return 2;
  for (const pattern of IMAGE_QUALITY_SIGNALS.low) if (pattern.test(url)) return 0;
  return 1; // unknown but present
}

export function selectBestImage(existing, incoming) {
  const existScore = scoreImage(existing);
  const incomScore = scoreImage(incoming);
  // Never downgrade — only upgrade
  return incomScore > existScore ? incoming : (existing || incoming || null);
}

// ─── Performance Tier Merger ──────────────────────────────────────────────────
// Merges incoming performance data without overwriting existing entries.
// Adds new tier/source combinations only.

export function mergePerformanceTiers(existingTiers = [], incomingTier) {
  if (!incomingTier?.source) return existingTiers;

  const duplicate = existingTiers.find(t =>
    t.tier === incomingTier.tier && t.source === incomingTier.source
  );
  if (duplicate) return existingTiers; // exact duplicate — skip

  // Check for conflicts (same tier, different source, different values)
  const conflicts = existingTiers.filter(t =>
    t.tier === incomingTier.tier &&
    t.source !== incomingTier.source &&
    (t.tensile_strength_lbs !== incomingTier.tensile_strength_lbs ||
     t.working_load_lbs !== incomingTier.working_load_lbs)
  );

  if (conflicts.length > 0) {
    // Add with conflict flag — do NOT overwrite
    return [...existingTiers, { ...incomingTier, conflict_flag: true, conflict_note: "Different value from existing source — verify before procurement" }];
  }

  return [...existingTiers, incomingTier];
}

// ─── Source Ref Deduplication ─────────────────────────────────────────────────

export function isDuplicateSourceRef(existingRefs = [], manufacturer, code) {
  const mLower = manufacturer.toLowerCase();
  const cLower = code.toLowerCase();
  return existingRefs.some(ref =>
    ref.manufacturer.toLowerCase() === mLower &&
    ref.code.toLowerCase() === cLower
  );
}

export function mergeSourceRef(existingRefs = [], newRef) {
  if (isDuplicateSourceRef(existingRefs, newRef.manufacturer, newRef.code)) {
    return { refs: existingRefs, added: false };
  }
  return { refs: [...existingRefs, newRef], added: true };
}

// ─── Attachment Normalizer ────────────────────────────────────────────────────
// Maps an incoming attachment code/description to a known ATTACHMENT_LIBRARY code.

const ATTACHMENT_ALIAS_MAP = {
  // Standard ANSI aliases
  "a1": "A1", "a-1": "A1", "a 1": "A1", "bent lug one side": "A1",
  "a2": "A2", "a-2": "A2", "a 2": "A2", "bent lug both sides": "A2",
  "k1": "K1", "k-1": "K1", "ep1": "K1", "extended pin one side": "K1",
  "k2": "K2", "k-2": "K2", "ep2": "K2", "extended pin both sides": "K2",
  "sa1": "SA1", "sa-1": "SA1", "special a one side": "SA1",
  "sa2": "SA2", "sa-2": "SA2", "special a both sides": "SA2",
  "hk1": "HK1", "hk-1": "HK1", "hollow pin extended one side": "HK1",
  "hk2": "HK2", "hk-2": "HK2", "hollow pin extended both sides": "HK2",
  "hka": "HKA", "hollow pin with lug": "HKA",
  "wa2": "WA2", "wa-2": "WA2", "wide contour both sides": "WA2",
  "wk2": "WK2", "wk-2": "WK2", "wide contour extended pin both sides": "WK2",
  // Welded
  "wak1": "WA-K1", "wa-k1": "WA-K1",
  "wak2": "WA-K2", "wa-k2": "WA-K2",
  "waa1": "WA-A1", "wa-a1": "WA-A1",
  "waa2": "WA-A2", "wa-a2": "WA-A2",
  "wasa1": "WA-SA1", "wa-sa1": "WA-SA1",
  // Engineered
  "enga1": "ENG-A1", "eng-a1": "ENG-A1",
  "engk1": "ENG-K1", "eng-k1": "ENG-K1",
  "engsa1": "ENG-SA1", "eng-sa1": "ENG-SA1",
  "engflight": "ENG-FLIGHT", "eng-flight": "ENG-FLIGHT",
  // DFR
  "dfr-dog": "DFR-DOG", "pusher dog": "DFR-DOG",
  "dfr-pusher": "DFR-PUSHER", "pusher block": "DFR-PUSHER",
  "dfr-trolley": "DFR-TROLLEY", "trolley": "DFR-TROLLEY",
  // Pintle
  "pc-a1": "PC-A1", "pca1": "PC-A1",
  "pc-k1": "PC-K1", "pck1": "PC-K1",
  "pc-sa1": "PC-SA1", "pcsa1": "PC-SA1",
  "pc-flap": "PC-FLAP", "pcflap": "PC-FLAP",
  // Agricultural
  "agri-a1": "AGRI-A1", "agria1": "AGRI-A1",
  "agri-k1": "AGRI-K1", "agrik1": "AGRI-K1",
};

export function normalizeAttachmentCode(rawCode) {
  if (!rawCode) return null;
  const key = rawCode.trim().toLowerCase();

  // Direct lookup in library
  if (ATTACHMENT_LIBRARY[rawCode]) return { code: rawCode, status: IMPORT_STATUS.ATTACHMENT_MAPPED, existing: true };

  // Alias lookup
  const aliasResolved = ATTACHMENT_ALIAS_MAP[key];
  if (aliasResolved && ATTACHMENT_LIBRARY[aliasResolved]) {
    return { code: aliasResolved, status: IMPORT_STATUS.ATTACHMENT_MAPPED, existing: true, alias_from: rawCode };
  }

  // No match — new attachment candidate
  return { code: rawCode, status: IMPORT_STATUS.ATTACHMENT_NEW, existing: false };
}

// ─── Equivalency Matcher ──────────────────────────────────────────────────────
// Multi-strategy matching to find an existing normalized chain for an incoming record.

export function findNormalizedChain(manufacturer, code, pitchIn = null, pitchMm = null) {
  // Strategy 1: Exact source_ref match (authoritative)
  const fromSourceRef = findByManufacturerCode(manufacturer, code);
  if (fromSourceRef) return { chain: fromSourceRef, strategy: "source_ref", confidence: CONFIDENCE.CONFIRMED };

  // Strategy 2: equivalencyEngine resolveEquivalent (index + known aliases)
  const fromEngine = resolveEquivalent(manufacturer, code);
  if (fromEngine?.normalized_chain) return { chain: fromEngine.normalized_chain, strategy: "equivalency_engine", confidence: fromEngine.confidence };

  // Strategy 3: Direct chain_id match (code IS the normalized number)
  const directById = getChainById(code);
  if (directById) return { chain: directById, strategy: "direct_id", confidence: CONFIDENCE.CONFIRMED };

  // Strategy 4: Chain number match (code matches chain_number in dictionary)
  const byNumber = NORMALIZED_CHAINS.find(c => c.chain_number?.toLowerCase() === code.toLowerCase());
  if (byNumber) return { chain: byNumber, strategy: "chain_number", confidence: CONFIDENCE.CONFIRMED };

  // Strategy 5: Pitch-based approximate match (only if exact match failed)
  if (pitchIn) {
    const byPitch = NORMALIZED_CHAINS.filter(c => c.pitch_in === String(pitchIn));
    if (byPitch.length === 1) return { chain: byPitch[0], strategy: "pitch_only", confidence: CONFIDENCE.NEEDS_REVIEW };
    // Multiple chains same pitch — can't determine
  }

  return null; // No match — new candidate
}

// ─── Conflict Detector ────────────────────────────────────────────────────────
// Checks if incoming spec data conflicts with normalized baseline.

export function detectSpecConflicts(normalizedChain, incomingSpecs) {
  const conflicts = [];
  const specs = normalizedChain.specs || {};
  const TOLERANCE = 0.005; // 0.005" tolerance for dimensional comparison

  const COMPARABLE_FIELDS = ["pitch_in", "roller_dia_in", "roller_width_in", "pin_dia_in", "plate_height_in"];

  for (const field of COMPARABLE_FIELDS) {
    if (!incomingSpecs[field] || !specs[field]) continue;
    const existVal = parseFloat(specs[field]);
    const newVal = parseFloat(incomingSpecs[field]);
    if (isNaN(existVal) || isNaN(newVal)) continue;
    if (Math.abs(existVal - newVal) > TOLERANCE) {
      conflicts.push({
        field,
        existing_value: specs[field],
        incoming_value: incomingSpecs[field],
        delta: Math.abs(existVal - newVal).toFixed(4),
        severity: Math.abs(existVal - newVal) > 0.05 ? "high" : "low",
      });
    }
  }
  return conflicts;
}

// ─── Core Import Function ─────────────────────────────────────────────────────
/**
 * processChainImport
 *
 * Takes one incoming chain record and returns an ImportResult.
 * Does NOT mutate any existing data — returns instructions for what WOULD change.
 * Call applyImportResult() to actually apply changes to your database.
 *
 * @param {object} record - Raw incoming chain record
 * @param {string} manufacturer - Manufacturer name (must exist in MANUFACTURER_PROFILES)
 * @param {object} options
 *   - overrideConfidence: force a confidence level
 *   - allowNewChains: if false, new_candidate results are flagged only (default true)
 *   - imagePriority: "always_keep_existing" | "auto" (default "auto")
 *
 * @returns ImportResult
 */
export function processChainImport(record, manufacturer, options = {}) {
  const {
    overrideConfidence = null,
    allowNewChains = true,
    imagePriority = "auto",
  } = options;

  const profile = MANUFACTURER_PROFILES[manufacturer];
  const confidence = overrideConfidence || profile?.confidence_default || CONFIDENCE.NEEDS_REVIEW;

  // Extract key fields from record using manufacturer profile
  const code = record[profile?.chain_number_field] || record.part_number || record.chain_no || record.code || "";
  const pitchIn = record[profile?.pitch_field] || record.pitch_in || record.pitch || null;
  const pitchMm = record.pitch_mm || null;
  const imageUrl = record[profile?.image_field] || record.image_url || record.product_image || null;
  const drawingUrl = record[profile?.drawing_field] || record.drawing_url || record.diagram_image || null;
  const catalogUrl = record[profile?.catalog_url_field] || record.catalog_url || null;
  const description = record[profile?.description_field] || record.description || record.series || "";

  const result = {
    import_id: `import_${manufacturer.replace(/\s+/g, "_").toLowerCase()}_${code}_${Date.now()}`,
    manufacturer,
    source_code: code,
    source_description: description,
    status: null,
    normalized_chain_id: null,
    normalized_chain: null,
    match_strategy: null,
    confidence,
    actions: [],       // What will be done
    conflicts: [],     // Detected conflicts
    warnings: [],      // Non-blocking issues
    attachment_results: [],
    sprocket_result: null,
    new_source_ref: null,
    image_decision: null,
    timestamp: new Date().toISOString(),
  };

  if (!code) {
    result.status = IMPORT_STATUS.CONFLICT;
    result.conflicts.push({ type: "missing_code", message: "No chain number/code found in record. Cannot process." });
    return result;
  }

  // ── Step 1: Find normalized equivalent ───────────────────────────────────────
  const match = findNormalizedChain(manufacturer, code, pitchIn, pitchMm);

  if (!match) {
    // No match — new chain candidate
    result.status = IMPORT_STATUS.NEW_CANDIDATE;
    result.actions.push({
      type: "create_new_normalized",
      message: `No equivalent found for ${manufacturer} "${code}". New normalized chain entry required.`,
      suggested_chain_id: suggestChainId(code, record),
      suggested_chain_number: code,
      suggested_pitch_in: pitchIn,
      suggested_pitch_mm: pitchMm,
      suggested_description: description,
      suggested_source_ref: { manufacturer, code, confidence, catalog_url: catalogUrl, drawing_url: drawingUrl },
    });
    result.warnings.push(`New chain candidate: ${manufacturer} "${code}" — requires admin review before adding to normalized dictionary.`);
    return result;
  }

  // ── Step 2: Matched — set normalized chain context ────────────────────────────
  result.normalized_chain_id = match.chain.chain_id;
  result.normalized_chain = match.chain;
  result.match_strategy = match.strategy;

  // ── Step 3: Check for duplicate source_ref ────────────────────────────────────
  const alreadyMapped = isDuplicateSourceRef(match.chain.source_refs || [], manufacturer, code);
  if (alreadyMapped) {
    result.status = IMPORT_STATUS.DUPLICATE_SKIP;
    result.actions.push({ type: "skip", message: `${manufacturer} "${code}" already mapped to ${match.chain.chain_id}. Nothing to do.` });
    return result;
  }

  // ── Step 4: Build new source_ref ─────────────────────────────────────────────
  result.new_source_ref = {
    manufacturer,
    code,
    confidence,
    catalog_url: catalogUrl || null,
    drawing_url: drawingUrl || null,
    notes: description || null,
  };
  result.actions.push({
    type: "add_source_ref",
    chain_id: match.chain.chain_id,
    ref: result.new_source_ref,
    message: `Add ${manufacturer} "${code}" as source ref to ${match.chain.chain_id}`,
  });

  // ── Step 5: Spec conflict detection ──────────────────────────────────────────
  const incomingSpecs = {
    pitch_in: pitchIn,
    pitch_mm: pitchMm,
    ...(record.specs || {}),
    ...(record.roller_dia_in ? { roller_dia_in: record.roller_dia_in } : {}),
    ...(record.roller_width_in ? { roller_width_in: record.roller_width_in } : {}),
    ...(record.pin_dia_in ? { pin_dia_in: record.pin_dia_in } : {}),
  };
  const specConflicts = detectSpecConflicts(match.chain, incomingSpecs);
  if (specConflicts.length > 0) {
    result.conflicts.push(...specConflicts.map(c => ({
      type: "spec_conflict",
      ...c,
      message: `Spec conflict on "${c.field}": existing=${c.existing_value}, incoming=${c.incoming_value}. Baseline preserved.`,
    })));
    result.warnings.push(`${specConflicts.length} spec conflict(s) detected. Normalized baseline NOT modified — flag for review.`);
  }

  // ── Step 6: Performance data ──────────────────────────────────────────────────
  const tensileRaw = record[profile?.tensile_field] || record.tensile_strength_lbs || record.tensile_lbs || null;
  const workingRaw = record[profile?.working_load_field] || record.working_load_lbs || null;

  if (tensileRaw || workingRaw) {
    // Convert kN to lbs if needed (1 kN = 224.81 lbs)
    const tensile_lbs = tensileRaw && String(tensileRaw).includes("kn") ? null :
      profile?.tensile_field?.includes("kn") ? Math.round(parseFloat(tensileRaw) * 224.81) :
      tensileRaw ? String(tensileRaw) : null;

    const newTier = {
      tier: record.performance_tier || "standard",
      tensile_strength_lbs: tensile_lbs || record.tensile_strength_lbs || null,
      working_load_lbs: workingRaw ? String(workingRaw) : null,
      source: manufacturer,
      notes: record.tier_notes || null,
    };

    result.actions.push({
      type: "add_performance_tier",
      chain_id: match.chain.chain_id,
      tier: newTier,
      message: `Add ${manufacturer} performance data to ${match.chain.chain_id}`,
    });
  }

  // ── Step 7: Image decision ────────────────────────────────────────────────────
  if (imageUrl && imagePriority !== "always_keep_existing") {
    const existingImage = match.chain.image_url || null;
    const bestImage = selectBestImage(existingImage, imageUrl);
    if (bestImage !== existingImage) {
      result.image_decision = { action: "upgrade", from: existingImage, to: bestImage };
      result.actions.push({
        type: "update_image",
        chain_id: match.chain.chain_id,
        new_image_url: bestImage,
        message: `Upgrade image for ${match.chain.chain_id} (higher quality source found)`,
      });
    } else {
      result.image_decision = { action: "keep_existing", reason: "Existing image is equal or better quality" };
    }
  }

  // ── Step 8: Attachment normalization ─────────────────────────────────────────
  const incomingAttachments = record.attachments || record.related_attachments || record.attachments_available || [];
  for (const rawAtt of incomingAttachments) {
    const rawCode = rawAtt?.code || rawAtt?.att_code || rawAtt || "";
    const normalized = normalizeAttachmentCode(String(rawCode));
    result.attachment_results.push({ raw: rawCode, ...normalized });

    if (normalized.existing) {
      // Check if already on the chain's attachments_available
      const alreadyOnChain = (match.chain.attachments_available || []).includes(normalized.code);
      if (!alreadyOnChain) {
        result.actions.push({
          type: "add_attachment_to_chain",
          chain_id: match.chain.chain_id,
          attachment_code: normalized.code,
          message: `Add attachment "${normalized.code}" to ${match.chain.chain_id}.attachments_available`,
        });
      }
    } else {
      result.warnings.push(`Unknown attachment code "${rawCode}" — no matching ATTACHMENT_LIBRARY entry. New attachment definition needed.`);
    }
  }

  // ── Step 9: Mark status ───────────────────────────────────────────────────────
  result.status = result.conflicts.length > 0 ? IMPORT_STATUS.CONFLICT : IMPORT_STATUS.MERGED;

  return result;
}

// ─── Batch Import Processor ───────────────────────────────────────────────────
/**
 * processBatchImport
 * Processes an array of records from one manufacturer.
 * Returns { results, summary }
 */
export function processBatchImport(records, manufacturer, options = {}) {
  const results = records.map(r => processChainImport(r, manufacturer, options));

  const summary = {
    total: results.length,
    merged: results.filter(r => r.status === IMPORT_STATUS.MERGED).length,
    new_candidates: results.filter(r => r.status === IMPORT_STATUS.NEW_CANDIDATE).length,
    duplicates_skipped: results.filter(r => r.status === IMPORT_STATUS.DUPLICATE_SKIP).length,
    conflicts: results.filter(r => r.status === IMPORT_STATUS.CONFLICT).length,
    total_actions: results.reduce((sum, r) => sum + r.actions.length, 0),
    total_warnings: results.reduce((sum, r) => sum + r.warnings.length, 0),
    manufacturers_processed: [manufacturer],
    timestamp: new Date().toISOString(),
  };

  return { results, summary };
}

// ─── Chain ID Suggester ────────────────────────────────────────────────────────
// Suggests a normalized chain_id for a new candidate. Admin must confirm.

function suggestChainId(code, record) {
  // ANSI standard numbers
  if (/^\d{2,3}H?$/.test(code)) return `ANSI-${code}`;
  if (/^C\d{4}H?/.test(code)) return code; // Double pitch: C2060H
  if (/^WH\d+/.test(code)) return `WH-${code.replace("WH", "")}`;
  if (/^WR\d+/.test(code)) return `WR-${code.replace("WR", "")}`;
  if (/^X\d{3}/.test(code)) return code;
  if (/^SS\d+/.test(code)) return `SS-${code.replace("SS", "")}`;
  if (/^MSR/.test(code)) return `MSR-${code.replace("MSR", "")}`;
  if (/^CA\d+/.test(code)) return code;
  // Fallback: normalize to uppercase, replace spaces with dashes
  return code.toUpperCase().replace(/\s+/g, "-");
}

// ─── Import Result Formatter ──────────────────────────────────────────────────
// Returns a human-readable summary of an ImportResult for display in the admin UI.

export function formatImportResultSummary(result) {
  const statusLabels = {
    [IMPORT_STATUS.MERGED]:           "✓ Merged",
    [IMPORT_STATUS.NEW_CANDIDATE]:    "★ New Candidate",
    [IMPORT_STATUS.DUPLICATE_SKIP]:   "— Duplicate (skipped)",
    [IMPORT_STATUS.CONFLICT]:         "⚠ Conflict",
    [IMPORT_STATUS.ATTACHMENT_MAPPED]: "✓ Attachment Mapped",
    [IMPORT_STATUS.ATTACHMENT_NEW]:   "★ New Attachment",
    [IMPORT_STATUS.SPROCKET_MAPPED]:  "✓ Sprocket Mapped",
    [IMPORT_STATUS.SPROCKET_NEW]:     "★ New Sprocket",
  };

  return {
    label: statusLabels[result.status] || result.status,
    chain_id: result.normalized_chain_id || "—",
    source: `${result.manufacturer} "${result.source_code}"`,
    match_strategy: result.match_strategy || "none",
    action_count: result.actions.length,
    conflict_count: result.conflicts.length,
    warning_count: result.warnings.length,
    description: result.normalized_chain?.display_name || result.source_description || "",
  };
}

// ─── Equivalency Gap Analyzer ─────────────────────────────────────────────────
// Scans the normalized dictionary for chains missing specific manufacturers.
// Used to identify what's not yet mapped.

export function analyzeEquivalencyGaps(targetManufacturers = null) {
  const allManufacturers = targetManufacturers || Object.keys(MANUFACTURER_PROFILES);
  const gaps = [];

  for (const chain of NORMALIZED_CHAINS) {
    const mappedMfrs = new Set((chain.source_refs || []).map(r => r.manufacturer));
    const missingMfrs = allManufacturers.filter(m => !mappedMfrs.has(m));

    if (missingMfrs.length > 0) {
      gaps.push({
        chain_id: chain.chain_id,
        chain_number: chain.chain_number,
        display_name: chain.display_name,
        chain_family: chain.chain_family,
        mapped_manufacturers: [...mappedMfrs],
        missing_manufacturers: missingMfrs,
        priority: chain.chain_family === "performance_roller" ? "high" : "normal",
      });
    }
  }

  return gaps.sort((a, b) => (a.priority === "high" ? -1 : 1));
}

// ─── Import Validation ────────────────────────────────────────────────────────
// Pre-flight checks before processing a batch.

export function validateImportBatch(records, manufacturer) {
  const issues = [];

  if (!manufacturer || !MANUFACTURER_PROFILES[manufacturer]) {
    issues.push({ severity: "error", message: `Unknown manufacturer "${manufacturer}". Add to MANUFACTURER_PROFILES first.` });
  }
  if (!Array.isArray(records) || records.length === 0) {
    issues.push({ severity: "error", message: "No records provided." });
  }

  // Check for missing chain number fields
  const profile = MANUFACTURER_PROFILES[manufacturer];
  if (profile && Array.isArray(records)) {
    const missingCode = records.filter(r => !r[profile.chain_number_field] && !r.part_number && !r.chain_no && !r.code);
    if (missingCode.length > 0) {
      issues.push({ severity: "warning", message: `${missingCode.length} records missing chain number/code field.` });
    }
  }

  return {
    valid: !issues.some(i => i.severity === "error"),
    issues,
  };
}

export default {
  processChainImport,
  processBatchImport,
  findNormalizedChain,
  normalizeAttachmentCode,
  mergePerformanceTiers,
  mergeSourceRef,
  detectSpecConflicts,
  selectBestImage,
  analyzeEquivalencyGaps,
  validateImportBatch,
  formatImportResultSummary,
  MANUFACTURER_PROFILES,
  IMPORT_STATUS,
  CONFIDENCE,
};