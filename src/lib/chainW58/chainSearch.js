/**
 * chainSearch.js — designation-first search over the W58 chain index.
 * Searches designation, aliases (search-only), variants (search-only), series, group and pitch.
 * Results never expose which alias matched — only that it was an interchange match.
 */
import { num } from "./chainText";

const norm = (s) => String(s || "").toLowerCase().replace(/[\s\-_/.#]+/g, "");
const words = (s) => String(s || "").toLowerCase().split(/[^a-z0-9.]+/).filter(Boolean);

function parsePitchQuery(q) {
  const t = q.trim().toLowerCase();
  let m = t.match(/^(\d+(?:\.\d+)?)\s*mm$/);
  if (m) return { mm: parseFloat(m[1]) };
  m = t.match(/^(?:(\d+)\s+)?(\d+)\/(\d+)\s*(?:in|"|inch)?$/);
  if (m) return { inch: (m[1] ? parseInt(m[1], 10) : 0) + parseInt(m[2], 10) / parseInt(m[3], 10) };
  m = t.match(/^(\d*\.\d+)\s*(?:in|"|inch)?$/);
  if (m) return { inch: parseFloat(m[1]) };
  m = t.match(/^(\d+(?:\.\d+)?)\s*(?:in|"|inch)$/);
  if (m) return { inch: parseFloat(m[1]) };
  return null;
}

/** Precompute a search record per chain (call once per index). */
export function buildSearchIndex(index) {
  return index.map((c) => {
    const variants = Array.isArray(c.variants) ? c.variants.map((v) => (v && typeof v === "object" ? v.name : v)) : [];
    const aliases = [...(Array.isArray(c.aliases) ? c.aliases : []), ...variants].filter(Boolean);
    return {
      c,
      num: norm(c.chain_number),
      aliases: aliases.map(norm),
      text: words([c.display_name, c.series, c.catalog_group, c.chain_family, c.construction, c.standard].join(" ")),
      pin: num(c.pitch_in),
      pmm: num(c.pitch_mm),
    };
  });
}

/**
 * @returns [{ chain, score, via: 'designation'|'interchange'|'text'|'pitch' }]
 */
export function searchChains(searchIndex, query, { limit = 50, group = null } = {}) {
  const q = String(query || "").trim();
  if (!q) return [];
  const nq = norm(q);
  const pitch = parsePitchQuery(q);
  const qWords = words(q);
  const out = [];
  for (const r of searchIndex) {
    if (group && r.c.catalog_group !== group) continue;
    let score = 0, via = "text";
    if (nq && r.num === nq) { score = 1000; via = "designation"; }
    else if (nq && r.aliases.includes(nq)) { score = 900; via = "interchange"; }
    else if (nq && nq.length >= 2 && r.num.startsWith(nq)) { score = 700 - (r.num.length - nq.length); via = "designation"; }
    else if (nq && nq.length >= 3 && r.aliases.some((a) => a.startsWith(nq))) { score = 600; via = "interchange"; }
    else if (nq && nq.length >= 3 && r.num.includes(nq)) { score = 450; via = "designation"; }
    if (pitch) {
      const ok = pitch.inch != null
        ? r.pin != null && Math.abs(r.pin - pitch.inch) <= Math.max(0.006, pitch.inch * 0.004)
        : r.pmm != null && Math.abs(r.pmm - pitch.mm) <= Math.max(0.15, pitch.mm * 0.004);
      if (ok && score < 500) { score = 500; via = "pitch"; }
    }
    if (!score && qWords.length) {
      const hits = qWords.filter((w) => r.text.some((t) => t.startsWith(w)) || r.num.includes(norm(w)));
      if (hits.length === qWords.length) { score = 100 + hits.length; via = "text"; }
    }
    if (score) out.push({ chain: r.c, score, via });
  }
  out.sort((a, b) => b.score - a.score || String(a.chain.chain_number).localeCompare(String(b.chain.chain_number), undefined, { numeric: true }));
  return out.slice(0, limit);
}
