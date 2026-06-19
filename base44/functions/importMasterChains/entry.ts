/**
 * importMasterChains — one-call, admin-gated, server-side importer for the
 * UniKatalog master package produced by the scrape/normalize pipeline.
 *
 * WHY THIS EXISTS
 *   The normalized data lives in CSVs in the git repo (and Drive). The standard
 *   Import Center is a human-driven, one-entity-per-session, column-mapped flow.
 *   This function does the whole thing headlessly: it fetches the master CSVs,
 *   maps columns to each production entity, dedupes on chain_number, and writes
 *   via asServiceRole — so an admin can import everything with a single call
 *   (no upload, no column mapping, no per-pass review).
 *
 * RUNS INSIDE BASE44 (not the Claude sandbox): only here does the DB / outbound
 * fetch to raw.githubusercontent.com work.
 *
 * AUTH: requires a logged-in admin (auth.me().role === "admin").
 *
 * CHUNKED + RESUMABLE (serverless-timeout safe — mirrors importStageJob):
 *   POST body: {
 *     entity:        "Normalized_Chains" | "Chain_Dimensions" | "Performance_Data" | "Manufacturer_Equivalents",
 *     offset:        number (default 0),
 *     limit:         number (default 50),
 *     chainsUrl:     CSV url for the 866-row master (default = RAW_CHAINS),
 *     equivalentsUrl:CSV url for the 963-row equivalents (default = RAW_EQUIV),
 *     githubToken:   optional — only if the repo is private (sent as Bearer for raw fetch)
 *   }
 *   Returns { entity, processed, created, updated, skipped, errors, offset, nextOffset, total, done }.
 *   The caller dispatches Normalized_Chains fully FIRST (it is the FK parent),
 *   then the other three. Drive a simple loop until done=true, e.g. in the app:
 *     let o=0,e="Normalized_Chains";
 *     do { r = await base44.functions.importMasterChains({entity:e,offset:o,limit:50}); o=r.nextOffset; } while(!r.done);
 */
import { createClientFromRequest } from "npm:@base44/sdk@0.8.25";

const BRANCH = "claude/fervent-brown-g3ylx1";
const RAW_BASE = `https://raw.githubusercontent.com/Unikingcanada/unikatalog/${BRANCH}/work/drive`;
const RAW_CHAINS = `${RAW_BASE}/PKG-MASTER_all_chains.csv`;
const RAW_EQUIV = `${RAW_BASE}/PKG-MASTER_equivalents_long.csv`;

// ── tiny RFC-4180-ish CSV parser (handles quotes, escaped quotes, CRLF) ──────
function parseCsv(text: string): Record<string, string>[] {
  const rows: string[][] = [];
  let row: string[] = [], field = "", i = 0, q = false;
  while (i < text.length) {
    const c = text[i];
    if (q) {
      if (c === '"') { if (text[i + 1] === '"') { field += '"'; i++; } else q = false; }
      else field += c;
    } else {
      if (c === '"') q = true;
      else if (c === ",") { row.push(field); field = ""; }
      else if (c === "\n") { row.push(field); rows.push(row); row = []; field = ""; }
      else if (c === "\r") { /* skip */ }
      else field += c;
    }
    i++;
  }
  if (field.length || row.length) { row.push(field); rows.push(row); }
  if (!rows.length) return [];
  const header = rows[0];
  return rows.slice(1).filter(r => r.some(c => c !== "")).map(r => {
    const o: Record<string, string> = {};
    header.forEach((h, idx) => { o[h] = (r[idx] ?? "").trim(); });
    return o;
  });
}

async function fetchCsv(url: string, token?: string): Promise<Record<string, string>[]> {
  const headers: Record<string, string> = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error(`fetch ${url} -> HTTP ${res.status}`);
  return parseCsv(await res.text());
}

const numOrU = (v: string) => { if (v === "" || v == null) return undefined; const n = Number(v); return Number.isNaN(n) ? undefined : n; };
const arr = (v: string) => (v ? v.split(",").map(s => s.trim()).filter(Boolean) : []);
const boolU = (v: string) => String(v).toUpperCase() === "TRUE";
const strU = (v: string) => (v && v !== "" ? v : undefined);

// map a master-CSV row to the target entity's create payload
function mapRow(entity: string, r: Record<string, string>) {
  switch (entity) {
    case "Normalized_Chains":
      return {
        chain_id: r.chain_id, chain_family: r.chain_family, chain_number: r.chain_number,
        display_name: strU(r.display_name), standard: strU(r.standard),
        pitch_in: strU(r.pitch_in), pitch_mm: strU(r.pitch_mm),
        strands: numOrU(r.strands) ?? 1, status: strU(r.status) || "Active",
        description: strU(r.description), application_tags: arr(r.application_tags),
        materials_available: arr(r.materials_available), options_upgrades: strU(r.options_upgrades),
        image_url: strU(r.image_url), drawing_url: strU(r.drawing_url),
        uniking_notes: strU(r.uniking_notes), needs_review: boolU(r.needs_review),
      };
    case "Chain_Dimensions":
      return {
        chain_id: r.chain_id, pitch_in: numOrU(r.pitch_in), pitch_mm: numOrU(r.pitch_mm),
        roller_dia_in: numOrU(r.roller_dia_in), roller_dia_mm: numOrU(r.roller_dia_mm),
        roller_width_in: numOrU(r.inner_width_in), roller_width_mm: numOrU(r.inner_width_mm),
        pin_dia_in: numOrU(r.pin_dia_in), pin_dia_mm: numOrU(r.pin_dia_mm),
        plate_height_in: numOrU(r.plate_height_in), plate_height_mm: numOrU(r.plate_height_mm),
        weight_lbs_ft: numOrU(r.weight_lbs_ft), weight_kg_m: numOrU(r.weight_kg_m),
        standard: strU(r.standard), source_brand: strU(r.perf_source), notes: strU(r.extra_dims_json),
      };
    case "Performance_Data":
      return {
        chain_id: r.chain_id, tier: "Standard",
        tensile_strength_lbs: numOrU(r.tensile_lbs), tensile_strength_kn: numOrU(r.tensile_kn),
        working_load_lbs: numOrU(r.working_load_lbs), working_load_kn: numOrU(r.working_load_kn),
        lubrication: strU(r.lubrication), source_brand: strU(r.perf_source),
      };
    case "Manufacturer_Equivalents":
      return {
        chain_id: r.chain_id, brand: r.brand, brand_part_number: r.brand_part_number,
        brand_series: strU(r.brand_series), equivalency_type: strU(r.equivalency_type) || "Direct",
        confidence: strU(r.confidence) || "Medium",
      };
    default:
      throw new Error(`unknown entity ${entity}`);
  }
}

// only emit a Dimensions/Performance row when there is real data to write
function hasDims(r: Record<string, string>) {
  return ["roller_dia_in", "pin_dia_in", "plate_height_in", "weight_lbs_ft", "inner_width_in"].some(k => r[k]);
}
function hasPerf(r: Record<string, string>) {
  return r.tensile_lbs || r.working_load_lbs;
}

Deno.serve(async (req) => {
  let base44;
  try {
    base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== "admin") return Response.json({ error: "Admin access required" }, { status: 403 });

    const body = await req.json().catch(() => ({}));
    const entity = body.entity || "Normalized_Chains";
    const offset = Number(body.offset || 0);
    const limit = Number(body.limit || 50);
    const token = body.githubToken;
    const url = entity === "Manufacturer_Equivalents"
      ? (body.equivalentsUrl || RAW_EQUIV)
      : (body.chainsUrl || RAW_CHAINS);

    const all = await fetchCsv(url, token);
    const slice = all.slice(offset, offset + limit);
    let created = 0, updated = 0, skipped = 0;
    const errors: string[] = [];

    for (const r of slice) {
      try {
        if (entity === "Chain_Dimensions" && !hasDims(r)) { skipped++; continue; }
        if (entity === "Performance_Data" && !hasPerf(r)) { skipped++; continue; }
        const data = mapRow(entity, r);

        if (entity === "Normalized_Chains") {
          // dedupe-upsert on chain_number (the canonical key)
          const existing = await base44.asServiceRole.entities.Normalized_Chains.filter({ chain_number: r.chain_number });
          if (existing && existing.length) {
            await base44.asServiceRole.entities.Normalized_Chains.update(existing[0].id, data);
            updated++;
          } else {
            await base44.asServiceRole.entities.Normalized_Chains.create(data);
            created++;
          }
        } else {
          // child entities: resolve to the live chain by chain_number; skip if parent missing (FK safety)
          const parents = await base44.asServiceRole.entities.Normalized_Chains.filter({ chain_number: r.chain_number });
          if (!parents || !parents.length) {
            // equivalents CSV carries chain_id directly; try that before giving up
            if (entity === "Manufacturer_Equivalents" && r.chain_id) {
              await base44.asServiceRole.entities.Manufacturer_Equivalents.create(data);
              created++; continue;
            }
            skipped++; errors.push(`${r.chain_number || r.chain_id}: parent chain not found (import Normalized_Chains first)`);
            continue;
          }
          (data as Record<string, unknown>).chain_id = parents[0].chain_id || r.chain_id;
          await base44.asServiceRole.entities[entity].create(data);
          created++;
        }
      } catch (e) {
        errors.push(`${r.chain_number || r.chain_id}: ${e instanceof Error ? e.message : String(e)}`);
      }
    }

    const nextOffset = offset + slice.length;
    return Response.json({
      entity, total: all.length, offset, processed: slice.length,
      created, updated, skipped, errorCount: errors.length, errors: errors.slice(0, 20),
      nextOffset, done: nextOffset >= all.length,
    });
  } catch (e) {
    return Response.json({ error: e instanceof Error ? e.message : String(e) }, { status: 500 });
  }
});
