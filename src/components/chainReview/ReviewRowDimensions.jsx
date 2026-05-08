/**
 * ReviewRowDimensions — row renderer for Chain_Dimensions QA review
 */
import { useState } from "react";
import StatusBadge from "./StatusBadge";
import ActionButtons from "./ActionButtons";

const DIM_FIELDS = [
  ["Pitch (in)", "pitch_in"], ["Pitch (mm)", "pitch_mm"],
  ["Roller Dia (in)", "roller_dia_in"], ["Roller Dia (mm)", "roller_dia_mm"],
  ["Roller Width (in)", "roller_width_in"], ["Roller Width (mm)", "roller_width_mm"],
  ["Pin Dia (in)", "pin_dia_in"], ["Pin Dia (mm)", "pin_dia_mm"],
  ["Pin Length (in)", "pin_length_in"], ["Pin Length (mm)", "pin_length_mm"],
  ["Plate Height (in)", "plate_height_in"], ["Plate Height (mm)", "plate_height_mm"],
  ["Plate Thick (in)", "plate_thickness_in"], ["Plate Thick (mm)", "plate_thickness_mm"],
  ["Weight (lbs/ft)", "weight_lbs_ft"], ["Weight (kg/m)", "weight_kg_m"],
];

export default function ReviewRowDimensions({ record, expanded, onToggle, onApprove, onReject, onFlag, onSaveNotes }) {
  const [notes, setNotes] = useState(record.resolution_notes || "");
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    await onSaveNotes(notes);
    setSaving(false);
  }

  const presentDims = DIM_FIELDS.filter(([, k]) => record[k] != null && record[k] !== "");

  return (
    <div style={{ padding: "14px 20px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 0, cursor: "pointer" }} onClick={onToggle}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <span style={{ fontSize: 13, fontWeight: 800, color: "#1a3a5c" }}>chain_id: {record.chain_id || "—"}</span>
            {record.source_brand && <span style={{ fontSize: 10, background: "#e0f2fe", color: "#0369a1", padding: "2px 7px", borderRadius: 99, fontWeight: 700 }}>{record.source_brand}</span>}
            {record.standard && <span style={{ fontSize: 10, background: "#f1f5f9", color: "#334155", padding: "2px 7px", borderRadius: 99, fontWeight: 600 }}>{record.standard}</span>}
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 6, flexWrap: "wrap", alignItems: "center" }}>
            <StatusBadge status={record.review_status} needsReview={record.needs_review} />
            {presentDims.slice(0, 4).map(([label, key]) => (
              <span key={key} style={{ fontSize: 10, background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 99, padding: "2px 8px", color: "#334155", fontWeight: 600 }}>
                {label}: {record[key]}
              </span>
            ))}
            {presentDims.length > 4 && <span style={{ fontSize: 10, color: "#94a3b8" }}>+{presentDims.length - 4} more</span>}
          </div>
        </div>
        <ActionButtons onApprove={onApprove} onReject={onReject} onFlag={onFlag} />
      </div>

      {expanded && (
        <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid #f1f5f9", display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px,1fr))", gap: 8 }}>
            {presentDims.map(([label, key]) => (
              <div key={key} style={{ background: "#f8fafc", borderRadius: 6, padding: "8px 12px" }}>
                <div style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, color: "#94a3b8", marginBottom: 2 }}>{label}</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>{record[key]}</div>
              </div>
            ))}
          </div>
          {record.notes && (
            <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 6, padding: "10px 14px", fontSize: 12, color: "#374151" }}>
              <strong>Notes:</strong> {record.notes}
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