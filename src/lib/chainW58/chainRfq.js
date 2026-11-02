/**
 * chainRfq.js — puts chain requests into the existing RFQ cart (localStorage "uniking_rfq_cart").
 * Items keep the cart's existing shape (series/type/style/quantity/unit/notes) so RFQCartView
 * and the sendRFQEmail function handle them unchanged; the full configuration rides along in `config`.
 */
import { tx as scrubMakers } from "./chainText";

const KEY = "uniking_rfq_cart";

export function readCart() {
  try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch { return []; }
}
function writeCart(items) {
  localStorage.setItem(KEY, JSON.stringify(items));
  window.dispatchEvent(new Event("rfq_cart_updated"));
}

/** Plain "request a quote" for a chain, with no configuration. */
export function addChainQuoteRequest(chain) {
  const cart = readCart();
  const id = "uk_chain_" + chain.chain_id;
  if (cart.some((i) => i.id === id && i._source === "uk_chain")) return false;
  cart.push({
    cartId: id + "_" + Date.now(),
    id,
    _source: "uk_chain",
    chain_id: chain.chain_id,
    series: chain.chain_number,
    name: scrubMakers(chain.display_name || chain.chain_number),
    type: scrubMakers(chain.catalog_group || "Chain"),
    style: scrubMakers(chain.series || ""),
    category: chain.catalog_group || "",
    image_url: chain.image_url || "",
    materials: "",
    quantity: 1,
    unit: "Feet",
    notes: "",
  });
  writeCart(cart);
  return true;
}

/** Configured chain line from the configurator. */
export function addConfiguredChain(chain, config, summaryLines) {
  const cart = readCart();
  // "Pitches" was added to the cart's unit list for this; "not sure" goes in as 1 Each + a note.
  const unit = { ft: "Feet", m: "Meters", pitches: "Pitches", unsure: "Each" }[config.length.unit] || "Feet";
  const qty = config.length.unit === "unsure" ? 1 : Number(config.length.value) || 1;
  const id = "uk_cfg_" + chain.chain_id + "_" + Date.now();
  cart.push({
    cartId: id,
    id,
    _source: "uk_chain_configurator",
    chain_id: chain.chain_id,
    series: chain.chain_number,
    name: scrubMakers(chain.display_name || chain.chain_number),
    type: scrubMakers(chain.catalog_group || "Chain"),
    style: config.material?.custom ? "Custom material" : scrubMakers(config.material?.name || ""),
    category: chain.catalog_group || "",
    image_url: chain.image_url || "",
    materials: config.material?.custom ? config.material.customText : config.material?.name || "",
    quantity: qty,
    unit,
    notes: summaryLines.join(" | "),
    config,
  });
  writeCart(cart);
  return true;
}
