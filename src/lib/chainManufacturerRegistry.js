/**
 * chainManufacturerRegistry.js
 *
 * Official Manufacturer Source Registry for the Uniking Chain Procurement Platform.
 *
 * RULES:
 * - Only official manufacturer sources are listed here.
 * - No distributors, resellers, or marketplace listings.
 * - Every imported chain must reference a manufacturer entry here.
 * - Confidence levels: Confirmed | Needs Review | Missing Data – Needs Mapping
 */

export const MANUFACTURER_REGISTRY = [
  {
    id: "allied-locke",
    name: "Allied-Locke Industries",
    short: "Allied-Locke",
    website: "https://www.alliedlocke.com",
    catalog_urls: [
      "https://chains.alliedlocke.com",
      "https://www.alliedlocke.com/catalog",
    ],
    specialty: [
      "ANSI Roller Chain",
      "Engineered Class Chains",
      "Welded Steel Chains",
      "Drop Forged Rivetless",
      "Steel Pintle Chains",
      "Leaf Chains",
      "Agricultural Chains",
      "Attachments",
      "Sprockets",
    ],
    trusted: true,
    source_priority: 1,
    notes: "Primary North American engineered chain manufacturer. Full catalog available online.",
    country: "USA",
  },
  {
    id: "mac-chain",
    name: "MAC Chain (MA Chain USA)",
    short: "MAC Chain",
    website: "https://macchain.com",
    catalog_urls: ["https://macchain.com/products"],
    specialty: [
      "ANSI Roller Chain",
      "Welded Steel Chains",
      "Engineered Class Chains",
      "Drop Forged Rivetless",
      "Pintle Chains",
      "Sprockets",
      "Attachments",
    ],
    trusted: true,
    source_priority: 1,
    notes: "Strong North American chain manufacturer with extensive industrial catalog.",
    country: "USA",
  },
  {
    id: "donghua",
    name: "Donghua Chain Group",
    short: "Donghua",
    website: "https://www.chinachain.com",
    catalog_urls: [
      "https://www.chinachain.com/en/catalog",
      "https://www.donghua-chain.com",
    ],
    specialty: [
      "ANSI Roller Chain",
      "British Standard Roller Chain",
      "Agricultural Chain",
      "Conveyor Chain",
      "Hollow Pin Chain",
    ],
    trusted: true,
    source_priority: 2,
    notes: "ISO 9001 certified. Full ANSI and metric chain range. Data from official Donghua chain catalog.",
    country: "China",
  },
  {
    id: "tsubaki",
    name: "Tsubakimoto Chain Co.",
    short: "Tsubaki",
    website: "https://us.tsubakimoto.com",
    catalog_urls: [
      "https://us.tsubakimoto.com/products/chain",
      "https://us.tsubakimoto.com/resources/catalogs",
    ],
    specialty: [
      "ANSI Roller Chain",
      "Lambda Self-Lube Chain",
      "Neptune Stainless Chain",
      "Double Pitch Chain",
      "Hollow Pin Chain",
      "Conveyor Chain",
      "Agricultural Chain",
      "Leaf Chain",
    ],
    trusted: true,
    source_priority: 1,
    notes: "Global chain leader. Premium Lambda and Neptune series. Technical data from official Tsubaki product catalog.",
    country: "Japan / USA",
  },
  {
    id: "rexnord",
    name: "Rexnord Industries",
    short: "Rexnord",
    website: "https://www.rexnord.com",
    catalog_urls: [
      "https://www.rexnord.com/products/conveyor-chain",
      "https://www.rexnord.com/resources/catalogs",
    ],
    specialty: [
      "Drop Forged Rivetless Chain",
      "Engineering Class Conveyor Chain",
      "ANSI Roller Chain",
      "TableTop Chain (Rex)",
      "Conveyor Equipment",
    ],
    trusted: true,
    source_priority: 1,
    notes: "Rexnord Rex series conveyor and rivetless chains. Strong in automotive and processing industries.",
    country: "USA",
  },
  {
    id: "connexus",
    name: "Connexus Industries",
    short: "Connexus",
    website: "https://www.connexusindustries.com",
    catalog_urls: ["https://www.connexusindustries.com/products"],
    specialty: [
      "ANSI Roller Chain",
      "Premium Roller Chain",
      "Hollow Pin Chain",
    ],
    trusted: true,
    source_priority: 2,
    notes: "North American premium chain supplier. Data verified from official product pages.",
    country: "Canada / USA",
  },
  {
    id: "viking",
    name: "Viking Chain / Enduride",
    short: "Viking",
    website: "https://www.vikingchain.com",
    catalog_urls: ["https://www.vikingchain.com/products"],
    specialty: [
      "Engineering Class Chain",
      "Welded Steel Chain",
      "Drag Chain",
      "Bucket Elevator Chain",
    ],
    trusted: true,
    source_priority: 2,
    notes: "Industrial chain specialist. Heavy-duty and specialty applications.",
    country: "USA",
  },
  {
    id: "summit",
    name: "Summit Chain / Webster-Schaffer",
    short: "Summit",
    website: "https://www.summitchain.com",
    catalog_urls: ["https://www.summitchain.com/catalog"],
    specialty: [
      "ANSI Roller Chain",
      "Conveyor Chain",
      "Engineering Chain",
    ],
    trusted: true,
    source_priority: 2,
    notes: "USA chain manufacturer. Summit brand ANSI and conveyor chains.",
    country: "USA",
  },
  {
    id: "can-am",
    name: "Can-Am Chains",
    short: "Can-Am",
    website: "https://www.can-amchains.com",
    catalog_urls: ["https://www.can-amchains.com/products"],
    specialty: [
      "ANSI Roller Chain",
      "British Standard Chain",
      "Agricultural Chain",
    ],
    trusted: true,
    source_priority: 2,
    notes: "Canadian chain supplier. ANSI and BS roller chains.",
    country: "Canada",
  },
  {
    id: "iwis",
    name: "Iwis Drive Systems",
    short: "Iwis",
    website: "https://www.iwis.com",
    catalog_urls: [
      "https://www.iwis.com/en/products/chains",
      "https://www.iwis.com/en/downloads/catalogs",
    ],
    specialty: [
      "DIN/ISO Roller Chain",
      "ANSI Roller Chain",
      "Precision Roller Chain",
      "Stainless Chain",
      "Leaf Chain",
    ],
    trusted: true,
    source_priority: 1,
    notes: "German precision chain manufacturer. Full DIN/ISO and ANSI range. Renowned for dimensional precision.",
    country: "Germany",
  },
  {
    id: "webster",
    name: "Webster Industries",
    short: "Webster",
    website: "https://www.websterindustries.com",
    catalog_urls: ["https://www.websterindustries.com/products"],
    specialty: [
      "ANSI Roller Chain",
      "Drag Chain",
      "Specialty Conveyor Chain",
    ],
    trusted: true,
    source_priority: 2,
    notes: "USA chain manufacturer. Industrial chains and sprockets.",
    country: "USA",
  },
  {
    id: "kobo",
    name: "Kobo Chain",
    short: "Kobo",
    website: "https://www.kobochain.com",
    catalog_urls: ["https://www.kobochain.com/products"],
    specialty: [
      "ANSI Roller Chain",
      "Agricultural Chain",
      "Conveyor Chain",
    ],
    trusted: true,
    source_priority: 2,
    notes: "Chain manufacturer with ANSI and agricultural chain range.",
    country: "Japan",
  },
];

/** Get manufacturer entry by short name (case-insensitive) */
export function getManufacturer(shortName) {
  const name = shortName?.toLowerCase();
  return MANUFACTURER_REGISTRY.find(m =>
    m.short.toLowerCase() === name ||
    m.name.toLowerCase().includes(name)
  ) || null;
}

/** Get all manufacturer short names */
export function getAllManufacturerNames() {
  return MANUFACTURER_REGISTRY.map(m => m.short);
}

/** Get manufacturers by specialty keyword */
export function getManufacturersBySpecialty(keyword) {
  const kw = keyword.toLowerCase();
  return MANUFACTURER_REGISTRY.filter(m =>
    m.specialty.some(s => s.toLowerCase().includes(kw))
  );
}

export default MANUFACTURER_REGISTRY;