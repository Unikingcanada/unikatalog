/**
 * MasterCatalogImporter.jsx
 * Admin-only one-click bulk importer for the UniKatalog master CSV files.
 * Runs 4 phases server-side in chunks; shows live per-entity progress.
 */
import { useState, useRef } from "react";
import { masterCatalogImport } from "@/functions/masterCatalogImport";

const PHASES = [
  { key: "chains",      label: "Normalized_Chains",        icon: "🔗", desc: "866 chains — upsert on chain_number" },
  { key: "dimensions",  label: "Chain_Dimensions",         icon: "📐", desc: "Dimension data from master CSV" },
  { key: "perf",        label: "Performance_Data",         icon: "⚡", desc: "Tensile / working load data" },
  { key: "equivalents", label: "Manufacturer_Equivalents", icon: "🏭", desc: "963 cross-reference rows" },
];

const CHUNK_SIZE = 20;

function StatPill({ label, count, color }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "2px 9px", borderRadius: 99, border: `1px solid ${color}44`, background: `${color}11`, fontSize: 10, fontWeight: 700, color }}>
      {label}: {count}
    </span>
  );
}

function PhaseRow({ phase, state }) {
  // processed = rows we've actually sent to the server so far (chunk * chunkSize)
  const processed = Math.min(state.chunk * CHUNK_SIZE, state.total);
  const pct = state.total > 0 ? Math.min(100, Math.round((processed / state.total) * 100)) : 0;
  const remaining = state.total > 0 ? Math.max(0, state.total - processed) : null;

  const statusColor = state.status === "done" ? "#166534" : state.status === "running" ? "#1d4ed8" : "#94a3b8";
  const bgColor     = state.status === "done" ? "#f0fdf4" : state.status === "running" ? "#eff6ff" : "#f8fafc";

  return (
    <div style={{ background: bgColor, border: `1px solid ${statusColor}33`, borderRadius: 10, padding: "14px 18px", marginBottom: 10 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8, flexWrap: "wrap" }}>
        <span style={{ fontSize: 18 }}>{phase.icon}</span>
        <div style={{ flex: 1 }}>
          <span style={{ fontSize: 13, fontWeight: 800, color: "#0C2340" }}>{phase.label}</span>
          <span style={{ fontSize: 11, color: "#64748b", marginLeft: 8 }}>{phase.desc}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {state.status === "running" && remaining !== null && (
            <span style={{ fontSize: 10, color: "#64748b" }}>{remaining} left</span>
          )}
          <span style={{ fontSize: 11, fontWeight: 700, color: statusColor, textTransform: "uppercase", letterSpacing: 0.5 }}>
            {state.status === "idle" ? "Waiting" : state.status === "running" ? `${pct}%` : "✓ Done"}
          </span>
        </div>
      </div>

      {/* Progress bar */}
      {(state.status === "running" || state.status === "done") && state.total > 0 && (
        <div style={{ height: 4, background: "#e2e8f0", borderRadius: 99, overflow: "hidden", marginBottom: 8 }}>
          <div style={{ height: "100%", width: `${pct}%`, background: state.status === "done" ? "#22c55e" : "#3b82f6", borderRadius: 99, transition: "width 0.3s" }} />
        </div>
      )}

      {/* Stats */}
      {(state.created + state.updated + state.skipped + state.errors.length > 0) && (
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: state.errors.length > 0 ? 8 : 0 }}>
          {state.created > 0 && <StatPill label="Created" count={state.created} color="#166534" />}
          {state.updated > 0 && <StatPill label="Updated" count={state.updated} color="#1d4ed8" />}
          {state.skipped > 0 && <StatPill label="Skipped" count={state.skipped} color="#854d0e" />}
          {state.errors.length > 0 && <StatPill label="Errors" count={state.errors.length} color="#dc2626" />}
          {state.total > 0 && (
            <span style={{ fontSize: 10, color: "#94a3b8", alignSelf: "center" }}>
              / {state.total} rows
            </span>
          )}
        </div>
      )}

      {/* Error list */}
      {state.errors.length > 0 && (
        <details style={{ marginTop: 4 }}>
          <summary style={{ fontSize: 10, color: "#dc2626", cursor: "pointer", fontWeight: 700 }}>
            {state.errors.length} error{state.errors.length !== 1 ? "s" : ""} — click to expand
          </summary>
          <div style={{ marginTop: 6, maxHeight: 120, overflowY: "auto", background: "#fff", borderRadius: 6, border: "1px solid #fca5a5", padding: "6px 10px" }}>
            {state.errors.map((e, i) => (
              <div key={i} style={{ fontSize: 10, color: "#dc2626", fontFamily: "monospace", marginBottom: 2 }}>• {e}</div>
            ))}
          </div>
        </details>
      )}
    </div>
  );
}

function emptyPhaseState() {
  return { status: "idle", chunk: 0, total: 0, created: 0, updated: 0, skipped: 0, errors: [] };
}

export default function MasterCatalogImporter() {
  const [running, setRunning] = useState(false);
  const [aborted, setAborted] = useState(false);
  const abortRef = useRef(false);

  const [phaseStates, setPhaseStates] = useState(() =>
    Object.fromEntries(PHASES.map(p => [p.key, emptyPhaseState()]))
  );
  const [globalError, setGlobalError] = useState(null);
  const [finished, setFinished] = useState(false);

  function updatePhase(key, patch) {
    setPhaseStates(prev => ({ ...prev, [key]: { ...prev[key], ...patch } }));
  }

  function mergePhaseStats(key, result) {
    setPhaseStates(prev => {
      const cur = prev[key];
      return {
        ...prev,
        [key]: {
          ...cur,
          created: cur.created + (result.created?.length ?? 0),
          updated: cur.updated + (result.updated?.length ?? 0),
          skipped: cur.skipped + (result.skipped?.length ?? 0),
          errors:  [...cur.errors, ...(result.errors ?? [])],
          total:   result.total ?? cur.total,
          chunk:   result.nextChunk ?? cur.chunk,
        },
      };
    });
  }

  async function runPhase(phaseKey, startChunk = 0) {
    updatePhase(phaseKey, { status: "running", chunk: startChunk });
    let chunk = startChunk;

    while (true) {
      if (abortRef.current) return false;

      let result;
      try {
        const res = await masterCatalogImport({ phase: phaseKey, chunk, chunkSize: CHUNK_SIZE });
        result = res.data;
      } catch (e) {
        // Network-level failure: record error but keep going with next chunk
        mergePhaseStats(phaseKey, { errors: [`chunk ${chunk} network error: ${e.message}`], nextChunk: chunk + 1 });
        chunk = chunk + 1;
        // Check if we've gone past total (unknown without a response — allow up to 50 chunks)
        if (chunk > 50) {
          updatePhase(phaseKey, { status: "done" });
          return true;
        }
        continue;
      }

      mergePhaseStats(phaseKey, result);
      chunk = result.nextChunk;

      if (result.done || chunk === null) {
        updatePhase(phaseKey, { status: "done" });
        return true;
      }
    }
  }

  async function handleStart() {
    abortRef.current = false;
    setAborted(false);
    setRunning(true);
    setFinished(false);
    setGlobalError(null);
    setPhaseStates(Object.fromEntries(PHASES.map(p => [p.key, emptyPhaseState()])));

    for (const phase of PHASES) {
      if (abortRef.current) break;
      await runPhase(phase.key, 0); // always continue to next phase even if rows had errors
    }

    setRunning(false);
    if (!abortRef.current) setFinished(true);
  }

  function handleAbort() {
    abortRef.current = true;
    setAborted(true);
    setRunning(false);
  }

  const totalCreated = PHASES.reduce((a, p) => a + phaseStates[p.key].created, 0);
  const totalUpdated = PHASES.reduce((a, p) => a + phaseStates[p.key].updated, 0);
  const totalErrors  = PHASES.reduce((a, p) => a + phaseStates[p.key].errors.length, 0);

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 20, fontWeight: 900, color: "#0C2340", marginBottom: 4 }}>
          🚀 Import Master Catalog
        </div>
        <div style={{ fontSize: 12, color: "#64748b", maxWidth: 640, lineHeight: 1.6 }}>
          One-click bulk import from the two public GitHub CSVs. Runs server-side in 20-row chunks across 4 entity phases. Rate-limited writes use automatic exponential backoff (up to 6 retries).
          Chains are upserted on <code style={{ background: "#f1f5f9", padding: "1px 5px", borderRadius: 3 }}>chain_number</code>; child rows are linked by <code style={{ background: "#f1f5f9", padding: "1px 5px", borderRadius: 3 }}>chain_id</code>.
          Safe to re-run — duplicates are skipped.
        </div>
      </div>

      {/* Source info */}
      <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 8, padding: "10px 16px", marginBottom: 20, fontSize: 11, color: "#475569" }}>
        <div style={{ fontWeight: 700, marginBottom: 4 }}>📂 Data Sources (fetched live by server)</div>
        <div>Chains master (866 rows): <code>PKG-MASTER_all_chains.csv</code></div>
        <div>Equivalents (963 rows): <code>PKG-MASTER_equivalents_long.csv</code></div>
      </div>

      {/* Phase rows */}
      {PHASES.map(phase => (
        <PhaseRow key={phase.key} phase={phase} state={phaseStates[phase.key]} />
      ))}

      {/* Global error */}
      {globalError && (
        <div style={{ background: "#fef2f2", border: "1px solid #fca5a5", borderRadius: 8, padding: "10px 16px", marginBottom: 16, fontSize: 12, color: "#dc2626" }}>
          ⚠ {globalError}
        </div>
      )}

      {/* Finished summary */}
      {finished && (
        <div style={{ background: "#f0fdf4", border: "1px solid #86efac", borderRadius: 10, padding: "14px 20px", marginBottom: 16 }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: "#166534", marginBottom: 8 }}>✅ Import Complete</div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <StatPill label="Total Created" count={totalCreated} color="#166534" />
            <StatPill label="Total Updated" count={totalUpdated} color="#1d4ed8" />
            {totalErrors > 0 && <StatPill label="Errors" count={totalErrors} color="#dc2626" />}
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div style={{ display: "flex", gap: 10, alignItems: "center", marginTop: 8 }}>
        <button
          onClick={handleStart}
          disabled={running}
          style={{
            padding: "11px 28px", borderRadius: 8, fontSize: 13, fontWeight: 800, cursor: running ? "default" : "pointer",
            background: running ? "#e2e8f0" : "#0C2340", color: running ? "#94a3b8" : "#fff", border: "none",
            display: "flex", alignItems: "center", gap: 8,
          }}
        >
          {running ? (
            <>
              <span style={{ display: "inline-block", width: 12, height: 12, borderRadius: "50%", border: "2px solid #94a3b8", borderTopColor: "#475569", animation: "spin 0.7s linear infinite" }} />
              Importing…
            </>
          ) : finished ? "Re-run Import" : "▶ Start Import"}
        </button>

        {running && (
          <button onClick={handleAbort} style={{ padding: "11px 20px", borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: "pointer", background: "#fef2f2", color: "#dc2626", border: "1px solid #fca5a5" }}>
            ⏹ Abort
          </button>
        )}

        {aborted && (
          <span style={{ fontSize: 11, color: "#dc2626", fontWeight: 600 }}>Aborted — click Start to resume from beginning</span>
        )}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}