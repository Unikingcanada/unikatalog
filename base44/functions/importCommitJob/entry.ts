/**
 * importCommitJob — Server-side background commit worker.
 *
 * Runs entirely on Deno. The browser tab can be closed — this will finish.
 *
 * Payload:
 *   sessionDbId  — Import_Sessions db record id
 *   entityTarget — production entity to write to
 */
import { createClientFromRequest } from "npm:@base44/sdk@0.8.25";

const WRITE_DELAY = 120;
const CHUNK_SIZE = 30;
const CHUNK_DELAY = 400;

function delay(ms) {
  return new Promise(res => setTimeout(res, ms));
}

async function writeWithRetry(fn, maxAttempts = 4) {
  const backoff = [600, 1800, 4000, 8000];
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

const TRUSTED_BRANDS = [
  "Tsubaki", "Donghua", "Regina", "Allied Locke", "Renold", "Rexnord",
  "Iwis", "Diamond", "Drives", "Ramsey", "Webster", "HKK", "KettenWulf",
];

function isHSeriesChain(chainId) {
  return typeof chainId === "string" && /H$/i.test(chainId.trim());
}

function generateAutoFlags(mappedData, status, conflictDetail, entityTarget) {
  const flags = [];
  const chainId = mappedData.chain_id || mappedData.brand_part_number || "?";

  if (status === "Conflict") {
    flags.push({
      chain_id: chainId,
      flag_type: "Conflicting Specs",
      severity: "High",
      description: `Import conflict: ${conflictDetail}`,
      needs_review: true,
      review_status: "Pending",
    });
  }
  if (entityTarget === "Chain_Dimensions") {
    const dimFields = ["pitch_mm", "roller_dia_mm", "pin_dia_mm", "inner_width_mm"];
    const missing = dimFields.filter(f => !mappedData[f] && mappedData[f] !== 0);
    if (missing.length > 0) {
      flags.push({
        chain_id: chainId,
        flag_type: "Missing Dimensions",
        severity: "Critical",
        description: `Missing dimension fields: ${missing.join(", ")}`,
        affected_field: missing.join(", "),
        needs_review: true,
        review_status: "Pending",
      });
    }
  }
  if (entityTarget === "Manufacturer_Equivalents" && !mappedData.equivalency_type) {
    const sourceBrandTrusted = TRUSTED_BRANDS.some(
      b => (mappedData.source_brand || mappedData.brand || "").toLowerCase().includes(b.toLowerCase())
    );
    const isHSeries = isHSeriesChain(chainId);
    const isNew = status === "New";
    flags.push({
      chain_id: mappedData.chain_id || chainId,
      flag_type: "Unverified Equivalency",
      severity: isHSeries && sourceBrandTrusted && isNew ? "Medium" : "High",
      description: "Equivalency imported without equivalency_type classification.",
      needs_review: true,
      review_status: "Pending",
    });
  }
  if (entityTarget === "Normalized_Chains" && status === "New") {
    const sourceBrandTrusted = TRUSTED_BRANDS.some(
      b => (mappedData.source_brand || "").toLowerCase().includes(b.toLowerCase())
    );
    if (isHSeriesChain(chainId) && sourceBrandTrusted) {
      flags.push({
        chain_id: chainId,
        flag_type: "Unverified Equivalency",
        severity: "Medium",
        description: "H-series chain imported as standalone SKU.",
        resolution_notes: "Heavy-series: H-suffix + trusted brand + no duplicate detected.",
        needs_review: true,
        review_status: "Pending",
      });
    }
  }
  return flags;
}

async function fetchPagedStagingRecords(base44, sessionIdStr, entityTarget) {
  let all = [], skip = 0;
  while (true) {
    const batch = await base44.asServiceRole.entities.Staging_Records.filter(
      { session_id: sessionIdStr, entity_target: entityTarget },
      "row_index",
      1000,
      skip
    );
    if (!batch || !batch.length) break;
    all = [...all, ...batch];
    if (batch.length < 1000) break;
    skip += batch.length;
    await delay(150);
  }
  return all;
}

async function appendLog(base44, sessionDbId, entry, existingLog) {
  const logs = [...(existingLog || []), { ...entry, ts: new Date().toISOString() }];
  try {
    await base44.asServiceRole.entities.Import_Sessions.update(sessionDbId, { commit_log: logs });
  } catch {}
  return logs;
}

Deno.serve(async (req) => {
  let log = [];
  let base44;
  let sessionDbId = null;

  try {
    base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== "admin") {
      return Response.json({ error: "Admin access required" }, { status: 403 });
    }

    const body = await req.json();
    sessionDbId = body.sessionDbId;
    const entityTarget = body.entityTarget;

    if (!sessionDbId || !entityTarget) {
      return Response.json({ error: "Missing sessionDbId or entityTarget" }, { status: 400 });
    }

    // Load session
    const sessions = await base44.asServiceRole.entities.Import_Sessions.filter({ id: sessionDbId });
    const sess = sessions?.[0];
    if (!sess) return Response.json({ error: "Session not found" }, { status: 404 });

    const sessionIdStr = sess.session_id || sessionDbId;
    log = sess.commit_log || [];

    // Mark as Committing
    await base44.asServiceRole.entities.Import_Sessions.update(sessionDbId, {
      import_status: "Committing",
    });
    log = await appendLog(base44, sessionDbId, { phase: "commit_start", msg: `Starting commit for session ${sessionIdStr}` }, log);

    // Load all staging records for this session
    log = await appendLog(base44, sessionDbId, { phase: "commit_start", msg: "Loading staging records…" }, log);
    const allStaged = await fetchPagedStagingRecords(base44, sessionIdStr, entityTarget);
    log = await appendLog(base44, sessionDbId, { phase: "commit_start", msg: `Loaded ${allStaged.length} staging records` }, log);

    // Determine records to commit (skip already committed / skipped / duplicates with Skip decision)
    const toCommit = allStaged.filter(r =>
      r.record_status !== "Committed" &&
      r.record_status !== "Skipped" &&
      !(r.record_status === "Duplicate" && r.commit_decision !== "Include") &&
      r.commit_decision !== "Skip" &&
      (r.record_status === "New" || r.record_status === "Changed" || r.record_status === "Conflict" || r.commit_decision === "Include")
    );

    const toSkip = allStaged.filter(r =>
      r.record_status === "Duplicate" ||
      r.commit_decision === "Skip" ||
      r.record_status === "Invalid"
    );

    log = await appendLog(base44, sessionDbId, {
      phase: "commit_plan",
      msg: `Plan: ${toCommit.length} to commit, ${toSkip.length} to skip, ${allStaged.length} total`,
    }, log);

    // Mark skipped records
    for (const r of toSkip) {
      if (r.record_status !== "Skipped") {
        try {
          await base44.asServiceRole.entities.Staging_Records.update(r.id, { record_status: "Skipped" });
        } catch {}
        await delay(40);
      }
    }

    // Capture rollback snapshots for Changed/Conflict records
    const rollbackSnapshots = [];
    for (const record of toCommit) {
      if ((record.record_status === "Changed" || record.record_status === "Conflict") && record.production_record_id) {
        try {
          const existing = await base44.asServiceRole.entities[entityTarget].filter({ id: record.production_record_id });
          const original = existing?.[0] || null;
          if (original) rollbackSnapshots.push({ productionId: record.production_record_id, stagingRecordId: record.id, originalData: { ...original } });
        } catch {}
        await delay(60);
      }
    }

    // --- Chunked commit loop ---
    let written = 0;
    let failed = 0;
    let flagsGenerated = 0;
    const commitChunkLog = [];

    const chunks = [];
    for (let i = 0; i < toCommit.length; i += CHUNK_SIZE) {
      chunks.push(toCommit.slice(i, i + CHUNK_SIZE));
    }

    for (let ci = 0; ci < chunks.length; ci++) {
      const chunk = chunks[ci];
      const newIds = [];
      const updatedIds = [];

      for (const record of chunk) {
        try {
          if (record.record_status === "New") {
            const result = await writeWithRetry(() =>
              base44.asServiceRole.entities[entityTarget].create(record.mapped_data)
            );
            if (result?.id) newIds.push(result.id);
          } else if (record.record_status === "Changed" || record.record_status === "Conflict") {
            if (record.production_record_id) {
              await writeWithRetry(() =>
                base44.asServiceRole.entities[entityTarget].update(record.production_record_id, record.mapped_data)
              );
              updatedIds.push(record.production_record_id);
            }
          }

          // Auto-flags
          const flags = generateAutoFlags(record.mapped_data, record.record_status, record.conflict_detail, entityTarget);
          for (const flag of flags) {
            await writeWithRetry(() => base44.asServiceRole.entities.Chain_Review_Flags.create(flag));
            flagsGenerated++;
            await delay(80);
          }

          await writeWithRetry(() =>
            base44.asServiceRole.entities.Staging_Records.update(record.id, {
              record_status: "Committed",
              committed_at: new Date().toISOString(),
            })
          );
          written++;
        } catch (e) {
          try {
            await base44.asServiceRole.entities.Staging_Records.update(record.id, {
              record_status: "Failed",
              conflict_detail: `Commit error: ${e.message}`,
            });
          } catch {}
          failed++;
        }

        await delay(WRITE_DELAY);
      }

      commitChunkLog.push({
        chunk: ci + 1, of: chunks.length, entity: entityTarget,
        newIds, updatedIds, written, failed,
        timestamp: new Date().toISOString(),
      });

      // Persist progress mid-commit
      await base44.asServiceRole.entities.Import_Sessions.update(sessionDbId, {
        rows_written: written,
        failed_rows: failed,
        flags_generated: flagsGenerated,
      });

      if (ci < chunks.length - 1) await delay(CHUNK_DELAY);
    }

    const duplicatesSkipped = toSkip.filter(r => r.record_status === "Duplicate").length;
    const skipDecision = toSkip.filter(r => r.commit_decision === "Skip").length;

    log = await appendLog(base44, sessionDbId, {
      phase: "commit_done",
      msg: `Commit complete. Written:${written} Failed:${failed} Skipped:${duplicatesSkipped + skipDecision} Flags:${flagsGenerated}`,
    }, log);

    await base44.asServiceRole.entities.Import_Sessions.update(sessionDbId, {
      import_status: failed === 0 ? "Committed" : "Partially Committed",
      rows_written: written,
      failed_rows: failed,
      duplicates_skipped: duplicatesSkipped + skipDecision,
      flags_generated: flagsGenerated,
      rollback_available: written > 0,
      rollback_snapshot_ref: JSON.stringify(rollbackSnapshots),
      commit_log: [...log, ...commitChunkLog],
    });

    return Response.json({
      success: true,
      written, failed,
      skipped: duplicatesSkipped + skipDecision,
      flagsGenerated,
    });

  } catch (err) {
    if (base44 && sessionDbId) {
      try {
        await base44.asServiceRole.entities.Import_Sessions.update(sessionDbId, { import_status: "Failed" });
        await appendLog(base44, sessionDbId, { phase: "error", msg: `Fatal commit error: ${err.message}` }, log);
      } catch {}
    }
    return Response.json({ error: err.message }, { status: 500 });
  }
});