/**
 * ICSessionDetailView — Full debug view for a committed/failed import session.
 * Shows per-record status with filters, expandable JSON viewer, retry/export actions.
 */
import { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { STATUS_COLORS } from "@/lib/importCenterEngine";
import * as XLSX from "xlsx";

const STATUS_FILTERS = ["All", "Failed", "Conflict", "Duplicate", "Committed", "Skipped", "Invalid", "New", "Changed"];

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

// ── Single Record Row ─────────────────────────────────────────────────────────
function RecordRow({ record, onRetry, onEditRetry, index }) {
  const [expanded, setExpanded] = useState(false);
  const chainId = record.mapped_data?.chain_id || record.raw_data?.chain_id || "—";
  const ts = record.committed_at || record.created_date || record.updated_date;

  return (
    <div style={{ borderBottom: "1px solid #f1f5f9" }}>
      {/* Summary row */}
      <div
        onClick={() => setExpanded(o => !o)}
        style={{ display: "grid", gridTemplateColumns: "24px 1fr 80px 80px 1fr 100px 120px", gap: 12, alignItems: "center", padding: "10px 16px", cursor: "pointer", background: expanded ? "#f8fafc" : "#fff", transition: "background 0.1s" }}>
        {/* Expand toggle */}
        <span style={{ fontSize: 11, color: "#94a3b8", fontWeight: 700 }}>{expanded ? "▾" : "▸"}</span>

        {/* chain_id */}
        <span style={{ fontFamily: "monospace", fontSize: 12, fontWeight: 700, color: "#0C2340" }}>{chainId}</span>

        {/* Row # */}
        <span style={{ fontSize: 11, color: "#64748b" }}>Row {record.row_index ?? index}</span>

        {/* Status pill */}
        <span style={S.pill(record.record_status)}>{record.record_status}</span>

        {/* Conflict detail */}
        <span style={{ fontSize: 11, color: record.conflict_detail ? "#dc2626" : "#94a3b8", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={record.conflict_detail || ""}>
          {record.conflict_detail || <em style={{ color: "#cbd5e1" }}>—</em>}
        </span>

        {/* Production record ID */}
        <span style={{ fontFamily: "monospace", fontSize: 10, color: "#64748b" }}>
          {record.production_record_id ? record.production_record_id.slice(0, 10) + "…" : "—"}
        </span>

        {/* Timestamp */}
        <span style={{ fontSize: 10, color: "#94a3b8" }}>
          {ts ? new Date(ts).toLocaleString() : "—"}
        </span>
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div style={{ background: "#f8fafc", padding: "12px 20px 16px", borderTop: "1px solid #e2e8f0" }}>
          {/* Full conflict detail */}
          {record.conflict_detail && (
            <div style={{ background: "#fef2f2", border: "1px solid #fca5a5", borderRadius: 7, padding: "8px 12px", marginBottom: 10, fontSize: 11, color: "#991b1b", ...S.mono }}>
              ⚠ {record.conflict_detail}
            </div>
          )}

          {/* Production record ID in full */}
          {record.production_record_id && (
            <div style={{ fontSize: 11, color: "#64748b", marginBottom: 8 }}>
              <strong>Production Record ID:</strong>{" "}
              <span style={S.mono}>{record.production_record_id}</span>
            </div>
          )}

          {/* JSON viewers */}
          <JsonBlock label="mapped_data" data={record.mapped_data} defaultOpen={true} />
          <JsonBlock label="raw source row" data={record.raw_data} />
          <JsonBlock label="diff / validation errors" data={record.diff_summary} />

          {/* Actions */}
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

// ── Main Component ────────────────────────────────────────────────────────────
export default function ICSessionDetailView({ session, onBack }) {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("All");
  const [editingRecord, setEditingRecord] = useState(null);
  const [actionMsg, setActionMsg] = useState(null);

  const entityTarget = session.entity_targets?.[0] || "Normalized_Chains";
  const sessionKey = session.session_id || session.id;

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
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
        <button onClick={onBack} style={backBtn}>← All Sessions</button>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 18, fontWeight: 900, color: "#0C2340" }}>
            Session: {sessionKey}
          </div>
          <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>
            {session.manufacturer} · {session.source_catalog} · Target: <strong>{entityTarget}</strong> · Status: <strong>{session.import_status}</strong>
          </div>
        </div>
        {actionMsg && (
          <div style={{ padding: "7px 14px", borderRadius: 8, fontSize: 11, fontWeight: 700, background: actionMsg.isError ? "#fef2f2" : "#f0fdf4", color: actionMsg.isError ? "#dc2626" : "#166534", border: `1px solid ${actionMsg.isError ? "#fca5a5" : "#86efac"}` }}>
            {actionMsg.text}
          </div>
        )}
      </div>

      {/* Stats row */}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 20 }}>
        {[
          { label: "Total Rows",      value: session.total_rows || 0,       color: "#0C2340" },
          { label: "Written",         value: session.rows_written || 0,     color: "#22c55e" },
          { label: "Failed",          value: session.failed_rows || 0,      color: "#ef4444" },
          { label: "Skipped",         value: session.duplicates_skipped || 0, color: "#94a3b8" },
          { label: "Flags Generated", value: session.flags_generated || 0,  color: "#f59e0b" },
        ].map(s => (
          <div key={s.label} style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, padding: "12px 18px", minWidth: 100, flex: 1, textAlign: "center" }}>
            <div style={{ fontSize: 22, fontWeight: 900, color: s.color }}>{s.value.toLocaleString()}</div>
            <div style={{ fontSize: 10, color: "#64748b", fontWeight: 600, marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filter bar + export */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10, marginBottom: 14 }}>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {STATUS_FILTERS.map(f => {
            const active = statusFilter === f;
            const cnt = f === "All" ? records.length : (counts[f] || 0);
            if (f !== "All" && cnt === 0) return null;
            return (
              <button key={f} onClick={() => setStatusFilter(f)}
                style={{
                  padding: "5px 12px", borderRadius: 99, border: `1px solid ${active ? "#0C2340" : "#e2e8f0"}`,
                  background: active ? "#0C2340" : "#fff", color: active ? "#fff" : "#64748b",
                  fontSize: 11, fontWeight: 700, cursor: "pointer",
                }}>
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
        {/* Column header */}
        <div style={{ display: "grid", gridTemplateColumns: "24px 1fr 80px 80px 1fr 100px 120px", gap: 12, padding: "8px 16px", background: "#f8fafc", borderBottom: "1px solid #e2e8f0", fontSize: 10, fontWeight: 800, color: "#64748b", textTransform: "uppercase", letterSpacing: 0.5 }}>
          <span />
          <span>Chain ID</span>
          <span>Row #</span>
          <span>Status</span>
          <span>Conflict Detail</span>
          <span>Prod Record</span>
          <span>Timestamp</span>
        </div>

        {loading ? (
          <div style={{ padding: "48px 20px", textAlign: "center", color: "#64748b", fontSize: 13 }}>Loading records…</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: "48px 20px", textAlign: "center", color: "#94a3b8", fontSize: 13 }}>
            No records match this filter.
          </div>
        ) : (
          filtered.map((r, i) => (
            <RecordRow
              key={r.id}
              record={r}
              index={i}
              onRetry={handleRetry}
              onEditRetry={setEditingRecord}
            />
          ))
        )}
      </div>

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

const backBtn = {
  background: "#f1f5f9", border: "1px solid #e2e8f0", color: "#334155",
  borderRadius: 7, padding: "6px 14px", cursor: "pointer", fontSize: 12,
  fontWeight: 600, display: "inline-block", whiteSpace: "nowrap",
};