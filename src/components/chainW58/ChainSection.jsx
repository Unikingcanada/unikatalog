/**
 * ChainSection — the rebuilt chain catalogue (Version X master, W58), styled LA CHAÎNE.
 * Views: home (31 groups + search) → group → chain detail → configurator; plus "Identify my chain".
 * Entering from Home opens the chain home unless another page set an intent (group / chain).
 */
import { useEffect, useState } from "react";
import "./chain.css";
import { useBrandFonts, DuotoneDefs } from "./ui";
import ChainHome from "./ChainHome";
import ChainGroupPage from "./ChainGroupPage";
import ChainDetail from "./ChainDetail";
import IdentifyChain from "./IdentifyChain";
import ChainConfigurator from "./ChainConfigurator";
import { getChainSourceMode } from "@/lib/chainW58/chainRepo";

export const INTENT_KEY = "unk_chain_intent";


/** Other pages call this before opening the chain section to land on a group or chain. */
export function setChainIntent(intent) {
  try { sessionStorage.setItem(INTENT_KEY, JSON.stringify(intent || {})); } catch { /* ignore */ }
}
export function hasChainIntent() {
  try { return !!sessionStorage.getItem(INTENT_KEY); } catch { return false; }
}

export default function ChainSection({ onBack, onGoRFQ }) {
  useBrandFonts();
  const [nav, setNavState] = useState(() => {
    let intent = null;
    try { intent = JSON.parse(sessionStorage.getItem(INTENT_KEY) || "null"); } catch { /* ignore */ }
    if (intent && (intent.chainId || intent.group || intent.view)) {
      if (intent.chainId) return { view: intent.configure ? "configure" : "detail", chainId: intent.chainId, group: intent.group || null };
      if (intent.view) return { view: intent.view, group: intent.group || null };
      return { view: "group", group: intent.group };
    }
    return { view: "home" };
  });
  // Browser / phone Back steps through the chain section, then returns to Home.
  const setNav = (n) => {
    setNavState(n);
    try { window.history.pushState({ ...(window.history.state || {}), ukc: n }, ""); } catch { /* ignore */ }
    window.scrollTo(0, 0);
  };
  useEffect(() => {
    try { sessionStorage.removeItem(INTENT_KEY); } catch { /* ignore */ }
    try { window.history.pushState({ ...(window.history.state || {}), ukc: nav }, ""); } catch { /* ignore */ }
    const onPop = (e) => {
      if (e.state && e.state.ukc) { setNavState(e.state.ukc); window.scrollTo(0, 0); }
      else if (onBack) onBack();
    };
    window.addEventListener("popstate", onPop);
    document.title = "Chain | Uniking";
    return () => window.removeEventListener("popstate", onPop);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const go = {
    home: () => setNav({ view: "home" }),
    group: (group) => setNav({ view: "group", group }),
    chain: (chainId, group) => setNav({ view: "detail", chainId, group: group || nav.group || null }),
    configure: (chainId, group) => setNav({ view: "configure", chainId, group: group || nav.group || null }),
    identify: () => setNav({ view: "identify" }),
    back: onBack,
    rfq: onGoRFQ,
  };

  let body;
  if (nav.view === "group" && nav.group) body = <ChainGroupPage group={nav.group} go={go} />;
  else if (nav.view === "detail" && nav.chainId) body = <ChainDetail chainId={nav.chainId} fromGroup={nav.group} go={go} />;
  else if (nav.view === "configure" && nav.chainId) body = <ChainConfigurator chainId={nav.chainId} fromGroup={nav.group} go={go} />;
  else if (nav.view === "identify") body = <IdentifyChain go={go} />;
  else body = <ChainHome go={go} />;

  return (
    <div className="ukc-page-bg">
      <DuotoneDefs />
      <div className="ukc">
        {getChainSourceMode() === "static" && (
          <div className="ukc-empty small" style={{ marginBottom: 14 }}>
            Preview mode: reading the W58 package files directly, not Base44. <a href="?chainsrc=db">Switch to live data</a>
          </div>
        )}
        {body}
      </div>
    </div>
  );
}
