export default function RFQNotification({ message, onDismiss }) {
  if (!message) return null;
  return (
    <div style={{
      position: "fixed", bottom: 24, right: 24, zIndex: 9999,
      background: "#16a34a", color: "#fff", padding: "12px 20px",
      borderRadius: 12, boxShadow: "0 8px 30px rgba(0,0,0,0.2)",
      display: "flex", alignItems: "center", gap: 12,
      fontSize: 13, fontWeight: 700, maxWidth: 420,
    }}>
      <span style={{ fontSize: 18 }}>✓</span>
      <span style={{ flex: 1 }}>{message}</span>
      <button onClick={onDismiss} style={{ background: "none", border: "none", color: "#fff", cursor: "pointer", fontSize: 16, lineHeight: 1 }}>✕</button>
    </div>
  );
}