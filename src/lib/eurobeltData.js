// ─────────────────────────────────────────────────────────────────────────────
// Eurobelt Modular Belting Catalog Data
// Source: eurobelt.com/en/products + individual series pages
// Eurobelt (AFHER EUROBELT, S.A.) — Spain. Since 1972.
// ─────────────────────────────────────────────────────────────────────────────

export const EUROBELT_LOGO = "https://www.eurobelt.com/wp-content/uploads/2024/05/arrow-right-to-arc.svg";
export const EUROBELT_WEBSITE = "https://www.eurobelt.com/en/products/";
export const EUROBELT_CATALOG_URL = "https://www.eurobelt.com/wp-content/uploads/2025/Gama%20productos/GamaProductos_2025_ING.pdf";
export const EUROBELT_MATERIALS_URL = "https://www.eurobelt.com/wp-content/uploads/2024/03/Materiales_V.01.2024_ing.pdf";

export const EUROBELT_ACCENT = "#0066B3";

// ── Eurobelt standard materials (shared across all series) ───────────────────
export const EUROBELT_MATERIALS = {
  POM_W:  { abbr: "POM-W",  label: "POM White (Acetal)",          color: "White",   tempC: "-40 to +90",  notes: "Standard acetal. FDA compliant. General purpose." },
  POM_B:  { abbr: "POM-B",  label: "POM Blue (Acetal)",           color: "Blue",    tempC: "-40 to +90",  notes: "Blue acetal for visual detection. FDA compliant." },
  POM_G:  { abbr: "POM-G",  label: "POM Green (Acetal)",          color: "Green",   tempC: "-40 to +90",  notes: "Green acetal for food visual identification." },
  POM_GR: { abbr: "POM-GR", label: "POM Grey (Acetal)",           color: "Grey",    tempC: "-40 to +90",  notes: "Grey acetal for industrial applications." },
  POM_BK: { abbr: "POM-BK", label: "POM Black (Acetal)",           color: "Black",   tempC: "-40 to +90",  notes: "Black acetal for automotive and industrial." },
  PP_W:   { abbr: "PP-W",   label: "PP White (Polypropylene)",     color: "White",   tempC: "+1 to +90",    notes: "Lightweight polypropylene. Chemical resistant." },
  PP_G:   { abbr: "PP-G",   label: "PP Green (Polypropylene)",     color: "Green",   tempC: "+1 to +90",    notes: "Green PP for food applications." },
  PP_B:   { abbr: "PP-B",   label: "PP Blue (Polypropylene)",      color: "Blue",    tempC: "+1 to +90",    notes: "Blue PP for visual detection." },
  PP_GR:  { abbr: "PP-GR",  label: "PP Grey (Polypropylene)",      color: "Grey",    tempC: "+1 to +90",    notes: "Grey PP for industrial." },
  PBT:    { abbr: "PBT",    label: "PBT Beige",                    color: "Beige",   tempC: "-40 to +130", notes: "High-performance PBT. Superior chemical/heat resistance." },
  PE:     { abbr: "PE",     label: "PE (Polyethylene)",            color: "Natural", tempC: "-40 to +80",   notes: "Polyethylene for special applications." },
  POM_AS: { abbr: "POM-AS", label: "POM Antistatic (Acetal)",      color: "Black",   tempC: "-40 to +90",  notes: "Antistatic acetal for electronics / ATEX environments." },
  POM_DT: { abbr: "POM-DT", label: "POM Detectable (Acetal)",      color: "Blue",    tempC: "-40 to +90",  notes: "Metal/X-ray detectable acetal for food safety. HACCP compliant." },
  PP_DT:  { abbr: "PP-DT",  label: "PP Detectable (Polypropylene)", color: "Blue",   tempC: "+1 to +90",    notes: "Detectable polypropylene for food safety." },
  POM_FR: { abbr: "POM-FR", label: "POM Flame Retardant (Acetal)", color: "Black",   tempC: "-40 to +90",  notes: "Flame retardant acetal for automotive / battery transport." },
};

// ── Shared component images (sprockets + accessories) ─────────────────────────
const SPROCKET_IMG = "https://www.eurobelt.com/wp-content/uploads/2025/07/DSC_7091-scaled-e1751540535828.jpg";
const ACC_HOLD_DOWN_IMG = "https://www.eurobelt.com/wp-content/uploads/2025/07/Perfiles-de-sujecion.jpg";
const ACC_WEARSTRIP_IMG = "https://www.eurobelt.com/wp-content/uploads/2025/07/Pletinas-de-deslizamiento.jpg";

// ── Common accessories (shared) ───────────────────────────────────────────────
const COMMON_ACCESSORIES = [
  { name: "Retaining Rings", type: "ring", image: SPROCKET_IMG, notes: "Shaft retaining rings for sprocket fixation.", url: "https://www.eurobelt.com/en/bandas/common-accessories/" },
  { name: "Hold-Down Profiles", type: "hold-down", image: ACC_HOLD_DOWN_IMG, notes: "Profile guides to keep belt on track.", url: "https://www.eurobelt.com/en/bandas/common-accessories/" },
  { name: "Wearstrips", type: "wearstrip", image: ACC_WEARSTRIP_IMG, notes: "Stainless steel / UHMW wearstrips for belt support.", url: "https://www.eurobelt.com/en/bandas/common-accessories/" },
  { name: "Side Guards", type: "sideguard", image: null, notes: "Modular side guards for product containment.", url: "https://www.eurobelt.com/en/bandas/common-accessories/" },
];

// ── Helper: standard sprocket reference ──────────────────────────────────────
function sprocket(seriesName, url) {
  return [{ name: `${seriesName} Sprocket`, teeth: "Per series spec", bore: "Square / Round", material: "Polyamide (PA) / Steel", notes: `Compatible sprocket for ${seriesName}. Contact Uniking for tooth count and bore details.`, image: SPROCKET_IMG, url: url || "https://www.eurobelt.com/en/support/" }];
}

// ── All Eurobelt Series ───────────────────────────────────────────────────────
export const EUROBELT_SERIES = [
  {
    id: "SC12", name: "Series C12", beltType: "Straight-Running",
    pitch_mm: 12, pitch_in: 0.472,
    image: "https://www.eurobelt.com/wp-content/uploads/2024/03/C12-FT-render-e1718811332986.jpg",
    description: "12 mm pitch belt for small product transfers at high speeds. Open link structure makes it easy to clean. Ideal for tight transfers and hygiene-critical applications.",
    applications: ["Small product transfers", "High-speed lines", "Hygiene-critical food processing", "Bakery", "Snack foods"],
    advantages: ["Smallest pitch (12 mm)", "Open link for easy cleaning", "High-speed capable", "Tight product transfers"],
    sprockets: sprocket("Series C12"),
    accessories: COMMON_ACCESSORIES,
    url: "https://www.eurobelt.com/en/bandas/series-c12/",
    styles: [
      { key: "flat_top",   label: "C12 Flat Top",   surface: "Closed",     thickness_mm: 8,  rod_mm: 3.5, openArea: "0%",   image: "https://www.eurobelt.com/wp-content/uploads/2024/03/C12-FT-render-e1718811332986.jpg", description: "Flat closed surface for smooth product transport." },
      { key: "flush_grid", label: "C12 Flush Grid", surface: "Open Grid",  thickness_mm: 8,  rod_mm: 3.5, openArea: "22%",  image: "https://www.eurobelt.com/wp-content/uploads/2024/03/C12-FG-render-e1718811598964.webp", description: "Open grid for drainage and easy cleaning." },
    ],
  },
  {
    id: "SF12", name: "Series F12", beltType: "Straight-Running",
    pitch_mm: 12, pitch_in: 0.472,
    image: "https://www.eurobelt.com/wp-content/uploads/2024/11/F12-1.jpg",
    description: "Fully open link design facilitates very small transfers in applications requiring large open area and cleanliness. 12 mm pitch.",
    applications: ["Very small transfers", "Large open area requirements", "Washing lines", "Cooling", "Hygiene-critical processing"],
    advantages: ["Fully open link design", "Maximum open area", "Very small transfer capability", "Easy to clean"],
    sprockets: sprocket("Series F12"),
    accessories: COMMON_ACCESSORIES,
    url: "https://www.eurobelt.com/en/bandas/series-f12/",
    styles: [
      { key: "flush_grid", label: "F12 Flush Grid", surface: "Open Grid", thickness_mm: 8, rod_mm: 3.5, openArea: "45%", image: "https://www.eurobelt.com/wp-content/uploads/2024/11/F12-1.jpg", description: "Maximum open area flush grid for drainage and cleaning." },
    ],
  },
  {
    id: "SE20", name: "Series E20", beltType: "Straight-Running / Bidirectional",
    pitch_mm: 20, pitch_in: 0.787,
    image: "https://www.eurobelt.com/wp-content/uploads/2024/03/E20-FT-render-e1718866766928.jpg",
    description: "20 mm pitch bidirectional belt for conveying small products at high speeds. Widths in multiples of 8 mm. Center drive allows bi-directional operation. Handles turns up to 30 mm radius.",
    applications: ["Small product conveying", "Bi-directional conveying", "Difficult replacements", "High-speed lines", "Small radius curves"],
    advantages: ["Bi-directional (center drive)", "Widths in 8 mm increments", "Handles 30 mm radius turns", "High-speed capable", "Versatile for replacements"],
    sprockets: sprocket("Series E20"),
    accessories: COMMON_ACCESSORIES,
    url: "https://www.eurobelt.com/en/bandas/series-e20/",
    styles: [
      { key: "flat_top",         label: "E20 Flat Top",          surface: "Closed",              thickness_mm: 10, rod_mm: 4.6, openArea: "0%",    image: "https://www.eurobelt.com/wp-content/uploads/2024/03/E20-FT-render-e1718866766928.jpg", description: "Closed surface for applications without drainage needs." },
      { key: "flush_grid",       label: "E20 Flush Grid",        surface: "32% open area",       thickness_mm: 9,  rod_mm: 4.6, openArea: "32%",   image: "https://www.eurobelt.com/wp-content/uploads/2024/03/E20-FG-render-e1718868706960.webp", description: "Rounded opening for drainage and easy cleaning." },
      { key: "raised_rib",       label: "E20 Raised Rib",        surface: "32% open area",       thickness_mm: 15, rod_mm: 4.6, openArea: "32%",   image: "https://www.eurobelt.com/wp-content/uploads/2024/03/E20-RR-render-e1718868767746.webp", description: "Grille-shaped open surface with transfer fingers. Prevents product adhesion." },
      { key: "trian",            label: "E20 Trian",             surface: "Closed non-stick",    thickness_mm: 10, rod_mm: 4.6, openArea: "0%",    image: "https://www.eurobelt.com/wp-content/uploads/2024/03/E20-T-render-e1718868939452.jpg", description: "Transversal triangular edges prevent product adherence and facilitate side cleaning." },
      { key: "trian_friction",   label: "E20 Trian Friction Top", surface: "Closed non-stick",   thickness_mm: 10, rod_mm: 4.6, openArea: "0%",    image: "https://www.eurobelt.com/wp-content/uploads/2024/04/E20-TF-render-e1718869262974.webp", description: "Triangular rubber modules for maximum grip on inclines/declines." },
      { key: "sliding_rollers", label: "E20 Sliding Rollers",   surface: "Sliding rollers",     thickness_mm: 10, rod_mm: 4.6, openArea: "0%", rollerDia_mm: 15, image: "https://www.eurobelt.com/wp-content/uploads/2024/04/E20-SR-render-e1718869123363.webp", description: "Inserted rollers prevent crushing. For accumulation of boxes and containers." },
    ],
  },
  {
    id: "SA24", name: "Series A24", beltType: "Straight-Running",
    pitch_mm: 24, pitch_in: 0.945,
    image: "https://www.eurobelt.com/wp-content/uploads/2024/03/A24-FT-e1718809320327.webp",
    description: "24 mm pitch belt with easy deep cleaning. One of the most reliable traction belts on the market. Designed for hygiene-critical food applications.",
    applications: ["Deep cleaning requirements", "Food processing", "Meat & poultry", "Seafood", "Reliable traction applications"],
    advantages: ["Easy deep cleaning", "Highly reliable traction", "Food-grade design", "24 mm pitch versatility"],
    sprockets: sprocket("Series A24"),
    accessories: COMMON_ACCESSORIES,
    url: "https://www.eurobelt.com/en/bandas/series-a24/",
    styles: [
      { key: "flat_top",   label: "A24 Flat Top",   surface: "Closed",    thickness_mm: 12, rod_mm: 5, openArea: "0%",   image: "https://www.eurobelt.com/wp-content/uploads/2024/03/A24-FT-e1718809320327.webp", description: "Flat closed surface for general conveying." },
      { key: "flush_grid", label: "A24 Flush Grid", surface: "Open Grid", thickness_mm: 12, rod_mm: 5, openArea: "28%",  image: "https://www.eurobelt.com/wp-content/uploads/2024/03/A24-FG-render-e1718809150108.png", description: "Open grid for drainage and cleaning." },
    ],
  },
  {
    id: "SE30", name: "Series E30", beltType: "Straight-Running",
    pitch_mm: 30, pitch_in: 1.181,
    image: "https://www.eurobelt.com/wp-content/uploads/2024/03/E30-FT-render-e1718869517300.webp",
    description: "30 mm pitch belt with great versatility for all types of transport and lifting of small products. Wide range of surface options.",
    applications: ["General conveying", "Small product lifting", "Food processing", "Packaging", "Beverage"],
    advantages: ["30 mm versatile pitch", "Multiple surface styles", "Lifting capability", "Wide application range"],
    sprockets: sprocket("Series E30"),
    accessories: COMMON_ACCESSORIES,
    url: "https://www.eurobelt.com/en/bandas/series-e30/",
    styles: [
      { key: "flat_top",         label: "E30 Flat Top",          surface: "Closed",           thickness_mm: 14, rod_mm: 5, openArea: "0%",   image: "https://www.eurobelt.com/wp-content/uploads/2024/03/E30-FT-render-e1718869517300.webp", description: "Flat closed surface for general transport." },
      { key: "flush_grid",       label: "E30 Flush Grid",        surface: "18% open area",    thickness_mm: 14, rod_mm: 5, openArea: "18%",  image: "https://www.eurobelt.com/wp-content/uploads/2024/03/E30-FG-render-e1718869774785.jpg", description: "Grid configuration for drainage." },
      { key: "non_slip",         label: "E30 Non Slip",          surface: "Non-slip",         thickness_mm: 14, rod_mm: 5, openArea: "0%",   image: "https://www.eurobelt.com/wp-content/uploads/2024/03/E30-OG-render-e1718869930590.webp", description: "Non-slip surface for inclined conveying." },
      { key: "flat_friction",    label: "E30 Flat Friction",     surface: "Closed / Friction", thickness_mm: 14, rod_mm: 5, openArea: "0%",   image: "https://www.eurobelt.com/wp-content/uploads/2024/03/E30-FF-render-e1718870300522.webp", description: "Rubber modules with flat elevations for grip on elevators." },
      { key: "trian_friction",   label: "E30 Trian Friction",    surface: "Closed / Friction", thickness_mm: 14, rod_mm: 5, openArea: "0%",   image: "https://www.eurobelt.com/wp-content/uploads/2024/03/E30-TF-render-e1718870189554.jpg", description: "Triangular rubber modules for maximum grip and easy cleaning." },
      { key: "sliding_rollers",  label: "E30 Sliding Rollers",    surface: "Sliding rollers",  thickness_mm: 14, rod_mm: 5, openArea: "0%", rollerDia_mm: 21, image: "https://www.eurobelt.com/wp-content/uploads/2024/03/E30_SR_render-e1718870656379.webp", description: "Rollers for accumulation and anti-crush applications." },
    ],
  },
  {
    id: "SE31", name: "Series E31", beltType: "Sideflexing",
    pitch_mm: 30, pitch_in: 1.181,
    image: "https://www.eurobelt.com/wp-content/uploads/2024/03/E31-LT-render-e1718873670324.webp",
    description: "Designed for dynamic lateral transfer in applications with 90° direction changes. 30 mm pitch sideflexing belt for curve conveying.",
    applications: ["90° direction changes", "Lateral transfers", "Curve conveying", "Dynamic transfer systems"],
    advantages: ["Dynamic lateral transfer", "90° direction changes", "Sideflexing capability", "30 mm pitch"],
    sprockets: sprocket("Series E31"),
    accessories: COMMON_ACCESSORIES,
    url: "https://www.eurobelt.com/en/bandas/series-e31/",
    styles: [
      { key: "lateral_transfer", label: "E31 Lateral Transfer", surface: "Open Grid", thickness_mm: 14, rod_mm: 5, openArea: "20%", image: "https://www.eurobelt.com/wp-content/uploads/2024/03/E31-LT-render-e1718873670324.webp", description: "Dynamic lateral transfer belt for 90° direction changes." },
    ],
  },
  {
    id: "SE32", name: "Series E32", beltType: "Straight-Running",
    pitch_mm: 30, pitch_in: 1.181,
    image: "https://www.eurobelt.com/wp-content/uploads/2024/03/E32-render-e1718877492253.webp",
    description: "Perfect for conveying products on high-speed lines. 30 mm pitch with optimized design for speed and stability.",
    applications: ["High-speed conveying", "Packaging lines", "Beverage", "Logistics", "Product handling"],
    advantages: ["High-speed optimized", "Stable product handling", "30 mm pitch", "Reliable performance"],
    sprockets: sprocket("Series E32"),
    accessories: COMMON_ACCESSORIES,
    url: "https://www.eurobelt.com/en/bandas/series-e32/",
    styles: [
      { key: "flat_top",   label: "E32 Flat Top",   surface: "Closed",    thickness_mm: 14, rod_mm: 5, openArea: "0%",   image: "https://www.eurobelt.com/wp-content/uploads/2024/03/E32-render-e1718877492253.webp", description: "Flat top for high-speed product conveying." },
      { key: "flush_grid", label: "E32 Flush Grid", surface: "Open Grid", thickness_mm: 14, rod_mm: 5, openArea: "20%",  image: "https://www.eurobelt.com/wp-content/uploads/2024/03/E32-interior-render-e1718875338998.webp", description: "Flush grid for drainage on high-speed lines." },
    ],
  },
  {
    id: "SE40", name: "Series E40", beltType: "Straight-Running",
    pitch_mm: 40, pitch_in: 1.575,
    image: "https://www.eurobelt.com/wp-content/uploads/2024/03/E40-FT-render-e1718877766309.jpg",
    description: "Eurobelt's strongest straight modular belt. 40 mm pitch minimizes the polygonal effect. Strong resistant structure with central traction system for heavy loads and extreme conditions.",
    applications: ["Heavy load conveying", "Extreme conditions", "Industrial processing", "Automotive", "Bulk material handling"],
    advantages: ["Strongest Eurobelt series", "Minimizes polygonal effect", "Central traction system", "Heavy load capacity", "40 mm pitch"],
    sprockets: sprocket("Series E40"),
    accessories: COMMON_ACCESSORIES,
    url: "https://www.eurobelt.com/en/bandas/series-e40/",
    styles: [
      { key: "flat_top",         label: "E40 Flat Top",          surface: "Closed",           thickness_mm: 16, rod_mm: 6, openArea: "0%",   image: "https://www.eurobelt.com/wp-content/uploads/2024/03/E40-FT-render-e1718877766309.jpg", description: "Flat surface with great mechanical resistance for large conveyance lengths or heavy loads." },
      { key: "flush_grid",       label: "E40 Flush Grid",        surface: "14% open area",     thickness_mm: 16, rod_mm: 6, openArea: "14%",  image: "https://www.eurobelt.com/wp-content/uploads/2024/03/E40-FG-render.webp", description: "Grille-shaped configuration with excellent drainage capacity." },
      { key: "non_slip",         label: "E40 Non Slip",          surface: "Non-slip",         thickness_mm: 16, rod_mm: 6, openArea: "0%",   image: "https://www.eurobelt.com/wp-content/uploads/2024/03/E40-NON-SLIP-render-1-e1718896202295.jpg", description: "Closed non-slip surface for conveying people or assembly lines." },
      { key: "flat_friction",    label: "E40 Flat Friction",     surface: "Closed / Friction", thickness_mm: 16, rod_mm: 6, openArea: "0%",   image: "https://www.eurobelt.com/wp-content/uploads/2024/03/E40-FF-render-e1718896286508.webp", description: "Plastic and rubber modules with flat elevations for maximum grip on elevators/decliners." },
      { key: "trian_friction",   label: "E40 Trian Friction",     surface: "Closed / Friction", thickness_mm: 16, rod_mm: 6, openArea: "0%",   image: "https://www.eurobelt.com/wp-content/uploads/2024/03/E40-TF-render-e1718896357665.webp", description: "Triangular rubber modules for grip and easy cleaning on inclines." },
      { key: "sliding_rollers", label: "E40 Sliding Rollers",    surface: "Sliding rollers",  thickness_mm: 16, rod_mm: 6, openArea: "0%", rollerDia_mm: 25, image: "https://www.eurobelt.com/wp-content/uploads/2024/03/E40-SR-Render-e1718896428608.webp", description: "Inserted rollers prevent crushing and wear in accumulation applications." },
    ],
  },
  {
    id: "SE41", name: "Series E41", beltType: "Straight-Running",
    pitch_mm: 40, pitch_in: 1.575,
    image: "https://www.eurobelt.com/wp-content/uploads/2024/03/E41-render.webp",
    description: "Similar to E40, allows transfer of heavy loads and avoids overturning of containers. Specially designed for pasteurizers.",
    applications: ["Pasteurizers", "Container handling", "Heavy load transfer", "Beverage industry", "Canning"],
    advantages: ["Container stability", "Pasteurizer optimized", "Heavy load capacity", "Prevents container overturning"],
    sprockets: sprocket("Series E41"),
    accessories: COMMON_ACCESSORIES,
    url: "https://www.eurobelt.com/en/bandas/series-e41/",
    styles: [
      { key: "flat_top",   label: "E41 Flat Top",   surface: "Closed",    thickness_mm: 16, rod_mm: 6, openArea: "0%",  image: "https://www.eurobelt.com/wp-content/uploads/2024/03/E41-render.webp", description: "Flat top designed for pasteurizers. Prevents container overturning." },
      { key: "flush_grid", label: "E41 Flush Grid", surface: "Open Grid", thickness_mm: 16, rod_mm: 6, openArea: "14%", image: "https://www.eurobelt.com/wp-content/uploads/2024/03/E41-render-e1718897554822.webp", description: "Flush grid for pasteurizer drainage applications." },
    ],
  },
  {
    id: "SE50", name: "Series E50", beltType: "Straight-Running",
    pitch_mm: 50, pitch_in: 1.969,
    image: "https://www.eurobelt.com/wp-content/uploads/2024/03/E50-FT-render-e1718897734472.webp",
    description: "Great versatility combined with resistance makes it one of the most polyvalent solutions. 50 mm pitch for medium-heavy applications.",
    applications: ["General conveying", "Medium-heavy loads", "Food processing", "Industrial", "Versatile applications"],
    advantages: ["Most polyvalent series", "Versatile + resistant", "50 mm pitch", "Wide application range"],
    sprockets: sprocket("Series E50"),
    accessories: COMMON_ACCESSORIES,
    url: "https://www.eurobelt.com/en/bandas/series-e50/",
    styles: [
      { key: "flat_top",         label: "E50 Flat Top",          surface: "Closed",           thickness_mm: 18, rod_mm: 7, openArea: "0%",   image: "https://www.eurobelt.com/wp-content/uploads/2024/03/E50-FT-render-e1718897734472.webp", description: "Flat top for versatile general conveying." },
      { key: "flush_grid",       label: "E50 Flush Grid",        surface: "Open Grid",        thickness_mm: 18, rod_mm: 7, openArea: "20%",  image: "https://www.eurobelt.com/wp-content/uploads/2024/03/E50-FLUSH-GRID-render.webp", description: "Flush grid for drainage." },
      { key: "non_slip",         label: "E50 Non Slip",          surface: "Non-slip",         thickness_mm: 18, rod_mm: 7, openArea: "0%",   image: "https://www.eurobelt.com/wp-content/uploads/2024/03/E50-KNURLED-render-e1718898879493.webp", description: "Non-slip surface for inclined conveying." },
      { key: "flat_friction",    label: "E50 Flat Friction",     surface: "Closed / Friction", thickness_mm: 18, rod_mm: 7, openArea: "0%",   image: "https://www.eurobelt.com/wp-content/uploads/2024/03/E50-CF-render-e1718899029988.webp", description: "Rubber friction modules for grip on elevators." },
      { key: "trian_friction",   label: "E50 Trian Friction",    surface: "Closed / Friction", thickness_mm: 18, rod_mm: 7, openArea: "0%",   image: "https://www.eurobelt.com/wp-content/uploads/2024/03/E50-TF-render-e1718899172970.webp", description: "Triangular rubber modules for inclines with easy cleaning." },
      { key: "sliding_rollers",  label: "E50 Sliding Rollers",   surface: "Sliding rollers",  thickness_mm: 18, rod_mm: 7, openArea: "0%", rollerDia_mm: 30, image: "https://www.eurobelt.com/wp-content/uploads/2024/03/E50-SR-render-e1718950246120.webp", description: "Sliding rollers for accumulation applications." },
    ],
  },
  {
    id: "SB50", name: "Series B50", beltType: "Straight-Running",
    pitch_mm: 50, pitch_in: 1.969,
    image: "https://www.eurobelt.com/wp-content/uploads/2024/03/B50-FT-render-e1718810359765.webp",
    description: "Allows great cleaning and efficient evacuation of residues. 50 mm pitch with open design for hygiene-critical applications.",
    applications: ["Hygiene-critical processing", "Food industry", "Residue evacuation", "Washing lines", "Easy-clean applications"],
    advantages: ["Great cleaning capability", "Efficient residue evacuation", "Open hygienic design", "50 mm pitch"],
    sprockets: sprocket("Series B50"),
    accessories: COMMON_ACCESSORIES,
    url: "https://www.eurobelt.com/en/bandas/series-b50/",
    styles: [
      { key: "flat_top",   label: "B50 Flat Top",   surface: "Closed",    thickness_mm: 18, rod_mm: 7, openArea: "0%",   image: "https://www.eurobelt.com/wp-content/uploads/2024/03/B50-FT-render-e1718810359765.webp", description: "Flat top with easy-clean design." },
      { key: "flush_grid", label: "B50 Flush Grid", surface: "Open Grid", thickness_mm: 18, rod_mm: 7, openArea: "35%",  image: "https://www.eurobelt.com/wp-content/uploads/2024/03/B50-FG-render-header.webp", description: "High open area for maximum drainage and residue evacuation." },
    ],
  },
  {
    id: "SE80", name: "Series E80", beltType: "Straight-Running",
    pitch_mm: 50, pitch_in: 1.969,
    image: "https://www.eurobelt.com/wp-content/uploads/2024/03/E80-FT-render-e1718950501432.webp",
    description: "Smooth surface on both sides eliminates areas of possible accumulation of particles or residues. Ideal for hygiene-critical applications.",
    applications: ["Hygiene-critical food processing", "Dairy", "Pharmaceutical", "Cleanroom conveying", "Residue-free transport"],
    advantages: ["Smooth both sides", "No particle accumulation", "Maximum hygiene", "Easy to clean"],
    sprockets: sprocket("Series E80"),
    accessories: COMMON_ACCESSORIES,
    url: "https://www.eurobelt.com/en/bandas/series-e80/",
    styles: [
      { key: "flat_top",   label: "E80 Flat Top",   surface: "Closed (smooth both sides)", thickness_mm: 18, rod_mm: 7, openArea: "0%",  image: "https://www.eurobelt.com/wp-content/uploads/2024/03/E80-FT-render-e1718950501432.webp", description: "Smooth both sides. Eliminates residue accumulation points." },
      { key: "flush_grid", label: "E80 Flush Grid", surface: "Open Grid",                   thickness_mm: 18, rod_mm: 7, openArea: "20%", image: "https://www.eurobelt.com/wp-content/uploads/2024/03/E80-PFT-render.webp", description: "Flush grid with smooth underside for hygiene." },
    ],
  },
  {
    id: "SE925", name: "Series E925", beltType: "Sideflexing",
    pitch_mm: 25, pitch_in: 0.984,
    image: "https://www.eurobelt.com/wp-content/uploads/2024/03/E925-FG-SL-render-e1718950856989.webp",
    description: "One of the strongest and most stable solutions with minimum radius for all kinds of turns in less space. 25 mm pitch sideflexing belt.",
    applications: ["Tight radius curves", "Space-constrained turns", "Sideflexing conveying", "Multi-directional systems"],
    advantages: ["Strong + stable", "Minimum radius turns", "Space-saving curves", "Sideflexing design"],
    sprockets: sprocket("Series E925"),
    accessories: COMMON_ACCESSORIES,
    url: "https://www.eurobelt.com/en/bandas/series-e925/",
    styles: [
      { key: "flush_grid",       label: "E925 Flush Grid",        surface: "Open Grid",      thickness_mm: 12, rod_mm: 5, openArea: "25%", image: "https://www.eurobelt.com/wp-content/uploads/2024/03/E925-FG-SL-render-e1718950856989.webp", description: "Sideflexing flush grid for tight radius curves." },
      { key: "sliding_rollers",  label: "E925 Sliding Rollers",   surface: "Sliding rollers", thickness_mm: 12, rod_mm: 5, openArea: "0%", rollerDia_mm: 19, image: "https://www.eurobelt.com/wp-content/uploads/2024/03/E925-HD-render.webp", description: "Sideflexing with sliding rollers for accumulation in curves." },
    ],
  },
  {
    id: "SE930", name: "Series E930", beltType: "Sideflexing",
    pitch_mm: 30, pitch_in: 1.181,
    image: "https://www.eurobelt.com/wp-content/uploads/2024/03/E93-FG-SL-render-e1718951957208.webp",
    description: "High resistance with a highly permeable structure that allows great drainage and high cleanliness. 30 mm pitch sideflexing belt.",
    applications: ["Drainage-critical curves", "Washing in curves", "Food processing curves", "Sideflexing with drainage"],
    advantages: ["High resistance", "Highly permeable", "Great drainage", "High cleanliness", "Sideflexing"],
    sprockets: sprocket("Series E930"),
    accessories: COMMON_ACCESSORIES,
    url: "https://www.eurobelt.com/en/bandas/series-e930/",
    styles: [
      { key: "flush_grid",       label: "E930 Flush Grid",       surface: "Open Grid",      thickness_mm: 14, rod_mm: 5, openArea: "30%", image: "https://www.eurobelt.com/wp-content/uploads/2024/03/E93-FG-SL-render-e1718951957208.webp", description: "Highly permeable sideflexing flush grid for drainage." },
      { key: "sliding_rollers",  label: "E930 Sliding Rollers", surface: "Sliding rollers", thickness_mm: 14, rod_mm: 5, openArea: "0%", rollerDia_mm: 21, image: "https://www.eurobelt.com/wp-content/uploads/2024/03/E93-SR-render-e1718952511351.webp", description: "Sideflexing sliding rollers for accumulation curves." },
    ],
  },
  {
    id: "SQ50", name: "Series Q50 (Quickbelts)", beltType: "Straight-Running / No Rods",
    pitch_mm: 50, pitch_in: 1.969,
    image: "https://www.eurobelt.com/wp-content/uploads/2024/03/Q50-render-e1718786545739.jpg",
    description: "Quickbelts — the new generation of belts without connecting rods. Quick and easy to assemble. No rods required, reducing maintenance time.",
    applications: ["Quick assembly", "Low maintenance", "General conveying", "Food processing", "Applications requiring frequent disassembly"],
    advantages: ["No connecting rods", "Quick assembly", "Easy to disassemble", "Low maintenance", "New generation design"],
    sprockets: sprocket("Series Q50"),
    accessories: COMMON_ACCESSORIES,
    url: "https://www.eurobelt.com/en/bandas/series-q50/",
    styles: [
      { key: "flat_top",   label: "Q50 Flat Top",   surface: "Closed",    thickness_mm: 18, rod_mm: 0, openArea: "0%",  image: "https://www.eurobelt.com/wp-content/uploads/2024/03/Q50-render-e1718786545739.jpg", description: "No-rod quickbelt flat top for rapid assembly." },
      { key: "flush_grid", label: "Q50 Flush Grid", surface: "Open Grid", thickness_mm: 18, rod_mm: 0, openArea: "25%", image: "https://www.eurobelt.com/wp-content/uploads/2024/03/Q50-3-modulos.png", description: "No-rod quickbelt flush grid for drainage with rapid assembly." },
    ],
  },
  {
    id: "SD50", name: "Series D50", beltType: "Straight-Running",
    pitch_mm: 50, pitch_in: 1.969,
    image: "https://www.eurobelt.com/wp-content/uploads/2025/06/D50-roller-90.1-1-1024x714.jpg",
    description: "Designed to optimise transfers and improve product flow in demanding industrial environments. Exclusive design maximises strength, durability and dimensional stability.",
    applications: ["Demanding industrial environments", "Transfer optimization", "Product flow improvement", "Heavy industrial"],
    advantages: ["Optimised transfers", "Maximised strength", "Dimensional stability", "Exclusive design", "High durability"],
    sprockets: sprocket("Series D50"),
    accessories: COMMON_ACCESSORIES,
    url: "https://www.eurobelt.com/en/bandas/series-d50/",
    styles: [
      { key: "flat_top",         label: "D50 Flat Top",          surface: "Closed",           thickness_mm: 18, rod_mm: 7, openArea: "0%",   image: "https://www.eurobelt.com/wp-content/uploads/2025/05/D50-FG-scaled-e1748879617746.jpg", description: "Flat top optimised for product flow and transfers." },
      { key: "flush_grid",       label: "D50 Flush Grid",        surface: "Open Grid",        thickness_mm: 18, rod_mm: 7, openArea: "25%",  image: "https://www.eurobelt.com/wp-content/uploads/2025/05/D50-FG-scaled-e1748879617746.jpg", description: "Flush grid for drainage in demanding environments." },
      { key: "sliding_rollers",  label: "D50 Sliding Rollers",   surface: "Sliding rollers",  thickness_mm: 18, rod_mm: 7, openArea: "0%", rollerDia_mm: 30, image: "https://www.eurobelt.com/wp-content/uploads/2025/06/D50-roller-90.1-1-scaled-e1749137999855.jpg", description: "Roller top for accumulation and product flow." },
    ],
  },
];

export const EUROBELT_STRAIGHT_SERIES = EUROBELT_SERIES.filter(s => !s.beltType.includes("Sideflexing"));
export const EUROBELT_SIDEFLEXING_SERIES = EUROBELT_SERIES.filter(s => s.beltType.includes("Sideflexing"));

export const EUROBELT_INDUSTRIES = [
  "Food Processing", "Meat & Poultry", "Seafood", "Bakery & Snack", "Dairy",
  "Beverage", "Automotive", "Packaging", "Logistics", "Pharmaceutical", "Industrial", "Other",
];