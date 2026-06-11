import { useState, useEffect, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { AlertCircle, CheckCircle2, Database, BarChart3, Clock, AlertTriangle } from "lucide-react";
import { getTotalUniqueChainCount, getChainAuditBreakdown } from "@/lib/chainCountHelpers";
import { computeCatalogAudit } from "@/lib/chainCatalogAudit";
import { fetchLiveNormalizedChains } from "@/lib/chainLiveDbSource";

export default function ChainsAudit() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    normalizedChainsCount: 0,
    rawImportsCount: 0,
    orphanedDimensions: 0,
    orphanedPerformance: 0,
    orphanedEquivalents: 0,
    orphanedSprockets: 0,
    orphanedAttachments: 0,
    orphanedMedia: 0,
    orphanedDownloads: 0,
    pendingReviewFlags: 0,
    duplicateChainIds: 0,
    mergedChainCount: 0,
  });
  const [importSessions, setImportSessions] = useState([]);
  const [error, setError] = useState(null);

  // Catalog completeness audit — computed from the static normalized index by
  // default (instant, no DB), then re-computed against live DB chains if available.
  const [auditChains, setAuditChains] = useState(null); // null => use static
  const [auditSource, setAuditSource] = useState("static");
  const audit = useMemo(
    () => computeCatalogAudit(auditChains || undefined),
    [auditChains]
  );

  useEffect(() => {
    fetchLiveNormalizedChains()
      .then(source => {
        if (source?.live?.length) {
          setAuditChains(source.live);
          setAuditSource("live");
        }
      })
      .catch(() => {}); // static audit already rendered
  }, []);

  useEffect(() => {
    const fetchAuditData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch all normalized chains
        const chains = await base44.entities.Normalized_Chains.list("-updated_date", 10000);
        const chainIds = new Set(chains.map(c => c.chain_id));
        const totalChains = chains.length;

        // Count duplicates
        const duplicates = chains.length - chainIds.size;

        // Fetch raw imports
        const rawImports = await base44.entities.Raw_Chain_Imports.list("-created_at", 10000);

        // Fetch import sessions for dashboard
        const sessions = await base44.entities.Import_Sessions.list("-created_date", 100);
        setImportSessions(sessions || []);

        // Fetch all related entities and count orphaned records
        const dimensions = await base44.entities.Chain_Dimensions.list("-updated_date", 10000);
        const performance = await base44.entities.Performance_Data.list("-updated_date", 10000);
        const equivalents = await base44.entities.Manufacturer_Equivalents.list("-updated_date", 10000);
        const sprockets = await base44.entities.Chain_Sprockets.list("-updated_date", 10000);
        const attachments = await base44.entities.Chain_Attachments.list("-updated_date", 10000);
        const media = await base44.entities.Chain_Media.list("-updated_date", 10000);
        const downloads = await base44.entities.Chain_Downloads.list("-updated_date", 10000);
        const flags = await base44.entities.Chain_Review_Flags.list("-updated_date", 10000);

        // Count orphaned records (where chain_id doesn't exist in Normalized_Chains)
        const orphanedDims = dimensions.filter(d => !chainIds.has(d.chain_id)).length;
        const orphanedPerf = performance.filter(p => !chainIds.has(p.chain_id)).length;
        const orphanedEq = equivalents.filter(e => !chainIds.has(e.chain_id)).length;
        const orphanedSpr = sprockets.filter(s => !chainIds.has(s.chain_id)).length;
        const orphanedAtt = attachments.filter(a => !chainIds.has(a.chain_id)).length;
        const orphanedMed = media.filter(m => !chainIds.has(m.chain_id)).length;
        const orphanedDl = downloads.filter(d => d.chain_id !== "ALL" && !chainIds.has(d.chain_id)).length;
        const pendingFlags = flags.filter(f => f.needs_review === true).length;

        setStats({
          normalizedChainsCount: totalChains,
          rawImportsCount: rawImports.length,
          orphanedDimensions: orphanedDims,
          orphanedPerformance: orphanedPerf,
          orphanedEquivalents: orphanedEq,
          orphanedSprockets: orphanedSpr,
          orphanedAttachments: orphanedAtt,
          orphanedMedia: orphanedMed,
          orphanedDownloads: orphanedDl,
          pendingReviewFlags: pendingFlags,
          duplicateChainIds: duplicates,
          mergedChainCount: chainIds.size,
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAuditData();
  }, []);

  if (loading) {
    return (
      <div style={{ padding: "40px 20px", textAlign: "center", color: "#64748b" }}>
        <div style={{ fontSize: 14, marginBottom: 12 }}>Loading chain audit data…</div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "20px" }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 900, color: "#0C2340", marginBottom: 8 }}>
          Chains-Only Audit Dashboard
        </h1>
        <p style={{ fontSize: 13, color: "#64748b" }}>
          Real-time health check for normalized chain ecosystem. All counts auto-refresh.
        </p>
      </div>

      <CompletenessSection audit={audit} source={auditSource} />

      {error && (
        <div style={{ background: "#fef2f2", border: "1px solid #fca5a5", borderRadius: 8, padding: "12px 16px", marginBottom: 20, color: "#dc2626", fontSize: 12 }}>
          ⚠ {error}
        </div>
      )}

      {/* Core counts row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12, marginBottom: 24 }}>
        <StatCard icon={<Database className="w-5 h-5" />} label="DB Normalized Chains" value={stats.normalizedChainsCount} color="#0C2340" />
        <StatCard icon={<Database className="w-5 h-5" />} label="Unique Chain IDs" value={stats.mergedChainCount} color="#2563eb" />
        <StatCard icon={<CheckCircle2 className="w-5 h-5" />} label="Visible Active Chains" value={getTotalUniqueChainCount()} color="#16a34a" />
        <StatCard icon={<AlertCircle className="w-5 h-5" />} label="Duplicate DB Records" value={stats.duplicateChainIds} color={stats.duplicateChainIds > 0 ? "#dc2626" : "#22c55e"} />
      </div>

      {/* Orphaned records grid */}
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 16, fontWeight: 800, color: "#1e293b", marginBottom: 12 }}>Orphaned Related Records</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 10 }}>
          <OrphanCard entity="Dimensions" count={stats.orphanedDimensions} />
          <OrphanCard entity="Performance" count={stats.orphanedPerformance} />
          <OrphanCard entity="Equivalents" count={stats.orphanedEquivalents} />
          <OrphanCard entity="Sprockets" count={stats.orphanedSprockets} />
          <OrphanCard entity="Attachments" count={stats.orphanedAttachments} />
          <OrphanCard entity="Media" count={stats.orphanedMedia} />
          <OrphanCard entity="Downloads" count={stats.orphanedDownloads} />
        </div>
      </div>

      {/* Review flags */}
      <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 10, padding: "16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontSize: 12, fontWeight: 800, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 4 }}>
            ⚑ Review Flags Pending
          </div>
          <div style={{ fontSize: 28, fontWeight: 900, color: stats.pendingReviewFlags > 0 ? "#f59e0b" : "#22c55e" }}>
            {stats.pendingReviewFlags}
          </div>
        </div>
        <div style={{ fontSize: 12, color: "#94a3b8", textAlign: "right", lineHeight: "1.6" }}>
          {stats.pendingReviewFlags > 0
            ? `${stats.pendingReviewFlags} chain(s) flagged for engineering review`
            : "No pending review flags — all clear"}
        </div>
      </div>

      {/* Import Session Dashboard */}
      {importSessions.length > 0 && (
        <div style={{ marginTop: 28 }}>
          <h2 style={{ fontSize: 16, fontWeight: 800, color: "#1e293b", marginBottom: 12 }}>Recent Import Sessions</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 12 }}>
            {importSessions.slice(0, 6).map(sess => (
              <div key={sess.id} style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, padding: 14, display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 8, justifyContent: "space-between" }}>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "#0C2340" }}>{sess.session_id}</div>
                    <div style={{ fontSize: 10, color: "#64748b", marginTop: 2 }}>{sess.manufacturer || "Unknown"}</div>
                  </div>
                  <StatusBadge status={sess.import_status} />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 11, color: "#64748b" }}>
                  <div>📊 Total: {sess.total_rows || 0}</div>
                  <div>✓ Written: {sess.rows_written || 0}</div>
                  <div>⚠ Flags: {sess.flags_generated || 0}</div>
                  {sess.rows_staged && <div>📦 Staged: {sess.rows_staged}</div>}
                </div>
                <div style={{ fontSize: 9, color: "#94a3b8", marginTop: 4 }}>
                  {sess.uploaded_at ? new Date(sess.uploaded_at).toLocaleDateString() : "—"}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Summary */}
      <div style={{ marginTop: 24, padding: "14px 16px", background: "#f0fdf4", border: "1px solid #86efac", borderRadius: 8, fontSize: 12, color: "#166534", lineHeight: 1.6 }}>
        <strong>✓ Consolidation Status:</strong>
        <div style={{ marginTop: 6 }}>
          {stats.normalizedChainsCount} total DB records · {stats.mergedChainCount} unique IDs · <strong style={{ color: "#16a34a" }}>{getTotalUniqueChainCount()} visible active chains</strong>
        </div>
        <div style={{ marginTop: 6 }}>
          {stats.rawImportsCount} raw imports tracked · {stats.duplicateChainIds > 0 ? `⚠ ${stats.duplicateChainIds} duplicate records ignored` : "✓ No duplicate records"}
        </div>
      </div>
    </div>
  );
}

function barColor(p) {
  if (p >= 90) return "#16a34a";
  if (p >= 60) return "#65a30d";
  if (p >= 30) return "#f59e0b";
  return "#dc2626";
}

function PctBar({ label, value, count, total }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div style={{ width: 130, fontSize: 11, fontWeight: 700, color: "#475569" }}>{label}</div>
      <div style={{ flex: 1, height: 16, background: "#f1f5f9", borderRadius: 4, overflow: "hidden" }}>
        <div style={{ width: `${value}%`, height: "100%", background: barColor(value), transition: "width .3s" }} />
      </div>
      <div style={{ width: 96, fontSize: 11, fontWeight: 700, color: "#0f172a", textAlign: "right" }}>
        {value}% <span style={{ color: "#94a3b8", fontWeight: 500 }}>({count}/{total})</span>
      </div>
    </div>
  );
}

function CompletenessSection({ audit, source }) {
  if (!audit) return null;
  const o = audit.overall;
  const dims = [
    ["Product image", o.pctImage, o.withImage],
    ["Attachments", o.pctAttachments, o.withAttachments],
    ["Sprockets", o.pctSprockets, o.withSprockets],
    ["Pins / links", o.pctPins, o.withPins],
    ["Ratings", o.pctRatings, o.withRatings],
    ["Materials", o.pctMaterials, o.withMaterials],
    ["Confirmed source", o.pctConfirmedSource, o.withConfirmedSource],
  ];
  return (
    <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: "20px 22px", marginBottom: 28 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14, flexWrap: "wrap", gap: 8 }}>
        <h2 style={{ fontSize: 18, fontWeight: 900, color: "#0C2340", display: "flex", alignItems: "center", gap: 8 }}>
          <BarChart3 className="w-5 h-5" /> Catalog Completeness
        </h2>
        <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20, background: source === "live" ? "#dcfce7" : "#eff6ff", color: source === "live" ? "#166534" : "#0284c7" }}>
          {source === "live" ? "● Live DB" : "○ Static index"} · {o.total} chains
        </span>
      </div>

      {/* Headline: catalog-ready */}
      <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 18, padding: "12px 16px", background: "#f8fafc", borderRadius: 8, borderLeft: `4px solid ${barColor(o.pctReady)}` }}>
        <div style={{ fontSize: 34, fontWeight: 900, color: barColor(o.pctReady) }}>{o.pctReady}%</div>
        <div style={{ fontSize: 12, color: "#475569", lineHeight: 1.5 }}>
          <strong>Catalog-ready</strong> ({o.ready}/{o.total}) — chains with image + attachments + sprockets + ratings all present.
        </div>
      </div>

      {/* Dimension bars */}
      <div style={{ display: "flex", flexDirection: "column", gap: 7, marginBottom: 22 }}>
        {dims.map(([label, v, c]) => (
          <PctBar key={label} label={label} value={v} count={c} total={o.total} />
        ))}
      </div>

      {/* Per-family table */}
      <h3 style={{ fontSize: 13, fontWeight: 800, color: "#1e293b", marginBottom: 8 }}>By Family</h3>
      <div style={{ overflowX: "auto", marginBottom: 22 }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
          <thead>
            <tr style={{ textAlign: "left", color: "#64748b", borderBottom: "2px solid #e2e8f0" }}>
              <th style={{ padding: "6px 8px" }}>Family</th>
              <th style={{ padding: "6px 8px", textAlign: "right" }}>Chains</th>
              <th style={{ padding: "6px 8px", textAlign: "right" }}>Img</th>
              <th style={{ padding: "6px 8px", textAlign: "right" }}>Attach</th>
              <th style={{ padding: "6px 8px", textAlign: "right" }}>Sprkt</th>
              <th style={{ padding: "6px 8px", textAlign: "right" }}>Rate</th>
              <th style={{ padding: "6px 8px", textAlign: "right" }}>Ready</th>
            </tr>
          </thead>
          <tbody>
            {audit.byFamily.map(f => {
              const empty = f.total === 0;
              return (
                <tr key={f.key} style={{ borderBottom: "1px solid #f1f5f9", color: empty ? "#cbd5e1" : "#0f172a", background: empty ? "#fafafa" : "transparent" }}>
                  <td style={{ padding: "6px 8px", fontWeight: 700 }}>{f.label}</td>
                  <td style={{ padding: "6px 8px", textAlign: "right", fontWeight: 700 }}>{f.total}</td>
                  <PctCell v={f.pctImage} empty={empty} />
                  <PctCell v={f.pctAttachments} empty={empty} />
                  <PctCell v={f.pctSprockets} empty={empty} />
                  <PctCell v={f.pctRatings} empty={empty} />
                  <PctCell v={f.pctReady} empty={empty} bold />
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Source-brand sourcing scorecard */}
      <h3 style={{ fontSize: 13, fontWeight: 800, color: "#1e293b", marginBottom: 4 }}>Source-Brand Coverage</h3>
      <div style={{ fontSize: 10, color: "#94a3b8", marginBottom: 10 }}>
        Internal sourcing scorecard only — brands are never shown to customers. Confirmed equivalency references per target source.
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 8 }}>
        {audit.bySourceBrand.map(b => (
          <div key={b.brand} style={{ border: `1px solid ${b.present ? "#bbf7d0" : "#fecaca"}`, background: b.present ? "#f0fdf4" : "#fef2f2", borderRadius: 8, padding: "9px 11px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 12, fontWeight: 800, color: "#0f172a" }}>{b.brand}</span>
              <span style={{ fontSize: 13 }}>{b.present ? "✓" : "✗"}</span>
            </div>
            <div style={{ fontSize: 10, color: b.present ? "#166534" : "#dc2626", fontWeight: 600, marginTop: 2 }}>
              {b.present ? `${b.confirmed} confirmed` : "Not in catalog"}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PctCell({ v, empty, bold }) {
  return (
    <td style={{ padding: "6px 8px", textAlign: "right", fontWeight: bold ? 800 : 600, color: empty ? "#cbd5e1" : barColor(v) }}>
      {empty ? "—" : `${v}%`}
    </td>
  );
}

function StatCard({ icon, label, value, color }) {
  return (
    <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, padding: "16px", textAlign: "center" }}>
      <div style={{ marginBottom: 8, color, display: "flex", justifyContent: "center" }}>
        {icon}
      </div>
      <div style={{ fontSize: 24, fontWeight: 900, color: color, marginBottom: 4 }}>
        {value.toLocaleString()}
      </div>
      <div style={{ fontSize: 11, color: "#64748b", fontWeight: 600 }}>
        {label}
      </div>
    </div>
  );
}

function OrphanCard({ entity, count }) {
  const isIssue = count > 0;
  return (
    <div style={{
      background: isIssue ? "#fef2f2" : "#f0fdf4",
      border: `1px solid ${isIssue ? "#fca5a5" : "#86efac"}`,
      borderRadius: 8,
      padding: "12px",
      textAlign: "center"
    }}>
      <div style={{ fontSize: 18, fontWeight: 900, color: isIssue ? "#dc2626" : "#22c55e", marginBottom: 4 }}>
        {count}
      </div>
      <div style={{ fontSize: 11, color: "#64748b", fontWeight: 600 }}>
        Orphaned {entity}
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const colors = {
    "Uploading": { bg: "#eff6ff", color: "#0284c7" },
    "Staged": { bg: "#f0fdf4", color: "#16a34a" },
    "Validating": { bg: "#fef3c7", color: "#b45309" },
    "Pending Review": { bg: "#fef2f2", color: "#dc2626" },
    "Committing": { bg: "#f3e8ff", color: "#9333ea" },
    "Committed": { bg: "#dcfce7", color: "#166534" },
    "Partially Committed": { bg: "#fef3c7", color: "#92400e" },
    "Rolled Back": { bg: "#fee2e2", color: "#991b1b" },
    "Failed": { bg: "#fecaca", color: "#7f1d1d" },
    "Cancelled": { bg: "#f1f5f9", color: "#64748b" },
  };
  const style = colors[status] || { bg: "#f1f5f9", color: "#64748b" };
  return (
    <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 4, background: style.bg, color: style.color }}>
      {status || "—"}
    </span>
  );
}