# /registry — registry-first catalog data (V2)

This directory is the move toward making **Git the single source of truth** for
UniKatalog chain data, with Base44 as a render target (per `REPO_AUDIT_FINDINGS.md`).

## Current contents

| Path | What |
|---|---|
| `families/<slug>.json` | One file per chain family (18 = the full Base44 enum). Lossless static-chain records, family-remapped to canonical enum labels, provenance-tagged. |
| `_manifest.json` | Machine-readable rollup: per-family counts, provenance, collisions, unmapped records. |
| `extract_static.mjs` | Deterministic generator that lifts `src/lib/*.js` static arrays into `families/`. Re-run with `node registry/extract_static.mjs`. |
| `EXTRACTION_REPORT.md` | Human summary of the first extraction + findings. |

## Record shape

Each `families/<slug>.json` is `{ family, slug, count, chains: [...] }`. Every
chain keeps its full original fields plus namespaced registry metadata:

- `chain_family` — rewritten to the canonical enum **label**
- `_family_key` — the original internal key it came from
- `_family_unmapped` — `true` if the key didn't map to the enum (parked + flagged)
- `provenance` — `catalog-verified` | `standard-nominal` | `derived`
- `_origin` — which `src/lib` source the record came from
- `needs_review` — `true` for `derived` or unmapped records

## Not yet built (planned)

- `equivalents/`, `dimensions/`, `performance/` sub-registries (derivable from
  the lossless records already captured here)
- `schema.json` mirroring `base44/entities/Normalized_Chains.jsonc`
- `validate.py` — the audit suite as a pre-commit gate
- `sync/push_to_base44.js` — diff registry vs live DB, patch only deltas
