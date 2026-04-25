import { useState, useEffect, useMemo, useRef } from "react";
import { CatalogProduct } from "@/api/entities";

const NAVY = "#1a3a5c";
const SILVER = "#9ca3af";
const INTRALOX_RED = "#c8102e";

const MATERIAL_INFO = {
  "Polypropylene":       { abbr: "PP", color: "#dbeafe", text: "#1e40af", note: "General purpose · FDA compliant · good chemical resistance" },
  "Polyethylene":        { abbr: "PE", color: "#dcfce7", text: "#166534", note: "Excellent impact resistance · low friction · FDA compliant" },
  "Acetal":              { abbr: "AC", color: "#fef9c3", text: "#854d0e", note: "High stiffness · low moisture absorption · FDA compliant" },
  "HSEC acetal":         { abbr: "HS", color: "#fef3c7", text: "#92400e", note: "High-strength acetal · enhanced chemical resistance" },
  "Acetala":             { abbr: "AC*", color: "#fef9c3", text: "#854d0e", note: "Acetal with PE rods — cold temp applications" },
  "Nylon":               { abbr: "NY", color: "#f3e8ff", text: "#6b21a8", note: "High abrasion resistance · elevated temperature capable" },
  "AR Nylon":            { abbr: "AR", color: "#fce7f3", text: "#9d174d", note: "Abrasion-resistant variant · extended wear life" },
  "PVDF":                { abbr: "PV", color: "#ffedd5", text: "#9a3412", note: "Exceptional chemical resistance · high temp · FDA compliant" },
  "Polysulfone":         { abbr: "PS", color: "#e0f2fe", text: "#0c4a6e", note: "High-temp sterilization compatible · NSF certified" },
  "UHMW":                { abbr: "UH", color: "#f0fdf4", text: "#14532d", note: "Ultra-high molecular weight · extreme abrasion resistance" },
  "Stainless Steel":     { abbr: "SS", color: "#f1f5f9", text: "#334155", note: "Metal detectable · high-temp · corrosion resistant" },
  "Carbon Fiber Filled": { abbr: "CF", color: "#1e293b", text: "#94a3b8", note: "Electrically conductive · ESD safe · anti-static" },
};

const getMI = (mat) => {
  if (!mat) return { abbr: "?", color: "#f3f4f6", text: "#374151", note: mat };
  const key = Object.keys(MATERIAL_INFO).find(k => mat.toLowerCase().includes(k.toLowerCase()));
  return key ? MATERIAL_INFO[key] : { abbr: mat.substring(0,2).toUpperCase(), color: "#f3f4f6", text: "#374151", note: mat };
};

const CDN = "https://assets-us-01.kc-usercontent.com:443/19eb64b5-1815-003a-d268-e7109927ccad/";
const CAT_IMGS = {
  "Straight-Running Belts": CDN + "645daf38-238c-422a-a113-6c9089f27218/modular-plastic-belting-straight-running-40_21.jpg",
  "Radius Belts":           CDN + "35a6b869-7f0a-446e-8ace-19b9e7bb088d/modular-plastic-belting-radius-3_2.jpg",
  "Spiral Belts":           CDN + "f045209f-e054-4c2f-a058-7cc4476e062b/modular-plastic-belting-40_21.jpg",
  "Side-Flexing Belts":     CDN + "c2fa89b2-fb58-480b-92e2-af0c0ec2f66a/5010999_S2300-Dual-Turn-box-line_40-21_2400px.jpg",
};
const CAT_ICONS = { "Straight-Running Belts":"➡️","Radius Belts":"↩️","Spiral Belts":"🌀","Side-Flexing Belts":"↪️" };


function VendorLogo({ vendor, height = 22 }) {
  const colors = {
    Intralox:  { bg:"#fee2e2", text:"#991b1b" },
    Movex:     { bg:"#fef3c7", text:"#92400e" },
    Rollepaal: { bg:"#f0fdf4", text:"#166534" },
  };
  const vc = colors[vendor] || { bg:"#f3f4f6", text:"#374151" };
  return <span style={{ padding:"3px 9px", background:vc.bg, color:vc.text, fontWeight:800, fontSize:height*0.55, borderRadius:5 }}>{vendor}</span>;
}

function Badge({ label, color="#e5e7eb", textColor="#374151", small }) {
  return (
    <span style={{ display:"inline-block", padding:small?"1px 6px":"3px 9px", borderRadius:99,
      background:color, color:textColor, fontSize:small?10:11, fontWeight:600, letterSpacing:0.3, whiteSpace:"nowrap" }}>
      {label}
    </span>
  );
}

function UniKingLogo({ size=28 }) {
  return (
    <div style={{ display:"flex", alignItems:"center", lineHeight:1 }}>
      <span style={{ fontSize:size, fontWeight:900, color:SILVER, letterSpacing:-1, fontFamily:"'Arial Black',Arial,sans-serif" }}>UNI</span>
      <span style={{ fontSize:size, fontWeight:900, color:"#fff", letterSpacing:-1, fontFamily:"'Arial Black',Arial,sans-serif" }}>KING</span>
    </div>
  );
}

function ProductImage({ src, alt, style={} }) {
  const [err, setErr] = useState(false);
  if (!src || err) return (
    <div style={{ ...style, background:"#f1f5f9", display:"flex", flexDirection:"column",
      alignItems:"center", justifyContent:"center", gap:6, color:"#94a3b8" }}>
      <svg width="36" height="36" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
        <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
        <path d="M21 15l-5-5L5 21"/>
      </svg>
      <span style={{ fontSize:10, textAlign:"center", padding:"0 8px" }}>No Image Available</span>
    </div>
  );
  return <img src={src} alt={alt} onError={()=>setErr(true)} style={{ ...style, objectFit:"cover" }} />;
}

// ── Belt Data Chart (from PDF) ──────────────────────────────────
function BeltDataChart({ beltData }) {
  if (!beltData || !beltData.length) return (
    <div style={{ color:"#9ca3af", fontSize:13, textAlign:"center", padding:"32px 0" }}>
      No belt data available for this product.
    </div>
  );

  const footnotes = beltData.filter(r => r.footnote).map(r => r.footnote);

  return (
    <div style={{ overflowX:"auto" }}>
      <table style={{ width:"100%", borderCollapse:"collapse", fontSize:12, minWidth:560 }}>
        <thead>
          <tr style={{ background:NAVY }}>
            <th rowSpan={2} style={{ ...th, textAlign:"left", width:"18%", verticalAlign:"bottom" }}>Belt Material</th>
            <th rowSpan={2} style={{ ...th, width:"18%", verticalAlign:"bottom" }}>Default Rod Material</th>
            <th colSpan={2} style={{ ...th, textAlign:"center", borderBottom:"1px solid rgba(255,255,255,0.2)" }}>Belt Strength</th>
            <th colSpan={2} style={{ ...th, textAlign:"center", borderBottom:"1px solid rgba(255,255,255,0.2)" }}>Temp Range (cont.)</th>
            <th colSpan={2} style={{ ...th, textAlign:"center", borderBottom:"1px solid rgba(255,255,255,0.2)" }}>Belt Mass</th>
          </tr>
          <tr style={{ background:NAVY }}>
            <th style={{ ...th, fontSize:10 }}>lbf/ft</th>
            <th style={{ ...th, fontSize:10 }}>N/m</th>
            <th style={{ ...th, fontSize:10 }}>°F</th>
            <th style={{ ...th, fontSize:10 }}>°C</th>
            <th style={{ ...th, fontSize:10 }}>lb/ft²</th>
            <th style={{ ...th, fontSize:10 }}>kg/m²</th>
          </tr>
        </thead>
        <tbody>
          {beltData.map((row, i) => {
            const isAlt = i % 2 === 1;
            return (
              <tr key={i} style={{ background: isAlt ? "#f8fafc" : "#fff" }}>
                <td style={{ ...td, fontWeight:700, color:NAVY }}>{row.material}</td>
                <td style={{ ...td, textAlign:"center", color:"#4b5563" }}>{row.rod_material}</td>
                <td style={{ ...td, textAlign:"center", fontWeight:600 }}>{row.strength_lbf?.toLocaleString()}</td>
                <td style={{ ...td, textAlign:"center", fontWeight:600 }}>{row.strength_nm?.toLocaleString()}</td>
                <td style={{ ...td, textAlign:"center", color:"#374151" }}>
                  {row.temp_min_f} to {row.temp_max_f}
                </td>
                <td style={{ ...td, textAlign:"center", color:"#374151" }}>
                  {row.temp_min_c} to {row.temp_max_c}
                </td>
                <td style={{ ...td, textAlign:"center" }}>{row.mass_lbft2}</td>
                <td style={{ ...td, textAlign:"center" }}>{row.mass_kgm2}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {footnotes.length > 0 && (
        <div style={{ marginTop:8, fontSize:10, color:"#6b7280", fontStyle:"italic", lineHeight:1.5 }}>
          {footnotes.map((fn, i) => <div key={i}>ᵃ {fn}</div>)}
        </div>
      )}
    </div>
  );
}

const th = {
  padding:"8px 10px", color:"#fff", fontSize:11, fontWeight:700,
  textAlign:"center", whiteSpace:"nowrap", border:"none"
};
const td = {
  padding:"8px 10px", borderBottom:"1px solid #e5e7eb", fontSize:12, color:"#1f2937"
};

// ── Materials Chart ─────────────────────────────────────────────
function MaterialsChart({ materials }) {
  if (!materials.length) return <div style={{ color:"#9ca3af",fontSize:13,textAlign:"center",padding:32 }}>No material data.</div>;
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
      {materials.map((mat, i) => {
        const info = getMI(mat);
        return (
          <div key={i} style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 12px",
            borderRadius:8, background:info.color, border:`1px solid ${info.text}22` }}>
            <div style={{ minWidth:36, height:36, borderRadius:6, background:info.text, color:"#fff",
              display:"flex", alignItems:"center", justifyContent:"center",
              fontSize:10, fontWeight:800, letterSpacing:0.5, flexShrink:0 }}>{info.abbr}</div>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:13, fontWeight:700, color:info.text }}>{mat}</div>
              <div style={{ fontSize:11, color:info.text+"aa", lineHeight:1.35, marginTop:2 }}>{info.note}</div>
            </div>
            <div style={{ fontSize:10, fontWeight:600, color:info.text+"88",
              padding:"2px 7px", background:info.text+"15", borderRadius:4 }}>Option {i+1}</div>
          </div>
        );
      })}
      <div style={{ fontSize:10, color:"#9ca3af", fontStyle:"italic", marginTop:4 }}>
        All materials FDA compliant unless noted. Contact Uniking for material selection guidance.
      </div>
    </div>
  );
}

// ── Related Products Chips ──────────────────────────────────────
function RelatedProducts({ related, allProducts, onNavigate }) {
  if (!related) return null;
  const tags = related.split(",").map(s => s.trim()).filter(Boolean);
  if (!tags.length) return null;

  return (
    <div style={{ padding:"14px 20px", borderTop:"1px solid #f1f5f9" }}>
      <div style={{ fontSize:11, fontWeight:700, color:"#9ca3af", textTransform:"uppercase", letterSpacing:1, marginBottom:10 }}>
        🔗 Related Products / Sprockets
      </div>
      <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
        {tags.map(tag => {
          // Try to find matching product in catalog
          const match = allProducts.find(p => {
            const sNum = tag.replace(/^S/i,"");
            return p.series_number == sNum || p.series?.toLowerCase().includes(tag.toLowerCase());
          });
          return (
            <button
              key={tag}
              onClick={() => match && onNavigate(match)}
              style={{
                padding:"7px 14px",
                background: match ? NAVY : "#f3f4f6",
                color: match ? "#fff" : "#9ca3af",
                border: match ? "none" : "1px dashed #d1d5db",
                borderRadius:7, fontSize:12, fontWeight:700,
                cursor: match ? "pointer" : "default",
                display:"flex", alignItems:"center", gap:6,
                transition:"all 0.15s"
              }}
              title={match ? `View ${match.series} ${match.style}` : `${tag} — not yet in catalog`}
            >
              {match ? "🔗" : "🔹"} {tag}
              {match && <span style={{ fontSize:10, opacity:0.7, fontWeight:400 }}>→</span>}
            </button>
          );
        })}
      </div>
      {tags.some(tag => !allProducts.find(p => p.series_number == tag.replace(/^S/i,"") || p.series?.toLowerCase().includes(tag.toLowerCase()))) && (
        <div style={{ fontSize:10, color:"#9ca3af", marginTop:8, fontStyle:"italic" }}>
          Grey items not yet in catalog — contact Uniking for details
        </div>
      )}
    </div>
  );
}

// ── Compare Tray (floating) ─────────────────────────────────────
function CompareTray({ compareList, allProducts, onRemove, onClear, onCompare }) {
  if (!compareList.length) return null;
  return (
    <div style={{
      position:"fixed", bottom:24, left:"50%", transform:"translateX(-50%)",
      background:NAVY, borderRadius:14, padding:"12px 20px",
      display:"flex", alignItems:"center", gap:12, zIndex:900,
      boxShadow:"0 8px 32px rgba(0,0,0,0.3)", maxWidth:"90vw",
      border:"2px solid rgba(255,255,255,0.15)"
    }}>
      <div style={{ fontSize:11, color:"rgba(255,255,255,0.6)", fontWeight:700, whiteSpace:"nowrap" }}>
        ⚖️ Compare ({compareList.length}/4):
      </div>
      <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
        {compareList.map(id => {
          const p = allProducts.find(x => x.id === id);
          if (!p) return null;
          return (
            <div key={id} style={{ display:"flex", alignItems:"center", gap:5,
              background:"rgba(255,255,255,0.12)", borderRadius:6, padding:"4px 10px" }}>
              <span style={{ fontSize:11, color:"#fff", fontWeight:600 }}>{p.series} {p.style}</span>
              <button onClick={() => onRemove(id)}
                style={{ background:"none", border:"none", color:"rgba(255,255,255,0.6)", cursor:"pointer", fontSize:13, padding:0, lineHeight:1 }}>×</button>
            </div>
          );
        })}
      </div>
      <button onClick={onCompare}
        style={{ padding:"7px 18px", background:"#fff", color:NAVY, border:"none",
          borderRadius:7, fontSize:12, fontWeight:800, cursor:"pointer", whiteSpace:"nowrap" }}>
        Compare →
      </button>
      <button onClick={onClear}
        style={{ background:"none", border:"1px solid rgba(255,255,255,0.3)", color:"rgba(255,255,255,0.6)",
          borderRadius:6, padding:"6px 10px", fontSize:11, cursor:"pointer" }}>
        Clear
      </button>
    </div>
  );
}

// ── Compare Sheet Modal ─────────────────────────────────────────
function CompareSheet({ compareList, allProducts, onClose }) {
  const products = compareList.map(id => allProducts.find(p => p.id === id)).filter(Boolean);
  if (!products.length) return null;
  const printRef = useRef();

  const handlePrint = () => {
    const content = printRef.current.innerHTML;
    const win = window.open("","_blank","width=1100,height=700");
    win.document.write(`<!DOCTYPE html><html><head><title>Uniking — Belt Comparison</title>
    <style>*{margin:0;padding:0;box-sizing:border-box;}body{font-family:Arial,sans-serif;background:#fff;}
    table{border-collapse:collapse;width:100%;}td,th{padding:8px 12px;border:1px solid #e5e7eb;font-size:12px;}
    @media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact;}}</style>
    </head><body>${content}</body></html>`);
    win.document.close(); win.focus(); setTimeout(() => win.print(), 400);
  };

  const fields = [
    ["Vendor","vendor"],["Series","series"],["Style","style"],["Category","category"],
    ["Pitch (in)","pitch_in"],["Pitch (mm)","pitch_mm"],["Open Area","open_area"],
    ["Hinge Style","hinge_style"],["Min Width (in)","min_width_in"],["Materials","materials"],
  ];

  return (
    <div style={{ position:"fixed",inset:0,background:"rgba(0,0,0,0.65)",zIndex:1500,
      display:"flex",alignItems:"center",justifyContent:"center",padding:16 }} onClick={onClose}>
      <div style={{ background:"#fff",borderRadius:16,width:"100%",maxWidth:900,maxHeight:"94vh",
        overflowY:"auto",display:"flex",flexDirection:"column" }} onClick={e=>e.stopPropagation()}>

        {/* Header */}
        <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",
          padding:"16px 24px",background:NAVY,borderRadius:"16px 16px 0 0" }}>
          <div>
            <div style={{ fontSize:16,fontWeight:800,color:"#fff" }}>⚖️ Belt Comparison</div>
            <div style={{ fontSize:11,color:"rgba(255,255,255,0.5)",marginTop:2 }}>
              {products.length} products selected
            </div>
          </div>
          <div style={{ display:"flex",gap:8 }}>
            <button onClick={handlePrint}
              style={{ padding:"7px 16px",background:"rgba(255,255,255,0.15)",color:"#fff",
                border:"1px solid rgba(255,255,255,0.3)",borderRadius:7,fontSize:12,fontWeight:700,cursor:"pointer" }}>
              🖨️ Print
            </button>
            <button onClick={onClose}
              style={{ padding:"7px 12px",background:"rgba(255,255,255,0.1)",border:"none",
                borderRadius:7,fontSize:14,cursor:"pointer",color:"rgba(255,255,255,0.7)" }}>✕</button>
          </div>
        </div>

        <div ref={printRef} style={{ padding:24 }}>
          {/* Uniking header for print */}
          <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",
            marginBottom:20,paddingBottom:12,borderBottom:`2px solid ${NAVY}` }}>
            <div style={{ display:"flex",alignItems:"baseline",gap:0 }}>
              <span style={{ fontSize:20,fontWeight:900,color:"#9ca3af",letterSpacing:-1,fontFamily:"'Arial Black',Arial,sans-serif" }}>UNI</span>
              <span style={{ fontSize:20,fontWeight:900,color:NAVY,letterSpacing:-1,fontFamily:"'Arial Black',Arial,sans-serif" }}>KING</span>
              <span style={{ fontSize:11,color:"#9ca3af",marginLeft:10,fontStyle:"italic" }}>Belt Comparison Sheet</span>
            </div>
            <div style={{ fontSize:10,color:"#9ca3af" }}>{new Date().toLocaleDateString("en-CA")} · Internal Use Only</div>
          </div>

          {/* Comparison table */}
          <div style={{ overflowX:"auto" }}>
            <table style={{ width:"100%", borderCollapse:"collapse" }}>
              <thead>
                <tr style={{ background:NAVY }}>
                  <th style={{ ...th, textAlign:"left", minWidth:130 }}>Specification</th>
                  {products.map(p => (
                    <th key={p.id} style={{ ...th, minWidth:160 }}>
                      <div style={{ fontWeight:800 }}>{p.series}</div>
                      <div style={{ fontSize:10, opacity:0.75, fontWeight:400, marginTop:2 }}>{p.style}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {fields.map(([label, key], ri) => (
                  <tr key={key} style={{ background: ri%2===0 ? "#fff" : "#f8fafc" }}>
                    <td style={{ ...td, fontWeight:700, color:"#6b7280", textTransform:"uppercase", fontSize:10, letterSpacing:0.4 }}>
                      {label}
                    </td>
                    {products.map(p => {
                      const val = p[key];
                      const isBest = key === "open_area" || key === "pitch_in";
                      return (
                        <td key={p.id} style={{ ...td, textAlign:"center", fontWeight:600, color:NAVY }}>
                          {val || <span style={{ color:"#d1d5db" }}>—</span>}
                        </td>
                      );
                    })}
                  </tr>
                ))}
                {/* Belt Data rows */}
                {products.some(p => p.belt_data) && (
                  <>
                    <tr style={{ background:"#eff6ff" }}>
                      <td colSpan={products.length+1} style={{ ...td, fontWeight:800, color:NAVY, fontSize:11, textTransform:"uppercase", letterSpacing:0.5 }}>
                        Belt Data
                      </td>
                    </tr>
                    {["Polypropylene","Polyethylene","Acetal","HSEC acetal","Acetala","Nylon","AR Nylon","PVDF"].map(mat => {
                      const hasAny = products.some(p => {
                        try { const bd = JSON.parse(p.belt_data||"[]"); return bd.some(r => r.material === mat); } catch{ return false; }
                      });
                      if (!hasAny) return null;
                      return (
                        <tr key={mat} style={{ background:"#fafbff" }}>
                          <td style={{ ...td, fontWeight:600, color:"#374151", fontSize:11, paddingLeft:20 }}>
                            {mat} <span style={{ fontSize:9, color:"#9ca3af" }}>(lbf/ft · °F · lb/ft²)</span>
                          </td>
                          {products.map(p => {
                            let row = null;
                            try { const bd = JSON.parse(p.belt_data||"[]"); row = bd.find(r => r.material === mat); } catch {}
                            return (
                              <td key={p.id} style={{ ...td, textAlign:"center", fontSize:11 }}>
                                {row
                                  ? <div>
                                      <div style={{ fontWeight:700, color:NAVY }}>{row.strength_lbf} lbf/ft</div>
                                      <div style={{ color:"#6b7280", fontSize:10 }}>{row.temp_min_f}–{row.temp_max_f}°F</div>
                                      <div style={{ color:"#9ca3af", fontSize:10 }}>{row.mass_lbft2} lb/ft²</div>
                                    </div>
                                  : <span style={{ color:"#e5e7eb" }}>—</span>
                                }
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </>
                )}
              </tbody>
            </table>
          </div>

          <div style={{ marginTop:20, fontSize:10, color:"#9ca3af", textAlign:"center" }}>
            Uniking Canada · 12985 Rue Brault, Mirabel, QC J7J 0W2 · logistics@unikingcanada.com · No pricing information
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Tear Sheet ─────────────────────────────────────────────────
function TearSheet({ product, onClose }) {
  const printRef = useRef();
  const handlePrint = () => {
    const content = printRef.current.innerHTML;
    const win = window.open("","_blank","width=900,height=700");
    win.document.write(`<!DOCTYPE html><html><head><title>Uniking — ${product.series} ${product.style}</title>
    <style>*{margin:0;padding:0;box-sizing:border-box;}body{font-family:Arial,sans-serif;background:#fff;}
    table{border-collapse:collapse;width:100%;}td,th{padding:6px 10px;border:1px solid #e5e7eb;font-size:11px;}
    @media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact;}}</style>
    </head><body>${content}</body></html>`);
    win.document.close(); win.focus(); setTimeout(()=>win.print(),400);
  };
  if (!product) return null;
  const catImg = CAT_IMGS[product.category];
  const materials = product.materials ? product.materials.split(",").map(m=>m.trim()) : [];
  let beltData = [];
  try { beltData = JSON.parse(product.belt_data || "[]"); } catch {}

  return (
    <div style={{ position:"fixed",inset:0,background:"rgba(0,0,0,0.6)",zIndex:2000,
      display:"flex",alignItems:"center",justifyContent:"center",padding:20 }} onClick={onClose}>
      <div style={{ background:"#fff",borderRadius:12,width:"100%",maxWidth:720,maxHeight:"92vh",overflowY:"auto" }}
        onClick={e=>e.stopPropagation()}>
        <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",padding:"14px 20px",borderBottom:"1px solid #e5e7eb" }}>
          <div style={{ fontSize:13,fontWeight:700,color:NAVY }}>📄 Product Tear Sheet — {product.series} {product.style}</div>
          <div style={{ display:"flex",gap:8 }}>
            <button onClick={handlePrint} style={{ padding:"7px 16px",background:NAVY,color:"#fff",border:"none",borderRadius:7,fontSize:12,fontWeight:700,cursor:"pointer" }}>🖨️ Print / Save PDF</button>
            <button onClick={onClose} style={{ padding:"7px 12px",background:"#f3f4f6",border:"none",borderRadius:7,fontSize:13,cursor:"pointer",color:"#6b7280" }}>✕</button>
          </div>
        </div>
        <div ref={printRef} style={{ fontFamily:"Arial,sans-serif" }}>
          {/* Header */}
          <div style={{ background:NAVY,padding:"18px 28px",display:"flex",alignItems:"center",justifyContent:"space-between" }}>
            <div>
              <div style={{ display:"flex",alignItems:"baseline" }}>
                <span style={{ fontSize:24,fontWeight:900,color:"#b0bec5",letterSpacing:-1,fontFamily:"'Arial Black',Arial,sans-serif" }}>UNI</span>
                <span style={{ fontSize:24,fontWeight:900,color:"#fff",letterSpacing:-1,fontFamily:"'Arial Black',Arial,sans-serif" }}>KING</span>
              </div>
              <div style={{ fontSize:9,color:"rgba(255,255,255,0.45)",letterSpacing:2,textTransform:"uppercase",marginTop:2 }}>UNITING THE STRONGEST LINKS</div>
            </div>
            <div style={{ textAlign:"right" }}>
              <div style={{ fontSize:10,color:"rgba(255,255,255,0.5)",textTransform:"uppercase",letterSpacing:1 }}>Product Data Sheet</div>
              <div style={{ fontSize:10,color:"rgba(255,255,255,0.35)",marginTop:2 }}>unikingcanada.com · Internal Use Only</div>
            </div>
          </div>
          {/* Hero row */}
          <div style={{ display:"flex",minHeight:160 }}>
            <div style={{ flex:1,padding:"18px 24px" }}>
              <div style={{ fontSize:10,color:"#9ca3af",textTransform:"uppercase",letterSpacing:1,marginBottom:6 }}>Product</div>
              <div style={{ fontSize:22,fontWeight:900,color:NAVY }}>{product.series}</div>
              <div style={{ fontSize:15,fontWeight:600,color:"#6b7280",marginTop:2 }}>{product.style}</div>
              <div style={{ display:"flex",gap:8,flexWrap:"wrap",marginTop:12 }}>
                {product.pitch_in && <span style={{ padding:"3px 8px",background:"#eff6ff",color:"#1e40af",borderRadius:5,fontSize:11,fontWeight:600 }}>{product.pitch_in}" pitch</span>}
                {product.open_area && product.open_area!=="0%" && <span style={{ padding:"3px 8px",background:"#fef9c3",color:"#854d0e",borderRadius:5,fontSize:11,fontWeight:600 }}>{product.open_area} open</span>}
                {product.hinge_style && <span style={{ padding:"3px 8px",background:"#f3f4f6",color:"#374151",borderRadius:5,fontSize:11,fontWeight:600 }}>{product.hinge_style} hinge</span>}
              </div>

            </div>
            {catImg && (
              <div style={{ width:220,flexShrink:0,overflow:"hidden" }}>
                <img src={catImg} alt={product.category} style={{ width:"100%",height:"100%",objectFit:"cover" }} />
              </div>
            )}
          </div>
          {/* Specs table */}
          <div style={{ padding:"0 24px 16px" }}>
            <div style={{ fontSize:11,fontWeight:700,color:NAVY,textTransform:"uppercase",letterSpacing:1,marginBottom:10,paddingBottom:6,borderBottom:`2px solid ${NAVY}` }}>Specifications</div>
            <table style={{ width:"100%",borderCollapse:"collapse",fontSize:12 }}>
              <tbody>
                {[["Pitch","in","mm"],[null,"in","mm"]].filter(()=>false).concat(
                  [["Pitch",`${product.pitch_in}"`,`${product.pitch_mm} mm`],
                   ["Minimum Width",`${product.min_width_in}"`,"-"],
                   ["Open Area",product.open_area||"-","-"],
                   ["Hinge Style",product.hinge_style||"-","-"],
                   ["Category",product.category||"-","-"],
                  ]
                ).map(([l,v1,v2],i)=>(
                  <tr key={l} style={{ background:i%2===0?"#f8fafc":"#fff" }}>
                    <td style={{ padding:"6px 10px",fontWeight:600,color:"#6b7280",width:"35%",borderBottom:"1px solid #f1f5f9" }}>{l}</td>
                    <td style={{ padding:"6px 10px",fontWeight:700,color:NAVY,borderBottom:"1px solid #f1f5f9" }}>{v1}</td>
                    <td style={{ padding:"6px 10px",color:"#9ca3af",borderBottom:"1px solid #f1f5f9" }}>{v2 !== "-" ? v2 : ""}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Notes */}
          {product.notes && (
            <div style={{ padding:"0 24px 16px" }}>
              <div style={{ fontSize:11,fontWeight:700,color:NAVY,textTransform:"uppercase",letterSpacing:1,marginBottom:8,paddingBottom:6,borderBottom:`2px solid ${NAVY}` }}>Product Notes</div>
              <div style={{ fontSize:12,color:"#374151",lineHeight:1.7 }}>{product.notes}</div>
            </div>
          )}
          {/* Belt Data */}
          {beltData.length > 0 && (
            <div style={{ padding:"0 24px 16px" }}>
              <div style={{ fontSize:11,fontWeight:700,color:NAVY,textTransform:"uppercase",letterSpacing:1,marginBottom:10,paddingBottom:6,borderBottom:`2px solid ${NAVY}` }}>Belt Data</div>
              <table style={{ width:"100%",borderCollapse:"collapse",fontSize:11 }}>
                <thead>
                  <tr style={{ background:NAVY }}>
                    <th style={{ ...th,textAlign:"left" }}>Belt Material</th>
                    <th style={{ ...th }}>Rod Material</th>
                    <th style={{ ...th }}>lbf/ft</th>
                    <th style={{ ...th }}>N/m</th>
                    <th style={{ ...th }}>Temp °F</th>
                    <th style={{ ...th }}>Temp °C</th>
                    <th style={{ ...th }}>lb/ft²</th>
                    <th style={{ ...th }}>kg/m²</th>
                  </tr>
                </thead>
                <tbody>
                  {beltData.map((row,i)=>(
                    <tr key={i} style={{ background:i%2===0?"#fff":"#f8fafc" }}>
                      <td style={{ ...td,fontWeight:700,color:NAVY }}>{row.material}</td>
                      <td style={{ ...td,textAlign:"center" }}>{row.rod_material}</td>
                      <td style={{ ...td,textAlign:"center",fontWeight:600 }}>{row.strength_lbf}</td>
                      <td style={{ ...td,textAlign:"center",fontWeight:600 }}>{row.strength_nm}</td>
                      <td style={{ ...td,textAlign:"center" }}>{row.temp_min_f} to {row.temp_max_f}</td>
                      <td style={{ ...td,textAlign:"center" }}>{row.temp_min_c} to {row.temp_max_c}</td>
                      <td style={{ ...td,textAlign:"center" }}>{row.mass_lbft2}</td>
                      <td style={{ ...td,textAlign:"center" }}>{row.mass_kgm2}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {beltData.some(r=>r.footnote) && (
                <div style={{ fontSize:10,color:"#6b7280",fontStyle:"italic",marginTop:6 }}>
                  {beltData.filter(r=>r.footnote).map((r,i)=><div key={i}>ᵃ {r.footnote}</div>)}
                </div>
              )}
            </div>
          )}
          {/* Resources */}
          <div style={{ padding:"0 24px 20px" }}>
            <div style={{ fontSize:11,fontWeight:700,color:NAVY,textTransform:"uppercase",letterSpacing:1,marginBottom:10,paddingBottom:6,borderBottom:`2px solid ${NAVY}` }}>Resources</div>
            <div style={{ display:"flex",gap:12 }}>
              <div style={{ flex:1,padding:"10px 14px",background:product.tech_doc_url?NAVY:"#f3f4f6",color:product.tech_doc_url?"#fff":"#9ca3af",borderRadius:7,fontSize:12,fontWeight:600,textAlign:"center" }}>
                📄 {product.tech_doc_url?"Technical Document":"Tech Doc — Coming Soon"}
              </div>
              <div style={{ flex:1,padding:"10px 14px",background:product.cad_url?"#166534":"#f3f4f6",color:product.cad_url?"#fff":"#9ca3af",borderRadius:7,fontSize:12,fontWeight:600,textAlign:"center" }}>
                📐 {product.cad_url?"CAD Drawing":"CAD — Coming Soon"}
              </div>
            </div>
          </div>
          <div style={{ background:"#f8fafc",borderTop:"2px solid #e2e8f0",padding:"10px 24px",display:"flex",justifyContent:"space-between",alignItems:"center" }}>
            <div style={{ fontSize:10,color:"#94a3b8" }}>Uniking Canada · 12985 Rue Brault, Mirabel, QC J7J 0W2</div>
            <div style={{ fontSize:10,color:"#94a3b8" }}>{new Date().toLocaleDateString("en-CA")} · Internal Use Only · No Pricing</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Product Detail Modal ────────────────────────────────────────
function ProductModal({ product, onClose, onTearSheet, allProducts, compareList, onToggleCompare }) {
  const [tab, setTab] = useState("specs");
  if (!product) return null;

  const catImg = CAT_IMGS[product.category];
  const imgSrc = product.image_url || catImg;
  const materials = product.materials ? product.materials.split(",").map(m=>m.trim()) : [];
  let beltData = [];
  try { beltData = JSON.parse(product.belt_data || "[]"); } catch {}
  const inCompare = compareList.includes(product.id);
  const compareDisabled = !inCompare && compareList.length >= 4;

  const TABS = [
    ["specs","📐 Specs"],
    ["materials",`🧪 Materials (${materials.length})`],
    ...(beltData.length ? [["beltdata","📊 Belt Data"]] : []),
    ["resources","📁 Resources"],
  ];

  return (
    <div style={{ position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",zIndex:1000,
      display:"flex",alignItems:"center",justifyContent:"center",padding:16 }} onClick={onClose}>
      <div style={{ background:"#fff",borderRadius:16,width:"100%",maxWidth:640,maxHeight:"94vh",
        overflowY:"auto",display:"flex",flexDirection:"column" }} onClick={e=>e.stopPropagation()}>

        {/* Image hero */}
        <div style={{ height:230,position:"relative",borderRadius:"16px 16px 0 0",overflow:"hidden",flexShrink:0 }}>
          <ProductImage src={imgSrc} alt={product.series} style={{ width:"100%",height:"100%" }} />
          <div style={{ position:"absolute",inset:0,background:"linear-gradient(to top,rgba(10,20,40,0.92) 0%,rgba(10,20,40,0.04) 60%)" }} />
          <button onClick={onClose} style={{ position:"absolute",top:12,right:12,background:"rgba(0,0,0,0.45)",
            border:"none",borderRadius:"50%",width:34,height:34,cursor:"pointer",color:"#fff",
            fontSize:16,display:"flex",alignItems:"center",justifyContent:"center" }}>✕</button>

          {/* Vendor logo */}
          <div style={{ position:"absolute",top:14,left:16,background:"rgba(255,255,255,0.95)",
            borderRadius:8,padding:"5px 10px",display:"flex",alignItems:"center" }}>
            <VendorLogo vendor={product.vendor} height={22} />
          </div>

          {/* Compare button */}
          <button
            onClick={() => !compareDisabled && onToggleCompare(product.id)}
            disabled={compareDisabled}
            style={{ position:"absolute",top:14,right:56,
              background: inCompare ? "#10b981" : "rgba(255,255,255,0.9)",
              color: inCompare ? "#fff" : compareDisabled ? "#d1d5db" : NAVY,
              border:"none",borderRadius:7,padding:"5px 11px",fontSize:11,fontWeight:700,
              cursor:compareDisabled?"not-allowed":"pointer",display:"flex",alignItems:"center",gap:4 }}>
            {inCompare ? "✓ Added" : compareDisabled ? "⚖️ Max 4" : "⚖️ Compare"}
          </button>

          <div style={{ position:"absolute",bottom:16,left:18,right:18 }}>
            <div style={{ fontSize:23,fontWeight:800,color:"#fff",lineHeight:1.1 }}>{product.series}</div>
            <div style={{ fontSize:14,color:"rgba(255,255,255,0.8)",marginTop:4 }}>{product.style}</div>
          </div>
        </div>

        {/* Quick badges */}
        <div style={{ display:"flex",gap:7,flexWrap:"wrap",padding:"14px 20px 0" }}>
          {product.category && <Badge label={`${CAT_ICONS[product.category]||""} ${product.category}`.trim()} color="#f5f3ff" textColor="#6d28d9" />}
          {product.pitch_in && <Badge label={`${product.pitch_in}" pitch`} color="#f0fdf4" textColor="#166534" />}
          {product.open_area && product.open_area!=="0%" && <Badge label={`${product.open_area} open area`} color="#fef9c3" textColor="#854d0e" />}
          {product.hinge_style && <Badge label={`${product.hinge_style} hinge`} color="#f3f4f6" textColor="#4b5563" />}
        </div>

        {/* Notes */}
        {product.notes && (
          <div style={{ margin:"12px 20px 0",fontSize:13,color:"#374151",lineHeight:1.65,
            padding:"10px 14px",background:"#f8fafc",borderRadius:8,borderLeft:`3px solid ${NAVY}` }}>
            {product.notes}
          </div>
        )}

        {/* Tabs */}
        <div style={{ display:"flex",borderBottom:"2px solid #f3f4f6",margin:"14px 20px 0",gap:0,overflowX:"auto" }}>
          {TABS.map(([id,label])=>(
            <button key={id} onClick={()=>setTab(id)} style={{ padding:"9px 15px",border:"none",background:"none",cursor:"pointer",
              fontSize:12,fontWeight:700,color:tab===id?NAVY:"#9ca3af",whiteSpace:"nowrap",
              borderBottom:tab===id?`2px solid ${NAVY}`:"2px solid transparent",
              marginBottom:-2,transition:"color 0.15s" }}>{label}</button>
          ))}
        </div>

        {/* Tab body */}
        <div style={{ padding:"16px 20px",flex:1 }}>
          {tab==="specs" && (
            <div style={{ display:"flex",flexDirection:"column",gap:10 }}>
              <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:8 }}>
                {[["Series",product.series],["Belt Style",product.style],
                  ["Pitch","pitch_in" in product ? `${product.pitch_in}" / ${product.pitch_mm}mm` : "-"],
                  ["Open Area",product.open_area||"-"],
                  ["Hinge Style",product.hinge_style||"-"],
                  ["Min Width",product.min_width_in?`${product.min_width_in}"`:"-"],
                  ["Category",product.category||"-"],
                  ["Vendor",product.vendor||"-"],
                ].map(([l,v])=>(
                  <div key={l} style={{ padding:"10px 12px",background:"#f8fafc",borderRadius:8,border:"1px solid #f1f5f9" }}>
                    <div style={{ fontSize:10,fontWeight:700,color:"#9ca3af",textTransform:"uppercase",letterSpacing:0.5,marginBottom:4 }}>{l}</div>
                    <div style={{ fontSize:13,color:NAVY,fontWeight:700 }}>{v}</div>
                  </div>
                ))}
              </div>
              {product.page_range && (
                <div style={{ display:"flex",alignItems:"center",gap:8,padding:"8px 12px",background:"#f0fdf4",borderRadius:8 }}>
                  <span style={{ fontSize:11,color:"#166534",fontWeight:600 }}>📄 Manual Pages:</span>
                  <span style={{ fontSize:13,color:"#166534",fontWeight:800 }}>pp. {product.page_range}</span>
                </div>
              )}
            </div>
          )}

          {tab==="materials" && <MaterialsChart materials={materials} />}

          {tab==="beltdata" && <BeltDataChart beltData={beltData} />}

          {tab==="resources" && (
            <div style={{ display:"flex",flexDirection:"column",gap:10 }}>
              {product.tech_doc_url
                ? <a href={product.tech_doc_url} target="_blank" rel="noreferrer" style={{ display:"flex",alignItems:"center",gap:14,padding:"14px 16px",background:NAVY,color:"#fff",borderRadius:10,textDecoration:"none" }}>
                    <span style={{ fontSize:22 }}>📄</span>
                    <div><div style={{ fontSize:13,fontWeight:700 }}>Technical Document</div><div style={{ fontSize:11,color:"rgba(255,255,255,0.6)",marginTop:2 }}>Engineering specs, dimensions, installation guidance</div></div>
                    <span style={{ marginLeft:"auto",fontSize:12,opacity:0.7 }}>↗</span>
                  </a>
                : <div style={{ display:"flex",alignItems:"center",gap:14,padding:"14px 16px",background:"#f3f4f6",borderRadius:10 }}>
                    <span style={{ fontSize:22,opacity:0.35 }}>📄</span>
                    <div><div style={{ fontSize:13,fontWeight:700,color:"#9ca3af" }}>Technical Document</div><div style={{ fontSize:11,color:"#9ca3af",marginTop:2 }}>Coming soon — contact Uniking</div></div>
                  </div>
              }
              {product.cad_url
                ? <a href={product.cad_url} target="_blank" rel="noreferrer" style={{ display:"flex",alignItems:"center",gap:14,padding:"14px 16px",background:"#166534",color:"#fff",borderRadius:10,textDecoration:"none" }}>
                    <span style={{ fontSize:22 }}>📐</span>
                    <div><div style={{ fontSize:13,fontWeight:700 }}>CAD Drawing</div><div style={{ fontSize:11,color:"rgba(255,255,255,0.6)",marginTop:2 }}>2D/3D files for engineering and design</div></div>
                    <span style={{ marginLeft:"auto",fontSize:12,opacity:0.7 }}>↗</span>
                  </a>
                : <div style={{ display:"flex",alignItems:"center",gap:14,padding:"14px 16px",background:"#f3f4f6",borderRadius:10 }}>
                    <span style={{ fontSize:22,opacity:0.35 }}>📐</span>
                    <div><div style={{ fontSize:13,fontWeight:700,color:"#9ca3af" }}>CAD Drawing</div><div style={{ fontSize:11,color:"#9ca3af",marginTop:2 }}>Coming soon — contact Uniking</div></div>
                  </div>
              }
              {product.vendor==="Intralox" && (
                <a href="https://www.intralox.com/belt-finder" target="_blank" rel="noreferrer"
                  style={{ display:"flex",alignItems:"center",gap:14,padding:"14px 16px",
                    background:"#fff0f0",color:INTRALOX_RED,borderRadius:10,textDecoration:"none",border:`1px solid ${INTRALOX_RED}33` }}>
                  <span style={{ fontSize:22 }}>🌐</span>
                  <div>
                    <div style={{ fontSize:13,fontWeight:700 }}>Intralox Belt Finder</div>
                    <div style={{ fontSize:11,color:INTRALOX_RED+"aa",marginTop:2 }}>intralox.com — find compatible sprockets & accessories</div>
                  </div>
                  <span style={{ marginLeft:"auto",fontSize:12,opacity:0.6 }}>↗</span>
                </a>
              )}
            </div>
          )}
        </div>

        {/* Related Products */}
        <RelatedProducts
          related={product.related_products}
          allProducts={allProducts}
          onNavigate={(relProd) => { onClose(); setTimeout(() => onClose(), 0); }}
        />

        {/* Tear Sheet button */}
        <div style={{ padding:"14px 20px",borderTop:"1px solid #f1f5f9",display:"flex",gap:8 }}>
          <button onClick={() => onTearSheet(product)}
            style={{ flex:1,padding:"10px",background:NAVY,color:"#fff",border:"none",borderRadius:8,
              fontSize:13,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:6 }}>
            📄 Generate Tear Sheet
          </button>
          <button
            onClick={() => onToggleCompare(product.id)}
            disabled={compareDisabled && !inCompare}
            style={{ padding:"10px 16px",background: inCompare?"#10b981":"#f3f4f6",
              color:inCompare?"#fff":compareDisabled?"#d1d5db":NAVY,
              border:"none",borderRadius:8,fontSize:13,fontWeight:700,cursor:compareDisabled&&!inCompare?"not-allowed":"pointer" }}>
            {inCompare ? "✓ In Compare" : "⚖️ Add to Compare"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Product Card ────────────────────────────────────────────────
function ProductCard({ product, onClick, inCompare, onToggleCompare, compareDisabled }) {
  const catImg = CAT_IMGS[product.category];
  const imgSrc = product.image_url || catImg;
  const materials = product.materials ? product.materials.split(",").map(m=>m.trim()) : [];
  let hasBeltData = false;
  try { hasBeltData = JSON.parse(product.belt_data||"[]").length > 0; } catch {}

  return (
    <div onClick={onClick} style={{ background:"#fff",borderRadius:14,boxShadow:"0 2px 12px rgba(0,0,0,0.07)",
      cursor:"pointer",overflow:"hidden",display:"flex",flexDirection:"column",
      border:"1px solid #e5e7eb",transition:"transform 0.15s,box-shadow 0.15s" }}
      onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-2px)";e.currentTarget.style.boxShadow="0 6px 20px rgba(0,0,0,0.12)"}}
      onMouseLeave={e=>{e.currentTarget.style.transform="none";e.currentTarget.style.boxShadow="0 2px 12px rgba(0,0,0,0.07)"}}>

      {/* Image */}
      <div style={{ height:130,position:"relative",overflow:"hidden",flexShrink:0 }}>
        <ProductImage src={imgSrc} alt={product.series} style={{ width:"100%",height:"100%" }} />
        <div style={{ position:"absolute",inset:0,background:"linear-gradient(to top,rgba(10,20,40,0.7) 0%,transparent 55%)" }} />

        {/* Vendor logo top-left */}
        <div style={{ position:"absolute",top:8,left:8,background:"rgba(255,255,255,0.94)",
          borderRadius:6,padding:"3px 8px",display:"flex",alignItems:"center" }}>
          <VendorLogo vendor={product.vendor} height={16} />
        </div>

        {/* Compare checkbox top-right */}
        <button onClick={e=>{e.stopPropagation();!compareDisabled&&onToggleCompare(product.id)}}
          style={{ position:"absolute",top:8,right:8,
            background:inCompare?"#10b981":"rgba(255,255,255,0.85)",
            border:"none",borderRadius:5,width:26,height:26,cursor:compareDisabled&&!inCompare?"not-allowed":"pointer",
            display:"flex",alignItems:"center",justifyContent:"center",fontSize:13 }}>
          {inCompare ? "✓" : "⊞"}
        </button>

        {/* Belt data indicator */}
        {hasBeltData && (
          <div style={{ position:"absolute",bottom:8,right:8,background:"rgba(0,0,0,0.55)",
            borderRadius:4,padding:"2px 6px",fontSize:9,color:"#fff",fontWeight:700 }}>
            📊 Data
          </div>
        )}

        <div style={{ position:"absolute",bottom:8,left:8 }}>
          <div style={{ fontSize:14,fontWeight:800,color:"#fff",lineHeight:1.1 }}>{product.series}</div>
        </div>
      </div>

      {/* Body */}
      <div style={{ padding:"12px 14px",flex:1,display:"flex",flexDirection:"column",gap:6 }}>
        <div style={{ fontSize:13,fontWeight:700,color:NAVY }}>{product.style}</div>
        <div style={{ display:"flex",gap:5,flexWrap:"wrap" }}>
          {product.pitch_in && <Badge label={`${product.pitch_in}"`} color="#f0fdf4" textColor="#166534" small />}
          {product.open_area && product.open_area!=="0%" && <Badge label={product.open_area} color="#fef9c3" textColor="#854d0e" small />}
          {product.hinge_style && <Badge label={product.hinge_style} color="#f3f4f6" textColor="#4b5563" small />}
        </div>
        {materials.length > 0 && (
          <div style={{ display:"flex",gap:4,flexWrap:"wrap",marginTop:2 }}>
            {materials.slice(0,4).map(m=>{
              const info = getMI(m);
              return <span key={m} style={{ fontSize:9,fontWeight:700,padding:"1px 5px",borderRadius:3,
                background:info.color,color:info.text }}>{info.abbr}</span>;
            })}
            {materials.length > 4 && <span style={{ fontSize:9,color:"#9ca3af" }}>+{materials.length-4}</span>}
          </div>
        )}
      </div>

      <div style={{ padding:"8px 14px",borderTop:"1px solid #f3f4f6",display:"flex",alignItems:"center",justifyContent:"space-between" }}>
        <span style={{ fontSize:10,color:"#9ca3af" }}>
          {CAT_ICONS[product.category]||""} {product.category}
        </span>
        <span style={{ fontSize:11,color:NAVY,fontWeight:700 }}>View →</span>
      </div>
    </div>
  );
}

// ── Main App ────────────────────────────────────────────────────
export default function App() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("All");
  const [filterVendor, setFilterVendor] = useState("All");
  const [filterStyle, setFilterStyle] = useState("All");
  const [selected, setSelected] = useState(null);
  const [tearSheet, setTearSheet] = useState(null);
  const [compareList, setCompareList] = useState([]);
  const [showCompare, setShowCompare] = useState(false);
  const [navigateTo, setNavigateTo] = useState(null);

  useEffect(() => {
    CatalogProduct.list().then(data => {
      setProducts(data.sort((a,b) => (a.series_number||0) - (b.series_number||0)));
      setLoading(false);
    });
  }, []);

  // Handle navigate-to from related products
  useEffect(() => {
    if (navigateTo) {
      setSelected(navigateTo);
      setNavigateTo(null);
    }
  }, [navigateTo]);

  const categories = useMemo(() => ["All", ...new Set(products.map(p=>p.category).filter(Boolean))], [products]);
  const vendors = useMemo(() => ["All", ...new Set(products.map(p=>p.vendor).filter(Boolean))], [products]);
  const styles = useMemo(() => ["All", ...new Set(products.map(p=>p.style).filter(Boolean))], [products]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return products.filter(p => {
      if (filterCat !== "All" && p.category !== filterCat) return false;
      if (filterVendor !== "All" && p.vendor !== filterVendor) return false;
      if (filterStyle !== "All" && p.style !== filterStyle) return false;
      if (!q) return true;
      return (p.series||"").toLowerCase().includes(q)
        || (p.style||"").toLowerCase().includes(q)
        || (p.materials||"").toLowerCase().includes(q)
        || (p.search_tags||"").toLowerCase().includes(q)
        || (p.notes||"").toLowerCase().includes(q)
        || String(p.series_number||"").includes(q);
    });
  }, [products, search, filterCat, filterVendor, filterStyle]);

  const toggleCompare = (id) => {
    setCompareList(prev => prev.includes(id) ? prev.filter(x=>x!==id) : [...prev, id].slice(0,4));
  };

  const selSt = { padding:"7px 12px",borderRadius:8,border:"1px solid #e5e7eb",fontSize:13,background:"#fff",color:NAVY,fontWeight:600,cursor:"pointer" };

  return (
    <div style={{ minHeight:"100vh",background:"#f1f5f9",fontFamily:"system-ui,Arial,sans-serif" }}>

      {/* Header */}
      <div style={{ background:NAVY,color:"#fff",padding:"0",position:"sticky",top:0,zIndex:500,boxShadow:"0 2px 12px rgba(0,0,0,0.2)" }}>
        <div style={{ maxWidth:1280,margin:"0 auto",padding:"14px 24px",display:"flex",alignItems:"center",gap:20,flexWrap:"wrap" }}>
          <div style={{ display:"flex",flexDirection:"column",flexShrink:0 }}>
            <UniKingLogo size={24} />
            <div style={{ fontSize:9,color:"rgba(255,255,255,0.4)",letterSpacing:2,textTransform:"uppercase",marginTop:2 }}>PRODUCT CATALOG</div>
          </div>
          <div style={{ flex:1,minWidth:200 }}>
            <input
              value={search} onChange={e=>setSearch(e.target.value)}
              placeholder="Search belts, series, materials, style…"
              style={{ width:"100%",padding:"9px 16px",borderRadius:9,border:"none",fontSize:14,
                outline:"none",background:"rgba(255,255,255,0.12)",color:"#fff",boxSizing:"border-box" }}
            />
          </div>
          <div style={{ fontSize:13,color:"rgba(255,255,255,0.5)",whiteSpace:"nowrap" }}>
            {filtered.length} of {products.length} products
          </div>
          {compareList.length > 0 && (
            <button onClick={()=>setShowCompare(true)}
              style={{ padding:"7px 14px",background:"#10b981",color:"#fff",border:"none",borderRadius:7,fontSize:12,fontWeight:700,cursor:"pointer",whiteSpace:"nowrap" }}>
              ⚖️ Compare ({compareList.length})
            </button>
          )}
        </div>

        {/* Filters */}
        <div style={{ borderTop:"1px solid rgba(255,255,255,0.1)",padding:"10px 24px",maxWidth:1280,margin:"0 auto",display:"flex",gap:10,flexWrap:"wrap",alignItems:"center" }}>
          <span style={{ fontSize:11,color:"rgba(255,255,255,0.45)",fontWeight:600,textTransform:"uppercase",letterSpacing:1 }}>Filter:</span>
          <select value={filterCat} onChange={e=>setFilterCat(e.target.value)} style={selSt}>
            {categories.map(c=><option key={c}>{c}</option>)}
          </select>
          <select value={filterVendor} onChange={e=>setFilterVendor(e.target.value)} style={selSt}>
            {vendors.map(v=><option key={v}>{v}</option>)}
          </select>
          <select value={filterStyle} onChange={e=>setFilterStyle(e.target.value)} style={selSt}>
            {styles.map(s=><option key={s}>{s}</option>)}
          </select>
          {(filterCat!=="All"||filterVendor!=="All"||filterStyle!=="All"||search) && (
            <button onClick={()=>{setFilterCat("All");setFilterVendor("All");setFilterStyle("All");setSearch("");}}
              style={{ padding:"7px 12px",background:"rgba(255,255,255,0.1)",color:"rgba(255,255,255,0.7)",border:"1px solid rgba(255,255,255,0.2)",borderRadius:7,fontSize:12,cursor:"pointer" }}>
              Clear ×
            </button>
          )}
        </div>
      </div>

      {/* Grid */}
      <div style={{ maxWidth:1280,margin:"0 auto",padding:"24px" }}>
        {loading ? (
          <div style={{ textAlign:"center",padding:80,color:"#9ca3af",fontSize:16 }}>Loading catalog…</div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign:"center",padding:80 }}>
            <div style={{ fontSize:40,marginBottom:12 }}>🔍</div>
            <div style={{ fontSize:16,color:"#6b7280",fontWeight:600 }}>No products found</div>
            <div style={{ fontSize:13,color:"#9ca3af",marginTop:6 }}>Try adjusting your search or filters</div>
          </div>
        ) : (
          <>
            {/* Category groups */}
            {(filterCat==="All" ? [...new Set(filtered.map(p=>p.category))] : [filterCat]).map(cat => {
              const group = filtered.filter(p=>p.category===cat);
              if (!group.length) return null;
              return (
                <div key={cat} style={{ marginBottom:36 }}>
                  <div style={{ display:"flex",alignItems:"center",gap:10,marginBottom:16 }}>
                    <div style={{ fontSize:18 }}>{CAT_ICONS[cat]||"📦"}</div>
                    <div style={{ fontSize:16,fontWeight:800,color:NAVY }}>{cat}</div>
                    <div style={{ fontSize:12,color:"#9ca3af",fontWeight:500 }}>({group.length} products)</div>
                    <div style={{ flex:1,height:1,background:"#e5e7eb",marginLeft:8 }} />
                  </div>
                  <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))",gap:16 }}>
                    {group.map(p=>(
                      <ProductCard
                        key={p.id}
                        product={p}
                        onClick={()=>setSelected(p)}
                        inCompare={compareList.includes(p.id)}
                        onToggleCompare={toggleCompare}
                        compareDisabled={!compareList.includes(p.id) && compareList.length>=4}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </>
        )}
      </div>

      {/* Modals */}
      {selected && (
        <ProductModal
          product={selected}
          onClose={()=>setSelected(null)}
          onTearSheet={p=>{setSelected(null);setTearSheet(p);}}
          allProducts={products}
          compareList={compareList}
          onToggleCompare={toggleCompare}
        />
      )}
      {tearSheet && <TearSheet product={tearSheet} onClose={()=>setTearSheet(null)} />}
      {showCompare && (
        <CompareSheet
          compareList={compareList}
          allProducts={products}
          onClose={()=>setShowCompare(false)}
        />
      )}

      {/* Compare Tray */}
      <CompareTray
        compareList={compareList}
        allProducts={products}
        onRemove={id=>setCompareList(prev=>prev.filter(x=>x!==id))}
        onClear={()=>setCompareList([])}
        onCompare={()=>setShowCompare(true)}
      />
    </div>
  );
}
