/**
 * ReviewFilterBar — filter pills for the admin review panel
 */
const FILTERS = [
  { key: "all",      label: "All Records",                 color: "#1a3a5c" },
  { key: "pending",  label: "Pending Review",              color: "#b45309" },
  { key: "critical", label: "Critical Engineering Review", color: "#b91c1c" },
  { key: "approved", label: "Approved",                    color: "#16a34a" },
  { key: "rejected", label: "Rejected",                    color: "#6b7280" },
];

export default function ReviewFilterBar({ filter, onChange, counts }) {
  return (
    <div style={{ display: "flex", gap: 8, padding: "14px 0", flexWrap: "wrap", marginBottom: 8 }}>
      {FILTERS.map(f => {
        const active = filter === f.key;
        return (
          <button key={f.key} onClick={() => onChange(f.key)}
            style={{
              padding: "6px 14px", borderRadius: 99, border: `1px solid ${active ? f.color : "#e2e8f0"}`,
              background: active ? f.color : "#fff",
              color: active ? "#fff" : f.color,
              fontSize: 12, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 6,
              transition: "all 0.12s"
            }}>
            {f.label}
            <span style={{
              background: active ? "rgba(255,255,255,0.25)" : "#f1f5f9",
              color: active ? "#fff" : "#64748b",
              borderRadius: 99, padding: "1px 7px", fontSize: 10, fontWeight: 800
            }}>
              {counts[f.key] ?? 0}
            </span>
          </button>
        );
      })}
    </div>
  );
}