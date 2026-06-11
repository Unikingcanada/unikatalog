/**
 * catalogImportNormalizer.js
 *
 * Turns extracted catalog records (catalogExtractionSchema shape) into
 * brand-free, deduplicated, import-ready data for UniKatalog.
 *
 * For every extracted chain it decides:
 *   - MERGE  → the chain already exists in the normalized catalog (by chain_id
 *              or by an existing manufacturer/code equivalency). We emit only a
 *              source_ref + any new related parts — never a duplicate chain.
 *   - NEW    → genuinely new chain. We emit a full normalized record.
 *
 * Output feeds two ingestion routes, both already supported by the app:
 *   1. toLibExpansion()  → { NEW_CHAINS, MERGE_REFS } literals to wire into
 *      chainNormalizedIndex.js exactly like the Donghua/ANSI expansions.
 *   2. toImporterRows()  → flat per-entity rows for the Import Center JSON path
 *      (Stage → Validate → Diff → Commit → rollback).
 */

import { ALL_NORMALIZED_CHAINS, getChainById, findByManufacturerCode } from "./chainNormalizedIndex";
import { normalizeChainFamily, familyLabelToKey, familyKeyToLabel } from "./chainFamilyNormalizer";
import { CHAIN_FAMILIES } from "./chainFamilyData";
import { validateExtractedChain } from "./catalogExtractionSchema";

const FAMILY_KEYS = new Set(CHAIN_FAMILIES.map(f => f.key));

/** Resolve any family hint (key OR label OR alias) to a canonical family key. */
export function resolveFamilyKey(hint) {
  if (!hint) return null;
  const raw = String(hint).trim();
  if (FAMILY_KEYS.has(raw)) return raw;                 // already a key
  const viaLabel = familyLabelToKey(raw);               // exact label
  if (viaLabel && FAMILY_KEYS.has(viaLabel)) return viaLabel;
  const canonicalLabel = normalizeChainFamily(raw);     // alias → canonical label
  const viaAlias = familyLabelToKey(canonicalLabel);
  if (viaAlias && FAMILY_KEYS.has(viaAlias)) return viaAlias;
  return null;
}

/** Deterministic chain_id from family + number, matching existing conventions. */
export function makeChainId(familyKey, chainNumber) {
  const num = String(chainNumber).trim().toUpperCase().replace(/\s+/g, "");
  // Roller/standard families already use bare numbers prefixed ANSI- in the
  // catalog; everything else uses the chain number as-is (X458, WH124, 667X…).
  if (familyKey === "performance_roller" && /^\d+H?$/.test(num)) return `ANSI-${num}`;
  return num;
}

function cleanArr(a) { return Array.isArray(a) ? a.filter(Boolean) : []; }

/**
 * Normalize a batch of extracted chains.
 * @param {Array} extracted  array of catalogExtractionSchema chain objects
 * @param {object} opts      { sourceBrand, catalogUrl, defaultConfidence }
 */
export function normalizeExtraction(extracted, opts = {}) {
  const sourceBrand = (opts.sourceBrand || "").trim();
  const defaultConfidence = opts.defaultConfidence || "Confirmed";

  const newChains = [];
  const mergeRefs = [];
  const attachments = [];
  const sprockets = [];
  const pinsLinks = [];
  const media = [];
  const rejected = [];
  const report = {
    source_brand: sourceBrand,
    catalog_url: opts.catalogUrl || null,
    input: extracted.length,
    new: 0, merged: 0, rejected: 0,
    warnings: [],
    family_breakdown: {},
  };

  for (const item of extracted) {
    const brand = (item.source_brand || sourceBrand).trim();
    const v = validateExtractedChain(item, brand);
    if (!v.valid) {
      rejected.push({ chain_number: item.chain_number, errors: v.errors });
      report.rejected++;
      continue;
    }
    v.warnings.forEach(w => report.warnings.push(`${item.chain_number}: ${w}`));

    const familyKey = resolveFamilyKey(item.family);
    if (!familyKey) {
      rejected.push({ chain_number: item.chain_number, errors: [`Unresolvable family '${item.family}'`] });
      report.rejected++;
      continue;
    }
    report.family_breakdown[familyKey] = (report.family_breakdown[familyKey] || 0) + 1;

    const code = (item.source_code || item.chain_number).toString().trim();
    const confidence = item.confidence || defaultConfidence;

    // ── Dedup: does this chain already exist? ──
    const candidateId = makeChainId(familyKey, item.chain_number);
    const existing =
      getChainById(candidateId) ||
      getChainById(String(item.chain_number).trim()) ||
      findByManufacturerCode(brand, code);

    const chainId = existing ? existing.chain_id : candidateId;

    if (existing) {
      // MERGE — only add this brand as a source_ref if not already present.
      const already = (existing.source_refs || []).some(
        r => r.manufacturer?.toLowerCase() === brand.toLowerCase() && r.code === code
      );
      if (!already) {
        mergeRefs.push({
          chain_id: chainId,
          manufacturer: brand,
          code,
          confidence,
          catalog_url: item.catalog_url || opts.catalogUrl || null,
          notes: item.catalog_page ? `Catalog: ${item.catalog_page}` : null,
        });
        report.merged++;
      } else {
        report.warnings.push(`${item.chain_number}: source_ref already present — skipped`);
      }
    } else {
      // NEW — emit a full normalized record in the canonical schema.
      const specs = { ...(item.specs || {}) };
      if (item.pitch_in) specs.pitch_in = item.pitch_in;
      if (item.pitch_mm) specs.pitch_mm = item.pitch_mm;
      if (item.avg_ultimate_lbs) specs.avg_ultimate_lbs = item.avg_ultimate_lbs;
      if (item.max_working_load_lbs) specs.max_working_load_lbs = item.max_working_load_lbs;

      newChains.push({
        chain_id: chainId,
        chain_family: familyKey,
        chain_number: String(item.chain_number).trim(),
        display_name: item.display_name || `${item.chain_number} ${familyKeyToLabel(familyKey).replace(/s$/, "")}`,
        standard: item.standard || "",
        pitch_in: item.pitch_in || specs.pitch_in || "",
        pitch_mm: item.pitch_mm || specs.pitch_mm || "",
        description: item.description || "",
        specs,
        performance_tiers: cleanArr(item.performance_tiers).length
          ? item.performance_tiers
          : (item.avg_ultimate_lbs
              ? [{ tier: "standard", tensile_strength_lbs: item.avg_ultimate_lbs, working_load_lbs: item.max_working_load_lbs || null, source: brand }]
              : []),
        source_refs: [{ manufacturer: brand, code, confidence, catalog_url: item.catalog_url || opts.catalogUrl || null }],
        attachments_available: cleanArr(item.attachments).map(a => a.code).filter(Boolean),
        sprocket_series: Array.isArray(item.sprockets) ? (item.sprockets[0]?.code || null) : (item.sprockets || null),
        materials_available: cleanArr(item.materials_available),
        options_upgrades: cleanArr(item.options_upgrades),
        image_strategy: item.image_url ? "exact" : "family",
        image_url: item.image_url || null,
        status: "Active",
      });
      report.new++;
    }

    // ── Related parts (emitted for both new and merged chains) ──
    for (const a of cleanArr(item.attachments)) {
      attachments.push({ chain_id: chainId, code: a.code, type: a.type || null, description: a.description || null, side: a.side || null, spacing: a.spacing || null, image_url: a.image_url || null, source_brand: brand });
    }
    for (const s of cleanArr(item.sprockets)) {
      sprockets.push({ chain_id: chainId, code: s.code || null, teeth: s.teeth || null, bore: s.bore || null, material: s.material || null, image_url: s.image_url || null, source_brand: brand });
    }
    for (const p of cleanArr(item.pins_links)) {
      pinsLinks.push({ chain_id: chainId, code: p.code, type: p.type || null, description: p.description || null, image_url: p.image_url || null, source_brand: brand });
    }
    if (item.image_url) media.push({ chain_id: chainId, url: item.image_url, type: "product", is_primary: true, source_brand: brand });
    if (item.diagram_url) media.push({ chain_id: chainId, url: item.diagram_url, type: "diagram", is_primary: false, source_brand: brand });
  }

  return { newChains, mergeRefs, attachments, sprockets, pinsLinks, media, rejected, report };
}

/**
 * Flatten a normalize result into Import-Center rows, tagged by entity_target,
 * ready for the JSON import path (Stage → Validate → Diff → Commit).
 */
export function toImporterRows(result) {
  const rows = [];
  for (const c of result.newChains) rows.push({ entity_target: "Normalized_Chains", ...c });
  for (const m of result.mergeRefs) rows.push({ entity_target: "Manufacturer_Equivalents", chain_id: m.chain_id, manufacturer: m.manufacturer, code: m.code, confidence: m.confidence, notes: m.notes });
  for (const a of result.attachments) rows.push({ entity_target: "Chain_Attachments", ...a });
  for (const s of result.sprockets) rows.push({ entity_target: "Chain_Sprockets", ...s });
  for (const md of result.media) rows.push({ entity_target: "Chain_Media", ...md });
  return rows;
}

/**
 * Produce the lib-expansion literals to wire into chainNormalizedIndex.js,
 * matching the Donghua/ANSI expansion pattern.
 */
export function toLibExpansion(result, brandSlug = "SOURCE") {
  let S = brandSlug.toUpperCase().replace(/[^A-Z0-9]/g, "_");
  if (/^[0-9]/.test(S)) S = "B" + S; // ensure a valid JS identifier (e.g. 4B → B4B)
  return {
    newChainsConst: `${S}_NEW_CHAINS`,
    mergeRefsConst: `${S}_MERGE_REFS`,
    newChains: result.newChains,
    mergeRefs: result.mergeRefs.map(({ chain_id, code, confidence, notes }) => ({ chain_id, code, confidence, notes })),
  };
}

export default normalizeExtraction;
