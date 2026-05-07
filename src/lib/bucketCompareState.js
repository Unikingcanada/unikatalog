// Global compare state — persisted in localStorage
// Max 6 items. Each item is a plain object (see schema below).

const KEY = "uniking_bucket_compare";
const MAX = 6;

export function getCompareItems() {
  try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch { return []; }
}

export function saveCompareItems(items) {
  localStorage.setItem(KEY, JSON.stringify(items));
  window.dispatchEvent(new Event("bucket_compare_updated"));
}

export function addCompareItem(item) {
  const items = getCompareItems();
  if (items.find(i => i.id === item.id)) return { ok: true, items }; // already in
  if (items.length >= MAX) return { ok: false, reason: "max", items };
  const next = [...items, item];
  saveCompareItems(next);
  return { ok: true, items: next };
}

export function removeCompareItem(id) {
  const next = getCompareItems().filter(i => i.id !== id);
  saveCompareItems(next);
  return next;
}

export function clearCompare() {
  saveCompareItems([]);
}

export function isInCompare(id) {
  return getCompareItems().some(i => i.id === id);
}

// Build a compare item from a bucket record + size object + active material
export function buildCompareItem(rec, size, material) {
  const sizeNominal = size.sizeNominal || size.size || "";
  const id = [
    (rec.supplier || rec.vendor || ""),
    (rec.style || rec.series || ""),
    sizeNominal,
    material,
  ].map(s => s.replace(/\s+/g, "-")).join("__");

  return {
    id,
    supplier: rec.supplier || rec.vendor || "",
    style: rec.style || rec.series || "",
    styleName: rec.styleName || rec.series || "",
    sizeNominal,
    sizeMetric: size.sizeMetric || "",
    material,
    lengthIn: size.lengthIn ?? size.length_in ?? null,
    projectionIn: size.projectionIn ?? size.projection_in ?? null,
    depthIn: size.depthIn ?? size.depth_in ?? null,
    thicknessIn: size.thicknessIn ?? null,
    capacityWL_cuIn: size.capacityWL_cuIn ?? size.capacity_cu_in ?? null,
    capacityWLplus10: size.capacityWLplus10 ?? null,
    weightLbs: size.weightLbs ?? size.weight_lbs ?? null,
    minSpacingIn: size.minSpacingIn ?? size.std_spacing_in ?? null,
    numHoles: size.numHoles ?? size.holes ?? null,
    boltDiameterIn: size.boltDiameterIn ?? size.bolt_size ?? null,
    holeCenterToCenter: size.holeCenterToCenter ?? null,
    holeDistFromTop: size.holeDistFromTop ?? null,
    dischargeType: rec.discharge_type || "",
    category: rec.category || (( rec.application || "").toLowerCase().includes("ag") ? "Agricultural" : "Industrial"),
  };
}