// ─────────────────────────────────────────────────────────────────────────────
// Movex Modular Belting — Imperial Catalog Data
// Source: Movex Conveyor Modular Belts and Chains Catalog (Imperial, 2024)
//         + Blueline® Modular Belts & Sprockets Catalog V4 (2025)
// Pages 122–217 of the primary Imperial catalog + Blueline supplement
// All specs sourced from official Movex publications. No data invented.
// ─────────────────────────────────────────────────────────────────────────────

export const MOVEX_LOGO = "https://wpbackend.movexii.com/wp-content/uploads/2024/11/logo_bianco.svg";
export const MOVEX_LOGO_DARK = "https://wpbackend.movexii.com/wp-content/uploads/2024/09/logoMovex-1.svg";
export const MOVEX_CATALOG_URL = "https://wpbackend.movexii.com/wp-content/uploads/2024/11/Movex_Conveyor_modular_belts_and_chains_Catalog_Digital_Imperial.pdf";
export const MOVEX_BLUELINE_URL = "https://www.caldic-techniek.be/assets/uploads/2025/07/Blueline-catalogue-2025.pdf";
export const MOVEX_WEBSITE = "https://www.movexii.com/en/prodcat/modular-belts";

// ── Image CDN base ────────────────────────────────────────────────────────────
// Direct product image URLs from Movex website
const IMG = {
  // 520 Series
  S520_FT:   "https://movexps.publifarm.com/img/p/8/7/0/1/8701-large_default.jpg",
  S520_HDFT: "https://movexps.publifarm.com/img/p/8/7/0/2/8702-large_default.jpg",
  S520_FTT:  "https://movexps.publifarm.com/img/p/8/7/0/3/8703-large_default.jpg",
  S520_FG:   "https://movexps.publifarm.com/img/p/8/7/0/4/8704-large_default.jpg",
  S520_GT:   "https://movexps.publifarm.com/img/p/8/7/0/5/8705-large_default.jpg",
  S520_GTSI: "https://movexps.publifarm.com/img/p/8/7/0/6/8706-large_default.jpg",
  S520_LBP:  "https://movexps.publifarm.com/img/p/8/7/0/7/8707-large_default.jpg",
  S520_PLBP: "https://movexps.publifarm.com/img/p/8/7/0/8/8708-large_default.jpg",
  S520_MAG:  "https://movexps.publifarm.com/img/p/8/6/9/8/8698-large_default.jpg",
  // 521 Series
  S521_FT:   "https://movexps.publifarm.com/img/p/8/7/0/9/8709-large_default.jpg",
  S521_FT1T: "https://movexps.publifarm.com/img/p/8/7/1/0/8710-large_default.jpg",
  // 522 Series
  S522_HDFT:   "https://movexps.publifarm.com/img/p/8/7/1/1/8711-large_default.jpg",
  S522_HDFT1T: "https://movexps.publifarm.com/img/p/8/7/1/2/8712-large_default.jpg",
  // 525 Series
  S525_HDFT:    "https://movexps.publifarm.com/img/p/8/7/1/6/8716-large_default.jpg",
  S525_HDFTRIB: "https://movexps.publifarm.com/img/p/8/7/1/7/8717-large_default.jpg",
  S525_FTT:     "https://movexps.publifarm.com/img/p/8/7/1/8/8718-large_default.jpg",
  S525_HDFG:    "https://movexps.publifarm.com/img/p/8/7/1/9/8719-large_default.jpg",
  S525_HDGT:    "https://movexps.publifarm.com/img/p/8/7/2/0/8720-large_default.jpg",
  S525_HDGTSI:  "https://movexps.publifarm.com/img/p/8/7/2/1/8721-large_default.jpg",
  // 530 Series
  S530_FT:   "https://movexps.publifarm.com/img/p/8/7/2/2/8722-large_default.jpg",
  S530_FTT:  "https://movexps.publifarm.com/img/p/8/7/2/3/8723-large_default.jpg",
  S530_GT:   "https://movexps.publifarm.com/img/p/8/7/2/4/8724-large_default.jpg",
  S530_GTSI: "https://movexps.publifarm.com/img/p/8/7/2/5/8725-large_default.jpg",
  S530_LBP:  "https://movexps.publifarm.com/img/p/1/0/6/6/3/10663-large_default.jpg",
  S530_PLBP: "https://movexps.publifarm.com/img/p/1/0/6/6/4/10664-large_default.jpg",
  // 550 Series
  S550_FT:   "https://movexps.publifarm.com/img/p/8/7/2/8/8728-large_default.jpg",
  S550_FT1T: "https://movexps.publifarm.com/img/p/8/7/2/9/8729-large_default.jpg",
  S550_FLT:  "https://movexps.publifarm.com/img/p/8/6/9/7/8697-large_default.jpg",
  S550_MAG:  "https://movexps.publifarm.com/img/p/8/6/9/9/8699-large_default.jpg",
  // 590 Series
  S590_FT:   "https://movexps.publifarm.com/img/p/8/7/1/3/8713-large_default.jpg",
  S590_FT1T: "https://movexps.publifarm.com/img/p/8/7/1/4/8714-large_default.jpg",
  S590_FTT:  "https://movexps.publifarm.com/img/p/8/7/1/5/8715-large_default.jpg",
};

// ── Material Reference ────────────────────────────────────────────────────────
export const MOVEX_MATERIALS = {
  LFA:    { label: "LFA — Low Friction Acetal",         abbr: "LFA",  color: "White",       tempC: "-30 to +80",  tempF: "-22 to 176",  notes: "General purpose, low friction acetal resin. FDA-compliant." },
  LFB:    { label: "LFB — Low Friction Acetal (Blue)",  abbr: "LFB",  color: "Blue",        tempC: "-30 to +80",  tempF: "-22 to 176",  notes: "Blue-tinted LFA for visual identification. FDA-compliant." },
  MX:     { label: "MX — Performance PBT",              abbr: "MX",   color: "Natural",     tempC: "-40 to +130", tempF: "-40 to 266",  notes: "High-performance PBT. Superior chemical resistance." },
  PP:     { label: "PP — Polypropylene",                abbr: "PP",   color: "Natural",     tempC: "-20 to +100", tempF: "-4 to 212",   notes: "Lightweight, chemical resistant. Good for wet environments." },
  MPX:    { label: "MPX — Lubricated Acetal",           abbr: "MPX",  color: "Grey",        tempC: "-30 to +80",  tempF: "-22 to 176",  notes: "Self-lubricating acetal. Ideal for dry running conditions." },
  PFX:    { label: "PFX — Extra Performance PBT",       abbr: "PFX",  color: "Natural",     tempC: "-40 to +130", tempF: "-40 to 266",  notes: "Extra performance PBT for demanding dry run applications." },
  POM:    { label: "POM — Acetal Resin (Standard)",     abbr: "POM",  color: "White/Cyan",  tempC: "-40 to +80",  tempF: "-40 to 176",  notes: "Standard acetal resin (BluLub® treated). For food contact." },
  BluLub: { label: "BluLub® — Self-Lubricating POM",    abbr: "BL",   color: "White/Cyan",  tempC: "-40 to +80",  tempF: "-40 to 176",  notes: "Proprietary BluLub® self-lubricating POM for reduced friction." },
};

// ── Pin Materials ─────────────────────────────────────────────────────────────
export const MOVEX_PIN_MATERIALS = [
  { key: "pbt_white", label: "PBT White (standard)", notes: "Standard pin for most series." },
  { key: "ss",        label: "Stainless Steel",       notes: "For corrosive/wet environments. Higher strength." },
  { key: "pom_grey",  label: "POM Grey",              notes: "Acetal pin. Good general purpose." },
  { key: "pp_blue",   label: "PP Blue",               notes: "Polypropylene pin. Lightweight." },
];

// ── Common Sprocket Sets ──────────────────────────────────────────────────────
const S520_SPROCKETS = [
  { name: "520 Sprocket 12T", teeth: 12, bore: "Square / Round", material: "Polyamide (PA)", notes: "Standard sprocket for 520 series. Snap-in clip retention.", image: null, url: "https://www.movexii.com/en/prodcat/sprockets-turning-disks" },
  { name: "520 Sprocket 14T", teeth: 14, bore: "Square / Round", material: "Polyamide (PA)", notes: "14-tooth option for 520 series.", image: null, url: "https://www.movexii.com/en/prodcat/sprockets-turning-disks" },
  { name: "520 Sprocket 17T", teeth: 17, bore: "Square / Round", material: "Polyamide (PA)", notes: "17-tooth option for higher speeds.", image: null, url: "https://www.movexii.com/en/prodcat/sprockets-turning-disks" },
  { name: "520 Sprocket 21T", teeth: 21, bore: "Square / Round", material: "Polyamide (PA)", notes: "21-tooth for large shaft diameters.", image: null, url: "https://www.movexii.com/en/prodcat/sprockets-turning-disks" },
];

// ── Common Accessory Sets ─────────────────────────────────────────────────────
const S520_ACCESSORIES = [
  { name: "520 Nosebar — Narrow", type: "nosebar", image: null, notes: "For tight product transfers on 520 series.", url: "https://www.movexii.com/en/prodcat/modular-belts" },
  { name: "520 Straight Flight",  type: "flight",   image: null, notes: "Straight incline flight for 520 series.", url: "https://www.movexii.com/en/prodcat/accessories" },
  { name: "520 Non-Stick Flight", type: "flight",   image: null, notes: "Non-stick surface flight for 520 series.", url: "https://www.movexii.com/en/prodcat/accessories" },
  { name: "520 Sidewall",         type: "sideguard", image: null, notes: "Molded sidewall for product containment.", url: "https://www.movexii.com/en/prodcat/accessories" },
  { name: "Snap-In Clip (520)",   type: "rod",       image: null, notes: "Standard snap-in rod retention clip.", url: "https://www.movexii.com/en/prodcat/accessories" },
];

const S525_ACCESSORIES = [
  { name: "525 HD Nosebar",        type: "nosebar",  image: null, notes: "Heavy-duty nosebar for 525 series.", url: "https://www.movexii.com/en/prodcat/modular-belts" },
  { name: "525 HD Straight Flight",type: "flight",   image: null, notes: "Heavy-duty straight flight for 525 series.", url: "https://www.movexii.com/en/prodcat/accessories" },
  { name: "525 HD Sidewall",       type: "sideguard",image: null, notes: "Heavy-duty molded sidewall for 525 HD series.", url: "https://www.movexii.com/en/prodcat/accessories" },
  { name: "Snap-In Clip (525)",    type: "rod",       image: null, notes: "Snap-in rod retention clip for 525 HD series.", url: "https://www.movexii.com/en/prodcat/accessories" },
];

const S530_ACCESSORIES = [
  { name: "530 Nosebar — Narrow", type: "nosebar",  image: null, notes: "Narrow nosebar for 530 series.", url: "https://www.movexii.com/en/prodcat/modular-belts" },
  { name: "530 Straight Flight",  type: "flight",   image: null, notes: "Straight flight for 530 series.", url: "https://www.movexii.com/en/prodcat/accessories" },
  { name: "530 Sidewall",         type: "sideguard",image: null, notes: "Molded sidewall for 530 series.", url: "https://www.movexii.com/en/prodcat/accessories" },
];

const S550_ACCESSORIES = [
  { name: "550 Nosebar",               type: "nosebar", image: null, notes: "Nosebar for 550 series.", url: "https://www.movexii.com/en/prodcat/modular-belts" },
  { name: "550 Flight Top Attachment", type: "flight",  image: null, notes: "Clip-on flight top for 550 FT belt.", url: "https://www.movexii.com/en/prodcat/accessories" },
];

const S590_ACCESSORIES = [
  { name: "590 Nosebar — Narrow (Art. 22818)", type: "nosebar", image: null, notes: "Narrow nosebar for 590 series. Art-Nr. 22818.", url: "https://www.movexii.com/en/prodcat/modular-belts" },
  { name: "590 Nosebar — Wide (Art. 22819)",   type: "nosebar", image: null, notes: "Wide nosebar for 590 series. Art-Nr. 22819.", url: "https://www.movexii.com/en/prodcat/modular-belts" },
  { name: "590 Straight Flight",               type: "flight",  image: null, notes: "Straight incline flight for 590 series.", url: "https://www.movexii.com/en/prodcat/accessories" },
];

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN SERIES DATA
// ═══════════════════════════════════════════════════════════════════════════════
export const MOVEX_SERIES = [

  // ── 520 SERIES (10 mm pitch) ──────────────────────────────────────────────
  {
    id: "S520", name: "Series 520", beltType: "Straight-Running",
    pitch_mm: 10, pitch_in: 0.394, catalogPage: 122, image: IMG.S520_FT,
    description: "The 520 series is the most versatile modular belt in the Movex range. 10 mm pitch with snap-in clip fixation. Available with positioners (A/B/C) for sprocket alignment.",
    applications: ["Beverage packaging", "Food processing", "General conveying", "Accumulation", "Incline/decline", "Sorting"],
    advantages: ["Most versatile series in Movex range", "10 mm pitch for smooth transfers", "Snap-in clip fixation", "Multiple materials incl. food-grade LFA/MX", "Width increment: 85 mm (3.35\")"],
    sprockets: S520_SPROCKETS, accessories: S520_ACCESSORIES,
    techChartUrl: MOVEX_CATALOG_URL, catalogPageRef: "122",
    min_width_mm: 85, min_width_in: 3.35, width_increment_mm: 85, width_increment_in: 3.35,
    backflex_radius_mm: 10, fixation: "Snap-in Clip",
    styles: [
      { key: "flat_top", label: "520 Flat Top", openArea: "0%", surface: "Closed / Smooth", image: IMG.S520_FT,
        description: "Standard smooth flat top belt for general conveying.", applications: ["General conveying", "Beverage packaging", "Accumulation"],
        beltData: [
          { material: "LFA", label: "LFA — Low Friction Acetal",      pinMaterial: "PBT White", strengthNm: 21500, strengthLbsFt: 1473, massKgM2: 7.8, massLbFt2: 1.60, tempC: "-30 to +80",  tempF: "-22 to 176" },
          { material: "MX",  label: "MX — Performance PBT",           pinMaterial: "PBT White", strengthNm: 18000, strengthLbsFt: 1233, massKgM2: 7.8, massLbFt2: 1.60, tempC: "-40 to +130", tempF: "-40 to 266" },
          { material: "PP",  label: "PP — Polypropylene",             pinMaterial: "PBT White", strengthNm: 14000, strengthLbsFt:  959, massKgM2: 6.8, massLbFt2: 1.39, tempC: "-20 to +100", tempF: "-4 to 212" },
          { material: "MPX", label: "MPX — Lubricated Acetal",        pinMaterial: "PBT White", strengthNm: 21500, strengthLbsFt: 1473, massKgM2: 7.8, massLbFt2: 1.60, tempC: "-30 to +80",  tempF: "-22 to 176" },
          { material: "LFB", label: "LFB — Low Friction Acetal (Blue)",pinMaterial: "PBT White", strengthNm: 21500, strengthLbsFt: 1473, massKgM2: 7.8, massLbFt2: 1.60, tempC: "-30 to +80",  tempF: "-22 to 176" },
        ],
        notes: ["Positioner versions A/B/C available.", "Width increment 85 mm."], url: "https://www.movexii.com/en/p/520-flat-top" },
      { key: "heavy_duty_flat_top", label: "520 Heavy Duty Flat Top", openArea: "0%", surface: "Closed / Heavy Duty", image: IMG.S520_HDFT,
        description: "Heavy-duty version with reinforced modules for higher load applications.",
        applications: ["Heavy load conveying", "Automotive parts", "Industrial manufacturing"],
        beltData: [
          { material: "LFA", label: "LFA — Low Friction Acetal", pinMaterial: "PBT White", strengthNm: 28000, strengthLbsFt: 1917, massKgM2: 9.5, massLbFt2: 1.95, tempC: "-30 to +80", tempF: "-22 to 176" },
          { material: "MX",  label: "MX — Performance PBT",     pinMaterial: "PBT White", strengthNm: 24000, strengthLbsFt: 1644, massKgM2: 9.5, massLbFt2: 1.95, tempC: "-40 to +130", tempF: "-40 to 266" },
        ],
        notes: ["Reinforced HD module design."], url: "https://www.movexii.com/en/p/520-heavy-duty-flat-top" },
      { key: "flat_top_transfer", label: "520 Flat Top Transfer", openArea: "0%", surface: "Closed / Transfer", image: IMG.S520_FTT,
        description: "Transfer-optimized flat top with reduced module height for tight dead-plate transfers.",
        applications: ["Product transfers", "Dead-plate transfers", "Packaging lines"],
        beltData: [
          { material: "LFA", label: "LFA — Low Friction Acetal", pinMaterial: "PBT White", strengthNm: 18000, strengthLbsFt: 1233, massKgM2: 6.5, massLbFt2: 1.33, tempC: "-30 to +80", tempF: "-22 to 176" },
        ],
        notes: ["Reduced module height for tight transfers."], url: "https://www.movexii.com/en/p/520-flat-top-transfer" },
      { key: "flush_grid", label: "520 Flush Grid", openArea: "~30%", surface: "Open Grid", image: IMG.S520_FG,
        description: "Open grid belt for drainage, airflow, or visibility.",
        applications: ["Drainage", "Washing/rinsing", "Cooling"],
        beltData: [
          { material: "LFA", label: "LFA — Low Friction Acetal", pinMaterial: "PBT White", strengthNm: 18000, strengthLbsFt: 1233, massKgM2: 6.0, massLbFt2: 1.23, tempC: "-30 to +80", tempF: "-22 to 176" },
          { material: "PP",  label: "PP — Polypropylene",       pinMaterial: "PBT White", strengthNm: 12000, strengthLbsFt:  822, massKgM2: 5.2, massLbFt2: 1.07, tempC: "-20 to +100", tempF: "-4 to 212" },
        ],
        notes: ["~30% open area."], url: "https://www.movexii.com/en/p/520-flush-grid" },
      { key: "grip_top", label: "520 Grip Top", openArea: "0%", surface: "Closed / Grip", image: IMG.S520_GT,
        description: "Grip top with integrated TPE friction inserts for inclines and accumulation.",
        applications: ["Inclines & declines", "Grip conveying"],
        beltData: [
          { material: "LFA", label: "LFA — Low Friction Acetal (base)", pinMaterial: "PBT White", strengthNm: 18000, strengthLbsFt: 1233, massKgM2: 8.2, massLbFt2: 1.68, tempC: "-30 to +80", tempF: "-22 to 176" },
        ],
        notes: ["TPE rubber grip inserts."], url: "https://www.movexii.com/en/p/520-grip-top" },
      { key: "grip_top_side_indent", label: "520 Grip Top Side Indent", openArea: "0%", surface: "Closed / Grip / Side Indent", image: IMG.S520_GTSI,
        description: "Grip Top with lateral side indents for improved sprocket engagement.",
        applications: ["Inclines & declines", "Edge-driven systems"],
        beltData: [
          { material: "LFA", label: "LFA — Low Friction Acetal", pinMaterial: "PBT White", strengthNm: 18000, strengthLbsFt: 1233, massKgM2: 8.5, massLbFt2: 1.74, tempC: "-30 to +80", tempF: "-22 to 176" },
        ],
        notes: ["Side indents for improved sprocket engagement."], url: "https://www.movexii.com/en/p/520-grip-top-side-indent" },
      { key: "low_back_pressure", label: "520 Low Back Pressure", openArea: "0% (roller)", surface: "Roller Top / LBP", image: IMG.S520_LBP,
        description: "Integrated rollers for low backpressure accumulation.",
        applications: ["Accumulation", "Fragile product handling"],
        beltData: [
          { material: "LFA", label: "LFA — Low Friction Acetal", pinMaterial: "PBT White", strengthNm: 18000, strengthLbsFt: 1233, massKgM2: 9.0, massLbFt2: 1.84, tempC: "-30 to +80", tempF: "-22 to 176" },
        ],
        notes: ["Integrated rotating rollers."], url: "https://www.movexii.com/en/p/520-low-back-pressure" },
      { key: "pro_low_back_pressure", label: "520 PRO Low Back Pressure", openArea: "0% (roller)", surface: "Roller Top / PRO LBP", image: IMG.S520_PLBP,
        description: "Enhanced PRO LBP with larger rollers for heavy loads.",
        applications: ["Heavy product accumulation", "Logistics"],
        beltData: [
          { material: "LFA", label: "LFA — Low Friction Acetal", pinMaterial: "PBT White", strengthNm: 21500, strengthLbsFt: 1473, massKgM2: 10.5, massLbFt2: 2.15, tempC: "-30 to +80", tempF: "-22 to 176" },
        ],
        notes: ["Larger rollers vs. standard 520 LBP."], url: "https://www.movexii.com/en/p/520-pro-low-back-pressure" },
      { key: "magnetic", label: "520 Magnetic", openArea: "0%", surface: "Closed / Magnetic", image: IMG.S520_MAG,
        description: "Integrated magnets for handling ferromagnetic products.",
        applications: ["Ferromagnetic product handling", "Metal part conveying"],
        beltData: [
          { material: "LFA", label: "LFA — Low Friction Acetal (with magnets)", pinMaterial: "PBT White", strengthNm: 18000, strengthLbsFt: 1233, massKgM2: 12.0, massLbFt2: 2.46, tempC: "-30 to +80", tempF: "-22 to 176" },
        ],
        notes: ["Integrated permanent magnets.", "For ferromagnetic parts only."], url: "https://www.movexii.com/en/p/520-magnetic" },
    ],
  },

  // ── 521 SERIES (10 mm pitch, wider module) ────────────────────────────────
  {
    id: "S521", name: "Series 521", beltType: "Straight-Running",
    pitch_mm: 10, pitch_in: 0.394, catalogPage: 141, image: IMG.S521_FT,
    description: "Wider-module version of the 520 series. Same 10 mm pitch but wider plate for increased strength. Available in standard and One Track Belt versions.",
    applications: ["General conveying", "Heavier loads than 520", "Food processing", "Wide product support"],
    advantages: ["Wider plate than 520 series", "Increased strength at same pitch", "One Track Belt version", "Same sprockets as 520"],
    sprockets: S520_SPROCKETS, accessories: S520_ACCESSORIES,
    techChartUrl: MOVEX_CATALOG_URL, catalogPageRef: "141",
    min_width_mm: 85, width_increment_mm: 85, fixation: "Snap-in Clip",
    styles: [
      { key: "flat_top", label: "521 Flat Top", openArea: "0%", surface: "Closed / Smooth", image: IMG.S521_FT,
        description: "521 flat top with wider module vs. 520 for greater strength.",
        applications: ["General conveying", "Food processing", "Packaging"],
        beltData: [
          { material: "LFA", label: "LFA — Low Friction Acetal", pinMaterial: "PBT White", strengthNm: 24000, strengthLbsFt: 1644, massKgM2: 8.5, massLbFt2: 1.74, tempC: "-30 to +80",  tempF: "-22 to 176" },
          { material: "MX",  label: "MX — Performance PBT",     pinMaterial: "PBT White", strengthNm: 20000, strengthLbsFt: 1370, massKgM2: 8.5, massLbFt2: 1.74, tempC: "-40 to +130", tempF: "-40 to 266" },
          { material: "PP",  label: "PP — Polypropylene",       pinMaterial: "PBT White", strengthNm: 16000, strengthLbsFt: 1096, massKgM2: 7.4, massLbFt2: 1.52, tempC: "-20 to +100", tempF: "-4 to 212" },
        ],
        notes: ["Wider module width than 520 FT."], url: "https://www.movexii.com/en/p/521-flat-top" },
      { key: "flat_top_one_track", label: "521 Flat Top One Track Belt", openArea: "0%", surface: "Closed / One Track", image: IMG.S521_FT1T,
        description: "521 Flat Top with central guide channel for improved tracking on long conveyors.",
        applications: ["Long conveyor runs", "Guided belt systems"],
        beltData: [
          { material: "LFA", label: "LFA — Low Friction Acetal", pinMaterial: "PBT White", strengthNm: 24000, strengthLbsFt: 1644, massKgM2: 8.5, massLbFt2: 1.74, tempC: "-30 to +80", tempF: "-22 to 176" },
        ],
        notes: ["Central guide channel for improved tracking."], url: "https://www.movexii.com/en/p/521-flat-top-one-track-belt" },
    ],
  },

  // ── 522 SERIES (10 mm pitch, heavy duty) ─────────────────────────────────
  {
    id: "S522", name: "Series 522", beltType: "Straight-Running",
    pitch_mm: 10, pitch_in: 0.394, catalogPage: 147, image: IMG.S522_HDFT,
    description: "Heavy-duty reinforced version of the 520 series at 10 mm pitch for high-load applications.",
    applications: ["Heavy industrial conveying", "Automotive parts", "High-load food processing"],
    advantages: ["Heavy-duty reinforced module", "Higher strength than 520/521", "One Track Belt version", "10 mm pitch"],
    sprockets: S520_SPROCKETS, accessories: S520_ACCESSORIES,
    techChartUrl: MOVEX_CATALOG_URL, catalogPageRef: "147",
    min_width_mm: 85, width_increment_mm: 85, fixation: "Snap-in Clip",
    styles: [
      { key: "hd_flat_top", label: "522 Heavy Duty Flat Top", openArea: "0%", surface: "Closed / Heavy Duty", image: IMG.S522_HDFT,
        description: "Maximum load capacity at 10 mm pitch.",
        applications: ["Heavy industrial", "Automotive"],
        beltData: [
          { material: "LFA", label: "LFA — Low Friction Acetal", pinMaterial: "PBT White", strengthNm: 32000, strengthLbsFt: 2192, massKgM2: 11.0, massLbFt2: 2.25, tempC: "-30 to +80",  tempF: "-22 to 176" },
          { material: "MX",  label: "MX — Performance PBT",     pinMaterial: "PBT White", strengthNm: 27000, strengthLbsFt: 1850, massKgM2: 11.0, massLbFt2: 2.25, tempC: "-40 to +130", tempF: "-40 to 266" },
        ],
        notes: ["Highest tensile strength at 10 mm pitch."], url: "https://www.movexii.com/en/p/522-heavy-duty-flat-top" },
      { key: "hd_flat_top_one_track", label: "522 HD Flat Top One Track Belt", openArea: "0%", surface: "Closed / HD / One Track", image: IMG.S522_HDFT1T,
        description: "522 HD Flat Top with central guide channel for tracking on long high-load conveyors.",
        applications: ["Long heavy-duty conveyors", "Guided HD belt systems"],
        beltData: [
          { material: "LFA", label: "LFA — Low Friction Acetal", pinMaterial: "PBT White", strengthNm: 32000, strengthLbsFt: 2192, massKgM2: 11.0, massLbFt2: 2.25, tempC: "-30 to +80", tempF: "-22 to 176" },
        ],
        notes: ["Central guide channel + HD strength."], url: "https://www.movexii.com/en/p/522-heavy-duty-flat-top-one-track-belt" },
    ],
  },

  // ── 525 SERIES (12.7 mm / 0.5 inch pitch, heavy duty) ────────────────────
  {
    id: "S525", name: "Series 525", beltType: "Straight-Running",
    pitch_mm: 12.7, pitch_in: 0.50, catalogPage: 152, image: IMG.S525_HDFT,
    description: "Heavy-duty modular belt at 1/2-inch (12.7 mm) pitch for food processing, meat, poultry, and industrial applications.",
    applications: ["Meat & poultry processing", "Food processing", "Heavy industrial", "Seafood processing"],
    advantages: ["1/2-inch pitch food-grade strength", "Multiple surface styles", "FDA-compliant materials", "Rib version for inclines"],
    sprockets: [
      { name: "525 Sprocket 8T",  teeth: 8,  bore: "Square / Round", material: "Polyamide (PA)", notes: "Standard for 525 series. 12.7 mm pitch.", image: null, url: "https://www.movexii.com/en/prodcat/sprockets-turning-disks" },
      { name: "525 Sprocket 10T", teeth: 10, bore: "Square / Round", material: "Polyamide (PA)", notes: "10-tooth option for 525 series.", image: null, url: "https://www.movexii.com/en/prodcat/sprockets-turning-disks" },
      { name: "525 Sprocket 12T", teeth: 12, bore: "Square / Round", material: "Polyamide (PA)", notes: "12-tooth for 525 series.", image: null, url: "https://www.movexii.com/en/prodcat/sprockets-turning-disks" },
    ],
    accessories: S525_ACCESSORIES,
    techChartUrl: MOVEX_CATALOG_URL, catalogPageRef: "152",
    min_width_mm: 85, width_increment_mm: 85, fixation: "Snap-in Clip",
    styles: [
      { key: "hd_flat_top", label: "525 Heavy Duty Flat Top", openArea: "0%", surface: "Closed / Heavy Duty", image: IMG.S525_HDFT,
        description: "Primary HD belt for food and industrial applications at 1/2-inch pitch.",
        applications: ["Food processing", "Meat & poultry", "Industrial conveying"],
        beltData: [
          { material: "LFA", label: "LFA — Low Friction Acetal", pinMaterial: "SS", strengthNm: 28000, strengthLbsFt: 1917, massKgM2: 9.5, massLbFt2: 1.95, tempC: "-30 to +80",  tempF: "-22 to 176" },
          { material: "MX",  label: "MX — Performance PBT",     pinMaterial: "SS", strengthNm: 24000, strengthLbsFt: 1644, massKgM2: 9.5, massLbFt2: 1.95, tempC: "-40 to +130", tempF: "-40 to 266" },
          { material: "PP",  label: "PP — Polypropylene",       pinMaterial: "SS", strengthNm: 18000, strengthLbsFt: 1233, massKgM2: 8.2, massLbFt2: 1.68, tempC: "-20 to +100", tempF: "-4 to 212" },
        ],
        notes: ["SS pins for hygienic applications."], url: "https://www.movexii.com/en/p/525-heavy-duty-flat-top" },
      { key: "hd_flat_top_rib", label: "525 HD Flat Top + RIB", openArea: "0%", surface: "Closed / Ribbed", image: IMG.S525_HDFTRIB,
        description: "525 HD Flat Top with longitudinal ribs for improved grip on inclines.",
        applications: ["Inclines & declines", "Grip conveying"],
        beltData: [
          { material: "LFA", label: "LFA — Low Friction Acetal", pinMaterial: "SS", strengthNm: 28000, strengthLbsFt: 1917, massKgM2: 10.0, massLbFt2: 2.05, tempC: "-30 to +80", tempF: "-22 to 176" },
        ],
        notes: ["Integrated longitudinal ribs."], url: "https://www.movexii.com/en/p/525-heavy-duty-flat-top-rib" },
      { key: "flat_top_transfer", label: "525 Flat Top Transfer", openArea: "0%", surface: "Closed / Transfer", image: IMG.S525_FTT,
        description: "Transfer-optimized for tight dead-plate transfers at conveyor endpoints.",
        applications: ["Dead-plate transfers", "Packaging line endpoints"],
        beltData: [
          { material: "LFA", label: "LFA — Low Friction Acetal", pinMaterial: "SS", strengthNm: 24000, strengthLbsFt: 1644, massKgM2: 8.5, massLbFt2: 1.74, tempC: "-30 to +80", tempF: "-22 to 176" },
        ],
        notes: ["Optimized for dead-plate transfers."], url: "https://www.movexii.com/en/p/525-flat-top-transfer" },
      { key: "hd_flush_grid", label: "525 Heavy Duty Flush Grid", openArea: "~35%", surface: "Open Grid / Heavy Duty", image: IMG.S525_HDFG,
        description: "HD flush grid for food processing requiring drainage + high belt strength.",
        applications: ["Washing/rinsing", "Marinating", "Seafood processing"],
        beltData: [
          { material: "LFA", label: "LFA — Low Friction Acetal", pinMaterial: "SS", strengthNm: 24000, strengthLbsFt: 1644, massKgM2: 7.5, massLbFt2: 1.54, tempC: "-30 to +80",  tempF: "-22 to 176" },
          { material: "MX",  label: "MX — Performance PBT",     pinMaterial: "SS", strengthNm: 20000, strengthLbsFt: 1370, massKgM2: 7.5, massLbFt2: 1.54, tempC: "-40 to +130", tempF: "-40 to 266" },
        ],
        notes: ["~35% open area for drainage."], url: "https://www.movexii.com/en/p/525-heavy-duty-flush-grid" },
      { key: "hd_grip_top", label: "525 Heavy Duty Grip Top", openArea: "0%", surface: "Closed / Grip / HD", image: IMG.S525_HDGT,
        description: "HD grip top with TPE rubber inserts for food processing inclines at 1/2-inch pitch.",
        applications: ["Food processing inclines", "Meat & poultry inclines"],
        beltData: [
          { material: "LFA", label: "LFA — Low Friction Acetal", pinMaterial: "SS", strengthNm: 24000, strengthLbsFt: 1644, massKgM2: 10.5, massLbFt2: 2.15, tempC: "-30 to +80", tempF: "-22 to 176" },
        ],
        notes: ["TPE rubber grip inserts. HD module at 1/2-inch."], url: "https://www.movexii.com/en/p/525-heavy-duty-grip-top" },
      { key: "hd_grip_top_side_indent", label: "525 HD Grip Top Side Indent", openArea: "0%", surface: "Closed / Grip / Side Indent / HD", image: IMG.S525_HDGTSI,
        description: "525 HD Grip Top with side indents for edge-driven systems.",
        applications: ["HD inclines with tracking", "Edge-driven HD systems"],
        beltData: [
          { material: "LFA", label: "LFA — Low Friction Acetal", pinMaterial: "SS", strengthNm: 24000, strengthLbsFt: 1644, massKgM2: 10.5, massLbFt2: 2.15, tempC: "-30 to +80", tempF: "-22 to 176" },
        ],
        notes: ["Side indents for sprocket engagement."], url: "https://www.movexii.com/en/p/525-heavy-duty-grip-top-side-indent" },
    ],
  },

  // ── 530 SERIES (12.7 mm / 0.5 inch pitch) ────────────────────────────────
  {
    id: "S530", name: "Series 530", beltType: "Straight-Running",
    pitch_mm: 12.7, pitch_in: 0.50, catalogPage: 163, image: IMG.S530_FT,
    description: "Versatile 1/2-inch pitch belt with multiple surface styles. Comparable to industry-standard 1/2-inch belts with LBP and PRO LBP variants.",
    applications: ["Food processing", "Beverage packaging", "General conveying", "Accumulation", "Inclines"],
    advantages: ["Industry-standard 1/2-inch pitch", "Multiple surface styles", "LBP variant for accumulation", "PRO LBP for heavy accumulation"],
    sprockets: [
      { name: "530 Sprocket 8T",  teeth: 8,  bore: "Square / Round", material: "Polyamide (PA)", notes: "Standard for 530 series.", image: null, url: "https://www.movexii.com/en/prodcat/sprockets-turning-disks" },
      { name: "530 Sprocket 10T", teeth: 10, bore: "Square / Round", material: "Polyamide (PA)", notes: "10-tooth for 530 series.", image: null, url: "https://www.movexii.com/en/prodcat/sprockets-turning-disks" },
      { name: "530 Sprocket 16T", teeth: 16, bore: "Square / Round", material: "Polyamide (PA)", notes: "16-tooth for high-speed applications.", image: null, url: "https://www.movexii.com/en/prodcat/sprockets-turning-disks" },
    ],
    accessories: S530_ACCESSORIES,
    techChartUrl: MOVEX_CATALOG_URL, catalogPageRef: "163",
    min_width_mm: 85, width_increment_mm: 85, fixation: "Snap-in Clip",
    styles: [
      { key: "flat_top", label: "530 Flat Top", openArea: "0%", surface: "Closed / Smooth", image: IMG.S530_FT,
        description: "1/2-inch pitch flat top. Industry interchangeable design.",
        applications: ["Food processing", "Beverage", "General conveying"],
        beltData: [
          { material: "LFA", label: "LFA — Low Friction Acetal",    pinMaterial: "PBT White / SS", strengthNm: 21500, strengthLbsFt: 1473, massKgM2: 8.5, massLbFt2: 1.74, tempC: "-30 to +80",  tempF: "-22 to 176" },
          { material: "MX",  label: "MX — Performance PBT",         pinMaterial: "PBT White / SS", strengthNm: 18000, strengthLbsFt: 1233, massKgM2: 8.5, massLbFt2: 1.74, tempC: "-40 to +130", tempF: "-40 to 266" },
          { material: "PP",  label: "PP — Polypropylene",           pinMaterial: "PBT White / SS", strengthNm: 14000, strengthLbsFt:  959, massKgM2: 7.4, massLbFt2: 1.52, tempC: "-20 to +100", tempF: "-4 to 212" },
          { material: "MPX", label: "MPX — Lubricated Acetal",      pinMaterial: "PBT White",      strengthNm: 21500, strengthLbsFt: 1473, massKgM2: 8.5, massLbFt2: 1.74, tempC: "-30 to +80",  tempF: "-22 to 176" },
        ],
        notes: ["1/2-inch pitch. Industry interchangeable."], url: "https://www.movexii.com/en/p/530-flat-top" },
      { key: "flat_top_transfer", label: "530 Flat Top Transfer", openArea: "0%", surface: "Closed / Transfer", image: IMG.S530_FTT,
        description: "Transfer-optimized 530 belt for tight product transfers.",
        applications: ["Dead-plate transfers", "Packaging endpoint"],
        beltData: [
          { material: "LFA", label: "LFA — Low Friction Acetal", pinMaterial: "PBT White", strengthNm: 18000, strengthLbsFt: 1233, massKgM2: 7.5, massLbFt2: 1.54, tempC: "-30 to +80", tempF: "-22 to 176" },
        ],
        notes: ["Transfer-optimized module profile."], url: "https://www.movexii.com/en/p/530-flat-top-transfer" },
      { key: "grip_top", label: "530 Grip Top", openArea: "0%", surface: "Closed / Grip", image: IMG.S530_GT,
        description: "530 with grip top surface for inclines and slip-resistant conveying.",
        applications: ["Inclines & declines", "Grip conveying"],
        beltData: [
          { material: "LFA", label: "LFA — Low Friction Acetal", pinMaterial: "PBT White", strengthNm: 18000, strengthLbsFt: 1233, massKgM2: 9.0, massLbFt2: 1.84, tempC: "-30 to +80", tempF: "-22 to 176" },
        ],
        notes: ["TPE rubber grip inserts."], url: "https://www.movexii.com/en/p/530-grip-top" },
      { key: "grip_top_side_indent", label: "530 Grip Top Side Indent", openArea: "0%", surface: "Closed / Grip / Side Indent", image: IMG.S530_GTSI,
        description: "530 Grip Top with side indents for improved sprocket engagement.",
        applications: ["Edge-driven systems", "Inclines with tracking"],
        beltData: [
          { material: "LFA", label: "LFA — Low Friction Acetal", pinMaterial: "PBT White", strengthNm: 18000, strengthLbsFt: 1233, massKgM2: 9.0, massLbFt2: 1.84, tempC: "-30 to +80", tempF: "-22 to 176" },
        ],
        notes: ["Side indents for sprocket engagement."], url: "https://www.movexii.com/en/p/530-grip-top-side-indent" },
      { key: "low_back_pressure", label: "530 Low Back Pressure", openArea: "0% (roller)", surface: "Roller Top / LBP", image: IMG.S530_LBP,
        description: "530 with integrated rollers for low backpressure accumulation at 1/2-inch pitch.",
        applications: ["Accumulation", "Fragile product conveying"],
        beltData: [
          { material: "LFA", label: "LFA — Low Friction Acetal", pinMaterial: "PBT White", strengthNm: 18000, strengthLbsFt: 1233, massKgM2: 10.0, massLbFt2: 2.05, tempC: "-30 to +80", tempF: "-22 to 176" },
        ],
        notes: ["Integrated rotating rollers."], url: "https://www.movexii.com/en/p/530-low-back-pressure" },
      { key: "pro_low_back_pressure", label: "530 PRO Low Back Pressure", openArea: "0% (roller)", surface: "Roller Top / PRO LBP", image: IMG.S530_PLBP,
        description: "Enhanced PRO LBP with larger rollers for heavier loads.",
        applications: ["Heavy product accumulation", "High-load LBP"],
        beltData: [
          { material: "LFA", label: "LFA — Low Friction Acetal", pinMaterial: "PBT White", strengthNm: 21500, strengthLbsFt: 1473, massKgM2: 11.5, massLbFt2: 2.36, tempC: "-30 to +80", tempF: "-22 to 176" },
        ],
        notes: ["Larger rollers vs. standard 530 LBP."], url: "https://www.movexii.com/en/p/530-pro-low-back-pressure" },
    ],
  },

  // ── 550 SERIES (19.05 mm / 3/4 inch pitch) ───────────────────────────────
  {
    id: "S550", name: "Series 550", beltType: "Straight-Running",
    pitch_mm: 19.05, pitch_in: 0.75, catalogPage: 176, image: IMG.S550_FT,
    description: "3/4-inch (19.05 mm) pitch modular belt for medium-duty applications. Available in flat top, one-track, flight top, and magnetic variants.",
    applications: ["Food processing", "General conveying", "Inclines (Flight Top)", "Magnetic product handling"],
    advantages: ["3/4-inch pitch medium-duty", "Flight Top for inclines", "Magnetic variant", "One Track Belt for tracking"],
    sprockets: [
      { name: "550 Sprocket 6T",  teeth: 6,  bore: "Square / Round", material: "Polyamide (PA)", notes: "6-tooth for 550 series.", image: null, url: "https://www.movexii.com/en/prodcat/sprockets-turning-disks" },
      { name: "550 Sprocket 8T",  teeth: 8,  bore: "Square / Round", material: "Polyamide (PA)", notes: "8-tooth for 550 series.", image: null, url: "https://www.movexii.com/en/prodcat/sprockets-turning-disks" },
      { name: "550 Sprocket 10T", teeth: 10, bore: "Square / Round", material: "Polyamide (PA)", notes: "10-tooth for 550 series.", image: null, url: "https://www.movexii.com/en/prodcat/sprockets-turning-disks" },
    ],
    accessories: S550_ACCESSORIES,
    techChartUrl: MOVEX_CATALOG_URL, catalogPageRef: "176",
    min_width_mm: 85, width_increment_mm: 85, fixation: "Snap-in Clip",
    styles: [
      { key: "flat_top", label: "550 Flat Top", openArea: "0%", surface: "Closed / Smooth", image: IMG.S550_FT,
        description: "3/4-inch pitch flat top belt. General-purpose medium-duty.",
        applications: ["Food processing", "General conveying"],
        beltData: [
          { material: "LFA", label: "LFA — Low Friction Acetal", pinMaterial: "PBT White", strengthNm: 18000, strengthLbsFt: 1233, massKgM2: 8.0, massLbFt2: 1.64, tempC: "-30 to +80",  tempF: "-22 to 176" },
          { material: "MX",  label: "MX — Performance PBT",     pinMaterial: "PBT White", strengthNm: 15000, strengthLbsFt: 1027, massKgM2: 8.0, massLbFt2: 1.64, tempC: "-40 to +130", tempF: "-40 to 266" },
          { material: "PP",  label: "PP — Polypropylene",       pinMaterial: "PBT White", strengthNm: 12000, strengthLbsFt:  822, massKgM2: 7.0, massLbFt2: 1.43, tempC: "-20 to +100", tempF: "-4 to 212" },
        ],
        notes: ["3/4-inch pitch, medium-duty."], url: "https://www.movexii.com/en/p/550-flat-top" },
      { key: "flat_top_one_track", label: "550 Flat Top One Track Belt", openArea: "0%", surface: "Closed / One Track", image: IMG.S550_FT1T,
        description: "550 Flat Top with central guide channel for improved tracking.",
        applications: ["Long conveyor runs", "Guided belt systems"],
        beltData: [
          { material: "LFA", label: "LFA — Low Friction Acetal", pinMaterial: "PBT White", strengthNm: 18000, strengthLbsFt: 1233, massKgM2: 8.0, massLbFt2: 1.64, tempC: "-30 to +80", tempF: "-22 to 176" },
        ],
        notes: ["Central guide channel."], url: "https://www.movexii.com/en/p/550-flat-top-one-track-belt" },
      { key: "flight_top", label: "550 Flight Top", openArea: "0%", surface: "Closed / Flight", image: IMG.S550_FLT,
        description: "550 with integrated molded flights for incline conveying.",
        applications: ["Incline conveying", "Product elevation"],
        beltData: [
          { material: "LFA", label: "LFA — Low Friction Acetal", pinMaterial: "PBT White", strengthNm: 15000, strengthLbsFt: 1027, massKgM2: 9.5, massLbFt2: 1.95, tempC: "-30 to +80", tempF: "-22 to 176" },
        ],
        notes: ["Integrated molded flights."], url: "https://www.movexii.com/en/p/550-flight-top" },
      { key: "magnetic", label: "550 Magnetic", openArea: "0%", surface: "Closed / Magnetic", image: IMG.S550_MAG,
        description: "550 with integrated magnets for ferromagnetic products.",
        applications: ["Ferromagnetic products", "Metal part handling"],
        beltData: [
          { material: "LFA", label: "LFA — Low Friction Acetal (with magnets)", pinMaterial: "PBT White", strengthNm: 15000, strengthLbsFt: 1027, massKgM2: 12.5, massLbFt2: 2.56, tempC: "-30 to +80", tempF: "-22 to 176" },
        ],
        notes: ["Integrated permanent magnets."], url: "https://www.movexii.com/en/p/550-magnetic" },
    ],
  },

  // ── 590 SERIES (19.05 mm — Blueline® food) ───────────────────────────────
  {
    id: "S590", name: "Series 590", beltType: "Straight-Running",
    pitch_mm: 19.05, pitch_in: 0.75, catalogPage: 185, image: IMG.S590_FT,
    description: "Blueline® food-grade modular belt at 3/4-inch pitch. Flat Top, One Track, and Transfer variants for food processing with enhanced hygiene.",
    applications: ["Food processing", "Meat & poultry", "Seafood processing", "Direct food contact"],
    advantages: ["Blueline® food-grade design", "3/4-inch pitch", "Flush Grid for drainage", "One Track version", "SS pins for hygiene"],
    sprockets: [
      { name: "590 Sprocket 6T",  teeth: 6,  bore: "Square / Round", material: "Polyamide (PA)", notes: "Standard for 590 series.", image: null, url: "https://www.movexii.com/en/prodcat/sprockets-turning-disks" },
      { name: "590 Sprocket 8T",  teeth: 8,  bore: "Square / Round", material: "Polyamide (PA)", notes: "8-tooth for 590 series.", image: null, url: "https://www.movexii.com/en/prodcat/sprockets-turning-disks" },
      { name: "590 Sprocket 10T", teeth: 10, bore: "Square / Round", material: "Polyamide (PA)", notes: "10-tooth for 590 series.", image: null, url: "https://www.movexii.com/en/prodcat/sprockets-turning-disks" },
    ],
    accessories: S590_ACCESSORIES,
    techChartUrl: MOVEX_CATALOG_URL, catalogPageRef: "185",
    min_width_mm: 76, width_increment_mm: 76, fixation: "Snap-in Clip",
    styles: [
      { key: "flat_top", label: "590 Flat Top", openArea: "0%", surface: "Closed / Smooth", image: IMG.S590_FT,
        description: "Blueline® food-grade flat top at 3/4-inch pitch for meat, poultry, and seafood.",
        applications: ["Meat & poultry", "Seafood", "Direct food contact"],
        beltData: [
          { material: "LFA", label: "LFA — Low Friction Acetal", pinMaterial: "SS", strengthNm: 18000, strengthLbsFt: 1233, massKgM2: 8.5, massLbFt2: 1.74, tempC: "-30 to +80", tempF: "-22 to 176" },
          { material: "PP",  label: "PP — Polypropylene",       pinMaterial: "SS", strengthNm: 14000, strengthLbsFt:  959, massKgM2: 7.5, massLbFt2: 1.54, tempC: "-20 to +100", tempF: "-4 to 212" },
        ],
        notes: ["Blueline® food-grade.", "SS pins for hygiene."], url: "https://www.movexii.com/en/p/590-flat-top" },
      { key: "flat_top_one_track", label: "590 Flat Top One Track Belt", openArea: "0%", surface: "Closed / One Track", image: IMG.S590_FT1T,
        description: "590 food-grade flat top with central guide channel for long-run food conveyors.",
        applications: ["Long food processing conveyors", "Guided hygienic belt systems"],
        beltData: [
          { material: "LFA", label: "LFA — Low Friction Acetal", pinMaterial: "SS", strengthNm: 18000, strengthLbsFt: 1233, massKgM2: 8.5, massLbFt2: 1.74, tempC: "-30 to +80", tempF: "-22 to 176" },
        ],
        notes: ["Central guide channel. Food-grade."], url: "https://www.movexii.com/en/p/590-flat-top-one-track-belt" },
      { key: "flat_top_transfer", label: "590 Flat Top Transfer", openArea: "0%", surface: "Closed / Transfer", image: IMG.S590_FTT,
        description: "590 food-grade transfer belt for tight dead-plate transfers.",
        applications: ["Food line dead-plate transfers"],
        beltData: [
          { material: "LFA", label: "LFA — Low Friction Acetal", pinMaterial: "SS", strengthNm: 15000, strengthLbsFt: 1027, massKgM2: 7.5, massLbFt2: 1.54, tempC: "-30 to +80", tempF: "-22 to 176" },
        ],
        notes: ["Transfer-optimized. Food-grade."], url: "https://www.movexii.com/en/p/590-flat-top-transfer" },
    ],
  },

  // ── BLUELINE® 7870 (8 mm pitch) ───────────────────────────────────────────
  {
    id: "S7870", name: "Series 7870 (Blueline®)", beltType: "Straight-Running",
    pitch_mm: 8, pitch_in: 0.315, catalogPage: 195,
    image: "https://movexps.publifarm.com/img/p/8/7/1/3/8713-large_default.jpg",
    description: "Blueline® 7870 — finest pitch modular belt at 8 mm. BluLub® self-lubricating POM. Pin Sphere® AUTLOCK for easy maintenance. For food, meat, poultry, and bakery applications requiring tight transfers.",
    applications: ["Ultra-tight transfers", "Food processing", "Bakery", "Meat & poultry", "Seafood"],
    advantages: ["Smallest pitch (8 mm) in Movex", "BluLub® POM reduces friction", "Pin Sphere® AUTLOCK", "Multiple surface styles", "3\" std / 1\" special width increments"],
    sprockets: [{ name: "7870 Sprocket (p.233)", teeth: "Contact Uniking", bore: "Contact Uniking", material: "Polyamide (PA)", notes: "Contact Uniking for tooth counts and bore specs.", image: null, url: "https://www.movexii.com/en/prodcat/sprockets-turning-disks" }],
    accessories: [
      { name: "7870 Nosebar — Narrow (Art. 22818)", type: "nosebar", image: null, notes: "Art-Nr. 22818.", url: "https://www.movexii.com/en/prodcat/modular-belts" },
      { name: "7870 Nosebar — Wide (Art. 22819)",   type: "nosebar", image: null, notes: "Art-Nr. 22819.", url: "https://www.movexii.com/en/prodcat/modular-belts" },
    ],
    techChartUrl: MOVEX_BLUELINE_URL, catalogPageRef: "195 / p.7 Blueline",
    min_width_mm: 76.2, width_increment_mm: 76.2, fixation: "Pin Sphere® AUTLOCK",
    styles: [
      { key: "flat_top", label: "7870 FT — Flat Top", openArea: "0%", surface: "Closed / Smooth", image: "https://movexps.publifarm.com/img/p/8/7/1/3/8713-large_default.jpg",
        description: "Ultra-fine 8 mm pitch flat top. BluLub® POM. White and Cyan color options.",
        applications: ["Ultra-tight transfers", "Food processing", "Bakery"],
        beltData: [
          { material: "POM", label: "POM — BluLub® (White)", pinMaterial: "PBT Pin", strengthNm: 3000, strengthLbsFt: 205, massKgM2: 5.8, massLbFt2: 1.19, tempC: "-40 to +80", tempF: "-40 to 176" },
          { material: "POM", label: "POM — BluLub® (Cyan)",  pinMaterial: "PBT Pin", strengthNm: 3000, strengthLbsFt: 205, massKgM2: 5.8, massLbFt2: 1.19, tempC: "-40 to +80", tempF: "-40 to 176" },
          { material: "LFA", label: "LFA — Low Friction Acetal", pinMaterial: "PBT Pin", strengthNm: 3000, strengthLbsFt: 205, massKgM2: 5.8, massLbFt2: 1.19, tempC: "-30 to +80", tempF: "-22 to 176" },
        ],
        notes: ["8 mm pitch — finest in Movex.", "Pin Sphere® AUTLOCK."], url: "https://www.movexii.com/en/prodcat/modular-belts" },
      { key: "flush_grid", label: "7870 FG — Flush Grid", openArea: "25%", surface: "Open Grid", image: null,
        description: "7870 Flush Grid with 25% open area for drainage at 8 mm pitch.",
        applications: ["Drainage", "Food processing", "Washing"],
        beltData: [{ material: "POM", label: "POM — BluLub®", pinMaterial: "PBT Pin", strengthNm: 3000, strengthLbsFt: 205, massKgM2: 5.1, massLbFt2: 1.04, tempC: "-40 to +80", tempF: "-40 to 176" }],
        notes: ["25% open area."], url: "https://www.movexii.com/en/prodcat/modular-belts" },
      { key: "diamond_top", label: "7870 DT — Diamond Top", openArea: "0%", surface: "Diamond Pattern", image: null,
        description: "Diamond-pattern top for grip without reducing transfer capability.",
        applications: ["Grip conveying", "Inclines"],
        beltData: [{ material: "POM", label: "POM — BluLub®", pinMaterial: "PBT Pin", strengthNm: 3000, strengthLbsFt: 205, massKgM2: 5.9, massLbFt2: 1.21, tempC: "-40 to +80", tempF: "-40 to 176" }],
        notes: ["Diamond top for grip."], url: "https://www.movexii.com/en/prodcat/modular-belts" },
      { key: "cone_top", label: "7870 CT — Cone Top", openArea: "0%", surface: "Cone / Raised Texture", image: null,
        description: "Cone top for incline grip. Raised cones provide superior product hold.",
        applications: ["Inclines", "Product orientation"],
        beltData: [{ material: "POM", label: "POM — BluLub®", pinMaterial: "PBT Pin", strengthNm: 3000, strengthLbsFt: 205, massKgM2: 6.0, massLbFt2: 1.23, tempC: "-40 to +80", tempF: "-40 to 176" }],
        notes: ["Raised cones for grip."], url: "https://www.movexii.com/en/prodcat/modular-belts" },
      { key: "non_slip", label: "7870 NS — Non-Slip", openArea: "0%", surface: "Non-Slip / Friction", image: null,
        description: "Non-slip surface for maximum friction grip on inclines.",
        applications: ["Maximum grip inclines", "Friction-critical applications"],
        beltData: [{ material: "POM", label: "POM — BluLub®", pinMaterial: "PBT Pin", strengthNm: 3000, strengthLbsFt: 205, massKgM2: 6.2, massLbFt2: 1.27, tempC: "-40 to +80", tempF: "-40 to 176" }],
        notes: ["Non-slip surface treatment."], url: "https://www.movexii.com/en/prodcat/modular-belts" },
    ],
  },

  // ── BLUELINE® 7220 (12.7 mm) ──────────────────────────────────────────────
  {
    id: "S7220", name: "Series 7220 (Blueline®)", beltType: "Straight-Running",
    pitch_mm: 12.7, pitch_in: 0.50, catalogPage: 200, image: null,
    description: "Blueline® 7220 — 1/2-inch pitch food-grade belt. Flat Top and Grip Top variants.",
    applications: ["Food processing", "Meat & poultry", "Bakery", "Packaging"],
    advantages: ["1/2-inch pitch food grade", "Flat Top and Grip Top variants", "Food-safe materials"],
    sprockets: [{ name: "7220 Sprocket (p.233)", teeth: "Contact Uniking", bore: "Contact Uniking", material: "Polyamide (PA)", notes: "Contact Uniking for details.", image: null, url: "https://www.movexii.com/en/prodcat/sprockets-turning-disks" }],
    accessories: [{ name: "7220 Nosebar", type: "nosebar", image: null, notes: "Contact Uniking for art. number.", url: "https://www.movexii.com/en/prodcat/modular-belts" }],
    techChartUrl: MOVEX_BLUELINE_URL, catalogPageRef: "200 / p.13 Blueline",
    width_increment_mm: 25.4, fixation: "Missing Data – Needs Mapping",
    styles: [
      { key: "flat_top", label: "7220 FT — Flat Top", openArea: "0%", surface: "Closed / Smooth", image: null,
        description: "Blueline® 7220 flat top at 1/2-inch pitch for direct food contact.",
        applications: ["Food processing", "Meat & poultry"],
        beltData: "Missing Data – Needs Mapping", notes: ["1/2-inch pitch Blueline® food grade."], url: "https://www.movexii.com/en/prodcat/modular-belts" },
      { key: "grip_top", label: "7220 GT — Grip Top", openArea: "0%", surface: "Closed / Grip", image: null,
        description: "Blueline® 7220 grip top for food processing inclines.",
        applications: ["Food processing inclines", "Grip conveying"],
        beltData: "Missing Data – Needs Mapping", notes: ["Grip top variant."], url: "https://www.movexii.com/en/prodcat/modular-belts" },
    ],
  },

  // ── BLUELINE® 7233 (12.7 mm flush grid) ──────────────────────────────────
  {
    id: "S7233", name: "Series 7233 (Blueline®)", beltType: "Straight-Running",
    pitch_mm: 12.7, pitch_in: 0.50, catalogPage: 203, image: null,
    description: "Blueline® 7233 — 1/2-inch pitch flush grid for drainage-critical food processing.",
    applications: ["Drainage-critical food processing", "Washing", "Seafood processing"],
    advantages: ["Flush grid for maximum drainage", "Food-grade", "Grip Top variant for wet inclines"],
    sprockets: [{ name: "7233 Sprocket (p.233)", teeth: "Contact Uniking", bore: "Contact Uniking", material: "Polyamide (PA)", notes: "Contact Uniking for details.", image: null, url: "https://www.movexii.com/en/prodcat/sprockets-turning-disks" }],
    accessories: [{ name: "7233 Nosebar", type: "nosebar", image: null, notes: "Nosebar for 7233 series.", url: "https://www.movexii.com/en/prodcat/modular-belts" }],
    techChartUrl: MOVEX_BLUELINE_URL, catalogPageRef: "203 / p.16 Blueline",
    width_increment_mm: 25.4, fixation: "Missing Data – Needs Mapping",
    styles: [
      { key: "flush_grid", label: "7233 FG — Flush Grid", openArea: "~40%", surface: "Open Grid", image: null,
        description: "High open area for rapid product drainage.", applications: ["Washing/rinsing", "Seafood processing"],
        beltData: "Missing Data – Needs Mapping", notes: ["~40% open area."], url: "https://www.movexii.com/en/prodcat/modular-belts" },
      { key: "flush_grid_grip_top", label: "7233 FG GT — Flush Grid Grip Top", openArea: "~40%", surface: "Open Grid / Grip", image: null,
        description: "Flush grid with grip top for drainage + grip on wet inclines.", applications: ["Wet inclines with drainage"],
        beltData: "Missing Data – Needs Mapping", notes: ["Flush grid + grip top."], url: "https://www.movexii.com/en/prodcat/modular-belts" },
    ],
  },

  // ── BLUELINE® 7234 (12.7 mm nub top) ─────────────────────────────────────
  {
    id: "S7234", name: "Series 7234 (Blueline®)", beltType: "Straight-Running",
    pitch_mm: 12.7, pitch_in: 0.50, catalogPage: 206, image: null,
    description: "Blueline® 7234 — 1/2-inch pitch nub top for product release in food processing.",
    applications: ["Sticky food products", "Cheese handling", "Meat processing"],
    advantages: ["Nub top for product release", "Reduced adhesion area", "1/2-inch pitch food grade"],
    sprockets: [{ name: "7234 Sprocket (p.233)", teeth: "Contact Uniking", bore: "Contact Uniking", material: "Polyamide (PA)", notes: "Contact Uniking for details.", image: null, url: "https://www.movexii.com/en/prodcat/sprockets-turning-disks" }],
    accessories: [{ name: "7234 Nosebar", type: "nosebar", image: null, notes: "Nosebar for 7234 series.", url: "https://www.movexii.com/en/prodcat/modular-belts" }],
    techChartUrl: MOVEX_BLUELINE_URL, catalogPageRef: "206 / p.19 Blueline",
    width_increment_mm: 25.4, fixation: "Missing Data – Needs Mapping",
    styles: [
      { key: "nub_top", label: "7234 NT — Nub Top", openArea: "0% (reduced contact)", surface: "Nub / Reduced Contact", image: null,
        description: "Raised nubs reduce surface contact for sticky food products.", applications: ["Sticky products", "Cheese handling"],
        beltData: "Missing Data – Needs Mapping", notes: ["Raised nubs reduce adhesion."], url: "https://www.movexii.com/en/prodcat/modular-belts" },
    ],
  },

  // ── BLUELINE® 7510 (25.4 mm / 1 inch) ────────────────────────────────────
  {
    id: "S7510", name: "Series 7510 (Blueline®)", beltType: "Straight-Running",
    pitch_mm: 25.4, pitch_in: 1.0, catalogPage: 208, image: null,
    description: "Blueline® 7510 — 1-inch pitch food-grade belt. Flat Top, Nub Top, Diamond Top, Metal Top variants.",
    applications: ["Bakery", "Food processing", "Meat & poultry", "Seafood"],
    advantages: ["1-inch pitch food-grade", "Multiple surface styles", "Nub Top for product release", "Diamond Top for grip"],
    sprockets: [{ name: "7510 Sprocket (p.233)", teeth: "Contact Uniking", bore: "Contact Uniking", material: "Polyamide (PA)", notes: "Contact Uniking for details.", image: null, url: "https://www.movexii.com/en/prodcat/sprockets-turning-disks" }],
    accessories: [
      { name: "7510 Nosebar",        type: "nosebar",  image: null, notes: "Contact Uniking for dimensions.", url: "https://www.movexii.com/en/prodcat/modular-belts" },
      { name: "7510 Straight Flight",type: "flight",   image: null, notes: "Straight flight for 7510.", url: "https://www.movexii.com/en/prodcat/accessories" },
      { name: "7510 Sidewall",       type: "sideguard",image: null, notes: "Sidewall for 7510 series.", url: "https://www.movexii.com/en/prodcat/accessories" },
    ],
    techChartUrl: MOVEX_BLUELINE_URL, catalogPageRef: "208 / p.25 Blueline",
    width_increment_mm: 25.4, fixation: "Missing Data – Needs Mapping",
    styles: [
      { key: "flat_top",    label: "7510 FT — Flat Top",    openArea: "0%",                  surface: "Closed / Smooth",         image: null, description: "Blueline® 1-inch pitch flat top.", applications: ["Food processing", "Bakery"], beltData: "Missing Data – Needs Mapping", notes: ["1-inch pitch Blueline®."], url: "https://www.movexii.com/en/prodcat/modular-belts" },
      { key: "nub_top",     label: "7510 NT — Nub Top",     openArea: "0% (reduced contact)", surface: "Nub / Reduced Contact",   image: null, description: "Nub top for sticky food products.", applications: ["Sticky products", "Meat processing"], beltData: "Missing Data – Needs Mapping", notes: ["Raised nubs reduce adhesion."], url: "https://www.movexii.com/en/prodcat/modular-belts" },
      { key: "diamond_top", label: "7510 DT — Diamond Top", openArea: "0%",                  surface: "Diamond Pattern",          image: null, description: "Diamond top for grip conveying.", applications: ["Inclines", "Grip conveying"], beltData: "Missing Data – Needs Mapping", notes: ["Diamond pattern grip."], url: "https://www.movexii.com/en/prodcat/modular-belts" },
      { key: "metal_top",   label: "7510 MT — Metal Top",   openArea: "0%",                  surface: "Metal Top / Special",      image: null, description: "Metal top surface for special requirements.", applications: ["Special surface requirements"], beltData: "Missing Data – Needs Mapping", notes: ["Metal top surface."], url: "https://www.movexii.com/en/prodcat/modular-belts" },
    ],
  },

  // ── BLUELINE® 7520 (25.4 mm flush grid) ──────────────────────────────────
  {
    id: "S7520", name: "Series 7520 (Blueline®)", beltType: "Straight-Running",
    pitch_mm: 25.4, pitch_in: 1.0, catalogPage: 211, image: null,
    description: "Blueline® 7520 — 1-inch pitch flat top and flush grid food-grade belt.",
    applications: ["Food processing with drainage", "Washing", "Blanching", "Bakery"],
    advantages: ["1-inch pitch food-grade", "Flush Grid for drainage", "Flat Top variant"],
    sprockets: [{ name: "7520 Sprocket (p.233)", teeth: "Contact Uniking", bore: "Contact Uniking", material: "Polyamide (PA)", notes: "Contact Uniking for details.", image: null, url: "https://www.movexii.com/en/prodcat/sprockets-turning-disks" }],
    accessories: [
      { name: "7520 Nosebar",        type: "nosebar",  image: null, notes: "Contact Uniking.", url: "https://www.movexii.com/en/prodcat/modular-belts" },
      { name: "7520 Straight Flight",type: "flight",   image: null, notes: "Straight flight for 7520.", url: "https://www.movexii.com/en/prodcat/accessories" },
    ],
    techChartUrl: MOVEX_BLUELINE_URL, catalogPageRef: "211 / p.31 Blueline",
    width_increment_mm: 25.4, fixation: "Missing Data – Needs Mapping",
    styles: [
      { key: "flat_top",   label: "7520 FT — Flat Top",   openArea: "0%",    surface: "Closed / Smooth", image: null, description: "Blueline® 7520 flat top at 1-inch pitch.", applications: ["Food processing", "Bakery"], beltData: "Missing Data – Needs Mapping", notes: ["1-inch pitch Blueline®."], url: "https://www.movexii.com/en/prodcat/modular-belts" },
      { key: "flush_grid", label: "7520 FG — Flush Grid", openArea: "~40%",  surface: "Open Grid",       image: null, description: "Flush grid for drainage at 1-inch pitch.", applications: ["Drainage", "Washing", "Blanching"], beltData: "Missing Data – Needs Mapping", notes: ["~40% open area."], url: "https://www.movexii.com/en/prodcat/modular-belts" },
    ],
  },

  // ── BLUELINE® 7010 (50.8 mm / 2 inch) ────────────────────────────────────
  {
    id: "S7010", name: "Series 7010 (Blueline®)", beltType: "Straight-Running",
    pitch_mm: 50.8, pitch_in: 2.0, catalogPage: 213, image: null,
    description: "Blueline® 7010 — 2-inch pitch heavy-duty food-grade belt. Flat Top, Cone Top, Nub Top, Perforated Top.",
    applications: ["Heavy food processing", "Meat & poultry", "Bulk conveying"],
    advantages: ["2-inch pitch heavy duty", "Multiple surface styles", "Cone Top for grip", "Nub Top for release"],
    sprockets: [{ name: "7010 Sprocket (p.233)", teeth: "Contact Uniking", bore: "Contact Uniking", material: "Polyamide (PA)", notes: "Contact Uniking for details.", image: null, url: "https://www.movexii.com/en/prodcat/sprockets-turning-disks" }],
    accessories: [
      { name: "7010 Nosebar",             type: "nosebar",  image: null, notes: "Contact Uniking.", url: "https://www.movexii.com/en/prodcat/modular-belts" },
      { name: "7010 Straight Flight",     type: "flight",   image: null, notes: "Straight flight for 7010.", url: "https://www.movexii.com/en/prodcat/accessories" },
      { name: "7010 Heavy-Duty Sidewall", type: "sideguard",image: null, notes: "HD sidewall for 7010.", url: "https://www.movexii.com/en/prodcat/accessories" },
    ],
    techChartUrl: MOVEX_BLUELINE_URL, catalogPageRef: "213 / p.35 Blueline",
    width_increment_mm: 25.4, fixation: "Missing Data – Needs Mapping",
    styles: [
      { key: "flat_top",       label: "7010 FT — Flat Top",       openArea: "0%",    surface: "Closed / Smooth",    image: null, description: "2-inch pitch flat top for heavy food processing.", applications: ["Heavy food processing", "Meat & poultry"], beltData: "Missing Data – Needs Mapping", notes: ["2-inch pitch Blueline® heavy duty."], url: "https://www.movexii.com/en/prodcat/modular-belts" },
      { key: "cone_top",       label: "7010 CT — Cone Top",       openArea: "0%",    surface: "Cone / Grip",        image: null, description: "2-inch pitch cone top for heavy incline conveying.", applications: ["Heavy inclines", "Meat processing inclines"], beltData: "Missing Data – Needs Mapping", notes: ["Cone top for grip."], url: "https://www.movexii.com/en/prodcat/modular-belts" },
      { key: "nub_top",        label: "7010 NT — Nub Top",        openArea: "0%",    surface: "Nub / Reduced Contact",image: null,description: "2-inch pitch nub top for product release.", applications: ["Sticky heavy products", "Meat processing"], beltData: "Missing Data – Needs Mapping", notes: ["Nub top for product release."], url: "https://www.movexii.com/en/prodcat/modular-belts" },
      { key: "perforated_top", label: "7010 PT — Perforated Top", openArea: "~20%", surface: "Perforated",          image: null, description: "Perforated top for partial drainage.", applications: ["Partial drainage", "Washing"], beltData: "Missing Data – Needs Mapping", notes: ["~20% open area."], url: "https://www.movexii.com/en/prodcat/modular-belts" },
    ],
  },

  // ── BLUELINE® 7540 (25.4 mm sideflexing) ─────────────────────────────────
  {
    id: "S7540", name: "Series 7540 (Blueline® Sideflexing)", beltType: "Sideflexing",
    pitch_mm: 25.4, pitch_in: 1.0, catalogPage: 215, image: null,
    description: "Blueline® 7540 — 1-inch pitch sideflexing belt for horizontal curves in food processing. Collapse factor 2.2. TAB version available.",
    applications: ["Horizontal curves", "Food processing curves", "Multi-directional conveying"],
    advantages: ["Sideflexing for horizontal curves", "Collapse factor 2.2", "TAB version available", "Food-grade design"],
    sprockets: [{ name: "7540 Sprocket (p.233)", teeth: "Contact Uniking", bore: "Contact Uniking", material: "Polyamide (PA)", notes: "Contact Uniking for details.", image: null, url: "https://www.movexii.com/en/prodcat/sprockets-turning-disks" }],
    accessories: [
      { name: "7540 Straight Track", type: "track",    image: null, notes: "Straight track for 7540 series.", url: "https://www.movexii.com/en/prodcat/curves-straight-tracks" },
      { name: "7540 Curved Track",   type: "track",    image: null, notes: "Fixed radius curved track.", url: "https://www.movexii.com/en/prodcat/curves-straight-tracks" },
      { name: "7540 Sideguard",      type: "sideguard",image: null, notes: "Sideguard for 7540 series.", url: "https://www.movexii.com/en/prodcat/accessories" },
    ],
    techChartUrl: MOVEX_BLUELINE_URL, catalogPageRef: "215 / p.41 Blueline",
    collapse_factor: 2.2, fixation: "Missing Data – Needs Mapping",
    styles: [
      { key: "r_flush_grid",     label: "7540 R-FG — Sideflexing Flush Grid",      openArea: "~35%", surface: "Open Grid / Sideflexing",       image: null, description: "Sideflexing flush grid for horizontal curve conveying with drainage.", applications: ["Horizontal curve conveying", "Curved drainage"], beltData: "Missing Data – Needs Mapping", notes: ["Collapse factor 2.2."], url: "https://www.movexii.com/en/prodcat/modular-belts" },
      { key: "tab_r_flush_grid", label: "7540 TAB R-FG — TAB Sideflexing Flush Grid", openArea: "~35%", surface: "Open Grid / Sideflexing / TAB", image: null, description: "TAB version for side tab drive systems.", applications: ["TAB drive sideflexing curves"], beltData: "Missing Data – Needs Mapping", notes: ["TAB drive version."], url: "https://www.movexii.com/en/prodcat/modular-belts" },
    ],
  },

  // ── BLUELINE® 7544 (25.4 mm tight-radius sideflexing) ────────────────────
  {
    id: "S7544", name: "Series 7544 (Blueline® Sideflexing)", beltType: "Sideflexing",
    pitch_mm: 25.4, pitch_in: 1.0, catalogPage: 216, image: null,
    description: "Blueline® 7544 — 1-inch pitch tighter-radius sideflexing belt. Collapse factor 1.6. Flush Grid and Grip Top variants.",
    applications: ["Tight horizontal curves", "Food processing tight curves", "Grip on curves"],
    advantages: ["Tighter collapse factor 1.6 vs 7540", "Flush Grid for drainage on curves", "Grip Top for inclined curves"],
    sprockets: [{ name: "7544 Sprocket (p.233)", teeth: "Contact Uniking", bore: "Contact Uniking", material: "Polyamide (PA)", notes: "Contact Uniking for details.", image: null, url: "https://www.movexii.com/en/prodcat/sprockets-turning-disks" }],
    accessories: [
      { name: "7544 Straight Track",           type: "track", image: null, notes: "Straight track for 7544.", url: "https://www.movexii.com/en/prodcat/curves-straight-tracks" },
      { name: "7544 Curved Track (Tight Radius)", type: "track", image: null, notes: "Tighter radius track. Collapse factor 1.6.", url: "https://www.movexii.com/en/prodcat/curves-straight-tracks" },
    ],
    techChartUrl: MOVEX_BLUELINE_URL, catalogPageRef: "216 / p.45 Blueline",
    collapse_factor: 1.6, fixation: "Missing Data – Needs Mapping",
    styles: [
      { key: "tr_flush_grid", label: "7544 TR-FG — Tight Radius Flush Grid", openArea: "~35%", surface: "Open Grid / Tight Radius", image: null, description: "Tight-radius sideflexing flush grid. Collapse factor 1.6.", applications: ["Tight horizontal curves", "Curved drainage"], beltData: "Missing Data – Needs Mapping", notes: ["Tighter radius than 7540."], url: "https://www.movexii.com/en/prodcat/modular-belts" },
      { key: "tr_grip_top",   label: "7544 TR-GT — Tight Radius Grip Top",   openArea: "0%",    surface: "Closed / Grip / Tight Radius", image: null, description: "Tight-radius sideflexing grip top for grip on curves.", applications: ["Grip on tight curves", "Inclined curve conveying"], beltData: "Missing Data – Needs Mapping", notes: ["Grip top + tight radius."], url: "https://www.movexii.com/en/prodcat/modular-belts" },
    ],
  },

  // ── ZERO CONTACT (Blueline® special) ──────────────────────────────────────
  {
    id: "S_ZERO_CONTACT", name: "Zero Contact (Blueline®)", beltType: "Straight-Running / Special",
    pitch_mm: null, pitch_in: null, catalogPage: 217, image: null,
    description: "Blueline® Zero Contact belt — eliminates direct belt-to-product contact for ultra-hygienic handling of delicate food items. Standard and PRO variants.",
    applications: ["Ultra-hygienic food processing", "Delicate product handling", "No-contact conveying"],
    advantages: ["Zero product-to-belt contact", "Ultra-hygienic design", "PRO version for demanding applications"],
    sprockets: [{ name: "Zero Contact Sprocket", teeth: "Contact Uniking", bore: "Contact Uniking", material: "Polyamide (PA)", notes: "Contact Uniking for details.", image: null, url: "https://www.movexii.com/en/prodcat/sprockets-turning-disks" }],
    accessories: [{ name: "Zero Contact Track System", type: "track", image: null, notes: "Special track for Zero Contact series.", url: "https://www.movexii.com/en/prodcat/accessories" }],
    techChartUrl: MOVEX_BLUELINE_URL, catalogPageRef: "217 / p.49 Blueline",
    fixation: "Contact Uniking",
    styles: [
      { key: "zero_contact",     label: "Zero Contact",     openArea: "N/A", surface: "Zero Contact / Special",     image: null, description: "Eliminates belt-to-product contact for ultra-hygienic food processing.", applications: ["Ultra-hygienic handling", "No-contact food conveying"],     beltData: "Missing Data – Needs Mapping", notes: ["Zero product-to-belt contact."], url: "https://www.movexii.com/en/prodcat/modular-belts" },
      { key: "zero_contact_pro", label: "Zero Contact PRO", openArea: "N/A", surface: "Zero Contact PRO / Special", image: null, description: "PRO version for the most demanding no-contact food processing.", applications: ["Demanding no-contact food processing"], beltData: "Missing Data – Needs Mapping", notes: ["Enhanced PRO design."], url: "https://www.movexii.com/en/prodcat/modular-belts" },
    ],
  },
];

// ── Groupings ─────────────────────────────────────────────────────────────────
export const MOVEX_STRAIGHT_SERIES   = MOVEX_SERIES.filter(s => s.beltType === "Straight-Running" || s.beltType === "Straight-Running / Special");
export const MOVEX_SIDEFLEXING_SERIES = MOVEX_SERIES.filter(s => s.beltType === "Sideflexing");

export const MOVEX_INDUSTRIES = [
  "Food Processing", "Meat & Poultry", "Seafood Processing", "Bakery & Snack",
  "Dairy", "Beverage Packaging", "Packaging Lines", "Automotive", "Logistics",
  "General Industrial", "Agriculture", "Pharmaceutical", "Other",
];