/**
 * ICDiffViewer — Color-coded diff viewer for staged records
 * Shows New / Duplicate / Changed / Conflict / FK_Fail / Invalid
 * Allows per-record Include/Skip decisions before commit
 */
import { useState } from "react";
import { STATUS_COLORS } from "@/lib/importCenterEngine";
import AIResolveButton from "./AIResolveButton";

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
      <span style={{ fontFamily: "monospace", color: "#3A4A66", marginRight: 4 }}>{field}:</span>
      <span style={{ color: "#C62828", textDecoration: "line-through", marginRight: 4 }}>{String(oldVal)}</span>
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
    string: "#0E1F3A", array: "#3A4A66", integer: "#047857",
    number: "#047857", boolean: "#B8860B", null: "#C62828", unknown: "#3A4A66",
  };

  return (
    <div style={{ marginBottom: 14 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
        <span style={{ fontSize: 10, fontWeight: 800, color: "#9a3412", textTransform: "uppercase", letterSpacing: 0.5 }}>
          ⚠ Validation Diagnostics
        </span>
        <span style={{ fontSize: 10, color: "#3A4A66" }}>
          Row {rowMatch?.[1] ?? (rowIndex != null ? rowIndex + 1 : "?")} · {entityMatch?.[1] ?? entityTarget ?? "—"}
        </span>
        <button onClick={() => setShowRaw(p => !p)}
          style={{ marginLeft: "auto", fontSize: 10, color: "#3A4A66", background: "none", border: "1px solid #D9D6CE", borderRadius: 4, padding: "2px 7px", cursor: "pointer" }}>
          {showRaw ? "Parsed" : "Raw"}
        </button>
      </div>

      {showRaw ? (
        <pre style={{ fontSize: 10, color: "#3A4A66", background: "#F4F2ED", padding: "8px 12px", borderRadius: 6, overflow: "auto", maxHeight: 260, margin: "0 0 10px", whiteSpace: "pre-wrap", wordBreak: "break-all" }}>
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
                      <span style={{ fontSize: 10, background: "#f0fdf4", border: "1px solid #86efac", borderRadius: 4, padding: "1px 6px", color: "#2E7D46" }}>
                        expected: <strong>{fb.expected}</strong>
                      </span>
                    )}
                    {fb.received && (
                      <span style={{ fontSize: 10, background: "#fef2f2", border: "1px solid #fca5a5", borderRadius: 4, padding: "1px 6px", color: "#C62828" }}>
                        received: <strong style={{ color: TYPE_COLORS[fb.received] || "#C62828" }}>{fb.received}</strong>
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
          <div style={{ fontSize: 10, fontWeight: 800, color: "#3A4A66", marginBottom: 4, textTransform: "uppercase", letterSpacing: 0.5 }}>Mapped Data</div>
          <pre style={{ fontSize: 10, color: "#3A4A66", background: "#F4F2ED", padding: "8px 12px", borderRadius: 6, overflow: "auto", maxHeight: 200, margin: 0 }}>
            {JSON.stringify(parsedSnapshot, null, 2)}
          </pre>
        </>
      )}
    </div>
  );
}

const AI_RESOLVE_STATUSES = new Set(["Conflict", "FK_Fail"]);

function RecordRow({ record, index, onDecision }) {
  const [expanded, setExpanded] = useState(false);
  const c = STATUS_COLORS[record.record_status] || STATUS_COLORS.Pending;
  const hasDiff = record.diff_summary && Object.keys(record.diff_summary).length > 0;
  const decision = record.commit_decision || "Pending";

  return (
    <div style={{ borderBottom: "1px solid #ECEAE4", background: c.bg + "55" }}>
      {/* Summary row */}
      <div style={{ display: "grid", gridTemplateColumns: "32px 100px 80px 1fr 200px 120px", gap: 10, alignItems: "center", padding: "8px 16px", cursor: "pointer" }}
        onClick={() => setExpanded(p => !p)}>
        <span style={{ color: "#8A94A6", fontSize: 10, fontFamily: "monospace" }}>{index + 1}</span>
        <StatusBadge status={record.record_status} />
        <span style={{ fontSize: 10, color: "#8A94A6", fontFamily: "monospace" }}>{record.source_file?.split('/').pop()?.slice(-12) || "—"}</span>
        <div>
          {record.mapped_data && (
            <span style={{ fontSize: 11, color: "#0E1F3A", fontFamily: "monospace" }}>
              {record.mapped_data.chain_id || record.mapped_data.brand_part_number || record.mapped_data.sprocket_code || JSON.stringify(record.mapped_data).slice(0, 60)}
            </span>
          )}
          {record.conflict_detail && record.record_status !== "Failed" && (
            <span style={{ fontSize: 10, color: "#C62828", marginLeft: 8 }}>⚠ {record.conflict_detail.slice(0, 80)}</span>
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
                    <span style={{ color: "#3A4A66" }}> · expected {expectedMatch[1]}, got {receivedMatch[1]}</span>
                  )}
                </span>
              );
            }
            return <span style={{ fontSize: 10, color: "#C62828", marginLeft: 8 }}>⚠ {record.conflict_detail.slice(0, 60)}</span>;
          })()}
        </div>
        <div style={{ display: "flex", gap: 5 }}>
          {["Include", "Skip"].map(d => (
            <button key={d} onClick={e => { e.stopPropagation(); onDecision(record.id, d); }}
              style={{
                padding: "3px 10px", borderRadius: 6, fontSize: 10, fontWeight: 700, cursor: "pointer",
                border: `1px solid ${d === "Include" ? "#86efac" : "#fca5a5"}`,
                background: decision === d ? (d === "Include" ? "#f0fdf4" : "#fef2f2") : "#fff",
                color: decision === d ? (d === "Include" ? "#2E7D46" : "#C62828") : "#3A4A66",
              }}>
              {decision === d ? "✓ " : ""}{d}
            </button>
          ))}
        </div>
        <span style={{ fontSize: 10, color: "#8A94A6" }}>{expanded ? "▲ hide" : "▼ show"}</span>
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div style={{ padding: "10px 20px 14px 58px", background: "#fff", borderTop: "1px solid #ECEAE4" }}>

          {/* Failed row: parse diagnostics out of conflict_detail */}
          {record.record_status === "Failed" && record.conflict_detail && (
            <FailedDiagnosticsPanel detail={record.conflict_detail} mappedData={record.mapped_data} rowIndex={record.row_index} entityTarget={record.entity_target} />
          )}

          {hasDiff && (
            <div style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 10, fontWeight: 800, color: "#3A4A66", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.5px" }}>Changes</div>
              {Object.entries(record.diff_summary).map(([f, { old, new: nv }]) => (
                <DiffCell key={f} field={f} oldVal={old} newVal={nv} />
              ))}
            </div>
          )}

          {record.record_status !== "Failed" && (
            <>
              <div style={{ fontSize: 10, fontWeight: 800, color: "#3A4A66", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.5px" }}>Mapped Data</div>
              <pre style={{ fontSize: 10, color: "#3A4A66", background: "#F4F2ED", padding: "8px 12px", borderRadius: 6, overflow: "auto", maxHeight: 160, margin: 0 }}>
                {JSON.stringify(record.mapped_data, null, 2)}
              </pre>
            </>
          )}

          {/* AI Resolve — only for Conflict and FK_Fail */}
          {AI_RESOLVE_STATUSES.has(record.record_status) && (
            <AIResolveButton record={record} onApplyDecision={onDecision} />
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
        {[["all", records.length, "#0E1F3A"], ...STATUS_ORDER.filter(s => counts[s] > 0).map(s => [s, counts[s], STATUS_COLORS[s]?.dot || "#8A94A6"])].map(([s, cnt, color]) => (
          <button key={s} onClick={() => setFilterStatus(s)}
            style={{
              padding: "5px 12px", borderRadius: 99, fontSize: 11, fontWeight: 700, cursor: "pointer",
              border: `1px solid ${filterStatus === s ? color : "#D9D6CE"}`,
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
          style={{ padding: "6px 12px", border: "1px solid #D9D6CE", borderRadius: 7, fontSize: 11, flex: 1, minWidth: 180 }}
        />
        <button onClick={() => onBulkDecision("New", "Include")} style={toolBtn("#f0fdf4", "#2E7D46")}>✓ Include All New</button>
        <button onClick={() => onBulkDecision("Duplicate", "Skip")} style={toolBtn("#fefce8", "#854d0e")}>⊘ Skip All Duplicates</button>
        <button onClick={() => onBulkDecision("Invalid", "Skip")} style={toolBtn("#fef2f2", "#C62828")}>⊘ Skip All Invalid</button>
      </div>

      {/* Column headers */}
      <div style={{ ...rowHeaderStyle, background: "#F4F2ED", borderRadius: "8px 8px 0 0", border: "1px solid #D9D6CE", borderBottom: "none" }}>
        {["#", "Status", "File", "Record Key / Conflict", "Decision", ""].map((h, i) => (
          <div key={i} style={{ fontSize: 10, fontWeight: 800, color: "#8A94A6", textTransform: "uppercase", letterSpacing: "0.5px" }}>{h}</div>
        ))}
      </div>

      {/* Records */}
      <div style={{ border: "1px solid #D9D6CE", borderRadius: "0 0 10px 10px", overflow: "hidden", maxHeight: "55vh", overflowY: "auto" }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px", color: "#3A4A66", fontSize: 13 }}>
            No records match this filter.
          </div>
        ) : (
          filtered.map((r, i) => (
            <RecordRow key={r.id || i} record={r} index={i} onDecision={onDecision} />
          ))
        )}
      </div>

      {/* Commit bar */}
      <div style={{ marginTop: 16, padding: "14px 20px", background: "#fff", borderRadius: 10, border: "1px solid #D9D6CE", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
        <div style={{ fontSize: 12, color: "#3A4A66" }}>
          <span style={{ fontWeight: 700, color: "#2E7D46" }}>
            {records.filter(r => r.commit_decision === "Include" || (r.record_status === "New" && r.commit_decision !== "Skip")).length}
          </span> records will be committed ·{" "}
          <span style={{ color: "#8A94A6" }}>
            {records.filter(r => r.commit_decision === "Skip" || r.record_status === "Duplicate").length} skipped
          </span>
        </div>
        <button
          onClick={onCommit}
          disabled={!canCommit || committing}
          style={{
            background: canCommit && !committing ? "#0E1F3A" : "#D9D6CE",
            color: canCommit && !committing ? "#fff" : "#8A94A6",
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