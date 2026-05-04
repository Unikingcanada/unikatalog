// ─────────────────────────────────────────────────────────────────────────────
// Intralox Flight & Attachment Data — sourced from official Intralox Belt Finder
// Source: intralox.com/belt-finder (verified May 2026)
// ─────────────────────────────────────────────────────────────────────────────

const CDN = "https://assets-us-01.kc-usercontent.com/19eb64b5-1815-003a-d268-e7109927ccad/";

// ── Indent Options (catalog-sourced) ─────────────────────────────────────────
// "Indent" = distance from edge of belt to edge of flight module
export const INDENT_OPTIONS = [
  {
    key: "1.3_in",
    label: '1.3" (33 mm) — Standard minimum indent',
    in: 1.3,
    mm: 33,
    notes: "Minimum indent without sideguards. Standard for most applications.",
  },
  {
    key: "2_in",
    label: '2" (51 mm) — Available on Heavy-Duty Edge Flights',
    in: 2,
    mm: 51,
    notes: "Available on Heavy-Duty Edge Flights. Contact Intralox for guidance.",
  },
  {
    key: "custom",
    label: "Custom indent — specify",
    in: null,
    mm: null,
    notes: "Contact Intralox Customer Service for custom indent options.",
  },
];

export const INDENT_PLACEMENT_OPTIONS = [
  { key: "left", label: "Indent Left side only" },
  { key: "right", label: "Indent Right side only" },
  { key: "both", label: "Indent Both sides (symmetric)" },
  { key: "alternating", label: "Alternating — Left/Right on alternate flights" },
  { key: "none", label: "No indent (full-width flight)" },
];

// ── Friction Top Insert Options ───────────────────────────────────────────────
export const FRICTION_TOP_OPTIONS = [
  { key: "full_width", label: "Full-width friction top (no indent)" },
  { key: "indent_1_3_left", label: 'Indent 1.3" (33 mm) from left edge' },
  { key: "indent_1_3_right", label: 'Indent 1.3" (33 mm) from right edge' },
  { key: "indent_1_3_both", label: 'Indent 1.3" (33 mm) both sides' },
  { key: "indent_2_left", label: 'Indent 2" (51 mm) from left edge' },
  { key: "indent_2_right", label: 'Indent 2" (51 mm) from right edge' },
  { key: "indent_2_both", label: 'Indent 2" (51 mm) both sides' },
  { key: "alternating_1_3", label: 'Alternating 1.3" (33 mm) indent — Left/Right' },
];

// ── Flight Type Definitions per Series ───────────────────────────────────────
// Each series has an array of flight types it supports, sourced from Intralox Belt Finder.

export const SERIES_FLIGHTS = {
  S800: {
    seriesNote: "Series 800 supports the widest range of flights in the Intralox MPB line.",
    flightTypes: [
      {
        key: "streamline",
        name: "Streamline Flights",
        description: "Smooth on both sides. Molded as one part from belt center — no fasteners. Can be bent at 45° with a welded extension. Custom heights available.",
        category: "flight",
        availableHeightsIn: [1, 2, 3, 4, 6],
        availableHeightsMm: [25, 51, 76, 102, 152],
        customHeightAvailable: true,
        customHeightMinIn: 0.5,
        materials: ["Polypropylene", "Polyethylene", "Acetal", "Nylon"],
        indentOptions: ["1.3_in"],
        indentPlacements: ["left", "right", "both", "alternating", "none"],
        minIndentIn: 1.3,
        minIndentMm: 33,
        image: CDN + "46af90da-d259-4885-a933-ff7f6cb7af5c/5014239_DSCF1899_S800%20Flat%20Top%20Base%20Flights%20%28No-Cling%29.jpg?w=568&h=298.2&rect=&fit=crop&q=85&auto=format",
        cadUrl: "https://www.intralox.com/belt-finder/modular-plastic-belting/series-800/streamline-flights",
        catalogPage: null,
        notes: ["Minimum indent without sideguards: 1.3 in (33 mm)", "Custom heights available — contact Intralox Customer Service"],
      },
      {
        key: "scoop",
        name: "Scoop Flights",
        description: "Curved scoop profile for incline conveying and product elevation. Molded as one part — no fasteners. Bucket flights and scoop flights can be combined.",
        category: "flight",
        availableHeightsIn: [3, 4, 6],
        availableHeightsMm: [76, 102, 152],
        customHeightAvailable: false,
        materials: ["Acetal", "Polyethylene", "Polypropylene", "ChemBlox™", "Nylon", "PK"],
        indentOptions: ["1.3_in"],
        indentPlacements: ["left", "right", "both", "alternating"],
        minIndentIn: 1.3,
        minIndentMm: 33,
        image: CDN + "a0acf192-d1aa-450a-b5c8-08f14d56c0fa/5014239_DSCF1930_S800%20Scoop%20Flights.jpg?w=568&h=298.2&rect=&fit=crop&q=85&auto=format",
        cadUrl: "https://www.intralox.com/belt-finder/modular-plastic-belting/series-800/scoop-flights",
        cadFiles: [
          { label: "Scoop 3\" (Imperial) DXF", url: "https://assets-us-01.kc-usercontent.com/19eb64b5-1815-003a-d268-e7109927ccad/97249f18-34da-470c-8342-a51abd6f2d0d/S800_Flight_Scoop_3inch_%28Imperial%29.dxf" },
          { label: "Scoop 3\" (Metric) DXF", url: "https://assets-us-01.kc-usercontent.com/19eb64b5-1815-003a-d268-e7109927ccad/d2f17e0f-b47a-4100-aac2-d0c871b1d041/S800_Flight_Scoop_3inch_%28Metric%29.dxf" },
          { label: "Scoop 4\" (Imperial) DXF", url: "https://assets-us-01.kc-usercontent.com/19eb64b5-1815-003a-d268-e7109927ccad/5a5be9b7-e3b6-48ad-ba2b-28d337ddaa4e/S800_Flight_Scoop_4inch_%28Imperial%29.dxf" },
          { label: "Scoop 4\" (Metric) DXF", url: "https://assets-us-01.kc-usercontent.com/19eb64b5-1815-003a-d268-e7109927ccad/e8fbd43d-6262-4927-976f-35f4dc4b55ba/S800_Flight_Scoop_4inch_%28Metric%29.dxf" },
          { label: "Scoop 6\" (Imperial) DXF", url: "https://assets-us-01.kc-usercontent.com/19eb64b5-1815-003a-d268-e7109927ccad/343bebfc-d08d-4eb8-8431-f6316b6df0ce/S800_Flight_Scoop_6inch_%28Imperial%29.dxf" },
          { label: "Scoop 6\" (Metric) DXF", url: "https://assets-us-01.kc-usercontent.com/19eb64b5-1815-003a-d268-e7109927ccad/701a1420-03c0-443b-9c87-e85b99ed8e3c/S800_Flight_Scoop_6inch_%28Metric%29.dxf" },
        ],
        notes: ["Minimum indent: 1.3 in (33 mm)", "Can be combined with bucket flights for custom belt builds"],
      },
      {
        key: "heavy_duty_edge",
        name: "Heavy-Duty Edge Flights",
        description: "Molded from center of module — no fasteners. Available with 1.3\" or 2\" molded indent. Can be cut down to custom heights (min 1.0\").",
        category: "flight",
        availableHeightsIn: [4],
        availableHeightsMm: [102],
        customHeightAvailable: true,
        customHeightMinIn: 1.0,
        customHeightMinMm: 25.4,
        materials: ["PK", "Acetal"],
        indentOptions: ["1.3_in", "2_in"],
        indentPlacements: ["left", "right", "both", "alternating"],
        minIndentIn: 1.3,
        minIndentMm: 33,
        image: CDN + "12bb5e4d-8964-481a-8e67-cbd14600f18b/5014239_DSCF1972_S800%20Heavy%20Duty%20Edge%20Flights.jpg?w=568&h=298.2&rect=&fit=crop&q=85&auto=format",
        cadUrl: "https://www.intralox.com/belt-finder/modular-plastic-belting/series-800/heavy-duty-edge-flights",
        notes: ["Available with 1.3\" (33 mm) and 2\" (51 mm) molded indent", "Minimum cut height: 1.0\" (25.4 mm)", "Contact Intralox Customer Service for indent guidelines"],
      },
      {
        key: "heavy_duty_edge_scoop",
        name: "Heavy-Duty Edge Scoop Flights",
        description: "Scoop-profiled heavy-duty edge flights for challenging incline and elevation applications.",
        category: "flight",
        availableHeightsIn: [4, 6],
        availableHeightsMm: [102, 152],
        customHeightAvailable: false,
        materials: ["Acetal", "PK"],
        indentOptions: ["1.3_in", "2_in"],
        indentPlacements: ["left", "right", "both", "alternating"],
        minIndentIn: 1.3,
        minIndentMm: 33,
        image: CDN + "d7973739-9713-477d-a383-15b27c328558/5012156_DSCF1374_S800%20Heavy-Duty%20Edge%20Scoop%20Flight.jpg?w=568&h=298.2&rect=&fit=crop&q=85&auto=format",
        cadUrl: "https://www.intralox.com/belt-finder/modular-plastic-belting/series-800/heavy-duty-edge-scoop-flights",
        notes: ["For heavy-duty incline and scoop conveying", "Contact Intralox for availability"],
      },
      {
        key: "bucket",
        name: "Bucket Flights",
        description: "Deep bucket profile for holding and elevating product. Can be combined with scoop flights.",
        category: "flight",
        availableHeightsIn: [3, 4, 6],
        availableHeightsMm: [76, 102, 152],
        customHeightAvailable: false,
        materials: ["Acetal", "Polyethylene", "Polypropylene", "Nylon"],
        indentOptions: ["1.3_in"],
        indentPlacements: ["left", "right", "both", "alternating", "none"],
        minIndentIn: 1.3,
        minIndentMm: 33,
        image: CDN + "c87b7b8c-dbd2-4493-ab8f-5e51e9f06ebd/5014239_DSCF1917_S800%20Bucket%20Flights.jpg?w=568&h=298.2&rect=&fit=crop&q=85&auto=format",
        cadUrl: "https://www.intralox.com/belt-finder/modular-plastic-belting/series-800/bucket-flights",
        notes: ["Can be combined with scoop flights for custom belt builds"],
      },
      {
        key: "tough",
        name: "Tough Flights",
        description: "Designed for heavy-impact applications where extra flight durability is required.",
        category: "flight",
        availableHeightsIn: [2, 3, 4, 6],
        availableHeightsMm: [51, 76, 102, 152],
        customHeightAvailable: false,
        materials: ["Polypropylene", "Acetal"],
        indentOptions: ["1.3_in"],
        indentPlacements: ["left", "right", "both", "alternating", "none"],
        minIndentIn: 1.3,
        minIndentMm: 33,
        image: CDN + "a7cc4e73-e137-41c8-bfb0-ab8f54f0ffce/5014239_DSCF1945_S800%20Tough%20Flights.jpg?w=568&h=298.2&rect=&fit=crop&q=85&auto=format",
        cadUrl: "https://www.intralox.com/belt-finder/modular-plastic-belting/series-800/tough-flights",
        notes: ["Recommended for abrasive or heavy-impact products"],
      },
      {
        key: "impact_resistant",
        name: "Impact Resistant Flights",
        description: "Absorbs impact from heavy or irregularly-shaped products. Open hinge variant also available.",
        category: "flight",
        availableHeightsIn: [2, 3, 4],
        availableHeightsMm: [51, 76, 102],
        customHeightAvailable: false,
        materials: ["Polypropylene", "Acetal"],
        indentOptions: ["1.3_in"],
        indentPlacements: ["left", "right", "both", "alternating", "none"],
        minIndentIn: 1.3,
        minIndentMm: 33,
        image: CDN + "22f9f174-f29a-4b0d-ab6f-562825f8264c/5014239_DSCF1902_S800%20Impact%20Resistant%20Flights.jpg?w=568&h=298.2&rect=&fit=crop&q=85&auto=format",
        cadUrl: "https://www.intralox.com/belt-finder/modular-plastic-belting/series-800/impact-resistant-flights",
        notes: [],
      },
    ],
    cadDownloads: [
      { label: "S800 Flat Top Flush Edge 4\" (Imperial) DXF", url: "https://assets-us-01.kc-usercontent.com/19eb64b5-1815-003a-d268-e7109927ccad/e9c01919-0ac3-4fee-bf63-808565b2700c/S800_FlatTop_FlushEdge_4inch_%28Imperial%29.dxf" },
      { label: "S800 Flat Top Flush Edge 4\" (Metric) DXF", url: "https://assets-us-01.kc-usercontent.com/19eb64b5-1815-003a-d268-e7109927ccad/a3e41193-4cb4-4d5e-b4fa-557f5d27f94f/S800_FlatTop_FlushEdge_4inch_%28Metric%29.dxf" },
      { label: "S800 Flat Top Flush Edge 6\" (Imperial) DXF", url: "https://assets-us-01.kc-usercontent.com/19eb64b5-1815-003a-d268-e7109927ccad/4f47d3e7-16f8-4f5e-9eea-714d16c7d63c/S800_FlatTop_FlushEdge_6inch_%28Imperial%29.dxf" },
      { label: "S800 Flat Top Flush Edge 6\" (Metric) DXF", url: "https://assets-us-01.kc-usercontent.com/19eb64b5-1815-003a-d268-e7109927ccad/1782ab6b-b9d3-444b-84c9-6e3f7a78d2fc/S800_FlatTop_FlushEdge_6inch_%28Metric%29.dxf" },
      { label: "S800 Flat Top Interior 4\" (Imperial) DXF", url: "https://assets-us-01.kc-usercontent.com/19eb64b5-1815-003a-d268-e7109927ccad/ab05d4f4-d0d4-455c-bfae-bd49b251e854/S800_FlatTop_Interior_4inch_%28Imperial%29.dxf" },
      { label: "S800 Flat Top Interior 4\" (Metric) DXF", url: "https://assets-us-01.kc-usercontent.com/19eb64b5-1815-003a-d268-e7109927ccad/0b02ebd7-c014-4ab3-841b-77c131b4c631/S800_FlatTop_Interior_4inch_%28Metric%29.dxf" },
      { label: "S800 Flat Top Interior 6\" (Imperial) DXF", url: "https://assets-us-01.kc-usercontent.com/19eb64b5-1815-003a-d268-e7109927ccad/4603e5cf-c0a0-4107-8129-805a892b79c9/S800_FlatTop_Interior_6inch_%28Imperial%29.dxf" },
      { label: "S800 Flat Top Interior 6\" (Metric) DXF", url: "https://assets-us-01.kc-usercontent.com/19eb64b5-1815-003a-d268-e7109927ccad/db461cf8-db4d-4e92-9f80-af7c1228cd7b/S800_FlatTop_Interior_6inch_%28Metric%29.dxf" },
      { label: "S800 Flat Top w/ Molded Sideguard 6\" (Imperial) DXF", url: "https://assets-us-01.kc-usercontent.com/19eb64b5-1815-003a-d268-e7109927ccad/49d615d3-e1ee-484f-ba94-3c1f8a4de4ac/S800_FlatTop_FlushEdge_MoldedSideguard_6inch_%28Imperial%29.dxf" },
      { label: "S800 Flat Top w/ Molded Sideguard 6\" (Metric) DXF", url: "https://assets-us-01.kc-usercontent.com/19eb64b5-1815-003a-d268-e7109927ccad/411304f7-1a6d-48a5-b494-42d4db69926a/S800_FlatTop_FlushEdge_MoldedSideguard_6inch_%28Metric%29.dxf" },
      { label: "Streamline 1\" 4\" Module (Imperial) DXF", url: "https://assets-us-01.kc-usercontent.com/19eb64b5-1815-003a-d268-e7109927ccad/80c06970-8821-40f0-be5f-c1d704cb3da8/S800_Flight_StreamLine_1inch_4inchModule_%28Imperial%29.dxf" },
      { label: "Streamline 1\" 4\" Module (Metric) DXF", url: "https://assets-us-01.kc-usercontent.com/19eb64b5-1815-003a-d268-e7109927ccad/0f1b12f0-e240-4ac6-a0ce-238afd824875/S800_Flight_StreamLine_1inch_4inchModule_%28Metric%29.dxf" },
      { label: "Streamline 2\" 6\" Module (Imperial) DXF", url: "https://assets-us-01.kc-usercontent.com/19eb64b5-1815-003a-d268-e7109927ccad/82ec5bfb-a9f9-4b5f-89a3-aedfe12c623a/S800_Flight_StreamLine_2inch_6inchModule_%28Imperial%29.dxf" },
      { label: "Streamline 3\" 6\" Module (Imperial) DXF", url: "https://assets-us-01.kc-usercontent.com/19eb64b5-1815-003a-d268-e7109927ccad/49a1feef-e2eb-45dd-b041-679270ecdc50/S800_Flight_StreamLine_3inch_6inchModule_%28Imperial%29.dxf" },
      { label: "Streamline 4\" 6\" Module (Imperial) DXF", url: "https://assets-us-01.kc-usercontent.com/19eb64b5-1815-003a-d268-e7109927ccad/3d3f0959-e015-4744-99eb-14b8dd7b471b/S800_Flight_StreamLine_4inch_6inchModule_%28Imperial%29.dxf" },
      { label: "Streamline 6\" 6\" Module (Imperial) DXF", url: "https://assets-us-01.kc-usercontent.com/19eb64b5-1815-003a-d268-e7109927ccad/719f20f2-9564-468b-9cf5-a44999a94226/S800_Flight_StreamLine_6inch_6inchModule_%28Imperial%29.dxf" },
      { label: "Scoop Flight 3\" (Imperial) DXF", url: "https://assets-us-01.kc-usercontent.com/19eb64b5-1815-003a-d268-e7109927ccad/97249f18-34da-470c-8342-a51abd6f2d0d/S800_Flight_Scoop_3inch_%28Imperial%29.dxf" },
      { label: "Scoop Flight 4\" (Imperial) DXF", url: "https://assets-us-01.kc-usercontent.com/19eb64b5-1815-003a-d268-e7109927ccad/5a5be9b7-e3b6-48ad-ba2b-28d337ddaa4e/S800_Flight_Scoop_4inch_%28Imperial%29.dxf" },
      { label: "Scoop Flight 6\" (Imperial) DXF", url: "https://assets-us-01.kc-usercontent.com/19eb64b5-1815-003a-d268-e7109927ccad/343bebfc-d08d-4eb8-8431-f6316b6df0ce/S800_Flight_Scoop_6inch_%28Imperial%29.dxf" },
    ],
  },

  S1100: {
    seriesNote: "Series 1100 supports Streamline Flat Top Base Flights and Flush Grid Base Flights.",
    flightTypes: [
      {
        key: "streamline_flatop_base",
        name: "Flat Top Base Flights (Streamline)",
        description: "Smooth streamline flights for flat top belt — for incline conveying. Each flight is one molded piece from belt center.",
        category: "flight",
        availableHeightsIn: [1, 2, 3],
        availableHeightsMm: [25, 51, 76],
        customHeightAvailable: true,
        materials: ["Polypropylene", "Acetal"],
        indentOptions: ["1.3_in"],
        indentPlacements: ["left", "right", "both", "alternating", "none"],
        minIndentIn: 1.3,
        minIndentMm: 33,
        image: CDN + "2466a77a-96d1-46b2-b3aa-3a42cd664acf/5014239_28DTA28188_S1100%20Flush%20Grid%20Streamline%20Base%20Flight.jpg?w=568&h=298.2&rect=&fit=crop&q=85&auto=format",
        cadUrl: "https://www.intralox.com/belt-finder/modular-plastic-belting/series-1100/flat-top-base-flights-streamline",
        notes: ["Contact Intralox for custom heights", "Minimum indent: 1.3 in (33 mm)"],
      },
    ],
    cadDownloads: [],
  },

  S1400: {
    seriesNote: "Series 1400 supports Flat Top Base Flights (Streamline).",
    flightTypes: [
      {
        key: "streamline_base",
        name: "Flat Top Base Flights (Streamline)",
        description: "Streamline flights smooth on both sides. Each flight extends from center of module, molded as one part. No fasteners required.",
        category: "flight",
        availableHeightsIn: [1, 2, 3, 4],
        availableHeightsMm: [25, 51, 76, 102],
        customHeightAvailable: false,
        materials: ["Polypropylene", "Acetal"],
        indentOptions: ["1.3_in"],
        indentPlacements: ["left", "right", "both", "alternating", "none"],
        minIndentIn: 1.3,
        minIndentMm: 33,
        image: null,
        cadUrl: "https://www.intralox.com/belt-finder/modular-plastic-belting/series-1400/flat-top-base-flights-streamline",
        notes: ["Each flight extends from the center of the module, molded as one part", "No fasteners required"],
      },
    ],
    cadDownloads: [],
  },

  // Default for series with no specific flight data (generic guidance)
  DEFAULT: {
    seriesNote: "Flight availability for this series is to be confirmed by Uniking. Please describe your requirements.",
    flightTypes: [],
    cadDownloads: [],
  },
};

// ── CAD Downloads per Series (belt styles + sprockets) ─────────────────────────
export const SERIES_CAD_DOWNLOADS = {
  S800: [
    {
      group: "Flat Top Belt Profiles",
      files: [
        { label: "Flat Top Flush Edge 4\" (Imperial)", url: "https://assets-us-01.kc-usercontent.com/19eb64b5-1815-003a-d268-e7109927ccad/e9c01919-0ac3-4fee-bf63-808565b2700c/S800_FlatTop_FlushEdge_4inch_%28Imperial%29.dxf", type: "DXF" },
        { label: "Flat Top Flush Edge 4\" (Metric)", url: "https://assets-us-01.kc-usercontent.com/19eb64b5-1815-003a-d268-e7109927ccad/a3e41193-4cb4-4d5e-b4fa-557f5d27f94f/S800_FlatTop_FlushEdge_4inch_%28Metric%29.dxf", type: "DXF" },
        { label: "Flat Top Flush Edge 6\" (Imperial)", url: "https://assets-us-01.kc-usercontent.com/19eb64b5-1815-003a-d268-e7109927ccad/4f47d3e7-16f8-4f5e-9eea-714d16c7d63c/S800_FlatTop_FlushEdge_6inch_%28Imperial%29.dxf", type: "DXF" },
        { label: "Flat Top Flush Edge 6\" (Metric)", url: "https://assets-us-01.kc-usercontent.com/19eb64b5-1815-003a-d268-e7109927ccad/1782ab6b-b9d3-444b-84c9-6e3f7a78d2fc/S800_FlatTop_FlushEdge_6inch_%28Metric%29.dxf", type: "DXF" },
        { label: "Flat Top Interior 4\" (Imperial)", url: "https://assets-us-01.kc-usercontent.com/19eb64b5-1815-003a-d268-e7109927ccad/ab05d4f4-d0d4-455c-bfae-bd49b251e854/S800_FlatTop_Interior_4inch_%28Imperial%29.dxf", type: "DXF" },
        { label: "Flat Top Interior 4\" (Metric)", url: "https://assets-us-01.kc-usercontent.com/19eb64b5-1815-003a-d268-e7109927ccad/0b02ebd7-c014-4ab3-841b-77c131b4c631/S800_FlatTop_Interior_4inch_%28Metric%29.dxf", type: "DXF" },
        { label: "Flat Top Interior 6\" (Imperial)", url: "https://assets-us-01.kc-usercontent.com/19eb64b5-1815-003a-d268-e7109927ccad/4603e5cf-c0a0-4107-8129-805a892b79c9/S800_FlatTop_Interior_6inch_%28Imperial%29.dxf", type: "DXF" },
        { label: "Flat Top Interior 6\" (Metric)", url: "https://assets-us-01.kc-usercontent.com/19eb64b5-1815-003a-d268-e7109927ccad/db461cf8-db4d-4e92-9f80-af7c1228cd7b/S800_FlatTop_Interior_6inch_%28Metric%29.dxf", type: "DXF" },
        { label: "Flat Top Heavy Duty Flush Edge 6\" (Imperial)", url: "https://assets-us-01.kc-usercontent.com/19eb64b5-1815-003a-d268-e7109927ccad/517e315e-0a1a-4e07-900d-2b748c45bfb4/s800_FlatTop_HeavyDuty_FlushEdge_6inch_%28Imperial%29.dxf", type: "DXF" },
        { label: "Flat Top Heavy Duty Flush Edge 6\" (Metric)", url: "https://assets-us-01.kc-usercontent.com/19eb64b5-1815-003a-d268-e7109927ccad/a46531d2-8fe2-4b98-baf1-b26ca51deeb2/S800_FlatTop_HeavyDuty_FlushEdge_6inch_%28Metric%29.dxf", type: "DXF" },
        { label: "Flat Top w/ Molded Sideguard 6\" (Imperial)", url: "https://assets-us-01.kc-usercontent.com/19eb64b5-1815-003a-d268-e7109927ccad/49d615d3-e1ee-484f-ba94-3c1f8a4de4ac/S800_FlatTop_FlushEdge_MoldedSideguard_6inch_%28Imperial%29.dxf", type: "DXF" },
        { label: "Flat Top w/ Molded Sideguard 6\" (Metric)", url: "https://assets-us-01.kc-usercontent.com/19eb64b5-1815-003a-d268-e7109927ccad/411304f7-1a6d-48a5-b494-42d4db69926a/S800_FlatTop_FlushEdge_MoldedSideguard_6inch_%28Metric%29.dxf", type: "DXF" },
        { label: "Interior w/ Molded Sideguard 6\" (Imperial)", url: "https://assets-us-01.kc-usercontent.com/19eb64b5-1815-003a-d268-e7109927ccad/88903815-6aa0-4dfa-a98c-972d81bc9c83/S800_FlatTop_Interior_MoldedSideguard_6inch_%20%28Imperial%29.dxf", type: "DXF" },
        { label: "Interior w/ Molded Sideguard 6\" (Metric)", url: "https://assets-us-01.kc-usercontent.com/19eb64b5-1815-003a-d268-e7109927ccad/055f5202-6a24-4a2a-9742-25440092f3f7/S800_FlatTop_Interior_MoldedSideguard_6inch_%20%28Metric%29.dxf", type: "DXF" },
      ]
    },
    {
      group: "Streamline Flights",
      files: [
        { label: "Streamline 1\" 4\" Module (Imperial)", url: "https://assets-us-01.kc-usercontent.com/19eb64b5-1815-003a-d268-e7109927ccad/80c06970-8821-40f0-be5f-c1d704cb3da8/S800_Flight_StreamLine_1inch_4inchModule_%28Imperial%29.dxf", type: "DXF" },
        { label: "Streamline 1\" 4\" Module (Metric)", url: "https://assets-us-01.kc-usercontent.com/19eb64b5-1815-003a-d268-e7109927ccad/0f1b12f0-e240-4ac6-a0ce-238afd824875/S800_Flight_StreamLine_1inch_4inchModule_%28Metric%29.dxf", type: "DXF" },
        { label: "Streamline 2\" 4\" Module (Imperial)", url: "https://assets-us-01.kc-usercontent.com/19eb64b5-1815-003a-d268-e7109927ccad/3689634f-c6de-4378-91ad-138ea6e13b23/S800_Flight_StreamLine_2inch_4inchModule_%28Imperial%29.dxf", type: "DXF" },
        { label: "Streamline 3\" 4\" Module (Imperial)", url: "https://assets-us-01.kc-usercontent.com/19eb64b5-1815-003a-d268-e7109927ccad/7dfc8743-4876-447e-bd78-3bcdcc0e7ace/S800_Flight_StreamLine_3inch_4inchModule_%28Imperial%29.dxf", type: "DXF" },
        { label: "Streamline 4\" 4\" Module (Imperial)", url: "https://assets-us-01.kc-usercontent.com/19eb64b5-1815-003a-d268-e7109927ccad/0003cbc8-ff6b-467f-ae1b-feb64d8b0ff0/S800_Flight_StreamLine_4inch_4inchModule_%28Imperial%29.dxf", type: "DXF" },
        { label: "Streamline 6\" 4\" Module (Imperial)", url: "https://assets-us-01.kc-usercontent.com/19eb64b5-1815-003a-d268-e7109927ccad/4fb00a0d-6f09-4ef5-b60c-7bb3b5da439c/S800_Flight_StreamLine_6inch_4inchModule_%28Imperial%29.dxf", type: "DXF" },
        { label: "Streamline 1\" 6\" Module (Imperial)", url: "https://assets-us-01.kc-usercontent.com/19eb64b5-1815-003a-d268-e7109927ccad/f1176f6d-6549-4ebd-bded-f874347ebc07/S800_Flight_StreamLine_1inch_6inchModule_%28Imperial%29.dxf", type: "DXF" },
        { label: "Streamline 2\" 6\" Module (Imperial)", url: "https://assets-us-01.kc-usercontent.com/19eb64b5-1815-003a-d268-e7109927ccad/82ec5bfb-a9f9-4b5f-89a3-aedfe12c623a/S800_Flight_StreamLine_2inch_6inchModule_%28Imperial%29.dxf", type: "DXF" },
        { label: "Streamline 3\" 6\" Module (Imperial)", url: "https://assets-us-01.kc-usercontent.com/19eb64b5-1815-003a-d268-e7109927ccad/49a1feef-e2eb-45dd-b041-679270ecdc50/S800_Flight_StreamLine_3inch_6inchModule_%28Imperial%29.dxf", type: "DXF" },
        { label: "Streamline 4\" 6\" Module (Imperial)", url: "https://assets-us-01.kc-usercontent.com/19eb64b5-1815-003a-d268-e7109927ccad/3d3f0959-e015-4744-99eb-14b8dd7b471b/S800_Flight_StreamLine_4inch_6inchModule_%28Imperial%29.dxf", type: "DXF" },
        { label: "Streamline 6\" 6\" Module (Imperial)", url: "https://assets-us-01.kc-usercontent.com/19eb64b5-1815-003a-d268-e7109927ccad/719f20f2-9564-468b-9cf5-a44999a94226/S800_Flight_StreamLine_6inch_6inchModule_%28Imperial%29.dxf", type: "DXF" },
      ]
    },
    {
      group: "Scoop Flights",
      files: [
        { label: "Scoop Flight 3\" (Imperial)", url: "https://assets-us-01.kc-usercontent.com/19eb64b5-1815-003a-d268-e7109927ccad/97249f18-34da-470c-8342-a51abd6f2d0d/S800_Flight_Scoop_3inch_%28Imperial%29.dxf", type: "DXF" },
        { label: "Scoop Flight 3\" (Metric)", url: "https://assets-us-01.kc-usercontent.com/19eb64b5-1815-003a-d268-e7109927ccad/d2f17e0f-b47a-4100-aac2-d0c871b1d041/S800_Flight_Scoop_3inch_%28Metric%29.dxf", type: "DXF" },
        { label: "Scoop Flight 4\" (Imperial)", url: "https://assets-us-01.kc-usercontent.com/19eb64b5-1815-003a-d268-e7109927ccad/5a5be9b7-e3b6-48ad-ba2b-28d337ddaa4e/S800_Flight_Scoop_4inch_%28Imperial%29.dxf", type: "DXF" },
        { label: "Scoop Flight 4\" (Metric)", url: "https://assets-us-01.kc-usercontent.com/19eb64b5-1815-003a-d268-e7109927ccad/e8fbd43d-6262-4927-976f-35f4dc4b55ba/S800_Flight_Scoop_4inch_%28Metric%29.dxf", type: "DXF" },
        { label: "Scoop Flight 6\" (Imperial)", url: "https://assets-us-01.kc-usercontent.com/19eb64b5-1815-003a-d268-e7109927ccad/343bebfc-d08d-4eb8-8431-f6316b6df0ce/S800_Flight_Scoop_6inch_%28Imperial%29.dxf", type: "DXF" },
        { label: "Scoop Flight 6\" (Metric)", url: "https://assets-us-01.kc-usercontent.com/19eb64b5-1815-003a-d268-e7109927ccad/701a1420-03c0-443b-9c87-e85b99ed8e3c/S800_Flight_Scoop_6inch_%28Metric%29.dxf", type: "DXF" },
      ]
    },
  ],
  S1100: [
    {
      group: "Belt Profiles",
      files: [
        { label: "S1100 Belt Finder (all styles & CAD)", url: "https://www.intralox.com/belt-finder/modular-plastic-belting/series-1100", type: "Link" },
        { label: "S1100 Flush Grid Streamline Base Flights", url: "https://www.intralox.com/belt-finder/modular-plastic-belting/series-1100/flat-top-base-flights-streamline", type: "Link" },
      ]
    },
  ],
  S1400: [
    {
      group: "Belt Profiles",
      files: [
        { label: "S1400 Belt Finder (all styles & CAD)", url: "https://www.intralox.com/belt-finder/modular-plastic-belting/series-1400", type: "Link" },
        { label: "S1400 Streamline Base Flights", url: "https://www.intralox.com/belt-finder/modular-plastic-belting/series-1400/flat-top-base-flights-streamline", type: "Link" },
      ]
    },
  ],
};

// ── Friction Top series (from 2026 catalog) ───────────────────────────────────
// Series that have friction top belt styles always have indent options
export const FRICTION_TOP_SERIES = ["S560", "S570", "S400"];

// Helper to get flight data for a series
export function getSeriesFlightData(seriesId) {
  return SERIES_FLIGHTS[seriesId] || SERIES_FLIGHTS.DEFAULT;
}

export function getSeriesCADDownloads(seriesId) {
  return SERIES_CAD_DOWNLOADS[seriesId] || [];
}