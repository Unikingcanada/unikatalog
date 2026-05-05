/**
 * chainCatalogData.js
 * Unified chain catalog — categories + combined product list.
 * Sources: Allied-Locke Industries (chains.alliedlocke.com)
 * All specs verified from Allied-Locke live catalog pages.
 */
import { ROLLER_CHAIN_PRODUCTS } from "@/lib/chainDataRoller.js";
import { ENGINEERED_CHAIN_PRODUCTS } from "@/lib/chainDataEngineered.js";

// ── Category definitions ─────────────────────────────────────────────────────
const ALLIED = "https://chains.alliedlocke.com/";
const AM = ALLIED + "ImgMedium/";
const AS = ALLIED + "ImgSmall/";

export const CHAIN_CATEGORIES = [
  {
    key: "performance_roller",
    label: "Performance Roller Chains",
    icon: "🔗",
    description: "ANSI & metric roller chains for power transmission and conveying. Single, double, triple, and quad strand. Standard, heavy, solid bushing/roller, super-series, British Standard, double pitch, XDO oilfield, stainless, nickel plated, armor coat, and self-lube variants.",
    color: "#0057A8",
    image: AM + "PRC%20Ansi%20Drawing.jpg",
    subcategories: [
      { key: "ansi_standard",    label: "ANSI Standard Roller Chains (Single Strand)" },
      { key: "ansi_multi",       label: "ANSI Multiple Strand (Double / Triple / Quad)" },
      { key: "ansi_heavy",       label: "ANSI Heavy Series (H)" },
      { key: "solid_bushing",    label: "Solid Bushing / Solid Roller Chains" },
      { key: "super_series",     label: "Super Series (S & SHD)" },
      { key: "british_standard", label: "British Standard (BS) Roller Chains" },
      { key: "double_pitch",     label: "Double Pitch Roller Chains (A & C Series)" },
      { key: "double_capacity",  label: "Double Capacity Chains" },
      { key: "xdo",              label: "XDO Oilfield Series" },
      { key: "stainless",        label: "Stainless Steel Chains" },
      { key: "nickel_plated",    label: "Nickel Plated Chains" },
      { key: "armor_coat",       label: "Armor Coat Chains" },
      { key: "self_lube",        label: "Self-Lube Chains" },
      { key: "slb",              label: "Self-Lube Bushing (SLB) Chains" },
    ],
  },
  {
    key: "welded_steel",
    label: "Welded Steel Chains",
    icon: "⛓️",
    description: "Welded steel mill and drag chains for heavy-duty conveying, driving, and elevating. WH mill series (10 sizes) and WD drag series (5 sizes). WHX induction-hardened variants available.",
    color: "#374151",
    image: AM + "WH124.jpg",
    subcategories: [
      { key: "wh_series", label: "WH Series — Welded Mill Chains" },
      { key: "wd_series", label: "WD Series — Welded Drag Chains" },
    ],
  },
  {
    key: "steel_pintle",
    label: "Steel Pintle Chains",
    icon: "🔩",
    description: "All heat-treated parts, quad-staked pins. Open barrel design for cleaner operation. Common in agricultural and industrial conveying.",
    color: "#92400e",
    image: AM + "steel-pintle-chains.jpg",
    subcategories: [
      { key: "standard_pintle", label: "Standard Steel Pintle" },
    ],
  },
  {
    key: "engineered_class",
    label: "Engineered Class Chains",
    icon: "⚙️",
    description: "SS Class, MSR Class, MXS Class, Combination, H-Class, Drop Forged Rivetless, and Cast Manganese chains for heavy industrial applications.",
    color: "#1a3a5c",
    image: AM + "SS188%20copy.jpg",
    subcategories: [
      { key: "ss_class",       label: "SS Class Bushed Steel" },
      { key: "msr_class",      label: "MSR Class Bushed Roller Steel" },
      { key: "mxs_class",      label: "MXS Class Offset Steel Drive" },
      { key: "combination",    label: "Combination Chains" },
      { key: "h_class",        label: '"H" Class / Mill / Drag / Transfer' },
      { key: "drop_forged",    label: "Rivetless Drop Forged" },
      { key: "cast_manganese", label: "Cast Manganese / Alloy Steel" },
    ],
  },
  {
    key: "agricultural",
    label: "Agricultural Chains",
    icon: "🌾",
    description: "Agricultural roller chains, pintle, detachable, T-Bar, T-Rod chains. Built for combines, forage harvesters, and spreaders.",
    color: "#166534",
    image: AM + "agricultural-roller-chains.jpg",
    subcategories: [
      { key: "ag_roller",     label: "Agricultural Roller Chains" },
      { key: "ag_detachable", label: "Steel Detachable Chains" },
      { key: "ag_tbar",       label: "T-Bar Chains" },
      { key: "ag_trod",       label: "T-Rod Chains" },
    ],
  },
  {
    key: "leaf_chain",
    label: "Leaf Chains",
    icon: "🍃",
    description: "AL and BL series leaf chains for forklift masts, tension linkages, and balance applications. ANSI/ASME B29.8 compliant.",
    color: "#065f46",
    image: AM + "a1024.jpg",
    subcategories: [
      { key: "al_series", label: "AL Series Leaf Chains" },
      { key: "bl_series", label: "BL Series Leaf Chains" },
    ],
  },
  {
    key: "silent_chain",
    label: "Silent / Inverted Tooth Chains",
    icon: "🔇",
    description: "High-speed, high-load inverted tooth chains. Low noise, excellent fatigue resistance. Excel (outer guide) and Silent (center guide) series.",
    color: "#0e7490",
    image: AM + "Silent%20Chain%20Center%20Guide%20Pic.jpg",
    subcategories: [
      { key: "excel_series",  label: "Excel Series (Outer Guide)" },
      { key: "silent_series", label: "Silent Series (Center Guide)" },
    ],
  },
  {
    key: "attachments",
    label: "Chain Attachments",
    icon: "🔧",
    description: "Standard A1/A2/K1/K2 and special attachments for roller, welded steel, agricultural, and engineered class chains.",
    color: "#b45309",
    image: AM + "a1038.jpg",
    subcategories: [
      { key: "roller_attachments", label: "Roller Chain Attachments (A1, A2, K1, K2)" },
      { key: "weld_attachments",   label: "Welded Steel Chain Attachments" },
    ],
  },
  {
    key: "sprockets",
    label: "Sprockets",
    icon: "⚙️",
    description: "ANSI, BS, and engineered class sprockets for all chain families. Bore-to-size available.",
    color: "#374151",
    image: AS + "sprokets.jpg",
    subcategories: [
      { key: "ansi_sprockets", label: "ANSI Roller Chain Sprockets" },
      { key: "eng_sprockets",  label: "Engineered Class Sprockets" },
      { key: "ag_sprockets",   label: "Agricultural Chain Sprockets" },
    ],
  },
];

// ── Combined product list ────────────────────────────────────────────────────
export const CHAIN_PRODUCTS = [
  ...ROLLER_CHAIN_PRODUCTS,
  ...ENGINEERED_CHAIN_PRODUCTS,
];

// ── Helpers ──────────────────────────────────────────────────────────────────
export function getProductsByCategory(categoryKey) {
  return CHAIN_PRODUCTS.filter(p => p.category === categoryKey);
}

export function getProductsBySubcategory(categoryKey, subcategoryKey) {
  return CHAIN_PRODUCTS.filter(p => p.category === categoryKey && p.subcategory === subcategoryKey);
}

export function searchChainProducts(query) {
  const q = query.toLowerCase();
  return CHAIN_PRODUCTS.filter(p =>
    p.chain_number?.toLowerCase().includes(q) ||
    p.part_number?.toLowerCase().includes(q) ||
    p.product_type?.toLowerCase().includes(q) ||
    p.description?.toLowerCase().includes(q) ||
    p.industries?.some(i => i.toLowerCase().includes(q)) ||
    p.features?.some(f => f.toLowerCase().includes(q))
  );
}

export function getCategoryByKey(key) {
  return CHAIN_CATEGORIES.find(c => c.key === key);
}