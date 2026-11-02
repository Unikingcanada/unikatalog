/**
 * ImportCenter — Admin-only governed data ingestion hub
 * Route: /admin/import-center
 * NOT public. NOT customer-facing. Infrastructure only.
 */
import { useState, useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import ICShell from "@/components/importCenter/ICShell";
import ICSessionList from "@/components/importCenter/ICSessionList";
import ICSessionWorkflow from "@/components/importCenter/ICSessionWorkflow";
import ICRollbackPanel from "@/components/importCenter/ICRollbackPanel";
import ICSessionDetailView from "@/components/importCenter/ICSessionDetailView";
import MasterCatalogImporter from "@/components/importCenter/MasterCatalogImporter";

const TABS = [
  { key: "sessions",  label: "📋 Import Sessions" },
  { key: "new",       label: "⬆ New Import",      action: true },
  { key: "master",    label: "🚀 Master Catalog",  action: true },
  { key: "rollback",  label: "↩ Rollback Center" },
  { key: "mappings",  label: "🗂 Saved Mappings" },
];

export default function ImportCenter() {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(location.state?.tab || "sessions");
  const [sessions, setSessions] = useState([]);
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [selectedSession, setSelectedSession] = useState(null);
  const [savedMappings, setSavedMappings] = useState([]);
  const [loadingMappings, setLoadingMappings] = useState(false);

  const loadSessions = useCallback(async () => {
    setLoadingSessions(true);
    try {
      const data = await base44.entities.Import_Sessions.list("-created_date", 200);
      setSessions(data || []);
    } catch {
      setSessions([]);
    } finally {
      setLoadingSessions(false);
    }
  }, []);

  const loadMappings = useCallback(async () => {
    setLoadingMappings(true);
    try {
      const data = await base44.entities.Column_Mappings.list("-updated_date", 100);
      setSavedMappings(data || []);
    } catch {
      setSavedMappings([]);
    } finally {
      setLoadingMappings(false);
    }
  }, []);

  useEffect(() => { loadSessions(); }, [loadSessions]);
  useEffect(() => {
    if (activeTab === "mappings") loadMappings();
  }, [activeTab, loadMappings]);

  function handleTabClick(key) {
    if (key === "new") { setSelectedSession(null); setActiveTab("new"); return; }
    setActiveTab(key);
    setSelectedSession(null);
  }

  // Session-level drill-in opens workflow in review mode (future: session detail view)
  function handleSelectSession(sess) {
    setSelectedSession(sess);
    setActiveTab("detail");
  }

  return (
    <ICShell>
      {/* Page header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 14, flexWrap: "wrap" }}>
          <h1 style={{ fontSize: 28, fontWeight: 900, color: "#0E1F3A", margin: 0 }}>Import Center</h1>
          <span style={{ fontSize: 11, fontWeight: 700, background: "#fef2f2", color: "#C62828", border: "1px solid #fca5a5", borderRadius: 99, padding: "2px 10px" }}>
            ADMIN INFRASTRUCTURE
          </span>
        </div>
        <p style={{ fontSize: 13, color: "#3A4A66", margin: "6px 0 0", maxWidth: 700 }}>
          Industrial-scale governed ingestion for UniKatalog. Upload → Stage → Validate → Diff → Commit.
          All writes are isolated in staging and require explicit admin commit. Full rollback on every session.
        </p>
      </div>

      {/* Architecture notice (AI placeholder) */}
      <div style={{ background: "#F4F2ED", border: "1px solid #D9D6CE", borderLeft: "4px solid #3A4A66", borderRadius: 8, padding: "10px 16px", marginBottom: 24, fontSize: 11, color: "#3A4A66" }}>
        <strong style={{ color: "#3A4A66" }}>🔮 AI Extension Points Reserved:</strong>{" "}
        Auto-field mapping · Equivalency suggestions · Duplicate merge recommendations · Confidence scoring — architectured, not yet active.
      </div>

      {/* Tab bar */}
      <div style={tabBarStyle}>
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => handleTabClick(t.key)}
            style={{
              ...tabBtnStyle,
              ...(activeTab === t.key ? tabActiveSt : {}),
              ...(t.action ? { color: (activeTab === t.key) ? "#fff" : "#0E1F3A" } : {}),
            }}>
            {t.label}
            {t.key === "sessions" && sessions.length > 0 && (
              <span style={{ background: "rgba(255,255,255,0.2)", borderRadius: 99, padding: "1px 7px", fontSize: 10, marginLeft: 4 }}>{sessions.length}</span>
            )}
          </button>
        ))}
        {selectedSession && (
          <button style={{ ...tabBtnStyle, ...tabActiveSt }} disabled>
            📂 {selectedSession.session_id || selectedSession.id?.slice(0,8)}
          </button>
        )}
      </div>

      {/* Content */}
      <div style={{ paddingTop: 24 }}>

        {/* Sessions list */}
        {activeTab === "sessions" && (
          <ICSessionList
            sessions={sessions}
            loading={loadingSessions}
            onSelect={handleSelectSession}
            onNew={() => setActiveTab("new")}
          />
        )}

        {/* New import workflow */}
        {activeTab === "new" && (
          <ICSessionWorkflow
            onBack={() => { setActiveTab("sessions"); loadSessions(); }}
            onSessionCreated={loadSessions}
          />
        )}

        {/* Session detail — full debug view */}
        {activeTab === "detail" && selectedSession && (
          <ICSessionDetailView
            session={selectedSession}
            onBack={() => { setSelectedSession(null); setActiveTab("sessions"); }}
          />
        )}

        {/* Rollback center */}
        {activeTab === "rollback" && (
          <ICRollbackPanel
            sessions={sessions}
            onRollbackComplete={loadSessions}
          />
        )}

        {/* Master catalog bulk importer */}
        {activeTab === "master" && (
          <MasterCatalogImporter />
        )}

        {/* Saved mappings */}
        {activeTab === "mappings" && (
          <SavedMappingsView
            mappings={savedMappings}
            loading={loadingMappings}
            onDelete={async (id) => {
              await base44.entities.Column_Mappings.delete(id);
              loadMappings();
            }}
          />
        )}
      </div>
    </ICShell>
  );
}

// ─── Saved Mappings View ───────────────────────────────────────────────────────

function SavedMappingsView({ mappings, loading, onDelete }) {
  const [deletingId, setDeletingId] = useState(null);

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 20, fontWeight: 900, color: "#0E1F3A" }}>Saved Column Mappings</div>
        <div style={{ fontSize: 12, color: "#3A4A66", marginTop: 2 }}>Reusable per-manufacturer column mappings — loaded automatically in the import workflow.</div>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "40px", color: "#3A4A66" }}>Loading mappings…</div>
      ) : mappings.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px", color: "#3A4A66", background: "#fff", borderRadius: 12, border: "1px dashed #D9D6CE" }}>
          <div style={{ fontSize: 36, marginBottom: 10 }}>🗂</div>
          <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>No saved mappings yet</div>
          <div style={{ fontSize: 12 }}>Save a mapping during the import workflow to reuse it here.</div>
        </div>
      ) : (
        <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #D9D6CE", overflow: "hidden" }}>
          {mappings.map((m, i) => (
            <div key={m.id} style={{ padding: "14px 20px", borderBottom: i < mappings.length - 1 ? "1px solid #ECEAE4" : "none", display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap" }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#0E1F3A" }}>{m.mapping_name}</div>
                <div style={{ fontSize: 11, color: "#3A4A66", marginTop: 2 }}>
                  {m.manufacturer || "Any"} → {m.entity_target} · {Object.keys(m.mapping_rules || {}).length} columns · Used {m.times_used || 0}×
                </div>
                {m.source_columns?.length > 0 && (
                  <div style={{ fontSize: 10, color: "#8A94A6", marginTop: 4 }}>
                    Columns: {m.source_columns.slice(0, 8).join(" · ")}{m.source_columns.length > 8 ? ` +${m.source_columns.length - 8} more` : ""}
                  </div>
                )}
              </div>
              <button
                onClick={async () => {
                  setDeletingId(m.id);
                  await onDelete(m.id);
                  setDeletingId(null);
                }}
                disabled={deletingId === m.id}
                style={{ padding: "5px 12px", borderRadius: 6, border: "1px solid #fca5a5", background: "#fef2f2", color: "#C62828", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>
                {deletingId === m.id ? "Deleting…" : "Delete"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────────

const tabBarStyle = {
  display: "flex", gap: 0, borderBottom: "2px solid #D9D6CE", overflowX: "auto",
};
const tabBtnStyle = {
  padding: "10px 20px", border: "none", background: "none",
  cursor: "pointer", fontSize: 13, fontWeight: 600, color: "#3A4A66",
  borderBottom: "2px solid transparent", marginBottom: -2, whiteSpace: "nowrap",
  transition: "all 0.15s",
};
const tabActiveSt = {
  color: "#0E1F3A", borderBottomColor: "#0E1F3A", background: "none",
};
const backBtn = {
  background: "#ECEAE4", border: "1px solid #D9D6CE", color: "#3A4A66",
  borderRadius: 7, padding: "6px 14px", cursor: "pointer", fontSize: 12, fontWeight: 600,
  marginBottom: 20, display: "inline-block",
};