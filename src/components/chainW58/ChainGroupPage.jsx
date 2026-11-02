/** Group page: every chain in one catalogue group, with filters, sortable table (cards on phones). */
import { useMemo, useState } from "react";
import { getGroups, getChainIndex, getDimensionMap, getPerformanceMap } from "@/lib/chainW58/chainRepo";
import { tx, num, fmtIn, fmtMm, fmtInt } from "@/lib/chainW58/chainText";
import { Crumbs, Img, Loading, ErrorBox, thumbOf, useAsync } from "./ui";
import { ChainSearchBox } from "./ChainHome";

const PAGE = 120;

function dimVal(units, inch, mm) {
  const i = num(inch), m = num(mm);
  if (units === "mm") { const v = m !== null ? m : i !== null ? i * 25.4 : null; return v === null ? null : fmtMm(v); }
  const v = i !== null ? i : m !== null ? m / 25.4 : null;
  return v === null ? null : fmtIn(v);
}

export default function ChainGroupPage({ group, go }) {
  const data = useAsync(async () => {
    const [groups, index, dims, perf] = await Promise.all([getGroups(), getChainIndex(), getDimensionMap(), getPerformanceMap()]);
    const g = groups.find((x) => x.catalog_group === group) || { catalog_group: group, intro: "" };
    const rows = index.filter((c) => c.catalog_group === group).map((c) => {
      const d = dims.get(c.chain_id) || {}, p = perf.get(c.chain_id) || {};
      return {
        c, d, p,
        pitch: num(d.pitch_in) ?? num(c.pitch_in),
        iw: num(d.roller_width_in), rd: num(d.roller_dia_in), sh: num(d.plate_height_in),
        uts: num(p.tensile_strength_lbs), att: num(c.attachment_count) || 0, strands: num(c.strands) || 1,
      };
    });
    return { g, rows, index };
  }, [group]);

  const [units, setUnits] = useState("in");
  const [series, setSeries] = useState("");
  const [strands, setStrands] = useState("");
  const [attOnly, setAttOnly] = useState(false);
  const [pmin, setPmin] = useState("");
  const [pmax, setPmax] = useState("");
  const [sort, setSort] = useState({ k: "pitch", dir: 1 });
  const [shown, setShown] = useState(PAGE);

  const rows = data.data?.rows || [];
  const seriesOpts = useMemo(() => [...new Set(rows.map((r) => tx(r.c.series)).filter(Boolean))].sort(), [rows]);
  const strandOpts = useMemo(() => [...new Set(rows.map((r) => r.strands))].sort((a, b) => a - b), [rows]);

  const filtered = useMemo(() => {
    const toIn = (v) => { const n = num(v); return n === null ? null : units === "mm" ? n / 25.4 : n; };
    const lo = toIn(pmin), hi = toIn(pmax);
    let out = rows.filter((r) =>
      (!series || tx(r.c.series) === series) &&
      (!strands || r.strands === Number(strands)) &&
      (!attOnly || r.att > 0) &&
      (lo === null || (r.pitch !== null && r.pitch >= lo - 1e-6)) &&
      (hi === null || (r.pitch !== null && r.pitch <= hi + 1e-6)));
    const k = sort.k;
    out = out.slice().sort((a, b) => {
      if (k === "des") return sort.dir * String(a.c.chain_number).localeCompare(String(b.c.chain_number), undefined, { numeric: true });
      const av = a[k], bv = b[k];
      if (av === null && bv === null) return 0;
      if (av === null) return 1;
      if (bv === null) return -1;
      return sort.dir * (av - bv) || String(a.c.chain_number).localeCompare(String(b.c.chain_number), undefined, { numeric: true });
    });
    return out;
  }, [rows, series, strands, attOnly, pmin, pmax, sort, units]);

  if (data.loading) return <Loading label="Loading chains" />;
  if (data.error) return <ErrorBox error={data.error} />;
  const { g } = data.data;
  const th = (k, label) => (
    <th onClick={() => setSort((s) => ({ k, dir: s.k === k ? -s.dir : 1 }))} aria-sort={sort.k === k ? (sort.dir > 0 ? "ascending" : "descending") : "none"}>
      {label}{sort.k === k ? (sort.dir > 0 ? " ▲" : " ▼") : ""}
    </th>
  );
  const u = units === "mm" ? "mm" : "in";
  const dash = <span className="muted">-</span>;

  return (
    <div>
      <Crumbs items={[{ label: "All products", onClick: go.back }, { label: "Chain", onClick: go.home }, { label: tx(group) }]} />
      <div className="eyebrow">{tx(g.chain_family)}</div>
      <h1>{tx(group)}</h1>
      {g.intro && <p className="lead">{tx(g.intro)}</p>}

      <ChainSearchBox index={data.data.index} go={go} group={group} placeholder={`Search within ${tx(group)}`} />

      <div className="ukc-filters">
        {seriesOpts.length > 1 && (
          <div className="wide"><label className="ukc-label">Series</label>
            <select className="ukc-select" value={series} onChange={(e) => { setSeries(e.target.value); setShown(PAGE); }}>
              <option value="">All series ({seriesOpts.length})</option>
              {seriesOpts.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        )}
        {strandOpts.length > 1 && (
          <div><label className="ukc-label">Strands</label>
            <select className="ukc-select" value={strands} onChange={(e) => { setStrands(e.target.value); setShown(PAGE); }}>
              <option value="">Any</option>
              {strandOpts.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        )}
        <div><label className="ukc-label">Pitch from ({u})</label><input className="ukc-input" inputMode="decimal" value={pmin} onChange={(e) => setPmin(e.target.value)} placeholder="min" /></div>
        <div><label className="ukc-label">Pitch to ({u})</label><input className="ukc-input" inputMode="decimal" value={pmax} onChange={(e) => setPmax(e.target.value)} placeholder="max" /></div>
        <div><label className="ukc-label">Units</label>
          <div className="ukc-seg">{["in", "mm"].map((x) => <button key={x} className={units === x ? "on" : ""} onClick={() => setUnits(x)}>{x}</button>)}</div>
        </div>
        <div style={{ flex: "0 0 auto" }}>
          <button className={"ukc-chip" + (attOnly ? " on" : "")} style={{ minHeight: 42, padding: "0 14px" }} onClick={() => setAttOnly((v) => !v)}>
            {attOnly ? "✓ " : ""}With catalogued attachments
          </button>
        </div>
      </div>

      <div className="muted small mono" style={{ marginBottom: 8 }}>{filtered.length} of {rows.length} chains</div>

      <div className="ukc-table-wrap">
        <table className="ukc-table">
          <thead><tr>
            {th("des", "Designation")}<th>Series</th>{th("pitch", `Pitch (${u})`)}{th("iw", `Inner width (${u})`)}{th("rd", `Roller (${u})`)}{th("sh", `Sidebar ht (${u})`)}{th("uts", "Avg. ultimate (lbf)")}{th("att", "Attachments")}
          </tr></thead>
          <tbody>
            {filtered.slice(0, shown).map((r) => (
              <tr key={r.c.chain_id} onClick={() => go.chain(r.c.chain_id, group)} tabIndex={0} onKeyDown={(e) => e.key === "Enter" && go.chain(r.c.chain_id, group)}>
                <td className="des">{tx(r.c.chain_number)}{r.strands > 1 ? <span className="muted small"> ×{r.strands}</span> : null}</td>
                <td className="muted" style={{ whiteSpace: "normal", minWidth: 160 }}>{tx(r.c.series)}</td>
                <td className="num">{dimVal(units, r.d.pitch_in ?? r.c.pitch_in, r.d.pitch_mm ?? r.c.pitch_mm) ?? dash}</td>
                <td className="num">{dimVal(units, r.d.roller_width_in, r.d.roller_width_mm) ?? dash}</td>
                <td className="num">{dimVal(units, r.d.roller_dia_in, r.d.roller_dia_mm) ?? dash}</td>
                <td className="num">{dimVal(units, r.d.plate_height_in, r.d.plate_height_mm) ?? dash}</td>
                <td className="num">{r.uts !== null ? fmtInt(r.uts) : dash}</td>
                <td className="num">{r.att > 0 ? <span className="ukc-chip ok">{r.att}</span> : <span className="muted small">Made to order</span>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="ukc-cards">
        {filtered.slice(0, shown).map((r) => (
          <button key={r.c.chain_id} className="ukc-row-card" onClick={() => go.chain(r.c.chain_id, group)}>
            <Img src={thumbOf(r.c.image_url)} photo fallback={<span style={{ width: 72 }} />} />
            <span style={{ minWidth: 0, flex: 1 }}>
              <span className="t" style={{ display: "block" }}>{tx(r.c.chain_number)}{r.strands > 1 ? ` ×${r.strands}` : ""}</span>
              <span className="kv" style={{ display: "block" }}>{tx(r.c.series)}</span>
              <span className="kv mono" style={{ display: "block" }}>
                P {dimVal(units, r.d.pitch_in ?? r.c.pitch_in, r.d.pitch_mm ?? r.c.pitch_mm) ?? "-"} {u}
                {r.d.roller_width_in || r.d.roller_width_mm ? ` · IW ${dimVal(units, r.d.roller_width_in, r.d.roller_width_mm)}` : ""}
                {r.uts !== null ? ` · ${fmtInt(r.uts)} lbf` : ""}
              </span>
              <span className="kv" style={{ display: "block" }}>{r.att > 0 ? `${r.att} attachments` : "Attachments made to order"}</span>
            </span>
          </button>
        ))}
      </div>

      {filtered.length > shown && (
        <div style={{ textAlign: "center", marginTop: 14 }}>
          <button className="ukc-btn ghost" onClick={() => setShown((n) => n + PAGE)}>Show more ({filtered.length - shown} left)</button>
        </div>
      )}
      <p className="ukc-note">Strength is the average ultimate strength, the strongest credible published figure on file. The Uniking-certified value is confirmed on the quotation.</p>
    </div>
  );
}
