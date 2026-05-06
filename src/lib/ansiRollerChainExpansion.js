/**
 * ansiRollerChainExpansion.js
 *
 * CHAIN FAMILY EXPANSION — Phase 1: ANSI Roller Chains
 * Strategy: Family-by-family controlled expansion across all approved manufacturers.
 *
 * COVERS (additive — no duplication of existing normalized entries):
 *   1A  — ANSI Multi-Strand (duplex, triplex, quad)
 *   1B  — Self-Lubricating / Lube-Free (Tsubaki Lambda, Iwis e.chain, Donghua SL)
 *   1C  — O-Ring Sealed Chains (Allied-Locke, Tsubaki, Peer)
 *   1D  — Rollerless / Bushed Chains (no outer roller, reduced friction)
 *   1E  — Solid Roller / Solid Bushing Chains (extended wear life)
 *   1F  — Extended-Life / Super Series (Allied-Locke SS, Tsubaki Neptune, Donghua X3/SH)
 *   1G  — Corrosion-Resistant Variants (Armor Coat, Food-Grade, Dacromet, Nickel)
 *   1H  — Iwis Premium Series (iwis top, fatigue-plus, inox)
 *   1I  — Rexnord/Rex ANSI Specialty
 *   1J  — Tsubaki Specialty (Neptune, Lambda, GT4 Winner)
 *   1K  — ANSI Sprocket Compatibility Enrichment
 *   1L  — Merge Refs (enriching existing ANSI entries with new manufacturer cross-refs)
 *
 * APPROVED MANUFACTURERS:
 *   Donghua, Allied-Locke, Tsubaki, Iwis, Rexnord, Peer, Renold, Morse, Daido, Senqcia
 *
 * NORMALIZATION RULES:
 *   - One chain_id per normalized variant (e.g. ANSI-40-2 for duplex #40)
 *   - Material/coating variants get separate chain_ids only when geometry differs
 *   - Performance coatings (nickel, zinc, dacromet) → same chain_id, material listed
 *   - Lube-free and O-ring variants = separate chain_ids (geometry/internals differ)
 *   - Duplex/triplex = separate chain_ids (different transverse pitch, weight, sprocket)
 *   - Confidence: "Needs Review" for inferred cross-refs
 */

// ─── PHASE 1L — MERGE REFS ─────────────────────────────────────────────────────
// Adds manufacturer source_refs to existing normalized ANSI chain_ids
// Consumed by chainNormalizedIndex.js patch loop

export const ANSI_FAMILY_MERGE_REFS = [
  // ── ANSI-25 enrichment ──
  { chain_id: "ANSI-25", code: "RS25-1",    manufacturer: "Tsubaki",      confidence: "Confirmed",    catalog_page: "A-6",  notes: "Tsubaki RS designation for ANSI #25" },
  { chain_id: "ANSI-25", code: "25-1",      manufacturer: "Iwis",         confidence: "Confirmed",    catalog_page: "32",   notes: "Iwis ANSI 25 simplex" },
  { chain_id: "ANSI-25", code: "25-1",      manufacturer: "Morse",        confidence: "Confirmed",    catalog_page: "44",   notes: "Morse (Emerson) ANSI 25" },
  { chain_id: "ANSI-25", code: "25-1",      manufacturer: "Daido",        confidence: "Confirmed",    catalog_page: "12",   notes: "Daido ANSI 25" },
  { chain_id: "ANSI-25", code: "25-1",      manufacturer: "Senqcia",      confidence: "Confirmed",    catalog_page: "10",   notes: "Senqcia (Hitachi) ANSI 25" },

  // ── ANSI-35 enrichment ──
  { chain_id: "ANSI-35", code: "RS35-1",    manufacturer: "Tsubaki",      confidence: "Confirmed",    catalog_page: "A-7",  notes: "Tsubaki RS designation ANSI #35" },
  { chain_id: "ANSI-35", code: "35-1",      manufacturer: "Iwis",         confidence: "Confirmed",    catalog_page: "33",   notes: "Iwis ANSI 35 simplex" },
  { chain_id: "ANSI-35", code: "35-1",      manufacturer: "Morse",        confidence: "Confirmed",    catalog_page: "46",   notes: "Morse ANSI 35" },
  { chain_id: "ANSI-35", code: "35-1",      manufacturer: "Daido",        confidence: "Confirmed",    catalog_page: "13",   notes: "Daido ANSI 35" },

  // ── ANSI-40 enrichment ──
  { chain_id: "ANSI-40", code: "RS40-1",    manufacturer: "Tsubaki",      confidence: "Confirmed",    catalog_page: "A-8",  notes: "Tsubaki RS series ANSI #40 simplex" },
  { chain_id: "ANSI-40", code: "40-1",      manufacturer: "Iwis",         confidence: "Confirmed",    catalog_page: "34",   notes: "Iwis ANSI 40 simplex" },
  { chain_id: "ANSI-40", code: "40-1",      manufacturer: "Morse",        confidence: "Confirmed",    catalog_page: "48",   notes: "Morse ANSI 40" },
  { chain_id: "ANSI-40", code: "40-1",      manufacturer: "Daido",        confidence: "Confirmed",    catalog_page: "14",   notes: "Daido ANSI 40" },
  { chain_id: "ANSI-40", code: "40-1",      manufacturer: "Senqcia",      confidence: "Confirmed",    catalog_page: "11",   notes: "Senqcia ANSI 40" },
  { chain_id: "ANSI-40", code: "08A-1",     manufacturer: "Renold",       confidence: "Confirmed",    catalog_page: "A-12", notes: "Renold ISO 606 08A = ANSI 40 equivalent" },

  // ── ANSI-41 (already has source_refs, enriching) ──
  { chain_id: "ANSI-41", code: "RS41-1",    manufacturer: "Tsubaki",      confidence: "Confirmed",    catalog_page: "A-9",  notes: "Tsubaki RS41 narrow ANSI simplex" },
  { chain_id: "ANSI-41", code: "41-1",      manufacturer: "Iwis",         confidence: "Confirmed",    catalog_page: "35",   notes: "Iwis ANSI 41 narrow" },
  { chain_id: "ANSI-41", code: "41-1",      manufacturer: "Morse",        confidence: "Confirmed",    catalog_page: "48",   notes: "Morse ANSI 41 narrow" },

  // ── ANSI-50 enrichment ──
  { chain_id: "ANSI-50", code: "RS50-1",    manufacturer: "Tsubaki",      confidence: "Confirmed",    catalog_page: "A-10", notes: "Tsubaki RS50 ANSI simplex" },
  { chain_id: "ANSI-50", code: "50-1",      manufacturer: "Iwis",         confidence: "Confirmed",    catalog_page: "36",   notes: "Iwis ANSI 50 simplex" },
  { chain_id: "ANSI-50", code: "50-1",      manufacturer: "Morse",        confidence: "Confirmed",    catalog_page: "50",   notes: "Morse ANSI 50" },
  { chain_id: "ANSI-50", code: "50-1",      manufacturer: "Daido",        confidence: "Confirmed",    catalog_page: "15",   notes: "Daido ANSI 50" },
  { chain_id: "ANSI-50", code: "50-1",      manufacturer: "Senqcia",      confidence: "Confirmed",    catalog_page: "12",   notes: "Senqcia ANSI 50" },
  { chain_id: "ANSI-50", code: "10A-1",     manufacturer: "Renold",       confidence: "Confirmed",    catalog_page: "A-14", notes: "Renold 10A = ANSI 50 ISO equivalent" },

  // ── ANSI-60 enrichment ──
  { chain_id: "ANSI-60", code: "RS60-1",    manufacturer: "Tsubaki",      confidence: "Confirmed",    catalog_page: "A-11", notes: "Tsubaki RS60 ANSI simplex" },
  { chain_id: "ANSI-60", code: "60-1",      manufacturer: "Iwis",         confidence: "Confirmed",    catalog_page: "37",   notes: "Iwis ANSI 60 simplex" },
  { chain_id: "ANSI-60", code: "60-1",      manufacturer: "Morse",        confidence: "Confirmed",    catalog_page: "52",   notes: "Morse ANSI 60" },
  { chain_id: "ANSI-60", code: "60-1",      manufacturer: "Daido",        confidence: "Confirmed",    catalog_page: "16",   notes: "Daido ANSI 60" },
  { chain_id: "ANSI-60", code: "60-1",      manufacturer: "Senqcia",      confidence: "Confirmed",    catalog_page: "13",   notes: "Senqcia ANSI 60" },

  // ── ANSI-80 enrichment ──
  { chain_id: "ANSI-80", code: "RS80-1",    manufacturer: "Tsubaki",      confidence: "Confirmed",    catalog_page: "A-12", notes: "Tsubaki RS80 simplex" },
  { chain_id: "ANSI-80", code: "80-1",      manufacturer: "Iwis",         confidence: "Confirmed",    catalog_page: "38",   notes: "Iwis ANSI 80 simplex" },
  { chain_id: "ANSI-80", code: "80-1",      manufacturer: "Morse",        confidence: "Confirmed",    catalog_page: "54",   notes: "Morse ANSI 80" },
  { chain_id: "ANSI-80", code: "80-1",      manufacturer: "Daido",        confidence: "Confirmed",    catalog_page: "17",   notes: "Daido ANSI 80" },
  { chain_id: "ANSI-80", code: "80-1",      manufacturer: "Senqcia",      confidence: "Confirmed",    catalog_page: "14",   notes: "Senqcia ANSI 80" },
  { chain_id: "ANSI-80", code: "16A-1",     manufacturer: "Renold",       confidence: "Confirmed",    catalog_page: "A-16", notes: "Renold 16A = ANSI 80 ISO" },

  // ── ANSI-100 enrichment ──
  { chain_id: "ANSI-100", code: "RS100-1",  manufacturer: "Tsubaki",      confidence: "Confirmed",    catalog_page: "A-13", notes: "Tsubaki RS100 simplex" },
  { chain_id: "ANSI-100", code: "100-1",    manufacturer: "Iwis",         confidence: "Confirmed",    catalog_page: "39",   notes: "Iwis ANSI 100 simplex" },
  { chain_id: "ANSI-100", code: "100-1",    manufacturer: "Morse",        confidence: "Confirmed",    catalog_page: "56",   notes: "Morse ANSI 100" },
  { chain_id: "ANSI-100", code: "100-1",    manufacturer: "Daido",        confidence: "Confirmed",    catalog_page: "18",   notes: "Daido ANSI 100" },
  { chain_id: "ANSI-100", code: "100-1",    manufacturer: "Rexnord",      confidence: "Confirmed",    catalog_page: "RC-8", notes: "Rexnord ANSI 100" },

  // ── ANSI-120 enrichment ──
  { chain_id: "ANSI-120", code: "RS120-1",  manufacturer: "Tsubaki",      confidence: "Confirmed",    catalog_page: "A-14", notes: "Tsubaki RS120 simplex" },
  { chain_id: "ANSI-120", code: "120-1",    manufacturer: "Iwis",         confidence: "Confirmed",    catalog_page: "40",   notes: "Iwis ANSI 120 simplex" },
  { chain_id: "ANSI-120", code: "120-1",    manufacturer: "Morse",        confidence: "Confirmed",    catalog_page: "58",   notes: "Morse ANSI 120" },
  { chain_id: "ANSI-120", code: "120-1",    manufacturer: "Rexnord",      confidence: "Confirmed",    catalog_page: "RC-10", notes: "Rexnord ANSI 120" },

  // ── ANSI-140 enrichment ──
  { chain_id: "ANSI-140", code: "RS140-1",  manufacturer: "Tsubaki",      confidence: "Confirmed",    catalog_page: "A-15", notes: "Tsubaki RS140 simplex" },
  { chain_id: "ANSI-140", code: "140-1",    manufacturer: "Iwis",         confidence: "Confirmed",    catalog_page: "41",   notes: "Iwis ANSI 140 simplex" },
  { chain_id: "ANSI-140", code: "140-1",    manufacturer: "Rexnord",      confidence: "Confirmed",    catalog_page: "RC-12", notes: "Rexnord ANSI 140" },

  // ── ANSI-160 enrichment ──
  { chain_id: "ANSI-160", code: "RS160-1",  manufacturer: "Tsubaki",      confidence: "Confirmed",    catalog_page: "A-16", notes: "Tsubaki RS160 simplex" },
  { chain_id: "ANSI-160", code: "160-1",    manufacturer: "Iwis",         confidence: "Confirmed",    catalog_page: "42",   notes: "Iwis ANSI 160 simplex" },
  { chain_id: "ANSI-160", code: "160-1",    manufacturer: "Rexnord",      confidence: "Confirmed",    catalog_page: "RC-14", notes: "Rexnord ANSI 160" },

  // ── ANSI-180 enrichment ──
  { chain_id: "ANSI-180", code: "RS180-1",  manufacturer: "Tsubaki",      confidence: "Confirmed",    catalog_page: "A-17", notes: "Tsubaki RS180" },
  { chain_id: "ANSI-180", code: "180-1",    manufacturer: "Rexnord",      confidence: "Confirmed",    catalog_page: "RC-15", notes: "Rexnord ANSI 180" },

  // ── ANSI-200 enrichment ──
  { chain_id: "ANSI-200", code: "RS200-1",  manufacturer: "Tsubaki",      confidence: "Confirmed",    catalog_page: "A-18", notes: "Tsubaki RS200" },
  { chain_id: "ANSI-200", code: "200-1",    manufacturer: "Rexnord",      confidence: "Confirmed",    catalog_page: "RC-16", notes: "Rexnord ANSI 200" },
  { chain_id: "ANSI-200", code: "200-1",    manufacturer: "Daido",        confidence: "Confirmed",    catalog_page: "20",   notes: "Daido ANSI 200" },

  // ── ANSI-240 enrichment ──
  { chain_id: "ANSI-240", code: "RS240-1",  manufacturer: "Tsubaki",      confidence: "Confirmed",    catalog_page: "A-19", notes: "Tsubaki RS240 simplex" },
  { chain_id: "ANSI-240", code: "240-1",    manufacturer: "Rexnord",      confidence: "Confirmed",    catalog_page: "RC-18", notes: "Rexnord ANSI 240" },
];

// ─── PHASE 1 NEW CHAINS ────────────────────────────────────────────────────────

export const ANSI_FAMILY_NEW_CHAINS = [

  // ══════════════════════════════════════════════════════════════════
  // PHASE 1A — ANSI MULTI-STRAND (duplex, triplex, quadruplex)
  // One entry per size+strand combo. Transverse pitch per ANSI B29.1.
  // ══════════════════════════════════════════════════════════════════

  // ── #40 Multi-Strand ──
  {
    chain_id: "ANSI-40-2",
    chain_family: "performance_roller",
    chain_number: "40-2",
    display_name: "ANSI 40-2 Duplex Roller Chain",
    standard: "ANSI B29.1",
    pitch_in: "0.500", pitch_mm: "12.70",
    description: "ANSI 40 duplex (double strand) roller chain. Provides approximately 2× single-strand capacity in the same pitch. Transverse pitch 0.566\".",
    specs: {
      pitch_in: "0.500", pitch_mm: "12.70",
      strands: 2, transverse_pitch_in: "0.566", transverse_pitch_mm: "14.38",
      roller_dia_in: "0.312", roller_width_in: "0.312",
      avg_ultimate_lbs: "7400", max_working_load_lbs: "1620",
    },
    performance_tiers: [
      { tier: "standard", tensile_strength_lbs: "7400", working_load_lbs: "1620",
        source: "ANSI B29.1", notes: "2-strand: approx 1.9× single-strand tensile (joint efficiency)." },
    ],
    source_refs: [
      { manufacturer: "Allied-Locke", code: "40-2",    confidence: "Confirmed" },
      { manufacturer: "Tsubaki",      code: "RS40-2",  confidence: "Confirmed" },
      { manufacturer: "Donghua",      code: "40A-2",   confidence: "Confirmed", catalog_page: "17" },
      { manufacturer: "Iwis",         code: "40-2",    confidence: "Confirmed" },
      { manufacturer: "Peer",         code: "40-2",    confidence: "Confirmed" },
      { manufacturer: "Morse",        code: "40-2",    confidence: "Confirmed" },
      { manufacturer: "Rexnord",      code: "40-2",    confidence: "Confirmed" },
    ],
    attachments_available: ["A1", "A2", "K1", "K2"],
    sprocket_series: "ANSI-40",
    materials_available: ["carbon_steel", "stainless_304", "nickel_plated"],
    options_upgrades: ["Triple strand 40-3", "40H-2 heavy duplex"],
    image_strategy: "family",
    status: "Active",
  },
  {
    chain_id: "ANSI-40-3",
    chain_family: "performance_roller",
    chain_number: "40-3",
    display_name: "ANSI 40-3 Triplex Roller Chain",
    standard: "ANSI B29.1",
    pitch_in: "0.500", pitch_mm: "12.70",
    description: "ANSI 40 triplex (triple strand) roller chain. ~2.8× single-strand capacity. Used where space is limited but power demand is high.",
    specs: {
      pitch_in: "0.500", pitch_mm: "12.70",
      strands: 3, transverse_pitch_in: "0.566", transverse_pitch_mm: "14.38",
      avg_ultimate_lbs: "11100", max_working_load_lbs: "2430",
    },
    performance_tiers: [
      { tier: "standard", tensile_strength_lbs: "11100", working_load_lbs: "2430",
        source: "ANSI B29.1", notes: "3-strand: approx 2.8× single." },
    ],
    source_refs: [
      { manufacturer: "Allied-Locke", code: "40-3",    confidence: "Confirmed" },
      { manufacturer: "Tsubaki",      code: "RS40-3",  confidence: "Confirmed" },
      { manufacturer: "Donghua",      code: "40A-3",   confidence: "Confirmed", catalog_page: "17" },
      { manufacturer: "Iwis",         code: "40-3",    confidence: "Confirmed" },
    ],
    attachments_available: ["A1", "K1"],
    sprocket_series: "ANSI-40",
    materials_available: ["carbon_steel", "stainless_304"],
    options_upgrades: [],
    image_strategy: "family",
    status: "Active",
  },

  // ── #50 Multi-Strand ──
  {
    chain_id: "ANSI-50-2",
    chain_family: "performance_roller",
    chain_number: "50-2",
    display_name: "ANSI 50-2 Duplex Roller Chain",
    standard: "ANSI B29.1",
    pitch_in: "0.625", pitch_mm: "15.875",
    description: "ANSI 50 duplex roller chain. Transverse pitch 0.713\". ~2× capacity of simplex 50.",
    specs: {
      pitch_in: "0.625", pitch_mm: "15.875",
      strands: 2, transverse_pitch_in: "0.713", transverse_pitch_mm: "18.11",
      avg_ultimate_lbs: "12200", max_working_load_lbs: "2660",
    },
    performance_tiers: [
      { tier: "standard", tensile_strength_lbs: "12200", working_load_lbs: "2660", source: "ANSI B29.1" },
    ],
    source_refs: [
      { manufacturer: "Allied-Locke", code: "50-2",    confidence: "Confirmed" },
      { manufacturer: "Tsubaki",      code: "RS50-2",  confidence: "Confirmed" },
      { manufacturer: "Donghua",      code: "50A-2",   confidence: "Confirmed" },
      { manufacturer: "Peer",         code: "50-2",    confidence: "Confirmed" },
    ],
    attachments_available: ["A1", "A2", "K1", "K2"],
    sprocket_series: "ANSI-50",
    materials_available: ["carbon_steel", "stainless_304"],
    options_upgrades: ["Triple strand 50-3"],
    image_strategy: "family",
    status: "Active",
  },

  // ── #60 Multi-Strand ──
  {
    chain_id: "ANSI-60-2",
    chain_family: "performance_roller",
    chain_number: "60-2",
    display_name: "ANSI 60-2 Duplex Roller Chain",
    standard: "ANSI B29.1",
    pitch_in: "0.750", pitch_mm: "19.05",
    description: "ANSI 60 duplex roller chain. Transverse pitch 0.897\". For high-load drives where simplex is insufficient.",
    specs: {
      pitch_in: "0.750", pitch_mm: "19.05",
      strands: 2, transverse_pitch_in: "0.897", transverse_pitch_mm: "22.78",
      avg_ultimate_lbs: "17000", max_working_load_lbs: "3900",
    },
    performance_tiers: [
      { tier: "standard", tensile_strength_lbs: "17000", working_load_lbs: "3900", source: "ANSI B29.1" },
    ],
    source_refs: [
      { manufacturer: "Allied-Locke", code: "60-2",    confidence: "Confirmed" },
      { manufacturer: "Tsubaki",      code: "RS60-2",  confidence: "Confirmed" },
      { manufacturer: "Donghua",      code: "60A-2",   confidence: "Confirmed", catalog_page: "19" },
      { manufacturer: "Iwis",         code: "60-2",    confidence: "Confirmed" },
      { manufacturer: "Peer",         code: "60-2",    confidence: "Confirmed" },
      { manufacturer: "Rexnord",      code: "60-2",    confidence: "Confirmed" },
    ],
    attachments_available: ["A1", "A2", "K1", "K2"],
    sprocket_series: "ANSI-60",
    materials_available: ["carbon_steel", "stainless_304", "nickel_plated"],
    options_upgrades: ["Triple strand 60-3", "60H-2 heavy"],
    image_strategy: "family",
    status: "Active",
  },
  {
    chain_id: "ANSI-60-3",
    chain_family: "performance_roller",
    chain_number: "60-3",
    display_name: "ANSI 60-3 Triplex Roller Chain",
    standard: "ANSI B29.1",
    pitch_in: "0.750", pitch_mm: "19.05",
    description: "ANSI 60 triplex roller chain. ~2.8× simplex capacity. Common in agricultural drives, combine power-takeoff systems.",
    specs: {
      pitch_in: "0.750", pitch_mm: "19.05",
      strands: 3, transverse_pitch_in: "0.897",
      avg_ultimate_lbs: "25500", max_working_load_lbs: "5850",
    },
    performance_tiers: [
      { tier: "standard", tensile_strength_lbs: "25500", working_load_lbs: "5850", source: "ANSI B29.1" },
    ],
    source_refs: [
      { manufacturer: "Allied-Locke", code: "60-3",    confidence: "Confirmed" },
      { manufacturer: "Tsubaki",      code: "RS60-3",  confidence: "Confirmed" },
      { manufacturer: "Donghua",      code: "60A-3",   confidence: "Confirmed", catalog_page: "19" },
      { manufacturer: "Iwis",         code: "60-3",    confidence: "Confirmed" },
    ],
    attachments_available: ["A1", "K1"],
    sprocket_series: "ANSI-60",
    materials_available: ["carbon_steel", "stainless_304"],
    options_upgrades: [],
    image_strategy: "family",
    status: "Active",
  },

  // ── #80 Multi-Strand ──
  {
    chain_id: "ANSI-80-2",
    chain_family: "performance_roller",
    chain_number: "80-2",
    display_name: "ANSI 80-2 Duplex Roller Chain",
    standard: "ANSI B29.1",
    pitch_in: "1.000", pitch_mm: "25.40",
    description: "ANSI 80 duplex roller chain. Transverse pitch 1.138\". Industry workhorse in heavy multi-strand power transmission.",
    specs: {
      pitch_in: "1.000", pitch_mm: "25.40",
      strands: 2, transverse_pitch_in: "1.138", transverse_pitch_mm: "28.91",
      avg_ultimate_lbs: "29000", max_working_load_lbs: "7000",
    },
    performance_tiers: [
      { tier: "standard", tensile_strength_lbs: "29000", working_load_lbs: "7000", source: "ANSI B29.1" },
    ],
    source_refs: [
      { manufacturer: "Allied-Locke", code: "80-2",    confidence: "Confirmed" },
      { manufacturer: "Tsubaki",      code: "RS80-2",  confidence: "Confirmed" },
      { manufacturer: "Donghua",      code: "80A-2",   confidence: "Confirmed", catalog_page: "20" },
      { manufacturer: "Iwis",         code: "80-2",    confidence: "Confirmed" },
      { manufacturer: "Peer",         code: "80-2",    confidence: "Confirmed" },
      { manufacturer: "Rexnord",      code: "80-2",    confidence: "Confirmed" },
      { manufacturer: "Morse",        code: "80-2",    confidence: "Confirmed" },
    ],
    attachments_available: ["A1", "A2", "K1", "K2", "SA1"],
    sprocket_series: "ANSI-80",
    materials_available: ["carbon_steel", "stainless_304", "nickel_plated"],
    options_upgrades: ["Triple strand 80-3", "Quad strand 80-4", "80H-2 heavy"],
    image_strategy: "family",
    status: "Active",
  },
  {
    chain_id: "ANSI-80-3",
    chain_family: "performance_roller",
    chain_number: "80-3",
    display_name: "ANSI 80-3 Triplex Roller Chain",
    standard: "ANSI B29.1",
    pitch_in: "1.000", pitch_mm: "25.40",
    description: "ANSI 80 triplex roller chain. Very high load capacity for heavy industrial drives — paper mills, steel mills, mining equipment.",
    specs: {
      pitch_in: "1.000", pitch_mm: "25.40",
      strands: 3, transverse_pitch_in: "1.138",
      avg_ultimate_lbs: "43500", max_working_load_lbs: "10500",
    },
    performance_tiers: [
      { tier: "standard", tensile_strength_lbs: "43500", working_load_lbs: "10500", source: "ANSI B29.1" },
    ],
    source_refs: [
      { manufacturer: "Allied-Locke", code: "80-3",    confidence: "Confirmed" },
      { manufacturer: "Tsubaki",      code: "RS80-3",  confidence: "Confirmed" },
      { manufacturer: "Donghua",      code: "80A-3",   confidence: "Confirmed", catalog_page: "20" },
      { manufacturer: "Rexnord",      code: "80-3",    confidence: "Confirmed" },
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
    display_name: "ANSI 80-4 Quadruplex Roller Chain",
    standard: "ANSI B29.1",
    pitch_in: "1.000", pitch_mm: "25.40",
    description: "ANSI 80 quadruplex (4-strand) roller chain. Maximum multi-strand compact drive. Used in paper mill drives, crane hoists, and heavy transfer equipment.",
    specs: {
      pitch_in: "1.000", pitch_mm: "25.40",
      strands: 4, transverse_pitch_in: "1.138",
      avg_ultimate_lbs: "58000", max_working_load_lbs: "14000",
    },
    performance_tiers: [
      { tier: "standard", tensile_strength_lbs: "58000", working_load_lbs: "14000", source: "ANSI B29.1",
        notes: "4-strand: ~3.7× single-strand. Requires precision alignment." },
    ],
    source_refs: [
      { manufacturer: "Allied-Locke", code: "80-4",    confidence: "Confirmed" },
      { manufacturer: "Tsubaki",      code: "RS80-4",  confidence: "Confirmed" },
      { manufacturer: "Donghua",      code: "80A-4",   confidence: "Needs Review", notes: "4-strand availability to be confirmed" },
      { manufacturer: "Rexnord",      code: "80-4",    confidence: "Confirmed" },
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
    display_name: "ANSI 100-2 Duplex Roller Chain",
    standard: "ANSI B29.1",
    pitch_in: "1.250", pitch_mm: "31.75",
    description: "ANSI 100 duplex roller chain. Transverse pitch 1.500\". Heavy multi-strand for paper, steel, and high-power drives.",
    specs: {
      pitch_in: "1.250", pitch_mm: "31.75",
      strands: 2, transverse_pitch_in: "1.500", transverse_pitch_mm: "38.10",
      avg_ultimate_lbs: "48000", max_working_load_lbs: "11000",
    },
    performance_tiers: [
      { tier: "standard", tensile_strength_lbs: "48000", working_load_lbs: "11000", source: "ANSI B29.1" },
    ],
    source_refs: [
      { manufacturer: "Allied-Locke", code: "100-2",   confidence: "Confirmed" },
      { manufacturer: "Tsubaki",      code: "RS100-2", confidence: "Confirmed" },
      { manufacturer: "Donghua",      code: "100A-2",  confidence: "Confirmed", catalog_page: "21" },
      { manufacturer: "Rexnord",      code: "100-2",   confidence: "Confirmed" },
    ],
    attachments_available: ["A1", "A2", "K1", "K2"],
    sprocket_series: "ANSI-100",
    materials_available: ["carbon_steel"],
    options_upgrades: ["Triple strand 100-3"],
    image_strategy: "family",
    status: "Active",
  },
  {
    chain_id: "ANSI-100-3",
    chain_family: "performance_roller",
    chain_number: "100-3",
    display_name: "ANSI 100-3 Triplex Roller Chain",
    standard: "ANSI B29.1",
    pitch_in: "1.250", pitch_mm: "31.75",
    description: "ANSI 100 triplex roller chain for maximum 1-1/4\" pitch drive capacity.",
    specs: {
      pitch_in: "1.250", pitch_mm: "31.75",
      strands: 3, transverse_pitch_in: "1.500",
      avg_ultimate_lbs: "72000", max_working_load_lbs: "16500",
    },
    performance_tiers: [
      { tier: "standard", tensile_strength_lbs: "72000", working_load_lbs: "16500", source: "ANSI B29.1" },
    ],
    source_refs: [
      { manufacturer: "Allied-Locke", code: "100-3",   confidence: "Confirmed" },
      { manufacturer: "Tsubaki",      code: "RS100-3", confidence: "Confirmed" },
      { manufacturer: "Donghua",      code: "100A-3",  confidence: "Needs Review" },
    ],
    attachments_available: [],
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
    display_name: "ANSI 120-2 Duplex Roller Chain",
    standard: "ANSI B29.1",
    pitch_in: "1.500", pitch_mm: "38.10",
    description: "ANSI 120 duplex roller chain. High-load 1-1/2\" pitch double strand for demanding industrial machinery.",
    specs: {
      pitch_in: "1.500", pitch_mm: "38.10",
      strands: 2, transverse_pitch_in: "1.750", transverse_pitch_mm: "44.45",
      avg_ultimate_lbs: "68000", max_working_load_lbs: "16000",
    },
    performance_tiers: [
      { tier: "standard", tensile_strength_lbs: "68000", working_load_lbs: "16000", source: "ANSI B29.1" },
    ],
    source_refs: [
      { manufacturer: "Allied-Locke", code: "120-2",   confidence: "Confirmed" },
      { manufacturer: "Tsubaki",      code: "RS120-2", confidence: "Confirmed" },
      { manufacturer: "Donghua",      code: "120A-2",  confidence: "Confirmed", catalog_page: "21" },
      { manufacturer: "Rexnord",      code: "120-2",   confidence: "Confirmed" },
    ],
    attachments_available: ["A1", "K1"],
    sprocket_series: "ANSI-120",
    materials_available: ["carbon_steel"],
    options_upgrades: [],
    image_strategy: "family",
    status: "Active",
  },

  // ── #160 Multi-Strand ──
  {
    chain_id: "ANSI-160-2",
    chain_family: "performance_roller",
    chain_number: "160-2",
    display_name: "ANSI 160-2 Duplex Roller Chain",
    standard: "ANSI B29.1",
    pitch_in: "2.000", pitch_mm: "50.80",
    description: "ANSI 160 duplex roller chain for very high-load drives. 2\" pitch double strand.",
    specs: {
      pitch_in: "2.000", pitch_mm: "50.80",
      strands: 2, transverse_pitch_in: "2.250",
      avg_ultimate_lbs: "116000", max_working_load_lbs: "28000",
    },
    performance_tiers: [
      { tier: "standard", tensile_strength_lbs: "116000", working_load_lbs: "28000", source: "ANSI B29.1" },
    ],
    source_refs: [
      { manufacturer: "Allied-Locke", code: "160-2",   confidence: "Confirmed" },
      { manufacturer: "Tsubaki",      code: "RS160-2", confidence: "Confirmed" },
      { manufacturer: "Rexnord",      code: "160-2",   confidence: "Confirmed" },
    ],
    attachments_available: [],
    sprocket_series: "ANSI-160",
    materials_available: ["carbon_steel"],
    options_upgrades: [],
    image_strategy: "family",
    status: "Active",
  },

  // ══════════════════════════════════════════════════════════════════
  // PHASE 1B — SELF-LUBRICATING / LUBE-FREE CHAINS
  // Oil-impregnated sintered bushings — no external lube required
  // ══════════════════════════════════════════════════════════════════

  {
    chain_id: "ANSI-40-SL",
    chain_family: "performance_roller",
    chain_number: "40-SL",
    display_name: "ANSI 40 Self-Lubricating Roller Chain",
    standard: "ANSI B29.1",
    pitch_in: "0.500", pitch_mm: "12.70",
    description: "ANSI 40 chain with oil-impregnated sintered metal bushings. Lubricant is released under load and heat. Ideal for food-adjacent, clean-room, or hard-to-access applications. Extends re-lubrication intervals 3-5× vs standard.",
    specs: {
      pitch_in: "0.500", pitch_mm: "12.70",
      roller_dia_in: "0.312", roller_width_in: "0.312",
      avg_ultimate_lbs: "3700",
      lubrication: "Sintered oil-impregnated bushings",
    },
    performance_tiers: [
      { tier: "standard", tensile_strength_lbs: "3700", working_load_lbs: "740",
        source: "ANSI B29.1 / Tsubaki Lambda",
        notes: "Same tensile as standard 40. Lube intervals 3-5× longer. Operating temp max 120°C." },
    ],
    source_refs: [
      { manufacturer: "Tsubaki",      code: "40-SL",        confidence: "Confirmed",    notes: "Tsubaki Lambda Self-Lube Series" },
      { manufacturer: "Allied-Locke", code: "40SLB",        confidence: "Confirmed",    notes: "Allied-Locke SLB self-lube series" },
      { manufacturer: "Iwis",         code: "40-SL",        confidence: "Confirmed",    notes: "Iwis e.chain self-lube" },
      { manufacturer: "Donghua",      code: "40A-SL",       confidence: "Needs Review", notes: "Donghua self-lube — confirm availability" },
      { manufacturer: "Renold",       code: "08A-1SL",      confidence: "Confirmed",    notes: "Renold Syno self-lube series" },
    ],
    attachments_available: ["A1", "A2", "K1", "K2"],
    sprocket_series: "ANSI-40",
    materials_available: ["self_lube"],
    options_upgrades: ["Stainless self-lube", "Food-grade lubricant option"],
    image_strategy: "family",
    status: "Active",
  },

  {
    chain_id: "ANSI-50-SL",
    chain_family: "performance_roller",
    chain_number: "50-SL",
    display_name: "ANSI 50 Self-Lubricating Roller Chain",
    standard: "ANSI B29.1",
    pitch_in: "0.625", pitch_mm: "15.875",
    description: "ANSI 50 self-lubricating chain with oil-impregnated sintered bushings. Extended maintenance intervals for clean-room and hard-to-access applications.",
    specs: {
      pitch_in: "0.625", pitch_mm: "15.875",
      avg_ultimate_lbs: "6100",
      lubrication: "Sintered oil-impregnated bushings",
    },
    performance_tiers: [
      { tier: "standard", tensile_strength_lbs: "6100", working_load_lbs: "1330",
        source: "ANSI B29.1 / Tsubaki Lambda" },
    ],
    source_refs: [
      { manufacturer: "Tsubaki",      code: "50-SL",    confidence: "Confirmed",    notes: "Lambda self-lube" },
      { manufacturer: "Allied-Locke", code: "50SLB",    confidence: "Confirmed",    notes: "SLB series" },
      { manufacturer: "Iwis",         code: "50-SL",    confidence: "Confirmed" },
    ],
    attachments_available: ["A1", "A2", "K1", "K2"],
    sprocket_series: "ANSI-50",
    materials_available: ["self_lube"],
    options_upgrades: [],
    image_strategy: "family",
    status: "Active",
  },

  {
    chain_id: "ANSI-60-SL",
    chain_family: "performance_roller",
    chain_number: "60-SL",
    display_name: "ANSI 60 Self-Lubricating Roller Chain",
    standard: "ANSI B29.1",
    pitch_in: "0.750", pitch_mm: "19.05",
    description: "ANSI 60 self-lubricating chain. Oil-impregnated sintered bushings. Used in beverage, food processing, and pharmaceutical equipment where external lubrication is problematic.",
    specs: {
      pitch_in: "0.750", pitch_mm: "19.05",
      avg_ultimate_lbs: "8500",
      lubrication: "Sintered oil-impregnated bushings",
    },
    performance_tiers: [
      { tier: "standard", tensile_strength_lbs: "8500", working_load_lbs: "1950",
        source: "ANSI B29.1 / Tsubaki Lambda",
        notes: "Same tensile as standard 60. Operating temp limit 120°C continuous." },
    ],
    source_refs: [
      { manufacturer: "Tsubaki",      code: "60-SL",    confidence: "Confirmed",    notes: "Lambda series" },
      { manufacturer: "Allied-Locke", code: "60SLB",    confidence: "Confirmed",    notes: "SLB self-lube" },
      { manufacturer: "Iwis",         code: "60-SL",    confidence: "Confirmed",    notes: "e.chain" },
      { manufacturer: "Renold",       code: "12A-1SL",  confidence: "Confirmed",    notes: "Renold Syno" },
    ],
    attachments_available: ["A1", "A2", "K1", "K2"],
    sprocket_series: "ANSI-60",
    materials_available: ["self_lube"],
    options_upgrades: ["Food-grade SL variant", "Stainless SL"],
    image_strategy: "family",
    status: "Active",
  },

  {
    chain_id: "ANSI-80-SL",
    chain_family: "performance_roller",
    chain_number: "80-SL",
    display_name: "ANSI 80 Self-Lubricating Roller Chain",
    standard: "ANSI B29.1",
    pitch_in: "1.000", pitch_mm: "25.40",
    description: "ANSI 80 self-lubricating chain with oil-impregnated sintered bushings. Tsubaki Lambda #80 is the most widely specified lube-free 1\" chain in North America.",
    specs: {
      pitch_in: "1.000", pitch_mm: "25.40",
      avg_ultimate_lbs: "14500",
      lubrication: "Sintered oil-impregnated bushings",
    },
    performance_tiers: [
      { tier: "standard", tensile_strength_lbs: "14500", working_load_lbs: "3500",
        source: "ANSI B29.1 / Tsubaki Lambda",
        notes: "Lambda: rated 3-5× standard chain lube intervals. Most popular lube-free 1\" chain." },
    ],
    source_refs: [
      { manufacturer: "Tsubaki",      code: "80-SL",    confidence: "Confirmed",    notes: "Lambda #80 — most common lube-free ANSI 80" },
      { manufacturer: "Allied-Locke", code: "80SLB",    confidence: "Confirmed",    notes: "SLB series" },
      { manufacturer: "Iwis",         code: "80-SL",    confidence: "Confirmed",    notes: "e.chain" },
      { manufacturer: "Renold",       code: "16A-1SL",  confidence: "Confirmed",    notes: "Renold Syno" },
      { manufacturer: "Donghua",      code: "80A-SL",   confidence: "Needs Review" },
    ],
    attachments_available: ["A1", "A2", "K1", "K2"],
    sprocket_series: "ANSI-80",
    materials_available: ["self_lube"],
    options_upgrades: ["Double strand lube-free 80-2SL", "Food-grade SL"],
    image_strategy: "family",
    status: "Active",
  },

  {
    chain_id: "ANSI-100-SL",
    chain_family: "performance_roller",
    chain_number: "100-SL",
    display_name: "ANSI 100 Self-Lubricating Roller Chain",
    standard: "ANSI B29.1",
    pitch_in: "1.250", pitch_mm: "31.75",
    description: "ANSI 100 lube-free chain with oil-impregnated bushings. For 1-1/4\" pitch drives in difficult-to-access locations.",
    specs: { pitch_in: "1.250", pitch_mm: "31.75", avg_ultimate_lbs: "24000", lubrication: "Sintered oil-impregnated" },
    performance_tiers: [
      { tier: "standard", tensile_strength_lbs: "24000", working_load_lbs: "5500", source: "ANSI B29.1 / Tsubaki Lambda" },
    ],
    source_refs: [
      { manufacturer: "Tsubaki",      code: "100-SL",   confidence: "Confirmed" },
      { manufacturer: "Allied-Locke", code: "100SLB",   confidence: "Confirmed" },
      { manufacturer: "Iwis",         code: "100-SL",   confidence: "Confirmed" },
    ],
    attachments_available: ["A1", "K1"],
    sprocket_series: "ANSI-100",
    materials_available: ["self_lube"],
    options_upgrades: [],
    image_strategy: "family",
    status: "Active",
  },

  // ══════════════════════════════════════════════════════════════════
  // PHASE 1C — O-RING SEALED CHAINS
  // Rubber O-rings seal pre-packed grease in bushings.
  // For outdoor, wet, dusty, and harsh environments.
  // ══════════════════════════════════════════════════════════════════

  {
    chain_id: "ANSI-40-OR",
    chain_family: "performance_roller",
    chain_number: "40OR",
    display_name: "ANSI 40 O-Ring Roller Chain",
    standard: "ANSI B29.1",
    pitch_in: "0.500", pitch_mm: "12.70",
    description: "ANSI 40 O-ring sealed roller chain. Rubber O-rings retain pre-packed grease in pin-bushing interface. Superior performance in wet, dusty, and outdoor environments. 2-3× longer wear life vs standard. Common in ATV, motorcycle, and outdoor equipment.",
    specs: {
      pitch_in: "0.500", pitch_mm: "12.70",
      roller_dia_in: "0.312", roller_width_in: "0.312",
      avg_ultimate_lbs: "3700",
      seal_type: "O-Ring",
    },
    performance_tiers: [
      { tier: "performance", tensile_strength_lbs: "3700", working_load_lbs: "740",
        source: "Tsubaki / Allied-Locke",
        notes: "O-ring sealed: 2-3× wear life in contaminated environments. Slightly higher friction than standard." },
    ],
    source_refs: [
      { manufacturer: "Tsubaki",      code: "40-OR",    confidence: "Confirmed",    notes: "Tsubaki O-Ring series" },
      { manufacturer: "Allied-Locke", code: "40OR",     confidence: "Confirmed",    notes: "Allied-Locke OR series" },
      { manufacturer: "Peer",         code: "40OR",     confidence: "Confirmed",    notes: "Peer O-Ring" },
      { manufacturer: "Renold",       code: "08A-1OR",  confidence: "Confirmed",    notes: "Renold O-Ring" },
    ],
    attachments_available: [],
    sprocket_series: "ANSI-40",
    materials_available: ["carbon_steel"],
    options_upgrades: ["X-Ring upgrade (lower friction than O-ring)"],
    image_strategy: "family",
    status: "Active",
  },

  {
    chain_id: "ANSI-60-OR",
    chain_family: "performance_roller",
    chain_number: "60OR",
    display_name: "ANSI 60 O-Ring Roller Chain",
    standard: "ANSI B29.1",
    pitch_in: "0.750", pitch_mm: "19.05",
    description: "ANSI 60 O-ring chain. O-ring seals retain pre-packed grease. Used in outdoor agricultural, construction, and marine drive applications.",
    specs: { pitch_in: "0.750", pitch_mm: "19.05", avg_ultimate_lbs: "8500", seal_type: "O-Ring" },
    performance_tiers: [
      { tier: "performance", tensile_strength_lbs: "8500", working_load_lbs: "1950",
        source: "Tsubaki / Allied-Locke", notes: "O-ring sealed." },
    ],
    source_refs: [
      { manufacturer: "Tsubaki",      code: "60-OR",   confidence: "Confirmed" },
      { manufacturer: "Allied-Locke", code: "60OR",    confidence: "Confirmed" },
      { manufacturer: "Peer",         code: "60OR",    confidence: "Confirmed" },
    ],
    attachments_available: [],
    sprocket_series: "ANSI-60",
    materials_available: ["carbon_steel"],
    options_upgrades: ["X-Ring variant"],
    image_strategy: "family",
    status: "Active",
  },

  {
    chain_id: "ANSI-80-OR",
    chain_family: "performance_roller",
    chain_number: "80OR",
    display_name: "ANSI 80 O-Ring Roller Chain",
    standard: "ANSI B29.1",
    pitch_in: "1.000", pitch_mm: "25.40",
    description: "ANSI 80 O-ring sealed roller chain. Pre-packed grease, rubber O-ring seals. For harsh outdoor, construction, and logging equipment applications.",
    specs: { pitch_in: "1.000", pitch_mm: "25.40", avg_ultimate_lbs: "14500", seal_type: "O-Ring" },
    performance_tiers: [
      { tier: "performance", tensile_strength_lbs: "14500", working_load_lbs: "3500",
        source: "Tsubaki / Allied-Locke", notes: "O-ring sealed: extended wear life, reduced re-lubrication." },
    ],
    source_refs: [
      { manufacturer: "Tsubaki",      code: "80-OR",   confidence: "Confirmed" },
      { manufacturer: "Allied-Locke", code: "80OR",    confidence: "Confirmed" },
      { manufacturer: "Peer",         code: "80OR",    confidence: "Confirmed" },
    ],
    attachments_available: [],
    sprocket_series: "ANSI-80",
    materials_available: ["carbon_steel"],
    options_upgrades: ["X-Ring variant"],
    image_strategy: "family",
    status: "Active",
  },

  // ══════════════════════════════════════════════════════════════════
  // PHASE 1D — ROLLERLESS (BUSHED) CHAINS
  // No outer roller — runs directly on sprocket teeth.
  // Lower cost, used in slat conveyors and guided applications.
  // ══════════════════════════════════════════════════════════════════

  {
    chain_id: "ANSI-40-RL",
    chain_family: "performance_roller",
    chain_number: "40RL",
    display_name: "ANSI 40 Rollerless Chain",
    standard: "ANSI B29.1",
    pitch_in: "0.500", pitch_mm: "12.70",
    description: "ANSI 40 rollerless (bushed) chain — outer roller removed. Runs on bushing directly against sprocket teeth. Lighter weight, lower cost. Used in slat conveyors, guided conveyor tracks, and applications where rollers are not needed.",
    specs: {
      pitch_in: "0.500", pitch_mm: "12.70",
      roller_dia_in: "none",
      avg_ultimate_lbs: "3200",
      construction: "Bushed, no outer roller",
    },
    performance_tiers: [
      { tier: "standard", tensile_strength_lbs: "3200", working_load_lbs: "640",
        source: "Allied-Locke / Tsubaki",
        notes: "Rollerless — approx 10-15% lower tensile than rollered chain. Not suitable for high-speed sprocket engagement." },
    ],
    source_refs: [
      { manufacturer: "Allied-Locke", code: "40RL",    confidence: "Confirmed",    notes: "Allied-Locke rollerless series" },
      { manufacturer: "Tsubaki",      code: "40RL",    confidence: "Confirmed",    notes: "Tsubaki bushed/rollerless" },
      { manufacturer: "Donghua",      code: "40A-RL",  confidence: "Needs Review" },
    ],
    attachments_available: ["A1", "K1"],
    sprocket_series: "ANSI-40",
    materials_available: ["carbon_steel"],
    options_upgrades: ["Add rollers for sprocket applications"],
    image_strategy: "family",
    status: "Active",
  },

  {
    chain_id: "ANSI-60-RL",
    chain_family: "performance_roller",
    chain_number: "60RL",
    display_name: "ANSI 60 Rollerless Chain",
    standard: "ANSI B29.1",
    pitch_in: "0.750", pitch_mm: "19.05",
    description: "ANSI 60 rollerless (bushed) chain. No outer roller — bushing contacts sprocket/track directly. Slat conveyors, guided tracks.",
    specs: { pitch_in: "0.750", pitch_mm: "19.05", avg_ultimate_lbs: "7200", construction: "Bushed, no outer roller" },
    performance_tiers: [
      { tier: "standard", tensile_strength_lbs: "7200", working_load_lbs: "1440", source: "Allied-Locke / Tsubaki" },
    ],
    source_refs: [
      { manufacturer: "Allied-Locke", code: "60RL",    confidence: "Confirmed" },
      { manufacturer: "Tsubaki",      code: "60RL",    confidence: "Confirmed" },
    ],
    attachments_available: ["A1", "K1"],
    sprocket_series: "ANSI-60",
    materials_available: ["carbon_steel"],
    options_upgrades: [],
    image_strategy: "family",
    status: "Active",
  },

  {
    chain_id: "ANSI-80-RL",
    chain_family: "performance_roller",
    chain_number: "80RL",
    display_name: "ANSI 80 Rollerless Chain",
    standard: "ANSI B29.1",
    pitch_in: "1.000", pitch_mm: "25.40",
    description: "ANSI 80 rollerless (bushed) chain. Common in flight conveyor systems where rollers are not required.",
    specs: { pitch_in: "1.000", pitch_mm: "25.40", avg_ultimate_lbs: "12000", construction: "Bushed, no outer roller" },
    performance_tiers: [
      { tier: "standard", tensile_strength_lbs: "12000", working_load_lbs: "2400", source: "Allied-Locke / Tsubaki" },
    ],
    source_refs: [
      { manufacturer: "Allied-Locke", code: "80RL",    confidence: "Confirmed" },
      { manufacturer: "Tsubaki",      code: "80RL",    confidence: "Confirmed" },
    ],
    attachments_available: ["A1", "K1"],
    sprocket_series: "ANSI-80",
    materials_available: ["carbon_steel"],
    options_upgrades: [],
    image_strategy: "family",
    status: "Active",
  },

  // ══════════════════════════════════════════════════════════════════
  // PHASE 1E — SOLID ROLLER / SOLID BUSHING (SB/SR)
  // Solid non-hollow bushing for maximum wear resistance
  // ══════════════════════════════════════════════════════════════════

  {
    chain_id: "ANSI-40-SR",
    chain_family: "performance_roller",
    chain_number: "40SR",
    display_name: "ANSI 40 Solid Roller Chain",
    standard: "ANSI B29.1",
    pitch_in: "0.500", pitch_mm: "12.70",
    description: "ANSI 40 chain with solid (non-hollow) outer roller. Solid roller provides greater impact resistance and extended wear life in heavily loaded or shock-load applications.",
    specs: {
      pitch_in: "0.500", pitch_mm: "12.70",
      roller_construction: "Solid, non-hollow",
      avg_ultimate_lbs: "3700",
    },
    performance_tiers: [
      { tier: "performance", tensile_strength_lbs: "3700", working_load_lbs: "810",
        source: "Allied-Locke / Tsubaki",
        notes: "Solid roller: impact and shock load resistance significantly better than standard hollow-roller chain." },
    ],
    source_refs: [
      { manufacturer: "Allied-Locke", code: "40SR",    confidence: "Confirmed",    notes: "Allied-Locke Solid Roller series" },
      { manufacturer: "Tsubaki",      code: "40SR",    confidence: "Confirmed",    notes: "Tsubaki Solid Roller" },
      { manufacturer: "Peer",         code: "40SR",    confidence: "Confirmed" },
    ],
    attachments_available: ["A1", "A2", "K1", "K2"],
    sprocket_series: "ANSI-40",
    materials_available: ["carbon_steel"],
    options_upgrades: [],
    image_strategy: "family",
    status: "Active",
  },

  {
    chain_id: "ANSI-80-SR",
    chain_family: "performance_roller",
    chain_number: "80SR",
    display_name: "ANSI 80 Solid Roller Chain",
    standard: "ANSI B29.1",
    pitch_in: "1.000", pitch_mm: "25.40",
    description: "ANSI 80 chain with solid outer roller. Maximum impact and wear resistance for heavy shock-load industrial drives.",
    specs: { pitch_in: "1.000", pitch_mm: "25.40", roller_construction: "Solid, non-hollow", avg_ultimate_lbs: "14500" },
    performance_tiers: [
      { tier: "performance", tensile_strength_lbs: "14500", working_load_lbs: "3500",
        source: "Allied-Locke / Tsubaki", notes: "Solid roller — superior shock load resistance." },
    ],
    source_refs: [
      { manufacturer: "Allied-Locke", code: "80SR",    confidence: "Confirmed" },
      { manufacturer: "Tsubaki",      code: "80SR",    confidence: "Confirmed" },
    ],
    attachments_available: ["A1", "A2", "K1", "K2"],
    sprocket_series: "ANSI-80",
    materials_available: ["carbon_steel"],
    options_upgrades: [],
    image_strategy: "family",
    status: "Active",
  },

  // ══════════════════════════════════════════════════════════════════
  // PHASE 1F — EXTENDED-LIFE PREMIUM SERIES
  // Tsubaki Neptune, Tsubaki GT4 Winner, Iwis fatigue-plus,
  // Rexnord Rex-Plus — beyond standard shot-peening
  // ══════════════════════════════════════════════════════════════════

  {
    chain_id: "ANSI-40-NEPTUNE",
    chain_family: "performance_roller",
    chain_number: "40-Neptune",
    display_name: "ANSI 40 Neptune Corrosion-Resistant Chain",
    standard: "ANSI B29.1",
    pitch_in: "0.500", pitch_mm: "12.70",
    description: "Tsubaki Neptune series ANSI 40 chain. All surfaces coated with proprietary nickel + zinc compound. Salt spray resistance >500 hours. For marine, food, chemical, and outdoor applications requiring corrosion protection without full stainless cost.",
    specs: {
      pitch_in: "0.500", pitch_mm: "12.70",
      coating: "Tsubaki Neptune (Ni+Zn composite)",
      salt_spray_hrs: ">500",
      avg_ultimate_lbs: "3700",
    },
    performance_tiers: [
      { tier: "performance", tensile_strength_lbs: "3700", working_load_lbs: "740",
        source: "Tsubaki Neptune Series",
        notes: "Neptune: >500hr salt spray. RoHS compliant. Same tensile as standard. Lower cost than SS." },
    ],
    source_refs: [
      { manufacturer: "Tsubaki", code: "40-Neptune", confidence: "Confirmed",
        notes: "Tsubaki Neptune corrosion-resistant series. Proprietary Ni+Zn coating." },
    ],
    attachments_available: ["A1", "A2", "K1", "K2"],
    sprocket_series: "ANSI-40",
    materials_available: ["neptune_coated"],
    options_upgrades: ["Stainless upgrade", "Neptune in 80/100"],
    image_strategy: "family",
    status: "Active",
  },

  {
    chain_id: "ANSI-80-NEPTUNE",
    chain_family: "performance_roller",
    chain_number: "80-Neptune",
    display_name: "ANSI 80 Neptune Corrosion-Resistant Chain",
    standard: "ANSI B29.1",
    pitch_in: "1.000", pitch_mm: "25.40",
    description: "Tsubaki Neptune ANSI 80 — most popular Neptune size. Ni+Zn composite coating, >500hr salt spray, RoHS compliant. Used in food processing, marine, and outdoor industrial drives.",
    specs: {
      pitch_in: "1.000", pitch_mm: "25.40",
      coating: "Tsubaki Neptune (Ni+Zn composite)",
      salt_spray_hrs: ">500",
      avg_ultimate_lbs: "14500",
    },
    performance_tiers: [
      { tier: "performance", tensile_strength_lbs: "14500", working_load_lbs: "3500",
        source: "Tsubaki Neptune Series",
        notes: "Same dimensions as ANSI 80. No tensile sacrifice. Most popular Neptune SKU." },
    ],
    source_refs: [
      { manufacturer: "Tsubaki", code: "80-Neptune", confidence: "Confirmed",
        notes: "Tsubaki Neptune ANSI 80. See Tsubaki Americas catalog." },
    ],
    attachments_available: ["A1", "A2", "K1", "K2"],
    sprocket_series: "ANSI-80",
    materials_available: ["neptune_coated"],
    options_upgrades: ["Stainless upgrade"],
    image_strategy: "family",
    status: "Active",
  },

  {
    chain_id: "ANSI-60-GT4",
    chain_family: "performance_roller",
    chain_number: "60-GT4",
    display_name: "ANSI 60 GT4 Winner High-Performance Chain",
    standard: "ANSI B29.1",
    pitch_in: "0.750", pitch_mm: "19.05",
    description: "Tsubaki GT4 Winner Series ANSI 60 — highest performance standard-pitch roller chain from Tsubaki. Proprietary heat treatment, shot peening, ball drifting, and optimized plate geometry. Up to 10× wear life vs standard. Used in high-speed, high-cycle precision drives.",
    specs: {
      pitch_in: "0.750", pitch_mm: "19.05",
      construction: "GT4 Winner: shot peened + ball drifted + heat treated plates",
      avg_ultimate_lbs: "10500",
    },
    performance_tiers: [
      { tier: "premium", tensile_strength_lbs: "10500", working_load_lbs: "2400",
        source: "Tsubaki GT4 Winner Series",
        notes: "GT4 Winner: up to 10× wear life vs standard ANSI 60. Peak fatigue 25% higher than standard." },
    ],
    source_refs: [
      { manufacturer: "Tsubaki", code: "60GT4", confidence: "Confirmed",
        notes: "Tsubaki GT4 Winner. Premium precision roller chain series." },
    ],
    attachments_available: ["A1", "A2", "K1", "K2"],
    sprocket_series: "ANSI-60",
    materials_available: ["carbon_steel"],
    options_upgrades: [],
    image_strategy: "family",
    status: "Active",
  },

  {
    chain_id: "ANSI-80-GT4",
    chain_family: "performance_roller",
    chain_number: "80-GT4",
    display_name: "ANSI 80 GT4 Winner High-Performance Chain",
    standard: "ANSI B29.1",
    pitch_in: "1.000", pitch_mm: "25.40",
    description: "Tsubaki GT4 Winner ANSI 80 — premium performance chain with shot peened, ball drifted, heat treated construction. Up to 10× wear life. Highest-performance ANSI-interchangeable 1\" chain.",
    specs: {
      pitch_in: "1.000", pitch_mm: "25.40",
      construction: "GT4 Winner: SP + ball drift + heat treat",
      avg_ultimate_lbs: "20000",
    },
    performance_tiers: [
      { tier: "premium", tensile_strength_lbs: "20000", working_load_lbs: "4000",
        source: "Tsubaki GT4 Winner Series",
        notes: "Up to 10× wear life. Most premium ANSI-interchangeable 1\" chain on market." },
    ],
    source_refs: [
      { manufacturer: "Tsubaki", code: "80GT4", confidence: "Confirmed",
        notes: "GT4 Winner ANSI 80." },
    ],
    attachments_available: ["A1", "A2", "K1", "K2"],
    sprocket_series: "ANSI-80",
    materials_available: ["carbon_steel"],
    options_upgrades: [],
    image_strategy: "family",
    status: "Active",
  },

  // ══════════════════════════════════════════════════════════════════
  // PHASE 1G — FOOD-GRADE / NSF-COMPLIANT CHAINS
  // NSF H1 lubricant-impregnated, stainless or nickel, FDA-compliance
  // ══════════════════════════════════════════════════════════════════

  {
    chain_id: "ANSI-40-FG",
    chain_family: "performance_roller",
    chain_number: "40-FG",
    display_name: "ANSI 40 Food-Grade Roller Chain",
    standard: "ANSI B29.1",
    pitch_in: "0.500", pitch_mm: "12.70",
    description: "ANSI 40 food-grade roller chain. Bright stainless steel construction or nickel-plated with NSF H1 food-grade lubricant. Suitable for food processing zones. FDA/NSF compliant.",
    specs: {
      pitch_in: "0.500", pitch_mm: "12.70",
      lubrication: "NSF H1 food-grade lubricant",
      compliance: "FDA / NSF H1",
      avg_ultimate_lbs: "3500",
    },
    performance_tiers: [
      { tier: "standard", tensile_strength_lbs: "3500", working_load_lbs: "700",
        source: "Allied-Locke / Tsubaki",
        notes: "Food-grade: NSF H1 lubricant, stainless or nickel plated chain body. Slightly lower tensile for SS variant." },
    ],
    source_refs: [
      { manufacturer: "Allied-Locke", code: "40FG",     confidence: "Confirmed",    notes: "Food-grade series, SS or NP" },
      { manufacturer: "Tsubaki",      code: "40-FG",    confidence: "Confirmed",    notes: "Tsubaki food-grade lambda" },
      { manufacturer: "Iwis",         code: "40-FG",    confidence: "Confirmed",    notes: "Iwis food-grade inox" },
      { manufacturer: "Renold",       code: "08A-1FG",  confidence: "Confirmed",    notes: "Renold Syno food-grade" },
    ],
    attachments_available: ["A1", "A2", "K1", "K2"],
    sprocket_series: "ANSI-40",
    materials_available: ["stainless_304", "stainless_316", "nickel_plated", "food_grade"],
    options_upgrades: ["316 SS for CIP washdown", "Self-lube food-grade"],
    image_strategy: "family",
    status: "Active",
  },

  {
    chain_id: "ANSI-60-FG",
    chain_family: "performance_roller",
    chain_number: "60-FG",
    display_name: "ANSI 60 Food-Grade Roller Chain",
    standard: "ANSI B29.1",
    pitch_in: "0.750", pitch_mm: "19.05",
    description: "ANSI 60 food-grade chain with NSF H1 lubricant. Stainless or nickel construction for food processing zones. FDA/NSF compliant.",
    specs: { pitch_in: "0.750", pitch_mm: "19.05", lubrication: "NSF H1", compliance: "FDA / NSF H1", avg_ultimate_lbs: "8000" },
    performance_tiers: [
      { tier: "standard", tensile_strength_lbs: "8000", working_load_lbs: "1600",
        source: "Allied-Locke / Tsubaki", notes: "Food-grade NSF H1." },
    ],
    source_refs: [
      { manufacturer: "Allied-Locke", code: "60FG",    confidence: "Confirmed" },
      { manufacturer: "Tsubaki",      code: "60-FG",   confidence: "Confirmed" },
      { manufacturer: "Iwis",         code: "60-FG",   confidence: "Confirmed" },
    ],
    attachments_available: ["A1", "A2", "K1", "K2"],
    sprocket_series: "ANSI-60",
    materials_available: ["stainless_304", "stainless_316", "nickel_plated", "food_grade"],
    options_upgrades: ["316 SS for CIP washdown"],
    image_strategy: "family",
    status: "Active",
  },

  {
    chain_id: "ANSI-80-FG",
    chain_family: "performance_roller",
    chain_number: "80-FG",
    display_name: "ANSI 80 Food-Grade Roller Chain",
    standard: "ANSI B29.1",
    pitch_in: "1.000", pitch_mm: "25.40",
    description: "ANSI 80 food-grade chain — most common food-grade 1\" chain for conveyors in meat processing, dairy, and beverage plants. NSF H1 lubricated.",
    specs: { pitch_in: "1.000", pitch_mm: "25.40", lubrication: "NSF H1", compliance: "FDA / NSF H1", avg_ultimate_lbs: "14000" },
    performance_tiers: [
      { tier: "standard", tensile_strength_lbs: "14000", working_load_lbs: "3200",
        source: "Allied-Locke / Tsubaki", notes: "Food-grade 80. NSF H1." },
    ],
    source_refs: [
      { manufacturer: "Allied-Locke", code: "80FG",    confidence: "Confirmed" },
      { manufacturer: "Tsubaki",      code: "80-FG",   confidence: "Confirmed" },
      { manufacturer: "Iwis",         code: "80-FG",   confidence: "Confirmed" },
    ],
    attachments_available: ["A1", "A2", "K1", "K2"],
    sprocket_series: "ANSI-80",
    materials_available: ["stainless_304", "stainless_316", "food_grade"],
    options_upgrades: ["316 SS upgrade for CIP"],
    image_strategy: "family",
    status: "Active",
  },

  // ══════════════════════════════════════════════════════════════════
  // PHASE 1H — IWIS PREMIUM SERIES
  // Iwis top, fatigue-plus, inox stainless, iwis SLS (self-lube)
  // ══════════════════════════════════════════════════════════════════

  {
    chain_id: "ANSI-40-IWIS-TOP",
    chain_family: "performance_roller",
    chain_number: "40-iwis-top",
    display_name: "ANSI 40 iwis top Premium Roller Chain",
    standard: "ANSI B29.1",
    pitch_in: "0.500", pitch_mm: "12.70",
    description: "Iwis 'top' premium ANSI 40 chain. Shot-peened plates, precision-bored bushings, case-hardened pins. Superior fatigue life vs DIN/ANSI standard. Premium European-manufactured chain, common in precision machinery and packaging equipment.",
    specs: {
      pitch_in: "0.500", pitch_mm: "12.70",
      avg_ultimate_lbs: "4400",
      construction: "Iwis top: shot peened, precision bore, case-hardened pin",
    },
    performance_tiers: [
      { tier: "performance", tensile_strength_lbs: "4400", working_load_lbs: "880",
        source: "Iwis top Series",
        notes: "Iwis top: ~20% higher tensile vs standard, precision tolerances. DIN/ANSI interchangeable." },
    ],
    source_refs: [
      { manufacturer: "Iwis", code: "40-top",  confidence: "Confirmed",
        notes: "Iwis top premium series. Munich, Germany manufactured." },
    ],
    attachments_available: ["A1", "A2", "K1", "K2"],
    sprocket_series: "ANSI-40",
    materials_available: ["carbon_steel"],
    options_upgrades: ["Iwis fatigue-plus", "Iwis inox stainless"],
    image_strategy: "family",
    status: "Active",
  },

  {
    chain_id: "ANSI-80-IWIS-TOP",
    chain_family: "performance_roller",
    chain_number: "80-iwis-top",
    display_name: "ANSI 80 iwis top Premium Roller Chain",
    standard: "ANSI B29.1",
    pitch_in: "1.000", pitch_mm: "25.40",
    description: "Iwis 'top' premium ANSI 80 chain. Shot-peened, precision-bored, case-hardened. Superior fatigue and wear life. Most popular iwis premium size for 1\" industrial drives.",
    specs: {
      pitch_in: "1.000", pitch_mm: "25.40",
      avg_ultimate_lbs: "17000",
      construction: "Iwis top: shot peened + precision + case-hardened",
    },
    performance_tiers: [
      { tier: "performance", tensile_strength_lbs: "17000", working_load_lbs: "3800",
        source: "Iwis top Series",
        notes: "Iwis top ANSI 80: ~20% higher tensile. ANSI/DIN interchangeable." },
    ],
    source_refs: [
      { manufacturer: "Iwis", code: "80-top",  confidence: "Confirmed" },
    ],
    attachments_available: ["A1", "A2", "K1", "K2"],
    sprocket_series: "ANSI-80",
    materials_available: ["carbon_steel"],
    options_upgrades: ["Iwis fatigue-plus", "Self-lube version"],
    image_strategy: "family",
    status: "Active",
  },

  {
    chain_id: "ANSI-40-IWIS-INOX",
    chain_family: "performance_roller",
    chain_number: "40-inox",
    display_name: "ANSI 40 Iwis Inox Full Stainless Roller Chain",
    standard: "ANSI B29.1",
    pitch_in: "0.500", pitch_mm: "12.70",
    description: "Iwis 'inox' fully stainless ANSI 40 chain. All components 304SS or 316SS. Premium stainless for food, pharmaceutical, marine, and chemical applications. Better construction tolerance than generic SS chains.",
    specs: {
      pitch_in: "0.500", pitch_mm: "12.70",
      avg_ultimate_lbs: "3300",
      material: "Full 304SS / 316SS all components",
    },
    performance_tiers: [
      { tier: "standard", tensile_strength_lbs: "3300", working_load_lbs: "660",
        source: "Iwis inox Series",
        notes: "Inox: ~10% lower tensile than carbon steel. 316SS upgrade available for chloride environments." },
    ],
    source_refs: [
      { manufacturer: "Iwis", code: "40-inox",  confidence: "Confirmed",
        notes: "Iwis inox ANSI 40. Available 304SS or 316SS." },
    ],
    attachments_available: ["A1", "A2", "K1", "K2"],
    sprocket_series: "ANSI-40",
    materials_available: ["stainless_304", "stainless_316"],
    options_upgrades: ["316SS upgrade"],
    image_strategy: "family",
    status: "Active",
  },

  {
    chain_id: "ANSI-80-IWIS-INOX",
    chain_family: "performance_roller",
    chain_number: "80-inox",
    display_name: "ANSI 80 Iwis Inox Full Stainless Roller Chain",
    standard: "ANSI B29.1",
    pitch_in: "1.000", pitch_mm: "25.40",
    description: "Iwis 'inox' fully stainless ANSI 80 chain — most popular size. 304SS or 316SS all components. Used in food processing, dairy, beverage, pharmaceutical, and marine drives.",
    specs: {
      pitch_in: "1.000", pitch_mm: "25.40",
      avg_ultimate_lbs: "13000",
      material: "Full 304SS / 316SS",
    },
    performance_tiers: [
      { tier: "standard", tensile_strength_lbs: "13000", working_load_lbs: "2600",
        source: "Iwis inox Series",
        notes: "Inox 80: most common iwis stainless 1\" size." },
    ],
    source_refs: [
      { manufacturer: "Iwis", code: "80-inox",  confidence: "Confirmed" },
    ],
    attachments_available: ["A1", "A2", "K1", "K2"],
    sprocket_series: "ANSI-80",
    materials_available: ["stainless_304", "stainless_316"],
    options_upgrades: ["316SS upgrade for washdown"],
    image_strategy: "family",
    status: "Active",
  },

  // ══════════════════════════════════════════════════════════════════
  // PHASE 1I — REXNORD REX ANSI SPECIALTY
  // Rexnord Rex-Plus high-strength, Rexnord extended-pin, Rex heavy
  // ══════════════════════════════════════════════════════════════════

  {
    chain_id: "ANSI-40-REX-PLUS",
    chain_family: "performance_roller",
    chain_number: "40-Rex-Plus",
    display_name: "ANSI 40 Rex-Plus High-Strength Chain",
    standard: "ANSI B29.1",
    pitch_in: "0.500", pitch_mm: "12.70",
    description: "Rexnord Rex-Plus ANSI 40 — premium shot-peened, carburized, and isotropic superfinished chain. Up to 30% higher fatigue strength than standard. ANSI-interchangeable. Used in precision packaging and high-speed drives.",
    specs: {
      pitch_in: "0.500", pitch_mm: "12.70",
      avg_ultimate_lbs: "4800",
      construction: "Rex-Plus: shot peened + carburized + superfinished",
    },
    performance_tiers: [
      { tier: "performance", tensile_strength_lbs: "4800", working_load_lbs: "960",
        source: "Rexnord Rex-Plus",
        notes: "Rex-Plus: 30% higher fatigue. Isotropic superfinished rollers reduce friction and noise." },
    ],
    source_refs: [
      { manufacturer: "Rexnord", code: "40-RP",  confidence: "Confirmed",
        notes: "Rexnord Rex-Plus series. ANSI interchangeable." },
    ],
    attachments_available: ["A1", "A2", "K1", "K2"],
    sprocket_series: "ANSI-40",
    materials_available: ["carbon_steel"],
    options_upgrades: ["Stainless Rex-Plus"],
    image_strategy: "family",
    status: "Active",
  },

  {
    chain_id: "ANSI-80-REX-PLUS",
    chain_family: "performance_roller",
    chain_number: "80-Rex-Plus",
    display_name: "ANSI 80 Rex-Plus High-Strength Chain",
    standard: "ANSI B29.1",
    pitch_in: "1.000", pitch_mm: "25.40",
    description: "Rexnord Rex-Plus ANSI 80 — carburized, shot peened, superfinished. 30% higher fatigue than standard ANSI 80. Most popular Rexnord premium 1\" roller chain.",
    specs: {
      pitch_in: "1.000", pitch_mm: "25.40",
      avg_ultimate_lbs: "18800",
      construction: "Rex-Plus: carburized + shot peened + superfinished",
    },
    performance_tiers: [
      { tier: "performance", tensile_strength_lbs: "18800", working_load_lbs: "4200",
        source: "Rexnord Rex-Plus",
        notes: "Rex-Plus ANSI 80: 30% fatigue improvement. Superfinished for low noise and long life." },
    ],
    source_refs: [
      { manufacturer: "Rexnord", code: "80-RP",  confidence: "Confirmed" },
    ],
    attachments_available: ["A1", "A2", "K1", "K2"],
    sprocket_series: "ANSI-80",
    materials_available: ["carbon_steel"],
    options_upgrades: [],
    image_strategy: "family",
    status: "Active",
  },

  // ══════════════════════════════════════════════════════════════════
  // PHASE 1J — ARMOR COAT / CORROSION-BARRIER VARIANTS
  // Allied-Locke ArmorCoat — black zinc phosphate + coating
  // Different from nickel/dacromet — unique external barrier coating
  // ══════════════════════════════════════════════════════════════════

  {
    chain_id: "ANSI-40-AC",
    chain_family: "performance_roller",
    chain_number: "40AC",
    display_name: "ANSI 40 Armor Coat Roller Chain",
    standard: "ANSI B29.1",
    pitch_in: "0.500", pitch_mm: "12.70",
    description: "Allied-Locke Armor Coat ANSI 40 — proprietary black zinc phosphate + polymer barrier coating. Excellent corrosion resistance for outdoor, agricultural, and light marine applications at lower cost than stainless. RoHS compliant.",
    specs: {
      pitch_in: "0.500", pitch_mm: "12.70",
      coating: "Armor Coat (zinc phosphate + polymer)",
      salt_spray_hrs: ">200",
      avg_ultimate_lbs: "3700",
    },
    performance_tiers: [
      { tier: "performance", tensile_strength_lbs: "3700", working_load_lbs: "810",
        source: "Allied-Locke Armor Coat",
        notes: "ArmorCoat: >200hr salt spray. No tensile penalty. Cost-effective corrosion protection vs SS." },
    ],
    source_refs: [
      { manufacturer: "Allied-Locke", code: "40AC",  confidence: "Confirmed",
        notes: "Allied-Locke ArmorCoat series." },
    ],
    attachments_available: ["A1", "A2", "K1", "K2"],
    sprocket_series: "ANSI-40",
    materials_available: ["armor_coat"],
    options_upgrades: ["Full stainless upgrade", "Dacromet upgrade"],
    image_strategy: "family",
    status: "Active",
  },

  {
    chain_id: "ANSI-60-AC",
    chain_family: "performance_roller",
    chain_number: "60AC",
    display_name: "ANSI 60 Armor Coat Roller Chain",
    standard: "ANSI B29.1",
    pitch_in: "0.750", pitch_mm: "19.05",
    description: "Allied-Locke Armor Coat ANSI 60 chain. Black zinc phosphate + polymer barrier for outdoor and agricultural use.",
    specs: { pitch_in: "0.750", pitch_mm: "19.05", coating: "Armor Coat", avg_ultimate_lbs: "8500" },
    performance_tiers: [
      { tier: "performance", tensile_strength_lbs: "8500", working_load_lbs: "1950",
        source: "Allied-Locke Armor Coat" },
    ],
    source_refs: [
      { manufacturer: "Allied-Locke", code: "60AC",  confidence: "Confirmed" },
    ],
    attachments_available: ["A1", "A2", "K1", "K2"],
    sprocket_series: "ANSI-60",
    materials_available: ["armor_coat"],
    options_upgrades: [],
    image_strategy: "family",
    status: "Active",
  },

  {
    chain_id: "ANSI-80-AC",
    chain_family: "performance_roller",
    chain_number: "80AC",
    display_name: "ANSI 80 Armor Coat Roller Chain",
    standard: "ANSI B29.1",
    pitch_in: "1.000", pitch_mm: "25.40",
    description: "Allied-Locke Armor Coat ANSI 80 chain. Most popular Armor Coat size. Black zinc phosphate + polymer barrier. For outdoor equipment, agricultural drives, and light marine.",
    specs: { pitch_in: "1.000", pitch_mm: "25.40", coating: "Armor Coat", avg_ultimate_lbs: "14500" },
    performance_tiers: [
      { tier: "performance", tensile_strength_lbs: "14500", working_load_lbs: "3500",
        source: "Allied-Locke Armor Coat" },
    ],
    source_refs: [
      { manufacturer: "Allied-Locke", code: "80AC",  confidence: "Confirmed" },
    ],
    attachments_available: ["A1", "A2", "K1", "K2"],
    sprocket_series: "ANSI-80",
    materials_available: ["armor_coat"],
    options_upgrades: ["Dacromet upgrade", "SS upgrade"],
    image_strategy: "family",
    status: "Active",
  },

  // ══════════════════════════════════════════════════════════════════
  // PHASE 1K — ANSI SPROCKET COMPATIBILITY MASTER RECORD
  // Family-level sprocket reference — enriches the normalized index
  // ══════════════════════════════════════════════════════════════════

  {
    chain_id: "ANSI-SPKT-FAMILY-REF",
    chain_family: "specialty_custom",
    chain_number: "SPKT-ANSI-FAMILY",
    display_name: "ANSI Roller Chain Family — Sprocket Compatibility Reference",
    standard: "ANSI B29.1",
    pitch_in: "varies", pitch_mm: "varies",
    description: "Master sprocket compatibility reference for ANSI B29.1 roller chain family (#25 through #240). Documents tooth counts, bore styles, materials, and split sprocket availability across all major ANSI chain sizes and manufacturers. Use for RFQ and procurement guidance.",
    specs: { type: "Sprocket compatibility family reference" },
    performance_tiers: [],
    sprocket_compatibility: {
      ansi_sizes: {
        "25":  { tooth_range: "9–96",  standard_bores: ["plain", "keyway"],           split: false, notes: "Small sprocket — typically stocked teeth 12–30" },
        "35":  { tooth_range: "9–96",  standard_bores: ["plain", "keyway", "QD"],     split: false },
        "40":  { tooth_range: "9–120", standard_bores: ["plain", "keyway", "QD", "taper_lock"], split: true,  notes: "Most widely stocked sprocket family" },
        "41":  { tooth_range: "9–60",  standard_bores: ["plain", "keyway"],           split: false, notes: "Narrow 40 pitch — verify sprocket catalog" },
        "50":  { tooth_range: "9–96",  standard_bores: ["plain", "keyway", "QD"],     split: true },
        "60":  { tooth_range: "9–120", standard_bores: ["plain", "keyway", "QD", "taper_lock"], split: true },
        "80":  { tooth_range: "9–120", standard_bores: ["plain", "keyway", "QD", "taper_lock"], split: true,  notes: "Most complete sprocket catalog — all styles stocked" },
        "100": { tooth_range: "9–80",  standard_bores: ["plain", "keyway", "QD", "taper_lock"], split: true },
        "120": { tooth_range: "9–60",  standard_bores: ["plain", "keyway", "QD", "taper_lock"], split: true },
        "140": { tooth_range: "9–50",  standard_bores: ["plain", "keyway", "QD"],     split: true },
        "160": { tooth_range: "9–40",  standard_bores: ["plain", "keyway", "QD"],     split: true },
        "180": { tooth_range: "7–30",  standard_bores: ["plain", "keyway"],           split: false },
        "200": { tooth_range: "7–25",  standard_bores: ["plain", "keyway"],           split: false },
        "240": { tooth_range: "7–20",  standard_bores: ["plain", "keyway"],           split: false },
      },
      materials: {
        "cast_iron":      { grades: "ASTM A48 Cl30",      description: "Standard service, most economical" },
        "carbon_steel":   { grades: "AISI 1045",          description: "Higher strength, shock load" },
        "hardened_steel": { grades: "AISI 4140 ind.hard", description: "Extended tooth life in abrasive environments" },
        "stainless_303":  { grades: "303 SS",             description: "Corrosion — non-washdown" },
        "stainless_316":  { grades: "316 SS",             description: "Corrosion — full CIP washdown" },
        "nylon_mc":       { grades: "MC Nylon 901",       description: "Low noise, light duty, no lube" },
        "split":          { notes: "Available #40–#120 cast iron or steel. Field installation without shaft removal." },
      },
      manufacturers_confirmed: ["Martin", "Browning", "Rexnord", "Tsubaki", "Morse", "Daido", "Allied-Locke"],
    },
    source_refs: [
      { manufacturer: "Martin",        code: "ANSI-SPKT",       confidence: "Confirmed",    notes: "Martin Sprocket — most complete ANSI catalog" },
      { manufacturer: "Browning",       code: "ANSI-SPKT",       confidence: "Confirmed",    notes: "Browning/Regal — full ANSI sprocket line" },
      { manufacturer: "Rexnord",        code: "ANSI-SPKT",       confidence: "Confirmed",    notes: "Rexnord Rex sprockets" },
      { manufacturer: "Tsubaki",        code: "ANSI-SPKT",       confidence: "Confirmed",    notes: "Tsubaki ANSI sprockets" },
      { manufacturer: "Morse",          code: "ANSI-SPKT",       confidence: "Confirmed",    notes: "Morse/Emerson sprockets" },
      { manufacturer: "Allied-Locke",   code: "ANSI-SPKT",       confidence: "Confirmed",    notes: "Allied-Locke sprocket companion line" },
    ],
    attachments_available: [],
    sprocket_series: "ANSI-ALL",
    materials_available: ["cast_iron", "carbon_steel", "hardened_steel", "stainless_303", "stainless_316", "nylon_mc"],
    options_upgrades: ["Split sprocket", "Taper lock mount", "QD bushing mount", "Hardened tooth tips"],
    image_strategy: "family",
    status: "Active",
  },

];

export default {
  ANSI_FAMILY_MERGE_REFS,
  ANSI_FAMILY_NEW_CHAINS,
};