import { useState, useEffect, useMemo } from "react";
import { createPageUrl } from "@/utils";
import { UniCatalog, CatalogProduct, ElevatorBucket, DonghuaChain, MacChainProduct } from "@/api/entities";

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


const SHOW_BRAND = new Set(["Modular Belt", "Elevator Bucket", "4B Electronics", "Plastic Chain", "Metal Chain"]);
const BRAND_GATED = new Set(["Modular Belt", "Elevator Bucket", "Plastic Chain", "Metal Chain"]);
const EXTERNAL_ROUTES = {
  "Conveyor Rollers": "/RollerConfigurator",
  "Forged Chain": "/ForgedChain",
};


// ─── Chain grouping ──────────────────────────────────────────────────────────
const CHAIN_SUBTYPE_KEYS = new Set([
  "ANSI/BS Chain", "Engineered Chain", "Cast Chain",
  "Welded Steel Chain", "Forged Chain", "Overhead Chain", "Sharptop Chain",
  "Kiln Chain", "Thermoforming Chain", "Conveyor Chain",
  "Pintle Chain", "Long Link Chain", "Special Application Chain",
]);

const PRODUCT_TYPES = [
  { key: "Modular Belt", label: "Modular Plastic Belting", description: "Straight-running, radius, spiral and side-flexing modular plastic belt systems", filters: ["category", "style", "pitch_in", "hinge_style", "materials"] },
  { key: "Elevator Bucket", label: "Elevator Buckets & Hardware", description: "Agricultural and industrial elevator buckets, belting, splices and hardware", filters: ["application", "discharge_type", "duty", "material", "profile"] },
  { key: "Plastic Chain", label: "Plastic Chains", description: "Straight-running and side-flexing plastic conveyor chains", filters: ["style", "materials", "duty"] },
  { key: "Metal Chain", label: "Metal Chains", description: "Stainless steel and carbon steel slat-top and side-flexing conveyor chains", filters: ["style", "materials", "duty"] },
  { key: "Wire Mesh Belt", label: "Wire Mesh Belt", description: "Stainless and carbon steel wire mesh conveyor belts for food and industrial processing", filters: ["style", "materials", "duty"] },
  { key: "Steel Hinged Belt", label: "Steel Hinged Belt", description: "Steel hinged slat and plate conveyor belts for chip and scrap handling", filters: ["style", "materials"] },
  { key: "ANSI/BS Chain", label: "Performance Roller Chain", description: "Precision roller chains to ANSI and BS specifications — standard, specialty and high-performance series", filters: ["style", "materials", "duty"] },
  { key: "Engineered Chain", label: "Engineered Chain", description: "Heavy-duty engineered steel chains for demanding industrial applications", filters: ["style", "materials", "duty"] },
  { key: "Cast Chain", label: "Cast Chain", description: "Malleable and ductile cast iron conveyor chains", filters: ["style", "materials"] },
  { key: "Welded Steel Chain", label: "Welded Steel Chain", description: "Welded steel drag and conveyor chains for bulk material handling", filters: ["style", "duty"] },
  { key: "Forged Chain", label: "Forged Chain", description: "Forged steel chains for high-load and abrasive environments", filters: ["style", "materials", "duty"] },
  { key: "Overhead Chain", label: "Overhead Conveyor Chain", description: "Overhead conveyor and power-and-free chain systems", filters: ["style", "materials"] },
  { key: "Sharptop Chain", label: "Sharp Top Chain", description: "Sharp top and spike top chains for agricultural and forestry applications", filters: ["style", "materials"] },
  { key: "Kiln Chain", label: "Kiln Chain", description: "High-temperature kiln and dryer chains for cement and mineral processing", filters: ["style", "materials"] },
  { key: "Thermoforming Chain", label: "Thermoforming Chain", description: "Precision chains for plastic thermoforming and packaging machinery", filters: ["style", "materials"] },
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
  navy: "#0f2340", navyMid: "#1a3a5c", navyLt: "#2d5986",
  slate: "#334155", muted: "#64748b", border: "#e2e8f0",
  bg: "#f8fafc", bgCard: "#ffffff", text: "#0f172a",
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

function FloatingRFQButton() {
  const [count, setCount] = useState(() => getRFQCart().length);
  const [pulse, setPulse] = useState(false);
  useEffect(() => {
    const update = () => { const n = getRFQCart().length; if (n > count) setPulse(true); setCount(n); setTimeout(() => setPulse(false), 600); };
    window.addEventListener("rfq_cart_updated", update);
    return () => window.removeEventListener("rfq_cart_updated", update);
  }, [count]);
  if (count === 0) return null;
  return (
    <a href={createPageUrl("RFQCart")} style={{ textDecoration: "none" }}>
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

const UNI_TYPE_REMAP = { "Modular Plastic Belt": "Modular Belt" };

const CHAIN_TYPE_KEYS = new Set(["ANSI/BS Chain","Conveyor Chain","Engineered Chain","Cast Chain","Welded Steel Chain","Forged Chain","Overhead Chain","Sharptop Chain","Kiln Chain","Thermoforming Chain","Plastic Chain","Metal Chain"]);

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
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div onClick={e => e.stopPropagation()} style={{ background: "#fff", borderRadius: 10, width: "100%", maxWidth: 700, maxHeight: "90vh", display: "flex", flexDirection: "column", boxShadow: "0 24px 64px rgba(0,0,0,0.22)" }}>

        {/* Header */}
        <div style={{ background: C.navyMid, padding: "20px 26px", borderRadius: "10px 10px 0 0", flexShrink: 0 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div style={{ display: "flex", gap: 16, alignItems: "flex-start", flex: 1 }}>
              {product.image_url ? (
                <div style={{ background: "rgba(255,255,255,0.1)", borderRadius: 8, padding: 6, flexShrink: 0, width: 100, height: 76, display: "flex", alignItems: "center", justifyContent: "center" }}>
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
    if (added) { window.location.href = createPageUrl("RFQCart"); return; }
    addToRFQCart(product);
    setAdded(true);
  }

  return (
    <div onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      style={{ background: C.bgCard, borderRadius: 8, border: "1px solid " + (hovered ? C.navyMid : C.border), boxShadow: hovered ? "0 4px 16px rgba(26,58,92,0.09)" : "none", transition: "border-color 0.13s, box-shadow 0.13s", display: "flex", flexDirection: "column", overflow: "hidden" }}>
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
      <div style={{ borderTop: "1px solid " + C.bg, padding: "8px 15px", background: hovered ? "#f1f5f9" : C.bgCard, transition: "background 0.13s", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
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
    if (added) { window.location.href = createPageUrl("RFQCart"); return; }
    addToRFQCart(product);
    setAdded(true);
  }

  return (
    <div onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      style={{ background: C.bgCard, borderRadius: 8, border: "1px solid " + (hovered ? C.navyMid : C.border), boxShadow: hovered ? "0 2px 10px rgba(26,58,92,0.07)" : "none", transition: "border-color 0.13s, box-shadow 0.13s", display: "flex", alignItems: "center", gap: 0, overflow: "hidden", cursor: "pointer" }}>
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
            style={{ background: hovered === t.key ? C.navyMid : C.bgCard, border: "1px solid " + (hovered === t.key ? C.navyMid : C.border), borderRadius: 8, padding: "18px 20px", cursor: "pointer", transition: "all 0.15s", display: "flex", flexDirection: "column", gap: 6 }}>
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
            style={{ background: hovered === sub.key ? C.navyMid : C.bgCard, border: "1px solid " + (hovered === sub.key ? C.navyMid : C.border), borderRadius: 8, padding: "18px 20px", cursor: "pointer", transition: "all 0.15s", display: "flex", flexDirection: "column", gap: 6 }}>
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
            style={{ background: hovered === sub.key ? C.navyMid : C.bgCard, border: "1px solid " + (hovered === sub.key ? C.navyMid : C.border), borderRadius: 8, padding: "18px 20px", cursor: "pointer", transition: "all 0.15s", display: "flex", flexDirection: "column", gap: 6 }}>
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
    if (added) { window.location.href = createPageUrl("RFQCart"); return; }
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
    if (added) { window.location.href = createPageUrl("RFQCart"); return; }
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
      style={{ padding:"6px 14px", borderRadius:6, fontSize:11, fontWeight:700, cursor:"pointer",
        border: added ? "1px solid #16a34a" : "1px solid #2563eb",
        background: added ? "#f0fdf4" : "#eff6ff",
        color: added ? "#16a34a" : "#2563eb",
        whiteSpace:"nowrap", transition:"all 0.15s" }}>
      {added ? "✓ In RFQ" : "+ Add to RFQ"}
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
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.55)", zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}
      onClick={onClose}>
      <div style={{ background:C.bgCard, borderRadius:12, maxWidth:900, width:"100%", maxHeight:"90vh", overflowY:"auto", boxShadow:"0 20px 60px rgba(0,0,0,0.4)" }}
        onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={{ padding:"20px 24px 0", borderBottom:"1px solid "+C.border }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:12 }}>
            <div>
              <div style={{ fontSize:22, fontWeight:800, color:C.text }}>{record._specificPart || record.part_number}</div>
              <div style={{ fontSize:13, color:C.muted, marginTop:3 }}>{record.subcategory} · {record.product_type}</div>
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap" }}>
              <RFQButtonMac record={record} />
              <button onClick={() => printMacTearSheet(record)} style={{ background:C.navy, border:"none", color:"#fff", padding:"6px 14px", borderRadius:6, cursor:"pointer", fontSize:11, fontWeight:700 }}>
                Print Tear Sheet
              </button>
              <button onClick={onClose} style={{ background:"none", border:"none", fontSize:22, cursor:"pointer", color:C.muted, padding:"4px 8px" }}>×</button>
            </div>
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
        <div style={{ padding:"20px 24px" }}>
          {tab === "specs" && (
            <div>
              {/* Image + description */}
              <div style={{ display:"flex", gap:20, marginBottom:20 }}>
                {record.product_image && (
                  <img src={record.product_image} alt={record.part_number}
                    style={{ width:160, height:120, objectFit:"contain", borderRadius:8, background:C.bg, border:"1px solid "+C.border, padding:8, flexShrink:0 }} />
                )}
                <div>
                  {record.description && <p style={{ fontSize:14, color:C.text, lineHeight:1.6, margin:0 }}>{stripVendor(record.description)}</p>}
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
                        <tr key={ri} style={{ background: ri%2===0 ? C.bg : C.bgCard, borderBottom:"1px solid "+C.border }}>
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
                        <tr key={ri} style={{ background: ri%2===0 ? C.bg : C.bgCard, borderBottom:"1px solid "+C.border }}>
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
    if (added) { window.location.href = createPageUrl("RFQCart"); return; }
    addToRFQCart({ id: chain.id, _source:"mac", series: chain.part_number, type: chain.product_type || chain.category || "", style: chain.subcategory || "", category: chain.category || "", image_url: chain.product_image || "", materials:"", application:"" });
    setAdded(true);
  }
  return (
    <div onMouseEnter={() => setHovered(chain.part_number)} onMouseLeave={() => setHovered(null)}
      style={{ background: isHov ? C.navyMid : C.bgCard, border:"1px solid "+(isHov ? C.navyMid : C.border), borderRadius:10, overflow:"hidden", transition:"all 0.15s", display:"flex", flexDirection:"column" }}>
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
    if (added) { window.location.href = createPageUrl("RFQCart"); return; }
    addToRFQCart({ id: chain.id, _source:"mac", series: chain.part_number, type: chain.product_type || chain.category || "", style: chain.subcategory || "", category: chain.category || "", image_url: chain.product_image || "", materials:"", application:"" });
    setAdded(true);
  }
  return (
    <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ background: C.bgCard, border:"1px solid "+(hov ? C.navyMid : C.border), borderRadius:8, display:"flex", alignItems:"center", overflow:"hidden", transition:"all 0.15s", boxShadow: hov ? "0 2px 10px rgba(26,58,92,0.07)" : "none" }}>
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
        const chains = await MacChainProduct.filter({ category: "Welded Steel Chain" }, 1, 500);
        setRawMacRecords(chains || []);
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
      let all = [], page = 1;
      while (true) {
        const batch = await MacChainProduct.filter({ product_type: "Sprocket" }, page, 200);
        all = all.concat(batch);
        if (batch.length < 200) break;
        page++;
      }
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
            style={{ background: hovered===sub ? C.navyMid : C.bgCard, border:"1px solid "+(hovered===sub ? C.navyMid : C.border), borderRadius:8, padding:"18px 20px", cursor:"pointer", transition:"all 0.15s" }}>
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
            style={{ background: hovered === t.key ? C.navyMid : C.bgCard, border: "1px solid " + (hovered === t.key ? C.navyMid : C.border), borderRadius: 8, padding: "18px 20px", cursor: "pointer", transition: "all 0.15s", display: "flex", flexDirection: "column", gap: 6 }}>
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
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12 }}>
        {brands.map(b => (
          <div key={b} onClick={() => onSelect(b)} onMouseEnter={() => setHovered(b)} onMouseLeave={() => setHovered(null)}
            style={{ background: hovered === b ? C.navyMid : C.bgCard, border: "1px solid " + (hovered === b ? C.navyMid : C.border), borderRadius: 8, padding: "20px 22px", cursor: "pointer", transition: "all 0.15s", textAlign: "center" }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: hovered === b ? "#fff" : C.text, marginBottom: 4 }}>{b}</div>
            <div style={{ fontSize: 12, color: hovered === b ? "rgba(255,255,255,0.5)" : C.muted }}>{products.filter(p => p.brand === b).length} products</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Top Bar ──────────────────────────────────────────────────────────────────

function TopBar() {
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
        <a href={createPageUrl("RFQCart")} style={{ display: "flex", alignItems: "center", gap: 7, textDecoration: "none", background: cartCount > 0 ? "#2563eb" : "rgba(255,255,255,0.1)", color: "#fff", padding: "7px 14px", borderRadius: 7, fontSize: 12, fontWeight: 700, border: "1px solid " + (cartCount > 0 ? "#3b82f6" : "rgba(255,255,255,0.2)"), transition: "background 0.2s" }}>
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

export default function Home() {
  const [allData, setAllData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("home");
  const [selectedType, setSelectedType] = useState(null);
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [inChainMenu, setInChainMenu] = useState(false);
  const [selectedEngineeredSub, setSelectedEngineeredSub] = useState(null);
  const [selectedAnsiSub, setSelectedAnsiSub] = useState(null);
  const [selectedWeldedSub, setSelectedWeldedSub] = useState(null);
  const [rawMacRecords, setRawMacRecords] = useState([]);
  const [globalSearch, setGlobalSearch] = useState("");
  const [globalSelected, setGlobalSelected] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const [cat, elev, uni] = await Promise.all([
          CatalogProduct.filter({}, 1, 500), ElevatorBucket.filter({}, 1, 500), UniCatalog.filter({}, 1, 500),
        ]);
        let allied = [];
        try {
          // Fetch all pages — safe wrapper returns [] on error/empty
          const safeFetch = async (page) => { try { const r = await MacChainProduct.filter({}, page, 500); return r || []; } catch { return []; } };
          const [b1, b2, b3] = await Promise.all([safeFetch(1), safeFetch(2), safeFetch(3)]);
          allied = [...b1, ...b2, ...b3];
        } catch(e2) { console.error("MacChain load error:", e2); }
        setRawMacRecords(allied);
        setAllData([
          ...cat.map(normalizeCatalogProduct),
          ...elev.map(normalizeElevatorBucket),
          ...uni.map(normalizeUniCatalog),
          // Donghua hidden from UI (data preserved in DB)
          ...allied.map(normalizeAllied),
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
  const availableTypes = useMemo(() => PRODUCT_TYPES.filter(t => (typeCounts[t.key] || 0) > 0 || !!EXTERNAL_ROUTES[t.key]), [typeCounts]);
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
    if (EXTERNAL_ROUTES[typeKey]) { window.location.href = EXTERNAL_ROUTES[typeKey]; return; }
    if (typeKey === "Engineered Chain") { setSelectedType("Engineered Chain"); setSelectedEngineeredSub(null); setSelectedAnsiSub(null); setView("engineered_subs"); return; }
    if (typeKey === "ANSI/BS Chain") { setSelectedType("ANSI/BS Chain"); setSelectedAnsiSub(null); setSelectedEngineeredSub(null); setSelectedWeldedSub(null); setView("ansi_subs"); return; }
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

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "'Inter','Segoe UI',Arial,sans-serif", display: "flex", flexDirection: "column" }}>
      <TopBar />
      <div style={{ flex: 1, maxWidth: 1280, width: "100%", margin: "0 auto", padding: "32px 40px", boxSizing: "border-box" }}>
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
        Uniking Canada · Technical Product Reference · <a href={createPageUrl("RFQCart")} style={{ color: "#93c5fd", textDecoration: "none", fontWeight: 600 }}>Submit an RFQ →</a>
      </div>
      <FloatingRFQButton />
    </div>
  );
}
