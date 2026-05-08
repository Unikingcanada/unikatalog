/**
 * ReviewRowEquivalents — row renderer for Manufacturer_Equivalents QA review
 */
import { useState, useEffect } from "react";
import StatusBadge from "./StatusBadge";
import ActionButtons from "./ActionButtons";

export default function ReviewRowEquivalents({ record, expanded, onToggle, onApprove, onReject, onFlag, onSaveNotes }) {
  const [notes, setNotes] = useState(record.resolution_notes || "");
  const [saving, setSaving] = useState(false);

  useEffect(() => { setNotes(record.resolution_notes || ""); }, [record.resolution_notes]);

  async function handleSave() {
    setSaving(true);
    await onSaveNotes(notes);
    setSaving(false);
  }

  return (
    <div style={{ padding: "14px 20px" }}>
      {/* Main row */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", cursor: "pointer" }} onClick={onToggle}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <span style={{ fontSize: 13, fontWeight: 800, color: "#1a3a5c" }}>{record.brand_part_number || "—"}</span>
            <span style={{ fontSize: 11, color: "#64748b" }}>({record.brand || "Unknown Brand"})</span>
            {record.brand_series && <span style={{ fontSize: 10, background: "#e0f2fe", color: "#0369a1", padding: "2px 7px", borderRadius: 99, fontWeight: 700 }}>{record.brand_series}</span>}
            <span style={{ fontSize: 11, color: "#64748b" }}>→ chain_id: <strong style={{ color: "#1a3a5c" }}>{record.chain_id || "—"}</strong></span>
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 6, flexWrap: "wrap", alignItems: "center" }}>
            <StatusBadge status={record.review_status} needsReview={record.needs_review} />
            {record.equivalency_type && <FieldPill label="Type" value={record.equivalency_type} />}
            {record.confidence && <ConfidencePill value={record.confidence} />}
          </div>
        </div>
        <ActionButtons onApprove={onApprove} onReject={onReject} onFlag={onFlag} />
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid #f1f5f9", display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px,1fr))", gap: 8 }}>
            {[
              ["Chain ID", record.chain_id],
              ["Brand", record.brand],
              ["Part Number", record.brand_part_number],
              ["Series", record.brand_series],
              ["Equivalency Type", record.equivalency_type],
              ["Confidence", record.confidence],
            ].map(([k, v]) => v ? (
              <div key={k} style={{ background: "#f8fafc", borderRadius: 6, padding: "8px 12px" }}>
                <div style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, color: "#94a3b8", marginBottom: 2 }}>{k}</div>
                <div style={{ fontSize: 12, fontWeight: 600, color: "#0f172a" }}>{v}</div>
              </div>
            ) : null)}
          </div>
          {record.notes && (
            <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 6, padding: "10px 14px", fontSize: 12, color: "#374151", lineHeight: 1.6 }}>
              <strong>Source notes:</strong> {record.notes}
            </div>
          )}
          <NotesEditor notes={notes} onChange={setNotes} onSave={handleSave} saving={saving} />
        </div>
      )}
    </div>
  );
}

function FieldPill({ label, value }) {
  return (
    <span style={{ fontSize: 10, background: "#f1f5f9", border: "1px solid #e2e8f0", borderRadius: 99, padding: "2px 8px", color: "#334155", fontWeight: 600 }}>
      {label}: {value}
    </span>
  );
}

function ConfidencePill({ value }) {
  const colors = { Confirmed: ["#dcfce7","#16a34a"], "Needs Review": ["#fef3c7","#b45309"], Approximate: ["#f1f5f9","#64748b"] };
  const [bg, fg] = colors[value] || ["#f1f5f9","#64748b"];
  return <span style={{ fontSize: 10, background: bg, color: fg, borderRadius: 99, padding: "2px 9px", fontWeight: 700 }}>{value}</span>;
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