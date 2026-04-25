import { useState, useEffect, useMemo, useRef } from "react";
import { CatalogProduct } from "@/api/entities";

const NAVY = "#1a3a5c";
const SILVER = "#9ca3af";
const INTRALOX_RED = "#c8102e";

// ── Real Intralox logo (generated from official EPS) ──────────
const INTRALOX_LOGO_URL = "https://base44.app/api/apps/69dd9ffccab4dd693d4d92f5/files/mp/public/69dd9ffccab4dd693d4d92f5/3a7335a99_intralox_logo.png";

const MATERIAL_INFO = {
  "Polypropylene":       { abbr: "PP", color: "#dbeafe", text: "#1e40af", note: "General purpose · FDA compliant · good chemical resistance" },
  "Polyethylene":        { abbr: "PE", color: "#dcfce7", text: "#166534", note: "Excellent impact resistance · low friction · FDA compliant" },
  "Acetal":              { abbr: "AC", color: "#fef9c3", text: "#854d0e", note: "High stiffness · low moisture absorption · FDA compliant" },
  "Nylon":               { abbr: "NY", color: "#f3e8ff", text: "#6b21a8", note: "High abrasion resistance · elevated temperature capable" },
  "AR Nylon":            { abbr: "AR", color: "#fce7f3", text: "#9d174d", note: "Abrasion-resistant variant · extended wear life" },
  "PVDF":                { abbr: "PV", color: "#ffedd5", text: "#9a3412", note: "Exceptional chemical resistance · high temp · FDA compliant" },
  "Polysulfone":         { abbr: "PS", color: "#e0f2fe", text: "#0c4a6e", note: "High-temp sterilization compatible · NSF certified" },
  "UHMW":                { abbr: "UH", color: "#f0fdf4", text: "#14532d", note: "Ultra-high molecular weight · extreme abrasion resistance" },
  "Stainless Steel":     { abbr: "SS", color: "#f1f5f9", text: "#334155", note: "Metal detectable · high-temp · corrosion resistant" },
  "Carbon Fiber Filled": { abbr: "CF", color: "#1e293b", text: "#94a3b8", note: "Electrically conductive · ESD safe · anti-static" },
  "HSEC acetal":         { abbr: "HC", color: "#fef3c7", text: "#92400e", note: "High-strength acetal variant" },
};

const getMI = (mat) => {
  const key = Object.keys(MATERIAL_INFO).find(k => mat.toLowerCase().includes(k.toLowerCase()));
  return key ? MATERIAL_INFO[key] : { abbr: mat.substring(0,2).toUpperCase(), color: "#f3f4f6", text: "#374151", note: mat };
};

const CAT_IMGS = {
  "Straight-Running Belts": "https://assets-us-01.kc-usercontent.com:443/19eb64b5-1815-003a-d268-e7109927ccad/645daf38-238c-422a-a113-6c9089f27218/modular-plastic-belting-straight-running-40_21.jpg",
  "Radius Belts":           "https://assets-us-01.kc-usercontent.com:443/19eb64b5-1815-003a-d268-e7109927ccad/35a6b869-7f0a-446e-8ace-19b9e7bb088d/modular-plastic-belting-radius-3_2.jpg",
  "Spiral Belts":           "https://assets-us-01.kc-usercontent.com:443/19eb64b5-1815-003a-d268-e7109927ccad/f045209f-e054-4c2f-a058-7cc4476e062b/modular-plastic-belting-40_21.jpg",
  "Side-Flexing Belts":     "https://assets-us-01.kc-usercontent.com:443/19eb64b5-1815-003a-d268-e7109927ccad/c2fa89b2-fb58-480b-92e2-af0c0ec2f66a/5010999_S2300-Dual-Turn-box-line_40-21_2400px.jpg",
};
const CAT_ICONS = { "Straight-Running Belts":"➡️","Radius Belts":"↩️","Spiral Belts":"🌀","Side-Flexing Belts":"↪️" };

// ── Intralox logo component ────────────────────────────────────
function IntraloxLogo({ height = 28, dark = false }) {
  return (
    <img
      src={INTRALOX_LOGO_URL}
      alt="Intralox"
      style={{ height, display: "block", filter: dark ? "none" : "brightness(0) invert(1)" }}
      onError={e => {
        e.target.style.display = "none";
        e.target.nextSibling && (e.target.nextSibling.style.display = "flex");
      }}
    />
  );
}

function VendorLogo({ vendor, height = 24, dark = false }) {
  if (vendor === "Intralox") return <IntraloxLogo height={height} dark={dark} />;
  const colors = { Movex: { bg:"#fef3c7", text:"#92400e" }, Rollepaal: { bg:"#f0fdf4", text:"#166534" } };
  const vc = colors[vendor] || { bg:"#f3f4f6", text:"#374151" };
  return <span style={{ padding:"3px 10px", background:vc.bg, color:vc.text, fontWeight:800, fontSize:height*0.55, borderRadius:5 }}>{vendor}</span>;
}

function UniKingLogo({ size=28 }) {
  return (
    <div style={{ display:"flex", alignItems:"center", lineHeight:1 }}>
      <span style={{ fontSize:size, fontWeight:900, color:SILVER, letterSpacing:-1, fontFamily:"Arial Black,Arial,sans-serif" }}>UNI</span>
      <span style={{ fontSize:size, fontWeight:900, color:"#fff", letterSpacing:-1, fontFamily:"Arial Black,Arial,sans-serif" }}>KING</span>
    </div>
  );
}

function Badge({ label, color="#e5e7eb", textColor="#374151", small }) {
  return (
    <span style={{ display:"inline-block", padding:small?"1px 6px":"2px 8px", borderRadius:99,
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
      <span style={{ fontSize:10, textAlign:"center", padding:"0 8px" }}>No Image</span>
    </div>
  );
  return <img src={src} alt={alt} onError={()=>setErr(true)} style={{ ...style, objectFit:"cover" }} />;
}

// ── Belt Data Chart ────────────────────────────────────────────
function BeltDataChart({ beltData }) {
  if (!beltData || !beltData.length) return null;

  const footnotes = beltData.filter(r => r.footnote).map(r => r.footnote);

  return (
    <div style={{ marginTop: 4 }}>
      <div style={{ fontWeight: 700, fontSize: 13, color: NAVY, marginBottom: 8, textAlign:"center",
        padding: "6px 0", background:"#f0f4f8", borderRadius:"6px 6px 0 0", border:"1px solid #d1d9e6", borderBottom:"none" }}>
        Belt Data
      </div>
      <div style={{ overflowX:"auto" }}>
        <table style={{ width:"100%", borderCollapse:"collapse", fontSize:12, border:"1px solid #d1d9e6", borderTop:"none" }}>
          <thead>
            <tr style={{ background:"#1a3a5c", color:"#fff" }}>
              <th rowSpan={2} style={{ padding:"6px 10px", textAlign:"left", fontWeight:700, borderRight:"1px solid #2a5a8c", verticalAlign:"bottom", minWidth:100 }}>
                Belt Material
              </th>
              <th rowSpan={2} style={{ padding:"6px 10px", textAlign:"left", fontWeight:700, borderRight:"1px solid #2a5a8c", verticalAlign:"bottom", minWidth:130, lineHeight:1.3 }}>
                Default Rod Material,<br/>Diameter 0.18 in (4.6 mm)
              </th>
              <th colSpan={2} style={{ padding:"6px 10px", textAlign:"center", fontWeight:700, borderRight:"1px solid #2a5a8c", borderBottom:"1px solid #2a5a8c" }}>
                Belt Strength
              </th>
              <th colSpan={2} style={{ padding:"6px 10px", textAlign:"center", fontWeight:700, borderRight:"1px solid #2a5a8c", borderBottom:"1px solid #2a5a8c", lineHeight:1.3 }}>
                Temperature Range<br/>(continuous)
              </th>
              <th colSpan={2} style={{ padding:"6px 10px", textAlign:"center", fontWeight:700, borderBottom:"1px solid #2a5a8c" }}>
                Belt Mass
              </th>
            </tr>
            <tr style={{ background:"#2a4a6c", color:"#e2e8f0" }}>
              <th style={{ padding:"4px 8px", textAlign:"center", borderRight:"1px solid #3a5a7c", fontWeight:600 }}>lbf/ft</th>
              <th style={{ padding:"4px 8px", textAlign:"center", borderRight:"1px solid #3a5a7c", fontWeight:600 }}>N/m</th>
              <th style={{ padding:"4px 8px", textAlign:"center", borderRight:"1px solid #3a5a7c", fontWeight:600 }}>°F</th>
              <th style={{ padding:"4px 8px", textAlign:"center", borderRight:"1px solid #3a5a7c", fontWeight:600 }}>°C</th>
              <th style={{ padding:"4px 8px", textAlign:"center", borderRight:"1px solid #3a5a7c", fontWeight:600 }}>lb/ft²</th>
              <th style={{ padding:"4px 8px", textAlign:"center", fontWeight:600 }}>kg/m²</th>
            </tr>
          </thead>
          <tbody>
            {beltData.map((row, i) => (
              <tr key={i} style={{ background: i%2===0 ? "#fff" : "#f8fafc" }}>
                <td style={{ padding:"6px 10px", borderRight:"1px solid #e2e8f0", borderBottom:"1px solid #e2e8f0", fontWeight:600, color:"#1e293b" }}>
                  {row.material}{row.footnote ? <sup style={{ color:INTRALOX_RED, marginLeft:1 }}>a</sup> : ""}
                </td>
                <td style={{ padding:"6px 10px", borderRight:"1px solid #e2e8f0", borderBottom:"1px solid #e2e8f0", color:"#374151" }}>
                  {row.rod_material}
                </td>
                <td style={{ padding:"6px 10px", textAlign:"center", borderRight:"1px solid #e2e8f0", borderBottom:"1px solid #e2e8f0", fontWeight:600, color:"#1e293b" }}>
                  {row.strength_lbf?.toLocaleString()}
                </td>
                <td style={{ padding:"6px 10px", textAlign:"center", borderRight:"1px solid #e2e8f0", borderBottom:"1px solid #e2e8f0", color:"#374151" }}>
                  {row.strength_nm?.toLocaleString()}
                </td>
                <td style={{ padding:"6px 10px", textAlign:"center", borderRight:"1px solid #e2e8f0", borderBottom:"1px solid #e2e8f0", color:"#374151" }}>
                  {row.temp_min_f} to {row.temp_max_f}
                </td>
                <td style={{ padding:"6px 10px", textAlign:"center", borderRight:"1px solid #e2e8f0", borderBottom:"1px solid #e2e8f0", color:"#374151" }}>
                  {row.temp_min_c} to {row.temp_max_c}
                </td>
                <td style={{ padding:"6px 10px", textAlign:"center", borderRight:"1px solid #e2e8f0", borderBottom:"1px solid #e2e8f0", color:"#374151" }}>
                  {row.mass_lbft2}
                </td>
                <td style={{ padding:"6px 10px", textAlign:"center", borderBottom:"1px solid #e2e8f0", color:"#374151" }}>
                  {row.mass_kgm2}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {footnotes.length > 0 && (
        <div style={{ fontSize:10, color:"#6b7280", fontStyle:"italic", marginTop:5, paddingLeft:4, lineHeight:1.5 }}>
          <sup style={{ color:INTRALOX_RED }}>a</sup> {footnotes[0]}
        </div>
      )}
    </div>
  );
}

// ── Related Products chips ────────────────────────────────────
function RelatedProducts({ related, allProducts, onSelect }) {
  if (!related) return null;
  const tags = related.split(",").map(s => s.trim()).filter(Boolean);
  if (!tags.length) return null;

  return (
    <div style={{ marginTop: 16 }}>
      <div style={{ fontSize:12, fontWeight:700, color:"#6b7280", textTransform:"uppercase", letterSpacing:1, marginBottom:8 }}>
        Related Products / Sprockets
      </div>
      <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
        {tags.map(tag => {
          // Try to find matching product in catalog
          const match = allProducts.find(p => {
            const sNum = `S${p.series_number}`;
            const sName = p.series?.replace("Series ","S");
            return sNum === tag || sName === tag || p.series === tag || p.style?.toLowerCase().includes(tag.toLowerCase());
          });

          return (
            <button
              key={tag}
              onClick={() => match && onSelect(match)}
              title={match ? `View ${match.series} — ${match.style}` : `Search for ${tag}`}
              style={{
                display:"inline-flex", alignItems:"center", gap:6,
                padding:"6px 14px",
                background: match ? "#eff6ff" : "#f9fafb",
                border: `1px solid ${match ? "#3b82f6" : "#d1d5db"}`,
                borderRadius: 99,
                fontSize: 12, fontWeight: 700,
                color: match ? "#1d4ed8" : "#6b7280",
                cursor: match ? "pointer" : "default",
                transition:"all 0.15s",
              }}
              onMouseEnter={e => match && (e.currentTarget.style.background="#dbeafe")}
              onMouseLeave={e => match && (e.currentTarget.style.background="#eff6ff")}
            >
              <span>🔗</span>
              <span>{tag}</span>
              {match && <span style={{ fontSize:10, color:"#3b82f6" }}>→</span>}
            </button>
          );
        })}
      </div>
      {tags.some(tag => !allProducts.find(p => `S${p.series_number}` === tag || p.series?.replace("Series ","S") === tag)) && (
        <div style={{ fontSize:10, color:"#9ca3af", marginTop:5, fontStyle:"italic" }}>
          Some related products may not yet be in the catalog.
        </div>
      )}
    </div>
  );
}

// ── Compare Sheet ──────────────────────────────────────────────
function CompareSheet({ items, onRemove, onClose }) {
  const printRef = useRef();

  const handlePrint = () => {
    const content = printRef.current.innerHTML;
    const win = window.open("","_blank","width=1200,height=700");
    win.document.write(`<!DOCTYPE html><html><head><title>Uniking — Belt Comparison</title>
    <style>*{margin:0;padding:0;box-sizing:border-box;}body{font-family:Arial,sans-serif;background:#fff;padding:20px;}
    table{border-collapse:collapse;width:100%;}th,td{padding:8px 12px;border:1px solid #d1d9e6;font-size:12px;}
    th{background:#1a3a5c;color:white;}tr:nth-child(even){background:#f8fafc;}
    @media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact;}}</style>
    </head><body>${content}</body></html>`);
    win.document.close(); win.focus(); setTimeout(()=>win.print(),400);
  };

  const fields = [
    { label:"Series", key: p => p.series },
    { label:"Style", key: p => p.style },
    { label:"Category", key: p => p.category },
    { label:"Pitch", key: p => `${p.pitch_in}" / ${p.pitch_mm}mm` },
    { label:"Min Width", key: p => p.min_width_in ? `${p.min_width_in}"` : "—" },
    { label:"Open Area", key: p => p.open_area || "—" },
    { label:"Hinge Style", key: p => p.hinge_style || "—" },
    { label:"Materials", key: p => p.materials || "—" },
  ];

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.65)", zIndex:3000,
      display:"flex", alignItems:"center", justifyContent:"center", padding:20 }} onClick={onClose}>
      <div style={{ background:"#fff", borderRadius:12, width:"100%", maxWidth:1000,
        maxHeight:"90vh", overflowY:"auto", boxShadow:"0 25px 50px rgba(0,0,0,0.4)" }}
        onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between",
          padding:"16px 24px", borderBottom:"1px solid #e5e7eb", background:NAVY, borderRadius:"12px 12px 0 0" }}>
          <div>
            <div style={{ fontSize:16, fontWeight:800, color:"#fff" }}>⚖️ Belt Comparison</div>
            <div style={{ fontSize:11, color:"rgba(255,255,255,0.6)", marginTop:2 }}>{items.length} product{items.length!==1?"s":""} selected</div>
          </div>
          <div style={{ display:"flex", gap:8 }}>
            <button onClick={handlePrint} style={{ padding:"8px 18px", background:INTRALOX_RED, color:"#fff",
              border:"none", borderRadius:7, fontSize:12, fontWeight:700, cursor:"pointer" }}>
              🖨️ Print / Export
            </button>
            <button onClick={onClose} style={{ padding:"8px 12px", background:"rgba(255,255,255,0.15)",
              border:"none", borderRadius:7, fontSize:13, cursor:"pointer", color:"#fff" }}>✕</button>
          </div>
        </div>

        <div ref={printRef} style={{ padding:24 }}>
          {/* Print header */}
          <div style={{ marginBottom:20, display:"flex", alignItems:"center", gap:16 }}>
            <div style={{ display:"flex", alignItems:"baseline", gap:0 }}>
              <span style={{ fontSize:22, fontWeight:900, color:"#9ca3af", fontFamily:"Arial Black,Arial,sans-serif" }}>UNI</span>
              <span style={{ fontSize:22, fontWeight:900, color:NAVY, fontFamily:"Arial Black,Arial,sans-serif" }}>KING</span>
            </div>
            <div style={{ height:30, width:1, background:"#e5e7eb" }}/>
            <div style={{ fontSize:14, fontWeight:700, color:NAVY }}>Belt Comparison Sheet</div>
            <div style={{ marginLeft:"auto", fontSize:11, color:"#9ca3af" }}>Generated {new Date().toLocaleDateString()}</div>
          </div>

          {/* Comparison table */}
          <div style={{ overflowX:"auto" }}>
            <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
              <thead>
                <tr>
                  <th style={{ padding:"10px 14px", background:"#f1f5f9", color:NAVY,
                    textAlign:"left", fontWeight:700, border:"1px solid #d1d9e6", minWidth:140 }}>
                    Specification
                  </th>
                  {items.map(item => (
                    <th key={item.id} style={{ padding:"10px 14px", background:NAVY, color:"#fff",
                      textAlign:"center", fontWeight:700, border:"1px solid #2a4a6c", minWidth:180, position:"relative" }}>
                      <div>{item.series}</div>
                      <div style={{ fontSize:11, fontWeight:500, color:"rgba(255,255,255,0.7)", marginTop:2 }}>{item.style}</div>
                      <button onClick={() => onRemove(item.id)} style={{
                        position:"absolute", top:6, right:6, background:"rgba(255,255,255,0.15)",
                        border:"none", borderRadius:4, color:"#fff", fontSize:10, cursor:"pointer", padding:"1px 5px"
                      }}>✕</button>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {fields.map((field, fi) => (
                  <tr key={fi} style={{ background: fi%2===0 ? "#fff" : "#f8fafc" }}>
                    <td style={{ padding:"9px 14px", fontWeight:700, color:"#374151",
                      border:"1px solid #e2e8f0", fontSize:12, background:"#f8fafc" }}>
                      {field.label}
                    </td>
                    {items.map(item => (
                      <td key={item.id} style={{ padding:"9px 14px", textAlign:"center",
                        border:"1px solid #e2e8f0", color:"#1e293b", fontSize:12 }}>
                        {field.key(item)}
                      </td>
                    ))}
                  </tr>
                ))}

                {/* Belt Data rows if available */}
                {items.some(p => p.belt_data) && (() => {
                  const allMats = [...new Set(items.flatMap(p => {
                    try { return JSON.parse(p.belt_data || "[]").map(r => r.material); } catch { return []; }
                  }))];
                  return [
                    <tr key="belt-header">
                      <td colSpan={items.length + 1} style={{ padding:"10px 14px", fontWeight:800,
                        color:NAVY, background:"#e8f0fe", border:"1px solid #d1d9e6", fontSize:12 }}>
                        Belt Data
                      </td>
                    </tr>,
                    ...allMats.map((mat, mi) => (
                      <tr key={`mat-${mi}`} style={{ background: mi%2===0 ? "#fff" : "#f8fafc" }}>
                        <td style={{ padding:"8px 14px", fontWeight:600, color:"#374151",
                          border:"1px solid #e2e8f0", fontSize:11, background:"#f8fafc" }}>
                          {mat}
                        </td>
                        {items.map(item => {
                          let rows = [];
                          try { rows = JSON.parse(item.belt_data || "[]"); } catch {}
                          const row = rows.find(r => r.material === mat);
                          return (
                            <td key={item.id} style={{ padding:"8px 14px", textAlign:"center",
                              border:"1px solid #e2e8f0", fontSize:11, color:"#374151" }}>
                              {row ? (
                                <div>
                                  <div style={{ fontWeight:600, color:NAVY }}>{row.strength_lbf} lbf/ft</div>
                                  <div style={{ fontSize:10, color:"#6b7280" }}>{row.temp_min_f}–{row.temp_max_f}°F</div>
                                </div>
                              ) : <span style={{ color:"#d1d5db" }}>—</span>}
                            </td>
                          );
                        })}
                      </tr>
                    ))
                  ];
                })()}
              </tbody>
            </table>
          </div>

          <div style={{ marginTop:16, fontSize:10, color:"#9ca3af", fontStyle:"italic" }}>
            * This comparison sheet is for internal use only. Contact Intralox for precise specifications and stock status.
            Uniking Canada — unikingcanada.com
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Tear Sheet ─────────────────────────────────────────────────
function TearSheet({ product, allProducts, onClose, onSelectRelated }) {
  const printRef = useRef();
  const [activeTab, setActiveTab] = useState("overview");

  const handlePrint = () => {
    const content = printRef.current.innerHTML;
    const win = window.open("","_blank","width=900,height=700");
    win.document.write(`<!DOCTYPE html><html><head><title>Uniking — ${product.series} ${product.style}</title>
    <style>*{margin:0;padding:0;box-sizing:border-box;}body{font-family:Arial,sans-serif;background:#fff;}
    table{border-collapse:collapse;width:100%;}th,td{padding:6px 10px;border:1px solid #d1d9e6;font-size:11px;}
    @media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact;}}</style>
    </head><body>${content}</body></html>`);
    win.document.close(); win.focus(); setTimeout(()=>win.print(),400);
  };

  if (!product) return null;
  const materials = product.materials ? product.materials.split(",").map(m=>m.trim()) : [];
  let beltData = [];
  try { beltData = JSON.parse(product.belt_data || "[]"); } catch {}

  const tabs = [
    { id:"overview", label:"📋 Overview" },
    { id:"materials", label:"🧪 Materials" },
    { id:"beltdata", label:"📊 Belt Data", disabled: !beltData.length },
    { id:"related", label:"🔗 Related", disabled: !product.related_products },
  ];

  return (
    <div style={{ position:"fixed",inset:0,background:"rgba(0,0,0,0.65)",zIndex:2000,
      display:"flex",alignItems:"center",justifyContent:"center",padding:16 }} onClick={onClose}>
      <div style={{ background:"#fff",borderRadius:12,width:"100%",maxWidth:800,maxHeight:"94vh",
        overflowY:"auto",boxShadow:"0 25px 50px rgba(0,0,0,0.4)" }} onClick={e=>e.stopPropagation()}>

        {/* Action bar */}
        <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",
          padding:"14px 20px",borderBottom:"1px solid #e5e7eb",background:NAVY,borderRadius:"12px 12px 0 0" }}>
          <div style={{ display:"flex", alignItems:"center", gap:14 }}>
            <img src={INTRALOX_LOGO_URL} alt="Intralox" style={{ height:22, filter:"brightness(0) invert(1)" }} />
            <div style={{ width:1, height:24, background:"rgba(255,255,255,0.25)" }}/>
            <div>
              <div style={{ fontSize:15, fontWeight:800, color:"#fff" }}>{product.series}</div>
              <div style={{ fontSize:11, color:"rgba(255,255,255,0.65)", marginTop:1 }}>{product.style}</div>
            </div>
          </div>
          <div style={{ display:"flex",gap:8 }}>
            <button onClick={handlePrint} style={{ padding:"7px 16px",background:INTRALOX_RED,color:"#fff",
              border:"none",borderRadius:7,fontSize:12,fontWeight:700,cursor:"pointer" }}>🖨️ Print / PDF</button>
            <button onClick={onClose} style={{ padding:"7px 12px",background:"rgba(255,255,255,0.15)",
              border:"none",borderRadius:7,fontSize:13,cursor:"pointer",color:"#fff" }}>✕</button>
          </div>
        </div>

        {/* Hero section */}
        <div style={{ display:"flex", minHeight:180, background:"#f8fafc", borderBottom:"1px solid #e5e7eb" }}>
          {/* Product image */}
          <div style={{ width:260, flexShrink:0, overflow:"hidden", position:"relative" }}>
            <ProductImage
              src={product.image_url || CAT_IMGS[product.category]}
              alt={`${product.series} ${product.style}`}
              style={{ width:"100%", height:"100%", objectFit:"cover" }}
            />
          </div>

          {/* Quick specs */}
          <div style={{ flex:1, padding:"20px 24px" }}>
            <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:10 }}>
              <Badge label={product.category} color="#dbeafe" textColor="#1e40af" />
              <Badge label={product.vendor} color="#fee2e2" textColor="#991b1b" />
            </div>

            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:0, border:"1px solid #e2e8f0", borderRadius:8, overflow:"hidden" }}>
              {[
                ["Pitch", `${product.pitch_in}" / ${product.pitch_mm}mm`],
                ["Min Width", product.min_width_in ? `${product.min_width_in}"` : "—"],
                ["Open Area", product.open_area || "—"],
                ["Hinge Style", product.hinge_style || "—"],
              ].map(([label, val], i) => (
                <div key={i} style={{ padding:"8px 14px", background: i%4<2 ? "#fff":"#f8fafc",
                  borderBottom: i<2 ? "1px solid #e2e8f0":"none",
                  borderRight: i%2===0 ? "1px solid #e2e8f0":"none" }}>
                  <div style={{ fontSize:10, color:"#9ca3af", fontWeight:600, textTransform:"uppercase", letterSpacing:0.8 }}>{label}</div>
                  <div style={{ fontSize:14, fontWeight:700, color:NAVY, marginTop:2 }}>{val}</div>
                </div>
              ))}
            </div>

            {product.notes && (
              <div style={{ marginTop:10, fontSize:12, color:"#4b5563", lineHeight:1.6, fontStyle:"italic" }}>
                {product.notes.split("\n")[0]}
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display:"flex", borderBottom:"1px solid #e5e7eb", background:"#fff", padding:"0 20px" }}>
          {tabs.map(tab => !tab.disabled && (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
              padding:"10px 16px", border:"none", borderBottom: activeTab===tab.id ? `2px solid ${INTRALOX_RED}` : "2px solid transparent",
              background:"none", fontWeight: activeTab===tab.id ? 700:500,
              color: activeTab===tab.id ? INTRALOX_RED:"#6b7280",
              fontSize:13, cursor:"pointer", transition:"all 0.15s"
            }}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div ref={printRef} style={{ padding:"20px 24px" }}>

          {activeTab === "overview" && (
            <div>
              <div style={{ fontSize:13, fontWeight:700, color:NAVY, marginBottom:10 }}>Product Notes</div>
              {product.notes ? (
                <ul style={{ paddingLeft:20, color:"#374151", fontSize:13, lineHeight:1.8 }}>
                  {product.notes.split("\n").filter(n=>n.trim()).map((note, i) => (
                    <li key={i}>{note.trim()}</li>
                  ))}
                </ul>
              ) : (
                <p style={{ color:"#9ca3af", fontSize:13, fontStyle:"italic" }}>No notes available for this product.</p>
              )}

              {/* Spec table */}
              <div style={{ marginTop:18, display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                <div style={{ padding:14, background:"#f8fafc", borderRadius:8, border:"1px solid #e2e8f0" }}>
                  <div style={{ fontSize:11, color:"#9ca3af", fontWeight:600, textTransform:"uppercase", letterSpacing:0.8 }}>Pitch</div>
                  <div style={{ fontSize:16, fontWeight:800, color:NAVY, marginTop:4 }}>{product.pitch_in}"</div>
                  <div style={{ fontSize:12, color:"#6b7280" }}>{product.pitch_mm} mm</div>
                </div>
                <div style={{ padding:14, background:"#f8fafc", borderRadius:8, border:"1px solid #e2e8f0" }}>
                  <div style={{ fontSize:11, color:"#9ca3af", fontWeight:600, textTransform:"uppercase", letterSpacing:0.8 }}>Minimum Width</div>
                  <div style={{ fontSize:16, fontWeight:800, color:NAVY, marginTop:4 }}>{product.min_width_in}"</div>
                  <div style={{ fontSize:12, color:"#6b7280" }}>Width increments available</div>
                </div>
              </div>

              {product.related_products && (
                <RelatedProducts
                  related={product.related_products}
                  allProducts={allProducts}
                  onSelect={p => { onClose(); setTimeout(() => onSelectRelated(p), 100); }}
                />
              )}
            </div>
          )}

          {activeTab === "materials" && (
            <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
              {materials.length ? materials.map((mat, i) => {
                const info = getMI(mat);
                return (
                  <div key={mat} style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 14px",
                    borderRadius:8, background:info.color, border:`1px solid ${info.text}22` }}>
                    <div style={{ minWidth:36, height:36, borderRadius:6, background:info.text, color:"#fff",
                      display:"flex", alignItems:"center", justifyContent:"center",
                      fontSize:11, fontWeight:800, letterSpacing:0.5, flexShrink:0 }}>{info.abbr}</div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:13, fontWeight:700, color:info.text }}>{mat}</div>
                      <div style={{ fontSize:11, color:info.text+"99", lineHeight:1.35, marginTop:2 }}>{info.note}</div>
                    </div>
                  </div>
                );
              }) : <p style={{ color:"#9ca3af", fontStyle:"italic" }}>No material data available.</p>}
              <div style={{ fontSize:10, color:"#9ca3af", fontStyle:"italic", marginTop:4 }}>
                All materials FDA compliant unless noted. Contact Uniking for material selection guidance.
              </div>
            </div>
          )}

          {activeTab === "beltdata" && (
            <BeltDataChart beltData={beltData} />
          )}

          {activeTab === "related" && product.related_products && (
            <RelatedProducts
              related={product.related_products}
              allProducts={allProducts}
              onSelect={p => { onClose(); setTimeout(() => onSelectRelated(p), 100); }}
            />
          )}
        </div>
      </div>
    </div>
  );
}

// ── Product Card ───────────────────────────────────────────────
function ProductCard({ product, onOpen, isCompared, onToggleCompare }) {
  const materials = product.materials ? product.materials.split(",").map(m=>m.trim()) : [];
  let hasBeltData = false;
  try { hasBeltData = JSON.parse(product.belt_data||"[]").length > 0; } catch {}

  return (
    <div style={{ background:"#fff", borderRadius:10, border:"1px solid #e5e7eb",
      boxShadow:"0 1px 4px rgba(0,0,0,0.06)", overflow:"hidden", display:"flex", flexDirection:"column",
      transition:"box-shadow 0.2s, transform 0.2s",
      ...(isCompared ? { border:`2px solid ${INTRALOX_RED}`, boxShadow:`0 0 0 3px ${INTRALOX_RED}22` } : {})
    }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow="0 4px 16px rgba(0,0,0,0.12)"; e.currentTarget.style.transform="translateY(-1px)"; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow= isCompared ? `0 0 0 3px ${INTRALOX_RED}22` : "0 1px 4px rgba(0,0,0,0.06)"; e.currentTarget.style.transform="none"; }}
    >
      {/* Image */}
      <div style={{ position:"relative", height:140, overflow:"hidden", background:"#f1f5f9" }}>
        <ProductImage
          src={product.image_url || CAT_IMGS[product.category]}
          alt={`${product.series} ${product.style}`}
          style={{ width:"100%", height:"100%" }}
        />
        {/* Compare toggle */}
        <button
          onClick={e => { e.stopPropagation(); onToggleCompare(product); }}
          title={isCompared ? "Remove from compare" : "Add to compare"}
          style={{
            position:"absolute", top:8, right:8,
            background: isCompared ? INTRALOX_RED : "rgba(255,255,255,0.9)",
            border: isCompared ? "none" : "1px solid #d1d5db",
            borderRadius:6, padding:"4px 8px", fontSize:10, fontWeight:700,
            color: isCompared ? "#fff" : "#374151",
            cursor:"pointer", backdropFilter:"blur(4px)", transition:"all 0.15s"
          }}>
          {isCompared ? "✓ Compare" : "+ Compare"}
        </button>
        {hasBeltData && (
          <div style={{ position:"absolute", bottom:8, left:8, background:"rgba(26,58,92,0.85)",
            color:"#fff", fontSize:9, fontWeight:700, padding:"2px 6px", borderRadius:4, letterSpacing:0.5 }}>
            BELT DATA
          </div>
        )}
      </div>

      {/* Content */}
      <div style={{ padding:"12px 14px", flex:1, display:"flex", flexDirection:"column" }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:4 }}>
          <span style={{ fontSize:11, fontWeight:700, color:INTRALOX_RED, letterSpacing:0.5 }}>
            {product.series}
          </span>
          <span style={{ fontSize:10, color:"#9ca3af" }}>{product.pitch_in}"p</span>
        </div>
        <div style={{ fontSize:15, fontWeight:800, color:NAVY, marginBottom:6, lineHeight:1.2 }}>
          {product.style}
        </div>

        {/* Quick specs */}
        <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:8 }}>
          {product.open_area && <Badge label={product.open_area} small />}
          {product.hinge_style && <Badge label={product.hinge_style+" hinge"} color="#f0f4f8" textColor="#475569" small />}
        </div>

        {/* Materials */}
        <div style={{ display:"flex", gap:4, flexWrap:"wrap", marginBottom:10, flex:1 }}>
          {materials.slice(0,5).map(mat => {
            const info = getMI(mat);
            return (
              <span key={mat} title={mat} style={{ padding:"1px 5px", borderRadius:4,
                background:info.color, color:info.text, fontSize:9, fontWeight:700, letterSpacing:0.3 }}>
                {info.abbr}
              </span>
            );
          })}
          {materials.length>5 && <span style={{ fontSize:9, color:"#9ca3af", alignSelf:"center" }}>+{materials.length-5}</span>}
        </div>

        <button onClick={() => onOpen(product)} style={{
          width:"100%", padding:"8px", background:NAVY, color:"#fff",
          border:"none", borderRadius:7, fontSize:12, fontWeight:700, cursor:"pointer",
          transition:"background 0.15s"
        }}
          onMouseEnter={e => e.currentTarget.style.background="#2a5a8c"}
          onMouseLeave={e => e.currentTarget.style.background=NAVY}
        >
          View Details →
        </button>
      </div>
    </div>
  );
}

// ── Main App ───────────────────────────────────────────────────
export default function Catalog() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("All");
  const [filterVendor, setFilterVendor] = useState("All");
  const [selected, setSelected] = useState(null);
  const [compareList, setCompareList] = useState([]);
  const [showCompare, setShowCompare] = useState(false);
  const [sortBy, setSortBy] = useState("series");

  useEffect(() => {
    CatalogProduct.list().then(data => {
      setProducts(data || []);
      setLoading(false);
    });
  }, []);

  const categories = useMemo(() => ["All", ...new Set(products.map(p=>p.category).filter(Boolean))], [products]);
  const vendors = useMemo(() => ["All", ...new Set(products.map(p=>p.vendor).filter(Boolean))], [products]);

  const filtered = useMemo(() => {
    let result = products;
    if (filterCat !== "All") result = result.filter(p => p.category === filterCat);
    if (filterVendor !== "All") result = result.filter(p => p.vendor === filterVendor);
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(p =>
        [p.series,p.style,p.category,p.vendor,p.materials,p.search_tags,p.notes]
          .some(v => v?.toLowerCase().includes(q))
      );
    }
    return [...result].sort((a,b) => {
      if (sortBy === "series") return (a.series_number||0) - (b.series_number||0);
      if (sortBy === "style") return (a.style||"").localeCompare(b.style||"");
      return 0;
    });
  }, [products, filterCat, filterVendor, search, sortBy]);

  const toggleCompare = (product) => {
    setCompareList(prev => {
      const exists = prev.find(p=>p.id===product.id);
      if (exists) return prev.filter(p=>p.id!==product.id);
      if (prev.length >= 4) return prev; // max 4
      return [...prev, product];
    });
  };

  if (loading) return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:"#f1f5f9" }}>
      <div style={{ textAlign:"center" }}>
        <div style={{ width:40, height:40, border:`4px solid ${NAVY}`, borderTopColor:"transparent",
          borderRadius:"50%", animation:"spin 0.8s linear infinite", margin:"0 auto 16px" }}/>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        <div style={{ color:NAVY, fontWeight:700 }}>Loading Catalog…</div>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight:"100vh", background:"#f1f5f9", fontFamily:"Arial, sans-serif" }}>

      {/* Header */}
      <div style={{ background:NAVY, padding:"0 0 0 0", boxShadow:"0 2px 12px rgba(0,0,0,0.2)" }}>
        <div style={{ maxWidth:1280, margin:"0 auto", padding:"16px 24px",
          display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:12 }}>
          <div style={{ display:"flex", alignItems:"center", gap:20 }}>
            <UniKingLogo size={30} />
            <div style={{ width:1, height:36, background:"rgba(255,255,255,0.2)" }}/>
            <div>
              <div style={{ fontSize:11, color:"rgba(255,255,255,0.5)", textTransform:"uppercase", letterSpacing:2 }}>Interactive</div>
              <div style={{ fontSize:16, fontWeight:800, color:"#fff", marginTop:-1 }}>Parts Catalog</div>
            </div>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:16 }}>
            <img src={INTRALOX_LOGO_URL} alt="Intralox" style={{ height:22, filter:"brightness(0) invert(1)", opacity:0.9 }}/>
            {compareList.length > 0 && (
              <button onClick={() => setShowCompare(true)} style={{
                padding:"8px 18px", background:INTRALOX_RED, color:"#fff",
                border:"none", borderRadius:8, fontWeight:700, fontSize:13, cursor:"pointer",
                display:"flex", alignItems:"center", gap:8, boxShadow:"0 2px 8px rgba(200,16,46,0.4)"
              }}>
                ⚖️ Compare ({compareList.length})
              </button>
            )}
          </div>
        </div>

        {/* Search + filters bar */}
        <div style={{ background:"rgba(0,0,0,0.2)", padding:"12px 24px" }}>
          <div style={{ maxWidth:1280, margin:"0 auto", display:"flex", gap:10, flexWrap:"wrap", alignItems:"center" }}>
            <div style={{ flex:1, minWidth:200, position:"relative" }}>
              <input
                value={search} onChange={e=>setSearch(e.target.value)}
                placeholder="Search series, style, material…"
                style={{ width:"100%", padding:"9px 14px 9px 38px", borderRadius:8,
                  border:"1px solid rgba(255,255,255,0.2)", background:"rgba(255,255,255,0.1)",
                  color:"#fff", fontSize:13, outline:"none", boxSizing:"border-box" }}
              />
              <span style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", fontSize:14 }}>🔍</span>
            </div>
            <select value={filterVendor} onChange={e=>setFilterVendor(e.target.value)}
              style={{ padding:"9px 12px", borderRadius:8, border:"1px solid rgba(255,255,255,0.2)",
                background:"rgba(255,255,255,0.1)", color:"#fff", fontSize:12, cursor:"pointer" }}>
              {vendors.map(v=><option key={v} value={v} style={{color:"#000"}}>{v==="All"?"All Vendors":v}</option>)}
            </select>
            <select value={filterCat} onChange={e=>setFilterCat(e.target.value)}
              style={{ padding:"9px 12px", borderRadius:8, border:"1px solid rgba(255,255,255,0.2)",
                background:"rgba(255,255,255,0.1)", color:"#fff", fontSize:12, cursor:"pointer" }}>
              {categories.map(c=><option key={c} value={c} style={{color:"#000"}}>{c==="All"?"All Categories":c}</option>)}
            </select>
            <select value={sortBy} onChange={e=>setSortBy(e.target.value)}
              style={{ padding:"9px 12px", borderRadius:8, border:"1px solid rgba(255,255,255,0.2)",
                background:"rgba(255,255,255,0.1)", color:"#fff", fontSize:12, cursor:"pointer" }}>
              <option value="series" style={{color:"#000"}}>Sort: Series #</option>
              <option value="style" style={{color:"#000"}}>Sort: Style</option>
            </select>
            <div style={{ color:"rgba(255,255,255,0.6)", fontSize:12, whiteSpace:"nowrap" }}>
              {filtered.length} product{filtered.length!==1?"s":""}
            </div>
          </div>
        </div>
      </div>

      {/* Category ribbon */}
      <div style={{ background:"#fff", borderBottom:"1px solid #e5e7eb", overflowX:"auto" }}>
        <div style={{ maxWidth:1280, margin:"0 auto", padding:"0 24px", display:"flex", gap:0 }}>
          {categories.map(cat => (
            <button key={cat} onClick={() => setFilterCat(cat)} style={{
              padding:"12px 20px", border:"none", borderBottom: filterCat===cat ? `3px solid ${INTRALOX_RED}` : "3px solid transparent",
              background:"none", fontWeight: filterCat===cat ? 700 : 500,
              color: filterCat===cat ? INTRALOX_RED : "#6b7280",
              fontSize:13, cursor:"pointer", whiteSpace:"nowrap", transition:"all 0.15s"
            }}>
              {cat==="All" ? "⊞ All" : `${CAT_ICONS[cat]||"•"} ${cat}`}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div style={{ maxWidth:1280, margin:"0 auto", padding:"24px" }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign:"center", padding:"60px 20px", color:"#9ca3af" }}>
            <div style={{ fontSize:40, marginBottom:12 }}>🔍</div>
            <div style={{ fontSize:18, fontWeight:700, color:"#374151", marginBottom:6 }}>No products found</div>
            <div style={{ fontSize:13 }}>Try adjusting your search or filters</div>
          </div>
        ) : (
          <div style={{ display:"grid",
            gridTemplateColumns:"repeat(auto-fill, minmax(220px, 1fr))", gap:16 }}>
            {filtered.map(p => (
              <ProductCard
                key={p.id}
                product={p}
                onOpen={setSelected}
                isCompared={compareList.some(c=>c.id===p.id)}
                onToggleCompare={toggleCompare}
              />
            ))}
          </div>
        )}
      </div>

      {/* Compare floating bar */}
      {compareList.length > 0 && !showCompare && (
        <div style={{ position:"fixed", bottom:24, left:"50%", transform:"translateX(-50%)",
          background:NAVY, borderRadius:12, padding:"12px 20px",
          boxShadow:"0 8px 32px rgba(0,0,0,0.3)", display:"flex", alignItems:"center", gap:14, zIndex:1000 }}>
          <div style={{ color:"#fff", fontSize:13, fontWeight:600 }}>
            {compareList.length} belt{compareList.length!==1?"s":""} selected:
          </div>
          <div style={{ display:"flex", gap:8 }}>
            {compareList.map(p => (
              <div key={p.id} style={{ background:"rgba(255,255,255,0.15)", borderRadius:6,
                padding:"4px 10px", fontSize:11, color:"#fff", display:"flex", alignItems:"center", gap:6 }}>
                <span>{p.series}</span>
                <button onClick={() => toggleCompare(p)} style={{ background:"none", border:"none",
                  color:"rgba(255,255,255,0.6)", cursor:"pointer", fontSize:11, padding:0, lineHeight:1 }}>✕</button>
              </div>
            ))}
          </div>
          <button onClick={() => setShowCompare(true)} style={{
            padding:"8px 20px", background:INTRALOX_RED, color:"#fff", border:"none",
            borderRadius:8, fontWeight:700, fontSize:13, cursor:"pointer"
          }}>
            ⚖️ Compare Now
          </button>
        </div>
      )}

      {/* Modals */}
      {selected && (
        <TearSheet
          product={selected}
          allProducts={products}
          onClose={() => setSelected(null)}
          onSelectRelated={p => setSelected(p)}
        />
      )}
      {showCompare && (
        <CompareSheet
          items={compareList}
          onRemove={id => setCompareList(prev => prev.filter(p=>p.id!==id))}
          onClose={() => setShowCompare(false)}
        />
      )}
    </div>
  );
}
