/**
 * ReviewRowFlags — row renderer for Chain_Review_Flags QA review
 */
import { useState, useEffect } from "react";
import StatusBadge from "./StatusBadge";
import ActionButtons from "./ActionButtons";

const SEVERITY_COLORS = {
  Critical: ["#fef2f2", "#C62828"],
  High:     ["#fff7ed", "#c2410c"],
  Medium:   ["#fffbeb", "#B8860B"],
  Low:      ["#f0fdf4", "#2E7D46"],
};

export default function ReviewRowFlags({ record, expanded, onToggle, onApprove, onReject, onFlag, onSaveNotes }) {
  const [notes, setNotes] = useState(record.resolution_notes || "");
  const [saving, setSaving] = useState(false);

  useEffect(() => { setNotes(record.resolution_notes || ""); }, [record.resolution_notes]);

  async function handleSave() {
    setSaving(true);
    await onSaveNotes(notes);
    setSaving(false);
  }

  const [sevBg, sevFg] = SEVERITY_COLORS[record.severity] || ["#ECEAE4", "#3A4A66"];

  return (
    <div style={{ padding: "14px 20px", borderLeft: `4px solid ${sevFg}` }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", cursor: "pointer" }} onClick={onToggle}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <span style={{ fontSize: 10, fontWeight: 800, background: sevBg, color: sevFg, padding: "2px 9px", borderRadius: 99 }}>{record.severity || "Medium"}</span>
            <span style={{ fontSize: 13, fontWeight: 800, color: "#0E1F3A" }}>{record.flag_type || "Flag"}</span>
            <span style={{ fontSize: 11, color: "#3A4A66" }}>chain_id: <strong style={{ color: "#0E1F3A" }}>{record.chain_id || "—"}</strong></span>
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 6, flexWrap: "wrap", alignItems: "center" }}>
            <StatusBadge status={record.review_status} needsReview={record.needs_review} resolved={record.resolved} />
            {record.affected_field && (
              <span style={{ fontSize: 10, background: "#ECEAE4", border: "1px solid #D9D6CE", borderRadius: 99, padding: "2px 8px", color: "#3A4A66", fontWeight: 600 }}>
                Field: {record.affected_field}
              </span>
            )}
            {record.assigned_to && (
              <span style={{ fontSize: 10, background: "#FDF0E9", color: "#0E1F3A", borderRadius: 99, padding: "2px 8px", fontWeight: 600 }}>
                Assigned: {record.assigned_to}
              </span>
            )}
          </div>
          {record.description && (
            <div style={{ fontSize: 12, color: "#3A4A66", marginTop: 6, lineHeight: 1.5 }}>{record.description}</div>
          )}
        </div>
        <ActionButtons onApprove={onApprove} onReject={onReject} onFlag={onFlag} approveLabel="Mark Resolved" />
      </div>

      {expanded && (
        <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid #ECEAE4", display: "flex", flexDirection: "column", gap: 12 }}>
          {/* Conflict display */}
          {(record.source_a || record.source_b) && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {record.source_a && (
                <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, padding: "10px 14px" }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: "#C62828", marginBottom: 4, textTransform: "uppercase", letterSpacing: 1 }}>Source A: {record.source_a}</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#0E1F3A" }}>{record.value_a || "—"}</div>
                </div>
              )}
              {record.source_b && (
                <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, padding: "10px 14px" }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: "#C62828", marginBottom: 4, textTransform: "uppercase", letterSpacing: 1 }}>Source B: {record.source_b}</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#0E1F3A" }}>{record.value_b || "—"}</div>
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
      <div style={{ fontSize: 11, fontWeight: 700, color: "#3A4A66", marginBottom: 4, textTransform: "uppercase", letterSpacing: 1 }}>Resolution Notes</div>
      <textarea value={notes} onChange={e => onChange(e.target.value)} rows={3}
        style={{ width: "100%", padding: "8px 12px", border: "1px solid #D9D6CE", borderRadius: 7, fontSize: 12, resize: "vertical", outline: "none", boxSizing: "border-box", fontFamily: "inherit" }}
        placeholder="Add resolution notes..." />
      <button onClick={onSave} disabled={saving}
        style={{ marginTop: 6, padding: "6px 16px", borderRadius: 6, border: "none", background: saving ? "#D9D6CE" : "#0E1F3A", color: saving ? "#8A94A6" : "#fff", fontSize: 12, fontWeight: 700, cursor: saving ? "default" : "pointer" }}>
        {saving ? "Saving…" : "Save Notes"}
      </button>
    </div>
  );
}