import { useState, useEffect } from "react";

const C = {
  navy: "#003c5b",
  gold: "#C9A84C",
};

export default function FloatingRFQButton({ onGoRFQ }) {
  const [count, setCount] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("uniking_rfq_cart") || "[]").length;
    } catch {
      return 0;
    }
  });
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    function update() {
      try {
        const n = JSON.parse(localStorage.getItem("uniking_rfq_cart") || "[]").length;
        if (n > count) setPulse(true);
        setCount(n);
        setTimeout(() => setPulse(false), 600);
      } catch {
        setCount(0);
      }
    }
    window.addEventListener("rfq_cart_updated", update);
    return () => window.removeEventListener("rfq_cart_updated", update);
  }, [count]);

  if (count === 0) return null;

  return (
    <a
      href="#"
      onClick={(e) => {
        e.preventDefault();
        onGoRFQ && onGoRFQ();
      }}
      style={{ textDecoration: "none" }}
    >
      <div
        style={{
          position: "fixed",
          bottom: 28,
          right: 28,
          zIndex: 9999,
          background: C.navy,
          color: "#fff",
          borderRadius: "50%",
          width: 60,
          height: 60,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 4px 20px rgba(0,60,91,0.45)",
          cursor: "pointer",
          transform: pulse ? "scale(1.15)" : "scale(1)",
          transition: "transform 0.2s",
          border: `2px solid ${C.gold}`,
        }}
      >
        <svg style={{ width: 24, height: 24, fill: "currentColor" }} viewBox="0 0 24 24">
          <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
        </svg>
        <div
          style={{
            position: "absolute",
            top: -6,
            right: -6,
            background: "#2563eb",
            color: "#fff",
            borderRadius: "50%",
            width: 22,
            height: 22,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 11,
            fontWeight: 800,
            border: "2px solid #fff",
          }}
        >
          {count}
        </div>
      </div>
    </a>
  );
}