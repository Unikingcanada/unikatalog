import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import BackButton from "@/components/shared/BackButton";
import { base44 } from "@/api/base44Client";

const ADMIN_EMAIL = "jsauro@unikingcanada.com";

const C = {
  navy: "#003c5b",
  navyMid: "#1A3A5C",
  border: "#e2e8f0",
  bg: "#f8fafc",
  text: "#0f172a",
  muted: "#64748b",
};

export default function AppLayout({ children, hideHeader = false, onBack = null }) {
  const [cartCount, setCartCount] = useState(0);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminMenuOpen, setAdminMenuOpen] = useState(false);
  const adminMenuRef = useRef(null);

  useEffect(() => {
    base44.auth.me().then(u => {
      if (u?.email === ADMIN_EMAIL) setIsAdmin(true);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (!adminMenuOpen) return;
    function handleClick(e) {
      if (adminMenuRef.current && !adminMenuRef.current.contains(e.target)) setAdminMenuOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [adminMenuOpen]);

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
    <div style={{ minHeight: "100vh", background: C.bg, display: "flex", flexDirection: "column", fontFamily: "'Inter', 'Segoe UI', sans-serif" }}>
      {!hideHeader && (
        <header style={{ background: C.navy, padding: "10px clamp(16px,4vw,40px)", boxShadow: "0 2px 8px rgba(0,0,0,0.12)" }}>
          <div style={{ maxWidth: 1280, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              {onBack && <BackButton onClick={onBack} label="Back" />}
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <img
                src="https://media.base44.com/images/public/69ebd56ae74b0ffcc2427c7a/9544927ac_Kshort.png"
                alt="K"
                style={{ height: 34, width: "auto", filter: "brightness(0) invert(1)", opacity: 0.92 }}
              />
              </div>
            </div>
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
      <footer style={{ borderTop: "1px solid " + C.border, padding: "12px clamp(16px,4vw,40px)", textAlign: "center", fontSize: 11, color: C.muted, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, position: "relative" }}>
        <img
          src="https://media.base44.com/images/public/69ebd56ae74b0ffcc2427c7a/9544927ac_Kshort.png"
          alt="K"
          style={{ height: 16, width: "auto", opacity: 0.35 }}
        />
        Uniking Canada · Final specifications must be confirmed before supply

        {isAdmin && (
          <div ref={adminMenuRef} style={{ position: "absolute", right: "clamp(16px,4vw,40px)", bottom: 0, top: 0, display: "flex", alignItems: "center" }}>
            <button
              onClick={() => setAdminMenuOpen(o => !o)}
              title="Admin Tools"
              style={{ background: "none", border: "1px solid #e2e8f0", borderRadius: 6, padding: "3px 8px", fontSize: 10, fontWeight: 700, color: "#94a3b8", cursor: "pointer", letterSpacing: "0.5px", opacity: 0.6 }}
            >
              ⚙ Admin
            </button>
            {adminMenuOpen && (
              <div style={{ position: "absolute", bottom: "calc(100% + 8px)", right: 0, background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, boxShadow: "0 4px 16px rgba(0,0,0,0.12)", minWidth: 160, zIndex: 9999, overflow: "hidden" }}>
                <div style={{ padding: "6px 12px", fontSize: 9, fontWeight: 800, textTransform: "uppercase", letterSpacing: 1, color: "#94a3b8", borderBottom: "1px solid #f1f5f9" }}>
                  Admin Tools
                </div>
                <Link to="/admin/import-center" onClick={() => setAdminMenuOpen(false)} style={{ display: "block", padding: "9px 14px", fontSize: 12, fontWeight: 600, color: "#0C2340", textDecoration: "none" }}
                  onMouseEnter={e => e.currentTarget.style.background = "#f8fafc"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                  📥 Import Center
                </Link>
                <Link to="/admin/chain-review" onClick={() => setAdminMenuOpen(false)} style={{ display: "block", padding: "9px 14px", fontSize: 12, fontWeight: 600, color: "#0C2340", textDecoration: "none" }}
                  onMouseEnter={e => e.currentTarget.style.background = "#f8fafc"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                  🔍 Chain Review
                </Link>
              </div>
            )}
          </div>
        )}
      </footer>
    </div>
  );
}