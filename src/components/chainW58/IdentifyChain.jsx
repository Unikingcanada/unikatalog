/**
 * Identify my chain: measure pitch → inner width → roller → sidebar height.
 * Allows for wear: a worn chain measures long on pitch and small on rollers / sidebars.
 */
import { useMemo, useState } from "react";
import { getChainIndex, getDimensionMap } from "@/lib/chainW58/chainRepo";
import { tx, num, fmtIn, fmtMm } from "@/lib/chainW58/chainText";
import { Crumbs, Img, Loading, ErrorBox, thumbOf, useAsync } from "./ui";

// [allowed below, allowed above] as a fraction of the catalogue value
const TOL = {
  pitch: [0.01, 0.035],   // elongation: up to ~3% long, plus measuring error
  iw: [0.03, 0.03],
  rd: [0.08, 0.02],       // rollers wear smaller
  sh: [0.06, 0.02],       // sidebars wear on the edge
};
const FIELDS = [
  { k: "pitch", label: "Pitch", help: "Centre of one pin to the centre of the next. Measure over 10 pitches and divide by 10 for accuracy.", inF: "pitch_in", mmF: "pitch_mm", required: true },
  { k: "iw", label: "Inner width", help: "Clear width between the inner plates (sidebars).", inF: "roller_width_in", mmF: "roller_width_mm" },
  { k: "rd", label: "Roller / barrel diameter", help: "Outside diameter of the roller, or of the barrel/bushing on rollerless chain.", inF: "roller_dia_in", mmF: "roller_dia_mm" },
  { k: "sh", label: "Sidebar height", help: "Height of the link plate (sidebar).", inF: "plate_height_in", mmF: "plate_height_mm" },
];

function parseFrac(s) {
  const t = String(s || "").trim();
  if (!t) return null;
  const m = t.match(/^(?:(\d+)\s+)?(\d+)\/(\d+)$/);
  if (m) return (m[1] ? parseInt(m[1], 10) : 0) + parseInt(m[2], 10) / parseInt(m[3], 10);
  return num(t);
}

export default function IdentifyChain({ go }) {
  const data = useAsync(async () => {
    const [index, dims] = await Promise.all([getChainIndex(), getDimensionMap()]);
    return { index, dims };
  }, []);
  const [units, setUnits] = useState("in");
  const [vals, setVals] = useState({ pitch: "", iw: "", rd: "", sh: "" });
  const [strands, setStrands] = useState("");

  const measured = useMemo(() => {
    const out = {};
    for (const f of FIELDS) {
      const v = parseFrac(vals[f.k]);
      if (v !== null && v > 0) out[f.k] = units === "mm" ? v / 25.4 : v;
    }
    return out;
  }, [vals, units]);

  const matches = useMemo(() => {
    if (!data.data || !measured.pitch) return [];
    const { index, dims } = data.data;
    const out = [];
    for (const c of index) {
      if (strands && (num(c.strands) || 1) !== Number(strands)) continue;
      const d = dims.get(c.chain_id) || {};
      let score = 0, used = 0, ok = true;
      for (const f of FIELDS) {
        const m = measured[f.k];
        if (m === undefined) continue;
        let ref = num(d[f.inF]);
        if (ref === null && num(d[f.mmF]) !== null) ref = num(d[f.mmF]) / 25.4;
        if (ref === null && f.k === "pitch") ref = num(c.pitch_in);
        if (ref === null) { if (f.k === "pitch") { ok = false; break; } score += 0.5; continue; }
        const rel = (m - ref) / ref;
        const [below, above] = TOL[f.k];
        if (rel < -below || rel > above) { ok = false; break; }
        score += Math.abs(rel) / (rel < 0 ? below : above);
        used++;
      }
      if (ok) out.push({ c, d, score: score / Math.max(1, Object.keys(measured).length), used });
    }
    out.sort((a, b) => a.score - b.score || b.used - a.used);
    return out.slice(0, 30);
  }, [data.data, measured, strands]);

  const u = units;
  const show = (inch, mm) => {
    const i = num(inch), m = num(mm);
    if (u === "mm") { const v = m ?? (i !== null ? i * 25.4 : null); return v === null ? "-" : fmtMm(v); }
    const v = i ?? (m !== null ? m / 25.4 : null);
    return v === null ? "-" : fmtIn(v);
  };

  return (
    <div>
      <Crumbs items={[{ label: "All products", onClick: go.back }, { label: "Chain", onClick: go.home }, { label: "Identify my chain" }]} />
      <div className="eyebrow">Measure · match · quote</div>
      <h1>Identify my chain</h1>
      <p className="lead">Start with the pitch, then add any other measurement you can take. Matches allow for normal wear: a worn chain measures a little long on pitch and a little small on rollers and sidebars.</p>

      <div className="ukc-card" style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "flex-end", marginBottom: 12 }}>
          <div><label className="ukc-label">Units</label>
            <div className="ukc-seg">{["in", "mm"].map((x) => <button key={x} className={units === x ? "on" : ""} onClick={() => setUnits(x)}>{x === "in" ? "inches" : "mm"}</button>)}</div>
          </div>
          <div style={{ minWidth: 140 }}><label className="ukc-label">Strands</label>
            <select className="ukc-select" value={strands} onChange={(e) => setStrands(e.target.value)}>
              <option value="">Any</option>{[1, 2, 3, 4].map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>
        <div className="ukc-id-grid">
          {FIELDS.map((f, i) => (
            <div key={f.k}>
              <label className="ukc-label" htmlFor={"id-" + f.k}>{i + 1}. {f.label} ({u}){f.required ? " *" : ""}</label>
              <input id={"id-" + f.k} className="ukc-input" inputMode="decimal" value={vals[f.k]} placeholder={f.required ? "required" : "optional"}
                onChange={(e) => setVals((v) => ({ ...v, [f.k]: e.target.value }))} />
              <div className="small muted" style={{ marginTop: 4, lineHeight: 1.45 }}>{f.help}</div>
            </div>
          ))}
        </div>
      </div>

      {data.loading ? <Loading label="Loading dimensions" /> : data.error ? <ErrorBox error={data.error} /> : !measured.pitch ? (
        <div className="muted small">Enter the pitch to see matches. Fractions like 2 5/8 are fine.</div>
      ) : matches.length === 0 ? (
        <div className="ukc-empty">No catalogued chain matches those measurements. Add the chain to your RFQ as a custom request with photos and we will identify it. <button className="ukc-link" onClick={go.rfq}>Open RFQ cart</button></div>
      ) : (
        <div>
          <div className="mono small muted" style={{ marginBottom: 8 }}>{matches.length >= 30 ? "Top 30" : matches.length} matches, best first</div>
          {matches.map(({ c, d, score }, i) => (
            <button key={c.chain_id} className="ukc-row-card" onClick={() => go.chain(c.chain_id, c.catalog_group)}>
              <Img src={thumbOf(c.image_url)} photo fallback={<span style={{ width: 72 }} />} />
              <span style={{ minWidth: 0, flex: 1 }}>
                <span className="t" style={{ display: "block" }}>{tx(c.chain_number)} {i === 0 && <span className="ukc-chip acc" style={{ marginLeft: 6 }}>Closest</span>}</span>
                <span className="kv" style={{ display: "block" }}>{tx(c.catalog_group)} · {tx(c.series)}</span>
                <span className="kv mono" style={{ display: "block" }}>
                  P {show(d.pitch_in ?? c.pitch_in, d.pitch_mm ?? c.pitch_mm)} · IW {show(d.roller_width_in, d.roller_width_mm)} · R {show(d.roller_dia_in, d.roller_dia_mm)} · SH {show(d.plate_height_in, d.plate_height_mm)} {u}
                </span>
              </span>
              <span className="ukc-score mono">{Math.max(0, Math.round(100 - score * 50))}%</span>
            </button>
          ))}
          <p className="ukc-note">Fit % compares your measurements with the catalogue figures inside the wear allowance. Confirm the match with Uniking before ordering.</p>
        </div>
      )}
    </div>
  );
}
