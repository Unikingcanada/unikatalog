/**
 * chainFamilyData.js
 * Normalized chain family definitions for the industrial chain procurement platform.
 * Maps 18 chain families to existing catalog categories and new families.
 * Does NOT replace existing data — additive mapping layer only.
 */

export const CHAIN_FAMILIES = [
  {
    key: "performance_roller",
    label: "Performance Roller Chains",
    icon: "🔗",
    color: "#0057A8",
    description: "ANSI & metric roller chains for power transmission. Single, double, triple, quad strand. Standard, heavy, super-series, British Standard, stainless, nickel plated, armor coat, self-lube.",
    image: "https://chains.alliedlocke.com/ImgMedium/PRC%20Ansi%20Drawing.jpg",
    catalog_key: "performance_roller",
    applications: ["Power Transmission", "Industrial Drives", "Agricultural", "Mining", "Packaging", "Oil & Gas"],
    pitch_range: "0.250\" – 3.000\"",
    standards: ["ANSI B29.1", "ISO 606", "DIN 8188"],
    source_note: "Allied-Locke, Donghua, Peer, Tsubaki, Renold"
  },
  {
    key: "conveyor_roller",
    label: "Conveyor Roller Chains",
    icon: "📦",
    color: "#0369a1",
    description: "Roller chains optimized for conveying applications — double pitch conveyor series, hollow pin, top roller, and side roller chains.",
    image: "https://chains.alliedlocke.com/ImgMedium/MSR6018.jpg",
    catalog_key: "performance_roller",
    subcategory_filter: ["double_pitch"],
    applications: ["Conveying", "Assembly Lines", "Parts Washing", "Packaging", "Manufacturing"],
    pitch_range: "1.000\" – 4.000\"",
    standards: ["ANSI B29.4", "ISO 1977"],
    source_note: "Allied-Locke, Donghua, Tsubaki"
  },
  {
    key: "attachment_roller",
    label: "Attachment Roller Chains",
    icon: "🔧",
    color: "#b45309",
    description: "Roller chains with extended pins, bent tabs, or special flights for conveying, lifting, indexing, and carrying loads.",
    image: "https://chains.alliedlocke.com/ImgMedium/a1038.jpg",
    catalog_key: "attachments",
    applications: ["Conveying with Flights", "Agricultural Conveying", "Packaging Lines", "Elevator Chains"],
    pitch_range: "0.375\" – 2.000\"",
    standards: ["ANSI B29.1"],
    source_note: "Allied-Locke"
  },
  {
    key: "hollow_pin",
    label: "Hollow Pin Chains",
    icon: "⭕",
    color: "#6d28d9",
    description: "Hollow pin roller chains for cross-rod, slat, and scraper conveyor applications. Pins accept cross-rods, bars, and special attachments.",
    image: "https://chains.alliedlocke.com/ImgMedium/PRC%20Ansi%20Drawing.jpg",
    catalog_key: "performance_roller",
    applications: ["Cross-Rod Conveyors", "Slat Conveyors", "Scraper Chains", "Special Attachments"],
    pitch_range: "0.500\" – 2.000\"",
    standards: ["ANSI B29.1"],
    source_note: "Allied-Locke, Tsubaki"
  },
  {
    key: "double_pitch_conveyor",
    label: "Double Pitch Conveyor Chains",
    icon: "↔️",
    color: "#0e7490",
    description: "C2040–C2102H double pitch chains. Economy conveyor chain — fewer links per foot. Standard, oversize roller, heavy, and walk-on-rail variants.",
    image: "https://chains.alliedlocke.com/ImgMedium/PRC%20Ansi%20Drawing.jpg",
    catalog_key: "performance_roller",
    subcategory_filter: ["double_pitch"],
    applications: ["Economy Conveying", "Walk-on-Rail", "Parts Washing", "Assembly Lines", "Packaging"],
    pitch_range: "1.000\" – 4.000\" (double pitch)",
    standards: ["ANSI B29.4"],
    source_note: "Allied-Locke, Donghua"
  },
  {
    key: "engineered_class",
    label: "Engineered Class Chains",
    icon: "⚙️",
    color: "#1a3a5c",
    description: "SS Class, MSR Class, MXS Class, Combination, H-Class, Drop Forged Rivetless, and Cast Manganese chains for heavy industrial applications.",
    image: "https://chains.alliedlocke.com/ImgMedium/SS188%20copy.jpg",
    catalog_key: "engineered_class",
    applications: ["Heavy Conveying", "Mining", "Aggregate", "Cement", "Grain Elevating", "Industrial Drag"],
    pitch_range: "2\" – 12\" (varies by series)",
    standards: ["ASME B29.100"],
    source_note: "Allied-Locke / MAC Chain"
  },
  {
    key: "welded_steel",
    label: "Welded Steel Chains",
    icon: "⛓️",
    color: "#374151",
    description: "WH and WD series welded steel mill and drag chains. All-welded construction. For conveying, driving, and elevating bulk materials.",
    image: "https://chains.alliedlocke.com/ImgMedium/WH124.jpg",
    catalog_key: "welded_steel",
    applications: ["Mining", "Grain Handling", "Aggregate", "Cement", "Recycling", "Industrial Conveying"],
    pitch_range: "2.609\" – 8.000\"",
    standards: ["ASME B29.100"],
    source_note: "Allied-Locke / MAC Chain"
  },
  {
    key: "steel_pintle",
    label: "Steel Pintle Chains",
    icon: "🔩",
    color: "#92400e",
    description: "Open barrel steel pintle chains. All heat-treated parts, quad-staked pins. Agricultural, fertilizer, and light industrial conveying.",
    image: "https://chains.alliedlocke.com/ImgMedium/steel-pintle-chains.jpg",
    catalog_key: "steel_pintle",
    applications: ["Agricultural Conveying", "Fertilizer Spreading", "Manure Handling", "Light Industrial"],
    pitch_range: "1.634\" – 4.000\"",
    standards: ["ASME B29.6"],
    source_note: "Allied-Locke / MAC Chain"
  },
  {
    key: "steel_bushed",
    label: "Steel Bushed Chains",
    icon: "🔲",
    color: "#065f46",
    description: "Bush/bushed conveyor chains without rollers. Plain bushed and ribbed designs for agricultural, food processing, and industrial conveying.",
    image: "https://chains.alliedlocke.com/ImgMedium/SS188%20copy.jpg",
    catalog_key: "engineered_class",
    subcategory_filter: ["ss_class"],
    applications: ["Agricultural Conveying", "Food Processing", "Industrial Conveying", "Elevator Heads"],
    pitch_range: "1\" – 6\" (varies)",
    standards: ["ASME B29.100"],
    source_note: "Allied-Locke, Donghua"
  },
  {
    key: "agricultural_conveyor",
    label: "Agricultural Conveyor Chains",
    icon: "🌾",
    color: "#166534",
    description: "Agricultural roller chains (CA series), detachable chains, T-Bar, T-Rod chains for combines, forage harvesters, spreaders, and farm equipment.",
    image: "https://chains.alliedlocke.com/ImgMedium/agricultural-roller-chains.jpg",
    catalog_key: "agricultural",
    applications: ["Combines", "Forage Harvesters", "Spreaders", "Grain Handling", "Farm Equipment"],
    pitch_range: "1.630\" – 4.000\"",
    standards: ["ASME B29.200"],
    source_note: "Allied-Locke, Donghua"
  },
  {
    key: "sharptop",
    label: "SharpTop Chains",
    icon: "🪚",
    color: "#b45309",
    description: "Sharp-top and spike-top conveyor chains. Standard pitch, heavy-duty, waferizer, and specialty configurations for sawmills and forestry.",
    image: "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600&q=80&auto=format&fit=crop",
    catalog_key: "sharptop",
    applications: ["Sawmill Log Feeding", "Forestry Conveying", "Waferizer Infeed", "Log Decking"],
    pitch_range: "0.750\" – 6.000\"",
    standards: ["Custom / Proprietary"],
    source_note: "SharpTop / Compatible"
  },
  {
    key: "forged",
    label: "Forged Chains",
    icon: "🔨",
    color: "#7c3aed",
    description: "Forged steel chains for high-load and abrasive environments. Forged links for maximum strength and durability.",
    image: "https://base44.app/api/apps/69dd9ffccab4dd693d4d92f5/files/mp/public/69dd9ffccab4dd693d4d92f5/4ed6677f2_forged-chain.jpg",
    catalog_key: "forged",
    applications: ["Heavy Mining", "Aggregate", "Quarrying", "High-Abrasion Conveying"],
    pitch_range: "Varies",
    standards: ["DIN / ISO"],
    source_note: "Uniking Forged Chain Catalog"
  },
  {
    key: "drop_forged_rivetless",
    label: "Drop Forged Rivetless Chains",
    icon: "🏗️",
    color: "#1e40af",
    description: "Rivetless drop forged chains for overhead conveyors, pusher conveyors, and monorail systems. X348, X458, X678 and more.",
    image: "https://chains.alliedlocke.com/ImgMedium/Drop%20Forged%20Rivetless.jpg",
    catalog_key: "engineered_class",
    subcategory_filter: ["drop_forged"],
    applications: ["Automotive Assembly", "Paint Lines", "Overhead Conveying", "Pusher Conveyors", "Monorail"],
    pitch_range: "3.075\" – 12\"",
    standards: ["ASME B29.100"],
    source_note: "Allied-Locke / MAC Chain, Rexnord"
  },
  {
    key: "overhead_conveyor",
    label: "Overhead Conveyor Chains",
    icon: "🏭",
    color: "#0c4a6e",
    description: "Overhead conveyor and power-and-free chain systems for automotive, finishing, and assembly applications.",
    image: "https://chains.alliedlocke.com/ImgMedium/Drop%20Forged%20Rivetless.jpg",
    catalog_key: "engineered_class",
    applications: ["Automotive Finishing", "Paint Lines", "Assembly Conveyors", "Power-and-Free Systems"],
    pitch_range: "3\" – 12\"",
    standards: ["ASME B29.100"],
    source_note: "Allied-Locke / MAC Chain"
  },
  {
    key: "drag_scraper",
    label: "Drag / Scraper Chains",
    icon: "⛏️",
    color: "#7f1d1d",
    description: "Heavy-duty drag and scraper chains for bulk material handling. WD series, en-masse conveyors, and reclaim systems.",
    image: "https://chains.alliedlocke.com/ImgMedium/WH124.jpg",
    catalog_key: "welded_steel",
    subcategory_filter: ["wd_series"],
    applications: ["En-Masse Conveying", "Bulk Reclaim", "Mining", "Grain Handling", "Aggregate"],
    pitch_range: "6.000\" – 12\"",
    standards: ["ASME B29.100"],
    source_note: "Allied-Locke / MAC Chain"
  },
  {
    key: "bucket_elevator",
    label: "Bucket Elevator Chains",
    icon: "🪣",
    color: "#164e63",
    description: "Round link (central chains), AA and BB elevator chains, cast rivetless chains for grain, aggregate, and cement bucket elevators.",
    image: "https://chains.alliedlocke.com/ImgMedium/Cast%20Manganese.jpg",
    catalog_key: "engineered_class",
    subcategory_filter: ["cast_manganese"],
    applications: ["Grain Elevators", "Cement Elevators", "Aggregate Elevating", "Mining Elevators"],
    pitch_range: "3\" – 12\"",
    standards: ["ASME B29.100"],
    source_note: "Allied-Locke / MAC Chain"
  },
  {
    key: "leaf_chain",
    label: "Leaf Chains",
    icon: "🍃",
    color: "#065f46",
    description: "AL and BL series leaf chains for forklift masts, tension linkages, and balance applications. ANSI/ASME B29.8.",
    image: "https://chains.alliedlocke.com/ImgMedium/a1024.jpg",
    catalog_key: "leaf_chain",
    applications: ["Forklift Masts", "Cranes", "Tension Linkages", "Balance Mechanisms", "Hoist Equipment"],
    pitch_range: "0.375\" – 4.000\"",
    standards: ["ANSI/ASME B29.8"],
    source_note: "Allied-Locke"
  },
  {
    key: "specialty_custom",
    label: "Specialty / Custom Chains",
    icon: "🔬",
    color: "#6b21a8",
    description: "DLI scanner chains, waste water chains, paver chains, double-flex chains, and custom-engineered chain solutions.",
    image: "https://chains.alliedlocke.com/ImgMedium/MXS881.jpg",
    catalog_key: "engineered_class",
    applications: ["DLI Scanner Systems", "Waste Water Treatment", "Paving Equipment", "Double-Flex Applications", "Custom OEM"],
    pitch_range: "Varies",
    standards: ["Custom / OEM"],
    source_note: "Allied-Locke / MAC Chain, Custom"
  }
];

// Map family key → existing catalog_key (for cross-referencing CHAIN_PRODUCTS)
export const FAMILY_TO_CATALOG_KEY = Object.fromEntries(
  CHAIN_FAMILIES.map(f => [f.key, f.catalog_key])
);

// Materials/coatings library — normalized options
export const MATERIAL_OPTIONS = [
  { key: "carbon_steel",     label: "Carbon Steel",           note: "Standard" },
  { key: "stainless_304",    label: "Stainless Steel 304",    note: "Corrosion resistant" },
  { key: "stainless_316",    label: "Stainless Steel 316",    note: "Marine / chemical grade" },
  { key: "zinc_plated",      label: "Zinc Plated",            note: "Light corrosion protection" },
  { key: "nickel_plated",    label: "Nickel Plated",          note: "Applied before assembly" },
  { key: "armor_coat",       label: "Armor Coat",             note: "Applied before & after assembly" },
  { key: "dacromet",         label: "Dacromet",               note: "High corrosion resistance" },
  { key: "self_lube",        label: "Self-Lubricating",       note: "Oil-impregnated sintered bushings" },
  { key: "slb",              label: "Self-Lube Bushing (SLB)",note: "NP pins + treated plates + sintered bush" },
  { key: "high_temp",        label: "High Temperature",       note: "Alloy steel — for elevated temps" },
  { key: "food_grade",       label: "Food Grade",             note: "Stainless or NSF-approved" },
  { key: "hardened_pins",    label: "Hardened Pins",          note: "Through-hardened pins" },
  { key: "induction_hard",   label: "Induction Hardened",     note: "WHX series — wear surface hardened" },
  { key: "polymer_roller",   label: "Plastic / Polymer Rollers", note: "Reduced noise, corrosion resistance" },
  { key: "chrome_pins",      label: "Chrome Pins",            note: "Enhanced wear resistance" },
];

// Performance tier definitions
export const PERFORMANCE_TIERS = [
  { key: "standard",    label: "Standard Duty",    color: "#64748b", description: "Standard ANSI/ISO specifications" },
  { key: "performance", label: "Performance Duty", color: "#0057A8", description: "Enhanced construction — higher fatigue strength" },
  { key: "premium",     label: "Premium Duty",     color: "#7c3aed", description: "Maximum load — shot peened, hardened, ball-drifted" },
];

// RFQ length units
export const LENGTH_UNITS = ["ft", "m", "links", "strands", "sets"];

// Attachment spacing options
export const ATTACHMENT_SPACINGS = [
  "Every pitch (1P)",
  "Every 2nd pitch (2P)",
  "Every 3rd pitch (3P)",
  "Every 4th pitch (4P)",
  "Every 6th pitch (6P)",
  "Every 8th pitch (8P)",
  "Custom spacing — specify in notes"
];