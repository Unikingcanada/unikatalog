/**
 * chainNormalizedExpansion2.js
 *
 * Allied-Locke Phase 1 ingestion — additional chain records sourced directly
 * from the Allied-Locke official website:
 * https://chains.alliedlocke.com/category/all-categories
 *
 * INCLUDES:
 * - ANSI 41, 180, 200 (AL catalog-confirmed specs with exact dimensions)
 * - Welded Steel WH variants: WH188, WH78-4, WH82, WH111, WH106HD, WH106XHD,
 *   WH110, WH124HD, WH132, WH132HD, WH150HD, WH150XHD, WH155, WH159
 *
 * NORMALIZATION RULES:
 * - Do NOT duplicate chains already in chainNormalizedDictionary.js or expansion.js
 * - AL tensile/working load values flagged as "specification varies by manufacturer" where they
 *   differ from ANSI B29.1/ASME B29.100 nominal values
 * - All data traceable to source URL per AL_SOURCE record in alliedLockeSourceRecord.js
 */

export const NORMALIZED_CHAINS_EXPANSION_2 = [

  // ══════════════════════════════════════════════════════════════════
  // ANSI ROLLER — additional sizes confirmed from AL live catalog
  // Source: https://chains.alliedlocke.com/viewitems/ansi-roller-chains/ansi-single-strand-roller-chains
  // ══════════════════════════════════════════════════════════════════

  {
    chain_id: "ANSI-41",
    chain_family: "performance_roller",
    chain_number: "41",
    display_name: "ANSI 41 Roller Chain",
    standard: "ANSI B29.1",
    pitch_in: "0.500",
    pitch_mm: "12.70",
    description: "1/2\" pitch narrow-series ANSI roller chain. Narrower inner width (0.250\") than #40. Common in light-duty and some agricultural equipment.",
    specs: {
      pitch_in: "0.500", pitch_mm: "12.70",
      roller_dia_in: "0.306", roller_width_in: "0.250",
      riv_end_to_cl_in: "0.261", conn_end_to_cl_in: "0.314",
      link_plate_height_in: "0.390", link_plate_thickness_in: "0.050",
      pin_dia_in: "0.141",
    },
    performance_tiers: [
      {
        tier: "standard", tensile_strength_lbs: "2760", working_load_lbs: "552",
        source: "Allied-Locke",
        notes: "Confirmed from Allied-Locke live catalog. Specification varies by manufacturer.",
      },
    ],
    source_refs: [
      { manufacturer: "Allied-Locke", code: "41", confidence: "Confirmed",
        catalog_url: "https://chains.alliedlocke.com/item/ansi-roller-chains/ansi-single-strand-roller-chains/item-1004",
        image_url: "https://chains.alliedlocke.com/ImgMedium/PRC%20Ansi%20Drawing.jpg" },
      { manufacturer: "Donghua", code: "41A-1", confidence: "Confirmed" },
      { manufacturer: "Tsubaki", code: "41-1", confidence: "Confirmed" },
    ],
    attachments_available: [],
    sprocket_series: "ANSI-41",
    materials_available: ["carbon_steel", "nickel_plated"],
    options_upgrades: [],
    image_strategy: "family",
    status: "Active",
  },

  {
    chain_id: "ANSI-180",
    chain_family: "performance_roller",
    chain_number: "180",
    display_name: "ANSI 180 Roller Chain",
    standard: "ANSI B29.1",
    pitch_in: "2.250",
    pitch_mm: "57.15",
    description: "2-1/4\" pitch ANSI roller chain for very high-load industrial drives. Confirmed from Allied-Locke official catalog.",
    specs: {
      pitch_in: "2.250", pitch_mm: "57.15",
      roller_dia_in: "1.406", roller_width_in: "1.406",
      riv_end_to_cl_in: "1.404", conn_end_to_cl_in: "1.675",
      link_plate_height_in: "2.130", link_plate_thickness_in: "0.283",
      pin_dia_in: "0.687",
    },
    performance_tiers: [
      {
        tier: "standard", tensile_strength_lbs: "80480", working_load_lbs: "19200",
        source: "Allied-Locke",
        notes: "Confirmed from Allied-Locke live catalog.",
      },
    ],
    source_refs: [
      { manufacturer: "Allied-Locke", code: "180", confidence: "Confirmed",
        catalog_url: "https://chains.alliedlocke.com/item/ansi-roller-chains/ansi-single-strand-roller-chains/item-1012",
        image_url: "https://chains.alliedlocke.com/ImgMedium/PRC%20Ansi%20Drawing.jpg" },
      { manufacturer: "Tsubaki", code: "180-1", confidence: "Confirmed" },
      { manufacturer: "Donghua", code: "180A-1", confidence: "Confirmed" },
    ],
    attachments_available: ["A1", "A2", "K1", "K2"],
    sprocket_series: "ANSI-180",
    materials_available: ["carbon_steel"],
    options_upgrades: ["Double Strand"],
    image_strategy: "family",
    status: "Active",
  },

  {
    chain_id: "ANSI-200",
    chain_family: "performance_roller",
    chain_number: "200",
    display_name: "ANSI 200 Roller Chain",
    standard: "ANSI B29.1",
    pitch_in: "2.500",
    pitch_mm: "63.50",
    description: "2-1/2\" pitch ANSI roller chain for extreme-load industrial drives. Confirmed from Allied-Locke official catalog.",
    specs: {
      pitch_in: "2.500", pitch_mm: "63.50",
      roller_dia_in: "1.562", roller_width_in: "1.500",
      riv_end_to_cl_in: "1.580", conn_end_to_cl_in: "1.764",
      link_plate_height_in: "2.376", link_plate_thickness_in: "0.312",
      pin_dia_in: "0.782",
    },
    performance_tiers: [
      {
        tier: "standard", tensile_strength_lbs: "109150", working_load_lbs: "26000",
        source: "Allied-Locke",
        notes: "Confirmed from Allied-Locke live catalog.",
      },
    ],
    source_refs: [
      { manufacturer: "Allied-Locke", code: "200", confidence: "Confirmed",
        catalog_url: "https://chains.alliedlocke.com/item/ansi-roller-chains/ansi-single-strand-roller-chains/item-1013",
        image_url: "https://chains.alliedlocke.com/ImgMedium/PRC%20Ansi%20Drawing.jpg" },
      { manufacturer: "Tsubaki", code: "200-1", confidence: "Confirmed" },
      { manufacturer: "Donghua", code: "200A-1", confidence: "Confirmed" },
    ],
    attachments_available: ["A1", "A2", "K1", "K2"],
    sprocket_series: "ANSI-200",
    materials_available: ["carbon_steel"],
    options_upgrades: ["Double Strand"],
    image_strategy: "family",
    status: "Active",
  },

  // ══════════════════════════════════════════════════════════════════
  // WELDED STEEL — Allied-Locke variants confirmed from live catalog
  // Source: https://chains.alliedlocke.com/viewitems/welded-steel-chains/welded-mill-chains
  // ══════════════════════════════════════════════════════════════════

  {
    chain_id: "WH-188",
    chain_family: "welded_steel",
    chain_number: "WH188",
    display_name: "WH188 Welded Steel Mill Chain",
    standard: "ASME B29.100",
    pitch_in: "2.609",
    pitch_mm: "66.27",
    description: "WH188 lighter welded steel mill chain — 0.88\" barrel, narrower face than WH78. Used in lighter conveying applications.",
    specs: {
      pitch_in: "2.609", pitch_mm: "66.27",
      rivet_dia_in: "0.500", sidebar_width_in: "1.12",
      barrel_dia_in: "0.88", max_sprocket_face_in: "0.88",
      bearing_length_in: "1.62",
    },
    performance_tiers: [
      { tier: "standard", tensile_strength_lbs: "14000", working_load_lbs: "2850",
        source: "Allied-Locke",
        notes: "Confirmed — working load 2,850 lb from Allied-Locke live catalog." },
    ],
    source_refs: [
      { manufacturer: "Allied-Locke", code: "WH188", confidence: "Confirmed",
        catalog_url: "https://chains.alliedlocke.com/item/welded-steel-chains/welded-mill-chains/wh188",
        image_url: "https://chains.alliedlocke.com/ImgMedium/WH124.jpg" },
      { manufacturer: "MAC Chain", code: "WH188", confidence: "Confirmed" },
    ],
    attachments_available: ["WA-K1", "WA-A1"],
    sprocket_series: "WH-188",
    materials_available: ["carbon_steel", "induction_hard"],
    options_upgrades: ["WHX188 Induction Hardened"],
    image_strategy: "exact",
    status: "Active",
  },

  {
    chain_id: "WH-78-4",
    chain_family: "welded_steel",
    chain_number: "WH78-4",
    display_name: "WH78-4 Extended Pitch Welded Steel Chain",
    standard: "ASME B29.100",
    pitch_in: "4.000",
    pitch_mm: "101.60",
    description: "WH78 components at 4\" extended pitch. Used where wider pitch spacing is required while retaining WH78 sprocket compatibility.",
    specs: {
      pitch_in: "4.000", pitch_mm: "101.60",
      rivet_dia_in: "0.500", sidebar_width_in: "1.12",
      barrel_dia_in: "0.88", max_sprocket_face_in: "1.12",
      bearing_length_in: "2.00",
    },
    performance_tiers: [
      { tier: "standard", tensile_strength_lbs: "18000", working_load_lbs: "3500",
        source: "Allied-Locke",
        notes: "Extended pitch variant of WH78. Confirmed from Allied-Locke live catalog." },
    ],
    source_refs: [
      { manufacturer: "Allied-Locke", code: "WH78-4", confidence: "Confirmed",
        catalog_url: "https://chains.alliedlocke.com/item/welded-steel-chains/welded-mill-chains/wh78-4",
        image_url: "https://chains.alliedlocke.com/ImgMedium/WH124.jpg" },
    ],
    attachments_available: ["WA-K1", "WA-A1"],
    sprocket_series: "WH-78",
    materials_available: ["carbon_steel"],
    options_upgrades: [],
    image_strategy: "exact",
    status: "Active",
  },

  {
    chain_id: "WH-82",
    chain_family: "welded_steel",
    chain_number: "WH82",
    display_name: "WH82 Welded Steel Mill Chain",
    standard: "ASME B29.100",
    pitch_in: "3.075",
    pitch_mm: "78.11",
    description: "WH82 welded steel mill chain — 3.075\" pitch, heavier construction than WH78. Confirmed from Allied-Locke catalog.",
    specs: {
      pitch_in: "3.075", pitch_mm: "78.11",
      rivet_dia_in: "0.560", sidebar_width_in: "1.250",
      barrel_dia_in: "1.06", max_sprocket_face_in: "1.25",
      bearing_length_in: "2.25",
    },
    performance_tiers: [
      { tier: "standard", tensile_strength_lbs: "22000", working_load_lbs: "4400",
        source: "Allied-Locke", notes: "Confirmed from Allied-Locke live catalog." },
    ],
    source_refs: [
      { manufacturer: "Allied-Locke", code: "WH82", confidence: "Confirmed",
        catalog_url: "https://chains.alliedlocke.com/item/welded-steel-chains/welded-mill-chains/wh82",
        image_url: "https://chains.alliedlocke.com/ImgMedium/WH124.jpg" },
      { manufacturer: "MAC Chain", code: "WH82", confidence: "Confirmed" },
    ],
    attachments_available: ["WA-K1", "WA-K2", "WA-A1"],
    sprocket_series: "WH-82",
    materials_available: ["carbon_steel", "induction_hard"],
    options_upgrades: ["WHX82 Induction Hardened"],
    image_strategy: "exact",
    status: "Active",
  },

  {
    chain_id: "WH-111",
    chain_family: "welded_steel",
    chain_number: "WH111",
    display_name: "WH111 Welded Steel Mill Chain",
    standard: "ASME B29.100",
    pitch_in: "4.760",
    pitch_mm: "120.90",
    description: "WH111 welded steel mill chain — 4.76\" pitch, 1.75\" sidebar width. Confirmed from Allied-Locke catalog.",
    specs: {
      pitch_in: "4.760", pitch_mm: "120.90",
      rivet_dia_in: "0.750", sidebar_width_in: "1.75",
      barrel_dia_in: "1.25", max_sprocket_face_in: "2.00",
      bearing_length_in: "3.38",
    },
    performance_tiers: [
      { tier: "standard", tensile_strength_lbs: "44000", working_load_lbs: "8850",
        source: "Allied-Locke", notes: "Confirmed from Allied-Locke live catalog." },
    ],
    source_refs: [
      { manufacturer: "Allied-Locke", code: "WH111", confidence: "Confirmed",
        catalog_url: "https://chains.alliedlocke.com/item/welded-steel-chains/welded-mill-chains/wh111",
        image_url: "https://chains.alliedlocke.com/ImgMedium/WH124.jpg" },
      { manufacturer: "MAC Chain", code: "WH111", confidence: "Confirmed" },
    ],
    attachments_available: ["WA-K1", "WA-K2", "WA-A1"],
    sprocket_series: "WH-111",
    materials_available: ["carbon_steel", "induction_hard"],
    options_upgrades: [],
    image_strategy: "exact",
    status: "Active",
  },

  {
    chain_id: "WH-106HD",
    chain_family: "welded_steel",
    chain_number: "WH106HD",
    display_name: "WH106HD Heavy Duty Welded Steel Chain",
    standard: "ASME B29.100",
    pitch_in: "6.000",
    pitch_mm: "152.40",
    description: "WH106HD — same pitch as WH106 with extended bearing length (3.00\") for higher load rating.",
    specs: {
      pitch_in: "6.000", pitch_mm: "152.40",
      rivet_dia_in: "0.750", sidebar_width_in: "1.50",
      barrel_dia_in: "1.25", max_sprocket_face_in: "1.62",
      bearing_length_in: "3.00",
    },
    performance_tiers: [
      { tier: "standard", tensile_strength_lbs: "39000", working_load_lbs: "7875",
        source: "Allied-Locke", notes: "Confirmed from Allied-Locke live catalog." },
    ],
    source_refs: [
      { manufacturer: "Allied-Locke", code: "WH106HD", confidence: "Confirmed",
        catalog_url: "https://chains.alliedlocke.com/item/welded-steel-chains/welded-mill-chains/wh106hd",
        image_url: "https://chains.alliedlocke.com/ImgMedium/WH124.jpg" },
      { manufacturer: "MAC Chain", code: "WH106HD", confidence: "Confirmed" },
    ],
    attachments_available: ["WA-K1", "WA-K2", "WA-A1"],
    sprocket_series: "WH-106",
    materials_available: ["carbon_steel", "induction_hard"],
    options_upgrades: ["WH106XHD"],
    image_strategy: "exact",
    status: "Active",
  },

  {
    chain_id: "WH-106XHD",
    chain_family: "welded_steel",
    chain_number: "WH106XHD",
    display_name: "WH106XHD Extra Heavy Welded Steel Chain",
    standard: "ASME B29.100",
    pitch_in: "6.050",
    pitch_mm: "153.67",
    description: "WH106XHD extra heavy-duty — 1.00\" rivet, 2.00\" sidebar, 1.62\" barrel. Maximum capacity 6\" pitch welded mill chain.",
    specs: {
      pitch_in: "6.050", pitch_mm: "153.67",
      rivet_dia_in: "1.00", sidebar_width_in: "2.00",
      barrel_dia_in: "1.62", max_sprocket_face_in: "1.62",
      bearing_length_in: "3.00",
    },
    performance_tiers: [
      { tier: "performance", tensile_strength_lbs: "52000", working_load_lbs: "10500",
        source: "Allied-Locke", notes: "XHD construction — confirmed from Allied-Locke live catalog." },
    ],
    source_refs: [
      { manufacturer: "Allied-Locke", code: "WH106XHD", confidence: "Confirmed",
        catalog_url: "https://chains.alliedlocke.com/item/welded-steel-chains/welded-mill-chains/wh106xhd",
        image_url: "https://chains.alliedlocke.com/ImgMedium/WH124.jpg" },
    ],
    attachments_available: ["WA-K1", "WA-K2"],
    sprocket_series: "WH-106",
    materials_available: ["carbon_steel", "induction_hard"],
    options_upgrades: [],
    image_strategy: "exact",
    status: "Active",
  },

  {
    chain_id: "WH-110",
    chain_family: "welded_steel",
    chain_number: "WH110",
    display_name: "WH110 Welded Steel Mill Chain",
    standard: "ASME B29.100",
    pitch_in: "6.000",
    pitch_mm: "152.40",
    description: "WH110 welded steel mill chain — same pitch as WH106 but wider sprocket face (1.88\") for broader conveyor applications.",
    specs: {
      pitch_in: "6.000", pitch_mm: "152.40",
      rivet_dia_in: "0.750", sidebar_width_in: "1.50",
      barrel_dia_in: "1.25", max_sprocket_face_in: "1.88",
      bearing_length_in: "3.00",
    },
    performance_tiers: [
      { tier: "standard", tensile_strength_lbs: "39000", working_load_lbs: "7875",
        source: "Allied-Locke", notes: "Confirmed from Allied-Locke live catalog." },
    ],
    source_refs: [
      { manufacturer: "Allied-Locke", code: "WH110", confidence: "Confirmed",
        catalog_url: "https://chains.alliedlocke.com/item/welded-steel-chains/welded-mill-chains/wh110",
        image_url: "https://chains.alliedlocke.com/ImgMedium/WH124.jpg" },
      { manufacturer: "MAC Chain", code: "WH110", confidence: "Confirmed" },
    ],
    attachments_available: ["WA-K1", "WA-K2", "WA-A1"],
    sprocket_series: "WH-110",
    materials_available: ["carbon_steel", "induction_hard"],
    options_upgrades: [],
    image_strategy: "exact",
    status: "Active",
  },

  {
    chain_id: "WH-124HD",
    chain_family: "welded_steel",
    chain_number: "WH124HD",
    display_name: "WH124HD Heavy Duty Welded Steel Chain",
    standard: "ASME B29.100",
    pitch_in: "4.063",
    pitch_mm: "103.19",
    description: "WH124HD — extra-heavy 4.063\" pitch welded mill chain with 1.00\" rivet and 1.62\" barrel. High-load grain elevator and aggregate use.",
    specs: {
      pitch_in: "4.063", pitch_mm: "103.19",
      rivet_dia_in: "1.00", sidebar_width_in: "2.00",
      barrel_dia_in: "1.62", max_sprocket_face_in: "1.62",
      bearing_length_in: "3.00",
    },
    performance_tiers: [
      { tier: "performance", tensile_strength_lbs: "52000", working_load_lbs: "10500",
        source: "Allied-Locke", notes: "HD construction — confirmed from Allied-Locke live catalog. Specification varies by manufacturer vs WH124 baseline." },
    ],
    source_refs: [
      { manufacturer: "Allied-Locke", code: "WH124HD", confidence: "Confirmed",
        catalog_url: "https://chains.alliedlocke.com/item/welded-steel-chains/welded-mill-chains/wh124hd",
        image_url: "https://chains.alliedlocke.com/ImgMedium/WH124.jpg" },
      { manufacturer: "MAC Chain", code: "WH124HD", confidence: "Confirmed" },
    ],
    attachments_available: ["WA-K1", "WA-K2"],
    sprocket_series: "WH-124",
    materials_available: ["carbon_steel", "induction_hard"],
    options_upgrades: [],
    image_strategy: "exact",
    status: "Active",
  },

  {
    chain_id: "WH-132",
    chain_family: "welded_steel",
    chain_number: "WH132",
    display_name: "WH132 Welded Steel Mill Chain",
    standard: "ASME B29.100",
    pitch_in: "6.050",
    pitch_mm: "153.67",
    description: "WH132 heavy welded steel chain — 2.88\" sprocket face for wide-conveyor grain elevator and aggregate applications.",
    specs: {
      pitch_in: "6.050", pitch_mm: "153.67",
      rivet_dia_in: "1.00", sidebar_width_in: "2.00",
      barrel_dia_in: "1.62", max_sprocket_face_in: "2.88",
      bearing_length_in: "4.38",
    },
    performance_tiers: [
      { tier: "standard", tensile_strength_lbs: "76000", working_load_lbs: "15300",
        source: "Allied-Locke", notes: "Confirmed from Allied-Locke live catalog." },
    ],
    source_refs: [
      { manufacturer: "Allied-Locke", code: "WH132", confidence: "Confirmed",
        catalog_url: "https://chains.alliedlocke.com/item/welded-steel-chains/welded-mill-chains/wh132",
        image_url: "https://chains.alliedlocke.com/ImgMedium/WH124.jpg" },
      { manufacturer: "MAC Chain", code: "WH132", confidence: "Confirmed" },
    ],
    attachments_available: ["WA-K1", "WA-K2", "WA-A1"],
    sprocket_series: "WH-132",
    materials_available: ["carbon_steel", "induction_hard"],
    options_upgrades: ["WH132HD Heavy Duty"],
    image_strategy: "exact",
    status: "Active",
  },

  {
    chain_id: "WH-132HD",
    chain_family: "welded_steel",
    chain_number: "WH132HD",
    display_name: "WH132HD Heavy Duty Welded Steel Chain",
    standard: "ASME B29.100",
    pitch_in: "6.050",
    pitch_mm: "153.67",
    description: "WH132HD — extended bearing length (4.62\") vs WH132 (4.38\") for higher load capacity.",
    specs: {
      pitch_in: "6.050", pitch_mm: "153.67",
      rivet_dia_in: "1.00", sidebar_width_in: "2.00",
      barrel_dia_in: "1.62", max_sprocket_face_in: "2.88",
      bearing_length_in: "4.62",
    },
    performance_tiers: [
      { tier: "performance", tensile_strength_lbs: "81000", working_load_lbs: "16200",
        source: "Allied-Locke", notes: "HD construction — confirmed from Allied-Locke live catalog." },
    ],
    source_refs: [
      { manufacturer: "Allied-Locke", code: "WH132HD", confidence: "Confirmed",
        catalog_url: "https://chains.alliedlocke.com/item/welded-steel-chains/welded-mill-chains/wh132hd",
        image_url: "https://chains.alliedlocke.com/ImgMedium/WH124.jpg" },
      { manufacturer: "MAC Chain", code: "WH132HD", confidence: "Confirmed" },
    ],
    attachments_available: ["WA-K1", "WA-K2"],
    sprocket_series: "WH-132",
    materials_available: ["carbon_steel", "induction_hard"],
    options_upgrades: [],
    image_strategy: "exact",
    status: "Active",
  },

  {
    chain_id: "WH-150HD",
    chain_family: "welded_steel",
    chain_number: "WH150HD",
    display_name: "WH150HD Heavy Duty Welded Steel Chain",
    standard: "ASME B29.100",
    pitch_in: "6.050",
    pitch_mm: "153.67",
    description: "WH150HD — wide sidebar (2.50\") with extended bearing length (4.62\"). Higher load than standard WH150.",
    specs: {
      pitch_in: "6.050", pitch_mm: "153.67",
      rivet_dia_in: "1.00", sidebar_width_in: "2.50",
      barrel_dia_in: "1.62", max_sprocket_face_in: "2.88",
      bearing_length_in: "4.62",
    },
    performance_tiers: [
      { tier: "performance", tensile_strength_lbs: "81000", working_load_lbs: "16200",
        source: "Allied-Locke", notes: "Confirmed from Allied-Locke live catalog." },
    ],
    source_refs: [
      { manufacturer: "Allied-Locke", code: "WH150HD", confidence: "Confirmed",
        catalog_url: "https://chains.alliedlocke.com/item/welded-steel-chains/welded-mill-chains/wh150hd",
        image_url: "https://chains.alliedlocke.com/ImgMedium/WH124.jpg" },
      { manufacturer: "MAC Chain", code: "WH150HD", confidence: "Confirmed" },
    ],
    attachments_available: ["WA-K1", "WA-K2"],
    sprocket_series: "WH-150",
    materials_available: ["carbon_steel", "induction_hard"],
    options_upgrades: ["WH150XHD"],
    image_strategy: "exact",
    status: "Active",
  },

  {
    chain_id: "WH-150XHD",
    chain_family: "welded_steel",
    chain_number: "WH150XHD",
    display_name: "WH150XHD Extra Heavy Welded Steel Chain",
    standard: "ASME B29.100",
    pitch_in: "6.050",
    pitch_mm: "153.67",
    description: "WH150XHD — 1.12\" rivet diameter, heaviest sidebar in WH150 series. Maximum working load 18,200 lb.",
    specs: {
      pitch_in: "6.050", pitch_mm: "153.67",
      rivet_dia_in: "1.12", sidebar_width_in: "2.50",
      barrel_dia_in: "1.62", max_sprocket_face_in: "2.88",
      bearing_length_in: "4.62",
    },
    performance_tiers: [
      { tier: "premium", tensile_strength_lbs: "91000", working_load_lbs: "18200",
        source: "Allied-Locke", notes: "XHD construction — confirmed from Allied-Locke live catalog." },
    ],
    source_refs: [
      { manufacturer: "Allied-Locke", code: "WH150XHD", confidence: "Confirmed",
        catalog_url: "https://chains.alliedlocke.com/item/welded-steel-chains/welded-mill-chains/wh150xhd",
        image_url: "https://chains.alliedlocke.com/ImgMedium/WH124.jpg" },
    ],
    attachments_available: ["WA-K1", "WA-K2"],
    sprocket_series: "WH-150",
    materials_available: ["carbon_steel", "induction_hard"],
    options_upgrades: [],
    image_strategy: "exact",
    status: "Active",
  },

  {
    chain_id: "WH-155",
    chain_family: "welded_steel",
    chain_number: "WH155",
    display_name: "WH155 Welded Steel Mill Chain",
    standard: "ASME B29.100",
    pitch_in: "6.050",
    pitch_mm: "153.67",
    description: "WH155 — 1.75\" barrel diameter, 3.00\" sprocket face. Wider than WH150 series for broader conveyor tracks.",
    specs: {
      pitch_in: "6.050", pitch_mm: "153.67",
      rivet_dia_in: "1.12", sidebar_width_in: "2.50",
      barrel_dia_in: "1.75", max_sprocket_face_in: "3.00",
      bearing_length_in: "4.50",
    },
    performance_tiers: [
      { tier: "standard", tensile_strength_lbs: "88000", working_load_lbs: "17750",
        source: "Allied-Locke", notes: "Confirmed from Allied-Locke live catalog." },
    ],
    source_refs: [
      { manufacturer: "Allied-Locke", code: "WH155", confidence: "Confirmed",
        catalog_url: "https://chains.alliedlocke.com/item/welded-steel-chains/welded-mill-chains/wh155",
        image_url: "https://chains.alliedlocke.com/ImgMedium/WH124.jpg" },
      { manufacturer: "MAC Chain", code: "WH155", confidence: "Confirmed" },
    ],
    attachments_available: ["WA-K1", "WA-K2"],
    sprocket_series: "WH-155",
    materials_available: ["carbon_steel", "induction_hard"],
    options_upgrades: [],
    image_strategy: "exact",
    status: "Active",
  },

  {
    chain_id: "WH-159",
    chain_family: "welded_steel",
    chain_number: "WH159",
    display_name: "WH159 Welded Steel Mill Chain",
    standard: "ASME B29.100",
    pitch_in: "6.125",
    pitch_mm: "155.57",
    description: "WH159 — 2.00\" barrel, 3.00\" sprocket face, 6.125\" pitch. Largest standard WH mill chain in the Allied-Locke catalog. Working load 20,250 lb.",
    specs: {
      pitch_in: "6.125", pitch_mm: "155.57",
      rivet_dia_in: "1.25", sidebar_width_in: "3.00",
      barrel_dia_in: "2.00", max_sprocket_face_in: "3.00",
      bearing_length_in: "4.63",
    },
    performance_tiers: [
      { tier: "standard", tensile_strength_lbs: "101000", working_load_lbs: "20250",
        source: "Allied-Locke", notes: "Confirmed from Allied-Locke live catalog." },
    ],
    source_refs: [
      { manufacturer: "Allied-Locke", code: "WH159", confidence: "Confirmed",
        catalog_url: "https://chains.alliedlocke.com/item/welded-steel-chains/welded-mill-chains/wh159",
        image_url: "https://chains.alliedlocke.com/ImgMedium/WH124.jpg" },
      { manufacturer: "MAC Chain", code: "WH159", confidence: "Confirmed" },
    ],
    attachments_available: ["WA-K1", "WA-K2"],
    sprocket_series: "WH-159",
    materials_available: ["carbon_steel", "induction_hard"],
    options_upgrades: [],
    image_strategy: "exact",
    status: "Active",
  },

];

export default NORMALIZED_CHAINS_EXPANSION_2;