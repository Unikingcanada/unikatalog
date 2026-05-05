/**
 * ChainEquivalencyPanel.jsx
 *
 * Displays manufacturer equivalent codes for a normalized chain.
 * Used in ChainDetailTabs (SourceDataTab) and RFQ items.
 * Shows confidence badges and sourcing notes.
 */
import { getEquivalentsByConfidence } from "@/lib/chainEquivalencyEngine";

const C = {
  border: "#e2e8f0", bg: "#f8fafc", card: "#ffffff",
  text: "#0f172a", muted: "#64748b", slate: "#334155",
  green: "#16a34a", greenBg: "#f0fdf4",
  amber: "#d97706", amberBg: "#fffbeb",
  red: "#dc2626", redBg: "#fef2f2",
  blue: "#2563eb", blueBg: "#eff6ff",
  navy: "#003c5b", navyMid: "#1A3A5C",
};

function ConfidenceBadge({ confidence }) {
  const cfg = {
    "Confirmed":                    { bg: C.greenBg,  color: C.green, border: "#86efac" },
    "Needs Review":                 { bg: C.amberBg,  color: C.amber, border: "#fbbf24" },
    "Missing Data – Needs Mapping": { bg: C.redBg,    color: C.red,   border: "#fca5a5" },
  }[confidence] || { bg: "#f1f5f9", color: C.muted, border: C.border };

  return (
    <span style={{
      fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 20,
      background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`,
    }}>
      {confidence || "Unknown"}
    </span>
  );
}

function ManufacturerRow({ ref: r }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "8px 12px", borderBottom: "1px solid " + C.border,
      gap: 10, flexWrap: "wrap",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, minWidth: 0 }}>
        <div style={{ width: 6, height: 6, borderRadius: "50%", background: r.confidence === "Confirmed" ? C.green : r.confidence === "Needs Review" ? C.amber : C.red, flexShrink: 0 }} />
        <div>
          <span style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{r.manufacturer}</span>
          <span style={{ fontSize: 12, color: C.muted, marginLeft: 8 }}>Code: <strong style={{ color: C.slate }}>{r.code}</strong></span>
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
        <ConfidenceBadge confidence={r.confidence} />
      </div>
      {r.notes && (
        <div style={{ width: "100%", fontSize: 11, color: C.muted, paddingLeft: 16, marginTop: -4 }}>
          {r.notes}
        </div>
      )}
    </div>
  );
}

export default function ChainEquivalencyPanel({ chain_id }) {
  const { confirmed, needs_review, missing } = chain_id
    ? getEquivalentsByConfidence(chain_id)
    : { confirmed: [], needs_review: [], missing: [] };

  const total = confirmed.length + needs_review.length + missing.length;

  if (total === 0) {
    return (
      <div style={{ padding: "16px", background: C.bg, borderRadius: 8, border: "1px solid " + C.border, fontSize: 13, color: C.muted }}>
        No manufacturer equivalencies on file. Contact Uniking.
      </div>
    );
  }

  return (
    <div>
      {/* Summary */}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 14 }}>
        {confirmed.length > 0 && (
          <div style={{ padding: "6px 12px", background: C.greenBg, borderRadius: 20, fontSize: 11, fontWeight: 700, color: C.green, border: "1px solid #86efac" }}>
            ✓ {confirmed.length} Confirmed Source{confirmed.length !== 1 ? "s" : ""}
          </div>
        )}
        {needs_review.length > 0 && (
          <div style={{ padding: "6px 12px", background: C.amberBg, borderRadius: 20, fontSize: 11, fontWeight: 700, color: C.amber, border: "1px solid #fbbf24" }}>
            ⚠ {needs_review.length} Needs Review
          </div>
        )}
        {missing.length > 0 && (
          <div style={{ padding: "6px 12px", background: C.redBg, borderRadius: 20, fontSize: 11, fontWeight: 700, color: C.red, border: "1px solid #fca5a5" }}>
            ✗ {missing.length} Missing Data
          </div>
        )}
      </div>

      {/* Confirmed */}
      {confirmed.length > 0 && (
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: "1px", color: C.green, marginBottom: 6 }}>
            Confirmed Equivalencies
          </div>
          <div style={{ border: "1px solid " + C.border, borderRadius: 8, overflow: "hidden", background: C.card }}>
            {confirmed.map((r, i) => <ManufacturerRow key={i} ref={r} />)}
          </div>
        </div>
      )}

      {/* Needs Review */}
      {needs_review.length > 0 && (
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: "1px", color: C.amber, marginBottom: 6 }}>
            Needs Review
          </div>
          <div style={{ border: "1px solid #fbbf24", borderRadius: 8, overflow: "hidden", background: C.card }}>
            {needs_review.map((r, i) => <ManufacturerRow key={i} ref={r} />)}
          </div>
        </div>
      )}

      {/* Disclaimer */}
      <div style={{ padding: "10px 14px", background: "#f0f9ff", border: "1px solid #bae6fd", borderRadius: 6, fontSize: 11, color: "#0369a1", lineHeight: 1.6, marginTop: 8 }}>
        ℹ Equivalency data is for reference only. Confirm performance data and availability before procurement.
        "Needs Review" equivalencies require engineering verification before substitution.
      </div>
    </div>
  );
}