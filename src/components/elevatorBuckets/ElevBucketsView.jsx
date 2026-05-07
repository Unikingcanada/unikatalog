/**
 * ElevBucketsView — Elevator Buckets & Accessories main orchestrator
 * Sections: Buckets (supplier → style → detail) | Belts | Hardware | Splices
 */
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { getCompareItems } from "@/lib/bucketCompareState";

import ElevSectionNav from "./ElevSectionNav";
import ElevSupplierGrid from "./ElevSupplierGrid";
import BucketStyleGrid from "./BucketStyleGrid";
import BucketStyleDetail from "./BucketStyleDetail";
import ElevBeltsView from "./ElevBeltsView";
import ElevHardwareView from "./ElevHardwareView";
import ElevSplicesView from "./ElevSplicesView";
import BucketCompareTray from "./BucketCompareTray";

export default function ElevBucketsView({ onBack, onGoRFQ }) {
  const [buckets, setBuckets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [compareCount, setCompareCount] = useState(() => getCompareItems().length);
  const navigate = useNavigate();

  // Navigation state
  const [section, setSection] = useState(null);        // null | "buckets" | "belts" | "hardware" | "splices"
  const [supplier, setSupplier] = useState(null);      // "Maxi-Lift" | "Tapco" | "4B"
  const [selectedStyle, setSelectedStyle] = useState(null); // bucket record

  useEffect(() => {
    base44.entities.ElevatorBucket.list()
      .then(data => setBuckets(data || []))
      .catch(() => setBuckets([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const h = () => setCompareCount(getCompareItems().length);
    window.addEventListener("bucket_compare_updated", h);
    return () => window.removeEventListener("bucket_compare_updated", h);
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

  // Compare nav bar
  const CompareBar = () => (
    <div style={{ background: "#fff", borderBottom: "1px solid #e5e7eb", padding: "8px clamp(12px,4vw,32px)", display: "flex", justifyContent: "flex-end" }}>
      <button
        onClick={() => navigate("/BucketCompare")}
        style={{ padding: "6px 14px", borderRadius: 8, border: "1px solid #7c3aed", background: compareCount > 0 ? "#7c3aed" : "#faf5ff", color: compareCount > 0 ? "#fff" : "#7c3aed", fontSize: 12, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
        ⚖️ Comparisons
        {compareCount > 0 && (
          <span style={{ background: "rgba(255,255,255,0.25)", borderRadius: 99, padding: "1px 7px", fontSize: 11 }}>{compareCount}</span>
        )}
      </button>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", fontFamily: "'Inter','Segoe UI',sans-serif" }}>
      <CompareBar />

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

      {/* Global compare tray */}
      <BucketCompareTray />
    </div>
  );
}