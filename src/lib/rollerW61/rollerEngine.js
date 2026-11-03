/**
 * rollerEngine.js — UniKatalog port of the unikingcanada.com roller configurator (r61).
 *
 * Data: R61.json is copied verbatim from the website (Interroll conveyor roller catalogue,
 * Uniking edition, imperial, pp. 7–48). Logic: every function below mirrors the website
 * function of the same name (tubesAvail, popTube, popBearing, popShaft, autoFit, loadCol,
 * loadAt, speedFor, calcConfig, buildSummary, specLines, drawSchematic), with the DOM
 * replaced by a plain state object, so both tools give the same answer for the same inputs.
 * Lengths are stored in inches (as the catalogue); `u` = "in" | "mm" only changes display.
 */
import R61 from "./R61.json";

export { R61 };
export const SERIES_ORDER = R61.order;
export const seriesOf = (key) => R61.series[key];

export const TX = {
  grp: "Bearing type", grpDrive: "Drive type",
  allMat: "All materials", noShaft: "No shaft listed for this bearing - confirmed by Uniking",
  ns: "non-standard", grvVar: "variable", grvStd: "standard location",
  ok: "VALID - ORDER BY RL ", bfSmall: "BF TOO SMALL",
  belowMin: "BELOW MINIMUM ROLLER LENGTH", overMax: "LENGTH OUT OF RANGE", shaftRange: "SHAFT NOT LISTED FOR THIS LENGTH",
  noShaftV: "SHAFT TO BE CONFIRMED", beyond: "BEYOND THE LOAD TABLE", notRated: "NOT RATED AT THIS LENGTH",
  checkGrv: "CHECK GROOVE POSITION", nsV: "NON-STANDARD PART", notInTable: "NOT IN THE LOAD TABLE",
  pp: "pp.", loadAt: "at table RL", noTable: "no load-table column for this combination",
  rlRow: "RL - Reference Length", bfRow: "BF - Between Frame", dRow: "D - Tube Diameter", wRow: "W - Wall Thickness",
  aRow: "A - Shaft", bRow: "B - Shaft Extension", brgRow: "Bearing", tubeRow: "Tube", shaftRow: "Shaft",
  minRow: "Minimum roller length (RL)", loadRow: "Max load at this RL", spdRow: "Max speed", ruleRow: "RL rule", pagesRow: "Catalogue pages",
  orderBy: "Order by this", lane: "Lane width", grvX: "Groove X - end to 1st", grvY: "Groove Y - 1st to 2nd",
  grvT: "Grooves", grooves: "groove(s)", none: "None", std: "standard",
  inc: "code printed incomplete in the catalogue", nsNote: "Non-standard part - availability confirmed by Uniking.",
};

// ── units (website: f, mmN, kgN, mpm, Lx, Lv, Lo, LB, LD, LDo, SP, SPo, Ax, Ao, dimTxt, txt) ──
const f = (x, d = 2) => (+x).toFixed(d);
export const mmN = (x) => { const v = (+x) * 25.4; return Math.abs(v) < 10 ? v.toFixed(2) : v.toFixed(1); };
export const kgN = (lb) => { const v = (+lb) * 0.45359237; return v >= 100 ? v.toFixed(0) : v.toFixed(1); };
export const mpm = (fpm) => { const v = (+fpm) * 0.3048; return v < 10 ? v.toFixed(2) : v.toFixed(1); };
export function units(u) {
  const isMM = u === "mm";
  const U = {
    isMM,
    Lx: (x, d) => (isMM ? mmN(x) + " mm" : f(x, d === undefined ? 2 : d) + '"'),
    Lv: (x, d) => (isMM ? mmN(x) : f(x, d === undefined ? 2 : d)),
    Lo: (x, d) => (isMM ? f(x, d === undefined ? 2 : d) + '"' : mmN(x) + " mm"),
    LD: (lb) => (isMM ? kgN(lb) + " kg" : lb + " lbs"),
    LDo: (lb) => (isMM ? lb + " lbs" : kgN(lb) + " kg"),
    SP: (v) => (isMM ? mpm(v) + " m/min" : v + " fpm"),
    SPo: (v) => (isMM ? v + " fpm" : mpm(v) + " m/min"),
    fv: (x, d) => (isMM ? mmN(x) : f(x, d)),
    Ax: (a) => {
      if (!isMM || typeof a !== "string" || /mm/i.test(a)) return a;
      const m = a.match(/^\s*(\d*\.\d+|\d+)(.*)$/); return m ? mmN(+m[1]) + " mm" + m[2] : a;
    },
    Ao: (a) => {
      if (typeof a !== "string") return "-";
      if (isMM) return a.replace(/^\s*(\d*\.\d+|\d+)/, '$1"');
      if (/mm/i.test(a)) return "-";
      const m = a.match(/^\s*(\d*\.\d+|\d+)(.*)$/); return m ? mmN(+m[1]) + " mm" + m[2] : "-";
    },
    mmS: (w) => (typeof w === "number" ? mmN(w) : String(w).replace(/\d*\.?\d+/g, (v) => mmN(+v))) + " mm",
    dimTxt: (v) => {
      if (v == null) return "-";
      const s = String(v);
      if (/mm/.test(s)) return s.replace(/(\d)(mm)/, "$1 mm");
      return isMM ? U.mmS(+s) : s + '"';
    },
    txt: (s, br) => {
      if (!isMM || typeof s !== "string") return s;
      return s.replace(/(\d*\.?\d+)" per inch/g, (_, v) => mmN(+v) + " mm per 25.4 mm" + (br ? ' (' + v + '" per inch)' : ""))
        .replace(/(\d*\.?\d+)"/g, (_, v) => mmN(+v) + " mm" + (br ? ' (' + v + '")' : ""))
        .replace(/(\d{1,3}(?:,\d{3})+|\d+(?:\.\d+)?) lbs\b/g, (_, v) => kgN(+v.replace(/,/g, "")) + " kg");
    },
  };
  U.LB = (x, d) => U.Lx(x, d) + " (" + U.Lo(x, d) + ")";
  return U;
}

const bA = (b) => (b.A === "***" ? ".312 dia / .312 hex / .375 hex" : b.A);
const uniq = (a) => { const o = []; a.forEach((x) => { if (x && !o.some((y) => y.toLowerCase() === String(x).toLowerCase())) o.push(x); }); return o; };

// ── option lists (website: groups, inGroup, tubesAvail, popMat, popTube, popBearing, popShaft) ──
export function groups(s) { const g = []; s.bearings.forEach((b) => { const k = b.g || ""; if (k && g.indexOf(k) < 0) g.push(k); }); return g; }
export function inGroup(s, grp) { const gs = groups(s); const out = []; s.bearings.forEach((b, i) => { if (gs.length < 2 || (b.g || "") === grp) out.push(i); }); return out; }
export function tubesAvail(s, grp) {
  const seen = {}, out = [];
  inGroup(s, grp).forEach((bi) => (s.bearings[bi].T || []).forEach((ti) => { if (!seen[ti]) { seen[ti] = 1; out.push(ti); } }));
  return out.sort((a, b) => a - b);
}
export function materials(s, grp) {
  const mats = [], cnt = {};
  tubesAvail(s, grp).forEach((ti) => { const m = s.tubes[ti].mat; if (mats.indexOf(m) < 0) mats.push(m); cnt[m] = (cnt[m] || 0) + 1; });
  return { mats, cnt, total: tubesAvail(s, grp).length };
}
export const tubeList = (s, grp, mat) => tubesAvail(s, grp).filter((ti) => mat === "all" || s.tubes[ti].mat === mat);
export const bearingList = (s, grp, ti) => inGroup(s, grp).filter((bi) => (s.bearings[bi].T || []).indexOf(ti) >= 0);
export const shaftList = (s, bi) => { const b = s.bearings[bi]; return (b && b.S) || []; };

/** Re-run the website's populate cascade, keeping previous picks that are still valid. */
export function cascade(s, prev = {}, from = "grp") {
  const st = { ...prev };
  const order = ["grp", "mat", "tube", "bearing", "shaft"];
  const start = order.indexOf(from);
  if (start <= 0) { const gs = groups(s); st.grp = gs.indexOf(prev.grp) >= 0 ? prev.grp : gs[0] || ""; }
  if (start <= 1) { const { mats } = materials(s, st.grp); st.mat = prev.mat && (prev.mat === "all" || mats.indexOf(prev.mat) >= 0) ? prev.mat : "all"; }
  if (start <= 2) {
    const list = tubeList(s, st.grp, st.mat);
    if (prev.ti != null && list.indexOf(prev.ti) >= 0) st.ti = prev.ti;
    else { const plain = list.filter((ti) => { const t = s.tubes[ti]; return !t.rem && !t.ns && !t.type; })[0]; st.ti = plain != null ? plain : list[0]; }
  }
  if (start <= 3) { const list = bearingList(s, st.grp, st.ti); st.bi = prev.bi != null && list.indexOf(prev.bi) >= 0 ? prev.bi : list[0]; }
  { const list = shaftList(s, st.bi); st.si = prev.si != null && list.indexOf(prev.si) >= 0 ? prev.si : list.length ? list[0] : null; }
  return st;
}

const fits = (o, RL) => !o || ((o.rlMin == null || RL >= o.rlMin - 1e-9) && (o.rlMax == null || RL <= o.rlMax + 1e-9));

/** website autoFit: tapered tubes / length-limited shafts jump to the first option that fits RL. */
export function autoFit(s, st, BF) {
  const RL = BF - (s.rlDed || 0);
  let out = st;
  const t = s.tubes[st.ti];
  if (t && t.rlMin != null && !fits(t, RL)) {
    const o = tubeList(s, st.grp, st.mat).filter((ti) => fits(s.tubes[ti], RL))[0];
    if (o != null) out = cascade(s, { ...out, ti: o }, "bearing");
  }
  const sh = out.si == null ? null : s.shafts[out.si];
  if (sh && !fits(sh, RL)) {
    const o2 = shaftList(s, out.bi).filter((si) => fits(s.shafts[si], RL))[0];
    if (o2 != null) out = { ...out, si: o2 };
  }
  return out;
}

function grooveSpec(s, t) { if (!t || !t.gv) return null; return { n: t.gv, kind: t.gk, rule: s.grv || null }; }

function loadCol(s, key, b, t, sh) {
  const sk = sh && sh.ak, tsp = t.spk || b.spk;
  for (let ti = 0; ti < s.loads.length; ti++) {
    const L = s.loads[ti];
    if (L.bt && (key === "1700" || key === "3800") && L.bt !== b.bt) continue;
    for (let ci = 0; ci < L.cols.length; ci++) {
      const c = L.cols[ci];
      if (c.D && c.D.indexOf(t.dk) < 0) continue;
      if (c.m && c.m.indexOf(t.mk) < 0) continue;
      if (c.sz) {
        if (!sk || typeof sk[0] !== "number" || c.sz.indexOf(Math.round(sk[0] * 1000) / 1000) < 0) continue;
        if (c.shp && c.shp !== sk[1]) continue;
      }
      if (c.spk) {
        if (!tsp) continue;
        if (c.spk[1] !== tsp[1] || c.spk[2] !== tsp[2]) continue;
        if (c.spk[0] != null && tsp[0] != null && c.spk[0] !== tsp[0]) continue;
      }
      if (key === "1300" && c.bt) {
        if (b.bt === "stainless" && c.bt !== "stainless") continue;
        if (b.bt !== "stainless" && c.bt === "stainless") continue;
      }
      return [ti, ci];
    }
  }
  return null;
}
function loadAt(s, lc, RL) {
  if (!lc) return null;
  const L = s.loads[lc[0]];
  for (let i = 0; i < L.rl.length; i++) if (L.rl[i] >= RL - 1e-9) return { v: L.v[i][lc[1]], row: L.rl[i], L, c: L.cols[lc[1]] };
  return { beyond: true, row: L.rl[L.rl.length - 1], L, c: L.cols[lc[1]] };
}
function speedFor(s, b) {
  const sp = s.speeds || [];
  if (!sp.length) return null;
  if (sp.length === 1) return sp[0];
  const bt = b.bt || "";
  for (let i = 0; i < sp.length; i++) {
    const t = (sp[i].t || "").toLowerCase();
    if ((bt === "stainless" && t.indexOf("stainless") >= 0) || (bt === "precision" && t.indexOf("precision") >= 0) || (bt === "commercial" && t.indexOf("commercial") >= 0)) return sp[i];
  }
  return sp[0];
}

export const bLabel = (U, b) => b.pn + " - shaft " + U.Ax(bA(b)) + " - " + (b.rem || ((b.mat || "") + " " + (b.fin || ""))) + (b.fin && /^\d{4}/.test(b.fin) ? " " + b.fin : "") + (b.ns ? " · " + TX.ns : "");
export const tLabel = (U, t) => U.dimTxt(t.D) + (t.W ? " × " + U.dimTxt(t.W) : "") + " - " + t.mat + (t.fin && t.fin !== "None" ? " " + t.fin : "") + (t.rem ? " - " + t.rem : "") + (t.type ? " - " + t.type : "") + " (" + t.pnx + ")" + (t.ns ? " · " + TX.ns : "");
export const shLabel = (U, sh) => U.Ax(sh.A) + " - " + (sh.rem || sh.type || "") + (sh.type && sh.rem ? " · " + sh.type : "") + " - " + sh.mat + " (" + sh.pn + ")" + (sh.ns ? " · " + TX.ns : "");

/**
 * website calcConfig. st = {grp, mat, ti, bi, si}; BF, grvX, grvY in inches; u = "in" | "mm".
 * Returns everything the website writes to the page (verdict, outputs, notes, summary rows).
 */
export function calcConfig(key, st, BF, grvX0, grvY0, u) {
  const s = R61.series[key], U = units(u);
  const t = s.tubes[st.ti], b = s.bearings[st.bi], sh = st.si == null ? null : s.shafts[st.si];
  if (!t || !b) return null;
  const RL = Math.round((BF - (s.rlDed || 0)) * 1000) / 1000;
  const D = t.Dn || b.Dn || 0, W = t.Wn || 0, B = sh && sh.Bn != null ? sh.Bn : 0;
  const bad = [], warn = [];
  // grooves come with the tube part
  const gs = grooveSpec(s, t);
  let grvX = 0, grvY = 0, grvRule = "";
  if (gs) {
    const g = gs.rule, dk = t.D;
    if (gs.kind === "standard") {
      if (g && g.std) { grvX = g.std.x; grvY = gs.n > 1 ? g.std.y : 0; grvRule = TX.grvStd + ": x = " + U.Lx(g.std.x) + ", y = " + U.Lx(g.std.y) + " (" + TX.pp + g.p + ")"; }
    } else {
      grvX = grvX0; grvY = gs.n > 1 ? grvY0 : 0;
      if (g && g.x[dk] != null) {
        grvRule = "X ≥ " + U.Lx(g.x[dk]) + (gs.n > 1 ? ", Y ≥ " + U.Lx(g.y) : "") + " · " + g.maxText.replace(/4\.50"/, U.Lx(4.5)) + " (" + TX.pp + g.p + ")";
        if (grvX < g.x[dk]) warn.push(TX.checkGrv + ": X " + U.Lx(grvX) + " < " + U.Lx(g.x[dk]) + " min");
        if (gs.n > 1 && grvY < g.y) warn.push(TX.checkGrv + ": Y " + U.Lx(grvY) + " < " + U.Lx(g.y) + " min");
        const cap = g.max && g.max[t.mk];
        if (cap && grvX + grvY > cap) warn.push(TX.checkGrv + ": X + Y " + U.Lx(grvX + grvY) + " > " + U.Lx(cap) + " max (" + t.mat + ")");
      } else grvRule = "No published groove minimums for this diameter - location confirmed by Uniking.";
      if (RL > 0 && grvX + grvY > RL / 2) warn.push(TX.checkGrv + ": grooves past the roller midpoint");
    }
  }
  // length checks
  const ml = s.minLen[st.ti + "|" + (sh ? +st.si : "")] ?? null;
  if (RL <= 0 || BF < 1) bad.push(TX.bfSmall);
  else if (ml != null && RL < ml - 1e-9) bad.push(TX.belowMin + " " + U.Lx(ml));
  if (t.maxRL && RL > t.maxRL + 1e-9) bad.push(TX.overMax + " - " + t.pnx + " max " + U.Lx(t.maxRL));
  if (t.rlMin != null && (RL < t.rlMin - 1e-9 || RL > t.rlMax + 1e-9)) bad.push(TX.overMax + " - " + t.pnx + " RL " + U.Lx(t.rlMin) + "–" + U.Lx(t.rlMax));
  if (sh && ((sh.rlMin != null && RL < sh.rlMin - 1e-9) || (sh.rlMax != null && RL > sh.rlMax + 1e-9))) bad.push(TX.shaftRange + " - " + sh.pn + ": " + sh.rem);
  if (!sh) warn.push(TX.noShaftV);
  // load from the series table
  const lc = loadCol(s, key, b, t, sh), la = loadAt(s, lc, RL);
  let loadTxt = "-", loadNote = TX.noTable;
  if (!la) warn.push(TX.notInTable);
  if (la) {
    if (la.beyond) { warn.push(TX.beyond + " (" + U.Lx(la.row) + " max)"); loadNote = la.L.t + " · " + TX.pp + la.L.p; }
    else if (la.v == null) { warn.push(TX.notRated); loadNote = la.L.t + " · RL " + U.Lx(la.row) + " · " + TX.pp + la.L.p; }
    else { loadTxt = la.v; loadNote = la.c.lab + " · " + TX.loadAt + " " + U.Lx(la.row) + " · " + TX.pp + la.L.p; }
  }
  const sp = speedFor(s, b);
  if (b.ns || t.ns || (sh && sh.ns)) warn.push(TX.nsV);
  if (t.pnNote) warn.push(t.pnx + ": " + TX.inc);
  const verdict = bad.length ? { kind: "bad", text: bad[0] }
    : warn.length ? { kind: "warn", text: warn[0] + " - RL " + U.LB(RL) }
    : { kind: "ok", text: TX.ok + U.LB(RL) };
  const notes = [U.txt(s.rlText, 1)];
  if (ml != null) notes.push(TX.minRow + ": " + U.Lx(ml) + ".");
  if (sp && sp.note) notes.push(TX.spdRow + ": " + U.SP(sp.fpm) + " - " + sp.note + ".");
  if (key === "3800") notes.push("60 fpm continuous slippage · 90 fpm intermittent slippage (p. 44).");
  if (b.ns || t.ns || (sh && sh.ns)) notes.push(TX.nsNote);
  const extra = bad.slice(1).concat(warn.slice(bad.length ? 0 : 1));
  return {
    key, series: s, bearing: b, tube: t, shaft: sh, BF, RL, D, W, B,
    grooves: gs ? gs.n : 0, grvKind: gs ? gs.kind : null, grvX, grvY, grvRule,
    minLen: ml, load: la, loadTxt, loadNote, speed: sp, bad, warn, verdict, notes, extra, units: u,
    out: {
      rl: U.Lv(RL), bf: U.Lv(BF), rlAlt: U.isMM ? f(RL, 2) : mmN(RL), tubeD: U.Lv(D, 3),
      maxLoad: loadTxt === "-" ? "-" : U.isMM ? kgN(loadTxt) : String(loadTxt),
      maxSpeed: sp ? (U.isMM ? mpm(sp.fpm) : String(sp.fpm)) : "-",
      grv: gs ? (gs.n > 1 ? U.Lv(grvX) + " / " + U.Lv(grvY) : U.Lv(grvX)) : null,
    },
  };
}

/** website buildSummary rows: [label, value, other-unit value, note] */
export function summaryRows(c) {
  const U = units(c.units), b = c.bearing, t = c.tube, sh = c.shaft, s = c.series;
  const rows = [
    [TX.rlRow, U.Lx(c.RL), U.Lo(c.RL), TX.orderBy],
    [TX.bfRow, U.Lx(c.BF), U.Lo(c.BF), TX.lane],
    [TX.dRow, U.dimTxt(t.D), t.Dn ? U.Lo(t.Dn, 3) : "-", t.mat + (t.fin && t.fin !== "None" ? " " + t.fin : "")],
    [TX.wRow, t.W ? U.dimTxt(t.W) : "-", t.Wn ? U.Lo(t.Wn, 3) : "-", ""],
    [TX.aRow, U.Ax(sh ? sh.A : bA(b)), U.Ao(sh ? sh.A : bA(b)), sh ? sh.rem || sh.type || "" : TX.noShaft],
    [TX.bRow, sh && sh.B != null ? U.Lx(c.B) : "-", sh && sh.B != null ? U.Lo(c.B) : "-", ""],
    [TX.brgRow, b.pn, "-", uniq([b.g, b.rem, b.mat, b.fin]).join(" · ")],
    [TX.tubeRow, t.pnx, "-", [t.mat, t.fin !== "None" ? t.fin : "", t.rem, t.type].filter(Boolean).join(" · ") + (t.pnNote ? " - " + TX.inc : "")],
    [TX.shaftRow, sh ? sh.pn : "-", "-", sh ? [sh.mat, sh.rem, sh.type].filter(Boolean).join(" · ") : TX.noShaft],
    [TX.minRow, c.minLen != null ? U.Lx(c.minLen) : "-", c.minLen != null ? U.Lo(c.minLen) : "-", ""],
    [TX.loadRow, c.loadTxt === "-" ? "-" : U.LD(c.loadTxt), c.loadTxt === "-" ? "-" : U.LDo(c.loadTxt), c.loadNote],
    [TX.spdRow, c.speed ? U.SP(c.speed.fpm) : "-", c.speed ? U.SPo(c.speed.fpm) : "-", c.speed && c.speed.note ? c.speed.note : ""],
    [TX.ruleRow, U.txt(s.rlText, 1), "-", ""],
    [TX.pagesRow, TX.pp + " " + s.pp, "-", ""],
  ];
  if (c.grooves > 0) {
    rows.splice(6, 0, [TX.grvX, U.Lx(c.grvX), U.Lo(c.grvX), c.grvKind === "standard" ? TX.grvStd : TX.grvVar]);
    if (c.grooves > 1) rows.splice(7, 0, [TX.grvY, U.Lx(c.grvY), U.Lo(c.grvY), ""]);
  }
  return rows;
}

/** website specLines: the text that goes to the RFQ / email / tear sheet. */
export function specLines(c) {
  const U = units(c.units), b = c.bearing, t = c.tube, sh = c.shaft, s = c.series;
  return [
    ["Series", s.name],
    [TX.brgRow, b.pn + " - " + uniq([b.g, b.rem, b.mat, b.fin]).join(" · ")],
    [TX.tubeRow, t.pnx + " - " + U.dimTxt(t.D) + (t.W ? " × " + U.dimTxt(t.W) : "") + " " + t.mat + (t.fin && t.fin !== "None" ? " " + t.fin : "") + (t.rem ? " - " + t.rem : "")],
    [TX.shaftRow, sh ? sh.pn + " - " + U.Ax(sh.A) + " " + sh.mat + " - " + (sh.rem || sh.type || "") : TX.noShaft],
    [TX.grvT, c.grooves ? c.grooves + " " + TX.grooves + " (" + (c.grvKind === "standard" ? TX.std : TX.grvVar) + "): X " + U.LB(c.grvX) + (c.grooves > 1 ? ", Y " + U.LB(c.grvY) : "") : TX.none],
    [TX.bfRow, U.LB(c.BF)],
    [TX.rlRow, U.LB(c.RL)],
    [TX.ruleRow, U.txt(s.rlText, 1)],
    [TX.minRow, c.minLen != null ? U.LB(c.minLen) : "-"],
    [TX.loadRow, (c.loadTxt === "-" ? "-" : U.LD(c.loadTxt) + " (" + U.LDo(c.loadTxt) + ")") + " - " + c.loadNote],
    [TX.spdRow, c.speed ? U.SP(c.speed.fpm) + " (" + U.SPo(c.speed.fpm) + ")" + (c.speed.note ? " - " + c.speed.note : "") : "-"],
    [TX.pagesRow, TX.pp + " " + s.pp],
  ];
}

const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m]));
const arw = (x, y, dx, dy) => {
  const m = Math.hypot(dx, dy) || 1, ux = dx / m, uy = dy / m, px = -uy, py = ux;
  return "M " + (x - ux * 7 + px * 3.4) + " " + (y - uy * 7 + py * 3.4) + " L " + x + " " + y + " L " + (x - ux * 7 - px * 3.4) + " " + (y - uy * 7 - py * 3.4);
};

/** website drawSchematic → inner SVG markup for viewBox "0 0 440 290". */
export function schematicSVG(c) {
  const U = units(c.units), b = c.bearing, t = c.tube, sh = c.shaft, BF = c.BF, RL = c.RL, D = c.D, B = c.B;
  let g = "";
  const y = 120, half = Math.max(8, Math.min(32, D * 6));
  const x0 = 60, x1 = 380, span = x1 - x0;
  const rlp = span * (Math.max(RL, 0) / Math.max(BF, 1));
  const rlx0 = x0 + (span - rlp) / 2, rlx1 = rlx0 + rlp;
  g += '<text class="pane" x="12" y="16">ROLLER IN FRAME - SECTION VIEW</text>';
  g += '<path class="objl" d="M ' + (x0 - 18) + " " + (y - 50) + ' h 18 v 100 h -18 Z"/>';
  g += '<path class="objl" d="M ' + x1 + " " + (y - 50) + ' h 18 v 100 h -18 Z"/>';
  g += '<path class="ln" d="M ' + (x0 - 28) + " " + y + " H " + (x1 + 28) + '"/>';
  if (t.sl) { const sh2 = half + 4; g += '<path class="obj sleeve" d="M ' + rlx0 + " " + (y - sh2) + " h " + rlp + " v " + 2 * sh2 + " h -" + rlp + ' Z"/>'; }
  if (t.rlMin != null) g += '<path class="obj" d="M ' + rlx0 + " " + (y - half * 0.8) + " L " + rlx1 + " " + (y - half) + " V " + (y + half) + " L " + rlx0 + " " + (y + half * 0.8) + ' Z"/>';
  else g += '<path class="obj" d="M ' + rlx0 + " " + (y - half) + " h " + rlp + " v " + 2 * half + " h -" + rlp + ' Z"/>';
  g += '<path class="objl" d="M ' + rlx0 + " " + (y - half * 0.65) + " h 10 v " + 1.3 * half + ' h -10 Z"/>';
  g += '<path class="objl" d="M ' + (rlx1 - 10) + " " + (y - half * 0.65) + " h 10 v " + 1.3 * half + ' h -10 Z"/>';
  if (c.grooves > 0 && RL > 0) {
    const px = rlp / RL, gx1 = rlx1 - c.grvX * px, gx2 = rlx1 - (c.grvX + c.grvY) * px;
    g += '<path class="dim" style="stroke-width:1.8" d="M ' + gx1 + " " + (y - half) + " V " + (y + half) + '"/>';
    if (c.grooves > 1) g += '<path class="dim" style="stroke-width:1.8" d="M ' + gx2 + " " + (y - half) + " V " + (y + half) + '"/>';
    const gy = y - half - 16;
    g += '<path class="dim" d="M ' + gx1 + " " + gy + " H " + rlx1 + '"/><path class="dim" d="' + arw(gx1, gy, -1, 0) + '"/><path class="dim" d="' + arw(rlx1, gy, 1, 0) + '"/>';
    g += '<text class="dtx" text-anchor="end" x="' + (rlx1 - 3) + '" y="' + (gy - 5) + '">X ' + esc(U.Lx(c.grvX)) + "</text>";
    if (c.grooves > 1) {
      const gy2 = gy - 22;
      g += '<path class="dim" d="M ' + gx2 + " " + gy2 + " H " + gx1 + '"/><path class="dim" d="' + arw(gx2, gy2, -1, 0) + '"/><path class="dim" d="' + arw(gx1, gy2, 1, 0) + '"/>';
      g += '<text class="dtx" text-anchor="middle" x="' + (gx2 + gx1) / 2 + '" y="' + (gy2 - 5) + '">Y ' + esc(U.Lx(c.grvY)) + "</text>";
    }
  }
  const d1 = y + half + 24;
  g += '<path class="dim" d="M ' + rlx0 + " " + d1 + " H " + rlx1 + '"/><path class="dim" d="' + arw(rlx0, d1, -1, 0) + '"/><path class="dim" d="' + arw(rlx1, d1, 1, 0) + '"/>';
  const d2 = d1 + 24;
  g += '<path class="dim" d="M ' + x0 + " " + d2 + " H " + x1 + '"/><path class="dim" d="' + arw(x0, d2, -1, 0) + '"/><path class="dim" d="' + arw(x1, d2, 1, 0) + '"/>';
  const bx = x1 + 28, by2 = y + 30;
  g += '<path class="dim" d="M ' + x1 + " " + by2 + " H " + bx + '"/><path class="dim" d="' + arw(x1, by2, -1, 0) + '"/><path class="dim" d="' + arw(bx, by2, 1, 0) + '"/>';
  const dx = rlx1 + 20;
  g += '<path class="dim" d="M ' + dx + " " + (y - half) + " V " + (y + half) + '"/><path class="dim" d="' + arw(dx, y - half, 0, -1) + '"/><path class="dim" d="' + arw(dx, y + half, 0, 1) + '"/>';
  const ex = x0 - 28, aT = sh ? sh.A : bA(b);
  g += '<path class="lead" d="M ' + (ex + 3) + " " + (y - 53) + " V " + (y - 3) + '"/><text class="dtx" x="' + ex + '" y="' + (y - 56) + '">A: ' + esc(U.Ax(aT)) + "</text>";
  g += '<path class="dim" style="stroke-width:.5;opacity:.4" d="M ' + rlx0 + " " + (y + half) + " V " + d1 + " M " + rlx1 + " " + (y + half) + " V " + d1 + " M " + x0 + " " + (y + 50) + " V " + d2 + " M " + x1 + " " + (y + 50) + " V " + d2 + '"/>';
  g += '<text class="dtx" x="' + (rlx0 + rlx1) / 2 + '" y="' + (d1 - 5) + '" text-anchor="middle">RL - REFERENCE LENGTH</text>';
  g += '<text class="val" x="' + (rlx0 + rlx1) / 2 + '" y="' + (d1 + 12) + '" text-anchor="middle">' + esc(U.LB(RL)) + "</text>";
  g += '<text class="dtx" x="' + (x0 + x1) / 2 + '" y="' + (d2 - 5) + '" text-anchor="middle">BF - BETWEEN FRAME</text>';
  g += '<text class="val" x="' + (x0 + x1) / 2 + '" y="' + (d2 + 12) + '" text-anchor="middle">' + esc(U.LB(BF)) + "</text>";
  g += '<text class="dtx" x="' + (x1 + bx) / 2 + '" y="' + (by2 - 5) + '" text-anchor="middle">B</text>';
  g += '<text class="val" x="' + (x1 + bx) / 2 + '" y="' + (by2 + 12) + '" text-anchor="middle">' + (sh && sh.B != null ? U.fv(B, 2) : "-") + "</text>";
  g += '<text class="dtx" x="' + (dx + 4) + '" y="' + (y + 3) + '">D</text>';
  g += '<text class="val" x="' + (dx + 4) + '" y="' + (y + 16) + '">' + (D ? U.fv(D, 3) : "-") + "</text>";
  g += '<text class="note" x="12" y="' + (d2 + 32) + '">' + esc(U.txt(c.series.rlText, 1)) + "</text>";
  g += '<text class="note" x="12" y="' + (d2 + 44) + '">' + esc(c.series.name.replace(/ — .*$/, "")) + "  ·  " + esc(t.mat) + (t.W ? " W " + esc(U.dimTxt(t.W)) : "") + "  ·  A " + esc(U.Ax(aT)) + "</text>";
  return g;
}

/** Website roller documents (served from unikingcanada.com). */
export const ROLLER_DOCS = [
  ["Conveyor Rollers & Drive Rollers - Catalogue", "catalogs/uniking-rollers-catalogue.pdf", "31 pages · 1.4 MB"],
  ["UNIK-RO-ID-001 Conveyor Roller Identification Guide", "resources/unik-ro-id-001-conveyor-roller-identification-guide.pdf", "Identification & Reference"],
  ["UNIK-RO-OF-001 Conveyor Roller Request Form", "resources/unik-ro-of-001-conveyor-roller-request-form.pdf", "Order & Enquiry Forms"],
  ["UNIK-RO-TD-001 Roller Antistatic Element", "resources/unik-ro-td-001-roller-antistatic-element.pdf", "Technical Data & Specs"],
  ["UNIK-RO-TD-002 Roller Flanges", "resources/unik-ro-td-002-roller-flanges.pdf", "Technical Data & Specs"],
  ["UNIK-RO-TD-003 Roller Lagging", "resources/unik-ro-td-003-roller-lagging.pdf", "Technical Data & Specs"],
  ["UNIK-RO-TD-004 Roller Lengths", "resources/unik-ro-td-004-roller-lengths.pdf", "Technical Data & Specs"],
  ["UNIK-RO-TD-005 Roller Noise Reduction Tubes", "resources/unik-ro-td-005-roller-noise-reduction-tubes.pdf", "Technical Data & Specs"],
  ["UNIK-RO-TD-006 Roller PU Sleeve", "resources/unik-ro-td-006-roller-pu-sleeve.pdf", "Technical Data & Specs"],
  ["UNIK-RO-TD-007 Roller Shafts - Technical Information", "resources/unik-ro-td-007-roller-shafts-technical-information.pdf", "Technical Data & Specs"],
  ["UNIK-RO-TD-008 Roller Tubes - Technical Information", "resources/unik-ro-td-008-roller-tubes-technical-information.pdf", "Technical Data & Specs"],
].map(([title, path, meta]) => ({ title, url: "https://unikingcanada.com/" + path, meta }));
