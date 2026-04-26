import { useState, useEffect, useMemo } from "react";
import { CatalogProduct } from "@/api/entities";
import { UniCatalog } from "@/api/entities";
import { ElevatorBucket } from "@/api/entities";

const NAVY = "#1a3a5c";

const TYPE_META = {
  "Elevator Bucket":        { color: "#b45309", bg: "#fef3c7" },
  "Elevator Belt":          { color: "#7c3aed", bg: "#ede9fe" },
  "Hardware & Accessories": { color: "#92400e", bg: "#fef9c3" },
  "Modular Plastic Belt":   { color: "#065f46", bg: "#d1fae5" },
  "Wire Mesh Belt":         { color: "#1e40af", bg: "#dbeafe" },
  "Steel Hinged Belt":      { color: "#374151", bg: "#f3f4f6" },
  "Table Top Chain":        { color: "#0e7490", bg: "#cffafe" },
  "ANSI/BS Chain":          { color: "#4338ca", bg: "#e0e7ff" },
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

function sortSeries(a, b) {
  const na = parseFloat((a.series || "").replace(/[^\d.]/g, "")) || 0;
  const nb = parseFloat((b.series || "").replace(/[^\d.]/g, "")) || 0;
  if (na !== nb) return na - nb;
  return (a.style || "").localeCompare(b.style || "");
}

function parseJSON(raw) {
  if (!raw) return null;
  if (typeof raw === "object") return raw;
  try { return JSON.parse(raw); } catch (e) { return null; }
}

// ─── Tear Sheet ───────────────────────────────────────────────────────────────

function printTearSheet(rec, type) {
  const isIntralox = !!rec.pitch_in;
  const specs = (isIntralox ? [
    ["Series", rec.series], ["Category", rec.category], ["Style", rec.style],
    ["Pitch", rec.pitch_in ? rec.pitch_in + '" (' + rec.pitch_mm + 'mm)' : null],
    ["Min Width", rec.min_width_in ? rec.min_width_in + '"' : null],
    ["Open Area", rec.open_area], ["Hinge Style", rec.hinge_style],
    ["Pages", rec.page_range ? "pp. " + rec.page_range : null],
  ] : [
    ["Series", rec.series], ["Style", rec.style || rec.category],
    ["Vendor", rec.vendor], ["Duty", rec.duty], ["Application", rec.application],
    ["Model", rec.model_code], ["Sizes", rec.sizes_available],
    ["Pages", rec.page_range ? "pp. " + rec.page_range : null],
  ]).filter(([, v]) => v && v !== "null");

  let beltRows = [];
  const bd = parseJSON(rec.belt_data);
  if (Array.isArray(bd)) beltRows = bd;

  let sprocketRows = [];
  const sd = parseJSON(rec.sprocket_data);
  if (Array.isArray(sd)) sprocketRows = sd;

  const beltCols = ["material","strength_lbf","strength_nm","temp_min_f","temp_max_f","mass_lbft2","mass_kgm2"];
  const beltLabels = { material:"Material", strength_lbf:"Strength (lbf)", strength_nm:"Strength (N/m)", temp_min_f:"Min °F", temp_max_f:"Max °F", mass_lbft2:"lb/ft²", mass_kgm2:"kg/m²" };
  const activeBeltCols = beltCols.filter(k => beltRows.some(r => r[k] != null && r[k] !== ""));

  const sprocketCols = ["type","material","teeth","pitch_dia_in","pitch_dia_mm","outer_dia_in","outer_dia_mm","hub_width_in","hub_width_mm"];
  const sprocketLabels = { type:"Type", material:"Material", teeth:"Teeth", pitch_dia_in:"Pitch Dia (in)", pitch_dia_mm:"Pitch Dia (mm)", outer_dia_in:"Outer Dia (in)", outer_dia_mm:"Outer Dia (mm)", hub_width_in:"Hub W (in)", hub_width_mm:"Hub W (mm)" };
  const activeSprocketCols = sprocketCols.filter(k => sprocketRows.some(r => r[k] != null && r[k] !== ""));

  const html = `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><title>Tear Sheet – ${rec.series}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&display=swap');
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family:'Inter',sans-serif; background:#fff; color:#0f172a; font-size:13px; }
  .page { max-width:780px; margin:0 auto; padding:32px 36px; }
  .header { display:flex; align-items:flex-start; justify-content:space-between; border-bottom:3px solid #0f2340; padding-bottom:18px; margin-bottom:22px; }
  .brand-label { font-size:11px; font-weight:700; letter-spacing:1.5px; text-transform:uppercase; color:#0f2340; margin-bottom:4px; }
  .title { font-size:26px; font-weight:900; color:#0f2340; line-height:1.1; }
  .subtitle { font-size:13px; color:#64748b; margin-top:4px; }
  .logo-text { font-size:18px; font-weight:900; color:#0f2340; letter-spacing:1px; text-align:right; }
  .logo-sub { font-size:9px; color:#94a3b8; letter-spacing:2px; text-transform:uppercase; margin-top:2px; text-align:right; }
  .img-block { margin-bottom:20px; text-align:center; background:#f8fafc; border-radius:8px; padding:16px; border:1px solid #e2e8f0; }
  .img-block img { max-height:140px; max-width:100%; object-fit:contain; }
  .section-title { font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:1px; color:#64748b; margin-bottom:8px; border-bottom:1px solid #e2e8f0; padding-bottom:4px; margin-top:20px; }
  .specs-grid { display:grid; grid-template-columns:1fr 1fr; gap:6px; margin-bottom:8px; }
  .spec-cell { background:#f8fafc; border-radius:6px; padding:8px 10px; border:1px solid #f1f5f9; }
  .spec-label { font-size:9px; font-weight:700; text-transform:uppercase; letter-spacing:.5px; color:#94a3b8; margin-bottom:2px; }
  .spec-value { font-size:12px; font-weight:600; color:#0f2340; }
  .notes-box { background:#f0f4f8; border-left:3px solid #1a3a5c; padding:10px 13px; border-radius:0 6px 6px 0; margin-bottom:20px; font-size:12px; color:#334155; line-height:1.7; }
  table { width:100%; border-collapse:collapse; font-size:11px; margin-bottom:8px; }
  thead tr { background:#0f2340; }
  thead th { padding:7px 10px; color:#fff; font-weight:700; text-align:left; white-space:nowrap; }
  tbody tr:nth-child(even) { background:#f8fafc; }
  tbody td { padding:6px 10px; border-bottom:1px solid #e2e8f0; }
  .footer { margin-top:24px; border-top:1px solid #e2e8f0; padding-top:12px; display:flex; justify-content:space-between; font-size:9px; color:#94a3b8; }
  @media print { body { -webkit-print-color-adjust:exact; print-color-adjust:exact; } }
</style></head><body>
<div class="page">
  <div class="header">
    <div>
      <div class="brand-label">${type}</div>
      <div class="title">${rec.series}</div>
      ${rec.style || rec.category ? '<div class="subtitle">' + (rec.style || rec.category) + '</div>' : ''}
    </div>
    <div>
      <div class="logo-text">UNIKING</div>
      <div class="logo-sub">Canada</div>
    </div>
  </div>

  ${rec.image_url ? '<div class="img-block"><img src="' + rec.image_url + '" /></div>' : ''}
  ${rec.notes ? '<div class="notes-box">' + rec.notes + '</div>' : ''}

  ${specs.length ? `<div class="section-title">Specifications</div><div class="specs-grid">${specs.map(([l,v])=>`<div class="spec-cell"><div class="spec-label">${l}</div><div class="spec-value">${v}</div></div>`).join('')}</div>` : ''}

  ${beltRows.length && activeBeltCols.length ? `
  <div class="section-title">Belt Data — Mechanical Properties</div>
  <table>
    <thead><tr>${activeBeltCols.map(k=>'<th>'+beltLabels[k]+'</th>').join('')}</tr></thead>
    <tbody>${beltRows.map(row=>'<tr>'+activeBeltCols.map(k=>'<td>'+(row[k]!=null?row[k]:'—')+'</td>').join('')+'</tr>').join('')}</tbody>
  </table>` : ''}

  ${sprocketRows.length && activeSprocketCols.length ? `
  <div class="section-title">Compatible Sprockets</div>
  <table>
    <thead><tr>${activeSprocketCols.map(k=>'<th>'+sprocketLabels[k]+'</th>').join('')}</tr></thead>
    <tbody>${sprocketRows.map(row=>'<tr>'+activeSprocketCols.map(k=>'<td>'+(row[k]!=null?row[k]:'—')+'</td>').join('')+'</tr>').join('')}</tbody>
  </table>` : ''}

  <div class="footer">
    <span>Uniking Canada · Internal Use Only · Confidential</span>
    <span>${rec.page_range ? 'Source: pp. ' + rec.page_range : ''}</span>
    <span>Printed ${new Date().toLocaleDateString('en-CA')}</span>
  </div>
</div>
<script>window.onload=()=>{window.print();}<\/script>
</body></html>`;

  const w = window.open("", "_blank");
  if (w) { w.document.write(html); w.document.close(); }
}

// ─── Sprocket Table ───────────────────────────────────────────────────────────

function SprocketTable({ data, color }) {
  const rows = parseJSON(data);
  if (!Array.isArray(rows) || !rows.length) return <div style={{color:"#6b7280",fontSize:13}}>No sprocket data available for this series.</div>;

  const cols = ["type","material","teeth","pitch_dia_in","pitch_dia_mm","outer_dia_in","outer_dia_mm","hub_width_in","hub_width_mm"];
  const labels = { type:"Type", material:"Material", teeth:"Teeth", pitch_dia_in:"Pitch Dia (in)", pitch_dia_mm:"Pitch Dia (mm)", outer_dia_in:"Outer Dia (in)", outer_dia_mm:"Outer Dia (mm)", hub_width_in:"Hub W (in)", hub_width_mm:"Hub W (mm)" };
  const active = cols.filter(k => rows.some(r => r[k] != null && r[k] !== ""));

  const onepiece = rows.filter(r => r.type === "One-Piece");
  const split = rows.filter(r => r.type === "Split");

  const renderGroup = (groupRows, label) => {
    if (!groupRows.length) return null;
    return (
      <div style={{marginBottom:16}}>
        <div style={{fontSize:11,fontWeight:700,color:color||NAVY,marginBottom:6,textTransform:"uppercase",letterSpacing:"0.6px"}}>{label}</div>
        <div style={{overflowX:"auto",borderRadius:6,border:"1px solid #e5e7eb"}}>
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
            <thead>
              <tr style={{background:NAVY}}>
                {active.filter(k=>k!=="type").map(k=><th key={k} style={{padding:"7px 10px",color:"#fff",fontWeight:700,textAlign:"left",whiteSpace:"nowrap"}}>{labels[k]}</th>)}
              </tr>
            </thead>
            <tbody>
              {groupRows.map((row,i)=>(
                <tr key={i} style={{background:i%2===0?"#f8fafc":"#fff",borderBottom:"1px solid #e5e7eb"}}>
                  {active.filter(k=>k!=="type").map(k=>(
                    <td key={k} style={{padding:"6px 10px",color:k==="material"?NAVY:"#374151",fontWeight:k==="material"?700:400,whiteSpace:"nowrap"}}>
                      {row[k]!=null?String(row[k]):"—"}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div>
      <p style={{fontSize:12,color:"#6b7280",marginBottom:12}}>Compatible sprockets for this series. All belt styles within the same series use the same sprockets.</p>
      {renderGroup(onepiece, "One-Piece Sprockets")}
      {renderGroup(split, "Split Sprockets")}
    </div>
  );
}

// ─── Belt Data Table ──────────────────────────────────────────────────────────

function BeltDataTable({ data }) {
  const rows = parseJSON(data);
  if (!Array.isArray(rows) || !rows.length) return null;
  const keys = ["material","strength_lbf","strength_nm","temp_min_f","temp_max_f","mass_lbft2","mass_kgm2"];
  const labels = { material:"Material", strength_lbf:"Strength (lbf)", strength_nm:"Strength (N/m)", temp_min_f:"Min °F", temp_max_f:"Max °F", mass_lbft2:"lb/ft²", mass_kgm2:"kg/m²" };
  const cols = keys.filter(k => rows.some(r => r[k] != null && r[k] !== ""));
  return (
    <div style={{overflowX:"auto",borderRadius:8,border:"1px solid #e5e7eb"}}>
      <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
        <thead><tr style={{background:NAVY}}>{cols.map(k=><th key={k} style={{padding:"8px 10px",color:"#fff",fontWeight:700,textAlign:"left",whiteSpace:"nowrap"}}>{labels[k]}</th>)}</tr></thead>
        <tbody>{rows.map((row,i)=>(
          <tr key={i} style={{background:i%2===0?"#f8fafc":"#fff",borderBottom:"1px solid #e5e7eb"}}>
            {cols.map(k=><td key={k} style={{padding:"7px 10px",color:k==="material"?NAVY:"#374151",fontWeight:k==="material"?700:400,whiteSpace:"nowrap"}}>{row[k]!=null?String(row[k]):"—"}</td>)}
          </tr>
        ))}</tbody>
      </table>
    </div>
  );
}

// ─── Modal ────────────────────────────────────────────────────────────────────

function Modal({ rec, type, onClose }) {
  const [tab, setTab] = useState("specs");
  if (!rec) return null;
  const tm = TYPE_META[type] || { color: NAVY, bg: "#f3f4f6" };
  const isIntralox = !!rec.pitch_in;

  const hasBelt = !!(parseJSON(rec.belt_data)?.length);
  const hasSprocket = !!(parseJSON(rec.sprocket_data)?.length);

  const specs = isIntralox ? [
    ["Series", rec.series], ["Category", rec.category], ["Style", rec.style],
    ["Pitch", rec.pitch_in ? rec.pitch_in + "\" (" + rec.pitch_mm + "mm)" : null],
    ["Min Width", rec.min_width_in ? rec.min_width_in + "\"" : null],
    ["Open Area", rec.open_area], ["Hinge Style", rec.hinge_style],
    ["Pages", rec.page_range ? "pp. " + rec.page_range : null],
  ] : [
    ["Series", rec.series], ["Style", rec.style || rec.category],
    ["Vendor", rec.vendor], ["Duty", rec.duty], ["Application", rec.application],
    ["Model", rec.model_code], ["Sizes", rec.sizes_available],
    ["Pages", rec.page_range ? "pp. " + rec.page_range : null],
  ];

  const matStr = rec.materials || rec.material || "";
  const mats = matStr.split(/[,/]/).map(m => m.trim()).filter(Boolean);

  const tabs = [
    ["specs", "Specs"],
    mats.length ? ["mats", "Materials"] : null,
    hasBelt ? ["belt", "Belt Data"] : null,
    hasSprocket ? ["sprockets", "Sprockets"] : null,
    (rec.catalog_url || rec.tech_doc_url || rec.cad_url) ? ["res", "Resources"] : null,
  ].filter(Boolean);

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.5)",zIndex:999,display:"flex",alignItems:"center",justifyContent:"center",padding:16}} onClick={onClose}>
      <div style={{background:"#fff",borderRadius:16,width:"100%",maxWidth:700,maxHeight:"92vh",overflowY:"auto"}} onClick={e=>e.stopPropagation()}>

        {/* Header */}
        <div style={{background:"linear-gradient(135deg,#1a3a5c,#2d5986)",borderRadius:"16px 16px 0 0",padding:"18px 20px 16px",position:"relative"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:8}}>
            <div style={{display:"flex",gap:14,alignItems:"flex-start",flex:1}}>
              {rec.image_url ? (
                <div style={{background:"rgba(255,255,255,.1)",borderRadius:8,padding:6,flexShrink:0,width:100,height:76,display:"flex",alignItems:"center",justifyContent:"center"}}>
                  <img src={rec.image_url} alt="" style={{maxWidth:90,maxHeight:68,objectFit:"contain"}} onError={e=>{e.target.parentElement.style.display="none";}} />
                </div>
              ) : null}
              <div>
                <div style={{display:"flex",gap:6,marginBottom:7,flexWrap:"wrap"}}>
                  <span style={{background:tm.bg,color:tm.color,padding:"2px 9px",borderRadius:99,fontSize:11,fontWeight:700}}>{type}</span>
                  {rec.vendor ? <span style={{background:"rgba(255,255,255,.15)",color:"#fff",padding:"2px 9px",borderRadius:99,fontSize:11,fontWeight:700}}>{rec.vendor}</span> : null}
                </div>
                <div style={{fontSize:20,fontWeight:900,color:"#fff",lineHeight:1.2}}>{rec.series}</div>
                {rec.style || rec.category ? <div style={{fontSize:12,color:"rgba(255,255,255,.6)",marginTop:3}}>{rec.style||rec.category}</div> : null}
                <div style={{display:"flex",gap:5,marginTop:7,flexWrap:"wrap"}}>
                  {rec.pitch_in ? <span style={{background:"rgba(255,255,255,.15)",color:"#fff",padding:"2px 8px",borderRadius:99,fontSize:10,fontWeight:700}}>{rec.pitch_in}" pitch</span> : null}
                  {rec.hinge_style ? <span style={{background:"rgba(255,255,255,.15)",color:"#fff",padding:"2px 8px",borderRadius:99,fontSize:10,fontWeight:700}}>{rec.hinge_style}</span> : null}
                  {rec.open_area ? <span style={{background:"rgba(255,255,255,.15)",color:"#fff",padding:"2px 8px",borderRadius:99,fontSize:10,fontWeight:700}}>{rec.open_area} open</span> : null}
                </div>
              </div>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:6,alignItems:"flex-end",flexShrink:0}}>
              <button onClick={onClose} style={{background:"rgba(255,255,255,.15)",border:"none",borderRadius:"50%",width:30,height:30,cursor:"pointer",color:"#fff",fontSize:15,display:"flex",alignItems:"center",justifyContent:"center"}}>✕</button>
              <button onClick={()=>printTearSheet(rec,type)} style={{background:"rgba(255,255,255,.15)",border:"1px solid rgba(255,255,255,.3)",color:"#fff",padding:"5px 11px",borderRadius:6,cursor:"pointer",fontSize:11,fontWeight:700,whiteSpace:"nowrap"}}>
                Print Tear Sheet
              </button>
            </div>
          </div>
        </div>

        {rec.notes ? <div style={{margin:"12px 18px 0",padding:"10px 13px",background:"#f8fafc",borderRadius:8,borderLeft:"3px solid "+tm.color,fontSize:13,color:"#374151",lineHeight:1.7}}>{rec.notes}</div> : null}

        {/* Tabs */}
        <div style={{display:"flex",borderBottom:"2px solid #f3f4f6",margin:"12px 18px 0",overflowX:"auto"}}>
          {tabs.map(([id,label])=>(
            <button key={id} onClick={()=>setTab(id)} style={{padding:"7px 13px",border:"none",background:"none",cursor:"pointer",fontSize:12,fontWeight:700,whiteSpace:"nowrap",color:tab===id?tm.color:"#9ca3af",borderBottom:tab===id?"2px solid "+tm.color:"2px solid transparent",marginBottom:-2}}>
              {label}
            </button>
          ))}
        </div>

        {/* Body */}
        <div style={{padding:"14px 18px 22px"}}>
          {tab === "specs" && (
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
              {specs.filter(([,v])=>v&&v!=="null").map(([l,v])=>(
                <div key={l} style={{padding:"9px 11px",background:"#f8fafc",borderRadius:8,border:"1px solid #f1f5f9"}}>
                  <div style={{fontSize:10,fontWeight:700,color:"#9ca3af",textTransform:"uppercase",letterSpacing:.5,marginBottom:2}}>{l}</div>
                  <div style={{fontSize:13,color:NAVY,fontWeight:600}}>{v}</div>
                </div>
              ))}
            </div>
          )}
          {tab === "mats" && (
            <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
              {mats.map((m,i)=><span key={i} style={{padding:"7px 14px",borderRadius:99,background:tm.bg,color:tm.color,fontWeight:700,fontSize:13}}>{m}</span>)}
            </div>
          )}
          {tab === "belt" && (
            <div>
              <p style={{fontSize:12,color:"#6b7280",marginBottom:10}}>Mechanical properties per material. Strength per metre of belt width.</p>
              <BeltDataTable data={rec.belt_data} />
            </div>
          )}
          {tab === "sprockets" && <SprocketTable data={rec.sprocket_data} color={tm.color} />}
          {tab === "res" && (
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              {rec.catalog_url ? <a href={rec.catalog_url} target="_blank" rel="noreferrer" style={{display:"flex",alignItems:"center",gap:10,padding:"11px 14px",background:"#f8fafc",borderRadius:10,border:"1px solid #e5e7eb",color:NAVY,fontWeight:700,fontSize:13,textDecoration:"none"}}>📄 View Catalog PDF</a> : null}
              {rec.tech_doc_url ? <a href={rec.tech_doc_url} target="_blank" rel="noreferrer" style={{display:"flex",alignItems:"center",gap:10,padding:"11px 14px",background:"#f8fafc",borderRadius:10,border:"1px solid #e5e7eb",color:NAVY,fontWeight:700,fontSize:13,textDecoration:"none"}}>📐 Technical Documentation</a> : null}
              {rec.cad_url ? <a href={rec.cad_url} target="_blank" rel="noreferrer" style={{display:"flex",alignItems:"center",gap:10,padding:"11px 14px",background:"#f8fafc",borderRadius:10,border:"1px solid #e5e7eb",color:NAVY,fontWeight:700,fontSize:13,textDecoration:"none"}}>📁 CAD Drawing</a> : null}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────

export default function Catalog() {
  const [all, setAll] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeF, setTypeF] = useState("All");
  const [seriesF, setSeriesF] = useState("All");
  const [hingeF, setHingeF] = useState("All");
  const [pitchF, setPitchF] = useState("All");
  const [sel, setSel] = useState(null);

  useEffect(() => {
    Promise.all([CatalogProduct.list(), UniCatalog.list(), ElevatorBucket.list()])
      .then(([intralox, uni, buckets]) => {
        setAll([
          ...intralox.map(r => ({ ...r, _type: r.category || "Modular Plastic Belt" })),
          ...uni.map(r => ({ ...r, _type: r.product_type })),
          ...buckets.map(r => ({ ...r, _type: getBucketType(r) })),
        ]);
      })
      .catch(e => console.error(e))
      .finally(() => setLoading(false));
  }, []);

  const types = useMemo(() => ["All", ...Array.from(new Set(all.map(p => p._type).filter(Boolean))).sort()], [all]);
  const seriesOpts = useMemo(() => {
    const base = typeF === "All" ? all : all.filter(p => p._type === typeF);
    const s = Array.from(new Set(base.map(p => p.series).filter(Boolean)));
    s.sort((a, b) => { const na=parseFloat(a.replace(/[^\d.]/g,""))||0, nb=parseFloat(b.replace(/[^\d.]/g,""))||0; return na!==nb?na-nb:a.localeCompare(b); });
    return ["All", ...s];
  }, [all, typeF]);
  const hingeOpts = useMemo(() => ["All", ...Array.from(new Set(all.filter(p=>p.hinge_style).map(p=>p.hinge_style))).sort()], [all]);
  const pitchOpts = useMemo(() => {
    const s = Array.from(new Set(all.filter(p=>p.pitch_in).map(p=>p.pitch_in+'"')));
    s.sort((a,b)=>parseFloat(a)-parseFloat(b));
    return ["All",...s];
  }, [all]);

  const filtered = useMemo(() => {
    let list = all;
    if (typeF !== "All") list = list.filter(p => p._type === typeF);
    if (seriesF !== "All") list = list.filter(p => p.series === seriesF);
    if (hingeF !== "All") list = list.filter(p => p.hinge_style === hingeF);
    if (pitchF !== "All") list = list.filter(p => (p.pitch_in+'"') === pitchF);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(p => [p.series,p.style,p.category,p.notes,p.materials,p.search_tags,p.application].some(f=>f&&f.toLowerCase().includes(q)));
    }
    return [...list].sort(sortSeries);
  }, [all, typeF, seriesF, hingeF, pitchF, search]);

  function Sel({ value, onChange, options, label }) {
    return (
      <select value={value} onChange={e=>onChange(e.target.value)} style={{padding:"8px 11px",borderRadius:8,border:"1px solid #d1d5db",fontSize:13,color:NAVY,background:"#fff",cursor:"pointer"}}>
        <option value="All">{label}</option>
        {options.filter(o=>o!=="All").map(o=><option key={o} value={o}>{o}</option>)}
      </select>
    );
  }

  const hasFilters = typeF!=="All"||seriesF!=="All"||hingeF!=="All"||pitchF!=="All"||search;

  return (
    <div style={{minHeight:"100vh",background:"#f8fafc",fontFamily:"'Inter','Segoe UI',sans-serif"}}>
      <div style={{background:NAVY,padding:"0 24px",display:"flex",alignItems:"center",justifyContent:"space-between",height:56,boxShadow:"0 2px 8px rgba(0,0,0,.18)"}}>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <a href="/" style={{color:"rgba(255,255,255,.5)",textDecoration:"none",fontSize:12}}>Home</a>
          <span style={{color:"rgba(255,255,255,.3)"}}>/ </span>
          <span style={{color:"#fff",fontSize:13,fontWeight:700}}>Product Catalog</span>
        </div>
        <span style={{fontSize:11,color:"rgba(255,255,255,.45)"}}>{loading?"Loading...":filtered.length+" products"}</span>
      </div>

      <div style={{background:"#fff",borderBottom:"1px solid #e5e7eb",padding:"13px 24px"}}>
        <div style={{display:"flex",gap:10,flexWrap:"wrap",maxWidth:1200,margin:"0 auto"}}>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search series, style, application, material..." style={{flex:1,minWidth:220,padding:"8px 13px",borderRadius:8,border:"1px solid #d1d5db",fontSize:13,outline:"none"}} />
          <Sel value={typeF} onChange={v=>{setTypeF(v);setSeriesF("All");}} options={types} label="All Types" />
          {seriesOpts.length>2&&<Sel value={seriesF} onChange={setSeriesF} options={seriesOpts} label="All Series" />}
          {hingeOpts.length>2&&<Sel value={hingeF} onChange={setHingeF} options={hingeOpts} label="Hinge Style" />}
          {pitchOpts.length>2&&<Sel value={pitchF} onChange={setPitchF} options={pitchOpts} label="Pitch" />}
          {hasFilters&&<button onClick={()=>{setTypeF("All");setSeriesF("All");setHingeF("All");setPitchF("All");setSearch("");}} style={{padding:"8px 13px",borderRadius:8,border:"1px solid #d1d5db",background:"#f9fafb",cursor:"pointer",fontSize:13,color:"#6b7280"}}>Clear</button>}
        </div>
      </div>

      <div style={{maxWidth:1200,margin:"0 auto",padding:"22px"}}>
        {loading ? (
          <div style={{textAlign:"center",padding:80,color:"#9ca3af",fontSize:14}}>Loading catalog...</div>
        ) : filtered.length===0 ? (
          <div style={{textAlign:"center",padding:80,color:"#9ca3af",fontSize:14}}>No products found.</div>
        ) : (
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(230px,1fr))",gap:14}}>
            {filtered.map((rec,i)=>{
              const tm=TYPE_META[rec._type]||{color:NAVY,bg:"#f3f4f6"};
              return (
                <div key={rec.id||i} onClick={()=>setSel(rec)} style={{background:"#fff",borderRadius:12,border:"1px solid #e5e7eb",cursor:"pointer",display:"flex",flexDirection:"column",overflow:"hidden",transition:"transform .15s,box-shadow .15s"}}
                  onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-2px)";e.currentTarget.style.boxShadow="0 6px 20px rgba(0,0,0,.10)";}}
                  onMouseLeave={e=>{e.currentTarget.style.transform="";e.currentTarget.style.boxShadow="";}}>
                  <div style={{height:4,background:"linear-gradient(90deg,"+tm.color+","+tm.color+"66)"}} />
                  {rec.image_url ? (
                    <div style={{background:"#f8fafc",borderBottom:"1px solid #f1f5f9",height:128,display:"flex",alignItems:"center",justifyContent:"center",overflow:"hidden"}}>
                      <img src={rec.image_url} alt="" style={{maxHeight:116,maxWidth:"88%",objectFit:"contain"}} onError={e=>{e.target.parentElement.style.display="none";}} />
                    </div>
                  ) : null}
                  <div style={{padding:"11px 13px",flex:1,display:"flex",flexDirection:"column",gap:4}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:5}}>
                      <span style={{background:tm.bg,color:tm.color,padding:"1px 7px",borderRadius:99,fontSize:10,fontWeight:700,whiteSpace:"nowrap"}}>{rec._type}</span>
                      {rec.pitch_in?<span style={{fontSize:10,color:"#9ca3af"}}>{rec.pitch_in}"</span>:null}
                    </div>
                    <div style={{fontSize:13,fontWeight:800,color:NAVY,lineHeight:1.25}}>{rec.series||"—"}</div>
                    {(rec.style||rec.category)?<div style={{fontSize:11,color:"#6b7280"}}>{rec.style||rec.category}</div>:null}
                    <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
                      {rec.hinge_style?<span style={{background:"#f9fafb",color:"#374151",padding:"1px 6px",borderRadius:99,fontSize:10,fontWeight:600}}>{rec.hinge_style}</span>:null}
                      {rec.open_area&&rec.open_area!=="0%"?<span style={{background:"#f0fdf4",color:"#15803d",padding:"1px 6px",borderRadius:99,fontSize:10,fontWeight:600}}>{rec.open_area} open</span>:null}
                    </div>
                  </div>
                  <div style={{padding:"7px 13px",borderTop:"1px solid #f3f4f6",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <span style={{fontSize:10,color:"#d1d5db"}}>{rec.page_range?"pp."+rec.page_range:""}</span>
                    <span style={{fontSize:11,color:tm.color,fontWeight:700}}>Details →</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {sel ? <Modal rec={sel} type={sel._type} onClose={()=>setSel(null)} /> : null}
    </div>
  );
}
