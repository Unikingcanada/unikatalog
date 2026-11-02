/**
 * ICSessionPage — Standalone session detail page, loadable by URL.
 * Route: /admin/import-center/session/:sessionId
 * Fully reloads session + staged records from DB on mount.
 */
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import ICShell from "@/components/importCenter/ICShell";
import ICSessionDetailView from "@/components/importCenter/ICSessionDetailView";

export default function ICSessionPage() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!sessionId) { setError("No session ID in URL."); setLoading(false); return; }
    base44.entities.Import_Sessions.filter({ session_id: sessionId })
      .then(results => {
        if (results?.[0]) {
          setSession(results[0]);
        } else {
          // Try by base44 id as fallback
          return base44.entities.Import_Sessions.filter({ id: sessionId })
            .then(r2 => {
              if (r2?.[0]) setSession(r2[0]);
              else setError(`Session "${sessionId}" not found.`);
            });
        }
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [sessionId]);

  return (
    <ICShell>
      {loading ? (
        <div style={{ textAlign: "center", padding: "80px 20px", color: "#3A4A66", fontSize: 14 }}>
          Loading session {sessionId}…
        </div>
      ) : error ? (
        <div style={{ textAlign: "center", padding: "80px 20px" }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>⚠️</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: "#C62828", marginBottom: 8 }}>{error}</div>
          <button
            onClick={() => navigate("/admin/import-center")}
            style={{ background: "#0E1F3A", color: "#fff", border: "none", borderRadius: 8, padding: "10px 24px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
            ← Back to Import Center
          </button>
        </div>
      ) : (
        <ICSessionDetailView
          session={session}
          onBack={() => navigate("/admin/import-center")}
        />
      )}
    </ICShell>
  );
}