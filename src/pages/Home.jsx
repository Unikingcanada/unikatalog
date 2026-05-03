import { useState, useEffect, useMemo, useRef } from "react";
import { createPageUrl } from "@/utils";
import { UniCatalog, CatalogProduct, ElevatorBucket, DonghuaChain, MacChainProduct, ForgedChain } from "@/api/entities";

// ─── Strip vendor name from any displayed text ────────────────────────────────
function stripVendor(text) {
  if (!text) return text;
  return text
    .replace(/Allied[\s\-]?Locke[\s\S]*?(\||$)/gi, '')
    .replace(/Allied[\s\-]?Locke/gi, '')
    .replace(/\|\s*$/, '')
    .replace(/^\s*\|\s*/, '')
    .trim();
}


const SHOW_BRAND = new Set(["Modular Belt", "Elevator Bucket", "4B Electronics"]);
const BRAND_GATED = new Set(["Modular Belt", "Elevator Bucket"]);
// Navigation handled internally via currentPage state


// ─── Chain grouping ──────────────────────────────────────────────────────────
const CHAIN_SUBTYPE_KEYS = new Set([
  "ANSI/BS Chain", "Engineered Chain", "Cast Chain",
  "Welded Steel Chain", "Forged Chain", "Overhead Chain", "Sharptop Chain",
  "Kiln Chain", "Thermoforming Chain", "Conveyor Chain", "Table Top Chain",
  "Pintle Chain", "Long Link Chain", "Special Application Chain",
]);

const PRODUCT_TYPES = [
  { key: "Modular Belt", label: "Modular Plastic Belting", description: "Straight-running, radius, spiral and side-flexing modular plastic belt systems", filters: ["category", "style", "pitch_in", "hinge_style", "materials"] },
  { key: "Elevator Bucket", label: "Elevator Buckets & Hardware", description: "Agricultural and industrial elevator buckets, belting, splices and hardware", filters: ["application", "discharge_type", "duty", "material", "profile"] },
  { key: "Plastic Chain", label: "Plastic Chains", description: "Straight-running and side-flexing plastic conveyor chains", filters: ["style", "materials", "duty"] },
  { key: "Metal Chain", label: "Metal Chains", description: "Stainless steel and carbon steel slat-top and side-flexing conveyor chains", filters: ["style", "materials", "duty"] },
  { key: "Wire Mesh Belt", label: "Wire Mesh Belt", description: "Stainless and carbon steel wire mesh conveyor belts for food and industrial processing", filters: ["style", "materials", "duty"] },
  { key: "Steel Hinged Belt", label: "Steel Hinged Belt", description: "Steel hinged slat and plate conveyor belts for chip and scrap handling", filters: ["style", "materials"] },
  { key: "ANSI/BS Chain", label: "Performance Roller Chain", description: "Precision roller chains to ANSI and BS specifications — standard, specialty and high-performance series", filters: ["style", "category", "materials", "duty"] },
  { key: "Engineered Chain", label: "Engineered Chain", description: "Heavy-duty engineered steel chains for demanding industrial applications", filters: ["style", "materials", "duty"] },
  { key: "Cast Chain", label: "Cast Chain", description: "Malleable and ductile cast iron conveyor chains", filters: ["style", "materials"] },
  { key: "Welded Steel Chain", label: "Welded Steel Chain", description: "Welded steel drag and conveyor chains for bulk material handling", filters: ["style", "duty"] },
  { key: "Forged Chain", label: "Forged Chain", description: "Forged steel chains for high-load and abrasive environments", filters: ["style", "materials", "duty"] },
  { key: "Overhead Chain", label: "Overhead Conveyor Chain", description: "Overhead conveyor and power-and-free chain systems", filters: ["style", "materials"] },
  { key: "Sharptop Chain", label: "Sharp Top Chain", description: "Sharp top and spike top chains for agricultural and forestry applications", filters: ["style", "materials"] },
  { key: "Kiln Chain", label: "Kiln Chain", description: "High-temperature kiln and dryer chains for cement and mineral processing", filters: ["style", "materials"] },
  { key: "Thermoforming Chain", label: "Thermoforming Chain", description: "Precision chains for plastic thermoforming and packaging machinery", filters: ["style", "materials"] },
  { key: "Conveyor Chain", label: "Conveyor Chain", description: "Hollow pin, roller top and attachment chains for general conveying and assembly line applications", filters: ["style", "materials"] },
  { key: "Table Top Chain", label: "Table Top Chain", description: "Straight-running and side-flexing table top chains in plastic and stainless steel for packaging and bottling lines", filters: ["style", "materials"] },
  { key: "Conveyor Rollers", label: "Conveyor Rollers", description: "Standard, lagging, motorized drive and specialty conveyor rollers", filters: ["style", "duty"] },
  { key: "Monitoring System", label: "4B Electronics & Monitoring", description: "Bucket elevator and conveyor safety monitoring systems and sensors", filters: ["style"] },
  { key: "Magnetic Conveyor", label: "Magnetic Conveyor", description: "Magnetic conveyor systems for ferrous material handling", filters: ["style"] },
  { key: "Pintle Chain", label: "Steel Pintle Chain", description: "Open barrel pintle chains for spreaders, feeders, hay handling and forest product applications", filters: [] },
  { key: "Long Link Chain", label: "Alloy Steel Long Link Chain", description: "Heavy-duty long link chains for car wash conveyors and forest product applications", filters: [] },
  { key: "Special Application Chain", label: "Special Application Chain", description: "DLI scanner, waste water, paver and double-flex chains for specialized conveying needs", filters: [] },
];

const TYPE_MAP = Object.fromEntries(PRODUCT_TYPES.map(t => [t.key, t]));

const FILTER_LABELS = {
  category: "Belt Category", style: "Style / Type", pitch_in: "Pitch",
  materials: "Material", material: "Material", hinge_style: "Hinge Style",
  duty: "Duty Rating", discharge_type: "Discharge Type", application: "Application", profile: "Profile",
};

const C = {
  navy: "#0F2340", navyMid: "#1A3A5C", navyLight: "#2A5080",
  gold: "#C9A84C", goldLight: "#e8c96d",
  green: "#16a34a", greenBg: "#dcfce7",
  red: "#dc2626", redBg: "#fee2e2",
  orange: "#c2410c", orangeBg: "#ffedd5",
  accent: "#2563eb",
  bg: "#f8fafc", bgCard: "#ffffff",
  border: "#e2e8f0", text: "#0f172a", textMid: "#1e293b",
  slate: "#334155", muted: "#64748b",
};
// ─── RFQ Cart Helpers ─────────────────────────────────────────────────────────
function getRFQCart() {
  try { return JSON.parse(localStorage.getItem("uniking_rfq_cart") || "[]"); } catch { return []; }
}
function saveRFQCart(items) {
  localStorage.setItem("uniking_rfq_cart", JSON.stringify(items));
  window.dispatchEvent(new Event("rfq_cart_updated"));
}
function addToRFQCart(product) {
  const cart = getRFQCart();
  const exists = cart.find(i => i.id === product.id && i._source === product._source);
  if (exists) return false;
  cart.push({
    cartId: product.id + "_" + Date.now(),
    id: product.id, _source: product._source,
    series: product.series, name: product.series,
    type: product.type, style: product.style || product.category || "",
    category: product.category || "", image_url: product.image_url || "",
    materials: product.materials || "", application: product.application || "",
    quantity: 1, unit: "Feet", notes: "",
  });
  saveRFQCart(cart);
  return true;
}

function FloatingRFQButton({ onGoRFQ }) {
  const [count, setCount] = useState(() => getRFQCart().length);
  const [pulse, setPulse] = useState(false);
  useEffect(() => {
    const update = () => { const n = getRFQCart().length; if (n > count) setPulse(true); setCount(n); setTimeout(() => setPulse(false), 600); };
    window.addEventListener("rfq_cart_updated", update);
    return () => window.removeEventListener("rfq_cart_updated", update);
  }, [count]);
  if (count === 0) return null;
  return (
    <a href="#" onClick={e => { e.preventDefault(); onGoRFQ && onGoRFQ(); }} style={{ textDecoration: "none" }}>
      <div style={{ position: "fixed", bottom: 28, right: 28, zIndex: 9999, background: "#0f2340", color: "#fff", borderRadius: 50, width: 60, height: 60, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 20px rgba(15,35,64,0.35)", cursor: "pointer", transform: pulse ? "scale(1.15)" : "scale(1)", transition: "transform 0.2s", border: "2px solid #2563eb" }}>
        <span style={{ fontSize: 22 }}>📋</span>
        <div style={{ position: "absolute", top: -6, right: -6, background: "#2563eb", color: "#fff", borderRadius: "50%", width: 22, height: 22, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, border: "2px solid #fff" }}>{count}</div>
      </div>
    </a>
  );
}



function parseJSON(raw) {
  if (!raw) return null;
  if (typeof raw === "object") return raw;
  try { return JSON.parse(raw); } catch (e) { return null; }
}

function parseSpecs(raw) {
  if (!raw) return {};
  if (typeof raw === "object") return raw;
  try { return JSON.parse(raw); } catch (e) { return {}; }
}

function normalizeCatalogProduct(r) {
  return {
    id: r.id, _source: "catalogproduct",
    type: "Modular Belt", brand: r.vendor || "Intralox",
    series: r.series || "", style: r.style || "", category: r.category || "",
    pitch_in: r.pitch_in ? r.pitch_in + '"' : "", pitch_mm: r.pitch_mm ? r.pitch_mm + " mm" : "",
    min_width_in: r.min_width_in || "", materials: r.materials || "",
    hinge_style: r.hinge_style || "", open_area: r.open_area || "",
    application: r.category || "", duty: "", notes: r.notes || "",
    catalog_url: "", tech_doc_url: r.tech_doc_url || "",
    image_url: r.image_url || "", belt_data: r.belt_data || null,
    sprocket_data: r.sprocket_data || null,
    specs: {
      "Belt Category": r.category || null, "Style": r.style || null,
      "Pitch": r.pitch_in ? r.pitch_in + '" (' + r.pitch_mm + ' mm)' : null,
      "Hinge Style": r.hinge_style || null, "Open Area": r.open_area || null,
      "Min Belt Width": r.min_width_in ? r.min_width_in + '"' : null,
      "Materials": r.materials || null,
    },
  };
}

function normalizeElevatorBucket(r) {
  return {
    id: r.id, _source: "elevbucket", type: "Elevator Bucket",
    brand: r.vendor || "", series: r.series || "", style: r.style || "",
    category: r.profile || "", application: r.application || "",
    discharge_type: r.discharge_type && r.discharge_type !== "N/A" ? r.discharge_type : "",
    duty: r.duty || "", material: r.material || "", materials: r.material || "",
    profile: r.profile && r.profile !== "N/A" ? r.profile : "",
    notes: r.notes || "", catalog_url: "", tech_doc_url: r.tech_doc_url || "",
    image_url: r.image_url || "", belt_data: null, sprocket_data: null,
    specs: {
      "Brand": r.vendor || null, "Discharge Type": r.discharge_type && r.discharge_type !== "N/A" ? r.discharge_type : null,
      "Profile": r.profile && r.profile !== "N/A" ? r.profile : null,
      "Duty": r.duty || null, "Material": r.material || null,
      "Available Sizes": r.bucket_sizes || null, "Application": r.application || null,
    },
  };
}

const UNI_TYPE_REMAP = { "Modular Plastic Belt": "Modular Belt", "Conveyor Roller": "Conveyor Rollers" };

const CHAIN_TYPE_KEYS = new Set(["ANSI/BS Chain","Conveyor Chain","Table Top Chain","Engineered Chain","Cast Chain","Welded Steel Chain","Forged Chain","Overhead Chain","Sharptop Chain","Kiln Chain","Thermoforming Chain","Plastic Chain","Metal Chain"]);

function normalizeUniCatalog(r) {
  const rawType = r.product_type || "General";
  const type = UNI_TYPE_REMAP[rawType] || rawType;
  const isChain = CHAIN_TYPE_KEYS.has(type);
  const specs = parseSpecs(r.key_specs);
  const cleanSpecs = Object.fromEntries(
    Object.entries(specs)
      .filter(([k]) => !["suppliers","supplier","vendor","vendors","brand"].includes(k.toLowerCase()))
      .map(([k, v]) => [k.replace(/_/g, " "), v])
  );
  // For chain types: use model_code as the display name (e.g. "40-2"), series becomes subtitle
  const displayName = isChain && r.model_code ? r.model_code : (r.series || "");
  const displayStyle = isChain && r.model_code ? (r.series || r.style || "") : (r.style || "");
  return {
    id: r.id, _source: "unicatalog", type,
    brand: SHOW_BRAND.has(type) ? (r.vendor || "") : "",
    series: displayName, style: displayStyle, category: displayStyle,
    _subcategory: r.series || displayStyle || "",
    application: r.application || "", materials: r.materials || "", material: r.materials || "",
    duty: r.duty || "", notes: [r.features, r.notes].filter(Boolean).join(" "),
    catalog_url: r.catalog_url || "", tech_doc_url: r.tech_doc_url || "",
    image_url: r.image_url || "", belt_data: r.belt_data || null, sprocket_data: r.sprocket_data || null,
    specs: { "Model": r.model_code || null, "Series": r.series || null, "Style": r.style || null, "Application": r.application || null, "Materials": r.materials || null, "Duty": r.duty || null, ...cleanSpecs },
  };
}

const DH_SERIES_TYPE_MAP = {
  "Welded Steel Mill Chain":          "Welded Steel Chain",
  "Welded Steel Drag Chain":          "Welded Steel Chain",
  "Palm Oil Chain":                   "Engineered Chain",
  "Sugar Mill Chain":                 "Engineered Chain",
  "Block Chain":                      "Engineered Chain",
  "Engineering Steel Bush Chain":     "Engineered Chain",
  "S/WH/WR Engineering":             "Engineered Chain",
  "Conveyor Chain (M Series)":        "Conveyor Chain",
};

const DH_IMAGE_MAP = {
  "A Series Short Pitch Precision Roller Chain":  "https://media.base44.com/images/public/69dd9ffccab4dd693d4d92f5/f3be249e7_generated_image.png",
  "B Series Short Pitch Precision Roller Chain":  "https://media.base44.com/images/public/69dd9ffccab4dd693d4d92f5/f3be249e7_generated_image.png",
  "Heavy Duty Series Roller Chain":               "https://media.base44.com/images/public/69dd9ffccab4dd693d4d92f5/f3be249e7_generated_image.png",
  "SH Series High Strength Heavy Duty Short Pitch Roller Chain": "https://media.base44.com/images/public/69dd9ffccab4dd693d4d92f5/f3be249e7_generated_image.png",
  "SP Series High Strength Short Pitch Roller Chain": "https://media.base44.com/images/public/69dd9ffccab4dd693d4d92f5/f3be249e7_generated_image.png",
  "X3 Series High Performance B Series Roller Chain": "https://media.base44.com/images/public/69dd9ffccab4dd693d4d92f5/f3be249e7_generated_image.png",
  "Double Pitch Transmission Chain":              "https://media.base44.com/images/public/69dd9ffccab4dd693d4d92f5/f3be249e7_generated_image.png",
  "Bush Chain (Custom Pitch)":                    "https://media.base44.com/images/public/69dd9ffccab4dd693d4d92f5/f3be249e7_generated_image.png",
  "Side Bow Chain (Offset Roller)":               "https://media.base44.com/images/public/69dd9ffccab4dd693d4d92f5/f3be249e7_generated_image.png",
  "Welded Steel Mill Chain":                      "https://media.base44.com/images/public/69dd9ffccab4dd693d4d92f5/b0fcc4e6b_generated_image.png",
  "Welded Steel Drag Chain":                      "https://media.base44.com/images/public/69dd9ffccab4dd693d4d92f5/b0fcc4e6b_generated_image.png",
  "Engineering Steel Bush Chain":                 "https://media.base44.com/images/public/69dd9ffccab4dd693d4d92f5/a95633a32_generated_image.png",
  "S Type Steel Agricultural Chain":              "https://media.base44.com/images/public/69dd9ffccab4dd693d4d92f5/9def24712_generated_image.png",
  "CA Type Steel Agricultural Chain":             "https://media.base44.com/images/public/69dd9ffccab4dd693d4d92f5/9def24712_generated_image.png",
  "Combine Harvester Chain":                      "https://media.base44.com/images/public/69dd9ffccab4dd693d4d92f5/9def24712_generated_image.png",
  "Steel Pintle Chain":                           "https://media.base44.com/images/public/69dd9ffccab4dd693d4d92f5/9def24712_generated_image.png",
  "O-Ring Agricultural Chain":                    "https://media.base44.com/images/public/69dd9ffccab4dd693d4d92f5/9def24712_generated_image.png",
  "Conveyor Chain (M Series)":                    "https://media.base44.com/images/public/69dd9ffccab4dd693d4d92f5/37623535e_generated_image.png",
  "Palm Oil Chain":                               "https://media.base44.com/images/public/69dd9ffccab4dd693d4d92f5/37623535e_generated_image.png",
  "Sugar Mill Chain":                             "https://media.base44.com/images/public/69dd9ffccab4dd693d4d92f5/37623535e_generated_image.png",
  "Block Chain":                                  "https://media.base44.com/images/public/69dd9ffccab4dd693d4d92f5/9781c628a_generated_image.png",
};

function normalizeDonghuaChain(r) {
  const seriesType = DH_SERIES_TYPE_MAP[r.series];
  let type;
  if (seriesType) {
    type = seriesType;
  } else if (r.chain_type === "Drive Chain") {
    type = "ANSI/BS Chain";
  } else if (r.chain_type === "Conveyor Chain") {
    type = "Conveyor Chain";
  } else if (r.chain_type === "Agricultural Chain") {
    if (r.series && r.series.includes("Pintle")) {
      type = "Pintle Chain";
    } else {
      type = "Engineered Chain";
    }
  } else {
    type = "Engineered Chain";
  }

  const displayNo = r.ansi_no || r.bs_no || r.iso_no || r.chain_no || "";
  const specs = {};
  if (r.pitch_mm) specs["Pitch (mm)"] = r.pitch_mm;
  if (r.roller_dia_mm) specs["Roller Dia. (mm)"] = r.roller_dia_mm;
  if (r.inner_width_mm) specs["Inner Width (mm)"] = r.inner_width_mm;
  if (r.pin_dia_mm) specs["Pin Dia. (mm)"] = r.pin_dia_mm;
  if (r.pin_length_mm) specs["Pin Length (mm)"] = r.pin_length_mm;
  if (r.plate_height_mm) specs["Plate Height (mm)"] = r.plate_height_mm;
  if (r.plate_thickness_mm) specs["Plate Thickness (mm)"] = r.plate_thickness_mm;
  if (r.transverse_pitch_mm) specs["Transverse Pitch (mm)"] = r.transverse_pitch_mm;
  if (r.tensile_strength_kn) specs["Min Tensile (kN)"] = r.tensile_strength_kn;
  if (r.tensile_strength_lbf) specs["Min Tensile (lbf)"] = r.tensile_strength_lbf;
  if (r.weight_kg_m) specs["Weight (kg/m)"] = r.weight_kg_m;
  const altNos = [r.ansi_no, r.bs_no, r.iso_no, r.chain_no].filter(Boolean).filter((v,i,a)=>a.indexOf(v)===i).join(" / ");
  return {
    id: r.id, _source: "donghuachain", type,
    brand: "", series: displayNo,
    style: r.series || r.chain_type || "",
    category: r.chain_type || "",
    application: r.application || "",
    materials: r.materials || "Carbon Steel",
    material: r.materials || "Carbon Steel",
    duty: (r.chain_type === "Engineering Chain" || r.chain_type === "Agricultural Chain") ? "Heavy" : "",
    notes: [r.notes, altNos ? "Cross-ref: " + altNos : ""].filter(Boolean).join(" | "),
    catalog_url: r.catalog_url || "",
    tech_doc_url: "",
    image_url: DH_IMAGE_MAP[r.series] || "",
    belt_data: null, sprocket_data: null,
    specs: { "Chain No.": displayNo || null, "Series": r.series || null, "Type": r.chain_type || null, "Strands": r.strands || null, "Materials": r.materials || null, ...specs },
  };
}

// ─── Allied Locke / MacChain (Engineered Chain subcategories) ─────────────────

const ENGINEERED_SUBCATEGORIES = [
  { key: "SS Class Bushed Steel Chains",          label: "SS Class Bushed Steel Chains",             description: "Solid roller bushed steel conveyor chains — SS series" },
  { key: "MSR Class Bushed Roller Steel Chains",  label: "MSR Class Bushed Roller Steel Chains",     description: "Bushed roller steel chains — 378RX to MSR4119" },
  { key: "MXS Class Offset Steel Drive Chains",   label: "MXS Class Offset Steel Drive Chains",      description: "Offset sidebar steel drive chains — MXS series" },
  { key: "Rivetless Drop Forged Chains",          label: "Rivetless Drop Forged / Bar Loop Chains",  description: "Drop forged rivetless and bar loop chains for heavy drag applications" },
  { key: "Combination Chains",                    label: "Combination Chains",                       description: "Cast and wrought combination conveyor chains" },
  { key: "Cast Manganese and Alloy Steel Chains", label: "Cast Manganese & Alloy Steel Chains",      description: "Cast manganese and alloy steel rivetless and drag chains" },
];

const WELDED_SUBCATEGORIES = [
  { key: "Chain",                          label: "Welded Steel Chain",               description: "WR and WD series mill and drag chains for bulk material handling and log handling" },
  { key: "Sprocket",                       label: "Sprockets",                        description: "Matched sprockets for WR and WD series welded steel chains" },
  { key: "Pin",                            label: "Pins & Connecting Links",          description: "Standard and specialty pins for welded steel chain assembly and repair" },
  { key: "Welded Steel Chain Attachments", label: "Chain Attachments",               description: "A, K, S, RF and RR series flight attachments for welded steel chain" },
  { key: "Chain and Attachments",          label: "Chain with Attachments",           description: "Log cradles, slasher flights, side lift assemblies and configured chain sets" },
];

const ANSI_SUBCATEGORIES = [
  { key: "ANSI Roller Chain",                  label: "ANSI Roller Chain",                 description: "Single strand, heavy series, and multiple strand ANSI precision roller chains (#25 to #240)" },
  { key: "ANSI Roller Chain Attachments",      label: "ANSI Chain Attachments",            description: "Standard bent, straight, extended pin, wide contour, and double pitch attachments (#35 to #160)" },
  { key: "British Standard Roller Chains",     label: "British Standard Roller Chains",    description: "BS/ISO precision roller chains (06B to 40B, single and multi-strand)" },
  { key: "Super Series Chains",                label: "Super Series Chains",               description: "Higher-strength Super Series ANSI roller chains with upgraded plate and pin" },
  { key: "Armor Coat Chains",                  label: "Armor Coat Chains",                 description: "Corrosion-resistant armor coat coated roller chains" },
  { key: "Self-Lube Chains",                   label: "Self-Lube Chains",                  description: "Oil-impregnated sintered bushing self-lubricating roller chains" },
  { key: "Self-Lube Bushing Chains",           label: "Self-Lube Bushing Chains",          description: "Self-lubricating bushing chains for extended maintenance intervals" },
  { key: "Nickel Plated Chains",               label: "Nickel Plated Chains",              description: "Nickel plated roller chains for corrosion and cosmetic applications" },
  { key: "Hollow Pin Chains",                  label: "Hollow Pin Chains",                 description: "Hollow pin roller chains for attachment and cross-rod applications" },
  { key: "Double Pitch Roller Chains",         label: "Double Pitch Roller Chains",        description: "C2040–C2160H double pitch chains for conveyor and slow-speed drive" },
  { key: "O-Ring Chains",                      label: "O-Ring Chains",                     description: "O-ring sealed roller chains for reduced lubrication requirements" },
  { key: "Side Bow Chains",                    label: "Side Bow Chains",                   description: "Flexible side bow roller chains for curved conveyor paths" },
  { key: "Rollerless Chains",                  label: "Rollerless Chains",                 description: "Rollerless bushing chains for sliding rail and low-speed applications" },
  { key: "Double Capacity Chains",             label: "Double Capacity Chains",            description: "Double capacity roller chains with increased tensile strength" },
  { key: "XDO Chains",                         label: "XDO Chains",                        description: "Extended duty oversized sidebar chains for maximum load capacity" },
  { key: "Solid Bushing/Solid Roller Chains",  label: "Solid Bushing / Solid Roller",      description: "Solid forged bushing and solid roller chains for heavy shock loads" },
  { key: "Straight Sidebar Chains",            label: "Straight Sidebar Chains",           description: "Straight sidebar roller chains for reduced flex and precise alignment" },
  { key: "Non-Standard Series Chains",         label: "Non-Standard Series Chains",        description: "Non-standard pitch roller chains including chain 85 and 105 series" },
  { key: "Zinc Plated Chains",                 label: "Zinc Plated Chains",                description: "Zinc plated chains for light corrosion resistance" },
  { key: "Citrus Chains",                      label: "Citrus Chains",                     description: "Stainless and carbon steel D-5 citrus conveyor chains" },
];

// Category-based type routing for Allied Locke + Mac Chain records
const MAC_WELDED_CATEGORIES = new Set([
  "Welded Steel Chain", "Sprocket", "Pin", "Attachment",
]);

function normalizeAllied(r) {
  const headers = Array.isArray(r.basic_headers) ? r.basic_headers : [];
  const firstRow = Array.isArray(r.basic_rows) && r.basic_rows[0] ? r.basic_rows[0] : [];
  const specs = {};
  headers.forEach((h, i) => { if (firstRow[i] != null && firstRow[i] !== "") specs[h] = firstRow[i]; });
  if (r.subcategory) specs["Category"] = r.subcategory;
  if (r.industry) specs["Industry"] = r.industry;

  // Route by category field — definitive source of truth
  let type;
  const cat = r.category || "";
  if (cat === "High-End Roller Chain") {
    type = "ANSI/BS Chain";
  } else if (cat === "Engineered Chain") {
    type = "Engineered Chain";
  } else if (MAC_WELDED_CATEGORIES.has(cat)) {
    type = "Welded Steel Chain";
  } else if (cat === "Long Link Chain") {
    type = "Long Link Chain";
  } else if (cat === "Pintle Chain") {
    type = "Pintle Chain";
  } else if (cat === "Special Application Chain") {
    type = "Special Application Chain";
  } else {
    type = "Engineered Chain"; // safe fallback
  }

  return {
    id: r.id, _source: "allied", type,
    brand: "",
    series: r.part_number || "",
    style: r.subcategory || r.product_type || "",
    category: r.subcategory || cat,
    _subcategory: r.subcategory || r.product_type || "",
    _mac_category: cat || "",
    application: r.industry || "",
    materials: "",
    duty: "",
    notes: Array.isArray(r.features) ? r.features.map(stripVendor).join(" · ") : stripVendor(r.description || ""),
    catalog_url: "", tech_doc_url: "",
    image_url: (() => {
      const a = r.product_image || "";
      const b = r.diagram_image || "";
      // Prefer the live photo (URL contains "Picture") over the drawing
      if (a && /picture/i.test(a)) return a;
      if (b && /picture/i.test(b)) return b;
      return a || b;
    })(),
    diagram_image: (() => {
      const a = r.product_image || "";
      const b = r.diagram_image || "";
      // diagram_image = the one that's NOT the live photo
      if (a && /picture/i.test(a)) return b;
      if (b && /picture/i.test(b)) return a;
      return b || a;
    })(),
    belt_data: null, sprocket_data: null,
    specs,
  };
}


function getFilterOptions(products, field) {
  const vals = new Set();
  for (const p of products) {
    const raw = p[field];
    if (!raw) continue;
    String(raw).split(",").map(s => s.trim()).filter(Boolean).forEach(v => vals.add(v));
  }
  return [...vals].sort();
}

function applyFilters(products, activeFilters) {
  return products.filter(p =>
    Object.entries(activeFilters).every(([field, val]) => {
      if (!val) return true;
      return String(p[field] || "").toLowerCase().includes(val.toLowerCase());
    })
  );
}

// ─── Tear Sheet ───────────────────────────────────────────────────────────────

function printTearSheet(product) {
  const typeDef = TYPE_MAP[product.type];
  const specs = Object.entries(product.specs || {}).filter(([, v]) => v != null && v !== "" && v !== "N/A");

  let beltRows = [];
  if (product.belt_data) {
    try { const p = parseJSON(product.belt_data); if (Array.isArray(p)) beltRows = p; } catch (e) {}
  }
  let sprocketRows = [];
  if (product.sprocket_data) {
    try { const p = parseJSON(product.sprocket_data); if (Array.isArray(p)) sprocketRows = p; } catch (e) {}
  }

  const beltCols = ["material","strength_lbf","strength_nm","temp_min_f","temp_max_f","mass_lbft2","mass_kgm2"];
  const beltLabels = { material:"Material", strength_lbf:"Strength (lbf)", strength_nm:"Strength (N/m)", temp_min_f:"Min °F", temp_max_f:"Max °F", mass_lbft2:"lb/ft²", mass_kgm2:"kg/m²" };
  const activeBeltCols = beltCols.filter(k => beltRows.some(r => r[k] != null && r[k] !== ""));

  const sprocketCols = ["type","material","teeth","pitch_dia_in","pitch_dia_mm","outer_dia_in","outer_dia_mm","hub_width_in","hub_width_mm"];
  const sprocketLabels = { type:"Type", material:"Material", teeth:"Teeth", pitch_dia_in:"Pitch Dia (in)", pitch_dia_mm:"Pitch Dia (mm)", outer_dia_in:"Outer Dia (in)", outer_dia_mm:"Outer Dia (mm)", hub_width_in:"Hub Width (in)", hub_width_mm:"Hub Width (mm)" };
  const activeSprocketCols = sprocketCols.filter(k => sprocketRows.some(r => r[k] != null && r[k] !== ""));

  const __html = `<!DOCTYPE html><html><head><title>Tear Sheet — ${product.series}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Segoe UI', Arial, sans-serif; color: #111; background: #fff; }
  @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
  .header { background: #0f2340; color: #fff; padding: 22px 32px; display: flex; align-items: center; justify-content: space-between; }
  .header-left { display: flex; align-items: center; gap: 18px; }
  .header img { max-height: 44px; }
  .header-title { font-size: 22px; font-weight: 800; letter-spacing: 0.3px; }
  .header-sub { font-size: 12px; color: rgba(255,255,255,0.55); margin-top: 3px; }
  .header-meta { text-align: right; font-size: 11px; color: rgba(255,255,255,0.45); }
  .accent-bar { height: 4px; background: linear-gradient(90deg, #2d8a4e, #1a3a5c); }
  .body { padding: 24px 32px; }
  .product-hero { display: flex; gap: 24px; align-items: flex-start; margin-bottom: 20px; padding-bottom: 20px; border-bottom: 1px solid #e5e7eb; }
  .product-img { width: 140px; height: 100px; object-fit: contain; border: 1px solid #e5e7eb; border-radius: 6px; padding: 6px; background: #f8fafc; flex-shrink: 0; }
  .product-name { font-size: 26px; font-weight: 900; color: #0f2340; line-height: 1.1; }
  .product-type { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #2d8a4e; margin-bottom: 6px; }
  .product-style { font-size: 14px; color: #64748b; margin-top: 4px; }
  .tags { display: flex; gap: 6px; margin-top: 10px; flex-wrap: wrap; }
  .tag { background: #f1f5f9; border: 1px solid #e2e8f0; border-radius: 99px; padding: 3px 10px; font-size: 11px; font-weight: 600; color: #334155; }
  .notes-box { background: #f8fafc; border-left: 3px solid #1a3a5c; border-radius: 4px; padding: 10px 14px; font-size: 12px; color: #334155; line-height: 1.7; margin-bottom: 18px; }
  .section-title { font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; color: #1a3a5c; margin-bottom: 8px; padding-bottom: 4px; border-bottom: 2px solid #e2e8f0; }
  .specs-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; margin-bottom: 20px; }
  .spec-cell { background: #f8fafc; border: 1px solid #f1f5f9; border-radius: 5px; padding: 7px 10px; }
  .spec-label { font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.6px; color: #94a3b8; margin-bottom: 2px; }
  .spec-value { font-size: 12px; font-weight: 600; color: #0f2340; }
  table { width: 100%; border-collapse: collapse; font-size: 11px; margin-bottom: 20px; }
  thead tr { background: #0f2340; }
  thead th { padding: 7px 10px; color: #fff; font-weight: 700; text-align: left; white-space: nowrap; }
  tbody tr:nth-child(even) { background: #f8fafc; }
  tbody td { padding: 6px 10px; border-bottom: 1px solid #e5e7eb; color: #334155; }
  tbody td:first-child { font-weight: 600; color: #0f2340; }
  .footer { margin-top: 24px; padding-top: 12px; border-top: 1px solid #e5e7eb; display: flex; justify-content: space-between; align-items: center; }
  .footer-left { font-size: 10px; color: #94a3b8; }
  .footer-right { font-size: 10px; color: #94a3b8; text-align: right; }
  .confidential { font-size: 9px; text-transform: uppercase; letter-spacing: 1px; color: #cbd5e1; }
  .no-print { margin: 16px 32px; display: flex; gap: 10px; }
  @media print { .no-print { display: none !important; } }
  .btn { padding: 8px 18px; border: none; border-radius: 6px; cursor: pointer; font-size: 13px; font-weight: 700; }
  .btn-primary { background: #0f2340; color: #fff; }
  .btn-secondary { background: #f1f5f9; color: #334155; border: 1px solid #e2e8f0; }
  .section-wrap { margin-bottom: 20px; }
</style></head><body>
<div class="no-print">
  <button class="btn btn-primary" onclick="window.print()">Print / Save PDF</button>
  <button class="btn btn-secondary" onclick="window.close()">Close</button>
</div>
<div class="header">
  <div class="header-left">
    <img src="https://media.base44.com/images/public/69dd9ffccab4dd693d4d92f5/e48ee59d9_Unitingthestrongestlinks_20251031_225809_0000.png" style="max-height:38px;width:auto;filter:brightness(0) invert(1);opacity:0.92;" alt="Uniking Canada" />
  </div>
  <div class="header-meta">
    <div style="font-size:13px;font-weight:700;color:#fff;">${product.series}</div>
    <div>${typeDef?.label || product.type}</div>
    <div style="margin-top:4px;">${new Date().toLocaleDateString("en-CA", { year:"numeric", month:"long", day:"numeric" })}</div>
  </div>
</div>
<div class="accent-bar"></div>
<div class="body">
  <div class="product-hero">
    ${product.image_url ? `<img class="product-img" src="${product.image_url}" alt="${product.series}" />` : ""}
    <div>
      <div class="product-type">${typeDef?.label || product.type}${product.brand ? " · " + product.brand : ""}</div>
      <div class="product-name">${product.series}</div>
      ${product.style ? `<div class="product-style">${product.style}</div>` : ""}
      <div class="tags">
        ${product.pitch_in ? `<span class="tag">${product.pitch_in} pitch</span>` : ""}
        ${product.hinge_style ? `<span class="tag">${product.hinge_style}</span>` : ""}
        ${product.open_area ? `<span class="tag">${product.open_area} open area</span>` : ""}
      </div>
    </div>
  </div>

  ${product.diagram_image ? `
  <div class="section-wrap">
    <div class="section-title">Dimensional Drawing</div>
    <div style="text-align:center; margin-bottom:8px;">
      <img src="${product.diagram_image}" alt="Dimensional Drawing" style="max-width:100%; max-height:280px; object-fit:contain; border:1px solid #e5e7eb; border-radius:6px; padding:10px; background:#f8fafc;" />
    </div>
  </div>` : ""}
  ${product.notes ? `<div class="notes-box">${stripVendor(product.notes)}</div>` : ""}

  ${specs.length ? `
  <div class="section-wrap">
    <div class="section-title">Specifications</div>
    <div class="specs-grid">
      ${specs.map(([l, v]) => `<div class="spec-cell"><div class="spec-label">${l}</div><div class="spec-value">${v}</div></div>`).join("")}
    </div>
  </div>` : ""}

  ${beltRows.length && activeBeltCols.length ? `
  <div class="section-wrap">
    <div class="section-title">Belt Data — Material Properties</div>
    <table>
      <thead><tr>${activeBeltCols.map(k => `<th>${beltLabels[k]}</th>`).join("")}</tr></thead>
      <tbody>${beltRows.map(row => `<tr>${activeBeltCols.map(k => `<td>${row[k] != null ? row[k] : "—"}</td>`).join("")}</tr>`).join("")}</tbody>
    </table>
  </div>` : ""}

  ${sprocketRows.length && activeSprocketCols.length ? `
  <div class="section-wrap">
    <div class="section-title">Compatible Sprockets</div>
    <table>
      <thead><tr>${activeSprocketCols.map(k => `<th>${sprocketLabels[k]}</th>`).join("")}</tr></thead>
      <tbody>${sprocketRows.map(row => `<tr>${activeSprocketCols.map(k => `<td>${row[k] != null ? row[k] : "—"}</td>`).join("")}</tr>`).join("")}</tbody>
    </table>
  </div>` : ""}

  ${(product.catalog_url || product.tech_doc_url) ? `
  <div class="section-wrap">
    <div class="section-title">Technical Resources</div>
    <div style="display:flex;gap:12px;flex-wrap:wrap;margin-top:6px;">
      ${product.catalog_url ? `<a href="${product.catalog_url}" style="font-size:12px;color:#1a3a5c;font-weight:600;">View Catalog PDF</a>` : ""}
      ${product.tech_doc_url ? `<a href="${product.tech_doc_url}" style="font-size:12px;color:#1a3a5c;font-weight:600;">Technical Documentation</a>` : ""}
    </div>
  </div>` : ""}

  <div class="footer">
    <div class="footer-left">
      <img src="https://media.base44.com/images/public/69dd9ffccab4dd693d4d92f5/e48ee59d9_Unitingthestrongestlinks_20251031_225809_0000.png" style="max-height:20px;width:auto;opacity:0.65;margin-bottom:4px;" alt="Uniking Canada" /><br/>
      <div>unikingcanada.com · rfq@unikingcanada.com</div>
      <div class="confidential">Confidential — Internal Use Only</div>
    </div>
    <div class="footer-right">
      <div>${product.series}${product.style ? " / " + product.style : ""}</div>
      <div style="margin-top:2px;">No pricing information included</div>
    </div>
  </div>
</div>
</body></html>`;
  const __blob1 = new Blob([__html], {type:'text/html'});
  const __url1 = URL.createObjectURL(__blob1);
  window.open(__url1, '_blank');
}

// ─── Mac Chain Tear Sheet ─────────────────────────────────────────────────────

function printMacTearSheet(record) {
  const date = new Date().toLocaleDateString("en-CA", { year:"numeric", month:"long", day:"numeric" });
  // Prefer the live photo (URL contains "Picture") over the drawing sketch
  const _a = record.product_image || "";
  const _b = record.diagram_image || "";
  const img = (_a && /picture/i.test(_a)) ? _a : (_b && /picture/i.test(_b)) ? _b : (_a || _b);
  const diagImg = img === _a ? (_b !== _a ? _b : "") : (_a !== _b ? _a : "");

  const basicHeaders = Array.isArray(record.basic_headers) ? record.basic_headers : [];
  const basicRows = Array.isArray(record.basic_rows) ? record.basic_rows : [];
  const moreHeaders = Array.isArray(record.more_headers) ? record.more_headers : [];
  const moreRows = Array.isArray(record.more_rows) ? record.more_rows : [];
  const features = Array.isArray(record.features) ? record.features : [];

  const basicTable = basicHeaders.length && basicRows.length ? `
  <div class="section-wrap">
    <div class="section-title">Specifications</div>
    <table>
      <thead><tr>${basicHeaders.map(h => `<th>${h}</th>`).join("")}</tr></thead>
      <tbody>${basicRows.map(row => `<tr>${(Array.isArray(row)?row:[]).map(v => `<td>${v != null ? v : "—"}</td>`).join("")}</tr>`).join("")}</tbody>
    </table>
  </div>` : "";

  const moreTable = moreHeaders.length && moreRows.length ? `
  <div class="section-wrap">
    <div class="section-title">Additional Data</div>
    <table>
      <thead><tr>${moreHeaders.map(h => `<th>${h}</th>`).join("")}</tr></thead>
      <tbody>${moreRows.map(row => `<tr>${(Array.isArray(row)?row:[]).map(v => `<td>${v != null ? v : "—"}</td>`).join("")}</tr>`).join("")}</tbody>
    </table>
  </div>` : "";

  const featuresHtml = features.length ? `
  <div class="section-wrap">
    <div class="section-title">Key Features</div>
    <ul style="margin:0;padding-left:18px;">
      ${features.map(f => `<li style="font-size:12px;color:#334155;margin-bottom:4px;">${stripVendor(f)}</li>`).join("")}
    </ul>
  </div>` : "";

  const __macHtml = `<!DOCTYPE html><html><head><title>Tear Sheet — ${record.part_number}</title>
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family:'Segoe UI',Arial,sans-serif; color:#111; background:#fff; }
  @media print { body { -webkit-print-color-adjust:exact; print-color-adjust:exact; } }
  .header { background:#0f2340; color:#fff; padding:22px 32px; display:flex; align-items:center; justify-content:space-between; }
  .header-title { font-size:22px; font-weight:800; letter-spacing:0.3px; }
  .header-sub { font-size:12px; color:rgba(255,255,255,0.55); margin-top:3px; }
  .header-meta { text-align:right; font-size:11px; color:rgba(255,255,255,0.45); }
  .accent-bar { height:4px; background:linear-gradient(90deg,#2d8a4e,#1a3a5c); }
  .body { padding:24px 32px; }
  .product-hero { display:flex; gap:24px; align-items:flex-start; margin-bottom:20px; padding-bottom:20px; border-bottom:1px solid #e5e7eb; }
  .product-img { width:150px; height:110px; object-fit:contain; border:1px solid #e5e7eb; border-radius:6px; padding:8px; background:#f8fafc; flex-shrink:0; }
  .product-name { font-size:26px; font-weight:900; color:#0f2340; line-height:1.1; }
  .product-type { font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:1px; color:#2d8a4e; margin-bottom:6px; }
  .product-sub { font-size:14px; color:#64748b; margin-top:4px; }
  .desc-box { background:#f8fafc; border-left:3px solid #1a3a5c; border-radius:4px; padding:10px 14px; font-size:12px; color:#334155; line-height:1.7; margin-bottom:18px; }
  .section-title { font-size:11px; font-weight:800; text-transform:uppercase; letter-spacing:1px; color:#1a3a5c; margin-bottom:8px; padding-bottom:4px; border-bottom:2px solid #e2e8f0; }
  .section-wrap { margin-bottom:20px; }
  table { width:100%; border-collapse:collapse; font-size:11px; margin-top:6px; }
  thead tr { background:#0f2340; }
  thead th { padding:7px 10px; color:#fff; font-weight:700; text-align:left; white-space:nowrap; }
  tbody tr:nth-child(even) { background:#f8fafc; }
  tbody td { padding:6px 10px; border-bottom:1px solid #e5e7eb; color:#334155; }
  tbody td:first-child { font-weight:600; color:#0f2340; }
  .footer { margin-top:24px; padding-top:12px; border-top:1px solid #e5e7eb; display:flex; justify-content:space-between; align-items:center; }
  .footer-left { font-size:10px; color:#94a3b8; }
  .footer-right { font-size:10px; color:#94a3b8; text-align:right; }
  .confidential { font-size:9px; text-transform:uppercase; letter-spacing:1px; color:#cbd5e1; }
  .no-print { margin:16px 32px; display:flex; gap:10px; }
  @media print { .no-print { display:none !important; } }
  .btn { padding:8px 18px; border:none; border-radius:6px; cursor:pointer; font-size:13px; font-weight:700; }
  .btn-primary { background:#0f2340; color:#fff; }
  .btn-secondary { background:#f1f5f9; color:#334155; border:1px solid #e2e8f0; }
</style></head><body>
<div class="no-print">
  <button class="btn btn-primary" onclick="window.print()">Print / Save PDF</button>
  <button class="btn btn-secondary" onclick="window.close()">Close</button>
</div>
<div class="header">
  <div class="header-left">
    <img src="https://media.base44.com/images/public/69dd9ffccab4dd693d4d92f5/e48ee59d9_Unitingthestrongestlinks_20251031_225809_0000.png" style="max-height:38px;width:auto;filter:brightness(0) invert(1);opacity:0.92;" alt="Uniking Canada" />
  </div>
  <div class="header-meta">
    <div style="font-size:13px;font-weight:700;color:#fff;">${record.part_number}</div>
    <div>${record.product_type}${record.category ? " · " + record.category : ""}</div>
    <div style="margin-top:4px;">${date}</div>
  </div>
</div>
<div class="accent-bar"></div>
<div class="body">
  <div class="product-hero">
    ${img ? `<img class="product-img" src="${img}" alt="${record.part_number}" />` : ""}
    <div>
      <div class="product-type">${record.product_type}${record.category ? " · " + record.category : ""}</div>
      <div class="product-name">${record.part_number}</div>
      ${record.subcategory ? `<div class="product-sub">${record.subcategory}</div>` : ""}
    </div>
  </div>

  ${diagImg ? `
  <div class="section-wrap">
    <div class="section-title">Dimensional Drawing</div>
    <div style="text-align:center;margin-bottom:8px;">
      <img src="${diagImg}" alt="Dimensional Drawing" style="max-width:100%;max-height:260px;object-fit:contain;border:1px solid #e5e7eb;border-radius:6px;padding:10px;background:#f8fafc;" />
    </div>
  </div>` : ""}

  ${record.description ? `<div class="desc-box">${stripVendor(record.description)}</div>` : ""}

  ${basicTable}
  ${moreTable}
  ${featuresHtml}

  <div class="footer">
    <div class="footer-left">
      <img src="https://media.base44.com/images/public/69dd9ffccab4dd693d4d92f5/e48ee59d9_Unitingthestrongestlinks_20251031_225809_0000.png" style="max-height:20px;width:auto;opacity:0.65;margin-bottom:4px;" alt="Uniking Canada" /><br/>
      <div>unikingcanada.com · rfq@unikingcanada.com</div>
      <div class="confidential">Confidential — Internal Use Only</div>
    </div>
    <div class="footer-right">
      <div>${record.part_number}${record.subcategory ? " / " + record.subcategory : ""}</div>
      <div style="margin-top:2px;">No pricing information included</div>
    </div>
  </div>
</div>
</body></html>`;
  const __blob2 = new Blob([__macHtml], {type:'text/html'});
  const __url2 = URL.createObjectURL(__blob2);
  window.open(__url2, '_blank');
}


// ─── Sprocket Table ───────────────────────────────────────────────────────────

function SprocketTable({ data }) {
  const parsed = parseJSON(data);
  if (!parsed) return <div style={{ color: C.muted, fontSize: 13 }}>No sprocket data available for this series.</div>;

  // New format: { types: [{label, note, headers, rows}], compatible_series, sprocket_pages }
  if (!Array.isArray(parsed) && parsed.types) {
    const { types, sprocket_pages } = parsed;
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {sprocket_pages && (
          <div style={{ fontSize: 12, color: C.muted }}>Catalog pages: {sprocket_pages}</div>
        )}
        {types.map((t, ti) => (
          <div key={ti}>
            <div style={{ fontSize: 12, fontWeight: 700, color: C.navyMid, marginBottom: 4 }}>{t.label}</div>
            {t.note && <div style={{ fontSize: 11, color: C.muted, marginBottom: 6 }}>{t.note}</div>}
            <SimpleDataTable headers={t.headers} rows={t.rows} firstColBold={true} />
          </div>
        ))}
      </div>
    );
  }

  // Legacy format: plain array of objects (Intralox CatalogProduct style)
  const rows = Array.isArray(parsed) ? parsed : [];
  if (!rows.length) return <div style={{ color: C.muted, fontSize: 13 }}>No sprocket data available for this series.</div>;

  const cols = ["type","material","teeth","pitch_dia_in","pitch_dia_mm","outer_dia_in","outer_dia_mm","hub_width_in","hub_width_mm"];
  const labels = { type:"Type", material:"Material", teeth:"Teeth", pitch_dia_in:"Pitch Dia (in)", pitch_dia_mm:"Pitch Dia (mm)", outer_dia_in:"Outer Dia (in)", outer_dia_mm:"Outer Dia (mm)", hub_width_in:"Hub W (in)", hub_width_mm:"Hub W (mm)" };
  const active = cols.filter(k => rows.some(r => r[k] != null && r[k] !== ""));

  const groups = {};
  for (const row of rows) {
    const t = row.type || "One-Piece";
    if (!groups[t]) groups[t] = [];
    groups[t].push(row);
  }

  return (
    <div>
      {Object.entries(groups).map(([grpType, grpRows]) => (
        <div key={grpType} style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.8, color: C.navyMid, marginBottom: 6 }}>{grpType} Sprockets</div>
          <div style={{ overflowX: "auto", borderRadius: 6, border: "1px solid " + C.border }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
              <thead>
                <tr style={{ background: C.navyMid }}>
                  {active.filter(k => k !== "type").map(k => (
                    <th key={k} style={{ padding: "7px 10px", color: "#fff", fontWeight: 700, textAlign: "left", whiteSpace: "nowrap" }}>{labels[k]}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {grpRows.map((row, i) => (
                  <tr key={i} style={{ background: i % 2 === 0 ? "#f8fafc" : "#fff", borderBottom: "1px solid " + C.border }}>
                    {active.filter(k => k !== "type").map(k => (
                      <td key={k} style={{ padding: "6px 10px", color: k === "material" ? C.navyMid : C.text, fontWeight: k === "material" ? 700 : 400, whiteSpace: "nowrap" }}>
                        {row[k] != null ? String(row[k]) : "—"}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Belt Data Table ──────────────────────────────────────────────────────────

// ─── Simple row table renderer ────────────────────────────────────────────────
function SimpleDataTable({ headers, rows, firstColBold }) {
  if (!headers || !rows || !rows.length) return null;
  return (
    <div style={{ overflowX: "auto", borderRadius: 6, border: "1px solid " + C.border, marginBottom: 2 }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
        <thead>
          <tr style={{ background: C.navyMid }}>
            {headers.map((h, i) => <th key={i} style={{ padding: "8px 10px", color: "#fff", fontWeight: 700, textAlign: "left", whiteSpace: "nowrap" }}>{h}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} style={{ background: i % 2 === 0 ? "#f8fafc" : "#fff", borderBottom: "1px solid " + C.border }}>
              {row.map((cell, j) => (
                <td key={j} style={{ padding: "7px 10px", color: (firstColBold && j === 0) ? C.navyMid : C.text, fontWeight: (firstColBold && j === 0) ? 700 : 400, whiteSpace: "nowrap" }}>
                  {cell != null ? String(cell) : "—"}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function BeltDataTable({ data }) {
  const parsed = parseJSON(data);
  if (!parsed) return null;

  // Legacy format: plain array of objects (Intralox CatalogProduct style)
  if (Array.isArray(parsed)) {
    if (!parsed.length) return null;
    const keys = ["material","strength_lbf","strength_nm","temp_min_f","temp_max_f","mass_lbft2","mass_kgm2"];
    const labels = { material:"Material", strength_lbf:"Strength (lbf)", strength_nm:"Strength (N/m)", temp_min_f:"Min °F", temp_max_f:"Max °F", mass_lbft2:"lb/ft²", mass_kgm2:"kg/m²" };
    const cols = keys.filter(k => parsed.some(r => r[k] != null && r[k] !== ""));
    return (
      <div style={{ overflowX: "auto", borderRadius: 6, border: "1px solid " + C.border }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
          <thead>
            <tr style={{ background: C.navyMid }}>
              {cols.map(k => <th key={k} style={{ padding: "8px 10px", color: "#fff", fontWeight: 700, textAlign: "left", whiteSpace: "nowrap" }}>{labels[k]}</th>)}
            </tr>
          </thead>
          <tbody>
            {parsed.map((row, i) => (
              <tr key={i} style={{ background: i % 2 === 0 ? "#f8fafc" : "#fff", borderBottom: "1px solid " + C.border }}>
                {cols.map(k => (
                  <td key={k} style={{ padding: "7px 10px", color: k === "material" ? C.navyMid : C.text, fontWeight: k === "material" ? 700 : 400, whiteSpace: "nowrap" }}>
                    {row[k] != null ? String(row[k]) : "—"}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  // New grouped format: { headers, groups: [{label, rows}], variants: [{label, headers, rows, note}] }
  const { headers, groups, variants } = parsed;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {groups && groups.map((grp, gi) => (
        <div key={gi}>
          <div style={{ fontWeight: 700, fontSize: 13, color: C.navyMid, marginBottom: 6, paddingLeft: 2 }}>{grp.label}</div>
          <SimpleDataTable headers={headers} rows={grp.rows} firstColBold={false} />
        </div>
      ))}
      {variants && variants.length > 0 && (
        <div>
          <div style={{ fontWeight: 700, fontSize: 13, color: C.slate, marginBottom: 10, borderTop: "1px solid " + C.border, paddingTop: 14 }}>Variants</div>
          {variants.map((v, vi) => (
            <div key={vi} style={{ marginBottom: 16 }}>
              <div style={{ fontWeight: 600, fontSize: 12, color: C.muted, marginBottom: 5 }}>{v.label}{v.note ? <span style={{ fontWeight: 400, marginLeft: 8 }}>— {v.note}</span> : ""}</div>
              <SimpleDataTable headers={v.headers || headers} rows={v.rows} firstColBold={false} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Spec Table ───────────────────────────────────────────────────────────────

function SpecTable({ specs }) {
  const entries = Object.entries(specs).filter(([, v]) => v != null && v !== "" && v !== "N/A" && String(v) !== "undefined");
  if (!entries.length) return <div style={{ color: C.muted, fontSize: 13 }}>No specifications available.</div>;
  return (
    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
      <tbody>
        {entries.map(([k, v], i) => (
          <tr key={k} style={{ background: i % 2 ? "#f8fafc" : "#fff" }}>
            <td style={{ padding: "8px 12px", color: C.muted, fontWeight: 600, width: "40%", verticalAlign: "top", borderBottom: "1px solid " + C.border }}>{k}</td>
            <td style={{ padding: "8px 12px", color: C.text, borderBottom: "1px solid " + C.border, lineHeight: 1.5 }}>{String(v)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// ─── Product Modal ────────────────────────────────────────────────────────────

function ProductModal({ product, showBrand, onClose }) {
  const [tab, setTab] = useState("specs");
  if (!product) return null;
  const typeDef = TYPE_MAP[product.type];

  const parsedBeltData = parseJSON(product.belt_data);
  const hasBelt = !!(parsedBeltData && (Array.isArray(parsedBeltData) ? parsedBeltData.length : (parsedBeltData.groups?.length || parsedBeltData.rows?.length)));
  const parsedSprocketData = parseJSON(product.sprocket_data);
  const hasSprocket = !!(parsedSprocketData && (Array.isArray(parsedSprocketData) ? parsedSprocketData.length : parsedSprocketData.types?.length));

  const tabs = [
    ["specs", "Specifications"],
    hasBelt ? ["belt", parsedBeltData && !Array.isArray(parsedBeltData) ? "Materials" : "Belt Data"] : null,
    hasSprocket ? ["sprockets", "Sprockets"] : null,
    (product.catalog_url || product.tech_doc_url) ? ["docs", "Documents"] : null,
  ].filter(Boolean);

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 1000, display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "16px 12px", overflowY: "auto" }}>
      <div onClick={e => e.stopPropagation()} style={{ background: "#fff", borderRadius: 10, width: "100%", maxWidth: 700, display: "flex", flexDirection: "column", boxShadow: "0 24px 64px rgba(0,0,0,0.22)", marginTop: "auto", marginBottom: "auto" }}>

        {/* Header */}
        <div style={{ background: C.navyMid, padding: "20px 26px", borderRadius: "10px 10px 0 0", flexShrink: 0 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div style={{ display: "flex", gap: 16, alignItems: "flex-start", flex: 1 }}>
              {product.image_url ? (
                <div style={{ background: "#ffffff", borderRadius: 8, padding: 8, flexShrink: 0, width: 100, height: 76, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <img src={product.image_url} alt="" style={{ maxWidth: 90, maxHeight: 68, objectFit: "contain" }} onError={e => { e.target.parentElement.style.display = "none"; }} />
                </div>
              ) : null}
              <div>
                <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "1.5px", color: "rgba(255,255,255,0.4)", marginBottom: 5 }}>
                  {typeDef?.label || product.type}{showBrand && product.brand ? " · " + product.brand : ""}
                </div>
                <div style={{ fontSize: 19, fontWeight: 800, color: "#fff", lineHeight: 1.25 }}>{product.series}</div>
                {product.style && product.style !== product.series ? (
                  <div style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", marginTop: 3 }}>{product.style}</div>
                ) : null}
                <div style={{ display: "flex", gap: 6, marginTop: 8, flexWrap: "wrap" }}>
                  {product.pitch_in ? <span style={{ background: "rgba(255,255,255,.15)", color: "#fff", padding: "2px 8px", borderRadius: 99, fontSize: 10, fontWeight: 700 }}>{product.pitch_in}</span> : null}
                  {product.hinge_style ? <span style={{ background: "rgba(255,255,255,.15)", color: "#fff", padding: "2px 8px", borderRadius: 99, fontSize: 10, fontWeight: 700 }}>{product.hinge_style}</span> : null}
                  {product.open_area ? <span style={{ background: "rgba(255,255,255,.15)", color: "#fff", padding: "2px 8px", borderRadius: 99, fontSize: 10, fontWeight: 700 }}>{product.open_area} open</span> : null}
                </div>
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-end", flexShrink: 0 }}>
              <button onClick={onClose} style={{ background: "rgba(255,255,255,0.12)", border: "none", color: "#fff", width: 30, height: 30, borderRadius: 6, cursor: "pointer", fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
              {product.diagram_image ? (
                <a href={product.diagram_image} target="_blank" rel="noopener noreferrer" style={{ background: "rgba(45,137,78,0.3)", border: "1px solid rgba(45,137,78,0.6)", color: "#fff", padding: "5px 12px", borderRadius: 6, cursor: "pointer", fontSize: 11, fontWeight: 700, whiteSpace: "nowrap", textDecoration: "none", display: "block", textAlign: "center" }}>
                  Drawing
                </a>
              ) : null}
              <button onClick={() => printTearSheet(product)} style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.3)", color: "#fff", padding: "5px 12px", borderRadius: 6, cursor: "pointer", fontSize: 11, fontWeight: 700, whiteSpace: "nowrap" }}>
                Print Tear Sheet
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        {tabs.length > 1 ? (
          <div style={{ display: "flex", borderBottom: "2px solid " + C.border, padding: "0 26px" }}>
            {tabs.map(([id, label]) => (
              <button key={id} onClick={() => setTab(id)} style={{ padding: "10px 14px", border: "none", background: "none", cursor: "pointer", fontSize: 12, fontWeight: 700, color: tab === id ? C.navyMid : C.muted, borderBottom: tab === id ? "2px solid " + C.navyMid : "2px solid transparent", marginBottom: -2, whiteSpace: "nowrap" }}>
                {label}
              </button>
            ))}
          </div>
        ) : null}

        {/* Body */}
        <div style={{ padding: "20px 26px 24px", overflowY: "auto" }}>
          {tab === "specs" && (
            <div>
              {product.notes && stripVendor(product.notes) ? (
                <div style={{ marginBottom: 16, fontSize: 13, color: C.slate, lineHeight: 1.75, background: C.bg, padding: "12px 14px", borderRadius: 6, borderLeft: "3px solid " + C.navyMid }}>
                  {stripVendor(product.notes)}
                </div>
              ) : null}
              <div style={{ border: "1px solid " + C.border, borderRadius: 6, overflow: "hidden" }}>
                <SpecTable specs={product.specs} />
              </div>
            </div>
          )}
          {tab === "belt" && (
            <div>
              <p style={{ fontSize: 12, color: C.muted, marginBottom: 12 }}>Mechanical properties per material option. Strength ratings are per metre of belt width.</p>
              <BeltDataTable data={product.belt_data} />
            </div>
          )}
          {tab === "sprockets" && (
            <div>
              <p style={{ fontSize: 12, color: C.muted, marginBottom: 14 }}>All belts in the {product.series} use the same sprocket family. Sprockets are shared across styles within this series.</p>
              <SprocketTable data={product.sprocket_data} />
            </div>
          )}
          {tab === "docs" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {product.catalog_url ? (
                <a href={product.catalog_url} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: 10, padding: "11px 14px", background: C.bg, borderRadius: 8, border: "1px solid " + C.border, color: C.navyMid, fontWeight: 700, fontSize: 13, textDecoration: "none" }}>
                  View Catalog PDF
                </a>
              ) : null}
              {product.tech_doc_url ? (
                <a href={product.tech_doc_url} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: 10, padding: "11px 14px", background: C.bg, borderRadius: 8, border: "1px solid " + C.border, color: C.navyMid, fontWeight: 700, fontSize: 13, textDecoration: "none" }}>
                  Technical Documentation
                </a>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Product Card ─────────────────────────────────────────────────────────────

function ProductCard({ product, showBrand, onClick }) {
  const [hovered, setHovered] = useState(false);
  const [added, setAdded] = useState(() => getRFQCart().some(i => i.id === product.id));
  const topSpecs = Object.entries(product.specs)
    .filter(([, v]) => v != null && v !== "" && v !== "N/A" && String(v) !== "undefined")
    .slice(0, 3);

  useEffect(() => {
    const update = () => setAdded(getRFQCart().some(i => i.id === product.id));
    window.addEventListener("rfq_cart_updated", update);
    return () => window.removeEventListener("rfq_cart_updated", update);
  }, [product.id]);

  function handleAddRFQ(e) {
    e.stopPropagation();
    if (added) { setCurrentPage("rfqCart"); return; }
    addToRFQCart(product);
    setAdded(true);
  }

  return (
    <div onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      style={{ background: C.card, borderRadius: 10, border: "1px solid " + (hovered ? C.navyLight : C.border), boxShadow: hovered ? "0 4px 16px rgba(15,35,64,0.10)" : "0 1px 4px rgba(15,35,64,0.05)", transition: "border-color 0.15s, box-shadow 0.15s", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <div style={{ height: 3, background: C.navyMid, flexShrink: 0 }} />
      {product.image_url ? (
        <div onClick={() => onClick(product)} style={{ background: "#f8fafc", borderBottom: "1px solid #f1f5f9", height: 110, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", cursor: "pointer" }}>
          <img src={product.image_url} alt="" style={{ maxHeight: 98, maxWidth: "86%", objectFit: "contain" }} onError={e => { e.target.parentElement.style.display = "none"; }} />
        </div>
      ) : null}
      <div onClick={() => onClick(product)} style={{ padding: "13px 15px", flex: 1, display: "flex", flexDirection: "column", gap: 5, cursor: "pointer" }}>
        {showBrand && product.brand ? (
          <span style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.8px", color: C.navyMid, background: "#eef3f8", padding: "2px 7px", borderRadius: 3, alignSelf: "flex-start" }}>{product.brand}</span>
        ) : null}
        <div style={{ fontSize: 14, fontWeight: 700, color: C.text, lineHeight: 1.3 }}>{product.series}</div>
        {product.style && product.style !== product.series ? <div style={{ fontSize: 12, color: C.muted }}>{product.style}</div> : null}
        {topSpecs.length > 0 ? (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginTop: 4 }}>
            {topSpecs.map(([k, v]) => (
              <div key={k} style={{ fontSize: 11, background: C.bg, border: "1px solid " + C.border, borderRadius: 3, padding: "2px 7px", color: C.slate }}>
                <span style={{ color: C.muted }}>{k}: </span>
                {String(v).length > 20 ? String(v).slice(0, 20) + "…" : String(v)}
              </div>
            ))}
          </div>
        ) : null}
      </div>
      <div style={{ borderTop: "1px solid " + C.bg, padding: "8px 15px", background: hovered ? "#f1f5f9" : C.card, transition: "background 0.13s", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span onClick={() => onClick(product)} style={{ fontSize: 11, fontWeight: 600, color: C.navyMid, cursor: "pointer" }}>View Specifications ›</span>
        <button onClick={handleAddRFQ} style={{ padding: "4px 10px", borderRadius: 5, fontSize: 11, fontWeight: 700, cursor: "pointer", border: added ? "1px solid #16a34a" : "1px solid #2563eb", background: added ? "#f0fdf4" : "#eff6ff", color: added ? "#16a34a" : "#2563eb", whiteSpace: "nowrap", transition: "all 0.15s" }}>
          {added ? "✓ In RFQ" : "+ Add to RFQ"}
        </button>
      </div>
    </div>
  );
}


// ─── Product List Row (list view) ────────────────────────────────────────────

function ProductListRow({ product, showBrand, onClick }) {
  const [hovered, setHovered] = useState(false);
  const [added, setAdded] = useState(() => getRFQCart().some(i => i.id === product.id));
  const topSpecs = Object.entries(product.specs)
    .filter(([, v]) => v != null && v !== "" && v !== "N/A" && String(v) !== "undefined")
    .slice(0, 4);

  useEffect(() => {
    const update = () => setAdded(getRFQCart().some(i => i.id === product.id));
    window.addEventListener("rfq_cart_updated", update);
    return () => window.removeEventListener("rfq_cart_updated", update);
  }, [product.id]);

  function handleAddRFQ(e) {
    e.stopPropagation();
    if (added) { setCurrentPage("rfqCart"); return; }
    addToRFQCart(product);
    setAdded(true);
  }

  return (
    <div onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      style={{ background: C.card, borderRadius: 10, border: "1px solid " + (hovered ? C.navyLight : C.border), boxShadow: hovered ? "0 2px 8px rgba(15,35,64,0.08)" : "0 1px 3px rgba(15,35,64,0.04)", transition: "border-color 0.15s, box-shadow 0.15s", display: "flex", alignItems: "center", gap: 0, overflow: "hidden", cursor: "pointer" }}>
      {/* Accent bar */}
      <div style={{ width: 3, alignSelf: "stretch", background: C.navyMid, flexShrink: 0 }} />
      {/* Image */}
      {product.image_url ? (
        <div onClick={() => onClick(product)} style={{ width: 64, height: 56, display: "flex", alignItems: "center", justifyContent: "center", background: "#f8fafc", borderRight: "1px solid #f1f5f9", flexShrink: 0 }}>
          <img src={product.image_url} alt="" style={{ maxHeight: 48, maxWidth: 56, objectFit: "contain" }} onError={e => { e.target.parentElement.style.display = "none"; }} />
        </div>
      ) : null}
      {/* Name + specs */}
      <div onClick={() => onClick(product)} style={{ flex: 1, padding: "10px 14px", minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 10, flexWrap: "wrap" }}>
          {showBrand && product.brand ? (
            <span style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.8px", color: C.navyMid, background: "#eef3f8", padding: "1px 6px", borderRadius: 3 }}>{product.brand}</span>
          ) : null}
          <span style={{ fontSize: 14, fontWeight: 800, color: C.text }}>{product.series}</span>
          {product.style && product.style !== product.series ? <span style={{ fontSize: 12, color: C.muted }}>{product.style}</span> : null}
        </div>
        {topSpecs.length > 0 ? (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 5 }}>
            {topSpecs.map(([k, v]) => (
              <span key={k} style={{ fontSize: 11, color: C.slate }}>
                <span style={{ color: C.muted }}>{k}: </span>
                <span style={{ fontWeight: 600 }}>{String(v).length > 22 ? String(v).slice(0, 22) + "…" : String(v)}</span>
              </span>
            ))}
          </div>
        ) : null}
      </div>
      {/* Actions */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "0 14px", flexShrink: 0 }}>
        <button onClick={handleAddRFQ} style={{ padding: "5px 10px", borderRadius: 5, fontSize: 11, fontWeight: 700, cursor: "pointer", border: added ? "1px solid #16a34a" : "1px solid #2563eb", background: added ? "#f0fdf4" : "#eff6ff", color: added ? "#16a34a" : "#2563eb", whiteSpace: "nowrap", transition: "all 0.15s" }}>
          {added ? "✓ In RFQ" : "+ RFQ"}
        </button>
        <span onClick={() => onClick(product)} style={{ fontSize: 11, fontWeight: 600, color: C.navyMid, whiteSpace: "nowrap" }}>View ›</span>
      </div>
    </div>
  );
}

// ─── Filter Bar ───────────────────────────────────────────────────────────────

function FilterBar({ typeKey, allProducts, activeFilters, onChange }) {
  const fields = TYPE_MAP[typeKey]?.filters || [];
  const hasActive = Object.values(activeFilters).some(Boolean);
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 14, alignItems: "flex-end", marginBottom: 22 }}>
      {fields.map(field => {
        const options = getFilterOptions(allProducts, field);
        if (options.length < 2) return null;
        const label = FILTER_LABELS[field] || field;
        const active = activeFilters[field] || "";
        return (
          <div key={field}>
            <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.8px", color: C.muted, marginBottom: 4 }}>{label}</div>
            <select value={active} onChange={e => onChange(field, e.target.value)}
              style={{ padding: "7px 10px", border: "1px solid " + (active ? C.navyMid : C.border), borderRadius: 5, fontSize: 12, color: active ? C.navyMid : C.slate, fontWeight: active ? 600 : 400, background: active ? "#eef3f8" : "#fff", cursor: "pointer", outline: "none", minWidth: 150 }}>
              <option value="">All</option>
              {options.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
        );
      })}
      {hasActive && (
        <button onClick={() => onChange("__clear__", null)} style={{ padding: "7px 14px", background: "none", border: "1px solid " + C.border, borderRadius: 5, fontSize: 12, color: C.muted, cursor: "pointer", alignSelf: "flex-end" }}>
          Clear All
        </button>
      )}
    </div>
  );
}

// ─── View Toggle Button ───────────────────────────────────────────────────────

function ViewToggle({ view, onChange }) {
  return (
    <div style={{ display: "flex", border: "1px solid " + C.border, borderRadius: 7, overflow: "hidden" }}>
      {[
        { key: "grid", icon: "⊞", title: "Card view" },
        { key: "list", icon: "☰", title: "List view" },
      ].map(({ key, icon, title }) => (
        <button key={key} title={title} onClick={() => onChange(key)}
          style={{ padding: "6px 11px", background: view === key ? C.navy : "#fff", color: view === key ? "#fff" : C.muted, border: "none", cursor: "pointer", fontSize: 15, fontWeight: 700, transition: "background 0.15s, color 0.15s", borderRight: key === "grid" ? "1px solid " + C.border : "none" }}>
          {icon}
        </button>
      ))}
    </div>
  );
}

// ─── Product List ─────────────────────────────────────────────────────────────

function ProductList({ typeKey, brand, products: allProducts, showBrand, rawMacRecords }) {
  const [activeFilters, setActiveFilters] = useState({});
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [viewMode, setViewMode] = useState("grid");

  const filtered = useMemo(() => {
    let list = applyFilters(allProducts, activeFilters);
    const q = search.trim().toLowerCase();
    if (q) {
      function searchStr(p) {
        return [p.series, p.style, p.category, p.notes, p.materials, p.application, p.type].filter(Boolean).join(" ").toLowerCase();
      }
      function fuzzyScore(str, pattern) {
        let score = 0, si = 0, pi = 0, consecutive = 0;
        while (si < str.length && pi < pattern.length) {
          if (str[si] === pattern[pi]) {
            consecutive++;
            score += consecutive * 2;
            if (si === 0 || str[si-1] === " " || str[si-1] === "-") score += 5;
            if (si === 0) score += 8;
            pi++;
          } else { consecutive = 0; }
          si++;
        }
        if (pi < pattern.length) return -1;
        score -= str.length * 0.1;
        return score;
      }
      const words = q.split(/\s+/);
      const scored = list.map(p => {
        const str = searchStr(p);
        if (words.length > 1) {
          const allFuzzy = words.every(w => fuzzyScore(str, w) >= 0);
          if (!allFuzzy) return null;
          const total = words.reduce((acc, w) => acc + Math.max(fuzzyScore(str, w), 0), 0);
          return { p, score: total };
        }
        const s = fuzzyScore(str, q);
        if (s < 0) return null;
        return { p, score: s };
      }).filter(Boolean);
      return scored.sort((a, b) => b.score - a.score).map(s => s.p);
    }
    return list.sort((a, b) => {
      const na = parseFloat((a.series || "").replace(/[^\d.]/g, "")) || 0;
      const nb = parseFloat((b.series || "").replace(/[^\d.]/g, "")) || 0;
      if (na !== nb) return na - nb;
      return (a.style || "").localeCompare(b.style || "");
    });
  }, [allProducts, activeFilters, search]);

  function handleFilter(field, val) {
    if (field === "__clear__") { setActiveFilters({}); return; }
    setActiveFilters(prev => ({ ...prev, [field]: val }));
  }

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, flexWrap: "wrap", gap: 10 }}>
        <div>
          <div style={{ fontSize: 19, fontWeight: 800, color: C.text }}>{TYPE_MAP[typeKey]?.label || typeKey}{brand ? " — " + brand : ""}</div>
          <div style={{ fontSize: 13, color: C.muted, marginTop: 2 }}>{filtered.length} product{filtered.length !== 1 ? "s" : ""}</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..."
            style={{ padding: "8px 13px", border: "1px solid " + C.border, borderRadius: 6, fontSize: 13, outline: "none", width: 180 }} />
          <ViewToggle view={viewMode} onChange={setViewMode} />
        </div>
      </div>
      <FilterBar typeKey={typeKey} allProducts={allProducts} activeFilters={activeFilters} onChange={handleFilter} />
      {filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: 60, color: C.muted, fontSize: 14 }}>No products match your filters.</div>
      ) : viewMode === "grid" ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 14 }}>
          {filtered.map(p => <ProductCard key={p.id} product={p} showBrand={showBrand} onClick={setSelected} />)}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {filtered.map(p => <ProductListRow key={p.id} product={p} showBrand={showBrand} onClick={setSelected} />)}
        </div>
      )}
      {(() => {
        if (!selected) return null;
        if (selected._source === "allied") {
          const rawRecord = (rawMacRecords || []).find(r => r.id === selected.id) || null;
          if (rawRecord) return <MacProductModal record={rawRecord} slugMap={{}} sprocketMap={{}} loadSprockets={() => {}} onSelect={() => {}} onClose={() => setSelected(null)} />;
        }
        return <ProductModal product={selected} showBrand={showBrand} onClose={() => setSelected(null)} />;
      })()}
    </div>
  );
}

// ─── Type Grid ────────────────────────────────────────────────────────────────

function TypeGrid({ types, counts, onSelect }) {
  const [hovered, setHovered] = useState(null);

  // Separate chain types from non-chain types
  const chainTypes = types.filter(t => CHAIN_SUBTYPE_KEYS.has(t.key));
  const nonChainTypes = types.filter(t => !CHAIN_SUBTYPE_KEYS.has(t.key));
  const totalChainProducts = chainTypes.reduce((sum, t) => sum + (counts[t.key] || 0), 0);

  // Build display list: Chain mega card first, then non-chain types
  const displayItems = [
    { key: "__chain__", label: "Chain", description: "Roller chain, engineered, welded steel, pintle and specialty chains for all industrial applications", _isChain: true },
    ...nonChainTypes,
  ];

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 22, fontWeight: 800, color: C.text, marginBottom: 4 }}>Product Catalog</div>
        <div style={{ fontSize: 14, color: C.muted }}>Select a product category to browse specifications</div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 14 }}>
        {displayItems.map(t => (
          <div key={t.key} onClick={() => onSelect(t.key)} onMouseEnter={() => setHovered(t.key)} onMouseLeave={() => setHovered(null)}
            style={{ background: hovered === t.key ? C.navyMid : C.card, border: "1px solid " + (hovered === t.key ? C.navyMid : C.border), borderRadius: 8, padding: "18px 20px", cursor: "pointer", transition: "all 0.15s", display: "flex", flexDirection: "column", gap: 6 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: hovered === t.key ? "#fff" : C.text }}>{t.label}</div>
            <div style={{ fontSize: 12, color: hovered === t.key ? "rgba(255,255,255,0.65)" : C.muted, lineHeight: 1.5 }}>{t.description}</div>
            <div style={{ fontSize: 11, color: hovered === t.key ? "rgba(255,255,255,0.45)" : C.muted, marginTop: 4 }}>
              {t._isChain
                ? `${chainTypes.length} subcategories · ${totalChainProducts} products`
                : counts[t.key] ? `${counts[t.key]} products` : "View →"}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


// ─── Engineered Chain Subcategory Grid ────────────────────────────────────────

function EngineeredSubGrid({ allProducts, onSelect }) {
  const [hovered, setHovered] = useState(null);
  const subCounts = useMemo(() => {
    const c = {};
    for (const p of allProducts) {
      if (p.type === "Engineered Chain" && p._source === "allied") {
        const sub = p._subcategory || "Other";
        c[sub] = (c[sub] || 0) + 1;
      }
    }
    return c;
  }, [allProducts]);

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 22, fontWeight: 800, color: C.text, marginBottom: 4 }}>Engineered Chain</div>
        <div style={{ fontSize: 14, color: C.muted }}>Select a chain class to browse products</div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 14 }}>
        {ENGINEERED_SUBCATEGORIES.map(sub => (
          <div key={sub.key} onClick={() => onSelect(sub.key)}
            onMouseEnter={() => setHovered(sub.key)} onMouseLeave={() => setHovered(null)}
            style={{ background: hovered === sub.key ? C.navyMid : C.card, border: "1px solid " + (hovered === sub.key ? C.navyMid : C.border), borderRadius: 8, padding: "18px 20px", cursor: "pointer", transition: "all 0.15s", display: "flex", flexDirection: "column", gap: 6 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: hovered === sub.key ? "#fff" : C.text }}>{sub.label}</div>
            <div style={{ fontSize: 12, color: hovered === sub.key ? "rgba(255,255,255,0.65)" : C.muted, lineHeight: 1.5 }}>{sub.description}</div>
            <div style={{ fontSize: 11, color: hovered === sub.key ? "rgba(255,255,255,0.45)" : C.muted, marginTop: 4 }}>
              {subCounts[sub.key] ? `${subCounts[sub.key]} products` : "View →"}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


// ─── ANSI/BS Chain Subcategory Grid ──────────────────────────────────────────

function AnsiSubGrid({ allProducts, onSelect }) {
  const [hovered, setHovered] = useState(null);
  const subCounts = useMemo(() => {
    const c = {};
    for (const p of allProducts) {
      if (p.type === "ANSI/BS Chain" && p._source === "allied") {
        const sub = p._subcategory || "Other";
        c[sub] = (c[sub] || 0) + 1;
      }
    }
    return c;
  }, [allProducts]);

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 22, fontWeight: 800, color: C.text, marginBottom: 4 }}>Performance Roller Chain</div>
        <div style={{ fontSize: 14, color: C.muted }}>Select a chain type to browse products</div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 14 }}>
        {ANSI_SUBCATEGORIES.map(sub => (
          <div key={sub.key} onClick={() => onSelect(sub.key)}
            onMouseEnter={() => setHovered(sub.key)} onMouseLeave={() => setHovered(null)}
            style={{ background: hovered === sub.key ? C.navyMid : C.card, border: "1px solid " + (hovered === sub.key ? C.navyMid : C.border), borderRadius: 8, padding: "18px 20px", cursor: "pointer", transition: "all 0.15s", display: "flex", flexDirection: "column", gap: 6 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: hovered === sub.key ? "#fff" : C.text }}>{sub.label}</div>
            <div style={{ fontSize: 12, color: hovered === sub.key ? "rgba(255,255,255,0.65)" : C.muted, lineHeight: 1.5 }}>{sub.description}</div>
            <div style={{ fontSize: 11, color: hovered === sub.key ? "rgba(255,255,255,0.45)" : C.muted, marginTop: 4 }}>
              {subCounts[sub.key] ? `${subCounts[sub.key]} products` : "View →"}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


// ─── Welded Steel Chain Series View ─────────────────────────────────────────

const WELDED_SERIES_LABELS = {
  "Offset Sidebar":   "Offset Sidebar (WR Series)",
  "Straight Sidebar": "Straight Sidebar (WRC Series)",
  "Drag Chain":       "Drag Chain (WD Series)",
  "Mega Mac":         "Mega Mac (WD-MM Series)",
  "Super Mac":        "Super Mac (WD-SM Series)",
};

// ─── Related Item Card (sprockets, pins, attachments) ────────────────────────

function RelatedCard({ item, full, onClick }) {
  const [hov, setHov] = useState(false);
  const [added, setAdded] = useState(() => getRFQCart().some(i => i.id === (full?.id || item.part_number)));
  useEffect(() => {
    const update = () => setAdded(getRFQCart().some(i => i.id === (full?.id || item.part_number)));
    window.addEventListener("rfq_cart_updated", update);
    return () => window.removeEventListener("rfq_cart_updated", update);
  }, [full, item.part_number]);

  function handleAddRFQ(e) {
    e.stopPropagation();
    if (added) { setCurrentPage("rfqCart"); return; }
    addToRFQCart({
      id: full?.id || item.part_number,
      _source: "mac",
      series: item.part_number,
      type: full?.product_type || item.category || "Related Item",
      style: item.name || item.category || "",
      category: item.category || "",
      image_url: item.image || full?.product_image || "",
      materials: "", application: "",
    });
    setAdded(true);
  }

  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        border: "1px solid " + (hov && full ? C.navyMid : C.border),
        borderRadius: 8,
        padding: "12px 14px",
        background: hov && full ? C.navyMid : C.bg,
        transition: "all 0.15s",
        display: "flex", flexDirection: "column",
      }}>
      {item.image && (
        <img src={item.image} alt={item.part_number} onClick={onClick}
          style={{ width:"100%", height:65, objectFit:"contain", marginBottom:8, borderRadius:4, cursor: full ? "pointer" : "default" }} />
      )}
      <div onClick={onClick} style={{ fontWeight:700, fontSize:13, color: hov && full ? "#fff" : C.text, marginBottom:2, cursor: full ? "pointer" : "default", flex:1 }}>
        {item.part_number}
      </div>
      <div onClick={onClick} style={{ fontSize:12, color: hov && full ? "rgba(255,255,255,0.65)" : C.muted, marginBottom:8, cursor: full ? "pointer" : "default" }}>
        {item.name || item.category}
      </div>
      <button onClick={handleAddRFQ}
        style={{ width:"100%", padding:"5px 8px", borderRadius:5, fontSize:11, fontWeight:700, cursor:"pointer",
          border: added ? "1px solid #16a34a" : "1px solid #2563eb",
          background: added ? "#f0fdf4" : (hov && full ? "rgba(255,255,255,0.15)" : "#eff6ff"),
          color: added ? "#16a34a" : (hov && full ? "#fff" : "#2563eb"),
          transition:"all 0.15s" }}>
        {added ? "✓ In RFQ" : "+ Add to RFQ"}
      </button>
    </div>
  );
}

function RFQButtonMac({ record }) {
  const [added, setAdded] = useState(() => getRFQCart().some(i => i.id === record.id));
  useEffect(() => {
    const update = () => setAdded(getRFQCart().some(i => i.id === record.id));
    window.addEventListener("rfq_cart_updated", update);
    return () => window.removeEventListener("rfq_cart_updated", update);
  }, [record.id]);
  function handle() {
    if (added) { setCurrentPage("rfqCart"); return; }
    addToRFQCart({
      id: record.id,
      _source: "mac",
      series: record.part_number,
      type: record.product_type || record.category || "",
      style: record.subcategory || "",
      category: record.category || "",
      image_url: record.product_image || "",
      materials: "", application: "",
    });
    setAdded(true);
  }
  return (
    <button onClick={handle}
      style={{ padding:"10px 20px", borderRadius:8, fontSize:13, fontWeight:700, cursor:"pointer", letterSpacing:"0.02em",
        border:"none",
        background: added ? C.greenBg : C.green,
        color: added ? C.green : "#fff",
        whiteSpace:"nowrap", transition:"all 0.15s" }}>
      {added ? "✓ Added to RFQ" : "Add to RFQ"}
    </button>
  );
}

function MacProductModal({ record, slugMap, sprocketMap, loadSprockets, onSelect, onClose }) {
  const [tab, setTab] = useState("specs");
  useEffect(() => { setTab("specs"); }, [record?.part_number]);
  if (!record) return null;

  const tabs = [
    { key: "specs", label: "Specifications" },
    record.related_sprockets?.length > 0 && { key: "sprockets", label: `Sprockets (${record.related_sprockets.length})` },
    record.related_pins?.length > 0 && { key: "pins", label: `Pins (${record.related_pins.length})` },
    record.related_attachments?.length > 0 && { key: "attachments", label: `Attachments (${record.related_attachments.length})` },
  ].filter(Boolean);

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.6)", zIndex:1000, display:"flex", alignItems:"flex-start", justifyContent:"center", padding:"16px 12px", overflowY:"auto" }}
      onClick={onClose}>
      <div style={{ background:C.card, borderRadius:12, maxWidth:900, width:"100%", minHeight:0, boxShadow:"0 20px 60px rgba(0,0,0,0.4)", marginTop:"auto", marginBottom:"auto" }}
        onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={{ padding:"20px clamp(14px,4vw,24px) 0", borderBottom:"1px solid "+C.border }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:12, marginBottom:12, flexWrap:"wrap" }}>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontSize:20, fontWeight:800, color:C.text, wordBreak:"break-word" }}>{record._specificPart || record.part_number}</div>
              <div style={{ fontSize:13, color:C.muted, marginTop:3 }}>{record.subcategory} · {record.product_type}</div>
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:8, flexShrink:0 }}>
              <button onClick={() => printMacTearSheet(record)} style={{ background:C.navy, border:"none", color:"#fff", padding:"7px 14px", borderRadius:8, cursor:"pointer", fontSize:12, fontWeight:700, letterSpacing:"0.02em" }}>
                Print Tear Sheet
              </button>
              <button onClick={onClose} style={{ background:"#f1f5f9", border:"none", fontSize:18, cursor:"pointer", color:C.muted, padding:"6px 10px", borderRadius:8, lineHeight:1 }}>×</button>
            </div>
          </div>
          <div style={{ marginBottom:12 }}>
            <RFQButtonMac record={record} />
          </div>
          {tabs.length > 1 && (
            <div style={{ display:"flex", gap:8, marginBottom:0 }}>
              {tabs.map(t => (
                <button key={t.key} onClick={() => setTab(t.key)}
                  style={{ padding:"8px 16px", background: tab===t.key ? C.navy : "transparent", color: tab===t.key ? "#fff" : C.muted, border: tab===t.key ? "none" : "1px solid "+C.border, borderRadius:"6px 6px 0 0", cursor:"pointer", fontSize:13, fontWeight: tab===t.key ? 700 : 400, marginBottom:-1 }}>
                  {t.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Body */}
        <div style={{ padding:"20px clamp(14px,4vw,24px)" }}>
          {tab === "specs" && (
            <div>
              {/* Image + description */}
              <div style={{ display:"flex", gap:20, marginBottom:20, flexWrap:"wrap" }}>
                {record.product_image && (
                  <div style={{ background:C.bg, border:"1px solid "+C.border, borderRadius:10, padding:10, display:"flex", alignItems:"center", justifyContent:"center", width:160, height:130, flexShrink:0 }}>
                    <img src={record.product_image} alt={record.part_number}
                      style={{ maxWidth:144, maxHeight:114, objectFit:"contain" }} />
                  </div>
                )}
                <div style={{ flex:1, minWidth:200 }}>
                  {record.description && <p style={{ fontSize:14, color:C.text, lineHeight:1.65, margin:0 }}>{stripVendor(record.description)}</p>}
                  {Array.isArray(record.features) && record.features.length > 0 && (
                    <ul style={{ margin:"10px 0 0", paddingLeft:18 }}>
                      {record.features.map((f,i) => <li key={i} style={{ fontSize:13, color:C.muted, marginBottom:4 }}>{stripVendor(f)}</li>)}
                    </ul>
                  )}
                </div>
              </div>
              {/* Main specs table */}
              {Array.isArray(record.basic_headers) && record.basic_headers.length > 0 && Array.isArray(record.basic_rows) && record.basic_rows.length > 0 && (() => {
                const filteredBasic = record._specificPart
                  ? record.basic_rows.filter(row => row[0] === record._specificPart)
                  : record.basic_rows;
                const displayRows = filteredBasic.length > 0 ? filteredBasic : record.basic_rows;
                return (
                <div style={{ overflowX:"auto", marginBottom:16 }}>
                  <div style={{ fontSize:12, fontWeight:700, color:C.muted, textTransform:"uppercase", letterSpacing:1, marginBottom:8 }}>Specifications</div>
                  <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
                    <thead>
                      <tr style={{ background:C.navy }}>
                        {record.basic_headers.map((h,i) => <th key={i} style={{ padding:"8px 10px", color:"#fff", textAlign:"left", fontWeight:600, whiteSpace:"nowrap" }}>{h}</th>)}
                      </tr>
                    </thead>
                    <tbody>
                      {displayRows.map((row, ri) => (
                        <tr key={ri} style={{ background: ri%2===0 ? C.bg : C.card, borderBottom:"1px solid "+C.border }}>
                          {row.map((cell,ci) => <td key={ci} style={{ padding:"7px 10px", color:C.text, whiteSpace:"nowrap" }}>{cell}</td>)}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                );
              })()}
              {/* More specs table */}
              {Array.isArray(record.more_headers) && record.more_headers.length > 0 && Array.isArray(record.more_rows) && record.more_rows.length > 0 && (() => {
                const filteredMore = record._specificPart
                  ? record.more_rows.filter(row => row[0] === record._specificPart)
                  : record.more_rows;
                const displayMoreRows = filteredMore.length > 0 ? filteredMore : record.more_rows;
                return (
                <div style={{ overflowX:"auto" }}>
                  <div style={{ fontSize:12, fontWeight:700, color:C.muted, textTransform:"uppercase", letterSpacing:1, marginBottom:8 }}>Additional Data</div>
                  <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
                    <thead>
                      <tr style={{ background:C.navyMid }}>
                        {record.more_headers.map((h,i) => <th key={i} style={{ padding:"8px 10px", color:"#fff", textAlign:"left", fontWeight:600, whiteSpace:"nowrap" }}>{h}</th>)}
                      </tr>
                    </thead>
                    <tbody>
                      {displayMoreRows.map((row, ri) => (
                        <tr key={ri} style={{ background: ri%2===0 ? C.bg : C.card, borderBottom:"1px solid "+C.border }}>
                          {row.map((cell,ci) => <td key={ci} style={{ padding:"7px 10px", color:C.text, whiteSpace:"nowrap" }}>{cell}</td>)}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                );
              })()}
            </div>
          )}

          {tab === "sprockets" && (() => { loadSprockets(); return (
            <div>
              <div style={{ fontSize:12, fontWeight:700, color:C.muted, textTransform:"uppercase", letterSpacing:1, marginBottom:12 }}>Compatible Sprockets</div>
              {Object.keys(sprocketMap).length === 0 && (
                <div style={{ fontSize:13, color:C.muted, padding:"12px 0" }}>Loading sprocket data...</div>
              )}
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(180px,1fr))", gap:10 }}>
                {(record.related_sprockets||[]).map((sp,i) => {
                  // Strip tooth-count suffix to get parent sprocket slug
                  const groupSlug = sp.slug?.replace(/-\d+$/, "");
                  const dbRecord = sprocketMap[sp.slug] || sprocketMap[groupSlug] || sprocketMap[sp.part_number?.toLowerCase()] || null;
                  const synthetic = dbRecord || {
                    part_number: sp.part_number,
                    product_type: "Sprocket",
                    category: sp.category,
                    subcategory: sp.name || sp.category,
                    description: sp.name || sp.category,
                    product_image: sp.image || "https://macchain.com/uploads/product-images/_subcategoryImage/sprockets_millchain_abc.png",
                    features: [],
                    basic_headers: [],
                    basic_rows: [],
                    more_headers: [],
                    more_rows: [],
                    related_sprockets: [],
                    related_pins: [],
                    related_attachments: [],
                  };
                  return (
                    <RelatedCard key={i} item={sp} full={synthetic}
                      onClick={() => onSelect({...synthetic, _specificPart: sp.part_number, _parentPart: record.part_number, _parentRecord: record})} />
                  );
                })}
              </div>
            </div>
          ); })() }

          {tab === "pins" && (
            <div>
              <div style={{ fontSize:12, fontWeight:700, color:C.muted, textTransform:"uppercase", letterSpacing:1, marginBottom:12 }}>Compatible Pins & Connecting Links</div>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(180px,1fr))", gap:10 }}>
                {(record.related_pins||[]).map((pin,i) => {
                  const dbRecord = slugMap?.[pin.slug] || null;
                  const synthetic = dbRecord || {
                    part_number: pin.part_number,
                    product_type: "Pin",
                    category: pin.category,
                    subcategory: pin.name || pin.category,
                    description: pin.name || pin.category,
                    product_image: pin.image,
                    features: [],
                    basic_headers: [],
                    basic_rows: [],
                    more_headers: [],
                    more_rows: [],
                    related_sprockets: [],
                    related_pins: [],
                    related_attachments: [],
                  };
                  return (
                    <RelatedCard key={i} item={pin} full={synthetic}
                      onClick={() => onSelect({...synthetic, _specificPart: pin.part_number, _parentPart: record.part_number, _parentRecord: record})} />
                  );
                })}
              </div>
            </div>
          )}

          {tab === "attachments" && (
            <div>
              <div style={{ fontSize:12, fontWeight:700, color:C.muted, textTransform:"uppercase", letterSpacing:1, marginBottom:12 }}>Available Attachments</div>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(180px,1fr))", gap:10 }}>
                {(record.related_attachments||[]).map((att,i) => {
                  const dbRecord = slugMap?.[att.slug] || null;
                  const synthetic = dbRecord || {
                    part_number: att.part_number,
                    product_type: "Attachment",
                    category: att.category,
                    subcategory: att.name || att.category,
                    description: att.name || att.category,
                    product_image: att.image,
                    features: [],
                    basic_headers: [],
                    basic_rows: [],
                    more_headers: [],
                    more_rows: [],
                    related_sprockets: [],
                    related_pins: [],
                    related_attachments: [],
                  };
                  return (
                    <RelatedCard key={i} item={att} full={synthetic}
                      onClick={() => onSelect({...synthetic, _specificPart: att.part_number, _parentPart: record.part_number, _parentRecord: record})} />
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Welded Chain Card (grid) ─────────────────────────────────────────────────
function WeldedChainCard({ chain, hovered, setHovered, onSelect }) {
  const isHov = hovered === chain.part_number;
  const [added, setAdded] = useState(() => getRFQCart().some(i => i.id === chain.id));
  useEffect(() => {
    const update = () => setAdded(getRFQCart().some(i => i.id === chain.id));
    window.addEventListener("rfq_cart_updated", update);
    return () => window.removeEventListener("rfq_cart_updated", update);
  }, [chain.id]);
  function handleRFQ(e) {
    e.stopPropagation();
    if (added) { setCurrentPage("rfqCart"); return; }
    addToRFQCart({ id: chain.id, _source:"mac", series: chain.part_number, type: chain.product_type || chain.category || "", style: chain.subcategory || "", category: chain.category || "", image_url: chain.product_image || "", materials:"", application:"" });
    setAdded(true);
  }
  return (
    <div onMouseEnter={() => setHovered(chain.part_number)} onMouseLeave={() => setHovered(null)}
      style={{ background: isHov ? C.navyMid : C.card, border:"1px solid "+(isHov ? C.navyMid : C.border), borderRadius:10, overflow:"hidden", transition:"all 0.15s", display:"flex", flexDirection:"column" }}>
      {chain.product_image && (
        <div onClick={() => onSelect(chain)} style={{ cursor:"pointer", background:C.bg, borderBottom:"1px solid #f1f5f9", padding:8, display:"flex", alignItems:"center", justifyContent:"center", height:110 }}>
          <img src={chain.product_image} alt={chain.part_number} style={{ maxHeight:98, maxWidth:"86%", objectFit:"contain" }} />
        </div>
      )}
      <div onClick={() => onSelect(chain)} style={{ padding:"14px 16px", flex:1, cursor:"pointer" }}>
        <div style={{ fontSize:15, fontWeight:800, color: isHov ? "#fff" : C.text, marginBottom:4 }}>{chain.part_number}</div>
        <div style={{ fontSize:12, color: isHov ? "rgba(255,255,255,0.65)" : C.muted, marginBottom:8 }}>{stripVendor(chain.description)?.slice(0,80)}{stripVendor(chain.description)?.length>80?"...":""}</div>
        <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
          {chain.related_sprockets?.length > 0 && <span style={{ fontSize:11, padding:"2px 8px", borderRadius:20, background: isHov ? "rgba(255,255,255,0.15)" : C.bg, color: isHov ? "#fff" : C.muted, border:"1px solid "+(isHov ? "rgba(255,255,255,0.2)" : C.border) }}>{chain.related_sprockets.length} Sprockets</span>}
          {chain.related_pins?.length > 0 && <span style={{ fontSize:11, padding:"2px 8px", borderRadius:20, background: isHov ? "rgba(255,255,255,0.15)" : C.bg, color: isHov ? "#fff" : C.muted, border:"1px solid "+(isHov ? "rgba(255,255,255,0.2)" : C.border) }}>{chain.related_pins.length} Pins</span>}
          {chain.related_attachments?.length > 0 && <span style={{ fontSize:11, padding:"2px 8px", borderRadius:20, background: isHov ? "rgba(255,255,255,0.15)" : C.bg, color: isHov ? "#fff" : C.muted, border:"1px solid "+(isHov ? "rgba(255,255,255,0.2)" : C.border) }}>{chain.related_attachments.length} Attachments</span>}
        </div>
      </div>
      <div style={{ padding:"8px 16px", borderTop:"1px solid "+(isHov ? "rgba(255,255,255,0.1)" : C.bg), display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <span onClick={() => onSelect(chain)} style={{ fontSize:11, fontWeight:600, color: isHov ? "rgba(255,255,255,0.7)" : C.navyMid, cursor:"pointer" }}>View Specs ›</span>
        <button onClick={handleRFQ} style={{ padding:"4px 10px", borderRadius:5, fontSize:11, fontWeight:700, cursor:"pointer", border: added ? "1px solid #16a34a" : "1px solid #2563eb", background: added ? "#f0fdf4" : (isHov ? "rgba(255,255,255,0.15)" : "#eff6ff"), color: added ? "#16a34a" : (isHov ? "#fff" : "#2563eb"), transition:"all 0.15s" }}>
          {added ? "✓ In RFQ" : "+ Add to RFQ"}
        </button>
      </div>
    </div>
  );
}

// ─── Welded Chain Row (list view) ─────────────────────────────────────────────
function WeldedChainRow({ chain, onSelect }) {
  const [hov, setHov] = useState(false);
  const [added, setAdded] = useState(() => getRFQCart().some(i => i.id === chain.id));
  useEffect(() => {
    const update = () => setAdded(getRFQCart().some(i => i.id === chain.id));
    window.addEventListener("rfq_cart_updated", update);
    return () => window.removeEventListener("rfq_cart_updated", update);
  }, [chain.id]);
  function handleRFQ(e) {
    e.stopPropagation();
    if (added) { setCurrentPage("rfqCart"); return; }
    addToRFQCart({ id: chain.id, _source:"mac", series: chain.part_number, type: chain.product_type || chain.category || "", style: chain.subcategory || "", category: chain.category || "", image_url: chain.product_image || "", materials:"", application:"" });
    setAdded(true);
  }
  return (
    <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ background: C.card, border:"1px solid "+(hov ? C.navyMid : C.border), borderRadius:8, display:"flex", alignItems:"center", overflow:"hidden", transition:"all 0.15s", boxShadow: hov ? "0 2px 10px rgba(26,58,92,0.07)" : "none" }}>
      <div style={{ width:3, alignSelf:"stretch", background:C.navyMid, flexShrink:0 }} />
      {chain.product_image && (
        <div onClick={() => onSelect(chain)} style={{ width:64, height:56, display:"flex", alignItems:"center", justifyContent:"center", background:"#f8fafc", borderRight:"1px solid #f1f5f9", flexShrink:0, cursor:"pointer" }}>
          <img src={chain.product_image} alt="" style={{ maxHeight:48, maxWidth:56, objectFit:"contain" }} onError={e => e.target.style.display="none"} />
        </div>
      )}
      <div onClick={() => onSelect(chain)} style={{ flex:1, padding:"10px 14px", cursor:"pointer", minWidth:0 }}>
        <div style={{ fontSize:14, fontWeight:800, color:C.text }}>{chain.part_number}</div>
        <div style={{ fontSize:12, color:C.muted, marginTop:2 }}>{chain.subcategory}{chain.product_type ? " · " + chain.product_type : ""}</div>
      </div>
      <div style={{ display:"flex", alignItems:"center", gap:8, padding:"0 14px", flexShrink:0 }}>
        <button onClick={handleRFQ} style={{ padding:"5px 10px", borderRadius:5, fontSize:11, fontWeight:700, cursor:"pointer", border: added ? "1px solid #16a34a" : "1px solid #2563eb", background: added ? "#f0fdf4" : "#eff6ff", color: added ? "#16a34a" : "#2563eb", whiteSpace:"nowrap" }}>
          {added ? "✓ In RFQ" : "+ RFQ"}
        </button>
        <span onClick={() => onSelect(chain)} style={{ fontSize:11, fontWeight:600, color:C.navyMid, whiteSpace:"nowrap", cursor:"pointer" }}>View ›</span>
      </div>
    </div>
  );
}

function WeldedSeriesView({ rawMacRecords: _unused }) {
  const [selectedSeries, setSelectedSeries] = useState(null);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [weldedView, setWeldedView] = useState("grid");
  const [hovered, setHovered] = useState(null);
  const [rawMacRecords, setRawMacRecords] = useState(null); // null = loading, [] = empty
  // Lazy-loaded sprocket records — only fetched when a sprockets tab is opened
  const [sprocketMap, setSprocketMap] = useState({});
  const [sprocketsLoaded, setSprocketsLoaded] = useState(false);

  // Fetch Welded Steel Chain records directly on mount
  useEffect(() => {
    async function fetchWelded() {
      try {
        const res = await fetch("/api/fn/getCatalogData", { method: "GET" });
        if (!res.ok) throw new Error(`getCatalogData returned ${res.status}`);
        const { macChainProducts } = await res.json();
        const chains = (macChainProducts || []).filter(r => r.category === "Welded Steel Chain");
        setRawMacRecords(chains);
      } catch(e) {
        console.error("WeldedSeriesView fetch error:", e);
        setRawMacRecords([]);
      }
    }
    fetchWelded();
  }, []);

  const loadSprockets = async () => {
    if (sprocketsLoaded) return;
    setSprocketsLoaded(true); // prevent double-fetch
    try {
      let all = [];
      try {
        const res = await fetch("/api/fn/getCatalogData", { method: "GET" });
        const { macChainProducts } = await res.json();
        all = (macChainProducts || []).filter(r => r.product_type === "Sprocket");
      } catch(e) { all = []; }
      const m = {};
      for (const r of all) {
        if (r.slug) m[r.slug] = r;
        if (r.part_number) m[r.part_number.toLowerCase()] = r;
      }
      setSprocketMap(m);
    } catch(e) { console.error("Sprocket load error:", e); }
  };

  // Chain slug map (chains only — already loaded)
  const slugMap = useMemo(() => {
    const m = {};
    for (const r of rawMacRecords || []) {
      if (r.slug) m[r.slug] = r;
    }
    return m;
  }, [rawMacRecords]);

  // Only Welded Steel Chain category, product_type = Chain
  const weldedChains = useMemo(() => {
    if (!rawMacRecords || rawMacRecords.length === 0) return [];
    return rawMacRecords.filter(r => r.category === "Welded Steel Chain" && r.product_type === "Chain");
  }, [rawMacRecords]);

  // Group by subcategory (Offset Sidebar, Straight Sidebar, Drag Chain, Mega Mac, Super Mac)
  const grouped = useMemo(() => {
    const g = {};
    for (const r of weldedChains) {
      const sub = r.subcategory || "Other";
      if (!g[sub]) g[sub] = [];
      // Dedupe by part_number within group
      if (!g[sub].find(x => x.part_number === r.part_number)) g[sub].push(r);
    }
    return g;
  }, [weldedChains]);

  const seriesOrder = ["Offset Sidebar", "Straight Sidebar", "Drag Chain", "Mega Mac", "Super Mac"];

  // If a series is selected, show its chain cards
  if (selectedSeries) {
    const chains = grouped[selectedSeries] || [];
    return (
      <div>
        {/* Back + heading */}
        <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:20 }}>
          <button onClick={() => setSelectedSeries(null)}
            style={{ background:"none", border:"1px solid "+C.border, borderRadius:6, padding:"6px 14px", cursor:"pointer", fontSize:13, color:C.muted }}>
            ← Back
          </button>
          <div>
            <div style={{ fontSize:20, fontWeight:800, color:C.text }}>{WELDED_SERIES_LABELS[selectedSeries] || selectedSeries}</div>
            <div style={{ fontSize:13, color:C.muted }}>{chains.length} chain series available</div>
          </div>
        </div>

        {/* View toggle */}
        <div style={{ display:"flex", justifyContent:"flex-end", marginBottom:12 }}>
          <ViewToggle view={weldedView} onChange={setWeldedView} />
        </div>

        {/* Chain cards/list */}
        {weldedView === "grid" ? (
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(240px,1fr))", gap:14 }}>
            {chains.map(chain => (
              <WeldedChainCard key={chain.id || chain.part_number} chain={chain} hovered={hovered} setHovered={setHovered} onSelect={setSelectedRecord} />
            ))}
          </div>
        ) : (
          <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
            {chains.map(chain => (
              <WeldedChainRow key={chain.id || chain.part_number} chain={chain} onSelect={setSelectedRecord} />
            ))}
          </div>
        )}

        {/* Product modal */}
        {selectedRecord && <MacProductModal record={selectedRecord} slugMap={slugMap} sprocketMap={sprocketMap} loadSprockets={loadSprockets} onSelect={setSelectedRecord} onClose={() => setSelectedRecord(null)} />}
      </div>
    );
  }

  // Top-level: series type cards
  if (rawMacRecords === null) return (
    <div style={{ padding:40, textAlign:"center", color:C.muted }}>
      <div style={{ fontSize:32, marginBottom:12 }}>⛓</div>
      <div style={{ fontSize:16, fontWeight:600 }}>Loading Welded Steel Chain data...</div>
    </div>
  );
  if (weldedChains.length === 0) return (
    <div style={{ padding:40, textAlign:"center", color:C.muted }}>
      <div style={{ fontSize:32, marginBottom:12 }}>⛓</div>
      <div style={{ fontSize:16, fontWeight:600, marginBottom:8 }}>No chain records found</div>
    </div>
  );

  return (
    <div>
      <div style={{ marginBottom:28 }}>
        <div style={{ fontSize:22, fontWeight:800, color:C.text, marginBottom:4 }}>Welded Steel Chain</div>
        <div style={{ fontSize:14, color:C.muted }}>Select a chain series to browse products, specifications, and compatible components</div>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(260px,1fr))", gap:14 }}>
        {seriesOrder.filter(s => grouped[s]?.length > 0).map(sub => (
          <div key={sub} onClick={() => setSelectedSeries(sub)}
            onMouseEnter={() => setHovered(sub)} onMouseLeave={() => setHovered(null)}
            style={{ background: hovered===sub ? C.navyMid : C.card, border:"1px solid "+(hovered===sub ? C.navyMid : C.border), borderRadius:8, padding:"18px 20px", cursor:"pointer", transition:"all 0.15s" }}>
            <div style={{ fontSize:14, fontWeight:700, color: hovered===sub ? "#fff" : C.text, marginBottom:4 }}>{WELDED_SERIES_LABELS[sub] || sub}</div>
            <div style={{ fontSize:12, color: hovered===sub ? "rgba(255,255,255,0.6)" : C.muted, marginBottom:8 }}>
              {grouped[sub].length} chain series
            </div>
            <div style={{ fontSize:11, color: hovered===sub ? "rgba(255,255,255,0.45)" : C.muted }}>Browse →</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Chain Subcategory Grid ───────────────────────────────────────────────────

function ChainSubGrid({ types, counts, onSelect }) {
  const [hovered, setHovered] = useState(null);
  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 22, fontWeight: 800, color: C.text, marginBottom: 4 }}>Chain</div>
        <div style={{ fontSize: 14, color: C.muted }}>Select a chain type to browse products</div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 14 }}>
        {types.map(t => (
          <div key={t.key} onClick={() => onSelect(t.key)} onMouseEnter={() => setHovered(t.key)} onMouseLeave={() => setHovered(null)}
            style={{ background: hovered === t.key ? C.navyMid : C.card, border: "1px solid " + (hovered === t.key ? C.navyMid : C.border), borderRadius: 8, padding: "18px 20px", cursor: "pointer", transition: "all 0.15s", display: "flex", flexDirection: "column", gap: 6 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: hovered === t.key ? "#fff" : C.text }}>{t.label}</div>
            <div style={{ fontSize: 12, color: hovered === t.key ? "rgba(255,255,255,0.65)" : C.muted, lineHeight: 1.5 }}>{t.description}</div>
            <div style={{ fontSize: 11, color: hovered === t.key ? "rgba(255,255,255,0.45)" : C.muted, marginTop: 4 }}>
              {counts[t.key] ? `${counts[t.key]} products` : "View →"}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Brand Grid ───────────────────────────────────────────────────────────────

function BrandGrid({ products, typeDef, onSelect }) {
  const brands = useMemo(() => [...new Set(products.map(p => p.brand).filter(Boolean))].sort(), [products]);
  const [hovered, setHovered] = useState(null);
  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 20, fontWeight: 800, color: C.text, marginBottom: 4 }}>{typeDef?.label}</div>
        <div style={{ fontSize: 13, color: C.muted }}>Select a brand to browse products</div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 200px), 1fr))", gap: 12 }}>
        {brands.map(b => (
          <div key={b} onClick={() => onSelect(b)} onMouseEnter={() => setHovered(b)} onMouseLeave={() => setHovered(null)}
            style={{ background: hovered === b ? C.navyMid : C.card, border: "1px solid " + (hovered === b ? C.navyMid : C.border), borderRadius: 8, padding: "20px 22px", cursor: "pointer", transition: "all 0.15s", textAlign: "center" }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: hovered === b ? "#fff" : C.text, marginBottom: 4 }}>{b}</div>
            <div style={{ fontSize: 12, color: hovered === b ? "rgba(255,255,255,0.5)" : C.muted }}>{products.filter(p => p.brand === b).length} products</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Top Bar ──────────────────────────────────────────────────────────────────

function TopBar({ onGoRFQ }) {
  const [cartCount, setCartCount] = useState(() => getRFQCart().length);
  useEffect(() => {
    const update = () => setCartCount(getRFQCart().length);
    window.addEventListener("rfq_cart_updated", update);
    return () => window.removeEventListener("rfq_cart_updated", update);
  }, []);
  return (
    <div style={{ background: C.navy, height: 56, display: "flex", alignItems: "center", padding: "0 40px", justifyContent: "space-between", flexShrink: 0 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <img src="https://media.base44.com/images/public/69dd9ffccab4dd693d4d92f5/e48ee59d9_Unitingthestrongestlinks_20251031_225809_0000.png" style={{ maxHeight: 28, width: "auto", filter: "brightness(0) invert(1)", opacity: 0.9 }} alt="Uniking Canada" />
        <span style={{ color: "rgba(255,255,255,0.25)", fontSize: 13 }}>/</span>
        <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 13 }}>Product Catalog</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <a href="#" onClick={e => { e.preventDefault(); onGoRFQ && onGoRFQ(); }} style={{ display: "flex", alignItems: "center", gap: 7, textDecoration: "none", background: cartCount > 0 ? "#2563eb" : "rgba(255,255,255,0.1)", color: "#fff", padding: "7px 14px", borderRadius: 7, fontSize: 12, fontWeight: 700, border: "1px solid " + (cartCount > 0 ? "#3b82f6" : "rgba(255,255,255,0.2)"), transition: "background 0.2s" }}>
          <span>📋</span>
          <span>RFQ Cart{cartCount > 0 ? ` (${cartCount})` : ""}</span>
        </a>
      </div>
    </div>
  );
}

function Breadcrumb({ items, onNav }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, marginBottom: 24, flexWrap: "wrap" }}>
      {items.map((item, i) => (
        <span key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}>
          {i > 0 && <span style={{ color: C.border, fontSize: 14 }}>›</span>}
          {i < items.length - 1
            ? <span onClick={() => onNav(i)} style={{ color: C.navyMid, cursor: "pointer", fontWeight: 600 }}>{item}</span>
            : <span style={{ color: C.muted }}>{item}</span>}
        </span>
      ))}
    </div>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────


// ═══════════════════════════════════════════════════════════════════════════════
// ── ELEVATOR BUCKETS VIEW ──────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════
const NAVY = "#1a3a5c";
const AMBER = "#b45309";
const BASE = "https://maxilift.com/hs-fs/hubfs/";

// ── Material color system ────────────────────────────────────────────────────
const MAT_DEF = {
  "Poly":        { color:"#c2410c", bg:"#fff7ed", border:"#fed7aa", dot:"#f97316", label:"Poly (HDPE)",  temp:"-60°F to +180°F", fda:true,  use:"Grain & food products" },
  "Polyethylene":{ color:"#c2410c", bg:"#fff7ed", border:"#fed7aa", dot:"#f97316", label:"Poly (HDPE)",  temp:"-60°F to +180°F", fda:true,  use:"Grain & food products" },
  "HDPE":        { color:"#c2410c", bg:"#fff7ed", border:"#fed7aa", dot:"#f97316", label:"Poly (HDPE)",  temp:"-60°F to +180°F", fda:true,  use:"Grain & food products" },
  "Nylon":       { color:"#92400e", bg:"#fef9c3", border:"#fde68a", dot:"#d97706", label:"Nylon",        temp:"-60°F to +300°F", fda:false, use:"Hot, impact & abrasive" },
  "Urethane":    { color:"#065f46", bg:"#d1fae5", border:"#6ee7b7", dot:"#10b981", label:"Urethane",     temp:"-60°F to +180°F", fda:true,  use:"Heavy abrasion, sticky" },
  "FDA Nylon":   { color:"#4338ca", bg:"#e0e7ff", border:"#a5b4fc", dot:"#6366f1", label:"FDA Nylon",    temp:"-60°F to +300°F", fda:true,  use:"Hot food-grade" },
  "Ductile Iron":{ color:"#374151", bg:"#f3f4f6", border:"#d1d5db", dot:"#6b7280", label:"Ductile Iron", temp:"Up to 600°F",     fda:false, use:"Sand, glass, shot blast" },
  "Mild Steel":  { color:"#374151", bg:"#f1f5f9", border:"#cbd5e1", dot:"#64748b", label:"Mild Steel",   temp:"High temp",       fda:false, use:"Packed bulk materials" },
  "Welded Steel":{ color:"#1e3a5f", bg:"#e0e7ff", border:"#93c5fd", dot:"#3b82f6", label:"Welded Steel", temp:"High temp",       fda:false, use:"Industrial bulk, ore" },
  "Carbon Steel":{ color:"#374151", bg:"#f1f5f9", border:"#cbd5e1", dot:"#64748b", label:"Carbon Steel", temp:"High temp",       fda:false, use:"Heavy industrial" },
};

function getMat(str) {
  if (!str) return { key: str||"", color:NAVY, bg:"#f3f4f6", border:"#e5e7eb", dot:"#9ca3af", label:str||"", temp:"—", fda:false, use:"—" };
  const s = str.trim();
  for (const [k, v] of Object.entries(MAT_DEF)) {
    if (s.toLowerCase().includes(k.toLowerCase())) return { key: s, ...v };
  }
  return { key: s, color:NAVY, bg:"#f3f4f6", border:"#e5e7eb", dot:"#9ca3af", label:s, temp:"—", fda:false, use:"—" };
}

// Parse material string → array of individual material names
function parseMaterials(str) {
  if (!str) return [];
  // Split on " / ", "/", ", " or ","
  return str.split(/\s*\/\s*|\s*,\s*/).map(s => s.trim()).filter(Boolean).map(s => {
    // Normalize "Polyethylene (HDPE)" → "Poly"
    if (s.toLowerCase().includes("polyethylene") || s.toLowerCase() === "hdpe") return "Poly";
    if (s.toLowerCase().includes("fda nylon")) return "FDA Nylon";
    if (s.toLowerCase().includes("nylon")) return "Nylon";
    if (s.toLowerCase().includes("urethane")) return "Urethane";
    if (s.toLowerCase().includes("ductile iron")) return "Ductile Iron";
    if (s.toLowerCase().includes("welded steel")) return "Welded Steel";
    if (s.toLowerCase().includes("carbon steel")) return "Carbon Steel";
    if (s.toLowerCase().includes("mild steel")) return "Mild Steel";
    if (s.toLowerCase().includes("poly")) return "Poly";
    return s;
  }).filter((v, i, a) => a.indexOf(v) === i); // dedupe
}

// ── Material images from Maxi-Lift CDN ───────────────────────────────────────
// Agricultural: Poly = series main image; Nylon/Urethane/FDA Nylon = CDN variants
// Industrial: all 4 materials have CDN images
const MAT_IMG_AG = {
  "Nylon":     BASE + "image%2025%20(6).png?width=500",
  "Urethane":  BASE + "image%2025%20(7).png?width=500",
  "FDA Nylon": BASE + "image%2025%20(8).png?width=500",
};
const MAT_IMG_IND = {
  "Poly":      BASE + "image%2025%20(10).png?width=500",
  "Nylon":     BASE + "image%2025%20(9)-1.png?width=500",
  "Urethane":  BASE + "image%2025%20(11).png?width=500",
  "FDA Nylon": BASE + "image%2025%20(12).png?width=500",
};

function getMatImage(rec, material) {
  const isInd = (rec.application || "").toLowerCase().includes("ind");
  const map = isInd ? MAT_IMG_IND : MAT_IMG_AG;
  if (map[material]) return map[material];
  return rec.image_url || null; // fallback to series main image
}

// ── Generic bucket SVG outline diagram ───────────────────────────────────────
function BucketDiagram({ size }) {
  function parseFrac(s) {
    if (!s) return 0;
    s = String(s).trim();
    const m = s.match(/^(\d+)-(\d+)\/(\d+)$/);
    if (m) return parseInt(m[1]) + parseInt(m[2]) / parseInt(m[3]);
    const m2 = s.match(/^(\d+)\/(\d+)$/);
    if (m2) return parseInt(m2[1]) / parseInt(m2[2]);
    return parseFloat(s) || 0;
  }
  const proj  = parseFrac(size.projection_in) || 6;
  const depth = parseFrac(size.depth_in) || 5;
  const sizeStr = size.size || "8x5";
  const lenNum  = parseFrac(size.length_in) || parseFloat(sizeStr.split("x")[0]) || 8;
  const wall    = parseFrac(size.wall_thickness) || 0.4;

  const scale = Math.min(220 / (lenNum * 1.3), 150 / (proj * 1.4));
  const W = lenNum * scale;
  const H = proj * scale;
  const D = depth * scale;
  const cx = 30, cy = 20;

  const bPts = [
    [cx, cy],
    [cx + W, cy],
    [cx + W, cy + H],
    [cx + W * 0.85, cy + H + D * 0.25],
    [cx, cy + H],
  ].map(p => p.join(",")).join(" ");

  const svgW = W + 90;
  const svgH = H + D + 60;

  return (
    <svg viewBox={`0 0 ${svgW} ${svgH}`} style={{ width: "100%", maxWidth: 300 }}>
      <polygon points={bPts} fill="#eef3fa" stroke={NAVY} strokeWidth={2} strokeLinejoin="round" />
      {/* Length arrow */}
      <line x1={cx} y1={cy - 14} x2={cx + W} y2={cy - 14} stroke="#1d4ed8" strokeWidth={1.5} markerEnd="url(#arr)" />
      <text x={(cx + cx + W) / 2} y={cy - 4} textAnchor="middle" fontSize={9} fill="#1d4ed8" fontWeight="700">
        {lenNum.toFixed(2)}&quot; (L)
      </text>
      {/* Projection arrow */}
      <line x1={cx + W + 14} y1={cy} x2={cx + W + 14} y2={cy + H} stroke="#065f46" strokeWidth={1.5} />
      <text x={cx + W + 18} y={(cy + cy + H) / 2} fontSize={9} fill="#065f46" fontWeight="700" dominantBaseline="middle">
        {proj.toFixed(2)}&quot; (P)
      </text>
      {/* Depth arrow */}
      <line x1={cx + W * 0.2} y1={cy + H + 18} x2={cx + W * 0.2 + D * 0.6} y2={cy + H + 18} stroke="#7c3aed" strokeWidth={1.5} />
      <text x={cx + W * 0.2 + D * 0.3} y={cy + H + 30} textAnchor="middle" fontSize={9} fill="#7c3aed" fontWeight="700">
        {depth.toFixed(2)}&quot; (D)
      </text>
      {/* Size label */}
      <text x={cx + W / 2} y={cy + H / 2 + 5} textAnchor="middle" fontSize={12} fill={NAVY} fontWeight="900">
        {sizeStr}&quot;
      </text>
      <defs>
        <marker id="arr" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="#1d4ed8" />
        </marker>
      </defs>
    </svg>
  );
}

// ── Spec row ─────────────────────────────────────────────────────────────────
function SpecRow({ label, value, hi }) {
  if (value == null || value === "" || value === "—") return null;
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center",
      padding: "8px 12px", background: hi ? "#fffbeb" : "#f8fafc",
      borderRadius: 8, border: hi ? `1px solid ${AMBER}33` : "1px solid #f1f5f9" }}>
      <span style={{ fontSize: 11, color: "#6b7280", fontWeight: 600 }}>{label}</span>
      <span style={{ fontSize: 12, color: hi ? AMBER : NAVY, fontWeight: 800 }}>{value}</span>
    </div>
  );
}

// ── Size Detail Modal ─────────────────────────────────────────────────────────
function SizeDetailModal({ rec, size, material, onClose, onBack }) {
  const [qty, setQty] = useState(1);
  const [notes, setNotes] = useState("");
  const [added, setAdded] = useState(false);
  const md = getMat(material);

  function addToRFQ() {
    const cart = JSON.parse(localStorage.getItem("uniking_rfq_cart") || "[]");
    cart.push({
      id: `bucket-${rec.id}-${size.size}-${Date.now()}`,
      type: "Elevator Bucket",
      series: rec.series,
      style: rec.style,
      application: rec.application,
      material,
      size: size.size,
      discharge: rec.discharge_type,
      qty,
      notes,
      unitSpec: `${size.size}" proj:${size.projection_in}" depth:${size.depth_in}"`,
    });
    localStorage.setItem("uniking_rfq_cart", JSON.stringify(cart));
    setAdded(true);
    setTimeout(() => setAdded(false), 2500);
  }

  const hasCap = size.capacity_cu_in || size.capacity_cu_ft;

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.75)", zIndex: 2000,
      display: "flex", alignItems: "center", justifyContent: "center", padding: 12 }}
      onClick={onClose}>
      <div style={{ background: "#fff", borderRadius: 16, width: "100%", maxWidth: 680,
        maxHeight: "96vh", overflowY: "auto", display: "flex", flexDirection: "column" }}
        onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div style={{ background: `linear-gradient(135deg,${NAVY},#2d5986)`,
          borderRadius: "16px 16px 0 0", padding: "16px 20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
            <button onClick={onBack}
              style={{ background: "rgba(255,255,255,.15)", border: "none", borderRadius: 8,
                padding: "5px 12px", color: "#fff", cursor: "pointer", fontSize: 12, fontWeight: 700 }}>
              ← Back to Sizes
            </button>
            <button onClick={onClose}
              style={{ marginLeft: "auto", background: "rgba(255,255,255,.15)", border: "none",
                borderRadius: "50%", width: 28, height: 28, cursor: "pointer", color: "#fff", fontSize: 14 }}>✕</button>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <div style={{ fontSize: 26, fontWeight: 900, color: "#fff" }}>{size.size}&quot;</div>
            <div style={{ padding: "4px 12px", borderRadius: 99, background: md.bg, color: md.color, fontSize: 12, fontWeight: 800 }}>
              {material}
            </div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,.5)" }}>{rec.series}</div>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0, flex: 1 }}>
          {/* Left: SVG diagram */}
          <div style={{ padding: "20px 16px", borderRight: "1px solid #f1f5f9",
            display: "flex", flexDirection: "column", gap: 14, alignItems: "center" }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#9ca3af",
              textTransform: "uppercase", letterSpacing: 1, alignSelf: "flex-start" }}>Dimension Diagram</div>
            <BucketDiagram size={size} />
            <div style={{ width: "100%", padding: "12px", background: md.bg,
              borderRadius: 10, border: `1px solid ${md.border}`, textAlign: "center" }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: md.color,
                textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>Selected Material</div>
              <div style={{ fontSize: 15, fontWeight: 900, color: md.color }}>{material}</div>
              <div style={{ fontSize: 10, color: md.color, opacity: .75, marginTop: 2 }}>{md.temp}</div>
              {md.fda && (
                <div style={{ marginTop: 5, fontSize: 9, fontWeight: 700, color: "#065f46",
                  background: "#d1fae5", borderRadius: 99, padding: "2px 8px", display: "inline-block" }}>
                  FDA Approved ✓
                </div>
              )}
            </div>
          </div>

          {/* Right: Specs */}
          <div style={{ padding: "20px 16px", display: "flex", flexDirection: "column", gap: 7 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#9ca3af",
              textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>Specifications</div>
            <SpecRow label="Size" value={size.size + '"'} hi />
            <SpecRow label="Length" value={size.length_in ? size.length_in + '"' : null} />
            <SpecRow label="Projection" value={size.projection_in ? size.projection_in + '"' : null} />
            <SpecRow label="Depth" value={size.depth_in ? size.depth_in + '"' : null} />
            <SpecRow label="Wall Thickness" value={size.wall_thickness ? size.wall_thickness + '"' : null} />
            <SpecRow label="Weight" value={size.weight_hdpe_lbs ? size.weight_hdpe_lbs + ' lbs (HDPE)' : size.weight_lbs ? size.weight_lbs + ' lbs' : null} />
            <SpecRow label="Capacity" value={size.capacity_cu_in ? size.capacity_cu_in + ' cu.in' : size.capacity_cu_ft ? size.capacity_cu_ft + ' cu.ft' : null} />
            <SpecRow label="Std. Spacing" value={size.std_spacing_in ? size.std_spacing_in + '"' : null} />
            <SpecRow label="Bolt Size" value={size.bolt_size || null} />
            <SpecRow label="# Holes" value={size.holes || null} />
          </div>
        </div>

        {/* RFQ Footer */}
        <div style={{ padding: "16px 20px", borderTop: "1px solid #f1f5f9" }}>
          <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 12, flexWrap: "wrap" }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: NAVY }}>Qty:</div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <button onClick={() => setQty(Math.max(1, qty - 1))}
                style={{ width: 30, height: 30, borderRadius: 6, border: "1px solid #d1d5db",
                  background: "#f9fafb", cursor: "pointer", fontSize: 16 }}>−</button>
              <input type="number" min={1} value={qty}
                onChange={e => setQty(Math.max(1, parseInt(e.target.value) || 1))}
                style={{ width: 52, textAlign: "center", padding: "5px", borderRadius: 6,
                  border: "1px solid #d1d5db", fontSize: 13, fontWeight: 700 }} />
              <button onClick={() => setQty(qty + 1)}
                style={{ width: 30, height: 30, borderRadius: 6, border: "1px solid #d1d5db",
                  background: "#f9fafb", cursor: "pointer", fontSize: 16 }}>+</button>
            </div>
            <input value={notes} onChange={e => setNotes(e.target.value)}
              placeholder="Notes (venting, profile, application...)"
              style={{ flex: 1, minWidth: 160, padding: "7px 12px", borderRadius: 8,
                border: "1px solid #d1d5db", fontSize: 12, outline: "none" }} />
          </div>
          <button onClick={addToRFQ}
            style={{ width: "100%", padding: "13px", borderRadius: 10, border: "none",
              background: added ? "#065f46" : NAVY, color: "#fff",
              fontSize: 14, fontWeight: 800, cursor: "pointer", transition: "background .2s" }}>
            {added ? `✓ Added — ${rec.series} · ${material} · ${size.size}"` : `Add to RFQ — ${rec.series} · ${material} · ${size.size}"`}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Style Modal ───────────────────────────────────────────────────────────────
function BucketStyleModal({ rec, onClose }) {
  const materials = parseMaterials(rec.material);
  const [activeMat, setActiveMat] = useState(materials[0] || "");
  const [showLP, setShowLP] = useState(false);
  const [selectedSize, setSelectedSize] = useState(null);

  let sizes = [];
  try { sizes = rec.bucket_sizes_detail ? JSON.parse(rec.bucket_sizes_detail) : []; } catch {}

  const md      = getMat(activeMat);
  const matImg  = getMatImage(rec, activeMat);

  function parseFrac(s) {
    if (!s) return 0;
    s = String(s).trim();
    const m = s.match(/^(\d+)-(\d+)\/(\d+)$/);
    if (m) return parseInt(m[1]) + parseInt(m[2]) / parseInt(m[3]);
    return parseFloat(s) || 0;
  }

  function isLP(s) {
    const d = parseFrac(s.depth_in), p = parseFrac(s.projection_in);
    return d > 0 && p > 0 && (d / p < 0.7);
  }
  const stdSizes = sizes.filter(s => !isLP(s));
  const lpSizes  = sizes.filter(s => isLP(s));
  const showSizes = showLP ? lpSizes : stdSizes;

  if (selectedSize) {
    return (
      <SizeDetailModal
        rec={rec}
        size={selectedSize}
        material={activeMat}
        onClose={onClose}
        onBack={() => setSelectedSize(null)}
      />
    );
  }

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.65)", zIndex: 1000,
      display: "flex", alignItems: "center", justifyContent: "center", padding: 12 }}
      onClick={onClose}>
      <div style={{ background: "#fff", borderRadius: 16, width: "100%", maxWidth: 860,
        maxHeight: "96vh", overflowY: "auto" }}
        onClick={e => e.stopPropagation()}>

        {/* Hero */}
        <div style={{ display: "flex", borderRadius: "16px 16px 0 0", overflow: "hidden", minHeight: 240 }}>

          {/* Image pane — swaps on material click */}
          <div style={{ width: 220, flexShrink: 0,
            background: `linear-gradient(160deg,${NAVY},#1e4976)`,
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: 16, position: "relative" }}>
            {matImg ? (
              <img key={matImg} src={matImg} alt={`${rec.series} ${activeMat}`}
                style={{ maxWidth: 190, maxHeight: 190, objectFit: "contain",
                  transition: "opacity .2s", background: "transparent" }}
                onError={e => { e.target.style.display = "none"; }} />
            ) : (
              <div style={{ color: "rgba(255,255,255,.15)", fontSize: 56 }}>🪣</div>
            )}
            <div style={{ position: "absolute", bottom: 10, left: 0, right: 0, textAlign: "center" }}>
              <span style={{ padding: "3px 12px", borderRadius: 99, fontSize: 11, fontWeight: 800,
                background: md.bg, color: md.color }}>{activeMat || rec.material}</span>
            </div>
          </div>

          {/* Info pane */}
          <div style={{ flex: 1, background: `linear-gradient(135deg,#1e4070,#2d5986)`,
            padding: "18px 22px", position: "relative" }}>
            <button onClick={onClose}
              style={{ position: "absolute", top: 12, right: 14, background: "rgba(255,255,255,.15)",
                border: "none", borderRadius: "50%", width: 32, height: 32,
                cursor: "pointer", color: "#fff", fontSize: 16 }}>✕</button>

            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
              <span style={{ padding: "3px 10px", borderRadius: 99, fontSize: 11, fontWeight: 700,
                background: "#fef3c7", color: AMBER }}>Elevator Bucket</span>
              {rec.application && (
                <span style={{ padding: "3px 10px", borderRadius: 99, fontSize: 11, fontWeight: 700,
                  background: rec.application.toLowerCase().includes("ag") ? "#d1fae5" : "#dbeafe",
                  color: rec.application.toLowerCase().includes("ag") ? "#065f46" : "#1d4ed8" }}>
                  {rec.application}
                </span>
              )}
              {rec.discharge_type && (
                <span style={{ padding: "3px 10px", borderRadius: 99, fontSize: 11, fontWeight: 600,
                  background: "rgba(255,255,255,.12)", color: "#fff" }}>{rec.discharge_type}</span>
              )}
            </div>

            <div style={{ fontSize: 24, fontWeight: 900, color: "#fff", marginBottom: 4 }}>{rec.series}</div>
            {rec.style && <div style={{ fontSize: 13, color: "rgba(255,255,255,.5)", marginBottom: 14 }}>{rec.style}</div>}

            {/* Material selector */}
            {materials.length > 0 && (
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,.4)",
                  textTransform: "uppercase", letterSpacing: 1, marginBottom: 7 }}>Select Material</div>
                <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
                  {materials.map(m => {
                    const d = getMat(m);
                    const active = activeMat === m;
                    return (
                      <button key={m} onClick={() => setActiveMat(m)}
                        style={{ padding: "7px 14px", borderRadius: 99, cursor: "pointer",
                          transition: "all .15s",
                          border: active ? `2px solid ${d.color}` : "2px solid rgba(255,255,255,.2)",
                          background: active ? d.bg : "rgba(255,255,255,.08)",
                          color: active ? d.color : "#fff",
                          fontWeight: active ? 800 : 600, fontSize: 12 }}>
                        <span style={{ display: "inline-block", width: 8, height: 8,
                          borderRadius: "50%", background: d.dot,
                          marginRight: 6, verticalAlign: "middle" }} />
                        {m}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Active material info bar */}
            {activeMat && (
              <div style={{ padding: "9px 14px", borderRadius: 10,
                background: "rgba(255,255,255,.07)", border: "1px solid rgba(255,255,255,.1)",
                display: "flex", gap: 16, flexWrap: "wrap" }}>
                <div>
                  <div style={{ fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,.4)",
                    textTransform: "uppercase", letterSpacing: 1, marginBottom: 2 }}>Temp Range</div>
                  <div style={{ fontSize: 11, color: "#fff", fontWeight: 700 }}>{md.temp}</div>
                </div>
                <div>
                  <div style={{ fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,.4)",
                    textTransform: "uppercase", letterSpacing: 1, marginBottom: 2 }}>Best For</div>
                  <div style={{ fontSize: 11, color: "#fff", fontWeight: 700 }}>{md.use}</div>
                </div>
                <div>
                  <div style={{ fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,.4)",
                    textTransform: "uppercase", letterSpacing: 1, marginBottom: 2 }}>FDA</div>
                  <div style={{ fontSize: 11, fontWeight: 800,
                    color: md.fda ? "#6ee7b7" : "#fca5a5" }}>
                    {md.fda ? "✓ Approved" : "✗ Not approved"}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Notes */}
        {rec.notes && (
          <div style={{ margin: "14px 20px 0", padding: "10px 14px", background: "#f8fafc",
            borderRadius: 8, borderLeft: `3px solid ${AMBER}`, fontSize: 12, color: "#374151", lineHeight: 1.7 }}>
            {rec.notes}
          </div>
        )}

        {/* Overview chips */}
        <div style={{ padding: "14px 20px 10px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(170px,1fr))", gap: 8 }}>
            {[
              ["Duty", rec.duty],
              ["Discharge", rec.discharge_type],
              ["Profile", rec.profile],
              ["Sizes Available", sizes.length > 0 ? `${sizes.length} sizes` : rec.bucket_sizes],
              ["Low-Profile", lpSizes.length > 0 ? `${lpSizes.length} LP sizes` : null],
              ["Catalog", rec.page_range ? `pp. ${rec.page_range}` : null],
            ].filter(([, v]) => v).map(([l, v]) => (
              <div key={l} style={{ padding: "8px 12px", background: "#f8fafc",
                borderRadius: 8, border: "1px solid #f1f5f9" }}>
                <div style={{ fontSize: 9, fontWeight: 700, color: "#9ca3af",
                  textTransform: "uppercase", letterSpacing: .5, marginBottom: 2 }}>{l}</div>
                <div style={{ fontSize: 12, color: NAVY, fontWeight: 700 }}>{v}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Sizes */}
        {sizes.length > 0 && (
          <div style={{ padding: "4px 20px 24px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between",
              marginBottom: 12, paddingTop: 14, borderTop: "1px solid #f3f4f6" }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 800, color: NAVY }}>Available Sizes</div>
                <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 2 }}>
                  Click any size for full spec sheet + add to RFQ
                </div>
              </div>
              {lpSizes.length > 0 && (
                <div style={{ display: "flex", gap: 6 }}>
                  <button onClick={() => setShowLP(false)}
                    style={{ padding: "5px 12px", borderRadius: 7, cursor: "pointer",
                      border: `1px solid ${!showLP ? NAVY : "#e5e7eb"}`,
                      background: !showLP ? NAVY : "#f9fafb",
                      color: !showLP ? "#fff" : "#374151",
                      fontSize: 11, fontWeight: 700 }}>Standard</button>
                  <button onClick={() => setShowLP(true)}
                    style={{ padding: "5px 12px", borderRadius: 7, cursor: "pointer",
                      border: `1px solid ${showLP ? AMBER : "#e5e7eb"}`,
                      background: showLP ? "#fffbeb" : "#f9fafb",
                      color: showLP ? AMBER : "#374151",
                      fontSize: 11, fontWeight: 700 }}>Low Profile</button>
                </div>
              )}
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
              {showSizes.map((s, i) => (
                <button key={i} onClick={() => setSelectedSize(s)}
                  style={{ padding: "10px 14px", borderRadius: 10, cursor: "pointer",
                    border: "2px solid #e5e7eb", background: "#f8fafc",
                    transition: "all .15s", textAlign: "left" }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = AMBER; e.currentTarget.style.background = "#fffbeb"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "#e5e7eb"; e.currentTarget.style.background = "#f8fafc"; }}>
                  <div style={{ fontSize: 15, fontWeight: 900, color: NAVY }}>{s.size}&quot;</div>
                  <div style={{ fontSize: 10, color: "#9ca3af", marginTop: 2, lineHeight: 1.5 }}>
                    {s.projection_in && `${s.projection_in}" proj`}
                    {s.depth_in && ` · ${s.depth_in}" deep`}
                  </div>
                  {s.capacity_cu_in && (
                    <div style={{ fontSize: 10, color: AMBER, fontWeight: 700, marginTop: 2 }}>
                      {s.capacity_cu_in} cu.in
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Bucket Card ───────────────────────────────────────────────────────────────
function BucketCard({ rec, onClick }) {
  const materials = parseMaterials(rec.material);
  const isAg = (rec.application || "").toLowerCase().includes("ag");
  let sizeCount = 0;
  try { sizeCount = rec.bucket_sizes_detail ? JSON.parse(rec.bucket_sizes_detail).length : 0; } catch {}

  return (
    <div onClick={onClick}
      style={{ background: "#fff", borderRadius: 14, border: "1px solid #e5e7eb",
        cursor: "pointer", overflow: "hidden", display: "flex", flexDirection: "column",
        transition: "transform .15s, box-shadow .15s" }}
      onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 8px 28px rgba(0,0,0,.11)"; }}
      onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; }}>

      <div style={{ height: 4, background: `linear-gradient(90deg,${AMBER},${AMBER}66)` }} />

      {/* Image */}
      <div style={{ background: "#f8fafc", display: "flex", alignItems: "center",
        justifyContent: "center", height: 150, overflow: "hidden", position: "relative" }}>
        {rec.image_url ? (
          <img src={rec.image_url} alt={rec.series}
            style={{ maxHeight: 130, maxWidth: "90%", objectFit: "contain", padding: 8 }}
            onError={e => { e.target.style.display = "none"; }} />
        ) : <div style={{ color: "#d1d5db", fontSize: 44 }}>🪣</div>}

        {/* Material color dots */}
        {materials.length > 0 && (
          <div style={{ position: "absolute", bottom: 8, right: 8, display: "flex", gap: 4 }}>
            {materials.slice(0, 4).map(m => {
              const d = getMat(m);
              return (
                <span key={m} title={m}
                  style={{ width: 12, height: 12, borderRadius: "50%", background: d.dot,
                    border: "2px solid #fff", boxShadow: "0 1px 3px rgba(0,0,0,.25)", display: "block" }} />
              );
            })}
          </div>
        )}
      </div>

      <div style={{ padding: "12px 14px 8px", flex: 1 }}>
        <div style={{ display: "flex", gap: 5, marginBottom: 6, flexWrap: "wrap" }}>
          <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 99,
            background: isAg ? "#d1fae5" : "#dbeafe",
            color: isAg ? "#065f46" : "#1d4ed8" }}>
            {rec.application}
          </span>
          {rec.duty && (
            <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 99,
              background: "#f3f4f6", color: "#374151" }}>{rec.duty}</span>
          )}
        </div>
        <div style={{ fontSize: 14, fontWeight: 900, color: NAVY, lineHeight: 1.25, marginBottom: 4 }}>
          {rec.series}
        </div>
        {rec.style && (
          <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 6 }}>{rec.style}</div>
        )}
        {/* Material pills */}
        <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
          {materials.slice(0, 4).map(m => {
            const d = getMat(m);
            return (
              <span key={m} style={{ fontSize: 10, padding: "2px 8px", borderRadius: 99,
                background: d.bg, color: d.color, fontWeight: 700 }}>{m}</span>
            );
          })}
        </div>
      </div>

      <div style={{ padding: "8px 14px 12px", display: "flex",
        justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #f9fafb" }}>
        <span style={{ fontSize: 10, color: "#9ca3af" }}>
          {sizeCount > 0 ? `${sizeCount} sizes` : ""}
          {rec.page_range ? ` · pp. ${rec.page_range}` : ""}
        </span>
        <span style={{ fontSize: 11, color: AMBER, fontWeight: 800 }}>View & Configure →</span>
      </div>
    </div>
  );
}

// ── Generic product card & modal (kept from v5) ───────────────────────────────
function Badge({ label, bg = "#f3f4f6", color = "#374151", xs }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center",
      padding: xs ? "1px 7px" : "3px 10px", borderRadius: 99,
      background: bg, color, fontSize: xs ? 10 : 11, fontWeight: 700, whiteSpace: "nowrap" }}>
      {label}
    </span>
  );
}

const TYPE_META = {
  "Elevator Bucket":        { color: "#b45309", bg: "#fef3c7" },
  "Elevator Belt":          { color: "#7c3aed", bg: "#ede9fe" },
  "Modular Plastic Belt":   { color: "#065f46", bg: "#d1fae5" },
  "Wire Mesh Belt":         { color: "#1e40af", bg: "#dbeafe" },
  "Steel Hinged Belt":      { color: "#374151", bg: "#f3f4f6" },
  "Table Top Chain":        { color: "#0e7490", bg: "#cffafe" },
  "ANSI/BS Chain":          { color: "#4338ca", bg: "#e0e7ff" },
  "ANSI Roller Chain":      { color: "#3730a3", bg: "#e0e7ff" },
  "ANSI Roller Chain Attachments": { color: "#6d28d9", bg: "#ede9fe" },
  "Cast Chain":             { color: "#7f1d1d", bg: "#fee2e2" },
  "Engineered Chain":       { color: "#1d4ed8", bg: "#dbeafe" },
  "Forged Chain":           { color: "#92400e", bg: "#ffedd5" },
  "Welded Steel Chain":     { color: "#374151", bg: "#f1f5f9" },
  "Overhead Chain":         { color: "#0f766e", bg: "#ccfbf1" },
  "Conveyor Roller":        { color: "#0369a1", bg: "#e0f2fe" },
  "Monitoring System":      { color: "#047857", bg: "#d1fae5" },
};

function GenericCard({ rec, type, onClick }) {
  const tm = TYPE_META[type] || { color: NAVY, bg: "#f3f4f6" };
  return (
    <div onClick={onClick}
      style={{ background: "#fff", borderRadius: 12, border: "1px solid #e5e7eb",
        cursor: "pointer", overflow: "hidden", display: "flex", flexDirection: "column",
        transition: "transform .15s, box-shadow .15s" }}
      onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 6px 20px rgba(0,0,0,.10)"; }}
      onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; }}>
      <div style={{ height: 4, background: `linear-gradient(90deg,${tm.color},${tm.color}66)` }} />
      {rec.image_url && (
        <div style={{ background: "#f8fafc", display: "flex", alignItems: "center",
          justifyContent: "center", height: 130, overflow: "hidden" }}>
          <img src={rec.image_url} alt={rec.series}
            style={{ maxHeight: 120, maxWidth: "100%", objectFit: "contain", padding: 8 }}
            onError={e => { e.target.style.display = "none"; }} />
        </div>
      )}
      <div style={{ padding: "12px 14px", flex: 1, display: "flex", flexDirection: "column", gap: 5 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 6 }}>
          <Badge label={type} bg={tm.bg} color={tm.color} xs />
          {rec.pitch_in && <span style={{ fontSize: 10, color: "#9ca3af" }}>{rec.pitch_in}" pitch</span>}
        </div>
        <div style={{ fontSize: 13, fontWeight: 800, color: NAVY, lineHeight: 1.25 }}>
          {rec.series || rec.name || "—"}
        </div>
        {(rec.style || rec.category) && <div style={{ fontSize: 11, color: "#6b7280" }}>{rec.style || rec.category}</div>}
        <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
          {rec.hinge_style && <Badge label={rec.hinge_style} bg="#f9fafb" color="#374151" xs />}
          {rec.open_area && rec.open_area !== "0%" && <Badge label={`${rec.open_area} open`} bg="#f0fdf4" color="#15803d" xs />}
          {!rec.hinge_style && rec.duty && <Badge label={rec.duty} bg="#f9fafb" color="#374151" xs />}
        </div>
        {(rec.notes || rec.materials || rec.material) && (
          <div style={{ fontSize: 11, color: "#6b7280", lineHeight: 1.5,
            display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
            {rec.notes || rec.materials || rec.material}
          </div>
        )}
      </div>
      <div style={{ padding: "8px 14px", borderTop: "1px solid #f3f4f6",
        display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 10, color: "#d1d5db" }}>{rec.page_range ? `pp. ${rec.page_range}` : ""}</span>
        <span style={{ fontSize: 11, color: tm.color, fontWeight: 700 }}>Details →</span>
      </div>
    </div>
  );
}

function MacSpecTable({ headers, rows }) {
  let pH = headers, pR = rows;
  try { if (typeof headers === "string") pH = JSON.parse(headers); } catch {}
  try { if (typeof rows === "string") pR = JSON.parse(rows); } catch {}
  if (!pH?.length || !pR?.length) return null;
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
        <thead><tr style={{ background: NAVY }}>
          {pH.map((h, i) => <th key={i} style={{ padding: "8px 10px", color: "#fff", fontWeight: 700, textAlign: "left", fontSize: 11, whiteSpace: "nowrap" }}>{h}</th>)}
        </tr></thead>
        <tbody>{pR.map((row, i) => (
          <tr key={i} style={{ background: i % 2 === 0 ? "#f8fafc" : "#fff", borderBottom: "1px solid #e5e7eb" }}>
            {(Array.isArray(row) ? row : pH.map(h => row[h])).map((cell, j) => (
              <td key={j} style={{ padding: "7px 10px", color: j === 0 ? NAVY : "#374151", fontWeight: j === 0 ? 700 : 400, whiteSpace: "nowrap" }}>
                {cell != null ? String(cell) : "—"}
              </td>
            ))}
          </tr>
        ))}</tbody>
      </table>
    </div>
  );
}

function BucketBeltDataTable({ beltData }) {
  let rows = [];
  try { rows = typeof beltData === "string" ? JSON.parse(beltData) : beltData; } catch { return null; }
  if (!rows?.length) return null;
  const cols = [
    { key: "material", label: "Material" }, { key: "strength_lbf", label: "Strength (lbf)" },
    { key: "temp_min_f", label: "Min (°F)" }, { key: "temp_max_f", label: "Max (°F)" },
    { key: "mass_lbft2", label: "Mass (lb/ft²)" },
  ].filter(c => rows.some(r => r[c.key] != null && r[c.key] !== ""));
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
        <thead><tr style={{ background: NAVY }}>
          {cols.map(c => <th key={c.key} style={{ padding: "8px 10px", color: "#fff", fontWeight: 700, textAlign: "left", fontSize: 11 }}>{c.label}</th>)}
        </tr></thead>
        <tbody>{rows.map((row, i) => (
          <tr key={i} style={{ background: i % 2 === 0 ? "#f8fafc" : "#fff", borderBottom: "1px solid #e5e7eb" }}>
            {cols.map(c => <td key={c.key} style={{ padding: "7px 10px", color: c.key === "material" ? NAVY : "#374151", fontWeight: c.key === "material" ? 700 : 400 }}>{row[c.key] != null ? String(row[c.key]) : "—"}</td>)}
          </tr>
        ))}</tbody>
      </table>
    </div>
  );
}

function GenericModal({ rec, type, onClose }) {
  const [tab, setTab] = useState("overview");
  const [added, setAdded] = useState(false);
  if (!rec) return null;
  const tm = TYPE_META[type] || { color: NAVY, bg: "#f3f4f6" };
  const isMac = rec._src === "mac";
  let beltRows = [];
  if (rec.belt_data) { try { beltRows = typeof rec.belt_data === "string" ? JSON.parse(rec.belt_data) : rec.belt_data; } catch {} }
  let parsedSpecs = null;
  if (rec.key_specs) { try { parsedSpecs = JSON.parse(rec.key_specs); } catch {} }
  const mats = (rec.materials || rec.material || "").split(/[,/]/).map(s => s.trim()).filter(Boolean);
  const specs = [
    ["Series", rec.series], ["Style", rec.style || rec.category], ["Vendor", rec.vendor],
    ["Duty", rec.duty], ["Application", rec.application], ["Model", rec.model_code],
    ["Pitch", rec.pitch_in ? `${rec.pitch_in}" (${rec.pitch_mm}mm)` : null],
    ["Min Width", rec.min_width_in ? `${rec.min_width_in}"` : null],
    ["Open Area", rec.open_area], ["Hinge Style", rec.hinge_style],
    ["Pages", rec.page_range ? `pp. ${rec.page_range}` : null],
  ];
  const tabs = [
    isMac && rec.basic_headers ? ["macspecs", "Specifications"] : ["overview", "Specs"],
    isMac && rec.more_headers && ["macmore", "More Specs"],
    mats.length > 0 && !isMac && ["materials", "Materials"],
    beltRows.length > 0 && ["beltdata", "Belt Data"],
    parsedSpecs && ["keyspecs", "Key Specs"],
    (rec.catalog_url || rec.tech_doc_url || rec.cad_url) && ["resources", "Resources"],
  ].filter(Boolean);

  function addToRFQ() {
    const cart = JSON.parse(localStorage.getItem("uniking_rfq_cart") || "[]");
    cart.push({ id: `${rec._src}-${rec.id}-${Date.now()}`, type, series: rec.series || rec.part_number, style: rec.style || rec.category, notes: "", qty: 1 });
    localStorage.setItem("uniking_rfq_cart", JSON.stringify(cart));
    setAdded(true);
    setTimeout(() => setAdded(false), 2500);
  }

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.55)", zIndex: 1000,
      display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }} onClick={onClose}>
      <div style={{ background: "#fff", borderRadius: 16, width: "100%", maxWidth: 700,
        maxHeight: "93vh", overflowY: "auto" }} onClick={e => e.stopPropagation()}>
        <div style={{ background: `linear-gradient(135deg,${NAVY},#2d5986)`, borderRadius: "16px 16px 0 0", padding: "20px 22px 16px", position: "relative" }}>
          <button onClick={onClose} style={{ position: "absolute", top: 12, right: 14, background: "rgba(255,255,255,.15)", border: "none", borderRadius: "50%", width: 32, height: 32, cursor: "pointer", color: "#fff", fontSize: 16 }}>✕</button>
          <div style={{ display: "flex", gap: 8, marginBottom: 10, flexWrap: "wrap" }}>
            <Badge label={type} bg={tm.bg} color={tm.color} />
            {rec.vendor && <Badge label={rec.vendor} bg="rgba(255,255,255,.15)" color="#fff" />}
          </div>
          <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
            {rec.image_url && (
              <div style={{ background: "#fff", borderRadius: 10, padding: 8, flexShrink: 0, width: 120, height: 90, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <img src={rec.image_url} alt={rec.series} style={{ maxWidth: 110, maxHeight: 80, objectFit: "contain" }} onError={e => { e.target.parentElement.style.display = "none"; }} />
              </div>
            )}
            <div>
              <div style={{ fontSize: 21, fontWeight: 900, color: "#fff", lineHeight: 1.15 }}>{isMac ? (rec.part_number || rec.series) : rec.series}</div>
              {(rec.style || rec.category) && <div style={{ fontSize: 13, color: "rgba(255,255,255,.65)", marginTop: 4 }}>{rec.style || rec.category}</div>}
              <div style={{ display: "flex", gap: 6, marginTop: 8, flexWrap: "wrap" }}>
                {rec.pitch_in && <Badge label={`${rec.pitch_in}" pitch`} bg="rgba(255,255,255,.15)" color="#fff" />}
                {rec.hinge_style && <Badge label={rec.hinge_style} bg="rgba(255,255,255,.15)" color="#fff" />}
                {rec.open_area && <Badge label={`${rec.open_area} open`} bg="rgba(255,255,255,.15)" color="#fff" />}
              </div>
            </div>
          </div>
        </div>
        {(rec.notes || rec.description) && (
          <div style={{ margin: "14px 20px 0", fontSize: 13, color: "#374151", lineHeight: 1.7, padding: "10px 14px", background: "#f8fafc", borderRadius: 8, borderLeft: `3px solid ${tm.color}` }}>
            {rec.notes || rec.description}
          </div>
        )}
        {rec.features && (
          <div style={{ margin: "10px 20px 0" }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>Features</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {(Array.isArray(rec.features) ? rec.features : rec.features.split(";")).map((f, i) => f && f.trim && f.trim() && (
                <span key={i} style={{ fontSize: 11, padding: "3px 9px", borderRadius: 99, background: tm.bg, color: tm.color, fontWeight: 600 }}>✓ {typeof f === "string" ? f.trim() : f}</span>
              ))}
            </div>
          </div>
        )}
        <div style={{ display: "flex", borderBottom: "2px solid #f3f4f6", margin: "14px 20px 0", overflowX: "auto" }}>
          {tabs.map(([id, label]) => (
            <button key={id} onClick={() => setTab(id)}
              style={{ padding: "8px 14px", border: "none", background: "none", cursor: "pointer", fontSize: 12, fontWeight: 700, whiteSpace: "nowrap",
                color: tab === id ? tm.color : "#9ca3af", borderBottom: tab === id ? `2px solid ${tm.color}` : "2px solid transparent", marginBottom: -2 }}>
              {label}
            </button>
          ))}
        </div>
        <div style={{ padding: "16px 20px 0" }}>
          {tab === "macspecs" && <MacSpecTable headers={rec.basic_headers} rows={rec.basic_rows} />}
          {tab === "macmore" && <MacSpecTable headers={rec.more_headers} rows={rec.more_rows} />}
          {tab === "overview" && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {specs.filter(([, v]) => v && v !== "—" && v !== "null").map(([l, v]) => (
                <div key={l} style={{ padding: "10px 12px", background: "#f8fafc", borderRadius: 8, border: "1px solid #f1f5f9" }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: .5, marginBottom: 3 }}>{l}</div>
                  <div style={{ fontSize: 13, color: NAVY, fontWeight: 600 }}>{v}</div>
                </div>
              ))}
            </div>
          )}
          {tab === "materials" && <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>{mats.map((m, i) => <span key={i} style={{ padding: "8px 14px", borderRadius: 99, background: tm.bg, color: tm.color, fontWeight: 700, fontSize: 13 }}>{m}</span>)}</div>}
          {tab === "beltdata" && <BucketBeltDataTable beltData={rec.belt_data} />}
          {tab === "keyspecs" && parsedSpecs && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {Object.entries(parsedSpecs).map(([k, v]) => (
                <div key={k} style={{ padding: "10px 12px", background: "#f8fafc", borderRadius: 8 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: .5, marginBottom: 3 }}>{k.replace(/_/g, " ")}</div>
                  <div style={{ fontSize: 13, color: NAVY, fontWeight: 600 }}>{String(v)}</div>
                </div>
              ))}
            </div>
          )}
          {tab === "resources" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {rec.catalog_url && <a href={rec.catalog_url} target="_blank" rel="noreferrer" style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", background: "#f8fafc", borderRadius: 10, border: "1px solid #e5e7eb", color: NAVY, fontWeight: 700, fontSize: 13, textDecoration: "none" }}>📄 Catalog PDF</a>}
              {rec.tech_doc_url && <a href={rec.tech_doc_url} target="_blank" rel="noreferrer" style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", background: "#f8fafc", borderRadius: 10, border: "1px solid #e5e7eb", color: NAVY, fontWeight: 700, fontSize: 13, textDecoration: "none" }}>📐 Technical Docs</a>}
              {rec.cad_url && <a href={rec.cad_url} target="_blank" rel="noreferrer" style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", background: "#f8fafc", borderRadius: 10, border: "1px solid #e5e7eb", color: NAVY, fontWeight: 700, fontSize: 13, textDecoration: "none" }}>📁 CAD Drawing</a>}
            </div>
          )}
        </div>
        <div style={{ padding: "16px 20px 24px", marginTop: 12 }}>
          <button onClick={addToRFQ} style={{ width: "100%", padding: "12px 20px", borderRadius: 10, border: "none", background: added ? "#065f46" : NAVY, color: "#fff", fontSize: 14, fontWeight: 800, cursor: "pointer" }}>
            {added ? "✓ Added to RFQ Cart" : "Add to RFQ Cart"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── MAIN ──────────────────────────────────────────────────────────────────────
function ElevBucketsView({ onBack, onGoRFQ }) {
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("Elevator Bucket");
  const [appFilter, setAppFilter] = useState("All");
  const [seriesFilter, setSeriesFilter] = useState("All");
  const [hingeFilter, setHingeFilter] = useState("All");
  const [pitchFilter, setPitchFilter] = useState("All");
  const [selected, setSelected] = useState(null);
  const [selectedType, setSelectedType] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        async function fetchAll(entity) {
          let all = [], skip = 0, hasMore = true;
          while (hasMore) {
            const batch = await entity.list({ limit: 500, skip });
            all = [...all, ...batch];
            hasMore = batch.length === 500;
            skip += batch.length;
          }
          return all;
        }
        const [intralox, unicatalog, buckets, macChains] = await Promise.all([
          fetchAll(CatalogProduct),
          fetchAll(UniCatalog),
          fetchAll(ElevatorBucket),
          fetchAll(MacChainProduct),
        ]);

        setAllProducts([
          ...intralox.map(r => ({ ...r, _src: "intralox", _type: r.category || "Modular Plastic Belt" })),
          ...unicatalog.map(r => ({ ...r, _src: "uni", _type: r.product_type })),
          ...buckets.map(r => ({ ...r, _src: "bucket", _type: "Elevator Bucket" })),
          ...macChains.map(r => ({
            ...r, _src: "mac",
            _type: r.product_type === "ANSI Roller Chain" ? "ANSI Roller Chain" :
              r.product_type === "ANSI Roller Chain Attachments" ? "ANSI Roller Chain Attachments" : "Engineered Chain",
            vendor: "", series: r.part_number || r.series,
            style: r.subcategory || r.category,
            image_url: r.product_image || r.image_url,
          })),
        ]);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    }
    load();
  }, []);

  const types = useMemo(() =>
    ["All", ...new Set(allProducts.map(p => p._type).filter(Boolean))].sort((a, b) => a === "All" ? -1 : a.localeCompare(b)),
    [allProducts]);

  const isBucketView = typeFilter === "Elevator Bucket";

  const filtered = useMemo(() => {
    let list = allProducts;
    if (typeFilter !== "All") list = list.filter(p => p._type === typeFilter);
    if (isBucketView && appFilter !== "All")
      list = list.filter(p => (p.application || "").toLowerCase().includes(appFilter.toLowerCase()));
    if (seriesFilter !== "All") list = list.filter(p => p.series === seriesFilter);
    if (hingeFilter !== "All") list = list.filter(p => p.hinge_style === hingeFilter);
    if (pitchFilter !== "All") list = list.filter(p => `${p.pitch_in}"` === pitchFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(p => [p.series, p.style, p.category, p.notes, p.materials,
        p.material, p.search_tags, p.application, p.part_number, p.description]
        .some(f => f && f.toLowerCase().includes(q)));
    }
    return list.sort((a, b) => {
      const pn = s => { const m = (s || "").trim().match(/^(\d+(?:\.\d+)?)(.*)/); if (!m) return [0, 0, s || ""]; const st = (m[2] || "").match(/-(\d+)$/); return [parseFloat(m[1]), st ? parseInt(st[1]) : 1, m[2] || ""]; };
      const [an, as2, ar] = pn(a.series), [bn, bs2, br] = pn(b.series);
      return an !== bn ? an - bn : as2 !== bs2 ? as2 - bs2 : ar.localeCompare(br);
    });
  }, [allProducts, typeFilter, appFilter, isBucketView, seriesFilter, hingeFilter, pitchFilter, search]);

  const seriesOptions = useMemo(() => {
    const base = typeFilter === "All" ? allProducts : allProducts.filter(p => p._type === typeFilter);
    return ["All", ...new Set(base.map(p => p.series).filter(Boolean))].sort((a, b) => a === "All" ? -1 : a.localeCompare(b));
  }, [allProducts, typeFilter]);

  const hingeOptions = useMemo(() =>
    ["All", ...new Set(allProducts.filter(p => p.hinge_style).map(p => p.hinge_style))].sort(),
    [allProducts]);

  const pitchOptions = useMemo(() =>
    ["All", ...new Set(allProducts.filter(p => p.pitch_in).map(p => `${p.pitch_in}"`))]
      .sort((a, b) => a === "All" ? -1 : parseFloat(a) - parseFloat(b)),
    [allProducts]);

  const bucketAg    = filtered.filter(p => p._src === "bucket" && (p.application || "").toLowerCase().includes("ag"));
  const bucketInd   = filtered.filter(p => p._src === "bucket" && (p.application || "").toLowerCase().includes("ind"));
  const bucketOther = filtered.filter(p => p._src === "bucket" && !bucketAg.includes(p) && !bucketInd.includes(p));
  const nonBuckets  = filtered.filter(p => p._src !== "bucket");

  const anyFilter = typeFilter !== "All" || appFilter !== "All" || seriesFilter !== "All" ||
    hingeFilter !== "All" || pitchFilter !== "All" || search;

  const Sel = ({ value, onChange, options, label }) => (
    <select value={value} onChange={e => onChange(e.target.value)}
      style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid #d1d5db", fontSize: 13,
        color: NAVY, background: "#fff", cursor: "pointer", fontWeight: value !== "All" ? 700 : 400 }}>
      <option value="All">{label}</option>
      {options.filter(o => o !== "All").map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  );

  // Render bucket sections
  function BucketSection({ title, items, accentColor }) {
    if (!items.length) return null;
    return (
      <div style={{ marginBottom: 40 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
          <div style={{ height: 3, width: 32, background: accentColor, borderRadius: 99 }} />
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 900, color: NAVY }}>{title}</h2>
          <span style={{ fontSize: 12, color: "#9ca3af" }}>{items.length} series</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))", gap: 16 }}>
          {items.map(rec => (
            <BucketCard key={rec.id} rec={rec}
              onClick={() => { setSelected(rec); setSelectedType("bucket"); }} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", fontFamily: "'Inter','Segoe UI',sans-serif" }}>
      {/* Top Bar */}
      <div style={{ background: NAVY, padding: "0 24px", display: "flex", alignItems: "center",
        justifyContent: "space-between", height: 56, boxShadow: "0 2px 8px rgba(0,0,0,.18)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <a href="#" onClick={e => { e.preventDefault(); onBack(); }} style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 14px", borderRadius: 8, background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)", color: "#fff", fontWeight: 700, fontSize: 13, textDecoration: "none" }}>← Home</a>
          <span style={{ color: "rgba(255,255,255,.3)", fontSize: 12 }}>/</span>
          <span style={{ color: "#fff", fontSize: 13, fontWeight: 700 }}>Elevator Buckets</span>
        </div>
        <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
          <span style={{ fontSize: 11, color: "rgba(255,255,255,.4)" }}>
            {loading ? "Loading..." : `${filtered.length} products`}
          </span>
          <a href="#" onClick={e => { e.preventDefault(); onGoRFQ(); }} style={{ padding: "6px 14px", borderRadius: 8,
            background: "rgba(255,255,255,.12)", border: "1px solid rgba(255,255,255,.2)",
            color: "#fff", fontSize: 12, fontWeight: 700, textDecoration: "none" }}>RFQ Cart</a>
        </div>
      </div>

      {/* Filters */}
      <div style={{ background: "#fff", borderBottom: "1px solid #e5e7eb", padding: "14px 24px" }}>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", maxWidth: 1200, margin: "0 auto" }}>
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search series, style, application, material..."
            style={{ flex: 1, minWidth: 240, padding: "8px 14px", borderRadius: 8,
              border: "1px solid #d1d5db", fontSize: 13, outline: "none" }} />
          <Sel value={typeFilter} onChange={v => { setTypeFilter(v); setSeriesFilter("All"); setAppFilter("All"); }} options={types} label="All Types" />
          {isBucketView && <Sel value={appFilter} onChange={setAppFilter} options={["All", "Agricultural", "Industrial"]} label="All Applications" />}
          {seriesOptions.length > 2 && <Sel value={seriesFilter} onChange={setSeriesFilter} options={seriesOptions} label="All Series" />}
          {!isBucketView && hingeOptions.length > 2 && <Sel value={hingeFilter} onChange={setHingeFilter} options={hingeOptions} label="Hinge Style" />}
          {!isBucketView && pitchOptions.length > 2 && <Sel value={pitchFilter} onChange={setPitchFilter} options={pitchOptions} label="Pitch" />}
          {anyFilter && (
            <button onClick={() => { setTypeFilter("All"); setSeriesFilter("All"); setHingeFilter("All"); setPitchFilter("All"); setAppFilter("All"); setSearch(""); }}
              style={{ padding: "8px 14px", borderRadius: 8, border: "1px solid #d1d5db", background: "#f9fafb", cursor: "pointer", fontSize: 13, color: "#6b7280" }}>
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: 24 }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: 80, color: "#9ca3af", fontSize: 14 }}>Loading catalog...</div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: 80, color: "#9ca3af", fontSize: 14 }}>No products match your search.</div>
        ) : (
          <>
            {/* Buckets always render as BucketCards */}
            {(typeFilter === "All" || isBucketView) && (bucketAg.length > 0 || bucketInd.length > 0 || bucketOther.length > 0) && (
              <div>
                {typeFilter === "All" && (
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
                    <div style={{ height: 3, width: 32, background: AMBER, borderRadius: 99 }} />
                    <h2 style={{ margin: 0, fontSize: 18, fontWeight: 900, color: NAVY }}>Elevator Buckets</h2>
                  </div>
                )}
                <BucketSection title={isBucketView && appFilter !== "All" ? "" : "Agricultural Buckets"} items={bucketAg} accentColor="#065f46" />
                <BucketSection title={isBucketView && appFilter !== "All" ? "" : "Industrial Buckets"} items={bucketInd} accentColor="#1d4ed8" />
                <BucketSection title="Steel / Other Buckets" items={bucketOther} accentColor="#374151" />
              </div>
            )}

            {/* All other product types */}
            {(typeFilter === "All" || !isBucketView) && nonBuckets.length > 0 && (
              <>
                {typeFilter === "All" && (bucketAg.length > 0 || bucketInd.length > 0) && (
                  <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "32px 0 18px" }}>
                    <div style={{ height: 3, width: 32, background: NAVY, borderRadius: 99 }} />
                    <h2 style={{ margin: 0, fontSize: 18, fontWeight: 900, color: NAVY }}>Conveyor Components</h2>
                  </div>
                )}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))", gap: 16 }}>
                  {nonBuckets.map(rec => (
                    <GenericCard key={rec.id} rec={rec} type={rec._type}
                      onClick={() => { setSelected(rec); setSelectedType(rec._type); }} />
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>

      {selected && selectedType === "bucket" && (
        <BucketStyleModal rec={selected} onClose={() => { setSelected(null); setSelectedType(null); }} />
      )}
      {selected && selectedType !== "bucket" && (
        <GenericModal rec={selected} type={selectedType} onClose={() => { setSelected(null); setSelectedType(null); }} />
      )}
    </div>
  );
}


// ═══════════════════════════════════════════════════════════════════════════════
// ── FORGED CHAIN VIEW ─────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

const IMG = {
  standard: "https://base44.app/api/apps/69dd9ffccab4dd693d4d92f5/files/mp/public/69dd9ffccab4dd693d4d92f5/6db3d3f32_standard-link.jpg",
  double:   "https://base44.app/api/apps/69dd9ffccab4dd693d4d92f5/files/mp/public/69dd9ffccab4dd693d4d92f5/8b574a65e_double-link.jpg",
  triple:   "https://base44.app/api/apps/69dd9ffccab4dd693d4d92f5/files/mp/public/69dd9ffccab4dd693d4d92f5/fa0ba96be_triple-link.jpg",
  hero:     "https://base44.app/api/apps/69dd9ffccab4dd693d4d92f5/files/mp/public/69dd9ffccab4dd693d4d92f5/4ed6677f2_forged-chain.jpg",
  bolt_n_go: "https://base44.app/api/apps/69dd9ffccab4dd693d4d92f5/files/mp/public/69dd9ffccab4dd693d4d92f5/4730baa88_4b142ha-chain.jpg",
  chain_installed:    "https://base44.app/api/apps/69dd9ffccab4dd693d4d92f5/files/mp/public/69dd9ffccab4dd693d4d92f5/4730baa88_4b142ha-chain.jpg",
  double_installed:   "https://base44.app/api/apps/69dd9ffccab4dd693d4d92f5/files/mp/public/69dd9ffccab4dd693d4d92f5/5927207c6_double-link-installed.jpg",
  sprocket_installed: "https://base44.app/api/apps/69dd9ffccab4dd693d4d92f5/files/mp/public/69dd9ffccab4dd693d4d92f5/1869b08c5_sprocket-installed.jpg",
  // Pin images — each pin type gets its own cropped region from the combined photo
  pin_all:            "https://base44.app/api/apps/69dd9ffccab4dd693d4d92f5/files/mp/public/69dd9ffccab4dd693d4d92f5/728ea1a69_chain-pins.jpg",
  // Flight images
  "Square Bar Flight":                  "https://base44.app/api/apps/69dd9ffccab4dd693d4d92f5/files/mp/public/69dd9ffccab4dd693d4d92f5/a79564d01_SQUARE-BAR.jpg",
  "Flat Bar Flight":                    "https://base44.app/api/apps/69dd9ffccab4dd693d4d92f5/files/mp/public/69dd9ffccab4dd693d4d92f5/57feb5aa4_FLAT-BAR.jpg",
  "Paddle Flight":                      "https://base44.app/api/apps/69dd9ffccab4dd693d4d92f5/files/mp/public/69dd9ffccab4dd693d4d92f5/a3b67f93e_PADDLE-FLIGHT.jpg",
  "U Flight":                           "https://base44.app/api/apps/69dd9ffccab4dd693d4d92f5/files/mp/public/69dd9ffccab4dd693d4d92f5/4d1c1743b_U-FLIGHT.jpg",
  "Closed U Flight":                    "https://base44.app/api/apps/69dd9ffccab4dd693d4d92f5/files/mp/public/69dd9ffccab4dd693d4d92f5/604e3bf5d_CLOSED-U.jpg",
  "Closed U Flight with Filler Plates": "https://base44.app/api/apps/69dd9ffccab4dd693d4d92f5/files/mp/public/69dd9ffccab4dd693d4d92f5/8d578750f_CLOSED-U-WITH-FILLER-PLATES.jpg",
  "00 Flight":                          "https://base44.app/api/apps/69dd9ffccab4dd693d4d92f5/files/mp/public/69dd9ffccab4dd693d4d92f5/4dd6a6dd2_OO-FLIGHT.jpg",
  "00 Flight with Filler Plates":       "https://base44.app/api/apps/69dd9ffccab4dd693d4d92f5/files/mp/public/69dd9ffccab4dd693d4d92f5/253dff3e1_OO-WITH-FILLER-PLATES.jpg",
  "Return Cups":                        "https://base44.app/api/apps/69dd9ffccab4dd693d4d92f5/files/mp/public/69dd9ffccab4dd693d4d92f5/2be898a6a_RETURN-CUPS.jpg",
};

// Pin type individual images (using object-position to crop the combined photo)
const PIN_IMG_POSITION = {
  "Forged Head Pin + Collar and Roll Pin": "top",    // top row in combined photo
  "Forged Head Pin + One Clamp":           "center", // middle row
  "Plain Pin + Two Clamps":               "bottom",  // bottom row
};

function getLinkImg(t) { return t==="Double"?IMG.double:t==="Triple"?IMG.triple:IMG.standard; }
function tryParse(v) { try { return JSON.parse(v||"[]"); } catch { return []; } }

const MM_TO_IN = 0.03937008;
const IN_TO_MM = 25.4;
function toDisplay(mm, imperial) {
  if (!mm && mm !== 0) return "";
  return imperial ? (parseFloat(mm) * MM_TO_IN).toFixed(3) : String(mm);
}
function toMM(val, imperial) {
  const n = parseFloat(val);
  if (isNaN(n)) return "";
  return imperial ? String(Math.round(n * IN_TO_MM * 10) / 10) : String(n);
}

// getRFQCart/saveRFQCart/addToRFQ defined above

// ── PIN PRODUCT PAGE ──────────────────────────────────────────────────────────
function PinModal({ pinName, chainLink, onClose, onAddRFQ }) {
  const [material, setMaterial] = useState("");
  const [qty, setQty] = useState("");
  const [added, setAdded] = useState(false);

  const position = PIN_IMG_POSITION[pinName] || "center";

  const pinDescriptions = {
    "Forged Head Pin + Collar and Roll Pin": "Drop-forged head pin retained by a collar and roll pin. Standard assembly method — provides maximum strength and is the most common configuration for heavy-duty drag conveyor chains.",
    "Forged Head Pin + One Clamp":           "Forged head pin retained by a single clamp. Easier to service than roll pin style — ideal for applications requiring frequent disassembly or inspection.",
    "Plain Pin + Two Clamps":                "Plain (unheaded) pin retained by two clamps, one on each end. Allows removal from either side — preferred in confined spaces or where bidirectional disassembly is needed.",
  };

  const handleAdd = () => {
    if (!material || !qty) return;
    onAddRFQ({ description: `4B Drop Forged Chain Pin — ${pinName} | Chain: ${chainLink} | Material: ${material} | Qty: ${qty} pins` });
    setAdded(true);
    setTimeout(() => onClose(), 1500);
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", zIndex: 10000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ background: "white", borderRadius: 16, width: "100%", maxWidth: 480, width: "calc(100vw - 32px)", maxHeight: "90vh", overflowY: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
        <div style={{ background: `linear-gradient(135deg, ${C.navy}, ${C.navyMid})`, padding: "20px 24px", borderRadius: "16px 16px 0 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ color: "white", fontWeight: 800, fontSize: 16 }}>{pinName}</div>
            <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 12 }}>For chain: {chainLink}</div>
          </div>
          <button onClick={onClose} style={{ background: "rgba(255,255,255,0.1)", border: "none", color: "white", cursor: "pointer", borderRadius: 8, padding: "6px 12px", fontSize: 13 }}>✕</button>
        </div>

        {/* Pin image — cropped to show just this pin type */}
        <div style={{ overflow: "hidden", height: 160, position: "relative", background: "#f8fafc" }}>
          <img src={IMG.pin_all} alt={pinName}
            style={{ width: "100%", height: "480px", objectFit: "cover", objectPosition: `center ${position}`, position: "absolute", top: position === "top" ? 0 : position === "bottom" ? "auto" : "50%", transform: position === "center" ? "translateY(-50%)" : "none", bottom: position === "bottom" ? 0 : "auto" }} />
        </div>

        <div style={{ padding: "20px 24px" }}>
          <p style={{ fontSize: 13, color: C.text, lineHeight: 1.7, marginBottom: 20 }}>{pinDescriptions[pinName]}</p>

          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: C.muted, marginBottom: 8 }}>Pin Material</div>
            <div style={{ display: "flex", gap: 10 }}>
              {["Alloy Steel", "Stainless Steel"].map(m => (
                <button key={m} onClick={() => setMaterial(m)}
                  style={{ flex: 1, background: material === m ? C.navyMid : "#f1f5f9", color: material === m ? "white" : C.text,
                    border: `2px solid ${material === m ? C.navyMid : C.border}`, borderRadius: 8, padding: "10px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                  {m}
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: C.muted, marginBottom: 8 }}>Quantity (number of pins)</div>
            <input type="number" value={qty} onChange={e => setQty(e.target.value)} placeholder="e.g. 100"
              style={{ width: "100%", border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 14px", fontSize: 13, outline: "none", boxSizing: "border-box" }} />
          </div>

          <button onClick={handleAdd} disabled={!material || !qty}
            style={{ width: "100%", background: added ? C.green : (!material || !qty ? "#e5e7eb" : C.navyMid), color: !material || !qty ? C.muted : "white",
              border: "none", borderRadius: 10, padding: "14px", fontSize: 14, fontWeight: 700, cursor: !material || !qty ? "default" : "pointer" }}>
            {added ? "✓ Added to RFQ" : "Add to RFQ"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── SPROCKET PRODUCT PAGE ─────────────────────────────────────────────────────
function SprocketModal({ sprocket, chainLink, sprocketFamily, onClose, onAddRFQ }) {
  const [boreSize, setBoreSize] = useState("");
  const [boreType, setBoreType] = useState("");
  const [qty, setQty] = useState("");
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    if (!boreSize || !qty) return;
    const desc = `4B Sprocket ${sprocketFamily} — ${sprocket.teeth} Teeth | PCD=${sprocket.pcd_mm}mm | T=${sprocket.T_mm}mm | WB1=${sprocket.WB1_mm}mm | ØA=${sprocket.A_mm}mm | ØB=${sprocket.B_mm}mm | Bore: ${boreSize}${boreType ? ` (${boreType})` : ""} | Qty: ${qty} | For chain: ${chainLink}`;
    onAddRFQ({ description: desc });
    setAdded(true);
    setTimeout(() => onClose(), 1500);
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", zIndex: 10001, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ background: "white", borderRadius: 16, width: "100%", maxWidth: 480, width: "calc(100vw - 32px)", maxHeight: "90vh", overflowY: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
        <div style={{ background: `linear-gradient(135deg, ${C.navy}, ${C.navyMid})`, padding: "20px 24px", borderRadius: "16px 16px 0 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ color: "white", fontWeight: 800, fontSize: 16 }}>{sprocketFamily} — {sprocket.teeth} Teeth</div>
            <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 12 }}>For chain: {chainLink}</div>
          </div>
          <button onClick={onClose} style={{ background: "rgba(255,255,255,0.1)", border: "none", color: "white", cursor: "pointer", borderRadius: 8, padding: "6px 12px", fontSize: 13 }}>✕</button>
        </div>

        <div style={{ padding: 20 }}>
          <img src={IMG.sprocket_installed} alt="Sprocket"
            style={{ width: "100%", height: 140, objectFit: "cover", borderRadius: 10, marginBottom: 16, border: `1px solid ${C.border}` }} />

          {/* Specs table */}
          <div style={{ background: "#f8fafc", borderRadius: 10, border: `1px solid ${C.border}`, overflow: "hidden", marginBottom: 20 }}>
            <div style={{ background: C.navyMid, color: "white", padding: "8px 14px", fontSize: 12, fontWeight: 700 }}>Specifications</div>
            <div style={{ padding: "0 14px" }}>
              {[["Teeth", sprocket.teeth], ["PCD", `${sprocket.pcd_mm} mm`], ["Pitch Circle (P1)", `${sprocket.P1_mm} mm`], ["ØA", `${sprocket.A_mm} mm`], ["ØB", `${sprocket.B_mm} mm`], ["C max", `${sprocket.C_max_mm} mm`], ["Bolt Size", sprocket.D_mm], ["No. Bolts", sprocket.bolts], ["Thickness (T)", `${sprocket.T_mm} mm`], ["WB1", `${sprocket.WB1_mm} mm`]].map(([k, v]) => (
                <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: `1px solid ${C.border}`, fontSize: 13 }}>
                  <span style={{ color: C.muted }}>{k}</span><span style={{ fontWeight: 600 }}>{v}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Bore size */}
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: C.muted, marginBottom: 8 }}>Bore Size (required)</div>
            <input type="text" value={boreSize} onChange={e => setBoreSize(e.target.value)} placeholder='e.g. 60mm, 2.5", 70mm keyed'
              style={{ width: "100%", border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 14px", fontSize: 13, outline: "none", boxSizing: "border-box" }} />
          </div>

          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: C.muted, marginBottom: 8 }}>Bore Type (optional)</div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {["Plain Bore", "Keyed", "Taper Lock", "QD Bush"].map(b => (
                <button key={b} onClick={() => setBoreType(b === boreType ? "" : b)}
                  style={{ background: boreType === b ? C.navyMid : "#f1f5f9", color: boreType === b ? "white" : C.text,
                    border: `1px solid ${boreType === b ? C.navyMid : C.border}`, borderRadius: 8, padding: "6px 14px", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                  {b}
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: C.muted, marginBottom: 8 }}>Quantity</div>
            <input type="number" value={qty} onChange={e => setQty(e.target.value)} placeholder="e.g. 2"
              style={{ width: "100%", border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 14px", fontSize: 13, outline: "none", boxSizing: "border-box" }} />
          </div>

          <button onClick={handleAdd} disabled={!boreSize || !qty}
            style={{ width: "100%", background: added ? C.green : (!boreSize || !qty ? "#e5e7eb" : C.navyMid), color: !boreSize || !qty ? C.muted : "white",
              border: "none", borderRadius: 10, padding: "14px", fontSize: 14, fontWeight: 700, cursor: !boreSize || !qty ? "default" : "pointer" }}>
            {added ? "✓ Added to RFQ" : "Add Sprocket to RFQ"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── BOLT N GO PRODUCT PAGE ───────────────────────────────────────────────────
function BoltNGoModal({ chain, onClose, onAddRFQ }) {
  const [footage, setFootage] = useState("");
  const [unit, setUnit] = useState("feet");
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    if (!footage) return;
    onAddRFQ({ description: `4B Bolt N Go Chain ${chain.chain_link} (${chain.link_type} Link, P=${chain.P_mm}mm, ${chain.min_breaking_load_kn}kN) | ${footage} ${unit}` });
    setAdded(true);
    setTimeout(() => onClose(), 1500);
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", zIndex: 10000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ background: "white", borderRadius: 16, width: "100%", maxWidth: 480, width: "calc(100vw - 32px)", boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
        <div style={{ background: `linear-gradient(135deg, ${C.green}, #15803d)`, padding: "20px 24px", borderRadius: "16px 16px 0 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ color: "white", fontWeight: 800, fontSize: 16 }}>⚡ Bolt N Go — {chain.chain_link}</div>
            <div style={{ color: "rgba(255,255,255,0.8)", fontSize: 12 }}>Pre-assembled, ready-to-install chain</div>
          </div>
          <button onClick={onClose} style={{ background: "rgba(255,255,255,0.2)", border: "none", color: "white", cursor: "pointer", borderRadius: 8, padding: "6px 12px", fontSize: 13 }}>✕</button>
        </div>
        <div style={{ padding: "20px 24px" }}>
          <img src={IMG.bolt_n_go} alt="Bolt N Go Chain"
            style={{ width: "100%", height: 140, objectFit: "cover", borderRadius: 10, marginBottom: 16, border: `1px solid ${C.border}` }} />
          <p style={{ fontSize: 13, color: C.text, lineHeight: 1.7, marginBottom: 20 }}>
            Bolt N Go chain arrives pre-assembled with pins and clamps installed — ready to drop into your conveyor without any assembly. Saves significant installation time in the field.
          </p>
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: C.muted, marginBottom: 8 }}>Unit</div>
            <div style={{ display: "flex", gap: 10 }}>
              {["feet", "metres", "links"].map(u => (
                <button key={u} onClick={() => setUnit(u)}
                  style={{ flex: 1, background: unit === u ? C.navyMid : "#f1f5f9", color: unit === u ? "white" : C.text,
                    border: `2px solid ${unit === u ? C.navyMid : C.border}`, borderRadius: 8, padding: "8px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                  {u}
                </button>
              ))}
            </div>
          </div>
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: C.muted, marginBottom: 8 }}>Quantity ({unit})</div>
            <input type="number" value={footage} onChange={e => setFootage(e.target.value)} placeholder={`e.g. ${unit === "links" ? "50" : "100"}`}
              style={{ width: "100%", border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 14px", fontSize: 13, outline: "none", boxSizing: "border-box" }} />
          </div>
          <button onClick={handleAdd} disabled={!footage}
            style={{ width: "100%", background: added ? C.green : (!footage ? "#e5e7eb" : C.navyMid), color: !footage ? C.muted : "white",
              border: "none", borderRadius: 10, padding: "14px", fontSize: 14, fontWeight: 700, cursor: !footage ? "default" : "pointer" }}>
            {added ? "✓ Added to RFQ" : "Add Bolt N Go to RFQ"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── LIVE FLIGHT SCHEMATIC (single attachment, updates as dims typed) ────────────
function FlightSchematic({ att, imperial }) {
  const style = att?.flightStyle || "B";
  const unit = imperial ? "in" : "mm";
  const W_raw = parseFloat(att?.dims?.W) || 0;
  const H_raw = parseFloat(att?.dims?.H) || 0;
  const bar_raw = parseFloat(att?.dims?.barSize) || 0;
  const K_raw = parseFloat(att?.dims?.K) || 0;
  const hasUHMW = att?.uhmw;
  const uhmwT_raw = parseFloat(att?.uhmwDims?.thickness) || 0;
  const hasBacking = att?.hasBackingPlate;
  const bpT_raw = parseFloat(att?.backingPlateThickness) || 0;
  const seq = parseInt(att?.sequence) || 4;

  // SVG canvas
  const VW = 380, VH = 260;
  const cx = VW / 2;
  // Chain attachment points — two circles representing the chain
  // No chain shown in schematic — just the attachment profile
  const baseY = 210;

  // Scale flight dims to SVG pixels — relative to canvas
  const maxW = 300, maxH = 120;
  const W_px = W_raw > 0 ? Math.min(Math.max(W_raw * 0.55, 40), maxW) : 160;
  const H_px = H_raw > 0 ? Math.min(Math.max(H_raw * 0.55, 20), maxH) : 60;
  const bar_px = bar_raw > 0 ? Math.min(Math.max(bar_raw * 0.55, 6), 28) : 12;
  const K_px  = K_raw > 0 ? Math.min(Math.max(K_raw * 0.4, 6), 36) : 14;
  const uhmwT_px = uhmwT_raw > 0 ? Math.min(Math.max(uhmwT_raw * 0.4, 4), 20) : 8;
  const bpT_px = bpT_raw > 0 ? Math.min(Math.max(bpT_raw * 0.4, 4), 14) : 6;
  const wallT = Math.max(bar_px * 0.55, 6);

  // Colors
  const flightFill = "#4a7cba";
  const flightStroke = C.navyMid;
  const shadowFill = "#2e5a8a";
  const uhmwFill = "rgba(180,210,255,0.75)";
  // No chain graphic — clean attachment-only view

  // ── Flight body based on style ──
  let flightElem = null;
  let dimAnnotations = [];

  if (style === "B") {
    // Bar flight — horizontal bar sitting on chain
    const barY = baseY - bar_px;
    flightElem = (
      <g>
        <rect x={cx - W_px/2} y={barY} width={W_px} height={bar_px} fill={flightFill} stroke={flightStroke} strokeWidth="1.5" rx="2" />
        <rect x={cx + W_px/2} y={barY + 2} width={5} height={bar_px} fill={shadowFill} />
        <rect x={cx - W_px/2} y={barY + bar_px} width={W_px + 5} height={4} fill={shadowFill} />
      </g>
    );
    dimAnnotations = [
      // W arrow
      { type: "h", x1: cx - W_px/2, x2: cx + W_px/2, y: barY - 18, label: W_raw > 0 ? `W = ${toDisplay(W_raw, imperial)} ${unit}` : "W = ?" },
      // Bar size
      { type: "v", x: cx - W_px/2 - 22, y1: barY, y2: barY + bar_px, label: bar_raw > 0 ? `${toDisplay(bar_raw, imperial)}` : "?" },
    ];
  } else if (style === "U" || style === "CU") {
    const topY = baseY - H_px;
    const closed = style === "CU";
    flightElem = (
      <g>
        {/* Left wall */}
        <rect x={cx - W_px/2} y={topY} width={wallT} height={H_px} fill={flightFill} stroke={flightStroke} strokeWidth="1.5" />
        {/* Right wall */}
        <rect x={cx + W_px/2 - wallT} y={topY} width={wallT} height={H_px} fill={flightFill} stroke={flightStroke} strokeWidth="1.5" />
        {/* Bottom bar */}
        <rect x={cx - W_px/2} y={baseY - wallT} width={W_px} height={wallT} fill={flightFill} stroke={flightStroke} strokeWidth="1.5" />
        {/* Top cap if Closed U */}
        {closed && <rect x={cx - W_px/2} y={topY} width={W_px} height={wallT} fill={shadowFill} stroke={flightStroke} strokeWidth="1" />}
        {/* Shadow */}
        <rect x={cx + W_px/2} y={topY + 3} width={5} height={H_px} fill={shadowFill} />
      </g>
    );
    dimAnnotations = [
      { type: "h", x1: cx - W_px/2, x2: cx + W_px/2, y: topY - 18, label: W_raw > 0 ? `W = ${toDisplay(W_raw, imperial)} ${unit}` : "W = ?" },
      { type: "v", x: cx + W_px/2 + 22, y1: topY, y2: baseY, label: H_raw > 0 ? `H = ${toDisplay(H_raw, imperial)} ${unit}` : "H = ?" },
    ];
  } else if (style === "OO") {
    const topY = baseY - H_px;
    flightElem = (
      <g>
        {/* Left wall */}
        <rect x={cx - W_px/2} y={topY} width={wallT} height={H_px} fill={flightFill} stroke={flightStroke} strokeWidth="1.5" />
        {/* Right wall */}
        <rect x={cx + W_px/2 - wallT} y={topY} width={wallT} height={H_px} fill={flightFill} stroke={flightStroke} strokeWidth="1.5" />
        {/* Bottom bar */}
        <rect x={cx - W_px/2} y={baseY - wallT} width={W_px} height={wallT} fill={flightFill} stroke={flightStroke} strokeWidth="1.5" />
        {/* Top cap (OO is closed top too) */}
        <rect x={cx - W_px/2} y={topY} width={W_px} height={wallT} fill={shadowFill} stroke={flightStroke} strokeWidth="1" />
        {/* OO lips extending outward */}
        <rect x={cx - W_px/2 - K_px} y={baseY - wallT} width={K_px} height={wallT} fill={shadowFill} stroke={flightStroke} strokeWidth="1" />
        <rect x={cx + W_px/2} y={baseY - wallT} width={K_px} height={wallT} fill={shadowFill} stroke={flightStroke} strokeWidth="1" />
        {/* Shadow */}
        <rect x={cx + W_px/2 + K_px} y={topY + 3} width={5} height={H_px} fill={shadowFill} />
      </g>
    );
    dimAnnotations = [
      { type: "h", x1: cx - W_px/2 - K_px, x2: cx + W_px/2 + K_px, y: topY - 18, label: W_raw > 0 ? `W = ${toDisplay(W_raw, imperial)} ${unit}` : "W = ?" },
      { type: "v", x: cx + W_px/2 + K_px + 22, y1: topY, y2: baseY, label: H_raw > 0 ? `H = ${toDisplay(H_raw, imperial)} ${unit}` : "H = ?" },
      { type: "h", x1: cx + W_px/2, x2: cx + W_px/2 + K_px, y: baseY + 18, label: K_raw > 0 ? `K = ${toDisplay(K_raw, imperial)} ${unit}` : "K = ?" },
    ];
  } else {
    // Paddle / filler: solid flat plate
    const plateH = Math.max(H_px, 20);
    flightElem = (
      <g>
        <rect x={cx - W_px/2} y={baseY - plateH} width={W_px} height={plateH} fill={flightFill} stroke={flightStroke} strokeWidth="1.5" />
        <rect x={cx + W_px/2} y={baseY - plateH + 3} width={5} height={plateH} fill={shadowFill} />
      </g>
    );
    dimAnnotations = [
      { type: "h", x1: cx - W_px/2, x2: cx + W_px/2, y: baseY - plateH - 18, label: W_raw > 0 ? `W = ${toDisplay(W_raw, imperial)} ${unit}` : "W = ?" },
      { type: "v", x: cx - W_px/2 - 22, y1: baseY - plateH, y2: baseY, label: H_raw > 0 ? `H = ${toDisplay(H_raw, imperial)} ${unit}` : "H = ?" },
    ];
  }

  // UHMW overlay (front face of flight)
  const uhmwElem = hasUHMW && uhmwT_px > 0 ? (() => {
    if (style === "B") {
      return <rect x={cx - W_px/2} y={baseY - bar_px - uhmwT_px} width={W_px} height={uhmwT_px} fill={uhmwFill} stroke="#4a80cc" strokeWidth="1" strokeDasharray="4,2" />;
    }
    const topY = baseY - H_px;
    // Interior face liner
    return (
      <g>
        <rect x={cx - W_px/2 + wallT} y={topY + wallT} width={uhmwT_px} height={H_px - wallT*2} fill={uhmwFill} stroke="#4a80cc" strokeWidth="0.8" strokeDasharray="3,2" />
        <rect x={cx + W_px/2 - wallT - uhmwT_px} y={topY + wallT} width={uhmwT_px} height={H_px - wallT*2} fill={uhmwFill} stroke="#4a80cc" strokeWidth="0.8" strokeDasharray="3,2" />
      </g>
    );
  })() : null;

  // Backing plate
  const bpElem = hasBacking ? (
    <g>
      <rect x={cx - W_px/2 + 6} y={baseY + 6} width={W_px - 12} height={bpT_px + 4} fill="#8a9ab8" stroke={C.navyMid} strokeWidth="1" />
      <text x={cx} y={baseY + 14 + bpT_px} textAnchor="middle" fontSize="9" fill={C.muted}>Backing Plate</text>
    </g>
  ) : null;

  // ── Arrow annotation helper ──
  const arrowHead = (id, dir) => (
    <marker key={id} id={id} markerWidth="6" markerHeight="6" refX={dir==="end"?5:1} refY="3" orient="auto">
      <path d={dir==="end"?"M0,1 L5,3 L0,5 Z":"M5,1 L0,3 L5,5 Z"} fill="#555" />
    </marker>
  );

  const renderAnnotation = (ann, idx) => {
    const aId = `a${idx}s`; const bId = `a${idx}e`;
    if (ann.type === "h") {
      return (
        <g key={idx}>
          <defs>{arrowHead(aId,"start")}{arrowHead(bId,"end")}</defs>
          <line x1={ann.x1} y1={ann.y} x2={ann.x2} y2={ann.y} stroke="#555" strokeWidth="1" markerStart={`url(#${aId})`} markerEnd={`url(#${bId})`} />
          <line x1={ann.x1} y1={ann.y - 6} x2={ann.x1} y2={ann.y + 6} stroke="#555" strokeWidth="0.8" />
          <line x1={ann.x2} y1={ann.y - 6} x2={ann.x2} y2={ann.y + 6} stroke="#555" strokeWidth="0.8" />
          <rect x={(ann.x1+ann.x2)/2 - 32} y={ann.y - 18} width={64} height={14} fill="white" rx="3" />
          <text x={(ann.x1+ann.x2)/2} y={ann.y - 7} textAnchor="middle" fontSize="10" fontWeight="600" fill={C.navyMid}>{ann.label}</text>
        </g>
      );
    } else {
      return (
        <g key={idx}>
          <defs>{arrowHead(aId,"start")}{arrowHead(bId,"end")}</defs>
          <line x1={ann.x} y1={ann.y1} x2={ann.x} y2={ann.y2} stroke="#555" strokeWidth="1" markerStart={`url(#${aId})`} markerEnd={`url(#${bId})`} />
          <line x1={ann.x - 6} y1={ann.y1} x2={ann.x + 6} y2={ann.y1} stroke="#555" strokeWidth="0.8" />
          <line x1={ann.x - 6} y1={ann.y2} x2={ann.x + 6} y2={ann.y2} stroke="#555" strokeWidth="0.8" />
          <rect x={ann.x - 28} y={(ann.y1+ann.y2)/2 - 8} width={56} height={14} fill="white" rx="3" />
          <text x={ann.x} y={(ann.y1+ann.y2)/2 + 4} textAnchor="middle" fontSize="10" fontWeight="600" fill={C.navyMid}>{ann.label}</text>
        </g>
      );
    }
  };

  // Sequence annotation
  const seqLabel = seq > 0 ? `1 flight every ${seq} links` : "";

  return (
    <div style={{ background: "#f8fafc", borderRadius: 12, border: `1px solid ${C.border}`, padding: "8px", marginBottom: 16 }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: 1, marginBottom: 4, paddingLeft: 4 }}>
        Live Preview — {att?.flightName || "Flight"}{seqLabel ? ` · ${seqLabel}` : ""}
      </div>
      <svg viewBox={`0 0 ${VW} ${VH}`} width="100%" style={{ display: "block" }}>
        {flightElem}
        {uhmwElem}
        {bpElem}
        {dimAnnotations.map((a, i) => renderAnnotation(a, i))}
        {/* UHMW label */}
        {hasUHMW && <text x={cx} y={VH - 10} textAnchor="middle" fontSize="9" fill="#4a80cc" fontWeight="600">UHMW liner shown in blue</text>}
      </svg>
    </div>
  );
}

// ── SEQUENCE SCHEMATIC (review page — multi-attachment) ───────────────────────
function SequenceSchematic({ chain, attachments }) {
  const att = attachments[0];
  const seq = parseInt(att?.sequence) || 4;
  const style = att?.flightStyle;
  const fw = parseFloat(att?.dims?.W) || 300;
  const fh = parseFloat(att?.dims?.H) || 120;
  const barSize = parseFloat(att?.dims?.barSize) || 16;
  const hasUHMW = att?.uhmw;
  const uhmwT = parseFloat(att?.uhmwDims?.thickness) || 12;
  const hasBacking = att?.hasBackingPlate;
  const backingSeq = parseInt(att?.backingPlateSequence) || 2;

  const W = 520, H = 180;
  const numLinks = Math.max(seq * 2 + 1, 5);
  const linkW = Math.min(54, (W - 60) / numLinks);
  const startX = 30;
  const chainY = H - 55;
  const links = Array.from({ length: numLinks }, (_, i) => i);

  const drawFlight = (i) => {
    const cx2 = startX + i * linkW + linkW / 2;
    const baseY2 = chainY - 10;
    const scale = Math.min(fw / 300, 1.0);
    const flightW2 = Math.min(fw * scale * 0.16, 72);
    const flightH2 = Math.min(fh * scale * 0.5, 58);
    const bar2 = Math.max(barSize * 0.16, 4);
    const t2 = Math.max(bar2, 5);
    let el = null;
    if (style === "B") {
      el = <rect x={cx2 - flightW2/2} y={baseY2 - bar2} width={flightW2} height={bar2} fill="#5a7aaa" stroke={C.navyMid} strokeWidth="1" />;
    } else if (style === "U" || style === "CU") {
      el = <g>
        <rect x={cx2 - flightW2/2} y={baseY2 - flightH2} width={t2} height={flightH2} fill="#5a7aaa" stroke={C.navyMid} strokeWidth="1" />
        <rect x={cx2 + flightW2/2 - t2} y={baseY2 - flightH2} width={t2} height={flightH2} fill="#5a7aaa" stroke={C.navyMid} strokeWidth="1" />
        <rect x={cx2 - flightW2/2} y={baseY2 - t2} width={flightW2} height={t2} fill="#5a7aaa" stroke={C.navyMid} strokeWidth="1" />
        {style === "CU" && <rect x={cx2 - flightW2/2} y={baseY2 - flightH2} width={flightW2} height={t2} fill="#3a5a8a" stroke={C.navyMid} strokeWidth="1" />}
      </g>;
    } else if (style === "OO") {
      const kH2 = flightH2 * 0.28;
      el = <g>
        <rect x={cx2 - flightW2/2} y={baseY2 - flightH2} width={t2} height={flightH2} fill="#5a7aaa" stroke={C.navyMid} strokeWidth="1" />
        <rect x={cx2 + flightW2/2 - t2} y={baseY2 - flightH2} width={t2} height={flightH2} fill="#5a7aaa" stroke={C.navyMid} strokeWidth="1" />
        <rect x={cx2 - flightW2/2} y={baseY2 - t2} width={flightW2} height={t2} fill="#5a7aaa" stroke={C.navyMid} strokeWidth="1" />
        <rect x={cx2 - flightW2/2} y={baseY2 - flightH2} width={flightW2} height={t2} fill="#3a5a8a" stroke={C.navyMid} strokeWidth="1" />
        <rect x={cx2 - flightW2/2 - kH2} y={baseY2 - t2} width={kH2} height={t2} fill="#3a5a8a" />
        <rect x={cx2 + flightW2/2} y={baseY2 - t2} width={kH2} height={t2} fill="#3a5a8a" />
      </g>;
    } else {
      el = <rect x={cx2 - flightW2/2} y={baseY2 - Math.max(flightH2,12)} width={flightW2} height={Math.max(flightH2,12)} fill="#5a7aaa" stroke={C.navyMid} strokeWidth="1" />;
    }
    const uhmwEl = hasUHMW ? <rect x={cx2 - flightW2/2} y={baseY2 - bar2 - uhmwT * 0.35} width={flightW2} height={uhmwT * 0.35} fill="rgba(180,210,255,0.7)" stroke="#4a80cc" strokeWidth="0.7" strokeDasharray="3,2" /> : null;
    const bpEl = hasBacking && (Math.floor(i / backingSeq) * backingSeq === i) ? <rect x={cx2 - flightW2/2 + 3} y={chainY + 10} width={flightW2 - 6} height={5} fill="#8a9ab8" stroke={C.navyMid} strokeWidth="0.7" /> : null;
    return <g key={`f${i}`}>{el}{uhmwEl}{bpEl}</g>;
  };

  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: C.navyMid, marginBottom: 6 }}>Chain Assembly — Sequence View</div>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ background: "#f8fafc", borderRadius: 10, border: `1px solid ${C.border}` }}>
        <defs>
          <marker id="sa" markerWidth="5" markerHeight="5" refX="4" refY="2.5" orient="auto"><path d="M0,0.5 L4,2.5 L0,4.5 Z" fill="#666"/></marker>
          <marker id="sb" markerWidth="5" markerHeight="5" refX="1" refY="2.5" orient="auto"><path d="M4,0.5 L0,2.5 L4,4.5 Z" fill="#666"/></marker>
        </defs>
        {links.filter(i => (i + 1) % seq === 0).map(i => drawFlight(i))}
        {/* Pitch arrow */}
        <line x1={startX} y1={chainY + 32} x2={startX + linkW} y2={chainY + 32} stroke="#666" strokeWidth="0.8" markerEnd="url(#sa)" markerStart="url(#sb)" />
        <text x={startX + linkW/2} y={chainY + 43} textAnchor="middle" fontSize="8" fill="#666">P={chain?.P_mm}mm</text>
        {/* Spacing arrow between flights */}
        {(() => {
          const f1 = links.find(i => (i+1) % seq === 0);
          const f2 = links.find(i => (i+1) % seq === 0 && i > f1);
          if (f1 == null || f2 == null) return null;
          const x1 = startX + f1 * linkW + linkW/2, x2 = startX + f2 * linkW + linkW/2;
          return <g>
            <line x1={x1} y1={chainY - 65} x2={x2} y2={chainY - 65} stroke={C.navyMid} strokeWidth="0.8" markerEnd="url(#sa)" markerStart="url(#sb)" />
            <text x={(x1+x2)/2} y={chainY - 70} textAnchor="middle" fontSize="8" fill={C.navyMid}>Every {seq} links</text>
          </g>;
        })()}
      </svg>
    </div>
  );
}

// ── CHAIN CONFIGURATOR (WIZARD) ──────────────────────────────────────────────
const STEEL_TYPES = ["Mild Steel (A36/S235)", "Carbon Steel (1045)", "Stainless Steel 304", "Stainless Steel 316", "Hardox 400", "AR400 Abrasion Resistant"];
const PIN_OPTIONS = [
  { name: "Forged Head Pin + Collar and Roll Pin", desc: "Standard — maximum strength, most common heavy-duty config." },
  { name: "Forged Head Pin + One Clamp",           desc: "Easier to service — ideal for frequent disassembly." },
  { name: "Plain Pin + Two Clamps",                desc: "Removal from either side — preferred in confined spaces." },
];
function emptyAttachment(idx) {
  return { id: idx, flightName: "", flightStyle: "", sequence: "4", dims: { W:"", H:"", G:"", K:"", barSize:"", barShape:"Round", steelType:"" }, hasBackingPlate: false, backingPlateThickness:"", backingPlateSequence:"2", uhmw: false, uhmwDims: { thickness:"", overallW:"", overallH:"", type:"Regular UHMW", bottomStyle:"Flush to bottom", overlap:"", boltDiameter:"", nutStyle:"", boltPlacement:"" } };
}

function FieldRow({ label, note, children }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: C.muted, marginBottom: 4 }}>{label}{note && <span style={{ fontWeight: 400, marginLeft: 6, color: "#94a3b8" }}>— {note}</span>}</div>
      {children}
    </div>
  );
}
function TextInput({ value, onChange, placeholder, unit }) {
  // Local string state so user can type freely without conversion interrupting
  const [local, setLocal] = useState(value ?? "");
  // Re-sync when parent pushes a new value (e.g. unit toggle recalculates)
  useEffect(() => { setLocal(value ?? ""); }, [value]);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <input
        type="text"
        inputMode="decimal"
        value={local}
        placeholder={placeholder || ""}
        onChange={e => setLocal(e.target.value)}
        onBlur={e => { const v = e.target.value; if (v !== value) onChange(v); }}
        style={{ flex: 1, border: `1px solid ${C.border}`, borderRadius: 8, padding: "9px 12px", fontSize: 13, outline: "none", boxSizing: "border-box" }}
      />
      {unit && <span style={{ fontSize: 12, color: C.muted, minWidth: 24 }}>{unit}</span>}
    </div>
  );
}
function SelectInput({ value, onChange, options }) {
  return (
    <select value={value} onChange={e => onChange(e.target.value)}
      style={{ width: "100%", border: `1px solid ${C.border}`, borderRadius: 8, padding: "9px 12px", fontSize: 13, outline: "none", background: "white" }}>
      <option value="">Select...</option>
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  );
}

function ChainConfigurator({ chain, onComplete, onClose }) {
  // Steps: 0=Flights? 1=FlightType 2=Dimensions 3=More? 4=Pins 5=Footage 6=Review
  const [step, setStep] = useState(0);
  const [footage, setFootage] = useState("");
  const [footageUnit, setFootageUnit] = useState("feet");
  const [hasFlights, setHasFlights] = useState(null);
  const [attachments, setAttachments] = useState([emptyAttachment(0)]);
  const [activeAtt, setActiveAtt] = useState(0);
  const [pinStyle, setPinStyle] = useState("");
  const [pinMaterial, setPinMaterial] = useState("");
  const [imperial, setImperial] = useState(false);

  const flights = tryParse(chain.flight_options);
  const att = attachments[activeAtt] || emptyAttachment(0);

  const stepLabels = ["Flights?", "Flight Type", "Dimensions", "More?", "Pins", "Footage", "Review"];
  const unit = imperial ? "in" : "mm";

  function updateAtt(field, val) { setAttachments(prev => prev.map((a,i) => i===activeAtt ? {...a,[field]:val} : a)); }
  function updateDim(field, val) { setAttachments(prev => prev.map((a,i) => i===activeAtt ? {...a,dims:{...a.dims,[field]:val}} : a)); }
  function updateUhmw(field, val) { setAttachments(prev => prev.map((a,i) => i===activeAtt ? {...a,uhmwDims:{...a.uhmwDims,[field]:val}} : a)); }

  const ConfigHeader = () => (
    <div style={{ background: `linear-gradient(135deg, ${C.navy}, ${C.navyMid})`, padding: "14px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <div>
        <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 11, marginBottom: 2 }}>Configuring: {chain.chain_link}</div>
        <div style={{ color: "white", fontSize: 13, fontWeight: 700 }}>Step {step+1} of 7 — {stepLabels[step]||""}</div>
      </div>
      <button onClick={onClose} style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.3)", color: "white", cursor: "pointer", borderRadius: 8, padding: "6px 14px", fontSize: 13, fontWeight: 700 }}>✕ Exit</button>
    </div>
  );

  // Step 0: Flights?
  if (step === 0) return (
    <div>
      <ConfigHeader />
      <div style={{ padding: 24 }}>
        <div style={{ fontSize: 16, fontWeight: 800, color: C.navyMid, marginBottom: 4 }}>Does this chain need flights / attachments?</div>
        <div style={{ color: C.muted, fontSize: 12, marginBottom: 20 }}>Flights are bar, U-type, or OO-type steel attachments welded or bolted to links to push or carry material.</div>
        <div style={{ display: "flex", gap: 12 }}>
          {[["Yes", true], ["No — Chain Links Only", false]].map(([label, val]) => (
            <button key={label} onClick={() => { setHasFlights(val); setStep(val ? 1 : 4); }}
              style={{ flex: 1, background: C.navyMid, color: "white", border: "none", borderRadius: 10, padding: "18px", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  // Step 1: Flight type — AUTO-ADVANCE on selection
  if (step === 1) return (
    <div>
      <ConfigHeader />
      <div style={{ padding: 24 }}>
        <div style={{ fontSize: 16, fontWeight: 800, color: C.navyMid, marginBottom: 4 }}>
          {attachments.length > 1 ? `Attachment ${activeAtt+1} — ` : ""}Flight / Attachment Type
        </div>
        <div style={{ color: C.muted, fontSize: 12, marginBottom: 16 }}>Tap a profile to select — you'll move straight to dimensions.</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {flights.map(f => (
            <button key={f.name}
              onClick={() => { updateAtt("flightName", f.name); updateAtt("flightStyle", f.style); setTimeout(() => setStep(2), 120); }}
              style={{ background: att.flightName === f.name ? C.navyMid : C.card, border: `2px solid ${att.flightName === f.name ? C.navyMid : C.border}`,
                borderRadius: 10, padding: "12px 16px", cursor: "pointer", textAlign: "left", display: "flex", alignItems: "center", gap: 12, transition: "all 0.15s" }}>
              {IMG[f.name] && <img src={IMG[f.name]} alt={f.name} style={{ width: 48, height: 34, objectFit: "cover", borderRadius: 6, border: `1px solid ${C.border}`, flexShrink: 0 }} />}
              <span style={{ fontSize: 13, fontWeight: 600, color: att.flightName === f.name ? "white" : C.text }}>{f.name}</span>
            </button>
          ))}
        </div>
        <button onClick={() => setStep(0)} style={{ background: "#f1f5f9", border: `1px solid ${C.border}`, borderRadius: 8, padding: "8px 16px", cursor: "pointer", fontSize: 12, marginTop: 16 }}>← Back</button>
      </div>
    </div>
  );

  // Step 2: Dimensions — live SVG schematic
  if (step === 2) return (
    <div>
      <ConfigHeader />
      <div style={{ padding: "16px 24px 24px", maxHeight: "75vh", overflowY: "auto" }}>
        <div style={{ fontSize: 15, fontWeight: 800, color: C.navyMid, marginBottom: 12 }}>{att.flightName} — Dimensions</div>

        {/* Live schematic */}
        <FlightSchematic att={att} imperial={imperial} />

        {/* Metric / Imperial toggle */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16, background: "#f0f7ff", borderRadius: 8, padding: "8px 14px" }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: C.muted }}>Units:</span>
          {[["mm", false], ["inches", true]].map(([label, val]) => (
            <button key={label} onClick={() => setImperial(val)}
              style={{ background: imperial === val ? C.navyMid : "white", color: imperial === val ? "white" : C.muted,
                border: `1px solid ${imperial === val ? C.navyMid : C.border}`, borderRadius: 6, padding: "4px 14px", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
              {label}
            </button>
          ))}
        </div>

        {/* Width — all styles */}
        <FieldRow label={`Overall Flight Width (W)`} note="tip to tip across chain">
          <TextInput value={toDisplay(att.dims.W, imperial)} onChange={v => updateDim("W", toMM(v, imperial))} unit={unit} />
        </FieldRow>

        {/* Height — U, CU, OO, Paddle */}
        {(att.flightStyle === "U" || att.flightStyle === "CU" || att.flightStyle === "OO" || att.flightStyle === "P") && (
          <FieldRow label="Flight Height (H)">
            <TextInput value={toDisplay(att.dims.H, imperial)} onChange={v => updateDim("H", toMM(v, imperial))} unit={unit} />
          </FieldRow>
        )}

        {/* Gap — Closed U */}
        {att.flightStyle === "CU" && (
          <FieldRow label="Internal Gap (G)" note="opening width inside closed U">
            <TextInput value={toDisplay(att.dims.G, imperial)} onChange={v => updateDim("G", toMM(v, imperial))} unit={unit} />
          </FieldRow>
        )}

        {/* Lip — OO */}
        {att.flightStyle === "OO" && (
          <FieldRow label="Lip Extension (K)" note="how far OO lip extends beyond side wall">
            <TextInput value={toDisplay(att.dims.K, imperial)} onChange={v => updateDim("K", toMM(v, imperial))} unit={unit} />
          </FieldRow>
        )}

        {/* Bar size — bar flights */}
        {att.flightStyle === "B" && (
          <FieldRow label="Bar Size" note="diameter (round) or side (square/flat)">
            <div style={{ display: "flex", gap: 8 }}>
              <TextInput value={toDisplay(att.dims.barSize, imperial)} onChange={v => updateDim("barSize", toMM(v, imperial))} unit={unit} />
              <SelectInput value={att.dims.barShape} onChange={v => updateDim("barShape", v)} options={["Round", "Square", "Flat"]} />
            </div>
          </FieldRow>
        )}

        <FieldRow label="Steel Type">
          <SelectInput value={att.dims.steelType} onChange={v => updateDim("steelType", v)} options={STEEL_TYPES} />
        </FieldRow>

        <FieldRow label="Attachment Sequence — every N links" note="e.g. 4 = one flight per 4 links">
          <TextInput value={att.sequence} onChange={v => updateAtt("sequence", v)} placeholder="4" unit="links" />
        </FieldRow>

        <FieldRow label="Backing Plate?">
          <div style={{ display: "flex", gap: 10 }}>
            {[["Yes", true], ["No", false]].map(([label, val]) => (
              <button key={label} onClick={() => updateAtt("hasBackingPlate", val)}
                style={{ flex: 1, background: att.hasBackingPlate === val ? C.navyMid : "#f1f5f9", color: att.hasBackingPlate === val ? "white" : C.text,
                  border: `2px solid ${att.hasBackingPlate === val ? C.navyMid : C.border}`, borderRadius: 8, padding: "8px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                {label}
              </button>
            ))}
          </div>
        </FieldRow>
        {att.hasBackingPlate && (
          <>
            <FieldRow label="Backing Plate Thickness">
              <TextInput value={toDisplay(att.backingPlateThickness, imperial)} onChange={v => updateAtt("backingPlateThickness", toMM(v, imperial))} unit={unit} />
            </FieldRow>
            <FieldRow label="Backing Plate Sequence — every N attachments">
              <TextInput value={att.backingPlateSequence} onChange={v => updateAtt("backingPlateSequence", v)} placeholder="2" unit="attachments" />
            </FieldRow>
          </>
        )}

        <FieldRow label="UHMW Wear Liner?">
          <div style={{ display: "flex", gap: 10 }}>
            {[["Yes", true], ["No", false]].map(([label, val]) => (
              <button key={label} onClick={() => updateAtt("uhmw", val)}
                style={{ flex: 1, background: att.uhmw === val ? C.navyMid : "#f1f5f9", color: att.uhmw === val ? "white" : C.text,
                  border: `2px solid ${att.uhmw === val ? C.navyMid : C.border}`, borderRadius: 8, padding: "8px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                {label}
              </button>
            ))}
          </div>
        </FieldRow>
        {att.uhmw && (
          <div style={{ background: "#f0f7ff", borderRadius: 10, padding: "14px 16px", marginTop: 4 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: C.navyMid, marginBottom: 12 }}>UHMW Details</div>
            <FieldRow label="Thickness"><TextInput value={toDisplay(att.uhmwDims.thickness, imperial)} onChange={v => updateUhmw("thickness", toMM(v, imperial))} unit={unit} /></FieldRow>
            <FieldRow label="Overall Width"><TextInput value={toDisplay(att.uhmwDims.overallW, imperial)} onChange={v => updateUhmw("overallW", toMM(v, imperial))} unit={unit} /></FieldRow>
            <FieldRow label="Overall Height"><TextInput value={toDisplay(att.uhmwDims.overallH, imperial)} onChange={v => updateUhmw("overallH", toMM(v, imperial))} unit={unit} /></FieldRow>
            <FieldRow label="UHMW Type"><SelectInput value={att.uhmwDims.type} onChange={v => updateUhmw("type", v)} options={["Regular UHMW", "High Heat UHMW"]} /></FieldRow>
            <FieldRow label="Bottom Style"><SelectInput value={att.uhmwDims.bottomStyle} onChange={v => updateUhmw("bottomStyle", v)} options={["Flush to bottom", "Overlap"]} /></FieldRow>
            {att.uhmwDims.bottomStyle === "Overlap" && (
              <FieldRow label="Overlap Amount"><TextInput value={toDisplay(att.uhmwDims.overlap, imperial)} onChange={v => updateUhmw("overlap", toMM(v, imperial))} unit={unit} /></FieldRow>
            )}
            <FieldRow label="Bolt Diameter"><TextInput value={toDisplay(att.uhmwDims.boltDiameter, imperial)} onChange={v => updateUhmw("boltDiameter", toMM(v, imperial))} unit={unit} /></FieldRow>
            <FieldRow label="Nut Style"><SelectInput value={att.uhmwDims.nutStyle} onChange={v => updateUhmw("nutStyle", v)} options={["Nylock", "Standard Hex", "Wing Nut"]} /></FieldRow>
            <FieldRow label="Bolt Placement"><SelectInput value={att.uhmwDims.boltPlacement} onChange={v => updateUhmw("boltPlacement", v)} options={["Top", "Side", "Bottom"]} /></FieldRow>
          </div>
        )}

        <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
          <button onClick={() => setStep(1)} style={{ background: "#f1f5f9", border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 20px", cursor: "pointer", fontSize: 13 }}>← Back</button>
          <button onClick={() => setStep(3)}
            style={{ flex: 1, background: C.navyMid, color: "white", border: "none", borderRadius: 8, padding: "10px 24px", cursor: "pointer", fontSize: 13, fontWeight: 700 }}>
            Next →
          </button>
        </div>
      </div>
    </div>
  );

  // Step 3: More attachments?
  if (step === 3) return (
    <div>
      <ConfigHeader />
      <div style={{ padding: 24 }}>
        <div style={{ fontSize: 16, fontWeight: 800, color: C.navyMid, marginBottom: 4 }}>Add Another Attachment Pattern?</div>
        <div style={{ color: C.muted, fontSize: 12, marginBottom: 20 }}>Some conveyors use two different flight patterns on the same chain.</div>
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: C.muted, marginBottom: 10 }}>Current attachments:</div>
          {attachments.map((a, i) => (
            <div key={i} style={{ background: "#f8fafc", borderRadius: 8, padding: "8px 12px", marginBottom: 8, border: `1px solid ${C.border}`, fontSize: 13, color: C.text }}>
              <strong>Attachment {i+1}:</strong> {a.flightName || "Not set"} — every {a.sequence||"?"} links
            </div>
          ))}
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={() => {
            const nextIdx = attachments.length;
            setAttachments(prev => [...prev, emptyAttachment(nextIdx)]);
            setActiveAtt(nextIdx);
            setStep(1);
          }} style={{ flex: 1, background: "#f0f7ff", border: `2px solid ${C.navyMid}`, color: C.navyMid, borderRadius: 10, padding: 14, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
            + Add Another
          </button>
          <button onClick={() => setStep(4)}
            style={{ flex: 1, background: C.navyMid, color: "white", border: "none", borderRadius: 10, padding: 14, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
            Done →
          </button>
        </div>
        <button onClick={() => setStep(2)} style={{ background: "#f1f5f9", border: `1px solid ${C.border}`, borderRadius: 8, padding: "8px 16px", cursor: "pointer", fontSize: 12, marginTop: 12 }}>← Back</button>
      </div>
    </div>
  );

  // Step 4: Pin style & material
  if (step === 4) return (
    <div>
      <ConfigHeader />
      <div style={{ padding: 24 }}>
        <div style={{ fontSize: 16, fontWeight: 800, color: C.navyMid, marginBottom: 4 }}>Pin Style & Material</div>
        <div style={{ color: C.muted, fontSize: 12, marginBottom: 16 }}>Select how this chain will be assembled.</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
          {PIN_OPTIONS.map(p => {
            const pos = PIN_IMG_POSITION[p.name] || "center";
            return (
              <button key={p.name} onClick={() => setPinStyle(p.name)}
                style={{ background: pinStyle === p.name ? C.navyMid : C.card, border: `2px solid ${pinStyle === p.name ? C.navyMid : C.border}`,
                  borderRadius: 10, padding: 0, cursor: "pointer", overflow: "hidden", display: "flex", alignItems: "center" }}>
                <div style={{ width: 72, height: 52, overflow: "hidden", flexShrink: 0, position: "relative" }}>
                  <img src={IMG.pin_all} alt={p.name}
                    style={{ width: "100%", height: 156, objectFit: "cover", objectPosition: `center ${pos}`, position: "absolute",
                      top: pos==="top"?0:pos==="bottom"?"auto":"50%", transform: pos==="center"?"translateY(-50%)":"none", bottom: pos==="bottom"?0:"auto" }} />
                </div>
                <span style={{ fontSize: 13, fontWeight: 600, color: pinStyle === p.name ? "white" : C.text, padding: "0 16px" }}>{p.name}</span>
              </button>
            );
          })}
        </div>
        {pinStyle && (
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: C.muted, marginBottom: 8 }}>Pin Material</div>
            <div style={{ display: "flex", gap: 10 }}>
              {["Alloy Steel", "Stainless Steel"].map(m => (
                <button key={m} onClick={() => setPinMaterial(m)}
                  style={{ flex: 1, background: pinMaterial === m ? C.green : "#f1f5f9", color: pinMaterial === m ? "white" : C.text,
                    border: `2px solid ${pinMaterial === m ? C.green : C.border}`, borderRadius: 8, padding: 10, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                  {m}
                </button>
              ))}
            </div>
          </div>
        )}
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={() => setStep(hasFlights ? 3 : 0)} style={{ background: "#f1f5f9", border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 20px", cursor: "pointer", fontSize: 13 }}>← Back</button>
          <button onClick={() => { if (pinStyle && pinMaterial) setStep(5); }} disabled={!pinStyle || !pinMaterial}
            style={{ flex: 1, background: pinStyle && pinMaterial ? C.navyMid : "#e5e7eb", color: pinStyle && pinMaterial ? "white" : C.muted, border: "none", borderRadius: 8, padding: "10px 24px", cursor: pinStyle && pinMaterial ? "pointer" : "default", fontSize: 13, fontWeight: 700 }}>
            Next →
          </button>
        </div>
      </div>
    </div>
  );

  // Step 5: Footage (last question before review)
  if (step === 5) return (
    <div>
      <ConfigHeader />
      <div style={{ padding: 24 }}>
        <div style={{ fontSize: 16, fontWeight: 800, color: C.navyMid, marginBottom: 4 }}>How much chain do you need?</div>
        <div style={{ color: C.muted, fontSize: 12, marginBottom: 20 }}>Enter the total length required.</div>
        <FieldRow label="Unit">
          <div style={{ display: "flex", gap: 10 }}>
            {["feet", "metres", "links"].map(u => (
              <button key={u} onClick={() => setFootageUnit(u)}
                style={{ flex: 1, background: footageUnit === u ? C.navyMid : "#f1f5f9", color: footageUnit === u ? "white" : C.text,
                  border: `2px solid ${footageUnit === u ? C.navyMid : C.border}`, borderRadius: 8, padding: "10px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                {u}
              </button>
            ))}
          </div>
        </FieldRow>
        <FieldRow label={`Quantity (${footageUnit})`}>
          <TextInput value={footage} onChange={setFootage} placeholder={footageUnit === "links" ? "e.g. 50" : "e.g. 100"} />
        </FieldRow>
        <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
          <button onClick={() => setStep(4)} style={{ background: "#f1f5f9", border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 20px", cursor: "pointer", fontSize: 13 }}>← Back</button>
          <button onClick={() => { if (footage) setStep(6); }} disabled={!footage}
            style={{ flex: 1, background: footage ? C.navyMid : "#e5e7eb", color: footage ? "white" : C.muted, border: "none", borderRadius: 8, padding: "12px 28px", cursor: footage ? "pointer" : "default", fontSize: 13, fontWeight: 700 }}>
            Review →
          </button>
        </div>
      </div>
    </div>
  );

  // Step 6: Review
  if (step === 6) {
    const chainDesc = `4B Drop Forged Chain ${chain.chain_link} (${chain.link_type} Link, P=${chain.P_mm}mm, ${chain.min_breaking_load_kn}kN) — ${footage} ${footageUnit}`;
    const flightDescs = hasFlights ? attachments.map((a, i) => {
      let d = `Attachment ${i+1}: ${a.flightName} every ${a.sequence} links`;
      const dp = [];
      if (a.dims.W) dp.push(`W=${a.dims.W}mm`);
      if (a.dims.H) dp.push(`H=${a.dims.H}mm`);
      if (a.dims.barSize) dp.push(`Bar ${a.dims.barSize}mm ${a.dims.barShape||""}`);
      if (a.dims.steelType) dp.push(a.dims.steelType);
      if (dp.length) d += ` [${dp.join(", ")}]`;
      if (a.hasBackingPlate) d += ` | BP T=${a.backingPlateThickness}mm every ${a.backingPlateSequence} att.`;
      if (a.uhmw) d += ` | UHMW T=${a.uhmwDims.thickness}mm ${a.uhmwDims.type}`;
      return d;
    }).join(" | ") : "No flights — chain links only";
    const fullDesc = [chainDesc, flightDescs, `Pin: ${pinStyle} — ${pinMaterial}`].join(" · ");
    return (
      <div>
        <ConfigHeader />
        <div style={{ padding: 24 }}>
          <div style={{ fontSize: 16, fontWeight: 800, color: C.navyMid, marginBottom: 16 }}>Configuration Summary</div>
          {hasFlights && <SequenceSchematic chain={chain} attachments={attachments} />}
          <div style={{ background: "#f8fafc", borderRadius: 10, border: `1px solid ${C.border}`, padding: "16px 18px", marginTop: 12 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, marginBottom: 8, textTransform: "uppercase" }}>RFQ Line Item</div>
            <div style={{ fontSize: 12, color: C.text, lineHeight: 1.7, fontFamily: "monospace", background: "#fff", borderRadius: 6, padding: "10px 14px", border: `1px solid ${C.border}` }}>{fullDesc}</div>
          </div>
          <div style={{ marginTop: 16, display: "flex", gap: 10 }}>
            <button onClick={() => setStep(5)} style={{ background: "#f1f5f9", border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 20px", cursor: "pointer", fontSize: 13 }}>← Back</button>
            <button onClick={() => onComplete({ description: fullDesc, chain, footage, footageUnit, attachments: hasFlights ? attachments : [], pinStyle, pinMaterial })}
              style={{ flex: 1, background: C.green, color: "#fff", border: "none", borderRadius: 8, padding: "11px 22px", cursor: "pointer", fontSize: 13, fontWeight: 700, letterSpacing: "0.02em" }}>
              Add to RFQ
            </button>
          </div>
        </div>
      </div>
    );
  }
  return null;
}

function ChainModal({ chain, variant, onClose, onAddRFQ }) {
  const [tab, setTab] = useState("specs");
  // If Bolt N Go variant selected, open BoltNGo directly; else open configurator
  const [showConfigurator, setShowConfigurator] = useState(variant !== "bng");
  const [showBoltNGo, setShowBoltNGo] = useState(variant === "bng");
  const [rfqAdded, setRfqAdded] = useState(false);
  const [selectedSprocket, setSelectedSprocket] = useState(null);
  const [selectedPin, setSelectedPin] = useState(null);

  const sprockets = tryParse(chain.sprocket_data);
  const trailers = tryParse(chain.trailer_data);

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", zIndex: 9000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ background: "white", borderRadius: 16, width: "100%", maxWidth: 720, width: "calc(100vw - 24px)", maxHeight: "92vh", overflowY: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>

        {showConfigurator ? (
          <ChainConfigurator chain={chain}
            onComplete={(item) => { onAddRFQ(item); setShowConfigurator(false); }}
            onClose={() => setShowConfigurator(false)} />
        ) : showBoltNGo ? (
          <BoltNGoModal chain={chain} onClose={() => setShowBoltNGo(false)} onAddRFQ={(item) => { onAddRFQ(item); setShowBoltNGo(false); }} />
        ) : (
          <>
            {/* Header */}
            <div style={{ background: `linear-gradient(135deg, ${C.navy}, ${C.navyMid})`, padding: "20px 24px", borderRadius: "16px 16px 0 0", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div style={{ color: C.gold, fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", marginBottom: 4 }}>4B Drop Forged Chain</div>
                <div style={{ color: "white", fontSize: 22, fontWeight: 900 }}>{chain.chain_link}</div>
                <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 12, marginTop: 2 }}>{chain.link_type} Link · P = {chain.P_mm} mm</div>
              </div>
              <button onClick={onClose} style={{ background: "rgba(255,255,255,0.1)", border: "none", color: "white", cursor: "pointer", borderRadius: 8, padding: "6px 12px", fontSize: 13 }}>✕ Close</button>
            </div>

            {/* Image + badges + actions */}
            <div style={{ display: "flex", gap: 20, padding: "20px 24px 0", alignItems: "flex-start" }}>
              <img src={getLinkImg(chain.link_type)} alt={chain.link_type}
                style={{ width: 130, height: 130, objectFit: "cover", borderRadius: 10, border: `1px solid ${C.border}`, flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                {chain.notes && <div style={{ fontSize: 13, color: C.muted, marginBottom: 12 }}>{chain.notes}</div>}
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
                  {chain.stainless_available && <span style={{ background: "#f1f5f9", color: C.muted, fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 99 }}>Stainless Available</span>}
                </div>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <button onClick={() => setShowConfigurator(true)}
                    style={{ background: C.navyMid, color: "#fff", border: "none", borderRadius: 8, padding: "10px 20px", fontSize: 13, fontWeight: 700, cursor: "pointer", letterSpacing: "0.02em" }}>
                    Configure →
                  </button>
                  <button onClick={() => { onAddRFQ({ description: `4B Drop Forged Chain ${chain.chain_link} (${chain.link_type} Link, P=${chain.P_mm}mm, ${chain.min_breaking_load_kn}kN, W=${chain.W_mm}mm) — Links Only` }); setRfqAdded(true); }}
                    style={{ background: rfqAdded ? C.green : "#f1f5f9", color: rfqAdded ? "white" : C.text, border: `1px solid ${rfqAdded ? C.green : C.border}`, borderRadius: 8, padding: "10px 22px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
                    {rfqAdded ? "✓ Added" : "Add to RFQ"}
                  </button>
                  {chain.bolt_n_go_compatible && (
                    <button onClick={() => setShowBoltNGo(true)}
                      style={{ background: C.greenBg, color: C.green, border: `2px solid ${C.green}`, borderRadius: 8, padding: "10px 22px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
                      ⚡ Order Bolt N Go
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div style={{ display: "flex", gap: 4, padding: "16px 24px 0", borderBottom: `1px solid ${C.border}`, overflowX: "auto" }}>
              {[["specs","Specifications"], ["sprockets",`Sprockets (${sprockets.length})`], ["pins","Pins (3)"], ["segments","Segments"]].map(([k, l]) => (
                <button key={k} onClick={() => setTab(k)}
                  style={{ padding: "8px 16px", border: "none", cursor: "pointer", fontWeight: 600, fontSize: 12, borderRadius: "8px 8px 0 0", whiteSpace: "nowrap",
                    background: tab === k ? C.navyMid : "transparent", color: tab === k ? "white" : C.muted }}>
                  {l}
                </button>
              ))}
            </div>

            <div style={{ padding: "20px 24px 28px" }}>

              {/* SPECS */}
              {tab === "specs" && (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 260px), 1fr))", gap: 16 }}>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: C.navyMid, marginBottom: 10, textTransform: "uppercase" }}>Dimensions</div>
                    {[["Pitch (P)", `${chain.P_mm} mm`], ["Height (H)", `${chain.H_mm} mm`], ["Plate Thickness (T)", `${chain.T_mm} mm`], ["Width (W)", `${chain.W_mm} mm`], ["Pin-to-Edge (M)", `${chain.M_mm} mm`], ["Pin Hole Dia (D)", `${chain.D_mm} mm`], ...(chain.F_mm ? [["Overall Width (F)", `${chain.F_mm} mm`], ["Bar Gap (E)", `${chain.E_mm} mm`]] : [])].map(([k,v]) => (
                      <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: `1px solid ${C.border}`, fontSize: 13 }}>
                        <span style={{ color: C.muted }}>{k}</span><span style={{ fontWeight: 600 }}>{v}</span>
                      </div>
                    ))}
                  </div>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: C.navyMid, marginBottom: 10, textTransform: "uppercase" }}>Mechanical</div>
                    {[["Min Breaking Load", `${chain.min_breaking_load_kn} kN`], ["Case Hardness", chain.case_hardness || "C57–C62"], ["Case Depth", `${chain.case_depth_mm || 0.7} mm`], ["Core Hardness", chain.core_hardness || "C40"], ["Weight / Link", `${chain.weight_per_link_kg} kg`], ["Link Type", chain.link_type], ["Stainless Avail.", chain.stainless_available ? "Yes" : "No"]].map(([k,v]) => (
                      <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: `1px solid ${C.border}`, fontSize: 13 }}>
                        <span style={{ color: C.muted }}>{k}</span><span style={{ fontWeight: 600 }}>{v}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* SPROCKETS — clickable cards, bore size on RFQ */}
              {tab === "sprockets" && (
                <div>
                  {sprockets.length === 0 ? (
                    <div style={{ textAlign: "center", padding: 32, color: C.muted }}>No sprocket data available. Contact Uniking Canada.</div>
                  ) : (
                    <>
                      <div style={{ display: "flex", gap: 16, marginBottom: 16 }}>
                        <img src={IMG.sprocket_installed} alt="Sprocket" style={{ width: 160, height: 110, objectFit: "cover", borderRadius: 8, border: `1px solid ${C.border}` }} />
                        <div>
                          <div style={{ fontWeight: 700, color: C.navyMid, fontSize: 14 }}>Sprocket Family: {chain.sprocket_family}</div>
                          <div style={{ fontSize: 12, color: C.muted, marginTop: 4 }}>Click any row to order a specific sprocket. Bore size collected at checkout.</div>
                        </div>
                      </div>
                      <div style={{ overflowX: "auto" }}>
                        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                          <thead><tr style={{ background: C.navyMid, color: "white" }}>
                            {["Teeth","PCD mm","ØA mm","ØB mm","ØC max","Bolts","T mm","WB1 mm",""].map(h => (
                              <th key={h} style={{ padding: "8px 10px", textAlign: "center", fontWeight: 600 }}>{h}</th>
                            ))}
                          </tr></thead>
                          <tbody>
                            {sprockets.map((s, i) => (
                              <tr key={i} style={{ background: i % 2 ? "#f5f7fb" : "white", cursor: "pointer" }}
                                onClick={() => setSelectedSprocket(s)}
                                onMouseEnter={e => e.currentTarget.style.background = "#e8f0fe"}
                                onMouseLeave={e => e.currentTarget.style.background = i % 2 ? "#f5f7fb" : "white"}>
                                {[s.teeth, s.pcd_mm, s.A_mm, s.B_mm, s.C_max_mm, s.bolts, s.T_mm, s.WB1_mm].map((v, j) => (
                                  <td key={j} style={{ padding: "8px 10px", textAlign: "center", borderBottom: `1px solid ${C.border}` }}>{v}</td>
                                ))}
                                <td style={{ padding: "6px 8px", textAlign: "center", borderBottom: `1px solid ${C.border}` }}>
                                  <span style={{ background: C.navyMid, color: "white", borderRadius: 6, padding: "3px 10px", fontSize: 11, fontWeight: 700 }}>Select →</span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      {trailers.length > 0 && (
                        <div style={{ marginTop: 20 }}>
                          <div style={{ fontSize: 13, fontWeight: 700, color: C.navyMid, marginBottom: 10 }}>Trailer / Return Wheels</div>
                          <div style={{ overflowX: "auto" }}>
                            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                              <thead><tr style={{ background: C.navyLight, color: "white" }}>
                                {["PCD mm","C max (smooth)","WB2 smooth","WB3 segmental","T1 rim",""].map(h => (
                                  <th key={h} style={{ padding: "8px 10px", textAlign: "center", fontWeight: 600 }}>{h}</th>
                                ))}
                              </tr></thead>
                              <tbody>
                                {trailers.map((t, i) => (
                                  <tr key={i} style={{ background: i % 2 ? "#f5f7fb" : "white" }}>
                                    {[t.pcd_mm, t.C_max_smooth_mm, t.WB2_smooth_mm, t.WB3_segmental_mm, t.T1_rim_width_mm].map((v, j) => (
                                      <td key={j} style={{ padding: "7px 10px", textAlign: "center", borderBottom: `1px solid ${C.border}` }}>{v}</td>
                                    ))}
                                    <td style={{ padding: "5px 8px", textAlign: "center", borderBottom: `1px solid ${C.border}` }}>
                                      <button onClick={() => onAddRFQ({ description: `4B Trailer/Return Wheel ${chain.sprocket_family} — PCD=${t.pcd_mm}mm, WB2=${t.WB2_smooth_mm}mm, WB3=${t.WB3_segmental_mm}mm, T1=${t.T1_rim_width_mm}mm` })}
                                        style={{ background: C.navyLight, color: "white", border: "none", borderRadius: 6, padding: "4px 10px", cursor: "pointer", fontSize: 11, fontWeight: 700 }}>+ RFQ</button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}

              {/* PINS — each as its own card with image */}
              {tab === "pins" && (
                <div>
                  <div style={{ fontSize: 13, color: C.muted, marginBottom: 16 }}>Each pin style is an individual orderable product. Click a pin to view details and add to RFQ.</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                    {PIN_OPTIONS.map((p, idx) => {
                      const pos = PIN_IMG_POSITION[p.name] || "center";
                      const descs = {
                        "Forged Head Pin + Collar and Roll Pin": "Standard assembly — forged head retained by collar and roll pin. Maximum strength.",
                        "Forged Head Pin + One Clamp": "Forged head with single clamp. Easy to service, ideal for frequent disassembly.",
                        "Plain Pin + Two Clamps": "Plain pin with two clamps — removable from either side. Best for confined spaces.",
                      };
                      return (
                        <div key={p.name} onClick={() => setSelectedPin(p.name)}
                          style={{ display: "flex", gap: 0, borderRadius: 12, border: `2px solid ${C.border}`, overflow: "hidden", cursor: "pointer", transition: "all 0.15s" }}
                          onMouseEnter={e => { e.currentTarget.style.borderColor = C.navyMid; e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.1)"; }}
                          onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.boxShadow = ""; }}>
                          {/* Cropped image */}
                          <div style={{ width: 100, height: 80, overflow: "hidden", flexShrink: 0, position: "relative", background: "#f0f4f8" }}>
                            <img src={IMG.pin_all} alt={p.name}
                              style={{ width: "100%", height: 240, objectFit: "cover", objectPosition: `center ${pos}`,
                                position: "absolute", top: pos === "top" ? 0 : pos === "bottom" ? "auto" : "50%",
                                transform: pos === "center" ? "translateY(-50%)" : "none", bottom: pos === "bottom" ? 0 : "auto" }} />
                          </div>
                          <div style={{ padding: "12px 16px", flex: 1 }}>
                            <div style={{ fontWeight: 700, color: C.navyMid, fontSize: 13, marginBottom: 4 }}>{p.name}</div>
                            <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.5 }}>{descs[p.name]}</div>
                          </div>
                          <div style={{ display: "flex", alignItems: "center", padding: "0 16px" }}>
                            <span style={{ background: C.navyMid, color: "white", borderRadius: 6, padding: "4px 12px", fontSize: 11, fontWeight: 700 }}>Order →</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* SEGMENTS */}
              {tab === "segments" && (
                <div style={{ textAlign: "center", padding: 32, color: C.muted }}>
                  <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 8 }}>Segment / Trailer Data</div>
                  <div style={{ fontSize: 13 }}>Contact Uniking Canada for segment specifications for this chain series.</div>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Sprocket product modal */}
      {selectedSprocket && (
        <SprocketModal sprocket={selectedSprocket} chainLink={chain.chain_link} sprocketFamily={chain.sprocket_family}
          onClose={() => setSelectedSprocket(null)} onAddRFQ={(item) => { onAddRFQ(item); setSelectedSprocket(null); }} />
      )}

      {/* Pin product modal */}
      {selectedPin && (
        <PinModal pinName={selectedPin} chainLink={chain.chain_link}
          onClose={() => setSelectedPin(null)} onAddRFQ={(item) => { onAddRFQ(item); setSelectedPin(null); }} />
      )}
    </div>
  );
}

// ── MAIN PAGE v2 ─────────────────────────────────────────────────────────────────
function ForgedChainView({ onBack, onGoRFQ }) {
  const [chains, setChains] = useState([]);
  const [selected, setSelected] = useState(null);
  const [rfqToast, setRfqToast] = useState(null);

  useEffect(() => {
    (async () => {
      let all = [], skip = 0, hasMore = true;
      while (hasMore) {
        const batch = await ForgedChain.list({ limit: 500, skip });
        all = [...all, ...batch];
        hasMore = batch.length === 500;
        skip += batch.length;
      }
      setChains([...all].sort((a, b) => a.P_mm - b.P_mm || a.chain_link.localeCompare(b.chain_link)));
    })();
  }, []);

  const handleAddRFQ = (item) => {
    const count = addToRFQ(item);
    setRfqToast(`Added to RFQ (${count} item${count !== 1 ? "s" : ""})`);
    setTimeout(() => setRfqToast(null), 3000);
  };

  const groupByPitch = (arr) => arr.reduce((acc, c) => {
    const key = `${c.P_mm}mm`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(c);
    return acc;
  }, {});

  const allGroups = groupByPitch(chains);

  // ChainCard — bolt_n_go_compatible chains show a Standard / Bolt N Go toggle before opening modal
  const ChainCard = ({ chain }) => {
    const [variant, setVariant] = useState("standard"); // "standard" | "bng"
    const isBNG = chain.bolt_n_go_compatible;

    const handleOpen = () => {
      setSelected({ chain, variant });
    };

    return (
      <div style={{ background: "white", borderRadius: 12, border: `1px solid ${C.border}`, overflow: "hidden", transition: "all 0.15s" }}
        onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 6px 20px rgba(0,0,0,0.10)"; }}
        onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; }}>
        <div style={{ height: 3, background: isBNG && variant === "bng" ? `linear-gradient(90deg, ${C.green}, #15803d)` : `linear-gradient(90deg, ${C.navyMid}, ${C.navyLight})` }} />
        <div style={{ padding: 14 }}>
          <div style={{ display: "flex", gap: 12, alignItems: "flex-start", marginBottom: 10 }}>
            <img src={getLinkImg(chain.link_type)} alt={chain.link_type}
              style={{ width: 64, height: 64, objectFit: "cover", borderRadius: 8, border: `1px solid ${C.border}`, flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: 16, fontWeight: 800, color: C.navy }}>{chain.chain_link}</div>
              <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{chain.link_type} Link</div>
              <div style={{ fontSize: 11, color: C.muted }}>P = {chain.P_mm} mm | H = {chain.H_mm} mm</div>
            </div>
          </div>

          {/* Variant toggle — only shown for Bolt N Go compatible chains */}
          {isBNG && (
            <div style={{ display: "flex", gap: 0, marginBottom: 10, borderRadius: 8, overflow: "hidden", border: `1px solid ${C.border}` }}>
              <button onClick={e => { e.stopPropagation(); setVariant("standard"); }}
                style={{ flex: 1, padding: "6px 0", fontSize: 11, fontWeight: 700, cursor: "pointer", border: "none",
                  background: variant === "standard" ? C.navyMid : "#f8fafc",
                  color: variant === "standard" ? "white" : C.muted,
                  borderRight: `1px solid ${C.border}` }}>
                Standard
              </button>
              <button onClick={e => { e.stopPropagation(); setVariant("bng"); }}
                style={{ flex: 1, padding: "6px 0", fontSize: 11, fontWeight: 700, cursor: "pointer", border: "none",
                  background: variant === "bng" ? C.green : "#f8fafc",
                  color: variant === "bng" ? "white" : C.muted }}>
                ⚡ Bolt N Go
              </button>
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: C.muted }}>Breaking Load</span>
              <span style={{ fontWeight: 700, color: C.text }}>{chain.min_breaking_load_kn} kN</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: C.muted }}>Weight / Link</span>
              <span style={{ fontWeight: 600 }}>{chain.weight_per_link_kg} kg</span>
            </div>
          </div>
          {chain.stainless_available && (
            <div style={{ marginTop: 8 }}>
              <span style={{ fontSize: 9, background: "#f1f5f9", color: C.muted, padding: "1px 6px", borderRadius: 8 }}>Stainless Avail.</span>
            </div>
          )}
        </div>
        <div onClick={handleOpen} style={{ padding: "8px 14px", borderTop: `1px solid ${C.border}`, background: variant === "bng" ? C.greenBg : "#f8fafc",
          display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }}>
          <span style={{ fontSize: 11, color: variant === "bng" ? C.green : C.muted, fontWeight: variant === "bng" ? 700 : 400 }}>
            {variant === "bng" ? "⚡ Bolt N Go selected" : "Click to configure"}
          </span>
          <span style={{ fontSize: 11, color: variant === "bng" ? C.green : C.navyMid, fontWeight: 700 }}>Details →</span>
        </div>
      </div>
    );
  };

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "Inter, Arial, sans-serif" }}>
      {rfqToast && (
        <div style={{ position: "fixed", bottom: 24, right: 24, background: C.green, color: "white", padding: "12px 20px", borderRadius: 10, fontWeight: 700, fontSize: 13, zIndex: 99999, boxShadow: "0 4px 16px rgba(0,0,0,0.2)" }}>
          ✓ {rfqToast}
        </div>
      )}

      {/* Header */}
      <div style={{ background: `linear-gradient(135deg, ${C.navy} 0%, ${C.navyMid} 100%)`, padding: "20px 32px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <a href="#" onClick={e => { e.preventDefault(); onBack(); }}
            style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", color: "white", padding: "6px 14px", borderRadius: 6, cursor: "pointer", fontSize: 13 }}>
            ← Back
          </a>
          <div>
            <div style={{ color: "white", fontSize: 22, fontWeight: 800 }}>Drop Forged Chain</div>
            <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 12, marginTop: 2 }}>4B Components · For Drag Conveyors</div>
          </div>
        </div>
        <img src={IMG.hero} alt="4B Forged Chain" style={{ height: 64, borderRadius: 8, opacity: 0.9 }} />
      </div>

      {/* Feature bar */}
      <div style={{ background: "white", borderBottom: `1px solid ${C.border}`, padding: "10px 32px", display: "flex", gap: 24, flexWrap: "wrap" }}>
        {["Case Hardened C57–C62", "Ductile Core C40", "Pitches 102–260 mm", "Double & Triple Strand", "Custom Flights Available", "Stainless Available"].map(f => (
          <span key={f} style={{ fontSize: 11, color: C.muted, fontWeight: 600 }}>✓ {f}</span>
        ))}
      </div>

      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "24px clamp(12px,4vw,28px)" }}>
        <div style={{ fontSize: 13, color: C.muted, marginBottom: 20 }}>
          Configure with flights, pins, and attachments. Chains marked <span style={{ color: C.green, fontWeight: 700 }}>⚡ Bolt N Go</span> are also available pre-assembled — toggle on the card before opening.
        </div>
        {Object.entries(allGroups).map(([pitch, items]) => (
          <div key={pitch} style={{ marginBottom: 36 }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: C.navyMid, textTransform: "uppercase", letterSpacing: 1, marginBottom: 12, paddingBottom: 6, borderBottom: `2px solid ${C.border}`, display: "flex", alignItems: "center", gap: 10 }}>
              {pitch} Pitch
              {items.some(c => c.bolt_n_go_compatible) && (
                <span style={{ background: C.greenBg, color: C.green, fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 99 }}>⚡ Bolt N Go available</span>
              )}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 210px), 1fr))", gap: 16 }}>
              {items.map(chain => <ChainCard key={chain.id} chain={chain} />)}
            </div>
          </div>
        ))}
      </div>

      {selected && <ChainModal chain={selected.chain} variant={selected.variant} onClose={() => setSelected(null)} onAddRFQ={handleAddRFQ} />}
    </div>
  );
}


// ═══════════════════════════════════════════════════════════════════════════════
// ── ROLLER CONFIGURATOR VIEW ───────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

// ─── UNIT HELPERS ─────────────────────────────────────────────────────────────
function makeFmt(metric) {
  return {
    load:  (n)  => metric ? `${n} N`    : `${Math.round(n / 4.448)} lbf`,
    speed: (ms) => metric ? `${ms} m/s` : `${Math.round(ms * 196.85)} fpm`,
    tempC: (c)  => metric ? `${c}°C`    : `${Math.round(c * 9 / 5 + 32)}°F`,
    mm:    (v)  => metric ? `${v} mm`   : `${(v / 25.4).toFixed(3)}"`,
    mmShort:(v) => metric ? `${v} mm`   : `${(v / 25.4).toFixed(2)}"`,
  };
}

// ─── COMPLETE INTERROLL SERIES DATA (2026 CATALOG) ───────────────────────────
const SERIES = [
  {
    id: "1100", name: "Series 1100", subtitle: "Gravity Conveyor Roller",
    platform: "1100", duty: "Light", color: "#3b82f6",
    driveType: "Gravity / Push (non-driven)", maxLoad_N: 350, maxSpeed_ms: 0.3,
    temp_min_C: -5, temp_max_C: 40, antistatic: "Available (grooved/sleeved versions)",
    image_url: "https://base44.app/api/apps/69dd9ffccab4dd693d4d92f5/files/mp/public/69dd9ffccab4dd693d4d92f5/643c8bc1a_1100_p32_i0.jpeg",
    page_range: "32–37", tags: ["Gravity", "Light Duty", "Food Grade"],
    applications: ["Gravity conveyors", "Light parcels", "Food / washdown (FDA grease)", "Push conveyors"],
    notes: "FDA-compliant grease standard. PVC tube max temp: avoid sustained load above +30°C.",
    tubes: [
      { label: "Ø16 × 1 mm — Stainless steel", tube_mm: 16, wall_mm: 1, materials: ["Stainless steel"] },
      { label: "Ø20 × 1.5 mm — Zinc-plated / Stainless / Aluminum / PVC (stone gray)", tube_mm: 20, wall_mm: 1.5, materials: ["Zinc-plated steel","Stainless steel","Aluminum","PVC gray RAL7030"] },
      { label: "Ø30 × 1.2 mm — Zinc-plated / Stainless / Aluminum / PVC (stone gray)", tube_mm: 30, wall_mm: 1.2, materials: ["Zinc-plated steel","Stainless steel","Aluminum","PVC gray RAL7030"] },
      { label: "Ø40 × 1.2 mm — Zinc-plated / Stainless / Aluminum / PVC (stone gray)", tube_mm: 40, wall_mm: 1.2, materials: ["Zinc-plated steel","Stainless steel","Aluminum","PVC gray RAL7030"] },
      { label: "Ø50 × 1.5 mm — Zinc-plated / Stainless / Aluminum / PVC (stone gray / sky blue)", tube_mm: 50, wall_mm: 1.5, materials: ["Zinc-plated steel","Stainless steel","Aluminum","PVC gray RAL7030","PVC sky blue RAL5015"] },
    ],
    pvc_max_lengths: { 16: 300, 20: 400, 30: 500, 40: 600, 50: 600, 63: 800 },
    shafts: [
      { label: "Spring-loaded (both sides)", code: "spring", ext_mm: null },
      { label: "Fixed shaft", code: "fixed", ext_mm: null },
      { label: "Female thread M6", code: "female_M6", ext_mm: null },
      { label: "Female thread M8", code: "female_M8", ext_mm: null },
      { label: "Male thread", code: "male", ext_mm: null },
      { label: "Flatted shaft", code: "flat", ext_mm: null },
      { label: "Variable length", code: "variable", ext_mm: null },
    ],
    sleeves: ["None","PVC sleeve","PU sleeve","Lagging"],
    grooves: false,
    sprockets: false,
    dim_formula: "EL = AGL = RL + 10 mm (female/male thread) | Spring: EL = RL + 10 mm, AGL = RL + 26 mm",
    load_table: {
      cols_mm: [200, 400, 600],
      rows: [
        { label: "Ø16×1 SS, Ø5 shaft", loads: [30, 10, null] },
        { label: "Ø20×1.5 SS, Ø6 shaft", loads: [70, 25, null] },
        { label: "Ø30×1.2 ZP, Ø8 shaft", loads: [150, 55, 25] },
        { label: "Ø40×1.2 ZP, Ø10 shaft", loads: [250, 100, 50] },
        { label: "Ø50×1.5 ZP, Ø12 shaft", loads: [350, 150, 80] },
      ],
    },
  },
  {
    id: "1200", name: "Series 1200", subtitle: "Steel Conveyor Roller",
    platform: "1200", duty: "Medium", color: "#8b5cf6",
    driveType: "Gravity / Belt / Driven", maxLoad_N: 1200, maxSpeed_ms: 0.8,
    temp_min_C: -30, temp_max_C: 80, antistatic: "Standard (all versions)",
    image_url: "https://base44.app/api/apps/69dd9ffccab4dd693d4d92f5/files/mp/public/69dd9ffccab4dd693d4d92f5/0a354bdce_1200_p38_i0.jpeg",
    page_range: "38–43", tags: ["Deep Freeze", "Belt Drive", "Antistatic"],
    applications: ["General conveying", "Belt conveyors", "Deep freeze (−30°C)", "High-temp (+80°C)"],
    notes: "Steel bearing housing for extreme temps. Lubrication: oiled to Ø40 mm, greased from Ø50 mm. All antistatic.",
    tubes: [
      { label: "Ø30 × 1.2 mm — Zinc-plated / Stainless / Aluminum", tube_mm: 30, wall_mm: 1.2, materials: ["Zinc-plated steel","Stainless steel","Aluminum"] },
      { label: "Ø40 × 1.2 mm — Zinc-plated / Stainless / Aluminum", tube_mm: 40, wall_mm: 1.2, materials: ["Zinc-plated steel","Stainless steel","Aluminum"] },
      { label: "Ø50 × 1.5 mm — Zinc-plated / Stainless / Aluminum", tube_mm: 50, wall_mm: 1.5, materials: ["Zinc-plated steel","Stainless steel","Aluminum"] },
      { label: "Ø60 × 1.5 mm — Zinc-plated / Stainless / Aluminum", tube_mm: 60, wall_mm: 1.5, materials: ["Zinc-plated steel","Stainless steel","Aluminum"] },
    ],
    shafts: [
      { label: "Spring-loaded", code: "spring" },
      { label: "Fixed shaft", code: "fixed" },
      { label: "Female thread M8", code: "female_M8" },
      { label: "Male thread", code: "male" },
    ],
    sleeves: ["None","PVC sleeve","PU sleeve","Lagging"],
    grooves: false, sprockets: false,
    dim_formula: "EL = AGL = RL + shaft-specific extension. Contact Uniking for full dimension table (pp. 38–43).",
    load_table: {
      cols_mm: [200, 400, 600, 800, 1000, 1200],
      rows: [
        { label: "Ø30×1.2 ZP, Ø8", loads: [250, 100, 50, 30, null, null] },
        { label: "Ø40×1.2 ZP, Ø10", loads: [500, 220, 130, 90, null, null] },
        { label: "Ø50×1.5 ZP, Ø12", loads: [900, 450, 280, 195, 150, 120] },
        { label: "Ø60×1.5 ZP, Ø14", loads: [1200, 700, 450, 330, 260, 215] },
      ],
    },
  },
  {
    id: "1450", name: "Series 1450", subtitle: "Heavy-Duty Universal Conveyor Roller",
    platform: "1450", duty: "Heavy", color: "#ef4444",
    driveType: "Gravity / Chain / Belt (driven or non-driven)", maxLoad_N: 5000, maxSpeed_ms: 0.8,
    temp_min_C: -5, temp_max_C: 40, antistatic: "Optional",
    image_url: "https://base44.app/api/apps/69dd9ffccab4dd693d4d92f5/files/mp/public/69dd9ffccab4dd693d4d92f5/1ac6db2ed_1450_p44_i0.jpeg",
    page_range: "44–49", tags: ["Heavy Duty", "5000 N", "Pallet"],
    applications: ["Palletizers", "Heavy containers", "Barrels & drums", "Steel containers"],
    notes: "Polyamide housing: 5000 N, −5 to +40°C. Steel housing (deep freeze): 2500 N, −30 to +80°C. Grooves for round belt on Ø80×2 only.",
    tubes: [
      { label: "Ø60 × 2 mm — Zinc-plated / Stainless (Polyamide housing, 5000 N)", tube_mm: 60, wall_mm: 2, materials: ["Zinc-plated steel","Stainless steel"], housing: "Polyamide" },
      { label: "Ø60 × 3 mm — Zinc-plated / Stainless (Polyamide housing, screw-connected)", tube_mm: 60, wall_mm: 3, materials: ["Zinc-plated steel","Stainless steel"], housing: "Polyamide", bearing: "6204 2RZ" },
      { label: "Ø80 × 2 mm — Zinc-plated / Stainless (Polyamide housing, 5000 N) — GROOVES AVAILABLE", tube_mm: 80, wall_mm: 2, materials: ["Zinc-plated steel","Stainless steel"], housing: "Polyamide", grooves_available: true },
      { label: "Ø80 × 3 mm — Zinc-plated / Stainless (Polyamide housing, 5000 N)", tube_mm: 80, wall_mm: 3, materials: ["Zinc-plated steel","Stainless steel"], housing: "Polyamide" },
      { label: "Ø80 × 2 mm — Zinc-plated / Stainless (Steel housing — deep freeze −30°C, 2500 N)", tube_mm: 80, wall_mm: 2, materials: ["Zinc-plated steel","Stainless steel"], housing: "Steel (deep freeze)", max_load_N: 2500 },
      { label: "Ø80 × 3 mm — Zinc-plated / Stainless (Steel housing — deep freeze, 2500 N)", tube_mm: 80, wall_mm: 3, materials: ["Zinc-plated steel","Stainless steel"], housing: "Steel (deep freeze)", max_load_N: 2500 },
      { label: "Ø89 × 3 mm — Zinc-plated / Stainless (Polyamide housing, 5000 N)", tube_mm: 89, wall_mm: 3, materials: ["Zinc-plated steel","Stainless steel"], housing: "Polyamide" },
    ],
    shafts: [
      { label: "Female thread Ø20 mm (screw-connected)", code: "female_M20" },
      { label: "Fixed shaft Ø20 mm", code: "fixed_20" },
      { label: "Spring-loaded Ø20 mm", code: "spring_20" },
      { label: "Male thread Ø20 mm", code: "male_20" },
    ],
    sleeves: ["None","PVC sleeve (Ø60, Ø80 only)","Lagging"],
    grooves: "Ø80×2 only — up to 4 grooves for round belt guiding",
    sprockets: false,
    dim_formula: "EL = AGL = RL + 10 mm (all shaft types). U = RL − 26 mm (Ø80/89), RL − 10 mm (Ø60×3).",
    load_table: {
      cols_mm: [200, 400, 600, 800, 1000, 1200, 1400, 1600, 1800, 2000],
      rows: [
        { label: "Ø60×3 Steel housing (6204 2RZ), Ø20", loads: [5000,null,null,null,3635,2515,1840,1405,1105,895] },
        { label: "Ø80×2 Polyamide (6205 2RZ), Ø20", loads: [5000,null,null,null,5000,4285,3135,2395,1890,1525] },
        { label: "Ø80×3 Polyamide (6205 2RZ), Ø20", loads: [5000,null,null,null,5000,5000,4530,3460,2725,2205] },
        { label: "Ø89×3 Polyamide (6205 2RZ), Ø20", loads: [5000,null,null,null,5000,5000,4465,4005,3655,3070] },
      ],
    },
  },
  {
    id: "1500", name: "Series 1500 / 1520", subtitle: "Slide Bearing Conveyor Roller — Food Grade",
    platform: "1500", duty: "Light", color: "#10b981",
    driveType: "Non-driven (gravity / push)", maxLoad_N: 1100, maxSpeed_ms: 0.8,
    temp_min_C: -5, temp_max_C: 40, antistatic: "No",
    image_url: "https://base44.app/api/apps/69dd9ffccab4dd693d4d92f5/files/mp/public/69dd9ffccab4dd693d4d92f5/f9eafd36b_1500_p50_i0.jpeg",
    page_range: "50–55", tags: ["Food Grade", "Washdown", "No Grease"],
    applications: ["Food packaging", "Moist / wet areas", "Washdown", "High cleanliness"],
    notes: "1500: max 120 N, Ø6 HEX stainless pin. 1520: max 1100 N, Ø12 round SS pin with M8 thread. PTFE polymer slide bearing — runs completely dry, no grease washout possible.",
    tubes: [
      { label: "Ø30 × 1.5 mm PVC (Series 1500 — max 120 N, Ø6 HEX pin)", tube_mm: 30, wall_mm: 1.5, materials: ["PVC"], series_variant: "1500", shaft_pin: "Ø6 HEX stainless", max_load_N: 120 },
      { label: "Ø30 × 1.5 mm Stainless (Series 1500 — max 120 N, Ø6 HEX pin)", tube_mm: 30, wall_mm: 1.5, materials: ["Stainless steel"], series_variant: "1500", shaft_pin: "Ø6 HEX stainless", max_load_N: 120 },
      { label: "Ø50 × 1.5 mm Stainless (Series 1520 — max 1100 N, Ø12 pin + M8)", tube_mm: 50, wall_mm: 1.5, materials: ["Stainless steel"], series_variant: "1520", shaft_pin: "Ø12 round SS + M8 thread", max_load_N: 1100 },
      { label: "Ø50 × 1.5 mm PVC (Series 1520 — max 1100 N, Ø12 pin + M8)", tube_mm: 50, wall_mm: 1.5, materials: ["PVC"], series_variant: "1520", shaft_pin: "Ø12 round SS + M8 thread", max_load_N: 1100 },
    ],
    shafts: [
      { label: "Stainless steel pin — permanently fixed (standard for 1500/1520)", code: "fixed_ss_pin" },
    ],
    sleeves: ["None"],
    grooves: false, sprockets: false,
    dim_formula: "1500 (Ø6 hex): 11 mm hex hole in side profile. 1520 (Ø12): round hole for M8 screw fastening.",
    load_table: {
      cols_mm: [200, 400, 600, 800, 1000],
      rows: [
        { label: "Ø30 PVC/SS (1500), Ø6 pin", loads: [120, 50, 25, null, null] },
        { label: "Ø50×1.5 SS (1520), Ø12 pin", loads: [1100, 500, 300, 200, 150] },
      ],
    },
  },
  {
    id: "1700L", name: "Series 1700 Light", subtitle: "Universal Conveyor Roller — Light",
    platform: "1700", duty: "Light", color: "#64748b",
    driveType: "Gravity / Push (non-driven)", maxLoad_N: 150, maxSpeed_ms: 1.5,
    temp_min_C: -30, temp_max_C: 40, antistatic: "Available (grooved/sleeved, not PVC)",
    image_url: "https://base44.app/api/apps/69dd9ffccab4dd693d4d92f5/files/mp/public/69dd9ffccab4dd693d4d92f5/89ecec097_1700_light_p56_i0.jpeg",
    page_range: "56–59", tags: ["Light Duty", "Low Noise", "Small Parts"],
    applications: ["Assembly machines", "Packaging machines", "Gravity conveyors", "Small components"],
    notes: "Bearing 689 2Z. PVC tube: min −5°C. Noise reduction option for Ø30 mm. Antistatic not available for PVC tube.",
    tubes: [
      { label: "Ø20 × 1.5 mm — Zinc-plated / Stainless / Aluminum / PVC", tube_mm: 20, wall_mm: 1.5, materials: ["Zinc-plated steel","Stainless steel","Aluminum","PVC"] },
      { label: "Ø30 × 1.2 mm — Zinc-plated / Stainless / Aluminum / PVC (noise reduction available)", tube_mm: 30, wall_mm: 1.2, materials: ["Zinc-plated steel","Stainless steel","Aluminum","PVC"], noise_reduction: true },
    ],
    shafts: [
      { label: "Spring-loaded (both sides)", code: "spring" },
      { label: "Fixed shaft", code: "fixed" },
      { label: "Female thread", code: "female" },
      { label: "Variable length", code: "variable" },
    ],
    sleeves: ["None","PVC sleeve"],
    grooves: false, sprockets: false,
    dim_formula: "EL = AGL = RL + 10 mm (female thread) | Spring: EL = RL + 10 mm, AGL = RL + 26 mm",
    load_table: {
      cols_mm: [200, 400, 600],
      rows: [
        { label: "Ø20×1.5 ZP, Ø8 shaft", loads: [80, 25, null] },
        { label: "Ø30×1.2 ZP, Ø8 shaft", loads: [150, 55, 25] },
      ],
    },
  },
  {
    id: "1700", name: "Series 1700", subtitle: "Universal Conveyor Roller — Standard",
    platform: "1700", duty: "Medium", color: "#f59e0b",
    driveType: "Driven / Non-driven / Belt idler", maxLoad_N: 2000, maxSpeed_ms: 2.0,
    temp_min_C: -30, temp_max_C: 40, antistatic: "Standard (grooved/sleeved, not PVC)",
    image_url: "https://base44.app/api/apps/69dd9ffccab4dd693d4d92f5/files/mp/public/69dd9ffccab4dd693d4d92f5/792d28c13_1700_p60_i0.jpeg",
    page_range: "60–69", tags: ["Universal", "2000 N", "2.0 m/s"],
    applications: ["Unit handling", "Cardboards & containers", "Gravity conveyors", "Belt bearing roller"],
    notes: "Bearing 6002 2RZ. Oiled bearings for deep freeze (−30°C). PVC tube min −5°C. Tapered shaft-shuttle available. Max load with grooves: 300 N.",
    tubes: [
      { label: "Ø20 × 1.5 mm — ZP / SS / Al / PVC", tube_mm: 20, wall_mm: 1.5, materials: ["Zinc-plated steel","Stainless steel","Aluminum","PVC"] },
      { label: "Ø30 × 1.2 mm — ZP / SS / Al / PVC", tube_mm: 30, wall_mm: 1.2, materials: ["Zinc-plated steel","Stainless steel","Aluminum","PVC"] },
      { label: "Ø40 × 1.5 mm — ZP / SS / Al", tube_mm: 40, wall_mm: 1.5, materials: ["Zinc-plated steel","Stainless steel","Aluminum"] },
      { label: "Ø50 × 1.5 mm — ZP / SS / Al / PVC — GROOVES AVAILABLE", tube_mm: 50, wall_mm: 1.5, materials: ["Zinc-plated steel","Stainless steel","Aluminum","PVC"], grooves_available: true },
      { label: "Ø50 × 2.8 mm — PVC (stone gray / sky blue / graphite gray)", tube_mm: 50, wall_mm: 2.8, materials: ["PVC gray RAL7030","PVC sky blue RAL5015","PVC graphite RAL7024"] },
      { label: "Ø50 × 3.0 mm — ZP Steel — GROOVES AVAILABLE", tube_mm: 50, wall_mm: 3.0, materials: ["Zinc-plated steel"], grooves_available: true },
      { label: "Ø51 × 2.0 mm — Steel", tube_mm: 51, wall_mm: 2.0, materials: ["Zinc-plated steel","Stainless steel"] },
      { label: "Ø60 × 1.5 mm — ZP / SS / Al — GROOVES AVAILABLE", tube_mm: 60, wall_mm: 1.5, materials: ["Zinc-plated steel","Stainless steel","Aluminum"], grooves_available: true },
      { label: "Ø60 × 2.0 mm — Steel — GROOVES AVAILABLE", tube_mm: 60, wall_mm: 2.0, materials: ["Zinc-plated steel","Stainless steel"], grooves_available: true },
      { label: "Ø60 × 3.0 mm — Steel", tube_mm: 60, wall_mm: 3.0, materials: ["Zinc-plated steel","Stainless steel"] },
      { label: "Ø63 × 3.0 mm — PVC", tube_mm: 63, wall_mm: 3.0, materials: ["PVC gray RAL7030"] },
      { label: "Ø80 × 2.0 mm — Steel — GROOVES AVAILABLE", tube_mm: 80, wall_mm: 2.0, materials: ["Zinc-plated steel","Stainless steel"], grooves_available: true },
    ],
    shafts: [
      { label: "Spring-loaded (both sides)", code: "spring" },
      { label: "Fixed shaft", code: "fixed" },
      { label: "Flatted shaft", code: "flat" },
      { label: "Female thread Ø8 mm", code: "female_8" },
      { label: "Female thread Ø10 mm", code: "female_10" },
      { label: "Female thread Ø11 mm HEX", code: "female_11hex" },
      { label: "Female thread Ø12 mm", code: "female_12" },
      { label: "Female thread Ø14 mm", code: "female_14" },
      { label: "Male thread Ø8 mm", code: "male_8" },
      { label: "Male thread Ø10 mm", code: "male_10" },
      { label: "Male thread Ø12 mm", code: "male_12" },
      { label: "Male thread Ø14 mm", code: "male_14" },
      { label: "Tapered shaft-shuttle Ø11–12 mm HEX (max 350 N)", code: "tapered_shuttle" },
      { label: "Variable length", code: "variable" },
    ],
    sleeves: ["None","PVC sleeve","PU sleeve","Lagging"],
    grooves: {
      available_tubes: ["Ø50×1.5","Ø50×3","Ø60×1.5","Ø60×2","Ø80×2"],
      max_grooves: 4,
      note: "1–4 grooves per tube. Positions A–D measured from drive side. Max load with grooves: 300 N. Max 100% inspection: Ø50 mm, RL ≤ 1400 mm, 1–2 grooves.",
      wall_limit_mm: 2,
      groove_for: "Round belt guiding (below roller surface)",
    },
    sprockets: false,
    dim_formula: "Spring/flat shaft: EL = RL+10, AGL = RL+26 mm | Female thread: EL = AGL = RL+10 mm | Male thread Ø8: EL=RL+18, AGL=RL+30 | Ø10: EL=RL+20,AGL=RL+30 | Ø12: EL=RL+22,AGL=RL+40 | Ø14: EL=RL+24,AGL=RL+44",
    load_table: {
      cols_mm: [200, 300, 400, 600, 800, 1000, 1300, 1600],
      rows: [
        { label: "Ø40×1.5 Steel, Ø12–14 (screw)", loads: [2000,2000,2000,1570,870,555,325,215] },
        { label: "Ø50×1.5 Steel, Ø14 (screw)", loads: [2000,2000,2000,2000,1765,1120,660,430] },
        { label: "Ø50×1.5 Steel, Ø11 HEX (loose)", loads: [2000,2000,1545,1030,785,645,515,430] },
        { label: "Ø60×1.5 Steel, Ø14 (screw)", loads: [2000,2000,2000,2000,2000,1965,1155,760] },
        { label: "Ø80×2.0 Steel, Ø14 (screw)", loads: [2000,2000,2000,2000,2000,2000,2000,2000] },
        { label: "Ø50×2.8 PVC, Ø12 (screw)", loads: [660,275,150,65,35,null,null,null] },
        { label: "Tapered shuttle Ø50×1.5 Steel (max 350 N)", loads: [350,350,350,350,350,null,null,null] },
      ],
    },
  },
  {
    id: "1700KXO", name: "Series 1700KXO", subtitle: "Tapered Curve Roller",
    platform: "1700", duty: "Medium", color: "#06b6d4",
    driveType: "Gravity / Driven — curve sections", maxLoad_N: 500, maxSpeed_ms: 2.0,
    temp_min_C: -30, temp_max_C: 40, antistatic: "1.8° black elements only",
    image_url: "https://base44.app/api/apps/69dd9ffccab4dd693d4d92f5/files/mp/public/69dd9ffccab4dd693d4d92f5/d5de1faf1_1700KXO_p70_i0.jpeg",
    page_range: "70–75", tags: ["Curve", "Tapered", "KXO"],
    applications: ["90° curve conveyors", "180° curve conveyors", "Driven curve sections"],
    notes: "Grooves can be applied to the tube extension (beyond tapered elements). 1.8° gray = standard | 1.8° black = antistatic | 2.2° gray = tightest curves. Must specify inner curve radius and conicity at ordering.",
    tubes: [
      { label: "Ø50 × 1.5 mm ZP/SS — Conicity 1.8° Gray (not antistatic)", tube_mm: 50, wall_mm: 1.5, materials: ["Zinc-plated steel","Stainless steel"], conicity: "1.8°", color_el: "Gray", antistatic: false, inner_radius_mm: "800–850 mm min" },
      { label: "Ø50 × 1.5 mm ZP/SS — Conicity 1.8° Black (antistatic)", tube_mm: 50, wall_mm: 1.5, materials: ["Zinc-plated steel","Stainless steel"], conicity: "1.8°", color_el: "Black", antistatic: true, inner_radius_mm: "800–850 mm min" },
      { label: "Ø60 × 1.5 mm ZP/SS — Conicity 1.8° Gray (not antistatic)", tube_mm: 60, wall_mm: 1.5, materials: ["Zinc-plated steel","Stainless steel"], conicity: "1.8°", color_el: "Gray", antistatic: false, inner_radius_mm: "800–850 mm min" },
      { label: "Ø60 × 1.5 mm ZP/SS — Conicity 1.8° Black (antistatic)", tube_mm: 60, wall_mm: 1.5, materials: ["Zinc-plated steel","Stainless steel"], conicity: "1.8°", color_el: "Black", antistatic: true, inner_radius_mm: "800–850 mm min" },
      { label: "Ø50 × 1.5 mm ZP/SS — Conicity 2.2° Gray (min radius 690 mm)", tube_mm: 50, wall_mm: 1.5, materials: ["Zinc-plated steel","Stainless steel"], conicity: "2.2°", color_el: "Gray", antistatic: false, inner_radius_mm: "690 mm min" },
      { label: "Ø60 × 1.5 mm ZP/SS — Conicity 2.2° Gray (min radius 690 mm)", tube_mm: 60, wall_mm: 1.5, materials: ["Zinc-plated steel","Stainless steel"], conicity: "2.2°", color_el: "Gray", antistatic: false, inner_radius_mm: "690 mm min" },
    ],
    tapered_elements: {
      "1.8°": [
        { rl_mm: 150, min_dia_mm: 55.6, max_dia_mm: 64.8 },
        { rl_mm: 200, min_dia_mm: 52.5, max_dia_mm: 64.8 },
        { rl_mm: 250, min_dia_mm: 55.6, max_dia_mm: 71.2 },
        { rl_mm: 300, min_dia_mm: 52.5, max_dia_mm: 71.2 },
        { rl_mm: 350, min_dia_mm: 55.6, max_dia_mm: 77.6 },
        { rl_mm: 400, min_dia_mm: 52.5, max_dia_mm: 77.6 },
        { rl_mm: 500, min_dia_mm: 52.5, max_dia_mm: 84.0 },
        { rl_mm: 600, min_dia_mm: 52.5, max_dia_mm: 90.4 },
        { rl_mm: 700, min_dia_mm: 52.5, max_dia_mm: 96.8 },
        { rl_mm: 800, min_dia_mm: 52.5, max_dia_mm: 103.2 },
        { rl_mm: 900, min_dia_mm: 52.5, max_dia_mm: 109.9 },
        { rl_mm: 1000, min_dia_mm: 52.5, max_dia_mm: 116.0 },
      ],
      "2.2°": [
        { rl_mm: 190, min_dia_mm: 56.0, max_dia_mm: 70.6 },
        { rl_mm: 240, min_dia_mm: 56.0, max_dia_mm: 74.4 },
        { rl_mm: 290, min_dia_mm: 56.0, max_dia_mm: 78.3 },
        { rl_mm: 340, min_dia_mm: 56.0, max_dia_mm: 82.1 },
        { rl_mm: 440, min_dia_mm: 56.0, max_dia_mm: 89.8 },
        { rl_mm: 540, min_dia_mm: 56.0, max_dia_mm: 97.5 },
        { rl_mm: 640, min_dia_mm: 56.0, max_dia_mm: 105.2 },
        { rl_mm: 740, min_dia_mm: 56.0, max_dia_mm: 112.8 },
      ],
    },
    shafts: [
      { label: "Spring-loaded shaft", code: "spring" },
      { label: "Female thread (M8)", code: "female" },
      { label: "Fixed shaft", code: "fixed" },
    ],
    sleeves: ["None"],
    grooves: { note: "Grooves applied to tube extension beyond tapered elements. Must specify positions A/B from drive side. Max 4 grooves. Max load with grooves: 300 N." },
    sprockets: false,
    dim_formula: "Female thread / Fixed: EL = AGL = RL + 10 mm | Spring-loaded: EL = RL + 10 mm, AGL = RL + 32 mm | U = length of tapered elements",
    load_table: {
      cols_mm: [200, 400, 600, 800],
      rows: [
        { label: "Ø50 1.8° ZP", loads: [500, 350, 240, 185] },
        { label: "Ø60 1.8° ZP", loads: [500, 400, 300, 240] },
        { label: "Ø60 2.2° ZP", loads: [500, 380, 275, 215] },
      ],
    },
  },
  {
    id: "1700H", name: "Series 1700 Heavy", subtitle: "Universal Conveyor Roller — Heavy",
    platform: "1700", duty: "Heavy", color: "#dc2626",
    driveType: "Driven / Belt idler (Ø60×3 seamless)", maxLoad_N: 3000, maxSpeed_ms: 2.0,
    temp_min_C: -30, temp_max_C: 40, antistatic: "Standard (grooved/sleeved versions)",
    image_url: "https://base44.app/api/apps/69dd9ffccab4dd693d4d92f5/files/mp/public/69dd9ffccab4dd693d4d92f5/70725b856_1700_heavy_p76_i0.jpeg",
    page_range: "76–79", tags: ["Heavy Duty", "3000 N", "Belt Idler"],
    applications: ["Heavy unit handling", "Pallets & rims", "Barrels", "Belt idler (Ø60×3 seamless)"],
    notes: "Bearing 6003 2RZ. Ø60×3 seamless version for use as idler pulley for crowned EC5000. Max load with grooves: 300 N. Carbonitriding only for Ø50×1.5 mm.",
    tubes: [
      { label: "Ø50 × 1.5 mm — ZP / SS — GROOVES AVAILABLE — Carbonitriding available", tube_mm: 50, wall_mm: 1.5, materials: ["Zinc-plated steel","Stainless steel"], grooves_available: true, carbonitriding: true },
      { label: "Ø51 × 2.0 mm — ZP / SS — Also usable as idler pulley (crowned EC5000)", tube_mm: 51, wall_mm: 2.0, materials: ["Zinc-plated steel","Stainless steel"], idler_option: true },
      { label: "Ø60 × 3.0 mm — Steel — Seamless option (belt idler)", tube_mm: 60, wall_mm: 3.0, materials: ["Zinc-plated steel","Stainless steel"], idler_option: true, note: "Seamless version available for noise-optimized belt idler use" },
    ],
    shafts: [
      { label: "Female thread Ø17 mm (screw-connected)", code: "female_17" },
      { label: "Fixed shaft Ø17 mm", code: "fixed_17" },
      { label: "Variable length", code: "variable" },
    ],
    sleeves: ["None","PVC sleeve (Ø50 only)","PU sleeve (Ø50 only)","Lagging"],
    grooves: {
      available_tubes: ["Ø50×1.5"],
      max_grooves: 4,
      note: "Grooves not available on Ø60×3. Max load with grooves: 300 N. Wall must be ≤ 2 mm.",
      groove_for: "Round belt guiding",
    },
    sprockets: false,
    dim_formula: "Female thread/Fixed Ø17: EL = AGL = RL + 10 mm | U = RL − 28 mm (Ø50×1.5/51×2), RL − 30 mm (Ø60×3)",
    load_table: {
      cols_mm: [200, 300, 400, 600, 800, 1000, 1300, 1600],
      rows: [
        { label: "Ø50×1.5 ZP/SS, Ø17", loads: [3000,3000,3000,3000,1760,1120,655,430] },
        { label: "Ø51×2 ZP/SS, Ø17", loads: [3000,3000,3000,3000,2420,1540,905,595] },
        { label: "Ø60×3 std/seamless, Ø17", loads: [3000,3000,3000,3000,3000,3000,2135,1405] },
      ],
    },
  },
  {
    id: "3500L", name: "Series 3500 Light", subtitle: "Fixed Drive Roller — Light",
    platform: "1700", duty: "Light", color: "#7c3aed",
    driveType: "3/8\" chain — wrapping or tangential", maxLoad_N: 150, maxSpeed_ms: 0.5,
    temp_min_C: -30, temp_max_C: 40, antistatic: "Available (grooved/sleeved)",
    image_url: "https://base44.app/api/apps/69dd9ffccab4dd693d4d92f5/files/mp/public/69dd9ffccab4dd693d4d92f5/36a851e75_3500_light_p80_i0.jpeg",
    page_range: "80–83", tags: ["Fixed Drive", "3/8\" Chain", "Light"],
    applications: ["Packaging industry", "Assembly machines", "Machine chains", "Small cardboards"],
    notes: "Bearing 689 2Z. Drive heads zinc-plated after welding. Complements 3500KXO Light for curve sections.",
    tubes: [
      { label: "Ø30 × 1.2 mm — Zinc-plated steel", tube_mm: 30, wall_mm: 1.2, materials: ["Zinc-plated steel"] },
      { label: "Ø30 × 1.2 mm — Stainless steel", tube_mm: 30, wall_mm: 1.2, materials: ["Stainless steel"] },
    ],
    shafts: [
      { label: "Female thread Ø8 mm", code: "female_8" },
      { label: "Male thread Ø8 mm", code: "male_8" },
      { label: "Variable length", code: "variable" },
    ],
    sleeves: ["None","PVC sleeve"],
    grooves: false,
    sprockets: {
      drives: [
        { label: "3/8\" Welded steel sprocket — T12 (single)", pitch: "3/8\"", teeth: 12, type: "Single", material: "Welded steel", OD_mm: 36.8, hub_mm: 23, EL_formula: "RL + 28 mm", AGL_formula: "RL + 28 mm", U_formula: "RL − 21 mm" },
        { label: "3/8\" Welded steel double sprocket — T12 (double, for roller-to-roller chain)", pitch: "3/8\"", teeth: 12, type: "Double", material: "Welded steel", OD_mm: 36.8, hub_mm: 23, EL_formula: "RL + 48 mm", AGL_formula: "RL + 48 mm" },
      ],
    },
    dim_formula: "Single sprocket: EL = AGL = RL + 28 mm, U = RL − 21 mm | Double sprocket: EL = AGL = RL + 48 mm",
    load_table: {
      cols_mm: [200, 400, 600],
      rows: [
        { label: "Ø30×1.2 Steel — 3/8\" T12 single, Ø8", loads: [150, 150, 150] },
        { label: "Ø30×1.2 Steel — 3/8\" T12 double, Ø8", loads: [150, 150, 150] },
      ],
    },
  },
  {
    id: "3500", name: "Series 3500", subtitle: "Fixed Drive Roller — Standard",
    platform: "1700", duty: "Medium", color: "#4f46e5",
    driveType: "Chain / PolyVee / Flat belt / Toothed belt / Round belt", maxLoad_N: 2000, maxSpeed_ms: 2.0,
    temp_min_C: -30, temp_max_C: 40, antistatic: "Available (not PVC, not IP55)",
    image_url: "https://base44.app/api/apps/69dd9ffccab4dd693d4d92f5/files/mp/public/69dd9ffccab4dd693d4d92f5/808a4015d_3500_p84_i0.jpeg",
    page_range: "84–95", tags: ["Fixed Drive", "Chain", "PolyVee", "IP55"],
    applications: ["Chain-driven conveying", "Belt drive conveying", "IP55 wet/dusty environments"],
    notes: "Bearing 6002 2RZ. IP55 variant: 0 to +40°C, both-side shaft bolts only. Deep freeze fixation option available for PolyVee/round/toothed belt heads. Antistatic not available for PVC tube or IP55.",
    tubes: [
      { label: "Ø40 × 1.5 mm — ZP / SS / Al", tube_mm: 40, wall_mm: 1.5, materials: ["Zinc-plated steel","Stainless steel","Aluminum"] },
      { label: "Ø50 × 1.5 mm — ZP / SS / Al — GROOVES AVAILABLE", tube_mm: 50, wall_mm: 1.5, materials: ["Zinc-plated steel","Stainless steel","Aluminum"], grooves_available: true },
      { label: "Ø50 × 2.8 mm — PVC stone gray RAL7030", tube_mm: 50, wall_mm: 2.8, materials: ["PVC gray RAL7030"] },
      { label: "Ø50 × 2.8 mm — PVC sky blue RAL5015", tube_mm: 50, wall_mm: 2.8, materials: ["PVC sky blue RAL5015"] },
      { label: "Ø60 × 1.5 mm — ZP / SS / Al — GROOVES AVAILABLE", tube_mm: 60, wall_mm: 1.5, materials: ["Zinc-plated steel","Stainless steel","Aluminum"], grooves_available: true },
      { label: "Ø60 × 2.0 mm — ZP Steel (PolyVee + 5/8\" welded sprocket only)", tube_mm: 60, wall_mm: 2.0, materials: ["Zinc-plated steel"], note: "Only PolyVee Ø43 polymer / PolyVee Ø56 welded steel / 5/8\" double sprocket T13" },
      { label: "Ø63 × 3.0 mm — PVC gray RAL7030", tube_mm: 63, wall_mm: 3.0, materials: ["PVC gray RAL7030"] },
    ],
    shafts: [
      { label: "Female thread Ø12 mm (screw-connected)", code: "female_12" },
      { label: "Female thread Ø14 mm (screw-connected)", code: "female_14" },
      { label: "Spring-loaded Ø11 HEX (loose — PolyVee/round belt only)", code: "spring_11hex" },
      { label: "Fixed shaft Ø11 HEX (loose — PolyVee/round belt only)", code: "fixed_11hex" },
      { label: "Tapered shaft-shuttle Ø11 TH (PolyVee/round belt only)", code: "tapered_th" },
      { label: "Both-side shaft bolt (IP55 variant only)", code: "bolt_ip55" },
      { label: "Variable length", code: "variable" },
    ],
    sleeves: ["None","PVC sleeve","PU sleeve","Lagging"],
    grooves: {
      available_tubes: ["Ø50×1.5","Ø60×1.5"],
      max_grooves: 4,
      note: "Max load with grooves: 300 N. Wall ≤ 2 mm. Not available with PVC tube or IP55.",
    },
    sprockets: {
      drives: [
        { label: "Polymer PolyVee head Ø43 mm (round / flat belt)", pitch: "PolyVee", OD_mm: 43, type: "Single", material: "Polymer", EL_formula: "RL + 36 mm", AGL_formula: "RL + 36 mm", max_load_N: 350 },
        { label: "Welded steel PolyVee head Ø56 mm (Ø60×2 only)", pitch: "PolyVee", OD_mm: 56, type: "Single", material: "Welded steel", note: "Ø60×2 tube only", EL_formula: "RL + 36 mm" },
        { label: "Round belt drive head Ø37.8 mm", pitch: "Round belt", OD_mm: 37.8, type: "Single", material: "Polymer", EL_formula: "RL + 36 mm", max_load_N: 350 },
        { label: "Polymer flat belt drive head 38 mm", pitch: "Flat belt", type: "Single", material: "Polymer", EL_formula: "RL + 40 mm" },
        { label: "Toothed belt 8-pitch T18 (Ø 45.8 mm)", pitch: "Toothed belt 8T18", teeth: 18, OD_mm: 45.8, type: "Single", material: "Polymer", EL_formula: "RL + 40 mm" },
        { label: "1/2\" Polymer sprocket T9 (Ø 37.1 mm)", pitch: "1/2\"", teeth: 9, OD_mm: 37.1, type: "Single", material: "Polymer", EL_formula: "RL + 40 mm", max_load_N: 300 },
        { label: "1/2\" Polymer sprocket T11 (Ø 45.1 mm)", pitch: "1/2\"", teeth: 11, OD_mm: 45.1, type: "Single", material: "Polymer", EL_formula: "RL + 40 mm", max_load_N: 300 },
        { label: "1/2\" Polymer sprocket T13 (Ø 53.1 mm)", pitch: "1/2\"", teeth: 13, OD_mm: 53.1, type: "Single", material: "Polymer", EL_formula: "RL + 40 mm" },
        { label: "1/2\" Polymer sprocket T14 (Ø 57.1 mm)", pitch: "1/2\"", teeth: 14, OD_mm: 57.1, type: "Single", material: "Polymer", EL_formula: "RL + 40 mm" },
        { label: "1/2\" Polymer double sprocket T14 (Ø 57.1 mm) — roller-to-roller", pitch: "1/2\"", teeth: 14, OD_mm: 57.1, type: "Double", material: "Polymer", EL_formula: "RL + 62 mm" },
        { label: "3/8\" Polymer double sprocket T20 (Ø 49.6 mm) — roller-to-roller", pitch: "3/8\"", teeth: 20, OD_mm: 49.6, type: "Double", material: "Polymer", EL_formula: "RL + 40 mm" },
        { label: "1/2\" Welded steel sprocket T14 (Ø 57.1 mm)", pitch: "1/2\"", teeth: 14, OD_mm: 57.1, type: "Single", material: "Welded steel", EL_formula: "RL + 40 mm" },
        { label: "1/2\" Welded steel double sprocket T14 (Ø 57.1 mm) — roller-to-roller", pitch: "1/2\"", teeth: 14, OD_mm: 57.1, type: "Double", material: "Welded steel", EL_formula: "RL + 62 mm" },
        { label: "5/8\" Welded steel double sprocket T13 (Ø 66.3 mm) — Ø60×2 only", pitch: "5/8\"", teeth: 13, OD_mm: 66.3, type: "Double", material: "Welded steel", note: "Ø60×2 only", EL_formula: "RL + 62 mm" },
      ],
    },
    dim_formula: "Single sprocket/flat belt: EL = AGL = RL + 40 mm | Double sprocket: EL = AGL = RL + 62 mm | PolyVee/round belt: EL = AGL = RL + 36 mm",
    load_table: {
      cols_mm: [200, 400, 600, 800, 1000, 1200, 1400],
      rows: [
        { label: "Ø50×1.5 Steel — 1/2\" poly T14 single, Ø12", loads: [1320,975,915,885,870,830,600] },
        { label: "Ø50×1.5 Steel — 1/2\" poly T14 double, Ø12", loads: [935,770,685,655,640,630,620] },
        { label: "Ø50×1.5 Steel — welded 1/2\" T14 single, Ø14", loads: [2000,2000,2000,1760,1120,775,565] },
        { label: "Ø50×1.5 Steel — flat belt 38mm, Ø14", loads: [2000,1510,1405,1360,1220,830,601] },
        { label: "Ø60×1.5 Steel — 1/2\" poly T14 single, Ø14", loads: [1500,1500,1450,1405,1385,1370,1050] },
        { label: "Ø60×1.5 Steel — welded 1/2\" T14 single, Ø14", loads: [2000,2000,2000,2000,1960,1355,990] },
        { label: "Ø50×2.8 PVC — 1/2\" poly T14, Ø12", loads: [1060,185,75,40,null,null,null] },
      ],
    },
  },
  {
    id: "3800", name: "Series 3800", subtitle: "Friction Roller — Zero Pressure Accumulation",
    platform: "1700", duty: "Medium", color: "#ec4899",
    driveType: "Chain / Flat belt / Toothed belt (friction slip coupling)", maxLoad_N: 500, maxSpeed_ms: 0.5,
    temp_min_C: -5, temp_max_C: 40, antistatic: "Available (<10⁶ Ω)",
    image_url: "https://base44.app/api/apps/69dd9ffccab4dd693d4d92f5/files/mp/public/69dd9ffccab4dd693d4d92f5/644fcc1be_3800_p126_i0.jpeg",
    page_range: "117–131", tags: ["Friction", "Accumulation", "Buffer"],
    applications: ["Zero-pressure accumulation", "Buffer sections", "Packaging", "Controlled stops"],
    notes: "Bearing 6002 2RZ. Friction coupling releases under back-pressure (weight-dependent). Series 3870 variant has two-sided coupling (no width positioning needed). Max load: 500 N (steel tube). PVC tube: max 500 N at EL 200 mm, drops sharply with length. Consult planning section p.191.",
    tubes: [
      { label: "Ø50 × 1.5 mm — ZP / SS / Al", tube_mm: 50, wall_mm: 1.5, materials: ["Zinc-plated steel","Stainless steel","Aluminum"] },
      { label: "Ø50 × 2.8 mm — PVC stone gray RAL7030", tube_mm: 50, wall_mm: 2.8, materials: ["PVC gray RAL7030"] },
      { label: "Ø60 × 1.5 mm — ZP / SS", tube_mm: 60, wall_mm: 1.5, materials: ["Zinc-plated steel","Stainless steel"] },
    ],
    shafts: [
      { label: "Female thread Ø12 mm", code: "female_12" },
      { label: "Female thread Ø14 mm", code: "female_14" },
      { label: "Female thread Ø15 mm (Ø60×1.5 only)", code: "female_15" },
      { label: "Variable length", code: "variable" },
    ],
    sleeves: ["None","PVC sleeve","PU sleeve","Lagging"],
    grooves: false,
    sprockets: {
      note: "Friction drive heads — interchangeable with fixed heads. Same drive head range as 3500.",
      drives: [
        { label: "Polymer flat belt drive head 38 mm", pitch: "Flat belt", type: "Single", material: "Polymer", EL_formula: "RL + 40 mm" },
        { label: "Round belt drive head", pitch: "Round belt", type: "Single", material: "Polymer", EL_formula: "RL + 40 mm" },
        { label: "Toothed belt 8-pitch T18", pitch: "Toothed belt 8T18", teeth: 18, type: "Single", material: "Polymer", EL_formula: "RL + 40 mm" },
        { label: "1/2\" Polymer sprocket T9", pitch: "1/2\"", teeth: 9, type: "Single", material: "Polymer (friction)", EL_formula: "RL + 40 mm" },
        { label: "1/2\" Polymer sprocket T14 (single)", pitch: "1/2\"", teeth: 14, type: "Single", material: "Polymer (friction)", EL_formula: "RL + 40 mm" },
        { label: "1/2\" Polymer double sprocket T14 — roller-to-roller", pitch: "1/2\"", teeth: 14, type: "Double (friction)", material: "Polymer (friction)", EL_formula: "RL + 62 mm" },
        { label: "3/8\" Polymer double sprocket T20", pitch: "3/8\"", teeth: 20, type: "Double (friction)", material: "Polymer (friction)", EL_formula: "RL + 40 mm" },
        { label: "1/2\" Steel sprocket T14 (single)", pitch: "1/2\"", teeth: 14, type: "Single", material: "Steel (friction)", EL_formula: "RL + 40 mm" },
        { label: "1/2\" Steel double sprocket T14 — roller-to-roller", pitch: "1/2\"", teeth: 14, type: "Double (friction)", material: "Steel (friction)", EL_formula: "RL + 62 mm" },
      ],
    },
    dim_formula: "Single drive head: EL = AGL = RL + 40 mm | Double sprocket: EL = AGL = RL + 62 mm",
    load_table: {
      cols_mm: [200, 400, 600, 800, 1000, 1200, 1400],
      rows: [
        { label: "Ø50×1.5 Steel — 1/2\" T14 single, Ø12", loads: [500,500,500,500,500,500,500] },
        { label: "Ø60×1.5 Steel — 1/2\" T14 single, Ø14", loads: [500,500,500,500,500,500,500] },
        { label: "Ø50×2.8 PVC — 1/2\" T14 single, Ø12", loads: [500,185,75,40,null,null,null] },
      ],
    },
  },
  {
    id: "3950", name: "Series 3950", subtitle: "Heavy-Duty Fixed Drive Roller",
    platform: "1450", duty: "Heavy", color: "#b45309",
    driveType: "5/8\" permanently welded steel chain sprockets", maxLoad_N: 5000, maxSpeed_ms: 0.5,
    temp_min_C: -5, temp_max_C: 40, antistatic: "Via sprocket head",
    image_url: "https://base44.app/api/apps/69dd9ffccab4dd693d4d92f5/files/mp/public/69dd9ffccab4dd693d4d92f5/d3be2eb5e_3950_p132_i0.jpeg",
    page_range: "132–137", tags: ["Heavy Duty", "5000 N", "Welded Sprocket"],
    applications: ["Heavy pallet conveying", "Steel containers", "Barrels", "Wheels & tires"],
    notes: "Polyamide housing: 5000 N, −5 to +40°C. Steel housing (deep freeze): 2500 N, −30 to +40°C. Components zinc-plated as assembly after welding. Ø89×3 maintains 5000 N at all lengths 200–1600 mm.",
    tubes: [
      { label: "Ø80 × 2 mm — ZP Steel — Polyamide housing (5000 N)", tube_mm: 80, wall_mm: 2, materials: ["Zinc-plated steel"], housing: "Polyamide" },
      { label: "Ø80 × 2 mm — SS — Polyamide housing (5000 N)", tube_mm: 80, wall_mm: 2, materials: ["Stainless steel"], housing: "Polyamide" },
      { label: "Ø80 × 3 mm — ZP Steel — Polyamide housing (5000 N)", tube_mm: 80, wall_mm: 3, materials: ["Zinc-plated steel"], housing: "Polyamide" },
      { label: "Ø80 × 3 mm — SS — Polyamide housing (5000 N)", tube_mm: 80, wall_mm: 3, materials: ["Stainless steel"], housing: "Polyamide" },
      { label: "Ø89 × 3 mm — ZP Steel — Polyamide housing (5000 N — all lengths)", tube_mm: 89, wall_mm: 3, materials: ["Zinc-plated steel"], housing: "Polyamide" },
      { label: "Ø89 × 3 mm — SS — Polyamide housing (5000 N)", tube_mm: 89, wall_mm: 3, materials: ["Stainless steel"], housing: "Polyamide" },
      { label: "Ø80 × 2 mm — ZP Steel — Steel housing (deep freeze −30°C, 2500 N)", tube_mm: 80, wall_mm: 2, materials: ["Zinc-plated steel"], housing: "Steel (deep freeze)", max_load_N: 2500 },
      { label: "Ø80 × 3 mm — ZP Steel — Steel housing (deep freeze, 2500 N)", tube_mm: 80, wall_mm: 3, materials: ["Zinc-plated steel"], housing: "Steel (deep freeze)", max_load_N: 2500 },
    ],
    shafts: [
      { label: "Female thread Ø20 mm", code: "female_20" },
      { label: "Male thread Ø20 mm", code: "male_20" },
    ],
    sleeves: ["None"],
    grooves: false,
    sprockets: {
      drives: [
        { label: "5/8\" Welded steel sprocket T15 (single)", pitch: "5/8\"", teeth: 15, type: "Single", material: "Welded steel (zinc-plated after assembly)", EL_formula: "RL + 40 mm" },
        { label: "5/8\" Welded steel sprocket T18 (single)", pitch: "5/8\"", teeth: 18, type: "Single", material: "Welded steel", EL_formula: "RL + 40 mm" },
        { label: "5/8\" Welded steel double sprocket T15 — roller-to-roller", pitch: "5/8\"", teeth: 15, type: "Double", material: "Welded steel", EL_formula: "RL + 62 mm" },
        { label: "5/8\" Welded steel double sprocket T18 — roller-to-roller", pitch: "5/8\"", teeth: 18, type: "Double", material: "Welded steel", EL_formula: "RL + 62 mm" },
      ],
    },
    dim_formula: "Single sprocket: EL = AGL = RL + 40 mm | Double sprocket: EL = AGL = RL + 62 mm | U = RL − 26 mm (all tubes)",
    load_table: {
      cols_mm: [200, 400, 600, 800, 1000, 1200, 1400, 1600],
      rows: [
        { label: "Ø80×2 Steel — 5/8\" T15/T18, Ø20", loads: [5000,5000,5000,5000,5000,4340,3170,2420] },
        { label: "Ø80×3 Steel — 5/8\" T15/T18, Ø20", loads: [5000,5000,5000,5000,5000,5000,4580,3490] },
        { label: "Ø89×3 Steel — 5/8\" T15/T18, Ø20", loads: [5000,5000,5000,5000,5000,5000,5000,4865] },
      ],
    },
  },
  {
    id: "MSC50", name: "Series MSC 50", subtitle: "Magnetic Speed Controller — Brake Roller",
    platform: "1700", duty: "Light", color: "#0f766e",
    driveType: "Gravity only — eddy current brake (no drive)", maxLoad_N: 350, maxSpeed_ms: 2.0,
    temp_min_C: 0, temp_max_C: 40, antistatic: "Standard",
    image_url: "https://base44.app/api/apps/69dd9ffccab4dd693d4d92f5/files/mp/public/69dd9ffccab4dd693d4d92f5/42d2269d6_MSC50_p138_i0.jpeg",
    page_range: "138–141", tags: ["Brake Roller", "Magnetic", "No Controls"],
    applications: ["Gravity conveyors", "Sorter end points", "Spiral conveyors", "Electronics conveying"],
    notes: "Bearing 6002 2RZ (oiled). Neodyme N45 magnets. Non-contact eddy current braking. Decelerates up to 35 kg. Min temp: 0°C (higher than other series). Same fastening holes as standard rollers — drop-in compatible. Direction-independent.",
    tubes: [
      { label: "Ø51 × 2 mm — Zinc-plated steel (no sleeve)", tube_mm: 51, wall_mm: 2, materials: ["Zinc-plated steel"] },
      { label: "Ø51 × 2 mm — Stainless steel (no sleeve)", tube_mm: 51, wall_mm: 2, materials: ["Stainless steel"] },
      { label: "Ø50 × 1.5 mm — Zinc-plated steel + PU sleeve (Ø54 mm overall)", tube_mm: 50, wall_mm: 1.5, materials: ["Zinc-plated steel"], sleeve_forced: "PU sleeve (mandatory)", OD_with_sleeve_mm: 54 },
      { label: "Ø50 × 1.5 mm — Stainless steel + PU sleeve (Ø54 mm overall)", tube_mm: 50, wall_mm: 1.5, materials: ["Stainless steel"], sleeve_forced: "PU sleeve (mandatory)", OD_with_sleeve_mm: 54 },
    ],
    shafts: [
      { label: "Spring-loaded — 11 mm HEX stainless", code: "spring_11hex_ss" },
      { label: "Fixed shaft — 11 mm HEX stainless", code: "fixed_11hex_ss" },
      { label: "Female thread M8 — 11 mm HEX stainless", code: "female_M8_11hex_ss" },
    ],
    sleeves: ["None (Ø51 tube)","PU sleeve (Ø50 tube — mandatory)"],
    grooves: false, sprockets: false,
    dim_formula: "Ø51 spring/fixed: EL = RL + 10 mm, AGL = EL + 22 mm, U = RL − 28 mm | Ø51 female thread: EL = AGL = RL + 10 mm | Ø54 (PU sleeve) female: EL = AGL = RL + 10 mm, U = RL − 26 mm",
    load_table: {
      cols_mm: [200, 400, 600, 800, 1000, 1200, 1400],
      rows: [
        { label: "Ø51×2 ZP — spring/fixed/female, 11 HEX", loads: [350,350,350,350,350,350,350] },
        { label: "Ø50×1.5 + PU sleeve, 11 HEX", loads: [350,350,350,350,350,350,350] },
      ],
    },
  },
];

// ─── DETAIL MODAL ─────────────────────────────────────────────────────────────
function DetailModal({ s, onClose, onConfigure, fmt, metric }) {
  const [tab, setTab] = useState("overview");
  const [imgErr, setImgErr] = useState(false);
  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "tubes", label: "Tubes & Shafts" },
    { id: "drive", label: "Drive Heads" },
    { id: "grooves", label: "Grooves" },
    { id: "loads", label: "Load Table" },
    { id: "dims", label: "Dimensions" },
  ].filter(t => {
    if (t.id === "grooves" && !s.grooves) return false;
    if (t.id === "drive" && !s.sprockets) return false;
    return true;
  });

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.65)", zIndex: 1000, display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "16px", overflowY: "auto" }}>
      <div style={{ background: "#fff", borderRadius: 16, width: "100%", maxWidth: 820, width: "calc(100vw - 32px)", boxShadow: "0 24px 80px rgba(0,0,0,0.3)", position: "relative", marginBottom: 16 }}>

        {/* Hero */}
        {s.image_url && !imgErr && (
          <div style={{ height: 200, overflow: "hidden", borderRadius: "16px 16px 0 0", position: "relative" }}>
            <img src={s.image_url} alt={s.name} onError={() => setImgErr(true)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(15,35,64,0.85) 0%, transparent 55%)" }} />
            <div style={{ position: "absolute", bottom: 16, left: 20 }}>
              <div style={{ color: "#fff", fontSize: 20, fontWeight: 900 }}>{s.name}</div>
              <div style={{ color: C.goldLight, fontSize: 12, marginTop: 2 }}>{s.subtitle}</div>
            </div>
            <div style={{ position: "absolute", top: 12, right: 48, background: s.color, color: "#fff", padding: "3px 12px", borderRadius: 20, fontSize: 11, fontWeight: 800 }}>{s.duty} Duty</div>
          </div>
        )}

        <button onClick={onClose} style={{ position: "absolute", top: 12, right: 12, background: "rgba(0,0,0,0.4)", border: "none", borderRadius: "50%", width: 32, height: 32, cursor: "pointer", color: "#fff", fontSize: 16, zIndex: 10 }}>✕</button>

        {/* Tab bar */}
        <div style={{ display: "flex", borderBottom: "1px solid " + C.border, padding: "0 clamp(12px,4vw,20px)", overflowX: "auto" }}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              style={{ padding: "11px 14px", border: "none", background: "none", cursor: "pointer", fontSize: 12, fontWeight: tab === t.id ? 700 : 400,
                color: tab === t.id ? s.color : C.muted, borderBottom: tab === t.id ? `2px solid ${s.color}` : "2px solid transparent",
                marginBottom: -1, whiteSpace: "nowrap" }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div style={{ padding: "20px 24px", maxHeight: "55vh", overflowY: "auto" }}>

          {tab === "overview" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {[
                  ["Max Load", fmt.load(s.maxLoad_N)],
                  ["Max Speed", fmt.speed(s.maxSpeed_ms)],
                  ["Temp Range", `${fmt.tempC(s.temp_min_C)} to ${fmt.tempC(s.temp_max_C)}`],
                  ["Platform", s.platform],
                  ["Bearing", s.id === "3500L" || s.id === "1700L" ? "689 2Z" : s.platform === "1450" ? "6205 2RZ / 6204 2RZ" : s.id === "1700H" ? "6003 2RZ" : s.id === "MSC50" ? "6002 2RZ (oiled)" : "6002 2RZ"],
                  ["Antistatic", typeof s.antistatic === "string" ? s.antistatic : (s.antistatic ? "Yes" : "No")],
                  ["Drive", s.driveType],
                  ["Catalog Pages", `pp. ${s.page_range}`],
                ].map(([k, v]) => (
                  <div key={k} style={{ background: "#f8fafc", borderRadius: 8, padding: "9px 13px" }}>
                    <div style={{ fontSize: 10, color: C.muted, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.4px" }}>{k}</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginTop: 2 }}>{v}</div>
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {s.applications.map(a => (
                  <span key={a} style={{ background: s.color + "15", color: s.color, padding: "4px 10px", borderRadius: 8, fontSize: 12, fontWeight: 600 }}>{a}</span>
                ))}
              </div>
              {s.notes && (
                <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 8, padding: "10px 14px", fontSize: 12, color: "#92400e" }}>
                  <strong>Notes: </strong>{s.notes}
                </div>
              )}
            </div>
          )}

          {tab === "tubes" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 8, color: C.text }}>Tube Options</div>
                {s.tubes.map((t, i) => (
                  <div key={i} style={{ padding: "10px 14px", background: i % 2 === 0 ? "#f8fafc" : "#fff", borderRadius: 8, marginBottom: 4, borderLeft: `3px solid ${s.color}` }}>
                    <div style={{ fontWeight: 600, fontSize: 13, color: C.text }}>{t.label}</div>
                    {t.materials && <div style={{ fontSize: 11, color: C.muted, marginTop: 3 }}>Materials: {t.materials.join(" · ")}</div>}
                    {t.conicity && <div style={{ fontSize: 11, color: C.muted }}>Conicity: {t.conicity} · Color: {t.color_el} · Inner radius: {t.inner_radius_mm}</div>}
                    {t.max_load_N && <div style={{ fontSize: 11, color: "#dc2626", fontWeight: 700, marginTop: 2 }}>Max load: {fmt.load(t.max_load_N)}</div>}
                    {t.note && <div style={{ fontSize: 11, color: "#92400e", marginTop: 2 }}>⚠ {t.note}</div>}
                    {t.grooves_available && <div style={{ fontSize: 11, color: "#15803d", fontWeight: 700, marginTop: 2 }}>✓ Grooves available for this tube</div>}
                  </div>
                ))}
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 8, color: C.text }}>Shaft Options</div>
                {s.shafts.map((sh, i) => (
                  <div key={i} style={{ padding: "8px 14px", background: i % 2 === 0 ? "#f8fafc" : "#fff", borderRadius: 6, marginBottom: 3, fontSize: 12, color: C.text }}>
                    • {sh.label}
                  </div>
                ))}
              </div>
              {s.sleeves && s.sleeves.length > 1 && (
                <div>
                  <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 6 }}>Sleeve / Surface Options</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {s.sleeves.map(sl => <span key={sl} style={{ background: "#f0fdf4", color: "#15803d", padding: "4px 10px", borderRadius: 8, fontSize: 12, fontWeight: 600 }}>{sl}</span>)}
                  </div>
                </div>
              )}
            </div>
          )}

          {tab === "drive" && s.sprockets && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {s.sprockets.note && <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 8, padding: "10px 14px", fontSize: 12, color: "#1e40af" }}>{s.sprockets.note}</div>}
              <div style={{ fontWeight: 700, fontSize: 13, color: C.text, marginBottom: 4 }}>Drive Head Options</div>
              {s.sprockets.drives.map((d, i) => (
                <div key={i} style={{ padding: "10px 14px", background: i % 2 === 0 ? "#f8fafc" : "#fff", borderRadius: 8, borderLeft: `3px solid ${s.color}` }}>
                  <div style={{ fontWeight: 600, fontSize: 13, color: C.text }}>{d.label}</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 4, fontSize: 11, color: C.muted }}>
                    {d.pitch && <span>Pitch: <strong>{d.pitch}</strong></span>}
                    {d.teeth && <span>Teeth: <strong>T{d.teeth}</strong></span>}
                    {d.OD_mm && <span>OD: <strong>{fmt.mm(d.OD_mm)}</strong></span>}
                    {d.type && <span>Type: <strong>{d.type}</strong></span>}
                    {d.material && <span>Material: <strong>{d.material}</strong></span>}
                    {d.EL_formula && <span>EL: <strong>{d.EL_formula}</strong></span>}
                    {d.max_load_N && <span style={{ color: "#dc2626", fontWeight: 700 }}>Max: {fmt.load(d.max_load_N)}</span>}
                  </div>
                  {d.note && <div style={{ fontSize: 11, color: "#92400e", marginTop: 4 }}>⚠ {d.note}</div>}
                </div>
              ))}
            </div>
          )}

          {tab === "grooves" && s.grooves && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {typeof s.grooves === "object" && (
                <>
                  {s.grooves.groove_for && <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "#1e40af" }}>
                    <strong>Purpose:</strong> {s.grooves.groove_for}
                  </div>}
                  {s.grooves.available_tubes && <div>
                    <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 6 }}>Tubes with Grooves Available</div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                      {s.grooves.available_tubes.map(t => <span key={t} style={{ background: "#d1fae5", color: "#065f46", padding: "4px 12px", borderRadius: 8, fontWeight: 700, fontSize: 12 }}>{t}</span>)}
                    </div>
                  </div>}
                  {s.grooves.max_grooves && <div style={{ background: "#f8fafc", borderRadius: 8, padding: "12px 16px" }}>
                    <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 6 }}>Groove Specifications</div>
                    <div style={{ fontSize: 12, color: C.text, lineHeight: 1.8 }}>
                      • Max grooves per tube: <strong>{s.grooves.max_grooves}</strong><br />
                      • Groove positions: <strong>A, B, C, D</strong> measured from drive side (must specify at ordering)<br />
                      • Max load capacity with grooves: <strong>{fmt.load(300)}</strong> (overrides table values)<br />
                      • Max tube wall thickness for grooves: <strong>{s.grooves.wall_limit_mm || 2} mm</strong><br />
                      • Grooves are below the roller surface — do not contact conveying goods<br />
                      • Rollers with grooves always include an antistatic element<br />
                      • 100% inspection available: Ø50 mm, RL ≤ 1400 mm, 1–2 grooves, round/hex shaft 8–14 mm
                    </div>
                  </div>}
                  {s.grooves.note && <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 8, padding: "10px 14px", fontSize: 12, color: "#92400e" }}>
                    <strong>Note: </strong>{s.grooves.note}
                  </div>}
                  {s.id === "1700KXO" && s.tapered_elements && (
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 8 }}>Tapered Element Sizes — 1.8°</div>
                      <div style={{ overflowX: "auto" }}>
                        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
                          <thead><tr style={{ background: C.navy }}>
                            <th style={{ padding: "7px 10px", color: "#fff", textAlign: "left" }}>RL (mm)</th>
                            <th style={{ padding: "7px 10px", color: "#fff", textAlign: "left" }}>Min Ø (mm)</th>
                            <th style={{ padding: "7px 10px", color: "#fff", textAlign: "left" }}>Max Ø (mm)</th>
                          </tr></thead>
                          <tbody>{s.tapered_elements["1.8°"].map((r, i) => (
                            <tr key={i} style={{ background: i % 2 === 0 ? "#f8fafc" : "#fff" }}>
                              <td style={{ padding: "6px 10px", fontWeight: 700 }}>{metric ? r.rl_mm : `${(r.rl_mm/25.4).toFixed(2)}"`}</td>
                              <td style={{ padding: "6px 10px" }}>{metric ? r.min_dia_mm : `${(r.min_dia_mm/25.4).toFixed(3)}"`}</td>
                              <td style={{ padding: "6px 10px" }}>{metric ? r.max_dia_mm : `${(r.max_dia_mm/25.4).toFixed(3)}"`}</td>
                            </tr>
                          ))}</tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {tab === "loads" && (
            <div>
              <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 6 }}>Max Static Load Table</div>
              <div style={{ fontSize: 11, color: C.muted, marginBottom: 10 }}>Temperature +5 to +40°C | Without grooves unless stated</div>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
                  <thead><tr style={{ background: C.navy }}>
                    <th style={{ padding: "8px 10px", color: "#fff", textAlign: "left", whiteSpace: "nowrap" }}>Configuration</th>
                    {s.load_table.cols_mm.map(l => (
                      <th key={l} style={{ padding: "8px 10px", color: "#fff", textAlign: "center", whiteSpace: "nowrap" }}>
                        {metric ? `${l} mm` : `${(l/25.4).toFixed(1)}"`}
                      </th>
                    ))}
                  </tr></thead>
                  <tbody>
                    {s.load_table.rows.map((row, i) => (
                      <tr key={i} style={{ background: i % 2 === 0 ? "#f8fafc" : "#fff", borderBottom: "1px solid #e5e7eb" }}>
                        <td style={{ padding: "7px 10px", color: C.navyMid, fontWeight: 600, whiteSpace: "nowrap", maxWidth: 260 }}>{row.label}</td>
                        {row.loads.map((v, j) => (
                          <td key={j} style={{ padding: "7px 10px", textAlign: "center", color: v ? C.text : "#d1d5db", fontWeight: v ? 600 : 400 }}>
                            {v != null ? fmt.load(v) : "—"}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {tab === "dims" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ background: C.navy, borderRadius: 10, padding: "14px 18px" }}>
                <div style={{ fontSize: 10, color: C.goldLight, fontWeight: 700, textTransform: "uppercase", marginBottom: 6 }}>Dimension Terminology</div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.85)", lineHeight: 1.8 }}>
                  <strong style={{ color: C.gold }}>RL</strong> = Reference Length / Ordering Length<br />
                  <strong style={{ color: C.gold }}>EL</strong> = Installation Length (inside side profiles)<br />
                  <strong style={{ color: C.gold }}>AGL</strong> = Total shaft length<br />
                  <strong style={{ color: C.gold }}>U</strong> = Usable tube length (excl. bearing housing)
                </div>
              </div>
              <div style={{ background: "#f8fafc", borderRadius: 8, padding: "14px 16px", fontSize: 12, color: C.text, lineHeight: 2 }}>
                <div style={{ fontWeight: 700, marginBottom: 4 }}>Formulas — Series {s.name}</div>
                {s.dim_formula.split("|").map((line, i) => (
                  <div key={i}>• {line.trim()}</div>
                ))}
              </div>
              {s.pvc_max_lengths && (
                <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 8, padding: "12px 16px" }}>
                  <div style={{ fontWeight: 700, fontSize: 12, marginBottom: 6 }}>PVC Tube Max Lengths</div>
                  {Object.entries(s.pvc_max_lengths).map(([dia, maxL]) => (
                    <div key={dia} style={{ fontSize: 12, color: C.text }}>Ø{dia} mm → max {metric ? `${maxL} mm` : `${(maxL/25.4).toFixed(1)}"`}</div>
                  ))}
                </div>
              )}
              <div style={{ background: "#f0f9ff", border: "1px solid #bae6fd", borderRadius: 8, padding: "12px 16px", fontSize: 12 }}>
                <div style={{ fontWeight: 700, color: C.navyMid, marginBottom: 4 }}>Contact Uniking Canada to Order</div>
                <div style={{ color: C.muted }}>514-886-5270 · sales@unikingcanada.com</div>
                <div style={{ color: C.muted, marginTop: 2 }}>Reference: Interroll Catalog EN 01/2026, pp. {s.page_range}</div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: "14px 24px", borderTop: "1px solid " + C.border, display: "flex", gap: 10, justifyContent: "flex-end", background: "#f8fafc", borderRadius: "0 0 16px 16px" }}>
          <button onClick={onClose} style={{ padding: "9px 18px", background: "#fff", border: "1px solid " + C.border, borderRadius: 8, cursor: "pointer", fontSize: 13, color: C.muted, fontWeight: 600 }}>Close</button>
          <button onClick={() => onConfigure(s)} style={{ padding: "9px 18px", background: C.navyMid, color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 700, letterSpacing: "0.02em" }}>
            Configure →
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── CONFIGURE MODAL ─────────────────────────────────────────────────────────
// ─── ROLLER DRAWING SVG ─────────────────────────────────────────────────────
function RollerDrawing({ tubeDia_mm, rl_mm, shaftType, hasDrive, driveLabel, metric, grooveCount, groovePositions, isConical, sleeveType, seriesColor }) {
  // ── Layout constants ────────────────────────────────────────────────────────
  const SVG_W = 560;
  const SVG_H = 170;
  const cx = SVG_W / 2;
  const cy = 80;

  // ── Roller geometry ─────────────────────────────────────────────────────────
  const rl = parseFloat(rl_mm) || 500;
  const dia = parseFloat(tubeDia_mm) || 50;
  // Map RL to a fixed visual width (min 180, max 360) regardless of real size
  const BODY_W = Math.min(Math.max(180, Math.min(360, rl * 0.55)), 360);
  // Map diameter to visual height (min 24, max 58)
  const BODY_H_R = Math.min(Math.max(24, dia * 0.8), 58); // right end (larger if conical)
  const BODY_H_L = isConical ? Math.max(BODY_H_R * 0.55, 14) : BODY_H_R; // left end narrower for conical

  const bodyX = cx - BODY_W / 2;
  const bodyXR = cx + BODY_W / 2;

  // Roller top/bottom outline (trapezoid if conical, rect if straight)
  const topL = cy - BODY_H_L / 2;
  const topR = cy - BODY_H_R / 2;
  const botL = cy + BODY_H_L / 2;
  const botR = cy + BODY_H_R / 2;

  // ── Shaft geometry ──────────────────────────────────────────────────────────
  const isSpring = shaftType && shaftType.toLowerCase().includes("spring");
  const isFemale = shaftType && shaftType.toLowerCase().includes("female");
  const SHAFT_W = Math.min(BODY_H_L * 0.25, 8);
  const SHAFT_EXT_L = 36;
  const SHAFT_EXT_R = hasDrive ? 0 : 36;
  const shaftY = cy;

  // Drive head geometry
  const DRIVE_W = 18;
  const DRIVE_H = BODY_H_R + 18;

  // ── Groove positions (visual x offsets along body) ──────────────────────────
  const grooveLabels = ["A", "B", "C", "D"];
  const activeGrooves = grooveCount > 0 ? grooveLabels.slice(0, grooveCount) : [];
  // Distribute grooves evenly if no custom positions entered
  const grooveXs = activeGrooves.map((lbl, i) => {
    const pos = groovePositions && groovePositions[lbl] ? parseFloat(groovePositions[lbl]) : null;
    if (pos && rl > 0) return bodyX + (pos / rl) * BODY_W;
    // fallback: evenly spaced
    return bodyX + ((i + 1) / (activeGrooves.length + 1)) * BODY_W;
  });

  // ── Labels ──────────────────────────────────────────────────────────────────
  const rlLabel = rl_mm ? (metric ? `RL = ${Math.round(rl)} mm` : `RL = ${(rl/25.4).toFixed(2)}"`) : "RL = ?";
  const diaLabel = metric ? `Ø${dia} mm` : `Ø${(dia/25.4).toFixed(3)}"`;
  const accent = seriesColor || "#0F2340";

  // EL/AGL hint
  let elHint = "";
  if (rl_mm) {
    if (hasDrive) elHint = `EL ≈ RL + 40 mm`;
    else if (isSpring) elHint = `EL = RL+10 mm · AGL = RL+26 mm`;
    else elHint = `EL = AGL = RL + 10 mm`;
  }

  return (
    <svg width="100%" viewBox={`0 0 ${SVG_W} ${SVG_H}`} style={{ display: "block" }}>
      <defs>
        {/* Arrow markers */}
        <marker id="rdArr" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto">
          <path d="M0,0 L7,3.5 L0,7 Z" fill="#94a3b8"/>
        </marker>
        <marker id="rdArrL" markerWidth="7" markerHeight="7" refX="1" refY="3.5" orient="auto">
          <path d="M7,0 L0,3.5 L7,7 Z" fill="#94a3b8"/>
        </marker>
        <marker id="rdArrV" markerWidth="7" markerHeight="7" refX="3.5" refY="6" orient="auto">
          <path d="M0,0 L3.5,7 L7,0 Z" fill="#94a3b8"/>
        </marker>
        <marker id="rdArrVL" markerWidth="7" markerHeight="7" refX="3.5" refY="1" orient="auto">
          <path d="M0,7 L3.5,0 L7,7 Z" fill="#94a3b8"/>
        </marker>
        {/* Body gradient */}
        <linearGradient id="bodyGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#e2e8f0"/>
          <stop offset="40%" stopColor="#cbd5e1"/>
          <stop offset="100%" stopColor="#94a3b8"/>
        </linearGradient>
        {/* Sleeve gradient (orange for rubber, etc.) */}
        <linearGradient id="sleeveGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fed7aa"/>
          <stop offset="50%" stopColor="#f97316"/>
          <stop offset="100%" stopColor="#c2410c"/>
        </linearGradient>
        {/* Drive head gradient */}
        <linearGradient id="driveGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#93c5fd"/>
          <stop offset="50%" stopColor="#3b82f6"/>
          <stop offset="100%" stopColor="#1d4ed8"/>
        </linearGradient>
      </defs>

      {/* ── Left shaft ─────────────────────────────────────────────────── */}
      <line
        x1={bodyX - SHAFT_EXT_L} y1={shaftY}
        x2={bodyX} y2={shaftY}
        stroke="#475569" strokeWidth={SHAFT_W} strokeLinecap="round"
      />
      {/* Spring clip left */}
      {isSpring && (
        <g>
          <rect x={bodyX - SHAFT_EXT_L + 4} y={shaftY - 7} width={10} height={14} rx={2} fill="#fef3c7" stroke="#f59e0b" strokeWidth={1.5}/>
          <line x1={bodyX - SHAFT_EXT_L + 7} y1={shaftY - 7} x2={bodyX - SHAFT_EXT_L + 7} y2={shaftY + 7} stroke="#f59e0b" strokeWidth={1.2}/>
          <line x1={bodyX - SHAFT_EXT_L + 10} y1={shaftY - 7} x2={bodyX - SHAFT_EXT_L + 10} y2={shaftY + 7} stroke="#f59e0b" strokeWidth={1.2}/>
          <text x={bodyX - SHAFT_EXT_L + 9} y={shaftY + 19} textAnchor="middle" fontSize={7} fill="#92400e" fontWeight="700">spring</text>
        </g>
      )}
      {/* Female thread icon left */}
      {isFemale && (
        <g>
          <circle cx={bodyX - 10} cy={shaftY} r={6} fill="none" stroke="#64748b" strokeWidth={1.5} strokeDasharray="2,2"/>
        </g>
      )}

      {/* ── Right shaft or drive head ────────────────────────────────────── */}
      {hasDrive ? (
        <g>
          {/* Short stub shaft into drive head */}
          <line x1={bodyXR} y1={shaftY} x2={bodyXR + 8} y2={shaftY} stroke="#475569" strokeWidth={SHAFT_W} strokeLinecap="round"/>
          {/* Drive head block */}
          <rect x={bodyXR + 8} y={cy - DRIVE_H/2} width={DRIVE_W} height={DRIVE_H} rx={4} fill="url(#driveGrad)" stroke="#1d4ed8" strokeWidth={1.5}/>
          {/* Sprocket teeth hint — tick marks above drive head */}
          {[0.2, 0.5, 0.8].map((t, i) => (
            <line key={i}
              x1={bodyXR + 8 + DRIVE_W * t} y1={cy - DRIVE_H/2 - 6}
              x2={bodyXR + 8 + DRIVE_W * t} y2={cy - DRIVE_H/2}
              stroke="#93c5fd" strokeWidth={2.5} strokeLinecap="round"
            />
          ))}
          {[0.2, 0.5, 0.8].map((t, i) => (
            <line key={"b"+i}
              x1={bodyXR + 8 + DRIVE_W * t} y1={cy + DRIVE_H/2}
              x2={bodyXR + 8 + DRIVE_W * t} y2={cy + DRIVE_H/2 + 6}
              stroke="#93c5fd" strokeWidth={2.5} strokeLinecap="round"
            />
          ))}
          <text x={bodyXR + 8 + DRIVE_W/2} y={cy + 3} textAnchor="middle" fontSize={6.5} fill="#fff" fontWeight="800">DRIVE</text>
          {/* Drive label below */}
          {driveLabel && (
            <text x={bodyXR + 8 + DRIVE_W/2} y={cy + DRIVE_H/2 + 12} textAnchor="middle" fontSize={6.5} fill="#3b82f6" fontWeight="700">{driveLabel.length > 14 ? driveLabel.slice(0,14)+"…" : driveLabel}</text>
          )}
        </g>
      ) : (
        <g>
          {/* Right shaft */}
          <line x1={bodyXR} y1={shaftY} x2={bodyXR + SHAFT_EXT_R} y2={shaftY} stroke="#475569" strokeWidth={SHAFT_W} strokeLinecap="round"/>
          {isSpring && (
            <g>
              <rect x={bodyXR + SHAFT_EXT_R - 14} y={shaftY - 7} width={10} height={14} rx={2} fill="#fef3c7" stroke="#f59e0b" strokeWidth={1.5}/>
              <line x1={bodyXR + SHAFT_EXT_R - 11} y1={shaftY - 7} x2={bodyXR + SHAFT_EXT_R - 11} y2={shaftY + 7} stroke="#f59e0b" strokeWidth={1.2}/>
              <line x1={bodyXR + SHAFT_EXT_R - 8} y1={shaftY - 7} x2={bodyXR + SHAFT_EXT_R - 8} y2={shaftY + 7} stroke="#f59e0b" strokeWidth={1.2}/>
            </g>
          )}
        </g>
      )}

      {/* ── Sleeve layer (drawn before body so body sits on top at ends) ──── */}
      {sleeveType && sleeveType !== "None" && (
        <polygon
          points={`${bodyX},${topL - 5} ${bodyXR},${topR - 5} ${bodyXR},${botR + 5} ${bodyX},${botL + 5}`}
          fill="url(#sleeveGrad)" opacity={0.7} stroke="#ea580c" strokeWidth={1}
        />
      )}

      {/* ── Roller body (trapezoid polygon) ─────────────────────────────── */}
      <polygon
        points={`${bodyX},${topL} ${bodyXR},${topR} ${bodyXR},${botR} ${bodyX},${botL}`}
        fill="url(#bodyGrad)" stroke="#475569" strokeWidth={2}
      />

      {/* ── Bearing caps (left + right) ───────────────────────────────────── */}
      <rect x={bodyX} y={topL + 2} width={12} height={BODY_H_L - 4} rx={2} fill="#334155" opacity={0.85}/>
      <rect x={bodyXR - 12} y={topR + 2} width={12} height={BODY_H_R - 4} rx={2} fill="#334155" opacity={0.85}/>

      {/* ── Groove markers ────────────────────────────────────────────────── */}
      {grooveXs.map((gx, i) => {
        // Interpolate height at this x position for conical
        const frac = (gx - bodyX) / BODY_W;
        const hTop = topL + (topR - topL) * frac;
        const hBot = botL + (botR - botL) * frac;
        const gH = hBot - hTop;
        return (
          <g key={i}>
            {/* Groove channel line */}
            <line x1={gx} y1={hTop - 1} x2={gx} y2={hBot + 1} stroke={accent} strokeWidth={3} strokeLinecap="round" opacity={0.9}/>
            {/* Groove label */}
            <text x={gx} y={hTop - 7} textAnchor="middle" fontSize={7.5} fill={accent} fontWeight="800">{grooveLabels[i]}</text>
            {/* Position label below if entered */}
            {groovePositions && groovePositions[grooveLabels[i]] && (
              <text x={gx} y={hBot + 14} textAnchor="middle" fontSize={6.5} fill="#64748b">{groovePositions[grooveLabels[i]]}mm</text>
            )}
          </g>
        );
      })}

      {/* ── Conical label ─────────────────────────────────────────────────── */}
      {isConical && (
        <text x={cx} y={topL - 8} textAnchor="middle" fontSize={7} fill="#7c3aed" fontWeight="700">▲ CONICAL / TAPERED</text>
      )}

      {/* ── Sleeve label ─────────────────────────────────────────────────── */}
      {sleeveType && sleeveType !== "None" && (
        <text x={cx} y={botR + 22} textAnchor="middle" fontSize={7} fill="#ea580c" fontWeight="700">Sleeve: {sleeveType}</text>
      )}

      {/* ── RL dimension line (below body) ────────────────────────────────── */}
      <line
        x1={bodyX} y1={botR + (isConical ? 8 : 6)}
        x2={bodyXR} y2={botR + (isConical ? 8 : 6)}
        stroke="#94a3b8" strokeWidth={1}
        markerEnd="url(#rdArr)" markerStart="url(#rdArrL)"
      />
      <text x={cx} y={botR + 20} textAnchor="middle" fontSize={8.5} fill="#475569" fontWeight="700">{rlLabel}</text>

      {/* ── Diameter dimension line (left side) ────────────────────────────── */}
      <line
        x1={bodyX - 22} y1={topL}
        x2={bodyX - 22} y2={botL}
        stroke="#94a3b8" strokeWidth={1}
        markerEnd="url(#rdArr)" markerStart="url(#rdArrL)"
      />
      <text
        x={bodyX - 34} y={cy + 3}
        textAnchor="middle" fontSize={7.5} fill="#475569"
        transform={`rotate(-90, ${bodyX - 34}, ${cy})`}
      >{diaLabel}</text>

      {/* ── EL/AGL hint (top right) ────────────────────────────────────────── */}
      {elHint && (
        <text x={SVG_W - 8} y={14} textAnchor="end" fontSize={7.5} fill="#94a3b8">{elHint}</text>
      )}

      {/* ── "Not configured" placeholder text ─────────────────────────────── */}
      {!rl_mm && !tubeDia_mm && (
        <text x={cx} y={cy + 4} textAnchor="middle" fontSize={10} fill="#cbd5e1" fontWeight="600">Select options to see live preview</text>
      )}
    </svg>
  );
}

function ConfigModal({ s, onClose, fmt, metric }) {
  const [tube, setTube] = useState(null);
  const [material, setMaterial] = useState(null);
  const [shaft, setShaft] = useState(null);
  const [drive, setDrive] = useState(null);
  const [sleeve, setSleeve] = useState("None");
  const [grooveCount, setGrooveCount] = useState(0);
  const [groovePositions, setGroovePositions] = useState({ A: "", B: "", C: "", D: "" });
  const [rl_mm, setRl_mm] = useState("");
  const [qty, setQty] = useState(1);
  const [notes, setNotes] = useState("");
  const [done, setDone] = useState(false);

  const selectedTube = s.tubes.find(t => t.label === tube);
  const selectedDrive = s.sprockets && s.sprockets.drives ? s.sprockets.drives.find(d => d.label === drive) : null;

  const groovedTube = selectedTube && selectedTube.grooves_available;
  const hasGrooves = s.grooves && typeof s.grooves === "object" && s.grooves.max_grooves;

  // EL/AGL from drive or shaft
  const el_formula = selectedDrive ? selectedDrive.EL_formula : (shaft ? (shaft.includes("spring") ? "EL = RL + 10, AGL = RL + 26 mm" : "EL = AGL = RL + 10 mm") : "");

  function buildSummary() {
    const parts = [
      `Series: ${s.name}`,
      tube ? `Tube: ${tube}` : "",
      material ? `Material: ${material}` : "",
      shaft ? `Shaft: ${shaft}` : "",
      drive ? `Drive: ${drive}` : "",
      sleeve && sleeve !== "None" ? `Sleeve: ${sleeve}` : "",
      grooveCount > 0 ? `Grooves: ${grooveCount} groove(s) — positions: ${Object.entries(groovePositions).filter(([k]) => k <= ["A","B","C","D"][grooveCount-1]).map(([k,v]) => `${k}=${v || "?"}mm`).join(", ")}` : "",
      rl_mm ? `RL: ${metric ? rl_mm + " mm" : (rl_mm / 25.4).toFixed(2) + '"'}` : "",
      `Qty: ${qty}`,
      notes ? `Notes: ${notes}` : "",
    ].filter(Boolean).join(" | ");
    return parts;
  }

  // Build Interroll-style part code: Series-TubeDia-Material-Shaft-RL
  function buildPartCode() {
    if (!tube || !shaft) return null;
    const t = selectedTube;
    const mat = material || (t && t.materials && t.materials.length === 1 ? t.materials[0] : null);
    const tubePart = t ? `Ø${t.tube_mm}×${t.wall_mm}` : tube.split("—")[0].trim();
    const matCode = mat ? mat.replace("Zinc-plated steel","ZP").replace("Stainless steel","SS").replace("Aluminum","AL").replace("PVC gray RAL7030","PVC-G").replace("PVC sky blue RAL5015","PVC-B").replace("Zinc-plated","ZP").replace("Stainless","SS").replace("Steel","ST").replace("Polypropylene","PP") : "";
    const shaftCode = shaft.replace("Spring-loaded","SL").replace("Fixed shaft","FX").replace("Female thread ","FT-").replace("Male thread","MT").replace("Flatted shaft","FS").replace("Variable length","VL").replace(/[()]/g,"").replace(/\s+/g,"-");
    const rlPart = rl_mm ? (metric ? `${rl_mm}mm` : `${(rl_mm/25.4).toFixed(2)}in`) : "??";
    const drivePart = drive ? `-${drive.replace(/[^A-Za-z0-9]/g,"")}` : "";
    const sleevePart = sleeve && sleeve !== "None" ? `-${sleeve.replace(/\s+/g,"-")}` : "";
    const groovePart = grooveCount > 0 ? `-${grooveCount}G` : "";
    return `${s.id} / ${tubePart} / ${matCode || "?"} / ${shaftCode} / RL:${rlPart}${drivePart}${sleevePart}${groovePart}`;
  }

  function handlePrintTearSheet() {
    const pc = buildPartCode();
    const rlDisp = rl_mm ? (metric ? `${rl_mm} mm` : `${(rl_mm/25.4).toFixed(2)}"`) : "Not specified";

    // ── Build SVG schematic string BEFORE html template ────────────────────
    const _rl   = parseFloat(rl_mm) || 500;
    const _dia  = selectedTube ? parseFloat(selectedTube.tube_mm) : 50;
    const _isConicalTS = !!(selectedTube && selectedTube.conicity);
    const _isSpringTS  = !!(shaft && shaft.toLowerCase().includes("spring"));
    const _hasDriveTS  = !!drive;
    const _W = 660; const _H = 160; const _cx = _W / 2; const _cy = 70;
    const _BODY_W  = Math.min(Math.max(200, Math.min(400, _rl * 0.58)), 400);
    const _BODY_HR = Math.min(Math.max(28, _dia * 0.85), 60);
    const _BODY_HL = _isConicalTS ? Math.max(_BODY_HR * 0.55, 16) : _BODY_HR;
    const _bX  = _cx - _BODY_W / 2;
    const _bXR = _cx + _BODY_W / 2;
    const _tL  = _cy - _BODY_HL / 2; const _tR = _cy - _BODY_HR / 2;
    const _bL  = _cy + _BODY_HL / 2; const _bR = _cy + _BODY_HR / 2;
    const _SW  = Math.min(_BODY_HL * 0.22, 8);
    const _SE  = 38; const _DW = 20; const _DH = _BODY_HR + 18;
    const _acc = s.color || "#0F2340";
    const _rlLabel  = rl_mm
      ? (metric ? "RL = " + Math.round(_rl) + " mm" : 'RL = ' + (_rl/25.4).toFixed(2) + '"')
      : "RL = ?";
    const _diaLabel = metric ? "\u00D8" + _dia + " mm" : "\u00D8" + (_dia/25.4).toFixed(3) + '"';
    const _elHint   = rl_mm
      ? (_hasDriveTS ? "EL \u2248 RL + 40 mm" : _isSpringTS ? "EL = RL+10 mm \u00B7 AGL = RL+26 mm" : "EL = AGL = RL + 10 mm")
      : "";

    // groove positions
    const _gLabels = ["A","B","C","D"];
    const _gXs = _gLabels.slice(0, grooveCount).map((lbl, i) => {
      const p = groovePositions && groovePositions[lbl] ? parseFloat(groovePositions[lbl]) : null;
      return p && _rl > 0 ? _bX + (p / _rl) * _BODY_W : _bX + ((i+1) / (grooveCount+1)) * _BODY_W;
    });
    const _grooveSVG = _gXs.map((gx, i) => {
      const frac = (gx - _bX) / _BODY_W;
      const hT = _tL + (_tR - _tL) * frac;
      const hB = _bL + (_bR - _bL) * frac;
      const posLbl = groovePositions && groovePositions[_gLabels[i]] ? " " + groovePositions[_gLabels[i]] + "mm" : "";
      return '<line x1="' + gx + '" y1="' + (hT-1) + '" x2="' + gx + '" y2="' + (hB+1)
           + '" stroke="' + _acc + '" stroke-width="3.5" stroke-linecap="round"/>'
           + '<text x="' + gx + '" y="' + (hT-8) + '" text-anchor="middle" font-size="8" fill="'
           + _acc + '" font-weight="800">' + _gLabels[i] + posLbl + '</text>';
    }).join("");

    const _springL = _isSpringTS
      ? '<rect x="' + (_bX-_SE+6) + '" y="' + (_cy-8) + '" width="12" height="16" rx="2" fill="#fef3c7" stroke="#f59e0b" stroke-width="1.5"/>'
        + '<line x1="' + (_bX-_SE+9) + '" y1="' + (_cy-8) + '" x2="' + (_bX-_SE+9) + '" y2="' + (_cy+8) + '" stroke="#f59e0b" stroke-width="1.2"/>'
        + '<line x1="' + (_bX-_SE+13) + '" y1="' + (_cy-8) + '" x2="' + (_bX-_SE+13) + '" y2="' + (_cy+8) + '" stroke="#f59e0b" stroke-width="1.2"/>'
      : "";
    const _springR = (_isSpringTS && !_hasDriveTS)
      ? '<rect x="' + (_bXR+_SE-18) + '" y="' + (_cy-8) + '" width="12" height="16" rx="2" fill="#fef3c7" stroke="#f59e0b" stroke-width="1.5"/>'
        + '<line x1="' + (_bXR+_SE-15) + '" y1="' + (_cy-8) + '" x2="' + (_bXR+_SE-15) + '" y2="' + (_cy+8) + '" stroke="#f59e0b" stroke-width="1.2"/>'
        + '<line x1="' + (_bXR+_SE-11) + '" y1="' + (_cy-8) + '" x2="' + (_bXR+_SE-11) + '" y2="' + (_cy+8) + '" stroke="#f59e0b" stroke-width="1.2"/>'
      : "";
    const _driveSVG = _hasDriveTS
      ? '<line x1="' + _bXR + '" y1="' + _cy + '" x2="' + (_bXR+8) + '" y2="' + _cy
          + '" stroke="#475569" stroke-width="' + _SW + '" stroke-linecap="round"/>'
        + '<rect x="' + (_bXR+8) + '" y="' + (_cy-_DH/2) + '" width="' + _DW + '" height="' + _DH
          + '" rx="4" fill="#3b82f6" stroke="#1d4ed8" stroke-width="1.5"/>'
        + [0.2,0.5,0.8].map(t =>
            '<line x1="' + (_bXR+8+_DW*t) + '" y1="' + (_cy-_DH/2-6)
            + '" x2="' + (_bXR+8+_DW*t) + '" y2="' + (_cy-_DH/2)
            + '" stroke="#93c5fd" stroke-width="2.5" stroke-linecap="round"/>'
            + '<line x1="' + (_bXR+8+_DW*t) + '" y1="' + (_cy+_DH/2)
            + '" x2="' + (_bXR+8+_DW*t) + '" y2="' + (_cy+_DH/2+6)
            + '" stroke="#93c5fd" stroke-width="2.5" stroke-linecap="round"/>').join("")
        + '<text x="' + (_bXR+8+_DW/2) + '" y="' + (_cy+4)
          + '" text-anchor="middle" font-size="7" fill="#fff" font-weight="800">DRIVE</text>'
      : '<line x1="' + _bXR + '" y1="' + _cy + '" x2="' + (_bXR+_SE) + '" y2="' + _cy
          + '" stroke="#475569" stroke-width="' + _SW + '" stroke-linecap="round"/>' + _springR;

    const _sleeveSVG = (sleeve && sleeve !== "None")
      ? '<polygon points="' + _bX + ',' + (_tL-5) + ' ' + _bXR + ',' + (_tR-5) + ' '
          + _bXR + ',' + (_bR+5) + ' ' + _bX + ',' + (_bL+5)
          + '" fill="#f97316" opacity="0.25" stroke="#ea580c" stroke-width="1"/>'
        + '<text x="' + _cx + '" y="' + (_bR+30) + '" text-anchor="middle" font-size="8" fill="#ea580c" font-weight="700">Sleeve: ' + sleeve + '</text>'
      : "";
    const _conicLabel = _isConicalTS
      ? '<text x="' + _cx + '" y="' + (_tL-10) + '" text-anchor="middle" font-size="8" fill="#7c3aed" font-weight="700">CONICAL / TAPERED</text>'
      : "";
    const _elSVG = _elHint
      ? '<text x="' + (_W-8) + '" y="13" text-anchor="end" font-size="8" fill="#94a3b8">' + _elHint + '</text>'
      : "";

    const schematicSVG =
      '<div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:14px 16px 10px;margin-bottom:16px;">'
      + '<div style="font-size:10px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:0.6px;margin-bottom:8px;">Configuration Schematic</div>'
      + '<svg width="100%" viewBox="0 0 ' + _W + ' ' + _H + '" xmlns="http://www.w3.org/2000/svg" style="display:block;">'
      + '<defs>'
      + '<marker id="tsA" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto"><path d="M0,0 L7,3.5 L0,7 Z" fill="#94a3b8"/></marker>'
      + '<marker id="tsAL" markerWidth="7" markerHeight="7" refX="1" refY="3.5" orient="auto"><path d="M7,0 L0,3.5 L7,7 Z" fill="#94a3b8"/></marker>'
      + '<linearGradient id="tsGrad" x1="0" y1="0" x2="0" y2="1">'
      + '<stop offset="0%" stop-color="#e2e8f0"/><stop offset="40%" stop-color="#cbd5e1"/><stop offset="100%" stop-color="#94a3b8"/>'
      + '</linearGradient>'
      + '</defs>'
      + _conicLabel
      + '<line x1="' + (_bX-_SE) + '" y1="' + _cy + '" x2="' + _bX + '" y2="' + _cy
        + '" stroke="#475569" stroke-width="' + _SW + '" stroke-linecap="round"/>'
      + _springL
      + _driveSVG
      + _sleeveSVG
      + '<polygon points="' + _bX + ',' + _tL + ' ' + _bXR + ',' + _tR + ' ' + _bXR + ',' + _bR + ' ' + _bX + ',' + _bL
        + '" fill="url(#tsGrad)" stroke="#475569" stroke-width="2"/>'
      + '<rect x="' + _bX + '" y="' + (_tL+2) + '" width="13" height="' + (_BODY_HL-4) + '" rx="2" fill="#334155" opacity="0.85"/>'
      + '<rect x="' + (_bXR-13) + '" y="' + (_tR+2) + '" width="13" height="' + (_BODY_HR-4) + '" rx="2" fill="#334155" opacity="0.85"/>'
      + _grooveSVG
      + '<line x1="' + _bX + '" y1="' + (_bR+10) + '" x2="' + _bXR + '" y2="' + (_bR+10)
        + '" stroke="#94a3b8" stroke-width="1" marker-end="url(#tsA)" marker-start="url(#tsAL)"/>'
      + '<text x="' + _cx + '" y="' + (_bR+22) + '" text-anchor="middle" font-size="9" fill="#475569" font-weight="700">' + _rlLabel + '</text>'
      + '<line x1="' + (_bX-24) + '" y1="' + _tL + '" x2="' + (_bX-24) + '" y2="' + _bL
        + '" stroke="#94a3b8" stroke-width="1" marker-end="url(#tsA)" marker-start="url(#tsAL)"/>'
      + '<text x="' + (_bX-38) + '" y="' + _cy + '" text-anchor="middle" font-size="8" fill="#475569"'
        + ' transform="rotate(-90,' + (_bX-38) + ',' + _cy + ')">' + _diaLabel + '</text>'
      + _elSVG
      + '</svg>'
      + '</div>';

    const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8"/>
<title>Roller Spec Sheet — ${s.name}</title>
<style>
  body{font-family:'Segoe UI',Arial,sans-serif;margin:0;padding:0;color:#1e293b;}
  .header{background:#0F2340;color:#fff;padding:24px 36px;display:flex;justify-content:space-between;align-items:center;}
  .logo-text{font-size:20px;font-weight:900;letter-spacing:0.5px;}
  .logo-sub{font-size:10px;color:#C9A84C;font-weight:600;letter-spacing:1px;text-transform:uppercase;margin-top:3px;}
  .gold-bar{height:4px;background:#C9A84C;}
  .body{padding:28px 36px;}
  .title{font-size:19px;font-weight:800;color:#0F2340;margin-bottom:3px;}
  .subtitle{font-size:12px;color:#64748b;margin-bottom:20px;}
  .code-box{background:#0F2340;color:#e8c96d;font-family:'Courier New',monospace;font-size:15px;font-weight:800;padding:14px 20px;border-radius:8px;margin-bottom:20px;letter-spacing:0.5px;}
  .code-label{font-size:10px;color:rgba(255,255,255,0.5);font-weight:600;text-transform:uppercase;letter-spacing:0.8px;margin-bottom:5px;}
  table{width:100%;border-collapse:collapse;margin-bottom:20px;font-size:12px;}
  th{background:#f1f5f9;color:#475569;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;padding:8px 12px;text-align:left;border-bottom:2px solid #e2e8f0;}
  td{padding:8px 12px;border-bottom:1px solid #f1f5f9;}
  td:first-child{font-weight:600;color:#475569;width:38%;}
  .warn{background:#fffbeb;border:1px solid #fde68a;border-radius:6px;padding:8px 14px;font-size:10px;color:#92400e;margin-bottom:16px;}
  .footer{margin-top:32px;border-top:1px solid #e2e8f0;padding-top:12px;font-size:10px;color:#94a3b8;display:flex;justify-content:space-between;}
  .two-col{display:grid;grid-template-columns:1fr 1fr;gap:16px;}
  @media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact;}}
</style>
</head>
<body>
<div class="header">
  <div>
    <div class="logo-text">UNIKING CANADA</div>
    <div class="logo-sub">Interroll Authorized Partner</div>
  </div>
  <div style="text-align:right;font-size:11px;color:rgba(255,255,255,0.6)">
    Roller Spec Sheet<br/>Generated: ${new Date().toLocaleDateString('en-CA')}
  </div>
</div>
<div class="gold-bar"></div>
<div class="body">
  <div style="display:flex;align-items:center;gap:20px;margin-bottom:16px">
    ${s.image_url ? `<img src="${s.image_url}" style="height:72px;object-fit:contain;background:#f8fafc;border-radius:6px;padding:6px;border:1px solid #e2e8f0" alt="${s.name}" crossorigin="anonymous"/>` : ""}
    <div>
      <div class="title">${s.name} — ${s.subtitle}</div>
      <div class="subtitle">${s.duty} Duty · ${s.driveType}</div>
    </div>
  </div>
  <div class="code-box">
    <div class="code-label">Configuration Code</div>
    ${pc || "Incomplete — select all options"}
  </div>
  ${schematicSVG}
  <div class="warn">⚠ Pricing not included. Contact Uniking Canada for a formal quotation: <strong>514-886-5270 · sales@unikingcanada.com</strong></div>
  <div class="two-col">
    <table>
      <tr><th colspan="2">Selected Configuration</th></tr>
      <tr><td>Tube</td><td>${tube || "—"}</td></tr>
      <tr><td>Material</td><td>${material || "—"}</td></tr>
      <tr><td>Shaft Type</td><td>${shaft || "—"}</td></tr>
      ${drive ? `<tr><td>Drive Head</td><td>${drive}</td></tr>` : ""}
      ${sleeve && sleeve !== "None" ? `<tr><td>Sleeve</td><td>${sleeve}</td></tr>` : ""}
      ${grooveCount > 0 ? `<tr><td>Grooves</td><td>${grooveCount} groove(s)</td></tr>` : ""}
      <tr><td>Roller Length (RL)</td><td>${rlDisp}</td></tr>
      <tr><td>Quantity</td><td>${qty} pc${qty > 1 ? "s" : ""}</td></tr>
      ${notes ? `<tr><td>Notes</td><td>${notes}</td></tr>` : ""}
    </table>
    <table>
      <tr><th colspan="2">Series Technical Data</th></tr>
      <tr><td>Max Load</td><td>${s.maxLoad_N ? s.maxLoad_N + " N" : "—"}</td></tr>
      <tr><td>Max Speed</td><td>${s.maxSpeed_ms ? s.maxSpeed_ms + " m/s" : "—"}</td></tr>
      <tr><td>Temperature Range</td><td>${s.temp_min_C !== undefined ? s.temp_min_C + "°C to +" + s.temp_max_C + "°C" : "—"}</td></tr>
      <tr><td>Drive Type</td><td>${s.driveType || "—"}</td></tr>
      <tr><td>Antistatic</td><td>${s.antistatic || "—"}</td></tr>
      <tr><td>Catalog Ref.</td><td>Pages ${s.page_range || "—"}</td></tr>
    </table>
  </div>
  ${s.notes ? `<div style="margin-top:8px;padding:10px 14px;background:#f8fafc;border-radius:6px;border:1px solid #e2e8f0;font-size:11px;color:#475569"><strong>Notes:</strong> ${s.notes}</div>` : ""}
  <div class="footer">
    <span>Uniking Canada Inc. · 12985 Rue Brault, Mirabel, QC J7J 0W2 · 514-886-5270 · www.unikingcanada.com</span>
    <span>Source: Interroll Conveyor Roller Catalog 2026</span>
  </div>
</div>
</body>
</html>`;
    const win = window.open("", "_blank");
    if (win) { win.document.write(html); win.document.close(); setTimeout(() => win.print(), 500); }
  }

  function handleAdd() {
    const item = {
      cartId: "roller_" + Date.now(),
      _source: "interroll_config",
      name: `${s.name} — Configured`,
      series: s.name,
      type: "Conveyor Roller",
      style: s.subtitle,
      category: s.duty + " Duty",
      image_url: s.image_url,
      materials: material || "",
      quantity: qty,
      unit: "Each",
      notes: buildSummary(),
    };
    try {
      const ex = JSON.parse(localStorage.getItem("uniking_rfq_cart") || "[]");
      localStorage.setItem("uniking_rfq_cart", JSON.stringify([...ex, item]));
      window.dispatchEvent(new Event("rfq_cart_updated"));
    } catch(e) {}
    setDone(true);
  }

  const rlNum = parseFloat(rl_mm);

  if (done) return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.65)", zIndex: 1100, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: "#fff", borderRadius: 16, padding: "40px 32px", textAlign: "center", maxWidth: 400 }}>
        <div style={{ fontSize: 52, marginBottom: 16 }}>✅</div>
        <div style={{ fontSize: 18, fontWeight: 800, color: C.text, marginBottom: 8 }}>Added to RFQ Cart!</div>
        <div style={{ fontSize: 13, color: C.muted, marginBottom: 24 }}>{s.name} — {qty} pc{qty > 1 ? "s" : ""}</div>
        <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
          <button onClick={onClose} style={{ padding: "10px 20px", background: C.border, color: C.text, border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 600 }}>Back</button>
          <a href="#" onClick={e => { e.preventDefault(); onGoRFQ(); }} style={{ padding: "10px 20px", background: C.gold, color: C.navy, border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 800, textDecoration: "none" }}>View RFQ Cart →</a>
        </div>
      </div>
    </div>
  );

  const SLabel = ({ children }) => <div style={{ fontWeight: 700, fontSize: 12, color: C.muted, textTransform: "uppercase", letterSpacing: "0.4px", marginBottom: 6, marginTop: 14 }}>{children}</div>;
  const sel = { padding: "9px 12px", borderRadius: 8, border: "1px solid " + C.border, fontSize: 13, width: "100%", cursor: "pointer", background: "#fff" };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.65)", zIndex: 1100, display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "16px", overflowY: "auto" }}>
      <div style={{ background: "#fff", borderRadius: 16, width: "100%", maxWidth: 640, width: "calc(100vw - 32px)", boxShadow: "0 24px 80px rgba(0,0,0,0.3)", marginBottom: 16 }}>

        {/* Header */}
        <div style={{ background: C.navy, borderRadius: "16px 16px 0 0", padding: "20px 24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ color: C.gold, fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 4 }}>Configure Roller</div>
            <div style={{ color: "#fff", fontSize: 17, fontWeight: 900 }}>{s.name}</div>
            <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 12, marginTop: 2 }}>{s.subtitle}</div>
          </div>
          <button onClick={onClose} style={{ background: "rgba(255,255,255,0.15)", border: "none", borderRadius: "50%", width: 34, height: 34, cursor: "pointer", color: "#fff", fontSize: 18 }}>✕</button>
        </div>

        {/* Live summary bar */}
        {(tube || shaft || drive) && (
          <div style={{ background: "#1e293b", padding: "10px 20px", fontSize: 11, color: "#94a3b8", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
            <span style={{ color: C.gold, fontWeight: 700 }}>Summary: </span>{buildSummary()}
          </div>
        )}

        <div style={{ padding: "16px 24px 24px" }}>

          {/* ── LIVE ROLLER PREVIEW ─────────────────────────────── */}
          <div style={{ background: "#0F2340", borderRadius: 10, padding: "14px 14px 10px", marginBottom: 16, border: "1px solid rgba(255,255,255,0.08)" }}>
            <div style={{ fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 6, textAlign: "center" }}>Live Schematic Preview</div>
            <RollerDrawing
              tubeDia_mm={selectedTube ? selectedTube.tube_mm : null}
              rl_mm={rl_mm || null}
              shaftType={shaft || ""}
              hasDrive={!!drive}
              driveLabel={drive}
              metric={metric}
              grooveCount={grooveCount}
              groovePositions={groovePositions}
              isConical={selectedTube && selectedTube.conicity ? true : false}
              sleeveType={sleeve && sleeve !== "None" ? sleeve : null}
              seriesColor={s.color}
            />
          </div>

          {/* Tube */}
          <SLabel>1. Select Tube</SLabel>
          <select style={sel} value={tube || ""} onChange={e => { setTube(e.target.value); setMaterial(null); setDrive(null); }}>
            <option value="">— Select tube diameter & wall —</option>
            {s.tubes.map(t => <option key={t.label} value={t.label}>{t.label}</option>)}
          </select>

          {/* Material */}
          {selectedTube && selectedTube.materials && selectedTube.materials.length > 1 && (
            <>
              <SLabel>2. Tube Material</SLabel>
              <select style={sel} value={material || ""} onChange={e => setMaterial(e.target.value)}>
                <option value="">— Select material —</option>
                {selectedTube.materials.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </>
          )}

          {/* Shaft */}
          <SLabel>{selectedTube && selectedTube.materials && selectedTube.materials.length > 1 ? "3." : "2."} Shaft Type</SLabel>
          <select style={sel} value={shaft || ""} onChange={e => setShaft(e.target.value)}>
            <option value="">— Select shaft type —</option>
            {s.shafts.map(sh => <option key={sh.label} value={sh.label}>{sh.label}</option>)}
          </select>

          {/* Drive head (if applicable) */}
          {s.sprockets && s.sprockets.drives && (
            <>
              <SLabel>Drive Head</SLabel>
              {selectedTube && selectedTube.note && <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 6, padding: "6px 10px", fontSize: 11, color: "#92400e", marginBottom: 6 }}>⚠ {selectedTube.note}</div>}
              <select style={sel} value={drive || ""} onChange={e => setDrive(e.target.value)}>
                <option value="">— Select drive head —</option>
                {s.sprockets.drives.map(d => <option key={d.label} value={d.label}>{d.label}</option>)}
              </select>
              {selectedDrive && (
                <div style={{ marginTop: 6, padding: "8px 12px", background: "#f0f9ff", borderRadius: 6, fontSize: 11, color: "#1e40af" }}>
                  {selectedDrive.EL_formula && <span>EL formula: <strong>{selectedDrive.EL_formula}</strong></span>}
                  {selectedDrive.max_load_N && <span style={{ marginLeft: 12, color: "#dc2626", fontWeight: 700 }}>Max load: {fmt.load(selectedDrive.max_load_N)}</span>}
                </div>
              )}
            </>
          )}

          {/* Sleeve */}
          {s.sleeves && s.sleeves.length > 1 && (
            <>
              <SLabel>Sleeve / Surface Treatment</SLabel>
              <select style={sel} value={sleeve} onChange={e => setSleeve(e.target.value)}>
                {s.sleeves.map(sl => <option key={sl} value={sl}>{sl}</option>)}
              </select>
            </>
          )}

          {/* Grooves */}
          {hasGrooves && groovedTube && (
            <div style={{ marginTop: 14, padding: "12px 16px", background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 10 }}>
              <div style={{ fontWeight: 700, fontSize: 12, color: "#15803d", marginBottom: 8 }}>Round Belt Grooves (optional)</div>
              <div style={{ fontSize: 11, color: "#166534", marginBottom: 10 }}>Max {s.grooves.max_grooves} grooves. Positions measured from drive side. Max load with grooves: {fmt.load(300)}.</div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                <span style={{ fontSize: 12, fontWeight: 600 }}>Number of grooves:</span>
                {[0,1,2,3,4].slice(0, s.grooves.max_grooves + 1).map(n => (
                  <button key={n} onClick={() => setGrooveCount(n)}
                    style={{ width: 32, height: 32, borderRadius: 8, border: `2px solid ${grooveCount === n ? "#16a34a" : "#d1d5db"}`,
                      background: grooveCount === n ? "#16a34a" : "#fff", color: grooveCount === n ? "#fff" : C.text,
                      cursor: "pointer", fontWeight: 700, fontSize: 13 }}>{n}</button>
                ))}
              </div>
              {grooveCount > 0 && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  {["A","B","C","D"].slice(0, grooveCount).map(pos => (
                    <div key={pos}>
                      <div style={{ fontSize: 11, fontWeight: 600, color: "#166534", marginBottom: 4 }}>Position {pos} from drive side ({metric ? "mm" : "in"})</div>
                      <input type="number" placeholder={metric ? "e.g. 100" : "e.g. 3.94"}
                        value={groovePositions[pos]}
                        onChange={e => setGroovePositions(p => ({ ...p, [pos]: e.target.value }))}
                        style={{ ...sel, width: "100%", boxSizing: "border-box" }} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Roller length */}
          <SLabel>Reference Length (RL)</SLabel>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <input type="number" placeholder={metric ? "e.g. 600" : "e.g. 23.62"}
              value={rl_mm}
              onChange={e => setRl_mm(metric ? e.target.value : String(parseFloat(e.target.value) * 25.4))}
              style={{ ...sel, flex: 1 }} />
            <span style={{ fontSize: 13, color: C.muted, whiteSpace: "nowrap" }}>{metric ? "mm" : "inches"}</span>
          </div>
          {rl_mm && shaft && (
            <div style={{ marginTop: 6, padding: "8px 12px", background: "#f8fafc", borderRadius: 6, fontSize: 11, color: C.muted }}>
              {selectedDrive ? (
                <span>EL ≈ <strong>{metric ? `${Math.round(parseFloat(rl_mm) + 40)} mm` : `${((parseFloat(rl_mm) + 40)/25.4).toFixed(2)}"`}</strong> (per {selectedDrive.EL_formula})</span>
              ) : shaft && shaft.includes("spring") ? (
                <span>EL = <strong>{metric ? `${Math.round(parseFloat(rl_mm) + 10)} mm` : `${((parseFloat(rl_mm)+10)/25.4).toFixed(2)}"`}</strong> · AGL = <strong>{metric ? `${Math.round(parseFloat(rl_mm) + 26)} mm` : `${((parseFloat(rl_mm)+26)/25.4).toFixed(2)}"`}</strong></span>
              ) : (
                <span>EL = AGL = <strong>{metric ? `${Math.round(parseFloat(rl_mm) + 10)} mm` : `${((parseFloat(rl_mm)+10)/25.4).toFixed(2)}"`}</strong></span>
              )}
            </div>
          )}

          {/* Quantity */}
          <SLabel>Quantity</SLabel>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <button onClick={() => setQty(q => Math.max(1, q-1))} style={{ width: 36, height: 36, borderRadius: 8, border: "1px solid " + C.border, background: "#fff", cursor: "pointer", fontSize: 18 }}>−</button>
            <span style={{ fontSize: 16, fontWeight: 700, minWidth: 40, textAlign: "center" }}>{qty}</span>
            <button onClick={() => setQty(q => q+1)} style={{ width: 36, height: 36, borderRadius: 8, border: "1px solid " + C.border, background: "#fff", cursor: "pointer", fontSize: 18 }}>+</button>
            <span style={{ fontSize: 13, color: C.muted }}>pieces</span>
          </div>

          {/* Notes */}
          <SLabel>Special Notes / Requirements</SLabel>
          <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="e.g. carbonitrided surface, flanged tube, specific shaft material, IP55..."
            style={{ ...sel, minHeight: 64, resize: "vertical" }} />

          {/* Generated Part Code */}
          {tube && shaft && (
            <div style={{ marginTop: 18, background: C.navy, borderRadius: 10, padding: "14px 18px" }}>
              <div style={{ fontSize: 9, color: "rgba(255,255,255,0.5)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 6 }}>Configuration Code</div>
              <div style={{ fontFamily: "monospace", fontSize: 13, fontWeight: 800, color: C.goldLight, letterSpacing: "0.3px", lineHeight: 1.6, wordBreak: "break-all" }}>{buildPartCode()}</div>
              <button onClick={() => navigator.clipboard.writeText(buildPartCode() || "")}
                style={{ marginTop: 8, padding: "4px 12px", background: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.7)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 6, cursor: "pointer", fontSize: 11, fontWeight: 600 }}>
                Copy Code
              </button>
            </div>
          )}

          {/* Action buttons */}
          <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
            <button onClick={handlePrintTearSheet}
              style={{ flex: 1, padding: "11px", background: tube && shaft ? C.gold : "#e5e7eb", color: tube && shaft ? C.navy : "#9ca3af",
                border: "none", borderRadius: 10, cursor: tube && shaft ? "pointer" : "default",
                fontSize: 13, fontWeight: 800, transition: "background 0.15s" }}>
              Print Tear Sheet
            </button>
            <button onClick={handleAdd} disabled={!tube || !shaft}
              style={{ flex: 2, padding: "11px", background: tube && shaft ? s.color : "#e5e7eb",
                color: tube && shaft ? "#fff" : "#9ca3af", border: "none", borderRadius: 10, cursor: tube && shaft ? "pointer" : "not-allowed",
                fontSize: 14, fontWeight: 800, transition: "background 0.15s" }}>
              {tube && shaft ? "Add to RFQ" : "Select tube and shaft to continue"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── UNIT TOGGLE ──────────────────────────────────────────────────────────────
function UnitToggle({ metric, setMetric }) {
  return (
    <div style={{ display: "flex", background: "rgba(255,255,255,0.1)", borderRadius: 8, padding: 3, gap: 2 }}>
      {[["Metric (SI)", true], ["Imperial", false]].map(([label, val]) => (
        <button key={label} onClick={() => setMetric(val)}
          style={{ padding: "5px 14px", borderRadius: 6, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 700, transition: "all 0.15s",
            background: metric === val ? C.gold : "transparent",
            color: metric === val ? C.navy : "rgba(255,255,255,0.8)" }}>
          {label}
        </button>
      ))}
    </div>
  );
}

// ─── SERIES CARD ─────────────────────────────────────────────────────────────
function SeriesCard({ s, onView, onConfigure, fmt }) {
  const [hov, setHov] = useState(false);
  const [imgErr, setImgErr] = useState(false);

  return (
    <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ background: "#fff", borderRadius: 14, border: `2px solid ${hov ? s.color : C.border}`, overflow: "hidden",
        transition: "all 0.18s", boxShadow: hov ? `0 10px 30px ${s.color}20` : "0 1px 4px rgba(0,0,0,0.06)",
        transform: hov ? "translateY(-3px)" : "none", display: "flex", flexDirection: "column" }}>

      {/* Image */}
      <div style={{ height: 180, background: "#f0f4f8", overflow: "hidden", position: "relative", cursor: "pointer" }}
        onClick={() => onView(s)}>
        {s.image_url && !imgErr ? (
          <img src={s.image_url} alt={s.name} onError={() => setImgErr(true)}
            style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.3s", transform: hov ? "scale(1.04)" : "scale(1)" }} />
        ) : <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", fontSize: 40, color: s.color + "40" }}>⚙</div>}
        <div style={{ position: "absolute", top: 10, left: 10, background: s.color, color: "#fff", fontSize: 9, fontWeight: 800, padding: "3px 9px", borderRadius: 20 }}>{s.duty.toUpperCase()} DUTY</div>
        <div style={{ position: "absolute", bottom: 8, right: 8, background: "rgba(0,0,0,0.5)", color: "#fff", fontSize: 9, padding: "2px 7px", borderRadius: 10 }}>pp. {s.page_range}</div>
        {s.grooves && typeof s.grooves === "object" && <div style={{ position: "absolute", top: 10, right: 10, background: C.green, color: "#fff", fontSize: 9, fontWeight: 800, padding: "2px 8px", borderRadius: 10 }}>GROOVES</div>}
      </div>

      {/* Body */}
      <div style={{ padding: "12px 14px", flex: 1, display: "flex", flexDirection: "column", gap: 6, cursor: "pointer" }} onClick={() => onView(s)}>
        <div style={{ fontSize: 14, fontWeight: 800, color: C.text }}>{s.name}</div>
        <div style={{ fontSize: 11, color: C.muted }}>{s.subtitle}</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
          {s.tags.map(t => <span key={t} style={{ background: s.color + "15", color: s.color, fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 16 }}>{t}</span>)}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px 8px", fontSize: 11, marginTop: 2 }}>
          <div><span style={{ color: C.muted }}>Max Load </span><strong>{fmt.load(s.maxLoad_N)}</strong></div>
          <div><span style={{ color: C.muted }}>Max Speed </span><strong>{fmt.speed(s.maxSpeed_ms)}</strong></div>
          <div><span style={{ color: C.muted }}>Temp </span><strong>{fmt.tempC(s.temp_min_C)} / {fmt.tempC(s.temp_max_C)}</strong></div>
          <div><span style={{ color: C.muted }}>Tubes </span><strong>{s.tubes.length} options</strong></div>
        </div>
      </div>

      {/* Two buttons */}
      <div style={{ padding: "10px 14px", borderTop: "1px solid " + C.border, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        <button onClick={() => onView(s)}
          style={{ padding: "8px", background: "#f1f5f9", color: C.navyMid, border: "none", borderRadius: 8, cursor: "pointer", fontSize: 12, fontWeight: 700 }}>
          Full Specs
        </button>
        <button onClick={() => onConfigure(s)}
          style={{ padding: "8px", background: s.color, color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontSize: 12, fontWeight: 800 }}>
          Configure →
        </button>
      </div>
    </div>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
function RollerConfigView({ onBack, onGoRFQ }) {
  const [metric, setMetric] = useState(true);
  const fmt = makeFmt(metric);
  const [dutyFilter, setDutyFilter] = useState("All");
  const [viewing, setViewing] = useState(null);
  const [configuring, setConfiguring] = useState(null);

  const filtered = SERIES.filter(s => dutyFilter === "All" || s.duty === dutyFilter);

  return (
    <div style={{ background: C.bg, minHeight: "100vh", fontFamily: "'Inter','Segoe UI',sans-serif" }}>

      {/* Top nav */}
      <div style={{ background: C.navy, borderBottom: "3px solid " + C.gold, position: "sticky", top: 0, zIndex: 200 }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 clamp(12px,4vw,20px)", display: "flex", alignItems: "center", justifyContent: "space-between", height: 56 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <a href="#" onClick={e => { e.preventDefault(); onBack(); }} style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 28, height: 28, background: C.gold, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ color: C.navy, fontWeight: 900, fontSize: 13 }}>U</span>
              </div>
              <span style={{ color: "#fff", fontWeight: 700, fontSize: 15 }}>UniKonnect</span>
            </a>
            <div style={{ width: 1, height: 22, background: "rgba(255,255,255,0.15)" }} />
            <span style={{ color: C.gold, fontSize: 13, fontWeight: 600 }}>Interroll Roller Configurator</span>
          </div>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <UnitToggle metric={metric} setMetric={setMetric} />
            <a href="#" onClick={e => { e.preventDefault(); onGoRFQ(); }} style={{ background: C.gold, color: C.navy, padding: "7px 16px", borderRadius: 8, fontSize: 13, fontWeight: 700, textDecoration: "none" }}>RFQ Cart</a>
          </div>
        </div>
      </div>

      {/* Hero */}
      <div style={{ background: `linear-gradient(135deg, ${C.navy} 0%, ${C.navyLight} 100%)`, padding: "32px 20px 28px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ color: C.gold, fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", marginBottom: 6 }}>Interroll Authorized Partner — 2026 Catalog</div>
          <h1 style={{ color: "#fff", fontSize: 24, fontWeight: 900, margin: "0 0 8px" }}>Conveyor Roller Series</h1>
          <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 13, margin: "0 0 20px", maxWidth: 520 }}>
            Complete specifications for all {SERIES.length} series — real tube dimensions, groove positions, sprocket sizes, load tables, and dimension formulas from the official Interroll 2026 catalog.
          </p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {["All", "Light", "Medium", "Heavy"].map(f => (
              <button key={f} onClick={() => setDutyFilter(f)}
                style={{ padding: "7px 18px", borderRadius: 20, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 700,
                  background: dutyFilter === f ? C.gold : "rgba(255,255,255,0.12)",
                  color: dutyFilter === f ? C.navy : "rgba(255,255,255,0.8)" }}>
                {f === "All" ? `All (${SERIES.length})` : `${f} Duty`}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "24px clamp(12px,4vw,28px) 60px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(270px, 1fr))", gap: 18 }}>
          {filtered.map(s => (
            <SeriesCard key={s.id} s={s} fmt={fmt} onView={setViewing} onConfigure={setConfiguring} />
          ))}
        </div>
      </div>

      {/* Modals */}
      {viewing && !configuring && (
        <DetailModal s={viewing} onClose={() => setViewing(null)} onConfigure={(s) => { setViewing(null); setConfiguring(s); }} fmt={fmt} metric={metric} />
      )}
      {configuring && (
        <ConfigModal s={configuring} onClose={() => setConfiguring(null)} fmt={fmt} metric={metric} />
      )}
    </div>
  );
}


// ═══════════════════════════════════════════════════════════════════════════════
// ── RFQ CART VIEW ─────────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════
const LOGO_URL = "https://media.base44.com/images/public/69dd9ffccab4dd693d4d92f5/e48ee59d9_Unitingthestrongestlinks_20251031_225809_0000.png";
const UNIT_OPTIONS = ["Feet", "Meters", "Pieces", "Sets", "Rolls", "Inches", "Yards", "Each"];

// getRFQCart/saveRFQCart defined above

// ── Small components ──────────────────────────────────────────────────────────
function Label({ children, required }) {
  return (
    <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: 6 }}>
      {children}{required && <span style={{ color: "#ef4444", marginLeft: 2 }}>*</span>}
    </div>
  );
}

function FieldInput({ value, onChange, placeholder, type = "text", required }) {
  const [focused, setFocused] = useState(false);
  return (
    <input type={type} value={value} onChange={onChange} placeholder={placeholder} required={required}
      onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
      style={{ width: "100%", boxSizing: "border-box", padding: "12px 14px", borderRadius: 8,
        border: "1.5px solid " + (focused ? C.accent : C.border), fontSize: 15, color: C.text,
        outline: "none", background: "#fff", WebkitAppearance: "none" }} />
  );
}

function StepBar({ step }) {
  const steps = ["Cart", "Details", "Submit"];
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 28 }}>
      {steps.map((label, i) => {
        const active = i === step, done = i < step;
        return (
          <div key={i} style={{ display: "flex", alignItems: "center" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
              <div style={{ width: 34, height: 34, borderRadius: "50%", background: done ? "#16a34a" : active ? NAVY : "#e2e8f0", color: done || active ? "#fff" : "#94a3b8", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 800 }}>
                {done ? "✓" : i + 1}
              </div>
              <div style={{ fontSize: 11, fontWeight: active ? 700 : 500, color: active ? NAVY : done ? "#16a34a" : "#94a3b8" }}>{label}</div>
            </div>
            {i < steps.length - 1 && <div style={{ width: 56, height: 2, background: done ? "#16a34a" : "#e2e8f0", margin: "0 4px", marginBottom: 18 }} />}
          </div>
        );
      })}
    </div>
  );
}

// ── Normalize all catalog sources to a unified shape ─────────────────────────
function normalizeForSearch(records) {
  const out = [];
  for (const r of records) {
    if (r._source) { out.push(r); continue; } // already normalized
    // CatalogProduct (Intralox belts)
    if (r.series && r.pitch_in !== undefined) {
      out.push({ id: r.id, _source: "catalogproduct", series: r.series, type: "Modular Belt", style: r.style || "", category: r.category || "", image_url: r.image_url || "", materials: r.materials || "" });
    }
    // ElevatorBucket
    else if (r.bucket_sizes !== undefined) {
      out.push({ id: r.id, _source: "elevbucket", series: r.series || r.style || "", type: "Elevator Bucket", style: r.style || "", category: r.profile || "", image_url: r.image_url || "", materials: r.material || "" });
    }
    // UniCatalog
    else if (r.product_type !== undefined && r.series !== undefined) {
      out.push({ id: r.id, _source: "unicatalog", series: r.series || r.model_code || "", type: r.product_type || "", style: r.style || "", category: r.application || "", image_url: r.image_url || "", materials: r.materials || "" });
    }
    // MacChainProduct
    else if (r.part_number !== undefined) {
      out.push({ id: r.id, _source: "mac", series: r.part_number, type: r.product_type || r.category || "Chain", style: r.subcategory || "", category: r.category || "", image_url: r.product_image || "", materials: "" });
    }
  }
  return out;
}

// ── Inline product search panel ───────────────────────────────────────────────
function AddProductPanel({ cartItems, onAdd, onClose }) {
  const [query, setQuery] = useState("");
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCustom, setShowCustom] = useState(false);
  const [customDesc, setCustomDesc] = useState("");
  const [customType, setCustomType] = useState("");
  const [customQty, setCustomQty] = useState("1");
  const [customUnit, setCustomUnit] = useState("Pieces");
  const searchRef = useRef();

  useEffect(() => {
    searchRef.current?.focus();
    (async () => {
      try {
        async function fetchAll(entity) {
          let all = [], skip = 0, hasMore = true;
          while (hasMore) {
            const batch = await entity.list({ limit: 500, skip });
            all = [...all, ...batch];
            hasMore = batch.length === 500;
            skip += batch.length;
          }
          return all;
        }
        const [cats, uni, elev, mac] = await Promise.all([
          fetchAll(CatalogProduct),
          fetchAll(UniCatalog),
          fetchAll(ElevatorBucket),
          fetchAll(MacChainProduct),
        ]);
        setAllProducts(normalizeForSearch([...cats, ...uni, ...elev, ...mac]));
      } catch (e) { console.error(e); }
      setLoading(false);
    })();
  }, []);

  const cartIds = new Set(cartItems.map(i => i.id + "_" + (i._source || "")));

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];

    // Build searchable string for each product
    function searchStr(p) {
      return [p.series, p.type, p.style, p.category, p.materials, p.application]
        .filter(Boolean).join(" ").toLowerCase();
    }

    // Fuzzy score: rewards consecutive matches and word-boundary matches
    function fuzzyScore(str, pattern) {
      let score = 0, si = 0, pi = 0, lastMatch = -1, consecutive = 0;
      while (si < str.length && pi < pattern.length) {
        if (str[si] === pattern[pi]) {
          // Bonus for consecutive chars
          consecutive++;
          score += consecutive * 2;
          // Bonus for word boundary (start of word)
          if (si === 0 || str[si - 1] === " " || str[si - 1] === "-") score += 5;
          // Bonus for matching at start of string
          if (si === 0) score += 8;
          lastMatch = si;
          pi++;
        } else {
          consecutive = 0;
        }
        si++;
      }
      // All pattern chars matched?
      if (pi < pattern.length) return -1;
      // Penalise long gaps
      score -= str.length * 0.1;
      return score;
    }

    const words = q.split(/\s+/);

    const scored = allProducts.map(p => {
      const str = searchStr(p);
      // Multi-word: each word must match somewhere
      if (words.length > 1) {
        const allMatch = words.every(w => str.includes(w));
        if (!allMatch) {
          // Try fuzzy for each word
          const allFuzzy = words.every(w => fuzzyScore(str, w) >= 0);
          if (!allFuzzy) return null;
        }
        // Score = sum of individual word scores
        const total = words.reduce((acc, w) => acc + Math.max(fuzzyScore(str, w), 0), 0);
        return { product: p, score: total };
      }
      // Single word fuzzy
      const s = fuzzyScore(str, q);
      if (s < 0) return null;
      return { product: p, score: s };
    }).filter(Boolean);

    return scored
      .sort((a, b) => b.score - a.score)
      .slice(0, 30)
      .map(s => s.product);
  }, [query, allProducts]);

  function handleAdd(product) {
    onAdd(product);
  }

  function handleAddCustom() {
    if (!customDesc.trim()) return;
    const customItem = {
      cartId: "custom_" + Date.now(),
      id: "custom_" + Date.now(),
      _source: "custom",
      series: customDesc.trim(),
      name: customDesc.trim(),
      type: customType.trim() || "Custom Item",
      style: "",
      category: "Custom",
      image_url: "",
      materials: "",
      quantity: parseInt(customQty) || 1,
      unit: customUnit,
      notes: "",
    };
    onAdd(customItem);
    setCustomDesc(""); setCustomType(""); setCustomQty("1"); setShowCustom(false);
  }

  return (
    <div style={{ background: "#fff", border: "1.5px solid " + C.accent, borderRadius: 12, overflow: "hidden", marginBottom: 16 }}>
      {/* Search header */}
      <div style={{ padding: "14px 16px", borderBottom: "1px solid " + C.border, background: "#eff6ff" }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: C.accent, marginBottom: 10 }}>Search Catalog</div>
        <input
          ref={searchRef}
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Type a product name, series, or category…"
          style={{ width: "100%", boxSizing: "border-box", padding: "10px 14px", borderRadius: 8, border: "1.5px solid " + C.accent, fontSize: 14, outline: "none", background: "#fff" }}
        />
        {loading && <div style={{ fontSize: 12, color: C.muted, marginTop: 8 }}>Loading catalog…</div>}
        {!loading && query.trim() && filtered.length === 0 && (
          <div style={{ fontSize: 12, color: C.muted, marginTop: 8 }}>No matches found. Try a different term or add a custom item below.</div>
        )}
      </div>

      {/* Search results */}
      {filtered.length > 0 && (
        <div style={{ maxHeight: 280, overflowY: "auto" }}>
          {filtered.map((p, i) => {
            const inCart = cartIds.has(p.id + "_" + (p._source || ""));
            return (
              <div key={p.id + i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 16px", borderBottom: "1px solid #f8fafc", background: inCart ? "#f0fdf4" : "#fff" }}>
                {p.image_url ? (
                  <img src={p.image_url} alt="" style={{ width: 40, height: 36, objectFit: "contain", borderRadius: 4, background: "#f8fafc", flexShrink: 0 }} onError={e => e.target.style.display = "none"} />
                ) : (
                  <div style={{ width: 40, height: 36, borderRadius: 4, background: "#f1f5f9", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, color: "#cbd5e1" }}>⛓</div>
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: NAVY, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.series}</div>
                  <div style={{ fontSize: 11, color: C.muted }}>{p.type}{p.style ? " · " + p.style : ""}{p.category ? " · " + p.category : ""}</div>
                </div>
                <button onClick={() => !inCart && handleAdd(p)} disabled={inCart}
                  style={{ padding: "5px 12px", borderRadius: 6, fontSize: 11, fontWeight: 700, cursor: inCart ? "default" : "pointer", flexShrink: 0, border: inCart ? "1px solid #16a34a" : "1px solid " + C.accent, background: inCart ? "#f0fdf4" : C.accent, color: inCart ? "#16a34a" : "#fff", whiteSpace: "nowrap" }}>
                  {inCart ? "✓ Added" : "+ Add"}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Custom item section */}
      <div style={{ borderTop: filtered.length > 0 ? "1px solid " + C.border : "none" }}>
        {!showCustom ? (
          <button onClick={() => setShowCustom(true)}
            style={{ width: "100%", padding: "12px 16px", background: "none", border: "none", cursor: "pointer", fontSize: 13, fontWeight: 700, color: C.muted, textAlign: "left", display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 18, color: C.muted }}>✏️</span> Can't find it? Add a custom item
          </button>
        ) : (
          <div style={{ padding: "14px 16px", background: "#fafafa", borderTop: "1px solid " + C.border }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: NAVY, marginBottom: 12 }}>Custom / Non-Catalog Item</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div>
                <Label required>Description</Label>
                <input value={customDesc} onChange={e => setCustomDesc(e.target.value)}
                  placeholder="e.g. Custom conveyor belt, 24in wide, food-grade…"
                  style={{ width: "100%", boxSizing: "border-box", padding: "10px 12px", borderRadius: 7, border: "1px solid " + C.border, fontSize: 13, outline: "none" }} />
              </div>
              <div>
                <Label>Product Type / Category</Label>
                <input value={customType} onChange={e => setCustomType(e.target.value)}
                  placeholder="e.g. Chain, Belt, Sprocket, Bucket…"
                  style={{ width: "100%", boxSizing: "border-box", padding: "10px 12px", borderRadius: 7, border: "1px solid " + C.border, fontSize: 13, outline: "none" }} />
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <div style={{ flex: 1 }}>
                  <Label>Qty</Label>
                  <input type="number" min="1" value={customQty} onChange={e => setCustomQty(e.target.value)}
                    style={{ width: "100%", boxSizing: "border-box", padding: "10px 12px", borderRadius: 7, border: "1px solid " + C.border, fontSize: 13, outline: "none" }} />
                </div>
                <div style={{ flex: 1 }}>
                  <Label>Unit</Label>
                  <select value={customUnit} onChange={e => setCustomUnit(e.target.value)}
                    style={{ width: "100%", boxSizing: "border-box", padding: "10px 12px", borderRadius: 7, border: "1px solid " + C.border, fontSize: 13, outline: "none", background: "#fff" }}>
                    {UNIT_OPTIONS.map(u => <option key={u}>{u}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => setShowCustom(false)}
                  style={{ flex: 1, padding: "10px", borderRadius: 7, border: "1px solid " + C.border, background: "#fff", color: C.muted, fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
                  Cancel
                </button>
                <button onClick={handleAddCustom} disabled={!customDesc.trim()}
                  style={{ flex: 2, padding: "10px", borderRadius: 7, border: "none", background: customDesc.trim() ? NAVY : "#e2e8f0", color: customDesc.trim() ? "#fff" : "#94a3b8", fontWeight: 800, fontSize: 13, cursor: customDesc.trim() ? "pointer" : "default" }}>
                  Add Custom Item
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Close panel */}
      <div style={{ padding: "10px 16px", borderTop: "1px solid " + C.border, textAlign: "right" }}>
        <button onClick={onClose} style={{ background: "none", border: "none", color: C.muted, fontSize: 13, cursor: "pointer", fontWeight: 600 }}>✕ Close</button>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
function RFQCartView({ onBack }) {
  const [step, setStep] = useState(0);
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ name: "", company: "", email: "", phone: "", notes: "" });
  const [attachments, setAttachments] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [removeAnim, setRemoveAnim] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [showAddPanel, setShowAddPanel] = useState(false);
  const fileInputRef = useRef();

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("uniking_rfq_cart") || "[]");
      setItems(stored);
    } catch { setItems([]); }
  }, []);

  useEffect(() => { window.scrollTo({ top: 0, behavior: "smooth" }); }, [step]);

  const saveItems = (newItems) => {
    setItems(newItems);
    saveRFQCart(newItems);
  };

  const updateItem = (idx, field, val) => saveItems(items.map((item, i) => i === idx ? { ...item, [field]: val } : item));

  const removeItem = (idx) => {
    setRemoveAnim(idx);
    setTimeout(() => { saveItems(items.filter((_, i) => i !== idx)); setRemoveAnim(null); }, 250);
  };

  function handleAddProduct(product) {
    const already = items.find(i => i.id === product.id && i._source === product._source);
    if (already) return;
    const newItem = product._source === "custom" ? product : {
      cartId: product.id + "_" + Date.now(),
      id: product.id, _source: product._source,
      series: product.series, name: product.series,
      type: product.type, style: product.style || "",
      category: product.category || "", image_url: product.image_url || "",
      materials: product.materials || "",
      quantity: 1, unit: "Feet", notes: "",
    };
    saveItems([...items, newItem]);
  }

  const handleFiles = (files) => {
    const newFiles = Array.from(files).filter(f => f.size <= 10 * 1024 * 1024);
    setAttachments(prev => [...prev, ...newFiles]);
  };
  const handleDrop = (e) => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); };

  const handleSubmit = async () => {
    setError(""); setSubmitting(true);
    try {
      const attachmentData = await Promise.all(
        attachments.map(file => new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve({ name: file.name, type: file.type, size: file.size, data: reader.result });
          reader.readAsDataURL(file);
        }))
      );
      const res = await fetch("/api/fn/sendRFQEmail", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customer: form, items, attachments: attachmentData }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send");
      setSubmitted(true); saveItems([]);
    } catch { setError("Something went wrong. Please try again or email rfq@unikingcanada.com directly."); }
    finally { setSubmitting(false); }
  };

  // ── Success ────────────────────────────────────────────────────────────────
  if (submitted) {
    return (
      <div style={{ minHeight: "100vh", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center", padding: 24, fontFamily: "Arial,sans-serif" }}>
        <div style={{ background: "#fff", borderRadius: 16, padding: "48px 32px", maxWidth: 440, width: "100%", textAlign: "center" }}>
          <div style={{ width: 68, height: 68, background: "#dcfce7", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", fontSize: 30 }}>✓</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: NAVY, marginBottom: 10 }}>RFQ Submitted!</div>
          <div style={{ fontSize: 14, color: C.muted, lineHeight: 1.75, marginBottom: 28 }}>
            Your request has been sent to our team.<br />A confirmation was sent to <strong>{form.email}</strong>.
          </div>
          <a href="#" onClick={e => { e.preventDefault(); onBack(); }} style={{ display: "inline-block", background: NAVY, color: "#fff", padding: "13px 32px", borderRadius: 8, fontWeight: 700, fontSize: 14, textDecoration: "none" }}>Back to Catalog</a>
        </div>
      </div>
    );
  }

  // ── Step 0: Cart ───────────────────────────────────────────────────────────
  const renderStep0 = () => (
    <div>
      {items.length === 0 && !showAddPanel ? (
        <div style={{ textAlign: "center", padding: "48px 16px" }}>
          <div style={{ fontSize: 48, opacity: 0.2, marginBottom: 14 }}>📋</div>
          <div style={{ fontSize: 18, fontWeight: 800, color: NAVY, marginBottom: 8 }}>Your cart is empty</div>
          <div style={{ fontSize: 14, color: C.muted, marginBottom: 24 }}>Search for products below or browse the full catalog.</div>
          <button onClick={() => setShowAddPanel(true)}
            style={{ display: "inline-block", background: NAVY, color: "#fff", padding: "12px 28px", borderRadius: 8, fontWeight: 700, fontSize: 14, border: "none", cursor: "pointer", marginBottom: 12 }}>
            + Search Products
          </button>
          <div><a href="#" onClick={e => { e.preventDefault(); onBack(); }} style={{ fontSize: 13, color: C.accent, fontWeight: 600, textDecoration: "none" }}>Browse full catalog →</a></div>
        </div>
      ) : (
        <div>
          {items.length > 0 && (
            <>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <div style={{ fontSize: 15, fontWeight: 800, color: NAVY }}>{items.length} Product{items.length !== 1 ? "s" : ""}</div>
                <button onClick={() => saveItems([])} style={{ background: "none", border: "none", color: "#ef4444", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Clear All</button>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 16 }}>
                {items.map((item, idx) => (
                  <div key={item.cartId || idx} style={{ background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0", overflow: "hidden", opacity: removeAnim === idx ? 0 : 1, transform: removeAnim === idx ? "translateX(12px)" : "none", transition: "opacity 0.22s, transform 0.22s" }}>
                    <div style={{ display: "flex" }}>
                      {item.image_url ? (
                        <div style={{ width: 76, flexShrink: 0, background: "#f8fafc", borderRight: "1px solid #f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", padding: 8 }}>
                          <img src={item.image_url} alt="" style={{ maxWidth: "100%", maxHeight: 58, objectFit: "contain" }} onError={e => e.target.style.display = "none"} />
                        </div>
                      ) : item._source === "custom" ? (
                        <div style={{ width: 76, flexShrink: 0, background: "#fef9c3", borderRight: "1px solid #f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>✏️</div>
                      ) : null}
                      <div style={{ flex: 1, padding: "12px 14px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                          <div>
                            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                              <div style={{ fontSize: 14, fontWeight: 800, color: NAVY }}>{item.series || item.name || "Product"}</div>
                              {item._source === "custom" && <span style={{ fontSize: 10, background: "#fef9c3", border: "1px solid #fde047", color: "#854d0e", borderRadius: 4, padding: "1px 6px", fontWeight: 700 }}>CUSTOM</span>}
                            </div>
                            <div style={{ fontSize: 12, color: C.muted, marginTop: 1 }}>{item.type}{item.style ? " · " + item.style : ""}</div>
                          </div>
                          <button onClick={() => removeItem(idx)} style={{ background: "none", border: "none", color: "#d1d5db", cursor: "pointer", fontSize: 22, lineHeight: 1, padding: "0 4px" }}
                            onMouseEnter={e => e.target.style.color = "#ef4444"} onMouseLeave={e => e.target.style.color = "#d1d5db"}>×</button>
                        </div>
                        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                          <div>
                            <Label>Qty</Label>
                            <input type="number" min="1" value={item.quantity || 1} onChange={e => updateItem(idx, "quantity", e.target.value)}
                              style={{ width: 70, padding: "8px 10px", borderRadius: 6, border: "1px solid #e2e8f0", fontSize: 14, fontWeight: 700, color: NAVY, outline: "none" }} />
                          </div>
                          <div>
                            <Label>Unit</Label>
                            <select value={item.unit || "Feet"} onChange={e => updateItem(idx, "unit", e.target.value)}
                              style={{ padding: "8px 10px", borderRadius: 6, border: "1px solid #e2e8f0", fontSize: 13, color: NAVY, outline: "none", background: "#fff" }}>
                              {UNIT_OPTIONS.map(u => <option key={u}>{u}</option>)}
                            </select>
                          </div>
                          <div style={{ width: "100%" }}>
                            <Label>Notes / Specs</Label>
                            <input type="text" placeholder="Width, material, application..." value={item.notes || ""} onChange={e => updateItem(idx, "notes", e.target.value)}
                              style={{ width: "100%", boxSizing: "border-box", padding: "8px 10px", borderRadius: 6, border: "1px solid #e2e8f0", fontSize: 13, color: NAVY, outline: "none" }} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Add product panel */}
          {showAddPanel ? (
            <AddProductPanel cartItems={items} onAdd={p => { handleAddProduct(p); }} onClose={() => setShowAddPanel(false)} />
          ) : (
            <button onClick={() => setShowAddPanel(true)}
              style={{ width: "100%", padding: "11px 16px", borderRadius: 8, border: "1.5px dashed " + C.border, background: "#f8fafc", color: C.accent, fontWeight: 700, fontSize: 13, cursor: "pointer", marginBottom: 16, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
              + Add more products
            </button>
          )}

          {items.length > 0 && (
            <button onClick={() => setStep(1)}
              style={{ width: "100%", background: NAVY, color: "#fff", padding: "16px 20px", borderRadius: 10, fontWeight: 800, fontSize: 16, border: "none", cursor: "pointer", boxShadow: "0 4px 14px rgba(15,35,64,0.2)", display: "block" }}>
              Next: Add Your Details →
            </button>
          )}
        </div>
      )}
    </div>
  );

  // ── Step 1: Details + attachments ─────────────────────────────────────────
  const renderStep1 = () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0", padding: "20px" }}>
        <div style={{ fontSize: 15, fontWeight: 800, color: NAVY, marginBottom: 18 }}>Contact Information</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div><Label required>Full Name</Label><FieldInput value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Jane Smith" required /></div>
          <div><Label>Company</Label><FieldInput value={form.company} onChange={e => setForm(f => ({ ...f, company: e.target.value }))} placeholder="Acme Industries Ltd." /></div>
          <div><Label required>Email Address</Label><FieldInput type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="jane@company.com" required /></div>
          <div><Label>Phone Number</Label><FieldInput type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="+1 (514) 000-0000" /></div>
        </div>
      </div>

      <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0", padding: "20px" }}>
        <div style={{ fontSize: 15, fontWeight: 800, color: NAVY, marginBottom: 12 }}>Additional Notes</div>
        <Label>Anything else our team should know?</Label>
        <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
          placeholder="Application details, timeline, budget, current supplier, or any other context..."
          rows={5} style={{ width: "100%", boxSizing: "border-box", padding: "12px 14px", borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 14, color: C.text, outline: "none", resize: "vertical", fontFamily: "Arial,sans-serif", lineHeight: 1.6 }}
          onFocus={e => e.target.style.borderColor = C.accent} onBlur={e => e.target.style.borderColor = "#e2e8f0"} />
      </div>

      <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0", padding: "20px" }}>
        <div style={{ fontSize: 15, fontWeight: 800, color: NAVY, marginBottom: 4 }}>Attachments <span style={{ fontSize: 12, fontWeight: 500, color: C.muted }}>(optional)</span></div>
        <div style={{ fontSize: 13, color: C.muted, marginBottom: 14 }}>Photos, drawings, spec sheets — any format, max 10MB each</div>
        <div onDragOver={e => { e.preventDefault(); setDragOver(true); }} onDragLeave={() => setDragOver(false)} onDrop={handleDrop}
          onClick={() => fileInputRef.current.click()}
          style={{ border: "2px dashed " + (dragOver ? C.accent : "#cbd5e1"), borderRadius: 10, padding: "28px 20px", textAlign: "center", background: dragOver ? "#eff6ff" : "#f8fafc", cursor: "pointer" }}>
          <div style={{ fontSize: 30, marginBottom: 8 }}>📎</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: C.navyMid }}>Tap to attach files</div>
          <div style={{ fontSize: 12, color: C.muted, marginTop: 4 }}>Images, PDFs, DWG, Excel, Word…</div>
          <input ref={fileInputRef} type="file" multiple accept="*/*" onChange={e => handleFiles(e.target.files)} style={{ display: "none" }} />
        </div>
        {attachments.length > 0 && (
          <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 8 }}>
            {attachments.map((file, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", background: "#f8fafc", borderRadius: 8, border: "1px solid #e2e8f0" }}>
                <span style={{ fontSize: 18 }}>{file.type.startsWith("image/") ? "🖼️" : file.type === "application/pdf" ? "📄" : "📁"}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: NAVY, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{file.name}</div>
                  <div style={{ fontSize: 11, color: C.muted }}>{(file.size / 1024).toFixed(0)} KB</div>
                </div>
                <button onClick={() => setAttachments(prev => prev.filter((_, j) => j !== i))} style={{ background: "none", border: "none", color: "#9ca3af", cursor: "pointer", fontSize: 20, lineHeight: 1 }}>×</button>
              </div>
            ))}
          </div>
        )}
      </div>

      {error && <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, padding: "12px 14px", fontSize: 13, color: "#dc2626" }}>{error}</div>}

      <div style={{ display: "flex", gap: 10 }}>
        <button onClick={() => { setError(""); setStep(0); }} style={{ flex: 1, background: "#fff", color: NAVY, padding: "14px 16px", borderRadius: 10, fontWeight: 700, fontSize: 15, border: "1.5px solid #e2e8f0", cursor: "pointer" }}>← Back</button>
        <button onClick={() => { if (!form.name || !form.email) { setError("Please fill in your name and email."); return; } setError(""); setStep(2); }}
          style={{ flex: 2, background: NAVY, color: "#fff", padding: "14px 16px", borderRadius: 10, fontWeight: 800, fontSize: 15, border: "none", cursor: "pointer", boxShadow: "0 4px 14px rgba(15,35,64,0.2)" }}>
          Review & Submit →
        </button>
      </div>
    </div>
  );

  // ── Step 2: Review ────────────────────────────────────────────────────────
  const renderStep2 = () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0", padding: "18px" }}>
        <div style={{ fontSize: 12, fontWeight: 800, color: C.muted, textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: 12 }}>Products ({items.length})</div>
        {items.map((item, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: i < items.length - 1 ? "1px solid #f1f5f9" : "none" }}>
            {item.image_url ? <img src={item.image_url} alt="" style={{ width: 36, height: 36, objectFit: "contain", borderRadius: 4, background: "#f8fafc" }} onError={e => e.target.style.display = "none"} /> : <span style={{ fontSize: 20 }}>{item._source === "custom" ? "✏️" : "📦"}</span>}
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: NAVY }}>{item.series || item.name}
                {item._source === "custom" && <span style={{ fontSize: 10, background: "#fef9c3", border: "1px solid #fde047", color: "#854d0e", borderRadius: 4, padding: "1px 6px", fontWeight: 700, marginLeft: 6 }}>CUSTOM</span>}
              </div>
              <div style={{ fontSize: 11, color: C.muted }}>{item.type}</div>
            </div>
            <div style={{ fontSize: 13, fontWeight: 700, color: C.navyMid, whiteSpace: "nowrap" }}>{item.quantity || 1} {item.unit || "Feet"}</div>
          </div>
        ))}
      </div>

      <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0", padding: "18px" }}>
        <div style={{ fontSize: 12, fontWeight: 800, color: C.muted, textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: 12 }}>Contact</div>
        {[["Name", form.name], ["Company", form.company], ["Email", form.email], ["Phone", form.phone]].filter(([, v]) => v).map(([k, v]) => (
          <div key={k} style={{ display: "flex", gap: 10, padding: "5px 0", fontSize: 13 }}>
            <span style={{ color: C.muted, width: 72, flexShrink: 0 }}>{k}</span>
            <span style={{ color: NAVY, fontWeight: 600 }}>{v}</span>
          </div>
        ))}
        {form.notes && <div style={{ marginTop: 10, padding: "10px 12px", background: "#f8fafc", borderRadius: 7, fontSize: 13, color: C.text, lineHeight: 1.5 }}>{form.notes}</div>}
      </div>

      {attachments.length > 0 && (
        <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0", padding: "18px" }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: C.muted, textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: 10 }}>Attachments ({attachments.length})</div>
          {attachments.map((f, i) => <div key={i} style={{ fontSize: 13, color: NAVY, fontWeight: 500, padding: "3px 0" }}>📎 {f.name}</div>)}
        </div>
      )}

      {error && <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, padding: "12px 14px", fontSize: 13, color: "#dc2626" }}>{error}</div>}

      <div style={{ display: "flex", gap: 10 }}>
        <button onClick={() => { setError(""); setStep(1); }} style={{ flex: 1, background: "#fff", color: NAVY, padding: "14px 16px", borderRadius: 10, fontWeight: 700, fontSize: 15, border: "1.5px solid #e2e8f0", cursor: "pointer" }}>← Back</button>
        <button onClick={handleSubmit} disabled={submitting}
          style={{ flex: 2, background: submitting ? "#94a3b8" : NAVY, color: "#fff", padding: "14px 16px", borderRadius: 10, fontWeight: 800, fontSize: 15, border: "none", cursor: submitting ? "not-allowed" : "pointer", boxShadow: submitting ? "none" : "0 4px 14px rgba(15,35,64,0.22)" }}>
          {submitting ? "Sending…" : "Submit RFQ ✓"}
        </button>
      </div>
      <div style={{ fontSize: 11, color: "#94a3b8", textAlign: "center", lineHeight: 1.6 }}>
        Sent to rfq@unikingcanada.com · We typically respond within 1–2 business days.
      </div>
    </div>
  );

  // ── Shell ─────────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "Arial,sans-serif" }}>
      <div style={{ background: NAVY, height: 56, display: "flex", alignItems: "center", padding: "0 20px", justifyContent: "space-between" }}>
        <a href="#" onClick={e => { e.preventDefault(); onBack(); }} style={{ color: "#93c5fd", fontSize: 13, fontWeight: 600, textDecoration: "none" }}>← Back to Catalog</a>
        <img src={LOGO_URL} style={{ maxHeight: 26, width: "auto", filter: "brightness(0) invert(1)", opacity: 0.9 }} alt="Uniking Canada" />
        <span style={{ width: 80 }} />
      </div>

      <div style={{ maxWidth: 600, margin: "0 auto", padding: "28px 16px 80px" }}>
        <div style={{ fontSize: 22, fontWeight: 800, color: NAVY, marginBottom: 4 }}>Request for Quotation</div>
        <div style={{ fontSize: 13, color: C.muted, marginBottom: 24 }}>
          {step === 0 && "Review your selected products."}
          {step === 1 && "Tell us who you are and add any details."}
          {step === 2 && "Everything look good? Submit your RFQ."}
        </div>
        <StepBar step={step} />
        {step === 0 && renderStep0()}
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
      </div>
    </div>
  );
}


export default function Home() {
  const [currentPage, setCurrentPage] = useState(null);
  const [allData, setAllData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Restore navigation state from sessionStorage (survives pull-to-refresh)
  function getNav(key, def) {
    try { const v = sessionStorage.getItem("unk_nav_" + key); return v !== null ? JSON.parse(v) : def; } catch { return def; }
  }
  function setNav(key, val) {
    try { sessionStorage.setItem("unk_nav_" + key, JSON.stringify(val)); } catch {}
  }

  const [view, _setView] = useState(() => getNav("view", "home"));
  const [selectedType, _setSelectedType] = useState(() => getNav("selectedType", null));
  const [selectedBrand, _setSelectedBrand] = useState(() => getNav("selectedBrand", null));
  const [inChainMenu, _setInChainMenu] = useState(() => getNav("inChainMenu", false));
  const [selectedEngineeredSub, _setSelectedEngineeredSub] = useState(() => getNav("selectedEngineeredSub", null));
  const [selectedAnsiSub, _setSelectedAnsiSub] = useState(() => getNav("selectedAnsiSub", null));
  const [selectedWeldedSub, _setSelectedWeldedSub] = useState(() => getNav("selectedWeldedSub", null));

  function setView(v) { _setView(v); setNav("view", v); }
  function setSelectedType(v) { _setSelectedType(v); setNav("selectedType", v); }
  function setSelectedBrand(v) { _setSelectedBrand(v); setNav("selectedBrand", v); }
  function setInChainMenu(v) { _setInChainMenu(v); setNav("inChainMenu", v); }
  function setSelectedEngineeredSub(v) { _setSelectedEngineeredSub(v); setNav("selectedEngineeredSub", v); }
  function setSelectedAnsiSub(v) { _setSelectedAnsiSub(v); setNav("selectedAnsiSub", v); }
  function setSelectedWeldedSub(v) { _setSelectedWeldedSub(v); setNav("selectedWeldedSub", v); }

  const [rawMacRecords, setRawMacRecords] = useState([]);
  const [globalSearch, setGlobalSearch] = useState("");
  const [globalSelected, setGlobalSelected] = useState(null);


  // ── PWA Override: replace platform manifest with Uniking branding ───────────
  // ── Disable pull-to-refresh & prevent swipe-to-go-back resetting state ─────
  useEffect(() => {
    // Prevent browser pull-to-refresh on mobile
    document.body.style.overscrollBehaviorY = "contain";
    document.documentElement.style.overscrollBehaviorY = "contain";
    return () => {
      document.body.style.overscrollBehaviorY = "";
      document.documentElement.style.overscrollBehaviorY = "";
    };
  }, []);

  useEffect(() => {
    const ICON_192 = "https://media.base44.com/images/public/69dd9ffccab4dd693d4d92f5/dd1986c29_pwa_icon_192.png";
    const ICON_512 = "https://media.base44.com/images/public/69dd9ffccab4dd693d4d92f5/cb99cdae9_pwa_icon_512_final.png";

    const manifestData = {
      name: "Uniking",
      short_name: "Uniking",
      description: "Uniking Canada Product Catalog",
      start_url: window.location.origin + "/",
      scope: "/",
      display: "standalone",
      background_color: "#0a1628",
      theme_color: "#0a1628",
      orientation: "portrait-primary",
      icons: [
        { src: ICON_192, sizes: "192x192", type: "image/png", purpose: "any maskable" },
        { src: ICON_512, sizes: "512x512", type: "image/png", purpose: "any maskable" }
      ]
    };

    // Remove ALL existing manifest links (platform default)
    document.querySelectorAll('link[rel="manifest"]').forEach(el => el.remove());
    // Inject our manifest via blob URL
    const blob = new Blob([JSON.stringify(manifestData)], { type: "application/manifest+json" });
    const manifestUrl = URL.createObjectURL(blob);
    const manifestLink = document.createElement("link");
    manifestLink.rel = "manifest";
    manifestLink.href = manifestUrl;
    manifestLink.crossOrigin = "use-credentials";
    document.head.insertBefore(manifestLink, document.head.firstChild);

    // Apple touch icon
    document.querySelectorAll('link[rel="apple-touch-icon"]').forEach(el => el.remove());
    const appleIcon = document.createElement("link");
    appleIcon.rel = "apple-touch-icon";
    appleIcon.sizes = "512x512";
    appleIcon.href = ICON_512;
    document.head.appendChild(appleIcon);

    // Favicon
    document.querySelectorAll('link[rel="icon"], link[rel="shortcut icon"]').forEach(el => el.remove());
    const favicon = document.createElement("link");
    favicon.rel = "icon";
    favicon.type = "image/png";
    favicon.sizes = "192x192";
    favicon.href = ICON_192;
    document.head.appendChild(favicon);

    // Theme color
    document.querySelectorAll('meta[name="theme-color"]').forEach(el => el.remove());
    const themeMeta = document.createElement("meta");
    themeMeta.name = "theme-color";
    themeMeta.content = "#0a1628";
    document.head.appendChild(themeMeta);

    // App title
    document.title = "Uniking";

    return () => { try { URL.revokeObjectURL(manifestUrl); } catch(e) {} };
  }, []);

  useEffect(() => {
    async function fetchAll(entity) {
      let all = [], skip = 0;
      while (true) {
        const batch = await entity.list({ limit: 500, skip });
        if (!batch || !batch.length) break;
        all = [...all, ...batch];
        if (batch.length < 500) break;
        skip += batch.length;
      }
      return all;
    }
    async function load() {
      try {
        const [cat, elev, uni, allied] = await Promise.all([
          fetchAll(CatalogProduct),
          fetchAll(ElevatorBucket),
          fetchAll(UniCatalog),
          fetchAll(MacChainProduct),
        ]);
        setRawMacRecords(allied || []);
        setAllData([
          ...(cat || []).map(normalizeCatalogProduct),
          ...(elev || []).map(normalizeElevatorBucket),
          ...(uni || []).map(normalizeUniCatalog),
          ...(allied || []).map(normalizeAllied),
        ]);
      } catch (e) { console.error("Catalog load error:", e); }
      finally { setLoading(false); }
    }
    load();
  }, []);

  const typeCounts = useMemo(() => { const c = {}; for (const p of allData) c[p.type] = (c[p.type] || 0) + 1; return c; }, [allData]);

  const globalResults = useMemo(() => {
    const q = globalSearch.trim().toLowerCase();
    if (!q) return [];
    function searchStr(p) {
      return [p.series, p.type, p.style, p.category, p.notes, p.materials, p.application, p.brand, p.duty, p.discharge_type].filter(Boolean).join(" ").toLowerCase();
    }
    function fuzzyScore(str, pattern) {
      let score = 0, si = 0, pi = 0, consecutive = 0;
      while (si < str.length && pi < pattern.length) {
        if (str[si] === pattern[pi]) {
          consecutive++;
          score += consecutive * 2;
          if (si === 0 || str[si-1] === " " || str[si-1] === "-") score += 5;
          if (si === 0) score += 8;
          pi++;
        } else { consecutive = 0; }
        si++;
      }
      if (pi < pattern.length) return -1;
      score -= str.length * 0.1;
      return score;
    }
    const words = q.split(/\s+/);
    const scored = allData.map(p => {
      const str = searchStr(p);
      if (words.length > 1) {
        const allFuzzy = words.every(w => fuzzyScore(str, w) >= 0);
        if (!allFuzzy) return null;
        const total = words.reduce((acc, w) => acc + Math.max(fuzzyScore(str, w), 0), 0);
        return { p, score: total };
      }
      const s = fuzzyScore(str, q);
      if (s < 0) return null;
      return { p, score: s };
    }).filter(Boolean);
    return scored.sort((a, b) => b.score - a.score).slice(0, 40).map(s => s.p);
  }, [globalSearch, allData]);
  const availableTypes = useMemo(() => PRODUCT_TYPES, []);
  const typeProducts = useMemo(() => allData.filter(p => p.type === selectedType), [allData, selectedType]);
  const viewProducts = useMemo(() => {
    let prods = selectedBrand ? typeProducts.filter(p => p.brand === selectedBrand) : typeProducts;
    if (selectedEngineeredSub) prods = prods.filter(p => p._subcategory === selectedEngineeredSub);
    if (selectedAnsiSub) prods = prods.filter(p => p._subcategory === selectedAnsiSub);
    if (selectedWeldedSub) {
      prods = prods.filter(p => (p._mac_category || p._subcategory || "Chain") === selectedWeldedSub);
    }
    return prods;
  }, [typeProducts, selectedBrand, selectedEngineeredSub, selectedAnsiSub]);
  const isBrandGated = selectedType && BRAND_GATED.has(selectedType);
  const showBrand = selectedType && SHOW_BRAND.has(selectedType) && !selectedBrand;

  function selectType(typeKey) {
    if (typeKey === "__chain__") { setInChainMenu(true); setView("chains"); return; }
    if (typeKey === "Elevator Bucket") { setCurrentPage("elevatorBuckets"); window.scrollTo(0,0); return; }
    if (typeKey === "Conveyor Rollers") { setCurrentPage("rollerConfig"); window.scrollTo(0,0); return; }
    if (typeKey === "Forged Chain") { setCurrentPage("forgedChain"); window.scrollTo(0,0); return; }
    if (typeKey === "Engineered Chain") { setSelectedType("Engineered Chain"); setSelectedEngineeredSub(null); setSelectedAnsiSub(null); setView("engineered_subs"); return; }
    if (typeKey === "ANSI/BS Chain") { setSelectedType("ANSI/BS Chain"); setSelectedAnsiSub(null); setSelectedEngineeredSub(null); setSelectedWeldedSub(null); setView("products"); return; }
    if (typeKey === "Welded Steel Chain") { setSelectedType("Welded Steel Chain"); setSelectedWeldedSub(null); setSelectedAnsiSub(null); setSelectedEngineeredSub(null); setView("welded_products"); return; }
    setSelectedType(typeKey); setSelectedBrand(null); setSelectedAnsiSub(null); setSelectedWeldedSub(null); setView(BRAND_GATED.has(typeKey) ? "brands" : "products");
  }
  function selectEngineeredSub(subKey) {
    setSelectedEngineeredSub(subKey);
    setView("products");
  }
  function selectAnsiSub(subKey) {
    setSelectedAnsiSub(subKey);
    setView("products");
  }
  function selectWeldedSub(subKey) {
    setSelectedWeldedSub(subKey);
    setView("products");
  }
  function selectBrand(brand) { setSelectedBrand(brand); setView("products"); }
  function navTo(level) {
    if (level === 0) { setView("home"); setSelectedType(null); setSelectedBrand(null); setInChainMenu(false); setSelectedEngineeredSub(null); setSelectedAnsiSub(null); setSelectedWeldedSub(null); }
    else if (level === 1 && inChainMenu && !selectedType) { /* already on chain menu */ }
    else if (level === 1 && inChainMenu && selectedType === "Engineered Chain" && selectedEngineeredSub) { setView("engineered_subs"); setSelectedEngineeredSub(null); }
    else if (level === 1 && inChainMenu && selectedType === "ANSI/BS Chain" && selectedAnsiSub) { setView("ansi_subs"); setSelectedAnsiSub(null); }
    else if (level === 1 && inChainMenu && selectedType === "Welded Steel Chain") { setView("chains"); setSelectedType(null); setSelectedWeldedSub(null); }
    else if (level === 1 && inChainMenu) { setView("chains"); setSelectedType(null); setSelectedBrand(null); setSelectedEngineeredSub(null); setSelectedAnsiSub(null); setSelectedWeldedSub(null); }
    else if (level === 2 && inChainMenu && selectedType === "Engineered Chain" && selectedEngineeredSub) { setView("engineered_subs"); setSelectedEngineeredSub(null); }
    else if (level === 2 && inChainMenu && selectedType === "ANSI/BS Chain" && selectedAnsiSub) { setView("ansi_subs"); setSelectedAnsiSub(null); }

    else if (level === 1 && isBrandGated) { setView("brands"); setSelectedBrand(null); }
  }

  const breadcrumbs = ["All Products"];
  if (inChainMenu) breadcrumbs.push("Chain");
  if (selectedType) breadcrumbs.push(TYPE_MAP[selectedType]?.label || selectedType);
  if (selectedEngineeredSub) breadcrumbs.push(ENGINEERED_SUBCATEGORIES.find(s => s.key === selectedEngineeredSub)?.label || selectedEngineeredSub);
  if (selectedAnsiSub) breadcrumbs.push(ANSI_SUBCATEGORIES.find(s => s.key === selectedAnsiSub)?.label || selectedAnsiSub);
  if (selectedWeldedSub) breadcrumbs.push(WELDED_SUBCATEGORIES.find(s => s.key === selectedWeldedSub)?.label || selectedWeldedSub);
  if (selectedBrand) breadcrumbs.push(selectedBrand);

  // ── Page Router ────────────────────────────────────────────────────────────
  function goBack() { setCurrentPage(null); window.scrollTo(0, 0); }
  function goRFQ() { setCurrentPage("rfqCart"); window.scrollTo(0, 0); }

  if (currentPage === "elevatorBuckets") return <ElevBucketsView onBack={goBack} onGoRFQ={goRFQ} />;
  if (currentPage === "forgedChain") return <ForgedChainView onBack={goBack} onGoRFQ={goRFQ} />;
  if (currentPage === "rollerConfig") return <RollerConfigView onBack={goBack} onGoRFQ={goRFQ} />;
  if (currentPage === "rfqCart") return <RFQCartView onBack={goBack} />;

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "'Inter','Segoe UI',Arial,sans-serif", display: "flex", flexDirection: "column", overscrollBehavior: "contain" }}>
      <TopBar onGoRFQ={() => { setCurrentPage("rfqCart"); window.scrollTo(0,0); }} />
      <div style={{ flex: 1, maxWidth: 1280, width: "100%", margin: "0 auto", padding: "24px clamp(12px,4vw,40px)", boxSizing: "border-box" }}>
        {view !== "home" ? <Breadcrumb items={breadcrumbs} onNav={navTo} /> : null}
        {loading ? (
          <div style={{ textAlign: "center", padding: 80, color: C.muted, fontSize: 14 }}>Loading catalog...</div>
        ) : view === "home" ? (
          <div>
            {/* Global Search Bar */}
            <div style={{ marginBottom: 32 }}>
              <div style={{ position: "relative", maxWidth: 560, margin: "0 auto" }}>
                <span style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", fontSize: 18, color: "#94a3b8", pointerEvents: "none" }}>🔍</span>
                <input
                  value={globalSearch}
                  onChange={e => { setGlobalSearch(e.target.value); setGlobalSelected(null); }}
                  placeholder="Search all products — series, type, material, application…"
                  style={{ width: "100%", boxSizing: "border-box", padding: "14px 16px 14px 46px", borderRadius: 12, border: "1.5px solid " + (globalSearch ? C.navyMid : C.border), fontSize: 15, outline: "none", background: "#fff", boxShadow: globalSearch ? "0 4px 16px rgba(26,58,92,0.10)" : "0 1px 4px rgba(0,0,0,0.05)", transition: "border 0.15s, box-shadow 0.15s", color: C.text }}
                />
                {globalSearch && (
                  <button onClick={() => { setGlobalSearch(""); setGlobalSelected(null); }}
                    style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: 18, color: "#94a3b8", lineHeight: 1 }}>×</button>
                )}
              </div>

              {/* Search results */}
              {globalSearch.trim() && (
                <div style={{ maxWidth: 560, margin: "8px auto 0", background: "#fff", borderRadius: 12, border: "1.5px solid " + C.border, boxShadow: "0 8px 32px rgba(15,35,64,0.12)", overflow: "hidden" }}>
                  {globalResults.length === 0 ? (
                    <div style={{ padding: "20px 20px", textAlign: "center", color: C.muted, fontSize: 14 }}>No products found for "{globalSearch}"</div>
                  ) : (
                    <>
                      <div style={{ padding: "10px 16px 8px", fontSize: 11, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: "0.6px", borderBottom: "1px solid #f1f5f9" }}>
                        {globalResults.length} result{globalResults.length !== 1 ? "s" : ""}
                      </div>
                      <div style={{ maxHeight: 420, overflowY: "auto" }}>
                        {globalResults.map((p, i) => (
                          <div key={p.id + i} onClick={() => { setGlobalSelected(p); setGlobalSearch(""); }}
                            onMouseEnter={e => e.currentTarget.style.background = "#f8fafc"}
                            onMouseLeave={e => e.currentTarget.style.background = "#fff"}
                            style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 16px", borderBottom: i < globalResults.length - 1 ? "1px solid #f8fafc" : "none", cursor: "pointer", background: "#fff", transition: "background 0.1s" }}>
                            {p.image_url ? (
                              <img src={p.image_url} alt="" style={{ width: 44, height: 38, objectFit: "contain", borderRadius: 6, background: "#f8fafc", flexShrink: 0 }} onError={e => e.target.style.display = "none"} />
                            ) : (
                              <div style={{ width: 44, height: 38, borderRadius: 6, background: "#f1f5f9", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, color: "#cbd5e1" }}>⛓</div>
                            )}
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontSize: 13, fontWeight: 700, color: C.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.series}</div>
                              <div style={{ fontSize: 11, color: C.muted, marginTop: 1 }}>
                                {p.type}{p.brand ? " · " + p.brand : ""}{p.style ? " · " + p.style : ""}{p.category ? " · " + p.category : ""}
                              </div>
                            </div>
                            <span style={{ fontSize: 11, color: C.navyMid, fontWeight: 700, whiteSpace: "nowrap" }}>View →</span>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            <TypeGrid types={availableTypes} counts={typeCounts} onSelect={selectType} />

            {/* Global search result modal */}
            {globalSelected && (() => {
              const rawRecord = globalSelected._source === "mac" || globalSelected._source === "allied"
                ? rawMacRecords.find(r => r.id === globalSelected.id) || null : null;
              if (rawRecord) return <MacProductModal record={rawRecord} slugMap={{}} sprocketMap={{}} loadSprockets={() => {}} onSelect={r => setGlobalSelected(r)} onClose={() => setGlobalSelected(null)} />;
              return <ProductModal product={globalSelected} showBrand={true} onClose={() => setGlobalSelected(null)} />;
            })()}
          </div>
        ) : view === "chains" ? (
          <ChainSubGrid
            types={availableTypes.filter(t => CHAIN_SUBTYPE_KEYS.has(t.key))}
            counts={typeCounts}
            onSelect={selectType}
          />
        ) : view === "engineered_subs" ? (
          <EngineeredSubGrid allProducts={allData} onSelect={selectEngineeredSub} />
        ) : view === "ansi_subs" ? (
          <AnsiSubGrid allProducts={allData} onSelect={selectAnsiSub} />
        ) : view === "welded_products" ? (
          <WeldedSeriesView rawMacRecords={rawMacRecords} />
        ) : view === "brands" ? (
          <BrandGrid products={typeProducts} typeDef={TYPE_MAP[selectedType]} onSelect={selectBrand} />
        ) : (
          <ProductList typeKey={selectedType} brand={selectedBrand} products={viewProducts} showBrand={showBrand} rawMacRecords={rawMacRecords} />
        )}
      </div>
      <div style={{ borderTop: "1px solid " + C.border, padding: "14px 40px", textAlign: "center", fontSize: 11, color: "#cbd5e1" }}>
        Uniking Canada · Technical Product Reference · <span onClick={() => setCurrentPage("rfqCart")} style={{ color: "#93c5fd", textDecoration: "none", fontWeight: 600, cursor: "pointer" }}>Submit an RFQ →</span>
      </div>
      <FloatingRFQButton onGoRFQ={() => { setCurrentPage("rfqCart"); window.scrollTo(0,0); }} />
    </div>
  );
}