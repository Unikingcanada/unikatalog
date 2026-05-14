/**
 * ChainDetailTabs.jsx
 * Tabbed detail view for a normalized chain product.
 * Shows only tabs with content.
 */
import { useState } from "react";
import ChainEquivalencyPanel from "./ChainEquivalencyPanel";
import { ATTACHMENT_LIBRARY } from "@/lib/chainAttachmentLibrary";

const C = {
  navy: "#003c5b", navyMid: "#1A3A5C",
  border: "#e2e8f0", bg: "#f8fafc", card: "#ffffff",
  text: "#0f172a", muted: "#64748b", slate: "#334155",
  green: "#16a34a", greenBg: "#f0fdf4",
  amber: "#d97706", amberBg: "#fffbeb",
  blue: "#2563eb", blueBg: "#eff6ff",
};

function SectionTitle({ children }) {
  return (
    <div style={{ fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: "1px", color: C.muted, marginBottom: 10, paddingBottom: 6, borderBottom: "2px solid " + C.border }}>
      {children}
    </div>
  );
}

function SpecRow({ label, value, flagged }) {
  return (
    <tr style={{ background: flagged ? C.amberBg : "inherit" }}>
      <td style={{ padding: "7px 12px", color: C.muted, fontWeight: 600, fontSize: 12, width: "42%", borderBottom: "1px solid " + C.border, verticalAlign: "top" }}>{label}</td>
      <td style={{ padding: "7px 12px", color: C.text, fontSize: 13, borderBottom: "1px solid " + C.border }}>
        {value}
        {flagged && <span style={{ marginLeft: 8, fontSize: 10, color: C.amber, fontWeight: 700 }}>⚠ To be confirmed</span>}
      </td>
    </tr>
  );
}

function SpecsTab({ product }) {
  // Normalize specs: DB records store pitch_in/pitch_mm etc. at top level, not under .specs
  const specs = product.specs && Object.keys(product.specs).length > 0
    ? product.specs
    : {
        ...(product.pitch_in ? { pitch_in: product.pitch_in } : {}),
        ...(product.pitch_mm ? { pitch_mm: product.pitch_mm } : {}),
        ...(product.standard ? { standard: product.standard } : {}),
        ...(product.strands && product.strands !== 1 ? { strands: product.strands } : {}),
      };
  const entries = Object.entries(specs).filter(([, v]) => v != null && v !== "");

  const SPEC_LABELS = {
    pitch_in: "Pitch (in)", pitch_mm: "Pitch (mm)",
    roller_dia_in: "Roller Diameter (in)", roller_width_in: "Width Between Inner Plates (in)",
    pin_dia_in: "Pin Diameter (in)", plate_height_in: "Plate Height (in)",
    plate_thick_in: "Plate Thickness (in)", riv_end_to_cl_in: "Rivet End to CL (in)",
    conn_end_to_cl_in: "Conn. End to CL (in)", overall_width_in: "Overall Width (in)",
    sidebar_width_in: "Sidebar Width (in)", barrel_dia_in: "Barrel Diameter (in)",
    bearing_length_in: "Bearing Length (in)", max_sprocket_face_in: "Max Sprocket Face (in)",
    avg_ultimate_lbs: "Avg. Ultimate Strength (lbs)", max_working_load_lbs: "Max Working Load (lbs)",
    rivet_dia_in: "Rivet Diameter (in)", lacing: "Lacing",
    type: "Type / Series", standard: "Standard", construction: "Construction",
    notes: "Notes",
  };

  if (!entries.length) return (
    <div style={{ color: C.muted, fontSize: 13, padding: "24px 0" }}>No specification data available. Contact Uniking.</div>
  );

  return (
    <div>
      {product.description && (
        <div style={{ marginBottom: 16, padding: "12px 14px", background: C.bg, borderLeft: "3px solid " + C.navyMid, borderRadius: 4, fontSize: 13, color: C.slate, lineHeight: 1.7 }}>
          {product.description}
        </div>
      )}
      <div style={{ border: "1px solid " + C.border, borderRadius: 6, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <tbody>
            {entries.map(([k, v]) => (
              <SpecRow key={k} label={SPEC_LABELS[k] || k} value={String(v)} flagged={k === "notes" && String(v).toLowerCase().includes("confirm")} />
            ))}
          </tbody>
        </table>
      </div>
      {product.needs_review && (
        <div style={{ marginTop: 12, padding: "10px 14px", background: C.amberBg, border: "1px solid #fbbf24", borderRadius: 6, fontSize: 12, color: C.amber, fontWeight: 600 }}>
          ⚠ Some specifications flagged for Uniking engineering review.
        </div>
      )}
    </div>
  );
}

function AttachmentsTab({ product, onAddRFQ }) {
  const rawAtts = product.related_attachments || product.attachments_available || [];
  const chainNumber = product.chain_number || product.chain_id || "";

  // Resolve string codes → full objects from ATTACHMENT_LIBRARY
  const resolvedAtts = rawAtts.map(att => {
    if (typeof att === "string") {
      const lib = ATTACHMENT_LIBRARY[att];
      return lib ? { ...lib, _resolved: true, compatible_chain: chainNumber } : { code: att, _unresolved: true };
    }
    // Already an object — enrich with library data if code matches
    const code = att.code || att.attachment_code;
    const lib = code ? ATTACHMENT_LIBRARY[code] : null;
    return lib ? { ...lib, ...att, _resolved: true, compatible_chain: chainNumber } : { ...att, compatible_chain: chainNumber };
  });

  if (!resolvedAtts.length) return (
    <div style={{ color: C.muted, fontSize: 13, padding: "24px 0" }}>No confirmed attachment data available. Contact Uniking to discuss attachment options.</div>
  );

  // Separate valid attachments from incomplete ones
  const validAtts = resolvedAtts.filter(att => {
    const displayName = att.code || att.attachment_code || att.name;
    const displayType = att.type || att.attachment_type || att.description;
    return !!(displayName && displayType);
  });
  const incompleteAtts = resolvedAtts.filter(att => {
    const displayName = att.code || att.attachment_code || att.name;
    const displayType = att.type || att.attachment_type || att.description;
    return !(displayName && displayType);
  });

  return (
    <div>
      <p style={{ fontSize: 12, color: C.muted, marginBottom: 14 }}>Only source-confirmed attachments are shown. Do not assume compatibility.</p>

      {/* Valid attachment cards */}
      {validAtts.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 10, marginBottom: incompleteAtts.length > 0 ? 16 : 0 }}>
          {validAtts.map((att, i) => {
            const displayName = att.code || att.attachment_code || att.name;
            const displayType = att.type || att.attachment_type || att.description;
            const sourceBrand = att.source_brand || (att._resolved ? "ANSI Standard" : null);
            const compatChain = att.compatible_chain;
            return (
              <div key={i} style={{ border: "1px solid " + C.border, borderRadius: 8, padding: "14px", background: C.card }}>
                {att.image_url && <img src={att.image_url} alt={displayName} style={{ width: "100%", height: 70, objectFit: "contain", marginBottom: 8 }} onError={e => e.target.style.display = "none"} />}
                <div style={{ fontWeight: 700, fontSize: 14, color: C.text, marginBottom: 2 }}>{displayName}</div>
                <div style={{ fontSize: 12, color: C.blue, fontWeight: 600, marginBottom: 6 }}>{displayType}</div>
                {att.description && att.description !== displayType && (
                  <div style={{ fontSize: 11, color: C.slate, marginBottom: 6, lineHeight: 1.5 }}>{att.description}</div>
                )}
                {compatChain && <div style={{ fontSize: 11, color: C.muted }}>Chain size: <strong>{compatChain}</strong></div>}
                {att.side && att.side !== "N/A" && <div style={{ fontSize: 11, color: C.slate }}>Side: {att.side}</div>}
                {att.spacing_note && <div style={{ fontSize: 11, color: C.slate }}>Spacing: {att.spacing_note}</div>}
                {att.notes && <div style={{ fontSize: 10, color: C.muted, marginTop: 4, fontStyle: "italic" }}>{att.notes}</div>}
                {sourceBrand && <div style={{ fontSize: 10, color: C.muted, marginTop: 4 }}>Source: {sourceBrand}</div>}
                {att.source_confirmed === false && (
                  <div style={{ fontSize: 10, color: C.amber, marginTop: 4 }}>⚠ Compatibility to be confirmed</div>
                )}
                <button onClick={() => onAddRFQ && onAddRFQ({ ...product, series: (product.chain_number || product.part_number) + " + " + displayName, notes: "Attachment: " + displayName })}
                  style={{ marginTop: 10, width: "100%", padding: "6px 0", borderRadius: 5, fontSize: 11, fontWeight: 700, cursor: "pointer", border: "1px solid " + C.blue, background: C.blueBg, color: C.blue }}>
                  + Add to RFQ
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Debug panel for incomplete records — shown only when data is missing */}
      {incompleteAtts.length > 0 && (
        <div style={{ background: "#fffbeb", border: "1px solid #fbbf24", borderRadius: 8, padding: "12px 14px" }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: C.amber, marginBottom: 6 }}>
            ⚠ {incompleteAtts.length} attachment record{incompleteAtts.length > 1 ? "s" : ""} with missing display data (not shown to users)
          </div>
          {incompleteAtts.map((att, i) => (
            <div key={i} style={{ fontSize: 10, fontFamily: "monospace", color: "#92400e", marginBottom: 3 }}>
              Attachment data missing: ID {att.id || "(no id)"} — code: "{att.code || att.attachment_code || "(none)"}", type: "{att.type || att.attachment_type || "(none)"}"
            </div>
          ))}
          <div style={{ fontSize: 10, color: "#92400e", marginTop: 6 }}>
            Fill in attachment_code and attachment_type via the Import Center to display these records.
          </div>
        </div>
      )}

      {validAtts.length === 0 && incompleteAtts.length > 0 && (
        <div style={{ color: C.muted, fontSize: 13, marginTop: 12 }}>
          No displayable attachment data. Contact Uniking for attachment options.
        </div>
      )}
    </div>
  );
}

/**
 * Compute standard ANSI connecting links and offset links for a given chain number.
 * Returns array of synthetic pin/link objects inferred from the parent chain.
 */
function inferStandardLinks(chainNumber) {
  if (!chainNumber) return [];
  // Extract the base ANSI number — e.g. "80" from "ANSI-80", "80H", "80SS", etc.
  const match = String(chainNumber).match(/^(?:ANSI-?)?(\d+)/i);
  if (!match) return [];
  const baseNum = match[1];
  return [
    {
      code: `CL-${baseNum}`,
      type: "Connecting Link",
      description: `ANSI ${baseNum} Connecting Link (cottered or riveted). Used to join chain ends without a press.`,
      _inferred: true,
    },
    {
      code: `OL-${baseNum}`,
      type: "Offset Link",
      description: `ANSI ${baseNum} Offset Link (half link). Required when an odd number of pitches is needed. Avoid where possible — reduces chain strength by ~20%.`,
      _inferred: true,
    },
  ];
}

function PinsTab({ product, onAddRFQ }) {
  const explicit = product.related_pins || product.pins_links_available || [];

  // Filter out incomplete records (code/name must exist)
  const validExplicit = explicit.filter(p => !!(p.code || p.name));

  // Infer standard links from the chain number if not already present
  const inferred = inferStandardLinks(product.chain_number || product.chain_id);
  const inferredFiltered = inferred.filter(inf =>
    !validExplicit.some(p =>
      (p.code || p.name || "").toLowerCase().replace(/[\s-]/g, "") ===
      inf.code.toLowerCase().replace(/[\s-]/g, "")
    )
  );

  const allPins = [...validExplicit, ...inferredFiltered];

  if (!allPins.length) return (
    <div style={{ color: C.muted, fontSize: 13, padding: "24px 0" }}>No pin / connecting link data available. Contact Uniking.</div>
  );

  return (
    <div>
      {inferredFiltered.length > 0 && (
        <div style={{ fontSize: 11, color: C.muted, marginBottom: 12, padding: "8px 12px", background: "#f0f9ff", border: "1px solid #bae6fd", borderRadius: 6 }}>
          ℹ Standard connecting links and offset links are inferred from the chain size. Confirm availability with Uniking before ordering.
        </div>
      )}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 10 }}>
        {allPins.map((pin, i) => {
          const displayCode = pin.code || pin.name;
          const displayType = pin.type || pin.description;
          return (
            <div key={i} style={{ border: "1px solid " + (pin._inferred ? "#bae6fd" : C.border), borderRadius: 8, padding: "14px", background: pin._inferred ? "#f0f9ff" : C.card }}>
              {pin.image_url && <img src={pin.image_url} alt={displayCode} style={{ width: "100%", height: 60, objectFit: "contain", marginBottom: 8 }} onError={e => e.target.style.display = "none"} />}
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                <div style={{ fontWeight: 700, fontSize: 13, color: C.text }}>{displayCode}</div>
                {pin._inferred && <span style={{ fontSize: 9, padding: "1px 5px", background: "#e0f2fe", color: "#0369a1", borderRadius: 4, fontWeight: 700 }}>Standard</span>}
              </div>
              <div style={{ fontSize: 12, color: C.muted, marginBottom: 8, lineHeight: 1.5 }}>{displayType}</div>
              <button onClick={() => onAddRFQ && onAddRFQ({ ...product, series: (product.chain_number || product.part_number) + " + " + displayCode, notes: "Pin/Link: " + displayCode })}
                style={{ width: "100%", padding: "5px 0", borderRadius: 5, fontSize: 11, fontWeight: 700, cursor: "pointer", border: "1px solid " + C.blue, background: C.blueBg, color: C.blue }}>
                + Add to RFQ
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SprocketsTab({ product, dbSprockets, onAddRFQ }) {
  const staticSprockets = product.related_sprockets || product.sprockets_available || [];
  const sprockets = (dbSprockets && dbSprockets.length > 0) ? dbSprockets : staticSprockets;
  const loading = dbSprockets === null;

  if (loading) return (
    <div style={{ color: C.muted, fontSize: 13, padding: "24px 0", display: "flex", alignItems: "center", gap: 8 }}>
      <span style={{ display: "inline-block", width: 14, height: 14, border: "2px solid #e2e8f0", borderTopColor: C.navyMid, borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
      Loading sprocket data…
    </div>
  );

  if (!sprockets.length) return (
    <div style={{ padding: "32px 0" }}>
      <div style={{ fontSize: 13, color: C.muted, marginBottom: 8 }}>No sprockets linked to this chain yet.</div>
      <div style={{ fontSize: 12, color: C.muted, padding: "10px 14px", background: C.bg, border: "1px solid " + C.border, borderRadius: 6, maxWidth: 420 }}>
        💡 Sprocket data can be imported via the <strong>Import Center</strong> using the <code>Chain_Sprockets</code> entity target, or contact Uniking for compatible sprocket recommendations.
      </div>
    </div>
  );

  return (
    <div>
      {dbSprockets && dbSprockets.length > 0 && (
        <div style={{ fontSize: 11, color: C.muted, marginBottom: 12 }}>
          {dbSprockets.length} sprocket record{dbSprockets.length !== 1 ? "s" : ""} linked to this chain.
        </div>
      )}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 10 }}>
        {sprockets.map((sp, i) => (
          <div key={sp.id || i} style={{ border: "1px solid " + C.border, borderRadius: 8, padding: "14px", background: C.card }}>
            {sp.image_url && <img src={sp.image_url} alt={sp.sprocket_code || sp.code} style={{ width: "100%", height: 70, objectFit: "contain", marginBottom: 8 }} onError={e => e.target.style.display = "none"} />}
            <div style={{ fontWeight: 700, fontSize: 13, color: C.text, marginBottom: 4 }}>{sp.sprocket_code || sp.code || sp.name || "—"}</div>
            {sp.teeth && <div style={{ fontSize: 12, color: C.slate }}>Teeth: {sp.teeth}</div>}
            {sp.style && <div style={{ fontSize: 12, color: C.slate }}>Style: {sp.style}</div>}
            {(sp.bore_min_in || sp.bore_max_in || sp.bore || sp.bore_info) && (
              <div style={{ fontSize: 12, color: C.slate }}>
                Bore: {sp.bore_min_in && sp.bore_max_in ? `${sp.bore_min_in}"–${sp.bore_max_in}"` : sp.bore || sp.bore_info}
              </div>
            )}
            {sp.material && <div style={{ fontSize: 12, color: C.slate }}>Material: {sp.material}</div>}
            {sp.source_brand && <div style={{ fontSize: 10, color: C.muted, marginTop: 4 }}>Source: {sp.source_brand}</div>}
            <button onClick={() => onAddRFQ && onAddRFQ({ ...product, series: (product.chain_number || product.part_number) + " Sprocket", notes: "Sprocket: " + (sp.sprocket_code || sp.code || sp.name) })}
              style={{ marginTop: 8, width: "100%", padding: "5px 0", borderRadius: 5, fontSize: 11, fontWeight: 700, cursor: "pointer", border: "1px solid " + C.blue, background: C.blueBg, color: C.blue }}>
              + Add to RFQ
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function MaterialsTab({ product }) {
  const materials = product.materials_available || product.options || [];
  return (
    <div>
      {materials.length > 0 ? (
        <div>
          <SectionTitle>Confirmed Material / Coating Options</SectionTitle>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {materials.map((m, i) => (
              <span key={i} style={{ padding: "6px 12px", background: C.bg, border: "1px solid " + C.border, borderRadius: 20, fontSize: 12, color: C.slate, fontWeight: 600 }}>
                {m}
              </span>
            ))}
          </div>
        </div>
      ) : (
        <div style={{ color: C.muted, fontSize: 13, marginBottom: 16 }}>No confirmed material options on file. Contact Uniking.</div>
      )}
      <div style={{ marginTop: 20, padding: "12px 14px", background: C.amberBg, border: "1px solid #fbbf24", borderRadius: 6, fontSize: 12, color: C.amber }}>
        ⚠ Only confirmed source options are shown. Additional materials may be available — contact Uniking for your specific requirement.
      </div>
    </div>
  );
}

function OptionsTab({ product }) {
  // options_upgrades can be a string (DB) or array (static)
  const rawOpts = product.options || product.options_upgrades || [];
  const opts = typeof rawOpts === "string"
    ? rawOpts.split(/[,;|\n]+/).map(s => s.trim()).filter(Boolean)
    : Array.isArray(rawOpts) ? rawOpts : [];
  if (!opts.length) return (
    <div style={{ color: C.muted, fontSize: 13, padding: "24px 0" }}>No option / upgrade data available. Contact Uniking.</div>
  );
  return (
    <div>
      <SectionTitle>Available Options & Upgrades</SectionTitle>
      <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 8 }}>
        {opts.map((o, i) => (
          <li key={i} style={{ padding: "8px 12px", background: C.bg, border: "1px solid " + C.border, borderRadius: 6, fontSize: 13, color: C.slate }}>
            ✦ {o}
          </li>
        ))}
      </ul>
    </div>
  );
}

function SourceDataTab({ product }) {
  // Normalized chains use chain_id + source_refs; legacy chains use source_data / source fields
  const hasNormalizedRefs = !!product.chain_id;
  const sources = product.source_data || [];
  const singleSource = product.source;
  const sourceUrl = product.source_url;

  return (
    <div>
      {/* Normalized equivalency panel (new architecture) */}
      {hasNormalizedRefs && (
        <div style={{ marginBottom: 20 }}>
          <SectionTitle>Manufacturer Equivalencies</SectionTitle>
          <ChainEquivalencyPanel chain_id={product.chain_id} />
        </div>
      )}

      {/* Legacy source_data (existing catalog products) */}
      {!hasNormalizedRefs && sources.length > 0 && (
        <div>
          <SectionTitle>Source References</SectionTitle>
          {sources.map((s, i) => (
            <div key={i} style={{ border: "1px solid " + C.border, borderRadius: 8, padding: 14, marginBottom: 10, background: C.bg }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: C.text }}>{s.brand}</div>
                <span style={{
                  fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 20,
                  background: s.confidence === "Confirmed" ? C.greenBg : s.confidence === "Needs Review" ? C.amberBg : "#fef2f2",
                  color: s.confidence === "Confirmed" ? C.green : s.confidence === "Needs Review" ? C.amber : "#dc2626",
                  border: `1px solid ${s.confidence === "Confirmed" ? "#86efac" : s.confidence === "Needs Review" ? "#fbbf24" : "#fca5a5"}`
                }}>
                  {s.confidence || "Needs Review"}
                </span>
              </div>
              {s.product_code && <div style={{ fontSize: 12, color: C.muted }}>Product Code: {s.product_code}</div>}
              {s.notes && <div style={{ fontSize: 12, color: C.slate, marginTop: 6, lineHeight: 1.5 }}>{s.notes}</div>}
              {s.catalog_url && (
                <a href={s.catalog_url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: C.blue, fontWeight: 600, display: "block", marginTop: 6 }}>
                  View Source Catalog →
                </a>
              )}
            </div>
          ))}
        </div>
      )}

      {!hasNormalizedRefs && !sources.length && singleSource && (
        <div style={{ border: "1px solid " + C.border, borderRadius: 8, padding: 14, background: C.bg }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: C.text, marginBottom: 4 }}>{singleSource}</div>
          <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 20, background: C.greenBg, color: C.green, border: "1px solid #86efac" }}>Confirmed</span>
          {sourceUrl && (
            <a href={sourceUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: C.blue, fontWeight: 600, display: "block", marginTop: 8 }}>
              View Catalog Page →
            </a>
          )}
        </div>
      )}

      {!hasNormalizedRefs && !sources.length && !singleSource && (
        <div style={{ color: C.muted, fontSize: 13, padding: "24px 0" }}>No source data on file. Contact Uniking.</div>
      )}

      <div style={{ marginTop: 16, padding: "10px 14px", background: "#f0f9ff", border: "1px solid #bae6fd", borderRadius: 6, fontSize: 12, color: "#0369a1" }}>
        ℹ This platform merges data from multiple suppliers. All specifications must be confirmed by Uniking before supply.
      </div>
    </div>
  );
}

function DownloadsTab({ product }) {
  const downloads = product.downloads || [];
  const hasDrawing = product.diagram_image || product.drawing_url;
  if (!downloads.length && !hasDrawing) return (
    <div style={{ color: C.muted, fontSize: 13, padding: "24px 0" }}>No downloads available. Contact Uniking.</div>
  );
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {hasDrawing && (
        <a href={product.diagram_image || product.drawing_url} target="_blank" rel="noopener noreferrer"
          style={{ display: "flex", alignItems: "center", gap: 10, padding: "11px 14px", background: C.bg, borderRadius: 8, border: "1px solid " + C.border, color: C.navyMid, fontWeight: 700, fontSize: 13, textDecoration: "none" }}>
          📐 Dimensional Drawing
        </a>
      )}
      {downloads.map((d, i) => (
        <a key={i} href={d.url} target="_blank" rel="noopener noreferrer"
          style={{ display: "flex", alignItems: "center", gap: 10, padding: "11px 14px", background: C.bg, borderRadius: 8, border: "1px solid " + C.border, color: C.navyMid, fontWeight: 700, fontSize: 13, textDecoration: "none" }}>
          📄 {d.label || d.name} {d.type ? `(${d.type})` : ""}
        </a>
      ))}
    </div>
  );
}

export default function ChainDetailTabs({ product, dbSprockets, dbMedia, onAddRFQ }) {
  const [activeTab, setActiveTab] = useState("specs");

  // Always compute valid attachments for tab visibility
  // String codes in attachments_available are always valid (resolved from ATTACHMENT_LIBRARY)
  const allAtts = product.related_attachments || product.attachments_available || [];
  const hasAttachments = allAtts.length > 0 && allAtts.some(att =>
    typeof att === "string"
      ? !!ATTACHMENT_LIBRARY[att]
      : !!(att.code || att.attachment_code || att.name)
  );
  // Pins tab always shows for ANSI chains (we infer CL/OL standard links from chain number)
  const explicitPins = product.related_pins || product.pins_links_available || [];
  const chainNumStr = String(product.chain_number || product.chain_id || "");
  const hasInferrableLinks = /\d/.test(chainNumStr); // has a number = ANSI-style chain
  const hasPins = explicitPins.some(p => !!(p.code || p.name)) || hasInferrableLinks;
  // Sprockets tab always shown — uses DB data (loading/empty states handled in tab)
  const hasSprockets = true;
  const hasMaterials = (product.materials_available?.length || product.options?.length) > 0;
  const hasOptions = !!(product.options?.length || product.options_upgrades?.length ||
    (typeof product.options_upgrades === "string" && product.options_upgrades.trim()));
  const hasSource = product.source || (product.source_data?.length > 0) || !!product.chain_id;
  const hasDownloads = (product.downloads?.length > 0) || product.diagram_image || product.drawing_url;

  const tabs = [
    { key: "specs", label: "Specifications", always: true },
    hasAttachments && { key: "attachments", label: "Attachments" },
    hasPins && { key: "pins", label: "Pins & Links" },
    hasSprockets && { key: "sprockets", label: "Sprockets" },
    { key: "materials", label: "Materials" },
    hasOptions && { key: "options", label: "Options" },
    hasSource && { key: "source", label: "Source Data" },
    hasDownloads && { key: "downloads", label: "Downloads" },
  ].filter(Boolean);

  const currentTab = tabs.find(t => t.key === activeTab) ? activeTab : "specs";

  return (
    <div>
      {/* Tab bar */}
      <div style={{ display: "flex", overflowX: "auto", borderBottom: "2px solid " + C.border, marginBottom: 20, scrollbarWidth: "none" }}>
        {tabs.map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key)}
            style={{ padding: "9px 14px", border: "none", background: "none", cursor: "pointer", fontSize: 12, fontWeight: 700, whiteSpace: "nowrap", color: currentTab === t.key ? C.navyMid : C.muted, borderBottom: currentTab === t.key ? "2px solid " + C.navyMid : "2px solid transparent", marginBottom: -2, transition: "color 0.13s, border-color 0.13s" }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {currentTab === "specs" && <SpecsTab product={product} />}
      {currentTab === "attachments" && <AttachmentsTab product={product} onAddRFQ={onAddRFQ} />}
      {currentTab === "pins" && <PinsTab product={product} onAddRFQ={onAddRFQ} />}
      {currentTab === "sprockets" && <SprocketsTab product={product} dbSprockets={dbSprockets} onAddRFQ={onAddRFQ} />}
      {currentTab === "materials" && <MaterialsTab product={product} />}
      {currentTab === "options" && <OptionsTab product={product} />}
      {currentTab === "source" && <SourceDataTab product={product} />}
      {currentTab === "downloads" && <DownloadsTab product={product} />}
    </div>
  );
}