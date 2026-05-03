// Redirects to the unified Home app
import { useEffect } from "react";
import { createPageUrl } from "@/utils";
export default function ForgedChain() {
  useEffect(() => { window.location.replace(createPageUrl("Home")); }, []);
  return null;
}
