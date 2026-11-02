/** Old chain URLs (/ForgedChain, /ForgedChainConfigurator, /Chains) land in the rebuilt chain section. */
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { setChainIntent } from "./ChainSection";

export default function ChainSectionRedirect({ group = null }) {
  const navigate = useNavigate();
  useEffect(() => {
    setChainIntent(group ? { group } : { view: "home" });
    navigate("/Home", { replace: true });
  }, [group, navigate]);
  return null;
}
