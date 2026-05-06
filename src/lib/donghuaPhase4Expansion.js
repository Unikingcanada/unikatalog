/**
 * donghuaPhase4Expansion.js
 *
 * PHASE 4 — Donghua Structured Deep Catalog Expansion
 * Source: http://en.dhchain.com/wp-content/uploads/2020/11/2020111706240075.pdf
 * Import Date: 2026-05-06
 *
 * ADDITIVE — no duplication of Phases 1–3 (donghuaNormalizedChains.js, donghuaDeepExpansion.js)
 *
 * COVERS:
 *   Phase 4A  — Welded Drag Chains: WR, WD series (ASME B29.100 drag/mill chain)
 *   Phase 4B  — Engineered Class: additional WH/81X bushed series (kiln, cement, drag)
 *   Phase 4C  — Conveyor Roller Chains (Section B: DH catalog pp.73–128)
 *   Phase 4D  — Overhead Conveyor Chains (I-beam, free-flow, power & free)
 *   Phase 4E  — Multi-Strand Variants (2-strand, 3-strand ANSI/BS)
 *   Phase 4F  — Cottered-Type Short-Pitch Chains (A-series cottered)
 *   Phase 4G  — Full Attachment Geometry Library
 *               (SA, W, WA, extended-pin, U-shaped, apron configurations)
 *   Phase 4H  — Sprocket Compatibility Map (DH tooth ranges, bore styles, materials)
 *   Phase 4I  — Stainless BS/ISO Chain Variants
 *   Phase 4J  — Connecting Links (BS sizes, heavy-series, cottered)
 *   Phase 4K  — Additional Agricultural Chains (F series, CA620 variants)
 *   Phase 4L  — Downloads / Technical Drawing References
 *   Phase 4M  — Merge Refs (adding DH source to existing normalized entries)
 *
 * CONFIDENCE POLICY:
 *   Confirmed    = page/table directly mapped from catalog
 *   Needs Review = cross-ref inferred or catalog page range only
 */

const DH_CATALOG_URL = "http://en.dhchain.com/wp-content/uploads/2020/11/2020111706240075.pdf";

// ─── PHASE 4 MERGE REFS ────────────────────────────────────────────────────────
// Patches Donghua as a confirmed source onto already-normalized chain_ids
// that weren't covered in Phases 1–3 merge refs.

export const DH_PHASE4_MERGE_REFS = [
  // ── Multi-strand standard chains ──
  { chain_id: "ANSI-40",  code: "40A-2",    confidence: "Confirmed", catalog_page: "17", notes: "Double strand ANSI 40" },
  { chain_id: "ANSI-40",  code: "40A-3",    confidence: "Confirmed", catalog_page: "17", notes: "Triple strand ANSI 40" },
  { chain_id: "ANSI-60",  code: "60A-2",    confidence: "Confirmed", catalog_page: "19", notes: "Double strand ANSI 60" },
  { chain_id: "ANSI-60",  code: "60A-3",    confidence: "Confirmed", catalog_page: "19", notes: "Triple strand ANSI 60" },
  { chain_id: "ANSI-80",  code: "80A-2",    confidence: "Confirmed", catalog_page: "20", notes: "Double strand ANSI 80" },
  { chain_id: "ANSI-80",  code: "80A-3",    confidence: "Confirmed", catalog_page: "20", notes: "Triple strand ANSI 80" },
  { chain_id: "ANSI-100", code: "100A-2",   confidence: "Confirmed", catalog_page: "21", notes: "Double strand ANSI 100" },
  { chain_id: "ANSI-120", code: "120A-2",   confidence: "Confirmed", catalog_page: "21", notes: "Double strand ANSI 120" },
  // ── BS multi-strand ──
  { chain_id: "BS-08B",   code: "08B-2",    confidence: "Confirmed", catalog_page: "31", notes: "Double strand BS 08B" },
  { chain_id: "BS-08B",   code: "08B-3",    confidence: "Confirmed", catalog_page: "31", notes: "Triple strand BS 08B" },
  { chain_id: "BS-16B",   code: "16B-2",    confidence: "Confirmed", catalog_page: "32", notes: "Double strand BS 16B" },
  { chain_id: "BS-16B",   code: "16B-3",    confidence: "Confirmed", catalog_page: "32", notes: "Triple strand BS 16B" },
  { chain_id: "BS-20B",   code: "20B-2",    confidence: "Confirmed", catalog_page: "33", notes: "Double strand BS 20B" },
  { chain_id: "BS-24B",   code: "24B-2",    confidence: "Confirmed", catalog_page: "33", notes: "Double strand BS 24B" },
  // ── Cottered type confirmations ──
  { chain_id: "ANSI-80",  code: "80AC-1",   confidence: "Confirmed", catalog_page: "26", notes: "Cottered type ANSI 80" },
  { chain_id: "ANSI-100", code: "100AC-1",  confidence: "Confirmed", catalog_page: "27", notes: "Cottered type ANSI 100" },
  { chain_id: "ANSI-120", code: "120AC-1",  confidence: "Confirmed", catalog_page: "27", notes: "Cottered type ANSI 120" },
  { chain_id: "ANSI-140", code: "140AC-1",  confidence: "Confirmed", catalog_page: "28", notes: "Cottered type ANSI 140" },
  { chain_id: "ANSI-160", code: "160AC-1",  confidence: "Confirmed", catalog_page: "28", notes: "Cottered type ANSI 160" },
  { chain_id: "ANSI-200", code: "200AC-1",  confidence: "Confirmed", catalog_page: "29", notes: "Cottered type ANSI 200" },
  // ── Double pitch extended ──
  { chain_id: "C2040",    code: "C2040H",   confidence: "Confirmed", catalog_page: "90", notes: "Double pitch heavy C2040 series" },
  { chain_id: "C2100",    code: "C2100H",   confidence: "Confirmed", catalog_page: "93", notes: "Double pitch heavy C2100 series" },
  // ── Hollow pin additional ──
  { chain_id: "HP-40",    code: "40HP-SS",  confidence: "Confirmed", catalog_page: "65", notes: "40HP stainless steel" },
  { chain_id: "HP-60",    code: "60HP-SS",  confidence: "Confirmed", catalog_page: "66", notes: "60HP stainless steel" },
  // ── WH series existing normalized (Uniking / Allied-Locke baseline) ──
  { chain_id: "WH-78",    code: "78B",      confidence: "Confirmed", catalog_page: "158", notes: "WH78 welded steel — Donghua 78B designation" },
  { chain_id: "WH-124",   code: "124B",     confidence: "Confirmed", catalog_page: "160", notes: "WH124 welded steel — Donghua 124B designation" },
];

// ─── PHASE 4 NEW CHAINS ────────────────────────────────────────────────────────

export const DH_PHASE4_NEW_CHAINS = [

  // ══════════════════════════════════════════════════════════════════
  // PHASE 4A — WR / WD WELDED DRAG & MILL CHAINS
  // ASME B29.100 / Donghua catalog pp.155–165
  // WR = Welded Roller; WD = Welded Drag (rollerless barrel)
  // ══════════════════════════════════════════════════════════════════

  {
    chain_id: "DH-WR-78",
    chain_family: "welded_steel",
    chain_number: "WR78",
    display_name: "WR78 Welded Steel Drag Chain with Rollers",
    standard: "ASME B29.100",
    pitch_in: "3.075",
    pitch_mm: "78.11",
    description: "WR78 welded steel drag chain — 3.075\" pitch, with rollers for reduced friction on drag conveyor troughs. Used in fertilizer, grain, limestone, and agricultural en-masse systems.",
    application_tags: ["drag_conveyor", "bulk_material", "grain_handling", "fertilizer", "aggregate"],
    specs: {
      pitch_in: "3.075", pitch_mm: "78.11",
      roller_dia_in: "1.06", barrel_dia_in: "0.875",
      sidebar_height_in: "1.50", sidebar_thickness_in: "0.25",
      avg_ultimate_lbs: "26000", max_working_load_lbs: "5200",
      weight_lbs_ft: "5.8",
    },
    performance_tiers: [
      { tier: "standard", tensile_strength_lbs: "26000", working_load_lbs: "5200",
        source: "Donghua catalog p.157, ASME B29.100",
        notes: "WR78 welded roller drag chain. Rollers reduce sliding friction on drag trough floor." },
    ],
    source_refs: [
      { manufacturer: "Donghua", code: "WR78", confidence: "Confirmed",
        catalog_url: DH_CATALOG_URL, catalog_page: "157" },
      { manufacturer: "Allied-Locke", code: "WR78", confidence: "Confirmed" },
      { manufacturer: "MAC Chain", code: "WR78", confidence: "Confirmed" },
    ],
    attachments_available: ["WA-K1", "WA-A1", "WA-FLIGHT", "WA-SCRAPER"],
    attachment_configs: [
      { code: "WA-K1",      side: "one_side",   spacing: "every_link",  description: "K1 sidebar lug" },
      { code: "WA-A1",      side: "one_side",   spacing: "every_link",  description: "A1 tab" },
      { code: "WA-FLIGHT",  side: "both_sides", spacing: "every_2nd",   description: "Drag flight, both sides, E2" },
      { code: "WA-SCRAPER", side: "both_sides", spacing: "every_4th",   description: "Scraper flight E4" },
    ],
    sprocket_series: "WR-78",
    sprocket_compatibility: {
      series: "WR78",
      tooth_range: "6–18",
      bore_styles: ["plain_bore", "keyway", "QD_bushing"],
      materials: ["cast_iron", "carbon_steel", "hardened_steel"],
      split_sprocket_available: true,
      catalog_page_sprockets: "293",
    },
    materials_available: ["carbon_steel", "induction_hard"],
    options_upgrades: ["Induction hardened rollers", "Alloy steel version", "WR78XHD extra heavy"],
    downloads: [
      { label: "Donghua Catalog — WR78 Section", url: DH_CATALOG_URL, type: "pdf", page_ref: "157" },
    ],
    image_strategy: "family",
    status: "Active",
  },

  {
    chain_id: "DH-WD-78",
    chain_family: "welded_steel",
    chain_number: "WD78",
    display_name: "WD78 Welded Steel Drag Chain (No Rollers)",
    standard: "ASME B29.100",
    pitch_in: "3.075",
    pitch_mm: "78.11",
    description: "WD78 welded steel drag chain — 3.075\" pitch, barrel-only (no rollers). Simpler and lower cost than WR78. Used in light bulk drag applications where sliding friction is acceptable.",
    application_tags: ["drag_conveyor", "bulk_material", "grain_handling"],
    specs: {
      pitch_in: "3.075", pitch_mm: "78.11",
      barrel_dia_in: "0.875",
      sidebar_height_in: "1.50",
      avg_ultimate_lbs: "22000", max_working_load_lbs: "4400",
      weight_lbs_ft: "4.8",
    },
    performance_tiers: [
      { tier: "standard", tensile_strength_lbs: "22000", working_load_lbs: "4400",
        source: "Donghua catalog p.157, ASME B29.100",
        notes: "WD78 — rollerless barrel drag chain, lower cost than WR78." },
    ],
    source_refs: [
      { manufacturer: "Donghua", code: "WD78", confidence: "Confirmed",
        catalog_url: DH_CATALOG_URL, catalog_page: "157" },
      { manufacturer: "MAC Chain", code: "WD78", confidence: "Confirmed" },
    ],
    attachments_available: ["WA-K1", "WA-FLIGHT"],
    sprocket_series: "WR-78",
    materials_available: ["carbon_steel"],
    options_upgrades: ["Roller upgrade → WR78"],
    downloads: [
      { label: "Donghua Catalog — WD78 Section", url: DH_CATALOG_URL, type: "pdf", page_ref: "157" },
    ],
    image_strategy: "family",
    status: "Active",
  },

  {
    chain_id: "DH-WR-110",
    chain_family: "welded_steel",
    chain_number: "WR110",
    display_name: "WR110 Welded Steel Drag Chain with Rollers",
    standard: "ASME B29.100",
    pitch_in: "4.760",
    pitch_mm: "120.90",
    description: "WR110 heavy welded steel drag chain — 4.76\" pitch with rollers. High-capacity grain, coal, and phosphate drag conveyor applications.",
    application_tags: ["drag_conveyor", "bulk_material", "grain_handling", "coal", "aggregate"],
    specs: {
      pitch_in: "4.760", pitch_mm: "120.90",
      roller_dia_in: "1.25", barrel_dia_in: "1.12",
      sidebar_height_in: "1.88",
      avg_ultimate_lbs: "44000", max_working_load_lbs: "8800",
      weight_lbs_ft: "9.6",
    },
    performance_tiers: [
      { tier: "standard", tensile_strength_lbs: "44000", working_load_lbs: "8800",
        source: "Donghua catalog p.159, ASME B29.100" },
    ],
    source_refs: [
      { manufacturer: "Donghua", code: "WR110", confidence: "Confirmed",
        catalog_url: DH_CATALOG_URL, catalog_page: "159" },
      { manufacturer: "Allied-Locke", code: "WR110", confidence: "Confirmed" },
    ],
    attachments_available: ["WA-K1", "WA-FLIGHT", "WA-SCRAPER"],
    sprocket_series: "WR-110",
    sprocket_compatibility: {
      series: "WR110",
      tooth_range: "5–14",
      bore_styles: ["plain_bore", "keyway", "split"],
      materials: ["cast_iron", "hardened_steel"],
      split_sprocket_available: true,
      catalog_page_sprockets: "295",
    },
    materials_available: ["carbon_steel", "induction_hard"],
    options_upgrades: ["Induction hardened rollers", "WR110HD heavy duty"],
    downloads: [
      { label: "Donghua Catalog", url: DH_CATALOG_URL, type: "pdf", page_ref: "159" },
    ],
    image_strategy: "family",
    status: "Active",
  },

  {
    chain_id: "DH-WR-124",
    chain_family: "welded_steel",
    chain_number: "WR124",
    display_name: "WR124 Welded Steel Drag Chain with Rollers",
    standard: "ASME B29.100",
    pitch_in: "4.063",
    pitch_mm: "103.19",
    description: "WR124 welded steel drag chain — 4.063\" pitch, roller type. Heavy-duty grain elevator legs, potash, and coal drag conveyor applications.",
    application_tags: ["drag_conveyor", "grain_handling", "bulk_material", "coal"],
    specs: {
      pitch_in: "4.063", pitch_mm: "103.19",
      roller_dia_in: "1.25", barrel_dia_in: "1.00",
      sidebar_height_in: "1.62",
      avg_ultimate_lbs: "50000", max_working_load_lbs: "10000",
      weight_lbs_ft: "10.2",
    },
    performance_tiers: [
      { tier: "standard", tensile_strength_lbs: "50000", working_load_lbs: "10000",
        source: "Donghua catalog p.160, ASME B29.100" },
    ],
    source_refs: [
      { manufacturer: "Donghua", code: "WR124", confidence: "Confirmed",
        catalog_url: DH_CATALOG_URL, catalog_page: "160" },
      { manufacturer: "Allied-Locke", code: "WR124", confidence: "Confirmed" },
    ],
    attachments_available: ["WA-K1", "WA-K2", "WA-FLIGHT"],
    sprocket_series: "WR-124",
    sprocket_compatibility: {
      series: "WR124",
      tooth_range: "5–12",
      bore_styles: ["plain_bore", "keyway", "split", "QD_bushing"],
      materials: ["cast_iron", "hardened_steel"],
      split_sprocket_available: true,
      catalog_page_sprockets: "296",
    },
    materials_available: ["carbon_steel", "induction_hard"],
    options_upgrades: ["WR124HD heavy duty", "Induction hardened"],
    downloads: [
      { label: "Donghua Catalog", url: DH_CATALOG_URL, type: "pdf", page_ref: "160" },
    ],
    image_strategy: "family",
    status: "Active",
  },

  // ══════════════════════════════════════════════════════════════════
  // PHASE 4B — WH / 81X SERIES ENGINEERED CONVEYING
  // Heavy bushed class for kiln, cement, and drag conveying
  // ══════════════════════════════════════════════════════════════════

  {
    chain_id: "DH-ENG-81X",
    chain_family: "engineered_class",
    chain_number: "81X",
    display_name: "81X Engineering Bushed Conveyor Chain",
    standard: "ASME B29.100",
    pitch_in: "3.000",
    pitch_mm: "76.20",
    description: "81X class engineering bushed conveyor chain — 3\" pitch. Standard engineering class for cement, aggregate, and mining drag conveyors. The most common engineered-class chain in North American bulk handling.",
    application_tags: ["cement", "aggregate", "mining", "bulk_material", "drag_conveyor"],
    specs: {
      pitch_in: "3.000", pitch_mm: "76.20",
      inner_width_in: "1.812", inner_width_mm: "46.02",
      pin_dia_in: "0.625", pin_dia_mm: "15.88",
      plate_height_in: "2.50", plate_height_mm: "63.50",
      plate_thickness_in: "0.375", plate_thickness_mm: "9.53",
      avg_ultimate_lbs: "55000", max_working_load_lbs: "11000",
      weight_lbs_ft: "8.2",
    },
    performance_tiers: [
      { tier: "standard", tensile_strength_lbs: "55000", working_load_lbs: "11000",
        source: "Donghua catalog p.143, ASME B29.100",
        notes: "81X bushed conveyor chain. Most common North American engineered-class chain." },
    ],
    source_refs: [
      { manufacturer: "Donghua", code: "81X", confidence: "Confirmed",
        catalog_url: DH_CATALOG_URL, catalog_page: "143" },
      { manufacturer: "Rexnord", code: "81X", confidence: "Confirmed" },
      { manufacturer: "Link-Belt", code: "81X", confidence: "Confirmed" },
      { manufacturer: "Uniking", code: "81X", confidence: "Confirmed" },
    ],
    attachments_available: ["ENG-A1", "ENG-K1", "ENG-FLIGHT", "ENG-SCRAPER", "ENG-SA1", "ENG-W-TAB"],
    attachment_configs: [
      { code: "ENG-A1",     side: "one_side",   spacing: "every_link",  description: "Standard extended tab, one side" },
      { code: "ENG-A2",     side: "one_side",   spacing: "every_link",  description: "Extended tab, higher profile" },
      { code: "ENG-K1",     side: "one_side",   spacing: "every_link",  description: "Bent tab, one side" },
      { code: "ENG-K2",     side: "both_sides", spacing: "every_link",  description: "Bent tab, both sides" },
      { code: "ENG-SA1",    side: "one_side",   spacing: "every_link",  description: "Super A1 — extra-long extended tab" },
      { code: "ENG-W-TAB",  side: "both_sides", spacing: "every_2nd",   description: "W-shaped tab, both sides, E2" },
      { code: "ENG-FLIGHT", side: "both_sides", spacing: "every_4th",   description: "Heavy drag flight, both sides, E4" },
      { code: "ENG-SCRAPER",side: "both_sides", spacing: "every_6th",   description: "Scraper bar attachment, E6" },
    ],
    sprocket_series: "ENG-81X",
    sprocket_compatibility: {
      series: "81X",
      tooth_range: "7–24",
      bore_styles: ["plain_bore", "keyway", "QD_bushing", "taper_lock"],
      materials: ["cast_iron", "ductile_iron", "carbon_steel", "hardened_steel"],
      split_sprocket_available: true,
      catalog_page_sprockets: "290",
      notes: "Rexnord/Link-Belt sprocket interchangeable with Donghua 81X chain.",
    },
    materials_available: ["carbon_steel", "alloy_steel", "carburized"],
    options_upgrades: ["81XH heavy", "81XHH extra-heavy", "Hardened pins", "Alloy steel sidebars"],
    downloads: [
      { label: "Donghua Catalog — 81X Section",     url: DH_CATALOG_URL, type: "pdf", page_ref: "143" },
      { label: "Rexnord 81X Cross-Reference Guide",  url: "https://www.rexnord.com/contentitems/techlibrary/documents/229-010_catalog.pdf", type: "pdf" },
    ],
    image_strategy: "family",
    status: "Active",
  },

  {
    chain_id: "DH-ENG-81XH",
    chain_family: "engineered_class",
    chain_number: "81XH",
    display_name: "81XH Heavy Engineering Bushed Conveyor Chain",
    standard: "ASME B29.100",
    pitch_in: "3.000",
    pitch_mm: "76.20",
    description: "81XH heavy-duty engineering bushed chain — same 3\" pitch as 81X with heavier plate stock and pin diameter. Used in high-load cement, aggregate, and mining drag conveyors.",
    application_tags: ["cement", "aggregate", "mining", "bulk_material"],
    specs: {
      pitch_in: "3.000", pitch_mm: "76.20",
      inner_width_in: "1.812",
      pin_dia_in: "0.750",
      plate_height_in: "2.75",
      plate_thickness_in: "0.437",
      avg_ultimate_lbs: "80000", max_working_load_lbs: "16000",
      weight_lbs_ft: "11.5",
    },
    performance_tiers: [
      { tier: "performance", tensile_strength_lbs: "80000", working_load_lbs: "16000",
        source: "Donghua catalog p.144, ASME B29.100",
        notes: "81XH heavy series — heavier plates and pin vs 81X." },
    ],
    source_refs: [
      { manufacturer: "Donghua", code: "81XH", confidence: "Confirmed",
        catalog_url: DH_CATALOG_URL, catalog_page: "144" },
      { manufacturer: "Rexnord", code: "81XH", confidence: "Confirmed" },
      { manufacturer: "Link-Belt", code: "81XH", confidence: "Confirmed" },
      { manufacturer: "Uniking", code: "81XH", confidence: "Confirmed" },
    ],
    attachments_available: ["ENG-A1", "ENG-K1", "ENG-FLIGHT", "ENG-SCRAPER"],
    sprocket_series: "ENG-81X",
    materials_available: ["carbon_steel", "alloy_steel"],
    options_upgrades: ["81XHH extra-heavy", "Alloy steel"],
    downloads: [
      { label: "Donghua Catalog — 81XH Section", url: DH_CATALOG_URL, type: "pdf", page_ref: "144" },
    ],
    image_strategy: "family",
    status: "Active",
  },

  {
    chain_id: "DH-ENG-81XHH",
    chain_family: "engineered_class",
    chain_number: "81XHH",
    display_name: "81XHH Extra-Heavy Engineering Bushed Chain",
    standard: "ASME B29.100",
    pitch_in: "3.000",
    pitch_mm: "76.20",
    description: "81XHH extra-heavy engineering bushed chain. Maximum load rating in the 81X pitch family. Used in cement kiln feed, mining overland conveyors, and heaviest-duty drag conveyor applications.",
    application_tags: ["cement", "mining", "bulk_material", "kiln", "heavy_industrial"],
    specs: {
      pitch_in: "3.000", pitch_mm: "76.20",
      inner_width_in: "1.812",
      pin_dia_in: "0.875",
      plate_height_in: "3.00",
      plate_thickness_in: "0.500",
      avg_ultimate_lbs: "110000", max_working_load_lbs: "22000",
      weight_lbs_ft: "14.8",
    },
    performance_tiers: [
      { tier: "premium", tensile_strength_lbs: "110000", working_load_lbs: "22000",
        source: "Donghua catalog p.145, ASME B29.100",
        notes: "81XHH — maximum 3\" pitch load. For kiln and overland mining applications." },
    ],
    source_refs: [
      { manufacturer: "Donghua", code: "81XHH", confidence: "Confirmed",
        catalog_url: DH_CATALOG_URL, catalog_page: "145" },
      { manufacturer: "Rexnord", code: "81XHH", confidence: "Confirmed" },
      { manufacturer: "Uniking", code: "81XHH", confidence: "Confirmed" },
    ],
    attachments_available: ["ENG-A1", "ENG-K1", "ENG-FLIGHT"],
    sprocket_series: "ENG-81X",
    materials_available: ["carbon_steel", "alloy_steel"],
    options_upgrades: ["Alloy steel plates"],
    downloads: [
      { label: "Donghua Catalog — 81XHH", url: DH_CATALOG_URL, type: "pdf", page_ref: "145" },
    ],
    image_strategy: "family",
    status: "Active",
  },

  {
    chain_id: "DH-ENG-MR56",
    chain_family: "engineered_class",
    chain_number: "MR56",
    display_name: "MR56 Engineering Bushed Chain with Rollers",
    standard: "ISO / DIN 8167",
    pitch_in: "2.205",
    pitch_mm: "56.00",
    description: "MR56 class engineering bushed chain with outer rollers — 56mm pitch. Rollers reduce friction on guide rails. For cement, aggregate, and mining conveyor applications requiring roller-on-rail design.",
    application_tags: ["cement", "aggregate", "mining", "bulk_material"],
    specs: {
      pitch_mm: "56.00", pitch_in: "2.205",
      roller_dia_mm: "28.0",
      inner_width_mm: "35.0",
      pin_dia_mm: "14.0",
      avg_ultimate_lbs: "45000", max_working_load_lbs: "9000",
      weight_kg_m: "9.5",
    },
    performance_tiers: [
      { tier: "standard", tensile_strength_lbs: "45000", working_load_lbs: "9000",
        source: "Donghua catalog p.136, DIN 8167",
        notes: "MR56 — M56 with outer rollers. Same tensile but reduced trough friction." },
    ],
    source_refs: [
      { manufacturer: "Donghua", code: "MR56", confidence: "Confirmed",
        catalog_url: DH_CATALOG_URL, catalog_page: "136" },
    ],
    attachments_available: ["ENG-A1", "ENG-K1", "ENG-FLIGHT"],
    sprocket_series: "ENG-M56",
    materials_available: ["carbon_steel", "carburized"],
    options_upgrades: ["Alloy steel", "Hardened rollers"],
    image_strategy: "family",
    status: "Active",
  },

  {
    chain_id: "DH-ENG-MR80",
    chain_family: "engineered_class",
    chain_number: "MR80",
    display_name: "MR80 Engineering Bushed Chain with Rollers",
    standard: "ISO / DIN 8167",
    pitch_in: "3.150",
    pitch_mm: "80.00",
    description: "MR80 class engineering bushed chain with outer rollers — 80mm pitch. Roller-on-rail conveyor design for heavy quarry and mining applications.",
    application_tags: ["aggregate", "mining", "cement", "bulk_material"],
    specs: {
      pitch_mm: "80.00", pitch_in: "3.150",
      roller_dia_mm: "40.0",
      inner_width_mm: "50.0",
      pin_dia_mm: "20.0",
      avg_ultimate_lbs: "80000", max_working_load_lbs: "16000",
      weight_kg_m: "17.5",
    },
    performance_tiers: [
      { tier: "standard", tensile_strength_lbs: "80000", working_load_lbs: "16000",
        source: "Donghua catalog p.138, DIN 8167" },
    ],
    source_refs: [
      { manufacturer: "Donghua", code: "MR80", confidence: "Confirmed",
        catalog_url: DH_CATALOG_URL, catalog_page: "138" },
    ],
    attachments_available: ["ENG-A1", "ENG-K1", "ENG-FLIGHT"],
    sprocket_series: "ENG-M80",
    materials_available: ["carbon_steel", "alloy_steel"],
    options_upgrades: ["Alloy steel version", "Hardened rollers"],
    image_strategy: "family",
    status: "Active",
  },

  // ══════════════════════════════════════════════════════════════════
  // PHASE 4C — CONVEYOR ROLLER CHAINS (Section B, pp.73–128)
  // These are standard-pitch roller chains specifically designed
  // for conveyor duty (heavier plates, attachments, longer life)
  // ══════════════════════════════════════════════════════════════════

  {
    chain_id: "DH-CONV-40B",
    chain_family: "conveyor_roller",
    chain_number: "40-CONV",
    display_name: "No.40 Conveyor Grade Roller Chain",
    standard: "ANSI B29.1 / ANSI B29.2",
    pitch_in: "0.500",
    pitch_mm: "12.70",
    description: "ANSI 40 conveyor-grade roller chain — heavy-duty plates optimized for conveyor duty rather than drive duty. Extended fatigue life, available with A1/K1 attachments at standard or custom spacings.",
    specs: {
      pitch_in: "0.500", pitch_mm: "12.70",
      roller_dia_in: "0.312", roller_width_in: "0.312",
      avg_ultimate_lbs: "3700", max_working_load_lbs: "740",
    },
    performance_tiers: [
      { tier: "standard", tensile_strength_lbs: "3700", working_load_lbs: "740",
        source: "Donghua catalog p.78, ANSI B29.2",
        notes: "Conveyor grade — same dims as drive chain but specified for conveyor duty with attachment availability." },
    ],
    source_refs: [
      { manufacturer: "Donghua", code: "40A-CONV", confidence: "Confirmed",
        catalog_url: DH_CATALOG_URL, catalog_page: "78" },
    ],
    attachments_available: ["A1", "A2", "K1", "K2", "SA1"],
    attachment_configs: [
      { code: "A1",  side: "one_side",   spacing: "every_link", description: "Extended tab one side" },
      { code: "K1",  side: "one_side",   spacing: "every_link", description: "Bent tab one side" },
      { code: "K2",  side: "both_sides", spacing: "every_link", description: "Bent tab both sides" },
      { code: "SA1", side: "one_side",   spacing: "every_link", description: "Super-A1 extended tab" },
    ],
    sprocket_series: "ANSI-40",
    materials_available: ["carbon_steel", "stainless_304", "nickel_plated"],
    options_upgrades: ["Double strand conveyor", "Stainless attachment chains"],
    image_strategy: "family",
    status: "Active",
  },

  {
    chain_id: "DH-CONV-C2040-SA1",
    chain_family: "conveyor_roller",
    chain_number: "C2040-SA1",
    display_name: "C2040 Double Pitch Conveyor Chain with SA1 Attachment",
    standard: "ANSI B29.4",
    pitch_in: "1.000",
    pitch_mm: "25.40",
    description: "C2040 double pitch conveyor chain with Super A1 (SA1) extended attachments for carton/tray conveying on long-span inclined conveyor systems.",
    specs: {
      pitch_in: "1.000", pitch_mm: "25.40",
      attachment_type: "SA1",
      tab_height_in: "1.00",
      avg_ultimate_lbs: "3700", max_working_load_lbs: "810",
    },
    performance_tiers: [
      { tier: "standard", tensile_strength_lbs: "3700", working_load_lbs: "810",
        source: "Donghua catalog p.93, ANSI B29.4" },
    ],
    source_refs: [
      { manufacturer: "Donghua", code: "C2040SA1", confidence: "Confirmed",
        catalog_url: DH_CATALOG_URL, catalog_page: "93" },
    ],
    attachments_available: [],
    attachment_configs: [
      { code: "SA1",    side: "one_side",   spacing: "every_link",  description: "Super-A1 tall tab" },
      { code: "SA1-E2", side: "one_side",   spacing: "every_2nd",   description: "SA1 every 2nd link" },
      { code: "SA2",    side: "one_side",   spacing: "every_link",  description: "Super-A2" },
      { code: "SK1",    side: "one_side",   spacing: "every_link",  description: "Super-K1 bent tab" },
      { code: "SK2",    side: "both_sides", spacing: "every_link",  description: "Super-K2 both sides" },
    ],
    sprocket_series: "C2040",
    materials_available: ["carbon_steel", "stainless_304"],
    options_upgrades: ["Large roller (C2042) base chain"],
    image_strategy: "family",
    status: "Active",
  },

  // ══════════════════════════════════════════════════════════════════
  // PHASE 4D — OVERHEAD CONVEYOR CHAINS
  // I-beam trolley, free-flow power & free, drop-forged systems
  // ══════════════════════════════════════════════════════════════════

  {
    chain_id: "DH-OVH-IBEAM-3",
    chain_family: "overhead_conveyor",
    chain_number: "X458-I-BEAM",
    display_name: "3\" I-Beam Overhead Conveyor Chain",
    standard: "ASME B29.100 / Custom",
    pitch_in: "3.000",
    pitch_mm: "76.20",
    description: "3\" pitch drop-forged I-beam trolley conveyor chain for overhead monorail and power-&-free systems. Used in automotive paint lines, metal finishing, and assembly automation.",
    application_tags: ["automotive", "overhead_conveyor", "assembly_automation", "paint_line"],
    specs: {
      pitch_in: "3.000", pitch_mm: "76.20",
      type: "I-beam trolley",
      avg_ultimate_lbs: "32000", max_working_load_lbs: "6400",
      max_load_per_trolley_lbs: "1200",
      trolley_wheel_dia_in: "3.00",
    },
    performance_tiers: [
      { tier: "standard", tensile_strength_lbs: "32000", working_load_lbs: "6400",
        source: "Donghua catalog p.108, overhead conveyor section",
        notes: "I-beam overhead chain — load per trolley wheel is separate from chain tensile rating." },
    ],
    source_refs: [
      { manufacturer: "Donghua", code: "X458-3IN", confidence: "Confirmed",
        catalog_url: DH_CATALOG_URL, catalog_page: "108" },
      { manufacturer: "Rexnord", code: "X458", confidence: "Needs Review",
        notes: "X458 cross-ref — verify I-beam size compatibility" },
    ],
    attachments_available: ["OVH-PUSHER-DOG", "OVH-CARRIER-BAR", "OVH-PICKUP-DOG"],
    sprocket_series: "OVH-3IN",
    materials_available: ["carbon_steel", "alloy_steel"],
    options_upgrades: ["4\" pitch version", "Extended trolley assemblies"],
    downloads: [
      { label: "Donghua Catalog — Overhead Conveyor", url: DH_CATALOG_URL, type: "pdf", page_ref: "108" },
    ],
    image_strategy: "family",
    status: "Active",
  },

  {
    chain_id: "DH-OVH-IBEAM-4",
    chain_family: "overhead_conveyor",
    chain_number: "X678-I-BEAM",
    display_name: "4\" I-Beam Overhead Conveyor Chain",
    standard: "ASME B29.100 / Custom",
    pitch_in: "4.000",
    pitch_mm: "101.60",
    description: "4\" pitch drop-forged I-beam trolley overhead conveyor chain. Heavy-duty automotive, foundry, and industrial hanging conveyor applications.",
    application_tags: ["automotive", "overhead_conveyor", "foundry", "heavy_industrial"],
    specs: {
      pitch_in: "4.000", pitch_mm: "101.60",
      type: "I-beam trolley heavy",
      avg_ultimate_lbs: "55000", max_working_load_lbs: "11000",
      max_load_per_trolley_lbs: "2000",
      trolley_wheel_dia_in: "4.00",
    },
    performance_tiers: [
      { tier: "standard", tensile_strength_lbs: "55000", working_load_lbs: "11000",
        source: "Donghua catalog p.110", notes: "4\" I-beam overhead — heavy duty" },
    ],
    source_refs: [
      { manufacturer: "Donghua", code: "X678-4IN", confidence: "Confirmed",
        catalog_url: DH_CATALOG_URL, catalog_page: "110" },
    ],
    attachments_available: ["OVH-PUSHER-DOG", "OVH-CARRIER-BAR"],
    sprocket_series: "OVH-4IN",
    materials_available: ["carbon_steel", "alloy_steel"],
    options_upgrades: [],
    downloads: [
      { label: "Donghua Catalog — Overhead Section", url: DH_CATALOG_URL, type: "pdf", page_ref: "110" },
    ],
    image_strategy: "family",
    status: "Active",
  },

  // ══════════════════════════════════════════════════════════════════
  // PHASE 4E — MULTI-STRAND ROLLER CHAINS
  // Double and triple strand normalized entries for DH-specific sizes
  // Standard ANSI multi-strand → merge refs only (see DH_PHASE4_MERGE_REFS)
  // These are new chain_ids for BS/engineered multi-strand
  // ══════════════════════════════════════════════════════════════════

  {
    chain_id: "BS-08B-2",
    chain_family: "performance_roller",
    chain_number: "08B-2",
    display_name: "08B-2 Double Strand British Standard Roller Chain",
    standard: "ISO 606 / BS 228",
    pitch_in: "0.500",
    pitch_mm: "12.70",
    description: "Double strand 08B British Standard roller chain. 2× single-strand tensile for compact multi-strand drives. Common in European machinery, food processing equipment, and agricultural drives.",
    specs: {
      pitch_mm: "12.70", pitch_in: "0.500",
      strands: 2,
      transverse_pitch_mm: "13.92",
      avg_ultimate_lbs: "7600",
    },
    performance_tiers: [
      { tier: "standard", tensile_strength_lbs: "7600", working_load_lbs: "1720",
        source: "Donghua catalog p.31, ISO 606",
        notes: "Double strand 08B-2. Transverse pitch 13.92mm per ISO 606." },
    ],
    source_refs: [
      { manufacturer: "Donghua", code: "08B-2", confidence: "Confirmed",
        catalog_url: DH_CATALOG_URL, catalog_page: "31" },
      { manufacturer: "Renold", code: "08B-2", confidence: "Confirmed" },
      { manufacturer: "Iwis", code: "08B-2", confidence: "Confirmed" },
    ],
    attachments_available: [],
    sprocket_series: "BS-08B",
    materials_available: ["carbon_steel", "stainless_304"],
    options_upgrades: ["Triple strand 08B-3"],
    image_strategy: "family",
    status: "Active",
  },

  {
    chain_id: "BS-16B-2",
    chain_family: "performance_roller",
    chain_number: "16B-2",
    display_name: "16B-2 Double Strand British Standard Roller Chain",
    standard: "ISO 606 / BS 228",
    pitch_in: "1.000",
    pitch_mm: "25.40",
    description: "Double strand 16B British Standard roller chain. High-load compact European drives. Very common in agricultural machinery, mining equipment, and heavy industrial drives.",
    specs: {
      pitch_mm: "25.40", pitch_in: "1.000",
      strands: 2,
      transverse_pitch_mm: "33.40",
      avg_ultimate_lbs: "27000",
    },
    performance_tiers: [
      { tier: "standard", tensile_strength_lbs: "27000", working_load_lbs: "6120",
        source: "Donghua catalog p.32, ISO 606" },
    ],
    source_refs: [
      { manufacturer: "Donghua", code: "16B-2", confidence: "Confirmed",
        catalog_url: DH_CATALOG_URL, catalog_page: "32" },
      { manufacturer: "Renold", code: "16B-2", confidence: "Confirmed" },
      { manufacturer: "Tsubaki", code: "16B-2", confidence: "Confirmed" },
    ],
    attachments_available: ["A1", "A2", "K1", "K2"],
    sprocket_series: "BS-16B",
    materials_available: ["carbon_steel", "stainless_304"],
    options_upgrades: ["Triple strand 16B-3"],
    image_strategy: "family",
    status: "Active",
  },

  // ══════════════════════════════════════════════════════════════════
  // PHASE 4F — COTTERED-TYPE SHORT-PITCH CHAINS
  // For large pitches requiring field disassembly without special tools
  // ══════════════════════════════════════════════════════════════════

  {
    chain_id: "DH-COT-80",
    chain_family: "performance_roller",
    chain_number: "80AC",
    display_name: "80AC Cottered Type Roller Chain",
    standard: "ANSI B29.1",
    pitch_in: "1.000",
    pitch_mm: "25.40",
    description: "ANSI 80 cottered-type roller chain — cotter pins instead of press-fit rivets allow field disassembly without special tools. Used on heavy machinery, cranes, and equipment requiring frequent service.",
    specs: {
      pitch_in: "1.000", pitch_mm: "25.40",
      roller_dia_in: "0.625", roller_width_in: "0.625",
      cotter_type: "Split-pin cotter",
      avg_ultimate_lbs: "14500",
    },
    performance_tiers: [
      { tier: "standard", tensile_strength_lbs: "14500", working_load_lbs: "2900",
        source: "Donghua catalog p.26, ANSI B29.1",
        notes: "Cottered type — cotter pins allow field disassembly. Same tensile as standard 80." },
    ],
    source_refs: [
      { manufacturer: "Donghua", code: "80AC-1", confidence: "Confirmed",
        catalog_url: DH_CATALOG_URL, catalog_page: "26" },
      { manufacturer: "Allied-Locke", code: "80AC", confidence: "Confirmed" },
    ],
    attachments_available: [],
    sprocket_series: "ANSI-80",
    materials_available: ["carbon_steel"],
    options_upgrades: ["Double strand cottered"],
    image_strategy: "family",
    status: "Active",
  },

  {
    chain_id: "DH-COT-120",
    chain_family: "performance_roller",
    chain_number: "120AC",
    display_name: "120AC Cottered Type Roller Chain",
    standard: "ANSI B29.1",
    pitch_in: "1.500",
    pitch_mm: "38.10",
    description: "ANSI 120 cottered-type roller chain — 1.5\" pitch with cotter pin assembly for field serviceability. Heavy machinery and crane drives.",
    specs: {
      pitch_in: "1.500", pitch_mm: "38.10",
      cotter_type: "Split-pin cotter",
      avg_ultimate_lbs: "32000",
    },
    performance_tiers: [
      { tier: "standard", tensile_strength_lbs: "32000", working_load_lbs: "6400",
        source: "Donghua catalog p.27, ANSI B29.1" },
    ],
    source_refs: [
      { manufacturer: "Donghua", code: "120AC-1", confidence: "Confirmed",
        catalog_url: DH_CATALOG_URL, catalog_page: "27" },
    ],
    attachments_available: [],
    sprocket_series: "ANSI-120",
    materials_available: ["carbon_steel"],
    options_upgrades: [],
    image_strategy: "family",
    status: "Active",
  },

  {
    chain_id: "DH-COT-160",
    chain_family: "performance_roller",
    chain_number: "160AC",
    display_name: "160AC Cottered Type Roller Chain",
    standard: "ANSI B29.1",
    pitch_in: "2.000",
    pitch_mm: "50.80",
    description: "ANSI 160 cottered-type roller chain — 2\" pitch. Heavy-duty field-serviceable chain for cranes, steel mill equipment, and large industrial drives.",
    specs: {
      pitch_in: "2.000", pitch_mm: "50.80",
      cotter_type: "Split-pin cotter",
      avg_ultimate_lbs: "58000",
    },
    performance_tiers: [
      { tier: "standard", tensile_strength_lbs: "58000", working_load_lbs: "11600",
        source: "Donghua catalog p.28, ANSI B29.1" },
    ],
    source_refs: [
      { manufacturer: "Donghua", code: "160AC-1", confidence: "Confirmed",
        catalog_url: DH_CATALOG_URL, catalog_page: "28" },
    ],
    attachments_available: [],
    sprocket_series: "ANSI-160",
    materials_available: ["carbon_steel"],
    options_upgrades: ["Cottered double strand"],
    image_strategy: "family",
    status: "Active",
  },

  // ══════════════════════════════════════════════════════════════════
  // PHASE 4G — FULL ATTACHMENT GEOMETRY LIBRARY
  // SA, W, WA, extended-pin, U-shaped, apron configurations
  // These are normalized attachment-configuration records, not chains.
  // They extend the attachment reference library for the RFQ configurator.
  // ══════════════════════════════════════════════════════════════════

  {
    chain_id: "DH-ATT-LIB-SA",
    chain_family: "attachment_roller",
    chain_number: "SA-SERIES",
    display_name: "SA Super-Extended Attachment Chain Configuration Library",
    standard: "ANSI B29.1 / ANSI B29.4",
    pitch_in: "varies",
    pitch_mm: "varies",
    description: "SA (Super-A) attachment series — extra-long extended tabs for taller conveyor slats, flights, and cross-rod support. Available on ANSI 40–120 and double-pitch C2040–C2100 chains. Donghua catalog pp.70–98.",
    specs: {
      type: "Attachment configuration library",
      attachment_series: "SA",
    },
    attachment_geometry: [
      {
        code: "SA1",
        base_chains: ["ANSI-40","ANSI-50","ANSI-60","ANSI-80","ANSI-100","C2040","C2060","C2080"],
        side: "one_side",
        tab_type: "Extended flat",
        tab_height_range_in: "0.75 – 2.00",
        hole_pattern: "Single or double hole",
        spacing_options: ["E1","E2","E3","E4","E6"],
        description: "Super A1 — extra-long single-side flat tab. Standard for slat conveyor mounting.",
      },
      {
        code: "SA2",
        base_chains: ["ANSI-40","ANSI-60","ANSI-80","C2060","C2080"],
        side: "one_side",
        tab_type: "Extended flat, offset hole",
        tab_height_range_in: "0.75 – 2.00",
        description: "SA2 — SA1 with offset mounting hole for angled slat mounting.",
      },
      {
        code: "SK1",
        base_chains: ["ANSI-40","ANSI-60","ANSI-80","C2040","C2060"],
        side: "one_side",
        tab_type: "Super bent-tab",
        description: "SK1 — taller version of K1, one side. For deeper flight attachment.",
      },
      {
        code: "SK2",
        base_chains: ["ANSI-40","ANSI-60","ANSI-80","C2060"],
        side: "both_sides",
        tab_type: "Super bent-tab both sides",
        description: "SK2 — SK1 both sides. For bilateral slat or cross-rod mounting.",
      },
    ],
    source_refs: [
      { manufacturer: "Donghua", code: "SA-SERIES", confidence: "Confirmed",
        catalog_url: DH_CATALOG_URL, catalog_page: "70",
        notes: "SA series attachment geometry — confirmed from Donghua catalog attachment tables pp.70–98" },
    ],
    attachments_available: [],
    sprocket_series: null,
    materials_available: ["carbon_steel", "stainless_304"],
    options_upgrades: [],
    image_strategy: "family",
    status: "Active",
  },

  {
    chain_id: "DH-ATT-LIB-W",
    chain_family: "attachment_roller",
    chain_number: "W-SERIES",
    display_name: "W / WA Wide-Tab Attachment Chain Configuration Library",
    standard: "ANSI B29.1",
    pitch_in: "varies",
    pitch_mm: "varies",
    description: "W and WA (Wide-A) attachment series — wide flat tabs for apron conveyor and wide-slat mounting. Available on ANSI 50–120 and welded steel chains. Used in apron feeders, steel mill scale conveyors, and heavy pan conveyors.",
    specs: {
      type: "Attachment configuration library",
      attachment_series: "W/WA",
    },
    attachment_geometry: [
      {
        code: "WA-K1",
        base_chains: ["ANSI-60","ANSI-80","ANSI-100","WH-78","WH-124","DH-WS-102B","DH-WS-132B"],
        side: "one_side",
        tab_type: "Wide bent-tab",
        tab_width_in: "2.00 – 4.00",
        description: "WA-K1 wide bent attachment for welded steel and heavy ANSI chains. Standard on WH/WR series.",
      },
      {
        code: "WA-A1",
        base_chains: ["ANSI-60","ANSI-80","ANSI-100","DH-WS-102B","DH-WS-132B","DH-WS-160B"],
        side: "one_side",
        tab_type: "Wide flat extended tab",
        tab_width_in: "2.00 – 4.00",
        description: "WA-A1 wide flat tab for apron conveyor pan mounting.",
      },
      {
        code: "WA-FLIGHT",
        base_chains: ["DH-WR-78","DH-WR-110","DH-WR-124","DH-WS-102B","DH-WS-132B"],
        side: "both_sides",
        tab_type: "Wide drag flight bar",
        description: "WA-FLIGHT — full-width welded drag flight for aggregate and bulk material drag conveyors.",
      },
      {
        code: "APRON-W",
        base_chains: ["ANSI-80","ANSI-100","ANSI-120"],
        side: "both_sides",
        tab_type: "Hinged apron attachment",
        description: "APRON-W — hinged wide apron attachment for steel mill and foundry apron conveyors. Needs Review.",
        confidence: "Needs Review",
      },
    ],
    source_refs: [
      { manufacturer: "Donghua", code: "W-SERIES", confidence: "Confirmed",
        catalog_url: DH_CATALOG_URL, catalog_page: "73",
        notes: "W/WA attachment geometry — confirmed from Donghua catalog conveyor chain section pp.73–128" },
    ],
    attachments_available: [],
    sprocket_series: null,
    materials_available: ["carbon_steel"],
    options_upgrades: [],
    image_strategy: "family",
    status: "Active",
  },

  {
    chain_id: "DH-ATT-LIB-EXTPIN",
    chain_family: "attachment_roller",
    chain_number: "EP-SERIES",
    display_name: "Extended-Pin / Hollow-Pin Attachment Configuration Library",
    standard: "ANSI B29.1 / ANSI B29.4",
    pitch_in: "varies",
    pitch_mm: "varies",
    description: "Extended-pin (EP) and extended-hollow-pin configurations. The pin extends beyond the sidebar plates to accept transverse rods, cross-bars, or custom fixtures. Used in cross-rod slat conveyors, bottle-handling, and bakery equipment.",
    specs: {
      type: "Attachment configuration library",
      attachment_series: "EP/HP-Extended",
    },
    attachment_geometry: [
      {
        code: "EP-ONE-SIDE",
        base_chains: ["ANSI-40","ANSI-50","ANSI-60","ANSI-80","C2040","C2060"],
        side: "one_side",
        tab_type: "Extended pin, one side",
        pin_extension_in: "0.25 – 2.00",
        description: "EP one-side: pin extends beyond one sidebar plate for rod threading.",
      },
      {
        code: "EP-BOTH-SIDES",
        base_chains: ["ANSI-40","ANSI-60","ANSI-80","C2060","C2080"],
        side: "both_sides",
        tab_type: "Extended pin, both sides",
        description: "EP both sides: pin extends on both ends — accepts transverse cross-rods.",
      },
      {
        code: "HP-CROSS-ROD",
        base_chains: ["HP-40","HP-50","HP-60","HP-80","HP-100","HP-C2060","HP-C2080"],
        side: "both_sides",
        tab_type: "Hollow pin cross-rod",
        description: "Hollow-pin cross-rod: threaded rod passes through the hollow pin and is secured by nuts.",
      },
      {
        code: "U-TAB",
        base_chains: ["ANSI-60","ANSI-80","C2060H"],
        side: "one_side",
        tab_type: "U-shaped channel tab",
        description: "U-tab: U-shaped bracket welded to sidebar for accepting conveyor slat bolts. Needs Review.",
        confidence: "Needs Review",
      },
    ],
    source_refs: [
      { manufacturer: "Donghua", code: "EP-SERIES", confidence: "Confirmed",
        catalog_url: DH_CATALOG_URL, catalog_page: "65",
        notes: "Extended pin and hollow pin configurations — Donghua catalog pp.65–72" },
    ],
    attachments_available: [],
    sprocket_series: null,
    materials_available: ["carbon_steel", "stainless_304"],
    options_upgrades: [],
    image_strategy: "family",
    status: "Active",
  },

  // ══════════════════════════════════════════════════════════════════
  // PHASE 4H — SPROCKET COMPATIBILITY MAP
  // Normalized sprocket records linked to chain families
  // Covers: DH catalog pp.281–320
  // ══════════════════════════════════════════════════════════════════

  {
    chain_id: "DH-SPKT-ANSI-A",
    chain_family: "specialty_custom",
    chain_number: "SPKT-ANSI-STD",
    display_name: "ANSI Standard Sprockets — Donghua Catalog Reference",
    standard: "ANSI B29.1",
    pitch_in: "varies",
    pitch_mm: "varies",
    description: "Donghua sprocket catalog reference for ANSI B29.1 standard roller chain sprockets. Covers chains #25 through #240, single to quadruple strand. Available in plain bore, keyway, QD bushing, taper lock, and split configurations.",
    specs: {
      type: "Sprocket compatibility reference",
      chain_range: "ANSI 25 to ANSI 240",
      catalog_section: "Sprockets pp.281–320",
    },
    sprocket_compatibility: {
      ansi_chains_covered: ["25","35","40","41","50","60","80","100","120","140","160","180","200","240"],
      tooth_range: "9–120 teeth",
      bore_styles: [
        { style: "plain_bore", description: "Plain bore — customer machines to size" },
        { style: "keyway", description: "Keyway with setscrew — standard bore + keyway" },
        { style: "QD_bushing", description: "Quick Detach bushing mount — JA/SK/SH/SF bushing sizes" },
        { style: "taper_lock", description: "Taper lock bushing — 1008 through 4040 sizes" },
        { style: "split", description: "Split sprocket — for in-place installation without shaft removal" },
        { style: "shear_pin_hub", description: "Shear pin hub — overload protection — Needs Review", confidence: "Needs Review" },
      ],
      materials: [
        { material: "cast_iron", grades: "ASTM A48 Class 30/35", description: "Standard cast iron — most economical, good wear" },
        { material: "carbon_steel", grades: "AISI 1045", description: "Carbon steel — higher strength than CI, machineable" },
        { material: "hardened_steel", grades: "AISI 4140 / 4340 induction-hardened", description: "Induction hardened sprocket teeth for extended life" },
        { material: "stainless_303_304", grades: "303/304 SS", description: "Stainless — food/beverage and corrosive environments" },
        { material: "plastic_nylon", grades: "Nylon 6/6 or MC nylon", description: "Plastic — low-noise, low-lubrication light-duty applications" },
      ],
      split_sprocket_notes: "Split sprockets allow in-place installation — no shaft removal needed. Available for ANSI 40–120. Extra cost but saves downtime.",
      catalog_page_sprockets: "281",
    },
    source_refs: [
      { manufacturer: "Donghua", code: "SPKT-ANSI-CATALOG", confidence: "Confirmed",
        catalog_url: DH_CATALOG_URL, catalog_page: "281",
        notes: "Donghua ANSI sprocket catalog — pp.281–320. Full tooth/bore/material matrix." },
    ],
    attachments_available: [],
    sprocket_series: "ANSI-ALL",
    materials_available: ["cast_iron", "carbon_steel", "hardened_steel", "stainless_304", "plastic"],
    options_upgrades: ["Split sprocket", "Hardened teeth", "QD bushing mount"],
    downloads: [
      { label: "Donghua Sprocket Catalog (pp.281–320)", url: DH_CATALOG_URL, type: "pdf", page_ref: "281" },
    ],
    image_strategy: "family",
    status: "Active",
  },

  {
    chain_id: "DH-SPKT-ENG-81X",
    chain_family: "specialty_custom",
    chain_number: "SPKT-81X-STD",
    display_name: "81X / 81XH / 81XHH Engineering Class Sprockets",
    standard: "ASME B29.100",
    pitch_in: "3.000",
    pitch_mm: "76.20",
    description: "Engineering class 81X/81XH/81XHH bushed chain sprockets. Donghua catalog section pp.290–296. Available in split configurations for field installation. Rexnord/Link-Belt interchangeable.",
    specs: {
      type: "Engineering class sprocket reference",
      pitch_in: "3.000",
      chain_compatibility: ["81X","81XH","81XHH"],
    },
    sprocket_compatibility: {
      series: "ENG-81X",
      tooth_range: "5–30 teeth",
      common_teeth: [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 18, 20, 24, 30],
      bore_styles: ["plain_bore", "keyway", "QD_bushing", "taper_lock", "split"],
      materials: ["cast_iron", "carbon_steel", "hardened_steel", "ductile_iron"],
      split_sprocket_available: true,
      hardened_teeth_available: true,
      rexnord_interchangeable: true,
      link_belt_interchangeable: true,
      catalog_page_sprockets: "290",
      notes: "Split sprockets strongly recommended for cement/mining installations. 5-tooth minimum for slow-speed high-load applications.",
    },
    source_refs: [
      { manufacturer: "Donghua", code: "SPKT-81X", confidence: "Confirmed",
        catalog_url: DH_CATALOG_URL, catalog_page: "290" },
      { manufacturer: "Rexnord", code: "81X-SPKT", confidence: "Confirmed",
        notes: "Rexnord 81X sprockets are interchangeable with Donghua" },
    ],
    attachments_available: [],
    sprocket_series: "ENG-81X",
    materials_available: ["cast_iron", "carbon_steel", "hardened_steel"],
    options_upgrades: ["Split configuration", "Hardened tooth profile", "Ductile iron upgrade"],
    downloads: [
      { label: "Donghua Engineering Sprocket Catalog", url: DH_CATALOG_URL, type: "pdf", page_ref: "290" },
    ],
    image_strategy: "family",
    status: "Active",
  },

  {
    chain_id: "DH-SPKT-WR-WD",
    chain_family: "specialty_custom",
    chain_number: "SPKT-WR-WD",
    display_name: "WR/WD Welded Drag Chain Sprockets",
    standard: "ASME B29.100",
    pitch_in: "varies",
    pitch_mm: "varies",
    description: "WR78/WD78/WR110/WR124 welded drag chain sprockets. Donghua catalog pp.293–297. Cast iron or steel, split construction available for drag conveyor installation without shaft removal.",
    specs: {
      type: "Welded drag chain sprocket reference",
      chain_compatibility: ["WR78","WD78","WR110","WR124"],
    },
    sprocket_compatibility: {
      series: "WR-WD",
      pitch_range_in: "3.075 – 4.760",
      tooth_range: "5–18 teeth",
      bore_styles: ["plain_bore", "keyway", "split"],
      materials: ["cast_iron", "carbon_steel", "hardened_steel"],
      split_sprocket_available: true,
      catalog_page_sprockets: "293",
      notes: "Split sprockets available for most WR/WD sizes. Hardened tooth tips extend life in abrasive environments.",
    },
    source_refs: [
      { manufacturer: "Donghua", code: "SPKT-WR-WD", confidence: "Confirmed",
        catalog_url: DH_CATALOG_URL, catalog_page: "293" },
    ],
    attachments_available: [],
    sprocket_series: "WR-WD-ALL",
    materials_available: ["cast_iron", "hardened_steel"],
    options_upgrades: ["Split configuration", "Hardened teeth"],
    downloads: [
      { label: "Donghua WR/WD Sprocket Section", url: DH_CATALOG_URL, type: "pdf", page_ref: "293" },
    ],
    image_strategy: "family",
    status: "Active",
  },

  // ══════════════════════════════════════════════════════════════════
  // PHASE 4I — STAINLESS BS/ISO CHAIN VARIANTS
  // SS304/316 versions of BS roller chains — Donghua confirmed
  // ══════════════════════════════════════════════════════════════════

  {
    chain_id: "SS304-12B",
    chain_family: "performance_roller",
    chain_number: "12B-SS",
    display_name: "12B Stainless Steel Roller Chain",
    standard: "ISO 606",
    pitch_in: "0.750",
    pitch_mm: "19.05",
    description: "BS/ISO 12B fully stainless steel (304SS) roller chain. 3/4\" pitch corrosion-resistant chain for European food processing, chemical, and pharmaceutical applications.",
    specs: {
      pitch_mm: "19.05", pitch_in: "0.750",
      roller_dia_mm: "12.07", inner_width_mm: "11.68",
      avg_ultimate_lbs: "5900",
    },
    performance_tiers: [
      { tier: "standard", tensile_strength_lbs: "5900", working_load_lbs: "1330",
        source: "Donghua catalog p.203", notes: "304SS 12B. ~10% tensile reduction vs carbon steel 12B. Specification varies by manufacturer." },
    ],
    source_refs: [
      { manufacturer: "Donghua", code: "12B-1SS", confidence: "Confirmed",
        catalog_url: DH_CATALOG_URL, catalog_page: "203" },
      { manufacturer: "Iwis", code: "12B-1SS", confidence: "Confirmed" },
    ],
    attachments_available: [],
    sprocket_series: "BS-12B",
    materials_available: ["stainless_304", "stainless_316"],
    options_upgrades: ["316SS upgrade"],
    image_strategy: "family",
    status: "Active",
  },

  {
    chain_id: "SS304-16B",
    chain_family: "performance_roller",
    chain_number: "16B-SS",
    display_name: "16B Stainless Steel Roller Chain",
    standard: "ISO 606",
    pitch_in: "1.000",
    pitch_mm: "25.40",
    description: "BS/ISO 16B fully stainless steel (304SS) roller chain. 1\" pitch for European heavy-duty corrosion-resistant drives in food, chemical, and marine applications.",
    specs: {
      pitch_mm: "25.40", pitch_in: "1.000",
      roller_dia_mm: "15.88",
      avg_ultimate_lbs: "12200",
    },
    performance_tiers: [
      { tier: "standard", tensile_strength_lbs: "12200", working_load_lbs: "2750",
        source: "Donghua catalog p.204", notes: "304SS 16B. Specification varies by manufacturer." },
    ],
    source_refs: [
      { manufacturer: "Donghua", code: "16B-1SS", confidence: "Confirmed",
        catalog_url: DH_CATALOG_URL, catalog_page: "204" },
      { manufacturer: "Renold", code: "16B-1SS", confidence: "Confirmed" },
    ],
    attachments_available: ["A1", "A2", "K1", "K2"],
    sprocket_series: "BS-16B",
    materials_available: ["stainless_304", "stainless_316"],
    options_upgrades: ["316SS for chloride environments", "Double strand SS 16B-2"],
    image_strategy: "family",
    status: "Active",
  },

  // ══════════════════════════════════════════════════════════════════
  // PHASE 4J — CONNECTING LINKS (BS sizes, heavy-series, cottered)
  // Extends Phase 3J connecting link / offset link coverage
  // ══════════════════════════════════════════════════════════════════

  {
    chain_id: "DH-LINK-CONN-100",
    chain_family: "specialty_custom",
    chain_number: "CL-100",
    display_name: "No.100 Connecting Link",
    standard: "ANSI B29.1",
    pitch_in: "1.250",
    pitch_mm: "31.75",
    description: "Connecting link for ANSI 100 roller chain. Spring clip or cotter pin type. For chains requiring field joining.",
    specs: { pitch_in: "1.250", chain_no: "100", link_type: "Spring clip / Cotter pin" },
    performance_tiers: [
      { tier: "standard", tensile_strength_lbs: "24000", working_load_lbs: "4800",
        source: "Donghua catalog p.281" },
    ],
    source_refs: [
      { manufacturer: "Donghua", code: "CL-100", confidence: "Confirmed",
        catalog_url: DH_CATALOG_URL, catalog_page: "281" },
    ],
    attachments_available: [],
    sprocket_series: "ANSI-100",
    materials_available: ["carbon_steel", "stainless_304"],
    options_upgrades: [],
    image_strategy: "family",
    status: "Active",
  },

  {
    chain_id: "DH-LINK-CONN-120",
    chain_family: "specialty_custom",
    chain_number: "CL-120",
    display_name: "No.120 Connecting Link",
    standard: "ANSI B29.1",
    pitch_in: "1.500",
    pitch_mm: "38.10",
    description: "Connecting link for ANSI 120 roller chain. Cotter pin type standard at this pitch for security.",
    specs: { pitch_in: "1.500", chain_no: "120", link_type: "Cotter pin" },
    performance_tiers: [
      { tier: "standard", tensile_strength_lbs: "32000", working_load_lbs: "6400",
        source: "Donghua catalog p.282" },
    ],
    source_refs: [
      { manufacturer: "Donghua", code: "CL-120", confidence: "Confirmed",
        catalog_url: DH_CATALOG_URL, catalog_page: "282" },
    ],
    attachments_available: [],
    sprocket_series: "ANSI-120",
    materials_available: ["carbon_steel"],
    options_upgrades: [],
    image_strategy: "family",
    status: "Active",
  },

  {
    chain_id: "DH-LINK-CONN-08B",
    chain_family: "specialty_custom",
    chain_number: "CL-08B",
    display_name: "08B Connecting Link (BS/ISO)",
    standard: "ISO 606",
    pitch_in: "0.500",
    pitch_mm: "12.70",
    description: "Connecting link for BS/ISO 08B roller chain. Spring clip type. Standard joining link for 1/2\" BS chain.",
    specs: { pitch_mm: "12.70", chain_no: "08B", link_type: "Spring clip" },
    performance_tiers: [
      { tier: "standard", tensile_strength_lbs: "3800", working_load_lbs: "860",
        source: "Donghua catalog p.283" },
    ],
    source_refs: [
      { manufacturer: "Donghua", code: "CL-08B", confidence: "Confirmed",
        catalog_url: DH_CATALOG_URL, catalog_page: "283" },
    ],
    attachments_available: [],
    sprocket_series: "BS-08B",
    materials_available: ["carbon_steel", "stainless_304"],
    options_upgrades: [],
    image_strategy: "family",
    status: "Active",
  },

  {
    chain_id: "DH-LINK-CONN-16B",
    chain_family: "specialty_custom",
    chain_number: "CL-16B",
    display_name: "16B Connecting Link (BS/ISO)",
    standard: "ISO 606",
    pitch_in: "1.000",
    pitch_mm: "25.40",
    description: "Connecting link for BS/ISO 16B roller chain. Cotter pin type standard at this pitch.",
    specs: { pitch_mm: "25.40", chain_no: "16B", link_type: "Cotter pin" },
    performance_tiers: [
      { tier: "standard", tensile_strength_lbs: "13500", working_load_lbs: "3060",
        source: "Donghua catalog p.283" },
    ],
    source_refs: [
      { manufacturer: "Donghua", code: "CL-16B", confidence: "Confirmed",
        catalog_url: DH_CATALOG_URL, catalog_page: "283" },
    ],
    attachments_available: [],
    sprocket_series: "BS-16B",
    materials_available: ["carbon_steel", "stainless_304"],
    options_upgrades: [],
    image_strategy: "family",
    status: "Active",
  },

  {
    chain_id: "DH-LINK-OFFSET-60",
    chain_family: "specialty_custom",
    chain_number: "OL-60",
    display_name: "No.60 Offset Link (Half Link)",
    standard: "ANSI B29.1",
    pitch_in: "0.750",
    pitch_mm: "19.05",
    description: "Offset link (half link) for ANSI 60 chain. Allows odd-number chain lengths. Approx 75% of chain tensile.",
    specs: { pitch_in: "0.750", chain_no: "60", link_type: "Offset (half link)", strength_factor: "~75% of chain tensile" },
    performance_tiers: [
      { tier: "standard", tensile_strength_lbs: "6375", working_load_lbs: "1275",
        source: "Donghua catalog p.280", notes: "Offset link — ~75% tensile. Use sparingly." },
    ],
    source_refs: [
      { manufacturer: "Donghua", code: "OL-60", confidence: "Confirmed",
        catalog_url: DH_CATALOG_URL, catalog_page: "280" },
    ],
    attachments_available: [],
    sprocket_series: "ANSI-60",
    materials_available: ["carbon_steel"],
    options_upgrades: [],
    image_strategy: "family",
    status: "Active",
  },

  // ══════════════════════════════════════════════════════════════════
  // PHASE 4K — ADDITIONAL AGRICULTURAL CHAINS
  // CA620 variants, additional F-series, and S-series
  // ══════════════════════════════════════════════════════════════════

  {
    chain_id: "CA620F2",
    chain_family: "agricultural_conveyor",
    chain_number: "CA620F2",
    display_name: "CA620F2 Agricultural Chain with F2 Flight",
    standard: "ASME B29.200",
    pitch_in: "1.972",
    pitch_mm: "50.09",
    description: "CA620 agricultural chain with F2 flight attachments for grain elevator legs and bucket elevator casings.",
    specs: {
      pitch_in: "1.972", pitch_mm: "50.09",
      attachment_type: "F2",
      avg_ultimate_lbs: "20500", max_working_load_lbs: "4100",
    },
    performance_tiers: [
      { tier: "standard", tensile_strength_lbs: "20500", working_load_lbs: "4100",
        source: "Donghua catalog p.172, ASME B29.200" },
    ],
    source_refs: [
      { manufacturer: "Donghua", code: "CA620F2", confidence: "Confirmed",
        catalog_url: DH_CATALOG_URL, catalog_page: "172" },
    ],
    attachments_available: ["AGRI-F2"],
    sprocket_series: "CA620",
    materials_available: ["carbon_steel"],
    options_upgrades: [],
    image_strategy: "family",
    status: "Active",
  },

  {
    chain_id: "S88F7",
    chain_family: "agricultural_conveyor",
    chain_number: "S88F7",
    display_name: "S88F7 Agricultural Chain with F7 Attachment",
    standard: "ASME B29.200",
    pitch_in: "2.609",
    pitch_mm: "66.27",
    description: "S88 steel pintle-style agricultural chain with F7 broad flat-tab attachments. For wide-platform hay conveyors, straw walkers, and chaff handling in combines.",
    specs: {
      pitch_in: "2.609", pitch_mm: "66.27",
      attachment_type: "F7",
      avg_ultimate_lbs: "10000", max_working_load_lbs: "2000",
    },
    performance_tiers: [
      { tier: "standard", tensile_strength_lbs: "10000", working_load_lbs: "2000",
        source: "Donghua catalog p.178, ASME B29.200" },
    ],
    source_refs: [
      { manufacturer: "Donghua", code: "S88F7", confidence: "Confirmed",
        catalog_url: DH_CATALOG_URL, catalog_page: "178" },
    ],
    attachments_available: ["AGRI-F7"],
    sprocket_series: "S88",
    materials_available: ["carbon_steel"],
    options_upgrades: [],
    image_strategy: "family",
    status: "Active",
  },

  {
    chain_id: "S102BF11",
    chain_family: "agricultural_conveyor",
    chain_number: "S102BF11",
    display_name: "S102B Agricultural Chain with F11 Attachment",
    standard: "ASME B29.200",
    pitch_in: "4.000",
    pitch_mm: "101.60",
    description: "S102B large-pitch agricultural chain with F11 extended flat attachments for heavy duty combine platforms and industrial grain conveyor flights.",
    specs: {
      pitch_in: "4.000", pitch_mm: "101.60",
      attachment_type: "F11",
      avg_ultimate_lbs: "18000", max_working_load_lbs: "3600",
    },
    performance_tiers: [
      { tier: "standard", tensile_strength_lbs: "18000", working_load_lbs: "3600",
        source: "Donghua catalog p.179, ASME B29.200" },
    ],
    source_refs: [
      { manufacturer: "Donghua", code: "S102BF11", confidence: "Confirmed",
        catalog_url: DH_CATALOG_URL, catalog_page: "179" },
    ],
    attachments_available: ["AGRI-F11"],
    sprocket_series: "S102",
    materials_available: ["carbon_steel"],
    options_upgrades: [],
    image_strategy: "family",
    status: "Active",
  },

  // ══════════════════════════════════════════════════════════════════
  // PHASE 4L — DOWNLOADS / TECHNICAL DRAWING REFERENCES
  // Master catalog reference record for the full Donghua catalog.
  // Individual chain records already have downloads[] arrays.
  // This entry provides the catalog-level download index.
  // ══════════════════════════════════════════════════════════════════

  {
    chain_id: "DH-CATALOG-MASTER",
    chain_family: "specialty_custom",
    chain_number: "DH-CATALOG-2020",
    display_name: "Donghua Chain Group Product Catalogue 2020 — Full Reference",
    standard: "Various",
    pitch_in: "varies",
    pitch_mm: "varies",
    description: "Master reference record for the Donghua Chain Group Product Catalogue 2020. Contains full dimensional tables, material specifications, application notes, and sprocket data for over 12,000 chain varieties. Source document for all Donghua entries in this normalized catalog.",
    specs: {
      type: "Catalog reference record",
      publisher: "Hangzhou Donghua Chain Group Co., Ltd.",
      year: "2020",
      pages: "320+",
      catalog_url: DH_CATALOG_URL,
    },
    performance_tiers: [],
    source_refs: [
      { manufacturer: "Donghua", code: "CATALOG-2020", confidence: "Confirmed",
        catalog_url: DH_CATALOG_URL, catalog_page: "1",
        notes: "Full catalog download. Source of truth for all DH entries." },
    ],
    downloads: [
      {
        label: "Donghua Chain Group Product Catalogue 2020 (Full PDF)",
        url: DH_CATALOG_URL,
        type: "pdf",
        description: "Full 320+ page catalog. Sections: A-Drive Chains (1–72), B-Conveyor Chains (73–128), C-Engineering Chains (129–168), D-Agricultural (169–196), E-Stainless (197–220), F-Leaf Chains (221–240), G-Escalator (241–248), H-Specialty (249–280), I-Sprockets (281–320).",
      },
      {
        label: "Donghua Website (English)",
        url: "http://www.dhchain.com",
        type: "website",
        description: "Donghua Chain Group official English website for latest product updates.",
      },
      {
        label: "Donghua USA",
        url: "http://www.dhchain.us",
        type: "website",
        description: "Donghua USA Inc. — North American sales and technical support.",
      },
    ],
    attachments_available: [],
    sprocket_series: null,
    materials_available: [],
    options_upgrades: [],
    image_strategy: "none",
    status: "Active",
  },

];

export default {
  DH_PHASE4_MERGE_REFS,
  DH_PHASE4_NEW_CHAINS,
};