// Redirects to the current ForgedChain page
import { useEffect } from "react";
export default function ForgedChainConfigurator() {
  useEffect(() => { window.location.replace("/ForgedChain"); }, []);
  return null;
}
