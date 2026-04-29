import { useState, useEffect } from "react";
import { MacChainProduct } from "@/api/entities";
import { CatalogProduct } from "@/api/entities";
import { ElevatorBucket } from "@/api/entities";
import { UniCatalog } from "@/api/entities";
import { DonghuaChain } from "@/api/entities";

export default function StatusPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [mac, cat, elev, uni, dong] = await Promise.all([
          MacChainProduct.list(),
          CatalogProduct.list(),
          ElevatorBucket.list(),
          UniCatalog.list(),
          DonghuaChain.list(),
        ]);

        // Break down MacChainProduct by vendor
        const alliedLocke = mac.filter(r => r.vendor === "Allied Locke");
        const macChain = mac.filter(r => r.vendor === "MAC");
        const otherMac = mac.filter(r => r.vendor !== "Allied Locke" && r.vendor !== "MAC");

        // Allied Locke subcategory breakdown
        const alSubcats = {};
        alliedLocke.forEach(r => {
          const key = r.subcategory || "Unknown";
          alSubcats[key] = (alSubcats[key] || 0) + 1;
        });

        // Donghua breakdown
        const dongTypes = {};
        dong.forEach(r => {
          const key = r.chain_type || "Unknown";
          dongTypes[key] = (dongTypes[key] || 0) + 1;
        });

        // CatalogProduct by vendor
        const catVendors = {};
        cat.forEach(r => {
          const key = r.vendor || "Unknown";
          catVendors[key] = (catVendors[key] || 0) + 1;
        });

        // UniCatalog by product_type
        const uniTypes = {};
        uni.forEach(r => {
          const key = r.product_type || "Unknown";
          uniTypes[key] = (uniTypes[key] || 0) + 1;
        });

        // Elevator by vendor
        const elevVendors = {};
        elev.forEach(r => {
          const key = r.vendor || "Unknown";
          elevVendors[key] = (elevVendors[key] || 0) + 1;
        });

        setStats({
          totals: {
            mac: mac.length,
            cat: cat.length,
            elev: elev.length,
            uni: uni.length,
            dong: dong.length,
            grand: mac.length + cat.length + elev.length + uni.length + dong.length,
          },
          alliedLocke: { count: alliedLocke.length, subcats: alSubcats },
          macChain: { count: macChain.length },
          otherMac: { count: otherMac.length },
          dongTypes,
          catVendors,
          uniTypes,
          elevVendors,
        });
      } catch (e) {
        console.error(e);
      }
      setLoading(false);
    }
    load();
  }, []);

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", background: "#0f172a", color: "#94a3b8", fontFamily: "sans-serif" }}>
      Loading catalog status…
    </div>
  );

  const { totals, alliedLocke, dongTypes, catVendors, uniTypes, elevVendors } = stats;

  const sectionStyle = {
    background: "#1e293b",
    borderRadius: 12,
    padding: "20px 24px",
    marginBottom: 20,
  };

  const headerStyle = {
    fontSize: 13,
    fontWeight: 700,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    color: "#64748b",
    marginBottom: 14,
  };

  const rowStyle = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "6px 0",
    borderBottom: "1px solid #334155",
    fontSize: 14,
    color: "#e2e8f0",
  };

  const lastRowStyle = { ...rowStyle, borderBottom: "none" };

  const badgeStyle = (color) => ({
    background: color,
    color: "#fff",
    borderRadius: 6,
    padding: "2px 10px",
    fontSize: 13,
    fontWeight: 700,
    minWidth: 40,
    textAlign: "center",
  });

  const bigStatStyle = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    background: "#1e293b",
    borderRadius: 12,
    padding: "18px 12px",
    flex: 1,
  };

  const sortedEntries = (obj) =>
    Object.entries(obj).sort((a, b) => b[1] - a[1]);

  const colors = ["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ef4444", "#06b6d4", "#ec4899", "#84cc16"];

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0f172a",
      color: "#e2e8f0",
      fontFamily: "'Inter', system-ui, sans-serif",
      padding: "32px 24px",
      maxWidth: 900,
      margin: "0 auto",
    }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 11, letterSpacing: "0.15em", textTransform: "uppercase", color: "#475569", marginBottom: 6 }}>
          UniKonnect Catalog
        </div>
        <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800, color: "#f8fafc" }}>
          Data Status Dashboard
        </h1>
        <p style={{ margin: "6px 0 0", color: "#64748b", fontSize: 14 }}>
          Live record counts across all catalog entities
        </p>
      </div>

      {/* Grand total bar */}
      <div style={{ background: "linear-gradient(135deg, #1d4ed8 0%, #7c3aed 100%)", borderRadius: 14, padding: "22px 28px", marginBottom: 24, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontSize: 13, color: "#bfdbfe", marginBottom: 4 }}>Total catalog records</div>
          <div style={{ fontSize: 42, fontWeight: 900, color: "#fff", lineHeight: 1 }}>{totals.grand.toLocaleString()}</div>
        </div>
        <div style={{ fontSize: 13, color: "#c4b5fd", textAlign: "right" }}>
          <div>{totals.mac} chain products (MacChainProduct)</div>
          <div>{totals.cat} modular belt products (CatalogProduct)</div>
          <div>{totals.elev} elevator buckets</div>
          <div>{totals.uni} UniCatalog entries</div>
          <div>{totals.dong} Donghua chain records</div>
        </div>
      </div>

      {/* Big entity stats */}
      <div style={{ display: "flex", gap: 12, marginBottom: 24 }}>
        {[
          { label: "High-End Roller Chain", sub: "MacChainProduct", count: totals.mac, color: "#3b82f6" },
          { label: "Modular Belting", sub: "CatalogProduct", count: totals.cat, color: "#10b981" },
          { label: "Donghua Chain", sub: "DonghuaChain", count: totals.dong, color: "#f59e0b" },
          { label: "UniCatalog", sub: "Multi-category", count: totals.uni, color: "#8b5cf6" },
          { label: "Elevator Buckets", sub: "ElevatorBucket", count: totals.elev, color: "#ef4444" },
        ].map(({ label, sub, count, color }) => (
          <div key={label} style={{ ...bigStatStyle, borderTop: `3px solid ${color}` }}>
            <div style={{ fontSize: 30, fontWeight: 800, color }}>{count}</div>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#f1f5f9", marginTop: 4, textAlign: "center" }}>{label}</div>
            <div style={{ fontSize: 11, color: "#64748b", marginTop: 2, textAlign: "center" }}>{sub}</div>
          </div>
        ))}
      </div>

      {/* Allied Locke breakdown */}
      <div style={sectionStyle}>
        <div style={headerStyle}>Allied Locke — High-End Roller Chain ({alliedLocke.count} records)</div>
        {sortedEntries(alliedLocke.subcats).map(([key, val], i, arr) => (
          <div key={key} style={i === arr.length - 1 ? lastRowStyle : rowStyle}>
            <span style={{ color: "#cbd5e1" }}>{key}</span>
            <span style={badgeStyle(colors[i % colors.length])}>{val}</span>
          </div>
        ))}
      </div>

      {/* Donghua breakdown */}
      <div style={sectionStyle}>
        <div style={headerStyle}>Donghua Chain — By Type ({totals.dong} records)</div>
        {sortedEntries(dongTypes).map(([key, val], i, arr) => (
          <div key={key} style={i === arr.length - 1 ? lastRowStyle : rowStyle}>
            <span style={{ color: "#cbd5e1" }}>{key}</span>
            <span style={badgeStyle(colors[i % colors.length])}>{val}</span>
          </div>
        ))}
      </div>

      {/* CatalogProduct (Modular Belt) breakdown */}
      <div style={sectionStyle}>
        <div style={headerStyle}>Modular Belt — By Vendor ({totals.cat} records)</div>
        {sortedEntries(catVendors).map(([key, val], i, arr) => (
          <div key={key} style={i === arr.length - 1 ? lastRowStyle : rowStyle}>
            <span style={{ color: "#cbd5e1" }}>{key}</span>
            <span style={badgeStyle(colors[i % colors.length])}>{val}</span>
          </div>
        ))}
      </div>

      {/* UniCatalog breakdown */}
      <div style={sectionStyle}>
        <div style={headerStyle}>UniCatalog — By Product Type ({totals.uni} records)</div>
        {sortedEntries(uniTypes).map(([key, val], i, arr) => (
          <div key={key} style={i === arr.length - 1 ? lastRowStyle : rowStyle}>
            <span style={{ color: "#cbd5e1" }}>{key}</span>
            <span style={badgeStyle(colors[i % colors.length])}>{val}</span>
          </div>
        ))}
      </div>

      {/* Elevator Buckets breakdown */}
      <div style={sectionStyle}>
        <div style={headerStyle}>Elevator Buckets — By Vendor ({totals.elev} records)</div>
        {sortedEntries(elevVendors).map(([key, val], i, arr) => (
          <div key={key} style={i === arr.length - 1 ? lastRowStyle : rowStyle}>
            <span style={{ color: "#cbd5e1" }}>{key}</span>
            <span style={badgeStyle(colors[i % colors.length])}>{val}</span>
          </div>
        ))}
      </div>

      <div style={{ textAlign: "center", color: "#334155", fontSize: 12, marginTop: 8 }}>
        Last updated: {new Date().toLocaleDateString("en-CA", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
      </div>
    </div>
  );
}
