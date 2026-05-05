/**
 * PageHeader — Global standardized header for all pages.
 * Drop-in replacement for any page-level header.
 */

const C = {
  navy: "#003c5b", navyMid: "#1A3A5C", navyLight: "#2A5080",
  border: "#e2e8f0", muted: "#64748b", bg: "#f8fafc", text: "#0f172a",
};

/**
 * @param {object} props
 * @param {string} [props.title] - Main heading
 * @param {string} [props.subtitle] - Short description under the title
 * @param {Array<{label:string, onClick?:fn}>} [props.breadcrumbs] - Breadcrumb items; last is current (not clickable)
 * @param {function} [props.onBack] - If provided, renders a back button
 * @param {string} [props.backLabel] - Label for back button (default "← Back")
 * @param {string} [props.logoUrl] - Optional brand logo URL
 * @param {string} [props.logoAlt] - Alt for brand logo
 * @param {React.ReactNode} [props.actions] - Slot for right-side action buttons
 * @param {React.ReactNode} [props.below] - Slot for content below the main header (e.g. search/filter)
 * @param {string} [props.accentColor] - Override accent color (defaults to navy)
 * @param {boolean} [props.dark] - Use dark/navy background (default true)
 */
export default function PageHeader({
  title,
  subtitle,
  breadcrumbs,
  onBack,
  backLabel = "← Back",
  logoUrl,
  logoAlt = "Brand",
  actions,
  below,
  accentColor,
  dark = true,
}) {
  const accent = accentColor || C.navy;

  const bgStyle = dark
    ? { background: `linear-gradient(135deg, ${C.navy} 0%, ${C.navyMid} 100%)` }
    : { background: "#fff", borderBottom: `1px solid ${C.border}` };

  const textColor = dark ? "#fff" : C.text;
  const subColor = dark ? "rgba(255,255,255,0.6)" : C.muted;
  const breadColor = dark ? "rgba(255,255,255,0.5)" : C.muted;
  const breadActiveColor = dark ? "rgba(255,255,255,0.85)" : C.navyMid;

  return (
    <div style={{ ...bgStyle, padding: "20px clamp(14px,4vw,40px) 20px", flexShrink: 0 }}>
      <div style={{ maxWidth: 1280, margin: "0 auto" }}>

        {/* Back + Breadcrumbs row */}
        {(onBack || breadcrumbs?.length > 0) && (
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14, flexWrap: "wrap" }}>
            {onBack && (
              <button
                onClick={onBack}
                style={{
                  background: dark ? "rgba(255,255,255,0.12)" : "#f1f5f9",
                  border: dark ? "1px solid rgba(255,255,255,0.2)" : `1px solid ${C.border}`,
                  color: textColor,
                  borderRadius: 7,
                  padding: "5px 13px",
                  cursor: "pointer",
                  fontSize: 12,
                  fontWeight: 600,
                  whiteSpace: "nowrap",
                  flexShrink: 0,
                }}
              >
                {backLabel}
              </button>
            )}
            {breadcrumbs?.length > 0 && (
              <div style={{ display: "flex", alignItems: "center", gap: 5, flexWrap: "wrap" }}>
                {breadcrumbs.map((crumb, i) => (
                  <span key={i} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                    {i > 0 && <span style={{ color: breadColor, fontSize: 11 }}>›</span>}
                    {i < breadcrumbs.length - 1 && crumb.onClick ? (
                      <span
                        onClick={crumb.onClick}
                        style={{ color: breadActiveColor, cursor: "pointer", fontSize: 12, fontWeight: 600 }}
                      >
                        {crumb.label}
                      </span>
                    ) : (
                      <span style={{ color: breadColor, fontSize: 12 }}>{crumb.label}</span>
                    )}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Main row: logo + title + actions */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 14, flex: 1, minWidth: 0 }}>
            {logoUrl && (
              <div style={{ background: "#fff", borderRadius: 8, padding: "6px 10px", flexShrink: 0, display: "flex", alignItems: "center" }}>
                <img src={logoUrl} alt={logoAlt} style={{ maxHeight: 32, maxWidth: 100, objectFit: "contain" }} onError={e => e.target.parentElement.style.display = "none"} />
              </div>
            )}
            <div style={{ flex: 1, minWidth: 0 }}>
              {title && (
                <h1 style={{ color: textColor, fontSize: "clamp(18px, 3vw, 26px)", fontWeight: 900, margin: "0 0 4px", lineHeight: 1.2 }}>
                  {title}
                </h1>
              )}
              {subtitle && (
                <p style={{ color: subColor, fontSize: 13, margin: 0, lineHeight: 1.65, maxWidth: 680 }}>
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          {actions && (
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0, flexWrap: "wrap" }}>
              {actions}
            </div>
          )}
        </div>

        {/* Below slot (search bar, stats, filters) */}
        {below && (
          <div style={{ marginTop: 18 }}>
            {below}
          </div>
        )}
      </div>
    </div>
  );
}