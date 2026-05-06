import { useState, useEffect } from "react";

const C = {
  green: "#16a34a",
  greenBg: "#f0fdf4",
  blue: "#2563eb",
  blueBg: "#eff6ff",
  border: "#cbd5e1",
};

function getRFQCart() {
  try {
    return JSON.parse(localStorage.getItem("uniking_rfq_cart") || "[]");
  } catch {
    return [];
  }
}

function saveRFQCart(items) {
  localStorage.setItem("uniking_rfq_cart", JSON.stringify(items));
  window.dispatchEvent(new Event("rfq_cart_updated"));
}

function addToRFQCart(product) {
  const cart = getRFQCart();
  const exists = cart.find((i) => i.id === product.id && i._source === product._source);
  if (exists) return false;
  
  cart.push({
    cartId: product.id + "_" + Date.now(),
    id: product.id,
    _source: product._source || "product",
    series: product.series || product.name || "",
    type: product.type || "",
    style: product.style || product.category || "",
    category: product.category || "",
    image_url: product.image_url || product.image || "",
    materials: product.materials || "",
    application: product.application || "",
    quantity: 1,
    unit: "Feet",
    notes: "",
  });
  saveRFQCart(cart);
  return true;
}

export default function RFQButton({ product, size = "medium", onClick = null }) {
  const [added, setAdded] = useState(() => getRFQCart().some((i) => i.id === product?.id));

  useEffect(() => {
    const update = () => {
      if (product) setAdded(getRFQCart().some((i) => i.id === product.id));
    };
    window.addEventListener("rfq_cart_updated", update);
    return () => window.removeEventListener("rfq_cart_updated", update);
  }, [product?.id]);

  function handleClick(e) {
    if (onClick) {
      onClick(e);
      return;
    }
    e.stopPropagation();
    if (added) {
      window.dispatchEvent(new CustomEvent("uniking_go_rfq"));
      return;
    }
    if (product) {
      addToRFQCart(product);
      setAdded(true);
    }
  }

  const sizeMap = {
    small: { padding: "4px 10px", fontSize: 10, fontWeight: 700 },
    medium: { padding: "6px 12px", fontSize: 11, fontWeight: 700 },
    large: { padding: "10px 20px", fontSize: 13, fontWeight: 700 },
  };

  const styles = sizeMap[size] || sizeMap.medium;

  return (
    <button
      onClick={handleClick}
      style={{
        ...styles,
        borderRadius: 6,
        cursor: "pointer",
        border: added ? `1px solid ${C.green}` : `1px solid ${C.blue}`,
        background: added ? C.greenBg : C.blueBg,
        color: added ? C.green : C.blue,
        whiteSpace: "nowrap",
        transition: "all 0.15s",
      }}
    >
      {added ? "✓ In RFQ" : "+ Add to RFQ"}
    </button>
  );
}