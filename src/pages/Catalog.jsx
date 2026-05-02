// v3 - Maxi-Lift redesign: per-size spec sheets, material selector, Add to RFQ
import { useState, useEffect, useMemo } from "react";
import { UniCatalog } from "@/api/entities";
import { CatalogProduct } from "@/api/entities";
import { ElevatorBucket } from "@/api/entities";
import { MacChainProduct } from "@/api/entities";

const NAVY = "#1a3a5c";
const AMBER = "#b45309";

const TYPE_META = {
  "Elevator Bucket":        { color: "#b45309", bg: "#fef3c7" },
  "Elevator Belt":          { color: "#7c3aed", bg: "#ede9fe" },
  "Hardware & Accessories": { color: "#92400e", bg: "#fef9c3" },
  "Modular Plastic Belt":   { color: "#065f46", bg: "#d1fae5" },
  "Wire Mesh Belt":         { color: "#1e40af", bg: "#dbeafe" },
  "Steel Hinged Belt":      { color: "#374151", bg: "#f3f4f6" },
  "Table Top Chain":        { color: "#0e7490", bg: "#cffafe" },
  "ANSI/BS Chain":          { color: "#4338ca", bg: "#e0e7ff" },
  "ANSI Roller Chain":      { color: "#3730a3", bg: "#e0e7ff" },
  "ANSI Roller Chain Attachments": { color: "#6d28d9", bg: "#ede9fe" },
  "Cast Chain":             { color: "#7f1d1d", bg: "#fee2e2" },
  "Engineered Chain":       { color: "#1d4ed8", bg: "#dbeafe" },
  "Forged Chain":           { color: "#92400e", bg: "#ffedd5" },
  "Welded Steel Chain":     { color: "#374151", bg: "#f1f5f9" },
  "Overhead Chain":         { color: "#0f766e", bg: "#ccfbf1" },
  "Sharptop Chain":         { color: "#166534", bg: "#dcfce7" },
  "Thermoforming Chain":    { color: "#9333ea", bg: "#f3e8ff" },
  "Kiln Chain":             { color: "#c2410c", bg: "#ffedd5" },
  "Conveyor Roller":        { color: "#0369a1", bg: "#e0f2fe" },
  "Magnetic Conveyor":      { color: "#be185d", bg: "#fce7f3" },
  "Monitoring System":      { color: "#047857", bg: "#d1fae5" },
};

function getBucketType(b) {
  const p = (b.profile || "").toLowerCase();
  const s = (b.series || "").toLowerCase();
  if (p === "belting" || s.includes("belt") || s.includes("pathfinder") || s.includes("industrial belt")) return "Elevator Belt";
  if (p === "hardware" || s.includes("bolt") || s.includes("splice")) return "Hardware & Accessories";
  return "Elevator Bucket";
}

function Badge({ label, bg = "#f3f4f6", color = "#374151", xs }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", padding: xs ? "1px 7px" : "3px 10px",
      borderRadius: 99, background: bg, color, fontSize: xs ? 10 : 11, fontWeight: 700, whiteSpace: "nowrap" }}>
      {label}
    </span>
  );
}

// ─── BUCKET MODAL (fully redesigned) ────────────────────────────────────────
const MATERIAL_COLORS = {
  "Polyethylene": { color: "#b45309", bg: "#fef3c7", label: "HDPE Poly" },
  "HDPE": { color: "#b45309", bg: "#fef3c7", label: "HDPE Poly" },
  "Nylon": { color: "#92400e", bg: "#fff7ed", label: "Nylon" },
  "Urethane": { color: "#065f46", bg: "#d1fae5", label: "Urethane" },
  "FDA Nylon": { color: "#7c3aed", bg: "#ede9fe", label: "FDA Nylon" },
  "Ductile Iron": { color: "#374151", bg: "#f3f4f6", label: "Ductile Iron" },
  "Mild Steel": { color: "#374151", bg: "#f1f5f9", label: "Mild Steel" },
  "Welded Steel": { color: "#374151", bg: "#f1f5f9", label: "Welded Steel" },
};

function getMaterials(matStr) {
  if (!matStr) return [];
  return matStr.split(/[/,]/).map(m => m.trim()).filter(Boolean);
}

function BucketSizeTable({ sizesJson }) {
  if (!sizesJson) return null;
  let rows = [];
  try { rows = typeof sizesJson === "string" ? JSON.parse(sizesJson) : sizesJson; } catch { return null; }
  if (!rows.length) return null;

  // Determine which columns exist
  const hasCapFt = rows.some(r => r.capacity_cu_ft);
  const hasCapIn = rows.some(r => r.capacity_cu_in);
  const hasWeight = rows.some(r => r.weight_hdpe_lbs || r.weight_lbs);

  const cols = [
    { key: "size", label: "Bucket Size" },
    { key: "length_in", label: 'Length (in.)' },
    { key: "projection_in", label: 'Projection (in.)' },
    { key: "depth_in", label: 'Depth (in.)' },
    { key: "wall_thickness", label: 'Wall (in.)' },
    hasWeight && { key: "weight_hdpe_lbs", label: 'Weight (lbs)', fn: r => r.weight_hdpe_lbs || r.weight_lbs },
    hasCapIn && { key: "capacity_cu_in", label: 'Capacity (cu.in.)' },
    hasCapFt && { key: "capacity_cu_ft", label: 'Capacity (cu.ft.)' },
    { key: "std_spacing_in", label: 'Std Spacing (in.)' },
  ].filter(Boolean);

  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
        <thead>
          <tr style={{ background: NAVY }}>
            {cols.map(c => (
              <th key={c.key} style={{ padding: "8px 10px", color: "#fff", fontWeight: 700,
                textAlign: "left", whiteSpace: "nowrap", fontSize: 11 }}>{c.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} style={{ background: i % 2 === 0 ? "#f8fafc" : "#fff", borderBottom: "1px solid #e5e7eb" }}>
              {cols.map(c => {
                const val = c.fn ? c.fn(row) : row[c.key];
                return (
                  <td key={c.key} style={{ padding: "7px 10px",
                    color: c.key === "size" ? NAVY : "#374151",
                    fontWeight: c.key === "size" ? 700 : 400, whiteSpace: "nowrap" }}>
                    {val != null && val !== "" ? String(val) : "—"}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function BucketModal({ rec, onClose }) {
  const [tab, setTab] = useState("overview");
  const [selectedMat, setSelectedMat] = useState(null);
  const [addedToCart, setAddedToCart] = useState(false);

  if (!rec) return null;

  const materials = getMaterials(rec.material);

  // Set default material
  const activeMat = selectedMat || materials[0] || null;

  function handleAddToRFQ() {
    const cart = JSON.parse(localStorage.getItem("uniking_rfq_cart") || "[]");
    const item = {
      id: `bucket-${rec.id}-${activeMat || "std"}-${Date.now()}`,
      type: "Elevator Bucket",
      series: rec.series,
      style: rec.style,
      application: rec.application,
      material: activeMat,
      discharge: rec.discharge_type,
      profile: rec.profile,
      sizes: rec.bucket_sizes,
      notes: "",
      qty: 1,
      source: "ElevatorBucket",
    };
    cart.push(item);
    localStorage.setItem("uniking_rfq_cart", JSON.stringify(cart));
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  }

  const hasSizes = rec.bucket_sizes_detail && rec.bucket_sizes_detail !== "[]";

  const tabs = [
    ["overview", "Overview"],
    hasSizes && ["sizes", "Size Chart"],
    materials.length > 0 && ["materials", "Materials"],
    rec.tech_doc_url && ["resources", "Resources"],
  ].filter(Boolean);

  // Discharge badge color
  const isHighSpeed = (rec.discharge_type || "").toLowerCase().includes("high speed");
  const isContinuous = (rec.discharge_type || "").toLowerCase().includes("continuous");
  const dischargeColor = isHighSpeed ? "#b45309" : isContinuous ? "#0369a1" : "#374151";
  const dischargeBg = isHighSpeed ? "#fef3c7" : isContinuous ? "#e0f2fe" : "#f3f4f6";

  // Application badge
  const isAg = (rec.application || "").toLowerCase().includes("ag");
  const appColor = isAg ? "#065f46" : "#1d4ed8";
  const appBg = isAg ? "#d1fae5" : "#dbeafe";

  // Material selector options
  const matMap = {
    "Polyethylene (HDPE)": MATERIAL_COLORS["HDPE"],
    "Polyethylene": MATERIAL_COLORS["HDPE"],
    "Nylon": MATERIAL_COLORS["Nylon"],
    "FDA Nylon": MATERIAL_COLORS["FDA Nylon"],
    "Urethane": MATERIAL_COLORS["Urethane"],
    "Ductile Iron": MATERIAL_COLORS["Ductile Iron"],
    "Mild Steel": MATERIAL_COLORS["Mild Steel"],
    "Welded Steel": MATERIAL_COLORS["Welded Steel"],
  };
  const getMC = (m) => {
    for (const [k, v] of Object.entries(matMap)) {
      if (m.toLowerCase().includes(k.toLowerCase())) return v;
    }
    return { color: "#374151", bg: "#f3f4f6", label: m };
  };

  // Material temp/application details from notes
  const matDetails = {
    "Polyethylene": { temp: "-60°F to +180°F", use: "Grain & Food Products", fda: "Yes" },
    "HDPE": { temp: "-60°F to +180°F", use: "Grain & Food Products", fda: "Yes" },
    "Nylon": { temp: "-60°F to +300°F", use: "Hot, high-impact, abrasive dense products", fda: "No" },
    "Urethane": { temp: "-60°F to +180°F", use: "Heavy abrasion, sticky materials", fda: "Yes" },
    "FDA Nylon": { temp: "-60°F to +300°F", use: "Hot, high-impact food-grade products", fda: "Yes" },
    "Ductile Iron": { temp: "Up to 600°F", use: "Sand, glass, shot blast, rock, concrete", fda: "No" },
    "Mild Steel": { temp: "High temp capable", use: "Packed materials, grain, fertilizer", fda: "No" },
    "Welded Steel": { temp: "High temp capable", use: "Industrial bulk materials, ore, cement", fda: "No" },
  };
  const getMatDetail = (m) => {
    for (const [k, v] of Object.entries(matDetails)) {
      if (m.toLowerCase().includes(k.toLowerCase())) return v;
    }
    return null;
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.6)", zIndex: 1000,
      display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }} onClick={onClose}>
      <div style={{ background: "#fff", borderRadius: 16, width: "100%", maxWidth: 780,
        maxHeight: "93vh", overflowY: "auto" }} onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div style={{ background: `linear-gradient(135deg,${NAVY},#2d5986)`,
          borderRadius: "16px 16px 0 0", padding: "20px 22px 18px", position: "relative" }}>
          <button onClick={onClose} style={{ position: "absolute", top: 12, right: 14,
            background: "rgba(255,255,255,.15)", border: "none", borderRadius: "50%",
            width: 32, height: 32, cursor: "pointer", color: "#fff", fontSize: 16 }}>✕</button>

          <div style={{ display: "flex", gap: 8, marginBottom: 10, flexWrap: "wrap" }}>
            <Badge label="Elevator Bucket" bg="#fef3c7" color={AMBER} />
            <Badge label={rec.application} bg={appBg} color={appColor} />
            <Badge label={rec.duty} bg="rgba(255,255,255,.15)" color="#fff" />
          </div>

          <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
            {rec.image_url && (
              <div style={{ background: "#fff", borderRadius: 10, padding: 8,
                boxShadow: "0 2px 10px rgba(0,0,0,0.2)", flexShrink: 0,
                width: 110, height: 90, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <img src={rec.image_url} alt={rec.series}
                  style={{ maxWidth: 100, maxHeight: 80, objectFit: "contain" }}
                  onError={e => { e.target.parentElement.style.display = "none"; }} />
              </div>
            )}
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 22, fontWeight: 900, color: "#fff", lineHeight: 1.15 }}>{rec.series}</div>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,.65)", marginTop: 3 }}>{rec.style}</div>
              <div style={{ display: "flex", gap: 6, marginTop: 10, flexWrap: "wrap" }}>
                {rec.discharge_type && (
                  <Badge label={rec.discharge_type} bg={dischargeBg} color={dischargeColor} />
                )}
                {rec.profile && (
                  <Badge label={rec.profile} bg="rgba(255,255,255,.15)" color="#fff" />
                )}
              </div>
            </div>
          </div>

          {/* Material Selector */}
          {materials.length > 0 && (
            <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid rgba(255,255,255,.2)" }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,.5)",
                textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>Select Material</div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {materials.map(m => {
                  const mc = getMC(m);
                  const isActive = activeMat === m;
                  return (
                    <button key={m} onClick={() => setSelectedMat(m)}
                      style={{ padding: "6px 14px", borderRadius: 99, fontSize: 12, fontWeight: 700,
                        cursor: "pointer", transition: "all .15s",
                        background: isActive ? mc.bg : "rgba(255,255,255,.1)",
                        color: isActive ? mc.color : "rgba(255,255,255,.75)",
                        border: isActive ? `2px solid ${mc.color}` : "2px solid rgba(255,255,255,.25)" }}>
                      {m}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Active Material Info Bar */}
        {activeMat && (() => {
          const detail = getMatDetail(activeMat);
          const mc = getMC(activeMat);
          if (!detail) return null;
          return (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr",
              gap: 0, borderBottom: "1px solid #e5e7eb", background: mc.bg }}>
              <div style={{ padding: "10px 16px", borderRight: "1px solid rgba(0,0,0,.06)" }}>
                <div style={{ fontSize: 9, fontWeight: 800, color: mc.color, textTransform: "uppercase", letterSpacing: 1 }}>Temperature Range</div>
                <div style={{ fontSize: 12, color: NAVY, fontWeight: 700, marginTop: 2 }}>{detail.temp}</div>
              </div>
              <div style={{ padding: "10px 16px", borderRight: "1px solid rgba(0,0,0,.06)" }}>
                <div style={{ fontSize: 9, fontWeight: 800, color: mc.color, textTransform: "uppercase", letterSpacing: 1 }}>Application</div>
                <div style={{ fontSize: 12, color: NAVY, fontWeight: 700, marginTop: 2 }}>{detail.use}</div>
              </div>
              <div style={{ padding: "10px 16px" }}>
                <div style={{ fontSize: 9, fontWeight: 800, color: mc.color, textTransform: "uppercase", letterSpacing: 1 }}>FDA Approved</div>
                <div style={{ fontSize: 12, color: detail.fda === "Yes" ? "#065f46" : "#7f1d1d", fontWeight: 700, marginTop: 2 }}>
                  {detail.fda === "Yes" ? "✓ Yes" : "✗ No"}
                </div>
              </div>
            </div>
          );
        })()}

        {/* Notes */}
        {rec.notes && (
          <div style={{ margin: "14px 20px 0", fontSize: 13, color: "#374151", lineHeight: 1.7,
            padding: "10px 14px", background: "#f8fafc", borderRadius: 8, borderLeft: `3px solid ${AMBER}` }}>
            {rec.notes}
          </div>
        )}

        {/* Tabs */}
        <div style={{ display: "flex", borderBottom: "2px solid #f3f4f6", margin: "14px 20px 0", overflowX: "auto" }}>
          {tabs.map(([id, label]) => (
            <button key={id} onClick={() => setTab(id)}
              style={{ padding: "8px 16px", border: "none", background: "none", cursor: "pointer",
                fontSize: 12, fontWeight: 700, whiteSpace: "nowrap",
                color: tab === id ? AMBER : "#9ca3af",
                borderBottom: tab === id ? `2px solid ${AMBER}` : "2px solid transparent", marginBottom: -2 }}>
              {label}
            </button>
          ))}
        </div>

        <div style={{ padding: "16px 20px 0" }}>

          {/* Overview Tab */}
          {tab === "overview" && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {[
                ["Series", rec.series],
                ["Style", rec.style],
                ["Application", rec.application],
                ["Duty", rec.duty],
                ["Discharge Type", rec.discharge_type],
                ["Profile", rec.profile],
                ["Available Sizes", rec.bucket_sizes ? rec.bucket_sizes.split(",").length + " sizes" : null],
                ["Catalog Pages", rec.page_range ? `pp. ${rec.page_range}` : null],
              ].filter(([, v]) => v).map(([l, v]) => (
                <div key={l} style={{ padding: "10px 12px", background: "#f8fafc", borderRadius: 8, border: "1px solid #f1f5f9" }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: .5, marginBottom: 3 }}>{l}</div>
                  <div style={{ fontSize: 13, color: NAVY, fontWeight: 600 }}>{v}</div>
                </div>
              ))}
              {rec.color && (
                <div style={{ padding: "10px 12px", background: "#f8fafc", borderRadius: 8, border: "1px solid #f1f5f9", gridColumn: "1/-1" }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: .5, marginBottom: 3 }}>Color by Material</div>
                  <div style={{ fontSize: 13, color: NAVY, fontWeight: 600 }}>{rec.color}</div>
                </div>
              )}
            </div>
          )}

          {/* Size Chart Tab */}
          {tab === "sizes" && (
            <div>
              <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 12, lineHeight: 1.6 }}>
                Representative size data. All dimensions in inches. Contact Uniking Canada for full size chart or custom options.
              </div>
              <BucketSizeTable sizesJson={rec.bucket_sizes_detail} />
              {rec.bucket_sizes && (
                <div style={{ marginTop: 12, padding: "10px 14px", background: "#f8fafc", borderRadius: 8, fontSize: 12, color: "#374151" }}>
                  <span style={{ fontWeight: 700, color: NAVY }}>All available sizes: </span>
                  {rec.bucket_sizes}
                </div>
              )}
            </div>
          )}

          {/* Materials Tab */}
          {tab === "materials" && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {materials.map(m => {
                const mc = getMC(m);
                const detail = getMatDetail(m);
                return (
                  <div key={m} style={{ padding: "14px", borderRadius: 10,
                    background: mc.bg, border: `1px solid ${mc.color}30` }}>
                    <div style={{ fontSize: 13, fontWeight: 800, color: mc.color, marginBottom: 8 }}>{m}</div>
                    {detail && (
                      <>
                        <div style={{ fontSize: 11, color: "#374151", marginBottom: 4 }}>
                          <strong>Temp:</strong> {detail.temp}
                        </div>
                        <div style={{ fontSize: 11, color: "#374151", marginBottom: 4 }}>
                          <strong>Use:</strong> {detail.use}
                        </div>
                        <div style={{ fontSize: 11 }}>
                          <strong>FDA:</strong>{" "}
                          <span style={{ color: detail.fda === "Yes" ? "#065f46" : "#7f1d1d" }}>
                            {detail.fda === "Yes" ? "✓ Approved" : "✗ Not approved"}
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Resources Tab */}
          {tab === "resources" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {rec.tech_doc_url && (
                <a href={rec.tech_doc_url} target="_blank" rel="noreferrer"
                  style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px",
                    background: "#f8fafc", borderRadius: 10, border: "1px solid #e5e7eb",
                    color: NAVY, fontWeight: 700, fontSize: 13, textDecoration: "none" }}>
                  <span style={{ fontSize: 18 }}>🌐</span> View Full Specifications — maxilift.com
                </a>
              )}
            </div>
          )}
        </div>

        {/* Add to RFQ Footer */}
        <div style={{ padding: "16px 20px 24px", marginTop: 12 }}>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <button onClick={handleAddToRFQ}
              style={{ flex: 1, padding: "12px 20px", borderRadius: 10, border: "none",
                background: addedToCart ? "#065f46" : NAVY, color: "#fff",
                fontSize: 14, fontWeight: 800, cursor: "pointer", transition: "background .2s",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
              {addedToCart ? "✓ Added to RFQ" : "Add to RFQ"}
            </button>
            <a href="/rfq-cart" style={{ padding: "12px 16px", borderRadius: 10,
              border: `1px solid ${NAVY}`, color: NAVY, fontWeight: 700, fontSize: 13,
              textDecoration: "none", whiteSpace: "nowrap" }}>
              View Cart
            </a>
          </div>
          <div style={{ marginTop: 8, fontSize: 11, color: "#9ca3af", textAlign: "center" }}>
            {activeMat ? `Selected: ${activeMat}` : "No material selected — will use default"}
          </div>
        </div>

      </div>
    </div>
  );
}

// ─── BUCKET CARD (redesigned) ────────────────────────────────────────────────
function BucketCard({ rec, onClick }) {
  const isAg = (rec.application || "").toLowerCase().includes("ag");
  const appColor = isAg ? "#065f46" : "#1d4ed8";
  const appBg = isAg ? "#d1fae5" : "#dbeafe";
  const materials = getMaterials(rec.material);
  const isHighSpeed = (rec.discharge_type || "").toLowerCase().includes("high speed");
  const isCont = (rec.discharge_type || "").toLowerCase().includes("continuous");
  const dcColor = isHighSpeed ? "#b45309" : isCont ? "#0369a1" : "#374151";

  const sizeCount = rec.bucket_sizes ? rec.bucket_sizes.split(",").length : 0;

  return (
    <div onClick={onClick}
      style={{ background: "#fff", borderRadius: 14, border: "1px solid #e5e7eb",
        cursor: "pointer", display: "flex", flexDirection: "column", overflow: "hidden",
        transition: "transform .15s, box-shadow .15s" }}
      onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,.10)"; }}
      onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; }}>

      {/* Colored top stripe */}
      <div style={{ height: 4, background: `linear-gradient(90deg,${AMBER},${AMBER}66)` }} />

      {/* Image */}
      <div style={{ background: "#f8fafc", borderBottom: "1px solid #f1f5f9",
        display: "flex", alignItems: "center", justifyContent: "center", height: 130, overflow: "hidden" }}>
        {rec.image_url ? (
          <img src={rec.image_url} alt={rec.series}
            style={{ maxHeight: 116, maxWidth: "90%", objectFit: "contain", padding: "8px" }}
            onError={e => { e.target.parentElement.innerHTML = '<div style="color:#d1d5db;font-size:36px;line-height:1">🪣</div>'; }} />
        ) : (
          <div style={{ color: "#d1d5db", fontSize: 36, lineHeight: 1 }}>🪣</div>
        )}
      </div>

      <div style={{ padding: "12px 14px", flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
        {/* Badges */}
        <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
          <Badge label={rec.application} bg={appBg} color={appColor} xs />
          <Badge label={rec.duty} bg="#f9fafb" color="#374151" xs />
        </div>

        {/* Series name */}
        <div style={{ fontSize: 14, fontWeight: 900, color: NAVY, lineHeight: 1.2 }}>
          {rec.series}
        </div>

        {/* Style */}
        {rec.style && (
          <div style={{ fontSize: 11, color: "#6b7280" }}>{rec.style}</div>
        )}

        {/* Discharge */}
        {rec.discharge_type && (
          <div style={{ fontSize: 11, color: dcColor, fontWeight: 600 }}>{rec.discharge_type}</div>
        )}

        {/* Materials chips */}
        {materials.length > 0 && (
          <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginTop: 2 }}>
            {materials.slice(0, 4).map(m => {
              const mc = Object.entries(MATERIAL_COLORS).find(([k]) => m.toLowerCase().includes(k.toLowerCase()));
              const { color = "#374151", bg = "#f3f4f6" } = mc ? mc[1] : {};
              return (
                <span key={m} style={{ fontSize: 9, padding: "2px 7px", borderRadius: 99,
                  background: bg, color, fontWeight: 700 }}>{m}</span>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{ padding: "8px 14px", borderTop: "1px solid #f3f4f6",
        display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 10, color: "#9ca3af" }}>
          {sizeCount > 0 ? `${sizeCount} sizes` : ""}
          {rec.page_range ? ` · pp. ${rec.page_range}` : ""}
        </span>
        <span style={{ fontSize: 11, color: AMBER, fontWeight: 700 }}>Spec Sheet →</span>
      </div>
    </div>
  );
}

// ─── GENERIC CARD ──────────────────────────────────────────────────────────
function Card({ rec, type, onClick }) {
  const tm = TYPE_META[type] || { color: NAVY, bg: "#f3f4f6" };
  const hasImage = !!rec.image_url;

  return (
    <div onClick={onClick}
      style={{ background: "#fff", borderRadius: 12, border: "1px solid #e5e7eb",
        cursor: "pointer", display: "flex", flexDirection: "column", overflow: "hidden",
        transition: "transform .15s, box-shadow .15s" }}
      onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 6px 20px rgba(0,0,0,.10)"; }}
      onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; }}>

      <div style={{ height: 4, background: `linear-gradient(90deg,${tm.color},${tm.color}66)` }} />

      {hasImage && (
        <div style={{ background: "#f8fafc", borderBottom: "1px solid #f1f5f9",
          display: "flex", alignItems: "center", justifyContent: "center", height: 130, overflow: "hidden" }}>
          <img src={rec.image_url} alt={rec.series}
            style={{ maxHeight: 120, maxWidth: "100%", objectFit: "contain", padding: "8px" }}
            onError={e => { e.target.style.display = "none"; }} />
        </div>
      )}

      <div style={{ padding: "12px 14px", flex: 1, display: "flex", flexDirection: "column", gap: 5 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 6 }}>
          <Badge label={type} bg={tm.bg} color={tm.color} xs />
          {rec.pitch_in && <span style={{ fontSize: 10, color: "#9ca3af" }}>{rec.pitch_in}" pitch</span>}
        </div>
        <div style={{ fontSize: 13, fontWeight: 800, color: NAVY, lineHeight: 1.25 }}>
          {rec.series || rec.name || "—"}
        </div>
        {(rec.style || rec.category) && (
          <div style={{ fontSize: 11, color: "#6b7280" }}>{rec.style || rec.category}</div>
        )}
        <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
          {rec.hinge_style && <Badge label={rec.hinge_style} bg="#f9fafb" color="#374151" xs />}
          {rec.open_area && rec.open_area !== "0%" && <Badge label={`${rec.open_area} open`} bg="#f0fdf4" color="#15803d" xs />}
          {rec.duty && !rec.hinge_style && <Badge label={rec.duty} bg="#f9fafb" color="#374151" xs />}
        </div>
        {(rec.notes || rec.materials || rec.material) && (
          <div style={{ fontSize: 11, color: "#6b7280", lineHeight: 1.5,
            display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
            {rec.notes || rec.materials || rec.material}
          </div>
        )}
      </div>

      <div style={{ padding: "8px 14px", borderTop: "1px solid #f3f4f6",
        display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 10, color: "#d1d5db" }}>{rec.page_range ? `pp. ${rec.page_range}` : ""}</span>
        <span style={{ fontSize: 11, color: tm.color, fontWeight: 700 }}>Details →</span>
      </div>
    </div>
  );
}

// ─── MAC SPEC TABLE ───────────────────────────────────────────────────────────
function MacSpecTable({ headers, rows }) {
  if (!headers || !rows || !headers.length) return null;
  let parsedHeaders = headers, parsedRows = rows;
  try { if (typeof headers === "string") parsedHeaders = JSON.parse(headers); } catch {}
  try { if (typeof rows === "string") parsedRows = JSON.parse(rows); } catch {}
  if (!parsedHeaders.length || !parsedRows.length) return null;
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
        <thead>
          <tr style={{ background: NAVY }}>
            {parsedHeaders.map((h, i) => (
              <th key={i} style={{ padding: "8px 10px", color: "#fff", fontWeight: 700,
                textAlign: "left", whiteSpace: "nowrap", fontSize: 11 }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {parsedRows.map((row, i) => (
            <tr key={i} style={{ background: i % 2 === 0 ? "#f8fafc" : "#fff", borderBottom: "1px solid #e5e7eb" }}>
              {(Array.isArray(row) ? row : parsedHeaders.map(h => row[h])).map((cell, j) => (
                <td key={j} style={{ padding: "7px 10px", color: j === 0 ? NAVY : "#374151",
                  fontWeight: j === 0 ? 700 : 400, whiteSpace: "nowrap" }}>
                  {cell != null ? String(cell) : "—"}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── BELT DATA TABLE ─────────────────────────────────────────────────────────
function BeltDataTable({ beltData }) {
  if (!beltData) return null;
  let rows = [];
  try { rows = typeof beltData === "string" ? JSON.parse(beltData) : beltData; } catch { return null; }
  if (!rows.length) return null;
  const cols = [
    { key: "material", label: "Material" },
    { key: "strength_lbf", label: "Strength (lbf)" },
    { key: "strength_nm", label: "Strength (N/m)" },
    { key: "temp_min_f", label: "Min Temp (°F)" },
    { key: "temp_max_f", label: "Max Temp (°F)" },
    { key: "mass_lbft2", label: "Mass (lb/ft²)" },
    { key: "mass_kgm2", label: "Mass (kg/m²)" },
  ].filter(c => rows.some(r => r[c.key] != null && r[c.key] !== ""));
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
        <thead>
          <tr style={{ background: NAVY }}>
            {cols.map(c => (
              <th key={c.key} style={{ padding: "8px 10px", color: "#fff", fontWeight: 700,
                textAlign: "left", whiteSpace: "nowrap", fontSize: 11 }}>{c.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} style={{ background: i % 2 === 0 ? "#f8fafc" : "#fff", borderBottom: "1px solid #e5e7eb" }}>
              {cols.map(c => (
                <td key={c.key} style={{ padding: "7px 10px", color: c.key === "material" ? NAVY : "#374151",
                  fontWeight: c.key === "material" ? 700 : 400, whiteSpace: "nowrap" }}>
                  {row[c.key] != null ? String(row[c.key]) : "—"}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── GENERIC MODAL ───────────────────────────────────────────────────────────
function GenericModal({ rec, type, onClose }) {
  const [tab, setTab] = useState("overview");
  const [addedToCart, setAddedToCart] = useState(false);
  if (!rec) return null;
  const tm = TYPE_META[type] || { color: NAVY, bg: "#f3f4f6" };
  const isIntralox = !!rec.pitch_in;
  const isMac = rec._src === "mac";

  let beltRows = [];
  if (rec.belt_data) { try { beltRows = typeof rec.belt_data === "string" ? JSON.parse(rec.belt_data) : rec.belt_data; } catch {} }
  const hasBeltData = beltRows.length > 0;
  let parsedSpecs = null;
  if (rec.key_specs) { try { parsedSpecs = JSON.parse(rec.key_specs); } catch {} }
  const matStr = rec.materials || rec.material || "";
  const mats = matStr.split(/[,/]/).map(m => m.trim()).filter(Boolean);

  const specs = isIntralox ? [
    ["Series", rec.series], ["Category", rec.category], ["Style", rec.style],
    ["Pitch", rec.pitch_in ? `${rec.pitch_in}" (${rec.pitch_mm}mm)` : "—"],
    ["Min Width", rec.min_width_in ? `${rec.min_width_in}"` : "—"],
    ["Open Area", rec.open_area], ["Hinge Style", rec.hinge_style],
    ["Pages", rec.page_range ? `pp. ${rec.page_range}` : "—"],
  ] : isMac ? [] : [
    ["Series", rec.series], ["Style", rec.style || rec.category],
    ["Vendor", rec.vendor], ["Duty", rec.duty],
    ["Application", rec.application],
    ["Model / Part No.", rec.model_code],
    ["Sizes Available", rec.sizes_available],
    ["Pages", rec.page_range ? `pp. ${rec.page_range}` : "—"],
  ];

  const hasMacSpecs = isMac && rec.basic_headers && rec.basic_rows;
  const hasMacMore = isMac && rec.more_headers && rec.more_rows;

  const tabs = [
    hasMacSpecs ? ["macspecs", "Specifications"] : ["overview", "Specs"],
    hasMacMore && ["macmore", "More Specs"],
    mats.length > 0 && !isMac && ["materials", "Materials"],
    hasBeltData && ["beltdata", "Belt Data"],
    parsedSpecs && ["keyspecs", "Key Specs"],
    (rec.catalog_url || rec.tech_doc_url || rec.cad_url) && ["resources", "Resources"],
  ].filter(Boolean);

  function handleAddToRFQ() {
    const cart = JSON.parse(localStorage.getItem("uniking_rfq_cart") || "[]");
    cart.push({
      id: `${rec._src}-${rec.id}-${Date.now()}`,
      type,
      series: rec.series || rec.part_number,
      style: rec.style || rec.category,
      notes: "",
      qty: 1,
      source: rec._src,
    });
    localStorage.setItem("uniking_rfq_cart", JSON.stringify(cart));
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  }

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.55)", zIndex: 1000,
      display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }} onClick={onClose}>
      <div style={{ background: "#fff", borderRadius: 16, width: "100%", maxWidth: 700,
        maxHeight: "93vh", overflowY: "auto" }} onClick={e => e.stopPropagation()}>

        <div style={{ background: `linear-gradient(135deg,${NAVY},#2d5986)`,
          borderRadius: "16px 16px 0 0", padding: "20px 22px 16px", position: "relative" }}>
          <button onClick={onClose} style={{ position: "absolute", top: 12, right: 14,
            background: "rgba(255,255,255,.15)", border: "none", borderRadius: "50%",
            width: 32, height: 32, cursor: "pointer", color: "#fff", fontSize: 16 }}>✕</button>
          <div style={{ display: "flex", gap: 8, marginBottom: 10, flexWrap: "wrap" }}>
            <Badge label={type} bg={tm.bg} color={tm.color} />
            {rec.vendor && <Badge label={rec.vendor} bg="rgba(255,255,255,.15)" color="#fff" />}
          </div>
          <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
            {rec.image_url && (
              <div style={{ background: "#ffffff", borderRadius: 10, padding: 8, boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                flexShrink: 0, width: 120, height: 90, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <img src={rec.image_url} alt={rec.series}
                  style={{ maxWidth: 110, maxHeight: 80, objectFit: "contain" }}
                  onError={e => { e.target.parentElement.style.display = "none"; }} />
              </div>
            )}
            <div>
              <div style={{ fontSize: 21, fontWeight: 900, color: "#fff", lineHeight: 1.15 }}>{isMac ? (rec.part_number || rec.series) : rec.series}</div>
              {(rec.style || rec.category) && (
                <div style={{ fontSize: 13, color: "rgba(255,255,255,.65)", marginTop: 4 }}>{rec.style || rec.category}</div>
              )}
              <div style={{ display: "flex", gap: 6, marginTop: 8, flexWrap: "wrap" }}>
                {rec.pitch_in && <Badge label={`${rec.pitch_in}" pitch`} bg="rgba(255,255,255,.15)" color="#fff" />}
                {rec.hinge_style && <Badge label={rec.hinge_style} bg="rgba(255,255,255,.15)" color="#fff" />}
                {rec.open_area && <Badge label={`${rec.open_area} open`} bg="rgba(255,255,255,.15)" color="#fff" />}
              </div>
            </div>
          </div>
        </div>

        {(rec.notes || rec.description) && (
          <div style={{ margin: "14px 20px 0", fontSize: 13, color: "#374151", lineHeight: 1.7,
            padding: "10px 14px", background: "#f8fafc", borderRadius: 8, borderLeft: `3px solid ${tm.color}` }}>
            {rec.notes || rec.description}
          </div>
        )}
        {rec.features && (
          <div style={{ margin: "10px 20px 0" }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>Features</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {(Array.isArray(rec.features) ? rec.features : rec.features.split(";")).map((f, i) => f && f.trim() && (
                <span key={i} style={{ fontSize: 11, padding: "3px 9px", borderRadius: 99,
                  background: tm.bg, color: tm.color, fontWeight: 600 }}>✓ {typeof f === "string" ? f.trim() : f}</span>
              ))}
            </div>
          </div>
        )}

        <div style={{ display: "flex", borderBottom: "2px solid #f3f4f6", margin: "14px 20px 0", overflowX: "auto" }}>
          {tabs.map(([id, label]) => (
            <button key={id} onClick={() => setTab(id)}
              style={{ padding: "8px 14px", border: "none", background: "none", cursor: "pointer",
                fontSize: 12, fontWeight: 700, whiteSpace: "nowrap",
                color: tab === id ? tm.color : "#9ca3af",
                borderBottom: tab === id ? `2px solid ${tm.color}` : "2px solid transparent", marginBottom: -2 }}>
              {label}
            </button>
          ))}
        </div>

        <div style={{ padding: "16px 20px 0" }}>
          {tab === "macspecs" && <MacSpecTable headers={rec.basic_headers} rows={rec.basic_rows} />}
          {tab === "macmore" && <MacSpecTable headers={rec.more_headers} rows={rec.more_rows} />}
          {tab === "overview" && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {specs.filter(([, v]) => v && v !== "—" && v !== "null").map(([l, v]) => (
                <div key={l} style={{ padding: "10px 12px", background: "#f8fafc", borderRadius: 8, border: "1px solid #f1f5f9" }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: .5, marginBottom: 3 }}>{l}</div>
                  <div style={{ fontSize: 13, color: NAVY, fontWeight: 600 }}>{v}</div>
                </div>
              ))}
            </div>
          )}
          {tab === "materials" && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {mats.map((m, i) => (
                <span key={i} style={{ padding: "8px 14px", borderRadius: 99, background: tm.bg,
                  color: tm.color, fontWeight: 700, fontSize: 13 }}>{m}</span>
              ))}
            </div>
          )}
          {tab === "beltdata" && (
            <div>
              <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 12, lineHeight: 1.6 }}>
                Mechanical properties per material option. Strength ratings are per metre of belt width.
              </div>
              <BeltDataTable beltData={rec.belt_data} />
            </div>
          )}
          {tab === "keyspecs" && parsedSpecs && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {Object.entries(parsedSpecs).map(([k, v]) => (
                <div key={k} style={{ padding: "10px 12px", background: "#f8fafc", borderRadius: 8 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: .5, marginBottom: 3 }}>
                    {k.replace(/_/g, " ")}
                  </div>
                  <div style={{ fontSize: 13, color: NAVY, fontWeight: 600 }}>{String(v)}</div>
                </div>
              ))}
            </div>
          )}
          {tab === "resources" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {rec.catalog_url && (
                <a href={rec.catalog_url} target="_blank" rel="noreferrer"
                  style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px",
                    background: "#f8fafc", borderRadius: 10, border: "1px solid #e5e7eb",
                    color: NAVY, fontWeight: 700, fontSize: 13, textDecoration: "none" }}>
                  <span style={{ fontSize: 18 }}>📄</span> View Catalog PDF
                </a>
              )}
              {rec.tech_doc_url && (
                <a href={rec.tech_doc_url} target="_blank" rel="noreferrer"
                  style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px",
                    background: "#f8fafc", borderRadius: 10, border: "1px solid #e5e7eb",
                    color: NAVY, fontWeight: 700, fontSize: 13, textDecoration: "none" }}>
                  <span style={{ fontSize: 18 }}>📐</span> Technical Documentation
                </a>
              )}
              {rec.cad_url && (
                <a href={rec.cad_url} target="_blank" rel="noreferrer"
                  style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px",
                    background: "#f8fafc", borderRadius: 10, border: "1px solid #e5e7eb",
                    color: NAVY, fontWeight: 700, fontSize: 13, textDecoration: "none" }}>
                  <span style={{ fontSize: 18 }}>📁</span> CAD Drawing
                </a>
              )}
            </div>
          )}
        </div>

        {/* Add to RFQ footer */}
        <div style={{ padding: "16px 20px 24px", marginTop: 12 }}>
          <button onClick={handleAddToRFQ}
            style={{ width: "100%", padding: "12px 20px", borderRadius: 10, border: "none",
              background: addedToCart ? "#065f46" : NAVY, color: "#fff",
              fontSize: 14, fontWeight: 800, cursor: "pointer", transition: "background .2s" }}>
            {addedToCart ? "✓ Added to RFQ Cart" : "Add to RFQ Cart"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
export default function Catalog() {
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [appFilter, setAppFilter] = useState("All"); // ag/industrial for buckets
  const [seriesFilter, setSeriesFilter] = useState("All");
  const [hingeFilter, setHingeFilter] = useState("All");
  const [pitchFilter, setPitchFilter] = useState("All");
  const [selected, setSelected] = useState(null);
  const [selectedType, setSelectedType] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const [intralox, unicatalog, buckets, macChains] = await Promise.all([
          CatalogProduct.list(),
          UniCatalog.filter({}, 1, 500),
          ElevatorBucket.list(),
          MacChainProduct.filter({}, 1, 500),
        ]);
        const combined = [
          ...intralox.map(r => ({ ...r, _src: "intralox", _type: r.category || "Modular Plastic Belt" })),
          ...unicatalog.map(r => ({ ...r, _src: "uni", _type: r.product_type })),
          ...buckets.map(r => ({ ...r, _src: "bucket", _type: getBucketType(r) })),
          ...macChains.map(r => ({
            ...r,
            _src: "mac",
            _type: r.product_type === "ANSI Roller Chain" ? "ANSI Roller Chain"
                 : r.product_type === "ANSI Roller Chain Attachments" ? "ANSI Roller Chain Attachments"
                 : "Engineered Chain",
            vendor: "",
            series: r.part_number || r.series,
            style: r.subcategory || r.category,
            image_url: r.product_image || r.image_url,
          })),
        ];
        setAllProducts(combined);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const types = useMemo(() => {
    const s = new Set(allProducts.map(p => p._type).filter(Boolean));
    return ["All", ...Array.from(s).sort()];
  }, [allProducts]);

  const seriesOptions = useMemo(() => {
    const filtered = typeFilter === "All" ? allProducts : allProducts.filter(p => p._type === typeFilter);
    const s = new Set(filtered.map(p => p.series).filter(Boolean));
    return ["All", ...Array.from(s).sort((a, b) => {
      const na = parseFloat(a.replace(/\D/g, "")) || 0;
      const nb = parseFloat(b.replace(/\D/g, "")) || 0;
      return na - nb || a.localeCompare(b);
    })];
  }, [allProducts, typeFilter]);

  const hingeOptions = useMemo(() => {
    const s = new Set(allProducts.filter(p => p.hinge_style).map(p => p.hinge_style));
    return ["All", ...Array.from(s).sort()];
  }, [allProducts]);

  const pitchOptions = useMemo(() => {
    const s = new Set(allProducts.filter(p => p.pitch_in).map(p => `${p.pitch_in}"`));
    return ["All", ...Array.from(s).sort((a, b) => parseFloat(a) - parseFloat(b))];
  }, [allProducts]);

  const showBucketAppFilter = typeFilter === "Elevator Bucket";

  const filtered = useMemo(() => {
    let list = allProducts;
    if (typeFilter !== "All") list = list.filter(p => p._type === typeFilter);
    if (showBucketAppFilter && appFilter !== "All") {
      list = list.filter(p => (p.application || "").toLowerCase().includes(appFilter.toLowerCase()));
    }
    if (seriesFilter !== "All") list = list.filter(p => p.series === seriesFilter);
    if (hingeFilter !== "All") list = list.filter(p => p.hinge_style === hingeFilter);
    if (pitchFilter !== "All") list = list.filter(p => `${p.pitch_in}"` === pitchFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(p =>
        [p.series, p.style, p.category, p.notes, p.materials, p.material, p.search_tags, p.application, p.part_number, p.subcategory, p.description]
          .some(f => f && f.toLowerCase().includes(q))
      );
    }
    return list.sort((a, b) => {
      const parsePN = (s) => {
        const str = (s || "").trim();
        const m = str.match(/^(\d+(?:\.\d+)?)(.*)/);
        if (!m) return [0, 0, str];
        const base = parseFloat(m[1]);
        const rest = m[2] || "";
        const strand = rest.match(/-(\d+)$/);
        return [base, strand ? parseInt(strand[1]) : 1, rest];
      };
      const [an, as2, ar] = parsePN(a.series);
      const [bn, bs2, br] = parsePN(b.series);
      if (an !== bn) return an - bn;
      if (as2 !== bs2) return as2 - bs2;
      return ar.localeCompare(br);
    });
  }, [allProducts, typeFilter, appFilter, showBucketAppFilter, seriesFilter, hingeFilter, pitchFilter, search]);

  const Sel = ({ value, onChange, options, label }) => (
    <select value={value} onChange={e => onChange(e.target.value)}
      style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid #d1d5db", fontSize: 13,
        color: NAVY, background: "#fff", cursor: "pointer", fontWeight: value !== "All" ? 700 : 400 }}>
      <option value="All">{label}</option>
      {options.filter(o => o !== "All").map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  );

  const isBucketView = typeFilter === "Elevator Bucket";
  const bucketAg = filtered.filter(p => p._src === "bucket" && (p.application || "").toLowerCase().includes("ag"));
  const bucketInd = filtered.filter(p => p._src === "bucket" && (p.application || "").toLowerCase().includes("ind"));

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", fontFamily: "'Inter','Segoe UI',sans-serif" }}>

      {/* Top Bar */}
      <div style={{ background: NAVY, padding: "0 24px", display: "flex", alignItems: "center",
        justifyContent: "space-between", height: 56, boxShadow: "0 2px 8px rgba(0,0,0,.18)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <a href="/" style={{ color: "rgba(255,255,255,.5)", textDecoration: "none", fontSize: 12 }}>Home</a>
          <span style={{ color: "rgba(255,255,255,.3)", fontSize: 12 }}>/</span>
          <span style={{ color: "#fff", fontSize: 13, fontWeight: 700 }}>Product Catalog</span>
        </div>
        <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,.45)" }}>
            {loading ? "Loading..." : `${filtered.length} products`}
          </div>
          <a href="/rfq-cart" style={{ padding: "6px 14px", borderRadius: 8,
            background: "rgba(255,255,255,.12)", border: "1px solid rgba(255,255,255,.2)",
            color: "#fff", fontSize: 12, fontWeight: 700, textDecoration: "none" }}>
            RFQ Cart
          </a>
        </div>
      </div>

      {/* Search + Filters */}
      <div style={{ background: "#fff", borderBottom: "1px solid #e5e7eb", padding: "14px 24px" }}>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", maxWidth: 1200, margin: "0 auto" }}>
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search series, style, application, material..."
            style={{ flex: 1, minWidth: 240, padding: "8px 14px", borderRadius: 8,
              border: "1px solid #d1d5db", fontSize: 13, outline: "none" }}
          />
          <Sel value={typeFilter} onChange={v => { setTypeFilter(v); setSeriesFilter("All"); setAppFilter("All"); }} options={types} label="All Types" />
          {showBucketAppFilter && (
            <Sel value={appFilter} onChange={setAppFilter}
              options={["All", "Agricultural", "Industrial"]} label="All Applications" />
          )}
          {seriesOptions.length > 2 && (
            <Sel value={seriesFilter} onChange={setSeriesFilter} options={seriesOptions} label="All Series" />
          )}
          {(hingeFilter !== "All" || hingeOptions.length > 2) && !isBucketView ? (
            <Sel value={hingeFilter} onChange={setHingeFilter} options={hingeOptions} label="Hinge Style" />
          ) : null}
          {pitchOptions.length > 2 && !isBucketView && (
            <Sel value={pitchFilter} onChange={setPitchFilter} options={pitchOptions} label="Pitch" />
          )}
          {(typeFilter !== "All" || appFilter !== "All" || seriesFilter !== "All" || hingeFilter !== "All" || pitchFilter !== "All" || search) && (
            <button onClick={() => { setTypeFilter("All"); setSeriesFilter("All"); setHingeFilter("All"); setPitchFilter("All"); setAppFilter("All"); setSearch(""); }}
              style={{ padding: "8px 14px", borderRadius: 8, border: "1px solid #d1d5db",
                background: "#f9fafb", cursor: "pointer", fontSize: 13, color: "#6b7280" }}>
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "24px" }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: 80, color: "#9ca3af", fontSize: 14 }}>Loading catalog...</div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: 80, color: "#9ca3af", fontSize: 14 }}>No products match your search.</div>
        ) : isBucketView ? (
          /* ── ELEVATOR BUCKET LAYOUT ── grouped by Ag / Industrial */
          <div>
            {(appFilter === "All" || appFilter === "Agricultural") && bucketAg.length > 0 && (
              <div style={{ marginBottom: 40 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                  <div style={{ height: 3, width: 32, background: "#065f46", borderRadius: 99 }} />
                  <h2 style={{ margin: 0, fontSize: 18, fontWeight: 900, color: NAVY }}>Agricultural Buckets</h2>
                  <span style={{ fontSize: 12, color: "#9ca3af" }}>{bucketAg.length} series</span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 16 }}>
                  {bucketAg.map(rec => (
                    <BucketCard key={rec.id} rec={rec} onClick={() => { setSelected(rec); setSelectedType("bucket"); }} />
                  ))}
                </div>
              </div>
            )}
            {(appFilter === "All" || appFilter === "Industrial") && bucketInd.length > 0 && (
              <div style={{ marginBottom: 40 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                  <div style={{ height: 3, width: 32, background: "#1d4ed8", borderRadius: 99 }} />
                  <h2 style={{ margin: 0, fontSize: 18, fontWeight: 900, color: NAVY }}>Industrial Buckets</h2>
                  <span style={{ fontSize: 12, color: "#9ca3af" }}>{bucketInd.length} series</span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 16 }}>
                  {bucketInd.map(rec => (
                    <BucketCard key={rec.id} rec={rec} onClick={() => { setSelected(rec); setSelectedType("bucket"); }} />
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* ── GENERIC GRID ── */
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 16 }}>
            {filtered.map(rec => (
              <Card key={rec.id} rec={rec} type={rec._type} onClick={() => { setSelected(rec); setSelectedType(rec._type); }} />
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      {selected && selectedType === "bucket" && (
        <BucketModal rec={selected} onClose={() => { setSelected(null); setSelectedType(null); }} />
      )}
      {selected && selectedType !== "bucket" && (
        <GenericModal rec={selected} type={selectedType} onClose={() => { setSelected(null); setSelectedType(null); }} />
      )}
    </div>
  );
}
