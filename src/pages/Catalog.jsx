import { useState, useEffect, useMemo, useRef } from "react";
import { CatalogProduct } from "@/api/entities";

const NAVY = "#1a3a5c";
const SILVER = "#9ca3af";
const INTRALOX_RED = "#c8102e";

// ── Material colour map ─────────────────────────────────────────
const MATERIAL_INFO = {
  "Polypropylene":       { abbr:"PP", color:"#dbeafe", text:"#1e40af", note:"General purpose · FDA compliant · good chemical resistance" },
  "Polyethylene":        { abbr:"PE", color:"#dcfce7", text:"#166534", note:"Excellent impact resistance · low friction · FDA compliant" },
  "Acetal":              { abbr:"AC", color:"#fef9c3", text:"#854d0e", note:"High stiffness · low moisture absorption · FDA compliant" },
  "HSEC acetal":         { abbr:"HS", color:"#fef9c3", text:"#a16207", note:"High Strength/Enhanced Coefficient variant of acetal" },
  "Nylon":               { abbr:"NY", color:"#f3e8ff", text:"#6b21a8", note:"High abrasion resistance · elevated temperature capable" },
  "AR Nylon":            { abbr:"AR", color:"#fce7f3", text:"#9d174d", note:"Abrasion-resistant variant · extended wear life" },
  "PVDF":                { abbr:"PV", color:"#ffedd5", text:"#9a3412", note:"Exceptional chemical resistance · high temp · FDA compliant" },
  "Polysulfone":         { abbr:"PS", color:"#e0f2fe", text:"#0c4a6e", note:"High-temp sterilization compatible · NSF certified" },
  "UHMW":                { abbr:"UH", color:"#f0fdf4", text:"#14532d", note:"Ultra-high molecular weight · extreme abrasion resistance" },
  "Stainless Steel":     { abbr:"SS", color:"#f1f5f9", text:"#334155", note:"Metal detectable · high-temp · corrosion resistant" },
  "Carbon Fiber Filled": { abbr:"CF", color:"#1e293b", text:"#94a3b8", note:"Electrically conductive · ESD safe · anti-static" },
};
const getMI = (mat) => {
  if (!mat) return { abbr:"?", color:"#f3f4f6", text:"#374151", note:"" };
  const key = Object.keys(MATERIAL_INFO).find(k => mat.toLowerCase().includes(k.toLowerCase()));
  return key ? MATERIAL_INFO[key] : { abbr: mat.substring(0,2).toUpperCase(), color:"#f3f4f6", text:"#374151", note:mat };
};

// ── Category images ─────────────────────────────────────────────
const CDN = "https://assets-us-01.kc-usercontent.com:443/19eb64b5-1815-003a-d268-e7109927ccad/";
const CAT_IMGS = {
  "Straight-Running Belts": CDN+"645daf38-238c-422a-a113-6c9089f27218/modular-plastic-belting-straight-running-40_21.jpg",
  "Radius Belts":           CDN+"35a6b869-7f0a-446e-8ace-19b9e7bb088d/modular-plastic-belting-radius-3_2.jpg",
  "Spiral Belts":           CDN+"f045209f-e054-4c2f-a058-7cc4476e062b/modular-plastic-belting-40_21.jpg",
  "Side-Flexing Belts":     CDN+"c2fa89b2-fb58-480b-92e2-af0c0ec2f66a/5010999_S2300-Dual-Turn-box-line_40-21_2400px.jpg",
};
const CAT_ICONS = { "Straight-Running Belts":"➡️","Radius Belts":"↩️","Spiral Belts":"🌀","Side-Flexing Belts":"↪️" };
const VENDOR_COLORS = {
  Intralox:  { bg:"#fee2e2", text:"#991b1b" },
  Movex:     { bg:"#fef3c7", text:"#92400e" },
  Rollepaal: { bg:"#f0fdf4", text:"#166534" },
};

// ── REAL Intralox logo (PIL-generated PNG) ──────────────────────
const INTRALOX_LOGO_URL = "https://base44.app/api/apps/69dd9ffccab4dd693d4d92f5/files/mp/public/69dd9ffccab4dd693d4d92f5/98bb2882b_intralox_logo.png";

function IntraloxLogo({ height = 22, white: whiteMode }) {
  // SVG wordmark fallback (used in dark backgrounds)
  if (whiteMode) return (
    <svg height={height} viewBox="0 0 340 68" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display:"block" }}>
      <text x="0"   y="54" fontFamily="'Arial Black',Arial,sans-serif" fontWeight="900" fontSize="56" fill="#ffffff" letterSpacing="-1">INTRA</text>
      <text x="195" y="54" fontFamily="'Arial Black',Arial,sans-serif" fontWeight="900" fontSize="56" fill="#ff4d6d" letterSpacing="-1">LOX</text>
    </svg>
  );
  // On light backgrounds use the real PNG
  return <img src={INTRALOX_LOGO_URL} alt="Intralox" style={{ height, display:"block", objectFit:"contain" }} />;
}

function VendorLogo({ vendor, height=20, white: whiteMode }) {
  if (vendor === "Intralox") return <IntraloxLogo height={height} white={whiteMode} />;
  const vc = VENDOR_COLORS[vendor] || { bg:"#f3f4f6", text:"#374151" };
  return <span style={{ padding:"3px 8px", background:whiteMode?"rgba(255,255,255,0.15)":vc.bg, color:whiteMode?"#fff":vc.text, fontWeight:800, fontSize:height*0.55, borderRadius:5 }}>{vendor}</span>;
}

function UniKingLogo({ size=28 }) {
  return (
    <div style={{ display:"flex", alignItems:"center", lineHeight:1 }}>
      <span style={{ fontSize:size, fontWeight:900, color:SILVER, letterSpacing:-1, fontFamily:"'Arial Black',Arial,sans-serif" }}>UNI</span>
      <span style={{ fontSize:size, fontWeight:900, color:"#fff",  letterSpacing:-1, fontFamily:"'Arial Black',Arial,sans-serif" }}>KING</span>
    </div>
  );
}

function Badge({ label, color="#e5e7eb", textColor="#374151", small }) {
  return (
    <span style={{ display:"inline-block", padding:small?"1px 6px":"2px 9px", borderRadius:99,
      background:color, color:textColor, fontSize:small?10:11, fontWeight:600, letterSpacing:0.3, whiteSpace:"nowrap" }}>
      {label}
    </span>
  );
}

function ProductImage({ src, alt, style={} }) {
  const [err, setErr] = useState(false);
  if (!src || err) return (
    <div style={{ ...style, background:"#f1f5f9", display:"flex", flexDirection:"column",
      alignItems:"center", justifyContent:"center", gap:6, color:"#94a3b8" }}>
      <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
        <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
        <path d="M21 15l-5-5L5 21"/>
      </svg>
      <span style={{ fontSize:10 }}>No Image</span>
    </div>
  );
  return <img src={src} alt={alt} onError={()=>setErr(true)} style={{ ...style, objectFit:"cover" }} />;
}

function parseBeltData(raw) {
  if (!raw) return [];
  try { return JSON.parse(raw); } catch { return []; }
}

// ── Belt Data Table — exact replica of the Intralox catalog table ─
function BeltDataTable({ beltData }) {
  if (!beltData || beltData.length === 0) return (
    <div style={{ padding:"24px 0", textAlign:"center", color:"#9ca3af", fontSize:13 }}>
      Belt data not yet available for this product.
    </div>
  );

  const footnotes = beltData.filter(r => r.footnote).map(r => r.footnote);
  const headerStyle = {
    background: "#2d3748", color:"#fff", fontSize:11, fontWeight:700,
    padding:"7px 10px", textAlign:"center", borderRight:"1px solid rgba(255,255,255,0.12)",
    whiteSpace:"nowrap", letterSpacing:0.2,
  };
  const subheaderStyle = { ...headerStyle, background:"#374151", fontSize:9.5, fontWeight:500, color:"rgba(255,255,255,0.8)" };
  const td = { padding:"7px 10px", fontSize:12, textAlign:"center", borderRight:"1px solid #e5e7eb", borderBottom:"1px solid #f1f5f9" };
  const tdL = { ...td, textAlign:"left", fontWeight:600, color:"#1a1a2e" };

  return (
    <div>
      <div style={{ fontSize:11, fontWeight:800, color:NAVY, textTransform:"uppercase", letterSpacing:1, marginBottom:10 }}>
        Belt Data
      </div>
      <div style={{ overflowX:"auto", borderRadius:8, border:"1.5px solid #d1d5db", boxShadow:"0 1px 4px rgba(0,0,0,0.06)" }}>
        <table style={{ width:"100%", borderCollapse:"collapse", minWidth:480 }}>
          <thead>
            <tr>
              <th rowSpan={2} style={{ ...headerStyle, textAlign:"left", verticalAlign:"bottom", minWidth:110 }}>Belt Material</th>
              <th rowSpan={2} style={{ ...headerStyle, verticalAlign:"bottom", minWidth:110, lineHeight:1.3 }}>Default Rod<br/>Material, Diameter<br/><span style={{ fontWeight:400, fontSize:9, opacity:0.75 }}>0.18 in (4.6 mm)</span></th>
              <th colSpan={2} style={{ ...headerStyle, borderBottom:"1px solid rgba(255,255,255,0.2)" }}>Belt Strength</th>
              <th colSpan={2} style={{ ...headerStyle, borderBottom:"1px solid rgba(255,255,255,0.2)" }}>Temperature Range<br/><span style={{ fontWeight:400, fontSize:9, opacity:0.75 }}>(continuous)</span></th>
              <th colSpan={2} style={{ ...headerStyle, borderRight:"none", borderBottom:"1px solid rgba(255,255,255,0.2)" }}>Belt Mass</th>
            </tr>
            <tr>
              <th style={subheaderStyle}>lbf/ft</th>
              <th style={subheaderStyle}>N/m</th>
              <th style={subheaderStyle}>°F</th>
              <th style={subheaderStyle}>°C</th>
              <th style={subheaderStyle}>lb/ft²</th>
              <th style={{ ...subheaderStyle, borderRight:"none" }}>kg/m²</th>
            </tr>
          </thead>
          <tbody>
            {beltData.map((row, i) => {
              const info = getMI(row.material || "");
              const hasFootnote = !!row.footnote;
              return (
                <tr key={i} style={{ background: i%2===0 ? "#fff" : "#f9fafb" }}>
                  <td style={{ ...tdL, display:"flex", alignItems:"center", gap:7 }}>
                    <span style={{ display:"inline-flex", alignItems:"center", justifyContent:"center",
                      width:22, height:22, borderRadius:4, background:info.text, color:"#fff",
                      fontSize:8, fontWeight:800, flexShrink:0 }}>{info.abbr}</span>
                    <span>{row.material}{hasFootnote ? <sup style={{ color:"#6b7280", fontSize:9 }}>a</sup> : ""}</span>
                  </td>
                  <td style={td}>{row.rod_material || "—"}</td>
                  <td style={{ ...td, fontWeight:700, color:NAVY }}>{row.strength_lbf != null ? Number(row.strength_lbf).toLocaleString() : "—"}</td>
                  <td style={td}>{row.strength_nm != null ? Number(row.strength_nm).toLocaleString() : "—"}</td>
                  <td style={td}>{row.temp_min_f != null ? `${row.temp_min_f} to ${row.temp_max_f}` : "—"}</td>
                  <td style={{ ...td, fontWeight:600 }}>{row.temp_min_c != null ? `${row.temp_min_c} to ${row.temp_max_c}` : "—"}</td>
                  <td style={td}>{row.mass_lbft2 != null ? row.mass_lbft2 : "—"}</td>
                  <td style={{ ...td, borderRight:"none" }}>{row.mass_kgm2 != null ? row.mass_kgm2 : "—"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {footnotes.map((fn, i) => (
        <div key={i} style={{ marginTop:7, fontSize:10, color:"#6b7280", fontStyle:"italic", lineHeight:1.5 }}>
          <sup>a</sup> {fn}
        </div>
      ))}
    </div>
  );
}

// ── Related Products chips ──────────────────────────────────────
function RelatedProducts({ relatedStr, allProducts, onSelectProduct }) {
  if (!relatedStr || !relatedStr.trim()) return null;
  const tags = relatedStr.split(",").map(s => s.trim()).filter(Boolean);

  return (
    <div style={{ marginTop:14 }}>
      <div style={{ fontSize:11, fontWeight:700, color:NAVY, textTransform:"uppercase", letterSpacing:0.5, marginBottom:8 }}>
        🔗 Related / Compatible Products
      </div>
      <div style={{ display:"flex", gap:7, flexWrap:"wrap" }}>
        {tags.map(tag => {
          // Try to find a matching product
          const match = allProducts.find(p =>
            p.series?.toLowerCase().includes(tag.toLowerCase()) ||
            p.series?.replace(/series\s*/i,"").trim() === tag.replace(/^S/i,"") ||
            tag.toLowerCase() === `s${p.series_number}` ||
            tag === `S${p.series_number}`
          );
          return (
            <button key={tag}
              onClick={() => match && onSelectProduct(match)}
              style={{
                padding:"5px 12px", borderRadius:7,
                background: match ? "#eff6ff" : "#f3f4f6",
                border: match ? "1.5px solid #bfdbfe" : "1.5px solid #e5e7eb",
                color: match ? NAVY : "#9ca3af",
                fontSize:12, fontWeight:700, cursor: match ? "pointer" : "default",
                display:"flex", alignItems:"center", gap:5,
                transition:"all 0.15s",
              }}
              onMouseEnter={e => { if (match) { e.currentTarget.style.background="#dbeafe"; e.currentTarget.style.borderColor="#93c5fd"; }}}
              onMouseLeave={e => { if (match) { e.currentTarget.style.background="#eff6ff"; e.currentTarget.style.borderColor="#bfdbfe"; }}}
            >
              {tag}
              {match && <span style={{ fontSize:10, color:"#6b7280" }}>→</span>}
            </button>
          );
        })}
      </div>
      {tags.some(tag => !allProducts.find(p =>
        p.series?.toLowerCase().includes(tag.toLowerCase()) ||
        tag.toLowerCase() === `s${p.series_number}` ||
        tag === `S${p.series_number}`
      )) && (
        <div style={{ fontSize:10, color:"#9ca3af", marginTop:6, fontStyle:"italic" }}>
          Some related products are not yet in the catalog. Contact Uniking for more info.
        </div>
      )}
    </div>
  );
}

// ── Materials tab: material chips + belt data table ─────────────
function MaterialsTab({ materials, beltData, relatedStr, allProducts, onSelectProduct }) {
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:18 }}>
      {/* Material chips */}
      {materials.length > 0 && (
        <div>
          <div style={{ fontSize:11, fontWeight:700, color:NAVY, textTransform:"uppercase", letterSpacing:0.5, marginBottom:8 }}>
            Available Materials
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
            {materials.map((mat, i) => {
              const info = getMI(mat);
              return (
                <div key={mat} style={{ display:"flex", alignItems:"center", gap:10, padding:"8px 12px",
                  borderRadius:8, background:info.color, border:`1px solid ${info.text}22` }}>
                  <div style={{ minWidth:30, height:30, borderRadius:5, background:info.text, color:"#fff",
                    display:"flex", alignItems:"center", justifyContent:"center",
                    fontSize:9, fontWeight:800, flexShrink:0 }}>{info.abbr}</div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:12, fontWeight:700, color:info.text }}>{mat}</div>
                    <div style={{ fontSize:11, color:info.text+"99", marginTop:1 }}>{info.note}</div>
                  </div>
                  <div style={{ fontSize:10, color:info.text+"66", padding:"2px 6px",
                    background:info.text+"11", borderRadius:4, whiteSpace:"nowrap" }}>Option {i+1}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Belt data chart */}
      <BeltDataTable beltData={beltData} />

      {/* Related products */}
      <RelatedProducts relatedStr={relatedStr} allProducts={allProducts} onSelectProduct={onSelectProduct} />
    </div>
  );
}

// ── Compare Sheet ───────────────────────────────────────────────
function CompareSheet({ products, onClose, onRemove }) {
  if (!products || products.length === 0) return null;
  const allMaterials = [...new Set(products.flatMap(p =>
    p.materials ? p.materials.split(",").map(m=>m.trim()) : []
  ))];

  const th = { padding:"10px 14px", fontSize:11, fontWeight:700, textAlign:"center",
    borderRight:"1px solid #e5e7eb", minWidth:150, verticalAlign:"top" };
  const tdBase = { padding:"9px 12px", fontSize:12, textAlign:"center",
    borderRight:"1px solid #f1f5f9", borderBottom:"1px solid #f1f5f9", color:"#374151" };
  const rowLabel = { padding:"9px 12px", fontSize:11, fontWeight:700, color:NAVY,
    background:"#f8fafc", borderRight:"2px solid #e5e7eb", borderBottom:"1px solid #f1f5f9", whiteSpace:"nowrap" };
  const sectionHeader = { padding:"7px 12px", fontSize:10, fontWeight:800, color:NAVY,
    background:"#eff6ff", letterSpacing:1, textTransform:"uppercase" };

  const specRows = [
    ["Category",    p => p.category || "—"],
    ["Belt Style",  p => p.style || "—"],
    ["Pitch",       p => p.pitch_in ? `${p.pitch_in}" / ${p.pitch_mm}mm` : "—"],
    ["Min Width",   p => p.min_width_in ? `${p.min_width_in}"` : "—"],
    ["Open Area",   p => p.open_area || "—"],
    ["Hinge Style", p => p.hinge_style || "—"],
  ];

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.65)", zIndex:3000,
      display:"flex", alignItems:"center", justifyContent:"center", padding:16 }} onClick={onClose}>
      <div style={{ background:"#fff", borderRadius:14, width:"100%",
        maxWidth:Math.min(240*products.length+200,1080), maxHeight:"94vh",
        overflowY:"auto", display:"flex", flexDirection:"column" }}
        onClick={e=>e.stopPropagation()}>

        {/* Header */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between",
          padding:"16px 22px", background:NAVY, borderRadius:"14px 14px 0 0" }}>
          <div style={{ color:"#fff", fontSize:15, fontWeight:800 }}>⚖️ Product Comparison</div>
          <div style={{ display:"flex", gap:8 }}>
            <button onClick={()=>window.print()}
              style={{ padding:"7px 14px", background:"rgba(255,255,255,0.15)", color:"#fff",
                border:"1px solid rgba(255,255,255,0.3)", borderRadius:7, fontSize:12, fontWeight:600, cursor:"pointer" }}>
              🖨️ Print
            </button>
            <button onClick={onClose}
              style={{ padding:"7px 12px", background:"rgba(255,255,255,0.1)", border:"1px solid rgba(255,255,255,0.2)",
                borderRadius:7, fontSize:13, cursor:"pointer", color:"#fff" }}>✕</button>
          </div>
        </div>

        <div style={{ overflowX:"auto", flex:1 }}>
          <table style={{ width:"100%", borderCollapse:"collapse" }}>
            <thead>
              <tr style={{ background:"#f8fafc" }}>
                <th style={{ ...th, textAlign:"left", background:"#f1f5f9", width:130 }}>
                  <span style={{ fontSize:10, color:"#9ca3af", textTransform:"uppercase" }}>Spec</span>
                </th>
                {products.map(p => (
                  <th key={p.id} style={{ ...th, background:"#fff", position:"relative" }}>
                    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:6 }}>
                      <div style={{ background:"#f8fafc", borderRadius:6, padding:"4px 8px" }}>
                        <VendorLogo vendor={p.vendor} height={18} />
                      </div>
                      <div style={{ fontSize:13, fontWeight:800, color:NAVY }}>{p.series}</div>
                      <div style={{ fontSize:11, color:"#6b7280" }}>{p.style}</div>
                      <button onClick={()=>onRemove(p.id)}
                        style={{ position:"absolute", top:6, right:6, background:"#fee2e2", border:"none",
                          borderRadius:4, padding:"2px 6px", fontSize:10, color:"#dc2626", cursor:"pointer", fontWeight:700 }}>✕</button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* Specs */}
              <tr><td colSpan={products.length+1} style={sectionHeader}>Physical Specs</td></tr>
              {specRows.map(([label, getter]) => (
                <tr key={label}>
                  <td style={rowLabel}>{label}</td>
                  {products.map(p => <td key={p.id} style={tdBase}>{getter(p)}</td>)}
                </tr>
              ))}

              {/* Materials */}
              <tr><td colSpan={products.length+1} style={sectionHeader}>Available Materials</td></tr>
              {allMaterials.map(mat => {
                const info = getMI(mat);
                return (
                  <tr key={mat}>
                    <td style={{ ...rowLabel }}>
                      <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                        <span style={{ display:"inline-flex", alignItems:"center", justifyContent:"center",
                          width:20, height:20, borderRadius:3, background:info.text, color:"#fff",
                          fontSize:8, fontWeight:800 }}>{info.abbr}</span>
                        {mat}
                      </div>
                    </td>
                    {products.map(p => {
                      const mats = p.materials ? p.materials.split(",").map(m=>m.trim()) : [];
                      const has = mats.some(m => m.toLowerCase() === mat.toLowerCase());
                      return (
                        <td key={p.id} style={{ ...tdBase, textAlign:"center" }}>
                          {has ? <span style={{ fontSize:16, color:"#16a34a" }}>✓</span>
                               : <span style={{ fontSize:14, color:"#d1d5db" }}>—</span>}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}

              {/* Belt strength if any has belt_data */}
              {products.some(p => parseBeltData(p.belt_data).length > 0) && (() => {
                const allBeltMats = [...new Set(products.flatMap(p => parseBeltData(p.belt_data).map(r=>r.material)))];
                return (
                  <>
                    <tr><td colSpan={products.length+1} style={sectionHeader}>Belt Strength (lbf/ft)</td></tr>
                    {allBeltMats.map(mat => (
                      <tr key={mat}>
                        <td style={rowLabel}>{mat}</td>
                        {products.map(p => {
                          const row = parseBeltData(p.belt_data).find(r=>r.material===mat);
                          return <td key={p.id} style={tdBase}>{row ? `${Number(row.strength_lbf).toLocaleString()} lbf/ft` : "—"}</td>;
                        })}
                      </tr>
                    ))}
                    <tr><td colSpan={products.length+1} style={sectionHeader}>Temp Range (°C continuous)</td></tr>
                    {allBeltMats.map(mat => (
                      <tr key={mat}>
                        <td style={rowLabel}>{mat}</td>
                        {products.map(p => {
                          const row = parseBeltData(p.belt_data).find(r=>r.material===mat);
                          return <td key={p.id} style={tdBase}>{row && row.temp_min_c!=null ? `${row.temp_min_c} to ${row.temp_max_c}°C` : "—"}</td>;
                        })}
                      </tr>
                    ))}
                  </>
                );
              })()}

              {/* Resources */}
              <tr><td colSpan={products.length+1} style={sectionHeader}>Resources</td></tr>
              <tr>
                <td style={rowLabel}>Tech Doc</td>
                {products.map(p => (
                  <td key={p.id} style={{ ...tdBase, textAlign:"center" }}>
                    {p.tech_doc_url ? <a href={p.tech_doc_url} target="_blank" rel="noreferrer" style={{ color:"#1d4ed8", fontWeight:700 }}>📄 View</a> : <span style={{ color:"#d1d5db" }}>—</span>}
                  </td>
                ))}
              </tr>
              <tr>
                <td style={rowLabel}>CAD</td>
                {products.map(p => (
                  <td key={p.id} style={{ ...tdBase, textAlign:"center" }}>
                    {p.cad_url ? <a href={p.cad_url} target="_blank" rel="noreferrer" style={{ color:"#166534", fontWeight:700 }}>📐 View</a> : <span style={{ color:"#d1d5db" }}>—</span>}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>

        <div style={{ padding:"10px 22px", borderTop:"1px solid #e5e7eb", fontSize:10,
          color:"#9ca3af", textAlign:"center", fontStyle:"italic" }}>
          Uniking Canada · Internal Use Only · No Pricing · {new Date().toLocaleDateString("en-CA")}
        </div>
      </div>
    </div>
  );
}

// ── Floating Compare Tray ───────────────────────────────────────
function CompareTray({ compareList, products, onRemove, onClear, onOpenCompare }) {
  if (compareList.length === 0) return null;
  const items = products.filter(p => compareList.includes(p.id));
  return (
    <div style={{ position:"fixed", bottom:0, left:0, right:0, zIndex:900,
      background:"#fff", borderTop:"2px solid #3b82f6",
      boxShadow:"0 -4px 20px rgba(0,0,0,0.15)", padding:"12px 24px" }}>
      <div style={{ maxWidth:1140, margin:"0 auto", display:"flex", alignItems:"center", gap:12, flexWrap:"wrap" }}>
        <div style={{ fontSize:12, fontWeight:700, color:NAVY, whiteSpace:"nowrap" }}>
          ⚖️ Compare ({compareList.length}/4)
        </div>
        <div style={{ display:"flex", gap:8, flex:1, flexWrap:"wrap" }}>
          {items.map(p => (
            <div key={p.id} style={{ display:"flex", alignItems:"center", gap:6, padding:"5px 10px",
              background:"#eff6ff", border:"1px solid #bfdbfe", borderRadius:7, fontSize:11 }}>
              <span style={{ fontWeight:700, color:NAVY }}>{p.series}</span>
              <span style={{ color:"#6b7280" }}>{p.style}</span>
              <button onClick={()=>onRemove(p.id)}
                style={{ background:"none", border:"none", cursor:"pointer", color:"#9ca3af",
                  fontSize:13, lineHeight:1, padding:0, marginLeft:2 }}>✕</button>
            </div>
          ))}
        </div>
        <div style={{ display:"flex", gap:8, alignItems:"center" }}>
          {compareList.length < 2 && <span style={{ fontSize:11, color:"#9ca3af", fontStyle:"italic" }}>Select 2+ to compare</span>}
          <button onClick={onClear}
            style={{ padding:"7px 12px", background:"#f3f4f6", border:"1px solid #e5e7eb",
              borderRadius:7, fontSize:12, color:"#6b7280", cursor:"pointer", fontWeight:600 }}>Clear</button>
          <button onClick={onOpenCompare} disabled={compareList.length < 2}
            style={{ padding:"7px 18px",
              background: compareList.length < 2 ? "#9ca3af" : NAVY,
              border:"none", borderRadius:7, fontSize:12, color:"#fff", fontWeight:700,
              cursor: compareList.length < 2 ? "not-allowed" : "pointer" }}>
            Compare Now →
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Tear Sheet ──────────────────────────────────────────────────
function TearSheet({ product, onClose }) {
  const printRef = useRef();
  const handlePrint = () => {
    const content = printRef.current.innerHTML;
    const win = window.open("","_blank","width=900,height=700");
    win.document.write(`<!DOCTYPE html><html><head><title>Uniking — ${product.series} ${product.style}</title>
<style>*{margin:0;padding:0;box-sizing:border-box;}body{font-family:Arial,sans-serif;}
table{border-collapse:collapse;width:100%;}
@media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact;}}</style>
</head><body>${content}</body></html>`);
    win.document.close(); win.focus(); setTimeout(()=>win.print(),500);
  };
  if (!product) return null;
  const materials = product.materials ? product.materials.split(",").map(m=>m.trim()) : [];
  const beltData = parseBeltData(product.belt_data);
  const catImg = product.image_url || CAT_IMGS[product.category];

  const specsTable = [
    ["Pitch",           product.pitch_in ? `${product.pitch_in} in / ${product.pitch_mm} mm` : "—"],
    ["Minimum Width",   product.min_width_in ? `${product.min_width_in}"` : "—"],
    ["Open Area",       product.open_area || "—"],
    ["Hinge Style",     product.hinge_style || "—"],
    ["Belt Style",      product.style || "—"],
  ];

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.6)", zIndex:2000,
      display:"flex", alignItems:"center", justifyContent:"center", padding:20 }} onClick={onClose}>
      <div style={{ background:"#fff", borderRadius:12, width:"100%", maxWidth:720, maxHeight:"93vh", overflowY:"auto" }}
        onClick={e=>e.stopPropagation()}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between",
          padding:"14px 20px", borderBottom:"1px solid #e5e7eb" }}>
          <div style={{ fontSize:13, fontWeight:700, color:NAVY }}>📄 Product Tear Sheet</div>
          <div style={{ display:"flex", gap:8 }}>
            <button onClick={handlePrint} style={{ padding:"7px 16px", background:NAVY, color:"#fff",
              border:"none", borderRadius:7, fontSize:12, fontWeight:700, cursor:"pointer" }}>🖨️ Print / PDF</button>
            <button onClick={onClose} style={{ padding:"7px 12px", background:"#f3f4f6",
              border:"none", borderRadius:7, fontSize:13, cursor:"pointer", color:"#6b7280" }}>✕</button>
          </div>
        </div>

        <div ref={printRef} style={{ fontFamily:"Arial,sans-serif" }}>
          {/* Nav bar */}
          <div style={{ background:NAVY, padding:"18px 26px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
            <div>
              <div style={{ display:"flex", alignItems:"baseline" }}>
                <span style={{ fontSize:24,fontWeight:900,color:"#b0bec5",letterSpacing:-1,fontFamily:"'Arial Black',Arial,sans-serif" }}>UNI</span>
                <span style={{ fontSize:24,fontWeight:900,color:"#fff",letterSpacing:-1,fontFamily:"'Arial Black',Arial,sans-serif" }}>KING</span>
              </div>
              <div style={{ fontSize:8,color:"rgba(255,255,255,0.4)",letterSpacing:2,textTransform:"uppercase",marginTop:2 }}>UNITING THE STRONGEST LINKS</div>
            </div>
            <div style={{ textAlign:"right" }}>
              <div style={{ fontSize:10,color:"rgba(255,255,255,0.5)",textTransform:"uppercase",letterSpacing:1 }}>Product Data Sheet</div>
              <div style={{ fontSize:9,color:"rgba(255,255,255,0.3)",marginTop:2 }}>Internal Use Only · No Pricing</div>
            </div>
          </div>

          {/* Hero: image + specs side by side */}
          <div style={{ display:"flex", gap:0 }}>
            {/* Left: product image */}
            <div style={{ width:220, flexShrink:0, overflow:"hidden", background:"#f1f5f9" }}>
              <ProductImage src={catImg} alt={product.series} style={{ width:"100%", height:"100%", minHeight:200 }} />
            </div>
            {/* Right: specs */}
            <div style={{ flex:1, padding:"18px 22px" }}>
              <div style={{ marginBottom:8 }}>
                <IntraloxLogo height={20} />
              </div>
              <div style={{ fontSize:22, fontWeight:800, color:NAVY, lineHeight:1.1 }}>{product.series}</div>
              <div style={{ fontSize:14, color:"#6b7280", marginTop:3, marginBottom:12 }}>{product.style}</div>
              <table style={{ width:"100%", borderCollapse:"collapse", fontSize:12 }}>
                <tbody>
                  {specsTable.map(([l,v]) => (
                    <tr key={l} style={{ borderBottom:"1px solid #f1f5f9" }}>
                      <td style={{ padding:"5px 0", color:"#6b7280", fontWeight:600, width:"45%" }}>{l}</td>
                      <td style={{ padding:"5px 0", color:NAVY, fontWeight:700 }}>{v}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Notes */}
          {product.notes && (
            <div style={{ padding:"14px 22px 0" }}>
              <div style={{ fontSize:11,fontWeight:700,color:NAVY,textTransform:"uppercase",letterSpacing:1,marginBottom:8,paddingBottom:4,borderBottom:`2px solid ${NAVY}` }}>Product Notes</div>
              <div style={{ fontSize:12, color:"#374151", lineHeight:1.65 }}>{product.notes}</div>
            </div>
          )}

          {/* Materials */}
          {materials.length > 0 && (
            <div style={{ padding:"14px 22px 0" }}>
              <div style={{ fontSize:11,fontWeight:700,color:NAVY,textTransform:"uppercase",letterSpacing:1,marginBottom:8,paddingBottom:4,borderBottom:`2px solid ${NAVY}` }}>Available Materials</div>
              <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                {materials.map(m => {
                  const info = getMI(m);
                  return <span key={m} style={{ padding:"4px 10px", borderRadius:99, background:info.color, color:info.text, fontSize:11, fontWeight:700, border:`1px solid ${info.text}22` }}>{m}</span>;
                })}
              </div>
            </div>
          )}

          {/* Belt Data */}
          {beltData.length > 0 && (
            <div style={{ padding:"14px 22px 0" }}>
              <div style={{ fontSize:11,fontWeight:700,color:NAVY,textTransform:"uppercase",letterSpacing:1,marginBottom:8,paddingBottom:4,borderBottom:`2px solid ${NAVY}` }}>Belt Data</div>
              <BeltDataTable beltData={beltData} />
            </div>
          )}

          {/* Footer */}
          <div style={{ background:"#f8fafc",borderTop:"2px solid #e2e8f0",padding:"10px 22px",marginTop:16,
            display:"flex",justifyContent:"space-between",alignItems:"center" }}>
            <div style={{ fontSize:10,color:"#94a3b8" }}>Uniking Canada · 12985 Rue Brault, Mirabel, QC J7J 0W2 · logistics@unikingcanada.com</div>
            <div style={{ fontSize:10,color:"#94a3b8" }}>{new Date().toLocaleDateString("en-CA")}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Product Detail Modal ────────────────────────────────────────
function ProductModal({ product, allProducts, onClose, onTearSheet, inCompare, onToggleCompare, onSelectProduct }) {
  const [tab, setTab] = useState("specs");
  if (!product) return null;
  const imgSrc = product.image_url || CAT_IMGS[product.category];
  const materials = product.materials ? product.materials.split(",").map(m=>m.trim()) : [];
  const beltData  = parseBeltData(product.belt_data);
  const hasData   = beltData.length > 0;

  return (
    <div style={{ position:"fixed",inset:0,background:"rgba(0,0,0,0.55)",zIndex:1000,
      display:"flex",alignItems:"center",justifyContent:"center",padding:16 }} onClick={onClose}>
      <div style={{ background:"#fff",borderRadius:16,width:"100%",maxWidth:660,maxHeight:"94vh",
        overflowY:"auto",display:"flex",flexDirection:"column" }} onClick={e=>e.stopPropagation()}>

        {/* Hero image */}
        <div style={{ height:210,position:"relative",borderRadius:"16px 16px 0 0",overflow:"hidden",flexShrink:0 }}>
          <ProductImage src={imgSrc} alt={product.series} style={{ width:"100%",height:"100%" }} />
          <div style={{ position:"absolute",inset:0,background:"linear-gradient(to top,rgba(10,20,40,0.93) 0%,rgba(10,20,40,0.0) 60%)" }} />

          {/* Close */}
          <button onClick={onClose} style={{ position:"absolute",top:12,right:12,background:"rgba(0,0,0,0.4)",
            border:"none",borderRadius:"50%",width:32,height:32,cursor:"pointer",color:"#fff",
            fontSize:15,display:"flex",alignItems:"center",justifyContent:"center" }}>✕</button>

          {/* Vendor logo chip */}
          <div style={{ position:"absolute",top:13,left:15,background:"rgba(255,255,255,0.96)",borderRadius:8,padding:"5px 10px" }}>
            <VendorLogo vendor={product.vendor} height={20} />
          </div>

          {/* Compare toggle */}
          <button onClick={onToggleCompare}
            style={{ position:"absolute",top:13,right:52,padding:"5px 12px",
              background:inCompare?"#3b82f6":"rgba(255,255,255,0.88)",
              color:inCompare?"#fff":NAVY,
              border:"none",borderRadius:7,fontSize:11,fontWeight:700,cursor:"pointer" }}>
            {inCompare ? "✓ In Compare" : "+ Compare"}
          </button>

          {/* Title */}
          <div style={{ position:"absolute",bottom:14,left:18,right:18 }}>
            <div style={{ fontSize:22,fontWeight:800,color:"#fff",lineHeight:1.1 }}>{product.series}</div>
            <div style={{ fontSize:13,color:"rgba(255,255,255,0.82)",marginTop:3 }}>{product.style}</div>
          </div>
        </div>

        {/* Quick badges */}
        <div style={{ display:"flex",gap:6,flexWrap:"wrap",padding:"12px 18px 0" }}>
          {product.category && <Badge label={`${CAT_ICONS[product.category]||""} ${product.category}`.trim()} color="#f5f3ff" textColor="#6d28d9" />}
          {product.pitch_in && <Badge label={`${product.pitch_in}" pitch`} color="#f0fdf4" textColor="#166534" />}
          {product.open_area && product.open_area!=="0%" && <Badge label={`${product.open_area} open`} color="#fef9c3" textColor="#854d0e" />}
          {product.hinge_style && <Badge label={`${product.hinge_style} hinge`} color="#f3f4f6" textColor="#4b5563" />}
        </div>

        {/* Notes */}
        {product.notes && (
          <div style={{ margin:"10px 18px 0",fontSize:13,color:"#374151",lineHeight:1.65,
            padding:"10px 12px",background:"#f8fafc",borderRadius:8,borderLeft:`3px solid ${NAVY}` }}>
            {product.notes}
          </div>
        )}

        {/* Tabs */}
        <div style={{ display:"flex",borderBottom:"2px solid #f3f4f6",margin:"12px 18px 0",gap:0 }}>
          {[
            ["specs",     "📐 Specs"],
            ["materials", `🧪 Materials${hasData ? " + Data" : ""}`],
            ["resources", "📁 Resources"],
          ].map(([id,label]) => (
            <button key={id} onClick={()=>setTab(id)}
              style={{ padding:"9px 14px",border:"none",background:"none",cursor:"pointer",
                fontSize:12,fontWeight:700,
                color:tab===id?NAVY:"#9ca3af",
                borderBottom:tab===id?`2px solid ${NAVY}`:"2px solid transparent",
                marginBottom:-2 }}>{label}</button>
          ))}
        </div>

        {/* Tab body */}
        <div style={{ padding:"14px 18px",flex:1 }}>
          {tab==="specs" && (
            <div style={{ display:"flex",flexDirection:"column",gap:10 }}>
              <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:8 }}>
                {[
                  ["Series",      product.series],
                  ["Belt Style",  product.style],
                  ["Pitch (in)",  product.pitch_in  ? `${product.pitch_in}"` : "—"],
                  ["Pitch (mm)",  product.pitch_mm  ? `${product.pitch_mm}mm` : "—"],
                  ["Open Area",   product.open_area  || "—"],
                  ["Hinge Style", product.hinge_style || "—"],
                  ["Min Width",   product.min_width_in ? `${product.min_width_in}"` : "—"],
                  ["Category",    product.category   || "—"],
                ].map(([l,v]) => (
                  <div key={l} style={{ padding:"10px 12px",background:"#f8fafc",borderRadius:8,border:"1px solid #f1f5f9" }}>
                    <div style={{ fontSize:10,fontWeight:700,color:"#9ca3af",textTransform:"uppercase",letterSpacing:0.5,marginBottom:3 }}>{l}</div>
                    <div style={{ fontSize:14,color:NAVY,fontWeight:700 }}>{v}</div>
                  </div>
                ))}
              </div>
              {product.page_range && (
                <div style={{ display:"flex",alignItems:"center",gap:8,padding:"8px 12px",background:"#f0fdf4",borderRadius:8 }}>
                  <span style={{ fontSize:11,color:"#166534",fontWeight:600 }}>📄 Catalog Pages:</span>
                  <span style={{ fontSize:13,color:"#166534",fontWeight:800 }}>pp. {product.page_range}</span>
                </div>
              )}
            </div>
          )}

          {tab==="materials" && (
            <MaterialsTab
              materials={materials}
              beltData={beltData}
              relatedStr={product.related_products}
              allProducts={allProducts}
              onSelectProduct={(p) => { onClose(); setTimeout(()=>onSelectProduct(p), 100); }}
            />
          )}

          {tab==="resources" && (
            <div style={{ display:"flex",flexDirection:"column",gap:10 }}>
              {product.tech_doc_url
                ? <a href={product.tech_doc_url} target="_blank" rel="noreferrer"
                    style={{ display:"flex",alignItems:"center",gap:14,padding:"14px 16px",background:NAVY,color:"#fff",borderRadius:10,textDecoration:"none" }}>
                    <span style={{ fontSize:22 }}>📄</span>
                    <div><div style={{ fontSize:13,fontWeight:700 }}>Technical Document</div><div style={{ fontSize:11,color:"rgba(255,255,255,0.6)",marginTop:2 }}>Engineering specs, dimensions, installation guidance</div></div>
                    <span style={{ marginLeft:"auto",fontSize:12,opacity:0.7 }}>↗</span>
                  </a>
                : <div style={{ display:"flex",alignItems:"center",gap:14,padding:"14px 16px",background:"#f3f4f6",borderRadius:10 }}>
                    <span style={{ fontSize:22,opacity:0.4 }}>📄</span>
                    <div><div style={{ fontSize:13,fontWeight:700,color:"#9ca3af" }}>Technical Document</div><div style={{ fontSize:11,color:"#9ca3af",marginTop:2 }}>Coming soon</div></div>
                  </div>
              }
              {product.cad_url
                ? <a href={product.cad_url} target="_blank" rel="noreferrer"
                    style={{ display:"flex",alignItems:"center",gap:14,padding:"14px 16px",background:"#166534",color:"#fff",borderRadius:10,textDecoration:"none" }}>
                    <span style={{ fontSize:22 }}>📐</span>
                    <div><div style={{ fontSize:13,fontWeight:700 }}>CAD Drawing</div><div style={{ fontSize:11,color:"rgba(255,255,255,0.6)",marginTop:2 }}>2D/3D files for engineering and design</div></div>
                    <span style={{ marginLeft:"auto",fontSize:12,opacity:0.7 }}>↗</span>
                  </a>
                : <div style={{ display:"flex",alignItems:"center",gap:14,padding:"14px 16px",background:"#f3f4f6",borderRadius:10 }}>
                    <span style={{ fontSize:22,opacity:0.4 }}>📐</span>
                    <div><div style={{ fontSize:13,fontWeight:700,color:"#9ca3af" }}>CAD Drawing</div><div style={{ fontSize:11,color:"#9ca3af",marginTop:2 }}>Coming soon</div></div>
                  </div>
              }
              {product.vendor==="Intralox" && (
                <a href="https://www.intralox.com/belt-finder" target="_blank" rel="noreferrer"
                  style={{ display:"flex",alignItems:"center",gap:14,padding:"14px 16px",background:"#fff1f2",borderRadius:10,textDecoration:"none",border:"1px solid #fecdd3" }}>
                  <span style={{ fontSize:22 }}>🔍</span>
                  <div><div style={{ fontSize:13,fontWeight:700,color:"#991b1b" }}>Intralox Belt Finder</div><div style={{ fontSize:11,color:"#991b1b77",marginTop:2 }}>Official Intralox portal — full specs</div></div>
                  <span style={{ marginLeft:"auto",fontSize:12,color:"#991b1b66" }}>↗</span>
                </a>
              )}
            </div>
          )}
        </div>

        {/* Tear sheet CTA */}
        <div style={{ padding:"0 18px 18px" }}>
          <button onClick={()=>onTearSheet(product)}
            style={{ width:"100%",padding:"11px",background:"#f0f4ff",
              border:"1.5px solid #c3d9fd",borderRadius:10,color:NAVY,fontSize:13,
              fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8 }}>
            📄 Generate Tear Sheet
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Product Card ────────────────────────────────────────────────
function ProductCard({ product, onClick, inCompare, onToggleCompare }) {
  const vc = VENDOR_COLORS[product.vendor] || { bg:"#f3f4f6",text:"#374151" };
  const imgSrc = product.image_url || CAT_IMGS[product.category];
  const materials = product.materials ? product.materials.split(",").map(m=>m.trim()) : [];
  const hasBeltData = parseBeltData(product.belt_data).length > 0;

  return (
    <div style={{ background:"#fff",border:`2px solid ${inCompare?"#3b82f6":"#e5e7eb"}`,borderRadius:10,
      overflow:"hidden",cursor:"pointer",transition:"all 0.15s",display:"flex",flexDirection:"column",position:"relative" }}
      onMouseEnter={e=>{if(!inCompare){e.currentTarget.style.boxShadow="0 6px 20px rgba(26,58,92,0.12)";e.currentTarget.style.borderColor="#93c5fd";}}}
      onMouseLeave={e=>{if(!inCompare){e.currentTarget.style.boxShadow="none";e.currentTarget.style.borderColor="#e5e7eb";}}}>

      <div onClick={()=>onClick(product)} style={{ flex:1,display:"flex",flexDirection:"column" }}>
        {/* Image */}
        <div style={{ height:120,position:"relative",overflow:"hidden",flexShrink:0 }}>
          <ProductImage src={imgSrc} alt={product.series} style={{ width:"100%",height:"100%" }} />
          <div style={{ position:"absolute",top:7,right:7 }}>
            {product.vendor==="Intralox"
              ? <div style={{ background:"rgba(255,255,255,0.96)",borderRadius:5,padding:"3px 7px" }}>
                  <IntraloxLogo height={13} />
                </div>
              : <Badge label={product.vendor} color={vc.bg} textColor={vc.text} small />}
          </div>
        </div>

        {/* Body */}
        <div style={{ padding:"11px 13px",display:"flex",flexDirection:"column",gap:6,flex:1 }}>
          <div>
            <div style={{ fontSize:13,fontWeight:700,color:NAVY }}>{product.series}</div>
            <div style={{ fontSize:11,color:"#6b7280",marginTop:2 }}>{product.style}</div>
          </div>
          <div style={{ display:"flex",gap:4,flexWrap:"wrap" }}>
            {product.pitch_in && <Badge label={`${product.pitch_in}" pitch`} color="#f0fdf4" textColor="#166534" small />}
            {product.open_area && product.open_area!=="0%" && <Badge label={`${product.open_area} open`} color="#fef9c3" textColor="#854d0e" small />}
            {product.hinge_style && <Badge label={product.hinge_style} color="#f3f4f6" textColor="#4b5563" small />}
          </div>
          {/* Material abbr chips */}
          {materials.length > 0 && (
            <div style={{ display:"flex",gap:3,flexWrap:"wrap" }}>
              {materials.slice(0,4).map(m => {
                const info = getMI(m);
                return <span key={m} style={{ fontSize:9,fontWeight:800,padding:"2px 5px",
                  background:info.color,color:info.text,borderRadius:4,border:`1px solid ${info.text}22` }}>{info.abbr}</span>;
              })}
              {materials.length>4 && <span style={{ fontSize:9,color:"#9ca3af",padding:"2px 4px" }}>+{materials.length-4}</span>}
            </div>
          )}
          {product.notes && (
            <div style={{ fontSize:11,color:"#6b7280",lineHeight:1.45,
              display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical",overflow:"hidden" }}>
              {product.notes}
            </div>
          )}
          {/* Footer row */}
          <div style={{ marginTop:"auto",paddingTop:5,borderTop:"1px solid #f3f4f6",
            display:"flex",justifyContent:"space-between",alignItems:"center" }}>
            <div style={{ display:"flex",gap:4 }}>
              {product.tech_doc_url && <Badge label="📄" color="#eff6ff" textColor="#1d4ed8" small />}
              {product.cad_url && <Badge label="📐" color="#f0fdf4" textColor="#166534" small />}
              {hasBeltData && <Badge label="📊" color="#fef9c3" textColor="#92400e" small />}
            </div>
            <span style={{ fontSize:10,color:"#9ca3af" }}>View →</span>
          </div>
        </div>
      </div>

      {/* Compare badge */}
      <button onClick={e=>{e.stopPropagation();onToggleCompare(product);}}
        title={inCompare?"Remove from compare":"Add to compare"}
        style={{ position:"absolute",bottom:10,right:10,padding:"4px 9px",fontSize:10,fontWeight:700,
          background:inCompare?"#3b82f6":"#f3f4f6",
          color:inCompare?"#fff":"#6b7280",
          border:inCompare?"none":"1px solid #e5e7eb",
          borderRadius:6,cursor:"pointer" }}>
        {inCompare ? "✓" : "⚖️"}
      </button>
    </div>
  );
}

// ── Main App ────────────────────────────────────────────────────
export default function Catalog() {
  const [products, setProducts]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);
  const [search, setSearch]         = useState("");
  const [filterVendor, setFV]       = useState("All");
  const [filterCat, setFC]          = useState("All");
  const [filterPitch, setFP]        = useState("All");
  const [selected, setSelected]     = useState(null);
  const [tearSheet, setTearSheet]   = useState(null);
  const [compareList, setCompareList] = useState([]);
  const [showCompare, setShowCompare] = useState(false);

  useEffect(()=>{
    CatalogProduct.filter({})
      .then(d => { setProducts(Array.isArray(d)?d:[]); setLoading(false); })
      .catch(() => { setError("Failed to load. Please refresh."); setLoading(false); });
  },[]);

  const vendors = useMemo(()=>["All",...new Set(products.map(p=>p.vendor))].sort(),[products]);
  const cats    = useMemo(()=>["All",...new Set(products.map(p=>p.category))].sort(),[products]);
  const pitches = useMemo(()=>["All",...Array.from(new Set(products.map(p=>p.pitch_in).filter(Boolean))).sort((a,b)=>parseFloat(a)-parseFloat(b)).map(p=>`${p}"`)],[products]);

  const filtered = useMemo(()=>{
    const q = search.toLowerCase().trim();
    return products.filter(p => {
      if (q) {
        const hay = [p.series,p.style,p.materials,p.notes,p.search_tags,p.category,p.vendor].filter(Boolean).join(" ").toLowerCase();
        if (!hay.includes(q)) return false;
      }
      if (filterVendor!=="All" && p.vendor!==filterVendor) return false;
      if (filterCat!=="All"    && p.category!==filterCat)  return false;
      if (filterPitch!=="All"  && `${p.pitch_in}"`!==filterPitch) return false;
      return true;
    });
  },[products,search,filterVendor,filterCat,filterPitch]);

  const grouped = useMemo(()=>{
    const map = {};
    for (const p of filtered) { if (!map[p.series]) map[p.series]=[]; map[p.series].push(p); }
    return Object.entries(map).sort((a,b)=>(parseFloat(a[1][0]?.series_number)||0)-(parseFloat(b[1][0]?.series_number)||0));
  },[filtered]);

  const active = search||filterVendor!=="All"||filterCat!=="All"||filterPitch!=="All";

  const toggleCompare = (product) => {
    setCompareList(prev => {
      if (prev.includes(product.id)) return prev.filter(id=>id!==product.id);
      if (prev.length >= 4) return prev;
      return [...prev, product.id];
    });
  };
  const removeFromCompare = (id) => setCompareList(prev=>prev.filter(x=>x!==id));

  const sel = { padding:"8px 10px",border:"1px solid #e5e7eb",borderRadius:8,
    fontSize:12,color:"#374151",background:"#fff",cursor:"pointer",outline:"none" };

  return (
    <div style={{ minHeight:"100vh",background:"#f4f6f9",fontFamily:"Arial,sans-serif",
      paddingBottom:compareList.length>0?72:0 }}>

      {/* Header */}
      <div style={{ background:NAVY,padding:"16px 28px" }}>
        <div style={{ maxWidth:1140,margin:"0 auto",display:"flex",alignItems:"center",
          justifyContent:"space-between",gap:16,flexWrap:"wrap" }}>
          <div style={{ display:"flex",flexDirection:"column",gap:2 }}>
            <UniKingLogo size={28} />
            <div style={{ fontSize:8,color:"rgba(255,255,255,0.3)",letterSpacing:3,textTransform:"uppercase" }}>UNITING THE STRONGEST LINKS</div>
          </div>
          <div style={{ textAlign:"center" }}>
            <div style={{ color:"#fff",fontSize:16,fontWeight:700 }}>🔩 Parts Catalog</div>
            <div style={{ color:"rgba(255,255,255,0.55)",fontSize:11,marginTop:2 }}>
              {loading?"Loading...":`${products.length} products · ${new Set(products.map(p=>p.vendor)).size} vendors`}
            </div>
          </div>
          <div style={{ display:"flex",flexDirection:"column",alignItems:"flex-end",gap:6 }}>
            {compareList.length>0 && (
              <button onClick={()=>setShowCompare(true)}
                style={{ padding:"7px 16px",background:"#3b82f6",border:"none",
                  borderRadius:8,color:"#fff",fontSize:12,fontWeight:700,cursor:"pointer" }}>
                ⚖️ Compare ({compareList.length})
              </button>
            )}
            <div style={{ fontSize:10,color:"rgba(255,255,255,0.28)",textAlign:"right" }}>INTERNAL USE ONLY<br/>NO PRICING</div>
          </div>
        </div>
      </div>

      {/* Sticky filter bar */}
      <div style={{ background:"#fff",borderBottom:"1px solid #e5e7eb",padding:"10px 28px",
        position:"sticky",top:0,zIndex:10,boxShadow:"0 1px 4px rgba(0,0,0,0.06)" }}>
        <div style={{ maxWidth:1140,margin:"0 auto",display:"flex",gap:8,alignItems:"center",flexWrap:"wrap" }}>
          <div style={{ flex:"1 1 220px",position:"relative" }}>
            <span style={{ position:"absolute",left:10,top:"50%",transform:"translateY(-50%)",
              fontSize:14,color:"#9ca3af",pointerEvents:"none" }}>🔍</span>
            <input value={search} onChange={e=>setSearch(e.target.value)}
              placeholder="Search series, style, material..."
              style={{ width:"100%",padding:"8px 12px 8px 32px",border:"1px solid #e5e7eb",
                borderRadius:8,fontSize:12,outline:"none",boxSizing:"border-box" }} />
          </div>
          <select value={filterVendor} onChange={e=>setFV(e.target.value)} style={sel}>
            <option value="All">All Vendors</option>
            {vendors.filter(v=>v!=="All").map(v=><option key={v}>{v}</option>)}
          </select>
          <select value={filterCat} onChange={e=>setFC(e.target.value)} style={sel}>
            <option value="All">All Categories</option>
            {cats.filter(c=>c!=="All").map(c=><option key={c}>{c}</option>)}
          </select>
          <select value={filterPitch} onChange={e=>setFP(e.target.value)} style={sel}>
            <option value="All">All Pitches</option>
            {pitches.filter(p=>p!=="All").map(p=><option key={p}>{p}</option>)}
          </select>
          {active && (
            <button onClick={()=>{setSearch("");setFV("All");setFC("All");setFP("All");}}
              style={{ padding:"8px 12px",border:"1px solid #fca5a5",borderRadius:8,
                background:"#fef2f2",color:"#dc2626",fontSize:12,fontWeight:600,cursor:"pointer",whiteSpace:"nowrap" }}>
              ✕ Clear
            </button>
          )}
          <div style={{ fontSize:11,color:"#9ca3af",whiteSpace:"nowrap" }}>
            {!loading && `${filtered.length} result${filtered.length!==1?"s":""}`}
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth:1140,margin:"0 auto",padding:"24px 28px" }}>
        {loading && (
          <div style={{ textAlign:"center",padding:80 }}>
            <div style={{ fontSize:32,marginBottom:12 }}>⚙️</div>
            <div style={{ color:"#6b7280",fontSize:14 }}>Loading catalog...</div>
          </div>
        )}
        {error && <div style={{ textAlign:"center",padding:60,color:"#dc2626" }}>{error}</div>}
        {!loading&&!error&&grouped.length===0 && (
          <div style={{ textAlign:"center",padding:80 }}>
            <div style={{ fontSize:32,marginBottom:12 }}>🔍</div>
            <div style={{ color:"#6b7280",fontSize:14 }}>No products match your filters.</div>
            {active && <button onClick={()=>{setSearch("");setFV("All");setFC("All");setFP("All");}}
              style={{ marginTop:16,padding:"8px 20px",background:NAVY,color:"#fff",
                border:"none",borderRadius:8,cursor:"pointer",fontSize:13 }}>Clear Filters</button>}
          </div>
        )}

        {!loading&&!error&&grouped.map(([series,items])=>(
          <div key={series} style={{ marginBottom:32 }}>
            {/* Series header */}
            <div style={{ display:"flex",alignItems:"center",gap:10,marginBottom:12,
              paddingBottom:8,borderBottom:"1px solid #e5e7eb" }}>
              <span style={{ fontSize:15,fontWeight:800,color:NAVY }}>{series}</span>
              {items[0]?.pitch_in && <Badge label={`${items[0].pitch_in}" · ${items[0].pitch_mm}mm`} color="#f0fdf4" textColor="#166534" small />}
              <Badge label={`${items.length} style${items.length!==1?"s":""}`} color="#f1f5f9" textColor="#475569" small />
              <div style={{ flex:1 }} />
              <div style={{ background:"rgba(255,255,255,0.97)",borderRadius:6,padding:"3px 8px" }}>
                <VendorLogo vendor={items[0]?.vendor} height={18} />
              </div>
            </div>
            {/* Cards */}
            <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(210px,1fr))",gap:12 }}>
              {items.map(p => (
                <ProductCard key={p.id} product={p}
                  onClick={setSelected}
                  inCompare={compareList.includes(p.id)}
                  onToggleCompare={toggleCompare}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Compare tray */}
      <CompareTray
        compareList={compareList}
        products={products}
        onRemove={removeFromCompare}
        onClear={()=>setCompareList([])}
        onOpenCompare={()=>setShowCompare(true)}
      />

      {/* Modals */}
      {selected && (
        <ProductModal
          product={selected}
          allProducts={products}
          onClose={()=>setSelected(null)}
          onTearSheet={p=>{setSelected(null);setTearSheet(p);}}
          inCompare={compareList.includes(selected.id)}
          onToggleCompare={()=>toggleCompare(selected)}
          onSelectProduct={setSelected}
        />
      )}
      {tearSheet && <TearSheet product={tearSheet} onClose={()=>setTearSheet(null)} />}
      {showCompare && (
        <CompareSheet
          products={products.filter(p=>compareList.includes(p.id))}
          onClose={()=>setShowCompare(false)}
          onRemove={removeFromCompare}
        />
      )}
    </div>
  );
}
