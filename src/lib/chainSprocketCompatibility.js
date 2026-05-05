/**
 * chainSprocketCompatibility.js
 *
 * Sprocket compatibility engine for the normalized chain procurement platform.
 *
 * ARCHITECTURE RULES:
 * - Sprocket series keys match chain `sprocket_series` field in normalized dictionary
 * - Each sprocket series contains tooth count options, bore data, material, and style info
 * - Chain → Sprocket relationship: chain.sprocket_series → SPROCKET_SERIES[key]
 * - Sprocket → Chain relationship: use getCompatibleChains(sprocket_series)
 * - Do NOT mix sprocket series between incompatible chain standards
 * - "bore_styles" describes what bore options are available (plain, keyway, QD, etc.)
 *
 * COVERAGE:
 * - ANSI #25 through #160 standard tooth ranges
 * - Heavy series share sprockets with standard (same pitch, same teeth)
 * - Double pitch C20xx shares sprockets with corresponding standard pitch #xx
 * - WH/WR welded steel chain — matched sprockets
 * - X348 / X458 drop forged rivetless — matched sprockets
 * - 667 / 7200 pintle chain — matched sprockets
 */

export const SPROCKET_SERIES = {

  // ══════════════════════════════════════════════════════════════════
  // ANSI STANDARD ROLLER CHAIN SPROCKETS
  // ══════════════════════════════════════════════════════════════════

  "ANSI-25": {
    chain_series: "ANSI-25",
    compatible_chains: ["ANSI-25"],
    standard: "ANSI B29.1",
    pitch_in: "0.250",
    tooth_range: { min: 6, max: 96 },
    common_teeth: [6, 9, 11, 13, 15, 17, 18, 19, 21, 23, 25, 30, 35, 40, 45, 60],
    materials: ["steel", "cast_iron", "stainless", "nylon"],
    bore_styles: ["plain", "keyway", "set_screw"],
    style_options: ["type_A_plain", "type_B_hub", "type_C_double_hub", "idler"],
    notes: "Smallest standard ANSI sprocket. Plain bore standard. Keyway on request.",
    source_ref: "Allied-Locke",
  },

  "ANSI-35": {
    chain_series: "ANSI-35",
    compatible_chains: ["ANSI-35"],
    standard: "ANSI B29.1",
    pitch_in: "0.375",
    tooth_range: { min: 6, max: 96 },
    common_teeth: [6, 9, 11, 13, 15, 17, 18, 19, 21, 23, 25, 30, 35, 40, 45, 60, 84],
    materials: ["steel", "cast_iron", "stainless", "nylon"],
    bore_styles: ["plain", "keyway", "QD_bushed", "taper_lock", "set_screw"],
    style_options: ["type_A_plain", "type_B_hub", "type_C_double_hub", "split", "idler", "weld_hub"],
    notes: "Common in packaging and light conveying.",
    source_ref: "Allied-Locke",
  },

  "ANSI-40": {
    chain_series: "ANSI-40",
    compatible_chains: ["ANSI-40", "ANSI-40H"],
    standard: "ANSI B29.1",
    pitch_in: "0.500",
    tooth_range: { min: 6, max: 96 },
    common_teeth: [9, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 23, 25, 27, 30, 35, 40, 45, 60, 72],
    materials: ["steel", "cast_iron", "stainless", "nylon", "hardened_steel"],
    bore_styles: ["plain", "keyway", "QD_bushed", "taper_lock", "set_screw", "idler_bearing"],
    style_options: ["type_A_plain", "type_B_hub", "type_C_double_hub", "split", "idler", "weld_hub", "flanged_idler"],
    max_bore_in: "2.500",
    notes: "Most common ANSI sprocket. Huge range of bore and tooth options.",
    source_ref: "Allied-Locke",
  },

  "ANSI-50": {
    chain_series: "ANSI-50",
    compatible_chains: ["ANSI-50", "ANSI-50H"],
    standard: "ANSI B29.1",
    pitch_in: "0.625",
    tooth_range: { min: 6, max: 80 },
    common_teeth: [9, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 23, 25, 27, 30, 35, 40, 45, 60],
    materials: ["steel", "cast_iron", "stainless", "hardened_steel"],
    bore_styles: ["plain", "keyway", "QD_bushed", "taper_lock", "set_screw"],
    style_options: ["type_A_plain", "type_B_hub", "type_C_double_hub", "split", "idler", "weld_hub"],
    max_bore_in: "3.000",
    notes: "Common in general industrial drives.",
    source_ref: "Allied-Locke",
  },

  "ANSI-60": {
    chain_series: "ANSI-60",
    compatible_chains: ["ANSI-60", "ANSI-60H"],
    standard: "ANSI B29.1",
    pitch_in: "0.750",
    tooth_range: { min: 6, max: 72 },
    common_teeth: [9, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 23, 25, 27, 30, 35, 40, 45, 60],
    materials: ["steel", "cast_iron", "stainless", "hardened_steel"],
    bore_styles: ["plain", "keyway", "QD_bushed", "taper_lock", "set_screw", "idler_bearing"],
    style_options: ["type_A_plain", "type_B_hub", "type_C_double_hub", "split", "idler", "weld_hub", "flanged_idler"],
    max_bore_in: "3.500",
    notes: "Widely used in agricultural and industrial drives.",
    source_ref: "Allied-Locke",
  },

  "ANSI-80": {
    chain_series: "ANSI-80",
    compatible_chains: ["ANSI-80", "ANSI-80H"],
    standard: "ANSI B29.1",
    pitch_in: "1.000",
    tooth_range: { min: 6, max: 68 },
    common_teeth: [9, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 23, 25, 27, 30, 35, 40, 45, 60],
    materials: ["steel", "cast_iron", "stainless", "hardened_steel"],
    bore_styles: ["plain", "keyway", "QD_bushed", "taper_lock", "set_screw", "idler_bearing"],
    style_options: ["type_A_plain", "type_B_hub", "type_C_double_hub", "split", "idler", "weld_hub", "flanged_idler"],
    max_bore_in: "5.000",
    notes: "Heavy-duty industrial standard. Many bore and hub options.",
    source_ref: "Allied-Locke",
  },

  "ANSI-100": {
    chain_series: "ANSI-100",
    compatible_chains: ["ANSI-100", "ANSI-100H"],
    standard: "ANSI B29.1",
    pitch_in: "1.250",
    tooth_range: { min: 6, max: 60 },
    common_teeth: [9, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 23, 25, 27, 30, 35, 40, 45],
    materials: ["steel", "cast_iron", "stainless"],
    bore_styles: ["plain", "keyway", "QD_bushed", "taper_lock"],
    style_options: ["type_A_plain", "type_B_hub", "type_C_double_hub", "split", "idler"],
    max_bore_in: "5.500",
    notes: "Large industrial drive sprocket.",
    source_ref: "Allied-Locke",
  },

  "ANSI-120": {
    chain_series: "ANSI-120",
    compatible_chains: ["ANSI-120", "ANSI-120H"],
    standard: "ANSI B29.1",
    pitch_in: "1.500",
    tooth_range: { min: 6, max: 60 },
    common_teeth: [9, 11, 12, 13, 15, 17, 18, 19, 21, 25, 30, 35, 40],
    materials: ["steel", "cast_iron"],
    bore_styles: ["plain", "keyway", "QD_bushed", "taper_lock"],
    style_options: ["type_A_plain", "type_B_hub", "type_C_double_hub", "split"],
    max_bore_in: "7.000",
    notes: "Large-pitch heavy drive.",
    source_ref: "Allied-Locke",
  },

  "ANSI-160": {
    chain_series: "ANSI-160",
    compatible_chains: ["ANSI-160", "ANSI-160H"],
    standard: "ANSI B29.1",
    pitch_in: "2.000",
    tooth_range: { min: 6, max: 48 },
    common_teeth: [9, 11, 12, 13, 15, 17, 18, 19, 21, 25, 30, 35, 40],
    materials: ["steel", "cast_iron"],
    bore_styles: ["plain", "keyway", "QD_bushed"],
    style_options: ["type_A_plain", "type_B_hub", "type_C_double_hub"],
    max_bore_in: "8.000",
    notes: "Very large pitch. Confirm availability.",
    source_ref: "Allied-Locke",
  },

  // ══════════════════════════════════════════════════════════════════
  // DOUBLE PITCH CONVEYOR SPROCKETS
  // Note: C2040 uses #40 sprockets; C2060 uses #60 sprockets, etc.
  // Large roller double pitch chains require special sprocket tooth profiles.
  // ══════════════════════════════════════════════════════════════════

  "C2040": {
    chain_series: "C2040",
    compatible_chains: ["C2040"],
    standard: "ANSI B29.4",
    pitch_in: "1.000",
    tooth_range: { min: 6, max: 60 },
    common_teeth: [8, 9, 10, 12, 14, 16, 18, 20, 24, 30, 38],
    materials: ["steel", "cast_iron", "stainless", "nylon"],
    bore_styles: ["plain", "keyway", "QD_bushed"],
    style_options: ["type_A_plain", "type_B_hub", "idler"],
    notes: "Double pitch. Uses #40-based tooth form. Also accepts standard #40 sprockets for single-tooth engagement.",
    source_ref: "Allied-Locke",
  },

  "C2060": {
    chain_series: "C2060",
    compatible_chains: ["C2060H", "C2060"],
    standard: "ANSI B29.4",
    pitch_in: "1.500",
    tooth_range: { min: 6, max: 48 },
    common_teeth: [8, 9, 10, 12, 14, 16, 18, 20, 24, 30],
    materials: ["steel", "cast_iron", "stainless"],
    bore_styles: ["plain", "keyway", "QD_bushed"],
    style_options: ["type_A_plain", "type_B_hub", "idler"],
    notes: "Double pitch. Uses #60-based tooth form.",
    source_ref: "Allied-Locke",
  },

  "C2080": {
    chain_series: "C2080",
    compatible_chains: ["C2080H"],
    standard: "ANSI B29.4",
    pitch_in: "2.000",
    tooth_range: { min: 6, max: 40 },
    common_teeth: [8, 9, 10, 12, 14, 16, 18, 20, 24, 30],
    materials: ["steel", "cast_iron"],
    bore_styles: ["plain", "keyway"],
    style_options: ["type_A_plain", "type_B_hub"],
    notes: "Double pitch. Uses #80-based tooth form.",
    source_ref: "Allied-Locke",
  },

  // ══════════════════════════════════════════════════════════════════
  // WELDED STEEL CHAIN SPROCKETS
  // ══════════════════════════════════════════════════════════════════

  "WH-78": {
    chain_series: "WH-78",
    compatible_chains: ["WH-78"],
    standard: "ASME B29.100",
    pitch_in: "2.609",
    tooth_range: { min: 5, max: 20 },
    common_teeth: [5, 6, 7, 8, 9, 10, 12, 14, 16, 18, 20],
    materials: ["steel", "cast_steel", "hardened_steel"],
    bore_styles: ["plain", "keyway", "hub_mounted"],
    style_options: ["A_hub", "B_hub", "c_sprocket", "segment_sprocket"],
    notes: "Matched to WH78 chain dimensions. Segment sprockets available for field assembly.",
    source_ref: "Allied-Locke / MAC Chain",
  },

  "WH-124": {
    chain_series: "WH-124",
    compatible_chains: ["WH-124"],
    standard: "ASME B29.100",
    pitch_in: "4.063",
    tooth_range: { min: 4, max: 16 },
    common_teeth: [4, 5, 6, 7, 8, 9, 10, 12, 14, 16],
    materials: ["steel", "cast_steel", "hardened_steel"],
    bore_styles: ["plain", "keyway", "hub_mounted"],
    style_options: ["A_hub", "segment_sprocket"],
    notes: "Large-pitch sprocket. Segment style strongly recommended for field replacement.",
    source_ref: "Allied-Locke / MAC Chain",
  },

  // ══════════════════════════════════════════════════════════════════
  // DROP FORGED RIVETLESS SPROCKETS
  // ══════════════════════════════════════════════════════════════════

  "X348": {
    chain_series: "X348",
    compatible_chains: ["X348"],
    standard: "ASME B29.100",
    pitch_in: "3.075",
    tooth_range: { min: 5, max: 14 },
    common_teeth: [5, 6, 7, 8, 9, 10, 11, 12, 14],
    materials: ["steel", "hardened_steel"],
    bore_styles: ["plain", "keyway", "hub_mounted"],
    style_options: ["cast_sprocket", "segment_sprocket", "drive_sprocket"],
    notes: "Drop forged rivetless sprockets. Segment replacement sprockets available.",
    source_ref: "Allied-Locke",
  },

  "X458": {
    chain_series: "X458",
    compatible_chains: ["X458"],
    standard: "ASME B29.100",
    pitch_in: "4.000",
    tooth_range: { min: 5, max: 12 },
    common_teeth: [5, 6, 7, 8, 9, 10, 12],
    materials: ["steel", "hardened_steel"],
    bore_styles: ["plain", "keyway", "hub_mounted"],
    style_options: ["cast_sprocket", "segment_sprocket"],
    notes: "X458 rivetless chain sprockets. Confirm availability at order.",
    source_ref: "Allied-Locke",
  },

  // ══════════════════════════════════════════════════════════════════
  // STEEL PINTLE CHAIN SPROCKETS
  // ══════════════════════════════════════════════════════════════════

  "667": {
    chain_series: "667",
    compatible_chains: ["667", "667X"],
    standard: "ASME B29.6",
    pitch_in: "2.609",
    tooth_range: { min: 4, max: 18 },
    common_teeth: [4, 5, 6, 7, 8, 9, 10, 11, 12, 14, 16, 18],
    materials: ["steel", "cast_steel"],
    bore_styles: ["plain", "keyway", "hub_mounted"],
    style_options: ["cast_sprocket"],
    notes: "Matched to 667 and 667X pintle chain. Cast steel standard.",
    source_ref: "Allied-Locke / MAC Chain",
  },

  "7200": {
    chain_series: "7200",
    compatible_chains: ["7200"],
    standard: "ASME B29.6",
    pitch_in: "3.000",
    tooth_range: { min: 4, max: 16 },
    common_teeth: [4, 5, 6, 7, 8, 9, 10, 11, 12, 14, 16],
    materials: ["steel", "cast_steel"],
    bore_styles: ["plain", "keyway"],
    style_options: ["cast_sprocket"],
    notes: "7200 series pintle chain sprockets.",
    source_ref: "Allied-Locke / MAC Chain",
  },

  // ══════════════════════════════════════════════════════════════════
  // ENGINEERED CLASS SPROCKETS
  // ══════════════════════════════════════════════════════════════════

  "SS-78": {
    chain_series: "SS-78",
    compatible_chains: ["SS-78"],
    standard: "ASME B29.100",
    pitch_in: "2.609",
    tooth_range: { min: 5, max: 18 },
    common_teeth: [5, 6, 7, 8, 9, 10, 12, 14, 16, 18],
    materials: ["steel", "cast_steel", "hardened_steel"],
    bore_styles: ["plain", "keyway", "hub_mounted"],
    style_options: ["A_hub", "B_hub", "segment_sprocket"],
    notes: "Matched to SS78 solid bushed chain.",
    source_ref: "Allied-Locke / MAC Chain",
  },

  "MSR-60": {
    chain_series: "MSR-60",
    compatible_chains: ["MSR-6018"],
    standard: "ASME B29.100",
    pitch_in: "6.000",
    tooth_range: { min: 4, max: 10 },
    common_teeth: [4, 5, 6, 7, 8, 9, 10],
    materials: ["steel", "cast_steel", "hardened_steel"],
    bore_styles: ["plain", "keyway", "hub_mounted"],
    style_options: ["A_hub", "segment_sprocket"],
    notes: "Very large pitch. Segment sprockets strongly recommended.",
    source_ref: "Allied-Locke / MAC Chain",
  },

  // ══════════════════════════════════════════════════════════════════
  // AGRICULTURAL CHAIN SPROCKETS
  // ══════════════════════════════════════════════════════════════════

  "CA550": {
    chain_series: "CA550",
    compatible_chains: ["CA550"],
    standard: "ASME B29.200",
    pitch_in: "1.654",
    tooth_range: { min: 6, max: 40 },
    common_teeth: [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 25, 30, 40],
    materials: ["steel", "cast_steel", "stainless"],
    bore_styles: ["plain", "keyway"],
    style_options: ["type_A_plain", "type_B_hub"],
    notes: "CA550 agricultural chain sprockets.",
    source_ref: "Allied-Locke / Donghua",
  },

  // Specialty
  "81X": {
    chain_series: "81X",
    compatible_chains: ["81X"],
    standard: "ASME B29.100",
    pitch_in: "3.000",
    tooth_range: { min: 5, max: 16 },
    common_teeth: [5, 6, 7, 8, 9, 10, 12, 14, 16],
    materials: ["steel", "cast_steel"],
    bore_styles: ["plain", "keyway"],
    style_options: ["cast_sprocket"],
    notes: "81X series extended pitch sprockets.",
    source_ref: "Allied-Locke",
  },

  "103B": {
    chain_series: "103B",
    compatible_chains: ["103B"],
    standard: "ASME B29.100",
    pitch_in: "3.000",
    tooth_range: { min: 5, max: 14 },
    common_teeth: [5, 6, 7, 8, 9, 10, 12, 14],
    materials: ["steel", "cast_steel"],
    bore_styles: ["plain", "keyway"],
    style_options: ["cast_sprocket"],
    notes: "103B specialty chain sprockets.",
    source_ref: "Allied-Locke",
  },

};

// ─── Lookup helpers ────────────────────────────────────────────────────────────

/** Get sprocket series data for a chain */
export function getSprocketSeriesForChain(chain_sprocket_series) {
  return SPROCKET_SERIES[chain_sprocket_series] || null;
}

/** Get all chains that use a given sprocket series */
export function getCompatibleChains(sprocket_series_key) {
  const series = SPROCKET_SERIES[sprocket_series_key];
  return series?.compatible_chains || [];
}

/** Build display-ready tooth count options array */
export function getToothOptions(sprocket_series_key) {
  const series = SPROCKET_SERIES[sprocket_series_key];
  if (!series) return [];
  return series.common_teeth.map(t => ({
    teeth: t,
    label: `${t}T`,
    pitch_in: series.pitch_in,
  }));
}

/** Get all bore style options for a sprocket series */
export function getBoreStyles(sprocket_series_key) {
  return SPROCKET_SERIES[sprocket_series_key]?.bore_styles || [];
}

/** Get all material options for a sprocket series */
export function getSprocketMaterials(sprocket_series_key) {
  return SPROCKET_SERIES[sprocket_series_key]?.materials || [];
}

export default SPROCKET_SERIES;