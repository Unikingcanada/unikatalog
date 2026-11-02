/** Chain home: lockup, search (designation + aliases + series + pitch), Identify / Configure, 31 group tiles. */
import { useMemo, useState } from "react";
import { getGroups, getChainIndex } from "@/lib/chainW58/chainRepo";
import { buildSearchIndex, searchChains } from "@/lib/chainW58/chainSearch";
import { tx, fmtIn } from "@/lib/chainW58/chainText";
import { Crumbs, Img, KMark, Loading, ErrorBox, thumbOf, useAsync } from "./ui";

export function ChainSearchBox({ index, go, group = null, placeholder }) {
  const [q, setQ] = useState("");
  const sIndex = useMemo(() => (index ? buildSearchIndex(index) : []), [index]);
  const results = useMemo(() => searchChains(sIndex, q, { limit: 12, group }), [sIndex, q, group]);
  const viaLabel = { designation: null, interchange: "Interchange match", pitch: "Pitch match", text: null };
  return (
    <div>
      <div className="ukc-search">
        <span className="icon">⌕</span>
        <input className="ukc-input" type="search" value={q} onChange={(e) => setQ(e.target.value)} autoComplete="off"
          placeholder={placeholder || "Chain no., old part no., series or pitch (WH78, 2.609, 66.27 mm)"} aria-label="Search chains" />
      </div>
      {q.trim() && (
        <div className="ukc-results" role="listbox">
          {results.length === 0 && <div className="muted small" style={{ padding: "12px 14px" }}>No chain matches "{q}". Try the pitch, or use Identify my chain.</div>}
          {results.map(({ chain, via }) => (
            <button key={chain.chain_id} className="ukc-result" onClick={() => go.chain(chain.chain_id, chain.catalog_group)} role="option">
              <Img src={thumbOf(chain.image_url)} photo fallback={<span style={{ width: 54 }} />} />
              <span style={{ flex: 1, minWidth: 0 }}>
                <span className="t" style={{ display: "block" }}>{tx(chain.chain_number)}</span>
                <span className="s" style={{ display: "block" }}>
                  {tx(chain.catalog_group)}{chain.pitch_in ? ` · ${fmtIn(chain.pitch_in)} in pitch` : ""}
                </span>
              </span>
              {viaLabel[via] && <span className="ukc-chip acc">{viaLabel[via]}</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ChainHome({ go }) {
  const groups = useAsync(() => getGroups(), []);
  const index = useAsync(() => getChainIndex(), []);
  const total = index.data?.length || 0;

  return (
    <div>
      <Crumbs items={[{ label: "All products", onClick: go.back }, { label: "Chain" }]} />
      <header className="ukc-hero">
        <KMark />
        <div style={{ minWidth: 0 }}>
          <div className="eyebrow">Uniking Canada · Chain</div>
          <h1>Engineered &amp; roller chain</h1>
          <div className="ukc-lockup"><span>Uniting the strongest</span><span className="o">links.</span></div>
          <div className="ukc-lockup-fr">Unir les maillons les plus forts</div>
        </div>
      </header>
      <p className="lead">
        One page per chain designation, with catalogue drawings, dimensions in inches and millimetres, and the attachments and materials on file.
        {total ? <> <span className="ukc-key">{total.toLocaleString("en-CA")}</span> chains in {groups.data?.length || 31} groups.</> : null}
      </p>

      {index.error ? <ErrorBox error={index.error} /> : <ChainSearchBox index={index.data} go={go} />}

      <div className="ukc-actions">
        <button className="ukc-action" onClick={go.identify}>
          <span className="ic">⟷</span>
          <span><span className="t" style={{ display: "block" }}>Identify my chain</span><span className="d">Measure pitch, inner width, roller and sidebar height</span></span>
        </button>
        <button className="ukc-action alt" onClick={go.rfq}>
          <span className="ic">✉</span>
          <span><span className="t" style={{ display: "block" }}>Request a quote</span><span className="d">Open your RFQ cart</span></span>
        </button>
      </div>

      <h3>Chain groups</h3>
      {groups.loading || index.loading ? <Loading label="Loading chain groups" /> : groups.error ? <ErrorBox error={groups.error} /> : (
        groups.data.length === 0 || total === 0 ? (
          <div className="ukc-empty">The chain catalogue is being updated. Please check back shortly, or send us your chain number through the RFQ cart.</div>
        ) : (
          <div className="ukc-grid">
            {groups.data.filter((g) => g.count > 0).map((g) => (
              <GroupTile key={g.catalog_group} g={g} index={index.data} onClick={() => go.group(g.catalog_group)} />
            ))}
          </div>
        )
      )}
    </div>
  );
}

function GroupTile({ g, index, onClick }) {
  // Representative photo: first chain in the group with a series-matched photo, else any photo.
  const img = useMemo(() => {
    const inG = index.filter((c) => c.catalog_group === g.catalog_group && c.image_url);
    return (inG[0] || {}).image_url || "";
  }, [g, index]);
  return (
    <button className="ukc-tile" onClick={onClick}>
      <div className="img"><Img src={thumbOf(img)} photo alt="" fallback={<span className="mono muted small">{tx(g.chain_family)}</span>} /></div>
      <div className="body">
        <span className="t">{tx(g.catalog_group)}</span>
        <span className="d">{tx(g.intro).slice(0, 140)}{(g.intro || "").length > 140 ? "…" : ""}</span>
        <span className="n">{g.count} chains →</span>
      </div>
    </button>
  );
}
