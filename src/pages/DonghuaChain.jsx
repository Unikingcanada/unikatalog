// Redirects to Home — DonghuaChain is now folded into the main catalog
import { useEffect } from "react";
export default function DonghuaChainRedirect() {
  useEffect(() => { window.location.href = "/"; }, []);
  return <div style={{ padding: 40, textAlign: "center", fontFamily: "sans-serif", color: "#1a3a5c" }}>Redirecting to catalog…</div>;
}
