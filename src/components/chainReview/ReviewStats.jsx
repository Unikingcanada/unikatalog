/**
 * ReviewStats — summary cards shown at top of admin review panel
 */
export default function ReviewStats({ records }) {
  const total    = records.length;
  const pending  = records.filter(r => r.review_status === "Pending"  || (!r.review_status && r.needs_review)).length;
  const critical = records.filter(r => r.severity === "Critical").length;
  const approved = records.filter(r => r.review_status === "Approved").length;
  const rejected = records.filter(r => r.review_status === "Rejected").length;

  const stats = [
    { label: "Total Records", value: total,    color: "#1a3a5c", bg: "#eff6ff" },
    { label: "Pending Review", value: pending,  color: "#b45309", bg: "#fffbeb" },
    { label: "Critical Flags", value: critical, color: "#b91c1c", bg: "#fef2f2" },
    { label: "Approved",       value: approved, color: "#16a34a", bg: "#f0fdf4" },
    { label: "Rejected",       value: rejected, color: "#6b7280", bg: "#f8fafc" },
  ];

  return (
    <div style={{ display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap" }}>
      {stats.map(s => (
        <div key={s.label} style={{ background: s.bg, border: `1px solid ${s.color}22`, borderRadius: 10, padding: "12px 20px", minWidth: 120, flex: 1 }}>
          <div style={{ fontSize: 26, fontWeight: 900, color: s.color }}>{s.value}</div>
          <div style={{ fontSize: 11, fontWeight: 600, color: s.color, opacity: 0.75, marginTop: 2 }}>{s.label}</div>
        </div>
      ))}
    </div>
  );
}