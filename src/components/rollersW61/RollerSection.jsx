/**
 * RollerSection — UniKatalog's Conveyor Rollers section, rebuilt to match the roller configurator on
 * unikingcanada.com (r61). Data and fit/load logic come from src/lib/rollerW61 (verbatim website data,
 * logic ported function by function and checked against the website on every combination).
 * Series photos: public/roller-media (copied from the website). Documents link to unikingcanada.com.
 */
import { useEffect, useMemo, useState } from "react";
import "./roller.css";
import {
  SERIES_ORDER, seriesOf, groups, materials, tubeList, bearingList, shaftList, cascade, autoFit,
  calcConfig, summaryRows, specLines, schematicSVG, units, bLabel, tLabel, shLabel, TX, ROLLER_DOCS,
} from "@/lib/rollerW61/rollerEngine";

const IMG = {
  1100: "18aa026d6d8b", 1200: "ee5ae998ffb3", 1300: "c70a6be33d07", 1450: "9ba5d2698c82", 1500: "47b5eb054829",
  1700: "e7327b9eee65", 1800: "5c00c54470f7", 1940: "1b87cef6a315", 1960: "1b87cef6a315", 3400: "892861759d44",
  3500: "892861759d44", 3800: "f86f8241c0be", 3900: "1b87cef6a315",
};
const imgOf = (s) => (IMG[s.img] ? `/roller-media/${IMG[s.img]}.webp` : "");
const dash = (s) => String(s == null ? "" : s).replace(/\s*[—–]\s*/g, " - ");
const shortName = (s) => dash(s.name.replace(/^Series [^—]+— /, ""));
const UNIT_KEY = "ukr_units";
const FIG_CSS = ".objl{fill:rgba(14,31,58,.14);stroke:#0E1F3A;stroke-width:1.2}.obj{fill:rgba(14,31,58,.06);stroke:#0E1F3A;stroke-width:1.4}.obj.sleeve{fill:rgba(242,101,34,.16);stroke:#F26522}.dim{stroke:#3A4A66;stroke-width:.8;fill:none}.ln{stroke:#3A4A66;stroke-width:1.4;fill:none;stroke-dasharray:6 3}.lead{stroke:#3A4A66;stroke-width:.5;fill:none;opacity:.5}.dtx{font-family:'IBM Plex Mono',monospace;font-size:8.5px;fill:#3A4A66}.val{font-family:Anton,sans-serif;font-size:12px;fill:#0E1F3A}.pane{font-family:'IBM Plex Mono',monospace;font-size:8.5px;fill:#3A4A66;letter-spacing:.14em}.note{font-family:'IBM Plex Mono',monospace;font-size:8px;fill:#3A4A66}";
const FONT_HREF = "https://fonts.googleapis.com/css2?family=Anton&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap";

function useFonts() {
  useEffect(() => {
    if (document.querySelector("link[data-ukc-fonts]")) return;
    const l = document.createElement("link"); l.rel = "stylesheet"; l.href = FONT_HREF; l.setAttribute("data-ukc-fonts", "1");
    document.head.appendChild(l);
  }, []);
}

function SeriesGrid({ u, onPick }) {
  const [duty, setDuty] = useState("All");
  const U = units(u);
  const keys = SERIES_ORDER.filter((k) => duty === "All" || seriesOf(k).duty === duty);
  return (
    <>
      <div className="ukr-chips" role="group" aria-label="Duty filter">
        {["All", "Light", "Medium", "Heavy"].map((d) => (
          <button key={d} className={"ukr-chip" + (duty === d ? " on" : "")} onClick={() => setDuty(d)}>{d === "All" ? "All series" : d + " duty"}</button>
        ))}
      </div>
      <div className="ukr-grid">
        {keys.map((k) => {
          const s = seriesOf(k);
          return (
            <button key={k} className="ukr-card" onClick={() => onPick(k)} aria-label={`Configure ${s.name}`}>
              <span className={"ukr-duty " + s.duty}>{s.duty}</span>
              {imgOf(s) && <img src={imgOf(s)} alt="" loading="lazy" />}
              <span className="pn">SERIES {s.label}</span>
              <span className="nm">{shortName(s)}</span>
              <span className="ds">{dash(s.desc)}</span>
              <span className="meta"><span>↑ {U.LD(s.maxLoad)}</span><span>→ {U.SP(s.maxSpeed)}</span><span>{TX.pp}{s.pp}</span></span>
              <span className="tags">{(s.tags || []).map((t) => <span key={t}>{t}</span>)}</span>
            </button>
          );
        })}
      </div>
    </>
  );
}

function addToRFQ(cfg) {
  const lines = specLines(cfg);
  const flags = cfg.bad.concat(cfg.warn);
  let cart = [];
  try { cart = JSON.parse(localStorage.getItem("uniking_rfq_cart") || "[]"); } catch { cart = []; }
  const U = units(cfg.units);
  const id = "uk_roller_" + cfg.key + "_" + Date.now();
  cart.push({
    cartId: id, id, _source: "uk_roller_configurator",
    series: `${dash(cfg.series.name.replace(/ — .*$/, ""))} - RL ${U.LB(cfg.RL)}`,
    name: dash(cfg.series.name), type: "Conveyor Roller",
    style: [cfg.bearing.pn, cfg.tube.pnx, cfg.shaft ? cfg.shaft.pn : "shaft TBC"].join(" / "),
    category: "Conveyor Rollers", image_url: imgOf(cfg.series), materials: cfg.tube.mat, application: "",
    quantity: 1, unit: "Pieces",
    notes: (flags.length ? "! " + flags.map(dash).join(" · ") + " | " : "") + lines.map((r) => r[0] + ": " + dash(r[1])).join(" | "),
    config: { seriesKey: cfg.key, bearing: cfg.bearing.pn, tube: cfg.tube.pnx, shaft: cfg.shaft ? cfg.shaft.pn : null, BF_in: cfg.BF, RL_in: cfg.RL, grooves: cfg.grooves, grvX_in: cfg.grvX, grvY_in: cfg.grvY, maxLoad_lbs: cfg.loadTxt, maxSpeed_fpm: cfg.speed ? cfg.speed.fpm : null },
  });
  localStorage.setItem("uniking_rfq_cart", JSON.stringify(cart));
  window.dispatchEvent(new Event("rfq_cart_updated"));
}

function emailSpec(cfg) {
  const flags = cfg.bad.concat(cfg.warn);
  const body = "UNIKING CANADA ROLLER SPECIFICATION\n=================================\n\n" +
    (flags.length ? "! " + flags.map(dash).join(" · ") + "\n\n" : "") +
    specLines(cfg).map((r) => r[0] + ": " + dash(r[1])).join("\n") + "\n\n" +
    (cfg.units === "mm" ? "Units: mm (inches in brackets)" : "Units: inches (mm in brackets)") +
    "\n\nGenerated by Uniking Canada Roller Configurator\nunikingcanada.com · 514-886-5270";
  window.location.href = "mailto:?subject=" + encodeURIComponent("Roller Spec - " + dash(cfg.series.name)) + "&body=" + encodeURIComponent(body);
}

function printSheet(cfg, svgMarkup) {
  const U = units(cfg.units), L = specLines(cfg), s = cfg.series;
  const esc = (x) => String(x == null ? "" : x).replace(/[&<>"]/g, (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[m]));
  const flags = cfg.bad.concat(cfg.warn), st = cfg.verdict.kind;
  const row = (r) => `<tr><td>${esc(r[0])}</td><td>${esc(dash(r[1]))}</td></tr>`;
  const html = `<!doctype html><html><head><meta charset="utf-8"><title>${esc(dash(s.name))} - Roller specification</title>
<link href="${FONT_HREF}" rel="stylesheet"><style>
body{font-family:Inter,sans-serif;color:#0E1F3A;margin:28px;background:#fff}h1{font-family:Anton,sans-serif;font-weight:400;text-transform:uppercase;margin:0;font-size:28px}
.tag,.sec{font-family:'IBM Plex Mono',monospace;font-size:10px;letter-spacing:.18em;text-transform:uppercase;color:#3A4A66}.sec{color:#F26522;margin:14px 0 6px}
.head{display:flex;justify-content:space-between;border-bottom:2px solid #0E1F3A;padding-bottom:10px}.meta{font-family:'IBM Plex Mono',monospace;font-size:11px;text-align:right}
.series{font-family:Anton,sans-serif;text-transform:uppercase;font-size:18px;margin:12px 0}.grid{display:grid;grid-template-columns:1fr 1fr;gap:20px}
table{width:100%;border-collapse:collapse;font-size:12px}td{border-bottom:1px solid rgba(14,31,58,.14);padding:5px 4px;vertical-align:top}td:first-child{color:#3A4A66;width:42%}
.hero{font-family:Anton,sans-serif;font-size:40px}.vd{font-family:'IBM Plex Mono',monospace;font-size:11px;padding:8px;border:1px solid;margin:6px 0}
.vd.ok{color:#2E7D46}.vd.warn{color:#8a6508}.vd.bad{color:#C62828}img{max-width:100%;max-height:120px}svg{width:100%;border:1px solid rgba(14,31,58,.14)}
.foot{font-family:'IBM Plex Mono',monospace;font-size:9px;color:#3A4A66;margin-top:18px;border-top:1px solid rgba(14,31,58,.14);padding-top:8px}${FIG_CSS}</style></head><body>
<div class="head"><div><h1>Conveyor Roller Specification</h1><div class="tag">Uniking Canada · Interroll conveyor roller catalogue (Uniking edition)</div></div>
<div class="meta">Date <b>${new Date().toISOString().slice(0, 10)}</b><br>Units <b>${cfg.units === "mm" ? "MM (IN)" : "IN (MM)"}</b><br>Pages <b>${esc(s.pp)}</b></div></div>
<div class="series">${esc(dash(s.name))}</div>
<div class="grid"><div><div class="sec">Configuration</div><table>${L.slice(1, 5).map(row).join("")}</table>
<div class="sec">Dimensions · rating</div><table>${L.slice(5, 11).map(row).join("")}</table></div>
<div><div class="hero">${esc(U.Lv(cfg.RL))} <span style="font-size:.45em">${cfg.units === "mm" ? "mm" : "in"}</span></div><div class="tag">Order by RL · ${esc(U.Lo(cfg.RL))}</div>
<div class="vd ${st}">${esc(dash(cfg.verdict.text))}</div>${flags.length > 1 ? `<div class="tag">${esc(flags.slice(1).map(dash).join(" · "))}</div>` : ""}
${imgOf(s) ? `<img src="${window.location.origin + imgOf(s)}" alt="">` : ""}<svg class="ukr-fig" viewBox="0 0 440 290">${svgMarkup}</svg></div></div>
<div class="foot">Generated from the Interroll conveyor roller catalogue (Uniking edition), pages shown. Availability and load rating confirmed by Uniking on quote. RFQ@unikingcanada.com · 514-886-5270</div>
<script>window.onload=function(){setTimeout(function(){window.print()},300)}<\/script></body></html>`;
  const w = window.open("", "_blank");
  if (!w) return;
  w.document.open(); w.document.write(html); w.document.close();
}

function Configurator({ k, u, onBack, onGoRFQ }) {
  const s = seriesOf(k);
  const U = units(u);
  const [st, setSt] = useState(() => autoFit(s, cascade(s, {}, "grp"), 15));
  const [bf, setBf] = useState(15); // inches
  const [grv, setGrv] = useState({ x: 2.15, y: 1.25 }); // inches
  const [added, setAdded] = useState(false);
  const [bfText, setBfText] = useState(null);

  const change = (field, value) => {
    const from = { grp: "grp", mat: "tube", ti: "bearing", bi: "shaft", si: null }[field];
    const next = { ...st, [field]: value };
    const cascaded = from ? cascade(s, next, from === "grp" ? "mat" : from) : next;
    setSt(autoFit(s, cascaded, bf)); setAdded(false);
  };
  const setBF = (inches) => { setBf(inches); setSt((cur) => autoFit(s, cur, inches)); setAdded(false); };

  const cfg = useMemo(() => calcConfig(k, st, bf, grv.x, grv.y, u), [k, st, bf, grv, u]);
  const svg = useMemo(() => (cfg ? schematicSVG(cfg) : ""), [cfg]);
  const gs = groups(s), mats = materials(s, st.grp);
  const tubes = tubeList(s, st.grp, st.mat), brgs = bearingList(s, st.grp, st.ti), shafts = shaftList(s, st.bi);
  const toDisp = (inches) => U.Lv(inches);
  const fromDisp = (v) => { const n = parseFloat(v); return Number.isFinite(n) ? (U.isMM ? n / 25.4 : n) : 0; };
  const gvVar = cfg && cfg.grooves > 0 && cfg.grvKind === "variable";

  return (
    <div>
      <nav className="ukr-crumbs" aria-label="Breadcrumb">
        <button onClick={onBack}>Conveyor rollers</button><span>/</span><span className="cur">Series {s.label}</span>
      </nav>
      <div className="ukr-series-head">
        {imgOf(s) && <img src={imgOf(s)} alt="" />}
        <div style={{ minWidth: 0, flex: 1 }}>
          <div className="eyebrow">Series {s.label} · {TX.pp} {s.pp}</div>
          <h2 style={{ margin: "4px 0 6px" }}>{dash(s.name)}</h2>
          <div className="muted" style={{ fontSize: 14, lineHeight: 1.55 }}>{dash(s.desc)}</div>
        </div>
      </div>

      <div className="ukr-cfg">
        <div className="ukr-panel">
          <h3>1 · Configuration options</h3>
          {gs.length > 1 && (
            <div className="ukr-field">
              <label className="ukr-label" htmlFor="r-grp">{k === "3800" ? TX.grpDrive : TX.grp}</label>
              <select id="r-grp" value={st.grp} onChange={(e) => change("grp", e.target.value)}>
                {gs.map((g) => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
          )}
          <div className="ukr-field">
            <label className="ukr-label" htmlFor="r-mat">Tube material <i>filters the tube list</i></label>
            <select id="r-mat" value={st.mat} onChange={(e) => change("mat", e.target.value)}>
              <option value="all">{TX.allMat} ({mats.total})</option>
              {mats.mats.map((m) => <option key={m} value={m}>{m} ({mats.cnt[m]})</option>)}
            </select>
          </div>
          <div className="ukr-field">
            <label className="ukr-label" htmlFor="r-tube">Tube <i>diameter × wall - material - option (part no.)</i></label>
            <select id="r-tube" value={st.ti} onChange={(e) => change("ti", +e.target.value)}>
              {tubes.map((ti) => <option key={ti} value={ti}>{dash(tLabel(U, s.tubes[ti]))}</option>)}
            </select>
          </div>
          <div className="ukr-field">
            <label className="ukr-label" htmlFor="r-bearing">Bearing / housing <i>only bearings that fit this tube</i></label>
            <select id="r-bearing" value={st.bi} onChange={(e) => change("bi", +e.target.value)}>
              {brgs.map((bi) => <option key={bi} value={bi}>{dash(bLabel(U, s.bearings[bi]))}</option>)}
            </select>
          </div>
          <div className="ukr-field">
            <label className="ukr-label" htmlFor="r-shaft">Shaft <i>only shafts that fit this bearing</i></label>
            <select id="r-shaft" value={st.si == null ? "" : st.si} onChange={(e) => change("si", e.target.value === "" ? null : +e.target.value)}>
              {shafts.length ? shafts.map((si) => <option key={si} value={si}>{dash(shLabel(U, s.shafts[si]))}</option>) : <option value="">{TX.noShaft}</option>}
            </select>
          </div>
          <div className="ukr-field">
            <label className="ukr-label" htmlFor="r-bf">Between Frame (BF) <i>lane width - order by RL · {U.isMM ? "mm" : "inches"}</i></label>
            <input id="r-bf" type="number" step={U.isMM ? "0.1" : "0.01"} min="0" inputMode="decimal"
              value={bfText ?? toDisp(bf)}
              onChange={(e) => { setBfText(e.target.value); const v = fromDisp(e.target.value); if (v > 0) setBF(v); }}
              onBlur={() => setBfText(null)} />
          </div>
          {gvVar && (
            <div className="ukr-field" style={{ display: "grid", gridTemplateColumns: cfg.grooves > 1 ? "1fr 1fr" : "1fr", gap: 10 }}>
              <div>
                <label className="ukr-label" htmlFor="r-grv-x">X - end face to first groove</label>
                <input id="r-grv-x" type="number" step="0.01" value={toDisp(grv.x)} onChange={(e) => setGrv((g) => ({ ...g, x: fromDisp(e.target.value) }))} />
              </div>
              {cfg.grooves > 1 && (
                <div>
                  <label className="ukr-label" htmlFor="r-grv-y">Y - first groove to second</label>
                  <input id="r-grv-y" type="number" step="0.01" value={toDisp(grv.y)} onChange={(e) => setGrv((g) => ({ ...g, y: fromDisp(e.target.value) }))} />
                </div>
              )}
            </div>
          )}
          {cfg && cfg.grvRule && <div className="ukr-hint mono">{dash(cfg.grvRule)}</div>}
          <div className="ukr-hint">Grooves and sleeves come with the tube part: pick a grooved or sleeved tube to get them. Every list follows the catalogue's own fit rules.</div>
        </div>

        <div className="ukr-panel">
          <h3>2 · Configuration summary</h3>
          {cfg ? (
            <>
              <div className={"ukr-verdict " + cfg.verdict.kind} role="status">{dash(cfg.verdict.text)}</div>
              <div className="ukr-tiles">
                <div className="ukr-tile key"><div className="k">RL - order by</div><div className="v">{cfg.out.rl}<i>{U.isMM ? "mm" : "in"}</i></div></div>
                <div className="ukr-tile"><div className="k">BF - between frame</div><div className="v">{cfg.out.bf}<i>{U.isMM ? "mm" : "in"}</i></div></div>
                <div className="ukr-tile"><div className="k">{U.isMM ? "RL (in)" : "RL (mm)"}</div><div className="v">{cfg.out.rlAlt}<i>{U.isMM ? "in" : "mm"}</i></div></div>
                <div className="ukr-tile"><div className="k">Tube Ø D</div><div className="v">{cfg.out.tubeD}<i>{U.isMM ? "mm" : "in"}</i></div></div>
                <div className="ukr-tile"><div className="k">Max load</div><div className="v">{cfg.out.maxLoad}<i>{U.isMM ? "kg" : "lbs"}</i></div></div>
                <div className="ukr-tile"><div className="k">Max speed</div><div className="v">{cfg.out.maxSpeed}<i>{U.isMM ? "m/min" : "fpm"}</i></div></div>
                {cfg.out.grv != null && <div className="ukr-tile"><div className="k">Groove X / Y</div><div className="v">{cfg.out.grv}<i>{U.isMM ? "mm" : "in"}</i></div></div>}
              </div>
              <div className="ukr-note">{cfg.notes.map(dash).join(" ")}{cfg.extra.length ? <> <b>{cfg.extra.map(dash).join(" · ")}</b></> : null}</div>
              <svg className="ukr-fig" viewBox="0 0 440 290" style={{ marginTop: 12 }} dangerouslySetInnerHTML={{ __html: svg }} role="img" aria-label="Roller in frame, section view" />
              <table className="ukr-sum">
                <thead><tr><th>Dimension</th><th>{U.isMM ? "mm" : "Inch"}</th><th>{U.isMM ? "Inch" : "mm"}</th><th>Note</th></tr></thead>
                <tbody>
                  {summaryRows(cfg).map((r, i) => (
                    r[2] === "-" && !r[3] && String(r[1]).length > 24
                      ? <tr key={i}><td>{r[0]}</td><td colSpan={3} className="wide">{dash(r[1])}</td></tr>
                      : <tr key={i} className={r[3] === TX.orderBy ? "key" : ""}><td>{r[0]}</td><td>{dash(r[1])}</td><td>{dash(r[2])}</td><td>{dash(r[3])}</td></tr>
                  ))}
                </tbody>
              </table>
              <div className="ukr-note mono" style={{ letterSpacing: ".08em" }}>SPECIFICATION AND LOAD RATING CONFIRMED BY UNIKING ON QUOTE.</div>
              <div className="ukr-actions ukr-noprint">
                <button className="ukr-btn primary" onClick={() => { addToRFQ(cfg); setAdded(true); }}>{added ? "✓ Added to RFQ" : "Add to RFQ cart"}</button>
                {added && <button className="ukr-btn ghost" onClick={onGoRFQ}>Open RFQ cart</button>}
                <button className="ukr-btn ghost" onClick={() => printSheet(cfg, svg)}>Tear sheet</button>
                <button className="ukr-btn ghost" onClick={() => emailSpec(cfg)}>Email</button>
              </div>
            </>
          ) : <div className="ukr-verdict warn">Pick a tube and bearing.</div>}
        </div>
      </div>
    </div>
  );
}

export default function RollerSection({ onBack, onGoRFQ: onGoRFQProp }) {
  useFonts();
  const onGoRFQ = onGoRFQProp || (() => window.location.assign("/RFQCart"));
  const [u, setU] = useState(() => { try { return localStorage.getItem(UNIT_KEY) === "mm" ? "mm" : "in"; } catch { return "in"; } });
  const [k, setK] = useState(null);
  useEffect(() => { try { localStorage.setItem(UNIT_KEY, u); } catch { /* ignore */ } }, [u]);
  useEffect(() => { window.scrollTo(0, 0); }, [k]);
  useEffect(() => { document.title = "Conveyor rollers | Uniking"; }, []);

  return (
    <div className="ukr-bg">
      <div className="ukr">
        <header className="ukr-hero">
          <div style={{ minWidth: 0 }}>
            <div className="eyebrow">Uniking Canada · Conveyor rollers</div>
            <h1>Rollers turn. Lines move.</h1>
            <div className="lead">Conveyor rollers and drive rollers - gravity, driven and specialty - for every conveying duty. Pick a series, then a tube, bearing and shaft: each list only offers what fits, straight from the catalogue. The tool returns the reference length to order by, the load rating at that length and a dimensioned schematic.</div>
          </div>
          <div className="ukr-seg" role="group" aria-label="Units">
            {[["in", "IN"], ["mm", "MM"]].map(([v, l]) => <button key={v} className={u === v ? "on" : ""} onClick={() => setU(v)}>{l}</button>)}
          </div>
        </header>
        <div className="ukr-callout">Uniking Canada roller configurator - {SERIES_ORDER.length} series · imperial dimensions · catalogue fit rules &amp; load ratings · Interroll conveyor roller catalogue, Uniking edition</div>

        {k ? <Configurator key={k} k={k} u={u} onBack={() => setK(null)} onGoRFQ={onGoRFQ} /> : <SeriesGrid u={u} onPick={setK} />}

        <div className="ukr-noprint" style={{ marginTop: 32 }}>
          <h3>Catalogs &amp; resources</h3>
          <ul className="ukr-docs">
            {ROLLER_DOCS.map((d) => (
              <li key={d.url}><a href={d.url} target="_blank" rel="noopener noreferrer"><span>{d.title}</span><span className="m">{d.meta} · PDF ↗</span></a></li>
            ))}
          </ul>
          {onBack && <div style={{ marginTop: 18 }}><button className="ukr-btn ghost" onClick={onBack}>← All products</button></div>}
        </div>
      </div>
    </div>
  );
}
