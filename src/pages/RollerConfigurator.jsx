import { useState, useMemo } from "react";
import { createPageUrl } from "@/utils";

// ─── BRAND COLORS ─────────────────────────────────────────────────────────────
const C = {
  navy: "#0F2340",
  navyMid: "#1a3a5c",
  navyLight: "#2a5080",
  gold: "#C9A84C",
  goldLight: "#e8c96d",
  bg: "#f8fafc",
  card: "#ffffff",
  border: "#e2e8f0",
  text: "#1e293b",
  muted: "#64748b",
  green: "#16a34a",
  amber: "#d97706",
};

// ─── SERIES DATA ──────────────────────────────────────────────────────────────
const SERIES = [
  {
    id: "1100",
    name: "Series 1100",
    subtitle: "Light Duty Gravity Roller",
    duty: "Light",
    driveType: "Gravity",
    bearingType: "Plastic (stainless steel balls)",
    maxLoad: "Up to ~20 lbs depending on length",
    maxSpeed: "15 fpm – gravity only",
    tubeRange: "0.62\" – 1.90\"",
    tempRange: "Up to 150°F",
    applications: ["Gravity conveyors", "Light parcels", "Washdown environments"],
    tags: ["Gravity", "Light Duty", "Corrosion Resistant"],
    color: "#3b82f6",
    icon: "○",
    bearings: [
      { code: "1.113", dia: "0.62\"", wall: ".035\"", shaftDia: ".192\" dia", housing: "Acetal", note: "Balls Stainless" },
      { code: "1.101", dia: "0.75\"", wall: ".035/.060\"", shaftDia: ".250\" dia", housing: "Acetal", note: "Balls Stainless" },
      { code: "1.105", dia: "1.12\"", wall: ".050/.070\"", shaftDia: ".192\" dia", housing: "Acetal", note: "Balls Stainless" },
      { code: "1.107", dia: "1.12\"", wall: ".050/.070\"", shaftDia: ".250\" dia", housing: "Acetal", note: "Balls Stainless" },
      { code: "1.109", dia: "1.12\"", wall: ".050/.070\"", shaftDia: ".312\" dia", housing: "Acetal", note: "Balls Stainless" },
      { code: "1.111", dia: "1.12\"", wall: ".050/.070\"", shaftDia: ".312\" hex", housing: "Acetal", note: "Balls Stainless" },
      { code: "1.131", dia: "1.90\"", wall: ".065\"", shaftDia: ".437\" hex", housing: "Polypropylene", note: "Balls Stainless" },
      { code: "1.133", dia: "1.90\"", wall: ".110\"", shaftDia: ".437\" hex", housing: "Polypropylene", note: "Balls Stainless" },
      { code: "1.151", dia: "1.90\"", wall: ".065\"", shaftDia: ".312/.375 hex", housing: "Polypropylene", note: "Balls Stainless" },
      { code: "1.153", dia: "1.90\"", wall: ".110\"", shaftDia: ".312/.375 hex", housing: "Polypropylene", note: "Balls Stainless" },
    ],
    tubes: [
      { code: "S16", dia: "0.62\"", wall: ".035\"", material: "Stainless Steel", finish: "Polished" },
      { code: "S19", dia: "0.75\"", wall: ".035\"", material: "Stainless Steel", finish: "Polished" },
      { code: "V20", dia: "0.78\"", wall: ".060\"", material: "PVC", finish: "Gray", note: "Max 15\" length" },
      { code: "A21", dia: "0.75\"", wall: ".035\"", material: "Aluminum", finish: "Anodized" },
      { code: "A29", dia: "1.12\"", wall: ".050\"", material: "Aluminum", finish: "Anodized" },
      { code: "V30", dia: "1.18\"", wall: ".070\"", material: "PVC", finish: "Gray", note: "Max 22\" length" },
      { code: "A49", dia: "1.90\"", wall: ".065\"", material: "Aluminum", finish: "None" },
      { code: "G49", dia: "1.90\"", wall: ".065\"", material: "Steel", finish: "Galvanized" },
      { code: "S49", dia: "1.90\"", wall: ".065\"", material: "Stainless", finish: "Polished" },
      { code: "V50", dia: "1.90\"", wall: ".110\"", material: "PVC", finish: "Gray" },
      { code: "R69", dia: "1.90\"", wall: ".065\"", material: "Steel", finish: "Galvanized", note: "Soft PVC Sleeve" },
      { code: "R09", dia: "1.90\"", wall: ".065\"", material: "Steel", finish: "Galvanized", note: "Polyurethane Sleeve" },
    ],
    shafts: [
      { code: "C00", dia: ".192\" dia", ext: ".56\"", material: "Steel", type: "Spring Loaded" },
      { code: "S00", dia: ".192\" dia", ext: ".56\"", material: "Stainless", type: "Spring Loaded" },
      { code: "C07", dia: ".192\" dia", ext: ".75\"", material: "Steel", type: "Threaded 10-32" },
      { code: "C02", dia: ".250\" dia", ext: ".75\"", material: "Steel", type: "Threaded 1/4-20" },
      { code: "S02", dia: ".250\" dia", ext: ".75\"", material: "Stainless", type: "Threaded 1/4-20" },
      { code: "C03", dia: ".250\" dia", ext: ".56\"", material: "Steel", type: "Spring Loaded" },
      { code: "S03", dia: ".250\" dia", ext: ".56\"", material: "Stainless", type: "Spring Loaded" },
      { code: "C13", dia: ".312\" dia", ext: ".56\"", material: "Steel", type: "Spring Loaded" },
      { code: "C12", dia: ".312\" dia", ext: ".75\"", material: "Steel", type: "Threaded 5/16-18" },
      { code: "C20", dia: ".312\" hex", ext: ".56\"", material: "Steel", type: "Spring Loaded" },
      { code: "C35", dia: ".375\" hex", ext: ".56\"", material: "Steel", type: "Spring Loaded" },
      { code: "C40", dia: ".437\" hex", ext: ".56\"", material: "Steel", type: "Spring Loaded" },
      { code: "S40", dia: ".437\" hex", ext: ".56\"", material: "Stainless", type: "Spring Loaded" },
      { code: "C37", dia: ".437\" hex", ext: ".56\"", material: "Steel", type: "Tapped 1/4-20 x 5/8D" },
    ],
    partExample: "1.131.G49.C40-14.88\"RL",
  },
  {
    id: "1200",
    name: "Series 1200",
    subtitle: "Metal Conveyor Roller",
    duty: "Light-Medium",
    driveType: "Gravity / Belt",
    bearingType: "Ball bearing (zinc plated)",
    maxLoad: "Up to 600 lbs depending on length",
    maxSpeed: "200 fpm",
    tubeRange: "0.75\" – 2.50\"",
    tempRange: "Standard",
    applications: ["General conveying", "Powered belt conveyors", "Medium loads"],
    tags: ["Gravity", "Belt Drive", "Medium Duty"],
    color: "#8b5cf6",
    icon: "◎",
    bearings: [
      { code: "1.206", dia: "0.75\"", wall: ".035\"", shaftDia: ".250\" dia", housing: "Steel", note: "Zinc Plated" },
      { code: "1.210", dia: "1.00\"", wall: ".049\"", shaftDia: ".250\" dia", housing: "Steel", note: "Zinc Plated" },
      { code: "1.211", dia: "1.00\"", wall: ".049\"", shaftDia: ".312\" hex", housing: "Steel", note: "Zinc Plated" },
      { code: "1.212", dia: "1.38\"", wall: ".049\"", shaftDia: ".250\" dia", housing: "Steel", note: "Zinc Plated" },
      { code: "1.213", dia: "1.38\"", wall: ".049\"", shaftDia: ".312\" hex", housing: "Steel", note: "Zinc Plated" },
      { code: "1.220", dia: "1.90\"", wall: ".065\"", shaftDia: ".437\" hex", housing: "Steel", note: "Zinc Plated" },
      { code: "1.223", dia: "1.90\"", wall: ".065\"", shaftDia: ".437\" hex", housing: "Steel", note: "Zinc Plated, lightly oiled" },
      { code: "1.226", dia: "2.50\"", wall: ".120\"", shaftDia: ".687\" hex", housing: "Steel", note: "Zinc Plated" },
    ],
    tubes: [
      { code: "A18", dia: "0.75\"", wall: ".035\"", material: "Aluminum", finish: "Anodized" },
      { code: "A25", dia: "1.00\"", wall: ".049\"", material: "Aluminum", finish: "Anodized" },
      { code: "G25", dia: "1.00\"", wall: ".049\"", material: "Steel", finish: "Galvanized" },
      { code: "G36", dia: "1.38\"", wall: ".049\"", material: "Steel", finish: "Galvanized" },
      { code: "S36", dia: "1.38\"", wall: ".049\"", material: "Stainless", finish: "Polished" },
      { code: "G48", dia: "1.90\"", wall: ".065\"", material: "Steel", finish: "Galvanized" },
      { code: "S48", dia: "1.90\"", wall: ".065\"", material: "Stainless", finish: "Polished" },
      { code: "G66", dia: "2.50\"", wall: ".120\"", material: "Steel", finish: "Galvanized" },
      { code: "C66", dia: "2.50\"", wall: ".120\"", material: "Steel", finish: "None" },
      { code: "Z16", dia: "1.90\"", wall: ".065\"", material: "Steel", finish: "Galvanized", note: "1 variable groove" },
      { code: "Z12", dia: "1.90\"", wall: ".065\"", material: "Steel", finish: "Galvanized", note: "2 variable grooves" },
      { code: "P21", dia: "1.90\"", wall: ".065\"", material: "Steel", finish: "Galvanized", note: "Polyurethane sleeve" },
    ],
    shafts: [
      { code: "C02", dia: ".250\" dia", ext: ".75\"", material: "Steel", type: "Threaded 1/4-20" },
      { code: "C05", dia: ".250\" dia", ext: ".56\"", material: "Steel", type: "Spring Loaded" },
      { code: "C22", dia: ".312\" hex", ext: ".56\"", material: "Steel", type: "Spring Loaded" },
      { code: "C38", dia: ".437\" hex", ext: ".06\"", material: "Steel", type: "Tapped 5/16-18 x 5/8D (removable)" },
      { code: "C41", dia: ".437\" hex", ext: ".56\"", material: "Steel", type: "Spring Loaded" },
      { code: "C66", dia: ".687\" hex", ext: ".75\"", material: "Steel", type: "Spring Loaded" },
    ],
    partExample: "1.206.A18.C02-14.88\"RL",
  },
  {
    id: "1450",
    name: "Series 1450",
    subtitle: "Heavy Duty Conveyor Roller",
    duty: "Heavy",
    driveType: "Gravity / Chain",
    bearingType: "Precision ball bearing 6205ZZ (polypropylene/nylon housing)",
    maxLoad: "Up to 600 lbs",
    maxSpeed: "400 fpm",
    tubeRange: "2.50\" – 3.50\"",
    tempRange: "Standard",
    applications: ["Palletizers", "Heavy loads", "Industrial conveying", "Drums & barrels"],
    tags: ["Heavy Duty", "Chain Drive", "Industrial"],
    color: "#ef4444",
    icon: "●",
    bearings: [
      { code: "1.462", dia: "2.50\"", wall: ".120\"", shaftDia: ".687\" hex", housing: "Polypropylene", note: "6205ZZ" },
      { code: "1.465", dia: "2.50\"", wall: ".120\"", shaftDia: ".687\" taperhex", housing: "Polypropylene", note: "6205ZZ" },
      { code: "1.45Z", dia: "3.50\"", wall: ".120\"", shaftDia: ".687\" hex", housing: "Nylon", note: "6205ZZ" },
      { code: "1.455", dia: "3.50\"", wall: ".120\"", shaftDia: ".787\" dia", housing: "Nylon", note: "6205ZZ" },
    ],
    tubes: [
      { code: "P08", dia: "2.50\"", wall: ".120\"", material: "Steel", finish: "Mill" },
      { code: "P09", dia: "2.50\"", wall: ".120\"", material: "Steel", finish: "Galvanized" },
      { code: "J8B", dia: "3.50\"", wall: ".120\"", material: "Steel", finish: "Mill" },
    ],
    shafts: [
      { code: "W54", dia: ".687\" hex", ext: ".75\"", material: "Steel", type: "Spring Loaded (use with 1.462)" },
      { code: "G30", dia: ".687\" hex", ext: ".75\"", material: "Steel", type: "Spring Loaded (use with 1.45Z)" },
      { code: "D45", dia: ".687\" Taperhex", ext: "1.00\"", material: "Steel", type: "Taperhex (6.09\"–11.99\" lengths)" },
      { code: "Y69", dia: ".687\" Taperhex", ext: "1.00\"", material: "Steel", type: "Taperhex (12.00\"–88.87\" lengths)" },
      { code: "P20", dia: ".787\" dia", ext: ".06\"", material: "Steel", type: "Tapped 1/2-13 x .75D, fixed" },
    ],
    partExample: "1.462.P09.W54-14.88\"RL",
  },
  {
    id: "1700",
    name: "Series 1700",
    subtitle: "Universal Conveyor Roller",
    duty: "Medium-Heavy",
    driveType: "Gravity / Belt / Motorized",
    bearingType: "Commercial, Precision, or Stainless Steel",
    maxLoad: "Up to 450 lbs depending on configuration",
    maxSpeed: "400 fpm (precision bearings)",
    tubeRange: "1.38\" – 3.50\" (also 50mm)",
    tempRange: "-28°F to +104°F",
    applications: ["Universal use", "Gravity & powered conveyors", "Food grade (stainless)", "AGVs", "Packaging"],
    tags: ["Universal", "Medium Duty", "Heavy Duty", "Food Grade"],
    color: "#f59e0b",
    icon: "◉",
    bearingGroups: [
      {
        label: "Commercial Bearings",
        bearings: [
          { code: "1.701", dia: "1.90\"", wall: ".065\"", shaftDia: ".437\" hex", note: "Commercial" },
          { code: "1.702", dia: "1.90\"", wall: ".065\"", shaftDia: ".500\" dia", note: "Commercial" },
          { code: "1.704", dia: "1.90\"", wall: ".110\"", shaftDia: ".437\" hex", note: "Commercial" },
          { code: "1.705", dia: "1.90\"", wall: ".110\"", shaftDia: ".500\" dia", note: "Commercial" },
          { code: "1.7AA", dia: "50mm", wall: "1.5mm", shaftDia: "8mm dia", note: "Commercial" },
          { code: "1.7AE", dia: "50mm", wall: "1.5mm", shaftDia: "11mm hex", note: "Commercial" },
          { code: "1.7AC", dia: "50mm", wall: "1.5mm", shaftDia: "12mm dia", note: "Commercial" },
          { code: "1.707", dia: "2.50\"", wall: ".083\"", shaftDia: ".437\" hex", note: "Commercial" },
          { code: "1.708", dia: "2.50\"", wall: ".083\"", shaftDia: ".500\" dia", note: "Commercial" },
          { code: "1.710", dia: "2.50\"", wall: ".125\"", shaftDia: ".437\" hex", note: "Commercial" },
          { code: "1.711", dia: "2.50\"", wall: ".125\"", shaftDia: ".500\" dia", note: "Commercial" },
          { code: "1.716", dia: "3.50\"", wall: ".280\"", shaftDia: ".437\" hex", note: "Commercial" },
          { code: "1.717", dia: "3.50\"", wall: ".280\"", shaftDia: ".500\" dia", note: "Commercial" },
        ]
      },
      {
        label: "Stainless Steel Bearings",
        bearings: [
          { code: "1.750", dia: "1.90\"", wall: ".065\"", shaftDia: ".437\" hex", note: "Stainless bearings" },
          { code: "1.751", dia: "1.90\"", wall: ".065\"", shaftDia: ".500\" dia", note: "Stainless bearings" },
          { code: "1.742", dia: "1.90\"", wall: ".065\"", shaftDia: ".437\" hex", note: "Stainless + food grade grease" },
          { code: "1.753", dia: "1.90\"", wall: ".110\"", shaftDia: ".437\" hex", note: "Stainless bearings" },
          { code: "1.7FX", dia: "50mm", wall: "1.5mm", shaftDia: "11mm hex", note: "Stainless bearings" },
          { code: "1.7FV", dia: "50mm", wall: "1.5mm", shaftDia: "12mm dia", note: "Stainless bearings" },
          { code: "1.756", dia: "2.50\"", wall: ".083\"", shaftDia: ".437\" hex", note: "Stainless bearings" },
          { code: "1.757", dia: "2.50\"", wall: ".083\"", shaftDia: ".500\" dia", note: "Stainless bearings" },
        ]
      },
      {
        label: "Precision Bearings",
        bearings: [
          { code: "1.770", dia: "1.90\"", wall: ".065\"", shaftDia: ".437\" Taperhex", note: "6002ZZ Precision" },
          { code: "1.772", dia: "1.90\"", wall: ".065\"", shaftDia: ".437\" hex", note: "6002-2RS Precision" },
          { code: "1.775", dia: "1.90\"", wall: ".065\"", shaftDia: ".437\" hex", note: "6002ZZ Precision" },
          { code: "1.776", dia: "1.90\"", wall: ".065\"", shaftDia: ".500\" dia", note: "6002ZZ Precision" },
          { code: "1.7L9", dia: "50mm", wall: "1.5mm", shaftDia: "11mm hex", note: "6002ZZ Precision" },
          { code: "1.7L7", dia: "50mm", wall: "1.5mm", shaftDia: "12mm dia", note: "6002ZZ Precision" },
          { code: "1.75A", dia: "50mm", wall: "1.5mm", shaftDia: "17mm dia", note: "6003ZZ Precision" },
          { code: "1.781", dia: "2.50\"", wall: ".083\"", shaftDia: ".437\" hex", note: "6002ZZ Precision" },
          { code: "1.784", dia: "2.50\"", wall: ".125\"", shaftDia: ".437\" hex", note: "6002ZZ Precision" },
          { code: "1.790", dia: "3.50\"", wall: ".280\"", shaftDia: ".437\" hex", note: "6002ZZ Precision" },
          { code: "1.791", dia: "3.50\"", wall: ".280\"", shaftDia: ".500\" dia", note: "6002ZZ Precision" },
        ]
      }
    ],
    tubes: [
      { code: "R81", dia: "1.90\"", wall: ".065\"", material: "Steel", finish: "Galvanized" },
      { code: "R82", dia: "1.90\"", wall: ".065\"", material: "Stainless", finish: "Polished" },
      { code: "F31", dia: "1.90\"", wall: ".065\"", material: "Steel", finish: "Galvanized", note: "Anti-static" },
      { code: "H74", dia: "1.90\"", wall: ".065\"", material: "Stainless", finish: "Polished", note: "Anti-static" },
      { code: "R83", dia: "1.90\"", wall: ".110\"", material: "PVC", finish: "Gray" },
      { code: "G50", dia: "50mm", wall: "1.5mm", material: "Steel", finish: "Galvanized", note: "Anti-static" },
      { code: "W71", dia: "2.50\"", wall: ".083\"", material: "Steel", finish: "Galvanized", note: "Anti-static" },
      { code: "R84", dia: "2.50\"", wall: ".125\"", material: "PVC", finish: "Gray" },
      { code: "K38", dia: "1.90\"", wall: ".065\"", material: "Steel", finish: "Galvanized", note: "PVC sleeve" },
      { code: "J76", dia: "1.90\"", wall: ".065\"", material: "Steel", finish: "Galvanized", note: "Polyurethane sleeve" },
      { code: "J44", dia: "1.90\"", wall: ".110\"", material: "Polyethylene", finish: "Yellow", note: "Resists litho ink, max 26\" RL" },
    ],
    shafts: [
      { code: "M70", dia: ".437\" hex", ext: ".56\"", material: "Steel", type: "Spring Loaded" },
      { code: "X62", dia: ".437\" hex", ext: ".56\"", material: "Stainless", type: "Spring Loaded" },
      { code: "M71", dia: ".437\" hex", ext: ".56\"", material: "Steel", type: "Fixed ends" },
      { code: "U05", dia: ".437\" Taperhex", ext: ".71\"", material: "Steel", type: "Taperhex (7\"–48\" RL)" },
      { code: "U64", dia: ".437\" Taperhex", ext: ".71\"", material: "Steel", type: "Taperhex (3.88\"–7\" RL)" },
      { code: "C38", dia: ".437\" hex", ext: ".06\"", material: "Steel", type: "Tapped 5/16-18 x 5/8D, removable" },
      { code: "M75", dia: ".500\" dia", ext: ".56\"", material: "Steel", type: "Spring Loaded" },
      { code: "M73", dia: ".500\" dia", ext: ".06\"", material: "Steel", type: "Tapped 5/16-18 x 5/8D, fixed" },
      { code: "M72", dia: ".500\" dia", ext: "1.00\"", material: "Steel", type: "1/2-13 threaded, removable" },
      { code: "G31", dia: ".668\" dia (17mm)", ext: ".06\"", material: "Steel", type: "Tapped 3/8-16 x 3/4D, fixed" },
    ],
    partExample: "1.701.R81.M70-14.88\"RL",
  },
  {
    id: "1800",
    name: "Series 1800",
    subtitle: "Precision Heavy Duty Roller",
    duty: "Heavy",
    driveType: "Belt / Powered",
    bearingType: "Precision chrome alloy (ABEC-1), sintered iron housing",
    maxLoad: "Up to 1013 lbs",
    maxSpeed: "500 fpm",
    tubeRange: "2.00\" – 3.50\"",
    tempRange: "Standard",
    applications: ["High-speed packaging lines", "AGVs", "Transfer machines", "Belt conveyors", "Parts handling"],
    tags: ["Precision", "High Speed", "Heavy Duty"],
    color: "#10b981",
    icon: "◈",
    bearings: [
      { code: "1.815", dia: "2.00\"", wall: ".120\"", shaftDia: ".437\" hex", note: "6203ZZ Precision" },
      { code: "1.816", dia: "2.00\"", wall: ".120\"", shaftDia: ".669\" dia", note: "6203ZZ Precision" },
      { code: "1.817", dia: "2.00\"", wall: ".120\"", shaftDia: ".787\" dia", note: "6204ZZ, use R94 tube" },
      { code: "1.825", dia: "2.50\"", wall: ".120\"", shaftDia: ".687\" hex", note: "6205ZZ Precision" },
      { code: "1.826", dia: "2.50\"", wall: ".120\"", shaftDia: ".787\" dia", note: "6204ZZ Precision" },
      { code: "1.827", dia: "2.50\"", wall: ".120\"", shaftDia: ".984\" dia", note: "6205ZZ Precision" },
      { code: "1.832", dia: "3.00\"", wall: ".180\"", shaftDia: ".687\" hex", note: "6205ZZ Precision" },
      { code: "1.835", dia: "3.00\"", wall: ".180\"", shaftDia: ".787\" dia", note: "6204ZZ Precision" },
      { code: "1.836", dia: "3.00\"", wall: ".180\"", shaftDia: ".984\" dia", note: "6205ZZ Precision" },
      { code: "1.843", dia: "3.50\"", wall: ".180\"", shaftDia: ".687\" hex", note: "6205ZZ Precision" },
    ],
    tubes: [
      { code: "Z32", dia: "2.00\"", wall: ".120\"", material: "Steel", finish: "None", note: "Welded tubing" },
      { code: "Z33", dia: "2.00\"", wall: ".120\"", material: "Steel", finish: "Zinc-Plated", note: "Welded tubing" },
      { code: "R94", dia: "2.00\"", wall: ".120\"", material: "Steel", finish: "None", note: "Use with 1.817 bearing" },
      { code: "R95", dia: "2.00\"", wall: ".120\"", material: "Steel", finish: "Zinc-Plated", note: "Use with 1.817 bearing" },
      { code: "Z35", dia: "2.50\"", wall: ".120\"", material: "Steel", finish: "None", note: "Welded tubing" },
      { code: "Z36", dia: "2.50\"", wall: ".120\"", material: "Steel", finish: "Galvanized", note: "Welded tubing" },
      { code: "Z39", dia: "3.00\"", wall: ".180\"", material: "Steel", finish: "None", note: "DOM" },
      { code: "Z64", dia: "3.50\"", wall: ".180\"", material: "Steel", finish: "None", note: "Welded tubing" },
    ],
    shafts: [
      { code: "R60", dia: ".437\" hex", ext: ".56\"", material: "Steel", type: "Spring Loaded" },
      { code: "C38", dia: ".437\" hex", ext: ".06\"", material: "Steel", type: "Tapped 5/16-18 x 5/8D, loose" },
      { code: "R62", dia: ".687\" hex", ext: ".75\"", material: "Steel", type: "Spring Loaded" },
      { code: "C64", dia: ".687\" hex", ext: ".06\"", material: "Steel", type: "Tapped 3/8-16 x 3/4D, fixed" },
      { code: "D68", dia: ".669\" dia", ext: ".06\"", material: "Steel", type: "Tapped 3/8-16 x 3/4D, fixed" },
      { code: "B55", dia: ".787\" dia", ext: ".06\"", material: "Steel", type: "Tapped 3/8-16 x 3/4D, fixed" },
      { code: "R71", dia: ".984\" dia", ext: ".06\"", material: "Steel", type: "Tapped 5/16-18 x 3/4D, fixed" },
    ],
    partExample: "1.815.Z32.R60-14.88\"RL",
  },
  {
    id: "1940",
    name: "Series 1940 / 1960",
    subtitle: "Heavy Duty Welded Roller",
    duty: "Heavy",
    driveType: "Gravity / Chain",
    bearingType: "Precision 6204ZZ with triple labyrinth seal",
    maxLoad: "Up to 1346 lbs",
    maxSpeed: "500 fpm",
    tubeRange: "2.50\" – 5.00\"",
    tempRange: "Standard / Outdoor",
    applications: ["Palletizers", "Bulk handling", "Foundry operations", "Outdoor environments", "Heavy industry"],
    tags: ["Heavy Duty", "Welded", "Industrial", "Outdoor"],
    color: "#6366f1",
    icon: "⬛",
    bearings: [
      { code: "1.940", dia: "All", wall: "Varies", shaftDia: ".787\" dia", note: "6204ZZ, without dirtguard" },
      { code: "1.960", dia: "All", wall: "Varies", shaftDia: ".787\" dia", note: "6204ZZ, with dirtguard seal" },
      { code: "1.941", dia: "All", wall: "Varies", shaftDia: ".787\" dia", note: "6204ZZ, cantilever mounting" },
    ],
    tubes: [
      { code: "H19", dia: "2.50\"", wall: ".120\"", material: "Steel", finish: "Mill" },
      { code: "H20", dia: "3.50\"", wall: ".120\"", material: "Steel", finish: "Mill" },
      { code: "H21", dia: "4.00\"", wall: ".134\"", material: "Steel", finish: "Mill" },
      { code: "H22", dia: "5.00\"", wall: ".134\"", material: "Steel", finish: "Mill" },
    ],
    shafts: [
      { code: "C70", dia: ".787\" dia", ext: ".39\"", material: "Steel", type: "Standard (both ends)" },
      { code: "C71", dia: ".787\" dia", ext: ".90\"", material: "Steel", type: "Cantilever (one end)" },
      { code: "C72", dia: ".787\" dia", ext: ".90\"", material: "Steel", type: "Threaded end (one end)" },
      { code: "C73", dia: ".787\" dia", ext: "—", material: "Steel", type: "Tapped both ends (frame spacer)" },
    ],
    partExample: "1.940.H20.C70-15.00\"RL",
  },
  {
    id: "3400_3500",
    name: "Series 3400 / 3500",
    subtitle: "Sprocket Driven (Welded) Roller",
    duty: "Medium-Heavy",
    driveType: "Chain / Sprocket",
    bearingType: "3400: Precision 6203/6205ZZ | 3500: Commercial (zinc plated)",
    maxLoad: "Up to 675 lbs (3400), 225–600 lbs (3500)",
    maxSpeed: "100 fpm (3400), 60 fpm (3500)",
    tubeRange: "1.90\" – 2.50\"",
    tempRange: "Standard",
    applications: ["Chain-driven conveyors", "Roller-to-roller drive", "Tangential chain drive", "Powered roller lines"],
    tags: ["Chain Drive", "Sprocket", "Medium Duty"],
    color: "#f97316",
    icon: "⚙",
    bearings: [
      { code: "3.450", dia: "1.90\"", wall: ".065\"", shaftDia: ".437\" hex", note: "Precision 6203ZZ (3400)" },
      { code: "3.462", dia: "2.50\"", wall: ".120\"", shaftDia: ".687\" hex", note: "Precision 6205ZZ (3400)" },
      { code: "3.520", dia: "1.90\"", wall: ".065\"", shaftDia: ".437\" hex", note: "Commercial bearing (3500)" },
      { code: "3.525", dia: "2.50\"", wall: ".120\"", shaftDia: ".687\" hex", note: "Commercial bearing (3500)" },
    ],
    tubes: [
      { code: "J30", dia: "1.90\"", wall: ".065\"", material: "Steel", finish: "None", note: "2 × #40-18 sprockets" },
      { code: "P65", dia: "1.90\"", wall: ".065\"", material: "Steel", finish: "None", note: "1 × #50-15 sprocket" },
      { code: "H47", dia: "1.90\"", wall: ".065\"", material: "Steel", finish: "None", note: "2 × #50-15 sprockets" },
      { code: "D42", dia: "1.90\"", wall: ".065\"", material: "Steel", finish: "None", note: "1 × #40-18 sprocket (3500)" },
      { code: "D43", dia: "1.90\"", wall: ".065\"", material: "Steel", finish: "None", note: "2 × #40-18 sprockets (3500)" },
      { code: "D44", dia: "1.90\"", wall: ".065\"", material: "Steel", finish: "None", note: "1 × #50-15 sprocket (3500)" },
      { code: "D46", dia: "1.90\"", wall: ".065\"", material: "Steel", finish: "None", note: "2 × #50-15 sprockets (3500)" },
      { code: "M93", dia: "2.50\"", wall: ".120\"", material: "Steel", finish: "None", note: "2 × #50-18 sprockets (3400)" },
      { code: "D61", dia: "2.50\"", wall: ".120\"", material: "Steel", finish: "None", note: "1 × #50-18 sprocket (3500)" },
      { code: "D67", dia: "2.50\"", wall: ".120\"", material: "Steel", finish: "None", note: "2 × #50-18 sprockets (3500)" },
      { code: "D68", dia: "2.50\"", wall: ".120\"", material: "Steel", finish: "None", note: "1 × #60-15 sprocket (3500)" },
      { code: "D69", dia: "2.50\"", wall: ".120\"", material: "Steel", finish: "None", note: "2 × #60-15 sprockets (3500)" },
    ],
    shafts: [
      { code: "V15", dia: ".437\" hex", ext: ".56\"", material: "Steel", type: "Spring Loaded" },
      { code: "C38", dia: ".437\" hex", ext: ".06\"", material: "Steel", type: "Tapped 5/16-18 x 5/8D" },
      { code: "C41", dia: ".437\" hex", ext: ".56\"", material: "Steel", type: "Spring Loaded (3500)" },
      { code: "W54", dia: ".687\" hex", ext: ".75\"", material: "Steel", type: "Spring Loaded" },
      { code: "C64", dia: ".687\" hex", ext: ".06\"", material: "Steel", type: "Tapped 3/8-16 x 3/4D" },
      { code: "C66", dia: ".687\" hex", ext: ".75\"", material: "Steel", type: "Spring Loaded (3500)" },
    ],
    partExample: "3.525.D69.C66-14.88\"RL",
  },
  {
    id: "3800",
    name: "Series 3800",
    subtitle: "Slip Drive / Direct Drive Roller",
    duty: "Light-Medium",
    driveType: "Slip Drive / Direct Chain",
    bearingType: "Commercial ball bearing (nylon housing)",
    maxLoad: "Up to 126 lbs",
    maxSpeed: "60 fpm (slip), 90 fpm (intermittent)",
    tubeRange: "1.90\" – 2.50\"",
    tempRange: "Standard",
    applications: ["Zero-pressure accumulation", "Controlled stops/releases", "Powered accumulation conveyors"],
    tags: ["Accumulation", "Slip Drive", "Chain Drive"],
    color: "#ec4899",
    icon: "⟳",
    bearings: [
      { code: "3.801", dia: "1.90\"", wall: ".065\"", shaftDia: ".500\" dia", note: "Slip Drive, 1 × #40-9 nylon sprocket" },
      { code: "3.802", dia: "1.90\"", wall: ".065\"", shaftDia: ".500\" dia", note: "Slip Drive, 1 × #40-14 nylon sprocket" },
      { code: "3.803", dia: "1.90\"", wall: ".065\"", shaftDia: ".500\" dia", note: "Slip Drive, 2 × #40-14 nylon sprockets" },
      { code: "3.804", dia: "2.50\"", wall: ".065\"", shaftDia: ".500\" dia", note: "Slip Drive, 1 × #40-9 nylon sprocket" },
      { code: "3.805", dia: "2.50\"", wall: ".065\"", shaftDia: ".500\" dia", note: "Slip Drive, 1 × #40-14 nylon sprocket" },
      { code: "3.806", dia: "2.50\"", wall: ".065\"", shaftDia: ".500\" dia", note: "Slip Drive, 2 × #40-14 nylon sprockets" },
      { code: "3.811", dia: "1.90\"", wall: ".065\"", shaftDia: ".500\" dia", note: "Direct Drive, 1 × #40-9 sprocket" },
      { code: "3.812", dia: "1.90\"", wall: ".065\"", shaftDia: ".500\" dia", note: "Direct Drive, 1 × #40-14 sprocket" },
      { code: "3.813", dia: "1.90\"", wall: ".065\"", shaftDia: ".500\" dia", note: "Direct Drive, 2 × #40-14 sprockets" },
      { code: "3.814", dia: "2.50\"", wall: ".065\"", shaftDia: ".500\" dia", note: "Direct Drive, 1 × #40-9 sprocket" },
      { code: "3.815", dia: "2.50\"", wall: ".065\"", shaftDia: ".500\" dia", note: "Direct Drive, 1 × #40-14 sprocket" },
      { code: "3.816", dia: "2.50\"", wall: ".065\"", shaftDia: ".500\" dia", note: "Direct Drive, 2 × #40-14 sprockets" },
    ],
    tubes: [
      { code: "A01", dia: "1.90\"", wall: ".065\"", material: "Aluminum", finish: "None", note: "1 Sprocket" },
      { code: "A02", dia: "1.90\"", wall: ".065\"", material: "Aluminum", finish: "None", note: "2 Sprockets" },
      { code: "G01", dia: "1.90\"", wall: ".065\"", material: "Steel", finish: "Galvanized", note: "1 Sprocket" },
      { code: "G02", dia: "1.90\"", wall: ".065\"", material: "Steel", finish: "Galvanized", note: "2 Sprockets" },
      { code: "S01", dia: "1.90\"", wall: ".065\"", material: "Stainless", finish: "320 Grit", note: "1 Sprocket" },
      { code: "S02", dia: "1.90\"", wall: ".065\"", material: "Stainless", finish: "320 Grit", note: "2 Sprockets" },
      { code: "G03", dia: "2.50\"", wall: ".065\"", material: "Steel", finish: "Galvanized", note: "1 Sprocket" },
      { code: "G04", dia: "2.50\"", wall: ".065\"", material: "Steel", finish: "Galvanized", note: "2 Sprockets" },
      { code: "J63", dia: "1.90\"", wall: ".065\"", material: "Steel", finish: "None", note: "2 Sprockets, PVC sleeve" },
    ],
    shafts: [
      { code: "T20", dia: ".500\" dia", ext: ".06\"", material: "Steel", type: "Double tapped 5/16-18 x 5/8D" },
      { code: "M92", dia: ".500\" dia", ext: ".06\"", material: "Steel", type: "Single tapped 5/16-18 x 5/8D" },
    ],
    partExample: "3.801.A01.T20-14.88\"RL",
  },
  {
    id: "1300",
    name: "Series 1300 / 1350 / 1400",
    subtitle: "Tapered Curve Roller",
    duty: "Light-Medium",
    driveType: "Gravity / Friction (O-rings)",
    bearingType: "1300: Commercial | 1350: Stainless | 1400: Precision",
    maxLoad: "Up to 113 lbs",
    maxSpeed: "236 fpm (precision)",
    tubeRange: "2.07\" small end (tapered polypropylene overlay)",
    tempRange: "Standard",
    applications: ["45°, 90°, 180° conveyor curves", "32\" inside radius", "Light-medium curve conveying"],
    tags: ["Curve", "Tapered", "Gravity"],
    color: "#14b8a6",
    icon: "⌒",
    bearings: [
      { code: "1.318", dia: "Tapered", wall: "—", shaftDia: ".437\" hex", note: "Commercial bearings" },
      { code: "1.319", dia: "Tapered", wall: "—", shaftDia: ".500\" dia", note: "Commercial bearings" },
      { code: "1.368", dia: "Tapered", wall: "—", shaftDia: ".437\" hex", note: "Stainless bearings" },
      { code: "1.369", dia: "Tapered", wall: "—", shaftDia: ".500\" dia", note: "Stainless bearings" },
      { code: "1.418", dia: "Tapered", wall: "—", shaftDia: ".437\" hex", note: "Precision bearings" },
      { code: "1.419", dia: "Tapered", wall: "—", shaftDia: ".500\" dia", note: "Precision bearings" },
    ],
    tubes: [
      { code: "T12", dia: "2.80\"", wall: "—", material: "Polypropylene/Steel", finish: "Black", note: "RL 9.52\"–12.27\"" },
      { code: "T14", dia: "3.06\"", wall: "—", material: "Polypropylene/Steel", finish: "Black", note: "RL 13.47\"–16.22\"" },
      { code: "T18", dia: "3.31\"", wall: "—", material: "Polypropylene/Steel", finish: "Black", note: "RL 17.42\"–20.17\"" },
      { code: "T22", dia: "3.56\"", wall: "—", material: "Polypropylene/Steel", finish: "Black", note: "RL 21.37\"–24.13\"" },
      { code: "T26", dia: "3.81\"", wall: "—", material: "Polypropylene/Steel", finish: "Black", note: "RL 25.32\"–28.07\"" },
      { code: "T32", dia: "4.06\"", wall: "—", material: "Polypropylene/Steel", finish: "Black", note: "RL 29.27\"–32.02\"" },
      { code: "T36", dia: "4.31\"", wall: "—", material: "Polypropylene/Steel", finish: "Black", note: "RL 33.22\"–35.97\"" },
    ],
    shafts: [
      { code: "C42", dia: ".437\" hex", ext: ".56\"", material: "Steel", type: "Spring Loaded" },
      { code: "S42", dia: ".437\" hex", ext: ".56\"", material: "Stainless", type: "Spring Loaded" },
      { code: "C50", dia: ".500\" dia", ext: "1.00\"", material: "Steel", type: "1/2-13\" threaded removable" },
      { code: "S50", dia: ".500\" dia", ext: "1.00\"", material: "Stainless", type: "1/2-13\" threaded removable" },
      { code: "C51", dia: ".500\" dia", ext: ".06\"", material: "Steel", type: "Tapped 5/16-18 x 5/8D" },
      { code: "C52", dia: ".500\" dia", ext: "1.00\"", material: "Steel", type: "1/2-13\" threaded fixed" },
    ],
    partExample: "1.318.T14.C42-14.88\"RL",
  },
];

// ─── ROLLER SVG DIAGRAM ───────────────────────────────────────────────────────
function RollerDiagram({ diameter, length, shaftType, shaftDia, tubeMaterial }) {
  const bfNum = parseFloat(length) || 15;
  const rl = Math.max(bfNum - 0.12, 3);
  const diaNum = parseFloat(diameter) || 1.9;
  const scale = 180 / Math.max(rl, 10);
  const bodyW = Math.min(rl * scale, 220);
  const bodyH = Math.min(diaNum * 22, 60);
  const shaftExtL = shaftType && shaftType.includes("Spring") ? 14 : 10;
  const totalW = bodyW + shaftExtL * 2 + 40;
  const cx = totalW / 2;
  const cy = 55;
  const colors = {
    "Steel": "#94a3b8", "Stainless": "#cbd5e1", "PVC": "#a3e635",
    "Aluminum": "#93c5fd", "Polypropylene": "#fde68a", "": "#94a3b8",
  };
  const tubeColor = colors[tubeMaterial] || "#94a3b8";

  return (
    <svg width={totalW + 20} height={120} viewBox={`0 0 ${totalW + 20} 120`} style={{ display: "block", margin: "0 auto" }}>
      {/* shaft left */}
      <line x1={cx - bodyW/2 - shaftExtL} y1={cy} x2={cx - bodyW/2} y2={cy} stroke="#64748b" strokeWidth={Math.min(parseFloat(shaftDia || "0.437") * 12, 8)} strokeLinecap="round" />
      {/* shaft right */}
      <line x1={cx + bodyW/2} y1={cy} x2={cx + bodyW/2 + shaftExtL} y2={cy} stroke="#64748b" strokeWidth={Math.min(parseFloat(shaftDia || "0.437") * 12, 8)} strokeLinecap="round" />
      {/* spring indicators */}
      {shaftType && shaftType.includes("Spring") && (
        <>
          <circle cx={cx - bodyW/2 - shaftExtL + 4} cy={cy} r={5} fill="none" stroke="#f59e0b" strokeWidth={1.5} />
          <circle cx={cx + bodyW/2 + shaftExtL - 4} cy={cy} r={5} fill="none" stroke="#f59e0b" strokeWidth={1.5} />
        </>
      )}
      {/* roller body */}
      <rect x={cx - bodyW/2} y={cy - bodyH/2} width={bodyW} height={bodyH} rx={bodyH/2} fill={tubeColor} stroke="#475569" strokeWidth={1.5} />
      {/* bearing caps */}
      <rect x={cx - bodyW/2} y={cy - bodyH/2 + 2} width={10} height={bodyH - 4} rx={3} fill="#334155" opacity={0.7} />
      <rect x={cx + bodyW/2 - 10} y={cy - bodyH/2 + 2} width={10} height={bodyH - 4} rx={3} fill="#334155" opacity={0.7} />
      {/* dimension lines */}
      <line x1={cx - bodyW/2} y1={cy + bodyH/2 + 8} x2={cx + bodyW/2} y2={cy + bodyH/2 + 8} stroke="#94a3b8" strokeWidth={1} markerEnd="url(#arrow)" />
      <text x={cx} y={cy + bodyH/2 + 20} textAnchor="middle" fontSize={9} fill="#64748b">RL ≈ {rl.toFixed(2)}&quot;</text>
      {/* diameter label */}
      <line x1={cx - bodyW/2 - 18} y1={cy - bodyH/2} x2={cx - bodyW/2 - 18} y2={cy + bodyH/2} stroke="#94a3b8" strokeWidth={1} />
      <text x={cx - bodyW/2 - 22} y={cy + 3} textAnchor="middle" fontSize={8} fill="#64748b" transform={`rotate(-90,${cx - bodyW/2 - 22},${cy})`}>Ø {diameter || "—"}</text>
      {/* legend */}
      <rect x={8} y={8} width={10} height={8} rx={1} fill={tubeColor} stroke="#475569" strokeWidth={1} />
      <text x={22} y={15} fontSize={8} fill="#64748b">{tubeMaterial || "Tube"}</text>
      <rect x={8} y={20} width={10} height={6} rx={1} fill="#334155" opacity={0.7} />
      <text x={22} y={26} fontSize={8} fill="#64748b">Bearing housing</text>
    </svg>
  );
}

// ─── TOP BAR ─────────────────────────────────────────────────────────────────
function TopBar() {
  return (
    <div style={{ background: C.navy, borderBottom: "3px solid " + C.gold, padding: "0 40px" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: 58 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <a href={createPageUrl("Home")} style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: C.gold, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 14, color: C.navy }}>U</div>
            <span style={{ color: "#fff", fontWeight: 700, fontSize: 15, letterSpacing: "0.02em" }}>UniKonnect</span>
          </a>
          <div style={{ width: 1, height: 22, background: "rgba(255,255,255,0.15)" }} />
          <span style={{ color: C.gold, fontSize: 13, fontWeight: 600 }}>Interroll Roller Configurator</span>
        </div>
        <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
          <a href={createPageUrl("Home")} style={{ color: "rgba(255,255,255,0.7)", fontSize: 13, textDecoration: "none" }}>← Catalog</a>
          <a href={createPageUrl("RFQCart")} style={{ background: C.gold, color: C.navy, padding: "7px 16px", borderRadius: 8, fontSize: 13, fontWeight: 700, textDecoration: "none" }}>RFQ Cart</a>
        </div>
      </div>
    </div>
  );
}

// ─── SERIES CARD ─────────────────────────────────────────────────────────────
function SeriesCard({ s, onSelect }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      onClick={() => onSelect(s)}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: "#fff", borderRadius: 14, border: `2px solid ${hov ? s.color : C.border}`,
        padding: "20px", cursor: "pointer", transition: "all 0.18s",
        boxShadow: hov ? `0 8px 24px ${s.color}22` : "0 1px 4px rgba(0,0,0,0.06)",
        transform: hov ? "translateY(-2px)" : "none",
      }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 14, marginBottom: 12 }}>
        <div style={{ width: 44, height: 44, borderRadius: 10, background: s.color + "18", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, color: s.color, flexShrink: 0 }}>{s.icon}</div>
        <div>
          <div style={{ fontSize: 15, fontWeight: 800, color: C.text }}>{s.name}</div>
          <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>{s.subtitle}</div>
        </div>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 12 }}>
        {s.tags.map(t => (
          <span key={t} style={{ background: s.color + "18", color: s.color, fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 20, letterSpacing: "0.3px" }}>{t}</span>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, fontSize: 11 }}>
        <div><span style={{ color: C.muted }}>Max Load:</span><br /><span style={{ fontWeight: 600, color: C.text }}>{s.maxLoad}</span></div>
        <div><span style={{ color: C.muted }}>Max Speed:</span><br /><span style={{ fontWeight: 600, color: C.text }}>{s.maxSpeed}</span></div>
        <div><span style={{ color: C.muted }}>Drive:</span><br /><span style={{ fontWeight: 600, color: C.text }}>{s.driveType}</span></div>
        <div><span style={{ color: C.muted }}>Tube Range:</span><br /><span style={{ fontWeight: 600, color: C.text }}>{s.tubeRange}</span></div>
      </div>
      <div style={{ marginTop: 14, padding: "8px 12px", background: s.color + "0f", borderRadius: 8, fontSize: 11, color: C.muted }}>
        <strong style={{ color: C.text }}>Applications: </strong>{s.applications.join(", ")}
      </div>
      <div style={{ marginTop: 12, textAlign: "right" }}>
        <span style={{ color: s.color, fontSize: 12, fontWeight: 700 }}>Configure →</span>
      </div>
    </div>
  );
}

// ─── CONFIGURATOR WIZARD ─────────────────────────────────────────────────────
function ConfigWizard({ series, onClose, onAddToRFQ }) {
  const [step, setStep] = useState(0);
  const [bearing, setBearing] = useState(null);
  const [tube, setTube] = useState(null);
  const [shaft, setShaft] = useState(null);
  const [length, setLength] = useState("");
  const [qty, setQty] = useState(1);
  const [notes, setNotes] = useState("");
  const [done, setDone] = useState(false);

  // Flatten bearings for series with bearingGroups
  const allBearings = useMemo(() => {
    if (series.bearingGroups) {
      return series.bearingGroups.flatMap(g => g.bearings.map(b => ({ ...b, groupLabel: g.label })));
    }
    return series.bearings || [];
  }, [series]);

  // Filter tubes by selected bearing diameter
  const filteredTubes = useMemo(() => {
    if (!bearing) return series.tubes || [];
    const bd = bearing.dia;
    // Match tubes by diameter
    return (series.tubes || []).filter(t => {
      if (bd === "All" || bd === "Tapered") return true;
      if (bd.includes("50mm") || bd.includes("50 mm")) return t.dia.includes("50mm") || t.dia.includes("50 mm") || true;
      return true; // Show all tubes — user may mix
    });
  }, [bearing, series]);

  // Filter shafts by selected bearing shaft compatibility
  const filteredShafts = useMemo(() => {
    if (!bearing) return series.shafts || [];
    const shaftDia = bearing.shaftDia || "";
    return (series.shafts || []).filter(s => {
      const sd = s.dia.toLowerCase();
      const bd = shaftDia.toLowerCase();
      const bMain = bd.split(" ")[0];
      return sd.includes(bMain) || true; // show all but highlight compatible
    });
  }, [bearing, series]);

  const partCode = useMemo(() => {
    if (!bearing || !tube || !shaft || !length) return null;
    const rl = (parseFloat(length) - 0.12).toFixed(2);
    return `${bearing.code}.${tube.code}.${shaft.code}-${rl}"RL`;
  }, [bearing, tube, shaft, length]);

  const steps = ["Bearing", "Tube", "Shaft", "Length & Qty", "Review"];
  const s = series;

  function handleAddToCart() {
    if (onAddToRFQ && partCode) {
      onAddToRFQ({
        series: s.name,
        bearing: `${bearing.code} — ${bearing.dia} ${bearing.note || ""}`,
        tube: `${tube.code} — ${tube.material} ${tube.finish} ${tube.note || ""}`,
        shaft: `${shaft.code} — ${shaft.dia} ${shaft.type}`,
        length: length + "\" BF",
        qty,
        partCode,
        notes,
      });
      setDone(true);
    }
  }

  if (done) {
    return (
      <div style={{ textAlign: "center", padding: "60px 40px" }}>
        <div style={{ fontSize: 56, marginBottom: 16 }}>✅</div>
        <div style={{ fontSize: 20, fontWeight: 800, color: C.text, marginBottom: 8 }}>Added to RFQ Cart!</div>
        <div style={{ fontSize: 14, color: C.muted, marginBottom: 8 }}>Part Code: <strong style={{ color: C.navy, fontFamily: "monospace" }}>{partCode}</strong></div>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 24 }}>
          <button onClick={() => { setBearing(null); setTube(null); setShaft(null); setLength(""); setQty(1); setNotes(""); setStep(0); setDone(false); }}
            style={{ padding: "10px 22px", background: C.navyMid, color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontSize: 14, fontWeight: 600 }}>
            Configure Another
          </button>
          <button onClick={onClose}
            style={{ padding: "10px 22px", background: C.border, color: C.text, border: "none", borderRadius: 8, cursor: "pointer", fontSize: 14, fontWeight: 600 }}>
            Back to Series
          </button>
          <a href={createPageUrl("RFQCart")}
            style={{ padding: "10px 22px", background: C.gold, color: C.navy, border: "none", borderRadius: 8, cursor: "pointer", fontSize: 14, fontWeight: 700, textDecoration: "none", display: "inline-block" }}>
            View RFQ Cart →
          </a>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, paddingBottom: 16, borderBottom: "1px solid " + C.border }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 800, color: C.text }}>{s.name} — {s.subtitle}</div>
          <div style={{ fontSize: 12, color: C.muted, marginTop: 3 }}>Build your part number step by step</div>
        </div>
        <button onClick={onClose} style={{ background: "none", border: "1px solid " + C.border, borderRadius: 8, padding: "6px 14px", cursor: "pointer", fontSize: 13, color: C.muted }}>← Back to Series</button>
      </div>

      {/* Live part code bar */}
      <div style={{ background: C.navy, borderRadius: 10, padding: "12px 20px", marginBottom: 24, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.6)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>Live Part Code</div>
        <div style={{ fontFamily: "monospace", fontSize: 16, fontWeight: 700, color: partCode ? C.goldLight : "rgba(255,255,255,0.3)", letterSpacing: "0.5px" }}>
          {partCode || `${bearing?.code || "_.___"}.${tube?.code || "___"}.${shaft?.code || "___"}-${length ? (parseFloat(length) - 0.12).toFixed(2) + '"RL' : 'XX.XX"RL'}`}
        </div>
        {partCode && <span style={{ background: C.gold, color: C.navy, padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700 }}>COMPLETE</span>}
      </div>

      {/* Step progress */}
      <div style={{ display: "flex", gap: 4, marginBottom: 24 }}>
        {steps.map((st, i) => (
          <div key={st} style={{ flex: 1, textAlign: "center" }}>
            <div style={{ height: 4, borderRadius: 2, background: i <= step ? s.color : C.border, marginBottom: 5, transition: "background 0.2s" }} />
            <div style={{ fontSize: 10, fontWeight: i === step ? 700 : 400, color: i === step ? s.color : C.muted }}>{st}</div>
          </div>
        ))}
      </div>

      {/* Roller diagram (shows whenever enough info) */}
      {(bearing || tube || shaft) && (
        <div style={{ background: "#f8fafc", borderRadius: 12, padding: "16px", marginBottom: 20, border: "1px solid " + C.border }}>
          <div style={{ fontSize: 11, color: C.muted, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 10, textAlign: "center" }}>Roller Preview</div>
          <RollerDiagram
            diameter={bearing?.dia || "1.90\""}
            length={length || "15"}
            shaftType={shaft?.type || ""}
            shaftDia={shaft?.dia || "0.437"}
            tubeMaterial={tube?.material || ""}
          />
          <div style={{ display: "flex", justifyContent: "center", gap: 16, marginTop: 8, flexWrap: "wrap" }}>
            {bearing && <span style={{ fontSize: 10, color: C.muted }}>Ø {bearing.dia}</span>}
            {shaft && <span style={{ fontSize: 10, color: C.muted }}>Shaft: {shaft.dia}</span>}
            {length && <span style={{ fontSize: 10, color: C.muted }}>BF: {length}&quot; → RL: {(parseFloat(length) - 0.12).toFixed(2)}&quot;</span>}
          </div>
        </div>
      )}

      {/* Step 0: Bearing */}
      {step === 0 && (
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 14 }}>
            Step 1 — Select Bearing Assembly
            <span style={{ fontSize: 11, color: C.muted, fontWeight: 400, marginLeft: 8 }}>Defines tube diameter, bearing type &amp; shaft size</span>
          </div>
          {s.bearingGroups ? (
            s.bearingGroups.map(group => (
              <div key={group.label} style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: s.color, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 10, paddingBottom: 6, borderBottom: "1px solid " + C.border }}>{group.label}</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 8 }}>
                  {group.bearings.map(b => (
                    <BearingOption key={b.code} b={b} selected={bearing?.code === b.code} color={s.color} onClick={() => { setBearing(b); setStep(1); }} />
                  ))}
                </div>
              </div>
            ))
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 8 }}>
              {allBearings.map(b => (
                <BearingOption key={b.code} b={b} selected={bearing?.code === b.code} color={s.color} onClick={() => { setBearing(b); setStep(1); }} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Step 1: Tube */}
      {step === 1 && (
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 4 }}>Step 2 — Select Tube</div>
          <div style={{ fontSize: 12, color: C.muted, marginBottom: 14 }}>Choose tube material, diameter, and any special features</div>
          <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 8, padding: "8px 14px", marginBottom: 14, fontSize: 12, color: "#92400e" }}>
            Selected bearing: <strong>{bearing?.code}</strong> — Ø {bearing?.dia}, shaft: {bearing?.shaftDia}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 8 }}>
            {filteredTubes.map(t => (
              <TubeOption key={t.code} t={t} selected={tube?.code === t.code} color={s.color} onClick={() => { setTube(t); setStep(2); }} />
            ))}
          </div>
          <button onClick={() => setStep(0)} style={{ marginTop: 16, background: "none", border: "none", color: C.muted, cursor: "pointer", fontSize: 13 }}>← Back</button>
        </div>
      )}

      {/* Step 2: Shaft */}
      {step === 2 && (
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 4 }}>Step 3 — Select Shaft</div>
          <div style={{ fontSize: 12, color: C.muted, marginBottom: 14 }}>Choose shaft type, material, and mounting method</div>
          <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 8, padding: "8px 14px", marginBottom: 14, fontSize: 12, color: "#166534" }}>
            Compatible with bearing shaft: <strong>{bearing?.shaftDia}</strong>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 8 }}>
            {filteredShafts.map(sh => {
              const compatible = sh.dia.includes(bearing?.shaftDia?.split(" ")[0] || "");
              return (
                <ShaftOption key={sh.code} sh={sh} selected={shaft?.code === sh.code} color={s.color} compatible={compatible} onClick={() => { setShaft(sh); setStep(3); }} />
              );
            })}
          </div>
          <button onClick={() => setStep(1)} style={{ marginTop: 16, background: "none", border: "none", color: C.muted, cursor: "pointer", fontSize: 13 }}>← Back</button>
        </div>
      )}

      {/* Step 3: Length & Qty */}
      {step === 3 && (
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 4 }}>Step 4 — Length &amp; Quantity</div>
          <div style={{ fontSize: 12, color: C.muted, marginBottom: 20 }}>Enter the between-frame (BF) dimension. Roller length (RL) = BF − 0.12&quot;</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, maxWidth: 480 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: C.text, display: "block", marginBottom: 6 }}>Between Frames (BF) — inches</label>
              <input
                type="number" step="0.01" min="3" max="120"
                value={length} onChange={e => setLength(e.target.value)}
                placeholder="e.g. 15.00"
                style={{ width: "100%", boxSizing: "border-box", padding: "10px 12px", borderRadius: 8, border: "1.5px solid " + (length ? s.color : C.border), fontSize: 14, outline: "none" }}
              />
              {length && <div style={{ fontSize: 11, color: C.muted, marginTop: 4 }}>RL = {(parseFloat(length) - 0.12).toFixed(2)}&quot;</div>}
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: C.text, display: "block", marginBottom: 6 }}>Quantity</label>
              <input
                type="number" min="1" value={qty} onChange={e => setQty(parseInt(e.target.value) || 1)}
                style={{ width: "100%", boxSizing: "border-box", padding: "10px 12px", borderRadius: 8, border: "1.5px solid " + C.border, fontSize: 14, outline: "none" }}
              />
            </div>
          </div>
          <div style={{ marginTop: 16 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: C.text, display: "block", marginBottom: 6 }}>Special Notes / Requirements (optional)</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2}
              placeholder="e.g. anti-static requirement, specific groove locations, special finish..."
              style={{ width: "100%", maxWidth: 480, boxSizing: "border-box", padding: "10px 12px", borderRadius: 8, border: "1.5px solid " + C.border, fontSize: 13, outline: "none", resize: "vertical" }} />
          </div>
          <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
            <button onClick={() => setStep(2)} style={{ padding: "10px 20px", background: "none", border: "1px solid " + C.border, borderRadius: 8, cursor: "pointer", fontSize: 14, color: C.muted }}>← Back</button>
            <button onClick={() => setStep(4)} disabled={!length}
              style={{ padding: "10px 24px", background: length ? s.color : C.border, color: length ? "#fff" : C.muted, border: "none", borderRadius: 8, cursor: length ? "pointer" : "not-allowed", fontSize: 14, fontWeight: 700 }}>
              Review →
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Review */}
      {step === 4 && (
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 16 }}>Step 5 — Review &amp; Add to RFQ</div>
          <div style={{ background: C.navy + "08", border: "1px solid " + C.border, borderRadius: 12, padding: "20px", marginBottom: 20 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 12 }}>Configuration Summary</div>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              {[
                ["Series", s.name + " — " + s.subtitle],
                ["Bearing", `${bearing?.code} — Ø ${bearing?.dia}, ${bearing?.shaftDia}, ${bearing?.note || ""}`],
                ["Tube", `${tube?.code} — ${tube?.material} ${tube?.finish}${tube?.note ? " (" + tube.note + ")" : ""}`],
                ["Shaft", `${shaft?.code} — ${shaft?.dia} ${shaft?.type}`],
                ["BF Length", length + "\""],
                ["Roller Length (RL)", (parseFloat(length) - 0.12).toFixed(2) + "\""],
                ["Quantity", qty],
                ["Notes", notes || "—"],
              ].map(([k, v]) => (
                <tr key={k} style={{ borderBottom: "1px solid #f1f5f9" }}>
                  <td style={{ padding: "7px 0", color: C.muted, width: "30%", fontWeight: 600 }}>{k}</td>
                  <td style={{ padding: "7px 0", color: C.text }}>{v}</td>
                </tr>
              ))}
            </table>
          </div>
          {/* Big part code */}
          <div style={{ background: C.navy, borderRadius: 12, padding: "20px 24px", marginBottom: 24, textAlign: "center" }}>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 8 }}>Interroll Part Code</div>
            <div style={{ fontFamily: "monospace", fontSize: 22, fontWeight: 800, color: C.goldLight, letterSpacing: "1px" }}>{partCode}</div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 8 }}>Bearing.Tube.Shaft-Length</div>
          </div>
          {/* CAD link */}
          <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 8, padding: "10px 16px", marginBottom: 20, fontSize: 12, color: "#1e40af" }}>
            <strong>CAD Drawings Available:</strong> Interroll provides 3D PDF, 2D DWG, IGES, STEP and SAT formats.
            <a href="https://www.interroll.com/resources/cad-download" target="_blank" rel="noreferrer"
              style={{ color: "#1d4ed8", fontWeight: 700, marginLeft: 8 }}>Download from Interroll →</a>
          </div>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <button onClick={() => setStep(3)} style={{ padding: "10px 20px", background: "none", border: "1px solid " + C.border, borderRadius: 8, cursor: "pointer", fontSize: 14, color: C.muted }}>← Edit</button>
            <button onClick={handleAddToCart}
              style={{ padding: "10px 28px", background: C.gold, color: C.navy, border: "none", borderRadius: 8, cursor: "pointer", fontSize: 14, fontWeight: 800 }}>
              Add to RFQ Cart →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function BearingOption({ b, selected, color, onClick }) {
  const [hov, setHov] = useState(false);
  return (
    <div onClick={onClick} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ padding: "12px 14px", borderRadius: 10, border: `2px solid ${selected ? color : hov ? color + "88" : C.border}`, cursor: "pointer", background: selected ? color + "12" : "#fff", transition: "all 0.15s" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
        <span style={{ fontFamily: "monospace", fontSize: 13, fontWeight: 800, color: selected ? color : C.text }}>{b.code}</span>
        {selected && <span style={{ fontSize: 10, color, fontWeight: 700 }}>SELECTED ✓</span>}
      </div>
      <div style={{ fontSize: 11, color: C.muted }}>Ø {b.dia} · Wall {b.wall}</div>
      <div style={{ fontSize: 11, color: C.muted }}>Shaft: {b.shaftDia}</div>
      {b.note && <div style={{ fontSize: 10, color: C.muted, marginTop: 4, fontStyle: "italic" }}>{b.note}</div>}
      {b.groupLabel && <div style={{ fontSize: 9, color, fontWeight: 700, marginTop: 4, textTransform: "uppercase" }}>{b.groupLabel}</div>}
    </div>
  );
}

function TubeOption({ t, selected, color, onClick }) {
  const [hov, setHov] = useState(false);
  const matColors = { "Steel": "#94a3b8", "Stainless": "#cbd5e1", "PVC": "#86efac", "Aluminum": "#93c5fd", "Polyethylene": "#fde68a", "Polypropylene": "#fde68a" };
  return (
    <div onClick={onClick} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ padding: "12px 14px", borderRadius: 10, border: `2px solid ${selected ? color : hov ? color + "88" : C.border}`, cursor: "pointer", background: selected ? color + "12" : "#fff", transition: "all 0.15s" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
        <span style={{ fontFamily: "monospace", fontSize: 13, fontWeight: 800, color: selected ? color : C.text }}>{t.code}</span>
        <span style={{ width: 10, height: 10, borderRadius: "50%", background: matColors[t.material] || "#94a3b8", border: "1px solid #e2e8f0", display: "inline-block" }} />
      </div>
      <div style={{ fontSize: 11, fontWeight: 700, color: C.text }}>Ø {t.dia} · {t.material}</div>
      <div style={{ fontSize: 11, color: C.muted }}>Finish: {t.finish}{t.wall && t.wall !== "—" ? ` · Wall: ${t.wall}` : ""}</div>
      {t.note && <div style={{ fontSize: 10, color: C.muted, marginTop: 4, fontStyle: "italic" }}>{t.note}</div>}
    </div>
  );
}

function ShaftOption({ sh, selected, color, compatible, onClick }) {
  const [hov, setHov] = useState(false);
  return (
    <div onClick={onClick} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ padding: "12px 14px", borderRadius: 10, border: `2px solid ${selected ? color : compatible ? color + "44" : hov ? color + "66" : C.border}`, cursor: "pointer", background: selected ? color + "12" : compatible ? color + "06" : "#fff", transition: "all 0.15s" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
        <span style={{ fontFamily: "monospace", fontSize: 13, fontWeight: 800, color: selected ? color : C.text }}>{sh.code}</span>
        <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
          {compatible && !selected && <span style={{ fontSize: 9, color, fontWeight: 700, background: color + "18", padding: "1px 6px", borderRadius: 10 }}>COMPATIBLE</span>}
          {selected && <span style={{ fontSize: 10, color, fontWeight: 700 }}>SELECTED ✓</span>}
        </div>
      </div>
      <div style={{ fontSize: 11, fontWeight: 700, color: C.text }}>{sh.dia}</div>
      <div style={{ fontSize: 11, color: C.muted }}>{sh.type}</div>
      <div style={{ fontSize: 11, color: C.muted }}>Material: {sh.material} · Ext: {sh.ext}</div>
    </div>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
export default function RollerConfigurator() {
  const [selectedSeries, setSelectedSeries] = useState(null);
  const [rfqItems, setRfqItems] = useState([]);
  const [dutyFilter, setDutyFilter] = useState("All");
  const [driveFilter, setDriveFilter] = useState("All");
  const [searchQ, setSearchQ] = useState("");

  const duties = ["All", "Light", "Light-Medium", "Medium-Heavy", "Heavy"];
  const drives = ["All", "Gravity", "Belt", "Chain", "Slip Drive", "Curve"];

  const filteredSeries = useMemo(() => {
    return SERIES.filter(s => {
      if (dutyFilter !== "All" && !s.duty.includes(dutyFilter)) return false;
      if (driveFilter !== "All") {
        const drv = s.driveType + " " + s.tags.join(" ");
        if (!drv.toLowerCase().includes(driveFilter.toLowerCase())) return false;
      }
      if (searchQ.trim()) {
        const q = searchQ.toLowerCase();
        const haystack = [s.name, s.subtitle, s.duty, s.driveType, ...s.tags, ...s.applications].join(" ").toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [dutyFilter, driveFilter, searchQ]);

  function handleAddToRFQ(item) {
    setRfqItems(prev => [...prev, item]);
  }

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "'Inter','Segoe UI',Arial,sans-serif", display: "flex", flexDirection: "column" }}>
      <TopBar />

      <div style={{ flex: 1, maxWidth: 1280, width: "100%", margin: "0 auto", padding: "32px 40px", boxSizing: "border-box" }}>

        {/* Page header */}
        {!selectedSeries && (
          <div style={{ marginBottom: 32 }}>
            <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 20, flexWrap: "wrap", gap: 16 }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: C.gold, textTransform: "uppercase", letterSpacing: "1px", marginBottom: 6 }}>Interroll — Exclusive Partner</div>
                <h1 style={{ fontSize: 26, fontWeight: 900, color: C.navy, margin: 0 }}>Conveyor Roller Configurator</h1>
                <p style={{ fontSize: 14, color: C.muted, marginTop: 6, marginBottom: 0 }}>Select a series, build your roller step by step, and generate your Interroll part code.</p>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 13, color: C.muted }}>{filteredSeries.length} series available</span>
                {rfqItems.length > 0 && (
                  <a href={createPageUrl("RFQCart")} style={{ background: C.gold, color: C.navy, padding: "8px 18px", borderRadius: 8, fontSize: 13, fontWeight: 700, textDecoration: "none" }}>
                    Cart ({rfqItems.length})
                  </a>
                )}
              </div>
            </div>

            {/* Filter bar */}
            <div style={{ background: "#fff", border: "1px solid " + C.border, borderRadius: 12, padding: "16px 20px", display: "flex", flexWrap: "wrap", gap: 16, alignItems: "center" }}>
              <div style={{ position: "relative", flex: "1 1 200px" }}>
                <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", fontSize: 16, color: C.muted }}>🔍</span>
                <input value={searchQ} onChange={e => setSearchQ(e.target.value)} placeholder="Search series, application..."
                  style={{ width: "100%", boxSizing: "border-box", padding: "9px 12px 9px 34px", borderRadius: 8, border: "1.5px solid " + C.border, fontSize: 13, outline: "none" }} />
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                <span style={{ fontSize: 12, color: C.muted, fontWeight: 600 }}>Duty:</span>
                {duties.map(d => (
                  <button key={d} onClick={() => setDutyFilter(d)}
                    style={{ padding: "5px 12px", borderRadius: 20, border: `1.5px solid ${dutyFilter === d ? C.navyMid : C.border}`, background: dutyFilter === d ? C.navyMid : "#fff", color: dutyFilter === d ? "#fff" : C.text, fontSize: 12, cursor: "pointer", fontWeight: dutyFilter === d ? 700 : 400 }}>
                    {d}
                  </button>
                ))}
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                <span style={{ fontSize: 12, color: C.muted, fontWeight: 600 }}>Drive:</span>
                {drives.map(d => (
                  <button key={d} onClick={() => setDriveFilter(d)}
                    style={{ padding: "5px 12px", borderRadius: 20, border: `1.5px solid ${driveFilter === d ? C.navyMid : C.border}`, background: driveFilter === d ? C.navyMid : "#fff", color: driveFilter === d ? "#fff" : C.text, fontSize: 12, cursor: "pointer", fontWeight: driveFilter === d ? 700 : 400 }}>
                    {d}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Series grid or Wizard */}
        {!selectedSeries ? (
          filteredSeries.length > 0 ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 20 }}>
              {filteredSeries.map(s => (
                <SeriesCard key={s.id} s={s} onSelect={setSelectedSeries} />
              ))}
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: 80, color: C.muted }}>
              No series match your filters. <button onClick={() => { setDutyFilter("All"); setDriveFilter("All"); setSearchQ(""); }} style={{ background: "none", border: "none", color: C.navyMid, cursor: "pointer", fontWeight: 700, fontSize: 14 }}>Clear filters</button>
            </div>
          )
        ) : (
          <div style={{ background: "#fff", borderRadius: 16, border: "1px solid " + C.border, padding: 32, boxShadow: "0 4px 24px rgba(0,0,0,0.07)" }}>
            <ConfigWizard series={selectedSeries} onClose={() => setSelectedSeries(null)} onAddToRFQ={handleAddToRFQ} />
          </div>
        )}
      </div>

      <div style={{ borderTop: "1px solid " + C.border, padding: "14px 40px", textAlign: "center", fontSize: 11, color: "#cbd5e1" }}>
        Uniking Canada · Interroll Authorized Partner · <a href="https://www.interroll.com/products/rollers-and-wheels" target="_blank" rel="noreferrer" style={{ color: "#93c5fd", textDecoration: "none" }}>Interroll Product Library</a>
      </div>
    </div>
  );
}
