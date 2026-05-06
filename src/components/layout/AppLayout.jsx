import { useState, useEffect } from "react";

const C = {
  navy: "#003c5b",
  navyMid: "#1A3A5C",
  border: "#e2e8f0",
  bg: "#f8fafc",
  text: "#0f172a",
  muted: "#64748b",
};

export default function AppLayout({ children, hideHeader = false }) {
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    function updateCart() {
      try {
        const cart = JSON.parse(localStorage.getItem("uniking_rfq_cart") || "[]");
        setCartCount(cart.length);
      } catch {
        setCartCount(0);
      }
    }
    updateCart();
    window.addEventListener("rfq_cart_updated", updateCart);
    return () => window.removeEventListener("rfq_cart_updated", updateCart);
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: C.bg, display: "flex", flexDirection: "column" }}>
      {!hideHeader && (
        <header style={{ background: C.navy, padding: "12px clamp(16px,4vw,40px)", boxShadow: "0 2px 8px rgba(0,0,0,0.12)" }}>
          <div style={{ maxWidth: 1280, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <img
              src="https://media.base44.com/images/public/69dd9ffccab4dd693d4d92f5/e48ee59d9_Unitingthestrongestlinks_20251031_225809_0000.png"
              alt="Uniking Canada"
              style={{ maxHeight: 32, width: "auto", filter: "brightness(0) invert(1)", opacity: 0.95 }}
            />
            {cartCount > 0 && (
              <div style={{ fontSize: 12, fontWeight: 700, color: "#fff", background: "rgba(37,99,235,0.9)", padding: "4px 10px", borderRadius: 20 }}>
                RFQ ({cartCount})
              </div>
            )}
          </div>
        </header>
      )}
      <main style={{ flex: 1, width: "100%" }}>
        {children}
      </main>
      <footer style={{ borderTop: "1px solid " + C.border, padding: "12px clamp(16px,4vw,40px)", textAlign: "center", fontSize: 11, color: C.muted, background: "#fff" }}>
        Uniking Canada · Final specifications must be confirmed before supply
      </footer>
    </div>
  );
}