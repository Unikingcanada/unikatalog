/**
 * alliedLockeSourceRecord.js
 *
 * Official Allied-Locke source record for the Uniking chain procurement platform.
 *
 * SOURCE ID:    allied_locke_official
 * IMPORT DATE:  2026-05-06
 * SOURCE URL:   https://chains.alliedlocke.com/category/all-categories
 * TRUST LEVEL:  Trusted (Priority 1)
 * SCOPE:        Chains ecosystem ONLY
 *
 * NORMALIZATION RULES (per import JSON):
 *   - brand_specific_products: false (no Allied-Locke-only duplicates)
 *   - merge_equivalent_chain_numbers: true
 *   - preserve_source_specific_specs: true
 *   - do_not_overwrite_baseline_dimensions: true
 *   - flag_conflicts: true → label "Specification varies by manufacturer"
 *   - unmappable products → flag "Missing Data – Needs Mapping"
 *
 * DISPLAY NOTE: Allied-Locke "Precision Roller Chains" maps to "Performance Roller Chains"
 *
 * USAGE:
 *   import { AL_SOURCE, AL_CATEGORIES, AL_CHAIN_SPECS, AL_ATTACHMENTS } from "@/lib/alliedLockeSourceRecord";
 */

// ─── Source Record ─────────────────────────────────────────────────────────────

export const AL_SOURCE = {
  source_id: "allied_locke_official",
  manufacturer: "Allied-Locke",
  source_type: "official_website",
  trusted_source: true,
  priority: 1,
  category_scope: "Chains",
  website_url: "https://chains.alliedlocke.com/category/all-categories",
  import_date: "2026-05-06",
  allowed_content: [
    "roller chains",
    "precision roller chains",
    "conveyor chains",
    "agricultural chains",
    "engineering class chains",
    "attachments",
    "sprockets",
    "related chain components",
  ],
  excluded_content: [
    "bearings", "shafts", "motors", "non-chain products",
  ],
  normalization_rules: {
    brand_specific_products: false,
    merge_equivalent_chain_numbers: true,
    preserve_source_specific_specs: true,
    do_not_overwrite_baseline_dimensions: true,
    flag_conflicts: true,
  },
  mapping_targets: [
    "normalized_chains",
    "attachments",
    "sprockets",
    "pins_connecting_links",
    "materials_coatings",
    "source_data",
  ],
  confidence_default: "Confirmed",
  notes: "Allied-Locke Precision Roller Chains maps to Performance Roller Chains in Uniking. Official spec data supersedes generic ANSI specs where Allied-Locke values are confirmed.",
};

// ─── Allied-Locke Category → Uniking Family Mapping ───────────────────────────

export const AL_CATEGORIES = {
  "precision-roller-chains":              "performance_roller",
  "ansi-roller-chains":                   "performance_roller",
  "double-pitch-roller-chains":           "double_pitch_conveyor",
  "british-standard-chains":              "performance_roller",
  "super-series":                         "performance_roller",
  "solid-bushing-solid-roller-chains":    "performance_roller",
  "double-capacity":                      "performance_roller",
  "xdo":                                  "performance_roller",
  "nickel-plated-chains":                 "performance_roller",
  "stainless-steel-chains":              "performance_roller",
  "armor-coat-chains":                    "performance_roller",
  "self-lube-chains":                     "performance_roller",
  "self-lube-bushing-chains":             "performance_roller",
  "leaf-chains":                          "leaf_chain",
  "silent-chain-inverted-tooth":          "specialty_custom",
  "agricultural-roller-chains":           "agricultural_conveyor",
  "steel-pintle-chains":                  "steel_pintle",
  "steel-detachable-chains":              "agricultural_conveyor",
  "t-bar-chains":                         "agricultural_conveyor",
  "t-rod-chains":                         "agricultural_conveyor",
  "welded-steel-chains":                  "welded_steel",
  "welded-mill-chains":                   "welded_steel",
  "welded-drag-chains":                   "drag_scraper",
  "ss-class-bushed-steel-chains":         "steel_bushed",
  "msr-class-bushed-roller-steel-chains": "engineered_class",
  "mxs-class-offset-steel-drive-chains":  "specialty_custom",
  "rivetless-drop-forged-chains":         "drop_forged_rivetless",
  "combination-chains":                   "engineered_class",
  "h-class-mill-drag-transfer-chains":    "engineered_class",
  "cast-manganese-and-alloy-steel-chains":"bucket_elevator",
  "precision-roller-chain-attachments":   "attachments",
  "welded-steel-chain-attachments":       "attachments",
  "agricultural-pintle-detachable-attachments": "attachments",
};

// ─── Allied-Locke Official ANSI Single-Strand Specs (from live catalog) ────────
// Source: https://chains.alliedlocke.com/viewitems/ansi-roller-chains/ansi-single-strand-roller-chains
// All dimensions in inches. Tensile in lbs.

export const AL_ANSI_SINGLE_STRAND = [
  {
    chain_number: "25",
    normalized_chain_id: "ANSI-25",
    al_product_code: "25",
    al_url: "https://chains.alliedlocke.com/item/ansi-roller-chains/ansi-single-strand-roller-chains/item-1001",
    al_image_url: "https://chains.alliedlocke.com/ImgMedium/PRC%20Ansi%20Drawing.jpg",
    al_drawing_url: "https://chains.alliedlocke.com/ImgMedium/PRC%20Ansi%20Drawing.jpg",
    al_category_url: "https://chains.alliedlocke.com/category/ansi-roller-chains",
    specs: {
      pitch_in: "0.250", roller_width_in: "0.125", roller_dia_in: "0.130",
      riv_end_to_cl_in: "0.153", conn_end_to_cl_in: "0.189",
      link_plate_height_in: "0.228", link_plate_thickness_in: "0.029",
      pin_dia_in: "0.091",
    },
    avg_ultimate_lbs: 930,
    confidence: "Confirmed",
    conflict_notes: null,
  },
  {
    chain_number: "35",
    normalized_chain_id: "ANSI-35",
    al_product_code: "35",
    al_url: "https://chains.alliedlocke.com/item/ansi-roller-chains/ansi-single-strand-roller-chains/item-1002",
    al_image_url: "https://chains.alliedlocke.com/ImgMedium/PRC%20Ansi%20Drawing.jpg",
    al_drawing_url: "https://chains.alliedlocke.com/ImgMedium/PRC%20Ansi%20Drawing.jpg",
    al_category_url: "https://chains.alliedlocke.com/category/ansi-roller-chains",
    specs: {
      pitch_in: "0.375", roller_width_in: "0.188", roller_dia_in: "0.200",
      riv_end_to_cl_in: "0.228", conn_end_to_cl_in: "0.276",
      link_plate_height_in: "0.356", link_plate_thickness_in: "0.050",
      pin_dia_in: "0.141",
    },
    avg_ultimate_lbs: 2320,
    confidence: "Confirmed",
    conflict_notes: "AL tensile 2,320 lb vs ANSI B29.1 nominal 2,100 lb — specification varies by manufacturer.",
  },
  {
    chain_number: "40",
    normalized_chain_id: "ANSI-40",
    al_product_code: "40",
    al_url: "https://chains.alliedlocke.com/item/ansi-roller-chains/ansi-single-strand-roller-chains/item-1003",
    al_image_url: "https://chains.alliedlocke.com/ImgMedium/PRC%20Ansi%20Drawing.jpg",
    al_drawing_url: "https://chains.alliedlocke.com/ImgMedium/PRC%20Ansi%20Drawing.jpg",
    al_category_url: "https://chains.alliedlocke.com/category/ansi-roller-chains",
    specs: {
      pitch_in: "0.500", roller_width_in: "0.312", roller_dia_in: "0.312",
      riv_end_to_cl_in: "0.321", conn_end_to_cl_in: "0.368",
      link_plate_height_in: "0.475", link_plate_thickness_in: "0.058",
      pin_dia_in: "0.156",
    },
    avg_ultimate_lbs: 3970,
    confidence: "Confirmed",
    conflict_notes: "AL tensile 3,970 lb vs ANSI B29.1 nominal 3,700 lb — specification varies by manufacturer.",
  },
  {
    chain_number: "41",
    normalized_chain_id: "ANSI-41",
    al_product_code: "41",
    al_url: "https://chains.alliedlocke.com/item/ansi-roller-chains/ansi-single-strand-roller-chains/item-1004",
    al_image_url: "https://chains.alliedlocke.com/ImgMedium/PRC%20Ansi%20Drawing.jpg",
    al_drawing_url: "https://chains.alliedlocke.com/ImgMedium/PRC%20Ansi%20Drawing.jpg",
    al_category_url: "https://chains.alliedlocke.com/category/ansi-roller-chains",
    specs: {
      pitch_in: "0.500", roller_width_in: "0.250", roller_dia_in: "0.306",
      riv_end_to_cl_in: "0.261", conn_end_to_cl_in: "0.314",
      link_plate_height_in: "0.390", link_plate_thickness_in: "0.050",
      pin_dia_in: "0.141",
    },
    avg_ultimate_lbs: 2760,
    confidence: "Confirmed",
    conflict_notes: null,
  },
  {
    chain_number: "50",
    normalized_chain_id: "ANSI-50",
    al_product_code: "50",
    al_url: "https://chains.alliedlocke.com/item/ansi-roller-chains/ansi-single-strand-roller-chains/item-1005",
    al_image_url: "https://chains.alliedlocke.com/ImgMedium/PRC%20Ansi%20Drawing.jpg",
    al_drawing_url: "https://chains.alliedlocke.com/ImgMedium/PRC%20Ansi%20Drawing.jpg",
    al_category_url: "https://chains.alliedlocke.com/category/ansi-roller-chains",
    specs: {
      pitch_in: "0.625", roller_width_in: "0.375", roller_dia_in: "0.400",
      riv_end_to_cl_in: "0.397", conn_end_to_cl_in: "0.455",
      link_plate_height_in: "0.594", link_plate_thickness_in: "0.079",
      pin_dia_in: "0.200",
    },
    avg_ultimate_lbs: 6620,
    confidence: "Confirmed",
    conflict_notes: "AL tensile 6,620 lb vs ANSI B29.1 nominal 6,100 lb — specification varies by manufacturer.",
  },
  {
    chain_number: "60",
    normalized_chain_id: "ANSI-60",
    al_product_code: "60",
    al_url: "https://chains.alliedlocke.com/item/ansi-roller-chains/ansi-single-strand-roller-chains/item-1006",
    al_image_url: "https://chains.alliedlocke.com/ImgMedium/PRC%20Ansi%20Drawing.jpg",
    al_drawing_url: "https://chains.alliedlocke.com/ImgMedium/PRC%20Ansi%20Drawing.jpg",
    al_category_url: "https://chains.alliedlocke.com/category/ansi-roller-chains",
    specs: {
      pitch_in: "0.750", roller_width_in: "0.500", roller_dia_in: "0.469",
      riv_end_to_cl_in: "0.497", conn_end_to_cl_in: "0.551",
      link_plate_height_in: "0.712", link_plate_thickness_in: "0.093",
      pin_dia_in: "0.234",
    },
    avg_ultimate_lbs: 9270,
    confidence: "Confirmed",
    conflict_notes: "AL tensile 9,270 lb vs ANSI B29.1 nominal 8,500 lb — specification varies by manufacturer.",
  },
  {
    chain_number: "80",
    normalized_chain_id: "ANSI-80",
    al_product_code: "80",
    al_url: "https://chains.alliedlocke.com/item/ansi-roller-chains/ansi-single-strand-roller-chains/item-1007",
    al_image_url: "https://chains.alliedlocke.com/ImgMedium/PRC%20Ansi%20Drawing.jpg",
    al_drawing_url: "https://chains.alliedlocke.com/ImgMedium/PRC%20Ansi%20Drawing.jpg",
    al_category_url: "https://chains.alliedlocke.com/category/ansi-roller-chains",
    specs: {
      pitch_in: "1.000", roller_width_in: "0.625", roller_dia_in: "0.625",
      riv_end_to_cl_in: "0.645", conn_end_to_cl_in: "0.724",
      link_plate_height_in: "0.950", link_plate_thickness_in: "0.125",
      pin_dia_in: "0.312",
    },
    avg_ultimate_lbs: 16540,
    confidence: "Confirmed",
    conflict_notes: "AL tensile 16,540 lb vs ANSI B29.1 nominal 14,500 lb — specification varies by manufacturer.",
  },
  {
    chain_number: "100",
    normalized_chain_id: "ANSI-100",
    al_product_code: "100",
    al_url: "https://chains.alliedlocke.com/item/ansi-roller-chains/ansi-single-strand-roller-chains/item-1008",
    al_image_url: "https://chains.alliedlocke.com/ImgMedium/PRC%20Ansi%20Drawing.jpg",
    al_drawing_url: "https://chains.alliedlocke.com/ImgMedium/PRC%20Ansi%20Drawing.jpg",
    al_category_url: "https://chains.alliedlocke.com/category/ansi-roller-chains",
    specs: {
      pitch_in: "1.250", roller_width_in: "0.750", roller_dia_in: "0.750",
      riv_end_to_cl_in: "0.789", conn_end_to_cl_in: "0.941",
      link_plate_height_in: "1.188", link_plate_thickness_in: "0.157",
      pin_dia_in: "0.375",
    },
    avg_ultimate_lbs: 25360,
    confidence: "Confirmed",
    conflict_notes: "AL tensile 25,360 lb vs ANSI B29.1 nominal 24,000 lb — specification varies by manufacturer.",
  },
  {
    chain_number: "120",
    normalized_chain_id: "ANSI-120",
    al_product_code: "120",
    al_url: "https://chains.alliedlocke.com/item/ansi-roller-chains/ansi-single-strand-roller-chains/item-1009",
    al_image_url: "https://chains.alliedlocke.com/ImgMedium/PRC%20Ansi%20Drawing.jpg",
    al_drawing_url: "https://chains.alliedlocke.com/ImgMedium/PRC%20Ansi%20Drawing.jpg",
    al_category_url: "https://chains.alliedlocke.com/category/ansi-roller-chains",
    specs: {
      pitch_in: "1.500", roller_width_in: "1.000", roller_dia_in: "0.875",
      riv_end_to_cl_in: "0.983", conn_end_to_cl_in: "1.219",
      link_plate_height_in: "1.425", link_plate_thickness_in: "0.189",
      pin_dia_in: "0.437",
    },
    avg_ultimate_lbs: 32640,
    confidence: "Confirmed",
    conflict_notes: "AL tensile 32,640 lb vs ANSI B29.1 nominal 34,000 lb — specification varies by manufacturer.",
  },
  {
    chain_number: "140",
    normalized_chain_id: "ANSI-140",
    al_product_code: "140",
    al_url: "https://chains.alliedlocke.com/item/ansi-roller-chains/ansi-single-strand-roller-chains/item-1010",
    al_image_url: "https://chains.alliedlocke.com/ImgMedium/PRC%20Ansi%20Drawing.jpg",
    al_drawing_url: "https://chains.alliedlocke.com/ImgMedium/PRC%20Ansi%20Drawing.jpg",
    al_category_url: "https://chains.alliedlocke.com/category/ansi-roller-chains",
    specs: {
      pitch_in: "1.750", roller_width_in: "1.000", roller_dia_in: "1.000",
      riv_end_to_cl_in: "1.066", conn_end_to_cl_in: "1.259",
      link_plate_height_in: "1.663", link_plate_thickness_in: "0.219",
      pin_dia_in: "0.500",
    },
    avg_ultimate_lbs: 45210,
    confidence: "Confirmed",
    conflict_notes: null,
  },
  {
    chain_number: "160",
    normalized_chain_id: "ANSI-160",
    al_product_code: "160",
    al_url: "https://chains.alliedlocke.com/item/ansi-roller-chains/ansi-single-strand-roller-chains/item-1011",
    al_image_url: "https://chains.alliedlocke.com/ImgMedium/PRC%20Ansi%20Drawing.jpg",
    al_drawing_url: "https://chains.alliedlocke.com/ImgMedium/PRC%20Ansi%20Drawing.jpg",
    al_category_url: "https://chains.alliedlocke.com/category/ansi-roller-chains",
    specs: {
      pitch_in: "2.000", roller_width_in: "1.250", roller_dia_in: "1.125",
      riv_end_to_cl_in: "1.282", conn_end_to_cl_in: "1.469",
      link_plate_height_in: "1.901", link_plate_thickness_in: "0.255",
      pin_dia_in: "0.563",
    },
    avg_ultimate_lbs: 57780,
    confidence: "Confirmed",
    conflict_notes: "AL tensile 57,780 lb vs ANSI B29.1 nominal 58,000 lb — specification varies by manufacturer.",
  },
  {
    chain_number: "180",
    normalized_chain_id: "ANSI-180",
    al_product_code: "180",
    al_url: "https://chains.alliedlocke.com/item/ansi-roller-chains/ansi-single-strand-roller-chains/item-1012",
    al_image_url: "https://chains.alliedlocke.com/ImgMedium/PRC%20Ansi%20Drawing.jpg",
    al_drawing_url: "https://chains.alliedlocke.com/ImgMedium/PRC%20Ansi%20Drawing.jpg",
    al_category_url: "https://chains.alliedlocke.com/category/ansi-roller-chains",
    specs: {
      pitch_in: "2.250", roller_width_in: "1.406", roller_dia_in: "1.406",
      riv_end_to_cl_in: "1.404", conn_end_to_cl_in: "1.675",
      link_plate_height_in: "2.130", link_plate_thickness_in: "0.283",
      pin_dia_in: "0.687",
    },
    avg_ultimate_lbs: 80480,
    confidence: "Confirmed",
    conflict_notes: null,
  },
  {
    chain_number: "200",
    normalized_chain_id: "ANSI-200",
    al_product_code: "200",
    al_url: "https://chains.alliedlocke.com/item/ansi-roller-chains/ansi-single-strand-roller-chains/item-1013",
    al_image_url: "https://chains.alliedlocke.com/ImgMedium/PRC%20Ansi%20Drawing.jpg",
    al_drawing_url: "https://chains.alliedlocke.com/ImgMedium/PRC%20Ansi%20Drawing.jpg",
    al_category_url: "https://chains.alliedlocke.com/category/ansi-roller-chains",
    specs: {
      pitch_in: "2.500", roller_width_in: "1.500", roller_dia_in: "1.562",
      riv_end_to_cl_in: "1.580", conn_end_to_cl_in: "1.764",
      link_plate_height_in: "2.376", link_plate_thickness_in: "0.312",
      pin_dia_in: "0.782",
    },
    avg_ultimate_lbs: 109150,
    confidence: "Confirmed",
    conflict_notes: null,
  },
  {
    chain_number: "240",
    normalized_chain_id: "ANSI-240",
    al_product_code: "240",
    al_url: "https://chains.alliedlocke.com/item/ansi-roller-chains/ansi-single-strand-roller-chains/item-1014",
    al_image_url: "https://chains.alliedlocke.com/ImgMedium/PRC%20Ansi%20Drawing.jpg",
    al_drawing_url: "https://chains.alliedlocke.com/ImgMedium/PRC%20Ansi%20Drawing.jpg",
    al_category_url: "https://chains.alliedlocke.com/category/ansi-roller-chains",
    specs: {
      pitch_in: "3.000", roller_width_in: "1.875", roller_dia_in: "1.875",
      riv_end_to_cl_in: "1.886", conn_end_to_cl_in: "2.184",
      link_plate_height_in: "2.850", link_plate_thickness_in: "0.375",
      pin_dia_in: "0.937",
    },
    avg_ultimate_lbs: 152140,
    confidence: "Confirmed",
    conflict_notes: null,
  },
];

// ─── Allied-Locke Welded Mill Chain Specs (from live catalog) ──────────────────
// Source: https://chains.alliedlocke.com/viewitems/welded-steel-chains/welded-mill-chains
// Dimensions in inches. Working load in lbs.

export const AL_WELDED_MILL_CHAINS = [
  {
    chain_number: "WH188", normalized_chain_id: "WH-188",
    al_product_code: "WH188",
    al_url: "https://chains.alliedlocke.com/item/welded-steel-chains/welded-mill-chains/wh188",
    al_image_url: "https://chains.alliedlocke.com/ImgMedium/WH124.jpg",
    specs: { pitch_in: "2.609", rivet_dia_in: "0.500", sidebar_width_in: "1.12", barrel_dia_in: "0.88", max_sprocket_face_in: "0.88", bearing_length_in: "1.62" },
    max_working_load_lbs: 2850, confidence: "Confirmed", conflict_notes: null,
  },
  {
    chain_number: "WH78", normalized_chain_id: "WH-78",
    al_product_code: "WH78",
    al_url: "https://chains.alliedlocke.com/item/welded-steel-chains/welded-mill-chains/wh78",
    al_image_url: "https://chains.alliedlocke.com/ImgMedium/WH124.jpg",
    specs: { pitch_in: "2.609", rivet_dia_in: "0.500", sidebar_width_in: "1.12", barrel_dia_in: "0.88", max_sprocket_face_in: "1.12", bearing_length_in: "2.00" },
    max_working_load_lbs: 3500, confidence: "Confirmed",
    conflict_notes: "AL working load 3,500 lb vs baseline 3,600 lb — specification varies by manufacturer.",
  },
  {
    chain_number: "WH78-4", normalized_chain_id: "WH-78-4",
    al_product_code: "WH78-4",
    al_url: "https://chains.alliedlocke.com/item/welded-steel-chains/welded-mill-chains/wh78-4",
    al_image_url: "https://chains.alliedlocke.com/ImgMedium/WH124.jpg",
    specs: { pitch_in: "4.000", rivet_dia_in: "0.500", sidebar_width_in: "1.12", barrel_dia_in: "0.88", max_sprocket_face_in: "1.12", bearing_length_in: "2.00" },
    max_working_load_lbs: 3500, confidence: "Confirmed",
    conflict_notes: "WH78-4 is WH78 components at 4\" pitch — extended pitch variant.",
  },
  {
    chain_number: "WH82", normalized_chain_id: "WH-82",
    al_product_code: "WH82",
    al_url: "https://chains.alliedlocke.com/item/welded-steel-chains/welded-mill-chains/wh82",
    al_image_url: "https://chains.alliedlocke.com/ImgMedium/WH124.jpg",
    specs: { pitch_in: "3.075", rivet_dia_in: "0.560", sidebar_width_in: "1.250", barrel_dia_in: "1.06", max_sprocket_face_in: "1.25", bearing_length_in: "2.25" },
    max_working_load_lbs: 4400, confidence: "Confirmed", conflict_notes: null,
  },
  {
    chain_number: "WH124", normalized_chain_id: "WH-124",
    al_product_code: "WH124",
    al_url: "https://chains.alliedlocke.com/item/welded-steel-chains/welded-mill-chains/wh124",
    al_image_url: "https://chains.alliedlocke.com/ImgMedium/WH124.jpg",
    specs: { pitch_in: "4.000", rivet_dia_in: "0.750", sidebar_width_in: "1.50", barrel_dia_in: "1.25", max_sprocket_face_in: "1.50", bearing_length_in: "2.75" },
    max_working_load_lbs: 7200, confidence: "Confirmed",
    conflict_notes: "AL working load 7,200 lb vs baseline 7,600 lb — specification varies by manufacturer.",
  },
  {
    chain_number: "WH124HD", normalized_chain_id: "WH-124HD",
    al_product_code: "WH124HD",
    al_url: "https://chains.alliedlocke.com/item/welded-steel-chains/welded-mill-chains/wh124hd",
    al_image_url: "https://chains.alliedlocke.com/ImgMedium/WH124.jpg",
    specs: { pitch_in: "4.063", rivet_dia_in: "1.00", sidebar_width_in: "2.00", barrel_dia_in: "1.62", max_sprocket_face_in: "1.62", bearing_length_in: "3.00" },
    max_working_load_lbs: 10500, confidence: "Confirmed", conflict_notes: null,
  },
  {
    chain_number: "WH111", normalized_chain_id: "WH-111",
    al_product_code: "WH111",
    al_url: "https://chains.alliedlocke.com/item/welded-steel-chains/welded-mill-chains/wh111",
    al_image_url: "https://chains.alliedlocke.com/ImgMedium/WH124.jpg",
    specs: { pitch_in: "4.760", rivet_dia_in: "0.750", sidebar_width_in: "1.75", barrel_dia_in: "1.25", max_sprocket_face_in: "2.00", bearing_length_in: "3.38" },
    max_working_load_lbs: 8850, confidence: "Confirmed", conflict_notes: null,
  },
  {
    chain_number: "WH106", normalized_chain_id: "WH-106",
    al_product_code: "WH106",
    al_url: "https://chains.alliedlocke.com/item/welded-steel-chains/welded-mill-chains/wh106",
    al_image_url: "https://chains.alliedlocke.com/ImgMedium/WH124.jpg",
    specs: { pitch_in: "6.000", rivet_dia_in: "0.750", sidebar_width_in: "1.50", barrel_dia_in: "1.25", max_sprocket_face_in: "1.62", bearing_length_in: "2.75" },
    max_working_load_lbs: 7200, confidence: "Confirmed", conflict_notes: null,
  },
  {
    chain_number: "WH106HD", normalized_chain_id: "WH-106HD",
    al_product_code: "WH106HD",
    al_url: "https://chains.alliedlocke.com/item/welded-steel-chains/welded-mill-chains/wh106hd",
    al_image_url: "https://chains.alliedlocke.com/ImgMedium/WH124.jpg",
    specs: { pitch_in: "6.000", rivet_dia_in: "0.750", sidebar_width_in: "1.50", barrel_dia_in: "1.25", max_sprocket_face_in: "1.62", bearing_length_in: "3.00" },
    max_working_load_lbs: 7875, confidence: "Confirmed", conflict_notes: null,
  },
  {
    chain_number: "WH106XHD", normalized_chain_id: "WH-106XHD",
    al_product_code: "WH106XHD",
    al_url: "https://chains.alliedlocke.com/item/welded-steel-chains/welded-mill-chains/wh106xhd",
    al_image_url: "https://chains.alliedlocke.com/ImgMedium/WH124.jpg",
    specs: { pitch_in: "6.050", rivet_dia_in: "1.00", sidebar_width_in: "2.00", barrel_dia_in: "1.62", max_sprocket_face_in: "1.62", bearing_length_in: "3.00" },
    max_working_load_lbs: 10500, confidence: "Confirmed", conflict_notes: null,
  },
  {
    chain_number: "WH110", normalized_chain_id: "WH-110",
    al_product_code: "WH110",
    al_url: "https://chains.alliedlocke.com/item/welded-steel-chains/welded-mill-chains/wh110",
    al_image_url: "https://chains.alliedlocke.com/ImgMedium/WH124.jpg",
    specs: { pitch_in: "6.000", rivet_dia_in: "0.750", sidebar_width_in: "1.50", barrel_dia_in: "1.25", max_sprocket_face_in: "1.88", bearing_length_in: "3.00" },
    max_working_load_lbs: 7875, confidence: "Confirmed", conflict_notes: null,
  },
  {
    chain_number: "WH132", normalized_chain_id: "WH-132",
    al_product_code: "WH132",
    al_url: "https://chains.alliedlocke.com/item/welded-steel-chains/welded-mill-chains/wh132",
    al_image_url: "https://chains.alliedlocke.com/ImgMedium/WH124.jpg",
    specs: { pitch_in: "6.050", rivet_dia_in: "1.00", sidebar_width_in: "2.00", barrel_dia_in: "1.62", max_sprocket_face_in: "2.88", bearing_length_in: "4.38" },
    max_working_load_lbs: 15300, confidence: "Confirmed", conflict_notes: null,
  },
  {
    chain_number: "WH132HD", normalized_chain_id: "WH-132HD",
    al_product_code: "WH132HD",
    al_url: "https://chains.alliedlocke.com/item/welded-steel-chains/welded-mill-chains/wh132hd",
    al_image_url: "https://chains.alliedlocke.com/ImgMedium/WH124.jpg",
    specs: { pitch_in: "6.050", rivet_dia_in: "1.00", sidebar_width_in: "2.00", barrel_dia_in: "1.62", max_sprocket_face_in: "2.88", bearing_length_in: "4.62" },
    max_working_load_lbs: 16200, confidence: "Confirmed", conflict_notes: null,
  },
  {
    chain_number: "WH150", normalized_chain_id: "WH-150",
    al_product_code: "WH150",
    al_url: "https://chains.alliedlocke.com/item/welded-steel-chains/welded-mill-chains/wh150",
    al_image_url: "https://chains.alliedlocke.com/ImgMedium/WH124.jpg",
    specs: { pitch_in: "6.050", rivet_dia_in: "1.00", sidebar_width_in: "2.50", barrel_dia_in: "1.62", max_sprocket_face_in: "2.88", bearing_length_in: "4.38" },
    max_working_load_lbs: 15300, confidence: "Confirmed", conflict_notes: null,
  },
  {
    chain_number: "WH150HD", normalized_chain_id: "WH-150HD",
    al_product_code: "WH150HD",
    al_url: "https://chains.alliedlocke.com/item/welded-steel-chains/welded-mill-chains/wh150hd",
    al_image_url: "https://chains.alliedlocke.com/ImgMedium/WH124.jpg",
    specs: { pitch_in: "6.050", rivet_dia_in: "1.00", sidebar_width_in: "2.50", barrel_dia_in: "1.62", max_sprocket_face_in: "2.88", bearing_length_in: "4.62" },
    max_working_load_lbs: 16200, confidence: "Confirmed", conflict_notes: null,
  },
  {
    chain_number: "WH150XHD", normalized_chain_id: "WH-150XHD",
    al_product_code: "WH150XHD",
    al_url: "https://chains.alliedlocke.com/item/welded-steel-chains/welded-mill-chains/wh150xhd",
    al_image_url: "https://chains.alliedlocke.com/ImgMedium/WH124.jpg",
    specs: { pitch_in: "6.050", rivet_dia_in: "1.12", sidebar_width_in: "2.50", barrel_dia_in: "1.62", max_sprocket_face_in: "2.88", bearing_length_in: "4.62" },
    max_working_load_lbs: 18200, confidence: "Confirmed", conflict_notes: null,
  },
  {
    chain_number: "WH155", normalized_chain_id: "WH-155",
    al_product_code: "WH155",
    al_url: "https://chains.alliedlocke.com/item/welded-steel-chains/welded-mill-chains/wh155",
    al_image_url: "https://chains.alliedlocke.com/ImgMedium/WH124.jpg",
    specs: { pitch_in: "6.050", rivet_dia_in: "1.12", sidebar_width_in: "2.50", barrel_dia_in: "1.75", max_sprocket_face_in: "3.00", bearing_length_in: "4.50" },
    max_working_load_lbs: 17750, confidence: "Confirmed", conflict_notes: null,
  },
  {
    chain_number: "WH159", normalized_chain_id: "WH-159",
    al_product_code: "WH159",
    al_url: "https://chains.alliedlocke.com/item/welded-steel-chains/welded-mill-chains/wh159",
    al_image_url: "https://chains.alliedlocke.com/ImgMedium/WH124.jpg",
    specs: { pitch_in: "6.125", rivet_dia_in: "1.25", sidebar_width_in: "3.00", barrel_dia_in: "2.00", max_sprocket_face_in: "3.00", bearing_length_in: "4.63" },
    max_working_load_lbs: 20250, confidence: "Confirmed", conflict_notes: null,
  },
];

// ─── Allied-Locke Attachment Types (from catalog) ─────────────────────────────
// Source: https://chains.alliedlocke.com/category/precision-roller-chain-attachments

export const AL_ATTACHMENT_CATEGORIES = [
  {
    al_category: "Standard Bent, One Side/Two Sides",
    al_url: "https://chains.alliedlocke.com/viewitems/precision-roller-chain-attachments/standard-bent-one-side-two-sides-attachment",
    al_image_url: "https://chains.alliedlocke.com/ImgMedium/a1038.jpg",
    normalized_codes: ["A1", "A2"],
    description: "Bent tab attachment plates — single or double sided. A1 = one side, A2 = two sides.",
    count: 18, confidence: "Confirmed",
  },
  {
    al_category: "Standard Straight, One Side/Two Sides",
    al_url: "https://chains.alliedlocke.com/viewitems/precision-roller-chain-attachments/standard-straight-one-side-two-sides-attachment",
    al_image_url: "https://chains.alliedlocke.com/ImgMedium/1042.gif",
    normalized_codes: ["K1", "K2"],
    description: "Straight tab attachment plates — single or double sided. K1 = one side, K2 = two sides.",
    count: 18, confidence: "Confirmed",
  },
  {
    al_category: "Standard Extended Pin, One Side",
    al_url: "https://chains.alliedlocke.com/viewitems/precision-roller-chain-attachments/standard-extended-pin-one-side-attachment",
    al_image_url: "https://chains.alliedlocke.com/ImgMedium/a1046.jpg",
    normalized_codes: ["HK1"],
    description: "Extended pin on one side only. Used for cross-rod or slat attachment.",
    count: 18, confidence: "Confirmed",
  },
  {
    al_category: "Wide Contour, One Side/Two Sides",
    al_url: "https://chains.alliedlocke.com/viewitems/precision-roller-chain-attachments/wide-contour-one-side-two-sides-attachment",
    al_image_url: "https://chains.alliedlocke.com/ImgMedium/a1050.jpg",
    normalized_codes: ["WA1", "WA2", "WK1", "WK2"],
    description: "Wide contour attachment plates for higher load and wider spacing applications.",
    count: 40, confidence: "Confirmed",
  },
  {
    al_category: "Double Pitch Bent, One Side",
    al_url: "https://chains.alliedlocke.com/viewitems/precision-roller-chain-attachments/double-pitch-bent-one-side-attachment",
    al_image_url: "https://chains.alliedlocke.com/ImgMedium/a1058.jpg",
    normalized_codes: ["SA1"],
    description: "Bent attachment on one side for double pitch conveyor chain.",
    count: 28, confidence: "Confirmed",
  },
  {
    al_category: "Double Pitch Bent, Two Sides",
    al_url: "https://chains.alliedlocke.com/viewitems/precision-roller-chain-attachments/double-pitch-bent-two-sides-attachment",
    al_image_url: "https://chains.alliedlocke.com/ImgMedium/1062.gif",
    normalized_codes: ["SA2"],
    description: "Bent attachment on two sides for double pitch conveyor chain.",
    count: 28, confidence: "Confirmed",
  },
  {
    al_category: "Double Pitch Straight, One Side",
    al_url: "https://chains.alliedlocke.com/viewitems/precision-roller-chain-attachments/double-pitch-straight-one-side-attachment",
    al_image_url: "https://chains.alliedlocke.com/ImgMedium/a1066.jpg",
    normalized_codes: ["SK1"],
    description: "Straight attachment on one side for double pitch conveyor chain.",
    count: 28, confidence: "Confirmed",
  },
  {
    al_category: "Double Pitch Straight, Two Sides",
    al_url: "https://chains.alliedlocke.com/viewitems/precision-roller-chain-attachments/double-pitch-straight-two-sides-attachment",
    al_image_url: "https://chains.alliedlocke.com/ImgMedium/a1070.jpg",
    normalized_codes: ["SK2"],
    description: "Straight attachment on two sides for double pitch conveyor chain.",
    count: 28, confidence: "Confirmed",
  },
  {
    al_category: "Double Pitch Extended Pin, One Side",
    al_url: "https://chains.alliedlocke.com/viewitems/precision-roller-chain-attachments/double-pitch-extended-pin-one-side-attachment",
    al_image_url: "https://chains.alliedlocke.com/ImgMedium/C2060%20D-1%20&%20D-3.jpg",
    normalized_codes: ["HK1"],
    description: "Extended pin on one side for double pitch chain.",
    count: 28, confidence: "Confirmed",
  },
];

// ─── Allied-Locke Variant/Material Series (from catalog subcategories) ─────────

export const AL_MATERIAL_VARIANTS = [
  {
    al_series: "Standard ANSI",
    normalized_material: "carbon_steel",
    description: "Standard carbon steel. Riveted or cottered construction.",
    confidence: "Confirmed",
  },
  {
    al_series: "Super Series (SS)",
    normalized_material: "carbon_steel",
    description: "Shot-peened, wide waist, ball-drifted, solid bushings, through-hardened pins. Higher fatigue strength.",
    al_url: "https://chains.alliedlocke.com/viewitems/precision-roller-chains/ll-categories-precision-roller-chains-super-series",
    normalized_upgrade: "super_series",
    confidence: "Confirmed",
  },
  {
    al_series: "Solid Bushing / Solid Roller (SB/SR)",
    normalized_material: "carbon_steel",
    description: "One-piece bushings and rollers — holds lubrication. Extends wear life 50%+.",
    al_url: "https://chains.alliedlocke.com/viewitems/precision-roller-chains/solid-bushing-solid-roller-chains",
    normalized_upgrade: "solid_bushing_roller",
    confidence: "Confirmed",
  },
  {
    al_series: "Double Capacity (DC)",
    normalized_material: "carbon_steel",
    description: "Extended pins, double link plates. Twice tensile strength. For lifting.",
    al_url: "https://chains.alliedlocke.com/viewitems/precision-roller-chains/categories-precision-roller-chains-double-capacity",
    normalized_upgrade: "double_capacity",
    confidence: "Confirmed",
  },
  {
    al_series: "XDO (Oilfield)",
    normalized_material: "carbon_steel",
    description: "Shot-peened, wider waist, ball-drifted, hot-dip lubricated. Oilfield/severe service.",
    al_url: "https://chains.alliedlocke.com/viewitems/precision-roller-chains/all-categories-precision-roller-chains-xdo",
    normalized_upgrade: "xdo_oilfield",
    confidence: "Confirmed",
  },
  {
    al_series: "Nickel Plated",
    normalized_material: "nickel_plated",
    description: "Plated before assembly. Corrosion resistant. Near-standard strength.",
    al_url: "https://chains.alliedlocke.com/viewitems/precision-roller-chains/nickel-plated-chains",
    confidence: "Confirmed",
  },
  {
    al_series: "Armor Coat",
    normalized_material: "armor_coat",
    description: "Baked coating applied pre- and post-assembly. Exceeds nickel plate corrosion resistance.",
    al_url: "https://chains.alliedlocke.com/viewitems/precision-roller-chains/armor-coat-chains",
    confidence: "Confirmed",
  },
  {
    al_series: "Self-Lube",
    normalized_material: "self_lube",
    description: "Oil-impregnated sintered bushings. Lube-free operation. ANSI interchangeable.",
    al_url: "https://chains.alliedlocke.com/viewitems/precision-roller-chains/self-lube-chains",
    confidence: "Confirmed",
  },
  {
    al_series: "SLB (Self-Lube Bushing)",
    normalized_material: "slb",
    description: "NP pins, specially treated plates, heat-treated sintered bushings. Corrosion + wear resistant.",
    al_url: "https://chains.alliedlocke.com/viewitems/precision-roller-chains/self-lube-bushing-chains",
    confidence: "Confirmed",
  },
  {
    al_series: "Stainless Steel 304",
    normalized_material: "stainless_304",
    description: "304 Stainless — corrosion resistant food/chemical grade.",
    al_url: "https://chains.alliedlocke.com/category/stainless-steel-chains",
    confidence: "Confirmed",
  },
  {
    al_series: "WHX (Induction Hardened Welded Steel)",
    normalized_material: "induction_hard",
    description: "WHX Series — induction hardened pins/rivets on welded steel mill chain. Much harder bearing surface.",
    confidence: "Confirmed",
  },
];

// ─── Lookup helpers ────────────────────────────────────────────────────────────

/** Get AL spec record by normalized chain_id */
export function getALSpecByChainId(chain_id) {
  return AL_ANSI_SINGLE_STRAND.find(r => r.normalized_chain_id === chain_id)
    || AL_WELDED_MILL_CHAINS.find(r => r.normalized_chain_id === chain_id)
    || null;
}

/** Get all AL chains that have confirmed conflict notes */
export function getALConflicts() {
  return [...AL_ANSI_SINGLE_STRAND, ...AL_WELDED_MILL_CHAINS].filter(r => r.conflict_notes);
}

/** Build a source_data entry for merging into a normalized chain record */
export function buildALSourceEntry(alRecord) {
  return {
    brand: "Allied-Locke",
    product_code: alRecord.al_product_code,
    catalog_url: alRecord.al_url,
    image_url: alRecord.al_image_url || "",
    drawing_url: alRecord.al_drawing_url || "",
    specs: alRecord.specs || {},
    confidence: alRecord.confidence,
    notes: alRecord.conflict_notes || null,
  };
}

export default {
  AL_SOURCE,
  AL_CATEGORIES,
  AL_ANSI_SINGLE_STRAND,
  AL_WELDED_MILL_CHAINS,
  AL_ATTACHMENT_CATEGORIES,
  AL_MATERIAL_VARIANTS,
  getALSpecByChainId,
  getALConflicts,
  buildALSourceEntry,
};