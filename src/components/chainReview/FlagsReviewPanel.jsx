/**
 * FlagsReviewPanel — Flags tab with bulk select, bulk actions, advanced filters, and quick actions
 */
import { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import ReviewRowFlags from "./ReviewRowFlags";

const FLAG_TYPES = [
  "Missing Dimensions","Conflicting Specs","Unverified Equivalency","Missing Image",
  "Missing Performance Data","Missing Sprocket Data","Missing Attachment Data",
  "Discontinued — Needs Confirmation","Data Entry Error","Other",
];
const SEVERITIES = ["Critical","High","Medium","Low"];

const SEVERITY_COLORS = {
  Critical: ["#fef2f2","#b91c1c"],
  High:     ["#fff7ed","#c2410c"],
  Medium:   ["#fffbeb","#b45309"],
  Low:      ["#f0fdf4","#16a34a"],
};

export default function FlagsReviewPanel({ records, onRefresh, onActionMsg }) {
  const [selected, setSelected]         = useState(new Set());
  const [expandedId, setExpandedId]     = useState(null);
  const [bulkNote, setBulkNote]         = useState("");
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [bulkWorking, setBulkWorking]   = useState(false);
  const [quickWorking, setQuickWorking] = useState(false);

  // ── Filters ───────────────────────────────────────────────────────────────
  const [fType, setFType]       = useState("");
  const [fChain, setFChain]     = useState("");
  const [fSeverity, setFSeverity] = useState("");
  const [fDateFrom, setFDateFrom] = useState("");
  const [fDateTo, setFDateTo]   = useState("");
  const [fStatus, setFStatus]   = useState(""); // resolved / unresolved / all

  // ── Derived filtered list ─────────────────────────────────────────────────
  const filtered = useMemo(() => {
    return records.filter(r => {
      if (fType     && r.flag_type  !== fType)     return false;
      if (fSeverity && r.severity   !== fSeverity) return false;
      if (fChain    && !(r.chain_id || "").toLowerCase().includes(fChain.toLowerCase())) return false;
      if (fStatus === "resolved"   && !r.resolved)  return false;
      if (fStatus === "unresolved" &&  r.resolved)   return false;
      if (fDateFrom) {
        const d = new Date(r.created_date);
        if (isNaN(d) || d < new Date(fDateFrom)) return false;
      }
      if (fDateTo) {
        const d = new Date(r.created_date);
        if (isNaN(d) || d > new Date(fDateTo + "T23:59:59")) return false;
      }
      return true;
    });
  }, [records, fType, fSeverity, fChain, fStatus, fDateFrom, fDateTo]);

  // ── Selection helpers ─────────────────────────────────────────────────────
  const allSelected = filtered.length > 0 && filtered.every(r => selected.has(r.id));
  function toggleAll() {
    if (allSelected) setSelected(new Set());
    else setSelected(new Set(filtered.map(r => r.id)));
  }
  function toggleOne(id) {
    setSelected(prev => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  }
  const selectedRecords = filtered.filter(r => selected.has(r.id));

  // ── Bulk actions ──────────────────────────────────────────────────────────
  async function bulkApply(updates, successMsg) {
    setBulkWorking(true);
    try {
      for (const r of selectedRecords) {
        await base44.entities.Chain_Review_Flags.update(r.id, updates);
      }
      onActionMsg(`✓ ${successMsg} (${selectedRecords.length} flags)`);
      setSelected(new Set());
      setBulkNote("");
      setShowNoteInput(false);
      onRefresh();
    } catch (e) {
      onActionMsg("Error: " + e.message);
    } finally {
      setBulkWorking(false);
    }
  }

  function handleBulkApprove() {
    bulkApply({ review_status: "Approved", needs_review: false, resolved: true }, "Resolved");
  }
  function handleBulkAccepted() {
    bulkApply({
      review_status: "Approved", needs_review: false, resolved: true,
      resolution_notes: "Accepted limitation — intentionally blank or unavailable",
    }, "Marked as Accepted Limitation");
  }
  async function handleBulkNote() {
    if (!bulkNote.trim()) return;
    setBulkWorking(true);
    try {
      for (const r of selectedRecords) {
        await base44.entities.Chain_Review_Flags.update(r.id, { resolution_notes: bulkNote.trim() });
      }
      onActionMsg(`✓ Note applied to ${selectedRecords.length} flags`);
      setSelected(new Set());
      setBulkNote("");
      setShowNoteInput(false);
      onRefresh();
    } catch (e) {
      onActionMsg("Error: " + e.message);
    } finally {
      setBulkWorking(false);
    }
  }

  // ── Quick action: resolve all Missing Dimensions ──────────────────────────
  async function handleQuickResolveMissingDims() {
    setQuickWorking(true);
    try {
      const targets = records.filter(r => r.flag_type === "Missing Dimensions" && !r.resolved);
      for (const r of targets) {
        await base44.entities.Chain_Review_Flags.update(r.id, {
          review_status: "Approved",
          needs_review: false,
          resolved: true,
          resolution_notes: "Accepted limitation — missing dimension fields are intentionally blank or unavailable for this chain type.",
        });
      }
      onActionMsg(`✓ Resolved ${targets.length} "Missing Dimensions" flags`);
      onRefresh();
    } catch (e) {
      onActionMsg("Error: " + e.message);
    } finally {
      setQuickWorking(false);
    }
  }

  const missingDimsCount = records.filter(r => r.flag_type === "Missing Dimensions" && !r.resolved).length;

  return (
    <div>
      {/* ── Advanced Filters ── */}
      <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, padding: "14px 18px", marginBottom: 14, display: "flex", gap: 10, flexWrap: "wrap", alignItems: "flex-end" }}>
        <FilterField label="Flag Type">
          <select value={fType} onChange={e => setFType(e.target.value)} style={sel}>
            <option value="">All types</option>
            {FLAG_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </FilterField>
        <FilterField label="Severity">
          <select value={fSeverity} onChange={e => setFSeverity(e.target.value)} style={sel}>
            <option value="">All severities</option>
            {SEVERITIES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </FilterField>
        <FilterField label="Status">
          <select value={fStatus} onChange={e => setFStatus(e.target.value)} style={sel}>
            <option value="">All</option>
            <option value="unresolved">Unresolved</option>
            <option value="resolved">Resolved</option>
          </select>
        </FilterField>
        <FilterField label="Chain ID contains">
          <input value={fChain} onChange={e => setFChain(e.target.value)} placeholder="e.g. ANSI-40" style={{ ...sel, width: 130 }} />
        </FilterField>
        <FilterField label="Created from">
          <input type="date" value={fDateFrom} onChange={e => setFDateFrom(e.target.value)} style={sel} />
        </FilterField>
        <FilterField label="Created to">
          <input type="date" value={fDateTo} onChange={e => setFDateTo(e.target.value)} style={sel} />
        </FilterField>
        <button onClick={() => { setFType(""); setFSeverity(""); setFStatus(""); setFChain(""); setFDateFrom(""); setFDateTo(""); }}
          style={{ padding: "5px 12px", border: "1px solid #e2e8f0", borderRadius: 6, background: "#f8fafc", fontSize: 11, color: "#64748b", cursor: "pointer", alignSelf: "flex-end" }}>
          Clear
        </button>
        <span style={{ alignSelf: "flex-end", fontSize: 11, color: "#94a3b8", marginLeft: "auto" }}>
          {filtered.length} / {records.length} flags shown
        </span>
      </div>

      {/* ── Quick Action ── */}
      {missingDimsCount > 0 && (
        <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 10, padding: "12px 18px", marginBottom: 14, display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
          <div style={{ flex: 1 }}>
            <span style={{ fontSize: 13, fontWeight: 800, color: "#92400e" }}>⚡ Quick Action: </span>
            <span style={{ fontSize: 12, color: "#78350f" }}>
              Resolve all <strong>{missingDimsCount}</strong> unresolved "Missing Dimensions" flags as intentionally blank / unavailable.
            </span>
          </div>
          <button
            onClick={handleQuickResolveMissingDims}
            disabled={quickWorking}
            style={{ background: "#b45309", color: "#fff", border: "none", borderRadius: 7, padding: "7px 16px", fontSize: 12, fontWeight: 700, cursor: quickWorking ? "default" : "pointer", opacity: quickWorking ? 0.6 : 1 }}>
            {quickWorking ? "Resolving…" : `Resolve ${missingDimsCount} Flags`}
          </button>
        </div>
      )}

      {/* ── Bulk toolbar ── */}
      {selected.size > 0 && (
        <div style={{ background: "#1a3a5c", borderRadius: 10, padding: "10px 18px", marginBottom: 12, display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: "#fff" }}>{selected.size} selected</span>
          <button onClick={handleBulkApprove} disabled={bulkWorking} style={bBtn("#22c55e")}>✓ Resolve All</button>
          <button onClick={handleBulkAccepted} disabled={bulkWorking} style={bBtn("#f59e0b")}>📌 Accepted Limitation</button>
          <button onClick={() => setShowNoteInput(v => !v)} disabled={bulkWorking} style={bBtn("#6366f1")}>📝 Assign Note</button>
          <button onClick={() => setSelected(new Set())} style={{ ...bBtn("#94a3b8"), marginLeft: "auto" }}>Deselect</button>
        </div>
      )}

      {/* Bulk note input */}
      {showNoteInput && selected.size > 0 && (
        <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, padding: "12px 16px", marginBottom: 12, display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          <input
            value={bulkNote}
            onChange={e => setBulkNote(e.target.value)}
            placeholder={`Note to apply to ${selected.size} flags…`}
            style={{ flex: 1, minWidth: 200, padding: "7px 12px", border: "1px solid #e2e8f0", borderRadius: 6, fontSize: 12, outline: "none" }}
            onKeyDown={e => e.key === "Enter" && handleBulkNote()}
            autoFocus
          />
          <button onClick={handleBulkNote} disabled={bulkWorking || !bulkNote.trim()}
            style={{ padding: "7px 16px", border: "none", borderRadius: 6, background: "#1a3a5c", color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
            Apply Note
          </button>
          <button onClick={() => { setShowNoteInput(false); setBulkNote(""); }}
            style={{ padding: "7px 12px", border: "1px solid #e2e8f0", borderRadius: 6, background: "#f8fafc", color: "#64748b", fontSize: 12, cursor: "pointer" }}>
            Cancel
          </button>
        </div>
      )}

      {/* ── Records list ── */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "48px 20px", color: "#64748b", background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0" }}>
          No flags match the current filters.
        </div>
      ) : (
        <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0", overflow: "hidden" }}>
          {/* Select-all header */}
          <div style={{ padding: "8px 16px", background: "#f8fafc", borderBottom: "1px solid #e2e8f0", display: "flex", alignItems: "center", gap: 10 }}>
            <input type="checkbox" checked={allSelected} onChange={toggleAll}
              style={{ width: 15, height: 15, cursor: "pointer", accentColor: "#1a3a5c" }} />
            <span style={{ fontSize: 11, color: "#64748b", fontWeight: 600 }}>
              {allSelected ? "Deselect all" : `Select all ${filtered.length} visible`}
            </span>
          </div>

          {filtered.map((record, i) => {
            const isSelected = selected.has(record.id);
            const isExpanded = expandedId === record.id;
            const [, sevFg] = SEVERITY_COLORS[record.severity] || ["#f1f5f9","#94a3b8"];
            return (
              <div key={record.id}
                style={{ borderBottom: i < filtered.length - 1 ? "1px solid #f1f5f9" : "none", display: "flex", alignItems: "flex-start", gap: 0, background: isSelected ? "#f0f7ff" : "transparent" }}>
                {/* Checkbox column */}
                <div style={{ padding: "18px 14px 0 16px", flexShrink: 0 }}>
                  <input type="checkbox" checked={isSelected} onChange={() => toggleOne(record.id)}
                    style={{ width: 15, height: 15, cursor: "pointer", accentColor: "#1a3a5c" }} />
                </div>
                {/* Row */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <ReviewRowFlags
                    record={record}
                    expanded={isExpanded}
                    onToggle={() => setExpandedId(p => p === record.id ? null : record.id)}
                    onApprove={async () => {
                      await base44.entities.Chain_Review_Flags.update(record.id, { review_status: "Approved", needs_review: false, resolved: true });
                      onActionMsg("✓ Resolved");
                      onRefresh();
                    }}
                    onReject={async () => {
                      await base44.entities.Chain_Review_Flags.update(record.id, { review_status: "Rejected", needs_review: false });
                      onActionMsg("✓ Rejected");
                      onRefresh();
                    }}
                    onFlag={async () => {
                      await base44.entities.Chain_Review_Flags.update(record.id, { review_status: "Pending", needs_review: true, resolved: false });
                      onActionMsg("✓ Flagged for engineering review");
                      onRefresh();
                    }}
                    onSaveNotes={async (notes) => {
                      await base44.entities.Chain_Review_Flags.update(record.id, { resolution_notes: notes });
                      onActionMsg("✓ Notes saved");
                      onRefresh();
                    }}
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

function FilterField({ label, children }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <label style={{ fontSize: 10, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" }}>{label}</label>
      {children}
    </div>
  );
}

const sel = {
  padding: "5px 10px", border: "1px solid #e2e8f0", borderRadius: 6,
  fontSize: 11, color: "#1e293b", background: "#fff", outline: "none", cursor: "pointer",
};

function bBtn(bg) {
  return {
    background: bg, color: "#fff", border: "none", borderRadius: 6,
    padding: "6px 14px", fontSize: 11, fontWeight: 700, cursor: "pointer",
  };
}