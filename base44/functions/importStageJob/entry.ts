/**
 * importStageJob — Processes EXACTLY ONE CHUNK per function call.
 *
 * The caller (browser or recovery path) dispatches calls sequentially,
 * one chunk at a time. Each call completes in <10s, well within any
 * serverless timeout. Progress is saved to Import_Sessions after every call.
 *
 * Payload:
 *   sessionId       — Import_Sessions record db id
 *   entityTarget
 *   rows            — ALL rows for this import (full array, always)
 *   mappingRules
 *   transformRules
 *   chunkIndex      — which chunk to process (0-based). Default: 0
 *   chunkSize       — rows per chunk. Default: 25
 *
 * Returns:
 *   { done, chunkIndex, totalChunks, staged, counts, lastProcessedRow }
 *   done=true → session is complete, status set to "Pending Review"
 *   done=false → caller should dispatch chunkIndex+1
 */
import { createClientFromRequest } from "npm:@base44/sdk@0.8.25";

const DEFAULT_CHUNK_SIZE = 25;
const WRITE_DELAY = 50;

function delay(ms) {
  return new Promise(res => setTimeout(res, ms));
}

function applyMapping(row, mappingRules, transformRules = {}) {
  const ARRAY_FIELDS = new Set(["application_tags", "materials_available"]);
  const mapped = {};
  for (const [srcCol, targetField] of Object.entries(mappingRules)) {
    if (!targetField) continue;
    let val = row[srcCol];
    if (val === undefined || val === "") continue;
    const transform = transformRules[srcCol];
    if (transform === "parseFloat") val = parseFloat(val) || null;
    else if (transform === "parseInt") val = parseInt(val) || null;
    else if (transform === "toUpperCase") val = String(val).toUpperCase();
    else if (transform === "toLowerCase") val = String(val).toLowerCase();
    else if (transform === "trim") val = String(val).trim();
    else if (transform === "boolean") val = ["true","yes","1","y"].includes(String(val).toLowerCase());
    if (ARRAY_FIELDS.has(targetField) && typeof val === "string") {
      const delim = val.includes("|") ? "|" : val.includes(";") ? ";" : ",";
      val = val.split(delim).map(s => s.trim()).filter(Boolean);
    }
    mapped[targetField] = val;
  }
  return mapped;
}

const COMPONENT_SKU_PATTERNS = [
  /^OL[-\s]?\d/i, /^C\/L[-\s]?\d/i, /^CL[-\s]?\d/i,
  /^offset\s*link/i, /^connecting\s*link/i, /^conn(?:ecting)?\s*link/i,
  /^master\s*link/i, /\boffset\s*link\b/i, /\bconn(?:ecting)?\s*link\b/i,
  /^(A|K|SA|WA|SK|HK|WK)-?\d+\s+\d/i, /\bcotter\s*pin\b/i,
  /\bspring\s*clip\b/i, /\bmaster\s*link\b/i,
];

function isComponentSku(chainId, chainNumber) {
  return [chainId, chainNumber].filter(Boolean)
    .some(id => COMPONENT_SKU_PATTERNS.some(p => p.test(String(id))));
}

const PK_MAP = {
  Normalized_Chains: "chain_id", Chain_Dimensions: "chain_id",
  Manufacturer_Equivalents: "brand_part_number", Performance_Data: "chain_id",
  Chain_Attachments: "attachment_code", Chain_Sprockets: "sprocket_code",
  Chain_Downloads: "label", Chain_Media: "url", Chain_Review_Flags: "chain_id",
};

const REQ_MAP = {
  Normalized_Chains: ["chain_id", "chain_family", "chain_number"],
  Chain_Dimensions: ["chain_id"],
  Manufacturer_Equivalents: ["chain_id", "brand", "brand_part_number"],
  Performance_Data: ["chain_id"],
  Chain_Attachments: ["chain_id", "attachment_code"],
  Chain_Sprockets: ["chain_id", "sprocket_code"],
  Chain_Downloads: ["chain_id", "label", "url"],
  Chain_Media: ["chain_id", "url"],
  Chain_Review_Flags: ["chain_id", "flag_type"],
};

function classifyRecord(mappedData, entityTarget, existingRecords) {
  const pkField = PK_MAP[entityTarget] || "id";
  const pkValue = mappedData[pkField];

  if (entityTarget === "Normalized_Chains" && isComponentSku(mappedData.chain_id, mappedData.chain_number)) {
    const m = String(mappedData.chain_id || mappedData.chain_number || "").match(/(\d+)$/);
    return {
      status: "Invalid",
      conflictDetail: `Component SKU — not a chain record. Probable parent: ${m ? "ANSI-" + m[1] : "unknown"}.`,
      diffSummary: null, productionRecordId: null,
    };
  }

  const required = REQ_MAP[entityTarget] || [];
  for (const f of required) {
    if (!mappedData[f] && mappedData[f] !== 0) {
      return { status: "Invalid", conflictDetail: `Missing required field: ${f}`, diffSummary: null, productionRecordId: null };
    }
  }
  if (!pkValue) {
    return { status: "Invalid", conflictDetail: `Missing primary key: ${pkField}`, diffSummary: null, productionRecordId: null };
  }

  const existing = existingRecords.find(r => r[pkField] === pkValue);
  if (!existing) return { status: "New", conflictDetail: null, diffSummary: null, productionRecordId: null };

  const DIM_MAP = {
    Chain_Dimensions: ["pitch_mm", "pitch_in", "roller_dia_mm", "roller_dia_in", "pin_dia_mm", "inner_width_mm"],
    Normalized_Chains: ["pitch_in", "pitch_mm"],
    Performance_Data: ["tensile_strength_lbs", "tensile_strength_kn", "working_load_lbs"],
  };
  const conflictFields = DIM_MAP[entityTarget] || [];

  const diffSummary = {};
  let hasChanges = false, hasConflicts = false;
  for (const [field, newVal] of Object.entries(mappedData)) {
    const oldVal = existing[field];
    if (oldVal != null && oldVal !== "" && newVal != null && newVal !== "") {
      if (String(oldVal) !== String(newVal)) {
        diffSummary[field] = { old: oldVal, new: newVal };
        hasChanges = true;
        if (conflictFields.includes(field)) hasConflicts = true;
      }
    }
  }

  if (hasConflicts) return { status: "Conflict", conflictDetail: `Dimensional conflict in: ${Object.keys(diffSummary).join(", ")}`, diffSummary, productionRecordId: existing.id };
  if (hasChanges) return { status: "Changed", conflictDetail: null, diffSummary, productionRecordId: existing.id };
  return { status: "Duplicate", conflictDetail: "Exact match found in production", diffSummary: null, productionRecordId: existing.id };
}

async function fetchAllExisting(base44, entityTarget) {
  let all = [], skip = 0;
  while (true) {
    const batch = await base44.asServiceRole.entities[entityTarget].list("-updated_date", 2000, skip);
    if (!batch || !batch.length) break;
    all = [...all, ...batch];
    if (batch.length < 2000) break;
    skip += batch.length;
    await delay(150);
  }
  return all;
}

async function writeWithRetry(fn, maxAttempts = 3) {
  const backoff = [500, 1500, 3000];
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (err) {
      const msg = String(err?.message || err);
      if (/rate.?limit|429|throttl|timeout|network/i.test(msg) && attempt < maxAttempts - 1) {
        await delay(backoff[attempt]);
      } else {
        throw err;
      }
    }
  }
}

Deno.serve(async (req) => {
  let sessionDbId = null;
  let base44;

  try {
    base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== "admin") {
      return Response.json({ error: "Admin access required" }, { status: 403 });
    }

    const body = await req.json();
    // Base44 SDK wraps frontend payloads in a "data" envelope — unwrap if present
    const payload = body?.data ?? body;
    const {
      sessionId: sessionDbIdIn,
      entityTarget,
      mappingRules,
      transformRules = {},
      chunkIndex = 0,
      chunkSize = DEFAULT_CHUNK_SIZE,
    } = payload;
    // Fallback: some serializers send arrays as "rows[]" instead of "rows"
    const rows = payload.rows || payload["rows[]"];

    sessionDbId = sessionDbIdIn;

    // Detailed validation — report exactly which field is missing
    const missing = [];
    if (!sessionDbId)   missing.push("sessionId");
    if (!entityTarget)  missing.push("entityTarget");
    if (!rows)          missing.push("rows");
    if (!mappingRules)  missing.push("mappingRules");
    if (missing.length > 0) {
      const receivedKeys = Object.keys(payload).join(", ") || "(none)";
      return Response.json({
        error: `Missing required field(s): ${missing.join(", ")}`,
        received_keys: receivedKeys,
        hint: "Check that the frontend is passing: sessionId, entityTarget, rows[], mappingRules{}",
      }, { status: 400 });
    }

    const totalRows = rows.length;
    const totalChunks = Math.ceil(totalRows / chunkSize);
    const chunkStart = chunkIndex * chunkSize;
    const chunkEnd = Math.min(chunkStart + chunkSize, totalRows);
    const chunkRows = rows.slice(chunkStart, chunkEnd);

    if (chunkRows.length === 0) {
      // Nothing to do — already complete
      return Response.json({ done: true, chunkIndex, totalChunks, staged: 0, counts: {}, lastProcessedRow: totalRows });
    }

    // Load the current session to get existing progress counts + session_id string
    const sessRec = await base44.asServiceRole.entities.Import_Sessions.get(sessionDbId);
    const sessionIdStr = sessRec?.session_id || sessionDbId;
    const existingReport = sessRec?.validation_report || {};

    // On first chunk: mark Validating + set total_rows
    if (chunkIndex === 0) {
      await base44.asServiceRole.entities.Import_Sessions.update(sessionDbId, {
        import_status: "Validating",
        total_rows: totalRows,
        rows_staged: 0,
        validation_report: {
          total_detected: totalRows,
          total_processed: 0,
          total_staged: 0,
          New: 0, Duplicate: 0, Changed: 0, Conflict: 0, Invalid: 0, Failed: 0,
          pct: 0,
          heartbeat_at: new Date().toISOString(),
        },
      });
    }

    // Fetch existing production records for diff (only on first chunk, re-use if resumed)
    // We always fetch fresh to ensure accuracy — it's fast (<1s for most entities)
    const existingRecords = await fetchAllExisting(base44, entityTarget);

    // Carry forward counts from previous chunks
    const counts = {
      New: existingReport.New || 0,
      Duplicate: existingReport.Duplicate || 0,
      Changed: existingReport.Changed || 0,
      Conflict: existingReport.Conflict || 0,
      Invalid: existingReport.Invalid || 0,
      Failed: existingReport.Failed || 0,
    };
    let chunkStaged = 0;
    let lastProcessedRow = chunkStart;

    // Process this chunk
    for (let ri = 0; ri < chunkRows.length; ri++) {
      const { row, file } = chunkRows[ri];
      const globalRowIndex = chunkStart + ri;

      try {
        const mapped = applyMapping(row, mappingRules, transformRules);
        const { status, conflictDetail, diffSummary, productionRecordId } = classifyRecord(mapped, entityTarget, existingRecords);

        await writeWithRetry(() =>
          base44.asServiceRole.entities.Staging_Records.create({
            session_id: sessionIdStr,
            entity_target: entityTarget,
            row_index: globalRowIndex,
            source_file: file || "",
            raw_data: row,
            mapped_data: mapped,
            record_status: status,
            diff_summary: diffSummary || {},
            conflict_detail: conflictDetail || "",
            production_record_id: productionRecordId || "",
            commit_decision: "Pending",
          })
        );

        counts[status] = (counts[status] || 0) + 1;
        chunkStaged++;
      } catch (err) {
        // Persist the failure so this row has a final state
        try {
          await base44.asServiceRole.entities.Staging_Records.create({
            session_id: sessionIdStr,
            entity_target: entityTarget,
            row_index: globalRowIndex,
            source_file: file || "",
            raw_data: row,
            mapped_data: {},
            record_status: "Failed",
            conflict_detail: `Staging error at row ${globalRowIndex}: ${err.message}`,
            commit_decision: "Skip",
          });
        } catch {}
        counts.Failed = (counts.Failed || 0) + 1;
        chunkStaged++;
      }

      lastProcessedRow = globalRowIndex + 1;
      await delay(WRITE_DELAY);
    }

    // Accumulate totals across all chunks
    const totalStagedSoFar = (existingReport.total_staged || 0) + chunkStaged;
    const totalProcessedSoFar = chunkEnd;
    const isDone = chunkIndex >= totalChunks - 1;
    const pct = Math.round((totalProcessedSoFar / totalRows) * 100);

    const updatedReport = {
      ...counts,
      total_detected: totalRows,
      total_processed: totalProcessedSoFar,
      total_staged: totalStagedSoFar,
      pct,
      last_processed_row: lastProcessedRow,
      last_chunk_index: chunkIndex,
      heartbeat_at: new Date().toISOString(),
      completed_at: isDone ? new Date().toISOString() : undefined,
    };

    await base44.asServiceRole.entities.Import_Sessions.update(sessionDbId, {
      rows_staged: totalStagedSoFar,
      import_status: isDone ? "Pending Review" : "Validating",
      validation_report: updatedReport,
    });

    return Response.json({
      done: isDone,
      chunkIndex,
      totalChunks,
      staged: chunkStaged,
      totalStaged: totalStagedSoFar,
      counts,
      lastProcessedRow,
      pct,
    });

  } catch (err) {
    if (base44 && sessionDbId) {
      try {
        await base44.asServiceRole.entities.Import_Sessions.update(sessionDbId, {
          import_status: "Failed",
          validation_report: {
            error: err.message,
            failed_at: new Date().toISOString(),
          },
        });
      } catch {}
    }
    return Response.json({ error: err.message }, { status: 500 });
  }
});