/**
 * AIResolveButton.jsx
 * 
 * Adds an "AI Resolve" button to conflict/FK_Fail staging records.
 * Calls InvokeLLM to compare incoming data vs existing record and
 * recommend: Merge, Skip, or Create New — with justification.
 */
import { useState } from "react";
import { base44 } from "@/api/base44Client";

const ACTION_COLORS = {
  "Merge":      { bg: "#eff6ff", border: "#93c5fd", text: "#1d4ed8", dot: "#3b82f6" },
  "Skip":       { bg: "#fef2f2", border: "#fca5a5", text: "#dc2626", dot: "#ef4444" },
  "Create New": { bg: "#f0fdf4", border: "#86efac", text: "#166534", dot: "#22c55e" },
};

export default function AIResolveButton({ record, onApplyDecision }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null); // { action, justification }
  const [error, setError] = useState(null);

  async function handleResolve() {
    setLoading(true);
    setError(null);
    setResult(null);

    const incomingData = record.mapped_data || record.raw_data || {};
    const existingData = record.diff_summary
      ? Object.fromEntries(Object.entries(record.diff_summary).map(([f, v]) => [f, v.old]))
      : null;

    const prompt = `You are a data quality analyst for an industrial chain procurement catalog (UniKatalog).

A data import has flagged this record as "${record.record_status}" during staging.

## Incoming Import Data (what we're trying to import):
${JSON.stringify(incomingData, null, 2)}

## Existing Production Record (what's already in the database):
${existingData ? JSON.stringify(existingData, null, 2) : "No existing record found (FK_Fail — referenced chain_id does not exist in production)."}

## Conflict / Error Detail:
${record.conflict_detail || "No detail provided."}

## Entity Target:
${record.entity_target || "Normalized_Chains"}

## Your Task:
Analyze the data and recommend ONE of these actions:
- **Merge**: The incoming data should overwrite or enrich the existing record (fields are compatible, incoming is an update or improvement).
- **Skip**: The incoming data is a duplicate, low-quality, or would degrade the existing record (skip it).
- **Create New**: The incoming data represents a genuinely new record that should be created (no true conflict, or FK target should be created first).

Respond with a JSON object only, no markdown:
{
  "action": "Merge" | "Skip" | "Create New",
  "justification": "1–2 sentence explanation of your reasoning."
}`;

    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            action: { type: "string", enum: ["Merge", "Skip", "Create New"] },
            justification: { type: "string" },
          },
          required: ["action", "justification"],
        },
      });
      setResult(res);
    } catch (e) {
      setError("AI resolution failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleApply() {
    if (!result) return;
    // Map AI action → commit_decision
    const decision = result.action === "Skip" ? "Skip" : "Include";
    onApplyDecision(record.id, decision);
  }

  const colors = result ? (ACTION_COLORS[result.action] || ACTION_COLORS["Skip"]) : null;

  return (
    <div style={{ marginTop: 12 }}>
      {/* Trigger button */}
      {!result && (
        <button
          onClick={handleResolve}
          disabled={loading}
          style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            padding: "5px 13px", borderRadius: 7, fontSize: 11, fontWeight: 700,
            cursor: loading ? "default" : "pointer",
            border: "1px solid #a78bfa",
            background: loading ? "#f5f3ff" : "#ede9fe",
            color: "#6d28d9",
            transition: "all 0.15s",
          }}
        >
          {loading ? (
            <>
              <span style={{ display: "inline-block", width: 10, height: 10, borderRadius: "50%", border: "2px solid #a78bfa", borderTopColor: "#6d28d9", animation: "spin 0.7s linear infinite" }} />
              Analyzing…
            </>
          ) : (
            <>✦ AI Resolve</>
          )}
        </button>
      )}

      {/* Error */}
      {error && (
        <div style={{ fontSize: 10, color: "#dc2626", marginTop: 6 }}>{error}</div>
      )}

      {/* Result panel */}
      {result && (
        <div style={{
          background: colors.bg, border: `1px solid ${colors.border}`,
          borderRadius: 8, padding: "10px 14px", marginTop: 0,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, flexWrap: "wrap" }}>
            <span style={{ fontSize: 10, fontWeight: 800, color: "#6d28d9", textTransform: "uppercase", letterSpacing: 0.5 }}>
              ✦ AI Recommendation
            </span>
            <span style={{
              display: "inline-flex", alignItems: "center", gap: 4,
              background: "#fff", border: `1px solid ${colors.border}`,
              borderRadius: 99, padding: "2px 10px", fontSize: 11, fontWeight: 800, color: colors.text,
            }}>
              <span style={{ width: 5, height: 5, borderRadius: "50%", background: colors.dot, display: "inline-block" }} />
              {result.action}
            </span>
          </div>

          <p style={{ fontSize: 11, color: "#334155", lineHeight: 1.6, margin: "0 0 10px" }}>
            {result.justification}
          </p>

          <div style={{ display: "flex", gap: 7, alignItems: "center" }}>
            <button
              onClick={handleApply}
              style={{
                padding: "4px 12px", borderRadius: 6, fontSize: 10, fontWeight: 700, cursor: "pointer",
                border: `1px solid ${colors.border}`, background: colors.bg, color: colors.text,
              }}
            >
              Apply: {result.action === "Skip" ? "Skip" : "Include"}
            </button>
            <button
              onClick={() => setResult(null)}
              style={{
                padding: "4px 10px", borderRadius: 6, fontSize: 10, fontWeight: 600, cursor: "pointer",
                border: "1px solid #e2e8f0", background: "#fff", color: "#94a3b8",
              }}
            >
              Re-analyze
            </button>
          </div>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}