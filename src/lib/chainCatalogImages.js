/**
 * chainCatalogImages.js
 * Centralized image URLs and helper functions for the chain catalog.
 * Source: Allied-Locke Industries (chains.alliedlocke.com)
 */

const AM = "https://chains.alliedlocke.com/ImgMedium/";
const AS = "https://chains.alliedlocke.com/ImgSmall/";
const ALLIED = "https://chains.alliedlocke.com/";

// ── Product image map ────────────────────────────────────────────────────────
export const IMG = {
  // ANSI roller chains
  ansi_single:    AM + "PRC%20Ansi%20Drawing.jpg",
  ansi_multi:     AM + "PRC%20Multi%20Strand%20Ansi%20Drawing.jpg",
  ansi_heavy:     AM + "PRC%20Heavy%20Series.jpg",
  solid_bushing:  AM + "PRC%20Solid%20Bushing.jpg",
  super_series:   AM + "PRC%20Super%20Series.jpg",
  british:        AM + "PRC%20British%20Standard.jpg",
  double_pitch_a: AM + "PRC%20Double%20Pitch%20Drive%20(A).jpg",
  double_pitch_c: AM + "PRC%20Double%20Pitch%20Conveyor%20(C).jpg",
  double_pitch_co:AM + "PRC%20Double%20Pitch%20Conveyor%20Oversize%20Roller.jpg",
  xdo:            AM + "PRC%20XDO%20Oilfield.jpg",
  stainless:      AM + "PRC%20Stainless%20Steel.jpg",
  nickel_plated:  AM + "PRC%20Nickel%20Plated.jpg",
  armor_coat:     AM + "PRC%20Armor%20Coat.jpg",
  self_lube:      AM + "PRC%20Self%20Lube.jpg",
  slb:            AM + "PRC%20SLB.jpg",

  // Welded steel
  wh_soft:        AM + "WH78.jpg",
  wh_hard:        AM + "WH132.jpg",
  wh_attach:      AM + "WH124%20Attachment.jpg",
  wd_drag:        AM + "WD104.jpg",

  // Engineered / special
  ag_pintle:      AM + "steel-pintle-chains.jpg",
  ss_class:       AM + "SS188%20copy.jpg",
  msr_class:      AM + "MSR6018.jpg",
  mxs_class:      AM + "MXS881.jpg",
  combination:    AM + "C188.jpg",
  h_class:        AM + "H78.jpg",
  drop_forged:    AM + "Drop%20Forged%20Rivetless.jpg",
  cast_mang:      AM + "Cast%20Manganese.jpg",

  // Agricultural
  ag_roller:      AM + "agricultural-roller-chains.jpg",
  ag_detach:      AM + "steel-detachable-chains.jpg",
  tbar:           AM + "T-Bar%20Chain.jpg",
  trod:           AM + "T-Rod%20Chain.jpg",

  // Leaf & silent
  leaf:           AM + "a1024.jpg",
  silent:         AM + "Silent%20Chain%20Center%20Guide%20Pic.jpg",

  // Attachments / sprockets
  attachments:    AM + "a1038.jpg",
  sprockets:      AS + "sprokets.jpg",
};

// ── Source URL map ───────────────────────────────────────────────────────────
export const SRC = {
  ansi:       ALLIED + "ansi-standard-roller-chains",
  multi:      ALLIED + "ansi-multiple-strand-roller-chains",
  heavy:      ALLIED + "ansi-heavy-series-roller-chains",
  solid:      ALLIED + "solid-bushing-solid-roller-chains",
  super_s:    ALLIED + "super-series-roller-chains",
  british:    ALLIED + "british-standard-roller-chains",
  double_p:   ALLIED + "double-pitch-roller-chains",
  double_cap: ALLIED + "double-capacity-chains",
  xdo:        ALLIED + "xdo-oilfield-series-chains",
  ss:         ALLIED + "stainless-steel-roller-chains",
  np:         ALLIED + "nickel-plated-roller-chains",
  armor:      ALLIED + "armor-coat-chains",
  self_lube:  ALLIED + "self-lube-chains",
  slb:        ALLIED + "self-lube-bushing-chains",
  wh:         ALLIED + "wh-series-welded-mill-chains",
  wd:         ALLIED + "wd-series-welded-drag-chains",
  ag_pintle:  ALLIED + "steel-pintle-chains",
  ss_ec:      ALLIED + "ss-class-bushed-steel-chains",
  msr:        ALLIED + "msr-class-bushed-roller-steel-chains",
  mxs:        ALLIED + "mxs-class-offset-steel-drive-chains",
  comb:       ALLIED + "combination-chains",
  h_class:    ALLIED + "h-class-mill-drag-transfer-chains",
  drop:       ALLIED + "rivetless-drop-forged-chains",
  cast:       ALLIED + "cast-manganese-chains",
  ag_roller:  ALLIED + "agricultural-roller-chains",
  ag_det:     ALLIED + "steel-detachable-chains",
  tbar:       ALLIED + "t-bar-chains",
  trod:       ALLIED + "t-rod-chains",
  leaf:       ALLIED + "leaf-chains",
  silent:     ALLIED + "silent-chains",
  attach:     ALLIED + "roller-chain-attachments",
  wh_attach:  ALLIED + "welded-chain-attachments",
};

// ── Helper functions ─────────────────────────────────────────────────────────

/** Connecting link for a given chain number */
export function cl(chainNo) {
  return {
    code: `${chainNo} CL`,
    name: `No. ${chainNo} Connecting Link`,
    description: `Standard connecting link for No. ${chainNo} roller chain.`,
  };
}

/** Offset link for a given chain number */
export function ol(chainNo) {
  return {
    code: `${chainNo} OL`,
    name: `No. ${chainNo} Offset Link`,
    description: `Offset (half) link for No. ${chainNo} roller chain.`,
  };
}

/** Sprocket reference for a given chain number */
export function spr(chainNo) {
  return {
    code: `${chainNo} Sprocket`,
    name: `No. ${chainNo} Sprockets`,
    bore: "Bored-to-size available",
  };
}

/** Attachment reference for a given chain number and type */
export function att(chainNo, type) {
  const labels = {
    A1: "A1 — One bent extended tab, one side",
    A2: "A2 — Two bent extended tabs, both sides",
    K1: "K1 — One extended pin, one side",
    K2: "K2 — Extended pins, both sides",
  };
  return {
    code: `${chainNo} ${type}`,
    name: `No. ${chainNo} ${type} Attachment`,
    type,
    description: labels[type] || type,
    image: IMG.attachments,
  };
}