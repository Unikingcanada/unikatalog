/**
 * ChainImportPanel.jsx
 *
 * Admin UI for the Normalized Chain Import + Mapping System.
 * CHAINS ECOSYSTEM ONLY.
 *
 * Panels:
 * 1. Import Simulator — paste records, run import engine, preview results
 * 2. Equivalency Gaps — which chains are missing which manufacturers
 * 3. Import Stats — coverage, confidence breakdown
 */

import { useState, useMemo } from "react";
import {
  processBatchImport,
  validateImportBatch,
  analyzeEquivalencyGaps,
  formatImportResultSummary,
  MANUFACTURER_PROFILES,
  IMPORT_STATUS,
  CONFIDENCE,
} from "@/lib/chainImportEngine";
import { getEquivalencyStats } from "@/lib/chainEquivalencyEngine";
import { NORMALIZED_CHAINS } from "@/lib/chainNormalizedDictionary";

const C = {
  navy: "#003c5b", navyMid: "#1A3A5C", navyLight: "#2A5080",
  bg: "#f8fafc", card: "#ffffff", border: "#e2e8f0",
  text: "#0f172a", muted: "#64748b", slate: "#334155",
  green: "#16a34a", greenBg: "#f0fdf4",
  amber: "#d97706", amberBg: "#fffbeb",
  red: "#dc2626", redBg: "#fef2f2",
  blue: "#2563eb", blueBg: "#eff6ff",
  purple: "#7c3aed", purpleBg: "#ede9fe",
};

const STATUS_CONFIG = {
  [IMPORT_STATUS.MERGED]:          { color: C.green,  bg: C.greenBg,  icon: "✓", label: "Merged" },
  [IMPORT_STATUS.NEW_CANDIDATE]:   { color: C.blue,   bg: C.blueBg,   icon: "★", label: "New Candidate" },
  [IMPORT_STATUS.DUPLICATE_SKIP]:  { color: C.muted,  bg: "#f1f5f9",  icon: "—", label: "Duplicate" },
  [IMPORT_STATUS.CONFLICT]:        { color: C.amber,  bg: C.amberBg,  icon: "⚠", label: "Conflict" },
};

function Badge({ label, color, bg, border }) {
  return (
    <span style={{
      fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 20,
      background: bg, color, border: `1px solid ${border || color}`,
      whiteSpace: "nowrap",
    }}>{label}</span>
  );
}

function SectionTitle({ children }) {
  return (
    <div style={{ fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: "1px", color: C.muted, marginBottom: 10, paddingBottom: 6, borderBottom: "1px solid " + C.border }}>
      {children}
    </div>
  );
}

function StatCard({ label, value, color }) {
  return (
    <div style={{ background: C.card, border: "1px solid " + C.border, borderRadius: 8, padding: "14px 18px", textAlign: "center" }}>
      <div style={{ fontSize: 28, fontWeight: 900, color: color || C.navy }}>{value}</div>
      <div style={{ fontSize: 11, color: C.muted, marginTop: 3, fontWeight: 600 }}>{label}</div>
    </div>
  );
}

// ─── Tab: Import Simulator ─────────────────────────────────────────────────────
function ImportSimulator() {
  const [manufacturer, setManufacturer] = useState("Donghua");
  const [rawInput, setRawInput] = useState("");
  const [results, setResults] = useState(null);
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState(null);
  const [expandedIdx, setExpandedIdx] = useState(null);

  const SAMPLE_DONGHUA = JSON.stringify([
    { chain_no: "80A-1", series: "A Series Short Pitch Precision Roller Chain", chain_type: "Drive Chain", pitch_mm: 25.40, roller_dia_mm: 15.88, inner_width_mm: 15.88, tensile_strength_kn: 71.2, weight_kg_m: 2.6 },
    { chain_no: "40A-1", series: "A Series Short Pitch Precision Roller Chain", chain_type: "Drive Chain", pitch_mm: 12.70, roller_dia_mm: 7.92, inner_width_mm: 7.85, tensile_strength_kn: 17.8 },
    { chain_no: "NEWCHAIN-999", series: "Mystery Chain", chain_type: "Drive Chain", pitch_mm: 99.0, tensile_strength_kn: 500 },
  ], null, 2);

  function runImport() {
    setError(null);
    setResults(null);
    setSummary(null);

    let records;
    try {
      records = JSON.parse(rawInput);
      if (!Array.isArray(records)) records = [records];
    } catch (e) {
      setError("Invalid JSON. Paste a JSON array of chain records.");
      return;
    }

    const validation = validateImportBatch(records, manufacturer);
    if (!validation.valid) {
      setError(validation.issues.filter(i => i.severity === "error").map(i => i.message).join("\n"));
      return;
    }

    const { results: r, summary: s } = processBatchImport(records, manufacturer);
    setResults(r);
    setSummary(s);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ background: C.blueBg, border: "1px solid #bfdbfe", borderRadius: 8, padding: "12px 16px", fontSize: 12, color: "#1e40af" }}>
        <strong>Import Simulator</strong> — paste manufacturer catalog records as JSON. The engine will match each record to the normalized dictionary, detect duplicates, flag conflicts, and show what actions would be applied. No data is written — this is a preview only.
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, marginBottom: 6 }}>MANUFACTURER</div>
          <select value={manufacturer} onChange={e => setManufacturer(e.target.value)}
            style={{ width: "100%", padding: "8px 12px", border: "1px solid " + C.border, borderRadius: 6, fontSize: 13, outline: "none", background: "#fff" }}>
            {Object.keys(MANUFACTURER_PROFILES).map(m =>
              <option key={m} value={m}>{m}</option>
            )}
          </select>
        </div>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, marginBottom: 6 }}>CODE STYLE</div>
          <div style={{ padding: "8px 12px", background: C.bg, border: "1px solid " + C.border, borderRadius: 6, fontSize: 12, color: C.slate }}>
            {MANUFACTURER_PROFILES[manufacturer]?.code_style || "—"} · {MANUFACTURER_PROFILES[manufacturer]?.confidence_default}
          </div>
        </div>
      </div>

      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: C.muted }}>RECORDS JSON</div>
          <button onClick={() => setRawInput(SAMPLE_DONGHUA)}
            style={{ fontSize: 11, color: C.blue, background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}>
            Load sample (Donghua)
          </button>
        </div>
        <textarea
          value={rawInput}
          onChange={e => setRawInput(e.target.value)}
          placeholder={`Paste JSON array of ${manufacturer} records here...\n[\n  { "part_number": "80", "pitch_in": "1.000", ... },\n  ...\n]`}
          style={{ width: "100%", height: 180, padding: 12, border: "1px solid " + C.border, borderRadius: 6, fontSize: 12, fontFamily: "monospace", resize: "vertical", outline: "none", boxSizing: "border-box" }}
        />
      </div>

      {error && (
        <div style={{ background: C.redBg, border: "1px solid #fca5a5", borderRadius: 6, padding: "10px 14px", fontSize: 12, color: C.red }}>
          {error}
        </div>
      )}

      <button onClick={runImport}
        style={{ background: C.navy, color: "#fff", border: "none", borderRadius: 8, padding: "10px 24px", fontSize: 13, fontWeight: 700, cursor: "pointer", alignSelf: "flex-start" }}>
        Run Import Analysis →
      </button>

      {summary && (
        <div>
          <SectionTitle>Import Summary</SectionTitle>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px,1fr))", gap: 10, marginBottom: 20 }}>
            <StatCard label="Total" value={summary.total} />
            <StatCard label="Merged" value={summary.merged} color={C.green} />
            <StatCard label="New Candidates" value={summary.new_candidates} color={C.blue} />
            <StatCard label="Duplicates" value={summary.duplicates_skipped} color={C.muted} />
            <StatCard label="Conflicts" value={summary.conflicts} color={summary.conflicts > 0 ? C.amber : C.muted} />
            <StatCard label="Actions" value={summary.total_actions} color={C.navy} />
          </div>
        </div>
      )}

      {results && results.map((r, i) => {
        const cfg = STATUS_CONFIG[r.status] || { color: C.muted, bg: "#f1f5f9", icon: "?", label: r.status };
        const fmt = formatImportResultSummary(r);
        const isExpanded = expandedIdx === i;

        return (
          <div key={i} style={{ border: `1px solid ${r.conflicts.length > 0 ? "#fbbf24" : C.border}`, borderRadius: 8, overflow: "hidden", background: C.card }}>
            <div onClick={() => setExpandedIdx(isExpanded ? null : i)}
              style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", cursor: "pointer", background: isExpanded ? C.bg : C.card }}>
              <span style={{ fontSize: 16, width: 20, textAlign: "center" }}>{cfg.icon}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                  <span style={{ fontWeight: 700, fontSize: 13, color: C.text }}>{r.manufacturer} · {r.source_code}</span>
                  <Badge label={cfg.label} color={cfg.color} bg={cfg.bg} />
                  {r.normalized_chain_id && <span style={{ fontSize: 12, color: C.muted }}>→ {r.normalized_chain_id}</span>}
                  {fmt.match_strategy && <span style={{ fontSize: 10, color: C.muted }}>({fmt.match_strategy})</span>}
                </div>
                {r.source_description && <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{r.source_description}</div>}
              </div>
              <div style={{ display: "flex", gap: 8, flexShrink: 0, alignItems: "center" }}>
                {r.conflicts.length > 0 && <Badge label={`${r.conflicts.length} conflicts`} color={C.amber} bg={C.amberBg} />}
                {r.warnings.length > 0 && <Badge label={`${r.warnings.length} warnings`} color={C.muted} bg="#f1f5f9" />}
                <span style={{ fontSize: 11, color: C.muted }}>{isExpanded ? "▲" : "▼"}</span>
              </div>
            </div>

            {isExpanded && (
              <div style={{ padding: "14px 16px", borderTop: "1px solid " + C.border, display: "flex", flexDirection: "column", gap: 14 }}>
                {/* Actions */}
                {r.actions.length > 0 && (
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: C.green, textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 8 }}>
                      Actions ({r.actions.length})
                    </div>
                    {r.actions.map((a, ai) => (
                      <div key={ai} style={{ display: "flex", gap: 8, padding: "6px 0", borderBottom: "1px solid " + C.bg, fontSize: 12 }}>
                        <span style={{ color: C.green, fontWeight: 700, flexShrink: 0 }}>+</span>
                        <div>
                          <span style={{ color: C.slate }}>{a.message}</span>
                          {a.type === "add_source_ref" && (
                            <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>
                              {a.ref.catalog_url && <span>Catalog: {a.ref.catalog_url} · </span>}
                              Confidence: {a.ref.confidence}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Conflicts */}
                {r.conflicts.length > 0 && (
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: C.amber, textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 8 }}>
                      Conflicts — Baseline Preserved ({r.conflicts.length})
                    </div>
                    {r.conflicts.map((c, ci) => (
                      <div key={ci} style={{ background: C.amberBg, border: "1px solid #fbbf24", borderRadius: 6, padding: "8px 12px", fontSize: 12, marginBottom: 6 }}>
                        <strong style={{ color: C.amber }}>{c.type}</strong>
                        {c.field && <span style={{ color: C.slate }}> · {c.field}: existing={c.existing_value}, incoming={c.incoming_value}</span>}
                        {c.message && <div style={{ color: C.muted, marginTop: 3 }}>{c.message}</div>}
                      </div>
                    ))}
                  </div>
                )}

                {/* Warnings */}
                {r.warnings.length > 0 && (
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 6 }}>
                      Warnings
                    </div>
                    {r.warnings.map((w, wi) => (
                      <div key={wi} style={{ fontSize: 12, color: C.muted, padding: "4px 0", borderBottom: "1px solid " + C.bg }}>⚠ {w}</div>
                    ))}
                  </div>
                )}

                {/* New candidate — show suggested chain structure */}
                {r.status === IMPORT_STATUS.NEW_CANDIDATE && r.actions[0]?.suggested_chain_id && (
                  <div style={{ background: C.blueBg, border: "1px solid #93c5fd", borderRadius: 8, padding: "12px 14px" }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: C.blue, textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 8 }}>
                      Suggested New Normalized Chain
                    </div>
                    <div style={{ fontFamily: "monospace", fontSize: 11, color: C.slate, whiteSpace: "pre-wrap" }}>
{JSON.stringify({
  chain_id: r.actions[0].suggested_chain_id,
  chain_number: r.actions[0].suggested_chain_number,
  pitch_in: r.actions[0].suggested_pitch_in,
  pitch_mm: r.actions[0].suggested_pitch_mm,
  description: r.actions[0].suggested_description,
  source_refs: [r.actions[0].suggested_source_ref],
  status: "Pending Review",
}, null, 2)}
                    </div>
                    <div style={{ fontSize: 11, color: C.blue, marginTop: 8 }}>
                      ★ Copy the above and add to chainNormalizedDictionary.js after engineering review.
                    </div>
                  </div>
                )}

                {/* Attachment results */}
                {r.attachment_results.length > 0 && (
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 6 }}>
                      Attachment Mapping
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                      {r.attachment_results.map((a, ai) => (
                        <span key={ai} style={{ fontSize: 11, padding: "2px 8px", borderRadius: 20, fontWeight: 700,
                          background: a.existing ? C.greenBg : C.redBg,
                          color: a.existing ? C.green : C.red,
                          border: `1px solid ${a.existing ? "#86efac" : "#fca5a5"}` }}>
                          {a.alias_from ? `${a.alias_from} → ${a.code}` : a.code}
                          {!a.existing && " (new)"}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Tab: Equivalency Gaps ─────────────────────────────────────────────────────
function EquivalencyGapsPanel() {
  const [selectedMfrs, setSelectedMfrs] = useState(["Tsubaki", "Rexnord", "Connexus", "Webster", "FMC"]);
  const gaps = useMemo(() => analyzeEquivalencyGaps(selectedMfrs.length > 0 ? selectedMfrs : null), [selectedMfrs]);

  const allMfrs = Object.keys(MANUFACTURER_PROFILES);

  function toggleMfr(m) {
    setSelectedMfrs(prev => prev.includes(m) ? prev.filter(x => x !== m) : [...prev, m]);
  }

  const highPriority = gaps.filter(g => g.priority === "high");
  const normalPriority = gaps.filter(g => g.priority === "normal");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ background: C.amberBg, border: "1px solid #fbbf24", borderRadius: 8, padding: "12px 16px", fontSize: 12, color: "#92400e" }}>
        <strong>Equivalency Gap Analyzer</strong> — shows which normalized chains are missing source mappings for selected manufacturers. Use this to prioritize import and mapping work.
      </div>

      {/* Manufacturer filter */}
      <div>
        <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, marginBottom: 8 }}>CHECK FOR MISSING MANUFACTURERS</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {allMfrs.map(m => (
            <button key={m} onClick={() => toggleMfr(m)}
              style={{ padding: "4px 12px", borderRadius: 20, fontSize: 11, fontWeight: 700, cursor: "pointer",
                border: `1px solid ${selectedMfrs.includes(m) ? C.navy : C.border}`,
                background: selectedMfrs.includes(m) ? C.navy : "#fff",
                color: selectedMfrs.includes(m) ? "#fff" : C.muted }}>
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* Summary */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px,1fr))", gap: 10 }}>
        <StatCard label="Chains with Gaps" value={gaps.length} color={gaps.length > 0 ? C.amber : C.green} />
        <StatCard label="High Priority" value={highPriority.length} color={highPriority.length > 0 ? C.red : C.muted} />
        <StatCard label="Normal Priority" value={normalPriority.length} color={C.muted} />
        <StatCard label="Fully Mapped" value={NORMALIZED_CHAINS.length - gaps.length} color={C.green} />
      </div>

      {/* Gap list */}
      {gaps.length === 0 ? (
        <div style={{ textAlign: "center", padding: 40, color: C.green, fontSize: 14, fontWeight: 600 }}>
          ✓ All selected manufacturers are mapped for all normalized chains.
        </div>
      ) : (
        <div>
          {highPriority.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "1px", color: C.red, marginBottom: 8 }}>High Priority Gaps</div>
              {highPriority.map((g, i) => <GapRow key={i} gap={g} />)}
            </div>
          )}
          {normalPriority.length > 0 && (
            <div>
              <div style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "1px", color: C.muted, marginBottom: 8 }}>Other Gaps</div>
              {normalPriority.map((g, i) => <GapRow key={i} gap={g} />)}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function GapRow({ gap }) {
  return (
    <div style={{ border: "1px solid " + C.border, borderRadius: 8, padding: "12px 16px", marginBottom: 8, background: C.card, display: "flex", alignItems: "flex-start", gap: 14, flexWrap: "wrap" }}>
      <div style={{ flex: 1, minWidth: 200 }}>
        <div style={{ fontWeight: 700, fontSize: 13, color: C.text }}>{gap.display_name}</div>
        <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{gap.chain_id} · {gap.chain_family}</div>
      </div>
      <div style={{ flexShrink: 0 }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: C.green, textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: 4 }}>Mapped</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
          {gap.mapped_manufacturers.map(m => (
            <span key={m} style={{ fontSize: 10, padding: "1px 7px", borderRadius: 20, background: C.greenBg, color: C.green, border: "1px solid #86efac", fontWeight: 600 }}>{m}</span>
          ))}
        </div>
      </div>
      <div style={{ flexShrink: 0 }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: C.red, textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: 4 }}>Missing</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
          {gap.missing_manufacturers.map(m => (
            <span key={m} style={{ fontSize: 10, padding: "1px 7px", borderRadius: 20, background: C.redBg, color: C.red, border: "1px solid #fca5a5", fontWeight: 600 }}>{m}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Tab: Coverage Stats ──────────────────────────────────────────────────────
function CoverageStats() {
  const stats = useMemo(() => getEquivalencyStats(), []);

  const familyCounts = useMemo(() => {
    const c = {};
    for (const chain of NORMALIZED_CHAINS) {
      c[chain.chain_family] = (c[chain.chain_family] || 0) + 1;
    }
    return Object.entries(c).sort((a, b) => b[1] - a[1]);
  }, []);

  const confidenceCounts = useMemo(() => {
    const c = { Confirmed: 0, "Needs Review": 0, "Missing Data – Needs Mapping": 0 };
    for (const chain of NORMALIZED_CHAINS) {
      for (const ref of (chain.source_refs || [])) {
        c[ref.confidence] = (c[ref.confidence] || 0) + 1;
      }
    }
    return c;
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Headline stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px,1fr))", gap: 10 }}>
        <StatCard label="Normalized Chains" value={stats.total_normalized_chains} color={C.navy} />
        <StatCard label="Equivalency Mappings" value={stats.total_equivalency_mappings} color={C.navy} />
        <StatCard label="Manufacturers" value={stats.manufacturers_covered} color={C.navy} />
        <StatCard label="Confirmed Refs" value={confidenceCounts["Confirmed"]} color={C.green} />
        <StatCard label="Needs Review" value={confidenceCounts["Needs Review"]} color={C.amber} />
        <StatCard label="Missing Data" value={confidenceCounts["Missing Data – Needs Mapping"] || 0} color={C.red} />
      </div>

      {/* Manufacturer list */}
      <div>
        <SectionTitle>Manufacturer Coverage</SectionTitle>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {stats.manufacturer_list.map(m => (
            <div key={m} style={{ padding: "6px 14px", background: C.bg, border: "1px solid " + C.border, borderRadius: 20, fontSize: 12, fontWeight: 600, color: C.slate }}>
              {m}
            </div>
          ))}
        </div>
      </div>

      {/* Family breakdown */}
      <div>
        <SectionTitle>Chains by Family</SectionTitle>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {familyCounts.map(([family, count]) => {
            const pct = Math.round((count / stats.total_normalized_chains) * 100);
            return (
              <div key={family} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 180, fontSize: 12, color: C.slate, flexShrink: 0 }}>{family.replace(/_/g, " ")}</div>
                <div style={{ flex: 1, height: 8, background: C.bg, borderRadius: 4, overflow: "hidden" }}>
                  <div style={{ width: pct + "%", height: "100%", background: C.navyMid, borderRadius: 4 }} />
                </div>
                <div style={{ width: 30, fontSize: 12, fontWeight: 700, color: C.navyMid, textAlign: "right" }}>{count}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Architecture rules */}
      <div style={{ background: C.bg, border: "1px solid " + C.border, borderRadius: 8, padding: "14px 16px" }}>
        <SectionTitle>Import Engine Architecture Rules</SectionTitle>
        <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
          {[
            "✓ One normalized chain per chain number/geometry — no duplicates",
            "✓ Never overwrites normalized baseline dimensions automatically",
            "✓ Conflicting specs preserved and flagged for review",
            "✓ Performance data stored per-source — no overwrite",
            "✓ Image priority system: exact > catalog site > generated",
            "✓ Attachment normalization with alias mapping",
            "✓ Source traceability on every mapping",
            "✓ Supports: Allied-Locke, MAC Chain, Donghua, Tsubaki, Peer, Rexnord, Renold, Connexus, Can-Am, Webster, FMC",
            "✓ Future manufacturers: add to MANUFACTURER_PROFILES — no architecture changes needed",
          ].map((rule, i) => (
            <div key={i} style={{ fontSize: 12, color: C.slate, padding: "3px 0", borderBottom: i < 8 ? "1px solid " + C.bg : "none" }}>{rule}</div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Main Panel ───────────────────────────────────────────────────────────────
export default function ChainImportPanel({ onBack }) {
  const [tab, setTab] = useState("simulator");

  const tabs = [
    { key: "simulator", label: "Import Simulator" },
    { key: "gaps", label: "Equivalency Gaps" },
    { key: "coverage", label: "Coverage Stats" },
  ];

  return (
    <div style={{ fontFamily: "'Inter','Segoe UI',Arial,sans-serif", maxWidth: 900, margin: "0 auto", padding: "0 0 40px" }}>
      {/* Header */}
      <div style={{ background: C.navy, borderRadius: "10px 10px 0 0", padding: "20px 28px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "2px", color: "rgba(255,255,255,0.4)", marginBottom: 6 }}>
              CHAINS ECOSYSTEM ONLY
            </div>
            <div style={{ fontSize: 20, fontWeight: 800, color: "#fff" }}>Normalized Chain Import Engine</div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", marginTop: 4 }}>
              Smart import, equivalency matching, and coverage analysis for the Uniking chain procurement platform
            </div>
          </div>
          {onBack && (
            <button onClick={onBack}
              style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)", color: "#fff", padding: "6px 14px", borderRadius: 6, cursor: "pointer", fontSize: 12, fontWeight: 600 }}>
              ← Back
            </button>
          )}
        </div>

        <div style={{ display: "flex", gap: 2, marginTop: 18 }}>
          {tabs.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              style={{ padding: "8px 18px", background: tab === t.key ? "rgba(255,255,255,0.15)" : "transparent",
                border: "none", color: tab === t.key ? "#fff" : "rgba(255,255,255,0.5)",
                borderRadius: "6px 6px 0 0", cursor: "pointer", fontSize: 13, fontWeight: tab === t.key ? 700 : 400 }}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab body */}
      <div style={{ background: C.card, border: "1px solid " + C.border, borderTop: "none", borderRadius: "0 0 10px 10px", padding: "24px 28px" }}>
        {tab === "simulator" && <ImportSimulator />}
        {tab === "gaps"      && <EquivalencyGapsPanel />}
        {tab === "coverage"  && <CoverageStats />}
      </div>
    </div>
  );
}