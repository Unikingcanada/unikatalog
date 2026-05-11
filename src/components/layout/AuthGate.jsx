/**
 * AuthGate — App-level authentication enforcer.
 * Checks session on mount. If not authenticated, redirects to Base44 login.
 * Shows a loading screen while checking.
 */
import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";

export default function AuthGate({ children }) {
  const [status, setStatus] = useState("checking"); // "checking" | "authenticated" | "redirecting"

  useEffect(() => {
    base44.auth.me()
      .then(() => setStatus("authenticated"))
      .catch(() => {
        setStatus("redirecting");
        base44.auth.redirectToLogin(window.location.href);
      });
  }, []);

  if (status === "checking" || status === "redirecting") {
    return (
      <div style={{
        minHeight: "100vh", background: "#0C2340",
        display: "flex", alignItems: "center", justifyContent: "center",
        flexDirection: "column", gap: 20, fontFamily: "'Inter','Segoe UI',sans-serif",
      }}>
        <img
          src="https://media.base44.com/images/public/69ebd56ae74b0ffcc2427c7a/9544927ac_Kshort.png"
          alt="Uniking"
          style={{ height: 48, opacity: 0.85, filter: "brightness(0) invert(1)" }}
        />
        <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, fontWeight: 500 }}>
          {status === "redirecting" ? "Redirecting to login…" : "Checking session…"}
        </div>
        <div style={{ width: 32, height: 32, border: "3px solid rgba(255,255,255,0.15)", borderTopColor: "rgba(255,255,255,0.7)", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return children;
}