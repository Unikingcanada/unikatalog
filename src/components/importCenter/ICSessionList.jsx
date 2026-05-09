/**
 * ICSessionList — Lists all import sessions with status filters, search, sort,
 * quick-action buttons, and persisted filter state.
 */
import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { SESSION_STATUS_COLORS } from "@/lib/importCenterEngine";
import * as XLSX from "xlsx";

// ── Persistence keys ──────────────────────────────────────────────────────────
const LS_FILTER = "ic_session_filter";
const LS_SEARCH = "ic_session_search";
const LS_SORT   = "ic_session_sort";

function lsGet(key, fallback) {
  try { const v = localStorage.getItem(key); return v !== null ? v : fallback; } catch { return fallback; }
}
function lsSet(key, value) {
  try { localStorage.setItem(key, value); } catch {}
}

// ── Constants ─────────────────────────────────────────────────────────────────
const STATUS_FILTERS = [
  "All", "Pending Review", "Staged", "Committing",
  "Partially Committed", "Committed", "Failed", "Rolled Back",
];

const SORT_OPTIONS = [
  { value: "newest",      label: "Newest First" },
  { value: "oldest",      label: "Oldest First" },
  { value: "most_failed", label: "Most Failed" },
  { value: "most_rows",   label: "Most Rows" },
  { value: "activity",    label: "Recent Activity" },
];

const RESUMABLE   = ["Pending Review", "Partially Committed", "Failed"];
const ROLLBACKABLE = ["Committed", "Partially Committed"];

// ── Sub-components ────────────────────────────────────────────────────────────
function StatusPill({ status }) {
  const color = SESSION_STATUS_COLORS[status] || "#94a3b8";
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, background: `${color}18`, color, border: `1px solid ${color}55`, borderRadius: 99, padding: "3px 9px", fontSize: 11, fontWeight: 700, whiteSpace: "nowrap" }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: color, flexShrink: 0 }} />
      {status}
    </span>
  );
}

function QuickActions({ session, onSelect, navigate, onExportFailed }) {
  const status = session.import_status;
  const hasFailed = (session.failed_rows || 0) > 0;
  const isResumable = RESUMABLE.includes(status);
  const canRollback = ROLLBACKABLE.includes(status) && session.rollback_available;
  const sessionPath = `/admin/import-center/session/${session.session_id || session.id}`;

  return (
    <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }} onClick={e => e.stopPropagation()}>
      {/* Open */}
      <button onClick={() => onSelect(session)} style={qBtn("#eff6ff", "#1d4ed8", "#bfdbfe")}>Open →</button>

      {/* Continue Commit */}
      {(status === "Partially Committed" || status === "Committing") && (
        <button onClick={() => navigate(sessionPath)} style={qBtn("#0C2340", "#fff", "none")}>↺ Continue</button>
      )}

      {/* Resume Review */}
      {status === "Pending Review" && (
        <button onClick={() => navigate(sessionPath)} style={qBtn("#0C2340", "#fff", "none")}>▶ Resume</button>
      )}

      {/* Retry Failed */}
      {hasFailed && (
        <button onClick={() => navigate(sessionPath)} style={qBtn("#fef2f2", "#dc2626", "#fca5a5")}>↺ Retry</button>
      )}

      {/* Rollback */}
      {canRollback && (
        <button onClick={() => navigate("/admin/import-center", { state: { tab: "rollback" } })} style={qBtn("#fff7ed", "#92400e", "#fde68a")}>↩ Rollback</button>
      )}

      {/* Export Failed */}
      {hasFailed && (
        <button onClick={() => onExportFailed(session)} style={qBtn("#f8fafc", "#475569", "#e2e8f0")}>↓ Failed</button>
      )}
    </div>
  );
}

function qBtn(bg, color, border) {
  return { background: bg, color, border: `1px solid ${border}`, borderRadius: 6, padding: "4px 9px", fontSize: 10, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" };
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function ICSessionList({ sessions, loading, onSelect, onNew }) {
  const navigate = useNavigate();

  const [statusFilter, setStatusFilter] = useState(() => lsGet(LS_FILTER, "All"));
  const [search, setSearch]             = useState(() => lsGet(LS_SEARCH, ""));
  const [sort, setSort]                 = useState(() => lsGet(LS_SORT, "newest"));

  function setPersistedFilter(v) { setStatusFilter(v); lsSet(LS_FILTER, v); }
  function setPersistedSearch(v) { setSearch(v);       lsSet(LS_SEARCH, v); }
  function setPersistedSort(v)   { setSort(v);         lsSet(LS_SORT, v); }

  // ── Counts per status ─────────────────────────────────────────────────────
  const statusCounts = useMemo(() => {
    const c = {};
    sessions.forEach(s => { c[s.import_status] = (c[s.import_status] || 0) + 1; });
    return c;
  }, [sessions]);

  // ── Filter + search + sort ────────────────────────────────────────────────
  const displayed = useMemo(() => {
    let list = [...sessions];

    // Status filter
    if (statusFilter !== "All") {
      list = list.filter(s => s.import_status === statusFilter);
    }

    // Search
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(s =>
        (s.session_id || "").toLowerCase().includes(q) ||
        (s.manufacturer || "").toLowerCase().includes(q) ||
        (s.source_catalog || "").toLowerCase().includes(q) ||
        (s.entity_targets || []).some(t => t.toLowerCase().includes(q))
      );
    }

    // Sort
    switch (sort) {
      case "oldest":      list.sort((a, b) => new Date(a.uploaded_at || a.created_date) - new Date(b.uploaded_at || b.created_date)); break;
      case "most_failed": list.sort((a, b) => (b.failed_rows || 0) - (a.failed_rows || 0)); break;
      case "most_rows":   list.sort((a, b) => (b.total_rows || 0) - (a.total_rows || 0)); break;
      case "activity":    list.sort((a, b) => new Date(b.updated_date || b.created_date) - new Date(a.updated_date || a.created_date)); break;
      default:            list.sort((a, b) => new Date(b.uploaded_at || b.created_date) - new Date(a.uploaded_at || a.created_date)); break; // newest
    }

    return list;
  }, [sessions, statusFilter, search, sort]);

  // ── Export failed rows for a session ─────────────────────────────────────
  function handleExportFailed(session) {
    // We only have session metadata here — export what we know
    const rows = [{
      session_id:   session.session_id || session.id,
      manufacturer: session.manufacturer || "",
      entity:       session.entity_targets?.[0] || "",
      status:       session.import_status,
      failed_rows:  session.failed_rows || 0,
      note:         "Open session detail for full per-record export",
    }];
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "FailedSummary");
    XLSX.writeFile(wb, `${session.session_id || session.id}_failed_summary.xlsx`);
  }

  return (
    <div>
      {/* ── Header ── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18, flexWrap: "wrap", gap: 10 }}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 900, color: "#0C2340" }}>Import Sessions</div>
          <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>
            {sessions.length} total · {displayed.length} shown
          </div>
        </div>
        <button onClick={onNew} style={btnPrimary}>+ New Import Session</button>
      </div>

      {/* ── Filter pills ── */}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
        {STATUS_FILTERS.map(f => {
          const cnt = f === "All" ? sessions.length : (statusCounts[f] || 0);
          const active = statusFilter === f;
          const color = f !== "All" ? (SESSION_STATUS_COLORS[f] || "#94a3b8") : "#0C2340";
          return (
            <button key={f} onClick={() => setPersistedFilter(f)}
              style={{
                padding: "5px 12px", borderRadius: 99, cursor: "pointer", fontSize: 11, fontWeight: 700,
                border: active ? `1.5px solid ${color}` : "1px solid #e2e8f0",
                background: active ? `${color}18` : "#fff",
                color: active ? color : "#64748b",
                transition: "all 0.12s",
              }}>
              {f} <span style={{ opacity: 0.7 }}>({cnt})</span>
            </button>
          );
        })}
      </div>

      {/* ── Search + Sort ── */}
      <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
        <input
          value={search}
          onChange={e => setPersistedSearch(e.target.value)}
          placeholder="Search by session ID, manufacturer, entity, catalog…"
          style={{ flex: 1, minWidth: 220, padding: "8px 12px", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 12, color: "#1e293b", outline: "none" }}
        />
        <select
          value={sort}
          onChange={e => setPersistedSort(e.target.value)}
          style={{ padding: "8px 12px", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 12, color: "#334155", background: "#fff", cursor: "pointer", outline: "none" }}>
          {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        {(search || statusFilter !== "All" || sort !== "newest") && (
          <button onClick={() => { setPersistedFilter("All"); setPersistedSearch(""); setPersistedSort("newest"); }}
            style={{ padding: "8px 12px", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 11, fontWeight: 700, color: "#64748b", background: "#f8fafc", cursor: "pointer" }}>
            ✕ Clear
          </button>
        )}
      </div>

      {/* ── Table ── */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "48px 0", color: "#64748b" }}>Loading sessions…</div>
      ) : sessions.length === 0 ? (
        <div style={emptyBox}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>📦</div>
          <div style={{ fontSize: 15, fontWeight: 700, color: "#0C2340", marginBottom: 6 }}>No import sessions yet</div>
          <div style={{ fontSize: 12, color: "#64748b", marginBottom: 20 }}>Start a new import session to ingest catalog data into UniKatalog.</div>
          <button onClick={onNew} style={btnPrimary}>Start First Import</button>
        </div>
      ) : displayed.length === 0 ? (
        <div style={{ ...emptyBox, padding: "40px 20px" }}>
          <div style={{ fontSize: 32, marginBottom: 10 }}>🔍</div>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#0C2340", marginBottom: 4 }}>No sessions match your filters</div>
          <button onClick={() => { setPersistedFilter("All"); setPersistedSearch(""); }}
            style={{ ...btnPrimary, fontSize: 11, padding: "7px 16px", marginTop: 12 }}>Clear Filters</button>
        </div>
      ) : (
        <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0", overflow: "hidden" }}>
          {/* Column headers */}
          <div style={rowGrid(true)}>
            {["Session ID", "Manufacturer · Catalog", "Target", "Status", "Rows", "Written", "Failed", "Date", "Actions"].map((h, i) => (
              <div key={i} style={{ fontSize: 10, fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.5px" }}>{h}</div>
            ))}
          </div>

          {displayed.map((s, i) => {
            const hasFailed = (s.failed_rows || 0) > 0;
            const dateStr = s.uploaded_at
              ? new Date(s.uploaded_at).toLocaleDateString()
              : s.created_date
                ? new Date(s.created_date).toLocaleDateString()
                : "—";

            return (
              <div key={s.id}
                style={{ ...rowGrid(false), background: i % 2 === 0 ? "#fff" : "#fafafa", cursor: "pointer", transition: "background 0.1s" }}
                onClick={() => onSelect(s)}
                onMouseEnter={e => e.currentTarget.style.background = "#f0f9ff"}
                onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? "#fff" : "#fafafa"}
              >
                <div style={{ fontFamily: "monospace", fontSize: 11, color: "#0C2340", fontWeight: 700 }}>
                  {s.session_id || s.id?.slice(0, 8)}
                </div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "#1e293b" }}>{s.manufacturer || "—"}</div>
                  {s.source_catalog && <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 1 }}>{s.source_catalog}</div>}
                </div>
                <div style={{ fontSize: 11, color: "#64748b", fontFamily: "monospace" }}>{s.entity_targets?.[0] || "—"}</div>
                <div><StatusPill status={s.import_status || "Uploading"} /></div>
                <div style={{ fontSize: 12, color: "#334155" }}>{(s.total_rows || 0).toLocaleString()}</div>
                <div style={{ fontSize: 12, color: "#166534", fontWeight: 700 }}>{(s.rows_written || 0).toLocaleString()}</div>
                <div style={{ fontSize: 12, color: hasFailed ? "#dc2626" : "#94a3b8", fontWeight: hasFailed ? 800 : 400 }}>
                  {s.failed_rows || 0}
                </div>
                <div style={{ fontSize: 11, color: "#64748b" }}>{dateStr}</div>
                <div>
                  <QuickActions
                    session={s}
                    onSelect={onSelect}
                    navigate={navigate}
                    onExportFailed={handleExportFailed}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
function rowGrid(isHeader) {
  return {
    display: "grid",
    gridTemplateColumns: "120px 1fr 120px 160px 55px 70px 55px 80px 1fr",
    gap: 10, alignItems: "center",
    padding: "10px 18px",
    borderBottom: isHeader ? "2px solid #e2e8f0" : "1px solid #f1f5f9",
  };
}

const btnPrimary = {
  background: "#0C2340", color: "#fff", border: "none", borderRadius: 8,
  padding: "9px 18px", fontSize: 12, fontWeight: 700, cursor: "pointer",
};

const emptyBox = {
  background: "#fff", borderRadius: 12, border: "1px dashed #cbd5e1",
  padding: "60px 20px", textAlign: "center",
};