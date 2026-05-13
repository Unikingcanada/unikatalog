/**
 * ChainCatalog — Top-level orchestrator for the chain catalog.
 * Manages navigation: Home → Category → Product Detail
 */
import { useState } from "react";
import ChainCatalogHome from "./ChainCatalogHome";
import ChainCategoryView from "./ChainCategoryView";
import ChainProductDetail from "./ChainProductDetail";
import SharpTopCatalog from "@/components/sharpTop/SharpTopCatalog";
import ChainPlatformView from "./platform/ChainPlatformView";
import { CHAIN_CATEGORIES } from "@/lib/chainCatalogData";

const CATEGORY_COLORS = Object.fromEntries(
  CHAIN_CATEGORIES.map(c => [c.key, c.color])
);

export default function ChainCatalog({ onBack, onGoRFQ }) {
  // NORMALIZED CHAIN PLATFORM ONLY
  // Direct entry point — no intermediate category/product selection
  // Legacy Allied/Mac/Donghua platforms archived in ARCHIVE_LEGACY_CHAIN_PLATFORMS.md
  return <ChainPlatformView onBack={onBack} onGoRFQ={onGoRFQ} />;
}