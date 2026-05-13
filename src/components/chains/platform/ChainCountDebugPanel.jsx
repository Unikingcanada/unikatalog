/**
 * ChainCountDebugPanel.jsx
 *
 * Admin-only debug panel showing chain count transparency.
 * Shows:
 * - Total DB records vs unique active displayed chains
 * - Status breakdown (Active, Discontinued, Pending Review)
 * - Component SKUs excluded from count
 * - Categorized vs uncategorized
 * - Per-family breakdown
 */
import { useState } from "react";
import { getChainAuditBreakdown } from "@/lib/chainCountHelpers";
import { base44 } from "@/api/base44Client";

const C = {
  navy: "#003c5b", navyMid: "#1A3A5C",
  border: "#e2e8f0", bg: "#f8fafc", card: "#ffffff",
  text: "#0f172a", muted: "#64748b",
};

export default function ChainCountDebugPanel() {
  const [expanded, setExpanded] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  // Check admin on mount
  const [loaded, setLoaded] = useState(false);
  if (!loaded) {
    base44.auth.me().then(u => {
      setIsAdmin(u?.role === "admin");
      setLoaded(true);
    }).catch(() => setLoaded(true));
  }

  if (!loaded || !isAdmin) return null;

  const audit = getChainAuditBreakdown();

  return (
    <div style={{ marginTop: 20 }}>
      <button
        onClick={() => setExpanded(!expanded)}
        style={{
          padding: "8px 14px",
          borderRadius: 6,
          border: "1px solid #fbbf24",
          background: "#fef3c7",
          color: "#92400e",
          fontSize: 11,
          fontWeight: 700,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: 6,
        }}
      >
        {expanded ? "▼" : "▶"} ⚙ Chain Count Debug (Admin)
      </button>

      {expanded && (
        <div style={{ marginTop: 12, padding: "14px", background: "#fffbeb", border: "1px solid #fcd34d", borderRadius: 8, fontSize: 12 }}>
          {/* Core counts */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 10, marginBottom: 14 }}>
            <div style={{ padding: "10px", background: "#fff", borderRadius: 4, border: "1px solid #fed7aa" }}>
              <div style={{ fontSize: 10, color: C.muted, fontWeight: 700, textTransform: "uppercase" }}>Total DB Records</div>
              <div style={{ fontSize: 18, fontWeight: 900, color: C.navyMid }}>{audit.totalDbRecords.toLocaleString()}</div>
            </div>

            <div style={{ padding: "10px", background: "#fff", borderRadius: 4, border: "1px solid #fed7aa" }}>
              <div style={{ fontSize: 10, color: C.muted, fontWeight: 700, textTransform: "uppercase" }}>Unique Chain IDs</div>
              <div style={{ fontSize: 18, fontWeight: 900, color: C.navyMid }}>{audit.uniqueChainIds.toLocaleString()}</div>
            </div>

            <div style={{ padding: "10px", background: "#fef2f2", borderRadius: 4, border: "1px solid #fca5a5" }}>
              <div style={{ fontSize: 10, color: "#991b1b", fontWeight: 700, textTransform: "uppercase" }}>Duplicate DB Records</div>
              <div style={{ fontSize: 18, fontWeight: 900, color: "#dc2626" }}>{audit.duplicateDbRecords.toLocaleString()}</div>
            </div>

            <div style={{ padding: "10px", background: "#f0fdf4", borderRadius: 4, border: "1px solid #86efac" }}>
              <div style={{ fontSize: 10, color: "#166534", fontWeight: 700, textTransform: "uppercase" }}>Visible Active Chains</div>
              <div style={{ fontSize: 18, fontWeight: 900, color: "#16a34a" }}>{audit.totalUniqueActiveChains.toLocaleString()}</div>
            </div>
          </div>

          {/* Status breakdown */}
          <div style={{ marginBottom: 14, padding: "10px", background: "#fff", borderRadius: 4, border: "1px solid #fed7aa" }}>
            <div style={{ fontSize: 10, color: C.muted, fontWeight: 700, textTransform: "uppercase", marginBottom: 8 }}>Status Breakdown (All DB Records)</div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {Object.entries(audit.statusCounts).map(([status, count]) => (
                <div key={status} style={{ fontSize: 11, padding: "4px 8px", background: C.bg, borderRadius: 4, color: C.text, fontWeight: 600 }}>
                  {status}: <strong>{count}</strong>
                </div>
              ))}
            </div>
          </div>

          {/* Components breakdown */}
          <div style={{ marginBottom: 14, padding: "10px", background: "#fff", borderRadius: 4, border: "1px solid #fed7aa" }}>
            <div style={{ fontSize: 10, color: C.muted, fontWeight: 700, textTransform: "uppercase", marginBottom: 6 }}>Component SKUs (Excluded from Count)</div>
            <div style={{ fontSize: 12, color: C.text }}>
              Total: <strong>{audit.totalComponentRecords}</strong> records
              &nbsp;·&nbsp; Unique: <strong>{audit.uniqueComponentIds}</strong> IDs
              <div style={{ fontSize: 10, color: C.muted, marginTop: 4 }}>Examples: OL-xx, CL-xx, master links, cotter pins, etc.</div>
            </div>
          </div>

          {/* Categorized breakdown */}
          <div style={{ marginBottom: 14, padding: "10px", background: "#fff", borderRadius: 4, border: "1px solid #fed7aa" }}>
            <div style={{ fontSize: 10, color: C.muted, fontWeight: 700, textTransform: "uppercase", marginBottom: 6 }}>Categorization (of {audit.totalUniqueActiveChains} visible chains)</div>
            <div style={{ display: "flex", gap: 12 }}>
              <div>
                <div style={{ fontSize: 11, color: "#166534" }}>✓ Categorized: <strong>{audit.categorized}</strong></div>
              </div>
              {audit.uncategorized > 0 && (
                <div>
                  <div style={{ fontSize: 11, color: "#dc2626" }}>✗ Uncategorized: <strong>{audit.uncategorized}</strong></div>
                </div>
              )}
            </div>
          </div>

          {/* Per-family breakdown */}
          <div style={{ padding: "10px", background: "#fff", borderRadius: 4, border: "1px solid #fed7aa" }}>
            <div style={{ fontSize: 10, color: C.muted, fontWeight: 700, textTransform: "uppercase", marginBottom: 8 }}>Per-Family Count (Active Only)</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 8, fontSize: 11 }}>
              {Object.entries(audit.perFamily)
                .filter(([_, count]) => count > 0)
                .sort((a, b) => b[1] - a[1])
                .map(([family, count]) => (
                  <div key={family} style={{ padding: "6px", background: C.bg, borderRadius: 3, color: C.text, fontWeight: 600 }}>
                    {family.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}: <strong>{count}</strong>
                  </div>
                ))}
            </div>
            {Object.values(audit.perFamily).every(c => c === 0) && (
              <div style={{ fontSize: 11, color: C.muted, fontStyle: "italic" }}>No chains assigned to families yet.</div>
            )}
          </div>

          <div style={{ marginTop: 10, fontSize: 10, color: C.muted, fontStyle: "italic" }}>
            ℹ Last updated on page load. Refresh to see latest counts from DB.
          </div>
        </div>
      )}
    </div>
  );
}