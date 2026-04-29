import { useState, useEffect, useMemo } from "react";
import { UniCatalog, CatalogProduct, ElevatorBucket, DonghuaChain, MacChainProduct } from "@/api/entities";

const SHOW_BRAND = new Set(["Modular Belt", "Elevator Bucket", "4B Electronics"]);
const BRAND_GATED = new Set(["Modular Belt", "Elevator Bucket"]);
const EXTERNAL_ROUTES = {};


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
  { key: "Table Top Chain", label: "Table Top Chain", description: "Straight-running and side-flexing table top chains in steel and plastic", filters: ["style", "materials", "duty"] },
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
  { key: "Conveyor Roller", label: "Conveyor Rollers", description: "Standard, lagging, motorized drive and specialty conveyor rollers", filters: ["style", "duty"] },
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

const CHAIN_TYPE_KEYS = new Set(["ANSI/BS Chain","Conveyor Chain","Engineered Chain","Cast Chain","Welded Steel Chain","Forged Chain","Overhead Chain","Sharptop Chain","Kiln Chain","Thermoforming Chain","Table Top Chain"]);

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
    image_url: r.image_url || "", belt_data: null, sprocket_data: null,
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
  { key: "ANSI Standard Roller Chains",        label: "ANSI Standard Roller Chains",       description: "Single, double and triple-strand ANSI precision roller chains (#25 to #240)" },
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
    notes: Array.isArray(r.features) ? r.features.join(" · ") : (r.description || ""),
    catalog_url: "", tech_doc_url: "",
    image_url: r.product_image || "",
    diagram_image: r.diagram_image || "",
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

  const w = window.open("", "_blank");
  w.document.write(`<!DOCTYPE html><html><head><title>Tear Sheet — ${product.series}</title>
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
    <div>
      <div class="header-title">UNIKING CANADA</div>
      <div class="header-sub">Technical Product Reference</div>
    </div>
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
  ${product.notes ? `<div class="notes-box">${product.notes}</div>` : ""}

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
      <div>Uniking Canada · 1-800-xxx-xxxx · info@unikingcanada.com</div>
      <div class="confidential">Confidential — Internal Use Only</div>
    </div>
    <div class="footer-right">
      <div>${product.series}${product.style ? " / " + product.style : ""}</div>
      <div style="margin-top:2px;">No pricing information included</div>
    </div>
  </div>
</div>
</body></html>`);
  w.document.close();
}

// ─── Sprocket Table ───────────────────────────────────────────────────────────

function SprocketTable({ data }) {
  const rows = parseJSON(data);
  if (!Array.isArray(rows) || !rows.length) return <div style={{ color: C.muted, fontSize: 13 }}>No sprocket data available for this series.</div>;

  const cols = ["type","material","teeth","pitch_dia_in","pitch_dia_mm","outer_dia_in","outer_dia_mm","hub_width_in","hub_width_mm"];
  const labels = { type:"Type", material:"Material", teeth:"Teeth", pitch_dia_in:"Pitch Dia (in)", pitch_dia_mm:"Pitch Dia (mm)", outer_dia_in:"Outer Dia (in)", outer_dia_mm:"Outer Dia (mm)", hub_width_in:"Hub W (in)", hub_width_mm:"Hub W (mm)" };
  const active = cols.filter(k => rows.some(r => r[k] != null && r[k] !== ""));

  // Group by type
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

function BeltDataTable({ data }) {
  const rows = parseJSON(data);
  if (!Array.isArray(rows) || !rows.length) return null;
  const keys = ["material","strength_lbf","strength_nm","temp_min_f","temp_max_f","mass_lbft2","mass_kgm2"];
  const labels = { material:"Material", strength_lbf:"Strength (lbf)", strength_nm:"Strength (N/m)", temp_min_f:"Min °F", temp_max_f:"Max °F", mass_lbft2:"lb/ft²", mass_kgm2:"kg/m²" };
  const cols = keys.filter(k => rows.some(r => r[k] != null && r[k] !== ""));
  return (
    <div style={{ overflowX: "auto", borderRadius: 6, border: "1px solid " + C.border }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
        <thead>
          <tr style={{ background: C.navyMid }}>
            {cols.map(k => <th key={k} style={{ padding: "8px 10px", color: "#fff", fontWeight: 700, textAlign: "left", whiteSpace: "nowrap" }}>{labels[k]}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
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

  const hasBelt = !!(parseJSON(product.belt_data)?.length);
  const hasSprocket = !!(parseJSON(product.sprocket_data)?.length);

  const tabs = [
    ["specs", "Specifications"],
    hasBelt ? ["belt", "Belt Data"] : null,
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
              {product.notes ? (
                <div style={{ marginBottom: 16, fontSize: 13, color: C.slate, lineHeight: 1.75, background: C.bg, padding: "12px 14px", borderRadius: 6, borderLeft: "3px solid " + C.navyMid }}>
                  {product.notes}
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
  const topSpecs = Object.entries(product.specs)
    .filter(([, v]) => v != null && v !== "" && v !== "N/A" && String(v) !== "undefined")
    .slice(0, 3);

  return (
    <div onClick={() => onClick(product)} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      style={{ background: C.bgCard, borderRadius: 8, cursor: "pointer", border: "1px solid " + (hovered ? C.navyMid : C.border), boxShadow: hovered ? "0 4px 16px rgba(26,58,92,0.09)" : "none", transition: "border-color 0.13s, box-shadow 0.13s", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <div style={{ height: 3, background: C.navyMid, flexShrink: 0 }} />
      {product.image_url ? (
        <div style={{ background: "#f8fafc", borderBottom: "1px solid #f1f5f9", height: 110, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
          <img src={product.image_url} alt="" style={{ maxHeight: 98, maxWidth: "86%", objectFit: "contain" }} onError={e => { e.target.parentElement.style.display = "none"; }} />
        </div>
      ) : null}
      <div style={{ padding: "13px 15px", flex: 1, display: "flex", flexDirection: "column", gap: 5 }}>
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
      <div style={{ borderTop: "1px solid " + C.bg, padding: "8px 15px", background: hovered ? "#f1f5f9" : C.bgCard, transition: "background 0.13s" }}>
        <span style={{ fontSize: 11, fontWeight: 600, color: C.navyMid }}>View Specifications ›</span>
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

// ─── Product List ─────────────────────────────────────────────────────────────

function ProductList({ typeKey, brand, products: allProducts, showBrand }) {
  const [activeFilters, setActiveFilters] = useState({});
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);

  const filtered = useMemo(() => {
    let list = applyFilters(allProducts, activeFilters);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(p => [p.series, p.style, p.category, p.notes, p.materials, p.application].some(f => f && f.toLowerCase().includes(q)));
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
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..."
          style={{ padding: "8px 13px", border: "1px solid " + C.border, borderRadius: 6, fontSize: 13, outline: "none", width: 220 }} />
      </div>
      <FilterBar typeKey={typeKey} allProducts={allProducts} activeFilters={activeFilters} onChange={handleFilter} />
      {filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: 60, color: C.muted, fontSize: 14 }}>No products match your filters.</div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 14 }}>
          {filtered.map(p => <ProductCard key={p.id} product={p} showBrand={showBrand} onClick={setSelected} />)}
        </div>
      )}
      {selected ? <ProductModal product={selected} showBrand={showBrand} onClose={() => setSelected(null)} /> : null}
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

function MacProductModal({ record, slugMap, onSelect, onClose }) {
  const [tab, setTab] = useState("specs");
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
              <div style={{ fontSize:22, fontWeight:800, color:C.text }}>{record.part_number}</div>
              <div style={{ fontSize:13, color:C.muted, marginTop:3 }}>{record.subcategory} · {record.product_type}</div>
            </div>
            <button onClick={onClose} style={{ background:"none", border:"none", fontSize:22, cursor:"pointer", color:C.muted, padding:"4px 8px" }}>×</button>
          </div>
          <div style={{ display:"flex", gap:8, marginBottom:0 }}>
            {tabs.map(t => (
              <button key={t.key} onClick={() => setTab(t.key)}
                style={{ padding:"8px 16px", background: tab===t.key ? C.navy : "transparent", color: tab===t.key ? "#fff" : C.muted, border: tab===t.key ? "none" : "1px solid "+C.border, borderRadius:"6px 6px 0 0", cursor:"pointer", fontSize:13, fontWeight: tab===t.key ? 700 : 400, marginBottom:-1 }}>
                {t.label}
              </button>
            ))}
          </div>
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
                  {record.description && <p style={{ fontSize:14, color:C.text, lineHeight:1.6, margin:0 }}>{record.description}</p>}
                  {Array.isArray(record.features) && record.features.length > 0 && (
                    <ul style={{ margin:"10px 0 0", paddingLeft:18 }}>
                      {record.features.map((f,i) => <li key={i} style={{ fontSize:13, color:C.muted, marginBottom:4 }}>{f}</li>)}
                    </ul>
                  )}
                </div>
              </div>
              {/* Main specs table */}
              {Array.isArray(record.basic_headers) && record.basic_headers.length > 0 && Array.isArray(record.basic_rows) && record.basic_rows.length > 0 && (
                <div style={{ overflowX:"auto", marginBottom:16 }}>
                  <div style={{ fontSize:12, fontWeight:700, color:C.muted, textTransform:"uppercase", letterSpacing:1, marginBottom:8 }}>Specifications</div>
                  <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
                    <thead>
                      <tr style={{ background:C.navy }}>
                        {record.basic_headers.map((h,i) => <th key={i} style={{ padding:"8px 10px", color:"#fff", textAlign:"left", fontWeight:600, whiteSpace:"nowrap" }}>{h}</th>)}
                      </tr>
                    </thead>
                    <tbody>
                      {record.basic_rows.map((row, ri) => (
                        <tr key={ri} style={{ background: ri%2===0 ? C.bg : C.bgCard, borderBottom:"1px solid "+C.border }}>
                          {row.map((cell,ci) => <td key={ci} style={{ padding:"7px 10px", color:C.text, whiteSpace:"nowrap" }}>{cell}</td>)}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              {/* More specs table */}
              {Array.isArray(record.more_headers) && record.more_headers.length > 0 && Array.isArray(record.more_rows) && record.more_rows.length > 0 && (
                <div style={{ overflowX:"auto" }}>
                  <div style={{ fontSize:12, fontWeight:700, color:C.muted, textTransform:"uppercase", letterSpacing:1, marginBottom:8 }}>Additional Data</div>
                  <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
                    <thead>
                      <tr style={{ background:C.navyMid }}>
                        {record.more_headers.map((h,i) => <th key={i} style={{ padding:"8px 10px", color:"#fff", textAlign:"left", fontWeight:600, whiteSpace:"nowrap" }}>{h}</th>)}
                      </tr>
                    </thead>
                    <tbody>
                      {record.more_rows.map((row, ri) => (
                        <tr key={ri} style={{ background: ri%2===0 ? C.bg : C.bgCard, borderBottom:"1px solid "+C.border }}>
                          {row.map((cell,ci) => <td key={ci} style={{ padding:"7px 10px", color:C.text, whiteSpace:"nowrap" }}>{cell}</td>)}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {tab === "sprockets" && (
            <div>
              <div style={{ fontSize:12, fontWeight:700, color:C.muted, textTransform:"uppercase", letterSpacing:1, marginBottom:12 }}>Compatible Sprockets — click to view full specs</div>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(200px,1fr))", gap:10 }}>
                {(record.related_sprockets||[]).map((sp,i) => {
                  const full = slugMap?.[sp.slug] || null;
                  return (
                    <div key={i}
                      onClick={() => full && onSelect({...full, _parentPart: record.part_number, _parentRecord: record})}
                      style={{ border:"1px solid "+C.border, borderRadius:8, padding:"12px 14px", background:C.bg, cursor: full ? "pointer" : "default", transition:"all 0.15s" }}
                      onMouseEnter={e => { if(full){ e.currentTarget.style.background=C.navyMid; e.currentTarget.style.borderColor=C.navyMid; e.currentTarget.querySelector('.card-title').style.color="#fff"; }}}
                      onMouseLeave={e => { e.currentTarget.style.background=C.bg; e.currentTarget.style.borderColor=C.border; if(e.currentTarget.querySelector('.card-title')) e.currentTarget.querySelector('.card-title').style.color=C.text; }}>
                      {sp.image && <img src={sp.image} alt={sp.part_number} style={{ width:"100%", height:70, objectFit:"contain", marginBottom:8, borderRadius:4 }} />}
                      <div className="card-title" style={{ fontWeight:700, fontSize:13, color:C.text, marginBottom:2 }}>{sp.part_number}</div>
                      <div style={{ fontSize:12, color:C.muted }}>{sp.name || sp.category}</div>
                      {full && <div style={{ fontSize:11, color:C.navy, marginTop:6, fontWeight:600 }}>View specs →</div>}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {tab === "pins" && (
            <div>
              <div style={{ fontSize:12, fontWeight:700, color:C.muted, textTransform:"uppercase", letterSpacing:1, marginBottom:12 }}>Compatible Pins & Connecting Links — click to view full specs</div>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(200px,1fr))", gap:10 }}>
                {(record.related_pins||[]).map((pin,i) => {
                  const full = slugMap?.[pin.slug] || null;
                  return (
                    <div key={i}
                      onClick={() => full && onSelect({...full, _parentPart: record.part_number, _parentRecord: record})}
                      style={{ border:"1px solid "+C.border, borderRadius:8, padding:"12px 14px", background:C.bg, cursor: full ? "pointer" : "default", transition:"all 0.15s" }}
                      onMouseEnter={e => { if(full){ e.currentTarget.style.background=C.navyMid; e.currentTarget.style.borderColor=C.navyMid; }}}
                      onMouseLeave={e => { e.currentTarget.style.background=C.bg; e.currentTarget.style.borderColor=C.border; }}>
                      {pin.image && <img src={pin.image} alt={pin.part_number} style={{ width:"100%", height:70, objectFit:"contain", marginBottom:8, borderRadius:4 }} />}
                      <div style={{ fontWeight:700, fontSize:13, color:C.text, marginBottom:2 }}>{pin.part_number}</div>
                      <div style={{ fontSize:12, color:C.muted }}>{pin.name || pin.category}</div>
                      {full && <div style={{ fontSize:11, color:C.navy, marginTop:6, fontWeight:600 }}>View specs →</div>}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {tab === "attachments" && (
            <div>
              <div style={{ fontSize:12, fontWeight:700, color:C.muted, textTransform:"uppercase", letterSpacing:1, marginBottom:12 }}>Available Attachments — click to view full specs</div>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(200px,1fr))", gap:10 }}>
                {(record.related_attachments||[]).map((att,i) => {
                  const full = slugMap?.[att.slug] || null;
                  return (
                    <div key={i}
                      onClick={() => full && onSelect({...full, _parentPart: record.part_number, _parentRecord: record})}
                      style={{ border:"1px solid "+C.border, borderRadius:8, padding:"12px 14px", background:C.bg, cursor: full ? "pointer" : "default", transition:"all 0.15s" }}
                      onMouseEnter={e => { if(full){ e.currentTarget.style.background=C.navyMid; e.currentTarget.style.borderColor=C.navyMid; }}}
                      onMouseLeave={e => { e.currentTarget.style.background=C.bg; e.currentTarget.style.borderColor=C.border; }}>
                      {att.image && <img src={att.image} alt={att.part_number} style={{ width:"100%", height:70, objectFit:"contain", marginBottom:8, borderRadius:4 }} />}
                      <div style={{ fontWeight:700, fontSize:13, color:C.text, marginBottom:2 }}>{att.part_number}</div>
                      <div style={{ fontSize:12, color:C.muted }}>{att.name || att.category}</div>
                      {full && <div style={{ fontSize:11, color:C.navy, marginTop:6, fontWeight:600 }}>View specs →</div>}
                    </div>
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

function WeldedSeriesView({ rawMacRecords }) {
  const [selectedSeries, setSelectedSeries] = useState(null);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [hovered, setHovered] = useState(null);

  // Slug → full record lookup map
  const slugMap = useMemo(() => {
    const m = {};
    for (const r of rawMacRecords || []) { if (r.slug) m[r.slug] = r; }
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

        {/* Chain cards grid */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(240px,1fr))", gap:14 }}>
          {chains.map(chain => (
            <div key={chain.id || chain.part_number}
              onClick={() => setSelectedRecord(chain)}
              onMouseEnter={() => setHovered(chain.part_number)}
              onMouseLeave={() => setHovered(null)}
              style={{ background: hovered===chain.part_number ? C.navyMid : C.bgCard, border:"1px solid "+(hovered===chain.part_number ? C.navyMid : C.border), borderRadius:10, padding:"16px 18px", cursor:"pointer", transition:"all 0.15s" }}>
              {chain.product_image && (
                <img src={chain.product_image} alt={chain.part_number}
                  style={{ width:"100%", height:100, objectFit:"contain", borderRadius:6, background:C.bg, marginBottom:10, padding:6 }} />
              )}
              <div style={{ fontSize:15, fontWeight:800, color: hovered===chain.part_number ? "#fff" : C.text, marginBottom:4 }}>{chain.part_number}</div>
              <div style={{ fontSize:12, color: hovered===chain.part_number ? "rgba(255,255,255,0.65)" : C.muted, marginBottom:8 }}>{chain.description?.slice(0,80)}{chain.description?.length>80?"...":""}</div>
              <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                {chain.related_sprockets?.length > 0 && (
                  <span style={{ fontSize:11, padding:"2px 8px", borderRadius:20, background: hovered===chain.part_number ? "rgba(255,255,255,0.15)" : C.bg, color: hovered===chain.part_number ? "#fff" : C.muted, border:"1px solid "+(hovered===chain.part_number ? "rgba(255,255,255,0.2)" : C.border) }}>
                    {chain.related_sprockets.length} Sprockets
                  </span>
                )}
                {chain.related_pins?.length > 0 && (
                  <span style={{ fontSize:11, padding:"2px 8px", borderRadius:20, background: hovered===chain.part_number ? "rgba(255,255,255,0.15)" : C.bg, color: hovered===chain.part_number ? "#fff" : C.muted, border:"1px solid "+(hovered===chain.part_number ? "rgba(255,255,255,0.2)" : C.border) }}>
                    {chain.related_pins.length} Pins
                  </span>
                )}
                {chain.related_attachments?.length > 0 && (
                  <span style={{ fontSize:11, padding:"2px 8px", borderRadius:20, background: hovered===chain.part_number ? "rgba(255,255,255,0.15)" : C.bg, color: hovered===chain.part_number ? "#fff" : C.muted, border:"1px solid "+(hovered===chain.part_number ? "rgba(255,255,255,0.2)" : C.border) }}>
                    {chain.related_attachments.length} Attachments
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Product modal */}
        {selectedRecord && <MacProductModal record={selectedRecord} slugMap={slugMap} onSelect={setSelectedRecord} onClose={() => setSelectedRecord(null)} />}
      </div>
    );
  }

  // Top-level: series type cards
  if (weldedChains.length === 0) return (
    <div style={{ padding:40, textAlign:"center", color:C.muted }}>
      <div style={{ fontSize:32, marginBottom:12 }}>⛓</div>
      <div style={{ fontSize:16, fontWeight:600 }}>Loading Welded Steel Chain data...</div>
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
  return (
    <div style={{ background: C.navy, height: 56, display: "flex", alignItems: "center", padding: "0 40px", justifyContent: "space-between", flexShrink: 0 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ color: "#fff", fontWeight: 800, fontSize: 15, letterSpacing: "0.5px" }}>UNIKING CANADA</span>
        <span style={{ color: "rgba(255,255,255,0.25)", fontSize: 13 }}>/</span>
        <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 13 }}>Product Catalog</span>
      </div>
      <span style={{ color: "rgba(255,255,255,0.25)", fontSize: 11, letterSpacing: "1px", textTransform: "uppercase" }}>Confidential · Internal Use Only</span>
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

  useEffect(() => {
    async function load() {
      try {
        const [cat, elev, uni, dh, allied] = await Promise.all([
          CatalogProduct.list(), ElevatorBucket.list(), UniCatalog.list(),
          DonghuaChain.list(), MacChainProduct.list()
        ]);
        setRawMacRecords(allied);
        setAllData([
          ...cat.map(normalizeCatalogProduct),
          ...elev.map(normalizeElevatorBucket),
          ...uni.map(normalizeUniCatalog),
          ...dh.map(normalizeDonghuaChain),
          ...allied.map(normalizeAllied),
        ]);
      } catch (e) { console.error("Catalog load error:", e); }
      finally { setLoading(false); }
    }
    load();
  }, []);

  const typeCounts = useMemo(() => { const c = {}; for (const p of allData) c[p.type] = (c[p.type] || 0) + 1; return c; }, [allData]);
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
          <TypeGrid types={availableTypes} counts={typeCounts} onSelect={selectType} />
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
          <ProductList typeKey={selectedType} brand={selectedBrand} products={viewProducts} showBrand={showBrand} />
        )}
      </div>
      <div style={{ borderTop: "1px solid " + C.border, padding: "14px 40px", textAlign: "center", fontSize: 11, color: "#cbd5e1" }}>
        Uniking Canada · Technical Product Reference · Confidential — Internal Use Only
      </div>
    </div>
  );
}
