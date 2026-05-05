// ─────────────────────────────────────────────────────────────────────────────
// System Plast Modular Belts & Sprockets — Smart Guide Catalog Data
// Source: System Plast Smart Guide (www.systemplastsmartguide.com) Rev. 005
//         Regal Rexnord / System Plast Smart Guide pages 30010a–30728a
// Product images sourced from ERIKS distributor CDN (ERIKS / HLR-System)
//         eriksdigitalcdn.azureedge.net — official Regal Rexnord / System Plast product photos
// ─────────────────────────────────────────────────────────────────────────────

// ── Image CDN base ────────────────────────────────────────────────────────────
const ERIKS = "https://eriksdigitalcdn.azureedge.net/shop/detail/hlr-system/system%20plast/internet%20images/";

export const SP_SMART_GUIDE_URL = "https://www.systemplastsmartguide.com/INT/Smart-Guide/";
export const SP_LOGO = "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e6/Regal_Rexnord_Logo.svg/320px-Regal_Rexnord_Logo.svg.png";
export const SP_WEBSITE = "https://www.systemplastsmartguide.com";

// ── Material Reference ────────────────────────────────────────────────────────
export const SP_MATERIALS = {
  NGE:    { label: "NGE — New Generation Engineered (Grey/Blue)", abbr: "NGE",   color: "Grey/Blue",  tempC: "-10 to +85",  tempF: "14 to 185",   notes: "NGevo: longer wear life, lower friction, better chemical resistance than acetal. FDA/EC 1935/2004. Replaces LFG in new designs." },
  LFG:    { label: "LFG — Low Friction Acetal (Grey)",           abbr: "LFG",   color: "Grey",        tempC: "-10 to +85",  tempF: "14 to 185",   notes: "Standard low-friction acetal resin. FDA/EC 1935/2004 food contact. General purpose." },
  LFB:    { label: "LFB — Low Friction Acetal (Blue)",           abbr: "LFB",   color: "Blue",        tempC: "-10 to +85",  tempF: "14 to 185",   notes: "Blue-coloured LFA for visual traceability. Same spec as LFG. FDA compliant." },
  PPG:    { label: "PPG — Polypropylene (Dark Grey)",            abbr: "PPG",   color: "Dark Grey",   tempC: "-10 to +100", tempF: "14 to 212",   notes: "Polypropylene — chemical resistant, light, cost-effective. Standard for 2500RR series." },
  PPLG:   { label: "PPLG — Polypropylene (Light Grey)",         abbr: "PPLG",  color: "Light Grey",  tempC: "-10 to +100", tempF: "14 to 212",   notes: "Light grey polypropylene variant. Available for 2508/2630 series." },
  POMAS:  { label: "POM-AS — Anti-Static Acetal (Black)",       abbr: "POM-AS", color: "Black",      tempC: "-10 to +85",  tempF: "14 to 185",   notes: "Anti-static acetal. For ESD-sensitive environments. Available on 2508/2630." },
  PPFREC: { label: "PP-FR-EC — Flame Retardant Conductive PP (Black)", abbr: "PP-FR-EC", color: "Black", tempC: "-10 to +80", tempF: "14 to 176", notes: "Flame retardant, electrically conductive polypropylene. For fire-safe and ESD environments." },
};

// ── Pin Material Reference ───────────────────────────────────────────────────
export const SP_PIN_MATERIALS = {
  PBT_WHITE:  { label: "PBT (White)", notes: "Standard pin material across most series." },
  PBT_WBLUE:  { label: "PBT (Water Blue)", notes: "Used on 2190 series." },
  PP:         { label: "Polypropylene", notes: "Used on 2500RR series." },
  SS304:      { label: "Stainless Steel AISI 304", notes: "Used on LBP roller shaft (2120-LBP). Optional on 2508/2630." },
  SS_MART:    { label: "Martensitic Stainless Steel", notes: "Used on magnetic chainbelt series (2260, 2251M)." },
};

// ── Sprocket Data ─────────────────────────────────────────────────────────────
const SPROCKETS_2120 = [
  { name: "2120 Molded Drive Sprocket — Split Fixed (Round Bore)", teeth: "24, 28, 36", bore: "Round: Ø30, Ø35, Ø40 mm", material: "Reinforced Polyamide (Black)", notes: "Fixed bore. Use for belts ≤680 mm wide and temp diff ≤30°C. Add 'P' suffix for floating version.", smartGuide: "30160a", url: "https://www.systemplastsmartguide.com/int/Smart-Guide/30160A/" },
  { name: "2120 Molded Return Sprocket — Split (Round Bore)", teeth: "24, 28, 36", bore: "Round: Ø30, Ø35, Ø40 mm", material: "Reinforced Polyamide (Black)", notes: "Split return sprocket. Same bore options as drive. Floating version available.", smartGuide: "30160a", url: "https://www.systemplastsmartguide.com/int/Smart-Guide/30160A/" },
  { name: "2120 Molded Drive Sprocket — Square Bore One Piece Floating", teeth: "24", bore: "Square: 30×30, 40×40 mm", material: "Reinforced Polyamide (Grey)", notes: "Floating square bore. NOT SUITABLE for 2122 FG. One-piece design.", smartGuide: "30160a", url: "https://www.systemplastsmartguide.com/int/Smart-Guide/30160A/" },
];

const SPROCKETS_2250 = [
  { name: "2250 Molded Drive Sprocket — Split Fixed (Round Bore)", teeth: "14, 16, 18, 20", bore: "Round: Ø30, Ø35, Ø40 mm", material: "Reinforced Polyamide (Black)", notes: "Fixed bore for belts ≤680 mm and temp diff ≤30°C. Floating version: add 'P' suffix.", smartGuide: "30395a", url: "https://www.systemplastsmartguide.com/int/Smart-Guide/30395A/" },
  { name: "2250 Molded Return Sprocket — Split (Round Bore)", teeth: "14, 16, 18, 20", bore: "Round: Ø30, Ø35, Ø40 mm", material: "Reinforced Polyamide (Black)", notes: "Split return sprocket. Cannot be used for 2253RTC and 2253FT.", smartGuide: "30395a", url: "https://www.systemplastsmartguide.com/int/Smart-Guide/30395A/" },
  { name: "2250 Molded Drive Sprocket — Square Bore Split Floating", teeth: "14, 16, 18, 20", bore: "Square: 30×30, 40×40 mm", material: "Reinforced Polyamide (Black)", notes: "Floating square bore. Split design for easy replacement. Cannot be used for 2253 series.", smartGuide: "30395a", url: "https://www.systemplastsmartguide.com/int/Smart-Guide/30395A/" },
  { name: "2253 Molded Drive Sprocket — Square Bore One Piece Floating", teeth: "12, 15, 18", bore: "Square: 40×40, 60×60 mm", material: "Reinforced Polyamide (Grey)", notes: "Optimum choice for 2253RTC and 2253FT. Can also be used for 2250 series.", smartGuide: "30395a", url: "https://www.systemplastsmartguide.com/int/Smart-Guide/30395A/" },
];

const SPROCKETS_2500 = [
  { name: "2500RR Drive/Return Sprocket", teeth: "Missing Data – Needs Mapping", bore: "Missing Data – Needs Mapping", material: "Reinforced Polyamide", notes: "Contact Uniking for 2500RR sprocket details. Refer to Smart Guide page 30615a.", smartGuide: "30615a", url: "https://www.systemplastsmartguide.com/int/Smart-Guide/30615A/" },
];

const SPROCKETS_2508_2630 = [
  { name: "2508/2630 Drive/Return Sprocket", teeth: "Missing Data – Needs Mapping", bore: "Missing Data – Needs Mapping", material: "Reinforced Polyamide", notes: "Contact Uniking for 2508/2630 sprocket details. Refer to Smart Guide pages 30640a / 30650a.", smartGuide: "30640a", url: "https://www.systemplastsmartguide.com/int/Smart-Guide/30640A/" },
];

const SPROCKETS_2190 = [
  { name: "2190 Drive/Return Sprocket", teeth: "Missing Data – Needs Mapping", bore: "Missing Data – Needs Mapping", material: "Reinforced Polyamide", notes: "Contact Uniking for 2190 sprocket details. Refer to Smart Guide page 30235a.", smartGuide: "30235a", url: "https://www.systemplastsmartguide.com/int/Smart-Guide/30235A/" },
];

// ── Accessories ───────────────────────────────────────────────────────────────
const ACC_2120 = [
  { name: "2120 Guide Bar (GB) Belt Version", type: "special", notes: "Guide bar every pitch for tight transfers. Helps maintain belt alignment at nosebar. Smart Guide 30120a.", url: "https://www.systemplastsmartguide.com/int/Smart-Guide/30120A/" },
  { name: "2120 LBP Roller Guide", type: "accessory", notes: "Roller guide for use with 2120-LBP belt. Stainless steel AISI 304 roller shaft. Smart Guide 30110a.", url: "https://www.systemplastsmartguide.com/int/Smart-Guide/30110A/" },
  { name: "2120 Set Collar", type: "accessory", notes: "Set collar to keep sprockets in position on shaft. See 30160a.", url: "https://www.systemplastsmartguide.com/int/Smart-Guide/30160A/" },
];

const ACC_2250 = [
  { name: "2250 Flights", type: "flight", notes: "Flights for 2250 series incline conveying. Smart Guide 30365a.", url: "https://www.systemplastsmartguide.com/int/Smart-Guide/30365A/" },
  { name: "2250 Set Collar", type: "accessory", notes: "Set collar to keep sprockets in position. See 30395a.", url: "https://www.systemplastsmartguide.com/int/Smart-Guide/30395A/" },
];

const ACC_2500 = [
  { name: "2500RR Positioner Version", type: "accessory", notes: "2500RR also available with positioners. Smart Guide 30615a.", url: "https://www.systemplastsmartguide.com/int/Smart-Guide/30615A/" },
  { name: "2500RR Combs", type: "accessory", notes: "Combs available for 2500RR. Smart Guide 30615a.", url: "https://www.systemplastsmartguide.com/int/Smart-Guide/30615A/" },
];

// ── Series Definitions ────────────────────────────────────────────────────────
export const SP_SERIES = [

  // ── 2080 SERIES — 8 mm pitch ─────────────────────────────────────────────
  {
    id: "S2080",
    name: "Series 2080",
    beltType: "Straight-Running",
    pitch_mm: 8,
    pitch_in: 0.315,
    thickness_mm: 6,
    thickness_in: 0.24,
    catalogPage: "30025a",
    image: ERIKS + "00195tp.jpg", // closest visual match: 1/2" flat top (same modular style)
    description: "Series 2080 — ultra-fine 8 mm (1/3-inch) pitch modular belt. Designed for tight transfers and applications requiring minimal pitch for smooth, quiet conveying. Imperial module version.",
    applications: ["Ultra-tight transfers", "Small part conveying", "Packaging lines", "Beverage handling"],
    advantages: ["Finest pitch (8 mm) in System Plast range", "Imperial module version", "Tight transfer over narrow nosebars", "Quiet operation"],
    sprockets: [{ name: "2080 Sprocket", teeth: "Missing Data – Needs Mapping", bore: "Missing Data – Needs Mapping", material: "Reinforced Polyamide", notes: "Contact Uniking for 2080 sprocket details. Smart Guide 30027a.", smartGuide: "30027a", url: SP_SMART_GUIDE_URL }],
    accessories: [],
    techChartUrl: SP_SMART_GUIDE_URL + "30025A/",
    smartGuideRef: "30025a",
    min_width_mm: null, width_increment_mm: null, fixation: "Missing Data – Needs Mapping",
    styles: [
      {
        key: "flat_top", label: "2080 Flat Top", openArea: "0%", surface: "Closed / Smooth",
        image: ERIKS + "00195tp.jpg",
        description: "8 mm pitch flat top. Imperial module. Ultra-tight transfer capability.",
        applications: ["Ultra-tight transfers", "Small parts", "Packaging"],
        beltData: "Missing Data – Needs Mapping",
        notes: ["8 mm (1/3-inch) pitch.", "Imperial module.", "Smart Guide 30025a."],
        url: SP_SMART_GUIDE_URL + "30025A/",
      },
    ],
  },

  // ── 2120 SERIES — 12.7 mm pitch, 8.7 mm height, 85 mm metric modules ──────
  {
    id: "S2120",
    name: "Series 2120",
    beltType: "Straight-Running",
    pitch_mm: 12.7,
    pitch_in: 0.5,
    thickness_mm: 8.7,
    thickness_in: 0.34,
    catalogPage: "30050a",
    image: ERIKS + "00195tp.jpg",
    description: "Series 2120 — the most widely-used modular belt in the System Plast range. 1/2-inch (12.7 mm) pitch, 8.7 mm height, 85 mm metric modules. Available in Flat Top, Flush Grid, Rubber Insert, Guide Bar, and Low Back Pressure versions. NGE and LFG/LFB materials.",
    applications: ["General conveying", "Food processing", "Beverage packaging", "Accumulation", "Incline/decline", "Sorting", "Packaging lines", "Drainage applications"],
    advantages: ["Industry-standard 1/2-inch pitch", "Widest style selection in range", "NGE new generation material for longer wear life", "Guide bar version for tight transfers", "LBP roller version for accumulation", "Molded-to-width versions available", "85 mm width increment (metric)"],
    sprockets: SPROCKETS_2120,
    accessories: ACC_2120,
    techChartUrl: SP_SMART_GUIDE_URL + "30050A/",
    smartGuideRef: "30050a / 30070a / 30100a / 30110a / 30120a",
    min_width_mm: 85, min_width_in: 3.35,
    width_increment_mm: 85, width_increment_in: 3.35,
    fixation: "Snap-in Clip / Pin",
    backflex_radius_mm: 10, backflex_radius_in: 0.39,
    pin_material: "PBT (White)",
    styles: [
      {
        key: "flat_top", label: "2120 Flat Top (FT)", openArea: "0%", surface: "Closed / Smooth",
        image: ERIKS + "00195tp.jpg",
        description: "Smooth flat top. Primary belt for general conveying and food processing. Backflex radius 10 mm. Available in NGE (grey/blue), LFG (grey), LFB (blue).",
        applications: ["General conveying", "Food processing", "Beverage packaging", "Packaging lines"],
        beltData: [
          { material: "LFG", label: "LFG — Low Friction Acetal (Grey)", pinMaterial: "PBT (White)", strengthNm: 20000, strengthLbsFt: 1400, massKgM2: 8.6, massLbFt2: 1.75, tempC: "-10 to +85", tempF: "14 to 185" },
          { material: "LFB", label: "LFB — Low Friction Acetal (Blue)", pinMaterial: "PBT (White)", strengthNm: 20000, strengthLbsFt: 1400, massKgM2: 8.6, massLbFt2: 1.75, tempC: "-10 to +85", tempF: "14 to 185" },
          { material: "NGE", label: "NGE — New Generation Engineered (Grey/Blue)", pinMaterial: "PBT (White)", strengthNm: 20000, strengthLbsFt: 1400, massKgM2: 8.6, massLbFt2: 1.75, tempC: "-10 to +85", tempF: "14 to 185" },
        ],
        notes: ["Backflex radius: 10 mm (0.39 in).", "Max load: 20,000 N/m (1,400 lbs/ft) for LFG/LFB.", "Width increment: 85 mm.", "Also available with 76.2 mm (3 in) modules."],
        url: SP_SMART_GUIDE_URL + "30050A/",
      },
      {
        key: "flush_grid", label: "2120 Flush Grid (FG)", openArea: "21%", surface: "Open Grid",
        image: ERIKS + "00196tp.jpg",
        description: "21% open area flush grid for drainage, washing, and airflow. Same 85 mm module width. Backflex radius 10 mm.",
        applications: ["Drainage", "Washing/rinsing", "Cooling", "Airflow applications"],
        beltData: [
          { material: "LFG", label: "LFG — Low Friction Acetal (Grey)", pinMaterial: "PBT (White)", strengthNm: 20000, strengthLbsFt: 1400, massKgM2: 7.4, massLbFt2: 1.51, tempC: "-10 to +85", tempF: "14 to 185" },
          { material: "LFB", label: "LFB — Low Friction Acetal (Blue)", pinMaterial: "PBT (White)", strengthNm: 20000, strengthLbsFt: 1400, massKgM2: 7.4, massLbFt2: 1.51, tempC: "-10 to +85", tempF: "14 to 185" },
          { material: "NGE", label: "NGE — New Generation Engineered (Grey/Blue)", pinMaterial: "PBT (White)", strengthNm: 20000, strengthLbsFt: 1400, massKgM2: 7.4, massLbFt2: 1.51, tempC: "-10 to +85", tempF: "14 to 185" },
        ],
        notes: ["Open surface: 21%.", "Backflex radius: 10 mm (0.39 in).", "Also available with 100 mm modules (Series 2122)."],
        url: SP_SMART_GUIDE_URL + "30070A/",
      },
      {
        key: "rubber_insert_vg", label: "2120 Rubber Insert (VG — Every Pitch)", openArea: "0%", surface: "Grip / TPR Rubber Insert",
        image: ERIKS + "01461tp.jpg",
        description: "Flat top with TPR (thermoplastic rubber, black, 50 shore A) inserts every pitch. For grip on inclines, accumulation. Backflex radius 20 mm.",
        applications: ["Incline/decline conveying", "Grip conveying", "Accumulation with grip", "Sticky products"],
        beltData: [
          { material: "NGE", label: "NGE — New Generation (Grey/Blue) + TPR Rubber", pinMaterial: "PBT (White)", strengthNm: 18000, strengthLbsFt: 1260, massKgM2: 9.7, massLbFt2: 1.98, tempC: "-10 to +85", tempF: "14 to 185" },
        ],
        notes: ["TPR rubber inserts (black, 50 shore A) every pitch.", "Backflex radius: 20 mm (0.79 in).", "Max load: 18,000 N/m (1,260 lbs/ft).", "Also available: insert every 2nd or 3rd pitch.", "Also available with side indent."],
        url: SP_SMART_GUIDE_URL + "30100A/",
      },
      {
        key: "guide_bar_gb", label: "2120 Guide Bar (GB — Transfer)", openArea: "0%", surface: "Closed / Guide Bar",
        image: ERIKS + "00195tp.jpg",
        description: "Guide bar every pitch for tight transfers. Used on short conveyors with nosebar for extremely short transfers. Backflex radius 20 mm.",
        applications: ["Tight transfers", "Nosebar transfers", "Short conveyors", "Transfer dead plates"],
        beltData: [
          { material: "NGE", label: "NGE — New Generation (Grey/Blue)", pinMaterial: "PBT (White)", strengthNm: 18000, strengthLbsFt: 1260, massKgM2: 10.4, massLbFt2: 2.12, tempC: "-10 to +85", tempF: "14 to 185" },
        ],
        notes: ["Guide bar on every pitch.", "Backflex radius: 20 mm (0.79 in).", "Primarily used with nosebar for very tight transfers."],
        url: SP_SMART_GUIDE_URL + "30120A/",
      },
      {
        key: "low_back_pressure_lbp", label: "2120 Low Back Pressure (LBP)", openArea: "0% (roller)", surface: "Roller Top / Low Back Pressure",
        image: ERIKS + "00195tp.jpg",
        description: "Low back pressure accumulation belt with integrated rollers. Roller shaft: stainless steel AISI 304. Backflex radius 65 mm. LBP belts cannot be cut-to-width.",
        applications: ["Low backpressure accumulation", "Fragile product handling", "Gentle accumulation", "Package conveying"],
        beltData: [
          { material: "NGE", label: "NGE — New Generation (Grey/Blue)", pinMaterial: "PBT (White)", strengthNm: 18000, strengthLbsFt: 1260, massKgM2: 23.2, massLbFt2: 4.73, tempC: "-10 to +85", tempF: "14 to 185" },
        ],
        notes: ["Backflex radius: 65 mm (2.56 in).", "Roller shaft: Stainless Steel AISI 304.", "Cannot be cut-to-width.", "Roller OD: 10.9 mm."],
        url: SP_SMART_GUIDE_URL + "30110A/",
      },
    ],
  },

  // ── 2121 SERIES — 12.7 mm pitch, Imperial modules ─────────────────────────
  {
    id: "S2121",
    name: "Series 2121",
    beltType: "Straight-Running",
    pitch_mm: 12.7,
    pitch_in: 0.5,
    thickness_mm: 8.7,
    thickness_in: 0.34,
    catalogPage: "30055a",
    image: ERIKS + "00195tp.jpg",
    description: "Series 2121 — 1/2-inch pitch modular belt with Imperial (76.2 mm / 3-inch) modules. Flat top version. Compatible with same sprockets as 2120. Width in 3-inch increments.",
    applications: ["General conveying", "Food processing", "Packaging", "Accumulation"],
    advantages: ["Imperial 76.2 mm (3-in) module", "Same sprockets as 2120", "Flat top surface", "3-inch width increments"],
    sprockets: SPROCKETS_2120,
    accessories: ACC_2120,
    techChartUrl: SP_SMART_GUIDE_URL + "30055A/",
    smartGuideRef: "30055a",
    min_width_mm: 76.2, min_width_in: 3.0,
    width_increment_mm: 76.2, width_increment_in: 3.0,
    fixation: "Snap-in Clip / Pin",
    backflex_radius_mm: 10, backflex_radius_in: 0.39,
    pin_material: "PBT (White)",
    styles: [
      {
        key: "flat_top", label: "2121 Flat Top (FT)", openArea: "0%", surface: "Closed / Smooth",
        image: ERIKS + "00195tp.jpg",
        description: "1/2-inch pitch flat top with 3-inch (76.2 mm) Imperial modules. Tight transfers over nosebar.",
        applications: ["General conveying", "Food processing", "Packaging"],
        beltData: [
          { material: "LFG", label: "LFG — Low Friction Acetal (Grey)", pinMaterial: "PBT (White)", strengthNm: 20000, strengthLbsFt: 1400, massKgM2: 8.6, massLbFt2: 1.75, tempC: "-10 to +85", tempF: "14 to 185" },
          { material: "LFB", label: "LFB — Low Friction Acetal (Blue)", pinMaterial: "PBT (White)", strengthNm: 20000, strengthLbsFt: 1400, massKgM2: 8.6, massLbFt2: 1.75, tempC: "-10 to +85", tempF: "14 to 185" },
          { material: "NGE", label: "NGE — New Generation Engineered (Grey/Blue)", pinMaterial: "PBT (White)", strengthNm: 20000, strengthLbsFt: 1400, massKgM2: 8.6, massLbFt2: 1.75, tempC: "-10 to +85", tempF: "14 to 185" },
        ],
        notes: ["Imperial 76.2 mm (3-in) module.", "Backflex radius: 10 mm.", "Compatible with 2120 sprockets."],
        url: SP_SMART_GUIDE_URL + "30055A/",
      },
    ],
  },

  // ── 2122 SERIES — 12.7 mm pitch, 100 mm metric modules ───────────────────
  {
    id: "S2122",
    name: "Series 2122",
    beltType: "Straight-Running",
    pitch_mm: 12.7,
    pitch_in: 0.5,
    thickness_mm: 8.7,
    thickness_in: 0.34,
    catalogPage: "30073a",
    image: ERIKS + "00196tp.jpg",
    description: "Series 2122 — 1/2-inch pitch modular belt with 100 mm metric modules. Flush grid version. Wider modules than 2120 for higher open area. NOT SUITABLE for square-bore one-piece sprockets.",
    applications: ["Drainage applications", "Washing", "Food processing", "Wide open area requirements"],
    advantages: ["100 mm metric modules", "Higher open area grid", "1/2-inch pitch"],
    sprockets: [
      { name: "2120 Molded Drive Sprocket — Split Fixed (Round Bore)", teeth: "24, 28, 36", bore: "Round: Ø30, Ø35, Ø40 mm", material: "Reinforced Polyamide (Black)", notes: "NOT SUITABLE for square-bore one-piece sprockets (2122 FG).", smartGuide: "30160a", url: SP_SMART_GUIDE_URL + "30160A/" },
    ],
    accessories: [],
    techChartUrl: SP_SMART_GUIDE_URL + "30073A/",
    smartGuideRef: "30073a / 30166a",
    min_width_mm: 100, min_width_in: 3.94,
    width_increment_mm: 100, width_increment_in: 3.94,
    fixation: "Snap-in Clip / Pin",
    backflex_radius_mm: 10, backflex_radius_in: 0.39,
    pin_material: "PBT (White)",
    styles: [
      {
        key: "flush_grid_100mm", label: "2122 Flush Grid (FG — 100 mm modules)", openArea: "21%", surface: "Open Grid",
        image: ERIKS + "00196tp.jpg",
        description: "Flush grid 1/2-inch pitch with 100 mm modules. 21% open area. NOT compatible with square-bore one-piece floating sprockets.",
        applications: ["Drainage", "Washing", "Food processing"],
        beltData: [
          { material: "LFG", label: "LFG — Low Friction Acetal (Grey)", pinMaterial: "PBT (White)", strengthNm: 20000, strengthLbsFt: 1400, massKgM2: 7.4, massLbFt2: 1.51, tempC: "-10 to +85", tempF: "14 to 185" },
          { material: "NGE", label: "NGE — New Generation Engineered (Grey/Blue)", pinMaterial: "PBT (White)", strengthNm: 20000, strengthLbsFt: 1400, massKgM2: 7.4, massLbFt2: 1.51, tempC: "-10 to +85", tempF: "14 to 185" },
        ],
        notes: ["100 mm modules — wider than 2120 FG.", "NOT compatible with square-bore one-piece floating sprockets.", "Open area: 21%."],
        url: SP_SMART_GUIDE_URL + "30073A/",
      },
    ],
  },

  // ── 2123 SERIES — 12.7 mm pitch, metric, flush grid variant ──────────────
  {
    id: "S2123",
    name: "Series 2123",
    beltType: "Straight-Running",
    pitch_mm: 12.7,
    pitch_in: 0.5,
    thickness_mm: 8.7,
    thickness_in: 0.34,
    catalogPage: "30065a",
    image: ERIKS + "00196tp.jpg",
    description: "Series 2123 — 1/2-inch pitch, metric module variant. Flush grid version. See Smart Guide 30065a for full details.",
    applications: ["Drainage", "Food processing", "Washing"],
    advantages: ["1/2-inch pitch metric variant", "Flush grid drainage"],
    sprockets: SPROCKETS_2120,
    accessories: [],
    techChartUrl: SP_SMART_GUIDE_URL + "30065A/",
    smartGuideRef: "30065a",
    min_width_mm: 85, min_width_in: 3.35,
    width_increment_mm: 85, width_increment_in: 3.35,
    fixation: "Snap-in Clip / Pin",
    pin_material: "PBT (White)",
    styles: [
      {
        key: "flush_grid", label: "2123 Flush Grid (FG)", openArea: "~21%", surface: "Open Grid",
        image: ERIKS + "00196tp.jpg",
        description: "1/2-inch pitch flush grid. Metric module. See Smart Guide 30065a.",
        applications: ["Drainage", "Washing", "Food processing"],
        beltData: "Missing Data – Needs Mapping",
        notes: ["Smart Guide 30065a.", "Metric module variant."],
        url: SP_SMART_GUIDE_URL + "30065A/",
      },
    ],
  },

  // ── 2124 SERIES — 12.7 mm pitch, metric, rubber insert variant ───────────
  {
    id: "S2124",
    name: "Series 2124",
    beltType: "Straight-Running",
    pitch_mm: 12.7,
    pitch_in: 0.5,
    thickness_mm: 8.7,
    thickness_in: 0.34,
    catalogPage: "30030a",
    image: ERIKS + "01461tp.jpg",
    description: "Series 2124 — 1/2-inch pitch, metric, with rubber insert variant. Flat top with TPR rubber inserts. See Smart Guide 30090a.",
    applications: ["Grip conveying", "Inclines", "Anti-slip"],
    advantages: ["1/2-inch pitch with rubber inserts", "Grip for inclines"],
    sprockets: SPROCKETS_2120,
    accessories: [],
    techChartUrl: SP_SMART_GUIDE_URL + "30090A/",
    smartGuideRef: "30090a",
    min_width_mm: 85, min_width_in: 3.35,
    width_increment_mm: 85, width_increment_in: 3.35,
    fixation: "Snap-in Clip / Pin",
    pin_material: "PBT (White)",
    styles: [
      {
        key: "flat_top_rubber_insert", label: "2124 Flat Top with Rubber Insert (VG)", openArea: "0%", surface: "Closed / Rubber Insert",
        image: ERIKS + "01461tp.jpg",
        description: "1/2-inch pitch flat top with rubber inserts. Smart Guide 30090a.",
        applications: ["Grip conveying", "Inclines", "Anti-slip"],
        beltData: "Missing Data – Needs Mapping",
        notes: ["Smart Guide 30090a.", "Rubber insert variant."],
        url: SP_SMART_GUIDE_URL + "30090A/",
      },
    ],
  },

  // ── 2190 SERIES — 19.05 mm (3/4") pitch, 8.7 mm height ───────────────────
  {
    id: "S2190",
    name: "Series 2190",
    beltType: "Straight-Running",
    pitch_mm: 19.05,
    pitch_in: 0.75,
    thickness_mm: 8.7,
    thickness_in: 0.34,
    catalogPage: "30200a",
    image: ERIKS + "01121tp_ngevo.jpg",
    description: "Series 2190 — 3/4-inch (19.05 mm) pitch modular belt, 8.7 mm height. Imperial module. NGE material. Available in Flat Top and Flush Grid. Single track and single track with positioner versions.",
    applications: ["Beverage conveying", "Food processing", "Medium-pitch applications", "Can conveying"],
    advantages: ["3/4-inch pitch medium-duty", "Flat Top and Flush Grid", "Patented single-track design", "NGE material standard"],
    sprockets: SPROCKETS_2190,
    accessories: [],
    techChartUrl: SP_SMART_GUIDE_URL + "30200A/",
    smartGuideRef: "30200a / 30210a / 30230a / 30235a",
    min_width_mm: 76.2, min_width_in: 3.0,
    width_increment_mm: 25.4, width_increment_in: 1.0,
    fixation: "Snap-in Clip / Pin",
    backflex_radius_mm: 20, backflex_radius_in: 0.79,
    pin_material: "PBT (Water Blue)",
    styles: [
      {
        key: "flat_top", label: "2190 Flat Top (FT)", openArea: "0%", surface: "Closed / Smooth",
        image: ERIKS + "01121tp_ngevo.jpg",
        description: "3/4-inch pitch flat top. NGE material standard. Available as single track and single track with positioner.",
        applications: ["Beverage conveying", "Food processing", "Can conveying"],
        beltData: [
          { material: "NGE", label: "NGE — New Generation (Grey/Blue)", pinMaterial: "PBT (Water Blue)", strengthNm: 2070, strengthLbsFt: 460, massKgM2: 0.6, massLbFt2: 0.40, tempC: "-10 to +85", tempF: "14 to 185", note: "Per single track (83.8 mm wide). Scale proportionally for wider belts." },
        ],
        notes: ["Patented single-track design.", "Backflex radius: 20 mm (0.79 in).", "Available with positioner (FT-PT version).", "Standard length: 160 pitches (3,048 m / 10 ft)."],
        url: SP_SMART_GUIDE_URL + "30200A/",
      },
      {
        key: "flush_grid", label: "2190 Flush Grid (FG)", openArea: "~25%", surface: "Open Grid",
        image: ERIKS + "01124tp_ngevo.jpg",
        description: "3/4-inch pitch flush grid version. Smart Guide 30230a.",
        applications: ["Drainage", "Washing", "Airflow"],
        beltData: "Missing Data – Needs Mapping",
        notes: ["Smart Guide 30230a.", "Flush grid version of 2190 series."],
        url: SP_SMART_GUIDE_URL + "30230A/",
      },
    ],
  },

  // ── 2250 SERIES — 25.4 mm (1") pitch, 8.7 mm height ─────────────────────
  {
    id: "S2250",
    name: "Series 2250",
    beltType: "Straight-Running",
    pitch_mm: 25.4,
    pitch_in: 1.0,
    thickness_mm: 8.7,
    thickness_in: 0.34,
    catalogPage: "30310a",
    image: ERIKS + "00214tp_ngevo.jpg",
    description: "Series 2250 — 1-inch (25.4 mm) pitch, 8.7 mm height modular belt. Metric modules (83.8 mm). Available in Flat Top, Flush Grid, Rubber Insert (VG), and Roller Top (RTC). Widely used for food processing, packaging, and industrial applications.",
    applications: ["Food processing", "Packaging", "Sorting", "Industrial conveying", "Drainage", "Incline conveying"],
    advantages: ["1-inch pitch — broad versatility", "Multiple surface styles including roller top", "Rubber insert grip version", "Flights available for inclines", "Same sprockets as 2253 series"],
    sprockets: SPROCKETS_2250,
    accessories: ACC_2250,
    techChartUrl: SP_SMART_GUIDE_URL + "30310A/",
    smartGuideRef: "30310a / 30325a / 30340a / 30360a / 30370a / 30395a",
    min_width_mm: 83.8, min_width_in: 3.3,
    width_increment_mm: 83.8, width_increment_in: 3.3,
    fixation: "Snap-in Clip / Pin",
    backflex_radius_mm: 25, backflex_radius_in: 0.98,
    pin_material: "PBT (White)",
    styles: [
      {
        key: "flat_top", label: "2250 Flat Top (FT)", openArea: "0%", surface: "Closed / Smooth",
        image: ERIKS + "00214tp_ngevo.jpg",
        description: "1-inch pitch flat top, 8.7 mm height. NGE and LFG materials. Single track and single track with positioner versions.",
        applications: ["Food processing", "Packaging", "Sorting", "General conveying"],
        beltData: [
          { material: "LFG", label: "LFG — Low Friction Acetal (Grey)", pinMaterial: "PBT (White)", strengthNm: 2100, strengthLbsFt: 470, massKgM2: 0.6, massLbFt2: 0.40, tempC: "-10 to +85", tempF: "14 to 185", note: "Per single track (83.8 mm). Scale for wider belts." },
          { material: "NGE", label: "NGE — New Generation (Grey/Blue)", pinMaterial: "PBT (White)", strengthNm: 1890, strengthLbsFt: 425, massKgM2: 0.6, massLbFt2: 0.40, tempC: "-10 to +85", tempF: "14 to 185", note: "Per single track (83.8 mm). Scale for wider belts." },
        ],
        notes: ["Width increment: 83.8 mm.", "Backflex radius: 25 mm (0.98 in).", "Standard length: 120 pitches (3,048 m / 10 ft).", "Available with positioner (FT-PT version)."],
        url: SP_SMART_GUIDE_URL + "30310A/",
      },
      {
        key: "flush_grid", label: "2250 Flush Grid (FG)", openArea: "23%", surface: "Open Grid",
        image: ERIKS + "00223tp.jpg",
        description: "1-inch pitch flush grid. 23% open area. NGE material standard.",
        applications: ["Drainage", "Washing", "Blanching", "Cooling"],
        beltData: [
          { material: "NGE", label: "NGE — New Generation (Grey/Blue)", pinMaterial: "PBT (White)", strengthNm: 1890, strengthLbsFt: 425, massKgM2: 0.5, massLbFt2: 0.34, tempC: "-10 to +85", tempF: "14 to 185", note: "Per single track (83.8 mm)." },
        ],
        notes: ["Open area: 23%.", "Smart Guide 30340a.", "Also available with positioner."],
        url: SP_SMART_GUIDE_URL + "30340A/",
      },
      {
        key: "rubber_insert_vg", label: "2250 Rubber Insert (VG — Every Pitch)", openArea: "0%", surface: "Grip / TPR Rubber Insert",
        image: ERIKS + "01461tp.jpg",
        description: "1-inch pitch with TPR rubber inserts (water blue, 70 shore A) every pitch. For grip on inclines.",
        applications: ["Inclines", "Grip conveying", "Anti-slip"],
        beltData: [
          { material: "LFG + TPR", label: "LFG + TPR Rubber (Water Blue)", pinMaterial: "PBT (White)", strengthNm: 25000, strengthLbsFt: 1700, massKgM2: 8.7, massLbFt2: 1.77, tempC: "-10 to +85", tempF: "14 to 185" },
        ],
        notes: ["TPR rubber inserts: water blue, 70 shore A.", "Backflex radius: 30 mm (1.18 in).", "Max load: 25,000 N/m (1,700 lbs/ft).", "Also available every 2nd or 3rd pitch.", "Also available with side indent."],
        url: SP_SMART_GUIDE_URL + "30370A/",
      },
      {
        key: "roller_top_rtc", label: "2250 Roller Top (RTC)", openArea: "~5%", surface: "Roller / Low Back Pressure",
        image: ERIKS + "00214tp_ngevo.jpg",
        description: "1-inch pitch roller top for low backpressure accumulation. Smart Guide 30381a.",
        applications: ["Low backpressure accumulation", "Package conveying", "Gentle handling"],
        beltData: "Missing Data – Needs Mapping",
        notes: ["Smart Guide 30381a.", "Roller top version of 2250 series."],
        url: SP_SMART_GUIDE_URL + "30381A/",
      },
      {
        key: "flat_top_flights", label: "2250 with Flights", openArea: "0%", surface: "Closed / With Flights",
        image: ERIKS + "00214tp_ngevo.jpg",
        description: "2250 flat top with integral flights for incline conveying. Smart Guide 30365a.",
        applications: ["Incline conveying", "Product elevation", "Steep inclines"],
        beltData: "Missing Data – Needs Mapping",
        notes: ["Smart Guide 30365a.", "Integral flights for incline conveying."],
        url: SP_SMART_GUIDE_URL + "30365A/",
      },
    ],
  },

  // ── 2251 SERIES — 25.4 mm pitch, 12.7 mm height, Metric ─────────────────
  {
    id: "S2251",
    name: "Series 2251",
    beltType: "Straight-Running",
    pitch_mm: 25.4,
    pitch_in: 1.0,
    thickness_mm: 12.7,
    thickness_in: 0.5,
    catalogPage: "30420a",
    image: ERIKS + "00214tp_ngevo.jpg",
    description: "Series 2251 — 1-inch pitch, 12.7 mm (1/2-inch) thick modular belt. Metric single-track module (83.8 mm wide). NGE material standard. Flat top, rubber insert, and LBP versions available.",
    applications: ["Heavy food processing", "Higher load applications", "Packaging", "Industrial conveying"],
    advantages: ["1/2-inch thick belt — more wear life", "1-inch pitch", "NGE material for long service life", "Single track with positioner available"],
    sprockets: SPROCKETS_2250,
    accessories: [],
    techChartUrl: SP_SMART_GUIDE_URL + "30420A/",
    smartGuideRef: "30420a / 30440a",
    min_width_mm: 83.8, min_width_in: 3.3,
    width_increment_mm: 83.8, width_increment_in: 3.3,
    fixation: "Snap-in Clip / Pin",
    backflex_radius_mm: 25, backflex_radius_in: 1.0,
    pin_material: "PBT (White)",
    styles: [
      {
        key: "flat_top", label: "2251 Flat Top (FT)", openArea: "0%", surface: "Closed / Smooth",
        image: ERIKS + "00214tp_ngevo.jpg",
        description: "1-inch pitch, 12.7 mm thick flat top. NGE material. Single track and single track with positioner.",
        applications: ["Heavy food processing", "Packaging", "Industrial conveying"],
        beltData: [
          { material: "NGE", label: "NGE — New Generation (Grey/Blue)", pinMaterial: "PBT (White)", strengthNm: 2800, strengthLbsFt: 620, massKgM2: 1.2, massLbFt2: 0.81, tempC: "-10 to +85", tempF: "14 to 185", note: "Per single track (83.8 mm). Scale for wider belts." },
        ],
        notes: ["12.7 mm thick version for higher loads.", "Standard length: 120 pitches (3,048 m / 10 ft).", "Also available with positioner (PT version)."],
        url: SP_SMART_GUIDE_URL + "30420A/",
      },
      {
        key: "rubber_insert_vg", label: "2251 Rubber Insert (VG)", openArea: "0%", surface: "Closed / Rubber Insert",
        image: ERIKS + "01461tp.jpg",
        description: "2251 with rubber inserts. Smart Guide 30490a.",
        applications: ["Grip conveying", "Inclines"],
        beltData: "Missing Data – Needs Mapping",
        notes: ["Smart Guide 30490a."],
        url: SP_SMART_GUIDE_URL + "30490A/",
      },
      {
        key: "low_back_pressure_lbp", label: "2251 Low Back Pressure (LBP)", openArea: "0% (roller)", surface: "Roller / LBP",
        image: ERIKS + "00214tp_ngevo.jpg",
        description: "2251 LBP roller top for accumulation. Smart Guide 30500a.",
        applications: ["Accumulation", "Low backpressure conveying"],
        beltData: "Missing Data – Needs Mapping",
        notes: ["Smart Guide 30500a."],
        url: SP_SMART_GUIDE_URL + "30500A/",
      },
    ],
  },

  // ── 2252 SERIES — 25.4 mm pitch, 12.7 mm height, Imperial ────────────────
  {
    id: "S2252",
    name: "Series 2252",
    beltType: "Straight-Running",
    pitch_mm: 25.4,
    pitch_in: 1.0,
    thickness_mm: 12.7,
    thickness_in: 0.5,
    catalogPage: "30420a",
    image: ERIKS + "00214tp_ngevo.jpg",
    description: "Series 2252 — 1-inch pitch, 12.7 mm thick, Imperial module (76.2 mm / 3-inch wide). NGE material. Flat Top and Flush Grid versions available.",
    applications: ["General conveying", "Food processing", "Industrial conveying"],
    advantages: ["Imperial 3-inch module", "12.7 mm thick for wear life", "1-inch pitch", "Flat Top and Flush Grid"],
    sprockets: SPROCKETS_2250,
    accessories: [],
    techChartUrl: SP_SMART_GUIDE_URL + "30420A/",
    smartGuideRef: "30420a / 30481a",
    min_width_mm: 76.2, min_width_in: 3.0,
    width_increment_mm: 25.4, width_increment_in: 1.0,
    fixation: "Snap-in Clip / Pin",
    backflex_radius_mm: 25, backflex_radius_in: 1.0,
    pin_material: "PBT (White)",
    styles: [
      {
        key: "flat_top", label: "2252 Flat Top (FT)", openArea: "0%", surface: "Closed / Smooth",
        image: ERIKS + "00214tp_ngevo.jpg",
        description: "Imperial 1-inch pitch, 12.7 mm thick flat top. Available in 3-inch width increments.",
        applications: ["General conveying", "Food processing"],
        beltData: [
          { material: "NGE", label: "NGE — New Generation (Grey/Blue)", pinMaterial: "PBT (White)", strengthNm: 2600, strengthLbsFt: 590, massKgM2: 1.0, massLbFt2: 0.67, tempC: "-10 to +85", tempF: "14 to 185", note: "Per 76.2 mm track. Scale for wider belts." },
        ],
        notes: ["Imperial 3-inch module.", "Standard length: 120 pitches (3,048 m / 10 ft)."],
        url: SP_SMART_GUIDE_URL + "30420A/",
      },
      {
        key: "flush_grid", label: "2252 Flush Grid (FG)", openArea: "~25%", surface: "Open Grid",
        image: ERIKS + "00223tp.jpg",
        description: "Imperial 1-inch pitch flush grid, 12.7 mm thick. Smart Guide 30481a.",
        applications: ["Drainage", "Washing"],
        beltData: "Missing Data – Needs Mapping",
        notes: ["Smart Guide 30481a.", "Flush grid version of 2252."],
        url: SP_SMART_GUIDE_URL + "30481A/",
      },
    ],
  },

  // ── 2253 SERIES — 25.4 mm pitch, 8.7 mm height, Imperial ─────────────────
  {
    id: "S2253",
    name: "Series 2253",
    beltType: "Straight-Running",
    pitch_mm: 25.4,
    pitch_in: 1.0,
    thickness_mm: 8.7,
    thickness_in: 0.34,
    catalogPage: "30330a",
    image: ERIKS + "00214tp_ngevo.jpg",
    description: "Series 2253 — 1-inch pitch, 8.7 mm height, Imperial module. Two key versions: 2253FT (Flat Top) and 2253RTC (Roller Top Conveyor for low backpressure). The 2253-series sprockets are the optimum choice; 2250 sprockets can also be used.",
    applications: ["General conveying", "Low backpressure accumulation (RTC)", "Packaging lines", "Food processing"],
    advantages: ["Imperial module 1-inch pitch", "Roller top (RTC) for accumulation", "Specific high-performance sprockets available", "Same pitch family as 2250"],
    sprockets: SPROCKETS_2250,
    accessories: [],
    techChartUrl: SP_SMART_GUIDE_URL + "30330A/",
    smartGuideRef: "30330a / 30397a / 30395a",
    min_width_mm: 76.2, min_width_in: 3.0,
    width_increment_mm: 25.4, width_increment_in: 1.0,
    fixation: "Snap-in Clip / Pin",
    backflex_radius_mm: 25, backflex_radius_in: 1.0,
    pin_material: "PBT (White)",
    styles: [
      {
        key: "flat_top_ft", label: "2253 Flat Top (FT)", openArea: "0%", surface: "Closed / Smooth",
        image: ERIKS + "00214tp_ngevo.jpg",
        description: "2253FT — 1-inch pitch Imperial flat top. Smart Guide 30330a.",
        applications: ["General conveying", "Food processing", "Packaging"],
        beltData: "Missing Data – Needs Mapping",
        notes: ["Smart Guide 30330a.", "Use 2253-series sprockets for optimum performance.", "2250 sprockets also compatible."],
        url: SP_SMART_GUIDE_URL + "30330A/",
      },
      {
        key: "roller_top_rtc", label: "2253 Roller Top Conveyor (RTC)", openArea: "~5%", surface: "Roller / Low Back Pressure",
        image: ERIKS + "00214tp_ngevo.jpg",
        description: "2253RTC — Roller Top Conveyor for low backpressure accumulation. Smart Guide 30397a.",
        applications: ["Low backpressure accumulation", "Gentle product handling", "Package conveying"],
        beltData: "Missing Data – Needs Mapping",
        notes: ["Smart Guide 30397a.", "Use 2253-series sprockets for optimum performance."],
        url: SP_SMART_GUIDE_URL + "30397A/",
      },
    ],
  },

  // ── 2500 SERIES — 50.8 mm (2") pitch, Raised Rib ─────────────────────────
  {
    id: "S2500",
    name: "Series 2500 (Raised Rib)",
    beltType: "Straight-Running",
    pitch_mm: 50.8,
    pitch_in: 2.0,
    thickness_mm: 16,
    thickness_in: 0.63,
    catalogPage: "30610a",
    image: null,
    description: "Series 2500RR — 2-inch pitch, 16 mm height RAISED RIB modular belt. Polypropylene standard material (dark grey). Backflex radius 75 mm. 27% open area. High load capacity 30,000 N/m (2,000 lbs/ft). Width increment 3 inches (76.2 mm).",
    applications: ["Bottling / beverage lines", "Container handling", "Product stability applications", "Wide conveying systems"],
    advantages: ["High load capacity: 30,000 N/m (2,000 lbs/ft)", "27% open area raised rib surface", "2-inch pitch heavy duty", "Positioner version available", "Patented design"],
    sprockets: SPROCKETS_2500,
    accessories: ACC_2500,
    techChartUrl: SP_SMART_GUIDE_URL + "30610A/",
    smartGuideRef: "30610a / 30615a",
    min_width_mm: 229, min_width_in: 9.0,
    width_increment_mm: 76.2, width_increment_in: 3.0,
    fixation: "Snap-in Clip / Pin (PP)",
    backflex_radius_mm: 75, backflex_radius_in: 2.95,
    pin_material: "Polypropylene",
    styles: [
      {
        key: "raised_rib", label: "2500 Raised Rib (RR)", openArea: "27%", surface: "Raised Rib / Open",
        image: null,
        description: "2-inch pitch raised rib belt. 16 mm height. 27% open area. PPG (dark grey polypropylene). Patented design. Width in 3-inch increments.",
        applications: ["Bottling lines", "Container handling", "Product stability", "Wide conveyors"],
        beltData: [
          { material: "PPG", label: "PPG — Polypropylene (Dark Grey)", pinMaterial: "Polypropylene", strengthNm: 30000, strengthLbsFt: 2000, massKgM2: 9.2, massLbFt2: 1.88, tempC: "-10 to +100", tempF: "14 to 212" },
        ],
        notes: ["Open area: 27%.", "Backflex radius: 75 mm (2.95 in).", "Width increment: 3 in (76.2 mm).", "Standard length: width ≤15 in = 3,048 m; width >15 in = 1,016 m.", "Positioner version available."],
        url: SP_SMART_GUIDE_URL + "30610A/",
      },
    ],
  },

  // ── 2508 SERIES — 50.8 mm (2") pitch, Anti-Slip Surface ──────────────────
  {
    id: "S2508",
    name: "Series 2508 (Anti-Slip Surface)",
    beltType: "Straight-Running",
    pitch_mm: 50.8,
    pitch_in: 2.0,
    thickness_mm: 22,
    thickness_in: 0.87,
    catalogPage: "30620a",
    image: null,
    description: "Series 2508 — 2-inch pitch, 22 mm height, FLAT TOP WITH ANTI-SLIP SURFACE. LFG standard material. Multiple materials available: LFG, PPLG, POM-AS, PP-FR-EC. Very high load capacity 80 kN/m (5,440 lbs). Width increment 100 mm. Patented design.",
    applications: ["Automotive industry", "Heavy industrial conveying", "Airport baggage handling", "Anti-slip product handling", "ESD-sensitive environments (POM-AS)", "Flame retardant environments (PP-FR-EC)"],
    advantages: ["Very high load: 80 kN/m (5,440 lbs/ft)", "Anti-slip textured surface (patented)", "Multiple material options for special environments", "Large width range up to 5,000 mm", "Optional steel pins"],
    sprockets: SPROCKETS_2508_2630,
    accessories: [],
    techChartUrl: SP_SMART_GUIDE_URL + "30620A/",
    smartGuideRef: "30620a / 30640a",
    min_width_mm: 300, min_width_in: 11.81,
    width_increment_mm: 100, width_increment_in: 3.94,
    fixation: "Snap-in Clip / Pin",
    backflex_radius_mm: 55, backflex_radius_in: 2.17,
    pin_material: "PBT (White) — Steel pins optional",
    styles: [
      {
        key: "flat_top_anti_slip", label: "2508 Flat Top Anti-Slip Surface (FTS)", openArea: "0%", surface: "Closed / Anti-Slip (Patented)",
        image: null,
        description: "2-inch pitch, 22 mm height flat top with patented anti-slip surface texture. LFG standard, also PPLG, POM-AS, PP-FR-EC. Width increment 100 mm.",
        applications: ["Automotive conveying", "Heavy industrial", "Airport baggage handling", "Anti-slip requirements"],
        beltData: [
          { material: "LFG",    label: "LFG — Low Friction Acetal (Grey)",              pinMaterial: "PBT (White) / Steel (optional)", strengthNm: 80000, strengthLbsFt: 5440, massKgM2: 22.5, massLbFt2: 4.59, tempC: "-10 to +85",  tempF: "14 to 185" },
          { material: "PPLG",   label: "PPLG — Polypropylene (Light Grey)",             pinMaterial: "PBT (White) / Steel (optional)", strengthNm: 80000, strengthLbsFt: 5440, massKgM2: 22.5, massLbFt2: 4.59, tempC: "-10 to +100", tempF: "14 to 212" },
          { material: "POM-AS", label: "POM-AS — Anti-Static Acetal (Black)",           pinMaterial: "PBT (White) / Steel (optional)", strengthNm: 80000, strengthLbsFt: 5440, massKgM2: 22.5, massLbFt2: 4.59, tempC: "-10 to +85",  tempF: "14 to 185" },
          { material: "PP-FR-EC", label: "PP-FR-EC — Flame Retardant Conductive PP (Black)", pinMaterial: "PBT (White) / Steel (optional)", strengthNm: 80000, strengthLbsFt: 5440, massKgM2: 22.5, massLbFt2: 4.59, tempC: "-10 to +80", tempF: "14 to 176" },
        ],
        notes: ["Patented anti-slip surface.", "Backflex radius: 55 mm (2.17 in).", "Width increment: 100 mm.", "Standard length: width ≤800 mm = 20 pitches; width >800 mm = 15 pitches.", "Steel pins optionally available."],
        url: SP_SMART_GUIDE_URL + "30620A/",
      },
    ],
  },

  // ── 2630 SERIES — 63.5 mm (2.5") pitch, Anti-Slip Surface ────────────────
  {
    id: "S2630",
    name: "Series 2630 (Anti-Slip Surface)",
    beltType: "Straight-Running",
    pitch_mm: 63.5,
    pitch_in: 2.5,
    thickness_mm: 30,
    thickness_in: 1.18,
    catalogPage: "30645a",
    image: null,
    description: "Series 2630 — 2.5-inch (63.5 mm) pitch, 30 mm height, FLAT TOP WITH ANTI-SLIP SURFACE. LFG standard. Very high load capacity 115 kN/m (7,800 lbs). Width increment 100 mm. Patented design. Largest belt in System Plast range.",
    applications: ["Very heavy industrial conveying", "Pallet conveying", "Heavy automotive parts", "Large-format product handling"],
    advantages: ["Highest load capacity: 115 kN/m (7,800 lbs/ft)", "2.5-inch pitch for heavy loads", "30 mm thick — maximum wear life", "Anti-slip surface (patented)", "Width up to 5,000 mm"],
    sprockets: SPROCKETS_2508_2630,
    accessories: [],
    techChartUrl: SP_SMART_GUIDE_URL + "30645A/",
    smartGuideRef: "30645a / 30650a",
    min_width_mm: 100, min_width_in: 3.94,
    width_increment_mm: 100, width_increment_in: 3.94,
    fixation: "Snap-in Clip / Pin",
    backflex_radius_mm: 60, backflex_radius_in: 2.36,
    pin_material: "PBT (White) — Steel pins optional",
    styles: [
      {
        key: "flat_top_anti_slip", label: "2630 Flat Top Anti-Slip Surface (FTS)", openArea: "0%", surface: "Closed / Anti-Slip (Patented)",
        image: null,
        description: "2.5-inch pitch, 30 mm height flat top with patented anti-slip surface. LFG standard material. Also PPLG, POM-AS, PP-FR-EC available.",
        applications: ["Very heavy industrial", "Pallet conveying", "Automotive"],
        beltData: [
          { material: "LFG",    label: "LFG — Low Friction Acetal (Grey)",              pinMaterial: "PBT (White) / Steel (optional)", strengthNm: 115000, strengthLbsFt: 7800, massKgM2: 29.5, massLbFt2: 6.02, tempC: "-10 to +85",  tempF: "14 to 185" },
          { material: "PPLG",   label: "PPLG — Polypropylene (Light Grey)",             pinMaterial: "PBT (White) / Steel (optional)", strengthNm: 115000, strengthLbsFt: 7800, massKgM2: 29.5, massLbFt2: 6.02, tempC: "-10 to +100", tempF: "14 to 212" },
          { material: "POM-AS", label: "POM-AS — Anti-Static Acetal (Black)",           pinMaterial: "PBT (White) / Steel (optional)", strengthNm: 115000, strengthLbsFt: 7800, massKgM2: 29.5, massLbFt2: 6.02, tempC: "-10 to +85",  tempF: "14 to 185" },
          { material: "PP-FR-EC", label: "PP-FR-EC — Flame Retardant Conductive PP (Black)", pinMaterial: "PBT (White) / Steel (optional)", strengthNm: 115000, strengthLbsFt: 7800, massKgM2: 29.5, massLbFt2: 6.02, tempC: "-10 to +80", tempF: "14 to 176" },
        ],
        notes: ["Patented anti-slip surface.", "Backflex radius: 60 mm (2.36 in).", "Width increment: 100 mm.", "Standard length: width ≤800 mm = 16 pitches; width >800 mm = 12 pitches.", "Steel pins optionally available."],
        url: SP_SMART_GUIDE_URL + "30645A/",
      },
    ],
  },

  // ── 2120 SIDEFLEXING (2120 SF) ────────────────────────────────────────────
  {
    id: "S2120SF",
    name: "Series 2120 Sideflexing",
    beltType: "Sideflexing",
    pitch_mm: 12.7,
    pitch_in: 0.5,
    thickness_mm: 8.7,
    thickness_in: 0.34,
    catalogPage: "30720a",
    image: null,
    description: "Series 2120 Sideflexing — 1/2-inch pitch side-flexing modular belt for horizontal curves. Based on 2120 series platform. See Smart Guide 30720a.",
    applications: ["Horizontal curves", "Multi-directional conveying", "Curved food processing lines"],
    advantages: ["1/2-inch pitch sideflexing", "Based on proven 2120 platform", "Flat top and flush grid variants"],
    sprockets: [{ name: "2120 Sideflexing Sprocket", teeth: "Missing Data – Needs Mapping", bore: "Missing Data – Needs Mapping", material: "Reinforced Polyamide", notes: "Contact Uniking for 2120 sideflexing sprocket details. Smart Guide 30720a.", smartGuide: "30720a", url: SP_SMART_GUIDE_URL + "30720A/" }],
    accessories: [],
    techChartUrl: SP_SMART_GUIDE_URL + "30720A/",
    smartGuideRef: "30720a",
    min_width_mm: 85, min_width_in: 3.35,
    width_increment_mm: 85, width_increment_in: 3.35,
    fixation: "Missing Data – Needs Mapping",
    styles: [
      {
        key: "flat_top_sf", label: "2120 Sideflexing Flat Top", openArea: "0%", surface: "Closed / Sideflexing",
        image: null,
        description: "1/2-inch pitch sideflexing flat top for horizontal curves. Smart Guide 30720a.",
        applications: ["Horizontal curves", "Curved food processing"],
        beltData: "Missing Data – Needs Mapping",
        notes: ["Smart Guide 30720a.", "1/2-inch pitch sideflexing."],
        url: SP_SMART_GUIDE_URL + "30720A/",
      },
    ],
  },

  // ── 2250 SIDEFLEXING (2260 / 2256 TAB) ────────────────────────────────────
  {
    id: "S2256",
    name: "Series 2256 (Sideflexing)",
    beltType: "Sideflexing",
    pitch_mm: 25.4,
    pitch_in: 1.0,
    thickness_mm: 8.7,
    thickness_in: 0.34,
    catalogPage: "30728a",
    image: null,
    description: "Series 2256 — 1-inch pitch sideflexing modular belt. See Smart Guide 30728a for full details.",
    applications: ["Horizontal curves", "Multi-directional food processing", "Complex conveyor layouts"],
    advantages: ["1-inch pitch sideflexing", "TAB chainbelt option available", "Magnetic chainbelt option (2260M)"],
    sprockets: [{ name: "2256 Sideflexing Sprocket", teeth: "Missing Data – Needs Mapping", bore: "Missing Data – Needs Mapping", material: "Reinforced Polyamide", notes: "Contact Uniking for 2256 sideflexing sprocket details. Smart Guide 30728a.", smartGuide: "30728a", url: SP_SMART_GUIDE_URL + "30728A/" }],
    accessories: [],
    techChartUrl: SP_SMART_GUIDE_URL + "30728A/",
    smartGuideRef: "30728a",
    fixation: "Missing Data – Needs Mapping",
    styles: [
      {
        key: "sideflexing_ft", label: "2256 Sideflexing Flat Top", openArea: "0%", surface: "Closed / Sideflexing",
        image: null,
        description: "1-inch pitch sideflexing flat top. Smart Guide 30728a.",
        applications: ["Horizontal curves", "Food processing curves"],
        beltData: "Missing Data – Needs Mapping",
        notes: ["Smart Guide 30728a.", "1-inch pitch sideflexing."],
        url: SP_SMART_GUIDE_URL + "30728A/",
      },
    ],
  },

  // ── 2260 / 2251M MAGNETIC CHAINBELT ──────────────────────────────────────
  {
    id: "S2260M",
    name: "Series 2260 / 2251M Magnetic Chainbelt",
    beltType: "Straight-Running / Special",
    pitch_mm: 25.4,
    pitch_in: 1.0,
    thickness_mm: 8.7,
    thickness_in: 0.34,
    catalogPage: "30700a",
    image: null,
    description: "Series 2260 / 2251M — 1-inch pitch magnetic chainbelt for use with magnetic curves. 2260M: Flat Top and Flush Grid. 2251M: Flat Top. Min. curve radius 500 mm. LFG and NGE materials. Martensitic stainless steel pin. For glass and PET container conveying.",
    applications: ["Magnetic curve systems", "Glass container conveying", "PET bottle conveying", "Curved beverage lines"],
    advantages: ["Magnetic system compatible", "Closed top (2260M FT) for PET/glass bottles with petaloid base", "Flush grid (2260M FG) for can conveying", "Min. curve radius 500 mm", "Martensitic SS pin"],
    sprockets: [{ name: "2260 / 2251M Sprocket", teeth: "Missing Data – Needs Mapping", bore: "Missing Data – Needs Mapping", material: "Reinforced Polyamide", notes: "Contact Uniking. See Smart Guide 30715a.", smartGuide: "30715a", url: SP_SMART_GUIDE_URL + "30715A/" }],
    accessories: [{ name: "Magnetic Curves for 2260 / 2251M", type: "track", notes: "Dedicated magnetic curve system. See Smart Guide 50101a.", url: SP_SMART_GUIDE_URL + "50101A/" }],
    techChartUrl: SP_SMART_GUIDE_URL + "30700A/",
    smartGuideRef: "30700a / 30715a",
    min_width_mm: 83.8, min_width_in: 3.3,
    width_increment_mm: 83.8, width_increment_in: 3.3,
    fixation: "Snap-in Clip / Martensitic SS Pin",
    pin_material: "Martensitic Stainless Steel",
    styles: [
      {
        key: "ft_2260m", label: "2260M Flat Top (FT)", openArea: "0%", surface: "Closed / Magnetic",
        image: null,
        description: "2260M flat top for PET/glass containers on magnetic curve systems. Max load (LFG-FT): 2,000 N (450 lbs). Min. curve radius 500 mm.",
        applications: ["PET bottle conveying", "Glass container handling", "Magnetic curves"],
        beltData: [
          { material: "LFG", label: "LFG — Low Friction Acetal (Grey)", pinMaterial: "Martensitic SS", strengthNm: 2000, strengthLbsFt: 450, massKgM2: 1.7, massLbFt2: 1.14, tempC: "-10 to +85", tempF: "14 to 185" },
          { material: "NGE", label: "NGE — New Generation (Grey/Blue)", pinMaterial: "Martensitic SS", strengthNm: 2000, strengthLbsFt: 450, massKgM2: 1.7, massLbFt2: 1.14, tempC: "-10 to +85", tempF: "14 to 185" },
        ],
        notes: ["Min. curve radius 500 mm (R Min.).", "Standard length: 120 pitches (3,048 m / 10 ft).", "Use with System Plast magnetic curves."],
        url: SP_SMART_GUIDE_URL + "30700A/",
      },
      {
        key: "fg_2260m", label: "2260M Flush Grid (FG)", openArea: "~20%", surface: "Open Grid / Magnetic",
        image: null,
        description: "2260M flush grid for can conveying on magnetic curves. 20% open area. Max load (LFG-FG): 1,900 N (425 lbs).",
        applications: ["Can conveying", "Magnetic curves", "Drainage on curves"],
        beltData: [
          { material: "LFG", label: "LFG — Low Friction Acetal (Grey)", pinMaterial: "Martensitic SS", strengthNm: 1900, strengthLbsFt: 425, massKgM2: 1.6, massLbFt2: 1.07, tempC: "-10 to +85", tempF: "14 to 185" },
          { material: "NGE", label: "NGE — New Generation (Grey/Blue)", pinMaterial: "Martensitic SS", strengthNm: 1900, strengthLbsFt: 425, massKgM2: 1.6, massLbFt2: 1.07, tempC: "-10 to +85", tempF: "14 to 185" },
        ],
        notes: ["20% open area.", "Min. curve radius 500 mm.", "Suitable for can conveying applications."],
        url: SP_SMART_GUIDE_URL + "30700A/",
      },
      {
        key: "ft_2251m", label: "2251M Flat Top (FT)", openArea: "0%", surface: "Closed / Magnetic",
        image: null,
        description: "2251M flat top for magnetic curves. 12.7 mm thick. Min. curve radius 500 mm.",
        applications: ["PET bottle conveying", "Glass containers", "Magnetic curves — thicker belt"],
        beltData: [
          { material: "LFG", label: "LFG — Low Friction Acetal (Grey)", pinMaterial: "Martensitic SS", strengthNm: 2000, strengthLbsFt: 450, massKgM2: 1.9, massLbFt2: 1.27, tempC: "-10 to +85", tempF: "14 to 185" },
          { material: "NGE", label: "NGE — New Generation (Grey/Blue)", pinMaterial: "Martensitic SS", strengthNm: 2000, strengthLbsFt: 450, massKgM2: 1.9, massLbFt2: 1.27, tempC: "-10 to +85", tempF: "14 to 185" },
        ],
        notes: ["12.7 mm thick version.", "Min. curve radius 500 mm."],
        url: SP_SMART_GUIDE_URL + "30700A/",
      },
    ],
  },
];

export const SP_STRAIGHT_SERIES = SP_SERIES.filter(s => s.beltType === "Straight-Running" || s.beltType === "Straight-Running / Special");
export const SP_SIDEFLEXING_SERIES = SP_SERIES.filter(s => s.beltType === "Sideflexing");

export const SP_INDUSTRIES = [
  "Food Processing", "Beverage / Bottling", "Meat & Poultry", "Seafood",
  "Bakery & Snack", "Dairy", "Packaging", "Automotive",
  "Airport / Logistics", "General Industrial", "Pharmaceutical", "Other",
];