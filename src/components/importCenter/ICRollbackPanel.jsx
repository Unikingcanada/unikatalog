/**
 * ICRollbackPanel — Lists committed sessions and allows rollback
 * Rollback reverses committed records from staging snapshots
 */
import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { SESSION_STATUS_COLORS } from "@/lib/importCenterEngine";

export default function ICRollbackPanel({ sessions, onRollbackComplete }) {
  const [rolling, setRolling] = useState(null);
  const [msg, setMsg] = useState(null);
  const [confirmId, setConfirmId] = useState(null);

  const committedSessions = sessions.filter(s =>
    ["Committed", "Partially Committed"].includes(s.import_status) && s.rollback_available
  );

  async function handleRollback(session) {
    setRolling(session.id);
    setMsg(null);
    try {
      const commitLog = session.commit_log || [];
      // Parse rollback snapshots (stored as JSON string)
      let rollbackSnapshots = [];
      if (session.rollback_snapshot_ref) {
        try { rollbackSnapshots = JSON.parse(session.rollback_snapshot_ref); } catch {}
      }

      let deleted = 0;
      let restored = 0;
      let stagingMarked = 0;

      // ── 1. Delete all NEW records created by this session ─────────────────
      for (const entry of commitLog) {
        const entity = entry.entity;
        if (!entity || !base44.entities[entity]) continue;
        for (const id of (entry.newIds || [])) {
          try { await base44.entities[entity].delete(id); deleted++; } catch {}
        }
      }

      // ── 2. Restore all UPDATED records to their original state ────────────
      // Group snapshots by entity (commit_log entries carry entity name)
      const entityByUpdatedId = {};
      for (const entry of commitLog) {
        for (const id of (entry.updatedIds || [])) {
          entityByUpdatedId[id] = entry.entity;
        }
      }

      for (const snap of rollbackSnapshots) {
        const entity = entityByUpdatedId[snap.productionId];
        if (!entity || !base44.entities[entity]) continue;
        // Restore: update back to the captured original, stripping platform-managed fields
        const { id, created_date, updated_date, created_by, ...restorableFields } = snap.originalData;
        try {
          await base44.entities[entity].update(snap.productionId, restorableFields);
          restored++;
        } catch {}
      }

      // ── 3. Mark all committed staging records as Rolled Back ──────────────
      const sessionKey = session.session_id || session.id;
      // Fetch in batches — staging records can be large
      let stagingPage = [];
      try {
        stagingPage = await base44.entities.Staging_Records.filter(
          { session_id: sessionKey, record_status: "Committed" },
          "-created_date", 2000
        );
      } catch {}
      for (const sr of stagingPage) {
        try {
          await base44.entities.Staging_Records.update(sr.id, { record_status: "Skipped", conflict_detail: "Rolled back by admin" });
          stagingMarked++;
        } catch {}
      }

      // ── 4. Update session record ──────────────────────────────────────────
      const auditNote = `\n[ROLLBACK ${new Date().toISOString()}] Deleted ${deleted} new records. Restored ${restored} updated records. Marked ${stagingMarked} staging records.`;
      await base44.entities.Import_Sessions.update(session.id, {
        import_status: "Rolled Back",
        rollback_available: false,
        notes: (session.notes || '') + auditNote,
      });

      setMsg({ type: "success", text: `Rollback complete — ${deleted} deleted, ${restored} restored, ${stagingMarked} staging records marked.` });
      setConfirmId(null);
      onRollbackComplete();
    } catch (e) {
      setMsg({ type: "error", text: "Rollback error: " + e.message });
    } finally {
      setRolling(null);
    }
  }

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 20, fontWeight: 900, color: "#0C2340" }}>Rollback Center</div>
        <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>
          Reverse committed import sessions. Only sessions with rollback snapshots are shown.
        </div>
      </div>

      {msg && (
        <div style={{
          padding: "10px 16px", borderRadius: 8, marginBottom: 16,
          background: msg.type === "success" ? "#f0fdf4" : "#fef2f2",
          border: `1px solid ${msg.type === "success" ? "#86efac" : "#fca5a5"}`,
          color: msg.type === "success" ? "#166534" : "#dc2626",
          fontSize: 12, fontWeight: 700,
        }}>{msg.text}</div>
      )}

      {committedSessions.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 20px", color: "#64748b", background: "#fff", borderRadius: 12, border: "1px dashed #e2e8f0" }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🔒</div>
          <div style={{ fontWeight: 700, fontSize: 14 }}>No rollback-eligible sessions</div>
          <div style={{ fontSize: 12, marginTop: 4 }}>Only committed sessions with snapshots appear here.</div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {committedSessions.map(s => (
            <div key={s.id} style={{ background: "#fff", borderRadius: 10, border: "1px solid #e2e8f0", padding: "16px 20px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: "monospace", fontSize: 12, fontWeight: 700, color: "#0C2340" }}>{s.session_id || s.id?.slice(0,8)}</div>
                  <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>
                    {s.manufacturer} · {s.source_catalog}
                  </div>
                  <div style={{ display: "flex", gap: 12, marginTop: 6, flexWrap: "wrap" }}>
                    {(() => {
                      const log = s.commit_log || [];
                      const newCount = log.reduce((acc, e) => acc + (e.newIds?.length || 0), 0);
                      const updCount = log.reduce((acc, e) => acc + (e.updatedIds?.length || 0), 0);
                      let snapCount = 0;
                      try { snapCount = JSON.parse(s.rollback_snapshot_ref || '[]').length; } catch {}
                      return <>
                        <span style={{ fontSize: 10, color: "#dc2626", fontWeight: 700 }}>🗑 {newCount} to delete</span>
                        <span style={{ fontSize: 10, color: "#1d4ed8", fontWeight: 700 }}>↩ {updCount} to restore ({snapCount} snapshots)</span>
                      </>;
                    })()}
                  </div>
                  <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 4 }}>
                    Committed: {s.uploaded_at ? new Date(s.uploaded_at).toLocaleString() : "—"}
                  </div>
                </div>

                {confirmId === s.id ? (
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <span style={{ fontSize: 11, color: "#dc2626", fontWeight: 700 }}>⚠ Confirm rollback?</span>
                    <button
                      onClick={() => handleRollback(s)}
                      disabled={rolling === s.id}
                      style={{ background: "#dc2626", color: "#fff", border: "none", borderRadius: 7, padding: "7px 16px", fontSize: 11, fontWeight: 800, cursor: "pointer" }}>
                      {rolling === s.id ? "Rolling back…" : "Yes, Rollback"}
                    </button>
                    <button onClick={() => setConfirmId(null)}
                      style={{ background: "#f1f5f9", color: "#475569", border: "1px solid #e2e8f0", borderRadius: 7, padding: "7px 14px", fontSize: 11, fontWeight: 600, cursor: "pointer" }}>
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button onClick={() => setConfirmId(s.id)}
                    style={{ background: "#fff7ed", color: "#c2410c", border: "1px solid #fed7aa", borderRadius: 7, padding: "7px 16px", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>
                    ↩ Rollback Session
                  </button>
                )}
              </div>

              {s.notes && (
                <div style={{ marginTop: 10, fontSize: 10, color: "#64748b", background: "#f8fafc", padding: "6px 10px", borderRadius: 6, fontFamily: "monospace" }}>
                  {s.notes}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}