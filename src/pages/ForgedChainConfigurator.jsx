// ForgedChainConfigurator — redirects to the main ForgedChain view via Home
import { useEffect } from "react";
export default function ForgedChainConfigurator() {
  useEffect(() => { window.location.replace("/Home"); }, []);
  return null;
}