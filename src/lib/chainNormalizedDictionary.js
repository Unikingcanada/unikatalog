/**
 * chainNormalizedDictionary.js
 *
 * The core normalized chain dictionary for the Uniking procurement platform.
 *
 * ARCHITECTURE RULES:
 * - One entry per normalized chain number (e.g. ANSI-40, ANSI-80, C2060H, WR78)
 * - Do NOT create duplicate entries for equivalent manufacturer codes
 * - Manufacturer equivalencies are stored in source_refs[], not as separate chains
 * - Specs are stored in imperial (in) with mm secondary
 * - Performance data is stored per-tier, not overwritten
 * - Attachments reference ATTACHMENT_LIBRARY by code
 * - Sprockets reference SPROCKET_COMPATIBILITY by chain_id
 *
 * COVERAGE (initial seed — expand via admin):
 * Performance Roller:    25, 35, 40, 50, 60, 80, 100, 120, 140, 160, 240
 * Heavy Series:          40H, 50H, 60H, 80H, 100H, 120H, 140H, 160H
 * Double Pitch:          C2040, C2050, C2060, C2060H, C2080, C2080H, C2100, C2102H
 * Engineered Class:      SS78, SS88, SS118, MSR6018, MSR8028, MSR10028, MXS881
 * Welded Steel:          WR78, WR88, WR106, WR124, WR150, WH78, WH88, WH106, WH124, WH150
 * Drop Forged Rivetless: X348, X458, X678, 477, 698
 * Steel Pintle:          667, 667X, 667XH, 7200
 * Leaf:                  AL1022, AL1044, BL1022, BL1044
 * Agricultural:          CA550, CA557, CA620
 * Specialty:             81X, 103B
 */

// ─── Normalized Chain ID Helper ───────────────────────────────────────────────
// chain_id format: family prefix + number, e.g. "ANSI-40", "WR-78", "X348"

export const NORMALIZED_CHAINS = [

  // ══════════════════════════════════════════════════════════════════
  // PERFORMANCE ROLLER CHAINS — ANSI Standard Series
  // ══════════════════════════════════════════════════════════════════
  {
    chain_id: "ANSI-25",
    chain_family: "performance_roller",
    chain_number: "25",
    display_name: "ANSI 25 Roller Chain",
    standard: "ANSI B29.1",
    pitch_in: "0.250",
    pitch_mm: "6.35",
    description: "Smallest standard ANSI roller chain. Light duty power transmission. Single strand.",
    specs: {
      pitch_in: "0.250", pitch_mm: "6.35",
      roller_dia_in: "0.130", roller_width_in: "0.125",
      pin_dia_in: "0.0905", plate_height_in: "0.413",
      avg_ultimate_lbs: "925",
      max_working_load_lbs: "185",
    },
    performance_tiers: [
      { tier: "standard", tensile_strength_lbs: "925", working_load_lbs: "185", source: "ANSI B29.1" },
    ],
    source_refs: [
      { manufacturer: "Allied-Locke", code: "25", confidence: "Confirmed" },
      { manufacturer: "Donghua", code: "25A-1", confidence: "Confirmed" },
      { manufacturer: "Tsubaki", code: "25-1", confidence: "Confirmed" },
      { manufacturer: "Peer", code: "25-1", confidence: "Confirmed" },
      { manufacturer: "Renold", code: "06A-1", confidence: "Confirmed", notes: "ISO 606 equivalent" },
    ],
    attachments_available: [],
    sprocket_series: "ANSI-25",
    materials_available: ["carbon_steel", "stainless_304", "nickel_plated"],
    options_upgrades: ["Self-Lube bushings", "Solid roller"],
    image_strategy: "family", // exact | family | generic
    status: "Active",
  },

  {
    chain_id: "ANSI-35",
    chain_family: "performance_roller",
    chain_number: "35",
    display_name: "ANSI 35 Roller Chain",
    standard: "ANSI B29.1",
    pitch_in: "0.375",
    pitch_mm: "9.525",
    description: "3/8\" pitch standard ANSI roller chain. Common in light industrial and packaging.",
    specs: {
      pitch_in: "0.375", pitch_mm: "9.525",
      roller_dia_in: "0.200", roller_width_in: "0.188",
      pin_dia_in: "0.141", plate_height_in: "0.600",
      avg_ultimate_lbs: "2100",
      max_working_load_lbs: "420",
    },
    performance_tiers: [
      { tier: "standard", tensile_strength_lbs: "2100", working_load_lbs: "420", source: "ANSI B29.1" },
    ],
    source_refs: [
      { manufacturer: "Allied-Locke", code: "35", confidence: "Confirmed" },
      { manufacturer: "Donghua", code: "35A-1", confidence: "Confirmed" },
      { manufacturer: "Tsubaki", code: "35-1", confidence: "Confirmed" },
      { manufacturer: "Peer", code: "35-1", confidence: "Confirmed" },
    ],
    attachments_available: ["A1", "A2", "K1", "K2"],
    sprocket_series: "ANSI-35",
    materials_available: ["carbon_steel", "stainless_304", "nickel_plated", "armor_coat", "self_lube"],
    options_upgrades: ["Hollow pin (35HP)", "Attachment chain", "Side bow"],
    image_strategy: "family",
    status: "Active",
  },

  {
    chain_id: "ANSI-40",
    chain_family: "performance_roller",
    chain_number: "40",
    display_name: "ANSI 40 Roller Chain",
    standard: "ANSI B29.1",
    pitch_in: "0.500",
    pitch_mm: "12.70",
    description: "1/2\" pitch ANSI roller chain. Extremely common general-purpose drive chain. Available in standard, heavy, self-lube, stainless, nickel, and Super Series.",
    specs: {
      pitch_in: "0.500", pitch_mm: "12.70",
      roller_dia_in: "0.312", roller_width_in: "0.312",
      pin_dia_in: "0.156", plate_height_in: "0.720",
      avg_ultimate_lbs: "3700",
      max_working_load_lbs: "810",
    },
    performance_tiers: [
      { tier: "standard", tensile_strength_lbs: "3700", working_load_lbs: "810", source: "ANSI B29.1" },
      { tier: "performance", tensile_strength_lbs: "4700", working_load_lbs: "940", source: "Allied-Locke Super Series", notes: "Shot peened, ball-drifted" },
      { tier: "premium", tensile_strength_lbs: "5200", working_load_lbs: "1040", source: "Tsubaki Lambda", notes: "Oil-impregnated bushings, extended lube intervals" },
    ],
    source_refs: [
      { manufacturer: "Allied-Locke", code: "40", confidence: "Confirmed" },
      { manufacturer: "Allied-Locke", code: "40SS", confidence: "Confirmed", notes: "Super Series" },
      { manufacturer: "Donghua", code: "40A-1", confidence: "Confirmed" },
      { manufacturer: "Tsubaki", code: "40-1", confidence: "Confirmed" },
      { manufacturer: "Tsubaki", code: "RS40", confidence: "Confirmed", notes: "Japanese market designation" },
      { manufacturer: "Peer", code: "40-1", confidence: "Confirmed" },
      { manufacturer: "Renold", code: "08A-1", confidence: "Confirmed", notes: "ISO 606 equivalent" },
      { manufacturer: "Rexnord", code: "40", confidence: "Confirmed" },
    ],
    attachments_available: ["A1", "A2", "K1", "K2", "SA1", "SA2", "HK1", "HK2"],
    sprocket_series: "ANSI-40",
    materials_available: ["carbon_steel", "stainless_304", "stainless_316", "nickel_plated", "zinc_plated", "armor_coat", "self_lube", "slb", "food_grade"],
    options_upgrades: ["40H Heavy Series", "40SS Super Series", "Hollow Pin (40HP)", "O-Ring", "Self-Lube", "Side Bow (40SB)", "Rollerless", "Solid Bushing/Solid Roller"],
    image_strategy: "family",
    status: "Active",
  },

  {
    chain_id: "ANSI-40H",
    chain_family: "performance_roller",
    chain_number: "40H",
    display_name: "ANSI 40H Heavy Roller Chain",
    standard: "ANSI B29.1",
    pitch_in: "0.500",
    pitch_mm: "12.70",
    description: "Heavy series 1/2\" pitch ANSI roller chain with thicker sidebar plates for higher loads.",
    specs: {
      pitch_in: "0.500", pitch_mm: "12.70",
      roller_dia_in: "0.312", roller_width_in: "0.312",
      pin_dia_in: "0.156", plate_height_in: "0.720",
      avg_ultimate_lbs: "4600",
      max_working_load_lbs: "920",
    },
    performance_tiers: [
      { tier: "standard", tensile_strength_lbs: "4600", working_load_lbs: "920", source: "Allied-Locke" },
    ],
    source_refs: [
      { manufacturer: "Allied-Locke", code: "40H", confidence: "Confirmed" },
      { manufacturer: "Tsubaki", code: "40H-1", confidence: "Confirmed" },
      { manufacturer: "Peer", code: "40H-1", confidence: "Confirmed" },
      { manufacturer: "Donghua", code: "40AH-1", confidence: "Confirmed" },
    ],
    attachments_available: ["A1", "A2", "K1", "K2"],
    sprocket_series: "ANSI-40",
    materials_available: ["carbon_steel", "nickel_plated", "stainless_304"],
    options_upgrades: ["Hollow Pin", "Self-Lube"],
    image_strategy: "family",
    status: "Active",
  },

  {
    chain_id: "ANSI-50",
    chain_family: "performance_roller",
    chain_number: "50",
    display_name: "ANSI 50 Roller Chain",
    standard: "ANSI B29.1",
    pitch_in: "0.625",
    pitch_mm: "15.875",
    description: "5/8\" pitch ANSI roller chain for medium-duty power transmission.",
    specs: {
      pitch_in: "0.625", pitch_mm: "15.875",
      roller_dia_in: "0.400", roller_width_in: "0.375",
      pin_dia_in: "0.200", plate_height_in: "0.940",
      avg_ultimate_lbs: "6100",
      max_working_load_lbs: "1330",
    },
    performance_tiers: [
      { tier: "standard", tensile_strength_lbs: "6100", working_load_lbs: "1330", source: "ANSI B29.1" },
      { tier: "performance", tensile_strength_lbs: "8000", working_load_lbs: "1600", source: "Allied-Locke Super Series" },
    ],
    source_refs: [
      { manufacturer: "Allied-Locke", code: "50", confidence: "Confirmed" },
      { manufacturer: "Donghua", code: "50A-1", confidence: "Confirmed" },
      { manufacturer: "Tsubaki", code: "50-1", confidence: "Confirmed" },
      { manufacturer: "Peer", code: "50-1", confidence: "Confirmed" },
      { manufacturer: "Renold", code: "10A-1", confidence: "Confirmed", notes: "ISO 606 equivalent" },
    ],
    attachments_available: ["A1", "A2", "K1", "K2", "SA1", "SA2"],
    sprocket_series: "ANSI-50",
    materials_available: ["carbon_steel", "stainless_304", "nickel_plated", "armor_coat", "self_lube"],
    options_upgrades: ["50H Heavy Series", "50SS Super Series", "Hollow Pin (50HP)", "O-Ring"],
    image_strategy: "family",
    status: "Active",
  },

  {
    chain_id: "ANSI-60",
    chain_family: "performance_roller",
    chain_number: "60",
    display_name: "ANSI 60 Roller Chain",
    standard: "ANSI B29.1",
    pitch_in: "0.750",
    pitch_mm: "19.05",
    description: "3/4\" pitch ANSI roller chain. Heavy-duty power transmission. Common in agricultural, industrial, and conveying applications.",
    specs: {
      pitch_in: "0.750", pitch_mm: "19.05",
      roller_dia_in: "0.469", roller_width_in: "0.500",
      pin_dia_in: "0.234", plate_height_in: "1.125",
      avg_ultimate_lbs: "8500",
      max_working_load_lbs: "1950",
    },
    performance_tiers: [
      { tier: "standard", tensile_strength_lbs: "8500", working_load_lbs: "1950", source: "ANSI B29.1" },
      { tier: "performance", tensile_strength_lbs: "10500", working_load_lbs: "2100", source: "Allied-Locke Super Series" },
      { tier: "premium", tensile_strength_lbs: "12000", working_load_lbs: "2400", source: "Tsubaki Lambda" },
    ],
    source_refs: [
      { manufacturer: "Allied-Locke", code: "60", confidence: "Confirmed" },
      { manufacturer: "Donghua", code: "60A-1", confidence: "Confirmed" },
      { manufacturer: "Tsubaki", code: "60-1", confidence: "Confirmed" },
      { manufacturer: "Tsubaki", code: "RS60", confidence: "Confirmed", notes: "Japanese designation" },
      { manufacturer: "Peer", code: "60-1", confidence: "Confirmed" },
      { manufacturer: "Renold", code: "12A-1", confidence: "Confirmed", notes: "ISO 606 equivalent" },
      { manufacturer: "Rexnord", code: "60", confidence: "Confirmed" },
    ],
    attachments_available: ["A1", "A2", "K1", "K2", "SA1", "SA2", "HK1", "HK2", "WA2", "WK2"],
    sprocket_series: "ANSI-60",
    materials_available: ["carbon_steel", "stainless_304", "stainless_316", "nickel_plated", "zinc_plated", "armor_coat", "self_lube", "slb", "food_grade"],
    options_upgrades: ["60H Heavy Series", "60SS Super Series", "Hollow Pin (60HP)", "O-Ring (60OR)", "Self-Lube", "Side Bow", "Rollerless", "Solid Bushing/Roller"],
    image_strategy: "family",
    status: "Active",
  },

  {
    chain_id: "ANSI-60H",
    chain_family: "performance_roller",
    chain_number: "60H",
    display_name: "ANSI 60H Heavy Roller Chain",
    standard: "ANSI B29.1",
    pitch_in: "0.750",
    pitch_mm: "19.05",
    description: "Heavy series 3/4\" ANSI roller chain with heavier sidebar plates.",
    specs: {
      pitch_in: "0.750", pitch_mm: "19.05",
      roller_dia_in: "0.469", roller_width_in: "0.500",
      avg_ultimate_lbs: "10500",
      max_working_load_lbs: "2100",
    },
    performance_tiers: [
      { tier: "standard", tensile_strength_lbs: "10500", working_load_lbs: "2100", source: "Allied-Locke" },
    ],
    source_refs: [
      { manufacturer: "Allied-Locke", code: "60H", confidence: "Confirmed" },
      { manufacturer: "Tsubaki", code: "60H-1", confidence: "Confirmed" },
      { manufacturer: "Peer", code: "60H-1", confidence: "Confirmed" },
    ],
    attachments_available: ["A1", "A2", "K1", "K2"],
    sprocket_series: "ANSI-60",
    materials_available: ["carbon_steel", "stainless_304"],
    options_upgrades: [],
    image_strategy: "family",
    status: "Active",
  },

  {
    chain_id: "ANSI-80",
    chain_family: "performance_roller",
    chain_number: "80",
    display_name: "ANSI 80 Roller Chain",
    standard: "ANSI B29.1",
    pitch_in: "1.000",
    pitch_mm: "25.40",
    description: "1\" pitch ANSI roller chain. Industry workhorse for heavy power transmission, industrial drives, and agricultural equipment.",
    specs: {
      pitch_in: "1.000", pitch_mm: "25.40",
      roller_dia_in: "0.625", roller_width_in: "0.625",
      pin_dia_in: "0.312", plate_height_in: "1.500",
      avg_ultimate_lbs: "14500",
      max_working_load_lbs: "3500",
    },
    performance_tiers: [
      { tier: "standard", tensile_strength_lbs: "14500", working_load_lbs: "3500", source: "ANSI B29.1" },
      { tier: "performance", tensile_strength_lbs: "18000", working_load_lbs: "3600", source: "Allied-Locke Super Series", notes: "Shot peened, ball-drifted, induction hardened" },
      { tier: "premium", tensile_strength_lbs: "20000", working_load_lbs: "4000", source: "Tsubaki Lambda", notes: "Lube-free, extended maintenance intervals" },
    ],
    source_refs: [
      { manufacturer: "Allied-Locke", code: "80", confidence: "Confirmed" },
      { manufacturer: "Allied-Locke", code: "80SS", confidence: "Confirmed", notes: "Super Series" },
      { manufacturer: "Donghua", code: "80A-1", confidence: "Confirmed" },
      { manufacturer: "Tsubaki", code: "80-1", confidence: "Confirmed" },
      { manufacturer: "Tsubaki", code: "RS80", confidence: "Confirmed", notes: "Japanese designation" },
      { manufacturer: "Peer", code: "80-1", confidence: "Confirmed" },
      { manufacturer: "Renold", code: "16A-1", confidence: "Confirmed", notes: "ISO 606 equivalent" },
      { manufacturer: "Rexnord", code: "80", confidence: "Confirmed" },
      { manufacturer: "Can-Am", code: "80", confidence: "Needs Review" },
    ],
    attachments_available: ["A1", "A2", "K1", "K2", "SA1", "SA2", "HK1", "HK2", "WA2", "WK2", "HKA"],
    sprocket_series: "ANSI-80",
    materials_available: ["carbon_steel", "stainless_304", "stainless_316", "nickel_plated", "zinc_plated", "armor_coat", "dacromet", "self_lube", "slb", "food_grade", "hardened_pins", "induction_hard", "polymer_roller"],
    options_upgrades: ["80H Heavy Series", "80SS Super Series", "Hollow Pin (80HP)", "O-Ring (80OR)", "Self-Lube", "Side Bow (80SB)", "Rollerless", "Double Capacity (80DC)", "XDO Extended", "Solid Bushing/Roller", "Double Strand (80-2)", "Triple Strand (80-3)", "Quad Strand (80-4)"],
    image_strategy: "family",
    status: "Active",
  },

  {
    chain_id: "ANSI-80H",
    chain_family: "performance_roller",
    chain_number: "80H",
    display_name: "ANSI 80H Heavy Roller Chain",
    standard: "ANSI B29.1",
    pitch_in: "1.000",
    pitch_mm: "25.40",
    description: "Heavy series 1\" pitch ANSI roller chain. Thicker sidebars, higher fatigue rating.",
    specs: {
      pitch_in: "1.000", pitch_mm: "25.40",
      roller_dia_in: "0.625", roller_width_in: "0.625",
      avg_ultimate_lbs: "18000",
      max_working_load_lbs: "3900",
    },
    performance_tiers: [
      { tier: "standard", tensile_strength_lbs: "18000", working_load_lbs: "3900", source: "Allied-Locke" },
    ],
    source_refs: [
      { manufacturer: "Allied-Locke", code: "80H", confidence: "Confirmed" },
      { manufacturer: "Tsubaki", code: "80H-1", confidence: "Confirmed" },
      { manufacturer: "Peer", code: "80H-1", confidence: "Confirmed" },
    ],
    attachments_available: ["A1", "A2", "K1", "K2"],
    sprocket_series: "ANSI-80",
    materials_available: ["carbon_steel", "stainless_304"],
    options_upgrades: [],
    image_strategy: "family",
    status: "Active",
  },

  {
    chain_id: "ANSI-100",
    chain_family: "performance_roller",
    chain_number: "100",
    display_name: "ANSI 100 Roller Chain",
    standard: "ANSI B29.1",
    pitch_in: "1.250",
    pitch_mm: "31.75",
    description: "1-1/4\" pitch ANSI roller chain for heavy-duty power transmission.",
    specs: {
      pitch_in: "1.250", pitch_mm: "31.75",
      roller_dia_in: "0.750", roller_width_in: "0.750",
      pin_dia_in: "0.375", plate_height_in: "1.875",
      avg_ultimate_lbs: "24000",
      max_working_load_lbs: "5500",
    },
    performance_tiers: [
      { tier: "standard", tensile_strength_lbs: "24000", working_load_lbs: "5500", source: "ANSI B29.1" },
      { tier: "performance", tensile_strength_lbs: "29000", working_load_lbs: "5800", source: "Allied-Locke Super Series" },
    ],
    source_refs: [
      { manufacturer: "Allied-Locke", code: "100", confidence: "Confirmed" },
      { manufacturer: "Donghua", code: "100A-1", confidence: "Confirmed" },
      { manufacturer: "Tsubaki", code: "100-1", confidence: "Confirmed" },
      { manufacturer: "Peer", code: "100-1", confidence: "Confirmed" },
      { manufacturer: "Renold", code: "20A-1", confidence: "Confirmed" },
    ],
    attachments_available: ["A1", "A2", "K1", "K2", "SA1", "SA2"],
    sprocket_series: "ANSI-100",
    materials_available: ["carbon_steel", "stainless_304", "nickel_plated", "armor_coat", "self_lube"],
    options_upgrades: ["100H Heavy Series", "Double Strand", "Triple Strand", "Hollow Pin"],
    image_strategy: "family",
    status: "Active",
  },

  {
    chain_id: "ANSI-120",
    chain_family: "performance_roller",
    chain_number: "120",
    display_name: "ANSI 120 Roller Chain",
    standard: "ANSI B29.1",
    pitch_in: "1.500",
    pitch_mm: "38.10",
    description: "1-1/2\" pitch ANSI roller chain for high-load drives.",
    specs: {
      pitch_in: "1.500", pitch_mm: "38.10",
      roller_dia_in: "0.875", roller_width_in: "1.000",
      pin_dia_in: "0.437", plate_height_in: "2.125",
      avg_ultimate_lbs: "34000",
      max_working_load_lbs: "8000",
    },
    performance_tiers: [
      { tier: "standard", tensile_strength_lbs: "34000", working_load_lbs: "8000", source: "ANSI B29.1" },
    ],
    source_refs: [
      { manufacturer: "Allied-Locke", code: "120", confidence: "Confirmed" },
      { manufacturer: "Donghua", code: "120A-1", confidence: "Confirmed" },
      { manufacturer: "Tsubaki", code: "120-1", confidence: "Confirmed" },
      { manufacturer: "Peer", code: "120-1", confidence: "Confirmed" },
    ],
    attachments_available: ["A1", "A2", "K1", "K2"],
    sprocket_series: "ANSI-120",
    materials_available: ["carbon_steel", "stainless_304", "armor_coat"],
    options_upgrades: ["120H Heavy Series", "Double Strand", "Triple Strand"],
    image_strategy: "family",
    status: "Active",
  },

  {
    chain_id: "ANSI-160",
    chain_family: "performance_roller",
    chain_number: "160",
    display_name: "ANSI 160 Roller Chain",
    standard: "ANSI B29.1",
    pitch_in: "2.000",
    pitch_mm: "50.80",
    description: "2\" pitch ANSI roller chain for very heavy-duty industrial drives.",
    specs: {
      pitch_in: "2.000", pitch_mm: "50.80",
      roller_dia_in: "1.125", roller_width_in: "1.250",
      pin_dia_in: "0.562", plate_height_in: "2.750",
      avg_ultimate_lbs: "58000",
      max_working_load_lbs: "14000",
    },
    performance_tiers: [
      { tier: "standard", tensile_strength_lbs: "58000", working_load_lbs: "14000", source: "ANSI B29.1" },
    ],
    source_refs: [
      { manufacturer: "Allied-Locke", code: "160", confidence: "Confirmed" },
      { manufacturer: "Donghua", code: "160A-1", confidence: "Confirmed" },
      { manufacturer: "Tsubaki", code: "160-1", confidence: "Confirmed" },
    ],
    attachments_available: ["A1", "A2", "K1", "K2"],
    sprocket_series: "ANSI-160",
    materials_available: ["carbon_steel", "stainless_304"],
    options_upgrades: ["160H Heavy Series", "Double Strand"],
    image_strategy: "family",
    status: "Active",
  },

  // ══════════════════════════════════════════════════════════════════
  // DOUBLE PITCH CONVEYOR CHAINS
  // ══════════════════════════════════════════════════════════════════
  {
    chain_id: "C2040",
    chain_family: "double_pitch_conveyor",
    chain_number: "C2040",
    display_name: "C2040 Double Pitch Roller Chain",
    standard: "ANSI B29.4",
    pitch_in: "1.000",
    pitch_mm: "25.40",
    description: "1\" double pitch conveyor chain. Uses #40 components at double pitch — economy conveyor chain.",
    specs: {
      pitch_in: "1.000", pitch_mm: "25.40",
      roller_dia_in: "0.312", roller_width_in: "0.312",
      avg_ultimate_lbs: "3700",
      max_working_load_lbs: "810",
    },
    performance_tiers: [
      { tier: "standard", tensile_strength_lbs: "3700", working_load_lbs: "810", source: "ANSI B29.4" },
    ],
    source_refs: [
      { manufacturer: "Allied-Locke", code: "C2040", confidence: "Confirmed" },
      { manufacturer: "Tsubaki", code: "C2040", confidence: "Confirmed" },
      { manufacturer: "Donghua", code: "C2040", confidence: "Confirmed" },
    ],
    attachments_available: ["A1", "A2", "K1", "K2", "SA1", "SA2"],
    sprocket_series: "C2040",
    materials_available: ["carbon_steel", "stainless_304", "nickel_plated"],
    options_upgrades: ["Large roller (C2042 LR)", "Small roller (C2040 SR)", "Walk-on-Rail"],
    image_strategy: "family",
    status: "Active",
  },

  {
    chain_id: "C2060H",
    chain_family: "double_pitch_conveyor",
    chain_number: "C2060H",
    display_name: "C2060H Double Pitch Heavy Roller Chain",
    standard: "ANSI B29.4",
    pitch_in: "1.500",
    pitch_mm: "38.10",
    description: "1-1/2\" double pitch heavy roller chain. Heavy sidebar plates. Common in package handling and assembly.",
    specs: {
      pitch_in: "1.500", pitch_mm: "38.10",
      roller_dia_in: "0.469", roller_width_in: "0.500",
      avg_ultimate_lbs: "10500",
      max_working_load_lbs: "2100",
    },
    performance_tiers: [
      { tier: "standard", tensile_strength_lbs: "10500", working_load_lbs: "2100", source: "ANSI B29.4" },
    ],
    source_refs: [
      { manufacturer: "Allied-Locke", code: "C2060H", confidence: "Confirmed" },
      { manufacturer: "Tsubaki", code: "C2060H", confidence: "Confirmed" },
      { manufacturer: "Donghua", code: "C2060H", confidence: "Confirmed" },
      { manufacturer: "Peer", code: "C2060H", confidence: "Confirmed" },
    ],
    attachments_available: ["A1", "A2", "K1", "K2", "SA1", "SA2", "WA2"],
    sprocket_series: "C2060",
    materials_available: ["carbon_steel", "stainless_304", "nickel_plated", "armor_coat"],
    options_upgrades: ["Large Roller", "Small Roller", "Walk-on-Rail"],
    image_strategy: "family",
    status: "Active",
  },

  {
    chain_id: "C2080H",
    chain_family: "double_pitch_conveyor",
    chain_number: "C2080H",
    display_name: "C2080H Double Pitch Heavy Roller Chain",
    standard: "ANSI B29.4",
    pitch_in: "2.000",
    pitch_mm: "50.80",
    description: "2\" double pitch heavy roller conveyor chain.",
    specs: {
      pitch_in: "2.000", pitch_mm: "50.80",
      roller_dia_in: "0.625", roller_width_in: "0.625",
      avg_ultimate_lbs: "14500",
      max_working_load_lbs: "3500",
    },
    performance_tiers: [
      { tier: "standard", tensile_strength_lbs: "14500", working_load_lbs: "3500", source: "ANSI B29.4" },
    ],
    source_refs: [
      { manufacturer: "Allied-Locke", code: "C2080H", confidence: "Confirmed" },
      { manufacturer: "Tsubaki", code: "C2080H", confidence: "Confirmed" },
      { manufacturer: "Donghua", code: "C2080H", confidence: "Confirmed" },
    ],
    attachments_available: ["A1", "A2", "K1", "K2"],
    sprocket_series: "C2080",
    materials_available: ["carbon_steel", "stainless_304"],
    options_upgrades: ["Large Roller", "Walk-on-Rail"],
    image_strategy: "family",
    status: "Active",
  },

  // ══════════════════════════════════════════════════════════════════
  // WELDED STEEL CHAINS
  // ══════════════════════════════════════════════════════════════════
  {
    chain_id: "WH-78",
    chain_family: "welded_steel",
    chain_number: "WH78",
    display_name: "WH78 Welded Steel Mill Chain",
    standard: "ASME B29.100",
    pitch_in: "2.609",
    pitch_mm: "66.27",
    description: "All-welded steel mill chain with heat-treated components. Used in grain elevators, log handling, and bulk material conveying.",
    specs: {
      pitch_in: "2.609", pitch_mm: "66.27",
      barrel_dia_in: "1.000",
      bearing_length_in: "1.375",
      max_sprocket_face_in: "1.500",
      avg_ultimate_lbs: "18000",
      max_working_load_lbs: "3600",
    },
    performance_tiers: [
      { tier: "standard", tensile_strength_lbs: "18000", working_load_lbs: "3600", source: "Allied-Locke / MAC Chain" },
      { tier: "performance", tensile_strength_lbs: "22000", working_load_lbs: "4400", source: "WHX Series", notes: "Induction hardened barrels and sidebars" },
    ],
    source_refs: [
      { manufacturer: "Allied-Locke", code: "WH78", confidence: "Confirmed" },
      { manufacturer: "MAC Chain", code: "WH78", confidence: "Confirmed" },
      { manufacturer: "Allied-Locke", code: "WHX78", confidence: "Confirmed", notes: "Induction Hardened version" },
    ],
    attachments_available: ["WA-K1", "WA-K2", "WA-A1", "WA-A2", "WA-SA1"],
    sprocket_series: "WH-78",
    materials_available: ["carbon_steel", "induction_hard"],
    options_upgrades: ["WHX78 Induction Hardened", "Extended pitch versions"],
    image_strategy: "exact",
    status: "Active",
  },

  {
    chain_id: "WH-124",
    chain_family: "welded_steel",
    chain_number: "WH124",
    display_name: "WH124 Welded Steel Mill Chain",
    standard: "ASME B29.100",
    pitch_in: "4.063",
    pitch_mm: "103.19",
    description: "Heavy welded steel mill chain. Used in bulk handling and elevator applications requiring higher load capacity.",
    specs: {
      pitch_in: "4.063", pitch_mm: "103.19",
      barrel_dia_in: "1.375",
      bearing_length_in: "2.000",
      avg_ultimate_lbs: "38000",
      max_working_load_lbs: "7600",
    },
    performance_tiers: [
      { tier: "standard", tensile_strength_lbs: "38000", working_load_lbs: "7600", source: "Allied-Locke / MAC Chain" },
    ],
    source_refs: [
      { manufacturer: "Allied-Locke", code: "WH124", confidence: "Confirmed" },
      { manufacturer: "MAC Chain", code: "WH124", confidence: "Confirmed" },
    ],
    attachments_available: ["WA-K1", "WA-K2", "WA-A1"],
    sprocket_series: "WH-124",
    materials_available: ["carbon_steel", "induction_hard"],
    options_upgrades: ["WHX124 Induction Hardened"],
    image_strategy: "exact",
    status: "Active",
  },

  // ══════════════════════════════════════════════════════════════════
  // DROP FORGED RIVETLESS CHAINS
  // ══════════════════════════════════════════════════════════════════
  {
    chain_id: "X348",
    chain_family: "drop_forged_rivetless",
    chain_number: "X348",
    display_name: "X348 Drop Forged Rivetless Chain",
    standard: "ASME B29.100",
    pitch_in: "3.075",
    pitch_mm: "78.11",
    description: "Most common drop forged rivetless chain. Used in overhead conveyors, pusher bars, and automotive paint lines. X348 standard pitch.",
    specs: {
      pitch_in: "3.075", pitch_mm: "78.11",
      avg_ultimate_lbs: "19500",
      max_working_load_lbs: "3900",
    },
    performance_tiers: [
      { tier: "standard", tensile_strength_lbs: "19500", working_load_lbs: "3900", source: "Allied-Locke" },
      { tier: "performance", tensile_strength_lbs: "25000", working_load_lbs: "5000", source: "Allied-Locke Extended", notes: "Heat treated version" },
    ],
    source_refs: [
      { manufacturer: "Allied-Locke", code: "X348", confidence: "Confirmed" },
      { manufacturer: "MAC Chain", code: "X348", confidence: "Confirmed" },
      { manufacturer: "Rexnord", code: "X348", confidence: "Needs Review" },
    ],
    attachments_available: ["DFR-DOG", "DFR-PUSHER", "DFR-TROLLEY"],
    sprocket_series: "X348",
    materials_available: ["carbon_steel", "high_temp"],
    options_upgrades: ["Extended pitch versions", "Chrome pin upgrade", "Corrosion coating"],
    image_strategy: "exact",
    status: "Active",
  },

  {
    chain_id: "X458",
    chain_family: "drop_forged_rivetless",
    chain_number: "X458",
    display_name: "X458 Drop Forged Rivetless Chain",
    standard: "ASME B29.100",
    pitch_in: "4.000",
    pitch_mm: "101.60",
    description: "Medium drop forged rivetless chain for overhead conveyors requiring higher load capacity than X348.",
    specs: {
      pitch_in: "4.000", pitch_mm: "101.60",
      avg_ultimate_lbs: "28000",
      max_working_load_lbs: "5600",
    },
    performance_tiers: [
      { tier: "standard", tensile_strength_lbs: "28000", working_load_lbs: "5600", source: "Allied-Locke" },
    ],
    source_refs: [
      { manufacturer: "Allied-Locke", code: "X458", confidence: "Confirmed" },
      { manufacturer: "MAC Chain", code: "X458", confidence: "Confirmed" },
    ],
    attachments_available: ["DFR-DOG", "DFR-PUSHER"],
    sprocket_series: "X458",
    materials_available: ["carbon_steel", "high_temp"],
    options_upgrades: ["Chrome pins"],
    image_strategy: "exact",
    status: "Active",
  },

  // ══════════════════════════════════════════════════════════════════
  // STEEL PINTLE CHAINS
  // ══════════════════════════════════════════════════════════════════
  {
    chain_id: "667",
    chain_family: "steel_pintle",
    chain_number: "667",
    display_name: "667 Steel Pintle Chain",
    standard: "ASME B29.6",
    pitch_in: "2.609",
    pitch_mm: "66.27",
    description: "Standard 667 steel pintle chain. All heat-treated components. Open barrel construction. Common in spreaders and agricultural conveying.",
    specs: {
      pitch_in: "2.609", pitch_mm: "66.27",
      avg_ultimate_lbs: "13000",
      max_working_load_lbs: "2600",
    },
    performance_tiers: [
      { tier: "standard", tensile_strength_lbs: "13000", working_load_lbs: "2600", source: "ASME B29.6" },
    ],
    source_refs: [
      { manufacturer: "Allied-Locke", code: "667", confidence: "Confirmed" },
      { manufacturer: "MAC Chain", code: "667", confidence: "Confirmed" },
    ],
    attachments_available: ["PC-A1", "PC-K1", "PC-SA1"],
    sprocket_series: "667",
    materials_available: ["carbon_steel"],
    options_upgrades: ["667X Extended life", "667H Heavy"],
    image_strategy: "exact",
    status: "Active",
  },

  {
    chain_id: "667X",
    chain_family: "steel_pintle",
    chain_number: "667X",
    display_name: "667X Steel Pintle Chain — Extended Life",
    standard: "ASME B29.6",
    pitch_in: "2.609",
    pitch_mm: "66.27",
    description: "667X extended-life steel pintle chain with hardened barrels and quad-staked pins for demanding agricultural and industrial applications.",
    specs: {
      pitch_in: "2.609", pitch_mm: "66.27",
      avg_ultimate_lbs: "17000",
      max_working_load_lbs: "3400",
    },
    performance_tiers: [
      { tier: "performance", tensile_strength_lbs: "17000", working_load_lbs: "3400", source: "Allied-Locke 667X", notes: "Hardened barrels, quad-staked pins" },
    ],
    source_refs: [
      { manufacturer: "Allied-Locke", code: "667X", confidence: "Confirmed" },
      { manufacturer: "MAC Chain", code: "667X", confidence: "Confirmed" },
    ],
    attachments_available: ["PC-A1", "PC-K1"],
    sprocket_series: "667",
    materials_available: ["carbon_steel", "induction_hard"],
    options_upgrades: [],
    image_strategy: "exact",
    status: "Active",
  },

  {
    chain_id: "7200",
    chain_family: "steel_pintle",
    chain_number: "7200",
    display_name: "7200 Series Steel Pintle Chain",
    standard: "ASME B29.6",
    pitch_in: "3.000",
    pitch_mm: "76.20",
    description: "7200 series pintle chain for fertilizer spreaders, manure conveyors, and heavier agricultural applications.",
    specs: {
      pitch_in: "3.000", pitch_mm: "76.20",
      avg_ultimate_lbs: "26000",
      max_working_load_lbs: "5200",
    },
    performance_tiers: [
      { tier: "standard", tensile_strength_lbs: "26000", working_load_lbs: "5200", source: "ASME B29.6" },
    ],
    source_refs: [
      { manufacturer: "Allied-Locke", code: "7200", confidence: "Confirmed" },
      { manufacturer: "MAC Chain", code: "7200", confidence: "Confirmed" },
    ],
    attachments_available: ["PC-A1", "PC-K1", "PC-SA1", "PC-FLAP"],
    sprocket_series: "7200",
    materials_available: ["carbon_steel"],
    options_upgrades: ["Quad-staked pins", "Extended barrel"],
    image_strategy: "exact",
    status: "Active",
  },

  // ══════════════════════════════════════════════════════════════════
  // ENGINEERED CLASS CHAINS
  // ══════════════════════════════════════════════════════════════════
  {
    chain_id: "SS-78",
    chain_family: "engineered_class",
    chain_number: "SS78",
    display_name: "SS78 Bushed Steel Conveyor Chain",
    standard: "ASME B29.100",
    pitch_in: "2.609",
    pitch_mm: "66.27",
    description: "SS Class solid roller bushed steel conveyor chain. No rollers — rides directly on track. Used in conveying applications where rollers are not required.",
    specs: {
      pitch_in: "2.609", pitch_mm: "66.27",
      avg_ultimate_lbs: "18000",
      max_working_load_lbs: "3600",
    },
    performance_tiers: [
      { tier: "standard", tensile_strength_lbs: "18000", working_load_lbs: "3600", source: "Allied-Locke" },
    ],
    source_refs: [
      { manufacturer: "Allied-Locke", code: "SS78", confidence: "Confirmed" },
      { manufacturer: "MAC Chain", code: "SS78", confidence: "Confirmed" },
    ],
    attachments_available: ["ENG-A1", "ENG-K1", "ENG-SA1"],
    sprocket_series: "SS-78",
    materials_available: ["carbon_steel"],
    options_upgrades: ["Heat treated version"],
    image_strategy: "exact",
    status: "Active",
  },

  {
    chain_id: "MSR-6018",
    chain_family: "engineered_class",
    chain_number: "MSR6018",
    display_name: "MSR6018 Bushed Roller Steel Chain",
    standard: "ASME B29.100",
    pitch_in: "6.000",
    pitch_mm: "152.40",
    description: "MSR Class bushed roller steel conveyor chain with 18\" face width. Heavy-duty drag and conveying applications.",
    specs: {
      pitch_in: "6.000", pitch_mm: "152.40",
      barrel_dia_in: "2.000",
      avg_ultimate_lbs: "90000",
      max_working_load_lbs: "18000",
    },
    performance_tiers: [
      { tier: "standard", tensile_strength_lbs: "90000", working_load_lbs: "18000", source: "Allied-Locke" },
    ],
    source_refs: [
      { manufacturer: "Allied-Locke", code: "MSR6018", confidence: "Confirmed" },
      { manufacturer: "MAC Chain", code: "MSR6018", confidence: "Confirmed" },
    ],
    attachments_available: ["ENG-FLIGHT", "ENG-SA1"],
    sprocket_series: "MSR-60",
    materials_available: ["carbon_steel"],
    options_upgrades: ["Extended pitch"],
    image_strategy: "exact",
    status: "Active",
  },

  // ══════════════════════════════════════════════════════════════════
  // SPECIALTY / CONVEYOR CHAINS
  // ══════════════════════════════════════════════════════════════════
  {
    chain_id: "81X",
    chain_family: "specialty_custom",
    chain_number: "81X",
    display_name: "81X Extended Pitch Chain",
    standard: "ASME B29.100",
    pitch_in: "3.000",
    pitch_mm: "76.20",
    description: "81X series extended pitch chain for agricultural conveying, waste water, and specialty industrial applications.",
    specs: {
      pitch_in: "3.000", pitch_mm: "76.20",
      avg_ultimate_lbs: "24000",
      max_working_load_lbs: "4800",
    },
    performance_tiers: [
      { tier: "standard", tensile_strength_lbs: "24000", working_load_lbs: "4800", source: "ASME B29.100" },
    ],
    source_refs: [
      { manufacturer: "Allied-Locke", code: "81X", confidence: "Confirmed" },
    ],
    attachments_available: ["A1", "A2", "K1", "K2"],
    sprocket_series: "81X",
    materials_available: ["carbon_steel", "stainless_304"],
    options_upgrades: [],
    image_strategy: "family",
    status: "Active",
  },

  {
    chain_id: "103B",
    chain_family: "specialty_custom",
    chain_number: "103B",
    display_name: "103B Specialty Chain",
    standard: "ASME B29.100",
    pitch_in: "3.000",
    pitch_mm: "76.20",
    description: "103B specialty agricultural and industrial conveying chain.",
    specs: {
      pitch_in: "3.000", pitch_mm: "76.20",
      avg_ultimate_lbs: "21000",
      max_working_load_lbs: "4200",
    },
    performance_tiers: [
      { tier: "standard", tensile_strength_lbs: "21000", working_load_lbs: "4200", source: "ASME B29.100" },
    ],
    source_refs: [
      { manufacturer: "Allied-Locke", code: "103B", confidence: "Confirmed" },
    ],
    attachments_available: ["A1", "K1"],
    sprocket_series: "103B",
    materials_available: ["carbon_steel"],
    options_upgrades: [],
    image_strategy: "family",
    status: "Active",
  },

  // ══════════════════════════════════════════════════════════════════
  // AGRICULTURAL CHAINS
  // ══════════════════════════════════════════════════════════════════
  {
    chain_id: "CA550",
    chain_family: "agricultural_conveyor",
    chain_number: "CA550",
    display_name: "CA550 Agricultural Roller Chain",
    standard: "ASME B29.200",
    pitch_in: "1.654",
    pitch_mm: "42.01",
    description: "CA550 agricultural roller chain. Common in combines, forage harvesters, and grain handling equipment.",
    specs: {
      pitch_in: "1.654", pitch_mm: "42.01",
      avg_ultimate_lbs: "16000",
      max_working_load_lbs: "3200",
    },
    performance_tiers: [
      { tier: "standard", tensile_strength_lbs: "16000", working_load_lbs: "3200", source: "ASME B29.200" },
    ],
    source_refs: [
      { manufacturer: "Allied-Locke", code: "CA550", confidence: "Confirmed" },
      { manufacturer: "Donghua", code: "CA550", confidence: "Confirmed" },
    ],
    attachments_available: ["AGRI-A1", "AGRI-K1"],
    sprocket_series: "CA550",
    materials_available: ["carbon_steel", "stainless_304"],
    options_upgrades: ["O-Ring version"],
    image_strategy: "family",
    status: "Active",
  },

  // ══════════════════════════════════════════════════════════════════
  // LEAF CHAINS
  // ══════════════════════════════════════════════════════════════════
  {
    chain_id: "AL1022",
    chain_family: "leaf_chain",
    chain_number: "AL1022",
    display_name: "AL1022 Leaf Chain",
    standard: "ANSI/ASME B29.8",
    pitch_in: "1.000",
    pitch_mm: "25.40",
    description: "AL series leaf chain for forklift mast applications. 10 plates wide, 22 lacing.",
    specs: {
      pitch_in: "1.000", pitch_mm: "25.40",
      lacing: "2×2",
      avg_ultimate_lbs: "42900",
      max_working_load_lbs: "8580",
    },
    performance_tiers: [
      { tier: "standard", tensile_strength_lbs: "42900", working_load_lbs: "8580", source: "ANSI/ASME B29.8" },
    ],
    source_refs: [
      { manufacturer: "Allied-Locke", code: "AL1022", confidence: "Confirmed" },
    ],
    attachments_available: [],
    sprocket_series: null,
    materials_available: ["carbon_steel", "stainless_304"],
    options_upgrades: ["Shot peened version"],
    image_strategy: "family",
    status: "Active",
  },

];

// ─── Lookup helpers ────────────────────────────────────────────────────────────

/** Get normalized chain by chain_id (primary key) */
export function getChainById(chain_id) {
  return NORMALIZED_CHAINS.find(c => c.chain_id === chain_id) || null;
}

/** Get all chains for a given family key */
export function getChainsByFamily(family_key) {
  return NORMALIZED_CHAINS.filter(c => c.chain_family === family_key);
}

/** Find a normalized chain by a manufacturer's product code (equivalency lookup) */
export function findByManufacturerCode(manufacturer, code) {
  if (!manufacturer || !code) return null;
  const mLower = manufacturer.toLowerCase();
  const cLower = code.toLowerCase();
  return NORMALIZED_CHAINS.find(chain =>
    chain.source_refs?.some(ref =>
      ref.manufacturer.toLowerCase() === mLower &&
      ref.code.toLowerCase() === cLower
    )
  ) || null;
}

/** Search chains by text across number, family, description, source codes */
export function searchChains(query) {
  if (!query?.trim()) return NORMALIZED_CHAINS;
  const q = query.toLowerCase();
  return NORMALIZED_CHAINS.filter(c =>
    c.chain_number?.toLowerCase().includes(q) ||
    c.display_name?.toLowerCase().includes(q) ||
    c.chain_family?.toLowerCase().includes(q) ||
    c.description?.toLowerCase().includes(q) ||
    c.standard?.toLowerCase().includes(q) ||
    c.source_refs?.some(ref => ref.code.toLowerCase().includes(q) || ref.manufacturer.toLowerCase().includes(q))
  );
}

/** Get all unique manufacturers across all normalized chains */
export function getAllManufacturers() {
  const mfrs = new Set();
  for (const chain of NORMALIZED_CHAINS) {
    for (const ref of (chain.source_refs || [])) {
      mfrs.add(ref.manufacturer);
    }
  }
  return [...mfrs].sort();
}

/** Get all chains that a given manufacturer makes (confirmed only by default) */
export function getChainsByManufacturer(manufacturer, confirmedOnly = true) {
  const mLower = manufacturer.toLowerCase();
  return NORMALIZED_CHAINS.filter(chain =>
    chain.source_refs?.some(ref =>
      ref.manufacturer.toLowerCase() === mLower &&
      (!confirmedOnly || ref.confidence === "Confirmed")
    )
  );
}

/** Deduplicate check — returns true if chain_id already exists */
export function chainExists(chain_id) {
  return NORMALIZED_CHAINS.some(c => c.chain_id === chain_id);
}

export default NORMALIZED_CHAINS;