/**
 * chainCatalogAudit.js
 *
 * Phase 0 — Catalog Completeness Audit.
 *
 * Pure, dependency-light analysis over the normalized chain catalog. Answers the
 * question "how close are we to the most complete, accurate, brand-free chain
 * catalog in the world?" by scoring every chain on the things the catalog
 * promises: images, attachment options, sprockets, pins/links, ratings,
 * materials, and confirmed sourcing — then rolling those up per family and per
 * source brand.
 *
 * Works entirely off the static normalized index so it runs instantly with no
 * DB/auth. Callers may pass a merged live array (e.g. from
 * fetchLiveNormalizedChains) to audit the live DB state instead.
 */

import { ALL_NORMALIZED_CHAINS, getCoverageStats } from "./chainNormalizedIndex";
import { CHAIN_FAMILIES } from "./chainFamilyData";
import { getAttachmentsForFamily } from "./chainAttachmentLibrary";
import { getSprocketSeriesForChain } from "./chainSprocketCompatibility";
import { getPinsForChain } from "./chainPinsLinksLibrary";

/** The source brands the catalog is targeting for world-complete coverage.
 *  These are NEVER shown to customers (catalog is brand-free) — they are an
 *  internal sourcing-coverage scorecard only. */
export const TARGET_SOURCE_BRANDS = [
  "Uniking", "Donghua", "Tsubaki", "Rexnord", "Allied-Locke", "Renold", "Peer",
  "4B", "Connexus", "Kobo", "Jeffrey", "John King", "ICE", "Greenland",
  "Mac Chain", "Cam",
];

/** Score a single chain record on every completeness dimension. */
export function auditChain(c) {
  const attachmentsAvailable = Array.isArray(c.attachments_available) ? c.attachments_available : [];
  const relatedAttachments = Array.isArray(c.related_attachments) ? c.related_attachments : [];
  const sprocketSeries = c.sprocket_series ? getSprocketSeriesForChain(c.sprocket_series) : null;
  const pins = c.chain_id ? getPinsForChain(c.chain_id) : [];
  const tiers = Array.isArray(c.performance_tiers) ? c.performance_tiers : [];

  const hasExactImage = !!(c.image_url || c.image);
  const hasAttachments = attachmentsAvailable.length > 0 || relatedAttachments.length > 0;
  const hasSprockets = !!sprocketSeries || (Array.isArray(c.related_sprockets) && c.related_sprockets.length > 0);
  const hasPins = pins.length > 0 || (Array.isArray(c.related_pins) && c.related_pins.length > 0);
  const hasMaterials = Array.isArray(c.materials_available) && c.materials_available.length > 0;
  const hasRatings =
    !!(c.specs && (c.specs.avg_ultimate_lbs || c.specs.max_working_load_lbs)) ||
    tiers.some(t => t && (t.tensile_strength_lbs || t.working_load_lbs));
  const hasPitch = !!(c.pitch_in || c.specs?.pitch_in);
  const hasStandard = !!c.standard;
  const sourceRefs = Array.isArray(c.source_refs) ? c.source_refs : [];
  const hasConfirmedSource = sourceRefs.some(r => r.confidence === "Confirmed");

  // A chain is "catalog-ready" when a customer could meaningfully shop + configure it:
  // image + attachments + sprockets + ratings all present.
  const readyDimensions = [hasExactImage, hasAttachments, hasSprockets, hasRatings];
  const readyScore = readyDimensions.filter(Boolean).length / readyDimensions.length;
  const isReady = readyDimensions.every(Boolean);

  return {
    chain_id: c.chain_id,
    chain_number: c.chain_number,
    chain_family: c.chain_family,
    hasExactImage, hasAttachments, hasSprockets, hasPins,
    hasMaterials, hasRatings, hasPitch, hasStandard, hasConfirmedSource,
    sourceCount: sourceRefs.length,
    readyScore, isReady,
  };
}

function pct(n, d) { return d === 0 ? 0 : Math.round((n / d) * 100); }

function blankCoverage() {
  return {
    total: 0, withImage: 0, withAttachments: 0, withSprockets: 0,
    withPins: 0, withMaterials: 0, withRatings: 0, withConfirmedSource: 0,
    ready: 0,
  };
}

function accumulate(cov, a) {
  cov.total++;
  if (a.hasExactImage) cov.withImage++;
  if (a.hasAttachments) cov.withAttachments++;
  if (a.hasSprockets) cov.withSprockets++;
  if (a.hasPins) cov.withPins++;
  if (a.hasMaterials) cov.withMaterials++;
  if (a.hasRatings) cov.withRatings++;
  if (a.hasConfirmedSource) cov.withConfirmedSource++;
  if (a.isReady) cov.ready++;
}

function withPercents(cov) {
  return {
    ...cov,
    pctImage: pct(cov.withImage, cov.total),
    pctAttachments: pct(cov.withAttachments, cov.total),
    pctSprockets: pct(cov.withSprockets, cov.total),
    pctPins: pct(cov.withPins, cov.total),
    pctMaterials: pct(cov.withMaterials, cov.total),
    pctRatings: pct(cov.withRatings, cov.total),
    pctConfirmedSource: pct(cov.withConfirmedSource, cov.total),
    pctReady: pct(cov.ready, cov.total),
  };
}

/**
 * Compute the full completeness audit.
 * @param {Array} [chains] optional chain array (defaults to static normalized index)
 * @returns structured audit: overall, byFamily, bySourceBrand, gaps
 */
export function computeCatalogAudit(chains = ALL_NORMALIZED_CHAINS) {
  const perChain = chains.map(auditChain);

  // Overall coverage
  const overall = blankCoverage();
  perChain.forEach(a => accumulate(overall, a));

  // Per-family coverage — keyed by every known family so empties surface as gaps
  const familyCov = {};
  for (const fam of CHAIN_FAMILIES) {
    familyCov[fam.key] = { key: fam.key, label: fam.label, ...blankCoverage() };
  }
  // Bucket for any chain whose family isn't in the registry (data hygiene signal)
  const UNKNOWN = "__unknown_family__";
  familyCov[UNKNOWN] = { key: UNKNOWN, label: "⚠ Unmapped family", ...blankCoverage() };

  for (const a of perChain) {
    const bucket = familyCov[a.chain_family] ? a.chain_family : UNKNOWN;
    accumulate(familyCov[bucket], a);
  }

  const byFamily = Object.values(familyCov)
    .filter(f => f.total > 0 || f.key !== UNKNOWN)
    .map(f => ({ key: f.key, label: f.label, ...withPercents(f) }))
    .sort((x, y) => y.total - x.total);

  // Which families have an attachment library defined (capability vs. linkage)
  const familyAttachmentCapability = {};
  for (const fam of CHAIN_FAMILIES) {
    familyAttachmentCapability[fam.key] = getAttachmentsForFamily(fam.key).length;
  }

  // Per source-brand sourcing coverage (internal scorecard, never customer-facing)
  const coverage = getCoverageStats();
  const bySourceBrand = TARGET_SOURCE_BRANDS.map(brand => {
    const bL = brand.toLowerCase();
    let confirmed = 0, total = 0;
    for (const c of chains) {
      for (const r of (c.source_refs || [])) {
        if ((r.manufacturer || "").toLowerCase() === bL) {
          total++;
          if (r.confidence === "Confirmed") confirmed++;
        }
      }
    }
    return { brand, confirmed, total, present: total > 0 };
  }).sort((a, b) => b.confirmed - a.confirmed);

  // Concrete gap lists (so we know exactly what to fix next)
  const gaps = {
    noImage: perChain.filter(a => !a.hasExactImage).map(a => a.chain_id),
    noAttachments: perChain.filter(a => !a.hasAttachments).map(a => a.chain_id),
    noSprockets: perChain.filter(a => !a.hasSprockets).map(a => a.chain_id),
    noRatings: perChain.filter(a => !a.hasRatings).map(a => a.chain_id),
    noConfirmedSource: perChain.filter(a => !a.hasConfirmedSource).map(a => a.chain_id),
    unmappedFamily: perChain.filter(a => !familyCov[a.chain_family] || a.chain_family === undefined).map(a => a.chain_id),
  };

  return {
    generatedAt: new Date().toISOString(),
    overall: withPercents(overall),
    byFamily,
    bySourceBrand,
    familyAttachmentCapability,
    manufacturersPresent: coverage.manufacturers,
    gaps,
    perChain,
  };
}

export default computeCatalogAudit;
