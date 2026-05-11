/**
 * ICColumnMapper — Map source columns → entity fields
 * Supports loading/saving named mappings
 */
import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { ENTITY_TARGETS } from "@/lib/importCenterEngine";

// Field lists per entity for dropdown options
const ENTITY_FIELDS = {
  Normalized_Chains: ["chain_id","chain_family","chain_number","display_name","standard","pitch_in","pitch_mm","strands","description","application_tags","materials_available","options_upgrades","image_url","drawing_url","uniking_notes","status","needs_review"],
  Chain_Dimensions: ["chain_id","pitch_in","pitch_mm","roller_dia_in","roller_dia_mm","roller_width_in","roller_width_mm","pin_dia_in","pin_dia_mm","pin_length_in","pin_length_mm","plate_height_in","plate_height_mm","plate_thickness_in","plate_thickness_mm","transverse_pitch_in","transverse_pitch_mm","overall_width_in","overall_width_mm","weight_lbs_ft","weight_kg_m","standard","source_brand","notes"],
  Manufacturer_Equivalents: ["chain_id","brand","brand_part_number","brand_series","equivalency_type","confidence","catalog_url","image_url","drawing_url","notes","review_status","needs_review","resolution_notes"],
  Performance_Data: ["chain_id","tier","tensile_strength_lbs","tensile_strength_kn","working_load_lbs","working_load_kn","fatigue_strength_lbs","max_speed_ft_min","max_speed_m_s","temp_min_f","temp_max_f","lubrication","source_brand","catalog_page","notes"],
  Chain_Attachments: ["chain_id","attachment_code","attachment_type","side","lug_height_in","lug_height_mm","hole_dia_in","hole_dia_mm","spacing_note","source_confirmed","source_brand","notes"],
  Chain_Review_Flags: ["chain_id","flag_type","severity","description","affected_field","source_a","value_a","source_b","value_b","resolved","resolution_notes","assigned_to","review_status","needs_review"],
  Chain_Sprockets: ["chain_id","sprocket_code","teeth","style","material","bore_min_in","bore_max_in","pitch_dia_in","pitch_dia_mm","keyway","source_brand","notes"],
  Chain_Downloads: ["chain_id","label","url","file_type","doc_type","brand","language","is_primary","notes"],
  Chain_Media: ["chain_id","media_type","url","label","is_primary","sort_order","source_brand","notes","approved","approved_by","approved_date"],
};

const TRANSFORM_OPTIONS = [
  { value: "", label: "— none —" },
  { value: "parseFloat", label: "parseFloat (number)" },
  { value: "parseInt", label: "parseInt (integer)" },
  { value: "toUpperCase", label: "toUpperCase" },
  { value: "toLowerCase", label: "toLowerCase" },
  { value: "trim", label: "trim whitespace" },
  { value: "boolean", label: "→ boolean (yes/1/true)" },
];

export default function ICColumnMapper({ sourceHeaders, entityTarget, onEntityChange, onMappingReady, initialMapping }) {
  const [mapping, setMapping] = useState({});
  const [transforms, setTransforms] = useState({});
  const [savedMappings, setSavedMappings] = useState([]);
  const [saveName, setSaveName] = useState("");
  const [savingName, setSavingName] = useState(false);
  const [loadMsg, setLoadMsg] = useState(null);

  // Load saved mappings
  useEffect(() => {
    base44.entities.Column_Mappings.list("-updated_date", 100)
      .then(setSavedMappings)
      .catch(() => {});
  }, []);

  // Apply initial mapping if provided
  useEffect(() => {
    if (initialMapping) {
      setMapping(initialMapping.mapping_rules || {});
      setTransforms(initialMapping.transform_rules || {});
    }
  }, [initialMapping]);

  // Auto-suggest mapping: exact case-insensitive match
  useEffect(() => {
    if (!sourceHeaders.length || !entityTarget) return;
    const fields = ENTITY_FIELDS[entityTarget] || [];
    const auto = {};
    sourceHeaders.forEach(h => {
      const norm = h.toLowerCase().replace(/[\s_\-\.()]/g, '');
      const match = fields.find(f => f.toLowerCase().replace(/_/g, '') === norm);
      if (match && !mapping[h]) auto[h] = match;
    });
    if (Object.keys(auto).length > 0) {
      setMapping(prev => ({ ...auto, ...prev }));
    }
  }, [sourceHeaders, entityTarget]);

  function setField(srcCol, val) {
    setMapping(prev => ({ ...prev, [srcCol]: val }));
  }
  function setTransform(srcCol, val) {
    setTransforms(prev => ({ ...prev, [srcCol]: val }));
  }

  function handleLoad(savedMapping) {
    setMapping(savedMapping.mapping_rules || {});
    setTransforms(savedMapping.transform_rules || {});
    setLoadMsg(`Loaded: ${savedMapping.mapping_name}`);
    setTimeout(() => setLoadMsg(null), 3000);
  }

  async function handleSave() {
    if (!saveName.trim()) return;
    const user = await base44.auth.me();
    await base44.entities.Column_Mappings.create({
      mapping_name: saveName.trim(),
      entity_target: entityTarget,
      source_columns: sourceHeaders,
      mapping_rules: mapping,
      transform_rules: transforms,
      created_by: user?.email,
      times_used: 0,
    });
    setSaveName("");
    setSavingName(false);
    const updated = await base44.entities.Column_Mappings.list("-updated_date", 100);
    setSavedMappings(updated);
  }

  const mappedCount = sourceHeaders.filter(h => mapping[h]).length;

  return (
    <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0", overflow: "hidden" }}>
      {/* Header */}
      <div style={{ padding: "16px 20px", borderBottom: "1px solid #e2e8f0", display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 800, color: "#0C2340" }}>Column Mapping</div>
          <div style={{ fontSize: 11, color: "#64748b", marginTop: 1 }}>
            {mappedCount}/{sourceHeaders.length} columns mapped → {entityTarget}
          </div>
        </div>

        {/* Entity target selector */}
        <select
          value={entityTarget}
          onChange={e => onEntityChange(e.target.value)}
          style={selectStyle}
        >
          {ENTITY_TARGETS.map(e => <option key={e} value={e}>{e}</option>)}
        </select>

        {/* Load saved mapping */}
        {savedMappings.filter(m => m.entity_target === entityTarget).length > 0 && (
          <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
            <span style={{ fontSize: 11, color: "#64748b", fontWeight: 600 }}>Load:</span>
            {savedMappings.filter(m => m.entity_target === entityTarget).slice(0,5).map(m => (
              <button key={m.id} onClick={() => handleLoad(m)} style={pillBtn}>
                {m.mapping_name}
              </button>
            ))}
          </div>
        )}

        {loadMsg && <span style={{ fontSize: 11, color: "#16a34a", fontWeight: 700 }}>{loadMsg}</span>}

        {/* Save mapping */}
        <div style={{ marginLeft: "auto", display: "flex", gap: 6, alignItems: "center" }}>
          {savingName ? (
            <>
              <input
                value={saveName}
                onChange={e => setSaveName(e.target.value)}
                placeholder="Mapping name…"
                style={{ ...selectStyle, width: 180 }}
                autoFocus
                onKeyDown={e => e.key === 'Enter' && handleSave()}
              />
              <button onClick={handleSave} style={{ ...pillBtn, background: "#0C2340", color: "#fff" }}>Save</button>
              <button onClick={() => setSavingName(false)} style={pillBtn}>Cancel</button>
            </>
          ) : (
            <button onClick={() => setSavingName(true)} style={pillBtn}>💾 Save Mapping</button>
          )}
        </div>
      </div>

      {/* Governance notice for Normalized_Chains */}
      {entityTarget === "Normalized_Chains" && (
        <div style={{ padding: "10px 20px", background: "#fffbeb", borderBottom: "1px solid #fde68a", fontSize: 11, color: "#92400e" }}>
          <strong>⚠ Governance Rule — Normalized_Chains:</strong> Component/accessory SKUs (e.g. OL-80, CL-80, C/L 80, Offset Link 80, Connecting Link 80) will be automatically flagged as <strong>Invalid</strong> and blocked from commit. These belong in <strong>Chain_Attachments</strong> — not as standalone chain records. A-series, K-series, and SA-series attachment codes with a size suffix are also blocked.
        </div>
      )}

      {/* Mapping table */}
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
          <thead>
            <tr style={{ background: "#f8fafc" }}>
              <th style={th}>#</th>
              <th style={th}>Source Column</th>
              <th style={th}>→ Entity Field</th>
              <th style={th}>Transform</th>
              <th style={th}>Preview</th>
            </tr>
          </thead>
          <tbody>
            {sourceHeaders.map((h, i) => {
              const fields = ENTITY_FIELDS[entityTarget] || [];
              const isMapped = !!mapping[h];
              return (
                <tr key={h} style={{ background: i % 2 === 0 ? "#fff" : "#fafafa", borderBottom: "1px solid #f1f5f9" }}>
                  <td style={td}><span style={{ color: "#94a3b8", fontFamily: "monospace" }}>{i + 1}</span></td>
                  <td style={td}>
                    <span style={{
                      fontFamily: "monospace", fontSize: 11,
                      background: isMapped ? "#f0fdf4" : "#fff7ed",
                      color: isMapped ? "#166534" : "#9a3412",
                      padding: "2px 8px", borderRadius: 4, border: `1px solid ${isMapped ? "#86efac" : "#fed7aa"}`,
                    }}>{h}</span>
                  </td>
                  <td style={td}>
                    <select
                      value={mapping[h] || ""}
                      onChange={e => setField(h, e.target.value)}
                      style={{ ...selectStyle, minWidth: 180 }}
                    >
                      <option value="">— skip —</option>
                      {fields.map(f => <option key={f} value={f}>{f}</option>)}
                    </select>
                  </td>
                  <td style={td}>
                    <select
                      value={transforms[h] || ""}
                      onChange={e => setTransform(h, e.target.value)}
                      style={{ ...selectStyle, minWidth: 140 }}
                    >
                      {TRANSFORM_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </td>
                  <td style={td}>
                    {mapping[h] ? (
                      <span style={{ fontSize: 10, color: "#1d4ed8", fontFamily: "monospace" }}>
                        → {mapping[h]}
                        {transforms[h] ? <span style={{ color: "#7c3aed" }}> ({transforms[h]})</span> : null}
                      </span>
                    ) : (
                      <span style={{ fontSize: 10, color: "#94a3b8", fontStyle: "italic" }}>not mapped</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Apply button */}
      <div style={{ padding: "14px 20px", borderTop: "1px solid #e2e8f0", display: "flex", justifyContent: "flex-end", gap: 10 }}>
        <span style={{ fontSize: 12, color: "#64748b", alignSelf: "center" }}>
          {mappedCount} of {sourceHeaders.length} columns mapped
        </span>
        <button
          onClick={() => onMappingReady(mapping, transforms)}
          disabled={mappedCount === 0}
          style={{
            background: mappedCount === 0 ? "#e2e8f0" : "#0C2340",
            color: mappedCount === 0 ? "#94a3b8" : "#fff",
            border: "none", borderRadius: 8, padding: "9px 22px",
            fontSize: 12, fontWeight: 700, cursor: mappedCount === 0 ? "default" : "pointer",
          }}
        >
          Apply Mapping & Stage →
        </button>
      </div>
    </div>
  );
}

const selectStyle = {
  padding: "5px 10px", border: "1px solid #e2e8f0", borderRadius: 6,
  fontSize: 11, color: "#1e293b", background: "#fff", cursor: "pointer", outline: "none",
};
const pillBtn = {
  padding: "4px 12px", border: "1px solid #e2e8f0", borderRadius: 99,
  background: "#f8fafc", color: "#475569", fontSize: 11, fontWeight: 600, cursor: "pointer",
};
const th = { padding: "8px 12px", textAlign: "left", fontSize: 10, fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.5px", borderBottom: "1px solid #e2e8f0" };
const td = { padding: "7px 12px" };