/**
 * ReviewFilterBar — filter pills for the admin review panel
 */
const FILTERS = [
  { key: "all",      label: "All Records",                 color: "#0E1F3A" },
  { key: "pending",  label: "Pending Review",              color: "#B8860B" },
  { key: "critical", label: "Critical Engineering Review", color: "#C62828" },
  { key: "approved", label: "Approved",                    color: "#2E7D46" },
  { key: "rejected", label: "Rejected",                    color: "#3A4A66" },
];

export default function ReviewFilterBar({ filter, onChange, counts }) {
  return (
    <div style={{ display: "flex", gap: 8, padding: "14px 0", flexWrap: "wrap", marginBottom: 8 }}>
      {FILTERS.map(f => {
        const active = filter === f.key;
        return (
          <button key={f.key} onClick={() => onChange(f.key)}
            style={{
              padding: "6px 14px", borderRadius: 99, border: `1px solid ${active ? f.color : "#D9D6CE"}`,
              background: active ? f.color : "#fff",
              color: active ? "#fff" : f.color,
              fontSize: 12, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 6,
              transition: "all 0.12s"
            }}>
            {f.label}
            <span style={{
              background: active ? "rgba(255,255,255,0.25)" : "#ECEAE4",
              color: active ? "#fff" : "#3A4A66",
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