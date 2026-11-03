/**
 * Chain configurator (RFQ builder) for one chain.
 * Length only (ft / m / pitches / not sure) → material from the chain's own list or custom (text required)
 * → attachments from the chain's own list (with frequency) or custom description → spare / connecting /
 * offset link quantities → review → existing RFQ cart.
 * Nothing is offered that is not in this chain's data.
 */
import { useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import { getChainDetail } from "@/lib/chainW58/chainRepo";
import { tx, num, fmtIn, materialsByClass } from "@/lib/chainW58/chainText";
import { addConfiguredChain } from "@/lib/chainW58/chainRfq";
import { Crumbs, Img, Loading, ErrorBox, thumbOf, useAsync } from "./ui";

const STEPS = ["Length", "Material", "Attachments", "Links", "Review"];
const FREQ = [["1", "Every pitch"], ["2", "Every 2nd pitch"], ["3", "Every 3rd pitch"], ["4", "Every 4th pitch"], ["6", "Every 6th pitch"], ["8", "Every 8th pitch"], ["12", "Every 12th pitch"], ["custom", "Other spacing"]];
const LINKS = [
  ["spare", "Spare links", "Complete links for repairs."],
  ["connecting", "Connecting links", "To join chain ends on site."],
  ["offset", "Offset links", "Half links for an odd number of pitches."],
];

export default function ChainConfigurator({ chainId, fromGroup, go }) {
  const st = useAsync(() => getChainDetail(chainId), [chainId]);
  const [step, setStep] = useState(0);
  const [length, setLength] = useState({ unit: "ft", value: "", note: "" });
  const [material, setMaterial] = useState(null); // {code,name,class} | {custom:true}
  const [customMat, setCustomMat] = useState("");
  const [attMode, setAttMode] = useState("none"); // none | catalogue | custom
  const [attSel, setAttSel] = useState({}); // key -> {freq, freqOther}
  const [customAtt, setCustomAtt] = useState({ text: "", freq: "", fileUri: "", fileName: "", previewUrl: "", uploading: false, uploadError: "" });
  const [links, setLinks] = useState({ spare: 0, connecting: 0, offset: 0 });
  const [notes, setNotes] = useState("");
  const [tried, setTried] = useState(false);
  const [done, setDone] = useState(false);

  const detail = st.data;
  const chain = detail?.chain;
  const pitchIn = num(detail?.dims?.pitch_in) ?? num(chain?.pitch_in);
  const materials = useMemo(() => (Array.isArray(chain?.materials) ? chain.materials.filter((m) => m && m.name) : []), [chain]);
  const atts = useMemo(() => (detail?.attachments || []).map((a, i) => ({ ...a, _key: (a.id || a.attachment_code) + "#" + i })), [detail]);

  if (st.loading) return <Loading label="Loading chain" />;
  if (st.error) return <ErrorBox error={st.error} />;
  if (!chain) return <div className="ukc-empty">This chain is not in the catalogue. <button className="ukc-link" onClick={go.home}>Back to chain</button></div>;
  const group = chain.catalog_group || fromGroup;

  // ── validation ─────────────────────────────────────────────
  const lenVal = num(length.value);
  const errors = {
    0: length.unit !== "unsure" && !(lenVal > 0) ? "Enter the length you need, or choose Not sure." : length.unit === "pitches" && lenVal && !Number.isInteger(lenVal) ? "Pitches must be a whole number." : "",
    1: !material ? "Choose a material." : material.custom && !customMat.trim() ? "Describe the custom material or finish." : "",
    2: attMode === "catalogue" && !Object.keys(attSel).length ? "Pick at least one attachment, or choose No attachments."
      : attMode === "catalogue" && Object.values(attSel).some((s) => !s.freq || (s.freq === "custom" && !s.freqOther.trim())) ? "Set how often each attachment repeats."
      : attMode === "custom" && !customAtt.text.trim() ? "Describe the custom attachment." : "",
    3: Object.values(links).some((v) => v < 0 || !Number.isInteger(v)) ? "Quantities must be whole numbers." : "",
  };
  const next = () => { setTried(true); if (!errors[step]) { setTried(false); setStep((s) => Math.min(4, s + 1)); window.scrollTo(0, 0); } };
  const prev = () => { setTried(false); setStep((s) => Math.max(0, s - 1)); };

  // ── summary ────────────────────────────────────────────────
  const lengthText = length.unit === "unsure"
    ? `Not sure${length.note.trim() ? ` - ${length.note.trim()}` : ""}`
    : `${lenVal} ${{ ft: "ft", m: "m", pitches: "pitches" }[length.unit]}${approxPitches()}`;
  function approxPitches() {
    if (!pitchIn || !lenVal || length.unit === "pitches" || length.unit === "unsure") return "";
    const inches = length.unit === "ft" ? lenVal * 12 : (lenVal * 1000) / 25.4;
    return ` (about ${Math.ceil(inches / pitchIn)} pitches)`;
  }
  const materialText = material ? (material.custom ? `Custom: ${customMat.trim()}` : tx(material.name)) : "";
  const freqText = (s) => (s.freq === "custom" ? s.freqOther.trim() : FREQ.find((f) => f[0] === s.freq)?.[1] || "");
  const attLines = attMode === "none" ? ["No attachments"]
    : attMode === "custom" ? [`Custom attachment: ${customAtt.text.trim()}${customAtt.freq.trim() ? ` (${customAtt.freq.trim()})` : ""}${customAtt.fileName ? ` · drawing: ${customAtt.fileName}` : ""}`]
    : atts.filter((a) => attSel[a._key]).map((a) => `${tx(a.attachment_code)}${a.side ? ` ${tx(a.side).toLowerCase()}` : ""} - ${freqText(attSel[a._key])}`);
  const linkLines = LINKS.filter(([k]) => links[k] > 0).map(([k, label]) => `${label}: ${links[k]}`);

  async function handleAttFile(file) {
    if (!file) return;
    const ok = /^image\/|pdf|\.dwg$|\.dxf$/i.test(file.type || file.name);
    if (!ok) { setCustomAtt((s) => ({ ...s, uploadError: "Please upload an image, PDF or drawing file." })); return; }
    if (file.size > 10 * 1024 * 1024) { setCustomAtt((s) => ({ ...s, uploadError: "File must be 10 MB or smaller." })); return; }
    setCustomAtt((s) => ({ ...s, uploading: true, uploadError: "" }));
    try {
      const { file_uri } = await base44.integrations.Core.UploadPrivateFile({ file });
      const preview = /^image\//i.test(file.type) ? URL.createObjectURL(file) : "";
      setCustomAtt((s) => ({ ...s, fileUri: file_uri, fileName: file.name, previewUrl: preview, uploading: false }));
    } catch {
      setCustomAtt((s) => ({ ...s, uploading: false, uploadError: "Upload failed. Please try again." }));
    }
  }
  function clearAttFile() {
    setCustomAtt((s) => {
      if (s.previewUrl) URL.revokeObjectURL(s.previewUrl);
      return { ...s, fileUri: "", fileName: "", previewUrl: "", uploading: false, uploadError: "" };
    });
  }

  function addToCart() {
    const config = {
      chain_id: chain.chain_id, chain_number: chain.chain_number,
      length: { unit: length.unit, value: length.unit === "unsure" ? null : lenVal, note: length.note.trim() },
      material: material.custom ? { custom: true, customText: customMat.trim() } : { code: material.code, name: material.name, class: material.class },
      attachments: attMode === "none" ? [] : attMode === "custom" ? [{ custom: true, description: customAtt.text.trim(), frequency: customAtt.freq.trim(), fileUri: customAtt.fileUri || "", fileName: customAtt.fileName || "" }]
        : atts.filter((a) => attSel[a._key]).map((a) => ({ code: a.attachment_code, code_key: a.code_key, side: a.side, frequency: freqText(attSel[a._key]) })),
      links: { ...links },
      notes: notes.trim(),
    };
    const lines = [
      `Chain ${tx(chain.chain_number)} (${tx(group)})`,
      `Length: ${lengthText}`,
      `Material: ${materialText}`,
      `Attachments: ${attLines.join("; ")}`,
      ...(linkLines.length ? [`Links: ${linkLines.join(", ")}`] : []),
      ...(notes.trim() ? [`Notes: ${notes.trim()}`] : []),
    ];
    addConfiguredChain(chain, config, lines);
    setDone(true);
  }

  const err = tried && errors[step] ? <div className="ukc-err" role="alert">{errors[step]}</div> : null;

  return (
    <div>
      <Crumbs items={[{ label: "All products", onClick: go.back }, { label: "Chain", onClick: go.home }, { label: tx(group), onClick: () => go.group(group) }, { label: tx(chain.chain_number), onClick: () => go.chain(chain.chain_id, group) }, { label: "Configure" }]} />
      <div style={{ display: "flex", gap: 14, alignItems: "center", marginBottom: 12 }}>
        <div style={{ width: 84, height: 64, background: "#fff", border: "1px solid var(--ukc-border)", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Img src={thumbOf(chain.image_url)} photo style={{ maxWidth: 78, maxHeight: 58, objectFit: "contain" }} fallback={null} />
        </div>
        <div style={{ minWidth: 0 }}>
          <div className="eyebrow">Configure · request a quote</div>
          <h1 style={{ margin: "4px 0 0" }}>{tx(chain.chain_number)}</h1>
          <div className="small muted">{tx(chain.series)}{pitchIn ? <> · <span className="mono">{fmtIn(pitchIn)} in pitch</span></> : null}</div>
        </div>
      </div>

      {done ? (
        <div className="ukc-card">
          <h2>Added to your RFQ</h2>
          <p>{tx(chain.chain_number)} with your configuration is in the RFQ cart. Add more items or send the request.</p>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button className="ukc-btn primary" onClick={go.rfq}>Open RFQ cart</button>
            <button className="ukc-btn ghost" onClick={() => go.chain(chain.chain_id, group)}>Back to {tx(chain.chain_number)}</button>
            <button className="ukc-btn ghost" onClick={go.home}>Browse chain</button>
          </div>
        </div>
      ) : (
        <div className="ukc-card">
          <div className="ukc-steps">{STEPS.map((s, i) => <span key={s} className={i === step ? "on" : i < step ? "done" : ""}>{i + 1}. {s}</span>)}</div>

          {step === 0 && (
            <div>
              <h2>How much chain?</h2>
              <div className="ukc-seg" style={{ marginBottom: 12 }}>
                {[["ft", "Feet"], ["m", "Metres"], ["pitches", "Pitches"], ["unsure", "Not sure"]].map(([k, l]) => (
                  <button key={k} className={length.unit === k ? "on" : ""} onClick={() => setLength((s) => ({ ...s, unit: k }))}>{l}</button>
                ))}
              </div>
              {length.unit !== "unsure" ? (
                <div style={{ maxWidth: 260 }}>
                  <label className="ukc-label" htmlFor="cfg-len">Length ({{ ft: "ft", m: "m", pitches: "pitches" }[length.unit]})</label>
                  <input id="cfg-len" className="ukc-input" inputMode="decimal" value={length.value} onChange={(e) => setLength((s) => ({ ...s, value: e.target.value }))} />
                  {approxPitches() && <div className="small muted mono" style={{ marginTop: 6 }}>{approxPitches().trim().replace(/[()]/g, "")}</div>}
                </div>
              ) : (
                <div>
                  <label className="ukc-label" htmlFor="cfg-len-note">Tell us about the conveyor (optional)</label>
                  <textarea id="cfg-len-note" className="ukc-textarea" rows={3} value={length.note} onChange={(e) => setLength((s) => ({ ...s, note: e.target.value }))} placeholder="Shaft centres, sprocket teeth, or the length of the old chain…" />
                </div>
              )}
              {err}
            </div>
          )}

          {step === 1 && (
            <div>
              <h2>Material and finish</h2>
              {!materials.length && <div className="ukc-empty" style={{ marginBottom: 10 }}>No materials are catalogued for {tx(chain.chain_number)} - made to order. Describe what you need below.</div>}
              <div className="ukc-options">
                {materialsByClass(materials).map(([cls, items]) => (
                  <div key={cls}>
                    <div className="ukc-label" style={{ marginTop: 6 }}>{tx(cls)}</div>
                    <div className="ukc-options">
                      {items.map((m) => {
                        const on = material && !material.custom && material.code === m.code && material.name === m.name;
                        return (
                          <label key={(m.code || "") + m.name} className={"ukc-option" + (on ? " on" : "")}>
                            <input type="radio" name="mat" checked={!!on} onChange={() => setMaterial(m)} />
                            <span><span className="t" style={{ display: "block" }}>{tx(m.name)}</span>{m.description && <span className="d">{tx(m.description)}</span>}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                ))}
                <label className={"ukc-option" + (material?.custom ? " on" : "")}>
                  <input type="radio" name="mat" checked={!!material?.custom} onChange={() => setMaterial({ custom: true })} />
                  <span style={{ flex: 1 }}>
                    <span className="t" style={{ display: "block" }}>Custom / other</span>
                    <span className="d">Describe the material, finish or treatment.</span>
                    {material?.custom && <textarea className="ukc-textarea" rows={2} style={{ marginTop: 8 }} value={customMat} onChange={(e) => setCustomMat(e.target.value)} placeholder="Required" aria-label="Custom material" />}
                  </span>
                </label>
              </div>
              {err}
            </div>
          )}

          {step === 2 && (
            <div>
              <h2>Attachments</h2>
              {!atts.length && <div className="ukc-empty" style={{ marginBottom: 10 }}>No attachments are catalogued for {tx(chain.chain_number)} - made to order.</div>}
              <div className="ukc-options">
                <label className={"ukc-option" + (attMode === "none" ? " on" : "")}>
                  <input type="radio" name="attm" checked={attMode === "none"} onChange={() => setAttMode("none")} />
                  <span className="t">No attachments</span>
                </label>
                {atts.length > 0 && (
                  <label className={"ukc-option" + (attMode === "catalogue" ? " on" : "")}>
                    <input type="radio" name="attm" checked={attMode === "catalogue"} onChange={() => setAttMode("catalogue")} />
                    <span><span className="t" style={{ display: "block" }}>From the catalogue</span><span className="d">{atts.length} attachments on file for this chain</span></span>
                  </label>
                )}
                <label className={"ukc-option" + (attMode === "custom" ? " on" : "")}>
                  <input type="radio" name="attm" checked={attMode === "custom"} onChange={() => setAttMode("custom")} />
                  <span><span className="t" style={{ display: "block" }}>Custom attachment</span><span className="d">Describe it and we will quote from a works drawing.</span></span>
                </label>
              </div>

              {attMode === "catalogue" && (
                <div style={{ marginTop: 14 }} className="ukc-options">
                  {atts.map((a) => {
                    const s = attSel[a._key];
                    return (
                      <div key={a._key} className={"ukc-option" + (s ? " on" : "")} style={{ cursor: "default", flexWrap: "wrap" }}>
                        <input type="checkbox" checked={!!s} aria-label={`Select ${a.attachment_code}`}
                          onChange={(e) => setAttSel((m) => { const n = { ...m }; if (e.target.checked) n[a._key] = { freq: "", freqOther: "" }; else delete n[a._key]; return n; })} />
                        <div style={{ width: 64, height: 48, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <Img src={thumbOf(a.image_url)} style={{ maxWidth: 64, maxHeight: 48, objectFit: "contain" }} fallback={null} />
                        </div>
                        <span style={{ flex: "1 1 160px", minWidth: 0 }}>
                          <span className="t" style={{ display: "block" }}>{tx(a.attachment_code)}{a.side ? ` · ${tx(a.side)}` : ""}</span>
                          <span className="d">{tx(a.description || a.attachment_type)}{a.drawing_listed_only ? " (dimensions on quote)" : ""}</span>
                        </span>
                        {s && (
                          <div style={{ flex: "1 1 200px", display: "grid", gap: 6 }}>
                            <select className="ukc-select" value={s.freq} aria-label="Frequency" onChange={(e) => setAttSel((m) => ({ ...m, [a._key]: { ...m[a._key], freq: e.target.value } }))}>
                              <option value="">How often?</option>
                              {FREQ.map(([k, l]) => <option key={k} value={k}>{l}</option>)}
                            </select>
                            {s.freq === "custom" && <input className="ukc-input" placeholder="e.g. every 5th pitch, or 1 per 12 in" value={s.freqOther} onChange={(e) => setAttSel((m) => ({ ...m, [a._key]: { ...m[a._key], freqOther: e.target.value } }))} />}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
              {attMode === "custom" && (
                <div style={{ marginTop: 14, display: "grid", gap: 10 }}>
                  <div><label className="ukc-label" htmlFor="cfg-catt">Describe the attachment *</label>
                    <textarea id="cfg-catt" className="ukc-textarea" rows={3} value={customAtt.text} onChange={(e) => setCustomAtt((s) => ({ ...s, text: e.target.value }))} placeholder="Type, one or both sides, hole size and position, height…" /></div>
                  <div style={{ maxWidth: 360 }}><label className="ukc-label" htmlFor="cfg-cattf">Frequency</label>
                    <input id="cfg-cattf" className="ukc-input" value={customAtt.freq} onChange={(e) => setCustomAtt((s) => ({ ...s, freq: e.target.value }))} placeholder="e.g. every 4th pitch" /></div>
                  <div>
                    <label className="ukc-label">Picture or drawing (optional)</label>
                    {customAtt.fileName ? (
                      <div className="ukc-option on" style={{ alignItems: "center", gap: 12, cursor: "default" }}>
                        {customAtt.previewUrl
                          ? <img src={customAtt.previewUrl} alt={customAtt.fileName} style={{ width: 56, height: 44, objectFit: "contain", flexShrink: 0, borderRadius: 4, border: "1px solid var(--ukc-border)" }} />
                          : <span style={{ width: 56, height: 44, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "#f4f5f7", borderRadius: 4, border: "1px solid var(--ukc-border)", fontSize: 18 }}>📎</span>}
                        <span style={{ flex: 1, minWidth: 0 }} className="small">
                          <span style={{ display: "block", fontWeight: 600 }}>{customAtt.fileName}</span>
                          <span className="muted">Uploaded · stored privately with your RFQ</span>
                        </span>
                        <button type="button" className="ukc-btn ghost" onClick={clearAttFile} disabled={customAtt.uploading}>Remove</button>
                      </div>
                    ) : (
                      <label className={"ukc-option" + (customAtt.uploading ? " on" : "")} style={{ alignItems: "center", gap: 12, cursor: customAtt.uploading ? "wait" : "pointer" }}>
                        <span style={{ width: 56, height: 44, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "#f4f5f7", borderRadius: 4, border: "1px solid var(--ukc-border)", fontSize: 22 }}>{customAtt.uploading ? "…" : "🖼️"}</span>
                        <span style={{ flex: 1, minWidth: 0 }}>
                          <span className="t" style={{ display: "block" }}>{customAtt.uploading ? "Uploading…" : "Upload a picture or drawing"}</span>
                          <span className="d">Image, PDF or DWG/DXF · max 10 MB. We'll quote from it.</span>
                        </span>
                        <input type="file" accept="image/*,.pdf,.dwg,.dxf" style={{ display: "none" }} disabled={customAtt.uploading} onChange={(e) => { handleAttFile(e.target.files?.[0]); e.target.value = ""; }} />
                      </label>
                    )}
                    {customAtt.uploadError && <div className="ukc-err" role="alert" style={{ marginTop: 8 }}>{customAtt.uploadError}</div>}
                  </div>
                </div>
              )}
              {err}
            </div>
          )}

          {step === 3 && (
            <div>
              <h2>Spare, connecting and offset links</h2>
              {LINKS.map(([k, label, help]) => (
                <div key={k} className="ukc-qty">
                  <div><div style={{ fontWeight: 600 }}>{label}</div><div className="small muted">{help}</div></div>
                  <input className="ukc-input mono" type="number" min="0" step="1" inputMode="numeric" value={links[k]} aria-label={label}
                    onChange={(e) => setLinks((s) => ({ ...s, [k]: e.target.value === "" ? 0 : Number(e.target.value) }))} />
                </div>
              ))}
              {err}
            </div>
          )}

          {step === 4 && (
            <div>
              <h2>Review</h2>
              <table className="ukc-review"><tbody>
                <tr><td>Chain</td><td><b className="mono">{tx(chain.chain_number)}</b> · {tx(group)}</td></tr>
                <tr><td>Length</td><td className="mono">{lengthText}</td></tr>
                <tr><td>Material</td><td>{materialText}</td></tr>
                <tr><td>Attachments</td><td>{attLines.map((l) => <div key={l}>{l}</div>)}</td></tr>
                <tr><td>Links</td><td>{linkLines.length ? linkLines.map((l) => <div key={l} className="mono">{l}</div>) : "None"}</td></tr>
              </tbody></table>
              <div style={{ marginTop: 12 }}>
                <label className="ukc-label" htmlFor="cfg-notes">Notes for Uniking (optional)</label>
                <textarea id="cfg-notes" className="ukc-textarea" rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Application, speed, temperature, delivery date…" />
              </div>
              <p className="ukc-note">Strength and the Uniking-certified values are confirmed on the quotation.</p>
            </div>
          )}

          <div className="ukc-footer-nav">
            {step > 0 ? <button className="ukc-btn ghost" onClick={prev}>Back</button> : <button className="ukc-btn ghost" onClick={() => go.chain(chain.chain_id, group)}>Cancel</button>}
            {step < 4 ? <button className="ukc-btn" onClick={next}>Next</button> : <button className="ukc-btn primary" onClick={addToCart}>Add to RFQ cart</button>}
          </div>
        </div>
      )}
    </div>
  );
}