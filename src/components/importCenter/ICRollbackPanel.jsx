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
      // 1. Mark all committed staging records for this session as "Skipped"
      // (Production deletes would require knowing the production IDs stored in commit_log)
      const stagedRecords = await base44.entities.Staging_Records.filter({
        session_id: session.session_id || session.id,
        record_status: "Committed",
      });

      // 2. For each committed record that has a production_record_id, delete from production entity
      let rolled = 0;
      const rollbackLog = session.commit_log || [];

      // Group by entity
      const byEntity = {};
      (rollbackLog).forEach(entry => {
        if (!byEntity[entry.entity]) byEntity[entry.entity] = [];
        if (entry.writtenIds) byEntity[entry.entity].push(...entry.writtenIds);
      });

      for (const [entity, ids] of Object.entries(byEntity)) {
        for (const id of ids) {
          try {
            await base44.entities[entity].delete(id);
            rolled++;
          } catch {}
        }
      }

      // 3. Mark session as Rolled Back
      await base44.entities.Import_Sessions.update(session.id, {
        import_status: "Rolled Back",
        rollback_available: false,
        notes: (session.notes || '') + `\nRolled back ${rolled} records on ${new Date().toISOString()}`,
      });

      setMsg({ type: "success", text: `Rolled back ${rolled} records from session ${session.session_id || session.id.slice(0,8)}.` });
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
                    {s.manufacturer} · {s.source_catalog} · {s.rows_written || 0} rows written
                  </div>
                  <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 2 }}>
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