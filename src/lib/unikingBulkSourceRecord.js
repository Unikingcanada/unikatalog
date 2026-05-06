/**
 * unikingBulkSourceRecord.js
 *
 * Uniking Industrial Bulk Material Handling catalog — PRIMARY NORMALIZED BASELINE
 * for the Chains ecosystem (bulk material handling, engineered conveying, industrial).
 *
 * SOURCE:  https://unikingcanada.com/catalogs/uniking-industrial-bulk-material-catalog-industry-conveyor-chains-supplier-canada.pdf
 * DATE:    2026-05-06
 * ROLE:    PRIMARY BASELINE — defines preferred hierarchy, naming, images, and application grouping
 * SCOPE:   Chains ecosystem ONLY
 *
 * CATALOG SECTIONS:
 *   P4   Engineered Class Chain WITH Rollers
 *   P9   Engineered Class Chain WITHOUT Rollers
 *   P11  Engineered Class Chain Attachments
 *   P30  Drive Chains
 *   P32  Welded Steel Chain
 *   P39  Welded Steel Chain Attachments
 *   P49  Drag Chain Attachments
 *   P52  Forged Chains
 *   P60  Kiln Chains
 *
 * NORMALIZATION ROLE:
 *   - Uniking baseline = preferred hierarchy, naming, applications, image priority
 *   - Allied-Locke, Donghua, Rexnord, Tsubaki, etc. = supporting source layers
 *   - Cross-ref maintained: Rexnord ↔ Link-Belt ↔ Uniking normalized chain_id
 */

export const UK_BULK_SOURCE = {
  source_id: "uniking_bulk_baseline",
  manufacturer: "Uniking",
  full_name: "Uniking Industrial — Bulk Material Handling Catalog",
  source_type: "primary_normalized_baseline",
  trusted_source: true,
  priority: 0, // highest priority — primary baseline
  category_scope: "Chains",
  catalog_url: "https://unikingcanada.com/catalogs/uniking-industrial-bulk-material-catalog-industry-conveyor-chains-supplier-canada.pdf",
  catalog_title: "Uniking Industrial Bulk Material Catalog — Industry Conveyor Chains Supplier Canada",
  import_date: "2026-05-06",
  website: "https://unikingcanada.com",
  headquarters_phone: "514.886.5270",
  standards: ["ASME B29", "ASME B29.100", "ANSI B29.1", "Rexnord/Link-Belt interchangeable"],
  normalization_role: "primary_baseline",
  notes: "Uniking catalog defines the PREFERRED normalized product hierarchy. Rexnord and Link-Belt chain numbers are cross-referenced throughout and preserved as source_refs. Supporting manufacturers (Allied-Locke, Donghua, Tsubaki, Rexnord) map INTO this Uniking-normalized structure.",
};

// ─── Uniking Application Tags — from catalog application coverage ─────────────
export const UK_APPLICATION_TAGS = [
  "aggregate",
  "mining",
  "cement",
  "recycling",
  "grain_handling",
  "bulk_material",
  "forestry",
  "sawmill",
  "kiln",
  "elevator",
  "drag_conveyor",
  "scraper_conveyor",
  "heavy_industrial",
  "transfer_conveyor",
  "crusher_sampling",
  "clay_limestone",
];

// ─── Uniking → Normalized Chain Family Mapping ────────────────────────────────
export const UK_CATALOG_SECTIONS = {
  "engineered_class_with_rollers": {
    page: 4,
    normalized_family: "engineered_class",
    description: "Engineered class bushed roller chains — 1.654\" to 9\"+ pitch",
    cross_refs: ["Rexnord", "Link-Belt (RS/SS/ER/FR series)"],
  },
  "engineered_class_without_rollers": {
    page: 9,
    normalized_family: "engineered_class",
    description: "Engineered class bushed chains without rollers",
    cross_refs: ["Rexnord", "Link-Belt"],
  },
  "engineered_attachments": {
    page: 11,
    normalized_family: "engineered_class",
    description: "Full attachment library for engineered class chains",
  },
  "drive_chains": {
    page: 30,
    normalized_family: "performance_roller",
    description: "Standard ANSI drive chains",
  },
  "welded_steel_chain": {
    page: 32,
    normalized_family: "welded_steel",
    description: "WH/WR welded steel mill chains",
  },
  "welded_steel_attachments": {
    page: 39,
    normalized_family: "welded_steel",
    description: "WH/WR attachment library",
  },
  "drag_chain_attachments": {
    page: 49,
    normalized_family: "drag_scraper",
    description: "Drag and scraper chain attachments",
  },
  "forged_chains": {
    page: 52,
    normalized_family: "forged_chains",
    description: "Drop forged rivetless and forged link chains",
  },
  "kiln_chains": {
    page: 60,
    normalized_family: "specialty_custom",
    description: "Kiln chains for cement, aggregate, and thermal processing",
  },
};

// ─── Uniking Property Definitions ─────────────────────────────────────────────
// Heat treatment/material codes used in Uniking/Rexnord catalog
export const UK_PROPERTY_CODES = {
  TH:   "Thru-Hardened",
  CARB: "Carburized",
  CIH:  "Circumferentially Induction Hardened",
  SIH:  "Selectively Induction Hardened",
  WI:   "White Iron",
};

export default UK_BULK_SOURCE;