/**
 * ICDiffViewer — Color-coded diff viewer for staged records
 * Shows New / Duplicate / Changed / Conflict / FK_Fail / Invalid
 * Allows per-record Include/Skip decisions before commit
 */
import { useState } from "react";
import { STATUS_COLORS } from "@/lib/importCenterEngine";

const STATUS_ORDER = ["New", "Changed", "Conflict", "FK_Fail", "Invalid", "Duplicate", "Skipped", "Pending"];

function StatusBadge({ status }) {
  const c = STATUS_COLORS[status] || STATUS_COLORS.Pending;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4,
      background: c.bg, color: c.text, border: `1px solid ${c.border}`,
      borderRadius: 99, padding: "2px 9px", fontSize: 10, fontWeight: 700,
    }}>
      <span style={{ width: 5, height: 5, borderRadius: "50%", background: c.dot, display: "inline-block" }} />
      {status}
    </span>
  );
}

function DiffCell({ field, oldVal, newVal }) {
  return (
    <div style={{ fontSize: 10, marginBottom: 3 }}>
      <span style={{ fontFamily: "monospace", color: "#7c3aed", marginRight: 4 }}>{field}:</span>
      <span style={{ color: "#dc2626", textDecoration: "line-through", marginRight: 4 }}>{String(oldVal)}</span>
      <span style={{ color: "#059669" }}>→ {String(newVal)}</span>
    </div>
  );
}

/**
 * Parses the multi-line conflict_detail string written by buildValidationDiagnostics()
 * and renders a structured schema-mismatch debug panel.
 */
function FailedDiagnosticsPanel({ detail, mappedData, rowIndex, entityTarget }) {
  const [showRaw, setShowRaw] = useState(false);

  // Split on "---" separator to get per-field blocks
  const sections = (detail || "").split(/\n---\n?/).map(s => s.trim()).filter(Boolean);

  // Parse header block (Row N, Entity)
  const headerBlock = sections[0] || "";
  const rowMatch = headerBlock.match(/Row (\d+) failed/);
  const entityMatch = headerBlock.match(/Entity: (\S+)/);

  // Parse field blocks
  const fieldBlocks = [];
  for (const sec of sections) {
    const fieldMatch = sec.match(/^Field: (.+)/m);
    if (!fieldMatch) continue;
    const expected = (sec.match(/^Expected: (.+)/m) || [])[1];
    const received = (sec.match(/^Received: (.+)/m) || [])[1];
    const value = (sec.match(/^Value: (.+)/m) || [])[1];
    const error = (sec.match(/^Error: (.+)/m) || [])[1];
    fieldBlocks.push({ field: fieldMatch[1], expected, received, value, error });
  }

  // Extract mapped_data snapshot from the last section if present
  const mappedDataSection = (detail || "").match(/Mapped Data:\n([\s\S]+?)(?:\n…\(truncated\))?$/);
  let parsedSnapshot = mappedData;
  if (mappedDataSection) {
    try { parsedSnapshot = JSON.parse(mappedDataSection[1]); } catch {}
  }

  const TYPE_COLORS = {
    string: "#0369a1", array: "#7c3aed", integer: "#047857",
    number: "#047857", boolean: "#b45309", null: "#dc2626", unknown: "#64748b",
  };

  return (
    <div style={{ marginBottom: 14 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
        <span style={{ fontSize: 10, fontWeight: 800, color: "#9a3412", textTransform: "uppercase", letterSpacing: 0.5 }}>
          ⚠ Validation Diagnostics
        </span>
        <span style={{ fontSize: 10, color: "#64748b" }}>
          Row {rowMatch?.[1] ?? (rowIndex != null ? rowIndex + 1 : "?")} · {entityMatch?.[1] ?? entityTarget ?? "—"}
        </span>
        <button onClick={() => setShowRaw(p => !p)}
          style={{ marginLeft: "auto", fontSize: 10, color: "#64748b", background: "none", border: "1px solid #e2e8f0", borderRadius: 4, padding: "2px 7px", cursor: "pointer" }}>
          {showRaw ? "Parsed" : "Raw"}
        </button>
      </div>

      {showRaw ? (
        <pre style={{ fontSize: 10, color: "#334155", background: "#f8fafc", padding: "8px 12px", borderRadius: 6, overflow: "auto", maxHeight: 260, margin: "0 0 10px", whiteSpace: "pre-wrap", wordBreak: "break-all" }}>
          {detail}
        </pre>
      ) : (
        <>
          {fieldBlocks.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 10 }}>
              {fieldBlocks.map((fb, i) => (
                <div key={i} style={{ background: "#fff7ed", border: "1px solid #fed7aa", borderRadius: 6, padding: "8px 12px", fontFamily: "monospace" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 11, fontWeight: 800, color: "#7c2d12" }}>{fb.field}</span>
                    {fb.expected && (
                      <span style={{ fontSize: 10, background: "#f0fdf4", border: "1px solid #86efac", borderRadius: 4, padding: "1px 6px", color: "#166534" }}>
                        expected: <strong>{fb.expected}</strong>
                      </span>
                    )}
                    {fb.received && (
                      <span style={{ fontSize: 10, background: "#fef2f2", border: "1px solid #fca5a5", borderRadius: 4, padding: "1px 6px", color: "#dc2626" }}>
                        received: <strong style={{ color: TYPE_COLORS[fb.received] || "#dc2626" }}>{fb.received}</strong>
                      </span>
                    )}
                  </div>
                  {fb.value !== undefined && (
                    <div style={{ fontSize: 10, color: "#78350f", marginBottom: 2 }}>
                      Value: <code style={{ background: "#fef3c7", padding: "1px 5px", borderRadius: 3 }}>{fb.value}</code>
                    </div>
                  )}
                  {fb.error && (
                    <div style={{ fontSize: 10, color: "#9a3412" }}>Error: {fb.error}</div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            // No structured field blocks — show the raw error text but no mapped dump
            <div style={{ fontSize: 10, color: "#7c2d12", background: "#fff7ed", border: "1px solid #fed7aa", borderRadius: 6, padding: "8px 12px", marginBottom: 10, whiteSpace: "pre-wrap", wordBreak: "break-all" }}>
              {(detail || "").replace(/\nMapped Data:[\s\S]*$/, "").trim()}
            </div>
          )}

          {/* Mapped data snapshot */}
          <div style={{ fontSize: 10, fontWeight: 800, color: "#64748b", marginBottom: 4, textTransform: "uppercase", letterSpacing: 0.5 }}>Mapped Data</div>
          <pre style={{ fontSize: 10, color: "#334155", background: "#f8fafc", padding: "8px 12px", borderRadius: 6, overflow: "auto", maxHeight: 200, margin: 0 }}>
            {JSON.stringify(parsedSnapshot, null, 2)}
          </pre>
        </>
      )}
    </div>
  );
}

function RecordRow({ record, index, onDecision }) {
  const [expanded, setExpanded] = useState(false);
  const c = STATUS_COLORS[record.record_status] || STATUS_COLORS.Pending;
  const hasDiff = record.diff_summary && Object.keys(record.diff_summary).length > 0;
  const decision = record.commit_decision || "Pending";

  return (
    <div style={{ borderBottom: "1px solid #f1f5f9", background: c.bg + "55" }}>
      {/* Summary row */}
      <div style={{ display: "grid", gridTemplateColumns: "32px 100px 80px 1fr 200px 120px", gap: 10, alignItems: "center", padding: "8px 16px", cursor: "pointer" }}
        onClick={() => setExpanded(p => !p)}>
        <span style={{ color: "#94a3b8", fontSize: 10, fontFamily: "monospace" }}>{index + 1}</span>
        <StatusBadge status={record.record_status} />
        <span style={{ fontSize: 10, color: "#94a3b8", fontFamily: "monospace" }}>{record.source_file?.split('/').pop()?.slice(-12) || "—"}</span>
        <div>
          {record.mapped_data && (
            <span style={{ fontSize: 11, color: "#1e293b", fontFamily: "monospace" }}>
              {record.mapped_data.chain_id || record.mapped_data.brand_part_number || record.mapped_data.sprocket_code || JSON.stringify(record.mapped_data).slice(0, 60)}
            </span>
          )}
          {record.conflict_detail && record.record_status !== "Failed" && (
            <span style={{ fontSize: 10, color: "#dc2626", marginLeft: 8 }}>⚠ {record.conflict_detail.slice(0, 80)}</span>
          )}
          {record.record_status === "Failed" && record.conflict_detail && (() => {
            const fieldMatch = record.conflict_detail.match(/^Field: (.+)/m);
            const expectedMatch = record.conflict_detail.match(/^Expected: (.+)/m);
            const receivedMatch = record.conflict_detail.match(/^Received: (.+)/m);
            if (fieldMatch) {
              return (
                <span style={{ fontSize: 10, color: "#9a3412", marginLeft: 8, fontFamily: "monospace" }}>
                  ⚠ <strong>{fieldMatch[1]}</strong>
                  {expectedMatch && receivedMatch && (
                    <span style={{ color: "#64748b" }}> · expected {expectedMatch[1]}, got {receivedMatch[1]}</span>
                  )}
                </span>
              );
            }
            return <span style={{ fontSize: 10, color: "#dc2626", marginLeft: 8 }}>⚠ {record.conflict_detail.slice(0, 60)}</span>;
          })()}
        </div>
        <div style={{ display: "flex", gap: 5 }}>
          {["Include", "Skip"].map(d => (
            <button key={d} onClick={e => { e.stopPropagation(); onDecision(record.id, d); }}
              style={{
                padding: "3px 10px", borderRadius: 6, fontSize: 10, fontWeight: 700, cursor: "pointer",
                border: `1px solid ${d === "Include" ? "#86efac" : "#fca5a5"}`,
                background: decision === d ? (d === "Include" ? "#f0fdf4" : "#fef2f2") : "#fff",
                color: decision === d ? (d === "Include" ? "#166534" : "#dc2626") : "#64748b",
              }}>
              {decision === d ? "✓ " : ""}{d}
            </button>
          ))}
        </div>
        <span style={{ fontSize: 10, color: "#94a3b8" }}>{expanded ? "▲ hide" : "▼ show"}</span>
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div style={{ padding: "10px 20px 14px 58px", background: "#fff", borderTop: "1px solid #f1f5f9" }}>

          {/* Failed row: parse diagnostics out of conflict_detail */}
          {record.record_status === "Failed" && record.conflict_detail && (
            <FailedDiagnosticsPanel detail={record.conflict_detail} mappedData={record.mapped_data} rowIndex={record.row_index} entityTarget={record.entity_target} />
          )}

          {hasDiff && (
            <div style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 10, fontWeight: 800, color: "#64748b", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.5px" }}>Changes</div>
              {Object.entries(record.diff_summary).map(([f, { old, new: nv }]) => (
                <DiffCell key={f} field={f} oldVal={old} newVal={nv} />
              ))}
            </div>
          )}

          {record.record_status !== "Failed" && (
            <>
              <div style={{ fontSize: 10, fontWeight: 800, color: "#64748b", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.5px" }}>Mapped Data</div>
              <pre style={{ fontSize: 10, color: "#334155", background: "#f8fafc", padding: "8px 12px", borderRadius: 6, overflow: "auto", maxHeight: 160, margin: 0 }}>
                {JSON.stringify(record.mapped_data, null, 2)}
              </pre>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default function ICDiffViewer({ records, onDecision, onBulkDecision, onCommit, committing }) {
  const [filterStatus, setFilterStatus] = useState("all");
  const [search, setSearch] = useState("");

  // Counts
  const counts = {};
  STATUS_ORDER.forEach(s => { counts[s] = records.filter(r => r.record_status === s).length; });
  counts.all = records.length;

  const filtered = records.filter(r => {
    const matchStatus = filterStatus === "all" || r.record_status === filterStatus;
    const matchSearch = !search || JSON.stringify(r.mapped_data || {}).toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const canCommit = records.some(r => r.commit_decision === "Include" || (r.record_status === "New" && r.commit_decision !== "Skip"));

  return (
    <div>
      {/* Summary pills */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
        {[["all", records.length, "#0C2340"], ...STATUS_ORDER.filter(s => counts[s] > 0).map(s => [s, counts[s], STATUS_COLORS[s]?.dot || "#94a3b8"])].map(([s, cnt, color]) => (
          <button key={s} onClick={() => setFilterStatus(s)}
            style={{
              padding: "5px 12px", borderRadius: 99, fontSize: 11, fontWeight: 700, cursor: "pointer",
              border: `1px solid ${filterStatus === s ? color : "#e2e8f0"}`,
              background: filterStatus === s ? color : "#fff",
              color: filterStatus === s ? "#fff" : color,
            }}>
            {s} <span style={{ opacity: 0.7 }}>{cnt}</span>
          </button>
        ))}
      </div>

      {/* Toolbar */}
      <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 12, flexWrap: "wrap" }}>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search records…"
          style={{ padding: "6px 12px", border: "1px solid #e2e8f0", borderRadius: 7, fontSize: 11, flex: 1, minWidth: 180 }}
        />
        <button onClick={() => onBulkDecision("New", "Include")} style={toolBtn("#f0fdf4", "#166534")}>✓ Include All New</button>
        <button onClick={() => onBulkDecision("Duplicate", "Skip")} style={toolBtn("#fefce8", "#854d0e")}>⊘ Skip All Duplicates</button>
        <button onClick={() => onBulkDecision("Invalid", "Skip")} style={toolBtn("#fef2f2", "#dc2626")}>⊘ Skip All Invalid</button>
      </div>

      {/* Column headers */}
      <div style={{ ...rowHeaderStyle, background: "#f8fafc", borderRadius: "8px 8px 0 0", border: "1px solid #e2e8f0", borderBottom: "none" }}>
        {["#", "Status", "File", "Record Key / Conflict", "Decision", ""].map((h, i) => (
          <div key={i} style={{ fontSize: 10, fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.5px" }}>{h}</div>
        ))}
      </div>

      {/* Records */}
      <div style={{ border: "1px solid #e2e8f0", borderRadius: "0 0 10px 10px", overflow: "hidden", maxHeight: "55vh", overflowY: "auto" }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px", color: "#64748b", fontSize: 13 }}>
            No records match this filter.
          </div>
        ) : (
          filtered.map((r, i) => (
            <RecordRow key={r.id || i} record={r} index={i} onDecision={onDecision} />
          ))
        )}
      </div>

      {/* Commit bar */}
      <div style={{ marginTop: 16, padding: "14px 20px", background: "#fff", borderRadius: 10, border: "1px solid #e2e8f0", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
        <div style={{ fontSize: 12, color: "#64748b" }}>
          <span style={{ fontWeight: 700, color: "#166534" }}>
            {records.filter(r => r.commit_decision === "Include" || (r.record_status === "New" && r.commit_decision !== "Skip")).length}
          </span> records will be committed ·{" "}
          <span style={{ color: "#94a3b8" }}>
            {records.filter(r => r.commit_decision === "Skip" || r.record_status === "Duplicate").length} skipped
          </span>
        </div>
        <button
          onClick={onCommit}
          disabled={!canCommit || committing}
          style={{
            background: canCommit && !committing ? "#0C2340" : "#e2e8f0",
            color: canCommit && !committing ? "#fff" : "#94a3b8",
            border: "none", borderRadius: 8, padding: "10px 24px",
            fontSize: 13, fontWeight: 800, cursor: canCommit && !committing ? "pointer" : "default",
          }}
        >
          {committing ? "⏳ Committing…" : "🚀 Commit to Production"}
        </button>
      </div>
    </div>
  );
}

const rowHeaderStyle = {
  display: "grid", gridTemplateColumns: "32px 100px 80px 1fr 200px 120px",
  gap: 10, padding: "8px 16px",
};

function toolBtn(bg, color) {
  return { background: bg, color, border: `1px solid ${color}44`, borderRadius: 6, padding: "5px 12px", fontSize: 11, fontWeight: 700, cursor: "pointer" };
}