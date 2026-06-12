/**
 * extract_static.mjs
 *
 * V2 migration — step 2: lift the ~470 chains currently trapped in the
 * src/lib/*.js static arrays into versioned registry files, one per family.
 *
 * What it does (faithful to the live app, then corrected):
 *   1. Replicates chainNormalizedIndex.js's exact merge: dedup by chain_id in
 *      the documented source order (first-wins), then patch manufacturer
 *      MERGE_REFS onto existing chains — so output == what the app builds.
 *   2. Re-maps chain_family from the internal KEY ("performance_roller") to the
 *      canonical Base44 enum LABEL ("Performance Roller Chains"). Anything that
 *      does not map cleanly is kept and flagged (needs_review) — never silently
 *      laundered, unlike the runtime normalizer.
 *   3. Tags provenance (catalog-verified / standard-nominal / derived).
 *   4. Writes registry/families/<slug>.json (lossless: full record preserved),
 *      registry/_manifest.json, and prints a summary.
 *
 * Run: node registry/extract_static.mjs
 */
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

import { NORMALIZED_CHAINS } from "../src/lib/chainNormalizedDictionary.js";
import { NORMALIZED_CHAINS_EXPANSION } from "../src/lib/chainNormalizedExpansion.js";
import { NORMALIZED_CHAINS_EXPANSION_2 } from "../src/lib/chainNormalizedExpansion2.js";
import { DH_MERGE_REFS, DH_NEW_CHAINS } from "../src/lib/donghuaNormalizedChains.js";
import { DH_DEEP_MERGE_REFS, DH_DEEP_NEW_CHAINS } from "../src/lib/donghuaDeepExpansion.js";
import { DH_PHASE4_MERGE_REFS, DH_PHASE4_NEW_CHAINS } from "../src/lib/donghuaPhase4Expansion.js";
import { ANSI_FAMILY_MERGE_REFS, ANSI_FAMILY_NEW_CHAINS } from "../src/lib/ansiRollerChainExpansion.js";
import { UK_MERGE_REFS, UK_NEW_CHAINS } from "../src/lib/unikingBulkChains.js";
import { CHAIN_FAMILIES } from "../src/lib/chainFamilyData.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

// ── Canonical 18-family enum (mirrors base44/entities/Normalized_Chains.jsonc) ──
const ENUM_LABELS = new Set([
  "Performance Roller Chains", "Conveyor Roller Chains", "Attachment Roller Chains",
  "Hollow Pin Chains", "Double Pitch Conveyor Chains", "Engineered Class Chains",
  "Welded Steel Chains", "Steel Pintle Chains", "Steel Bushed Chains",
  "Agricultural Conveyor Chains", "SharpTop Chains", "Forged Chains",
  "Drop Forged Rivetless Chains", "Overhead Conveyor Chains", "Drag / Scraper Chains",
  "Bucket Elevator Chains", "Leaf Chains", "Specialty / Custom Chains",
]);

// key ("performance_roller") -> label ("Performance Roller Chains")
const KEY_TO_LABEL = Object.fromEntries(CHAIN_FAMILIES.map(f => [f.key, f.label]));

const slug = (label) =>
  label.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

// ── 1. Replicate chainNormalizedIndex.js merge (first-wins dedup + ref patching) ──
const SOURCES = [
  ["dictionary",        NORMALIZED_CHAINS],
  ["expansion",         NORMALIZED_CHAINS_EXPANSION],
  ["expansion2",        NORMALIZED_CHAINS_EXPANSION_2],
  ["donghua",           DH_NEW_CHAINS],
  ["donghua_deep",      DH_DEEP_NEW_CHAINS],
  ["donghua_phase4",    DH_PHASE4_NEW_CHAINS],
  ["ansi_family",       ANSI_FAMILY_NEW_CHAINS],
  ["uniking_bulk",      UK_NEW_CHAINS],
];

const seen = new Set();
const merged = [];
const collisions = [];
for (const [origin, arr] of SOURCES) {
  for (const chain of arr) {
    if (!chain?.chain_id) continue;
    if (seen.has(chain.chain_id)) { collisions.push({ chain_id: chain.chain_id, dropped_from: origin }); continue; }
    seen.add(chain.chain_id);
    merged.push({ ...chain, _origin: origin, source_refs: [...(chain.source_refs || [])] });
  }
}

// Patch manufacturer merge-refs onto existing chains (mirrors index 2a–3)
function patch(refs, mfrFor) {
  for (const ref of refs) {
    const chain = merged.find(c => c.chain_id === ref.chain_id);
    if (!chain) continue;
    const mfr = mfrFor(ref);
    if (!chain.source_refs.some(r => r.manufacturer === mfr && r.code === ref.code)) {
      chain.source_refs.push({
        manufacturer: mfr, code: ref.code, confidence: ref.confidence,
        catalog_page: ref.catalog_page ?? null, notes: ref.notes ?? null,
      });
    }
  }
}
patch(DH_MERGE_REFS,        () => "Donghua");
patch(DH_DEEP_MERGE_REFS,   () => "Donghua");
patch(DH_PHASE4_MERGE_REFS, () => "Donghua");
patch(ANSI_FAMILY_MERGE_REFS, (r) => r.manufacturer);
patch(UK_MERGE_REFS,        () => "Uniking");

// ── 2. Provenance heuristic ──
function provenanceOf(chain) {
  const refs = chain.source_refs || [];
  const confirmedCatalog = refs.some(r => r.confidence === "Confirmed" && (r.catalog_page || r.catalog_url));
  if (confirmedCatalog) return "catalog-verified";
  if (chain.standard && /ANSI|ISO|BS|DIN/i.test(chain.standard)) return "standard-nominal";
  return "derived";
}

// ── 3. Remap family + build registry records ──
const byFamily = {};
const unmapped = [];
for (const label of ENUM_LABELS) byFamily[label] = [];

for (const chain of merged) {
  const rawFamily = chain.chain_family;
  let label = KEY_TO_LABEL[rawFamily] || (ENUM_LABELS.has(rawFamily) ? rawFamily : null);
  const provenance = provenanceOf(chain);
  let needs_review = provenance === "derived";

  if (!label) {
    label = "Specialty / Custom Chains"; // park unmapped here, flagged for triage
    needs_review = true;
    unmapped.push({ chain_id: chain.chain_id, raw_family: rawFamily, origin: chain._origin });
  }

  byFamily[label].push({
    ...chain,
    chain_family: label,
    _family_key: rawFamily,
    _family_unmapped: !KEY_TO_LABEL[rawFamily] && !ENUM_LABELS.has(rawFamily),
    provenance,
    needs_review,
  });
}

// ── 4. Write per-family files (sorted by chain_id) + manifest ──
const manifest = {
  generated_at: new Date().toISOString(),
  generator: "registry/extract_static.mjs",
  total_chains: merged.length,
  source_collisions_dropped: collisions.length,
  unmapped_family_count: unmapped.length,
  families: {},
  empty_families: [],
  unmapped,
  collisions,
};

for (const label of [...ENUM_LABELS]) {
  const records = byFamily[label].sort((a, b) => a.chain_id.localeCompare(b.chain_id));
  const file = `${slug(label)}.json`;
  const prov = records.reduce((m, r) => { m[r.provenance] = (m[r.provenance] || 0) + 1; return m; }, {});
  manifest.families[label] = { file, count: records.length, provenance: prov };
  if (records.length === 0) manifest.empty_families.push(label);
  writeFileSync(
    join(__dirname, "families", file),
    JSON.stringify({ family: label, slug: slug(label), count: records.length, chains: records }, null, 2) + "\n"
  );
}

writeFileSync(join(__dirname, "_manifest.json"), JSON.stringify(manifest, null, 2) + "\n");

// ── Console summary ──
console.log(`\nExtracted ${merged.length} chains -> ${[...ENUM_LABELS].length} family files`);
console.log(`Dropped ${collisions.length} duplicate chain_id collisions during merge`);
console.log(`Unmapped families: ${unmapped.length}\n`);
const rows = [...ENUM_LABELS]
  .map(l => ({ l, n: byFamily[l].length }))
  .sort((a, b) => b.n - a.n);
for (const { l, n } of rows) {
  const tag = n === 0 ? "  <-- EMPTY (no static data)" : "";
  console.log(`  ${String(n).padStart(3)}  ${l}${tag}`);
}
const provTotals = merged.reduce((m, c) => { const p = provenanceOf(c); m[p] = (m[p]||0)+1; return m; }, {});
console.log(`\nProvenance:`, provTotals);
