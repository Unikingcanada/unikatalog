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

function BeltDataTable({ data }) {
  if (!data) return null;
  let rows;
  try { rows = typeof data === "string" ? JSON.parse(data) : data; } catch (e) { return null; }
  if (!Array.isArray(rows) || !rows.length) return null;
  const keys = ["material","strength_lbf","strength_nm","temp_min_f","temp_max_f","mass_lbft2","mass_kgm2"];
  const labels = { material:"Material", strength_lbf:"Strength (lbf)", strength_nm:"Strength (N/m)", temp_min_f:"Min °F", temp_max_f:"Max °F", mass_lbft2:"lb/ft²", mass_kgm2:"kg/m²" };
  const cols = keys.filter(k => rows.some(r => r[k] != null && r[k] !== ""));
  return (
    <div style={{overflowX:"auto",borderRadius:8,border:"1px solid #e5e7eb"}}>
      <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
        <thead>
          <tr style={{background:NAVY}}>
            {cols.map(k => <th key={k} style={{padding:"8px 10px",color:"#fff",fontWeight:700,textAlign:"left",whiteSpace:"nowrap"}}>{labels[k]}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} style={{background:i%2===0?"#f8fafc":"#fff",borderBottom:"1px solid #e5e7eb"}}>
              {cols.map(k => (
                <td key={k} style={{padding:"7px 10px",color:k==="material"?NAVY:"#374151",fontWeight:k==="material"?700:400,whiteSpace:"nowrap"}}>
                  {row[k] != null ? String(row[k]) : "—"}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Modal({ rec, type, onClose }) {
  const [tab, setTab] = useState("specs");
  if (!rec) return null;
  const tm = TYPE_META[type] || { color: NAVY, bg: "#f3f4f6" };
  const isIntralox = !!rec.pitch_in;

  let beltRows = [];
  if (rec.belt_data) {
    try {
      const p = typeof rec.belt_data === "string" ? JSON.parse(rec.belt_data) : rec.belt_data;
      if (Array.isArray(p)) beltRows = p;
    } catch (e) {}
  }
  const hasBelt = beltRows.length > 0;

  const matStr = rec.materials || rec.material || "";
  const mats = matStr.split(/[,/]/).map(m => m.trim()).filter(Boolean);

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

  const tabs = [
    ["specs", "Specs"],
    mats.length ? ["mats", "Materials"] : null,
    hasBelt ? ["belt", "Belt Data"] : null,
    (rec.catalog_url || rec.tech_doc_url || rec.cad_url) ? ["res", "Resources"] : null,
  ].filter(Boolean);

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.5)",zIndex:999,display:"flex",alignItems:"center",justifyContent:"center",padding:16}} onClick={onClose}>
      <div style={{background:"#fff",borderRadius:16,width:"100%",maxWidth:680,maxHeight:"92vh",overflowY:"auto"}} onClick={e => e.stopPropagation()}>

        <div style={{background:"linear-gradient(135deg,#1a3a5c,#2d5986)",borderRadius:"16px 16px 0 0",padding:"18px 20px 16px",position:"relative"}}>
          <button onClick={onClose} style={{position:"absolute",top:12,right:14,background:"rgba(255,255,255,.15)",border:"none",borderRadius:"50%",width:30,height:30,cursor:"pointer",color:"#fff",fontSize:15}}>✕</button>
          <div style={{display:"flex",gap:8,marginBottom:8,flexWrap:"wrap"}}>
            <span style={{background:tm.bg,color:tm.color,padding:"2px 9px",borderRadius:99,fontSize:11,fontWeight:700}}>{type}</span>
            {rec.vendor ? <span style={{background:"rgba(255,255,255,.15)",color:"#fff",padding:"2px 9px",borderRadius:99,fontSize:11,fontWeight:700}}>{rec.vendor}</span> : null}
          </div>
          <div style={{display:"flex",gap:14,alignItems:"flex-start"}}>
            {rec.image_url ? (
              <div style={{background:"rgba(255,255,255,.1)",borderRadius:8,padding:6,flexShrink:0,width:110,height:80,display:"flex",alignItems:"center",justifyContent:"center"}}>
                <img src={rec.image_url} alt="" style={{maxWidth:100,maxHeight:72,objectFit:"contain"}} onError={e => { e.target.parentElement.style.display="none"; }} />
              </div>
            ) : null}
            <div>
              <div style={{fontSize:20,fontWeight:900,color:"#fff",lineHeight:1.2}}>{rec.series}</div>
              {rec.style || rec.category ? <div style={{fontSize:12,color:"rgba(255,255,255,.6)",marginTop:3}}>{rec.style || rec.category}</div> : null}
              <div style={{display:"flex",gap:5,marginTop:7,flexWrap:"wrap"}}>
                {rec.pitch_in ? <span style={{background:"rgba(255,255,255,.15)",color:"#fff",padding:"2px 8px",borderRadius:99,fontSize:10,fontWeight:700}}>{rec.pitch_in}" pitch</span> : null}
                {rec.hinge_style ? <span style={{background:"rgba(255,255,255,.15)",color:"#fff",padding:"2px 8px",borderRadius:99,fontSize:10,fontWeight:700}}>{rec.hinge_style}</span> : null}
                {rec.open_area ? <span style={{background:"rgba(255,255,255,.15)",color:"#fff",padding:"2px 8px",borderRadius:99,fontSize:10,fontWeight:700}}>{rec.open_area} open</span> : null}
              </div>
            </div>
          </div>
        </div>

        {rec.notes ? <div style={{margin:"12px 18px 0",padding:"10px 13px",background:"#f8fafc",borderRadius:8,borderLeft:"3px solid "+tm.color,fontSize:13,color:"#374151",lineHeight:1.7}}>{rec.notes}</div> : null}

        <div style={{display:"flex",borderBottom:"2px solid #f3f4f6",margin:"12px 18px 0",overflowX:"auto"}}>
          {tabs.map(([id, label]) => (
            <button key={id} onClick={() => setTab(id)} style={{padding:"7px 13px",border:"none",background:"none",cursor:"pointer",fontSize:12,fontWeight:700,whiteSpace:"nowrap",color:tab===id?tm.color:"#9ca3af",borderBottom:tab===id?"2px solid "+tm.color:"2px solid transparent",marginBottom:-2}}>
              {label}
            </button>
          ))}
        </div>

        <div style={{padding:"14px 18px 22px"}}>
          {tab === "specs" && (
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
              {specs.filter(([,v]) => v && v !== "null").map(([l,v]) => (
                <div key={l} style={{padding:"9px 11px",background:"#f8fafc",borderRadius:8,border:"1px solid #f1f5f9"}}>
                  <div style={{fontSize:10,fontWeight:700,color:"#9ca3af",textTransform:"uppercase",letterSpacing:.5,marginBottom:2}}>{l}</div>
                  <div style={{fontSize:13,color:NAVY,fontWeight:600}}>{v}</div>
                </div>
              ))}
            </div>
          )}
          {tab === "mats" && (
            <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
              {mats.map((m,i) => <span key={i} style={{padding:"7px 14px",borderRadius:99,background:tm.bg,color:tm.color,fontWeight:700,fontSize:13}}>{m}</span>)}
            </div>
          )}
          {tab === "belt" && (
            <div>
              <p style={{fontSize:12,color:"#6b7280",marginBottom:10}}>Mechanical properties per material. Strength per metre of belt width.</p>
              <BeltDataTable data={rec.belt_data} />
            </div>
          )}
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
    s.sort((a, b) => { const na = parseFloat(a.replace(/[^\d.]/g,""))||0, nb = parseFloat(b.replace(/[^\d.]/g,""))||0; return na!==nb?na-nb:a.localeCompare(b); });
    return ["All", ...s];
  }, [all, typeF]);

  const hingeOpts = useMemo(() => ["All", ...Array.from(new Set(all.filter(p=>p.hinge_style).map(p=>p.hinge_style))).sort()], [all]);
  const pitchOpts = useMemo(() => {
    const s = Array.from(new Set(all.filter(p=>p.pitch_in).map(p=>p.pitch_in+'"')));
    s.sort((a,b) => parseFloat(a)-parseFloat(b));
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
      <select value={value} onChange={e => onChange(e.target.value)} style={{padding:"8px 11px",borderRadius:8,border:"1px solid #d1d5db",fontSize:13,color:NAVY,background:"#fff",cursor:"pointer"}}>
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
          {seriesOpts.length>2 && <Sel value={seriesF} onChange={setSeriesF} options={seriesOpts} label="All Series" />}
          {hingeOpts.length>2 && <Sel value={hingeF} onChange={setHingeF} options={hingeOpts} label="Hinge Style" />}
          {pitchOpts.length>2 && <Sel value={pitchF} onChange={setPitchF} options={pitchOpts} label="Pitch" />}
          {hasFilters && (
            <button onClick={()=>{setTypeF("All");setSeriesF("All");setHingeF("All");setPitchF("All");setSearch("");}} style={{padding:"8px 13px",borderRadius:8,border:"1px solid #d1d5db",background:"#f9fafb",cursor:"pointer",fontSize:13,color:"#6b7280"}}>
              Clear
            </button>
          )}
        </div>
      </div>

      <div style={{maxWidth:1200,margin:"0 auto",padding:"22px"}}>
        {loading ? (
          <div style={{textAlign:"center",padding:80,color:"#9ca3af",fontSize:14}}>Loading catalog...</div>
        ) : filtered.length===0 ? (
          <div style={{textAlign:"center",padding:80,color:"#9ca3af",fontSize:14}}>No products found.</div>
        ) : (
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(230px,1fr))",gap:14}}>
            {filtered.map((rec, i) => {
              const tm = TYPE_META[rec._type] || { color: NAVY, bg: "#f3f4f6" };
              return (
                <div key={rec.id||i} onClick={()=>setSel(rec)} style={{background:"#fff",borderRadius:12,border:"1px solid #e5e7eb",cursor:"pointer",display:"flex",flexDirection:"column",overflow:"hidden",transition:"transform .15s,box-shadow .15s"}}
                  onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-2px)";e.currentTarget.style.boxShadow="0 6px 20px rgba(0,0,0,.10)";}}
                  onMouseLeave={e=>{e.currentTarget.style.transform="";e.currentTarget.style.boxShadow="";}}>
                  <div style={{height:4,background:"linear-gradient(90deg,"+tm.color+","+tm.color+"66"}} />
                  {rec.image_url ? (
                    <div style={{background:"#f8fafc",borderBottom:"1px solid #f1f5f9",height:128,display:"flex",alignItems:"center",justifyContent:"center",overflow:"hidden"}}>
                      <img src={rec.image_url} alt="" style={{maxHeight:116,maxWidth:"88%",objectFit:"contain"}} onError={e=>{e.target.parentElement.style.display="none";}} />
                    </div>
                  ) : null}
                  <div style={{padding:"11px 13px",flex:1,display:"flex",flexDirection:"column",gap:4}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:5}}>
                      <span style={{background:tm.bg,color:tm.color,padding:"1px 7px",borderRadius:99,fontSize:10,fontWeight:700,whiteSpace:"nowrap"}}>{rec._type}</span>
                      {rec.pitch_in ? <span style={{fontSize:10,color:"#9ca3af"}}>{rec.pitch_in}"</span> : null}
                    </div>
                    <div style={{fontSize:13,fontWeight:800,color:NAVY,lineHeight:1.25}}>{rec.series||"—"}</div>
                    {(rec.style||rec.category) ? <div style={{fontSize:11,color:"#6b7280"}}>{rec.style||rec.category}</div> : null}
                    <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
                      {rec.hinge_style ? <span style={{background:"#f9fafb",color:"#374151",padding:"1px 6px",borderRadius:99,fontSize:10,fontWeight:600}}>{rec.hinge_style}</span> : null}
                      {rec.open_area&&rec.open_area!=="0%" ? <span style={{background:"#f0fdf4",color:"#15803d",padding:"1px 6px",borderRadius:99,fontSize:10,fontWeight:600}}>{rec.open_area} open</span> : null}
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
