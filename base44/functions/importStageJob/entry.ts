/**
 * importStageJob — Server-side background staging + validation worker.
 *
 * Called once after session creation. Runs entirely on Deno/server — completely
 * independent of the browser tab. Navigating away does NOT interrupt this.
 *
 * Payload:
 *   sessionId   — Import_Sessions record id (db id, not session_id string)
 *   entityTarget
 *   rows        — [{ row: {}, file: string }]  (raw parsed rows)
 *   mappingRules
 *   transformRules
 */
import { createClientFromRequest } from "npm:@base44/sdk@0.8.25";

const CHUNK_SIZE = 50;
const WRITE_DELAY = 80;   // ms between individual writes
const CHUNK_DELAY = 300;  // ms between chunks

function delay(ms) {
  return new Promise(res => setTimeout(res, ms));
}

// ─── Column mapping ────────────────────────────────────────────────────────────
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
    else if (transform === "boolean") val = ["true", "yes", "1", "y"].includes(String(val).toLowerCase());
    if (ARRAY_FIELDS.has(targetField) && typeof val === "string") {
      const delim = val.includes("|") ? "|" : val.includes(";") ? ";" : ",";
      val = val.split(delim).map(s => s.trim()).filter(Boolean);
    }
    mapped[targetField] = val;
  }
  return mapped;
}

// ─── Classification ────────────────────────────────────────────────────────────
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

function parseParentChainSize(sku) {
  if (!sku) return null;
  const m = String(sku).match(/(\d+)$/);
  return m ? m[1] : null;
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
    const parentSize = parseParentChainSize(mappedData.chain_id || mappedData.chain_number);
    return {
      status: "Invalid",
      conflictDetail: `Component SKU "${mappedData.chain_id || mappedData.chain_number}" cannot be stored as a Normalized_Chain.${parentSize ? ` Probable parent: ANSI-${parentSize}.` : ""}`,
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
  let hasChanges = false;
  let hasConflicts = false;
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

// ─── Fetch all existing records (paginated) ────────────────────────────────────
async function fetchAllExisting(base44, entityTarget) {
  let all = [], skip = 0;
  while (true) {
    const batch = await base44.asServiceRole.entities[entityTarget].list("-updated_date", 2000, skip);
    if (!batch || !batch.length) break;
    all = [...all, ...batch];
    if (batch.length < 2000) break;
    skip += batch.length;
    await delay(200);
  }
  return all;
}

// ─── Write one staging record with retry ──────────────────────────────────────
async function writeWithRetry(fn, maxAttempts = 4) {
  const backoff = [500, 1500, 3000, 6000];
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (err) {
      const msg = String(err?.message || err);
      const retriable = /rate.?limit|429|throttl|timeout|network/i.test(msg);
      if (retriable && attempt < maxAttempts - 1) {
        await delay(backoff[attempt]);
      } else {
        throw err;
      }
    }
  }
}

// ─── Append a log entry to the session ────────────────────────────────────────
async function appendLog(base44, sessionDbId, entry, existingLog) {
  const logs = [...(existingLog || []), { ...entry, ts: new Date().toISOString() }];
  try {
    await base44.asServiceRole.entities.Import_Sessions.update(sessionDbId, { commit_log: logs });
  } catch {}
  return logs;
}

// ─── Main handler ──────────────────────────────────────────────────────────────
Deno.serve(async (req) => {
  let sessionDbId = null;
  let log = [];
  let base44;

  try {
    base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== "admin") {
      return Response.json({ error: "Admin access required" }, { status: 403 });
    }

    const body = await req.json();
    const { sessionId: sessionDbIdIn, entityTarget, rows, mappingRules, transformRules } = body;
    sessionDbId = sessionDbIdIn;

    if (!sessionDbId || !entityTarget || !rows || !mappingRules) {
      return Response.json({ error: "Missing required fields: sessionId, entityTarget, rows, mappingRules" }, { status: 400 });
    }

    const totalRows = rows.length;

    // Mark session as Validating
    await base44.asServiceRole.entities.Import_Sessions.update(sessionDbId, {
      import_status: "Validating",
      total_rows: totalRows,
    });

    log = await appendLog(base44, sessionDbId, {
      phase: "start",
      msg: `Starting server-side staging for ${totalRows} rows → ${entityTarget}`,
    }, log);

    // Fetch existing production records for diff
    log = await appendLog(base44, sessionDbId, { phase: "fetch", msg: "Fetching existing production records…" }, log);
    const existingRecords = await fetchAllExisting(base44, entityTarget);
    log = await appendLog(base44, sessionDbId, { phase: "fetch", msg: `Fetched ${existingRecords.length} existing records` }, log);

    // Load session to get session_id string
    const sess = await base44.asServiceRole.entities.Import_Sessions.filter({ id: sessionDbId });
    const sessionIdStr = sess?.[0]?.session_id || sessionDbId;

    // --- Stage all rows in chunks ---
    const counts = { New: 0, Duplicate: 0, Changed: 0, Conflict: 0, Invalid: 0, Failed: 0 };
    let rowIndex = 0;
    let stagedCount = 0;

    const chunks = [];
    for (let i = 0; i < rows.length; i += CHUNK_SIZE) {
      chunks.push(rows.slice(i, i + CHUNK_SIZE));
    }

    for (let ci = 0; ci < chunks.length; ci++) {
      const chunk = chunks[ci];

      for (const { row, file } of chunk) {
        const currentIndex = rowIndex++;
        try {
          const mapped = applyMapping(row, mappingRules, transformRules || {});
          const { status, conflictDetail, diffSummary, productionRecordId } = classifyRecord(mapped, entityTarget, existingRecords);

          const stagingRecord = {
            session_id: sessionIdStr,
            entity_target: entityTarget,
            row_index: currentIndex,
            source_file: file || "",
            raw_data: row,
            mapped_data: mapped,
            record_status: status,
            diff_summary: diffSummary || {},
            conflict_detail: conflictDetail || "",
            production_record_id: productionRecordId || "",
            commit_decision: "Pending",
          };

          await writeWithRetry(() =>
            base44.asServiceRole.entities.Staging_Records.create(stagingRecord)
          );

          counts[status] = (counts[status] || 0) + 1;
          stagedCount++;
        } catch (err) {
          // Record failed to stage — persist the failure
          try {
            await base44.asServiceRole.entities.Staging_Records.create({
              session_id: sessionIdStr,
              entity_target: entityTarget,
              row_index: currentIndex,
              source_file: file || "",
              raw_data: row,
              mapped_data: {},
              record_status: "Failed",
              conflict_detail: `Staging error: ${err.message}`,
              commit_decision: "Skip",
            });
          } catch {}
          counts.Failed = (counts.Failed || 0) + 1;
          stagedCount++;
        }

        await delay(WRITE_DELAY);
      }

      // Update progress after each chunk
      const pct = Math.round((rowIndex / totalRows) * 100);
      await base44.asServiceRole.entities.Import_Sessions.update(sessionDbId, {
        rows_staged: stagedCount,
        import_status: "Validating",
        validation_report: { ...counts, total_detected: totalRows, total_processed: rowIndex, pct },
      });

      if (ci < chunks.length - 1) await delay(CHUNK_DELAY);
    }

    // Final session update
    const finalReport = {
      ...counts,
      total_detected: totalRows,
      total_processed: rowIndex,
      total_staged: stagedCount,
      pct: 100,
    };

    await base44.asServiceRole.entities.Import_Sessions.update(sessionDbId, {
      rows_staged: stagedCount,
      import_status: "Pending Review",
      validation_report: finalReport,
    });

    log = await appendLog(base44, sessionDbId, {
      phase: "done",
      msg: `Staging complete. ${stagedCount}/${totalRows} rows processed. New:${counts.New} Dup:${counts.Duplicate} Changed:${counts.Changed} Conflict:${counts.Conflict} Invalid:${counts.Invalid} Failed:${counts.Failed}`,
    }, log);

    return Response.json({
      success: true,
      totalRows,
      staged: stagedCount,
      counts: finalReport,
    });

  } catch (err) {
    // Try to mark session as failed
    if (base44 && sessionDbId) {
      try {
        await base44.asServiceRole.entities.Import_Sessions.update(sessionDbId, {
          import_status: "Failed",
        });
        await appendLog(base44, sessionDbId, { phase: "error", msg: `Fatal error: ${err.message}` }, log);
      } catch {}
    }
    return Response.json({ error: err.message }, { status: 500 });
  }
});