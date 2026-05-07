import { ArrowLeft } from "lucide-react";

export default function BackButton({ onClick, label = "Back" }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 6,
        background: "rgba(255,255,255,0.10)",
        border: "1px solid rgba(255,255,255,0.22)",
        color: "#fff",
        borderRadius: 8,
        padding: "7px 14px",
        cursor: "pointer",
        fontSize: 13,
        fontWeight: 600,
        fontFamily: "inherit",
        whiteSpace: "nowrap",
        transition: "background 0.15s, border-color 0.15s",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "rgba(255,255,255,0.20)";
        e.currentTarget.style.borderColor = "rgba(255,255,255,0.40)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "rgba(255,255,255,0.10)";
        e.currentTarget.style.borderColor = "rgba(255,255,255,0.22)";
      }}
    >
      <ArrowLeft size={15} strokeWidth={2.5} />
      {label}
    </button>
  );
}