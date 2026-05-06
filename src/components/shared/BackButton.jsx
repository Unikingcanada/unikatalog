const C = {
  bg: "#f1f5f9",
  border: "#e2e8f0",
  text: "#334155",
  muted: "#64748b",
};

export default function BackButton({ onClick, label = "← Back" }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: C.bg,
        border: `1px solid ${C.border}`,
        color: C.text,
        borderRadius: 7,
        padding: "8px 14px",
        cursor: "pointer",
        fontSize: 12,
        fontWeight: 600,
        whiteSpace: "nowrap",
        transition: "background 0.15s",
      }}
      onMouseEnter={(e) => (e.target.style.background = C.border)}
      onMouseLeave={(e) => (e.target.style.background = C.bg)}
    >
      {label}
    </button>
  );
}