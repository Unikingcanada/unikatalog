import ElevBucketsView from "@/components/elevatorBuckets/ElevBucketsView";
import AppLayout from "@/components/layout/AppLayout";
import { useEffect } from "react";

export default function ElevatorBuckets() {
  function goHome() { window.location.href = "/Home"; }
  function goRFQ() { window.location.href = "/RFQCart"; }
  return (
    <AppLayout onBack={goHome}>
      <ElevBucketsView onBack={goHome} onGoRFQ={goRFQ} />
    </AppLayout>
  );
}