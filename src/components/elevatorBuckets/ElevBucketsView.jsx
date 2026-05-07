/**
 * ElevBucketsView — Elevator Buckets & Accessories main orchestrator
 * Sections: Buckets (supplier → style → detail) | Belts | Hardware | Splices
 */
import { useState, useEffect } from "react";
import { ElevatorBucket } from "@/api/entities";

import ElevSectionNav from "./ElevSectionNav";
import ElevSupplierGrid from "./ElevSupplierGrid";
import BucketStyleGrid from "./BucketStyleGrid";
import BucketStyleDetail from "./BucketStyleDetail";
import ElevBeltsView from "./ElevBeltsView";
import ElevHardwareView from "./ElevHardwareView";
import ElevSplicesView from "./ElevSplicesView";

export default function ElevBucketsView({ onBack, onGoRFQ }) {
  const [buckets, setBuckets] = useState([]);
  const [loading, setLoading] = useState(true);

  // Navigation state
  const [section, setSection] = useState(null);        // null | "buckets" | "belts" | "hardware" | "splices"
  const [supplier, setSupplier] = useState(null);      // "Maxi-Lift" | "Tapco" | "4B"
  const [selectedStyle, setSelectedStyle] = useState(null); // bucket record

  useEffect(() => {
    ElevatorBucket.list()
      .then(data => setBuckets(data || []))
      .catch(() => setBuckets([]))
      .finally(() => setLoading(false));
  }, []);

  function goHome() { setSection(null); setSupplier(null); setSelectedStyle(null); }
  function goSection(s) { setSection(s); setSupplier(null); setSelectedStyle(null); }
  function goSupplierList() { setSupplier(null); setSelectedStyle(null); }
  function goStyleGrid(sup) { setSupplier(sup); setSelectedStyle(null); }
  function goStyleDetail(rec) { setSelectedStyle(rec); }

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "#f8fafc", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Inter','Segoe UI',sans-serif" }}>
        <div style={{ textAlign: "center", color: "#9ca3af", fontSize: 14 }}>Loading catalog...</div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", fontFamily: "'Inter','Segoe UI',sans-serif" }}>

      {/* ── Section: Home ── */}
      {!section && (
        <ElevSectionNav onSelect={goSection} />
      )}

      {/* ── Section: Buckets ── */}
      {section === "buckets" && !supplier && !selectedStyle && (
        <ElevSupplierGrid
          buckets={buckets}
          onSelectSupplier={goStyleGrid}
          onBack={goHome}
        />
      )}

      {section === "buckets" && supplier && !selectedStyle && (
        <BucketStyleGrid
          supplier={supplier}
          buckets={buckets}
          onSelectStyle={goStyleDetail}
          onBack={goSupplierList}
        />
      )}

      {section === "buckets" && selectedStyle && (
        <BucketStyleDetail
          rec={selectedStyle}
          onBack={() => setSelectedStyle(null)}
          onClose={goHome}
        />
      )}

      {/* ── Section: Belts ── */}
      {section === "belts" && (
        <ElevBeltsView onBack={goHome} />
      )}

      {/* ── Section: Hardware ── */}
      {section === "hardware" && (
        <ElevHardwareView onBack={goHome} />
      )}

      {/* ── Section: Splices ── */}
      {section === "splices" && (
        <ElevSplicesView onBack={goHome} />
      )}
    </div>
  );
}