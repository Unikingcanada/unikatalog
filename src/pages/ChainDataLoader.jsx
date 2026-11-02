/**
 * ChainDataLoader — /admin/chain-data-loader (admin only)
 *
 * Loads the Version X master (wave 58) from /chain-media/data/*.json into the Base44 chain entities.
 *   1. Check the package against manifest.json
 *   2. Back up the current chain entities (JSON download) — required before replacing
 *   3. Replace: delete existing rows (they go to the entity's Recently deleted / trash),
 *      then bulkCreate in batches of 200 with retry
 *   4. Verify counts against the manifest
 * Re-running gives the same result (each entity is emptied before it is loaded).
 * Manufacturer_Equivalents, Chain_Sprockets, Chain_Review_Flags and Chain_Downloads are not touched.
 */
import { useEffect, useMemo, useRef, useState } from "react";
import { base44 } from "@/api/base44Client";
import AppLayout from "@/components/layout/AppLayout";
import { useAdminAccess } from "@/lib/useAdminAccess";
import { STATIC_BASE, readAllEntity, countEntity, clearChainCache } from "@/lib/chainW58/chainRepo";

const BATCH = 200;
const NAVY = "#003c5b";

// Load order: parents first. manifestKey = field in manifest.json.
const PLAN = [
  { entity: "Chain_Catalog_Groups", file: "catalog_groups", manifestKey: "groups" },
  { entity: "Chain_Attachment_Codes", file: "attachment_codes", manifestKey: "attachment_codes" },
  { entity: "Normalized_Chains", file: "Normalized_Chains", manifestKey: "chains" },
  { entity: "Chain_Dimensions", file: "Chain_Dimensions", manifestKey: "dimensions" },
  { entity: "Performance_Data", file: "Performance_Data", manifestKey: "performance" },
  { entity: "Chain_Attachments", file: "Chain_Attachments", manifestKey: "attachments" },
  { entity: "Chain_Media", file: "Chain_Media", manifestKey: "media" },
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** Drop null/undefined keys so typed fields are simply left empty. */
function clean(row) {
  const o = {};
  for (const [k, v] of Object.entries(row)) if (v !== null && v !== undefined) o[k] = v;
  // "Other" carries no information and is not in older Chain_Attachments schemas' enum,
  // which made whole batches fail on the first live run. Leave the field empty instead.
  if (o.attachment_type === "Other") delete o.attachment_type;
  return o;
}

const statusOf = (e) => e?.status || e?.response?.status || e?.statusCode || null;
const errText = (e) => {
  const d = e?.response?.data || e?.data;
  return [statusOf(e), e?.message, d ? JSON.stringify(d).slice(0, 300) : ""].filter(Boolean).join(" ");
};

/**
 * Create rows; on a rejected batch, split it until the bad rows are isolated, so one bad row
 * cannot block the rest. Returns the number created; rejected rows are pushed to `failures`.
 */
async function createRobust(ent, rows, label, log, failures) {
  try {
    await withRetry(() => ent.bulkCreate(rows), label, log, rows.length > 1 ? 4 : 2);
    return rows.length;
  } catch (e) {
    if (rows.length === 1) {
      failures.push({ chain_id: rows[0].chain_id, code: rows[0].attachment_code || rows[0].url || "", error: errText(e) });
      if (failures.length <= 5) log(`  ✗ rejected ${rows[0].chain_id}: ${errText(e)}`);
      return 0;
    }
    const mid = Math.ceil(rows.length / 2);
    log(`  splitting ${label} (${rows.length} rows) to isolate rejected rows`);
    return (await createRobust(ent, rows.slice(0, mid), label + "a", log, failures)) +
      (await createRobust(ent, rows.slice(mid), label + "b", log, failures));
  }
}

async function withRetry(fn, label, log, tries = 4) {
  let last;
  for (let i = 0; i < tries; i++) {
    try { return await fn(); } catch (e) {
      last = e;
      const st = statusOf(e);
      if (st && st >= 400 && st < 500 && st !== 408 && st !== 429) throw e; // validation errors: no point retrying
      const wait = 1000 * 2 ** i;
      log(`  ↻ ${label} failed (${e?.message || e}); retry ${i + 1}/${tries - 1} in ${wait / 1000}s`);
      if (i < tries - 1) await sleep(wait);
    }
  }
  throw last;
}

async function emptyEntity(entity, log) {
  const ent = base44.entities[entity];
  let n = await countEntity(entity);
  if (!n) return 0;
  const start = n;
  // Fast path: deleteMany({}) (repeat while the server deletes in chunks)
  for (let i = 0; i < 60 && n > 0; i++) {
    try { await ent.deleteMany({}); } catch (e) { log(`  deleteMany not available (${e?.message || e}) — deleting row by row`); break; }
    const next = await countEntity(entity);
    if (next >= n) break;
    n = next;
  }
  // Slow path: delete by id
  while (n > 0) {
    const rows = await readAllEntity(entity, { fields: ["id"] });
    if (!rows.length) break;
    for (let i = 0; i < rows.length; i += 10) {
      await Promise.all(rows.slice(i, i + 10).map((r) => withRetry(() => ent.delete(r.id), `delete ${r.id}`, log)));
    }
    n = await countEntity(entity);
  }
  return start;
}

function Card({ title, children, step }) {
  return (
    <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: 18, marginBottom: 16 }}>
      <div style={{ fontSize: 15, fontWeight: 800, color: NAVY, marginBottom: 10 }}>{step ? `${step}. ` : ""}{title}</div>
      {children}
    </div>
  );
}
const btn = (enabled, danger) => ({
  padding: "10px 16px", borderRadius: 8, border: "none", fontWeight: 700, fontSize: 13,
  cursor: enabled ? "pointer" : "not-allowed",
  background: !enabled ? "#cbd5e1" : danger ? "#b91c1c" : NAVY, color: "#fff",
});

export default function ChainDataLoader() {
  const { user, checked, isAdmin } = useAdminAccess();
  const allowed = isAdmin || user?.email === "jsauro@unikingcanada.com";

  const [pkg, setPkg] = useState(null); // { manifest, data: {entity: rows} }
  const [pkgErr, setPkgErr] = useState("");
  const [dbCounts, setDbCounts] = useState({});
  const [backupInfo, setBackupInfo] = useState(null);
  const [confirmText, setConfirmText] = useState("");
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState({}); // entity -> {done,total,phase}
  const [verify, setVerify] = useState(null);
  const [rejected, setRejected] = useState({});
  const [logLines, setLogLines] = useState([]);
  const logRef = useRef(null);
  const log = (s) => setLogLines((l) => [...l.slice(-400), `${new Date().toLocaleTimeString()}  ${s}`]);

  useEffect(() => { if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight; }, [logLines]);

  // 1. package
  useEffect(() => {
    if (!allowed) return;
    (async () => {
      try {
        const manifest = await fetch(STATIC_BASE + "manifest.json", { cache: "no-store" }).then((r) => r.json());
        const data = {};
        for (const p of PLAN) {
          const rows = await fetch(STATIC_BASE + p.file + ".json", { cache: "no-store" }).then((r) => { if (!r.ok) throw new Error(`${p.file}.json HTTP ${r.status}`); return r.json(); });
          data[p.entity] = p.entity === "Chain_Catalog_Groups" ? rows.map((g, i) => ({ ...g, sort_order: i })) : rows;
        }
        setPkg({ manifest, data });
      } catch (e) { setPkgErr(String(e?.message || e)); }
    })();
  }, [allowed]);

  async function refreshCounts() {
    const out = {};
    for (const p of PLAN) {
      try { out[p.entity] = await countEntity(p.entity); } catch (e) { out[p.entity] = "error: " + (e?.message || e); }
    }
    setDbCounts(out);
    return out;
  }
  useEffect(() => { if (allowed) refreshCounts(); }, [allowed]);

  const pkgOk = useMemo(() => pkg && PLAN.every((p) => pkg.data[p.entity]?.length === pkg.manifest[p.manifestKey]), [pkg]);

  // 2. backup
  async function doBackup() {
    setRunning(true);
    try {
      const backup = { app: "UniKatalog", taken: new Date().toISOString(), by: user?.email || "", entities: {} };
      for (const p of PLAN) {
        log(`Backing up ${p.entity}…`);
        try {
          backup.entities[p.entity] = await readAllEntity(p.entity, { onPage: (n) => setProgress((s) => ({ ...s, [p.entity]: { phase: "backup", done: n, total: dbCounts[p.entity] || n } })) });
        } catch (e) {
          backup.entities[p.entity] = [];
          log(`  ${p.entity}: could not read (${e?.message || e}) — treated as empty`);
        }
        log(`  ${p.entity}: ${backup.entities[p.entity].length} rows`);
      }
      const name = `unikatalog-chain-backup-${new Date().toISOString().replace(/[:.]/g, "-")}.json`;
      const blob = new Blob([JSON.stringify(backup)], { type: "application/json" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(a.href), 5000);
      const counts = Object.fromEntries(Object.entries(backup.entities).map(([k, v]) => [k, v.length]));
      setBackupInfo({ name, counts, size: blob.size });
      log(`Backup downloaded: ${name} (${(blob.size / 1e6).toFixed(1)} MB)`);
    } finally { setRunning(false); }
  }

  // 3. replace
  async function doReplace() {
    if (!pkgOk || !backupInfo || confirmText !== "REPLACE") return;
    setRunning(true); setVerify(null); setRejected({});
    try {
      for (const p of PLAN) {
        const rows = pkg.data[p.entity].map(clean);
        const ent = base44.entities[p.entity];
        setProgress((s) => ({ ...s, [p.entity]: { phase: "deleting", done: 0, total: rows.length } }));
        log(`${p.entity}: removing existing rows…`);
        const removed = await emptyEntity(p.entity, log);
        log(`  removed ${removed}`);
        log(`${p.entity}: loading ${rows.length} rows in batches of ${BATCH}…`);
        let done = 0, created = 0;
        const failures = [];
        for (let i = 0; i < rows.length; i += BATCH) {
          const chunk = rows.slice(i, i + BATCH);
          created += await createRobust(ent, chunk, `${p.entity} batch ${i / BATCH + 1}`, log, failures);
          done += chunk.length;
          setProgress((s) => ({ ...s, [p.entity]: { phase: "loading", done, total: rows.length } }));
        }
        log(`  ${p.entity}: ${created} created${failures.length ? `, ${failures.length} REJECTED (first: ${failures[0].error})` : ""}`);
        if (failures.length) setRejected((r) => ({ ...r, [p.entity]: failures }));
      }
      clearChainCache();
      await doVerify();
    } catch (e) {
      log(`STOPPED: ${e?.message || e}. Fix the cause and run Replace again — it is safe to re-run.`);
    } finally { setRunning(false); }
  }

  // 4. verify
  async function doVerify() {
    log("Verifying counts…");
    const counts = await refreshCounts();
    const rows = PLAN.map((p) => ({ entity: p.entity, expected: pkg.manifest[p.manifestKey], actual: counts[p.entity] }));
    // spot check five chains end to end
    const chains = pkg.data.Normalized_Chains;
    const picks = [0, 1, 2, 3, 4].map((i) => chains[Math.floor((i + 0.5) * chains.length / 5)]);
    const spot = [];
    for (const c of picks) {
      try {
        const [db] = await base44.entities.Normalized_Chains.filter({ chain_id: c.chain_id }, "-updated_date", 1);
        const att = await countEntity("Chain_Attachments", { chain_id: c.chain_id });
        spot.push({ chain_id: c.chain_id, ok: !!db && db.chain_number === c.chain_number && att === c.attachment_count, detail: `attachments ${att}/${c.attachment_count}` });
      } catch (e) { spot.push({ chain_id: c.chain_id, ok: false, detail: String(e?.message || e) }); }
    }
    const ok = rows.every((r) => r.expected === r.actual) && spot.every((s) => s.ok);
    setVerify({ rows, spot, ok });
    log(ok ? "✓ All counts match the manifest." : "✗ Counts differ — see the verification table.");
  }

  if (!checked) return <AppLayout><div style={{ padding: 40 }}>Checking access…</div></AppLayout>;
  if (!allowed) return <AppLayout><div style={{ padding: 40, color: "#b91c1c", fontWeight: 700 }}>Admins only.</div></AppLayout>;

  return (
    <AppLayout>
      <div style={{ maxWidth: 980, margin: "0 auto", padding: "24px clamp(12px,4vw,32px)" }}>
        <div style={{ fontSize: 22, fontWeight: 800, color: "#0f172a" }}>Chain data loader — Version X master</div>
        <div style={{ fontSize: 13, color: "#64748b", margin: "4px 0 20px" }}>
          {pkg ? `${pkg.manifest.source} · built ${pkg.manifest.built}` : "Reading /chain-media/data…"}
        </div>

        <Card step={1} title="Package vs manifest">
          {pkgErr && <div style={{ color: "#b91c1c" }}>{pkgErr}</div>}
          <table style={{ width: "100%", fontSize: 13, borderCollapse: "collapse" }}>
            <thead><tr style={{ textAlign: "left", color: "#64748b" }}><th>Entity</th><th>Manifest</th><th>Package</th><th>In Base44 now</th></tr></thead>
            <tbody>
              {PLAN.map((p) => {
                const m = pkg?.manifest?.[p.manifestKey], n = pkg?.data?.[p.entity]?.length;
                return (
                  <tr key={p.entity} style={{ borderTop: "1px solid #f1f5f9" }}>
                    <td style={{ padding: "6px 0", fontWeight: 600 }}>{p.entity}</td>
                    <td>{m ?? "…"}</td>
                    <td style={{ color: n === m ? "#16a34a" : "#b91c1c", fontWeight: 700 }}>{n ?? "…"} {n !== undefined && (n === m ? "✓" : "✗")}</td>
                    <td>{dbCounts[p.entity] ?? "…"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>

        <Card step={2} title="Back up current chain records">
          <div style={{ fontSize: 13, color: "#334155", marginBottom: 10 }}>Downloads every row of the seven entities above as one JSON file. Required before replacing.</div>
          <button style={btn(!running && pkgOk)} disabled={running || !pkgOk} onClick={doBackup}>Download backup</button>
          {backupInfo && <div style={{ marginTop: 10, fontSize: 12, color: "#16a34a" }}>✓ {backupInfo.name} — {Object.entries(backupInfo.counts).map(([k, v]) => `${k} ${v}`).join(" · ")}</div>}
        </Card>

        <Card step={3} title="Replace with the W58 master">
          <div style={{ fontSize: 13, color: "#334155", marginBottom: 10, lineHeight: 1.6 }}>
            Empties each entity (deleted rows go to Base44's <b>Recently deleted</b>), then loads the package in batches of {BATCH}.
            Manufacturer_Equivalents, Chain_Sprockets, Chain_Review_Flags and Chain_Downloads are not touched. Type <b>REPLACE</b> to enable.
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <input value={confirmText} onChange={(e) => setConfirmText(e.target.value)} placeholder="REPLACE" style={{ padding: "9px 12px", borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 14, width: 160 }} />
            <button style={btn(!running && pkgOk && !!backupInfo && confirmText === "REPLACE", true)} disabled={running || !pkgOk || !backupInfo || confirmText !== "REPLACE"} onClick={doReplace}>Replace chain data</button>
            <button style={btn(!running && !!pkg)} disabled={running || !pkg} onClick={() => { setRunning(true); doVerify().finally(() => setRunning(false)); }}>Verify only</button>
          </div>
          <div style={{ marginTop: 14 }}>
            {PLAN.map((p) => {
              const s = progress[p.entity];
              const pct = s && s.total ? Math.round((100 * s.done) / s.total) : 0;
              return (
                <div key={p.entity} style={{ marginBottom: 6 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#334155" }}>
                    <span>{p.entity}</span><span>{s ? `${s.phase} ${s.done}/${s.total}` : "—"}</span>
                  </div>
                  <div style={{ height: 6, background: "#f1f5f9", borderRadius: 4 }}><div style={{ width: pct + "%", height: 6, background: s?.phase === "loading" && pct === 100 ? "#16a34a" : NAVY, borderRadius: 4 }} /></div>
                </div>
              );
            })}
          </div>
        </Card>

        {verify && (
          <Card step={4} title={verify.ok ? "Verified ✓" : "Verification failed ✗"}>
            <table style={{ width: "100%", fontSize: 13 }}>
              <tbody>
                {verify.rows.map((r) => (
                  <tr key={r.entity}><td>{r.entity}</td><td>expected {r.expected}</td><td style={{ fontWeight: 700, color: r.expected === r.actual ? "#16a34a" : "#b91c1c" }}>found {String(r.actual)}</td></tr>
                ))}
              </tbody>
            </table>
            {Object.keys(rejected).length > 0 && (
              <div style={{ marginTop: 10, fontSize: 12, color: "#b91c1c" }}>
                Rejected by Base44: {Object.entries(rejected).map(([k, v]) => `${k} ${v.length}`).join(" · ")}. First error: {Object.values(rejected)[0][0].error}
                <div><button style={{ ...btn(true), marginTop: 6, padding: "6px 10px", fontSize: 12 }} onClick={() => {
                  const blob = new Blob([JSON.stringify(rejected, null, 1)], { type: "application/json" });
                  const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "chain-loader-rejected.json"; a.click();
                }}>Download rejected rows</button></div>
              </div>
            )}
            <div style={{ marginTop: 10, fontSize: 12 }}>
              Spot check: {verify.spot.map((s) => <span key={s.chain_id} style={{ marginRight: 12, color: s.ok ? "#16a34a" : "#b91c1c" }}>{s.chain_id} {s.ok ? "✓" : "✗"} ({s.detail})</span>)}
            </div>
          </Card>
        )}

        <Card title="Log">
          <div ref={logRef} style={{ fontFamily: "monospace", fontSize: 11, background: "#0f172a", color: "#e2e8f0", padding: 10, borderRadius: 8, height: 220, overflowY: "auto", whiteSpace: "pre-wrap" }}>
            {logLines.join("\n") || "Ready."}
          </div>
        </Card>
      </div>
    </AppLayout>
  );
}
