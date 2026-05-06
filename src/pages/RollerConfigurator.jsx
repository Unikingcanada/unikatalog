import { useEffect } from "react";

export default function RollerConfigurator() {
  useEffect(() => {
    window.location.replace("/Home?section=rollers");
  }, []);
  return null;
}