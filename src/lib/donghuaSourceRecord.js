/**
 * donghuaSourceRecord.js
 *
 * Official Donghua Chain source record for the Uniking chain procurement platform.
 *
 * SOURCE ID:    donghua_official
 * IMPORT DATE:  2026-05-06 (Phase 1–2) / 2026-05-06 (Phase 3 deep ingestion)
 * SOURCE URL:   http://en.dhchain.com/wp-content/uploads/2020/11/2020111706240075.pdf
 * TRUST LEVEL:  Trusted (Priority 1)
 * SCOPE:        Chains ecosystem ONLY
 *
 * PHASE 3 DEEP EXPANSION (donghuaDeepExpansion.js):
 *   3A — Attachment chains (A1/A2/K1/K2 ANSI configs)
 *   3B — Engineering class bushed conveyor (M56, M80, M112, P102, P142)
 *   3C — Welded steel chains (102B, 132B, 160B)
 *   3D — Steel pintle chains (667, 667H, 667X, 88K, 102B-P)
 *   3E — Agricultural conveyor variants (CA550F2, CA550V5, CA557V5, S77V1, CA2060HF5)
 *   3F — Specialty conveyor (en-masse 2.609\", F6 scraper 102mm)
 *   3G — Bucket elevator (VC series, FU160, TH102 high-speed)
 *   3H — Hollow pin extensions (100HP, C2060HP, C2080HP)
 *   3I — Double pitch attachment chains (C2060H-A1, C2080H-A1)
 *   3J — Connecting links & offset links (CL-40/60/80, OL-40/80)
 *   3K — Corrosion-resistant variants (zinc-plated, nickel-plated, dacromet)
 *   3L — SH Series high strength heavy duty (60SH, 80SH, 100SH)
 *   3M — Additional leaf chain sizes (AL1266, BL2034, BL2046)
 *
 * NORMALIZATION RULES:
 *   - brand_specific_products: false (no Donghua-only duplicates for standard ANSI/ISO chains)
 *   - merge_equivalent_chain_numbers: true
 *   - preserve_source_specific_specs: true
 *   - do_not_overwrite_baseline_dimensions: true
 *   - flag_conflicts: true → label "Specification varies by manufacturer"
 *   - specialty chains (sugar mill, palm oil, escalator, etc.) → new normalized entries
 *
 * CHAIN CODE CONVENTION (Donghua):
 *   A-series = ANSI/ASME (e.g. 40A-1, 80A-1)
 *   B-series = BS/ISO (e.g. 08B-1, 16B-1)
 *   H-suffix = Heavy series (e.g. 40AH-1, 80AH-1)
 *   -2, -3, -4 suffix = multi-strand
 *
 * USAGE:
 *   import { DH_SOURCE, DH_CATEGORIES, DH_CHAIN_SERIES } from "@/lib/donghuaSourceRecord";
 */

export const DH_SOURCE = {
  source_id: "donghua_official",
  manufacturer: "Donghua",
  full_name: "Hangzhou Donghua Chain Group Co., Ltd.",
  source_type: "official_catalog_pdf",
  trusted_source: true,
  priority: 1,
  category_scope: "Chains",
  catalog_url: "http://en.dhchain.com/wp-content/uploads/2020/11/2020111706240075.pdf",
  catalog_title: "Donghua Chain Group Product Catalogue 2020",
  import_date: "2026-05-06",
  website: "http://www.dhchain.com",
  standards: ["ANSI B29.1", "ISO 606", "DIN 8188", "BS 228", "ASME B29"],
  certifications: ["ISO 9001", "ISO 14001", "ISO/TS 16949", "CNAS"],
  product_range_note: "Pitch range 4.762mm (3/16\") to 1,016mm (40\"). Over 12,000 varieties.",
  allowed_content: [
    "drive chains", "conveyor chains", "agricultural chains",
    "engineering chains", "stainless steel chains", "hollow pin chains",
    "leaf chains", "escalator chains", "steel pintle chains",
    "specialty conveyor chains", "attachments", "sprockets",
    "connecting links", "offset links",
  ],
  excluded_content: [
    "automobile chains", "motorcycle chains", "CVT chains",
    "bearings", "motors", "couplings", "non-chain products",
  ],
  normalization_rules: {
    brand_specific_products: false,
    merge_equivalent_chain_numbers: true,
    preserve_source_specific_specs: true,
    do_not_overwrite_baseline_dimensions: true,
    flag_conflicts: true,
    specialty_chains_as_new_entries: true,
  },
  confidence_default: "Confirmed",
  notes: "Donghua A-series → ANSI families. Donghua B-series → BS/ISO families. Heavy (H) variants preserved. Specialty chains (sugar mill, palm oil, escalator, lumber, bucket elevator) as new normalized entries. Phase 3: deep expansion covers attachment chains, engineering class bushed conveyor, welded steel, steel pintle, agricultural variants, specialty conveyor, bucket elevator, hollow pin, double pitch attachment, connecting links, corrosion-resistant variants, SH series, additional leaf chains.",
  deep_ingestion_file: "lib/donghuaDeepExpansion.js",
  total_phases_complete: 3,
};

// ─── Donghua Category → Uniking Family Mapping ────────────────────────────────
export const DH_CATEGORIES = {
  // Drive chains
  "short-pitch-precision-roller-chains-a-series":   "performance_roller",
  "short-pitch-precision-roller-chains-b-series":   "performance_roller",
  "heavy-duty-series-roller-chains":                "performance_roller",
  "cottered-type-roller-chains-a-series":           "performance_roller",
  "heavy-duty-cottered-roller-chains":              "performance_roller",
  "sp-series-high-strength-roller-chains":          "performance_roller",
  "sh-series-high-strength-heavy-duty-roller-chains": "performance_roller",
  "x3-series-high-performance-roller-chains":       "performance_roller",
  "other-roller-chains":                            "performance_roller",
  "corrosion-resistant-zinc-plated-chains":         "performance_roller",
  "corrosion-resistant-nickel-plated-chains":       "performance_roller",
  "corrosion-resistant-dacromet":                   "performance_roller",
  "stainless-steel-chains":                         "performance_roller",
  "side-bow-chains":                                "performance_roller",
  "hollow-pin-chains":                              "hollow_pin",
  // Conveyor chains
  "double-pitch-conveyor-chains":                   "double_pitch_conveyor",
  "conveyor-roller-chains":                         "conveyor_roller",
  "attachment-chains":                              "attachment_roller",
  // Agricultural
  "agricultural-conveyor-chains":                   "agricultural_conveyor",
  "ca-series-agricultural-chains":                  "agricultural_conveyor",
  // Engineering class
  "engineering-class-bushed-chains":                "engineered_class",
  "welded-steel-chains":                            "welded_steel",
  "steel-pintle-chains":                            "steel_pintle",
  // Specialty
  "sugar-mill-chains":                              "specialty_custom",
  "palm-oil-chains":                                "specialty_custom",
  "escalator-step-chains":                          "specialty_custom",
  "lumber-forestry-chains":                         "specialty_custom",
  "bucket-elevator-chains":                         "bucket_elevator",
  "overhead-conveyor-chains":                       "overhead_conveyor",
  "rubber-gloves-carrier-chains":                   "specialty_custom",
  // Leaf chains
  "leaf-chains":                                    "leaf_chain",
};

// ─── Donghua Catalog Section Reference ────────────────────────────────────────
// Maps catalog sections to page ranges for source traceability
export const DH_CATALOG_SECTIONS = {
  "A_drive_chains":         { pages: "1-72",    title: "Drive Chains (A 传动链)" },
  "B_conveyor_chains":      { pages: "73-128",  title: "Conveyor Roller Chains (B 输送链)" },
  "C_engineering_chains":   { pages: "129-168", title: "Engineering Class Chains (C 工程链)" },
  "D_agricultural_chains":  { pages: "169-196", title: "Agricultural Chains (D 农机链)" },
  "E_stainless_chains":     { pages: "197-220", title: "Stainless Steel Chains (E 不锈钢链)" },
  "F_leaf_chains":          { pages: "221-240", title: "Leaf Chains (F 板式链)" },
  "G_escalator_chains":     { pages: "241-248", title: "Escalator Chains (G 扶梯链)" },
  "H_specialty_chains":     { pages: "249-280", title: "Specialty Chains" },
  "I_sprockets":            { pages: "281-320", title: "Sprockets (链轮)" },
};

// ─── Donghua Material / Coating Series ────────────────────────────────────────
export const DH_MATERIAL_VARIANTS = [
  {
    dh_series: "Standard (A/B series)",
    normalized_material: "carbon_steel",
    description: "Standard carbon steel, heat treated per ANSI B29.1 / ISO 606.",
    confidence: "Confirmed",
  },
  {
    dh_series: "Heavy Duty (H series)",
    normalized_material: "carbon_steel",
    description: "Thicker sidebar plates, higher tensile. Suffix H e.g. 40AH-1, 80AH-1.",
    normalized_upgrade: "heavy_series",
    confidence: "Confirmed",
  },
  {
    dh_series: "SP Series (High Strength)",
    normalized_material: "carbon_steel",
    description: "SP series — shot peened, optimized geometry, 25-40% higher fatigue strength than standard.",
    normalized_upgrade: "sp_high_strength",
    confidence: "Confirmed",
  },
  {
    dh_series: "SH Series (High Strength Heavy Duty)",
    normalized_material: "carbon_steel",
    description: "SH series — SP processing + heavy duty plates. Premium performance.",
    normalized_upgrade: "sh_premium",
    confidence: "Confirmed",
  },
  {
    dh_series: "X3 Series (High Performance)",
    normalized_material: "carbon_steel",
    description: "X3 Series — enhanced surface hardness, extended wear life, high-cycle fatigue rated.",
    normalized_upgrade: "x3_high_performance",
    confidence: "Confirmed",
  },
  {
    dh_series: "Zinc Plated",
    normalized_material: "zinc_plated",
    description: "Zinc plated for moderate corrosion resistance. RoHS compliant.",
    confidence: "Confirmed",
  },
  {
    dh_series: "Nickel Plated",
    normalized_material: "nickel_plated",
    description: "Nickel plated — improved corrosion resistance, near-standard strength.",
    confidence: "Confirmed",
  },
  {
    dh_series: "Dacromet",
    normalized_material: "dacromet",
    description: "Dacromet coating — excellent salt spray resistance (>500hrs). RoHS compliant. No hydrogen embrittlement.",
    confidence: "Confirmed",
  },
  {
    dh_series: "Stainless Steel 304",
    normalized_material: "stainless_304",
    description: "Full 304 stainless construction for corrosive environments.",
    confidence: "Confirmed",
  },
  {
    dh_series: "Stainless Steel 316",
    normalized_material: "stainless_316",
    description: "Full 316 stainless — superior chloride and acid resistance.",
    confidence: "Confirmed",
  },
];

export default DH_SOURCE;