/**
 * Chain Import Summary — Pre-commit validation and approval screen
 * Shows: new records, existing detected, duplicates, orphan risks, invalid rows
 * Requires admin confirmation before final commit
 */
import React, { useState } from "react";
import { AlertCircle, CheckCircle2, Info, AlertTriangle, Download, Send } from "lucide-react";

const C = {
  navy: "#003c5b",
  navyMid: "#1A3A5C",
  green: "#16a34a",
  red: "#dc2626",
  orange: "#f59e0b",
  text: "#0f172a",
  muted: "#64748b",
  border: "#e2e8f0",
  bg: "#f8fafc",
};

export default function ChainImportSummary({
  validationResult,
  orphanRisks,
  sessionId,
  onApprove,
  onCancel,
  onExportIssues,
  isCommitting = false,
}) {
  const [confirmed, setConfirmed] = useState(false);
  const [commitMode, setCommitMode] = useState("new_only"); // new_only, include_updates, all

  const {
    new: newRecords = [],
    existing = [],
    duplicates = [],
    invalid = [],
    orphanRisks: validationOrphans = [],
    summary = {},
  } = validationResult || {};

  const totalOrphans = Object.values(orphanRisks || {}).reduce((sum, arr) => sum + arr.length, 0);
  const hasIssues = duplicates.length > 0 || invalid.length > 0 || totalOrphans > 0;

  function handleApprove() {
    if (!confirmed) {
      alert("Please confirm you understand this commit");
      return;
    }
    onApprove({ mode: commitMode, sessionId });
  }

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "20px" }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 26, fontWeight: 900, color: C.text, marginBottom: 6 }}>
          Import Summary — Ready to Commit?
        </h1>
        <p style={{ fontSize: 13, color: C.muted }}>
          Session {sessionId} — Review changes before final commit to Normalized_Chains
        </p>
      </div>

      {/* Overview Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12, marginBottom: 28 }}>
        <StatBox
          icon={<CheckCircle2 className="w-5 h-5" />}
          label="New Records"
          value={newRecords.length}
          color={C.green}
        />
        <StatBox
          icon={<Info className="w-5 h-5" />}
          label="Existing (Update)"
          value={existing.length}
          color={C.navy}
        />
        <StatBox
          icon={<AlertTriangle className="w-5 h-5" />}
          label="Duplicates"
          value={duplicates.length}
          color={duplicates.length > 0 ? C.red : C.muted}
        />
        <StatBox
          icon={<AlertCircle className="w-5 h-5" />}
          label="Invalid"
          value={invalid.length}
          color={invalid.length > 0 ? C.red : C.muted}
        />
        <StatBox
          icon={<AlertTriangle className="w-5 h-5" />}
          label="Orphan Risk"
          value={totalOrphans}
          color={totalOrphans > 0 ? C.orange : C.muted}
        />
      </div>

      {/* Issues Section */}
      {hasIssues && (
        <div style={{ background: "#fef2f2", border: "1px solid #fca5a5", borderRadius: 10, padding: 16, marginBottom: 24 }}>
          <div style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 12 }}>
            <AlertCircle className="w-5 h-5 flex-shrink-0" style={{ color: C.red, marginTop: 2 }} />
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: C.red, marginBottom: 4 }}>
                Issues Detected
              </div>
              <div style={{ fontSize: 12, color: "#991b1b", lineHeight: 1.6 }}>
                {duplicates.length > 0 && <div>• {duplicates.length} duplicate chain_id(s) within batch</div>}
                {invalid.length > 0 && <div>• {invalid.length} invalid row(s) (missing required fields)</div>}
                {totalOrphans > 0 && <div>• {totalOrphans} orphan relationship risk(s) detected</div>}
              </div>
            </div>
          </div>
          <button
            onClick={() => onExportIssues?.(validationResult)}
            style={{
              padding: "6px 12px",
              background: "rgba(220, 38, 38, 0.1)",
              border: "1px solid #fca5a5",
              borderRadius: 6,
              fontSize: 11,
              fontWeight: 700,
              color: C.red,
              cursor: "pointer",
            }}
          >
            <Download className="w-3 h-3 inline mr-2" /> Export Issues CSV
          </button>
        </div>
      )}

      {/* Detailed Sections */}
      {newRecords.length > 0 && (
        <SummarySection
          title={`New Records (${newRecords.length})`}
          icon={<CheckCircle2 className="w-4 h-4" />}
          color={C.green}
          items={newRecords.slice(0, 5)}
          itemKey="chain_id"
          showMore={newRecords.length > 5}
        />
      )}

      {existing.length > 0 && (
        <SummarySection
          title={`Existing Records Detected (${existing.length})`}
          icon={<Info className="w-4 h-4" />}
          color={C.navy}
          items={existing.slice(0, 5)}
          itemKey="chain_id"
          note="These records already exist. Commit will skip unless you select 'Include Selected Updates'"
          showMore={existing.length > 5}
        />
      )}

      {duplicates.length > 0 && (
        <SummarySection
          title={`Duplicates (${duplicates.length})`}
          icon={<AlertTriangle className="w-4 h-4" />}
          color={C.red}
          items={duplicates}
          itemKey="chain_id"
          note="Same chain_id appears multiple times in this batch. Only first occurrence will be considered."
          showMore={duplicates.length > 5}
        />
      )}

      {invalid.length > 0 && (
        <SummarySection
          title={`Invalid Rows (${invalid.length})`}
          icon={<AlertCircle className="w-4 h-4" />}
          color={C.red}
          items={invalid.slice(0, 5)}
          itemKey="chain_id"
          detail="reason"
          showMore={invalid.length > 5}
        />
      )}

      {totalOrphans > 0 && (
        <div style={{ background: "#fff7ed", border: "1px solid #fed7aa", borderRadius: 10, padding: 14, marginBottom: 20 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: C.orange, marginBottom: 8 }}>
            ⚠ Orphan Relationship Risks
          </div>
          {Object.entries(orphanRisks || {})
            .filter(([, items]) => items.length > 0)
            .map(([entity, items]) => (
              <div key={entity} style={{ fontSize: 11, color: "#92400e", marginBottom: 4 }}>
                <strong>{entity}:</strong> {items.length} record(s) reference chain_ids that don't exist
              </div>
            ))}
          <p style={{ fontSize: 11, color: "#92400e", marginTop: 8, lineHeight: 1.5 }}>
            Orphan rows will be tagged as "Orphan Risk" but will NOT block commit. Review them manually.
          </p>
        </div>
      )}

      {/* Commit Mode Selection */}
      <div style={{ background: C.bg, border: "1px solid " + C.border, borderRadius: 10, padding: 16, marginBottom: 24 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 12 }}>Commit Strategy</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
            <input
              type="radio"
              checked={commitMode === "new_only"}
              onChange={() => setCommitMode("new_only")}
              style={{ cursor: "pointer" }}
            />
            <span style={{ fontSize: 12, color: C.text }}>
              <strong>Commit New Only</strong> — Create {newRecords.length} new chain record(s). Skip existing.
            </span>
          </label>
          <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
            <input
              type="radio"
              checked={commitMode === "all"}
              onChange={() => setCommitMode("all")}
              style={{ cursor: "pointer" }}
            />
            <span style={{ fontSize: 12, color: C.text }}>
              <strong>Commit All Valid</strong> — Create new + update {existing.length} existing record(s). Skip invalid/duplicates.
            </span>
          </label>
        </div>
      </div>

      {/* Confirmation Checkbox */}
      <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 10, padding: 14, marginBottom: 24 }}>
        <label style={{ display: "flex", alignItems: "flex-start", gap: 10, cursor: "pointer" }}>
          <input
            type="checkbox"
            checked={confirmed}
            onChange={() => setConfirmed(!confirmed)}
            style={{ marginTop: 3, cursor: "pointer" }}
          />
          <span style={{ fontSize: 12, color: C.text, lineHeight: 1.6 }}>
            <strong>I understand and approve this commit.</strong>
            <div style={{ fontSize: 11, color: C.muted, marginTop: 6 }}>
              • {newRecords.length} new chain record(s) will be created
              <br />
              • {existing.length} existing record(s) will{" "}
              {commitMode === "all" ? "be updated" : "be skipped"}
              <br />
              • {invalid.length} invalid row(s) will be marked for review
              <br />• Import can be rolled back if needed
            </div>
          </span>
        </label>
      </div>

      {/* Action Buttons */}
      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
        <button
          onClick={onCancel}
          style={{
            padding: "10px 20px",
            border: "1px solid " + C.border,
            background: "#fff",
            borderRadius: 6,
            fontSize: 13,
            fontWeight: 600,
            color: C.text,
            cursor: "pointer",
            transition: "all 0.2s",
          }}
          onMouseEnter={(e) => (e.target.style.background = C.bg)}
          onMouseLeave={(e) => (e.target.style.background = "#fff")}
        >
          Cancel
        </button>
        <button
          onClick={handleApprove}
          disabled={!confirmed || isCommitting}
          style={{
            padding: "10px 20px",
            border: "none",
            background: confirmed && !isCommitting ? C.green : C.muted,
            borderRadius: 6,
            fontSize: 13,
            fontWeight: 700,
            color: "#fff",
            cursor: confirmed && !isCommitting ? "pointer" : "not-allowed",
            opacity: confirmed && !isCommitting ? 1 : 0.6,
            transition: "all 0.2s",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <Send className="w-4 h-4" />
          {isCommitting ? "Committing..." : "Commit to Normalized_Chains"}
        </button>
      </div>
    </div>
  );
}

function StatBox({ icon, label, value, color }) {
  return (
    <div style={{ background: "#fff", border: "1px solid " + C.border, borderRadius: 8, padding: 14, textAlign: "center" }}>
      <div style={{ color, marginBottom: 8, display: "flex", justifyContent: "center" }}>
        {icon}
      </div>
      <div style={{ fontSize: 20, fontWeight: 900, color, marginBottom: 4 }}>
        {value}
      </div>
      <div style={{ fontSize: 11, color: C.muted, fontWeight: 600 }}>
        {label}
      </div>
    </div>
  );
}

function SummarySection({ title, icon, color, items, itemKey, detail, note, showMore }) {
  return (
    <div style={{ background: "#fff", border: "1px solid " + C.border, borderRadius: 10, padding: 16, marginBottom: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
        <div style={{ color }}>{icon}</div>
        <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{title}</div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {items.map((item, i) => (
          <div
            key={i}
            style={{
              fontSize: 12,
              color: C.text,
              padding: "8px 10px",
              background: C.bg,
              borderRadius: 6,
              borderLeft: "3px solid " + color,
            }}
          >
            <div style={{ fontWeight: 700, marginBottom: 2 }}>
              {item[itemKey] || "(no id)"}
            </div>
            {detail && item[detail] && (
              <div style={{ fontSize: 11, color: C.muted }}>
                {item[detail]}
              </div>
            )}
          </div>
        ))}
      </div>
      {showMore && (
        <div style={{ fontSize: 11, color: C.muted, marginTop: 8, fontStyle: "italic" }}>
          … and {items.length - 5} more
        </div>
      )}
      {note && (
        <div style={{ fontSize: 11, color: C.muted, marginTop: 10, fontStyle: "italic", paddingTop: 10, borderTop: "1px solid " + C.border }}>
          {note}
        </div>
      )}
    </div>
  );
}