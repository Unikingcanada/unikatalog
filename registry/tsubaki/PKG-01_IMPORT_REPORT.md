# PKG-01 Tsubaki — Compile & Staging Report

Generated: 2026-06-12 · Validator: `compile_workbook.py` (BANNED list updated per PKG-01f addendum)

## Result: 4 packages compiled, **0 errors, 0 warnings** (validation mandatory ✓)

| Package | CSV | Chains | Equiv | Dims | Perf | Flags | Family |
|---|---|--:|--:|--:|--:|--:|---|
| PKG-01 | rf_conveyor | 49 | 49 | 40 | 49 | 0 | Conveyor Roller Chains |
| PKG-01b | double_pitch | 14 | 14 | 14 | 14* | 0 | Double Pitch Conveyor Chains |
| PKG-01d | hollow_pin | 12 | 12 | 12 | 0** | 0 | Hollow Pin Chains |
| PKG-01f | leaf_BL_part1 | 25 | 25 | 25 | 25 | 0 | Leaf Chains |
| **Total** | | **100** | **100** | **91** | **88** | **0** | |

\* PKG-01b CSV ships tensile blank by design; **PKG-01c** performance patch (14 records, ANSI B29.1/B29.100 minimum ultimate, standard-nominal) applied as the `import_04_performance_data.json` upsert keyed on `chain_id` — all 14 ids matched 01b exactly.
\*\* PKG-01d hollow-pin tensile intentionally blank (mfr-specific, reduced vs solid pin) — to be filled via cross-supplier normalization.

Output packs: `registry/tsubaki/out/<pkg>/import_{01_normalized_chains,02_manufacturer_equivalents,03_chain_dimensions,04_performance_data,09_review_flags}.json`

## ⚠ BLOCKED: live Base44 staging import cannot run here
The sandbox denies all egress — `app.base44.com` returns `403 host_not_allowed`. The
`Raw_Chain_Imports → stage → commit` pipeline requires Base44 connectivity + app auth,
so the final import step must be run from an environment with network/app access. The
validated packs above are ready to feed straight into it (01_normalized first per package).

## ⚠ DEDUPE: 16 chain_number collisions with existing registry
Per the spec rule (*match on chain_number; on collision keep existing chain_id, richer
data wins per field*), these are **UPDATES to existing chains, not new records.** Importing
the DP-/HP- ids as-is would create parallel duplicates of the same physical chain.

- **PKG-01b (9):** `DP-C2040…DP-C2100` vs existing static `C2040…C2100` (Double Pitch). New Tsubaki rows are catalog-verified with full dims → should supersede the static records (keep existing `chain_id`).
- **PKG-01d (6):** `HP-40HP/50HP/60HP/80HP`, `HP-C2060HP/C2080HP` vs existing `HP-40/50/60/80`, `HP-C2060/C2080`.
- **PKG-01f (1):** `LF-BL1022` vs existing `BL1022`.
- **PKG-01 (0):** all 49 RF conveyor chains net-new. ✅

## Notes carried forward
- **8 inch-series rows** (`TSU-RF430, RF204, RF450, RF650, RF214, RF205, RF6205, RF212`)
  have `needs_review=TRUE` (pitch/dims pending). Per package notes: do **not** mark Active
  in UI browse until pitch is filled (PKG-01b inch-series patch).
- `09_review_flags` empty for all packages — all rows catalog-verified.

## To complete the import
1. From an env with Base44 access, feed each `out/<pkg>/import_01_normalized_chains.json`
   through the staging pipeline first, then 02/03/04 (09 empty).
2. Resolve the 16 collisions as field-merge UPDATES (existing chain_id wins), or confirm
   you want parallel DP-/HP- records instead.
