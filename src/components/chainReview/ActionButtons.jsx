/**
 * ActionButtons — Approve / Reject / Flag quick-action buttons
 */
export default function ActionButtons({ onApprove, onReject, onFlag, approveLabel = "Approve" }) {
  return (
    <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
      <button onClick={e => { e.stopPropagation(); onApprove(); }}
        style={btn("#f0fdf4", "#2E7D46", "#bbf7d0")}>
        {approveLabel}
      </button>
      <button onClick={e => { e.stopPropagation(); onReject(); }}
        style={btn("#ECEAE4", "#3A4A66", "#D9D6CE")}>
        Reject
      </button>
      <button onClick={e => { e.stopPropagation(); onFlag(); }}
        style={btn("#fffbeb", "#B8860B", "#fde68a")}>
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