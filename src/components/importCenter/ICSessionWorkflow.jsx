/**
 * ICSessionWorkflow — Full session lifecycle: Upload → Stage → Validate → Review → Commit
 * One session, one entity target (multi-target via multiple sessions or future batching).
 */
import { useState } from "react";
import { base44 } from "@/api/base44Client";
import {
  generateSessionId, parseCSV, parseJSON, parseXLSX,
  applyMapping, classifyRecord, generateAutoFlags, chunkArray, CHUNK_SIZE,
} from "@/lib/importCenterEngine";
import ICUploadZone from "./ICUploadZone";
import ICColumnMapper from "./ICColumnMapper";
import ICDiffViewer from "./ICDiffViewer";

const STEPS = ["Upload", "Configure", "Stage & Validate", "Review & Commit", "Done"];

function StepBar({ current }) {
  return (
    <div style={{ display: "flex", gap: 0, marginBottom: 28 }}>
      {STEPS.map((s, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <div key={s} style={{ flex: 1, display: "flex", alignItems: "center" }}>
            <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
              <div style={{
                width: 30, height: 30, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                background: done ? "#22c55e" : active ? "#0C2340" : "#e2e8f0",
                color: done || active ? "#fff" : "#94a3b8",
                fontSize: 12, fontWeight: 800, transition: "all 0.2s",
              }}>
                {done ? "✓" : i + 1}
              </div>
              <div style={{ fontSize: 10, fontWeight: active ? 800 : 500, color: active ? "#0C2340" : done ? "#22c55e" : "#94a3b8", whiteSpace: "nowrap" }}>
                {s}
              </div>
            </div>
            {i < STEPS.length - 1 && (
              <div style={{ flex: 1, height: 2, background: done ? "#22c55e" : "#e2e8f0", marginBottom: 16, transition: "all 0.2s" }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function ICSessionWorkflow({ onBack, onSessionCreated }) {
  const [step, setStep] = useState(0);
  const [files, setFiles] = useState([]);
  const [parsedFiles, setParsedFiles] = useState([]);   // { name, headers, rows, ext, sheets? }[]
  const [xlsxSheets, setXlsxSheets] = useState(null);  // sheets from XLSX — null when not needed
  const [xlsxFileName, setXlsxFileName] = useState(""); // which file the sheets came from
  const [entityTarget, setEntityTarget] = useState("Normalized_Chains");
  const [manufacturer, setManufacturer] = useState("");
  const [sourceCatalog, setSourceCatalog] = useState("");
  const [session, setSession] = useState(null);    // Import_Sessions record
  const [stagedRecords, setStagedRecords] = useState([]); // Staging_Records[]
  const [progress, setProgress] = useState(null);
  const [error, setError] = useState(null);
  const [committing, setCommitting] = useState(false);
  const [commitResult, setCommitResult] = useState(null);

  // ── Step 0: File upload ───────────────────────────────────────────────────

  async function handleFiles(fileList) {
    setFiles(fileList);
    setError(null);
    setXlsxSheets(null);
    const parsed = [];
    for (const f of fileList) {
      const ext = f.name.split('.').pop().toLowerCase();
      try {
        if (ext === 'json') {
          const text = await f.text();
          const { headers, rows } = parseJSON(text);
          parsed.push({ name: f.name, headers, rows, ext: 'json' });
        } else if (ext === 'csv') {
          const text = await f.text();
          const { headers, rows } = parseCSV(text);
          parsed.push({ name: f.name, headers, rows, ext: 'csv' });
        } else if (ext === 'xlsx' || ext === 'xls') {
          const buf = await f.arrayBuffer();
          const sheets = parseXLSX(buf);
          if (sheets.length === 1) {
            // Single sheet — use it directly
            parsed.push({ name: f.name, headers: sheets[0].headers, rows: sheets[0].rows, ext: 'xlsx', sheetName: sheets[0].name });
          } else {
            // Multiple sheets — prompt user to pick
            setXlsxSheets(sheets);
            setXlsxFileName(f.name);
            // Don't advance step yet — wait for sheet selection
            setParsedFiles(parsed);
            return;
          }
        }
      } catch (e) {
        setError(`Error parsing ${f.name}: ${e.message}`);
      }
    }
    setParsedFiles(parsed);
    if (parsed.length > 0) setStep(1);
  }

  function handleSheetSelected(sheet) {
    const entry = { name: xlsxFileName, headers: sheet.headers, rows: sheet.rows, ext: 'xlsx', sheetName: sheet.name };
    const updated = [...parsedFiles, entry];
    setParsedFiles(updated);
    setXlsxSheets(null);
    setXlsxFileName("");
    if (updated.length > 0) setStep(1);
  }

  // ── Step 1: Configure & map ───────────────────────────────────────────────

  const allHeaders = [...new Set(parsedFiles.flatMap(p => p.headers))];
  const totalRows = parsedFiles.reduce((s, p) => s + p.rows.length, 0);

  // ── Step 2: Stage & Validate ──────────────────────────────────────────────

  async function handleMappingReady(mappingRules, transformRules) {
    setError(null);
    setProgress("Creating import session…");
    setStep(2);

    let user;
    try { user = await base44.auth.me(); } catch {}

    const sessionId = generateSessionId();

    // Create session record
    const sess = await base44.entities.Import_Sessions.create({
      session_id: sessionId,
      manufacturer: manufacturer || "Unknown",
      source_catalog: sourceCatalog || "Unknown",
      uploaded_by: user?.email || "admin",
      uploaded_at: new Date().toISOString(),
      entity_targets: [entityTarget],
      source_files: parsedFiles.map(p => ({ name: p.name, rowCount: p.rows.length })),
      total_rows: totalRows,
      import_status: "Staged",
    });
    setSession(sess);
    if (onSessionCreated) onSessionCreated(sess);

    // Fetch existing production records for classification
    setProgress("Fetching production records for diff…");
    let existingRecords = [];
    try {
      existingRecords = await base44.asServiceRole?.entities?.[entityTarget]?.list("-updated_date", 5000)
        || await base44.entities[entityTarget].list("-updated_date", 5000);
    } catch {}

    // Stage all rows in chunks
    const allRows = parsedFiles.flatMap(p => p.rows.map(r => ({ row: r, file: p.name })));
    const chunks = chunkArray(allRows, 100);
    const staged = [];
    let processed = 0;

    for (const chunk of chunks) {
      const chunkRecords = chunk.map(({ row, file }) => {
        const mapped = applyMapping(row, mappingRules, transformRules);
        const { status, conflictDetail, diffSummary, productionRecordId } = classifyRecord(mapped, entityTarget, existingRecords);
        return {
          session_id: sessionId,
          entity_target: entityTarget,
          row_index: processed++,
          source_file: file,
          raw_data: row,
          mapped_data: mapped,
          record_status: status,
          diff_summary: diffSummary || {},
          conflict_detail: conflictDetail || "",
          production_record_id: productionRecordId || "",
          commit_decision: "Pending",
        };
      });

      // Bulk create staging records
      for (const r of chunkRecords) {
        const created = await base44.entities.Staging_Records.create(r);
        staged.push(created);
        await delay(120);
      }
      setProgress(`Staged ${staged.length} / ${allRows.length} rows…`);
      await delay(400);
    }

    // Compute counts
    const counts = {};
    staged.forEach(r => { counts[r.record_status] = (counts[r.record_status] || 0) + 1; });

    // Update session stats
    await base44.entities.Import_Sessions.update(sess.id, {
      rows_staged: staged.length,
      import_status: "Pending Review",
      validation_report: counts,
    });

    setStagedRecords(staged);
    setProgress(null);
    setStep(3);
  }

  // ── Step 3: Per-record decisions ──────────────────────────────────────────

  async function handleDecision(recordId, decision) {
    setStagedRecords(prev => prev.map(r => r.id === recordId ? { ...r, commit_decision: decision } : r));
    // Persist decision
    await base44.entities.Staging_Records.update(recordId, { commit_decision: decision });
  }

  async function handleBulkDecision(status, decision) {
    const toUpdate = stagedRecords.filter(r => r.record_status === status);
    setStagedRecords(prev => prev.map(r => r.record_status === status ? { ...r, commit_decision: decision } : r));
    for (const r of toUpdate) {
      await base44.entities.Staging_Records.update(r.id, { commit_decision: decision });
    }
  }

  // ── Step 3 → 4: Commit ────────────────────────────────────────────────────

  const delay = (ms) => new Promise(res => setTimeout(res, ms));

  async function handleCommit() {
    setCommitting(true);
    setError(null);
    setProgress("Starting commit…");

    await base44.entities.Import_Sessions.update(session.id, { import_status: "Committing" });

    const toCommit = stagedRecords.filter(r =>
      r.commit_decision === "Include" || (r.record_status === "New" && r.commit_decision !== "Skip")
    );

    // ── Pre-commit: snapshot all Changed/Conflict originals for rollback ──────
    setProgress("Capturing pre-commit snapshots for rollback…");
    const rollbackSnapshots = []; // [{ productionId, originalData, stagingRecordId }]

    for (const record of toCommit) {
      if ((record.record_status === "Changed" || record.record_status === "Conflict") && record.production_record_id) {
        try {
          // Fetch current production record in full before we overwrite it
          const existing = await base44.entities[entityTarget].filter({ id: record.production_record_id });
          const original = existing?.[0] || null;
          if (original) {
            rollbackSnapshots.push({
              productionId: record.production_record_id,
              stagingRecordId: record.id,
              originalData: { ...original },
            });
          }
        } catch {}
      }
    }

    // ── Chunked commit ────────────────────────────────────────────────────────
    const chunks = chunkArray(toCommit, CHUNK_SIZE);
    let written = 0;
    let failed = 0;
    let flagsGenerated = 0;
    // commitLog entries: { chunk, entity, newIds: [...], updatedIds: [...], timestamp }
    const commitLog = [];

    for (let ci = 0; ci < chunks.length; ci++) {
      const chunk = chunks[ci];
      setProgress(`Committing chunk ${ci + 1}/${chunks.length} (${written}/${toCommit.length} written)…`);
      const newIds = [];
      const updatedIds = [];

      for (const record of chunk) {
        try {
          let result;
          if (record.record_status === "New") {
            result = await base44.entities[entityTarget].create(record.mapped_data);
            if (result?.id) newIds.push(result.id);
          } else if (record.record_status === "Changed" || record.record_status === "Conflict") {
            if (record.production_record_id) {
              result = await base44.entities[entityTarget].update(record.production_record_id, record.mapped_data);
              updatedIds.push(record.production_record_id);
            }
          }

          // Auto-flags
          const flags = generateAutoFlags(record.mapped_data, record.record_status, record.conflict_detail, entityTarget);
          for (const flag of flags) {
            await base44.entities.Chain_Review_Flags.create(flag);
            flagsGenerated++;
            await delay(120);
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
        await delay(150);
      }
      if (ci < chunks.length - 1) await delay(500);

      commitLog.push({
        chunk: ci + 1,
        entity: entityTarget,
        newIds,       // created records — delete on rollback
        updatedIds,   // overwritten records — restore from snapshot on rollback
        timestamp: new Date().toISOString(),
      });
    }

    const skipped = stagedRecords.filter(r => r.record_status === "Duplicate" || r.commit_decision === "Skip").length;

    await base44.entities.Import_Sessions.update(session.id, {
      import_status: failed === 0 ? "Committed" : "Partially Committed",
      rows_written: written,
      failed_rows: failed,
      duplicates_skipped: skipped,
      flags_generated: flagsGenerated,
      rollback_available: written > 0,
      commit_log: commitLog,
      rollback_snapshot_ref: JSON.stringify(rollbackSnapshots), // full originals stored here
    });

    setCommitResult({ written, failed, skipped, flagsGenerated });
    setProgress(null);
    setCommitting(false);
    setStep(4);
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div>
      {/* Back */}
      <button onClick={onBack} style={{ background: "#f1f5f9", border: "1px solid #e2e8f0", borderRadius: 7, padding: "6px 14px", fontSize: 12, fontWeight: 600, cursor: "pointer", marginBottom: 20, color: "#475569" }}>
        ← All Sessions
      </button>

      <div style={{ fontSize: 20, fontWeight: 900, color: "#0C2340", marginBottom: 24 }}>New Import Session</div>

      <StepBar current={step} />

      {error && (
        <div style={{ background: "#fef2f2", border: "1px solid #fca5a5", borderRadius: 8, padding: "10px 16px", marginBottom: 16, color: "#dc2626", fontSize: 12, fontWeight: 700 }}>
          ⚠ {error}
        </div>
      )}

      {progress && (
        <div style={{ background: "#eff6ff", border: "1px solid #93c5fd", borderRadius: 8, padding: "10px 16px", marginBottom: 16, color: "#1d4ed8", fontSize: 12, fontWeight: 600 }}>
          ⏳ {progress}
        </div>
      )}

      {/* Step 0: Upload */}
      {step === 0 && (
        <div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
            <div>
              <label style={labelStyle}>Manufacturer *</label>
              <input value={manufacturer} onChange={e => setManufacturer(e.target.value)}
                placeholder="e.g. Tsubaki, Donghua, Regina…" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Source Catalog</label>
              <input value={sourceCatalog} onChange={e => setSourceCatalog(e.target.value)}
                placeholder="e.g. Tsubaki ANSI Catalog 2024" style={inputStyle} />
            </div>
          </div>

          <ICUploadZone onFilesSelected={handleFiles} />

          {/* XLSX sheet picker — shown when a multi-sheet workbook is detected */}
          {xlsxSheets && (
            <div style={{ marginTop: 16, background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 10, padding: "16px 20px" }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: "#92400e", marginBottom: 4 }}>
                📊 {xlsxFileName} — {xlsxSheets.length} worksheets detected
              </div>
              <div style={{ fontSize: 11, color: "#78350f", marginBottom: 14 }}>
                Select which worksheet to import:
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {xlsxSheets.map(sheet => (
                  <button
                    key={sheet.name}
                    onClick={() => handleSheetSelected(sheet)}
                    style={{
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                      padding: "10px 16px", background: "#fff", border: "1px solid #fcd34d",
                      borderRadius: 8, cursor: "pointer", textAlign: "left",
                    }}
                  >
                    <span style={{ fontSize: 13, fontWeight: 700, color: "#1e293b" }}>{sheet.name}</span>
                    <span style={{ fontSize: 11, color: "#64748b" }}>
                      {sheet.rows.length.toLocaleString()} rows · {sheet.headers.length} columns
                      {sheet.rows.length === 0 && <span style={{ color: "#dc2626", marginLeft: 6 }}>(empty)</span>}
                    </span>
                  </button>
                ))}
              </div>
              <button
                onClick={() => { setXlsxSheets(null); setXlsxFileName(""); }}
                style={{ marginTop: 12, fontSize: 11, color: "#64748b", background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}
              >
                Cancel — upload different file
              </button>
            </div>
          )}

          {parsedFiles.length > 0 && !xlsxSheets && (
            <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 6 }}>
              {parsedFiles.map(f => (
                <div key={f.name} style={{ padding: "8px 14px", background: "#f0fdf4", border: "1px solid #86efac", borderRadius: 7, fontSize: 12, color: "#166534", fontWeight: 600 }}>
                  ✓ {f.name}{f.sheetName ? ` [${f.sheetName}]` : ''} — {f.rows.length.toLocaleString()} rows, {f.headers.length} columns
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Step 1: Configure mapping */}
      {step === 1 && (
        <div>
          <div style={{ marginBottom: 16, padding: "10px 16px", background: "#f8fafc", borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 12, color: "#475569" }}>
            <strong>{parsedFiles.length} file(s)</strong> · <strong>{totalRows.toLocaleString()} rows</strong> · <strong>{allHeaders.length} unique columns detected</strong>
          </div>
          <ICColumnMapper
            sourceHeaders={allHeaders}
            entityTarget={entityTarget}
            onEntityChange={setEntityTarget}
            onMappingReady={handleMappingReady}
          />
        </div>
      )}

      {/* Step 2: Staging (progress shown via progress bar) */}
      {step === 2 && (
        <div style={{ textAlign: "center", padding: "60px 20px", color: "#64748b" }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>⚙️</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: "#0C2340" }}>Staging & Validating Records</div>
          <div style={{ fontSize: 12, marginTop: 8 }}>{progress || "Processing…"}</div>
        </div>
      )}

      {/* Step 3: Diff viewer */}
      {step === 3 && (
        <div>
          <div style={{ marginBottom: 16, fontSize: 14, fontWeight: 800, color: "#0C2340" }}>
            Review Staged Records — Session {session?.session_id}
          </div>
          <ICDiffViewer
            records={stagedRecords}
            onDecision={handleDecision}
            onBulkDecision={handleBulkDecision}
            onCommit={handleCommit}
            committing={committing}
          />
        </div>
      )}

      {/* Step 4: Done */}
      {step === 4 && commitResult && (
        <div style={{ textAlign: "center", padding: "48px 20px" }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>✅</div>
          <div style={{ fontSize: 22, fontWeight: 900, color: "#0C2340", marginBottom: 10 }}>Import Complete</div>
          <div style={{ display: "inline-flex", gap: 24, flexWrap: "wrap", justifyContent: "center", marginBottom: 24 }}>
            <Stat label="Written" value={commitResult.written} color="#22c55e" />
            <Stat label="Skipped" value={commitResult.skipped} color="#94a3b8" />
            <Stat label="Failed" value={commitResult.failed} color="#ef4444" />
            <Stat label="Flags Generated" value={commitResult.flagsGenerated} color="#f59e0b" />
          </div>
          <div style={{ fontSize: 12, color: "#64748b", marginBottom: 24 }}>
            Session <strong>{session?.session_id}</strong> — rollback snapshot saved.
          </div>
          <button onClick={onBack} style={{ background: "#0C2340", color: "#fff", border: "none", borderRadius: 8, padding: "10px 24px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
            ← Back to Sessions
          </button>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value, color }) {
  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ fontSize: 36, fontWeight: 900, color }}>{value}</div>
      <div style={{ fontSize: 11, color: "#64748b", fontWeight: 600 }}>{label}</div>
    </div>
  );
}

const labelStyle = { fontSize: 11, fontWeight: 700, color: "#475569", display: "block", marginBottom: 4 };
const inputStyle = { width: "100%", padding: "8px 12px", border: "1px solid #e2e8f0", borderRadius: 7, fontSize: 12, color: "#1e293b", boxSizing: "border-box", outline: "none" };