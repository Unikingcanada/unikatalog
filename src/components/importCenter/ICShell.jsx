/**
 * ICShell — Admin shell wrapper for Import Center
 * Handles auth guard + layout chrome
 */
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";

const ADMIN_ROLES = ["admin", "super_admin"];

export default function ICShell({ children }) {
  const [user, setUser] = useState(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    base44.auth.me()
      .then(u => { setUser(u); setChecked(true); })
      .catch(() => setChecked(true));
  }, []);

  if (!checked) return (
    <div style={S.page}>
      <div style={S.center}>Checking access…</div>
    </div>
  );

  if (!user || !ADMIN_ROLES.includes(user.role)) return (
    <div style={S.page}>
      <div style={S.center}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🔒</div>
        <div style={{ fontSize: 20, fontWeight: 800, color: S.navy, marginBottom: 8 }}>Admin Access Required</div>
        <div style={{ fontSize: 13, color: S.muted }}>
          This page is restricted to Uniking admin users only.
        </div>
        <div style={{ marginTop: 16, fontSize: 12, color: "#94a3b8" }}>
          Signed in as: {user?.email || "unknown"} · Role: {user?.role || "none"}
        </div>
      </div>
    </div>
  );

  return (
    <div style={S.page}>
      {/* Topbar */}
      <div style={S.topbar}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <span style={S.topTag}>⚙ ADMIN</span>
          <span style={S.topSep}>|</span>
          <span style={S.topTitle}>UniKatalog Import Center</span>
          <span style={{ ...S.topTag, background: "rgba(239,68,68,0.15)", color: "#fca5a5" }}>
            INFRASTRUCTURE ONLY
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <Link to="/Home" style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.55)", textDecoration: "none", border: "1px solid rgba(255,255,255,0.18)", borderRadius: 5, padding: "4px 10px" }}
            onMouseEnter={e => e.currentTarget.style.color = "#fff"}
            onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.55)"}>
            ← Homepage
          </Link>
          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", fontStyle: "italic" }}>
            {user.email} · {user.role}
          </span>
        </div>
      </div>

      {/* Content */}
      <div style={S.content}>
        {children}
      </div>
    </div>
  );
}

const navy = "#0C2340";
const S = {
  navy,
  muted: "#64748b",
  page: { minHeight: "100vh", background: "#f1f5f9", fontFamily: "'Inter','Segoe UI',sans-serif" },
  topbar: {
    background: navy,
    padding: "12px 28px",
    display: "flex", alignItems: "center", justifyContent: "space-between",
  },
  topTag: {
    fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: 2,
    color: "rgba(255,255,255,0.45)",
  },
  topSep: { color: "rgba(255,255,255,0.2)", fontSize: 14 },
  topTitle: { fontSize: 14, fontWeight: 700, color: "#fff" },
  content: { maxWidth: 1440, margin: "0 auto", padding: "28px clamp(12px,3vw,32px)" },
  center: { textAlign: "center", padding: "80px 20px", color: "#64748b" },
};