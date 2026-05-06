/**
 * chainPinsLinksLibrary.js
 *
 * Normalized library of pins, connecting links, offset links, and master links
 * for use across the chain procurement platform.
 *
 * RULES:
 * - One entry per normalized part type + chain series
 * - Manufacturer equivalencies in source_refs[]
 * - Do NOT duplicate geometrically identical parts
 * - All structural objects — no plain text
 */

export const PINS_LINKS_LIBRARY = [

  // ══════════════════════════════════════════════════════════════════
  // ANSI ROLLER CHAIN — Connecting Links
  // ══════════════════════════════════════════════════════════════════

  {
    code: "CL-25", type: "Connecting Link", compatible_chains: ["ANSI-25"],
    description: "ANSI 25 Connecting Link — cotter pin style",
    image_url: "",
    source_refs: [
      { manufacturer: "Allied-Locke", code: "25CL", confidence: "Confirmed" },
      { manufacturer: "Tsubaki", code: "25CL", confidence: "Confirmed" },
    ],
  },
  {
    code: "CL-35", type: "Connecting Link", compatible_chains: ["ANSI-35"],
    description: "ANSI 35 Connecting Link — cotter pin style",
    image_url: "",
    source_refs: [
      { manufacturer: "Allied-Locke", code: "35CL", confidence: "Confirmed" },
      { manufacturer: "Tsubaki", code: "35CL", confidence: "Confirmed" },
    ],
  },
  {
    code: "CL-40", type: "Connecting Link", compatible_chains: ["ANSI-40", "ANSI-40H"],
    description: "ANSI 40 Connecting Link — cotter pin or rivet style",
    image_url: "",
    source_refs: [
      { manufacturer: "Allied-Locke", code: "40CL", confidence: "Confirmed" },
      { manufacturer: "Tsubaki", code: "40CL", confidence: "Confirmed" },
      { manufacturer: "Donghua", code: "40CL", confidence: "Confirmed" },
    ],
  },
  {
    code: "CL-50", type: "Connecting Link", compatible_chains: ["ANSI-50", "ANSI-50H"],
    description: "ANSI 50 Connecting Link",
    image_url: "",
    source_refs: [
      { manufacturer: "Allied-Locke", code: "50CL", confidence: "Confirmed" },
      { manufacturer: "Tsubaki", code: "50CL", confidence: "Confirmed" },
    ],
  },
  {
    code: "CL-60", type: "Connecting Link", compatible_chains: ["ANSI-60", "ANSI-60H"],
    description: "ANSI 60 Connecting Link — cotter pin or rivet style",
    image_url: "",
    source_refs: [
      { manufacturer: "Allied-Locke", code: "60CL", confidence: "Confirmed" },
      { manufacturer: "Tsubaki", code: "60CL", confidence: "Confirmed" },
      { manufacturer: "Donghua", code: "60CL", confidence: "Confirmed" },
    ],
  },
  {
    code: "CL-80", type: "Connecting Link", compatible_chains: ["ANSI-80", "ANSI-80H"],
    description: "ANSI 80 Connecting Link — cotter pin or rivet style",
    image_url: "",
    source_refs: [
      { manufacturer: "Allied-Locke", code: "80CL", confidence: "Confirmed" },
      { manufacturer: "Tsubaki", code: "80CL", confidence: "Confirmed" },
      { manufacturer: "Donghua", code: "80CL", confidence: "Confirmed" },
    ],
  },
  {
    code: "CL-100", type: "Connecting Link", compatible_chains: ["ANSI-100", "ANSI-100H"],
    description: "ANSI 100 Connecting Link",
    image_url: "",
    source_refs: [
      { manufacturer: "Allied-Locke", code: "100CL", confidence: "Confirmed" },
      { manufacturer: "Tsubaki", code: "100CL", confidence: "Confirmed" },
    ],
  },
  {
    code: "CL-120", type: "Connecting Link", compatible_chains: ["ANSI-120", "ANSI-120H"],
    description: "ANSI 120 Connecting Link",
    image_url: "",
    source_refs: [
      { manufacturer: "Allied-Locke", code: "120CL", confidence: "Confirmed" },
    ],
  },
  {
    code: "CL-140", type: "Connecting Link", compatible_chains: ["ANSI-140", "ANSI-140H"],
    description: "ANSI 140 Connecting Link",
    image_url: "",
    source_refs: [
      { manufacturer: "Allied-Locke", code: "140CL", confidence: "Confirmed" },
    ],
  },
  {
    code: "CL-160", type: "Connecting Link", compatible_chains: ["ANSI-160", "ANSI-160H"],
    description: "ANSI 160 Connecting Link",
    image_url: "",
    source_refs: [
      { manufacturer: "Allied-Locke", code: "160CL", confidence: "Confirmed" },
    ],
  },

  // ══════════════════════════════════════════════════════════════════
  // ANSI ROLLER CHAIN — Offset Links
  // ══════════════════════════════════════════════════════════════════

  {
    code: "OL-40", type: "Offset Link", compatible_chains: ["ANSI-40", "ANSI-40H"],
    description: "ANSI 40 Offset Link (half link) for odd-number chain lengths",
    image_url: "",
    source_refs: [
      { manufacturer: "Allied-Locke", code: "40OL", confidence: "Confirmed" },
      { manufacturer: "Tsubaki", code: "40OL", confidence: "Confirmed" },
    ],
  },
  {
    code: "OL-60", type: "Offset Link", compatible_chains: ["ANSI-60", "ANSI-60H"],
    description: "ANSI 60 Offset Link for odd-number chain lengths",
    image_url: "",
    source_refs: [
      { manufacturer: "Allied-Locke", code: "60OL", confidence: "Confirmed" },
    ],
  },
  {
    code: "OL-80", type: "Offset Link", compatible_chains: ["ANSI-80", "ANSI-80H"],
    description: "ANSI 80 Offset Link for odd-number chain lengths",
    image_url: "",
    source_refs: [
      { manufacturer: "Allied-Locke", code: "80OL", confidence: "Confirmed" },
    ],
  },
  {
    code: "OL-100", type: "Offset Link", compatible_chains: ["ANSI-100", "ANSI-100H"],
    description: "ANSI 100 Offset Link",
    image_url: "",
    source_refs: [
      { manufacturer: "Allied-Locke", code: "100OL", confidence: "Confirmed" },
    ],
  },

  // ══════════════════════════════════════════════════════════════════
  // DOUBLE PITCH — Connecting Links
  // ══════════════════════════════════════════════════════════════════

  {
    code: "CL-C2040", type: "Connecting Link", compatible_chains: ["C2040"],
    description: "C2040 Double Pitch Connecting Link",
    image_url: "",
    source_refs: [{ manufacturer: "Allied-Locke", code: "C2040CL", confidence: "Confirmed" }],
  },
  {
    code: "CL-C2060", type: "Connecting Link", compatible_chains: ["C2060", "C2060H"],
    description: "C2060/C2060H Double Pitch Connecting Link",
    image_url: "",
    source_refs: [{ manufacturer: "Allied-Locke", code: "C2060CL", confidence: "Confirmed" }],
  },
  {
    code: "CL-C2080", type: "Connecting Link", compatible_chains: ["C2080", "C2080H"],
    description: "C2080/C2080H Double Pitch Connecting Link",
    image_url: "",
    source_refs: [{ manufacturer: "Allied-Locke", code: "C2080CL", confidence: "Confirmed" }],
  },

  // ══════════════════════════════════════════════════════════════════
  // WELDED STEEL CHAINS — Pins and Links
  // ══════════════════════════════════════════════════════════════════

  {
    code: "WH78-CONN", type: "Connecting Link", compatible_chains: ["WH-78", "WR-78"],
    description: "WH78/WR78 Welded Steel Chain Connecting Link",
    image_url: "",
    source_refs: [
      { manufacturer: "Allied-Locke", code: "WH78-CL", confidence: "Confirmed" },
      { manufacturer: "MAC Chain", code: "WH78-CL", confidence: "Confirmed" },
    ],
  },
  {
    code: "WH88-CONN", type: "Connecting Link", compatible_chains: ["WH-88", "WR-88"],
    description: "WH88/WR88 Connecting Link",
    image_url: "",
    source_refs: [
      { manufacturer: "Allied-Locke", code: "WH88-CL", confidence: "Confirmed" },
      { manufacturer: "MAC Chain", code: "WH88-CL", confidence: "Confirmed" },
    ],
  },
  {
    code: "WH106-CONN", type: "Connecting Link", compatible_chains: ["WH-106", "WR-106"],
    description: "WH106/WR106 Connecting Link",
    image_url: "",
    source_refs: [
      { manufacturer: "Allied-Locke", code: "WH106-CL", confidence: "Confirmed" },
      { manufacturer: "MAC Chain", code: "WH106-CL", confidence: "Confirmed" },
    ],
  },
  {
    code: "WH124-CONN", type: "Connecting Link", compatible_chains: ["WH-124", "WR-124"],
    description: "WH124/WR124 Connecting Link",
    image_url: "",
    source_refs: [
      { manufacturer: "Allied-Locke", code: "WH124-CL", confidence: "Confirmed" },
      { manufacturer: "MAC Chain", code: "WH124-CL", confidence: "Confirmed" },
    ],
  },
  {
    code: "WH78-PIN", type: "Replacement Pin", compatible_chains: ["WH-78", "WR-78"],
    description: "WH78 Replacement/Repair Pin",
    image_url: "",
    source_refs: [{ manufacturer: "Allied-Locke", code: "WH78-RP", confidence: "Confirmed" }],
  },
  {
    code: "WH88-PIN", type: "Replacement Pin", compatible_chains: ["WH-88", "WR-88"],
    description: "WH88 Replacement/Repair Pin",
    image_url: "",
    source_refs: [{ manufacturer: "Allied-Locke", code: "WH88-RP", confidence: "Confirmed" }],
  },

  // ══════════════════════════════════════════════════════════════════
  // STEEL PINTLE CHAINS — Pins
  // ══════════════════════════════════════════════════════════════════

  {
    code: "667-PIN", type: "Replacement Pin", compatible_chains: ["667", "667X", "667XH"],
    description: "667 Series Steel Pintle Replacement Pin — standard",
    image_url: "",
    source_refs: [
      { manufacturer: "Allied-Locke", code: "667-RP", confidence: "Confirmed" },
      { manufacturer: "MAC Chain", code: "667-RP", confidence: "Confirmed" },
    ],
  },
  {
    code: "667-HARDPIN", type: "Hardened Pin", compatible_chains: ["667", "667X", "667XH"],
    description: "667 Series Hardened Replacement Pin — extended wear life",
    image_url: "",
    source_refs: [
      { manufacturer: "Allied-Locke", code: "667-HP", confidence: "Confirmed" },
    ],
  },
  {
    code: "7200-PIN", type: "Replacement Pin", compatible_chains: ["7200"],
    description: "7200 Series Pintle Replacement Pin",
    image_url: "",
    source_refs: [
      { manufacturer: "Allied-Locke", code: "7200-RP", confidence: "Confirmed" },
      { manufacturer: "MAC Chain", code: "7200-RP", confidence: "Confirmed" },
    ],
  },

  // ══════════════════════════════════════════════════════════════════
  // DROP FORGED RIVETLESS — Connecting Links
  // ══════════════════════════════════════════════════════════════════

  {
    code: "X348-MASTER", type: "Master Link", compatible_chains: ["X348", "OHC-X348-TROLLEY"],
    description: "X348 Drop Forged Rivetless Master Link",
    image_url: "",
    source_refs: [
      { manufacturer: "Allied-Locke", code: "X348-ML", confidence: "Confirmed" },
      { manufacturer: "MAC Chain", code: "X348-ML", confidence: "Confirmed" },
    ],
  },
  {
    code: "X458-MASTER", type: "Master Link", compatible_chains: ["X458", "OHC-X458-TROLLEY"],
    description: "X458 Drop Forged Rivetless Master Link",
    image_url: "",
    source_refs: [
      { manufacturer: "Allied-Locke", code: "X458-ML", confidence: "Confirmed" },
    ],
  },
  {
    code: "X678-MASTER", type: "Master Link", compatible_chains: ["X678"],
    description: "X678 Drop Forged Rivetless Master Link",
    image_url: "",
    source_refs: [
      { manufacturer: "Allied-Locke", code: "X678-ML", confidence: "Confirmed" },
    ],
  },

  // ══════════════════════════════════════════════════════════════════
  // ENGINEERING CLASS — Connecting Links
  // ══════════════════════════════════════════════════════════════════

  {
    code: "SS78-CONN", type: "Connecting Link", compatible_chains: ["SS-78"],
    description: "SS78 Bushed Steel Chain Connecting Link",
    image_url: "",
    source_refs: [{ manufacturer: "Allied-Locke", code: "SS78-CL", confidence: "Confirmed" }],
  },
  {
    code: "SS88-CONN", type: "Connecting Link", compatible_chains: ["SS-88"],
    description: "SS88 Bushed Steel Chain Connecting Link",
    image_url: "",
    source_refs: [{ manufacturer: "Allied-Locke", code: "SS88-CL", confidence: "Confirmed" }],
  },

];

/** Get pins/links compatible with a given chain_id */
export function getPinsForChain(chain_id) {
  return PINS_LINKS_LIBRARY.filter(p =>
    p.compatible_chains?.includes(chain_id)
  );
}

/** Get all pins/links of a specific type */
export function getPinsByType(type) {
  return PINS_LINKS_LIBRARY.filter(p => p.type === type);
}

export default PINS_LINKS_LIBRARY;