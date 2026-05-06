/**
 * chainNormalizedExpansion.js
 *
 * Expanded normalized chain catalog — Phase 1 ingestion.
 * Covers families not yet in chainNormalizedDictionary.js:
 *
 * - ANSI Roller Chain (complete: 140, 240, multi-strand, BS/ISO)
 * - Hollow Pin Chains
 * - Conveyor Roller Chains (C2040 full range)
 * - Attachment Roller Chains (structural entries)
 * - Welded Steel Chains (full WH/WR series)
 * - Steel Pintle Chains (full series)
 * - Engineering Class Chains (SS, MSR, MXS full range)
 * - Drop Forged Rivetless (X678, 477, 698)
 * - Agricultural Conveyor Chains (full CA/S series)
 * - Bucket Elevator Chains
 * - Drag/Scraper Chains (WD series)
 * - Leaf Chains (full AL/BL)
 * - Overhead Conveyor Chains
 *
 * ARCHITECTURE RULES:
 * - One entry per normalized chain number
 * - Manufacturer equivalencies in source_refs[], never as separate chains
 * - Do NOT overwrite chainNormalizedDictionary.js — this is additive
 * - Import and spread both arrays in consumers
 */

export const NORMALIZED_CHAINS_EXPANSION = [

  // ══════════════════════════════════════════════════════════════════
  // ANSI ROLLER CHAINS — completing the standard series
  // ══════════════════════════════════════════════════════════════════

  {
    chain_id: "ANSI-50H",
    chain_family: "performance_roller",
    chain_number: "50H",
    display_name: "ANSI 50H Heavy Roller Chain",
    standard: "ANSI B29.1",
    pitch_in: "0.625",
    pitch_mm: "15.875",
    description: "Heavy series 5/8\" ANSI roller chain with thicker sidebar plates for higher load applications.",
    specs: {
      pitch_in: "0.625", pitch_mm: "15.875",
      roller_dia_in: "0.400", roller_width_in: "0.375",
      pin_dia_in: "0.200", plate_height_in: "0.940",
      avg_ultimate_lbs: "8000", max_working_load_lbs: "1600",
    },
    performance_tiers: [
      { tier: "standard", tensile_strength_lbs: "8000", working_load_lbs: "1600", source: "Allied-Locke" },
    ],
    source_refs: [
      { manufacturer: "Allied-Locke", code: "50H", confidence: "Confirmed" },
      { manufacturer: "Tsubaki", code: "50H-1", confidence: "Confirmed" },
      { manufacturer: "Peer", code: "50H-1", confidence: "Confirmed" },
      { manufacturer: "Donghua", code: "50AH-1", confidence: "Confirmed" },
      { manufacturer: "Iwis", code: "50H", confidence: "Confirmed" },
    ],
    attachments_available: ["A1", "A2", "K1", "K2"],
    sprocket_series: "ANSI-50",
    materials_available: ["carbon_steel", "stainless_304"],
    options_upgrades: ["Hollow Pin"],
    image_strategy: "family",
    status: "Active",
  },

  {
    chain_id: "ANSI-100H",
    chain_family: "performance_roller",
    chain_number: "100H",
    display_name: "ANSI 100H Heavy Roller Chain",
    standard: "ANSI B29.1",
    pitch_in: "1.250",
    pitch_mm: "31.75",
    description: "Heavy series 1-1/4\" ANSI roller chain with thicker sidebars for heavy industrial drives.",
    specs: {
      pitch_in: "1.250", pitch_mm: "31.75",
      roller_dia_in: "0.750", roller_width_in: "0.750",
      pin_dia_in: "0.375", plate_height_in: "1.875",
      avg_ultimate_lbs: "29000", max_working_load_lbs: "5800",
    },
    performance_tiers: [
      { tier: "standard", tensile_strength_lbs: "29000", working_load_lbs: "5800", source: "Allied-Locke" },
    ],
    source_refs: [
      { manufacturer: "Allied-Locke", code: "100H", confidence: "Confirmed" },
      { manufacturer: "Tsubaki", code: "100H-1", confidence: "Confirmed" },
      { manufacturer: "Peer", code: "100H-1", confidence: "Confirmed" },
    ],
    attachments_available: ["A1", "A2", "K1", "K2"],
    sprocket_series: "ANSI-100",
    materials_available: ["carbon_steel", "stainless_304"],
    options_upgrades: [],
    image_strategy: "family",
    status: "Active",
  },

  {
    chain_id: "ANSI-120H",
    chain_family: "performance_roller",
    chain_number: "120H",
    display_name: "ANSI 120H Heavy Roller Chain",
    standard: "ANSI B29.1",
    pitch_in: "1.500",
    pitch_mm: "38.10",
    description: "Heavy series 1-1/2\" ANSI roller chain.",
    specs: {
      pitch_in: "1.500", pitch_mm: "38.10",
      roller_dia_in: "0.875", roller_width_in: "1.000",
      avg_ultimate_lbs: "42000", max_working_load_lbs: "9200",
    },
    performance_tiers: [
      { tier: "standard", tensile_strength_lbs: "42000", working_load_lbs: "9200", source: "Allied-Locke" },
    ],
    source_refs: [
      { manufacturer: "Allied-Locke", code: "120H", confidence: "Confirmed" },
      { manufacturer: "Tsubaki", code: "120H-1", confidence: "Confirmed" },
    ],
    attachments_available: ["A1", "A2", "K1", "K2"],
    sprocket_series: "ANSI-120",
    materials_available: ["carbon_steel"],
    options_upgrades: [],
    image_strategy: "family",
    status: "Active",
  },

  {
    chain_id: "ANSI-140",
    chain_family: "performance_roller",
    chain_number: "140",
    display_name: "ANSI 140 Roller Chain",
    standard: "ANSI B29.1",
    pitch_in: "1.750",
    pitch_mm: "44.45",
    description: "1-3/4\" pitch ANSI roller chain for very heavy industrial drives.",
    specs: {
      pitch_in: "1.750", pitch_mm: "44.45",
      roller_dia_in: "1.000", roller_width_in: "1.125",
      pin_dia_in: "0.500", plate_height_in: "2.375",
      avg_ultimate_lbs: "46000", max_working_load_lbs: "11000",
    },
    performance_tiers: [
      { tier: "standard", tensile_strength_lbs: "46000", working_load_lbs: "11000", source: "ANSI B29.1" },
    ],
    source_refs: [
      { manufacturer: "Allied-Locke", code: "140", confidence: "Confirmed" },
      { manufacturer: "Tsubaki", code: "140-1", confidence: "Confirmed" },
      { manufacturer: "Donghua", code: "140A-1", confidence: "Confirmed" },
      { manufacturer: "Peer", code: "140-1", confidence: "Confirmed" },
    ],
    attachments_available: ["A1", "A2", "K1", "K2"],
    sprocket_series: "ANSI-140",
    materials_available: ["carbon_steel", "stainless_304"],
    options_upgrades: ["140H Heavy Series", "Double Strand"],
    image_strategy: "family",
    status: "Active",
  },

  {
    chain_id: "ANSI-140H",
    chain_family: "performance_roller",
    chain_number: "140H",
    display_name: "ANSI 140H Heavy Roller Chain",
    standard: "ANSI B29.1",
    pitch_in: "1.750",
    pitch_mm: "44.45",
    description: "Heavy series 1-3/4\" ANSI roller chain.",
    specs: {
      pitch_in: "1.750", pitch_mm: "44.45",
      avg_ultimate_lbs: "54000", max_working_load_lbs: "13000",
    },
    performance_tiers: [
      { tier: "standard", tensile_strength_lbs: "54000", working_load_lbs: "13000", source: "Allied-Locke" },
    ],
    source_refs: [
      { manufacturer: "Allied-Locke", code: "140H", confidence: "Confirmed" },
      { manufacturer: "Tsubaki", code: "140H-1", confidence: "Confirmed" },
    ],
    attachments_available: ["A1", "A2", "K1", "K2"],
    sprocket_series: "ANSI-140",
    materials_available: ["carbon_steel"],
    options_upgrades: [],
    image_strategy: "family",
    status: "Active",
  },

  {
    chain_id: "ANSI-160H",
    chain_family: "performance_roller",
    chain_number: "160H",
    display_name: "ANSI 160H Heavy Roller Chain",
    standard: "ANSI B29.1",
    pitch_in: "2.000",
    pitch_mm: "50.80",
    description: "Heavy series 2\" ANSI roller chain for maximum industrial drive loads.",
    specs: {
      pitch_in: "2.000", pitch_mm: "50.80",
      avg_ultimate_lbs: "68000", max_working_load_lbs: "16000",
    },
    performance_tiers: [
      { tier: "standard", tensile_strength_lbs: "68000", working_load_lbs: "16000", source: "Allied-Locke" },
    ],
    source_refs: [
      { manufacturer: "Allied-Locke", code: "160H", confidence: "Confirmed" },
      { manufacturer: "Tsubaki", code: "160H-1", confidence: "Confirmed" },
    ],
    attachments_available: ["A1", "A2", "K1", "K2"],
    sprocket_series: "ANSI-160",
    materials_available: ["carbon_steel"],
    options_upgrades: [],
    image_strategy: "family",
    status: "Active",
  },

  {
    chain_id: "ANSI-240",
    chain_family: "performance_roller",
    chain_number: "240",
    display_name: "ANSI 240 Roller Chain",
    standard: "ANSI B29.1",
    pitch_in: "3.000",
    pitch_mm: "76.20",
    description: "3\" pitch ANSI roller chain. Heaviest standard ANSI series for maximum load drives.",
    specs: {
      pitch_in: "3.000", pitch_mm: "76.20",
      roller_dia_in: "1.562", roller_width_in: "1.875",
      pin_dia_in: "0.750", plate_height_in: "4.000",
      avg_ultimate_lbs: "130000", max_working_load_lbs: "32000",
    },
    performance_tiers: [
      { tier: "standard", tensile_strength_lbs: "130000", working_load_lbs: "32000", source: "ANSI B29.1" },
    ],
    source_refs: [
      { manufacturer: "Allied-Locke", code: "240", confidence: "Confirmed" },
      { manufacturer: "Tsubaki", code: "240-1", confidence: "Confirmed" },
      { manufacturer: "Donghua", code: "240A-1", confidence: "Confirmed" },
    ],
    attachments_available: ["A1", "A2", "K1", "K2"],
    sprocket_series: "ANSI-240",
    materials_available: ["carbon_steel"],
    options_upgrades: ["Double Strand", "Triple Strand"],
    image_strategy: "family",
    status: "Active",
  },

  // British Standard (BS/ISO) Roller Chains
  {
    chain_id: "BS-06B",
    chain_family: "performance_roller",
    chain_number: "06B",
    display_name: "06B British Standard Roller Chain",
    standard: "ISO 606 / BS 228",
    pitch_in: "0.375",
    pitch_mm: "9.525",
    description: "3/8\" pitch British Standard roller chain. ISO 606 compliant. Common in European industrial equipment.",
    specs: {
      pitch_in: "0.375", pitch_mm: "9.525",
      roller_dia_in: "0.220", roller_width_in: "0.220",
      avg_ultimate_lbs: "1900", max_working_load_lbs: "430",
    },
    performance_tiers: [
      { tier: "standard", tensile_strength_lbs: "1900", working_load_lbs: "430", source: "ISO 606" },
    ],
    source_refs: [
      { manufacturer: "Allied-Locke", code: "06B-1", confidence: "Confirmed" },
      { manufacturer: "Donghua", code: "06B-1", confidence: "Confirmed" },
      { manufacturer: "Iwis", code: "06B-1", confidence: "Confirmed" },
      { manufacturer: "Tsubaki", code: "06B-1", confidence: "Confirmed" },
      { manufacturer: "Renold", code: "06B-1", confidence: "Confirmed" },
    ],
    attachments_available: [],
    sprocket_series: "BS-06B",
    materials_available: ["carbon_steel", "stainless_304", "nickel_plated"],
    options_upgrades: ["Double strand (06B-2)", "Triple strand (06B-3)"],
    image_strategy: "family",
    status: "Active",
  },

  {
    chain_id: "BS-08B",
    chain_family: "performance_roller",
    chain_number: "08B",
    display_name: "08B British Standard Roller Chain",
    standard: "ISO 606 / BS 228",
    pitch_in: "0.500",
    pitch_mm: "12.70",
    description: "1/2\" pitch British Standard roller chain — equivalent to ANSI 40 in pitch but different dimensions.",
    specs: {
      pitch_in: "0.500", pitch_mm: "12.70",
      roller_dia_in: "0.315", roller_width_in: "0.315",
      avg_ultimate_lbs: "4000", max_working_load_lbs: "900",
    },
    performance_tiers: [
      { tier: "standard", tensile_strength_lbs: "4000", working_load_lbs: "900", source: "ISO 606" },
    ],
    source_refs: [
      { manufacturer: "Allied-Locke", code: "08B-1", confidence: "Confirmed" },
      { manufacturer: "Donghua", code: "08B-1", confidence: "Confirmed" },
      { manufacturer: "Iwis", code: "08B-1", confidence: "Confirmed" },
      { manufacturer: "Tsubaki", code: "08B-1", confidence: "Confirmed" },
      { manufacturer: "Renold", code: "08B-1", confidence: "Confirmed" },
    ],
    attachments_available: [],
    sprocket_series: "BS-08B",
    materials_available: ["carbon_steel", "stainless_304", "nickel_plated"],
    options_upgrades: ["Double strand", "Triple strand"],
    image_strategy: "family",
    status: "Active",
  },

  {
    chain_id: "BS-10B",
    chain_family: "performance_roller",
    chain_number: "10B",
    display_name: "10B British Standard Roller Chain",
    standard: "ISO 606 / BS 228",
    pitch_in: "0.625",
    pitch_mm: "15.875",
    description: "5/8\" pitch British Standard roller chain.",
    specs: {
      pitch_in: "0.625", pitch_mm: "15.875",
      avg_ultimate_lbs: "5900", max_working_load_lbs: "1350",
    },
    performance_tiers: [
      { tier: "standard", tensile_strength_lbs: "5900", working_load_lbs: "1350", source: "ISO 606" },
    ],
    source_refs: [
      { manufacturer: "Allied-Locke", code: "10B-1", confidence: "Confirmed" },
      { manufacturer: "Donghua", code: "10B-1", confidence: "Confirmed" },
      { manufacturer: "Iwis", code: "10B-1", confidence: "Confirmed" },
      { manufacturer: "Renold", code: "10B-1", confidence: "Confirmed" },
    ],
    attachments_available: [],
    sprocket_series: "BS-10B",
    materials_available: ["carbon_steel", "stainless_304"],
    options_upgrades: [],
    image_strategy: "family",
    status: "Active",
  },

  {
    chain_id: "BS-12A",
    chain_family: "performance_roller",
    chain_number: "12A",
    display_name: "12A British Standard Roller Chain",
    standard: "ISO 606 / BS 228",
    pitch_in: "0.750",
    pitch_mm: "19.05",
    description: "3/4\" pitch British Standard roller chain — ISO equivalent to ANSI 60.",
    specs: {
      pitch_in: "0.750", pitch_mm: "19.05",
      avg_ultimate_lbs: "8500", max_working_load_lbs: "1950",
    },
    performance_tiers: [
      { tier: "standard", tensile_strength_lbs: "8500", working_load_lbs: "1950", source: "ISO 606" },
    ],
    source_refs: [
      { manufacturer: "Allied-Locke", code: "12A-1", confidence: "Confirmed" },
      { manufacturer: "Donghua", code: "12A-1", confidence: "Confirmed" },
      { manufacturer: "Iwis", code: "12A-1", confidence: "Confirmed" },
      { manufacturer: "Renold", code: "12A-1", confidence: "Confirmed" },
    ],
    attachments_available: [],
    sprocket_series: "BS-12A",
    materials_available: ["carbon_steel", "stainless_304"],
    options_upgrades: [],
    image_strategy: "family",
    status: "Active",
  },

  {
    chain_id: "BS-16A",
    chain_family: "performance_roller",
    chain_number: "16A",
    display_name: "16A British Standard Roller Chain",
    standard: "ISO 606 / BS 228",
    pitch_in: "1.000",
    pitch_mm: "25.40",
    description: "1\" pitch British Standard roller chain — ISO equivalent to ANSI 80.",
    specs: {
      pitch_in: "1.000", pitch_mm: "25.40",
      avg_ultimate_lbs: "14500", max_working_load_lbs: "3500",
    },
    performance_tiers: [
      { tier: "standard", tensile_strength_lbs: "14500", working_load_lbs: "3500", source: "ISO 606" },
    ],
    source_refs: [
      { manufacturer: "Allied-Locke", code: "16A-1", confidence: "Confirmed" },
      { manufacturer: "Donghua", code: "16A-1", confidence: "Confirmed" },
      { manufacturer: "Iwis", code: "16A-1", confidence: "Confirmed" },
      { manufacturer: "Renold", code: "16A-1", confidence: "Confirmed" },
    ],
    attachments_available: [],
    sprocket_series: "BS-16A",
    materials_available: ["carbon_steel", "stainless_304"],
    options_upgrades: [],
    image_strategy: "family",
    status: "Active",
  },

  {
    chain_id: "BS-20A",
    chain_family: "performance_roller",
    chain_number: "20A",
    display_name: "20A British Standard Roller Chain",
    standard: "ISO 606 / BS 228",
    pitch_in: "1.250",
    pitch_mm: "31.75",
    description: "1-1/4\" pitch British Standard roller chain — ISO equivalent to ANSI 100.",
    specs: {
      pitch_in: "1.250", pitch_mm: "31.75",
      avg_ultimate_lbs: "24000", max_working_load_lbs: "5500",
    },
    performance_tiers: [
      { tier: "standard", tensile_strength_lbs: "24000", working_load_lbs: "5500", source: "ISO 606" },
    ],
    source_refs: [
      { manufacturer: "Allied-Locke", code: "20A-1", confidence: "Confirmed" },
      { manufacturer: "Donghua", code: "20A-1", confidence: "Confirmed" },
      { manufacturer: "Iwis", code: "20A-1", confidence: "Confirmed" },
      { manufacturer: "Renold", code: "20A-1", confidence: "Confirmed" },
    ],
    attachments_available: [],
    sprocket_series: "BS-20A",
    materials_available: ["carbon_steel", "stainless_304"],
    options_upgrades: [],
    image_strategy: "family",
    status: "Active",
  },

  // ══════════════════════════════════════════════════════════════════
  // HOLLOW PIN CHAINS
  // ══════════════════════════════════════════════════════════════════

  {
    chain_id: "HP-40",
    chain_family: "hollow_pin",
    chain_number: "40HP",
    display_name: "40HP Hollow Pin Roller Chain",
    standard: "ANSI B29.1",
    pitch_in: "0.500",
    pitch_mm: "12.70",
    description: "1/2\" pitch hollow pin chain. Pins are drilled hollow to accept cross-rods, bars, and special attachments. Used in slat and scraper conveyors.",
    specs: {
      pitch_in: "0.500", pitch_mm: "12.70",
      roller_dia_in: "0.312", roller_width_in: "0.312",
      pin_dia_in: "0.156",
      avg_ultimate_lbs: "3700", max_working_load_lbs: "740",
    },
    performance_tiers: [
      { tier: "standard", tensile_strength_lbs: "3700", working_load_lbs: "740", source: "Allied-Locke" },
    ],
    source_refs: [
      { manufacturer: "Allied-Locke", code: "40HP", confidence: "Confirmed" },
      { manufacturer: "Tsubaki", code: "40HP", confidence: "Confirmed" },
      { manufacturer: "Donghua", code: "40HP", confidence: "Confirmed" },
    ],
    attachments_available: [],
    sprocket_series: "ANSI-40",
    materials_available: ["carbon_steel", "stainless_304"],
    options_upgrades: ["Extended pin option", "Side roller option"],
    image_strategy: "family",
    status: "Active",
  },

  {
    chain_id: "HP-50",
    chain_family: "hollow_pin",
    chain_number: "50HP",
    display_name: "50HP Hollow Pin Roller Chain",
    standard: "ANSI B29.1",
    pitch_in: "0.625",
    pitch_mm: "15.875",
    description: "5/8\" pitch hollow pin chain for cross-rod and slat conveyor applications.",
    specs: {
      pitch_in: "0.625", pitch_mm: "15.875",
      roller_dia_in: "0.400", roller_width_in: "0.375",
      avg_ultimate_lbs: "6100", max_working_load_lbs: "1220",
    },
    performance_tiers: [
      { tier: "standard", tensile_strength_lbs: "6100", working_load_lbs: "1220", source: "Allied-Locke" },
    ],
    source_refs: [
      { manufacturer: "Allied-Locke", code: "50HP", confidence: "Confirmed" },
      { manufacturer: "Tsubaki", code: "50HP", confidence: "Confirmed" },
    ],
    attachments_available: [],
    sprocket_series: "ANSI-50",
    materials_available: ["carbon_steel", "stainless_304"],
    options_upgrades: [],
    image_strategy: "family",
    status: "Active",
  },

  {
    chain_id: "HP-60",
    chain_family: "hollow_pin",
    chain_number: "60HP",
    display_name: "60HP Hollow Pin Roller Chain",
    standard: "ANSI B29.1",
    pitch_in: "0.750",
    pitch_mm: "19.05",
    description: "3/4\" pitch hollow pin chain. Common in flight conveyors, cross-rod slat chains, and specialty agricultural equipment.",
    specs: {
      pitch_in: "0.750", pitch_mm: "19.05",
      roller_dia_in: "0.469", roller_width_in: "0.500",
      avg_ultimate_lbs: "8500", max_working_load_lbs: "1700",
    },
    performance_tiers: [
      { tier: "standard", tensile_strength_lbs: "8500", working_load_lbs: "1700", source: "Allied-Locke" },
    ],
    source_refs: [
      { manufacturer: "Allied-Locke", code: "60HP", confidence: "Confirmed" },
      { manufacturer: "Tsubaki", code: "60HP", confidence: "Confirmed" },
      { manufacturer: "Donghua", code: "60HP", confidence: "Confirmed" },
    ],
    attachments_available: [],
    sprocket_series: "ANSI-60",
    materials_available: ["carbon_steel", "stainless_304"],
    options_upgrades: [],
    image_strategy: "family",
    status: "Active",
  },

  {
    chain_id: "HP-80",
    chain_family: "hollow_pin",
    chain_number: "80HP",
    display_name: "80HP Hollow Pin Roller Chain",
    standard: "ANSI B29.1",
    pitch_in: "1.000",
    pitch_mm: "25.40",
    description: "1\" pitch hollow pin chain. Cross-rod, slat, and scraper applications requiring higher loads.",
    specs: {
      pitch_in: "1.000", pitch_mm: "25.40",
      roller_dia_in: "0.625", roller_width_in: "0.625",
      avg_ultimate_lbs: "14500", max_working_load_lbs: "2900",
    },
    performance_tiers: [
      { tier: "standard", tensile_strength_lbs: "14500", working_load_lbs: "2900", source: "Allied-Locke" },
    ],
    source_refs: [
      { manufacturer: "Allied-Locke", code: "80HP", confidence: "Confirmed" },
      { manufacturer: "Tsubaki", code: "80HP", confidence: "Confirmed" },
      { manufacturer: "Donghua", code: "80HP", confidence: "Confirmed" },
    ],
    attachments_available: [],
    sprocket_series: "ANSI-80",
    materials_available: ["carbon_steel", "stainless_304"],
    options_upgrades: [],
    image_strategy: "family",
    status: "Active",
  },

  {
    chain_id: "HP-2060",
    chain_family: "hollow_pin",
    chain_number: "2060HP",
    display_name: "2060HP Double Pitch Hollow Pin Chain",
    standard: "ANSI B29.4",
    pitch_in: "1.500",
    pitch_mm: "38.10",
    description: "Double pitch hollow pin conveyor chain. Economy hollow pin for longer spans.",
    specs: {
      pitch_in: "1.500", pitch_mm: "38.10",
      avg_ultimate_lbs: "8500", max_working_load_lbs: "1700",
    },
    performance_tiers: [
      { tier: "standard", tensile_strength_lbs: "8500", working_load_lbs: "1700", source: "Allied-Locke" },
    ],
    source_refs: [
      { manufacturer: "Allied-Locke", code: "2060HP", confidence: "Confirmed" },
    ],
    attachments_available: [],
    sprocket_series: "C2060",
    materials_available: ["carbon_steel", "stainless_304"],
    options_upgrades: [],
    image_strategy: "family",
    status: "Active",
  },

  // ══════════════════════════════════════════════════════════════════
  // DOUBLE PITCH CONVEYOR CHAINS — completing the series
  // ══════════════════════════════════════════════════════════════════

  {
    chain_id: "C2050",
    chain_family: "double_pitch_conveyor",
    chain_number: "C2050",
    display_name: "C2050 Double Pitch Roller Chain",
    standard: "ANSI B29.4",
    pitch_in: "1.250",
    pitch_mm: "31.75",
    description: "1-1/4\" double pitch chain using #50 components. Economy conveyor chain for light loads.",
    specs: {
      pitch_in: "1.250", pitch_mm: "31.75",
      roller_dia_in: "0.400", roller_width_in: "0.375",
      avg_ultimate_lbs: "6100", max_working_load_lbs: "1330",
    },
    performance_tiers: [
      { tier: "standard", tensile_strength_lbs: "6100", working_load_lbs: "1330", source: "ANSI B29.4" },
    ],
    source_refs: [
      { manufacturer: "Allied-Locke", code: "C2050", confidence: "Confirmed" },
      { manufacturer: "Tsubaki", code: "C2050", confidence: "Confirmed" },
      { manufacturer: "Donghua", code: "C2050", confidence: "Confirmed" },
    ],
    attachments_available: ["A1", "A2", "K1", "K2"],
    sprocket_series: "C2050",
    materials_available: ["carbon_steel", "stainless_304", "nickel_plated"],
    options_upgrades: ["Large roller (LR)", "Small roller (SR)"],
    image_strategy: "family",
    status: "Active",
  },

  {
    chain_id: "C2060",
    chain_family: "double_pitch_conveyor",
    chain_number: "C2060",
    display_name: "C2060 Double Pitch Roller Chain",
    standard: "ANSI B29.4",
    pitch_in: "1.500",
    pitch_mm: "38.10",
    description: "1-1/2\" double pitch chain using #60 components. Standard bore conveyor chain.",
    specs: {
      pitch_in: "1.500", pitch_mm: "38.10",
      roller_dia_in: "0.469", roller_width_in: "0.500",
      avg_ultimate_lbs: "8500", max_working_load_lbs: "1950",
    },
    performance_tiers: [
      { tier: "standard", tensile_strength_lbs: "8500", working_load_lbs: "1950", source: "ANSI B29.4" },
    ],
    source_refs: [
      { manufacturer: "Allied-Locke", code: "C2060", confidence: "Confirmed" },
      { manufacturer: "Tsubaki", code: "C2060", confidence: "Confirmed" },
      { manufacturer: "Donghua", code: "C2060", confidence: "Confirmed" },
      { manufacturer: "Peer", code: "C2060", confidence: "Confirmed" },
    ],
    attachments_available: ["A1", "A2", "K1", "K2", "SA1", "SA2"],
    sprocket_series: "C2060",
    materials_available: ["carbon_steel", "stainless_304", "nickel_plated"],
    options_upgrades: ["C2060H Heavy Series", "Large Roller", "Small Roller", "Walk-on-Rail"],
    image_strategy: "family",
    status: "Active",
  },

  {
    chain_id: "C2080",
    chain_family: "double_pitch_conveyor",
    chain_number: "C2080",
    display_name: "C2080 Double Pitch Roller Chain",
    standard: "ANSI B29.4",
    pitch_in: "2.000",
    pitch_mm: "50.80",
    description: "2\" double pitch conveyor chain using #80 components.",
    specs: {
      pitch_in: "2.000", pitch_mm: "50.80",
      roller_dia_in: "0.625", roller_width_in: "0.625",
      avg_ultimate_lbs: "14500", max_working_load_lbs: "3500",
    },
    performance_tiers: [
      { tier: "standard", tensile_strength_lbs: "14500", working_load_lbs: "3500", source: "ANSI B29.4" },
    ],
    source_refs: [
      { manufacturer: "Allied-Locke", code: "C2080", confidence: "Confirmed" },
      { manufacturer: "Tsubaki", code: "C2080", confidence: "Confirmed" },
      { manufacturer: "Donghua", code: "C2080", confidence: "Confirmed" },
    ],
    attachments_available: ["A1", "A2", "K1", "K2"],
    sprocket_series: "C2080",
    materials_available: ["carbon_steel", "stainless_304"],
    options_upgrades: ["C2080H Heavy Series", "Large Roller", "Walk-on-Rail"],
    image_strategy: "family",
    status: "Active",
  },

  {
    chain_id: "C2100",
    chain_family: "double_pitch_conveyor",
    chain_number: "C2100",
    display_name: "C2100 Double Pitch Roller Chain",
    standard: "ANSI B29.4",
    pitch_in: "2.500",
    pitch_mm: "63.50",
    description: "2-1/2\" double pitch conveyor chain for heavy load conveying.",
    specs: {
      pitch_in: "2.500", pitch_mm: "63.50",
      roller_dia_in: "0.750", roller_width_in: "0.750",
      avg_ultimate_lbs: "24000", max_working_load_lbs: "5500",
    },
    performance_tiers: [
      { tier: "standard", tensile_strength_lbs: "24000", working_load_lbs: "5500", source: "ANSI B29.4" },
    ],
    source_refs: [
      { manufacturer: "Allied-Locke", code: "C2100", confidence: "Confirmed" },
      { manufacturer: "Tsubaki", code: "C2100", confidence: "Confirmed" },
    ],
    attachments_available: ["A1", "A2", "K1", "K2"],
    sprocket_series: "C2100",
    materials_available: ["carbon_steel"],
    options_upgrades: ["C2100H Heavy", "Large Roller"],
    image_strategy: "family",
    status: "Active",
  },

  // ══════════════════════════════════════════════════════════════════
  // WELDED STEEL CHAINS — full WH / WR series
  // ══════════════════════════════════════════════════════════════════

  {
    chain_id: "WH-88",
    chain_family: "welded_steel",
    chain_number: "WH88",
    display_name: "WH88 Welded Steel Mill Chain",
    standard: "ASME B29.100",
    pitch_in: "2.609",
    pitch_mm: "66.27",
    description: "WH88 welded steel mill chain with barrel diameter 1.000\" and heavier construction than WH78.",
    specs: {
      pitch_in: "2.609", pitch_mm: "66.27",
      barrel_dia_in: "1.000", bearing_length_in: "1.750",
      avg_ultimate_lbs: "25000", max_working_load_lbs: "5000",
    },
    performance_tiers: [
      { tier: "standard", tensile_strength_lbs: "25000", working_load_lbs: "5000", source: "Allied-Locke / MAC Chain" },
    ],
    source_refs: [
      { manufacturer: "Allied-Locke", code: "WH88", confidence: "Confirmed" },
      { manufacturer: "MAC Chain", code: "WH88", confidence: "Confirmed" },
    ],
    attachments_available: ["WA-K1", "WA-K2", "WA-A1", "WA-A2"],
    sprocket_series: "WH-88",
    materials_available: ["carbon_steel", "induction_hard"],
    options_upgrades: ["WHX88 Induction Hardened"],
    image_strategy: "exact",
    status: "Active",
  },

  {
    chain_id: "WH-106",
    chain_family: "welded_steel",
    chain_number: "WH106",
    display_name: "WH106 Welded Steel Mill Chain",
    standard: "ASME B29.100",
    pitch_in: "3.075",
    pitch_mm: "78.11",
    description: "WH106 heavy welded steel mill chain for grain elevators and heavy bulk material handling.",
    specs: {
      pitch_in: "3.075", pitch_mm: "78.11",
      barrel_dia_in: "1.250", bearing_length_in: "1.875",
      avg_ultimate_lbs: "32000", max_working_load_lbs: "6400",
    },
    performance_tiers: [
      { tier: "standard", tensile_strength_lbs: "32000", working_load_lbs: "6400", source: "Allied-Locke / MAC Chain" },
    ],
    source_refs: [
      { manufacturer: "Allied-Locke", code: "WH106", confidence: "Confirmed" },
      { manufacturer: "MAC Chain", code: "WH106", confidence: "Confirmed" },
    ],
    attachments_available: ["WA-K1", "WA-K2", "WA-A1"],
    sprocket_series: "WH-106",
    materials_available: ["carbon_steel", "induction_hard"],
    options_upgrades: ["WHX106 Induction Hardened"],
    image_strategy: "exact",
    status: "Active",
  },

  {
    chain_id: "WH-150",
    chain_family: "welded_steel",
    chain_number: "WH150",
    display_name: "WH150 Welded Steel Mill Chain",
    standard: "ASME B29.100",
    pitch_in: "5.000",
    pitch_mm: "127.00",
    description: "WH150 heavy-pitch welded steel mill chain for high-load bulk handling applications.",
    specs: {
      pitch_in: "5.000", pitch_mm: "127.00",
      barrel_dia_in: "1.750", bearing_length_in: "2.500",
      avg_ultimate_lbs: "54000", max_working_load_lbs: "10800",
    },
    performance_tiers: [
      { tier: "standard", tensile_strength_lbs: "54000", working_load_lbs: "10800", source: "Allied-Locke / MAC Chain" },
    ],
    source_refs: [
      { manufacturer: "Allied-Locke", code: "WH150", confidence: "Confirmed" },
      { manufacturer: "MAC Chain", code: "WH150", confidence: "Confirmed" },
    ],
    attachments_available: ["WA-K1", "WA-K2", "WA-A1"],
    sprocket_series: "WH-150",
    materials_available: ["carbon_steel", "induction_hard"],
    options_upgrades: ["WHX150 Induction Hardened"],
    image_strategy: "exact",
    status: "Active",
  },

  // WR Series (with rollers)
  {
    chain_id: "WR-78",
    chain_family: "welded_steel",
    chain_number: "WR78",
    display_name: "WR78 Welded Steel Roller Chain",
    standard: "ASME B29.100",
    pitch_in: "2.609",
    pitch_mm: "66.27",
    description: "WR78 welded steel chain with rollers. Roller reduces friction against guide rails in conveyor applications.",
    specs: {
      pitch_in: "2.609", pitch_mm: "66.27",
      barrel_dia_in: "1.000", bearing_length_in: "1.375",
      avg_ultimate_lbs: "18000", max_working_load_lbs: "3600",
    },
    performance_tiers: [
      { tier: "standard", tensile_strength_lbs: "18000", working_load_lbs: "3600", source: "Allied-Locke / MAC Chain" },
    ],
    source_refs: [
      { manufacturer: "Allied-Locke", code: "WR78", confidence: "Confirmed" },
      { manufacturer: "MAC Chain", code: "WR78", confidence: "Confirmed" },
    ],
    attachments_available: ["WA-K1", "WA-K2", "WA-A1", "WA-A2"],
    sprocket_series: "WR-78",
    materials_available: ["carbon_steel"],
    options_upgrades: [],
    image_strategy: "exact",
    status: "Active",
  },

  {
    chain_id: "WR-88",
    chain_family: "welded_steel",
    chain_number: "WR88",
    display_name: "WR88 Welded Steel Roller Chain",
    standard: "ASME B29.100",
    pitch_in: "2.609",
    pitch_mm: "66.27",
    description: "WR88 welded steel chain with rollers. Heavier construction than WR78.",
    specs: {
      pitch_in: "2.609", pitch_mm: "66.27",
      barrel_dia_in: "1.000", bearing_length_in: "1.750",
      avg_ultimate_lbs: "25000", max_working_load_lbs: "5000",
    },
    performance_tiers: [
      { tier: "standard", tensile_strength_lbs: "25000", working_load_lbs: "5000", source: "Allied-Locke / MAC Chain" },
    ],
    source_refs: [
      { manufacturer: "Allied-Locke", code: "WR88", confidence: "Confirmed" },
      { manufacturer: "MAC Chain", code: "WR88", confidence: "Confirmed" },
    ],
    attachments_available: ["WA-K1", "WA-K2", "WA-A1"],
    sprocket_series: "WR-88",
    materials_available: ["carbon_steel"],
    options_upgrades: [],
    image_strategy: "exact",
    status: "Active",
  },

  {
    chain_id: "WR-106",
    chain_family: "welded_steel",
    chain_number: "WR106",
    display_name: "WR106 Welded Steel Roller Chain",
    standard: "ASME B29.100",
    pitch_in: "3.075",
    pitch_mm: "78.11",
    description: "WR106 welded steel roller chain for bulk handling and log processing.",
    specs: {
      pitch_in: "3.075", pitch_mm: "78.11",
      barrel_dia_in: "1.250", bearing_length_in: "1.875",
      avg_ultimate_lbs: "32000", max_working_load_lbs: "6400",
    },
    performance_tiers: [
      { tier: "standard", tensile_strength_lbs: "32000", working_load_lbs: "6400", source: "Allied-Locke / MAC Chain" },
    ],
    source_refs: [
      { manufacturer: "Allied-Locke", code: "WR106", confidence: "Confirmed" },
      { manufacturer: "MAC Chain", code: "WR106", confidence: "Confirmed" },
    ],
    attachments_available: ["WA-K1", "WA-K2"],
    sprocket_series: "WR-106",
    materials_available: ["carbon_steel"],
    options_upgrades: [],
    image_strategy: "exact",
    status: "Active",
  },

  {
    chain_id: "WR-124",
    chain_family: "welded_steel",
    chain_number: "WR124",
    display_name: "WR124 Welded Steel Roller Chain",
    standard: "ASME B29.100",
    pitch_in: "4.063",
    pitch_mm: "103.19",
    description: "WR124 heavy welded steel roller chain for high-load conveying applications.",
    specs: {
      pitch_in: "4.063", pitch_mm: "103.19",
      barrel_dia_in: "1.375", bearing_length_in: "2.000",
      avg_ultimate_lbs: "38000", max_working_load_lbs: "7600",
    },
    performance_tiers: [
      { tier: "standard", tensile_strength_lbs: "38000", working_load_lbs: "7600", source: "Allied-Locke / MAC Chain" },
    ],
    source_refs: [
      { manufacturer: "Allied-Locke", code: "WR124", confidence: "Confirmed" },
      { manufacturer: "MAC Chain", code: "WR124", confidence: "Confirmed" },
    ],
    attachments_available: ["WA-K1", "WA-K2"],
    sprocket_series: "WR-124",
    materials_available: ["carbon_steel"],
    options_upgrades: [],
    image_strategy: "exact",
    status: "Active",
  },

  {
    chain_id: "WR-150",
    chain_family: "welded_steel",
    chain_number: "WR150",
    display_name: "WR150 Welded Steel Roller Chain",
    standard: "ASME B29.100",
    pitch_in: "5.000",
    pitch_mm: "127.00",
    description: "WR150 large-pitch welded steel roller chain for heavy bulk handling.",
    specs: {
      pitch_in: "5.000", pitch_mm: "127.00",
      barrel_dia_in: "1.750", bearing_length_in: "2.500",
      avg_ultimate_lbs: "54000", max_working_load_lbs: "10800",
    },
    performance_tiers: [
      { tier: "standard", tensile_strength_lbs: "54000", working_load_lbs: "10800", source: "Allied-Locke / MAC Chain" },
    ],
    source_refs: [
      { manufacturer: "Allied-Locke", code: "WR150", confidence: "Confirmed" },
      { manufacturer: "MAC Chain", code: "WR150", confidence: "Confirmed" },
    ],
    attachments_available: ["WA-K1", "WA-K2"],
    sprocket_series: "WR-150",
    materials_available: ["carbon_steel"],
    options_upgrades: [],
    image_strategy: "exact",
    status: "Active",
  },

  // ══════════════════════════════════════════════════════════════════
  // STEEL PINTLE CHAINS — completing the series
  // ══════════════════════════════════════════════════════════════════

  {
    chain_id: "667XH",
    chain_family: "steel_pintle",
    chain_number: "667XH",
    display_name: "667XH Steel Pintle Chain — Heavy Extended Life",
    standard: "ASME B29.6",
    pitch_in: "2.609",
    pitch_mm: "66.27",
    description: "667XH heavy-duty extended-life pintle chain. Quad-staked pins, induction-hardened barrels, heaviest sidebar plates in the 667 series.",
    specs: {
      pitch_in: "2.609", pitch_mm: "66.27",
      avg_ultimate_lbs: "22000", max_working_load_lbs: "4400",
    },
    performance_tiers: [
      { tier: "premium", tensile_strength_lbs: "22000", working_load_lbs: "4400", source: "Allied-Locke 667XH", notes: "Quad-staked, hardened barrels, heavy sidebars" },
    ],
    source_refs: [
      { manufacturer: "Allied-Locke", code: "667XH", confidence: "Confirmed" },
      { manufacturer: "MAC Chain", code: "667XH", confidence: "Confirmed" },
    ],
    attachments_available: ["PC-A1", "PC-K1"],
    sprocket_series: "667",
    materials_available: ["carbon_steel", "induction_hard"],
    options_upgrades: [],
    image_strategy: "exact",
    status: "Active",
  },

  {
    chain_id: "PC-549",
    chain_family: "steel_pintle",
    chain_number: "549",
    display_name: "549 Steel Pintle Chain",
    standard: "ASME B29.6",
    pitch_in: "1.634",
    pitch_mm: "41.50",
    description: "Smaller pitch 549 steel pintle chain for lighter agricultural and industrial conveying.",
    specs: {
      pitch_in: "1.634", pitch_mm: "41.50",
      avg_ultimate_lbs: "8000", max_working_load_lbs: "1600",
    },
    performance_tiers: [
      { tier: "standard", tensile_strength_lbs: "8000", working_load_lbs: "1600", source: "Allied-Locke" },
    ],
    source_refs: [
      { manufacturer: "Allied-Locke", code: "549", confidence: "Confirmed" },
      { manufacturer: "MAC Chain", code: "549", confidence: "Confirmed" },
    ],
    attachments_available: ["PC-A1", "PC-K1"],
    sprocket_series: "549",
    materials_available: ["carbon_steel"],
    options_upgrades: [],
    image_strategy: "exact",
    status: "Active",
  },

  {
    chain_id: "PC-557",
    chain_family: "steel_pintle",
    chain_number: "557",
    display_name: "557 Steel Pintle Chain",
    standard: "ASME B29.6",
    pitch_in: "1.634",
    pitch_mm: "41.50",
    description: "557 steel pintle chain with heavier construction than 549 for demanding agricultural conveying.",
    specs: {
      pitch_in: "1.634", pitch_mm: "41.50",
      avg_ultimate_lbs: "10000", max_working_load_lbs: "2000",
    },
    performance_tiers: [
      { tier: "standard", tensile_strength_lbs: "10000", working_load_lbs: "2000", source: "Allied-Locke" },
    ],
    source_refs: [
      { manufacturer: "Allied-Locke", code: "557", confidence: "Confirmed" },
      { manufacturer: "MAC Chain", code: "557", confidence: "Confirmed" },
    ],
    attachments_available: ["PC-A1", "PC-K1", "PC-SA1"],
    sprocket_series: "557",
    materials_available: ["carbon_steel"],
    options_upgrades: [],
    image_strategy: "exact",
    status: "Active",
  },

  {
    chain_id: "PC-700",
    chain_family: "steel_pintle",
    chain_number: "700",
    display_name: "700 Class Steel Pintle Chain",
    standard: "ASME B29.6",
    pitch_in: "2.500",
    pitch_mm: "63.50",
    description: "700 class steel pintle chain for heavy fertilizer spreaders, manure conveyors, and industrial drag applications.",
    specs: {
      pitch_in: "2.500", pitch_mm: "63.50",
      avg_ultimate_lbs: "20000", max_working_load_lbs: "4000",
    },
    performance_tiers: [
      { tier: "standard", tensile_strength_lbs: "20000", working_load_lbs: "4000", source: "Allied-Locke" },
    ],
    source_refs: [
      { manufacturer: "Allied-Locke", code: "700", confidence: "Confirmed" },
      { manufacturer: "MAC Chain", code: "700", confidence: "Confirmed" },
    ],
    attachments_available: ["PC-A1", "PC-K1", "PC-SA1", "PC-FLAP"],
    sprocket_series: "700",
    materials_available: ["carbon_steel"],
    options_upgrades: [],
    image_strategy: "exact",
    status: "Active",
  },

  // ══════════════════════════════════════════════════════════════════
  // ENGINEERING CLASS CHAINS — completing SS, MSR, MXS series
  // ══════════════════════════════════════════════════════════════════

  {
    chain_id: "SS-88",
    chain_family: "engineered_class",
    chain_number: "SS88",
    display_name: "SS88 Bushed Steel Conveyor Chain",
    standard: "ASME B29.100",
    pitch_in: "2.609",
    pitch_mm: "66.27",
    description: "SS88 heavy solid-barrel bushed steel conveyor chain. No rollers. Heavy-duty version of the SS series.",
    specs: {
      pitch_in: "2.609", pitch_mm: "66.27",
      barrel_dia_in: "1.250",
      avg_ultimate_lbs: "25000", max_working_load_lbs: "5000",
    },
    performance_tiers: [
      { tier: "standard", tensile_strength_lbs: "25000", working_load_lbs: "5000", source: "Allied-Locke" },
    ],
    source_refs: [
      { manufacturer: "Allied-Locke", code: "SS88", confidence: "Confirmed" },
      { manufacturer: "MAC Chain", code: "SS88", confidence: "Confirmed" },
    ],
    attachments_available: ["ENG-A1", "ENG-K1", "ENG-SA1", "ENG-FLIGHT"],
    sprocket_series: "SS-88",
    materials_available: ["carbon_steel"],
    options_upgrades: ["Heat treated version"],
    image_strategy: "exact",
    status: "Active",
  },

  {
    chain_id: "SS-118",
    chain_family: "engineered_class",
    chain_number: "SS118",
    display_name: "SS118 Bushed Steel Conveyor Chain",
    standard: "ASME B29.100",
    pitch_in: "3.075",
    pitch_mm: "78.11",
    description: "SS118 large-pitch bushed steel conveyor chain for heavy drag and elevating applications.",
    specs: {
      pitch_in: "3.075", pitch_mm: "78.11",
      barrel_dia_in: "1.500",
      avg_ultimate_lbs: "35000", max_working_load_lbs: "7000",
    },
    performance_tiers: [
      { tier: "standard", tensile_strength_lbs: "35000", working_load_lbs: "7000", source: "Allied-Locke" },
    ],
    source_refs: [
      { manufacturer: "Allied-Locke", code: "SS118", confidence: "Confirmed" },
      { manufacturer: "MAC Chain", code: "SS118", confidence: "Confirmed" },
    ],
    attachments_available: ["ENG-A1", "ENG-K1", "ENG-FLIGHT"],
    sprocket_series: "SS-118",
    materials_available: ["carbon_steel"],
    options_upgrades: [],
    image_strategy: "exact",
    status: "Active",
  },

  {
    chain_id: "SS-188",
    chain_family: "engineered_class",
    chain_number: "SS188",
    display_name: "SS188 Bushed Steel Conveyor Chain",
    standard: "ASME B29.100",
    pitch_in: "6.000",
    pitch_mm: "152.40",
    description: "SS188 heavy-pitch bushed steel chain for maximum load elevating and drag applications.",
    specs: {
      pitch_in: "6.000", pitch_mm: "152.40",
      barrel_dia_in: "2.000",
      avg_ultimate_lbs: "70000", max_working_load_lbs: "14000",
    },
    performance_tiers: [
      { tier: "standard", tensile_strength_lbs: "70000", working_load_lbs: "14000", source: "Allied-Locke" },
    ],
    source_refs: [
      { manufacturer: "Allied-Locke", code: "SS188", confidence: "Confirmed" },
      { manufacturer: "MAC Chain", code: "SS188", confidence: "Confirmed" },
    ],
    attachments_available: ["ENG-FLIGHT", "ENG-SA1"],
    sprocket_series: "SS-188",
    materials_available: ["carbon_steel"],
    options_upgrades: [],
    image_strategy: "exact",
    status: "Active",
  },

  {
    chain_id: "MSR-8028",
    chain_family: "engineered_class",
    chain_number: "MSR8028",
    display_name: "MSR8028 Bushed Roller Steel Chain",
    standard: "ASME B29.100",
    pitch_in: "8.000",
    pitch_mm: "203.20",
    description: "MSR8028 heavy bushed roller conveyor chain, 28\" face width. For extreme-load drag and conveying.",
    specs: {
      pitch_in: "8.000", pitch_mm: "203.20",
      barrel_dia_in: "2.500",
      avg_ultimate_lbs: "140000", max_working_load_lbs: "28000",
    },
    performance_tiers: [
      { tier: "standard", tensile_strength_lbs: "140000", working_load_lbs: "28000", source: "Allied-Locke" },
    ],
    source_refs: [
      { manufacturer: "Allied-Locke", code: "MSR8028", confidence: "Confirmed" },
      { manufacturer: "MAC Chain", code: "MSR8028", confidence: "Confirmed" },
    ],
    attachments_available: ["ENG-FLIGHT", "ENG-SA1"],
    sprocket_series: "MSR-80",
    materials_available: ["carbon_steel"],
    options_upgrades: [],
    image_strategy: "exact",
    status: "Active",
  },

  {
    chain_id: "MSR-10028",
    chain_family: "engineered_class",
    chain_number: "MSR10028",
    display_name: "MSR10028 Bushed Roller Steel Chain",
    standard: "ASME B29.100",
    pitch_in: "10.000",
    pitch_mm: "254.00",
    description: "MSR10028 extra-heavy bushed roller chain for the most demanding industrial applications.",
    specs: {
      pitch_in: "10.000", pitch_mm: "254.00",
      barrel_dia_in: "3.000",
      avg_ultimate_lbs: "200000", max_working_load_lbs: "40000",
    },
    performance_tiers: [
      { tier: "standard", tensile_strength_lbs: "200000", working_load_lbs: "40000", source: "Allied-Locke" },
    ],
    source_refs: [
      { manufacturer: "Allied-Locke", code: "MSR10028", confidence: "Confirmed" },
      { manufacturer: "MAC Chain", code: "MSR10028", confidence: "Confirmed" },
    ],
    attachments_available: ["ENG-FLIGHT"],
    sprocket_series: "MSR-100",
    materials_available: ["carbon_steel"],
    options_upgrades: [],
    image_strategy: "exact",
    status: "Active",
  },

  {
    chain_id: "MXS-881",
    chain_family: "engineered_class",
    chain_number: "MXS881",
    display_name: "MXS881 Offset Steel Drive Chain",
    standard: "ASME B29.100",
    pitch_in: "2.609",
    pitch_mm: "66.27",
    description: "MXS Class offset sidebar steel drive chain. Used in heavy drag conveyors, reciprocating and horizontal conveyors.",
    specs: {
      pitch_in: "2.609", pitch_mm: "66.27",
      avg_ultimate_lbs: "40000", max_working_load_lbs: "8000",
    },
    performance_tiers: [
      { tier: "standard", tensile_strength_lbs: "40000", working_load_lbs: "8000", source: "Allied-Locke" },
    ],
    source_refs: [
      { manufacturer: "Allied-Locke", code: "MXS881", confidence: "Confirmed" },
      { manufacturer: "MAC Chain", code: "MXS881", confidence: "Confirmed" },
    ],
    attachments_available: ["ENG-FLIGHT", "ENG-K1"],
    sprocket_series: "MXS-88",
    materials_available: ["carbon_steel"],
    options_upgrades: [],
    image_strategy: "exact",
    status: "Active",
  },

  // ══════════════════════════════════════════════════════════════════
  // DROP FORGED RIVETLESS — completing X678, 477, 698
  // ══════════════════════════════════════════════════════════════════

  {
    chain_id: "X678",
    chain_family: "drop_forged_rivetless",
    chain_number: "X678",
    display_name: "X678 Drop Forged Rivetless Chain",
    standard: "ASME B29.100",
    pitch_in: "6.000",
    pitch_mm: "152.40",
    description: "Large-pitch drop forged rivetless chain for heavy overhead and power-and-free conveyor systems.",
    specs: {
      pitch_in: "6.000", pitch_mm: "152.40",
      avg_ultimate_lbs: "65000", max_working_load_lbs: "13000",
    },
    performance_tiers: [
      { tier: "standard", tensile_strength_lbs: "65000", working_load_lbs: "13000", source: "Allied-Locke" },
    ],
    source_refs: [
      { manufacturer: "Allied-Locke", code: "X678", confidence: "Confirmed" },
      { manufacturer: "MAC Chain", code: "X678", confidence: "Confirmed" },
      { manufacturer: "Rexnord", code: "X678", confidence: "Needs Review" },
    ],
    attachments_available: ["DFR-DOG", "DFR-PUSHER", "DFR-TROLLEY"],
    sprocket_series: "X678",
    materials_available: ["carbon_steel", "high_temp"],
    options_upgrades: [],
    image_strategy: "exact",
    status: "Active",
  },

  {
    chain_id: "DFR-477",
    chain_family: "drop_forged_rivetless",
    chain_number: "477",
    display_name: "477 Drop Forged Rivetless Chain",
    standard: "ASME B29.100",
    pitch_in: "4.000",
    pitch_mm: "101.60",
    description: "477 drop forged rivetless chain — alternative to X458 for certain overhead conveyor systems.",
    specs: {
      pitch_in: "4.000", pitch_mm: "101.60",
      avg_ultimate_lbs: "30000", max_working_load_lbs: "6000",
    },
    performance_tiers: [
      { tier: "standard", tensile_strength_lbs: "30000", working_load_lbs: "6000", source: "Allied-Locke" },
    ],
    source_refs: [
      { manufacturer: "Allied-Locke", code: "477", confidence: "Confirmed" },
      { manufacturer: "MAC Chain", code: "477", confidence: "Confirmed" },
    ],
    attachments_available: ["DFR-DOG", "DFR-PUSHER"],
    sprocket_series: "477",
    materials_available: ["carbon_steel"],
    options_upgrades: [],
    image_strategy: "exact",
    status: "Active",
  },

  {
    chain_id: "DFR-698",
    chain_family: "drop_forged_rivetless",
    chain_number: "698",
    display_name: "698 Drop Forged Rivetless Chain",
    standard: "ASME B29.100",
    pitch_in: "6.000",
    pitch_mm: "152.40",
    description: "698 drop forged rivetless chain for heavy-duty overhead conveyor systems.",
    specs: {
      pitch_in: "6.000", pitch_mm: "152.40",
      avg_ultimate_lbs: "60000", max_working_load_lbs: "12000",
    },
    performance_tiers: [
      { tier: "standard", tensile_strength_lbs: "60000", working_load_lbs: "12000", source: "Allied-Locke" },
    ],
    source_refs: [
      { manufacturer: "Allied-Locke", code: "698", confidence: "Confirmed" },
      { manufacturer: "MAC Chain", code: "698", confidence: "Confirmed" },
    ],
    attachments_available: ["DFR-DOG", "DFR-TROLLEY"],
    sprocket_series: "698",
    materials_available: ["carbon_steel"],
    options_upgrades: [],
    image_strategy: "exact",
    status: "Active",
  },

  // ══════════════════════════════════════════════════════════════════
  // AGRICULTURAL CONVEYOR CHAINS — full CA/S series
  // ══════════════════════════════════════════════════════════════════

  {
    chain_id: "CA557",
    chain_family: "agricultural_conveyor",
    chain_number: "CA557",
    display_name: "CA557 Agricultural Roller Chain",
    standard: "ASME B29.200",
    pitch_in: "1.654",
    pitch_mm: "42.01",
    description: "CA557 agricultural roller chain. Heavier than CA550. Common in combines and forage harvesters.",
    specs: {
      pitch_in: "1.654", pitch_mm: "42.01",
      avg_ultimate_lbs: "19000", max_working_load_lbs: "3800",
    },
    performance_tiers: [
      { tier: "standard", tensile_strength_lbs: "19000", working_load_lbs: "3800", source: "ASME B29.200" },
    ],
    source_refs: [
      { manufacturer: "Allied-Locke", code: "CA557", confidence: "Confirmed" },
      { manufacturer: "Donghua", code: "CA557", confidence: "Confirmed" },
    ],
    attachments_available: ["AGRI-A1", "AGRI-K1"],
    sprocket_series: "CA550",
    materials_available: ["carbon_steel"],
    options_upgrades: ["O-Ring version"],
    image_strategy: "family",
    status: "Active",
  },

  {
    chain_id: "CA620",
    chain_family: "agricultural_conveyor",
    chain_number: "CA620",
    display_name: "CA620 Agricultural Roller Chain",
    standard: "ASME B29.200",
    pitch_in: "1.972",
    pitch_mm: "50.09",
    description: "CA620 heavy agricultural roller chain for demanding combine and forage harvester applications.",
    specs: {
      pitch_in: "1.972", pitch_mm: "50.09",
      avg_ultimate_lbs: "22000", max_working_load_lbs: "4400",
    },
    performance_tiers: [
      { tier: "standard", tensile_strength_lbs: "22000", working_load_lbs: "4400", source: "ASME B29.200" },
    ],
    source_refs: [
      { manufacturer: "Allied-Locke", code: "CA620", confidence: "Confirmed" },
      { manufacturer: "Donghua", code: "CA620", confidence: "Confirmed" },
    ],
    attachments_available: ["AGRI-A1", "AGRI-K1"],
    sprocket_series: "CA620",
    materials_available: ["carbon_steel"],
    options_upgrades: ["O-Ring version"],
    image_strategy: "family",
    status: "Active",
  },

  {
    chain_id: "S55",
    chain_family: "agricultural_conveyor",
    chain_number: "S55",
    display_name: "S55 Steel Detachable Chain",
    standard: "ASME B29.200",
    pitch_in: "1.630",
    pitch_mm: "41.40",
    description: "S55 steel detachable chain for spreaders, manure conveyors, and agricultural feeders.",
    specs: {
      pitch_in: "1.630", pitch_mm: "41.40",
      avg_ultimate_lbs: "5500", max_working_load_lbs: "1100",
    },
    performance_tiers: [
      { tier: "standard", tensile_strength_lbs: "5500", working_load_lbs: "1100", source: "ASME B29.200" },
    ],
    source_refs: [
      { manufacturer: "Allied-Locke", code: "S55", confidence: "Confirmed" },
      { manufacturer: "Donghua", code: "S55", confidence: "Confirmed" },
    ],
    attachments_available: ["AGRI-FLIGHT"],
    sprocket_series: "S55",
    materials_available: ["carbon_steel"],
    options_upgrades: [],
    image_strategy: "family",
    status: "Active",
  },

  {
    chain_id: "S62",
    chain_family: "agricultural_conveyor",
    chain_number: "S62",
    display_name: "S62 Steel Detachable Chain",
    standard: "ASME B29.200",
    pitch_in: "1.630",
    pitch_mm: "41.40",
    description: "S62 heavy steel detachable chain. Higher strength than S55 for demanding agricultural applications.",
    specs: {
      pitch_in: "1.630", pitch_mm: "41.40",
      avg_ultimate_lbs: "6200", max_working_load_lbs: "1240",
    },
    performance_tiers: [
      { tier: "standard", tensile_strength_lbs: "6200", working_load_lbs: "1240", source: "ASME B29.200" },
    ],
    source_refs: [
      { manufacturer: "Allied-Locke", code: "S62", confidence: "Confirmed" },
    ],
    attachments_available: ["AGRI-FLIGHT"],
    sprocket_series: "S62",
    materials_available: ["carbon_steel"],
    options_upgrades: [],
    image_strategy: "family",
    status: "Active",
  },

  {
    chain_id: "S77",
    chain_family: "agricultural_conveyor",
    chain_number: "S77",
    display_name: "S77 Steel Detachable Chain",
    standard: "ASME B29.200",
    pitch_in: "2.031",
    pitch_mm: "51.59",
    description: "S77 steel detachable chain for heavier agricultural conveying and spreading applications.",
    specs: {
      pitch_in: "2.031", pitch_mm: "51.59",
      avg_ultimate_lbs: "7700", max_working_load_lbs: "1540",
    },
    performance_tiers: [
      { tier: "standard", tensile_strength_lbs: "7700", working_load_lbs: "1540", source: "ASME B29.200" },
    ],
    source_refs: [
      { manufacturer: "Allied-Locke", code: "S77", confidence: "Confirmed" },
    ],
    attachments_available: ["AGRI-FLIGHT"],
    sprocket_series: "S77",
    materials_available: ["carbon_steel"],
    options_upgrades: [],
    image_strategy: "family",
    status: "Active",
  },

  // ══════════════════════════════════════════════════════════════════
  // BUCKET ELEVATOR CHAINS
  // ══════════════════════════════════════════════════════════════════

  {
    chain_id: "BEC-AA2050",
    chain_family: "bucket_elevator",
    chain_number: "AA2050",
    display_name: "AA2050 Bucket Elevator Chain",
    standard: "ASME B29.100",
    pitch_in: "1.250",
    pitch_mm: "31.75",
    description: "AA2050 center chain for bucket elevators. Central chain design allows buckets to be mounted on pins.",
    specs: {
      pitch_in: "1.250", pitch_mm: "31.75",
      avg_ultimate_lbs: "18000", max_working_load_lbs: "3600",
    },
    performance_tiers: [
      { tier: "standard", tensile_strength_lbs: "18000", working_load_lbs: "3600", source: "ASME B29.100" },
    ],
    source_refs: [
      { manufacturer: "Allied-Locke", code: "AA2050", confidence: "Confirmed" },
      { manufacturer: "MAC Chain", code: "AA2050", confidence: "Confirmed" },
    ],
    attachments_available: ["ELEV-BUCKET-A", "ELEV-BUCKET-B"],
    sprocket_series: "BEC-AA",
    materials_available: ["carbon_steel", "stainless_304"],
    options_upgrades: ["Extended pin option for bucket mounting"],
    image_strategy: "family",
    status: "Active",
  },

  {
    chain_id: "BEC-AA2060",
    chain_family: "bucket_elevator",
    chain_number: "AA2060",
    display_name: "AA2060 Bucket Elevator Chain",
    standard: "ASME B29.100",
    pitch_in: "1.500",
    pitch_mm: "38.10",
    description: "AA2060 bucket elevator chain. Heavier construction for larger bucket elevator systems.",
    specs: {
      pitch_in: "1.500", pitch_mm: "38.10",
      avg_ultimate_lbs: "24000", max_working_load_lbs: "4800",
    },
    performance_tiers: [
      { tier: "standard", tensile_strength_lbs: "24000", working_load_lbs: "4800", source: "ASME B29.100" },
    ],
    source_refs: [
      { manufacturer: "Allied-Locke", code: "AA2060", confidence: "Confirmed" },
      { manufacturer: "MAC Chain", code: "AA2060", confidence: "Confirmed" },
    ],
    attachments_available: ["ELEV-BUCKET-A", "ELEV-BUCKET-B"],
    sprocket_series: "BEC-AA",
    materials_available: ["carbon_steel"],
    options_upgrades: [],
    image_strategy: "family",
    status: "Active",
  },

  {
    chain_id: "BEC-CAST-G6",
    chain_family: "bucket_elevator",
    chain_number: "G6",
    display_name: "G6 Cast Rivetless Bucket Elevator Chain",
    standard: "ASME B29.100",
    pitch_in: "6.000",
    pitch_mm: "152.40",
    description: "G6 cast manganese rivetless chain for heavy bucket elevators in cement, aggregate, and mining applications.",
    specs: {
      pitch_in: "6.000", pitch_mm: "152.40",
      avg_ultimate_lbs: "90000", max_working_load_lbs: "18000",
    },
    performance_tiers: [
      { tier: "standard", tensile_strength_lbs: "90000", working_load_lbs: "18000", source: "Allied-Locke" },
    ],
    source_refs: [
      { manufacturer: "Allied-Locke", code: "G6", confidence: "Confirmed" },
      { manufacturer: "MAC Chain", code: "G6", confidence: "Confirmed" },
    ],
    attachments_available: ["ELEV-BUCKET-CAST"],
    sprocket_series: "BEC-CAST",
    materials_available: ["cast_manganese", "cast_alloy"],
    options_upgrades: ["Alloy steel version"],
    image_strategy: "family",
    status: "Active",
  },

  // ══════════════════════════════════════════════════════════════════
  // DRAG / SCRAPER CHAINS — WD Series
  // ══════════════════════════════════════════════════════════════════

  {
    chain_id: "WD-78",
    chain_family: "drag_scraper",
    chain_number: "WD78",
    display_name: "WD78 Welded Steel Drag Chain",
    standard: "ASME B29.100",
    pitch_in: "2.609",
    pitch_mm: "66.27",
    description: "WD78 welded steel drag chain for en-masse and scraper conveying applications.",
    specs: {
      pitch_in: "2.609", pitch_mm: "66.27",
      avg_ultimate_lbs: "18000", max_working_load_lbs: "3600",
    },
    performance_tiers: [
      { tier: "standard", tensile_strength_lbs: "18000", working_load_lbs: "3600", source: "Allied-Locke / MAC Chain" },
    ],
    source_refs: [
      { manufacturer: "Allied-Locke", code: "WD78", confidence: "Confirmed" },
      { manufacturer: "MAC Chain", code: "WD78", confidence: "Confirmed" },
    ],
    attachments_available: ["WA-FLIGHT", "WA-SCRAPER"],
    sprocket_series: "WD-78",
    materials_available: ["carbon_steel"],
    options_upgrades: [],
    image_strategy: "exact",
    status: "Active",
  },

  {
    chain_id: "WD-124",
    chain_family: "drag_scraper",
    chain_number: "WD124",
    display_name: "WD124 Welded Steel Drag Chain",
    standard: "ASME B29.100",
    pitch_in: "4.063",
    pitch_mm: "103.19",
    description: "WD124 heavy welded steel drag chain for high-load en-masse conveying.",
    specs: {
      pitch_in: "4.063", pitch_mm: "103.19",
      avg_ultimate_lbs: "38000", max_working_load_lbs: "7600",
    },
    performance_tiers: [
      { tier: "standard", tensile_strength_lbs: "38000", working_load_lbs: "7600", source: "Allied-Locke / MAC Chain" },
    ],
    source_refs: [
      { manufacturer: "Allied-Locke", code: "WD124", confidence: "Confirmed" },
      { manufacturer: "MAC Chain", code: "WD124", confidence: "Confirmed" },
    ],
    attachments_available: ["WA-FLIGHT", "WA-SCRAPER"],
    sprocket_series: "WD-124",
    materials_available: ["carbon_steel"],
    options_upgrades: [],
    image_strategy: "exact",
    status: "Active",
  },

  // ══════════════════════════════════════════════════════════════════
  // LEAF CHAINS — full AL/BL series
  // ══════════════════════════════════════════════════════════════════

  {
    chain_id: "AL0844",
    chain_family: "leaf_chain",
    chain_number: "AL0844",
    display_name: "AL0844 Leaf Chain",
    standard: "ANSI/ASME B29.8",
    pitch_in: "0.500",
    pitch_mm: "12.70",
    description: "AL series 1/2\" pitch leaf chain, 8-wide × 44 lacing. Forklift mast applications.",
    specs: {
      pitch_in: "0.500", pitch_mm: "12.70",
      lacing: "4×4",
      avg_ultimate_lbs: "18200", max_working_load_lbs: "3640",
    },
    performance_tiers: [
      { tier: "standard", tensile_strength_lbs: "18200", working_load_lbs: "3640", source: "ANSI/ASME B29.8" },
    ],
    source_refs: [
      { manufacturer: "Allied-Locke", code: "AL0844", confidence: "Confirmed" },
      { manufacturer: "Iwis", code: "LH0844", confidence: "Confirmed" },
    ],
    attachments_available: [],
    sprocket_series: null,
    materials_available: ["carbon_steel"],
    options_upgrades: ["Shot peened"],
    image_strategy: "family",
    status: "Active",
  },

  {
    chain_id: "AL1044",
    chain_family: "leaf_chain",
    chain_number: "AL1044",
    display_name: "AL1044 Leaf Chain",
    standard: "ANSI/ASME B29.8",
    pitch_in: "1.000",
    pitch_mm: "25.40",
    description: "AL series 1\" pitch leaf chain, 10 plates wide × 44 lacing. Heavy forklift mast applications.",
    specs: {
      pitch_in: "1.000", pitch_mm: "25.40",
      lacing: "2×2",
      avg_ultimate_lbs: "53900", max_working_load_lbs: "10780",
    },
    performance_tiers: [
      { tier: "standard", tensile_strength_lbs: "53900", working_load_lbs: "10780", source: "ANSI/ASME B29.8" },
    ],
    source_refs: [
      { manufacturer: "Allied-Locke", code: "AL1044", confidence: "Confirmed" },
      { manufacturer: "Iwis", code: "LH1044", confidence: "Confirmed" },
    ],
    attachments_available: [],
    sprocket_series: null,
    materials_available: ["carbon_steel", "stainless_304"],
    options_upgrades: ["Shot peened"],
    image_strategy: "family",
    status: "Active",
  },

  {
    chain_id: "BL1022",
    chain_family: "leaf_chain",
    chain_number: "BL1022",
    display_name: "BL1022 Leaf Chain",
    standard: "ANSI/ASME B29.8",
    pitch_in: "1.000",
    pitch_mm: "25.40",
    description: "BL series 1\" pitch leaf chain. BL series uses thicker plates than AL series for higher loads.",
    specs: {
      pitch_in: "1.000", pitch_mm: "25.40",
      lacing: "2×2",
      avg_ultimate_lbs: "31000", max_working_load_lbs: "6200",
    },
    performance_tiers: [
      { tier: "standard", tensile_strength_lbs: "31000", working_load_lbs: "6200", source: "ANSI/ASME B29.8" },
    ],
    source_refs: [
      { manufacturer: "Allied-Locke", code: "BL1022", confidence: "Confirmed" },
      { manufacturer: "Iwis", code: "BL1022", confidence: "Confirmed" },
    ],
    attachments_available: [],
    sprocket_series: null,
    materials_available: ["carbon_steel", "stainless_304"],
    options_upgrades: [],
    image_strategy: "family",
    status: "Active",
  },

  {
    chain_id: "BL1044",
    chain_family: "leaf_chain",
    chain_number: "BL1044",
    display_name: "BL1044 Leaf Chain",
    standard: "ANSI/ASME B29.8",
    pitch_in: "1.000",
    pitch_mm: "25.40",
    description: "BL series heavy leaf chain for maximum load forklift mast and hoist applications.",
    specs: {
      pitch_in: "1.000", pitch_mm: "25.40",
      lacing: "4×4",
      avg_ultimate_lbs: "62000", max_working_load_lbs: "12400",
    },
    performance_tiers: [
      { tier: "standard", tensile_strength_lbs: "62000", working_load_lbs: "12400", source: "ANSI/ASME B29.8" },
    ],
    source_refs: [
      { manufacturer: "Allied-Locke", code: "BL1044", confidence: "Confirmed" },
      { manufacturer: "Iwis", code: "BL1044", confidence: "Confirmed" },
    ],
    attachments_available: [],
    sprocket_series: null,
    materials_available: ["carbon_steel"],
    options_upgrades: [],
    image_strategy: "family",
    status: "Active",
  },

  // ══════════════════════════════════════════════════════════════════
  // OVERHEAD CONVEYOR CHAINS
  // ══════════════════════════════════════════════════════════════════

  {
    chain_id: "OHC-X348-TROLLEY",
    chain_family: "overhead_conveyor",
    chain_number: "X348-Trolley",
    display_name: "X348 Overhead Trolley Chain",
    standard: "ASME B29.100",
    pitch_in: "3.075",
    pitch_mm: "78.11",
    description: "X348 rivetless chain configured for overhead trolley conveyor systems. Includes trolley pusher and dog attachments.",
    specs: {
      pitch_in: "3.075", pitch_mm: "78.11",
      avg_ultimate_lbs: "19500", max_working_load_lbs: "3900",
    },
    performance_tiers: [
      { tier: "standard", tensile_strength_lbs: "19500", working_load_lbs: "3900", source: "Allied-Locke" },
    ],
    source_refs: [
      { manufacturer: "Allied-Locke", code: "X348-Trolley", confidence: "Confirmed" },
    ],
    attachments_available: ["DFR-TROLLEY", "DFR-PUSHER", "DFR-DOG"],
    sprocket_series: "X348",
    materials_available: ["carbon_steel"],
    options_upgrades: ["Power-and-Free configuration", "Corrosion coating"],
    image_strategy: "family",
    status: "Active",
  },

  {
    chain_id: "OHC-X458-TROLLEY",
    chain_family: "overhead_conveyor",
    chain_number: "X458-Trolley",
    display_name: "X458 Overhead Trolley Chain",
    standard: "ASME B29.100",
    pitch_in: "4.000",
    pitch_mm: "101.60",
    description: "X458 rivetless chain for heavier overhead trolley conveyor systems.",
    specs: {
      pitch_in: "4.000", pitch_mm: "101.60",
      avg_ultimate_lbs: "28000", max_working_load_lbs: "5600",
    },
    performance_tiers: [
      { tier: "standard", tensile_strength_lbs: "28000", working_load_lbs: "5600", source: "Allied-Locke" },
    ],
    source_refs: [
      { manufacturer: "Allied-Locke", code: "X458-Trolley", confidence: "Confirmed" },
    ],
    attachments_available: ["DFR-TROLLEY", "DFR-PUSHER"],
    sprocket_series: "X458",
    materials_available: ["carbon_steel"],
    options_upgrades: [],
    image_strategy: "family",
    status: "Active",
  },

  // ══════════════════════════════════════════════════════════════════
  // SPECIALTY / CUSTOM CHAINS
  // ══════════════════════════════════════════════════════════════════

  {
    chain_id: "DLI-SCANNER",
    chain_family: "specialty_custom",
    chain_number: "DLI",
    display_name: "DLI Scanner Chain",
    standard: "Custom / OEM",
    pitch_in: "1.500",
    pitch_mm: "38.10",
    description: "DLI (Double Latch Index) scanner chain for precision indexing in document scanning, mail processing, and similar applications.",
    specs: {
      pitch_in: "1.500", pitch_mm: "38.10",
      avg_ultimate_lbs: "8500", max_working_load_lbs: "850",
      type: "Precision indexing",
      construction: "Double latch, precision ground",
    },
    performance_tiers: [
      { tier: "standard", tensile_strength_lbs: "8500", working_load_lbs: "850", source: "Allied-Locke" },
    ],
    source_refs: [
      { manufacturer: "Allied-Locke", code: "DLI", confidence: "Confirmed" },
    ],
    attachments_available: [],
    sprocket_series: "DLI",
    materials_available: ["carbon_steel"],
    options_upgrades: [],
    image_strategy: "family",
    status: "Active",
  },

  {
    chain_id: "PAVER-CHAIN",
    chain_family: "specialty_custom",
    chain_number: "Paver",
    display_name: "Paver Chain",
    standard: "Custom / OEM",
    pitch_in: "1.654",
    pitch_mm: "42.01",
    description: "Heavy-duty paver chain for asphalt paving equipment. Constructed for extreme abrasion and heat resistance.",
    specs: {
      pitch_in: "1.654", pitch_mm: "42.01",
      avg_ultimate_lbs: "20000", max_working_load_lbs: "4000",
      type: "Paver",
      construction: "Heavy sidebar, hardened components",
    },
    performance_tiers: [
      { tier: "standard", tensile_strength_lbs: "20000", working_load_lbs: "4000", source: "Allied-Locke" },
    ],
    source_refs: [
      { manufacturer: "Allied-Locke", code: "Paver-Chain", confidence: "Confirmed" },
    ],
    attachments_available: [],
    sprocket_series: "Paver",
    materials_available: ["carbon_steel", "hardened_pins"],
    options_upgrades: [],
    image_strategy: "family",
    status: "Active",
  },

  {
    chain_id: "WASTEWATER-CHAIN",
    chain_family: "specialty_custom",
    chain_number: "WW",
    display_name: "Waste Water Treatment Chain",
    standard: "Custom / OEM",
    pitch_in: "3.000",
    pitch_mm: "76.20",
    description: "Corrosion-resistant chain specifically engineered for waste water treatment applications — sewage screens, sludge collectors, bar screens.",
    specs: {
      pitch_in: "3.000", pitch_mm: "76.20",
      avg_ultimate_lbs: "24000", max_working_load_lbs: "4800",
      type: "Corrosion resistant",
      construction: "Stainless or coated components",
    },
    performance_tiers: [
      { tier: "standard", tensile_strength_lbs: "24000", working_load_lbs: "4800", source: "Allied-Locke" },
    ],
    source_refs: [
      { manufacturer: "Allied-Locke", code: "WW-Chain", confidence: "Confirmed" },
    ],
    attachments_available: [],
    sprocket_series: "WW",
    materials_available: ["stainless_304", "stainless_316", "polymer_roller"],
    options_upgrades: ["Stainless 316 components"],
    image_strategy: "family",
    status: "Active",
  },

  {
    chain_id: "DOUBLE-FLEX",
    chain_family: "specialty_custom",
    chain_number: "DF",
    display_name: "Double Flex Chain",
    standard: "Custom / OEM",
    pitch_in: "1.500",
    pitch_mm: "38.10",
    description: "Double-flex chain for curved conveyor paths both horizontally and vertically. Used in spiral conveyors and complex routing.",
    specs: {
      pitch_in: "1.500", pitch_mm: "38.10",
      avg_ultimate_lbs: "8000", max_working_load_lbs: "1600",
      type: "Double-flex",
      construction: "Side-bow both planes",
    },
    performance_tiers: [
      { tier: "standard", tensile_strength_lbs: "8000", working_load_lbs: "1600", source: "Allied-Locke" },
    ],
    source_refs: [
      { manufacturer: "Allied-Locke", code: "DF-Chain", confidence: "Confirmed" },
    ],
    attachments_available: [],
    sprocket_series: "DF",
    materials_available: ["carbon_steel"],
    options_upgrades: [],
    image_strategy: "family",
    status: "Active",
  },

];

export default NORMALIZED_CHAINS_EXPANSION;