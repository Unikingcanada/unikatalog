import { useState, useEffect } from "react";
import { UniCatalog } from "@/api/entities";

const NAVY = "#1a3a5c";

export default function RollerConfigurator({ onBack, onGoRFQ }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        let all = [], skip = 0;
        while (true) {
          const batch = await UniCatalog.list({ limit: 500, skip });
          if (!batch || !batch.length) break;
          all = [...all, ...batch];
          if (batch.length < 500) break;
          skip += batch.length;
        }
        setProducts(all.filter(r =>
          (r.product_type || "").toLowerCase().includes("roller") ||
          (r.product_type || "").toLowerCase().includes("conveyor roller")
        ));
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtered = products.filter(p => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return [p.series, p.model_code, p.style, p.application, p.materials, p.notes]
      .some(f => f && f.toLowerCase().includes(q));
  });

  // If called from Home (has onBack prop), render as embedded view
  const isEmbedded = typeof onBack === "function";

  const header = (
    <div style={{ background: NAVY, padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 56, boxShadow: "0 2px 8px rgba(0,0,0,.18)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        {isEmbedded && (
          <a href="#" onClick={e => { e.preventDefault(); onBack(); }} style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 14px", borderRadius: 8, background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)", color: "#fff", fontWeight: 700, fontSize: 13, textDecoration: "none" }}>← Home</a>
        )}
        <span style={{ color: "#fff", fontSize: 14, fontWeight: 800 }}>Conveyor Rollers</span>
      </div>
      {isEmbedded && (
        <a href="#" onClick={e => { e.preventDefault(); onGoRFQ(); }} style={{ padding: "6px 14px", borderRadius: 8, background: "rgba(255,255,255,.12)", border: "1px solid rgba(255,255,255,.2)", color: "#fff", fontSize: 12, fontWeight: 700, textDecoration: "none" }}>RFQ Cart</a>
      )}
    </div>
  );

  const content = (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: 24 }}>
      <div style={{ marginBottom: 20 }}>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search rollers..."
          style={{ padding: "8px 14px", borderRadius: 8, border: "1px solid #d1d5db", fontSize: 13, outline: "none", width: "100%", maxWidth: 400 }}
        />
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: 80, color: "#9ca3af", fontSize: 14 }}>Loading catalog...</div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: 80 }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>⚙️</div>
          <div style={{ fontSize: 18, fontWeight: 800, color: NAVY, marginBottom: 8 }}>Conveyor Rollers</div>
          <div style={{ fontSize: 14, color: "#6b7280", maxWidth: 420, margin: "0 auto", lineHeight: 1.7 }}>
            No conveyor roller data is currently loaded in the catalog.<br />
            Contact Uniking to request a quote or for product availability.
          </div>
          <a href="mailto:rfq@unikingcanada.com" style={{ display: "inline-block", marginTop: 20, padding: "10px 24px", background: NAVY, color: "#fff", borderRadius: 8, fontWeight: 700, fontSize: 13, textDecoration: "none" }}>
            Request a Quote
          </a>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 16 }}>
          {filtered.map(p => (
            <div key={p.id} onClick={() => setSelected(p)}
              style={{ background: "#fff", borderRadius: 12, border: "1px solid #e5e7eb", cursor: "pointer", padding: 16, transition: "box-shadow .15s, border-color .15s" }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,.1)"; e.currentTarget.style.borderColor = NAVY; }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = ""; e.currentTarget.style.borderColor = "#e5e7eb"; }}>
              {p.image_url && <img src={p.image_url} alt={p.series} style={{ width: "100%", height: 120, objectFit: "contain", marginBottom: 10 }} onError={e => e.target.style.display = "none"} />}
              <div style={{ fontSize: 14, fontWeight: 800, color: NAVY }}>{p.model_code || p.series}</div>
              {p.style && <div style={{ fontSize: 12, color: "#6b7280", marginTop: 4 }}>{p.style}</div>}
              {p.application && <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 4 }}>{p.application}</div>}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", fontFamily: "'Inter','Segoe UI',sans-serif" }}>
      {header}
      {content}
    </div>
  );
}