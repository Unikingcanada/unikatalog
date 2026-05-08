/**
 * ReviewRowFlags — row renderer for Chain_Review_Flags QA review
 */
import { useState } from "react";
import StatusBadge from "./StatusBadge";
import ActionButtons from "./ActionButtons";

const SEVERITY_COLORS = {
  Critical: ["#fef2f2", "#b91c1c"],
  High:     ["#fff7ed", "#c2410c"],
  Medium:   ["#fffbeb", "#b45309"],
  Low:      ["#f0fdf4", "#16a34a"],
};

export default function ReviewRowFlags({ record, expanded, onToggle, onApprove, onReject, onFlag, onSaveNotes }) {
  const [notes, setNotes] = useState(record.resolution_notes || "");
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    await onSaveNotes(notes);
    setSaving(false);
  }

  const [sevBg, sevFg] = SEVERITY_COLORS[record.severity] || ["#f1f5f9", "#64748b"];

  return (
    <div style={{ padding: "14px 20px", borderLeft: `4px solid ${sevFg}` }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 0, cursor: "pointer" }} onClick={onToggle}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <span style={{ fontSize: 10, fontWeight: 800, background: sevBg, color: sevFg, padding: "2px 9px", borderRadius: 99 }}>{record.severity || "Medium"}</span>
            <span style={{ fontSize: 13, fontWeight: 800, color: "#1a3a5c" }}>{record.flag_type || "Flag"}</span>
            <span style={{ fontSize: 11, color: "#64748b" }}>chain_id: <strong style={{ color: "#1a3a5c" }}>{record.chain_id || "—"}</strong></span>
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 6, flexWrap: "wrap", alignItems: "center" }}>
            <StatusBadge status={record.review_status} needsReview={record.needs_review} resolved={record.resolved} />
            {record.affected_field && (
              <span style={{ fontSize: 10, background: "#f1f5f9", border: "1px solid #e2e8f0", borderRadius: 99, padding: "2px 8px", color: "#334155", fontWeight: 600 }}>
                Field: {record.affected_field}
              </span>
            )}
            {record.assigned_to && (
              <span style={{ fontSize: 10, background: "#e0f2fe", color: "#0369a1", borderRadius: 99, padding: "2px 8px", fontWeight: 600 }}>
                Assigned: {record.assigned_to}
              </span>
            )}
          </div>
          {record.description && (
            <div style={{ fontSize: 12, color: "#374151", marginTop: 6, lineHeight: 1.5 }}>{record.description}</div>
          )}
        </div>
        <ActionButtons onApprove={onApprove} onReject={onReject} onFlag={onFlag} approveLabel="Mark Resolved" />
      </div>

      {expanded && (
        <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid #f1f5f9", display: "flex", flexDirection: "column", gap: 12 }}>
          {/* Conflict display */}
          {(record.source_a || record.source_b) && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {record.source_a && (
                <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, padding: "10px 14px" }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: "#b91c1c", marginBottom: 4, textTransform: "uppercase", letterSpacing: 1 }}>Source A: {record.source_a}</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>{record.value_a || "—"}</div>
                </div>
              )}
              {record.source_b && (
                <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, padding: "10px 14px" }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: "#b91c1c", marginBottom: 4, textTransform: "uppercase", letterSpacing: 1 }}>Source B: {record.source_b}</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>{record.value_b || "—"}</div>
                </div>
              )}
            </div>
          )}
          <NotesEditor notes={notes} onChange={setNotes} onSave={handleSave} saving={saving} />
        </div>
      )}
    </div>
  );
}

function NotesEditor({ notes, onChange, onSave, saving }) {
  return (
    <div>
      <div style={{ fontSize: 11, fontWeight: 700, color: "#64748b", marginBottom: 4, textTransform: "uppercase", letterSpacing: 1 }}>Resolution Notes</div>
      <textarea value={notes} onChange={e => onChange(e.target.value)} rows={3}
        style={{ width: "100%", padding: "8px 12px", border: "1px solid #e2e8f0", borderRadius: 7, fontSize: 12, resize: "vertical", outline: "none", boxSizing: "border-box", fontFamily: "inherit" }}
        placeholder="Add resolution notes..." />
      <button onClick={onSave} disabled={saving}
        style={{ marginTop: 6, padding: "6px 16px", borderRadius: 6, border: "none", background: saving ? "#e2e8f0" : "#1a3a5c", color: saving ? "#94a3b8" : "#fff", fontSize: 12, fontWeight: 700, cursor: saving ? "default" : "pointer" }}>
        {saving ? "Saving…" : "Save Notes"}
      </button>
    </div>
  );
}