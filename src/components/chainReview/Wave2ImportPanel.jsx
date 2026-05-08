/**
 * Wave2ImportPanel.jsx
 *
 * Admin UI for Wave 2 bulk CSV import pipeline.
 * CHAINS ECOSYSTEM ONLY — admin access required.
 *
 * Flow:
 *  1. Select target entity
 *  2. Paste CSV or JSON
 *  3. Run validation (duplicate check, relationship check, auto-flag preview)
 *  4. Review report
 *  5. Commit (writes new records + auto-flags to DB)
 */

import { useState } from "react";
import {
  parseCSV,
  remapColumns,
  validateBatchForCommit,
  commitBatch,
  IMPORT_TARGETS,
  COLUMN_MAPS,
} from "@/lib/chainWave2ImportEngine";

const C = {
  navy: "#1a3a5c", muted: "#64748b", border: "#e2e8f0",
  bg: "#f8fafc", card: "#fff",
  green: "#16a34a", greenBg: "#f0fdf4",
  amber: "#d97706", amberBg: "#fffbeb",
  red: "#dc2626", redBg: "#fef2f2",
  blue: "#2563eb", blueBg: "#eff6ff",
};

const ENTITY_OPTIONS = [
  { key: "Normalized_Chains",        label: "Normalized Chains (master)" },
  { key: "Manufacturer_Equivalents", label: "Manufacturer Equivalents" },
  { key: "Chain_Dimensions",         label: "Chain Dimensions" },
  { key: "Performance_Data",         label: "Performance Data" },
  { key: "Chain_Attachments",        label: "Chain Attachments" },
  { key: "Chain_Sprockets",          label: "Chain Sprockets" },
  { key: "Chain_Media",              label: "Chain Media" },
  { key: "Chain_Review_Flags",       label: "Review Flags" },
];

const SEVERITY_COLORS = {
  Critical: [C.redBg, C.red],
  High:     ["#fff7ed", "#c2410c"],
  Medium:   [C.amberBg, C.amber],
  Low:      [C.greenBg, C.green],
};

function Pill({ label, bg, color }) {
  return (
    <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 20, background: bg, color, border: `1px solid ${color}22`, whiteSpace: "nowrap" }}>
      {label}
    </span>
  );
}

function SectionHead({ children, color }) {
  return (
    <div style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: 1, color: color || C.muted, marginBottom: 8, marginTop: 4 }}>
      {children}
    </div>
  );
}

function CountBadge({ count, color, bg, label }) {
  return (
    <div style={{ background: bg || C.bg, border: `1px solid ${color}33`, borderRadius: 8, padding: "10px 16px", minWidth: 80, textAlign: "center" }}>
      <div style={{ fontSize: 22, fontWeight: 900, color }}>{count}</div>
      <div style={{ fontSize: 10, fontWeight: 600, color, opacity: 0.75, marginTop: 2 }}>{label}</div>
    </div>
  );
}

// ─── Column Map Helper ────────────────────────────────────────────────────────
function ColumnMapTable({ entityName }) {
  const map = COLUMN_MAPS[entityName];
  if (!map) return null;
  const unique = [...new Set(Object.values(map))];
  return (
    <div style={{ background: C.blueBg, border: "1px solid #bfdbfe", borderRadius: 6, padding: "10px 14px", fontSize: 11 }}>
      <div style={{ fontWeight: 700, color: C.blue, marginBottom: 6 }}>Expected fields for {entityName}:</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
        {unique.map(f => (
          <span key={f} style={{ background: "#fff", border: "1px solid #bfdbfe", borderRadius: 4, padding: "2px 7px", color: C.blue, fontFamily: "monospace", fontSize: 10 }}>
            {f}
          </span>
        ))}
      </div>
      <div style={{ marginTop: 6, color: "#1e40af", fontSize: 10 }}>
        Column headers are auto-remapped — common variations accepted. Use exact field names above for guaranteed mapping.
      </div>
    </div>
  );
}

// ─── Validation Report Display ────────────────────────────────────────────────
function ValidationReport({ report }) {
  const [showDupes, setShowDupes] = useState(false);
  const [showFlags, setShowFlags] = useState(true);
  const [showReady, setShowReady] = useState(false);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {/* Summary row */}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <CountBadge count={report.total} color={C.navy} label="Total Rows" />
        <CountBadge count={report.readyToCommit.length} color={C.green} bg={C.greenBg} label="Ready to Write" />
        <CountBadge count={report.skipped.length} color={C.muted} bg="#f1f5f9" label="Duplicates Skipped" />
        <CountBadge count={report.autoFlags.length} color={report.autoFlags.length > 0 ? C.amber : C.muted} bg={report.autoFlags.length > 0 ? C.amberBg : "#f1f5f9"} label="Auto-Flags" />
        <CountBadge count={report.errors.length} color={report.errors.length > 0 ? C.red : C.green} bg={report.errors.length > 0 ? C.redBg : C.greenBg} label="Errors" />
      </div>

      {/* Errors */}
      {report.errors.length > 0 && (
        <div style={{ background: C.redBg, border: "1px solid #fca5a5", borderRadius: 8, padding: "12px 14px" }}>
          <SectionHead color={C.red}>Errors — Must Fix Before Commit</SectionHead>
          {report.errors.map((e, i) => (
            <div key={i} style={{ fontSize: 12, color: C.red, marginBottom: 3 }}>✗ {e}</div>
          ))}
        </div>
      )}

      {/* Warnings */}
      {report.warnings.length > 0 && (
        <div style={{ background: C.amberBg, border: "1px solid #fbbf24", borderRadius: 8, padding: "12px 14px" }}>
          <SectionHead color={C.amber}>Warnings</SectionHead>
          {report.warnings.map((w, i) => (
            <div key={i} style={{ fontSize: 12, color: C.amber, marginBottom: 3 }}>⚠ {w}</div>
          ))}
        </div>
      )}

      {/* Relationship errors */}
      {report.relationshipErrors.length > 0 && (
        <div style={{ background: C.redBg, border: "1px solid #fca5a5", borderRadius: 8, padding: "12px 14px" }}>
          <SectionHead color={C.red}>Relationship Validation Failures</SectionHead>
          {report.relationshipErrors.map((e, i) => (
            <div key={i} style={{ fontSize: 12, color: C.red, marginBottom: 3 }}>🔗 {e}</div>
          ))}
        </div>
      )}

      {/* Auto-flags preview */}
      {report.autoFlags.length > 0 && (
        <div style={{ background: C.amberBg, border: "1px solid #fbbf24", borderRadius: 8, overflow: "hidden" }}>
          <button onClick={() => setShowFlags(p => !p)}
            style={{ width: "100%", padding: "10px 14px", background: "none", border: "none", cursor: "pointer", textAlign: "left", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <SectionHead color={C.amber} style={{ margin: 0 }}>⚑ Auto-Generated Review Flags ({report.autoFlags.length}) — will be written to Chain_Review_Flags</SectionHead>
            <span style={{ fontSize: 11, color: C.amber }}>{showFlags ? "▲ Hide" : "▼ Show"}</span>
          </button>
          {showFlags && (
            <div style={{ padding: "0 14px 12px", display: "flex", flexDirection: "column", gap: 6 }}>
              {report.autoFlags.map((f, i) => {
                const [sevBg, sevFg] = SEVERITY_COLORS[f.severity] || [C.bg, C.muted];
                return (
                  <div key={i} style={{ background: "#fff", border: `1px solid ${sevFg}44`, borderLeft: `3px solid ${sevFg}`, borderRadius: 6, padding: "8px 12px" }}>
                    <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", marginBottom: 3 }}>
                      <Pill label={f.severity} bg={sevBg} color={sevFg} />
                      <span style={{ fontSize: 12, fontWeight: 700, color: C.navy }}>{f.flag_type}</span>
                      <span style={{ fontSize: 11, color: C.muted }}>chain_id: <strong style={{ color: C.navy }}>{f.chain_id}</strong></span>
                    </div>
                    <div style={{ fontSize: 11, color: "#374151", lineHeight: 1.5 }}>{f.description}</div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Duplicates */}
      {report.duplicates.length > 0 && (
        <div style={{ background: "#f1f5f9", border: "1px solid " + C.border, borderRadius: 8, overflow: "hidden" }}>
          <button onClick={() => setShowDupes(p => !p)}
            style={{ width: "100%", padding: "10px 14px", background: "none", border: "none", cursor: "pointer", textAlign: "left", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: 1 }}>
              Duplicate Records Skipped ({report.duplicates.length})
            </span>
            <span style={{ fontSize: 11, color: C.muted }}>{showDupes ? "▲ Hide" : "▼ Show"}</span>
          </button>
          {showDupes && (
            <div style={{ padding: "0 14px 12px", maxHeight: 200, overflowY: "auto" }}>
              {report.duplicates.map((r, i) => (
                <div key={i} style={{ fontSize: 11, fontFamily: "monospace", color: C.muted, padding: "2px 0", borderBottom: "1px solid " + C.border }}>
                  {JSON.stringify(r).slice(0, 120)}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Ready-to-commit preview */}
      {report.readyToCommit.length > 0 && (
        <div style={{ background: C.greenBg, border: "1px solid #86efac", borderRadius: 8, overflow: "hidden" }}>
          <button onClick={() => setShowReady(p => !p)}
            style={{ width: "100%", padding: "10px 14px", background: "none", border: "none", cursor: "pointer", textAlign: "left", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: C.green, textTransform: "uppercase", letterSpacing: 1 }}>
              ✓ Records Ready to Commit ({report.readyToCommit.length})
            </span>
            <span style={{ fontSize: 11, color: C.green }}>{showReady ? "▲ Hide" : "▼ Show"}</span>
          </button>
          {showReady && (
            <div style={{ padding: "0 14px 12px", maxHeight: 260, overflowY: "auto" }}>
              {report.readyToCommit.slice(0, 50).map((r, i) => (
                <div key={i} style={{ fontSize: 11, fontFamily: "monospace", color: "#166534", padding: "2px 0", borderBottom: "1px solid #bbf7d0" }}>
                  {JSON.stringify(r).slice(0, 120)}
                </div>
              ))}
              {report.readyToCommit.length > 50 && (
                <div style={{ fontSize: 11, color: C.green, marginTop: 6 }}>… and {report.readyToCommit.length - 50} more</div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Commit Result Display ────────────────────────────────────────────────────
function CommitResult({ result }) {
  return (
    <div style={{ background: result.success ? C.greenBg : C.redBg, border: `1px solid ${result.success ? "#86efac" : "#fca5a5"}`, borderRadius: 8, padding: "16px 18px" }}>
      <div style={{ fontSize: 15, fontWeight: 800, color: result.success ? C.green : C.red, marginBottom: 10 }}>
        {result.success ? "✓ Commit Successful" : "✗ Commit Completed with Errors"}
      </div>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 10 }}>
        <CountBadge count={result.committed} color={C.green} bg={C.greenBg} label="Written" />
        <CountBadge count={result.skipped} color={C.muted} bg="#f1f5f9" label="Skipped" />
        <CountBadge count={result.flagsCreated} color={C.amber} bg={C.amberBg} label="Flags Written" />
      </div>
      {result.errors.length > 0 && (
        <div>
          {result.errors.map((e, i) => (
            <div key={i} style={{ fontSize: 12, color: C.red, marginBottom: 3 }}>✗ {e}</div>
          ))}
        </div>
      )}
      <div style={{ fontSize: 11, color: C.muted, marginTop: 8 }}>{result.timestamp}</div>
    </div>
  );
}

// ─── Main Panel ───────────────────────────────────────────────────────────────
export default function Wave2ImportPanel() {
  const [entityName, setEntityName] = useState("Manufacturer_Equivalents");
  const [inputMode, setInputMode] = useState("csv"); // csv | json
  const [rawInput, setRawInput] = useState("");
  const [validating, setValidating] = useState(false);
  const [committing, setCommitting] = useState(false);
  const [report, setReport] = useState(null);
  const [commitResult, setCommitResult] = useState(null);
  const [parseError, setParseError] = useState(null);

  function parseInput() {
    setParseError(null);
    if (inputMode === "csv") {
      const { records, errors } = parseCSV(rawInput);
      if (errors.length > 0) { setParseError(errors.join("; ")); return null; }
      return remapColumns(records, entityName);
    } else {
      try {
        const parsed = JSON.parse(rawInput);
        return Array.isArray(parsed) ? remapColumns(parsed, entityName) : [remapColumns(parsed, entityName)];
      } catch (e) {
        setParseError("Invalid JSON: " + e.message);
        return null;
      }
    }
  }

  async function handleValidate() {
    const records = parseInput();
    if (!records) return;
    setValidating(true);
    setReport(null);
    setCommitResult(null);
    const r = await validateBatchForCommit(records, entityName);
    setReport(r);
    setValidating(false);
  }

  async function handleCommit() {
    if (!report || !report.valid || report.readyToCommit.length === 0) return;
    setCommitting(true);
    const r = await commitBatch(report);
    setCommitResult(r);
    setCommitting(false);
    // Reset for next batch
    setReport(null);
    setRawInput("");
  }

  const canCommit = report && report.valid && report.readyToCommit.length > 0 && !commitResult;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, fontFamily: "'Inter','Segoe UI',sans-serif" }}>
      {/* Info banner */}
      <div style={{ background: C.blueBg, border: "1px solid #bfdbfe", borderRadius: 8, padding: "12px 16px", fontSize: 12, color: "#1e40af", lineHeight: 1.6 }}>
        <strong>Wave 2 Bulk Import</strong> — paste CSV or JSON, select target entity, validate, then commit.
        Duplicate detection, relationship validation, and auto review-flag generation run automatically before any data is written.
        Nothing is written until you click <strong>Commit</strong>.
      </div>

      {/* Entity selector */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, marginBottom: 6, textTransform: "uppercase", letterSpacing: 1 }}>Target Entity</div>
          <select value={entityName} onChange={e => { setEntityName(e.target.value); setReport(null); setCommitResult(null); }}
            style={{ width: "100%", padding: "8px 12px", border: "1px solid " + C.border, borderRadius: 6, fontSize: 13, outline: "none", background: "#fff" }}>
            {ENTITY_OPTIONS.map(opt => (
              <option key={opt.key} value={opt.key}>{opt.label}</option>
            ))}
          </select>
        </div>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, marginBottom: 6, textTransform: "uppercase", letterSpacing: 1 }}>Input Format</div>
          <div style={{ display: "flex", border: "1px solid " + C.border, borderRadius: 6, overflow: "hidden" }}>
            {["csv", "json"].map(mode => (
              <button key={mode} onClick={() => setInputMode(mode)}
                style={{ flex: 1, padding: "8px", background: inputMode === mode ? C.navy : "#fff", color: inputMode === mode ? "#fff" : C.muted, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 700 }}>
                {mode.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Column map hint */}
      <ColumnMapTable entityName={entityName} />

      {/* Input area */}
      <div>
        <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, marginBottom: 6, textTransform: "uppercase", letterSpacing: 1 }}>
          {inputMode === "csv" ? "CSV Data (first row = headers)" : "JSON Array"}
        </div>
        <textarea
          value={rawInput}
          onChange={e => { setRawInput(e.target.value); setReport(null); setCommitResult(null); }}
          placeholder={inputMode === "csv"
            ? `chain_id,brand,brand_part_number,equivalency_type,confidence\nANSI-40,Tsubaki,RS40,Direct,Confirmed\nANSI-80,Donghua,80A-1,Direct,Confirmed`
            : `[\n  { "chain_id": "ANSI-40", "brand": "Tsubaki", "brand_part_number": "RS40" }\n]`}
          rows={8}
          style={{ width: "100%", padding: 12, border: "1px solid " + C.border, borderRadius: 6, fontSize: 12, fontFamily: "monospace", resize: "vertical", outline: "none", boxSizing: "border-box" }}
        />
      </div>

      {parseError && (
        <div style={{ background: C.redBg, border: "1px solid #fca5a5", borderRadius: 6, padding: "10px 14px", fontSize: 12, color: C.red }}>
          ✗ Parse error: {parseError}
        </div>
      )}

      {/* Action buttons */}
      <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
        <button onClick={handleValidate} disabled={!rawInput.trim() || validating}
          style={{ padding: "10px 24px", borderRadius: 8, border: "none", background: !rawInput.trim() || validating ? "#e2e8f0" : C.navy, color: !rawInput.trim() || validating ? C.muted : "#fff", fontSize: 13, fontWeight: 700, cursor: !rawInput.trim() || validating ? "default" : "pointer" }}>
          {validating ? "Validating…" : "Validate →"}
        </button>
        {canCommit && (
          <button onClick={handleCommit} disabled={committing}
            style={{ padding: "10px 24px", borderRadius: 8, border: "none", background: committing ? "#e2e8f0" : C.green, color: committing ? C.muted : "#fff", fontSize: 13, fontWeight: 700, cursor: committing ? "default" : "pointer" }}>
            {committing ? "Committing…" : `Commit ${report.readyToCommit.length} Records →`}
          </button>
        )}
        {report && !canCommit && !commitResult && report.valid && report.readyToCommit.length === 0 && (
          <span style={{ fontSize: 13, color: C.muted }}>All rows are duplicates — nothing new to commit.</span>
        )}
      </div>

      {/* Validation report */}
      {report && <ValidationReport report={report} />}

      {/* Commit result */}
      {commitResult && <CommitResult result={commitResult} />}
    </div>
  );
}