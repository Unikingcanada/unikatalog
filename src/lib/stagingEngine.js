/**
 * stagingEngine.js
 *
 * Shared utilities for driving the chunked staging loop and loading/saving
 * the persisted import payload. Used by both ICSessionWorkflow (new sessions)
 * and ICSessionDetailView (resume after reload / stall recovery).
 */
import { base44 } from "@/api/base44Client";

export const CHUNK_SIZE = 25;

// ── Save payload to DB ────────────────────────────────────────────────────────
// Called once after session creation. Stores ALL original rows so resume
// after page reload never requires re-upload.
export async function saveImportPayload({ sessionId, entityTarget, allRows, mappingRules, transformRules, chunkSize = CHUNK_SIZE }) {
  // rows_json can be large — we store it as a JSON string in the text field.
  // Base44 entity field size limit: avoid storing >5MB. For 429 rows this is safe.
  const payload = {
    session_id: sessionId,
    entity_target: entityTarget,
    mapping_rules: mappingRules || {},
    transform_rules: transformRules || {},
    rows_json: JSON.stringify(allRows),
    total_rows: allRows.length,
    source_files: [...new Set(allRows.map(r => r.file).filter(Boolean))],
    chunk_size: chunkSize,
  };
  return base44.entities.Import_Payload.create(payload);
}

// ── Load payload from DB ──────────────────────────────────────────────────────
// Returns { allRows, mappingRules, transformRules, chunkSize } or null if not found.
export async function loadImportPayload(sessionId) {
  try {
    const results = await base44.entities.Import_Payload.filter({ session_id: sessionId });
    const record = results?.[0];
    if (!record) return null;
    const allRows = JSON.parse(record.rows_json || "[]");
    return {
      allRows,
      mappingRules: record.mapping_rules || {},
      transformRules: record.transform_rules || {},
      chunkSize: record.chunk_size || CHUNK_SIZE,
      entityTarget: record.entity_target,
      totalRows: record.total_rows || allRows.length,
    };
  } catch {
    return null;
  }
}

// ── Chunk-loop driver ─────────────────────────────────────────────────────────
// Runs entirely in the browser. Slices each chunk client-side and sends only
// that chunk to importStageJob — keeps payloads small and avoids SDK limits.
// startChunkIndex: resume from this chunk (0 = fresh start).
export async function runChunkLoop({
  sessionDbId,
  entityTarget,
  allRows,
  mappingRules,
  transformRules,
  startChunkIndex = 0,
  chunkSize = CHUNK_SIZE,
  onProgress,
  onError,
  onDone,
  cancelRef, // { current: true } → abort the loop
}) {
  if (!allRows || !allRows.length) {
    if (onError) onError("Parsed rows unavailable. Please re-upload.");
    return;
  }

  const totalRows = allRows.length;
  const totalChunks = Math.ceil(totalRows / chunkSize);
  let chunkIndex = startChunkIndex;

  while (true) {
    if (cancelRef?.current) return;

    const chunkStart = chunkIndex * chunkSize;
    const chunkEnd = Math.min(chunkStart + chunkSize, totalRows);
    const chunkRows = allRows.slice(chunkStart, chunkEnd);

    console.log("[runChunkLoop] dispatching chunk", {
      chunkIndex,
      chunkStart,
      chunkEnd,
      chunkRowsLength: chunkRows.length,
      totalRows,
      totalChunks,
      hasMappingRules: !!mappingRules,
    });

    let result;
    try {
      result = await base44.functions.invoke("importStageJob", {
        sessionId: sessionDbId,
        entityTarget,
        rows: chunkRows,
        mappingRules,
        transformRules: transformRules || {},
        chunkIndex,
        chunkSize,
        totalRows,
      });
    } catch (err) {
      // Try to extract the structured error body from a 400/500 response
      let detail = err.message;
      try {
        const errBody = err?.response?.data ?? err?.data;
        if (errBody?.error) {
          detail = errBody.error;
          if (errBody.received_keys) detail += ` (received keys: ${errBody.received_keys})`;
          if (errBody.hint) detail += ` — ${errBody.hint}`;
        }
      } catch {}
      if (onError) onError(`Chunk ${chunkIndex} failed: ${detail}`);
      return;
    }

    // invoke returns the parsed response body — unwrap .data envelope if present
    if (result?.data) result = result.data;

    if (result?.error) {
      if (onError) onError(`Chunk ${chunkIndex} server error: ${result.error}${result.received_keys ? ` (received: ${result.received_keys})` : ""}`);
      return;
    }

    if (onProgress) onProgress(result);

    if (result?.done) {
      if (onDone) onDone(result);
      return;
    }

    chunkIndex++;
    await new Promise(r => setTimeout(r, 150));
  }
}