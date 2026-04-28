import { useState, useEffect } from "react";
import { MacChainProduct } from "@/api/entities";

const UNIKING_RED = "#C41E3A";
const UNIKING_DARK = "#1a1a1a";
const UNIKING_GRAY = "#f5f5f5";
const UNIKING_BORDER = "#e0e0e0";

const CHAIN_CATEGORIES = [
  {
    key: "Pintle Chain",
    label: "Steel Pintle Chain",
    desc: "Open barrel design pintle chains for spreaders, feeder systems, hay handling, spray box, and forest product applications.",
    subcategories: [
      { key: "Sander Chain", label: "Sander Chain", desc: "All sander chain grades — M662-A through C77SS. For wood processing and sanding conveyor applications." },
      { key: "M662", label: "M662", desc: "1.664\" pitch, 11,000 lbs ultimate strength." },
      { key: "M667X", label: "M667X", desc: "2.250\" pitch, 21,000 lbs ultimate strength." },
      { key: "M667H", label: "M667H", desc: "2.313\" pitch, 12,500 lbs ultimate strength." },
      { key: "M667KC", label: "M667KC", desc: "2.250\" pitch, 30,000 lbs ultimate strength." },
      { key: "M667XH", label: "M667XH", desc: "2.250\" pitch, 28,000 lbs ultimate strength." },
      { key: "M88K", label: "M88K", desc: "2.609\" pitch, 24,500 lbs ultimate strength." },
      { key: "M88C", label: "M88C", desc: "2.609\" pitch, 19,500 lbs ultimate strength." },
      { key: "M308C", label: "M308C", desc: "3.075\" pitch, 35,000 lbs ultimate strength." },
    ],
  },
  {
    key: "Long Link Chain",
    label: "Alloy Steel Long Link Chain",
    desc: "Heavy-duty alloy steel long link chains for car wash conveyors and forest product applications. Available in 4 sizes.",
    subcategories: [
      { key: "Alloy Steel Long Link Chain", label: "Alloy Steel Long Link Chain", desc: "All sizes — 7/8\" to 1-1/4\" diameter, 6\" pitch. Breaking loads from 93,000 to 180,000 lbs." },
    ],
  },
  {
    key: "Special Application Chain",
    label: "Special Application Chain",
    desc: "Specialized chains for DLI mail/parcel sorting, waste water, paving, and double-flex conveying applications.",
    subcategories: [
      { key: "DLI Scanner Chain", label: "DLI Scanner Chain", desc: "High-speed chains for DLI mail and parcel sorting systems: MRB124 Narrow/Wide, MRBC100, MRBC124, MRB2512." },
      { key: "DF3500 Double Flex Chain", label: "Double Flex Chain (DF3500)", desc: "Flexible in multiple directions — 3.000\"/2.500\" dual pitch, 48,000 lbs ultimate strength." },
      { key: "Welded Steel Waste Water Chain", label: "Waste Water Chain", desc: "WR720S & WR730S — 6.000\" pitch, 42,500 lbs, for municipal waste water conveyors." },
      { key: "Paver Chain (SS40SL)", label: "Paver Chain (SS40SL)", desc: "Road construction chain — 3.075\" pitch, 60,000 lbs ultimate strength." },
    ],
  },
];

// ---- TEAR SHEET ----
function printTearSheet(p, typeLabel) {
  const mainImage = p.product_image || "";
  const diagImage = (p.diagram_image && p.diagram_image !== mainImage) ? p.diagram_image : null;
  const hasSpecs = p.basic_headers?.length > 0 && p.basic_rows?.length > 0;
  const hasMoreSpecs = p.more_headers?.length > 0 && p.more_rows?.length > 0;

  const specsHtml = hasSpecs ? `
    <div class="section-title">BASIC SPECIFICATIONS</div>
    <table>
      <thead><tr>${p.basic_headers.map(h => `<th>${h}</th>`).join("")}</tr></thead>
      <tbody>${p.basic_rows.map((row, ri) => `<tr class="${ri%2===0?"even":"odd"}">${row.map((v,vi) => `<td class="${vi===0?"bold":""}">${v}</td>`).join("")}</tr>`).join("")}</tbody>
    </table>` : "";

  const moreSpecsHtml = hasMoreSpecs ? `
    <div class="section-title" style="margin-top:20px">ADDITIONAL SPECIFICATIONS</div>
    <table>
      <thead><tr>${p.more_headers.map(h => `<th>${h}</th>`).join("")}</tr></thead>
      <tbody>${p.more_rows.map((row, ri) => `<tr class="${ri%2===0?"even":"odd"}">${row.map((v,vi) => `<td class="${vi===0?"bold":""}">${v}</td>`).join("")}</tr>`).join("")}</tbody>
    </table>` : "";

  const featuresHtml = p.features?.length > 0 ? `
    <div class="section-title">FEATURES</div>
    <ul>${p.features.map(f => `<li>${f}</li>`).join("")}</ul>` : "";

  const industryHtml = p.industry ? `<div class="industry"><strong>Industry:</strong> ${p.industry}</div>` : "";
  const imgHtml = mainImage ? `<img class="main-img" src="${mainImage}" alt="${p.part_number}" />` : "";
  const diagHtml = diagImage ? `<img class="diag-img" src="${diagImage}" alt="Technical Diagram" />` : "";

  const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"/>
<title>Tear Sheet — ${p.part_number}</title>
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{font-family:'Segoe UI',Arial,sans-serif;color:#1a1a1a;background:#fff;padding:0}
  .header{background:#1a1a1a;color:#fff;padding:18px 32px;display:flex;align-items:center;gap:18px;border-bottom:4px solid #C41E3A}
  .logo-box{width:48px;height:48px;background:#C41E3A;border-radius:8px;display:flex;align-items:center;justify-content:center;font-weight:900;font-size:22px;color:#fff;flex-shrink:0}
  .header-text{flex:1}
  .header-title{font-size:13px;color:#aaa;letter-spacing:2px;text-transform:uppercase}
  .header-part{font-size:26px;font-weight:800}
  .header-type{font-size:12px;color:#C41E3A;letter-spacing:1.5px;text-transform:uppercase;margin-top:2px}
  .contact{font-size:11px;color:#aaa;text-align:right;line-height:1.7}
  .body{padding:28px 32px}
  .top-row{display:flex;gap:28px;margin-bottom:24px}
  .images{display:flex;flex-direction:column;gap:12px;flex:0 0 280px}
  .main-img{max-width:280px;max-height:220px;object-fit:contain;border:1px solid #e0e0e0;border-radius:8px;padding:12px;background:#f5f5f5}
  .diag-img{max-width:280px;max-height:140px;object-fit:contain;border:1px solid #e0e0e0;border-radius:8px;padding:10px;background:#f5f5f5}
  .info{flex:1}
  .category-label{font-size:11px;color:#999;text-transform:uppercase;letter-spacing:1.5px;margin-bottom:8px}
  .industry{font-size:13px;color:#555;background:#f5f5f5;border-radius:6px;padding:8px 12px;margin-bottom:14px}
  ul{padding-left:20px;margin-bottom:16px}
  li{font-size:13px;color:#444;line-height:1.9}
  .section-title{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:2px;color:#999;margin-bottom:10px;padding-bottom:6px;border-bottom:1px solid #e0e0e0}
  table{width:100%;border-collapse:collapse;font-size:12px;margin-bottom:8px}
  th{background:#1a1a1a;color:#fff;padding:9px 14px;text-align:left;font-weight:600;font-size:11px;white-space:nowrap}
  td{padding:9px 14px;white-space:nowrap;border-bottom:1px solid #e0e0e0}
  tr.even td{background:#fff}
  tr.odd td{background:#f5f5f5}
  td.bold{font-weight:700;color:#C41E3A}
  .footer{margin-top:32px;padding:16px 32px;border-top:2px solid #e0e0e0;display:flex;justify-content:space-between;align-items:center}
  .footer-note{font-size:11px;color:#999}
  .footer-brand{font-size:12px;color:#C41E3A;font-weight:700}
  @media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact}}
</style></head>
<body>
<div class="header">
  <div class="logo-box">U</div>
  <div class="header-text">
    <div class="header-title">Uniking Canada — Product Tear Sheet</div>
    <div class="header-part">${p.part_number}</div>
    <div class="header-type">${typeLabel}</div>
  </div>
  <div class="contact">unikingcanada.com<br/>info@unikingcanada.com<br/>+1 (450) 979-7977</div>
</div>
<div class="body">
  <div class="top-row">
    <div class="images">${imgHtml}${diagHtml}</div>
    <div class="info">
      <div class="category-label">${p.category}${p.subcategory ? " — " + p.subcategory : ""}</div>
      ${industryHtml}
      ${featuresHtml}
    </div>
  </div>
  ${specsHtml}
  ${moreSpecsHtml}
</div>
<div class="footer">
  <div class="footer-note">Specifications subject to change without notice. Contact Uniking Canada for current data.</div>
  <div class="footer-brand">Mac Chain — Uniking Canada</div>
</div>
</body></html>`;

  const w = window.open("", "_blank");
  w.document.write(html);
  w.document.close();
  setTimeout(() => w.print(), 600);
}

// ---- PRODUCT DETAIL ----
function ProductDetail({ product: p, onBack, activeSpecTab, setActiveSpecTab }) {
  const images = [p.product_image, p.diagram_image].filter(Boolean).filter((v,i,a)=>a.indexOf(v)===i);
  const [imgIdx, setImgIdx] = useState(0);
  const hasBasic = p.basic_headers?.length > 0 && p.basic_rows?.length > 0;
  const hasMore = p.more_headers?.length > 0 && p.more_rows?.length > 0;
  const catInfo = CHAIN_CATEGORIES.find(c => c.key === p.category);

  return (
    <div style={{ paddingTop: 24 }}>
      {/* Back + Print */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, paddingBottom: 16, borderBottom: `1px solid ${UNIKING_BORDER}` }}>
        <button onClick={onBack} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 13, color: "#666", display: "flex", alignItems: "center", gap: 6 }}>
          ← Back to {catInfo?.label || p.category}
        </button>
        <button onClick={() => printTearSheet(p, p.category)}
          style={{ background: UNIKING_RED, color: "#fff", border: "none", borderRadius: 6, padding: "8px 18px", cursor: "pointer", fontSize: 12, fontWeight: 600, letterSpacing: 0.5 }}>
          Print Tear Sheet
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: 40 }}>
        {/* Images */}
        <div>
          {images.length > 0 && (
            <>
              <div style={{ background: UNIKING_GRAY, borderRadius: 10, padding: 16, display: "flex", alignItems: "center", justifyContent: "center", height: 240, marginBottom: 12 }}>
                <img src={images[imgIdx]} alt={p.part_number} style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} />
              </div>
              {images.length > 1 && (
                <div style={{ display: "flex", gap: 8 }}>
                  {images.map((img, i) => (
                    <div key={i} onClick={() => setImgIdx(i)}
                      style={{ flex: 1, height: 70, background: UNIKING_GRAY, borderRadius: 6, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", padding: 6, border: `2px solid ${i === imgIdx ? UNIKING_RED : "transparent"}` }}>
                      <img src={img} alt="" style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} />
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* Info */}
        <div>
          <div style={{ fontSize: 11, color: "#999", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 4 }}>{p.category}</div>
          <div style={{ fontSize: 28, fontWeight: 800, marginBottom: 4 }}>{p.part_number}</div>
          {p.industry && (
            <div style={{ fontSize: 13, color: "#666", background: UNIKING_GRAY, borderRadius: 6, padding: "8px 14px", marginBottom: 16, display: "inline-block" }}>
              <strong>Industry:</strong> {p.industry}
            </div>
          )}
          {p.description && (
            <p style={{ fontSize: 14, color: "#555", lineHeight: 1.7, marginBottom: 20 }}>{p.description}</p>
          )}
          {p.features?.length > 0 && (
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: 2, color: "#999", marginBottom: 10 }}>Features</div>
              <ul style={{ paddingLeft: 20, margin: 0 }}>
                {p.features.map((f, i) => <li key={i} style={{ fontSize: 13, color: "#444", lineHeight: 2 }}>{f}</li>)}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Spec Tabs */}
      {(hasBasic || hasMore) && (
        <div style={{ marginTop: 36 }}>
          <div style={{ display: "flex", borderBottom: `1px solid ${UNIKING_BORDER}`, marginBottom: 20 }}>
            {hasBasic && (
              <button onClick={() => setActiveSpecTab("basic")}
                style={{ padding: "10px 24px", border: "none", background: "none", cursor: "pointer", fontSize: 13, fontWeight: activeSpecTab === "basic" ? 700 : 500, color: activeSpecTab === "basic" ? UNIKING_RED : "#555", borderBottom: activeSpecTab === "basic" ? `3px solid ${UNIKING_RED}` : "3px solid transparent", textTransform: "uppercase", letterSpacing: 0.5 }}>
                Basic Specs
              </button>
            )}
            {hasMore && (
              <button onClick={() => setActiveSpecTab("more")}
                style={{ padding: "10px 24px", border: "none", background: "none", cursor: "pointer", fontSize: 13, fontWeight: activeSpecTab === "more" ? 700 : 500, color: activeSpecTab === "more" ? UNIKING_RED : "#555", borderBottom: activeSpecTab === "more" ? `3px solid ${UNIKING_RED}` : "3px solid transparent", textTransform: "uppercase", letterSpacing: 0.5 }}>
                Additional Specs
              </button>
            )}
          </div>

          {activeSpecTab === "basic" && hasBasic && (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ background: UNIKING_DARK, color: "#fff" }}>
                    {p.basic_headers.map((h, i) => <th key={i} style={{ padding: "10px 16px", textAlign: "left", fontWeight: 600, fontSize: 12, whiteSpace: "nowrap" }}>{h}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {p.basic_rows.map((row, ri) => (
                    <tr key={ri} style={{ background: ri % 2 === 0 ? "#fff" : UNIKING_GRAY, borderBottom: `1px solid ${UNIKING_BORDER}` }}>
                      {row.map((val, vi) => (
                        <td key={vi} style={{ padding: "10px 16px", whiteSpace: "nowrap", color: vi === 0 ? UNIKING_RED : UNIKING_DARK, fontWeight: vi === 0 ? 700 : 400 }}>{val}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeSpecTab === "more" && hasMore && (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ background: UNIKING_DARK, color: "#fff" }}>
                    {p.more_headers.map((h, i) => <th key={i} style={{ padding: "10px 16px", textAlign: "left", fontWeight: 600, fontSize: 12, whiteSpace: "nowrap" }}>{h}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {p.more_rows.map((row, ri) => (
                    <tr key={ri} style={{ background: ri % 2 === 0 ? "#fff" : UNIKING_GRAY, borderBottom: `1px solid ${UNIKING_BORDER}` }}>
                      {row.map((val, vi) => (
                        <td key={vi} style={{ padding: "10px 16px", whiteSpace: "nowrap", color: vi === 0 ? UNIKING_RED : UNIKING_DARK, fontWeight: vi === 0 ? 700 : 400 }}>{val}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ---- SUBCATEGORY VIEW ----
function SubcategoryView({ catKey, subcatKey, onBack }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [activeSpecTab, setActiveSpecTab] = useState("basic");

  const catInfo = CHAIN_CATEGORIES.find(c => c.key === catKey);
  const subcatInfo = catInfo?.subcategories.find(s => s.key === subcatKey);

  useEffect(() => {
    setLoading(true);
    setSelectedProduct(null);
    // For DLI Scanner Chain, fetch by subcategory; others by part_number or slug
    let fetchPromise;
    if (subcatKey === "DLI Scanner Chain") {
      fetchPromise = MacChainProduct.filter({ category: "Special Application Chain" })
        .then(all => all.filter(p => ["mrb124-narrow","mrb124-wide","mrbc100","mrbc124","mrb2512"].includes(p.slug)));
    } else if (subcatKey === "Sander Chain") {
      fetchPromise = MacChainProduct.filter({ slug: "sander-chain" });
    } else {
      fetchPromise = MacChainProduct.filter({ part_number: subcatKey, category: catKey });
    }
    fetchPromise
      .then(data => { setProducts(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [catKey, subcatKey]);

  if (selectedProduct) {
    return (
      <ProductDetail
        product={selectedProduct}
        onBack={() => { setSelectedProduct(null); setActiveSpecTab("basic"); }}
        activeSpecTab={activeSpecTab}
        setActiveSpecTab={setActiveSpecTab}
      />
    );
  }

  const hasTable = products.length > 0 && products[0].basic_headers?.length > 0;

  return (
    <div style={{ paddingTop: 28 }}>
      <button onClick={onBack} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 13, color: "#666", marginBottom: 20, display: "flex", alignItems: "center", gap: 6 }}>
        ← Back to {catInfo?.label}
      </button>
      <div style={{ marginBottom: 24, paddingBottom: 16, borderBottom: `1px solid ${UNIKING_BORDER}` }}>
        <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 6 }}>{subcatInfo?.label || subcatKey}</div>
        <div style={{ fontSize: 14, color: "#666", lineHeight: 1.6 }}>{subcatInfo?.desc}</div>
        {!loading && products.length > 0 && <div style={{ fontSize: 12, color: "#999", marginTop: 8 }}>{products.length} product{products.length > 1 ? "s" : ""} — click a row or card for full specifications</div>}
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "60px 0", color: "#999" }}>Loading...</div>
      ) : products.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 0", color: "#999" }}>No products found.</div>
      ) : (
        <>
          {/* Table view */}
          {hasTable && (
            <div style={{ overflowX: "auto", marginBottom: 32 }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ background: UNIKING_DARK, color: "#fff" }}>
                    {products[0].basic_headers.map((h, i) => <th key={i} style={{ padding: "10px 14px", textAlign: "left", fontWeight: 600, fontSize: 12, whiteSpace: "nowrap" }}>{h}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {products.map((p, pi) => (
                    p.basic_rows?.map((row, ri) => (
                      <tr key={`${pi}-${ri}`}
                        onClick={() => { setSelectedProduct(p); setActiveSpecTab("basic"); }}
                        style={{ cursor: "pointer", background: (pi + ri) % 2 === 0 ? "#fff" : UNIKING_GRAY, borderBottom: `1px solid ${UNIKING_BORDER}` }}
                        onMouseEnter={e => e.currentTarget.style.background = "#fff3f5"}
                        onMouseLeave={e => e.currentTarget.style.background = (pi + ri) % 2 === 0 ? "#fff" : UNIKING_GRAY}>
                        {row.map((val, vi) => (
                          <td key={vi} style={{ padding: "10px 14px", whiteSpace: "nowrap", color: vi === 0 ? UNIKING_RED : UNIKING_DARK, fontWeight: vi === 0 ? 700 : 400 }}>{val}</td>
                        ))}
                      </tr>
                    ))
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Card grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16 }}>
            {products.map(p => (
              <div key={p.id}
                onClick={() => { setSelectedProduct(p); setActiveSpecTab("basic"); }}
                style={{ border: `1px solid ${UNIKING_BORDER}`, borderRadius: 8, overflow: "hidden", cursor: "pointer", background: "#fff", transition: "all 0.15s" }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.12)"; e.currentTarget.style.borderColor = UNIKING_RED; }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.borderColor = UNIKING_BORDER; }}>
                {p.product_image && (
                  <div style={{ height: 140, background: UNIKING_GRAY, display: "flex", alignItems: "center", justifyContent: "center", padding: 12 }}>
                    <img src={p.product_image} alt={p.part_number} style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} />
                  </div>
                )}
                <div style={{ padding: "12px 14px" }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: UNIKING_RED, marginBottom: 4 }}>{p.part_number}</div>
                  <div style={{ fontSize: 12, color: "#777" }}>{p.category}</div>
                  {p.industry && <div style={{ fontSize: 11, color: "#999", marginTop: 4 }}>{p.industry}</div>}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ---- CATEGORY VIEW ----
function CategoryView({ catKey, onBack }) {
  const [selectedSubcat, setSelectedSubcat] = useState(null);
  const catInfo = CHAIN_CATEGORIES.find(c => c.key === catKey);
  if (!catInfo) return null;

  if (selectedSubcat) {
    return <SubcategoryView catKey={catKey} subcatKey={selectedSubcat} onBack={() => setSelectedSubcat(null)} />;
  }

  // Long Link has only one subcat — go straight to it
  if (catInfo.subcategories.length === 1) {
    return <SubcategoryView catKey={catKey} subcatKey={catInfo.subcategories[0].key} onBack={onBack} />;
  }

  return (
    <div style={{ paddingTop: 28 }}>
      <button onClick={onBack} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 13, color: "#666", marginBottom: 20 }}>
        ← Back to Chain Types
      </button>
      <div style={{ marginBottom: 32, paddingBottom: 16, borderBottom: `1px solid ${UNIKING_BORDER}` }}>
        <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>{catInfo.label}</div>
        <div style={{ fontSize: 14, color: "#666", lineHeight: 1.7, maxWidth: 700 }}>{catInfo.desc}</div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 16 }}>
        {catInfo.subcategories.map(sub => (
          <button key={sub.key} onClick={() => setSelectedSubcat(sub.key)}
            style={{ padding: "22px 20px", border: `1px solid ${UNIKING_BORDER}`, borderTop: `3px solid ${UNIKING_RED}`, borderRadius: 8, background: "#fff", cursor: "pointer", textAlign: "left", transition: "all 0.15s" }}
            onMouseEnter={e => e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.10)"}
            onMouseLeave={e => e.currentTarget.style.boxShadow = "none"}>
            <div style={{ fontWeight: 700, fontSize: 14, color: UNIKING_RED, marginBottom: 8 }}>{sub.label}</div>
            <div style={{ fontSize: 12, color: "#777", lineHeight: 1.5 }}>{sub.desc}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ---- MAIN PAGE ----
export default function SpecialChains() {
  const [selectedCategory, setSelectedCategory] = useState(null);

  if (selectedCategory) {
    return (
      <div style={{ fontFamily: "'Segoe UI', Arial, sans-serif", minHeight: "100vh", background: "#fff", color: UNIKING_DARK }}>
        <div style={{ background: UNIKING_DARK, color: "#fff", padding: "18px 32px", display: "flex", alignItems: "center", gap: 16, borderBottom: `3px solid ${UNIKING_RED}` }}>
          <div style={{ width: 40, height: 40, background: UNIKING_RED, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 18 }}>U</div>
          <div>
            <div style={{ fontSize: 11, color: "#aaa", letterSpacing: 2, textTransform: "uppercase" }}>Uniking Canada — Product Catalog</div>
            <div style={{ fontSize: 20, fontWeight: 700 }}>{CHAIN_CATEGORIES.find(c => c.key === selectedCategory)?.label}</div>
          </div>
          <div style={{ flex: 1 }} />
          <a href="/" style={{ color: "#aaa", textDecoration: "none", fontSize: 13 }}>← Back to Catalog</a>
        </div>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px 48px" }}>
          <CategoryView catKey={selectedCategory} onBack={() => setSelectedCategory(null)} />
        </div>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "'Segoe UI', Arial, sans-serif", minHeight: "100vh", background: "#fff", color: UNIKING_DARK }}>
      {/* Header */}
      <div style={{ background: UNIKING_DARK, color: "#fff", padding: "18px 32px", display: "flex", alignItems: "center", gap: 16, borderBottom: `3px solid ${UNIKING_RED}` }}>
        <div style={{ width: 40, height: 40, background: UNIKING_RED, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 18 }}>U</div>
        <div>
          <div style={{ fontSize: 11, color: "#aaa", letterSpacing: 2, textTransform: "uppercase" }}>Uniking Canada — Product Catalog</div>
          <div style={{ fontSize: 20, fontWeight: 700 }}>Steel Pintle, Long Link & Special Application Chain</div>
        </div>
        <div style={{ flex: 1 }} />
        <a href="/" style={{ color: "#aaa", textDecoration: "none", fontSize: 13 }}>← Back to Catalog</a>
      </div>

      {/* Landing */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "64px 24px 48px" }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <div style={{ fontSize: 30, fontWeight: 800, marginBottom: 12 }}>Select a Chain Type</div>
          <div style={{ fontSize: 15, color: "#666", maxWidth: 620, margin: "0 auto", lineHeight: 1.7 }}>
            Mac Chain specialty chains for a wide range of demanding conveying, processing, and sorting applications.
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24 }}>
          {CHAIN_CATEGORIES.map(cat => (
            <button key={cat.key} onClick={() => setSelectedCategory(cat.key)}
              style={{ padding: "28px 24px", border: `1px solid ${UNIKING_BORDER}`, borderTop: `4px solid ${UNIKING_RED}`, borderRadius: 10, background: "#fff", cursor: "pointer", textAlign: "left", transition: "all 0.2s" }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 6px 24px rgba(0,0,0,0.12)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.transform = "none"; }}>
              <div style={{ fontWeight: 800, fontSize: 16, color: UNIKING_DARK, marginBottom: 10 }}>{cat.label}</div>
              <div style={{ fontSize: 13, color: "#666", lineHeight: 1.6, marginBottom: 14 }}>{cat.desc}</div>
              <div style={{ fontSize: 12, color: UNIKING_RED, fontWeight: 600 }}>{cat.subcategories.length} product type{cat.subcategories.length > 1 ? "s" : ""} →</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
