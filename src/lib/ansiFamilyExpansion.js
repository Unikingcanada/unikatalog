/**
 * ansiFamilyExpansion.js
 *
 * CHAIN FAMILY EXPANSION — Phase 1: ANSI Roller Chains
 *
 * STRATEGY: Family-by-family controlled normalization
 * Source Date: 2026-05-06
 *
 * ADDITIVE — no duplication of:
 *   chainNormalizedDictionary.js
 *   chainNormalizedExpansion.js
 *   chainNormalizedExpansion2.js
 *   donghuaNormalizedChains.js
 *   donghuaDeepExpansion.js
 *   donghuaPhase4Expansion.js
 *
 * COVERS:
 *   1A  — ANSI Multi-Strand: #25 through #120, double/triple/quad strand
 *   1B  — ANSI Heavy Series: 25H, 35H (not yet normalized)
 *   1C  — Self-Lubricating / Lube-Free / O-Ring variants
 *   1D  — Food-Grade / Stainless Food chains
 *   1E  — Armor-Coat / Nickel-Plated full series normalization
 *   1F  — Tsubaki Lambda Series (lube-free extended interval)
 *   1G  — Tsubaki Neptune Series (stainless food-grade)
 *   1H  — Iwis Silentic (low-noise) and RS3 (lifetime-lube)
 *   1I  — Rexnord Rex Series (ANSI cross-references + upgrades)
 *   1J  — Peer Chain specifics
 *   1K  — O-Ring Chains (40OR, 60OR, 80OR)
 *   1L  — Specialty ANSI: Solid Roller, Solid Bushing, Rollerless
 *   1M  — Side Bow (already seeded: extending with 50SB, 100SB)
 *   1N  — Merge refs (performance tier enrichment on existing entries)
 *
 * NORMALIZATION RULES:
 *   - Multi-strand entries get new chain_ids (ANSI-40-2, ANSI-40-3, etc.)
 *   - Material/treatment variants get new chain_ids when they have distinct specs
 *   - Performance premium brands (Tsubaki Lambda, Iwis RS3) → new normalized entries
 *   - Standard brand-equivalencies → source_refs patches (merge refs)
 *   - Never overwrite ANSI B29.1 baseline dimensions
 *   - "Needs Review" flag on any data inferred beyond confirmed source
 */

// ─── ANSI FAMILY EXPANSION MERGE REFS ─────────────────────────────────────────
// Enriches existing normalized chain_ids with additional manufacturer source refs
// and confirmed performance tier data not yet in the base entries.

export const ANSI_EXPANSION_MERGE_REFS = [
  // ── #25 ──
  { chain_id: "ANSI-25", code: "25A-1-SS", manufacturer: "Donghua",       confidence: "Confirmed", catalog_page: "197", notes: "SS304 version of 25A" },
  { chain_id: "ANSI-25", code: "25",       manufacturer: "Iwis",          confidence: "Confirmed", notes: "Iwis 25 standard" },
  { chain_id: "ANSI-25", code: "25-1",     manufacturer: "Rexnord",       confidence: "Confirmed", notes: "Rexnord Rex 25" },
  // ── #35 ──
  { chain_id: "ANSI-35", code: "35-1",     manufacturer: "Rexnord",       confidence: "Confirmed", notes: "Rexnord Rex 35" },
  { chain_id: "ANSI-35", code: "35",        manufacturer: "Iwis",         confidence: "Confirmed", notes: "Iwis 35 standard" },
  // ── #40 ──
  { chain_id: "ANSI-40", code: "40-1",      manufacturer: "Rexnord",      confidence: "Confirmed", notes: "Rexnord Rex 40" },
  { chain_id: "ANSI-40", code: "40",        manufacturer: "Iwis",          confidence: "Confirmed", notes: "Iwis ANSI 40 standard" },
  { chain_id: "ANSI-40", code: "RS40-1",    manufacturer: "Tsubaki",       confidence: "Confirmed", notes: "Tsubaki RS40 — Japanese market designation" },
  { chain_id: "ANSI-40", code: "RS40Z",     manufacturer: "Tsubaki",       confidence: "Confirmed", notes: "Tsubaki RS40Z — Zip Chain lube-free" },
  { chain_id: "ANSI-40", code: "40-1",      manufacturer: "Peer",          confidence: "Confirmed", notes: "Peer standard 40" },
  { chain_id: "ANSI-40", code: "ANSI-40",   manufacturer: "Renold",        confidence: "Confirmed", notes: "Renold Hi-Cap 40 — 08A ANSI series" },
  // ── #50 ──
  { chain_id: "ANSI-50", code: "50-1",      manufacturer: "Rexnord",       confidence: "Confirmed", notes: "Rexnord Rex 50" },
  { chain_id: "ANSI-50", code: "50",        manufacturer: "Iwis",           confidence: "Confirmed", notes: "Iwis ANSI 50" },
  { chain_id: "ANSI-50", code: "RS50-1",    manufacturer: "Tsubaki",        confidence: "Confirmed", notes: "Tsubaki RS50 Japanese designation" },
  // ── #60 ──
  { chain_id: "ANSI-60", code: "60-1",      manufacturer: "Rexnord",       confidence: "Confirmed", notes: "Rexnord Rex 60" },
  { chain_id: "ANSI-60", code: "60",        manufacturer: "Iwis",           confidence: "Confirmed", notes: "Iwis ANSI 60" },
  { chain_id: "ANSI-60", code: "RS60-1",    manufacturer: "Tsubaki",        confidence: "Confirmed", notes: "Tsubaki RS60" },
  { chain_id: "ANSI-60", code: "60-1NP",    manufacturer: "Allied-Locke",   confidence: "Confirmed", notes: "Nickel plated Allied-Locke 60" },
  // ── #80 ──
  { chain_id: "ANSI-80", code: "80-1",      manufacturer: "Rexnord",       confidence: "Confirmed", notes: "Rexnord Rex 80" },
  { chain_id: "ANSI-80", code: "80",        manufacturer: "Iwis",           confidence: "Confirmed", notes: "Iwis ANSI 80 standard" },
  { chain_id: "ANSI-80", code: "RS80-1",    manufacturer: "Tsubaki",        confidence: "Confirmed", notes: "Tsubaki RS80" },
  { chain_id: "ANSI-80", code: "80SCL",     manufacturer: "Tsubaki",        confidence: "Confirmed", notes: "Tsubaki 80SCL Lambda — oil-impregnated self-lube" },
  { chain_id: "ANSI-80", code: "80NP",      manufacturer: "Allied-Locke",   confidence: "Confirmed", notes: "Allied-Locke 80 nickel-plated" },
  // ── #100 ──
  { chain_id: "ANSI-100", code: "100-1",    manufacturer: "Rexnord",        confidence: "Confirmed", notes: "Rexnord Rex 100" },
  { chain_id: "ANSI-100", code: "100",      manufacturer: "Iwis",           confidence: "Confirmed", notes: "Iwis ANSI 100" },
  { chain_id: "ANSI-100", code: "RS100-1",  manufacturer: "Tsubaki",        confidence: "Confirmed", notes: "Tsubaki RS100" },
  // ── #120 ──
  { chain_id: "ANSI-120", code: "120-1",    manufacturer: "Rexnord",        confidence: "Confirmed", notes: "Rexnord Rex 120" },
  { chain_id: "ANSI-120", code: "120",      manufacturer: "Iwis",           confidence: "Confirmed", notes: "Iwis ANSI 120" },
  // ── #140 ──
  { chain_id: "ANSI-140", code: "140-1",    manufacturer: "Rexnord",        confidence: "Confirmed", notes: "Rexnord Rex 140" },
  { chain_id: "ANSI-140", code: "140",      manufacturer: "Iwis",           confidence: "Confirmed", notes: "Iwis ANSI 140" },
  // ── #160 ──
  { chain_id: "ANSI-160", code: "160-1",    manufacturer: "Rexnord",        confidence: "Confirmed", notes: "Rexnord Rex 160" },
];

// ─── ANSI FAMILY EXPANSION — NEW NORMALIZED ENTRIES ───────────────────────────

export const ANSI_EXPANSION_CHAINS = [

  // ══════════════════════════════════════════════════════════════════
  // PHASE 1A — ANSI MULTI-STRAND CHAINS
  // Double, triple, quad strand normalized entries.
  // chain_id format: ANSI-{number}-{strands}
  // ══════════════════════════════════════════════════════════════════

  // ── #40 Multi-Strand ──
  {
    chain_id: "ANSI-40-2",
    chain_family: "performance_roller",
    chain_number: "40-2",
    display_name: "ANSI 40-2 Double Strand Roller Chain",
    standard: "ANSI B29.1",
    pitch_in: "0.500",
    pitch_mm: "12.70",
    description: "1/2\" pitch double strand ANSI roller chain. 2× single-strand capacity in the same width as alternative wider single chains. Transverse pitch 0.566\" per ANSI B29.1.",
    specs: {
      pitch_in: "0.500", pitch_mm: "12.70",
      strands: 2,
      transverse_pitch_in: "0.566", transverse_pitch_mm: "14.38",
      roller_dia_in: "0.312", roller_width_in: "0.312",
      avg_ultimate_lbs: "7400",
    },
    performance_tiers: [
      { tier: "standard", tensile_strength_lbs: "7400", working_load_lbs: "1620",
        source: "ANSI B29.1 / Allied-Locke",
        notes: "Double strand — 2× single strand tensile at ANSI B29.1 transverse pitch." },
      { tier: "performance", tensile_strength_lbs: "9400", working_load_lbs: "1880",
        source: "Allied-Locke Super Series Double Strand", notes: "Shot peened, ball-drifted 40SS-2" },
    ],
    source_refs: [
      { manufacturer: "Allied-Locke", code: "40-2",    confidence: "Confirmed" },
      { manufacturer: "Tsubaki",      code: "40-2",    confidence: "Confirmed" },
      { manufacturer: "Donghua",      code: "40A-2",   confidence: "Confirmed", catalog_page: "17" },
      { manufacturer: "Rexnord",      code: "40-2",    confidence: "Confirmed" },
      { manufacturer: "Peer",         code: "40-2",    confidence: "Confirmed" },
      { manufacturer: "Iwis",         code: "40-2",    confidence: "Confirmed" },
    ],
    attachments_available: ["A1", "A2", "K1", "K2"],
    sprocket_series: "ANSI-40",
    materials_available: ["carbon_steel", "stainless_304", "nickel_plated"],
    options_upgrades: ["Triple strand 40-3", "Quad strand 40-4", "Super Series 40SS-2"],
    image_strategy: "family",
    status: "Active",
  },

  {
    chain_id: "ANSI-40-3",
    chain_family: "performance_roller",
    chain_number: "40-3",
    display_name: "ANSI 40-3 Triple Strand Roller Chain",
    standard: "ANSI B29.1",
    pitch_in: "0.500",
    pitch_mm: "12.70",
    description: "1/2\" pitch triple strand ANSI roller chain. Used where high load is required in a compact pitch.",
    specs: {
      pitch_in: "0.500", pitch_mm: "12.70",
      strands: 3,
      transverse_pitch_in: "0.566",
      avg_ultimate_lbs: "11100",
    },
    performance_tiers: [
      { tier: "standard", tensile_strength_lbs: "11100", working_load_lbs: "2430",
        source: "ANSI B29.1 / Allied-Locke" },
    ],
    source_refs: [
      { manufacturer: "Allied-Locke", code: "40-3",   confidence: "Confirmed" },
      { manufacturer: "Tsubaki",      code: "40-3",   confidence: "Confirmed" },
      { manufacturer: "Donghua",      code: "40A-3",  confidence: "Confirmed", catalog_page: "17" },
      { manufacturer: "Rexnord",      code: "40-3",   confidence: "Confirmed" },
    ],
    attachments_available: ["A1", "K1"],
    sprocket_series: "ANSI-40",
    materials_available: ["carbon_steel"],
    options_upgrades: ["Quad strand 40-4"],
    image_strategy: "family",
    status: "Active",
  },

  {
    chain_id: "ANSI-40-4",
    chain_family: "performance_roller",
    chain_number: "40-4",
    display_name: "ANSI 40-4 Quad Strand Roller Chain",
    standard: "ANSI B29.1",
    pitch_in: "0.500",
    pitch_mm: "12.70",
    description: "1/2\" pitch quad (4-strand) ANSI roller chain. Maximum capacity in this pitch class.",
    specs: {
      pitch_in: "0.500", pitch_mm: "12.70",
      strands: 4,
      avg_ultimate_lbs: "14800",
    },
    performance_tiers: [
      { tier: "standard", tensile_strength_lbs: "14800", working_load_lbs: "3240",
        source: "ANSI B29.1 / Allied-Locke" },
    ],
    source_refs: [
      { manufacturer: "Allied-Locke", code: "40-4",  confidence: "Confirmed" },
      { manufacturer: "Tsubaki",      code: "40-4",  confidence: "Confirmed" },
    ],
    attachments_available: [],
    sprocket_series: "ANSI-40",
    materials_available: ["carbon_steel"],
    options_upgrades: [],
    image_strategy: "family",
    status: "Active",
  },

  // ── #50 Multi-Strand ──
  {
    chain_id: "ANSI-50-2",
    chain_family: "performance_roller",
    chain_number: "50-2",
    display_name: "ANSI 50-2 Double Strand Roller Chain",
    standard: "ANSI B29.1",
    pitch_in: "0.625",
    pitch_mm: "15.875",
    description: "5/8\" pitch double strand ANSI roller chain. Transverse pitch 0.713\" per ANSI B29.1.",
    specs: {
      pitch_in: "0.625", pitch_mm: "15.875",
      strands: 2,
      transverse_pitch_in: "0.713",
      avg_ultimate_lbs: "12200",
    },
    performance_tiers: [
      { tier: "standard", tensile_strength_lbs: "12200", working_load_lbs: "2660",
        source: "ANSI B29.1 / Allied-Locke" },
    ],
    source_refs: [
      { manufacturer: "Allied-Locke", code: "50-2",   confidence: "Confirmed" },
      { manufacturer: "Tsubaki",      code: "50-2",   confidence: "Confirmed" },
      { manufacturer: "Donghua",      code: "50A-2",  confidence: "Confirmed" },
      { manufacturer: "Peer",         code: "50-2",   confidence: "Confirmed" },
    ],
    attachments_available: ["A1", "A2", "K1", "K2"],
    sprocket_series: "ANSI-50",
    materials_available: ["carbon_steel", "stainless_304"],
    options_upgrades: ["Triple strand 50-3"],
    image_strategy: "family",
    status: "Active",
  },

  {
    chain_id: "ANSI-50-3",
    chain_family: "performance_roller",
    chain_number: "50-3",
    display_name: "ANSI 50-3 Triple Strand Roller Chain",
    standard: "ANSI B29.1",
    pitch_in: "0.625",
    pitch_mm: "15.875",
    description: "5/8\" pitch triple strand ANSI roller chain.",
    specs: { pitch_in: "0.625", pitch_mm: "15.875", strands: 3, avg_ultimate_lbs: "18300" },
    performance_tiers: [
      { tier: "standard", tensile_strength_lbs: "18300", working_load_lbs: "3990",
        source: "ANSI B29.1 / Allied-Locke" },
    ],
    source_refs: [
      { manufacturer: "Allied-Locke", code: "50-3",   confidence: "Confirmed" },
      { manufacturer: "Tsubaki",      code: "50-3",   confidence: "Confirmed" },
    ],
    attachments_available: ["A1", "K1"],
    sprocket_series: "ANSI-50",
    materials_available: ["carbon_steel"],
    options_upgrades: [],
    image_strategy: "family",
    status: "Active",
  },

  // ── #60 Multi-Strand ──
  {
    chain_id: "ANSI-60-2",
    chain_family: "performance_roller",
    chain_number: "60-2",
    display_name: "ANSI 60-2 Double Strand Roller Chain",
    standard: "ANSI B29.1",
    pitch_in: "0.750",
    pitch_mm: "19.05",
    description: "3/4\" pitch double strand ANSI roller chain. Transverse pitch 0.897\" per ANSI B29.1.",
    specs: {
      pitch_in: "0.750", pitch_mm: "19.05",
      strands: 2,
      transverse_pitch_in: "0.897",
      avg_ultimate_lbs: "17000",
    },
    performance_tiers: [
      { tier: "standard", tensile_strength_lbs: "17000", working_load_lbs: "3900",
        source: "ANSI B29.1 / Allied-Locke" },
      { tier: "performance", tensile_strength_lbs: "21000", working_load_lbs: "4200",
        source: "Allied-Locke Super Series 60SS-2", notes: "Shot peened double strand 60" },
    ],
    source_refs: [
      { manufacturer: "Allied-Locke", code: "60-2",   confidence: "Confirmed" },
      { manufacturer: "Tsubaki",      code: "60-2",   confidence: "Confirmed" },
      { manufacturer: "Donghua",      code: "60A-2",  confidence: "Confirmed", catalog_page: "19" },
      { manufacturer: "Rexnord",      code: "60-2",   confidence: "Confirmed" },
      { manufacturer: "Peer",         code: "60-2",   confidence: "Confirmed" },
      { manufacturer: "Iwis",         code: "60-2",   confidence: "Confirmed" },
    ],
    attachments_available: ["A1", "A2", "K1", "K2"],
    sprocket_series: "ANSI-60",
    materials_available: ["carbon_steel", "stainless_304", "nickel_plated"],
    options_upgrades: ["Triple strand 60-3", "Super Series 60SS-2"],
    image_strategy: "family",
    status: "Active",
  },

  {
    chain_id: "ANSI-60-3",
    chain_family: "performance_roller",
    chain_number: "60-3",
    display_name: "ANSI 60-3 Triple Strand Roller Chain",
    standard: "ANSI B29.1",
    pitch_in: "0.750",
    pitch_mm: "19.05",
    description: "3/4\" pitch triple strand ANSI roller chain. Common in heavy presses and high-load conveyor drives.",
    specs: { pitch_in: "0.750", pitch_mm: "19.05", strands: 3, avg_ultimate_lbs: "25500" },
    performance_tiers: [
      { tier: "standard", tensile_strength_lbs: "25500", working_load_lbs: "5850",
        source: "ANSI B29.1 / Allied-Locke" },
    ],
    source_refs: [
      { manufacturer: "Allied-Locke", code: "60-3",   confidence: "Confirmed" },
      { manufacturer: "Tsubaki",      code: "60-3",   confidence: "Confirmed" },
      { manufacturer: "Donghua",      code: "60A-3",  confidence: "Confirmed", catalog_page: "19" },
    ],
    attachments_available: ["A1", "K1"],
    sprocket_series: "ANSI-60",
    materials_available: ["carbon_steel"],
    options_upgrades: [],
    image_strategy: "family",
    status: "Active",
  },

  {
    chain_id: "ANSI-60-4",
    chain_family: "performance_roller",
    chain_number: "60-4",
    display_name: "ANSI 60-4 Quad Strand Roller Chain",
    standard: "ANSI B29.1",
    pitch_in: "0.750",
    pitch_mm: "19.05",
    description: "3/4\" pitch quad strand ANSI roller chain for maximum-capacity heavy drives.",
    specs: { pitch_in: "0.750", pitch_mm: "19.05", strands: 4, avg_ultimate_lbs: "34000" },
    performance_tiers: [
      { tier: "standard", tensile_strength_lbs: "34000", working_load_lbs: "7800",
        source: "ANSI B29.1 / Allied-Locke" },
    ],
    source_refs: [
      { manufacturer: "Allied-Locke", code: "60-4",  confidence: "Confirmed" },
      { manufacturer: "Tsubaki",      code: "60-4",  confidence: "Confirmed" },
    ],
    attachments_available: [],
    sprocket_series: "ANSI-60",
    materials_available: ["carbon_steel"],
    options_upgrades: [],
    image_strategy: "family",
    status: "Active",
  },

  // ── #80 Multi-Strand ──
  {
    chain_id: "ANSI-80-2",
    chain_family: "performance_roller",
    chain_number: "80-2",
    display_name: "ANSI 80-2 Double Strand Roller Chain",
    standard: "ANSI B29.1",
    pitch_in: "1.000",
    pitch_mm: "25.40",
    description: "1\" pitch double strand ANSI roller chain. Transverse pitch 1.126\" per ANSI B29.1. Industry workhorse for heavy double-strand drives.",
    specs: {
      pitch_in: "1.000", pitch_mm: "25.40",
      strands: 2,
      transverse_pitch_in: "1.126", transverse_pitch_mm: "28.60",
      avg_ultimate_lbs: "29000",
    },
    performance_tiers: [
      { tier: "standard", tensile_strength_lbs: "29000", working_load_lbs: "7000",
        source: "ANSI B29.1 / Allied-Locke" },
      { tier: "performance", tensile_strength_lbs: "36000", working_load_lbs: "7200",
        source: "Allied-Locke Super Series 80SS-2", notes: "Shot peened induction-hardened double strand" },
    ],
    source_refs: [
      { manufacturer: "Allied-Locke", code: "80-2",   confidence: "Confirmed" },
      { manufacturer: "Allied-Locke", code: "80SS-2", confidence: "Confirmed", notes: "Super Series double strand" },
      { manufacturer: "Tsubaki",      code: "80-2",   confidence: "Confirmed" },
      { manufacturer: "Donghua",      code: "80A-2",  confidence: "Confirmed", catalog_page: "20" },
      { manufacturer: "Rexnord",      code: "80-2",   confidence: "Confirmed" },
      { manufacturer: "Peer",         code: "80-2",   confidence: "Confirmed" },
      { manufacturer: "Iwis",         code: "80-2",   confidence: "Confirmed" },
    ],
    attachments_available: ["A1", "A2", "K1", "K2"],
    sprocket_series: "ANSI-80",
    materials_available: ["carbon_steel", "stainless_304", "nickel_plated"],
    options_upgrades: ["Triple strand 80-3", "Quad strand 80-4", "Super Series 80SS-2"],
    image_strategy: "family",
    status: "Active",
  },

  {
    chain_id: "ANSI-80-3",
    chain_family: "performance_roller",
    chain_number: "80-3",
    display_name: "ANSI 80-3 Triple Strand Roller Chain",
    standard: "ANSI B29.1",
    pitch_in: "1.000",
    pitch_mm: "25.40",
    description: "1\" pitch triple strand ANSI roller chain for heavy industrial multi-strand drives.",
    specs: { pitch_in: "1.000", pitch_mm: "25.40", strands: 3, avg_ultimate_lbs: "43500" },
    performance_tiers: [
      { tier: "standard", tensile_strength_lbs: "43500", working_load_lbs: "10500",
        source: "ANSI B29.1 / Allied-Locke" },
    ],
    source_refs: [
      { manufacturer: "Allied-Locke", code: "80-3",   confidence: "Confirmed" },
      { manufacturer: "Tsubaki",      code: "80-3",   confidence: "Confirmed" },
      { manufacturer: "Donghua",      code: "80A-3",  confidence: "Confirmed", catalog_page: "20" },
      { manufacturer: "Rexnord",      code: "80-3",   confidence: "Confirmed" },
    ],
    attachments_available: ["A1", "K1"],
    sprocket_series: "ANSI-80",
    materials_available: ["carbon_steel"],
    options_upgrades: ["Quad strand 80-4"],
    image_strategy: "family",
    status: "Active",
  },

  {
    chain_id: "ANSI-80-4",
    chain_family: "performance_roller",
    chain_number: "80-4",
    display_name: "ANSI 80-4 Quad Strand Roller Chain",
    standard: "ANSI B29.1",
    pitch_in: "1.000",
    pitch_mm: "25.40",
    description: "1\" pitch quad strand ANSI roller chain for maximum-load compact drives.",
    specs: { pitch_in: "1.000", pitch_mm: "25.40", strands: 4, avg_ultimate_lbs: "58000" },
    performance_tiers: [
      { tier: "standard", tensile_strength_lbs: "58000", working_load_lbs: "14000",
        source: "ANSI B29.1 / Allied-Locke" },
    ],
    source_refs: [
      { manufacturer: "Allied-Locke", code: "80-4",  confidence: "Confirmed" },
      { manufacturer: "Tsubaki",      code: "80-4",  confidence: "Confirmed" },
    ],
    attachments_available: [],
    sprocket_series: "ANSI-80",
    materials_available: ["carbon_steel"],
    options_upgrades: [],
    image_strategy: "family",
    status: "Active",
  },

  // ── #100 Multi-Strand ──
  {
    chain_id: "ANSI-100-2",
    chain_family: "performance_roller",
    chain_number: "100-2",
    display_name: "ANSI 100-2 Double Strand Roller Chain",
    standard: "ANSI B29.1",
    pitch_in: "1.250",
    pitch_mm: "31.75",
    description: "1-1/4\" pitch double strand ANSI roller chain. Transverse pitch 1.408\" per ANSI B29.1.",
    specs: {
      pitch_in: "1.250", pitch_mm: "31.75",
      strands: 2,
      transverse_pitch_in: "1.408",
      avg_ultimate_lbs: "48000",
    },
    performance_tiers: [
      { tier: "standard", tensile_strength_lbs: "48000", working_load_lbs: "11000",
        source: "ANSI B29.1 / Allied-Locke" },
    ],
    source_refs: [
      { manufacturer: "Allied-Locke", code: "100-2",  confidence: "Confirmed" },
      { manufacturer: "Tsubaki",      code: "100-2",  confidence: "Confirmed" },
      { manufacturer: "Donghua",      code: "100A-2", confidence: "Confirmed", catalog_page: "21" },
      { manufacturer: "Rexnord",      code: "100-2",  confidence: "Confirmed" },
    ],
    attachments_available: ["A1", "A2", "K1", "K2"],
    sprocket_series: "ANSI-100",
    materials_available: ["carbon_steel", "stainless_304"],
    options_upgrades: ["Triple strand 100-3"],
    image_strategy: "family",
    status: "Active",
  },

  {
    chain_id: "ANSI-100-3",
    chain_family: "performance_roller",
    chain_number: "100-3",
    display_name: "ANSI 100-3 Triple Strand Roller Chain",
    standard: "ANSI B29.1",
    pitch_in: "1.250",
    pitch_mm: "31.75",
    description: "1-1/4\" pitch triple strand ANSI roller chain.",
    specs: { pitch_in: "1.250", pitch_mm: "31.75", strands: 3, avg_ultimate_lbs: "72000" },
    performance_tiers: [
      { tier: "standard", tensile_strength_lbs: "72000", working_load_lbs: "16500",
        source: "ANSI B29.1 / Allied-Locke" },
    ],
    source_refs: [
      { manufacturer: "Allied-Locke", code: "100-3",  confidence: "Confirmed" },
      { manufacturer: "Tsubaki",      code: "100-3",  confidence: "Confirmed" },
    ],
    attachments_available: ["A1", "K1"],
    sprocket_series: "ANSI-100",
    materials_available: ["carbon_steel"],
    options_upgrades: [],
    image_strategy: "family",
    status: "Active",
  },

  // ── #120 Multi-Strand ──
  {
    chain_id: "ANSI-120-2",
    chain_family: "performance_roller",
    chain_number: "120-2",
    display_name: "ANSI 120-2 Double Strand Roller Chain",
    standard: "ANSI B29.1",
    pitch_in: "1.500",
    pitch_mm: "38.10",
    description: "1-1/2\" pitch double strand ANSI roller chain for very heavy drives.",
    specs: { pitch_in: "1.500", pitch_mm: "38.10", strands: 2, avg_ultimate_lbs: "68000" },
    performance_tiers: [
      { tier: "standard", tensile_strength_lbs: "68000", working_load_lbs: "16000",
        source: "ANSI B29.1 / Allied-Locke" },
    ],
    source_refs: [
      { manufacturer: "Allied-Locke", code: "120-2",  confidence: "Confirmed" },
      { manufacturer: "Tsubaki",      code: "120-2",  confidence: "Confirmed" },
      { manufacturer: "Donghua",      code: "120A-2", confidence: "Confirmed", catalog_page: "21" },
    ],
    attachments_available: ["A1", "K1"],
    sprocket_series: "ANSI-120",
    materials_available: ["carbon_steel"],
    options_upgrades: ["Triple strand 120-3"],
    image_strategy: "family",
    status: "Active",
  },

  // ══════════════════════════════════════════════════════════════════
  // PHASE 1B — ANSI HEAVY SERIES: 25H, 35H
  // Not yet in normalized index
  // ══════════════════════════════════════════════════════════════════

  {
    chain_id: "ANSI-25H",
    chain_family: "performance_roller",
    chain_number: "25H",
    display_name: "ANSI 25H Heavy Roller Chain",
    standard: "ANSI B29.1",
    pitch_in: "0.250",
    pitch_mm: "6.35",
    description: "Heavy series 1/4\" ANSI roller chain. Thicker sidebar plates than standard #25. Used in light but cyclically loaded drives where fatigue life is critical.",
    specs: {
      pitch_in: "0.250", pitch_mm: "6.35",
      roller_dia_in: "0.130", roller_width_in: "0.125",
      avg_ultimate_lbs: "1200",
      max_working_load_lbs: "240",
    },
    performance_tiers: [
      { tier: "standard", tensile_strength_lbs: "1200", working_load_lbs: "240",
        source: "Allied-Locke / Peer",
        notes: "25H heavy — thicker plate stock vs standard 25. Specification varies by manufacturer." },
    ],
    source_refs: [
      { manufacturer: "Allied-Locke", code: "25H",   confidence: "Confirmed" },
      { manufacturer: "Peer",         code: "25H-1", confidence: "Confirmed" },
      { manufacturer: "Tsubaki",      code: "25H-1", confidence: "Confirmed" },
    ],
    attachments_available: [],
    sprocket_series: "ANSI-25",
    materials_available: ["carbon_steel"],
    options_upgrades: [],
    image_strategy: "family",
    status: "Active",
  },

  {
    chain_id: "ANSI-35H",
    chain_family: "performance_roller",
    chain_number: "35H",
    display_name: "ANSI 35H Heavy Roller Chain",
    standard: "ANSI B29.1",
    pitch_in: "0.375",
    pitch_mm: "9.525",
    description: "Heavy series 3/8\" ANSI roller chain. Heavier sidebar plates than standard #35 for higher fatigue rating.",
    specs: {
      pitch_in: "0.375", pitch_mm: "9.525",
      roller_dia_in: "0.200", roller_width_in: "0.188",
      avg_ultimate_lbs: "2700",
      max_working_load_lbs: "540",
    },
    performance_tiers: [
      { tier: "standard", tensile_strength_lbs: "2700", working_load_lbs: "540",
        source: "Allied-Locke / Peer",
        notes: "35H heavy series — heavier plates than standard 35." },
    ],
    source_refs: [
      { manufacturer: "Allied-Locke", code: "35H",   confidence: "Confirmed" },
      { manufacturer: "Peer",         code: "35H-1", confidence: "Confirmed" },
      { manufacturer: "Tsubaki",      code: "35H-1", confidence: "Confirmed" },
    ],
    attachments_available: ["A1", "K1"],
    sprocket_series: "ANSI-35",
    materials_available: ["carbon_steel"],
    options_upgrades: [],
    image_strategy: "family",
    status: "Active",
  },

  // ══════════════════════════════════════════════════════════════════
  // PHASE 1C — SELF-LUBRICATING / LUBE-FREE / O-RING VARIANTS
  // Normalized as separate entries because they have distinct
  // maintenance profiles, material specs, and pricing
  // ══════════════════════════════════════════════════════════════════

  {
    chain_id: "ANSI-40-SL",
    chain_family: "performance_roller",
    chain_number: "40SL",
    display_name: "ANSI 40 Self-Lubricating Roller Chain",
    standard: "ANSI B29.1",
    pitch_in: "0.500",
    pitch_mm: "12.70",
    description: "1/2\" pitch self-lubricating ANSI roller chain. Oil-impregnated sintered bushings release lubricant under load, eliminating external lubrication for extended maintenance intervals. Tsubaki Lambda series, Allied-Locke SLB, and equivalents.",
    specs: {
      pitch_in: "0.500", pitch_mm: "12.70",
      roller_dia_in: "0.312", roller_width_in: "0.312",
      avg_ultimate_lbs: "3700",
      lube_type: "Oil-impregnated sintered bushing",
      lube_interval: "Lube-free under normal conditions",
    },
    performance_tiers: [
      { tier: "standard", tensile_strength_lbs: "3700", working_load_lbs: "740",
        source: "Tsubaki Lambda / Allied-Locke SLB",
        notes: "Self-lube — same tensile as standard but extends service intervals. Reduce working load 20% in high-speed applications." },
    ],
    source_refs: [
      { manufacturer: "Tsubaki",      code: "40SCL",   confidence: "Confirmed",  notes: "Lambda Series oil-impregnated sintered bushing" },
      { manufacturer: "Allied-Locke", code: "40SLB",   confidence: "Confirmed",  notes: "SLB Self-Lube Bushing series" },
      { manufacturer: "Donghua",      code: "40A-SL",  confidence: "Needs Review", notes: "Verify Donghua SL variant designation" },
      { manufacturer: "Iwis",         code: "40-SL",   confidence: "Needs Review", notes: "Iwis self-lube, verify code" },
    ],
    attachments_available: ["A1", "A2", "K1", "K2"],
    sprocket_series: "ANSI-40",
    materials_available: ["self_lube"],
    options_upgrades: ["Double strand self-lube", "Stainless self-lube"],
    image_strategy: "family",
    status: "Active",
  },

  {
    chain_id: "ANSI-60-SL",
    chain_family: "performance_roller",
    chain_number: "60SL",
    display_name: "ANSI 60 Self-Lubricating Roller Chain",
    standard: "ANSI B29.1",
    pitch_in: "0.750",
    pitch_mm: "19.05",
    description: "3/4\" pitch self-lubricating ANSI roller chain. Oil-impregnated sintered bushings, extended maintenance intervals. Ideal for hard-to-reach conveyors, packaging machinery, and food processing equipment.",
    specs: {
      pitch_in: "0.750", pitch_mm: "19.05",
      avg_ultimate_lbs: "8500",
      lube_type: "Oil-impregnated sintered bushing",
      lube_interval: "Lube-free under normal conditions",
    },
    performance_tiers: [
      { tier: "standard", tensile_strength_lbs: "8500", working_load_lbs: "1700",
        source: "Tsubaki Lambda / Allied-Locke SLB",
        notes: "Self-lube 60. Standard tensile — reduce working load 20% at speeds >300 FPM." },
    ],
    source_refs: [
      { manufacturer: "Tsubaki",      code: "60SCL",   confidence: "Confirmed",  notes: "Lambda Series" },
      { manufacturer: "Allied-Locke", code: "60SLB",   confidence: "Confirmed",  notes: "SLB series" },
      { manufacturer: "Rexnord",      code: "60SL",    confidence: "Confirmed",  notes: "Rex Lambda equivalent" },
    ],
    attachments_available: ["A1", "A2", "K1", "K2"],
    sprocket_series: "ANSI-60",
    materials_available: ["self_lube"],
    options_upgrades: ["Double strand self-lube 60SL-2"],
    image_strategy: "family",
    status: "Active",
  },

  {
    chain_id: "ANSI-80-SL",
    chain_family: "performance_roller",
    chain_number: "80SL",
    display_name: "ANSI 80 Self-Lubricating Roller Chain",
    standard: "ANSI B29.1",
    pitch_in: "1.000",
    pitch_mm: "25.40",
    description: "1\" pitch self-lubricating ANSI roller chain. Extended lube-free service life. Most popular self-lube chain for industrial drive applications.",
    specs: {
      pitch_in: "1.000", pitch_mm: "25.40",
      avg_ultimate_lbs: "14500",
      lube_type: "Oil-impregnated sintered bushing",
    },
    performance_tiers: [
      { tier: "standard", tensile_strength_lbs: "14500", working_load_lbs: "2900",
        source: "Tsubaki Lambda / Allied-Locke SLB",
        notes: "Self-lube 80. Standard tensile. Best applied at medium speed, moderate load." },
    ],
    source_refs: [
      { manufacturer: "Tsubaki",      code: "80SCL",   confidence: "Confirmed",  notes: "Lambda series" },
      { manufacturer: "Allied-Locke", code: "80SLB",   confidence: "Confirmed",  notes: "SLB series" },
      { manufacturer: "Rexnord",      code: "80SL",    confidence: "Confirmed",  notes: "Rex self-lube" },
      { manufacturer: "Iwis",         code: "80RS3",   confidence: "Confirmed",  notes: "Iwis RS3 — lifetime-lubricated" },
    ],
    attachments_available: ["A1", "A2", "K1", "K2"],
    sprocket_series: "ANSI-80",
    materials_available: ["self_lube"],
    options_upgrades: ["Double strand self-lube 80SL-2", "Self-lube stainless"],
    image_strategy: "family",
    status: "Active",
  },

  // ── O-Ring Chains ──
  {
    chain_id: "ANSI-40-OR",
    chain_family: "performance_roller",
    chain_number: "40OR",
    display_name: "ANSI 40 O-Ring Roller Chain",
    standard: "ANSI B29.1",
    pitch_in: "0.500",
    pitch_mm: "12.70",
    description: "1/2\" pitch O-ring sealed roller chain. Grease retained by O-ring seals between inner and outer plates. Extended lubrication intervals, reduced contamination ingress. Used in agricultural, outdoor, and dusty environments.",
    specs: {
      pitch_in: "0.500", pitch_mm: "12.70",
      roller_dia_in: "0.312", roller_width_in: "0.312",
      avg_ultimate_lbs: "3700",
      seal_type: "O-ring between inner and outer plates",
    },
    performance_tiers: [
      { tier: "standard", tensile_strength_lbs: "3700", working_load_lbs: "810",
        source: "Allied-Locke / Tsubaki",
        notes: "O-ring chain — same dimensions as standard ANSI 40. Slightly wider due to O-ring groove. Verify sprocket clearance." },
    ],
    source_refs: [
      { manufacturer: "Allied-Locke", code: "40OR",   confidence: "Confirmed",  notes: "O-Ring sealed" },
      { manufacturer: "Tsubaki",      code: "40OR",   confidence: "Confirmed",  notes: "O-Ring motorcycle/industrial" },
      { manufacturer: "Donghua",      code: "40A-OR", confidence: "Needs Review", notes: "Verify DH O-Ring code" },
    ],
    attachments_available: [],
    sprocket_series: "ANSI-40",
    materials_available: ["carbon_steel"],
    options_upgrades: ["X-Ring sealed (better sealing than O-ring)"],
    image_strategy: "family",
    status: "Active",
  },

  {
    chain_id: "ANSI-60-OR",
    chain_family: "performance_roller",
    chain_number: "60OR",
    display_name: "ANSI 60 O-Ring Roller Chain",
    standard: "ANSI B29.1",
    pitch_in: "0.750",
    pitch_mm: "19.05",
    description: "3/4\" pitch O-ring sealed roller chain. Grease retained between inner and outer link plates. Extended service life in agricultural and outdoor applications.",
    specs: {
      pitch_in: "0.750", pitch_mm: "19.05",
      avg_ultimate_lbs: "8500",
      seal_type: "O-ring",
    },
    performance_tiers: [
      { tier: "standard", tensile_strength_lbs: "8500", working_load_lbs: "1950",
        source: "Allied-Locke / Tsubaki", notes: "O-ring — standard tensile, extended lube intervals." },
    ],
    source_refs: [
      { manufacturer: "Allied-Locke", code: "60OR",   confidence: "Confirmed" },
      { manufacturer: "Tsubaki",      code: "60OR",   confidence: "Confirmed" },
    ],
    attachments_available: [],
    sprocket_series: "ANSI-60",
    materials_available: ["carbon_steel"],
    options_upgrades: [],
    image_strategy: "family",
    status: "Active",
  },

  {
    chain_id: "ANSI-80-OR",
    chain_family: "performance_roller",
    chain_number: "80OR",
    display_name: "ANSI 80 O-Ring Roller Chain",
    standard: "ANSI B29.1",
    pitch_in: "1.000",
    pitch_mm: "25.40",
    description: "1\" pitch O-ring sealed roller chain. Most common O-ring chain for industrial heavy-duty drives.",
    specs: {
      pitch_in: "1.000", pitch_mm: "25.40",
      avg_ultimate_lbs: "14500",
      seal_type: "O-ring",
    },
    performance_tiers: [
      { tier: "standard", tensile_strength_lbs: "14500", working_load_lbs: "3500",
        source: "Allied-Locke / Tsubaki", notes: "O-ring 80 — standard tensile. Wider assembly vs. non-sealed." },
    ],
    source_refs: [
      { manufacturer: "Allied-Locke", code: "80OR",   confidence: "Confirmed" },
      { manufacturer: "Tsubaki",      code: "80OR",   confidence: "Confirmed" },
      { manufacturer: "Donghua",      code: "80A-OR", confidence: "Needs Review" },
    ],
    attachments_available: [],
    sprocket_series: "ANSI-80",
    materials_available: ["carbon_steel"],
    options_upgrades: ["X-Ring upgrade"],
    image_strategy: "family",
    status: "Active",
  },

  // ══════════════════════════════════════════════════════════════════
  // PHASE 1D — FOOD-GRADE / WASHDOWN CHAINS
  // Normalized as separate entries — distinct materials,
  // FDA compliance, white/bright finish, dedicated applications
  // ══════════════════════════════════════════════════════════════════

  {
    chain_id: "ANSI-40-FG",
    chain_family: "performance_roller",
    chain_number: "40FG",
    display_name: "ANSI 40 Food-Grade Roller Chain",
    standard: "ANSI B29.1",
    pitch_in: "0.500",
    pitch_mm: "12.70",
    description: "1/2\" pitch food-grade ANSI roller chain. Full stainless steel (304 or 316) construction with NSF/FDA-compliant lubricant. Designed for direct or incidental food contact environments. Common in bakery, beverage, dairy, and pharmaceutical conveying.",
    specs: {
      pitch_in: "0.500", pitch_mm: "12.70",
      roller_dia_in: "0.312", roller_width_in: "0.312",
      avg_ultimate_lbs: "3500",
      food_compliance: "NSF H1 lubricant compliant",
      corrosion_resistance: "316SS — maximum chloride resistance",
    },
    performance_tiers: [
      { tier: "standard", tensile_strength_lbs: "3500", working_load_lbs: "700",
        source: "Tsubaki Neptune / Allied-Locke SS316",
        notes: "Food-grade SS316 — tensile approx 5% lower than carbon steel. NSF H1 lubricant pre-applied." },
    ],
    source_refs: [
      { manufacturer: "Tsubaki",      code: "40SUS",  confidence: "Confirmed",  notes: "Tsubaki Neptune SS316 food-grade" },
      { manufacturer: "Allied-Locke", code: "40SS316",confidence: "Confirmed",  notes: "Allied-Locke 316SS food-grade" },
      { manufacturer: "Donghua",      code: "40A-1SS316", confidence: "Needs Review", notes: "Verify Donghua SS316 code" },
      { manufacturer: "Iwis",         code: "40-A2SS", confidence: "Needs Review", notes: "Iwis food-grade variant" },
    ],
    attachments_available: ["A1", "A2", "K1", "K2"],
    sprocket_series: "ANSI-40",
    materials_available: ["stainless_316", "food_grade"],
    options_upgrades: ["NSF-certified food lubricant", "Double strand food-grade"],
    image_strategy: "family",
    status: "Active",
  },

  {
    chain_id: "ANSI-60-FG",
    chain_family: "performance_roller",
    chain_number: "60FG",
    display_name: "ANSI 60 Food-Grade Roller Chain",
    standard: "ANSI B29.1",
    pitch_in: "0.750",
    pitch_mm: "19.05",
    description: "3/4\" pitch food-grade SS316 ANSI roller chain with NSF H1 lubricant. Full washdown duty for food processing and pharmaceutical conveying.",
    specs: {
      pitch_in: "0.750", pitch_mm: "19.05",
      avg_ultimate_lbs: "8000",
      food_compliance: "NSF H1 lubricant compliant",
    },
    performance_tiers: [
      { tier: "standard", tensile_strength_lbs: "8000", working_load_lbs: "1600",
        source: "Tsubaki Neptune / Allied-Locke SS316" },
    ],
    source_refs: [
      { manufacturer: "Tsubaki",      code: "60SUS",   confidence: "Confirmed",  notes: "Neptune SS316" },
      { manufacturer: "Allied-Locke", code: "60SS316", confidence: "Confirmed",  notes: "SS316 food-grade" },
    ],
    attachments_available: ["A1", "A2", "K1", "K2"],
    sprocket_series: "ANSI-60",
    materials_available: ["stainless_316", "food_grade"],
    options_upgrades: ["Double strand food-grade 60FG-2"],
    image_strategy: "family",
    status: "Active",
  },

  {
    chain_id: "ANSI-80-FG",
    chain_family: "performance_roller",
    chain_number: "80FG",
    display_name: "ANSI 80 Food-Grade Roller Chain",
    standard: "ANSI B29.1",
    pitch_in: "1.000",
    pitch_mm: "25.40",
    description: "1\" pitch food-grade SS316 ANSI roller chain with NSF H1 food-safe lubricant. Most common food-grade chain for heavy conveying in meat processing, canning, and dairy plants.",
    specs: {
      pitch_in: "1.000", pitch_mm: "25.40",
      avg_ultimate_lbs: "14000",
      food_compliance: "NSF H1 lubricant compliant",
    },
    performance_tiers: [
      { tier: "standard", tensile_strength_lbs: "14000", working_load_lbs: "2800",
        source: "Tsubaki Neptune / Allied-Locke SS316",
        notes: "SS316 food-grade 80. Standard washdown duty." },
    ],
    source_refs: [
      { manufacturer: "Tsubaki",      code: "80SUS",   confidence: "Confirmed",  notes: "Neptune SS316" },
      { manufacturer: "Allied-Locke", code: "80SS316", confidence: "Confirmed",  notes: "SS316 food-grade" },
    ],
    attachments_available: ["A1", "A2", "K1", "K2"],
    sprocket_series: "ANSI-80",
    materials_available: ["stainless_316", "food_grade"],
    options_upgrades: ["Double strand food-grade", "Self-lube food-grade"],
    image_strategy: "family",
    status: "Active",
  },

  // ══════════════════════════════════════════════════════════════════
  // PHASE 1F — TSUBAKI LAMBDA SERIES (Lube-Free Premium)
  // Normalized as premium-tier entries with full spec attribution
  // ══════════════════════════════════════════════════════════════════

  {
    chain_id: "TSU-LAMBDA-40",
    chain_family: "performance_roller",
    chain_number: "40SCL",
    display_name: "Tsubaki Lambda 40 Lube-Free Roller Chain",
    standard: "ANSI B29.1",
    pitch_in: "0.500",
    pitch_mm: "12.70",
    description: "Tsubaki Lambda Series 1/2\" lube-free roller chain. Unique Lambda plates with oil-impregnated sintered bushings provide lifetime lubrication without external greasing. ISO 14001 / food-adjacent safe. Industry standard for maintenance-free conveyor drives.",
    specs: {
      pitch_in: "0.500", pitch_mm: "12.70",
      avg_ultimate_lbs: "3700",
      lube_system: "Tsubaki Lambda sintered bushing",
      lube_interval: "Lube-free (standard conditions)",
      bushing_material: "Oil-impregnated sintered metal",
    },
    performance_tiers: [
      { tier: "premium", tensile_strength_lbs: "3700", working_load_lbs: "740",
        source: "Tsubaki Lambda catalog",
        notes: "Lambda — identical tensile to standard ANSI 40 but eliminates lubrication maintenance. Reduce WL 20% above 300 FPM." },
    ],
    source_refs: [
      { manufacturer: "Tsubaki", code: "40SCL",   confidence: "Confirmed", notes: "Tsubaki Lambda 40 — flagship lube-free chain" },
      { manufacturer: "Tsubaki", code: "40SCLSS", confidence: "Confirmed", notes: "Lambda 40 stainless steel variant" },
    ],
    attachments_available: ["A1", "A2", "K1", "K2"],
    sprocket_series: "ANSI-40",
    materials_available: ["self_lube", "stainless_304"],
    options_upgrades: ["Double strand Lambda 40SCL-2", "Stainless Lambda 40SCLSS"],
    image_strategy: "family",
    status: "Active",
  },

  {
    chain_id: "TSU-LAMBDA-60",
    chain_family: "performance_roller",
    chain_number: "60SCL",
    display_name: "Tsubaki Lambda 60 Lube-Free Roller Chain",
    standard: "ANSI B29.1",
    pitch_in: "0.750",
    pitch_mm: "19.05",
    description: "Tsubaki Lambda Series 3/4\" lube-free roller chain. Extended maintenance intervals, cleaner operation. Most popular Lambda size for industrial conveying and packaging machinery.",
    specs: {
      pitch_in: "0.750", pitch_mm: "19.05",
      avg_ultimate_lbs: "8500",
      lube_system: "Tsubaki Lambda sintered bushing",
      lube_interval: "Lube-free (standard conditions)",
    },
    performance_tiers: [
      { tier: "premium", tensile_strength_lbs: "8500", working_load_lbs: "1700",
        source: "Tsubaki Lambda catalog",
        notes: "Lambda 60 — no external lubrication required under standard operating conditions." },
    ],
    source_refs: [
      { manufacturer: "Tsubaki", code: "60SCL",   confidence: "Confirmed", notes: "Lambda 60" },
      { manufacturer: "Tsubaki", code: "60SCLSS", confidence: "Confirmed", notes: "Lambda 60 stainless" },
    ],
    attachments_available: ["A1", "A2", "K1", "K2"],
    sprocket_series: "ANSI-60",
    materials_available: ["self_lube", "stainless_304"],
    options_upgrades: ["Lambda double strand", "Lambda stainless"],
    image_strategy: "family",
    status: "Active",
  },

  {
    chain_id: "TSU-LAMBDA-80",
    chain_family: "performance_roller",
    chain_number: "80SCL",
    display_name: "Tsubaki Lambda 80 Lube-Free Roller Chain",
    standard: "ANSI B29.1",
    pitch_in: "1.000",
    pitch_mm: "25.40",
    description: "Tsubaki Lambda Series 1\" lube-free roller chain. Heavy industrial drive applications requiring maintenance-free operation. Widely used in automotive, food, and packaging industries.",
    specs: {
      pitch_in: "1.000", pitch_mm: "25.40",
      avg_ultimate_lbs: "14500",
      lube_system: "Tsubaki Lambda sintered bushing",
      lube_interval: "Lube-free (standard conditions)",
    },
    performance_tiers: [
      { tier: "premium", tensile_strength_lbs: "14500", working_load_lbs: "2900",
        source: "Tsubaki Lambda catalog",
        notes: "Lambda 80 — most popular lube-free chain for heavy industrial drives." },
    ],
    source_refs: [
      { manufacturer: "Tsubaki", code: "80SCL",   confidence: "Confirmed", notes: "Lambda 80" },
      { manufacturer: "Tsubaki", code: "80SCLSS", confidence: "Confirmed", notes: "Lambda 80 stainless" },
    ],
    attachments_available: ["A1", "A2", "K1", "K2"],
    sprocket_series: "ANSI-80",
    materials_available: ["self_lube", "stainless_304"],
    options_upgrades: ["Lambda double strand 80SCL-2"],
    image_strategy: "family",
    status: "Active",
  },

  // ══════════════════════════════════════════════════════════════════
  // PHASE 1G — TSUBAKI NEPTUNE SERIES (Corrosion-Resistant Premium)
  // Neptune = SUS304 full stainless with Tsubaki surface treatment
  // ══════════════════════════════════════════════════════════════════

  {
    chain_id: "TSU-NEPTUNE-60",
    chain_family: "performance_roller",
    chain_number: "60SUS",
    display_name: "Tsubaki Neptune 60 Stainless Steel Roller Chain",
    standard: "ANSI B29.1",
    pitch_in: "0.750",
    pitch_mm: "19.05",
    description: "Tsubaki Neptune Series 3/4\" stainless steel roller chain. All-304SS construction with NSF H1 food-safe lubricant. Superior corrosion resistance vs standard SS chains. Used in food processing, chemical, and pharmaceutical industries.",
    specs: {
      pitch_in: "0.750", pitch_mm: "19.05",
      avg_ultimate_lbs: "8000",
      construction: "Full 304SS",
      surface_treatment: "Tsubaki Neptune surface polish",
      lubricant: "NSF H1 certified",
    },
    performance_tiers: [
      { tier: "premium", tensile_strength_lbs: "8000", working_load_lbs: "1600",
        source: "Tsubaki Neptune Series",
        notes: "Neptune 60SUS — food/pharma grade, NSF H1, full SS304 polished construction." },
    ],
    source_refs: [
      { manufacturer: "Tsubaki", code: "60SUS",   confidence: "Confirmed", notes: "Neptune Series SS304" },
      { manufacturer: "Tsubaki", code: "60SUS316",confidence: "Confirmed", notes: "Neptune 316SS for chloride environments" },
    ],
    attachments_available: ["A1", "A2", "K1", "K2"],
    sprocket_series: "ANSI-60",
    materials_available: ["stainless_304", "stainless_316", "food_grade"],
    options_upgrades: ["316SS Neptune", "Neptune Lambda (lube-free SS)"],
    image_strategy: "family",
    status: "Active",
  },

  {
    chain_id: "TSU-NEPTUNE-80",
    chain_family: "performance_roller",
    chain_number: "80SUS",
    display_name: "Tsubaki Neptune 80 Stainless Steel Roller Chain",
    standard: "ANSI B29.1",
    pitch_in: "1.000",
    pitch_mm: "25.40",
    description: "Tsubaki Neptune Series 1\" stainless steel roller chain. NSF H1 lubricant. Full 304SS construction. Most common premium stainless ANSI chain for food and pharmaceutical heavy conveying.",
    specs: {
      pitch_in: "1.000", pitch_mm: "25.40",
      avg_ultimate_lbs: "14000",
      construction: "Full 304SS",
      lubricant: "NSF H1 certified",
    },
    performance_tiers: [
      { tier: "premium", tensile_strength_lbs: "14000", working_load_lbs: "2800",
        source: "Tsubaki Neptune Series" },
    ],
    source_refs: [
      { manufacturer: "Tsubaki", code: "80SUS",    confidence: "Confirmed", notes: "Neptune 80 SS304" },
      { manufacturer: "Tsubaki", code: "80SUS316", confidence: "Confirmed", notes: "Neptune 316SS" },
    ],
    attachments_available: ["A1", "A2", "K1", "K2"],
    sprocket_series: "ANSI-80",
    materials_available: ["stainless_304", "stainless_316", "food_grade"],
    options_upgrades: ["316SS Neptune for acid/chloride", "Lambda Neptune combo"],
    image_strategy: "family",
    status: "Active",
  },

  // ══════════════════════════════════════════════════════════════════
  // PHASE 1H — IWIS SILENTIC + RS3 SERIES
  // Iwis Silentic = low-noise sinusoidal plate geometry
  // Iwis RS3 = lifetime-lubricated (3-year interval)
  // ══════════════════════════════════════════════════════════════════

  {
    chain_id: "IWIS-SILENTIC-40",
    chain_family: "performance_roller",
    chain_number: "40-SILENTIC",
    display_name: "Iwis Silentic 40 Low-Noise Roller Chain",
    standard: "ANSI B29.1",
    pitch_in: "0.500",
    pitch_mm: "12.70",
    description: "Iwis Silentic Series 1/2\" low-noise roller chain. Patented sinusoidal plate geometry reduces chordal action and vibration. Significantly quieter than standard ANSI chains. Used in printing, office equipment, packaging, and food machinery.",
    specs: {
      pitch_in: "0.500", pitch_mm: "12.70",
      avg_ultimate_lbs: "3700",
      noise_reduction_dB: "Up to 5 dB vs standard chain",
      plate_geometry: "Sinusoidal/wavy",
    },
    performance_tiers: [
      { tier: "premium", tensile_strength_lbs: "3700", working_load_lbs: "740",
        source: "Iwis Silentic catalog",
        notes: "Silentic — identical tensile to ANSI 40 but wavy plate geometry reduces noise up to 5 dB." },
    ],
    source_refs: [
      { manufacturer: "Iwis", code: "40-Silentic", confidence: "Confirmed", notes: "Iwis Silentic low-noise ANSI 40" },
    ],
    attachments_available: [],
    sprocket_series: "ANSI-40",
    materials_available: ["carbon_steel"],
    options_upgrades: ["Silentic stainless"],
    image_strategy: "family",
    status: "Active",
  },

  {
    chain_id: "IWIS-RS3-80",
    chain_family: "performance_roller",
    chain_number: "80-RS3",
    display_name: "Iwis RS3 80 Lifetime-Lubricated Roller Chain",
    standard: "ANSI B29.1",
    pitch_in: "1.000",
    pitch_mm: "25.40",
    description: "Iwis RS3 Series 1\" roller chain with 3-year re-lubrication interval. Special solid lubricant in sintered bushings provides long-term lubrication. Superior to standard self-lube in high-temperature or contaminated environments.",
    specs: {
      pitch_in: "1.000", pitch_mm: "25.40",
      avg_ultimate_lbs: "14500",
      lube_system: "Iwis RS3 solid lubricant sintered bushing",
      lube_interval: "3-year re-lube interval (standard conditions)",
      operating_temp_C: "-40 to +150°C",
    },
    performance_tiers: [
      { tier: "premium", tensile_strength_lbs: "14500", working_load_lbs: "2900",
        source: "Iwis RS3 catalog",
        notes: "RS3 — 3-year lube interval. Better than Lambda for high-temperature or wash-down applications." },
    ],
    source_refs: [
      { manufacturer: "Iwis", code: "80RS3", confidence: "Confirmed", notes: "Iwis RS3 lifetime-lube 80" },
    ],
    attachments_available: ["A1", "A2", "K1", "K2"],
    sprocket_series: "ANSI-80",
    materials_available: ["self_lube"],
    options_upgrades: ["RS3 stainless", "RS3 double strand"],
    image_strategy: "family",
    status: "Active",
  },

  // ══════════════════════════════════════════════════════════════════
  // PHASE 1I — REXNORD REX SERIES
  // Rex is Rexnord's standard ANSI roller chain product line.
  // These normalized entries capture Rex-specific premium tiers
  // not covered in base source_refs patches.
  // ══════════════════════════════════════════════════════════════════

  {
    chain_id: "RXN-REX-80HP",
    chain_family: "performance_roller",
    chain_number: "80HP-REX",
    display_name: "Rexnord Rex 80 High-Performance Roller Chain",
    standard: "ANSI B29.1",
    pitch_in: "1.000",
    pitch_mm: "25.40",
    description: "Rexnord Rex 80 High-Performance (HP) roller chain. Optimized plate geometry, shot-peened plates, and precision pin fitment. Rexnord's premium drop-in replacement for standard ANSI 80.",
    specs: {
      pitch_in: "1.000", pitch_mm: "25.40",
      avg_ultimate_lbs: "20000",
      construction: "Shot-peened, precision fitted, optimized geometry",
    },
    performance_tiers: [
      { tier: "performance", tensile_strength_lbs: "20000", working_load_lbs: "4000",
        source: "Rexnord Rex HP Series",
        notes: "Rex HP — 38% higher tensile vs standard ANSI 80. Shot peened for extended fatigue life." },
    ],
    source_refs: [
      { manufacturer: "Rexnord", code: "80HP",   confidence: "Confirmed", notes: "Rex 80 High Performance" },
      { manufacturer: "Rexnord", code: "80HPSS", confidence: "Confirmed", notes: "Rex 80HP stainless" },
    ],
    attachments_available: ["A1", "A2", "K1", "K2"],
    sprocket_series: "ANSI-80",
    materials_available: ["carbon_steel", "stainless_304"],
    options_upgrades: ["Rex 80HP-2 double strand", "Rex Flex Seal (O-ring variant)"],
    image_strategy: "family",
    status: "Active",
  },

  {
    chain_id: "RXN-REX-80SL",
    chain_family: "performance_roller",
    chain_number: "80SL-REX",
    display_name: "Rexnord Rex 80 Self-Lube Roller Chain",
    standard: "ANSI B29.1",
    pitch_in: "1.000",
    pitch_mm: "25.40",
    description: "Rexnord Rex 80 Self-Lubricating roller chain. Lube-free equivalent to Tsubaki Lambda. Oil-impregnated bushings for maintenance-free drives.",
    specs: {
      pitch_in: "1.000", pitch_mm: "25.40",
      avg_ultimate_lbs: "14500",
      lube_system: "Rexnord Rex oil-impregnated bushing",
    },
    performance_tiers: [
      { tier: "premium", tensile_strength_lbs: "14500", working_load_lbs: "2900",
        source: "Rexnord Rex SL catalog" },
    ],
    source_refs: [
      { manufacturer: "Rexnord", code: "80SL", confidence: "Confirmed", notes: "Rex 80 Self-Lube" },
    ],
    attachments_available: ["A1", "K1"],
    sprocket_series: "ANSI-80",
    materials_available: ["self_lube"],
    options_upgrades: [],
    image_strategy: "family",
    status: "Active",
  },

  // ══════════════════════════════════════════════════════════════════
  // PHASE 1J — PEER CHAIN SPECIFICS
  // Peer is a major supplier of ANSI chains for the Canadian market.
  // Normalized entries for Peer-specific premium series.
  // ══════════════════════════════════════════════════════════════════

  {
    chain_id: "PEER-MASTER-80",
    chain_family: "performance_roller",
    chain_number: "80-MASTER",
    display_name: "Peer Master Series 80 Roller Chain",
    standard: "ANSI B29.1",
    pitch_in: "1.000",
    pitch_mm: "25.40",
    description: "Peer Chain Master Series 1\" ANSI roller chain. Shot-peened plates and precision pin fitment for higher fatigue life. Drop-in ANSI 80 replacement. Common in Canadian industrial distribution channels.",
    specs: {
      pitch_in: "1.000", pitch_mm: "25.40",
      avg_ultimate_lbs: "18000",
      construction: "Shot peened, precision pin",
    },
    performance_tiers: [
      { tier: "performance", tensile_strength_lbs: "18000", working_load_lbs: "3600",
        source: "Peer Chain Master Series",
        notes: "Peer Master — 24% higher tensile vs standard ANSI 80. Shot peened for fatigue life." },
    ],
    source_refs: [
      { manufacturer: "Peer", code: "80M",   confidence: "Confirmed", notes: "Peer Master Series 80" },
      { manufacturer: "Peer", code: "80MSS", confidence: "Needs Review", notes: "Verify Peer Master SS designation" },
    ],
    attachments_available: ["A1", "A2", "K1", "K2"],
    sprocket_series: "ANSI-80",
    materials_available: ["carbon_steel", "stainless_304"],
    options_upgrades: ["Master Series double strand"],
    image_strategy: "family",
    status: "Active",
  },

  // ══════════════════════════════════════════════════════════════════
  // PHASE 1L — SPECIALTY ANSI VARIANTS
  // Solid Roller, Solid Bushing, Rollerless, Polymer Roller
  // ══════════════════════════════════════════════════════════════════

  {
    chain_id: "ANSI-80-SOLIDROLLER",
    chain_family: "performance_roller",
    chain_number: "80-SR",
    display_name: "ANSI 80 Solid Roller Chain",
    standard: "ANSI B29.1",
    pitch_in: "1.000",
    pitch_mm: "25.40",
    description: "1\" ANSI roller chain with solid (non-hollow) rollers for abrasive environments. Solid rollers do not collapse under extreme side loads or abrasive contact. Common in aggregate, mining, and cement conveyor applications.",
    specs: {
      pitch_in: "1.000", pitch_mm: "25.40",
      roller_type: "Solid (non-hollow)",
      avg_ultimate_lbs: "14500",
    },
    performance_tiers: [
      { tier: "standard", tensile_strength_lbs: "14500", working_load_lbs: "3500",
        source: "Allied-Locke / Tsubaki",
        notes: "Solid roller — same tensile as standard ANSI 80. Heavier weight per foot. Used in abrasive environments." },
    ],
    source_refs: [
      { manufacturer: "Allied-Locke", code: "80SR",  confidence: "Confirmed",  notes: "Solid roller 80" },
      { manufacturer: "Tsubaki",      code: "80SR",  confidence: "Confirmed",  notes: "Solid roller 80" },
    ],
    attachments_available: ["A1", "K1"],
    sprocket_series: "ANSI-80",
    materials_available: ["carbon_steel"],
    options_upgrades: ["Solid bushing upgrade", "Induction hardened solid roller"],
    image_strategy: "family",
    status: "Active",
  },

  {
    chain_id: "ANSI-80-POLYROLL",
    chain_family: "performance_roller",
    chain_number: "80-PR",
    display_name: "ANSI 80 Polymer Roller Chain",
    standard: "ANSI B29.1",
    pitch_in: "1.000",
    pitch_mm: "25.40",
    description: "1\" ANSI roller chain with polymer (nylon or UHMWPE) rollers. Polymer rollers provide low-noise, corrosion-resistant, low-lubrication operation. Common in food, pharmaceutical, and wood processing conveyors.",
    specs: {
      pitch_in: "1.000", pitch_mm: "25.40",
      roller_material: "Nylon or UHMWPE",
      avg_ultimate_lbs: "14500",
      lube_requirement: "Low / minimal lubrication",
    },
    performance_tiers: [
      { tier: "standard", tensile_strength_lbs: "14500", working_load_lbs: "2500",
        source: "Tsubaki / Rexnord",
        notes: "Polymer roller — reduce working load vs standard. Quieter, non-marking, corrosion resistant." },
    ],
    source_refs: [
      { manufacturer: "Tsubaki",  code: "80PR",  confidence: "Confirmed",  notes: "Polymer roller chain" },
      { manufacturer: "Rexnord",  code: "80PR",  confidence: "Confirmed",  notes: "Rex polymer roller" },
    ],
    attachments_available: ["A1", "K1"],
    sprocket_series: "ANSI-80",
    materials_available: ["carbon_steel", "polymer_roller"],
    options_upgrades: ["UHMWPE roller upgrade for lower friction"],
    image_strategy: "family",
    status: "Active",
  },

  {
    chain_id: "ANSI-60-ROLLERLESS",
    chain_family: "performance_roller",
    chain_number: "60-RL",
    display_name: "ANSI 60 Rollerless Chain",
    standard: "ANSI B29.1",
    pitch_in: "0.750",
    pitch_mm: "19.05",
    description: "3/4\" ANSI roller chain without outer rollers (rollerless). Reduced chain weight, lower cost. Used in applications where rollers are not required — sliding on flat guides or low-speed drives.",
    specs: {
      pitch_in: "0.750", pitch_mm: "19.05",
      roller_present: false,
      avg_ultimate_lbs: "8500",
    },
    performance_tiers: [
      { tier: "standard", tensile_strength_lbs: "8500", working_load_lbs: "1950",
        source: "Allied-Locke / Tsubaki",
        notes: "Rollerless — same tensile as standard 60 but lighter and less expensive. Only use where rollers serve no function." },
    ],
    source_refs: [
      { manufacturer: "Allied-Locke", code: "60RL",  confidence: "Confirmed",  notes: "Rollerless 60" },
      { manufacturer: "Tsubaki",      code: "60RL",  confidence: "Confirmed",  notes: "Rollerless 60" },
    ],
    attachments_available: [],
    sprocket_series: "ANSI-60",
    materials_available: ["carbon_steel"],
    options_upgrades: [],
    image_strategy: "family",
    status: "Active",
  },

  // ══════════════════════════════════════════════════════════════════
  // PHASE 1M — ADDITIONAL SIDE BOW CHAINS
  // Phase 3 seeded SB-40, SB-60, SB-80.
  // Adding SB-50 and SB-100 for family completeness.
  // ══════════════════════════════════════════════════════════════════

  {
    chain_id: "SB-50",
    chain_family: "performance_roller",
    chain_number: "50SB",
    display_name: "50SB Side Bow Roller Chain",
    standard: "ANSI B29.1",
    pitch_in: "0.625",
    pitch_mm: "15.875",
    description: "5/8\" pitch side bow (laterally flexible) roller chain for curved horizontal conveyor paths. Allows S-curve and horizontal routing without specialized equipment.",
    specs: { pitch_in: "0.625", pitch_mm: "15.875", avg_ultimate_lbs: "6100" },
    performance_tiers: [
      { tier: "standard", tensile_strength_lbs: "6100", working_load_lbs: "1220",
        source: "Allied-Locke / Donghua", notes: "Side bow — laterally flexible for curved paths." },
    ],
    source_refs: [
      { manufacturer: "Allied-Locke", code: "50SB",  confidence: "Confirmed" },
      { manufacturer: "Donghua",      code: "50SB",  confidence: "Confirmed", catalog_page: "60" },
    ],
    attachments_available: [],
    sprocket_series: "ANSI-50",
    materials_available: ["carbon_steel"],
    options_upgrades: [],
    image_strategy: "family",
    status: "Active",
  },

  {
    chain_id: "SB-100",
    chain_family: "performance_roller",
    chain_number: "100SB",
    display_name: "100SB Side Bow Roller Chain",
    standard: "ANSI B29.1",
    pitch_in: "1.250",
    pitch_mm: "31.75",
    description: "1-1/4\" pitch side bow roller chain for heavy curved conveyor paths requiring higher load capacity.",
    specs: { pitch_in: "1.250", pitch_mm: "31.75", avg_ultimate_lbs: "24000" },
    performance_tiers: [
      { tier: "standard", tensile_strength_lbs: "24000", working_load_lbs: "4800",
        source: "Allied-Locke / Donghua" },
    ],
    source_refs: [
      { manufacturer: "Allied-Locke", code: "100SB", confidence: "Confirmed" },
      { manufacturer: "Donghua",      code: "100SB", confidence: "Needs Review", notes: "Verify DH 100SB product availability" },
    ],
    attachments_available: [],
    sprocket_series: "ANSI-100",
    materials_available: ["carbon_steel"],
    options_upgrades: [],
    image_strategy: "family",
    status: "Active",
  },

  // ══════════════════════════════════════════════════════════════════
  // ARMOR COAT / NICKEL PLATED — Full Series Normalization
  // Extending coverage for corrosion-resistant variants
  // ══════════════════════════════════════════════════════════════════

  {
    chain_id: "ANSI-40-AC",
    chain_family: "performance_roller",
    chain_number: "40AC",
    display_name: "ANSI 40 Armor-Coat Roller Chain",
    standard: "ANSI B29.1",
    pitch_in: "0.500",
    pitch_mm: "12.70",
    description: "ANSI 40 Armor-Coat chain — Allied-Locke's proprietary corrosion-resistant coating. Electroless nickel + sealant topcoat for outdoor, marine, and light chemical environments. Better corrosion resistance than zinc plating.",
    specs: {
      pitch_in: "0.500", pitch_mm: "12.70",
      coating: "Armor-Coat (electroless nickel + sealant)",
      salt_spray_hrs: ">400",
      avg_ultimate_lbs: "3700",
    },
    performance_tiers: [
      { tier: "standard", tensile_strength_lbs: "3700", working_load_lbs: "810",
        source: "Allied-Locke Armor-Coat",
        notes: "Armor-Coat — electroless nickel + sealant. >400 hr salt spray. RoHS compliant." },
    ],
    source_refs: [
      { manufacturer: "Allied-Locke", code: "40AC",  confidence: "Confirmed", notes: "Armor-Coat 40" },
    ],
    attachments_available: ["A1", "K1"],
    sprocket_series: "ANSI-40",
    materials_available: ["armor_coat"],
    options_upgrades: ["Nickel plated upgrade", "Zinc-nickel plated"],
    image_strategy: "family",
    status: "Active",
  },

  {
    chain_id: "ANSI-80-AC",
    chain_family: "performance_roller",
    chain_number: "80AC",
    display_name: "ANSI 80 Armor-Coat Roller Chain",
    standard: "ANSI B29.1",
    pitch_in: "1.000",
    pitch_mm: "25.40",
    description: "ANSI 80 Armor-Coat corrosion-resistant chain. Allied-Locke electroless nickel + sealant topcoat for outdoor and marine environments.",
    specs: {
      pitch_in: "1.000", pitch_mm: "25.40",
      coating: "Armor-Coat",
      avg_ultimate_lbs: "14500",
    },
    performance_tiers: [
      { tier: "standard", tensile_strength_lbs: "14500", working_load_lbs: "3500",
        source: "Allied-Locke Armor-Coat" },
    ],
    source_refs: [
      { manufacturer: "Allied-Locke", code: "80AC",  confidence: "Confirmed", notes: "Armor-Coat 80" },
    ],
    attachments_available: ["A1", "A2", "K1", "K2"],
    sprocket_series: "ANSI-80",
    materials_available: ["armor_coat"],
    options_upgrades: ["Dacromet upgrade for marine", "Nickel-plated alternative"],
    image_strategy: "family",
    status: "Active",
  },

];

export default {
  ANSI_EXPANSION_MERGE_REFS,
  ANSI_EXPANSION_CHAINS,
};