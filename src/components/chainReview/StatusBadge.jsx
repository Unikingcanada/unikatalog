/**
 * StatusBadge — review status pill used across all review rows
 */
export default function StatusBadge({ status, needsReview, resolved }) {
  if (resolved) return <Pill bg="#f0fdf4" fg="#2E7D46" label="✓ Resolved" />;
  if (status === "Approved") return <Pill bg="#f0fdf4" fg="#2E7D46" label="✓ Approved" />;
  if (status === "Rejected") return <Pill bg="#ECEAE4" fg="#3A4A66" label="✗ Rejected" />;
  if (status === "Pending" || needsReview) return <Pill bg="#fffbeb" fg="#B8860B" label="⚑ Pending Review" />;
  return <Pill bg="#ECEAE4" fg="#8A94A6" label="Not Reviewed" />;
}

function Pill({ bg, fg, label }) {
  return (
    <span style={{ fontSize: 10, fontWeight: 700, background: bg, color: fg, padding: "2px 9px", borderRadius: 99 }}>
      {label}
    </span>
  );
}