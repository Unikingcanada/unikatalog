// Redirects to the unified Home app
import { useEffect } from "react";
import { createPageUrl } from "@/utils";
export default function RollerConfigurator() {
  useEffect(() => { window.location.replace(createPageUrl("Home")); }, []);
  return null;
}
