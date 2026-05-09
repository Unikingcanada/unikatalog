/**
 * commitEngine.js
 * Shared commit utilities: retry with exponential backoff, chunked commit loop,
 * resumable progress, rich progress reporting.
 *
 * Used by ICSessionWorkflow and ICSessionDetailView.
 * No React dependencies — pure async utilities.
 */

export const delay = (ms) => new Promise(res => setTimeout(res, ms));

const RATE_LIMIT_PATTERNS = [
  /rate.?limit/i,
  /too.?many.?requests/i,
  /429/,
  /timeout/i,
  /network.?error/i,
];

function isRateLimitError(err) {
  const msg = err?.message || String(err);
  return RATE_LIMIT_PATTERNS.some(p => p.test(msg));
}

const BACKOFF_DELAYS = [1000, 2000, 4000, 8000]; // 4 attempts

/**
 * Retry an async operation with exponential backoff.
 * Only retries on rate-limit / timeout errors.
 * @param {() => Promise<any>} fn
 * @param {(attempt, waitMs) => void} onRetry — called before each retry
 * @returns result of fn
 */
export async function withRetry(fn, onRetry) {
  let lastErr;
  for (let attempt = 0; attempt <= BACKOFF_DELAYS.length; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      if (attempt < BACKOFF_DELAYS.length && isRateLimitError(err)) {
        const waitMs = BACKOFF_DELAYS[attempt];
        if (onRetry) onRetry(attempt + 1, waitMs);
        await delay(waitMs);
      } else {
        throw err;
      }
    }
  }
  throw lastErr;
}

/**
 * Core chunked commit loop — shared by both ICSessionWorkflow and ICSessionDetailView.
 *
 * @param {object} opts
 * @param {object[]}  opts.toCommit       — staging records to commit (already filtered to uncommitted)
 * @param {string}    opts.entityTarget   — production entity name
 * @param {number}    opts.chunkSize      — records per chunk
 * @param {object[]}  opts.existingLog    — prior commit_log entries (for resume append)
 * @param {object}    opts.base44         — base44 client
 * @param {Function}  opts.onProgress     — (msg: string) => void
 * @returns {{ written, failed, flagsGenerated, commitLog }}
 */
export async function runCommitLoop({ toCommit, entityTarget, chunkSize, existingLog = [], base44, onProgress }) {
  const { chunkArray } = await import('./importCenterEngine.js');
  const { generateAutoFlags } = await import('./importCenterEngine.js');

  const chunks = chunkArray(toCommit, chunkSize);
  let written = 0;
  let failed = 0;
  let flagsGenerated = 0;
  const commitLog = [...existingLog];

  for (let ci = 0; ci < chunks.length; ci++) {
    const chunk = chunks[ci];
    const newIds = [];
    const updatedIds = [];

    for (const record of chunk) {
      onProgress(`Chunk ${ci + 1}/${chunks.length} · ${written} written · ${failed} failed`);

      try {
        if (record.record_status === "New") {
          const result = await withRetry(
            () => base44.entities[entityTarget].create(record.mapped_data),
            (attempt, ms) => onProgress(`Chunk ${ci + 1}/${chunks.length} · Rate limit — retry ${attempt}/4, waiting ${ms / 1000}s…`)
          );
          if (result?.id) newIds.push(result.id);
        } else if (record.record_status === "Changed" || record.record_status === "Conflict") {
          if (record.production_record_id) {
            await withRetry(
              () => base44.entities[entityTarget].update(record.production_record_id, record.mapped_data),
              (attempt, ms) => onProgress(`Chunk ${ci + 1}/${chunks.length} · Rate limit — retry ${attempt}/4, waiting ${ms / 1000}s…`)
            );
            updatedIds.push(record.production_record_id);
          }
        }

        // Auto-flags
        const flags = generateAutoFlags(record.mapped_data, record.record_status, record.conflict_detail, entityTarget);
        for (const flag of flags) {
          await withRetry(
            () => base44.entities.Chain_Review_Flags.create(flag),
            (attempt, ms) => onProgress(`Flags · Rate limit — retry ${attempt}/4, waiting ${ms / 1000}s…`)
          );
          flagsGenerated++;
          await delay(120);
        }

        await withRetry(
          () => base44.entities.Staging_Records.update(record.id, {
            record_status: "Committed",
            committed_at: new Date().toISOString(),
          }),
          (attempt, ms) => onProgress(`Staging update · Rate limit — retry ${attempt}/4, waiting ${ms / 1000}s…`)
        );
        written++;
      } catch (e) {
        // Final failure after all retries
        try {
          await base44.entities.Staging_Records.update(record.id, {
            record_status: "Failed",
            conflict_detail: `Commit error: ${e.message}`,
          });
        } catch {}
        failed++;
      }

      await delay(150); // ~6 writes/sec steady-state
    }

    commitLog.push({
      chunk: ci + 1,
      entity: entityTarget,
      newIds,
      updatedIds,
      timestamp: new Date().toISOString(),
    });

    if (ci < chunks.length - 1) await delay(500); // inter-chunk pause
  }

  return { written, failed, flagsGenerated, commitLog };
}