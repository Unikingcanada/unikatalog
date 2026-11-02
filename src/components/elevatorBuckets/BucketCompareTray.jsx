// Floating compare tray — visible app-wide in the elevator buckets section
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getCompareItems, removeCompareItem, clearCompare } from "@/lib/bucketCompareState";

const NAVY = "#0E1F3A";

const SUP_COLOR = {
  "Maxi-Lift": "#B8860B",
  "Tapco":     "#0E1F3A",
  "4B":        "#C62828",
};

export default function BucketCompareTray() {
  const [items, setItems] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    setItems(getCompareItems());
    const handler = () => setItems(getCompareItems());
    window.addEventListener("bucket_compare_updated", handler);
    return () => window.removeEventListener("bucket_compare_updated", handler);
  }, []);

  if (items.length === 0) return null;

  const canCompare = items.length >= 2;

  return (
    <div style={{
      position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 300,
      background: "#1a1a2e", borderTop: "2px solid #F26522",
      padding: "10px clamp(12px,4vw,32px)",
      display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap",
      boxShadow: "0 -4px 24px rgba(0,0,0,0.28)",
    }}>
      {/* Label */}
      <span style={{ fontSize: 11, fontWeight: 700, color: "#F8C9B0", whiteSpace: "nowrap", flexShrink: 0 }}>
        COMPARE ({items.length}/6):
      </span>

      {/* Item chips */}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", flex: 1, alignItems: "center" }}>
        {items.map(item => {
          const sc = SUP_COLOR[item.supplier] || NAVY;
          return (
            <div key={item.id} style={{
              display: "flex", alignItems: "center", gap: 5,
              background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.14)",
              borderRadius: 99, padding: "4px 10px 4px 8px",
            }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: sc, flexShrink: 0 }} />
              <span style={{ fontSize: 11, color: "#ECEAE4", fontWeight: 600, whiteSpace: "nowrap", maxWidth: 140, overflow: "hidden", textOverflow: "ellipsis" }}>
                {item.styleName} {item.sizeNominal}
              </span>
              <span style={{ fontSize: 10, color: "#8A94A6" }}>{item.material}</span>
              <button onClick={() => removeCompareItem(item.id)}
                style={{ background: "none", border: "none", color: "#8A94A6", cursor: "pointer", fontSize: 14, lineHeight: 1, padding: "0 0 0 2px" }}>×</button>
            </div>
          );
        })}
        {items.length < 6 && (
          <span style={{ fontSize: 11, color: "#3A4A66", fontStyle: "italic" }}>+ Add more</span>
        )}
      </div>

      {/* Actions */}
      <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
        <button onClick={clearCompare}
          style={{ padding: "7px 14px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.18)", background: "transparent", color: "#8A94A6", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
          Clear All
        </button>
        <button
          onClick={() => canCompare && navigate("/BucketCompare")}
          disabled={!canCompare}
          style={{
            padding: "7px 18px", borderRadius: 8, border: "none",
            background: canCompare ? "#F26522" : "#3A4A66",
            color: canCompare ? "#fff" : "#3A4A66",
            fontSize: 12, fontWeight: 700,
            cursor: canCompare ? "pointer" : "not-allowed",
            transition: "background 0.15s",
          }}>
          Compare Now ({items.length})
        </button>
      </div>
    </div>
  );
}