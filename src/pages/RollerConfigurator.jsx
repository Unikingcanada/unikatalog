import { useState, useMemo } from "react";
import { createPageUrl } from "@/utils";

const C = {
  navy: "#0F2340", navyMid: "#1a3a5c", navyLight: "#2a5080",
  gold: "#C9A84C", goldLight: "#e8c96d",
  bg: "#f8fafc", card: "#ffffff", border: "#e2e8f0",
  text: "#1e293b", muted: "#64748b",
};

// ─── UNIT CONVERSION ──────────────────────────────────────────────────────────
function useUnits() {
  const [metric, setMetric] = useState(true);
  const fmt = {
    load: (n) => metric ? `${n} N` : `${Math.round(n / 4.448)} lbf`,
    speed: (ms) => metric ? `${ms} m/s` : `${Math.round(ms * 196.85)} fpm`,
    temp: (c) => metric ? `${c}°C` : `${Math.round(c * 9/5 + 32)}°F`,
    dia: (mm) => metric ? `Ø${mm} mm` : `Ø${(mm / 25.4).toFixed(3)}"`,
    len: (mm) => metric ? `${mm} mm` : `${(mm / 25.4).toFixed(2)}"`,
  };
  return { metric, setMetric, fmt };
}

// ─── REAL INTERROLL DATA (from 2026 catalog) ─────────────────────────────────
const SERIES = [
  {
    id: "1100",
    name: "Series 1100",
    subtitle: "Gravity Conveyor Roller",
    platform: "1100",
    duty: "Light",
    color: "#3b82f6",
    driveType: "Gravity / Push",
    bearingType: "Polymer housing, steel or stainless balls",
    maxLoad_N: 350,
    maxSpeed_ms: 0.3,
    temp_min_C: -5, temp_max_C: 40,
    tubes_mm: ["Ø16×1", "Ø20×1.5", "Ø30×1.2", "Ø40×1.2", "Ø50×1.5"],
    materials: ["Zinc-plated steel", "Stainless steel", "Aluminum", "PVC"],
    shaft_options: ["Spring-loaded", "Fixed", "Female thread M6", "Male thread", "Flatted"],
    antistatic: true,
    applications: ["Gravity conveyors", "Light parcels", "Food & washdown (FDA grease)", "Push conveyors"],
    tags: ["Gravity", "Light Duty", "Food Grade"],
    sleeve_options: ["PVC sleeve", "PU sleeve", "Lagging"],
    image_url: "https://base44.app/api/apps/69dd9ffccab4dd693d4d92f5/files/mp/public/69dd9ffccab4dd693d4d92f5/643c8bc1a_1100_p32_i0.jpeg",
    notes: "PVC tube: avoid sustained heavy load above +30°C. For food sector — FDA-compliant grease standard.",
    page_range: "32–37",
    load_table: [
      { tube: "Ø16×1 Stainless", shaft_mm: 5, loads: { 200: 30, 400: 10, 600: null } },
      { tube: "Ø20×1.5 Stainless", shaft_mm: 6, loads: { 200: 70, 400: 25, 600: null } },
      { tube: "Ø30×1.2 Zinc-plated", shaft_mm: 8, loads: { 200: 150, 400: 55, 600: 25 } },
      { tube: "Ø40×1.2 Zinc-plated", shaft_mm: 10, loads: { 200: 250, 400: 100, 600: 50 } },
      { tube: "Ø50×1.5 Zinc-plated", shaft_mm: 12, loads: { 200: 350, 400: 150, 600: 80, 800: 50 } },
    ],
  },
  {
    id: "1200",
    name: "Series 1200",
    subtitle: "Steel Conveyor Roller",
    platform: "1200",
    duty: "Medium",
    color: "#8b5cf6",
    driveType: "Gravity / Belt / Driven",
    bearingType: "Zinc-plated steel housing, hardened running grooves",
    maxLoad_N: 1200,
    maxSpeed_ms: 0.8,
    temp_min_C: -30, temp_max_C: 80,
    tubes_mm: ["Ø30×1.2", "Ø40×1.2", "Ø50×1.5", "Ø60×1.5"],
    materials: ["Zinc-plated steel", "Stainless steel", "Aluminum"],
    shaft_options: ["Spring-loaded", "Fixed", "Female thread M8", "Male thread"],
    antistatic: true,
    applications: ["General conveying", "Powered belt conveyors", "Deep freeze storage", "High-temp environments"],
    tags: ["Deep Freeze", "Belt Drive", "Antistatic"],
    sleeve_options: ["PVC sleeve", "PU sleeve", "Lagging"],
    image_url: "https://base44.app/api/apps/69dd9ffccab4dd693d4d92f5/files/mp/public/69dd9ffccab4dd693d4d92f5/0a354bdce_1200_p38_i0.jpeg",
    notes: "Steel housing rated for −30°C to +80°C. All versions antistatic standard. Lubrication: oiled to Ø40 mm, greased from Ø50 mm.",
    page_range: "38–43",
    load_table: [
      { tube: "Ø30×1.2 Zinc-plated", shaft_mm: 8, loads: { 200: 250, 400: 100, 600: 50, 800: 30 } },
      { tube: "Ø40×1.2 Zinc-plated", shaft_mm: 10, loads: { 200: 500, 400: 220, 600: 130, 800: 90 } },
      { tube: "Ø50×1.5 Zinc-plated", shaft_mm: 12, loads: { 200: 900, 400: 450, 600: 280, 800: 195, 1000: 150, 1200: 120 } },
      { tube: "Ø60×1.5 Zinc-plated", shaft_mm: 14, loads: { 200: 1200, 400: 700, 600: 450, 800: 330, 1000: 260, 1200: 215 } },
    ],
  },
  {
    id: "1450",
    name: "Series 1450",
    subtitle: "Heavy-Duty Universal Conveyor Roller",
    platform: "1450",
    duty: "Heavy",
    color: "#ef4444",
    driveType: "Gravity / Chain / Belt",
    bearingType: "6205 2RZ precision steel (polyamide) or 6204 2RZ (steel housing for deep freeze)",
    maxLoad_N: 5000,
    maxSpeed_ms: 0.8,
    temp_min_C: -5, temp_max_C: 40,
    temp_deepfreeze_C: -30,
    tubes_mm: ["Ø60×2", "Ø80×2", "Ø89×3"],
    materials: ["Zinc-plated steel", "Stainless steel"],
    shaft_options: ["Spring-loaded", "Fixed", "Female thread M12", "Male thread"],
    antistatic: "Optional",
    applications: ["Palletizers", "Heavy containers", "Barrels & drums", "Steel containers", "Gravity conveyors"],
    tags: ["Heavy Duty", "5000 N", "Deep Freeze"],
    sleeve_options: ["PVC sleeve (Ø60, 80 mm)", "Lagging"],
    image_url: "https://base44.app/api/apps/69dd9ffccab4dd693d4d92f5/files/mp/public/69dd9ffccab4dd693d4d92f5/1ac6db2ed_1450_p44_i0.jpeg",
    notes: "Polyamide housing: 5000 N, −5 to +40°C. Steel housing: 2500 N, −30 to +80°C. Grooves for round belt on Ø80×2 only.",
    page_range: "44–49",
    load_table: [
      { tube: "Ø60×2 Zinc-plated (Polyamide housing)", shaft_mm: 14, loads: { 200: 3000, 400: 1500, 600: 900, 800: 650, 1000: 510, 1200: 420 } },
      { tube: "Ø80×2 Zinc-plated (Polyamide housing)", shaft_mm: 17, loads: { 200: 5000, 400: 3000, 600: 1800, 800: 1300, 1000: 1020, 1200: 835 } },
      { tube: "Ø89×3 Zinc-plated (Polyamide housing)", shaft_mm: 20, loads: { 200: 5000, 400: 4200, 600: 2650, 800: 1940, 1000: 1520, 1200: 1245 } },
    ],
  },
  {
    id: "1500",
    name: "Series 1500 / 1520",
    subtitle: "Slide Bearing Conveyor Roller — Food Grade",
    platform: "1500",
    duty: "Light",
    color: "#10b981",
    driveType: "Non-driven (gravity/push)",
    bearingType: "PTFE polymer slide bearing, stainless steel shaft pin — no lubrication",
    maxLoad_N: 1100,
    maxSpeed_ms: 0.8,
    temp_min_C: -5, temp_max_C: 40,
    tubes_mm: ["Ø30×1.5", "Ø50×1.5"],
    materials: ["Zinc-plated steel", "Stainless steel", "PVC"],
    shaft_options: ["Stainless pin Ø6 HEX (1500)", "Stainless pin Ø12 + M8 thread (1520)"],
    antistatic: false,
    applications: ["Food packaging", "Moist / wet areas", "Washdown conveyors", "High cleanliness zones"],
    tags: ["Food Grade", "Washdown", "No Lubrication"],
    sleeve_options: [],
    image_url: "https://base44.app/api/apps/69dd9ffccab4dd693d4d92f5/files/mp/public/69dd9ffccab4dd693d4d92f5/f9eafd36b_1500_p50_i0.jpeg",
    notes: "1500: max 120 N, Ø6 hex pin. 1520: max 1100 N, Ø12 pin with M8 thread. No grease — bearings run dry. Fully corrosion-proof.",
    page_range: "50–55",
    load_table: [
      { tube: "Ø30 PVC — Series 1500", shaft_mm: 6, loads: { 200: 120, 400: 50, 600: 25 } },
      { tube: "Ø50×1.5 Stainless — Series 1520", shaft_mm: 12, loads: { 200: 1100, 400: 500, 600: 300, 800: 200, 1000: 150 } },
    ],
  },
  {
    id: "1700",
    name: "Series 1700",
    subtitle: "Universal Conveyor Roller — Standard",
    platform: "1700",
    duty: "Medium",
    color: "#f59e0b",
    driveType: "Driven / Non-driven / Belt bearing",
    bearingType: "6002 2RZ precision steel or stainless, bearing play C3",
    maxLoad_N: 2000,
    maxSpeed_ms: 2.0,
    temp_min_C: -30, temp_max_C: 40,
    tubes_mm: ["Ø20×1.5", "Ø30×1.2", "Ø40×1.5", "Ø50×1.5", "Ø60×1.5"],
    materials: ["Zinc-plated steel", "Stainless steel", "Aluminum", "PVC"],
    shaft_options: ["Spring-loaded", "Fixed", "Female thread", "Male thread", "Tapered shaft-shuttle"],
    antistatic: true,
    applications: ["Unit handling", "Cardboards & containers", "Gravity conveyors", "Belt bearing roller", "Deep freeze (oiled bearings)"],
    tags: ["Universal", "2000 N", "2.0 m/s"],
    sleeve_options: ["PVC sleeve", "PU sleeve", "Lagging"],
    image_url: "https://base44.app/api/apps/69dd9ffccab4dd693d4d92f5/files/mp/public/69dd9ffccab4dd693d4d92f5/792d28c13_1700_p60_i0.jpeg",
    notes: "Industry's most proven roller. Oiled bearings for deep freeze (−30°C). PVC tube min −5°C. Tapered shaft-shuttle for quick assembly.",
    page_range: "60–69",
    load_table: [
      { tube: "Ø20×1.5 Zinc-plated", shaft_mm: 8, loads: { 200: 300, 400: 100, 600: 45, 800: 25 } },
      { tube: "Ø30×1.2 Zinc-plated", shaft_mm: 10, loads: { 200: 550, 400: 220, 600: 130, 800: 85 } },
      { tube: "Ø40×1.5 Zinc-plated", shaft_mm: 12, loads: { 200: 1000, 400: 500, 600: 310, 800: 220, 1000: 170, 1200: 135 } },
      { tube: "Ø50×1.5 Zinc-plated", shaft_mm: 12, loads: { 200: 1500, 400: 850, 600: 570, 800: 430, 1000: 345, 1200: 285 } },
      { tube: "Ø60×1.5 Zinc-plated", shaft_mm: 14, loads: { 200: 2000, 400: 1300, 600: 950, 800: 780, 1000: 665, 1200: 580 } },
    ],
  },
  {
    id: "1700KXO",
    name: "Series 1700KXO",
    subtitle: "Tapered Curve Roller",
    platform: "1700",
    duty: "Medium",
    color: "#06b6d4",
    driveType: "Gravity / Driven curve sections",
    bearingType: "6002 2RZ precision steel, bearing play C3",
    maxLoad_N: 500,
    maxSpeed_ms: 2.0,
    temp_min_C: -30, temp_max_C: 40,
    tubes_mm: ["Ø50×1.5 (tapered)", "Ø60×1.5 (tapered)"],
    materials: ["Zinc-plated steel", "Stainless steel"],
    shaft_options: ["Spring-loaded", "Fixed", "Female thread"],
    antistatic: "1.8° black elements only",
    applications: ["90° conveyor curves", "180° conveyor curves", "Driven curve sections", "Tight-radius curves (min 690 mm)"],
    tags: ["Curve", "Tapered", "KXO"],
    sleeve_options: [],
    image_url: "https://base44.app/api/apps/69dd9ffccab4dd693d4d92f5/files/mp/public/69dd9ffccab4dd693d4d92f5/d5de1faf1_1700KXO_p70_i0.jpeg",
    notes: "Conicity 1.8° gray: standard (inner radius 800–850 mm). 1.8° black: antistatic. 2.2° gray: tightest curves (min 690 mm inner radius). Always specify radius and conicity when ordering.",
    page_range: "70–75",
    load_table: [
      { tube: "Ø50×1.5 Conicity 1.8°", shaft_mm: 12, loads: { 200: 500, 400: 350, 600: 240, 800: 185 } },
      { tube: "Ø60×1.5 Conicity 1.8°", shaft_mm: 14, loads: { 200: 500, 400: 400, 600: 300, 800: 240 } },
      { tube: "Ø60×1.5 Conicity 2.2°", shaft_mm: 14, loads: { 200: 500, 400: 380, 600: 275, 800: 215 } },
    ],
  },
  {
    id: "1700H",
    name: "Series 1700 Heavy",
    subtitle: "Universal Conveyor Roller — Heavy",
    platform: "1700",
    duty: "Heavy",
    color: "#dc2626",
    driveType: "Driven / Belt idler (Ø60×3)",
    bearingType: "6004 2RZ precision steel, bearing play C3",
    maxLoad_N: 3000,
    maxSpeed_ms: 2.0,
    temp_min_C: -30, temp_max_C: 40,
    tubes_mm: ["Ø40×2", "Ø50×2", "Ø60×2", "Ø60×3"],
    materials: ["Zinc-plated steel", "Stainless steel"],
    shaft_options: ["Spring-loaded Ø12", "Fixed Ø12", "Female thread Ø12", "Spring-loaded Ø15", "Fixed Ø15"],
    antistatic: true,
    applications: ["Heavy unit handling", "Pallets & rims", "Barrels & containers", "Belt idler (Ø60×3)", "Mechanical engineering"],
    tags: ["Heavy Duty", "3000 N", "Belt Idler"],
    sleeve_options: ["PVC sleeve", "PU sleeve", "Lagging"],
    image_url: "https://base44.app/api/apps/69dd9ffccab4dd693d4d92f5/files/mp/public/69dd9ffccab4dd693d4d92f5/70725b856_1700_heavy_p76_i0.jpeg",
    notes: "Ø60×3 steel tube also usable as belt idler. Oiled bearings for deep freeze (−30°C). Shaft Ø12 or Ø15 mm.",
    page_range: "76–79",
    load_table: [
      { tube: "Ø40×2 Zinc-plated", shaft_mm: 12, loads: { 200: 1500, 400: 750, 600: 475, 800: 345, 1000: 270, 1200: 220 } },
      { tube: "Ø50×2 Zinc-plated", shaft_mm: 12, loads: { 200: 2200, 400: 1300, 600: 900, 800: 690, 1000: 565, 1200: 475 } },
      { tube: "Ø60×2 Zinc-plated", shaft_mm: 15, loads: { 200: 3000, 400: 2000, 600: 1500, 800: 1200, 1000: 990, 1200: 840 } },
      { tube: "Ø60×3 Steel (Belt Idler)", shaft_mm: 15, loads: { 200: 3000, 400: 2200, 600: 1700, 800: 1390, 1000: 1165, 1200: 1000 } },
    ],
  },
  {
    id: "3500",
    name: "Series 3500",
    subtitle: "Fixed Drive Conveyor Roller — Standard",
    platform: "1700",
    duty: "Medium",
    color: "#7c3aed",
    driveType: "Chain / PolyVee / Flat belt / Toothed belt",
    bearingType: "6002 2RZ precision steel, bearing play C3 — widest drive head range",
    maxLoad_N: 2000,
    maxSpeed_ms: 2.0,
    temp_min_C: -30, temp_max_C: 40,
    tubes_mm: ["Ø40×1.5", "Ø50×1.5", "Ø50×2.8 PVC", "Ø60×1.5", "Ø60×2", "Ø63×3 PVC"],
    materials: ["Zinc-plated steel", "Stainless steel", "Aluminum", "PVC"],
    shaft_options: ["Female thread Ø12", "Female thread Ø14"],
    antistatic: "Available (not PVC / not IP55)",
    applications: ["Chain-driven conveying", "Flat belt drive", "PolyVee belt drive", "Toothed belt drive", "IP55 protected environments"],
    tags: ["Fixed Drive", "Chain", "PolyVee", "IP55"],
    sleeve_options: ["PVC sleeve", "PU sleeve", "Lagging"],
    drive_heads: [
      "PolyVee drive head (Ø43 polymer, Ø56 welded steel)",
      "Round belt drive head (Ø37.8 mm)",
      "Flat belt drive head 38 mm",
      "Toothed belt 8-pitch, T18",
      "1/2\" polymer sprocket — T9, T11, T13, T14 (single)",
      "1/2\" polymer double sprocket — T14 (EL=RL+62)",
      "3/8\" polymer double sprocket — T20",
      "1/2\" welded steel sprocket — T14",
      "1/2\" welded steel double sprocket — T14",
      "5/8\" welded steel double sprocket — T13",
    ],
    image_url: "https://base44.app/api/apps/69dd9ffccab4dd693d4d92f5/files/mp/public/69dd9ffccab4dd693d4d92f5/808a4015d_3500_p84_i0.jpeg",
    notes: "EL = RL+40 (single sprocket / flat belt), RL+62 (double sprocket). PolyVee/round belt: EL = RL+36. IP55 variant: 0 to +40°C only.",
    page_range: "84–95",
    load_table: [
      { tube: "Ø40×1.5 Steel — 1/2\" sprocket T14", shaft_mm: 12, loads: { 200: 1320, 400: 975, 600: 915, 800: 885, 1000: 870, 1200: 860 } },
      { tube: "Ø50×1.5 Steel — 1/2\" sprocket T14", shaft_mm: 14, loads: { 200: 1500, 400: 1500, 600: 1450, 800: 1405, 1000: 1385, 1200: 1370 } },
      { tube: "Ø60×1.5 Steel — 1/2\" sprocket T14", shaft_mm: 14, loads: { 200: 2000, 400: 1510, 600: 1405, 800: 1360, 1000: 1340, 1200: 1325 } },
    ],
  },
  {
    id: "3800",
    name: "Series 3800",
    subtitle: "Friction Conveyor Roller — Zero Pressure Accumulation",
    platform: "1700",
    duty: "Medium",
    color: "#ec4899",
    driveType: "Chain / Flat belt / Toothed belt (friction slip coupling)",
    bearingType: "6002 2RZ precision steel — friction coupling releases under back pressure",
    maxLoad_N: 500,
    maxSpeed_ms: 0.5,
    temp_min_C: -5, temp_max_C: 40,
    tubes_mm: ["Ø50×1.5", "Ø50×2.8 PVC", "Ø60×1.5"],
    materials: ["Zinc-plated steel", "Stainless steel", "Aluminum", "PVC"],
    shaft_options: ["Female thread Ø12", "Female thread Ø14", "Female thread Ø15"],
    antistatic: true,
    applications: ["Zero-pressure accumulation", "Buffer sections", "Packaging industry", "Controlled accumulation"],
    tags: ["Accumulation", "Friction", "Buffer"],
    sleeve_options: ["PVC sleeve", "PU sleeve", "Lagging"],
    drive_heads: [
      "Flat belt drive head 38 mm",
      "Round belt drive head",
      "Toothed belt 8-pitch T18",
      "1/2\" polymer sprocket — T9, T14",
      "1/2\" polymer double sprocket — T14",
      "3/8\" polymer double sprocket — T20",
      "1/2\" steel sprocket — T14",
      "1/2\" steel double sprocket — T14",
    ],
    image_url: "https://base44.app/api/apps/69dd9ffccab4dd693d4d92f5/files/mp/public/69dd9ffccab4dd693d4d92f5/644fcc1be_3800_p126_i0.jpeg",
    notes: "Accumulation force depends on material weight. Single and double friction versions available. Series 3870 available with two-sided friction coupling (no width positioning needed). Consult planning section p.191.",
    page_range: "117–131",
    load_table: [
      { tube: "Ø50×1.5 Steel — 1/2\" sprocket", shaft_mm: 12, loads: { 200: 500, 400: 500, 600: 500, 800: 500, 1000: 500, 1200: 500 } },
      { tube: "Ø60×1.5 Steel — 1/2\" sprocket", shaft_mm: 14, loads: { 200: 500, 400: 500, 600: 500, 800: 500, 1000: 500, 1200: 500 } },
      { tube: "Ø50×2.8 PVC — 1/2\" sprocket", shaft_mm: 12, loads: { 200: 500, 400: 185, 600: 75, 800: 40 } },
    ],
  },
  {
    id: "3950",
    name: "Series 3950",
    subtitle: "Heavy-Duty Fixed Drive Conveyor Roller",
    platform: "1450",
    duty: "Heavy",
    color: "#b45309",
    driveType: "5/8\" welded steel chain sprockets",
    bearingType: "6205 2RZ precision steel — permanently welded steel sprockets",
    maxLoad_N: 5000,
    maxSpeed_ms: 0.5,
    temp_min_C: -5, temp_max_C: 40,
    temp_deepfreeze_C: -30,
    tubes_mm: ["Ø80×2", "Ø80×3", "Ø89×3"],
    materials: ["Zinc-plated steel", "Stainless steel"],
    shaft_options: ["Female thread Ø20 mm", "Male thread Ø20 mm"],
    antistatic: "Via sprocket head",
    applications: ["Heavy pallet conveying", "Steel containers", "Barrels & drums", "Wheels & tires", "Industrial heavy conveying"],
    tags: ["Heavy Duty", "5000 N", "Welded Sprocket"],
    sleeve_options: [],
    drive_heads: [
      "Welded steel 5/8\" sprocket — T15 single",
      "Welded steel 5/8\" sprocket — T18 single",
      "Welded steel 5/8\" double sprocket — T15",
      "Welded steel 5/8\" double sprocket — T18",
    ],
    image_url: "https://base44.app/api/apps/69dd9ffccab4dd693d4d92f5/files/mp/public/69dd9ffccab4dd693d4d92f5/d3be2eb5e_3950_p132_i0.jpeg",
    notes: "Polyamide housing: 5000 N, −5 to +40°C. Steel housing: 2500 N, −30 to +40°C. All components zinc-plated after welding. Ø89×3 maintains 5000 N across 200–1600 mm lengths.",
    page_range: "132–137",
    load_table: [
      { tube: "Ø80×2 Steel — T15/T18", shaft_mm: 20, loads: { 200: 5000, 400: 5000, 600: 5000, 800: 5000, 1000: 5000, 1200: 4340, 1400: 3170, 1600: 2420 } },
      { tube: "Ø80×3 Steel — T15/T18", shaft_mm: 20, loads: { 200: 5000, 400: 5000, 600: 5000, 800: 5000, 1000: 5000, 1200: 5000, 1400: 4580, 1600: 3490 } },
      { tube: "Ø89×3 Steel — T15/T18", shaft_mm: 20, loads: { 200: 5000, 400: 5000, 600: 5000, 800: 5000, 1000: 5000, 1200: 5000, 1400: 5000, 1600: 4865 } },
    ],
  },
  {
    id: "MSC50",
    name: "Series MSC 50",
    subtitle: "Magnetic Speed Controller — Brake Roller",
    platform: "1700",
    duty: "Light",
    color: "#0f766e",
    driveType: "Gravity only (eddy current brake)",
    bearingType: "6002 2RZ (oiled) — Neodyme N45 magnets, contact-free braking",
    maxLoad_N: 350,
    maxSpeed_ms: 2.0,
    temp_min_C: 0, temp_max_C: 40,
    tubes_mm: ["Ø51×2", "Ø50×1.5 + PU sleeve"],
    materials: ["Zinc-plated steel", "Stainless steel"],
    shaft_options: ["Spring-loaded 11 HEX", "Fixed 11 HEX", "Female thread M8 (11 HEX)"],
    antistatic: true,
    applications: ["Gravity conveyors", "Sorter end points", "Spiral conveyors", "Speed-controlled descent", "Electronics conveying"],
    tags: ["Brake Roller", "Magnetic", "Gravity", "No Controls"],
    sleeve_options: ["PU sleeve"],
    image_url: "https://base44.app/api/apps/69dd9ffccab4dd693d4d92f5/files/mp/public/69dd9ffccab4dd693d4d92f5/42d2269d6_MSC50_p138_i0.jpeg",
    notes: "Purely mechanical — no wiring or controls needed. Decelerates materials up to 35 kg. Min temp 0°C (higher than other series). Direction-independent. Same fastening holes as standard rollers — drop-in compatible.",
    page_range: "138–141",
    load_table: [
      { tube: "Ø51×2 Zinc-plated", shaft_mm: 11, loads: { 200: 350, 400: 350, 600: 350, 800: 350, 1000: 350, 1200: 350, 1400: 350 } },
      { tube: "Ø50×1.5 + PU sleeve", shaft_mm: 11, loads: { 200: 350, 400: 350, 600: 350, 800: 350, 1000: 350, 1200: 350, 1400: 350 } },
    ],
  },
];

const DUTY_ORDER = { Light: 0, Medium: 1, Heavy: 2 };

// ─── UNIT TOGGLE BUTTON ───────────────────────────────────────────────────────
function UnitToggle({ metric, setMetric }) {
  return (
    <div style={{ display: "flex", alignItems: "center", background: "#f1f5f9", borderRadius: 8, padding: 3, gap: 2 }}>
      {["Metric", "Imperial"].map(u => {
        const active = (u === "Metric") === metric;
        return (
          <button key={u} onClick={() => setMetric(u === "Metric")}
            style={{ padding: "5px 14px", borderRadius: 6, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 700,
              background: active ? C.navy : "transparent", color: active ? "#fff" : C.muted, transition: "all 0.15s" }}>
            {u === "Metric" ? "SI (m/s, N, mm)" : "Imperial (fpm, lbf, in)"}
          </button>
        );
      })}
    </div>
  );
}

// ─── TOP BAR ─────────────────────────────────────────────────────────────────
function TopBar({ metric, setMetric }) {
  return (
    <div style={{ background: C.navy, borderBottom: "3px solid " + C.gold, position: "sticky", top: 0, zIndex: 100 }}>
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
          <a href={createPageUrl("Home")} style={{ color: "rgba(255,255,255,0.7)", fontSize: 13, textDecoration: "none" }}>← Catalog</a>
          <a href={createPageUrl("RFQCart")} style={{ background: C.gold, color: C.navy, padding: "7px 16px", borderRadius: 8, fontSize: 13, fontWeight: 700, textDecoration: "none" }}>RFQ Cart</a>
        </div>
      </div>
    </div>
  );
}

// ─── SERIES CARD ─────────────────────────────────────────────────────────────
function SeriesCard({ s, onSelect, fmt }) {
  const [hov, setHov] = useState(false);
  const [imgErr, setImgErr] = useState(false);

  return (
    <div onClick={() => onSelect(s)} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ background: "#fff", borderRadius: 16, border: `2px solid ${hov ? s.color : C.border}`,
        overflow: "hidden", cursor: "pointer", transition: "all 0.18s",
        boxShadow: hov ? `0 12px 32px ${s.color}28` : "0 1px 4px rgba(0,0,0,0.06)",
        transform: hov ? "translateY(-3px)" : "none", display: "flex", flexDirection: "column" }}>

      {/* Real product photo */}
      <div style={{ height: 190, background: "#f8fafc", overflow: "hidden", position: "relative",
        display: "flex", alignItems: "center", justifyContent: "center",
        borderBottom: `3px solid ${hov ? s.color : "#e2e8f0"}`, transition: "border-color 0.18s" }}>
        {s.image_url && !imgErr ? (
          <img src={s.image_url} alt={s.name} onError={() => setImgErr(true)}
            style={{ width: "100%", height: "100%", objectFit: "cover",
              transition: "transform 0.3s ease", transform: hov ? "scale(1.04)" : "scale(1)" }} />
        ) : (
          <div style={{ fontSize: 48, color: s.color + "50" }}>⚙</div>
        )}
        <div style={{ position: "absolute", top: 10, left: 10, background: s.color, color: "#fff",
          fontSize: 10, fontWeight: 800, padding: "3px 10px", borderRadius: 20, textTransform: "uppercase",
          boxShadow: "0 2px 8px rgba(0,0,0,0.2)" }}>{s.duty} Duty</div>
        <div style={{ position: "absolute", bottom: 10, right: 10, background: "rgba(0,0,0,0.55)", color: "#fff",
          fontSize: 10, padding: "2px 8px", borderRadius: 12 }}>pp. {s.page_range}</div>
      </div>

      {/* Card body */}
      <div style={{ padding: "14px 16px", flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 800, color: C.text }}>{s.name}</div>
          <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{s.subtitle}</div>
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
          {s.tags.map(t => (
            <span key={t} style={{ background: s.color + "18", color: s.color, fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 20 }}>{t}</span>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "5px 10px", fontSize: 11 }}>
          <div><span style={{ color: C.muted }}>Max Load</span><br /><strong style={{ color: C.text }}>{fmt.load(s.maxLoad_N)}</strong></div>
          <div><span style={{ color: C.muted }}>Max Speed</span><br /><strong style={{ color: C.text }}>{fmt.speed(s.maxSpeed_ms)}</strong></div>
          <div><span style={{ color: C.muted }}>Temp Range</span><br /><strong style={{ color: C.text }}>{fmt.temp(s.temp_min_C)} to {fmt.temp(s.temp_max_C)}</strong></div>
          <div><span style={{ color: C.muted }}>Platform</span><br /><strong style={{ color: C.text }}>{s.platform}</strong></div>
        </div>

        <div style={{ padding: "7px 10px", background: s.color + "0d", borderRadius: 7, fontSize: 11, color: C.muted }}>
          <strong style={{ color: C.text }}>Applications: </strong>{s.applications.slice(0, 3).join(", ")}
        </div>
      </div>

      <div style={{ padding: "10px 16px", borderTop: "1px solid " + C.border, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontSize: 11, color: C.muted }}>{s.driveType}</div>
        <div style={{ background: hov ? s.color : "transparent", color: hov ? "#fff" : s.color,
          border: `1.5px solid ${s.color}`, padding: "5px 14px", borderRadius: 7, fontSize: 12, fontWeight: 700, transition: "all 0.18s" }}>
          Spec Sheet →
        </div>
      </div>
    </div>
  );
}

// ─── LOAD CAPACITY TABLE ──────────────────────────────────────────────────────
function LoadTable({ series, fmt, metric }) {
  if (!series.load_table || !series.load_table.length) return null;
  const allLengths = [...new Set(series.load_table.flatMap(r => Object.keys(r.loads).map(Number)))].sort((a, b) => a - b);

  return (
    <div>
      <div style={{ fontWeight: 700, color: C.text, fontSize: 13, marginBottom: 8 }}>Load Capacity Table</div>
      <div style={{ fontSize: 10, color: C.muted, marginBottom: 8 }}>Max static load — temperature +5 to +40°C</div>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
          <thead>
            <tr style={{ background: C.navy }}>
              <th style={{ padding: "8px 10px", color: "#fff", textAlign: "left", fontWeight: 700, whiteSpace: "nowrap" }}>Tube / Drive</th>
              <th style={{ padding: "8px 10px", color: "#fff", textAlign: "center", fontWeight: 700 }}>Shaft</th>
              {allLengths.map(l => (
                <th key={l} style={{ padding: "8px 10px", color: "#fff", textAlign: "center", fontWeight: 700, whiteSpace: "nowrap" }}>
                  {metric ? `${l} mm` : `${(l / 25.4).toFixed(1)}"`}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {series.load_table.map((row, i) => (
              <tr key={i} style={{ background: i % 2 === 0 ? "#f8fafc" : "#fff", borderBottom: "1px solid #e5e7eb" }}>
                <td style={{ padding: "7px 10px", color: C.navyMid, fontWeight: 600, whiteSpace: "nowrap" }}>{row.tube}</td>
                <td style={{ padding: "7px 10px", color: C.muted, textAlign: "center", whiteSpace: "nowrap" }}>
                  {metric ? `Ø${row.shaft_mm} mm` : `Ø${(row.shaft_mm / 25.4).toFixed(3)}"`}
                </td>
                {allLengths.map(l => {
                  const v = row.loads[l];
                  return (
                    <td key={l} style={{ padding: "7px 10px", textAlign: "center", color: v ? C.text : "#d1d5db", fontWeight: v ? 600 : 400 }}>
                      {v != null ? fmt.load(v) : "—"}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── SERIES DETAIL MODAL ──────────────────────────────────────────────────────
function SeriesDetail({ series: s, onClose, fmt, metric }) {
  const [tab, setTab] = useState("overview");
  const [imgErr, setImgErr] = useState(false);

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "loads", label: "Load Capacity" },
    { id: "drive", label: "Drive Options" },
    { id: "order", label: "How to Order" },
  ];

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 1000, display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "20px 16px", overflowY: "auto" }}>
      <div style={{ background: "#fff", borderRadius: 16, width: "100%", maxWidth: 780, boxShadow: "0 24px 80px rgba(0,0,0,0.25)", position: "relative" }}>

        {/* Hero image */}
        {s.image_url && !imgErr && (
          <div style={{ height: 220, overflow: "hidden", borderRadius: "16px 16px 0 0", position: "relative" }}>
            <img src={s.image_url} alt={s.name} onError={() => setImgErr(true)}
              style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(15,35,64,0.8) 0%, transparent 60%)" }} />
            <div style={{ position: "absolute", bottom: 16, left: 20 }}>
              <div style={{ color: "#fff", fontSize: 22, fontWeight: 900 }}>{s.name}</div>
              <div style={{ color: C.goldLight, fontSize: 13, marginTop: 2 }}>{s.subtitle}</div>
            </div>
            <div style={{ position: "absolute", top: 12, right: 12, background: s.color, color: "#fff", padding: "4px 12px", borderRadius: 20, fontSize: 11, fontWeight: 800 }}>{s.duty} Duty</div>
          </div>
        )}

        {/* Close button */}
        <button onClick={onClose} style={{ position: "absolute", top: 12, right: 12, background: "rgba(0,0,0,0.4)", border: "none", borderRadius: "50%", width: 32, height: 32, cursor: "pointer", color: "#fff", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10 }}>✕</button>

        {/* Tabs */}
        <div style={{ display: "flex", borderBottom: "1px solid " + C.border, padding: "0 20px" }}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              style={{ padding: "12px 16px", border: "none", background: "none", cursor: "pointer", fontSize: 13, fontWeight: tab === t.id ? 700 : 400,
                color: tab === t.id ? s.color : C.muted, borderBottom: tab === t.id ? `2px solid ${s.color}` : "2px solid transparent", marginBottom: -1 }}>
              {t.label}
            </button>
          ))}
        </div>

        <div style={{ padding: "20px 24px", maxHeight: "60vh", overflowY: "auto" }}>

          {tab === "overview" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {[
                  ["Max Load", fmt.load(s.maxLoad_N)],
                  ["Max Speed", fmt.speed(s.maxSpeed_ms)],
                  ["Temp Range", `${fmt.temp(s.temp_min_C)} to ${fmt.temp(s.temp_max_C)}`],
                  ["Platform", s.platform],
                  ["Antistatic", String(s.antistatic)],
                  ["Catalog Pages", `pp. ${s.page_range}`],
                ].map(([k, v]) => (
                  <div key={k} style={{ background: "#f8fafc", borderRadius: 8, padding: "10px 14px" }}>
                    <div style={{ fontSize: 10, color: C.muted, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>{k}</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: C.text, marginTop: 3 }}>{v}</div>
                  </div>
                ))}
              </div>

              <div>
                <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 8 }}>Tube Options</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {s.tubes_mm.map(t => (
                    <span key={t} style={{ background: "#e0f2fe", color: "#0369a1", padding: "4px 10px", borderRadius: 8, fontSize: 12, fontWeight: 600 }}>{t}</span>
                  ))}
                </div>
              </div>

              <div>
                <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 8 }}>Tube Materials</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {s.materials.map(m => (
                    <span key={m} style={{ background: "#f1f5f9", color: C.text, padding: "4px 10px", borderRadius: 8, fontSize: 12, fontWeight: 600 }}>{m}</span>
                  ))}
                </div>
              </div>

              <div>
                <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 8 }}>Shaft Options</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {s.shaft_options.map(o => (
                    <span key={o} style={{ background: "#fef3c7", color: "#92400e", padding: "4px 10px", borderRadius: 8, fontSize: 12, fontWeight: 600 }}>{o}</span>
                  ))}
                </div>
              </div>

              {s.sleeve_options && s.sleeve_options.length > 0 && (
                <div>
                  <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 8 }}>Sleeve Options</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {s.sleeve_options.map(o => (
                      <span key={o} style={{ background: "#f0fdf4", color: "#15803d", padding: "4px 10px", borderRadius: 8, fontSize: 12, fontWeight: 600 }}>{o}</span>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 8 }}>Applications</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {s.applications.map(a => (
                    <span key={a} style={{ background: s.color + "12", color: s.color, padding: "4px 10px", borderRadius: 8, fontSize: 12, fontWeight: 600 }}>{a}</span>
                  ))}
                </div>
              </div>

              <div>
                <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 6 }}>Bearing</div>
                <div style={{ fontSize: 12, color: C.muted }}>{s.bearingType}</div>
              </div>

              {s.notes && (
                <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 8, padding: "10px 14px", fontSize: 12, color: "#92400e" }}>
                  <strong>Notes: </strong>{s.notes}
                </div>
              )}
            </div>
          )}

          {tab === "loads" && <LoadTable series={s} fmt={fmt} metric={metric} />}

          {tab === "drive" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 8 }}>Drive Type</div>
                <div style={{ fontSize: 13, color: C.text }}>{s.driveType}</div>
              </div>
              {s.drive_heads && (
                <div>
                  <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 8 }}>Available Drive Heads</div>
                  {s.drive_heads.map((d, i) => (
                    <div key={i} style={{ padding: "8px 12px", background: i % 2 === 0 ? "#f8fafc" : "#fff", borderRadius: 6, fontSize: 12, color: C.text, marginBottom: 4 }}>
                      • {d}
                    </div>
                  ))}
                </div>
              )}
              {!s.drive_heads && (
                <div style={{ fontSize: 12, color: C.muted }}>Drive head configuration depends on tube diameter and bearing selected. Contact Uniking Canada for full drive head matrix.</div>
              )}
            </div>
          )}

          {tab === "order" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ background: C.navy, borderRadius: 10, padding: "14px 18px", color: "#fff" }}>
                <div style={{ fontSize: 11, color: C.goldLight, fontWeight: 600, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.5px" }}>Interroll Part Code Format</div>
                <div style={{ fontFamily: "monospace", fontSize: 15, color: C.gold, fontWeight: 700 }}>
                  Bearing.Tube.Shaft — RL (mm or in)
                </div>
              </div>
              <div style={{ fontSize: 12, color: C.text, lineHeight: 1.7 }}>
                <strong>Ordering dimensions:</strong><br />
                RL = Reference Length / Ordering Length<br />
                EL = Installation Length (inside side profiles)<br />
                AGL = Total shaft length<br />
                U = Usable tube length
              </div>
              <div style={{ fontSize: 12, color: C.text, lineHeight: 1.7 }}>
                <strong>Dimension formulas (Series {s.id}):</strong><br />
                {s.id === "3500" || s.id === "3800" || s.id === "3950" ? (
                  <>• Single sprocket head: EL = AGL = RL + 40 mm<br />• Double sprocket head: EL = AGL = RL + 62 mm<br />• PolyVee / round belt: EL = AGL = RL + 36 mm</>
                ) : s.id === "MSC50" ? (
                  <>• Spring-loaded / Fixed shaft: EL = AGL = RL + 10 mm<br />• Spring-loaded: AGL = EL + 22 mm<br />• Female thread: EL = AGL = RL + 10 mm</>
                ) : (
                  <>• EL = RL + shaft extension (varies by shaft type)<br />• Consult catalog pages {s.page_range} for exact dimension tables</>
                )}
              </div>
              <div style={{ background: "#f0f9ff", border: "1px solid #bae6fd", borderRadius: 8, padding: "12px 16px" }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: C.navyMid, marginBottom: 4 }}>Contact Uniking Canada to Order</div>
                <div style={{ fontSize: 12, color: C.muted }}>514-886-5270 · sales@unikingcanada.com</div>
                <div style={{ fontSize: 11, color: C.muted, marginTop: 4 }}>Reference Interroll Catalog 01/2026, pages {s.page_range}</div>
              </div>
            </div>
          )}
        </div>

        {/* Footer CTA */}
        <div style={{ padding: "16px 24px", borderTop: "1px solid " + C.border, display: "flex", gap: 10, justifyContent: "flex-end", borderRadius: "0 0 16px 16px", background: "#f8fafc" }}>
          <button onClick={onClose}
            style={{ padding: "9px 20px", background: "#fff", border: "1px solid " + C.border, borderRadius: 8, cursor: "pointer", fontSize: 13, color: C.muted, fontWeight: 600 }}>
            Back to Series
          </button>
          <button onClick={() => {
            const item = {
              cartId: "roller_" + Date.now(),
              id: "roller_" + Date.now(),
              _source: "interroll_roller",
              name: `${s.name} — ${s.subtitle}`,
              series: s.name,
              type: "Conveyor Roller",
              style: s.subtitle,
              category: s.duty + " Duty",
              image_url: s.image_url,
              materials: s.materials.join(", "),
              quantity: 1,
              unit: "Each",
              notes: `Platform: ${s.platform} | Max Load: ${s.maxLoad_N} N | Drive: ${s.driveType} | Catalog pp. ${s.page_range}`,
            };
            try {
              const existing = JSON.parse(localStorage.getItem("uniking_rfq_cart") || "[]");
              localStorage.setItem("uniking_rfq_cart", JSON.stringify([...existing, item]));
              window.dispatchEvent(new Event("rfq_cart_updated"));
            } catch(e) {}
            onClose();
            window.location.href = createPageUrl("RFQCart");
          }}
            style={{ padding: "9px 20px", background: C.gold, color: C.navy, border: "none", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 800 }}>
            Add to RFQ Cart →
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
export default function RollerConfigurator() {
  const { metric, setMetric, fmt } = useUnits();
  const [filter, setFilter] = useState("All");
  const [selected, setSelected] = useState(null);

  const filters = ["All", "Light", "Medium", "Heavy"];
  const filtered = SERIES.filter(s => filter === "All" || s.duty === filter)
    .sort((a, b) => (DUTY_ORDER[a.duty] - DUTY_ORDER[b.duty]) || a.id.localeCompare(b.id));

  return (
    <div style={{ background: C.bg, minHeight: "100vh", fontFamily: "'Inter', 'Segoe UI', sans-serif" }}>
      <TopBar metric={metric} setMetric={setMetric} />

      {/* Hero */}
      <div style={{ background: `linear-gradient(135deg, ${C.navy} 0%, ${C.navyLight} 100%)`, padding: "36px 20px 32px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
            <div>
              <div style={{ color: C.gold, fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", marginBottom: 8 }}>
                Interroll Authorized Partner
              </div>
              <h1 style={{ color: "#fff", fontSize: 26, fontWeight: 900, margin: "0 0 8px" }}>
                Conveyor Roller Series
              </h1>
              <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 13, margin: 0, maxWidth: 500 }}>
                All {SERIES.length} series from the official Interroll 2026 catalog — real specifications, load tables, and technical data.
              </p>
            </div>
            <div style={{ background: "rgba(255,255,255,0.08)", borderRadius: 12, padding: "12px 20px", minWidth: 180 }}>
              <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 6 }}>Units</div>
              <UnitToggle metric={metric} setMetric={setMetric} />
            </div>
          </div>

          {/* Duty filter */}
          <div style={{ display: "flex", gap: 8, marginTop: 24, flexWrap: "wrap" }}>
            {filters.map(f => (
              <button key={f} onClick={() => setFilter(f)}
                style={{ padding: "7px 18px", borderRadius: 20, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 700, transition: "all 0.15s",
                  background: filter === f ? C.gold : "rgba(255,255,255,0.12)",
                  color: filter === f ? C.navy : "rgba(255,255,255,0.8)" }}>
                {f === "All" ? `All Series (${SERIES.length})` : `${f} Duty`}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "28px 20px 60px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 20 }}>
          {filtered.map(s => (
            <SeriesCard key={s.id} s={s} onSelect={setSelected} fmt={fmt} />
          ))}
        </div>
      </div>

      {/* Detail modal */}
      {selected && (
        <SeriesDetail series={selected} onClose={() => setSelected(null)} fmt={fmt} metric={metric} />
      )}
    </div>
  );
}
