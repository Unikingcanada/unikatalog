/**
 * chainText.js — display helpers for the W58 chain section.
 *
 * Rule: customer-facing text never names a manufacturer. The Version X master is
 * already brand-free, but a few series strings still carry a maker name (e.g. the
 * "8-" prefix heavy chains). scrubMakers() is the safety net applied to every string
 * the chain section renders. Aliases / variants are search-only and never rendered.
 */

const MAKERS = [
  "U\\.?S\\.? Tsubaki", "Tsubakimoto", "Tsubaki", "Renold", "Rexnord", "Rex", "Link-?Belt", "Donghua",
  "Allied[\\s-]?Locke", "Mac[\\s-]?Chain", "Webster", "Diamond Chain", "Daido", "D\\.I\\.D\\.?", "Ewart",
  "Jeffrey", "iwis", "Kettenwulf", "Wulf", "FB Chain", "Pewag", "Hitachi", "Senqcia", "Enuma", "Regina",
  "Morse", "Boston Gear", "Sedis", "Brampton", "Drives Inc", "Columbus McKinnon", "Ramsey", "Whitney",
  "Union Chain", "HKK", "Dongbo", "Hangzhou", "Zhejiang", "Jiangsu", "Qingdao", "Movex", "Intralox",
  "System ?Plast", "Habasit",
];
const MAKER_RE = new RegExp("\\b(?:" + MAKERS.join("|") + ")\\b", "i");
const MAKER_RE_G = new RegExp("\\b(?:" + MAKERS.join("|") + ")\\b", "gi");

/** True if a string mentions a manufacturer. Used by QA and the scrubber. */
export function mentionsMaker(text) {
  return typeof text === "string" && MAKER_RE.test(text);
}

/** Remove manufacturer names from a customer-facing string. */
export function scrubMakers(text) {
  if (text == null) return "";
  let s = String(text);
  if (!MAKER_RE.test(s)) return s;
  // Drop whole parentheticals that name a maker: "… (Morse 8- prefix high endurance)"
  s = s.replace(/\s*\([^()]*\)/g, (m) => (MAKER_RE.test(m) ? "" : m));
  s = s.replace(MAKER_RE_G, "");
  return s.replace(/\s{2,}/g, " ").replace(/\s+([,.;:)])/g, "$1").replace(/^[\s,;:-]+|[\s,;:-]+$/g, "").trim();
}

/**
 * tx() — every data string the chain section prints goes through this:
 * maker names removed, and em/en dashes shown as a short hyphen (LA CHAÎNE voice rule).
 */
export function tx(text) {
  return scrubMakers(text).replace(/\s*[—–]\s*/g, " - ");
}

/** Copy for values the master does not carry (brand voice rule). */
export const ON_QUOTE = "Confirmed by Uniking on quote";

const num = (v) => {
  if (v === null || v === undefined || v === "") return null;
  const n = typeof v === "number" ? v : parseFloat(String(v).replace(",", "."));
  return Number.isFinite(n) ? n : null;
};
export { num };

export function fmtIn(v) {
  const n = num(v);
  if (n === null) return null;
  return (Math.round(n * 1000) / 1000).toString();
}
export function fmtMm(v) {
  const n = num(v);
  if (n === null) return null;
  return (Math.round(n * 10) / 10).toString();
}
export function fmtInt(v) {
  const n = num(v);
  if (n === null) return null;
  return Math.round(n).toLocaleString("en-CA");
}
/** "2.609 in · 66.3 mm" — either side may be missing. */
export function inMm(inch, mm) {
  const i = num(inch), m = num(mm);
  const mmv = m !== null ? m : i !== null ? i * 25.4 : null;
  const inv = i !== null ? i : m !== null ? m / 25.4 : null;
  if (inv === null) return null;
  return `${fmtIn(inv)} in · ${fmtMm(mmv)} mm`;
}

/**
 * Reference-drawing legend keys → Chain_Dimensions fields.
 * "f:" keys have a value in the master; "x:" keys are named on the drawing but the
 * master carries no figure, so they are shown as "confirmed on quotation".
 */
export const LEGEND_FIELDS = {
  "f:p": ["pitch_in", "pitch_mm"],
  "f:iw": ["roller_width_in", "roller_width_mm"],
  "f:rd": ["roller_dia_in", "roller_dia_mm"],
  "f:sh": ["plate_height_in", "plate_height_mm"],
  "f:st": ["plate_thickness_in", "plate_thickness_mm"],
  "f:pin": ["pin_dia_in", "pin_dia_mm"],
  "f:oaw": ["overall_width_in", "overall_width_mm"],
  "f:bu": ["bushing_dia_in", null],
};

export function legendRows(chain, dims) {
  const legend = Array.isArray(chain?.drawing_legend) ? chain.drawing_legend : [];
  return legend
    .filter((x) => Array.isArray(x) && x[1])
    .map(([key, label]) => {
      const f = key ? LEGEND_FIELDS[key] : null;
      const value = f && dims ? inMm(dims[f[0]], f[1] ? dims[f[1]] : null) : null;
      return { key: key || "", label: tx(label), value };
    });
}

/** Strand label for multi-strand chains. */
export function strandLabel(n) {
  const s = num(n) || 1;
  if (s <= 1) return "Single strand";
  const words = { 2: "Double", 3: "Triple", 4: "Quadruple", 5: "5-strand", 6: "6-strand", 8: "8-strand" };
  return (words[s] || `${s}-strand`) + (s <= 4 ? " strand" : "");
}

/** Group materials by class, keeping the order of first appearance. */
export function materialsByClass(materials) {
  const out = new Map();
  for (const m of Array.isArray(materials) ? materials : []) {
    if (!m || !m.name) continue;
    const cls = m.class || "Other";
    if (!out.has(cls)) out.set(cls, []);
    out.get(cls).push(m);
  }
  return [...out.entries()];
}

export function slug(s) {
  return String(s || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}
