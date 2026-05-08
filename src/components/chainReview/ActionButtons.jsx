/**
 * ActionButtons — Approve / Reject / Flag quick-action buttons
 */
export default function ActionButtons({ onApprove, onReject, onFlag, approveLabel = "Approve" }) {
  return (
    <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
      <button onClick={e => { e.stopPropagation(); onApprove(); }}
        style={btn("#f0fdf4", "#16a34a", "#bbf7d0")}>
        {approveLabel}
      </button>
      <button onClick={e => { e.stopPropagation(); onReject(); }}
        style={btn("#f1f5f9", "#64748b", "#e2e8f0")}>
        Reject
      </button>
      <button onClick={e => { e.stopPropagation(); onFlag(); }}
        style={btn("#fffbeb", "#b45309", "#fde68a")}>
        ⚑ Needs Eng. Review
      </button>
    </div>
  );
}

function btn(bg, color, border) {
  return {
    padding: "5px 11px", borderRadius: 6, border: `1px solid ${border}`,
    background: bg, color, fontSize: 11, fontWeight: 700, cursor: "pointer",
    whiteSpace: "nowrap", transition: "opacity 0.12s"
  };
}