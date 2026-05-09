/**
 * ICSessionList — Lists all import sessions with status, action buttons, drill-in
 */
import { SESSION_STATUS_COLORS } from "@/lib/importCenterEngine";

const S = {
  navy: "#0C2340", muted: "#64748b", border: "#e2e8f0",
};

// Statuses with specific action CTAs
const STATUS_ACTIONS = {
  "Pending Review":       { label: "▶ Resume Review",    style: { background: "#0C2340", color: "#fff" } },
  "Partially Committed":  { label: "↺ Continue Commit",  style: { background: "#7c3aed", color: "#fff" } },
  "Failed":               { label: "⚠ Retry Failed",     style: { background: "#dc2626", color: "#fff" } },
  "Committed":            { label: "🔍 Inspect",          style: { background: "#f1f5f9", color: "#334155" } },
  "Rolled Back":          { label: "🔍 View",             style: { background: "#f1f5f9", color: "#334155" } },
};

function StatusPill({ status }) {
  const color = SESSION_STATUS_COLORS[status] || "#94a3b8";
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      background: `${color}18`, color, border: `1px solid ${color}55`,
      borderRadius: 99, padding: "3px 10px", fontSize: 11, fontWeight: 700,
    }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: color, display: "inline-block" }} />
      {status}
    </span>
  );
}

export default function ICSessionList({ sessions, loading, onSelect, onNew }) {
  return (
    <div>
      {/* Header row */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 900, color: S.navy }}>Import Sessions</div>
          <div style={{ fontSize: 12, color: S.muted, marginTop: 2 }}>All governed ingestion sessions for UniKatalog</div>
        </div>
        <button onClick={onNew} style={btnPrimary}>+ New Import Session</button>
      </div>

      {/* Table */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "48px 0", color: S.muted }}>Loading sessions…</div>
      ) : sessions.length === 0 ? (
        <div style={emptyBox}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>📦</div>
          <div style={{ fontSize: 15, fontWeight: 700, color: S.navy, marginBottom: 6 }}>No import sessions yet</div>
          <div style={{ fontSize: 12, color: S.muted, marginBottom: 20 }}>Start a new import session to ingest catalog data into UniKatalog.</div>
          <button onClick={onNew} style={btnPrimary}>Start First Import</button>
        </div>
      ) : (
        <div style={{ background: "#fff", borderRadius: 12, border: `1px solid ${S.border}`, overflow: "hidden" }}>
          {/* Col headers */}
          <div style={rowStyle(true)}>
            {["Session ID", "Manufacturer", "Target", "Status", "Rows", "Written", "Failed", "Flags", "Date", "Action"].map((h, i) => (
              <div key={i} style={{ fontSize: 10, fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.5px" }}>{h}</div>
            ))}
          </div>

          {sessions.map((s, i) => {
            const action = STATUS_ACTIONS[s.import_status];
            const hasFailed = (s.failed_rows || 0) > 0;
            return (
              <div key={s.id}
                style={{ ...rowStyle(false), background: i % 2 === 0 ? "#fff" : "#fafafa", cursor: "pointer", transition: "background 0.1s" }}
                onClick={() => onSelect(s)}
                onMouseEnter={e => e.currentTarget.style.background = "#f0f9ff"}
                onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? "#fff" : "#fafafa"}
              >
                <div style={{ fontFamily: "monospace", fontSize: 11, color: S.navy, fontWeight: 700 }}>
                  {s.session_id || s.id?.slice(0, 8)}
                </div>
                <div style={{ fontSize: 12, fontWeight: 600, color: "#1e293b" }}>{s.manufacturer || "—"}</div>
                <div style={{ fontSize: 11, color: S.muted, fontFamily: "monospace" }}>{s.entity_targets?.[0] || "—"}</div>
                <div><StatusPill status={s.import_status || "Uploading"} /></div>
                <div style={{ fontSize: 12, color: "#334155" }}>{(s.total_rows || 0).toLocaleString()}</div>
                <div style={{ fontSize: 12, color: "#166534", fontWeight: 700 }}>{(s.rows_written || 0).toLocaleString()}</div>
                <div style={{ fontSize: 12, color: hasFailed ? "#dc2626" : S.muted, fontWeight: hasFailed ? 700 : 400 }}>
                  {s.failed_rows || 0}
                </div>
                <div style={{ fontSize: 12, color: s.flags_generated > 0 ? "#b45309" : S.muted, fontWeight: s.flags_generated > 0 ? 700 : 400 }}>
                  {s.flags_generated || 0}
                </div>
                <div style={{ fontSize: 11, color: S.muted }}>
                  {s.uploaded_at
                    ? new Date(s.uploaded_at).toLocaleDateString()
                    : s.created_date
                      ? new Date(s.created_date).toLocaleDateString()
                      : "—"}
                </div>
                <div onClick={e => e.stopPropagation()}>
                  {action ? (
                    <button
                      style={{ ...btnAction, ...action.style }}
                      onClick={() => onSelect(s)}>
                      {action.label}
                    </button>
                  ) : (
                    <button style={btnSmall} onClick={() => onSelect(s)}>Open →</button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function rowStyle(isHeader) {
  return {
    display: "grid",
    gridTemplateColumns: "130px 1fr 120px 150px 60px 70px 60px 50px 90px 130px",
    gap: 10, alignItems: "center",
    padding: "10px 18px",
    borderBottom: isHeader ? "2px solid #e2e8f0" : "1px solid #f1f5f9",
  };
}

const btnPrimary = {
  background: "#0C2340", color: "#fff", border: "none", borderRadius: 8,
  padding: "9px 18px", fontSize: 12, fontWeight: 700, cursor: "pointer",
};
const btnSmall = {
  background: "#eff6ff", color: "#1d4ed8", border: "1px solid #bfdbfe",
  borderRadius: 6, padding: "4px 10px", fontSize: 11, fontWeight: 700, cursor: "pointer",
};
const btnAction = {
  borderRadius: 6, padding: "5px 10px", fontSize: 11, fontWeight: 700,
  cursor: "pointer", border: "none", whiteSpace: "nowrap",
};
const emptyBox = {
  background: "#fff", borderRadius: 12, border: "1px dashed #cbd5e1",
  padding: "60px 20px", textAlign: "center",
};