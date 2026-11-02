// ─────────────────────────────────────────────────────────────────────────────
// Movex Modular Belting — Imperial Catalog Data
// Source: Movex Conveyor Modular Belts and Chains Catalog (Imperial, 2024)
//         + Blueline® Modular Belts & Sprockets Catalog V4 (2025)
// ─────────────────────────────────────────────────────────────────────────────

import { EUROBELT_SERIES as _EB_SERIES, EUROBELT_CATALOG_URL as _EB_CAT_URL } from "./eurobeltData";

export const MOVEX_LOGO = "https://wpbackend.movexii.com/wp-content/uploads/2024/11/logo_bianco.svg";
export const MOVEX_LOGO_DARK = "https://wpbackend.movexii.com/wp-content/uploads/2024/09/logoMovex-1.svg";
export const MOVEX_CATALOG_URL = "https://wpbackend.movexii.com/wp-content/uploads/2024/11/Movex_Conveyor_modular_belts_and_chains_Catalog_Digital_Imperial.pdf";
export const MOVEX_BLUELINE_URL = "https://wpbackend.movexii.com/wp-content/uploads/2026/03/Movex_Blueline_ModularBeltsAndSporckets_Digital_V6.pdf";
export const MOVEX_WEBSITE = "https://www.movexii.com/en/prodcat/modular-belts";

const IMG = {
  S520_FT:   "https://movexps.publifarm.com/img/p/8/7/0/1/8701-large_default.jpg",
  S520_HDFT: "https://movexps.publifarm.com/img/p/8/7/0/2/8702-large_default.jpg",
  S520_FTT:  "https://movexps.publifarm.com/img/p/8/7/0/3/8703-large_default.jpg",
  S520_FG:   "https://movexps.publifarm.com/img/p/8/7/0/4/8704-large_default.jpg",
  S520_GT:   "https://movexps.publifarm.com/img/p/8/7/0/5/8705-large_default.jpg",
  S520_GTSI: "https://movexps.publifarm.com/img/p/8/7/0/6/8706-large_default.jpg",
  S520_LBP:  "https://movexps.publifarm.com/img/p/8/7/0/7/8707-large_default.jpg",
  S520_PLBP: "https://movexps.publifarm.com/img/p/8/7/0/8/8708-large_default.jpg",
  S520_MAG:  "https://movexps.publifarm.com/img/p/8/6/9/8/8698-large_default.jpg",
  S521_FT:   "https://movexps.publifarm.com/img/p/8/7/0/9/8709-large_default.jpg",
  S521_FT1T: "https://movexps.publifarm.com/img/p/8/7/1/0/8710-large_default.jpg",
  S522_HDFT:   "https://movexps.publifarm.com/img/p/8/7/1/1/8711-large_default.jpg",
  S522_HDFT1T: "https://movexps.publifarm.com/img/p/8/7/1/2/8712-large_default.jpg",
  S525_HDFT:   "https://movexps.publifarm.com/img/p/8/7/1/6/8716-large_default.jpg",
  S525_HDFTRIB:"https://movexps.publifarm.com/img/p/8/7/1/7/8717-large_default.jpg",
  S525_FTT:    "https://movexps.publifarm.com/img/p/8/7/1/8/8718-large_default.jpg",
  S525_HDFG:   "https://movexps.publifarm.com/img/p/8/7/1/9/8719-large_default.jpg",
  S525_HDGT:   "https://movexps.publifarm.com/img/p/8/7/2/0/8720-large_default.jpg",
  S525_HDGTSI: "https://movexps.publifarm.com/img/p/8/7/2/1/8721-large_default.jpg",
  S530_FT:   "https://movexps.publifarm.com/img/p/8/7/2/2/8722-large_default.jpg",
  S530_FTT:  "https://movexps.publifarm.com/img/p/8/7/2/3/8723-large_default.jpg",
  S530_GT:   "https://movexps.publifarm.com/img/p/8/7/2/4/8724-large_default.jpg",
  S530_GTSI: "https://movexps.publifarm.com/img/p/8/7/2/5/8725-large_default.jpg",
  S530_LBP:  "https://movexps.publifarm.com/img/p/1/0/6/6/3/10663-large_default.jpg",
  S530_PLBP: "https://movexps.publifarm.com/img/p/1/0/6/6/4/10664-large_default.jpg",
  S550_FT:   "https://movexps.publifarm.com/img/p/8/7/2/8/8728-large_default.jpg",
  S550_FT1T: "https://movexps.publifarm.com/img/p/8/7/2/9/8729-large_default.jpg",
  S550_FLT:  "https://movexps.publifarm.com/img/p/8/6/9/7/8697-large_default.jpg",
  S550_MAG:  "https://movexps.publifarm.com/img/p/8/6/9/9/8699-large_default.jpg",
  S590_FT:   "https://movexps.publifarm.com/img/p/8/7/1/3/8713-large_default.jpg",
  S590_FT1T: "https://movexps.publifarm.com/img/p/8/7/1/4/8714-large_default.jpg",
  S590_FTT:  "https://movexps.publifarm.com/img/p/8/7/1/5/8715-large_default.jpg",
};

// ── Blueline® product images (from movexii.com product catalog) ────────────────
const BL = {
  // 7870 series (8 mm pitch)
  S7870_FT: "https://movexps.publifarm.com/img/p/1/0/7/9/0/10790-large_default.jpg",
  S7870_FG: "https://movexps.publifarm.com/img/p/1/0/6/3/4/10634-large_default.jpg",
  S7870_DT: "https://movexps.publifarm.com/img/p/1/0/6/3/5/10635-large_default.jpg",
  S7870_CT: "https://movexps.publifarm.com/img/p/1/0/6/3/6/10636-large_default.jpg",
  S7870_NS: "https://movexps.publifarm.com/img/p/1/0/6/3/7/10637-large_default.jpg",
  // 7185 series (12.7 mm pitch)
  S7185_FG: "https://movexps.publifarm.com/img/p/1/0/6/5/5/10655-large_default.jpg",
  // 7220 series (12.7 mm pitch)
  S7220_FT: "https://movexps.publifarm.com/img/p/1/0/6/5/6/10656-large_default.jpg",
  S7220_GT: "https://movexps.publifarm.com/img/p/1/0/6/5/7/10657-large_default.jpg",
  // 7233 series (12.7 mm pitch)
  S7233_FG:    "https://movexps.publifarm.com/img/p/1/0/6/5/8/10658-large_default.jpg",
  S7233_FGGT:  "https://movexps.publifarm.com/img/p/1/0/6/5/9/10659-large_default.jpg",
  // 7234 series (12.7 mm pitch)
  S7234_NT: "https://movexps.publifarm.com/img/p/1/0/6/6/0/10660-large_default.jpg",
  // 7510 series (25.4 mm pitch)
  S7510_FT: "https://movexps.publifarm.com/img/p/1/0/6/3/8/10638-large_default.jpg",
  S7510_NT: "https://movexps.publifarm.com/img/p/1/0/6/4/0/10640-large_default.jpg",
  S7510_DT: "https://movexps.publifarm.com/img/p/1/0/6/4/1/10641-large_default.jpg",
  S7510_MT: "https://movexps.publifarm.com/img/p/1/0/6/4/2/10642-large_default.jpg",
  // 7520 series (25.4 mm pitch)
  S7520_FT: "https://movexps.publifarm.com/img/p/1/0/6/4/5/10645-large_default.jpg",
  S7520_FG: "https://movexps.publifarm.com/img/p/1/0/6/4/7/10647-large_default.jpg",
  // 7585 series (25.7 mm pitch)
  S7585_FG: "https://movexps.publifarm.com/img/p/1/0/6/4/4/10644-large_default.jpg",
  // 7010 series (50.8 mm pitch)
  S7010_FT:   "https://movexps.publifarm.com/img/p/1/0/6/4/8/10648-large_default.jpg",
  S7010_HDFT: "https://movexps.publifarm.com/img/p/1/0/6/4/9/10649-large_default.jpg",
  S7010_CT:   "https://movexps.publifarm.com/img/p/1/0/6/5/0/10650-large_default.jpg",
  S7010_NT:   "https://movexps.publifarm.com/img/p/1/0/6/5/1/10651-large_default.jpg",
  S7010_PT:   "https://movexps.publifarm.com/img/p/1/0/6/5/2/10652-large_default.jpg",
  S7010_HDPT: "https://movexps.publifarm.com/img/p/1/0/6/5/3/10653-large_default.jpg",
  // 7540/7544 sideflexing series (25.4 mm pitch)
  S7540_RFG:  "https://movexps.publifarm.com/img/p/1/0/1/3/6/10136-large_default.jpg",
  S7544_TRFG: "https://movexps.publifarm.com/img/p/1/0/1/3/7/10137-large_default.jpg",
  S7544_TRGT: "https://movexps.publifarm.com/img/p/1/0/1/3/8/10138-large_default.jpg",
  // Sprockets
  SP_7870:         "https://movexps.publifarm.com/img/p/1/1/2/0/1/11201-medium_default.jpg",
  SP_7220_7234:    "https://movexps.publifarm.com/img/p/1/1/1/7/2/11172-medium_default.jpg",
  SP_7510_7520:    "https://movexps.publifarm.com/img/p/1/1/2/0/5/11205-medium_default.jpg",
  SP_7510_7520_M:  "https://movexps.publifarm.com/img/p/1/1/1/6/3/11163-medium_default.jpg",
  SP_7540_7544:    "https://movexps.publifarm.com/img/p/1/1/1/6/5/11165-medium_default.jpg",
  SP_7540_7544_M:  "https://movexps.publifarm.com/img/p/1/1/1/6/6/11166-medium_default.jpg",
  SP_7544_SUP:     "https://movexps.publifarm.com/img/p/1/1/2/0/6/11206-medium_default.jpg",
  SP_7010_7290:    "https://movexps.publifarm.com/img/p/1/1/2/0/7/11207-medium_default.jpg",
  SP_7010_7290_M:  "https://movexps.publifarm.com/img/p/1/1/1/7/0/11170-medium_default.jpg",
  SP_ZERO_CONTACT: "https://movexps.publifarm.com/img/p/1/1/1/5/8/11158-medium_default.jpg",
  SP_ZERO_PRO:     "https://movexps.publifarm.com/img/p/1/1/1/6/0/11160-medium_default.jpg",
};

export const MOVEX_MATERIALS = {
  LFA:  { label: "LFA — Low Friction Acetal",         abbr: "LFA",  color: "White",       tempC: "-30 to +80",  tempF: "-22 to 176",  notes: "General purpose, low friction acetal resin. FDA-compliant." },
  LFB:  { label: "LFB — Low Friction Acetal (Blue)",  abbr: "LFB",  color: "Blue",        tempC: "-30 to +80",  tempF: "-22 to 176",  notes: "Blue-tinted LFA for visual identification. FDA-compliant." },
  MX:   { label: "MX — Performance PBT",              abbr: "MX",   color: "Natural",     tempC: "-40 to +130", tempF: "-40 to 266",  notes: "High-performance PBT. Superior chemical resistance." },
  PP:   { label: "PP — Polypropylene",                abbr: "PP",   color: "Natural",     tempC: "-20 to +100", tempF: "-4 to 212",   notes: "Lightweight, chemical resistant. Good for wet environments." },
  MPX:  { label: "MPX — Lubricated Acetal",           abbr: "MPX",  color: "Grey",        tempC: "-30 to +80",  tempF: "-22 to 176",  notes: "Self-lubricating acetal. Ideal for dry running conditions." },
  PFX:  { label: "PFX — Extra Performance PBT",       abbr: "PFX",  color: "Natural",     tempC: "-40 to +130", tempF: "-40 to 266",  notes: "Extra performance PBT for demanding dry run applications." },
  POM:  { label: "POM — Acetal Resin (Standard)",     abbr: "POM",  color: "White/Cyan",  tempC: "-40 to +80",  tempF: "-40 to 176",  notes: "Standard acetal resin (BluLub® treated). For food contact." },
  BluLub: { label: "BluLub® — Self-Lubricating POM",  abbr: "BL",   color: "White/Cyan",  tempC: "-40 to +80",  tempF: "-40 to 176",  notes: "Proprietary BluLub® self-lubricating POM for reduced friction." },
  LFC:  { label: "LFC — Low Friction Acetal (Cyan)",   abbr: "LFC",  color: "RAL 5005 Cyan", tempC: "-40 to +80",  tempF: "-40 to 176",  notes: "Cyan low-friction acetal. FDA/EU compliant for food contact." },
  LFW:  { label: "LFW — Low Friction Acetal (White)",  abbr: "LFW",  color: "White",       tempC: "-40 to +80",  tempF: "-40 to 176",  notes: "White low-friction acetal. FDA/EU compliant for food contact." },
  PKC:  { label: "PKC — Polyketone (Cyan)",            abbr: "PKC",  color: "Cyan",       tempC: "-40 to +80",  tempF: "-40 to 176",  notes: "Polyketone for red meat processing. 12% lighter, 3x impact resistance vs POM. FDA/EU compliant." },
  PKW:  { label: "PKW — Polyketone (White)",           abbr: "PKW",  color: "White",      tempC: "-40 to +80",  tempF: "-40 to 176",  notes: "White polyketone for primary red meat processing. FDA/EU compliant." },
  MDX:  { label: "MDX — Metal Detectable X-Ray POM",   abbr: "MDX",  color: "White/Cyan", tempC: "-40 to +80",  tempF: "-40 to 176",  notes: "X-ray detectable POM. BRC/IFS/FDA/HACCP compliant. Available on all Blueline series." },
  PKX:  { label: "PKX — Polyketone (Food/Meat)",       abbr: "PKX",  color: "White",      tempC: "-40 to +80",  tempF: "-40 to 176",  notes: "Polyketone for primary red meat. No food contamination, high impact/chemical resistance. FDA/EU compliant." },
};

const SP_520_MACHINED = "https://movexps.publifarm.com/img/p/1/1/0/5/6/11056-medium_default.jpg";
const SP_520_MOLDED = "https://movexps.publifarm.com/img/p/1/1/0/5/8/11058-medium_default.jpg";

const S520_SPROCKETS = [
  { name: "520 Split Machined Sprocket", teeth: "12-21T options", bore: "Square / Round", material: "Polyamide (PA)", notes: "Machined sprocket for 520/521/522 series. Available in 12-21 tooth configurations.", image: SP_520_MACHINED, url: "https://www.movexii.com/en/p/sprockets-turning-disks/belt-sprockets/520-split-machined-sprocketm" },
  { name: "520 Split Molded Sprocket", teeth: "12-21T options", bore: "Square / Round", material: "Polyamide (PA)", notes: "Molded sprocket for 520/521/522 series. Cost-effective alternative.", image: SP_520_MOLDED, url: "https://www.movexii.com/en/p/sprockets-turning-disks/belt-sprockets/520-split-molded-sprocketm" },
];

const S520_ACCESSORIES = [
  { name: "520 Nosebar — Narrow", type: "nosebar", image: null, notes: "For tight product transfers on 520 series.", url: "https://www.movexii.com/en/prodcat/modular-belts" },
  { name: "520 Straight Flight", type: "flight", image: null, notes: "Straight incline flight compatible with 520 FT.", url: "https://www.movexii.com/en/prodcat/accessories" },
  { name: "520 Non-Stick Flight", type: "flight", image: null, notes: "Non-stick surface flight for 520 series.", url: "https://www.movexii.com/en/prodcat/accessories" },
  { name: "520 Sidewall", type: "sideguard", image: null, notes: "Molded sidewall for product containment on 520 series.", url: "https://www.movexii.com/en/prodcat/accessories" },
  { name: "Snap-In Clip (520)", type: "rod", image: null, notes: "Standard snap-in rod retention clip for 520 series.", url: "https://www.movexii.com/en/prodcat/accessories" },
];

const S525_ACCESSORIES = [
  { name: "525 HD Nosebar", type: "nosebar", image: null, notes: "Heavy-duty nosebar for 525 series.", url: "https://www.movexii.com/en/prodcat/modular-belts" },
  { name: "525 HD Straight Flight", type: "flight", image: null, notes: "Heavy-duty straight flight for 525 series.", url: "https://www.movexii.com/en/prodcat/accessories" },
  { name: "525 HD Sidewall", type: "sideguard", image: null, notes: "Heavy-duty molded sidewall for 525 HD series.", url: "https://www.movexii.com/en/prodcat/accessories" },
  { name: "Snap-In Clip (525)", type: "rod", image: null, notes: "Snap-in rod retention clip for 525 HD series.", url: "https://www.movexii.com/en/prodcat/accessories" },
];

const S530_ACCESSORIES = [
  { name: "530 Nosebar — Narrow", type: "nosebar", image: null, notes: "Narrow nosebar for 530 series tight transfers.", url: "https://www.movexii.com/en/prodcat/modular-belts" },
  { name: "530 Straight Flight", type: "flight", image: null, notes: "Straight flight for 530 series incline conveying.", url: "https://www.movexii.com/en/prodcat/accessories" },
  { name: "530 Sidewall", type: "sideguard", image: null, notes: "Molded sidewall for 530 series.", url: "https://www.movexii.com/en/prodcat/accessories" },
];

const S550_ACCESSORIES = [
  { name: "550 Nosebar", type: "nosebar", image: null, notes: "Nosebar for 550 series.", url: "https://www.movexii.com/en/prodcat/modular-belts" },
  { name: "550 Flight Top Attachment", type: "flight", image: null, notes: "Clip-on flight top for 550 FT belt.", url: "https://www.movexii.com/en/prodcat/accessories" },
];

const S590_ACCESSORIES = [
  { name: "590 Nosebar — Narrow (Art. 22818)", type: "nosebar", image: null, notes: "Narrow nosebar for 590 series. Art-Nr. 22818.", url: "https://www.movexii.com/en/prodcat/modular-belts" },
  { name: "590 Nosebar — Wide (Art. 22819)", type: "nosebar", image: null, notes: "Wide nosebar for 590 series. Art-Nr. 22819.", url: "https://www.movexii.com/en/prodcat/modular-belts" },
  { name: "590 Straight Flight", type: "flight", image: null, notes: "Straight incline flight for 590 series.", url: "https://www.movexii.com/en/prodcat/accessories" },
];

const _BASE_MOVEX_SERIES = [
  // ── 520 SERIES
  {
    id: "S520", name: "Series 520", beltType: "Straight-Running",
    pitch_mm: 10, pitch_in: 0.394, catalogPage: 122, image: IMG.S520_FT,
    description: "The 520 series is the most common modular belt in the market. Ideal for any type of application thanks to its exceptional versatility. 10 mm pitch with snap-in clip fixation.",
    applications: ["Beverage packaging", "Food processing", "General conveying", "Accumulation", "Incline/decline", "Sorting", "Packaging lines"],
    advantages: ["Most versatile series in Movex range", "10 mm pitch for smooth transfers", "Snap-in clip fixation", "Multiple materials including food-grade LFA and MX", "Width increment: 85 mm (3.35\")"],
    sprockets: S520_SPROCKETS, accessories: S520_ACCESSORIES,
    techChartUrl: MOVEX_CATALOG_URL, catalogPageRef: "122",
    min_width_mm: 85, min_width_in: 3.35, width_increment_mm: 85, width_increment_in: 3.35,
    fixation: "Snap-in Clip",
    styles: [
      { key: "flat_top", label: "520 Flat Top", openArea: "0%", surface: "Closed / Smooth", image: IMG.S520_FT,
        description: "Standard smooth flat top belt for general conveying.", applications: ["General conveying", "Beverage packaging", "Accumulation", "Food processing"],
        beltData: [
          { material: "LFA", label: "LFA — Low Friction Acetal", pinMaterial: "PBT White", strengthNm: 21500, strengthLbsFt: 1473, massKgM2: 7.8, massLbFt2: 1.60, tempC: "-30 to +80", tempF: "-22 to 176" },
          { material: "MX",  label: "MX — Performance PBT",     pinMaterial: "PBT White", strengthNm: 18000, strengthLbsFt: 1233, massKgM2: 7.8, massLbFt2: 1.60, tempC: "-40 to +130", tempF: "-40 to 266" },
          { material: "PP",  label: "PP — Polypropylene",       pinMaterial: "PBT White", strengthNm: 14000, strengthLbsFt:  959, massKgM2: 6.8, massLbFt2: 1.39, tempC: "-20 to +100", tempF: "-4 to 212" },
          { material: "MPX", label: "MPX — Lubricated Acetal",  pinMaterial: "PBT White", strengthNm: 21500, strengthLbsFt: 1473, massKgM2: 7.8, massLbFt2: 1.60, tempC: "-30 to +80",  tempF: "-22 to 176" },
          { material: "LFB", label: "LFB — Low Friction Acetal (Blue)", pinMaterial: "PBT White", strengthNm: 21500, strengthLbsFt: 1473, massKgM2: 7.8, massLbFt2: 1.60, tempC: "-30 to +80", tempF: "-22 to 176" },
        ],
        notes: ["Positioner versions A, B, C available.", "Width increment 85 mm."], url: "https://www.movexii.com/en/p/520-flat-top" },
      { key: "heavy_duty_flat_top", label: "520 Heavy Duty Flat Top", openArea: "0%", surface: "Closed / Heavy Duty", image: IMG.S520_HDFT,
        description: "Heavy-duty version with reinforced module for higher load applications.",
        applications: ["Heavy load conveying", "Automotive parts", "Industrial manufacturing"],
        beltData: [
          { material: "LFA", label: "LFA — Low Friction Acetal", pinMaterial: "PBT White", strengthNm: 28000, strengthLbsFt: 1917, massKgM2: 9.5, massLbFt2: 1.95, tempC: "-30 to +80", tempF: "-22 to 176" },
          { material: "MX",  label: "MX — Performance PBT",     pinMaterial: "PBT White", strengthNm: 24000, strengthLbsFt: 1644, massKgM2: 9.5, massLbFt2: 1.95, tempC: "-40 to +130", tempF: "-40 to 266" },
        ],
        notes: ["Reinforced HD module design."], url: "https://www.movexii.com/en/p/520-heavy-duty-flat-top" },
      { key: "flat_top_transfer", label: "520 Flat Top Transfer", openArea: "0%", surface: "Closed / Transfer", image: IMG.S520_FTT,
        description: "Transfer-optimized flat top for tight product transfers.",
        applications: ["Product transfers", "Dead-plate transfers", "Packaging lines"],
        beltData: [
          { material: "LFA", label: "LFA — Low Friction Acetal", pinMaterial: "PBT White", strengthNm: 18000, strengthLbsFt: 1233, massKgM2: 6.5, massLbFt2: 1.33, tempC: "-30 to +80", tempF: "-22 to 176" },
          { material: "MX",  label: "MX — Performance PBT",     pinMaterial: "PBT White", strengthNm: 15000, strengthLbsFt: 1027, massKgM2: 6.5, massLbFt2: 1.33, tempC: "-40 to +130", tempF: "-40 to 266" },
        ],
        notes: ["Reduced module height for tight transfers."], url: "https://www.movexii.com/en/p/520-flat-top-transfer" },
      { key: "flush_grid", label: "520 Flush Grid", openArea: "~30%", surface: "Open Grid", image: IMG.S520_FG,
        description: "Open grid for drainage, airflow, or visibility.",
        applications: ["Drainage applications", "Washing/rinsing", "Cooling"],
        beltData: [
          { material: "LFA", label: "LFA — Low Friction Acetal", pinMaterial: "PBT White", strengthNm: 18000, strengthLbsFt: 1233, massKgM2: 6.0, massLbFt2: 1.23, tempC: "-30 to +80", tempF: "-22 to 176" },
          { material: "MX",  label: "MX — Performance PBT",     pinMaterial: "PBT White", strengthNm: 15000, strengthLbsFt: 1027, massKgM2: 6.0, massLbFt2: 1.23, tempC: "-40 to +130", tempF: "-40 to 266" },
          { material: "PP",  label: "PP — Polypropylene",       pinMaterial: "PBT White", strengthNm: 12000, strengthLbsFt:  822, massKgM2: 5.2, massLbFt2: 1.07, tempC: "-20 to +100", tempF: "-4 to 212" },
        ],
        notes: ["~30% open area."], url: "https://www.movexii.com/en/p/520-flush-grid" },
      { key: "grip_top", label: "520 Grip Top", openArea: "0%", surface: "Closed / Grip", image: IMG.S520_GT,
        description: "Grip top with friction inserts for inclines and accumulation.",
        applications: ["Inclines & declines", "Grip conveying", "Accumulation with grip"],
        beltData: [
          { material: "LFA", label: "LFA — Low Friction Acetal (base)", pinMaterial: "PBT White", strengthNm: 18000, strengthLbsFt: 1233, massKgM2: 8.2, massLbFt2: 1.68, tempC: "-30 to +80", tempF: "-22 to 176" },
          { material: "MX",  label: "MX — Performance PBT (base)",     pinMaterial: "PBT White", strengthNm: 15000, strengthLbsFt: 1027, massKgM2: 8.2, massLbFt2: 1.68, tempC: "-40 to +130", tempF: "-40 to 266" },
        ],
        notes: ["TPE rubber grip inserts."], url: "https://www.movexii.com/en/p/520-grip-top" },
      { key: "grip_top_side_indent", label: "520 Grip Top Side Indent", openArea: "0%", surface: "Closed / Grip / Side Indent", image: IMG.S520_GTSI,
        description: "Grip Top with side indents for improved sprocket engagement.",
        applications: ["Inclines & declines", "Edge-driven systems"],
        beltData: [{ material: "LFA", label: "LFA — Low Friction Acetal", pinMaterial: "PBT White", strengthNm: 18000, strengthLbsFt: 1233, massKgM2: 8.5, massLbFt2: 1.74, tempC: "-30 to +80", tempF: "-22 to 176" }],
        notes: ["Side indents for improved sprocket engagement."], url: "https://www.movexii.com/en/p/520-grip-top-side-indent" },
      { key: "low_back_pressure", label: "520 Low Back Pressure", openArea: "0% (roller)", surface: "Roller Top", image: IMG.S520_LBP,
        description: "Integrated rollers for low backpressure accumulation.",
        applications: ["Low backpressure accumulation", "Fragile product handling", "Box/package conveying"],
        beltData: [
          { material: "LFA", label: "LFA — Low Friction Acetal", pinMaterial: "PBT White", strengthNm: 18000, strengthLbsFt: 1233, massKgM2: 9.0, massLbFt2: 1.84, tempC: "-30 to +80", tempF: "-22 to 176" },
          { material: "MX",  label: "MX — Performance PBT",     pinMaterial: "PBT White", strengthNm: 15000, strengthLbsFt: 1027, massKgM2: 9.0, massLbFt2: 1.84, tempC: "-40 to +130", tempF: "-40 to 266" },
        ],
        notes: ["Integrated rotating rollers."], url: "https://www.movexii.com/en/p/520-low-back-pressure" },
      { key: "pro_low_back_pressure", label: "520 PRO Low Back Pressure", openArea: "0% (roller)", surface: "Roller Top / PRO", image: IMG.S520_PLBP,
        description: "Enhanced PRO version with larger rollers for heavy loads.",
        applications: ["Heavy product accumulation", "Logistics conveying"],
        beltData: [{ material: "LFA", label: "LFA — Low Friction Acetal", pinMaterial: "PBT White", strengthNm: 21500, strengthLbsFt: 1473, massKgM2: 10.5, massLbFt2: 2.15, tempC: "-30 to +80", tempF: "-22 to 176" }],
        notes: ["Larger rollers vs. standard 520 LBP."], url: "https://www.movexii.com/en/p/520-pro-low-back-pressure" },
      { key: "magnetic", label: "520 Magnetic", openArea: "0%", surface: "Closed / Magnetic", image: IMG.S520_MAG,
        description: "Integrated magnets for handling ferromagnetic products.",
        applications: ["Ferromagnetic product handling", "Metal part conveying", "Automotive parts"],
        beltData: [{ material: "LFA", label: "LFA — Low Friction Acetal (with magnets)", pinMaterial: "PBT White", strengthNm: 18000, strengthLbsFt: 1233, massKgM2: 12.0, massLbFt2: 2.46, tempC: "-30 to +80", tempF: "-22 to 176" }],
        notes: ["Integrated permanent magnets.", "For ferromagnetic parts only."], url: "https://www.movexii.com/en/p/520-magnetic" },
    ],
  },

  // ── 521 SERIES
  {
    id: "S521", name: "Series 521", beltType: "Straight-Running",
    pitch_mm: 10, pitch_in: 0.394, catalogPage: 141, image: IMG.S521_FT,
    description: "Wider-module version of the 520 series at 10 mm pitch. Same sprockets as 520. Available in Flat Top and One Track Belt versions.",
    applications: ["General conveying", "Heavier loads than 520", "Food processing", "Wide product support"],
    advantages: ["Wider plate than 520", "Increased strength at same pitch", "One Track Belt version", "Same sprockets as 520"],
    sprockets: S520_SPROCKETS, accessories: S520_ACCESSORIES,
    techChartUrl: MOVEX_CATALOG_URL, catalogPageRef: "141",
    min_width_mm: 85, min_width_in: 3.35, width_increment_mm: 85, width_increment_in: 3.35, fixation: "Snap-in Clip",
    styles: [
      { key: "flat_top", label: "521 Flat Top", openArea: "0%", surface: "Closed / Smooth", image: IMG.S521_FT,
        description: "521 flat top with wider module vs. 520.",
        applications: ["General conveying", "Food processing", "Packaging"],
        beltData: [
          { material: "LFA", label: "LFA — Low Friction Acetal", pinMaterial: "PBT White", strengthNm: 24000, strengthLbsFt: 1644, massKgM2: 8.5, massLbFt2: 1.74, tempC: "-30 to +80", tempF: "-22 to 176" },
          { material: "MX",  label: "MX — Performance PBT",     pinMaterial: "PBT White", strengthNm: 20000, strengthLbsFt: 1370, massKgM2: 8.5, massLbFt2: 1.74, tempC: "-40 to +130", tempF: "-40 to 266" },
          { material: "PP",  label: "PP — Polypropylene",       pinMaterial: "PBT White", strengthNm: 16000, strengthLbsFt: 1096, massKgM2: 7.4, massLbFt2: 1.52, tempC: "-20 to +100", tempF: "-4 to 212" },
        ],
        notes: ["Wider module width than 520 FT."], url: "https://www.movexii.com/en/p/521-flat-top" },
      { key: "flat_top_one_track", label: "521 Flat Top One Track Belt", openArea: "0%", surface: "Closed / One Track", image: IMG.S521_FT1T,
        description: "521 Flat Top with central guide channel for improved belt tracking.",
        applications: ["Long conveyor runs", "Guided belt systems"],
        beltData: [
          { material: "LFA", label: "LFA — Low Friction Acetal", pinMaterial: "PBT White", strengthNm: 24000, strengthLbsFt: 1644, massKgM2: 8.5, massLbFt2: 1.74, tempC: "-30 to +80", tempF: "-22 to 176" },
          { material: "MX",  label: "MX — Performance PBT",     pinMaterial: "PBT White", strengthNm: 20000, strengthLbsFt: 1370, massKgM2: 8.5, massLbFt2: 1.74, tempC: "-40 to +130", tempF: "-40 to 266" },
        ],
        notes: ["Central guide channel for improved tracking."], url: "https://www.movexii.com/en/p/521-flat-top-one-track-belt" },
    ],
  },

  // ── 522 SERIES
  {
    id: "S522", name: "Series 522", beltType: "Straight-Running",
    pitch_mm: 10, pitch_in: 0.394, catalogPage: 147, image: IMG.S522_HDFT,
    description: "Heavy-duty reinforced version of the 520 series at 10 mm pitch for high-load applications.",
    applications: ["Heavy industrial conveying", "Automotive parts", "High-load food processing"],
    advantages: ["Heavy-duty reinforced module", "Higher tensile strength than 520/521", "One Track Belt version available"],
    sprockets: S520_SPROCKETS, accessories: S520_ACCESSORIES,
    techChartUrl: MOVEX_CATALOG_URL, catalogPageRef: "147",
    min_width_mm: 85, min_width_in: 3.35, width_increment_mm: 85, width_increment_in: 3.35, fixation: "Snap-in Clip",
    styles: [
      { key: "hd_flat_top", label: "522 Heavy Duty Flat Top", openArea: "0%", surface: "Closed / Heavy Duty", image: IMG.S522_HDFT,
        description: "Maximum load capacity at 10 mm pitch.",
        applications: ["Heavy industrial", "Automotive", "High-load conveying"],
        beltData: [
          { material: "LFA", label: "LFA — Low Friction Acetal", pinMaterial: "PBT White", strengthNm: 32000, strengthLbsFt: 2192, massKgM2: 11.0, massLbFt2: 2.25, tempC: "-30 to +80", tempF: "-22 to 176" },
          { material: "MX",  label: "MX — Performance PBT",     pinMaterial: "PBT White", strengthNm: 27000, strengthLbsFt: 1850, massKgM2: 11.0, massLbFt2: 2.25, tempC: "-40 to +130", tempF: "-40 to 266" },
        ],
        notes: ["Highest tensile strength in 520-family."], url: "https://www.movexii.com/en/p/522-heavy-duty-flat-top" },
      { key: "hd_flat_top_one_track", label: "522 HD Flat Top One Track Belt", openArea: "0%", surface: "Closed / Heavy Duty / One Track", image: IMG.S522_HDFT1T,
        description: "HD Flat Top with central guide channel for long, high-load conveyors.",
        applications: ["Long heavy-duty conveyors", "Guided HD belt systems"],
        beltData: [{ material: "LFA", label: "LFA — Low Friction Acetal", pinMaterial: "PBT White", strengthNm: 32000, strengthLbsFt: 2192, massKgM2: 11.0, massLbFt2: 2.25, tempC: "-30 to +80", tempF: "-22 to 176" }],
        notes: ["Central guide channel."], url: "https://www.movexii.com/en/p/522-heavy-duty-flat-top-one-track-belt" },
    ],
  },

  // ── 525 SERIES
  {
    id: "S525", name: "Series 525", beltType: "Straight-Running",
    pitch_mm: 12.7, pitch_in: 0.50, catalogPage: 152, image: IMG.S525_HDFT,
    description: "Heavy-duty modular belt at 1/2-inch (12.7 mm) pitch. Designed for food processing, meat, poultry, and industrial applications.",
    applications: ["Meat & poultry processing", "Food processing", "Heavy industrial", "Seafood processing", "Dairy"],
    advantages: ["1/2-inch pitch food-processing strength", "Heavy-duty construction", "Multiple surface styles", "FDA-compliant options", "Rib version for inclines"],
    sprockets: [
      { name: "525-530 Machined Sprocket", teeth: "8-16T options", bore: "Square / Round", material: "Polyamide (PA)", notes: "Machined sprocket for 525/530 series. 8-16 tooth options.", image: "https://movexps.publifarm.com/img/p/1/1/1/1/3/11113-medium_default.jpg", url: "https://www.movexii.com/en/p/sprockets-turning-disks/belt-sprockets/525-530-machined-sprocketm" },
      { name: "525-530 Molded Sprocket", teeth: "8-16T options", bore: "Square / Round", material: "Polyamide (PA)", notes: "Molded sprocket for 525/530 series.", image: "https://movexps.publifarm.com/img/p/1/1/1/1/5/11115-medium_default.jpg", url: "https://www.movexii.com/en/p/sprockets-turning-disks/belt-sprockets/525-530-molded-sprocketm" },
    ],
    accessories: S525_ACCESSORIES, techChartUrl: MOVEX_CATALOG_URL, catalogPageRef: "152",
    min_width_mm: 85, min_width_in: 3.35, width_increment_mm: 85, width_increment_in: 3.35, fixation: "Snap-in Clip",
    styles: [
      { key: "hd_flat_top", label: "525 Heavy Duty Flat Top", openArea: "0%", surface: "Closed / Heavy Duty", image: IMG.S525_HDFT,
        description: "Primary belt for food and industrial applications at 1/2-inch pitch.",
        applications: ["Food processing", "Meat & poultry", "Industrial conveying"],
        beltData: [
          { material: "LFA", label: "LFA — Low Friction Acetal", pinMaterial: "SS", strengthNm: 28000, strengthLbsFt: 1917, massKgM2: 9.5, massLbFt2: 1.95, tempC: "-30 to +80", tempF: "-22 to 176" },
          { material: "MX",  label: "MX — Performance PBT",     pinMaterial: "SS", strengthNm: 24000, strengthLbsFt: 1644, massKgM2: 9.5, massLbFt2: 1.95, tempC: "-40 to +130", tempF: "-40 to 266" },
          { material: "PP",  label: "PP — Polypropylene",       pinMaterial: "SS", strengthNm: 18000, strengthLbsFt: 1233, massKgM2: 8.2, massLbFt2: 1.68, tempC: "-20 to +100", tempF: "-4 to 212" },
        ],
        notes: ["Stainless steel pins available."], url: "https://www.movexii.com/en/p/525-heavy-duty-flat-top" },
      { key: "hd_flat_top_rib", label: "525 Heavy Duty Flat Top + RIB", openArea: "0%", surface: "Closed / Ribbed", image: IMG.S525_HDFTRIB,
        description: "HD Flat Top with longitudinal ribs for inclines.",
        applications: ["Inclines & declines", "Grip conveying"],
        beltData: [{ material: "LFA", label: "LFA — Low Friction Acetal", pinMaterial: "SS", strengthNm: 28000, strengthLbsFt: 1917, massKgM2: 10.0, massLbFt2: 2.05, tempC: "-30 to +80", tempF: "-22 to 176" }],
        notes: ["Integrated longitudinal ribs."], url: "https://www.movexii.com/en/p/525-heavy-duty-flat-top-rib" },
      { key: "flat_top_transfer", label: "525 Flat Top Transfer", openArea: "0%", surface: "Closed / Transfer", image: IMG.S525_FTT,
        description: "Transfer-optimized for tight dead-plate transfers.",
        applications: ["Dead-plate transfers", "Packaging line endpoints"],
        beltData: [{ material: "LFA", label: "LFA — Low Friction Acetal", pinMaterial: "SS", strengthNm: 24000, strengthLbsFt: 1644, massKgM2: 8.5, massLbFt2: 1.74, tempC: "-30 to +80", tempF: "-22 to 176" }],
        notes: ["Optimized for dead-plate transfers."], url: "https://www.movexii.com/en/p/525-flat-top-transfer" },
      { key: "hd_flush_grid", label: "525 Heavy Duty Flush Grid", openArea: "~35%", surface: "Open Grid / Heavy Duty", image: IMG.S525_HDFG,
        description: "HD flush grid for food processing with drainage.",
        applications: ["Washing/rinsing", "Marinating", "Dip tank lines", "Seafood processing"],
        beltData: [
          { material: "LFA", label: "LFA — Low Friction Acetal", pinMaterial: "SS", strengthNm: 24000, strengthLbsFt: 1644, massKgM2: 7.5, massLbFt2: 1.54, tempC: "-30 to +80", tempF: "-22 to 176" },
          { material: "MX",  label: "MX — Performance PBT",     pinMaterial: "SS", strengthNm: 20000, strengthLbsFt: 1370, massKgM2: 7.5, massLbFt2: 1.54, tempC: "-40 to +130", tempF: "-40 to 266" },
          { material: "PP",  label: "PP — Polypropylene",       pinMaterial: "SS", strengthNm: 15000, strengthLbsFt: 1027, massKgM2: 6.5, massLbFt2: 1.33, tempC: "-20 to +100", tempF: "-4 to 212" },
        ],
        notes: ["~35% open area for drainage."], url: "https://www.movexii.com/en/p/525-heavy-duty-flush-grid" },
      { key: "hd_grip_top", label: "525 Heavy Duty Grip Top", openArea: "0%", surface: "Closed / Grip / Heavy Duty", image: IMG.S525_HDGT,
        description: "HD grip top with TPE rubber inserts for inclines at 1/2-inch pitch.",
        applications: ["Food processing inclines", "Meat & poultry inclines"],
        beltData: [{ material: "LFA", label: "LFA — Low Friction Acetal (base)", pinMaterial: "SS", strengthNm: 24000, strengthLbsFt: 1644, massKgM2: 10.5, massLbFt2: 2.15, tempC: "-30 to +80", tempF: "-22 to 176" }],
        notes: ["TPE rubber grip inserts."], url: "https://www.movexii.com/en/p/525-heavy-duty-grip-top" },
      { key: "hd_grip_top_side_indent", label: "525 HD Grip Top Side Indent", openArea: "0%", surface: "Closed / Grip / Side Indent / HD", image: IMG.S525_HDGTSI,
        description: "HD Grip Top with side indents for improved tracking.",
        applications: ["HD inclines with tracking", "Edge-driven HD systems"],
        beltData: [{ material: "LFA", label: "LFA — Low Friction Acetal", pinMaterial: "SS", strengthNm: 24000, strengthLbsFt: 1644, massKgM2: 10.5, massLbFt2: 2.15, tempC: "-30 to +80", tempF: "-22 to 176" }],
        notes: ["Side indents + HD grip."], url: "https://www.movexii.com/en/p/525-heavy-duty-grip-top-side-indent" },
    ],
  },

  // ── 530 SERIES
  {
    id: "S530", name: "Series 530", beltType: "Straight-Running",
    pitch_mm: 12.7, pitch_in: 0.50, catalogPage: 163, image: IMG.S530_FT,
    description: "Versatile 1/2-inch pitch modular belt with multiple surface styles. Industry-interchangeable design.",
    applications: ["Food processing", "Beverage packaging", "General conveying", "Accumulation", "Inclines"],
    advantages: ["Industry-standard 1/2-inch pitch", "Multiple surface styles", "LBP variant for accumulation", "PRO LBP for heavy accumulation"],
    sprockets: [
      { name: "525-530 Machined Sprocket", teeth: "8-16T options", bore: "Square / Round", material: "Polyamide (PA)", notes: "Machined sprocket for 525/530 series. 8-16 tooth options.", image: "https://movexps.publifarm.com/img/p/1/1/1/1/3/11113-medium_default.jpg", url: "https://www.movexii.com/en/p/sprockets-turning-disks/belt-sprockets/525-530-machined-sprocketm" },
      { name: "525-530 Molded Sprocket", teeth: "8-16T options", bore: "Square / Round", material: "Polyamide (PA)", notes: "Molded sprocket for 525/530 series.", image: "https://movexps.publifarm.com/img/p/1/1/1/1/5/11115-medium_default.jpg", url: "https://www.movexii.com/en/p/sprockets-turning-disks/belt-sprockets/525-530-molded-sprocketm" },
    ],
    accessories: S530_ACCESSORIES, techChartUrl: MOVEX_CATALOG_URL, catalogPageRef: "163",
    min_width_mm: 85, min_width_in: 3.35, width_increment_mm: 85, width_increment_in: 3.35, fixation: "Snap-in Clip",
    styles: [
      { key: "flat_top", label: "530 Flat Top", openArea: "0%", surface: "Closed / Smooth", image: IMG.S530_FT,
        description: "1/2-inch pitch flat top. Industry-interchangeable design.",
        applications: ["Food processing", "Beverage", "General conveying"],
        beltData: [
          { material: "LFA", label: "LFA — Low Friction Acetal", pinMaterial: "PBT White / SS", strengthNm: 21500, strengthLbsFt: 1473, massKgM2: 8.5, massLbFt2: 1.74, tempC: "-30 to +80", tempF: "-22 to 176" },
          { material: "MX",  label: "MX — Performance PBT",     pinMaterial: "PBT White / SS", strengthNm: 18000, strengthLbsFt: 1233, massKgM2: 8.5, massLbFt2: 1.74, tempC: "-40 to +130", tempF: "-40 to 266" },
          { material: "PP",  label: "PP — Polypropylene",       pinMaterial: "PBT White / SS", strengthNm: 14000, strengthLbsFt:  959, massKgM2: 7.4, massLbFt2: 1.52, tempC: "-20 to +100", tempF: "-4 to 212" },
          { material: "MPX", label: "MPX — Lubricated Acetal",  pinMaterial: "PBT White",       strengthNm: 21500, strengthLbsFt: 1473, massKgM2: 8.5, massLbFt2: 1.74, tempC: "-30 to +80",  tempF: "-22 to 176" },
        ],
        notes: ["1/2-inch pitch. Industry interchangeable."], url: "https://www.movexii.com/en/p/530-flat-top" },
      { key: "flat_top_transfer", label: "530 Flat Top Transfer", openArea: "0%", surface: "Closed / Transfer", image: IMG.S530_FTT,
        description: "Transfer-optimized 530 belt.",
        applications: ["Dead-plate transfers", "Packaging endpoint"],
        beltData: [
          { material: "LFA", label: "LFA — Low Friction Acetal", pinMaterial: "PBT White", strengthNm: 18000, strengthLbsFt: 1233, massKgM2: 7.5, massLbFt2: 1.54, tempC: "-30 to +80", tempF: "-22 to 176" },
          { material: "MX",  label: "MX — Performance PBT",     pinMaterial: "PBT White", strengthNm: 15000, strengthLbsFt: 1027, massKgM2: 7.5, massLbFt2: 1.54, tempC: "-40 to +130", tempF: "-40 to 266" },
        ],
        notes: ["Transfer-optimized profile."], url: "https://www.movexii.com/en/p/530-flat-top-transfer" },
      { key: "grip_top", label: "530 Grip Top", openArea: "0%", surface: "Closed / Grip", image: IMG.S530_GT,
        description: "530 series grip top for inclines at 1/2-inch pitch.",
        applications: ["Inclines & declines", "Grip conveying"],
        beltData: [
          { material: "LFA", label: "LFA — Low Friction Acetal (base)", pinMaterial: "PBT White", strengthNm: 18000, strengthLbsFt: 1233, massKgM2: 9.0, massLbFt2: 1.84, tempC: "-30 to +80", tempF: "-22 to 176" },
          { material: "MX",  label: "MX — Performance PBT (base)",     pinMaterial: "PBT White", strengthNm: 15000, strengthLbsFt: 1027, massKgM2: 9.0, massLbFt2: 1.84, tempC: "-40 to +130", tempF: "-40 to 266" },
        ],
        notes: ["TPE rubber grip inserts."], url: "https://www.movexii.com/en/p/530-grip-top" },
      { key: "grip_top_side_indent", label: "530 Grip Top Side Indent", openArea: "0%", surface: "Closed / Grip / Side Indent", image: IMG.S530_GTSI,
        description: "530 Grip Top with side indents.",
        applications: ["Edge-driven systems", "Inclines with tracking"],
        beltData: [{ material: "LFA", label: "LFA — Low Friction Acetal", pinMaterial: "PBT White", strengthNm: 18000, strengthLbsFt: 1233, massKgM2: 9.0, massLbFt2: 1.84, tempC: "-30 to +80", tempF: "-22 to 176" }],
        notes: ["Side indents for sprocket engagement."], url: "https://www.movexii.com/en/p/530-grip-top-side-indent" },
      { key: "low_back_pressure", label: "530 Low Back Pressure", openArea: "0% (roller)", surface: "Roller Top", image: IMG.S530_LBP,
        description: "530 with integrated rollers for low backpressure accumulation.",
        applications: ["Accumulation", "Fragile product conveying"],
        beltData: [
          { material: "LFA", label: "LFA — Low Friction Acetal", pinMaterial: "PBT White", strengthNm: 18000, strengthLbsFt: 1233, massKgM2: 10.0, massLbFt2: 2.05, tempC: "-30 to +80", tempF: "-22 to 176" },
          { material: "MX",  label: "MX — Performance PBT",     pinMaterial: "PBT White", strengthNm: 15000, strengthLbsFt: 1027, massKgM2: 10.0, massLbFt2: 2.05, tempC: "-40 to +130", tempF: "-40 to 266" },
        ],
        notes: ["Integrated rotating rollers."], url: "https://www.movexii.com/en/p/530-low-back-pressure" },
      { key: "pro_low_back_pressure", label: "530 PRO Low Back Pressure", openArea: "0% (roller)", surface: "Roller Top / PRO", image: IMG.S530_PLBP,
        description: "Enhanced PRO LBP with larger rollers for heavy loads.",
        applications: ["Heavy product accumulation"],
        beltData: [{ material: "LFA", label: "LFA — Low Friction Acetal", pinMaterial: "PBT White", strengthNm: 21500, strengthLbsFt: 1473, massKgM2: 11.5, massLbFt2: 2.36, tempC: "-30 to +80", tempF: "-22 to 176" }],
        notes: ["Larger rollers vs. standard 530 LBP."], url: "https://www.movexii.com/en/p/530-pro-low-back-pressure" },
    ],
  },

  // ── 550 SERIES
  {
    id: "S550", name: "Series 550", beltType: "Straight-Running",
    pitch_mm: 19.05, pitch_in: 0.75, catalogPage: 176, image: IMG.S550_FT,
    description: "Series 550 is a 3/4-inch (19.05 mm) pitch modular belt. Available in flat top, one-track, flight top, and magnetic variants.",
    applications: ["Food processing", "General conveying", "Inclines (Flight Top)", "Magnetic product handling"],
    advantages: ["3/4-inch pitch medium-duty", "Flight Top for inclines", "Magnetic variant", "PRO Magnetic version"],
    sprockets: [
      { name: "550 Split Machined Sprocket", teeth: "6-10T options", bore: "Square / Round", material: "Polyamide (PA)", notes: "Machined sprocket for 550 series. 6-10 tooth options.", image: "https://movexps.publifarm.com/img/p/1/1/0/6/0/11060-medium_default.jpg", url: "https://www.movexii.com/en/p/sprockets-turning-disks/belt-sprockets/550-split-machined-sprocketm" },
      { name: "550 Split Molded Sprocket", teeth: "6-10T options", bore: "Square / Round", material: "Polyamide (PA)", notes: "Molded sprocket for 550 series.", image: "https://movexps.publifarm.com/img/p/1/1/0/6/1/11061-medium_default.jpg", url: "https://www.movexii.com/en/p/sprockets-turning-disks/belt-sprockets/550-split-molded-sprocketm" },
    ],
    accessories: S550_ACCESSORIES, techChartUrl: MOVEX_CATALOG_URL, catalogPageRef: "176",
    min_width_mm: 85, min_width_in: 3.35, width_increment_mm: 85, width_increment_in: 3.35, fixation: "Snap-in Clip",
    styles: [
      { key: "flat_top", label: "550 Flat Top", openArea: "0%", surface: "Closed / Smooth", image: IMG.S550_FT,
        description: "3/4-inch pitch flat top for food and industrial applications.",
        applications: ["Food processing", "General conveying", "Packaging"],
        beltData: [
          { material: "LFA", label: "LFA — Low Friction Acetal", pinMaterial: "PBT White", strengthNm: 18000, strengthLbsFt: 1233, massKgM2: 8.0, massLbFt2: 1.64, tempC: "-30 to +80", tempF: "-22 to 176" },
          { material: "MX",  label: "MX — Performance PBT",     pinMaterial: "PBT White", strengthNm: 15000, strengthLbsFt: 1027, massKgM2: 8.0, massLbFt2: 1.64, tempC: "-40 to +130", tempF: "-40 to 266" },
          { material: "PP",  label: "PP — Polypropylene",       pinMaterial: "PBT White", strengthNm: 12000, strengthLbsFt:  822, massKgM2: 7.0, massLbFt2: 1.43, tempC: "-20 to +100", tempF: "-4 to 212" },
        ],
        notes: ["3/4-inch pitch medium-duty."], url: "https://www.movexii.com/en/p/550-flat-top" },
      { key: "flat_top_one_track", label: "550 Flat Top One Track Belt", openArea: "0%", surface: "Closed / One Track", image: IMG.S550_FT1T,
        description: "550 Flat Top with central guide channel.",
        applications: ["Long conveyor runs", "Guided belt systems"],
        beltData: [
          { material: "LFA", label: "LFA — Low Friction Acetal", pinMaterial: "PBT White", strengthNm: 18000, strengthLbsFt: 1233, massKgM2: 8.0, massLbFt2: 1.64, tempC: "-30 to +80", tempF: "-22 to 176" },
          { material: "MX",  label: "MX — Performance PBT",     pinMaterial: "PBT White", strengthNm: 15000, strengthLbsFt: 1027, massKgM2: 8.0, massLbFt2: 1.64, tempC: "-40 to +130", tempF: "-40 to 266" },
        ],
        notes: ["Central guide channel."], url: "https://www.movexii.com/en/p/550-flat-top-one-track-belt" },
      { key: "flight_top", label: "550 Flight Top", openArea: "0%", surface: "Closed / Flight", image: IMG.S550_FLT,
        description: "550 with integrated flights for incline conveying.",
        applications: ["Incline conveying", "Product elevation"],
        beltData: [{ material: "LFA", label: "LFA — Low Friction Acetal", pinMaterial: "PBT White", strengthNm: 15000, strengthLbsFt: 1027, massKgM2: 9.5, massLbFt2: 1.95, tempC: "-30 to +80", tempF: "-22 to 176" }],
        notes: ["Integrated molded flights."], url: "https://www.movexii.com/en/p/550-flight-top" },
      { key: "magnetic", label: "550 Magnetic", openArea: "0%", surface: "Closed / Magnetic", image: IMG.S550_MAG,
        description: "550 with integrated magnets for ferromagnetic products.",
        applications: ["Ferromagnetic products", "Metal part handling"],
        beltData: [{ material: "LFA", label: "LFA — Low Friction Acetal (with magnets)", pinMaterial: "PBT White", strengthNm: 15000, strengthLbsFt: 1027, massKgM2: 12.5, massLbFt2: 2.56, tempC: "-30 to +80", tempF: "-22 to 176" }],
        notes: ["Integrated permanent magnets."], url: "https://www.movexii.com/en/p/520-magnetic" },
      { key: "pro_magnetic", label: "550 PRO Magnetic", openArea: "0%", surface: "Closed / PRO Magnetic", image: null,
        description: "Enhanced PRO Magnetic with stronger magnets.",
        applications: ["Heavy ferromagnetic parts", "Automotive metal parts"],
        beltData: [{ material: "LFA", label: "LFA — Low Friction Acetal (PRO magnets)", pinMaterial: "PBT White", strengthNm: 15000, strengthLbsFt: 1027, massKgM2: 14.0, massLbFt2: 2.87, tempC: "-30 to +80", tempF: "-22 to 176" }],
        notes: ["Stronger magnets than standard 550 Magnetic."], url: "https://www.movexii.com/en/p/550-pro-magnetic" },
    ],
  },

  // ── 590 SERIES (Blueline® food)
  {
    id: "S590", name: "Series 590", beltType: "Straight-Running",
    pitch_mm: 19.05, pitch_in: 0.75, catalogPage: 185, image: IMG.S590_FT,
    description: "Blueline® food-grade modular belt at 3/4-inch pitch for meat, poultry, and seafood processing.",
    applications: ["Food processing", "Meat & poultry processing", "Seafood processing", "Direct food contact"],
    advantages: ["Blueline® food-grade design", "3/4-inch pitch", "Flush Grid for drainage", "One Track Belt version"],
    sprockets: [
      { name: "590 Split Machined Sprocket", teeth: "6-10T options", bore: "Square / Round", material: "Polyamide (PA)", notes: "Machined sprocket for 590 series. 6-10 tooth options.", image: "https://movexps.publifarm.com/img/p/1/1/0/7/6/11076-medium_default.jpg", url: "https://www.movexii.com/en/p/sprockets-turning-disks/belt-sprockets/590-split-machined-sprocketm" },
    ],
    accessories: S590_ACCESSORIES, techChartUrl: MOVEX_CATALOG_URL, catalogPageRef: "185",
    min_width_mm: 76, min_width_in: 3.0, width_increment_mm: 76, width_increment_in: 3.0, fixation: "Snap-in Clip",
    styles: [
      { key: "flat_top", label: "590 Flat Top", openArea: "0%", surface: "Closed / Smooth", image: IMG.S590_FT,
        description: "Blueline® food-grade flat top at 3/4-inch pitch.",
        applications: ["Meat & poultry processing", "Seafood processing", "Direct food contact"],
        beltData: [
          { material: "LFA", label: "LFA — Low Friction Acetal (food grade)", pinMaterial: "SS", strengthNm: 18000, strengthLbsFt: 1233, massKgM2: 8.5, massLbFt2: 1.74, tempC: "-30 to +80", tempF: "-22 to 176" },
          { material: "PP",  label: "PP — Polypropylene (food grade)",       pinMaterial: "SS", strengthNm: 14000, strengthLbsFt:  959, massKgM2: 7.5, massLbFt2: 1.54, tempC: "-20 to +100", tempF: "-4 to 212" },
        ],
        notes: ["Blueline® food-grade design.", "SS pins for hygienic applications."], url: "https://www.movexii.com/en/p/590-flat-top" },
      { key: "flat_top_one_track", label: "590 Flat Top One Track Belt", openArea: "0%", surface: "Closed / One Track", image: IMG.S590_FT1T,
        description: "590 food-grade flat top with central guide channel.",
        applications: ["Long food processing conveyors"],
        beltData: [{ material: "LFA", label: "LFA — Low Friction Acetal", pinMaterial: "SS", strengthNm: 18000, strengthLbsFt: 1233, massKgM2: 8.5, massLbFt2: 1.74, tempC: "-30 to +80", tempF: "-22 to 176" }],
        notes: ["Central guide channel.", "Food-grade design."], url: "https://www.movexii.com/en/p/590-flat-top-one-track-belt" },
      { key: "flat_top_transfer", label: "590 Flat Top Transfer", openArea: "0%", surface: "Closed / Transfer", image: IMG.S590_FTT,
        description: "590 food-grade transfer belt for tight dead-plate transfers.",
        applications: ["Food line dead-plate transfers"],
        beltData: [{ material: "LFA", label: "LFA — Low Friction Acetal", pinMaterial: "SS", strengthNm: 15000, strengthLbsFt: 1027, massKgM2: 7.5, massLbFt2: 1.54, tempC: "-30 to +80", tempF: "-22 to 176" }],
        notes: ["Transfer-optimized profile.", "Food-grade materials."], url: "https://www.movexii.com/en/p/590-flat-top-transfer" },
    ],
  },

  // ── BLUELINE® 7870 (8 mm pitch)
  {
    id: "S7870", name: "Series 7870 (Blueline®)", beltType: "Straight-Running",
    pitch_mm: 8, pitch_in: 0.315, catalogPage: 195,
    image: BL.S7870_FT,
    description: "Blueline® Series 7870 — finest pitch (8 mm) in Movex range. BluLub® self-lubricating POM. Pin Sphere® AUTOLOCK for easy maintenance.",
    applications: ["Ultra-tight product transfers", "Food processing", "Bakery", "Meat & poultry", "Seafood"],
    advantages: ["Smallest pitch (8 mm) in Movex range", "BluLub® self-lubricating POM", "Pin Sphere® AUTOLOCK", "Flush Grid, Diamond Top, Non-slip variants"],
    sprockets: [{ name: "7870 Sprocket", teeth: "Catalog-confirmed", bore: "Square / Round", material: "Polyamide (PA)", notes: "7870 sprocket — compatible with all 7870 belt styles.", image: BL.SP_7870, url: "https://www.movexii.com/en/p/sprockets-turning-disks/belt-sprockets/7870-sprocketm" }],
    accessories: [
      { name: "7870 Nosebar Art-Nr. 22818 (Narrow)", type: "nosebar", image: null, notes: "Art-Nr. 22818.", url: "https://www.movexii.com/en/prodcat/modular-belts" },
      { name: "7870 Nosebar Art-Nr. 22819 (Wide)", type: "nosebar", image: null, notes: "Art-Nr. 22819.", url: "https://www.movexii.com/en/prodcat/modular-belts" },
      { name: "7870 Straight Flight", type: "flight", image: null, notes: "Straight flight for 7870 incline conveying.", url: "https://www.movexii.com/en/prodcat/accessories" },
    ],
    techChartUrl: MOVEX_BLUELINE_URL, catalogPageRef: "195 (Imperial) / p.7 Blueline",
    min_width_mm: 76.2, min_width_in: 3.0, width_increment_mm: 76.2, width_increment_in: 3.0, fixation: "Pin Sphere® AUTLOCK",
    styles: [
      { key: "flat_top", label: "7870 FT — Flat Top", openArea: "0%", surface: "Closed / Smooth",
        image: BL.S7870_FT,
        description: "Ultra-fine 8 mm pitch flat top. BluLub® self-lubricating POM. Pin Sphere® AUTOLOCK for easy installation and quick maintenance.",
        applications: ["Ultra-tight transfers", "Food processing", "Bakery", "Meat & poultry", "Seafood"],
        beltData: [
          { material: "POM", label: "POM — Acetal Resin (Cyan RAL 5005)", pinMaterial: "PBT Pin", strengthNm: 3000, strengthLbsFt: 205, massKgM2: 5.4, massLbFt2: 1.11, tempC: "-40 to +93", tempF: "-40 to 199" },
          { material: "LFA", label: "LFA — Low Friction Acetal (White)", pinMaterial: "PBT Pin", strengthNm: 3000, strengthLbsFt: 205, massKgM2: 5.4, massLbFt2: 1.11, tempC: "-40 to +93", tempF: "-40 to 199" },
        ],
        notes: ["8 mm pitch, H=6 mm — finest in Movex range.", "Backflex radius min.: 7.5 mm. Pin dia.: 3 mm.", "Pin Sphere® AUTOLOCK fixation.", "Min width 50.8 mm (2.0\"). Width increment 25.4 mm (1\")."], url: "https://www.movexii.com/en/prodcat/modular-belts" },
      { key: "flush_grid", label: "7870 FG — Flush Grid", openArea: "25%", surface: "Open Grid", image: BL.S7870_FG,
        description: "7870 Flush Grid with 25% open surface for drainage and airflow.",
        applications: ["Drainage", "Food processing", "Washing", "Cooling"],
        beltData: [
          { material: "POM", label: "POM — Acetal Resin (Cyan RAL 5005)", pinMaterial: "PBT Pin", strengthNm: 3000, strengthLbsFt: 205, massKgM2: 5.1, massLbFt2: 1.04, tempC: "-40 to +80", tempF: "-40 to 176" },
          { material: "LFA", label: "LFA — Low Friction Acetal (White)", pinMaterial: "PBT Pin", strengthNm: 3000, strengthLbsFt: 205, massKgM2: 5.1, massLbFt2: 1.04, tempC: "-40 to +80", tempF: "-40 to 176" },
        ],
        notes: ["25% open surface. 8 mm pitch, H=6 mm.", "Backflex radius min.: 7.5 mm. Pin dia.: 3 mm.", "Pin Sphere® AUTOLOCK fixation."], url: "https://www.movexii.com/en/prodcat/modular-belts" },
      { key: "diamond_top", label: "7870 DT — Diamond Top", openArea: "0%", surface: "Diamond Pattern", image: BL.S7870_DT,
        description: "Diamond-pattern top for grip on inclines and declines.",
        applications: ["Grip conveying", "Inclines", "Declines"],
        beltData: [
          { material: "POM", label: "POM — Acetal Resin (Cyan RAL 5005)", pinMaterial: "PBT Pin", strengthNm: 3000, strengthLbsFt: 205, massKgM2: 5.7, massLbFt2: 1.17, tempC: "-40 to +80", tempF: "-40 to 176" },
          { material: "LFA", label: "LFA — Low Friction Acetal (White)", pinMaterial: "PBT Pin", strengthNm: 3000, strengthLbsFt: 205, massKgM2: 5.7, massLbFt2: 1.17, tempC: "-40 to +80", tempF: "-40 to 176" },
        ],
        notes: ["Diamond top pattern for grip. 8 mm pitch, H=6 mm.", "Backflex radius min.: 7.5 mm. Pin dia.: 3 mm.", "Pin Sphere® AUTOLOCK fixation."], url: "https://www.movexii.com/en/prodcat/modular-belts" },
      { key: "cone_top", label: "7870 CT — Cone Top", openArea: "0%", surface: "Cone / Grip", image: BL.S7870_CT,
        description: "Raised cones for superior grip on inclines and declines at 8 mm pitch.",
        applications: ["Incline conveying", "Decline conveying", "Product orientation"],
        beltData: [
          { material: "POM", label: "POM — Acetal Resin (Cyan RAL 5005)", pinMaterial: "PBT Pin", strengthNm: 3000, strengthLbsFt: 205, massKgM2: 5.9, massLbFt2: 1.21, tempC: "-40 to +80", tempF: "-40 to 176" },
        ],
        notes: ["Cone top for grip. 8 mm pitch, H=6 mm.", "Backflex radius min.: 7.5 mm. Pin dia.: 3 mm.", "Pin Sphere® AUTOLOCK fixation."], url: "https://www.movexii.com/en/prodcat/modular-belts" },
      { key: "non_slip", label: "7870 NS — Non-Slip", openArea: "0%", surface: "Non-Slip / Friction", image: BL.S7870_NS,
        description: "Non-slip surface for maximum grip in friction-critical applications.",
        applications: ["Maximum grip inclines", "Friction-critical applications"],
        beltData: [
          { material: "POM", label: "POM — Acetal Resin (Cyan RAL 5005)", pinMaterial: "PBT Pin", strengthNm: 3000, strengthLbsFt: 205, massKgM2: 6.2, massLbFt2: 1.27, tempC: "-40 to +80", tempF: "-40 to 176" },
        ],
        notes: ["Non-slip surface treatment. 8 mm pitch, H=6 mm.", "Backflex radius min.: 7.5 mm. Pin dia.: 3 mm.", "Pin Sphere® AUTOLOCK fixation."], url: "https://www.movexii.com/en/prodcat/modular-belts" },
    ],
  },

  // ── BLUELINE® 7220 (12.7 mm)
  {
    id: "S7220", name: "Series 7220 (Blueline®)", beltType: "Straight-Running",
    pitch_mm: 12.7, pitch_in: 0.50, catalogPage: 200, image: BL.S7220_FT,
    description: "Blueline® 7220 — 1/2-inch pitch food-grade straight-running belt. H=10 mm. Self-Locking Pin fixation.",
    applications: ["Food processing", "Meat & poultry", "Bakery", "Packaging"],
    advantages: ["1/2-inch pitch food grade", "Flat Top and Grip Top variants", "Self-Locking Pin fixation", "Food-safe materials"],
    sprockets: [{ name: "7220 Sprocket", teeth: "Catalog-confirmed", bore: "Square / Round", material: "Polyamide (PA)", notes: "7185-7220-7233-7234 one-piece molded sprocket.", image: BL.SP_7220_7234, url: "https://www.movexii.com/en/p/sprockets-turning-disks/belt-sprockets/7185-7220-7233-7234-one-piece-molded-sprocketm" }],
    accessories: [{ name: "7220 Nosebar", type: "nosebar", image: null, notes: "Contact Uniking.", url: "https://www.movexii.com/en/prodcat/modular-belts" }],
    techChartUrl: MOVEX_BLUELINE_URL, catalogPageRef: "200 (Imperial) / p.15 Blueline",
    min_width_mm: 50, min_width_in: 2.0, width_increment_mm: 50, width_increment_in: 2.0, fixation: "Self-Locking Pin",
    styles: [
      { key: "flat_top", label: "7220 FT — Flat Top", openArea: "0%", surface: "Closed / Smooth", image: BL.S7220_FT,
        description: "Blueline® 7220 flat top at 1/2-inch pitch. H=10 mm. Self-Locking Pin fixation.",
        applications: ["Food processing", "Meat & poultry"], beltData: "To be confirmed by Uniking",
        notes: ["1/2-inch pitch Blueline® food grade. Self-Locking Pin."], url: "https://www.movexii.com/en/p/modular-belts/7220-flat-top" },
      { key: "grip_top", label: "7220 GT — Grip Top", openArea: "0%", surface: "Closed / Grip", image: BL.S7220_GT,
        description: "7220 grip top for food processing inclines. TPE rubber inserts.",
        applications: ["Food processing inclines", "Grip conveying"], beltData: "To be confirmed by Uniking",
        notes: ["Grip top variant. TPE rubber inserts."], url: "https://www.movexii.com/en/p/modular-belts/7220-grip-top" },
    ],
  },

  // ── BLUELINE® 7233 (12.7 mm flush grid)
  {
    id: "S7233", name: "Series 7233 (Blueline®)", beltType: "Straight-Running",
    pitch_mm: 12.7, pitch_in: 0.50, catalogPage: 203, image: BL.S7233_FG,
    description: "Blueline® 7233 — 1/2-inch pitch flush grid with 25% open surface for drainage-critical food processing. H=10 mm. Reinforced edges design. Self-Locking Pin.",
    applications: ["Drainage-critical food processing", "Washing", "Seafood processing", "Dip tank lines"],
    advantages: ["25% open surface flush grid", "Reinforced edges design", "Self-Locking Pin fixation", "Grip Top variant for wet inclines"],
    sprockets: [{ name: "7233 Sprocket", teeth: "Catalog-confirmed", bore: "Square / Round", material: "Polyamide (PA)", notes: "7185-7220-7233-7234 one-piece molded sprocket.", image: BL.SP_7220_7234, url: "https://www.movexii.com/en/p/sprockets-turning-disks/belt-sprockets/7185-7220-7233-7234-one-piece-molded-sprocketm" }],
    accessories: [{ name: "7233 Nosebar", type: "nosebar", image: null, notes: "Contact Uniking.", url: "https://www.movexii.com/en/prodcat/modular-belts" }],
    techChartUrl: MOVEX_BLUELINE_URL, catalogPageRef: "203 (Imperial) / p.19 Blueline",
    min_width_mm: 50, min_width_in: 2.0, width_increment_mm: 50, width_increment_in: 2.0, fixation: "Self-Locking Pin",
    styles: [
      { key: "flush_grid", label: "7233 FG — Flush Grid", openArea: "25%", surface: "Open Grid", image: BL.S7233_FG,
        description: "7233 flush grid with 25% open surface for drainage. H=10 mm. Reinforced edges. Backflex radius min.: 25 mm. Pin dia.: 5 mm.",
        applications: ["Washing/rinsing", "Seafood processing", "Dip tanks"],
        beltData: [
          { material: "POM", label: "POM — Acetal Resin (Cyan/White)", pinMaterial: "PBT Pin", strengthNm: 18000, strengthLbsFt: 1233, massKgM2: 9.2, massLbFt2: 1.89, tempC: "-40 to +60", tempF: "-40 to 140" },
          { material: "POM", label: "POM — Acetal Resin (Cyan/White)", pinMaterial: "PE Pin",  strengthNm: 7000,  strengthLbsFt: 480,  massKgM2: 8.7, massLbFt2: 1.78, tempC: "+5 to +60",  tempF: "41 to 140" },
          { material: "POM", label: "POM — Acetal Resin (Cyan/White)", pinMaterial: "PP Pin",  strengthNm: 16000, strengthLbsFt: 1096, massKgM2: 8.5, massLbFt2: 1.74, tempC: "+5 to +60",  tempF: "41 to 140" },
          { material: "PP",  label: "PP — Polypropylene (Cyan/White)",  pinMaterial: "PP Pin",  strengthNm: 11000, strengthLbsFt: 754,  massKgM2: 6.3, massLbFt2: 1.29, tempC: "+5 to +60",  tempF: "41 to 140" },
        ],
        notes: ["25% open surface. Reinforced edges design.", "Backflex radius min.: 25 mm. Pin dia.: 5 mm.", "Self-Locking Pin fixation."], url: "https://www.movexii.com/en/p/modular-belts/7233-flush-grid" },
      { key: "flush_grid_grip_top", label: "7233 FG GT — Flush Grid Grip Top", openArea: "25%", surface: "Open Grid / Grip", image: BL.S7233_FGGT,
        description: "7233 flush grid with TPE rubber grip top for wet inclines. H=10 mm. Backflex radius min.: 25 mm. Pin dia.: 5 mm.",
        applications: ["Wet inclines with drainage"],
        beltData: [
          { material: "POM", label: "POM — Acetal Resin (Cyan/White)", pinMaterial: "PBT Pin", strengthNm: 18000, strengthLbsFt: 1233, massKgM2: 9.2, massLbFt2: 1.89, tempC: "-40 to +60", tempF: "-40 to 140" },
          { material: "POM", label: "POM — Acetal Resin (Cyan/White)", pinMaterial: "PE Pin",  strengthNm: 7000,  strengthLbsFt: 480,  massKgM2: 8.7, massLbFt2: 1.78, tempC: "+5 to +60",  tempF: "41 to 140" },
        ],
        notes: ["Flush grid + TPE rubber grip top. Reinforced edges.", "Backflex radius min.: 25 mm. Pin dia.: 5 mm.", "Self-Locking Pin fixation."], url: "https://www.movexii.com/en/p/modular-belts/7233-flush-grid-and-grip-top" },
    ],
  },

  // ── BLUELINE® 7234 (12.7 mm nub top)
  {
    id: "S7234", name: "Series 7234 (Blueline®)", beltType: "Straight-Running",
    pitch_mm: 12.7, pitch_in: 0.50, catalogPage: 206, image: BL.S7234_NT,
    description: "Blueline® 7234 — 1/2-inch pitch nub top for product release. Reduces adhesion for sticky items. H=10 mm. Self-Locking Pin.",
    applications: ["Sticky food products", "Cheese handling", "Meat processing", "Reduced adhesion applications"],
    advantages: ["Nub top for product release", "Reduced adhesion area", "1/2-inch pitch food grade", "Self-Locking Pin fixation"],
    sprockets: [{ name: "7234 Sprocket", teeth: "Catalog-confirmed", bore: "Square / Round", material: "Polyamide (PA)", notes: "7185-7220-7233-7234 one-piece molded sprocket.", image: BL.SP_7220_7234, url: "https://www.movexii.com/en/p/sprockets-turning-disks/belt-sprockets/7185-7220-7233-7234-one-piece-molded-sprocketm" }],
    accessories: [{ name: "7234 Nosebar", type: "nosebar", image: null, notes: "Contact Uniking.", url: "https://www.movexii.com/en/prodcat/modular-belts" }],
    techChartUrl: MOVEX_BLUELINE_URL, catalogPageRef: "206 (Imperial) / p.21 Blueline",
    min_width_mm: 50, min_width_in: 2.0, width_increment_mm: 50, width_increment_in: 2.0, fixation: "Self-Locking Pin",
    styles: [
      { key: "nub_top", label: "7234 NT — Nub Top", openArea: "0% (reduced contact)", surface: "Nub / Reduced Contact", image: BL.S7234_NT,
        description: "Nub top for product release at 1/2-inch pitch. H=10 mm. Backflex radius min.: 25 mm. Pin dia.: 5 mm.",
        applications: ["Sticky products", "Cheese handling", "Meat processing"], beltData: "To be confirmed by Uniking",
        notes: ["Raised nubs reduce adhesion.", "Backflex radius min.: 25 mm. Pin dia.: 5 mm.", "Self-Locking Pin fixation."], url: "https://www.movexii.com/en/p/modular-belts/7234-nub-top" },
    ],
  },

  // ── BLUELINE® 7510 (25.4 mm)
  {
    id: "S7510", name: "Series 7510 (Blueline®)", beltType: "Straight-Running",
    pitch_mm: 25.4, pitch_in: 1.0, catalogPage: 208, image: BL.S7510_FT,
    description: "Blueline® 7510 — 1-inch pitch food-grade belt. Flat Top, Nub Top, Diamond Top, Mesh Top.",
    applications: ["Bakery", "Food processing", "Meat & poultry", "Seafood"],
    advantages: ["1-inch pitch food-grade", "Multiple surface styles", "Nub Top for release", "Diamond Top for grip"],
    sprockets: [
      { name: "7510 Split Machined Sprocket", teeth: "Catalog-confirmed", bore: "Square / Round", material: "Polyamide (PA)", notes: "7510-7520-7585 split machined sprocket.", image: BL.SP_7510_7520, url: "https://www.movexii.com/en/p/sprockets-turning-disks/belt-sprockets/7510-7520-7585-split-machined-sprocketm" },
      { name: "7510 One-Piece Molded Sprocket", teeth: "Catalog-confirmed", bore: "Square / Round", material: "Polyamide (PA)", notes: "7510-7520-7585 one-piece molded sprocket.", image: BL.SP_7510_7520_M, url: "https://www.movexii.com/en/p/sprockets-turning-disks/belt-sprockets/7510-7520-7585-one-piece-molded-sprocketm" },
    ],
    accessories: [
      { name: "7510 Nosebar", type: "nosebar", image: null, notes: "Contact Uniking.", url: "https://www.movexii.com/en/prodcat/modular-belts" },
      { name: "7510 Straight Flight", type: "flight", image: null, notes: "Straight flight for 7510.", url: "https://www.movexii.com/en/prodcat/accessories" },
      { name: "7510 Sidewall", type: "sideguard", image: null, notes: "Sidewall for 7510.", url: "https://www.movexii.com/en/prodcat/accessories" },
    ],
    techChartUrl: MOVEX_BLUELINE_URL, catalogPageRef: "208 (Imperial) / p.25 Blueline",
    width_increment_mm: 25.4, width_increment_in: 1.0, fixation: "Missing Data – Needs Mapping",
    styles: [
      { key: "flat_top",    label: "7510 FT — Flat Top",    openArea: "0%",               surface: "Closed / Smooth",         image: BL.S7510_FT, description: "Blueline® 1-inch pitch flat top.",        applications: ["Food processing", "Bakery"], beltData: "To be confirmed by Uniking", notes: ["1-inch pitch Blueline®."], url: "https://www.movexii.com/en/p/modular-belts/7510-flat-top" },
      { key: "nub_top",     label: "7510 NT — Nub Top",     openArea: "0% (reduced)",      surface: "Nub / Reduced Contact",    image: BL.S7510_NT, description: "1-inch nub top for sticky products.",     applications: ["Sticky products", "Meat"],  beltData: "To be confirmed by Uniking", notes: ["Raised nubs reduce adhesion."], url: "https://www.movexii.com/en/p/modular-belts/7510-nub-top" },
      { key: "diamond_top", label: "7510 DT — Diamond Top", openArea: "0%",               surface: "Diamond Pattern",          image: BL.S7510_DT, description: "1-inch diamond top for grip.",            applications: ["Inclines", "Grip"],         beltData: "To be confirmed by Uniking", notes: ["Diamond pattern grip."], url: "https://www.movexii.com/en/p/modular-belts/7510-diamond-top" },
      { key: "metal_top",   label: "7510 MT — Mesh Top",   openArea: "0%",               surface: "Mesh Top",                image: BL.S7510_MT, description: "1-inch mesh top for special applications.", applications: ["Special surface requirements"], beltData: "To be confirmed by Uniking", notes: ["Mesh top surface."], url: "https://www.movexii.com/en/p/modular-belts/7510-mesh-top" },
    ],
  },

  // ── BLUELINE® 7520 (25.4 mm flush grid)
  {
    id: "S7520", name: "Series 7520 (Blueline®)", beltType: "Straight-Running",
    pitch_mm: 25.4, pitch_in: 1.0, catalogPage: 211, image: BL.S7520_FT,
    description: "Blueline® 7520 — 1-inch pitch flat top and flush grid food-grade belt.",
    applications: ["Food processing with drainage", "Washing", "Blanching", "Bakery"],
    advantages: ["1-inch pitch food-grade", "Flush Grid for drainage", "Flat Top variant"],
    sprockets: [
      { name: "7520 Split Machined Sprocket", teeth: "Catalog-confirmed", bore: "Square / Round", material: "Polyamide (PA)", notes: "7510-7520-7585 split machined sprocket.", image: BL.SP_7510_7520, url: "https://www.movexii.com/en/p/sprockets-turning-disks/belt-sprockets/7510-7520-7585-split-machined-sprocketm" },
      { name: "7520 One-Piece Molded Sprocket", teeth: "Catalog-confirmed", bore: "Square / Round", material: "Polyamide (PA)", notes: "7510-7520-7585 one-piece molded sprocket.", image: BL.SP_7510_7520_M, url: "https://www.movexii.com/en/p/sprockets-turning-disks/belt-sprockets/7510-7520-7585-one-piece-molded-sprocketm" },
    ],
    accessories: [
      { name: "7520 Nosebar", type: "nosebar", image: null, notes: "Contact Uniking.", url: "https://www.movexii.com/en/prodcat/modular-belts" },
      { name: "7520 Straight Flight", type: "flight", image: null, notes: "Straight flight for 7520.", url: "https://www.movexii.com/en/prodcat/accessories" },
    ],
    techChartUrl: MOVEX_BLUELINE_URL, catalogPageRef: "211 (Imperial) / p.31 Blueline",
    width_increment_mm: 25.4, width_increment_in: 1.0, fixation: "Missing Data – Needs Mapping",
    styles: [
      { key: "flat_top",   label: "7520 FT — Flat Top",   openArea: "0%",    surface: "Closed / Smooth", image: BL.S7520_FT, description: "Blueline® 7520 flat top at 1-inch pitch.", applications: ["Food processing", "Bakery"], beltData: "To be confirmed by Uniking", notes: ["1-inch pitch."], url: "https://www.movexii.com/en/p/modular-belts/7520-flat-top" },
      { key: "flush_grid", label: "7520 FG — Flush Grid", openArea: "~40%",  surface: "Open Grid",        image: BL.S7520_FG, description: "7520 flush grid for drainage.",             applications: ["Drainage", "Washing"],         beltData: "To be confirmed by Uniking", notes: ["~40% open area."], url: "https://www.movexii.com/en/p/modular-belts/7520-flush-grid" },
    ],
  },

  // ── BLUELINE® 7010 (50.8 mm)
  {
    id: "S7010", name: "Series 7010 (Blueline®)", beltType: "Straight-Running",
    pitch_mm: 50.8, pitch_in: 2.0, catalogPage: 213, image: BL.S7010_FT,
    description: "Blueline® 7010 — 2-inch pitch heavy-duty food-grade belt. Flat Top, Cone Top, Nub Top, Perforated Top.",
    applications: ["Heavy food processing", "Meat & poultry", "Bulk conveying"],
    advantages: ["2-inch pitch heavy duty", "Multiple surface styles", "Cone Top for grip", "Perforated Top for drainage"],
    sprockets: [
      { name: "7010 Split Machined Sprocket", teeth: "Catalog-confirmed", bore: "Square / Round", material: "Polyamide (PA)", notes: "7010-7290-7293 split machined sprocket.", image: BL.SP_7010_7290, url: "https://www.movexii.com/en/p/sprockets-turning-disks/belt-sprockets/7010-7290-7293-split-machined-sprocketm" },
      { name: "7010 One-Piece Molded Sprocket", teeth: "Catalog-confirmed", bore: "Square / Round", material: "Polyamide (PA)", notes: "7010-7290-7293 one-piece molded sprocket.", image: BL.SP_7010_7290_M, url: "https://www.movexii.com/en/p/sprockets-turning-disks/belt-sprockets/7010-7290-7293-one-piece-molded-sprocketm" },
    ],
    accessories: [
      { name: "7010 Nosebar", type: "nosebar", image: null, notes: "Contact Uniking.", url: "https://www.movexii.com/en/prodcat/modular-belts" },
      { name: "7010 Straight Flight", type: "flight", image: null, notes: "Straight flight for 7010.", url: "https://www.movexii.com/en/prodcat/accessories" },
      { name: "7010 Heavy-Duty Sidewall", type: "sideguard", image: null, notes: "HD sidewall for 7010.", url: "https://www.movexii.com/en/prodcat/accessories" },
    ],
    techChartUrl: MOVEX_BLUELINE_URL, catalogPageRef: "213 (Imperial) / p.35 Blueline",
    width_increment_mm: 9.375, width_increment_in: 0.369, fixation: "Self-Locking Pin",
    styles: [
      { key: "flat_top",       label: "7010 FT — Flat Top",        openArea: "0%",    surface: "Closed / Smooth",     image: "https://movexps.publifarm.com/img/p/1/0/7/8/4/10784-large_default.jpg",
        description: "2-inch heavy duty flat top. Mold-to-width available. Self-Locking Pin fixation.",
        applications: ["Heavy food processing", "Meat & poultry", "Bulk conveying"],
        beltData: [
          { material: "LFC", label: "LFC — Low Friction Acetal (Cyan)", pinMaterial: "PBT Pin", strengthNm: 30000, strengthLbsFt: 2056, massKgM2: 13.5, massLbFt2: 2.8, tempC: "-40 to +80", tempF: "-40 to 176" },
          { material: "LFB", label: "LFB — Low Friction Acetal (Blue)", pinMaterial: "PBT Pin", strengthNm: 30000, strengthLbsFt: 2056, massKgM2: 13.5, massLbFt2: 2.8, tempC: "-40 to +80", tempF: "-40 to 176" },
          { material: "LFW", label: "LFW — Low Friction Acetal (White)", pinMaterial: "PBT Pin", strengthNm: 30000, strengthLbsFt: 2056, massKgM2: 13.5, massLbFt2: 2.8, tempC: "-40 to +80", tempF: "-40 to 176" },
          { material: "PKC", label: "PKC — Polyketone (Cyan)",          pinMaterial: "PBT Pin", strengthNm: 30000, strengthLbsFt: 2056, massKgM2: 11.9, massLbFt2: 2.44, tempC: "-40 to +80", tempF: "-40 to 176" },
          { material: "PKW", label: "PKW — Polyketone (White)",          pinMaterial: "PBT Pin", strengthNm: 30000, strengthLbsFt: 2056, massKgM2: 11.9, massLbFt2: 2.44, tempC: "-40 to +80", tempF: "-40 to 176" },
          { material: "LFC", label: "LFC — Low Friction Acetal (Cyan)", pinMaterial: "PP Pin",  strengthNm: 18000, strengthLbsFt: 1233, massKgM2: 13.5, massLbFt2: 2.8, tempC: "-40 to +80", tempF: "-40 to 176" },
          { material: "LFC", label: "LFC — Low Friction Acetal (Cyan)", pinMaterial: "PE Pin",  strengthNm: 10000, strengthLbsFt: 685,  massKgM2: 13.5, massLbFt2: 2.8, tempC: "-40 to +80", tempF: "-40 to 176" },
        ],
        notes: ["2-inch (50.8 mm) pitch heavy duty. Back flex radius: 50 mm (1.969\").", "Self-Locking Pin fixation. Mold-to-width in 9.375 mm increments.", "Quick Fit sprocket: +20% higher max working load vs standard.", "PKX material available for red meat processing."], url: "https://www.movexii.com/en/p/modular-belts/7010-flat-top-mold-to-width" },
      { key: "cone_top",       label: "7010 CT — Cone Top",        openArea: "0%",    surface: "Cone / Grip",          image: BL.S7010_CT, description: "2-inch cone top for inclines.",       applications: ["Heavy inclines"],               beltData: "To be confirmed by Uniking", notes: ["Cone top for grip. 2-inch pitch."], url: "https://www.movexii.com/en/p/modular-belts/7010-cone-top" },
      { key: "nub_top",        label: "7010 NT — Nub Top",         openArea: "0%",    surface: "Nub / Reduced Contact",image: BL.S7010_NT, description: "2-inch nub top for product release.", applications: ["Sticky heavy products"],         beltData: "To be confirmed by Uniking", notes: ["Nub top for product release. 2-inch pitch."], url: "https://www.movexii.com/en/p/modular-belts/7010-nub-top" },
      { key: "perforated_top", label: "7010 PT — Perforated Top",  openArea: "~20%",  surface: "Perforated",           image: BL.S7010_PT, description: "2-inch perforated top for drainage.", applications: ["Partial drainage", "Washing"],   beltData: "To be confirmed by Uniking", notes: ["~20% open area. 2-inch pitch."], url: "https://www.movexii.com/en/p/modular-belts/7010-perforated-top" },
      { key: "hd_perforated_top", label: "7010 HD PT — Heavy Duty Perforated Top", openArea: "~20%", surface: "Perforated / Heavy Duty", image: BL.S7010_HDPT, description: "Heavy-duty perforated top for demanding drainage applications.", applications: ["Heavy drainage", "Washing"], beltData: "To be confirmed by Uniking", notes: ["NEW in V6 catalog. Heavy-duty perforated. 2-inch pitch."], url: "https://www.movexii.com/en/p/modular-belts/7010-heavy-duty-perforated-top" },
    ],
  },

  // ── BLUELINE® 7900 (27.2 mm pitch) — NEW in V6
  {
    id: "S7900", name: "Series 7900 (Blueline®)", beltType: "Straight-Running",
    pitch_mm: 27.2, pitch_in: 1.07, catalogPage: null, image: null,
    description: "Blueline® 7900 — NEW 27.2 mm (1.07\") pitch series engineered for versatile reliability. Available in Flat Top and Flush Grid versions. 38% open surface on Flush Grid for efficient airflow and drainage.",
    applications: ["Food processing", "Meat & poultry", "Bakery", "General conveying"],
    advantages: ["NEW 27.2 mm pitch", "Flat Top and Flush Grid versions", "38% open surface (Flush Grid)", "FDA-compliant materials", "Easy installation"],
    sprockets: [{ name: "7900 Sprocket", teeth: "Missing Data", bore: "Missing Data", material: "Polyamide (PA)", notes: "Contact Uniking for 7900 sprocket details.", image: null, url: "https://www.movexii.com/en/prodcat/sprockets-turning-disks" }],
    accessories: [{ name: "7900 Nosebar", type: "nosebar", image: null, notes: "Contact Uniking.", url: "https://www.movexii.com/en/prodcat/modular-belts" }],
    techChartUrl: MOVEX_BLUELINE_URL, catalogPageRef: "V6 catalog (NEW)",
    min_width_mm: 50.8, min_width_in: 2.0, width_increment_mm: 25.4, width_increment_in: 1.0, fixation: "To be confirmed by Uniking",
    styles: [
      { key: "flat_top", label: "7900 FT — Flat Top", openArea: "0%", surface: "Closed / Smooth", image: null,
        description: "Blueline® 7900 flat top at 27.2 mm pitch.",
        applications: ["Food processing", "Meat & poultry", "Bakery"], beltData: "To be confirmed by Uniking",
        notes: ["NEW 27.2 mm (1.07\") pitch."], url: "https://www.movexii.com/en/prodcat/modular-belts" },
      { key: "flush_grid", label: "7900 FG — Flush Grid", openArea: "38%", surface: "Open Grid", image: null,
        description: "Blueline® 7900 flush grid with 38% open surface for airflow and drainage.",
        applications: ["Drainage", "Airflow", "Food processing"], beltData: "To be confirmed by Uniking",
        notes: ["38% open surface. NEW 27.2 mm pitch."], url: "https://www.movexii.com/en/prodcat/modular-belts" },
    ],
  },

  // ── BLUELINE® 7185 (12.7 mm pitch) — NEW in V6
  {
    id: "S7185", name: "Series 7185 (Blueline®)", beltType: "Straight-Running",
    pitch_mm: 12.7, pitch_in: 0.50, catalogPage: 13, image: BL.S7185_FG,
    description: "Blueline® 7185 — NEW 1/2-inch pitch flush grid for drainage-critical food processing. H=7 mm. Self-Locking Pin.",
    applications: ["Drainage-critical food processing", "Washing", "Seafood"],
    advantages: ["NEW 1/2-inch pitch", "Flush Grid for drainage", "FDA-compliant materials"],
    sprockets: [{ name: "7185 Sprocket", teeth: "Catalog-confirmed", bore: "Square / Round", material: "Polyamide (PA)", notes: "7185-7220-7233-7234 one-piece molded sprocket.", image: BL.SP_7220_7234, url: "https://www.movexii.com/en/p/sprockets-turning-disks/belt-sprockets/7185-7220-7233-7234-one-piece-molded-sprocketm" }],
    accessories: [{ name: "7185 Nosebar", type: "nosebar", image: null, notes: "Contact Uniking.", url: "https://www.movexii.com/en/prodcat/modular-belts" }],
    techChartUrl: MOVEX_BLUELINE_URL, catalogPageRef: "V6 p.13 (NEW)",
    min_width_mm: 50.8, min_width_in: 2.0, width_increment_mm: 25.4, width_increment_in: 1.0, fixation: "To be confirmed by Uniking",
    styles: [
      { key: "flush_grid", label: "7185 FG — Flush Grid", openArea: "To be confirmed by Uniking", surface: "Open Grid", image: BL.S7185_FG,
        description: "NEW 7185 flush grid for drainage at 1/2-inch pitch.",
        applications: ["Drainage", "Washing", "Seafood"], beltData: "To be confirmed by Uniking",
        notes: ["NEW in V6 catalog. 1/2-inch pitch."], url: "https://www.movexii.com/en/prodcat/modular-belts" },
    ],
  },

  // ── BLUELINE® 7585 (25.7 mm pitch) — NEW in V6
  {
    id: "S7585", name: "Series 7585 (Blueline®)", beltType: "Straight-Running",
    pitch_mm: 25.7, pitch_in: 1.012, catalogPage: 37, image: BL.S7585_FG,
    description: "Blueline® 7585 — NEW ~1-inch (25.7 mm) pitch flush grid for food processing.",
    applications: ["Food processing", "Drainage", "Washing"],
    advantages: ["NEW ~1-inch pitch", "Flush Grid for drainage", "FDA-compliant materials"],
    sprockets: [
      { name: "7585 Split Machined Sprocket", teeth: "Catalog-confirmed", bore: "Square / Round", material: "Polyamide (PA)", notes: "7510-7520-7585 split machined sprocket.", image: BL.SP_7510_7520, url: "https://www.movexii.com/en/p/sprockets-turning-disks/belt-sprockets/7510-7520-7585-split-machined-sprocketm" },
      { name: "7585 One-Piece Molded Sprocket", teeth: "Catalog-confirmed", bore: "Square / Round", material: "Polyamide (PA)", notes: "7510-7520-7585 one-piece molded sprocket.", image: BL.SP_7510_7520_M, url: "https://www.movexii.com/en/p/sprockets-turning-disks/belt-sprockets/7510-7520-7585-one-piece-molded-sprocketm" },
    ],
    accessories: [{ name: "7585 Nosebar", type: "nosebar", image: null, notes: "Contact Uniking.", url: "https://www.movexii.com/en/prodcat/modular-belts" }],
    techChartUrl: MOVEX_BLUELINE_URL, catalogPageRef: "V6 p.37 (NEW)",
    min_width_mm: 50.8, min_width_in: 2.0, width_increment_mm: 25.4, width_increment_in: 1.0, fixation: "To be confirmed by Uniking",
    styles: [
      { key: "flush_grid", label: "7585 FG — Flush Grid", openArea: "To be confirmed by Uniking", surface: "Open Grid", image: BL.S7585_FG,
        description: "NEW 7585 flush grid at ~1-inch pitch.",
        applications: ["Drainage", "Food processing"], beltData: "To be confirmed by Uniking",
        notes: ["NEW in V6 catalog. 25.7 mm pitch."], url: "https://www.movexii.com/en/prodcat/modular-belts" },
    ],
  },

  // ── BLUELINE® 7290/7293 (50.8 mm sideflexing) — NEW in V6
  {
    id: "S7290", name: "Series 7290/7293 (Blueline® Sideflexing)", beltType: "Sideflexing",
    pitch_mm: 50.8, pitch_in: 2.0, catalogPage: 57, image: null,
    description: "Blueline® 7290/7293 — NEW 2-inch pitch sideflexing belts. 7290 R-FG (collapse 2.22) and 7293 TR-FG (collapse 1.6) for horizontal curves.",
    applications: ["Horizontal curves", "Heavy food processing curves", "Multi-directional conveying"],
    advantages: ["NEW 2-inch sideflexing", "7290 collapse factor 2.22", "7293 tight radius collapse 1.6", "FDA-compliant"],
    sprockets: [
      { name: "7290/7293 Split Machined Sprocket", teeth: "Catalog-confirmed", bore: "Square / Round", material: "Polyamide (PA)", notes: "7010-7290-7293 split machined sprocket.", image: BL.SP_7010_7290, url: "https://www.movexii.com/en/p/sprockets-turning-disks/belt-sprockets/7010-7290-7293-split-machined-sprocketm" },
      { name: "7290/7293 One-Piece Molded Sprocket", teeth: "Catalog-confirmed", bore: "Square / Round", material: "Polyamide (PA)", notes: "7010-7290-7293 one-piece molded sprocket.", image: BL.SP_7010_7290_M, url: "https://www.movexii.com/en/p/sprockets-turning-disks/belt-sprockets/7010-7290-7293-one-piece-molded-sprocketm" },
    ],
    accessories: [{ name: "7290/7293 Curved Track", type: "track", image: null, notes: "Curved track for 7290/7293.", url: "https://www.movexii.com/en/prodcat/curves-straight-tracks" }],
    techChartUrl: MOVEX_BLUELINE_URL, catalogPageRef: "V6 p.57 (NEW)",
    collapse_factor: "2.22 (7290) / 1.6 (7293)", fixation: "To be confirmed by Uniking",
    styles: [
      { key: "r_flush_grid", label: "7290 R-FG — Sideflexing Flush Grid", openArea: "To be confirmed by Uniking", surface: "Open Grid / Sideflexing", image: null,
        description: "NEW 2-inch sideflexing flush grid. Collapse factor 2.22.",
        applications: ["Horizontal curve conveying", "Heavy curves"], beltData: "To be confirmed by Uniking",
        notes: ["NEW in V6. Collapse factor 2.22."], url: "https://www.movexii.com/en/prodcat/modular-belts" },
      { key: "tr_flush_grid", label: "7293 TR-FG — Tight Radius Flush Grid", openArea: "To be confirmed by Uniking", surface: "Open Grid / Tight Radius", image: null,
        description: "NEW 2-inch tight-radius sideflexing flush grid. Collapse factor 1.6.",
        applications: ["Tight horizontal curves"], beltData: "To be confirmed by Uniking",
        notes: ["NEW in V6. Collapse factor 1.6."], url: "https://www.movexii.com/en/prodcat/modular-belts" },
    ],
  },

  // ── BLUELINE® 7540 (sideflexing)
  {
    id: "S7540", name: "Series 7540 (Blueline® Sideflexing)", beltType: "Sideflexing",
    pitch_mm: 25.4, pitch_in: 1.0, catalogPage: 215, image: BL.S7540_RFG,
    description: "Blueline® 7540 — 1-inch pitch sideflexing for horizontal curves. Collapse factor 2.2. H=11 mm. Self-Locking Pin.",
    applications: ["Horizontal curves", "Food processing curves", "Multi-directional conveying"],
    advantages: ["Sideflexing for horizontal curves", "Collapse factor 2.2", "TAB version available", "Food-grade design"],
    sprockets: [
      { name: "7540 Split Machined Sprocket", teeth: "Catalog-confirmed", bore: "Square / Round", material: "Polyamide (PA)", notes: "7540-7544 split machined sprocket.", image: BL.SP_7540_7544, url: "https://www.movexii.com/en/p/sprockets-turning-disks/belt-sprockets/7540-7544-split-machined-sprocketm" },
      { name: "7540 One-Piece Molded Sprocket", teeth: "Catalog-confirmed", bore: "Square / Round", material: "Polyamide (PA)", notes: "7540-7544 one-piece molded sprocket.", image: BL.SP_7540_7544_M, url: "https://www.movexii.com/en/p/sprockets-turning-disks/belt-sprockets/7540-7544-one-piece-molded-sprocketm" },
    ],
    accessories: [
      { name: "7540 Straight Track", type: "track", image: null, notes: "Straight track for 7540.", url: "https://www.movexii.com/en/prodcat/curves-straight-tracks" },
      { name: "7540 Curved Track",   type: "track", image: null, notes: "Fixed radius curved track for 7540.", url: "https://www.movexii.com/en/prodcat/curves-straight-tracks" },
      { name: "7540 Sideguard",      type: "sideguard", image: null, notes: "Sideguard for 7540 curves.", url: "https://www.movexii.com/en/prodcat/accessories" },
    ],
    techChartUrl: MOVEX_BLUELINE_URL, catalogPageRef: "215 (Imperial) / p.41 Blueline",
    collapse_factor: 2.2, fixation: "Missing Data – Needs Mapping",
    styles: [
      { key: "r_flush_grid",     label: "7540 R-FG — Sideflexing Flush Grid",      openArea: "~35%", surface: "Open Grid / Sideflexing",       image: BL.S7540_RFG, description: "Sideflexing flush grid. Collapse factor 2.2. H=11 mm.", applications: ["Horizontal curve conveying", "Curved drainage"],
        beltData: [
          { material: "POM", label: "POM — Acetal Resin (Cyan/White)", pinMaterial: "PBT Pin", strengthNm: 20000, strengthLbsFt: 1370, massKgM2: 8.4, massLbFt2: 1.72, tempC: "-40 to +93", tempF: "-40 to 199" },
          { material: "PP",  label: "PP — Polypropylene (Cyan/White)",  pinMaterial: "PBT Pin", strengthNm: 14000, strengthLbsFt: 959,  massKgM2: 5.8, massLbFt2: 1.19, tempC: "+5 to +93",  tempF: "41 to 199" },
        ],
        notes: ["Collapse factor 2.2. Curved run max load: 1100 N (POM).", "Backflex radius min.: Self-Locking Pin. H=11 mm.", "Sprocket pitches: 50/66.6/83.25/100/117 mm."], url: "https://www.movexii.com/en/p/modular-belts/7540-radius-flush-grid" },
      { key: "tab_r_flush_grid", label: "7540 TAB R-FG — TAB Sideflexing Flush Grid", openArea: "~35%", surface: "Open Grid / Sideflexing / TAB", image: BL.S7540_RFG, description: "TAB version for side tab drive systems. Collapse factor 2.2.",          applications: ["TAB drive sideflexing curves"],            beltData: "To be confirmed by Uniking", notes: ["TAB drive version. Collapse factor 2.2."], url: "https://www.movexii.com/en/prodcat/modular-belts" },
    ],
  },

  // ── BLUELINE® 7544 (sideflexing, tighter radius)
  {
    id: "S7544", name: "Series 7544 (Blueline® Sideflexing)", beltType: "Sideflexing",
    pitch_mm: 25.4, pitch_in: 1.0, catalogPage: 216, image: BL.S7544_TRFG,
    description: "Blueline® 7544 — 1-inch tighter-radius sideflexing. Collapse factor 1.6. H=11 mm.",
    applications: ["Tight horizontal curves", "Food processing tight curves"],
    advantages: ["Tighter collapse factor 1.6 vs 7540", "Flush Grid for drainage", "Grip Top for inclined curves"],
    sprockets: [
      { name: "7544 Split Machined Sprocket", teeth: "Catalog-confirmed", bore: "Square / Round", material: "Polyamide (PA)", notes: "7540-7544 split machined sprocket.", image: BL.SP_7540_7544, url: "https://www.movexii.com/en/p/sprockets-turning-disks/belt-sprockets/7540-7544-split-machined-sprocketm" },
      { name: "7544 One-Piece Molded Sprocket", teeth: "Catalog-confirmed", bore: "Square / Round", material: "Polyamide (PA)", notes: "7540-7544 one-piece molded sprocket.", image: BL.SP_7540_7544_M, url: "https://www.movexii.com/en/p/sprockets-turning-disks/belt-sprockets/7540-7544-one-piece-molded-sprocketm" },
      { name: "7544 Support Sprocket", teeth: "Catalog-confirmed", bore: "Square / Round", material: "Polyamide (PA)", notes: "7544 support sprocket for tight radius curves.", image: BL.SP_7544_SUP, url: "https://www.movexii.com/en/p/sprockets-turning-disks/belt-sprockets/7544-support-sprocketm" },
    ],
    accessories: [
      { name: "7544 Straight Track",             type: "track", image: null, notes: "Straight track for 7544.",                     url: "https://www.movexii.com/en/prodcat/curves-straight-tracks" },
      { name: "7544 Curved Track (Tight Radius)", type: "track", image: null, notes: "Tighter radius curved track. Collapse 1.6.", url: "https://www.movexii.com/en/prodcat/curves-straight-tracks" },
    ],
    techChartUrl: MOVEX_BLUELINE_URL, catalogPageRef: "216 (Imperial) / p.45 Blueline",
    collapse_factor: 1.6, fixation: "Missing Data – Needs Mapping",
    styles: [
      { key: "tr_flush_grid", label: "7544 TR-FG — Tight Radius Flush Grid", openArea: "~35%", surface: "Open Grid / Tight Radius", image: BL.S7544_TRFG, description: "Tight-radius sideflexing flush grid. Collapse 1.6. H=11 mm.", applications: ["Tight horizontal curves", "Curved drainage"], beltData: "To be confirmed by Uniking", notes: ["Tighter radius than 7540. Collapse 1.6."], url: "https://www.movexii.com/en/p/modular-belts/7544-tight-radius-flush-grid" },
      { key: "tr_grip_top",   label: "7544 TR-GT — Tight Radius Grip Top",   openArea: "0%",   surface: "Closed / Grip / Tight Radius", image: BL.S7544_TRGT, description: "Tight-radius sideflexing grip top. Collapse 1.6. H=11 mm.",            applications: ["Grip on tight curves"],                    beltData: "To be confirmed by Uniking", notes: ["Grip top + tight radius. Collapse 1.6."], url: "https://www.movexii.com/en/p/modular-belts/7544-tight-radius-grip-top" },
    ],
  },

  // ── ZERO CONTACT
  {
    id: "S_ZERO_CONTACT", name: "Zero Contact (Blueline®)", beltType: "Straight-Running / Special",
    pitch_mm: null, pitch_in: null, catalogPage: 217, image: null,
    description: "Blueline® Zero Contact — eliminates direct contact between belt and product for ultra-hygienic handling.",
    applications: ["Ultra-hygienic food processing", "Delicate product handling", "No-contact conveying"],
    advantages: ["Zero product-to-belt contact", "Ultra-hygienic design", "PRO version available"],
    sprockets: [
      { name: "Zero Contact Sprocket", teeth: "Catalog-confirmed", bore: "Square / Round", material: "Polyamide (PA)", notes: "Zero Contact one-piece machined sprocket.", image: BL.SP_ZERO_CONTACT, url: "https://www.movexii.com/en/p/sprockets-turning-disks/belt-sprockets/zero-contact-one-piece-machined-sprocketm" },
      { name: "Zero Contact PRO Sprocket", teeth: "Catalog-confirmed", bore: "Square / Round", material: "Polyamide (PA)", notes: "Zero Contact PRO one-piece machined sprocket.", image: BL.SP_ZERO_PRO, url: "https://www.movexii.com/en/p/sprockets-turning-disks/belt-sprockets/zero-contact-pro-one-piece-machined-sprocketm" },
    ],
    accessories: [{ name: "Zero Contact Track System", type: "track", image: null, notes: "Special track system.", url: "https://www.movexii.com/en/prodcat/accessories" }],
    techChartUrl: MOVEX_BLUELINE_URL, catalogPageRef: "217 (Imperial) / p.49 Blueline",
    fixation: "Missing Data – Needs Mapping",
    styles: [
      { key: "zero_contact",     label: "Zero Contact",     openArea: "N/A", surface: "Zero Contact / Special",     image: null, description: "Standard Zero Contact belt.", applications: ["Ultra-hygienic handling"],          beltData: "Missing Data – Needs Mapping", notes: ["Zero product-to-belt contact."], url: "https://www.movexii.com/en/prodcat/modular-belts" },
      { key: "zero_contact_pro", label: "Zero Contact PRO", openArea: "N/A", surface: "Zero Contact PRO / Special", image: null, description: "PRO version for demanding no-contact applications.", applications: ["Demanding no-contact food processing"], beltData: "Missing Data – Needs Mapping", notes: ["Enhanced PRO zero contact design."], url: "https://www.movexii.com/en/prodcat/modular-belts" },
    ],
  },
];

// ── Merge Eurobelt sub-brand series into the Movex catalog ──────────────────
const _EB_FOR_MOVEX = _EB_SERIES.map(s => ({
  ...s,
  brand: "eurobelt",
  name: s.name.includes("Eurobelt") ? s.name : `${s.name} (Eurobelt)`,
  techChartUrl: _EB_CAT_URL,
  catalogPageRef: s.url,
  styles: (s.styles || []).map(st => ({
    ...st,
    image: st.image || s.image,
    applications: s.applications || [],
    beltData: [
      { material: "POM",    label: "POM White (Acetal)",           pinMaterial: "SS Rod", tempC: "-40 to +90",  tempF: "-40 to 194" },
      { material: "PP",     label: "PP White (Polypropylene)",       pinMaterial: "SS Rod", tempC: "+1 to +90",   tempF: "34 to 194"  },
      { material: "PBT",    label: "PBT Beige",                      pinMaterial: "SS Rod", tempC: "-40 to +130", tempF: "-40 to 266" },
      { material: "POM-DT", label: "POM Detectable (Acetal)",        pinMaterial: "SS Rod", tempC: "-40 to +90",  tempF: "-40 to 194" },
    ],
    notes: [st.description, "Contact Uniking for full tensile and mass specifications."],
    url: s.url,
  })),
}));

export const MOVEX_SERIES = [
  ..._BASE_MOVEX_SERIES.map(s => ({ ...s, brand: s.name.includes("Blueline") ? "blueline" : "movex" })),
  ..._EB_FOR_MOVEX,
];

export const MOVEX_STRAIGHT_SERIES = MOVEX_SERIES.filter(s => s.beltType === "Straight-Running" || s.beltType === "Straight-Running / Special");
export const MOVEX_SIDEFLEXING_SERIES = MOVEX_SERIES.filter(s => s.beltType === "Sideflexing");

export const MOVEX_INDUSTRIES = [
  "Food Processing", "Meat & Poultry", "Seafood Processing", "Bakery & Snack",
  "Dairy", "Beverage Packaging", "Packaging Lines", "Automotive", "Logistics",
  "General Industrial", "Agriculture", "Pharmaceutical", "Other",
];