/**
 * donghuaDeepExpansion.js
 *
 * PHASE 3 — Donghua Deep Catalog Ingestion
 * Source: http://en.dhchain.com/wp-content/uploads/2020/11/2020111706240075.pdf
 * Import Date: 2026-05-06
 *
 * COVERS (additive — no duplication of donghuaNormalizedChains.js):
 *   Phase 3A — Attachment Chains (ANSI A-series with A1/A2/K1/K2 attachments)
 *   Phase 3B — Engineering Class Bushed Conveyor Chains (C catalog section)
 *   Phase 3C — Welded Steel Chains (DH catalog section)
 *   Phase 3D — Steel Pintle Chains (DH catalog section)
 *   Phase 3E — Agricultural Conveyor Chain Variants (CA/S additional sizes)
 *   Phase 3F — Specialty Conveyor Chains (en-masse, scraper, bucket elevator)
 *   Phase 3G — Bucket Elevator Chains (DH-specific series)
 *   Phase 3H — Hollow Pin Chain Extensions (HP extensions, C-series HP)
 *   Phase 3I — Double Pitch Attachment Extensions
 *   Phase 3J — Connecting Links & Offset Links (normalized accessory records)
 *   Phase 3K — Corrosion-Resistant Variants (zinc, nickel, dacromet)
 *   Phase 3L — SH Series (High Strength Heavy Duty)
 *   Phase 3M — Additional Leaf Chain Sizes
 *
 * NORMALIZATION RULES:
 *   - NO duplicates of chains already in chainNormalizedDictionary.js,
 *     chainNormalizedExpansion.js, chainNormalizedExpansion2.js, or donghuaNormalizedChains.js
 *   - Low-confidence entries flagged "Needs Review"
 *   - Donghua-specific series get new normalized entries
 *   - Standard variants of existing chains → DH_DEEP_MERGE_REFS only
 *   - Source traceability preserved on all entries
 */

const DH_CATALOG_URL = "http://en.dhchain.com/wp-content/uploads/2020/11/2020111706240075.pdf";

// ─── DEEP MERGE REFS — add Donghua as source to existing normalized chains ─────
// New attachment / variant confirmations not covered in phase 1–2

export const DH_DEEP_MERGE_REFS = [
  // ── ANSI Attachment variants — confirming Donghua makes standard attachment chains ──
  { chain_id: "ANSI-40",    code: "40A-1A1",   confidence: "Confirmed", catalog_page: "70", notes: "A1 attachment, Donghua standard attachment chain" },
  { chain_id: "ANSI-40",    code: "40A-1K1",   confidence: "Confirmed", catalog_page: "70", notes: "K1 attachment, Donghua standard attachment chain" },
  { chain_id: "ANSI-60",    code: "60A-1A1",   confidence: "Confirmed", catalog_page: "71", notes: "A1 attachment" },
  { chain_id: "ANSI-60",    code: "60A-1K1",   confidence: "Confirmed", catalog_page: "71", notes: "K1 attachment" },
  { chain_id: "ANSI-80",    code: "80A-1A1",   confidence: "Confirmed", catalog_page: "72", notes: "A1 attachment" },
  { chain_id: "ANSI-80",    code: "80A-1K1",   confidence: "Confirmed", catalog_page: "72", notes: "K1 attachment" },
  // ── HP extra sizes ──
  { chain_id: "HP-2060",    code: "C2060HP",   confidence: "Confirmed", catalog_page: "68", notes: "Double pitch hollow pin" },
  // ── Double pitch attachment variants ──
  { chain_id: "C2060",      code: "C2060A1",   confidence: "Confirmed", catalog_page: "94", notes: "A1 attachment double pitch" },
  { chain_id: "C2060",      code: "C2060K1",   confidence: "Confirmed", catalog_page: "94", notes: "K1 attachment double pitch" },
  { chain_id: "C2080",      code: "C2080A1",   confidence: "Confirmed", catalog_page: "95", notes: "A1 attachment double pitch" },
  // ── Leaf chain additional merge refs ──
  { chain_id: "AL0844",     code: "LH0844F",   confidence: "Confirmed", catalog_page: "223", notes: "AL0844 with clevis fitting" },
  { chain_id: "BL1044",     code: "BL1044F",   confidence: "Confirmed", catalog_page: "229", notes: "BL1044 with clevis fitting" },
  // ── Agricultural ──
  { chain_id: "CA550",      code: "CA550V5",   confidence: "Needs Review", catalog_page: "170", notes: "V5 attachment variant — verify dimensions" },
  { chain_id: "S55",        code: "S55A1",     confidence: "Confirmed", catalog_page: "176", notes: "S55 with flight attachment" },
  { chain_id: "S62",        code: "S62A1",     confidence: "Confirmed", catalog_page: "176", notes: "S62 with flight attachment" },
];

// ─── DEEP NEW CHAINS — Phase 3 normalized entries ─────────────────────────────

export const DH_DEEP_NEW_CHAINS = [

  // ══════════════════════════════════════════════════════════════════
  // PHASE 3A — ATTACHMENT CHAINS
  // Donghua catalog Section A, pp.70–72
  // Normalized as separate chain_ids because attachment geometry
  // changes the chain's usable context (conveyor vs. drive)
  // ══════════════════════════════════════════════════════════════════

  {
    chain_id: "DH-ATT-40-A2",
    chain_family: "attachment_roller",
    chain_number: "40A-A2",
    display_name: "40A-A2 ANSI Attachment Roller Chain",
    standard: "ANSI B29.1",
    pitch_in: "0.500",
    pitch_mm: "12.70",
    description: "ANSI 40 roller chain with A2 (extended tab, one side) attachments. Donghua confirmed from catalog p.70. Used in light conveying, positioning, and cross-rod mounting applications.",
    specs: {
      pitch_in: "0.500", pitch_mm: "12.70",
      attachment_type: "A2",
      attachment_side: "One side",
      tab_height_in: "0.591", tab_thickness_in: "0.050",
      avg_ultimate_lbs: "3700",
    },
    performance_tiers: [
      { tier: "standard", tensile_strength_lbs: "3700", working_load_lbs: "740",
        source: "Donghua catalog p.70", notes: "A2 attachment — single side extended tab. ANSI B29.1." },
    ],
    source_refs: [
      { manufacturer: "Donghua", code: "40A-1A2", confidence: "Confirmed",
        catalog_url: DH_CATALOG_URL, catalog_page: "70", notes: "Standard A2 attachment chain" },
      { manufacturer: "Allied-Locke", code: "40A2", confidence: "Confirmed" },
    ],
    attachments_available: [],
    attachment_configs: [
      { code: "A2", side: "one_side", spacing: "every_link", description: "Extended tab, one side, every pitch" },
      { code: "A2-E2", side: "one_side", spacing: "every_2nd", description: "A2 tab every 2nd link" },
      { code: "A2-E3", side: "one_side", spacing: "every_3rd", description: "A2 tab every 3rd link" },
    ],
    sprocket_series: "ANSI-40",
    materials_available: ["carbon_steel", "stainless_304"],
    options_upgrades: ["K2 both-side variant", "Custom attachment spacing"],
    image_strategy: "family",
    status: "Active",
  },

  {
    chain_id: "DH-ATT-40-K2",
    chain_family: "attachment_roller",
    chain_number: "40A-K2",
    display_name: "40A-K2 ANSI Attachment Roller Chain",
    standard: "ANSI B29.1",
    pitch_in: "0.500",
    pitch_mm: "12.70",
    description: "ANSI 40 roller chain with K2 (bent tab, both sides) attachments. Used in conveyor and transfer systems where bilateral mounting is required.",
    specs: {
      pitch_in: "0.500", pitch_mm: "12.70",
      attachment_type: "K2",
      attachment_side: "Both sides",
      avg_ultimate_lbs: "3700",
    },
    performance_tiers: [
      { tier: "standard", tensile_strength_lbs: "3700", working_load_lbs: "740",
        source: "Donghua catalog p.70", notes: "K2 attachment — bent tab both sides." },
    ],
    source_refs: [
      { manufacturer: "Donghua", code: "40A-1K2", confidence: "Confirmed",
        catalog_url: DH_CATALOG_URL, catalog_page: "70" },
      { manufacturer: "Allied-Locke", code: "40K2", confidence: "Confirmed" },
    ],
    attachments_available: [],
    attachment_configs: [
      { code: "K2", side: "both_sides", spacing: "every_link" },
      { code: "K2-E2", side: "both_sides", spacing: "every_2nd" },
    ],
    sprocket_series: "ANSI-40",
    materials_available: ["carbon_steel", "stainless_304"],
    options_upgrades: ["Custom spacing"],
    image_strategy: "family",
    status: "Active",
  },

  {
    chain_id: "DH-ATT-60-A1",
    chain_family: "attachment_roller",
    chain_number: "60A-A1",
    display_name: "60A-A1 ANSI Attachment Roller Chain",
    standard: "ANSI B29.1",
    pitch_in: "0.750",
    pitch_mm: "19.05",
    description: "ANSI 60 roller chain with A1 (extended tab, one side) attachments for 3/4\" pitch conveyor applications.",
    specs: {
      pitch_in: "0.750", pitch_mm: "19.05",
      attachment_type: "A1",
      attachment_side: "One side",
      avg_ultimate_lbs: "8500",
    },
    performance_tiers: [
      { tier: "standard", tensile_strength_lbs: "8500", working_load_lbs: "1700",
        source: "Donghua catalog p.71" },
    ],
    source_refs: [
      { manufacturer: "Donghua", code: "60A-1A1", confidence: "Confirmed",
        catalog_url: DH_CATALOG_URL, catalog_page: "71" },
      { manufacturer: "Allied-Locke", code: "60A1", confidence: "Confirmed" },
    ],
    attachments_available: [],
    attachment_configs: [
      { code: "A1", side: "one_side", spacing: "every_link" },
      { code: "A1-E2", side: "one_side", spacing: "every_2nd" },
      { code: "A1-SA1", side: "one_side", spacing: "every_link", description: "SA1 extended variant" },
    ],
    sprocket_series: "ANSI-60",
    materials_available: ["carbon_steel", "stainless_304"],
    options_upgrades: ["A2 variant", "K1/K2 variants", "Custom spacing"],
    image_strategy: "family",
    status: "Active",
  },

  {
    chain_id: "DH-ATT-80-A1",
    chain_family: "attachment_roller",
    chain_number: "80A-A1",
    display_name: "80A-A1 ANSI Attachment Roller Chain",
    standard: "ANSI B29.1",
    pitch_in: "1.000",
    pitch_mm: "25.40",
    description: "ANSI 80 roller chain with A1 attachments for 1\" pitch conveying. Standard for medium-duty pallet and parts conveying.",
    specs: {
      pitch_in: "1.000", pitch_mm: "25.40",
      attachment_type: "A1",
      attachment_side: "One side",
      avg_ultimate_lbs: "14500",
    },
    performance_tiers: [
      { tier: "standard", tensile_strength_lbs: "14500", working_load_lbs: "2900",
        source: "Donghua catalog p.72" },
    ],
    source_refs: [
      { manufacturer: "Donghua", code: "80A-1A1", confidence: "Confirmed",
        catalog_url: DH_CATALOG_URL, catalog_page: "72" },
      { manufacturer: "Allied-Locke", code: "80A1", confidence: "Confirmed" },
      { manufacturer: "Tsubaki", code: "80A1", confidence: "Confirmed" },
    ],
    attachments_available: [],
    attachment_configs: [
      { code: "A1", side: "one_side", spacing: "every_link" },
      { code: "A2", side: "one_side", spacing: "every_link" },
      { code: "K1", side: "one_side", spacing: "every_link" },
      { code: "K2", side: "both_sides", spacing: "every_link" },
      { code: "SA1", side: "one_side", spacing: "every_link", description: "Extended A1" },
    ],
    sprocket_series: "ANSI-80",
    materials_available: ["carbon_steel", "stainless_304"],
    options_upgrades: ["Custom attachment spacing", "Stainless with A1"],
    image_strategy: "family",
    status: "Active",
  },

  // ══════════════════════════════════════════════════════════════════
  // PHASE 3B — ENGINEERING CLASS BUSHED CONVEYOR CHAINS
  // Donghua catalog Section C, pp.129–168
  // These are the large-pitch engineered class chains used in
  // bulk material, mining, cement, and heavy industrial conveying.
  // ══════════════════════════════════════════════════════════════════

  {
    chain_id: "DH-ENG-M56",
    chain_family: "engineered_class",
    chain_number: "M56",
    display_name: "M56 Engineering Bushed Conveyor Chain",
    standard: "ISO / DIN 8167",
    pitch_in: "2.205",
    pitch_mm: "56.00",
    description: "M56 class engineering bushed conveyor chain — 56mm pitch. Heavy-duty construction for mining conveyors, cement plants, and bulk material handling. DIN 8167 / ISO compliant.",
    application_tags: ["mining", "cement", "bulk_material", "heavy_industrial"],
    specs: {
      pitch_mm: "56.00", pitch_in: "2.205",
      inner_width_mm: "35.0",
      pin_dia_mm: "14.0",
      plate_height_mm: "60.0",
      plate_thickness_mm: "8.0",
      avg_ultimate_lbs: "45000", max_working_load_lbs: "9000",
      weight_kg_m: "8.5",
    },
    performance_tiers: [
      { tier: "standard", tensile_strength_lbs: "45000", working_load_lbs: "9000",
        source: "Donghua catalog p.135", notes: "M56 bushed engineering class. DIN 8167 standard." },
    ],
    source_refs: [
      { manufacturer: "Donghua", code: "M56", confidence: "Confirmed",
        catalog_url: DH_CATALOG_URL, catalog_page: "135" },
      { manufacturer: "Rexnord", code: "M56", confidence: "Needs Review", notes: "Cross-ref requires verification" },
    ],
    attachments_available: ["ENG-A1", "ENG-K1", "ENG-FLIGHT", "ENG-SCRAPER"],
    sprocket_series: "ENG-M56",
    materials_available: ["carbon_steel", "carburized"],
    options_upgrades: ["Hardened pins", "Alloy steel plates"],
    image_strategy: "family",
    status: "Active",
  },

  {
    chain_id: "DH-ENG-M80",
    chain_family: "engineered_class",
    chain_number: "M80",
    display_name: "M80 Engineering Bushed Conveyor Chain",
    standard: "ISO / DIN 8167",
    pitch_in: "3.150",
    pitch_mm: "80.00",
    description: "M80 class engineering bushed conveyor chain — 80mm pitch. Heavy-duty bulk material conveying. Common in European quarry, sand, gravel, and aggregate plants.",
    application_tags: ["aggregate", "mining", "cement", "bulk_material"],
    specs: {
      pitch_mm: "80.00", pitch_in: "3.150",
      inner_width_mm: "50.0",
      pin_dia_mm: "20.0",
      plate_height_mm: "80.0",
      plate_thickness_mm: "10.0",
      avg_ultimate_lbs: "80000", max_working_load_lbs: "16000",
      weight_kg_m: "16.0",
    },
    performance_tiers: [
      { tier: "standard", tensile_strength_lbs: "80000", working_load_lbs: "16000",
        source: "Donghua catalog p.137", notes: "M80 bushed engineering class. DIN 8167." },
    ],
    source_refs: [
      { manufacturer: "Donghua", code: "M80", confidence: "Confirmed",
        catalog_url: DH_CATALOG_URL, catalog_page: "137" },
    ],
    attachments_available: ["ENG-A1", "ENG-K1", "ENG-FLIGHT", "ENG-SCRAPER"],
    sprocket_series: "ENG-M80",
    materials_available: ["carbon_steel", "carburized", "alloy_steel"],
    options_upgrades: ["With rollers (MR80)", "Alloy steel version"],
    image_strategy: "family",
    status: "Active",
  },

  {
    chain_id: "DH-ENG-M112",
    chain_family: "engineered_class",
    chain_number: "M112",
    display_name: "M112 Engineering Bushed Conveyor Chain",
    standard: "ISO / DIN 8167",
    pitch_in: "4.409",
    pitch_mm: "112.00",
    description: "M112 class heavy engineering bushed chain — 112mm pitch. Maximum-load bulk material conveying in heavy mining, cement production, and aggregate processing.",
    application_tags: ["mining", "cement", "heavy_industrial", "bulk_material"],
    specs: {
      pitch_mm: "112.00", pitch_in: "4.409",
      inner_width_mm: "70.0",
      pin_dia_mm: "28.0",
      plate_height_mm: "112.0",
      plate_thickness_mm: "14.0",
      avg_ultimate_lbs: "160000", max_working_load_lbs: "32000",
      weight_kg_m: "34.0",
    },
    performance_tiers: [
      { tier: "standard", tensile_strength_lbs: "160000", working_load_lbs: "32000",
        source: "Donghua catalog p.140", notes: "M112 — heavy engineering class. DIN 8167." },
    ],
    source_refs: [
      { manufacturer: "Donghua", code: "M112", confidence: "Confirmed",
        catalog_url: DH_CATALOG_URL, catalog_page: "140" },
    ],
    attachments_available: ["ENG-A1", "ENG-K1", "ENG-FLIGHT"],
    sprocket_series: "ENG-M112",
    materials_available: ["carbon_steel", "alloy_steel"],
    options_upgrades: ["With rollers", "Alloy steel"],
    image_strategy: "family",
    status: "Active",
  },

  {
    chain_id: "DH-ENG-P102F64",
    chain_family: "engineered_class",
    chain_number: "P102F64",
    display_name: "P102F64 Bulk Material Conveyor Chain",
    standard: "ASME B29.100 / Custom",
    pitch_in: "4.016",
    pitch_mm: "102.00",
    description: "P102F64 bulk material conveyor chain — 102mm pitch, 64mm face. Drop-forged sidebar construction. Used in cement, aggregate, and heavy mining en-masse drag conveyors.",
    application_tags: ["cement", "aggregate", "mining", "drag_conveyor", "bulk_material"],
    specs: {
      pitch_mm: "102.00", pitch_in: "4.016",
      face_width_mm: "64.0",
      pin_dia_mm: "22.0",
      plate_height_mm: "95.0",
      avg_ultimate_lbs: "110000", max_working_load_lbs: "22000",
      weight_kg_m: "22.0",
    },
    performance_tiers: [
      { tier: "standard", tensile_strength_lbs: "110000", working_load_lbs: "22000",
        source: "Donghua catalog p.148", notes: "P102F64 bulk conveyor. Drop-forged construction." },
    ],
    source_refs: [
      { manufacturer: "Donghua", code: "P102F64", confidence: "Confirmed",
        catalog_url: DH_CATALOG_URL, catalog_page: "148" },
    ],
    attachments_available: ["ENG-FLIGHT", "ENG-SCRAPER", "ENG-SA1"],
    sprocket_series: "ENG-P102",
    materials_available: ["carbon_steel", "alloy_steel"],
    options_upgrades: ["With rollers", "Hardened pins"],
    image_strategy: "family",
    status: "Active",
  },

  {
    chain_id: "DH-ENG-P142F78",
    chain_family: "engineered_class",
    chain_number: "P142F78",
    display_name: "P142F78 Heavy Bulk Conveyor Chain",
    standard: "ASME B29.100 / Custom",
    pitch_in: "5.591",
    pitch_mm: "142.00",
    description: "P142F78 heavy bulk material conveyor chain — 142mm pitch, 78mm face. Maximum-capacity drag and en-masse conveyors in mining, cement, and aggregate.",
    application_tags: ["mining", "cement", "bulk_material", "drag_conveyor"],
    specs: {
      pitch_mm: "142.00", pitch_in: "5.591",
      face_width_mm: "78.0",
      pin_dia_mm: "28.0",
      plate_height_mm: "118.0",
      avg_ultimate_lbs: "176000", max_working_load_lbs: "35200",
      weight_kg_m: "38.0",
    },
    performance_tiers: [
      { tier: "standard", tensile_strength_lbs: "176000", working_load_lbs: "35200",
        source: "Donghua catalog p.152", notes: "P142F78 heavy bulk conveyor." },
    ],
    source_refs: [
      { manufacturer: "Donghua", code: "P142F78", confidence: "Confirmed",
        catalog_url: DH_CATALOG_URL, catalog_page: "152" },
    ],
    attachments_available: ["ENG-FLIGHT", "ENG-SCRAPER"],
    sprocket_series: "ENG-P142",
    materials_available: ["carbon_steel", "alloy_steel"],
    options_upgrades: [],
    image_strategy: "family",
    status: "Active",
  },

  // ══════════════════════════════════════════════════════════════════
  // PHASE 3C — WELDED STEEL CHAINS (Donghua catalog section)
  // These are Donghua's welded steel offerings, distinct from the
  // Allied-Locke WH/WR series baseline already in the index.
  // Donghua codes preserved; merged where chain_id matches.
  // ══════════════════════════════════════════════════════════════════

  {
    chain_id: "DH-WS-102B",
    chain_family: "welded_steel",
    chain_number: "102B",
    display_name: "102B Welded Steel Bushed Chain",
    standard: "ASME B29.100",
    pitch_in: "4.016",
    pitch_mm: "102.00",
    description: "Donghua 102B welded steel bushed chain — 4\" pitch. Barrel-and-sidebar welded construction for bulk material elevators and drag conveyors.",
    specs: {
      pitch_mm: "102.00", pitch_in: "4.016",
      barrel_dia_mm: "38.0",
      sidebar_height_mm: "50.8",
      avg_ultimate_lbs: "45000", max_working_load_lbs: "9000",
      weight_kg_m: "12.5",
    },
    performance_tiers: [
      { tier: "standard", tensile_strength_lbs: "45000", working_load_lbs: "9000",
        source: "Donghua catalog p.158", notes: "102B welded steel — Donghua catalog confirmed." },
    ],
    source_refs: [
      { manufacturer: "Donghua", code: "102B", confidence: "Confirmed",
        catalog_url: DH_CATALOG_URL, catalog_page: "158" },
    ],
    attachments_available: ["WA-K1", "WA-A1", "WA-FLIGHT"],
    sprocket_series: "WS-102",
    materials_available: ["carbon_steel"],
    options_upgrades: ["With rollers (102BR)", "Induction hardened barrels"],
    image_strategy: "family",
    status: "Active",
  },

  {
    chain_id: "DH-WS-132B",
    chain_family: "welded_steel",
    chain_number: "132B",
    display_name: "132B Welded Steel Bushed Chain",
    standard: "ASME B29.100",
    pitch_in: "5.197",
    pitch_mm: "132.00",
    description: "Donghua 132B welded steel bushed chain — 5.2\" pitch. Heavy welded construction for high-load bulk material elevator and drag applications.",
    specs: {
      pitch_mm: "132.00", pitch_in: "5.197",
      barrel_dia_mm: "44.45",
      sidebar_height_mm: "63.5",
      avg_ultimate_lbs: "65000", max_working_load_lbs: "13000",
      weight_kg_m: "18.0",
    },
    performance_tiers: [
      { tier: "standard", tensile_strength_lbs: "65000", working_load_lbs: "13000",
        source: "Donghua catalog p.160", notes: "132B welded steel chain — Donghua catalog." },
    ],
    source_refs: [
      { manufacturer: "Donghua", code: "132B", confidence: "Confirmed",
        catalog_url: DH_CATALOG_URL, catalog_page: "160" },
    ],
    attachments_available: ["WA-K1", "WA-A1", "WA-FLIGHT"],
    sprocket_series: "WS-132",
    materials_available: ["carbon_steel"],
    options_upgrades: ["With rollers", "Induction hardened"],
    image_strategy: "family",
    status: "Active",
  },

  {
    chain_id: "DH-WS-160B",
    chain_family: "welded_steel",
    chain_number: "160B",
    display_name: "160B Welded Steel Bushed Chain",
    standard: "ASME B29.100",
    pitch_in: "6.299",
    pitch_mm: "160.00",
    description: "Donghua 160B heavy welded steel chain — 6.3\" pitch. For maximum capacity grain elevators and aggregate drag conveyors.",
    specs: {
      pitch_mm: "160.00", pitch_in: "6.299",
      barrel_dia_mm: "50.8",
      sidebar_height_mm: "76.2",
      avg_ultimate_lbs: "90000", max_working_load_lbs: "18000",
      weight_kg_m: "28.0",
    },
    performance_tiers: [
      { tier: "standard", tensile_strength_lbs: "90000", working_load_lbs: "18000",
        source: "Donghua catalog p.162", notes: "160B — largest standard welded steel pitch in DH catalog." },
    ],
    source_refs: [
      { manufacturer: "Donghua", code: "160B", confidence: "Confirmed",
        catalog_url: DH_CATALOG_URL, catalog_page: "162" },
    ],
    attachments_available: ["WA-K1", "WA-FLIGHT", "WA-SCRAPER"],
    sprocket_series: "WS-160",
    materials_available: ["carbon_steel"],
    options_upgrades: [],
    image_strategy: "family",
    status: "Active",
  },

  // ══════════════════════════════════════════════════════════════════
  // PHASE 3D — STEEL PINTLE CHAINS
  // Donghua catalog section — pintle chain series
  // ══════════════════════════════════════════════════════════════════

  {
    chain_id: "DH-PC-667",
    chain_family: "steel_pintle",
    chain_number: "667",
    display_name: "667 Steel Pintle Chain",
    standard: "ASME B29.6",
    pitch_in: "2.609",
    pitch_mm: "66.27",
    description: "667 steel pintle chain — standard pitch, single barrel construction. For agricultural conveyors, fertilizer spreaders, and light bulk material handling. Donghua confirmed.",
    specs: {
      pitch_in: "2.609", pitch_mm: "66.27",
      barrel_dia_in: "0.875",
      sidebar_height_in: "1.500",
      avg_ultimate_lbs: "14000", max_working_load_lbs: "2800",
      weight_lbs_ft: "2.8",
    },
    performance_tiers: [
      { tier: "standard", tensile_strength_lbs: "14000", working_load_lbs: "2800",
        source: "Donghua catalog p.165, ASME B29.6" },
    ],
    source_refs: [
      { manufacturer: "Donghua", code: "667", confidence: "Confirmed",
        catalog_url: DH_CATALOG_URL, catalog_page: "165" },
      { manufacturer: "Allied-Locke", code: "667", confidence: "Confirmed" },
      { manufacturer: "MAC Chain", code: "667", confidence: "Confirmed" },
    ],
    attachments_available: ["PC-A1", "PC-K1", "PC-SA1"],
    sprocket_series: "PC-667",
    materials_available: ["carbon_steel"],
    options_upgrades: ["667H Heavy", "667X Extended Life", "667XH Extra Heavy"],
    image_strategy: "family",
    status: "Active",
  },

  {
    chain_id: "DH-PC-667H",
    chain_family: "steel_pintle",
    chain_number: "667H",
    display_name: "667H Heavy Steel Pintle Chain",
    standard: "ASME B29.6",
    pitch_in: "2.609",
    pitch_mm: "66.27",
    description: "667H heavy series steel pintle chain. Heavier barrel and sidebar than standard 667. Higher working load for medium bulk material and agricultural applications.",
    specs: {
      pitch_in: "2.609", pitch_mm: "66.27",
      barrel_dia_in: "0.875",
      avg_ultimate_lbs: "18000", max_working_load_lbs: "3600",
    },
    performance_tiers: [
      { tier: "performance", tensile_strength_lbs: "18000", working_load_lbs: "3600",
        source: "Donghua catalog p.165, ASME B29.6", notes: "H suffix — heavier construction than 667." },
    ],
    source_refs: [
      { manufacturer: "Donghua", code: "667H", confidence: "Confirmed",
        catalog_url: DH_CATALOG_URL, catalog_page: "165" },
      { manufacturer: "Allied-Locke", code: "667H", confidence: "Confirmed" },
    ],
    attachments_available: ["PC-A1", "PC-K1"],
    sprocket_series: "PC-667",
    materials_available: ["carbon_steel"],
    options_upgrades: ["667XH extra heavy"],
    image_strategy: "family",
    status: "Active",
  },

  {
    chain_id: "DH-PC-667X",
    chain_family: "steel_pintle",
    chain_number: "667X",
    display_name: "667X Extended Life Steel Pintle Chain",
    standard: "ASME B29.6",
    pitch_in: "2.609",
    pitch_mm: "66.27",
    description: "667X extended-life steel pintle chain. Induction-hardened barrels, staked pins — designed for maximum service life in abrasive bulk material applications.",
    specs: {
      pitch_in: "2.609", pitch_mm: "66.27",
      barrel_dia_in: "0.875",
      avg_ultimate_lbs: "20000", max_working_load_lbs: "4000",
      barrel_treatment: "Induction hardened",
      pin_staking: "Quad-staked",
    },
    performance_tiers: [
      { tier: "premium", tensile_strength_lbs: "20000", working_load_lbs: "4000",
        source: "Donghua catalog p.166", notes: "667X — induction hardened barrels, extended life." },
    ],
    source_refs: [
      { manufacturer: "Donghua", code: "667X", confidence: "Confirmed",
        catalog_url: DH_CATALOG_URL, catalog_page: "166" },
      { manufacturer: "Allied-Locke", code: "667X", confidence: "Confirmed" },
    ],
    attachments_available: ["PC-A1", "PC-K1"],
    sprocket_series: "PC-667",
    materials_available: ["carbon_steel", "induction_hard"],
    options_upgrades: [],
    image_strategy: "family",
    status: "Active",
  },

  {
    chain_id: "DH-PC-88K",
    chain_family: "steel_pintle",
    chain_number: "88K",
    display_name: "88K Steel Pintle Chain",
    standard: "ASME B29.6",
    pitch_in: "2.609",
    pitch_mm: "66.27",
    description: "88K steel pintle chain — heavier barrel than 667 series. Common in fertilizer and lime spreading equipment.",
    specs: {
      pitch_in: "2.609", pitch_mm: "66.27",
      avg_ultimate_lbs: "16000", max_working_load_lbs: "3200",
    },
    performance_tiers: [
      { tier: "standard", tensile_strength_lbs: "16000", working_load_lbs: "3200",
        source: "Donghua catalog p.167, ASME B29.6" },
    ],
    source_refs: [
      { manufacturer: "Donghua", code: "88K", confidence: "Confirmed",
        catalog_url: DH_CATALOG_URL, catalog_page: "167" },
      { manufacturer: "Allied-Locke", code: "88K", confidence: "Confirmed" },
    ],
    attachments_available: ["PC-A1", "PC-K1", "PC-FLAP"],
    sprocket_series: "PC-88K",
    materials_available: ["carbon_steel"],
    options_upgrades: ["Induction hardened variant"],
    image_strategy: "family",
    status: "Active",
  },

  {
    chain_id: "DH-PC-102B-PINTLE",
    chain_family: "steel_pintle",
    chain_number: "102B-P",
    display_name: "102B Steel Pintle Chain",
    standard: "ASME B29.6",
    pitch_in: "4.016",
    pitch_mm: "102.00",
    description: "102B steel pintle chain — 4\" pitch. Heavy-duty for large agricultural conveyors, industrial spreading equipment, and grain handling.",
    specs: {
      pitch_in: "4.016", pitch_mm: "102.00",
      avg_ultimate_lbs: "32000", max_working_load_lbs: "6400",
    },
    performance_tiers: [
      { tier: "standard", tensile_strength_lbs: "32000", working_load_lbs: "6400",
        source: "Donghua catalog p.168, ASME B29.6" },
    ],
    source_refs: [
      { manufacturer: "Donghua", code: "102B", confidence: "Needs Review",
        catalog_url: DH_CATALOG_URL, catalog_page: "168",
        notes: "Verify: 102B appears in both welded steel and pintle sections — confirm correct classification" },
    ],
    attachments_available: ["PC-A1", "PC-K1"],
    sprocket_series: "PC-102",
    materials_available: ["carbon_steel"],
    options_upgrades: [],
    image_strategy: "family",
    status: "Pending Review",
  },

  // ══════════════════════════════════════════════════════════════════
  // PHASE 3E — AGRICULTURAL CONVEYOR CHAIN VARIANTS
  // Additional CA/S/F series not yet in normalized index
  // ══════════════════════════════════════════════════════════════════

  {
    chain_id: "CA550F2",
    chain_family: "agricultural_conveyor",
    chain_number: "CA550F2",
    display_name: "CA550F2 Agricultural Chain with F2 Attachment",
    standard: "ASME B29.200",
    pitch_in: "1.654",
    pitch_mm: "42.01",
    description: "CA550 agricultural chain with F2 flight attachments — bent-tab style for grain elevator legs and cross-rod mounting in agricultural conveyors.",
    specs: {
      pitch_in: "1.654", pitch_mm: "42.01",
      attachment_type: "F2",
      avg_ultimate_lbs: "17000", max_working_load_lbs: "3400",
    },
    performance_tiers: [
      { tier: "standard", tensile_strength_lbs: "17000", working_load_lbs: "3400",
        source: "Donghua catalog p.170, ASME B29.200" },
    ],
    source_refs: [
      { manufacturer: "Donghua", code: "CA550F2", confidence: "Confirmed",
        catalog_url: DH_CATALOG_URL, catalog_page: "170" },
    ],
    attachments_available: ["AGRI-F2", "AGRI-FLIGHT"],
    attachment_configs: [
      { code: "F2", side: "one_side", spacing: "every_2nd", description: "Bent flight tab for elevator legs" },
    ],
    sprocket_series: "CA550",
    materials_available: ["carbon_steel"],
    options_upgrades: [],
    image_strategy: "family",
    status: "Active",
  },

  {
    chain_id: "CA550V5",
    chain_family: "agricultural_conveyor",
    chain_number: "CA550V5",
    display_name: "CA550V5 Agricultural Chain with V5 Attachment",
    standard: "ASME B29.200",
    pitch_in: "1.654",
    pitch_mm: "42.01",
    description: "CA550 chain with V5 slat/conveyor attachments for horizontal grain conveyors and auger-fed agricultural equipment.",
    specs: {
      pitch_in: "1.654", pitch_mm: "42.01",
      attachment_type: "V5",
      avg_ultimate_lbs: "17000", max_working_load_lbs: "3400",
    },
    performance_tiers: [
      { tier: "standard", tensile_strength_lbs: "17000", working_load_lbs: "3400",
        source: "Donghua catalog p.171", notes: "V5 attachment — Needs Review: dimensions to be field-confirmed." },
    ],
    source_refs: [
      { manufacturer: "Donghua", code: "CA550V5", confidence: "Needs Review",
        catalog_url: DH_CATALOG_URL, catalog_page: "171",
        notes: "V5 slat attachment — verify tab geometry against field units" },
    ],
    attachments_available: ["AGRI-V5"],
    sprocket_series: "CA550",
    materials_available: ["carbon_steel"],
    options_upgrades: [],
    image_strategy: "family",
    status: "Pending Review",
  },

  {
    chain_id: "CA557V5",
    chain_family: "agricultural_conveyor",
    chain_number: "CA557V5",
    display_name: "CA557V5 Agricultural Chain with V5 Attachment",
    standard: "ASME B29.200",
    pitch_in: "1.654",
    pitch_mm: "42.01",
    description: "CA557 chain with V5 attachment — heavier construction than CA550V5 for high-throughput grain and forage handling.",
    specs: {
      pitch_in: "1.654", pitch_mm: "42.01",
      attachment_type: "V5",
      avg_ultimate_lbs: "19000", max_working_load_lbs: "3800",
    },
    performance_tiers: [
      { tier: "standard", tensile_strength_lbs: "19000", working_load_lbs: "3800",
        source: "Donghua catalog p.171", notes: "CA557 series with V5 attachment." },
    ],
    source_refs: [
      { manufacturer: "Donghua", code: "CA557V5", confidence: "Confirmed",
        catalog_url: DH_CATALOG_URL, catalog_page: "171" },
    ],
    attachments_available: ["AGRI-V5"],
    sprocket_series: "CA550",
    materials_available: ["carbon_steel"],
    options_upgrades: [],
    image_strategy: "family",
    status: "Active",
  },

  {
    chain_id: "S77V1",
    chain_family: "agricultural_conveyor",
    chain_number: "S77V1",
    display_name: "S77V1 Agricultural Chain with V1 Attachment",
    standard: "ASME B29.200",
    pitch_in: "2.031",
    pitch_mm: "51.59",
    description: "S77 detachable chain with V1 flight attachment for manure spreaders, bedding conveyors, and agricultural drag applications.",
    specs: {
      pitch_in: "2.031", pitch_mm: "51.59",
      attachment_type: "V1",
      avg_ultimate_lbs: "7700", max_working_load_lbs: "1540",
    },
    performance_tiers: [
      { tier: "standard", tensile_strength_lbs: "7700", working_load_lbs: "1540",
        source: "Donghua catalog p.177, ASME B29.200" },
    ],
    source_refs: [
      { manufacturer: "Donghua", code: "S77V1", confidence: "Confirmed",
        catalog_url: DH_CATALOG_URL, catalog_page: "177" },
    ],
    attachments_available: ["AGRI-V1", "AGRI-FLIGHT"],
    sprocket_series: "S77",
    materials_available: ["carbon_steel"],
    options_upgrades: [],
    image_strategy: "family",
    status: "Active",
  },

  {
    chain_id: "CA2060H-F5",
    chain_family: "agricultural_conveyor",
    chain_number: "CA2060HF5",
    display_name: "CA2060H with F5 Attachment — Double Pitch Agricultural",
    standard: "ASME B29.200 / ANSI B29.4",
    pitch_in: "1.500",
    pitch_mm: "38.10",
    description: "CA2060H double pitch heavy agricultural chain with F5 bent-tab flight attachments for grain elevator boot sections and long-span inclined conveyors.",
    specs: {
      pitch_in: "1.500", pitch_mm: "38.10",
      attachment_type: "F5",
      avg_ultimate_lbs: "10500", max_working_load_lbs: "2100",
    },
    performance_tiers: [
      { tier: "standard", tensile_strength_lbs: "10500", working_load_lbs: "2100",
        source: "Donghua catalog p.174" },
    ],
    source_refs: [
      { manufacturer: "Donghua", code: "CA2060HF5", confidence: "Confirmed",
        catalog_url: DH_CATALOG_URL, catalog_page: "174" },
    ],
    attachments_available: ["AGRI-F5"],
    sprocket_series: "C2060",
    materials_available: ["carbon_steel"],
    options_upgrades: [],
    image_strategy: "family",
    status: "Active",
  },

  // ══════════════════════════════════════════════════════════════════
  // PHASE 3F — SPECIALTY CONVEYOR CHAINS (en-masse, scraper)
  // Donghua-specific bulk conveyor chain series
  // ══════════════════════════════════════════════════════════════════

  {
    chain_id: "DH-EM-2609",
    chain_family: "drag_scraper",
    chain_number: "EM-2609",
    display_name: "2.609\" En-Masse Drag Conveyor Chain",
    standard: "ASME B29.100",
    pitch_in: "2.609",
    pitch_mm: "66.27",
    description: "2.609\" pitch en-masse drag conveyor chain (Donghua catalog). Solid barrel bushed construction with heavy flight attachments. Used in grain, fertilizer, and bulk chemical en-masse conveyors.",
    application_tags: ["grain_handling", "bulk_material", "drag_conveyor", "fertilizer"],
    specs: {
      pitch_in: "2.609", pitch_mm: "66.27",
      type: "En-masse drag",
      barrel_dia_in: "0.875",
      avg_ultimate_lbs: "18000", max_working_load_lbs: "3600",
      weight_lbs_ft: "4.5",
    },
    performance_tiers: [
      { tier: "standard", tensile_strength_lbs: "18000", working_load_lbs: "3600",
        source: "Donghua catalog p.155", notes: "En-masse drag chain configuration." },
    ],
    source_refs: [
      { manufacturer: "Donghua", code: "EM-2609", confidence: "Confirmed",
        catalog_url: DH_CATALOG_URL, catalog_page: "155" },
    ],
    attachments_available: ["ENG-FLIGHT-EN-MASSE", "ENG-SCRAPER", "ENG-K1"],
    sprocket_series: "ENG-78",
    materials_available: ["carbon_steel"],
    options_upgrades: ["Hardened pins", "Extended wear flights"],
    image_strategy: "family",
    status: "Active",
  },

  {
    chain_id: "DH-SCRAP-F6-102",
    chain_family: "drag_scraper",
    chain_number: "F6-P102",
    display_name: "F6 Scraper Chain — 102mm Pitch",
    standard: "Custom / Bulk Handling",
    pitch_in: "4.016",
    pitch_mm: "102.00",
    description: "F6 scraper conveyor chain — 102mm pitch with heavy double-bent flight attachments. For high-capacity scraper conveyors in cement, aggregate, and mining.",
    application_tags: ["cement", "aggregate", "mining", "scraper_conveyor", "bulk_material"],
    specs: {
      pitch_mm: "102.00", pitch_in: "4.016",
      type: "Scraper conveyor",
      flight_type: "F6 double-bent",
      avg_ultimate_lbs: "110000", max_working_load_lbs: "22000",
    },
    performance_tiers: [
      { tier: "standard", tensile_strength_lbs: "110000", working_load_lbs: "22000",
        source: "Donghua catalog p.156, scraper series" },
    ],
    source_refs: [
      { manufacturer: "Donghua", code: "F6-P102", confidence: "Confirmed",
        catalog_url: DH_CATALOG_URL, catalog_page: "156" },
    ],
    attachments_available: ["ENG-FLIGHT-F6", "ENG-SCRAPER-DOUBLE"],
    sprocket_series: "ENG-P102",
    materials_available: ["carbon_steel", "alloy_steel"],
    options_upgrades: [],
    image_strategy: "family",
    status: "Active",
  },

  // ══════════════════════════════════════════════════════════════════
  // PHASE 3G — BUCKET ELEVATOR CHAINS (Donghua-specific)
  // ══════════════════════════════════════════════════════════════════

  {
    chain_id: "DH-BEC-VC",
    chain_family: "bucket_elevator",
    chain_number: "VC",
    display_name: "VC Series Bucket Elevator Chain",
    standard: "Custom / Bucket Elevator",
    pitch_in: "varies",
    pitch_mm: "varies",
    description: "Donghua VC series bucket elevator chain. Continuous center-chain design for vertical bucket elevators in grain, cement, fertilizer, and bulk chemical handling.",
    application_tags: ["grain_handling", "cement", "bulk_material", "elevator"],
    specs: {
      type: "Bucket elevator center chain",
      pitch_range_mm: "50.8 - 160.0",
      construction: "Welded steel, center chain",
    },
    performance_tiers: [
      { tier: "standard", tensile_strength_lbs: "20000", working_load_lbs: "4000",
        source: "Donghua catalog p.183", notes: "VC series — working load varies by pitch. Specification varies by manufacturer." },
    ],
    source_refs: [
      { manufacturer: "Donghua", code: "VC", confidence: "Confirmed",
        catalog_url: DH_CATALOG_URL, catalog_page: "183" },
    ],
    attachments_available: ["ELEV-BUCKET-BOLT", "ELEV-BUCKET-A", "ELEV-BUCKET-B"],
    sprocket_series: "BEC-VC",
    materials_available: ["carbon_steel"],
    options_upgrades: ["Stainless for corrosive materials", "With plastic rollers"],
    image_strategy: "family",
    status: "Active",
  },

  {
    chain_id: "DH-BEC-FU-160",
    chain_family: "bucket_elevator",
    chain_number: "FU160",
    display_name: "FU160 Drag & Elevator Chain",
    standard: "Custom / Chinese Standard GB/T",
    pitch_in: "6.299",
    pitch_mm: "160.00",
    description: "FU160 scraper and elevator combination chain for grain hoppers, coal handling, and bulk material elevators. Chinese standard GB/T compatible, widely used in domestic grain handling systems.",
    application_tags: ["grain_handling", "bulk_material", "elevator", "coal"],
    specs: {
      pitch_mm: "160.00", pitch_in: "6.299",
      type: "Drag & bucket elevator",
      standard_ref: "GB/T 10074",
      avg_ultimate_lbs: "50000", max_working_load_lbs: "10000",
    },
    performance_tiers: [
      { tier: "standard", tensile_strength_lbs: "50000", working_load_lbs: "10000",
        source: "Donghua catalog p.185", notes: "FU160 — Chinese GB standard chain for grain elevator/drag systems." },
    ],
    source_refs: [
      { manufacturer: "Donghua", code: "FU160", confidence: "Confirmed",
        catalog_url: DH_CATALOG_URL, catalog_page: "185" },
    ],
    attachments_available: ["ELEV-BUCKET-FU", "FU-FLIGHT"],
    sprocket_series: "FU160",
    materials_available: ["carbon_steel"],
    options_upgrades: [],
    image_strategy: "family",
    status: "Active",
  },

  {
    chain_id: "DH-BEC-TH-102",
    chain_family: "bucket_elevator",
    chain_number: "TH102",
    display_name: "TH102 High-Speed Bucket Elevator Chain",
    standard: "Custom / Bucket Elevator",
    pitch_in: "4.016",
    pitch_mm: "102.00",
    description: "TH102 high-speed bucket elevator chain. Precision-ground, hardened components for high-speed grain elevators in ports and grain terminals. Smooth-running at speeds up to 3 m/s.",
    application_tags: ["grain_handling", "elevator", "bulk_material"],
    specs: {
      pitch_mm: "102.00", pitch_in: "4.016",
      type: "High-speed bucket elevator",
      max_speed_ms: "3.0",
      avg_ultimate_lbs: "72000", max_working_load_lbs: "14400",
    },
    performance_tiers: [
      { tier: "performance", tensile_strength_lbs: "72000", working_load_lbs: "14400",
        source: "Donghua catalog p.186", notes: "TH102 high-speed elevator — hardened components." },
    ],
    source_refs: [
      { manufacturer: "Donghua", code: "TH102", confidence: "Confirmed",
        catalog_url: DH_CATALOG_URL, catalog_page: "186" },
    ],
    attachments_available: ["ELEV-BUCKET-TH"],
    sprocket_series: "TH102",
    materials_available: ["carbon_steel", "induction_hard"],
    options_upgrades: ["Hardened pin version"],
    image_strategy: "family",
    status: "Active",
  },

  // ══════════════════════════════════════════════════════════════════
  // PHASE 3H — HOLLOW PIN CHAIN EXTENSIONS
  // Additional HP sizes and C-series hollow pin
  // ══════════════════════════════════════════════════════════════════

  {
    chain_id: "HP-100",
    chain_family: "hollow_pin",
    chain_number: "100HP",
    display_name: "100HP Hollow Pin Roller Chain",
    standard: "ANSI B29.1",
    pitch_in: "1.250",
    pitch_mm: "31.75",
    description: "1-1/4\" pitch hollow pin chain using #100 components. Higher load cross-rod and slat conveyor applications.",
    specs: {
      pitch_in: "1.250", pitch_mm: "31.75",
      roller_dia_in: "0.750", roller_width_in: "0.750",
      pin_dia_in: "0.469",
      avg_ultimate_lbs: "24000", max_working_load_lbs: "4800",
    },
    performance_tiers: [
      { tier: "standard", tensile_strength_lbs: "24000", working_load_lbs: "4800",
        source: "Donghua catalog p.67, ANSI B29.1" },
    ],
    source_refs: [
      { manufacturer: "Donghua", code: "100HP", confidence: "Confirmed",
        catalog_url: DH_CATALOG_URL, catalog_page: "67" },
      { manufacturer: "Tsubaki", code: "100HP", confidence: "Confirmed" },
    ],
    attachments_available: [],
    sprocket_series: "ANSI-100",
    materials_available: ["carbon_steel", "stainless_304"],
    options_upgrades: [],
    image_strategy: "family",
    status: "Active",
  },

  {
    chain_id: "HP-C2060",
    chain_family: "hollow_pin",
    chain_number: "C2060HP",
    display_name: "C2060HP Double Pitch Hollow Pin Chain",
    standard: "ANSI B29.4",
    pitch_in: "1.500",
    pitch_mm: "38.10",
    description: "C2060H double pitch hollow pin chain — economy hollow pin for long spans in conveyor systems. Pin is hollow to accept cross-rods or special attachments.",
    specs: {
      pitch_in: "1.500", pitch_mm: "38.10",
      roller_dia_in: "0.469", roller_width_in: "0.500",
      pin_dia_in: "0.280",
      avg_ultimate_lbs: "8500", max_working_load_lbs: "1700",
    },
    performance_tiers: [
      { tier: "standard", tensile_strength_lbs: "8500", working_load_lbs: "1700",
        source: "Donghua catalog p.68, ANSI B29.4" },
    ],
    source_refs: [
      { manufacturer: "Donghua", code: "C2060HP", confidence: "Confirmed",
        catalog_url: DH_CATALOG_URL, catalog_page: "68" },
      { manufacturer: "Allied-Locke", code: "C2060HP", confidence: "Confirmed" },
    ],
    attachments_available: [],
    sprocket_series: "C2060",
    materials_available: ["carbon_steel", "stainless_304"],
    options_upgrades: [],
    image_strategy: "family",
    status: "Active",
  },

  {
    chain_id: "HP-C2080",
    chain_family: "hollow_pin",
    chain_number: "C2080HP",
    display_name: "C2080HP Double Pitch Hollow Pin Chain",
    standard: "ANSI B29.4",
    pitch_in: "2.000",
    pitch_mm: "50.80",
    description: "C2080 double pitch hollow pin chain for medium-load cross-rod and slat conveyor applications.",
    specs: {
      pitch_in: "2.000", pitch_mm: "50.80",
      roller_dia_in: "0.625", roller_width_in: "0.625",
      avg_ultimate_lbs: "14500", max_working_load_lbs: "2900",
    },
    performance_tiers: [
      { tier: "standard", tensile_strength_lbs: "14500", working_load_lbs: "2900",
        source: "Donghua catalog p.69, ANSI B29.4" },
    ],
    source_refs: [
      { manufacturer: "Donghua", code: "C2080HP", confidence: "Confirmed",
        catalog_url: DH_CATALOG_URL, catalog_page: "69" },
    ],
    attachments_available: [],
    sprocket_series: "C2080",
    materials_available: ["carbon_steel"],
    options_upgrades: [],
    image_strategy: "family",
    status: "Active",
  },

  // ══════════════════════════════════════════════════════════════════
  // PHASE 3I — DOUBLE PITCH ATTACHMENT CHAIN EXTENSIONS
  // ══════════════════════════════════════════════════════════════════

  {
    chain_id: "C2060H-ATT",
    chain_family: "attachment_roller",
    chain_number: "C2060H-A1",
    display_name: "C2060H Attachment Double Pitch Chain",
    standard: "ANSI B29.4",
    pitch_in: "1.500",
    pitch_mm: "38.10",
    description: "C2060H heavy double pitch chain with A1 or K1 attachments. For pallet conveying, parts accumulation, and case handling on long-span systems.",
    specs: {
      pitch_in: "1.500", pitch_mm: "38.10",
      attachment_type: "A1 / K1",
      avg_ultimate_lbs: "9200", max_working_load_lbs: "2000",
    },
    performance_tiers: [
      { tier: "standard", tensile_strength_lbs: "9200", working_load_lbs: "2000",
        source: "Donghua catalog p.94, ANSI B29.4" },
    ],
    source_refs: [
      { manufacturer: "Donghua", code: "C2060HA1", confidence: "Confirmed",
        catalog_url: DH_CATALOG_URL, catalog_page: "94" },
      { manufacturer: "Allied-Locke", code: "C2060HA1", confidence: "Confirmed" },
    ],
    attachments_available: [],
    attachment_configs: [
      { code: "A1", side: "one_side", spacing: "every_link" },
      { code: "A2", side: "one_side", spacing: "every_link" },
      { code: "K1", side: "one_side", spacing: "every_link" },
      { code: "K2", side: "both_sides", spacing: "every_link" },
      { code: "SA1", side: "one_side", spacing: "every_link" },
    ],
    sprocket_series: "C2060",
    materials_available: ["carbon_steel", "stainless_304"],
    options_upgrades: ["Walk-on-Rail version", "Custom spacing E2/E3/E4"],
    image_strategy: "family",
    status: "Active",
  },

  {
    chain_id: "C2080H-ATT",
    chain_family: "attachment_roller",
    chain_number: "C2080H-A1",
    display_name: "C2080H Attachment Double Pitch Chain",
    standard: "ANSI B29.4",
    pitch_in: "2.000",
    pitch_mm: "50.80",
    description: "C2080H heavy double pitch chain with attachments for heavy-duty case conveying and pallet transfer systems.",
    specs: {
      pitch_in: "2.000", pitch_mm: "50.80",
      attachment_type: "A1 / K1",
      avg_ultimate_lbs: "15600", max_working_load_lbs: "3600",
    },
    performance_tiers: [
      { tier: "standard", tensile_strength_lbs: "15600", working_load_lbs: "3600",
        source: "Donghua catalog p.95" },
    ],
    source_refs: [
      { manufacturer: "Donghua", code: "C2080HA1", confidence: "Confirmed",
        catalog_url: DH_CATALOG_URL, catalog_page: "95" },
    ],
    attachments_available: [],
    attachment_configs: [
      { code: "A1", side: "one_side", spacing: "every_link" },
      { code: "K1", side: "one_side", spacing: "every_link" },
      { code: "K2", side: "both_sides", spacing: "every_link" },
    ],
    sprocket_series: "C2080",
    materials_available: ["carbon_steel"],
    options_upgrades: ["Large roller option"],
    image_strategy: "family",
    status: "Active",
  },

  // ══════════════════════════════════════════════════════════════════
  // PHASE 3J — CONNECTING LINKS & OFFSET LINKS
  // Normalized accessory records — source-traced to Donghua catalog
  // ══════════════════════════════════════════════════════════════════

  {
    chain_id: "DH-LINK-CONN-40",
    chain_family: "specialty_custom",
    chain_number: "CL-40",
    display_name: "No.40 Connecting Link (Spring Clip)",
    standard: "ANSI B29.1",
    pitch_in: "0.500",
    pitch_mm: "12.70",
    description: "Connecting link for ANSI 40 roller chain — spring clip (open) type. Donghua catalog confirmed. Standard assembly/disassembly joining link.",
    specs: {
      pitch_in: "0.500", chain_no: "40",
      link_type: "Spring clip (open)",
      max_load_lbs: "740",
    },
    performance_tiers: [
      { tier: "standard", tensile_strength_lbs: "3700", working_load_lbs: "740",
        source: "Donghua catalog p.279", notes: "Connecting link — not for cyclic loading beyond 40% of chain working load." },
    ],
    source_refs: [
      { manufacturer: "Donghua", code: "CL-40", confidence: "Confirmed",
        catalog_url: DH_CATALOG_URL, catalog_page: "279" },
    ],
    attachments_available: [],
    sprocket_series: "ANSI-40",
    materials_available: ["carbon_steel", "stainless_304"],
    options_upgrades: ["Cotter pin type (CLP-40)"],
    image_strategy: "family",
    status: "Active",
  },

  {
    chain_id: "DH-LINK-CONN-60",
    chain_family: "specialty_custom",
    chain_number: "CL-60",
    display_name: "No.60 Connecting Link",
    standard: "ANSI B29.1",
    pitch_in: "0.750",
    pitch_mm: "19.05",
    description: "Connecting link for ANSI 60 roller chain — spring clip type. Standard joining link.",
    specs: { pitch_in: "0.750", chain_no: "60", link_type: "Spring clip", max_load_lbs: "1700" },
    performance_tiers: [
      { tier: "standard", tensile_strength_lbs: "8500", working_load_lbs: "1700",
        source: "Donghua catalog p.280" },
    ],
    source_refs: [
      { manufacturer: "Donghua", code: "CL-60", confidence: "Confirmed",
        catalog_url: DH_CATALOG_URL, catalog_page: "280" },
    ],
    attachments_available: [],
    sprocket_series: "ANSI-60",
    materials_available: ["carbon_steel", "stainless_304"],
    options_upgrades: ["Cotter pin type"],
    image_strategy: "family",
    status: "Active",
  },

  {
    chain_id: "DH-LINK-CONN-80",
    chain_family: "specialty_custom",
    chain_number: "CL-80",
    display_name: "No.80 Connecting Link",
    standard: "ANSI B29.1",
    pitch_in: "1.000",
    pitch_mm: "25.40",
    description: "Connecting link for ANSI 80 roller chain. Spring clip or cotter pin type available.",
    specs: { pitch_in: "1.000", chain_no: "80", link_type: "Spring clip / Cotter pin", max_load_lbs: "2900" },
    performance_tiers: [
      { tier: "standard", tensile_strength_lbs: "14500", working_load_lbs: "2900",
        source: "Donghua catalog p.280" },
    ],
    source_refs: [
      { manufacturer: "Donghua", code: "CL-80", confidence: "Confirmed",
        catalog_url: DH_CATALOG_URL, catalog_page: "280" },
    ],
    attachments_available: [],
    sprocket_series: "ANSI-80",
    materials_available: ["carbon_steel", "stainless_304"],
    options_upgrades: [],
    image_strategy: "family",
    status: "Active",
  },

  {
    chain_id: "DH-LINK-OFFSET-40",
    chain_family: "specialty_custom",
    chain_number: "OL-40",
    display_name: "No.40 Offset Link (Half Link)",
    standard: "ANSI B29.1",
    pitch_in: "0.500",
    pitch_mm: "12.70",
    description: "Offset link (half link) for ANSI 40 chain — allows odd-number chain lengths. Use sparingly as offset links reduce chain strength.",
    specs: { pitch_in: "0.500", chain_no: "40", link_type: "Offset (half link)", strength_factor: "~75% of chain tensile" },
    performance_tiers: [
      { tier: "standard", tensile_strength_lbs: "2775", working_load_lbs: "555",
        source: "Donghua catalog p.279", notes: "Offset link — approx 75% of chain tensile strength. Use sparingly." },
    ],
    source_refs: [
      { manufacturer: "Donghua", code: "OL-40", confidence: "Confirmed",
        catalog_url: DH_CATALOG_URL, catalog_page: "279" },
    ],
    attachments_available: [],
    sprocket_series: "ANSI-40",
    materials_available: ["carbon_steel"],
    options_upgrades: [],
    image_strategy: "family",
    status: "Active",
  },

  {
    chain_id: "DH-LINK-OFFSET-80",
    chain_family: "specialty_custom",
    chain_number: "OL-80",
    display_name: "No.80 Offset Link (Half Link)",
    standard: "ANSI B29.1",
    pitch_in: "1.000",
    pitch_mm: "25.40",
    description: "Offset link for ANSI 80 chain. Allows odd-number chain lengths. Reduced tensile — use only where necessary.",
    specs: { pitch_in: "1.000", chain_no: "80", link_type: "Offset (half link)", strength_factor: "~75% of chain tensile" },
    performance_tiers: [
      { tier: "standard", tensile_strength_lbs: "10875", working_load_lbs: "2175",
        source: "Donghua catalog p.281", notes: "Offset link — 75% of chain tensile." },
    ],
    source_refs: [
      { manufacturer: "Donghua", code: "OL-80", confidence: "Confirmed",
        catalog_url: DH_CATALOG_URL, catalog_page: "281" },
    ],
    attachments_available: [],
    sprocket_series: "ANSI-80",
    materials_available: ["carbon_steel"],
    options_upgrades: [],
    image_strategy: "family",
    status: "Active",
  },

  // ══════════════════════════════════════════════════════════════════
  // PHASE 3K — CORROSION-RESISTANT VARIANTS
  // Zinc-plated, nickel-plated, dacromet — Donghua specific series
  // ══════════════════════════════════════════════════════════════════

  {
    chain_id: "DH-ZP-40",
    chain_family: "performance_roller",
    chain_number: "40A-ZP",
    display_name: "40A Zinc-Plated Roller Chain",
    standard: "ANSI B29.1",
    pitch_in: "0.500",
    pitch_mm: "12.70",
    description: "Donghua ANSI 40 zinc-plated roller chain. Moderate corrosion resistance for outdoor storage conveyors, farm equipment, and general industrial applications. RoHS compliant.",
    specs: { pitch_in: "0.500", pitch_mm: "12.70", coating: "Zinc plated", avg_ultimate_lbs: "3600" },
    performance_tiers: [
      { tier: "standard", tensile_strength_lbs: "3600", working_load_lbs: "720",
        source: "Donghua catalog p.54", notes: "Zinc plated. Salt spray >200 hrs. Approx 5% tensile reduction vs carbon steel. Specification varies by manufacturer." },
    ],
    source_refs: [
      { manufacturer: "Donghua", code: "40A-1ZP", confidence: "Confirmed",
        catalog_url: DH_CATALOG_URL, catalog_page: "54" },
    ],
    attachments_available: [],
    sprocket_series: "ANSI-40",
    materials_available: ["zinc_plated"],
    options_upgrades: ["Nickel plated upgrade", "Dacromet upgrade"],
    image_strategy: "family",
    status: "Active",
  },

  {
    chain_id: "DH-NP-40",
    chain_family: "performance_roller",
    chain_number: "40A-NP",
    display_name: "40A Nickel-Plated Roller Chain",
    standard: "ANSI B29.1",
    pitch_in: "0.500",
    pitch_mm: "12.70",
    description: "Donghua ANSI 40 nickel-plated roller chain. Improved corrosion resistance over zinc. Bright finish for food-adjacent and packaging applications.",
    specs: { pitch_in: "0.500", pitch_mm: "12.70", coating: "Nickel plated", avg_ultimate_lbs: "3700" },
    performance_tiers: [
      { tier: "standard", tensile_strength_lbs: "3700", working_load_lbs: "740",
        source: "Donghua catalog p.57", notes: "Nickel plated. Near-standard tensile strength. Specification varies by manufacturer." },
    ],
    source_refs: [
      { manufacturer: "Donghua", code: "40A-1NP", confidence: "Confirmed",
        catalog_url: DH_CATALOG_URL, catalog_page: "57" },
    ],
    attachments_available: [],
    sprocket_series: "ANSI-40",
    materials_available: ["nickel_plated"],
    options_upgrades: ["Stainless steel upgrade for washdown"],
    image_strategy: "family",
    status: "Active",
  },

  {
    chain_id: "DH-NP-80",
    chain_family: "performance_roller",
    chain_number: "80A-NP",
    display_name: "80A Nickel-Plated Roller Chain",
    standard: "ANSI B29.1",
    pitch_in: "1.000",
    pitch_mm: "25.40",
    description: "Donghua ANSI 80 nickel-plated chain. Enhanced corrosion resistance, near-standard tensile.",
    specs: { pitch_in: "1.000", pitch_mm: "25.40", coating: "Nickel plated", avg_ultimate_lbs: "14500" },
    performance_tiers: [
      { tier: "standard", tensile_strength_lbs: "14500", working_load_lbs: "2900",
        source: "Donghua catalog p.58", notes: "Nickel plated 80. Specification varies by manufacturer." },
    ],
    source_refs: [
      { manufacturer: "Donghua", code: "80A-1NP", confidence: "Confirmed",
        catalog_url: DH_CATALOG_URL, catalog_page: "58" },
    ],
    attachments_available: [],
    sprocket_series: "ANSI-80",
    materials_available: ["nickel_plated"],
    options_upgrades: [],
    image_strategy: "family",
    status: "Active",
  },

  {
    chain_id: "DH-DAC-60",
    chain_family: "performance_roller",
    chain_number: "60A-DAC",
    display_name: "60A Dacromet-Coated Roller Chain",
    standard: "ANSI B29.1",
    pitch_in: "0.750",
    pitch_mm: "19.05",
    description: "Donghua ANSI 60 Dacromet-coated chain. Excellent salt spray resistance (>500 hrs). RoHS compliant. No hydrogen embrittlement risk. Used in marine, outdoor, and high-humidity environments.",
    specs: { pitch_in: "0.750", pitch_mm: "19.05", coating: "Dacromet", salt_spray_hrs: ">500", avg_ultimate_lbs: "8500" },
    performance_tiers: [
      { tier: "standard", tensile_strength_lbs: "8500", working_load_lbs: "1700",
        source: "Donghua catalog p.61", notes: "Dacromet coating — RoHS, no H embrittlement. Specification varies by manufacturer." },
    ],
    source_refs: [
      { manufacturer: "Donghua", code: "60A-1DAC", confidence: "Confirmed",
        catalog_url: DH_CATALOG_URL, catalog_page: "61" },
    ],
    attachments_available: [],
    sprocket_series: "ANSI-60",
    materials_available: ["dacromet"],
    options_upgrades: [],
    image_strategy: "family",
    status: "Active",
  },

  // ══════════════════════════════════════════════════════════════════
  // PHASE 3L — SH SERIES (High Strength Heavy Duty)
  // Donghua premium series — SP construction + heavy duty plates
  // ══════════════════════════════════════════════════════════════════

  {
    chain_id: "DH-SH-60",
    chain_family: "performance_roller",
    chain_number: "60SH",
    display_name: "60SH Donghua High Strength Heavy Duty Chain",
    standard: "ANSI B29.1",
    pitch_in: "0.750",
    pitch_mm: "19.05",
    description: "Donghua SH Series 3/4\" chain — shot peened (SP processing) + heavy duty sidebar plates. Premium fatigue resistance plus higher tensile than standard. Best-in-class Donghua performance chain.",
    specs: { pitch_in: "0.750", pitch_mm: "19.05", avg_ultimate_lbs: "12000" },
    performance_tiers: [
      { tier: "premium", tensile_strength_lbs: "12000", working_load_lbs: "2400",
        source: "Donghua SH Series catalog p.45",
        notes: "SH = SP shot peening + Heavy duty plates. 40-50% higher fatigue vs standard ANSI 60." },
    ],
    source_refs: [
      { manufacturer: "Donghua", code: "60ASH-1", confidence: "Confirmed",
        catalog_url: DH_CATALOG_URL, catalog_page: "45" },
    ],
    attachments_available: ["A1", "A2", "K1", "K2"],
    sprocket_series: "ANSI-60",
    materials_available: ["carbon_steel"],
    options_upgrades: [],
    image_strategy: "family",
    status: "Active",
  },

  {
    chain_id: "DH-SH-80",
    chain_family: "performance_roller",
    chain_number: "80SH",
    display_name: "80SH Donghua High Strength Heavy Duty Chain",
    standard: "ANSI B29.1",
    pitch_in: "1.000",
    pitch_mm: "25.40",
    description: "Donghua SH Series 1\" chain — SP + heavy duty. Maximum performance ANSI-interchangeable roller chain for high-cycle, high-load drives.",
    specs: { pitch_in: "1.000", pitch_mm: "25.40", avg_ultimate_lbs: "22000" },
    performance_tiers: [
      { tier: "premium", tensile_strength_lbs: "22000", working_load_lbs: "4400",
        source: "Donghua SH Series catalog p.46",
        notes: "SH series — best Donghua performance tier. 40-50% higher fatigue than standard ANSI 80." },
    ],
    source_refs: [
      { manufacturer: "Donghua", code: "80ASH-1", confidence: "Confirmed",
        catalog_url: DH_CATALOG_URL, catalog_page: "46" },
    ],
    attachments_available: ["A1", "A2", "K1", "K2"],
    sprocket_series: "ANSI-80",
    materials_available: ["carbon_steel"],
    options_upgrades: [],
    image_strategy: "family",
    status: "Active",
  },

  {
    chain_id: "DH-SH-100",
    chain_family: "performance_roller",
    chain_number: "100SH",
    display_name: "100SH Donghua High Strength Heavy Duty Chain",
    standard: "ANSI B29.1",
    pitch_in: "1.250",
    pitch_mm: "31.75",
    description: "Donghua SH Series 1-1/4\" chain — shot peened + heavy duty. Premium fatigue rated for high-cycle drives.",
    specs: { pitch_in: "1.250", pitch_mm: "31.75", avg_ultimate_lbs: "36000" },
    performance_tiers: [
      { tier: "premium", tensile_strength_lbs: "36000", working_load_lbs: "7200",
        source: "Donghua SH Series catalog p.47" },
    ],
    source_refs: [
      { manufacturer: "Donghua", code: "100ASH-1", confidence: "Confirmed",
        catalog_url: DH_CATALOG_URL, catalog_page: "47" },
    ],
    attachments_available: ["A1", "A2", "K1", "K2"],
    sprocket_series: "ANSI-100",
    materials_available: ["carbon_steel"],
    options_upgrades: [],
    image_strategy: "family",
    status: "Active",
  },

  // ══════════════════════════════════════════════════════════════════
  // PHASE 3M — ADDITIONAL LEAF CHAIN SIZES
  // Remaining Donghua LH/BL series not yet in normalized index
  // ══════════════════════════════════════════════════════════════════

  {
    chain_id: "AL1266",
    chain_family: "leaf_chain",
    chain_number: "AL1266",
    display_name: "AL1266 Leaf Chain",
    standard: "ANSI/ASME B29.8",
    pitch_in: "0.750",
    pitch_mm: "19.05",
    description: "AL series 3/4\" pitch leaf chain, 12-wide × 66 lacing. Heavy-duty forklift mast applications.",
    specs: { pitch_in: "0.750", pitch_mm: "19.05", lacing: "6×6", avg_ultimate_lbs: "86000", max_working_load_lbs: "17200" },
    performance_tiers: [
      { tier: "standard", tensile_strength_lbs: "86000", working_load_lbs: "17200",
        source: "Donghua catalog p.225, ANSI B29.8" },
    ],
    source_refs: [
      { manufacturer: "Donghua", code: "LH1266", confidence: "Confirmed",
        catalog_url: DH_CATALOG_URL, catalog_page: "225" },
      { manufacturer: "Iwis", code: "LH1266", confidence: "Confirmed" },
    ],
    attachments_available: [],
    sprocket_series: null,
    materials_available: ["carbon_steel"],
    options_upgrades: ["Shot peened"],
    image_strategy: "family",
    status: "Active",
  },

  {
    chain_id: "BL2034",
    chain_family: "leaf_chain",
    chain_number: "BL2034",
    display_name: "BL2034 Leaf Chain",
    standard: "ANSI/ASME B29.8",
    pitch_in: "1.250",
    pitch_mm: "31.75",
    description: "BL series 1-1/4\" pitch leaf chain, 20-wide × 34 lacing for very heavy industrial hoists.",
    specs: { pitch_in: "1.250", pitch_mm: "31.75", lacing: "10×34", avg_ultimate_lbs: "190000", max_working_load_lbs: "38000" },
    performance_tiers: [
      { tier: "standard", tensile_strength_lbs: "190000", working_load_lbs: "38000",
        source: "Donghua catalog p.234, ANSI B29.8" },
    ],
    source_refs: [
      { manufacturer: "Donghua", code: "BL2034", confidence: "Confirmed",
        catalog_url: DH_CATALOG_URL, catalog_page: "234" },
    ],
    attachments_available: [],
    sprocket_series: null,
    materials_available: ["carbon_steel"],
    options_upgrades: [],
    image_strategy: "family",
    status: "Active",
  },

  {
    chain_id: "BL2046",
    chain_family: "leaf_chain",
    chain_number: "BL2046",
    display_name: "BL2046 Leaf Chain",
    standard: "ANSI/ASME B29.8",
    pitch_in: "1.250",
    pitch_mm: "31.75",
    description: "BL series 1-1/4\" pitch heavy leaf chain, 20-wide × 46 lacing. Maximum load heavy industrial hoist.",
    specs: { pitch_in: "1.250", pitch_mm: "31.75", lacing: "10×46", avg_ultimate_lbs: "250000", max_working_load_lbs: "50000" },
    performance_tiers: [
      { tier: "standard", tensile_strength_lbs: "250000", working_load_lbs: "50000",
        source: "Donghua catalog p.235, ANSI B29.8" },
    ],
    source_refs: [
      { manufacturer: "Donghua", code: "BL2046", confidence: "Confirmed",
        catalog_url: DH_CATALOG_URL, catalog_page: "235" },
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
  DH_DEEP_MERGE_REFS,
  DH_DEEP_NEW_CHAINS,
};