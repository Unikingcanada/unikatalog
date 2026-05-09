/**
 * ICSessionResumePage — Fully resumable import session workflow
 * Route: /admin/import-center/session/:id
 *
 * Loads session + staged records from DB, restores full review/commit state.
 * Supports: Resume Review, Continue Commit, Retry Failed, Export, Rollback.
 */
import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import {
  STATUS_COLORS, SESSION_STATUS_COLORS,
  generateAutoFlags, chunkArray, CHUNK_SIZE,
} from "@/lib/importCenterEngine";
import ICDiffViewer from "@/components/importCenter/ICDiffViewer";
import ICShell from "@/components/importCenter/ICShell";
import * as XLSX from "xlsx";

// ── Status pill ───────────────────────────────────────────────────────────────
function SessionStatusPill({ status }) {
  const color = SESSION_STATUS_COLORS[status] || "#94a3b8";
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      background: `${color}18`, color, border: `1px solid ${color}55`,
      borderRadius: 99, padding: "3px 12px", fontSize: 11, fontWeight: 700,
    }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: color, display: "inline-block" }} />
      {status}
    </span>
  );
}

// ── Record status pill ────────────────────────────────────────────────────────
function RecordPill({ status }) {
  const c = STATUS_COLORS[status] || STATUS_COLORS.Pending;
  return (
    <span style={{
      display: "inline-block", padding: "2px 9px", borderRadius: 99,
      background: c.bg, border: `1px solid ${c.border}`, color: c.text,
      fontSize: 10, fontWeight: 800, whiteSpace: "nowrap",
    }}>
      {status}
    </span>
  );
}

// ── JSON expandable ───────────────────────────────────────────────────────────
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
        <pre style={{ fontFamily: "monospace", fontSize: 11, whiteSpace: "pre-wrap", wordBreak: "break-all", background: "#0f172a", color: "#94a3b8", borderRadius: 7, padding: "10px 14px", marginTop: 6, maxHeight: 240, overflowY: "auto", border: "1px solid #1e293b" }}>
          {JSON.stringify(data, null, 2)}
        </pre>
      )}
    </div>
  );
}

// ── Edit & Retry modal ────────────────────────────────────────────────────────
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
          <button onClick={onClose} style={btnSecondary}>Cancel</button>
          <button onClick={handleSave} disabled={saving} style={btnPrimary}>
            {saving ? "Saving…" : "Commit Edit"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── View modes ────────────────────────────────────────────────────────────────
const VIEW_REVIEW = "review";   // ICDiffViewer — make include/skip decisions
const VIEW_DEBUG  = "debug";    // per-record debug table (committed/failed)

// ── Main page ─────────────────────────────────────────────────────────────────
export default function ICSessionResumePage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [session, setSession]     = useState(null);
  const [records, setRecords]     = useState([]);
  const [loading, setLoading]     = useState(true);
  const [view, setView]           = useState(VIEW_REVIEW);
  const [statusFilter, setStatusFilter] = useState("All");
  const [actionMsg, setActionMsg] = useState(null);
  const [committing, setCommitting] = useState(false);
  const [progress, setProgress]   = useState(null);
  const [editingRecord, setEditingRecord] = useState(null);

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      // Load session
      const sessions = await base44.entities.Import_Sessions.filter({ session_id: id });
      const sess = sessions?.[0];
      if (!sess) { setLoading(false); return; }
      setSession(sess);

      // Load all staging records for this session
      const data = await base44.entities.Staging_Records.filter(
        { session_id: id }, "-created_date", 5000
      );
      setRecords(data || []);
    } catch (e) {
      showMsg("Failed to load session: " + e.message, true);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { loadAll(); }, [loadAll]);

  function showMsg(text, isError = false) {
    setActionMsg({ text, isError });
    setTimeout(() => setActionMsg(null), 5000);
  }

  // ── Counts ────────────────────────────────────────────────────────────────
  const counts = {};
  records.forEach(r => { counts[r.record_status] = (counts[r.record_status] || 0) + 1; });

  const entityTarget = session?.entity_targets?.[0] || "Normalized_Chains";

  // ── Decision handlers (used by ICDiffViewer) ──────────────────────────────
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

  // ── Commit (or re-commit) ─────────────────────────────────────────────────
  async function handleCommit() {
    setCommitting(true);
    setProgress("Starting commit…");

    await base44.entities.Import_Sessions.update(session.id, { import_status: "Committing" });
    setSession(prev => ({ ...prev, import_status: "Committing" }));

    const toCommit = records.filter(r =>
      (r.commit_decision === "Include" || (r.record_status === "New" && r.commit_decision !== "Skip"))
      && r.record_status !== "Committed"
    );

    const chunks = chunkArray(toCommit, CHUNK_SIZE);
    let written = 0, failed = 0, flagsGenerated = 0;
    const commitLog = [];

    for (let ci = 0; ci < chunks.length; ci++) {
      const chunk = chunks[ci];
      setProgress(`Committing chunk ${ci + 1}/${chunks.length} (${written + (session.rows_written || 0)} written)…`);
      const newIds = [], updatedIds = [];

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

    const skipped = records.filter(r => r.record_status === "Duplicate" || r.commit_decision === "Skip").length;
    const prevWritten = session.rows_written || 0;
    const finalStatus = failed === 0 ? "Committed" : "Partially Committed";

    await base44.entities.Import_Sessions.update(session.id, {
      import_status: finalStatus,
      rows_written: prevWritten + written,
      failed_rows: failed,
      duplicates_skipped: skipped,
      flags_generated: (session.flags_generated || 0) + flagsGenerated,
      rollback_available: (prevWritten + written) > 0,
      commit_log: [...(session.commit_log || []), ...commitLog],
    });

    setProgress(null);
    setCommitting(false);
    showMsg(`✓ Committed ${written} records. ${failed > 0 ? `${failed} failed.` : ""}`, failed > 0);
    loadAll();
  }

  // ── Retry all failed ──────────────────────────────────────────────────────
  async function handleRetryFailed() {
    const failed = records.filter(r => r.record_status === "Failed");
    if (failed.length === 0) { showMsg("No failed records to retry."); return; }
    // Re-mark as New so the commit loop picks them up
    for (const r of failed) {
      await base44.entities.Staging_Records.update(r.id, {
        record_status: "New",
        commit_decision: "Include",
        conflict_detail: "",
      });
    }
    showMsg(`↺ ${failed.length} records reset to New — ready for commit.`);
    loadAll();
  }

  // ── Retry single record ───────────────────────────────────────────────────
  async function handleRetry(record) {
    try {
      await base44.entities[entityTarget].create(record.mapped_data);
      await base44.entities.Staging_Records.update(record.id, {
        record_status: "Committed",
        committed_at: new Date().toISOString(),
        conflict_detail: "Retried by admin.",
      });
      showMsg("✓ Record committed successfully.");
      loadAll();
    } catch (e) {
      showMsg("⚠ Retry failed: " + e.message, true);
    }
  }

  // ── Export ────────────────────────────────────────────────────────────────
  function handleExport(format, subset = "all") {
    const source = subset === "failed"
      ? records.filter(r => r.record_status === "Failed")
      : records.filter(r => statusFilter === "All" ? true : r.record_status === statusFilter);

    const rows = source.map(r => ({
      chain_id: r.mapped_data?.chain_id || r.raw_data?.chain_id || "",
      row_index: r.row_index ?? "",
      record_status: r.record_status,
      conflict_detail: r.conflict_detail || "",
      production_record_id: r.production_record_id || "",
      commit_decision: r.commit_decision || "",
      committed_at: r.committed_at || "",
      mapped_data_json: JSON.stringify(r.mapped_data || {}),
    }));

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Records");
    const filename = `${id}_${subset}_records.${format}`;
    XLSX.writeFile(wb, filename, format === "csv" ? { bookType: "csv" } : {});
  }

  // ── Render ────────────────────────────────────────────────────────────────
  const STATUS_FILTERS = ["All", "Pending", "New", "Changed", "Conflict", "Duplicate", "Committed", "Failed", "Skipped", "Invalid"];

  const filteredRecords = statusFilter === "All"
    ? records
    : records.filter(r => r.record_status === statusFilter);

  const isResumable = session && ["Pending Review", "Partially Committed", "Failed"].includes(session.import_status);
  const hasFailed   = (counts.Failed || 0) > 0;
  const canRollback = session?.rollback_available;

  if (loading) {
    return (
      <ICShell>
        <div style={{ textAlign: "center", padding: "80px 20px", color: "#64748b" }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>⏳</div>
          <div style={{ fontSize: 15, fontWeight: 700 }}>Loading session {id}…</div>
        </div>
      </ICShell>
    );
  }

  if (!session) {
    return (
      <ICShell>
        <div style={{ textAlign: "center", padding: "80px 20px", color: "#64748b" }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>🔍</div>
          <div style={{ fontSize: 15, fontWeight: 700 }}>Session not found: {id}</div>
          <button onClick={() => navigate("/admin/import-center")} style={{ ...btnPrimary, marginTop: 16 }}>
            ← Back to Import Center
          </button>
        </div>
      </ICShell>
    );
  }

  return (
    <ICShell>
      {/* Back + header */}
      <div style={{ marginBottom: 20 }}>
        <button onClick={() => navigate("/admin/import-center")} style={btnBack}>← All Sessions</button>
      </div>

      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 14, marginBottom: 24 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <h1 style={{ fontSize: 22, fontWeight: 900, color: "#0C2340", margin: 0 }}>{session.session_id || id}</h1>
            <SessionStatusPill status={session.import_status} />
          </div>
          <div style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>
            {session.manufacturer} · {session.source_catalog} · Target: <strong>{entityTarget}</strong>
            {session.uploaded_at && ` · Uploaded ${new Date(session.uploaded_at).toLocaleDateString()}`}
          </div>
        </div>

        {/* Action buttons */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
          {hasFailed && (
            <>
              <button onClick={handleRetryFailed} style={btnAction("#f0fdf4","#166534","#86efac")}>↺ Retry All Failed</button>
              <button onClick={() => handleExport("xlsx","failed")} style={btnAction("#eff6ff","#1d4ed8","#93c5fd")}>↓ Export Failed XLSX</button>
              <button onClick={() => handleExport("csv","failed")} style={btnAction("#ecfdf5","#065f46","#6ee7b7")}>↓ Export Failed CSV</button>
            </>
          )}
          {isResumable && (
            <button onClick={handleCommit} disabled={committing}
              style={{ background: committing ? "#e2e8f0" : "#0C2340", color: committing ? "#94a3b8" : "#fff", border: "none", borderRadius: 8, padding: "9px 20px", fontSize: 12, fontWeight: 800, cursor: committing ? "default" : "pointer" }}>
              {committing ? "⏳ Committing…" : "🚀 Continue Commit"}
            </button>
          )}
          {canRollback && (
            <button
              onClick={() => navigate("/admin/import-center", { state: { tab: "rollback" } })}
              style={btnAction("#fef2f2","#dc2626","#fca5a5")}>
              ↩ Rollback
            </button>
          )}
        </div>
      </div>

      {/* Progress / action message */}
      {progress && (
        <div style={{ background: "#eff6ff", border: "1px solid #93c5fd", borderRadius: 8, padding: "9px 16px", marginBottom: 16, fontSize: 12, color: "#1d4ed8", fontWeight: 600 }}>
          ⏳ {progress}
        </div>
      )}
      {actionMsg && (
        <div style={{ background: actionMsg.isError ? "#fef2f2" : "#f0fdf4", border: `1px solid ${actionMsg.isError ? "#fca5a5" : "#86efac"}`, borderRadius: 8, padding: "9px 16px", marginBottom: 16, fontSize: 12, color: actionMsg.isError ? "#dc2626" : "#166534", fontWeight: 700 }}>
          {actionMsg.text}
        </div>
      )}

      {/* Stats */}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 24 }}>
        {[
          { label: "Total Rows",      value: session.total_rows || records.length, color: "#0C2340" },
          { label: "Staged",          value: session.rows_staged || records.length, color: "#8b5cf6" },
          { label: "Written",         value: session.rows_written || counts.Committed || 0, color: "#22c55e" },
          { label: "Failed",          value: session.failed_rows || counts.Failed || 0, color: "#ef4444" },
          { label: "Duplicates",      value: session.duplicates_skipped || counts.Duplicate || 0, color: "#94a3b8" },
          { label: "Flags",           value: session.flags_generated || 0, color: "#f59e0b" },
        ].map(s => (
          <div key={s.label} style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, padding: "12px 16px", minWidth: 90, flex: 1, textAlign: "center" }}>
            <div style={{ fontSize: 20, fontWeight: 900, color: s.color }}>{Number(s.value).toLocaleString()}</div>
            <div style={{ fontSize: 10, color: "#64748b", fontWeight: 600, marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* View toggle */}
      <div style={{ display: "flex", gap: 0, borderBottom: "2px solid #e2e8f0", marginBottom: 20 }}>
        {[
          { key: VIEW_REVIEW, label: "🔍 Review & Commit" },
          { key: VIEW_DEBUG,  label: "🐛 Debug Records" },
        ].map(v => (
          <button key={v.key} onClick={() => setView(v.key)}
            style={{ padding: "9px 20px", border: "none", background: "none", cursor: "pointer", fontSize: 13, fontWeight: 700,
              color: view === v.key ? "#0C2340" : "#64748b",
              borderBottom: view === v.key ? "2px solid #0C2340" : "2px solid transparent",
              marginBottom: -2 }}>
            {v.label}
          </button>
        ))}
      </div>

      {/* ── Review & Commit view (ICDiffViewer) ───────────────────────────── */}
      {view === VIEW_REVIEW && (
        <ICDiffViewer
          records={records}
          onDecision={handleDecision}
          onBulkDecision={handleBulkDecision}
          onCommit={handleCommit}
          committing={committing}
        />
      )}

      {/* ── Debug Records view ─────────────────────────────────────────────── */}
      {view === VIEW_DEBUG && (
        <div>
          {/* Filter bar */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10, marginBottom: 14 }}>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {STATUS_FILTERS.map(f => {
                const cnt = f === "All" ? records.length : (counts[f] || 0);
                if (f !== "All" && cnt === 0) return null;
                const active = statusFilter === f;
                return (
                  <button key={f} onClick={() => setStatusFilter(f)}
                    style={{ padding: "5px 12px", borderRadius: 99, border: `1px solid ${active ? "#0C2340" : "#e2e8f0"}`, background: active ? "#0C2340" : "#fff", color: active ? "#fff" : "#64748b", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>
                    {f} <span style={{ opacity: 0.7 }}>({cnt})</span>
                  </button>
                );
              })}
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => handleExport("xlsx")} style={btnAction("#eef2ff","#4338ca","#c7d2fe")}>↓ XLSX</button>
              <button onClick={() => handleExport("csv")}  style={btnAction("#ecfdf5","#065f46","#a7f3d0")}>↓ CSV</button>
            </div>
          </div>

          {/* Records table */}
          <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0", overflow: "hidden" }}>
            <div style={{ display: "grid", gridTemplateColumns: "24px 1fr 70px 80px 1fr 90px 110px", gap: 12, padding: "8px 16px", background: "#f8fafc", borderBottom: "1px solid #e2e8f0", fontSize: 10, fontWeight: 800, color: "#64748b", textTransform: "uppercase" }}>
              <span /><span>Chain ID</span><span>Row #</span><span>Status</span><span>Conflict Detail</span><span>Decision</span><span>Timestamp</span>
            </div>
            {filteredRecords.length === 0 ? (
              <div style={{ padding: "40px 20px", textAlign: "center", color: "#94a3b8", fontSize: 13 }}>No records match this filter.</div>
            ) : (
              filteredRecords.map((r, i) => (
                <DebugRecordRow
                  key={r.id}
                  record={r}
                  index={i}
                  entityTarget={entityTarget}
                  onRetry={handleRetry}
                  onEditRetry={setEditingRecord}
                />
              ))
            )}
          </div>
        </div>
      )}

      {/* Session notes */}
      {session.notes && (
        <div style={{ marginTop: 20, background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 8, padding: "10px 14px", fontSize: 11, color: "#64748b", fontFamily: "monospace" }}>
          {session.notes}
        </div>
      )}

      {/* Edit & Retry modal */}
      {editingRecord && (
        <EditRetryModal
          record={editingRecord}
          entityTarget={entityTarget}
          onClose={() => setEditingRecord(null)}
          onSaved={() => { loadAll(); showMsg("✓ Record committed after edit."); }}
        />
      )}
    </ICShell>
  );
}

// ── Debug record row ──────────────────────────────────────────────────────────
function DebugRecordRow({ record, index, entityTarget, onRetry, onEditRetry }) {
  const [expanded, setExpanded] = useState(false);
  const chainId = record.mapped_data?.chain_id || record.raw_data?.chain_id || "—";
  const ts = record.committed_at || record.updated_date;

  return (
    <div style={{ borderBottom: "1px solid #f1f5f9" }}>
      <div onClick={() => setExpanded(o => !o)}
        style={{ display: "grid", gridTemplateColumns: "24px 1fr 70px 80px 1fr 90px 110px", gap: 12, alignItems: "center", padding: "10px 16px", cursor: "pointer", background: expanded ? "#f8fafc" : "#fff" }}>
        <span style={{ fontSize: 11, color: "#94a3b8" }}>{expanded ? "▾" : "▸"}</span>
        <span style={{ fontFamily: "monospace", fontSize: 12, fontWeight: 700, color: "#0C2340" }}>{chainId}</span>
        <span style={{ fontSize: 11, color: "#64748b" }}>#{record.row_index ?? index}</span>
        <RecordPill status={record.record_status} />
        <span style={{ fontSize: 11, color: record.conflict_detail ? "#dc2626" : "#94a3b8", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {record.conflict_detail || <em style={{ color: "#cbd5e1" }}>—</em>}
        </span>
        <span style={{ fontSize: 11, color: "#64748b" }}>{record.commit_decision || "—"}</span>
        <span style={{ fontSize: 10, color: "#94a3b8" }}>{ts ? new Date(ts).toLocaleString() : "—"}</span>
      </div>

      {expanded && (
        <div style={{ background: "#f8fafc", padding: "12px 20px 16px", borderTop: "1px solid #e2e8f0" }}>
          {record.conflict_detail && (
            <div style={{ background: "#fef2f2", border: "1px solid #fca5a5", borderRadius: 7, padding: "8px 12px", marginBottom: 10, fontSize: 11, color: "#991b1b", fontFamily: "monospace" }}>
              ⚠ {record.conflict_detail}
            </div>
          )}
          {record.production_record_id && (
            <div style={{ fontSize: 11, color: "#64748b", marginBottom: 8 }}>
              <strong>Production Record ID:</strong>{" "}
              <span style={{ fontFamily: "monospace" }}>{record.production_record_id}</span>
            </div>
          )}
          <JsonBlock label="mapped_data" data={record.mapped_data} defaultOpen />
          <JsonBlock label="raw source row" data={record.raw_data} />
          <JsonBlock label="diff" data={record.diff_summary} />
          {(record.record_status === "Failed" || record.record_status === "Conflict" || record.record_status === "Invalid") && (
            <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
              <button onClick={e => { e.stopPropagation(); onRetry(record); }}
                style={btnAction("#f0fdf4","#166534","#86efac")}>
                ↺ Retry Record
              </button>
              <button onClick={e => { e.stopPropagation(); onEditRetry(record); }}
                style={btnAction("#eff6ff","#1d4ed8","#93c5fd")}>
                ✏ Edit & Retry
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Shared button styles ──────────────────────────────────────────────────────
const btnPrimary = {
  background: "#0C2340", color: "#fff", border: "none", borderRadius: 8,
  padding: "8px 18px", fontSize: 12, fontWeight: 700, cursor: "pointer",
};
const btnSecondary = {
  background: "#f8fafc", color: "#475569", border: "1px solid #e2e8f0",
  borderRadius: 7, padding: "7px 16px", fontSize: 12, fontWeight: 600, cursor: "pointer",
};
const btnBack = {
  background: "#f1f5f9", border: "1px solid #e2e8f0", color: "#334155",
  borderRadius: 7, padding: "6px 14px", cursor: "pointer", fontSize: 12, fontWeight: 600,
};
function btnAction(bg, color, border) {
  return { background: bg, color, border: `1px solid ${border}`, borderRadius: 7, padding: "6px 14px", fontSize: 11, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" };
}