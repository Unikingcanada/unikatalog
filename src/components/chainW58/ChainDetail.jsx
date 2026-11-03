/** Chain detail: photo, specs, catalogue drawing + legend, materials, attachments, interchange. */
import { useMemo, useState } from "react";
import { getChainDetail } from "@/lib/chainW58/chainRepo";
import { tx, inMm, fmtInt, num, legendRows, materialsByClass, strandLabel, ON_QUOTE, fmtIn, fmtMm } from "@/lib/chainW58/chainText";
import { addChainQuoteRequest, readCart } from "@/lib/chainW58/chainRfq";
import { Crumbs, Img, Loading, ErrorBox, Modal, thumbOf, useAsync, Drawing } from "./ui";

export function specRows(chain, dims, perf) {
  const d = dims || {}, p = perf || {};
  const rows = [
    ["Pitch", inMm(d.pitch_in ?? chain.pitch_in, d.pitch_mm ?? chain.pitch_mm)],
    ["Inner width", inMm(d.roller_width_in, d.roller_width_mm)],
    ["Roller / barrel diameter", inMm(d.roller_dia_in, d.roller_dia_mm)],
    ["Sidebar height", inMm(d.plate_height_in, d.plate_height_mm)],
    ["Sidebar thickness", inMm(d.plate_thickness_in, d.plate_thickness_mm)],
    ["Pin diameter", inMm(d.pin_dia_in, d.pin_dia_mm)],
    ["Bushing diameter", inMm(d.bushing_dia_in, null)],
    ["Overall width / pin length", inMm(d.overall_width_in, d.overall_width_mm)],
    ["Weight", num(d.weight_lbs_ft) !== null ? `${num(d.weight_lbs_ft)} lb/ft${num(d.weight_kg_m) !== null ? ` · ${num(d.weight_kg_m)} kg/m` : ""}` : null],
    ["Avg. ultimate strength", num(p.tensile_strength_lbs) !== null ? `${fmtInt(p.tensile_strength_lbs)} lbf${num(p.tensile_strength_kn) !== null ? ` · ${fmtInt(p.tensile_strength_kn)} kN` : ""}` : null],
    ["Working load", num(p.working_load_lbs) !== null ? `${fmtInt(p.working_load_lbs)} lbf${num(p.working_load_kn) !== null ? ` · ${num(p.working_load_kn)} kN` : ""}` : null],
    ["Strands", (num(chain.strands) || 1) > 1 ? strandLabel(chain.strands) : null],
  ];
  return rows.filter((r) => r[1]);
}

/** Free-text request that goes into the RFQ cart as a custom line tied to this chain. */
export function CustomRequestBox({ chain, kind, placeholder, go }) {
  const [text, setText] = useState("");
  const [sent, setSent] = useState(false);
  function add() {
    if (!text.trim()) return;
    const cart = readCart();
    const id = `uk_custom_${kind}_${chain.chain_id}_${Date.now()}`;
    cart.push({
      cartId: id, id, _source: "custom", chain_id: chain.chain_id,
      series: `${tx(chain.chain_number)} - custom ${kind}`, name: `${tx(chain.chain_number)} - custom ${kind}`,
      type: tx(chain.catalog_group), style: "", category: "Custom", image_url: "", materials: "",
      quantity: 1, unit: "Each", notes: text.trim(),
    });
    localStorage.setItem("uniking_rfq_cart", JSON.stringify(cart));
    window.dispatchEvent(new Event("rfq_cart_updated"));
    setText(""); setSent(true);
  }
  return (
    <div className="ukc-card" style={{ marginTop: 12 }}>
      <label className="ukc-label" htmlFor={`cr-${kind}`}>Describe a custom {kind}</label>
      <textarea id={`cr-${kind}`} className="ukc-textarea" rows={3} value={text} onChange={(e) => { setText(e.target.value); setSent(false); }} placeholder={placeholder} />
      <div style={{ display: "flex", gap: 10, marginTop: 10, flexWrap: "wrap", alignItems: "center" }}>
        <button className="ukc-btn" disabled={!text.trim()} onClick={add}>Add to RFQ</button>
        {sent && <span className="small" style={{ color: "var(--ukc-ok)" }}>Added to your RFQ. <button className="ukc-link" onClick={go.rfq}>Open cart</button></span>}
      </div>
    </div>
  );
}

/**
 * Measurement status of one attachment against its own drawing: every lettered value on the drawing,
 * which of them are published, and the other published (unlettered) figures.
 */
export function measurementInfo(a) {
  const legend = Array.isArray(a.legend) ? a.legend.filter((x) => Array.isArray(x) && x[0]) : [];
  const vals = a.lettered_dims_in && typeof a.lettered_dims_in === "object" ? a.lettered_dims_in : {};
  const order = legend.map((x) => x[0]);
  Object.keys(vals).forEach((k) => { if (!order.includes(k)) order.push(k); });
  const text = new Map(legend.map((x) => [x[0], x[1]]));
  const rows = order.map((L) => ({ L, label: text.get(L) || "", v: num(vals[L]) }));
  const extra = [
    ["Bolt-hole diameter", inMm(a.hole_dia_in, a.hole_dia_mm)],
    ["Lug height / reach", inMm(a.lug_height_in, a.lug_height_mm)],
    ["Lug / platform width", inMm(a.platform_width_in, null)],
    ["Overall width over attachments", inMm(a.overall_width_over_attachments_in, null)],
    ["Holes per lug", a.holes_per_lug ? String(a.holes_per_lug) : null],
  ].filter((r) => r[1]);
  const have = rows.filter((r) => r.v !== null).length;
  const status = rows.length && have === rows.length ? "complete" : have > 0 ? "partial" : extra.length ? "key" : "none";
  return { rows, have, total: rows.length, extra, status };
}

export function MeasureBadge({ a }) {
  const m = measurementInfo(a);
  if (m.status === "complete") return <span className="ukc-chip ok mstat">All {m.total} measurements</span>;
  if (m.status === "partial") return <span className="ukc-chip warn mstat">{m.have} of {m.total} measurements</span>;
  if (m.status === "key") return <span className="ukc-chip mstat">Key dimensions only</span>;
  return <span className="ukc-chip mstat">Measurements on quote</span>;
}

function AttachmentMeasurements({ a, chain, onClose }) {
  const m = measurementInfo(a);
  return (
    <Modal title={`${tx(a.attachment_code)} on ${tx(chain.chain_number)}`} onClose={onClose} wide>
      <p className="muted">{tx(a.description)}{a.side ? ` · ${tx(a.side)}` : ""}</p>
      <div className="ukc-drawing" style={{ marginBottom: 12 }}>
        <Drawing src={a.image_url} alt={`${a.attachment_code} attachment drawing`} title={`${tx(a.attachment_code)} - attachment drawing`} fallback={<div className="muted small">Drawing not available.</div>} />
      </div>
      <div style={{ marginBottom: 8 }}><MeasureBadge a={a} /></div>
      {m.rows.length > 0 && (
        <table className="ukc-legend">
          <thead><tr className="mono small muted"><td>Letter</td><td>Measurement</td><td className="v">in</td><td className="v">mm</td></tr></thead>
          <tbody>
            {m.rows.map((r) => (
              <tr key={r.L} className={r.v === null ? "q" : ""}>
                <td className="ukc-key L">{r.L}</td>
                <td>{tx(r.label)}</td>
                <td className="v">{r.v !== null ? fmtIn(r.v) : ON_QUOTE}</td>
                <td className="v">{r.v !== null ? fmtMm(r.v * 25.4) : ""}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {m.extra.length > 0 && (
        <>
          <h3 style={{ marginTop: 16 }}>Other published dimensions</h3>
          <dl className="ukc-kv">{m.extra.map(([k, v]) => <FragmentKV key={k} k={k} v={v} />)}</dl>
        </>
      )}
      {m.status !== "complete" && (
        <p className="ukc-note">Values marked "{ON_QUOTE}" are not published in the catalogue for {tx(chain.chain_number)}; Uniking confirms them from the works drawing with your quotation.</p>
      )}
      {a.spacing_note && <p className="ukc-note">Spacing: {tx(a.spacing_note)}</p>}
      <p className="ukc-note">Catalogue drawing. Measurements are the published figures for {tx(chain.chain_number)}; confirm on the quotation before machining.</p>
    </Modal>
  );
}
const FragmentKV = ({ k, v }) => (<><dt>{k}</dt><dd>{v}</dd></>);

function AttachmentsTab({ chain, attachments, go }) {
  const [open, setOpen] = useState(null);
  const cards = attachments.filter((a) => !a.drawing_listed_only);
  const listed = attachments.filter((a) => a.drawing_listed_only);
  if (!attachments.length) {
    return (
      <div>
        <div className="ukc-empty">
          No attachments are catalogued for {tx(chain.chain_number)} - made to order.
          {chain.attachment_coverage === "None by design" ? " This chain is normally supplied without attachments." : ""}
        </div>
        <CustomRequestBox chain={chain} kind="attachment" go={go} placeholder="Attachment type, sides, hole size and spacing, every how many pitches…" />
      </div>
    );
  }
  return (
    <div>
      {cards.length > 0 && (
        <div className="ukc-att-grid">
          {cards.map((a, i) => (
            <div key={(a.id || a.attachment_code) + i} className="ukc-att">
              <div className="img"><Img src={thumbOf(a.image_url)} alt={`${a.attachment_code} drawing`} fallback={<span className="muted small">No drawing</span>} /></div>
              <div className="body">
                <div style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "baseline" }}>
                  <span className="code">{tx(a.attachment_code)}</span>
                  {a.side && <span className="ukc-chip">{tx(a.side)}</span>}
                </div>
                <div className="small muted">{tx(a.attachment_type)}</div>
                <div className="small">{tx(a.description)}</div>
                <div><MeasureBadge a={a} /></div>
                <div style={{ marginTop: "auto", paddingTop: 6 }}><button className="ukc-btn ghost sm" onClick={() => setOpen(a)}>View measurements</button></div>
              </div>
            </div>
          ))}
        </div>
      )}
      {listed.length > 0 && (
        <div style={{ marginTop: 16 }}>
          <h3>Also listed in the catalogue ({listed.length})</h3>
          <ul className="ukc-listed">
            {listed.map((a, i) => (
              <li key={(a.id || a.attachment_code) + "l" + i}>
                <span className="ukc-key" style={{ minWidth: 64 }}>{tx(a.attachment_code)}</span>
                <span style={{ flex: 1 }}>{tx(a.description || a.attachment_type)}{a.side ? ` · ${tx(a.side)}` : ""}</span>
                {a.image_url && <button className="ukc-link small" onClick={() => setOpen(a)}>Drawing</button>}
              </li>
            ))}
          </ul>
          <p className="ukc-note">Listed attachments appear on the catalogue drawing; dimensions are {ON_QUOTE.toLowerCase()}.</p>
        </div>
      )}
      <CustomRequestBox chain={chain} kind="attachment" go={go} placeholder="Need something not listed? Describe the attachment, sides and spacing…" />
      {open && <AttachmentMeasurements a={open} chain={chain} onClose={() => setOpen(null)} />}
    </div>
  );
}

function MaterialsTab({ chain, go }) {
  const groups = materialsByClass(chain.materials);
  if (!groups.length) {
    return (
      <div>
        <div className="ukc-empty">No materials are catalogued for {tx(chain.chain_number)} - made to order.</div>
        <CustomRequestBox chain={chain} kind="material" go={go} placeholder="Material, finish or treatment needed, and the operating conditions…" />
      </div>
    );
  }
  return (
    <div style={{ display: "grid", gap: 14 }}>
      {groups.map(([cls, items]) => (
        <div key={cls}>
          <h3>{tx(cls)}</h3>
          <div className="ukc-listed" style={{ listStyle: "none" }}>
            {items.map((m) => (
              <div key={m.code || m.name} style={{ padding: "10px 12px", borderBottom: "1px solid var(--ukc-line)" }}>
                <div style={{ fontWeight: 600 }}>{tx(m.name)}</div>
                {m.description && <div className="small muted">{tx(m.description)}</div>}
              </div>
            ))}
          </div>
        </div>
      ))}
      <p className="ukc-note">Only the materials and finishes on file for this chain are listed. Anything else can be requested as a custom option in the configurator.</p>
    </div>
  );
}

function DrawingTab({ chain, dims, drawingUrl }) {
  const rows = legendRows(chain, dims);
  if (!drawingUrl) return <div className="ukc-empty">No catalogue drawing is on file for {tx(chain.chain_number)}. A works drawing is supplied with the quotation.</div>;
  return (
    <div>
      {chain.drawing_title && <div className="mono small muted" style={{ marginBottom: 8, letterSpacing: ".08em" }}>{tx(chain.drawing_title)}</div>}
      <div className="ukc-drawing"><Drawing src={drawingUrl} alt={`Catalogue reference drawing, ${tx(chain.chain_number)}`} title={`${tx(chain.chain_number)} - ${tx(chain.drawing_title || "reference drawing")}`} fallback={<div className="muted small">Drawing not available.</div>} /></div>
      {rows.length > 0 && (
        <table className="ukc-legend">
          {rows.some((r) => r.letter) && <thead><tr className="mono small muted"><td>Letter</td><td>Dimension</td><td className="v">Value</td></tr></thead>}
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className={r.value ? "" : "q"}>
                {rows.some((x) => x.letter) && <td className="ukc-key L">{r.letter}</td>}
                <td>{r.label}</td>
                <td className="v">{r.value || ON_QUOTE}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <p className="ukc-note">Catalogue reference drawing for the construction. Values are the published figures for {tx(chain.chain_number)}.</p>
    </div>
  );
}

export function mediaFor(detail) {
  if (!detail) return {};
  const photo = detail.media.find((m) => m.media_type === "Product Photo" && m.url)?.url || detail.chain.image_url || "";
  const drawing = detail.chain.drawing_url || detail.media.find((m) => m.media_type === "Drawing Preview" && m.url)?.url || "";
  return { photo, drawing };
}

export default function ChainDetail({ chainId, fromGroup, go }) {
  const st = useAsync(() => getChainDetail(chainId), [chainId]);
  if (st.loading) return <Loading label="Loading chain" />;
  if (st.error) return <ErrorBox error={st.error} />;
  return <ChainDetailView key={chainId} detail={st.data} fromGroup={fromGroup} go={go} />;
}

/** Pure view (also rendered server-side by the QA script for every chain and tab). */
export function ChainDetailView({ detail, fromGroup, go, initialTab = "drawing" }) {
  const [tab, setTab] = useState(initialTab);
  const [added, setAdded] = useState(false);
  const media = useMemo(() => mediaFor(detail), [detail]);
  if (!detail) {
    return (
      <div>
        <Crumbs items={[{ label: "All products", onClick: go.back }, { label: "Chain", onClick: go.home }, { label: "Not found" }]} />
        <div className="ukc-empty">This chain is not in the catalogue. <button className="ukc-link" onClick={go.home}>Back to chain</button></div>
      </div>
    );
  }
  const { chain, dims, perf, attachments } = detail;
  const group = chain.catalog_group || fromGroup;
  const specs = specRows(chain, dims, perf);
  const matCount = (Array.isArray(chain.materials) ? chain.materials : []).filter((m) => m && m.name).length;
  const photoNote = { family: "Representative photo of this chain family.", render: "Representative image.", series: "" }[chain.image_match] || "";

  return (
    <div>
      <Crumbs items={[{ label: "All products", onClick: go.back }, { label: "Chain", onClick: go.home }, { label: tx(group), onClick: () => go.group(group) }, { label: tx(chain.chain_number) }]} />
      <div className="ukc-detail-head">
        <div>
          <div className="ukc-photo">
            <Img src={media.photo} photo alt={tx(chain.display_name)} fallback={media.drawing ? <img src={media.drawing} alt="" style={{ maxWidth: "100%" }} /> : <span className="muted small mono">No photo on file</span>} />
          </div>
          {photoNote && media.photo && <div className="ukc-note">{photoNote}</div>}
        </div>
        <div>
          <div className="eyebrow">{tx(group)}</div>
          <h1>{tx(chain.chain_number)}</h1>
          <div style={{ fontWeight: 600, marginBottom: 8 }}>{tx(chain.series)}</div>
          {chain.description && <p className="muted">{tx(chain.description)}</p>}
          {specs.length ? (
            <dl className="ukc-kv" style={{ margin: "12px 0" }}>{specs.map(([k, v]) => <FragmentKV key={k} k={k} v={v} />)}</dl>
          ) : <p className="muted">Dimensions are {ON_QUOTE.toLowerCase()}.</p>}
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 14 }}>
            <button className="ukc-btn primary" onClick={() => go.configure(chain.chain_id, group)}>Configure &amp; request a quote</button>
            <button className="ukc-btn ghost" onClick={() => { addChainQuoteRequest(chain); setAdded(true); }}>{added ? "✓ In RFQ" : "Add to RFQ"}</button>
            {added && <button className="ukc-link small" onClick={go.rfq}>Open cart</button>}
          </div>
          <p className="ukc-note">Strength shown is the average ultimate strength, the strongest credible published figure. The Uniking-certified value is confirmed on the quotation.</p>
        </div>
      </div>

      <div className="ukc-tabs" role="tablist">
        {[
          ["drawing", "Drawing", null],
          ["materials", "Materials", matCount],
          ["attachments", "Attachments", attachments.length],
          ["interchange", "Interchange & standard", null],
        ].map(([k, label, n]) => (
          <button key={k} role="tab" aria-selected={tab === k} className={tab === k ? "on" : ""} onClick={() => setTab(k)}>
            {label}{n !== null ? <span className="k">{n}</span> : null}
          </button>
        ))}
      </div>

      {tab === "drawing" && <DrawingTab chain={chain} dims={dims} drawingUrl={media.drawing} />}
      {tab === "materials" && <MaterialsTab chain={chain} go={go} />}
      {tab === "attachments" && <AttachmentsTab chain={chain} attachments={attachments} go={go} />}
      {tab === "interchange" && (
        <div className="ukc-card">
          <dl className="ukc-kv">
            <FragmentKV k="Designation" v={tx(chain.chain_number)} />
            {chain.standard && <FragmentKV k="Standard / interchange" v={tx(chain.standard)} />}
            {chain.construction && <FragmentKV k="Construction" v={tx(chain.construction)} />}
            <FragmentKV k="Chain family" v={tx(chain.chain_family)} />
          </dl>
          <p className="ukc-note">Search also finds this chain by older part numbers that interchange with it. Send us the number on your old chain and we will confirm the match on the quotation.</p>
        </div>
      )}
    </div>
  );
}
