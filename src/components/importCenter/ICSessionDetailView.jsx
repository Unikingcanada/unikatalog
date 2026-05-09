/**
 * ICSessionDetailView — Full session view with resume/retry/commit capabilities.
 * Supports: Pending Review, Partially Committed, Failed, Committed sessions.
 */
import { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { STATUS_COLORS, SESSION_STATUS_COLORS, chunkArray, CHUNK_SIZE, generateAutoFlags } from "@/lib/importCenterEngine";
import ICDiffViewer from "./ICDiffViewer";
import * as XLSX from "xlsx";

const STATUS_FILTERS = ["All", "Failed", "Conflict", "Duplicate", "Committed", "Skipped", "Invalid", "New", "Changed", "Pending"];

// Statuses where the diff viewer + commit is shown
const RESUMABLE_STATUSES = ["Pending Review", "Partially Committed", "Failed"];

// ── Styles ────────────────────────────────────────────────────────────────────
const S = {
  pill: (status) => {
    const c = STATUS_COLORS[status] || STATUS_COLORS.Pending;
    return {
      display: "inline-block", padding: "2px 9px", borderRadius: 99,
      background: c.bg, border: `1px solid ${c.border}`, color: c.text,
      fontSize: 10, fontWeight: 800, whiteSpace: "nowrap",
    };
  },
  mono: { fontFamily: "monospace", fontSize: 11, whiteSpace: "pre-wrap", wordBreak: "break-all" },
};

// ── JSON Expandable Block ─────────────────────────────────────────────────────
function JsonBlock({ label, data, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  if (!data || (typeof data === "object" && Object.keys(data).length === 0)) return null;
  return (
    <div style={{ marginTop: 6 }}>
      <button
        onClick={() => setOpen(o => !o)}
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

// ── Single Record Row (debug view) ────────────────────────────────────────────
function RecordRow({ record, onRetry, onEditRetry, index }) {
  const [expanded, setExpanded] = useState(false);
  const chainId = record.mapped_data?.chain_id || record.raw_data?.chain_id || "—";
  const ts = record.committed_at || record.updated_date;

  return (
    <div style={{ borderBottom: "1px solid #f1f5f9" }}>
      <div
        onClick={() => setExpanded(o => !o)}
        style={{ display: "grid", gridTemplateColumns: "24px 1fr 80px 80px 1fr 100px 120px", gap: 12, alignItems: "center", padding: "10px 16px", cursor: "pointer", background: expanded ? "#f8fafc" : "#fff" }}>
        <span style={{ fontSize: 11, color: "#94a3b8", fontWeight: 700 }}>{expanded ? "▾" : "▸"}</span>
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
              <strong>Production Record ID:</strong>{" "}
              <span style={S.mono}>{record.production_record_id}</span>
            </div>
          )}
          <JsonBlock label="mapped_data" data={record.mapped_data} defaultOpen={true} />
          <JsonBlock label="raw source row" data={record.raw_data} />
          <JsonBlock label="diff / validation errors" data={record.diff_summary} />
          {(record.record_status === "Failed" || record.record_status === "Conflict" || record.record_status === "Invalid") && (
            <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
              <button
                onClick={(e) => { e.stopPropagation(); onRetry(record); }}
                style={{ padding: "5px 14px", borderRadius: 6, border: "1px solid #86efac", background: "#f0fdf4", color: "#166534", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>
                ↺ Retry Record
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onEditRetry(record); }}
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
        <textarea
          value={editedData}
          onChange={e => setEditedData(e.target.value)}
          style={{ width: "100%", height: 320, fontFamily: "monospace", fontSize: 11, padding: 12, border: "1px solid #e2e8f0", borderRadius: 8, resize: "vertical", boxSizing: "border-box", color: "#1e293b" }}
        />
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
  const [mode, setMode] = useState("debug"); // "debug" | "resume"
  const [committing, setCommitting] = useState(false);
  const [progress, setProgress] = useState(null);

  const entityTarget = session.entity_targets?.[0] || "Normalized_Chains";
  const sessionKey = session.session_id || session.id;
  const isResumable = RESUMABLE_STATUSES.includes(session.import_status);

  const loadRecords = useCallback(async () => {
    setLoading(true);
    try {
      const data = await base44.entities.Staging_Records.filter(
        { session_id: sessionKey }, "-created_date", 2000
      );
      setRecords(data || []);
    } catch {
      setRecords([]);
    } finally {
      setLoading(false);
    }
  }, [sessionKey]);

  // Reload session to get latest status
  const reloadSession = useCallback(async () => {
    try {
      const sessions = await base44.entities.Import_Sessions.filter({ session_id: sessionKey });
      if (sessions?.[0]) setSession(sessions[0]);
    } catch {}
  }, [sessionKey]);

  useEffect(() => { loadRecords(); }, [loadRecords]);

  // Status counts
  const counts = {};
  records.forEach(r => { counts[r.record_status] = (counts[r.record_status] || 0) + 1; });

  const filtered = statusFilter === "All"
    ? records
    : records.filter(r => r.record_status === statusFilter);

  // Retry single record
  async function handleRetry(record) {
    try {
      await base44.entities[entityTarget].create(record.mapped_data);
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

  function showMsg(text, isError = false) {
    setActionMsg({ text, isError });
    setTimeout(() => setActionMsg(null), 4000);
  }

  // ── Per-record decision (for resume mode) ─────────────────────────────────
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

  // ── Resume commit ─────────────────────────────────────────────────────────
  async function handleCommit() {
    setCommitting(true);
    setProgress("Starting commit…");

    await base44.entities.Import_Sessions.update(session.id, { import_status: "Committing" });

    // Commit: Include decisions + non-committed New records
    const toCommit = records.filter(r =>
      (r.commit_decision === "Include" || (r.record_status === "New" && r.commit_decision !== "Skip")) &&
      r.record_status !== "Committed"
    );

    const chunks = chunkArray(toCommit, CHUNK_SIZE);
    let written = 0;
    let failed = 0;
    let flagsGenerated = 0;
    const commitLog = [...(session.commit_log || [])];

    for (let ci = 0; ci < chunks.length; ci++) {
      const chunk = chunks[ci];
      setProgress(`Committing chunk ${ci + 1}/${chunks.length} (${written}/${toCommit.length})…`);
      const newIds = [];
      const updatedIds = [];

      for (const record of chunk) {
        try {
          if (record.record_status === "New") {
            const result = await base44.entities[entityTarget].create(record.mapped_data);
            if (result?.id) newIds.push(result.id);
          } else if (record.record_status === "Changed" || record.record_status === "Conflict") {
            if (record.production_record_id) {
              await base44.entities[entityTarget].update(record.production_record_id, record.mapped_data);
              updatedIds.push(record.production_record_id);
            }
          }
          const flags = generateAutoFlags(record.mapped_data, record.record_status, record.conflict_detail, entityTarget);
          for (const flag of flags) {
            await base44.entities.Chain_Review_Flags.create(flag);
            flagsGenerated++;
          }
          await base44.entities.Staging_Records.update(record.id, {
            record_status: "Committed",
            committed_at: new Date().toISOString(),
          });
          written++;
        } catch (e) {
          await base44.entities.Staging_Records.update(record.id, {
            record_status: "Failed",
            conflict_detail: `Commit error: ${e.message}`,
          });
          failed++;
        }
      }

      commitLog.push({ chunk: ci + 1, entity: entityTarget, newIds, updatedIds, timestamp: new Date().toISOString() });
    }

    const totalWritten = (session.rows_written || 0) + written;
    const totalFailed = (session.failed_rows || 0) + failed;
    const newStatus = totalFailed === 0 ? "Committed" : "Partially Committed";

    await base44.entities.Import_Sessions.update(session.id, {
      import_status: newStatus,
      rows_written: totalWritten,
      failed_rows: totalFailed,
      flags_generated: (session.flags_generated || 0) + flagsGenerated,
      rollback_available: totalWritten > 0,
      commit_log: commitLog,
    });

    setProgress(null);
    setCommitting(false);
    showMsg(`✓ Committed ${written} records. ${failed > 0 ? `${failed} failed.` : ""}`);
    await reloadSession();
    await loadRecords();
    setMode("debug");
  }

  // ── Retry all failed ──────────────────────────────────────────────────────
  async function handleRetryAllFailed() {
    const failed = records.filter(r => r.record_status === "Failed");
    if (failed.length === 0) return;
    // Mark all failed as "Include" then switch to resume mode
    for (const r of failed) {
      await base44.entities.Staging_Records.update(r.id, { commit_decision: "Include", record_status: "New" });
    }
    await loadRecords();
    setMode("resume");
    showMsg(`↺ ${failed.length} failed records reset to New — review and commit.`);
  }

  // Export to XLSX/CSV
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

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
        <button onClick={onBack} style={backBtn}>← All Sessions</button>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <div style={{ fontSize: 18, fontWeight: 900, color: "#0C2340" }}>
              {sessionKey}
            </div>
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

      {/* Action bar for resumable sessions */}
      {isResumable && (
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 20, padding: "14px 18px", background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 10 }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: "#92400e", alignSelf: "center" }}>
            ⚡ This session can be resumed
          </span>
          <button
            onClick={() => { setMode("resume"); setStatusFilter("All"); }}
            disabled={mode === "resume"}
            style={{ ...actionBtn("#0C2340", "#fff"), opacity: mode === "resume" ? 0.5 : 1 }}>
            {mode === "resume" ? "✓ In Resume Mode" : "▶ Resume Review & Commit"}
          </button>
          {counts["Failed"] > 0 && (
            <button onClick={handleRetryAllFailed} style={actionBtn("#7c3aed", "#fff")}>
              ↺ Retry All Failed ({counts["Failed"]})
            </button>
          )}
          <button onClick={() => handleExport("xlsx")} style={actionBtn("#1d4ed8", "#fff")}>↓ Export XLSX</button>
          <button onClick={() => handleExport("csv")} style={actionBtn("#065f46", "#fff")}>↓ Export CSV</button>
        </div>
      )}

      {/* Progress bar during commit */}
      {progress && (
        <div style={{ background: "#eff6ff", border: "1px solid #93c5fd", borderRadius: 8, padding: "10px 16px", marginBottom: 16, color: "#1d4ed8", fontSize: 12, fontWeight: 600 }}>
          ⏳ {progress}
        </div>
      )}

      {/* Stats row */}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 20 }}>
        {[
          { label: "Total Rows",      value: session.total_rows || 0,          color: "#0C2340" },
          { label: "Written",         value: session.rows_written || 0,        color: "#22c55e" },
          { label: "Failed",          value: session.failed_rows || 0,         color: "#ef4444" },
          { label: "Skipped",         value: session.duplicates_skipped || 0,  color: "#94a3b8" },
          { label: "Staged",          value: records.length,                   color: "#3b82f6" },
          { label: "Flags",           value: session.flags_generated || 0,     color: "#f59e0b" },
        ].map(s => (
          <div key={s.label} style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, padding: "12px 18px", minWidth: 90, flex: 1, textAlign: "center" }}>
            <div style={{ fontSize: 22, fontWeight: 900, color: s.color }}>{s.value.toLocaleString()}</div>
            <div style={{ fontSize: 10, color: "#64748b", fontWeight: 600, marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Mode toggle */}
      <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
        <button onClick={() => setMode("debug")} style={{ ...modeBtn, ...(mode === "debug" ? modeBtnActive : {}) }}>
          🔍 Debug View
        </button>
        {isResumable && (
          <button onClick={() => setMode("resume")} style={{ ...modeBtn, ...(mode === "resume" ? modeBtnActive : {}) }}>
            ▶ Resume & Commit
          </button>
        )}
      </div>

      {/* ── RESUME MODE: DiffViewer + commit ─────────────────────────────────── */}
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

      {/* ── DEBUG MODE: per-record inspection ────────────────────────────────── */}
      {mode === "debug" && (
        <>
          {/* Filter bar + export */}
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
              <button onClick={() => handleExport("xlsx")}
                style={{ padding: "5px 14px", borderRadius: 7, border: "1px solid #c7d2fe", background: "#eef2ff", color: "#4338ca", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>
                ↓ Export XLSX
              </button>
              <button onClick={() => handleExport("csv")}
                style={{ padding: "5px 14px", borderRadius: 7, border: "1px solid #a7f3d0", background: "#ecfdf5", color: "#065f46", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>
                ↓ Export CSV
              </button>
            </div>
          </div>

          {/* Records table */}
          <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0", overflow: "hidden" }}>
            <div style={{ display: "grid", gridTemplateColumns: "24px 1fr 80px 80px 1fr 100px 120px", gap: 12, padding: "8px 16px", background: "#f8fafc", borderBottom: "1px solid #e2e8f0", fontSize: 10, fontWeight: 800, color: "#64748b", textTransform: "uppercase", letterSpacing: 0.5 }}>
              <span /><span>Chain ID</span><span>Row #</span><span>Status</span><span>Conflict Detail</span><span>Prod Record</span><span>Timestamp</span>
            </div>

            {loading ? (
              <div style={{ padding: "48px 20px", textAlign: "center", color: "#64748b", fontSize: 13 }}>Loading records…</div>
            ) : filtered.length === 0 ? (
              <div style={{ padding: "48px 20px", textAlign: "center", color: "#94a3b8", fontSize: 13 }}>No records match this filter.</div>
            ) : (
              filtered.map((r, i) => (
                <RecordRow key={r.id} record={r} index={i} onRetry={handleRetry} onEditRetry={setEditingRecord} />
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

const backBtn = { background: "#f1f5f9", border: "1px solid #e2e8f0", color: "#334155", borderRadius: 7, padding: "6px 14px", cursor: "pointer", fontSize: 12, fontWeight: 600, display: "inline-block", whiteSpace: "nowrap" };
const modeBtn = { padding: "7px 18px", border: "1px solid #e2e8f0", borderRadius: 7, background: "#f8fafc", color: "#64748b", fontSize: 12, fontWeight: 700, cursor: "pointer" };
const modeBtnActive = { background: "#0C2340", color: "#fff", border: "1px solid #0C2340" };
function actionBtn(bg, color) {
  return { background: bg, color, border: "none", borderRadius: 7, padding: "7px 14px", fontSize: 11, fontWeight: 700, cursor: "pointer" };
}