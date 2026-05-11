/**
 * ICSessionDetailView — Full session view with resume/retry/commit capabilities.
 * Supports: Pending Review, Partially Committed, Failed, Committed sessions.
 */
import { useState, useEffect, useCallback, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { STATUS_COLORS, SESSION_STATUS_COLORS, CHUNK_SIZE } from "@/lib/importCenterEngine";
import { runCommitLoop, withRetry, delay } from "@/lib/commitEngine";
import { importCommitJob } from "@/functions/importCommitJob";
import ICDiffViewer from "./ICDiffViewer";
import * as XLSX from "xlsx";

const STATUS_FILTERS = ["All", "Failed", "Conflict", "Duplicate", "Committed", "Skipped", "Invalid", "New", "Changed", "Pending"];
const RESUMABLE_STATUSES = ["Staged", "Pending Review", "Committing", "Partially Committed", "Failed"];
const LIVE_POLL_STATUSES = ["Validating", "Committing"]; // statuses where server is actively working
const STALL_THRESHOLD_MS = 5 * 60 * 1000; // 5 minutes with no heartbeat = stalled

// ── Styles ────────────────────────────────────────────────────────────────────
const S = {
  pill: (status) => {
    const c = STATUS_COLORS[status] || STATUS_COLORS.Pending;
    return { display: "inline-block", padding: "2px 9px", borderRadius: 99, background: c.bg, border: `1px solid ${c.border}`, color: c.text, fontSize: 10, fontWeight: 800, whiteSpace: "nowrap" };
  },
  mono: { fontFamily: "monospace", fontSize: 11, whiteSpace: "pre-wrap", wordBreak: "break-all" },
};

// ── JSON Expandable Block ─────────────────────────────────────────────────────
function JsonBlock({ label, data, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  if (!data || (typeof data === "object" && Object.keys(data).length === 0)) return null;
  return (
    <div style={{ marginTop: 6 }}>
      <button onClick={() => setOpen(o => !o)}
        style={{ background: "#f1f5f9", border: "1px solid #e2e8f0", borderRadius: 5, padding: "3px 10px", fontSize: 10, fontWeight: 700, cursor: "pointer", color: "#475569" }}>
        {open ? "▾" : "▸"} {label}
      </button>
      {open && (
        <pre style={{ ...S.mono, background: "#0f172a", color: "#94a3b8", borderRadius: 7, padding: "10px 14px", marginTop: 6, maxHeight: 260, overflowY: "auto", border: "1px solid #1e293b" }}>
          {JSON.stringify(data, null, 2)}
        </pre>
      )}
    </div>
  );
}

// ── Bulk Retry Progress Panel ─────────────────────────────────────────────────
function RetryProgressPanel({ progress }) {
  if (!progress) return null;
  const isBackoff = progress.msg.includes("retry") || progress.msg.includes("Rate limit");
  return (
    <div style={{ background: isBackoff ? "#fffbeb" : "#f0fdf4", border: `1px solid ${isBackoff ? "#fde68a" : "#86efac"}`, borderRadius: 10, padding: "14px 18px", marginBottom: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
        <span style={{ fontSize: 18 }}>{isBackoff ? "⏸" : "⏳"}</span>
        <span style={{ fontSize: 13, fontWeight: 700, color: isBackoff ? "#92400e" : "#166534" }}>{progress.msg}</span>
      </div>
      <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
        {[
          { label: "Retrying", value: `${progress.current} / ${progress.total}`, color: "#0C2340" },
          { label: "Written",  value: progress.written,  color: "#22c55e" },
          { label: "Failed",   value: progress.failed,   color: "#ef4444" },
        ].map(s => (
          <div key={s.label} style={{ textAlign: "center" }}>
            <div style={{ fontSize: 20, fontWeight: 900, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 10, color: "#64748b", fontWeight: 600 }}>{s.label}</div>
          </div>
        ))}
      </div>
      {/* Progress bar */}
      <div style={{ marginTop: 10, height: 6, background: "#e2e8f0", borderRadius: 99, overflow: "hidden" }}>
        <div style={{ height: "100%", background: isBackoff ? "#fbbf24" : "#22c55e", width: `${Math.round((progress.current / Math.max(progress.total, 1)) * 100)}%`, transition: "width 0.3s ease", borderRadius: 99 }} />
      </div>
    </div>
  );
}

// ── Bulk Retry Toolbar (shown when failed records exist in debug mode) ─────────
function BulkRetryToolbar({ failedCount, selectedIds, allFailedIds, onSelectAll, onClearAll, onRetryAll, onRetrySelected, onMarkSkipped, onExportFailed, busy }) {
  if (failedCount === 0) return null;
  const hasSelection = selectedIds.size > 0;
  const allSelected = selectedIds.size === allFailedIds.length && allFailedIds.length > 0;

  return (
    <div style={{ background: "#fef2f2", border: "1px solid #fca5a5", borderRadius: 10, padding: "12px 16px", marginBottom: 14, display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
      <span style={{ fontSize: 12, fontWeight: 800, color: "#991b1b", marginRight: 4 }}>
        ⚠ {failedCount} Failed {failedCount === 1 ? "Record" : "Records"}
      </span>

      {/* Select all toggle */}
      <button onClick={allSelected ? onClearAll : onSelectAll} disabled={busy}
        style={tb("#fff", "#991b1b", "#fca5a5")}>
        {allSelected ? "☐ Deselect All" : `☑ Select All Failed (${allFailedIds.length})`}
      </button>

      {/* Retry All Failed */}
      <button onClick={onRetryAll} disabled={busy}
        style={tb("#7c3aed", "#fff", "#7c3aed")}>
        ↺ Retry All Failed
      </button>

      {/* Retry Selected */}
      <button onClick={onRetrySelected} disabled={busy || !hasSelection}
        style={{ ...tb("#0C2340", "#fff", "#0C2340"), opacity: hasSelection ? 1 : 0.4 }}>
        ↺ Retry Selected ({selectedIds.size})
      </button>

      {/* Mark Selected as Skipped */}
      <button onClick={onMarkSkipped} disabled={busy || !hasSelection}
        style={{ ...tb("#475569", "#fff", "#475569"), opacity: hasSelection ? 1 : 0.4 }}>
        ✗ Skip Selected
      </button>

      {/* Export Failed Rows */}
      <button onClick={onExportFailed} disabled={busy}
        style={tb("#1d4ed8", "#fff", "#1d4ed8")}>
        ↓ Export Failed
      </button>
    </div>
  );
}

function tb(bg, color, border) {
  return { background: bg, color, border: `1px solid ${border}`, borderRadius: 7, padding: "6px 13px", fontSize: 11, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" };
}

// ── Single Record Row ─────────────────────────────────────────────────────────
function RecordRow({ record, onRetry, onEditRetry, index, selectable, selected, onToggleSelect }) {
  const [expanded, setExpanded] = useState(false);
  const chainId = record.mapped_data?.chain_id || record.raw_data?.chain_id || "—";
  const ts = record.committed_at || record.updated_date;
  const isFailed = record.record_status === "Failed";

  return (
    <div style={{ borderBottom: "1px solid #f1f5f9", background: selected ? "#fef2f2" : undefined }}>
      <div
        onClick={() => !selectable && setExpanded(o => !o)}
        style={{ display: "grid", gridTemplateColumns: selectable ? "36px 24px 1fr 80px 80px 1fr 100px 120px" : "24px 1fr 80px 80px 1fr 100px 120px", gap: 10, alignItems: "center", padding: "10px 16px", cursor: "pointer", background: expanded ? "#f8fafc" : undefined }}>

        {/* Checkbox for failed rows */}
        {selectable && (
          <input type="checkbox" checked={selected} onChange={e => { e.stopPropagation(); onToggleSelect(record.id); }}
            onClick={e => e.stopPropagation()}
            style={{ width: 15, height: 15, cursor: "pointer", accentColor: "#dc2626" }} />
        )}

        <span onClick={() => setExpanded(o => !o)} style={{ fontSize: 11, color: "#94a3b8", fontWeight: 700 }}>{expanded ? "▾" : "▸"}</span>
        <span style={{ fontFamily: "monospace", fontSize: 12, fontWeight: 700, color: "#0C2340" }}>{chainId}</span>
        <span style={{ fontSize: 11, color: "#64748b" }}>Row {record.row_index ?? index}</span>
        <span style={S.pill(record.record_status)}>{record.record_status}</span>
        <span style={{ fontSize: 11, color: record.conflict_detail ? "#dc2626" : "#94a3b8", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={record.conflict_detail || ""}>
          {record.conflict_detail || <em style={{ color: "#cbd5e1" }}>—</em>}
        </span>
        <span style={{ fontFamily: "monospace", fontSize: 10, color: "#64748b" }}>
          {record.production_record_id ? record.production_record_id.slice(0, 10) + "…" : "—"}
        </span>
        <span style={{ fontSize: 10, color: "#94a3b8" }}>
          {ts ? new Date(ts).toLocaleString() : "—"}
        </span>
      </div>

      {expanded && (
        <div style={{ background: "#f8fafc", padding: "12px 20px 16px", borderTop: "1px solid #e2e8f0" }}>
          {record.conflict_detail && (
            <div style={{ background: "#fef2f2", border: "1px solid #fca5a5", borderRadius: 7, padding: "8px 12px", marginBottom: 10, fontSize: 11, color: "#991b1b", ...S.mono }}>
              ⚠ {record.conflict_detail}
            </div>
          )}
          {record.production_record_id && (
            <div style={{ fontSize: 11, color: "#64748b", marginBottom: 8 }}>
              <strong>Production Record ID:</strong> <span style={S.mono}>{record.production_record_id}</span>
            </div>
          )}
          <JsonBlock label="mapped_data" data={record.mapped_data} defaultOpen />
          <JsonBlock label="raw source row" data={record.raw_data} />
          <JsonBlock label="diff / validation errors" data={record.diff_summary} />
          {(isFailed || record.record_status === "Conflict" || record.record_status === "Invalid") && (
            <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
              <button onClick={e => { e.stopPropagation(); onRetry(record); }}
                style={{ padding: "5px 14px", borderRadius: 6, border: "1px solid #86efac", background: "#f0fdf4", color: "#166534", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>
                ↺ Retry Record
              </button>
              <button onClick={e => { e.stopPropagation(); onEditRetry(record); }}
                style={{ padding: "5px 14px", borderRadius: 6, border: "1px solid #93c5fd", background: "#eff6ff", color: "#1d4ed8", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>
                ✏ Edit & Retry
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Edit & Retry Modal ────────────────────────────────────────────────────────
function EditRetryModal({ record, entityTarget, onClose, onSaved }) {
  const [editedData, setEditedData] = useState(JSON.stringify(record.mapped_data || {}, null, 2));
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState(null);

  async function handleSave() {
    setErr(null);
    let parsed;
    try { parsed = JSON.parse(editedData); } catch { setErr("Invalid JSON"); return; }
    setSaving(true);
    try {
      await base44.entities[entityTarget].create(parsed);
      await base44.entities.Staging_Records.update(record.id, {
        record_status: "Committed",
        committed_at: new Date().toISOString(),
        conflict_detail: "Manually edited and retried by admin.",
        mapped_data: parsed,
      });
      onSaved();
      onClose();
    } catch (e) {
      setErr(e.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ background: "#fff", borderRadius: 12, width: "100%", maxWidth: 640, maxHeight: "85vh", overflowY: "auto", padding: 24 }}>
        <div style={{ fontSize: 15, fontWeight: 900, color: "#0C2340", marginBottom: 4 }}>Edit & Retry</div>
        <div style={{ fontSize: 11, color: "#64748b", marginBottom: 14 }}>
          Chain: <strong>{record.mapped_data?.chain_id || "—"}</strong> · Row {record.row_index}
        </div>
        <textarea value={editedData} onChange={e => setEditedData(e.target.value)}
          style={{ width: "100%", height: 320, fontFamily: "monospace", fontSize: 11, padding: 12, border: "1px solid #e2e8f0", borderRadius: 8, resize: "vertical", boxSizing: "border-box", color: "#1e293b" }} />
        {err && <div style={{ color: "#dc2626", fontSize: 11, fontWeight: 700, marginTop: 6 }}>⚠ {err}</div>}
        <div style={{ display: "flex", gap: 10, marginTop: 14, justifyContent: "flex-end" }}>
          <button onClick={onClose} style={{ padding: "7px 16px", borderRadius: 7, border: "1px solid #e2e8f0", background: "#f8fafc", color: "#475569", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>Cancel</button>
          <button onClick={handleSave} disabled={saving} style={{ padding: "7px 18px", borderRadius: 7, border: "none", background: "#0C2340", color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
            {saving ? "Saving…" : "Commit Edit"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Session Status Pill ───────────────────────────────────────────────────────
function SessionStatusPill({ status }) {
  const color = SESSION_STATUS_COLORS[status] || "#94a3b8";
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, background: `${color}18`, color, border: `1px solid ${color}55`, borderRadius: 99, padding: "3px 12px", fontSize: 12, fontWeight: 700 }}>
      <span style={{ width: 7, height: 7, borderRadius: "50%", background: color, display: "inline-block" }} />
      {status}
    </span>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function ICSessionDetailView({ session: initialSession, onBack }) {
  const [session, setSession] = useState(initialSession);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("All");
  const [editingRecord, setEditingRecord] = useState(null);
  const [actionMsg, setActionMsg] = useState(null);
  const [mode, setMode] = useState("debug");
  const [committing, setCommitting] = useState(false);
  const [retryProgress, setRetryProgress] = useState(null);
  const [selectedFailedIds, setSelectedFailedIds] = useState(new Set());
  const [stalled, setStalled] = useState(false);
  const [stalledInfo, setStalledInfo] = useState(null);
  const pollRef = useRef(null);
  const lastProgressRef = useRef({ rows_staged: null, at: Date.now() });

  const entityTarget = session.entity_targets?.[0] || "Normalized_Chains";
  const sessionKey = session.session_id || session.id;
  const isResumable = RESUMABLE_STATUSES.includes(session.import_status);
  const busy = committing || !!retryProgress;
  const isLive = LIVE_POLL_STATUSES.includes(session.import_status);

  const loadRecords = useCallback(async () => {
    setLoading(true);
    try {
      const data = await base44.entities.Staging_Records.filter({ session_id: sessionKey }, "-created_date", 2000);
      setRecords(data || []);
    } catch {
      setRecords([]);
    } finally {
      setLoading(false);
    }
  }, [sessionKey]);

  const reloadSession = useCallback(async () => {
    try {
      const sessions = await base44.entities.Import_Sessions.filter({ session_id: sessionKey });
      if (sessions?.[0]) setSession(sessions[0]);
    } catch {}
  }, [sessionKey]);

  useEffect(() => { loadRecords(); }, [loadRecords]);

  // Auto-poll while server job is actively running (Validating / Committing)
  useEffect(() => {
    if (!isLive) {
      clearInterval(pollRef.current);
      setStalled(false);
      return;
    }
    // Reset stall tracking when we start polling
    lastProgressRef.current = { rows_staged: null, at: Date.now() };
    setStalled(false);

    pollRef.current = setInterval(async () => {
      try {
        const updated = await base44.entities.Import_Sessions.filter({ session_id: sessionKey });
        if (updated?.[0]) {
          const sess = updated[0];
          setSession(sess);

          if (!LIVE_POLL_STATUSES.includes(sess.import_status)) {
            clearInterval(pollRef.current);
            setStalled(false);
            loadRecords();
            return;
          }

          // Stall detection: check if rows_staged has changed since last poll
          const currentStaged = sess.rows_staged || 0;
          const heartbeatAt = sess.validation_report?.heartbeat_at;

          if (lastProgressRef.current.rows_staged === null) {
            // First poll — establish baseline
            lastProgressRef.current = { rows_staged: currentStaged, at: Date.now() };
          } else if (currentStaged !== lastProgressRef.current.rows_staged) {
            // Progress detected — reset stall timer
            lastProgressRef.current = { rows_staged: currentStaged, at: Date.now() };
            setStalled(false);
          } else {
            // No progress — check how long
            const stalledMs = Date.now() - lastProgressRef.current.at;
            if (stalledMs > STALL_THRESHOLD_MS) {
              const lastRow = sess.validation_report?.last_processed_row || 0;
              const totalRows = sess.total_rows || 0;
              setStalled(true);
              setStalledInfo({
                lastRow,
                totalRows,
                stagedCount: currentStaged,
                stalledFor: Math.round(stalledMs / 60000),
                heartbeatAt,
              });
            }
          }
        }
      } catch {}
    }, 3500);
    return () => clearInterval(pollRef.current);
  }, [isLive, sessionKey]);

  const counts = {};
  records.forEach(r => { counts[r.record_status] = (counts[r.record_status] || 0) + 1; });

  const filtered = statusFilter === "All" ? records : records.filter(r => r.record_status === statusFilter);
  const failedRecords = records.filter(r => r.record_status === "Failed");
  const allFailedIds = failedRecords.map(r => r.id);

  function showMsg(text, isError = false) {
    setActionMsg({ text, isError });
    setTimeout(() => setActionMsg(null), 5000);
  }

  // ── Selection helpers ─────────────────────────────────────────────────────
  function toggleSelect(id) {
    setSelectedFailedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }
  function selectAllFailed() { setSelectedFailedIds(new Set(allFailedIds)); }
  function clearSelection() { setSelectedFailedIds(new Set()); }

  // ── Core bulk retry runner ────────────────────────────────────────────────
  async function runBulkRetry(targetRecords) {
    if (targetRecords.length === 0) return;

    // Reset each targeted record to "New" so runCommitLoop will process it
    // We do NOT reset already-committed records — the filter below guards that
    const toRetry = targetRecords.filter(r =>
      r.record_status === "Failed" // only Failed — never re-commit committed/skipped
    );
    if (toRetry.length === 0) { showMsg("No failed records to retry."); return; }

    let written = 0;
    let failed = 0;
    const total = toRetry.length;

    setRetryProgress({ msg: "Preparing retry…", current: 0, total, written: 0, failed: 0 });

    // Temporarily mark records as New in staging so runCommitLoop can write them
    // Throttled to avoid rate-limiting the pre-reset writes
    for (const r of toRetry) {
      await withRetry(() => base44.entities.Staging_Records.update(r.id, { record_status: "New", commit_decision: "Include", conflict_detail: "" }));
      await delay(200);
    }

    // Refresh local records array with updated statuses before commit loop
    const refreshed = toRetry.map(r => ({ ...r, record_status: "New", commit_decision: "Include" }));

    const { written: w, failed: f, commitLog } = await runCommitLoop({
      toCommit: refreshed,
      entityTarget,
      chunkSize: CHUNK_SIZE,
      existingLog: session.commit_log || [],
      base44,
      onProgress: (msg) => {
        // Parse written/failed from the message "Chunk X/Y · N written · N failed"
        const wMatch = msg.match(/(\d+) written/);
        const fMatch = msg.match(/(\d+) failed/);
        const cMatch = msg.match(/Chunk (\d+)\/(\d+)/);
        const current = cMatch ? Math.min(parseInt(cMatch[1]) * CHUNK_SIZE, total) : written;
        setRetryProgress({
          msg,
          current,
          total,
          written: wMatch ? parseInt(wMatch[1]) : written,
          failed: fMatch ? parseInt(fMatch[1]) : failed,
        });
      },
    });

    written = w;
    failed = f;

    // Update session counters
    const totalWritten = (session.rows_written || 0) + written;
    const totalFailed = Math.max(0, (session.failed_rows || 0) - written); // reduce by newly committed
    await base44.entities.Import_Sessions.update(session.id, {
      rows_written: totalWritten,
      failed_rows: totalFailed + failed,
      import_status: totalFailed + failed === 0 ? "Committed" : "Partially Committed",
      rollback_available: totalWritten > 0,
      commit_log: commitLog,
    });

    setRetryProgress(null);
    clearSelection();
    showMsg(`↺ Retry complete — ${written} committed, ${failed} still failed.`, failed > 0);
    await reloadSession();
    await loadRecords();
  }

  // ── Bulk action handlers ──────────────────────────────────────────────────
  function handleRetryAll() { runBulkRetry(failedRecords); }

  function handleRetrySelected() {
    const selected = records.filter(r => selectedFailedIds.has(r.id) && r.record_status === "Failed");
    runBulkRetry(selected);
  }

  async function handleMarkSkipped() {
    const toSkip = records.filter(r => selectedFailedIds.has(r.id) && r.record_status === "Failed");
    for (const r of toSkip) {
      await base44.entities.Staging_Records.update(r.id, { record_status: "Skipped", commit_decision: "Skip" });
    }
    clearSelection();
    showMsg(`✗ Marked ${toSkip.length} record(s) as Skipped.`);
    loadRecords();
  }

  function handleExportFailed() {
    const rows = failedRecords.map(r => ({
      chain_id: r.mapped_data?.chain_id || r.raw_data?.chain_id || "",
      row_index: r.row_index ?? "",
      record_status: r.record_status,
      conflict_detail: r.conflict_detail || "",
      mapped_data_json: JSON.stringify(r.mapped_data || {}),
      raw_data_json: JSON.stringify(r.raw_data || {}),
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "FailedRecords");
    XLSX.writeFile(wb, `${sessionKey}_failed_records.xlsx`);
  }

  // ── Single record retry ───────────────────────────────────────────────────
  async function handleRetry(record) {
    try {
      await withRetry(() => base44.entities[entityTarget].create(record.mapped_data));
      await base44.entities.Staging_Records.update(record.id, {
        record_status: "Committed",
        committed_at: new Date().toISOString(),
        conflict_detail: "Retried by admin.",
      });
      showMsg("✓ Record committed successfully.");
      loadRecords();
    } catch (e) {
      showMsg("⚠ Retry failed: " + e.message, true);
    }
  }

  // ── Per-record decision (resume mode) ─────────────────────────────────────
  async function handleDecision(recordId, decision) {
    setRecords(prev => prev.map(r => r.id === recordId ? { ...r, commit_decision: decision } : r));
    await base44.entities.Staging_Records.update(recordId, { commit_decision: decision });
  }

  async function handleBulkDecision(status, decision) {
    const toUpdate = records.filter(r => r.record_status === status);
    setRecords(prev => prev.map(r => r.record_status === status ? { ...r, commit_decision: decision } : r));
    for (const r of toUpdate) {
      await base44.entities.Staging_Records.update(r.id, { commit_decision: decision });
    }
  }

  // ── Resume commit — dispatches server-side background job ────────────────
  async function handleCommit() {
    setCommitting(true);
    try {
      await base44.entities.Import_Sessions.update(session.id, { import_status: "Committing" });
      // Fire the background job — UI will poll via the isLive effect
      importCommitJob({ sessionDbId: session.id, entityTarget }).catch(() => {});
      setSession(prev => ({ ...prev, import_status: "Committing" }));
      showMsg("⚙ Commit dispatched — server is processing. This page will update automatically.");
      setMode("debug");
    } catch (e) {
      showMsg("⚠ Failed to dispatch commit: " + e.message, true);
    } finally {
      setCommitting(false);
    }
  }

  // ── Stall recovery ───────────────────────────────────────────────────────
  async function handleResumeStalled() {
    // Resume from last known row, using the original rows from session notes
    // The workflow component must re-send the rows; here we just unblock the session
    // and reload so the admin can re-dispatch from ICSessionWorkflow if needed.
    try {
      await base44.entities.Import_Sessions.update(session.id, {
        import_status: "Staged",
      });
      setSession(prev => ({ ...prev, import_status: "Staged" }));
      setStalled(false);
      showMsg("Session unblocked — use 'Resume & Commit' to continue from where it stopped.");
      await reloadSession();
      await loadRecords();
    } catch (e) {
      showMsg("⚠ Failed to unblock session: " + e.message, true);
    }
  }

  async function handleCancelJob() {
    if (!confirm("Cancel this job? The session will be marked Failed. Already-staged records are preserved.")) return;
    try {
      await base44.entities.Import_Sessions.update(session.id, {
        import_status: "Failed",
        validation_report: {
          ...(session.validation_report || {}),
          cancelled_at: new Date().toISOString(),
          cancel_reason: "Manually cancelled by admin after stall detection.",
        },
      });
      setSession(prev => ({ ...prev, import_status: "Failed" }));
      setStalled(false);
      showMsg("Job cancelled. Session marked Failed.");
    } catch (e) {
      showMsg("⚠ " + e.message, true);
    }
  }

  async function handleRetryUnprocessed() {
    // Count how many rows were never staged at all
    const totalRows = session.total_rows || 0;
    const stagedCount = session.rows_staged || 0;
    const missing = totalRows - stagedCount;
    if (missing <= 0) {
      showMsg("All rows are already staged. Use 'Resume & Commit' to proceed.");
      return;
    }
    // Mark session as Staged so it can be retried via the workflow
    try {
      await base44.entities.Import_Sessions.update(session.id, {
        import_status: "Staged",
        validation_report: {
          ...(session.validation_report || {}),
          stall_recovery_note: `Recovered after stall at row ${session.validation_report?.last_processed_row || 0}/${totalRows}. ${missing} rows need re-processing.`,
        },
      });
      setSession(prev => ({ ...prev, import_status: "Staged" }));
      setStalled(false);
      showMsg(`Session unblocked — ${missing} unprocessed rows need re-staging. You can re-upload the original file to retry only missing rows.`);
      await reloadSession();
    } catch (e) {
      showMsg("⚠ " + e.message, true);
    }
  }

  // ── Export ────────────────────────────────────────────────────────────────
  function handleExport(format) {
    const rows = filtered.map(r => ({
      chain_id: r.mapped_data?.chain_id || r.raw_data?.chain_id || "",
      row_index: r.row_index ?? "",
      record_status: r.record_status,
      conflict_detail: r.conflict_detail || "",
      production_record_id: r.production_record_id || "",
      commit_decision: r.commit_decision || "",
      committed_at: r.committed_at || "",
      mapped_data_json: JSON.stringify(r.mapped_data || {}),
      raw_data_json: JSON.stringify(r.raw_data || {}),
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Records");
    const filename = `${sessionKey}_${statusFilter.toLowerCase()}_records.${format}`;
    XLSX.writeFile(wb, filename, format === "csv" ? { bookType: "csv" } : {});
  }

  // ── Render ────────────────────────────────────────────────────────────────
  const showFailedTools = mode === "debug" && failedRecords.length > 0;
  // Show checkboxes only when on Failed filter or there's a selection active
  const checkboxMode = showFailedTools && (statusFilter === "Failed" || selectedFailedIds.size > 0);

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
        <button onClick={onBack} style={css.backBtn}>← All Sessions</button>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <div style={{ fontSize: 18, fontWeight: 900, color: "#0C2340" }}>{sessionKey}</div>
            <SessionStatusPill status={session.import_status} />
          </div>
          <div style={{ fontSize: 11, color: "#64748b", marginTop: 4 }}>
            {session.manufacturer} · {session.source_catalog} · Target: <strong>{entityTarget}</strong>
            {session.uploaded_at && <> · Uploaded {new Date(session.uploaded_at).toLocaleString()}</>}
          </div>
        </div>
        {actionMsg && (
          <div style={{ padding: "7px 14px", borderRadius: 8, fontSize: 11, fontWeight: 700, background: actionMsg.isError ? "#fef2f2" : "#f0fdf4", color: actionMsg.isError ? "#dc2626" : "#166534", border: `1px solid ${actionMsg.isError ? "#fca5a5" : "#86efac"}` }}>
            {actionMsg.text}
          </div>
        )}
      </div>

      {/* Primary action bar — shown for all actionable statuses */}
      {isResumable && (
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 20, padding: "14px 18px", background: session.import_status === "Staged" ? "#eff6ff" : "#fffbeb", border: `1px solid ${session.import_status === "Staged" ? "#93c5fd" : "#fde68a"}`, borderRadius: 10 }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: session.import_status === "Staged" ? "#1d4ed8" : "#92400e", alignSelf: "center" }}>
            {session.import_status === "Staged" && "📦 Staged records ready to commit"}
            {session.import_status === "Committing" && "⚡ Commit in progress — can be continued"}
            {session.import_status === "Pending Review" && "⚡ This session can be resumed"}
            {session.import_status === "Partially Committed" && "⚠ Partially committed — continue or retry"}
            {session.import_status === "Failed" && "⚠ This session has failed records"}
          </span>
          <button
            onClick={() => { setMode("resume"); setStatusFilter("All"); }}
            disabled={mode === "resume" || busy}
            style={{ ...aBtn("#0C2340", "#fff"), opacity: mode === "resume" ? 0.5 : 1 }}>
            {mode === "resume"
              ? "✓ In Commit Mode"
              : session.import_status === "Staged"
                ? "▶ Commit Staged Records"
                : session.import_status === "Committing"
                  ? "▶ Continue Commit"
                  : "▶ Resume Review & Commit"}
          </button>
          <button onClick={() => handleExport("xlsx")} disabled={busy} style={aBtn("#1d4ed8", "#fff")}>↓ Export XLSX</button>
          <button onClick={() => handleExport("csv")} disabled={busy} style={aBtn("#065f46", "#fff")}>↓ Export CSV</button>
        </div>
      )}

      {/* Bulk Retry Toolbar */}
      {showFailedTools && (
        <BulkRetryToolbar
          failedCount={failedRecords.length}
          selectedIds={selectedFailedIds}
          allFailedIds={allFailedIds}
          onSelectAll={selectAllFailed}
          onClearAll={clearSelection}
          onRetryAll={handleRetryAll}
          onRetrySelected={handleRetrySelected}
          onMarkSkipped={handleMarkSkipped}
          onExportFailed={handleExportFailed}
          busy={busy}
        />
      )}

      {/* Retry progress panel */}
      <RetryProgressPanel progress={retryProgress} />

      {/* Stalled job banner */}
      {isLive && stalled && stalledInfo && (
        <div style={{ background: "#fef3c7", border: "1px solid #fbbf24", borderRadius: 10, padding: "14px 18px", marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
            <span style={{ fontSize: 20 }}>⚠️</span>
            <div>
              <div style={{ fontSize: 13, fontWeight: 800, color: "#92400e" }}>
                Job Stalled — No progress for {stalledInfo.stalledFor}+ minute{stalledInfo.stalledFor !== 1 ? "s" : ""}
              </div>
              <div style={{ fontSize: 11, color: "#b45309", marginTop: 2 }}>
                Last processed row: <strong>{stalledInfo.lastRow}</strong> of <strong>{stalledInfo.totalRows}</strong> ·
                {" "}{stalledInfo.stagedCount} staged ·
                {" "}{stalledInfo.totalRows - stalledInfo.stagedCount} unprocessed
                {stalledInfo.heartbeatAt && <> · Last heartbeat: {new Date(stalledInfo.heartbeatAt).toLocaleTimeString()}</>}
              </div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button onClick={handleRetryUnprocessed} style={{ padding: "7px 14px", borderRadius: 7, border: "none", background: "#d97706", color: "#fff", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>
              ↺ Retry Unprocessed ({stalledInfo.totalRows - stalledInfo.stagedCount})
            </button>
            <button onClick={handleResumeStalled} style={{ padding: "7px 14px", borderRadius: 7, border: "none", background: "#0C2340", color: "#fff", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>
              ▶ Unblock &amp; Resume
            </button>
            <button onClick={handleCancelJob} style={{ padding: "7px 14px", borderRadius: 7, border: "1px solid #ef4444", background: "#fef2f2", color: "#dc2626", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>
              ✕ Cancel Job
            </button>
          </div>
        </div>
      )}

      {/* Live server-job banner — shown when staging or committing is running server-side */}
      {isLive && !stalled && (
        <div style={{ background: "#eff6ff", border: "1px solid #93c5fd", borderRadius: 8, padding: "12px 16px", marginBottom: 16, display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 14, height: 14, border: "2px solid #bfdbfe", borderTopColor: "#1d4ed8", borderRadius: "50%", animation: "spin 0.8s linear infinite", flexShrink: 0 }} />
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#1d4ed8" }}>
              Server job running — {session.import_status}
            </div>
            <div style={{ fontSize: 11, color: "#3b82f6", marginTop: 2 }}>
              {session.rows_staged > 0 && `${session.rows_staged.toLocaleString()} staged`}
              {session.total_rows > 0 && ` of ${session.total_rows.toLocaleString()} total`}
              {session.validation_report?.last_processed_row > 0 && ` · last row: ${session.validation_report.last_processed_row}`}
              {" "}· Updates every 3-4s. Safe to navigate away.
            </div>
          </div>
        </div>
      )}

      {/* Stats row */}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 20 }}>
        {[
          { label: "Detected",   value: session.total_rows || 0,                           color: "#0C2340" },
          { label: "Staged",     value: session.rows_staged || records.length,              color: "#8b5cf6" },
          { label: "Written",    value: session.rows_written || 0,                          color: "#22c55e" },
          { label: "Failed",     value: session.failed_rows || 0,                           color: "#ef4444" },
          { label: "Skipped",    value: session.duplicates_skipped || 0,                    color: "#94a3b8" },
          { label: "New",        value: session.validation_report?.New || counts.New || 0,  color: "#16a34a" },
          { label: "Duplicate",  value: session.validation_report?.Duplicate || counts.Duplicate || 0, color: "#ca8a04" },
          { label: "Flags",      value: session.flags_generated || 0,                       color: "#f59e0b" },
        ].map(s => (
          <div key={s.label} style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, padding: "10px 14px", minWidth: 80, flex: 1, textAlign: "center" }}>
            <div style={{ fontSize: 20, fontWeight: 900, color: s.color }}>{(s.value || 0).toLocaleString()}</div>
            <div style={{ fontSize: 9, color: "#64748b", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5, marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Mode toggle */}
      <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
        <button onClick={() => setMode("debug")} style={{ ...css.modeBtn, ...(mode === "debug" ? css.modeBtnActive : {}) }}>
          🔍 Debug View
        </button>
        {isResumable && (
          <button onClick={() => setMode("resume")} style={{ ...css.modeBtn, ...(mode === "resume" ? css.modeBtnActive : {}) }}>
            {session.import_status === "Staged" ? "▶ Commit Staged Records" : "▶ Resume & Commit"}
          </button>
        )}
      </div>

      {/* RESUME MODE */}
      {mode === "resume" && (
        <div>
          {loading ? (
            <div style={{ textAlign: "center", padding: "48px", color: "#64748b" }}>Loading staged records…</div>
          ) : (
            <ICDiffViewer
              records={records.filter(r => r.record_status !== "Committed" && r.record_status !== "Skipped")}
              onDecision={handleDecision}
              onBulkDecision={handleBulkDecision}
              onCommit={handleCommit}
              committing={committing}
            />
          )}
        </div>
      )}

      {/* DEBUG MODE */}
      {mode === "debug" && (
        <>
          {/* Filter bar */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10, marginBottom: 14 }}>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {STATUS_FILTERS.map(f => {
                const active = statusFilter === f;
                const cnt = f === "All" ? records.length : (counts[f] || 0);
                if (f !== "All" && cnt === 0) return null;
                return (
                  <button key={f} onClick={() => setStatusFilter(f)}
                    style={{ padding: "5px 12px", borderRadius: 99, border: `1px solid ${active ? "#0C2340" : "#e2e8f0"}`, background: active ? "#0C2340" : "#fff", color: active ? "#fff" : "#64748b", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>
                    {f} <span style={{ opacity: 0.7 }}>({cnt})</span>
                  </button>
                );
              })}
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => handleExport("xlsx")} style={{ padding: "5px 14px", borderRadius: 7, border: "1px solid #c7d2fe", background: "#eef2ff", color: "#4338ca", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>↓ XLSX</button>
              <button onClick={() => handleExport("csv")}  style={{ padding: "5px 14px", borderRadius: 7, border: "1px solid #a7f3d0", background: "#ecfdf5", color: "#065f46", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>↓ CSV</button>
            </div>
          </div>

          {/* Checkbox hint when failed rows exist but filter isn't set */}
          {showFailedTools && statusFilter !== "Failed" && (
            <div style={{ fontSize: 11, color: "#92400e", background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 7, padding: "6px 14px", marginBottom: 10 }}>
              💡 Switch to <strong>Failed</strong> filter to use checkboxes for bulk retry.
            </div>
          )}

          {/* Records table */}
          <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0", overflow: "hidden" }}>
            <div style={{ display: "grid", gridTemplateColumns: checkboxMode ? "36px 24px 1fr 80px 80px 1fr 100px 120px" : "24px 1fr 80px 80px 1fr 100px 120px", gap: 10, padding: "8px 16px", background: "#f8fafc", borderBottom: "1px solid #e2e8f0", fontSize: 10, fontWeight: 800, color: "#64748b", textTransform: "uppercase", letterSpacing: 0.5 }}>
              {checkboxMode && <span />}
              <span /><span>Chain ID</span><span>Row #</span><span>Status</span><span>Conflict Detail</span><span>Prod Record</span><span>Timestamp</span>
            </div>

            {loading ? (
              <div style={{ padding: "48px 20px", textAlign: "center", color: "#64748b", fontSize: 13 }}>Loading records…</div>
            ) : filtered.length === 0 ? (
              <div style={{ padding: "48px 20px", textAlign: "center", color: "#94a3b8", fontSize: 13 }}>No records match this filter.</div>
            ) : (
              filtered.map((r, i) => (
                <RecordRow
                  key={r.id}
                  record={r}
                  index={i}
                  onRetry={handleRetry}
                  onEditRetry={setEditingRecord}
                  selectable={checkboxMode && r.record_status === "Failed"}
                  selected={selectedFailedIds.has(r.id)}
                  onToggleSelect={toggleSelect}
                />
              ))
            )}
          </div>
        </>
      )}

      {/* Session notes */}
      {session.notes && (
        <div style={{ marginTop: 16, background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 8, padding: "10px 14px", fontSize: 11, color: "#64748b", fontFamily: "monospace" }}>
          {session.notes}
        </div>
      )}

      {/* Edit & Retry modal */}
      {editingRecord && (
        <EditRetryModal
          record={editingRecord}
          entityTarget={entityTarget}
          onClose={() => setEditingRecord(null)}
          onSaved={() => { loadRecords(); showMsg("✓ Record committed after edit."); }}
        />
      )}
    </div>
  );
}

// ── Style constants ───────────────────────────────────────────────────────────
const css = {
  backBtn: { background: "#f1f5f9", border: "1px solid #e2e8f0", color: "#334155", borderRadius: 7, padding: "6px 14px", cursor: "pointer", fontSize: 12, fontWeight: 600, display: "inline-block", whiteSpace: "nowrap" },
  modeBtn: { padding: "7px 18px", border: "1px solid #e2e8f0", borderRadius: 7, background: "#f8fafc", color: "#64748b", fontSize: 12, fontWeight: 700, cursor: "pointer" },
  modeBtnActive: { background: "#0C2340", color: "#fff", border: "1px solid #0C2340" },
};

function aBtn(bg, color) {
  return { background: bg, color, border: "none", borderRadius: 7, padding: "7px 14px", fontSize: 11, fontWeight: 700, cursor: "pointer" };
}