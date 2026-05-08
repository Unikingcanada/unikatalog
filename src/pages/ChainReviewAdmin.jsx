/**
 * ChainReviewAdmin — Internal admin-only QA governance panel
 * Access: admin role only. Never linked from public UI.
 */
import { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import ReviewTable from "@/components/chainReview/ReviewTable";
import ReviewFilterBar from "@/components/chainReview/ReviewFilterBar";
import ReviewStats from "@/components/chainReview/ReviewStats";

const TABS = [
  { key: "equivalents", label: "Manufacturer Equivalents", entity: "Manufacturer_Equivalents" },
  { key: "dimensions",  label: "Chain Dimensions",         entity: "Chain_Dimensions" },
  { key: "flags",       label: "Review Flags",             entity: "Chain_Review_Flags" },
];

export default function ChainReviewAdmin() {
  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [activeTab, setActiveTab] = useState("equivalents");
  const [filter, setFilter] = useState("all");          // all | pending | critical | approved | rejected
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionMsg, setActionMsg] = useState(null);

  // Auth guard
  useEffect(() => {
    base44.auth.me()
      .then(u => { setUser(u); setAuthChecked(true); })
      .catch(() => setAuthChecked(true));
  }, []);

  const currentTab = TABS.find(t => t.key === activeTab);

  const load = useCallback(async () => {
    if (!currentTab) return;
    setLoading(true);
    try {
      const data = await base44.entities[currentTab.entity].list("-updated_date", 500);
      setRecords(data || []);
    } catch {
      setRecords([]);
    } finally {
      setLoading(false);
    }
  }, [currentTab?.entity]);

  useEffect(() => { if (user?.role === "admin") load(); }, [load, user]);

  async function applyAction(record, action) {
    const isFlags = currentTab.entity === "Chain_Review_Flags";
    const updates = {
      approve: { review_status: "Approved", needs_review: false, ...(isFlags ? { resolved: true } : {}) },
      reject:  { review_status: "Rejected", needs_review: false },
      flag:    { review_status: "Pending",  needs_review: true,  ...(isFlags ? { resolved: false } : {}) },
    }[action];
    if (!updates) return;
    try {
      await base44.entities[currentTab.entity].update(record.id, updates);
      setActionMsg(`✓ ${action === "approve" ? "Approved" : action === "reject" ? "Rejected" : "Flagged for Engineering Review"}`);
      setTimeout(() => setActionMsg(null), 3000);
      load();
    } catch (e) {
      setActionMsg("Error: " + e.message);
    }
  }

  async function saveNotes(record, resolution_notes) {
    try {
      await base44.entities[currentTab.entity].update(record.id, { resolution_notes });
      setActionMsg("✓ Notes saved");
      setTimeout(() => setActionMsg(null), 2000);
      load();
    } catch (e) {
      setActionMsg("Error saving notes: " + e.message);
    }
  }

  // Filter records client-side
  const filtered = records.filter(r => {
    if (filter === "pending")  return r.review_status === "Pending"  || (!r.review_status && r.needs_review);
    if (filter === "critical") return r.severity === "Critical"      || r.needs_review === true;
    if (filter === "approved") return r.review_status === "Approved";
    if (filter === "rejected") return r.review_status === "Rejected";
    return true;
  });

  // Auth check
  if (!authChecked) return <AdminShell><div style={S.center}>Checking access...</div></AdminShell>;
  if (!user || user.role !== "admin") {
    return (
      <AdminShell>
        <div style={S.center}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🔒</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: S.navy }}>Admin Access Required</div>
          <div style={{ fontSize: 13, color: S.muted, marginTop: 8 }}>This page is restricted to Uniking admin users.</div>
        </div>
      </AdminShell>
    );
  }

  return (
    <AdminShell>
      {/* Header */}
      <div style={S.header}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 900, color: S.navy }}>Chain Data QA Review</div>
          <div style={{ fontSize: 12, color: S.muted, marginTop: 2 }}>Internal governance panel — admin only</div>
        </div>
        {actionMsg && (
          <div style={{ padding: "8px 18px", borderRadius: 8, background: actionMsg.startsWith("Error") ? "#fef2f2" : "#f0fdf4", color: actionMsg.startsWith("Error") ? "#b91c1c" : "#16a34a", fontWeight: 700, fontSize: 13 }}>
            {actionMsg}
          </div>
        )}
      </div>

      {/* Stats */}
      <ReviewStats records={records} />

      {/* Tab bar */}
      <div style={S.tabBar}>
        {TABS.map(t => (
          <button key={t.key} onClick={() => { setActiveTab(t.key); setFilter("all"); }}
            style={{ ...S.tab, ...(activeTab === t.key ? S.tabActive : {}) }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Filter bar */}
      <ReviewFilterBar filter={filter} onChange={setFilter} counts={{
        all:      records.length,
        pending:  records.filter(r => r.review_status === "Pending"  || (!r.review_status && r.needs_review)).length,
        critical: records.filter(r => r.severity === "Critical"      || r.needs_review === true).length,
        approved: records.filter(r => r.review_status === "Approved").length,
        rejected: records.filter(r => r.review_status === "Rejected").length,
      }} />

      {/* Table */}
      {loading ? (
        <div style={S.center}>Loading records...</div>
      ) : filtered.length === 0 ? (
        <div style={S.center}>No records match this filter.</div>
      ) : (
        <ReviewTable
          records={filtered}
          entityKey={activeTab}
          onApprove={r  => applyAction(r, "approve")}
          onReject={r   => applyAction(r, "reject")}
          onFlag={r     => applyAction(r, "flag")}
          onSaveNotes={saveNotes}
        />
      )}
    </AdminShell>
  );
}

function AdminShell({ children }) {
  return (
    <div style={{ minHeight: "100vh", background: "#f1f5f9", fontFamily: "'Inter','Segoe UI',sans-serif" }}>
      <div style={{ background: S.navy, padding: "12px 32px", display: "flex", alignItems: "center", gap: 14 }}>
        <span style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: 2, color: "rgba(255,255,255,0.5)" }}>Admin</span>
        <span style={{ color: "rgba(255,255,255,0.25)" }}>|</span>
        <span style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>Chain QA Review Panel</span>
        <span style={{ marginLeft: "auto", fontSize: 10, color: "rgba(255,255,255,0.35)", fontStyle: "italic" }}>Internal use only — not visible to app users</span>
      </div>
      <div style={{ maxWidth: 1400, margin: "0 auto", padding: "28px clamp(12px,3vw,32px)" }}>
        {children}
      </div>
    </div>
  );
}

const S = {
  navy:   "#1a3a5c",
  muted:  "#64748b",
  border: "#e2e8f0",
  header: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 12 },
  tabBar: { display: "flex", gap: 0, borderBottom: "2px solid #e2e8f0", marginBottom: 0, overflowX: "auto" },
  tab:    { padding: "10px 20px", border: "none", background: "none", cursor: "pointer", fontSize: 13, fontWeight: 600, color: "#64748b", borderBottom: "2px solid transparent", marginBottom: -2, whiteSpace: "nowrap" },
  tabActive: { color: "#1a3a5c", borderBottomColor: "#1a3a5c" },
  center: { textAlign: "center", padding: "60px 20px", color: "#64748b", fontSize: 14 },
};