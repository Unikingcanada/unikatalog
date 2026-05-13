import { useState, useEffect } from "react";
import { COLORS as C } from "@/lib/designSystem";

function getRFQCart() { try {return JSON.parse(localStorage.getItem("uniking_rfq_cart") || "[]");} catch {return [];} }
function saveRFQCart(items) { localStorage.setItem("uniking_rfq_cart", JSON.stringify(items)); window.dispatchEvent(new Event("rfq_cart_updated")); }
function addToRFQCart(product) {
  const cart = getRFQCart();
  const exists = cart.find((i) => i.id === product.id && i._source === product._source);
  if (exists) return false;
  cart.push({ cartId: product.id + "_" + Date.now(), ...product });
  saveRFQCart(cart);
  return true;
}

function stripVendor(text) {
  if (!text) return text;
  return text.replace(/Allied[\s\-]?Locke[\s\S]*?(\||$)/gi, '').replace(/Allied[\s\-]?Locke/gi, '').replace(/\|\s*$/, '').replace(/^\s*\|\s*/, '').trim();
}

function RelatedCard({ item, full, onClick }) {
  const [hov, setHov] = useState(false);
  const [added, setAdded] = useState(() => getRFQCart().some((i) => i.id === (full?.id || item.part_number)));
  useEffect(() => {
    const update = () => setAdded(getRFQCart().some((i) => i.id === (full?.id || item.part_number)));
    window.addEventListener("rfq_cart_updated", update);
    return () => window.removeEventListener("rfq_cart_updated", update);
  }, [full, item.part_number]);

  function handleAddRFQ(e) {
    e.stopPropagation();
    if (added) { window.dispatchEvent(new CustomEvent("uniking_go_rfq")); return; }
    addToRFQCart({ id: full?.id || item.part_number, _source: "mac", series: item.part_number, type: full?.product_type || item.category || "Related Item", style: item.name || item.category || "", category: item.category || "", image_url: item.image || full?.product_image || "", materials: "", application: "" });
    setAdded(true);
  }

  return (
    <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ border: "1px solid " + (hov && full ? C.navyMid : C.border), borderRadius: 8, padding: "12px 14px", background: hov && full ? C.navyMid : C.bg, transition: "all 0.15s", display: "flex", flexDirection: "column" }}>
      {item.image && <img src={item.image} alt={item.part_number} onClick={onClick} style={{ width: "100%", height: 65, objectFit: "contain", marginBottom: 8, borderRadius: 4, cursor: full ? "pointer" : "default" }} />}
      <div onClick={onClick} style={{ fontWeight: 700, fontSize: 13, color: hov && full ? "#fff" : C.text, marginBottom: 2, cursor: full ? "pointer" : "default", flex: 1 }}>{item.part_number}</div>
      <div onClick={onClick} style={{ fontSize: 12, color: hov && full ? "rgba(255,255,255,0.65)" : C.muted, marginBottom: 8, cursor: full ? "pointer" : "default" }}>{item.name || item.category}</div>
      <button onClick={handleAddRFQ} style={{ width: "100%", padding: "5px 8px", borderRadius: 5, fontSize: 11, fontWeight: 700, cursor: "pointer", border: added ? "1px solid #16a34a" : "1px solid #2563eb", background: added ? "#f0fdf4" : hov && full ? "rgba(255,255,255,0.15)" : "#eff6ff", color: added ? "#16a34a" : hov && full ? "#fff" : "#2563eb", transition: "all 0.15s" }}>
        {added ? "✓ In RFQ" : "+ Add to RFQ"}
      </button>
    </div>
  );
}

function RFQButtonMac({ record }) {
  const [added, setAdded] = useState(() => getRFQCart().some((i) => i.id === record.id));
  useEffect(() => {
    const update = () => setAdded(getRFQCart().some((i) => i.id === record.id));
    window.addEventListener("rfq_cart_updated", update);
    return () => window.removeEventListener("rfq_cart_updated", update);
  }, [record.id]);
  function handle() {
    if (added) { window.dispatchEvent(new CustomEvent("uniking_go_rfq")); return; }
    addToRFQCart({ id: record.id, _source: "mac", series: record.part_number, type: record.product_type || record.category || "", style: record.subcategory || "", category: record.category || "", image_url: record.product_image || "", materials: "", application: "" });
    setAdded(true);
  }
  return (
    <button onClick={handle} style={{ padding: "10px 20px", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: "pointer", letterSpacing: "0.02em", border: "none", background: added ? "#f0fdf4" : "#22c55e", color: added ? "#16a34a" : "#fff", whiteSpace: "nowrap", transition: "all 0.15s" }}>
      {added ? "✓ Added to RFQ" : "Add to RFQ"}
    </button>
  );
}

export function printMacTearSheet(record) {
  const date = new Date().toLocaleDateString("en-CA", { year: "numeric", month: "long", day: "numeric" });
  const _a = record.product_image || ""; const _b = record.diagram_image || "";
  const img = _a && /picture/i.test(_a) ? _a : _b && /picture/i.test(_b) ? _b : _a || _b;
  const diagImg = img === _a ? _b !== _a ? _b : "" : _a !== _b ? _a : "";
  const basicHeaders = Array.isArray(record.basic_headers) ? record.basic_headers : [];
  const basicRows = Array.isArray(record.basic_rows) ? record.basic_rows : [];
  const moreHeaders = Array.isArray(record.more_headers) ? record.more_headers : [];
  const moreRows = Array.isArray(record.more_rows) ? record.more_rows : [];
  const features = Array.isArray(record.features) ? record.features : [];
  const basicTable = basicHeaders.length && basicRows.length ? `<div class="section-wrap"><div class="section-title">Specifications</div><table><thead><tr>${basicHeaders.map(h=>`<th>${h}</th>`).join("")}</tr></thead><tbody>${basicRows.map((row,i)=>`<tr>${(Array.isArray(row)?row:[]).map(v=>`<td>${v??'—'}</td>`).join("")}</tr>`).join("")}</tbody></table></div>` : "";
  const moreTable = moreHeaders.length && moreRows.length ? `<div class="section-wrap"><div class="section-title">Additional Data</div><table><thead><tr>${moreHeaders.map(h=>`<th>${h}</th>`).join("")}</tr></thead><tbody>${moreRows.map((row,i)=>`<tr>${(Array.isArray(row)?row:[]).map(v=>`<td>${v??'—'}</td>`).join("")}</tr>`).join("")}</tbody></table></div>` : "";
  const featuresHtml = features.length ? `<div class="section-wrap"><div class="section-title">Key Features</div><ul style="margin:0;padding-left:18px;">${features.map(f=>`<li style="font-size:12px;color:#334155;margin-bottom:4px;">${stripVendor(f)}</li>`).join("")}</ul></div>` : "";
  const html = `<!DOCTYPE html><html><head><title>Tear Sheet — ${record.part_number}</title><style>*{margin:0;padding:0;box-sizing:border-box;}body{font-family:'Segoe UI',Arial,sans-serif;color:#111;background:#fff;}@media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact;}}.header{background:#0f2340;color:#fff;padding:22px 32px;display:flex;align-items:center;justify-content:space-between;}.accent-bar{height:4px;background:linear-gradient(90deg,#2d8a4e,#1a3a5c);}.body{padding:24px 32px;}.section-title{font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:1px;color:#1a3a5c;margin-bottom:8px;padding-bottom:4px;border-bottom:2px solid #e2e8f0;}.section-wrap{margin-bottom:20px;}table{width:100%;border-collapse:collapse;font-size:11px;margin-top:6px;}thead tr{background:#0f2340;}thead th{padding:7px 10px;color:#fff;font-weight:700;text-align:left;white-space:nowrap;}tbody tr:nth-child(even){background:#f8fafc;}tbody td{padding:6px 10px;border-bottom:1px solid #e5e7eb;color:#334155;}.footer{margin-top:24px;padding-top:12px;border-top:1px solid #e5e7eb;display:flex;justify-content:space-between;}.no-print{margin:16px 32px;display:flex;gap:10px;}@media print{.no-print{display:none!important;}}.btn{padding:8px 18px;border:none;border-radius:6px;cursor:pointer;font-size:13px;font-weight:700;}.btn-primary{background:#0f2340;color:#fff;}.btn-secondary{background:#f1f5f9;color:#334155;border:1px solid #e2e8f0;}</style></head><body><div class="no-print"><button class="btn btn-primary" onclick="window.print()">Print / Save PDF</button><button class="btn btn-secondary" onclick="window.close()">Close</button></div><div class="header"><div style="display:flex;align-items:center;gap:10px;"><img src="https://media.base44.com/images/public/69ebd56ae74b0ffcc2427c7a/9544927ac_Kshort.png" style="height:42px;filter:brightness(0) invert(1);opacity:0.85;" /><img src="https://media.base44.com/images/public/69dd9ffccab4dd693d4d92f5/e48ee59d9_Unitingthestrongestlinks_20251031_225809_0000.png" style="max-height:34px;filter:brightness(0) invert(1);opacity:0.90;" /></div><div style="text-align:right;font-size:11px;color:rgba(255,255,255,0.45);"><div style="font-size:13px;font-weight:700;color:#fff;">${record.part_number}</div><div>${record.product_type}${record.category?" · "+record.category:""}</div><div style="margin-top:4px;">${date}</div></div></div><div class="accent-bar"></div><div class="body">${diagImg?`<div class="section-wrap"><div class="section-title">Dimensional Drawing</div><div style="text-align:center;margin-bottom:8px;"><img src="${diagImg}" style="max-width:100%;max-height:260px;object-fit:contain;border:1px solid #e5e7eb;border-radius:6px;padding:10px;background:#f8fafc;" /></div></div>`:""}<div style="background:#f8fafc;border-left:3px solid #1a3a5c;border-radius:4px;padding:10px 14px;font-size:12px;color:#334155;line-height:1.7;margin-bottom:18px;">${stripVendor(record.description||"")}</div>${basicTable}${moreTable}${featuresHtml}<div class="footer"><div style="font-size:10px;color:#94a3b8;">unikingcanada.com · rfq@unikingcanada.com</div><div style="font-size:10px;color:#94a3b8;text-align:right;">${record.part_number} — No pricing information included</div></div></div></body></html>`;
  const blob = new Blob([html], { type: "text/html" });
  window.open(URL.createObjectURL(blob), "_blank");
}

export default function MacProductModal({ record, slugMap, sprocketMap, loadSprockets, onSelect, onClose }) {
  const [tab, setTab] = useState("specs");
  useEffect(() => { setTab("specs"); }, [record?.part_number]);
  if (!record) return null;

  const tabs = [
    { key: "specs", label: "Specifications" },
    record.related_sprockets?.length > 0 && { key: "sprockets", label: `Sprockets (${record.related_sprockets.length})` },
    record.related_pins?.length > 0 && { key: "pins", label: `Pins (${record.related_pins.length})` },
    record.related_attachments?.length > 0 && { key: "attachments", label: `Attachments (${record.related_attachments.length})` },
  ].filter(Boolean);

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 1000, display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "16px 12px", overflowY: "auto" }} onClick={onClose}>
      <div style={{ background: C.card, borderRadius: 12, maxWidth: 900, width: "100%", minHeight: 0, boxShadow: "0 20px 60px rgba(0,0,0,0.4)", marginTop: "auto", marginBottom: "auto" }} onClick={(e) => e.stopPropagation()}>
        <div style={{ padding: "20px clamp(14px,4vw,24px) 0", borderBottom: "1px solid " + C.border }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, marginBottom: 12, flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 20, fontWeight: 800, color: C.text, wordBreak: "break-word" }}>{record._specificPart || record.part_number}</div>
              <div style={{ fontSize: 13, color: C.muted, marginTop: 3 }}>{record.subcategory} · {record.product_type}</div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
              <button onClick={() => printMacTearSheet(record)} style={{ background: C.navy, border: "none", color: "#fff", padding: "7px 14px", borderRadius: 8, cursor: "pointer", fontSize: 12, fontWeight: 700 }}>Print Tear Sheet</button>
              <button onClick={onClose} style={{ background: "#f1f5f9", border: "none", fontSize: 18, cursor: "pointer", color: C.muted, padding: "6px 10px", borderRadius: 8, lineHeight: 1 }}>×</button>
            </div>
          </div>
          <div style={{ marginBottom: 12 }}><RFQButtonMac record={record} /></div>
          {tabs.length > 1 && (
            <div style={{ display: "flex", gap: 8, marginBottom: 0 }}>
              {tabs.map((t) => (
                <button key={t.key} onClick={() => setTab(t.key)} style={{ padding: "8px 16px", background: tab === t.key ? C.navy : "transparent", color: tab === t.key ? "#fff" : C.muted, border: tab === t.key ? "none" : "1px solid " + C.border, borderRadius: "6px 6px 0 0", cursor: "pointer", fontSize: 13, fontWeight: tab === t.key ? 700 : 400, marginBottom: -1 }}>
                  {t.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <div style={{ padding: "20px clamp(14px,4vw,24px)" }}>
          {tab === "specs" && (
            <div>
              <div style={{ display: "flex", gap: 20, marginBottom: 20, flexWrap: "wrap" }}>
                {record.product_image && (
                  <div style={{ background: C.bg, border: "1px solid " + C.border, borderRadius: 10, padding: 10, display: "flex", alignItems: "center", justifyContent: "center", width: 160, height: 130, flexShrink: 0 }}>
                    <img src={record.product_image} alt={record.part_number} style={{ maxWidth: 144, maxHeight: 114, objectFit: "contain" }} />
                  </div>
                )}
                <div style={{ flex: 1, minWidth: 200 }}>
                  {record.description && <p style={{ fontSize: 14, color: C.text, lineHeight: 1.65, margin: 0 }}>{stripVendor(record.description)}</p>}
                  {Array.isArray(record.features) && record.features.length > 0 && (
                    <ul style={{ margin: "10px 0 0", paddingLeft: 18 }}>
                      {record.features.map((f, i) => <li key={i} style={{ fontSize: 13, color: C.muted, marginBottom: 4 }}>{stripVendor(f)}</li>)}
                    </ul>
                  )}
                </div>
              </div>
              {Array.isArray(record.basic_headers) && record.basic_headers.length > 0 && Array.isArray(record.basic_rows) && record.basic_rows.length > 0 && (() => {
                const rows = record._specificPart ? record.basic_rows.filter(r => r[0] === record._specificPart) : record.basic_rows;
                const display = rows.length > 0 ? rows : record.basic_rows;
                return (
                  <div style={{ overflowX: "auto", marginBottom: 16 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>Specifications</div>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                      <thead><tr style={{ background: C.navy }}>{record.basic_headers.map((h, i) => <th key={i} style={{ padding: "8px 10px", color: "#fff", textAlign: "left", fontWeight: 600, whiteSpace: "nowrap" }}>{h}</th>)}</tr></thead>
                      <tbody>{display.map((row, ri) => <tr key={ri} style={{ background: ri % 2 === 0 ? C.bg : C.card, borderBottom: "1px solid " + C.border }}>{row.map((cell, ci) => <td key={ci} style={{ padding: "7px 10px", color: C.text, whiteSpace: "nowrap" }}>{cell}</td>)}</tr>)}</tbody>
                    </table>
                  </div>
                );
              })()}
              {Array.isArray(record.more_headers) && record.more_headers.length > 0 && Array.isArray(record.more_rows) && record.more_rows.length > 0 && (() => {
                const rows = record._specificPart ? record.more_rows.filter(r => r[0] === record._specificPart) : record.more_rows;
                const display = rows.length > 0 ? rows : record.more_rows;
                return (
                  <div style={{ overflowX: "auto" }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>Additional Data</div>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                      <thead><tr style={{ background: C.navyMid }}>{record.more_headers.map((h, i) => <th key={i} style={{ padding: "8px 10px", color: "#fff", textAlign: "left", fontWeight: 600, whiteSpace: "nowrap" }}>{h}</th>)}</tr></thead>
                      <tbody>{display.map((row, ri) => <tr key={ri} style={{ background: ri % 2 === 0 ? C.bg : C.card, borderBottom: "1px solid " + C.border }}>{row.map((cell, ci) => <td key={ci} style={{ padding: "7px 10px", color: C.text, whiteSpace: "nowrap" }}>{cell}</td>)}</tr>)}</tbody>
                    </table>
                  </div>
                );
              })()}
            </div>
          )}

          {tab === "sprockets" && (() => { loadSprockets(); return (
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: 1, marginBottom: 12 }}>Compatible Sprockets</div>
              {Object.keys(sprocketMap).length === 0 && <div style={{ fontSize: 13, color: C.muted, padding: "12px 0" }}>Loading sprocket data...</div>}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px,1fr))", gap: 10 }}>
                {(record.related_sprockets || []).map((sp, i) => {
                  const groupSlug = sp.slug?.replace(/-\d+$/, "");
                  const dbRecord = sprocketMap[sp.slug] || sprocketMap[groupSlug] || sprocketMap[sp.part_number?.toLowerCase()] || null;
                  const synthetic = dbRecord || { part_number: sp.part_number, product_type: "Sprocket", category: sp.category, subcategory: sp.name || sp.category, description: sp.name || sp.category, product_image: sp.image || "https://macchain.com/uploads/product-images/_subcategoryImage/sprockets_millchain_abc.png", features: [], basic_headers: [], basic_rows: [], more_headers: [], more_rows: [], related_sprockets: [], related_pins: [], related_attachments: [] };
                  return <RelatedCard key={i} item={sp} full={synthetic} onClick={() => onSelect({ ...synthetic, _specificPart: sp.part_number, _parentPart: record.part_number, _parentRecord: record })} />;
                })}
              </div>
            </div>
          ); })()}

          {tab === "pins" && (
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: 1, marginBottom: 12 }}>Compatible Pins & Connecting Links</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px,1fr))", gap: 10 }}>
                {(record.related_pins || []).map((pin, i) => {
                  const dbRecord = slugMap?.[pin.slug] || null;
                  const synthetic = dbRecord || { part_number: pin.part_number, product_type: "Pin", category: pin.category, subcategory: pin.name || pin.category, description: pin.name || pin.category, product_image: pin.image, features: [], basic_headers: [], basic_rows: [], more_headers: [], more_rows: [], related_sprockets: [], related_pins: [], related_attachments: [] };
                  return <RelatedCard key={i} item={pin} full={synthetic} onClick={() => onSelect({ ...synthetic, _specificPart: pin.part_number, _parentPart: record.part_number, _parentRecord: record })} />;
                })}
              </div>
            </div>
          )}

          {tab === "attachments" && (
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: 1, marginBottom: 12 }}>Available Attachments</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px,1fr))", gap: 10 }}>
                {(record.related_attachments || []).map((att, i) => {
                  const dbRecord = slugMap?.[att.slug] || null;
                  const synthetic = dbRecord || { part_number: att.part_number, product_type: "Attachment", category: att.category, subcategory: att.name || att.category, description: att.name || att.category, product_image: att.image, features: [], basic_headers: [], basic_rows: [], more_headers: [], more_rows: [], related_sprockets: [], related_pins: [], related_attachments: [] };
                  return <RelatedCard key={i} item={att} full={synthetic} onClick={() => onSelect({ ...synthetic, _specificPart: att.part_number, _parentPart: record.part_number, _parentRecord: record })} />;
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}