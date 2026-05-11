/**
 * ICSessionWorkflow — Upload → Configure → (server-side stage+validate) → Review → (server-side commit)
 *
 * ALL heavy processing runs server-side via backend functions.
 * The UI only:
 *   1. Parses files in-browser (unavoidable — files can't be transferred any other way)
 *   2. Launches the background job once
 *   3. Polls session status every 3s — safe to navigate away and return
 */
import { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import {
  generateSessionId, parseCSV, parseJSON, parseXLSX,
} from "@/lib/importCenterEngine";
import { importCommitJob } from "@/functions/importCommitJob";
import { saveImportPayload, runChunkLoop, CHUNK_SIZE } from "@/lib/stagingEngine";
import ICUploadZone from "./ICUploadZone";
import ICColumnMapper from "./ICColumnMapper";
import ICDiffViewer from "./ICDiffViewer";

const STEPS = ["Upload", "Configure", "Staging", "Review & Commit", "Done"];

// ─── Step bar ──────────────────────────────────────────────────────────────────
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
                width: 30, height: 30, borderRadius: "50%",
                display: "flex", alignItems: "center", justifyContent: "center",
                background: done ? "#22c55e" : active ? "#0C2340" : "#e2e8f0",
                color: done || active ? "#fff" : "#94a3b8",
                fontSize: 12, fontWeight: 800, transition: "all 0.2s",
              }}>
                {done ? "✓" : i + 1}
              </div>
              <div style={{
                fontSize: 10, fontWeight: active ? 800 : 500,
                color: active ? "#0C2340" : done ? "#22c55e" : "#94a3b8",
                whiteSpace: "nowrap",
              }}>
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

// ─── Progress stats row ────────────────────────────────────────────────────────
function ProgressStats({ report, totalRows }) {
  if (!report) return null;
  const detected = report.total_detected || totalRows || 0;
  const processed = report.total_processed || report.pct != null ? Math.round((report.pct / 100) * detected) : 0;
  const stats = [
    { label: "Detected", value: detected, color: "#64748b" },
    { label: "Processed", value: report.total_processed ?? processed, color: "#3b82f6" },
    { label: "Staged", value: report.total_staged ?? (report.New + report.Duplicate + report.Changed + report.Conflict + report.Invalid || 0), color: "#8b5cf6" },
    { label: "New", value: report.New || 0, color: "#22c55e" },
    { label: "Duplicate", value: report.Duplicate || 0, color: "#eab308" },
    { label: "Changed", value: report.Changed || 0, color: "#3b82f6" },
    { label: "Conflict", value: report.Conflict || 0, color: "#ef4444" },
    { label: "Invalid", value: report.Invalid || 0, color: "#f97316" },
    { label: "Failed", value: report.Failed || 0, color: "#dc2626" },
  ];
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 16 }}>
      {stats.map(s => (
        <div key={s.label} style={{ textAlign: "center", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 8, padding: "8px 14px", minWidth: 72 }}>
          <div style={{ fontSize: 22, fontWeight: 900, color: s.color, lineHeight: 1 }}>{s.value ?? "—"}</div>
          <div style={{ fontSize: 9, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", marginTop: 2 }}>{s.label}</div>
        </div>
      ))}
    </div>
  );
}

// ─── Commit stats row ──────────────────────────────────────────────────────────
function CommitStats({ sess }) {
  if (!sess) return null;
  const stats = [
    { label: "Written", value: sess.rows_written ?? 0, color: "#22c55e" },
    { label: "Skipped", value: sess.duplicates_skipped ?? 0, color: "#94a3b8" },
    { label: "Failed", value: sess.failed_rows ?? 0, color: "#ef4444" },
    { label: "Flags", value: sess.flags_generated ?? 0, color: "#f59e0b" },
    { label: "Total Staged", value: sess.rows_staged ?? 0, color: "#3b82f6" },
  ];
  return (
    <div style={{ display: "flex", gap: 24, flexWrap: "wrap", justifyContent: "center", marginBottom: 24 }}>
      {stats.map(s => (
        <div key={s.label} style={{ textAlign: "center" }}>
          <div style={{ fontSize: 36, fontWeight: 900, color: s.color }}>{s.value}</div>
          <div style={{ fontSize: 11, color: "#64748b", fontWeight: 600 }}>{s.label}</div>
        </div>
      ))}
    </div>
  );
}

// ─── Processing monitor (shown during step 2 — chunk-loop staging) ─────────────
function StagingMonitor({ session, allRows, mappingRules, transformRules, onReady }) {
  const [liveSession, setLiveSession] = useState(session);
  const [localPct, setLocalPct] = useState(0);
  const [localReport, setLocalReport] = useState({});
  const [error, setError] = useState(null);
  const activeRef = useRef(true);

  useEffect(() => {
    if (!session?.id || !allRows?.length) return;
    activeRef.current = true;

    // Determine resume point from existing session state
    const existingReport = session.validation_report || {};
    const lastChunk = existingReport.last_chunk_index ?? -1;
    const startChunk = lastChunk >= 0 ? lastChunk + 1 : 0;

    runChunkLoop({
      sessionDbId: session.id,
      entityTarget: session.entity_targets?.[0] || "Normalized_Chains",
      rows: allRows,
      mappingRules,
      transformRules,
      startChunkIndex: startChunk,
      chunkSize: 25,
      onProgress: (result) => {
        if (!activeRef.current) return;
        setLocalPct(result.pct || 0);
        setLocalReport(result.counts || {});
        setLiveSession(prev => ({
          ...prev,
          rows_staged: result.totalStaged || 0,
          total_rows: allRows.length,
          validation_report: { ...(prev.validation_report || {}), ...result.counts, pct: result.pct, total_staged: result.totalStaged },
        }));
      },
      onError: (msg) => {
        if (!activeRef.current) return;
        setError(msg);
      },
      onDone: async (result) => {
        if (!activeRef.current) return;
        setLocalPct(100);
        // Fetch the final session from DB and advance
        try {
          const sessions = await base44.entities.Import_Sessions.filter({ id: session.id });
          if (sessions?.[0]) onReady(sessions[0]);
        } catch { onReady({ ...session, import_status: "Pending Review" }); }
      },
    });

    return () => { activeRef.current = false; };
  }, [session?.id]);

  const total = allRows?.length || liveSession?.total_rows || 0;
  const staged = liveSession?.rows_staged || 0;
  const pct = localPct || (total > 0 ? Math.min(100, Math.round((staged / total) * 100)) : 0);
  const report = { ...liveSession?.validation_report, ...localReport };
  const isFailed = !!error;

  return (
    <div style={{ padding: "40px 20px" }}>
      <div style={{ textAlign: "center", marginBottom: 28 }}>
        <div style={{ fontSize: 48, marginBottom: 10 }}>{isFailed ? "❌" : "⚙️"}</div>
        <div style={{ fontSize: 18, fontWeight: 800, color: "#0C2340" }}>
          {isFailed ? "Staging Failed" : "Staging & Validation"}
        </div>
        <div style={{ fontSize: 12, color: "#64748b", marginTop: 6 }}>
          {isFailed
            ? error
            : "Processing one chunk at a time — resilient to timeouts. Safe to leave this page open."}
        </div>
      </div>

      <div style={{ background: "#e2e8f0", borderRadius: 99, height: 10, maxWidth: 500, margin: "0 auto 12px", overflow: "hidden" }}>
        <div style={{
          height: "100%", borderRadius: 99, transition: "width 0.4s ease",
          width: pct + "%",
          background: isFailed ? "#ef4444" : "linear-gradient(90deg,#3b82f6,#8b5cf6)",
        }} />
      </div>
      <div style={{ textAlign: "center", fontSize: 12, color: "#64748b", marginBottom: 8 }}>
        {isFailed ? "Process halted" : `${staged.toLocaleString()} / ${total.toLocaleString()} rows staged (${pct}%)`}
      </div>

      <ProgressStats report={report} totalRows={total} />
    </div>
  );
}

// ─── Commit monitor ────────────────────────────────────────────────────────────
function CommitMonitor({ session, onDone }) {
  const [liveSession, setLiveSession] = useState(session);
  const pollRef = useRef(null);

  useEffect(() => {
    if (!session?.id) return;
    pollRef.current = setInterval(async () => {
      try {
        const sessions = await base44.entities.Import_Sessions.filter({ id: session.id });
        const updated = sessions?.[0];
        if (!updated) return;
        setLiveSession(updated);
        if (updated.import_status === "Committed" || updated.import_status === "Partially Committed" || updated.import_status === "Failed") {
          clearInterval(pollRef.current);
          onDone(updated);
        }
      } catch {}
    }, 3000);
    return () => clearInterval(pollRef.current);
  }, [session?.id]);

  const written = liveSession?.rows_written || 0;
  const staged = liveSession?.rows_staged || 0;
  const pct = staged > 0 ? Math.min(100, Math.round((written / staged) * 100)) : 0;

  return (
    <div style={{ padding: "40px 20px", textAlign: "center" }}>
      <div style={{ fontSize: 48, marginBottom: 10 }}>💾</div>
      <div style={{ fontSize: 18, fontWeight: 800, color: "#0C2340", marginBottom: 6 }}>
        Server-Side Commit Running
      </div>
      <div style={{ fontSize: 12, color: "#64748b", marginBottom: 20 }}>
        Running on the server — safe to close this tab and return later.
      </div>
      <div style={{ background: "#e2e8f0", borderRadius: 99, height: 10, maxWidth: 500, margin: "0 auto 12px", overflow: "hidden" }}>
        <div style={{ height: "100%", borderRadius: 99, width: pct + "%", background: "linear-gradient(90deg,#22c55e,#16a34a)", transition: "width 0.6s ease" }} />
      </div>
      <div style={{ fontSize: 12, color: "#64748b" }}>
        {written.toLocaleString()} / {staged.toLocaleString()} committed ({pct}%)
      </div>
      <div style={{ marginTop: 10 }}>
        <span style={{ display: "inline-block", padding: "3px 12px", borderRadius: 20, fontSize: 11, fontWeight: 700, background: "#eff6ff", color: "#1d4ed8" }}>
          Status: {liveSession?.import_status || "Committing"}
        </span>
      </div>
    </div>
  );
}

// ─── Main workflow ─────────────────────────────────────────────────────────────
export default function ICSessionWorkflow({ onBack, onSessionCreated }) {
  const [step, setStep] = useState(0);
  const [parsedFiles, setParsedFiles] = useState([]);
  const [xlsxSheets, setXlsxSheets] = useState(null);
  const [xlsxFileName, setXlsxFileName] = useState("");
  const [entityTarget, setEntityTarget] = useState("Normalized_Chains");
  const [manufacturer, setManufacturer] = useState("");
  const [sourceCatalog, setSourceCatalog] = useState("");
  const [session, setSession] = useState(null);
  const [stagedRecords, setStagedRecords] = useState([]);
  const [loadingRecords, setLoadingRecords] = useState(false);
  const [error, setError] = useState(null);
  const [committing, setCommitting] = useState(false);
  const [commitSession, setCommitSession] = useState(null);
  const [doneSession, setDoneSession] = useState(null);
  const [stagingContext, setStagingContext] = useState(null); // { allRows, mappingRules, transformRules }

  const allHeaders = [...new Set(parsedFiles.flatMap(p => p.headers))];
  const totalRows = parsedFiles.reduce((s, p) => s + p.rows.length, 0);

  // ── Step 0: File parsing ───────────────────────────────────────────────────
  async function handleFiles(fileList) {
    setError(null);
    setXlsxSheets(null);
    const parsed = [];
    for (const f of fileList) {
      const ext = f.name.split('.').pop().toLowerCase();
      try {
        if (ext === 'json') {
          const text = await f.text();
          parsed.push({ name: f.name, ...parseJSON(text), ext: 'json' });
        } else if (ext === 'csv') {
          const text = await f.text();
          parsed.push({ name: f.name, ...parseCSV(text), ext: 'csv' });
        } else if (ext === 'xlsx' || ext === 'xls') {
          const buf = await f.arrayBuffer();
          const sheets = parseXLSX(buf);
          if (sheets.length === 1) {
            parsed.push({ name: f.name, headers: sheets[0].headers, rows: sheets[0].rows, ext: 'xlsx', sheetName: sheets[0].name });
          } else {
            setXlsxSheets(sheets);
            setXlsxFileName(f.name);
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
    const updated = [...parsedFiles, { name: xlsxFileName, headers: sheet.headers, rows: sheet.rows, ext: 'xlsx', sheetName: sheet.name }];
    setParsedFiles(updated);
    setXlsxSheets(null);
    setXlsxFileName("");
    if (updated.length > 0) setStep(1);
  }

  // ── Step 1 → 2: Create session + fire background job ──────────────────────
  async function handleMappingReady(mappingRules, transformRules) {
    setError(null);
    setStep(2);

    let user;
    try { user = await base44.auth.me(); } catch {}

    const sessionId = generateSessionId();
    const allRows = parsedFiles.flatMap(p => p.rows.map(r => ({ row: r, file: p.name })));

    // Create the Import_Sessions record first (so the job can reference it)
    let sess;
    try {
      sess = await base44.entities.Import_Sessions.create({
        session_id: sessionId,
        manufacturer: manufacturer || "Unknown",
        source_catalog: sourceCatalog || "Unknown",
        uploaded_by: user?.email || "admin",
        uploaded_at: new Date().toISOString(),
        entity_targets: [entityTarget],
        source_files: parsedFiles.map(p => ({ name: p.name, rowCount: p.rows.length })),
        total_rows: allRows.length,
        import_status: "Staged",
      });
    } catch (e) {
      setError(`Failed to create session: ${e.message}`);
      setStep(1);
      return;
    }

    setSession(sess);
    if (onSessionCreated) onSessionCreated(sess);

    // Persist full payload to DB so resume after page reload never needs re-upload.
    // Fire-and-forget — if it fails, staging still works (just can't resume after reload).
    saveImportPayload({
      sessionId: sess.session_id,
      entityTarget,
      allRows,
      mappingRules,
      transformRules: transformRules || {},
      chunkSize: CHUNK_SIZE,
    }).catch(e => console.warn("Payload persist failed:", e));

    // Store in React state for immediate use by StagingMonitor
    setStagingContext({ allRows, mappingRules, transformRules: transformRules || {} });
  }

  // ── Step 2 → 3: Session reached "Pending Review" ──────────────────────────
  async function handleStagingReady(updatedSession) {
    setLoadingRecords(true);
    // Load all staged records (paginated)
    let all = [], skip = 0;
    while (true) {
      const batch = await base44.entities.Staging_Records.filter(
        { session_id: updatedSession.session_id, entity_target: entityTarget },
        "row_index", 1000, skip
      );
      if (!batch || !batch.length) break;
      all = [...all, ...batch];
      if (batch.length < 1000) break;
      skip += batch.length;
    }
    setStagedRecords(all);
    setLoadingRecords(false);
    setStep(3);
  }

  // ── Step 3: Per-record decisions ──────────────────────────────────────────
  async function handleDecision(recordId, decision) {
    setStagedRecords(prev => prev.map(r => r.id === recordId ? { ...r, commit_decision: decision } : r));
    await base44.entities.Staging_Records.update(recordId, { commit_decision: decision });
  }

  async function handleBulkDecision(status, decision) {
    const toUpdate = stagedRecords.filter(r => r.record_status === status);
    setStagedRecords(prev => prev.map(r => r.record_status === status ? { ...r, commit_decision: decision } : r));
    for (const r of toUpdate) {
      await base44.entities.Staging_Records.update(r.id, { commit_decision: decision });
    }
  }

  // ── Step 3 → 4: Fire background commit job ────────────────────────────────
  async function handleCommit() {
    setCommitting(true);
    setError(null);

    // Persist all current decisions to DB first
    // (already saved on each click, but bulk-flush any pending)
    try {
      await base44.entities.Import_Sessions.update(session.id, { import_status: "Committing" });
    } catch {}

    // Fire background commit job
    importCommitJob({
      sessionDbId: session.id,
      entityTarget,
    }).catch(() => {});

    setCommitSession(session);
    setCommitting(false);
    setStep(4); // show CommitMonitor
  }

  // ── Done ──────────────────────────────────────────────────────────────────
  function handleCommitDone(updated) {
    setDoneSession(updated);
  }

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div>
      <button onClick={onBack} style={{ background: "#f1f5f9", border: "1px solid #e2e8f0", borderRadius: 7, padding: "6px 14px", fontSize: 12, fontWeight: 600, cursor: "pointer", marginBottom: 20, color: "#475569" }}>
        ← All Sessions
      </button>
      <div style={{ fontSize: 20, fontWeight: 900, color: "#0C2340", marginBottom: 24 }}>New Import Session</div>

      {/* Show done state inline if commit finished while watching CommitMonitor */}
      {step === 4 && doneSession ? (
        <div style={{ textAlign: "center", padding: "48px 20px" }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>✅</div>
          <div style={{ fontSize: 22, fontWeight: 900, color: "#0C2340", marginBottom: 10 }}>Import Complete</div>
          <CommitStats sess={doneSession} />
          <div style={{ fontSize: 12, color: "#64748b", marginBottom: 24 }}>
            Session <strong>{session?.session_id}</strong> — rollback snapshot saved.
          </div>
          <button onClick={onBack} style={{ background: "#0C2340", color: "#fff", border: "none", borderRadius: 8, padding: "10px 24px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
            ← Back to Sessions
          </button>
        </div>
      ) : (
        <>
          <StepBar current={step} />

          {error && (
            <div style={{ background: "#fef2f2", border: "1px solid #fca5a5", borderRadius: 8, padding: "10px 16px", marginBottom: 16, color: "#dc2626", fontSize: 12, fontWeight: 700 }}>
              ⚠ {error}
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
              {xlsxSheets && (
                <div style={{ marginTop: 16, background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 10, padding: "16px 20px" }}>
                  <div style={{ fontSize: 13, fontWeight: 800, color: "#92400e", marginBottom: 4 }}>
                    📊 {xlsxFileName} — {xlsxSheets.length} worksheets detected
                  </div>
                  <div style={{ fontSize: 11, color: "#78350f", marginBottom: 14 }}>Select which worksheet to import:</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {xlsxSheets.map(sheet => (
                      <button key={sheet.name} onClick={() => handleSheetSelected(sheet)}
                        style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 16px", background: "#fff", border: "1px solid #fcd34d", borderRadius: 8, cursor: "pointer" }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: "#1e293b" }}>{sheet.name}</span>
                        <span style={{ fontSize: 11, color: "#64748b" }}>
                          {sheet.rows.length.toLocaleString()} rows · {sheet.headers.length} columns
                          {sheet.rows.length === 0 && <span style={{ color: "#dc2626", marginLeft: 6 }}>(empty)</span>}
                        </span>
                      </button>
                    ))}
                  </div>
                  <button onClick={() => { setXlsxSheets(null); setXlsxFileName(""); }}
                    style={{ marginTop: 12, fontSize: 11, color: "#64748b", background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}>
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

          {/* Step 2: Chunk-loop staging monitor */}
          {step === 2 && session && stagingContext && (
            <StagingMonitor
              session={session}
              allRows={stagingContext.allRows}
              mappingRules={stagingContext.mappingRules}
              transformRules={stagingContext.transformRules}
              onReady={handleStagingReady}
            />
          )}

          {/* Step 2: Loading staged records after server completes */}
          {step === 2 && !session && (
            <div style={{ textAlign: "center", padding: "60px 20px", color: "#64748b" }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>⚙️</div>
              <div style={{ fontSize: 14 }}>Initializing session…</div>
            </div>
          )}

          {step === 2 && loadingRecords && (
            <div style={{ textAlign: "center", padding: "60px 20px", color: "#64748b" }}>
              <div style={{ fontSize: 14 }}>Loading staged records for review…</div>
            </div>
          )}

          {/* Step 3: Diff viewer */}
          {step === 3 && (
            <div>
              <div style={{ marginBottom: 8, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
                <div style={{ fontSize: 14, fontWeight: 800, color: "#0C2340" }}>
                  Review Staged Records — {session?.session_id}
                </div>
                <div style={{ fontSize: 12, color: "#64748b" }}>
                  {stagedRecords.length.toLocaleString()} records · {session?.validation_report?.total_detected?.toLocaleString() || totalRows.toLocaleString()} detected
                </div>
              </div>

              {/* Staging summary */}
              {session?.validation_report && (
                <ProgressStats report={session.validation_report} totalRows={session.total_rows} />
              )}

              <div style={{ marginTop: 16 }}>
                <ICDiffViewer
                  records={stagedRecords}
                  onDecision={handleDecision}
                  onBulkDecision={handleBulkDecision}
                  onCommit={handleCommit}
                  committing={committing}
                />
              </div>
            </div>
          )}

          {/* Step 4: Commit monitor */}
          {step === 4 && !doneSession && commitSession && (
            <CommitMonitor session={commitSession} onDone={handleCommitDone} />
          )}
        </>
      )}
    </div>
  );
}

const labelStyle = { fontSize: 11, fontWeight: 700, color: "#475569", display: "block", marginBottom: 4 };
const inputStyle = { width: "100%", padding: "8px 12px", border: "1px solid #e2e8f0", borderRadius: 7, fontSize: 12, color: "#1e293b", boxSizing: "border-box", outline: "none" };