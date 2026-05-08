/**
 * StatusBadge — review status pill used across all review rows
 */
export default function StatusBadge({ status, needsReview, resolved }) {
  if (resolved) return <Pill bg="#f0fdf4" fg="#16a34a" label="✓ Resolved" />;
  if (status === "Approved") return <Pill bg="#f0fdf4" fg="#16a34a" label="✓ Approved" />;
  if (status === "Rejected") return <Pill bg="#f1f5f9" fg="#64748b" label="✗ Rejected" />;
  if (status === "Pending" || needsReview) return <Pill bg="#fffbeb" fg="#b45309" label="⚑ Pending Review" />;
  return <Pill bg="#f1f5f9" fg="#94a3b8" label="Not Reviewed" />;
}

function Pill({ bg, fg, label }) {
  return (
    <span style={{ fontSize: 10, fontWeight: 700, background: bg, color: fg, padding: "2px 9px", borderRadius: 99 }}>
      {label}
    </span>
  );
}