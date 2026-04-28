import { useState, useEffect } from "react";
import { MacChainProduct } from "@/api/entities";

const SUBCATEGORIES = [
  { key: "Offset Sidebar", label: "Offset Sidebar", desc: "Recommended for most conveying & elevating applications. Industry: Grain Processing, Car Wash, Forest Products." },
  { key: "Straight Sidebar", label: "Straight Sidebar", desc: '"C-type" chain recommended for reversible conveyors. Allows easy visual inspection. Industry: Grain Processing, Forest Products.' },
  { key: "Drag Chain", label: "Drag Chain", desc: "Designed for wood waste recycling and forest product drag conveyor applications." },
  { key: "Super Mac", label: "Super Mac Drag Chain", desc: "Extended sidebar design for increased strength and wear resistance. Wood waste & forest products." },
  { key: "Mega Mac", label: "Mega Mac Drag Chain", desc: "The heaviest-duty welded steel drag chain for the most demanding applications." },
];

const UNIKING_RED = "#C41E3A";
const UNIKING_DARK = "#1a1a1a";
const UNIKING_GRAY = "#f5f5f5";
const UNIKING_BORDER = "#e0e0e0";

// Strip trailing -N from sprocket slugs like "wr132xhd-8" → "wr132xhd"
function parentSprocketSlug(slug) {
  return slug ? slug.replace(/-\d+$/, "") : slug;
}

// ---- TEAR SHEET PRINT ----
function printTearSheet(p, type) {
  const mainImage = p.product_image || p.image || "";
  const diagImage = (p.diagram_image && p.diagram_image !== mainImage) ? p.diagram_image : null;
  const hasSpecs = p.basic_headers?.length > 0 && p.basic_rows?.length > 0;
  const hasMoreSpecs = p.more_headers?.length > 0 && p.more_rows?.length > 0;

  const specsHtml = hasSpecs ? `
    <div class="section-title">BASIC SPECIFICATIONS</div>
    <table>
      <thead><tr>${p.basic_headers.map(h => `<th>${h}</th>`).join("")}</tr></thead>
      <tbody>${p.basic_rows.map((row, ri) => `<tr class="${ri%2===0?'even':'odd'}">${row.map((v,vi) => `<td class="${vi===0?'bold':''}">${v}</td>`).join("")}</tr>`).join("")}</tbody>
    </table>` : "";

  const moreSpecsHtml = hasMoreSpecs ? `
    <div class="section-title" style="margin-top:20px">ADDITIONAL SPECIFICATIONS</div>
    <table>
      <thead><tr>${p.more_headers.map(h => `<th>${h}</th>`).join("")}</tr></thead>
      <tbody>${p.more_rows.map((row, ri) => `<tr class="${ri%2===0?'even':'odd'}">${row.map((v,vi) => `<td class="${vi===0?'bold':''}">${v}</td>`).join("")}</tr>`).join("")}</tbody>
    </table>` : "";

  const featuresHtml = p.features?.length > 0 ? `
    <div class="section-title">FEATURES</div>
    <ul>${p.features.map(f => `<li>${f}</li>`).join("")}</ul>` : "";

  const industryHtml = p.industry ? `<div class="industry"><strong>Industry:</strong> ${p.industry}</div>` : "";
  const categoryHtml = (p.category || p.name) ? `<div class="category-label">${p.category || p.name}${p.subcategory ? " — " + p.subcategory : ""}</div>` : "";

  const imgHtml = mainImage ? `<img class="main-img" src="${mainImage}" alt="${p.part_number}" />` : "";
  const diagHtml = diagImage ? `<img class="diag-img" src="${diagImage}" alt="Technical Diagram" />` : "";

  const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8"/>
<title>Tear Sheet — ${p.part_number}</title>
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family: 'Segoe UI', Arial, sans-serif; color: #1a1a1a; background:#fff; padding: 0; }
  .header { background: #1a1a1a; color: #fff; padding: 18px 32px; display:flex; align-items:center; gap:18px; border-bottom: 4px solid #C41E3A; }
  .logo-box { width:48px; height:48px; background:#C41E3A; border-radius:8px; display:flex; align-items:center; justify-content:center; font-weight:900; font-size:22px; color:#fff; letter-spacing:1px; flex-shrink:0; }
  .header-text { flex:1; }
  .header-title { font-size:13px; color:#aaa; letter-spacing:2px; text-transform:uppercase; }
  .header-part { font-size:26px; font-weight:800; letter-spacing:0.5px; }
  .header-type { font-size:12px; color:#C41E3A; letter-spacing:1.5px; text-transform:uppercase; margin-top:2px; }
  .contact { font-size:11px; color:#aaa; text-align:right; line-height:1.7; }
  .body { padding: 28px 32px; }
  .top-row { display:flex; gap:28px; margin-bottom:24px; }
  .images { display:flex; flex-direction:column; gap:12px; flex:0 0 280px; }
  .main-img { max-width:280px; max-height:220px; object-fit:contain; border:1px solid #e0e0e0; border-radius:8px; padding:12px; background:#f5f5f5; }
  .diag-img { max-width:280px; max-height:140px; object-fit:contain; border:1px solid #e0e0e0; border-radius:8px; padding:10px; background:#f5f5f5; }
  .info { flex:1; }
  .category-label { font-size:11px; color:#999; text-transform:uppercase; letter-spacing:1.5px; margin-bottom:8px; }
  .industry { font-size:13px; color:#555; background:#f5f5f5; border-radius:6px; padding:8px 12px; margin-bottom:14px; }
  ul { padding-left:20px; margin-bottom:16px; }
  li { font-size:13px; color:#444; line-height:1.9; }
  .section-title { font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:2px; color:#999; margin-bottom:10px; padding-bottom:6px; border-bottom:1px solid #e0e0e0; }
  table { width:100%; border-collapse:collapse; font-size:12px; margin-bottom:8px; }
  th { background:#1a1a1a; color:#fff; padding:9px 14px; text-align:left; font-weight:600; font-size:11px; white-space:nowrap; }
  td { padding:9px 14px; white-space:nowrap; border-bottom:1px solid #e0e0e0; }
  tr.even td { background:#fff; }
  tr.odd td { background:#f5f5f5; }
  td.bold { font-weight:700; color:#C41E3A; }
  .footer { margin-top:32px; padding:16px 32px; border-top:2px solid #e0e0e0; display:flex; justify-content:space-between; align-items:center; }
  .footer-note { font-size:11px; color:#999; }
  .footer-brand { font-size:12px; color:#C41E3A; font-weight:700; }
  @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
</style>
</head>
<body>
<div class="header">
  <div class="logo-box">U</div>
  <div class="header-text">
    <div class="header-title">Uniking Canada — Product Tear Sheet</div>
    <div class="header-part">${p.part_number}</div>
    <div class="header-type">${type}</div>
  </div>
  <div class="contact">
    unikingcanada.com<br/>
    info@unikingcanada.com<br/>
    Mirabel, QC
  </div>
</div>
<div class="body">
  <div class="top-row">
    ${(mainImage || diagImage) ? `<div class="images">${imgHtml}${diagHtml}</div>` : ""}
    <div class="info">
      ${categoryHtml}
      ${industryHtml}
      ${featuresHtml}
    </div>
  </div>
  ${specsHtml}
  ${moreSpecsHtml}
</div>
<div class="footer">
  <div class="footer-note">For pricing and availability, contact Uniking Canada. Specifications subject to change without notice.</div>
  <div class="footer-brand">UNIKING CANADA</div>
</div>
</body>
</html>`;

  const w = window.open("", "_blank");
  w.document.write(html);
  w.document.close();
  setTimeout(() => w.print(), 600);
}

// ---- IMAGE CAROUSEL ----
function ImageCarousel({ images }) {
  const [idx, setIdx] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const imgs = images.filter(Boolean);
  if (imgs.length === 0) return null;

  return (
    <div style={{ position: "relative" }}>
      {/* Main image */}
      <div
        onClick={() => setLightbox(true)}
        style={{ background: UNIKING_GRAY, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", padding: 24, minHeight: 260, cursor: "zoom-in", position: "relative" }}
      >
        <img src={imgs[idx]} alt="" style={{ maxWidth: "100%", maxHeight: 280, objectFit: "contain" }} />
        {imgs.length > 1 && (
          <div style={{ position: "absolute", bottom: 10, right: 12, fontSize: 12, color: "#666", background: "rgba(255,255,255,0.9)", borderRadius: 4, padding: "3px 8px", fontWeight: 600 }}>
            {idx + 1} / {imgs.length}
          </div>
        )}
        <div style={{ position: "absolute", bottom: 10, left: 12, fontSize: 11, color: "#999", background: "rgba(255,255,255,0.8)", borderRadius: 4, padding: "2px 6px" }}>
          Click to enlarge
        </div>
      </div>
      {/* Thumbnails */}
      {imgs.length > 1 && (
        <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
          {imgs.map((src, i) => (
            <div
              key={i}
              onClick={() => setIdx(i)}
              style={{
                width: 100, height: 90, border: `2px solid ${i === idx ? UNIKING_RED : UNIKING_BORDER}`,
                borderRadius: 8, overflow: "hidden", cursor: "pointer", background: UNIKING_GRAY,
                display: "flex", alignItems: "center", justifyContent: "center", padding: 8, flexShrink: 0,
                boxShadow: i === idx ? "0 0 0 1px " + UNIKING_RED : "none",
              }}
            >
              <img src={src} alt="" style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} />
            </div>
          ))}
        </div>
      )}
      {/* Lightbox */}
      {lightbox && (
        <div
          onClick={() => setLightbox(false)}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 2000, display: "flex", alignItems: "center", justifyContent: "center", cursor: "zoom-out" }}
        >
          {imgs.length > 1 && (
            <button onClick={e => { e.stopPropagation(); setIdx(i => (i - 1 + imgs.length) % imgs.length); }}
              style={{ position: "absolute", left: 24, background: "rgba(255,255,255,0.15)", border: "none", color: "#fff", fontSize: 28, borderRadius: 6, padding: "8px 16px", cursor: "pointer" }}>‹</button>
          )}
          <img src={imgs[idx]} alt="" style={{ maxWidth: "90vw", maxHeight: "85vh", objectFit: "contain", borderRadius: 8 }} />
          {imgs.length > 1 && (
            <button onClick={e => { e.stopPropagation(); setIdx(i => (i + 1) % imgs.length); }}
              style={{ position: "absolute", right: 24, background: "rgba(255,255,255,0.15)", border: "none", color: "#fff", fontSize: 28, borderRadius: 6, padding: "8px 16px", cursor: "pointer" }}>›</button>
          )}
          <button onClick={() => setLightbox(false)}
            style={{ position: "absolute", top: 20, right: 20, background: "rgba(255,255,255,0.15)", border: "none", color: "#fff", fontSize: 20, borderRadius: 6, padding: "4px 12px", cursor: "pointer" }}>×</button>
        </div>
      )}
    </div>
  );
}

// ---- SPEC TABLE ----
function SpecTable({ headers, rows }) {
  return (
    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
      <thead>
        <tr style={{ background: UNIKING_DARK, color: "#fff" }}>
          {headers.map((h, i) => (
            <th key={i} style={{ padding: "10px 16px", textAlign: "left", fontWeight: 600, whiteSpace: "nowrap", fontSize: 12 }}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, ri) => (
          <tr key={ri} style={{ borderBottom: `1px solid ${UNIKING_BORDER}`, background: ri % 2 === 0 ? "#fff" : UNIKING_GRAY }}>
            {row.map((val, vi) => (
              <td key={vi} style={{ padding: "10px 16px", whiteSpace: "nowrap", fontWeight: vi === 0 ? 700 : 400, color: vi === 0 ? UNIKING_RED : UNIKING_DARK }}>{val}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// ---- RELATED ITEM CARD ----
function RelatedCard({ item, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{ border: `1px solid ${UNIKING_BORDER}`, borderRadius: 8, overflow: "hidden", background: "#fff", transition: "all 0.15s", cursor: "pointer" }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.12)"; e.currentTarget.style.borderColor = UNIKING_RED; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.borderColor = UNIKING_BORDER; }}
    >
      {(item.image || item.product_image) && (
        <div style={{ background: UNIKING_GRAY, height: 100, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", padding: 8 }}>
          <img src={item.image || item.product_image} alt={item.part_number} style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} />
        </div>
      )}
      <div style={{ padding: "10px 12px" }}>
        <div style={{ fontWeight: 700, fontSize: 13, color: UNIKING_RED, marginBottom: 2 }}>{item.part_number}</div>
        <div style={{ fontSize: 11, color: "#888", lineHeight: 1.4 }}>{item.name || item.category}</div>
        <div style={{ fontSize: 10, color: UNIKING_RED, marginTop: 6, fontWeight: 600 }}>View specs →</div>
      </div>
    </div>
  );
}

// ---- PRODUCT DETAIL (chain) ----
function ProductDetail({ product: p, onBack, activeRelTab, setActiveRelTab, activeSpecTab, setActiveSpecTab, onRelatedClick }) {
  const images = [p.product_image, p.diagram_image].filter(Boolean).filter((v, i, a) => a.indexOf(v) === i);

  const relTabs = [
    { key: "pins", label: `Pins (${p.related_pins?.length || 0})`, items: p.related_pins || [] },
    { key: "attachments", label: `Attachments (${p.related_attachments?.length || 0})`, items: p.related_attachments || [] },
    { key: "sprockets", label: `Sprockets (${p.related_sprockets?.length || 0})`, items: p.related_sprockets || [] },
  ].filter(t => t.items.length > 0);

  const hasRelated = relTabs.length > 0;
  const hasSpecs = p.basic_headers?.length > 0 && p.basic_rows?.length > 0;
  const hasMoreSpecs = p.more_headers?.length > 0 && p.more_rows?.length > 0;

  return (
    <div style={{ paddingTop: 28 }}>
      {/* Back + actions bar */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
        <button onClick={onBack} style={{ background: "none", border: `1px solid ${UNIKING_BORDER}`, borderRadius: 6, padding: "8px 16px", cursor: "pointer", fontSize: 13, color: "#555" }}>← Back</button>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 11, color: "#999", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 2 }}>{p.category} — {p.subcategory}</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: UNIKING_DARK }}>{p.part_number}</div>
        </div>
        <button
          onClick={() => printTearSheet(p, "Welded Steel Chain")}
          style={{ padding: "8px 18px", background: UNIKING_DARK, color: "#fff", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 12, fontWeight: 600, letterSpacing: 0.5 }}
        >Print Tear Sheet</button>
      </div>

      {/* Image + info */}
      <div style={{ display: "grid", gridTemplateColumns: images.length > 0 ? "340px 1fr" : "1fr", gap: 28, marginBottom: 32 }}>
        {images.length > 0 && <ImageCarousel images={images} />}
        <div>
          {p.description && (
            <div style={{ fontSize: 14, color: "#444", lineHeight: 1.8, marginBottom: 14, borderLeft: `3px solid ${UNIKING_RED}`, paddingLeft: 14 }}>{p.description}</div>
          )}
          {p.industry && (
            <div style={{ fontSize: 13, color: "#555", background: UNIKING_GRAY, borderRadius: 6, padding: "8px 12px", marginBottom: 12 }}>
              <strong>Industry:</strong> {p.industry}
            </div>
          )}
          {p.features?.length > 0 && (
            <ul style={{ margin: 0, padding: "0 0 0 20px", lineHeight: 2 }}>
              {p.features.map((f, i) => <li key={i} style={{ fontSize: 13, color: "#444" }}>{f}</li>)}
            </ul>
          )}
        </div>
      </div>

      {/* Spec tabs */}
      {(hasSpecs || hasMoreSpecs) && (
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: "flex", borderBottom: `1px solid ${UNIKING_BORDER}`, marginBottom: 16 }}>
            {[{ key: "basic", label: "Basic Specs" }, ...(hasMoreSpecs ? [{ key: "more", label: "More Specs" }] : [])].map(tab => (
              <button key={tab.key} onClick={() => setActiveSpecTab(tab.key)} style={{ padding: "10px 20px", border: "none", borderBottom: activeSpecTab === tab.key ? `2px solid ${UNIKING_RED}` : "2px solid transparent", background: "none", cursor: "pointer", fontWeight: activeSpecTab === tab.key ? 700 : 500, color: activeSpecTab === tab.key ? UNIKING_RED : "#666", fontSize: 14 }}>
                {tab.label}
              </button>
            ))}
          </div>
          <div style={{ overflowX: "auto" }}>
            {activeSpecTab === "basic" && hasSpecs && <SpecTable headers={p.basic_headers} rows={p.basic_rows} />}
            {activeSpecTab === "more" && hasMoreSpecs && <SpecTable headers={p.more_headers} rows={p.more_rows} />}
          </div>
        </div>
      )}

      {/* Related products */}
      {hasRelated && (
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 2, color: "#999", marginBottom: 12 }}>Related Products</div>
          <div style={{ display: "flex", borderBottom: `1px solid ${UNIKING_BORDER}`, marginBottom: 24 }}>
            {relTabs.map(tab => (
              <button key={tab.key} onClick={() => setActiveRelTab(tab.key)} style={{ padding: "10px 20px", border: "none", borderBottom: activeRelTab === tab.key ? `2px solid ${UNIKING_RED}` : "2px solid transparent", background: "none", cursor: "pointer", fontWeight: activeRelTab === tab.key ? 700 : 500, color: activeRelTab === tab.key ? UNIKING_RED : "#666", fontSize: 13 }}>
                {tab.label}
              </button>
            ))}
          </div>
          {relTabs.map(tab => (
            activeRelTab === tab.key && (
              <div key={tab.key} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 16 }}>
                {tab.items.map((item, i) => (
                  <RelatedCard key={i} item={item} onClick={() => onRelatedClick(item, tab.key)} />
                ))}
              </div>
            )
          ))}
        </div>
      )}
    </div>
  );
}

// ---- RELATED ITEM MODAL ----
function RelatedItemModal({ product: p, relType, onClose }) {
  const [activeSpecTab, setActiveSpecTab] = useState("basic");
  const mainImage = p.product_image || p.image;
  const diagImage = (p.diagram_image && p.diagram_image !== mainImage) ? p.diagram_image : null;
  const images = [mainImage, diagImage].filter(Boolean).filter((v, i, a) => a.indexOf(v) === i);
  const hasSpecs = p.basic_headers?.length > 0 && p.basic_rows?.length > 0;
  const hasMoreSpecs = p.more_headers?.length > 0 && p.more_rows?.length > 0;

  const typeLabel = relType === "pins" ? "Connecting Pin" : relType === "sprockets" ? "Sprocket" : "Attachment";

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.65)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div onClick={e => e.stopPropagation()} style={{ background: "#fff", borderRadius: 12, maxWidth: 820, width: "100%", maxHeight: "90vh", overflowY: "auto", boxShadow: "0 24px 80px rgba(0,0,0,0.35)" }}>

        {/* Header */}
        <div style={{ padding: "20px 28px 16px", borderBottom: `3px solid ${UNIKING_RED}`, display: "flex", alignItems: "flex-start", gap: 12, background: UNIKING_DARK }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, color: "#aaa", textTransform: "uppercase", letterSpacing: 2, marginBottom: 6 }}>
              {p.category || p.name || typeLabel}{p.subcategory ? ` — ${p.subcategory}` : ""}
            </div>
            <div style={{ fontSize: 26, fontWeight: 800, color: "#fff", letterSpacing: 0.5 }}>{p.part_number}</div>
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "flex-start", marginTop: 4 }}>
            <button
              onClick={() => printTearSheet(p, typeLabel)}
              style={{ background: UNIKING_RED, border: "none", color: "#fff", fontSize: 12, fontWeight: 700, borderRadius: 6, padding: "6px 14px", cursor: "pointer", letterSpacing: 0.5 }}
            >Print Tear Sheet</button>
            <button onClick={onClose} style={{ background: "rgba(255,255,255,0.1)", border: "none", cursor: "pointer", fontSize: 20, color: "#fff", lineHeight: 1, borderRadius: 6, padding: "4px 10px" }}>×</button>
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: "28px" }}>
          {/* Image + info */}
          <div style={{ display: "flex", gap: 24, marginBottom: 24, flexWrap: "wrap" }}>
            {images.length > 0 && (
              <div style={{ flex: "0 0 260px", minWidth: 200 }}>
                <ImageCarousel images={images} />
              </div>
            )}
            <div style={{ flex: 1, minWidth: 200, display: "flex", flexDirection: "column", gap: 12 }}>
              {(p.description || p.name) && (
                <div style={{ fontSize: 14, color: "#333", lineHeight: 1.8, borderLeft: `3px solid ${UNIKING_RED}`, paddingLeft: 14 }}>
                  {p.description || p.name}
                </div>
              )}
              {p.industry && (
                <div style={{ fontSize: 13, color: "#555", background: UNIKING_GRAY, borderRadius: 6, padding: "8px 12px" }}>
                  <strong>Industry:</strong> {p.industry}
                </div>
              )}
              {p.features?.length > 0 && (
                <ul style={{ margin: 0, padding: "0 0 0 20px", lineHeight: 2 }}>
                  {p.features.map((f, i) => <li key={i} style={{ fontSize: 13, color: "#444" }}>{f}</li>)}
                </ul>
              )}
              {!hasSpecs && !p.description && !p.industry && !p.features?.length && (
                <div style={{ fontSize: 13, color: "#888", fontStyle: "italic", paddingTop: 8 }}>
                  Contact Uniking Canada for full specifications.
                </div>
              )}
            </div>
          </div>

          {/* Spec tables */}
          {(hasSpecs || hasMoreSpecs) && (
            <div>
              {(hasSpecs && hasMoreSpecs) && (
                <div style={{ display: "flex", borderBottom: `1px solid ${UNIKING_BORDER}`, marginBottom: 16 }}>
                  {[{ key: "basic", label: "Basic Specs" }, { key: "more", label: "More Specs" }].map(tab => (
                    <button key={tab.key} onClick={() => setActiveSpecTab(tab.key)} style={{ padding: "10px 20px", border: "none", borderBottom: activeSpecTab === tab.key ? `2px solid ${UNIKING_RED}` : "2px solid transparent", background: "none", cursor: "pointer", fontWeight: activeSpecTab === tab.key ? 700 : 500, color: activeSpecTab === tab.key ? UNIKING_RED : "#666", fontSize: 13 }}>
                      {tab.label}
                    </button>
                  ))}
                </div>
              )}
              {(!hasMoreSpecs || activeSpecTab === "basic") && hasSpecs && (
                <div>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 10 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 2, color: "#999" }}>
                      {relType === "sprockets" ? "Available Sizes" : "Basic Specifications"}
                    </div>
                    {relType === "sprockets" && (
                      <div style={{ fontSize: 12, color: "#aaa" }}>— all tooth counts for this chain series</div>
                    )}
                  </div>
                  <div style={{ overflowX: "auto" }}><SpecTable headers={p.basic_headers} rows={p.basic_rows} /></div>
                </div>
              )}
              {hasMoreSpecs && activeSpecTab === "more" && (
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 2, color: "#999", marginBottom: 10 }}>Additional Specifications</div>
                  <div style={{ overflowX: "auto" }}><SpecTable headers={p.more_headers} rows={p.more_rows} /></div>
                </div>
              )}
            </div>
          )}

          {/* Close */}
          <div style={{ marginTop: 24, textAlign: "right" }}>
            <button onClick={onClose} style={{ padding: "10px 28px", background: UNIKING_DARK, color: "#fff", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 13, fontWeight: 700 }}>Close</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---- MAIN PAGE ----
export default function WeldedSteel() {
  const [activeSubcat, setActiveSubcat] = useState(null);
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeRelTab, setActiveRelTab] = useState("pins");
  const [activeSpecTab, setActiveSpecTab] = useState("basic");
  const [relatedModal, setRelatedModal] = useState(null); // { product, relType }

  useEffect(() => {
    if (activeSubcat) {
      setLoading(true);
      setSelectedProduct(null);
      MacChainProduct.filter({ subcategory: activeSubcat, product_type: "Chain" })
        .then(data => { setProducts(data); setLoading(false); })
        .catch(() => setLoading(false));
    }
  }, [activeSubcat]);

  const subcatInfo = SUBCATEGORIES.find(s => s.key === activeSubcat);

  const handleRelatedClick = async (item, relType) => {
    // Show immediately with what we already have
    setRelatedModal({
      product: { ...item, product_image: item.product_image || item.image, diagram_image: item.diagram_image || item.image },
      relType
    });

    if (!item.slug) return;

    try {
      let lookupSlug = item.slug;
      // For sprockets, individual tooth slugs like "wr132xhd-8" → parent "wr132xhd"
      if (relType === "sprockets") {
        lookupSlug = parentSprocketSlug(item.slug);
      }

      const results = await MacChainProduct.filter({ slug: lookupSlug });
      if (results && results.length > 0) {
        const dbRec = results[0];
        setRelatedModal({
          product: {
            ...item,
            ...dbRec,
            product_image: dbRec.product_image || item.image,
            diagram_image: dbRec.diagram_image || item.image,
          },
          relType
        });
      }
    } catch (e) {
      console.error("Failed to load related product:", e);
    }
  };

  return (
    <div style={{ fontFamily: "'Segoe UI', Arial, sans-serif", minHeight: "100vh", background: "#fff", color: UNIKING_DARK }}>
      {/* Header */}
      <div style={{ background: UNIKING_DARK, color: "#fff", padding: "18px 32px", display: "flex", alignItems: "center", gap: 16, borderBottom: `3px solid ${UNIKING_RED}` }}>
        <div style={{ width: 40, height: 40, background: UNIKING_RED, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 18 }}>U</div>
        <div>
          <div style={{ fontSize: 11, color: "#aaa", letterSpacing: 2, textTransform: "uppercase" }}>Uniking Canada — Product Catalog</div>
          <div style={{ fontSize: 20, fontWeight: 700 }}>Welded Steel Chain</div>
        </div>
        <div style={{ flex: 1 }} />
        <a href="/" style={{ color: "#aaa", textDecoration: "none", fontSize: 13 }}>← Back to Catalog</a>
      </div>

      {/* Subcategory Nav */}
      <div style={{ background: UNIKING_GRAY, borderBottom: `1px solid ${UNIKING_BORDER}` }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", overflowX: "auto" }}>
          {SUBCATEGORIES.map(sub => (
            <button key={sub.key} onClick={() => setActiveSubcat(sub.key)} style={{ padding: "16px 24px", border: "none", background: "none", cursor: "pointer", fontSize: 13, fontWeight: activeSubcat === sub.key ? 700 : 500, color: activeSubcat === sub.key ? UNIKING_RED : "#444", borderBottom: activeSubcat === sub.key ? `3px solid ${UNIKING_RED}` : "3px solid transparent", whiteSpace: "nowrap", transition: "all 0.15s", textTransform: "uppercase", letterSpacing: 0.5 }}>
              {sub.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px 48px" }}>
        {/* Landing */}
        {!activeSubcat && (
          <div style={{ padding: "64px 0", textAlign: "center" }}>
            <div style={{ fontSize: 28, fontWeight: 700, marginBottom: 12 }}>Welded Steel Chain</div>
            <div style={{ fontSize: 16, color: "#666", maxWidth: 600, margin: "0 auto 40px", lineHeight: 1.7 }}>
              Mac Chain welded steel chains are manufactured with superior steel for the most demanding conveying and elevating applications. Select a chain type above to browse products.
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, maxWidth: 900, margin: "0 auto" }}>
              {SUBCATEGORIES.map(sub => (
                <button key={sub.key} onClick={() => setActiveSubcat(sub.key)}
                  style={{ padding: "24px 20px", border: `1px solid ${UNIKING_BORDER}`, borderRadius: 8, background: "#fff", cursor: "pointer", textAlign: "left", borderTop: `3px solid ${UNIKING_RED}` }}
                  onMouseEnter={e => e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.10)"}
                  onMouseLeave={e => e.currentTarget.style.boxShadow = "none"}>
                  <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 8 }}>{sub.label}</div>
                  <div style={{ fontSize: 12, color: "#777", lineHeight: 1.5 }}>{sub.desc}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Product List */}
        {activeSubcat && !selectedProduct && (
          <div style={{ paddingTop: 32 }}>
            <div style={{ marginBottom: 24, paddingBottom: 16, borderBottom: `1px solid ${UNIKING_BORDER}` }}>
              <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 6 }}>{subcatInfo?.label}</div>
              <div style={{ fontSize: 14, color: "#666", lineHeight: 1.6 }}>{subcatInfo?.desc}</div>
              {products.length > 0 && <div style={{ fontSize: 12, color: "#999", marginTop: 8 }}>{products.length} products — click a part number for full specifications</div>}
            </div>
            {loading ? (
              <div style={{ textAlign: "center", padding: "60px 0", color: "#999" }}>Loading products...</div>
            ) : (
              <>
                {products.length > 0 && products[0].basic_headers?.length > 0 && (
                  <div style={{ overflowX: "auto", marginBottom: 32 }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                      <thead>
                        <tr style={{ background: UNIKING_DARK, color: "#fff" }}>
                          {products[0].basic_headers.map((h, i) => <th key={i} style={{ padding: "10px 14px", textAlign: "left", fontWeight: 600, whiteSpace: "nowrap", fontSize: 12 }}>{h}</th>)}
                        </tr>
                      </thead>
                      <tbody>
                        {products.map((p, pi) => (
                          <tr key={p.id} onClick={() => { setSelectedProduct(p); setActiveRelTab("pins"); setActiveSpecTab("basic"); }}
                            style={{ cursor: "pointer", borderBottom: `1px solid ${UNIKING_BORDER}`, background: pi % 2 === 0 ? "#fff" : UNIKING_GRAY }}
                            onMouseEnter={e => e.currentTarget.style.background = "#fff3f5"}
                            onMouseLeave={e => e.currentTarget.style.background = pi % 2 === 0 ? "#fff" : UNIKING_GRAY}>
                            {(p.basic_rows?.[0] || []).map((val, vi) => (
                              <td key={vi} style={{ padding: "10px 14px", whiteSpace: "nowrap", color: vi === 0 ? UNIKING_RED : UNIKING_DARK, fontWeight: vi === 0 ? 700 : 400 }}>{val}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16 }}>
                  {products.map(p => (
                    <div key={p.id} onClick={() => { setSelectedProduct(p); setActiveRelTab("pins"); setActiveSpecTab("basic"); }}
                      style={{ border: `1px solid ${UNIKING_BORDER}`, borderRadius: 8, overflow: "hidden", cursor: "pointer", background: "#fff", transition: "all 0.15s" }}
                      onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.12)"; e.currentTarget.style.borderColor = UNIKING_RED; }}
                      onMouseLeave={e => { e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.borderColor = UNIKING_BORDER; }}>
                      {p.product_image && (
                        <div style={{ height: 140, overflow: "hidden", background: UNIKING_GRAY, display: "flex", alignItems: "center", justifyContent: "center", padding: 12 }}>
                          <img src={p.product_image} alt={p.part_number} style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} />
                        </div>
                      )}
                      <div style={{ padding: "12px 14px" }}>
                        <div style={{ fontWeight: 700, fontSize: 14, color: UNIKING_RED, marginBottom: 4 }}>{p.part_number}</div>
                        <div style={{ fontSize: 12, color: "#777" }}>{p.category}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* Product Detail */}
        {selectedProduct && (
          <ProductDetail
            product={selectedProduct}
            onBack={() => setSelectedProduct(null)}
            activeRelTab={activeRelTab}
            setActiveRelTab={setActiveRelTab}
            activeSpecTab={activeSpecTab}
            setActiveSpecTab={setActiveSpecTab}
            onRelatedClick={handleRelatedClick}
          />
        )}
      </div>

      {/* Related Item Modal */}
      {relatedModal && (
        <RelatedItemModal
          product={relatedModal.product}
          relType={relatedModal.relType}
          onClose={() => setRelatedModal(null)}
        />
      )}
    </div>
  );
}
