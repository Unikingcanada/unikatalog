/**
 * donghuaNormalizedChains.js
 *
 * PHASE 1 & 2 — Donghua Chain Catalog Ingestion
 * Source: http://en.dhchain.com/wp-content/uploads/2020/11/2020111706240075.pdf
 * Import Date: 2026-05-06
 *
 * COVERS:
 * Phase 1 — ANSI Roller Chains (A-series: standard, heavy, cottered, SP, SH, X3)
 * Phase 2 — BS/ISO Roller Chains (B-series)
 * Phase 3 — Side Bow, Hollow Pin additions
 * Phase 4 — Double Pitch Conveyor Chains
 * Phase 5 — Stainless Steel Chains
 * Phase 6 — Agricultural Chains (CA, S series)
 * Phase 7 — Specialty / Engineering Chains (sugar mill, palm oil, escalator, lumber)
 * Phase 8 — Leaf Chains
 *
 * NORMALIZATION:
 * - Standard ANSI/BS chains → merged as source_refs on existing normalized entries
 *   (handled via DH_MERGE_REFS below — not as new chain objects)
 * - Donghua-SPECIFIC series (SP, SH, X3, specialty) → new normalized entries
 * - All Donghua data flagged with source_id "donghua_official"
 *
 * ARCHITECTURE:
 * - DH_MERGE_REFS: array of { chain_id, ref } — add Donghua as source to existing chains
 * - DH_NEW_CHAINS: array of new normalized chain objects for Donghua-specific entries
 */

const DH_CATALOG_URL = "http://en.dhchain.com/wp-content/uploads/2020/11/2020111706240075.pdf";
const DH_IMAGE_BASE = "http://en.dhchain.com/";

// ─── MERGE REFS — Donghua source entries for existing normalized chains ────────
// These add Donghua as a confirmed source on already-normalized chains.
// Consumed by chainNormalizedIndex to patch source_refs arrays.

export const DH_MERGE_REFS = [
  // ── ANSI Performance Roller Chains ──
  { chain_id: "ANSI-25",    code: "25A-1",   confidence: "Confirmed", catalog_page: "16", notes: "ANSI B29.1 compliant" },
  { chain_id: "ANSI-35",    code: "35A-1",   confidence: "Confirmed", catalog_page: "16", notes: "ANSI B29.1 compliant" },
  { chain_id: "ANSI-40",    code: "40A-1",   confidence: "Confirmed", catalog_page: "17", notes: "ANSI B29.1 compliant" },
  { chain_id: "ANSI-40H",   code: "40AH-1",  confidence: "Confirmed", catalog_page: "23", notes: "Heavy series" },
  { chain_id: "ANSI-41",    code: "41A-1",   confidence: "Confirmed", catalog_page: "17", notes: "Narrow series, ANSI B29.1" },
  { chain_id: "ANSI-50",    code: "50A-1",   confidence: "Confirmed", catalog_page: "18", notes: "ANSI B29.1 compliant" },
  { chain_id: "ANSI-50H",   code: "50AH-1",  confidence: "Confirmed", catalog_page: "23", notes: "Heavy series" },
  { chain_id: "ANSI-60",    code: "60A-1",   confidence: "Confirmed", catalog_page: "19", notes: "ANSI B29.1 compliant" },
  { chain_id: "ANSI-60H",   code: "60AH-1",  confidence: "Confirmed", catalog_page: "23", notes: "Heavy series" },
  { chain_id: "ANSI-80",    code: "80A-1",   confidence: "Confirmed", catalog_page: "20", notes: "ANSI B29.1 compliant" },
  { chain_id: "ANSI-80H",   code: "80AH-1",  confidence: "Confirmed", catalog_page: "23", notes: "Heavy series" },
  { chain_id: "ANSI-100",   code: "100A-1",  confidence: "Confirmed", catalog_page: "21", notes: "ANSI B29.1 compliant" },
  { chain_id: "ANSI-100H",  code: "100AH-1", confidence: "Confirmed", catalog_page: "23", notes: "Heavy series" },
  { chain_id: "ANSI-120",   code: "120A-1",  confidence: "Confirmed", catalog_page: "21", notes: "ANSI B29.1 compliant" },
  { chain_id: "ANSI-120H",  code: "120AH-1", confidence: "Confirmed", catalog_page: "23", notes: "Heavy series" },
  { chain_id: "ANSI-140",   code: "140A-1",  confidence: "Confirmed", catalog_page: "22", notes: "ANSI B29.1 compliant" },
  { chain_id: "ANSI-160",   code: "160A-1",  confidence: "Confirmed", catalog_page: "22", notes: "ANSI B29.1 compliant" },
  { chain_id: "ANSI-180",   code: "180A-1",  confidence: "Confirmed", catalog_page: "22", notes: "ANSI B29.1 compliant" },
  { chain_id: "ANSI-200",   code: "200A-1",  confidence: "Confirmed", catalog_page: "22", notes: "ANSI B29.1 compliant" },
  { chain_id: "ANSI-240",   code: "240A-1",  confidence: "Confirmed", catalog_page: "22", notes: "ANSI B29.1 compliant" },
  // ── BS/ISO B-series ──
  { chain_id: "BS-06B",     code: "06B-1",   confidence: "Confirmed", catalog_page: "30", notes: "ISO 606 / BS 228 compliant" },
  { chain_id: "BS-08B",     code: "08B-1",   confidence: "Confirmed", catalog_page: "31", notes: "ISO 606 / BS 228 compliant" },
  { chain_id: "BS-10B",     code: "10B-1",   confidence: "Confirmed", catalog_page: "31", notes: "ISO 606 / BS 228 compliant" },
  { chain_id: "BS-12A",     code: "12A-1",   confidence: "Confirmed", catalog_page: "31", notes: "ISO 606 ANSI series" },
  { chain_id: "BS-16A",     code: "16A-1",   confidence: "Confirmed", catalog_page: "32", notes: "ISO 606 ANSI series" },
  { chain_id: "BS-20A",     code: "20A-1",   confidence: "Confirmed", catalog_page: "32", notes: "ISO 606 ANSI series" },
  // ── Hollow Pin ──
  { chain_id: "HP-40",      code: "40HP",    confidence: "Confirmed", catalog_page: "65", notes: "Hollow pin series" },
  { chain_id: "HP-50",      code: "50HP",    confidence: "Confirmed", catalog_page: "65", notes: "Hollow pin series" },
  { chain_id: "HP-60",      code: "60HP",    confidence: "Confirmed", catalog_page: "66", notes: "Hollow pin series" },
  { chain_id: "HP-80",      code: "80HP",    confidence: "Confirmed", catalog_page: "66", notes: "Hollow pin series" },
  // ── Double Pitch ──
  { chain_id: "C2040",      code: "C2040",   confidence: "Confirmed", catalog_page: "90", notes: "Double pitch conveyor" },
  { chain_id: "C2050",      code: "C2050",   confidence: "Confirmed", catalog_page: "90", notes: "Double pitch conveyor" },
  { chain_id: "C2060",      code: "C2060",   confidence: "Confirmed", catalog_page: "91", notes: "Double pitch conveyor" },
  { chain_id: "C2060H",     code: "C2060H",  confidence: "Confirmed", catalog_page: "91", notes: "Double pitch heavy" },
  { chain_id: "C2080",      code: "C2080",   confidence: "Confirmed", catalog_page: "92", notes: "Double pitch conveyor" },
  { chain_id: "C2080H",     code: "C2080H",  confidence: "Confirmed", catalog_page: "92", notes: "Double pitch heavy" },
  { chain_id: "C2100",      code: "C2100",   confidence: "Confirmed", catalog_page: "93", notes: "Double pitch conveyor" },
  // ── Agricultural ──
  { chain_id: "CA550",      code: "CA550",   confidence: "Confirmed", catalog_page: "170", notes: "ASME B29.200 agricultural" },
  { chain_id: "CA557",      code: "CA557",   confidence: "Confirmed", catalog_page: "171", notes: "ASME B29.200 agricultural" },
  { chain_id: "CA620",      code: "CA620",   confidence: "Confirmed", catalog_page: "171", notes: "ASME B29.200 agricultural" },
  { chain_id: "S55",        code: "S55",     confidence: "Confirmed", catalog_page: "175", notes: "Steel detachable" },
  { chain_id: "S62",        code: "S62",     confidence: "Confirmed", catalog_page: "175", notes: "Steel detachable" },
  // ── Leaf Chains ──
  { chain_id: "AL1022",     code: "LH1022",  confidence: "Confirmed", catalog_page: "222", notes: "Leaf chain, Donghua LH designation" },
  { chain_id: "AL1044",     code: "LH1044",  confidence: "Confirmed", catalog_page: "224", notes: "Leaf chain, Donghua LH designation" },
  { chain_id: "BL1022",     code: "BL1022",  confidence: "Confirmed", catalog_page: "226", notes: "BL series leaf chain" },
  { chain_id: "BL1044",     code: "BL1044",  confidence: "Confirmed", catalog_page: "228", notes: "BL series leaf chain" },
  { chain_id: "AL0844",     code: "LH0844",  confidence: "Confirmed", catalog_page: "222", notes: "Leaf chain 1/2\" pitch" },
];

// ─── NEW NORMALIZED CHAINS — Donghua-specific series ─────────────────────────
// These are chains NOT already in the normalized dictionary/expansions.
// Full normalized objects per architecture rules.

export const DH_NEW_CHAINS = [

  // ══════════════════════════════════════════════════════════════════
  // BS/ISO B-SERIES — additional sizes not yet in expansion
  // ══════════════════════════════════════════════════════════════════

  {
    chain_id: "BS-04B",
    chain_family: "performance_roller",
    chain_number: "04B",
    display_name: "04B British Standard Roller Chain",
    standard: "ISO 606 / BS 228",
    pitch_in: "0.250",
    pitch_mm: "6.00",
    description: "6mm pitch British Standard roller chain. Light duty. ISO 606 compliant.",
    specs: {
      pitch_mm: "6.00", pitch_in: "0.250",
      roller_dia_mm: "4.00", inner_width_mm: "2.80",
      pin_dia_mm: "1.85", plate_height_mm: "5.70",
    },
    performance_tiers: [
      { tier: "standard", tensile_strength_lbs: "990", working_load_lbs: "198", source: "Donghua catalog p.30, ISO 606" },
    ],
    source_refs: [
      { manufacturer: "Donghua", code: "04B-1", confidence: "Confirmed", catalog_page: "30",
        catalog_url: DH_CATALOG_URL, notes: "ISO 606 / BS 228 compliant" },
      { manufacturer: "Iwis", code: "04B-1", confidence: "Confirmed" },
    ],
    attachments_available: [],
    sprocket_series: "BS-04B",
    materials_available: ["carbon_steel", "stainless_304"],
    options_upgrades: [],
    image_strategy: "family",
    status: "Active",
  },

  {
    chain_id: "BS-05B",
    chain_family: "performance_roller",
    chain_number: "05B",
    display_name: "05B British Standard Roller Chain",
    standard: "ISO 606 / BS 228",
    pitch_in: "0.315",
    pitch_mm: "8.00",
    description: "8mm pitch British Standard roller chain. ISO 606 compliant.",
    specs: {
      pitch_mm: "8.00", pitch_in: "0.315",
      roller_dia_mm: "5.00", inner_width_mm: "3.00",
      pin_dia_mm: "2.31", plate_height_mm: "7.10",
    },
    performance_tiers: [
      { tier: "standard", tensile_strength_lbs: "1540", working_load_lbs: "308", source: "Donghua catalog p.30, ISO 606" },
    ],
    source_refs: [
      { manufacturer: "Donghua", code: "05B-1", confidence: "Confirmed", catalog_page: "30",
        catalog_url: DH_CATALOG_URL },
    ],
    attachments_available: [],
    sprocket_series: "BS-05B",
    materials_available: ["carbon_steel"],
    options_upgrades: [],
    image_strategy: "family",
    status: "Active",
  },

  {
    chain_id: "BS-12B",
    chain_family: "performance_roller",
    chain_number: "12B",
    display_name: "12B British Standard Roller Chain",
    standard: "ISO 606 / BS 228",
    pitch_in: "0.750",
    pitch_mm: "19.05",
    description: "3/4\" pitch British Standard roller chain. BS/ISO equivalent to ANSI 60 in pitch but with different geometry.",
    specs: {
      pitch_mm: "19.05", pitch_in: "0.750",
      roller_dia_mm: "12.07", inner_width_mm: "11.68",
      pin_dia_mm: "5.72", plate_height_mm: "16.13",
      tensile_kn: "29.0",
    },
    performance_tiers: [
      { tier: "standard", tensile_strength_lbs: "6500", working_load_lbs: "1480", source: "Donghua catalog p.32, ISO 606" },
    ],
    source_refs: [
      { manufacturer: "Donghua", code: "12B-1", confidence: "Confirmed", catalog_page: "32",
        catalog_url: DH_CATALOG_URL },
      { manufacturer: "Iwis", code: "12B-1", confidence: "Confirmed" },
      { manufacturer: "Renold", code: "12B-1", confidence: "Confirmed" },
    ],
    attachments_available: [],
    sprocket_series: "BS-12B",
    materials_available: ["carbon_steel", "stainless_304", "nickel_plated"],
    options_upgrades: ["Double strand (12B-2)", "Triple strand (12B-3)"],
    image_strategy: "family",
    status: "Active",
  },

  {
    chain_id: "BS-16B",
    chain_family: "performance_roller",
    chain_number: "16B",
    display_name: "16B British Standard Roller Chain",
    standard: "ISO 606 / BS 228",
    pitch_in: "1.000",
    pitch_mm: "25.40",
    description: "1\" pitch British Standard roller chain. Higher tensile than ANSI 80 equivalent. Common in European heavy industrial drives.",
    specs: {
      pitch_mm: "25.40", pitch_in: "1.000",
      roller_dia_mm: "15.88", inner_width_mm: "17.02",
      pin_dia_mm: "8.28", plate_height_mm: "21.08",
      tensile_kn: "60.0",
    },
    performance_tiers: [
      { tier: "standard", tensile_strength_lbs: "13500", working_load_lbs: "3060", source: "Donghua catalog p.32, ISO 606" },
    ],
    source_refs: [
      { manufacturer: "Donghua", code: "16B-1", confidence: "Confirmed", catalog_page: "32",
        catalog_url: DH_CATALOG_URL },
      { manufacturer: "Iwis", code: "16B-1", confidence: "Confirmed" },
      { manufacturer: "Renold", code: "16B-1", confidence: "Confirmed" },
      { manufacturer: "Tsubaki", code: "16B-1", confidence: "Confirmed" },
    ],
    attachments_available: ["A1", "A2", "K1", "K2"],
    sprocket_series: "BS-16B",
    materials_available: ["carbon_steel", "stainless_304", "nickel_plated"],
    options_upgrades: ["Double strand (16B-2)", "Triple strand (16B-3)"],
    image_strategy: "family",
    status: "Active",
  },

  {
    chain_id: "BS-20B",
    chain_family: "performance_roller",
    chain_number: "20B",
    display_name: "20B British Standard Roller Chain",
    standard: "ISO 606 / BS 228",
    pitch_in: "1.250",
    pitch_mm: "31.75",
    description: "1-1/4\" pitch British Standard roller chain for heavy-duty European drives.",
    specs: {
      pitch_mm: "31.75", pitch_in: "1.250",
      roller_dia_mm: "19.05", inner_width_mm: "19.56",
      pin_dia_mm: "10.19", plate_height_mm: "26.04",
      tensile_kn: "95.0",
    },
    performance_tiers: [
      { tier: "standard", tensile_strength_lbs: "21340", working_load_lbs: "4840", source: "Donghua catalog p.33, ISO 606" },
    ],
    source_refs: [
      { manufacturer: "Donghua", code: "20B-1", confidence: "Confirmed", catalog_page: "33",
        catalog_url: DH_CATALOG_URL },
      { manufacturer: "Renold", code: "20B-1", confidence: "Confirmed" },
    ],
    attachments_available: ["A1", "A2", "K1", "K2"],
    sprocket_series: "BS-20B",
    materials_available: ["carbon_steel", "stainless_304"],
    options_upgrades: ["Double strand"],
    image_strategy: "family",
    status: "Active",
  },

  {
    chain_id: "BS-24B",
    chain_family: "performance_roller",
    chain_number: "24B",
    display_name: "24B British Standard Roller Chain",
    standard: "ISO 606 / BS 228",
    pitch_in: "1.500",
    pitch_mm: "38.10",
    description: "1-1/2\" pitch BS/ISO heavy industrial roller chain.",
    specs: {
      pitch_mm: "38.10", pitch_in: "1.500",
      roller_dia_mm: "25.40", inner_width_mm: "25.40",
      pin_dia_mm: "14.63", plate_height_mm: "33.40",
      tensile_kn: "160.0",
    },
    performance_tiers: [
      { tier: "standard", tensile_strength_lbs: "35980", working_load_lbs: "8160", source: "Donghua catalog p.33, ISO 606" },
    ],
    source_refs: [
      { manufacturer: "Donghua", code: "24B-1", confidence: "Confirmed", catalog_page: "33",
        catalog_url: DH_CATALOG_URL },
      { manufacturer: "Renold", code: "24B-1", confidence: "Confirmed" },
    ],
    attachments_available: ["A1", "A2", "K1", "K2"],
    sprocket_series: "BS-24B",
    materials_available: ["carbon_steel"],
    options_upgrades: ["Double strand"],
    image_strategy: "family",
    status: "Active",
  },

  {
    chain_id: "BS-28B",
    chain_family: "performance_roller",
    chain_number: "28B",
    display_name: "28B British Standard Roller Chain",
    standard: "ISO 606 / BS 228",
    pitch_in: "1.750",
    pitch_mm: "44.45",
    description: "1-3/4\" pitch BS/ISO roller chain for high-load European industrial drives.",
    specs: {
      pitch_mm: "44.45", pitch_in: "1.750",
      roller_dia_mm: "27.94", inner_width_mm: "30.99",
      pin_dia_mm: "15.90", plate_height_mm: "37.08",
      tensile_kn: "200.0",
    },
    performance_tiers: [
      { tier: "standard", tensile_strength_lbs: "44960", working_load_lbs: "10200", source: "Donghua catalog p.34, ISO 606" },
    ],
    source_refs: [
      { manufacturer: "Donghua", code: "28B-1", confidence: "Confirmed", catalog_page: "34",
        catalog_url: DH_CATALOG_URL },
    ],
    attachments_available: ["A1", "A2", "K1", "K2"],
    sprocket_series: "BS-28B",
    materials_available: ["carbon_steel"],
    options_upgrades: [],
    image_strategy: "family",
    status: "Active",
  },

  {
    chain_id: "BS-32B",
    chain_family: "performance_roller",
    chain_number: "32B",
    display_name: "32B British Standard Roller Chain",
    standard: "ISO 606 / BS 228",
    pitch_in: "2.000",
    pitch_mm: "50.80",
    description: "2\" pitch BS/ISO roller chain — heavy European industrial drives.",
    specs: {
      pitch_mm: "50.80", pitch_in: "2.000",
      roller_dia_mm: "29.21", inner_width_mm: "30.99",
      pin_dia_mm: "17.81", plate_height_mm: "42.29",
      tensile_kn: "250.0",
    },
    performance_tiers: [
      { tier: "standard", tensile_strength_lbs: "56200", working_load_lbs: "12750", source: "Donghua catalog p.34, ISO 606" },
    ],
    source_refs: [
      { manufacturer: "Donghua", code: "32B-1", confidence: "Confirmed", catalog_page: "34",
        catalog_url: DH_CATALOG_URL },
      { manufacturer: "Renold", code: "32B-1", confidence: "Confirmed" },
    ],
    attachments_available: ["A1", "A2", "K1", "K2"],
    sprocket_series: "BS-32B",
    materials_available: ["carbon_steel"],
    options_upgrades: ["Double strand"],
    image_strategy: "family",
    status: "Active",
  },

  {
    chain_id: "BS-40B",
    chain_family: "performance_roller",
    chain_number: "40B",
    display_name: "40B British Standard Roller Chain",
    standard: "ISO 606 / BS 228",
    pitch_in: "2.500",
    pitch_mm: "63.50",
    description: "2-1/2\" pitch BS/ISO heavy roller chain for maximum load European drives.",
    specs: {
      pitch_mm: "63.50", pitch_in: "2.500",
      tensile_kn: "355.0",
    },
    performance_tiers: [
      { tier: "standard", tensile_strength_lbs: "79800", working_load_lbs: "18100", source: "Donghua catalog p.34, ISO 606" },
    ],
    source_refs: [
      { manufacturer: "Donghua", code: "40B-1", confidence: "Confirmed", catalog_page: "34",
        catalog_url: DH_CATALOG_URL },
    ],
    attachments_available: ["A1", "A2", "K1", "K2"],
    sprocket_series: "BS-40B",
    materials_available: ["carbon_steel"],
    options_upgrades: [],
    image_strategy: "family",
    status: "Active",
  },

  // ══════════════════════════════════════════════════════════════════
  // DONGHUA PERFORMANCE SERIES — SP / SH / X3
  // These are Donghua premium series, not duplicates of standard ANSI
  // ══════════════════════════════════════════════════════════════════

  {
    chain_id: "DH-SP-40",
    chain_family: "performance_roller",
    chain_number: "40SP",
    display_name: "40SP Donghua High Strength Roller Chain",
    standard: "ANSI B29.1",
    pitch_in: "0.500",
    pitch_mm: "12.70",
    description: "Donghua SP Series 1/2\" chain — shot peened, optimized plate geometry. 25-40% higher fatigue strength vs standard #40. ANSI interchangeable.",
    specs: {
      pitch_in: "0.500", pitch_mm: "12.70",
      roller_dia_in: "0.312", roller_width_in: "0.312",
      avg_ultimate_lbs: "4800",
    },
    performance_tiers: [
      { tier: "performance", tensile_strength_lbs: "4800", working_load_lbs: "960",
        source: "Donghua SP Series catalog p.38",
        notes: "SP series shot peened. 25-40% higher fatigue than standard. ANSI interchangeable." },
    ],
    source_refs: [
      { manufacturer: "Donghua", code: "40ASP-1", confidence: "Confirmed", catalog_page: "38",
        catalog_url: DH_CATALOG_URL, notes: "SP High Strength Series" },
    ],
    attachments_available: ["A1", "A2", "K1", "K2"],
    sprocket_series: "ANSI-40",
    materials_available: ["carbon_steel"],
    options_upgrades: [],
    image_strategy: "family",
    status: "Active",
  },

  {
    chain_id: "DH-SP-60",
    chain_family: "performance_roller",
    chain_number: "60SP",
    display_name: "60SP Donghua High Strength Roller Chain",
    standard: "ANSI B29.1",
    pitch_in: "0.750",
    pitch_mm: "19.05",
    description: "Donghua SP Series 3/4\" chain — shot peened, 25-40% higher fatigue. ANSI interchangeable.",
    specs: { pitch_in: "0.750", pitch_mm: "19.05", avg_ultimate_lbs: "11000" },
    performance_tiers: [
      { tier: "performance", tensile_strength_lbs: "11000", working_load_lbs: "2200",
        source: "Donghua SP Series catalog p.38", notes: "SP series shot peened." },
    ],
    source_refs: [
      { manufacturer: "Donghua", code: "60ASP-1", confidence: "Confirmed", catalog_page: "38", catalog_url: DH_CATALOG_URL },
    ],
    attachments_available: ["A1", "A2", "K1", "K2"],
    sprocket_series: "ANSI-60",
    materials_available: ["carbon_steel"],
    options_upgrades: [],
    image_strategy: "family",
    status: "Active",
  },

  {
    chain_id: "DH-SP-80",
    chain_family: "performance_roller",
    chain_number: "80SP",
    display_name: "80SP Donghua High Strength Roller Chain",
    standard: "ANSI B29.1",
    pitch_in: "1.000",
    pitch_mm: "25.40",
    description: "Donghua SP Series 1\" chain — shot peened plates, 25-40% higher fatigue than standard. ANSI interchangeable.",
    specs: { pitch_in: "1.000", pitch_mm: "25.40", avg_ultimate_lbs: "20000" },
    performance_tiers: [
      { tier: "performance", tensile_strength_lbs: "20000", working_load_lbs: "4000",
        source: "Donghua SP Series catalog p.38", notes: "SP series shot peened. 25-40% higher fatigue than standard ANSI 80." },
    ],
    source_refs: [
      { manufacturer: "Donghua", code: "80ASP-1", confidence: "Confirmed", catalog_page: "38", catalog_url: DH_CATALOG_URL },
    ],
    attachments_available: ["A1", "A2", "K1", "K2"],
    sprocket_series: "ANSI-80",
    materials_available: ["carbon_steel"],
    options_upgrades: [],
    image_strategy: "family",
    status: "Active",
  },

  {
    chain_id: "DH-X3-40",
    chain_family: "performance_roller",
    chain_number: "40X3",
    display_name: "40X3 Donghua High Performance Roller Chain",
    standard: "ANSI B29.1",
    pitch_in: "0.500",
    pitch_mm: "12.70",
    description: "Donghua X3 Series 1/2\" chain — enhanced surface hardness, extended wear life, high-cycle fatigue rated. Premium ANSI-interchangeable chain.",
    specs: { pitch_in: "0.500", pitch_mm: "12.70", avg_ultimate_lbs: "5200" },
    performance_tiers: [
      { tier: "premium", tensile_strength_lbs: "5200", working_load_lbs: "1040",
        source: "Donghua X3 Series catalog p.42", notes: "X3 Series — enhanced hardness, extended wear life." },
    ],
    source_refs: [
      { manufacturer: "Donghua", code: "40AX3-1", confidence: "Confirmed", catalog_page: "42", catalog_url: DH_CATALOG_URL },
    ],
    attachments_available: [],
    sprocket_series: "ANSI-40",
    materials_available: ["carbon_steel"],
    options_upgrades: [],
    image_strategy: "family",
    status: "Active",
  },

  {
    chain_id: "DH-X3-80",
    chain_family: "performance_roller",
    chain_number: "80X3",
    display_name: "80X3 Donghua High Performance Roller Chain",
    standard: "ANSI B29.1",
    pitch_in: "1.000",
    pitch_mm: "25.40",
    description: "Donghua X3 Series 1\" chain — premium surface hardness, wear resistance, extended fatigue life.",
    specs: { pitch_in: "1.000", pitch_mm: "25.40", avg_ultimate_lbs: "22000" },
    performance_tiers: [
      { tier: "premium", tensile_strength_lbs: "22000", working_load_lbs: "4400",
        source: "Donghua X3 Series catalog p.42", notes: "X3 Series — enhanced hardness, extended wear life." },
    ],
    source_refs: [
      { manufacturer: "Donghua", code: "80AX3-1", confidence: "Confirmed", catalog_page: "42", catalog_url: DH_CATALOG_URL },
    ],
    attachments_available: [],
    sprocket_series: "ANSI-80",
    materials_available: ["carbon_steel"],
    options_upgrades: [],
    image_strategy: "family",
    status: "Active",
  },

  // ══════════════════════════════════════════════════════════════════
  // SIDE BOW CHAINS
  // ══════════════════════════════════════════════════════════════════

  {
    chain_id: "SB-40",
    chain_family: "performance_roller",
    chain_number: "40SB",
    display_name: "40SB Side Bow Roller Chain",
    standard: "ANSI B29.1",
    pitch_in: "0.500",
    pitch_mm: "12.70",
    description: "1/2\" pitch side bow (laterally flexible) roller chain. Allows horizontal curves and S-curve conveyors. Used in packaging, bottling, and printing equipment.",
    specs: { pitch_in: "0.500", pitch_mm: "12.70", avg_ultimate_lbs: "3700" },
    performance_tiers: [
      { tier: "standard", tensile_strength_lbs: "3700", working_load_lbs: "740",
        source: "Donghua catalog p.60", notes: "Side bow — laterally flexible for curved conveyor paths." },
    ],
    source_refs: [
      { manufacturer: "Donghua", code: "40SB", confidence: "Confirmed", catalog_page: "60", catalog_url: DH_CATALOG_URL },
      { manufacturer: "Allied-Locke", code: "40SB", confidence: "Confirmed" },
    ],
    attachments_available: [],
    sprocket_series: "ANSI-40",
    materials_available: ["carbon_steel"],
    options_upgrades: [],
    image_strategy: "family",
    status: "Active",
  },

  {
    chain_id: "SB-60",
    chain_family: "performance_roller",
    chain_number: "60SB",
    display_name: "60SB Side Bow Roller Chain",
    standard: "ANSI B29.1",
    pitch_in: "0.750",
    pitch_mm: "19.05",
    description: "3/4\" side bow roller chain for curved horizontal conveyor paths.",
    specs: { pitch_in: "0.750", pitch_mm: "19.05", avg_ultimate_lbs: "8500" },
    performance_tiers: [
      { tier: "standard", tensile_strength_lbs: "8500", working_load_lbs: "1700", source: "Donghua catalog p.60" },
    ],
    source_refs: [
      { manufacturer: "Donghua", code: "60SB", confidence: "Confirmed", catalog_page: "60", catalog_url: DH_CATALOG_URL },
      { manufacturer: "Allied-Locke", code: "60SB", confidence: "Confirmed" },
    ],
    attachments_available: [],
    sprocket_series: "ANSI-60",
    materials_available: ["carbon_steel"],
    options_upgrades: [],
    image_strategy: "family",
    status: "Active",
  },

  {
    chain_id: "SB-80",
    chain_family: "performance_roller",
    chain_number: "80SB",
    display_name: "80SB Side Bow Roller Chain",
    standard: "ANSI B29.1",
    pitch_in: "1.000",
    pitch_mm: "25.40",
    description: "1\" side bow roller chain for curved conveyor paths requiring higher load capacity.",
    specs: { pitch_in: "1.000", pitch_mm: "25.40", avg_ultimate_lbs: "14500" },
    performance_tiers: [
      { tier: "standard", tensile_strength_lbs: "14500", working_load_lbs: "2900", source: "Donghua catalog p.60" },
    ],
    source_refs: [
      { manufacturer: "Donghua", code: "80SB", confidence: "Confirmed", catalog_page: "60", catalog_url: DH_CATALOG_URL },
      { manufacturer: "Allied-Locke", code: "80SB", confidence: "Confirmed" },
    ],
    attachments_available: [],
    sprocket_series: "ANSI-80",
    materials_available: ["carbon_steel"],
    options_upgrades: [],
    image_strategy: "family",
    status: "Active",
  },

  // ══════════════════════════════════════════════════════════════════
  // DOUBLE PITCH CONVEYOR — additional DH series
  // ══════════════════════════════════════════════════════════════════

  {
    chain_id: "C2042",
    chain_family: "double_pitch_conveyor",
    chain_number: "C2042",
    display_name: "C2042 Double Pitch Large Roller Chain",
    standard: "ANSI B29.4",
    pitch_in: "1.000",
    pitch_mm: "25.40",
    description: "C2042 — double pitch chain using #40 components with large roller (R2) for smoother running on guide rails.",
    specs: { pitch_in: "1.000", pitch_mm: "25.40", roller_dia_in: "0.440", roller_width_in: "0.312" },
    performance_tiers: [
      { tier: "standard", tensile_strength_lbs: "3700", working_load_lbs: "810", source: "Donghua catalog p.90, ANSI B29.4" },
    ],
    source_refs: [
      { manufacturer: "Donghua", code: "C2042", confidence: "Confirmed", catalog_page: "90", catalog_url: DH_CATALOG_URL },
      { manufacturer: "Tsubaki", code: "C2042", confidence: "Confirmed" },
    ],
    attachments_available: ["SA1", "SA2", "SK1", "SK2"],
    sprocket_series: "C2040",
    materials_available: ["carbon_steel", "stainless_304"],
    options_upgrades: [],
    image_strategy: "family",
    status: "Active",
  },

  {
    chain_id: "C2052",
    chain_family: "double_pitch_conveyor",
    chain_number: "C2052",
    display_name: "C2052 Double Pitch Large Roller Chain",
    standard: "ANSI B29.4",
    pitch_in: "1.250",
    pitch_mm: "31.75",
    description: "C2052 — double pitch chain using #50 components with large roller (R2).",
    specs: { pitch_in: "1.250", pitch_mm: "31.75", roller_dia_in: "0.563", roller_width_in: "0.375" },
    performance_tiers: [
      { tier: "standard", tensile_strength_lbs: "6100", working_load_lbs: "1330", source: "Donghua catalog p.90, ANSI B29.4" },
    ],
    source_refs: [
      { manufacturer: "Donghua", code: "C2052", confidence: "Confirmed", catalog_page: "90", catalog_url: DH_CATALOG_URL },
    ],
    attachments_available: ["SA1", "SA2", "SK1", "SK2"],
    sprocket_series: "C2050",
    materials_available: ["carbon_steel", "stainless_304"],
    options_upgrades: [],
    image_strategy: "family",
    status: "Active",
  },

  {
    chain_id: "C2062",
    chain_family: "double_pitch_conveyor",
    chain_number: "C2062",
    display_name: "C2062 Double Pitch Large Roller Chain",
    standard: "ANSI B29.4",
    pitch_in: "1.500",
    pitch_mm: "38.10",
    description: "C2062 — double pitch chain with large roller, #60 components.",
    specs: { pitch_in: "1.500", pitch_mm: "38.10", roller_dia_in: "0.625", roller_width_in: "0.500" },
    performance_tiers: [
      { tier: "standard", tensile_strength_lbs: "8500", working_load_lbs: "1950", source: "Donghua catalog p.91, ANSI B29.4" },
    ],
    source_refs: [
      { manufacturer: "Donghua", code: "C2062", confidence: "Confirmed", catalog_page: "91", catalog_url: DH_CATALOG_URL },
    ],
    attachments_available: ["SA1", "SA2", "SK1", "SK2"],
    sprocket_series: "C2060",
    materials_available: ["carbon_steel", "stainless_304"],
    options_upgrades: [],
    image_strategy: "family",
    status: "Active",
  },

  {
    chain_id: "C2082",
    chain_family: "double_pitch_conveyor",
    chain_number: "C2082",
    display_name: "C2082 Double Pitch Large Roller Chain",
    standard: "ANSI B29.4",
    pitch_in: "2.000",
    pitch_mm: "50.80",
    description: "C2082 — double pitch chain with large roller, #80 components.",
    specs: { pitch_in: "2.000", pitch_mm: "50.80", roller_dia_in: "0.812", roller_width_in: "0.625" },
    performance_tiers: [
      { tier: "standard", tensile_strength_lbs: "14500", working_load_lbs: "3500", source: "Donghua catalog p.92, ANSI B29.4" },
    ],
    source_refs: [
      { manufacturer: "Donghua", code: "C2082", confidence: "Confirmed", catalog_page: "92", catalog_url: DH_CATALOG_URL },
    ],
    attachments_available: ["SA1", "SA2", "SK1", "SK2"],
    sprocket_series: "C2080",
    materials_available: ["carbon_steel"],
    options_upgrades: [],
    image_strategy: "family",
    status: "Active",
  },

  {
    chain_id: "C2102H",
    chain_family: "double_pitch_conveyor",
    chain_number: "C2102H",
    display_name: "C2102H Double Pitch Heavy Roller Chain",
    standard: "ANSI B29.4",
    pitch_in: "2.500",
    pitch_mm: "63.50",
    description: "C2102H heavy double pitch chain — #100 components, heavy sidebar, for high-load package handling and assembly conveyors.",
    specs: { pitch_in: "2.500", pitch_mm: "63.50", avg_ultimate_lbs: "28000", max_working_load_lbs: "6400" },
    performance_tiers: [
      { tier: "standard", tensile_strength_lbs: "28000", working_load_lbs: "6400", source: "Donghua catalog p.93, ANSI B29.4" },
    ],
    source_refs: [
      { manufacturer: "Donghua", code: "C2102H", confidence: "Confirmed", catalog_page: "93", catalog_url: DH_CATALOG_URL },
      { manufacturer: "Tsubaki", code: "C2102H", confidence: "Confirmed" },
    ],
    attachments_available: ["A1", "A2", "K1", "K2"],
    sprocket_series: "C2100",
    materials_available: ["carbon_steel"],
    options_upgrades: [],
    image_strategy: "family",
    status: "Active",
  },

  // ══════════════════════════════════════════════════════════════════
  // STAINLESS STEEL CHAINS — Donghua full SS range
  // ══════════════════════════════════════════════════════════════════

  {
    chain_id: "SS304-25A",
    chain_family: "performance_roller",
    chain_number: "25A-SS",
    display_name: "25A Stainless Steel Roller Chain",
    standard: "ANSI B29.1",
    pitch_in: "0.250",
    pitch_mm: "6.35",
    description: "ANSI 25 fully stainless steel roller chain (304SS). Corrosion resistant for food, beverage, and chemical environments.",
    specs: { pitch_in: "0.250", pitch_mm: "6.35", avg_ultimate_lbs: "850" },
    performance_tiers: [
      { tier: "standard", tensile_strength_lbs: "850", working_load_lbs: "170",
        source: "Donghua catalog p.197, stainless series",
        notes: "304SS — approx 10-15% lower tensile than carbon steel equivalent. Specification varies by manufacturer." },
    ],
    source_refs: [
      { manufacturer: "Donghua", code: "25A-1SS", confidence: "Confirmed", catalog_page: "197", catalog_url: DH_CATALOG_URL },
    ],
    attachments_available: [],
    sprocket_series: "ANSI-25",
    materials_available: ["stainless_304", "stainless_316"],
    options_upgrades: ["316 Stainless upgrade"],
    image_strategy: "family",
    status: "Active",
  },

  {
    chain_id: "SS304-40A",
    chain_family: "performance_roller",
    chain_number: "40A-SS",
    display_name: "40A Stainless Steel Roller Chain",
    standard: "ANSI B29.1",
    pitch_in: "0.500",
    pitch_mm: "12.70",
    description: "ANSI 40 fully stainless steel roller chain (304SS). Food/beverage, chemical, and pharmaceutical conveying.",
    specs: { pitch_in: "0.500", pitch_mm: "12.70", avg_ultimate_lbs: "3500" },
    performance_tiers: [
      { tier: "standard", tensile_strength_lbs: "3500", working_load_lbs: "700",
        source: "Donghua catalog p.198", notes: "304SS — approx 5-10% lower tensile. Specification varies by manufacturer." },
    ],
    source_refs: [
      { manufacturer: "Donghua", code: "40A-1SS", confidence: "Confirmed", catalog_page: "198", catalog_url: DH_CATALOG_URL },
    ],
    attachments_available: ["A1", "A2", "K1", "K2"],
    sprocket_series: "ANSI-40",
    materials_available: ["stainless_304", "stainless_316"],
    options_upgrades: ["316 upgrade", "Attachment chains"],
    image_strategy: "family",
    status: "Active",
  },

  {
    chain_id: "SS304-60A",
    chain_family: "performance_roller",
    chain_number: "60A-SS",
    display_name: "60A Stainless Steel Roller Chain",
    standard: "ANSI B29.1",
    pitch_in: "0.750",
    pitch_mm: "19.05",
    description: "ANSI 60 fully stainless steel roller chain (304SS) for corrosive conveying environments.",
    specs: { pitch_in: "0.750", pitch_mm: "19.05", avg_ultimate_lbs: "8000" },
    performance_tiers: [
      { tier: "standard", tensile_strength_lbs: "8000", working_load_lbs: "1600",
        source: "Donghua catalog p.199", notes: "304SS. Specification varies by manufacturer." },
    ],
    source_refs: [
      { manufacturer: "Donghua", code: "60A-1SS", confidence: "Confirmed", catalog_page: "199", catalog_url: DH_CATALOG_URL },
    ],
    attachments_available: ["A1", "A2", "K1", "K2"],
    sprocket_series: "ANSI-60",
    materials_available: ["stainless_304", "stainless_316"],
    options_upgrades: ["316 upgrade"],
    image_strategy: "family",
    status: "Active",
  },

  {
    chain_id: "SS304-80A",
    chain_family: "performance_roller",
    chain_number: "80A-SS",
    display_name: "80A Stainless Steel Roller Chain",
    standard: "ANSI B29.1",
    pitch_in: "1.000",
    pitch_mm: "25.40",
    description: "ANSI 80 fully stainless steel roller chain (304SS). Heavy-duty corrosion-resistant drive.",
    specs: { pitch_in: "1.000", pitch_mm: "25.40", avg_ultimate_lbs: "14000" },
    performance_tiers: [
      { tier: "standard", tensile_strength_lbs: "14000", working_load_lbs: "2800",
        source: "Donghua catalog p.200", notes: "304SS. Specification varies by manufacturer." },
    ],
    source_refs: [
      { manufacturer: "Donghua", code: "80A-1SS", confidence: "Confirmed", catalog_page: "200", catalog_url: DH_CATALOG_URL },
    ],
    attachments_available: ["A1", "A2", "K1", "K2"],
    sprocket_series: "ANSI-80",
    materials_available: ["stainless_304", "stainless_316"],
    options_upgrades: ["316 upgrade"],
    image_strategy: "family",
    status: "Active",
  },

  {
    chain_id: "SS304-08B",
    chain_family: "performance_roller",
    chain_number: "08B-SS",
    display_name: "08B Stainless Steel Roller Chain",
    standard: "ISO 606",
    pitch_in: "0.500",
    pitch_mm: "12.70",
    description: "BS/ISO 08B fully stainless roller chain (304SS) for European corrosive applications.",
    specs: { pitch_in: "0.500", pitch_mm: "12.70", avg_ultimate_lbs: "3800" },
    performance_tiers: [
      { tier: "standard", tensile_strength_lbs: "3800", working_load_lbs: "860",
        source: "Donghua catalog p.202", notes: "304SS ISO 606. Specification varies by manufacturer." },
    ],
    source_refs: [
      { manufacturer: "Donghua", code: "08B-1SS", confidence: "Confirmed", catalog_page: "202", catalog_url: DH_CATALOG_URL },
    ],
    attachments_available: [],
    sprocket_series: "BS-08B",
    materials_available: ["stainless_304", "stainless_316"],
    options_upgrades: [],
    image_strategy: "family",
    status: "Active",
  },

  // ══════════════════════════════════════════════════════════════════
  // AGRICULTURAL CHAINS — Donghua CA/S series additions
  // ══════════════════════════════════════════════════════════════════

  {
    chain_id: "CA555",
    chain_family: "agricultural_conveyor",
    chain_number: "CA555",
    display_name: "CA555 Agricultural Roller Chain",
    standard: "ASME B29.200",
    pitch_in: "1.654",
    pitch_mm: "42.01",
    description: "CA555 agricultural chain for combines and harvesting equipment. Between CA550 and CA557 in strength.",
    specs: { pitch_in: "1.654", pitch_mm: "42.01", avg_ultimate_lbs: "17500", max_working_load_lbs: "3500" },
    performance_tiers: [
      { tier: "standard", tensile_strength_lbs: "17500", working_load_lbs: "3500", source: "Donghua catalog p.172, ASME B29.200" },
    ],
    source_refs: [
      { manufacturer: "Donghua", code: "CA555", confidence: "Confirmed", catalog_page: "172", catalog_url: DH_CATALOG_URL },
    ],
    attachments_available: ["AGRI-A1", "AGRI-K1"],
    sprocket_series: "CA550",
    materials_available: ["carbon_steel"],
    options_upgrades: [],
    image_strategy: "family",
    status: "Active",
  },

  {
    chain_id: "CA624",
    chain_family: "agricultural_conveyor",
    chain_number: "CA624",
    display_name: "CA624 Agricultural Roller Chain",
    standard: "ASME B29.200",
    pitch_in: "1.972",
    pitch_mm: "50.09",
    description: "CA624 heavy agricultural chain variant. Used in heavier combines and high-throughput harvesters.",
    specs: { pitch_in: "1.972", pitch_mm: "50.09", avg_ultimate_lbs: "24000", max_working_load_lbs: "4800" },
    performance_tiers: [
      { tier: "standard", tensile_strength_lbs: "24000", working_load_lbs: "4800", source: "Donghua catalog p.172, ASME B29.200" },
    ],
    source_refs: [
      { manufacturer: "Donghua", code: "CA624", confidence: "Confirmed", catalog_page: "172", catalog_url: DH_CATALOG_URL },
    ],
    attachments_available: ["AGRI-A1", "AGRI-K1"],
    sprocket_series: "CA620",
    materials_available: ["carbon_steel"],
    options_upgrades: [],
    image_strategy: "family",
    status: "Active",
  },

  {
    chain_id: "CA650",
    chain_family: "agricultural_conveyor",
    chain_number: "CA650",
    display_name: "CA650 Agricultural Roller Chain",
    standard: "ASME B29.200",
    pitch_in: "2.148",
    pitch_mm: "54.56",
    description: "CA650 large-pitch agricultural chain for heavy-duty combine and forage harvester elevator systems.",
    specs: { pitch_in: "2.148", pitch_mm: "54.56", avg_ultimate_lbs: "28000", max_working_load_lbs: "5600" },
    performance_tiers: [
      { tier: "standard", tensile_strength_lbs: "28000", working_load_lbs: "5600", source: "Donghua catalog p.173, ASME B29.200" },
    ],
    source_refs: [
      { manufacturer: "Donghua", code: "CA650", confidence: "Confirmed", catalog_page: "173", catalog_url: DH_CATALOG_URL },
    ],
    attachments_available: ["AGRI-A1", "AGRI-K1"],
    sprocket_series: "CA650",
    materials_available: ["carbon_steel"],
    options_upgrades: [],
    image_strategy: "family",
    status: "Active",
  },

  {
    chain_id: "CA2060H-AGR",
    chain_family: "agricultural_conveyor",
    chain_number: "CA2060H",
    display_name: "CA2060H Agricultural Double Pitch Chain",
    standard: "ASME B29.200 / ANSI B29.4",
    pitch_in: "1.500",
    pitch_mm: "38.10",
    description: "CA2060H double pitch heavy agricultural roller chain for long-span grain conveyors.",
    specs: { pitch_in: "1.500", pitch_mm: "38.10", avg_ultimate_lbs: "10500", max_working_load_lbs: "2100" },
    performance_tiers: [
      { tier: "standard", tensile_strength_lbs: "10500", working_load_lbs: "2100", source: "Donghua catalog p.174" },
    ],
    source_refs: [
      { manufacturer: "Donghua", code: "CA2060H", confidence: "Confirmed", catalog_page: "174", catalog_url: DH_CATALOG_URL },
    ],
    attachments_available: ["AGRI-A1", "AGRI-K1"],
    sprocket_series: "C2060",
    materials_available: ["carbon_steel"],
    options_upgrades: [],
    image_strategy: "family",
    status: "Active",
  },

  // ══════════════════════════════════════════════════════════════════
  // ESCALATOR STEP CHAINS
  // ══════════════════════════════════════════════════════════════════

  {
    chain_id: "ESC-133mm",
    chain_family: "specialty_custom",
    chain_number: "ESC-133",
    display_name: "133mm Escalator Step Chain",
    standard: "EN 115 / ISO 22559",
    pitch_in: "5.236",
    pitch_mm: "133.00",
    description: "133mm pitch escalator step chain. High-precision, pre-stressed construction for escalator step attachments. Complies with EN 115 safety standard.",
    specs: { pitch_mm: "133.00", pitch_in: "5.236", type: "Escalator step", standard_ref: "EN 115" },
    performance_tiers: [
      { tier: "standard", tensile_strength_lbs: "44800", working_load_lbs: "9000",
        source: "Donghua catalog p.241", notes: "Escalator duty — pre-stressed, precision ground for smooth step movement." },
    ],
    source_refs: [
      { manufacturer: "Donghua", code: "ESC-133", confidence: "Confirmed", catalog_page: "241",
        catalog_url: DH_CATALOG_URL, notes: "Escalator step chain, EN 115 compliant" },
    ],
    attachments_available: ["ESC-STEP-AXLE"],
    sprocket_series: "ESC-133",
    materials_available: ["carbon_steel"],
    options_upgrades: ["Pre-stressed", "Corrosion resistant coating"],
    image_strategy: "family",
    status: "Active",
  },

  {
    chain_id: "ESC-147mm",
    chain_family: "specialty_custom",
    chain_number: "ESC-147",
    display_name: "147mm Escalator Step Chain",
    standard: "EN 115 / ISO 22559",
    pitch_in: "5.787",
    pitch_mm: "147.00",
    description: "147mm pitch escalator step chain. Heavy-duty construction for high-traffic escalators.",
    specs: { pitch_mm: "147.00", pitch_in: "5.787", type: "Escalator step", standard_ref: "EN 115" },
    performance_tiers: [
      { tier: "standard", tensile_strength_lbs: "53600", working_load_lbs: "10700",
        source: "Donghua catalog p.242", notes: "Escalator duty. Specification varies by OEM." },
    ],
    source_refs: [
      { manufacturer: "Donghua", code: "ESC-147", confidence: "Confirmed", catalog_page: "242",
        catalog_url: DH_CATALOG_URL },
    ],
    attachments_available: ["ESC-STEP-AXLE"],
    sprocket_series: "ESC-147",
    materials_available: ["carbon_steel"],
    options_upgrades: [],
    image_strategy: "family",
    status: "Active",
  },

  // ══════════════════════════════════════════════════════════════════
  // SUGAR MILL CHAINS
  // ══════════════════════════════════════════════════════════════════

  {
    chain_id: "SUGAR-MILL-P152",
    chain_family: "specialty_custom",
    chain_number: "P152",
    display_name: "P152 Sugar Mill Chain",
    standard: "Custom / Sugar Industry Standard",
    pitch_in: "5.985",
    pitch_mm: "152.00",
    description: "P152 sugar mill conveyor chain for bagasse handling and cane carrier conveyors. Heavy forged components, corrosion resistant construction.",
    specs: { pitch_mm: "152.00", pitch_in: "5.985", type: "Sugar mill", industry: "Sugar processing" },
    performance_tiers: [
      { tier: "standard", tensile_strength_lbs: "80000", working_load_lbs: "16000",
        source: "Donghua catalog p.250", notes: "Sugar mill series — forged components for wet/abrasive environments." },
    ],
    source_refs: [
      { manufacturer: "Donghua", code: "P152F78", confidence: "Confirmed", catalog_page: "250",
        catalog_url: DH_CATALOG_URL, notes: "Sugar mill cane carrier chain" },
    ],
    attachments_available: ["SUGAR-FLIGHT", "SUGAR-SCRAPER"],
    sprocket_series: "SUGAR-P152",
    materials_available: ["carbon_steel", "induction_hard"],
    options_upgrades: ["Hardened pins", "Extended wear plates"],
    image_strategy: "family",
    status: "Active",
  },

  {
    chain_id: "SUGAR-MILL-P203",
    chain_family: "specialty_custom",
    chain_number: "P203",
    display_name: "P203 Sugar Mill Heavy Chain",
    standard: "Custom / Sugar Industry Standard",
    pitch_in: "7.992",
    pitch_mm: "203.00",
    description: "P203 heavy sugar mill chain for main cane carrier and boiler fuel conveyors. Extra-heavy construction.",
    specs: { pitch_mm: "203.00", pitch_in: "7.992", type: "Sugar mill heavy", industry: "Sugar processing" },
    performance_tiers: [
      { tier: "standard", tensile_strength_lbs: "130000", working_load_lbs: "26000",
        source: "Donghua catalog p.252", notes: "Heavy sugar mill series. Specification varies by mill." },
    ],
    source_refs: [
      { manufacturer: "Donghua", code: "P203F100", confidence: "Confirmed", catalog_page: "252",
        catalog_url: DH_CATALOG_URL },
    ],
    attachments_available: ["SUGAR-FLIGHT", "SUGAR-SCRAPER"],
    sprocket_series: "SUGAR-P203",
    materials_available: ["carbon_steel", "induction_hard"],
    options_upgrades: [],
    image_strategy: "family",
    status: "Active",
  },

  // ══════════════════════════════════════════════════════════════════
  // PALM OIL MILL CHAINS
  // ══════════════════════════════════════════════════════════════════

  {
    chain_id: "PALM-OIL-9075",
    chain_family: "specialty_custom",
    chain_number: "POM-9075",
    display_name: "9075 Palm Oil Mill Fruit Conveyor Chain",
    standard: "Custom / Palm Oil Industry",
    pitch_in: "6.000",
    pitch_mm: "152.40",
    description: "Palm oil fruit bunch conveyor chain (FFB chain). Designed for wet, corrosive, high-temperature environments in palm oil sterilization and conveying.",
    specs: { pitch_mm: "152.40", pitch_in: "6.000", type: "Palm oil conveyor", industry: "Palm oil processing" },
    performance_tiers: [
      { tier: "standard", tensile_strength_lbs: "85000", working_load_lbs: "17000",
        source: "Donghua catalog p.260", notes: "Palm oil industry — corrosion resistant construction for wet sterilizer environments." },
    ],
    source_refs: [
      { manufacturer: "Donghua", code: "9075", confidence: "Confirmed", catalog_page: "260",
        catalog_url: DH_CATALOG_URL, notes: "Palm oil fruit bunch conveyor chain" },
    ],
    attachments_available: ["PALM-FLIGHT", "PALM-SCRAPER"],
    sprocket_series: "PALM-9075",
    materials_available: ["carbon_steel", "stainless_304"],
    options_upgrades: ["Corrosion resistant coating", "Hardened pins"],
    image_strategy: "family",
    status: "Active",
  },

  // ══════════════════════════════════════════════════════════════════
  // LUMBER / FORESTRY CONVEYOR CHAINS
  // ══════════════════════════════════════════════════════════════════

  {
    chain_id: "LUMBER-LK-2734",
    chain_family: "specialty_custom",
    chain_number: "LK-2734",
    display_name: "LK-2734 Lumber Conveyor Chain",
    standard: "Custom / Lumber Industry",
    pitch_in: "4.000",
    pitch_mm: "101.60",
    description: "LK series lumber conveyor chain for log handling, debarkers, and sawmill conveyors. Heavy-duty forged attachments.",
    specs: { pitch_in: "4.000", pitch_mm: "101.60", type: "Lumber conveyor", industry: "Lumber and forestry" },
    performance_tiers: [
      { tier: "standard", tensile_strength_lbs: "55000", working_load_lbs: "11000",
        source: "Donghua catalog p.265", notes: "Lumber series — heavy attachments for log handling." },
    ],
    source_refs: [
      { manufacturer: "Donghua", code: "LK-2734", confidence: "Confirmed", catalog_page: "265",
        catalog_url: DH_CATALOG_URL },
    ],
    attachments_available: ["LUMBER-DOG", "LUMBER-LOG-SPIKE", "LUMBER-KICK"],
    sprocket_series: "LK-2734",
    materials_available: ["carbon_steel", "induction_hard"],
    options_upgrades: ["Hardened dog attachments", "Extended wear pins"],
    image_strategy: "family",
    status: "Active",
  },

  {
    chain_id: "LUMBER-WD-3939",
    chain_family: "specialty_custom",
    chain_number: "WD-3939",
    display_name: "WD-3939 Lumber/Forestry Drag Chain",
    standard: "Custom / Lumber Industry",
    pitch_in: "3.000",
    pitch_mm: "76.20",
    description: "WD-3939 lumber drag chain for log sorting, transfer decks, and waste wood conveying.",
    specs: { pitch_in: "3.000", pitch_mm: "76.20", type: "Lumber drag", industry: "Lumber and forestry" },
    performance_tiers: [
      { tier: "standard", tensile_strength_lbs: "40000", working_load_lbs: "8000",
        source: "Donghua catalog p.267", notes: "Lumber drag series." },
    ],
    source_refs: [
      { manufacturer: "Donghua", code: "WD-3939", confidence: "Confirmed", catalog_page: "267",
        catalog_url: DH_CATALOG_URL },
    ],
    attachments_available: ["LUMBER-DOG", "LUMBER-FLIGHT"],
    sprocket_series: "LK-WD",
    materials_available: ["carbon_steel"],
    options_upgrades: [],
    image_strategy: "family",
    status: "Active",
  },

  // ══════════════════════════════════════════════════════════════════
  // RUBBER GLOVES CARRIER CHAINS
  // ══════════════════════════════════════════════════════════════════

  {
    chain_id: "GLOVES-CARRIER",
    chain_family: "specialty_custom",
    chain_number: "GCC",
    display_name: "Rubber Gloves Carrier Chain",
    standard: "Custom / Rubber Glove Industry",
    pitch_in: "2.500",
    pitch_mm: "63.50",
    description: "Specialty carrier chain for rubber glove dipping/processing lines. Precision construction for consistent glove form spacing. Corrosion and chemical resistant.",
    specs: { pitch_in: "2.500", pitch_mm: "63.50", type: "Glove carrier", industry: "Rubber glove manufacturing" },
    performance_tiers: [
      { tier: "standard", tensile_strength_lbs: "18000", working_load_lbs: "3600",
        source: "Donghua catalog p.270", notes: "Rubber glove carrier — chemical resistant, precision spacing." },
    ],
    source_refs: [
      { manufacturer: "Donghua", code: "GCC", confidence: "Confirmed", catalog_page: "270",
        catalog_url: DH_CATALOG_URL },
    ],
    attachments_available: ["GLOVE-FORM-CARRIER"],
    sprocket_series: "GCC",
    materials_available: ["stainless_304", "stainless_316", "nickel_plated"],
    options_upgrades: ["316SS for acid environments"],
    image_strategy: "family",
    status: "Active",
  },

  // ══════════════════════════════════════════════════════════════════
  // LEAF CHAINS — additional DH sizes
  // ══════════════════════════════════════════════════════════════════

  {
    chain_id: "AL0622",
    chain_family: "leaf_chain",
    chain_number: "AL0622",
    display_name: "AL0622 Leaf Chain",
    standard: "ANSI/ASME B29.8",
    pitch_in: "0.375",
    pitch_mm: "9.525",
    description: "AL series 3/8\" pitch leaf chain, 6 plates wide × 22 lacing. Light forklift mast and hoist applications.",
    specs: { pitch_in: "0.375", pitch_mm: "9.525", lacing: "2×2", avg_ultimate_lbs: "8000", max_working_load_lbs: "1600" },
    performance_tiers: [
      { tier: "standard", tensile_strength_lbs: "8000", working_load_lbs: "1600", source: "Donghua catalog p.222, ANSI B29.8" },
    ],
    source_refs: [
      { manufacturer: "Donghua", code: "LH0622", confidence: "Confirmed", catalog_page: "222", catalog_url: DH_CATALOG_URL },
      { manufacturer: "Iwis", code: "LH0622", confidence: "Confirmed" },
    ],
    attachments_available: [],
    sprocket_series: null,
    materials_available: ["carbon_steel"],
    options_upgrades: [],
    image_strategy: "family",
    status: "Active",
  },

  {
    chain_id: "BL0622",
    chain_family: "leaf_chain",
    chain_number: "BL0622",
    display_name: "BL0622 Leaf Chain",
    standard: "ANSI/ASME B29.8",
    pitch_in: "0.375",
    pitch_mm: "9.525",
    description: "BL series 3/8\" pitch leaf chain. Thicker plates than AL for higher working loads.",
    specs: { pitch_in: "0.375", pitch_mm: "9.525", lacing: "2×2", avg_ultimate_lbs: "9500", max_working_load_lbs: "1900" },
    performance_tiers: [
      { tier: "standard", tensile_strength_lbs: "9500", working_load_lbs: "1900", source: "Donghua catalog p.226, ANSI B29.8" },
    ],
    source_refs: [
      { manufacturer: "Donghua", code: "BL0622", confidence: "Confirmed", catalog_page: "226", catalog_url: DH_CATALOG_URL },
    ],
    attachments_available: [],
    sprocket_series: null,
    materials_available: ["carbon_steel"],
    options_upgrades: [],
    image_strategy: "family",
    status: "Active",
  },

  {
    chain_id: "BL0644",
    chain_family: "leaf_chain",
    chain_number: "BL0644",
    display_name: "BL0644 Leaf Chain",
    standard: "ANSI/ASME B29.8",
    pitch_in: "0.375",
    pitch_mm: "9.525",
    description: "BL series 3/8\" pitch leaf chain, heavy lacing (44) for high working load forklift mast applications.",
    specs: { pitch_in: "0.375", pitch_mm: "9.525", lacing: "4×4", avg_ultimate_lbs: "19000", max_working_load_lbs: "3800" },
    performance_tiers: [
      { tier: "standard", tensile_strength_lbs: "19000", working_load_lbs: "3800", source: "Donghua catalog p.227, ANSI B29.8" },
    ],
    source_refs: [
      { manufacturer: "Donghua", code: "BL0644", confidence: "Confirmed", catalog_page: "227", catalog_url: DH_CATALOG_URL },
    ],
    attachments_available: [],
    sprocket_series: null,
    materials_available: ["carbon_steel"],
    options_upgrades: [],
    image_strategy: "family",
    status: "Active",
  },

  {
    chain_id: "BL0846",
    chain_family: "leaf_chain",
    chain_number: "BL0846",
    display_name: "BL0846 Leaf Chain",
    standard: "ANSI/ASME B29.8",
    pitch_in: "0.500",
    pitch_mm: "12.70",
    description: "BL series 1/2\" pitch, 8-wide × 46 lacing leaf chain for medium-duty forklift mast.",
    specs: { pitch_in: "0.500", pitch_mm: "12.70", lacing: "4×6", avg_ultimate_lbs: "28000", max_working_load_lbs: "5600" },
    performance_tiers: [
      { tier: "standard", tensile_strength_lbs: "28000", working_load_lbs: "5600", source: "Donghua catalog p.228, ANSI B29.8" },
    ],
    source_refs: [
      { manufacturer: "Donghua", code: "BL0846", confidence: "Confirmed", catalog_page: "228", catalog_url: DH_CATALOG_URL },
    ],
    attachments_available: [],
    sprocket_series: null,
    materials_available: ["carbon_steel"],
    options_upgrades: [],
    image_strategy: "family",
    status: "Active",
  },

  {
    chain_id: "BL1246",
    chain_family: "leaf_chain",
    chain_number: "BL1246",
    display_name: "BL1246 Leaf Chain",
    standard: "ANSI/ASME B29.8",
    pitch_in: "0.750",
    pitch_mm: "19.05",
    description: "BL series 3/4\" pitch leaf chain for heavy forklift mast and large hoist applications.",
    specs: { pitch_in: "0.750", pitch_mm: "19.05", lacing: "4×6", avg_ultimate_lbs: "66000", max_working_load_lbs: "13200" },
    performance_tiers: [
      { tier: "standard", tensile_strength_lbs: "66000", working_load_lbs: "13200", source: "Donghua catalog p.230, ANSI B29.8" },
    ],
    source_refs: [
      { manufacturer: "Donghua", code: "BL1246", confidence: "Confirmed", catalog_page: "230", catalog_url: DH_CATALOG_URL },
    ],
    attachments_available: [],
    sprocket_series: null,
    materials_available: ["carbon_steel"],
    options_upgrades: [],
    image_strategy: "family",
    status: "Active",
  },

  {
    chain_id: "BL1634",
    chain_family: "leaf_chain",
    chain_number: "BL1634",
    display_name: "BL1634 Leaf Chain",
    standard: "ANSI/ASME B29.8",
    pitch_in: "1.000",
    pitch_mm: "25.40",
    description: "BL series 1\" pitch leaf chain, 16 plates wide × 34 lacing for heavy industrial hoist applications.",
    specs: { pitch_in: "1.000", pitch_mm: "25.40", lacing: "8×34", avg_ultimate_lbs: "120000", max_working_load_lbs: "24000" },
    performance_tiers: [
      { tier: "standard", tensile_strength_lbs: "120000", working_load_lbs: "24000", source: "Donghua catalog p.232, ANSI B29.8" },
    ],
    source_refs: [
      { manufacturer: "Donghua", code: "BL1634", confidence: "Confirmed", catalog_page: "232", catalog_url: DH_CATALOG_URL },
    ],
    attachments_available: [],
    sprocket_series: null,
    materials_available: ["carbon_steel"],
    options_upgrades: [],
    image_strategy: "family",
    status: "Active",
  },

];

export default {
  DH_MERGE_REFS,
  DH_NEW_CHAINS,
};