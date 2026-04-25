import { useState, useEffect, useMemo, useRef } from "react";
import { CatalogProduct } from "@/api/entities";

const NAVY = "#1a3a5c";
const SILVER = "#9ca3af";

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
};

const getMI = (mat) => {
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
const VENDOR_COLORS = {
  Intralox: { bg: "#fee2e2", text: "#991b1b" },
  Movex:    { bg: "#fef3c7", text: "#92400e" },
  Rollepaal:{ bg: "#f0fdf4", text: "#166534" },
};

// ── Intralox official wordmark ──────────────────────────────────
function IntraloxLogo({ height = 22 }) {
  return (
    <svg height={height} viewBox="0 0 160 36" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display:"block" }}>
      <text x="0" y="28" fontFamily="Arial Black,Arial,sans-serif" fontWeight="900" fontSize="28" fill="#3d3d3d" letterSpacing="-0.5">INTRA</text>
      <text x="96" y="28" fontFamily="Arial Black,Arial,sans-serif" fontWeight="900" fontSize="28" fill="#c8102e" letterSpacing="-0.5">LOX</text>
    </svg>
  );
}

function VendorLogo({ vendor, height = 20 }) {
  if (vendor === "Intralox") return <IntraloxLogo height={height} />;
  const vc = VENDOR_COLORS[vendor] || { bg: "#f3f4f6", text: "#374151" };
  return <span style={{ padding:"3px 8px", background:vc.bg, color:vc.text, fontWeight:800, fontSize:height*0.55, borderRadius:5 }}>{vendor}</span>;
}

function Badge({ label, color="#e5e7eb", textColor="#374151", small }) {
  return (
    <span style={{ display:"inline-block", padding:small?"1px 6px":"2px 8px", borderRadius:99,
      background:color, color:textColor, fontSize:small?10:11, fontWeight:600, letterSpacing:0.3, whiteSpace:"nowrap" }}>
      {label}
    </span>
  );
}

function UniKingLogo({ size=28 }) {
  return (
    <div style={{ display:"flex", alignItems:"center", lineHeight:1 }}>
      <span style={{ fontSize:size, fontWeight:900, color:SILVER, letterSpacing:-1, fontFamily:"Arial Black,Arial,sans-serif" }}>UNI</span>
      <span style={{ fontSize:size, fontWeight:900, color:"#fff", letterSpacing:-1, fontFamily:"Arial Black,Arial,sans-serif" }}>KING</span>
    </div>
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
      <span style={{ fontSize:10, textAlign:"center", padding:"0 8px" }}>No Image Available</span>
    </div>
  );
  return <img src={src} alt={alt} onError={()=>setErr(true)} style={{ ...style, objectFit:"cover" }} />;
}

// ── Materials combo chart ───────────────────────────────────────
function MaterialsChart({ materials }) {
  if (!materials.length) return <div style={{ color:"#9ca3af",fontSize:13,textAlign:"center",padding:32 }}>No material data for this product.</div>;
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
      {materials.map((mat, i) => {
        const info = getMI(mat);
        return (
          <div key={mat} style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 12px",
            borderRadius:8, background:info.color, border:`1px solid ${info.text}22` }}>
            <div style={{ minWidth:34, height:34, borderRadius:6, background:info.text, color:"#fff",
              display:"flex", alignItems:"center", justifyContent:"center",
              fontSize:10, fontWeight:800, letterSpacing:0.5, flexShrink:0 }}>{info.abbr}</div>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:13, fontWeight:700, color:info.text }}>{mat}</div>
              <div style={{ fontSize:11, color:info.text+"99", lineHeight:1.35, marginTop:2 }}>{info.note}</div>
            </div>
            <div style={{ fontSize:10, fontWeight:600, color:info.text+"77",
              padding:"2px 6px", background:info.text+"11", borderRadius:4 }}>Option {i+1}</div>
          </div>
        );
      })}
      <div style={{ fontSize:10, color:"#9ca3af", fontStyle:"italic", marginTop:4 }}>
        All materials FDA compliant unless noted. Contact Uniking for material selection guidance.
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
    @media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact;}}</style>
    </head><body>${content}</body></html>`);
    win.document.close(); win.focus(); setTimeout(()=>win.print(),400);
  };
  if (!product) return null;
  const catImg = CAT_IMGS[product.category];
  const materials = product.materials ? product.materials.split(",").map(m=>m.trim()) : [];

  return (
    <div style={{ position:"fixed",inset:0,background:"rgba(0,0,0,0.6)",zIndex:2000,
      display:"flex",alignItems:"center",justifyContent:"center",padding:20 }} onClick={onClose}>
      <div style={{ background:"#fff",borderRadius:12,width:"100%",maxWidth:700,maxHeight:"92vh",overflowY:"auto" }}
        onClick={e=>e.stopPropagation()}>
        {/* Action bar */}
        <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",padding:"14px 20px",borderBottom:"1px solid #e5e7eb" }}>
          <div style={{ fontSize:13,fontWeight:700,color:NAVY }}>📄 Product Tear Sheet</div>
          <div style={{ display:"flex",gap:8 }}>
            <button onClick={handlePrint} style={{ padding:"7px 16px",background:NAVY,color:"#fff",border:"none",borderRadius:7,fontSize:12,fontWeight:700,cursor:"pointer" }}>🖨️ Print / Save PDF</button>
            <button onClick={onClose} style={{ padding:"7px 12px",background:"#f3f4f6",border:"none",borderRadius:7,fontSize:13,cursor:"pointer",color:"#6b7280" }}>✕</button>
          </div>
        </div>
        {/* Print content */}
        <div ref={printRef} style={{ fontFamily:"Arial,sans-serif" }}>
          {/* Header */}
          <div style={{ background:NAVY,padding:"20px 28px",display:"flex",alignItems:"center",justifyContent:"space-between" }}>
            <div>
              <div style={{ display:"flex",alignItems:"baseline",marginBottom:2 }}>
                <span style={{ fontSize:26,fontWeight:900,color:"#b0bec5",letterSpacing:-1,fontFamily:"Arial Black,Arial,sans-serif" }}>UNI</span>
                <span style={{ fontSize:26,fontWeight:900,color:"#fff",letterSpacing:-1,fontFamily:"Arial Black,Arial,sans-serif" }}>KING</span>
              </div>
              <div style={{ fontSize:9,color:"rgba(255,255,255,0.5)",letterSpacing:2,textTransform:"uppercase" }}>UNITING THE STRONGEST LINKS</div>
            </div>
            <div style={{ textAlign:"right" }}>
              <div style={{ fontSize:10,color:"rgba(255,255,255,0.5)",textTransform:"uppercase",letterSpacing:1 }}>Product Data Sheet</div>
              <div style={{ fontSize:10,color:"rgba(255,255,255,0.4)",marginTop:2 }}>unikingcanada.com · Internal Use Only</div>
            </div>
          </div>
          {/* Hero */}
          <div style={{ display:"flex",minHeight:160 }}>
            <div style={{ flex:1,padding:"20px 24px" }}>
              <div style={{ fontSize:11,color:"#6b7280",textTransform:"uppercase",letterSpacing:1,marginBottom:4 }}>{product.vendor} · {product.category}</div>
              <div style={{ fontSize:26,fontWeight:800,color:NAVY,lineHeight:1.1 }}>{product.series}</div>
              <div style={{ fontSize:16,color:"#4b5563",marginTop:4,marginBottom:12 }}>{product.style}</div>
              {product.notes && (
                <div style={{ fontSize:13,color:"#374151",lineHeight:1.6,padding:"10px 12px",background:"#f8fafc",borderLeft:`3px solid ${NAVY}`,borderRadius:4 }}>{product.notes}</div>
              )}
            </div>
            <div style={{ width:180,flexShrink:0 }}>
              <ProductImage src={product.image_url||catImg} alt={product.series} style={{ width:"100%",height:"100%",minHeight:160 }} />
            </div>
          </div>
          {/* Specs */}
          <div style={{ padding:"0 24px 20px" }}>
            <div style={{ fontSize:11,fontWeight:700,color:NAVY,textTransform:"uppercase",letterSpacing:1,marginBottom:10,paddingBottom:6,borderBottom:`2px solid ${NAVY}` }}>Technical Specifications</div>
            <table style={{ width:"100%",borderCollapse:"collapse",fontSize:13 }}><tbody>
              {[["Series",product.series],["Style",product.style],["Category",product.category],
                ["Pitch",product.pitch_in?`${product.pitch_in}" (${product.pitch_mm}mm)`:"—"],
                ["Open Area",product.open_area||"—"],["Hinge Style",product.hinge_style||"—"],
                ["Min Width",product.min_width_in?`${product.min_width_in}"`:"—"]
              ].map(([l,v],i)=>(
                <tr key={l} style={{ background:i%2===0?"#f8fafc":"#fff" }}>
                  <td style={{ padding:"7px 10px",fontWeight:700,color:"#374151",width:"35%" }}>{l}</td>
                  <td style={{ padding:"7px 10px",color:NAVY }}>{v}</td>
                </tr>
              ))}
            </tbody></table>
          </div>
          {/* Materials */}
          {materials.length>0 && (
            <div style={{ padding:"0 24px 20px" }}>
              <div style={{ fontSize:11,fontWeight:700,color:NAVY,textTransform:"uppercase",letterSpacing:1,marginBottom:10,paddingBottom:6,borderBottom:`2px solid ${NAVY}` }}>Available Materials</div>
              <div style={{ display:"flex",flexWrap:"wrap",gap:8 }}>
                {materials.map(m=>(
                  <div key={m} style={{ padding:"6px 12px",background:"#f1f5f9",borderRadius:6,fontSize:12,fontWeight:600,color:NAVY,border:"1px solid #e2e8f0" }}>{m}</div>
                ))}
              </div>
            </div>
          )}
          {/* Docs */}
          <div style={{ padding:"0 24px 20px" }}>
            <div style={{ fontSize:11,fontWeight:700,color:NAVY,textTransform:"uppercase",letterSpacing:1,marginBottom:10,paddingBottom:6,borderBottom:`2px solid ${NAVY}` }}>Resources</div>
            <div style={{ display:"flex",gap:12 }}>
              <div style={{ flex:1,padding:"10px 14px",background:product.tech_doc_url?NAVY:"#f3f4f6",color:product.tech_doc_url?"#fff":"#9ca3af",borderRadius:7,fontSize:12,fontWeight:600,textAlign:"center" }}>
                📄 {product.tech_doc_url?"Technical Document Available":"Tech Doc — Coming Soon"}
              </div>
              <div style={{ flex:1,padding:"10px 14px",background:product.cad_url?"#166534":"#f3f4f6",color:product.cad_url?"#fff":"#9ca3af",borderRadius:7,fontSize:12,fontWeight:600,textAlign:"center" }}>
                📐 {product.cad_url?"CAD Drawing Available":"CAD — Coming Soon"}
              </div>
            </div>
          </div>
          {/* Footer */}
          <div style={{ background:"#f8fafc",borderTop:"2px solid #e2e8f0",padding:"12px 24px",display:"flex",justifyContent:"space-between",alignItems:"center" }}>
            <div style={{ fontSize:10,color:"#94a3b8" }}>Uniking Canada · 12985 Rue Brault, Mirabel, QC J7J 0W2 · logistics@unikingcanada.com</div>
            <div style={{ fontSize:10,color:"#94a3b8" }}>{new Date().toLocaleDateString("en-CA")} · Internal Use Only · No Pricing</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Product Detail Modal ────────────────────────────────────────
function ProductModal({ product, onClose, onTearSheet }) {
  const [tab, setTab] = useState("specs");
  if (!product) return null;
  const catImg = CAT_IMGS[product.category];
  const imgSrc = product.image_url || catImg;
  const materials = product.materials ? product.materials.split(",").map(m=>m.trim()) : [];

  return (
    <div style={{ position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",zIndex:1000,
      display:"flex",alignItems:"center",justifyContent:"center",padding:16 }} onClick={onClose}>
      <div style={{ background:"#fff",borderRadius:16,width:"100%",maxWidth:620,maxHeight:"94vh",
        overflowY:"auto",display:"flex",flexDirection:"column" }} onClick={e=>e.stopPropagation()}>

        {/* Image hero */}
        <div style={{ height:220,position:"relative",borderRadius:"16px 16px 0 0",overflow:"hidden",flexShrink:0 }}>
          <ProductImage src={imgSrc} alt={product.series} style={{ width:"100%",height:"100%" }} />
          <div style={{ position:"absolute",inset:0,background:"linear-gradient(to top,rgba(10,20,40,0.92) 0%,rgba(10,20,40,0.05) 65%)" }} />
          {/* Close */}
          <button onClick={onClose} style={{ position:"absolute",top:12,right:12,background:"rgba(0,0,0,0.45)",
            border:"none",borderRadius:"50%",width:34,height:34,cursor:"pointer",color:"#fff",
            fontSize:16,display:"flex",alignItems:"center",justifyContent:"center" }}>✕</button>
          {/* Vendor logo chip */}
          <div style={{ position:"absolute",top:14,left:16,background:"rgba(255,255,255,0.96)",
            borderRadius:8,padding:"5px 10px",display:"flex",alignItems:"center" }}>
            <VendorLogo vendor={product.vendor} height={22} />
          </div>
          {/* Title */}
          <div style={{ position:"absolute",bottom:16,left:18,right:18 }}>
            <div style={{ fontSize:22,fontWeight:800,color:"#fff",lineHeight:1.1 }}>{product.series}</div>
            <div style={{ fontSize:14,color:"rgba(255,255,255,0.82)",marginTop:4 }}>{product.style}</div>
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
        <div style={{ display:"flex",borderBottom:"2px solid #f3f4f6",margin:"14px 20px 0",gap:0 }}>
          {[["specs","📐 Specs"],["materials",`🧪 Materials (${materials.length})`],["resources","📁 Resources"]].map(([id,label])=>(
            <button key={id} onClick={()=>setTab(id)} style={{ padding:"9px 16px",border:"none",background:"none",cursor:"pointer",
              fontSize:12,fontWeight:700,color:tab===id?NAVY:"#9ca3af",
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
                  ["Pitch (in)",product.pitch_in?`${product.pitch_in}"`:"-"],
                  ["Pitch (mm)",product.pitch_mm?`${product.pitch_mm}mm`:"-"],
                  ["Open Area",product.open_area||"-"],["Hinge Style",product.hinge_style||"-"],
                  ["Min Width",product.min_width_in?`${product.min_width_in}"`:"-"],
                  ["Category",product.category||"-"],
                ].map(([l,v])=>(
                  <div key={l} style={{ padding:"10px 12px",background:"#f8fafc",borderRadius:8,border:"1px solid #f1f5f9" }}>
                    <div style={{ fontSize:10,fontWeight:700,color:"#9ca3af",textTransform:"uppercase",letterSpacing:0.5,marginBottom:4 }}>{l}</div>
                    <div style={{ fontSize:14,color:NAVY,fontWeight:700 }}>{v}</div>
                  </div>
                ))}
              </div>
              {product.series_number && (
                <div style={{ display:"flex",alignItems:"center",gap:8,padding:"8px 12px",background:"#eff6ff",borderRadius:8 }}>
                  <span style={{ fontSize:11,color:"#1e40af",fontWeight:600 }}>📘 Catalog Series #:</span>
                  <span style={{ fontSize:13,color:NAVY,fontWeight:800 }}>{product.series_number}</span>
                </div>
              )}
              {product.page_range && (
                <div style={{ display:"flex",alignItems:"center",gap:8,padding:"8px 12px",background:"#f0fdf4",borderRadius:8 }}>
                  <span style={{ fontSize:11,color:"#166534",fontWeight:600 }}>📄 Catalog Pages:</span>
                  <span style={{ fontSize:13,color:"#166534",fontWeight:800 }}>pp. {product.page_range}</span>
                </div>
              )}
            </div>
          )}

          {tab==="materials" && <MaterialsChart materials={materials} />}

          {tab==="resources" && (
            <div style={{ display:"flex",flexDirection:"column",gap:10 }}>
              {product.tech_doc_url
                ? <a href={product.tech_doc_url} target="_blank" rel="noreferrer" style={{ display:"flex",alignItems:"center",gap:14,padding:"14px 16px",background:NAVY,color:"#fff",borderRadius:10,textDecoration:"none" }}>
                    <span style={{ fontSize:22 }}>📄</span>
                    <div><div style={{ fontSize:13,fontWeight:700 }}>Technical Document</div><div style={{ fontSize:11,color:"rgba(255,255,255,0.65)",marginTop:2 }}>Engineering specs, dimensions, installation guidance</div></div>
                    <span style={{ marginLeft:"auto",fontSize:12,opacity:0.7 }}>↗</span>
                  </a>
                : <div style={{ display:"flex",alignItems:"center",gap:14,padding:"14px 16px",background:"#f3f4f6",borderRadius:10 }}>
                    <span style={{ fontSize:22,opacity:0.4 }}>📄</span>
                    <div><div style={{ fontSize:13,fontWeight:700,color:"#9ca3af" }}>Technical Document</div><div style={{ fontSize:11,color:"#9ca3af",marginTop:2 }}>Coming soon — contact Uniking for details</div></div>
                  </div>
              }
              {product.cad_url
                ? <a href={product.cad_url} target="_blank" rel="noreferrer" style={{ display:"flex",alignItems:"center",gap:14,padding:"14px 16px",background:"#166534",color:"#fff",borderRadius:10,textDecoration:"none" }}>
                    <span style={{ fontSize:22 }}>📐</span>
                    <div><div style={{ fontSize:13,fontWeight:700 }}>CAD Drawing</div><div style={{ fontSize:11,color:"rgba(255,255,255,0.65)",marginTop:2 }}>2D/3D files for engineering and design</div></div>
                    <span style={{ marginLeft:"auto",fontSize:12,opacity:0.7 }}>↗</span>
                  </a>
                : <div style={{ display:"flex",alignItems:"center",gap:14,padding:"14px 16px",background:"#f3f4f6",borderRadius:10 }}>
                    <span style={{ fontSize:22,opacity:0.4 }}>📐</span>
                    <div><div style={{ fontSize:13,fontWeight:700,color:"#9ca3af" }}>CAD Drawing</div><div style={{ fontSize:11,color:"#9ca3af",marginTop:2 }}>Coming soon — contact Uniking for details</div></div>
                  </div>
              }
              {product.vendor==="Intralox" && (
                <a href="https://www.intralox.com/belt-finder" target="_blank" rel="noreferrer"
                  style={{ display:"flex",alignItems:"center",gap:14,padding:"14px 16px",background:"#fff1f2",borderRadius:10,textDecoration:"none",border:"1px solid #fecdd3" }}>
                  <span style={{ fontSize:22 }}>🔍</span>
                  <div><div style={{ fontSize:13,fontWeight:700,color:"#991b1b" }}>Intralox Belt Finder</div><div style={{ fontSize:11,color:"#991b1b88",marginTop:2 }}>Full technical specs on official Intralox portal</div></div>
                  <span style={{ marginLeft:"auto",fontSize:12,color:"#991b1b66" }}>↗</span>
                </a>
              )}
            </div>
          )}
        </div>

        {/* Tear sheet CTA */}
        <div style={{ padding:"0 20px 20px" }}>
          <button onClick={()=>onTearSheet(product)} style={{ width:"100%",padding:"12px",background:"#f0f4ff",
            border:"1.5px solid #c3d9fd",borderRadius:10,color:NAVY,fontSize:13,fontWeight:700,
            cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8 }}>
            📄 View Uniking Tear Sheet
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Product Card ────────────────────────────────────────────────
function ProductCard({ product, onClick }) {
  const vc = VENDOR_COLORS[product.vendor] || { bg:"#f3f4f6",text:"#374151" };
  const imgSrc = product.image_url || CAT_IMGS[product.category];
  const materials = product.materials ? product.materials.split(",").map(m=>m.trim()) : [];

  return (
    <div onClick={()=>onClick(product)}
      style={{ background:"#fff",border:"1px solid #e5e7eb",borderRadius:10,overflow:"hidden",
        cursor:"pointer",transition:"box-shadow 0.15s,border-color 0.15s",display:"flex",flexDirection:"column" }}
      onMouseEnter={e=>{e.currentTarget.style.boxShadow="0 6px 20px rgba(26,58,92,0.12)";e.currentTarget.style.borderColor="#93c5fd"}}
      onMouseLeave={e=>{e.currentTarget.style.boxShadow="none";e.currentTarget.style.borderColor="#e5e7eb"}}>

      <div style={{ height:130,position:"relative",overflow:"hidden",flexShrink:0 }}>
        <ProductImage src={imgSrc} alt={product.series} style={{ width:"100%",height:"100%" }} />
        <div style={{ position:"absolute",top:8,right:8 }}>
          {product.vendor==="Intralox"
            ? <div style={{ background:"rgba(255,255,255,0.95)",borderRadius:6,padding:"3px 7px",display:"flex",alignItems:"center" }}><IntraloxLogo height={14} /></div>
            : <Badge label={product.vendor} color={vc.bg} textColor={vc.text} />
          }
        </div>
      </div>

      <div style={{ padding:"12px 14px",display:"flex",flexDirection:"column",gap:7,flex:1 }}>
        <div>
          <div style={{ fontSize:14,fontWeight:700,color:NAVY }}>{product.series}</div>
          <div style={{ fontSize:12,color:"#6b7280",marginTop:2 }}>{product.style}</div>
        </div>

        <div style={{ display:"flex",gap:5,flexWrap:"wrap" }}>
          {product.pitch_in && <Badge label={`${product.pitch_in}" pitch`} color="#f0fdf4" textColor="#166534" small />}
          {product.open_area && product.open_area!=="0%" && <Badge label={`${product.open_area} open`} color="#fef9c3" textColor="#854d0e" small />}
          {product.hinge_style && <Badge label={`${product.hinge_style}`} color="#f3f4f6" textColor="#4b5563" small />}
        </div>

        {/* Material chips */}
        {materials.length>0 && (
          <div style={{ display:"flex",gap:4,flexWrap:"wrap" }}>
            {materials.slice(0,4).map(m=>{
              const info=getMI(m);
              return <span key={m} style={{ fontSize:9,fontWeight:800,padding:"2px 5px",background:info.color,color:info.text,borderRadius:4,border:`1px solid ${info.text}22` }}>{info.abbr}</span>;
            })}
            {materials.length>4 && <span style={{ fontSize:9,color:"#9ca3af",padding:"2px 4px" }}>+{materials.length-4}</span>}
          </div>
        )}

        {product.notes && (
          <div style={{ fontSize:11,color:"#6b7280",lineHeight:1.45,display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical",overflow:"hidden" }}>
            {product.notes}
          </div>
        )}

        <div style={{ marginTop:"auto",paddingTop:6,borderTop:"1px solid #f3f4f6",display:"flex",justifyContent:"space-between",alignItems:"center" }}>
          <div style={{ display:"flex",gap:4 }}>
            {product.tech_doc_url && <Badge label="📄" color="#eff6ff" textColor="#1d4ed8" small />}
            {product.cad_url && <Badge label="📐" color="#f0fdf4" textColor="#166534" small />}
          </div>
          <span style={{ fontSize:10,color:"#9ca3af" }}>View →</span>
        </div>
      </div>
    </div>
  );
}

// ── Main ────────────────────────────────────────────────────────
export default function Catalog() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const [search, setSearch]     = useState("");
  const [filterVendor, setFV]   = useState("All");
  const [filterCat, setFC]      = useState("All");
  const [filterPitch, setFP]    = useState("All");
  const [selected, setSelected] = useState(null);
  const [tearSheet, setTearSheet] = useState(null);

  useEffect(()=>{
    CatalogProduct.filter({})
      .then(d=>{setProducts(Array.isArray(d)?d:[]);setLoading(false);})
      .catch(()=>{setError("Failed to load. Please refresh.");setLoading(false);});
  },[]);

  const vendors  = useMemo(()=>["All",...new Set(products.map(p=>p.vendor))].sort(),(products));
  const cats     = useMemo(()=>["All",...new Set(products.map(p=>p.category))].sort(),[products]);
  const pitches  = useMemo(()=>["All",...Array.from(new Set(products.map(p=>p.pitch_in).filter(Boolean))).sort((a,b)=>parseFloat(a)-parseFloat(b)).map(p=>`${p}"`)],(products));

  const filtered = useMemo(()=>{
    const q=search.toLowerCase().trim();
    return products.filter(p=>{
      if(q){const hay=[p.series,p.style,p.materials,p.notes,p.search_tags,p.category,p.vendor].filter(Boolean).join(" ").toLowerCase();if(!hay.includes(q))return false;}
      if(filterVendor!=="All"&&p.vendor!==filterVendor)return false;
      if(filterCat!=="All"&&p.category!==filterCat)return false;
      if(filterPitch!=="All"&&`${p.pitch_in}"`!==filterPitch)return false;
      return true;
    });
  },[products,search,filterVendor,filterCat,filterPitch]);

  const grouped = useMemo(()=>{
    const map={};
    for(const p of filtered){if(!map[p.series])map[p.series]=[];map[p.series].push(p);}
    return Object.entries(map).sort((a,b)=>(parseFloat(a[1][0]?.series_number)||0)-(parseFloat(b[1][0]?.series_number)||0));
  },[filtered]);

  const active = search||filterVendor!=="All"||filterCat!=="All"||filterPitch!=="All";

  const sel = { padding:"8px 10px",border:"1px solid #e5e7eb",borderRadius:8,fontSize:12,color:"#374151",background:"#fff",cursor:"pointer",outline:"none" };

  return (
    <div style={{ minHeight:"100vh",background:"#f4f6f9",fontFamily:"Arial,sans-serif" }}>

      {/* Header */}
      <div style={{ background:NAVY,padding:"16px 28px" }}>
        <div style={{ maxWidth:1140,margin:"0 auto",display:"flex",alignItems:"center",justifyContent:"space-between",gap:16,flexWrap:"wrap" }}>
          <div style={{ display:"flex",flexDirection:"column",gap:2 }}>
            <UniKingLogo size={28} />
            <div style={{ fontSize:8,color:"rgba(255,255,255,0.35)",letterSpacing:3,textTransform:"uppercase" }}>UNITING THE STRONGEST LINKS</div>
          </div>
          <div style={{ textAlign:"center" }}>
            <div style={{ color:"#fff",fontSize:16,fontWeight:700 }}>🔩 Parts Catalog</div>
            <div style={{ color:"rgba(255,255,255,0.55)",fontSize:11,marginTop:2 }}>
              {loading?"Loading...":`${products.length} products · ${new Set(products.map(p=>p.vendor)).size} vendors`}
            </div>
          </div>
          <div style={{ fontSize:10,color:"rgba(255,255,255,0.3)",textAlign:"right" }}>INTERNAL USE ONLY<br/>NO PRICING</div>
        </div>
      </div>

      {/* Filter bar — compact, all inline */}
      <div style={{ background:"#fff",borderBottom:"1px solid #e5e7eb",padding:"10px 28px",position:"sticky",top:0,zIndex:10,boxShadow:"0 1px 4px rgba(0,0,0,0.06)" }}>
        <div style={{ maxWidth:1140,margin:"0 auto",display:"flex",gap:8,alignItems:"center",flexWrap:"wrap" }}>
          {/* Search — takes most space */}
          <div style={{ flex:"1 1 220px",position:"relative" }}>
            <span style={{ position:"absolute",left:10,top:"50%",transform:"translateY(-50%)",fontSize:14,color:"#9ca3af",pointerEvents:"none" }}>🔍</span>
            <input value={search} onChange={e=>setSearch(e.target.value)}
              placeholder="Search series, style, material..."
              style={{ width:"100%",padding:"8px 12px 8px 32px",border:"1px solid #e5e7eb",borderRadius:8,fontSize:12,outline:"none",boxSizing:"border-box" }}
            />
          </div>
          {/* Dropdowns — no labels, just selects */}
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
              style={{ padding:"8px 12px",border:"1px solid #fca5a5",borderRadius:8,background:"#fef2f2",color:"#dc2626",fontSize:12,fontWeight:600,cursor:"pointer",whiteSpace:"nowrap" }}>
              ✕ Clear
            </button>
          )}
          <div style={{ fontSize:11,color:"#9ca3af",whiteSpace:"nowrap" }}>
            {!loading&&`${filtered.length} result${filtered.length!==1?"s":""}`}
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
        {!loading&&!error&&grouped.length===0&&(
          <div style={{ textAlign:"center",padding:80 }}>
            <div style={{ fontSize:32,marginBottom:12 }}>🔍</div>
            <div style={{ color:"#6b7280",fontSize:14 }}>No products match your filters.</div>
            {active&&<button onClick={()=>{setSearch("");setFV("All");setFC("All");setFP("All");}} style={{ marginTop:16,padding:"8px 20px",background:NAVY,color:"#fff",border:"none",borderRadius:8,cursor:"pointer",fontSize:13 }}>Clear Filters</button>}
          </div>
        )}

        {!loading&&!error&&grouped.map(([series,items])=>(
          <div key={series} style={{ marginBottom:32 }}>
            {/* Series header */}
            <div style={{ display:"flex",alignItems:"center",gap:10,marginBottom:12,paddingBottom:8,borderBottom:"1px solid #e5e7eb" }}>
              <span style={{ fontSize:15,fontWeight:800,color:NAVY }}>{series}</span>
              {items[0]?.pitch_in && <Badge label={`${items[0].pitch_in}" · ${items[0].pitch_mm}mm`} color="#f0fdf4" textColor="#166534" small />}
              <Badge label={`${items.length} style${items.length!==1?"s":""}`} color="#f1f5f9" textColor="#475569" small />
              <div style={{ flex:1 }} />
              <div style={{ background:"rgba(255,255,255,0.97)",borderRadius:6,padding:"3px 8px" }}>
                <VendorLogo vendor={items[0]?.vendor} height={18} />
              </div>
            </div>
            {/* Cards grid */}
            <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(210px,1fr))",gap:12 }}>
              {items.map(p=><ProductCard key={p.id} product={p} onClick={setSelected} />)}
            </div>
          </div>
        ))}
      </div>

      {selected && (
        <ProductModal
          product={selected}
          onClose={()=>setSelected(null)}
          onTearSheet={p=>{setSelected(null);setTearSheet(p);}}
        />
      )}
      {tearSheet && <TearSheet product={tearSheet} onClose={()=>setTearSheet(null)} />}
    </div>
  );
}
