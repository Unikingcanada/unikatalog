import { useState, useEffect } from "react";
import { MacChainProduct } from "@/api/entities";

const SUBCATEGORIES = [
  { key: "Offset Sidebar", label: "Offset Sidebar", desc: "Recommended for most conveying & elevating applications. Industry: Grain Processing, Car Wash, Forest Products." },
  { key: "Straight Sidebar", label: "Straight Sidebar", desc: "\"C-type\" chain recommended for reversible conveyors. Allows easy visual inspection. Industry: Grain Processing, Forest Products." },
  { key: "Drag Chain", label: "Drag Chain", desc: "Designed for wood waste recycling and forest product drag conveyor applications." },
  { key: "Super Mac", label: "Super Mac Drag Chain", desc: "Extended sidebar design for increased strength and wear resistance. Wood waste & forest products." },
  { key: "Mega Mac", label: "Mega Mac Drag Chain", desc: "The heaviest-duty welded steel drag chain for the most demanding applications." },
];

const UNIKING_RED = "#C41E3A";
const UNIKING_DARK = "#1a1a1a";
const UNIKING_GRAY = "#f5f5f5";
const UNIKING_BORDER = "#e0e0e0";

export default function WeldedSteel() {
  const [activeSubcat, setActiveSubcat] = useState(null);
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeRelTab, setActiveRelTab] = useState("pins");
  const [activeSpecTab, setActiveSpecTab] = useState("basic");
  // Related item modal state
  const [relatedModalProduct, setRelatedModalProduct] = useState(null);

  useEffect(() => {
    if (activeSubcat) {
      setLoading(true);
      setSelectedProduct(null);
      MacChainProduct.filter({ subcategory: activeSubcat, product_type: "Chain" })
        .then(data => {
          setProducts(data);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [activeSubcat]);

  const subcatInfo = SUBCATEGORIES.find(s => s.key === activeSubcat);

  // Handler: look up a related item by slug and open modal
  const handleRelatedClick = async (item) => {
    if (!item.slug) return;
    try {
      const results = await MacChainProduct.filter({ slug: item.slug });
      if (results && results.length > 0) {
        setRelatedModalProduct(results[0]);
      }
    } catch (e) {
      console.error("Failed to load related product:", e);
    }
  };

  return (
    <div style={{ fontFamily: "'Segoe UI', Arial, sans-serif", minHeight: "100vh", background: "#fff", color: UNIKING_DARK }}>
      {/* Header */}
      <div style={{ background: UNIKING_DARK, color: "#fff", padding: "18px 32px", display: "flex", alignItems: "center", gap: 16, borderBottom: `3px solid ${UNIKING_RED}` }}>
        <div style={{ width: 40, height: 40, background: UNIKING_RED, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 18, letterSpacing: 1 }}>U</div>
        <div>
          <div style={{ fontSize: 11, color: "#aaa", letterSpacing: 2, textTransform: "uppercase" }}>Uniking Canada — Product Catalog</div>
          <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: 0.5 }}>Welded Steel Chain</div>
        </div>
        <div style={{ flex: 1 }} />
        <a href="/" style={{ color: "#aaa", textDecoration: "none", fontSize: 13 }}>← Back to Catalog</a>
      </div>

      {/* Subcategory Nav */}
      <div style={{ background: UNIKING_GRAY, borderBottom: `1px solid ${UNIKING_BORDER}` }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", overflowX: "auto" }}>
          {SUBCATEGORIES.map(sub => (
            <button
              key={sub.key}
              onClick={() => setActiveSubcat(sub.key)}
              style={{
                padding: "16px 24px",
                border: "none",
                background: "none",
                cursor: "pointer",
                fontSize: 13,
                fontWeight: activeSubcat === sub.key ? 700 : 500,
                color: activeSubcat === sub.key ? UNIKING_RED : "#444",
                borderBottom: activeSubcat === sub.key ? `3px solid ${UNIKING_RED}` : "3px solid transparent",
                whiteSpace: "nowrap",
                transition: "all 0.15s",
                textTransform: "uppercase",
                letterSpacing: 0.5,
              }}
            >
              {sub.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px 48px" }}>
        {/* Landing State */}
        {!activeSubcat && (
          <div style={{ padding: "64px 0", textAlign: "center" }}>
            <div style={{ fontSize: 28, fontWeight: 700, marginBottom: 12, color: UNIKING_DARK }}>Welded Steel Chain</div>
            <div style={{ fontSize: 16, color: "#666", maxWidth: 600, margin: "0 auto 40px", lineHeight: 1.7 }}>
              Mac Chain welded steel chains are manufactured with superior steel for the most demanding conveying and elevating applications.
              Select a chain type above to browse products.
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, maxWidth: 900, margin: "0 auto" }}>
              {SUBCATEGORIES.map(sub => (
                <button
                  key={sub.key}
                  onClick={() => setActiveSubcat(sub.key)}
                  style={{
                    padding: "24px 20px",
                    border: `1px solid ${UNIKING_BORDER}`,
                    borderRadius: 8,
                    background: "#fff",
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "all 0.15s",
                    borderTop: `3px solid ${UNIKING_RED}`,
                  }}
                  onMouseEnter={e => e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.10)"}
                  onMouseLeave={e => e.currentTarget.style.boxShadow = "none"}
                >
                  <div style={{ fontWeight: 700, fontSize: 14, color: UNIKING_DARK, marginBottom: 8 }}>{sub.label}</div>
                  <div style={{ fontSize: 12, color: "#777", lineHeight: 1.5 }}>{sub.desc}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Product List View */}
        {activeSubcat && !selectedProduct && (
          <div style={{ paddingTop: 32 }}>
            <div style={{ marginBottom: 24, paddingBottom: 16, borderBottom: `1px solid ${UNIKING_BORDER}` }}>
              <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 6 }}>{subcatInfo?.label}</div>
              <div style={{ fontSize: 14, color: "#666", lineHeight: 1.6 }}>{subcatInfo?.desc}</div>
              {products.length > 0 && (
                <div style={{ fontSize: 12, color: "#999", marginTop: 8 }}>{products.length} products — click a part number for full specifications</div>
              )}
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
                          {products[0].basic_headers.map((h, i) => (
                            <th key={i} style={{ padding: "10px 14px", textAlign: "left", fontWeight: 600, whiteSpace: "nowrap", fontSize: 12 }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {products.map((p, pi) => (
                          <tr
                            key={p.id}
                            onClick={() => { setSelectedProduct(p); setActiveRelTab("pins"); setActiveSpecTab("basic"); }}
                            style={{ cursor: "pointer", borderBottom: `1px solid ${UNIKING_BORDER}`, background: pi % 2 === 0 ? "#fff" : UNIKING_GRAY, transition: "background 0.1s" }}
                            onMouseEnter={e => e.currentTarget.style.background = "#fff3f5"}
                            onMouseLeave={e => e.currentTarget.style.background = pi % 2 === 0 ? "#fff" : UNIKING_GRAY}
                          >
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
                    <div
                      key={p.id}
                      onClick={() => { setSelectedProduct(p); setActiveRelTab("pins"); setActiveSpecTab("basic"); }}
                      style={{ border: `1px solid ${UNIKING_BORDER}`, borderRadius: 8, overflow: "hidden", cursor: "pointer", background: "#fff", transition: "all 0.15s" }}
                      onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.12)"; e.currentTarget.style.borderColor = UNIKING_RED; }}
                      onMouseLeave={e => { e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.borderColor = UNIKING_BORDER; }}
                    >
                      {p.product_image && (
                        <div style={{ height: 140, overflow: "hidden", background: UNIKING_GRAY }}>
                          <img src={p.product_image} alt={p.part_number} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        </div>
                      )}
                      <div style={{ padding: "14px 16px" }}>
                        <div style={{ fontWeight: 800, fontSize: 16, color: UNIKING_RED, marginBottom: 4 }}>{p.part_number}</div>
                        {p.basic_rows?.[0]?.[1] && (
                          <div style={{ fontSize: 11, color: "#999" }}>Pitch: {p.basic_rows[0][1]}"</div>
                        )}
                        <div style={{ marginTop: 8, display: "flex", gap: 4, flexWrap: "wrap" }}>
                          {p.related_pins?.length > 0 && <span style={{ fontSize: 10, background: "#e8f4fd", color: "#1565c0", padding: "2px 6px", borderRadius: 10, fontWeight: 600 }}>{p.related_pins.length} PIN{p.related_pins.length > 1 ? "S" : ""}</span>}
                          {p.related_attachments?.length > 0 && <span style={{ fontSize: 10, background: "#e8f5e9", color: "#2e7d32", padding: "2px 6px", borderRadius: 10, fontWeight: 600 }}>{p.related_attachments.length} ATT</span>}
                          {p.related_sprockets?.length > 0 && <span style={{ fontSize: 10, background: "#fce4ec", color: "#c62828", padding: "2px 6px", borderRadius: 10, fontWeight: 600 }}>{p.related_sprockets.length} SPR</span>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* Product Detail View */}
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
      {relatedModalProduct && (
        <RelatedItemModal
          product={relatedModalProduct}
          onClose={() => setRelatedModalProduct(null)}
        />
      )}
    </div>
  );
}

function ProductDetail({ product: p, onBack, activeRelTab, setActiveRelTab, activeSpecTab, setActiveSpecTab, onRelatedClick }) {
  const UNIKING_RED = "#C41E3A";
  const UNIKING_DARK = "#1a1a1a";
  const UNIKING_BORDER = "#e0e0e0";
  const UNIKING_GRAY = "#f5f5f5";

  const hasRelated = (p.related_pins?.length > 0) || (p.related_attachments?.length > 0) || (p.related_sprockets?.length > 0);

  const relTabs = [
    { key: "pins", label: `Related Pins (${p.related_pins?.length || 0})`, items: p.related_pins || [], show: true },
    { key: "attachments", label: `Related Attachments (${p.related_attachments?.length || 0})`, items: p.related_attachments || [], show: true },
    { key: "sprockets", label: `Related Sprockets (${p.related_sprockets?.length || 0})`, items: p.related_sprockets || [], show: true },
  ];

  return (
    <div style={{ paddingTop: 24 }}>
      {/* Breadcrumb */}
      <div style={{ fontSize: 13, color: "#999", marginBottom: 20 }}>
        <span style={{ cursor: "pointer", color: UNIKING_RED }} onClick={onBack}>
          ← {p.subcategory}
        </span>
        <span style={{ margin: "0 8px" }}>/</span>
        <span style={{ fontWeight: 600, color: UNIKING_DARK }}>{p.part_number}</span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40, marginBottom: 40 }}>
        {/* Left: Images */}
        <div>
          {p.product_image && (
            <div style={{ border: `1px solid ${UNIKING_BORDER}`, borderRadius: 8, overflow: "hidden", marginBottom: 16, background: UNIKING_GRAY }}>
              <img src={p.product_image} alt={p.part_number} style={{ width: "100%", height: 280, objectFit: "cover" }} />
            </div>
          )}
          {p.diagram_image && (
            <div style={{ border: `1px solid ${UNIKING_BORDER}`, borderRadius: 8, overflow: "hidden", background: "#fff", padding: 16, textAlign: "center" }}>
              <div style={{ fontSize: 11, color: "#999", marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>Technical Drawing</div>
              <img src={p.diagram_image} alt="diagram" style={{ maxWidth: "100%", maxHeight: 160, objectFit: "contain" }} />
            </div>
          )}
        </div>

        {/* Right: Info */}
        <div>
          <div style={{ fontSize: 28, fontWeight: 800, color: UNIKING_DARK, marginBottom: 4 }}>{p.part_number}</div>
          {p.industry && (
            <div style={{ fontSize: 13, color: "#666", marginBottom: 16 }}>
              <strong>Industry:</strong> {p.industry}
            </div>
          )}
          {p.description && (
            <div style={{ fontSize: 14, color: "#444", lineHeight: 1.7, marginBottom: 16, borderLeft: `3px solid ${UNIKING_RED}`, paddingLeft: 14 }}>
              {p.description}
            </div>
          )}
          {p.features?.length > 0 && (
            <ul style={{ margin: "0 0 20px 0", padding: "0 0 0 20px", lineHeight: 2 }}>
              {p.features.map((f, i) => (
                <li key={i} style={{ fontSize: 13, color: "#444" }}>{f}</li>
              ))}
            </ul>
          )}
          <div style={{ padding: "12px 16px", background: UNIKING_GRAY, borderRadius: 6, fontSize: 12, color: "#888", marginTop: 8 }}>
            * WH denotes Heat-Treated chain. Heat-treated chain has greater wear resistance for abrasive environments.
          </div>
          <button
            onClick={() => window.print()}
            style={{ marginTop: 16, padding: "10px 20px", background: UNIKING_RED, color: "#fff", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 13, fontWeight: 600 }}
          >
            Print Tear Sheet
          </button>
        </div>
      </div>

      {/* Spec Tables */}
      <div style={{ marginBottom: 40 }}>
        <div style={{ display: "flex", gap: 0, marginBottom: 0, borderBottom: `1px solid ${UNIKING_BORDER}` }}>
          {[
            { key: "basic", label: "Basic Specs" },
            ...(p.more_headers?.length > 0 ? [{ key: "more", label: "More Specs" }] : []),
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveSpecTab(tab.key)}
              style={{
                padding: "10px 20px",
                border: "none",
                borderBottom: activeSpecTab === tab.key ? `2px solid ${UNIKING_RED}` : "2px solid transparent",
                background: "none",
                cursor: "pointer",
                fontWeight: activeSpecTab === tab.key ? 700 : 500,
                color: activeSpecTab === tab.key ? UNIKING_RED : "#666",
                fontSize: 14,
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div style={{ overflowX: "auto", marginTop: 16 }}>
          {activeSpecTab === "basic" && p.basic_headers?.length > 0 && (
            <SpecTable headers={p.basic_headers} rows={p.basic_rows || []} />
          )}
          {activeSpecTab === "more" && p.more_headers?.length > 0 && (
            <SpecTable headers={p.more_headers} rows={p.more_rows || []} />
          )}
        </div>
      </div>

      {/* Related Items */}
      {hasRelated && (
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 2, color: "#999", marginBottom: 12 }}>Related Products</div>
          <div style={{ display: "flex", gap: 0, borderBottom: `1px solid ${UNIKING_BORDER}`, marginBottom: 24 }}>
            {relTabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveRelTab(tab.key)}
                style={{
                  padding: "10px 20px",
                  border: "none",
                  borderBottom: activeRelTab === tab.key ? `2px solid ${UNIKING_RED}` : "2px solid transparent",
                  background: "none",
                  cursor: "pointer",
                  fontWeight: activeRelTab === tab.key ? 700 : 500,
                  color: activeRelTab === tab.key ? UNIKING_RED : "#666",
                  fontSize: 13,
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {relTabs.map(tab => (
            activeRelTab === tab.key && (
              <div key={tab.key}>
                {tab.items.length === 0 ? (
                  <div style={{ color: "#aaa", fontSize: 14, padding: "20px 0" }}>No related {tab.key} for this part number.</div>
                ) : (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 16 }}>
                    {tab.items.map((item, i) => (
                      <RelatedCard key={i} item={item} onClick={() => onRelatedClick(item)} />
                    ))}
                  </div>
                )}
              </div>
            )
          ))}
        </div>
      )}
    </div>
  );
}

function SpecTable({ headers, rows }) {
  const UNIKING_RED = "#C41E3A";
  const UNIKING_DARK = "#1a1a1a";
  const UNIKING_BORDER = "#e0e0e0";
  const UNIKING_GRAY = "#f5f5f5";
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
              <td key={vi} style={{ padding: "10px 16px", whiteSpace: "nowrap", fontWeight: vi === 0 ? 700 : 400, color: vi === 0 ? UNIKING_RED : UNIKING_DARK }}>
                {val}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function RelatedCard({ item, onClick }) {
  const UNIKING_RED = "#C41E3A";
  const UNIKING_BORDER = "#e0e0e0";
  const UNIKING_GRAY = "#f5f5f5";

  return (
    <div
      onClick={onClick}
      style={{
        border: `1px solid ${UNIKING_BORDER}`,
        borderRadius: 8,
        overflow: "hidden",
        background: "#fff",
        transition: "all 0.15s",
        cursor: "pointer",
        position: "relative",
      }}
      onMouseEnter={e => {
        e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.12)";
        e.currentTarget.style.borderColor = UNIKING_RED;
        const hint = e.currentTarget.querySelector(".rel-hint");
        if (hint) hint.style.opacity = "1";
      }}
      onMouseLeave={e => {
        e.currentTarget.style.boxShadow = "none";
        e.currentTarget.style.borderColor = UNIKING_BORDER;
        const hint = e.currentTarget.querySelector(".rel-hint");
        if (hint) hint.style.opacity = "0";
      }}
    >
      {item.image && (
        <div style={{ background: UNIKING_GRAY, height: 100, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
          <img src={item.image} alt={item.part_number} style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} />
        </div>
      )}
      <div style={{ padding: "10px 12px" }}>
        <div style={{ fontWeight: 700, fontSize: 13, color: UNIKING_RED, marginBottom: 2 }}>{item.part_number}</div>
        <div style={{ fontSize: 11, color: "#888", lineHeight: 1.4 }}>{item.name || item.category}</div>
        <div
          className="rel-hint"
          style={{
            fontSize: 10,
            color: UNIKING_RED,
            marginTop: 6,
            opacity: 0,
            transition: "opacity 0.15s",
            fontWeight: 600,
          }}
        >
          View specs →
        </div>
      </div>
    </div>
  );
}

// Modal that shows full specs of a related item (pin, attachment, sprocket)
function RelatedItemModal({ product: p, onClose }) {
  const UNIKING_RED = "#C41E3A";
  const UNIKING_DARK = "#1a1a1a";
  const UNIKING_BORDER = "#e0e0e0";
  const UNIKING_GRAY = "#f5f5f5";

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0,
        background: "rgba(0,0,0,0.55)",
        zIndex: 1000,
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 24,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: "#fff",
          borderRadius: 12,
          maxWidth: 680,
          width: "100%",
          maxHeight: "88vh",
          overflowY: "auto",
          boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
        }}
      >
        {/* Modal Header */}
        <div style={{ padding: "20px 24px 16px", borderBottom: `1px solid ${UNIKING_BORDER}`, display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, color: "#999", textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>
              {p.category} — {p.subcategory}
            </div>
            <div style={{ fontSize: 22, fontWeight: 800, color: UNIKING_DARK }}>{p.part_number}</div>
          </div>
          <button
            onClick={onClose}
            style={{ background: "none", border: "none", cursor: "pointer", fontSize: 22, color: "#999", lineHeight: 1 }}
          >
            ×
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: "24px" }}>
          {/* Image + description row */}
          <div style={{ display: "grid", gridTemplateColumns: p.product_image ? "1fr 1fr" : "1fr", gap: 24, marginBottom: 24 }}>
            {p.product_image && (
              <div style={{ background: UNIKING_GRAY, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, minHeight: 160 }}>
                <img src={p.product_image} alt={p.part_number} style={{ maxWidth: "100%", maxHeight: 180, objectFit: "contain" }} />
              </div>
            )}
            <div>
              {p.description && (
                <div style={{ fontSize: 14, color: "#444", lineHeight: 1.7, marginBottom: 12, borderLeft: `3px solid ${UNIKING_RED}`, paddingLeft: 12 }}>
                  {p.description}
                </div>
              )}
              {p.industry && (
                <div style={{ fontSize: 12, color: "#777", marginBottom: 8 }}>
                  <strong>Industry:</strong> {p.industry}
                </div>
              )}
              {p.features?.length > 0 && (
                <ul style={{ margin: 0, padding: "0 0 0 18px", lineHeight: 1.9 }}>
                  {p.features.map((f, i) => (
                    <li key={i} style={{ fontSize: 13, color: "#444" }}>{f}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Diagram */}
          {p.diagram_image && p.diagram_image !== p.product_image && (
            <div style={{ textAlign: "center", marginBottom: 24, padding: 16, border: `1px solid ${UNIKING_BORDER}`, borderRadius: 8 }}>
              <div style={{ fontSize: 11, color: "#999", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>Technical Drawing</div>
              <img src={p.diagram_image} alt="diagram" style={{ maxWidth: "100%", maxHeight: 160, objectFit: "contain" }} />
            </div>
          )}

          {/* Spec table */}
          {p.basic_headers?.length > 0 && (
            <div style={{ overflowX: "auto", marginBottom: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#999", textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>Specifications</div>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ background: UNIKING_DARK, color: "#fff" }}>
                    {p.basic_headers.map((h, i) => (
                      <th key={i} style={{ padding: "8px 14px", textAlign: "left", fontWeight: 600, whiteSpace: "nowrap", fontSize: 12 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(p.basic_rows || []).map((row, ri) => (
                    <tr key={ri} style={{ borderBottom: `1px solid ${UNIKING_BORDER}`, background: ri % 2 === 0 ? "#fff" : UNIKING_GRAY }}>
                      {row.map((val, vi) => (
                        <td key={vi} style={{ padding: "8px 14px", whiteSpace: "nowrap", fontWeight: vi === 0 ? 700 : 400, color: vi === 0 ? UNIKING_RED : UNIKING_DARK }}>
                          {val}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* More specs */}
          {p.more_headers?.length > 0 && (
            <div style={{ overflowX: "auto" }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#999", textTransform: "uppercase", letterSpacing: 1, marginBottom: 10, marginTop: 16 }}>Additional Specifications</div>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ background: UNIKING_DARK, color: "#fff" }}>
                    {p.more_headers.map((h, i) => (
                      <th key={i} style={{ padding: "8px 14px", textAlign: "left", fontWeight: 600, whiteSpace: "nowrap", fontSize: 12 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(p.more_rows || []).map((row, ri) => (
                    <tr key={ri} style={{ borderBottom: `1px solid ${UNIKING_BORDER}`, background: ri % 2 === 0 ? "#fff" : UNIKING_GRAY }}>
                      {row.map((val, vi) => (
                        <td key={vi} style={{ padding: "8px 14px", whiteSpace: "nowrap", fontWeight: vi === 0 ? 700 : 400, color: vi === 0 ? UNIKING_RED : UNIKING_DARK }}>
                          {val}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Close button */}
          <div style={{ marginTop: 24, textAlign: "right" }}>
            <button
              onClick={onClose}
              style={{ padding: "10px 24px", background: UNIKING_DARK, color: "#fff", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 13, fontWeight: 600 }}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
