import { useState, useMemo } from "react";
import { createPageUrl } from "@/utils";

const C = {
  navy: "#0F2340", navyMid: "#1a3a5c", navyLight: "#2a5080",
  gold: "#C9A84C", goldLight: "#e8c96d",
  bg: "#f8fafc", card: "#ffffff", border: "#e2e8f0",
  text: "#1e293b", muted: "#64748b",
};

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
      <div style={{ background: "#fff", borderRadius: 16, width: "100%", maxWidth: 820, boxShadow: "0 24px 80px rgba(0,0,0,0.3)", position: "relative", marginBottom: 16 }}>

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
        <div style={{ display: "flex", borderBottom: "1px solid " + C.border, padding: "0 20px", overflowX: "auto" }}>
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
          <button onClick={() => onConfigure(s)} style={{ padding: "9px 20px", background: s.color, color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 800 }}>
            Configure & Add to RFQ →
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── CONFIGURE MODAL ─────────────────────────────────────────────────────────
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
          <a href={createPageUrl("RFQCart")} style={{ padding: "10px 20px", background: C.gold, color: C.navy, border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 800, textDecoration: "none" }}>View RFQ Cart →</a>
        </div>
      </div>
    </div>
  );

  const SLabel = ({ children }) => <div style={{ fontWeight: 700, fontSize: 12, color: C.muted, textTransform: "uppercase", letterSpacing: "0.4px", marginBottom: 6, marginTop: 14 }}>{children}</div>;
  const sel = { padding: "9px 12px", borderRadius: 8, border: "1px solid " + C.border, fontSize: 13, width: "100%", cursor: "pointer", background: "#fff" };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.65)", zIndex: 1100, display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "16px", overflowY: "auto" }}>
      <div style={{ background: "#fff", borderRadius: 16, width: "100%", maxWidth: 640, boxShadow: "0 24px 80px rgba(0,0,0,0.3)", marginBottom: 16 }}>

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

          {/* Add button */}
          <button onClick={handleAdd} disabled={!tube || !shaft}
            style={{ marginTop: 18, width: "100%", padding: "13px", background: tube && shaft ? s.color : "#e5e7eb",
              color: tube && shaft ? "#fff" : "#9ca3af", border: "none", borderRadius: 10, cursor: tube && shaft ? "pointer" : "not-allowed",
              fontSize: 14, fontWeight: 800, transition: "background 0.15s" }}>
            {tube && shaft ? "Add to RFQ Cart →" : "Select tube and shaft to continue"}
          </button>
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
        {s.grooves && typeof s.grooves === "object" && <div style={{ position: "absolute", top: 10, right: 10, background: "#16a34a", color: "#fff", fontSize: 9, fontWeight: 800, padding: "2px 8px", borderRadius: 10 }}>GROOVES</div>}
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
export default function RollerConfigurator() {
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
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 20px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 56 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <a href={createPageUrl("Home")} style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 8 }}>
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
            <a href={createPageUrl("RFQCart")} style={{ background: C.gold, color: C.navy, padding: "7px 16px", borderRadius: 8, fontSize: 13, fontWeight: 700, textDecoration: "none" }}>RFQ Cart</a>
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
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "24px 20px 60px" }}>
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
