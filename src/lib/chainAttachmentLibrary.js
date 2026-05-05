/**
 * chainAttachmentLibrary.js
 *
 * Structured attachment engine for the normalized chain procurement platform.
 *
 * ARCHITECTURE RULES:
 * - Each attachment has a unique code (e.g. "A1", "K2", "SA2", "WK1")
 * - Attachments are not chain-specific in the library — compatibility is declared on the chain
 * - Attachment types follow ANSI B29.1 naming conventions
 * - Welded / engineered attachments use WA-, ENG-, DFR-, PC- prefixes
 * - Images: reference source URLs or use a family placeholder
 * - Do NOT duplicate attachment codes
 *
 * ATTACHMENT TYPE TAXONOMY:
 * - K  = Extended Pin (one or both sides, bent or straight)
 * - A  = Bent Tab (standard K attachment with bent lug)
 * - SA = Special A (extended plate, one side)
 * - W  = Wide Contour (oversize outer plate, one or both sides)
 * - HK = Hollow Pin Extended (hollow + attachment combined)
 * - WA = Welded Attachment (for welded steel chain)
 * - DFR = Drop Forged Rivetless attachment
 * - PC  = Pintle Chain attachment
 * - ENG = Engineered class attachment
 */

export const ATTACHMENT_LIBRARY = {

  // ══════════════════════════════════════════════════════════════════
  // STANDARD ANSI ROLLER CHAIN ATTACHMENTS (K, A, SA, W, HK)
  // These apply to chains #35, #40, #50, #60, #80, #100, #120, #160
  // and their heavy/double-pitch variants.
  // ══════════════════════════════════════════════════════════════════

  "A1": {
    code: "A1",
    type: "K Attachment",
    ansi_code: "A1",
    description: "One-side extended pin with bent lug. Single side, upward tab.",
    side: "One Side",
    orientation: "Upward",
    compatible_families: ["performance_roller", "double_pitch_conveyor"],
    notes: "Standard A-series attachment. Available every pitch or every 2nd–6th pitch.",
    image_url: "https://chains.alliedlocke.com/ImgMedium/a1038.jpg",
    rfq_code: "A1",
  },

  "A2": {
    code: "A2",
    type: "K Attachment",
    ansi_code: "A2",
    description: "Both-side extended pins with bent lugs. Symmetrical tabs.",
    side: "Both Sides",
    orientation: "Upward",
    compatible_families: ["performance_roller", "double_pitch_conveyor"],
    notes: "Both inner plates extended. Spacing must be specified.",
    image_url: "https://chains.alliedlocke.com/ImgMedium/a2038.jpg",
    rfq_code: "A2",
  },

  "K1": {
    code: "K1",
    type: "K Attachment",
    ansi_code: "K1",
    description: "One-side extended pin — straight plate (no bent lug). Single side extended inner plate.",
    side: "One Side",
    orientation: "Straight",
    compatible_families: ["performance_roller", "double_pitch_conveyor", "engineered_class"],
    notes: "Extended pin (EP) — no lug. Used for cross-rod and slat attachments.",
    image_url: null,
    rfq_code: "K1",
  },

  "K2": {
    code: "K2",
    type: "K Attachment",
    ansi_code: "K2",
    description: "Both-side extended pins — straight plates. Extended inner plates both sides.",
    side: "Both Sides",
    orientation: "Straight",
    compatible_families: ["performance_roller", "double_pitch_conveyor", "engineered_class"],
    notes: "Both inner plates extended, no lugs. Used with cross-rods.",
    image_url: null,
    rfq_code: "K2",
  },

  "SA1": {
    code: "SA1",
    type: "SA Attachment",
    ansi_code: "SA1",
    description: "One-side special A attachment — oversize outer plate one side, upward hook.",
    side: "One Side",
    orientation: "Upward",
    compatible_families: ["performance_roller", "double_pitch_conveyor"],
    notes: "Larger plate than A1. Good for heavier loads.",
    image_url: null,
    rfq_code: "SA1",
  },

  "SA2": {
    code: "SA2",
    type: "SA Attachment",
    ansi_code: "SA2",
    description: "Both-side special A attachment — oversize outer plates both sides.",
    side: "Both Sides",
    orientation: "Upward",
    compatible_families: ["performance_roller", "double_pitch_conveyor"],
    notes: "Symmetrical SA plates. Good for carrying wide flights.",
    image_url: null,
    rfq_code: "SA2",
  },

  "HK1": {
    code: "HK1",
    type: "HK Attachment",
    ansi_code: "HK1",
    description: "Hollow pin extended — one side. Pin hollow for cross-rod or through-bolt.",
    side: "One Side",
    orientation: "Straight",
    compatible_families: ["performance_roller"],
    notes: "Hollow pin allows cross-rod insertion. Must specify hollow pin diameter.",
    image_url: null,
    rfq_code: "HK1",
  },

  "HK2": {
    code: "HK2",
    type: "HK Attachment",
    ansi_code: "HK2",
    description: "Hollow pin extended — both sides. Pins hollow for cross-rods or bolts.",
    side: "Both Sides",
    orientation: "Straight",
    compatible_families: ["performance_roller"],
    notes: "Hollow pins both sides. Standard for slat conveyors.",
    image_url: null,
    rfq_code: "HK2",
  },

  "HKA": {
    code: "HKA",
    type: "HK Attachment",
    ansi_code: "HKA",
    description: "Hollow pin with bent lug — one side. Combination of hollow pin and A1 lug.",
    side: "One Side",
    orientation: "Upward",
    compatible_families: ["performance_roller"],
    notes: "Used in specialty packaging and transfer applications.",
    image_url: null,
    rfq_code: "HKA",
  },

  "WA2": {
    code: "WA2",
    type: "W Attachment",
    ansi_code: "WA2",
    description: "Wide contour attachment — both sides. Oversize outer plates for wider carrying surface.",
    side: "Both Sides",
    orientation: "Straight",
    compatible_families: ["performance_roller", "double_pitch_conveyor"],
    notes: "Used where a wider plate base is needed. Good for flight carriers.",
    image_url: null,
    rfq_code: "WA2",
  },

  "WK2": {
    code: "WK2",
    type: "WK Attachment",
    ansi_code: "WK2",
    description: "Wide contour with extended pin — both sides. Combines WA outer plate with K extended pin.",
    side: "Both Sides",
    orientation: "Straight",
    compatible_families: ["performance_roller"],
    notes: "Oversize outer plate + extended inner pin both sides.",
    image_url: null,
    rfq_code: "WK2",
  },

  // ══════════════════════════════════════════════════════════════════
  // WELDED STEEL CHAIN ATTACHMENTS
  // For WH/WR/WD series welded steel chains
  // ══════════════════════════════════════════════════════════════════

  "WA-K1": {
    code: "WA-K1",
    type: "Welded Attachment",
    description: "Welded K-style attachment — one side. Welded tab on sidebar for flight bolting.",
    side: "One Side",
    orientation: "Upward",
    compatible_families: ["welded_steel"],
    notes: "Welded to sidebar before heat treatment. Specify bolt hole size.",
    image_url: null,
    rfq_code: "WA-K1",
  },

  "WA-K2": {
    code: "WA-K2",
    type: "Welded Attachment",
    description: "Welded K-style attachment — both sides. Symmetrical welded tabs.",
    side: "Both Sides",
    orientation: "Upward",
    compatible_families: ["welded_steel"],
    notes: "Both sidebars with welded tabs. Spacing specified at order.",
    image_url: null,
    rfq_code: "WA-K2",
  },

  "WA-A1": {
    code: "WA-A1",
    type: "Welded Attachment",
    description: "Welded A-style attachment — one side. Welded bent lug for flight attachment.",
    side: "One Side",
    orientation: "Upward",
    compatible_families: ["welded_steel"],
    notes: "Standard welded A lug for drag chain flights.",
    image_url: null,
    rfq_code: "WA-A1",
  },

  "WA-A2": {
    code: "WA-A2",
    type: "Welded Attachment",
    description: "Welded A-style attachment — both sides.",
    side: "Both Sides",
    orientation: "Upward",
    compatible_families: ["welded_steel"],
    notes: "Standard welded A lugs both sides.",
    image_url: null,
    rfq_code: "WA-A2",
  },

  "WA-SA1": {
    code: "WA-SA1",
    type: "Welded Attachment",
    description: "Welded special A attachment — extra-wide lug, one side. For heavy scraper flights.",
    side: "One Side",
    orientation: "Upward",
    compatible_families: ["welded_steel"],
    notes: "Extended SA-style welded lug. For heavy bulk material flights.",
    image_url: null,
    rfq_code: "WA-SA1",
  },

  // ══════════════════════════════════════════════════════════════════
  // ENGINEERED CLASS ATTACHMENTS
  // ══════════════════════════════════════════════════════════════════

  "ENG-A1": {
    code: "ENG-A1",
    type: "Engineered Attachment",
    description: "Single-side engineered A-style attachment for SS/MSR/MXS class chains.",
    side: "One Side",
    orientation: "Upward",
    compatible_families: ["engineered_class"],
    notes: "Bolt-on style. Compatible with SS and MSR class bushed chains.",
    image_url: null,
    rfq_code: "ENG-A1",
  },

  "ENG-K1": {
    code: "ENG-K1",
    type: "Engineered Attachment",
    description: "Single-side extended pin for engineered class chains.",
    side: "One Side",
    orientation: "Straight",
    compatible_families: ["engineered_class"],
    notes: "Extended barrel pin. Used with cross-bars and flights.",
    image_url: null,
    rfq_code: "ENG-K1",
  },

  "ENG-SA1": {
    code: "ENG-SA1",
    type: "Engineered Attachment",
    description: "Heavy SA-style engineered attachment. Wide base for large scraper flights.",
    side: "One Side",
    orientation: "Upward",
    compatible_families: ["engineered_class"],
    notes: "For drag flights and bucket carriers on MSR/MXS chains.",
    image_url: null,
    rfq_code: "ENG-SA1",
  },

  "ENG-FLIGHT": {
    code: "ENG-FLIGHT",
    type: "Engineered Attachment",
    description: "Full-width flight bracket for engineered drag chain. Spans full chain width.",
    side: "Both Sides",
    orientation: "Upward",
    compatible_families: ["engineered_class"],
    notes: "Bolted flight carrier. Specify flight width and material at order.",
    image_url: null,
    rfq_code: "ENG-FLIGHT",
  },

  // ══════════════════════════════════════════════════════════════════
  // DROP FORGED RIVETLESS ATTACHMENTS
  // ══════════════════════════════════════════════════════════════════

  "DFR-DOG": {
    code: "DFR-DOG",
    type: "DFR Attachment",
    description: "Pusher dog attachment for drop forged rivetless chain. Pivoting dog for pusher conveyors.",
    side: "Top",
    orientation: "Upward",
    compatible_families: ["drop_forged_rivetless"],
    notes: "Standard pusher dog for X348/X458 conveyor systems.",
    image_url: null,
    rfq_code: "DFR-DOG",
  },

  "DFR-PUSHER": {
    code: "DFR-PUSHER",
    type: "DFR Attachment",
    description: "Fixed pusher block for drop forged rivetless chain.",
    side: "Top",
    orientation: "Upward",
    compatible_families: ["drop_forged_rivetless"],
    notes: "Non-pivoting. Specify height and length at order.",
    image_url: null,
    rfq_code: "DFR-PUSHER",
  },

  "DFR-TROLLEY": {
    code: "DFR-TROLLEY",
    type: "DFR Attachment",
    description: "Trolley attachment / carrier link for overhead conveyor chain.",
    side: "Top",
    orientation: "Downward",
    compatible_families: ["drop_forged_rivetless", "overhead_conveyor"],
    notes: "For overhead monorail and inverted power-and-free conveyors.",
    image_url: null,
    rfq_code: "DFR-TROLLEY",
  },

  // ══════════════════════════════════════════════════════════════════
  // PINTLE CHAIN ATTACHMENTS
  // ══════════════════════════════════════════════════════════════════

  "PC-A1": {
    code: "PC-A1",
    type: "Pintle Chain Attachment",
    description: "A1-style attachment for pintle chains. Single-side lug.",
    side: "One Side",
    orientation: "Upward",
    compatible_families: ["steel_pintle"],
    notes: "For 667 and 7200 series pintle chains.",
    image_url: null,
    rfq_code: "PC-A1",
  },

  "PC-K1": {
    code: "PC-K1",
    type: "Pintle Chain Attachment",
    description: "K1-style extended pin for pintle chains. Single-side.",
    side: "One Side",
    orientation: "Straight",
    compatible_families: ["steel_pintle"],
    notes: "Extended pin for flight bolting on pintle chains.",
    image_url: null,
    rfq_code: "PC-K1",
  },

  "PC-SA1": {
    code: "PC-SA1",
    type: "Pintle Chain Attachment",
    description: "SA1 heavy attachment for pintle chains. Wide lug for heavy flights.",
    side: "One Side",
    orientation: "Upward",
    compatible_families: ["steel_pintle"],
    notes: "For heavy agricultural spreader flights.",
    image_url: null,
    rfq_code: "PC-SA1",
  },

  "PC-FLAP": {
    code: "PC-FLAP",
    type: "Pintle Chain Attachment",
    description: "Flap / spreader paddle attachment for pintle chains.",
    side: "One Side",
    orientation: "Upward",
    compatible_families: ["steel_pintle"],
    notes: "Used in spreader and manure handling systems.",
    image_url: null,
    rfq_code: "PC-FLAP",
  },

  // ══════════════════════════════════════════════════════════════════
  // AGRICULTURAL CHAIN ATTACHMENTS
  // ══════════════════════════════════════════════════════════════════

  "AGRI-A1": {
    code: "AGRI-A1",
    type: "Agricultural Attachment",
    description: "A1 attachment for CA series agricultural chains.",
    side: "One Side",
    orientation: "Upward",
    compatible_families: ["agricultural_conveyor"],
    notes: "Single-side bent lug for auger and conveyor flights.",
    image_url: null,
    rfq_code: "AGRI-A1",
  },

  "AGRI-K1": {
    code: "AGRI-K1",
    type: "Agricultural Attachment",
    description: "K1 extended pin for CA series agricultural chains.",
    side: "One Side",
    orientation: "Straight",
    compatible_families: ["agricultural_conveyor"],
    notes: "Extended pin for cross-rod attachments.",
    image_url: null,
    rfq_code: "AGRI-K1",
  },

};

// ─── Lookup helpers ────────────────────────────────────────────────────────────

/** Get attachment by code */
export function getAttachmentByCode(code) {
  return ATTACHMENT_LIBRARY[code] || null;
}

/** Get all attachments for a given chain family */
export function getAttachmentsForFamily(family_key) {
  return Object.values(ATTACHMENT_LIBRARY).filter(att =>
    att.compatible_families?.includes(family_key)
  );
}

/** Get attachment objects from a list of codes */
export function resolveAttachmentCodes(codes = []) {
  return codes.map(code => ATTACHMENT_LIBRARY[code] || { code, type: "Unknown", description: code }).filter(Boolean);
}

/** Get all attachment types as a set */
export function getAllAttachmentTypes() {
  return [...new Set(Object.values(ATTACHMENT_LIBRARY).map(a => a.type))];
}

export default ATTACHMENT_LIBRARY;