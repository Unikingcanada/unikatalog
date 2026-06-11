/**
 * catalogExtractionSchema.js
 *
 * THE EXTRACTION CONTRACT.
 *
 * One canonical shape that every catalog (PDF, URL, spreadsheet) is extracted
 * INTO — whether the extractor is a human, an agent (Claude), or the in-app
 * InvokeLLM auto-extractor. Because everything lands in this shape, the
 * downstream normalizer + Import Center pipeline never have to care where the
 * data came from.
 *
 * Design rules baked into the contract:
 *  1. BRAND-FREE CATALOG. The brand is captured ONLY in `source_brand` /
 *     `source_refs`. It must never appear in display_name / description /
 *     chain_number. The normalizer enforces this and flags violations.
 *  2. APPLICATION-FIRST FAMILIES. Every chain is assigned a family by what it
 *     DOES, not who made it. Use a CHAIN_FAMILIES key or a label the
 *     chainFamilyNormalizer can resolve.
 *  3. NO INVENTED NUMBERS. Engineering ratings (tensile/working load),
 *     dimensions and pitches must come from the source. Leave a field null
 *     rather than guess — this is a procurement catalog.
 *  4. RELATED PARTS TRAVEL WITH THE CHAIN. Attachments, sprockets and
 *     pins/links are nested on the chain so one extraction yields the whole
 *     family of related records.
 */

/** Human-readable description of every field, used as the extraction brief. */
export const CANONICAL_CHAIN_FIELDS = {
  // ── Identity ──
  chain_number: "The base chain designation as printed, brand stripped (e.g. '40', 'X458', 'WH124', '667X'). REQUIRED.",
  family: "Application family — a CHAIN_FAMILIES key (e.g. 'drop_forged_rivetless') or a label the normalizer resolves (e.g. 'Drop Forged Rivetless Chains'). REQUIRED.",
  display_name: "Brand-free customer label (e.g. 'X458 Drop Forged Rivetless Chain'). No brand names.",
  standard: "Governing standard if stated (e.g. 'ASME B29.100', 'ANSI B29.1', 'ISO 606').",
  description: "Brand-free 1–2 sentence description of use.",

  // ── Dimensions / specs (strings, units explicit) ──
  pitch_in: "Pitch in inches (e.g. '4.000'). REQUIRED when stated.",
  pitch_mm: "Pitch in mm (e.g. '101.60').",
  specs: "Object of additional measured dimensions: roller_dia_in, pin_dia_in, barrel_dia_in, sidebar_height_in, plate_height_in, width_in, weight_lbs_per_ft, etc. Only measured values.",

  // ── Ratings ──
  avg_ultimate_lbs: "Ultimate/breaking strength in lbs (number-as-string). From source only.",
  max_working_load_lbs: "Allowable working load in lbs. From source only.",
  performance_tiers: "Optional array of { tier, tensile_strength_lbs, working_load_lbs, source, notes } when a source lists multiple grades.",

  // ── Options ──
  materials_available: "Array of material/coating keys (carbon_steel, stainless_304, stainless_316, high_temp, zinc_plated, …).",
  options_upgrades: "Array of upgrade strings (heavy series, induction-hardened, etc.).",

  // ── Related parts (nested) ──
  attachments: "Array of { code, type, description, side, spacing, image_url } available on this chain.",
  sprockets: "Array of { code, teeth, bore, material, image_url } or a sprocket_series string.",
  pins_links: "Array of { code, type, description, image_url } (connecting links, offset links, pins).",

  // ── Media ──
  image_url: "Direct URL to the chain's product image/figure if the source provides one.",
  diagram_url: "Direct URL to a dimensioned drawing if provided.",
  catalog_url: "URL or PDF the data was extracted from (provenance).",
  catalog_page: "Page/section reference within the source.",

  // ── Sourcing (the ONLY place a brand may appear) ──
  source_brand: "The manufacturer/catalog this record came from (e.g. '4B', 'Connexus', 'Kobo'). REQUIRED.",
  source_code: "The brand's own part number for this chain (e.g. 4B's catalog code), if different from chain_number.",
  confidence: "'Confirmed' when taken verbatim from the source; 'Needs Review' when inferred/uncertain.",
};

/**
 * JSON schema for base44 InvokeLLM `response_json_schema` — constrains the
 * in-app auto-extractor to emit exactly this contract.
 */
export const EXTRACTION_JSON_SCHEMA = {
  type: "object",
  properties: {
    source_brand: { type: "string" },
    catalog_url: { type: "string" },
    chains: {
      type: "array",
      items: {
        type: "object",
        properties: {
          chain_number: { type: "string" },
          family: { type: "string" },
          display_name: { type: "string" },
          standard: { type: "string" },
          description: { type: "string" },
          pitch_in: { type: "string" },
          pitch_mm: { type: "string" },
          avg_ultimate_lbs: { type: "string" },
          max_working_load_lbs: { type: "string" },
          specs: { type: "object", additionalProperties: true },
          materials_available: { type: "array", items: { type: "string" } },
          options_upgrades: { type: "array", items: { type: "string" } },
          attachments: {
            type: "array",
            items: {
              type: "object",
              properties: {
                code: { type: "string" }, type: { type: "string" },
                description: { type: "string" }, side: { type: "string" },
                spacing: { type: "string" }, image_url: { type: "string" },
              },
            },
          },
          sprockets: {
            type: "array",
            items: {
              type: "object",
              properties: {
                code: { type: "string" }, teeth: { type: "string" },
                bore: { type: "string" }, material: { type: "string" },
                image_url: { type: "string" },
              },
            },
          },
          pins_links: {
            type: "array",
            items: {
              type: "object",
              properties: {
                code: { type: "string" }, type: { type: "string" },
                description: { type: "string" }, image_url: { type: "string" },
              },
            },
          },
          image_url: { type: "string" },
          diagram_url: { type: "string" },
          catalog_page: { type: "string" },
          source_code: { type: "string" },
          confidence: { type: "string", enum: ["Confirmed", "Needs Review"] },
        },
        required: ["chain_number", "family", "source_brand"],
      },
    },
  },
  required: ["source_brand", "chains"],
};

/** The brief handed to any extractor (LLM or human/agent). */
export const EXTRACTION_PROMPT_GUIDE = `You are extracting an industrial conveyor-chain catalog into UniKatalog's
brand-free normalized schema.

Rules:
- Output every distinct chain you find as one object in "chains".
- BRAND-FREE: put the manufacturer ONLY in source_brand / source_code. Never
  put the brand in display_name, description, or chain_number.
- Assign "family" by application (e.g. drop_forged_rivetless, welded_steel,
  performance_roller, bucket_elevator), not by brand.
- Copy ratings, pitches and dimensions VERBATIM from the source. If a value is
  not stated, omit it — never invent engineering data.
- Nest attachments, sprockets and pins/links that the source lists for a chain.
- Capture any image_url / diagram_url the source provides.
- Set confidence "Confirmed" for verbatim values, "Needs Review" for anything
  inferred.`;

/** A worked example so extractors have a concrete target. */
export const EXAMPLE_EXTRACTION = {
  source_brand: "Allied-Locke",
  catalog_url: "https://chains.alliedlocke.com/item/rivetless-drop-forged-chains/...",
  chains: [
    {
      chain_number: "X458",
      family: "drop_forged_rivetless",
      display_name: "X458 Drop Forged Rivetless Chain",
      standard: "ASME B29.100",
      description: "4-inch pitch drop forged rivetless chain for overhead and power-and-free conveyors.",
      pitch_in: "4.000",
      pitch_mm: "101.60",
      avg_ultimate_lbs: "68000",
      max_working_load_lbs: "13600",
      specs: { pin_dia_in: "0.625", weight_lbs_per_ft: "5.6" },
      materials_available: ["carbon_steel", "high_temp"],
      attachments: [
        { code: "DFR-DOG", type: "Drive Dog", description: "Pusher dog attachment" },
        { code: "DFR-TROLLEY", type: "Trolley", description: "Trolley bracket" },
      ],
      sprockets: [{ code: "X458", teeth: "6", material: "cast_steel" }],
      pins_links: [{ code: "X458-CP", type: "Connecting Pin", description: "Cottered connecting pin" }],
      image_url: "https://chains.alliedlocke.com/ImgMedium/X458.jpg",
      catalog_page: "Rivetless Drop Forged",
      source_code: "X458",
      confidence: "Confirmed",
    },
  ],
};

const ALLOWED_CONFIDENCE = ["Confirmed", "Needs Review"];

/**
 * Validate a single extracted chain object against the contract.
 * @returns {{ valid: boolean, errors: string[], warnings: string[] }}
 */
export function validateExtractedChain(obj, sourceBrand = null) {
  const errors = [];
  const warnings = [];
  const brand = (obj.source_brand || sourceBrand || "").trim();

  if (!obj.chain_number || !String(obj.chain_number).trim()) errors.push("Missing chain_number");
  if (!obj.family || !String(obj.family).trim()) errors.push("Missing family");
  if (!brand) errors.push("Missing source_brand (brand must be recorded for equivalency)");

  if (!obj.pitch_in && !obj.specs?.pitch_in) warnings.push("No pitch — chain will lack a key spec");
  if (!obj.avg_ultimate_lbs && !obj.specs?.avg_ultimate_lbs && !(obj.performance_tiers?.length)) {
    warnings.push("No ratings — review before customer-facing");
  }
  if (obj.confidence && !ALLOWED_CONFIDENCE.includes(obj.confidence)) {
    warnings.push(`Unknown confidence '${obj.confidence}' — defaulting to Needs Review`);
  }

  // Brand-leak guard: brand must not appear in customer-facing fields.
  if (brand) {
    const bL = brand.toLowerCase();
    for (const field of ["display_name", "description", "chain_number"]) {
      const v = (obj[field] || "").toString().toLowerCase();
      if (v.includes(bL)) errors.push(`Brand '${brand}' leaked into ${field} — catalog must be brand-free`);
    }
  }

  return { valid: errors.length === 0, errors, warnings };
}

export default {
  CANONICAL_CHAIN_FIELDS,
  EXTRACTION_JSON_SCHEMA,
  EXTRACTION_PROMPT_GUIDE,
  EXAMPLE_EXTRACTION,
  validateExtractedChain,
};
