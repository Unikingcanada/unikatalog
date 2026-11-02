/**
 * chainRepo.js — the single data source for the chain section (Version X master, W58).
 *
 * Production reads the Base44 entities only:
 *   Normalized_Chains, Chain_Dimensions, Performance_Data, Chain_Attachments,
 *   Chain_Media, Chain_Attachment_Codes, Chain_Catalog_Groups.
 * No static chain arrays are merged in.
 *
 * Preview mode (?chainsrc=static, remembered for the browser tab) reads the same W58
 * package straight from /chain-media/data/*.json. It exists so the section can be
 * checked before the admin loader has been run; ?chainsrc=db switches back.
 */
import { base44 } from "@/api/base44Client";

export const STATIC_BASE = "/chain-media/data/";
const SRC_KEY = "unk_chain_source";

export const CHAIN_ENTITIES = {
  chains: "Normalized_Chains",
  dimensions: "Chain_Dimensions",
  performance: "Performance_Data",
  attachments: "Chain_Attachments",
  media: "Chain_Media",
  codes: "Chain_Attachment_Codes",
  groups: "Chain_Catalog_Groups",
};

/** Light projection used for search, tiles and group lists. */
export const INDEX_FIELDS = [
  "chain_id", "chain_family", "catalog_group", "chain_number", "display_name", "series",
  "construction", "standard", "pitch_in", "pitch_mm", "strands", "aliases", "variants",
  "attachment_count", "attachment_coverage", "image_url", "status",
];
const DIM_FIELDS = [
  "chain_id", "pitch_in", "pitch_mm", "roller_width_in", "roller_width_mm", "roller_dia_in",
  "roller_dia_mm", "plate_height_in", "plate_height_mm",
];
const PERF_FIELDS = ["chain_id", "tensile_strength_lbs", "tensile_strength_kn", "working_load_lbs", "working_load_kn"];

export function getChainSourceMode() {
  try {
    const p = new URLSearchParams(window.location.search).get("chainsrc");
    if (p === "static" || p === "db") sessionStorage.setItem(SRC_KEY, p);
    return sessionStorage.getItem(SRC_KEY) === "static" ? "static" : "db";
  } catch {
    return "db";
  }
}

// ── generic entity reader ───────────────────────────────────────────────────
/**
 * Read every record matching `query`. Uses cursor paging when the backend supports it,
 * otherwise positional skip paging with a stable sort. Records are de-duplicated by id.
 */
export async function readAllEntity(entityName, { query = null, fields = null, sort = "created_date", pageSize = 1000, onPage } = {}) {
  const ent = base44.entities[entityName];
  const out = new Map();
  const keyOf = (r, i) => r.id || `${r.chain_id || ""}#${i}#${out.size}`;
  // Expected total, so a short read is detected instead of silently returned (W58 fix: the
  // first live run stopped at 1,000 because the server capped the page and sent no cursor).
  let expected = null;
  try { const n = await ent.count(query || undefined); if (typeof n === "number") expected = n; } catch { /* unknown */ }
  const complete = () => expected !== null && out.size >= expected;
  if (expected === 0) return [];

  // 1) cursor API
  let lastPageLen = 0;
  try {
    let cursor = null;
    for (let guard = 0; guard < 1000; guard++) {
      // The cursor carries the walk's query/sort/fields, so later pages send only cursor + limit.
      const opts = { limit: pageSize, sort };
      if (fields) opts.fields = fields;
      const page = cursor
        ? await ent.list({ cursor, limit: pageSize })
        : query ? await ent.filter(query, opts) : await ent.list(opts);
      if (!page || !Array.isArray(page.items)) break;
      page.items.forEach((r, i) => out.set(keyOf(r, i), r));
      lastPageLen = page.items.length;
      onPage && onPage(out.size);
      cursor = page.next_cursor || null;
      if (!cursor || !page.items.length || complete()) break;
    }
  } catch { /* fall through to positional paging */ }
  if (complete()) return [...out.values()];
  if (expected === null && out.size && lastPageLen < pageSize && lastPageLen > 0) return [...out.values()];

  // 2) positional paging. Stops only on an empty page, a page with nothing new, or the expected count
  //    (never on "short page", because the server may cap the page size below what was asked).
  const limit = Math.min(pageSize, 500);
  let skip = 0;
  for (let guard = 0; guard < 5000; guard++) {
    const batch = query
      ? await ent.filter(query, sort, limit, skip, fields || undefined)
      : await ent.list(sort, limit, skip, fields || undefined);
    if (!Array.isArray(batch) || !batch.length) break;
    const before = out.size;
    batch.forEach((r, i) => out.set(keyOf(r, skip + i), r));
    onPage && onPage(out.size);
    skip += batch.length;
    if (complete() || out.size === before) break;
  }
  if (expected !== null && out.size < expected) {
    console.warn(`[chainRepo] ${entityName}: read ${out.size} of ${expected} records`);
  }
  return [...out.values()];
}

export async function countEntity(entityName, query) {
  const ent = base44.entities[entityName];
  try {
    const n = await ent.count(query || undefined);
    if (typeof n === "number") return n;
  } catch { /* fall through */ }
  const all = await readAllEntity(entityName, { query, fields: ["id"] });
  return all.length;
}

// ── static package ──────────────────────────────────────────────────────────
const staticCache = {};
export function loadStaticFile(name) {
  if (!staticCache[name]) {
    staticCache[name] = fetch(STATIC_BASE + name + ".json", { cache: "force-cache" }).then((r) => {
      if (!r.ok) throw new Error(`${name}.json: HTTP ${r.status}`);
      return r.json();
    }).catch((e) => { delete staticCache[name]; throw e; });
  }
  return staticCache[name];
}
const STATIC_FILES = {
  Normalized_Chains: "Normalized_Chains",
  Chain_Dimensions: "Chain_Dimensions",
  Performance_Data: "Performance_Data",
  Chain_Attachments: "Chain_Attachments",
  Chain_Media: "Chain_Media",
  Chain_Attachment_Codes: "attachment_codes",
  Chain_Catalog_Groups: "catalog_groups",
};
export const loadStaticEntity = (entityName) => loadStaticFile(STATIC_FILES[entityName]);

let staticByChain = null;
async function staticGrouped() {
  if (!staticByChain) {
    staticByChain = (async () => {
      const [chains, dims, perf, att, media] = await Promise.all([
        loadStaticEntity("Normalized_Chains"), loadStaticEntity("Chain_Dimensions"), loadStaticEntity("Performance_Data"),
        loadStaticEntity("Chain_Attachments"), loadStaticEntity("Chain_Media"),
      ]);
      const by = (rows) => { const m = new Map(); for (const r of rows) { if (!m.has(r.chain_id)) m.set(r.chain_id, []); m.get(r.chain_id).push(r); } return m; };
      return { chains: by(chains), dims: by(dims), perf: by(perf), att: by(att), media: by(media) };
    })().catch((e) => { staticByChain = null; throw e; });
  }
  return staticByChain;
}

// ── public API (cached per page load) ───────────────────────────────────────
const cache = {};
const once = (key, fn) => {
  if (!cache[key]) cache[key] = fn().catch((e) => { delete cache[key]; throw e; });
  return cache[key];
};
export function clearChainCache() {
  for (const k of Object.keys(cache)) delete cache[k];
}

const isActive = (r) => !r.status || r.status === "Active";

/** 31 catalogue groups in master order. Counts are recomputed from the live chain index. */
export function getGroups() {
  return once("groups", async () => {
    const mode = getChainSourceMode();
    const [rows, index] = await Promise.all([
      mode === "static"
        ? loadStaticEntity("Chain_Catalog_Groups").then((g) => g.map((x, i) => ({ ...x, sort_order: i })))
        : readAllEntity("Chain_Catalog_Groups", { sort: "sort_order" }),
      getChainIndex(),
    ]);
    const counts = new Map();
    for (const c of index) counts.set(c.catalog_group, (counts.get(c.catalog_group) || 0) + 1);
    return rows
      .slice()
      .sort((a, b) => (a.sort_order ?? 999) - (b.sort_order ?? 999))
      .map((g) => ({ ...g, count: counts.get(g.catalog_group) || 0 }));
  });
}

/** Every active chain (light fields). */
export function getChainIndex() {
  return once("index", async () => {
    const mode = getChainSourceMode();
    const rows = mode === "static"
      ? await loadStaticEntity("Normalized_Chains")
      : await readAllEntity("Normalized_Chains", { query: { status: "Active" }, fields: INDEX_FIELDS, sort: "chain_id" });
    const seen = new Set();
    return rows.filter((r) => r.chain_id && r.catalog_group && isActive(r) && !seen.has(r.chain_id) && seen.add(r.chain_id));
  });
}

/** chain_id → light dimension row (pitch, inner width, roller, sidebar height). */
export function getDimensionMap() {
  return once("dims", async () => {
    const rows = getChainSourceMode() === "static"
      ? await loadStaticEntity("Chain_Dimensions")
      : await readAllEntity("Chain_Dimensions", { fields: DIM_FIELDS, sort: "chain_id" });
    return new Map(rows.map((r) => [r.chain_id, r]));
  });
}

/** chain_id → performance row (average ultimate strength, working load). */
export function getPerformanceMap() {
  return once("perf", async () => {
    const rows = getChainSourceMode() === "static"
      ? await loadStaticEntity("Performance_Data")
      : await readAllEntity("Performance_Data", { fields: PERF_FIELDS, sort: "chain_id" });
    return new Map(rows.map((r) => [r.chain_id, r]));
  });
}

/** Full record set for one chain. */
export function getChainDetail(chainId) {
  return once("detail:" + chainId, async () => {
    let chain, dims, perf, attachments, media;
    if (getChainSourceMode() === "static") {
      const g = await staticGrouped();
      chain = (g.chains.get(chainId) || [])[0];
      dims = (g.dims.get(chainId) || [])[0];
      perf = (g.perf.get(chainId) || [])[0];
      attachments = g.att.get(chainId) || [];
      media = g.media.get(chainId) || [];
    } else {
      const q = { chain_id: chainId };
      const E = base44.entities;
      const [c, d, p, a, m] = await Promise.all([
        E.Normalized_Chains.filter(q, "-updated_date", 5),
        E.Chain_Dimensions.filter(q, "-updated_date", 5),
        E.Performance_Data.filter(q, "-updated_date", 5),
        readAllEntity("Chain_Attachments", { query: q, sort: "sort_order", pageSize: 500 }),
        E.Chain_Media.filter(q, "sort_order", 50),
      ]);
      chain = (c || []).find(isActive) || (c || [])[0];
      dims = (d || [])[0];
      perf = (p || [])[0];
      attachments = a || [];
      media = m || [];
    }
    if (!chain) return null;
    attachments = attachments.slice().sort((x, y) => (x.sort_order ?? 0) - (y.sort_order ?? 0));
    media = media.filter((x) => x.approved !== false).slice().sort((x, y) => (x.sort_order ?? 0) - (y.sort_order ?? 0));
    return { chain, dims: dims || null, perf: perf || null, attachments, media };
  });
}
