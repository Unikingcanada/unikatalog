/** Shared pieces for the chain section (LA CHAÎNE styling lives in chain.css). */
import { useEffect, useState } from "react";

const FONT_HREF = "https://fonts.googleapis.com/css2?family=Anton&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap";

/** Loads the three brand families once (Anton / Inter / IBM Plex Mono). */
export function useBrandFonts() {
  useEffect(() => {
    if (document.querySelector('link[data-ukc-fonts]')) return;
    const l = document.createElement("link");
    l.rel = "stylesheet"; l.href = FONT_HREF; l.setAttribute("data-ukc-fonts", "1");
    document.head.appendChild(l);
  }, []);
}

/** SVG duotone filter: shadows → ink #0E1F3A, highlights → #ECEAE4 (brand photo treatment). */
export function DuotoneDefs() {
  // channel = shadow + (highlight - shadow) * luminance
  const s = [0x0e, 0x1f, 0x3a].map((v) => v / 255), h = [0xec, 0xea, 0xe4].map((v) => v / 255);
  const row = (i) => `${0.2126 * (h[i] - s[i])} ${0.7152 * (h[i] - s[i])} ${0.0722 * (h[i] - s[i])} 0 ${s[i]}`;
  return (
    <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true">
      <filter id="ukc-duotone" colorInterpolationFilters="sRGB">
        <feColorMatrix type="matrix" values={`${row(0)} ${row(1)} ${row(2)} 0 0 0 1 0`} />
      </filter>
    </svg>
  );
}

export function KMark({ size }) {
  return (
    <div className="ukc-k" style={size ? { width: size, height: size } : undefined} aria-label="Uniking">
      <svg viewBox="0 0 100 100" fill="#F4F2ED"><path d="M12 6h20v34l30-34h24L54 44l34 50H62L38 58l-6 7v29H12z" /></svg>
    </div>
  );
}

export function Crumbs({ items }) {
  return (
    <nav className="ukc-crumbs" aria-label="Breadcrumb">
      {items.map((it, i) => (
        <span key={i} style={{ display: "inline-flex", gap: 6, alignItems: "center" }}>
          {i > 0 && <span className="sep">/</span>}
          {it.onClick && i < items.length - 1 ? <button onClick={it.onClick}>{it.label}</button> : <span className="cur">{it.label}</span>}
        </span>
      ))}
    </nav>
  );
}

/** Image that hides itself (or shows a neutral frame) if the file fails. Photos get the duotone. */
export function Img({ src, alt = "", photo = false, className, style, fallback = null }) {
  const [bad, setBad] = useState(!src);
  useEffect(() => setBad(!src), [src]);
  if (bad) return fallback;
  return <img src={src} alt={alt} loading="lazy" decoding="async" className={[photo ? "duo" : "", className || ""].join(" ").trim() || undefined} style={style} onError={() => setBad(true)} />;
}

export function thumbOf(url) {
  if (!url || !url.startsWith("/chain-media/img/")) return url;
  const i = url.lastIndexOf("/");
  return url.slice(0, i) + "/thumb" + url.slice(i);
}

export function Modal({ title, onClose, children, wide }) {
  useEffect(() => {
    const k = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", k);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", k); document.body.style.overflow = prev; };
  }, [onClose]);
  return (
    <div className="ukc-modal-bg ukc" style={{ maxWidth: "none", padding: "24px 12px", background: "rgba(14,31,58,.55)" }} onClick={onClose} role="dialog" aria-modal="true" aria-label={title}>
      <div className="ukc-modal" style={wide ? { maxWidth: 980 } : undefined} onClick={(e) => e.stopPropagation()}>
        <button className="x" onClick={onClose} aria-label="Close">×</button>
        {title && <h2 style={{ paddingRight: 40 }}>{title}</h2>}
        {children}
      </div>
    </div>
  );
}

/** Small async hook: { data, error, loading } */
export function useAsync(fn, deps) {
  const [state, setState] = useState({ data: null, error: null, loading: true });
  useEffect(() => {
    let alive = true;
    setState((s) => ({ ...s, loading: true, error: null }));
    fn().then((data) => alive && setState({ data, error: null, loading: false }))
      .catch((error) => alive && setState({ data: null, error, loading: false }));
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return state;
}

export function Loading({ label = "Loading" }) {
  return <div className="muted mono small" style={{ padding: "40px 0", textAlign: "center", letterSpacing: ".18em", textTransform: "uppercase" }}>{label}…</div>;
}

export function ErrorBox({ error }) {
  return <div className="ukc-empty">Chain data could not be loaded ({String(error?.message || error)}). Please refresh, or contact Uniking.</div>;
}
