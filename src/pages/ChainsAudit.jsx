import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { AlertCircle, CheckCircle2, Database, BarChart3 } from "lucide-react";

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
  const [error, setError] = useState(null);

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

      {error && (
        <div style={{ background: "#fef2f2", border: "1px solid #fca5a5", borderRadius: 8, padding: "12px 16px", marginBottom: 20, color: "#dc2626", fontSize: 12 }}>
          ⚠ {error}
        </div>
      )}

      {/* Core counts row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12, marginBottom: 24 }}>
        <StatCard icon={<Database className="w-5 h-5" />} label="DB Normalized Chains" value={stats.normalizedChainsCount} color="#0C2340" />
        <StatCard icon={<Database className="w-5 h-5" />} label="Unique Chain IDs" value={stats.mergedChainCount} color="#2563eb" />
        <StatCard icon={<BarChart3 className="w-5 h-5" />} label="Raw Imports (all)" value={stats.rawImportsCount} color="#8b5cf6" />
        <StatCard icon={<AlertCircle className="w-5 h-5" />} label="Duplicate Chain IDs" value={stats.duplicateChainIds} color={stats.duplicateChainIds > 0 ? "#dc2626" : "#22c55e"} />
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

      {/* Summary */}
      <div style={{ marginTop: 24, padding: "14px 16px", background: "#f0fdf4", border: "1px solid #86efac", borderRadius: 8, fontSize: 12, color: "#166534" }}>
        <strong>✓ Consolidation Status:</strong> {stats.normalizedChainsCount} chains in DB · {stats.mergedChainCount} unique IDs · {stats.rawImportsCount} raw imports tracked · {stats.duplicateChainIds > 0 ? `⚠ ${stats.duplicateChainIds} duplicates detected` : "No duplicates"}
      </div>
    </div>
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