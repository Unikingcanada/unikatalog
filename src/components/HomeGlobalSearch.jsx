import { useState, useMemo, useRef, useEffect } from "react";

const C = {
  navy: "#0F2340", navyMid: "#1A3A5C", navyLight: "#2A5080",
  gold: "#C9A84C", border: "#e2e8f0", muted: "#64748b", bg: "#f8fafc", text: "#0f172a",
};

const TYPE_COLORS = {
  "Modular Belt":             { bg: "#d1fae5", color: "#065f46" },
  "Elevator Bucket":          { bg: "#fef3c7", color: "#92400e" },
  "ANSI/BS Chain":            { bg: "#e0e7ff", color: "#3730a3" },
  "Engineered Chain":         { bg: "#dbeafe", color: "#1d4ed8" },
  "Welded Steel Chain":       { bg: "#f1f5f9", color: "#374151" },
  "Conveyor Chain":           { bg: "#cffafe", color: "#0e7490" },
  "Wire Mesh Belt":           { bg: "#ede9fe", color: "#6d28d9" },
  "Conveyor Rollers":         { bg: "#e0f2fe", color: "#0369a1" },
  "Plastic Chain":            { bg: "#fce7f3", color: "#be185d" },
  "Metal Chain":              { bg: "#f3f4f6", color: "#374151" },
  "Forged Chain":             { bg: "#ffedd5", color: "#c2410c" },
  "Long Link Chain":          { bg: "#f1f5f9", color: "#374151" },
  "Pintle Chain":             { bg: "#fef9c3", color: "#854d0e" },
  "Special Application Chain":{ bg: "#f0fdf4", color: "#166534" },
  "Monitoring System":        { bg: "#d1fae5", color: "#047857" },
  "Table Top Chain":          { bg: "#cffafe", color: "#0e7490" },
  "Steel Hinged Belt":        { bg: "#f3f4f6", color: "#374151" },
};

// ── Build a flat, rich search string for a product ──────────────────────────
function buildSearchStr(p) {
  const parts = [];

  // Core identity fields
  parts.push(p.series, p.part_number, p.type, p.style, p.category);
  parts.push(p.brand, p.notes, p.materials, p.material);
  parts.push(p.application, p.duty, p.discharge_type, p.description);
  parts.push(p._subcategory);

  // All values from the specs object (key + value both searchable)
  if (p.specs && typeof p.specs === "object") {
    for (const [k, v] of Object.entries(p.specs)) {
      if (v != null && v !== "") {
        parts.push(k);
        parts.push(String(v));
      }
    }
  }

  // features array (for 4B products and allied)
  if (Array.isArray(p.features)) {
    for (const f of p.features) parts.push(f);
  }

  // alt numbers / cross-refs (Donghua chain cross-refs are in notes already)
  // pitch — common search term
  if (p.pitch_in) parts.push(p.pitch_in + "inch", p.pitch_in + '"');
  if (p.pitch_mm) parts.push(p.pitch_mm + "mm");

  return parts.filter(Boolean).join(" ").toLowerCase();
}

// ── Fuzzy scoring — prioritises exact substring > word-start > char sequence ─
function fuzzyScore(str, pattern) {
  if (!str || !pattern) return -1;
  // Exact substring — highest tier
  if (str.includes(pattern)) return 1000 + (100 - str.length * 0.05);
  // Word-start match
  const words = str.split(/[\s\-_,/.()+]+/);
  for (const w of words) {
    if (w.startsWith(pattern)) return 800 + (100 - str.length * 0.05);
  }
  // Fuzzy char-sequence
  let score = 0, si = 0, pi = 0, consecutive = 0;
  while (si < str.length && pi < pattern.length) {
    if (str[si] === pattern[pi]) {
      consecutive++;
      score += consecutive * 2;
      if (si === 0 || /[\s\-_,/]/.test(str[si - 1])) score += 5;
      pi++;
    } else {
      consecutive = 0;
    }
    si++;
  }
  if (pi < pattern.length) return -1;
  score -= str.length * 0.05;
  return score > 0 ? score : -1;
}

function TypeBadge({ type }) {
  const cfg = TYPE_COLORS[type] || { bg: "#f1f5f9", color: "#334155" };
  return (
    <span style={{
      fontSize: 9, fontWeight: 700, padding: "2px 7px", borderRadius: 10,
      background: cfg.bg, color: cfg.color, whiteSpace: "nowrap", flexShrink: 0,
    }}>
      {type}
    </span>
  );
}

// ── Result subtitle — pick the most useful secondary line ────────────────────
function getSubtitle(p) {
  const parts = [];
  // Part number if different from series name
  if (p.part_number && p.part_number !== p.series) parts.push(p.part_number);
  // Key spec values — pick up to 2 that are short
  if (p.specs) {
    const shortVals = Object.values(p.specs)
      .filter(v => v != null && v !== "" && String(v).length < 30)
      .slice(0, 2);
    parts.push(...shortVals.map(String));
  }
  // Fall back to style / application / materials
  if (!parts.length) {
    if (p.style && p.style !== p.series) parts.push(p.style);
    if (p.application) parts.push(p.application);
    if (p.materials) parts.push(p.materials);
  }
  return parts.slice(0, 2).join(" · ");
}

export default function HomeGlobalSearch({ allData = [], onSelect }) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(0);
  const inputRef = useRef(null);
  const dropRef = useRef(null);

  // Pre-build search strings once when allData changes (perf optimisation)
  const searchIndex = useMemo(() => {
    return allData.map(p => ({ p, str: buildSearchStr(p) }));
  }, [allData]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q.length < 2) return [];
    const words = q.split(/\s+/);
    const scored = [];
    for (const { p, str } of searchIndex) {
      let total = 0, allMatch = true;
      for (const w of words) {
        const s = fuzzyScore(str, w);
        if (s < 0) { allMatch = false; break; }
        total += s;
      }
      // Boost exact part-number / series matches
      if (allMatch) {
        const name = (p.series || p.part_number || "").toLowerCase();
        if (name === q) total += 2000;
        else if (name.startsWith(q)) total += 500;
        scored.push({ p, score: total });
      }
    }
    return scored.sort((a, b) => b.score - a.score).slice(0, 16).map(s => s.p);
  }, [query, searchIndex]);

  useEffect(() => { setHighlighted(0); }, [results]);

  useEffect(() => {
    function handle(e) {
      if (!dropRef.current?.contains(e.target) && !inputRef.current?.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  function handleKeyDown(e) {
    if (!open || results.length === 0) return;
    if (e.key === "ArrowDown") { e.preventDefault(); setHighlighted(h => Math.min(h + 1, results.length - 1)); }
    if (e.key === "ArrowUp")   { e.preventDefault(); setHighlighted(h => Math.max(h - 1, 0)); }
    if (e.key === "Enter" && results[highlighted]) { handleSelect(results[highlighted]); }
    if (e.key === "Escape") { setOpen(false); setQuery(""); }
  }

  function handleSelect(p) {
    onSelect(p);
    setQuery("");
    setOpen(false);
  }

  const showDrop = open && query.length >= 2;

  return (
    <div style={{ position: "relative", maxWidth: 600, margin: "0 auto" }}>
      {/* Search icon */}
      <span style={{
        position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)",
        fontSize: 18, color: "#94a3b8", pointerEvents: "none", zIndex: 1,
      }}>🔍</span>

      <input
        ref={inputRef}
        value={query}
        onChange={e => { setQuery(e.target.value); setOpen(true); }}
        onFocus={() => query.length >= 2 && setOpen(true)}
        onKeyDown={handleKeyDown}
        placeholder="Search products — part no., spec, material, pitch, type…"
        style={{
          width: "100%", boxSizing: "border-box",
          padding: "14px 40px 14px 46px",
          borderRadius: showDrop ? "12px 12px 0 0" : 12,
          border: `1.5px solid ${showDrop || query ? C.navyMid : C.border}`,
          fontSize: 15, outline: "none", background: "#fff",
          boxShadow: query ? "0 4px 16px rgba(26,58,92,0.10)" : "0 1px 4px rgba(0,0,0,0.05)",
          transition: "border 0.15s, box-shadow 0.15s",
          color: C.text,
        }}
      />

      {query && (
        <button
          onClick={() => { setQuery(""); setOpen(false); inputRef.current?.focus(); }}
          style={{
            position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
            background: "none", border: "none", cursor: "pointer", fontSize: 20,
            color: "#94a3b8", lineHeight: 1, zIndex: 1, padding: "0 4px",
          }}
        >×</button>
      )}

      {/* Dropdown */}
      {showDrop && (
        <div ref={dropRef} style={{
          position: "absolute", top: "100%", left: 0, right: 0, zIndex: 9000,
          background: "#fff",
          border: `1.5px solid ${C.navyMid}`, borderTop: "none",
          borderRadius: "0 0 12px 12px",
          boxShadow: "0 8px 32px rgba(15,35,64,0.18)",
          overflow: "hidden",
        }}>
          {results.length === 0 ? (
            <div style={{ padding: "20px", textAlign: "center", color: C.muted, fontSize: 14 }}>
              No products found for "<strong>{query}</strong>"
            </div>
          ) : (
            <>
              {/* Header row */}
              <div style={{
                padding: "7px 16px 5px",
                fontSize: 10, fontWeight: 700, color: C.muted,
                textTransform: "uppercase", letterSpacing: "0.6px",
                borderBottom: "1px solid #f1f5f9",
                display: "flex", justifyContent: "space-between",
              }}>
                <span>{results.length} result{results.length !== 1 ? "s" : ""}</span>
                <span style={{ fontWeight: 400 }}>{searchIndex.length.toLocaleString()} products indexed</span>
              </div>

              <div style={{ maxHeight: 460, overflowY: "auto" }}>
                {results.map((p, i) => {
                  const subtitle = getSubtitle(p);
                  return (
                    <div
                      key={(p.id || "") + i}
                      onMouseEnter={() => setHighlighted(i)}
                      onMouseDown={e => { e.preventDefault(); handleSelect(p); }}
                      style={{
                        display: "flex", alignItems: "center", gap: 12,
                        padding: "9px 16px",
                        borderBottom: i < results.length - 1 ? "1px solid #f8fafc" : "none",
                        cursor: "pointer",
                        background: highlighted === i ? "#eef3f8" : "#fff",
                        transition: "background 0.1s",
                      }}
                    >
                      {/* Thumbnail */}
                      {p.image_url ? (
                        <img
                          src={p.image_url} alt=""
                          style={{ width: 44, height: 36, objectFit: "contain", borderRadius: 6, background: C.bg, flexShrink: 0 }}
                          onError={e => e.target.style.display = "none"}
                        />
                      ) : (
                        <div style={{
                          width: 44, height: 36, borderRadius: 6, background: "#f1f5f9",
                          flexShrink: 0, display: "flex", alignItems: "center",
                          justifyContent: "center", fontSize: 18, color: "#cbd5e1",
                        }}>⛓</div>
                      )}

                      {/* Text */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{
                          fontSize: 13, fontWeight: 700, color: C.text,
                          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                        }}>
                          {p.series || p.part_number || "—"}
                        </div>
                        {subtitle && (
                          <div style={{
                            fontSize: 11, color: C.muted, marginTop: 1,
                            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                          }}>
                            {subtitle}
                          </div>
                        )}
                      </div>

                      <TypeBadge type={p.type} />
                    </div>
                  );
                })}
              </div>

              {/* Footer hint */}
              <div style={{
                padding: "6px 16px",
                fontSize: 10, color: "#cbd5e1",
                borderTop: "1px solid #f8fafc",
                display: "flex", gap: 14,
              }}>
                <span>↑↓ Navigate</span>
                <span>↵ Select</span>
                <span>Esc Close</span>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}