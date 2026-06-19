/**
 * masterCatalogImport — Admin-only bulk importer for UniKatalog master CSV files
 *
 * POST body:
 *   { phase: "chains"|"dimensions"|"perf"|"equivalents", chunk: 0, chunkSize: 20 }
 *
 * Returns:
 *   { done, nextChunk, created, updated, skipped, errors[], total, phase }
 *
 * Rate-limit resilience:
 *   - 150ms delay between every DB write
 *   - Exponential backoff retry (1s→2s→4s→8s→16s→32s) on 429/rate-limit errors
 *   - Up to 6 retries per operation before recording as an error and continuing
 */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const CHAINS_CSV = "https://raw.githubusercontent.com/Unikingcanada/unikatalog/claude/fervent-brown-g3ylx1/work/drive/PKG-MASTER_all_chains.csv";
const EQUIV_CSV  = "https://raw.githubusercontent.com/Unikingcanada/unikatalog/claude/fervent-brown-g3ylx1/work/drive/PKG-MASTER_equivalents_long.csv";

const INTER_RECORD_DELAY_MS = 150;
const MAX_RETRIES = 6;

// ─── CSV parser ────────────────────────────────────────────────────────────────
function parseCSV(text) {
  const lines = text.split(/\r?\n/).filter(l => l.trim());
  if (!lines.length) return [];
  const headers = parseCSVLine(lines[0]);
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const vals = parseCSVLine(lines[i]);
    if (vals.length === 0) continue;
    const obj = {};
    headers.forEach((h, idx) => { obj[h] = (vals[idx] ?? "").trim(); });
    rows.push(obj);
  }
  return rows;
}

function parseCSVLine(line) {
  const result = [];
  let cur = "", inQuote = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') {
      if (inQuote && line[i+1] === '"') { cur += '"'; i++; }
      else inQuote = !inQuote;
    } else if (c === ',' && !inQuote) {
      result.push(cur); cur = "";
    } else {
      cur += c;
    }
  }
  result.push(cur);
  return result;
}

// ─── Helpers ───────────────────────────────────────────────────────────────────
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function isRateLimit(e) {
  const msg = (e?.message || "").toLowerCase();
  return msg.includes("rate limit") || msg.includes("429") || msg.includes("too many");
}

/**
 * Retry wrapper with exponential backoff.
 * On rate-limit errors: waits 1s, 2s, 4s, 8s, 16s, 32s then gives up.
 * On other errors: throws immediately (no retry).
 */
async function withRetry(fn) {
  let delay = 1000;
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      return await fn();
    } catch (e) {
      if (isRateLimit(e) && attempt < MAX_RETRIES) {
        await sleep(delay);
        delay = Math.min(delay * 2, 32000);
      } else {
        throw e;
      }
    }
  }
}

function parseNum(v) {
  if (v === "" || v == null) return null;
  const n = parseFloat(v);
  return isNaN(n) ? null : n;
}
function parseBool(v) { return String(v).toUpperCase() === "TRUE"; }
function parseArr(v) {
  if (!v || !v.trim()) return [];
  return v.split(",").map(s => s.trim()).filter(Boolean);
}
function nonEmpty(...vals) { return vals.some(v => v !== null && v !== ""); }

// ─── Fetch CSVs (module-level cache — warm across chunks within same cold start) ──
let _chainsCache = null;
let _equivCache  = null;

async function fetchChains() {
  if (_chainsCache) return _chainsCache;
  const r = await fetch(CHAINS_CSV);
  _chainsCache = parseCSV(await r.text());
  return _chainsCache;
}
async function fetchEquiv() {
  if (_equivCache) return _equivCache;
  const r = await fetch(EQUIV_CSV);
  _equivCache = parseCSV(await r.text());
  return _equivCache;
}

// ─── Main handler ──────────────────────────────────────────────────────────────
Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  if (!user || user.role !== "admin") {
    return Response.json({ error: "Forbidden: admin only" }, { status: 403 });
  }

  const body = await req.json();
  const { phase, chunk = 0, chunkSize = 20 } = body;

  if (!["chains", "dimensions", "perf", "equivalents"].includes(phase)) {
    return Response.json({ error: "Invalid phase" }, { status: 400 });
  }

  const created = [], updated = [], skipped = [], errors = [];

  // ── PHASE 1: Normalized_Chains ─────────────────────────────────────────────
  if (phase === "chains") {
    const rows = await fetchChains();
    const slice = rows.slice(chunk * chunkSize, (chunk + 1) * chunkSize);
    const total = rows.length;

    for (const row of slice) {
      const chainNumber = row.chain_number?.trim();
      if (!chainNumber) { skipped.push(`row missing chain_number`); continue; }

      const record = {
        chain_id:            row.chain_id?.trim() || chainNumber,
        chain_family:        row.chain_family?.trim() || "",
        chain_number:        chainNumber,
        display_name:        row.display_name?.trim() || "",
        standard:            row.standard?.trim() || "",
        pitch_in:            row.pitch_in?.trim() || "",
        pitch_mm:            row.pitch_mm?.trim() || "",
        strands:             parseNum(row.strands) ?? 1,
        status:              row.status?.trim() || "Active",
        description:         row.description?.trim() || "",
        application_tags:    parseArr(row.application_tags),
        materials_available: parseArr(row.materials_available),
        options_upgrades:    row.options_upgrades?.trim() || "",
        image_url:           row.image_url?.trim() || "",
        drawing_url:         row.drawing_url?.trim() || "",
        needs_review:        parseBool(row.needs_review),
        uniking_notes:       row.uniking_notes?.trim() || "",
      };

      try {
        // Single filter call, then branch on result
        const existing = await withRetry(() =>
          base44.asServiceRole.entities.Normalized_Chains.filter({ chain_number: chainNumber })
        );
        await sleep(INTER_RECORD_DELAY_MS);

        if (existing && existing.length > 0) {
          await withRetry(() =>
            base44.asServiceRole.entities.Normalized_Chains.update(existing[0].id, record)
          );
          updated.push(chainNumber);
        } else {
          await withRetry(() =>
            base44.asServiceRole.entities.Normalized_Chains.create(record)
          );
          created.push(chainNumber);
        }
        await sleep(INTER_RECORD_DELAY_MS);
      } catch (e) {
        errors.push(`chains ${chainNumber}: ${e.message}`);
      }
    }

    const nextChunk = (chunk + 1) * chunkSize >= total ? null : chunk + 1;
    return Response.json({ phase, done: nextChunk === null, nextChunk, total, chunkProcessed: slice.length, created, updated, skipped, errors });
  }

  // ── PHASE 2: Chain_Dimensions ──────────────────────────────────────────────
  if (phase === "dimensions") {
    const rows = await fetchChains();
    const slice = rows.slice(chunk * chunkSize, (chunk + 1) * chunkSize);
    const total = rows.length;

    for (const row of slice) {
      const chainNumber = row.chain_number?.trim();
      if (!chainNumber) { skipped.push(`row missing chain_number`); continue; }

      const hasData = nonEmpty(
        parseNum(row.roller_dia_in), parseNum(row.roller_dia_mm),
        parseNum(row.inner_width_in), parseNum(row.inner_width_mm),
        parseNum(row.pin_dia_in), parseNum(row.pin_dia_mm),
        parseNum(row.plate_height_in), parseNum(row.plate_height_mm),
        parseNum(row.weight_lbs_ft), parseNum(row.weight_kg_m)
      );
      if (!hasData) { skipped.push(`${chainNumber}: no dimension data`); continue; }

      try {
        const chains = await withRetry(() =>
          base44.asServiceRole.entities.Normalized_Chains.filter({ chain_number: chainNumber })
        );
        await sleep(INTER_RECORD_DELAY_MS);

        if (!chains || !chains.length) { skipped.push(`${chainNumber}: parent chain not found`); continue; }
        const chainId = chains[0].chain_id || chains[0].id;

        const existing = await withRetry(() =>
          base44.asServiceRole.entities.Chain_Dimensions.filter({ chain_id: chainId })
        );
        await sleep(INTER_RECORD_DELAY_MS);

        const record = {
          chain_id:         chainId,
          roller_dia_in:    parseNum(row.roller_dia_in),
          roller_dia_mm:    parseNum(row.roller_dia_mm),
          roller_width_in:  parseNum(row.inner_width_in),
          roller_width_mm:  parseNum(row.inner_width_mm),
          pin_dia_in:       parseNum(row.pin_dia_in),
          pin_dia_mm:       parseNum(row.pin_dia_mm),
          plate_height_in:  parseNum(row.plate_height_in),
          plate_height_mm:  parseNum(row.plate_height_mm),
          weight_lbs_ft:    parseNum(row.weight_lbs_ft),
          weight_kg_m:      parseNum(row.weight_kg_m),
          standard:         row.standard?.trim() || "",
          source_brand:     row.provenance?.trim() || "",
          notes:            row.extra_dims_json?.trim() || "",
        };

        if (existing && existing.length > 0) {
          await withRetry(() =>
            base44.asServiceRole.entities.Chain_Dimensions.update(existing[0].id, record)
          );
          updated.push(chainNumber);
        } else {
          await withRetry(() =>
            base44.asServiceRole.entities.Chain_Dimensions.create(record)
          );
          created.push(chainNumber);
        }
        await sleep(INTER_RECORD_DELAY_MS);
      } catch (e) {
        errors.push(`dims ${chainNumber}: ${e.message}`);
      }
    }

    const nextChunk = (chunk + 1) * chunkSize >= total ? null : chunk + 1;
    return Response.json({ phase, done: nextChunk === null, nextChunk, total, chunkProcessed: slice.length, created, updated, skipped, errors });
  }

  // ── PHASE 3: Performance_Data ──────────────────────────────────────────────
  if (phase === "perf") {
    const rows = await fetchChains();
    const slice = rows.slice(chunk * chunkSize, (chunk + 1) * chunkSize);
    const total = rows.length;

    for (const row of slice) {
      const chainNumber = row.chain_number?.trim();
      if (!chainNumber) { skipped.push(`row missing chain_number`); continue; }

      const tensile_lbs = parseNum(row.tensile_lbs);
      const tensile_kn  = parseNum(row.tensile_kn);
      const working_lbs = parseNum(row.working_load_lbs);
      const working_kn  = parseNum(row.working_load_kn);

      if (!nonEmpty(tensile_lbs, tensile_kn, working_lbs, working_kn)) {
        skipped.push(`${chainNumber}: no perf data`); continue;
      }

      try {
        const chains = await withRetry(() =>
          base44.asServiceRole.entities.Normalized_Chains.filter({ chain_number: chainNumber })
        );
        await sleep(INTER_RECORD_DELAY_MS);

        if (!chains || !chains.length) { skipped.push(`${chainNumber}: parent chain not found`); continue; }
        const chainId = chains[0].chain_id || chains[0].id;

        const existing = await withRetry(() =>
          base44.asServiceRole.entities.Performance_Data.filter({ chain_id: chainId })
        );
        await sleep(INTER_RECORD_DELAY_MS);

        const record = {
          chain_id:             chainId,
          tier:                 "Standard Duty",
          tensile_strength_lbs: tensile_lbs,
          tensile_strength_kn:  tensile_kn,
          working_load_lbs:     working_lbs,
          working_load_kn:      working_kn,
          lubrication:          row.lubrication?.trim() || "",
          source_brand:         row.perf_source?.trim() || "",
          notes:                "",
        };

        if (existing && existing.length > 0) {
          await withRetry(() =>
            base44.asServiceRole.entities.Performance_Data.update(existing[0].id, record)
          );
          updated.push(chainNumber);
        } else {
          await withRetry(() =>
            base44.asServiceRole.entities.Performance_Data.create(record)
          );
          created.push(chainNumber);
        }
        await sleep(INTER_RECORD_DELAY_MS);
      } catch (e) {
        errors.push(`perf ${chainNumber}: ${e.message}`);
      }
    }

    const nextChunk = (chunk + 1) * chunkSize >= total ? null : chunk + 1;
    return Response.json({ phase, done: nextChunk === null, nextChunk, total, chunkProcessed: slice.length, created, updated, skipped, errors });
  }

  // ── PHASE 4: Manufacturer_Equivalents ─────────────────────────────────────
  if (phase === "equivalents") {
    const rows = await fetchEquiv();
    const slice = rows.slice(chunk * chunkSize, (chunk + 1) * chunkSize);
    const total = rows.length;

    for (const row of slice) {
      const chainId = row.chain_id?.trim();
      const brand   = row.brand?.trim();
      const partNum = row.brand_part_number?.trim();
      if (!chainId || !brand || !partNum) { skipped.push(`equiv row missing required field`); continue; }

      try {
        const existing = await withRetry(() =>
          base44.asServiceRole.entities.Manufacturer_Equivalents.filter({
            chain_id: chainId, brand, brand_part_number: partNum,
          })
        );
        await sleep(INTER_RECORD_DELAY_MS);

        if (existing && existing.length > 0) {
          skipped.push(`${chainId}/${brand}/${partNum}: duplicate`); continue;
        }

        await withRetry(() =>
          base44.asServiceRole.entities.Manufacturer_Equivalents.create({
            chain_id:          chainId,
            brand,
            brand_part_number: partNum,
            brand_series:      row.brand_series?.trim() || "",
            equivalency_type:  row.equivalency_type?.trim() || "Direct",
            confidence:        row.confidence?.trim() || "Confirmed",
          })
        );
        created.push(`${brand}/${partNum}`);
        await sleep(INTER_RECORD_DELAY_MS);
      } catch (e) {
        errors.push(`equiv ${chainId}/${brand}: ${e.message}`);
      }
    }

    const nextChunk = (chunk + 1) * chunkSize >= total ? null : chunk + 1;
    return Response.json({ phase, done: nextChunk === null, nextChunk, total, chunkProcessed: slice.length, created, updated, skipped, errors });
  }
});