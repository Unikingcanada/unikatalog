/**
 * ChainCatalog — Top-level orchestrator for the chain catalog.
 * Manages navigation: Home → Category → Product Detail
 */
import { useState } from "react";
import ChainCatalogHome from "./ChainCatalogHome";
import ChainCategoryView from "./ChainCategoryView";
import ChainProductDetail from "./ChainProductDetail";
import SharpTopCatalog from "@/components/sharpTop/SharpTopCatalog";
import { CHAIN_CATEGORIES } from "@/lib/chainCatalogData";

const CATEGORY_COLORS = Object.fromEntries(
  CHAIN_CATEGORIES.map(c => [c.key, c.color])
);

export default function ChainCatalog({ onBack, onGoRFQ }) {
  const [view, setView] = useState("home"); // home | category | detail | sharptop
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);

  function handleSelectCategory(category) {
    if (category.key === "sharptop") {
      setView("sharptop");
      window.scrollTo(0, 0);
      return;
    }
    setSelectedCategory(category);
    setView("category");
    window.scrollTo(0, 0);
  }

  function handleSelectProduct(product) {
    setSelectedProduct(product);
    setView("detail");
    window.scrollTo(0, 0);
  }

  function handleBackFromCategory() {
    setSelectedCategory(null);
    setView("home");
    window.scrollTo(0, 0);
  }

  function handleBackFromDetail() {
    setView(selectedCategory ? "category" : "home");
    window.scrollTo(0, 0);
  }

  const accentColor = selectedCategory ? selectedCategory.color : "#0C2340";

  if (view === "sharptop") {
    return <SharpTopCatalog onBack={() => { setView("home"); window.scrollTo(0,0); }} onGoRFQ={onGoRFQ} />;
  }

  if (view === "detail" && selectedProduct) {
    return (
      <ChainProductDetail
        product={selectedProduct}
        accentColor={CATEGORY_COLORS[selectedProduct.category] || "#0C2340"}
        onBack={handleBackFromDetail}
        onGoRFQ={onGoRFQ}
      />
    );
  }

  if (view === "category" && selectedCategory) {
    return (
      <ChainCategoryView
        category={selectedCategory}
        onBack={handleBackFromCategory}
        onSelectProduct={handleSelectProduct}
      />
    );
  }

  return (
    <ChainCatalogHome
      onSelectCategory={handleSelectCategory}
      onSelectProduct={handleSelectProduct}
      onBack={onBack}
    />
  );
}