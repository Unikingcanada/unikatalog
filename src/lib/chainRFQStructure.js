/**
 * chainRFQStructure.js
 *
 * Normalized RFQ structure and helpers for the chain procurement platform.
 *
 * PURPOSE:
 * - Define the canonical RFQ line item structure for chains
 * - Provide builders, validators, and formatters for RFQ items
 * - Support all chain types: roller, welded, pintle, engineered, leaf, etc.
 * - Keep RFQ data clean and structured for backend processing
 *
 * RFQ LINE ITEM SCHEMA:
 * {
 *   rfq_id:           string   — unique: "rfq_" + chain_id + "_" + timestamp
 *   _source:          string   — "chain_configurator" | "chain_catalog" | "manual"
 *   chain_id:         string   — normalized chain_id (e.g. "ANSI-80")
 *   chain_number:     string   — display number (e.g. "80")
 *   display_name:     string   — full name (e.g. "ANSI 80 Roller Chain")
 *   chain_family:     string   — family key (e.g. "performance_roller")
 *   standard:         string   — e.g. "ANSI B29.1"
 *   pitch_in:         string   — e.g. "1.000"
 *   material:         string   — material key (e.g. "carbon_steel")
 *   performance_tier: string   — "standard" | "performance" | "premium"
 *   length:           string   — numeric value
 *   length_unit:      string   — "ft" | "m" | "links" | "strands" | "sets"
 *   quantity:         number
 *   strands:          number   — 1, 2, 3, 4 (for multi-strand roller chain)
 *   attachments:      array    — [{ code, spacing, side, qty_per_link }]
 *   connecting_links: object   — { required: bool, qty, type }
 *   offset_links:     object   — { required: bool, qty }
 *   sprocket_req:     array    — [{ teeth, bore, bore_style, material, qty, notes }]
 *   preferred_brand:  string   — manufacturer preference (optional)
 *   open_to_equiv:    boolean  — accept substitutes
 *   application:      string   — application / industry description
 *   operating_conditions: string — temp, environment, notes
 *   notes:            string   — freeform notes
 *   drawing_url:      string   — uploaded drawing URL
 *   image_url:        string   — chain image for display
 *   needs_review:     boolean  — flagged for engineering review
 *   created_date:     string   — ISO timestamp
 * }
 */

import { MATERIAL_OPTIONS, PERFORMANCE_TIERS, LENGTH_UNITS } from "./chainFamilyData.js";
import { getChainById } from "./chainNormalizedDictionary.js";
import { getEquivalentsForChain } from "./chainEquivalencyEngine.js";

// ─── RFQ line item builder ────────────────────────────────────────────────────

/**
 * Build a normalized RFQ line item from a configured chain.
 * @param {object} config — Output of the chain configurator or catalog selection
 * @returns {object} Normalized RFQ line item
 */
export function buildChainRFQItem(config = {}) {
  const chain = config.chain_id ? getChainById(config.chain_id) : null;

  return {
    rfq_id: "rfq_" + (config.chain_id || "chain") + "_" + Date.now(),
    _source: config._source || "chain_catalog",

    // Chain identification
    chain_id: config.chain_id || null,
    chain_number: config.chain_number || chain?.chain_number || "",
    display_name: config.display_name || chain?.display_name || config.chain_number || "",
    chain_family: config.chain_family || chain?.chain_family || "",
    standard: config.standard || chain?.standard || "",
    pitch_in: config.pitch_in || chain?.pitch_in || "",

    // Material and performance
    material: config.material || "carbon_steel",
    performance_tier: config.performance_tier || "standard",

    // Quantity / length
    length: config.length || "",
    length_unit: config.length_unit || "ft",
    quantity: config.quantity || 1,
    strands: config.strands || 1,

    // Components
    attachments: config.attachments || [],
    connecting_links: config.connecting_links || { required: null, qty: 0, type: "cotter" },
    offset_links: config.offset_links || { required: null, qty: 0 },
    sprocket_req: config.sprocket_req || [],

    // Sourcing
    preferred_brand: config.preferred_brand || "",
    open_to_equiv: config.open_to_equiv !== undefined ? config.open_to_equiv : true,

    // Application
    application: config.application || "",
    operating_conditions: config.operating_conditions || "",

    // Notes and media
    notes: config.notes || "",
    drawing_url: config.drawing_url || "",
    image_url: config.image_url || chain?.image_url || "",

    // Flags
    needs_review: config.needs_review || false,
    created_date: new Date().toISOString(),
  };
}

/**
 * Format an RFQ line item into a human-readable summary string.
 * Used for RFQ cart display and email/print output.
 */
export function formatRFQLineSummary(item) {
  const parts = [];

  // Chain ID and name
  if (item.display_name) parts.push(item.display_name);
  else if (item.chain_number) parts.push(item.chain_number);

  // Material
  if (item.material && item.material !== "carbon_steel") {
    const mat = MATERIAL_OPTIONS.find(m => m.key === item.material);
    if (mat) parts.push(mat.label);
  }

  // Performance tier
  if (item.performance_tier && item.performance_tier !== "standard") {
    const tier = PERFORMANCE_TIERS.find(t => t.key === item.performance_tier);
    if (tier) parts.push(tier.label);
  }

  // Strands
  if (item.strands > 1) parts.push(`${item.strands}-Strand`);

  // Attachments
  if (item.attachments?.length > 0) {
    const attCodes = item.attachments.map(a => a.code || a).join(", ");
    parts.push(`with ${attCodes} Attachments`);
    if (item.attachments[0]?.spacing) parts.push(`@ ${item.attachments[0].spacing}`);
  }

  // Sprockets
  if (item.sprocket_req?.length > 0) {
    const spStr = item.sprocket_req.map(s => `${s.teeth || "?"}T Sprocket`).join(", ");
    parts.push(`+ ${spStr}`);
  }

  // Connecting links
  if (item.connecting_links?.required === true && item.connecting_links?.qty > 0) {
    parts.push(`+ ${item.connecting_links.qty} Connecting Links`);
  }

  // Length + quantity
  if (item.length) parts.push(`${item.length} ${item.length_unit}`);
  parts.push(`Qty ${item.quantity}`);

  return parts.join(" – ");
}

/**
 * Validate an RFQ line item. Returns { valid: bool, errors: string[] }
 */
export function validateRFQItem(item) {
  const errors = [];

  if (!item.chain_id && !item.chain_number && !item.display_name) {
    errors.push("Chain identification is missing (chain_id or chain_number required)");
  }
  if (!item.quantity || item.quantity < 1) {
    errors.push("Quantity must be at least 1");
  }
  if (item.length && isNaN(parseFloat(item.length))) {
    errors.push("Length must be a valid number");
  }
  if (item.strands && (item.strands < 1 || item.strands > 6)) {
    errors.push("Strands must be between 1 and 6");
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Enrich an RFQ item with equivalency data for procurement.
 * Returns the item with a sourcing_options array added.
 */
export function enrichWithEquivalencies(item) {
  if (!item.chain_id) return { ...item, sourcing_options: [] };
  const equivalents = getEquivalentsForChain(item.chain_id);
  const confirmed = equivalents.filter(r => r.confidence === "Confirmed");

  let sourcing = confirmed;
  if (item.preferred_brand) {
    // Move preferred brand to top
    sourcing = [
      ...confirmed.filter(r => r.manufacturer.toLowerCase().includes(item.preferred_brand.toLowerCase())),
      ...confirmed.filter(r => !r.manufacturer.toLowerCase().includes(item.preferred_brand.toLowerCase())),
    ];
  }
  if (!item.open_to_equiv && item.preferred_brand) {
    sourcing = sourcing.filter(r => r.manufacturer.toLowerCase().includes(item.preferred_brand.toLowerCase()));
  }

  return {
    ...item,
    sourcing_options: sourcing.slice(0, 4),
    sourcing_note: item.open_to_equiv
      ? "Open to equivalent substitute if specified brand is unavailable."
      : "Specified manufacturer only — no substitutions.",
  };
}

// ─── RFQ cart helpers (localStorage) ─────────────────────────────────────────

const CART_KEY = "uniking_rfq_cart";

export function getChainRFQCart() {
  try { return JSON.parse(localStorage.getItem(CART_KEY) || "[]"); } catch { return []; }
}

export function addChainRFQItem(config) {
  const item = buildChainRFQItem(config);
  const { valid, errors } = validateRFQItem(item);
  if (!valid) {
    console.warn("[ChainRFQ] Invalid item:", errors);
    return { success: false, errors };
  }
  const cart = getChainRFQCart();
  // De-duplicate: same chain_id + material + tier = update qty instead
  const existingIdx = cart.findIndex(i =>
    i.chain_id === item.chain_id &&
    i.material === item.material &&
    i.performance_tier === item.performance_tier &&
    JSON.stringify(i.attachments) === JSON.stringify(item.attachments)
  );
  if (existingIdx >= 0) {
    cart[existingIdx].quantity = (cart[existingIdx].quantity || 1) + (item.quantity || 1);
    cart[existingIdx].notes = [cart[existingIdx].notes, item.notes].filter(Boolean).join(" | ");
  } else {
    cart.push({
      cartId: item.rfq_id,
      id: item.rfq_id,
      ...item,
      series: item.display_name || item.chain_number,
      type: item.chain_family,
    });
  }
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  window.dispatchEvent(new Event("rfq_cart_updated"));
  return { success: true, item };
}

export function removeChainRFQItem(rfq_id) {
  const cart = getChainRFQCart().filter(i => i.rfq_id !== rfq_id && i.cartId !== rfq_id && i.id !== rfq_id);
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  window.dispatchEvent(new Event("rfq_cart_updated"));
}

// ─── Attachment request structure ─────────────────────────────────────────────

/**
 * Build a structured attachment request for an RFQ line item.
 */
export function buildAttachmentRequest(code, spacing, side, qtyPerLink = 1) {
  return {
    code,
    spacing: spacing || null,
    side: side || null,
    qty_per_link: qtyPerLink,
  };
}

/**
 * Build a structured sprocket request for an RFQ line item.
 */
export function buildSprocketRequest({ teeth, bore, bore_style, material, style, qty = 1, notes = "" }) {
  return { teeth, bore, bore_style, material: material || "steel", style, qty, notes };
}

export default {
  buildChainRFQItem,
  formatRFQLineSummary,
  validateRFQItem,
  enrichWithEquivalencies,
  addChainRFQItem,
  getChainRFQCart,
  removeChainRFQItem,
  buildAttachmentRequest,
  buildSprocketRequest,
};