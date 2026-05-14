/**
 * chainFamilyNormalizer.js
 *
 * Canonical mapping layer for chain_family values.
 *
 * PROBLEM: The DB stores chain_family as the LABEL (e.g. "Performance Roller Chains"),
 * but CHAIN_FAMILIES uses a short KEY (e.g. "performance_roller") internally.
 * Additionally, imported CSV data may use aliases (e.g. "ANSI Roller Chain", "Roller Chain").
 *
 * This module resolves all of that in both directions.
 */

import { CHAIN_FAMILIES } from "./chainFamilyData";

// ── Build lookup maps from CHAIN_FAMILIES ──────────────────────────────────

/** key → label  e.g. "performance_roller" → "Performance Roller Chains" */
export const FAMILY_KEY_TO_LABEL = Object.fromEntries(
  CHAIN_FAMILIES.map(f => [f.key, f.label])
);

/** label → key  e.g. "Performance Roller Chains" → "performance_roller" */
export const FAMILY_LABEL_TO_KEY = Object.fromEntries(
  CHAIN_FAMILIES.map(f => [f.label.toLowerCase().trim(), f.key])
);

// ── Alias normalization table ──────────────────────────────────────────────
// Maps any alias/variant → canonical label stored in DB

const ALIAS_TO_CANONICAL_LABEL = {
  // Performance Roller Chains
  "ansi roller chain":               "Performance Roller Chains",
  "ansi/bs roller chain":            "Performance Roller Chains",
  "ansi/bs chain":                   "Performance Roller Chains",
  "roller chain":                    "Performance Roller Chains",
  "power transmission chain":        "Performance Roller Chains",
  "standard roller chain":           "Performance Roller Chains",
  "precision roller chain":          "Performance Roller Chains",
  "bs roller chain":                 "Performance Roller Chains",
  "iso roller chain":                "Performance Roller Chains",
  "performance roller chains":       "Performance Roller Chains",
  "performance roller chain":        "Performance Roller Chains",
  "performance_roller":              "Performance Roller Chains",
  "high-end roller chain":           "Performance Roller Chains",
  "short pitch roller chain":        "Performance Roller Chains",
  "short pitch precision roller chain": "Performance Roller Chains",

  // Conveyor Roller Chains
  "conveyor roller chain":           "Conveyor Roller Chains",
  "conveyor roller chains":          "Conveyor Roller Chains",
  "conveyor_roller":                 "Conveyor Roller Chains",

  // Attachment Roller Chains
  "attachment roller chain":         "Attachment Roller Chains",
  "attachment roller chains":        "Attachment Roller Chains",
  "attachment_roller":               "Attachment Roller Chains",

  // Hollow Pin Chains
  "hollow pin chain":                "Hollow Pin Chains",
  "hollow pin chains":               "Hollow Pin Chains",
  "hollow_pin":                      "Hollow Pin Chains",

  // Double Pitch Conveyor Chains
  "double pitch chain":              "Double Pitch Conveyor Chains",
  "double pitch conveyor chain":     "Double Pitch Conveyor Chains",
  "double pitch conveyor chains":    "Double Pitch Conveyor Chains",
  "double_pitch_conveyor":           "Double Pitch Conveyor Chains",

  // Engineered Class Chains
  "engineered chain":                "Engineered Class Chains",
  "engineered chains":               "Engineered Class Chains",
  "engineered class chain":          "Engineered Class Chains",
  "engineered class chains":         "Engineered Class Chains",
  "engineered_class":                "Engineered Class Chains",
  "ss class chain":                  "Engineered Class Chains",
  "msr class chain":                 "Engineered Class Chains",

  // Welded Steel Chains
  "welded steel chain":              "Welded Steel Chains",
  "welded steel chains":             "Welded Steel Chains",
  "welded_steel":                    "Welded Steel Chains",
  "mill chain":                      "Welded Steel Chains",
  "wh chain":                        "Welded Steel Chains",

  // Steel Pintle Chains
  "steel pintle chain":              "Steel Pintle Chains",
  "steel pintle chains":             "Steel Pintle Chains",
  "pintle chain":                    "Steel Pintle Chains",
  "steel_pintle":                    "Steel Pintle Chains",

  // Steel Bushed Chains
  "steel bushed chain":              "Steel Bushed Chains",
  "steel bushed chains":             "Steel Bushed Chains",
  "bushed chain":                    "Steel Bushed Chains",
  "steel_bushed":                    "Steel Bushed Chains",

  // Agricultural Conveyor Chains
  "agricultural chain":              "Agricultural Conveyor Chains",
  "agricultural conveyor chain":     "Agricultural Conveyor Chains",
  "agricultural conveyor chains":    "Agricultural Conveyor Chains",
  "agricultural_conveyor":           "Agricultural Conveyor Chains",
  "ca series chain":                 "Agricultural Conveyor Chains",

  // SharpTop Chains
  "sharptop chain":                  "SharpTop Chains",
  "sharptop chains":                 "SharpTop Chains",
  "sharp top chain":                 "SharpTop Chains",
  "sharptop":                        "SharpTop Chains",

  // Forged Chains
  "forged chain":                    "Forged Chains",
  "forged chains":                   "Forged Chains",
  "forged":                          "Forged Chains",

  // Drop Forged Rivetless Chains
  "drop forged rivetless chain":     "Drop Forged Rivetless Chains",
  "drop forged rivetless chains":    "Drop Forged Rivetless Chains",
  "rivetless chain":                 "Drop Forged Rivetless Chains",
  "drop_forged_rivetless":           "Drop Forged Rivetless Chains",

  // Overhead Conveyor Chains
  "overhead conveyor chain":         "Overhead Conveyor Chains",
  "overhead conveyor chains":        "Overhead Conveyor Chains",
  "overhead_conveyor":               "Overhead Conveyor Chains",

  // Drag / Scraper Chains
  "drag chain":                      "Drag / Scraper Chains",
  "scraper chain":                   "Drag / Scraper Chains",
  "drag scraper chain":              "Drag / Scraper Chains",
  "drag / scraper chains":           "Drag / Scraper Chains",
  "drag_scraper":                    "Drag / Scraper Chains",

  // Bucket Elevator Chains
  "bucket elevator chain":           "Bucket Elevator Chains",
  "bucket elevator chains":          "Bucket Elevator Chains",
  "elevator chain":                  "Bucket Elevator Chains",
  "bucket_elevator":                 "Bucket Elevator Chains",

  // Leaf Chains
  "leaf chain":                      "Leaf Chains",
  "leaf chains":                     "Leaf Chains",
  "leaf_chain":                      "Leaf Chains",

  // Specialty / Custom Chains
  "specialty chain":                 "Specialty / Custom Chains",
  "specialty / custom chains":       "Specialty / Custom Chains",
  "specialty/custom chains":         "Specialty / Custom Chains",
  "specialty_custom":                "Specialty / Custom Chains",
  "custom chain":                    "Specialty / Custom Chains",
};

/**
 * Normalize any imported chain_family value to the canonical DB label.
 * e.g. "ANSI Roller Chain" → "Performance Roller Chains"
 * Returns the input unchanged if no match found (for unknown families).
 */
export function normalizeChainFamily(rawValue) {
  if (!rawValue) return rawValue;
  const key = rawValue.trim().toLowerCase();
  // Direct alias lookup
  if (ALIAS_TO_CANONICAL_LABEL[key]) return ALIAS_TO_CANONICAL_LABEL[key];
  // Direct label match (already canonical)
  const canonical = CHAIN_FAMILIES.find(f => f.label.toLowerCase() === key);
  if (canonical) return canonical.label;
  // Return original if unknown
  return rawValue;
}

/**
 * Given a family KEY (e.g. "performance_roller"), return the canonical label
 * used in the DB (e.g. "Performance Roller Chains").
 */
export function familyKeyToLabel(key) {
  return FAMILY_KEY_TO_LABEL[key] || key;
}

/**
 * Given a canonical label (e.g. "Performance Roller Chains"), return the family key
 * used internally (e.g. "performance_roller").
 */
export function familyLabelToKey(label) {
  if (!label) return null;
  return FAMILY_LABEL_TO_KEY[label.toLowerCase().trim()] || null;
}