import { useState } from "react";
import { APPROVALS, getAccessoryProducts } from "@/lib/fourBData";
import { ApprovalBadge, addToRFQCart, getRFQCart } from "./FourBProductCard";

const FOURBRED = "#cc0000";
const NAVY = "#0f2340";
const NAVYMID = "#1a3a5c";
const LOGO = "https://www.go4b.com/usa/images/4b-logo.gif";

function printDataSheet(product) {
  const date = new Date().toLocaleDateString("en-CA", { year: "numeric", month: "long", day: "numeric" });
  const approvalsList = product.approvals?.map(a => APPROVALS[a]?.fullLabel || a).join(", ") || "None";
  const specRows = Object.entries(product.specs || {}).map(([k, v]) =>
    `<tr><td style="padding:6px 10px;color:#64748b;font-weight:600;width:40%;border-bottom:1px solid #e5e7eb;">${k}</td><td style="padding:6px 10px;color:#0f172a;border-bottom:1px solid #e5e7eb;">${v}</td></tr>`
  ).join("");

  const html = `<!DOCTYPE html><html><head><title>4B Data Sheet — ${product.name}</title>
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{font-family:'Segoe UI',Arial,sans-serif;color:#111;background:#fff}
  @media print{.no-print{display:none!important};body{-webkit-print-color-adjust:exact}}
  .header{background:#cc0000;color:#fff;padding:18px 32px;display:flex;justify-content:space-between;align-items:center}
  .accent{height:4px;background:#0f2340}
  .body{padding:24px 32px}
  .hero{display:flex;gap:24px;margin-bottom:20px;padding-bottom:20px;border-bottom:1px solid #e5e7eb}
  .img{width:140px;height:110px;object-fit:contain;border:1px solid #e5e7eb;border-radius:6px;padding:8px;background:#f8fafc;flex-shrink:0}
  .tag{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#cc0000;margin-bottom:6px}
  .name{font-size:24px;font-weight:900;color:#0f2340;line-height:1.1}
  .desc{background:#f8fafc;border-left:3px solid #0f2340;padding:10px 14px;font-size:12px;color:#334155;line-height:1.7;margin-bottom:16px}
  .section-title{font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:1px;color:#1a3a5c;margin-bottom:8px;padding-bottom:4px;border-bottom:2px solid #e2e8f0}
  .section{margin-bottom:18px}
  ul{padding-left:18px}
  li{font-size:12px;color:#334155;margin-bottom:4px}
  .approvals{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:18px}
  .approval-badge{padding:4px 10px;border-radius:20px;font-size:11px;font-weight:700;border:1px solid rgba(0,0,0,0.15)}
  table{width:100%;border-collapse:collapse;font-size:12px}
  .footer{margin-top:24px;padding-top:12px;border-top:1px solid #e5e7eb;display:flex;justify-content:space-between}
  .footer-text{font-size:10px;color:#94a3b8}
  .disclaimer{background:#fffbeb;border:1px solid #fde68a;padding:10px 14px;border-radius:6px;font-size:11px;color:#92400e;margin-top:16px}
  .no-print{margin:16px 32px;display:flex;gap:10px}
  .btn{padding:8px 18px;border:none;border-radius:6px;cursor:pointer;font-size:13px;font-weight:700}
</style></head><body>
<div class="no-print">
  <button class="btn" style="background:#cc0000;color:#fff" onclick="window.print()">Print / Save PDF</button>
  <button class="btn" style="background:#f1f5f9;color:#334155;border:1px solid #e2e8f0" onclick="window.close()">Close</button>
</div>
<div class="header">
  <div>
    <div style="font-size:11px;opacity:0.7;font-weight:600;letter-spacing:1px;margin-bottom:4px">4B BRAIME™ ELECTRONICS</div>
    <div style="font-size:20px;font-weight:900">${product.name}</div>
  </div>
  <div style="text-align:right;font-size:11px;opacity:0.7">
    <div>Data Sheet</div>
    <div style="margin-top:2px">${date}</div>
    <div style="margin-top:2px">go4b.com</div>
  </div>
</div>
<div class="accent"></div>
<div class="body">
  <div class="hero">
    ${product.image ? `<img class="img" src="${product.image}" alt="${product.name}" />` : ""}
    <div>
      <div class="tag">4B Braime™ · ${product.keyFunction}</div>
      <div class="name">${product.name}</div>
      ${product.applications?.length ? `<div style="margin-top:8px;display:flex;gap:6px;flex-wrap:wrap">${product.applications.map(a => `<span style="font-size:10px;background:#f1f5f9;color:#334155;padding:2px 8px;border-radius:99px;font-weight:600">${a}</span>`).join("")}</div>` : ""}
    </div>
  </div>

  ${product.description ? `<div class="desc">${product.description}</div>` : ""}

  ${product.approvals?.length ? `<div class="section"><div class="section-title">Approvals & Certifications</div><div class="approvals">${product.approvals.map(c => { const a = {"CSA":["#c00","#fff5f5"],"ATEX":["#e07b00","#fff8f0"],"CE":["#003399","#f0f4ff"],"IECEx":["#006600","#f0fff4"],"MET":["#660099","#faf0ff"]}[c]||["#333","#f3f4f6"]; return `<span class="approval-badge" style="color:${a[0]};background:${a[1]}">${c} — ${{"CSA":"USA & Canada","ATEX":"Europe (Dust/Gas)","CE":"Europe","IECEx":"International","MET":"USA & Canada"}[c]||c}</span>`; }).join("")}</div></div>` : ""}

  ${product.features?.length ? `<div class="section"><div class="section-title">Key Features</div><ul>${product.features.map(f => `<li>${f}</li>`).join("")}</ul></div>` : ""}

  ${specRows ? `<div class="section"><div class="section-title">Technical Specifications</div><table><tbody>${specRows}</tbody></table></div>` : ""}

  ${product.downloads?.length ? `<div class="section"><div class="section-title">Downloads</div>${product.downloads.map(d => `<div style="padding:6px 0;font-size:12px;color:#1a3a5c;font-weight:600">📄 <a href="${d.url}" style="color:#cc0000">${d.name}</a> (${d.type})</div>`).join("")}</div>` : ""}

  <div class="disclaimer">
    ⚠ Final product selection and specifications must be confirmed by Uniking before supply. All information sourced from 4B Braime™ (go4b.com). Contact Uniking Canada for availability, pricing and application support.
  </div>

  <div class="footer">
    <div class="footer-text">
      <div style="font-weight:700;font-size:11px;color:#0f2340">Uniking Canada</div>
      <div>unikingcanada.com · rfq@unikingcanada.com</div>
    </div>
    <div class="footer-text" style="text-align:right">
      <div>4B Braime™ Authorized Distributor</div>
      <div style="margin-top:2px">go4b.com</div>
    </div>
  </div>
</div>
</body></html>`;
  const blob = new Blob([html], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  window.open(url, "_blank");
}

export default function FourBProductDetail({ product, onClose, onSelectProduct }) {
  const [tab, setTab] = useState("overview");
  const [added, setAdded] = useState(() => getRFQCart().some(i => i.id === product.id));
  const accessories = getAccessoryProducts(product);

  const tabs = [
    ["overview", "Overview"],
    product.specs ? ["specs", "Specifications"] : null,
    product.downloads?.length ? ["downloads", "Downloads"] : null,
    accessories.length ? ["accessories", `Accessories (${accessories.length})`] : null,
  ].filter(Boolean);

  function handleRFQ() {
    if (added) { window.dispatchEvent(new CustomEvent("uniking_go_rfq")); return; }
    addToRFQCart(product);
    setAdded(true);
  }

  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.65)", zIndex: 1000,
      display: "flex", alignItems: "flex-start", justifyContent: "center",
      padding: "16px 12px", overflowY: "auto"
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: "#fff", borderRadius: 12, width: "100%", maxWidth: 800,
        boxShadow: "0 24px 80px rgba(0,0,0,0.3)", marginTop: "auto", marginBottom: "auto"
      }}>

        {/* Header */}
        <div style={{ background: `linear-gradient(135deg, ${FOURBRED} 0%, #990000 100%)`, borderRadius: "12px 12px 0 0", padding: "20px 24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
            <div style={{ display: "flex", gap: 16, alignItems: "flex-start", flex: 1 }}>
              {product.image && (
                <div style={{ background: "#fff", borderRadius: 8, padding: 8, flexShrink: 0, width: 110, height: 84, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <img src={product.image} alt="" style={{ maxWidth: 98, maxHeight: 72, objectFit: "contain" }}
                    onError={e => { e.target.parentElement.style.display = "none"; }} />
                </div>
              )}
              <div>
                <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "1.5px", color: "rgba(255,255,255,0.6)", marginBottom: 4, fontWeight: 700 }}>
                  4B Braime™ · Electronics & Monitoring
                </div>
                <div style={{ fontSize: 20, fontWeight: 900, color: "#fff", lineHeight: 1.2 }}>{product.name}</div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.7)", marginTop: 4 }}>{product.keyFunction}</div>
                {product.approvals?.length > 0 && (
                  <div style={{ display: "flex", gap: 5, marginTop: 10, flexWrap: "wrap" }}>
                    {product.approvals.map(a => <ApprovalBadge key={a} code={a} />)}
                  </div>
                )}
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, flexShrink: 0, alignItems: "flex-end" }}>
              <button onClick={onClose} style={{ background: "rgba(255,255,255,0.15)", border: "none", color: "#fff", width: 30, height: 30, borderRadius: 6, cursor: "pointer", fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
              <a href={product.source_url} target="_blank" rel="noopener noreferrer"
                style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.3)", color: "#fff", padding: "5px 12px", borderRadius: 6, cursor: "pointer", fontSize: 11, fontWeight: 700, textDecoration: "none", whiteSpace: "nowrap", textAlign: "center" }}>
                4B Site ↗
              </a>
              <button onClick={() => printDataSheet(product)}
                style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.3)", color: "#fff", padding: "5px 12px", borderRadius: 6, cursor: "pointer", fontSize: 11, fontWeight: 700, whiteSpace: "nowrap" }}>
                Print Data Sheet
              </button>
            </div>
          </div>

          {/* RFQ button */}
          <div style={{ marginTop: 14 }}>
            <button onClick={handleRFQ} style={{
              background: added ? "#f0fdf4" : "#fff", color: added ? "#16a34a" : FOURBRED,
              border: "none", padding: "10px 22px", borderRadius: 8, fontSize: 13, fontWeight: 800, cursor: "pointer",
            }}>
              {added ? "✓ Added to RFQ" : "Add to RFQ"}
            </button>
          </div>
        </div>

        {/* Tabs */}
        {tabs.length > 1 && (
          <div style={{ display: "flex", borderBottom: `2px solid #f1f5f9`, padding: "0 24px" }}>
            {tabs.map(([id, label]) => (
              <button key={id} onClick={() => setTab(id)} style={{
                padding: "11px 14px", border: "none", background: "none", cursor: "pointer",
                fontSize: 12, fontWeight: 700, whiteSpace: "nowrap",
                color: tab === id ? FOURBRED : "#64748b",
                borderBottom: tab === id ? `2px solid ${FOURBRED}` : "2px solid transparent",
                marginBottom: -2
              }}>{label}</button>
            ))}
          </div>
        )}

        {/* Body */}
        <div style={{ padding: "20px 24px 28px", overflowY: "auto", maxHeight: "60vh" }}>

          {tab === "overview" && (
            <div>
              {product.description && (
                <div style={{ fontSize: 13, color: "#334155", lineHeight: 1.75, background: "#f8fafc", padding: "12px 14px", borderRadius: 6, borderLeft: `3px solid ${FOURBRED}`, marginBottom: 20 }}>
                  {product.description}
                </div>
              )}
              {product.features?.length > 0 && (
                <div style={{ marginBottom: 20 }}>
                  <div style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: 1, color: NAVYMID, marginBottom: 10 }}>Key Features</div>
                  <ul style={{ paddingLeft: 18, display: "flex", flexDirection: "column", gap: 5 }}>
                    {product.features.map((f, i) => (
                      <li key={i} style={{ fontSize: 13, color: "#334155", lineHeight: 1.5 }}>{f}</li>
                    ))}
                  </ul>
                </div>
              )}
              {product.applications?.length > 0 && (
                <div style={{ marginBottom: 20 }}>
                  <div style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: 1, color: NAVYMID, marginBottom: 10 }}>Applications</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {product.applications.map((a, i) => (
                      <span key={i} style={{ fontSize: 11, background: "#f1f5f9", color: NAVYMID, padding: "4px 10px", borderRadius: 20, fontWeight: 600 }}>{a}</span>
                    ))}
                  </div>
                </div>
              )}
              {product.approvals?.length > 0 && (
                <div>
                  <div style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: 1, color: NAVYMID, marginBottom: 10 }}>Approvals & Certifications</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                    {product.approvals.map(code => {
                      const a = APPROVALS[code];
                      if (!a) return null;
                      return (
                        <div key={code} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 14px", borderRadius: 8, border: `1px solid ${a.color}33`, background: a.bg }}>
                          <img src={a.logo} alt={a.label} style={{ height: 28, width: "auto" }} onError={e => e.target.style.display = "none"} />
                          <div>
                            <div style={{ fontSize: 12, fontWeight: 800, color: a.color }}>{a.label}</div>
                            <div style={{ fontSize: 10, color: a.color, opacity: 0.8 }}>{a.fullLabel}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              {product.partNumbers?.length > 0 && (
                <div style={{ marginTop: 20 }}>
                  <div style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: 1, color: NAVYMID, marginBottom: 8 }}>Part Numbers</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {product.partNumbers.map((pn, i) => (
                      <span key={i} style={{ fontFamily: "monospace", fontSize: 12, background: "#0f2340", color: "#fff", padding: "4px 10px", borderRadius: 6, fontWeight: 700 }}>{pn}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {tab === "specs" && product.specs && (
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <tbody>
                {Object.entries(product.specs).map(([k, v], i) => (
                  <tr key={k} style={{ background: i % 2 ? "#f8fafc" : "#fff" }}>
                    <td style={{ padding: "8px 12px", color: "#64748b", fontWeight: 600, width: "40%", verticalAlign: "top", borderBottom: "1px solid #e5e7eb" }}>{k}</td>
                    <td style={{ padding: "8px 12px", color: NAVY, borderBottom: "1px solid #e5e7eb" }}>{v}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {tab === "downloads" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {product.downloads.map((d, i) => {
                const icon = d.type === "PDF" ? "📄" : d.type === "DWG" ? "📐" : "📁";
                return (
                  <a key={i} href={d.url} target="_blank" rel="noopener noreferrer" style={{
                    display: "flex", alignItems: "center", gap: 12, padding: "12px 16px",
                    background: "#f8fafc", borderRadius: 8, border: "1px solid #e2e8f0",
                    textDecoration: "none", transition: "border-color 0.15s"
                  }}>
                    <span style={{ fontSize: 22 }}>{icon}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: NAVYMID }}>{d.name}</div>
                      <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 2 }}>
                        {d.type} — Source: 4B Braime™ (go4b.com)
                      </div>
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 700, color: FOURBRED, whiteSpace: "nowrap" }}>Download ↗</span>
                  </a>
                );
              })}
            </div>
          )}

          {tab === "accessories" && (
            <div>
              <p style={{ fontSize: 12, color: "#64748b", marginBottom: 16 }}>
                Compatible accessories for the {product.name}. Each accessory can be added to your RFQ independently.
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 12 }}>
                {accessories.map(acc => (
                  <AccessoryCard key={acc.id} product={acc} onView={() => onSelectProduct && onSelectProduct(acc)} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function AccessoryCard({ product, onView }) {
  const [added, setAdded] = useState(() => getRFQCart().some(i => i.id === product.id));
  function handleRFQ(e) {
    e.stopPropagation();
    if (added) { window.dispatchEvent(new CustomEvent("uniking_go_rfq")); return; }
    addToRFQCart(product);
    setAdded(true);
  }
  return (
    <div style={{ border: "1px solid #e2e8f0", borderRadius: 8, overflow: "hidden", background: "#fff" }}>
      <div style={{ background: "#f8fafc", height: 90, display: "flex", alignItems: "center", justifyContent: "center", borderBottom: "1px solid #f1f5f9" }}>
        <img src={product.image} alt={product.name} style={{ maxHeight: 78, maxWidth: "88%", objectFit: "contain" }}
          onError={e => e.target.style.display = "none"} />
      </div>
      <div style={{ padding: "10px 12px" }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: "#0f2340", marginBottom: 4 }}>{product.name}</div>
        <div style={{ fontSize: 10, color: "#64748b", marginBottom: 10, lineHeight: 1.5,
          display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
          {product.description}
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          <button onClick={onView} style={{ flex: 1, padding: "5px 8px", background: "#f1f5f9", border: "none", borderRadius: 6, fontSize: 10, fontWeight: 700, color: "#1a3a5c", cursor: "pointer" }}>View</button>
          <button onClick={handleRFQ} style={{
            flex: 1, padding: "5px 8px", border: added ? "1px solid #16a34a" : "1px solid #cc0000",
            background: added ? "#f0fdf4" : "#fff1f0", borderRadius: 6, fontSize: 10, fontWeight: 700,
            color: added ? "#16a34a" : "#cc0000", cursor: "pointer"
          }}>{added ? "✓ RFQ" : "+ RFQ"}</button>
        </div>
      </div>
    </div>
  );
}