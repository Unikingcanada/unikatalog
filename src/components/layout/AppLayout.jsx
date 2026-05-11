import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import BackButton from "@/components/shared/BackButton";
import { base44 } from "@/api/base44Client";

const ADMIN_ROLES = ["admin", "super_admin"];

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
  const [profileOpen, setProfileOpen] = useState(false);
  const [user, setUser] = useState(null);
  const adminMenuRef = useRef(null);
  const profileRef = useRef(null);

  useEffect(() => {
    base44.auth.me().then(u => {
      if (!u) return;
      setUser(u);
      if (ADMIN_ROLES.includes(u.role) || u.email === "jsauro@unikingcanada.com") {
        setIsAdmin(true);
      }
    }).catch(() => {});
  }, []);

  useEffect(() => {
    function handleClick(e) {
      if (adminMenuOpen && adminMenuRef.current && !adminMenuRef.current.contains(e.target)) setAdminMenuOpen(false);
      if (profileOpen && profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [adminMenuOpen, profileOpen]);

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
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              {cartCount > 0 && (
                <div style={{ fontSize: 12, fontWeight: 700, color: "#fff", background: "rgba(37,99,235,0.9)", padding: "4px 10px", borderRadius: 20 }}>
                  RFQ ({cartCount})
                </div>
              )}
              {/* Profile widget */}
              {user && (
                <div ref={profileRef} style={{ position: "relative" }}>
                  <button
                    onClick={() => setProfileOpen(o => !o)}
                    style={{ display: "flex", alignItems: "center", gap: 7, background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 8, padding: "5px 10px", cursor: "pointer", color: "#fff" }}
                  >
                    <div style={{ width: 24, height: 24, borderRadius: "50%", background: isAdmin ? "#f59e0b" : "#3b82f6", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, color: "#fff", flexShrink: 0 }}>
                      {(user.full_name || user.email || "?")[0].toUpperCase()}
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 600, maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {user.full_name || user.email}
                    </span>
                    <span style={{ fontSize: 9 }}>▾</span>
                  </button>
                  {profileOpen && (
                    <div style={{ position: "absolute", top: "calc(100% + 8px)", right: 0, background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, boxShadow: "0 8px 24px rgba(0,0,0,0.14)", minWidth: 200, zIndex: 9999, overflow: "hidden" }}>
                      <div style={{ padding: "12px 14px", borderBottom: "1px solid #f1f5f9" }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: "#0C2340", marginBottom: 2 }}>{user.full_name || "—"}</div>
                        <div style={{ fontSize: 11, color: "#64748b", marginBottom: 6 }}>{user.email}</div>
                        <span style={{ display: "inline-block", fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: 0.5, padding: "2px 8px", borderRadius: 99, background: isAdmin ? "#fef3c7" : "#eff6ff", color: isAdmin ? "#92400e" : "#1d4ed8", border: isAdmin ? "1px solid #fde68a" : "1px solid #bfdbfe" }}>
                          {user.role || "user"}
                        </span>
                      </div>
                      <button
                        onClick={() => { setProfileOpen(false); base44.auth.logout(window.location.origin); }}
                        style={{ width: "100%", padding: "10px 14px", background: "none", border: "none", textAlign: "left", fontSize: 12, fontWeight: 600, color: "#dc2626", cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}
                        onMouseEnter={e => e.currentTarget.style.background = "#fef2f2"}
                        onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                      >
                        ⏏ Sign Out
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
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
              style={{ background: "#0C2340", border: "1px solid #1e3a5c", borderRadius: 6, padding: "5px 10px", fontSize: 11, fontWeight: 700, color: "#94c5e8", cursor: "pointer", letterSpacing: "0.5px" }}
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
                <Link to="/admin/users" onClick={() => setAdminMenuOpen(false)} style={{ display: "block", padding: "9px 14px", fontSize: 12, fontWeight: 600, color: "#0C2340", textDecoration: "none" }}
                  onMouseEnter={e => e.currentTarget.style.background = "#f8fafc"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                  👥 User Management
                </Link>
              </div>
            )}
          </div>
        )}
      </footer>
    </div>
  );
}