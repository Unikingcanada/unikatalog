// Redirects to Home — DonghuaChain is now folded into the main catalog
import { useEffect } from "react";
export default function DonghuaChainRedirect() {
  useEffect(() => { window.location.href = "/"; }, []);
  return <div style={{ padding: 40, textAlign: "center", fontFamily: "sans-serif", color: "#0E1F3A" }}>Redirecting to catalog…</div>;
}
